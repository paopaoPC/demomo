define(['common/imView', "common/control-cmd"],
	function(View, controlCmd){
		var Base = View;
		return Base.extend({
			events:{
				"click .items": "selectControlItem",
				"click .cancle": function(){this.onLeft()},
				"click .sure": "controlStart"
			},
			onShow: function(){
				this._currentControl = 1; // 1表示闪灯   2表示闪灯鸣笛
			},
			selectControlItem: function(el){
				var tar = $(el.currentTarget);
				var type = tar.attr("data-name");
				tar.siblings(".items").removeClass("active");
				tar.addClass("active");
				if (type == "changeLight") {
					this._currentControl = 1
				}else{
					this._currentControl = 2
				}
			},
			onLeft: function(){
				bfNaviController.pop(1)
			},
			controlStart: function(){
				var me = this;
				//这里写控制逻辑
				controlCmd.ControlWhistle(this._currentControl);
			}
		})
	})