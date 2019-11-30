const app = getApp()
import {
  HubConnection
} from "../../utils/signalR.js";
import auth from '../../utils/auth.js';
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
    currentBasicUserInfo: {},
    pickUpList: [],
    attentionList: [],
    currentTargetPickUpId: "",
    pageIndex: 1,
    attentionPageIndex: 1,
    loadTopHide: true,
    showModal: false,
    showModalStatus: false,
    showModalStatusAttention: false,
    isCreate: false,
    isShow: false,
    showStartUp: true,
    unReadCount: "",
    onloadText: "查看更多>>",
    showPublishMomentModal: false,
    onPullDownRefreshDisabled: false,
    statusBarHeight: app.globalData.statusBarHeight,
    currentTab: 0, //当前所在tab
    indicatorDots: false, //底部不展示小点
    vertical: false, //水平翻页
    autoplay: false, //自动翻页
    circular: false, //循环播放
    interval: 2000,
    duration: 500, //翻页时间间隔
    previousMargin: 0, //前边距
    nextMargin: 0, //后边距
    topNum: 0,
    totalCoin: 0, //金币余额
    coinNotifyBtns: [{ text: '取消' }, { text: '发布动态' }]
  },

  onLoad: function() {
    this.userLogin();
  },

  onShow: function() {
    this.unReadCountRefresh();
    this.onConnected();
    this.checkRegister();
    this.refreshMomentListData();
    this.getTotalCoin();
  },

  //初始化数据
  init: function() {
    this.unReadCountRefresh();
    this.getGolobalPickUpList();
    this.getChatList();
    this.getMyMomentList();
    this.getCollectList();
    this.onConnected();
    this.getAttentionList(true);
    this.getTotalCoin();
  },

  //卸载页面
  onUnload: function() {
    this.onDisconnected();
  },

  //刷新页面
  refreshMomentListData: function() {
    if (!app.isBlank(this.data.currentBasicUserInfo)) {
      this.data.pageIndex = 1;
      this.getPickUpList(true);
    }
  },

  //卸载页面，中断webSocket
  onDisconnected: function() {
    try {
      this.hubConnect.close({
        UId: app.globalData.apiHeader.UId
      })
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  },


  //获取我扔出去的没有被评论的动态
  getTotalCoin: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/UserCoinInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function (res) {
          console.info("获取用户金币信息成功！")
          self.setData({
            totalCoin: res.totalCoin
          });
        },
        function (res) {
          console.error("获取用户金币信息失败！");
        })
    }
  },

  checkRegister: function() {
    let self = this;
    if ((!app.isBlank(self.data.currentBasicUserInfo) && !self.data.currentBasicUserInfo.isRegister) ||
      app.globalData.needCheckUseInfo) {
      app.httpPost(
        'api/Letter/BasicUserInfo', {
          "UId": app.globalData.apiHeader.UId,
          "Type":1
        },
        function(res) {
          self.setData({
            currentBasicUserInfo: res,
            totalCoin: res.totalCoin
          });
        },
        function(res) {
          console.error("获取用户基础信息失败");
        })
    }
  },

  //用户登录
  userLogin: function() {
    let self = this;
    wx.login({
      success: res => {
        console.log(JSON.stringify(res));
        if (res.code) {
          self.getLoginInfo(res.code);
        }
      }
    })
  },

  unReadCountRefresh: function() {
    if (app.globalData.apiHeader.UId <= 0) {
      return;
    }
    let self = this;
    app.httpPost(
      'api/Letter/UnReadTotalCount', {
        "UId": app.globalData.apiHeader.UId
      },
      function(res) {
        self.setData({
          unReadCount: res.unReadCount
        });
      },
      function(res) {
        console.error("刷新未读数量失败!");
      })
  },

  //获取OpenId
  getLoginInfo: function(code) {
    let self = this;
    app.httpPost(
      'api/Letter/UserLogin', {
        "LoginCode": code
      },
      function(res) {
        if (res != null && res.uId > 0) {
          //res.uId=30094;
          console.info("登录成功");
          app.globalData.basicUserInfo = res;
          app.globalData.apiHeader.UId = res.uId;
          self.setData({
            currentBasicUserInfo: res
          });
          self.init();
        } else {
          console.error("登录失败!");
        }
      },
      function(res) {
        console.error("登录失败!");
      })
  },

  //连接WebSocket
  onConnected: function() {
    if (app.globalData.apiHeader.UId <= 0) {
      return;
    }
    this.hubConnect = new HubConnection();
    var url = app.globalData.socketUrl + "onLineHub";

    this.hubConnect.start(url, {
      UId: app.globalData.apiHeader.UId
    });

    this.hubConnect.onOpen = res => {
      console.info("成功开启连接");
    };

    //订阅对方发来的消息
    this.hubConnect.on("receive", res => {
      console.info("成功订阅消息");
      this.unReadCountRefresh();
    })
  },

  //通知对方刷新聊天页面
  sendMessage: function() {
    //todo 待优化
    this.hubConnect.send("subScribeMessage", app.globalData.apiHeader.UId, 0);
  },

  //获取动态
  getGolobalPickUpList: function() {
    var self = this;
    app.httpPost(
      'api/Letter/PickUpList', {
        "UId": app.globalData.apiHeader.UId,
        "PageIndex": 1
      },
      function(res) {
        self.setData({
          pickUpList: res.pickUpList,
          showStartUp: false
        });
      },
      function(res) {
        console.info("获取数据失败");
        self.setData({
          showStartUp: false
        });
      })
  },


  //获取用户数据
  getChatList: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DiscussList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          console.info("获取聊天列表成功！")
          app.globalData.tempDiscussList = res.discussList;
        },
        function(res) {
          console.error("获取聊天列表失败！");
          self.setData({
            showStartUp: false
          });
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
          "PageIndex": 1
        },
        function(res) {
          console.info("获取聊天列表成功！")
          app.globalData.tempMomentList = res.momentList;
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
          "PageIndex": 1
        },
        function(res) {
          app.globalData.tempCollectList = res.collectList;
        },
        function(res) {
          console.error("获取收藏列表数据失败！");
        })
    }
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

  hideModalShare: function() {
    this.setData({
      showModalStatus: false,
      showModalStatusAttention: false
    })
  },


  hidePublishMomentModal: function() {
    this.setData({
      showPublishMomentModal: false
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
    this.onDisconnected();
    this.hideModal();
    let pickUpId = this.data.currentTargetPickUpId;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId
    })
  },

  //用户主页
  toUserPage: function() {
    this.onDisconnected();
    this.hideModal();
    let pickUpId = this.data.currentTargetPickUpId;
    wx.navigateTo({
      url: "../../pages/meindex/meindex"
    })
  },

  toTop: function() {
    this.setData({
      topNum: 0
    });
  },


  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.toTop();
    if (!this.data.loadTopHide) {
      //防止并发请求
      return;
    }
    this.setData({
      loadTopHide: false
    });
    if (this.data.currentTab == 1) {
      this.setData({
        currentTab: 0
      });
    }
    this.getPickUp();
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

        wx.showToast({
          title: "删除成功",
          icon: 'success',
          duration: 1500
        });
        self.resetSelectItem()
      },
      function(res) {
        wx.showToast({
          title: "删除失败",
          icon: 'none',
          duration: 1500
        });
        console.info("删除瓶子失败");
      })
  },

  //删除瓶子
  forwardMoment: function(ops) {
    this.hideModalShare();
    let momentId = this.data.currentMoment.momentId;
    app.httpPost(
      'api/Letter/ForwardMoment', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": momentId
      },
      function(res) {
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 1500
        });
      },
      function(res) {
        wx.showToast({
          title: "转发失败",
          icon: 'none',
          duration: 1500
        });
      })
  },


  //发表评论
  insertDiscussContent: function(ops) {
    this.hideModalShare();
    var self = this;
    let pickUpId = this.data.currentMoment.pickUpId;
    app.httpPost(
      'api/Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "PickUpId": pickUpId,
        "TextContent": "Hi~"
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "打招呼成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage();
          console.info("打招呼成功");
        }
      },
      function(res) {
        wx.showToast({
          title: "打招呼失败",
          icon: 'none',
          duration: 1500
        });
        console.error("打招呼失败");
      })
  },


  //发表评论
  insertAttentionDiscussContent: function (ops) {
    this.hideModalShare();
    var self = this;
    app.httpPost(
      'api/Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": this.data.currentMoment.momentId,
        "PartnerUId": this.data.currentMoment.uId,
        "TextContent": "Hi~"
      },
      function (res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "打招呼成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage();
          console.info("打招呼成功");
        }
      },
      function (res) {
        wx.showToast({
          title: "打招呼失败",
          icon: 'none',
          duration: 1500
        });
        console.error("打招呼失败");
      })
  },

  //添加关注
  addAttention: function(ops) {
    this.hideModalShare();
    var self = this;
    let uid = this.data.currentMoment.uId;
    app.httpPost(
      'api/Letter/AddAttention', {
        "UId": app.globalData.apiHeader.UId,
        "PartnerUId": uid
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "关注成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage();
          console.info("关注成功");
        }
      },
      function(res) {
        wx.showToast({
          title: "关注失败",
          icon: 'none',
          duration: 1500
        });
        console.error("关注失败");
      })
  },

  //取消关注
  cancelAttention: function(ops) {
    this.hideModalShare();
    var self = this;
    let uid = this.data.currentMoment.uId;
    app.httpPost(
      'api/Letter/CancelAttention', {
        "UId": app.globalData.apiHeader.UId,
        "PartnerUId": uid
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "取消成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage();
          self.toAttentionList();
          console.info("取消成功");
        }
      },
      function(res) {
        wx.showToast({
          title: "取消失败",
          icon: 'none',
          duration: 1500
        });
        console.error("关注失败");
      })
  },


  onlineNotify: function(ops) {
    this.hideModalShare();
    var self = this;
    let uid = this.data.currentMoment.uId;
    app.httpPost(
      'api/Letter/OnlineNotify', {
        "UId": app.globalData.apiHeader.UId,
        "PartnerUId": uid
      },
      function(res) {
        if (res.success) {
          wx.showToast({
            title: "设置成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage();
          console.info("设置成功");
        }
      },
      function(res) {
        wx.showToast({
          title: "设置失败",
          icon: 'none',
          duration: 1500
        });
        console.error("设置失败");
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
    let pickUpList = this.data.pickUpList;
    this.setData({
      selectItem: ops.currentTarget.dataset,
      currentMoment: pickUpList[key],
      showModalStatus: true
    })
    app.globalData.currentDiscussMoment.momentId = pickUpList[key].momentId;
    app.globalData.currentDiscussMoment.momentUId = pickUpList[key].uId;
    app.globalData.currentDiscussMoment.headImgPath = pickUpList[key].headImgPath;
    app.globalData.currentDiscussMoment.nickName = pickUpList[key].nickName;
    app.globalData.currentDiscussMoment.textContent = pickUpList[key].textContent;
    app.globalData.currentDiscussMoment.imgContent = pickUpList[key].imgContent;
    app.globalData.currentDiscussMoment.createTime = pickUpList[key].createTime;
  },

  //更多
  moreAtteitionAction: function(ops) {
    let key = ops.currentTarget.dataset.key;
    let attentionList = this.data.attentionList;
    this.setData({
      selectItem: ops.currentTarget.dataset,
      currentMoment: attentionList[key],
      showModalStatusAttention: true
    })
    app.globalData.currentDiscussMoment.momentId = attentionList[key].momentId;
    app.globalData.currentDiscussMoment.momentUId = attentionList[key].uId;
    app.globalData.currentDiscussMoment.headImgPath = attentionList[key].headImgPath;
    app.globalData.currentDiscussMoment.nickName = attentionList[key].nickName;
    app.globalData.currentDiscussMoment.textContent = attentionList[key].textContent;
    app.globalData.currentDiscussMoment.imgContent = attentionList[key].imgContent;
    app.globalData.currentDiscussMoment.createTime = attentionList[key].createTime;
  },

  //重置
  resetSelectItem: function() {
    this.hideModalShare();
  },


  handletouchtart: function(event) {
    this.data.lastY = event.touches[0].pageY
  },

  handletouchmove: function(event) {
    let currentY = event.touches[0].pageY
    let ty = currentY - this.data.lastY
    if (ty > 30 && currentY < 700 && this.data.currentTab == 0) {
      this.onPullDownRefresh();
    }
  },

  //清除未读消息
  clearUnReadCount: function(pickUpId) {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/ClearUnReadCount', {
          "UId": app.globalData.apiHeader.UId,
          "PickUpId": pickUpId
        },
        function(res) {
          console.info("清除未读消息成功！")
          self.unReadCountRefresh();
        },
        function(res) {
          console.info("清除未读消息Http失败！")
        })
    }
  },

  //触底加载更多数据
  onReachBottom: function() {
    if (this.data.currentTab == 0) {
      let page = this.data.pageIndex + 1;
      this.setData({
        pageIndex: page,
        onloadText: "加载中..."
      });
      let self = this;
      //loading动画加载1.5秒后执行
      setTimeout(function() {
        self.getPickUpList(false);
      }, 1000)
    } else {
      let page = this.data.attentionPageIndex + 1;
      this.setData({
        attentionPageIndex: page,
        onloadText: "加载中..."
      });
      let self = this;
      //loading动画加载1.5秒后执行
      setTimeout(function() {
        self.getAttentionList(false);
      }, 1000)
    }
  },

  //tab切换至动态
  bindChange: function(e) {
    if (e.detail.current == 1) {
      this.setData({
        loadTopHide: false,
        currentTab: 1,
        attentionPageIndex: 1
      });
      this.toTop();
      this.getAttentionList(true);
    } else {
      this.setData({
        currentTab: 0,
        pageIndex: 1
      });
    }
  },

  toDiscoryList: function(e) {
    this.setData({
      currentTab: 0,
      pageIndex: 1
    });
  },

  toAttentionList: function(e) {
    this.setData({
      currentTab: 1
    });
    this.getAttentionList(true);
  },


  //动态详情页面
  previewMomentDetail: function(e) {
    this.onDisconnected();
    let pickUpId = e.currentTarget.dataset.pickupid;
    let key = e.currentTarget.dataset.key;
    let pickUpList = this.data.pickUpList;
    this.clearUnReadCount(pickUpId);
    app.globalData.currentDiscussMoment.momentId = pickUpList[key].momentId;
    app.globalData.currentDiscussMoment.momentUId = pickUpList[key].uId;
    app.globalData.currentDiscussMoment.headImgPath = pickUpList[key].headImgPath;
    app.globalData.currentDiscussMoment.nickName = pickUpList[key].nickName;
    app.globalData.currentDiscussMoment.textContent = pickUpList[key].textContent;
    app.globalData.currentDiscussMoment.imgContent = pickUpList[key].imgContent;
    app.globalData.currentDiscussMoment.createTime = pickUpList[key].createTime;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId + "&partnerUId=" + pickUpList[key].uId
    })
  },


  //动态详情页面
  previewAtentionMomentDetail: function (e) {
    this.onDisconnected();
    let key = e.currentTarget.dataset.key;
    let attentionList = this.data.attentionList;
    app.globalData.currentDiscussMoment.momentId = attentionList[key].momentId;
    app.globalData.currentDiscussMoment.momentUId = attentionList[key].uId;
    app.globalData.currentDiscussMoment.headImgPath = attentionList[key].headImgPath;
    app.globalData.currentDiscussMoment.nickName = attentionList[key].nickName;
    app.globalData.currentDiscussMoment.textContent = attentionList[key].textContent;
    app.globalData.currentDiscussMoment.imgContent = attentionList[key].imgContent;
    app.globalData.currentDiscussMoment.createTime = attentionList[key].createTime;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?partnerUId=" + attentionList[key].uId
    })
  },

  //发布动态
  publishMoment: function() {
    this.onDisconnected();
    wx.navigateTo({
      url: '../../pages/publishmoment/publishmoment'
    })
    this.hidePublishMomentModal();
  },

  //金币余额
  toCoinDetailPage: function() {
    this.onDisconnected();
    wx.navigateTo({
      url: '../../pages/coin/coin'
    })
  },

  toChatPage: function() {
    this.onDisconnected();
    wx.navigateTo({
      url: '../../pages/chat/chat'
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
          pickUpList: tempPickUpList,
          onloadText: "查看更多>>"
        });

        console.info("获取动态成功");
      },
      function(res) {
        console.info("获取数据失败");
        self.setData({
          onloadText: "查看更多>>"
        });
      })
  },

  //获取关注用户的动态
  getAttentionList: function(onShow) {
    var self = this;
    if (onShow) {
      self.setData({
        attentionPageIndex: 1
      });
    }
    let tempAttentionList = self.data.attentionList;
    app.httpPost(
      'api/Letter/AttentionList', {
        "UId": app.globalData.apiHeader.UId,
        "PageIndex": this.data.attentionPageIndex
      },
      function(res) {
        if (onShow) {
          tempAttentionList = res.attentionList
        } else {
          if (tempAttentionList.length == 0) {
            tempAttentionList = res.attentionList
          } else {
            if (res.attentionList != null && res.attentionList.length > 0) {
              tempAttentionList = tempAttentionList.concat(res.attentionList);
            }
          }
        }
        self.setData({
          attentionList: tempAttentionList,
          onloadText: "查看更多>>"
        });

        self.stopPullDownRefresh();
        console.info("获取关注用户的动态成功");
      },
      function(res) {
        console.info("获取关注用户的动态失败");
        self.stopPullDownRefresh();
        self.setData({
          onloadText: "查看更多>>"
        });
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
            title: '没有更多动态啦，去发布一个吧~',
            icon: 'none',
            duration: 3000
          })
        }
        self.stopPullDownRefresh();
        self.getTotalCoin();
      },
      function(res) {
        console.info("获取数据失败");
        //金币余额不足
        if (res.code == 80002) {
          self.setData({
            showPublishMomentModal: true
          });
        } else {
          wx.showToast({
            title: res.resultMessage,
            icon: 'none',
            duration: 3000
          })
        }

        self.stopPullDownRefresh();
      })
  },

  //休眠2秒，防止数据获取太快看不到加载动图
  stopPullDownRefresh: function() {
    let times = 0;
    let self = this;
    var timer = setInterval(function() {
      times++
      if (times >= 1) {
        self.setData({
          loadTopHide: true
        });
        clearInterval(timer)
      }
    }, 1000)
  },

  //清空所有未回复过的瓶子
  allClear: function() {
    var self = this;
    wx.showModal({
      content: '将清空所有消息!',
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
  }
})