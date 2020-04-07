import React, { Fragment } from 'react';
import styles from '~css/Goods/GoodsAdd/Real.module.less';
import { Form, Input, Select, Upload, Icon, Modal, Button, Table, Row, Col, Cascader, Avatar, message } from 'antd';
import request from '~js/utils/request';
import RuleSet from './RuleSet';
import Picture from '../../Upload/Pictures';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils';
// 引入编辑器样式
import 'braft-editor/dist/index.css';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 }
  }
};

class GetImageGroup extends React.Component {
  state = { visible: false, urlList: [], imgData: [] };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  getImageUrl = val => {
    const { imgData } = this.state;

    this.setState({
      imgData: val
    });
  };

  handleOk = () => {
    const { onChange } = this.props;

    const { urlList, imgData } = this.state;

    // const imgId = imgData.map(item => item.id);
    // const chooseId = urlList.map(item => item.id);
    // const compareArray = imgId.concat(chooseId);
    // const isTrue = compareArray.some((item, index, arr) => arr.indexOf(item) != arr.lastIndexOf(item));
    // console.log(isTrue, compareArray);

    this.setState({ visible: false, urlList: imgData.map(item => item.url), clear: true });

    onChange && onChange(urlList);
  };

  handleRemove = k => {
    this.setState({ urlList: this.state.urlList.filter((item, index) => index != k) });
  };

  render() {
    const { visible, urlList } = this.state;

    return (
      <div>
        <Button onClick={this.showModal}>选择商品图</Button>
        <p style={{ color: '#999', marginTop: 5, marginBottom: 12 }}>最多选择15张图片</p>
        <div className={styles.imgList}>
          {urlList.length > 0 &&
            urlList.map((item, index) => (
              <span
                style={{ position: 'relative', display: 'inline-block', marginRight: 24, marginBottom: 12, marginBottom: 12 }}
                key={index}
              >
                <Avatar
                  src={item}
                  size={60}
                  style={{ border: '1px solid #999' }}
                  shape="square"
                  className={styles.avatar}
                ></Avatar>
                <Icon type="close-circle" onClick={() => this.handleRemove(index)} className={styles.close}></Icon>
              </span>
            ))}
        </div>
        <Modal
          className={styles.pictureModal}
          width={1000}
          title="选择商品图片"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Picture id={this.props.id} onChange={val => this.getImageUrl(val)}></Picture>
        </Modal>
      </div>
    );
  }
}

class RictTextImages extends React.Component {
  state = { visible: false, imgList: [], checkedNum: null, checkedUrl: '' };

