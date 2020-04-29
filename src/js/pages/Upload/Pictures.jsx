import React, { Fragment } from 'react';
import styles from '~css/Upload/Pictures.module.less';
import reqwest from 'reqwest';
import request from '~js/utils/request';
import { Upload, Popconfirm, Icon, Checkbox, Divider, Pagination, Button, Modal, Form, Input, message, Select } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
@Form.create()
class UploadFile extends React.Component {
  state = {
    file: null,
    uploading: false,
  };

  handleUpload = () => {
    const { file } = this.state;
    const formData = new FormData();

    this.props.form.validateFields((error, values) => {
      const { onChange } = this.props;

      if (!error) {
        formData.append('image', file);
        formData.append('id', this.props.id);
        formData.append('name', values.name);
        formData.append('type', 1);
        formData.append('status', 0);
        formData.append('yz_token_info', this.props.yztoken);
        formData.append('term_id', this.props.term_id);

        reqwest({
          url: '/api/tmaterialcenter/list/create',
          method: 'post',
          processData: false,
          data: formData,
          success: (res) => {
            if (res.code == 200) {
              this.setState({
                fileList: null,
              });
              message.success('上传成功');
              onChange && onChange();
              this.props.form.resetFields();
            } else {
              message.error(res.msg);
              this.props.form.resetFields();
            }
          },
          error: (err) => {
            message.error('系统错误，请联系管理员');
          },
        });
        this.setState({
          visible: false,
        });
      }
    });
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
  };

  handleFile = (file, callback) => {
    const reader = new FileReader();
    const img = new Image();
    const name = file.name;

    reader.readAsDataURL(file);

    reader.onload = function (e) {
      img.src = e.target.result;
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    img.onload = function () {
      // 图片原始尺寸
      var originWidth = this.width;
      var originHeight = this.height;
      // 最大尺寸限制
      var maxWidth = 750,
        maxHeight = 750;
      // 目标尺寸
      var targetWidth = originWidth,
        targetHeight = originHeight;
      // 图片尺寸超过400x400的限制
      if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
          // 更宽，按照宽度限定尺寸
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      // 清除画布
      context.clearRect(0, 0, targetWidth, targetHeight);
      // 图片压缩
      context.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(function (blob) {
        callback(blob, name);
      });
    };
  };

  blobToFile = (blob, fileName) => {
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    return blob;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { file } = this.state;

    const props = {
      onChange: (item) => {
        this.setState({ file: item.file });
      },
      onRemove: (file) => {
        this.setState({ file: null });
      },
      beforeUpload: (file) => {
        this.handleFile(file, (blob, name) => {
          const isJpgOrPng = blob.type === 'image/jpeg' || blob.type === 'image/png' || blob.type === 'image/gif';
          if (!isJpgOrPng) {
            message.error('请上传jpg，png或gif格式图片');
          }
          const isLt2M = blob.size / 1024 / 1024 < 2;
          if (!isLt2M) {
            message.error('图片大小不超过2MB!');
          }

          this.setState({
            file: isJpgOrPng && isLt2M ? this.blobToFile(blob, name) : null,
          });
        });

        return false;
      },
      file,
    };

    return (
      <Fragment>
        <Button type="primary" onClick={this.showModal}>
          上传图片
        </Button>
        <Modal title="图片上传" visible={this.state.visible} onOk={this.handleUpload} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="图片名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入图片名称!' }],
              })(<Input type="text" placeholder="请输入图片名称"></Input>)}
            </FormItem>
            <Upload {...props}>
              <Button>
                <Icon type="upload" /> 点击上传
              </Button>
            </Upload>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
class AddGroup extends React.PureComponent {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    const form = this.props.form;
    const { onChange } = this.props;

