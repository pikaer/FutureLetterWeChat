const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showChatModal: false,
    currentMoment: {},
    momentText1: "",
    momentText2: "",
    momentText3: "",
    momentText4: "",
    momentText5: "",
    momentText6: "",
    momentText7: "",
    momentText8: "",
    momentText9: "",
    nineMoment1: {},
    nineMoment2: {},
    nineMoment3: {},
    nineMoment4: {},
    nineMoment5: {},
    nineMoment6: {},
    nineMoment7: {},
    nineMoment8: {},
    nineMoment9: {},
    tempGender: 3,
    statusBarHeight: app.globalData.statusBarHeight,
  },

  onLoad: function(options) {
    this.initData();
  },

  //返回上一级页面。
  backUpAction: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  toHomeAction: function() {
    wx.switchTab({
      url: "../../pages/discovery/discovery"
    })
  },

  toShowChatModal: function(ops) {
    let index = ops.currentTarget.dataset.momentindex;
    if (index == 1) {
      this.setData({
        currentMoment: this.data.nineMoment1
      })
    }
    if (index == 2) {
      this.setData({
        currentMoment: this.data.nineMoment2
      })
    }
    if (index == 3) {
      this.setData({
        currentMoment: this.data.nineMoment3
      })
    }
    if (index == 4) {
      this.setData({
        currentMoment: this.data.nineMoment4
      })
    }
    if (index == 5) {
      this.setData({
        currentMoment: this.data.nineMoment5
      })
    }
    if (index == 6) {
      this.setData({
        currentMoment: this.data.nineMoment6
      })
    }
    if (index == 7) {
      this.setData({
        currentMoment: this.data.nineMoment7
      })
    }
    if (index == 8) {
      this.setData({
        currentMoment: this.data.nineMoment8
      })
    }
    if (index == 9) {
      this.setData({
        currentMoment: this.data.nineMoment9
      })
    }
    if (app.isBlank(this.data.currentMoment)) {
      return;
    }
    this.setData({
      showChatModal: true
    })
  },

  hideChatModal: function() {
    this.setData({
      showChatModal: false
    })
  },

  nextPageData: function() {
    this.nineMoment();
  },

  initData: function() {
    let cacheKey = "ninePageMomentCacheKey";
    let cacheValue = wx.getStorageSync(cacheKey);
    if (app.isBlank(value) || value.isEmpty) {
      this.nineMoment();
    }else{
      this.nineMomentDataRefresh(cacheValue);
    }
  },

  nineMomentDataRefresh: function(value) {
    if (app.isBlank(value)||value.isEmpty) {
      return;
    }
    this.setData({
      nineMoment1: value.moment1,
      nineMoment2: value.moment2,
      nineMoment3: value.moment3,
      nineMoment4: value.moment4,
      nineMoment5: value.moment5,
      nineMoment6: value.moment6,
      nineMoment7: value.moment7,
      nineMoment8: value.moment8,
      nineMoment9: value.moment9
    })
    if (!app.isBlank(value.moment1)) {
      this.setData({
        momentText1: value.moment1.textContent
      })
    }
    if (!app.isBlank(value.moment2)) {
      this.setData({
        momentText2: value.moment2.textContent
      })
    }
    if (!app.isBlank(value.moment3)) {
      this.setData({
        momentText3: value.moment3.textContent
      })
    }
    if (!app.isBlank(value.moment4)) {
      this.setData({
        momentText4: value.moment4.textContent
      })
    }
    if (!app.isBlank(value.moment5)) {
      this.setData({
        momentText5: value.moment5.textContent
      })
    }
    if (!app.isBlank(value.moment6)) {
      this.setData({
        momentText6: value.moment6.textContent
      })
    }
    if (!app.isBlank(value.moment7)) {
      this.setData({
        momentText7: value.moment7.textContent
      })
    }
    if (!app.isBlank(value.moment8)) {
      this.setData({
        momentText8: value.moment8.textContent
      })
    }
    if (!app.isBlank(value.moment9)) {
      this.setData({
        momentText9: value.moment9.textContent
      })
    }
  },

  //获取用户基础信息
  nineMoment: function() {
    let self = this;
    app.httpPost(
      'Letter/NineMoment', {
        "UId": app.globalData.apiHeader.UId,
        "Gender": self.data.tempGender
      },
      function(res) {
        let cacheKey = "ninePageMomentCacheKey";
        self.nineMomentDataRefresh(res);
        app.setCache(cacheKey, res);
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },
})