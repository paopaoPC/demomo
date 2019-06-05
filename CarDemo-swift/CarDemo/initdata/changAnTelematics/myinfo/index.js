/**
 * Created by KirK-Jiang on 2015/1/21.
 */
define([
        'common/navView',
        'butterfly',
        "text!myinfo/index.html",
        'shared/plugin_dialogOld/js/dialog',
        'shared/js/notification',
        "modulesManager/ModuleManager",
        'common/ssUtil',
        "application/AppConfig"
    ],
    function (View, Butterfly, template, dialog, Notification, ModuleManager, ssUtil, AppConfig) {
        var Base = View;
        return Base.extend({
            id: 'myinfo',
            html: template,
            events: {
                "click #msg-btn": "showNotifyDetail",
                "click #setting-btn": "clickPushToggle",
                "click .navigate-right": "goToDetail",
                "click #logout": "logout",
                "click #my-info-violation": "gotoViolation",
                "click #modifyPassword": "modifyPassword",
                "click #modifyTelphone": "modifyTelphone",
                "click .my-drive-imfor ul, #rank": "goToMyRank",
                "click #my-info-laboratory": "golaboratory",

                // 跳转 话题，互助，活动，关注，粉丝
                "click .changan-momey-topic": "goTopic",
                "click .changan-momey-help": "goHelpEach",
                "click .changan-momey-activity": "goActiveList",
                "click .changan-momey-medal": "goMedal",
                "click .changan-momey-collection": "goCollection",
                "click .ti-concern": "goMyConcern",
                "click .ti-follower": "goMyFans",


                "click .goMemberRightIcon": "goMemberCenter",


                "click #safeCenter": "gotoSafeCenter",
                "click #privacyAgreement": "gotoArgument",
                "click #navigate-update": "checkUpdate",
                "click #noticeSetting": "gotoNoticeSet",
                "click #myInfoHead": "goToReviseMyinfo"
            },
            goTopic: function () {
                bfNaviController.push("myInfoCenter/topic.html")
            },
            goHelpEach: function () {
                bfNaviController.push("myInfoCenter/helpEach.html")
            },
            goActiveList: function () {
                bfNaviController.push("myInfoCenter/activeList.html")
            },
            goMyConcern: function () {
                bfNaviController.push("myInfoCenter/myConcern.html")
            },
            goMyFans: function () {
                bfNaviController.push("myInfoCenter/myFans.html")
            },
            goMemberCenter: function () {
                if (this._isauth != 1) {
                    // bfNaviController.push('/member/changanVip-signIn.html', {
                    //     type: 'changAnVip'
                    // });
                    window.openExtraUrl("http://qqfw.changan001.cn/RecomenAndRegister/Nindex?caopenid="+bfDataCenter.getUserValue("myInfo"),"车主认证");
                } else {
                    bfNaviController.push("myInfoCenter/right/index.html")
                }
            },
            goMedal: function () {
                bfNaviController.push("myInfoCenter/myMedalList.html")
            },
            goCollection: function () {
                bfNaviController.push("myInfoCenter/collection.html")
            },


            goToReviseMyinfo: function (e) {
                e.stopPropagation();
                bfNaviController.push("myinfo/reviseMyinfo.html")
            },
            gotoNoticeSet: function () {
                bfNaviController.push("myinfo/noticeSetting.html");
            },
            gotoArgument: function (el) {
                var $target = $(el.currentTarget);
                //bfNaviController.push("control/checkPin.html")
                bfNaviController.push("myinfo/incallArgument.html");
            },
            gotoSafeCenter: function (el) {
                var $target = $(el.currentTarget);
                bfNaviController.push("myinfo/safeCenter.html");
            },
            modifyPassword: function (el) {
                var $target = $(el.currentTarget);
                bfNaviController.push("myinfo/modifyPasswordStep1.html");
            },
            golaboratory: function () {
                butterfly.navigate("laboratory/index.html");
            },
            // 会员相关
            goMember: function (goUrl) {
                this.uiAddChrysanthemum();
                this.memberUserInfo(goUrl);
            },
            //用户信息加载渲染
            memberUserInfo: function (goUrl) {
                var me = this;
                var user_info_data = window.localStorage.getItem("user_info_cache_data");
                if (user_info_data) {
                    me.judgeState(JSON.parse(user_info_data), goUrl);
                }
                else {
                    bfClient.getAccountInfoByToken({
                        success: function (data) {
                            if (data.code == "0") {
                                window.localStorage['user_info_cache_data'] = JSON.stringify(data.data);
                                me.judgeState(data.data, goUrl);
                            }
                            else {
                                // $(me.el).html("");
                                Notification.show({
                                    type: "error",
                                    message: data.msg
                                });
                            }
                        }
                    });
                }

            },
            //判断是否为长安会员并注册跳转事件
            //如果缓存未过期，会出现缓存里没有window.localStorage['cv-cardNumber']的情况
            judgeState: function (data, goUrl) {
                var me = this;
                // 如果不设置 ['user_info_cache_data']，进入后退列表页面，还是会根据实际到底注册过没来判断是否进去注册页，不一定要请求接口 
                // data.cycid = 'S10000171'; 
                // 设置['user_info_cache_data']的点 在登录和注册会员(gettoken)的时候
                if (data.cycid != "" && data.cycid != undefined) {
                    window.localStorage['cv-cardNumber'] = data.cycid;
                    //谢文文增加，getVipInfo用于获取车主用户信息
                    this.getVipInfo(goUrl);
                } else if (data.sycid != "" && data.sycid != undefined) {
                    window.localStorage['cv-cardNumber'] = data.sycid;
                    //谢文文增加，getVipInfo用于获取车主用户信息
                    this.getVipInfo(goUrl);
                } else {
                    //20160505谢文文修改，如果查到SSO账号信息里没有商用车会员卡号
                    //不再重复请求获得SSO账号信息接口，直接进入CRM会员认证页面
                    bfNaviController.push('/member/index.html', {
                        type: 'changAnVip'
                    });
                    this.uiRemoveChrysanthemum();

                }
            },
            //获取会员信息,谢文文增加window.localStorage['cv-vip-status']--会员状态
            //20160505谢文文修改，判断会员状态时的逻辑
            getVipInfo: function (goUrl) {
                var me = this;
                var cardNumber = window.localStorage['cv-cardNumber'];
                // VipClient.ajax({
                //     url: bfConfig.server + "/api/personalinfo/memberinfo",
                //     data: {
                //         cardNumber: cardNumber
                //     },
                //     type: "POST",
                //     success: function (response) {
                //         if (response && response.code == 0 && response.data) {
                //             window.localStorage['cv-uid'] = response.data[0].uid;
                //             window.localStorage['cv-vip-status'] = response.data[0].status;
                //             window.localStorage['cv-vip-info'] = JSON.stringify(response.data[0]);
                //             if (response.data[0].status == 'Active') {
                //                 // bfNaviController.push('/member/index.html', {
                //                 //     type: 'vipInfoList'
                //                 // });
                //                 bfNaviController.push(goUrl);
                //                 me.uiRemoveChrysanthemum();
                //             }
                //             else {
                //                 Notification.show({
                //                     type: "error",
                //                     message: "该会员已被冻结！"
                //                 });
                //                 me.uiRemoveChrysanthemum();

                //             }
                //         } else {
                //             Notification.show({
                //                 type: "error",
                //                 message: response.msg
                //             });
                //             me.uiRemoveChrysanthemum();
                //         }


                //     },
                //     error: function () {
                //         Notification.show({
                //             type: "error",
                //             message: '获取数据失败，请检查网络'
                //         });
                //         me.uiRemoveChrysanthemum();
                //     }

                // });

            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.find('.content').append("<div id='chrysanthemumWarp'  style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active'><div></div><div style='font-size: 14px;color: white;margin-top: 50px;text-align: center;'>加载中...</div></div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                me.$el.find('#chrysanthemumWarp').remove();
            },
            //@@@@@@@@@@@@@@@@@@@@@@@@@
            modifyTelphone: function (el) {
                var $target = $(el.currentTarget);
                bfNaviController.push("myinfo/modifyTelphone.html");
            },
            isUpadting: false,
            gotoViolation: function () {
                butterfly.navigate("violation/index.html");
            },
            goToMyRank: function () {
                var userId = bfDataCenter.getUserSessionData().id;
                bfNaviController.push("rank/rankingList.html", userId);
            },
            goToDetail: function (el) {
                var me = this;
                var $target = $(el.currentTarget);
                var dataValue = $target.attr("data-value");
                if (dataValue == "my-info-services") {
                    butterfly.navigate("myinfo/myService.html");
                } else if (dataValue == "my-info-cars") {
                    butterfly.navigate("cars/index.html");
                } else if (dataValue == "serviceRecord") {
                    this.goMember("carLife/serviceRecord/index.html")
                } else if (dataValue == "my-info-violation") {
                    butterfly.navigate("violation/index.html");
                } else if (dataValue == "my-info-message") {
                    //if(AppConfig.appVersion == 2.9){
                    //    bfNaviController.push("carLife/newsCenter/index.html");
                    //}else{
                    butterfly.navigate("toolkit/test.html");
                    //}
                } else if (dataValue == "my-info-toolkit") {
                    butterfly.navigate("toolkit/index.html?type=fromMyinfo");
                } else if (dataValue == "my-info-navigation") {
                    butterfly.navigate("autoNavigation/index.html");
                } else if (dataValue == "my-info-suggest") {
                    butterfly.navigate("/myinfo/feedback.html");
                } else if (dataValue == "nearbyServer") {
                    navigator.appInfo.openBolaaNearbyService()
                } else if (dataValue == "addOilServer") {
                    navigator.appInfo.openBolaaGasService()
                } else if (dataValue == "rescueServer") {
                    navigator.appInfo.openBolaaRescue()
                } else if (dataValue == "my-info-shared") {
                    navigator.appInfo.shareAll({
                        "Title": '长安欧尚',
                        "Text": '长安欧尚下载地址',
                        "Url": "http://cv.changan.com.cn/app/"
                    }, function () {
                    }, function () {
                    });
                } else if (dataValue == "wallet") {
                    // butterfly.navigate("myInfoCenter/myPurse.html");
                    // 钱包
                    butterfly.navigate("vipInfo/vipInfoPointsIndex.html")
                } else if (dataValue == "collection") {
                    butterfly.navigate("myInfoCenter/collection.html");
                } else if (dataValue == "mission") {
                    butterfly.navigate("myInfoCenter/myTaskCenter.html");
                } else if (dataValue == "shopping") {
                    butterfly.navigate("myInfoCenter/ouShangMall.html");
                } else if (dataValue == "appSetting") {
                    butterfly.navigate("myinfo/myinfo-setting.html");
                }
            },
            logout: function (event) {
                var me = this;
                dialog.createDialog({
                    closeBtn: false,
                    buttons: {
                        '确定': function () {
                            me.goLogout();
                            this.close();
                        },
                        '取消': function () {
                            this.close();
                        }
                    },
                    content: "是否确定注销当前用户?"
                });
            },
            goLogout: function () {
                var me = this;
                if (navigator.packaging) {
                    me.uiAddChrysanthemum();
                    navigator.packaging.logout(
                        {token: window.localStorage.token},
                        function (data) {
                            if (data.code == 0) {
                                window.localStorage.removeItem("token");
                                window.localStorage.removeItem("password");
                                window.localStorage.removeItem("isLogin");
                                window.hasChangeCar = true;
                                bfAPP.gotoLogin();
                                if (typeof cordova != "undefined") {
                                    navigator.appInfo.LogoutIM();
                                }
                            } else {
                                Notification.show({
                                    type: "error",
                                    message: data.msg
                                });
                            }
                            me.uiRemoveChrysanthemum();
                        },
                        function (error) {
                            var eMsg = '发生未知错误';
                            if (typeof(error) === 'string') eMsg = error;
                            if (typeof(error) === 'object') {
                                if (error.status == 0) eMsg = "网络开小差";
                            }
                            me.uiRemoveChrysanthemum();
                            Notification.show({
                                type: "error",
                                message: eMsg
                            });
                        }
                    );
                    return;
                }
                bfClient.userLogout(function (data) {
                    if (data.OK) {
                        window.localStorage.removeItem("token");
                        window.localStorage.removeItem("password");
                        window.localStorage.removeItem("isLogin");
                        bfAPP.gotoLogin();
                        window.hasChangeCar = true;
                        // navigator.appInfo.LogoutIM();
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        });
                    }
                });
            },
            showNotifyList: function (event) {
                butterfly.navigate("/myinfo/notify-list.html?whatsnewIndex=false");
            },
            gotoRank: function () {
                butterfly.navigate("/rank/index.html");
            },
            showNotifyDetail: function (event) {
                butterfly.navigate('/myinfo/notify-detail.html?catalogId=CVAds&id=' + $(event.target).attr("data-contentId"));
            },
            clickPushToggle: function (event) {
                var btn = $(event.target);
                if (btn.hasClass("toggle"))
                    btn.toggleClass("active");
                else
                    btn.parent().toggleClass("active");
            },
            showFeedBack: function (event) {
                $(event.currentTarget).parent(".table-view-cell").css("background-color", "#151b26");
                butterfly.navigate("/myinfo/feedback.html");
            },
            onViewBack: function (backFrom, backData) {
                var me = this;
                if (backData && backData.from == "reviseMyinfo") {
                    this.renderUserInfo();
                }
            },
            UIRenderMyInfo: function () {
                var me = this;
                var userInfoCacheData = window.localStorage['user_info_cache_data'] && JSON.parse(window.localStorage['user_info_cache_data'])
                if (userInfoCacheData) {
                    // 获取会员信息 = 积分 和 会员等级
                    // var cardNumber = userInfoCacheData.sycid;
                    // if(cardNumber){
                    //     bfClient.getMemberinfo({
                    //         data: {
                    //             cardNumber: cardNumber
                    //         },
                    //         success: function(res){
                    //             if(res && res.data && res.data[0] && res.success == true){
                    //                 var data = res.data[0]
                    //                 var cardLevelClassName;
                    //                 //转化会员等级
                    //                 switch (data.cardLevel) {
                    //                     case "GeneralCard":
                    //                         // cardLevelClassName = "GeneralCard";
                    //                         cardLevelClassName = "普卡会员";
                    //                         break;
                    //                     case "SilverCard":
                    //                         // cardLevelClassName = "SilverCard";
                    //                         cardLevelClassName = "银卡会员";
                    //                         break;
                    //                     case "GoldCard":
                    //                         // cardLevelClassName = "GoldCard";
                    //                         cardLevelClassName = "金卡会员";
                    //                         break;
                    //                     case "DiamondCard":
                    //                         // cardLevelClassName = "DiamondCard";
                    //                         cardLevelClassName = "钻石卡会员";
                    //                         break;
                    //                     default:
                    //                         // cardLevelClassName = "GeneralCard";
                    //                         cardLevelClassName = "普卡会员";
                    //                         break;
                    //                 }
                    //                 me.$('.my-info-merber').html(cardLevelClassName);
                    //                 me.$('.my-info-merber').show()
                    //                 // me.$('.changan-momey-score .value').html(data.integration)
                    //             } else {
                    //                 me.$('.my-info-merber').hide()
                    //                 // me.$('.changan-momey-score .value').html('--')
                    //             }

                    //         },
                    //         error: function(){
                    //             me.$('.my-info-merber').hide()
                    //             // me.$('.changan-momey-score .value').html('--')
                    //         }
                    //     })
                    // } else {
                    //     me.$('.my-info-merber').hide()
                    // }
                    bfClient.caidtomemberid({
                        data: {
                            uid: bfDataCenter.getUserSessionValue("userId")
                        },
                        success: function (data) {
                            if (data && data.errcode == 0) {
                                me.getmembertotal(data.returndata);
                                // me.getmymedal(data.returndata);
                                me.getmemberbl(data.returndata)
                            }
                        },
                        error: function () {
                            me._isauth = 0;
                            me.$('.my-info-merber').hide()
                            me.$('.myInfoHead-v').hide()
                            me.$('.changan-momey-medal .value').html('--');
                            me.$('.changan-momey-collection .value').html('--')
                        }
                    })

                } else {
                    me._isauth = 0;
                    me.$('.my-info-merber').hide()
                    me.$('.myInfoHead-v').hide()
                    me.$('.changan-momey-medal .value').html('--');
                    me.$('.changan-momey-collection .value').html('--')
                }
            },
            getmemberbl: function (memberID) {
                var me = this;
                bfClient.getmemberbl({
                    data: {
                        member_id: memberID
                    },
                    success: function (data) {
                        if (data && data.returndata) {
                            if (data.returndata.appellation) {
                                me.$('.my-info-merber').show()
                                me.$('.my-info-merber').html(data.returndata.appellation);
                            } else {
                                me.$('.my-info-merber').hide()
                            }
                            if (data.returndata.isauth == 1) {
                                me._isauth = 1
                            } else {
                                me._isauth = 0
                            }
                            if (data.returndata.isofficial == 1) {
                                me.$('.myInfoHead-v').attr('src', '../myinfo/image/v-official.png');
                                me.$('.myInfoHead-v').show();
                            } else if (data.returndata.isauth == 1) {
                                me.$('.myInfoHead-v').attr('src', '../myinfo/image/v-auth.png');
                                me.$('.myInfoHead-v').show();
                            } else {
                                me.$('.myInfoHead-v').hide()
                            }
                            me.$('.changan-momey-medal .value').html(data.returndata.medalcount);
                            me.$('.changan-momey-collection .value').html(data.returndata.collectioncount)
                        } else {
                            me._isauth = 0
                            me.$('.my-info-merber').hide()
                            me.$('.myInfoHead-v').hide()
                            me.$('.changan-momey-medal .value').html('--');
                            me.$('.changan-momey-collection .value').html('--')
                        }
                    },
                    error: function () {
                        me._isauth = 0;
                        me.$('.my-info-merber').hide()
                        me.$('.myInfoHead-v').hide()
                        me.$('.changan-momey-medal .value').html('--');
                        me.$('.changan-momey-collection .value').html('--')
                    }
                })
            },

            // getmymedal: function(memberID){
            //     var me = this;
            //     bfClient.getmymedal({
            //         data: {
            //             member_id: memberID
            //         },
            //         success: function(data){
            //             if(data && data.returndata){

            //                 me.$('.changan-momey-medal .value').html(data.returndata.length);

            //             } else {
            //                 me.$('.changan-momey-medal .value').html('--');
            //             }
            //         },
            //         error: function(){
            //             me.$('.changan-momey-medal .value').html('--');
            //         }
            //     })
            // },
            // 获取会员信息
            getmembertotal: function (memberID) {
                var me = this;
                bfClient.getmembertotalNew({
                    data: {
                        member_id: memberID
                    },
                    success: function (data) {
                        if (data && data.returndata) {
                            me.$('.changan-momey-topic .value').html(data.returndata.total1);
                            me.$('.changan-momey-help .value').html(data.returndata.total2);
                            me.$('.changan-momey-activity .value').html(data.returndata.total3);
                            me.$('.ti-concern .ti-item-value').html(data.returndata.total4);
                            me.$('.ti-follower .ti-item-value').html(data.returndata.total5);
                        } else {
                            me.$('.changan-momey-topic .value').html('--');
                            me.$('.changan-momey-help .value').html('--');
                            me.$('.changan-momey-activity .value').html('--');
                            me.$('.ti-concern .ti-item-value').html('--');
                            me.$('.ti-follower .ti-item-value').html('--');
                        }
                    },
                    error: function () {
                        me.$('.changan-momey-topic .value').html('--');
                        me.$('.changan-momey-help .value').html('--');
                        me.$('.changan-momey-activity .value').html('--');
                        me.$('.ti-concern .ti-item-value').html('--');
                        me.$('.ti-follower .ti-item-value').html('--');
                    }
                })
            },


            onShow: function (options) {
                this.UIRenderMyInfo();
                this.getElement(".table-view-cell").css("background-color", "#fff");
                this.getUnReadInfoNumber();
                var contacts = bfDataCenter.getUserSessionValue('contactsMobile');
                if (!contacts || contacts == null || contacts == 'null' || contacts == 'undefined') {
                    this.getElement('.noCantacts1').css("visibility", 'visible');
                } else {
                    this.getElement('.noCantacts1').css("visibility", 'hidden');
                }
            },

            posGenHTML: function () {
                if (deviceIsIOS) {
                    $(this.getElement(".content")).css("margin-top", "20px")
                }
                this.renderUserInfo();
                this.getNewMessage();
            },
            getUnReadInfoNumber: function () {
                /**
                 * 跟新  未读的消息数
                 */
                var me = this;
                bfClient.getUnReadInfoNumber({
                    data: {
                        // trackUserId: window.localStorage['userId'],
                        // realReceiverId: '',
                        actionType: bfDataCenter.getActionType()
                    },
                    success: function (netdata) {
                        if (netdata.status_code == 0 && netdata.data && (netdata.data != 0)) {
                            me.$('.message-number').show();
                        } else {
                            me.$('.message-number').hide();
                        }
                    },
                    error: function (error) {
                        me.$('.message-number').hide();
                    }
                });
            },
            _getHeadImg: function () {
                var me = this;
                var imgHtml;
                bfClient.loadUserInfo({
                    token: window.localStorage.getItem("token"), success: function (data) {
                        var container = me.getElement("#myInfoHeadImg");
                        if (data.code == 0) {
                            if (data.data.faceImg != '') {
                                container.attr("src", bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data.data.faceImg);
                            } else {
                                container.attr("src", "../myinfo/image/head.png");
                            }
                        }
                    }
                });
            },
            //查看是否有未读消息   2015-12-4  lxc
            getNewMessage: function () {
                var self = this;
                var token = window.localStorage.getItem("token");
                bfClient.getNewMes({
                    token: token,
                    success: function (data) {
                        self.mesLength = data.data;
                        //根据未读消息的个数渲染页面
                        self.mesLengthViewRender();
                    }
                });
            },
            //根据未读消息的个数渲染页面   //lxc 去掉小红点
            mesLengthViewRender: function () {
                if (this.mesLength > 0) {
                    this.getElement('#redShot').show();
                } else {
                    this.getElement('#redShot').hide();
                }
            },
            reloadData: function () {
                if (window.sessionStorage['loadMyInfoError'] === "true") {
                    window.sessionStorage.removeItem("loadMyInfoError");
                    this.onShow();
                }
            },
            //用户信息加载渲染
            renderUserInfo: function () {
                var me = this;
                var user_info_data = bfDataCenter.getUserSessionData();

                //缓存已过期
                if (user_info_data) {
                    // var container = me.getElement('#myinfo-tab-title');
                    // container.empty();
                    this.$('.my-info-text-simple').html(user_info_data.userFullname || '');

                    me._getHeadImg();
                    // container.on("click", function () {
                    //         bfNaviController.push("myinfo/reviseMyinfo.html")
                    //     }
                    // );
                }
            },
            //用户通知信息加载渲染
            renderMsgInfo: function () {
                var self = this;
                bfClient.loadMsgInfo({
                    success: function (data) {
                        if (data.code === 0) {
                            if (data.data && parseInt(data.data.totle) > 0) {  //lxc 去掉小红点

                            }
                        }

                    }
                });
            },
            checkUpdate: function () {
                //new ModuleManager().checkUpdates(false, function () {
                //
                //    }, function () {
                //
                //    }
                //)
                bfNaviController.push("myinfo/about.html");
            }
        });
    });
