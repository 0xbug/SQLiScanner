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

stat_db = redis.Redis(host='localhost', port=6379, db=0)

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
def parse_charles(request):
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

    with open('upload/' + filename, 'r') as harf:
        scan_url = []
        scan_url_path = []
        entries = json.loads(harf.read())['log']['entries']
        for entrie in entries:
            scan_options = {}
            try:
                scan_options['cookie'] = ";".join(
                    "{}={}".format(i['name'], i['value']) for i in entrie['request']['cookies'])
            except:
                pass
            try:
                scan_options['data'] = "&".join(
                    "{}={}".format(i['name'], i['value']) for i in entrie['request']['postData']['params'])
            except:
                pass
            scan_options['url'] = entrie['request']['url']
            scan_options['method'] = entrie['request']['method']
            scan_options['level'] = 1
            target = scan_options['url'].split('/')
            target_path = "/".join(target[3:])
            try:
                target_path = target_path.split('?')[0]
            except:
                pass
            if scan_options['method'] in ['POST', 'GET'] and entrie['request'][
                'url'] not in scan_url and target_path not in scan_url_path:
                try:
                    sqli = SqliScanTask.objects.create(target_url=scan_options['url'], scan_options=scan_options)
                    s = SqlScanTask(sqli)
                    s.run.delay(s)
                except:
                    pass
            scan_url.append(entrie['request']['url'])
            scan_url_path.append(scan_url_path)

@login_required
@csrf_exempt
def taskstat(request):
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
