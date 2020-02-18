//获取应用实例
const app = getApp()

Page({
  data: {
    tempMomentList: [],
    tempPlayMomentList: [],
    basicUserInfo: {},
    totalCoin: 0,
    selectMomentItem: [],
    selectCollectItem: [],
    correntSelectItem: 1,
    pageIndex: 1,
    pagePlayMomentIndex: 1,
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
    currentPageUId: 0
  },

  onLoad: function(options) {
    if (options.uId != null && options.uId > 0) {
      this.setData({
        currentPageUId: options.uId
      });
    }
    app.globalData.currentDiscussMoment = {};
    this.setData({
      basicUserInfo: app.globalData.basicUserInfo,
      tempMomentList: app.globalData.tempMomentList,
      tempPlayMomentList: app.globalData.tempPlayMomentList
    });
  },

  onShow: function() {
    this.basicUserInfo();
    this.getMyMomentList();
    this.getPlayMomentList();
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
  toPlayList: function(e) {
    this.setData({
      currentTab: 1
    });
    this.getPlayMomentList();
  },

  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.getChatList();
  },

  //动态详情页面
  toMomentDetailPage: function(e) {
    let momentId = e.currentTarget.dataset.momentid;
    wx.navigateTo({
      url: "../../pages/momentdetail/momentdetail?momentId=" + momentId
    })
  },

  //动态详情页面
  toDiscussDetailPage: function(e) {
    let pickUpId = e.currentTarget.dataset.pickupid;
    let uId = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId + "&partnerUId=" + uId
    })
  },

  //获取我扔出去的没有被评论的动态
  getMyMomentList: function() {
    var self = this;
    if (self.data.currentPageUId == 0) {
      return;
    }
    var self = this;
    let cacheKey = "userMomentList_Uid_" + self.data.currentPageUId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        tempMomentList: cacheValue
      })
    }
    app.httpPost(
      'Letter/MyMomentList', {
        "UId": app.globalData.apiHeader.UId,
        "SourceFlag": 0,
        "FilterHideMoment": true,
        "PageIndex": self.data.pageIndex
      },
      function(res) {
        console.info("获取聊天列表成功！")
        self.setData({
          tempMomentList: res.momentList
        });
        app.setCache(cacheKey, res.momentList);
      },
      function(res) {
        console.error("获取聊天列表失败！");
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

  //获取收藏列表数据
  getPlayMomentList: function() {
    var self = this;
    if (self.data.currentPageUId == 0) {
      return;
    }
    let cacheKey = "userPlayMomentList_Uid_" + self.data.currentPageUId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        tempPlayMomentList: cacheValue
      })
    }
    app.httpPost(
      'Letter/MyMomentList', {
        "UId": self.data.currentPageUId,
        "SourceFlag": 1,
        "FilterHideMoment": true,
        "PageIndex": self.data.pagePlayMomentIndex
      },
      function(res) {
        console.info("获取收藏列表数据成功！")
        self.setData({
          tempPlayMomentList: res.momentList
        });
        app.setCache(cacheKey, res.momentList);
      },
      function(res) {
        console.error("获取收藏列表数据失败！");
      })
  },



  //分享功能
  onShareAppMessage: function(res) {
    this.hideModalShare();
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    if (app.isBlank(this.data.correntSelectItem)) {
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

    let momentId = "";
    let index = 0;
    let list = {};
    if (this.data.correntSelectItem == 1) {
      momentId = this.data.selectMomentItem.momentid;
      index = this.data.selectMomentItem.index;
      list = this.data.tempMomentList;
    } else {
      momentId = this.data.selectCollectItem.momentid;
      index = this.data.selectCollectItem.index;
      list = this.data.tempPlayMomentList;
    }
    this.hideModalShare();

    if (list[index].textContent != "" && list[index].textContent != null) {
      title = list[index].textContent;
    }
    if (list[index].imgContent != "" && list[index].imgContent != null) {
      url = list[index].imgContent;
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

  //获取用户基础信息
  basicUserInfo: function(ops) {
    var self = this;
    let cacheKey = "basicUserInfo+" + self.data.currentPageUId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        basicUserInfo: cacheValue
      });
    }
    app.httpPost(
      'Letter/BasicUserInfo', {
        "UId": self.data.currentPageUId,
        "Type": 1
      },
      function(res) {
        self.setData({
          basicUserInfo: res
        });
        app.setCache(cacheKey, res);
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },

})