import reqwest from 'reqwest';
import React from 'react';
import TimeAgo from 'timeago-react';
import {Modal, Icon, Tag, Affix, Table, message, notification, Button} from 'antd';
import copy from 'copy-to-clipboard';

const ButtonGroup = Button.Group;

const vulNotification = (target) => {
    const poc = `sqlmap -u "${target.scan_options.url}" --data="${target.scan_options.data}" --dbms=${target.scan_data[0].value[0].dbms} --method=${target.scan_options.method} --cookie="${target.scan_options.cookie}"`;

    const key = target.task_id;
    const btnClick = () => {
        copy(poc);
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
        duration: 2,
    });
};

const viewDetail = (target) => {
    Modal.info({
        title: target.target_host,
        okText: "关闭",
        content: (
            <div>
                <p>目标: {target.target_url}</p>
                <p>请求方式: {target.target_method}</p>
                <p>Referer: {target.scan_options['referer']}</p>
                <p>请求参数: {target.target_param}</p>
                <p>路径：{target.target_path}</p>
                {target.vulnerable ? <p>注入点：{target.scan_data[0].value[0].parameter}</p> : ''}
            </div>
        ),
        onOk() {
        },
    });
};
const delTask = (target) => {
    reqwest({
        url: target.url
        , method: 'delete'
        , success: function () {
            message.success("删除成功");
        }
    })
};

const columns = [
    {
        title: '时间',
        dataIndex: 'scan_time',
        width: 100,
        fixed: 'left',
        render: time => <TimeAgo date={time} locale='zh_CN'/>
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
        width: 100,
        fixed: 'left',
        render: vulnerable => (vulnerable ? <Tag color="red">严重</Tag> : '安全')
    },
    {
        title: '状态',
        dataIndex: 'scan_status',
        width: 100,
        fixed: 'left',
        render: scan_status => (scan_status === 'terminated' ? '完成' : <Tag color="green">扫描中</Tag>)
    },

    {
        title: '路径',
        dataIndex: 'target_path',
        width: 200,
    },
    {
        title: '日志',
        dataIndex: 'scan_log',
        width: 500,
        render: log => `${log.message}`
    },

    {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 150,

        render: (target) => (
            <span>
                <ButtonGroup>
                    <Button type="dashed" onClick={(e) => viewDetail(target) }><Icon type="info-circle-o"/></Button>
                    <Button type="dashed" onClick={(e) => delTask(target) }>
                        <Icon type="cross-circle-o"/>      </Button>
                    {target.vulnerable ? <Button type="dashed" onClick={(e) => vulNotification(target) }>
                        <Icon type="copy"/>
                    </Button> : ''}
                </ButtonGroup>
            </span>
        ),
    }
];


const Result = React.createClass({
    getInitialState() {
        return {
            data: [],
            pagination: {},
            loading: false,
            url: this.props.apiurl
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
    this.setState({ loading: true });
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
    // this.state.data.forEach(function (target) {
    //     if (target.vulnerable) {
    //         vulNotification(target)
    //     }
    // });

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
                scroll={{ x: 1300, y: 500 }}
                title={() => `共${this.state.pagination.total}条记录`}
                footer={() => `共${this.state.pagination.total}条记录`}
                />
        </Affix>
    );
},
});


export default Result;
