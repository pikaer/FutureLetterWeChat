Page({

  data: {
    tempNickName: ""
  },

  onLoad: function(options) {
    this.setData({
      tempNickName: options.nickName
    })
  },

  //获取用户输入的用户名
  nickNameInput: function(e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      hidingNickName: e.detail.value,
    })
  },

  //保存并返回上一级页面。
  updateNickName: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  //分享功能
  onShareAppMessage: function(res) {
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
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
})