const app = getApp()

import {
  HubConnection
} from "../../utils/signalR.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showChatModal: false,
    showFilterModal: false,
    currentMoment: {},
    currentIndex: 0,
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
    selectedGender: 3,
    nextCount: 20, //剩余次数
    insertDialogDiscussVlaue: "",
    minAgeValue: 0,
    maxAgeValue: 100,
    rangeValues: [0, 100],
    statusBarHeight: app.globalData.statusBarHeight,
  },

  onLoad: function(options) {
    if (app.globalData.apiHeader.UId > 0) {
      this.initData();
      this.onConnected();
    } else {
      this.userLogin();
    }
    this.initNextCount();
  },

  onRangeChange: function(e) {
    let rangeArry = [e.detail.minValue, e.detail.maxValue]
    this.setData({
      rangeValues: rangeArry,
      minAgeValue: Math.round(e.detail.minValue),
      maxAgeValue: Math.round(e.detail.maxValue)
    });
  },

  //卸载页面
  onUnload: function() {
    console.info("卸载页面，断开连接")
    this.onDisconnected();
  },

  //卸载页面，中断webSocket
  onDisconnected: function() {
    try {
      this.hubConnect.close({
        UId: app.globalData.apiHeader.UId,
        ConnetType: 0
      })
    } catch (e) {
      console.error(JSON.stringify(e));
    }
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

  toPublishMoment: function() {
    wx.navigateTo({
      url: "../../pages/publishtextmoment/publishtextmoment"
    })
  },


  selectedGenderBtn: function(ops) {
    this.setData({
      selectedGender: ops.currentTarget.dataset.gender
    })
  },

  toShowChatModal: function(ops) {
    let index = ops.currentTarget.dataset.momentindex;
    this.setData({
      currentIndex: index
    })
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

  confirmFilterBtn: function() {
    this.setData({
      showFilterModal: false
    })
  },

  toShowFilterModal: function() {
    this.setData({
      showFilterModal: true
    })
  },

  nextPageData: function() {
    this.nineMoment(true);
  },

  initData: function() {
    let cacheKey = "ninePageMomentCacheKey";
    let cacheValue = wx.getStorageSync(cacheKey);
    if (app.isBlank(cacheValue) || cacheValue.isEmpty) {
      this.nineMoment(false);
    } else {
      this.nineMomentDataRefresh(cacheValue);
    }
  },

  //连接WebSocket
  onConnected: function() {
    if (app.globalData.apiHeader.UId <= 0) {
      return;
    }
    this.hubConnect = new HubConnection();
    var url = app.globalData.socketUrl + "onLineHub";

    this.hubConnect.start(url, {
      UId: app.globalData.apiHeader.UId,
      ConnetType: 0
    });

    this.hubConnect.onOpen = res => {
      console.info("成功开启连接");
    };

    //订阅对方发来的消息
    this.hubConnect.on("receive", res => {
      console.info("成功订阅消息");
      //this.unReadCountRefresh();
    })
  },

  //通知对方刷新聊天页面
  sendMessage: function(partnerUId) {
    try {
      this.hubConnect.send("subScribeMessage", partnerUId);
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  },

  nineMomentDataRefresh: function(value) {
    if (app.isBlank(value) || value.isEmpty) {
      return;
    }
    this.setData({
      momentText1: "",
      momentText2: "",
      momentText3: "",
      momentText4: "",
      momentText5: "",
      momentText6: "",
      momentText7: "",
      momentText8: "",
      momentText9: "",
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
  nineMoment: function(needialog) {
    let self = this;
    if (self.data.nextCount <= 0) {
      wx.showToast({
        title: "今日次数已用完，去发布一个吧",
        icon: 'none',
        duration: 1500
      });
      return;
    }

    app.httpPost(
      'Letter/NineMoment', {
        "UId": app.globalData.apiHeader.UId,
        "Gender": self.data.selectedGender
      },
      function(res) {
        if (app.isBlank(res) || res.isEmpty) {
          if (needialog) {
            wx.showToast({
              title: "没有更多动态啦，去发布一个吧",
              icon: 'none',
              duration: 1500
            });
          }
        } else {
          let cacheKey = "ninePageMomentCacheKey";
          let count = self.data.nextCount - 1;
          self.nineMomentDataRefresh(res);
          app.setCache(cacheKey, res);
          self.setData({
            nextCount: count
          })
          self.refreshNextCount();
        }
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },

  //获取用户基础信息
  toShowModal: function() {
    if (this.data.currentMoment.isHide) {
      wx.showToast({
        title: "无法查看匿名用户的信息",
        icon: 'none',
        duration: 1500
      });
      return;
    }
    this.toUserSpace(this.data.currentMoment.uId);
  },

  //跳转至个人空间
  toUserSpace: function(uid) {
    wx.navigateTo({
      url: "../../pages/userspace/userspace?uId=" + uid
    })
  },


  //举报瓶子
  reportItem: function() {
    app.httpPost(
      'Letter/ReportBottle', {
        "PickUpId": this.data.currentMoment.pickUpId
      },
      function(res) {
        console.info("举报瓶子成功！");
        wx.showToast({
          title: "举报成功",
          icon: 'success',
          duration: 1500
        });
      },
      function(res) {
        console.info("举报瓶子失败");
      })
  },

  //获取用户输入的用户名
  insertDialogDiscussInput: function(e) {
    this.data.insertDialogDiscussVlaue = e.detail.value
  },


  //发表评论
  insertDialogContent: function() {
    if (this.data.insertDialogDiscussVlaue.length == 0) {
      wx.showToast({
        title: "内容不能为空",
        icon: 'none',
        duration: 1500
      });
      return;
    }
    this.hideChatModal();
    var self = this;
    app.httpPost(
      'Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "PickUpId": self.data.currentMoment.pickUpId,
        "TextContent": self.data.insertDialogDiscussVlaue
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "回复成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage(self.data.currentMoment.uId);
          self.refreshReplyState(self.data.currentIndex);
          console.info("快速评论成功");
        }
      },
      function(res) {
        wx.showToast({
          title: "评论失败",
          icon: 'none',
          duration: 1500
        });
        console.error("快速评论失败");
      })
  },


  refreshReplyState: function(currentIndex) {
    let cacheKey = "ninePageMomentCacheKey";
    let cacheValue = wx.getStorageSync(cacheKey);
    if (app.isBlank(cacheValue)) {
      return;
    }
    if (currentIndex == 1) {
      cacheValue.moment1.hasReply = true;
    }
    if (currentIndex == 2) {
      cacheValue.moment2.hasReply = true;
    }
    if (currentIndex == 3) {
      cacheValue.moment3.hasReply = true;
    }
    if (currentIndex == 4) {
      cacheValue.moment4.hasReply = true;
    }
    if (currentIndex == 5) {
      cacheValue.moment5.hasReply = true;
    }
    if (currentIndex == 6) {
      cacheValue.moment6.hasReply = true;
    }
    if (currentIndex == 7) {
      cacheValue.moment7.hasReply = true;
    }
    if (currentIndex == 8) {
      cacheValue.moment8.hasReply = true;
    }
    if (currentIndex == 9) {
      cacheValue.moment9.hasReply = true;
    }
    this.nineMomentDataRefresh(cacheValue);
    app.setCache(cacheKey, cacheValue);
  },

  //用户登录
  userLogin: function() {
    let self = this;
    //优先获取缓存
    let cacheValue = wx.getStorageSync(app.globalData.userInfoBasicInfoCacheKey);
    let needInit = true;
    if (!app.isBlank(cacheValue) && cacheValue.uId > 0) {
      app.globalData.basicUserInfo = cacheValue;
      app.globalData.apiHeader.UId = cacheValue.uId;
      console.info("通过缓存登录成功!");
      self.initData();
      self.onConnected();
      needInit = false;
    }

    wx.login({
      success: res => {
        console.log(JSON.stringify(res));
        if (res.code) {
          self.getLoginInfo(res.code, needInit);
        }
      }
    })
  },

  //获取OpenId
  getLoginInfo: function(code, needInit) {
    let self = this;
    app.httpPost(
      'Letter/UserLogin', {
        "LoginCode": code
      },
      function(res) {
        if (res != null && res.uId > 0) {
          console.info("登录成功");
          app.globalData.basicUserInfo = res;
          app.globalData.apiHeader.UId = res.uId;
          app.setCache(app.globalData.userInfoBasicInfoCacheKey, res);
          if (needInit) {
            self.initData();
            self.onConnected();
          }
        } else {
          console.error("登录失败!");
        }
      },
      function(res) {
        console.error("登录失败!");
      })
  },



  //分享功能
  onShareAppMessage: function() {
    return {
      title: "和我一起，开启时空对话",
      imageUrl: "",
      path: "/pages/ninerecommend/ninerecommend"
    }
  },

  initNextCount: function() {
    let curentdate = this.getNowDesc();
    let cacheKey = "nineMomentNextCountCacheKey";
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      if (cacheValue.indexOf(curentdate) >= 0) {
        let strArry = cacheValue.split('_');
        this.setData({
          nextCount: strArry[1]
        });
      }
    }
  },

  refreshNextCount: function() {
    let curentdate = this.getNowDesc();
    let cacheValue = curentdate + "_" + this.data.nextCount;
    let cacheKey = "nineMomentNextCountCacheKey";
    app.setCache(cacheKey, cacheValue);
  },

  getNowDesc: function() {
    let now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
  },

})