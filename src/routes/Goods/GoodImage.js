import React, { PureComponent } from 'react';
import { Form, Upload, Button, Icon } from 'antd';
import {connect} from "dva";
function dir(target,elem) {
  const classNameArr = target.className.split(' ');
  for(var i=0;i<classNameArr.length; i++){
    if(classNameArr.indexOf(elem) >-1){
      return target;
    }
  }
  if(target.nodeType !== 9){
    const parentClassNameArr = target.parentNode.className.split(' ');
    if(parentClassNameArr.indexOf(elem)>-1){
      return target.parentNode;
    }else {
      return dir(target.parentNode,elem);
    }
  }else {
    return '';
  }
};


const FormItem = Form.Item;
@Form.create()
@connect(state => ({
  global: state.global,
}))
export default class GoodImage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mouseSwitch: true,//控制鼠标的开关,默认打开，按下去则关闭
      positions:[],
      startPosition:{},
      startIndex:-1,
      bar:'',
      isOneTime: true,
      imageWidth: 120,//盒子宽度
      imageHeight: 70,//盒子高度
      animationOpen: false,
    };
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.imageAddSuccess){
      this.getElementPosition();
      this.props.closeAddStatus();
    }
  }

  componentDidMount () {
    const { styles, goodsPicProps } = this.props;

//    this.getElementPosition();
    setTimeout(() => {
      this.getElementPosition();
    },2000);
//    window.addEventListener('resize', this.getElementPosition);
    document.querySelector(`.${styles.uploadImage}`).addEventListener('mousedown', this.documentMouseDownHandle);
    document.addEventListener('mouseup', this.mounseUpHandle);
    document.addEventListener('mousemove', this.mounseMoveHandle);
  }

  componentWillUnmount () {
    const { styles } = this.props;
    const imagebox = document.querySelectorAll(`.${styles.uploadImage} .ant-upload-list-item`);
    document.querySelector(`.${styles.uploadImage}`).removeEventListener('mousedown', this.documentMouseDownHandle);
    document.removeEventListener('mouseup',this.mounseUpHandle);
    document.removeEventListener('mousemove',this.mounseMoveHandle);
    for(let i =0; i<imagebox.length; i++) {
      imagebox[i].removeEventListener('mousedown',this.mounseDownHandle);
    }
  }

  documentMouseDownHandle = () => {
    this.getElementPosition();
  }

  mounseDownHandle = (index,e) => {
    const elem = dir(e.target,'ant-upload-list-item');
    this.setState({
      mouseSwitch : false,
      startPosition: {
        x:e.clientX,
        y:e.clientY,
      },
      startIndex:index,
      bar: elem,
    })
    if(this.state.isOneTime){
      this.setState({
        isOneTime: false,
      })
    }
    e.stopPropagation();
    e.preventDefault();
  }

  mounseMoveHandle = (e) => {
    const { mouseSwitch, startPosition, bar } = this.state;
    if(!mouseSwitch){
      this.setState({
        animationOpen: false,
      })
      const mousePosition = {
        x:e.clientX,
        y:e.clientY,
      }
      const moveX = mousePosition.x-startPosition.x;
      const moveY = mousePosition.y-startPosition.y;
      bar.style.transform = 'translate3d('+moveX+'px,'+moveY+'px,0px)';
      bar.style.zIndex = 9;
    }
//    e.preventDefault();
    e.stopPropagation();
  }

  mounseUpHandle = (e) => {
    const { bar, startIndex, positions, mouseSwitch } = this.state;
    if(!mouseSwitch){
      const endPosition = {
        x: e.clientX,
        y: e.clientY,
      }
      this.setState({
        animationOpen: true,
      })
      setTimeout(() => {
        this.setState({
          animationOpen: false,
        })
        this.getElementPosition();
      },200)
      for(let i =0; i<positions.length; i++) {
        if(positions[i].left<endPosition.x && endPosition.x<positions[i].right && positions[i].top<endPosition.y && endPosition.y<positions[i].bottom){
          this.props.positionExchange(startIndex,i);
          break;
        }
      }
      bar.style.transform = 'translate3d(0px,0px,0px)';
      bar.style.zIndex = 1;
      this.setState({
        startIndex: -1,
        mouseSwitch : true,
      })
    }
//    e.preventDefault();
    e.stopPropagation();
  }

  getElementPosition = () => {
    const { positions, imageWidth, imageHeight } = this.state;
    const { styles } = this.props;
    const imagebox = document.querySelectorAll(`.${styles.uploadImage} .ant-upload-list-item`);
//    const elem = document.querySelectorAll('.ant-upload-list-picture')[1].getBoundingClientRect();
    for(let i =0; i<imagebox.length; i++) {
      imagebox[i].removeEventListener('mousedown',this.mounseDownHandle);
      imagebox[i].addEventListener('mousedown',this.mounseDownHandle.bind(this,i));
      const currentPosition = imagebox[i].getBoundingClientRect();
      positions[i] = {
        left:currentPosition.left,
        right: currentPosition.left + imageWidth,
        top:currentPosition.top,
        bottom: currentPosition.top + imageHeight,
      }
    }
    this.setState({
      positions: positions,
    })
  }

  render(){
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const languageForMessage = this.props.global.languageDetails.message;
    const { formItemLayout, initialValue, goodsPicProps, styles, getFieldDecorator } = this.props;
    return (
      <FormItem
        label={languageForProductEdit.productImage}
        {...formItemLayout}
      >
        <div className={styles.uploadImage}>
          {getFieldDecorator('goodsIcon', {
            rules: [
              {
                required: true,
                message: languageForMessage.mainImages,
              },
            ],
            initialValue: initialValue,
            getValueFromEvent: this.normFile,
          })(
            <Upload {...goodsPicProps} onPreview={ (file,e) => {
              return;
            }}>
              <Button>
                <Icon type="upload" /> {languageForProductEdit.uploadProductImages}
              </Button>
            </Upload>
          )}
          <div className={styles.gooodsPicDesc}>
            {languageForProductEdit.uploadPromit}
          </div>
        </div>
      </FormItem>
    )
  }
}
