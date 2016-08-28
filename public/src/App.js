import React, {Component} from 'react';
import MainLayout from './layouts/MainLayout/MainLayout';
import Side from './layouts/MainLayout/Side';
import './App.css';
import 'antd/dist/antd.css';

class App extends Component {
    render() {
        return (
            <div className="ant-layout-aside">
                <Side/>
                <MainLayout/>
            </div>

        );
    }
}


export default App;
