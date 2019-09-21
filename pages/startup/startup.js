const app = getApp();
Page({
  data: {
    showStartUp: true
  },

  onLoad: function(options) {
    this.userLogin();
  },

  //用户登录
  userLogin: function() {
    let self = this;
    wx.login({
      success: res => {
        console.log(JSON.stringify(res));
        if (res.code) {
          self.getLoginInfo(res.code);
        }
      }
    })
  },

  //获取OpenId
  getLoginInfo: function(code) {
    let self = this;
    app.httpPost(
      'api/Letter/UserLogin', {
        "LoginCode": code
      },
      function(res) {
        if (res != null && res.uId > 0) {
          console.info("登录成功");
          app.globalData.basicUserInfo = res;
          app.globalData.apiHeader.UId = res.uId;
          self.init();
        } else {
          console.error("登录失败!");
        }
      },
      function(res) {
        console.error("登录失败!");
      })
  },

  //初始化数据
  init: function() {
    this.getPickUpList();
    this.getChatList();
    this.getMyMomentList();
    this.getCollectList();
  },

  //获取动态
  getPickUpList: function() {
    var self = this;
    app.httpPost(
      'api/Letter/PickUpList', {
        "UId": app.globalData.apiHeader.UId,
        "PageIndex": 1,
        "MomentType": 0
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