const app = getApp()
Page({
  data: {
    discussDetail: {},
    pickUpId: "",
    inputMarBot: false,
    showModal: false,
    basicUserInfo: {},
    showinputarea: false
  },

  onLoad: function (options) {
    this.data.pickUpId = options.pickUpId
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

  //获取动态
  discussDetail: function () {
    var self = this;
    app.httpPost(
      'api/Letter/DiscussDetail', {
        "PickUpId": self.data.pickUpId
      },
      function (res) {
        self.setData({
          discussDetail: res
        });
      },
      function (res) {
        console.info("获取数据失败");
      })
  },

})