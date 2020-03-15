const app = getApp();

Page({

  data: {
    tempTextContent: "",
    source: 0,
    selectedItem: {
      "playType": 0,
      "stateType": 0, //1:线上2线下
      "desc": ""
    },
    onlinePlayList: [{
      "stateType": 1,
      "playType": 1,
      "desc": "王者"
    }, {
      "stateType": 1,
      "playType": 2,
      "desc": "吃鸡"
    }, {
      "stateType": 1,
      "playType": 3,
      "desc": "连麦"
    }, {
      "stateType": 1,
      "playType": 4,
      "desc": "游戏"
    }, {
      "stateType": 1,
      "playType": 5,
      "desc": "学习"
    }, {
      "stateType": 1,
      "playType": 6,
      "desc": "健身"
    }, {
      "stateType": 1,
      "playType": 7,
      "desc": "追剧"
    }, {
      "stateType": 1,
      "playType": 8,
      "desc": "早起"
    }, {
      "stateType": 1,
      "playType": 9,
      "desc": "扩列"
    }],
    offlinePlayList: [{
      "stateType": 2,
      "playType": 1,
      "desc": "看电影"
    }, {
      "stateType": 2,
      "playType": 2,
      "desc": "看演出"
    }, {
      "stateType": 2,
      "playType": 3,
      "desc": "看展览"
    }, {
      "stateType": 2,
      "playType": 4,
      "desc": "散步"
    }, {
      "stateType": 2,
      "playType": 5,
      "desc": "看书学习"
    }, {
      "stateType": 2,
      "playType": 6,
      "desc": "垂钓"
    }, {
      "playType": 2,
      "playType": 7,
      "desc": "健身"
    }, {
      "stateType": 2,
      "playType": 8,
      "desc": "一起遛狗"
    }, {
      "stateType": 2,
      "playType": 9,
      "desc": "一起蹦迪"
    }, {
      "stateType": 2,
      "playType": 10,
      "desc": "球类活动"
    }, {
      "stateType": 2,
      "playType": 11,
      "desc": "逛公园"
    }, {
      "stateType": 2,
      "playType": 12,
      "desc": "探索美食"
    }]
  },

  onLoad: function(options) {
    if (!app.isBlank(options)) {
      this.data.selectedItem.stateType = options.stateType;
      this.data.selectedItem.playType = options.playType;
      this.data.selectedItem.desc = options.desc;
      this.setData({
        source: options.source,
        selectedItem: this.data.selectedItem
      })
    }
  },

  //发布动态
  toNextPage: function() {
    wx.navigateTo({
      url: '../../pages/playcontent/playcontent?playType=' + this.data.selectedItem.playType + "&desc=" + this.data.selectedItem.desc + "&stateType=" + this.data.selectedItem.stateType
    })
  },

  //获取用户输入的用户名
  updatePrePage: function(e) {
    if (this.data.source == 0 || this.data.selectedItem == 0) {
      return;
    }
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      playType: this.data.selectedItem.playType,
      stateType: this.data.selectedItem.stateType,
      desc: this.data.selectedItem.desc
    })
  },


  cancelAddTagModal: function() {
    if (this.data.tempTextContent.length <= 0) {
      this.setData({
        showAddTagModal: false,
        tempTextContent: ""
      });
      return;
    }
    let item = {
      "desc": this.data.tempTextContent,
      "stateType": this.data.selectedItem.stateType
    };
    if (item.stateType == 1) {
      item.playType = this.getMaxValue(this.data.onlinePlayList);
      this.data.onlinePlayList.push(item);
      this.setData({
        onlinePlayList: this.data.onlinePlayList,
        selectedItem: item,
        showAddTagModal: false,
        tempTextContent: ""
      });
    } else {
      item.playType = this.getMaxValue(this.data.offlinePlayList);
      this.data.offlinePlayList.push(item);
      this.setData({
        offlinePlayList: this.data.offlinePlayList,
        selectedItem: item,
        showAddTagModal: false,
        tempTextContent: ""
      });
    }
    this.updatePrePage();
  },

  getMaxValue: function(list) {
    let maxValue = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].playType > maxValue) {
        maxValue = list[i].playType;
      }
    }
    return maxValue + 1;
  },

  showAddTagModal: function(ops) {
    this.data.selectedItem.stateType = ops.currentTarget.dataset.statetype;
    this.setData({
      selectedItem: this.data.selectedItem,
      showAddTagModal: true
    });
    this.updatePrePage();
  },


  //获取输入的聊天内容
  textContentInput: function(e) {
    this.setData({
      tempTextContent: e.detail.value
    })
  },

  selectedItemClick: function(ops) {
    let playType = ops.currentTarget.dataset.playtype;
    let stateType = ops.currentTarget.dataset.statetype;
    let desc = ops.currentTarget.dataset.desc;
    let item = this.data.selectedItem;
    if (this.data.selectedItem.playType == playType) {
      item.playType = 0;
      item.stateType = 0;
      item.desc = "";
    } else {
      item.playType = playType;
      item.stateType = stateType;
      item.desc = desc;
    }
    this.setData({
      selectedItem: item
    });
    this.updatePrePage();
    if (this.data.source == 1 && item.playType > 0) {
      wx.navigateBack({
        delta: 1
      })
    }

  }



})