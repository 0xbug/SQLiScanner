import React, {Component} from 'react';
import {Tabs} from 'antd';
import UploadFile from './UploadFile';
import Result from './Result';
import Chart from './Chart';
import {UploadHarFile, ScanSQLi, VulnsScanSQLi, TasksStat} from '../../../AppConfig';

const TabPane = Tabs.TabPane;

class SQLiScan extends Component {
    render() {
        return (
            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="统计" key="1">
                    <Chart apiurl={TasksStat}/>
                </TabPane>
                <TabPane tab="添加" key="2">
                    <UploadFile action={UploadHarFile}/>
                </TabPane>
                <TabPane tab="概览" key="3">
                    <Result apiurl={ScanSQLi}/>
                </TabPane>
                <TabPane tab="命中" key="4">
                    <Result apiurl={VulnsScanSQLi}/>
                </TabPane>
            </Tabs>
        );
    }
}

export default SQLiScan;