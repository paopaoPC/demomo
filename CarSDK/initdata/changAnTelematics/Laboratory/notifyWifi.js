define([
		'text!cars/recarid.html',
		"common/navView",
		'butterfly',
		"common/osUtil",
		"common/ssUtil",
		"shared/js/notification"
	],
	function(template, View,Butterfly,osUtil,ssUtil,Notification){
        var Base = View;
		return Base.extend({
			events:{
				"click .submitName":"submit"
			},
			onViewPush:function(pushFrom, pushData){
				if (pushData) {
					this._type = pushData.type
					this._data = pushData.data
				};
			},
			posGenHTML: function() {
				if (this._data == "请设置SSID" || this._data =="请设置安全密码") {
					this.getElement("#rename_name").attr("placeholder",this._data);
				}else{
					this.getElement("#rename_name").val(this._data)
				}
			},
			onShow:function(){
				this.getElement("#rename_name")[0].focus();
				if (this._type == "password") {
					this.getElement(".note").show()
				};
			},
			submit:function(){
				var data = this.getElement("#rename_name").val();
				if (this._type == "password") {
					if (data.length < 8) {
						Notification.show({
							type:"info",
							message:"密码长度小于8"
						});
						return ;
					};
				}else{
					if (!data) {
						Notification.show({
							type:"error",
							message:"请输入SSID"
						})
						return ;
					};
				}
				bfNaviController.pop(1,{type:this._type, data: data})
			}
		}); 
	});