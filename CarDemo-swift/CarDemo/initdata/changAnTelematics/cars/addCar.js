define([
		'text!cars/addCar.html',
		"common/navView",
		'butterfly',
		"common/osUtil",
		"common/ssUtil",
		"shared/js/notification"
	],
	function (template, View, Butterfly, osUtil, ssUtil, Notification) {
		var Base = View;
		window.callBackData = function (data) {
			var v = bfNaviController.current();
			if (v) {
				v.view.setVin(data);
			}
		};
		return Base.extend({
			events: {
				"click #submit_carid": "validateCarId",
				// "click #addCarDemo": "addCarDemo",
				"click #button_scan": "scanBarCode"
			},
			posGenHTML: function () {
				var me = this;
				var hasCar = bfDataCenter.hasCar();
				this.getElement("#addCarDemo").on("click", function(el){
					me.addCarDemo(el)
				})
				// if (hasCar) {
				// 	me.getElement("#addCarDemo").css("display", "none");
				// } else {
				// 	me.getElement("#addCarDemo").css("display", "block");
				// }

			},
			setVin: function (result) {
				var me = this;
				me.getElement("#vin").val(result);
			},
			uiAddChrysanthemum: function () {
				var me = this;
				if (me.$el.find('.chrysanthemum').length === 0) {
					me.$el.find('.content').append("<div class='chrysanthemum active'><div></div><div style='font-size: 14px;color: white;margin-top: 50px;text-align: center;'>加载中...</div></div>");
				}
			},
			uiRemoveChrysanthemum: function () {
				var me = this;
				me.$el.find('.chrysanthemum').remove();
			},
			addCarDemo: function (el) {
				var tar = $(el.currentTarget);
				tar.unbind("click");
				var self = this;
				//添加虚拟车辆
				bfClient.addDemoCar({
					type: 'post',
					success: function (data) {
						if (data.code == 0) {
							Notification.show({
								type: 'info',
								message: '添加虚拟车辆成功~~'
							});
							bfAPP.trigger("IM_EVENT_CAR_CHANGED");
							// self.goBack();
							bfNaviController.pop(1)
						} else if (data.code == 1) {
							Notification.show({
								type: 'error',
								message: '添加失败~~'
							});
						}
						tar.on("click", function(el){self.addCarDemo(el)})
					}
				});
			},
			scanBarCode: function () {
				var me = this;
				navigator.iChanganCommon.scanBarCode(function () {
				}, function () {
				});
			},
			validateCarId: function () {
				//对车辆信息的正则判断
				this._car = {};
				var _valid;
				var _valid_str;
				//对车架号的判断，必须为17位
				_valid = new RegExp("^[A-Za-z0-9]+$");
				_valid_str = this.getElement('#vin').val();
				if (_valid_str.length != 17) {
					Notification.show({
						type: "error",
						message: "车架号错误"
					});
					return;
				}
				if (_valid.test(_valid_str)) {
					this._car.vin = _valid_str;
				} else {
					Notification.show({
						type: "error",
						message: "请输入数字和字母"
					});
					return;
				}
				this._car.car_number = this.getElement('#car_number').val();
				var me = this;
				if(typeof cordova !="undefined"){
					me.uiAddChrysanthemum();
				}
				bfClient.addCarInfo({
					data: {'vin': this._car.vin, 'mileage': this._car.far_away, 'plateNumber': this._car.car_number},
					success: function (data) {
						if (data.code == '3') {
							bfAPP.trigger("IM_EVENT_CAR_CHANGED");
							Notification.show({
								type: "error",
								message: "注册失败！该车不是长安车"
							});
							me.goBack();
						} else if (data.code == '0') {
							//激活无设备
							if (data.data.devices == null || data.data.devices.length == 0) {
								me.getElement(".ceng-mess").css("display", "block");
								me.getElement("#yesSubmit").on("click", function () {
									me.getElement(".ceng-mess").css("display", "block");
									var obj = {
										carId: data.data.carId,
										routeFrom: 'fromAddCar',
										carV: data.data.vin
									}
									bfNaviController.push('/cars/equipmentBinding.html', obj);
									me.getElement(".ceng-mess").css("display", "none");
								});
								me.getElement("#cancleSubmit").on("click", function () {
									me.getElement(".ceng-mess").css("display", "none");
									bfAPP.trigger("IM_EVENT_CAR_CHANGED");
									var carV = me.getElement("#vin").val();
									bfNaviController.push('/cars/addCarStep2.html', {
										carId: data.data.carId,
										carV: carV,
										from: "addCar"
									});
								})
							} else {//激活有设备
								bfAPP.trigger("IM_EVENT_CAR_CHANGED");
								bfNaviController.push('/cars/addCarStep2.html', {
									carId: data.data.carId,
									carV: carV,
									from: "addCar"
								});
							}
						} else if (data.code == '6') {
							Notification.show({
								type: "error",
								message: data.msg
							});
						} else {
							Notification.show({
								type: "error",
								message: data.msg
							});
						}
						me.uiRemoveChrysanthemum();
					},
					error: function (error) {
						var eMsg = '发生未知错误';
						if (typeof(error) === 'string') eMsg = error;
						if (typeof(error) === 'object') {
							if (error.status == 0) eMsg = "网络开小差";
						}
						Notification.show({
							type: "error",
							message: eMsg
						});
						me.uiRemoveChrysanthemum();
					}
				});
			}
		});
	});