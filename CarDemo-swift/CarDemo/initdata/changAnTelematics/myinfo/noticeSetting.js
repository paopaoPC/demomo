define(['common/navView',
    	'butterfly',
    	'shared/plugin_dialog/js/dialog'],
	function(View, butterfly, Dialog){
		var Base = View;
		return Base.extend({
			events:{
				"click .checkBox": "swich"
			},
			onShow: function(){
				this._wifiAPSwitch == 0
			},
			swich: function(el){
				var me=this;
				var target = $(el.currentTarget);
				var itemName = target.attr("data-itemname");
	            if (!target.hasClass("active")) {
	                this._wifiAPSwitch = 1;
	                target.addClass("active");
	                target.children(".check-icon").animate({left:"19px"},100)
	            }else{
	                this._wifiAPSwitch = 0;
	                if (itemName == "0") {
	                	var content = "关闭后，手机将不再接收亲情活动通知，<br>您依然可以在消息中心查到亲情活动详情。"
	                	this.showDialogCeng(target, content)
	                }else if (itemName == "1") {
	                	var content = "关闭后，手机将不再接收会员专属通知，<br>您依然可以在消息中心查到会员专属通知。"
	                	this.showDialogCeng(target, content)
	                };
	            }
			},
			showDialogCeng: function(target,content){
				Dialog.createDialog({
                    closeBtn: false,
                    buttons: {
                        '不再接收通知': function () {
                            target.removeClass("active");
	                		target.children(".check-icon").animate({left:"0"},100)
                            this.close();
                        }
                    },
                    content: content
                });
			}
		})
	})