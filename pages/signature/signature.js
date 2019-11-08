Page({

  data: {
    tempSignature: ""
  },

  onLoad: function (options) {
    let temp = "tempSignature";
    this.setData({
      [temp]: options.signature
    })
  },
  
  //获取用户输入的用户名
  signatureInput: function (e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let signature = 'tempUserInfo.signature';
    prevPage.setData({
      [signature]: e.detail.value,
    })
  },

  //保存并返回上一级页面。
  updateSignature: function () {
    wx.navigateBack({
      delta: 1
    })
  },
})
