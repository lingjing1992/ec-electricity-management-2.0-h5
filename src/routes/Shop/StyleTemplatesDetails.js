import React, { Component } from 'react';
import styles from './StyleTemplatesDetails.less';
import { routerRedux, Link } from 'dva/router';
import { connect } from 'dva';
import { getQueryString, setStateObjectKey, scrollToEvent, offset } from '../../utils/utils';
import { Button, Icon, Modal, Select, notification, Form, Card, Spin } from 'antd';
import BannerTemplate103 from './Tempalte/Banner-103';
import StoreTemplate701 from './Tempalte/StoreInfo-701';
import ProductTemplate303 from './Tempalte/ProductTemplate-303';
import ProductSelect from './Tempalte/ProductsSelect';
import FooterToolbar from '../../components/FooterToolbar';

const Option = Select.Option
const FormItem = Form.Item;
@connect(state => ({
    shop: state.shop,
    global: state.global
}))

export default class StyleTemplatesDetails extends Component {
    state = {
        data: {},
        selectedGoodsList: [],
        selectedCard: {},
        selectedIndex: -1,
        searchGoodsList: [],
        bannerKey: '',
        visible: false,
        backVisible: false,
        tableData: [],
        searchType: 2,
        searchKey: '',
        currentPage: 1,
        selectRowKey: [],
        //编辑卡片距离顶部距离
        cardMarginTop: 0,
        bannerLoading: false,
    }

    componentWillMount() {
        this.init();
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        window.onscroll = null
    }

    init = () => {
        this.loadData();
    }
    //加载初始
    loadData = () => {
        const viewId = getQueryString().viewId;
        this.props.dispatch({
            type: 'shop/templateDetail',
            payload: { viewId: Number(viewId) },
            callback: (data) => {
                this.setState({
                    data: data.data,
                    selectedCard: data.data.cards[0] || {},
                    selectedIndex: data.data.cards[0] ? 0 : -1,
                })
                this.asyncSetEidtModuleTop(0)
                setTimeout(() => {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }, 500)
            }
        });
    }
    //异步设置编辑模块距离顶部距离
    asyncSetEidtModuleTop = (index) => {
        setTimeout(() => {
            this.setState({
                cardMarginTop: offset(document.querySelector('.cardsItem' + index)).top - 88,
            })
        }, 0)
    }
    //正在编辑模块内容存储到state.data中
    saveCardData = () => {

        const { editTemplate } = this.props.global.languageDetails
        const { selectedCard, selectedIndex, data } = this.state
        if (selectedIndex === -1) return false
        if (selectedCard.cardType === 103) {
            let key = ['', 'spuId', 'viewId', 'url'][selectedCard.info.type]

            if (key === 'spuId' || key === 'viewId') {
                if (!/^[0-9]*$/.test(selectedCard.info[key])) {
                    notification.error({
                        message: editTemplate.purenumbers
                    })
                    document.querySelector(`.${styles.bannerInput}`).focus();
                    return true
                }
            }
        }

        let tempData = data
        if (this.state.data.cards.length === 0) {
            tempData.cards.push(selectedCard)
        } else {
            tempData.cards[selectedIndex] = selectedCard
        }
        this.setState({
            data: tempData
        })
    }

    //点击模块编辑
    cardsItemClickHandle = (item, index) => {
        if (this.saveCardData()) return
        console.log(item, index);
        this.setState({
            selectedCard: item,
            selectedIndex: index
        })
        if (item.cardType == 303) {
            this.setState({
                selectedGoodsList: item.spus
            })
        }
        this.domSolve(index);
    }

    //新建或者编辑的dom处理，滑到目标，且编辑卡片也在目标位置
    domSolve = (index) => {
        this.asyncSetEidtModuleTop(index);
        scrollToEvent('.cardsItem' + index, 80);
    }


