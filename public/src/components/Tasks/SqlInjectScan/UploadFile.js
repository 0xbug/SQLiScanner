/**
 * Created by orange on 16/8/26.
 */
import {Upload, Icon, message} from 'antd';
import React from 'react';

const Dragger = Upload.Dragger;


let UploadFile = React.createClass({
    render() {
        return (
            <div style={{marginTop: 40, height: 580}}>
                <Dragger {...{
                    name: 'file',
                    accept: '.har',
                    action: this.props.action,
                    showUploadList: false,
                    onChange(info) {
                        if (info.file.status !== 'uploading') {
                            console.log(info.file, info.fileList);
                        }
                        if (info.file.response === 'done') {
                            message.success(`${info.file.name} 上传成功。`);
                        } else if (info.file.response === 'error') {
                            message.error(`${info.file.name} 上传失败。`);
                        }
                    },
                }}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                    </p>
                    <p className="ant-upload-text">点击或将文件拖拽到此区域上传</p>
                    <p className="ant-upload-hint">支持上传har格式文件, 搭配 Charles 使用: Tools=>Auto Save</p>
                </Dragger>
            </div>
        )
    },
});

export default UploadFile;