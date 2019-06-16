const app = getApp()

Page({
	data: {
		currentMoment: {},
		pickUpList: [],
		pageIndex: 1,
		loadHide: true,
		actionHidden: true
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
		let index = ops.currentTarget.dataset.key;
		let pickUpId = ops.currentTarget.dataset.pickUpId;
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
			},
			function (res) {
				console.info("删除瓶子失败");
			})
	},

	//举报瓶子
	reportItem: function () {
		let pickUpId = ops.currentTarget.dataset.pickUpId;
		app.httpPost(
			'api/Letter/ReportBottle', {
				"PickUpId": pickUpId
			},
			function (res) {
				console.info("举报瓶子成功！");
			},
			function (res) {
				console.info("举报瓶子失败");
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

	//重置长按选择项
	resetSelectItem: function () {
		this.setData({
			actionHidden: true,
			selectItem: []
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

	onShow: function () {
		this.getPickUpList();
	},

	//置顶
	toTop: function () {
		wx.pageScrollTo({
			scrollTop: 0
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

	reportItem: function () {
		let currentMoment = this.data.currentMoment;
		wx.navigateTo({
			url: "/pages/chatdetail/chatdetail?partnerUId=" + currentMoment.uId + "&nickName=" + currentMoment.dispalyName
		})

	},

	//预览图片
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
	}
})