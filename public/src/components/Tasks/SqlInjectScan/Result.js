import reqwest from 'reqwest';
import React from 'react';
import {Tag, Affix, Table, message, notification, Button} from 'antd';
import copy from 'copy-to-clipboard';

const openNotification = function (target, poc) {
    const key = target.task_id;
    const btnClick = function () {
        //复制 Poc
        copy(poc);
        // 隐藏提醒框
        notification.close(key);
    };
    const btn = (
        <Button type="primary" size="small" onClick={btnClick} icon="copy">
            sqlmap 命令
        </Button>
    );
    notification.open({
        message: '发现注入',
        description: `链接: ${target.target_url},
                        注入点:${target.scan_data[0].value[0].parameter}`,
        btn,
        key,
        duration: 0,
        onClose: close,
    });
};


const columns = [
    {
        title: '时间',
        dataIndex: 'scan_time',
        width: 100,
        fixed: 'left',
    },
    {
        title: 'Host',
        dataIndex: 'target_host',
        fixed: 'left',
        width: 150
    },
    {
        title: '结果',
        dataIndex: 'vulnerable',
        width: 70,
        fixed: 'left',
        render: vulnerable=>(vulnerable ? <Tag color="red">严重</Tag> : '安全')
    },

    {
        title: '路径',
        dataIndex: 'target_path',
        width: 300,
        // fixed:'left'
    },
    {
        title: '日志',
        dataIndex: 'scan_log',
        width: 480,
        render: log => `${log.message}`
    },
    {
        title: '状态',
        dataIndex: 'scan_status',
        width: 100,
        render: scan_status=>(scan_status === 'terminated' ? '完成' : <Tag color="green">扫描中</Tag>)
    },
];


const Result = React.createClass({
    getInitialState() {
        return {
            data: [],
            pagination: {},
            loading: false,
        };
    },

    handleTableChange(pagination, filters) {
        const pager = this.state.pagination;
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });
        this.fetch({
            page: pagination.current,
            ...filters,
        });
    },
    fetch(params = {}) {
        this.setState({loading: true});
        reqwest({
            url: this.props.apiurl,
            method: 'get',
            data: {
                page: 1,
                ...params,
            },
            type: 'json',
        }).then(data => {
            const pagination = this.state.pagination;
            pagination.total = data.count;
            message.success(`成功加载${data.count}条数据`);

            this.setState({
                loading: false,
                data: data.results,
                count: data.count,
                pagination,
            });

            this.state.data.forEach(function (target) {
                if (target.vulnerable) {
                    const poc = `sqlmap -u "${target.scan_options.url}" --data="${target.scan_options.data}" --dbms=${target.scan_data[0].value[0].dbms} --method=${target.scan_options.method} --cookie="${target.scan_options.cookie}"`;
                    openNotification(target, poc)
                }
            });

        });
    },
    componentDidMount() {
        this.fetch();
    },
    render() {
        return (
            <Affix>
                <Table columns={columns}
                       rowKey='id'
                       dataSource={this.state.data}
                       pagination={this.state.pagination}
                       loading={this.state.loading}
                       onChange={this.handleTableChange}
                       scroll={{x: 1300, y: 400}}
                       title={() => `共${this.state.pagination.total}条记录`}
                       footer={() => `共${this.state.pagination.total}条记录`}
                />
            </Affix>
        );
    },
});


export default Result;