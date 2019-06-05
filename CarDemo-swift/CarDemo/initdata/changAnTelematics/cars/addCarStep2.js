define([
		'text!cars/addCarStep2.html',
		"common/navView",
		'butterfly',
		"common/osUtil",
		"common/ssUtil",
		"shared/js/notification",
		"cars/odbStyleCfg",
		'shared/timePicker/js/date',
		"shared/slideInPlugin/slideInPlugin"
	],
	function(template, View,Butterfly,osUtil,ssUtil,Notification,Cfg,DatePicker,slideIn){
        var Base = View;
		var element;
		return Base.extend({
			events:{
				"click #regis_car":"validateCar",
				"click .editDiv":"chooseCarType"
			},
			onViewBack: function(backFrom, backData){
				var me = this;
				this._data = backData;
				if (this._data) {
					me.getElement(".insurance-name").text(this._data.insuranceName);
					me.getElement(".insurance-phone").text(this._data.insurancePhone);
				}
			},
			onShow:function(){
        		this.initDate();
        	},
        	onLeft : function(){
				bfNaviController.popTo(2)
			},
			onDeviceBack:function(){
				
				this.onLeft();

                return true;
			},
			onViewPush: function(pushFrom, pushData){
				this._carId = pushData.carId;
				this._carV=pushData.carV;
				this._from = pushData.from
			},
			posGenHTML: function() {
				//从配置文件读取ODB_tyle
				this.bindDatePicker();
				this._options = Cfg.find('obdStyle');
				if(this._options!=''){
					for(var i = 0;i<this._options.length;i++){
						this.getElement('#obd_style').append('<option value='+this._options[i].value+'>'+this._options[i].words+'</option>');
					}
				}
				//接收注册第一步传过来的数据，如果存在，读取删除
				var me = this;
				if(this._carId){
					bfClient.getCarInfoById({
						data:{'carId':this._carId},
						success:function(data){
							me._currentCar = data;
							me.viewRender();
						}
					});
				}
				this.getElement(".insurance-name").on("click", function(){
					bfNaviController.push("sos/companyList.html",{carId:me._carId, from:'carDetails'});
				});
				this.getElement("#vin").html(this._carV);
			},
			initDate:function(){
				var me = this;
				var currentDate = new Date();
				var year = currentDate.getFullYear();    
				var month = currentDate.getMonth()+1; 
				var day = currentDate.getDate();
				var nowStr = year+"-"+month+"-"+day;
				me.$el.find("#insurance").text(nowStr);
			},
			bindDatePicker: function() { //绑定日期控件
				var me = this;
				me.dp = DatePicker($);
				me.$el.find('#insurance-util-date').date({
					theme: "date"
				}, function(data) {
					data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
					me.$el.find("#insurance-util-date").find("#insurance").text(data);
					me.dp.time = data;
				}, function() {
					//取消的回调
				});

				me.$el.find('#last-time-check').date({
					theme: "date"
				}, function(data) {
					data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
					me.$el.find("#last-time-check").find("#year-check-time").text(data);
					me.dp.time = data;
				}, function() {
					//取消的回调
				});
			},
			viewRender:function(){
                var me= this;
                bfClient.getOilTypeList({
                    data:{},
                    success:function(data){
                        me.getElement('#oliType').html("");
                        for(var i =0;i<data.data.length;i++){
                            me.getElement('#oliType').append("<option>"+data.data[i]+"</option>");
                        }
                    }
                });
				//显示车昵称
				if(this._currentCar.data.carName!=''){
					this.getElement('#name').val(this._currentCar.data.carName);
				}
				//显示车架号
				if(this._currentCar.data.carId!=''){
					this.getElement('#vin').html(this._currentCar.data.vin);
				}
				//显示车型
				if(this._currentCar.data.seriesName!=''){
					this.getElement('#car_style').val(this._currentCar.data.seriesName);
				}
				//显示保险到期时间
				if(this._currentCar.data.insuranceEndDate!=''){
					this.getElement('#insurance').text(this._currentCar.data.insuranceEndDate == "0000-00-00" ? "" : this._currentCar.data.insuranceEndDate);
				}
				if(this._currentCar.data.lastCheckTime!=''){
					this.getElement('#year-check-time').text(this._currentCar.data.lastCheckTime == "0000-00-00" ? "" : this._currentCar.data.lastCheckTime);
				}
				//显示车牌号
				if(this._currentCar.data.plateNumber!=''){
					this.getElement('#car_number').val(this._currentCar.data.plateNumber);
				}
                //显示油价
                if(this._currentCar.data.oliType!='')
                {
                    this.getElement('#oliType').val(this._currentCar.data.oliType);
                }
				//显示ODB编号
				if(this._currentCar.data.odb_number!=''){
					this.getElement('#obdCode').val(this._currentCar.data.odb_number);
				}
			},
			validateCar: function(){
				var me = this;
				//对车辆信息的正则判断
				this._car = {};
				var _valid;
				var _valid_str;
				//对车辆昵称的非空判断
				_valid_str = this.getElement('#name').val();
				if(_valid_str!=''){
					this._car.name = _valid_str;
				}else{
					Notification.show({
						type:"error",
						message:"昵称不能为空"	
					});
					return;
				}
				var name = this.getElement('#name').val();
				var vin = this.getElement('#vin').html();
				var insuranceEndDate = this.getElement('#insurance').text();
				var plateNumber = this.getElement('#car_number').val();
				var checkTime = this.getElement('#year-check-time').text();
                var oilType = this.getElement("#oliType").find("option:selected").text();

				var carType = window.sessionStorage.carType;
				var carSeries = window.sessionStorage.carSeries;
				var seriesName,seriesId,modelName,modelId;
				this._today = new Date().format("yyyy-MM-dd");
				if (checkTime > this._today) {
                    Notification.show({
                        type:"error",
                        message:"上次年检时间应该小于当前时间"
                    });
                    return ;
                };
                var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Za-z]{1}[A-Za-z]{1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳]{1}$/;
				if (plateNumber && !express.test(plateNumber)) {
					Notification.show({
						type:"error",
						message:"请输入正确的车牌号"
					});
					return;
				};
				if(carSeries){
					carSeries = eval("("+carSeries+")");
					seriesName = carSeries.seriesName;
					seriesId = carSeries.seriesId;
				}
				window.sessionStorage.removeItem("carSeries");
				if(carType){
					carType = eval("("+carType+")");
					modelName = carType.modelName;
					modelId = carType.modelId;
				}
				window.sessionStorage.removeItem("carType");
				var Postdata = {
					'vin':vin,
					'oilType':oilType,
					'carName':name,
					'insuranceEndDate':insuranceEndDate,
					'plateNumber':plateNumber,
					'lastCheckTime':checkTime,
					'carId':this._carId,
					'seriesName':seriesName,
					'seriesId':seriesId,
					'modelName':modelName,
					'modelId':modelId
				};
				bfClient.updateCarInfo({
					type : 'post',
					data : Postdata,
					success : function(data){
						if(data.code == '3'){
							Notification.show({
								type: "error",
								message: "该车架号已注册！"
							});
						}else if(data.code == '2'){
							Notification.show({
								type:"error",
								message:"该车架号未激活，请等待激活！"	
							});
						}else if(data.code =='0'){
							Notification.show({
								type:"info",
								message:"注册成功~~"	
							});
							if (me._from == "addCar") {
								bfNaviController.pop(2);
							}else if(me._from == "equipmentBinding"){
								bfAPP.trigger("IM_EVENT_CAR_CHANGED");
								bfNaviController.pop(3);
							}
							
						}
					}
				});
			},
			chooseCarType:function(el){
				var self = this;
				var temp = self.elementHTML("#carItem");
				var template = _.template(temp);
				element = el.currentTarget;
				bfClient.getBrands({
					data:{},
					success:function(req){
						if(!req.success){
							Notification.show({
								type:"error",
								message:req.msg
							});
							return ;
						}
						slideIn.createSlide({
							data:req.data,
							template:template,
							title:"选择品牌",
							level: 1,
							hasTitle: false,
							ItemClick: function (el) {
								var item = el.target;
								var text = item.innerText;
								var id = $(item).attr("data-value");
								if (!id) {
									var parent = $(item).parent(".carItem");
									id = $(parent).attr("data-value");
								}
								self.getCarSeries(id,text);
							}
						});
					},
					error:function(){
						Notification.show({
							type:"error",
							message:"拉取品牌数据失败"
						});
					}
				});
			},
			getCarSeries: function (id,Name) {
				var self = this;
				var temp = self.elementHTML("#carItem");
				var template = _.template(temp);
				if (id) {
					bfClient.getCarType({
						data: {
							parentId: id
						},
						success: function (req) {
							if (!req.success) {
								var data = {seriesName: Name, seriesId: id};
								window.sessionStorage["carSeries"] = JSON.stringify(data);
								$(element).html(Name);
								return;
							}
							slideIn.createSlide({
								data: req.data,
								template: template,
								title: "选择车系",
								level: 2,
								hasTitle: false,
								ItemClick: function (el) {
									var item = el.target;
									var text = item.innerText;
									var id = $(item).attr("data-value");
									if (!id) {
										item = $(item).parent(".carItem");
										id = $(item).attr("data-value");
									}
									var data = {seriesName: text, seriesId: id};
									window.sessionStorage["carSeries"] = JSON.stringify(data);
									self.getCarType(id);
								}
							});
						},
						error: function (error) {
							Notification.show({
								type: "error",
								message: "拉取车系数据失败"
							});
						}
					});
				}
			},
			getCarType:function(id){
				var self = this;
				var temp = self.elementHTML("#carItem");
				var template = _.template(temp);
				if(id){
					bfClient.getCarType({
						data:{
							parentId:id
						},
						success:function(req){
							if(!req.success){
								var data = {};
								var carSeries = window.sessionStorage.carSeries;
								if(carSeries){
									carSeries = eval("("+carSeries+")");
									$(element).html(carSeries.seriesName);
								}
								return ;
							}
							slideIn.createSlide({
								data:req.data,
								template:template,
								title:"选择车型",
								level: 2,
								hasTitle: false,
								ItemClick:function(el){
									var item = el.target;
									var text = item.innerText;
									var id = $(item).attr("data-value");
									if(!id){
										item = $(item).parent(".carItem");
										id = $(item).attr("data-value");
									}
									var data = {modelName:text,modelId:id};
									window.sessionStorage["carType"] = JSON.stringify(data);
									var carSeries = window.sessionStorage.carSeries;
									if(carSeries){
										carSeries = eval("("+carSeries+")");
										$(element).html(carSeries.seriesName);
									}
								}
							});
						},
						error:function(error){
							Notification.show({
								type:"error",
								message:"拉取车型数据失败"
							});
						}
					});
				}
			}
		}); 

	});