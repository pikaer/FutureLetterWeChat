//获取应用实例
const app = getApp()
Page({
  data: {
    totalCoin: 0,
    showModal: false
  },

  onShow: function (options) {
    this.getTotalCoin();
  },

  //获取我扔出去的没有被评论的动态
  getTotalCoin: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/UserCoinInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function (res) {
          console.info("获取用户金币信息成功！")
          self.setData({
            totalCoin: res.totalCoin
          });
        },
        function (res) {
          console.error("获取用户金币信息失败！");
        })
    }
  },

  //发布动态
  publishMoment: function () {
    wx.navigateTo({
      url: '../../pages/publishmoment/publishmoment'
    })
  },

  toSharePage: function () {
    wx.switchTab({
      url: '/pages/discovery/discovery'
    })
  },

  //发布动态
  toCoinDetail: function () {
    wx.navigateTo({
      url: '../../pages/coindetail/coindetail'
    })
  },

  //获取用户基础信息
  toShowModal: function (ops) {
    this.setData({
      showModal: true
    });
  },

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

})