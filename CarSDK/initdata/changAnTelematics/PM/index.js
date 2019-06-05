define([
	"common/navView",
    'butterfly',
    "shared/js/notification",
    'PM/pm25Configure'
	], function(View, butterfly, Notification, Configure){
		var Base = View;
		return Base.extend({
			events: {

			},
			posGenHTML: function(){
				// this._data = {
				// 	pm25InnnerCarValue: 34,
				// 	updateTime:"2017-06-07 12:00:00.0",
				// 	pm25OuterCarValue: -1,
				// 	carLocationResp:{
				// 		addrDesc:"重庆市江北区建新东路观音桥大兴村50号"
				// 	}
				// }
				// this.tempView()
			},
			asyncHTML: function(){
				var me = this;
				var data = {
					carId:bfDataCenter.getCarId()
				}
				bfClient.getCarPm25ByCarId({
					data:data,
					success: function(data){
						if (data.code == 0) {
							me._data = data.data;
							me.tempView()
						}else{
							me.setRightVisible(false)
							Notification.show({
								type:"error",
								message: data.msg
							})
						}
					},
					error: function(error){
						me.setRightVisible(false)
						Notification.show({
							type:"error",
							message:"网络开小差"
						})
					}
				})
				
			},
			tempView: function(){
				var innerValue, outerValue, carLocation;
				this._levelText = "";
				//车内pm
				innerValue = this._data.pm25InnnerCarValue;

				var backgroundColorNode = this.getElement(".img-color");
				var dataLevelNode = this.getElement(".data-level");
				var outerValueNode = this.getElement("#outerValue");
				var outerTextNode = this.getElement("#outerText");
				var carLocationNode = this.getElement(".car-location");
				if (this._data.updateTime) {
					this.setTitle("数据采集时间:"+this._data.updateTime.slice(0,-2));
				};
				if ( (innerValue!= -1 && !!innerValue) || innerValue === 0) {
					var configData = Configure.getLevel(innerValue);
					this.getElement(".data-value").text(innerValue);
					this._levelText = configData.levelText;
					dataLevelNode.text(this._levelText);
					this.getElement(".data-info").text(configData.levelIntroduction);
					backgroundColorNode.css("background-color",configData.backColorNodeStyle);
					dataLevelNode.css("background-color",configData.dataLevelNodeStyle);
				}else {
					this.setRightVisible(false)
					// dataLevelNode.hide()
				};
				if (innerValue >=76) {
					this.setRightVisible(false)
				};
				//车外pm
				outerValue = this._data.pm25OuterCarValue;
				if ((!!outerValue && outerValue != -1) || outerValue === 0) {
					var outerLevel = Configure.getLevel(this._data.pm25OuterCarValue);
					outerValueNode.text(outerValue);
					outerTextNode.text(outerLevel.levelText)
					outerTextNode.css("background-color",outerLevel.dataLevelNodeStyle)
				};
				carLocation = this._data.carLocationResp;
				if (carLocation) {
					if (carLocation.addrDesc) {
						carLocationNode.text(carLocation.addrDesc);
						carLocationNode.css("color","#333333")
					};
				};
			},
			onRight: function(){
				var me = this;
				var position = me._data.carLocationResp;
				var carPosition, carLocation;
				if (position) {
					carPosition = position.lng+","+position.lat;
					carLocation = position.addrDesc
				};
				bfClient.createPmShare({
					data:{
						carId:bfDataCenter.getCarId(),
						currentPosition: carPosition,
						currentLocation: carLocation,
						outerPm:me._data.pm25OuterCarValue,
						innnerPm: me._data.pm25InnnerCarValue,
						shareConditionTime:me._data.updateTime
					},
					success: function(data){
						if (data.code == 0) {
							var url = bfConfig.server + "/appserver/static/sharePM/sharePM.html?shareId=" + data.data.shareid;
							var text = "车内PM2.5监测："+me._levelText+"。长安欧尚A800，一款会呼吸的MPV";
                            navigator.appInfo.shareAll({"Title":'长安欧尚',"Text":text,"Url":url}, function () {}, function () {});
						}else{
							Notification.show({
								type:"error",
								message:data.msg
							})
						}
					},
					error: function(error){
						Notification.show({
							type:"error",
							message:"网络开小差"
						})
					}
				})
			}
		})
	})