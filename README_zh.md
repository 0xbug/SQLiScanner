SQLiScanner


![GitHub issues](https://img.shields.io/github/issues/0xbug/SQLiScanner.svg)
![GitHub forks](https://img.shields.io/github/forks/0xbug/SQLiScanner.svg)
![GitHub stars](https://img.shields.io/github/stars/0xbug/SQLiScanner.svg)
![Python 3.x](https://img.shields.io/badge/python-3.x-yellow.svg)
![GitHub license](https://img.shields.io/badge/license-GPLv3-blue.svg)


## 简介
> 叕一款基于SQLMAP和Charles的被动SQL 注入漏洞扫描工具

支持 **Har** 文件的扫描(搭配 Charles 使用: Tools=>Auto Save)

## 特性

- 邮箱通知
- 任务统计
- sqlmap 复现命令生成

## 依赖

*   Python 3.x
*   Django 1.9
*   PostgreSQL
*   Celery
*   sqlmap
*   redis

## 支持平台

*   Linux
*   osx

## 截图

![](http://obfxuk8r6.bkt.clouddn.com/sqliscanner-upload.png)
![](http://obfxuk8r6.bkt.clouddn.com/sqliscanner-stat.png)
![](http://obfxuk8r6.bkt.clouddn.com/sqliscanner-allresults.png)
![](http://obfxuk8r6.bkt.clouddn.com/sqliscanner-detail.png)
![](http://obfxuk8r6.bkt.clouddn.com/sqliscanner-vulns.png)

## 安装

克隆项目到本地

```
git clone https://github.com/0xbug/SQLiScanner.git --depth 1

```

配置 sqlmap:

```
git clone https://github.com/sqlmapproject/sqlmap.git --depth 1

```

SQLiScanner 支持 Python version 3.x on Linux and osx.

安装依赖

```
cd SQLiScanner/
virtualenv --python=/usr/local/bin/python3.5 venv
source venv/bin/activate
pip install -r requirements.txt

```

创建数据库（需要配置数据库）

```
python manage.py makemigrations scanner
python manage.py migrate

```

创建 superuser

```
python manage.py createsuperuser

```

## 设置

数据库设置

```
SQLiScanner/settings.py:85

```

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '',
        'USER': '',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

```

邮件通知配置

```
SQLiScanner/settings.py:158

```

```
# Email

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = False
EMAIL_HOST = ''
EMAIL_PORT = 25
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
DEFAULT_FROM_EMAIL = ''

```

```
scanner/tasks.py:14

```

```
class SqlScanTask(object):
    def __init__(self, sqli_obj):
        self.api_url = "http://127.0.0.1:8775"
        self.mail_from = ""
        self.mail_to = [""]

```

## 运行

```
redis-server
python sqlmapapi.py -s -p 8775
python manage.py celery worker --loglevel=info
python manage.py runserver

```
