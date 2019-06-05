define([
		'butterfly/view',
		'text!map/index.html',
		'map/map-client',
		'spin',
		'shared/js/notification',
		'shared/js/baidumap-api-quick',
		'shared/js/baidumap-api-quick2'
	],
	function(View, viewTemplate, mapClient, Spinner, Notification, bdAPI, bdAPI2) {
		// 定义自定义覆盖物的构造函数    
		function SquareOverlay(center, div, width, height) {
				this._center = center;
				this._div = div;
				this._width = width;
				this._height = height;
			}
			// 继承API的BMap.Overlay      
		SquareOverlay.prototype = new BMap.Overlay();
		// 实现初始化方法    
		SquareOverlay.prototype.initialize = function(map) {
				// 保存map对象实例     
				this._map = map;
				// 将div添加到覆盖物容器中     
				map.getPanes().markerPane.appendChild(this._div);
				// 需要将div元素作为方法的返回值，当调用该覆盖物的show、     
				// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
				var div = this._div;
				return div;
			}
			// 实现绘制方法     
		SquareOverlay.prototype.draw = function() {
			// 根据地理坐标转换为像素坐标，并设置给容器      
			var position = this._map.pointToOverlayPixel(this._center);
			this._div.style.left = position.x - this._width / 2 + "px";
			this._div.style.top = position.y - 81 + "px";
		}
		SquareOverlay.prototype.show = function() {
			if (this._div) {
				this._div.style.display = "block";
			}
		}
		SquareOverlay.prototype.hide = function() {
			if (this._div) {
				this._div.style.display = "none";
			}
		}
		SquareOverlay.prototype.addEventListener = function(event, fun) {
				this._div['on' + event] = fun;
			}
			//自定义控件，定位按钮
		function ZoomControl(div) {
				// 设置默认停靠位置和偏移量    
				this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
				this.defaultOffset = new BMap.Size(10, 10);
				this._div = div;
			}
			// 通过JavaScript的prototype属性继承于BMap.Control     
		ZoomControl.prototype = new BMap.Control();

		ZoomControl.prototype.initialize = function(map) {
			var me = this;
			var div = this._div;
			// 绑定事件，点击定位当前坐标     
			div.onclick = function(e) {

					mapClient.getCurrentLatLng(function(lng, lat) {
						mapClient.currentPoint = new BMap.Point(lng, lat);
						map.removeOverlay(mapClient.currentMarker);
						mapClient.currentMarker = new BMap.Marker(mapClient.currentPoint); // 创建标注
						map.addOverlay(mapClient.currentMarker); // 将标注添加到地图中
						map.panTo(mapClient.currentPoint);
					}, function() {
						Notification.show({
							type: "error",
							message: "定位失败"
						});
						if (mapClient.currentPoint) {
							map.panTo(mapClient.currentPoint);
						}
					});
				}
				// 添加DOM元素到地图中     
			map.getContainer().appendChild(div);
			return div;
		}
		return View.extend({
			id: 'map',
			allPointsArr: [],
			allMarkerArr: [],
			maxPoints: 30, //地图内标注数量阀值，大于这个数字才用网格算法
			gridWidth: 50, //一个格子边长

			events: {
				"click .BMap_mask": "hideOverlay"
			},
			initialize: function(params) {
				if (params && params.lng && params.lat) {
					this.lng = params.lng;
					this.lat = params.lat;
				}
			},
			render: function() {
				$(this.el).html(viewTemplate);
			},
			onShow: function() {
				var me = this;
				//绘制网格供测试
				me.zoom = 3;
				me.map = new BMap.Map("bdmapContent", {
					enableMapClick: false
				});
				//初始化地图也会触发以下事件
				me.map.addEventListener("moveend", function() {
					me.createOverlay();
				});
				me.map.addEventListener("zoomend", function() {
					me.createOverlay();
				});
				//添加缩放控件
				var zoomControl = new BMap.ZoomControl();
				me.map.addControl(zoomControl);
				//添加定位控件
				var locateControl = new ZoomControl($(".locateBtn")[0]);
				me.map.addControl(locateControl);
				//如果第一次进地图传来定位坐标,就不需要再定位，省资源
				if (me.lng && me.lat) {
					mapClient.currentPoint = new BMap.Point(me.lng, me.lat);
					me.map.removeOverlay(mapClient.currentMarker);
					mapClient.currentMarker = new BMap.Marker(mapClient.currentPoint); // 创建标注
					me.map.addOverlay(mapClient.currentMarker); // 将标注添加到地图中
					me.initMapByPoint(me.lng, me.lat, 11); //暂时写死11，最好是根据列表的经销商，得到外包区域
				} else {
					//默认经纬度-重庆,以重庆为中心显示中国地图
					this.lng = 106.55209;
					this.lat = 29.591058;
					me.initMapByPoint(me.lng, me.lat, 4); //第一次点击列表初始化，或定位失败，显示中国地图
					mapClient.getCurrentLatLng(function(lng, lat) {
						mapClient.currentPoint = new BMap.Point(lng, lat);
						me.map.removeOverlay(mapClient.currentMarker);
						mapClient.currentMarker = new BMap.Marker(mapClient.currentPoint); // 创建标注
						me.map.addOverlay(mapClient.currentMarker); // 将标注添加到地图中
					});
				}
			},
			createOverlay: function() {
				var me = this;
				//处理拖动时候执行了两次该方法
				if (me.lastZoom == me.map.getZoom() && me.lastLng == me.map.getCenter().lng && me.lastLat == me.map.getCenter().lat) {
					return;
				} else {
					me.lastZoom = me.map.getZoom();
					me.lastLng = me.map.getCenter().lng;
					me.lastLat = me.map.getCenter().lat;
				}
				//缩放级别很小的时候滑动不在执行过滤算法，只在缩放时候执行
				/*if(me.lastZoom == me.map.getZoom() && me.map.getZoom() < 9){
					return;
				}*/

				// 过滤函数,用算法过滤所有点,返回的合适点
				var _filterData = function(data) {
					data = me.filterData(data);
					return data;
				}
				var _createOverlay = function(data) {
						for (var i = 0; i < me.allMarkerArr.length; i++) {
							me.map.removeOverlay(me.allMarkerArr[i]);
						}
						me.allMarkerArr = [];
						data = _filterData(data);
						// 把data里面的点创建成overlay
						_.each(data, function(item) {
							var point = new BMap.Point(item.lng, item.lat);
							me.addMarker(point, item); //由于新的视野有可能包括别的省份，那些经销商点也需显示，所以数据源不能只拿重庆区域，而是取屏幕内的
						});
						me.lastZoom2 = me.map.getZoom(); //记录上次zoom等级，用于放大缩小不做矩形交集处理
					}
					//全局变量缓存起来，不用每次拖动都请求数据，因为经销点一般都是固定的
				if (me.allPointsArr.length > 0) {
					_createOverlay(me.allPointsArr);
				} else {
					// 取所有数据
					mapClient.getMapList({
						beforeSend: function() {
							if (me.$el.find('.chrysanthemum_map').length === 0) {
								me.$el.append("<div class='chrysanthemum_map active' style='text-align: center;'><div></div></div>");
							}
						},
						success: function(data) {
							me.allPointsArr = data.data.data;
							_createOverlay(me.allPointsArr);

						},
						error: function(xhr, status) {
							Notification.show({
								type: "error",
								message: "获取经销商坐标失败"
							});
						},
						complete: function() {
							me.$el.find('.chrysanthemum_map').remove();
						}
					});
				}

			},
			//点击列表
			locateByPoint: function(lng, lat) {
				var me = this;
				me.initMapByPoint(lng, lat, 15);
				_.each(me.allMarkerArr, function(item, index) {
					item.wgs=item.point;
					if (item.wgs) {
						if (item.wgs.lng == lng && item.wgs.lat == lat) {
							var data = {
								"wgs": lng + "," + lat
							}
							me.createWindowInfo(data, me.allMarkerArr[index]);
						}
					}
				});

				mapClient.getCurrentLatLng(function(lng, lat) {
					mapClient.currentPoint = new BMap.Point(lng, lat);
					me.map.removeOverlay(mapClient.currentMarker);
					mapClient.currentMarker = new BMap.Marker(mapClient.currentPoint); // 创建标注
					me.map.addOverlay(mapClient.currentMarker); // 将标注添加到地图中
				});
			},
			//根据坐标获取地级市
			getAddressByPoint: function(lng, lat, success, error) {
				var me = this;
				var point = new BMap.Point(lng, lat);
				// 创建地理编码实例      
				var myGeo = new BMap.Geocoder();
				// 根据坐标得到地址描述，获取区域   
				myGeo.getLocation(point, function(result) {
					if (success) {
						success(result);
					}
				}, function(err) {
					if (error) {
						error();
					}
				});
			},
			//根据地级市定位地图
			locateByAddress: function(addr) {
				var me = this;
				me.map.centerAndZoom(addr, 11);
			},
			//根据经纬度初始化地图
			initMapByPoint: function(paramLng, paramLat, paramZoom) {
				var me = this;
				var point = new BMap.Point(paramLng, paramLat); //中心点
				me.map.centerAndZoom(point, paramZoom);
			},
			//一键导航
			goNavigation: function(desLng, desLat, success, error, desAddress) {
				mapClient.getCurrentLatLng(function(lng, lat) {
					if (success) {
						success();
					}
					var start = {
						latlng: new BMap.Point(lng, lat),
					}
					var end = {
						latlng: new BMap.Point(desLng, desLat),
					}
					var opts = {
							mode: BMAP_MODE_DRIVING,
							region: "重庆"
						}
						if (typeof cordova !== 'undefined') {
						if (device.platform == "iOS") {
							var url = encodeURI("../map/iframePage.html?start=" + JSON.stringify(start) + "&end=" + JSON.stringify(end) + "&opts=" + JSON.stringify(opts));
							var RouteTask= window.open(url, "_blank", "location=no");
							RouteTask.addEventListener("exit", function () {
								window.StatusBar.styleLightContent();
							});
						} else {
							if (navigator && navigator.iChanganCommon) {
								navigator.iChanganCommon.startNavi({
									lng: lng,
									lat: lat,
									type: 1
								}, {
									lng: desLng,
									lat: desLat,
									type: 1,
									address: desAddress
								}, function() {
								}, function() {
								});
							} else {
								Notification.show({
									type: "error",
									message: "导航失败"
								});
							}
						}
					} else {
						var url = encodeURI("../map/iframePage.html?start=" + JSON.stringify(start) + "&end=" + JSON.stringify(end) + "&opts=" + JSON.stringify(opts));
						window.open(url, "_blank", "location=no");
					}
				}, function(err) {
					if (error) {
						error();
					}
					Notification.show({
						type: "error",
						message: "定位失败"
					});
				});
			},
			filterData: function(data) {
				var me = this;
				var pointArr1 = [];
				var pointArr2 = [];
				var pointArr3 = [];
				var lastPointArr = [];
				var isZoom = false; //是否放大缩小
				var m = parseInt(document.body.offsetWidth / me.gridWidth);
				var n = parseInt(document.body.offsetHeight / me.gridWidth);

				var bounds = me.map.getBounds();
				var lngSpan = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
				var latSpan = bounds.getNorthEast().lat - bounds.getSouthWest().lat;

				//初始化二维数组,即网格
				var tArray = new Array();
				for (var i = 0; i < m; i++) {
					tArray[i] = new Array();
					for (var j = 0; j < n; j++) {
						tArray[i][j] = null;
					}
				}
				_.each(data, function(item) {
					//lxc
					item.wgs=item.poiBd09;
					item.lng = item.wgs.split(",")[0];
					item.lat = item.wgs.split(",")[1];
					if (me.lastBounds && me.map.getZoom() == me.lastZoom2) { //如果地图已有上一次的点，则新视野去掉与旧视野交集的部分，该部分不生成新点,放大缩小不处理
						if (me.lastBounds.getSouthWest().lng <= bounds.getSouthWest().lng && me.lastBounds.getNorthEast().lng >= bounds.getSouthWest().lng && me.lastBounds.getSouthWest().lat <= bounds.getNorthEast().lat && me.lastBounds.getNorthEast().lat >= bounds.getNorthEast().lat) { //移动距离超出视野的宽或高，即没有交集也不处理
							if ((item.lng > me.lastBounds.getNorthEast().lng && item.lng < bounds.getNorthEast().lng && item.lat < bounds.getNorthEast().lat && item.lat > bounds.getSouthWest().lat) || (item.lng > bounds.getSouthWest().lng && item.lng < bounds.getNorthEast().lng && item.lat < me.lastBounds.getSouthWest().lat && item.lat > bounds.getSouthWest().lat)) {
								pointArr1.push(item);
							}
						} else if (me.lastBounds.getNorthEast().lng > bounds.getNorthEast().lng && me.lastBounds.getSouthWest().lng < bounds.getNorthEast().lng && me.lastBounds.getNorthEast().lat > bounds.getNorthEast().lat && me.lastBounds.getSouthWest().lat < bounds.getNorthEast().lat) {
							if ((item.lng > bounds.getSouthWest().lng && item.lng < me.lastBounds.getSouthWest().lng && item.lat < bounds.getNorthEast().lat && item.lat > bounds.getSouthWest().lat) || (item.lng > bounds.getSouthWest().lng && item.lng < bounds.getNorthEast().lng && item.lat < me.lastBounds.getSouthWest().lat && item.lat > bounds.getSouthWest().lat)) {
								pointArr1.push(item);
							}
						} else if (me.lastBounds.getSouthWest().lng < bounds.getSouthWest().lng && me.lastBounds.getNorthEast().lng > bounds.getSouthWest().lng && me.lastBounds.getNorthEast().lat > bounds.getSouthWest().lat && me.lastBounds.getSouthWest().lat < bounds.getSouthWest().lat) {
							if ((item.lng > me.lastBounds.getNorthEast().lng && item.lng < bounds.getNorthEast().lng && item.lat < bounds.getNorthEast().lat && item.lat > bounds.getSouthWest().lat) || (item.lng > bounds.getSouthWest().lng && item.lng < bounds.getNorthEast().lng && item.lat > me.lastBounds.getNorthEast().lat && item.lat < bounds.getNorthEast().lat)) {
								pointArr1.push(item);
							}
						} else if (me.lastBounds.getNorthEast().lng > bounds.getNorthEast().lng && me.lastBounds.getSouthWest().lng < bounds.getNorthEast().lng && me.lastBounds.getSouthWest().lat < bounds.getSouthWest().lat && me.lastBounds.getNorthEast().lat > bounds.getSouthWest().lat) {
							if ((item.lng > bounds.getSouthWest().lng && item.lng < me.lastBounds.getSouthWest().lng && item.lat < bounds.getNorthEast().lat && item.lat > bounds.getSouthWest().lat) || (item.lng > bounds.getSouthWest().lng && item.lng < bounds.getNorthEast().lng && item.lat > me.lastBounds.getNorthEast().lat && item.lat < bounds.getNorthEast().lat)) {
								pointArr1.push(item);
							}
						} else {
							if (item.lng > bounds.getSouthWest().lng && item.lng < bounds.getNorthEast().lng && item.lat > bounds.getSouthWest().lat && item.lat < bounds.getNorthEast().lat) {
								pointArr1.push(item);
							}
						}
					} else { //如果没标注过，则取当前视野来生成新点
						isZoom = true;
						if (item.lng > bounds.getSouthWest().lng && item.lng < bounds.getNorthEast().lng && item.lat > bounds.getSouthWest().lat && item.lat < bounds.getNorthEast().lat) {
							pointArr1.push(item);
						}
					}
				});

				if (isZoom && pointArr1.length <= me.maxPoints) { //小于阀值，全部显示
					isZoom = false;
					return pointArr1;
				} else { //否则放进网格,即点在网格的位置
					_.each(pointArr1, function(item) {
						var x = parseInt((item.lng - bounds.getSouthWest().lng) * m / lngSpan);
						var y = parseInt((item.lat - bounds.getSouthWest().lat) * n / latSpan);
						if (tArray[x][y] == null) { //优先原则过滤
							tArray[x][y] = item;
						}

					});
					pointArr1 = [];
					//由里到外迭代网格取过滤后的点
					if (me.maxNum(m, n) > 2) {
						for (var i = 1; i <= parseInt(me.maxNum(m, n) / 2) + 1; i++) { //对角线单元格数量,由于parseInt会约掉小数，所以+1
							if (i == 1) {
								if (tArray[parseInt(m / 2)][parseInt(n / 2)]) { //由于数组从0开始，所有parseInt后不用+1
									pointArr2.push(tArray[parseInt(m / 2)][parseInt(n / 2)]);
								}
							} else {
								for (var j = 0; j < 2 * i - 1; j++) {
									if (parseInt(m / 2) - i + 1 + j >= 0 && parseInt(m / 2) - i + 1 + j < m && parseInt(n / 2) - i + 1 >= 0 && parseInt(n / 2) - i + 1 < n) {
										if (tArray[parseInt(m / 2) - i + 1 + j][parseInt(n / 2) - i + 1]) {
											pointArr2.push(tArray[parseInt(m / 2) - i + 1 + j][parseInt(n / 2) - i + 1]);
										}
									}
								}
								for (var k = 1; k < 2 * i - 1; k++) {
									if (parseInt(m / 2) - i + 1 + j - 1 >= 0 && parseInt(m / 2) - i + 1 + j - 1 < m && parseInt(n / 2) - i + 1 + k >= 0 && parseInt(n / 2) - i + 1 + k < n) {
										if (tArray[parseInt(m / 2) - i + 1 + j - 1][parseInt(n / 2) - i + 1 + k]) { //由于上一个循环导致j++，所以要-1
											pointArr2.push(tArray[parseInt(m / 2) - i + 1 + j - 1][parseInt(n / 2) - i + 1 + k]);
										}
									}
								}
								for (var p = 1; p < 2 * i - 1; p++) {
									if (parseInt(m / 2) - i + 1 + j - 1 - p >= 0 && parseInt(m / 2) - i + 1 + j - 1 - p < m && parseInt(n / 2) - i + 1 + k - 1 >= 0 && parseInt(n / 2) - i + 1 + k - 1 < n) {
										if (tArray[parseInt(m / 2) - i + 1 + j - 1 - p][parseInt(n / 2) - i + 1 + k - 1]) {
											pointArr2.push(tArray[parseInt(m / 2) - i + 1 + j - 1 - p][parseInt(n / 2) - i + 1 + k - 1]);
										}
									}
								}
								for (var q = 1; q < 2 * i - 1 - 1; q++) {
									if (parseInt(m / 2) - i + 1 + j - 1 - p + 1 >= 0 && parseInt(m / 2) - i + 1 + j - 1 - p + 1 < m && parseInt(n / 2) - i + 1 + k - 1 - q >= 0 && parseInt(n / 2) - i + 1 + k - 1 - q < n) {
										if (tArray[parseInt(m / 2) - i + 1 + j - 1 - p + 1][parseInt(n / 2) - i + 1 + k - 1 - q]) {
											pointArr2.push(tArray[parseInt(m / 2) - i + 1 + j - 1 - p + 1][parseInt(n / 2) - i + 1 + k - 1 - q]);
										}
									}
								}
							}
						}
					}
					if (me.lastPoints && !isZoom) {
						pointArr2 = me.mergeArray(pointArr2, me.lastPoints, bounds);

					}
					me.lastBounds = bounds;
					me.lastPoints = pointArr2;
					return pointArr2;
				}

			},
			mergeArray: function(arr1, arr2, bounds, zoom) {
				var _arr = [];
				for (var i = 0; i < arr1.length; i++) {
					_arr.push(arr1[i]);
				}
				var _dup;
				for (var i = 0; i < arr2.length; i++) {
					_dup = false;
					for (var _i = 0; _i < arr1.length; _i++) {
						if (arr2[i] == arr1[_i]) {
							_dup = true;
							break;
						}
					}
					if (!_dup) {
						if (arr2[i].lng > bounds.getSouthWest().lng && arr2[i].lng < bounds.getNorthEast().lng && arr2[i].lat > bounds.getSouthWest().lat && arr2[i].lat < bounds.getNorthEast().lat) {
							_arr.push(arr2[i]);
						}
					}
				}

				return _arr;
			},
			maxNum: function(x, y) {
				if (x > y) {
					return x;
				} else {
					return y;
				}
			},
			addMarker: function(point, data) { // 创建图标对象   
				var me = this;
				var myIcon = new BMap.Icon("../map/img/location.gif", new BMap.Size(24, 30), {
					anchor: new BMap.Size(7, 20),
				});
				// 创建标注对象并添加到地图   
				var marker = new BMap.Marker(point, {
					icon: myIcon
				});
				marker.wgs = data.poiBd09; //lxc
				me.map.addOverlay(marker);
				marker.addEventListener("click", function(e) {
					me.createWindowInfo(data, marker);
				});
				me.allMarkerArr.push(marker);
			},
			// 在标注上添加自定义覆盖物 
			createWindowInfo: function(data, marker) {
				var me = this;
				//lxc
				if (mapClient.currentPoint) {
					if (data.wgs) {
						var desLng = data.wgs.split(",")[0];
						var desLat = data.wgs.split(",")[1];
					}
				}
				if(data.wgs == window.sessionStorage.histroyIcon){
					return;
				}
				window.sessionStorage.histroyIcon = data.wgs;
				mapClient.getWindowInfo({  //lxc
					lat: data.wgs.split(",")[1],
					lng: data.wgs.split(",")[0],
					scope: 1000,
					success: function(json) { //data格式有可能不对，周一回去验证
						window.sessionStorage.removeItem("histroyIcon");
						me.map.removeOverlay(me.mySquare);
						var mapInfowindowTemplate = _.template(me.$("#map-infowindow-template").html(), {
							"rows": json.data[0]
						});
						me.mySquare = new SquareOverlay(marker.getPosition(), $(mapInfowindowTemplate)[0], 215, 42);
						me.map.addOverlay(me.mySquare);
						//获取导航时间
						mapClient.getBdTimestamp({
							origins: mapClient.currentPoint.lat + "," + mapClient.currentPoint.lng,
							destinations: desLat + "," + desLng,
							mode: "driving",
							ak: "SWvGwGN4nCnTooBxiZV7aFOX",
							success: function(json) {
								if (json) {
									data.timestamp = json.result.elements[0].duration.text;
									me.$(".infowindow .timestamp").html(json.result.elements[0].duration.text);
								}
							},
							error: function(err) {
							}
						});

						me.mySquare.addEventListener('click', function(e) {
							//点击导航
							if (me.$el.find('.chrysanthemum').length === 0) {
								me.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div></div>");
							}
							me.goNavigation(data.wgs.split(",")[0], data.wgs.split(",")[1], function() {
								$('.chrysanthemum').remove();
							}, function() {
								$('.chrysanthemum').remove();
							}, json.data[0].name);
						});
						me.map.panTo(marker.getPosition());
					},
					error: function(err) {
						window.sessionStorage.removeItem("histroyIcon");
						Notification.show({
							type: "error",
							message: "获取经销商信息失败"
						});
					}
				});
			},
			hideOverlay: function(e) {
				var me = this;
				me.map.removeOverlay(me.mySquare);
			}
		}); //view define

	});