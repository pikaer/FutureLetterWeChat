//获取应用实例
const app = getApp()

Page({
  data: {
    tempDiscussList: [],
    basicUserInfo: {},
    actionHidden: true, //长按action
    selectItem: [], //长按后选中的
    pageIndex: 1,
    showModal: false
  },

  onLoad: function() {
    app.globalData.currentDiscussMoment = {};
    this.setData({
      tempDiscussList: app.globalData.tempDiscussList
    });
  },

  onShow: function() {
    app.unReadTotalCount();
    this.getChatList();
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

  hideModal: function() {
    this.setData({
      showModal: false
    });
  },


  //动态详情页面
  previewMomentDetail: function(e) {
    app.globalData.currentDiscussMoment={};
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

  //获取用户数据
  getChatList: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DiscussList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": self.data.pageIndex
        },
        function(res) {
          console.info("获取聊天列表成功！")

          self.setData({
            tempDiscussList: res.discussList
          });

          self.setTabBarBadge(res.currentTotalUnReadCount);
          //获取聊天数据结束后，停止刷新下拉
          wx.stopPullDownRefresh();
        },
        function(res) {
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
          app.unReadTotalCount();
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


  //全部清空
  deleteAllBottle: function() {
    var self = this;
    wx.showModal({
      content: '将清空所有对话！',
      success(res) {
        if (res.confirm && app.globalData.apiHeader.UId > 0) {
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
      }
    })
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

})