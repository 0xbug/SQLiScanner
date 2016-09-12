/**
 * Created by orange on 16/8/11.
 */
import React from 'react';
import Routes from '../../routes/index';
import {Menu, Icon} from 'antd';
import 'antd/dist/antd.css';
import './MainLayout.css';

const MainLayout = React.createClass({
    getInitialState() {
        return {
            collapse: true,
        };
    },
    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
        })
    },
    render() {
        const collapse = this.state.collapse;
        return (
            <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>
                <aside className="ant-layout-sider">
                    <div className="ant-layout-logo"></div>
                    <Menu mode="inline" theme="dark" defaultSelectedKeys={['user']}>
                        <Menu.Item key="user">
                        <a href="/api-auth/login/?next=/">
                            <Icon type="user"/><span className="nav-text">认证</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key="scan">
                        <a href="#/tasks/sqli">
                            <Icon type="scan"/><span className="nav-text">扫描器</span>
                            </a>
                        </Menu.Item>
                    </Menu>
                    <div className="ant-aside-action" onClick={this.onCollapseChange}>
                        {collapse ? <Icon type="right"/> : <Icon type="left"/>}
                    </div>
                </aside>
                <div className="ant-layout-main">
                        <div className="ant-layout-content">
                        <div style={{ height: 1800 }}>
                            <Routes/>
                            </div>
                        </div>
                </div>
            </div>
        );
    },
});
export default MainLayout;

