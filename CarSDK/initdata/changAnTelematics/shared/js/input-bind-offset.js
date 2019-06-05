//  options参数： {
	// scrollEl(需要滚动的jquery对象),
	// inputRang(需绑定事件的input所在的范围,不传代表当scrollEl里面的input文本框)
// }
define(['backbone'], function(Backbone){

	return Backbone.View.extend({

		className: 'inputBIndOffset',

		defaults: {
		},

		initialize: function(options){
			_.extend(this, this.defaults, options);
			// inputRang(需绑定事件的input所在的范围,不传代表当scrollEl里面的input文本框)
			if(!this.inputRang){
				this.inputRang = this.scrollEl;
			}
			this.scrollDom = this.scrollEl[0];
			if(typeof deviceIsIOS === 'undefined'){
				var u = navigator.userAgent;
				this.deviceIsIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); 
			} else {
				this.deviceIsIOS = deviceIsIOS;
			}
		},

		// 事件销毁
		unbind: function(){
			if(this.deviceIsIOS){
				this.scrollEl.off('scroll');
			}
		},

		// 事件绑定
		bind: function(){
			var me = this;
			this.timer = undefined;
			this.inputRang.find('input[input-bind-offset]').on('focus',this.offsetEvent.bind(this));
			this.inputRang.find('textarea[input-bind-offset]').on('focus',this.offsetEvent.bind(this));
			this.inputRang.find('input[input-bind-offset]').on('blur',this.unOffsetEvent.bind(this));
			this.inputRang.find('textarea[input-bind-offset]').on('blur',this.unOffsetEvent.bind(this));
			if(this.deviceIsIOS){
				this.scrollEl.scroll(function(e){
					var top = e.currentTarget.scrollTop;
					if(top < 0){
						me.canSet = false;
					} else if(top == 0){
						me.canSet = true;
					}
				})
			}
			

		},
		offsetEvent: function(e){
			var me = this;
			var offset = $(e.currentTarget).attr('input-bind-offset');
			if(offset){
				var offsetNumber = parseInt(offset);
				offsetNumber = Math.abs(offsetNumber);
				var stopOffsetNumber = me.scrollDom.scrollTop + offsetNumber;
				if(stopOffsetNumber<0){
					stopOffsetNumber = 0;
				}
				var oStep = 5;
			} else {
				return
			}
			if(this.deviceIsIOS){
				if(me.canSet == false){
					return
				}
			}
			cancelAnimationFrame(me.timer);
			me.timer = requestAnimationFrame(function fn(){
				var oTop = me.scrollDom.scrollTop;
				if(me.deviceIsIOS){
					if(me.scrollDom.style.textShadow === ""){
						me.scrollDom.style.textShadow = 'rgba(0,0,0,0) 0 0 0';
					} else {
						me.scrollDom.style.textShadow = '';
					}
				}
				if(oTop < stopOffsetNumber){
					me.scrollDom.scrollTop = oTop + oStep;
					if(oTop == me.scrollDom.scrollTop){
						cancelAnimationFrame(me.timer);
						return
					}
					me.timer = requestAnimationFrame(fn);
				}else{
					cancelAnimationFrame(me.timer);
				} 
			});
			

		},
		unOffsetEvent: function(e){
			var me = this;
			var offset = $(e.currentTarget).attr('input-bind-offset');
			if(offset){
				var offsetNumber = parseInt(offset);
				offsetNumber = Math.abs(offsetNumber);
				var stopOffsetNumber = me.scrollDom.scrollTop - offsetNumber;
				if(stopOffsetNumber<0){
					stopOffsetNumber = 0;
				}
				var oStep = 5;
			} else {
				return
			}
			if(this.deviceIsIOS){
				if(me.canSet == false){
					return
				}
			}
			cancelAnimationFrame(me.timer);
			me.timer = requestAnimationFrame(function fn(){
				var oTop = me.scrollDom.scrollTop;
				if(me.deviceIsIOS){
					if(me.scrollDom.style.textShadow === ""){
						me.scrollDom.style.textShadow = 'rgba(0,0,0,0) 0 0 0';
					} else {
						me.scrollDom.style.textShadow = '';
					}
				}
				if(oTop > stopOffsetNumber){
					me.scrollDom.scrollTop = oTop - oStep;
					if(oTop == me.scrollDom.scrollTop){
						cancelAnimationFrame(me.timer);
						return
					}
					me.timer = requestAnimationFrame(fn);
				}else{
					cancelAnimationFrame(me.timer);
				} 
			});
		}
	}
	, {
		bind: function(options){
			var n = new this(options);
			n.bind();
			return n;
		}
	}
	);
});