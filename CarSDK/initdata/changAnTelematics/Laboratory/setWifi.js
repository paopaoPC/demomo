/**
 * Created by hp on 2016/10/17.
 */
define(
    [
        "common/navView",
        'butterfly',
        "shared/js/notification",
        "main/control-cmd",
        "shared/js/scroll-pull-down"
    ],
    function (View, Butterfly,Notification,controlCmd,ScrollPullDown)
    {
        var Base = View;
        cls = {}
        cls.events= {
            'click .switch ':'switch',
            "click .show-psw": "showPassword",
            "click #ssid": "notifySsid",
            "click #password":"notifyPsw"
            // "click .sure-buttom": "setWifi"
        }
        //下拉刷新
        cls.initScroll = function() {

            var me = this;
            var webPswNode = this.getElement(".web-psw");
            if (!me.scrollPullDown) {
                me.$pullDown = me.$('.pulldown');
                me.scrollPullDown = new ScrollPullDown({
                    el: me.$el,
                    onScrollCallback: function () {
                        me.initView(webPswNode);   
                    },
                    onScrollEnd: function () {
                        if (me.$pullDown.hasClass('flip')) {
                            me.$pullDown.addClass('loading');
                            me.$('.pulldown .label').html('正在刷新...');
                            me.scrollPullDown.scrollCallback();
                        }
                        me.scrollPullDown.setUILoadingPer(0);
                    }
                })
            } else {
                me.scrollPullDown.myscroll.refresh();
            }

        }
        cls.notifySsid = function(el){
            var data = $(el.target).text();
            bfNaviController.push("Laboratory/notifyWifi.html",{type:"ssid",data:data})
        }
        cls.notifyPsw = function(el){
            var data = $(el.target).text();
            bfNaviController.push("Laboratory/notifyWifi.html",{type:"password", data:data})
        }
        cls.onViewBack = function(backFrom, backData){
            if (backData) {
                if (backData.type == "ssid") {
                    this.getElement("#ssid").text(backData.data)
                }else{
                    this.getElement("#password").text(backData.data)
                }
            };
        }
        cls.showPassword = function(){
            var checkNode = this.getElement(".show-psw .check-icon");
            var psw = this.getElement("#password");
            if (!checkNode.hasClass('active')) {
              checkNode.addClass('active');
              psw[0].type= "text";
            }else{
              checkNode.removeClass('active');
              psw[0].type = "password"
            }
        };
        cls.switch = function () {
            var me=this;
            var checkIcon = me.getElement('.switch .check-icon');
            if (this._wifiAPSwitch == 0) {
                this._wifiAPSwitch = 1;
                checkIcon.parent(".checkBox").addClass("active");
                checkIcon.animate({left:"19px"},100)
            }else{
                this._wifiAPSwitch = 0;
                checkIcon.parent(".checkBox").removeClass("active");
                checkIcon.animate({left:"0"},100)
            }
            
        }

        cls.setWifi = function(){
            var me = this;
            this._ssid = this.getElement("#ssid").text();
            this._securityType = this.getElement("#securtyType").val();
            this._passw = this.getElement("#password").text();
            var checkIcon = me.getElement('.switch .check-icon');
            // var wifiAPSwitch;
            // if(checkIcon.hasClass('active')){
            //     this._wifiAPSwitch = 1;
            // }else{
            //     this._wifiAPSwitch = 0;
            // };
            if (this._ssid.length == 0) {
                Notification.show({
                    type:"error",
                    message:"请输入SSID"
                });
                return;
            };
            if (this._securityType != "0") {
                if (this._passw.length < 6 || this._passw.length >12) {
                    Notification.show({
                        type:"error",
                        message:"密码长度为6-12个字符"
                    });
                    return ;
                };
            };

            
            // this.onControlCar();
            //保存wifi设置信息，使得下次打开时自动填入
            var wifiConfig={
                ssid:this._ssid,
                securityType:this._securityType,
                passw:this._passw,
            }
            bfDataCenter.setUserSessionValue('wificonfig:'+me.carId,wifiConfig);

            controlCmd.send({
                data:{
                    carId:me.carId,
                    'cmd':"WifiUpdateSet",
                    'wifiSSID':me._ssid,
                    'wifiSecurity':me._securityType,
                    'wifiPassword':me._passw,
                    'wifiAPSwitch':me._wifiAPSwitch,
                },
                controlCarSuccess:function(){
                    bfDataCenter.setUserSessionValue('canOperateSet',false);
                    me.uiProgressReset("设置中...");
                },
                controlInfoError:function(){
                    bfDataCenter.setUserSessionValue('canOperateSet',false);
                    me.uiProgressResult("设置失败");
                },
                controlInfoFail:function(){
                    bfDataCenter.setUserSessionValue('canOperateSet',false);
                    me.uiProgressResult("设置失败");
                },
                controlInfoComplete: function(){
                    bfDataCenter.setUserSessionValue('canOperateSet',false);
                    me.uiProgressResult("设置成功");
                },
                controlInfoTimeout: function(){
                    bfDataCenter.setUserSessionValue('canOperateSet',false);
                    me.uiProgressResult("设置失败");
                },
                controlInfoRunning: function(){
                    bfDataCenter.setUserSessionValue('canOperateSet',true);
                    me.uiProgressRunning();
                }
            })
        }

        cls.uiProgressRunning = function(){

        }
        cls.uiProgressResult = function(str){
            var me = this;
            var node = $("#setWifi .sure-buttom");
            node.html('确定');
            Notification.show({
                type:"error",
                message:str
            });
            node.removeClass("changeStatus");
            node.on("click", function(){
                me.setWifi();
            })
            me._navRight.on("click",function(){
                me.onRight();
            })
        }
        cls.uiProgressReset = function(str){
            var me = this;
            var node = $("#setWifi .sure-buttom");
            node.addClass("changeStatus");
            node.unbind("click");
            me._navRight.unbind("click");
            node.html(str);
        }
        cls.onViewPush = function(pushfrom,pushData){
            this.carId=pushData.carId;
        };
        cls.posGenHTML = function(){
            var me = this;
            this._wifiAPSwitch = 0;
            var node = this.getElement(".sure-buttom");
            var webPswNode = this.getElement(".web-psw");
            // var showPswNode = this.getElement(".show-psw");
            var canSet = bfDataCenter.getUserSessionValue('canOperateSet');
            var canRefresh = bfDataCenter.getUserSessionValue('canOperateRefresh');
            if (canSet) {
                node.addClass("changeStatus");
                this.initConfig(webPswNode);
                this.initupdateTime();
                me._navRight.unbind("click");
            }
            if (canRefresh) {
                node.addClass("changeStatus");
                this.getElement(".sure-buttom").html("更新中...");
                this.initupdateTime();
                me._navRight.unbind("click");
            }
            if (!canSet && !canRefresh) {
                node.on("click", function(){
                    me.setWifi()
                });
                this.initView(webPswNode)
            }
            this.getElement("#securtyType").on("change", function(){
                if (this.value == 0) {
                    webPswNode.hide();
                    // showPswNode.hide()
                }else{
                    webPswNode.show();
                    // showPswNode.show()
                }
            })
        }
        cls.onShow = function(){
            // this.initScroll();
        }
        cls.initView = function(webPswNode){
            var me= this;
            var ssidNode = this.getElement("#ssid");
            var typeNode = this.getElement("#securtyType");
            var pswNode = this.getElement("#password");
            var updateTime = this.getElement('.updateTime');
            var wifiConnect = this.getElement('.wifiConnect');
            var checkIcon = me.getElement('.switch .check-icon');
            bfClient.getTerminalWifiSetting({
                data:{
                    'carId':me.carId,
                },
                success: function(data){
                    if (data.code == 0) {
                        ssidNode.text(data.data.wifiSsid);
                        pswNode.text(data.data.wifiPassword);
                        if(data.data.recordTime) {
                            updateTime.text(data.data.recordTime.substring(0,19));
                        };
                        if(data.data.wifiOnnectionNum != null){
                            wifiConnect.text(data.data.wifiOnnectionNum+"个");
                        };
                        if (data.data.wifiApsWitch) {
                            me._wifiAPSwitch = 1;
                            checkIcon.parent(".checkBox").addClass("active");
                            checkIcon.animate({left:"19px"},100)
                        }else{
                            me._wifiAPSwitch = 0;
                            checkIcon.parent(".checkBox").removeClass("active");
                            checkIcon.animate({left:"0"},100)
                        }
                        bfDataCenter.setUserSessionValue('wifiUpdate'+me.carId,
                            {'recordTime':data.data.recordTime,
                             'wifiOnnectionNum':data.data.wifiOnnectionNum});
                        if (data.data.wifiSecurityType) {
                            //typeNode.find("option[value='1']").attr("selected", "selected")
                            typeNode.val(1);
                            webPswNode.show();
                            // showPswNode.show()
                        }else{
                            webPswNode.hide();
                            // showPswNode.hide()
                        }
                    }else{
                        Notification.show({
                            type:'error',
                            message:data.msg
                        })
                    }
                    // me.initScroll();
                },
                error: function(error){
                    Notification.show({
                        type:"error",
                        message:error.msg
                    })
                },
                complete: function(){
                    //让loding看不到
                    // me.scrollPullDown && me.scrollPullDown.resizePulldown();
                }
            })
        }
        //若状态为设置中,则页面打开时自动填写配置
        cls.initConfig=function (webPswNode) {
            var userConfig=bfDataCenter.getUserSessionValue('wificonfig:'+this.carId);
            if(userConfig != undefined && userConfig !=null){
                var ssidNode = this.getElement("#ssid");
                var typeNode = this.getElement("#securtyType");
                var pswNode = this.getElement("#password");
                this.getElement(".sure-buttom").html("设置中...");
                ssidNode.val(userConfig.ssid);
                pswNode.val(userConfig.passw);
                if(userConfig.securityType == '1'){
                    //typeNode.find("option[value='1']").attr("selected", "selected")
                    typeNode.val(1);
                    webPswNode.show();
                    // showPswNode.show()
                }else{
                    webPswNode.hide();
                    // showPswNode.hide()
                }
            }
        }
        cls.initupdateTime = function(){
            var me= this;
            var data = bfDataCenter.getUserSessionValue('wifiUpdate'+me.carId);
            if(data){
                var updateTime = this.getElement('.updateTime');
                var wifiConnect = this.getElement('.wifiConnect');
                if(data.recordTime) {
                    updateTime.text( data.recordTime.substring(0,19));
                };
                if(data.wifiOnnectionNum !=null){
                    wifiConnect.text(data.wifiOnnectionNum+"个")
                };
            }
        };
        cls.onRight = function(){
            var me = this;
            var webPswNode = this.getElement(".web-psw");
            // var showPswNode = this.getElement(".show-psw");
            controlCmd.send({
                data:{
                    'carId':me.carId,
                    'cmd':"WifiParam"
                },
                controlCarSuccess:function(){
                    bfDataCenter.setUserSessionValue('canOperateRefresh',false);
                    me.uiProgressReset("更新中...");
                },
                controlInfoError:function(){
                    bfDataCenter.setUserSessionValue('canOperateRefresh',false);
                    me.uiProgressResult("更新失败");
                },
                controlInfoFail:function(){
                    bfDataCenter.setUserSessionValue('canOperateRefresh',false);
                    me.uiProgressResult("更新失败");
                },
                controlInfoComplete: function(){
                    bfDataCenter.setUserSessionValue('canOperateRefresh',false);
                    me.uiProgressResult("更新成功");
                },
                controlInfoTimeout: function(){
                    bfDataCenter.setUserSessionValue('canOperateRefresh',false);
                    me.uiProgressResult("更新失败");
                },
                controlInfoRunning: function(){
                    bfDataCenter.setUserSessionValue('canOperateRefresh',true);
                    me.uiProgressRunning();
                },
                controlInfoSuccess:function(){
                    me.initView(webPswNode)
                }
            })
        }
        return Base.extend(cls)
    })