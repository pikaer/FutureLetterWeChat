const app = getApp()


Page({
  data: {
    ishidden: false,
    publishDisabled: true,
    isHideNickName: false,
    tempTextContent: "",
    hidingNickName: "",
    momentId: "",
    subscribeMessageOpen: false,
    showShareModal: false,
    messageDiscussNotifyWechatId: "GytyYcEW0BqLnACK9hFZMMXbvOZc2oq5DQjdJ65sRFI",
    messageDiscussNotifyQQId: "59880ab542241403ede33bb4c64f0166"
  },

  onLoad: function() {
    this.setData({
      isRegister: app.globalData.basicUserInfo.isRegister,
      hidingNickName: app.globalData.basicUserInfo.nickName
    })
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

  identityValueChange: function(e) {
    this.setData({
      isHideNickName: e.detail.value == 2
    })
  },

  //分享功能
  onShareAppMessage: function(res) {
    this.hideShareModal();
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    if (app.isBlank(this.data.momentId)) {
      return {
        title: title,
        imageUrl: url,
        path: "/pages/discovery/discovery",
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    }
    if (this.data.tempTextContent != "" && this.data.tempTextContent != undefined) {
      title = this.data.tempTextContent;
    }
    return {
      title: title,
      imageUrl: "",
      path: "/pages/sharepage/sharepage?momentId=" + this.data.momentId
    }
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

  //发布动态
  publishMomentContent: function() {
    var self = this;
    app.httpPost(
      'Letter/PublishMoment', {
        "UId": app.globalData.apiHeader.UId,
        "IsHide": self.data.isHideNickName,
        "HidingNickName": self.data.hidingNickName,
        "TextContent": self.data.tempTextContent,
        "SourceFlag": 2,
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
    this.updateBtnState();
  },

  //更新按钮禁用状态
  updateBtnState: function() {
    let str = this.data.tempTextContent;
    let localImgs = this.data.localImgs;
    let canUse = str != null && str.length > 0;
    this.setData({
      publishDisabled: !canUse
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