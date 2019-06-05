define([
	'common/imView',
	"common/control-cmd",
	"text!control/remote.html",
	"css!control/remote.css"
	],
	function(View,controlCmd, html){
		var Base = View;
		var cls = {}
		cls.id = "remoteView";
		cls.constructor = function(options){
			this._options = options;
			Base.prototype.constructor.call(this, options);
			this.$el.css({
	            'position': 'absolute',
	            'top': '0px',
	            'bottom': '0px',
	            'width': '100%',
	            'z-index': 999,
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
			this.onShow();
			this.addClick()
		}
		cls.onShow = function(){
			this._isShow = true;
			this._currentControl = 1; // 1表示闪灯   2表示闪灯鸣笛
			this._options.controlView = this; 
			this._root = this.getElement("#remote");
			
		}
		cls.posGenHTML = function(){
			//自适应屏幕高度
			var me = this;
			// this.adaptiveScreen();
			this.animateSlideInRight();
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
					me._currentControl = 1
				}else{
					me._currentControl = 2
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
				controlCmd.ControlWhistle(me._currentControl, me._options);
			}
			this._root.find(".items").on("click", selectControlItem);
			this._root.find(".cancle").on("click", function(){
				me.removeView()
			});
			this._root.find(".sure").on("click",controlStart)
		}
		return Base.extend(cls);
	})