    // 展示模板模块
    renderTemplateView = () => {
        const cards = this.state.data.cards
        const renderCard = () => {
            return cards.map((item, index) => {
                let temp
                if (index === this.state.selectedIndex) {
                    item = this.state.selectedCard
                }
                // banner
                if (item.cardType === 103) {
                    temp = (
                        <Spin spinning={this.props.shop.bannerLoading}>
                            <div className={`${styles.banner} ${item.info.banner ? styles.bannerHeight : styles.bannerNull}`}>
                                {item.info.banner ? <img src={item.info.banner} /> : ''}
                            </div>
                        </Spin>)
                }

                // 店铺名称
                if (item.cardType === 701) {
                    temp = (
                        <div className={styles.shopWrap}>
                            <Spin spinning={this.props.shop.storeLogoLoing}>
                                <div className={styles.logo}>
                                    {item.info.banner ? <img src={item.info.banner} /> : ''}
                                </div>
                            </Spin>
                            <div className={styles.name}>{item.info.name}</div>
                        </div>)
                }

                // 商品模块
                if (item.cardType === 303) {
                    temp = (
                        <div
                            className={`clearfix ${styles.content} ${item.spus.length > 0 ? styles.contentHeight : styles.contentNull}`}>
                            {/*默认渲染两个占位盒子*/}
                            <div className={styles.goodsWrap}>
                                <div className={styles.goodsImgWrap}>
                                    {
                                        item.spus.length > 0 ? (<img src={item.spus[0].icon} alt="" />) : null
                                    }
                                </div>
                                {
                                    item.spus.length > 0 ? (
                                        <div>
                                            <p className={styles.title}>{item.spus[0].name}</p>
                                            <p className={styles.price}>{item.spus[0].discountPriceDesc}</p>
                                        </div>
                                    ) : null
                                }
                            </div>
                            <div className={styles.goodsWrap}>
                                <div className={styles.goodsImgWrap}>
                                    {
                                        item.spus.length > 1 ? (<img src={item.spus[1].icon} alt="" />) : null
                                    }
                                </div>
                                {
                                    item.spus.length > 1 ? (
                                        <div>
                                            <p className={styles.title}>{item.spus[1].name}</p>
                                            <p className={styles.price}>{item.spus[1].discountPriceDesc}</p>
                                        </div>
                                    ) : null
                                }
                            </div>
                            {/*其他商品*/}
                            {
                                item.spus.length > 0 && item.spus.map((item, index) => {
                                    if (index > 1) {
                                        return (
                                            <div key={index} className={styles.goodsWrap}>
                                                <div className={styles.goodsImgWrap}>
                                                    <img src={item.icon} alt="" />
                                                </div>
                                                <p className={styles.title}>{item.name}</p>
                                                <p className={styles.price}>{item.discountPriceDesc}</p>
                                            </div>
                                        )
                                    }
                                    return null;
                                })
                            }
                        </div>)
                }
                const calssName = index === this.state.selectedIndex ? `${styles.cardsItem} ${styles.selectedCard}` : styles.cardsItem;
                const storeClassName = item.cardType === 701 ? styles.storeCard : '';
                return (
                    <Card
                        key={index}
                        onClick={this.cardsItemClickHandle.bind(this, item, index)}
                        className={`${calssName} ${storeClassName} ${"cardsItem" + index}`}
                    >
                        <span onClick={(e) => {
                            this.delCardItem(e, index)
                        }}>
                            <Icon type="close" className={styles.clsoeBtn} />
                        </span>
                        {temp}
                    </Card>)
            })
        }
        return renderCard()
    }

    // 编辑模板模块
    renderEditTemplate = () => {
        let temp
        const card = this.state.selectedCard;
        if (!card.hasOwnProperty('cardType')) return;
        if (card.cardType === 103) {
            temp = (
                <BannerTemplate103
                    resource={this.state.selectedCard}
                    onSetState={this.handleStateChange}
                />
            )
        }
        if (card.cardType === 701) {
            // temp = renderFBCard()
            temp = (
                <StoreTemplate701
                    resource={this.state.selectedCard}
                    onSetState={this.handleStateChange}
                />
            )
        }
        if (card.cardType === 303) {
            // temp = renderGoodsCard()
            temp = (
                <ProductTemplate303
                    resource={this.state.selectedCard}
                    onSetState={this.handleStateChange}
                    onSelectGoods={this.handleVisible}
                />
            )
        }
        return (
            <Card style={{ marginTop: this.state.cardMarginTop }}>
                {temp}
            </Card>
        )
    }

    /**
     * 添加模块
     * @param {S} cardType
     */
    addModle = (cardType) => {
        let data = this.state.data
        const _this = this;
        if (cardType === 103) {
            const banner = {
                cardType: 103,
                info: {
                    type: 0,
                    viewId: '',
                    spuId: '',
                    url: '',
                    name: '',
                    banner: ''
                }
            }
            data.cards.push(banner)
            this.setState({
                data,
                selectedCard: banner,
                selectedIndex: data.cards.length - 1
            })
        }

        if (cardType === 303) {
            const goods = {
                cardType: 303,
                spus: []
            }
            data.cards.push(goods)
            this.setState({
                data,
                selectedCard: goods,
                selectedIndex: data.cards.length - 1
            })
        }

        if (cardType === 701) {
            const shopName = {
                cardType: 701,
                info: {
                    name: '',
                    banner: ''
                }
            }
            data.cards.push(shopName)
            this.setState({
                data,
                selectedCard: shopName,
                selectedIndex: data.cards.length - 1
            })
        }
        setTimeout(() => {
            _this.domSolve(data.cards.length - 1)
        }, 100)
    }

    //删除模块
    delCardItem = (e, index) => {
        e.stopPropagation()
        let data = Object.assign({}, this.state.data)
        let cards = data.cards.filter((item, i) => i !== index)
        data.cards = cards
        this.setState({
            data: data,
            selectedCard: {},
            selectedIndex: -1
        })
    }

    //关闭弹窗
    dialogCanselHandel = () => {
        // const { selectedGoodsList } = this.state;
        this.setState({
            visible: false,
            selectRowKey: [],
        })
    }

