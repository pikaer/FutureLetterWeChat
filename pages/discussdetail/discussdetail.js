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
    showinputarea: false,
    showModalStatus: false
  },

  onLoad: function(options) {
    this.data.pickUpId = options.pickUpId
    this.discussDetail();
    this.setData({
      showinputarea: app.globalData.apiHeader.UId > 0
    });
  },

  //获取用户基础信息
  toShowModal: function(ops) {
    var self = this;
    self.setData({
      basicUserInfo: {}
    });
    app.httpPost(
      'api/Letter/BasicUserInfo', {
        "UId": ops.currentTarget.dataset.uid
      },
      function(res) {
        self.setData({
          basicUserInfo: res,
          showModal: true
        });
      },
      function(res) {
        console.error("获取用户基础信息失败");
      })
  },

  hideModal: function() {
    this.setData({
      showModal: false
    });
  },


  //下拉刷新页面数据
  onPullDownRefresh: function() {
    this.discussDetail();
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

  //获取输入的聊天内容
  discussContentInput: function(e) {
    this.setData({
      discussContent: e.detail.value
    })
  },

  //获取动态
  discussDetail: function() {
    var self = this;
    app.httpPost(
      'api/Letter/DiscussDetail', {
        "PickUpId": self.data.pickUpId
      },
      function(res) {
        let tempDetailList = res.discussDetailList;
        self.setData({
          discussDetail: res,
          discussDetailList: tempDetailList
        });
        wx.stopPullDownRefresh();
      },
      function(res) {
        console.info("获取数据失败");
        wx.stopPullDownRefresh();
      })
  },

  //发表评论
  insertDiscussContent: function() {
    var self = this;
    app.httpPost(
      'api/Letter/Discuss', {
        "UId": app.globalData.apiHeader.UId,
        "PickUpId": self.data.pickUpId,
        "TextContent": self.data.discussContent
      },
      function(res) {
        if (res.isExecuteSuccess) {
          self.setData({
            discussContent: ""
          });
          self.discussDetail();
          console.info("发表评论成功");
        }
      },
      function(res) {
        console.error("发表评论失败");
      })
  },

  // 评论输入框聚焦时，设置与底部的距离
  settingMbShow: function() {
    this.setData({
      inputMarBot: true
    })
  },
  //  评论输入框失去聚焦时，设置与底部的距离（默认状态）
  settingMbNoShow: function() {
    this.setData({
      inputMarBot: false
    })
  },


  //更多
  moreAction: function(ops) {
    this.showModalShare()
  },


  //显示遮罩层
  showModalShare: function() {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  hideModalShare: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },


  //举报瓶子
  reportItem: function(ops) {
    this.hideModalShare();
    var self = this;
    app.httpPost(
      'api/Letter/ReportBottle', {
        "PickUpId": self.data.discussDetail.pickUpId
      },
      function(res) {
        console.info("举报瓶子成功！");
        wx.showToast({
          title: "举报成功",
          icon: 'success',
          duration: 1500
        });
      },
      function(res) {
        console.info("举报瓶子失败");
      })
  },

  saveLocal: function() {
    this.hideModalShare();
    wx.showToast({
      title: "功能开发中，敬请期待",
      icon: 'none',
      duration: 1500
    });
  },

  //添加收藏
  addCollect: function(ops) {
    var self = this;
    app.httpPost(
      'api/Letter/AddCollect', {
        "UId": app.globalData.apiHeader.UId,
        "MomentId": self.data.discussDetail.momentId,
        "PickUpId": self.data.discussDetail.pickUpId,
        "FromPage": "discussDetailPage"
      },
      function(res) {
        if (res.isExecuteSuccess) {
          console.info("添加收藏成功！");
          wx.showToast({
            title: "收藏成功",
            icon: 'success',
            duration: 1500
          });
        }
      },
      function(res) {
        console.info("收藏瓶子失败");
      })

    this.hideModalShare();
  },


  //分享功能
  onShareAppMessage: function (res) {
    this.hideModalShare();

    let momentId = this.data.discussDetail.momentId;
    let url = "";
    let title = "今日份一张图";
    if (this.data.discussDetail.textContent != "" && this.data.discussDetail.textContent != null) {
      title = this.data.currentMoment.textContent;
    }
    if (this.data.discussDetail.imgContent != "" && this.data.discussDetail.imgContent != null) {
      url = this.data.discussDetail.imgContent;
    }
    return {
      title: title,
      imageUrl: url,
      path: "/pages/startup/startup?momentId=" + momentId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})