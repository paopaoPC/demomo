define([
	'common/imView',
	"text!control/pin.html",
	'common/osUtil',
	"shared/plugin_dialogOld/js/dialog",
	"css!control/pin.css"
	],
	function(View,template, osUtil,dialog){
		var Base = View;

		var Class = {
		}
		Class.id = "pinView";
		Class.constructor = function(params, options){
			var me = this;
			this._param = params.param;
			this._options = options;
			Base.prototype.constructor.call(this, params, options);
			this.$el.css({
	            'position': 'absolute',
	            'top': '0px',
	            'bottom': '0px',
	            'width': '100%',
	            'z-index': 999,
	          });
			var root = $("body");
			var siblingView = root.children("#pinView");
			if (siblingView.length == 1) {
				return;
			};
			this.$el.html($(template)[0]);
			root.append(this.el);
			this.render();
		}
		Class.render = function(){
			Base.prototype.render.call(this);
			this.onShow();
			this.addClick()
		}
		Class.adaptiveScreen = function(){
			var containerH = this.getElement("#pinContainer")[0].clientHeight;
			var topH = this.getElement(".content-top")[0].clientHeight;
			var centerH = this.getElement(".num-container")[0].clientHeight;
			var bottomNode = this.getElement(".buttom-item");
			var bottonH = containerH-topH-centerH;
			bottomNode.css("height", bottonH+"px");
			bottomNode.find("div").css("line-height",bottonH+"px")
		}
		Class.onShow = function(){
			this._isShow = true;
			this.adaptiveScreen();
			this._root = this.getElement("#pinContainer");
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
				RemoteSearchCar2:["远程闪灯","远程闪灯大概需要20秒"],
				OpenAir:["空调远程开启","远程开启空调大概需要20秒"],
				CloseAir:["空调远程关闭","远程关闭空调大概需要20秒"],
				UpCarCondition: ["拉取车辆状态", "拉取车辆状态大概需要20秒"],
				OpenWindow: ["远程控制车窗"," "],
				CloseWindow: ["远程控制车窗"," "],
				OpenClosePurifier0: ["空气净化器开启","空气净化器开启后，默认将在10分钟后自动关闭"],
				OpenClosePurifier1: ["空气净化器关闭",""],
			}			
			if (this._type) {
				var titleNode = this._root.find(".content-title");
				var infoNode = this._root.find('.content-info');
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
				}else if (this._type == 'FlashLight') {
					titleNode.text(text.RemoteSearchCar2[0]);
					infoNode.text(text.RemoteSearchCar2[1])
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
					titleNode.text(text.OpenClosePurifier0[0]);
					infoNode.text(text.OpenClosePurifier0[1])
				}else if (this._type +this._airPurifier == 'OpenClosePurifier1') {
					titleNode.text(text.OpenClosePurifier1[0]);
					infoNode.text(text.OpenClosePurifier1[1])
				};
			};
		}
		Class.posGenHTML = function(){
			var me = this;
			this.animateSlideInRight(function(){
				//把前面的view移除
				me.$el.siblings("#remoteView").remove();
				me.$el.siblings("#airView").remove()
			});
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
				var cricleContainer = me._root.find(".cricle-container");
				if (len > 0) {
					cricleContainer.find("div:eq('"+(len-1)+"')").removeClass("active")
					me._pinArr.pop();
				};
			}
			var goToSetPin = function(){
				// me.animateSlideInRight(function(){
					me.remove()
				// });
				// bfNaviController.push("cars/setPINForCar.html",{carId: bfDataCenter.getCarId(),type: "setpin"})
				// dialog.createDialog({
	   //              autoOpen: true, //默认为true
	   //              closeBtn: false,
	   //              buttons: {
	   //                  '我知道了': function () {
	   //                      this.close(); //所有逻辑必须放在关闭之前
	   //                  }
	   //              },
	   //              content: "请联系4S店重置控车码"
	   //          });
				bfNaviController.push("cars/findPinStepOne.html",{carId:bfDataCenter.getCarId()})
			}
			var changeBag = function(el){
				var tar = $(el.currentTarget);
				tar.css("background-color","rgba(255,255,255,0.2)")
			}
			this._root.find("#cancle").on("click", function(){
				me.removeView()
			});
			this._root.find(".item").on("touchstart",changeBag);
			this._root.find(".item").on("touchend", backBag);
			this._root.find("#delect").on("click",popToArr);
			this._root.find("#forgetPin").on("click",goToSetPin)
		}
		Class.removeView = function(){
			var me = this;
			this._isShow = false;
			if (me._options.cancleControl && me._options.cancleControl()) {
				me._options.cancleControl();
			};
			me.animateSlideOutRight(function(){
				me.remove()
			});
		}
		Class.pushToArr = function(target){
			var me = this;
			num = parseInt(target.attr("data-item"));
			var len = this._pinArr.length;
			var cricleContainer = this._root.find(".cricle-container");
			if (len < 6) {
				this._pinArr.push(num);
				cricleContainer.find("div:eq('"+(this._pinArr.length-1)+"')").addClass("active");
			};
			var pinArr = this._pinArr.join("");
			osUtil.delayCall(function(){
				if (me._pinArr.length == 6) {
					// me.checkPinFromServer(pinArr);
					if (me._options) {
						me._options && me._options(me,pinArr, function(){}, 
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
		
		return Base.extend(Class);
	})
