//获取应用实例
const app = getApp()

Page({
  data: {
    tempMomentList: [],
    tempCollectList: [],
    basicUserInfo: {},
    totalCoin: 0,
    selectMomentItem: [],
    selectCollectItem: [],
    correntSelectItem: 1,
    pageIndex: 1,
    pageCollectIndex: 1,
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
  },

  onLoad: function () {
    app.globalData.currentDiscussMoment = {};
    this.setData({
      basicUserInfo: app.globalData.basicUserInfo,
      tempMomentList: app.globalData.tempMomentList,
      tempCollectList: app.globalData.tempCollectList
    });
  },

  onShow: function () {
    this.basicUserInfo();
    this.getMyMomentList();
    this.getCollectList();
  },

  // 滑动切换tab
  bindChange: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
  },

  //tab切换至动态
  toPublishList: function (e) {
    this.setData({
      currentTab: 0
    });
    this.getMyMomentList();
  },


  //tab切换至收藏
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
  toMomentDetailPage: function (e) {
    let momentId = e.currentTarget.dataset.momentid;
    wx.navigateTo({
      url: "../../pages/momentdetail/momentdetail?momentId=" + momentId
    })
  },

  //动态详情页面
  toDiscussDetailPage: function (e) {
    let pickUpId = e.currentTarget.dataset.pickupid;
    let uId = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: "../../pages/discussdetail/discussdetail?pickUpId=" + pickUpId + "&partnerUId=" +uId
    })
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
          app.globalData.tempMomentList = res.momentList;
        },
        function (res) {
          console.error("获取聊天列表失败！");
        })
    }
  },

  // 预览图片
  previewImg: function (e) {
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
          app.globalData.tempCollectList = res.collectList;
        },
        function (res) {
          console.error("获取收藏列表数据失败！");
        })
    }
  },

  //长按删除对话弹框
  bindlongMomentPress: function (ops) {
    let type = ops.currentTarget.dataset.type;
    if (type == 1) {
      this.setData({
        selectMomentItem: ops.currentTarget.dataset,
        correntSelectItem: 1,
        showModalStatus: true
      })
    }
    if (type == 2)
      this.setData({
        selectCollectItem: ops.currentTarget.dataset,
        correntSelectItem: 2,
        showModalStatus: true
      })
  },

  //重置长按选择项
  resetSelectMomentItem: function () {
    this.setData({
      selectMomentItem: [],
      selectCollectItem: []
    })
  },

  hideModalShare: function () {
    this.setData({
      showModalStatus: false
    })
  },


  //全部清空
  clearItem: function () {
    this.hideModalShare();
    if (this.data.correntSelectItem == 1) {
      this.deleteAllMoment();
    } else {
      this.deleteAllCollect();
    }
    this.hideModalShare();
  },

  //单个删除
  deleteItem: function () {
    this.hideModalShare();
    if (this.data.correntSelectItem == 1) {
      this.deleteMoment();
    } else {
      this.deleteCollect();
    }
    this.hideModalShare();
  },


  //分享功能
  onShareAppMessage: function (res) {
    this.hideModalShare();
    let url = "";
    let title = "今日份一张图";
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
      list = this.data.tempCollectList;
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
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
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
          app.globalData.tempMomentList = list;
        },
        function (res) {
          console.error("删除动态失败！");
          //重置数据
          self.resetSelectMomentItem();
        })
    }
  },

  //删除单个
  deleteCollect: function () {
    let self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/DeleteCollect', {
          "CollectId": self.data.selectCollectItem.collectid
        },
        function (res) {
          console.info("删除动态成功！");
          let list = self.data.tempCollectList;
          list.splice(self.data.selectCollectItem.index, 1);
          self.setData({
            tempCollectList: list
          });
          //重置数据
          self.resetSelectMomentItem();
          app.globalData.tempCollectList = list;
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
        if (res.confirm && app.globalData.apiHeader.UId > 0) {
          app.httpPost(
            'api/Letter/DeleteAllMoment', {
              "UId": app.globalData.apiHeader.UId
            },
            function (res) {
              console.info("删除所有动态成功！");
              self.setData({
                tempMomentList: []
              });
              app.globalData.tempMomentList = [];
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
  },


  //删除所有收藏
  deleteAllCollect: function () {
    var self = this;
    wx.showModal({
      content: '将清空所有收藏的内容！',
      success(res) {
        if (res.confirm && app.globalData.apiHeader.UId > 0) {
          app.httpPost(
            'api/Letter/DeleteAllCollect', {
              "UId": app.globalData.apiHeader.UId
            },
            function (res) {
              console.info("删除所有收藏成功！");
              self.setData({
                tempCollectList: []
              });
              //重置数据
              self.resetSelectMomentItem();
              app.globalData.tempCollectList = [];
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
  },

  //获取用户基础信息
  basicUserInfo: function (ops) {
    var self = this;
    let cacheKey = "basicUserInfo+" + app.globalData.apiHeader.UId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        basicUserInfo: cacheValue
      });
    }
    app.httpPost(
      'api/Letter/BasicUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "Type": 1
      },
      function (res) {
        app.globalData.basicUserInfo = res;
        self.setData({
          basicUserInfo: res,
          totalCoin: res.totalCoin
        });
        app.setCache(cacheKey, res);
      },
      function (res) {
        console.error("获取用户基础信息失败");
      })
  },


  bindGetUserInfo: function (e) {
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
  setUserInfo: function (userInfoWX) {
    let self = this;
    let gender = 'basicUserInfo.gender';
    let nickName = 'basicUserInfo.nickName';
    let avatarUrl = 'basicUserInfo.headPhotoPath';
    let isRegister = 'basicUserInfo.isRegister';
    self.setData({
      [gender]: userInfoWX.gender,
      [nickName]: userInfoWX.nickName,
      [avatarUrl]: userInfoWX.avatarUrl,
      [isRegister]: true
    });

    app.globalData.basicUserInfo.headPhotoPath = userInfoWX.avatarUrl;
    app.globalData.basicUserInfo.nickName = userInfoWX.nickName;
    app.globalData.basicUserInfo.gender = userInfoWX.gender;
    app.globalData.basicUserInfo.isRegister = true;

    app.httpPost(
      'api/Letter/SetUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "NickName": userInfoWX.nickName,
        "AvatarUrl": userInfoWX.avatarUrl,
        "Gender": userInfoWX.gender,
        "Country": userInfoWX.country,
        "Province": userInfoWX.province,
        "City": userInfoWX.city
      },
      function (res) {
        console.info("存入用户信息成功");
        self.setData({
          totalCoin: res.totalCoin
        });
      },
      function (res) {
        console.error("存入用户信息失败!");
      })
  },
})