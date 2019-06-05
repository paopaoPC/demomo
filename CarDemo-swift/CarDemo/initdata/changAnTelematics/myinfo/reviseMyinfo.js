define([
        'common/navView',
        'text!myinfo/reviseMyinfo.html',
        'shared/js/client',
        'shared/timePicker/js/date',
        'shared/js/notification',
        "underscore",
        'myinfo/reviseMyinfo-client',
        "fileUpload/ImageCache"
    ],
    function(View, viewTemplate, Client, DatePicker, Notification,_, reviseMyinfoClient,ImageCache) {

        var View = View.extend({
            events: {
                "click .info_ul li:not('.lispe')":"goChangePage"
            },
            //跳转到不同的编辑页面
            goChangePage:function(el){
                var dataValue = $(el.currentTarget).attr("data-value");
                if(dataValue){
                    switch(dataValue){
                        case "head"://调用相册
                            this.changeHead();
                            break;
                        case "nickname"://修改昵称
                            bfNaviController.push("/myinfo/editNickname.html", {data:this._userinfo, typeName:"nickName"});
                            break;
                        case "gender"://修改性别
                            // bfNaviController.push("/myinfo/editGender.html", this._userinfo);
                            break;
                        case "userName":
                            bfNaviController.push("/myinfo/editNickname.html", {data:this._userinfo, typeName:"userName"});
                            break;
                    }
                }
            },
            onDeviceBack: function(){
                bfNaviController.pop(1,{from:"reviseMyinfo"});
                return false;
            },
            posGenHTML:function () {
                var self = this;
                var userInfo = bfDataCenter.getUserSessionData();
                //if(userInfo.faceImg&&userInfo.mobile&&userInfo.userName&&userInfo.userFullname&&userInfo.birthday&&userInfo.gender){
                    //头像
                    self._userinfo = userInfo;
                    if(userInfo.faceImg!=""){
                        self.getElement("#info_headimg")[0].src=bfDataCenter.getBaseConfig_dssDownLoad()+"&token="+window.localStorage.token+"&dsshandle="+userInfo.faceImg;
                    }else{
                        self.getElement("#info_headimg")[0].src="../myinfo/image/defaltHead.png";
                    }
                    //用户名
                    self.getElement("#info_mobile").html(userInfo.mobile);
                    self.getElement("#info_username").html(userInfo.userName);
                    //昵称
                    self.getElement("#info_nickname").html(userInfo.userFullname);
                    //生日
                    self.getElement("#info_birthday").html(userInfo.birthday);
                    self.getElement("#info_birthday_value").val(userInfo.birthday);
                    //性别
                    var index;
                    userInfo.gender == "m"?index = 0:index = 1;
                    self.getElement("#gender_select").find("option").eq(index).attr("selected","selected");
                    // self.bindDatePicker();
                    // self.bindSelect();
                //}
            },
            onShow: function() {
                this.getMsg();
            },
            onLeft: function(){
                bfNaviController.pop(1,{from:"reviseMyinfo"});
            },
            //拉取用户信息渲染页面
            getMsg: function() {
                var self = this;
                bfClient.getUserData(function(data) {
                        self._userinfo = data.data;
                        //头像
                        if(data.data.faceImg!=""){
                            self.getElement("#info_headimg")[0].src=bfDataCenter.getBaseConfig_dssDownLoad()+"&token="+window.localStorage.token+"&dsshandle="+data.data.faceImg;
                        }else{
                            self.getElement("#info_headimg")[0].src="../myinfo/image/defaltHead.png";
                        }
                        //用户名
                        self.getElement("#info_mobile").html(data.data.mobile);
                        self.getElement("#info_username").html(data.data.userName);
                        //昵称
                        self.getElement("#info_nickname").html(data.data.userFullname);
                        //生日
                        self.getElement("#info_birthday").html(data.data.birthday);
                        self.getElement("#info_birthday_value").val(data.data.birthday);
                        //性别
                        var index;
                        data.data.gender == "m"?index = 0:index = 1;
                        self.getElement("#gender_select").find("option").eq(index).attr("selected","selected");
                        self.bindDatePicker();
                        self.bindSelect();
                    },
                    function(error) {
                        var eMsg = '发生未知错误';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = '网络开小差';
                        }
                        Notification.show({
                            type: "error",
                            message: eMsg
                        });
                    }
                );
            },
            bindSelect:function(){
                var self = this;
                this.getElement("#gender_select").on("change",function(){
                    var index = $(this)[0].selectedIndex;
                    var value = $(this).find("option").eq(index).attr("value");
                    bfClient.saveMyinfo({
                        gender: value,
                        success:function(data){
                            if(data.success){
                                bfDataCenter.setUserSessionValue("gender",value);
                                Notification.show({
                                    "type":"info",
                                    "message":"修改成功"
                                });
                            }else{
                                Notification.show({
                                    "type":"error",
                                    "message":"修改失败"
                                });
                            }
                        },
                        error:function(data){
                            Notification.show({
                                type:"error",
                                message:"修改失败"
                            });
                        }
                });
                });
            },
            bindDatePicker: function() { //绑定日期控件
                window.$ = jQuery;
                var me = this;
                this._today = new Date().format("yyyy-MM-dd");
                var birthHid = $("#reviseMyinfo #info_birthday_value").val();
                me.dp = DatePicker($);
                var initTime = me.$el.find("#info_birthday").text() !== "" ? me.$el.find("#info_birthday").text() : moment('1970-01-01', 'YYYY-MM-DD');
                me.$el.find('#birth_datapicker').date({
                    theme: "date",
                    time: initTime
                }, function(data) {
                    data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    if (data > me._today) {
                        Notification.show({
                            type:"error",
                            message:"出生时间应该小于当前时间"
                        });
                        return ;
                    };
                    me.$el.find("#birth_datapicker").find("#info_birthday").text(data);
                    me.dp.time = data;
                    if (data != birthHid) {
                        //调用接口更新日期
                        if (reviseMyinfoClient.checkTime(data) || data == ''){
                            bfClient.saveMyinfo({
                                    birthDay: data,
                                    success: function(data) {
                                        window.localStorage.removeItem("user_info_cache_data");
                                        bfAPP.trigger("IM_EVENT_CAR_CHANGED");
                                    },
                                    error: function(error) {
                                        var eMsg = '发生未知错误';
                                        if (typeof(error) === 'string') eMsg = error;
                                        if (typeof(error) === 'object') {
                                            if (error.status == 0) eMsg = '网络开小差';
                                        }
                                        Notification.show({
                                            type: "error",
                                            message: eMsg
                                        });
                                    }
                                });
                        }
                    }

                }, function() {
                    //取消的回调
                });
            },
            changeHead:function(){      //从手机相册中选择照片 更换头像的方法  lxc
                var result=this.ReportFileStatus();
                if(result=="true"){
                    pictureSource=navigator.camera.PictureSourceType;
                    destinationType=navigator.camera.DestinationType;
                    this.getPhotolab(pictureSource.PHOTOLIBRARY);
                }else if(result=="false"){

                }
            },

            ReportFileStatus:function () {  //判断cordova.js是否存在
                var s;
                if (navigator.camera){
                    s= "true";
                }else{
                    s = "false";
                }
                return(s);
            },
            getPhotolab:function (source) {
                var el=this;
                navigator.camera.getPicture(function(imageURL){
                        el.onPhotoSuccess(imageURL);
                    }, function(message){
                        el.Fail(message);
                    },
                    {
                        quality : 30,
                        destinationType : destinationType.FILE_URI,
                        sourceType : source,
                        allowEdit : true,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions
                    });
            },
            Fail:function (message) {

            },
            onPhotoSuccess:function (imageURI) {
                var self = this;
                var imageupload=bfDataCenter.getBaseConfig_dssUploadUrl()+"&token="+window.localStorage.token;

                function filefail(error)
                {
                    Notification.show({
                        type: "error",
                        message: "头像上传失败"
                    });
                }
                function filesuccess(r) {
                    var imageId=eval(r.response)[0].result;
                    self.getElement("#info_headimg")[0].src=bfDataCenter.getBaseConfig_dssDownLoad()+"&token="+window.localStorage.token+"&dsshandle="+imageId;
                    self._userinfo.faceImg = imageId;
                    bfClient.saveMyinfo({
                        imgPath: imageId,
                        success: function(data) {
                            bfDataCenter.setUserSessionValue("faceImg",imageId); //更新本地头像缓存
                            Notification.show({
                                type: "info",
                                message: "头像更新成功"
                            });
                        },
                        error: function(error) {
                            var eMsg = '发生未知错误';
                            if (typeof(error) === 'string') eMsg = error;
                            if (typeof(error) === 'object') {
                                if (error.status == 0) eMsg = '网络开小差';
                            }
                            Notification.show({
                                type: "error",
                                message: eMsg
                            });
                        }
                    });
                }
                ImageCache.uploadFile(imageupload,imageURI,filesuccess,filefail);
            }
        });
        return View;
    });
