define(
["imMain","application/AppConfig",'shared/js/notification'],
function(main,AppConfig,Notification)
{
	var Adapter = function()
	{
		main();
	};
	Adapter.prototype.fly = function()
	{
		var isLogin = window.localStorage['isLogin'];
		var username = window.localStorage['userMobile'];
        window.localStorage.setItem("isNev", "2");
		window.document.hashas3d = false;
		window.localStorage['mapType'] = 'GCJ02';
		if (typeof(cordova) != "undefined") {
			navigator.appInfo.getVersion(function (data) {
				window.localStorage.setItem("currentVersion", data);
			});
		}
 
//       $.ajax({
//              url:"http://app.changan001.cn/api.ashx?m=getspecialimg",
//              data:{
//              // version:(!window.localStorage.loadingPageVersion||window.localStorage.loadingPageVersion == "undefined") ?0:Number(window.localStorage.loadingPageVersion)
//              version:0
//              },
//              type:"POST",
//              dataType:"json",
//              timeout:3000,
//              success:function(jsonData){
//              var resData = jsonData.returndata;
//              if(resData){
//              if(resData.list){
//              window.localStorage.removeItem("HadSeePage");
//              window.loadingPageVersion = resData.version;window.sessionStorage.setItem("LoadingImgs",JSON.stringify(resData));
//                  window.location.href = '../whatsnew/index.html#whatsnew/whatsnew.html';
//                  return;
//                  }
//              }
//              if (isLogin == 'true' && username && username != "null") {
//                  window.location.href = '../whatsnew/index.html#main/index.html';
//              } else {
//                  window.location.href = '../whatsnew/index.html#login/index.html';
//              }
//
//              },
//              error:function(){
                console.log("请求Img失败");
                function GetRequest_pp() {  
                   var url = location.search; //获取url中"?"符后的字串
                   var theRequest = new Object();  
                   if (url.indexOf("?") != -1) {  
                      var str = url.substr(1);  
                      strs = str.split("&");  
                      for(var i = 0; i < strs.length; i ++) {  
                         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);  
                      }  
                   }  
                   return theRequest;  
                } 

                window.localStorage.setItem("loginModel", "authother")
                var tokenData = GetRequest_pp();
                var token = tokenData.access_token;
                window.localStorage['token'] = token;
                window.localStorage['refreshToken'] = tokenData.refresh_token;
                // var _username = '17623003021'
                // var _password = 'hhlovedcm131412'

                var successFn = function(data) {
                    window.localStorage[window.__currentPhone+'loginByBfApplication'] = JSON.stringify(data);
                   if (data.from && data.from == "autoLogin") {
                       data.code = 0;
                       // OSApp.showStatus("error", '1')
                   }
                   if (data && data.success && data.code == "0" && data.data) {
                       // OSApp.showStatus("error", '2')
                       //save it
                       window.localStorage['token'] = data.data.token;
                       window.localStorage['userMobile'] = data.data.mobile;
                       // window.localStorage['password'] = passWord;
                       window.localStorage['userId'] = data.data.userId;
                       window.localStorage['isLogin'] = 'true';

                       // 会员相关数据 过滤后台的null,undefined
                       var infoJson = {};
                       infoJson["nickname"] = data.data.nickname === null ? '' : (data.data.nickname || '');
                       infoJson["phone"] = data.data.mobile === null ? '' : (data.data.mobile || '');
                       infoJson["sex"] = data.data.sex === null ? '' : (data.data.sex || '');
                       infoJson["email"] = data.data.email === null ? '' : (data.data.email || '');
                       infoJson["birthday"] = data.data.birthday === null ? '' : (data.data.birthday || '');
                       infoJson["cycid"] = data.data.cycid === null ? '' : (data.data.cycid || '');
                       infoJson["sycid"] = data.data.sycid === null ? '' : (data.data.sycid || '');
                       infoJson["sycuid"] = data.data.sycuid === null ? '' : (data.data.sycuid || '');
                       infoJson["cycuid"] = data.data.cycuid === null ? '' : (data.data.cycuid || '');
                       infoJson["openid"] = data.data.openId === null ? '' : (data.data.openId || '');
                       window.localStorage['user_info_cache_data'] = JSON.stringify(infoJson);
                       /**
                        * IM 信息
                        * */
                       //111222
                       if (data.data.imPassWord && data.data.imUserId) {
                           window.localStorage['imPassWord'] = data.data.imPassWord;
                           window.localStorage['imUserId'] = data.data.imUserId;
                       }
                       // me.uiAddChrysanthemum();
                       var getMainDatasUrl = bfConfig.server + '/appserver/api/car/getMyCars';
                       var mainDataSuccess = function(mainDatas) {
                            window.localStorage[window.__currentPhone+'getMyCarsByBfApplication'] = JSON.stringify(mainDatas);
                           if (mainDatas.code == 0 && mainDatas.data && mainDatas.data.length) {
                   
                               // var newArr=false
                               //1
                               
                               var newArr = mainDatas.data.filter(function(item){
                                   // item.seriesCode="V302"
                                   
                                   return item.seriesCode !== "testSeries"
                               })

                               // 存储一下 mycarData中的数据，
                               // 因为 后台没有权限从getcarData中加modelCode这个字段，所以前端 特殊处理下，缓存这个mycarData
                               //1
                               if(!newArr || newArr.length == 0){
                                   // OSApp.showStatus("error", '6')
                                   window.localStorage['pp_no_carlist_render'] = 'true'
                               } else {
                                   window.localStorage['pp_no_carlist_render'] = 'false'
                               }
                               // OSApp.showStatus("error", '7')
                               bfDataCenter.setCarList(newArr);
                               //  OSApp.showStatus("error", '8')
                               bfAPP.gotoMain();
                           } else if(mainDatas.code == '2'){
                               Notification.show({
                                   type: "error",
                                   message: mainDatas.msg
                               });
                               setTimeout(function(){
                                   // require("wy")
                                   // sm("do_Page").pop_pageCount();
                                   if(typeof OSApp !== 'undefined'){
                                      window.__closeCurentView()
                                       // OSApp.closeView();
                                   }
                               },1000)
                           } else {
                               window.localStorage['pp_no_carlist_render'] = 'true'
                               bfAPP.gotoMain();
                           }
                           // me.uiRemoveChrysanthemum();
                       }
                       var mainDataError = function() {
                           Notification.show({
                               type: "error",
                               message: '网络开小差'
                           });
                           setTimeout(function(){
                               // require("wy")
                               // sm("do_Page").pop_pageCount();
                               if(typeof OSApp !== 'undefined'){
                                   // OSApp.closeView();
                                   window.__closeCurentView()
                               }
                           },1000)
                           // me.uiRemoveChrysanthemum();
                       }
                       if(window.__currentIs4G()){
                            $.ajax({
                                url: getMainDatasUrl,
                                data: {
                                    isNev: 2,
                                    token: window.localStorage['token'],
                                    mapType: 'GCJ02'
                                },
                                dataType: 'json',
                                method: 'POST',
                                timeout: 4000,
                                success: mainDataSuccess,
                                error: mainDataError
                            })
                       } else {
                            var dataStr = window.localStorage[window.__currentPhone+'getMyCarsByBfApplication'];
                            var dataObj = dataStr && JSON.parse(dataStr)
                            if(dataObj){
                                mainDataSuccess && mainDataSuccess(dataObj)
                            } else {
                                mainDataError && mainDataError()
                            }
                       }
                       


                   } else {
                       var mes;
                       if (data) {
                           if (data.msg) {
                               Notification.show({
                                   type: "error",
                                   message: "网络开小差"
                               });
                           }
                           mes = data.msg;
                       } else {
                           Notification.show({
                               type: "error",
                               message: "未知错误"
                           });
                           mes = "未知错误";
                       }
                       setTimeout(function(){
                           // require("wy")
                           // sm("do_Page").pop_pageCount();
                           if(typeof OSApp !== 'undefined'){
                               // OSApp.closeView();
                               window.__closeCurentView();
                           }
                       },1000)
                        
                       // me.uiRemoveChrysanthemum();
                   }
                }

                var errorFn = function(error) {
                   var eMsg = '发生未知错误';
                   if (typeof(error) === 'string') eMsg = error;
                   if (typeof(error) === 'object') {
                       if (error.status == 0) eMsg = "网络开小差";
                   }
                   Notification.show({
                       type: "error",
                       message: eMsg
                   });
                   setTimeout(function(){
                       // require("wy")
                       // sm("do_Page").pop_pageCount();
                       // OSApp.closeView();
                       window.__closeCurentView()
                   },1000)
                }

                if(window.__currentIs4G()){
                   bfClient.login({
                       // username: _username,
                       //  password: _password,
                       username: '',
                       password: '',
                       token: token,
                       refreshToken: token,
                       timeout: 4500,
                       beforeSend: function() {
                           // me.uiAddChrysanthemum();
                       },
                       success: successFn,
                       error: errorFn,
                       complete: function() {
                           // me.uiRemoveChrysanthemum();
                       }
                   }); 
                 } else {
                    var dataStr = window.localStorage[window.__currentPhone+'loginByBfApplication'];
                    var dataObj = dataStr && JSON.parse(dataStr)
                    if(dataObj){
                        successFn && successFn(dataObj)
                    } else {
                        errorFn && errorFn('没有本地缓存')
                    }
                    
                 }
                
              // if (isLogin == 'true' && username && username != "null") {
              // window.location.href = '../whatsnew/index.html#main/index.html';
              // } else {
              // window.location.href = '../whatsnew/index.html#login/index.html';
              // }
//              }
//              });
       

		window.onerror = function (sMessage, sUrl, sLine) {  //js全局異常處理
            if(typeof (SendLogInfo)=="undefined"){
                return;
            }
            if(sMessage.indexOf("g.el.trigger") == 0||sMessage.indexOf("Uncaught TypeError: Cannot set property 'isVisible' of undefined") == 0){
                return;
            }
            if(!window._errorLogInfo){
                window._errorLogInfo = [];
            }
            // 把错误日志存到_errorLogInfo,如果数目大于等于20，则不继续push到数组中
            if(window._errorLogInfo.length<20){
                window._errorLogInfo.push({
                    url:sUrl,
                    lineNum:sLine,
                    errorStatck:sMessage,
                    // osSystem:"Html"
                })
            }
        };
        // 定时发送日志，10秒发送（有日志才发）,发送后清空 _errorLogInfo
        (function(){
            setInterval(function(){
                if(typeof (SendLogInfo)=="undefined"){
                    return;
                }
                var length = window._errorLogInfo && window._errorLogInfo.length || 0;
                if(length > 0){
                    var sUrlArr = [],sLineArr = [],sMessageArr = [];
                    var joinStr = "++=====++"
                    for(var i = 0; i<length; i++){
                        sUrlArr.push(window._errorLogInfo[i].url);
                        sLineArr.push(window._errorLogInfo[i].lineNum);
                        sMessageArr.push(window._errorLogInfo[i].errorStatck);
                    }
                    var sUrl = sUrlArr.join(joinStr)
                    var sLine = sLineArr.join(joinStr)
                    var sMessage = sMessageArr.join(joinStr)
                    SendLogInfo({
                        url:sUrl,
                        lineNum:sLine,
                        errorStatck:sMessage,
                        osSystem:"Html"
                    });
                    window._errorLogInfo = [];
                }
            },10000)
        })()
	};

	Adapter.prototype.navigate = function(fragment, options)
	{
		if(bfNaviController)
		{
			bfNaviController.push(fragment, null, options);
		}
	};

	return Adapter;
});
