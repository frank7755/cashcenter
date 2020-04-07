import React, { Fragment } from 'react';
import { store } from '~js/utils/utils';
import { history } from '~js/utils/utils';
import request from '~js/utils/request';
import { message, Layout, Menu, Icon, Dropdown, Avatar, Modal, Form, Input, Button, Switch, Table } from 'antd';
import styles from '~css/Shop/BindBank.module.less';
import FormItem from 'antd/lib/form/FormItem';
import moment from 'moment';

@Form.create()
export default class App extends React.Component {
  state = {
    checked: false,
    data: []
  };

  columns = [
    {
      title: '身份证号',
      dataIndex: 'idcard'
    },
    {
      title: '姓名',
      dataIndex: 'name'
    },
    {
      title: '银行卡号',
      dataIndex: 'acc_no'
    },
    {
      title: '手机号',
      dataIndex: 'mobile'
    },
    {
      title: '是否默认',
      dataIndex: 'is_status',
      render(val) {
        return val == 1 && <span className="textSuccess">默认银行卡</span>;
      }
    },
    {
      title: '创建日期',
      dataIndex: 'created',
      render(val) {
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  ];

  componentDidMount() {
    request('/api/login/bank_select', {
      method: 'post',
      body: {
        id: this.props.id
      }
    })
      .then(payload => this.setState({ data: payload.pageData }))
      .catch(error => message.error(error.message));
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/login/bank_check', {
          method: 'post',
          body: {
            id: this.props.id,
            is_status: this.state.checked ? 1 : 0,
            ...value
          }
        })
          .then(payload => {
            message.success('绑定成功');
            this.props.form.resetFields();
          })
          .catch(error => message.error(error.message));
      }
    });
  };

  handleChange = () => {
    this.setState({ checked: !this.state.checked });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { data } = this.state;

    return (
      <div className={styles.bindBank}>
        <h2 className="title">
          <span>绑定银行卡</span>
        </h2>
        <Form onSubmit={this.handleSubmit} className={styles.userInfo}>
          <FormItem label="姓名">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入姓名' }]
            })(<Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入姓名" />)}
          </FormItem>
          <FormItem label="预留电话">
            {getFieldDecorator('mobile', {
              rules: [
                {
                  required: true,
                  message: '银行卡预留电话号码'
                },
                {
                  pattern: /^1[3456789]\d{9}$/,
                  message: '请输入正确的手机号'
                }
              ]
            })(
              <Input
                maxLength={11}
                prefix={<Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="银行卡预留电话号码"
              />
            )}
          </FormItem>
          <FormItem label="银行卡号">
            {getFieldDecorator('acc_no', {
              rules: [{ required: true, message: '请输入银行卡号' }]
            })(<Input prefix={<Icon type="bank" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入银行卡号" />)}
          </FormItem>
          <FormItem label="身份证号">
            {getFieldDecorator('idcard', {
              rules: [{ required: true, message: '请输入身份证号码' }]
            })(<Input prefix={<Icon type="idcard" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入身份证号码" />)}
          </FormItem>
          <FormItem label="是否设为默认银行卡">
            <Switch onChange={this.handleChange} checked={this.state.checked}></Switch>
          </FormItem>
          <FormItem label="">
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </FormItem>
        </Form>
        <h2 className="title">
          <span>银行卡信息</span>
        </h2>
        <Table rowKey='idcard' dataSource={data} columns={this.columns} pagination={false}></Table>
      </div>
    );
  }
}
