define([
	'common/imView',
	"text!control/air.html",
	"common/control-cmd",
	'common/disUtil',
	'common/osUtil',
	"css!control/air.css"
	],
	function(View,template, controlCmd, disUtil, osUtil){
		var Base = View;

		var Class = {
		}
		Class.id = "airView";
		Class.constructor = function(options){
			var me = this;
			this._options = options;
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
	            'z-index': 999,
	          });
			this.$el.append($(template)[0]);
			root.append(this.el);
			this.render();
		}
		Class.render = function(){
			Base.prototype.render.call(this);
			this.onShow();
			// this.asyncHTML();
		}
		Class.onShow = function(){
			var me = this;
			this._isShow = true;
			this._airModel = 0;//空调制冷模式
			this._windowPower = 3;//空调风力
			this.adaptiveScreen();
			this.addClick();
			this.addListener();
			this._options.controlView = this;
		}
		Class.posGenHTML = function(){
			//自适应屏幕高度
			var me = this;
			// this.adaptiveScreen();
			this.animateSlideInRight();
			this.changLight(0,0)
		}
		Class.adaptiveScreen = function(){
			//获取屏幕的高度
			var topNode = this.getElement(".content-top");
			var leNode = this.getElement('.level-status');
			var caNode = this.getElement(".canvas-container");
			var airNode = this.getElement('#air_scroll');
			var bottomNode = this.getElement(".air-bottom");

			var clientH = disUtil.clientHeight;
			var itemT = topNode[0].clientHeight;
			var itemLe = leNode[0].clientHeight;
			var itemCa = caNode[0].clientHeight;
			var itemAir = airNode[0].clientHeight;
			var itemB = bottomNode[0].clientHeight;

			var cutH = clientH-itemT-itemLe-itemCa-itemAir-itemB;
			topNode.css("padding-top",cutH/10+'px');
			leNode.css("padding-top",cutH/5+'px');
			airNode.css("margin-top",cutH/5+'px');
			bottomNode.css("padding-top",cutH/5+'px');
		}
		Class.removeView = function(){
			var me = this;
			this._isShow = false;
			me.removeListener();
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
				controlCmd.ControlAir(true,{data:{airModel: me._airModel,windPower:me._windowPower}}, me._options);
			}
			var scrollLight = function(el){
				me.scrollLights(el);
			}
			this.getElement(".cancle").on("click", function(){
				me.removeView()
			});
			this.getElement(".sure").on("click", controlStart);
			this.getElement(".item").on("click",scrollLight)
		}
		Class.scrollLights = function(el){
			var me = this;
			var target = $(el.currentTarget);
			var index = target.context.className.substring(9);
			index = parseInt(index);
			this.changLight(index, 0)
		}
		//温度计滑动
        Class.start_temp = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var touch = event.touches[0];//touches数组对象获得屏幕上所有的touch，取第一个touch
            this._s = this.getElement('#air_scroll')[0].getBoundingClientRect();
            this._tempWidth = this.getElement('#air_scroll').width();
            this._tempCirleWidth = this.getElement('#temp_circle').css('width');
        }
        Class.move_temp = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var touch = event.touches[0];//touches数组对象获得屏幕上所有的touch，取第一个touch
            var s = this.getElement('#temp_circle')[0].getBoundingClientRect();
            var left = parseInt(touch.clientX - this._s.left) / parseInt(this._tempWidth);
            var max = 1 - parseInt(this._tempCirleWidth) * 0.5 / parseInt(this._tempWidth);
            var right_per;
            var left_per;
            var score;
            if (left < parseInt(this._tempCirleWidth) * 0.5 / parseInt(this._tempWidth) * -1) {
                left = parseInt(this._tempCirleWidth) * 0.5 / parseInt(this._tempWidth) * -1;
                left_per = 0;
                right_per = 1;
            } else if (left > max) {
                left_per = left;
                right_per = (1 - left) * 1;
                left = max;
            } else {
                left_per = left * 1;
                right_per = (1 - left) * 1;
            }
            if (left_per < 0) {
            	this._curLeftPer = 0;
                left_per = '0';
                right_per = '100%';
            } else if (left_per > 1) {
            	this._curLeftPer =  100;
                left_per = '100%';
                right_per = '0';
            } else {
            	this._curLeftPer =  left_per * 100;
                left_per = left_per * 100 + '%';
                right_per = right_per * 100 + '%';
            }
            score = left + parseInt(this._tempCirleWidth) * 0.5 / parseInt(this._tempWidth);
            left = left * 100 + '%';
            // score = parseInt(score * 14) + 18+"<span style='font-size: 13px;'>℃</span>";
            // this.elementHTML('#sp_temp', score);
            this._score = parseInt(score * 14) + 18;
            this.getElement('#temp_circle').css('left', left);
            this.getElement('#air_scroll div').eq(0).css('width', left_per);
            // $('#air_scroll div').eq(1).css('width', right_per);
            this.commonMethodMove()
        }
        Class.end_temp = function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.commonMethodMove()
        }
        Class.commonMethodMove = function(){
        	//滑动结束后触动条形动画
            if (this._curLeftPer > 0) {
            	var index = parseInt((this._curLeftPer / 100) * 6);
            	this.changLight(index, 1)
            }else{
            	var index = -1; //目的是让第一个条形item隐藏
            	this.changLight(index, 1)
            }
        }
		Class.changLight = function(index, type){ //type:0表示条形动画执行后滑动条滑动，1表示滑动条滑动后条形动画执行
			var me = this;
			var aniNode = this.getElement(".canvas-item-light").find('.item');
			//改变条状动画的同时改变滑动动画
			if (type == 0) {
				this._curLeftPer = (index+1)*15 + index * 1.6;
				this.changeScrollAnimate();
			};
			this.changeTextInfo()
			var q = [
			];
			var showItems = function(){
				for (var i = 0; i <= index; i++) {
					var fun;
					if ($(aniNode[i]).hasClass('items')) {
						continue;
					};
					(function(i){
						fun =function(){
							$(aniNode[i]).addClass("items");
							$(aniNode[i]).animate({"width":"15%"},100, next)
						} 
					})(i);
					q.push(fun)
				};
			}
			var hideItems = function(){
				for (var i = index; i <6; ++i) {
					var fun;
					if ($(aniNode[i+1]) && $(aniNode[i+1]).hasClass('items')) {
						(function(i){
							fun =function(){
								$(aniNode[i+1]).removeClass("items");
								$(aniNode[i+1]).animate({"width":"0"},100, next)
							} 
						})(i);
						q.unshift(fun)
					};
				};
			}
			if (index >= 0) {
				if ($(aniNode[index]).hasClass('items')) {
					//判断当前节点后有几个兄弟有items属性并隐藏
					hideItems();
				}else{
					showItems();
				}
			}else{
				hideItems();
			}
			
			var next = function(){
				me.$el.dequeue('myQueue')
			}
			this.$el.queue('myQueue', q);
			next();
		}
		Class.changeScrollAnimate = function(){
			var right_per = (100 - this._curLeftPer) + "%"; 
			this.getElement('#temp_circle').animate({'left': this._curLeftPer+'%'});
            this.getElement('#air_scroll div').eq(0).animate({'width': this._curLeftPer+'%'});               
		}
		Class.changeTextInfo =  function(){
			var textNode = this.getElement(".level-status");
			if (this._curLeftPer <= 16.7) {
				this._airModel = 0;
				this._windowPower = 3;
				textNode.text('高级制冷')
			}else if (this._curLeftPer > 16.7 && this._curLeftPer <=33.3) {
				this._airModel = 0;
				this._windowPower = 2;
				textNode.text('中级制冷')
			}else if (this._curLeftPer > 33.3 && this._curLeftPer <= 50.1){
				this._airModel = 0;
				this._windowPower = 1;
				textNode.text('低级制冷')
			}else if (this._curLeftPer >50.1 && this._curLeftPer <= 66.8) {
				this._airModel = 1;
				this._windowPower = 1;
				textNode.text('低级制热')
			}else if (this._curLeftPer >66.8 && this._curLeftPer <= 83.5) {
				this._airModel = 1;
				this._windowPower = 2;
				textNode.text('中级制热')
			}else{
				this._airModel = 1;
				this._windowPower = 3;
				textNode.text('高级制热')
			}
		}
		Class.addListener = function(){
			var self = this;
			this._tempCircle = this.getElement('#air_scroll')[0];
            this._tempCircle.addEventListener('touchstart', function () {
                self.start_temp(event)
            }, false);
            this._tempCircle.addEventListener('touchmove', function () {
                self.move_temp(event)
            }, false);
            this._tempCircle.addEventListener('touchend', function () {
                self.end_temp(event)
            }, false);
		}
		Class.removeListener = function(){
			var self = this;
			this._tempCircle.removeEventListener('touchstart', function () {
                self.start_temp(event)
            }, false);
            this._tempCircle.removeEventListener('touchmove', function () {
                self.move_temp(event)
            }, false);
            this._tempCircle.removeEventListener('touchend', function () {
                self.end_temp(event)
            }, false);
		}
		return Base.extend(Class);
	})