const app = getApp();
Page({
  data: {
    placeRegion: ['广东省', '广州市', '海珠区'],
    schoolTypeArray: ['其他', '学院/大学', '一本', '211/985/海外院校'],
    tempHeadImgPath: "",
    cacheUserInfo: {}, //用户缓存信息
    tempUserInfo: {
      "gender": 1,
      "nickName": "",
      "birthDate": "",
      "province": "",
      "city": "",
      "area": "",
      "schoolName": "",
      "entranceDate": "",
      "schoolType": 1,
      "signature": "",
      "liveState": 2
    }
  },

  onLoad: function() {
    this.initData();
    this.getHeadImgPath();
    this.getUserInfo();
  },


  initData: function() {
    let cacheKey = "userEditInfo+" + app.globalData.apiHeader.UId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue)) {
      let gender = 'tempUserInfo.gender';
      let nickName = 'tempUserInfo.nickName';
      let birthDate = 'tempUserInfo.birthDate';
      let province = 'tempUserInfo.province';
      let city = 'tempUserInfo.city';
      let area = 'tempUserInfo.area';
      let schoolName = 'tempUserInfo.schoolName';
      let entranceDate = 'tempUserInfo.entranceDate';
      let schoolType = 'tempUserInfo.schoolType';
      let liveState = 'tempUserInfo.liveState';
      let signature = 'tempUserInfo.signature';

      var placeRegion0 = "placeRegion[" + 0 + "]";
      var placeRegion1 = "placeRegion[" + 1 + "]";
      var placeRegion2 = "placeRegion[" + 2 + "]";

      this.setData({
        [gender]: cacheValue.gender,
        [nickName]: cacheValue.nickName,
        [birthDate]: cacheValue.birthDate,
        [province]: cacheValue.province,
        [city]: cacheValue.city,
        [area]: cacheValue.area,
        [schoolName]: cacheValue.schoolName,
        [entranceDate]: cacheValue.entranceDate,
        [schoolType]: cacheValue.schoolType,
        [liveState]: cacheValue.liveState,
        [signature]: cacheValue.signature,
        //所在地下拉框默认值
        [placeRegion0]: cacheValue.province,
        [placeRegion1]: cacheValue.city,
        [placeRegion2]: cacheValue.area,
      })
    }
  },

  //获取我扔出去的没有被评论的动态
  getHeadImgPath: function() {
    var self = this;
    let cacheKey = "basicUserInfo+" + app.globalData.apiHeader.UId;
    let cacheValue = wx.getStorageSync(cacheKey);
    if (!app.isBlank(cacheValue) && !app.isBlank(cacheValue.headPhotoPath)) {
      self.setData({
        tempHeadImgPath: cacheValue.headPhotoPath,
      });
    }
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/BasicUserInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          console.info("获取用户头像成功！")
          self.setData({
            tempHeadImgPath: res.headPhotoPath
          });
          app.setCache(cacheKey, res);
          app.globalData.needCheckUseInfo=true;
        },
        function(res) {
          console.error("获取用户头像失败！");
        })
    }
  },

  //更新头像
  updateImgPath: function(path) {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/UpdateAvatarUrl', {
          "UId": app.globalData.apiHeader.UId,
          "AvatarUrl": path
        },
        function(res) {
          self.getHeadImgPath();
        },
        function(res) {
          console.error("更新用户头像失败！");
        })
    }
  },

  //获取我扔出去的没有被评论的动态
  getUserInfo: function() {
    var self = this;
    let cacheKey = "userEditInfo+" + app.globalData.apiHeader.UId;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/GetUserInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          if (res != null) {
            console.info("获取用户信息成功");
            let gender = 'tempUserInfo.gender';
            let nickName = 'tempUserInfo.nickName';
            let birthDate = 'tempUserInfo.birthDate';
            let province = 'tempUserInfo.province';
            let city = 'tempUserInfo.city';
            let area = 'tempUserInfo.area';
            let schoolName = 'tempUserInfo.schoolName';
            let entranceDate = 'tempUserInfo.entranceDate';
            let schoolType = 'tempUserInfo.schoolType';
            let liveState = 'tempUserInfo.liveState';
            let signature = 'tempUserInfo.signature';

            var placeRegion0 = "placeRegion[" + 0 + "]";
            var placeRegion1 = "placeRegion[" + 1 + "]";
            var placeRegion2 = "placeRegion[" + 2 + "]";

            self.setData({
              [gender]: res.gender,
              [nickName]: res.nickName,
              [birthDate]: res.birthDate,
              [province]: res.province,
              [city]: res.city,
              [area]: res.area,
              [schoolName]: res.schoolName,
              [entranceDate]: res.entranceDate,
              [schoolType]: res.schoolType,
              [liveState]: res.liveState,
              [signature]: res.signature,
              //所在地下拉框默认值
              [placeRegion0]: res.province,
              [placeRegion1]: res.city,
              [placeRegion2]: res.area,
            })

            app.setCache(cacheKey, res);
          }
        },
        function(res) {
          console.error("获取用户信息失败！");
        })
    }
  },


  //获取我扔出去的没有被评论的动态
  updateUserInfo: function() {
    let self = this;
    let tempUserInfo = this.data.tempUserInfo;
    let cacheKey = "userEditInfo+" + app.globalData.apiHeader.UId;
    app.setCache(cacheKey, tempUserInfo);
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/UpdateUserInfo', {
          "UId": app.globalData.apiHeader.UId,
          "Gender": tempUserInfo.gender,
          "NickName": tempUserInfo.nickName,
          "BirthDate": tempUserInfo.birthDate,
          "Province": tempUserInfo.province,
          "City": tempUserInfo.city,
          "Area": tempUserInfo.area,
          "SchoolName": tempUserInfo.schoolName,
          "EntranceDate": tempUserInfo.entranceDate,
          "SchoolType": tempUserInfo.schoolType,
          "Signature": tempUserInfo.signature,
          "LiveState": tempUserInfo.liveState
        },
        function(res) {
          if (res.isExecuteSuccess) {
            console.info("修改用户信息成功")
            app.saveToast(true);
          } else {
            app.saveToast(false);
          }
        },
        function(res) {
          console.error("修改用户信息失败！");
        })
    }
  },

  //页面下拉刷新监听
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },

  //生日下拉列表框
  bindBirthDayChange: function(e) {
    let birth = 'tempUserInfo.birthDate';
    this.setData({
      [birth]: e.detail.value
    })
  },

  //入学时间下拉列表
  bindEntranceDateChange: function(e) {
    let entrance = 'tempUserInfo.entranceDate';
    this.setData({
      [entrance]: e.detail.value
    })
  },

  //所在地监听变化
  bindPlaceRegionChange: function(e) {
    let province = 'tempUserInfo.province';
    let city = 'tempUserInfo.city';
    let area = 'tempUserInfo.area';
    var placeRegion0 = "placeRegion[" + 0 + "]";
    var placeRegion1 = "placeRegion[" + 1 + "]";
    var placeRegion2 = "placeRegion[" + 2 + "]";
    this.setData({
      [province]: e.detail.value[0],
      [city]: e.detail.value[1],
      [area]: e.detail.value[2],
      [placeRegion0]: e.detail.value[0],
      [placeRegion1]: e.detail.value[1],
      [placeRegion2]: e.detail.value[2],
    })
  },

  //学校类型下拉列表
  bindSchoolTypeChange: function(e) {
    let schoolType = 'tempUserInfo.schoolType';
    this.setData({
      [schoolType]: e.detail.value
    })
  },

  //性别单选框值变动
  genderChange: function(e) {
    let gender = 'tempUserInfo.gender';
    this.setData({
      [gender]: e.detail.value
    })
  },

  //学籍状态单选框值变动
  liveStateChange: function(e) {
    let liveState = 'tempUserInfo.liveState';
    this.setData({
      [liveState]: e.detail.value
    })
  },


  //选择图片方法
  uploadpic: function(e) {
    let self = this //获取上下文
    wx.chooseImage({
      count: 1, // 默认9，这里显示一次选择相册的图片数量 
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) { // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片 
        self.uploadimage(res.tempFiles[0]);
      }
    })
  },

  //上传图片
  uploadimage(tempPath) {
    let self = this
    wx.uploadFile({
      url: app.globalData.baseUrl + "Letter/UpLoadImg", //需要用HTTPS，同时在微信公众平台后台添加服务器地址  
      filePath: tempPath.path, //上传的文件本地地址    
      name: 'file',
      success: function(res) {
        let data = JSON.parse(res.data);
        if (data.success) {
          self.updateImgPath(data.content.imgPath);
        }
      },
      fail: function(res) {
        console.info(res);
      }
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