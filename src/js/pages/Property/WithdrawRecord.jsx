import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Property/WithdrawRecord.module.less';
import moment from 'moment';
import serveTable from '~js/components/serveTable';
import FormSearch from '~js/components/FormSearch/';
import { Table, Row, Col, DatePicker, Button, Modal } from 'antd';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday,
} from '~js/utils/date-fns';

const { RangePicker } = DatePicker;

class WithdrawDetails extends React.Component {
  state = {
    visible: false,
    source: [],
    data: {},
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
    request('/api/Asset_Management/cash_shenqin_list', {
      method: 'post',
      body: {
        ...this.props,
      },
    }).then((payload) => this.setState({ source: payload.pageData, data: payload }));
  };

  handleOk = () => {
    this.setState({ visible: false });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleChange = (pagination) => {
    request('/api/Asset_Management/cash_shenqin_list', {
      method: 'post',
      body: {
        ...this.props,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    }).then((payload) => this.setState({ source: payload.pageData }));
  };

  columns = [
    {
      title: '商品名称',
      dataIndex: 'title',
    },
    {
      title: '商品订单号',
      dataIndex: 'tid',
    },
    {
      title: '订单明细id',
      dataIndex: 'oid',
    },
    {
      title: '提现金额',
      dataIndex: 'payment',
    },
  ];

  render() {
    const { visible, source, data } = this.state;

    return (
      <Fragment>
        <Button onClick={this.showModal}>查看详情</Button>
        <Modal width={1000} visible={visible} title="提现详情" onCancel={this.handleCancel} closable>
          <Table
            rowKey="oid"
            dataSource={source}
            columns={this.columns}
            pagination={{ page: data.page, pageSize: data.pageSize, total: data.total }}
            onChange={(pagination) => this.handleChange(pagination)}
          ></Table>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class ReacrdTable extends React.Component {
  columns = [
    {
      title: '提现单号',
      dataIndex: 'pay_shop',
    },
    {
      title: '提现金额',
      dataIndex: 'pay_price',
      render(val) {
        return <span className="textDelete">￥{formatThousands(val)}</span>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'create_time',
      render(val) {
        return val && moment(val).format('YYYY-MM-DD');
      },
    },
    {
      title: '状态',
      dataIndex: 'status_str',
      render(val) {
        return val == 1 ? <span className="textEdit">银行处理中</span> : <span className="textSuccess">提现成功</span>;
      },
    },
    {
      title: '支付流水号',
      dataIndex: 'pay_list',
    },
    {
      title: '交易费用扣除(单笔订单5毛)',
      dataIndex: 'tid_pay',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      },
    },
    {
      title: '交易手续费(千6)',
      dataIndex: 'transaction_fee',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      },
    },
    {
      title: '实际到账金额',
      dataIndex: 'pay_sal',
      render(val) {
        return <span className="textDelete">￥{formatThousands(val)}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      render: (val, record) => {
        return <WithdrawDetails pay_shop={record.pay_shop} id={this.props.id}></WithdrawDetails>;
      },
    },
  ];

  refresh = () => {
    this.props.table.search();
  };

  handleSearch = ({ dateRange = [], ...rest }) => {
    const [start_time, end_time] = dateRange;

    const { table, id } = this.props;

    table.search({ id, start_time, end_time, ...rest }, { ...table.pagination, current: 1 });
  };

  getDateRanges() {
    return {
      今天: getToday(),
      昨天: getYesterday(),
      本周: getCurrWeek(),
      上周: getLastWeek(),
      本月: getCurrMonth(),
    };
  }

  render() {
    const { table, ...restProps } = this.props;

    return (
      <Fragment>
        <FormSearch className={styles.search} onSearch={this.handleSearch}>
          {({ form }) => {
            const { getFieldDecorator } = form;
            return (
              <Row gutter={32}>
                <Col span={8}>
                  <span className={styles.rowItem}>
                    <label>选择日期：</label>
                    {getFieldDecorator('dateRange', {
                      initialValue: [moment().subtract(3, 'month'), moment()],
                    })(<RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />)}
                  </span>
                </Col>
                <Col span={8}>
                  <span className={styles.rowItem}>
                    <Button htmlType="submit" type="primary">
                      查询
                    </Button>
                    <Button htmlType="reset">重置</Button>
                  </span>
                </Col>
              </Row>
            );
          }}
        </FormSearch>
        <Table
          {...restProps}
          rowKey={table.rowKey}
          columns={this.columns}
          onChange={table.onChange}
          pagination={table.pagination}
          bodyStyle={{ overflowX: 'auto' }}
          dataSource={table.getDataSource()}
          loading={table.loading && { delay: 150 }}
        ></Table>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.withdrawRecord}>
        <h2 className="title">
          <span>提现记录</span>
        </h2>
        <ReacrdTable id={this.props.id} source="/api/Asset_Management/cash_shenqin"></ReacrdTable>
      </div>
    );
  }
}
