/** add by liangchengguang
 *  意见反馈
 */
define([
        'common/navView',
        'text!myinfo/feedback.html',
        'shared/js/notification',
        'iscroll',
        'shared/plugin_dialog/js/dialog',
        'common/disUtil',
        'fileUpload/ImageCache'
        ],
    function (View, viewTemplate, Notification, IScroll, dialog, disUtil,ImageCache) {

        var View = View.extend({
            id: 'more_feedback',
            events: {
                "click .feedbtn": "toSubmit",
                "click .back": "goBack",
                "click .CBAddButton":"addBackImg",
                "click .closeImg":"removeImg"
            },

            posGenHTML: function () {
                var areaId = this.getElement("#mainArea");
                var numId = this.getElement("#mainNum");
                disUtil.textAreaInit(areaId, numId, 200);
                //this.initContentType();
            },

            goBack: function () {
                window.history.back();
            },

            onShow: function () {
                var me = this;
                me.$el.find('#mainArea').bind('input prototypechange', function () {
                    var height = me.$el.find('#mainArea').height();
                    if (height < this.scrollHeight) {
                        this.style.height = this.scrollHeight + 2 + 'px';
                        if(!me.myScroll) return;
                        me.myScroll.refresh();
                        me.myScroll.scrollTo(0, me.myScroll.maxScrollY);
                    }
                });
            },
            initContentType: function(){
                var me = this;
                bfClient.getTucaoContentType({
                    type:"get",
                    success: function(data){
                        if (data.code == 0) {
                            me._datas = data.data;
                            me.tempSelect();
                        };
                    },
                    error: function(error){

                    }
                })
            },
            tempSelect: function(){
                var selectNode = this.getElement("#tucaoType");
                selectNode.empty();
                var optionsNode = "";
                for (key in this._datas) {
                    optionsNode = "<option value='"+key+"'>"+this._datas[key]+"</option>"
                    selectNode.append(optionsNode)
                };

            },
            removeImg:function(el){
                var me = this;
                var $ment = $(el.target);
                $ment.parent(".ImgContent").remove();
            },
            addBackImg:function(){
                var length = this.getElement(".contentBodyBottom").find(".ImgContent").length;
                if(length >=4){
                    Notification.show({
                        type:"info",
                        message:"问题截图上限为4张"
                    });
                    return;
                }
                var result=this.ReportFileStatus();
                if(result=="true"){
                    pictureSource=navigator.camera.PictureSourceType;
                    destinationType=navigator.camera.DestinationType;
                    this.getPhotolab(pictureSource.PHOTOLIBRARY);
                }
            },
            ReportFileStatus:function () {  //判断cordova.js是否存在
                var s = false;
                if (typeof navigator.camera !="undefined"){
                    s= "true";
                }
                return(s);
            },
            getPhotolab:function (source) {  //调用手机相册方法
                var el=this;
                navigator.camera.getPicture(function(imageURL){
                        el.onPhotoSuccess(imageURL);
                    }, function(message){
                        el.Fail(message);
                    },
                    {
                        quality : 75,
                        destinationType : destinationType.FILE_URI,
                        sourceType : source
                    });
            },
            Fail:function (message) {  //照片回调失败
                console.log("调用手机失败");
            },
            onPhotoSuccess:function (imageURI) {  //选择照片成功的回调函数
                var self = this;
                if (imageURI.substring(0,21)=="content://com.android") {
                  photo_split=imageURI.split("%3A");
                  imageURI="content://media/external/images/media/"+photo_split[1];
                }
                var ItemStr = "<div class='ImgContent'><img class='closeImg' src='../Laboratory/images/wallet_nfc_charge_failure_icon.png'/>"
                          +"<img class='CBBIcon' src='"+imageURI+"'/></div>";
                $(this.getElement(".CBAddButton")).before(ItemStr);
            },
            upfeedImage:function(Images,bodyText){
                var me =this;
                var imageupload=bfDataCenter.getBaseConfig_dssUploadUrl()+"&token="+window.localStorage.token; //文件上传地址
                function infoUp(info,Id){
                    me.uiRemoveChrysanthemum();
                    bfClient.postFeedback({
                        data: {
                            tucaoContent:info,
                            voiceLocation:Id,
                            userPhone: bfDataCenter.getUserName()
                        },
                        beforeSend: function () {
                            if (me.$el.parent().find('.chrysanthemum').length === 0) {
                                me.$el.parent().append("<div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>发送中...</div></div>");
                            }
                        },
                        success: function (data) {
                            me.getElement(".feedbtn")[0].disabled = false;
                            if (data.success) {
                                var d = dialog.createDialog({
                                    autoOpen: true, //默认为true
                                    closeBtn: false,
                                    buttons: {
                                        '确定': function () {
                                            window.history.go(-1);
                                            this.close(); //所有逻辑必须放在关闭之前
                                        }
                                    },
                                    content: '非常感谢您的反馈，我们会对您宝贵的意见进行详细的分析'
                                });
                            } else {
                                Notification.show({
                                    type: "error",
                                    message: '提交失败'
                                });
                            }
                        },
                        error: function (xhr, status) {
                            me.getElement(".feedbtn")[0].disabled = false;
                            Notification.show({
                                type: "error",
                                message: '提交失败'
                            });
                        },
                        complete: function () {
                            me.$el.parent().find('.chrysanthemum').remove();
                        }
                    });
                }
                var fail=function () {
                    me.uiRemoveChrysanthemum();
                    me.getElement(".feedbtn")[0].disabled = false;
                };
                ImageCache.uploadMoreFile(imageupload,Images,function(Idstring){infoUp(bodyText,Idstring);},fail);
            },
            toSubmit: function () {
                var me = this;
                var bodyText = $("#mainArea").val();
                var tucaoType = me.getElement("#tucaoType").val();
                if (bodyText === "#debug") {
                    bfDebugManager.setDebugable(!bfDebugManager.isDebugable());
                    return;
                }
                if(bodyText === "#logins"){
                    loginOut = function () {
                        console.log('多点登录已开启')
                    };
                    Notification.show({
                        type: "info",
                        message: "多点登录开启"
                    })
                    return;
                }
                if(bodyText === "token"){
                    window.localStorage.token = "";
                    Notification.show({
                        type: "info",
                        message: "token已清空"
                    });
                    return;
                }
                //if (bodyText.indexOf("#debugurl") != -1) {  //TODO : 添加调试模式
                //    var url = bodyText.split("#")[2];
                //    if (url) {
                //        window.localStorage.clear();
                //        window.sessionStorage.clear();
                //        window.sessionStorage.setItem("debugurl", url);
                //    } else {
                //        window.localStorage.clear();
                //        window.sessionStorage.clear();
                //        window.sessionStorage.setItem("debugurl", "http://tspdemo.changan.com.cn");
                //    }
                //    Notification.show({
                //        type: "info",
                //        message: "开启调试模式"
                //    });
                //    bfAPP.gotoLogin();
                //    return;
                //}
                //if (bodyText === "#undebugurl") {  //TODO : 解除调试模式
                //    window.localStorage.clear();
                //    window.sessionStorage.clear();
                //    //window.sessionStorage.removeItem("debugurl");
                //    Notification.show({
                //        type: "info",
                //        message: "退出调试模式"
                //    });
                //    bfAPP.gotoLogin();
                //    return;
                //}
                var reg = /[€•¥₱¢¤]+/;
                if (reg.test(bodyText)) {
                    Notification.show({
                        type: "error",
                        message: '内容不能包含特殊字符'
                    });
                    return;
                }
                if (bodyText.trim().length === 0) { //内容不能为空
                    Notification.show({
                        type: "error",
                        message: '内容不能为空'
                    });
                    return;
                }
                var summary = "";
                if (typeof cordova != "undefined") {

                }

                /**
                *获取问题截图
                *voiceLocation
                *type String
                */
                var Images = me.getElement(".contentBodyBottom").find(".ImgContent");
                var ImagePath = new Array();
                me.getElement(".feedbtn")[0].disabled = true;
                if(Images.length > 0 ){
                    me.uiAddChrysanthemum();
                    for(var i=0;i<Images.length;i++){
                        var Path = $(Images[i]).find(".CBBIcon").attr("src");
                        ImagePath.push(Path);
                    }
                    me.upfeedImage(ImagePath,bodyText);
                }else{
                    me.SubmitInfo(bodyText, tucaoType);
                }
            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>发送中...</div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                $('.chrysanthemum').remove();
            },
            SubmitInfo:function(info,tucaoType,Id){
                var me =this;
                bfClient.postFeedback({
                    data: {
                        tucaoContent:info,
                        voiceLocation:Id,
                        userPhone: bfDataCenter.getUserName(),
                        tucaoType:tucaoType
                    },
                    beforeSend: function () {
                        if (me.$el.parent().find('.chrysanthemum').length === 0) {
                            me.$el.parent().append("<div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>发送中...</div></div>");
                        }
                    },
                    success: function (data) {
                        me.getElement(".feedbtn")[0].disabled = false;
                        if (data.success) {
                            var d = dialog.createDialog({
                                autoOpen: true, //默认为true
                                closeBtn: false,
                                buttons: {
                                    '确定': function () {
                                        window.history.go(-1);
                                        this.close(); //所有逻辑必须放在关闭之前
                                    }
                                },
                                content: '非常感谢您的反馈，我们会对您宝贵的意见进行详细的分析',
                            });
                        } else {
                            Notification.show({
                                type: "error",
                                message: '提交失败'
                            });
                        }
                    },
                    error: function (xhr, status) {
                        me.getElement(".feedbtn")[0].disabled = false;
                        Notification.show({
                            type: "error",
                            message: '提交失败'
                        });
                    },
                    complete: function () {
                        me.$el.parent().find('.chrysanthemum').remove();
                    }
                });
            }
        });

        return View;

    });
