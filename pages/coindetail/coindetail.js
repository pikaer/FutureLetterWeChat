//获取应用实例
const app = getApp()

Page({
  data: {
    tempIncomeDetailList: [],
    tempExpendDetailList: [],
    currentTab: 0, //当前所在tab
    indicatorDots: false, //底部不展示小点
    vertical: false, //水平翻页
    autoplay: false, //自动翻页
    circular: false, //循环播放
    interval: 2000,
    duration: 500, //翻页时间间隔
    previousMargin: 0, //前边距
    nextMargin: 0, //后边距
  },

  onShow: function() {
    this.getCoinDetailList();
  },

  // 滑动切换tab
  bindChange: function(e) {
    this.setData({
      currentTab: e.detail.current
    });
  },

  //tab切换至收入
  toIncomeDetailList: function(e) {
    this.setData({
      currentTab: 0
    });
    this.getCoinDetailList();
  },

  //tab切换至支出
  toExpendDetailList: function(e) {
    this.setData({
      currentTab: 1
    });
    this.getCoinDetailList();
  },

  //获取金币明细列表
  getCoinDetailList: function() {
    var self = this;
    let cacheKey = "incomeDetailList+" + app.globalData.apiHeader.UId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      console.info("金币明细缓存获取成功" + JSON.stringify(cacheValue))
      self.setData({
        tempIncomeDetailList: cacheValue.incomeDetailList,
        tempExpendDetailList: cacheValue.expendDetailList
      });
    }

    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/CoinDetail', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          console.info("获取金币明细列表成功！")
          self.setData({
            tempIncomeDetailList: res.incomeDetailList,
            tempExpendDetailList: res.expendDetailList
          });
          app.setCache(cacheKey, res);
        },
        function(res) {
          console.error("获取金币明细列表失败！");
        })
    }
  },

})