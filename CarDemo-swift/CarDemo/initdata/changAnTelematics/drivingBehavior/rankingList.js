define([
        'common/navView',
        'text!drivingBehavior/rankingList.html',
        'butterfly',
        'shared/js/notification',
        'iscroll',
    ],
    function (View, viewTemplate, Butterfly, Notification, IScroll) {
        var Base = View;
        var BehaviorClient = BehaviorClient;
        var Client = Client;
        return Base.extend({
            id: "rankingList",
            html: viewTemplate,
            BehaviorClient: BehaviorClient,
            Client: Client,
            events: {
                //"click #contentBottom": 'shareTo',
                //"touchstart #contentBottom": 'shareToStart',
                //"touchend #contentBottom": 'shareToEnd'
            },
            shareToStart: function () {
                this.$('#contentBottom').addClass('clickBackground');
            },
            shareToEnd: function () {
                this.$('#contentBottom').removeClass('clickBackground');
            },
            onRight: function () {
                this.shareTo();
            },
            posGenHTML: function () {

                this.createShardMyInfoData();


                this.UISetHeadImg(this.shardMyInfoData.faceImg);

                if (parseInt(this.shardMyInfoData.ranking) < 3) {
                    this.$('#myRankingNumber').addClass('active');
                }

                var rankPercent = (Number(this.shardMyInfoData.rankingTotal) - Number(this.shardMyInfoData.ranking)) / Number(this.shardMyInfoData.rankingTotal);
                if (rankPercent) {
                    rankPercent = rankPercent * 100;
                    rankPercent = rankPercent.toFixed(0);
                }
                this.$('#myRanking span').html(window.sessionStorage.getItem('ranking'));
                this.$('#myRankingNumber').html(window.sessionStorage.getItem('ranking'));

                this.$('#myRankingScore span').html(window.sessionStorage.getItem('totalScore'));
                this.$('#rankingTotal span').html(rankPercent);
                this.$('#myRankingDrivingName').html(this._lvChangeValue());
                this.initScroll();
            },
            createShardMyInfoData: function () {
                this.shardMyInfoData = {};

                var myInfo = bfDataCenter.getUserSessionData();
                var faceImg = myInfo.faceImg;
                var rankLevelName = JSON.parse(window.localStorage.rankLevelName);

                var ranking = window.sessionStorage.getItem('ranking');
                var totalScore = window.sessionStorage.getItem('totalScore');

                var rankingTotal = bfDataCenter.getBaseConfig_totalUserNum();

                this.shardMyInfoData.faceImg = faceImg;
                this.shardMyInfoData.ranking = ranking;
                this.shardMyInfoData.rankName = rankLevelName.title;
                this.shardMyInfoData.totalScore = totalScore;
                this.shardMyInfoData.rankingTotal = rankingTotal;
                this.shardMyInfoData.name = myInfo.userFullname;
            },
            UISetHeadImg: function (faceImg) {
                if (faceImg != '') {
                    this.$('#myHeadImg').css({'background-image': 'url(' + bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + faceImg + ')'});
                } else {
                    this.$('#myHeadImg').css({'background-image': 'url(../myinfo/image/head.png)'});
                }
            },
            onShow: function () {
                if (!this.first) {
                    this.getRankingList();
                    this.first = true;
                }
            },

            initScroll: function () {
                var me = this;
                if (!me.myscroll) {
                    me.myscroll = new IScroll(this.$('#wrapper')[0], {
                        mouseWheel: true
                    });
                } else {
                    me.myscroll.refresh();
                }
            },
            getRankingList: function () {
                var me = this;
                bfClient.getRankingList({
                    type: "POST",
                    dataType: "json",
                    success: function (data) {
                        if (data && data.code == 0) {
                            if (data.data && data.data && data.data.length) {
                                var newData = data.data;
                                var length = data.data.length;
                                var templateList = '';
                                var templateItem;
                                var rankingTemplate = me.$('#rankingListTemplate').html();
                                for (var i = 0; i < length; i++) {
                                    templateItem = '';

                                    newData[i].rankingNumber = i + 1;
                                    newData[i].rankingDrivingName = newData[i].rankName;
                                    if (newData[i].faceImg) {
                                        newData[i].url = newData[i].faceImg;
                                    }
                                    template = _.template(rankingTemplate, newData[i]);
                                    templateList += template;
                                }
                                me.$('#rankingList ul').html(templateList);
                                me.$('.message').hide();
                                me.$('.message > .empty').hide();
                                me.$('.message > .error').hide();


                            } else {
                                //没有数据
                                me.$('.message').show();
                                me.$('.message > .empty').show();
                                me.$('.message > .error').hide();
                                Notification.show({
                                    type: "info",
                                    message: "没有数据"
                                })


                            }
                        } else {
                            me.$('.message').show();
                            me.$('.message > .empty').hide();
                            me.$('.message > .error').show();
                            Notification.show({
                                type: "error",
                                message: "服务器开小差"
                            })

                        }
                    },
                    error: function () {
                        me.$('.message').show();
                        me.$('.message > .empty').hide();
                        me.$('.message > .error').show();
                        Notification.show({
                            type: "error",
                            message: "网络开小差"
                        })

                    },
                    complete: function () {
                        me.initScroll()
                    }

                })
            },
            _lvChangeValue: function () {
                var rankLevelName = JSON.parse(window.localStorage.rankLevelName);

                var value = rankLevelName.title;
                return value;
            },
            shareTo: function () {
                var destId = encodeURIComponent(JSON.stringify(this.shardMyInfoData));   //目的地ID
                // var destId = JSON.stringify(this.shardMyInfoData);   //目的地ID
                var descripte = escape(window.sessionStorage.getItem("Drivingdescipte")); //获取描述并编码
                // var descripte = window.sessionStorage.getItem("Drivingdescipte"); //获取描述并编码
                var isNev = window.localStorage['isNev'];
                var myRank = window.sessionStorage.getItem('ranking');
                var url = bfConfig.server + "/static/Test.html?rank=" + destId + "&describe=" + descripte + "&isNev=" + isNev;
                var content = "我在欧尚Style排行第"+ myRank +"名,快来看看你的车技排名把";
                var title = '欧尚Style';
                var img = "https://bac.oushangstyle.com/static/img/share.jpg";
                //this.$('#contentBottom').addClass('clickBackground');
                 var data = {
                                liknId:0,
                                shareActType:'',
                               shareUrl: url,
                               results:'',
                               isShareCallback:false,
                               shareUrl: url, 
                               shareDesc: content, 
                               shareTitle: title, 
                               shareImg: img, 
                               shareType:3   // 3好友或朋友圈
                            }
                            OSApp.shareTo(JSON.stringify(data), 'wxCallBack');
                // navigator.appInfo.shareMyWall({url: url, myRank: myRank}, function () {
                // }, function () {
                // });
            }
        });
    });