  showModal = () => {
    this.setState({
      visible: true
    });

    request('/api/t_goods_image_select', {
      method: 'post',
      body: {
        id: 2
      }
    }).then(payload => this.setState({ imgList: payload.pageData }));
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  handleOk = () => {
    const { checkedUrl } = this.state;
    const { onChange } = this.props;

    onChange && onChange(checkedUrl);
    this.setState({ visible: false, checkedNum: null, checkedUrl: '' });
  };

  handleChecked = (id, url) => {
    this.setState({ checkedUrl: url, checkedNum: id });
  };

  render() {
    const { visible, imgList } = this.state;

    return (
      <Fragment>
        <button type="button" className="control-item button upload-button" data-title="插入图片" onClick={this.showModal}>
          <Icon type="picture" theme="filled" />
        </button>
        <Modal title="选择图片" width={800} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
          {imgList &&
            imgList.map(item => (
              <div className={styles.imageChoose} key={item.image_id}>
                <span
                  onClick={() => this.handleChecked(item.image_id, item.image_url)}
                  data-id={item.image_url}
                  className={this.state.checkedNum == item.image_id ? styles.checked : ''}
                >
                  <img src={item.image_url}></img>
                </span>
                <p>{item.name}</p>
              </div>
            ))}
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = {
    ruleSetData: {},
    editorState: BraftEditor.createEditorState(null),
    goodsSort: [],
    checkedValue: [],
    imgList: []
  };

  componentDidMount() {
    request('/api/t_goods_fz_select').then(payload => {
      this.setState({ goodsSort: payload.pageData });
    });
  }

  handleSubmit = () => {
    const { ruleSetData, imgList, editorState } = this.state;

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/t_goods/insert', {
          headers: { 'Content-Type': 'application/json;' },
          method: 'post',
          body: {
            ...value,
            id: this.props.id,
            yz_token_info: this.props.yztoken,
            status: 0,
            item_type: 0,
            image_ids: imgList.join(','),
            tag_ids: value.tag_ids[2],
            sku_stocks: ruleSetData,
            desc: editorState.toHTML()
          }
        })
          .then(() => {
            message.success('添加成功');
            this.props.history.push('/goodssearch');
          })
          .catch(error => {
            message.error(error.message);
          });
      }
    });
  };

  getRuleSetData = data => {
    this.setState({ ruleSetData: data });
  };

  handleEditorChange = editorState => {
    this.setState({ editorState });
  };

  getImageId = val => {
    this.setState({ imgList: val.map(item => item.id) });
  };

  handleChange = editorState => {
    this.setState({ editorState });
  };

  handleImageChange = val => {
    this.setState({
      editorState: ContentUtils.insertMedias(this.state.editorState, [
        {
          type: 'IMAGE',
          url: val
        }
      ])
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { editorState, goodsSort, checkedValue } = this.state;

    const controls = [
      'undo',
      'redo',
      'separator',
      'font-size',
      'line-height',
      'letter-spacing',
      'separator',
      'text-color',
      'bold',
      'italic',
      'underline',
      'strike-through',
      'separator',
      'superscript',
      'subscript',
      'remove-styles',
      'emoji',
      'separator',
      'text-indent',
      'text-align',
      'separator',
      'headings',
      'list-ul',
      'list-ol',
      'blockquote',
      'code',
      'separator',
      'link',
      'separator',
      'hr',
      'separator',
      // 'media',
      'separator',
      'clear'
    ];

    const extendControls = [
      {
        key: 'antd-uploader',
        type: 'component',
        component: <RictTextImages onChange={val => this.handleImageChange(val)}></RictTextImages>
      }
    ];

    return (
      <Fragment>
        <Form {...formItemLayout} className={styles.realFrom}>
          <h2 className="title">
            <span>基本信息</span>
          </h2>
          <FormItem label="商品名称">
            {getFieldDecorator('title', {
              rules: [{ required: true, message: '请输入商品名称' }]
            })(<Input placeholder="请输入商品名称" />)}
          </FormItem>
          <FormItem
            label="商品卖点"
            help={
              <p>
                在商品列表页，详情页标题下面展示卖点信息,建议60字以内 <a>查看示例</a>
              </p>
            }
          >
            {getFieldDecorator('sell_point')(<Input />)}
          </FormItem>
          <Row style={{ margin: '24px 0' }}>
            <Col span={4}>
              <p style={{ textAlign: 'right', lineHeight: '32px', marginRight: 5, color: '#000' }}>
                <span className={styles.xinghao}></span>商品图:
              </p>
            </Col>
            <Col span={10}>
              <GetImageGroup id={this.props.id} onChange={val => this.getImageId(val)}></GetImageGroup>
            </Col>
          </Row>
          <FormItem label="商品分组">
            {getFieldDecorator('tag_ids', {
              initialValue: [],
              rules: [{ required: true, message: '请选择商品分组' }]
            })(<Cascader options={goodsSort} />)}
          </FormItem>
          <FormItem label="是否上架">
            {getFieldDecorator('is_display', {
              initialValue: 1,
              rules: [{ required: true, message: '请选择是否上架' }]
            })(
              <Select>
                <Option value={1}>上架商品</Option>
                <Option value={0}>放入仓库</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="划线价">
            {getFieldDecorator('origin_price', {
              rules: [{ required: true, message: '请填写划线价' }]
            })(<Input type="text"></Input>)}
          </FormItem>
          <h2 className="title">
            <span>
              价格库存
              <span style={{ color: '#fc5050', fontSize: 14, fontWeight: 'normal' }}>
                (修改规格值与规格名后,请重新点击下方确定)
              </span>
            </span>
          </h2>
        </Form>
        <RuleSet onChange={data => this.getRuleSetData(data)}></RuleSet>
        <h2 className="title">
          <span>商品详情</span>
        </h2>
        <Row gutter={12}>
          <Col span={16} offset={3}>
            <BraftEditor
              placeholder="请在此输入商品详情"
              value={editorState}
              controls={controls}
              onChange={this.handleEditorChange}
              className={styles.richText}
              extendControls={extendControls}
            ></BraftEditor>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={16} offset={3}>
            <Button type="primary" className={styles.submitBtn} onClick={this.handleSubmit}>
              确认添加商品
            </Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
