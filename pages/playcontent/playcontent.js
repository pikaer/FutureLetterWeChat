// pages/playcontent/playcontent.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "playType": 0,
    "stateType": 0,
    "desc": "",
    "tempTextContent": "",
    "hotContentList": [
      "一起说早安，开启新一天",
      "你见过日出吗？我想早起看看",
      "帅的人已经早起，丑的人还在沉睡",
      "早起上班，互道早安，互拍晨曦",
      "养成好习惯，一起早起吃饭",
    ]
  },

  onLoad: function(options) {
    this.data.playType = options.playType;
    this.data.stateType = options.stateType;
    this.data.desc = options.desc;
  },

  //获取输入的聊天内容
  textContentInput: function(e) {
    this.setData({
      tempTextContent: e.detail.value
    })
  },

  hotContentClick: function(ops) {
    this.setData({
      tempTextContent: ops.currentTarget.dataset.hotcontent
    })
  },


  //发布动态
  toNextPage: function() {
    wx.navigateTo({
      url: '../../pages/publishplaymoment/publishplaymoment?tempTextContent=' + this.data.tempTextContent + "&desc=" + this.data.desc + "&stateType=" + this.data.stateType + "&playType=" + this.data.playType
    })
  },
})