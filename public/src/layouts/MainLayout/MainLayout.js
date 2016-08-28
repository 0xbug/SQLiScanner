/**
 * Created by orange on 16/8/11.
 */
import React, {Component} from 'react';
import Footer from './Footer';
import Routes from '../../routes/index';

class MainLayout extends Component {

    render() {
        return (
            <div className="ant-layout-main">
                <div className="ant-layout-header">

                </div>
                <div className="ant-layout-container">
                    <div className="ant-layout-content">
                        <div style={{height: 800}}>
                            <Routes/>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }
}
export default MainLayout;

