import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Cash/ConfirmTicket.module.less';
import { Form, Input, Icon, Button, Row, Col, message, Table } from 'antd';
import moment from 'moment';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 }
  }
};

@Form.create()
export default class App extends React.Component {
  state = {
    data: []
  };
  columns = [
    {
      title: '电子券号',
      dataIndex: 'ticket_code'
    },
    {
      title: '核验时间',
      dataIndex: 'created',
      render(val) {
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  ];

  componentDidMount() {
    this.fetch();
  }

  fetch = (page, pageSize) => {
    request('/api/ticket_cod_select', {
      method: 'post',
      body: {
        id: this.props.id,
        page: page || 1,
        pageSize: pageSize || 10
      }
    })
      .then(payload => this.setState({ data: payload }))
      .catch(error => message.error(error.message));
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/ticket_code', {
          method: 'post',
          body: {
            id: this.props.id,
            yz_token_info: this.props.yztoken,
            ...value
          }
        })
          .then(payload => message.success('核验成功'))
          .catch(error => {
            message.error(error.message);
            this.props.form.resetFields();
          });
      }
    });
  };

  handleChange = pagination => {
    this.fetch(pagination.current);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { data } = this.state;

    return (
      <div className={styles.confirm}>
        <h2 className="title">
          <span>核验电子券</span>
        </h2>
        <Form {...formItemLayout} className={styles.conformForm} onSubmit={this.handleSubmit}>
          <FormItem label="电子券">
            {getFieldDecorator('ticket_code')(<Input type="text" placeholder="请输入电子券号码" />)}
          </FormItem>
          <Row gutter={16}>
            <Col span={10} offset={6}>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Col>
          </Row>
        </Form>
        <h2 className="title">
          <span>核验记录</span>
        </h2>
        <Table
          columns={this.columns}
          dataSource={data.pageData}
          rowKey="id"
          pagination={{ page: data.page, pageSize: data.pageSize, total: data.total }}
          onChange={pagination => this.handleChange(pagination)}
        ></Table>
      </div>
    );
  }
}
