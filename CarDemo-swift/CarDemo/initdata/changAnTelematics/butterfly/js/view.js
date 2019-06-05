define(['backbone','butterfly/view-animate'], function(Backbone,animationExtentions){

	// Butterfly View
	// ==============

	var View =  Backbone.View.extend({
		//default event
		goBack: function()
		{
			window.history.go(-1);
		},

		//add superview & subviews property
		constructor: function(options)
		{
			if(options)this.superview = options.superview;
			this.subviews = [];
			this._isShow  = false;

			Backbone.View.apply(this, arguments);
		},

		//remove superview & subviews reference
		remove: function(){
			Backbone.View.prototype.remove.call(this);

			this.superview = null;
			_.each(this.subviews, function(subview){
				subview.remove();
			});
		},

		//find a subview
		//Breadth First Search
		find: function(id){
			var result = _.find(this.subviews, function(subview){
				return subview.el.id == id;
			});

			if (!result) {
				var container = _.find(this.subviews, function(subview){
					return subview.find(id);
				});
				result = container.find(id);
			}

			return result;
		},

		addSubview: function(view){
			this.subviews.push(view);
		},

		viewOpen :function(pageName){
            console.log("进入当前页："+pageName);
            if(typeof MobclickAgent != "undefined"){
                MobclickAgent.onPageBegin(pageName)
            }
        },
        viewClose : function(pageName){
            console.log("退出当前页："+pageName);
            if(typeof MobclickAgent != "undefined"){
                MobclickAgent.onPageEnd(pageName)
            }
        },

		/* show this view */
		show: function(options)
		{
			if(this.isShow())
			{
				return ;
			}
			this._pageName = this.el.baseURI.split("#")[1];
			this.viewOpen(this._pageName);
			var self = this;
			this._isShow = true;
			$(this.el).css("display", "block");
			this.renderHtmlFromHttp($(this.el));
			this.hideElement();
			this.onShow(options);
		},
		renderHtmlFromHttp: function ($ment) {
			var me = this;
			var CarConfig =bfDataCenter.getCarFuncConfig();
			var PageName = $ment.attr("data-view") ? $ment.attr("data-view"): $ment.children().attr("data-view");
			var PageConfig = CarConfig ? CarConfig[PageName]:null;
			//PageConfig = {".door":0,".air":0};
			if(PageConfig){
				for(var key in PageConfig){
					var displayNum = PageConfig[key] ?"block":"none";
					$ment.find(key).css("display",displayNum);
				}
			}
		},
		/* hide this view */
		hide: function()
		{
			if(!this.isShow())
			{
				return ;
			}
			
			this._isShow = false;
			$(this.el).css("display", "none");
			this.viewClose(this._pageName);
			this._pageName = null;
			this.onHide();
		},
		isShow : function()
		{
			return this._isShow;
		},
		hideElement:function () {

		},
		//events
		onShow: function(){
			$(window).on('orientationchange', this.onOrientationchange);
			$(window).on('resize', this.onWindowResize);
			$(window).on('scroll', this.onWindowScroll);
		},
		onHide: function(){
			$(window).off('orientationchange', this.onOrientationchange);
			$(window).off('resize', this.onWindowResize);
			$(window).off('scroll', this.onWindowScroll);
		},
		onOrientationchange: function() {
			this.$('input').blur();
		},

		onWindowScroll: function() {},

		onWindowResize: function() {},
		route: function(){}
	});
    //add to View prototype
	_.extend(View.prototype, animationExtentions);
	return View;
});
