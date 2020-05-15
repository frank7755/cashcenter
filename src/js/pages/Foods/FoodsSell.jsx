import React, { Fragment } from 'react';
import moment from 'moment';
import { formatThousands, debounce } from '~js/utils/utils';
import request from '~js/utils/request';
import styles from '~css/Cash/SellSearch.module.less';
import FormSearch from '~js/components/FormSearch/';
import { Button, Modal, Form, Input, message, DatePicker, Select, Row, Col, Table, AutoComplete, Popconfirm, Icon } from 'antd';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday,
} from '~js/utils/date-fns';
import serveTable from '~js/components/serveTable';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@Form.create()
class ReturnGoods extends React.Component {
  state = {
    visible: false,
    GuideSource: [],
    staff_id: '',
    staff_name: '',
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    const { onChange } = this.props;
    this.props.form.validateFields((error, values) => {
      const { pur_no, proc_id } = this.props;
      if (!error) {
        request('/api/catering/order_management_deltgoods', {
          method: 'post',
          body: {
            id: this.props.id,
            yz_token_info: this.props.yztoken,
            pur_no,
            proc_id,
            ...values,
          },
        }).then((payload) => {
          this.setState({ visible: false });
          message.success('退货成功');
          this.props.form.resetFields();
          onChange && onChange();
        });
      } else {
        message.error('请填写必填项!');
        this.props.form.resetFields();
      }
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible } = this.state;

    return (
      <Fragment>
        <Button disabled={this.props.disabled} onClick={this.showModal}>
          退货
        </Button>
        <Modal title="退货" width={500} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="退货数量">
              {getFieldDecorator('del_num', {
                initialValue: this.props.count,
                rules: [
                  {
                    required: true,
                    message: '请填写退货数量',
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

class GoodsDetails extends React.Component {
  state = {
    visible: false,
    data: [],
  };

  columns = [
    {
      title: '桌位号',
      dataIndex: 'desk_no',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '商品数量',
      dataIndex: 'count',
      align: 'center',
    },
    {
      title: '商品单价',
      dataIndex: 'price',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      },
    },
    {
      title: '实付金额',
      dataIndex: 'newPrice_num',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      },
    },
    {
      title: '操作',
      dataIndex: '退货',
      align: 'center',
      render: (val, record) => (
        <ReturnGoods
          id={this.props.id}
          yztoken={this.props.yztoken}
          count={record.count}
          proc_id={record.proc_id}
          pur_no={this.props.orderNum}
          onChange={this.refreshTable}
          record={record}
          disabled={this.props.disabled}
        ></ReturnGoods>
      ),
    },
  ];
  refreshTable = () => {
    request('/api/catering/order_management_selectdef', {
      method: 'post',
      body: {
        id: this.props.id,
        pur_no: this.props.orderNum,
      },
    }).then((payload) => this.setState({ data: payload.pageData }));
  };

  showModal = () => {
    this.setState({
      visible: true,
    });

    request('/api/catering/order_management_selectdef', {
      method: 'post',
      body: {
        id: this.props.id,
        pur_no: this.props.orderNum,
      },
    }).then((payload) => this.setState({ data: payload.pageData }));
  };

  handleOk = () => {
    this.setState({ visible: false });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { visible, data } = this.state;

    return (
      <Fragment>
        <Button type="edit" onClick={this.showModal}>
          查看详情
        </Button>
        <Modal title="订单详情" width={1200} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Table rowKey="proc_id" columns={this.columns} dataSource={data} pagination={false}></Table>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
class CashFoods extends React.Component {
  state = {
    visible: false,
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
    this.props.form.resetFields();
  };

  handleCash = (e) => {
    const { onChange } = this.props;

    this.props.form.validateFields((error, values) => {
      if (!error) {
        request('/api/catering/order_management_account', {
          method: 'post',
          body: {
            id: this.props.id,
            pur_no: this.props.orderNum,
            ...values,
          },
        })
          .then((payload) => {
            message.success('结账成功!');
            this.setState({
              visible: false,
            });
            onChange && onChange();
            this.props.form.resetFields();
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible } = this.state;

    return (
      <Fragment>
        <Button type="primary" disabled={this.props.disabled} onClick={this.showModal} style={{ marginRight: 10 }}>
          结账
        </Button>
        <Modal
          title="结账"
          width={500}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={
            <Fragment>
              <Button type="ghost" style={{ marginRight: 10 }} onClick={this.handleCancel}>
                取消
              </Button>
              <Popconfirm title="确定结账?" onConfirm={this.handleCash} okText="确定" cancelText="取消">
                <Button type="primary">确定</Button>
              </Popconfirm>
            </Fragment>
          }
        >
          <Form>
            <FormItem label="员工号">{getFieldDecorator('staff_id')(<Input type="text"></Input>)}</FormItem>
            <FormItem label="会员号">{getFieldDecorator('vip_id')(<Input type="text"></Input>)}</FormItem>
            <FormItem label="支付方式">
              {getFieldDecorator('pay_type', {
                rules: [
                  {
                    required: true,
                    message: '请选择支付方式',
                  },
                ],
              })(
                <Select placeholder="请选择支付方式">
                  <Option value={1}>支付宝</Option>
                  <Option value={2}>微信</Option>
                  <Option value={3}>银联</Option>
                  <Option value={4}>其他</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="订单金额">
              {getFieldDecorator('d_sal', {
                initialValue: this.props.record.pur_sal,
                rules: [
                  {
                    required: true,
                    message: '请填写订单金额',
                  },
                ],
              })(<Input type="text" disabled></Input>)}
            </FormItem>
            <FormItem label="实付金额">
              {getFieldDecorator('sal', {
                initialValue: this.props.record.sal,
                rules: [
                  {
                    required: true,
                    message: '请填写实付金额',
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class SearchTable extends React.Component {
  columns = [
    {
      title: '订单号',
      dataIndex: 'pur_no',
    },
    {
      title: '桌位号',
      dataIndex: 'desk_no',
    },
    {
      title: '订单金额',
      dataIndex: 'pur_sal',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      },
    },
    {
      title: '实付金额',
      dataIndex: 'sal',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      render(val) {
        return moment(val).format('YYYY-MM-DD');
      },
    },
    {
      title: '订单类型',
      dataIndex: 'cater_status',
      render(val) {
        return val == 0 ? <span className="textDelete">未支付</span> : <span className="textSuccess">已支付</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      render: (val, record) => {
        return (
          <div className={styles.actionBox}>
            <CashFoods
              id={this.props.id}
              orderNum={record.pur_no}
              yztoken={this.props.yztoken}
              record={record}
              onChange={this.refresh}
              disabled={record.cater_status != 0}
            ></CashFoods>
            <GoodsDetails
              id={this.props.id}
              orderNum={record.pur_no}
              yztoken={this.props.yztoken}
              disabled={record.cater_status != 0}
            ></GoodsDetails>
          </div>
        );
      },
    },
  ];

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

  refresh = () => {
    this.props.table.search();
  };

  render() {
    const { table, ...restProps } = this.props;

    return (
      <Fragment>
        <h2 className="title">
          <span>销售查询</span>
        </h2>
        <FormSearch onSearch={this.handleSearch} className={styles.search}>
          {({ form }) => {
            const { getFieldDecorator } = form;

            return (
              <Fragment>
                <Row gutter={32} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>填写桌号：</label>
                      {getFieldDecorator('desk_no')(<Input placeholder="请输入桌号" style={{ width: 'calc(100% - 80px)' }} />)}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>支付状态：</label>
                      {getFieldDecorator('status', {
                        initialValue: 0,
                      })(
                        <Select style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={0}>未支付</Option>
                          <Option value={1}>已支付</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>选择日期：</label>
                      {getFieldDecorator('dateRange', {
                        initialValue: [moment().subtract(1, 'week'), moment()],
                      })(
                        <RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />
                      )}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <span className={styles.rowItem}>
                      <Button htmlType="submit" type="primary">
                        查询
                      </Button>
                      <Button htmlType="reset">重置</Button>
                    </span>
                  </Col>
                </Row>
              </Fragment>
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
    const { id, yztoken } = this.props;

    return (
      <div className={styles.sellSearch}>
        <SearchTable id={id} yztoken={yztoken} source="/api/catering/order_management_select"></SearchTable>
      </div>
    );
  }
}
