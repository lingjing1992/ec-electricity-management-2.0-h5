## 商品列表 GoodsList

- 上架
- 下架
- 搜索
- 新建商品
- 导入
- 子SKU
- SKU属性值

## 新增/编辑 GoodsCreate
### （特别注意：这个模块很复杂）如果没必要就不要维护了。
``
新建编辑都是一个页面，通过spuId判断
spu_id: spuId || 0,
0为新建，有值为创建。
商品类目为三级
SPU属性为多选
SPU属性和自定义分2个模块
SKU信息都是用的组件，详情参考antd-pro
————————
这个模块是多语言，多货币。新增和编辑请求的接口是不一样的。编辑需要回选
详情可以找赞正或者永林对接下。
``
### GoodsCreate 组件描述
- TableForm SKU属性
- SkuTableForm SKU销售信息
- SkuCommonTableForm SKU其它信息
- SpuTableForm 自定义SPU属性

## SKU列表 SkuList

- 搜索
- 列表
