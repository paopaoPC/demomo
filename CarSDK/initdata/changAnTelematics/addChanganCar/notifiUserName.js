define([
		"common/navView",
		'butterfly',
		"shared/js/notification"
	],
	function(View,Butterfly,Notification){
        var Base = View;
		return Base.extend({
			events:{
				"click .submitName":"submitData"
			},
			onViewPush:function(pushFrom, pushData){
				if (pushData) {
					this._data = pushData.data
				};
			},
			posGenHTML: function() {
			},
			onShow:function(){
				this.getElement("#rename_name").val(this._data)
			},
			submitData: function(){
				var data = this.getElement("#rename_name").val();
				bfNaviController.pop(1,{data:data})
			}
		}); 
	});