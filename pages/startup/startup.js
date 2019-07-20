const app = getApp();
Page({
  data: {
    showStartUp: true
  },

  onLoad: function (options) {
    if (options != null && options.pickUpId != undefined) {
      this.setData({
        showStartUp: false
      })
      //这个pickUpId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: "../../pages/discussdetail/discussdetail?pickUpId=" + options.pickUpId
      })
    } else {
      this.checkSetting();
    }
  },

  checkSetting: function () {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              //从数据库获取用户信息
              that.userLogin();
            }
          });
        }else{
          that.setData({
            showStartUp: false
          })
        }
      }
    })
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      this.setData({
        showStartUp: true
      })
      this.userLogin();
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },

  //用户登录
  userLogin: function () {
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
  getOpenId: function (code) {
    let self = this;
    app.httpPost(
      'api/Letter/GetOpenId', {
        "LoginCode": code
      },
      function (res) {
        console.info("获取OpenId成功");
        app.globalData.openid = res.openId;
        app.globalData.session_key = res.session_key;
        self.getUserInfoWX();
      },
      function (res) {
        console.error("获取OpenId信息失败!");
      })
  },

  //获取微信用户信息
  getUserInfoWX: function () {
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
  setUserInfo: function () {
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
      function (res) {
        console.info("存入用户信息成功");
        app.globalData.apiHeader.UId = res.uId;

        wx.switchTab({
          url: '/pages/discovery/discovery'
        })
      },
      function (res) {
        console.error("存入用户信息失败!");
      })
  },

});

