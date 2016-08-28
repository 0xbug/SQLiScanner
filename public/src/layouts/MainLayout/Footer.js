/**
 * Created by orange on 16/8/11.
 */
import React, {Component} from 'react';

const copyRight = 'U2SRC 版权所有 © 2016 由优信二手车运维部orange支持';

class Footer extends Component {

    render() {
        return (
            <div className="ant-layout-footer">
                {copyRight}
            </div>
        );
    }
}
export default Footer;

