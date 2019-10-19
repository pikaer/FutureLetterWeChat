const app = getApp()
const auth = require('../../utils/auth.js');
// 获取倍率
const raterpx = 750.0 / wx.getSystemInfoSync().windowWidth;
// 获取canvas转化后的rpx
const rate = function (rpx) {
  return rpx / raterpx
};

Page({
  data: {
    momentDetail: {},
    momentId: "",
    showModal: false,
    basicUserInfo: {},
    showinputarea: false,
    showModalStatus: false,
    isCreate: false,
    isShow: false
  },

  onLoad: function (options) {
    if (options.momentId != null && options.momentId!=""){
      this.setData({
        momentId: options.momentId
      });
    }

    this.momentDetail();
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

  //获取动态
  momentDetail: function () {
    var self = this;
    let cacheKey = "momentDetail+" + self.data.momentId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        momentDetail: cacheValue,
      });
    } else {
      app.httpPost(
        'api/Letter/MomentDetail', {
          "MomentId": self.data.momentId
        },
        function (res) {
          self.setData({
            momentDetail: res
          });
          app.setCache(cacheKey, res);
        },
        function (res) {
          console.info("获取数据失败");
        })
    }
  },

  //获取用户基础信息
  toShowModal: function (ops) {
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
      function (res) {
        self.setData({
          basicUserInfo: res
        });
        if (!isRefreshCache) {
          self.setData({
            showModal: true
          });
        }
        app.setCache(cacheKey, res);
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
    this.showModalShare()
  },

  saveLocal: function () {
    this.hideModalShare();
    this.createPoster(this.data.momentDetail.imgContent);
  },


  //显示遮罩层
  showModalShare: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "ease",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  hideModalShare: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "ease",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },

  //分享功能
  onShareAppMessage: function (res) {
    this.hideModalShare();
    let momentId = this.data.momentId;
    let url = "";
    let title = "今日份一张图";
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
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  /// 创建海报
  createPoster: function (backImg) {
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
  catchtap: function (callback) {
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
  drawText: function (options) {
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
  draw: function (canvas, cavW, cavH, writing) {
    return new Promise((resolve, reject) => {
      if (!writing || !canvas) {
        reject();
        return;
      }

      /// 创建context
      var ctx = wx.createCanvasContext(canvas);
      ctx.clearRect(0, 0, rate(cavW), rate(cavH));

      /// 获取大的背景图
      let promise1 = new Promise(function (resolve, reject) {
        wx.getImageInfo({
          src: writing.bigImage,
          success: function (res) {
            resolve(res.path);
          },
          fail: function (err) {
            reject(err);
          }
        })
      });

      /// 获取小程序码图片
      let promise2 = new Promise(function (resolve, reject) {
        wx.getImageInfo({
          src: writing.code,
          success: function (res) {
            resolve(res.path);
          },
          fail: function (err) {
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
  btnCreate: function (obj) {
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
  }
})