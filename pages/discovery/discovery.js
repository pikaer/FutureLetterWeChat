const app = getApp()
import {
  HubConnection
} from "../../utils/signalR.js";
import auth from '../../utils/auth.js';

Page({
  data: {
    currentMoment: {},
    basicUserInfo: {},
    currentBasicUserInfo: {}, //用作头像展示和是否注册监控
    pickUpList: [],
    attentionList: [],
    currentTargetPickUpId: "",
    pageIndex: 1,
    attentionPageIndex: 1,
    loadTopHide: true,
    showModal: false,
    showChatModal: false,
    showModalStatus: false,
    showModalStatusAttention: false,
    showLoginModal: false,
    isCreate: false,
    isShow: false,
    showStartUp: true,
    unReadMomentCount: "",
    onloadText: "查看更多>>",
    showPublishMomentModal: false,
    onPullDownRefreshDisabled: false,
    statusBarHeight: app.globalData.statusBarHeight,
    currentTab: 0, //当前所在tab
    topNum: 0,
    insertDialogDiscussVlaue: "", //快速评论内容
    subscribeMessageOpen: false,
    messageReplyNotifyWechatId: "-zecjwuk6Z0uN1txUSwvgXKmaek081c1Y9t6mqAn6ck",
    messageReplyNotifyQQId: "59880ab542241403ede33bb4c64f0166",
    momentTextContent: ""
  },

  onLoad: function() {
    wx.hideTabBar();
    this.userLogin();
  },

  onShow: function() {
    this.unReadCountRefresh();
    this.checkRegister();
    this.refreshMomentListData();
    this.getAttentionMomentCount();
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
    this.getAttentionMomentCount();
  },

  //卸载页面
  onUnload: function() {
    console.info("卸载页面，断开连接")
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
        UId: app.globalData.apiHeader.UId,
        ConnetType: 0
      })
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  },

  //跳转至个人空间
  toUserSpace: function(uid) {
    wx.navigateTo({
      url: "../../pages/userspace/userspace?uId=" + uid
    })
  },


  toNineRecommend: function(uid) {
    wx.navigateTo({
      url: "../../pages/ninerecommend/ninerecommend"
    })
  },

  toMapPage: function(uid) {
    wx.navigateTo({
      url: "../../pages/map/map"
    })
  },

  getAttentionMomentCount: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/AttentionMomentCount', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          console.info("获取用户关注好友新增动态（未查阅）数量成功！")
          self.setData({
            unReadMomentCount: res.unReadCountStr
          });
        },
        function(res) {
          console.error("获取用户关注好友新增动态（未查阅）数量失败！");
        })
    }
  },

  updateLastScanMomentTime: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      self.setData({
        unReadMomentCount: ""
      });
      app.httpPost(
        'Letter/UpdateLastScanMomentTime', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          console.info("更新最新浏览关注好友动态时间成功！")
        },
        function(res) {
          console.error("更新最新浏览关注好友动态时间失败！");
        })
    }
  },


  checkRegister: function() {
    let self = this;
    if ((!app.isBlank(self.data.currentBasicUserInfo) && !self.data.currentBasicUserInfo.isRegister) ||
      app.globalData.needCheckUseInfo) {
      app.httpPost(
        'Letter/BasicUserInfo', {
          "UId": app.globalData.apiHeader.UId,
          "Type": 1
        },
        function(res) {
          self.setData({
            currentBasicUserInfo: res
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

    //优先获取缓存
    let cacheValue = wx.getStorageSync(app.globalData.userInfoBasicInfoCacheKey);
    let needInit = true;
    if (!app.isBlank(cacheValue) && cacheValue.uId > 0) {
      app.globalData.basicUserInfo = cacheValue;
      app.globalData.apiHeader.UId = cacheValue.uId;
      self.setData({
        currentBasicUserInfo: cacheValue
      });
      needInit = false;
      console.info("通过缓存登录成功!");
      self.init();
    }

    wx.login({
      success: res => {
        console.log(JSON.stringify(res));
        if (res.code) {
          self.getLoginInfo(res.code, needInit);
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
      'Letter/UnReadTotalCount', {
        "UId": app.globalData.apiHeader.UId
      },
      function(res) {
        if (!app.isBlank(res.unReadCount)) {
          wx.setTabBarBadge({
            index: 2,
            text: res.unReadCount
          })
        } else {
          wx.removeTabBarBadge({
            index: 2,
          })
        }
      },
      function(res) {
        console.error("刷新未读数量失败!");
      })
  },

  //获取OpenId
  getLoginInfo: function(code, needInit) {
    let self = this;
    app.httpPost(
      'Letter/UserLogin', {
        "LoginCode": code
      },
      function(res) {
        if (res != null && res.uId > 0) {
          //res.uId = 50239;
          console.info("登录成功");
          app.globalData.basicUserInfo = res;
          app.globalData.apiHeader.UId = res.uId;
          self.setData({
            currentBasicUserInfo: res
          });
          app.setCache(app.globalData.userInfoBasicInfoCacheKey, res);
          if (needInit) {
            self.init();
          }
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
      UId: app.globalData.apiHeader.UId,
      ConnetType: 0
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
  sendMessage: function(partnerUId) {
    try {
      this.hubConnect.send("subScribeMessage", partnerUId);
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  },

  //获取动态
  getGolobalPickUpList: function() {
    var self = this;
    let cacheKey = "userPickUpListCache+" + app.globalData.apiHeader.UId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        pickUpList: cacheValue,
        showStartUp: false
      });
      wx.showTabBar();
      console.info("获取全局瓶子列表缓存成功");
    }
    app.httpPost(
      'Letter/PickUpList', {
        "UId": app.globalData.apiHeader.UId,
        "PageIndex": 1
      },
      function(res) {
        self.setData({
          pickUpList: res.pickUpList,
          showStartUp: false
        });
        wx.showTabBar();
        app.setCache(cacheKey, res.pickUpList);
        console.info("获取全局瓶子列表成功");
        self.getUserLocation();
      },
      function(res) {
        console.info("获取全局瓶子列表数据失败");
        self.setData({
          showStartUp: false
        });
        self.getUserLocation();
      })
  },


  //获取用户数据
  getChatList: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/DiscussList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          console.info("获取聊天列表成功！")
          app.setCache("chatListCache", res.discussList);
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
        'Letter/MyMomentList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          console.info("获取聊天列表成功！")
          let cacheKey = "userMomentList_Uid_" + app.globalData.apiHeader.UId;
          app.setCache(cacheKey, res.momentList);
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
        'Letter/GetCollectList', {
          "UId": app.globalData.apiHeader.UId,
          "PageIndex": 1
        },
        function(res) {
          let cacheKey = "userCollectListCacheValue"
          app.setCache(cacheKey, res.collectList);
        },
        function(res) {
          console.error("获取收藏列表数据失败！");
        })
    }
  },

  //分享功能
  onShareAppMessage: function(res) {
    this.hideModalShare();
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    if (app.isBlank(this.data.currentMoment)) {
      return {
        title: title,
        imageUrl: url,
        path: "/pages/discovery/discovery",
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    }
    let momentId = this.data.currentMoment.momentId;
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

  hideChatModal: function() {
    this.setData({
      showChatModal: false
    })
  },

  showChatModal: function(ops) {
    if (!app.globalData.basicUserInfo.isRegister) {
      this.showLoginModal();
      return;
    }

    this.setMoreContent(ops);
    if (!app.isBlank(this.data.currentMoment.textContent)) {
      if (!app.isBlank(this.data.currentMoment.imgContent)) {
        if (this.data.currentMoment.textContent.length > 15) {
          this.setData({
            momentTextContent: this.data.currentMoment.textContent.substring(0, 15) + "..."
          })
        } else {
          this.setData({
            momentTextContent: this.data.currentMoment.textContent
          })
        }
      } else {
        if (this.data.currentMoment.textContent.length > 26) {
          this.setData({
            momentTextContent: this.data.currentMoment.textContent.substring(0, 25) + "..."
          })
        } else {
          this.setData({
            momentTextContent: this.data.currentMoment.textContent
          })
        }
      }
    }
    this.setData({
      showChatModal: true
    })
  },

  showAttentionChatModal: function(ops) {
    if (!app.globalData.basicUserInfo.isRegister) {
      this.showLoginModal();
      return;
    }

    this.setMoreAtteitionContent(ops);
    this.setData({
      showChatModal: true
    })
  },

  hidePublishMomentModal: function() {
    this.setData({
      showPublishMomentModal: false
    })
  },

  showLoginModal: function() {
    this.setData({
      showLoginModal: true
    })
  },



  //获取用户基础信息
  toShowModal: function(ops) {
    if (ops.currentTarget.dataset.ishide) {
      wx.showToast({
        title: "无法查看匿名用户的空间",
        icon: 'none',
        duration: 1500
      });
      return;
    }
    this.toUserSpace(ops.currentTarget.dataset.uid);
  },

  //隐藏弹框
  hideModal: function() {
    this.setData({
      showModal: false
    });
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
      'Letter/DeleteBottle', {
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


  //发表评论
  insertDiscussContent: function(ops) {
    this.hideModalShare();
    var self = this;
    let pickUpId = this.data.currentMoment.pickUpId;
    app.httpPost(
      'Letter/Discuss', {
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
          self.sendMessage(self.data.currentMoment.uId);
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


  //获取用户输入的用户名
  insertDialogDiscussInput: function(e) {
    this.data.insertDialogDiscussVlaue = e.detail.value
  },

  insertDialogContent: function() {
    if (this.data.selectItem.type == 1) {
      this.insertDialogDiscussContent();
    } else {
      this.insertDialogAttentionDiscussContent();
    }
  },

  //发表评论
  insertDialogDiscussContent: function() {
    if (this.data.insertDialogDiscussVlaue.length == 0) {
      wx.showToast({
        title: "内容不能为空",
        icon: 'none',
        duration: 1500
      });
      return;
    }
    this.hideChatModal();
    var self = this;
    let pickUpId = this.data.currentMoment.pickUpId;
    app.httpPost(
      'Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "PickUpId": pickUpId,
        "TextContent": this.data.insertDialogDiscussVlaue
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "评论成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage(self.data.currentMoment.uId);
          console.info("快速评论成功");
        }
      },
      function(res) {
        wx.showToast({
          title: "评论失败",
          icon: 'none',
          duration: 1500
        });
        console.error("快速评论失败");
      })
  },


  //发表评论
  insertAttentionDiscussContent: function(ops) {
    this.hideModalShare();
    var self = this;
    app.httpPost(
      'Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": this.data.currentMoment.momentId,
        "TextContent": "Hi~"
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "打招呼成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage(self.data.currentMoment.uId);
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
  insertDialogAttentionDiscussContent: function(ops) {
    if (this.data.insertDialogDiscussVlaue.length == 0) {
      wx.showToast({
        title: "内容不能为空",
        icon: 'none',
        duration: 1500
      });
      return;
    }
    this.hideChatModal();
    var self = this;
    app.httpPost(
      'Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": this.data.currentMoment.momentId,
        "TextContent": this.data.insertDialogDiscussVlaue
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "评论成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage(self.data.currentMoment.uId);
        }
      },
      function(res) {
        wx.showToast({
          title: "评论失败",
          icon: 'none',
          duration: 1500
        });
      })
  },

  //添加关注
  addAttention: function(ops) {
    this.hideModalShare();
    var self = this;
    let uid = this.data.currentMoment.uId;
    app.httpPost(
      'Letter/AddAttention', {
        "UId": app.globalData.apiHeader.UId,
        "PartnerUId": uid,
        "MomentId": this.data.currentMoment.momentId
      },
      function(res) {
        if (res.isExecuteSuccess) {
          wx.showToast({
            title: "关注成功",
            icon: 'success',
            duration: 1500
          });
          self.sendMessage(self.data.currentMoment.uId);
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
      'Letter/CancelAttention', {
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
      'Letter/OnlineNotify', {
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
      'Letter/ReportBottle', {
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
      'Letter/AddCollect', {
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
    if (!app.globalData.basicUserInfo.isRegister) {
      this.showLoginModal();
      return;
    }

    this.setMoreContent(ops);
    this.setData({
      showModalStatus: true
    })
  },

  setMoreContent: function(ops) {
    let key = ops.currentTarget.dataset.key;
    let pickUpList = this.data.pickUpList;
    this.setData({
      selectItem: ops.currentTarget.dataset,
      currentMoment: pickUpList[key]
    })
    let cacheKey = "momentDetail_momentId_" + pickUpList[key].momentId;
    app.setCache(cacheKey, pickUpList[key]);
  },


  //更多
  moreAtteitionAction: function(ops) {
    if (!app.globalData.basicUserInfo.isRegister) {
      this.showLoginModal();
      return;
    }

    this.setMoreAtteitionContent(ops);
    this.setData({
      showModalStatusAttention: true
    })
  },

  setMoreAtteitionContent: function(ops) {
    let key = ops.currentTarget.dataset.key;
    let attentionList = this.data.attentionList;
    this.setData({
      selectItem: ops.currentTarget.dataset,
      currentMoment: attentionList[key]
    })
    let cacheKey = "momentDetail_momentId_" + attentionList[key].momentId;
    app.setCache(cacheKey, attentionList[key]);
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
        'Letter/ClearUnReadCount', {
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
      this.updateLastScanMomentTime();
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
    this.updateLastScanMomentTime();
  },


  //动态详情页面
  previewMomentDetail: function(e) {
    let pickUpId = e.currentTarget.dataset.pickupid;
    let key = e.currentTarget.dataset.key;
    let pickUpList = this.data.pickUpList;
    this.clearUnReadCount(pickUpId);
    let cacheKey = "momentDetail_momentId_" + pickUpList[key].momentId;
    app.setCache(cacheKey, pickUpList[key]);
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId + "&partnerUId=" + pickUpList[key].uId + "&momentId=" + pickUpList[key].momentId
    })
  },


  //动态详情页面
  previewAtentionMomentDetail: function(e) {
    let key = e.currentTarget.dataset.key;
    let attentionList = this.data.attentionList;
    let cacheKey = "discussDetail_momentId_" + attentionList[key].momentId;
    app.setCache(cacheKey, attentionList[key]);
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?partnerUId=" + attentionList[key].uId + "&momentId=" + attentionList[key].momentId
    })
  },

  //发布动态
  publishMoment: function() {
    wx.navigateTo({
      url: '../../pages/publishmoment/publishmoment'
    })
    this.hidePublishMomentModal();
  },

  //金币余额
  toCoinDetailPage: function() {
    wx.navigateTo({
      url: '../../pages/coin/coin'
    })
  },

  toChatPage: function() {
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
      'Letter/PickUpList', {
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

        let cacheKey = "userPickUpListCache+" + app.globalData.apiHeader.UId;
        app.setCache(cacheKey, tempPickUpList);

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
      'Letter/AttentionList', {
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
      'Letter/PickUp', {
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

          let cacheKey = "userPickUpListCache+" + app.globalData.apiHeader.UId;
          app.setCache(cacheKey, tempPickUpList);
          self.stopPullDownRefresh();
          wx.showToast({
            title: "为你推荐了" + res.pickUpList.length + "新动态",
            icon: 'none',
            duration: 3000
          });
        } else {
          self.stopPullDownRefresh();
          wx.showToast({
            title: '没有更多动态啦，去发布一个吧~',
            icon: 'none',
            duration: 3000
          })
        }
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
            'Letter/ClearAllBottle', {
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

  getUserLocation: function() {
    let self = this
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        // 拒绝授权后再次进入重新授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          // console.log('authSetting:status:拒绝授权后再次进入重新授权', res.authSetting['scope.userLocation'])
          wx.showModal({
            title: '',
            content: '【Bingo聊天室】需要获取你的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none'
                })
                setTimeout(() => {
                  wx.navigateBack()
                }, 1500)
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    // console.log('dataAu:success', dataAu)
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      //再次授权，调用wx.getLocation的API
                      self.getLocation(dataAu)
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none'
                      })
                      setTimeout(() => {
                        wx.navigateBack()
                      }, 1500)
                    }
                  }
                })
              }
            }
          })
        }
        // 初始化进入，未授权
        else if (res.authSetting['scope.userLocation'] == undefined) {
          // console.log('authSetting:status:初始化进入，未授权', res.authSetting['scope.userLocation'])
          //调用wx.getLocation的API
          self.getLocation(res)
        }
        // 已授权
        else if (res.authSetting['scope.userLocation']) {
          // console.log('authSetting:status:已授权', res.authSetting['scope.userLocation'])
          //调用wx.getLocation的API
          self.getLocation(res)
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function(userLocation) {
    let self = this
    wx.getLocation({
      type: "wgs84",
      success: function(res) {
        console.log('getLocation:success', res)
        self.updateUserLocation(res.latitude, res.longitude)
        //self.getLocationDetail(res.latitude, res.longitude)
      },
      fail: function(res) {
        console.log('getLocation:fail', res)
        if (res.errMsg === 'getLocation:fail:auth denied') {
          wx.showToast({
            title: '拒绝授权',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
          return
        }
        if (!userLocation || !userLocation.authSetting['scope.userLocation']) {
          console.log('getLocation:fail', res)
          self.getUserLocation()
        } else if (userLocation.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '',
            content: '请在系统设置中打开定位服务',
            showCancel: false,
            success: result => {
              if (result.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  },

  getLocationDetail: function(latitude, longitude) {
    let self = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        //获取当前地址成功
        console.log(res);
      },
      fail: function(res) {
        console.log('获取当前地址失败');
      }
    })
  },

  updateUserLocation: function(latitude, longitude) {

    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/UpdateUserLocation', {
          "UId": app.globalData.apiHeader.UId,
          "Latitude": latitude,
          "Longitude": longitude
        },
        function(res) {
          console.info("更新位置信息成功！")
        },
        function(res) {
          console.info("更新位置信息失败！")
        })
    }
  },

  cancelLogin: function() {
    this.setData({
      showLoginModal: false
    });
  },



  bindGetUserInfo: function(e) {
    let self = this;
    if (e.detail.userInfo) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              lang: "zh_CN",
              success: res => {
                console.info("获取微信用户信息成功!" + JSON.stringify(res));
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回所以此处加入 callback 以防止这种情况
                if (self.userInfoReadyCallback) {
                  self.userInfoReadyCallback(res)
                }
                self.setUserInfo(res.userInfo);
              }
            })
          }
        }
      })
    }
  },


  //存入用户信息
  setUserInfo: function(userInfoWX) {
    let self = this;
    app.globalData.basicUserInfo.headPhotoPath = userInfoWX.avatarUrl;
    app.globalData.basicUserInfo.nickName = userInfoWX.nickName;
    app.globalData.basicUserInfo.gender = userInfoWX.gender;
    app.globalData.basicUserInfo.isRegister = true;
    self.cancelLogin();
    app.httpPost(
      'Letter/SetUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "NickName": userInfoWX.nickName,
        "AvatarUrl": userInfoWX.avatarUrl,
        "Gender": userInfoWX.gender,
        "Country": userInfoWX.country,
        "Province": userInfoWX.province,
        "City": userInfoWX.city
      },
      function(res) {
        console.info("存入用户信息成功");
      },
      function(res) {
        console.error("存入用户信息失败!");
      })
  },

  subscribeMessage: function(ops) {
    this.setData({
      subscribeMessageOpen: ops.detail.value
    });
  },

  // 订阅模板消息
  requestOpenMssageNotify() {
    let self = this;
    let messageReplyNotifyId = "";
    if (app.globalData.apiHeader.Platform == 1) {
      messageReplyNotifyId = self.data.messageReplyNotifyQQId;
    } else {
      messageReplyNotifyId = self.data.messageReplyNotifyWechatId;
    }
    //开关变为开启的时候，通知用户开启模板消息
    if (self.data.subscribeMessageOpen) {
      return new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: [messageReplyNotifyId],
          success: (res) => {
            if (res[messageReplyNotifyId] === 'accept') {
              console.info("开启模板消息通知成功");
            } else {
              console.warn("开启模板消息通知失败");
            }
          },
          fail(err) {
            console.error(JSON.stringify(err));
          }
        })
      })
    }
  },

})