define([
	'common/imView',
	"common/control-cmd",
	"text!control/carWindows.html",
	"css!control/carWindows.css"
	],
	function(View,controlCmd, html){
		var Base = View;
		var cls = {}
		cls.id = "carWindowsView";
		cls.constructor = function(options,data){
			this._options = options;
			this._data = data;
			Base.prototype.constructor.call(this, options);
			this.$el.css({
	            'position': 'absolute',
	            'top': '0px',
	            'bottom': '0px',
	            'width': '100%',
	            'z-index': 100,
	          });
			var root = $("body");
			var siblingView = root.children("#remoteView");
			if (siblingView.length == 1) {
				return;
			};
			this.$el.html($(html)[0]);
			root.append(this.el);
			this.render();
		}
		cls.render = function(){
			Base.prototype.render.call(this);
			this.changeCarWindow(this._data.carWindows);
			this.onShow();
			this.addClick()
		}
		cls.onShow = function(){
			this._isShow = true;
			// this._currentControl = 1; // 1表示闪灯   2表示闪灯鸣笛
			this._options.controlView = this; 
			this._root = this.getElement("#carWindowsContainer");
			
		}
		cls.posGenHTML = function(){
			//自适应屏幕高度
			var me = this;
			// this.adaptiveScreen();
			this.animateSlideInRight();
		}
		cls.changeCarWindow = function(carWindows){
			var me = this;
			// 0 表示 关闭
			if(!carWindows){
				me.$('.items-Light').addClass("active");
				me.$('.items-Voice').removeClass("active");
				me.$('.air-warning-info').hide()
				me._currentControl = 1
				me._options.data = {};
				me.$('.carWindows-img-two').removeClass('open00')
			} else {
				me.$('.items-Light').removeClass("active");
				me.$('.items-Voice').addClass("active");
				me.$('.air-warning-info').show()
				me._currentControl = 2
				if(!me._options.data){
					me._options.data = {};
				}
				me._options.data.leftAnteriorWindowDegree = 0.2;
				me._options.data.leftRearWindowDegree = 0.2;
				me._options.data.rightAnteriorWindowDegree = 0.2;
				me._options.data.rightRearWindowDegree = 0.2;
				me.$('.carWindows-img-two').addClass('open00')
			}
		}
		cls.removeView = function(){
			this._isShow = false;
			var me = this;
			if (me._options.cancleControl && me._options.cancleControl()) {
				me._options.cancleControl();
			};
			me.animateSlideOutRight(function(){
				me.remove()
			});
			
		}
		cls.addClick = function(){
			var me = this;
			var selectControlItem = function(el){
				var tar = $(el.currentTarget);
				var type = tar.attr("data-name");
				tar.siblings(".items").removeClass("active");
				tar.addClass("active");
				if (type == "changeLight") {
					me.$('.air-warning-info').hide()
					me._currentControl = 1
					me._options.data = {};
					me.$('.carWindows-img-two').removeClass('open00')
					me.$('.carWindows-img-two').removeClass('open')
				}else{
					me.$('.air-warning-info').show()
					me._currentControl = 2
					if(!me._options.data){
						me._options.data = {};
					}
					me._options.data.leftAnteriorWindowDegree = 0.2;
					me._options.data.leftRearWindowDegree = 0.2;
					me._options.data.rightAnteriorWindowDegree = 0.2;
					me._options.data.rightRearWindowDegree = 0.2;
					me.$('.carWindows-img-two').removeClass('open00')
					me.$('.carWindows-img-two').addClass('open')

				}
			}
			
			me._options.checkPinSuccess = function(){
				me._isShow = false;
				me.animateSlideOutRight(function(){
                    //把当前的view移除
                    me.$el.remove()
                });
			}
			var controlStart = function(){
				controlCmd.ComtrolCarWindows(me._currentControl, me._options);
			}
			this._root.find(".items").on("click", selectControlItem);
			this._root.find(".cancle").on("click", function(){
				me.removeView()
			});
			this._root.find(".sure").on("click",controlStart)
		}
		return Base.extend(cls);
	})