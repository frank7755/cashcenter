import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Purchase/Suppleier.module.less';
import serveTable from '~js/components/serveTable';
import { Input, Popconfirm, Col, Row, Button, Table, message, Modal, Form } from 'antd';

const { TextArea } = Input;

@Form.create()
class SuppleierAction extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleAddOk = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        request('/api/insert_supplier', {
          method: 'post',
          body: { ...values, id: this.props.id }
        })
          .then(success => {
            this.setState({ visible: false });
            this.props.refresh();
          })
          .catch(error => message.error(error.message));
      }
    });
  };

  handleEditOk = e => {
    const { data } = this.props;

    this.props.form.validateFields((err, values) => {
      if (!err) {
        request('/api/update_supplier', {
          method: 'post',
          body: { ...values, id: this.props.id, proc_id: data.proc_id }
        })
          .then(success => {
            this.setState({ visible: false });
            this.props.refresh();
          })
          .catch(error => message.error(error.message));
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { type, data } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button type="primary" icon="plus" onClick={this.showModal}>
            添加供应商
          </Button>
        ) : (
          <a style={{ margin: '0 5px' }} onClick={this.showModal}>
            编辑
          </a>
        )}

        <Modal
          title={type == 'add' ? '新增供应商' : '编辑供应商'}
          visible={this.state.visible}
          onOk={type == 'add' ? this.handleAddOk : this.handleEditOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <Form.Item label="供应商名称">
              {getFieldDecorator('name', {
                initialValue: data && data.name,
                rules: [{ required: true }]
              })(<Input type="text" />)}
            </Form.Item>
            <Form.Item label="联系人">
              {getFieldDecorator('contact', {
                initialValue: data && data.contact
              })(<Input type="text" />)}
            </Form.Item>
            <Form.Item label="联系电话">
              {getFieldDecorator('number', {
                initialValue: data && data.number
              })(<Input type="number" />)}
            </Form.Item>
            <Form.Item label="地址">
              {getFieldDecorator('address', {
                initialValue: data && data.address
              })(<TextArea type="text" />)}
            </Form.Item>
            <Form.Item label="备注">
              {getFieldDecorator('remarks', {
                initialValue: data && data.remarks
              })(<TextArea type="text" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class SupplierTable extends React.Component {
  columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      width: 200
    },
    {
      title: '联系电话',
      dataIndex: 'number',
      width: 200
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 200
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      width: 250
    },
    {
      title: '流水',
      dataIndex: 'order',
      width: 150,
      render() {
        return <a>流水</a>;
      }
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 150,
      align: 'center',
      render: (options, record) => {
        return (
          <Fragment>
            <SuppleierAction refresh={this.refresh} id={this.props.id} data={record}></SuppleierAction>
            <Popconfirm
              Popconfirm
              title="确认要删除当前供应商吗?"
              onConfirm={() => this.confirm(this.props.id, record.proc_id)}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: '#fc5050', margin: '0 5px' }}>删除</a>
            </Popconfirm>
          </Fragment>
        );
      }
    }
  ];

  confirm = (id, proc_id) => {
    request('/api/delete_supplier', {
      method: 'post',
      body: {
        id: id,
        proc_id: proc_id
      }
    })
      .then(this.refresh())
      .catch(error => message.error(error.message));
  };

  handleChange = e => {
    const { table } = this.props;

    table.search({ id: this.props.id, name: e.target.value }, { ...table.pagination, current: 1 });
  };

  refresh = () => {
    this.props.table.search();
  };

  render() {
    const { table, supply, ...restProps } = this.props;

    return (
      <div>
        <Row gutter={32}>
          <Col span={10}>
            <span className={styles.rowItem}>
              <label>进货单号：</label>
              <Input placeholder="供应商，联系人，电话..." allowClear onChange={this.handleChange} />
            </span>
          </Col>
        </Row>
        <h2 className="title">
          <span>供应商</span>
          <SuppleierAction type="add" id={this.props.id} refresh={this.refresh}></SuppleierAction>
        </h2>
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
      </div>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.supplier}>
        <SupplierTable
          id={this.props.id}
          source="/api/select_supplier"
          prefetch
          query={{ id: this.props.id }}
        ></SupplierTable>
      </div>
    );
  }
}
