#coding=utf-8
from rest_framework import serializers
from scanner.models import SqliScanTask
from scanner.tasks import SqlScanTask


class SqliScanTaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = SqliScanTask
        fields = (
            'url',
            'id',
            'task_id',
            'target_url',
            'target_host',
            'target_path',
            'target_param',
            'target_method',
            'scan_time',
            'scan_status',
            'scan_options',
            'scan_log',
            'scan_data',
            'vulnerable',
        )

    def create(self, validated_data):
        """
        如果数据合法就创建并返回一个 SqliScanTask 实例
        """
        sqli = SqliScanTask.objects.create(**validated_data)
        s = SqlScanTask(sqli)
        s.run.delay(s)
        return sqli
