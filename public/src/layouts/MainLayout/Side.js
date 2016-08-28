/**
 * Created by orange on 16/8/2.
 */
import React, {Component} from 'react';
import {Affix, Menu, Icon} from 'antd';
import './Side.css';

const SubMenu = Menu.SubMenu;


class Side extends Component {
    render() {
        return (

            <aside className="ant-layout-sider" style={{ width: 200 }}>
                <div className="ant-layout-logo">
                </div>
                <Affix>
                    <Menu mode="inline" theme="dark">

                        <SubMenu key="task" title={<span><Icon type="scan"/>扫描任务</span>}>
                            <Menu.Item key="1"><a href="#/tasks/sqli">SQLi</a></Menu.Item>
                        </SubMenu>
                        <SubMenu key="account" title={<span><Icon type="user"/>登录</span>}>
                            <Menu.Item key="1"><a href="/api-auth/login/?next=/">认证</a></Menu.Item>
                        </SubMenu>

                    </Menu>
                </Affix>
            </aside>

        );
    }
}
export default Side;
