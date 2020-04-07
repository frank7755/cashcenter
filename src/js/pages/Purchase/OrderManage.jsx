import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands } from '~js/utils/utils';
import moment from 'moment';
import styles from '~css/Purchase/OrderManage.module.less';
import FormSearch from '~js/components/FormSearch/';
import FormDrawer from '~js/components/FormDrawer/';
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
import { Input, Popconfirm, Col, Row, Button, Select, DatePicker, Table, Tag, InputNumber, Form, Drawer, message } from 'antd';
const { Item: FormItem } = Form;

const InputGroup = Input.Group;
const { RangePicker } = DatePicker;
const { Option } = Select;

@Form.create()
class GoodsDrawer extends React.PureComponent {
  state = {
    visible: false
  };

  static expando = 0;

  showDrawer = () => {
    this.setState({ visible: true });
  };

  closeDrawer = () => {
    this.setState({ visible: false });
  };

  handleSubmit = e => {
    e.stopPropagation();

    const { data, form, onChange } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        const key = data ? data.key : GoodsDrawer.expando;

        !data && GoodsDrawer.expando++;

        this.setState({ visible: false });

        onChange && onChange({ ...values, key });
        form.resetFields();
      }
    });
  };

  render() {
    const { type, data } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button type="primary" onClick={this.showDrawer}>
            新增
          </Button>
        ) : (
          <a style={{ color: '#006acc', margin: '0 10px' }} onClick={this.showDrawer}>
            编辑
          </a>
        )}
        <Drawer
          width={800}
          title={type == 'add' ? '新增商品' : '编辑商品'}
          closable={false}
          onClose={this.closeDrawer}
          visible={this.state.visible}
        >
          <Form onSubmit={this.handleSubmit} className={`${styles.goodsOperate} fn-clear`}>
            <section>
              <FormItem label="商品名称">
                {getFieldDecorator('name', {
                  initialValue: data && data.name,
                  rules: [{ required: true, message: '请输入商品名称' }]
                })(<Input placeholder="请输入商品名称" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="库存量">
                {getFieldDecorator('inventory_quantity', {
                  initialValue: data && data.inventory_quantity,
                  rules: [{ required: true, message: '请输入库存量' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入库存量',
                  getValueFromEvent: event => {
                    return event.target.value.replace(/\D/g, '');
                  }
                })(<Input placeholder="请输入库存量" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="销售价格">
                {getFieldDecorator('seling_price', {
                  initialValue: data && data.seling_price,
                  rules: [{ required: true, message: '请输入销售价格' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入销售价格',
                  getValueFromEvent: event => {
                    return event.target.value.replace(/\D/g, '');
                  }
                })(<Input placeholder="请输入销售价格" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="库存下线">
                {getFieldDecorator('min_num', {
                  initialValue: data && data.min_num,
                  rules: [{ required: true, message: '请输入库存下线' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入库存下线',
                  getValueFromEvent: event => {
                    return event.target.value.replace(/\D/g, '');
                  }
                })(<Input placeholder="请输入库存下线" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品单位">
                {getFieldDecorator('unit', {
                  initialValue: data && data.unit,
                  rules: [{ required: true, message: '请输入商品单位' }]
                })(<Input placeholder="请输入商品单位" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="货单编号">
                {getFieldDecorator('code_id', {
                  initialValue: data && data.code_id,
                  rules: [{ required: true, message: '请输入货单编号' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入货单编号',
                  getValueFromEvent: event => {
                    return event.target.value.replace(/\D/g, '');
                  }
                })(<Input placeholder="请输入货单编号" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="供应商条码">
                {getFieldDecorator('s_code', {
                  initialValue: data && data.s_code
                })(<Input placeholder="请输入供应商条码" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="自定义条码">
                {getFieldDecorator('u_code', {
                  initialValue: data && data.u_code
                })(<Input placeholder="请输入自定义条码" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品链接">
                {getFieldDecorator('s_link', {
                  initialValue: data && data.s_link
                })(<Input placeholder="请输入商品链接" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品图片">
                {getFieldDecorator('s_photo', {
                  initialValue: data && data.s_photo
                })(<Input placeholder="请输入图片地址" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品分类">
                {getFieldDecorator('type_id', {
                  initialValue: data && data.type_id
                })(<Input placeholder="请输入商品分类" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品品类">
                {getFieldDecorator('unit_pinlei', {
                  initialValue: data && data.unit_pinlei
                })(<Input placeholder="请输入商品品类" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="阈值提醒">
                {getFieldDecorator('threshold_remind', {
                  initialValue: data && data.threshold_remind
                })(<Input placeholder="请输入阈值" />)}
              </FormItem>
            </section>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px'
              }}
            >
              <Button
                style={{
                  marginRight: 8
                }}
                onClick={this.closeDrawer}
              >
                取消
              </Button>
              <Button htmlType="submit" type="primary">
                确定
              </Button>
            </div>
          </Form>
        </Drawer>
      </Fragment>
    );
  }
}

class GoodsTable extends React.Component {
  state = {
    extra: false,
    visible: false,
    selectedRowKeys: []
  };

  rowSelection = {
    onChange: selectedRowKeys => {
      this.setState({ selectedRowKeys });
    }
  };

  resetSelectedRowKeys = () => {
    this.setState({ selectedRowKeys: [] });
  };

  handleDelete = key => {
    const { onDelete } = this.props;

    onDelete && onDelete(key);
  };

  columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      width: 250
    },
    {
      title: '库存量',
      dataIndex: 'inventory_quantity',
      width: 150
    },
    {
      title: '销售价格',
      dataIndex: 'seling_price',
      width: 150
    },
    {
      title: '库存下线',
      dataIndex: 'min_num',
      width: 150
    },
    {
      title: '商品单位',
      dataIndex: 'unit',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      render: (action, record) => {
        return (
          <Fragment>
            <GoodsDrawer data={record}></GoodsDrawer>
            <Popconfirm title="确定删除商品吗?" onConfirm={() => this.confirm(record.key)} okText="确定" cancelText="取消">
              <a style={{ color: '#fc5050', margin: '0 10px' }}>删除</a>
            </Popconfirm>
          </Fragment>
        );
      }
    }
  ];

  confirm = key => {
    this.handleDelete(key);
  };

  expandedRowRender = record => (
    <div>
      <p>货单编号：{record.code_id || '无'}</p>
      <p>供应商条码：{record.s_code || '无'}</p>
      <p>商品链接：{record.s_link || '无'}</p>
      <p>商品图片：{record.s_photo || '无'}</p>
      <p>商品分类：{record.type_id || '无'}</p>
      <p>商品品类：{record.unit_pinlei || '无'}</p>
      <p>阀值提醒：{record.threshold_remind || '无'}</p>
    </div>
  );

  render() {
    return (
      <Fragment>
        <Table
          expandedRowRender={this.expandedRowRender}
          rowSelection={this.rowSelection}
          columns={this.columns}
          dataSource={this.props.dataSource}
        />
      </Fragment>
    );
  }
}

@serveTable()
class OrderTable extends React.Component {
  state = {
    extra: false,
    selectedRowKeys: []
  };

  rowSelection = {
    onChange: selectedRowKeys => {
      this.setState({ selectedRowKeys });
    }
  };

  resetSelectedRowKeys = () => {
    this.setState({ selectedRowKeys: [] });
  };

  columns = [
    {
      title: '进货单号',
      dataIndex: 'code_id',
      width: 200,
      render(orderID) {
        return <a href={`#/ordermanage/${orderID}`}>{orderID}</a>;
      }
    },
    {
      title: '进货日期',
      dataIndex: 'purchase_date',
      width: 200,
      render(purchase_date) {
        return moment(purchase_date).format('YYYY-MM-DD');
      }
    },
    {
      title: '供应商',
      dataIndex: 'suppiler_name',
      width: 250
    },
    {
      title: '制单人',
      dataIndex: 'user_name',
      width: 200
    },
    {
      title: '进货金额',
      dataIndex: 'purchase_price',
      width: 250,
      render(purchase_price) {
        return `￥ ${formatThousands(purchase_price)}`;
      }
    },
    {
      title: '货单状态',
      dataIndex: 'status',
      width: 150,
      render(status) {
        return status == 1 ? <Tag color="orange">已作废</Tag> : <Tag color="green">正常</Tag>;
      }
    },
    {
      title: '付款状态',
      dataIndex: 'price_status',
      width: 150,
      render(price_status) {
        return price_status == 0 ? <Tag color="green">已付款</Tag> : <Tag color="red">未付款</Tag>;
      }
    }
  ];

  getDateRanges() {
    return {
      今天: getToday(),
      昨天: getYesterday(),
      本周: getCurrWeek(),
      上周: getLastWeek(),
      本月: getCurrMonth()
    };
  }

  handleSearch = ({ dateRange = [], ...rest }) => {
    const { table } = this.props;
    const [start_date, end_date] = dateRange;

    table.search({ ...rest, start_date, end_date }, { ...table.pagination, current: 1 });
  };

  refresh = () => {
    this.props.table.fetch();
  };

  render() {
    const { table, supply, ...restProps } = this.props;

    return (
      <Fragment>
        <AddOrder
          supply={supply}
          id={this.props.id}
          onSubmit={() => {
            table.search();
          }}
          user_name={this.props.user_name}
        ></AddOrder>
        <FormSearch onSearch={this.handleSearch}>
          {({ form }) => {
            const { getFieldDecorator } = form;
            return (
              <Fragment>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>进货单号：</label>
                      {getFieldDecorator('code_id')(
                        <Input placeholder="请输入订单号" style={{ width: 'calc(100% - 80px)' }} />
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>选择日期：</label>
                      {getFieldDecorator('dateRange', {
                        initialValue: getLast7Days()
                      })(
                        <RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>货单状态：</label>
                      {getFieldDecorator('status', { initialValue: 0 })(
                        <Select style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={0}>正常</Option>
                          <Option value={1}>作废</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>供应商：</label>
                      {getFieldDecorator('suppiler_name')(
                        <Select placeholder="请选择供应商" style={{ width: 'calc(100% - 80px)' }}>
                          {supply &&
                            supply.map(item => (
                              <Option key={item.proc_id} value={item.name}>
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>付款状态：</label>
                      {getFieldDecorator('price_status')(
                        <Select placeholder="请选择付款状态" style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={0}>已付款</Option>
                          <Option value={1}>未付款</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>货单价格：</label>
                      <InputGroup compact style={{ width: 'calc(100% - 80px)' }}>
                        {getFieldDecorator('start_price')(
                          <Input
                            style={{
                              width: 'calc(50% - 25px)',
                              textAlign: 'center'
                            }}
                            placeholder="最小金额"
                          />
                        )}
                        <Input
                          style={{
                            width: 50,
                            borderLeft: 0,
                            pointerEvents: 'none',
                            backgroundColor: '#fff'
                          }}
                          placeholder="~"
                          disabled
                        />
                        {getFieldDecorator('end_price')(
                          <Input
                            style={{
                              width: 'calc(50% - 25px)',
                              textAlign: 'center',
                              borderLeft: 0
                            }}
                            placeholder="最大金额"
                          />
                        )}
                      </InputGroup>
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>制单人：</label>
                      {getFieldDecorator('user_name')(
                        <Input placeholder="请输入订单号" style={{ width: 'calc(100% - 80px)' }} />
                      )}
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <Button type="primary" htmlType="submit">
                        查询
                      </Button>
                      <Button type="gray" htmlType="reset">
                        重置
                      </Button>
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
class AddOrder extends React.Component {
  state = { goods: [] };

  handleAddGoods = goods => {
    this.setState({ goods: [...this.state.goods, goods] });
  };

  handleDeleteGoods = key => {
    this.setState({
      goods: this.state.goods.filter(goods => goods.key !== key)
    });
  };

  handleSubmit = () => {
    const { onSubmit } = this.props;
    this.setState({ goods: [] });

    onSubmit && onSubmit();
  };

  render() {
    return (
      <h2 className="title">
        <span>货单管理</span>
        <FormDrawer
          onClose={() => this.setState({ goods: [] })}
          onSubmit={this.handleSubmit}
          width="calc(100% - 300px)"
          title="新增货单"
          filter={data => ({
            id: this.props.id,
            user_name: this.props.user_name,
            user_id: this.props.id,
            ...data
          })}
          data={{ payload: this.state.goods }}
          action="/create_purchase"
          trigger={
            <Button type="primary" icon="plus">
              新增货单
            </Button>
          }
          headers={{ 'Content-Type': 'application/json' }}
        >
          {({ form }) => {
            const { supply } = this.props;
            const { getFieldDecorator } = form;

            return (
              <div className={styles.orderDrawer}>
                <h2 className="title">
                  <span>基本信息</span>
                </h2>
                <Row gutter={32}>
                  <Col span={12}>
                    <span className={styles.rowItem}>
                      <label>供应商：</label>
                      {getFieldDecorator('code_id')(
                        <Select placeholder="请选择供应商" style={{ width: 'calc(100% - 80px)' }}>
                          {supply &&
                            supply.map(item => (
                              <Option key={item.proc_id} value={item.name}>
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={12}>
                    <span className={styles.rowItem}>
                      <label>进货日期：</label>
                      {getFieldDecorator('purchase_date', {
                        initialValue: moment().startOf('day'),
                        rules: [{ required: true }]
                      })(<DatePicker style={{ width: 'calc(100% - 80px)' }} />)}
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={12}>
                    <span className={styles.rowItem}>
                      <label>付款状态：</label>
                      {getFieldDecorator('price_status', {
                        initialValue: 0,
                        rules: [{ required: true }]
                      })(
                        <Select style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={0}>已付款</Option>
                          <Option value={1}>未付款</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={12}>
                    <span className={styles.rowItem}>
                      <label>付款金额：</label>
                      {getFieldDecorator('purchas_price', {
                        initialValue: 0,
                        rules: [{ required: true, message: '请输入付款金额' }]
                      })(
                        <InputNumber
                          precision={2}
                          formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          placeholder="请输入付款金额"
                          style={{ width: 'calc(100% - 80px)' }}
                        />
                      )}
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={24}>
                    <span className={styles.rowItem}>
                      <label>备注：</label>
                      {getFieldDecorator('remarks')(<Input placeholder="请输入备注" style={{ width: 'calc(100% - 80px)' }} />)}
                    </span>
                  </Col>
                </Row>
                <h2 className="title">
                  <span>商品</span>
                  <div>
                    <GoodsDrawer type="add" onChange={this.handleAddGoods}></GoodsDrawer>
                  </div>
                </h2>
                <GoodsTable onDelete={this.handleDeleteGoods} dataSource={this.state.goods} type="add"></GoodsTable>
              </div>
            );
          }}
        </FormDrawer>
      </h2>
    );
  }
}

export default class App extends React.Component {
  state = {
    supply: null
  };

  componentDidMount() {
    request(`/api/select_supplier?id=${this.props.id}`).then(payload =>
      this.setState({ supply: payload.pageData })
    );
  }

  render() {
    const { supply } = this.state;

    return (
      <div className={styles.orderTable}>
        <OrderTable
          id={this.props.id}
          user_name={this.props.user_name}
          user_id={this.props.id}
          supply={supply}
          source={`/api/select_purchase?id=${this.props.id}`}
        ></OrderTable>
      </div>
    );
  }
}
