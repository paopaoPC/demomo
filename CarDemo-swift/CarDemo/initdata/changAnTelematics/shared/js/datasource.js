define(['butterfly/listview/DataSource', 'shared/js/client'], function(DataSource, Client){

	return DataSource.extend({

		ajaxLoadData: function(options){

			//不传pageSize参数
//			delete options.data[this.options.pageSizeParam];
			var pageSize = options.data[this.options.pageSizeParam];
			
			pageSize = pageSize || 20;
			var me = this;
			Client.ajax({
				url: options.url,
				type: 'POST',
				data: options.data,
				success: function(response) {
					// code = 3(数据为空) 和  sucess = true 都调用options.success。
					// code = 3 时，sucess 是为false
					if (response&& (response.success || response.code == 3)&&response.data ) {// && response.success
						//mark as finish
						if(response.data.data == null){
							response.data.data = [];
							response.data.data.length = 0;
						}
						if (response.data.data.length == 0
							|| response.data.total == response.data.data.length + me.size()
							||response.data.data.length<pageSize) {
							me.setFinish();
						};
						//callback
						options.success(response.data);
					} else {
						options.fail(response.data);
					}
				},
				error: function(xhr, status) {
					options.fail(xhr, status);
				}
			});
		}
	});
});