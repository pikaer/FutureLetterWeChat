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
    discussDetail: {},
    discussDetailList: [],
    pickUpId: "",
    discussContent: "",
    inputMarBot: false,
    showModal: false,
    showModalStatus: false,
    showLoginModal: false,
    showLoginModalStatus: false,
    basicUserInfo: {},
    isCreate: false,
    isShow: false,
    partnerUId:0
  },

  onLoad: function(options) {
    this.setData({
      discussDetail: app.globalData.currentDiscussMoment
    })

    if (options.pickUpId != "undefined" && options.pickUpId!=""){
      this.data.pickUpId = options.pickUpId
    }

    if (options.partnerUId != "undefined" && options.partnerUId>0){
      this.data.partnerUId = parseInt(options.partnerUId);
    }

    this.discussDetail();
    this.initData();
    this.onLineConnected();
  },

  //通知对方刷新聊天页面
  sendMessage: function() {
    this.onLineHub.send("subScribeMessage",this.data.partnerUId);
  },


  onLineConnected: function() {
    this.onLineHub = new HubConnection();
    var url = app.globalData.socketUrl + "onLineHub";

    this.onLineHub.start(url, {
      UId: app.globalData.apiHeader.UId,
      PartnerUId: this.data.partnerUId,
      ConnetType:2
    });

    this.onLineHub.onOpen = res => {
      console.info("成功开启连接");
    };

    //订阅对方发来的消息
    this.onLineHub.on("receive", res => {
      console.info("成功订阅消息");
      this.discussDetail();
      this.clearUnReadCount();
    })
  },

  //卸载页面，中断webSocket
  onUnload: function() {
    this.onLineHub.close({
      UId: app.globalData.apiHeader.UId,
      ConnetType: 1
    })
  },

  //数据初始化
  initData: function() {
    try {
      if (!app.isBlank(this.data.pickUpId)){
        let cacheValue = wx.getStorageSync(this.data.pickUpId);
        if (!app.isBlank(cacheValue)) {
          this.setData({
            discussDetail: cacheValue,
            discussDetailList: cacheValue.discussDetailList
          })
        }
      }else{
        let cacheKey = "momentId_" + this.data.discussDetail.momentId + "uId" + app.globalData.apiHeader.UId + "partnerUId" + this.data.partnerUId;
        let cacheValue = wx.getStorageSync(cacheKey);
        if (!app.isBlank(cacheValue)) {
          this.setData({
            discussDetail: cacheValue,
            discussDetailList: cacheValue.discussDetailList
          })
        }
      }
    } catch (e) {
      console.error("discussDetailPage:数据初始化异常");
    }
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
      'api/Letter/BasicUserInfo', {
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


  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.discussDetail();
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

  //获取动态
  discussDetail: function() {
    var self = this;
    app.httpPost(
      'api/Letter/DiscussDetail', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.discussDetail.momentId,
        "PartnerUId": self.data.partnerUId,
        "PickUpId": self.data.pickUpId,
      },
      function(res) {
        if (!app.isBlank(res)) {
          let tempDetailList = res.discussDetailList;
          self.setData({
            discussDetail: res,
            pickUpId: res.pickUpId,
            discussDetailList: tempDetailList
          });
          app.setCache(res.pickUpId, res);
          let cacheKey = "momentId_" + self.data.discussDetail.momentId + "uId" + app.globalData.apiHeader.UId+ "partnerUId" + self.data.partnerUId;
          app.setCache(cacheKey, res);
        }
        app.globalData.currentDiscussMoment = {};
        wx.stopPullDownRefresh();
      },
      function(res) {
        console.info("获取数据失败");
        wx.stopPullDownRefresh();
      })
  },

  cancelLogin: function() {
    this.setData({
      showLoginModal: false
    });
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
      'api/Letter/SetUserInfo', {
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
      'api/Letter/MsgSecCheck', {
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
        'api/Letter/Discuss', {
          "UId": app.globalData.apiHeader.UId,
          "MomentId": self.data.discussDetail.momentId,
          "PartnerUId": self.data.partnerUId,
          "PickUpId": self.data.pickUpId,
          "TextContent": content
        },
        function(res) {
          if (res.isExecuteSuccess) {
            self.discussDetail();
            self.setData({
              discussContent: ""
            });
            self.sendMessage();
            console.info("发表评论成功");
          }
        },
        function(res) {
          self.setData({
            discussContent: ""
          });
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
      discuss.nickName = userinfo.nickName;
      discuss.pickUpUId = app.globalData.apiHeader.UId;
      discuss.headImgPath = userinfo.headPhotoPath;
      discuss.recentChatTime = '刚刚';
      discuss.textContent = textContent;
      detailList.unshift(discuss);
      self.setData({
        discussDetailList: detailList
      });
    }
    self.setData({
      discussContent: ""
    });
  },

  // 评论输入框聚焦时，设置与底部的距离
  settingMbShow: function() {
    this.setData({
      inputMarBot: true
    })
  },
  //  评论输入框失去聚焦时，设置与底部的距离（默认状态）
  settingMbNoShow: function() {
    this.setData({
      inputMarBot: false
    })
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
        'api/Letter/ClearUnReadCount', {
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
      'api/Letter/ReportBottle', {
        "PickUpId": self.data.discussDetail.pickUpId
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

  saveLocal: function() {
    this.hideModalShare();
    this.createPoster(this.data.discussDetail.imgContent);
  },

  //添加收藏
  addCollect: function(ops) {
    var self = this;
    app.httpPost(
      'api/Letter/AddCollect', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.discussDetail.momentId,
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
    this.hideModalShare();

    let momentId = this.data.discussDetail.momentId;
    let url = "";
    let title = "今日份一张图";
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
})