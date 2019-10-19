const app = getApp()


Page({
  data: {
    localImgs: [],
    serverImgs: [],
    upload_picture_list: [],
    ishidden: false,
    hasImg: true,
    publishDisabled: true,
    isRegister: true,
    tempTextContent: "",
    showLoginModal: false,
    showLoginModalStatus: false,
  },

  onLoad: function() {
    this.setData({
      isRegister: app.globalData.basicUserInfo.isRegister
    })
  },

  cancelLogin: function() {
    this.setData({
      showLoginModal: false
    });
  },

  toLogin: function() {
    this.setData({
      showLoginModal: true
    });
  },

  bindGetUserInfo: function(e) {
    let self = this;
    if (e.detail.userInfo) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              lang: "zh_CN",
              success: res => {
                console.info("获取微信用户信息成功!" + JSON.stringify(res));
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回所以此处加入 callback 以防止这种情况
                if (self.userInfoReadyCallback) {
                  self.userInfoReadyCallback(res)
                }
                self.setUserInfo(res.userInfo);
              }
            })
          }
        }
      })
    }
  },

  //存入用户信息
  setUserInfo: function(userInfoWX) {
    let self = this;
    app.globalData.basicUserInfo.headPhotoPath = userInfoWX.avatarUrl;
    app.globalData.basicUserInfo.nickName = userInfoWX.nickName;
    app.globalData.basicUserInfo.gender = userInfoWX.gender;
    app.globalData.basicUserInfo.isRegister = true;
    self.isRegister = true;
    if (app.globalData.basicUserInfo.isRegister) {
      self.publishMoment();
    }
    app.httpPost(
      'api/Letter/SetUserInfo', {
        "UId": app.globalData.apiHeader.UId,
        "NickName": userInfoWX.nickName,
        "AvatarUrl": userInfoWX.avatarUrl,
        "Gender": userInfoWX.gender,
        "Country": userInfoWX.country,
        "Province": userInfoWX.province,
        "City": userInfoWX.city
      },
      function(res) {
        console.info("存入用户信息成功");
      },
      function(res) {
        console.error("存入用户信息失败!");
      })
  },

  //发布动态
  publishMoment: function() {
    var self = this;
    app.httpPost(
      'api/Letter/PublishMoment', {
        "UId": app.globalData.apiHeader.UId,
        "TextContent": self.data.tempTextContent,
        "ImgContent": self.data.serverImgs[0]
      },
      function(res) {
        if (res.isExecuteSuccess) {
          self.publishToast(true);
        } else {
          self.publishToast(false);
        }
      },
      function(res) {
        console.error("发布动态失败");
        self.publishToast(false);
      },
    )
  },

  //弹框
  publishToast: function(success) {
    let self = this;
    let title = success ? "发布成功" : "发布失败";
    let img = success ? "" : "../../content/images/warn.png"
    wx.showToast({
      title: title,
      icon: 'success',
      image: img,
      duration: 2500,
      complete() {
        if (success) {
          self.sleepAfterBack();
        }
      }
    })

  },

  sleepAfterBack: function () {
    let times = 0;
    let self = this;
    var timer = setInterval(function () {
      times++
      if (times >= 1) {
        self.backPage();
        clearInterval(timer)
      }
    }, 1000)
  },

  //返回上一级页面。
  backPage: function () {
    wx.navigateBack({
      delta: 1
    })

    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
  },


  //获取用户输入的文本
  textContentInput: function(e) {
    let str = e.detail.value
    this.setData({
      tempTextContent: str
    })
    this.updateBtnState();
  },

  //更新按钮禁用状态
  updateBtnState: function() {
    let str = this.data.tempTextContent;
    let localImgs = this.data.localImgs;
    let canUse = (localImgs != undefined && localImgs.length > 0) || (str != null && str.length > 0);
    this.setData({
      publishDisabled: !canUse
    })
  },

  //选择图片方法
  uploadpic: function(e) {
    let self = this //获取上下文
    let upload_picture_list = self.data.upload_picture_list;
    let localImgs = self.data.localImgs;
    //选择图片
    wx.chooseImage({
      count: 1, // 默认9，这里显示一次选择相册的图片数量 
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) { // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片 
        let tempFiles = res.tempFiles;
        if (tempFiles.length > 1 || (localImgs != undefined && localImgs.length + tempFiles.length > 1)) {
          wx.showToast({
            title: "不能超过1张",
            icon: 'success',
            image: "../../content/images/warn.png",
            duration: 3000
          })
          return;
        }
        //把选择的图片 添加到集合里
        for (let i in tempFiles) {
          tempFiles[i]['upload_percent'] = 0;
          localImgs.push(tempFiles[i].path);
          upload_picture_list.push(tempFiles[i])
        }

        self.setData({
          upload_picture_list: upload_picture_list,
          localImgs: localImgs
        });

        if (upload_picture_list.length >= 1) {
          self.setData({
            ishidden: true
          });
        }
        self.uploadimage();

        self.updateBtnState();
      }
    })
  },

  //上传图片
  uploadimage() {
    let self = this
    let uploadList = self.data.upload_picture_list
    //循环把图片上传到服务器 并显示进度       
    for (let j in uploadList) {
      if (uploadList[j]['upload_percent'] == 0) {
        //上传图片
        upload_file_server(self, uploadList, j)
      }
    }
  },

  // 点击删除图片
  deleteImg(e) {
    let uploadList = this.data.upload_picture_list;
    let localImgs = this.data.localImgs;
    let index = e.currentTarget.dataset.index;
    uploadList.splice(index, 1);
    localImgs.splice(index, 1);
    this.setData({
      upload_picture_list: uploadList,
      localImgs: localImgs
    });

    if (localImgs.length < 1) {
      this.setData({
        ishidden: false
      });
    }

    this.updateBtnState();

    let serverImgs = this.data.serverImgs;
    let imgPath = serverImgs[index].imgPath;
    if (serverImgs != undefined) {
      serverImgs.splice(index, 1);
      this.setData({
        serverImgs: serverImgs
      });
      //删除服务器上图片
      deleteImg(imgPath);
    }
  },

  // 预览图片
  previewImg(e) {
    //获取当前图片的下标
    let index = e.currentTarget.dataset.index;
    //所有图片
    let localImgs = this.data.localImgs;
    wx.previewImage({
      //当前显示图片
      current: localImgs[index],
      //所有图片
      urls: localImgs
    })
  }
})

