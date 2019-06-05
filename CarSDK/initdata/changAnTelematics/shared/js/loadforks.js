define([],function() {

	var Forks = function() {};

	var enableForkPushNotification = false;
	var unDelivedLastNotification;	// 如果enableForkPushNotification置为false,会保留最后一条推送消息

	var registeInfo;

	/*
	 * 加载模块根目录下的fork.js文件，业务模块在该文件中注册PushNotificationArrived事件监听
	 */
	Forks.prototype.loadForks = function(complete) {
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		if(!window.device || !window.requestFileSystem)
			return;
        var type=window.device.platform=="iOS"?LocalFileSystem.PERSISTENT:3;
		window.requestFileSystem(type, 0, function(fs) {
			var rootDir = window.device.platform == "iOS" ? "/app/" : "app/" ;
			var replaceDir = "/app/" ;
//			console.log('Load Forks.........'); 
				fs.root.getDirectory(rootDir, { create: false }, function(dirEntry){
                console.log('Load Forks:'+JSON.stringify(dirEntry)); 
				var loadModules = function(modules) {
					if(modules.length > 0) {
						console.log('load fork modules');
						require(modules, complete || function() {});
					}else if(complete) {
						complete();
					}
				};

				dirEntry.createReader().readEntries(function(entries){
					var modules = [];
					var cnt = 0;
					var total = entries.length;
					var checkLoad = function(n) {
						if(n == total)
							loadModules(modules);
					};
					for(var i=0,len=entries.length; i<len; i++) {
						if(entries[i].isDirectory) {
							entries[i].getFile('fork.js', { create: false }, function(entry) {
								console.log(entry.fullPath);
								modules.push(entry.fullPath.replace(replaceDir,'../'));
								checkLoad(++cnt);
							}, function() {
								checkLoad(++cnt);
							});
						}else {
							checkLoad(++cnt);
						} 
		    		}
				},function() {
					console.log('loadforks: readEntries error.');
				});
				}, function(e) {
					console.log('loadForks: get app dir error.')
				});
		});
	};

	//回执消息
	var receiptMessage = function(id) {
		var url = "http://m.changan.com.cn/push/api/receipts";
		$.ajax({
			url: url,
			data: {
				deviceId: registeInfo.deviceId,
				msgId: id,
				appId: '2020a908af6c0ddc21795f50c482a641'
			},
			method: 'PUT',
			contentType: 'application/x-www-form-urlencoded',
			success: function(data) {
				console.log('消息回执成功:' + id);
			}
		});	
	};

	var checkInChameleonForIOS = function(result) {
		if(device.platform == "iOS") {
			var data = {
	    		'deviceId': result.deviceId,
	    		'appId': "2020a908af6c0ddc21795f50c482a641",
	    		'pushToken': result.deviceToken,
	    		'channelId': 'apns', //'apns_sandbox',
	    		'deviceName': result.deviceName,
	    		'osName': 'iOS',
	    		'osVersion': result.deviceSystemVersion,
	    		'tags':[{"key": "platform","value": 'iOS'}]
	    	};
	    	$.ajax({
	    		url: "http://m.changan.com.cn/push/api/checkinservice/checkins",
	    		method: 'PUT',
	    		data: JSON.stringify(data),
	    		contentType: 'application/json',
	    		success: function(data) {
	    			console.log('设备签到成功');
	    		},
	    		error: function() {
	    			console.log('签到失败');
	    		}
	    	});
		}
	};

	var fetchMessage = function(msg, callback) {
		var appid = "2020a908af6c0ddc21795f50c482a641";
		var url = "http://m.changan.com.cn/push/api/push-msgs/" + appid + "/" + msg.id;
		$.ajax({
			url: url,
			method: 'POST',
			success: function(data) {
				console.log('fetchMessage:');
				console.log(data);
				var message = _.extend(msg, data);
				if(callback) callback(message);
			}
		});	
	};

	var dispatchMessageToModules = function(isBackground, msg) {
		if(enableForkPushNotification) {
			console.log('from bar:' + isBackground + '\n' + 'msg:' + msg);
			Backbone.trigger('PushNotificationArrived', arguments);
		}else {
			unDelivedLastNotification = { 'isBackground': isBackground, 'msg': msg };
		}
	};

	/*
	 * 原生层收到推送消息会调用改函数
	 */
	Forks.prototype.handlePushNotifications = function(isBackground, msg) {
		/*if(msg && msg.id && device.platform == "iOS") {
			receiptMessage(msg.id);
			fetchMessage(msg, function(newmsg) {
				dispatchMessageToModules(isBackground, newmsg);
			});
		}else*/ { 
			dispatchMessageToModules(isBackground, msg);
		}
	};

	Forks.prototype.setEnableForkPushNotification = function(enabled, delivedLastNotification) {
		enableForkPushNotification = enabled;
		if(enabled && delivedLastNotification && unDelivedLastNotification) {
			var notif = unDelivedLastNotification;
			unDelivedLastNotification = null;
			this.handlePushNotifications(notif.isBackground, notif.msg);
		}
	};

	Forks.prototype.getEnableForkPushNotification = function()
	{
		return enableForkPushNotification;
	}

	if(window.plugins && window.plugins.pushNotification && !window.forksLoader) {
		var options = {};
		if(window.device.platform == "iOS")
			options = {
						'badge':true,
						'sound':true,
						'alert':true,
						'ecb':'window.forksLoader.handlePushNotifications'
					};
		else if(window.device.platform == "Android")
			options = {
						'http_host':'m.changan.com.cn/instant',
						'http_port':'',
						'app_key':'2020a908af6c0ddc21795f50c482a641',
						'secret':'196e4d4b-4710-4a91-885e-ab7ec0010f66',
						'app_package_name':'cn.com.changan.cvim',
						'app_version':'0.7.0',
						'basews':'http://m.changan.com.cn/'
					};
		window.forksLoader = new Forks();
		window.forksLoader.loadForks(function() {
			window.plugins.pushNotification.register(function(result) {
				registeInfo = result;
				//checkInChameleonForIOS(result);
				console.log("pushNotification register ok.");
			}, function() {
				console.log("pushNotification register error.");
			}, options);
		});
	}
});