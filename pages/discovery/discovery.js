const app = getApp()
Page({
  data: {
    currentMoment: {},
    basicUserInfo: {},
    pickUpList: [],
    pageIndex: 1,
    loadHide: true,
    actionHidden: true,
    scrollHidden: true,
    showModal:false,
  },

  onShow: function() {
    this.setData({
      pageIndex: 1
    });
    this.getPickUpList(true);
  },

  onLoad: function() {
    this.setData({
      pageIndex: 1
    });
    this.getPickUpList(true);
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

  hideModal:function() {
    this.setData({
      showModal: false
    });
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
  deleteItem: function() {
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

  //举报瓶子
  reportItem: function(ops) {
    var self = this;
    let pickUpId = this.data.currentMoment.pickUpId;
    app.httpPost(
      'api/Letter/ReportBottle', {
        "PickUpId": pickUpId
      },
      function(res) {
        console.info("举报瓶子成功！");
        self.resetSelectItem()
      },
      function(res) {
        console.info("举报瓶子失败");
        self.resetSelectItem()
      })
  },

  //更多
  moreAction: function(ops) {
    let key = ops.currentTarget.dataset.key;
    let pickUpId = ops.currentTarget.dataset.pickUpId;
    let pickUpList = this.data.pickUpList;
    this.setData({
      actionHidden: false,
      selectItem: ops.currentTarget.dataset,
      currentMoment: pickUpList[key]
    })
  },

  //重置
  resetSelectItem: function() {
    this.setData({
      actionHidden: true,
      selectItem: []
    })
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

  //监听滚动条位置
  onPageScroll: function(e) { // 获取滚动条当前位置
    if (e.scrollTop > 700) {
      this.setData({
        scrollHidden: false
      });
    } else {
      this.setData({
        scrollHidden: true
      });
    }
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

  //跳转个人空间页面
  toSpace: function(e) {
    let uId = e.currentTarget.dataset.uId;
    wx.navigateTo({
      url: "../../pages/userspace/userspace?uid=" + uId
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
            title: '没有更多瓶子啦',
            icon: 'none',
            duration: 1500
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
						function (res) {
							console.info("清空所有未回复过的瓶子成功");
							self.setData({
								pickUpList: []
							});
              self.resetSelectItem()
						},
						function (res) {
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