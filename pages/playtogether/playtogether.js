const app = getApp()
import {
  HubConnection
} from "../../utils/signalR.js";
import auth from '../../utils/auth.js';

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
    currentMoment: {},
    filterData: {
      "gender": 3,
      "home": 0,
      "goal": 0,
      "schoolState": 0,
      "age": {
        "all": true,
        "after05": true,
        "after00": true,
        "after95": true,
        "after90": true,
        "after85": true,
        "after80": true,
        "before80": true,
      },
      "goal": {
        "all": true,
        "goal1": true,
        "goal2": true,
        "goal3": true,
        "goal4": true,
        "goal5": true,
        "goal6": true,
        "goal7": true,
        "goal8": true,
      }
    },
    pageIndex: 1,
    loadTopHide: true,
    showMomentDetailModal: false,
    showGenderFilterModal: false,
    showHomeFilterModal: false,
    showAgeFilterModal: false,
    showTagFilterModal: false,
    statusBarHeight: app.globalData.statusBarHeight,
    currentTab: 0, //当前所在tab
    onloadText: "",
    windowWidth: 300,
    screenHeight: 0
  },


  onLoad: function() {
    this.initData();
    this.setData({
      windowWidth: wx.getSystemInfoSync().windowWidth,
      screenHeight: wx.getSystemInfoSync().screenHeight
    });
  },

  onShow: function() {
    this.getPlayTogetherList();
    this.unReadCountRefresh();
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

  //跳转至个人空间
  toUserSpace: function(uid) {
    wx.navigateTo({
      url: "../../pages/userspace/userspace?uId=" + uid
    })
  },

  momentClickOpen: function(ops) {
    let key = ops.currentTarget.dataset.key;
    let list = this.data.pickUpList_Other;
    this.setData({
      currentMoment: list[key],
      showMomentDetailModal: true
    });
    wx.hideTabBar();
  },

  momentDetailClick: function(ops) {
    this.setData({
      showMomentDetailModal: false
    });
    wx.showTabBar();
  },


  confirmGenderFilterBtn: function() {
    this.setData({
      showGenderFilterModal: false
    });
  },

  showGenderFilterModal: function() {
    this.setData({
      showGenderFilterModal: true
    });
  },
  confirmHomeFilterBtn: function() {
    this.setData({
      showHomeFilterModal: false
    });
  },

  showHomeFilterModal: function() {
    this.setData({
      showHomeFilterModal: true
    });
  },


  confirmAgeFilterBtn: function() {
    this.setData({
      showAgeFilterModal: false
    });
  },

  showAgeFilterModal: function() {
    this.setData({
      showAgeFilterModal: true
    });
  },

  confirmTagFilterBtn: function() {
    this.setData({
      showTagFilterModal: false
    });
  },

  showTagFilterModal: function() {
    this.setData({
      showTagFilterModal: true
    });
  },

  //动态详情页面
  previewMomentDetail: function(e) {
    let key = e.currentTarget.dataset.key;
    let pickUpList = this.data.pickUpList_Other;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpList[key].pickUpId + "&partnerUId=" + pickUpList[key].uId + "&momentId=" + pickUpList[key].momentId
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

  //发布动态
  publishMoment: function() {
    wx.navigateTo({
      url: '../../pages/publishplaymoment/publishplaymoment'
    })
  },

  selectedGenderBtn: function(ops) {
    let filterDataItem = this.data.filterData;
    filterDataItem.gender = ops.currentTarget.dataset.gender;
    this.setData({
      filterData: filterDataItem
    })
  },

  selectedSchoolStateBtn: function(ops) {
    let filterDataItem = this.data.filterData;
    filterDataItem.schoolState = ops.currentTarget.dataset.schoolstate;
    this.setData({
      filterData: filterDataItem
    })
  },

  selectedHomeBtn: function(ops) {
    let filterDataItem = this.data.filterData;
    filterDataItem.home = ops.currentTarget.dataset.home;
    this.setData({
      filterData: filterDataItem
    })
  },

  checkboxChange: function(ops) {
    let tag = ops.currentTarget.dataset.value;
    let ageItem = this.data.filterData.age;
    if (tag == 0) {
      if (ageItem.all) {
        ageItem.after05 = false;
        ageItem.after00 = false;
        ageItem.after95 = false;
        ageItem.after90 = false;
        ageItem.after85 = false;
        ageItem.after80 = false;
        ageItem.before80 = false;
        ageItem.all = false;
      } else {
        ageItem.after05 = true;
        ageItem.after00 = true;
        ageItem.after95 = true;
        ageItem.after90 = true;
        ageItem.after85 = true;
        ageItem.after80 = true;
        ageItem.before80 = true;
        ageItem.all = true;
      }
    } else {
      switch (tag) {
        case 1:
          ageItem.after05 = !ageItem.after05;
          break;
        case 2:
          ageItem.after00 = !ageItem.after00;
          break;
        case 3:
          ageItem.after95 = !ageItem.after95;
          break;
        case 4:
          ageItem.after90 = !ageItem.after90;
          break;
        case 5:
          ageItem.after85 = !ageItem.after85;
          break;
        case 6:
          ageItem.after80 = !ageItem.after80;
          break;
        case 7:
          ageItem.before80 = !ageItem.before80;
          break;
      }
    }
    //全部选中
    if (ageItem.after05 && ageItem.after00 && ageItem.after95 && ageItem.after90 &&
      ageItem.after85 && ageItem.after80 && ageItem.before80) {
      ageItem.all = true;
    } else {
      ageItem.all = false;
    }

    this.setData({
      filterData: this.data.filterData
    })
  },


  goalChange: function(ops) {
    let goal = ops.currentTarget.dataset.goal;
    let goalItem = this.data.filterData.goal;
    if (goal == 0) {
      if (goalItem.all) {
        goalItem.goal1 = false;
        goalItem.goal2 = false;
        goalItem.goal3 = false;
        goalItem.goal4 = false;
        goalItem.goal5 = false;
        goalItem.goal6 = false;
        goalItem.goal7 = false;
        goalItem.goal8 = false;
        goalItem.all = false;
      } else {
        goalItem.goal1 = true;
        goalItem.goal2 = true;
        goalItem.goal3 = true;
        goalItem.goal4 = true;
        goalItem.goal5 = true;
        goalItem.goal6 = true;
        goalItem.goal7 = true;
        goalItem.goal8 = true;
        goalItem.all = true;
      }
    } else {
      switch (goal) {
        case 1:
          goalItem.goal1 = !goalItem.goal1;
          break;
        case 2:
          goalItem.goal2 = !goalItem.goal2;
          break;
        case 3:
          goalItem.goal3 = !goalItem.goal3;
          break;
        case 4:
          goalItem.goal4 = !goalItem.goal4;
          break;
        case 5:
          goalItem.goal5 = !goalItem.goal5;
          break;
        case 6:
          goalItem.goal6 = !goalItem.goal6;
          break;
        case 7:
          goalItem.goal7 = !goalItem.goal7;
          break;
        case 8:
          goalItem.goal8 = !goalItem.goal8;
          break;
      }
    }
    //全部选中
    if (goalItem.goal1 && goalItem.goal2 && goalItem.goal3 && goalItem.goal4 &&
      goalItem.goal5 && goalItem.goal6 && goalItem.goal7 && goalItem.goal8) {
      goalItem.all = true;
    } else {
      goalItem.all = false;
    }

    this.setData({
      filterData: this.data.filterData
    })
  },


})