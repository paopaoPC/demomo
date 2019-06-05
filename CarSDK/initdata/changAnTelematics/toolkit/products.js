define(
        [
            "text!toolkit/products.html", 
            "common/navView",
            'butterfly',
			'shared/js/datasource',
        	'listview/ListView',
            "common/ssUtil",
			"shared/js/notification",
			"common/osUtil",
            "swipe",
            '../shared/js/client',
            'toolkit/diceCoefFuzzyMatching'
        ],
        function (template, View, Butterfly, Datasource,ListView, ssUtil,Notification,osUtil,swipe, BaseClient, CompareStrings)
        {
            var Base = View;
            var listview1;
            var cls =
			{
				events: {
					'click #products_select option':'tempViewList',
					'click #products_ser': 'searchKeyValue'
				},
			};

			var basePath = BaseClient.basePath;

	  		cls.onShow = function(){
	  			var self = this;
	  			if(listview1){
	  				listview1.undelegateEvents();
	  				listview1 = null;
	  			}
	  			bfClient.getCarStyle({
	  				success:function(data){
	  					if(data.success){
	  						self.carStyle = data.data;
	  						self.tempViewCarStyle();
	  					}else{
	  						Notification.show({
	  							type:'error',
	  							message:data.msg
	  						});
	  					}
	  				},
	  				error: function(){
	  					self.getElement(".pulldown").hide();
	  					self.getElement(".pullup").hide();
	  				}
	  			});
	  			var keyNode = this.getElement('#products_input');
	  			keyNode.on("input propertychange", function(){
					var key = self.getElement("#products_input").val();
					if(!key){
						self.getElement(".content-ul").hide();
						self.getElement(".content-list").show();
						listview1.refresh();
						self.getElement("#products_input").blur();
					}
	  			});
	  		};
	  		cls.searchKeyValue = function()
	  		{
	  			var me = this;
	  			var key = me.getElement("#products_input").val();
				var id = this.getElement('#products_select').find('option:selected').attr('data-id');
	  			var datas = me._dataSource.cache;
                var results = datas;
                if(key)
                {
                    results = [];
					bfClient.getSearchResult({
						data:{searchParam:key,carType:id},
						success:function(req){
							if(req.code == 0){
								results = req.data;
								me.getElement(".search-result-ul").empty();
								me.getElement(".content-ul").show();
								me.getElement(".content-list").hide();
								var coantainer = me.getElement('.content-ul');
								var noDataNode = me.getElement('.no-data');
								template = _.template(me.elementHTML('#carProducts_template'));
								coantainer.html('');
								for (var i = 0; i < results.length; i++) {
									coantainer.append(template(results[i]));
									coantainer.show();
									noDataNode.hide();
								}
							}else{
								me.getElement(".content-ul").show();
		  						me.getElement(".content-list").hide();
								me.getElement('.content-ul').html('');
								Notification.show({
									type:"error",
									message:req.msg
								});
							}
						},
						error:function(){
							Notification.show({
								type:"error",
								message:"获取搜索内容失败"
							});
						}
					});
                }else{
                	me.getElement(".content-ul").hide();
		  			me.getElement(".content-list").show();
                	listview1.refresh();
					me.getElement("#products_input").blur();
                }
	  		};

	  		cls.tempViewCarStyle = function(){
	  			var self = this;
	  			if(this.carStyle.length > 0){
	  				var element = '';
	  				var item;
	  				for(var i = 0; i<this.carStyle.length;i++){
	  					if(i == 0){
	  						item = "<option data-id = "+this.carStyle[i].dictCode+" selected = selected>"+this.carStyle[i].seriesName+"</option>";
	  					}else{
	  						item = "<option data-id = "+this.carStyle[i].dictCode+">"+this.carStyle[i].seriesName+"</option>";
	  					}
	  					element = element + item;
	  				}
	  				this.elementHTML('#products_select',element);
	  				this.getElement('#products_select').off('click');
	  				this.getElement('#products_select').change(function(){
	  					var id = self.getElement('#products_select').find('option:selected').attr('data-id');
	  					var width = self.getElement('#products_select').width();
	  					if(self._id && self._id==id){
	  						return;
	  					}else{
	  						self.tempViewList();
	  					}
	  				});
	  				this.tempViewList();
	  			}else{
	  				Notification.show({
	  					type:'error',
	  					message:'未获取到车型'
	  				});
	  			}
	  		};

	  		cls.showSelectDatas = function()
	  		{
	  			var me = this;
	  			var cache = [];
	  			me.getElement(".search-result-ul").empty();
	  			me.getElement(".content-ul").show();
	  			me.getElement(".content-list").hide();
	  			var coantainer = me.getElement('.content-ul');
	  			var noDataNode = me.getElement('.no-data');
	  			template = _.template(me.elementHTML('#carProducts_template'));
				coantainer.html('');
	  			var key = this.getElement('#products_input').val();
	  			var datas = me._dataSource.cache;
	  			if (datas.length>0) {
	  				for (var i = 0; i < datas.length; i++) {
		  				if (key == datas[i].partName || key == datas[i].serialNumber || key == "") {
		  					cache.push(datas[i]);
		  				}
		  			}
		  			if (cache.length > 0) {
			  			for (var i = 0; i < cache.length; i++) {
		  					coantainer.show();
		  					noDataNode.hide();
		  					coantainer.append(template(cache[i]));
			  			};		 
			  		}else{
			  			coantainer.empty();
		  				coantainer.hide();
		  				noDataNode.show();
			  		} 			
	  			}else{
	  				coantainer.empty();
	  				coantainer.hide();
	  				noDataNode.show();
	  			}
	  			
	  		};

	  		cls.tempViewList = function(){
	  			var me = this;
	  			me.getElement(".content-list").show();
	  			var id = this.getElement('#products_select').find('option:selected').attr('data-id');
	  			this._id = id;
	  			
	  			if(this._dataSource){
	  				delete this._dataSource;
	  			}
	  			this._dataSource = new Datasource({
					storage : 'local',
					identifier : 'carProduct-list',
					url : basePath+"/api/sale/carparts/getList",
					pageParam : 'pageIndex',
					requestParams : {
						id : id
					}
				});

				me.showListView(me._dataSource);
				me.getElement(".content-ul").hide();
	  		}
	  		cls.showListView = function(datas)
	  		{
	  			var me = this;
	  			template = _.template(this.elementHTML('#carProduct_template'));
				this.getElement('#carProduct_list ul').html('');
				var listEl1 = this.getElement('#carProduct_list');
				if(listview1){
					listview1.dataSource = datas;
					setTimeout(function(){
						listview1.reloadData();
					},50);

				}else{
					listview1 = new ListView({
					id : "car_listView",
					el : listEl1,
					itemTemplate : template,
					pageSize:10,
					dataSource : datas,
					isPullToRefresh: true
				});
				me.listenTo(listview1, 'load', me.onLoadedData);
				}
	  		}
	  		cls.onLoadedData = function(){
	  			this.searchKeyValue();
	  		}
	        cls.posGenHTML = function(){

	        }
			
            return Base.extend(cls);
        }
);


