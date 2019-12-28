Page({

  data: {
    tempNickName: ""
  },

  onLoad: function(options) {
    let temp = "tempNickName";
    this.setData({
      [temp]: options.nickName
    })
  },
  //获取用户输入的用户名
  nickNameInput: function(e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let nickName = 'tempUserInfo.nickName';
    prevPage.setData({
      [nickName]: e.detail.value,
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
    return {
      title: "最懂你的灵魂，即将与你相遇",
      imageUrl: "",
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