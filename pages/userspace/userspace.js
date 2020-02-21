//获取应用实例
const app = getApp()

Page({
  data: {
    tempMomentList: [],
    basicUserInfo: {},
    selectMomentItem: [],
    correntSelectItem: 1,
    pageIndex: 1,
    currentPageUId: 0
  },

  onLoad: function(options) {
    if (options.uId != null && options.uId > 0) {
      this.setData({
        currentPageUId: options.uId
      });
    }
    this.basicUserInfo();
    this.getMyMomentList();
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
    let cacheKey = "userMomentList_Uid_" + self.data.currentPageUId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      self.setData({
        tempMomentList: cacheValue
      })
    }
    app.httpPost(
      'Letter/MyMomentList', {
        "UId": self.data.currentPageUId,
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