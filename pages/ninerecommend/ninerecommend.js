const app = getApp()

import { HubConnection } from "../../utils/signalR.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showChatModal: false,
    currentMoment: {},
    momentPick1:false,
    momentPick2:false,
    momentPick3: false,
    momentPick4: false,
    momentPick5:false,
    momentPick6: false,
    momentPick7: false,
    momentPick8: false,
    momentPick9: false,
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
    insertDialogDiscussVlaue:"",
    statusBarHeight: app.globalData.statusBarHeight,
  },

  onLoad: function(options) {
    if (app.globalData.apiHeader.UId>0){
      this.initData();
      this.onConnected();
    }else{
      this.userLogin();
    }
  },

  //卸载页面
  onUnload: function () {
    console.info("卸载页面，断开连接")
    this.onDisconnected();
  },

  //卸载页面，中断webSocket
  onDisconnected: function () {
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
    if (app.isBlank(cacheValue) || cacheValue.isEmpty) {
      this.nineMoment();
    } else {
      this.nineMomentDataRefresh(cacheValue);
    }
  },

  //连接WebSocket
  onConnected: function () {
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
  sendMessage: function (partnerUId) {
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
  reportItem: function () {
    app.httpPost(
      'Letter/ReportBottle', {
        "PickUpId": this.data.currentMoment.pickUpId
      },
      function (res) {
        console.info("举报瓶子成功！");
        wx.showToast({
          title: "举报成功",
          icon: 'success',
          duration: 1500
        });
      },
      function (res) {
        console.info("举报瓶子失败");
      })
  },

  //获取用户输入的用户名
  insertDialogDiscussInput: function (e) {
    this.data.insertDialogDiscussVlaue = e.detail.value
  },


  //发表评论
  insertDialogContent: function () {
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
      function (res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "回复成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage(self.data.currentMoment.uId);
          console.info("快速评论成功");
        }
      },
      function (res) {
        wx.showToast({
          title: "评论失败",
          icon: 'none',
          duration: 1500
        });
        console.error("快速评论失败");
      })
  },


  //用户登录
  userLogin: function () {
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
      needInit=false;
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
  onShareAppMessage: function () {
    return {
      title: "在没人认识我的地方，你才真正认识我。",
      imageUrl: "",
      path: "/pages/ninerecommend/ninerecommend"
    }
  },

})