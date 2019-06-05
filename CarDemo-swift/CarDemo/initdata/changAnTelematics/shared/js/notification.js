define(['backbone', 'spin',"common/disUtil"], function(Backbone, Spinner, disUtil){
	var q =[];
	var flag = 0;
	return Backbone.View.extend({

		className: 'notification',

		defaults: {
			duration: 2000,
			autoDismiss: true,
			type: 'info',
			showSpin: false
		},

		initialize: function(options){
			_.extend(this, this.defaults, options);
			// var root = $("#HUDContainer");
			// this._elemStatusContainer = $("<div id='statusHUD'      style='z-index:3;position:absolute;background-color:transparent;pointer-events:none;width:100%;height:100%;text-align:center;'></div>");
			// root.append(this._elemStatusContainer);
			// var v = "<div id='statusView' class='StatusView'>"+this.message+"</div>"
			// this._elemStatusContainer.html(v); 
			// this.el.classList.add(this.type);

			this.el.innerHTML = options.message;

			document.body.appendChild(this.el);

			// if (this.showSpin) this.spinner = new Spinner({
			// 	left: '20px',
			// 	lines: 7,
			// 	speed: 1.3,
			// 	length: 3,
			// 	radius: 3,
			// 	color: '#666'
			// }).spin(this.el);
		},

		remove: function(){
			if (this.timeout) {
				clearTimeout(this.timeout);
			};
			
			if (this.spinner) this.spinner.stop();

			Backbone.View.prototype.remove.call(this, arguments);
		},

		show: function(option){
			// this.el.classList.add('active');
			if (this.autoDismiss) {
				var me = this;
				me.dismiss(option);
			};
		},
		dismiss: function(option){
			// this.el.classList.remove('active');

			var me = this;
			var max = disUtil.remToPx(3);
			var min = disUtil.remToPx(0.5);

			var w = this.$el.width();
			if(w > max)
			{
				w = max;
				this.$el.css("width", w+"px");
				
			}
			// else if(w < min)
			// {
			// 	w = min;
			// 	this.$el.css("width", w+"px");
			// }
			this.$el.css("left", (disUtil.clientWidth-w)*0.5+"px");
			setTimeout(function()
			{
				me.$el.fadeOut(200, function(){
					me.remove();
					option && option();
					if (q.length == 0) {
						flag = 0
					};
				});
			}, 2000);
			q.shift();
			me.$el.hide().fadeIn(200);
			// var onTransitionEnd = function(){
			// 	me.el.removeEventListener('webkitTransitionEnd', onTransitionEnd);
			// 	me.el.removeEventListener('msTransitionEnd', onTransitionEnd);
		 //        me.el.removeEventListener('oTransitionEnd', onTransitionEnd);
		 //        me.el.removeEventListener('otransitionend', onTransitionEnd);
		 //        me.el.removeEventListener('transitionend', onTransitionEnd);
			// 	me.remove();

			// 	if (me.onDismiss) me.onDismiss();
			// }

			// 	this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
			// 	this.el.addEventListener('msTransitionEnd', onTransitionEnd);
			//     this.el.addEventListener('oTransitionEnd', onTransitionEnd);
			//     this.el.addEventListener('otransitionend', onTransitionEnd);
			//     this.el.addEventListener('transitionend', onTransitionEnd);

		}

	}, {
		show: function(options){
			var me = this;
			if(options.message == '令牌错误' || options.message == 'CODE 出错提示' || options.message == 'CODE 出错' || options.message == 'ERR'){
				return
			}
			var n ;
			var fun = function(){
				n = new me(options);
				n.show(next);
			}
			q.push(fun)
			var next = function(){
				$(document).dequeue("myQueue")
			}
			$(document).queue("myQueue", q);
			if (q.length == 1) {
				if (flag == 0) {
					next();
				};
			};
			flag = 1;
			return ;
		}
	});
});