const app = getApp()
import {
  HubConnection
} from "../../utils/signalR.js";
import auth from '../../utils/auth.js';
// 获取倍率
const raterpx = 750.0 / wx.getSystemInfoSync().windowWidth;

const deviceWidth = 750.0 / wx.getSystemInfoSync().windowWidth;

// 获取canvas转化后的rpx
const rate = function(rpx) {
  return rpx / raterpx
};

Page({
  data: {
    pickUpList_Other: [],
    pickUpList_WangZhe: [],
    pickUpList_ChiJi: [],
    pickUpList_LianMai: [],
    pickUpList_Game: [],
    pickUpList_Learn: [],
    pickUpList_TVTracker: [],
    pickUpList_Earlybird: [],
    pickUpList_Walk: [],
    pickUpList_Movie: [],
    pageIndex: 1,
    loadTopHide: true,
    showStartUp: true,
    statusBarHeight: app.globalData.statusBarHeight,
    currentTab: 0, //当前所在tab
    scrollLeft: 0,
    onloadText: ""
  },


  onLoad: function() {
    this.initData();
  },

  onShow: function() {
    this.getPlayTogetherList();
  },

  //初始化数据
  initData: function() {
    this.getPlayTogtherCacheData(0);
    this.getPlayTogtherCacheData(1);
    this.getPlayTogtherCacheData(2);
    this.getPlayTogtherCacheData(3);
    this.getPlayTogtherCacheData(4);
    this.getPlayTogtherCacheData(5);
    this.getPlayTogtherCacheData(6);
    this.getPlayTogtherCacheData(7);
    this.getPlayTogtherCacheData(8);
    this.getPlayTogtherCacheData(9);
  },

  //获取动态
  getPlayTogetherList: function(playType) {
    var self = this;
    app.httpPost(
      'Letter/PlayTogetherList', {
        "UId": app.globalData.apiHeader.UId
      },
      function(res) {
        self.setPlayTogtherData(res.playTogetherList_Other, 0);
        self.setPlayTogtherData(res.playTogetherList_WangZhe, 1);
        self.setPlayTogtherData(res.playTogetherList_ChiJi, 2);
        self.setPlayTogtherData(res.playTogetherList_LianMai, 3);
        self.setPlayTogtherData(res.playTogetherList_Game, 4);
        self.setPlayTogtherData(res.playTogetherList_Learn, 5);
        self.setPlayTogtherData(res.playTogetherList_TVTracker, 6);
        self.setPlayTogtherData(res.playTogetherList_Earlybird, 7);
        self.setPlayTogtherData(res.playTogetherList_Walk, 8);
        self.setPlayTogtherData(res.playTogetherList_Movie, 9);
        console.info("获取一起玩列表成功");
      },
      function(res) {
        console.info("获取一起玩列表失败");
        self.setData({
          onloadText: "查看更多>>"
        });
      })
  },


  //tab切换至动态
  bindChange: function(e) {
    let tabIndex = e.detail.current;
    this.setData({
      currentTab: tabIndex
    });
    this.scrollPosition(tabIndex);
  },

  //跳转至个人空间
  toUserSpace: function(e) {
    wx.navigateTo({
      url: "../../pages/userspace/userspace?uId=" + e.currentTarget.dataset.uid
    })
  },



  getPlayTogtherCacheData: function(playType) {
    let cacheKey = 'playTogetherListCacheData_playType_' + playType;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      this.setPlayTogtherData(cacheValue, playType);
    }
  },

  setPlayTogtherData: function(pickUpList, playType) {
    if (playType == 0) {
      this.setData({
        pickUpList_Other: pickUpList,
      });
    } else if (playType == 1) {
      this.setData({
        pickUpList_WangZhe: pickUpList,
      });
    } else if (playType == 2) {
      this.setData({
        pickUpList_ChiJi: pickUpList,
      });
    } else if (playType == 3) {
      this.setData({
        pickUpList_LianMai: pickUpList,
      });
    } else if (playType == 4) {
      this.setData({
        pickUpList_Game: pickUpList,
      });
    } else if (playType == 5) {
      this.setData({
        pickUpList_Learn: pickUpList,
      });
    } else if (playType == 6) {
      this.setData({
        pickUpList_TVTracker: pickUpList,
      });
    } else if (playType == 7) {
      this.setData({
        pickUpList_Earlybird: pickUpList,
      });
    } else if (playType == 8) {
      this.setData({
        pickUpList_Walk: pickUpList,
      });
    } else {
      this.setData({
        pickUpList_Movie: pickUpList,
      });
    }

    let cacheKey = 'playTogetherListCacheData_playType_' + playType;
    app.setCache(cacheKey, pickUpList);
  },

  onTabSelected: function(e) {
    let tabIndex = e.currentTarget.dataset.currenttab;
    this.setData({
      currentTab: tabIndex
    });
    this.scrollPosition(tabIndex);
  },

  scrollPosition: function(tabIndex) {
    if (tabIndex <= 2) {
      this.setData({
        scrollLeft: 0
      });
    } else if (tabIndex >= 7) {
      this.setData({
        scrollLeft: 9999
      });
    } else {
      this.setData({
        scrollLeft: (tabIndex + 1) * 30
      });
    }
  },
  //发布动态
  publishMoment: function() {
    wx.navigateTo({
      url: '../../pages/publishplaymoment/publishplaymoment'
    })
  },

})