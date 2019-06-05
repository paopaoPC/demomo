//author:lihaohao

define([
    'underscore',
    'jquery',
    'shared/js/notification',
    'butterfly/task/Task',
    'butterfly/task/TaskQueue',
    'shared/js/downloadManager',
    'shared/plugin_dialogOld/js/dialog',
    'modulesManager/modulesManagePage',
    'application/AppConfig'
], function (_, $, Notification, Task, TaskQueue, DownLoad, dialog, modulesManagePage,App) {

    if(bfConfig._config.runtime == "RELEASE"){
        App.appKey = '641c9b0a78623112982d7df6d5d256c9'
        App.appSecret = '5b577d9f-37d0-49fc-a051-08941bcf7608'
        App.appUpdateName = 'com.changan.ossan'

        App.androidDownloadUrl = 'http://ostspdev.changan.com.cn:9000/bsl-web/mam/apps/download/com.changan.ossan/android?appKey='
        var serverUrl = 'http://ostspdev.changan.com.cn:9000';
        var serverUrlUpdateList = 'http://ostspdev.changan.com.cn:9000';

    } else if(bfConfig._config.runtime == "DEBUG_NO_NET_DEBUG"){
        App.appKey = '29ba8ce091644c280e9a81ad902a0a16'
        App.appSecret = '1c376878-bde3-424e-a713-b7ffee215925'
        App.appUpdateName = 'com.changan.ossanpreprod'

        App.androidDownloadUrl = 'http://ostspprep.changan.com.cn:443/bsl-web/mam/apps/download/com.changan.ossanpreprod/android?appKey='
        var serverUrl = 'http://ostspprep.changan.com.cn:443';
        var serverUrlUpdateList = 'http://ostspprep.changan.com.cn:9000';
    } else if(bfConfig._config.runtime == "DEBUG"){
        App.appKey = '6aab0135696a7b3654cf84656a396a28'
        App.appSecret = '266f3f2c-ba34-402f-89a1-4f00a09fbd59'
        App.appUpdateName = 'com.changan.ossandev'

        App.androidDownloadUrl = 'http://ostspdev.changan.com.cn:9000/bsl-web/mam/apps/download/com.changan.ossandev/android?appKey='
        var serverUrl = 'http://ostspdev.changan.com.cn:9000';
        var serverUrlUpdateList = 'http://ostspdev.changan.com.cn:9000';

    }
    var appKey = App.appKey;
    var androidPath = App.androidPath;
    if(typeof cordova != "undefined"&& navigator.appInfo.getFilePath){
        navigator.appInfo.getFilePath(function (data) {
            window.localStorage.setItem("androidPath",data);
            androidPath = 'file://'+data+'/';
        });
    }
    var ModuleManager = function () {
        this.appKey = appKey;
        this.secret = App.appSecret;
        this.serverUrl = serverUrl;
        this.androidPath = androidPath;
        this.androidDownloadUrl = App.androidDownloadUrl;
        this.iOSDownloadUrl = App.iOSDownloadUrl;
        this.serverUrlUpdateList = serverUrlUpdateList;
        if (typeof(cordova) != "undefined") {
            navigator.appInfo.getVersion(function (data) {
                window.localStorage.setItem("currentVersion",data);
            });
        }
        this.version = window.localStorage.currentVersion;
    };

    var AjaxTask = Task.extend({

        constructor: function (url) {
            this.url = url;
        },

        execute: function (success, fail) {
            var me = this;
            this.ajax = $.ajax({
                url: this.url,

                success: function (ajaxCont) {
                    success(JSON.parse(ajaxCont));
                },
                error: fail
            });
        },

        abort: function () {
            this.ajax.abort();
        }

    });

    var DownloadModuleTask = Task.extend({
        appkey: appKey,
        serverUrl: serverUrl,
        androidPath: androidPath,
        storageDirectory: function () {
            return (device.platform == 'iOS') ? cordova.file.documentsDirectory : this.androidPath;
        },
        wwwDirecotry: function () {
            return this.storageDirectory() + 'app/';
        },

        constructor: function (fs, module) {
            this.fs = fs;
            this.module = module;
        },
        execute: function (success, fail) {
            var url = this.serverUrl + '/mam/api/mam/clients/files/' + this.module.bundle + '?appkey=' + this.appkey;
       
            var target = this.wwwDirecotry() + this.module.identifier + '.zip';
            var me = this;
            DownLoad.onDownload(
                this.module.identifier, url, this.module.identifier, target,
                function (identifier, progress) {
                    //emmit onprogress event
                    // me.trigger('progress', identifier, progress);
                },
                function (url, filename, entry) {
                    console.log('DownLoad success');
                    var folderName = me.module.identifier;
                    if (folderName.indexOf('.') >= 0) {
                        folderName = folderName.split('.')[1];
                    }
                    zip.unzip(target, me.wwwDirecotry() + folderName + '/', function () {
                        console.log('unzip success'); //android 不要加sdc;ard
                        // 包名加路径(android路径);
                        var devicePath = (device.platform == 'iOS') ? 'app/' + entry.name : androidPath + "app/" + entry.name;

                        DownLoad.removeTask(me.module.identifier); //删除下载缓存记录；
                        DownLoad.saveState();
                        if (device.platform === 'iOS') {
                            me.fs.root.getFile(devicePath, {}, function (f) {
                                f.remove(function () {
                                    success();

                                }, fail); //remove

                            }, function (error) {
                                console.log('压缩包删除失败');
                            }); //
                        } else {
                            window.resolveLocalFileSystemURI(devicePath, function (f) {

                                f.remove(function () {
                                    success();

                                }, fail); //remove

                            }, function (error) {
                                console.log('压缩包删除失败');
                            }); //
                        }
                    }); //unzip

                },
                function () {
                    fail();
                    console.log('下载失败')
                });
        },

        abort: function () {

        }
    });

    _.extend(ModuleManager.prototype, {

        storageDirectory: function () {
            return (device.platform == 'iOS') ? cordova.file.documentsDirectory : this.androidPath;
        },

        wwwDirecotry: function () {
            return this.storageDirectory() + 'app/';
        },

        errorHandler: function (e) {
            var msg = '';

            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            }
            console.log('Error: ' + msg);
        },
        dialogInfo: function () {
            var me = this;
            if(me.updateDialog){
                me.updateDialog.close();
                me.updateDialog.destroy();
                delete me.updateDialog;
            }
            if (device.platform == 'iOS') {
                //window.location.href = me.iOSDownloadUrl + me.appKey;
                window.localStorage.iosDowanLoadUrl = 'https://itunes.apple.com/cn/app/长安欧尚/id1252939933?mt=8';
                if(window.localStorage.iosDowanLoadUrl||window.localStorage.iosDowanLoadUrl == ""||window.localStorage.iosDowanLoadUrl == "null"){
                    var iosDowanLoadUrl = window.localStorage.iosDowanLoadUrl;
                    if(iosDowanLoadUrl == "null"|| iosDowanLoadUrl == ""||!iosDowanLoadUrl){
                        dialog.createDialog({ //外壳，H5都有更新时
                            autoOpen:true,
                            closeBtn: false,
                            buttons: {
                                '知道了': function () {
                                    this.close();
                                    this.destroy();
                                }
                            },
                            content:'请前往AppStore更新应用'
                        });
                    }else {
                        window.open(iosDowanLoadUrl,'_system','location=yes');
                    }
                }else{
                    bfClient.getBaseConfigData({callBacksuccess: function (iosDowanLoadUrl) {
                        if(!iosDowanLoadUrl){
                            dialog.createDialog({ //外壳，H5都有更新时
                                autoOpen:true,
                                closeBtn: false,
                                buttons: {
                                    '知道了': function () {
                                        this.close();
                                        this.destroy();
                                    }
                                },
                                content:'请前往AppStore更新应用'
                            });
                        }else {
                            window.open(iosDowanLoadUrl,'_system','location=yes');
                        }
                    }})
                }
            } else {
                navigator.iChanganCommon.download(me.androidDownloadUrl + me.appKey, null, null);

            }
        },
        //一次调用完成对应用和模块的更新，以及弹出提示框
        //isStartByUser参数用于判断是否由用户主动点击发起，
        //从而确定是否弹出”已经是最新版本的提示框“
        checkUpdates: function (isStartByUser, success, fail) {
            var me = this;
            // if(bfConfig.server.indexOf("preprod") != -1){
            //     console.log("预生产环境不更新应用");
            //     fail();
            //     return;
            // }
            me.checkAppUpdate(function (newVersion) {
                me.getUpdateMsgList(newVersion, function (msg) {
                    var updateListDiv;
                    if (msg && msg.success) {
                        var screenHeight = window.innerHeight;
                        updateListDiv = "<div id='update_wrapper' style='max-height:" + screenHeight * 0.5 + "px; overflow: hidden;'><div class='scroll' style='position:relative'>" + msg.features + "</div></div>";
                    }
                    me.checkModulesUpdate(function (result) {
                        success();
                        // 面次弹出遮罩层的时候，清空之前的
                        var $dialogUpdate = $('.ui-dialog-old-version-update');
                        var $mask = $dialogUpdate.prev('.ui-mask');
                        $mask.remove();
                        $dialogUpdate.remove();                    
                        if (result.length > 0) {
                            me.updateDialog =  dialog.createDialog({ //外壳，H5都有更新时
                                closeBtn: false,
                                buttons: {
                                    '残忍拒绝': function () {
                                        this.close();
                                        this.destroy();
                                    },
                                    '立即升级': function () {
                                        me.dialogInfo();
                                        this.close();
                                        this.destroy();
                                    }
                                },
                                isVersionUpdate: true,
                                content: updateListDiv ? updateListDiv : '检测到有应用更新'
                            });
                            if (updateListDiv) {
                                new IScroll('#update_wrapper');
                            }
                        } else {
                            me.updateDialog =  dialog.createDialog({ //只有外壳更新时
                                closeBtn: false,
                                buttons: {
                                    '残忍拒绝': function () {
                                        this.close();
                                    },
                                    '立即升级': function () {
                                        me.dialogInfo();
                                        this.close();
                                        this.destroy();
                                    }
                                },
                                isVersionUpdate: true,
                                content: updateListDiv ? updateListDiv : '检测到有应用更新'
                            });
                            if (updateListDiv) {
                                new IScroll('#update_wrapper');
                            }
                        }
                    }, fail);

                });

            }, function (oldVersion) {
                me.getUpdateMsgList(oldVersion, function (msg) {
                    me.checkModulesUpdate(function (result) {
                        success();
                        if (result.length > 0) {  //只有H5更新
                            if (isStartByUser) {
                                dialog.createDialog({
                                    closeBtn: false,
                                    buttons: {
                                        '确定': function () {
                                            this.destroy();
                                            this.close(); //所有逻辑必须放在关闭之前
                                        }
                                    },
                                    content: '当前版本: ' + me.version
                                });
                            }
                            new modulesManagePage().init({auto: true}, ModuleManager);
                        } else {
                            if (!isStartByUser) return;
                            dialog.createDialog({ //都无更新时
                                closeBtn: false,
                                buttons: {
                                    '确定': function () {
                                        this.destroy();
                                        this.close(); //所有逻辑必须放在关闭之前
                                    }
                                },
                                content: '当前版本: ' + me.version
                            });
                        }
                    }, fail);
                });

            });

        },
        //获取更新的信息列表
        getUpdateMsgList: function (version, callback) {
            var me = this;
            if (!version) callback(null);
            $.ajax({
                type: 'get',
                url: me.serverUrlUpdateList + '/appupdate/api/mam/appMains/versionFeature?appId='+App.appUpdateName+'&version=' + version,
                timeOut: 3000,
                success: function (result) {
                    callback(result);
                },
                error: function (error) {
                    callback(null);
                }
            });
        },

        //检查应用程序是否需要更新
        checkAppUpdate: function (success, fail) {
            var me = this;
            if (!window.cordova) return;
            me.getAppBuild(function (remoteAppInfo) {
                navigator.appInfo.getAppInfo(function (appinfo) {
                    if (remoteAppInfo.build > appinfo.build) {
                        success(remoteAppInfo.version);
                    } else if (remoteAppInfo.build == appinfo.build) {
                        fail(remoteAppInfo.version);
                    } else {
                        fail(me.version);
                    }
                }, function (e) {
                    console.log('Get app build error:' + e); //拉取原生信息失败
                    fail();
                });
            }, function () {
                fail();
            });
        },
        //检查模块是否需要更新
        checkModulesUpdate: function (success, fail) {
            if (!window.cordova) return;
            var me = this;
            var task = 2;
            var localModules, remoteModules;
            me.getLocalModulesInfo(function (modules) {
                localModules = modules;
                //console.log("local:");
                //console.log(localModules);
                if (--task == 0) {
                    var diff = me.diffModules(localModules, remoteModules);
                    //console.log("diff:");
                    //console.log(diff);
                    success(diff);
                }
            }, fail);
            me.getLastestModulesUpdateInfo(function (modules) {
                remoteModules = modules;
                //console.log("remote:");
                //console.log(remoteModules);
                if (--task == 0) {
                    var diff = me.diffModules(localModules, remoteModules);
                    //console.log("diff:");
                    //console.log(diff);
                    success(diff);
                }
            }, fail);
        },
        //获得服务器上的模块版本信息
        getLastestModulesUpdateInfo: function (success, fail) {
            var me = this;
            me.getAppTokenFromServer(function (token) {
                me.getModulesInfoFromServer(token, success, fail);
            }, fail);
        },
        //对比两个模块信息数组，返回可更新的模块数组
        diffModules: function (local, remoteModules) {
            var diff = [];
            //<identifier, module>的映射，方便下面一步过滤使用
            var localModulesMapping = _.object(_.map(local, function (module) {
                return module.identifier;
            }), local);
            //过滤掉不需要更新的模块
            var updatableModuleArray = _.filter(remoteModules, function (remoteModule) {
                //根据远程模块的identifier，尝试找出相应的本地模块
                var localModule = localModulesMapping[remoteModule.identifier];
                //有同样identifier的本地模块存在，且版本号不相同，返回远程模块信息。
                return localModule && (localModule.build < remoteModule.build) || !localModule;
            });
            return updatableModuleArray;
        },

        //获取本地模块信息
        getLocalModulesInfo: function (success, fail) {
            var me = this;
            window.resolveLocalFileSystemURL(me.wwwDirecotry(), function (fs) {
                var dirReader = fs.createReader();
                dirReader.readEntries(function (entries) {
                    var packageJSONArray =
                        _.chain(entries)
                            .filter(function (entry) {
                                return entry.isDirectory;
                            }).value();
                    me.loadModulesInfoFromDirectories(fs, packageJSONArray, function (moduleNameArray) {
                        var moduleInfoArray = _.map(moduleNameArray, function (moduleName) {
                            return '../' + moduleName + '/package.json';
                        });
                        //AJAX 队列
                        var q = new TaskQueue();
                        moduleInfoArray.forEach(function (json) {
                            var task = new AjaxTask(json);
                            q.add(task);
                        });
                        var jsonArray = [];
                        q.success(function (arr) {
                            me.dependenciesModules(arr, function (newArr) { //处理依赖
                                success(newArr);
                            });

                        });
                        q.fail(function (error) {
                            Notification.show({
                                type: 'error',
                                message: "读取本地模块信息失败"
                            });
                        });
                        q.execute();
                    });
                }, fail);
            });

        },

        //给出一个文件夹列表，返回（回调方式）文件夹数组
        loadModulesInfoFromDirectories: function (fs, folderEntries, success) {

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
        },

        // //获取上架的应用版本号
        getAppBuild: function (getAppVersionSuccess, fail) {   //TODO 切换到 InCall服务器 实现批量更新
            var me = this;
            $.ajax({
                type: 'get',
                url: me.serverUrl + '/mam/api/mam/clients/update/' + device.platform.toLowerCase() + '/'+App.appUpdateName+'/',
                data: {
                    'appKey': me.appKey
                },
                success: function (appInfo) {
                    if (appInfo) {
                        getAppVersionSuccess(appInfo);
                    }
                },
                error: fail
            })
        },
        //获取应用token
        getAppTokenFromServer: function (success, fail) {
            var me = this;
            $.ajax({
                type: 'post',
                url: me.serverUrl + '/mam/api/mam/clients/apps/' + device.platform.toLowerCase() + '/'+App.appUpdateName+'/' + me.version + '/validate',
                data: {
                    appKey: me.appKey,
                    secret: me.secret
                },
                success: function (serverResult) {
                    success(serverResult.token);
                },
                error: fail
            });
        },
        //获取更新模块的信息
        getModulesInfoFromServer: function (token, success, fail) {
            var me = this;
            $.ajax({
                type: 'GET',
                url: me.serverUrl + '/mam/api/mam/clients/apps/modules/' + token,
                data: {
                    'timeStamp': new Date().getTime()
                },
                success: function (ModelResult) {
                    //console.log(ModelResult);
                    success(ModelResult.modules);
                },
                error: fail
            })
        },
        dependenciesModules: function (arr, success) {
            var newArr = _.clone(arr);
            //提取依赖模块信息，再与本地模块合并成一个新的数组；
            _.each(newArr, function (item) {
                if (_.keys(item.dependencies).length > 0) { //如果模块中有依赖，再与本地模拟对比版本号;
                    var obj = { //先将依赖转换为对象
                        'identifier': _.keys(item.dependencies)[0],
                        'version': _.values(item.dependencies)[0]
                    };
                    _.each(arr, function (localItem, k) { //再次遍历本地模块数组
                        if (localItem.identifier === obj.identifier && localItem.version < obj.version) {
                            delete newArr[k]; //如果在依赖模块，在本地模块信息数组中有，则对比，如果本地的版本低于依赖的，则删除本地的，添加依赖。
                            newArr.push(obj);
                        }
                    });
                }
            });
            success(_.compact(newArr));
        },
        downloadModules: function (modulesArray) { //下载，更新模块；队列；
            var me = this;
            function errorHandler(error) {
                console.error(error);
            }

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

                var q = new TaskQueue();

                modulesArray.forEach(function (module) {
                    var task = new DownloadModuleTask(fs, module);
                    q.add(task);
                });

                q.success(function () {
                    console.log('queue success');
                    // me.loadingNotification.remove(); //删除压缩包后，提示成功，删除提示。
                    window.sessionStorage.setItem('updateCompleteModules', JSON.stringify(modulesArray)); //更新完成的模块，存储起来，等待应用重启
                    window.localStorage.setItem('updateCompleteTime', new Date().getTime()); //更新完成时间
                    //设置原生更新标志位
                    navigator.packaging.updateFlag({flag: true},
                        function (data) {
                            console.log("模块更新标志位设置成功");
                        }, function (error) {
                            console.log("模块更新标志位设置失败");
                        });
                });

                q.fail(function (error) {
                    console.log("模块更新失败……");
                });

                q.execute();

            });
        }

    });
    return ModuleManager;
})
