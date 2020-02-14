const app = getApp()
const auth = require('../../utils/auth.js');
import {
  HubConnection
} from "../../utils/signalR.js";
// 获取倍率
const raterpx = 750.0 / wx.getSystemInfoSync().windowWidth;
// 获取canvas转化后的rpx
const rate = function(rpx) {
  return rpx / raterpx
};

Page({
  data: {
    momentDetail: {
      "momentId": ""
    },
    myDetail: {
      "showHideStatus": 0
    },
    partnerDetail: {
      "nickName": " ",
      "distanceDesc": "远方"
    },
    discussDetailList: [],
    pickUpId: null,
    momentId: null,
    discussContent: "",
    tempHidingNickName: "",
    showModal: false,
    showTextContentModal: false,
    showModalStatus: false,
    showLoginModal: false,
    showChangeHideModal: false,
    inputfoucusOn: false,
    basicUserInfo: {},
    isCreate: false,
    isShow: false,
    topNum: 99999,
    statusBarHeight: app.globalData.statusBarHeight,
    keyBoardHeight: 0,
    partnerUId: 0,
    momentTextContent: ""
  },

  onLoad: function(options) {
    if (!app.isBlank(options.pickUpId)) {
      this.data.pickUpId = options.pickUpId
    }
    if (!app.isBlank(options.partnerUId) && options.partnerUId > 0) {
      this.data.partnerUId = parseInt(options.partnerUId);
    }
    if (!app.isBlank(options.momentId)) {
      this.initData(options.momentId);
      this.data.momentDetail.momentId = options.momentId;
    }
    this.onLineConnected();
  },

  onShow: function(options) {
    this.discussDetail();
    this.getChatDetailList();
  },

  //通知对方刷新聊天页面
  sendMessage: function() {
    this.onLineHub.send("subScribeMessage", this.data.partnerUId);
  },


  onLineConnected: function() {
    this.onLineHub = new HubConnection();
    var url = app.globalData.socketUrl + "onLineHub";
    this.onLineHub.start(url, {
      UId: app.globalData.apiHeader.UId,
      PartnerUId: this.data.partnerUId,
      ConnetType: 2
    });

    this.onLineHub.onOpen = res => {
      console.info("成功开启连接");
    };

    //订阅对方发来的消息
    this.onLineHub.on("receive", res => {
      console.info("成功订阅消息");
      this.getChatDetailList();
      this.clearUnReadCount();
    })
  },

  //卸载页面，中断webSocket
  onUnload: function() {
    try {
      if (this.onLineHub != undefined) {
        this.onLineHub.close({
          UId: app.globalData.apiHeader.UId,
          ConnetType: 2
        })
      }
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  },

  //数据初始化
  initData: function(momentId) {
    try {
      if (momentId != "undefined" && momentId != undefined) {
        let momentDetailCacheKey = "momentDetail_momentId_" + momentId;
        let momentDetailCacheValue = wx.getStorageSync(momentDetailCacheKey);
        if (!app.isBlank(momentDetailCacheValue)) {
          let nickName = 'partnerDetail.nickName';
          this.setData({
            [nickName]: momentDetailCacheValue.nickName,
            momentDetail: momentDetailCacheValue
          })
          this.cutTextContent()
        }

        let discussDetailListKey = "discussDetailList_momentId_" + momentId;
        let discussDetailListCacheValue = wx.getStorageSync(discussDetailListKey);
        if (!app.isBlank(discussDetailListCacheValue)) {
          this.setData({
            discussDetailList: discussDetailListCacheValue
          })
        }

        let myDetailKey = "myDetail_momentId_" + momentId;
        let myDetaiCacheValue = wx.getStorageSync(myDetailKey);
        if (!app.isBlank(myDetaiCacheValue)) {
          this.setData({
            myDetail: myDetaiCacheValue,
            tempHidingNickName: myDetaiCacheValue.nickName
          })
        }

        let partnerDetailKey = "partnerDetail_momentId_" + momentId;
        let partnerDetailCacheValue = wx.getStorageSync(partnerDetailKey);
        if (!app.isBlank(partnerDetailCacheValue)) {
          this.setData({
            partnerDetail: partnerDetailCacheValue
          })
        }
      }
    } catch (e) {
      console.error("discussDetailPage:数据初始化异常");
    }
  },

  cutTextContent: function() {
    if (!app.isBlank(this.data.momentDetail.textContent)) {
      if (!app.isBlank(this.data.momentDetail.imgContent)) {
        if (this.data.momentDetail.textContent.length > 16) {
          this.setData({
            momentTextContent: this.data.momentDetail.textContent.substring(0, 16) + "..."
          })
        } else {
          this.setData({
            momentTextContent: this.data.momentDetail.textContent
          })
        }
      } else {
        if (this.data.momentDetail.textContent.length > 22) {
          this.setData({
            momentTextContent: this.data.momentDetail.textContent.substring(0, 22) + "..."
          })
        } else {
          this.setData({
            momentTextContent: this.data.momentDetail.textContent
          })
        }
      }
    }
  },

  toBottom: function() {
    if (this.data.discussDetailList.length <4) {
      return;
    }
    wx.pageScrollTo({
      scrollTop: 999999
    })
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

  //获取用户基础信息
  toShowModal: function(ops) {
    var self = this;
    let cacheKey = "basicUserInfo+" + ops.currentTarget.dataset.uid;
    let cacheValue = wx.getStorageSync(cacheKey);
    let isRefreshCache = false;
    if (!app.isBlank(cacheValue)) {
      isRefreshCache = true;
      self.setData({
        basicUserInfo: cacheValue,
        showModal: true
      });
    } else {
      self.setData({
        basicUserInfo: {}
      });
    }
    app.httpPost(
      'Letter/BasicUserInfo', {
        "UId": ops.currentTarget.dataset.uid
      },
      function(res) {
        if (!app.isBlank(res)) {
          self.setData({
            basicUserInfo: res
          });
          if (!isRefreshCache) {
            self.setData({
              showModal: true
            });
          }
          app.setCache(cacheKey, res);
        }
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },

  hideModal: function() {
    this.setData({
      showModal: false
    });
  },

  toShowTextContentModal: function() {
    if (app.isBlank(this.data.momentDetail.textContent)) {
      return;
    }
    if (this.data.momentTextContent.length == this.data.momentDetail.textContent.length) {
      return;
    }
    this.setData({
      showTextContentModal: true
    });
  },

  hideTextContentModal: function() {
    this.setData({
      showTextContentModal: false
    });
  },


  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.discussDetail();
    this.getChatDetailList();
  },

  // 预览图片
  previewImg: function(e) {
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

  //获取输入的聊天内容
  discussContentInput: function(e) {
    this.setData({
      discussContent: e.detail.value
    })
  },

  //获取输入的聊天内容
  hidingNickNameInput: function(e) {
    this.setData({
      tempHidingNickName: e.detail.value
    })
  },

  //获取动态
  discussDetail: function() {
    var self = this;
    let requestdata = {
      "UId": app.globalData.apiHeader.UId
    }
    if (!app.isBlank(self.data.pickUpId)) {
      requestdata.PickUpId = self.data.pickUpId;
    }
    if (!app.isBlank(self.data.momentDetail.momentId)) {
      requestdata.MomentId = self.data.momentDetail.momentId;
    }
    app.httpPost('Letter/DiscussDetail', requestdata,
      function(res) {
        if (!app.isBlank(res)) {
          self.setData({
            momentDetail: res.momentDetail,
            partnerDetail: res.partnerDetail,
            myDetail: res.myDetail,
            pickUpId: res.pickUpId,
            tempHidingNickName: res.myDetail.nickName
          });
          let momentDetailCacheKey = "momentDetail_momentId_" + res.momentDetail.momentId;
          app.setCache(momentDetailCacheKey, res.momentDetail);

          let myDetailKey = "myDetail_momentId_" + res.momentDetail.momentId;
          app.setCache(myDetailKey, res.myDetail);

          let partnerDetailKey = "partnerDetail_momentId_" + res.momentDetail.momentId;
          app.setCache(partnerDetailKey, res.partnerDetail);

          self.cutTextContent()
        }
        app.globalData.currentDiscussMoment = {};
      },
      function(res) {
        console.info("获取数据失败");
      })
  },


  //获取动态
  getChatDetailList: function() {
    var self = this;
    let requestdata = {
      "UId": app.globalData.apiHeader.UId
    }
    if (!app.isBlank(self.data.pickUpId)) {
      requestdata.PickUpId = self.data.pickUpId;
    }
    if (!app.isBlank(self.data.momentDetail.momentId)) {
      requestdata.MomentId = self.data.momentDetail.momentId;
    }
    app.httpPost('Letter/ChatDetailList', requestdata,
      function(res) {
        if (!app.isBlank(res) && !app.isBlank(res.discussDetailList)) {
          self.setData({
            discussDetailList: res.discussDetailList
          });
          let discussDetailListKey = "discussDetailList_momentId_" + self.data.momentDetail.momentId;
          app.setCache(discussDetailListKey, res.discussDetailList);

          if (self.data.myDetail.showHideStatus != 0) {
            let hideArea = 'myDetail.showHideStatus';
            self.setData({
              [hideArea]: 0
            })
          }
        }
        self.toBottom();
      },
      function(res) {
        console.info("获取数据失败");
      })
  },

  cancelLogin: function() {
    this.setData({
      showLoginModal: false
    });
  },

  cancelChangeHide: function() {
    this.setData({
      showChangeHideModal: false
    });
  },

  showChangeHide: function() {
    if (this.data.myDetail.showHideStatus == 1) {
      this.setData({
        inputfoucusOn: false
      });
      this.setData({
        showChangeHideModal: true
      });
    } else {
      let status = 'myDetail.showHideStatus';
      this.setData({
        [status]: 1
      });
      this.updateShowNickName();
    }
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

  //存入用户信息
  setUserInfo: function(userInfoWX) {
    let self = this;
    app.globalData.basicUserInfo.headPhotoPath = userInfoWX.avatarUrl;
    app.globalData.basicUserInfo.nickName = userInfoWX.nickName;
    app.globalData.basicUserInfo.gender = userInfoWX.gender;
    app.globalData.basicUserInfo.isRegister = true;
    if (app.globalData.basicUserInfo.isRegister) {
      self.insertDiscussContent();
      self.cancelLogin();
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
        self.setData({
          totalCoin: res.totalCoin
        });
      },
      function(res) {
        console.error("存入用户信息失败!");
      })
  },

  
  appendDiscussContent: function() {
    var self = this;
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

    //文本安全性校验
    app.httpPost(
      'Letter/MsgSecCheck', {
        "TextContent": self.data.discussContent
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
          self.insertDiscussContent();
        }
      },
      function(res) {
        self.insertDiscussContent();
      }
    )
  },


  //发表评论
  insertDiscussContent: function() {
    let self = this;
    let content = self.data.discussContent;
    if (content != null && content != '' && content.length > 0) {
      self.insertDiscussContentToList(content);
      app.httpPost(
        'Letter/Discuss', {
          "UId": app.globalData.apiHeader.UId,
          "MomentId": self.data.momentDetail.momentId,
          "PickUpId": self.data.pickUpId,
          "TextContent": content
        },
        function(res) {
          if (res.isExecuteSuccess) {
            self.discussDetail();
            self.sendMessage();
            console.info("发表评论成功");
          }
        },
        function(res) {
          console.error("发表评论失败");
        })
    }
  },


  insertDiscussContentToList: function(textContent) {
    var self = this;
    let userinfo = app.globalData.basicUserInfo;
    let detailList = self.data.discussDetailList;
    if (userinfo != null && userinfo != "") {
      let discuss = {};
      discuss.pickUpUId = app.globalData.apiHeader.UId;
      discuss.headImgPath = userinfo.headPhotoPath;
      discuss.recentChatTime = '刚刚';
      discuss.isMyReply = true;
      discuss.textContent = textContent;
      discuss.gender = self.data.myDetail.gender;
      discuss.nickName = self.data.myDetail.nickName;
      discuss.headImgPath = self.data.myDetail.headImgPath;
      discuss.isHide = self.data.myDetail.isHide;
      discuss.shortNickName = self.data.myDetail.shortNickName;
      detailList.push(discuss);

      self.setData({
        discussDetailList: detailList,
        discussContent: ""
      });

      if (self.data.myDetail.showHideStatus != 0) {
        let hideArea = 'myDetail.showHideStatus';
        self.setData({
          [hideArea]: 0
        })
      }

      self.toBottom();
    }
  },

  //更多
  moreAction: function(ops) {
    this.setData({
      showModalStatus: true
    })
  },

  //清除未读消息
  clearUnReadCount: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/ClearUnReadCount', {
          "UId": app.globalData.apiHeader.UId,
          "PickUpId": self.data.pickUpId
        },
        function(res) {
          console.info("清除未读消息成功！")
        },
        function(res) {
          console.info("清除未读消息Http失败！")
        })
    }
  },

  //举报瓶子
  reportItem: function(ops) {
    this.hideModalShare();
    var self = this;
    app.httpPost(
      'Letter/ReportBottle', {
        "PickUpId": self.data.pickUpId
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

  //设置为匿名
  updateShowNickName: function() {
    var self = this;
    app.httpPost(
      'Letter/UpdateHiding', {
        "PickUpId": self.data.pickUpId,
        "MomentId": self.data.momentDetail.momentId,
        "UId": app.globalData.apiHeader.UId,
        "IsHide": false,
        "HidingNickName": ""
      },
      function(res) {
        if (res.success) {
          wx.showToast({
            title: "设置成功",
            icon: 'success',
            duration: 1500
          });
        } else {
          console.error("更新用户身份状态失败");
        }
      },
      function(res) {
        console.error("更新用户身份状态失败");
      })
  },


  //设置为匿名
  updateHiding: function(isHide) {
    var self = this;
    app.httpPost(
      'Letter/UpdateHiding', {
        "PickUpId": self.data.pickUpId,
        "MomentId": self.data.momentDetail.momentId,
        "UId": app.globalData.apiHeader.UId,
        "IsHide": true,
        "HidingNickName": self.data.tempHidingNickName
      },
      function(res) {
        if (res.success) {
          console.info("更新用户身份状态成功！");
          let hideArea = 'myDetail.showHideStatus';
          self.setData({
            [hideArea]: 2
          })
          wx.showToast({
            title: "设置成功",
            icon: 'success',
            duration: 1500
          });
          self.cancelChangeHide();
          self.discussDetail();
        } else {
          console.error("更新用户身份状态失败");
          self.cancelChangeHide();
        }
      },
      function(res) {
        console.error("更新用户身份状态失败");
      })
  },

  saveLocal: function() {
    this.hideModalShare();
    this.createPoster(this.data.momentDetail.imgContent);
  },

  //添加收藏
  addCollect: function(ops) {
    var self = this;
    app.httpPost(
      'Letter/AddCollect', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.momentDetail.momentId,
        "PickUpId": self.data.pickUpId,
        "FromPage": "discussDetailPage"
      },
      function(res) {
        if (res.isExecuteSuccess) {
          console.info("添加收藏成功！");
          wx.showToast({
            title: "收藏成功",
            icon: 'success',
            duration: 1500
          });
        }
      },
      function(res) {
        console.info("收藏瓶子失败");
      })

    this.hideModalShare();
  },

  hideModalShare: function() {
    this.setData({
      showModalStatus: false
    })
  },

  //分享功能
  onShareAppMessage: function(res) {
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    this.hideModalShare();
    if (app.isBlank(this.data.momentDetail)) {
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
    let momentId = this.data.momentDetail.momentId;
    if (this.data.momentDetail.textContent != "" && this.data.momentDetail.textContent != null) {
      title = this.data.momentDetail.textContent;
    }
    if (this.data.momentDetail.imgContent != "" && this.data.momentDetail.imgContent != null) {
      url = this.data.momentDetail.imgContent;
    }
    return {
      title: title,
      imageUrl: url,
      path: "/pages/sharepage/sharepage?momentId=" + momentId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },



  // 创建海报
  createPoster: function(backImg) {
    if (backImg == null || backImg == "" || backImg.length == 0) {
      wx.showToast({
        title: "动态无图片，不支持保存本地",
        icon: 'none',
        duration: 3000
      });
      return;
    }

    app.showLoading('正在生成...')
    /// 绘制的内容
    const writing = {
      bigImage: '',
      code: 'https://www.pikaer.com/common/image/20191008_21841_86ce3d6c-7662-405c-8f4e-041782050225.jpg'
    };
    writing.bigImage = backImg;
    /// 绘制
    this.draw('poster', 650, 1000, writing).then(res => {
      setTimeout(() => {
        app.hideLoading();
        this.setData({
          isCreate: true,
          isShow: true
        })
      }, 300)
    }, err => {
      setTimeout(() => {
        app.hideLoading();
        app.showToast('生成海报失败');
      }, 300)
    })
  },

  /// 隐藏
  catchtap: function(callback) {
    this.setData({
      isShow: false
    })
    setTimeout(() => {
      this.setData({
        isCreate: false
      })
      if (callback && typeof callback == "function") {
        callback();
      }
    }, 400)
  },

  /// 绘制文本
  drawText: function(options) {
    /// 获取总行数
    var allRow = Math.ceil(options.ctx.measureText(options.str).width / options.maxWidth);
    /// 限制行数
    var count = allRow >= options.maxLine ? options.maxLine : allRow,
      /// 当前字符串的截断点
      endPos = 0;
    /// 设置文字颜色
    options.ctx.setFillStyle(options.style ? options.style : '#353535');
    /// 设置字体大小
    options.ctx.setFontSize(options.fontSize ? options.fontSize : rate(20));
    /// 循环截断
    for (var j = 0; j < count; j++) {
      /// 当前剩余的字符串
      var nowStr = options.str.slice(endPos),
        /// 每一行当前宽度
        rowWid = 0,
        /// 每一行顶部距离
        y = options.y + (count == 1 ? 0 : j * options.height);
      /// 如果当前的字符串宽度大于最大宽度，然后开始截取
      if (options.ctx.measureText(nowStr).width > options.maxWidth) {
        for (var m = 0; m < nowStr.length; m++) {
          /// 计算当前字符串总宽度
          rowWid += options.ctx.measureText(nowStr[m]).width;
          if (rowWid > options.maxWidth) {
            /// 如果是最后一行
            if (j === options.maxLine - 1) {
              options.ctx.fillText(nowStr.slice(0, m - 1) + '...', options.x, y);
            } else {
              options.ctx.fillText(nowStr.slice(0, m), options.x, y);
            }
            /// 保留下次截断点
            endPos += m;
            break;
          }
        }
      } else { /// 如果当前的字符串宽度小于最大宽度就直接输出
        options.ctx.fillText(nowStr.slice(0), options.x, y);
      }
    }
  },

  /// 绘制海报 1、canvas对象 2、canvas宽 3、canvas高 4、绘制的内容
  draw: function(canvas, cavW, cavH, writing) {
    return new Promise((resolve, reject) => {
      if (!writing || !canvas) {
        reject();
        return;
      }

      /// 创建context
      var ctx = wx.createCanvasContext(canvas);
      ctx.clearRect(0, 0, rate(cavW), rate(cavH));

      /// 获取大的背景图
      let promise1 = new Promise(function(resolve, reject) {
        wx.getImageInfo({
          src: writing.bigImage,
          success: function(res) {
            resolve(res.path);
          },
          fail: function(err) {
            reject(err);
          }
        })
      });

      /// 获取小程序码图片
      let promise2 = new Promise(function(resolve, reject) {
        wx.getImageInfo({
          src: writing.code,
          success: function(res) {
            resolve(res.path);
          },
          fail: function(err) {
            reject(err);
          }
        })
      });

      /// 同步回调
      Promise.all(
        [promise1, promise2]
      ).then(res => {

        /// 绘制底色
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, rate(cavW), rate(cavH));

        /// 绘制背景图
        ctx.drawImage(res[0], 0, 0, rate(628), rate(710));

        /// 绘制小程序码
        ctx.drawImage(res[1], 0, rate(710), rate(628), rate(175));

        /// 绘制  
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'poster',
            fileType: 'png',
            success: res => {
              this.setData({
                poster: res.tempFilePath
              })
              resolve();
            },
            fail: err => {
              reject();
            }
          })
        });
      }, err => {
        reject();
      })
    })
  },

  /// 保存图片
  btnCreate: function(obj) {
    app.showLoading('正在保存...')
    wx.saveImageToPhotosAlbum({
      filePath: this.data.poster,
      success: res => {
        app.hideLoading();
        this.catchtap(() => {
          wx.showToast({
            title: '保存成功'
          })
        });
      },
      fail: err => {
        app.hideLoading();
        this.catchtap(() => {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        });
      }
    });
  },


  inputfoucus: function(obj) {
    this.setData({
      inputfoucusOn: true,
      keyBoardHeight: obj.detail.height
    })
    this.toBottom();
  },

  inputblur: function(obj) {
    this.setData({
      inputfoucusOn: false,
      keyBoardHeight: 0
    })
    this.toBottom();
  },
})