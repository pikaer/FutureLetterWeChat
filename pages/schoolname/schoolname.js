Page({

  data: {
    tempSchoolName: ""
  },

  onLoad: function (options) {
    let temp = "tempSchoolName";
    this.setData({
      [temp]: options.schoolName
    })
  },

  //获取用户输入的学校名
  schoolNameInput: function (e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let schoolName = 'tempUserInfo.schoolName';
    prevPage.setData({
      [schoolName]: e.detail.value,
    })
  },

  //保存并返回上一级页面。
  updateSchoolName: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  //分享功能
  onShareAppMessage: function (res) {
    let url = app.globalData.bingoLogo;
    let title = app.globalData.bingoTitle;
    return {
      title: title,
      imageUrl: url,
      path: "/pages/discovery/discovery",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
  
})