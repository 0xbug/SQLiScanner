#coding=utf-8
from django.db import models
from django.contrib.postgres.fields import JSONField


class SqliScanTask(models.Model):
    task_id = models.CharField(max_length=200, default='', db_index=True)
    target_url = models.URLField(max_length=5500, default='', unique=True)
    target_host = models.CharField(max_length=500, default='', db_index=True)
    target_path = models.CharField(max_length=1500, default='', db_index=True)
    target_param = models.TextField(default='')
    target_method = models.CharField(max_length=20, default='GET')
    scan_time = models.DateTimeField(auto_now=True)
    scan_status = JSONField(default='')
    scan_options = JSONField(default='')
    scan_log = JSONField(default='')
    scan_data = JSONField(default='')
    vulnerable = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-vulnerable', 'target_host']
