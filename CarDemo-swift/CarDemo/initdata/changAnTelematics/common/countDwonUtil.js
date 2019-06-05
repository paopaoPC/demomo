define(
	function(){
		return {
			countDwon: function(clickedNodeBtn, time){
				var me = this;
				me._changeTime = setInterval(function(){
					clickedNodeBtn.css("background","silver");
					clickedNodeBtn.attr("disabled",true);
					clickedNodeBtn.text((time--)+"s");
					if (time == -1) {
						clearInterval(me._changeTime);
						clickedNodeBtn.css("background","#00c3fe");
						clickedNodeBtn.text("重新发送");
						clickedNodeBtn.attr("disabled",false);
					};
				},1000);
			},
			stopCountDown: function(clickedNodeBtn){
				var me = this;
				clearInterval(this._changeTime);
				clickedNodeBtn.css("background","#00c3fe");
				clickedNodeBtn.text("发送验证码");
				clickedNodeBtn.attr("disabled",false)
			}
		}
	}
)