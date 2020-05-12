import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { store } from '~js/utils/utils';
import moment from 'moment';
import styles from '~css/Shop/Shop.module.less';
import { Button, Empty, Modal, Form, Input, Card, Row, Col, message, Popconfirm, Select } from 'antd';
import { Link } from 'react-router-dom';

const FromItem = Form.Item;
const Option = Select.Option;

@Form.create()
class AddShop extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleAddOk = (e) => {
    const { onChange } = this.props;

    this.props.form.validateFields((error, values) => {
      if (!error) {
        request('api/create_shop', {
          method: 'post',
          body: {
            ...values,
            number: store.get('telnumber'),
          },
        })
          .then((payload) => onChange && onChange())
          .catch((error) => {
            message.error(error.message);
          });
      }
    });

    this.setState({
      visible: false,
    });
  };

  handleEditOk = (e) => {
    const { id, onChange } = this.props;

    this.props.form
      .validateFields((error, values) => {
        if (!error) {
          request('api/update_shop', {
            method: 'post',
            body: {
              ...values,
              id,
            },
          });
        }
      })
      .then((payload) => {
        message.success('修改成功!');
        onChange && onChange();
      })
      .catch((error) => {
        message.error(error.message);
      });

    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { type, onChange, data } = this.props;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button type="primary" onClick={this.showModal} icon="plus">
            添加店铺
          </Button>
        ) : (
          <a className="textEdit" onClick={this.showModal} style={{ fontSize: 14, fontWeight: 'normal' }}>
            编辑
          </a>
        )}
        <Modal
          title={type == 'add' ? '添加店铺' : '编辑店铺'}
          visible={this.state.visible}
          onOk={type == 'add' ? this.handleAddOk : this.handleEditOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FromItem label="店铺名称">
              {getFieldDecorator('shop_name', {
                initialValue: data && data.shop_name,
                rules: [{ required: true, message: '请输入门店名称!' }],
              })(<Input placeholder="请输入门店名称" />)}
            </FromItem>
            <FromItem label="店铺行业">
              {getFieldDecorator('shop_type', {
                initialValue: data && data.shop_type,
                rules: [{ required: true, message: '请输入门店名称!' }],
              })(
                <Select placeholder="请选择行业">
                  <Option value={'1'}>餐饮行业</Option>
                  <Option value={'2'}>零售行业</Option>
                </Select>
              )}
            </FromItem>
            <FromItem label="店铺地址">
              {getFieldDecorator('address', {
                initialValue: data && data.address,
                rules: [{ required: true, message: '请输入门店地址!' }],
              })(<Input placeholder="请输入门店地址" />)}
            </FromItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}
const userId = 'userId';
const tel = 'telnumber';
const storeToken = 'userToken';
const shopName = 'shopName';
const shopType = 'shopType';

export default class App extends React.Component {
  state = {
    data: null,
  };

  getShop = () => {
    request('api/select_shop', {
      method: 'post',
      body: {
        number: store.get(tel),
      },
    })
      .then((payload) => this.setState({ data: payload.pageData }))
      .catch((error) => {
        message.error(error.message);
      });
  };

  confirmDelete = (id) => {
    request('/api/delete_shop', {
      method: 'post',
      body: {
        id,
        number: store.get(tel),
      },
    })
      .then((payload) => this.getShop())
      .catch((error) => {
        message.error(error.message);
      });
  };

  confirmDefault = (id) => {
    const { history } = this.props;

    request('/api/swap_shop', {
      method: 'post',
      body: {
        id,
        number: store.get(tel),
      },
    })
      .then((payload) => {
        store.set(shopName, payload.shop_name);
        store.set(userId, id);
        store.set(storeToken, payload.token_info);
        store.set(shopType, payload.shop_type);

        history.push('/');
      })
      .catch((error) => {
        message.error(error.message);
      });
  };

  componentDidMount() {
    this.getShop();
  }

  render() {
    const { data } = this.state;

    return (
      <div className={styles.shop}>
        <div className={styles.top}>
          <div className={styles.topimg}>
            <img src={require('~images/logo.png')}></img>
          </div>
        </div>
        <div className={styles.shopinfo}>
          <h2 className="title">
            <span>店铺管理</span>
            <AddShop type="add" onChange={this.getShop} />
          </h2>
          {data && data.length > 0 ? (
            <div className={styles.shopbox}>
              <Row gutter={24} style={{ height: 650, overflow: 'auto' }}>
                {data.map((item) => (
                  <Col span={6} key={item.id}>
                    <Card
                      onClick={() => this.confirmDefault(item.id)}
                      style={{ cursor: 'pointer' }}
                      title={
                        <p>
                          {item.shop_name}
                          {item.defalut_shop ? (
                            <span className="textHighLight" style={{ fontSize: 14, fontWeight: 'normal', marginLeft: 5 }}>
                              ( 当前店铺 )
                            </span>
                          ) : (
                            ''
                          )}
                        </p>
                      }
                      bordered
                      className={item.defalut_shop ? styles.shopCard + ' ' + styles.active : styles.shopCard}
                    >
                      <p>
                        <span>店铺地址：</span>
                        {item.address}
                      </p>
                      <p>
                        <span>创建时间：</span>
                        {moment(`${item.create_time}`).format('YYYY-MM-DD')}
                      </p>
                      <div onClick={(e) => e.stopPropagation()}>
                        <AddShop onChange={this.getShop} id={item.id} data={item} />
                        <Popconfirm
                          title="确定要删除店铺吗?"
                          onConfirm={() => this.confirmDelete(item.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <a className="textDelete">删除</a>
                        </Popconfirm>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <div className={styles.empty}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无店铺信息" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
