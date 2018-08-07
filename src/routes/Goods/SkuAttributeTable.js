import React, { PureComponent } from 'react';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import { Input, Button, Icon, Radio, Tooltip, Upload, Divider, Popconfirm, Checkbox, Form } from 'antd';
import { goodsEditorLanguage, setApiHost } from '../../utils/utils';
import { notification } from 'antd/lib/index';

const RadioGroup = Radio.Group;

export default class SkuAttributeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingId: '', // 图片load的时候，只loading当前
    };
  }

  beforeUpload = () => {

  };

  render() {
    const { dataSource, languageDetails, isAdd, language, form } = this.props;
    const { getFieldDecorator } = form;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const languageForMessage = languageDetails.message;
    const languageForGlobal = languageDetails.global;
    //表格属性
    const columns = [
      {
        title: 'ID',
        dataIndex: 'property_id',
        key: 'property_id',
        classType: 1,
        render: (text) => {
          return (
            <div>{text}</div>
          );
        },
      },
      {
        title: languageForProductEdit.Type,
        dataIndex: 'name',
        key: 'name',
        classType: 2,
        render: (text) => {
          return (
            <div>{text}</div>
          );
        },
      },
      {
        title: (
          <div>
            {languageForProductEdit.DisplayForm}&nbsp;
            <Tooltip
              placement="topLeft"
              title={languageForMessage.SKUicons}
              arrowPointAtCenter
            >
              <Icon type="exclamation-circle"/>
            </Tooltip>
          </div>
        ),
        dataIndex: 'url',
        key: 'url',
        classType: 9,
        render: (text, record, index) => {

          const uploadButton = (
            <div>
              <Icon type={this.state.loading ? 'loading' : 'plus'}/>
              <div className="ant-upload-text">Upload</div>
            </div>
          );
          const uploadButtonNone = (
            <div>
              <Icon type={'plus'}/>
              <div className="ant-upload-text">Upload</div>
            </div>
          );
          const imageUrl = record.image_url; // 使用大图
          return (
            <div>
              {/*{*/}
                {/*record.name == languageForProductEdit.attributeName ? (*/}
                  {/*<RadioGroup*/}
                    {/*disabled={this.props.disabled}*/}
                    {/*onChange={this.handleShowType.bind(this, record)}*/}
                    {/*value={`${record.imp_type}`}*/}
                  {/*>*/}
                    {/*<Radio value="1">{languageForProductEdit.Label}</Radio>*/}
                    {/*<Radio value="2">{languageForProductEdit.Image}</Radio>*/}
                  {/*</RadioGroup>*/}
                {/*) : null*/}
              {/*}*/}

              {/*{*/}
                {/*dataSource[0].imp_type == 2 && record.name == languageForProductEdit.attributeValue ? (*/}
                  {/*<div>*/}
                    {/*<Upload*/}
                      {/*name="upload_img"*/}
                      {/*listType="picture-card"*/}
                      {/*className="avatar-uploader"*/}
                      {/*showUploadList={false}*/}
                      {/*action={setApiHost() + `/api/merchant/v1/goods/uploadImg`}*/}
                      {/*beforeUpload={this.beforeUpload}*/}
                      {/*data={{ img_type: 1 }}*/}
                      {/*disabled={this.props.disabled}*/}
                      {/*onChange={(info) => {*/}
                        {/*if (info.file.status === 'uploading') {*/}
                          {/*this.setState({*/}
                            {/*loading: true,*/}
                            {/*loadingId: record.key,*/}
                          {/*});*/}
                          {/*return;*/}
                        {/*}*/}
                        {/*if (info.file.status === 'done') {*/}
                          {/*// Get this url from response in real world.*/}
                          {/*if (info.file.response.status === 200) {*/}
                            {/*this.getBase64(info.file.originFileObj, (imageUrl) => {*/}
                              {/*const newData = [...dataSource];*/}
                              {/*newData.map((item) => {*/}
                                {/*if (item.key == record.key) {*/}
                                  {/*item.image_url = info.file.response.data.image_url;*/}
                                  {/*item.small_url = info.file.response.data.small_url;*/}
                                {/*}*/}
                                {/*return item;*/}
                              {/*});*/}
                              {/*this.setState({*/}
                                {/*imageUrl,*/}
                                {/*loading: false,*/}
                                {/*data: [...newData],*/}
                              {/*});*/}
                            {/*});*/}
                            {/*notification.success({*/}
                              {/*message: languageForMessage.KindlyReminder,*/}
                              {/*description: info.file.response.msg,*/}
                            {/*});*/}
                            {/*this.setState({ loading: false });*/}
                          {/*} else {*/}
                            {/*notification.error({*/}
                              {/*message: languageForMessage.KindlyReminder,*/}
                              {/*description: info.file.response.msg,*/}
                            {/*});*/}
                            {/*this.setState({ loading: false });*/}
                          {/*}*/}
                        {/*}*/}
                      {/*}}*/}
                    {/*>*/}
                      {/*{*/}
                        {/*imageUrl ? (*/}
                          {/*<img src={imageUrl} alt=""/>*/}
                        {/*) : (*/}
                          {/*<div>*/}
                            {/*{this.state.loadingId === record.key ? uploadButton : uploadButtonNone}*/}
                          {/*</div>)*/}
                      {/*}*/}
                    {/*</Upload>*/}
                    {/*{*/}
                      {/*imageUrl ? (*/}
                        {/*<a target="_blank" href={imageUrl} alt="">{languageForProductEdit.View}</a>*/}
                      {/*) : null*/}
                    {/*}*/}
                  {/*</div>*/}
                {/*) : null*/}
              {/*}*/}

            </div>
          );
        },
      },
      {
        title: languageForProductEdit.Operation,
        key: 'action',
        classType: 3,
        render: (text, record, index) => {
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                <a onClick={e => this.saveRow(e, record.key, record)}>{languageForProductEdit.Save}</a>
                  {
                    (!this.state.spuId) || (this.state.spuId === 0) ? (
                      <span>
                        <Divider type="vertical"/>
                        <Popconfirm title={languageForMessage.deleteThisLine} onConfirm={() => this.remove(record.key)}>
                          <a>{languageForProductEdit.Delete}</a>
                        </Popconfirm>
                      </span>
                    ) : (
                      <span>
                        {
                          record.isDelete ? (
                            <span>
                                <Divider type="vertical"/>
                                <Popconfirm title={languageForMessage.deleteThisLine}
                                            onConfirm={() => this.remove(record.key)}>
                                  <a>{languageForProductEdit.Delete}</a>
                                </Popconfirm>
                              </span>
                          ) : null
                        }
                      </span>)

                  }
              </span>
              );
            }
            return (
              <span>
              <a onClick={e => this.saveRow(e, record.key, record)}>{languageForProductEdit.Save}</a>
              <Divider type="vertical"/>
              <a onClick={e => this.cancel(e, record.key)}>{languageForProductEdit.Cancel}</a>
            </span>
            );
          }
          return (
            <span>

            {
              this.props.disabled ? index !== 0 ? (
                  <Checkbox checked={Boolean(Number(record.status))}
                            onChange={e => this.ifSale(e, record.key)}>{languageForProductEdit.Sale}</Checkbox>
                ) : null
                :
                (
                  <a onClick={e => this.toggleEditable(e, record.key)}>{languageForProductEdit.Edit}</a>
                )
            }
              {
                isAdd ? (
                    <span>
                    {
                      dataSource.length <= 2
                        ?
                        null
                        :
                        <span>
                        {
                          record.name !== languageForProductEdit.attributeName
                            ?
                            <span>
                                <Divider type="vertical"/>
                                <Popconfirm title={languageForMessage.deleteThisLine}
                                            onConfirm={() => this.remove(record.key)}>
                                  <a>{languageForProductEdit.Delete}</a>
                                </Popconfirm>
                              </span>
                            :
                            null
                        }
                      </span>
                    }
                  </span>
                ) : (
                  <span>
                    {
                      record.isDelete
                        ?
                        <span>
                          <Divider type="vertical"/>
                          <Popconfirm title={languageForMessage.deleteThisLine}
                                      onConfirm={() => this.remove(record.key)}>
                            <a>{languageForProductEdit.Delete}</a>
                          </Popconfirm>
                        </span>
                        :
                        null
                    }
                  </span>
                )
              }
          </span>
          );
        },
      },
    ];
    const languageInput = language.map((item,index) => {
      return {
        title: goodsEditorLanguage(item,languageForGlobal),
        dataIndex: item,
        key: item,
        classType: 3,
        render: (text) => {
          return (
            <Form.Item>
              {
                getFieldDecorator(`propertyConfig.lang.${item}`,{

                })(
                  <Input />
                )
              }
            </Form.Item>
          );
        },
      }
    })
    columns.splice(2,0,languageInput)
    return (
      <div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
        <Button
          className={styles.skuDeleteButton}
          style={{}}
          type="dashed"
          // onClick={this.newMember}
          icon="plus"
          disabled={this.props.disabled}
        >
          {languageForProductEdit.AddaNewAttribute}
        </Button>
      </div>
    );
  }
}
