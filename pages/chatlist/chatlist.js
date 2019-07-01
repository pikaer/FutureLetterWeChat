//获取应用实例
const app = getApp()

Page({

  data: {
    tempDiscussList: [],
    tempMomentList: [],
    basicUserInfo: {},
    actionHidden: true, //长按action
    deleteMomentHidden: true,
    selectItem: [], //长按后选中的
    selectMomentItem: [],
    pageIndex: 1,
    isChatList: true,
    showModal: false,
    tempHeadImgPath: "",
  },


  onShow: function() {
    this.unReadTotalCount();
    this.getChatList();
    this.getMyMomentList();
  },

  onLoad: function() {
    this.getHeadImgPath();
    this.getMyMomentList();
  },

  //tab切换
  toChatList: function() {
    this.setData({
      isChatList: true
    });
    this.getChatList();
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

  toPulish: function() {
    this.setData({
      isChatList: false
    });
    this.getMyMomentList();
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
  getHeadImgPath: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/BasicUserInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function (res) {
          console.info("获取用户头像成功！")
          self.setData({
            tempHeadImgPath: res.headPhotoPath
          });
        },
        function (res) {
          console.error("获取用户头像失败！");
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


  //获取用户数据
  getChatList: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DiscussList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": self.data.pageIndex
        },
        function (res) {
          console.info("获取聊天列表成功！")

          self.setData({
            tempDiscussList: res.discussList
          });

          self.setTabBarBadge(res.currentTotalUnReadCount);
          //获取聊天数据结束后，停止刷新下拉
          wx.stopPullDownRefresh();
        },
        function (res) {
          console.error("获取聊天列表失败！");
          //获取聊天数据结束后，停止刷新下拉
          wx.stopPullDownRefresh();
        })
    }
  },

  //清除未读消息
  clearUnReadCount: function(ops) {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/ClearUnReadCount', {
          "UId": app.globalData.apiHeader.UId,
          "PickUpId": ops.currentTarget.dataset.pickupid
        },
        function(res) {
          console.info("清除未读消息成功！")
          self.data.tempDiscussList[ops.currentTarget.dataset.index].unReadCount = '';
          self.setData({
            tempDiscussList: self.data.tempDiscussList
          })

          self.setTabBarBadge(res.currentTotalUnReadCount);
        },
        function(res) {
          console.info("清除未读消息Http失败！")
        })
    }
  },

  //更多动作
  moreAction: function() {
    this.setData({
      moreActionHidden: false
    })
  },


  //长按删除对话弹框
  bindlongpress: function(ops) {
    this.setData({
      actionHidden: false,
      selectItem: ops.currentTarget.dataset
    })
  },

  //重置长按选择项
  resetSelectItem: function() {
    this.setData({
      actionHidden: true,
      selectItem: []
    })
  },

   //长按删除对话弹框
   bindlongMomentPress: function(ops) {
    this.setData({
      deleteMomentHidden: false,
      selectMomentItem: ops.currentTarget.dataset
    })
  },

  //重置长按选择项
  resetSelectMomentItem: function() {
    this.setData({
      deleteMomentHidden: true,
      selectMomentItem: []
    })
  },

  //标为已读
  toHasRead: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/ClearUnReadCount', {
          "UId": app.globalData.apiHeader.UId,
          "PickUpId": self.data.selectItem.pickupid
        },
        function(res) {
          console.info("清除未读消息成功！")
          self.data.tempDiscussList[self.data.selectItem.index].unReadCount = '';
          self.setData({
            tempDiscussList: self.data.tempDiscussList
          })
          self.unReadTotalCount();
          self.resetSelectItem();
        },
        function(res) {
          self.resetSelectItem();
        })
    }
  },

  //全部标为已读
  toAllHasRead: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/ClearAllUnReadCount', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          self.getChatList();
          self.resetSelectItem();
          self.setTabBarBadge("");
        },
        function(res) {
          self.resetSelectItem();
          console.error("全部标为已读失败！");
        })
    }
  },

  //删除对话
  deleteChat: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DeleteBottle', {
          "UId": app.globalData.apiHeader.UId,
          "PickUpId": self.data.selectItem.pickupid
        },
        function(res) {
          console.info("删除对话成功！");
          let list = self.data.tempDiscussList;
          list.splice(self.data.selectItem.index, 1);
          self.setData({
            tempDiscussList: list
          });
          self.setTabBarBadge(res.currentTotalUnReadCount);
          //重置数据
          self.resetSelectItem();
        },
        function(res) {
          console.error("删除对话Http失败！");
          //重置数据
          self.resetSelectItem();
        })
    }
  },

  //全部清空
  deleteAllBottle: function() {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DeleteAllBottle', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          console.info("删除对话成功！");
          self.setData({
            tempDiscussList: []
          });
          self.resetSelectItem();
          self.setTabBarBadge("");
        },
        function(res) {
          console.error("全部清空失败");
        });
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