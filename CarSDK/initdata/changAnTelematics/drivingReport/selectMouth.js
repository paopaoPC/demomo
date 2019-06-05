define([
    'common/navView',
    'butterfly',
    'shared/js/notification',
    'moment',
    'iscroll',
    "underscore"
],
       function(View ,Butterfly, Notification, moment, IScroll, _) {
	   var Base = View;
	   var VERSION = 'v11';
	   return Base.extend({
	       id: "selectMouth",
	       events: {
	       	'click .day': 'selectDay',
	       	'click .todayButton': 'backToday',
	       	'click #navRight': 'selectRight',
	       },
	       onViewPush: function(pushFrom, pushData){
	       		var me = this;
	       		me._selectYear = pushData.substr(4,4);
	       		me._selectMouth = parseInt(pushData.substr(8,2));
	       		me.initTempView(me._selectYear);
	       },
	       onViewBack: function(backFrom, backData){
		       	if (backData) {
		       		var me = this
		       		
		       		if( me._selectYear !== backData.substr(4,4) ){
			       		me.myscroll = undefined
			       		me._selectYear = backData.substr(4,4)
		       			me._selectMouth = parseInt(backData.substr(8,2));
		       			me.initTempView(me._selectYear)
		       			me.elementHTML('#navRight', me._selectYear);
		       			me.tempInnerHTML(me._htmlTemp);
		       		} else {
		       			var iscrollY = parseInt(backData.substr(8,2));
		       			iscrollY = this.TableTd_HEIGHT * (iscrollY-1);
		       			this.myscroll.scrollTo(0, -iscrollY,0);
		       		}
		       	};
	       		
	       },
	       backToday: function(){
	       		var idStr = 'd' + moment().format('YYYYMMDD')
       			bfNaviController.pop(1, idStr);
				//lxc
				window.sessionStorage.setItem("onViewBack",true);
	       		
	       },
	       //只有在2016年后，才能生成模板
	       posGenHTML: function(){
	       	 	var me = this;
	       		me.elementHTML('#navRight', me._selectYear);
			    //页面添加模板
	       		me.tempInnerHTML(me._htmlTemp);
	       		// //模板上面加数据
	       		// me.htmlTempBindData(me._htmlTemp);
	       },
	       selectRight: function(event){
	       		var idStr = $(event.currentTarget).html();
	       		bfNaviController.push("/drivingReport/selectCalendar.html",idStr);
	       },
	       selectDay: function(event){
	       		var idStr = $(event.currentTarget).attr('id');
	       		var judge = moment(idStr.substr(1),'YYYY-MM-DD').diff(moment().format('YYYY-MM-DD'),'d');
	       		if(judge >0){
	       			Notification.show({
					   type: "info",
					   message: "选择的日期不能大于当前日期"
				    });
	       		} else {
	       			bfNaviController.pop(1, idStr);
					//lxc
					window.sessionStorage.setItem("onViewBack",true);
	       		}
	       },
	       onShow: function() {
	       		var me = this;
	       		// dom跟新完 refresh一下iscroll
			   //模板上面加数据
			   me.htmlTempBindData(me._htmlTemp);
	       		setTimeout(function(){
			   		me.initScroll();
	       		},500);
	        },
	       	htmlTempBindData: function(_htmlTemp){
	       		var me = this;
	       		me.getAjaxData(_htmlTemp);
	        },
	       initTempView: function(year){
	       		var me = this;
       			me._htmlTemp = me.generateHtml(year);
       			//设置当天 为active
       			var todayStr = '#d' + moment().format('YYYYMMDD');
       			$('.today', me._htmlTemp).removeClass('today');
       			$(todayStr + ' .dayValue', me._htmlTemp).addClass('today');
	       	},
	        initScroll: function() {
				var me = this;
				var iscrollY = me._selectMouth - 1;
				this.TableTd_HEIGHT = me.$('.dataTableTd:first-child').height();
				if(iscrollY>0){
					// yearContent  有个margin-bottom = 25
					iscrollY = this.TableTd_HEIGHT * iscrollY;
				} else {
					iscrollY = 0
				}
				if (!me.myscroll) {
					me.myscroll = new IScroll(this.$('#wrapper')[0], {
						mouseWheel: true,
						// startY: - iscrollY
					});
					me.myscroll.scrollTo(0,-iscrollY,1000,false);
				} else {
					me.myscroll.refresh();
				}
			},
	        tempInnerHTML: function(_htmlTemp){
	       		this.elementHTML('#scroller',_htmlTemp);
	        },
	        updataHtml: function(_htmlTemp,calendarData){
	        	var me =this;
	       		var reg = new RegExp('-','g');
	       		var data = _.groupBy(calendarData, function(item){ return item.createTime.substring(0, 10); });
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
	       				$('#d'+key.replace(reg,'')+' .dayValue', _htmlTemp).addClass('actived');

		       			// if(bfDataCenter.getCarDevice() === 'tbox' ){
		       					$('#d'+key.replace(reg,'')+' #price', _htmlTemp).html(mouthPrice.toFixed(1) + 'km' );
		       			// } else {
		       			// 		$('#d'+key.replace(reg,'')+' #price', _htmlTemp).html('￥'+ mouthPrice.toFixed(1) );
		       			// }
	       			}
	    		});
	    		me.setLocalCalendarYearHTML(me._selectYear,_htmlTemp);
	       		me.tempInnerHTML(_htmlTemp);
	        },
	     	getSendDate: function(){
	    		var me = this;
	    		var localDate = me.getLocalDate();
	    		var data;
	    		var endDate;
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
	    				startDate: localDate.endDate,
				   		endDate: moment().format('YYYY-MM-DD')
	    			}
	    		} else {
	    			if( me._selectYear != moment().format('YYYY') ){
	    				endDate = moment(me._selectYear).add(1,'y').subtract(1,'d').format('YYYY-MM-DD');
	    			} else {
	    				endDate = moment().format('YYYY-MM-DD');
	    			}
	    			data = {
				   		startDate: me._selectYear+'-01-01',
				   		endDate: endDate
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
	    		var localStr = 'mouthData' + me._selectYear + bfDataCenter.getCarId()+ bfDataCenter.getCarDevice()  + VERSION;
	    		window.localStorage[localStr] = JSON.stringify(sendData);
	    	},
	    	getLocalDate: function(){
	    		var me = this;
	    		var localStr = 'mouthData' + me._selectYear + bfDataCenter.getCarId()+ bfDataCenter.getCarDevice()  + VERSION;
	    		return window.localStorage[localStr] && JSON.parse(window.localStorage[localStr]);
	    	},
	    	setLocalCalendarYearHTML: function(year, data){
	       		var me = this;
	       		if(!data){
	       			return;
	       		}
	       		var localStr = '_Mouth'+year+ bfDataCenter.getCarId()+ bfDataCenter.getCarDevice()  + VERSION;
	       		window.localStorage[localStr] = data.outerHTML;

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
	       					me.tempInnerHTML(_htmlTemp);
	       					me.initScroll();
						}
				    },
					error:function(){
				   		Notification.show({
						   type: "error",
						   message: "沒有数据"
					    });
	       				me.tempInnerHTML(_htmlTemp);
       					me.initScroll();
					}
				});
	    	},
	       //生成html模板
	       generateHtml: function(currentYear){
	       		var me = this;
	       		var localStr = '_Mouth'+currentYear+bfDataCenter.getCarId()+ bfDataCenter.getCarDevice() + VERSION;
	       		if(window.localStorage[localStr]){
	       			return me.str2Dom(window.localStorage[localStr]);
	       		} else {
	       			return me.generateMouthTemple(currentYear);
	       		}
	       },
	       //字符串转dom变量
	       str2Dom: function(str){
	       		var objEl = document.createElement("div");
　　 			objEl.innerHTML = str;
			　　 return objEl.childNodes[0];
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

	       		_.each(mouthArr, function(item,index){
	       			var _index = index +1;
	       			var new_dataTableTd = document.createElement("div");
	       			new_dataTableTd.className = 'dataTableTd';
	       			new_dataTableTd.id = 'item' + item.replace('-','');


	       			var new_dataTitle = document.createElement("div");
	       			new_dataTitle.className = 'dataTitle';

	       			var new_mouthData = document.createElement("div");
	       			new_mouthData.className = 'mouthData';
	       			new_mouthData.innerHTML = me.changeChapterToChina(_index) + '月';

	       			new_dataTitle.appendChild(new_mouthData);
	       			new_dataTableTd.appendChild(new_dataTitle);

	       			var mouthTotalDay = moment(item).daysInMonth();
	       			var mouthFirstDay = moment(item).weekday();
	       			var new_tbody = me.generateDayTemple(mouthFirstDay,mouthTotalDay,item);
	       			var new_dataTable = document.createElement("div");
	       			new_dataTable.className = 'dataTable';
	       			new_dataTable.appendChild(new_tbody);
	       			new_dataTableTd.appendChild(new_dataTable);

	       			new_yearContentBody.appendChild(new_dataTableTd);
	       		});

				return new_yearContentBody;

	       },
	       	// 数字 转 文字，只处理99以内
	        changeChapterToChina: function (i) {
	            var newChapter = '';
	            var num = i;
	            var ary = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

	            var tenNum = parseInt(num / 10);
	            if (tenNum == 1) {
	                newChapter = '十';
	            } else if (tenNum > 1) {
	                newChapter = ary[tenNum] + '十';
	            }

	            newChapter += ary[num % 10];


	            return  newChapter;

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
	       		for(var i=0; i < 6 ; i++){
	       			var new_tr = document.createElement("div");
	       			new_tr.className = 'tr';
	       			for(var j=0; j < 7; j++){
	       				if(_countIndex < _firstDay || _dayIndex>totalDay){
	       					var new_td=document.createElement("div");
	       					new_td.className = 'noDay';
	       				} else {
	       					var new_td=document.createElement("div");
	       					var idStr = 'd' + mouthStr.replace('-','') + (parseInt(_dayIndex/10)?'':'0') + _dayIndex;
	       					new_td.className = 'day';
	       					new_td.id = idStr;
	       					new_td.innerHTML = '<span class="dayValue">' + _dayIndex + '</span>'
	       									  +'<span id="price"></span>';
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
			   bfNaviController.pop(1,'onLeft');
			   window.sessionStorage.setItem("onViewBack",true);
	       }
	   });
       });