    //确认选择商品
    dialogConfirmHandel = () => {
        this.handleSelectGoods();
        this.dialogCanselHandel()
    }

    //选择商品
    handleSelectGoods = () => {
        const { selectedCard } = this.state;
        console.log(this.state.selectRowKey);
        this.props.dispatch({
            type: 'marketing/getDiscountBriefSpuList',
            payload: {
                pageSize: 1,
                pageNum: 1,
                status: -1,
                sort: -1,
                filter: 2,
                keyword: '',
                selectSpuIds: this.state.selectRowKey,
            },
            callback: (data) => {
                if (data.status === 200) {
                    this.setState({
                        selectedCard: {
                            ...selectedCard,
                            spus: selectedCard.spus.concat(data.data.selectInfoList),
                        }
                    })
                }
            }
        });
    }

    //弹窗打开
    handleVisible = () => {
        this.setState({
            visible: true,
        })
    }


    //保存模板
    saveTemplate = () => {
        const { editTemplate } = this.props.global.languageDetails;
        if (this.saveCardData()) return;
        this.props.dispatch({
            type: 'shop/updateTemplate',
            payload: this.state.data,
            callback: (data) => {
                if (data.status == 200) {
                    notification.success({
                        message: editTemplate.Saved,
                    })
                } else {
                    notification.Error({
                        message: data.msg,
                    })
                }
            }
        })
    }

    //返回模板列表
    backList = () => {
        this.props.dispatch(routerRedux.push('/shop/PromoList'));
    }

    backDialogCanselHandel = () => {
        this.setState({
            backVisible: false
        })
    }

    //修改state数据
    handleStateChange = (objectName, result) => {
        if (typeof result === 'object' && typeof result.length !== 'number') {
            setStateObjectKey(this, objectName, result);
        } else {
            this.setState({
                [objectName]: result,
            })
        }

        console.log(this.state.selectedCard);
    }

    render() {
        const data = this.state.data.cards
        const { visible, backVisible } = this.state
        const { editTemplate, header } = this.props.global.languageDetails

        return (
            <div style={{ overflow: 'hidden', position: 'relative' }}>
                {/*<Card className="breadcrumb-box">*/}
                {/*<Breadcrumb>*/}
                {/*<Breadcrumb.Item>*/}
                {/*<Link to="/shop/PromoList">{header.template}</Link>*/}
                {/*</Breadcrumb.Item>*/}
                {/*<Breadcrumb.Item>{header.templateDetails}</Breadcrumb.Item>*/}
                {/*</Breadcrumb>*/}
                {/*</Card>*/}
                <div id={styles.templateDetail}>
                    {data ? (
                        <div className="clearfix">
                            <div className={styles.templateWrap}>
                                {/*基础添加组件按钮*/}
                                <Card className={styles.btnWrap}>
                                    <p>{editTemplate.BasicModule}</p>
                                    <div>
                                        <Button type="primary" className={styles.addBtn}
                                            onClick={this.addModle.bind(this, 103)}>Banner</Button>
                                        <Button type="primary" className={styles.addBtn}
                                            onClick={this.addModle.bind(this, 303)}>{editTemplate.Shop}</Button>
                                    </div>
                                    <p>{editTemplate.Others}</p>
                                    <div>
                                        <Button type="primary" className={styles.addBtn}
                                            onClick={this.addModle.bind(this, 701)}>{editTemplate.shopInformation}</Button>
                                    </div>
                                </Card>
                                {/*模板视图*/}
                                {this.renderTemplateView()}
                            </div>
                            <div className={styles.editTempWrap}>
                                {/*模板详情*/}
                                {this.renderEditTemplate()}
                            </div>
                        </div>) : ''}
                </div>
                <FooterToolbar>
                    <div style={{ float: 'right' }}>
                        {/*{getErrorInfo()}*/}
                        <Button onClick={() => {
                            this.props.dispatch(routerRedux.go(-1));
                        }} style={{ border: 'none' }}>
                            {editTemplate.Cancel}
                        </Button>
                        <Button type="primary" onClick={this.saveTemplate} style={{ marginLeft: 0 }}>
                            {editTemplate.Sure}
                        </Button>
                    </div>
                </FooterToolbar>
                <Modal
                    visible={visible}
                    title={editTemplate.product}
                    className={styles.tableModal}
                    onOk={this.dialogConfirmHandel}
                    onCancel={this.dialogCanselHandel}
                    width={'80%'}
                >
                    {/*{this.renderTable()}*/}
                    <ProductSelect
                        selectedGoodsList={this.state.selectedGoodsList}
                        selectedCard={this.state.selectedCard}
                        selectRowKey={this.state.selectRowKey}
                        onSetState={this.handleStateChange}
                        visible={this.state.visible}
                    />
                </Modal>

                <Modal
                    visible={backVisible}
                    title={editTemplate.operationTips}
                    onOk={this.backList}
                    onCancel={this.backDialogCanselHandel}
                >
                    {editTemplate.suretoleave}
                </Modal>
            </div>
        );
    }
}
