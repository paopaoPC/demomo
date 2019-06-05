define([
    'common/navView',
    'text!drivingReport/index.html',
    'butterfly',
    'iscroll',
    'shared/js/notification',
    'moment',
    "underscore"
],
       function(View, viewTemplate, Butterfly, IScroll, Notification, moment, _) {
	   var Base = View;
	   var START_YEAR = 2016;
	   var START_DAY = '2016-01-01';
	   //更新机制 暂时v1
	   var VERSION = 'v11';
	   return Base.extend({
	       id: "selectCalendar",
	       html: viewTemplate,
	       events: {
	       		'click .dataTableTd': 'selectMouth'
	       },
	       onViewPush: function(pushFrom, pushData){
	       		var me = this;
	       		me._selectYear = parseInt(pushData);
	       },
	       //只有在2016年后，才能生成模板
	       posGenHTML: function(){
	       		var me = this;
	       		me.initTempView();
			    //页面添加模板
	       		me.tempInnerHTML(me._htmlTemp);
	       		//模板上面加数据
	       		me.htmlTempBindData(me._htmlTemp);
	       },
	       selectMouth: function(event){
	       		var idStr = $(event.currentTarget).attr('id');
	       		bfNaviController.pop(1, idStr);
	       },
	       onShow: function() {
			    
	       },
	       initTempView: function(){
	       		var me = this;
	       		me._currentYear = moment().year();
	       		if(me._currentYear >= START_YEAR){
	       			me._htmlTemp = me.generateHtml(me._currentYear);
	       			//设置当天 为active
	       			var todayStr = '#d' + moment().format('YYYYMMDD');
       				$('.today', me._htmlTemp).removeClass('today');
	       			$(todayStr, me._htmlTemp).addClass('today');
	       		}
	       },
	       htmlTempBindData: function(_htmlTemp){
	       		var me = this;
	       		me.getAjaxData(_htmlTemp);
	        },
	        initScroll: function() {
				var me = this;
				var iscrollY = me._selectYear - START_YEAR;
				if(iscrollY>0){
					//yearContent  有个margin-bottom = 25
					iscrollY = (me.$('.yearContent:first-child').height() + 25) * iscrollY;
				} else {
					iscrollY = 0
				}
				if (!me.myscroll) {
					me.myscroll = new IScroll(this.$('#wrapper')[0], {
						mouseWheel: true,
						startY: - iscrollY
					});
				} else {
					me.myscroll.refresh();
				}
			},
	        tempInnerHTML: function(_htmlTemp){
	       		this.elementHTML('#scroller',_htmlTemp);
	        },
	        updataHtml: function(_htmlTemp,calendarData){
	        	var me = this;
	      
	       		me.updataActived(_htmlTemp,calendarData);
	    		me.updataPrice(_htmlTemp,calendarData);

	    		var yearContent = $('.yearContent',_htmlTemp);
	    		_.each(yearContent, function(item){
	    			var year = item.id.replace('y','');
	    			me.setLocalCalendarYearHTML(year,item);
	    		});
	       		me.tempInnerHTML(_htmlTemp);
	        },
	        //数组遍历
	       	updataActived: function(_htmlTemp,calendarData){
	        	var reg = new RegExp('-','g');
	    		//后台给排序好的，前端不排序,不需要_.groupBy()
				_.each(calendarData, function(value){
					if(value.mileage != 0){
						//value.createTime && value.createTime.replace(reg,'') 防止后台给的数据没有createTime的属性
	       				$('#d'+ (value.createTime && value.createTime.replace(reg,'')), _htmlTemp).addClass('actived');
					}
				});
				
	    	},
	    	//对象遍历
	    	updataPrice: function(_htmlTemp,calendarData){
	    		var reg = new RegExp('-','g');
	       		data = _.groupBy(calendarData, function(item){ return item.createTime.substring(0, 7); });
	    		_.each(data, function(value, key){
	    			var mouthPrice = 0;
	    			_.each(value, function(item){
	    				// 需求变动 tbox 显示里程  其他显示费用
	       				// if(bfDataCenter.getCarDevice() === 'tbox' ){
	    					mouthPrice = mouthPrice + ( parseFloat(item.mileage) || 0);
	       		// 		} else {
	    					// mouthPrice = mouthPrice + ( parseFloat(item.fee) || 0);
	       		// 		}
	    			});
	    			// 需求变动 tbox 显示里程  其他显示费用
	       			// 0 的时候不显示
	       			if(mouthPrice != 0){
		       			// if(bfDataCenter.getCarDevice() === 'tbox' ){
		      				$('#m'+key.replace(reg,''), _htmlTemp).html( mouthPrice.toFixed(1) +'km');
		       			// } else {
		      				// $('#m'+key.replace(reg,''), _htmlTemp).html('￥'+ mouthPrice.toFixed(1) +'元');
		       			// }
	       			}
	    		});
	    	},
	    	getSendDate: function(){
	    		var me = this;
	    		var localDate = me.getLocalDate();
	    		var data;
	    		var diffNumber;
	    		//diffNumber 大于0  表示，存储的时间范围大于今天，数据异常
	    		if(localDate && localDate.endDate){
	    			diffNumber = moment(localDate.endDate).diff(moment().format('YYYY-MM-DD'),'d');
	    		} else {
	    			diffNumber = 0;
	    		}
	    		if(diffNumber > 0){
	    			me.reSetSendDate();
	    			localDate = undefined;
	    		}
	    		if(localDate){
    				data = {
	    				startDate: moment(localDate.endDate,'YYYY-MM-DD').format('YYYY-MM') + '-01',
				   		endDate: moment().format('YYYY-MM-DD')
	    			}
	    		} else {
	    			data = {
				   		startDate: START_DAY,
				   		endDate: moment().format('YYYY-MM-DD')
		    		}
	    		}
	    		return data;
	    	},
	    	//当发现本地存储数据异常时，收到删除他
	    	reSetSendDate: function(){
	    		var localStr = 'calendarData' + bfDataCenter.getCarId() + bfDataCenter.getCarDevice() + VERSION;
	    		window.localStorage.removeItem(localStr);
	    	},
	    	setLocalDate: function(sendData){
	    		var me = this;
	    		var localData = me.getLocalDate();
	    		if(localData){
	    			sendData.startDate = localData.startDate;
	    		} 
	    		sendData.endDate = moment(sendData.endDate).format('YYYY-MM-DD');
	    		var localStr = 'calendarData' + bfDataCenter.getCarId() + bfDataCenter.getCarDevice() + VERSION;
	    		window.localStorage[localStr] = JSON.stringify(sendData);
	    	},
	    	getLocalDate: function(){
	    		var localStr = 'calendarData' + bfDataCenter.getCarId() + bfDataCenter.getCarDevice() + VERSION;
	    		return window.localStorage[localStr] && JSON.parse(window.localStorage[localStr]);
	    	},
	       //修改变量dom
	       getAjaxData: function(_htmlTemp){
	       	var me = this;
	       	var sendData = me.getSendDate();
	       	me._sendData = _.clone(sendData,true);
	       	bfClient.historyTrackFromDayTableByDate({
	       			data: sendData,
			        dataType: "json",
			       success: function(data) {
					   if (data.code == 0) {
					   		me.setLocalDate(me._sendData);
					   		me.updataHtml(_htmlTemp,data.data);
	       					me.initScroll();
						} else {
	       					me.initScroll();
	       					me.tempInnerHTML(_htmlTemp);
						}
				    },
					error:function(){
				   		Notification.show({
						   type: "error",
						   message: "沒有数据"
					    });
	       				me.initScroll();
	       				me.tempInnerHTML(_htmlTemp);
					}
				});
	    	},
	       //生成html模板
	       generateHtml: function(currentYear){
	       		var me = this;
	       		var new_contentBody = document.createElement('div');
	       		new_contentBody.className = 'contentBody';
	       		for(var i=START_YEAR; i<=currentYear; i++){
	       			var new_yearContent = me.getYearTemple(i);
	       			new_contentBody.appendChild(new_yearContent);
	       		}
	       		return new_contentBody;
	       },
	       //判断是缓存还是自己生成模板； 版本v1 控制更新
	       getYearTemple: function(year){
	       		var me = this;
	       		var localStr = '_Calendar'+year+bfDataCenter.getCarId()+ bfDataCenter.getCarDevice() + VERSION;
	       		if(window.localStorage[localStr]){
	       			return me.str2Dom(window.localStorage[localStr]);
	       		} else {
	       			return me.generateYearTemple(year);
	       		}
	       },
	       //字符串转dom变量
	       str2Dom: function(str){
	       		var objEl = document.createElement("div");
　　 			objEl.innerHTML = str;
			　　 return objEl.childNodes[0];
	       },
	       setLocalCalendarYearHTML: function(year, data){
	       		var me = this;
	       		if(!data){
	       			return;
	       		}
	       		var localStr = '_Calendar'+year+ bfDataCenter.getCarId()+ bfDataCenter.getCarDevice() + VERSION;
	       		window.localStorage[localStr] = data.outerHTML;
	       },
	       //生成1年的模板
	       generateYearTemple: function(year){
	       		var me = this;
	       		var new_yearContent = document.createElement("div");
	       		new_yearContent.id = 'y'+year;
	       		new_yearContent.className = 'yearContent';
	       		var new_yearContentHead = document.createElement("div");
	       		new_yearContentHead.className = 'yearContentHead';
	       		new_yearContentHead.innerHTML = year + '年';


	       		var new_yearContentBody = me.generateMouthTemple(year);

	       		new_yearContent.appendChild(new_yearContentHead);
	       		new_yearContent.appendChild(new_yearContentBody);

	       		return new_yearContent;
	       		
	       },
	       //生成12个月的模板
	       generateMouthTemple: function(year){
	       		var me = this;
	       		var _dataTitleClass;
	       		//直接量赋值的效率 高于 数组push
	       		var mouthArr = [ 
	       			year+'-01', 
	       			year+'-02',
	       			year+'-03', 
	       			year+'-04', 
	       			year+'-05', 
	       			year+'-06', 
	       			year+'-07', 
	       			year+'-08', 
	       			year+'-09', 
	       			year+'-10', 
	       			year+'-11', 
	       			year+'-12'  
	       		]; 
	       		var new_yearContentBody = document.createElement("div");
	       		new_yearContentBody.className = 'yearContentBody';
	       		var new_dataTableTr =  document.createElement("div");
	       		new_dataTableTr.className = 'dataTableTr';

	       		_.each(mouthArr, function(item,index){
	       			var _index = index +1;
	       			var new_dataTableTd = document.createElement("div");
	       			new_dataTableTd.className = 'dataTableTd';
	       			new_dataTableTd.id = 'item' + item.replace('-','');


	       			switch(_index%3){
	       				case 0:
	       					 _dataClassStr = 'tableRight';
	       					 break;
	       				case 1: 
	       					_dataClassStr = 'tableLeft';
	       					 break;
	       				case 2: 
	       					_dataClassStr = 'tableCenter';
	       					 break;

	       			}
	       			var new_dataTitle = document.createElement("div");
	       			new_dataTitle.className = 'dataTitle ' + _dataClassStr;

	       			var new_mouthData = document.createElement("div");
	       			new_mouthData.className = 'mouthData';
	       			new_mouthData.innerHTML = _index + '月';

	       			var new_priceData = document.createElement("div");
	       			new_priceData.className = 'priceData';
	       			new_priceData.id = 'm' + item.replace('-','');

	       			new_dataTitle.appendChild(new_mouthData);
	       			new_dataTitle.appendChild(new_priceData);
	       			new_dataTableTd.appendChild(new_dataTitle);

	       			var mouthTotalDay = moment(item).daysInMonth();
	       			var mouthFirstDay = moment(item).weekday();
	       			var new_tbody = me.generateDayTemple(mouthFirstDay,mouthTotalDay,item);
	       			var new_dataTable = document.createElement("div");
	       			new_dataTable.className = 'dataTable ' + _dataClassStr;
	       			new_dataTable.appendChild(new_tbody);
	       			new_dataTableTd.appendChild(new_dataTable);

	       			new_dataTableTr.appendChild(new_dataTableTd);

	       			if(!(_index%3)){
	       				new_yearContentBody.appendChild(new_dataTableTr);
	       				new_dataTableTr =  document.createElement("div");
	       				new_dataTableTr.className = 'dataTableTr';
	       			}
	       		});

				return new_yearContentBody;

	       },
	       //生成30天的模板
	       generateDayTemple: function(firstDay,totalDay,mouthStr){
	       		var _firstDay = (firstDay)%8 || 1;
	       		// //1234567转成7123456
	       		// var _firstDay = (firstDay+1)%8 || 1;
	       		//42 = 6 * 7;
	       		var _countIndex = 1;
	       		var _dayIndex = 1;
	       		var new_tbody = document.createElement("div");
	       		new_tbody.className = 'tbody';
	       		for(var i=0; i < 6 ; i++){
	       			var new_tr = document.createElement("div");
	       			new_tr.className = 'tr';
	       			for(var j=0; j < 7; j++){
	       				var new_td=document.createElement("div");
	       				new_td.className = 'td';
	       				if( !(_countIndex < _firstDay || _dayIndex>totalDay) ){
	       					var new_td=document.createElement("div");
	       					new_td.className = 'td';
	       					var idStr = 'd' + mouthStr.replace('-','') + (parseInt(_dayIndex/10)?'':'0') + _dayIndex;
	       					new_td.id = idStr;
	       					new_td.innerHTML = '<span>' + _dayIndex + '</span>';
	       					_dayIndex ++;
	       				}
	       				new_tr.appendChild(new_td);
	       				_countIndex ++;
	       			}
	       			new_tbody.appendChild(new_tr);
	       		}
	       		return new_tbody;
	       },
	       onLeft: function() {
			   document.body.onclick = null;
			   this.goBack();
	       },
	   });
       });
