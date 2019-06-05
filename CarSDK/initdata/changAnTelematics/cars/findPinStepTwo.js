define([
        "common/navView",
        "shared/js/notification"
	],
	function(View,Notification){
		var Base = View;
		return Base.extend({
			events:{
				"click #setPinBtn":"submitData"
			},
			onViewPush: function(pushFrom, pushData){
				if (pushData) {
					this._carId = pushData.carId;
				};
			},
			onShow: function(){
			},
			submitData: function(){
				var pinVal = this.getElement("#newPin").val();
				var pinValAgain = this.getElement("#newPinAgain").val();
				var token = window.localStorage['token'];
				
				// var deviceId = window.localStorage['deviceId'];
				var deviceId = JSON.parse(OSApp.getInfo()).deviceId;
				// alert(typeof(JSON.parse(OSApp.getInfo())))
				var isNev = window.localStorage.isNev;
				if (!pinVal || !pinValAgain) {
					Notification.show({
						type:"error",
						message:"请输入控车码"
					});
					return;
				};
				if (pinVal != pinValAgain) {
					Notification.show({
						type:"error",
						message:"控车码与确认控车码不符"
					});
					return;
				};

				var data ={
					carId: this._carId,
					pin: pinVal,
					token: token,
					deviceId: deviceId,
					isNev: isNev,
					mapType: 'GCJ02'
				}
				// var data ={
				// 	carId: '1028193252469391360',
				// 	pin: 'DXJlL5QVggCA3JzNk9%2FI80EF7pk6pabkhOWPEbLMp9hGCBYT7DA8MM31j0o%2B56dEXNtaLhx%2BSmH1%0D%0A0jRWLVcsgvDcfpUEV41yucXP4GolN19ThrCQSfzTWrgFqFZwneGFBUmyYOjsCosW6vtYHzqDdEYC%0D%0ANn%2BDDICaLmdw6Tu%2FRMg%3D%0D%0A',
				// 	token: 'ea9q50QUnJRamGsOGAqcRO6gYz2a01cL',
				// 	deviceId: '356156070490313',
				// 	isNev: '2',
				// 	mapType: 'GCJ02'
				// }
				data.pin = OSApp.RSA(data.pin);
				// OSApp.showStatus("error", JSON.stringify(data))
				bfClient.confirmFindPin({
					data: data,
					success: function(data){
						console.log(data)
						if (data.code == 0) {
							bfNaviController.pop(2)
							Notification.show({
								type:"error",
								message:"找回控车码成功"
							})
						}else if (data.code == 5) {
							bfNaviController.pop(1);
							Notification.show({
								message:"页面超时"
							})
						}else{
							Notification.show({
								message:data.msg
							})
						}
					},
					error: function(error){
						// OSApp.showStatus("error", '网络开小差');
						Notification.show({
								type:"error",
								message:"网络开小差"
							})
						
					}
				})
				// //调用原生插件
				// navigator.packaging.confirmFindPin(data, function(data){
				// 	console.log(data)
				// 	if (data.code == 0) {
				// 		bfNaviController.pop(2)
				// 		Notification.show({
				// 			type:"error",
				// 			message:"找回控车码成功"
				// 		})
				// 	}else if (data.code == 5) {
				// 		bfNaviController.pop(1);
				// 		Notification.show({
				// 			message:"页面超时"
				// 		})
				// 	}else{
				// 		Notification.show({
				// 			message:data.msg
				// 		})
				// 	}
				// }, function(error){
				// 	Notification.show({
				// 		message:"网络开小差"
				// 	})
				// })
			}
		})
	})