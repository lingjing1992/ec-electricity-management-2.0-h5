import React, { PureComponent } from 'react';


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

/**
 *
 * @param {S} boxClassName 可拖拽的元素class名
 * @param {S, N} imageWidth 可拖拽元素宽度
 * @param {S, N} imageHeight 可拖拽元素高度
 * @param {Fn} positionExchange(startIndex, targetIndex)  交换位置的两个元素索引
 */
export default class Drag extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mouseSwitch: true,//控制鼠标的开关,默认打开，按下去则关闭
      positions:[],
      startPosition:{},
      startIndex:-1,
      bar:'',
      isOneTime: true,
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
    const { boxClassName, goodsPicProps } = this.props;

//    this.getElementPosition();
    setTimeout(() => {
      this.getElementPosition();
    },2000);
//    window.addEventListener('resize', this.getElementPosition);
    // document.querySelector(`.dragWrap .${boxClassName}`).addEventListener('mousedown', this.documentMouseDownHandle);
    document.addEventListener('mousedown',this.documentMouseDownHandle)
    document.addEventListener('mouseup', this.mounseUpHandle);
    document.addEventListener('mousemove', this.mounseMoveHandle);
  }

  componentWillUnmount () {
    const { boxClassName } = this.props;
    const imagebox = document.querySelectorAll(`.dragWrap .${boxClassName}`);
    // document.querySelector(`.dragWrap .${boxClassName}`).removeEventListener('mousedown', this.documentMouseDownHandle);
    document.removeEventListener('mousedown',this.documentMouseDownHandle)
    document.removeEventListener('mouseup',this.mounseUpHandle);
    document.removeEventListener('mousemove',this.mounseMoveHandle);
    for(let i =0; i<imagebox.length; i++) {
      imagebox[i].removeEventListener('mousedown',this.mounseDownHandle);
    }
  }

  documentMouseDownHandle = (e) => {
    if (e.target.className === this.props.boxClassName) {
      this.getElementPosition()
    }
  }

  mounseDownHandle = (index,e) => {
    const elem = dir(e.target, this.props.boxClassName);
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
    e.stopPropagation();
//    e.preventDefault();
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
      e.stopPropagation();

    }
//    e.preventDefault();
  }

  getElementPosition = () => {
    console.log('target')
    const {positions} = this.state;
    const {imageWidth, imageHeight, boxClassName} = this.props
    const imagebox = document.querySelectorAll(`.dragWrap .${boxClassName}`) || [];

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
    return (
      <div className="dragWrap">
        {this.props.children}
      </div>
    )
  }
}
