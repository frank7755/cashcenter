import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Foods/FoodsCash.module.less';
import { store } from '~js/utils/utils';
import moment from 'moment';
import { Button, Form, Input, message, InputNumber, Checkbox, Modal } from 'antd';

const FormItem = Form.Item;

class GoodsInfo extends React.Component {
  render() {
    const { item, form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <li>
        <div className={styles.imgBox}>
          <img src={item.image_url}></img>
        </div>
        {getFieldDecorator(`good_${item.item_id}.checked`, { initialValue: false, valuePropName: 'checked' })(
          <Checkbox className={styles.checkbox}>{item.name}</Checkbox>
        )}
        <div>
          价格：
          <span className="textDelete" style={{ fontSize: 20 }}>
            {item.price} 元
          </span>
        </div>
        <div style={{ marginTop: 5 }}>
          数量：
          {getFieldDecorator(`good_${item.item_id}.count`, { initialValue: 1 })(
            <InputNumber min={1} precision={0} disabled={!getFieldValue(`good_${item.item_id}.checked`)}></InputNumber>
          )}
        </div>
      </li>
    );
  }
}

class CashModal extends React.Component {
  state = { visible: false, orderData: [] };

  showModal = () => {
    const { data } = this.props;
    const values = this.props.form.getFieldsValue();
    const newData = data
      .filter(({ item_id }) => values[`good_${item_id}`].checked)
      .map((item) => ({ ...item, count: values[`good_${item.item_id}`].count }));

    this.setState({
      visible: true,
      orderData: newData,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleAdd = () => {
    this.props.form.validateFields((err, values) => {
      const { data } = this.props;
      const newData = data
        .filter(({ item_id }) => values[`good_${item_id}`].checked)
        .map((item) => ({ ...item, count: values[`good_${item.item_id}`].count }));

      if (!err) {
        request('/api/catering/xprint', {
          method: 'post',
          body: {
            id: this.props.id,
            sn: store.get('sn'),
            type: 4,
            content: `
<BR><BR><C><HB>${store.get('shopName')}

<N>欢迎光临

<L>桌位号：${values.desk_no}
品名      数量          单价
--------------------------------
${newData
  .map(
    (item) => `
${item.name}
           ${item.count}           ￥${item.price}`
  )
  .join('')}
--------------------------------
日期：${moment().format('YYYY-MM-DD HH:mm:ss')}
请保留您的小票，保护您的权益.<BR><BR>
`,
          },
        }).catch((error) => message.error(error.message));

        request('/api/catering/order_management_addcreate', {
          method: 'post',
          headers: { 'Content-Type': 'application/json;' },
          body: { id: this.props.id, desk_no: values.desk_no, skus: newData },
        })
          .then((payload) => {
            message.success('加单成功!');
            this.props.form.resetFields();
          })
          .catch((error) => message.error(error.message));

        this.setState({
          visible: false,
        });
      }
    });
  };

  handleCash = () => {
    this.props.form.validateFields((err, values) => {
      const { data } = this.props;
      const newData = data
        .filter(({ item_id }) => values[`good_${item_id}`].checked)
        .map((item) => ({ ...item, count: values[`good_${item.item_id}`].count }));

      if (!err) {
        request('/api/catering/xprint', {
          method: 'post',
          body: {
            id: this.props.id,
            sn: store.get('sn'),
            type: 4,
            content: `
<BR><BR><C><HB>${store.get('shopName')}

<N>欢迎光临

<L>桌位号：${values.desk_no}
品名      数量          单价
--------------------------------
${newData
  .map(
    (item) => `
${item.name}
           ${item.count}          ￥${item.price}`
  )
  .join('')}
--------------------------------
日期：${moment().format('YYYY-MM-DD HH:mm:ss')}
请保留您的小票，保护您的权益.<BR><BR>
`,
          },
        }).catch((error) => message.error(error.message));

        request('/api/catering/order_management_create', {
          method: 'post',
          headers: { 'Content-Type': 'application/json;' },
          body: { id: this.props.id, desk_no: values.desk_no, skus: newData },
        })
          .then((payload) => {
            message.success('下单成功!');
            this.props.form.resetFields();
          })
          .catch((error) => message.error(error.message));

        this.setState({
          visible: false,
        });
      }
    });
  };

  render() {
    const { visible, orderData } = this.state;
    const { form, type, disabled } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button type="success" onClick={this.showModal} disabled={disabled}>
            加单
          </Button>
        ) : (
          <Button type="primary" onClick={this.showModal} disabled={disabled}>
            下单
          </Button>
        )}
        <Modal
          title={type == 'add' ? '确认加单' : '确认下单'}
          visible={visible}
          onOk={type == 'add' ? this.handleAdd : this.handleCash}
          onCancel={this.handleCancel}
        >
          <Form>
            <div className={styles.orderedListTitle}>
              <span>菜名</span>
              <span>数量</span>
              <span>单价</span>
            </div>
            {orderData.map((item) => (
              <p key={item.item_id} className={styles.orderedList}>
                <span>{item.name}</span>
                <span>{item.count}</span>
                <span>￥{item.price}</span>
              </p>
            ))}
            <FormItem label="座位号">
              {getFieldDecorator('desk_no', {
                rules: [{ required: true, message: '请输入座位号!' }],
              })(<Input type="text" placeholder="请输入座位号"></Input>)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = {
    data: [],
    sumData: [],
    disabled: true,
  };

  componentDidMount() {
    this.getFoods();
  }

  getFoods = () => {
    request('/api/catering/order_mast_selectact', {
      method: 'post',
      body: { id: 1001, type: 1 },
    }).then((payload) =>
      this.setState({ data: payload.pageData, sumData: payload.pageData.map((item) => item.children).flat() })
    );
  };

  handleChange = () => {
    const { sumData } = this.state;
    const values = this.props.form.getFieldsValue();
    const newData = sumData.filter(({ item_id }) => values[`good_${item_id}`].checked);

    newData.length > 0 ? this.setState({ disabled: false }) : this.setState({ disabled: true });
  };

  render() {
    const { data, sumData, disabled } = this.state;
    const { form } = this.props;

    return (
      <div className={styles.foodsCash}>
        <h2 className="title">
          <span>下单</span>
        </h2>
        <Form onChange={this.handleChange}>
          <div className={styles.buttonBox}>
            <CashModal data={sumData} form={this.props.form} id={this.props.id} disabled={disabled}></CashModal>
            <CashModal type="add" data={sumData} form={this.props.form} id={this.props.id} disabled={disabled}></CashModal>
          </div>
          {data.map((item) => (
            <div key={item.proc_id} className={styles.foodsBox}>
              <h2>{item.group}</h2>
              <ul>
                {item.children.length > 0 &&
                  item.children.map((info) => <GoodsInfo item={info} form={form} key={info.item_id}></GoodsInfo>)}
              </ul>
            </div>
          ))}
        </Form>
      </div>
    );
  }
}
