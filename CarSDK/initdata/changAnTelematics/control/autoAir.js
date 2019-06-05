define([
	'common/imView',
	"text!control/autoAir.html",
	"common/control-cmd",
	'common/disUtil',
	'common/osUtil',
	"css!control/autoAir.css"
	],
	function(View,template, controlCmd, disUtil, osUtil){
		var Base = View;

		var Class = {
		}
		Class.id = "autoAirView";
		Class.constructor = function(options,data){
			var me = this;
			this._options = options;
			this._data = data;
			this._MinTemp = 18;
			this._MaxTemp = 32;
			Base.prototype.constructor.call(this, options);
			var root = $("body");
			var siblingView = root.children("#airView");
			if (siblingView.length == 1) {
				return;
			};
			this.$el.css({
	            'position': 'absolute',
	            'top': '0px',
	            'bottom': '0px',
	            'width': '100%',
	            'z-index': 100,
	          });
			this.$el.append($(template)[0]);
			root.append(this.el);
			this.render();
		}
		Class.render = function(){
			Base.prototype.render.call(this);
			if(!this._data.temperature){
				this._data.temperature = 26;
			}
			if(this._data.temperature<this._MinTemp){
				this._data.temperature = 18;
			}
			if(this._data.temperature>this._MaxTemp){
				this._data.temperature = 32;
			}
			this._temperature = parseInt(this._data.temperature);
			this.$('.temperatureValue').html(this._temperature);
			this.onShow();
			// this.asyncHTML();
		}
		Class.onShow = function(){
			var me = this;
			if(!this.firstOpen){
				this.selectSlide(this._temperature)
				this.TouchSlide()
			}
			this._isShow = true;
			this._airModel = 0;//空调制冷模式
			this._windowPower = 3;//空调风力
			this.adaptiveScreen();
			this.addClick();
			this._options.controlView = this;
		}
		Class.posGenHTML = function(){
			//自适应屏幕高度
			var me = this;
			// this.adaptiveScreen();
			this.animateSlideInRight();
		}
		Class.adaptiveScreen = function(){
			//获取屏幕的高度
			var topNode = this.getElement(".content-top");
			var leNode = this.getElement('.level-status');
			var caNode = this.getElement(".canvas-container");
			var bottomNode = this.getElement(".air-bottom");

			var clientH = disUtil.clientHeight;
			var itemT = topNode[0].clientHeight;
			var itemLe = leNode[0].clientHeight;
			var itemCa = caNode[0].clientHeight;
			var itemB = bottomNode[0].clientHeight;

			var cutH = clientH-itemT-itemLe-itemCa-itemB;
			topNode.css("padding-top",cutH/7+'px');
			leNode.css("padding-top",1.126*cutH+'px');
			bottomNode.css("padding-top",0.506*cutH+'px');
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
		Class.addClick = function(){
			var me = this;
            me._options.checkPinSuccess = function(){
				me._isShow = false;
                me.animateSlideOutRight(function(){
                    //把当前的view移除
                    me.$el.remove()
                });
            }
			var controlStart = function(){
				var temperature = me.$('.temperatureValue').html();
				controlCmd.ControlAir(true,{data:{temperature:temperature}}, me._options);
			}
			// 点击取消
			this.getElement(".cancle").on("click", function(){
				me.removeView()
			});
			// 点击确定
			this.getElement(".sure").on("click", controlStart);
		}
     	// 动画
		Class.changeScrollAnimate = function(){
		             
		}
		Class.TouchSlide = function(){
			var me = this;
			var $sliderTrack = this.$('#sliderTrack'),
	            $sliderHandler = this.$('#sliderHandler'),
	            $sliderValue = this.$('.temperatureValue');

	        var totalLen = this.$('#sliderInner').width(),
	            startLeft = 0,
	            startX = 0;

	        $sliderHandler
	            .on('touchstart', function (e) {
	                // startLeft = parseInt($sliderHandler.css('left')) * totalLen / 100;
	                startLeft = parseInt($sliderHandler.css('left'));
	                startX = e.originalEvent.changedTouches[0].clientX;
	            })
	            .on('touchmove', function(e){
	                var dist = startLeft + e.originalEvent.changedTouches[0].clientX - startX,
	                    percent;
	                dist = dist < 0 ? 0 : dist > totalLen ? totalLen : dist;
	                percent =  parseInt(dist / totalLen * 100);
	                $sliderTrack.css('width', percent + '%');
	                $sliderHandler.css('left', percent + '%');
	                // percentText的范围是 18~30
	                var percentText = parseInt(percent/100*(me._MaxTemp-me._MinTemp)) + me._MinTemp;
	                $sliderValue.text(percentText);

	                e.preventDefault();
	            })
		}
		Class.selectSlide = function(value){
			var $sliderTrack = this.$('#sliderTrack'),
	            $sliderHandler = this.$('#sliderHandler'),
	            $sliderValue = this.$('.temperatureValue');
	        var percent = (value - this._MinTemp)*100/(this._MaxTemp-this._MinTemp)

	        $sliderTrack.css('width', percent + '%');
	        $sliderHandler.css('left', percent + '%');
		}
		return Base.extend(Class);
	})