/**
 * 上传图片方法
 */
function upload_file_server(self, upload_picture_list, j) {
  const upload_task = wx.uploadFile({
    url: app.globalData.baseUrl + "api/Letter/UpLoadImg", //需要用HTTPS，同时在微信公众平台后台添加服务器地址  
    filePath: upload_picture_list[j]['path'], //上传的文件本地地址    
    name: 'file',
    success: function(res) {
      let data = JSON.parse(res.data);
      let serverImgs = self.data.serverImgs;
      if (data.success) {
        serverImgs.push(data.content.imgPath);
        self.setData({
          serverImgs: serverImgs
        });
      }
    },
    fail: function(res) {
      var data = JSON.parse(res.data);
      console.info(data);
    }
  })
  //上传 进度方法
  upload_task.onProgressUpdate((res) => {
    upload_picture_list[j]['upload_percent'] = res.progress
    self.setData({
      upload_picture_list: upload_picture_list
    });
  });
}

//删除服务器上的图片
function deleteImg(path) {
  var self = this;
  app.httpPost(
    'api/Letter/DeleteImg', {
      "ImgPath": path
    },
    function(res) {
      console.info("删除图片成功，path=" + path);
    },
    function(res) {
      console.error("删除图片失败，path=" + path);
    },
  )
}