//获取应用实例
const app = getApp()

Page({
  data: {
    tempDiscussList: [],
    tempMomentList: [],
    tempCollectList: [],
    basicUserInfo: {},
    selectMomentItem: [],
    selectCollectItem: [],
    correntSelectItem: 1,
    pageIndex: 1,
    pageCollectIndex: 1,
    currentTab: 0, //当前所在tab
    indicatorDots: false, //底部不展示小点
    vertical: false, //水平翻页
    autoplay: false, //自动翻页
    circular: false, //循环播放
    interval: 2000,
    duration: 500, //翻页时间间隔
    previousMargin: 0, //前边距
    nextMargin: 0, //后边距
    showModalStatus: false,
  },

  onShow: function() {
    this.getMyMomentList();
    this.getCollectList();
  },



  // 滑动切换tab
  bindChange: function(e) {
    this.setData({
      currentTab: e.detail.current
    });
  },

  //tab切换至动态
  toPublishList: function(e) {
    this.setData({
      currentTab: 0
    });
    this.getMyMomentList();
  },

  //tab切换至收藏
  toCollectList: function(e) {
    this.setData({
      currentTab: 1
    });
    this.getCollectList();
  },

  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.getChatList();
  },

  //动态详情页面
  previewMomentDetail: function(e) {
    let pickUpId = e.currentTarget.dataset.pickupid;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId
    })
  },

  setTabBarBadge: function(count) {
    if (!app.isBlank(count)) {
      wx.setTabBarBadge({
        index: 1,
        text: count
      })
    } else {
      wx.removeTabBarBadge({
        index: 1
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
          "PageIndex": self.data.pageIndex
        },
        function(res) {
          console.info("获取聊天列表成功！")

          self.setData({
            tempMomentList: res.momentList
          });

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
          "PageIndex": self.data.pageCollectIndex
        },
        function(res) {
          console.info("获取收藏列表数据成功！")

          self.setData({
            tempCollectList: res.collectList
          });

        },
        function(res) {
          console.error("获取收藏列表数据失败！");
        })
    }
  },

  //长按删除对话弹框
  bindlongMomentPress: function(ops) {
    let type = ops.currentTarget.dataset.type;
    if (type == 1) {
      this.setData({
        selectMomentItem: ops.currentTarget.dataset,
        correntSelectItem: 1
      })
    }
    if (type == 2)
      this.setData({
        selectCollectItem: ops.currentTarget.dataset,
        correntSelectItem: 2
      })

    this.showModalShare();
  },

  //重置长按选择项
  resetSelectMomentItem: function() {
    this.setData({
      selectMomentItem: [],
      selectCollectItem: []
    })
  },

  //保存本地
  saveLocal: function() {
    if (this.data.correntSelectItem == 1) {
      wx.showToast({
        title: "功能开发中，敬请期待",
        icon: 'none',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: "功能开发中，敬请期待",
        icon: 'none',
        duration: 1500
      });
    }
  },

  //全部清空
  clearItem: function() {
    if (this.data.correntSelectItem == 1) {
      this.deleteAllMoment();
    } else {

    }
  },

  //单个删除
  deleteItem: function() {
    if (this.data.correntSelectItem == 1) {
      this.deleteMoment();
    } else {

    }
  },


  //分享功能
  onShareAppMessage: function(res) {
    if (this.data.correntSelectItem == 1) {
      this.shareMoment();
    } else {
      this.shareCollext();
    }
  },


  //分享动态
  shareMoment: function() {
    let momentId = this.data.selectMomentItem.momentId;
    let index = this.data.selectMomentItem.key;
    let list = this.data.tempMomentList;
    let url = "";
    let title = "今日份一张图";
    if (list[index].textContent != "" && list[index].textContent != null) {
      title = list[index].textContent;
    }
    if (list[index].imgContent != "" && list[index].imgContent != null) {
      url = list[index].imgContent;
    }
    return {
      title: title,
      imageUrl: url,
      path: "/pages/startup/startup?momentId=" + momentId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  //分享收藏
  shareCollext: function() {
    let momentId = this.data.selectCollectItem.momentId;
    let index = this.data.selectCollectItem.key;
    let list = this.data.tempCollectList;
    let url = "";
    let title = "今日份一张图";
    if (list[index].textContent != "" && list[index].textContent != null) {
      title = list[index].textContent;
    }
    if (list[index].imgContent != "" && list[index].imgContent != null) {
      url = list[index].imgContent;
    }
    return {
      title: title,
      imageUrl: url,
      path: "/pages/startup/startup?momentId=" + momentId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },



  //显示遮罩层
  showModalShare: function() {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
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

  //隐藏底部弹框
  hideModalShare: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
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

  //删除单个
  deleteMoment: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DeleteMoment', {
          "MomentId": self.data.selectMomentItem.momentid
        },
        function(res) {
          console.info("删除动态成功！");
          let list = self.data.tempMomentList;
          list.splice(self.data.selectMomentItem.index, 1);
          self.setData({
            tempMomentList: list
          });
          //重置数据
          self.resetSelectMomentItem();
        },
        function(res) {
          console.error("删除动态失败！");
          //重置数据
          self.resetSelectMomentItem();
        })
    }
  },


  //删除所有动态
  deleteAllMoment: function() {
    var self = this;
    wx.showModal({
      content: '将清空所有发布的动态！',
      success(res) {
        if (app.globalData.apiHeader.UId > 0) {
          app.httpPost(
            'api/Letter/DeleteAllMoment', {
              "UId": app.globalData.apiHeader.UId
            },
            function(res) {
              console.info("删除所有动态成功！");
              self.setData({
                tempMomentList: []
              });
              //重置数据
              self.resetSelectMomentItem();
            },
            function(res) {
              console.error("删除所有动态失败！");
              //重置数据
              self.resetSelectMomentItem();
            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})