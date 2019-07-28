const app = getApp()
Page({
  data: {
    momentDetail: {},
    momentId: "",
    showModal: false,
    basicUserInfo: {},
    showinputarea: false,
    showModalStatus: false
  },

  onLoad: function(options) {
    if (options.momentId != null && options.momentId != "") {
      this.setData({
        momentId: options.momentId
      });
    }

    this.momentDetail();
  },

  toStartup: function() {
    wx.navigateTo({
      url: "../../pages/startup/startup"
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

  //获取动态
  momentDetail: function() {
    var self = this;
    app.httpPost(
      'api/Letter/MomentDetail', {
        "MomentId": self.data.momentId
      },
      function(res) {
        self.setData({
          momentDetail: res
        });
      },
      function(res) {
        console.info("获取数据失败");
      })
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

  //更多
  moreAction: function(ops) {
    this.showModalShare()
  },

  saveLocal: function() {
    this.hideModalShare();
    wx.showToast({
      title: "功能开发中，敬请期待",
      icon: 'none',
      duration: 1500
    });
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

  //分享功能
  onShareAppMessage: function(res) {
    this.hideModalShare();
    let momentId = this.data.momentId;
    let url = "";
    let title = "今日份一张图";
    if (this.data.momentDetail.textContent != "" && this.data.momentDetail.textContent != null) {
      title = this.data.momentDetail.textContent;
    }
    if (this.data.momentDetail.imgContent != "" && this.data.momentDetail.imgContent != null) {
      url = this.data.momentDetail.imgContent;
    }
    return {
      title: title,
      imageUrl: url,
      path: "/pages/sharepage/sharepage?momentId=" + momentId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

})