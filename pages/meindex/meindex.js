//获取应用实例
const app = getApp()

Page({
  data: {
    tempDiscussList: [],
    tempMomentList: [],
    tempCollectList: [],
    basicUserInfo: {},
    actionHidden: true, //长按action
    deleteMomentHidden: true,
    selectItem: [], //长按后选中的
    selectMomentItem: [],
    pageIndex: 1,
    pageCollectIndex: 1,
    showModal: false,
    tempHeadImgPath: "",
    currentTab: 0, //当前所在tab
    indicatorDots: false, //底部不展示小点
    vertical: false, //水平翻页
    autoplay: false, //自动翻页
    circular: false, //循环播放
    interval: 2000,
    duration: 500, //翻页时间间隔
    previousMargin: 0, //前边距
    nextMargin: 0 //后边距
  },

  onShow: function () {
    this.getMyMomentList(); 
    this.getCollectList(); 
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

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  // 滑动切换tab
  bindChange: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
  },

  //tab切换
  toPublishList: function (e) {
    this.setData({
      currentTab: 0
    });
    this.getMyMomentList();
  },


  toCollectList: function (e) {
    this.setData({
      currentTab: 1
    });
    this.getCollectList();
  },

  //下拉刷新页面数据
  onPullDownRefresh: function () {
    this.getChatList();
  },

  //动态详情页面
  previewMomentDetail: function (e) {
    let pickUpId = e.currentTarget.dataset.pickupid;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId
    })
  },

  setTabBarBadge: function (count) {
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
  getMyMomentList: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/MyMomentList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": self.data.pageIndex
        },
        function (res) {
          console.info("获取聊天列表成功！")

          self.setData({
            tempMomentList: res.momentList
          });

        },
        function (res) {
          console.error("获取聊天列表失败！");
        })
    }
  },

  //获取收藏列表数据
  getCollectList: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/GetCollectList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": self.data.pageCollectIndex
        },
        function (res) {
          console.info("获取收藏列表数据成功！")

          self.setData({
            tempCollectList: res.collectList
          });

        },
        function (res) {
          console.error("获取收藏列表数据失败！");
        })
    }
  },

  //长按删除对话弹框
  bindlongpress: function (ops) {
    this.setData({
      actionHidden: false,
      selectItem: ops.currentTarget.dataset
    })
  },

  //重置长按选择项
  resetSelectItem: function () {
    this.setData({
      actionHidden: true,
      selectItem: []
    })
  },

  //长按删除对话弹框
  bindlongMomentPress: function (ops) {
    this.setData({
      deleteMomentHidden: false,
      selectMomentItem: ops.currentTarget.dataset
    })
  },

  //重置长按选择项
  resetSelectMomentItem: function () {
    this.setData({
      deleteMomentHidden: true,
      selectMomentItem: []
    })
  },


  //全部清空
  deleteAllBottle: function () {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DeleteAllBottle', {
          "UId": app.globalData.apiHeader.UId
        },
        function (res) {
          console.info("删除对话成功！");
          self.setData({
            tempDiscussList: []
          });
          self.resetSelectItem();
          self.setTabBarBadge("");
        },
        function (res) {
          console.error("全部清空失败");
        });
    }
  },


  //删除单个
  deleteMoment: function () {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DeleteMoment', {
          "MomentId": self.data.selectMomentItem.momentid
        },
        function (res) {
          console.info("删除动态成功！");
          let list = self.data.tempMomentList;
          list.splice(self.data.selectMomentItem.index, 1);
          self.setData({
            tempMomentList: list
          });
          //重置数据
          self.resetSelectMomentItem();
        },
        function (res) {
          console.error("删除动态失败！");
          //重置数据
          self.resetSelectMomentItem();
        })
    }
  },


  //删除所有动态
  deleteAllMoment: function () {
    var self = this;
    wx.showModal({
      content: '将清空所有发布的动态！',
      success(res) {
        if (app.globalData.apiHeader.UId > 0) {
          app.httpPost(
            'api/Letter/DeleteAllMoment', {
              "UId": app.globalData.apiHeader.UId
            },
            function (res) {
              console.info("删除所有动态成功！");
              self.setData({
                tempMomentList: []
              });
              //重置数据
              self.resetSelectMomentItem();
            },
            function (res) {
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