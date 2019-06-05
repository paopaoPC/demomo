define(
    [
        "common/navView",
        'butterfly',
        'common/ssUtil',
        "shared/js/notification",
        'shared/js/downloadManager',
        'shared/plugin_dialog/js/dialog',
        'css!common/css/im.css'
    ],
    function (View,Butterfly,ssUtil,Notification, downloadManager, dialog)
    {
        var Base = View;
        return Base.extend({
            events:{
                'click .open-product':'gotoIntroduction',
                // 'click .ceng': 'downloadFile'
            },
            androidPath: 'file:///data/data/cn.com.changan.cvim/files/',
            posGenHTML:function(){
                var me = this;
                var index = bfDataCenter.getToolsCarTypeIndex();
                if (index !== null && index !== undefined) {
                    me.getElement("#obd_style")[0].selectedIndex = index;
                }
                var length = me.$('.MLCWContent').find(".MLCWCRow").length;
                if(length == 0){
                    bfClient.getMyManual({
                        data:{},
                        success:function(data){
                            if(data.success){
                                me.$('.myLoveCarWrapper').show();
                                var carStyleArray = data.data;
                                var dataLength = carStyleArray.length;
                                var newData;
                                for(var i=0;i<dataLength;i++){
                                    newData = [];
                                    var dex = (i+1)%3;
                                    if(dex == 0){
                                        dex = 3;
                                    }
                                    carStyleArray[i].index = dex;
                                    if(!carStyleArray[i].imgHandler){
                                        carStyleArray[i].imgHandler = "../toolkit/img/toolkitDetail.png";
                                    }else{
                                        carStyleArray[i].imgHandler = bfDataCenter.getDownLoadUrlForKey(carStyleArray[i].imgHandler);
                                    }
                                    newData.push(carStyleArray[i]);
                                    var newTemp = _.template(me.$("#toolkitDetail-myLoveCarWrapperRow").html(),{data:newData});
                                    if(dex == 1){
                                        me.$('.MLCWContent').append(newTemp);
                                    }else {
                                        var num =me.$('.MLCWContent').find(".MLCWCRow").length;
                                        $(me.$('.MLCWContent').find(".MLCWCRow")[num - 1]).append(newTemp);
                                    }
                                }
                            }else{
                                me.$('.myLoveCarWrapper').hide();
                            }
                        },
                        error:function(){
                            Notification.show({
                                type:"error",
                                message:"获取车系列表失败"
                            });
                        }
                    });
                }
            },
            onShow: function(){
                var me = this;
                this.getAllManual();
                //判断pdf文件是否正在下载
            },
            fileIsExist: function(){
                var me = this;
                if(typeof cordova =="undefined"){
                    return;
                }
                navigator.appInfo.fileList(function(data){
                    if (typeof data == "string") {
                        data = data.split(",");
                    };
                    console.log("文件数组"+data);
                    if (data.length > 0) {
                        // var data = ['CS75.pdf']
                        me.showResult(data)
                    };
                }, function(error){});
                
            },
            showResult: function(fileArr){
                var me = this;
                var cengNode = this.getElement(".ceng");
                var nodeName = cengNode.attr("data-name");
                console.log("+++++获取层节点"+cengNode.length);
                for (var i = 0 ;i < fileArr.length; i++) {
                    for (var j = 0; j < cengNode.length; j++) {
                        var name = $(cengNode[j]).attr('data-name');
                        // var progress = window.localStorage.getItem(name+"progress");
                        var progress = ssUtil.load(name+"progress");
                        console.log("当前进度"+progress);
                        var ceng = $(cengNode[j]);
                        if (progress && parseInt(progress) != 1){
                            ceng.find("span").hide();
                            ceng.siblings("div").show();
                            ceng.siblings("div").find(".progress-line").css("width",progress*100+"%");
                        }
                        
                        if (fileArr[i] == (name+".pdf") && (!progress || parseInt(progress) == 1)) {
                            ceng.hide()
                        }
                    }
                };
            },
            downloadFile: function(el){
                var me = this;
                el.stopPropagation();
                var tar = $(el.currentTarget);
                //判断当前网络环境 如果是wifi  则返回true继续下载  否则弹出框给用户选择
                navigator.appInfo.isWifi(function(data){
                    if (data) {
                        me.starDownload(tar)
                    }else{
                        me.createDownloadDialog(tar)
                    }
                }, function(error){
                    me.createNoWeb()
                })
                
            },
            createDownloadDialog: function(tar){
                var me = this;
                dialog.createDialog({
                    closeBtn: false,
                    buttons: {
                        '继续': function () {
                            me.starDownload(tar);
                            this.close();
                        },
                        '取消': function () {
                            this.close();
                        },

                    },
                    content: "非WIFI环境下下载可能会产生费用",
                });
            },
            createNoWeb: function(){
                var me = this;
                dialog.createDialog({
                    closeBtn:false,
                    buttons:{
                        '确定': function(){
                            this.close()
                        }
                    },
                    content:"当前无网络连接，请连接网络",
                })
            },

            starDownload: function(tar){
                var me = this;
                //取消用户重复点击下载
                tar.unbind("click");
                var fileName = tar.attr("data-name");
                var manualId = tar.attr("data-id");
                var proNode = tar.siblings("div");
                tar.find("span").hide();
                proNode.show();
                var url = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + manualId;
                var target = this.wwwDirecotry()+fileName+'.temp';
                downloadManager.onDownload(fileName, url, fileName, target,
                    function(identifier, progress){
                        console.log("+++"+progress+"---"+identifier);
                        var node = $("div[data-name*='"+identifier+"']"); 
                        node.siblings("div").find(".progress-line").css("width",progress*100+"%");
                        if (progress == 1) {
                            node.hide();
                        };
                        ssUtil.save(identifier+"progress", progress);
                        // window.localStorage.setItem(identifier+"progress", progress);
                    },
                    function(url, filename, entry){
                        console.log("下载成功");
                        var node = $("div[data-name*='"+filename+"']"); 
                        node.hide();
                        node.siblings("div").hide();
                        //文件下载完成后修改临时文件格式为pdf
                        navigator.appInfo.changePDFName({tempName:filename+".temp", fileName: filename+".pdf"}, function(){}, function(){})
                    },
                    function(url, fileName){
                        console.log("下载失败");
                        var node = $("div[data-name*='"+fileName+"']"); 
                        node.find("span").html("下载失败");
                        node.find("span").show();
                        node.siblings("div").hide();
                        node.siblings("div").find(".progress-line").css("width",'0')
                    })
            },
            storageDirectory: function () {
                return (device.platform == 'iOS') ? cordova.file.documentsDirectory : this.androidPath;
            },
            wwwDirecotry: function () {
                return this.storageDirectory() + 'pdf/';
            },
            getAllManual:function(){
                var me =this;
                var length = me.$('.OCWContent').find(".MLCWCRow").length;
                if(length == 0){
                    bfClient.getAllManual({
                        success:function(data){
                            if(data.code ==0){
                                var carStyleArray = data.data;
                                var dataLength = carStyleArray.length;
                                var newData;
                                for(var i=0;i<dataLength;i++){
                                    newData = [];
                                    var dex = (i+1)%3;
                                    if(dex == 0){
                                        dex = 3;
                                    }
                                    carStyleArray[i].index = dex;
                                    if(!carStyleArray[i].imgHandler){
                                        carStyleArray[i].imgHandler = "../toolkit/img/toolkitDetail.png";
                                    }else{
                                        carStyleArray[i].imgHandler = bfDataCenter.getDownLoadUrlForKey(carStyleArray[i].imgHandler);
                                    }
                                    newData.push(carStyleArray[i]);
                                    var newTemp = _.template(me.$("#toolkitDetail-myLoveCarWrapperRow").html(),{data:newData});
                                    if(dex == 1){
                                        me.$('.OCWContent').append(newTemp);
                                    }else {
                                        var num =me.$('.OCWContent').find(".MLCWCRow").length;
                                        $(me.$('.OCWContent').find(".MLCWCRow")[num - 1]).append(newTemp);
                                    }
                                }
                            }else{

                            }
                            //判断pdf文件是否已下载
                            me.fileIsExist();
                            me.getElement(".ceng").on("click", function(el){
                                me.downloadFile(el)
                            })
                        },
                        error:function(){
                            Notification.show({
                                type:"error",
                                message:"获取车系列表失败"
                            });
                            //判断pdf文件是否已下载
                            me.fileIsExist();
                            me.getElement(".ceng").on("click", function(el){
                                me.downloadFile(el)
                            })
                        }
                    });
                }
                
            },
            gotoIntroduction:function(e){
                var $el = $(e.currentTarget);
                var name = $el.siblings(".ceng").attr("data-name");
                // var progress = window.localStorage.getItem(name+"progress");
                var progress = ssUtil.load(name+"progress");
                if (progress == null || progress == 1) {
                    navigator.appInfo.openPdf(name+".pdf", function(){}, function(){})
                };
                
                // var id = $el.attr('data-id');
                // var index = $el.attr('index');
                // var nameStr = $('.seriesName > span',$el).html();
                // window.localStorage.setItem("activeSeriesName",nameStr); 
                // window.localStorage.setItem("Car",id); //储存车系的ID lxc
                // ssUtil.save('intro_id',id);
                // bfDataCenter.setToolsCarTypeId(id);
                // bfDataCenter.setToolsCarTypeIndex(index);
                // if(this._pushFrom === "toolkit/introduction")
                // {
                //     bfNaviController.pop(1);
                // }
                // else
                // {
                //     bfNaviController.push('/toolkit/introductionInfo.html',{
                //         nameStr: nameStr
                //     });
                // }
            },
            onLeft: function()
            {
                bfNaviController.pop(1);
            },
            onViewPush: function(pushFrom)
            {
                this._pushFrom = pushFrom;
            }
        });
    });