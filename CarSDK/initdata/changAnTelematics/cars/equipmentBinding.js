define([
		"text!cars/equipmentBinding.html", 
        "common/navView",
        'butterfly',
        "shared/js/notification",
        "underscore"
	],function(template, View, Butterfly,Notification,_){

		var Base = View;
        var cls =
                {
                    events: {
                        "click #confirm_to_add":"confirmToAdd"
                    }
                };
        cls.onShow = function(){};
        cls.posGenHTML = function(){
        	// UI
            var sel = this.getElement('#odb_factory_select');
            bfClient.getDeviceTypeList({
                type : "get",
                dataType : "json",
                success : function(data){
                    var template = _.template("<option value='<%=id%>'><%=name%></option>");
                    for (var i = 0; i<data.data.length; ++i) 
                    {
                        sel.append(template({id:data.data[i].itemId, name:data.data[i].nodeName}));
                    }
                }
            });
            
        };

        cls.onViewPush = function(pushFrom, pushData)
        {
            this._data = pushData;
        }
        cls.onLeft = function(){
            if (this._data.routeFrom == "fromAddCar") {
                bfNaviController.pop(2);
            }else{
                bfNaviController.pop(1);
            }
            bfAPP.trigger("IM_EVENT_CAR_CHANGED");
        }
        cls.confirmToAdd = function(){
            var me = this;
            var typeId = me.getElement("#odb_factory_select").val();
            var deviceNumber = me.getElement("#odb_number").val();
            var odb_password = me.getElement("#odb_password").val();
            if (deviceNumber && odb_password) {
                bfClient.addDevice({
                    type:"post",
                    data:{'carId':this._data.carId,'deviceNumber':deviceNumber,'typeId':typeId,'authCode':odb_password},
                    success: function(data){
                        if (data.code == '0') {
                            Notification.show({
                                type:"info",
                                message:"添加成功"   
                            });
                            if (me._data.routeFrom == 'fromAddCar') {
                                bfNaviController.push('/cars/addCarStep2.html',{carId:me._data.carId,carV:me._data.carV,from:"equipmentBinding"} );
                            }else{
                                bfNaviController.popTo("main/index",'backToHome');
                            }
                        }else{
                            Notification.show({
                                type:'error',
                                message:data.msg
                            });
                        }
                    }
                });
            }else if (!deviceNumber) {
                Notification.show({
                    type:"error",
                    message:"请输入OBD编号"
                });
                return ;
            }else if (!odb_password) {
                Notification.show({
                    type:"error",
                    message:"请输入OBD激活码"
                });
                return ;
            }
        };
        return Base.extend(cls);
});