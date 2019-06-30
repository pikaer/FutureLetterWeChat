const app = getApp();
Page({
  data: {
    placeRegion: ['广东省', '广州市', '海珠区'],
    schoolTypeArray: ['其他', '学院/大学', '一本', '211/985/海外院校'],
    tempHeadImgPath:"",
    tempUserInfo: {
      "gender": 1,
      "nickName": "Hello",
      "birthDate": "2016-09-07",
      "province": "海南省",
      "city": "三亚市",
      "area": "海珠区",
      "schoolName": "上海大学",
      "entranceDate": "2017-12",
      "schoolType": 1,
      "signature": "",
      "liveState": 2
    }
  },

  onLoad: function () {
    this.getHeadImgPath();
    this.getUserInfo();
  },

  //获取我扔出去的没有被评论的动态
  getHeadImgPath: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/BasicUserInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function (res) {
          console.info("获取用户头像成功！")
          self.setData({
            tempHeadImgPath: res.headPhotoPath
          });
        },
        function (res) {
          console.error("获取用户头像失败！");
        })
    }
  },

  //获取我扔出去的没有被评论的动态
  getUserInfo: function () {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/GetUserInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function (res) {
          if (res!= null) {
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
          }
        },
        function (res) {
          console.error("获取用户信息失败！");
        })
    }
  },


  //获取我扔出去的没有被评论的动态
  updateUserInfo: function () {
    let self = this;
    let tempUserInfo = this.data.tempUserInfo;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'api/Letter/UpdateUserInfo', {
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
        function (res) {
          if (res.isExecuteSuccess) {
            console.info("修改用户信息成功")
            app.saveToast(true);
          } else {
            app.saveToast(false);
          }
        },
        function (res) {
          console.error("修改用户信息失败！");
        })
    }
  },

  //页面下拉刷新监听
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  //生日下拉列表框
  bindBirthDayChange: function (e) {
    let birth = 'tempUserInfo.birthDate';
    this.setData({
      [birth]: e.detail.value
    })
  },

  //入学时间下拉列表
  bindEntranceDateChange: function (e) {
    let entrance = 'tempUserInfo.entranceDate';
    this.setData({
      [entrance]: e.detail.value
    })
  },

  //所在地监听变化
  bindPlaceRegionChange: function (e) {
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
  bindSchoolTypeChange: function (e) {
    let schoolType = 'tempUserInfo.schoolType';
    this.setData({
      [schoolType]: e.detail.value
    })
  },

  //性别单选框值变动
  genderChange: function (e) {
    let gender = 'tempUserInfo.gender';
    this.setData({
      [gender]: e.detail.value
    })
  },

  //学籍状态单选框值变动
  liveStateChange: function (e) {
    let liveState = 'tempUserInfo.liveState';
    this.setData({
      [liveState]: e.detail.value
    })
  }
})

