const mtjwxsdk = require('/utils/mtj-wx-sdk.js');

const auth = require('/utils/auth.js');
// 获取倍率
const raterpx = 750.0 / wx.getSystemInfoSync().windowWidth;

/// 获取canvas转化后的rpx
const rate = function(rpx) {
  return rpx / raterpx
};


App({
  //全局变量
  globalData: {
    baseUrl: "https://www.pikaer.com/todayapi/",
    socketUrl: "https://www.pikaer.com/signalR/",
   //baseUrl: "https://localhost:44386/",
    // socketUrl: "https://localhost:44375/",

    httpHeader: {
      "Content-Type": "application/json"
    },
    apiHeader: {
      "Token": "",
      "UId": 0,
      "Platform": 0
    },
    openid: "",
    session_key: "",
    currentDiscussMoment: {
      "momentId": "",
      "momentUId": 0,
      "headImgPath": "",
      "nickName": "",
      "textContent": "",
      "imgContent": "",
      "createTime": ""
    }, //用户当前点击的动态，用以数据传递给动态详情页
    tempDiscussList: [], //chat初始化数据
    tempMomentList: [], //meindex页面初始化数据
    tempCollectList: [], //meindex页面初始化数据
    basicUserInfo: {}, //meindex页面初始化数据
    userInfoWX: {}, //微信提供的用户信息
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    needCheckUseInfo:false
  },

  /**
   * HttpPost请求封装
   * @param 请求相对地址 
   * @param 请求体数据
   * @param 请求成功回调函数
   * @param 请求失败回调函数
   */
  httpPost: function(url, content, successFunc, failFunc) {
    wx.request({
      url: this.globalData.baseUrl + url,
      method: "POST",
      data: {
        "Head": this.globalData.apiHeader,
        "Content": content
      },
      header: this.globalData.httpHeader,
      success: function(res) {
        if (res.data.success) {
          //   console.info("*******" + url + "成功获取数据*******" + JSON.stringify(res.data.content));
          return typeof successFunc == "function" && successFunc(res.data.content);
        } else {
          console.warn("*******" + url + "请求返回失败*******" + JSON.stringify(res.data));
          return typeof failFunc == "function" && failFunc(res.data)
        }
      },
      fail: function(res) {
        console.error("*******" + url + "请求响应失败*******" + JSON.stringify(res));
        return typeof failFunc == "function" && failFunc(res)
      }
    })
  },


  //弹框
  saveToast: function(success) {
    let title = success ? "保存成功" : "保存失败";
    let img = success ? "" : "../../content/images/warn.png"
    wx.showToast({
      title: title,
      icon: 'success',
      image: img,
      duration: 1000
    })
  },


  // 加载
  showLoading: function(title = '加载中') {
    wx.showLoading({
      title: title,
      icon: 'loading',
      mask: true
    });
  },

  // 隐藏加载
  hideLoading: function() {
    wx.hideLoading();
  },

  /// 文字提示弹窗
  showToast: function(msg) {
    if (msg == undefined) {
      wx.showToast({
        title: '网络繁忙，稍后重试',
        icon: 'none',
        mask: true
      })
    } else if (typeof msg == 'string') {
      wx.showToast({
        title: msg,
        icon: 'none',
        mask: true
      })
    }
  },

  //判断空指针
  isBlank: function(str) {
    if (str == null || str == undefined) {
      return true
    }
    if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
      return true
    } else if (
      Object.prototype.toString.call(str) === '[object String]' ||
      Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
      return str.length == 0 ? true : false
    } else if (Object.prototype.toString.call(str) === '[object Object]') {
      return JSON.stringify(str) == '{}' ? true : false
    } else {
      return true
    }
  },

  //存入缓存
  setCache: function(key, value) {
    try {
      wx.setStorageSync(key, value)
    } catch (e) {
      console.error("存入缓存失败，key=" + key);
    }
  },

})