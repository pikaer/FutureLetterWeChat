const app = getApp()
Page({
  data: {
    momentDetail: {},
    momentId: "",
    inputMarBot: false,
    showModal: false,
    basicUserInfo: {},
    showinputarea: false
  },

  onLoad: function (options) {
    if (options.momentId != null && options.momentId!=""){
      this.setData({
        momentId: options.momentId
      });
    }

    this.momentDetail();
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

  //获取动态
  momentDetail: function () {
    var self = this;
    app.httpPost(
      'api/Letter/MomentDetail', {
        "MomentId": self.data.momentId
      },
      function (res) {
        self.setData({
          momentDetail: res
        });
      },
      function (res) {
        console.info("获取数据失败");
      })
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


})