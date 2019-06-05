define([
        "butterfly/extend",
        'shared/js/notification',
        'butterfly/task/Task',
        'butterfly/task/TaskQueue',
        'shared/js/downloadManager',
        'shared/plugin_dialog/js/dialog'
    ],
    function (extend, Notification, Task, TaskQueue, DownLoad, dialog) {
        var cls = {};
        var jsonArray = [];
        var GlobalProgressFunc;

        cls.escapeString = function (uri) {
            uri = escape(uri);
            uri = uri.replace(/%/g,'');
            return uri;
        };
         //来源路径
        cls.ResourcePath = function () {
            var me = this;
            var folderName = me.escapeString(bfDataCenter.getUserValue("carUniqueCode").toLowerCase());
            return (me.appDirecotry() + folderName + '/');
        };

        cls.PreDownLoad = function (successFunc, errorFunc,progressFunc,moduleName) {
            var me = this;
            console.log("获取服务器资源包版本");
            var Func = function () {
                bfClient.getResorceBuild({
                    data: {
                        groupCode: moduleName,
                        businessType: "appSourse"
                    },
                    success: function (requestData) {
                        if (requestData.code == 0 && requestData.success == true) {
                            var loadArray = [];
                            var size = requestData.data.fileSize;
                            var contentString ='还未下载车型资源包，是否立即下载？';
                            if(size){
                                size = size ? (Number(size)/1000000).toFixed(1) : null;
                                contentString = '还未下载车型资源包( '+size+' MB)，是否立即下载？';
                            }
                            var data = {
                                identifier: me.escapeString(moduleName),
                                dsshandle: requestData.data.dsshandle
                            };
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '取消': function () {
                                        bfDataCenter.setUserValue("HasResource", false);
                                        errorFunc();
                                        var nowTime = new Date().getTime();
                                        bfDataCenter.setUserValue("resourceTime", nowTime);
                                        this.close(); //所有逻辑必须放在关闭之前
                                        this.destroy();
                                    },
                                    '立即下载': function () {
                                        loadArray.push(data);
                                        me.downloadModules(loadArray, successFunc, errorFunc,progressFunc,moduleName);
                                        this.close(); //所有逻辑必须放在关闭之前
                                        this.destroy();
                                    }
                                },
                                content: contentString
                            });
                        } else {
                            console.log(requestData.msg);
                            bfDataCenter.setUserValue("HasResource", false);
                            errorFunc();
                        }

                    }, error: function (errorData) {
                        console.log("获取最新资源包失败");
                        bfDataCenter.setUserValue("HasResource", false);
                        errorFunc();
                    }
                });
            };
            Func();
        };

        cls.UpdateDownload = function (successFunc, errorFunc,progressFunc,moduleName) {
            var me = this;
            var Func = function () {
                var UpdateDownloadSuccess = function (requestData) {
                        window.localStorage[window.__currentPhone+'getResorceBuild'+moduleName] = JSON.stringify(requestData)
                        if (requestData.code == 0 && requestData.success == true && requestData.data) {
                            if(!requestData.data.code){
                                bfDataCenter.setUserValue("HasResource", true);
                                me.getPathRes(function (imgPath,isNeedCB,needOtheranimate) {
                                successFunc(imgPath,isNeedCB,needOtheranimate);
                                },moduleName);
                                return
                            }
                            var loadArray = [];
                            //本地版本
                            var currentVersion = jsonArray.version;
                            //服务器版本
                            var latestVersion = requestData.data.code;
                            //资源包大小
                            var size = requestData.data.fileSize;
                            var contentString ='有车型资源包更新，放弃下载将不能使用实车状态显示功能！';
                            if(size){
                                size = size ? (Number(size)/1000000).toFixed(1) : null;
                                contentString = '有车型资源包( '+size+' MB)更新，放弃下载将不能使用实车状态显示功能！';
                            }
                            console.log("本地版本:" + currentVersion);
                            console.log("最新版本:" + latestVersion);
                            currentVersion = currentVersion.replace(".", "");
                            latestVersion = latestVersion.replace(".", "");
                            //服务器版本大于本地版本更新
                            if (Number(latestVersion) > Number(currentVersion)) {
                                var data = {
                                    identifier: me.escapeString(moduleName),
                                    dsshandle: requestData.data.dsshandle
                                };
                                dialog.createDialog({
                                    closeBtn: false,
                                    buttons: {
                                        '取消': function () {
                                            bfDataCenter.setUserValue("HasResource", false);
                                            errorFunc();
                                            var nowTime = new Date().getTime();
                                            bfDataCenter.setUserValue("resourceTime", nowTime);
                                            this.close();
                                            this.destroy();
                                        },'立即下载': function () {
                                            loadArray.push(data);
                                            me.downloadModules(loadArray, successFunc, errorFunc,progressFunc,moduleName);
                                            this.close(); //所有逻辑必须放在关闭之前
                                            this.destroy();
                                        }
                                    },
                                    content: contentString
                                });
                            } else {
                                console.log("已是最新的资源包");
                                bfDataCenter.setUserValue("HasResource", true);
                                me.getPathRes(function (imgPath,isNeedCB,needOtheranimate) {
                                    successFunc(imgPath,isNeedCB,needOtheranimate);
                                },moduleName);
                            }
                        } else {
                            console.log(requestData.msg);
                            //请求失败设置没有资源包标识
                            bfDataCenter.setUserValue("HasResource", false);
                            errorFunc();
                        }

                }
                var UpdateDownloadError = function (errorData) {
                    console.log("获取最新资源包失败");
                    bfDataCenter.setUserValue("HasResource", false);
                    errorFunc();
                }
                if(window.__currentIs4G()){
                    bfClient.getResorceBuild({
                        data: {
                            groupCode: moduleName,
                            businessType: "appSourse"  //TODO   测试代码
                        },
                        success: UpdateDownloadSuccess,
                        error: UpdateDownloadError
                    });
                } else {
                    var dataStr = window.localStorage[window.__currentPhone+'getResorceBuild'+moduleName];
                    var dataObj = dataStr && JSON.parse(dataStr)
                    if(dataObj){
                        UpdateDownloadSuccess && UpdateDownloadSuccess(dataObj)
                    } else {
                        UpdateDownloadError && UpdateDownloadError('没有本地缓存')
                    }
                }
               
            };
            Func();
        };


        cls.getPathRes = function (callBack,moduleName11) {
            var me =this;
            if(bfDataCenter.getUserValue("carUniqueCode") || moduleName11){
                if(moduleName11){
                    var moduleName = moduleName11;
                } else {
                    var moduleName = me.escapeString(bfDataCenter.getUserValue("carUniqueCode").toLowerCase())
                }
                var jsonUrl = me.appDirecotry() + moduleName + '/package.json'
                $.ajax({
                    url: jsonUrl,
                    data: undefined,
                    dataType: 'json',
                    success: function(data){
                        var needOtheranimate = data.needOtheranimate;
                        if(data.funStatus === false){
                           var ImgPath = me.appDirecotry() + moduleName + '/carDefault.png';
                           if(data.isNeedCB == true){
                               callBack(ImgPath,true,needOtheranimate);
                           } else {
                               callBack(ImgPath,false,needOtheranimate);
                           }
                        }else{
                           if(data.isNeedCB == true){
                               callBack(undefined,true,needOtheranimate);
                           } else {
                               callBack(undefined,false,needOtheranimate);
                           }
                        } 
                    }
                })
            }
        };

        /**
         * 检查资源包
         * @successFunc 成功回调
         * @errorFunc 失败回调
         * @progressFunc 进度方法
         * @UserClick  是否强制检查 资源包更新
         * @codeName  车型的名字
         * */
        cls.checkCarUniqueRescore = function (successFunc, errorFunc,progressFunc, UserClick,codeName) {
            var me = this;

            // errorFunc();
            // return
//           if(window._Bola_deviceInfo.OS == "android"){
//               errorFunc();
//               return 
//            }
            
            
            GlobalProgressFunc = progressFunc;
            //拒绝更新时间记录值
            var resourceTime = bfDataCenter.getUserValue("resourceTime");
            var nowTime = new Date().getTime();
            //是否更新过资源
            var HasResource = bfDataCenter.getUserValue("HasResource");
            //弹出更新条件判断 'userclick--是否强制检查 资源包更新'
            if (!UserClick && resourceTime &&(nowTime - Number(resourceTime)) < 120000) {
                if(HasResource == false){
                    errorFunc();
                }else{
                    //加载本地资源
                    me.getPathRes(function (imgPath,isNeedCB,needOtheranimate) {
                        successFunc(imgPath,isNeedCB,needOtheranimate);
                    },codeName);
                }
                return;
            }
            //iphone6/6p不加载3D模型
            if(typeof OSApp !== 'undefined' && !OSApp.isLoadCarModal()){
                console.log('--------3d---------');
                bfDataCenter.setUserValue("HasResource",false);
                errorFunc();
                return;
            }  
            //不存在车型资源
            if (!bfDataCenter.getUserValue("carUniqueCode") && !codeName) {
                 console.log('--------不存在资源---------');
                bfDataCenter.setUserValue("HasResource",false);
                errorFunc();
                return;
            }
            console.log("开始资源包检查");
            console.log("资源包路径" + me.appDirecotry());

            if(codeName){
                var moduleName = codeName;
            } else {
                var moduleName = me.escapeString(bfDataCenter.getUserValue("carUniqueCode").toLowerCase());
            }
            var jsonUrl = me.appDirecotry() + moduleName + '/package.json';

            $.ajax({
                url: jsonUrl,
                data: undefined,
                dataType: 'json',
                success: function(data){
                    // debugger;
                    jsonArray = data;
                    //关闭检查更新
                     me.UpdateDownload(successFunc, errorFunc,progressFunc,moduleName);
                },
                error: function(){
                      errorFunc();
                     //1
                     //关闭检查更新
                    me.PreDownLoad(successFunc, errorFunc,progressFunc,moduleName);
                }
            })
        };
        /**
         * 下载，更新模块；队列
         * */
        cls.downloadModules = function (modulesArray, successFunc, errorFunc,progressFunc,moduleName) {
            var me = this;
            PP_callback = function(bool,progress){
                if(progress == 'error'){
                    setTimeout(function(){
                        console.log("资源包下载失败");
                        bfDataCenter.setUserValue("HasResource", false);
                        errorFunc();
                    },0)
                    return
                }
                if(progress != undefined){
                    // alert(progress)
                    setTimeout(function(){
                        console.log("资源包下载进度："+Number(progress)*100);
                        console.log("progress:"+progress);
                        GlobalProgressFunc(Number(progress)*100);
                    },0)
                } else {
                    // alert('完成')
                    this.close(); //所有逻辑必须放在关闭之前
                    setTimeout(function(){
                        console.log("bool:"+bool+'progress:'+progress);
                        var d = dialog.createDialog({
                            // autoOpen: false, //默认为true
                            closeBtn: false,
                            buttons: {
                                '我知道了': function () {
                                    this.close(); //所有逻辑必须放在关闭之前
                                    bfDataCenter.setUserValue("HasResource", true);
                                    if(bfNaviController.count() > 1){
                                        bfNaviController.pop(1);
                                    }
                                    me.getPathRes(function (imgPath,isNeedCB,needOtheranimate) {
                                        successFunc(imgPath,isNeedCB,needOtheranimate);
                                    },moduleName);
                                    OSApp.closeView();
                                }
                            },
                            content: '车型资源包已下载完成，立即体验最新界面!'
                        });
                        // d.open();
                    },500)
                    
                }

            }
                // PP_callback(0,0.89170295)
            var httpurl = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.token + "&dsshandle=" + modulesArray[0].dsshandle;
            // var loacl = this.appDirecotry_download() + modulesArray[0].identifier;
            var loacl =  modulesArray[0].identifier;
            // var ext = require("wy");
            OSApp.downloadP(httpurl,loacl,'PP_callback');
            // PP_callback(1,0.32)
            // PP_callback(1,0.42)


        };
        //-----------修改------------
        // cls.appDirecotry_download = function () {
        //     return "source://changAnTelematics/ppResource/";
        //     // return "changAnTelematics/ppResource/";
        // };
        cls.appDirecotry = function () {
            if(typeof OSApp !== 'undefined'){
                return OSApp.getModalPath();
            } else {
                return '../ppResource/';
            }
        };
        /**
         * 给出一个文件夹列表，返回（回调方式）文件夹数组
         * */
        cls.loadModulesInfoFromDirectories = function (fs, folderEntries, success) {
            var result = [];
            var tasks = folderEntries.length;
            folderEntries.forEach(function (folderEntry) {
                fs.getFile(folderEntry.name + '/package.json', {
                    create: false
                }, function (fileEntry) {
                    //TODO: 把结果存到result
                    result.push(folderEntry.name);
                    if (--tasks == 0) success(result);
                }, function () {
                    if (--tasks == 0) success(result);
                });
            });
        };
        return cls;
    })
;