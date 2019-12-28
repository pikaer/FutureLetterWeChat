//获取应用实例
const app = getApp()
Page({
  data: {
    totalCoin: 0,
    showModal: false
  },

  onLoad: function(options) {
    this.initData();
  },

  onShow: function (options) {
    this.getTotalCoin();
  },

  //数据初始化
  initData: function() {
    try {
      let cacheKey = "basicUserInfo+" + app.globalData.apiHeader.UId;
      let cacheValue = wx.getStorageSync(cacheKey);
      if (!app.isBlank(cacheValue) && cacheValue.totalCoin > 0) {
        this.setData({
          totalCoin: cacheValue.totalCoin
        });
      }
    } catch (e) {
      console.error("coinPage:数据初始化异常");
    }
  },


  //获取我扔出去的没有被评论的动态
  getTotalCoin: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/UserCoinInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          console.info("获取用户金币信息成功！")
          self.setData({
            totalCoin: res.totalCoin
          });
        },
        function(res) {
          console.error("获取用户金币信息失败！");
        })
    }
  },

  //发布动态
  publishMoment: function() {
    wx.navigateTo({
      url: '../../pages/publishmoment/publishmoment?hasImg=false'
    })
  },

  toSharePage: function() {
    wx.showToast({
      title: "功能开发中，敬请期待",
      icon: 'none',
      duration: 1500
    });
  },

  //发布动态
  toCoinDetail: function() {
    wx.navigateTo({
      url: '../../pages/coindetail/coindetail'
    })
  },

  //获取用户基础信息
  toShowModal: function(ops) {
    this.setData({
      showModal: true
    });
  },

  hideModal: function() {
    this.setData({
      showModal: false
    });
  },

  //分享功能
  onShareAppMessage: function (res) {
    return {
      title: "最懂你的灵魂，即将与你相遇",
      imageUrl: "",
      path: "/pages/discovery/discovery",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
  
})