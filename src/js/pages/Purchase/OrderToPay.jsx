import React, { Fragment } from "react";
import request from "~js/utils/request";
import styles from "~css/Purchase/Suppleier.module.less";
import serveTable from "~js/components/serveTable";
import {
  Input,
  Popconfirm,
  Col,
  Row,
  Button,
  Table,
  message,
  Modal
} from "antd";

@serveTable()
class PayOrderTable extends React.Component {
  render() {
    return (
      <Fragment>
        <h2 className="title">
          <span>供应商</span>
          <SuppleierAction
            type="add"
            id={this.props.id}
            refresh={this.refresh}
          ></SuppleierAction>
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
        ></Table>
      </Fragment>
    );
  }
}
