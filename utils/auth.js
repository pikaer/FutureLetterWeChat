
/// 开启相册
function writePhotosAlbum(success) {
  isAuthorize('writePhotosAlbum', success)
}
 
function isAuthorize(scope, success) {
  wx.getSetting({
    success: res => {
      const status = res.authSetting[`scope.${scope}`];
      if (status != undefined) { 
        /// 请求过授权
        status ? success() : wx.openSetting({
          success: res => {
            if (res.authSetting[`scope.${scope}`]) {
              success();
            }
          }
        }); 
      } else {
        /// 未请求授权
        wx.authorize({
          scope: `scope.${scope}`,
          success: res => {
            success();
          },
          fail: res => {
            wx.showToast({
              title: '请求授权失败',
              icon: 'none',
              mask: true
            })
          }
        })
      }
    }
  })
}

module.exports = { 
  writePhotosAlbum: writePhotosAlbum
}