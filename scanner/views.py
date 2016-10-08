#coding=utf-8
from scanner.serializers import SqliScanTaskSerializer
from scanner.models import SqliScanTask
from rest_framework import viewsets, filters
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from scanner.tasks import SqlScanTask
import redis
import os
import json
import re

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

@method_decorator(login_required, name='dispatch')
class SqliScanTaskViewSet(viewsets.ModelViewSet):
    """
    查看所有 SQLi 扫描任务
    """
    queryset = SqliScanTask.objects.all()
    serializer_class = SqliScanTaskSerializer
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('vulnerable', 'target_host')


@login_required
@csrf_exempt
def addtaskbyhar(request):
    if request.method == 'POST' and str(request.FILES['file']).split('.')[-1] == 'har':
        handle_uploaded_file(request.FILES['file'], str(request.FILES['file']))
        return HttpResponse("done")

    return HttpResponse("error")


def handle_uploaded_file(file, filename):
    if not os.path.exists('upload/'):
        os.mkdir('upload/')
    with open('upload/' + filename, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    parse_uploaded_file(filename)


def parse_uploaded_file(filename):
    """
    解析 har 文件中的请求，并按照 url 类型处理后提交给任务节点进行扫描
    parse uploaded file and scan the target in file
    """
    with open('upload/' + filename, 'r') as harf:
        scan_url = []
        scan_url_path = []
        entries = json.loads(harf.read())['log']['entries']
        for entrie in entries:
            status_code = entrie['response']['status']
            scan_options = {}
            scan_options['level'] = 1
            scan_options['url'] = entrie['request']['url']
            scan_options['method'] = entrie['request']['method']
            target = scan_options['url'].split('/')
            target_path = "/".join(target[3:])
            try:
                target_path = target_path.split('?')[0]
            except:
                pass
            if status_code != 404 and scan_options['method'] in ['POST', 'GET'] and entrie['request'][
                'url'] not in scan_url and target_path not in scan_url_path:
                if 'https' in scan_options['url']:
                    scan_options['forceSSL'] = True
                if entrie['request']['cookies']:
                    scan_options['cookie'] = ";".join(
                        "{}={}".format(i['name'], i['value']) for i in entrie['request']['cookies'])
                if entrie['request']['headers']:
                    scan_options['headers'] = ";".join(
                        "'{}':'{}'".format(i['name'], i['value']) for i in entrie['request']['headers'])
                    for i in entrie['request']['headers']:
                        if i['name'] == 'Referer':
                            scan_options['referer'] = i['value']
                if scan_options['method'] == 'GET':
                    scan_options = handle_get_request_entrie(entrie, scan_options)
                else:
                    scan_options = handle_post_request_entrie(entrie, scan_options)
                try:
                    sqli = SqliScanTask.objects.create(target_url=scan_options['url'], scan_options=scan_options)
                    s = SqlScanTask(sqli)
                    s.run.delay(s)
                    scan_url.append(entrie['request']['url'])
                    scan_url_path.append(scan_url_path)
                except:
                    pass


def handle_get_request_entrie(entrie, scan_options):
    if not entrie['request']['queryString']:
        nodes = scan_options['url'].split('/')
        for node in nodes:
            if '.' not in node and re.findall('(\d+)', node):
                scan_options['url'] = scan_options['url'].replace(node, node + '*')
            elif '.html' in node and re.findall('(\d+)', node):
                scan_options['url'] = scan_options['url'].replace(node, node.replace('.', '*.'))
    else:
        pass
    return scan_options


def handle_post_request_entrie(entrie, scan_options):
    try:
        scan_options['data'] = "&".join(
            "{}={}".format(i['name'], i['value']) for i in entrie['request']['postData']['params'])
    except:
        pass
    return scan_options


@login_required
@csrf_exempt
def taskstat(request):
    stat_db = redis.Redis(host='localhost', port=6379, db=0)
    if not stat_db.exists('tasks'):
        hosts = []
        for target in SqliScanTask.objects.all():
            s = {'name': target.target_host, 'value': len(SqliScanTask.objects.filter(target_host=target.target_host))}
            if s not in hosts:
                hosts.append(s)
            else:
                pass
        stat_db.set('tasks', json.dumps(hosts), ex=500)
    else:
        pass
    data = stat_db.get('tasks')
    return HttpResponse(data)


def index(request):
    return render_to_response('index.html')
