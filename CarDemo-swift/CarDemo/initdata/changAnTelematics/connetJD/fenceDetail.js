define(["common/navView","shared/js/notification"],function(e,t){var n=e;return n.extend({events:{},onViewPush:function(e,t){t&&(this._data=t.data)},onLeft:function(){this._flag?bfNaviController.pop():this.goBack()},onDeviceBack:function(){return this.onLeft(),!0},posGenHTML:function(){if(this._data){this.getElement("#fenceName").val(this._data.fenceName),this.getElement("#fenceLocation").val(),this.getElement("#telphone").val(this._data.notifyPhone);var e=this.getElement("#connectAddr");"company"==this._data.jdBind?e.find("option[value ='company']").attr("selected",!0):"home"==this._data.jdBind&&e.find("option[value ='home']").attr("selected",!0)}},onShow:function(){var e=this;this._flag=!1,this.getElement("#connectAddr").on("change",function(){var n=$(this)[0].selectedIndex,a=$(this).find("option").eq(n).attr("value");bfClient.notifyFence({data:{fenceId:e._data.fenceId,carId:e._data.carId,jdBind:a},success:function(n){e._flag=!0,0==n.code?t.show({type:"info",message:"修改围栏成功"}):t.show({type:"info",message:n.msg})},error:function(){t.show({type:"error",message:"网络开小差"})}})})}})});