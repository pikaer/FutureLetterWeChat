const app = getApp()
Page({
  data: {
    discussDetail: {},
    discussDetailList: [],
    pickUpId: "",
    discussContent: "",
    inputMarBot: false,
    showModal: false,
    basicUserInfo: {},
  },

  onLoad: function (options) {
    this.data.pickUpId = options.pickUpId
    this.discussDetail();
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


  //下拉刷新页面数据
  onPullDownRefresh: function () {
    this.discussDetail();
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

  //获取输入的聊天内容
  discussContentInput: function (e) {
    this.setData({
      discussContent: e.detail.value
    })
  },

  //获取动态
  discussDetail: function () {
    var self = this;
    app.httpPost(
      'api/Letter/DiscussDetail', {
        "PickUpId": self.data.pickUpId
      },
      function (res) {
        let tempDetailList = res.discussDetailList;
        self.setData({
          discussDetail: res,
          discussDetailList: tempDetailList
        });
        wx.stopPullDownRefresh();
      },
      function (res) {
        console.info("获取数据失败");
        wx.stopPullDownRefresh();
      })
  },

  //发表评论
  insertDiscussContent: function () {
    var self = this;
    app.httpPost(
      'api/Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "PickUpId": self.data.pickUpId,
        "TextContent": self.data.discussContent
      },
      function (res) {
        if (res.isExecuteSuccess) {
          self.setData({
            discussContent: ""
          });
          self.discussDetail();
          console.info("发表评论成功");
        }
      },
      function (res) {
        console.error("发表评论失败");
      })
  },

  // 评论输入框聚焦时，设置与底部的距离
  settingMbShow: function () {
    this.setData({
      inputMarBot: true
    })
  },
  //  评论输入框失去聚焦时，设置与底部的距离（默认状态）
  settingMbNoShow: function () {
    this.setData({
      inputMarBot: false
    })
  },
})