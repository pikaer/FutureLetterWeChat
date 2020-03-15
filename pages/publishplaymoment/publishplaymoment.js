const app = getApp()

Page({
  data: {
    backGroundImg: "",
    serverImgsPath: "",
    upload_percent: 0,
    ishidden: false,
    hasImg: true,
    isHideNickName: false,
    tempTextContent: "",
    hidingNickName: "",
    momentId: "",
    basicUserInfo: {},
    subscribeMessageOpen: false,
    showLoginModal: false,
    showShareModal: false,
    showTextContentModal: false,
    desc: "",
    playType: 0,
    stateType: 0,
    messageDiscussNotifyWechatId: "GytyYcEW0BqLnACK9hFZMMXbvOZc2oq5DQjdJ65sRFI",
    messageDiscussNotifyQQId: "59880ab542241403ede33bb4c64f0166"
  },

  onLoad: function(options) {
    this.setData({
      basicUserInfo: app.globalData.basicUserInfo,
      backGroundImg: app.globalData.basicUserInfo.headPhotoPath,
      serverImgsPath: app.globalData.basicUserInfo.headPhotoPath,
      hidingNickName: app.globalData.basicUserInfo.nickName,
      tempTextContent: options.tempTextContent,
      desc: options.desc,
      playType: options.playType,
      stateType: options.stateType
    })
  },

  onShow: function() {
    this.setData({
      basicUserInfo: app.globalData.basicUserInfo
    })
    this.basicUserInfo();
  },


  hideShareModal() {
    this.setData({
      showShareModal: false
    });
  },

  cancelShare() {
    this.hideShareModal();
    wx.navigateBack({
      delta: 1
    })
  },


  //单选框值变动
  identityValueChange: function(e) {
    this.setData({
      isHideNickName: e.detail.value == 2
    })
  },


  //获取用户基础信息
  basicUserInfo: function(ops) {
    var self = this;
    let cacheKey = "basicUserInfo+" + app.globalData.apiHeader.UId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        basicUserInfo: cacheValue
      });
    }
    app.httpPost(
      'Letter/BasicUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "Type": 1
      },
      function(res) {
        app.globalData.basicUserInfo = res;
        self.setData({
          basicUserInfo: res
        })
        app.setCache(cacheKey, res);
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },


  //分享功能
  onShareAppMessage: function(res) {
    this.hideShareModal();
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    return {
      title: title,
      imageUrl: url,
      path: "/pages/discovery/discovery"
    }
  },

  //发布动态
  toEditPage: function() {
    wx.navigateTo({
      url: '../../pages/playtypeedit/playtypeedit?desc=' + this.data.desc + "&playType=" + this.data.playType + "&stateType=" + this.data.stateType + "&source=1"
    })
  },

  publishMoment: function(ops) {
    var self = this;
    if (app.isBlank(self.data.tempTextContent)) {
      self.requestMsgAndPublisgh();
    } else {
      //文本安全性校验
      app.httpPost(
        'Letter/MsgSecCheck', {
          "TextContent": self.data.tempTextContent
        },
        function(res) {
          if (!res.isOK) {
            wx.showToast({
              title: "内容不合法",
              icon: 'none',
              duration: 2500,
            })
            return;
          } else {
            self.requestMsgAndPublisgh();
          }
        },
        function(res) {
          self.requestMsgAndPublisgh();
        }
      )
    }
  },

  cancelTextContentModal: function() {
    this.setData({
      showTextContentModal: false
    });
  },

  showTextContentModal: function() {
    this.setData({
      showTextContentModal: true
    });
  },

  //获取输入的聊天内容
  textContentInput: function(e) {
    this.setData({
      tempTextContent: e.detail.value
    })
  },


  //发布动态
  publishMomentContent: function() {
    var self = this;
    app.httpPost(
      'Letter/PublishMoment', {
        "UId": app.globalData.apiHeader.UId,
        "IsHide": self.data.isHideNickName,
        "HidingNickName": self.data.hidingNickName,
        "TextContent": self.data.tempTextContent,
        "ImgContent": self.data.serverImgsPath,
        "SourceFlag": 1,
        "PlayType": self.data.playTypeIndex,
        "SubscribeMessageOpen": self.data.subscribeMessageOpen
      },
      function(res) {
        if (res.isExecuteSuccess) {
          self.data.momentId = res.momentId;
          self.setData({
            showShareModal: true
          });
        } else {
          self.publishToast(false);
        }
      },
      function(res) {
        console.error("发布动态失败");
        self.publishToast(false);
      },
    )
  },


  //弹框
  publishToast: function(success) {
    let self = this;
    let title = success ? "发布成功" : "发布失败";
    let img = success ? "" : "../../content/images/warn.png"
    wx.showToast({
      title: title,
      icon: 'success',
      image: img,
      duration: 2500,
      complete() {
        if (success) {
          self.sleepAfterBack();
        }
      }
    })

  },

  sleepAfterBack: function() {
    let times = 0;
    let self = this;
    var timer = setInterval(function() {
      times++
      if (times >= 1) {
        clearInterval(timer);
        self.backPage();
      }
    }, 1000)
  },

  //返回上一级页面。
  backPage: function() {
    wx.navigateBack({
      delta: 1
    })
  },


  //获取用户输入的文本
  subscribeMessage: function(e) {
    this.setData({
      subscribeMessageOpen: e.detail.value
    })
  },

  //获取用户输入的文本
  textContentInput: function(e) {
    let str = e.detail.value
    this.setData({
      tempTextContent: str
    })
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      tempTextContent: str
    })
  },

  bindPlayTypeChange: function(e) {
    this.setData({
      playTypeIndex: e.detail.value
    })
  },


  requestMsgAndPublisgh() {
    let self = this;
    let messageDiscussNotifyId = "";
    if (app.globalData.apiHeader.Platform == 1) {
      messageDiscussNotifyId = self.data.messageDiscussNotifyQQId;
    } else {
      messageDiscussNotifyId = self.data.messageDiscussNotifyWechatId;
    }
    if (!self.data.subscribeMessageOpen) {
      return new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: [messageDiscussNotifyId],
          success: (res) => {
            if (res[messageDiscussNotifyId] === 'accept') {
              console.info("订阅成功");
              self.setData({
                subscribeMessageOpen: true
              })
            } else {
              self.setData({
                subscribeMessageOpen: false
              })
            }
            self.publishMomentContent();
          },
          fail(err) {
            //失败
            console.error(err);
            self.setData({
              subscribeMessageOpen: false
            })
            self.publishMomentContent();
          }
        })
      })
    } else {
      self.publishMomentContent();
    }
  },


  //有人打招呼时通知我 开关切换
  requestMsg() {
    let self = this;
    let messageDiscussNotifyId = "";
    if (app.globalData.apiHeader.Platform == 1) {
      messageDiscussNotifyId = self.data.messageDiscussNotifyQQId;
    } else {
      messageDiscussNotifyId = self.data.messageDiscussNotifyWechatId;
    }
    if (self.data.subscribeMessageOpen) {
      return new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: [messageDiscussNotifyId],
          success: (res) => {
            if (res[messageDiscussNotifyId] === 'accept') {
              console.info("订阅成功");
              self.setData({
                subscribeMessageOpen: true
              })
            } else {
              self.setData({
                subscribeMessageOpen: false
              })
            }
          },
          fail(err) {
            //失败
            console.error(err);
            self.setData({
              subscribeMessageOpen: false
            })
          }
        })
      })
    }
  },
})