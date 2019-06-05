define([
	'common/imView',
	"text!common/pin.html",
	'common/osUtil',
	"css!common/pin.css"
	],
	function(View,template, osUtil){
		var Base = View;

		var Class = {
		}
		Class.constructor = function(params, options){
			var me = this;
			this._param = params.param;
			this._options = options;
			Base.prototype.constructor.call(this, params, options);
			var root = $("body");
			root.append(template);
			this.render();
		}
		Class.render = function(){
			Base.prototype.render.call(this);
			this.onShow();
			this.addClick()
		}
		Class.onShow = function(){
			this._isShow = true;
			this._pinArr = [];
			if (this._param) {
				this._type = this._param.data.cmd
				this._airPurifier = this._param.data.airPurifier
			};
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
				OpenClosePurifier0: ["空气净化器开启","空气净化器开启后，默认将在10分钟后自动关闭"],
				OpenClosePurifier1: ["空气净化器关闭",""],
			}	
			if (this._type) {
				var titleNode = $(".content-title");
				var infoNode = $('.content-info');
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
				}else if (this._type == "RemoteSearchCar" || this._type == "FlashLight") {
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
				}else if (this._type + this._airPurifier == 'OpenClosePurifier0') {
					titleNode.text(text.OpenPurge[0]);
					infoNode.text(text.OpenPurge[1])
				}else if (this._type +this._airPurifier == 'OpenClosePurifier1') {
					titleNode.text(text.ClosePurge[0]);
					infoNode.text(text.ClosePurge[1])
				};
			};
		}
		Class.addClick = function(){
			var me = this;
			var backBag = function(el){
				var tar = $(el.currentTarget);
				tar.css("background-color","transparent");
				me.pushToArr(tar)
			}
			var popToArr = function(){
				var len = me._pinArr.length;
				var cricleContainer = $(".cricle-container");
				if (len > 0) {
					cricleContainer.find("div:eq('"+(len-1)+"')").removeClass("active")
					me._pinArr.pop();
				};
			}
			var goToSetPin = function(){
				$("#pinContainer").remove();
				bfNaviController.push("cars/setPINForCar.html",{carId: bfDataCenter.getCarId(),type: "setpin"})
			}
			$("#cancle").on("click", this.removeView);
			$(".item").on("touchstart",this.changeBag);
			$(".item").on("touchend", backBag);
			$("#delect").on("click",popToArr);
			$("#forgetPin").on("click",goToSetPin)
		}
		Class.changeBag = function(el){
			var tar = $(el.currentTarget);
			tar.css("background-color","rgba(255,255,255,0.2)")
		}
		Class.backBag = function(el){
			var tar = $(el.currentTarget);
			tar.css("background-color","transparent");
			this.pushToArr(tar)
		}
		Class.pushToArr = function(target){
			var me = this;
			num = parseInt(target.attr("data-item"));
			var len = this._pinArr.length;
			var cricleContainer = $(".cricle-container");
			if (len < 6) {
				this._pinArr.push(num);
				cricleContainer.find("div:eq('"+(this._pinArr.length-1)+"')").addClass("active");
			} else {
				return
			}
			var pinArr = this._pinArr.join("");
			osUtil.delayCall(function(){
				if (me._pinArr.length == 6) {
					// me.checkPinFromServer(pinArr);
					var v = $("#pinContainer");
					if (me._options) {
						me._options && me._options(v,pinArr, function(){}, 
							function(error){
								me._pinArr = [];
								cricleContainer.find("div").removeClass("active");
							})
					};
				};
			},100);
			// var checkPinFromServer;
			// (function(type){
			// 	 checkPinFromServer = function(){
			// 		controlCmd.sendPinCodeByNavigator(pinArr,{
			// 			checkPinSuccess: function(data){
			// 				bfNaviController.popTo("main/index",{data:data})
			// 			},
			// 			checkPinError:function(data){
			// 				me._pinArr = [];
			// 				cricleContainer.find("div").removeClass("active");
			// 			}
			// 		})
			// 	}
			// })(me._type)
			
		}
		Class.checkPinFromServer = function(pinArr){
			var me = this;
			console.log(ControlCmd)
			ControlCmd.sendPinCodeByNavigator(pinArr,{
				checkPinSuccess: function(data){
					bfNaviController.popTo("main/index",{data:data})
				},
				checkPinError:function(data){
					me._pinArr = [];
					cricleContainer.find("div").removeClass("active");
				}
			})
		}
		Class.removeView = function(){
			this._isShow = false;
			$("#pinContainer").remove()
		}
		return Base.extend(Class);
	})