    form.validateFields((error, values) => {
      if (!error) {
        request('/api/tmaterialcenter/term/create', {
          method: 'post',
          body: {
            id: this.props.id,
            term_name: values.term_name,
            type: 1,
            status: 0,
          },
        }).then(() => {
          onChange && onChange();
          form.resetFields();
        });
      }
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

    return (
      <Fragment>
        <Button icon="plus" onClick={this.showModal}>
          添加分组
        </Button>
        <Modal title="添加分组" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <Form.Item label="分组名称">
              {getFieldDecorator('term_name', {
                rules: [{ required: true, message: '请输入分组名称' }],
              })(<Input placeholder="请输入分组名称" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
class EditPictures extends React.PureComponent {
  state = {
    visible: false,
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.props.form.validateFields((err, value) => {
      const { data, onChange } = this.props;

      if (!err) {
        request('/api/tmaterialcenter/list/update', {
          method: 'post',
          body: {
            ...value,
            id: this.props.id,
            proc_id: data.proc_id,
          },
        }).then((payload) => onChange && onChange());
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
    const { group, data } = this.props;

    return (
      <Fragment>
        <a onClick={this.showModal}>编辑</a>
        <Modal title="编辑图片" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <Form.Item label="图片名称">
              {getFieldDecorator('name', {
                initialValue: data.name,
                rules: [{ required: true, message: '请输入图片名称' }],
              })(<Input type="text" />)}
            </Form.Item>
            <Form.Item label="分组名称">
              {getFieldDecorator('term_id', {
                initialValue: 0,
                rules: [{ required: true, message: '请输入分组名称' }],
              })(
                <Select>
                  {group.map((item) => (
                    <Option value={item.proc_id} key={item.proc_id}>
                      {item.term_name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
class GroupEdit extends React.Component {
  state = {
    visible: false,
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.props.form.validateFields((err, value) => {
      const { data, onChange } = this.props;

      if (!err) {
        request('/api/tmaterialcenter/term/update', {
          method: 'post',
          body: {
            ...value,
            id: this.props.id,
            type: 1,
            proc_id: data.proc_id,
          },
        }).then((payload) => onChange && onChange());
      }
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };
  render() {
    const { data } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <a onClick={this.showModal}>编辑</a>
        <Modal title="编辑分组" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <Form.Item label="分组名称">
              {getFieldDecorator('term_name', {
                initialValue: data.term_name,
                rules: [{ required: true, message: '请输入分组名称' }],
              })(<Input type="text" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  state = {
    activeKey: 0,
    activeName: '未分组',
    group: [],
    item: [],
    total: null,
    pictures: [],
    current: 1,
  };

  getGroup = () => {
    request('/api/tmaterialcenter/term/select', {
      method: 'post',
      body: {
        id: this.props.id,
        type: 1,
        status: 0,
      },
    })
      .then((payload) => {
        this.setState({ group: payload.pageData });
        this.getPictures();
      })
      .catch((error) => message.error(error.message));
  };

  getPictures = (page, pageSize) => {
    request('/api/tmaterialcenter/list/select', {
      method: 'post',
      body: {
        id: this.props.id,
        type: 1,
        term_id: this.state.activeKey,
        page: page || 1,
        pageSize: pageSize || 20,
      },
    }).then((payload) => this.setState({ total: payload.total, pictures: payload.pageData, current: payload.page }));
  };

  handleDelete = (val) => {
    request('/api/tmaterialcenter/list/delete', {
      method: 'post',
      body: {
        id: this.props.id,
        status: 1,
        proc_id: val,
      },
    }).then((payload) => this.getPictures());
  };

  handleGroupDelete = (val) => {
    val != 0
      ? request('/api/tmaterialcenter/term/delete', {
          method: 'post',
          body: {
            id: this.props.id,
            status: 1,
            proc_id: val,
          },
        })
          .then((payload) => {
            this.setState({ activeKey: 0 });
            this.getGroup();
          })
          .catch((error) => message.error(error.message))
      : message.error('默认分组无法删除');
  };

  handleChecked = (e) => {
    const { onChange } = this.props;
    let newArr = [...this.props.checkedData];

    if (e.target.checked) {
      newArr.length < 15 ? newArr.push(e.target.checkedValue) : message.error('请选择不超过15张图片');
    } else {
      newArr = newArr.filter((item) => item.image_id != e.target.value);
    }

    onChange && onChange(newArr);
  };

  componentDidMount() {
    this.getGroup();
    this.getPictures();
  }

  handleClick = (e) => {
    e.stopPropagation();
    this.setState({ activeKey: e.currentTarget.dataset.key, activeName: e.currentTarget.dataset.name }, () => {
      this.getPictures();
    });
  };

  render() {
    const { group, activeKey, activeName, total, pictures, current } = this.state;

    return (
      <div className={styles.pictures}>
        <div className={styles.groupLeft}>
          <ul>
            {group.map((item) => (
              <li
                key={item.proc_id}
                data-key={item.proc_id}
                data-name={item.term_name}
                className={item.proc_id == activeKey ? styles.active : ''}
                onClick={this.handleClick}
              >
                <div>
                  <span>{item.term_name}</span>
                  {item.proc_id != 0 && (
                    <p>
                      <GroupEdit onChange={this.getGroup} id={this.props.id} data={item}></GroupEdit>
                      <Popconfirm title="确认要删除分组吗？" onConfirm={() => this.handleGroupDelete(activeKey)}>
                        <a style={{ color: 'red', marginLeft: 12 }}>删除</a>
                      </Popconfirm>
                    </p>
                  )}
                </div>
              </li>
            ))}
            <li>
              <AddGroup id={this.props.id} onChange={this.getGroup}></AddGroup>
            </li>
          </ul>
        </div>
        <div className={styles.groupRight}>
          <h2>
            <span>
              {group.filter((item) => item.proc_id == activeKey).length &&
                group.filter((item) => item.proc_id == activeKey)[0].term_name}
            </span>
            <UploadFile
              onChange={this.getPictures}
              term_id={activeKey}
              id={this.props.id}
              yztoken={this.props.yztoken}
            ></UploadFile>
          </h2>
          <Checkbox.Group style={{ width: '100%' }} value={this.props.checkedID}>
            <ul className={styles.imgCheckBox}>
              {pictures.map((item) => (
                <li key={item.proc_id}>
                  <img src={item.image_url}></img>
                  <Checkbox
                    className={styles.checkName}
                    checkedValue={item}
                    value={item.image_id}
                    onChange={this.handleChecked}
                  >
                    {item.name}
                  </Checkbox>
                  <EditPictures onChange={this.getPictures} id={this.props.id} data={item} group={group}></EditPictures>
                  <Divider type="vertical" />
                  <a>链接</a>
                  <Divider type="vertical" />
                  <Popconfirm title="确认要删除图片吗？" onConfirm={() => this.handleDelete(item.proc_id)} cancelText="取消">
                    <a>删除</a>
                  </Popconfirm>
                </li>
              ))}
            </ul>
          </Checkbox.Group>
          <Divider />
          <div className={styles.actionBottom}>
            <Pagination
              showQuickJumper
              total={total}
              current={current}
              onChange={(page, pageSize) => this.getPictures(page, pageSize)}
            ></Pagination>
          </div>
        </div>
      </div>
    );
  }
}
