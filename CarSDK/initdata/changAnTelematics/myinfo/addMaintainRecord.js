define([
		'text!myinfo/addMaintainRecord.html',
		"common/navView",
		'butterfly',
		"common/osUtil",
		"common/ssUtil",
		"shared/js/notification",
		"underscore",
		'shared/timePicker/js/date',
		"common/disUtil",
		'shared/js/input-bind-offset'
	],
	function(template, View,Butterfly,osUtil,ssUtil,Notification,_,DatePicker,disUtil,InputBindOffset){
        var Base = View;
		var cls = {
			id:"maintainHistory",
			events:{
				"click #navRight":"submitData"
			}
		};

		cls.submitData = function(){
			//提交数据		
            this.addCurrentMaintainRecord();
		};
		var carListIndex = 0;

		cls.onShow = function(){
			InputBindOffset.bind({
               scrollEl: this.$(".content")
            });
		}
		cls.onViewPush=function(pushFrom, pushData){
				this._cardata=pushData;
				this._currentCarId=pushData.carId;
		};
		//onshow事件，初始化element
        cls.posGenHTML = function (){
        	var me = this;
        	me.dp = DatePicker($);
        	var areaId = this.getElement("#maintainContent");
        	var numId = this.getElement("#maintainContent_num");
        	disUtil.textAreaInit(areaId,numId,200);
			//初始化时间
			Date.prototype.format = function(fmt)   
				{ //author: meizz   
				  var o = {   
				    "M+" : this.getMonth()+1,                 //月份   
				    "d+" : this.getDate(),                    //日   
				    "h+" : this.getHours(),                   //小时   
				    "m+" : this.getMinutes(),                 //分   
				    "s+" : this.getSeconds(),                 //秒   
				    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
				    "S"  : this.getMilliseconds()             //毫秒   
				  };   
				  if(/(y+)/.test(fmt))   
				    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
				  for(var k in o)   
				    if(new RegExp("("+ k +")").test(fmt))   
				  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
				  return fmt;   
				}  
				this._today = new Date().format("yyyy-MM-dd"); 
				me.$el.find("#date").html(this._today);
				me.dp.time = this._today;
				//日期控件
				me.$el.find('#date').date({
						theme: "date"
					}, function(data) {
						data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
						if (data > me._today) {
							Notification.show({
								type:"error",
								message:"维保时间不能大于当前时间"
							})
						}else{
							me.$el.find('#date').html(data);
							me.dp.time = data;
						}
						
					}, function() {//取消的回调
				});

			//车辆列表
            this._carList = bfDataCenter.getCarList();
            if(!this._carList || this._carList.length === 0)
            {
                return ;
            }

            // UI
            var sel = this.getElement('#carSelect');
            var carList = this._carList;
            
            for (var i = 0; i<carList.length; ++i) 
            {
                if (carList[i].carId == this._currentCarId) {
     				me.getElement("#carName").text(carList[i].carName);
            	}
            }  
            var self = this;
			this.getElement('#maintainContent').focus(function(){//获得焦点时清空placeholder
				 self.getElement('#maintainContent').attr('placeholder','');
			});
			this.getElement("#maintainContent").blur(function(){
				self.getElement('#maintainContent').attr('placeholder','输入你的维保内容');
			});
			if(self._cardata.from=='update'){    //用户进入为更新信息执行
				var data={carId:self._currentCarId,token:window.localStorage.getItem("token"),pageIndex:0,pageSize:1000};
				var currentMaintenance;
				$.ajax({
					url:bfConfig.server+bfClient.MAINTAIN_HISTORY_URL,
					data:data,
					type:"POST",
					dataType:'json',
					success:function(req){
						var maintenanceData=req.data.data;
						if(req.code==0){
							for(var i=0;i<maintenanceData.length;i++){
								if(maintenanceData[i].maintenanceId==self._cardata.maintanceId){
									currentMaintenance=maintenanceData[i];
								}
							}
							var newday = new Date().format(currentMaintenance.maintenanceTime);
							self.$el.find("#date").html(newday);
							self.dp.time = newday;
							self.getElement('#officialShop').val(currentMaintenance.dealerName); //4s店
							self.getElement('#maintainCost').val(currentMaintenance.price);  //花费
							self.getElement('#maintainMile').val(currentMaintenance.mileage); //里程
							// alert(currentMaintenance.notes);
							self.getElement('#maintainContent').val(currentMaintenance.notes);  //内容
						}
					},
					error:function(req){

					}
				})
			}
        };
        
		cls.addCurrentMaintainRecord = function()
        {
        	var me = this;
			var date = this.getElement('#date').text();
			var officialShop = this.getElement('#officialShop').val();
			var maintainCost = this.getElement('#maintainCost').val();
			this._maintainMiles = this.getElement('#maintainMile').val();
			var maintainContent = this.getElement('#maintainContent').val();
			// alert(maintainContent+'xxxxxxxx')
        	var self = this;
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
			}else if(this._maintainMiles.trim()==""){//余额不是数字
				Notification.show({
						type: "error",
						message: "请填写维保里程！"
					});
			}else if(reg.test(this._maintainMiles)==false){//公里数不是数字
				Notification.show({
						type: "error",
						message: "维保里程请填写数字"
					});
			}else if(this._maintainMiles.length > 9){
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

				if(self._cardata.from=='update'){
					var data= {carId:self._cardata.carId,maintenanceId:self._cardata.maintanceId,mileage:maintainMiles,maintenanceTime:date,dealerName:officialShop,notes:maintainContent,price:maintainCost};
					bfClient.updateMaintain(data,function(req){
						if(req.code==0){
							Notification.show({
								type: "info",
								message: "更新成功"
							});
							bfNaviController.pop(1, {hasSubmitData: "true"});
						}
					})
				}else{
					var totalMile = ssUtil.load("totalMile");
					if (me._maintainMiles > parseInt(totalMile)){
						Notification.show({
							type:"error",
							message:"维保里程不能大于总里程"
						});
						return ;
					};
					bfClient.addCurrentMaintainRecordRequest({
						carId:self._currentCarId,
						maintenanceTime:date,
						mileage:me._maintainMiles,
						notes:maintainContent,
						dealerName:officialShop,
						price:maintainCost
					}, function(data){self._onMaintenanceDetail(data, me._maintainMiles)});
				}
			}
        };
        cls._onMaintenanceDetail = function(data, maintainMiles)
        {
        	var self = this;
        	if(data.success)
        	{
        		Notification.show({
						type: "info",
						message: "提交成功"
				});
				bfClient.setMaintainMileageRemaind(
                    {
                        carId:self._currentCarId,
                        lastMaintainMileage: maintainMiles
                    },
                    function(data){
                });
                ssUtil.save("lastMile", maintainMiles);
        		bfNaviController.pop(1, {hasSubmitData: true});
        	}
        }
		return Base.extend(cls);
	});
