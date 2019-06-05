define([],function(){
	var cls={};

	cls.getHistoryImage_url = bfConfig.server + '/api/car/getHistoryImage';
	
	cls.getTourList=function(params){   //拉取已有游记列表
		params.api="/api/Laboratory/getTourList";
		bfNet.doAPI(params);
	}
	cls.CreateTour=function(params){  // 创建游记
		params.api="/api/Laboratory/CreateTour";
		bfNet.doAPI(params);
	}
	cls.getLabStatus=function(params){  // 获取设置状态
		params.api="/api/Laboratory/getLabStatus";
		bfNet.doAPI(params);
	}
	cls.updateLab=function(params){  // 设置状态值
		params.api="/api/Laboratory/updateLab";
		bfNet.doAPI(params);
	}
	cls.deleteContact=function(params){  // 删除紧急联系人
		params.api="/api/Laboratory/deleteContact";
		bfNet.doAPI(params);
	}
	cls.getContact=function(params){  // 拉取紧急联系人
		params.api="/api/Laboratory/getContact";
		bfNet.doAPI(params);
	}
	cls.insertContact=function(params){  // 添加紧急联系人
		params.api="/api/Laboratory/insertContact";
		bfNet.doAPI(params);
	}
	cls.deleteTour=function(params){  // 删除游记
		params.api="/api/Laboratory/deleteTour";
		bfNet.doAPI(params);
	}
	cls.updateTour=function(params){  // 更新游记 名称
		params.api="/api/Laboratory/updateTour";
		bfNet.doAPI(params);
	}
	cls.getsingletours=function(params){  // 获取单条游记记录
		params.api="/api/Laboratory/getsingletours";
		bfNet.doAPI(params);
	}
	cls.updateContact=function(params){  // 更新紧急联系人
		params.api="/api/Laboratory/updateContact";
		bfNet.doAPI(params);
	}
	cls.getCarLocation=function(params){  //拉取车辆地址
		params.api="/api/cardata/getCarLocation";
		bfNet.doAPI(params);
	}
	cls.delete_singleOne=function(params){   //删除单条游记
		params.api="/api/Laboratory/deletesingletour";
		bfNet.doAPI(params);
	};
	cls.update_singleOne=function(params){   //更新单条游记
		//params.api="/api/laboratory/deletesingletour";
		bfNet.doAPI(params);
	};
	return cls;
})