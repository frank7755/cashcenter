import React, { Fragment } from "react";
import styles from "~css/Shop/StaffManage.module.less";
import request from "~js/utils/request";
import serveTable from "~js/components/serveTable";
import { Button, Table, Divider, Tag, Modal, Form, Input, message } from "antd";

@serveTable()
class GuideStaffTable extends React.Component {
  columns = [
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      width: 300
    },
    {
      title: "员工编号",
      dataIndex: "staff_id",
      width: 300
    },
    {
      title: "操作",
      dataIndex: "option",
      width: 150,
      render: (option, record) => {
        return (
          <Fragment>
            <StaffInfo
              id={this.props.id}
              refresh={this.refresh}
              data={record}
            ></StaffInfo>
            <Divider type="vertical"></Divider>
            <a
              className="textDelete"
              onClick={() => this.handleDelete(record.staff_id)}
            >
              删除
            </a>
          </Fragment>
        );
      }
    }
  ];

  handleDelete = id => {
    request("/api/delete_employess", {
      method: "post",
      body: {
        id: this.props.id,
        staff_id: id
      }
    })
      .then(payload => this.refresh())
      .catch(error => message.error(error.message));
  };

  refresh = () => {
    const { table } = this.props;

    table.search();
  };

  render() {
    const { table, ...restProps } = this.props;

    return (
      <div className={styles.staffManage}>
        <div className={styles.guideStaffManage}>
          <h2 className="title">
            <span>导购员管理</span>
            <StaffInfo
              id={this.props.id}
              type="add"
              refresh={this.refresh}
            ></StaffInfo>
          </h2>
          <Table
            {...restProps}
            rowKey={table.rowKey}
            columns={this.columns}
            onChange={table.onChange}
            pagination={table.pagination}
            bodyStyle={{ overflowX: "auto" }}
            dataSource={table.getDataSource()}
            loading={table.loading && { delay: 150 }}
          />
        </div>
      </div>
    );
  }
}

@Form.create()
class StaffInfo extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleAddOk = e => {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        request("/api/create_employess", {
          method: "post",
          body: { ...values, id: this.props.id }
        })
          .then(() => {
            this.props.refresh();

            this.setState({ visible: false });
          })
          .catch(err => message.error(err.message));
      }
    });
  };

  handleEditOk = e => {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        request("/api/update_employess", {
          method: "post",
          body: { ...values, id: this.props.id }
        })
          .then(() => {
            this.props.refresh();

            this.setState({ visible: false });
          })
          .catch(err => message.error(err.message));
      }
    });
  };

  handleCancel = e => {
    this.props.form.resetFields();
    this.setState({
      visible: false
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { type, data } = this.props;

    return (
      <Fragment>
        {type == "add" ? (
          <Button icon="plus" type="primary" onClick={this.showModal}>
            新增导购员
          </Button>
        ) : (
          <a className="textEdit" onClick={this.showModal}>
            编辑
          </a>
        )}
        <Modal
          title={type == "add" ? "新增导购员" : "编辑导购员"}
          visible={this.state.visible}
          onOk={type == "add" ? this.handleAddOk : this.handleEditOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
        >
          <Form onSubmit={this.handleSubmit}>
            <Form.Item label="员工姓名">
              {getFieldDecorator("staff_name", {
                initialValue: data && data.staff_name,
                rules: [{ required: true, message: "请输入员工姓名!" }]
              })(<Input placeholder="请输入员工姓名" />)}
            </Form.Item>
            <Form.Item label="员工编号">
              {getFieldDecorator("staff_id", {
                initialValue: data && data.staff_id,
                rules: [{ required: true, message: "请输入员工编号!" }]
              })(
                <Input
                  disabled={type == "add" ? false : true}
                  placeholder="请输入员工编号"
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <GuideStaffTable
        id={this.props.id}
        source="/api/select_employess"
        prefetch
        query={{ id: this.props.id }}
      ></GuideStaffTable>
    );
  }
}
