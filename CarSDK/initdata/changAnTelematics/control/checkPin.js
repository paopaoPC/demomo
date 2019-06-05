define([
		"text!control/checkPin.html",
		'common/navView',
		'common/osUtil',
		'shared/js/notification',
		'common/control-cmd',
		'common/disUtil'
	],
	function(template,View, osUtil, Notification, controlCmd, disUtil){
		var Base = View;
		return Base.extend({
			html: template,
			events: {
				// "click .item": "pushToArr",
				"touchstart .item": "changeBag",
				"touchend .item": "backBag",
				'click #delect': "popToArr",
				'click #cancle':"goBack",
				'click #forgetPin': "goToSetPin"
			},
			onViewPush: function(pushFrom, pushData){
			},
			asyncHTML: function(){
				//自适应屏幕高度
				this.adaptiveScreen()
			},
			posGenHTML: function(){	
				if (controlCmd.param) {
					this._type = controlCmd.param.data.cmd;
					this._temperature = controlCmd.param.data.temperature;
				};
				// $("body").append(template);
				var text = {
					LockDoor:["车门远程关闭","车门远程关闭大概需要20秒"],
					UnLockDoor:["车门远程解锁","车门远程解锁大概需要20秒"],
					OpenTrunk:["后备箱远程开启","后备箱远程开启大概需要20秒"],
					CloseTrunk:["后备箱远程关闭","后备箱远程关闭大概需要20秒"],
					OpenDormer:["天窗远程开启","天窗远程开启大概需要20秒"],
					CloseDormer:["天窗远程关闭","天窗远程关闭大概需要20秒"],
					RemoteSearchCar:["远程闪灯鸣笛","远程闪灯鸣笛大概需要20秒"],
					OpenAir:["空调远程开启","远程开启空调大概需要20秒"],
					CloseAir:["空调远程关闭","远程关闭空调大概需要20秒"],
					UpCarCondition: ["拉取车辆状态", "拉取车辆状态大概需要20秒"],
					OpenWindow: ["远程控制车窗",""],
					CloseWindow: ["远程控制车窗",""],
					OpenPurge: ["空气净化器开启","空气净化器开启后，默认将在10分钟后自动关闭"],
					ClosePurge: ["空气净化器关闭",""],
				}			
				if (this._type) {
					var titleNode = this.getElement(".content-title");
					var infoNode = this.getElement('.content-info');
					if (this._type == 'LockDoor') {
						titleNode.text(text.LockDoor[0]);
						infoNode.text(text.LockDoor[1])
					}else if(this._type == "UnLockDoor"){
						titleNode.text(text.UnLockDoor[0]);
						infoNode.text(text.UnLockDoor[1])
					}else if (this._type == "OpenTrunk") {
						titleNode.text(text.OpenTrunk[0]);
						infoNode.text(text.OpenTrunk[1])
					}else if (this._type == "CloseTrunk") {
						titleNode.text(text.CloseTrunk[0]);
						infoNode.text(text.CloseTrunk[1])
					}else if (this._type == "OpenDormer") {
						titleNode.text(text.OpenDormer[0]);
						infoNode.text(text.OpenDormer[1])
					}else if (this._type == "CloseDormer") {
						titleNode.text(text.CloseDormer[0]);
						infoNode.text(text.CloseDormer[1])
					}else if (this._type == "RemoteSearchCar") {
						titleNode.text(text.RemoteSearchCar[0]);
						infoNode.text(text.RemoteSearchCar[1])
					}else if (this._type == 'OpenAir') {
						titleNode.text(text.OpenAir[0]);
						infoNode.text(text.OpenAir[1])
					}else if (this._type == "CloseAir") {
						titleNode.text(text.CloseAir[0]);
						infoNode.text(text.CloseAir[1])
					}else if (this._type == 'UpCarCondition') {
						titleNode.text(text.UpCarCondition[0]);
						infoNode.text(text.UpCarCondition[1])
					}else if (this._type == 'OpenWindow') {
						titleNode.text(text.OpenWindow[0]);
						infoNode.text(text.OpenWindow[1])
					}else if (this._type == 'CloseWindow') {
						titleNode.text(text.CloseWindow[0]);
						infoNode.text(text.CloseWindow[1])
					}else if (this._type == 'OpenPurge') {
						titleNode.text(text.OpenPurge[0]);
						infoNode.text(text.OpenPurge[1])
					}else if (this._type == 'ClosePurge') {
						titleNode.text(text.ClosePurge[0]);
						infoNode.text(text.ClosePurge[1])
					};
				};
			},
			adaptiveScreen: function(){
				//获取屏幕的高度
				var topNode = this.getElement(".content-top");
				var bottomNode = this.getElement(".buttom-item");
				var clientH = disUtil.clientHeight;
				var itemT = topNode[0].clientHeight;
				var itemC = this.getElement(".num-container")[0].clientHeight;//高度是固定的
				var itemB = bottomNode[0].clientHeight;//高度固定
				var cutH = clientH - itemT - itemC -itemB;
				topNode.css({'padding-top':cutH/4+'px','padding-bottom':cutH/4+'px'})
				bottomNode.css({'padding-top':cutH/4+'px','padding-bottom':cutH/4+'px'})
			},
			goBack: function(){
				// if (this._type == "OpenAir") {
				// 	bfNaviController.pop(2)
				// }else{
				// 	bfNaviController.pop(1)
				// }
				bfNaviController.popTo("main/index")
				
			},
			onRemove: function(){
			},
			onShow: function(){
				this._pinArr = [];
				// this._psw = "123456";
				// var supportsMixBlendMode = window.getComputedStyle(document.body).mixBlendMode;
				// console.log("浏览器是否支持该特性"+supportsMixBlendMode)
				
			},
			pushToArr: function(target){
				var me = this;
				num = parseInt(target.attr("data-item"));
				var len = this._pinArr.length;
				var cricleContainer = this.getElement(".cricle-container");
				if (len < 6) {
					this._pinArr.push(num);
					cricleContainer.find("div:eq('"+(this._pinArr.length-1)+"')").addClass("active");
				};
				var pinArr = this._pinArr.join("");
				osUtil.delayCall(function(){
					if (me._pinArr.length == 6) {
						checkPinFromServer();
					};
				},100);
				var checkPinFromServer;
				(function(type){
					 checkPinFromServer = function(){
						controlCmd.sendPinCodeByNavigator(pinArr,{
							checkPinSuccess: function(data){
								// if (type == 'OpenAir') {
								// 	bfNaviController.pop(2, {data: data})
								// }else{
								// 	bfNaviController.pop(1, {data: data})
								// }
								bfNaviController.popTo("main/index",{data:data})
							},
							checkPinError:function(data){
								me._pinArr = [];
								cricleContainer.find("div").removeClass("active");
							}
						})
					}
				})(me._type)
				
			},
			popToArr: function(){
				var len = this._pinArr.length;
				var cricleContainer = this.getElement(".cricle-container");
				if (len > 0) {
					cricleContainer.find("div:eq('"+(len-1)+"')").removeClass("active")
					this._pinArr.pop();
				};
			},
			changeBag: function(el){
				var tar = $(el.currentTarget);
				tar.css("background-color","rgba(255,255,255,0.2)")
			},
			backBag: function(el){
				var tar = $(el.currentTarget);
				tar.css("background-color","transparent");
				this.pushToArr(tar)
			},
			goToSetPin: function(){
				bfNaviController.push("cars/setPin.html")
			}
		})
	})
