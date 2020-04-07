import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Property/PropertyDetails.module.less';
import FormSearch from '~js/components/FormSearch/';
import moment from 'moment';
import serveTable from '~js/components/serveTable';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday
} from '~js/utils/date-fns';
import { Statistic, Row, Col, Button, Table, DatePicker, Pagination, Popconfirm, message } from 'antd';

const { RangePicker } = DatePicker;

@serveTable()
class DetailsTable extends React.Component {
  state = {
    pay_Withdrawals: '',
    pay_present: '',
    pay_refund: '',
    total_Settlement: ''
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
      本月: getCurrMonth()
    };
  }

  refresh = () => {
    this.props.table.search();
  };

  columns = [
    { title: '商品名称', dataIndex: 'title' },
    { title: '商品订单号', dataIndex: 'oid' },
    {
      title: '实付金额',
      dataIndex: 'payment',
      render: val => {
        return `￥${formatThousands(val)}`;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      render(val) {
        return moment(val).format('YYYY-MM-DD');
      }
    },
    {
      title: '订单状态',
      dataIndex: 'status_str'
    },
    {
      title: '退款金额',
      dataIndex: 'refund_fee',
      render: val => {
        return `￥${formatThousands(val)}`;
      }
    }
  ];

  handleWithdraw = () => {
    const { table } = this.props;

    request('/api/Asset_Management/push_cash', {
      method: 'post',
      body: {
        id: this.props.id
      }
    })
      .then(payload => {
        this.refresh();
        message.success('提现申请成功!');
      })
      .catch(error => message.error(error.message));
  };

  render() {
    const { table, ...restProps } = this.props;

    return (
      <Fragment>
        <h2 className="title">
          <span>资产合计</span>
        </h2>
        <Row gutter={16} className={styles.propetySum}>
          <Col span={6}>
            <Statistic title="待提现余额(元)" value={table.response.pay_present} precision={2} />
            <Popconfirm title="确定要提现吗？" okText="确定" cancelText="取消" onConfirm={this.handleWithdraw}>
              <Button style={{ marginTop: 16 }} type="primary">
                提现
              </Button>
            </Popconfirm>
          </Col>
          <Col span={6}>
            <Statistic title="已提现余额(元)" value={table.response.pay_Withdrawals} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="已退款余额(元)" value={table.response.pay_refund} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="待结算余额(元)" value={table.response.total_Settlement} precision={2} />
          </Col>
        </Row>
        <h2 className="title">
          <span>资产详情</span>
        </h2>
        <div className={styles.details}>
          <FormSearch onSearch={this.handleSearch} className={styles.search}>
            {({ form }) => {
              const { getFieldDecorator } = form;

              return (
                <Row gutter={32} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>选择日期：</label>
                      {getFieldDecorator('dateRange', {
                        initialValue: [moment().subtract(0.5, 'year'), moment()]
                      })(
                        <RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />
                      )}
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
            response={table.response}
            dataSource={table.getDataSource()}
            loading={table.loading && { delay: 150 }}
          ></Table>
        </div>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.propetyDetails}>
        <DetailsTable id={this.props.id} source="/api/Asset_Management/select"></DetailsTable>
      </div>
    );
  }
}
