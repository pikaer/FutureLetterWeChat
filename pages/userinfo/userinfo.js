const app = getApp();
Page({
  data: {
    placeRegion: ['广东省', '广州市', '海珠区'],
    schoolTypeArray: ['其他', '学院/大学', '一本', '211/985/海外院校'],
    tempHeadImgPath: "",
    inputTextTitle: "",
    inputTextValue: "",
    cacheUserInfo: {}, //用户缓存信息
    showTagModal: false, //个性标签
    showTextInputModal: false, //个性标签
    tempUserInfo: {
      "gender": 1,
      "schoolType": 1,
      "liveState": 2
    },
    tagItems: [],
    needUpdate: false,
    currentTagType: 0,
    characterTagList: [],
    sportTagList: [],
    musicTagList: [],
    foodTagList: [],
    movieTagList: [],
    travelTagList: []
  },

  onLoad: function() {
    this.initData();
    this.getHeadImgPath();
    this.getUserInfo();
  },


  initData: function() {
    let cacheValue = wx.getStorageSync('userEditInfo');
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
        characterTagList: cacheValue.characterTagList,
        sportTagList: cacheValue.sportTagList,
        musicTagList: cacheValue.musicTagList,
        foodTagList: cacheValue.foodTagList,
        movieTagList: cacheValue.movieTagList,
        travelTagList: cacheValue.travelTagList,
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
          app.globalData.needCheckUseInfo = true;
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

  getUserInfo: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/GetUserInfo', {
          "UId": app.globalData.apiHeader.UId
        },
        function(res) {
          if (res != null) {
            console.info("获取用户信息成功");
            app.setCache('userEditInfo', res);
            self.initData()
          }
        },
        function(res) {
          console.error("获取用户信息失败！");
        })
    }
  },

  updateUserInfo: function() {
    let self = this;
    let tempUserInfo = this.data.tempUserInfo;
    app.setCache('userEditInfo', tempUserInfo);
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
          } else {
            console.error("修改用户信息失败！");
          }
        },
        function(res) {
          console.error("修改用户信息失败！");
        })
    }
  },


  updateUserTag: function() {
    var self = this;
    if (app.globalData.apiHeader.UId > 0) {
      app.httpPost(
        'Letter/UpdateUserTag', {
          "UId": app.globalData.apiHeader.UId,
          "TagType": this.data.currentTagType,
          "TagList": this.data.tagItems
        },
        function(res) {
          if (res != null && res.isExecuteSuccess) {
            console.info("更新用户标签数据成功");
          } else {
            console.error("更新用户标签数据失败！");
          }
        },
        function(res) {
          console.error("更新用户标签数据失败！");
        })
    }
  },

  showTextInputModal: function(ops) {
    let title = ops.currentTarget.dataset.texttitle;
    let textValue = "";
    switch (title) {
      case '更改昵称':
        textValue = this.data.tempUserInfo.nickName
        break;
      case '更改个性签名':
        textValue = this.data.tempUserInfo.signature
        break;
      case '更改学校信息':
        textValue = this.data.tempUserInfo.schoolName
        break;
    }
    this.setData({
      inputTextTitle: title,
      inputTextValue: textValue,
      showTextInputModal: true
    })
  },

  //获取输入的聊天内容
  textValueInputAction: function (e) {
    this.setData({
      inputTextValue: e.detail.value
    })
  },

  cancelTextInput: function() {
    this.setData({
      showTextInputModal: false
    })
  },

  submitTextInput: function() {
    this.cancelTextInput();
    let title = this.data.inputTextTitle;
    let textValue = this.data.inputTextValue;
    let userInfo = this.data.tempUserInfo;
    switch (title) {
      case '更改昵称':
        userInfo.nickName = textValue;
        break;
      case '更改个性签名':
        userInfo.signature = textValue;
        break;
      case '更改学校信息':
        userInfo.schoolName = textValue;
        break;
    }
    this.setData({
      showTagModal: false,
      tempUserInfo: userInfo
    })
    this.updateUserInfo();
  },

  tagCancelClick: function() {
    this.setData({
      showTagModal: false
    })
  },

  tagSubmitClick: function() {
    this.tagCancelClick();
    if (!this.data.needUpdate) {
      return;
    }
    let tagType = this.data.currentTagType;
    let items = this.data.tagItems;
    let userinfo = this.data.tempUserInfo;
    switch (tagType) {
      case 1:
        this.setData({
          characterTagList: items
        });
        userinfo.characterTagList = items;
        break;
      case 2:
        this.setData({
          sportTagList: items
        });
        userinfo.sportTagList = items;
        break;
      case 3:
        this.setData({
          musicTagList: items
        });
        userinfo.musicTagList = items;
        break;
      case 4:
        this.setData({
          foodTagList: items
        });
        userinfo.foodTagList = items;
        break;
      case 5:
        this.setData({
          movieTagList: items
        });
        userinfo.movieTagList = items;
        break;
      case 6:
        this.setData({
          travelTagList: items
        });
        userinfo.travelTagList = items;
        break;
    }
    this.setData({
      tempUserInfo: userinfo
    });
    app.setCache("userEditInfo", userinfo);
    this.updateUserTag();
  },

  showTagSelectModel: function(ops) {
    let tagType = ops.currentTarget.dataset.tagtype;
    let tagItems = [];
    switch (tagType) {
      case 1:
        tagItems = this.data.characterTagList;
        break;
      case 2:
        tagItems = this.data.sportTagList;
        break;
      case 3:
        tagItems = this.data.musicTagList;
        break;
      case 4:
        tagItems = this.data.foodTagList;
        break;
      case 5:
        tagItems = this.data.movieTagList;
        break;
      case 6:
        tagItems = this.data.travelTagList;
        break;
    }
    this.setData({
      tagItems: tagItems,
      currentTagType: tagType,
      showTagModal: true,
      needUpdate: false
    })
  },

  tagAddClick: function() {

  },

  checkboxChange: function(ops) {
    let tag = ops.currentTarget.dataset.tag;
    let items = this.data.tagItems;
    let needUpdate = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].tag === tag) {
        items[i].checked = !items[i].checked;
        needUpdate = true;
      }
    }
    if (needUpdate) {
      this.setData({
        tagItems: items,
        needUpdate: needUpdate
      })
    }
  },

  //生日下拉列表框
  bindBirthDayChange: function(e) {
    let birth = 'tempUserInfo.birthDate';
    this.setData({
      [birth]: e.detail.value
    })
    this.updateUserInfo();
  },

  //入学时间下拉列表
  bindEntranceDateChange: function(e) {
    let entrance = 'tempUserInfo.entranceDate';
    this.setData({
      [entrance]: e.detail.value
    })
    this.updateUserInfo();
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
    this.updateUserInfo();
  },

  //学校类型下拉列表
  bindSchoolTypeChange: function(e) {
    let schoolType = 'tempUserInfo.schoolType';
    this.setData({
      [schoolType]: e.detail.value
    })
    this.updateUserInfo();
  },

  //性别单选框值变动
  genderChange: function(e) {
    let gender = 'tempUserInfo.gender';
    this.setData({
      [gender]: e.detail.value
    })
    this.updateUserInfo();
  },

  //学籍状态单选框值变动
  liveStateChange: function(e) {
    let liveState = 'tempUserInfo.liveState';
    this.setData({
      [liveState]: e.detail.value
    })
    this.updateUserInfo();
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