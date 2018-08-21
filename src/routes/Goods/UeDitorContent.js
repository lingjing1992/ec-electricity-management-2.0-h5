import React from 'react';
import { Form, Radio, Input } from 'antd';
import styles from './GoodsCreate.less';
import { goodsEditorLanguage } from '../../utils/utils';
import Ueditor from '../../components/ueditor';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
class SizeTable extends React.Component {
  state = {
    tabKey: 'en',//商品详情tab key
  }
  render(){
    const { language, languageDetails, getContent, value, valueKey, id } = this.props;
    const languageForGlobal = languageDetails.global;
    return (
      <div>
        <RadioGroup
          defaultValue={language[0]}
          value={this.state.tabKey}
          style={{marginTop: 4, marginBottom: 10}}
          onChange={(e) => {
            this.setState({
              tabKey: e.target.value
            })
          }}>
          {
            language.map((item,index) => {
              return (
                <RadioButton value={item} key={index}>{goodsEditorLanguage(item, languageForGlobal)}</RadioButton>
              )
            })
          }
        </RadioGroup>
        {
          language.map((item,index) => {
            return (
              <div key={index} style={{display: item === this.state.tabKey ? 'block' : 'none'}}>
                <Ueditor
                  getContent={getContent}
                  language={item}
                  id={`${item}${id}`}
                  height="400"
                  value={value[valueKey] && value[valueKey][item]}
                />
              </div>
            )
          })
        }
      </div>
    )
  }
}
export default SizeTable;
