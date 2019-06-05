define([], function(){
	var mydate = new Date();
	/**
	 * 今天零时零分的timestamp  00:00
	 */
	function beginOfToday(){
		var myyear,mymonth,myday,mytime;
		myyear = mydate.getFullYear();
		mymonth = (mydate.getMonth()+1)<10?'0'+(mydate.getMonth()+1):mydate.getMonth()+1;
		myday = mydate.getDate()<10?'0'+mydate.getDate():mydate.getDate();
		mytime = myyear+"/"+mymonth+"/"+myday+" 00:00:00";
		return (new Date(mytime).getTime());
	}

	/**
	 * 昨天天零时零分的timestamp 
	 */
	function beginOfYesterday(){
		return new Date(beginOfToday()).getTime() - (24 * 60 * 60 * 1000);
	}

	/**
	 * 本周第一天（根据calendar的firstWeekday设置）零时零分的timestamp
	 */
	function beginOfThisWeek() {
		return new Date(beginOfToday()).getTime() - (mydate.getDay()) * (24 * 60 * 60 * 1000);
	}

	/**
	 * 返回自定义规则时间格式
	 */
	var dateDescription = function(date) {
		var temp = Date.parse(date);
		// 范围：今天内 HH:mm
		if(temp >  beginOfToday()) {
			return date.substring(11,16);
			
		} else if(temp > beginOfYesterday() && temp < beginOfToday()) { // 范围：昨天内：昨天
			return "昨天";
			
		} else if (temp > beginOfThisWeek() && temp < beginOfYesterday()) { // 范围：一周内：星期几
			var week = new Array("日", "一", "二","三","四","五","六");
			return "星期"+week[new Date(date).getDay()];

		} else { // 范围：一周外：yy-MM-dd
			return date.substring(2,10);
		}
	}

	String.prototype.dateDescription = function() {
		var temp = Date.parse(this);
		// 范围：今天内 HH:mm
		if(temp >  beginOfToday()) {
			return this.substring(11,16);
			
		} else if(temp > beginOfYesterday() && temp < beginOfToday()) { // 范围：昨天内：昨天
			return "昨天";
			
		} else if (temp > beginOfThisWeek() && temp < beginOfYesterday()) { // 范围：一周内：星期几
			var week = new Array("日", "一", "二","三","四","五","六");
			return "星期"+week[new Date(this).getDay()];

		} else { // 范围：一周外：yy-MM-dd
			return this.substring(2,10);
		}
	};

	return dateDescription;
});