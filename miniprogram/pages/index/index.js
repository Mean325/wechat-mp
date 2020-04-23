const utils = require("../../utils/utils.js");
const commonJs = require("../common.js");

const app = getApp();

Page({
  data: {
    todayAmount: 0,   // 今日总额
    monthAmount: 0,   // 本月总额
    todayBill: [],    // 今日账单
    moreBill: [],    // 本月账单

    statusBarHeight: getApp().globalData.deviceInfo.statusBarHeight,   // 获取全局变量的导航栏高度
    slideButtons: [{
      type: 'warn',
      text: '删除'
    }],   // 左滑删除组件
  },
  // onLoad() {
  //   this.getTodayBill();
  // },
  onShow() {
    this.getAccountBook();
  },
  /**
   * 分别获取今日账单和月账单,用于数据显示
   * @method 获取账单列表
   */
  getAccountBook() {
    this.getTodayBill();
    this.getMoreBill();
  },
  /**
   * @method 获取今日账单列表
   */
  getTodayBill() {
    let date = utils.getDate();
    // let time = new Date().getTime();
    // let date = time.formatTime(timestamp).split(' ')[0];   // 获取当前日期

    wx.cloud.callFunction({
      name: 'getAccountBook',
      data: {
        date,
        dateType: 3,  // 日期类型,1为年,2为月,3为日 
      }
    })
      .then(res => {
        let data = res.result.list;
        if (data.length) {
          let amount = 0;
          let categoryList = app.globalData.categoryList;
          data.forEach(item => {
            amount += item.num;
            let category = categoryList.find(n => item.category === n._id);
            item.categoryName = category.name;
            item.categoryIcon = category.icon;
          })
          this.setData({
            todayAmount: amount,
            todayBill: data.slice(0, 3)
          })
        }
      })
      .catch(console.error)
  },
  /**
   * @method 获取月账单列表
   */
  getMoreBill() {
    // let time = new Date().getTime();
    let date = utils.getDate();
    // let date = time.formatTime(timestamp).split(' ')[0];   // 获取当前日期

    wx.cloud.callFunction({
      name: 'getAccountBook',
      data: {
        date,
        dateType: 2,  // 日期类型,1为年,2为月,3为日
        previous: 3,
      }
    })
      .then(res => {
        let data = res.result;
        console.log(data);
        // let data = result.list;
        // console.log(result);
        let categoryList = app.globalData.categoryList;
        
        data.forEach(month => {
          if (month.list.length) {
            month.list.forEach(day => {
              day.list.forEach(item => {
                item.categoryName = categoryList.find(n => item.category === n._id).name;
              })
            })
          }
        })
        console.log(data);
        this.setData({
          monthAmount: 0,
          moreBill: data
        })
      })
      .catch(console.error)
  },
  /**
   * 跳转到账目详情页
   * @method 账单条目点击事件
   */
  toDetail(e) {
    let data = e.currentTarget.dataset.data;
    if (data._id) {
      app.setActiveAccountDetail(data);
      wx.navigateTo({
        url: '/pages/accountDetail/accountDetail'
      })
    }
  },
  /**
   * 调用公共方法删除
   * @method 账单条目右侧删除按钮点击事件
   */
  delAccount(e) {
    let { _id } = e.currentTarget.dataset.data;
    commonJs.delAccount(_id, this.getAccountBook);
  },
})
