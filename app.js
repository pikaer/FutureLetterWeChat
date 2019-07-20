App({
  //全局变量
  globalData: {
    baseUrl: "https://www.pikaer.com/todayapi/",
    // baseUrl: "https://localhost:44386/",

    httpHeader: {
      "Content-Type": "application/json"
    },
    apiHeader: {
      "Token": "",
      "UId": 0,
      "Platform": "miniApp"
    },
    openid: "",
    session_key: "",
    userInfoWX: {}, //微信提供的用户信息
    userInfoAPI: {} //从API获取的用户信息
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
          console.info("*******" + url + "成功获取数据*******" + JSON.stringify(res.data.content));
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
  saveToast: function (success) {
    let title = success ? "保存成功" : "保存失败";
    let img = success ? "" : "../../content/images/warn.png"
    wx.showToast({
      title: title,
      icon: 'success',
      image: img,
      duration: 1000
    })
  },


  //判断空指针
  isBlank: function(str) {
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
  }
})