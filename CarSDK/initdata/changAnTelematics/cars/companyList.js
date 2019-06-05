define([
        "common/navView",
	    "common/osUtil",
	    "shared/js/client",
	    'shared/js/notification',
        "listview/ListView",
        'shared/js/datasource'
	],
	function(View, osUtil,Client, Notification, ListView, DataSource){
		 var Base = View;
        return Base.extend({
        	id : "companyList",
        	events:{
        		"click .other-company": "otherCompany",
                 "click .content-list": "selectCompany"
        	},
            onViewPush: function(pushFrom, pushData)
            {
                this._data = pushData;
            },
        	posGenHTML: function(){
        	    var me = this;
        		bfClient.getInsuranceCompanies({
        			success: function(data){
                        if (data.data != null) {
                			me._datas = data.data.data;
                            me.showDatas();
                        }else{
                            Notification.show({
                                type:"error",
                                message: "获取数据失败"
                            })
                        }
        			}
        		});
        	},
            showDatas: function() {
                    var me = this;
                    var container = me.elementFragment(".company-name-list");
                    container.empty();
                    var tem = _.template(me.elementHTML("#sosCompanyList"));
                    for (var i = 0; i < me._datas.length; i++) {
                            var template = tem(me._datas[i]);
                            container.append(template);
                    };
                    container.setup();
            },
            selectCompany: function(el){
                    var me = this;
                    var $target = $(el.currentTarget);
                    var telphone = $target.attr("data-telphone");
                    var name = $target.attr("data-name");            
                    $target.css("background-color","#f1f1f1");
                    $target.children("img").css("display","block");
                    bfClient.updateCompany({
                        type:"post",
                        data:{'carId':me._data.carId, 'insuranceCompany':name, 'insurancePhone':telphone},
                        success: function(data){
                            if (data.code == 0) {
                                Notification.show({
                                    type:"well",
                                    message:"添加成功"
                                });
                                if(me._data.from == 'sos'){
                                    bfNaviController.pop(1);
                                    bfDataCenter.setInsuranceCompany(name,telphone);
                                }else if(me._data.from == 'carDetails'){
                                    if (me._data.isCurrent) {
                                        bfDataCenter.setInsuranceCompany(name,telphone);
                                    }
                                    bfNaviController.pop(1,{insuranceName:name, insurancePhone:telphone, from:'insurance'});
                                }
                            }else{
                                Notification.show({
                                    type:"error",
                                    message:data.msg
                                });
                            }
                        }
                    });
            },
        	otherCompany: function(){
        		bfNaviController.push("cars/otherInsuranceCompany.html", this._data);
        	}
        });
	});