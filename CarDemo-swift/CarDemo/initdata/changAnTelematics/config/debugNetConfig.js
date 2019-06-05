(function()
{
	var config = {};
	var TURN_ON  = true;
	var TURN_OFF = false;

	var CASE = function(api, on, data, options)
	{
		if(on)
		{
			if(typeof(options) === "string")
			{
				options = {method:options};
			}

			config[api] = {data:data, options:options};
		}
	}
	define(
	[],
	function()
	{
		CASE("/api/drivingChartByType", TURN_ON, function(netParams)
			{
				var type = netParams.data.type;
				var ret  = {};
				if(type === "week")
				{
					ret =
					{
						distance:[10, 20, 30, 13, 15, 0, 300],
						petrol:[10, 20, 30, 13, 15, 0, 100],
						maxVelo:[20, 10, 40, 23, 35, 10, 10],
					}
				}
				else if(type === "month")
				{
					ret =
					{
						distance:[10, 20, 30, 13, 15, 0, 100, 10, 20, 30, 13, 15, 0, 100, 10, 20, 30, 13, 15, 0, 100],
						petrol:[20, 10, 40, 23, 35, 10, 10, 10, 20, 30, 13, 15, 0, 100, 10, 20, 30, 13, 15, 0, 100],
						maxVelo:[20, 10, 40, 23, 35, 10, 10, 10, 20, 30, 13, 15, 0, 100, 10, 20, 30, 13, 15, 0, 100],
					}
				}
				else if(type === "year")
				{
					ret =
					{
						distance:[10, 20, 30, 13, 15, 0, 100, 10, 20, 30, 13, 15],
						petrol:[35, 10, 10, 10, 20, 20, 10, 40, 23,  30, 13, 15 ],
						maxVelo:[20, 10, 40, 23, 30, 13, 15, 35, 10, 10, 10, 20],
					}
				}
				else if(type === "total")
				{
					ret =
					{
						distance:10000,
						petrol:300,
						totalFee:10000,
						maxVelo:210.00,
						averVelo:100.0,
						petrol100:6.8
					}
				}

				return ret;
			});

			CASE("/api/getCarLocation",TURN_OFF,{
				"longitude":'106.555356',
				"latitude":'29.556922',
				"addrDesc":'这是测试的汽车位置~~'
			});
			CASE("/api/user/getNewMesList",TURN_ON,{
				success:true,
				data:[
					{
						"messId":"123",
						"messDate":"2015-2-2 11:11:11",
						"messType":"pw",
						"messDetail":"测试内容1",
						"messTitle":"近期各种诈骗猖獗，大家要小心提防",
						"messImg":"http://img1.imgtn.bdimg.com/it/u=1242215395,2575055316&fm=21&gp=0.jpg"
					},
					{
						"messDate":"2015-2-2 11:11:11",
						"messType":"w",
						"messDetail":"测试内容2",
					},
					{
						"messDate":"2015-2-2 11:17:11",
						"messType":"w",
						"messDetail":"测试内容3",
					}
				]
			});
			CASE("/api/user/getNewMes",TURN_ON,{
				success:true,
				data:[
					{
						"id":'aaaa'
					}
				]
			});
			CASE("/api/user/getNewMesInfo",TURN_ON,{
				success:true,
				data:{
					"messDetail":"测试"
				}
			});
			CASE("/api/car/getIndexDataByVin", TURN_OFF,
				{
					oil : 0.18,
				    battery : 0.09,
				    totalOdometer : 0,
				    oilAvrgCostYesterday : 20.7,
				    feeAvrgCostYesterday : 50.6,
				    stateDescription : 2,
				    carName : "演示车辆2",
    				license : "演示车辆1232",
    				checkTime : "2015.01.01 12:00:00"
				});

			CASE("/api/car/checkPin",TURN_OFF,{
			});

			CASE("/api/getCarStyle",TURN_ON,{
				success:true,
				data:[
					{
						"id":"1",
						"name":"cs75",
					},
					{
						"id":"2",
						"name":"cs35",
					},
					{
						"id":"3",
						"name":"瑞驰",
					}
				]
			});

			CASE("/api/getIndexTotalData", TURN_OFF,
			{
				messageWarning:true,
				carsInfos:
				[
					{
						vin:"0",
						carName:"CS75",
						electricity:1.0,
						petrol:1.0,
						engineOil:1.0,
						lastMaintenanceDate:"2010-11-20",
						carState:0,
					},
					{
						vin:"1",
						carName:"CS35",
						electricity:0.7,
						petrol:0.6,
						engineOil:0.8,
						lastMaintenanceDate:"2010-11-20",
						carState:1,
					},
					{
						vin:"2",
						carName:"长安逸动",
						electricity:0.8,
						petrol:0.3,
						engineOil:0.6,
						lastMaintenanceDate:"2010-11-20",
						carState:1,
					}
				]
			}, "GET");
			CASE("/api/car/getControlInfo",TURN_OFF,function(){
				var val = parseInt(Math.random()*2);
				val = 0;
				return val;
			});

			CASE("/api/getCarList", TURN_OFF,
			{
				"data":[
					{
						vin:"0",
						carName:"CS75",
						carId:"渝A4787",
						lastDate:"2016-4-5",
						ODB_style:"类型A",
						ODB_cod:"874-234",
						img:"img/cs35.jpg",
					},
					{
						vin:"1",
						carName:"CS35",
						carId:"渝C12315",
						lastDate:"2016-4-5",
						ODB_style:"类型A",
						ODB_cod:"874-234",
						img:"img/cs75.jpg",
					},
					{
						vin:"2",
						carName:"长安逸动",
						carId:"粤A5201",
						lastDate:"2016-4-5",
						ODB_style:"类型A",
						ODB_cod:"874-234",
						img:"img/cs75.jpg",
					}
				]
			});
			CASE("/api/getCarInfoById", TURN_OFF,
			{
				"data":[
					{
						vin:"1",
						carName:"瑞驰",
						carId:"逸动",
						lastDate:"2016-4-5",
						ODB_style:"类型A",
						ODB_cod:"874-234",
						img:"img/cs35.jpg",
					}
				]
			});

			CASE("/api/updateCarInfo", TURN_OFF,
			{
				"data":[
					{
						vin:"1",
						name:"瑞驰",
						carId:"逸动",
						lastDate:"2016-4-5",
						ODB_style:"类型A",
						ODB_cod:"874-234",
						img:"img/cs35.jpg",
					}
				]
			});
			CASE("/api/addCarInfo", TURN_OFF,
			{
				"data":[
					{
						vin:"1",
						name:"瑞驰",
						carId:"逸动",
						lastDate:"2016-4-5",
						ODB_style:"类型A",
						ODB_cod:"874-234",
						img:"img/cs35.jpg",
					}
				]
			});

			CASE("/api/testFunc", TURN_ON, function(netParams)
			{
				console.info(netParams.api);
				return {name:"test"};
			});

			CASE("/api/testFile", TURN_ON, "file!../res/data/pv/cars.json");

			CASE("/api/drivingRoute", TURN_ON, "file!../drivingReport/data/drivingRoute.json");

			CASE("/api/showDistributorList", TURN_ON, "file!../applyService/select4s.json");

			CASE("/api/recommendedList", TURN_ON, "file!../applyService/recommended4s.json");
			CASE("/api/getLocationImfor", TURN_ON, "file!../violation/violationResults/location.json");
			CASE("/api/myLocation", TURN_ON, "file!../rank/data/costOil/weakRank.json");
			CASE("/api/InsuranceCompanies", TURN_ON, "file!../sos/resorce.json");
			CASE("/api/getDealerTreeInfoLocal", TURN_ON, "file!../service/data/selectCityData.json");

			CASE("/api/myKilometerWeekRank", TURN_ON, {myRank:10,myDistance:10000});

			CASE("/api/myKilometerMonthRank", TURN_ON, {myRank:20,myDistance:2000});

			CASE("/api/myMaxSpeedWeekRank", TURN_ON,{myRank:100,myMaxSpeed:170});

			CASE("/api/myMaxSpeedMonthRank", TURN_ON,{myRank:200,myMaxSpeed:168});

			CASE("/api/myCostOilWeekRank", TURN_ON,{myRank:40,myCostOil:5000});

			CASE("/api/myCostOilMonthRank", TURN_ON,{myRank:60,myCostOil:80000});

			CASE("/api/myDrivingNumWeekRank", TURN_ON,{myRank:30,myDrivingNum:4000});

			CASE("/api/myDrivingNumMonthRank", TURN_ON,{myRank:20,myDrivingNum:8000});


			CASE("/api/myBadBehaviorWeekRank", TURN_ON,{myRank:50,myBadBehavior:30});

			CASE("/api/myBadBehaviorMonthRank", TURN_ON,{myRank:20,myBadBehavior:40});

			CASE("/api/getHomeData", TURN_ON,{name:"hello"});
			CASE("/api/myInsuranceCompany", TURN_ON,{
				"success": true,
				"code":2,
				"data":[
					{
						"name":"太平保险",
						"telphone":"12345678"
					}
				]
			});
			CASE("/api/getServiceMessage", TURN_ON,{
				"data":[
					{
						"content":"亲，您的服务已受理，请等待后续进展"
					},
					{
						"content":"维修车已出发，快去看看到哪儿了"
					}
				]
			});

			CASE("/api/getMessage", TURN_ON,{
				"data":[
					{
						"id":"服务消息详情",
						"time":"2014-3-4",
						"des":"亲，系统检测到您的电量不足，请检测线路。",
						"state":"1"
					}
				]
			});

			CASE("/api/getDrivingBehaviorToday", TURN_ON,{
				"data":[
					{
						"drivingTime": "205",
				   	 	"HardAcceleration":"2",
				   	 	"RapidDeceleration":"5",
				   	 	"Speeding":"1",
				   	 	"Uturn":"0",
				   	 	"MaximumSpeed":"120",
				   	 	"time":"2015-09-02 15:22",
				   	 	"distance":"35.3",
				   	 	"score":"1"
					},
					{
						"drivingTime": "100",
				   	 	"HardAcceleration":"3",
				   	 	"RapidDeceleration":"2",
				   	 	"Speeding":"4",
				   	 	"Uturn":"0",
				   	 	"MaximumSpeed":"130",
				   	 	"time":"2015-09-02 15:22",
				   	 	"distance":"38",
				   	 	"score":"5"
				   	 }
				],
			});

			CASE("/api/getDrivingReport", TURN_ON,{
				"data":[
					{
						"totalKilometer": "66",
				   	 	"price":"112.0",
				   	 	"costTime":"200",
				   	 	"costOil":"34"
					}
				]
			});

			CASE("/api/getDrivingTrajectory", TURN_ON,{
				"data":[
					{
						"fee":"100.5",
						"avrgSpeed":"120.5",
						"costTime":"200",
						"costOil":"34",
						"startAddr":"观音桥",
						"endAddr":"渝北区空港机场",
						"acc":"120",
						"dec":"122",
						"turn":"122",
						"speeding":"122",
						"score":"100",
						"scoreLevel":"优秀",
						"startPos":"106.521436,29.532288",
						"endPos":"108.983569,34.285675",
					},
					{
						"fee":"200.5",
						"avrgSpeed":"120.5",
						"costTime":"200",
						"costOil":"34",
						"startAddr":"观音桥",
						"endAddr":"渝北区空港机场",
						"acc":"120",
						"dec":"122",
						"turn":"122",
						"speeding":"122",
						"score":"80",
						"scoreLevel":"良好",
						"startPos":"102.521436,29.532288",
						"endPos":"104.983569,34.285675",
					},
					{
						"fee":"300.5",
						"avrgSpeed":"120.5",
						"costTime":"200",
						"costOil":"34",
						"startAddr":"观音桥",
						"endAddr":"渝北区空港机场",
						"acc":"0",
						"dec":"12",
						"turn":"12",
						"speeding":"12",
						"score":"40",
						"scoreLevel":"差",
						"startPos":"108.521436,29.532288",
						"endPos":"103.983569,34.285675",
					}
				]
			});

			// CASE("/api/queryFaultByVin",TURN_OFF,{
			// 	"testId":"2",
			// 	"score":"88",
			// 	"data":[
			// 	{
			// 		"pid":"3c8f772f412846eb8f12588221bd7a0c",
			// 		"child":[
			// 			{
			//                 "id":"fd297da8967c45eb9ceddb3c17371295",
			//                 "code":"12315",
			//                 "name":"前雾灯工作状态",
			//                 "desc":"frontFoglamp",
			//                 "":"",
			//                 "":"",
			//                 "status":"1"
			//             },
			// 			{
			//                 "id":"e92787c31a63424a943561917d2d0708",
			//                 "code":"324234",
			//                 "name":"后雾灯工作状态",
			//                 "desc":"rearFoglamp",
			//                 "status":"2"
			//             },
			// 			{
			//                 "id":"d9d62e167e854c0086d0acc27e392acd",
			//                 "code":"324234",
			//                 "name":"左转向灯信号",
			//                 "desc":"turnLndicatorLeft",
			//                 "status":"2"
			//             }
			// 		],
			// 	    "action":[
			// 	    	{"name":"咨询专家","url":"www.baidu.com"},
			// 	    	{"name":"问车友","url":"www.baidu.com"},
			// 	    	{"name":"去维修","url":"www.baidu.com"}
			// 	    ]
			// 	},
			// 	{
			// 		"pid":"ca6339e97c7148c4bd4f5ba9a7f04f4a",
			// 		"child":[
			// 			{
			//                 "id":"47e8055893c94e0eb79b93da5458f63f",
			//                 "code":"324234",
			//                 "name":"左前胎压",
			//                 "desc":"lfTyrePressure",
			//                 "status":"1"
			//             },
			// 			{
			//                 "id":"d33240a56a7b4d469814cebfed452555",
			//                 "code":"324234",
			//                 "name":"左后胎压",
			//                 "desc":"lrTyrePressure",
			//                 "status":"2"
			//             },
			// 			{
			//                 "id":"c995344a98904000a6de6e1be5754aae",
			//                 "code":"324234",
			//                 "name":"右前胎压",
			//                 "desc":"rfTyrePressure",
			//                 "status":"2"
			//             }
			// 		],
			// 	    "action":[
			// 	    	{"name":"咨询专家","url":"www.baidu.com"},
			// 	    	{"name":"问车友","url":"www.baidu.com"},
			// 	    	{"name":"去加油","url":"www.baidu.com"}
			// 	    ]
			// 	}
			// ]});

			CASE("/api/getCarTestInfo",TURN_OFF,{
				"score":"75",
				"date":"2015-5-5",
				"data":[{
					"name":'机油压力低，余量10%，请停车熄火',
					"desc":'啦啦啦啦啦',
					"code":"12315",
					"level" : "3.5",
					"solve":"去加油",
					"status":"0",
					"url":"http://www.baidu.com/s&wd=车灯故障,http://www.baidu.com/s&wd=车灯故障",
					"action" : "去维修,咨询专家",
					"dValue" : "20",
					"nValue" : "0~5",
					"suggest" : "添加汽油",
				},{
					"name":'机油压力低，余量10%，请停车熄火',
					"desc":'啦啦啦啦啦',
					"code":"12315",
					"level" : "3.5",
					"solve":"去加油",
					"status":"1",
					"url":"http://www.baidu.com/s&wd=车灯故障,http://www.baidu.com/s&wd=车灯故障",
					"action" : "去维修,咨询专家",
					"dValue" : "20",
					"nValue" : "0~5",
					"suggest" : "添加汽油",
				},{
					"name":'机油压力低，余量10%，请停车熄火',
					"desc":'啦啦啦啦啦',
					"code":"12315",
					"level" : "3.5",
					"status":"2",
					"url":"http://www.baidu.com/s&wd=车灯故障,http://www.baidu.com/s&wd=车灯故障",
					"action" : "去维修,咨询专家",
					"dValue" : "20",
					"nValue" : "0~5",
					"suggest" : "添加汽油",
				},{
					"name":'机油压力低，余量10%，请停车熄火',
					"desc":'啦啦啦啦啦',
					"code":"12315",
					"level" : "3.5",
					"status":"2",
					"url":"http://www.baidu.com/s&wd=车灯故障,http://www.baidu.com/s&wd=车灯故障",
					"action" : "去维修,咨询专家",
					"dValue" : "20",
					"nValue" : "0~5",
					"suggest" : "添加汽油",
				},]
			});

			CASE("/api/getAllCheckItem", TURN_OFF,[
				  {
				    "id":'1',
				    "name":"发动机系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  },
				  {
				    "id":'2',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  },
				  {
				    "id":'3',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  },
				  {
				    "id":'4',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  },
				  {
				    "id":'5',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  },
				  {
				    "id":'6',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'7',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'8',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'9',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'10',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'11',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'12',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				  ,{
				    "id":'13',
				    "name":"ODB系统",
				    "code":"321",
				    "child":[
				              {
				                "id":"3242",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              },
				              {
				                "id":"3245",
				                "code":"324234",
				                "name":"机油压力",
				                "desc":"机油压力正常",
				              }
				            ]
				  }
				]);

			CASE("/api/getService", TURN_OFF,function(){
				var arr = ['主动维修','预约服务','紧急救援'];
				var index = parseInt(Math.random()*3)
			return {
				"id":"服务详情1",
				"order_id":"10000",
				"service_style":arr[index],
				"style_kind":"保养",
				"s":"长安直修",
				"door":"是",
				"repair_id":"123",
				"details":"长时间没有保养，去做保养",
				"time":"2014-3-4",
				"des":"亲，你的服务已经受理",
				"list":[{'state':'0','date':'2015-5-4 09:00','words':'接到订单，受理服务'},{'state':'1','date':'2015-5-4 09:00','words':'维修车已出发'},{'state':'2','date':'2015-5-4 09:00','words':'服务已经完成'}]
				};
			});

			CASE("/api/getRepairCarById", TURN_ON,{
				"data":[{
					'id':'100'
				}]
			});

			CASE('/api/getMaintenanceDetail', TURN_ON,
			{
				"data":"AAAAAAAAAAAAAAA"
			});

			CASE('/api/getCityList', TURN_OFF,{
				"data":[{"returncode":0,"message":"获取配置成功","result":{"items":[{"cityid":340100,"cityname":"合肥","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340200,"cityname":"芜湖","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340300,"cityname":"蚌埠","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340400,"cityname":"淮南","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340500,"cityname":"马鞍山","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340600,"cityname":"淮北","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340700,"cityname":"铜陵","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":340800,"cityname":"安庆","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341000,"cityname":"黄山","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341100,"cityname":"滁州","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341200,"cityname":"阜阳","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341300,"cityname":"宿州","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341400,"cityname":"巢湖","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341500,"cityname":"六安","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"皖N","registernumlen":0,"supportoversize":1},{"cityid":341600,"cityname":"亳州","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341700,"cityname":"池州","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":341800,"cityname":"宣城","parentid":340000,"provincename":"安徽","enginenumlen":0,"framenumlen":6,"firstletter":"A","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":110100,"cityname":"北京","parentid":110000,"provincename":"北京","enginenumlen":99,"framenumlen":0,"firstletter":"B","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":500100,"cityname":"重庆","parentid":500000,"provincename":"重庆","enginenumlen":0,"framenumlen":6,"firstletter":"C","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350100,"cityname":"福州","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350200,"cityname":"厦门","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":6,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350300,"cityname":"莆田","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350400,"cityname":"三明","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350500,"cityname":"泉州","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350600,"cityname":"漳州","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350700,"cityname":"南平","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350800,"cityname":"龙岩","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":350900,"cityname":"宁德","parentid":350000,"provincename":"福建","enginenumlen":0,"framenumlen":4,"firstletter":"F","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":440100,"cityname":"广州","parentid":440000,"provincename":"广东","enginenumlen":4,"framenumlen":6,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":440300,"cityname":"深圳","parentid":440000,"provincename":"广东","enginenumlen":0,"framenumlen":4,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":440400,"cityname":"珠海","parentid":440000,"provincename":"广东","enginenumlen":4,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":440700,"cityname":"江门","parentid":440000,"provincename":"广东","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":441300,"cityname":"惠州","parentid":440000,"provincename":"广东","enginenumlen":4,"framenumlen":6,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":442000,"cityname":"中山","parentid":440000,"provincename":"广东","enginenumlen":0,"framenumlen":4,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":445100,"cityname":"潮州","parentid":440000,"provincename":"广东","enginenumlen":0,"framenumlen":6,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":520100,"cityname":"贵阳","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":520200,"cityname":"六盘水","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":520300,"cityname":"遵义","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":520400,"cityname":"安顺","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":522200,"cityname":"铜仁","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":522300,"cityname":"黔西南","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":522400,"cityname":"毕节","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":522600,"cityname":"黔东南","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":522700,"cityname":"黔南","parentid":520000,"provincename":"贵州","enginenumlen":6,"framenumlen":0,"firstletter":"G","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":620100,"cityname":"兰州","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620200,"cityname":"嘉峪关","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620300,"cityname":"金昌","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620400,"cityname":"白银","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620500,"cityname":"天水","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620600,"cityname":"武威","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620700,"cityname":"张掖","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620800,"cityname":"平凉","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":620900,"cityname":"酒泉","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":621000,"cityname":"庆阳","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":621100,"cityname":"定西","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":621200,"cityname":"陇南","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":622900,"cityname":"临夏","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":623000,"cityname":"甘南","parentid":620000,"provincename":"甘肃","enginenumlen":0,"framenumlen":99,"firstletter":"G","support":1,"loginurl":"","supportnum":"甘","registernumlen":0,"supportoversize":1},{"cityid":460100,"cityname":"海口","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":460200,"cityname":"三亚","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461100,"cityname":"五指山","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461200,"cityname":"琼海","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461300,"cityname":"儋州","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461400,"cityname":"文昌","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461500,"cityname":"万宁","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461600,"cityname":"东方","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461700,"cityname":"定安","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461800,"cityname":"屯昌","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":461900,"cityname":"澄迈","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462000,"cityname":"临高","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462100,"cityname":"白沙","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462200,"cityname":"昌江","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462300,"cityname":"乐东","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462400,"cityname":"陵水","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462500,"cityname":"保亭","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":462600,"cityname":"琼中","parentid":460000,"provincename":"海南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410100,"cityname":"郑州","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410200,"cityname":"开封","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410300,"cityname":"洛阳","parentid":410000,"provincename":"河南","enginenumlen":99,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410400,"cityname":"平顶山","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410500,"cityname":"安阳","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410600,"cityname":"鹤壁","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410700,"cityname":"新乡","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410800,"cityname":"焦作","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":410900,"cityname":"濮阳","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411000,"cityname":"许昌","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411100,"cityname":"漯河","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411200,"cityname":"三门峡","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411300,"cityname":"南阳","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411400,"cityname":"商丘","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411500,"cityname":"信阳","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411600,"cityname":"周口","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":411700,"cityname":"驻马店","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":419000,"cityname":"济源","parentid":410000,"provincename":"河南","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420100,"cityname":"武汉","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":6,"firstletter":"H","support":1,"loginurl":"","supportnum":"鄂A","registernumlen":0,"supportoversize":1},{"cityid":420200,"cityname":"黄石","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420300,"cityname":"十堰","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420500,"cityname":"宜昌","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420600,"cityname":"襄阳","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420700,"cityname":"鄂州","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420800,"cityname":"荆门","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":420900,"cityname":"孝感","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":421000,"cityname":"荆州","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":421100,"cityname":"黄冈","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":421200,"cityname":"咸宁","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":421300,"cityname":"随州","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":422800,"cityname":"恩施","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":423100,"cityname":"仙桃","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":423200,"cityname":"潜江","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":423300,"cityname":"天门","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":423400,"cityname":"神农架","parentid":420000,"provincename":"湖北","enginenumlen":0,"framenumlen":5,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430200,"cityname":"株洲","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430300,"cityname":"湘潭","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430400,"cityname":"衡阳","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430500,"cityname":"邵阳","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430600,"cityname":"岳阳","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430700,"cityname":"常德","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430800,"cityname":"张家界","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":430900,"cityname":"益阳","parentid":430000,"provincename":"湖南","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":431000,"cityname":"郴州","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":431100,"cityname":"永州","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":431200,"cityname":"怀化","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":431300,"cityname":"娄底","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":433100,"cityname":"湘西","parentid":430000,"provincename":"湖南","enginenumlen":6,"framenumlen":0,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130100,"cityname":"石家庄","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130200,"cityname":"唐山","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130300,"cityname":"秦皇岛","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130400,"cityname":"邯郸","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130500,"cityname":"邢台","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130600,"cityname":"保定","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130700,"cityname":"张家口","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130800,"cityname":"承德","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":130900,"cityname":"沧州","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":131000,"cityname":"廊坊","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":131100,"cityname":"衡水","parentid":130000,"provincename":"河北","enginenumlen":0,"framenumlen":4,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230100,"cityname":"哈尔滨","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230200,"cityname":"齐齐哈尔","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230300,"cityname":"鸡西","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230400,"cityname":"鹤岗","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230500,"cityname":"双鸭山","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230600,"cityname":"大庆","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230700,"cityname":"伊春","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230800,"cityname":"佳木斯","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":230900,"cityname":"七台河","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":231000,"cityname":"牡丹江","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":231100,"cityname":"黑河","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":231200,"cityname":"绥化","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":232700,"cityname":"大兴安岭","parentid":230000,"provincename":"黑龙江","enginenumlen":0,"framenumlen":99,"firstletter":"H","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320100,"cityname":"南京","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320200,"cityname":"无锡","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320300,"cityname":"徐州","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320400,"cityname":"常州","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"苏D","registernumlen":0,"supportoversize":1},{"cityid":320500,"cityname":"苏州","parentid":320000,"provincename":"江苏","enginenumlen":0,"framenumlen":99,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320600,"cityname":"南通","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320700,"cityname":"连云港","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320800,"cityname":"淮安","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":320900,"cityname":"盐城","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":321000,"cityname":"扬州","parentid":320000,"provincename":"江苏","enginenumlen":0,"framenumlen":6,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":321100,"cityname":"镇江","parentid":320000,"provincename":"江苏","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":321200,"cityname":"泰州","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":321300,"cityname":"宿迁","parentid":320000,"provincename":"江苏","enginenumlen":6,"framenumlen":0,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220100,"cityname":"长春","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220200,"cityname":"吉林","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220300,"cityname":"四平","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220400,"cityname":"辽源","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220500,"cityname":"通化","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220600,"cityname":"白山","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220700,"cityname":"松原","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":220800,"cityname":"白城","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":222400,"cityname":"延边","parentid":220000,"provincename":"吉林","enginenumlen":0,"framenumlen":4,"firstletter":"J","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210100,"cityname":"沈阳","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210200,"cityname":"大连","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210300,"cityname":"鞍山","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210400,"cityname":"抚顺","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210500,"cityname":"本溪","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210600,"cityname":"丹东","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210700,"cityname":"锦州","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":6,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210800,"cityname":"营口","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":99,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":210900,"cityname":"阜新","parentid":210000,"provincename":"辽宁","enginenumlen":99,"framenumlen":0,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":211000,"cityname":"辽阳","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":211100,"cityname":"盘锦","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":4,"firstletter":"L","support":1,"loginurl":"","supportnum":"辽L","registernumlen":0,"supportoversize":1},{"cityid":211200,"cityname":"铁岭","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":0,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":211300,"cityname":"朝阳","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":0,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":211400,"cityname":"葫芦岛","parentid":210000,"provincename":"辽宁","enginenumlen":0,"framenumlen":99,"firstletter":"L","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150100,"cityname":"呼和浩特","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150200,"cityname":"包头","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150300,"cityname":"乌海","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150400,"cityname":"赤峰","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150500,"cityname":"通辽","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150600,"cityname":"鄂尔多斯","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150700,"cityname":"呼伦贝尔","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150800,"cityname":"巴彦淖尔","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":150900,"cityname":"乌兰察布","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":152200,"cityname":"兴安盟","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":152500,"cityname":"锡林郭勒盟","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":152900,"cityname":"阿拉善盟","parentid":150000,"provincename":"内蒙古","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":640100,"cityname":"银川","parentid":640000,"provincename":"宁夏","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":640200,"cityname":"石嘴山","parentid":640000,"provincename":"宁夏","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":640300,"cityname":"吴忠","parentid":640000,"provincename":"宁夏","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":640400,"cityname":"固原","parentid":640000,"provincename":"宁夏","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":640500,"cityname":"中卫","parentid":640000,"provincename":"宁夏","enginenumlen":0,"framenumlen":6,"firstletter":"N","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":630100,"cityname":"西宁","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632100,"cityname":"海东","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632200,"cityname":"海北","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632300,"cityname":"黄南","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632500,"cityname":"海南","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632600,"cityname":"果洛","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632700,"cityname":"玉树","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":632800,"cityname":"海西","parentid":630000,"provincename":"青海","enginenumlen":0,"framenumlen":99,"firstletter":"Q","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":610100,"cityname":"西安","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":0,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610200,"cityname":"铜川","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610300,"cityname":"宝鸡","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610400,"cityname":"咸阳","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610500,"cityname":"渭南","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610600,"cityname":"延安","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610700,"cityname":"汉中","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610800,"cityname":"榆林","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":610900,"cityname":"安康","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":611000,"cityname":"商洛","parentid":610000,"provincename":"陕西","enginenumlen":99,"framenumlen":99,"firstletter":"S","support":1,"loginurl":"","supportnum":"陕","registernumlen":0,"supportoversize":1},{"cityid":510100,"cityname":"成都","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":8,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510300,"cityname":"自贡","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510400,"cityname":"攀枝花","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510500,"cityname":"泸州","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510600,"cityname":"德阳","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510700,"cityname":"绵阳","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510800,"cityname":"广元","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":510900,"cityname":"遂宁","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511000,"cityname":"内江","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511100,"cityname":"乐山","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511300,"cityname":"南充","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511400,"cityname":"眉山","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511500,"cityname":"宜宾","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511600,"cityname":"广安","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511700,"cityname":"达州","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511800,"cityname":"雅安","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":511900,"cityname":"巴中","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":512000,"cityname":"资阳","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":513200,"cityname":"阿坝","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":513300,"cityname":"甘孜","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":513400,"cityname":"凉山","parentid":510000,"provincename":"四川","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":310100,"cityname":"上海","parentid":310000,"provincename":"上海","enginenumlen":99,"framenumlen":0,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140100,"cityname":"太原","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140200,"cityname":"大同","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140300,"cityname":"阳泉","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140400,"cityname":"长治","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140500,"cityname":"晋城","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140600,"cityname":"朔州","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140700,"cityname":"晋中","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140800,"cityname":"运城","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":140900,"cityname":"忻州","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":141000,"cityname":"临汾","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":141100,"cityname":"吕梁","parentid":140000,"provincename":"山西","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370100,"cityname":"济南","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370200,"cityname":"青岛","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"鲁B,鲁U","registernumlen":0,"supportoversize":1},{"cityid":370300,"cityname":"淄博","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370400,"cityname":"枣庄","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370500,"cityname":"东营","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370600,"cityname":"烟台","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":4,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370700,"cityname":"潍坊","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":17,"firstletter":"S","support":1,"loginurl":"","supportnum":"鲁G,鲁V","registernumlen":0,"supportoversize":1},{"cityid":370800,"cityname":"济宁","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":370900,"cityname":"泰安","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"鲁J","registernumlen":0,"supportoversize":1},{"cityid":371000,"cityname":"威海","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":4,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":371100,"cityname":"日照","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"鲁L","registernumlen":0,"supportoversize":1},{"cityid":371200,"cityname":"莱芜","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":371300,"cityname":"临沂","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":371400,"cityname":"德州","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":371500,"cityname":"聊城","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"鲁P","registernumlen":0,"supportoversize":1},{"cityid":371600,"cityname":"滨州","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"鲁M","registernumlen":0,"supportoversize":1},{"cityid":371700,"cityname":"菏泽","parentid":370000,"provincename":"山东","enginenumlen":0,"framenumlen":6,"firstletter":"S","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":650100,"cityname":"乌鲁木齐","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":650200,"cityname":"克拉玛依","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":652100,"cityname":"吐鲁番","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":652200,"cityname":"哈密","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":652300,"cityname":"昌吉","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":652700,"cityname":"博尔塔拉","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":652800,"cityname":"巴音郭楞","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":652900,"cityname":"阿克苏","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":653000,"cityname":"克孜勒苏","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":653100,"cityname":"喀什","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":653200,"cityname":"和田","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":654000,"cityname":"伊犁","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":654200,"cityname":"塔城","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":654300,"cityname":"阿勒泰","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":654500,"cityname":"奎屯","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":655100,"cityname":"石河子","parentid":650000,"provincename":"新疆","enginenumlen":0,"framenumlen":4,"firstletter":"X","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":540100,"cityname":"拉萨","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":542100,"cityname":"昌都","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":542200,"cityname":"山南","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":542300,"cityname":"日喀则","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":542400,"cityname":"那曲","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":542500,"cityname":"阿里","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":542600,"cityname":"林芝","parentid":540000,"provincename":"西藏","enginenumlen":0,"framenumlen":0,"firstletter":"X","support":0,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":0},{"cityid":530100,"cityname":"昆明","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530300,"cityname":"曲靖","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530400,"cityname":"玉溪","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530500,"cityname":"保山","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530600,"cityname":"昭通","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530700,"cityname":"丽江","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530800,"cityname":"普洱","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":530900,"cityname":"临沧","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":532300,"cityname":"楚雄","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":532500,"cityname":"红河","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":532600,"cityname":"文山","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":532800,"cityname":"西双版纳","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":532900,"cityname":"大理","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":533100,"cityname":"德宏","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":533300,"cityname":"怒江","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":533400,"cityname":"迪庆","parentid":530000,"provincename":"云南","enginenumlen":0,"framenumlen":4,"firstletter":"Y","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330100,"cityname":"杭州","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330200,"cityname":"宁波","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330300,"cityname":"温州","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330400,"cityname":"嘉兴","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330500,"cityname":"湖州","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330600,"cityname":"绍兴","parentid":330000,"provincename":"浙江","enginenumlen":6,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330700,"cityname":"金华","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":3,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330800,"cityname":"衢州","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":330900,"cityname":"舟山","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":331000,"cityname":"台州","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1},{"cityid":331100,"cityname":"丽水","parentid":330000,"provincename":"浙江","enginenumlen":0,"framenumlen":6,"firstletter":"Z","support":1,"loginurl":"","supportnum":"","registernumlen":0,"supportoversize":1}]}}]
			});

			CASE('/api/getCarWarn', TURN_OFF,{
				"data":[{
					'cityid':"500100",
					'platenum':"渝C12315",
					'enginenumber':"123456",
					'framenumber':"123456"
				}]
			});

		CASE('/ctapi/activeDestination', TURN_OFF, {
			"data":{
				"code":"0"
			}
		});

		CASE("/api/getIntroductionInfoById", TURN_ON, {
			'html':'<h4>车窗开启</h4><p style="line-height:200%;">采用H.264编码格式，压缩比高，图像清晰;GPS定位功能可以压缩到录像资料里面，在回放的同时可以看到当时车速，还可以实现超速报警，刹车，转向，经纬度，显示，抓拍等功能。使用SD卡为储存介质，读取数据方便、快捷。</p><p style="line-height:200%;">采用H.264编码格式，压缩比高，图像清晰;GPS定位功能可以压缩到录像资料里面，在回放的同时可以看到当时车速，还可以实现超速报警，刹车，转向，经纬度，显示，抓拍等功能。使用SD卡为储存介质，读取数据方便、快捷。</p>'
		});

		CASE('/api/getChildList', TURN_ON, [
				 {'id':'1','value':'油量正常'}
				,{'id':'2','value':'动力系统'}
				,{'id':'3','value':'电器设备'}
				,{'id':'4','value':'制动系统'}
				,{'id':'5','value':'启动系统'},
		]);
		CASE('/ctapi/getDestinations',TURN_OFF,
			[
					{'addrWGS':'106.576278,29.53232','addrName':"南坪0",'id':'1'},
					{'addrWGS':'106.576179,29.532981','addrName':"南坪1",'id':'2'},
					{'addrWGS':'106.577126,29.529529','addrName':"南坪2",'id':'3'},
					{'addrWGS':'106.576813,29.535186','addrName':"南坪3",'id':'4'},
					{'addrWGS':'106.570079,29.530608','addrName':"南坪4",'id':'5'},
					{'addrWGS':'106.572512,29.521872','addrName':"南坪5",'id':'6'},
					{'addrWGS':'106.564788,29.52983','addrName':"南坪6",'id':'7'},
			]
		);
		CASE('/ctapi/addDestination',TURN_OFF,{
			"data":[
				{'code':'0'}
			]
		});
		CASE('/ctapi/delDestination',TURN_OFF,{
			"data":[
				{'code':'0'}
			]
		});
		CASE('/api/getUnReadMes',TURN_ON,{
			mes1:2,
			mes2:3,
			mes3:4,
			mes4:3,
			mes5:5,
		});
		CASE('/api/controlCar',TURN_OFF,{
			"id":"1",
			"respStatus":"OK",
			"errorCode":null,
			"errorDesc":null
		});
		CASE('/api/queryFaultByVin',TURN_OFF,{
			"score":'',
			"data":[],
			"carStateDescription":'-1'
		});
		CASE('/api/getControlStatus',TURN_OFF,{
			"door":"0",
			"air":{"status":"0"},
			"light":'0',
			"window":"0"
		});
		CASE('/api/getToolsList', TURN_ON, [{
				'id':"1",
				'value':"一键体检",
				'child':[,]
			},{
				'id':"2",
				'value':"预约服务",
				'child':[{'id':'6','value':'油量正常'},{'id':'6','value':'动力系统'},{'id':'8','value':'电器设备'},{'id':'9','value':'制动系统'},{'id':'10','value':'启动系统'},]
			},{
				'id':"3",
				'value':"远程控制",
				'child':[{'id':'11','value':'点火开启'},{'id':'12','value':'车窗开启'},{'id':'13','value':'车门开启'},{'id':'14','value':'天窗开启'},{'id':'15','value':'空调开启'},]
			},{
				'id':"4",
				'value':"自主导航",
				'child':[{'id':'16','value':'油量正常'},{'id':'17','value':'动力系统'},{'id':'18','value':'电器设备'},{'id':'19','value':'制动系统'},{'id':'20','value':'启动系统'},]
			},
			{
				'id':"5",
				'value':"行程报告",
				'child':[{'id':'21','value':'油量正常'},{'id':'22','value':'动力系统'},{'id':'23','value':'电器设备'},{'id':'24','value':'制动系统'},{'id':'25','value':'启动系统'},]
			},{
				'id':"6",
				'value':"驾驶行为",
				'child':[{'id':'26','value':'油量正常'},{'id':'27','value':'动力系统'},{'id':'28','value':'电器设备'},{'id':'29','value':'制动系统'},{'id':'30','value':'启动系统'},]
			},{
				'id':"7",
				'value':"服务提醒",
				'child':[{'id':'31','value':'油量正常'},{'id':'32','value':'动力系统'},{'id':'33','value':'电器设备'},{'id':'34','value':'制动系统'},{'id':'35','value':'启动系统'},]
			},{
				'id':"8",
				'value':"智能遥控",
				'child':[{'id':'36','value':'油量正常'},{'id':'37','value':'动力系统'},{'id':'38','value':'电器设备'},{'id':'39','value':'制动系统'},{'id':'40','value':'启动系统'},]
			},{
				'id':"9",
				'value':"基本设置",
				'child':[{'id':'41','value':'油量正常'},{'id':'42','value':'动力系统'},{'id':'43','value':'电器设备'},{'id':'44','value':'制动系统'},{'id':'45','value':'启动系统'},]
			},]);
		CASE("/api/validatePassword", TURN_OFF, {}, "POST");
		CASE("/api/updatePasswordBytoken", TURN_OFF, {}, "POST");
		CASE("/api/getCarTestHistory", TURN_OFF,
		[
			{
				id:"1001",
				date:"2015-01-01",
				time:"12:00:00",
				score:"10",
				faultCount:1,
				riskCount:2,
				normalCount:10,
			},
			{
				id:"1001",
				date:"2015-01-01",
				time:"12:00:00",
				score:"10",
				faultCount:1,
				riskCount:2,
				normalCount:10,
			},
			{
				id:"1001",
				date:"2015-01-01",
				time:"12:00:00",
				score:"10",
				faultCount:1,
				riskCount:2,
				normalCount:10,
			},
			{
				id:"1001",
				date:"2015-01-01",
				time:"12:00:00",
				score:"10",
				faultCount:1,
				riskCount:2,
				normalCount:10,
			},
			{
				date:"2015-01-01",
				time:"12:00:00",

				id:"1001",
				score:"10",
				faultCount:1,
				riskCount:2,
				normalCount:10,
			},
			{
				id:"1001",
				date:"2015-01-01",
				time:"12:00:00",
				score:"10",
				faultCount:1,
				riskCount:2,
				normalCount:10,
			}
		],
		"GET");

		return config;
	}
	);
}());
