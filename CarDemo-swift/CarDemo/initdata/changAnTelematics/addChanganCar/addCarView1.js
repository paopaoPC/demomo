define([
		"common/navView",
        "text!addChanganCar/addCarView.html",
		'butterfly',
		"shared/js/notification"
	],
	function(View,template,Butterfly,Notification){
        var Base = View;
		return Base.extend({
			id: 'addCarView',
			html: template,
			events:{
				"click #submit_carid": "submitData",
				"click #addCarDemo":"addCarDemo",
				"click #navLeft":"asdasd",

			},
			asdasd: function(){
				if(window.localStorage['goMainIndex'] == '2'){
					OSApp.closeView();
				} else {
					bfNaviController.pop(1)
				}
			},
			onViewPush:function(pushFrom, pushData){
				if (pushData) {
					if (pushData.hasVirtalCar) {
						this.getElement("#addCarDemo").hide()
					};
				};
			},
			posGenHTML: function() {
			},
			onShow:function(){
			},
			addCarDemo: function (el) {
				var tar = $(el.currentTarget);
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
					}
				});
			},
			submitData: function(){
				var carVin = this.getElement("#vin").val();
				// var engineNum = this.getElement("#engineNum").val().trim();
				if (!carVin) {
					Notification.show({
                        type: "error",
                        message: "请输入车架号"
                    });
                    return;
				};
				// if (!engineNum) {
				// 	Notification.show({
				// 		type:"error",
				// 		message:"请输入发动机号"
				// 	})
				// };
				//对车架号的判断，必须为17位
                _valid = new RegExp("^[A-Za-z0-9]+$");
				if (carVin.length != 17) {
					Notification.show({
                        type: "error",
                        message: "车架号错误"
                    });
                    return;
				}
				if (!_valid.test(carVin)) {
					Notification.show({
                        type: "error",
                        message: "请输入数字和字母"
                    });
                    return;
				};
				var carData = {
					vin: carVin, 
					enginNo: ''
				}

				bfClient.getChanganCar({
					data: carData,
					success: function(data){
						if (data.code == 0) {
							bfNaviController.push("addChanganCar/carInfo.html",carData)
						}else{
							Notification.show({
								type:"error",
								message:data.msg
							})
						}
					},
					error: function(){
						Notification.show({
							type:"error",
							message:"网络开小差"
						})
					}
				})
			}
		}); 
	});