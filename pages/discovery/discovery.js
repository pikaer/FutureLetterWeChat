const app = getApp()

Page({
	data: {
		currentMoment: {},
		pickUpList: [],
		pageIndex: 1,
		loadHide: true,
		actionHidden: true,
		actionAllClearHidden: true,
	},

	onShow: function () {
		this.getPickUpList();
	},

	onLoad: function () {
		this.getPickUpList();
	},
	//下拉刷新页面数据
	onPullDownRefresh: function () {
		this.getPickUp();
	},


	//停止刷新
	stopRefresh: function () {
		this.setData({
			loadHide: true
		});
	},

	//删除瓶子
	deleteItem: function () {
		var self = this;
		let pickUpId = this.data.currentMoment.pickUpId;
		let index = this.data.selectItem.key;
		app.httpPost(
			'api/Letter/DeleteBottle', {
				"PickUpId": pickUpId
			},
			function (res) {
				console.info("删除瓶子成功！");
				let list = self.data.pickUpList;
				list.splice(index, 1);
				self.setData({
					pickUpList: list
				});

				self.resetSelectItem()
			},
			function (res) {
				console.info("删除瓶子失败");
			})
	},

	//举报瓶子
	reportItem: function (ops) {
		var self = this;
		let pickUpId = this.data.currentMoment.pickUpId;
		app.httpPost(
			'api/Letter/ReportBottle', {
				"PickUpId": pickUpId
			},
			function (res) {
				console.info("举报瓶子成功！");
				self.resetSelectItem()
			},
			function (res) {
				console.info("举报瓶子失败");
				self.resetSelectItem()
			})
	},

	//更多
	moreAction: function (ops) {
		let key = ops.currentTarget.dataset.key;
		let pickUpId = ops.currentTarget.dataset.pickUpId;
		let pickUpList = this.data.pickUpList;
		this.setData({
			actionHidden: false,
			selectItem: ops.currentTarget.dataset,
			currentMoment: pickUpList[key]
		})
	},

	//重置
	resetSelectItem: function () {
		this.setData({
			actionHidden: true,
			selectItem: []
		})
	},

	//重置
	resetAllClearSelectItem: function () {
		this.setData({
			actionAllClearHidden: true
		})
	},

	//触底加载更多数据
	onReachBottom: function () {
		let page = this.data.pageIndex + 1;
		this.setData({
			loadHide: false,
			pageIndex: page
		});

		let self = this;
		//loading动画加载1.5秒后执行
		setTimeout(function () {
			self.getPickUpList();
		}, 1500)

	},

	//置顶
	toTop: function () {
		wx.pageScrollTo({
			scrollTop: 0
		})
	},

  //全部清空
	allClearClick: function () {
		this.setData({
			actionAllClearHidden: false,
		})
	},

	//动态详情页面
	previewMomentDetail: function (e) {
		let momentId = e.currentTarget.dataset.momentid;
		wx.navigateTo({
			url: "../../pages/momentdetail/momentdetail?momentId=" + momentId
		})
	},

	//发布动态
	publishMoment: function () {
		wx.navigateTo({
			url: '../../pages/publishmoment/publishmoment'
		})
	},

	//跳转个人空间页面
	toSpace: function (e) {
		let uId = e.currentTarget.dataset.uId;
		wx.navigateTo({
			url: "../../pages/userspace/userspace?uid=" + uId
		})
	},

	// 预览图片
	previewImg: function (e) {
		let imgContent = e.currentTarget.dataset.imgcontent;
		let imgContents=[];
		imgContents.push(imgContent);
		wx.previewImage({
			//当前显示图片
			current: imgContent,
			//所有图片
			urls: imgContents
		})
	},

	//获取动态
	getPickUpList: function () {
		var self = this;
		let tempPickUpList = self.data.pickUpList;
		app.httpPost(
			'api/Letter/PickUpList', {
				"UId": app.globalData.apiHeader.UId,
				"PageIndex": this.data.pageIndex
			},
			function (res) {
				if (tempPickUpList.length == 0) {
					tempPickUpList = res.pickUpList
				} else {
					if (res.pickUpList != null && res.pickUpList.length > 0) {
						tempPickUpList = tempPickUpList.concat(res.pickUpList);
					}
				}
				self.setData({
					pickUpList: tempPickUpList
				});
				self.stopRefresh();
			},
			function (res) {
				console.info("获取数据失败");
				self.stopRefresh();
			})
	},

	//下拉获取新的瓶子
	getPickUp: function () {
		var self = this;
		let tempPickUpList = self.data.pickUpList;
		app.httpPost(
			'api/Letter/PickUp', {
				"UId": app.globalData.apiHeader.UId
			},
			function (res) {
				if (tempPickUpList.length == 0) {
					tempPickUpList = res.pickUpList
				} else {
					if (res.pickUpList != null && res.pickUpList.length > 0) {
						tempPickUpList = res.pickUpList.concat(tempPickUpList);
					}
				}
				self.setData({
					pickUpList: tempPickUpList
				});
				wx.stopPullDownRefresh();
			},
			function (res) {
				console.info("获取数据失败");
				wx.stopPullDownRefresh();
			})
	},

	//清空所有未回复过的瓶子
	allClear: function () {
		var self = this;
		app.httpPost(
			'api/Letter/ClearAllBottle', {
				"UId": app.globalData.apiHeader.UId
			},
			function (res) {
				console.info("清空所有未回复过的瓶子成功");
				self.setData({
					pickUpList:[]
				});
				self.resetAllClearSelectItem()
			},
			function (res) {
				console.warn("清空所有未回复过的瓶子失败");
			})
	}
})