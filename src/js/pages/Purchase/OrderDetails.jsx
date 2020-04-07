import React, { Fragment } from 'react';
import request from '~js/utils/request';
import moment from 'moment';
import styles from '~css/Purchase/OrderDetails.module.less';
import {
  Input,
  Popconfirm,
  Col,
  Row,
  Button,
  Select,
  DatePicker,
  Table,
  Tag,
  InputNumber,
  Form,
  Drawer,
  message,
  Icon
} from 'antd';

export default class App extends React.Component {
  state = {
    basic: null,
    goods: [],
    logs: []
  };

  goodsColumns = [
    {
      title: '商品名称',
      dataIndex: 'name'
    },
    {
      title: '库存量',
      dataIndex: 'inventory_quantity'
    },
    {
      title: '销售价格',
      dataIndex: 'seling_price'
    },
    {
      title: '商品分类',
      dataIndex: 'type_id'
    },
    {
      title: '商品单位',
      dataIndex: 'unit'
    },
    {
      title: '商品品类',
      dataIndex: 'unit_pinlei'
    }
  ];

  logsColumns = [
    {
      title: '操作类型',
      dataIndex: 'Operation_type'
    },
    {
      title: '操作人',
      dataIndex: 'user_name'
    },
    {
      title: '操作时间',
      dataIndex: 'create_time',
      render(time) {
        return moment(time).format('YYYY-MM-DD');
      }
    }
  ];

  componentDidMount() {
    request('/api/select_purchase_pro1', {
      method: 'post',
      body: {
        id: this.props.id,
        code_id: this.props.match.params.id
      }
    })
      .then(payload => this.setState({ basic: payload.pageData }))
      .catch(error => message.error(error.message));

    request('/api/select_purchase_pro2', {
      method: 'post',
      body: {
        id: this.props.id,
        code_id: this.props.match.params.id,
        page: 1,
        pageSize: 10
      }
    })
      .then(payload => this.setState({ goods: payload.pageData }))
      .catch(error => message.error(error.message));

    request('/api/select_purchase_pro3', {
      method: 'post',
      body: {
        id: this.props.id,
        code_id: this.props.match.params.id,
        page: 1,
        pageSize: 10
      }
    })
      .then(payload => this.setState({ logs: payload.pageData }))
      .catch(error => message.error(error.message));
  }

  handleConfirm = () => {
    const { basic } = this.state;

    request('/api/update_purchase', {
      method: 'post',
      body: {
        id: this.props.id,
        code_id: this.props.match.params.id,
        user_name: this.props.user_name,
        price_status: basic.price_status,
        purchase_price: basic.purchase_price,
        status: 1
      }
    }).then(payload => {
      message.success('货单已作废');
      history.back();
    });
  };

  render() {
    const { basic, goods, logs } = this.state;
    return (
      <div className={styles.orderDetails}>
        <div className={styles.topAciont}>
          <Popconfirm title="确定要作废货单吗?" onConfirm={this.handleConfirm} okText="确认" cancelText="取消">
            <Button>作废</Button>
          </Popconfirm>
          <Button>导出</Button>
        </div>
        <div className={styles.basicInfo}>
          <h2 className="title">
            <span>基本信息</span>
            <div onClick={() => history.back()} style={{ cursor: 'pointer' }}>
              <Icon type="left" style={{ color: '#006acc' }} />
              <span style={{ color: '#006acc', marginLeft: 10 }}>单号：{this.props.match.params.id}</span>
            </div>
          </h2>
          <ul>
            <li>供应商：{basic && basic.suppiler_name}</li>
            <li>进货单号：{basic && basic.purchase_no}</li>
            <li>
              进货日期：
              {basic && moment(basic.purchase_date).format('YYYY-MM-DD')}
            </li>
            <li>付款金额：{basic && basic.purchase_price}</li>
            <li>备注：{basic && basic.remarks}</li>
          </ul>
        </div>
        <div className={styles.goodsInfo}>
          <h2 className="title">
            <span>商品</span>
          </h2>
          <Table dataSource={goods} columns={this.goodsColumns} rowKey="id"></Table>
        </div>
        <div className={styles.actionLog}>
          <h2 className="title">
            <span>操作日志</span>
          </h2>
          <Table dataSource={logs} columns={this.logsColumns} rowKey="id"></Table>
        </div>
      </div>
    );
  }
}
