const app = getApp()
const auth = require('../../utils/auth.js');
import {
  HubConnection
} from "../../utils/signalR.js";

// 获取倍率
const raterpx = 750.0 / wx.getSystemInfoSync().windowWidth;
// 获取canvas转化后的rpx
const rate = function (rpx) {
  return rpx / raterpx
};


Page({
  data: {
    discussDetail: {},
    discussDetailList: [],
    momentId: null,
    showModal: false,
    basicUserInfo: {},
    discussContent: "",
    showinputarea: false,
    showModalStatus: false,
    showLoginModal: false,
  },

  onLoad: function (options) {
    if (options.momentId != null && options.momentId != "") {
      this.setData({
        momentId: options.momentId
      });
    }

    //用户登录
    if (app.globalData.apiHeader.UId <= 0) {
      this.userLogin();
    } else {
      this.discussDetail();
      this.getUserLocation();
    }
  },

  //用户登录
  userLogin: function () {
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
  getLoginInfo: function (code) {
    let self = this;
    app.httpPost(
      'api/Letter/UserLogin', {
        "LoginCode": code
      },
      function (res) {
        if (res != null && res.uId > 0) {
          console.info("分享页面登录成功");
          app.globalData.basicUserInfo = res;
          app.globalData.apiHeader.UId = res.uId;
          self.discussDetail();
          self.getUserLocation();
        } else {
          console.error("分享页面登录失败!");
        }
      },
      function (res) {
        console.error("分享页面登录失败!");
      })
  },


  onLineConnected: function (partnerUId) {
    this.onLineHub = new HubConnection();
    var url = app.globalData.socketUrl + "onLineHub";

    this.onLineHub.start(url, {
      UId: app.globalData.apiHeader.UId,
      PartnerUId: partnerUId,
      ConnetType: 2
    });

    this.onLineHub.onOpen = res => {
      console.info("成功开启连接");
    };

    //订阅对方发来的消息
    this.onLineHub.on("receive", res => {
      console.info("成功订阅消息");
      this.refreshDiscussDetail();
      //this.clearUnReadCount();
    })
  },

  //卸载页面，中断webSocket
  onUnload: function () {
    try {
      this.onLineHub.close({
        UId: app.globalData.apiHeader.UId,
        ConnetType: 2
      })
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  },

  //发表评论
  insertDiscussContent: function () {
    let self = this;
    let userinfo = app.globalData.basicUserInfo;
    if (userinfo == null || userinfo == '') {
      return;
    }
    if (!userinfo.isRegister) {
      self.setData({
        showLoginModal: true
      });
      return;
    }
    let content = self.data.discussContent;
    if (content != null && content != '' && content.length > 0) {
      self.insertDiscussContentToList(content);
      app.httpPost(
        'api/Letter/Discuss', {
          "UId": app.globalData.apiHeader.UId,
          "MomentId": self.data.momentId,
          "TextContent": content
        },
        function (res) {
          if (res.isExecuteSuccess) {
            self.refreshDiscussDetail();
            self.sendMessage();
            console.info("发表评论成功");
          }
          self.setData({
            discussContent: ""
          });
        },
        function (res) {
          self.setData({
            discussContent: ""
          });
          console.error("发表评论失败");
        })
    }
  },

  //通知对方刷新聊天页面
  sendMessage: function () {
    this.onLineHub.send("subScribeMessage", this.data.discussDetail.momentUId);
  },

  insertDiscussContentToList: function (textContent) {
    var self = this;
    let userinfo = app.globalData.basicUserInfo;
    let detailList = self.data.discussDetailList;
    if (userinfo != null && userinfo != "") {
      let discuss = {};
      discuss.nickName = userinfo.nickName;
      discuss.pickUpUId = app.globalData.apiHeader.UId;
      discuss.headImgPath = userinfo.headPhotoPath;
      discuss.recentChatTime = '刚刚';
      discuss.distanceDesc ="0米";
      discuss.gender = userinfo.gender;
      discuss.textContent = textContent;
      detailList.unshift(discuss);
      self.setData({
        discussDetailList: detailList
      });
    }
  },


  //获取动态
  discussDetail: function () {
    let cacheKey = "discussDetail_momentId_" + this.data.momentId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      this.setData({
        discussDetail: cacheValue
      })

      let cacheListKey = "discussDetailList_pickUpId_" + cacheValue.pickUpId;
      let cacheListValue = wx.getStorageSync(cacheListKey);
      if (!app.isBlank(cacheListValue)) {
        this.setData({
          discussDetailList: cacheListValue
        })
      }
      this.onLineConnected(cacheValue.momentUId);
    }
    this.refreshDiscussDetail();
  },

  //获取输入的聊天内容
  discussContentInput: function (e) {
    this.setData({
      discussContent: e.detail.value
    })
  },


  refreshDiscussDetail: function () {
    var self = this;
    let cacheKey = "discussDetail_momentId_" + self.data.momentId;
    app.httpPost(
      'api/Letter/DiscussDetail', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.momentId
      },
      function (res) {
        if (!app.isBlank(res)) {
          console.info("获取分享页聊天内容数据成功");
          let tempDetailList = res.discussDetailList;
          self.setData({
            discussDetail: res,
            discussDetailList: tempDetailList
          });
          app.setCache(cacheKey, res);

          let cacheListKey = "discussDetailList_pickUpId_" + res.pickUpId;
          app.setCache(cacheListKey, tempDetailList);

          if (self.onLineHub == undefined) {
            self.onLineConnected(res.momentUId);
          }
        }
      },
      function (res) {
        console.error("获取分享页聊天内容数据失败");
      })
  },

  toStartup: function () {
    wx.navigateTo({
      url: "../../pages/discovery/discovery"
    })
  },

  // 预览图片
  previewImg: function (e) {
    let imgContent = e.currentTarget.dataset.imgcontent;
    let imgContents = [];
    imgContents.push(imgContent);
    wx.previewImage({
      //当前显示图片
      current: imgContent,
      //所有图片
      urls: imgContents
    })
  },

  //获取用户基础信息
  toShowModal: function (ops) {
    var self = this;
    self.setData({
      basicUserInfo: {}
    });
    app.httpPost(
      'api/Letter/BasicUserInfo', {
        "UId": ops.currentTarget.dataset.uid
      },
      function (res) {
        self.setData({
          basicUserInfo: res,
          showModal: true
        });
      },
      function (res) {
        console.error("获取用户基础信息失败");
      })
  },

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  //更多
  moreAction: function (ops) {
    this.setData({
      showModalStatus: true
    })
  },

  cancelLogin: function () {
    this.setData({
      showLoginModal: false
    });
  },


  hideModalShare: function () {
    this.setData({
      showModalStatus: false
    })
  },



  //分享功能
  onShareAppMessage: function (res) {
    this.hideModalShare();
    let momentId = this.data.momentId;
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    if (this.data.discussDetail.textContent != "" && this.data.discussDetail.textContent != null) {
      title = this.data.discussDetail.textContent;
    }
    if (this.data.discussDetail.imgContent != "" && this.data.discussDetail.imgContent != null) {
      url = this.data.discussDetail.imgContent;
    }
    return {
      title: title,
      imageUrl: url,
      path: "/pages/sharepage/sharepage?momentId=" + momentId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  //清除未读消息
  clearUnReadCount: function () {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/ClearUnReadCount', {
          "UId": app.globalData.apiHeader.UId,
          "PickUpId": self.data.pickUpId
        },
        function (res) {
          console.info("清除未读消息成功！")
        },
        function (res) {
          console.info("清除未读消息Http失败！")
        })
    }
  },



  bindGetUserInfo: function (e) {
    let self = this;
    if (e.detail.userInfo) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              lang: "zh_CN",
              success: res => {
                console.info("获取微信用户信息成功!" + JSON.stringify(res));
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回所以此处加入 callback 以防止这种情况
                if (self.userInfoReadyCallback) {
                  self.userInfoReadyCallback(res)
                }
                self.setUserInfo(res.userInfo);
              }
            })
          }
        }
      })
    }
  },


  //存入用户信息
  setUserInfo: function (userInfoWX) {
    let self = this;
    app.globalData.basicUserInfo.headPhotoPath = userInfoWX.avatarUrl;
    app.globalData.basicUserInfo.nickName = userInfoWX.nickName;
    app.globalData.basicUserInfo.gender = userInfoWX.gender;
    app.globalData.basicUserInfo.isRegister = true;
    self.cancelLogin();
    app.httpPost(
      'api/Letter/SetUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "NickName": userInfoWX.nickName,
        "AvatarUrl": userInfoWX.avatarUrl,
        "Gender": userInfoWX.gender,
        "Country": userInfoWX.country,
        "Province": userInfoWX.province,
        "City": userInfoWX.city
      },
      function (res) {
        console.info("存入用户信息成功");
        self.insertDiscussContent();
        self.getUserLocation();
      },
      function (res) {
        console.error("存入用户信息失败!");
      })
  },


  getUserLocation: function () {
    let self = this
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        // 拒绝授权后再次进入重新授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          // console.log('authSetting:status:拒绝授权后再次进入重新授权', res.authSetting['scope.userLocation'])
          wx.showModal({
            title: '',
            content: '【Bingo聊天室】需要获取你的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none'
                })
                setTimeout(() => {
                  wx.navigateBack()
                }, 1500)
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    // console.log('dataAu:success', dataAu)
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      //再次授权，调用wx.getLocation的API
                      self.getLocation(dataAu)
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none'
                      })
                      setTimeout(() => {
                        wx.navigateBack()
                      }, 1500)
                    }
                  }
                })
              }
            }
          })
        }
        // 初始化进入，未授权
        else if (res.authSetting['scope.userLocation'] == undefined) {
          // console.log('authSetting:status:初始化进入，未授权', res.authSetting['scope.userLocation'])
          //调用wx.getLocation的API
          self.getLocation(res)
        }
        // 已授权
        else if (res.authSetting['scope.userLocation']) {
          // console.log('authSetting:status:已授权', res.authSetting['scope.userLocation'])
          //调用wx.getLocation的API
          self.getLocation(res)
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function (userLocation) {
    let self = this
    wx.getLocation({
      type: "wgs84",
      success: function (res) {
        console.log('getLocation:success', res)
        self.updateUserLocation(res.latitude, res.longitude)
      },
      fail: function (res) {
        console.log('getLocation:fail', res)
        if (res.errMsg === 'getLocation:fail:auth denied') {
          wx.showToast({
            title: '拒绝授权',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
          return
        }
        if (!userLocation || !userLocation.authSetting['scope.userLocation']) {
          console.log('getLocation:fail', res)
          self.getUserLocation()
        } else if (userLocation.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '',
            content: '请在系统设置中打开定位服务',
            showCancel: false,
            success: result => {
              if (result.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  },

  updateUserLocation: function (latitude, longitude) {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/UpdateUserLocation', {
          "UId": app.globalData.apiHeader.UId,
          "Latitude": latitude,
          "Longitude": longitude
        },
        function (res) {
          console.info("更新位置信息成功！")
        },
        function (res) {
          console.info("更新位置信息失败！")
        })
    }
  },

})