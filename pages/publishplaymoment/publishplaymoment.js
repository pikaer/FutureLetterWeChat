const app = getApp()

Page({
  data: {
    backGroundImg: "",
    serverImgsPath: "",
    upload_percent: 0,
    ishidden: false,
    hasImg: true,
    publishDisabled: true,
    isRegister: true,
    isHideNickName: false,
    tempTextContent: "",
    hidingNickName: "",
    momentId: "",
    basicUserInfo:{},
    subscribeMessageOpen: false,
    showLoginModal: false,
    showShareModal: false,
    showTextContentModal: false,
    playTypeArray: ['其他', '王者', '吃鸡', '连麦', '游戏', '学习', '追剧', '早起', '散步', '看电影'],
    playTypeIndex: 0,
    messageDiscussNotifyWechatId: "GytyYcEW0BqLnACK9hFZMMXbvOZc2oq5DQjdJ65sRFI",
    messageDiscussNotifyQQId: "59880ab542241403ede33bb4c64f0166"
  },

  onLoad: function() {
    this.setData({
      isRegister: app.globalData.basicUserInfo.isRegister,
      basicUserInfo: app.globalData.basicUserInfo,
      backGroundImg: app.globalData.basicUserInfo.headPhotoPath,
      serverImgsPath: app.globalData.basicUserInfo.headPhotoPath,
      tempTextContent: app.globalData.basicUserInfo.signature,
      hidingNickName: app.globalData.basicUserInfo.nickName
    })
  },

  onShow: function () {
    this.setData({
      isRegister: app.globalData.basicUserInfo.isRegister,
      basicUserInfo: app.globalData.basicUserInfo
    })
    this.basicUserInfo();
  },


  cancelLogin: function() {
    this.setData({
      showLoginModal: false
    });
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

  toLogin: function() {
    this.setData({
      showLoginModal: true
    });
  },

  //单选框值变动
  identityValueChange: function(e) {
    this.setData({
      isHideNickName: e.detail.value == 2
    })
  },

  bindGetUserInfo: function(e) {
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

  //获取用户基础信息
  basicUserInfo: function (ops) {
    var self = this;
    let cacheKey = "basicUserInfo+" + app.globalData.apiHeader.UId;
    app.httpPost(
      'Letter/BasicUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "Type": 1
      },
      function (res) {
        app.globalData.basicUserInfo = res;
        self.setData({
          basicUserInfo: res
        });
        this.setData({
          isRegister: res.isRegister,
          basicUserInfo: res
        })
        app.setCache(cacheKey, res);
      },
      function (res) {
        console.error("获取用户基础信息失败");
      })
  },

  //存入用户信息
  setUserInfo: function(userInfoWX) {
    let self = this;
    app.globalData.basicUserInfo.headPhotoPath = userInfoWX.avatarUrl;
    app.globalData.basicUserInfo.nickName = userInfoWX.nickName;
    app.globalData.basicUserInfo.gender = userInfoWX.gender;
    app.globalData.basicUserInfo.isRegister = true;
    self.isRegister = true;
    if (app.globalData.basicUserInfo.isRegister) {
      self.publishMoment();
    }
    app.httpPost(
      'Letter/SetUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "NickName": userInfoWX.nickName,
        "AvatarUrl": userInfoWX.avatarUrl,
        "Gender": userInfoWX.gender,
        "Country": userInfoWX.country,
        "Province": userInfoWX.province,
        "City": userInfoWX.city
      },
      function(res) {
        console.info("存入用户信息成功");
      },
      function(res) {
        console.error("存入用户信息失败!");
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
    this.updateBtnState();
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
    this.updateBtnState();
  },

  bindPlayTypeChange: function(e) {
    this.setData({
      playTypeIndex: e.detail.value
    })
  },

  //更新按钮禁用状态
  updateBtnState: function() {
    this.setData({
      publishDisabled: app.isBlank(this.data.tempTextContent) || app.isBlank(this.data.backGroundImg)
    })
  },

  //选择图片方法
  uploadpic: function(e) {
    let self = this //获取上下文
    //选择图片
    wx.chooseImage({
      count: 1, // 默认9，这里显示一次选择相册的图片数量 
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) { // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片 
        if (res.tempFiles.length > 1) {
          wx.showToast({
            title: "不能超过1张",
            icon: 'success',
            image: "../../content/images/warn.png",
            duration: 3000
          })
          return;
        }

        self.setData({
          backGroundImg: res.tempFiles[0].path,
        });

      }
    })
  },


  // login.js
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


  // login.js
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


  upload_file_server() {
    if (backGroundImg.contains("https://") || backGroundImg.contains("http://")) {
      this.publishMomentContent();
    } else {
      let self = this
      const upload_task = wx.uploadFile({
        url: app.globalData.baseUrl + "Letter/UpLoadImg", //需要用HTTPS，同时在微信公众平台后台添加服务器地址  
        filePath: backGroundImg, //上传的文件本地地址    
        name: 'file',
        success: function(res) {
          let data = JSON.parse(res.data);
          if (data.success) {
            self.setData({
              serverImgsPath: data.content.imgPath
            });
            self.publishMomentContent();
          }
        },
        fail: function(res) {
          var data = JSON.parse(res.data);
          console.info(data);
          self.publishToast(false);
        }
      })
      //上传 进度方法
      upload_task.onProgressUpdate((res) => {
        self.setData({
          upload_percent: res.progress
        });
      });
    }
  }
})