import React, { Component } from 'react';
import {
  Form, Select, InputNumber, Switch, Radio,
  Slider, Button, Upload, Icon, Rate, Checkbox,
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
import { connect } from 'dva';

@Form.create()
export default class DateTest extends Component {
  state = {
    data: [
      {
        attrName: '材质（上部）',
        attrValue: [
          { label: 'Apple-1', value: 'Apple' },
          { label: 'Pear-1', value: 'Pear' },
          { label: 'Orange-1', value: 'Orange', disabled: false },
        ],
        initialValue: ['Apple'],
      },
      {
        attrName: '使用场合（多选项）',
        attrValue: [
          { label: 'Apple-1', value: 'Apple' },
          { label: 'Pear-1', value: 'Pear' },
          { label: 'Orange-1', value: 'Orange', disabled: false },
        ],
        initialValue: ['Apple', 'Pear'],
      },
    ],
  }
  onChange = (checkedValues) => {
    console.log('checked = ', checkedValues);
  }
  handleSubmit = (e) => {
    const newData = [...this.state.data];

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Object.keys(values).map((valuesItem) => {
          newData.map((item, index) => {
            console.log('item.attrName==valuesItem', item.attrName, valuesItem);
            if (item.attrName == valuesItem) {
              item.initialValue = values[item.attrName];
            }
            console.log('values[item.attrName]', values[item.attrName]);
          });
        });

        this.setState({
          data: [...newData],
        });

        console.log('data', this.state.data);
        console.log('newData', newData);
        console.log('Received values of form: ', values);
      }
    });
  }
  render() {
    const optionsWithDisabled = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange', disabled: false },
    ];
    const optionsWithDisabled2 = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange', disabled: false },
    ];
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };


    /**
     * 规范约定
     * @type {[null,null]}
     */
    // const data = [
    //   {
    //     attrName: '材质（上部）',
    //     attrValue: [
    //       { label: 'Apple-1', value: 'Apple' },
    //       { label: 'Pear-1', value: 'Pear' },
    //       { label: 'Orange-1', value: 'Orange', disabled: false },
    //     ],
    //     initialValue: ['Apple'],
    //   },
    //   {
    //     attrName: '使用场合（多选项）',
    //     attrValue: [
    //       { label: 'Apple-1', value: 'Apple' },
    //       { label: 'Pear-1', value: 'Pear' },
    //       { label: 'Orange-1', value: 'Orange', disabled: false },
    //     ],
    //     initialValue: ['Apple', 'Pear'],
    //   },
    // ];


    console.log('data', this.state.data);

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            wrapperCol={{ span: 12, offset: 6 }}
          >
            <Button type="primary" htmlType="submit">Submit</Button>
          </FormItem>

          {
            this.state.data.map((item, index) => {
              return (
                <FormItem
                  {...formItemLayout}
                  label={item.attrName}
                >
                  {getFieldDecorator(`${item.attrName}`, {
                    rules: [
                      { required: true, message: 'Please select your country!' },
                    ],
                    initialValue: item.initialValue,
                  })(
                    <CheckboxGroup
                      options={item.attrValue}
                      onChange={this.onChange}
                    />
                  )}
                </FormItem>
              );
            })
          }
        </Form>
      </div>
    );
  }
}
