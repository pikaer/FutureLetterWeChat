const app = getApp()
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
  },

  onLoad: function() {
    this.setData({
      pageIndex: 1
    });
    this.getPickUpList(true);
  },


  onShow: function() {
    this.setData({
      pageIndex: 1
    });
    this.getPickUpList(true);
    this.unReadTotalCount();
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
      path: "/pages/startup/startup?momentId=" + momentId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  //更新未读总条数
  unReadTotalCount: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/UnReadTotalCount', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          self.setTabBarBadge(res.unReadCount);
        },
        function(res) {
          console.error("更新未读总条数失败！");
        })
    }
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


  //获取用户基础信息
  toShowModal: function(ops) {
    var self = this;
    self.setData({
      basicUserInfo: {},
      currentTargetPickUpId: ops.currentTarget.dataset.pickupid
    });
    app.httpPost(
      'api/Letter/BasicUserInfo', {
        "UId": ops.currentTarget.dataset.uid
      },
      function(res) {
        self.setData({
          basicUserInfo: res,
          showModal: true
        });
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
        "PickUpId": pickUpId
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

  saveLocal: function(){
    this.hideModalShare();
    wx.showToast({
      title: "功能开发中，敬请期待",
      icon: 'none',
      duration: 1500
    });
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
  addCollect: function (ops) {

    this.hideModalShare();
    
    var self = this;
    app.httpPost(
      'api/Letter/AddCollect', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.currentMoment.momentId,
        "PickUpId": self.data.currentMoment.pickUpId,
        "FromPage": "discoveryPage"
      },
      function (res) {
        if (res.isExecuteSuccess){
          console.info("添加收藏成功！");
          self.resetSelectItem();
          wx.showToast({
            title: "收藏成功",
            icon: 'success',
            duration: 1500
          });
        }
      },
      function (res) {
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
        "PageIndex": this.data.pageIndex
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
        "UId": app.globalData.apiHeader.UId
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
        wx.stopPullDownRefresh();
      },
      function(res) {
        console.info("获取数据失败");
        wx.stopPullDownRefresh();
      })
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
  }
})