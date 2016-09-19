#coding=utf-8
from django.core.mail import send_mail
from celery import task, platforms
import json
from requests import *
import logging

platforms.C_FORCE_ROOT = True


class SqlScanTask(object):
    def __init__(self, sqli_obj):
        self.api_url = "http://127.0.0.1:8775"
        self.mail_from = ""
        self.mail_to = [""]
        self.sqli_obj = sqli_obj
        self.scan_options = self.sqli_obj.scan_options
        self.target_detail()
        self.sqli_obj.target_method = self.sqli_obj.scan_options['method']
        self.sqli_obj.target_url = self.sqli_obj.scan_options['url']
        self.target_url = json.dumps({'url': self.sqli_obj.scan_options['url']})
        self.headers = {'Content-Type': 'application/json'}
        self.sqli_obj.save()

    @task()
    def start(self):
        self.task_id = json.loads(get('{}/task/new'.format(self.api_url)).text)['taskid']
        self.sqli_obj.task_id = self.task_id
        logging.info(json.dumps(self.scan_options))
        res = json.loads(post('{}/option/{}/set'.format(self.api_url, self.task_id), data=json.dumps(self.scan_options),
                              headers=self.headers).text)
        if res['success']:
            post('{}/scan/{}/start'.format(self.api_url, self.task_id), data=self.target_url,
                 headers=self.headers)
            self.update.apply_async((self,), countdown=10)
        else:
            self.delete.delay(self)

    @task()
    def delete(self):
        get('{}/task/{}/delete'.format(self.api_url, self.task_id))
        self.sqli_obj.delete()

    @task()
    def update(self):
        self.sqli_obj.scan_status = json.loads(get('{}/scan/{}/status'.format(self.api_url, self.task_id)).text)[
            'status']
        try:
            self.sqli_obj.scan_log = json.loads(get('{}/scan/{}/log'.format(self.api_url, self.task_id)).text)['log'][
                -1]
            self.sqli_obj.scan_data = json.loads(get('{}/scan/{}/data'.format(self.api_url, self.task_id)).text)['data']
        except:
            pass
        if self.sqli_obj.scan_status != 'terminated':
            self.update.apply_async((self,), countdown=60)
        else:
            get('{}/task/{}/delete'.format(self.api_url, self.task_id))
            self.sqli_obj.vulnerable = bool(self.sqli_obj.scan_data)
            if self.sqli_obj.vulnerable:
                send_mail('发现注入',
                          "Url:\t{}\n注入点:\t{}".format(self.sqli_obj.target_url,
                                                      self.sqli_obj.scan_data[0]['value'][0]['parameter']),
                          self.mail_from,
                          self.mail_to, fail_silently=False)
        self.sqli_obj.save()

    @task()
    def balance(self):
        # self.api_url = SqlMapApi.objects.filter()[0].api_url
        self.tasks_num = json.loads(get('{}/admin/l/list'.format(self.api_url)).text)['tasks_num']
        self.start.delay(self)

    def target_detail(self):
        target = self.scan_options['url'].split('/')
        self.sqli_obj.target_host = target[2]
        self.sqli_obj.target_path = "/".join(target[3:])
        try:
            self.sqli_obj.target_param = self.sqli_obj.target_path.split('?')[1]
            self.sqli_obj.target_path = self.sqli_obj.target_path.split('?')[0]
        except:
            self.sqli_obj.target_param = ''

    @task()
    def run(self, ):
        self.balance.delay(self)
