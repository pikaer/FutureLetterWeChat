const app = getApp();
Page({
  data: {
    showStartUp: true
  },

  onLoad: function(options) {
    this.checkSetting();
  },


  //初始化数据
  init: function(options) {
    this.getPickUpList();
    this.getChatList();
    this.basicUserInfo();
    this.getMyMomentList();
    this.getCollectList();
  },

  checkSetting: function() {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              //从数据库获取用户信息
              that.userLogin();
            }
          });
        } else {
          that.setData({
            showStartUp: false
          })
        }
      }
    })
  },

  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      this.setData({
        showStartUp: true
      })
      this.userLogin();
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '获取用户信息失败，需要授权才能继续使用',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },

  //用户登录
  userLogin: function() {
    let self = this;
    wx.login({
      success: res => {
        console.log(JSON.stringify(res));
        if (res.code) {
          self.getOpenId(res.code);
        }
      }
    })
  },

  //获取OpenId
  getOpenId: function(code) {
    let self = this;
    app.httpPost(
      'api/Letter/GetOpenId', {
        "LoginCode": code
      },
      function(res) {
        console.info("获取OpenId成功");
        app.globalData.openid = res.openId;
        app.globalData.session_key = res.session_key;
        self.getUserInfoWX();
      },
      function(res) {
        console.error("获取OpenId信息失败!");
      })
  },

  //获取微信用户信息
  getUserInfoWX: function() {
    let self = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.info("获取微信用户信息成功!" + JSON.stringify(res));
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfoWX = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回所以此处加入 callback 以防止这种情况
              if (self.userInfoReadyCallback) {
                self.userInfoReadyCallback(res)
              }
              self.setUserInfo();
            }
          })
        }
      }
    })
  },

  //存入用户信息
  setUserInfo: function() {
    let self = this;
    app.httpPost(
      'api/Letter/SetUserInfo', {
        "OpenId": app.globalData.openid,
        "NickName": app.globalData.userInfoWX.nickName,
        "Country": app.globalData.userInfoWX.country,
        "Province": app.globalData.userInfoWX.province,
        "City": app.globalData.userInfoWX.city,
        "AvatarUrl": app.globalData.userInfoWX.avatarUrl,
        "Gender": app.globalData.userInfoWX.gender
      },
      function(res) {
        console.info("存入用户信息成功");
        app.globalData.apiHeader.UId = res.uId;
        self.init();
      },
      function(res) {
        console.error("存入用户信息失败!");
      })
  },

  //获取动态
  getPickUpList: function() {
    var self = this;
    app.httpPost(
      'api/Letter/PickUpList', {
        "UId": app.globalData.apiHeader.UId,
        "PageIndex": 1
      },
      function(res) {
        app.globalData.pickUpList = res.pickUpList;
        wx.switchTab({
          url: '/pages/discovery/discovery'
        })
      },
      function(res) {
        console.info("获取数据失败");
        wx.switchTab({
          url: '/pages/discovery/discovery'
        })
      })
  },


  //获取用户数据
  getChatList: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DiscussList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          console.info("获取聊天列表成功！")
          app.globalData.tempDiscussList = res.discussList;
        },
        function(res) {
          console.error("获取聊天列表失败！");
        })
    }
  },

  //获取用户基础信息
  basicUserInfo: function(ops) {
    var self = this;
    app.httpPost(
      'api/Letter/BasicUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "Type": 1
      },
      function(res) {
        app.globalData.basicUserInfo = res;
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },


  //获取我扔出去的没有被评论的动态
  getMyMomentList: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/MyMomentList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          console.info("获取聊天列表成功！")
          app.globalData.tempMomentList = res.momentList;
        },
        function(res) {
          console.error("获取聊天列表失败！");
        })
    }
  },

  //获取收藏列表数据
  getCollectList: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/GetCollectList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          app.globalData.tempCollectList = res.collectList;
        },
        function(res) {
          console.error("获取收藏列表数据失败！");
        })
    }
  },
});