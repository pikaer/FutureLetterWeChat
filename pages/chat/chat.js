//获取应用实例
const app = getApp()
import {
  HubConnection
} from "../../utils/signalR.js";

Page({
  data: {
    tempDiscussList: [],
    basicUserInfo: {},
    selectItem: [], //长按后选中的
    pageIndex: 1,
    showModal: false,
    showDialog: false,
    groups: [{
        text: '标为已读',
        value: 1
      },
      {
        text: '全部已读',
        value: 2
      },
      {
        text: '删除会话',
        type: 'warn',
        value: 3
      },
      {
        text: '全部清空',
        type: 'warn',
        value: 4
      }
    ],
    slideButtons: [{
      text: '已读'
    }, {
      type: 'warn',
      text: '删除',
      extClass: 'btnDelete'
    }],
  },

  onLoad: function() {
    this.setData({
      tempDiscussList: app.globalData.tempDiscussList
    });
    app.globalData.currentDiscussMoment = {};
  },

  slideButtonTap(ops) {
    this.setData({
      selectItem: ops.currentTarget.dataset
    })
    if (ops.detail.index == 1) {
      this.deleteChat();
    } else {
      this.clearUnReadCount(ops);
    }
  },

  onShow: function() {
    this.getChatList();
    this.onConnected();
  },

  //卸载页面，中断webSocket
  onUnload: function() {
    this.onDisconnected();
  },

  //卸载页面，中断webSocket
  onDisconnected: function() {
    try {
      this.hubConnect.close({
        UId: app.globalData.apiHeader.UId,
        ConnetType: 1
      })
    } catch (e) {
      console.error(JSON.stringify(e));
    }

  },

  //连接WebSocket
  onConnected: function() {
    this.hubConnect = new HubConnection();
    var url = app.globalData.socketUrl + "onLineHub";

    this.hubConnect.start(url, {
      UId: app.globalData.apiHeader.UId,
      ConnetType: 1
    });

    this.hubConnect.onOpen = res => {
      console.info("成功开启连接");
    };

    //订阅对方发来的消息
    this.hubConnect.on("receive", res => {
      console.info("成功订阅消息");
      this.getChatList();
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
    this.onDisconnected();
    this.clearUnReadCount(e);
    let pickUpId = e.currentTarget.dataset.pickupid;
    let uId = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId + "&partnerUId=" + uId
    })
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
          app.globalData.tempDiscussList = res.discussList;
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
          app.globalData.tempDiscussList = self.data.tempDiscussList
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
      showDialog: true,
      selectItem: ops.currentTarget.dataset
    })
  },

  btnClick(e) {
    if (e.detail.value == 1) {
      this.toHasRead();
    } else if (e.detail.value == 2) {
      this.toAllHasRead();
    } else if (e.detail.value == 3) {
      this.deleteChat();
    } else if (e.detail.value == 4) {
      this.deleteAllBottle();
    } else {
      console.log(e)
    }
  },

  //重置长按选择项
  resetSelectItem: function() {
    this.setData({
      showDialog: false,
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
          app.globalData.tempDiscussList = self.data.tempDiscussList;
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
              app.globalData.tempDiscussList = [];
              self.resetSelectItem();
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
          "PickUpId": self.data.selectItem.pickupid,
          "DeleteType": 1
        },
        function(res) {
          console.info("删除对话成功！");
          let list = self.data.tempDiscussList;
          list.splice(self.data.selectItem.index, 1);
          self.setData({
            tempDiscussList: list
          });
          app.globalData.tempDiscussList = list;
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

  //分享功能
  onShareAppMessage: function (res) {
    return {
      title: "最懂你的灵魂，即将与你相遇",
      imageUrl: "",
      path: "/pages/discovery/discovery",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
  

})