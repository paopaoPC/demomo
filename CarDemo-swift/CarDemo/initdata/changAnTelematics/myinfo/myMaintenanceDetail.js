define([
		'text!myinfo/myMaintenanceDetail.html',
		"common/navView",
		'butterfly',
		"common/osUtil",
		"common/ssUtil",
		"shared/js/notification",
		'shared/timePicker/js/date',
		"shared/plugin_dialog/js/dialog"
	],
	function(template, View,Butterfly,osUtil,ssUtil,Notification,DatePicker,Alert)
	{
        var Base = View;
        var cls  = 
        {
        	events:{
				"click #regis_car":"validateCar",
				"click #delete":"deleteMaintain"
			}
		};

		cls.genHTML = function()
		{
			Base.prototype.genHTML.call(this);

		};
		cls.onViewPush=function(pushFrom, pushData){
				this._cardata=pushData;
				this._currentCarId=pushData.carId;
				this._maintenanceId = pushData.maintanceId;
		};
		cls.onShow = function()
		{
			this._type = "edit";
			this.updateMaintenanceDetail();
		};
		cls.bindDatePicker = function(){
			var me = this;
            me.dp = DatePicker($);
            var datePic = this.getElement('#maintan_date');
            me.dp.time = datePic.text();
            datePic.date({
                theme: "date"
            }, function (data) {
                data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
                datePic.text(data);
                me.dp.time = data;
            }, function () {
                //取消的回调
            });
		};
		cls.deleteMaintain=function(){   //删除维保信息  lxc
			var me=this;
			me._dialog = Alert.createDialog({
                closeBtn: false,
                buttons:{
                    '取消': function(){
                        this.close()
                    },
                    '确定': function(){
                        var data={maintenanceId:me._maintenanceId};
						bfClient.deleteMaintain(data,function(req){
							if(req.code==0){
								Notification.show({
									type: 'info',
									message: req.msg
								});
								bfNaviController.pop(1, {hasSubmitData: "true"});
							}else if(req.code==3){
								Notification.show({
									type: 'info',
									message: req.msg
								});
							}
						});
						this.close();
                    }
                },
                content: "是否删除该维保信息"
            });
			
		};
		cls.onRight = function(){
			var me = this;
			if (this._type == "edit") {
				this._type = "complet";
				this.setRightText("完成");
				this.bindDatePicker();
				me.getElement(".main-input").attr("disabled", false);
			}else{
				this.updataInfor();
			}
		};
		cls.updataInfor = function(){
			var me = this;
			var date = this.getElement('#maintan_date').text();
			var officialShop = this.getElement('#shop_name').val();
			var maintainCost = this.getElement('#fee').val();
			var maintainMiles = this.getElement('#far_away').val();
			var maintainContent = this.getElement('#maintain_content').val();


			var reg=/^[0-9]+([.]{1}[0-9]+){0,1}$/; 
			if(maintainCost.trim()==""){
				Notification.show({
						type: "error",
						message: "请填写维保金额！"
					});
			}else if(reg.test(maintainCost)==false){//余额不是数字
				Notification.show({
						type: "error",
						message: "维保金额请填写数字！"
					});
			}else if(maintainCost.length >8){
				Notification.show({
					type:"error",
					message:"维保金额不能大于8位数"
				})
			}else if(maintainMiles.trim()==""){//余额不是数字
				Notification.show({
						type: "error",
						message: "请填写维保里程！"
					});
			}else if(reg.test(maintainMiles)==false){//公里数不是数字
				Notification.show({
						type: "error",
						message: "维保里程请填写数字"
					});
			}else if(maintainMiles.length > 9){
				Notification.show({
					type:"error",
					message:"维保里程不能大于9位数"
				})
			}else if(officialShop.trim()==""){// 4s店不能为空
				Notification.show({
					type: "error",
					message: "请填写4S店店名"
				});
			}else if(maintainContent==''){
                Notification.show({
					type: "error",
					message: "请填写维保内容"
				});
				}else{
				var totalMile = ssUtil.load("totalMile");
				if (maintainMiles > parseInt(totalMile)){
					Notification.show({
						type:"error",
						message:"维保里程不能大于总里程"
					});
					return ;
				};
				var data= {carId:this._currentCarId,maintenanceId:this._maintenanceId,mileage:maintainMiles,maintenanceTime:date,dealerName:officialShop,notes:maintainContent,price:maintainCost};
				bfClient.updateMaintain(data,function(req){
					if(req.code==0){

						me._type = "edit";
						me.setRightText("编辑");
						me.getElement(".main-input").attr("disabled", true);
						Notification.show({
							type: "info",
							message: "更新成功"
						});
						bfNaviController.pop(1, {hasSubmitData: "true"});
					}
				})
			}
		};
        cls.updateMaintenanceDetail = function()
        {
        	var self = this;
        	var currentDetail = ssUtil.load("CURRENT_MAINTAIN_DETAIL");
        	var carData = bfDataCenter.getCarData();
        	var currentCarName = carData.carName;

        	this.getElement('#car_name').val(currentCarName);
        	this.getElement('#shop_name').val(currentDetail.dealerName);
        	this.getElement('#maintan_date').text(currentDetail.maintenanceTime);
        	this.getElement('#far_away').val(currentDetail.mileage);
        	this.getElement('#fee').val(currentDetail.price);
        	//去掉str前面多余空格
        	String.prototype.trim=function() {
			    return this.replace(/(^\s*)|(\s*$)/g,'');
			}
			if (currentDetail.notes) {
				this.getElement('#maintain_content').val(currentDetail.notes.trim());
			}else{
				this.getElement('#maintain_content').val("");
			}
        }
		return Base.extend(cls); 
	});
