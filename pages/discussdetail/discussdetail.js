const app = getApp()
Page({
	data: {
		discussDetail: {},
		discussDetailList:[],
		pickUpId: "",
		discussContent: ""
	},

	onLoad: function (options) {
		this.data.pickUpId = options.pickUpId
		this.discussDetail();
	},

	//下拉刷新页面数据
	onPullDownRefresh: function () {
		this.discussDetail();
	},

	// 预览图片
	previewImg: function (e) {
		let imgContents = e.currentTarget.dataset.imgcontents;
		let index = e.currentTarget.dataset.index;
		wx.previewImage({
			//当前显示图片
			current: imgContents[index],
			//所有图片
			urls: imgContents
		})
	},

	//获取输入的聊天内容
	discussContentInput: function (e) {
		this.setData({
			discussContent: e.detail.value
		})
	},

	//获取动态
	discussDetail: function () {
		var self = this;
		app.httpPost(
			'api/Letter/DiscussDetail', {
				"PickUpId": self.data.pickUpId
			},
			function (res) {
				let tempDetailList = res.discussDetailList;
				self.setData({
					discussDetail: res,
					discussDetailList: tempDetailList
				});
				wx.stopPullDownRefresh();
			},
			function (res) {
				console.info("获取数据失败");
				wx.stopPullDownRefresh();
			})
	},

	//发表评论
	insertDiscussContent: function () {
		var self = this;
		app.httpPost(
			'api/Letter/Discuss', {
				"UId": app.globalData.apiHeader.UId,
				"PickUpId": self.data.pickUpId,
				"TextContent": self.data.discussContent
			},
			function (res) {
				if (res.isExecuteSuccess) {
					self.setData({
						discussContent: ""
					});
					self.discussDetail();
					console.info("发表评论成功");
				}
			},
			function (res) {
				console.error("发表评论失败");
			})
	},
})