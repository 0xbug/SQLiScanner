import reqwest from 'reqwest';
import React from 'react';
import {Affix, Table, message, notification} from 'antd';


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
        width: 50,
        fixed: 'left',
        render: status => `${status}`
    },

    {
        title: 'Path',
        dataIndex: 'target_path',
        width: 300,
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
        render: status => `${status}`
    }
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
            // Read total count from server
            pagination.total = data.count;
            message.success(`成功加载${data.count}条数据`);

            this.setState({
                loading: false,
                data: data.results,
                pagination,
            });
            this.state.data.forEach(function (target) {
                if (target.vulnerable) {
                    notification['error']({
                        message: '发现注入',
                        description: `${target.target_url}存在注入,注入点${target.scan_data[0].value[0].parameter}`,
                        duration: 0,
                        key: target.taskid,
                    });
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
                       scroll={{x: 1080, y: 400}}
                       title={() => `共${this.state.pagination.total}条记录`}
                       footer={() => `共${this.state.pagination.total}条记录`}
                />
            </Affix>
        );
    },
});


export default Result;