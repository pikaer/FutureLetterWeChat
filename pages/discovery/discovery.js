const app = getApp()
const auth = require('../../utils/auth.js');
// 获取倍率
const raterpx = 750.0 / wx.getSystemInfoSync().windowWidth;
// 获取canvas转化后的rpx
const rate = function(rpx) {
  return rpx / raterpx
};

Page({
  data: {
    currentMoment: {},
    basicUserInfo: {},
    pickUpList: [],
    currentTargetPickUpId: "",
    pageIndex: 1,
    loadHide: true,
    showModal: false,
    showModalStatus: false,
    isCreate: false,
    isShow: false
  },

  onLoad: function() {
    if (app.globalData.pickUpList != null && app.globalData.pickUpList.length > 0) {
      this.setData({
        pickUpList: app.globalData.pickUpList
      });
    } else {
      this.setData({
        pageIndex: 1
      });
      this.getPickUpList(true);
    }
  },


  onShow: function() {
    app.unReadTotalCount();
  },

  //分享功能
  onShareAppMessage: function(res) {
    this.hideModalShare();
    let momentId = this.data.currentMoment.momentId;
    let url = "";
    let title = "今日份一张图";
    if (this.data.currentMoment.textContent != "" && this.data.currentMoment.textContent != null) {
      title = this.data.currentMoment.textContent;
    }
    if (this.data.currentMoment.imgContent != "" && this.data.currentMoment.imgContent != null) {
      url = this.data.currentMoment.imgContent;
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

  sharebtn: function() {
    this.setData({
      pageIndex: 1
    });
    this.getPickUpList(true);
  },

  //显示遮罩层
  showModalShare: function() {
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
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  hideModalShare: function() {
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
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
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

    self.setData({
      currentTargetPickUpId: ops.currentTarget.dataset.pickupid
    });
    app.httpPost(
      'api/Letter/BasicUserInfo', {
        "UId": ops.currentTarget.dataset.uid
      },
      function(res) {
        self.setData({
          basicUserInfo: res,
        });
        if (!isRefreshCache) {
          self.setData({
            showModal: true
          });
        }
        app.setCache(cacheKey, res);
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },

  //隐藏弹框
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },

  //聊一聊
  toChat: function() {
    this.hideModal();
    let pickUpId = this.data.currentTargetPickUpId;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId
    })
  },


  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.toTop();
    this.getPickUp();
  },

  //停止刷新
  stopRefresh: function() {
    this.setData({
      loadHide: true
    });
  },

  //删除瓶子
  deleteItem: function(ops) {

    this.hideModalShare();

    var self = this;
    let pickUpId = this.data.currentMoment.pickUpId;
    let index = this.data.selectItem.key;
    app.httpPost(
      'api/Letter/DeleteBottle', {
        "UId": app.globalData.apiHeader.UId,
        "PickUpId": pickUpId,
        "DeleteType": 0
      },
      function(res) {
        console.info("删除瓶子成功！");
        let list = self.data.pickUpList;
        list.splice(index, 1);
        self.setData({
          pickUpList: list
        });

        self.resetSelectItem()
      },
      function(res) {
        console.info("删除瓶子失败");
      })
  },

  saveLocal: function() {
    this.hideModalShare();

    this.createPoster(this.data.currentMoment.imgContent);
  },

  //举报瓶子
  reportItem: function(ops) {
    this.hideModalShare();
    var self = this;
    let pickUpId = this.data.currentMoment.pickUpId;
    app.httpPost(
      'api/Letter/ReportBottle', {
        "PickUpId": pickUpId
      },
      function(res) {
        console.info("举报瓶子成功！");
        self.resetSelectItem();

        wx.showToast({
          title: "举报成功",
          icon: 'success',
          duration: 1500
        });
      },
      function(res) {
        console.info("举报瓶子失败");
        self.resetSelectItem()
      })
  },


  //添加收藏
  addCollect: function(ops) {
    this.hideModalShare();
    var self = this;
    app.httpPost(
      'api/Letter/AddCollect', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.currentMoment.momentId,
        "PickUpId": self.data.currentMoment.pickUpId,
        "FromPage": "discoveryPage"
      },
      function(res) {
        if (res.isExecuteSuccess) {
          console.info("添加收藏成功！");
          self.resetSelectItem();
          wx.showToast({
            title: "收藏成功",
            icon: 'success',
            duration: 1500
          });
        }
      },
      function(res) {
        console.info("收藏瓶子失败");
        self.resetSelectItem()
      })
  },

  //更多
  moreAction: function(ops) {
    let key = ops.currentTarget.dataset.key;
    let pickUpId = ops.currentTarget.dataset.pickUpId;
    let pickUpList = this.data.pickUpList;
    this.setData({
      selectItem: ops.currentTarget.dataset,
      currentMoment: pickUpList[key]
    })
    this.showModalShare()

    app.globalData.currentDiscussMoment.momentId = pickUpList[key].momentId;
    app.globalData.currentDiscussMoment.momentUId = pickUpList[key].uId;
    app.globalData.currentDiscussMoment.headImgPath = pickUpList[key].headImgPath;
    app.globalData.currentDiscussMoment.nickName = pickUpList[key].nickName;
    app.globalData.currentDiscussMoment.textContent = pickUpList[key].textContent;
    app.globalData.currentDiscussMoment.imgContent = pickUpList[key].imgContent;
    app.globalData.currentDiscussMoment.createTime = pickUpList[key].createTime;
  },

  //重置
  resetSelectItem: function() {
    this.hideModalShare();
  },

  //触底加载更多数据
  onReachBottom: function() {
    let page = this.data.pageIndex + 1;
    this.setData({
      loadHide: false,
      pageIndex: page
    });

    let self = this;
    //loading动画加载1.5秒后执行
    setTimeout(function() {
      self.getPickUpList(false);
    }, 1000)

  },

  //置顶
  toTop: function() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  //动态详情页面
  previewMomentDetail: function(e) {
    let pickUpId = e.currentTarget.dataset.pickupid;
    let key = e.currentTarget.dataset.key;
    let pickUpList = this.data.pickUpList;
    app.globalData.currentDiscussMoment.momentId = pickUpList[key].momentId;
    app.globalData.currentDiscussMoment.momentUId = pickUpList[key].uId;
    app.globalData.currentDiscussMoment.headImgPath = pickUpList[key].headImgPath;
    app.globalData.currentDiscussMoment.nickName = pickUpList[key].nickName;
    app.globalData.currentDiscussMoment.textContent = pickUpList[key].textContent;
    app.globalData.currentDiscussMoment.imgContent = pickUpList[key].imgContent;
    app.globalData.currentDiscussMoment.createTime = pickUpList[key].createTime;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId
    })
  },

  //发布动态
  publishMoment: function() {
    wx.navigateTo({
      url: '../../pages/publishmoment/publishmoment'
    })
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

  //获取动态
  getPickUpList: function(onShow) {
    var self = this;
    let tempPickUpList = self.data.pickUpList;
    app.httpPost(
      'api/Letter/PickUpList', {
        "UId": app.globalData.apiHeader.UId,
        "PageIndex": this.data.pageIndex,
        "MomentType": 0
      },
      function(res) {
        if (onShow) {
          tempPickUpList = res.pickUpList
        } else {
          if (tempPickUpList.length == 0) {
            tempPickUpList = res.pickUpList
          } else {
            if (res.pickUpList != null && res.pickUpList.length > 0) {
              tempPickUpList = tempPickUpList.concat(res.pickUpList);
            }
          }
        }
        self.setData({
          pickUpList: tempPickUpList
        });
        self.stopRefresh();
      },
      function(res) {
        console.info("获取数据失败");
        self.stopRefresh();
      })
  },

  //下拉获取新的瓶子
  getPickUp: function() {
    var self = this;
    let tempPickUpList = self.data.pickUpList;
    app.httpPost(
      'api/Letter/PickUp', {
        "UId": app.globalData.apiHeader.UId,
        "MomentType": 0
      },
      function(res) {
        if (res.pickUpList.length != 0) {
          if (tempPickUpList.length == 0) {
            tempPickUpList = res.pickUpList
          } else {
            if (res.pickUpList != null && res.pickUpList.length > 0) {
              tempPickUpList = res.pickUpList.concat(tempPickUpList);
            }
          }
          self.setData({
            pickUpList: tempPickUpList
          });
        } else {
          wx.showToast({
            title: '没有更多动态啦，去发布一个吧！',
            icon: 'none',
            duration: 3000
          })
        }
        self.stopPullDownRefresh();
      },
      function(res) {
        console.info("获取数据失败");
        wx.showToast({
          title: res.resultMessage,
          icon: 'none',
          duration: 3000
        })
        self.stopPullDownRefresh();
      })
  },

  //休眠2秒，防止数据获取太快看不到加载动图
  stopPullDownRefresh: function() {
    let times = 0;
    var timer = setInterval(function() {
      times++
      if (times >=1) {
        wx.stopPullDownRefresh();
        clearInterval(timer)
      }
    }, 1000)
  },

  //清空所有未回复过的瓶子
  allClear: function() {
    var self = this;
    wx.showModal({
      content: '将清空所有消息！',
      success(res) {
        if (res.confirm) {
          app.httpPost(
            'api/Letter/ClearAllBottle', {
              "UId": app.globalData.apiHeader.UId
            },
            function(res) {
              console.info("清空所有未回复过的瓶子成功");
              self.setData({
                pickUpList: []
              });
              self.resetSelectItem()
            },
            function(res) {
              console.warn("清空所有未回复过的瓶子失败");
              self.resetSelectItem()
            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },


  /// 创建海报
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
      code: 'https://www.pikaer.com/common/image/20190728_171477_315c8a6b-de1e-4090-99df-ae0b02c020fd.jpg'
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
  }
})