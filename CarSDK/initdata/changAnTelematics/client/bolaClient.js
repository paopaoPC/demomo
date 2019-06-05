define([
    '../../shared/js/md5.js'
], function (md5) {

    var cls = {};
    cls.requestWithToken = function (url, options) {
        var me = this;

        var isBackToLogin = window.localStorage.isBackToLogin;

        if (!(options.data instanceof FormData)) {
            options.data = _.extend({}, options.data, {
                token: localStorage.token
            });
        }


        var fnSuccess = options.success;

        options.success = function (ret) {
            if (ret.errcode == 10002) {
                if (window.localStorage.isBackToLogin == isBackToLogin) {
                    window.localStorage.isBackToLogin = new Date().valueOf().toString();
                    bfNaviController.startWith('/loginNew/index.html');
                }

                // me.getToken(function(){
                //     me.requestWithToken(url, options);
                // }, function(){
                //     //back to login
                //     bfNaviController.startWith('/loginNew/index.html');
                // });
            }
            else {
                fnSuccess(ret);
            }
        };

        $.ajax(url, options);
    };

    cls.getToken = function (data, success, fail) {

        var baseStr = 'username=' + data.username
            + '&password=' + data.password;

        baseStr += '&key=' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        data.sign = md5(baseStr);

        $.ajax({
            url: BolaaUrl.now + '/api.ashx?m=login',
            type: 'post',
            data: data,
            dataType: 'json',
            success: function (ret) {
                if (ret.errcode != 0) {
                    fail();
                }
                else {
                    localStorage.bolaaToken = ret.returndata;
                    success();
                }
            },
            error: fail
        })
    };

    // 获取白名单
    cls.getWhitePage = function (params, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getwhitelist";
        this.requestWithToken(url, {
            type: "post",
            success: function (data) {
                fn(JSON.parse(data));
            }
        })
    };

    // 路路宝签名
    cls.lunubaoSign = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/lunubaoSign";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            },
        })
    };


    // 获取会员登陆信息
    cls.getMemberlogin = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmemberinfo";
        this.requestWithToken(url, {
            type: "POST",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    }
    // 获取会员积分明细
    cls.gettransactiondetail = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gettransactiondetail";
        this.requestWithToken(url, {
            type: "POST",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        })
    }
    // 获取会员登陆信息
    cls.gettransaction = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gettransaction";
        this.requestWithToken(url, {
            type: "POST",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        })
    }

    // 获取天气城市列表
    cls.getWeatherCity = function (params, dataUrl, fn) {
        var url = BolaaUrl.old + "/common/weatherCitys";
        this.requestWithToken(url, {
            type: "get",
            success: function (data) {
                fn(data);
            }
        })
    }
    // 获取城市天气情况
    cls.getWeather = function (params, dataUrl, mydata, fn) {
        var url = BolaaUrl.old + "/common/weatherInfo";
        this.requestWithToken(url, {
            type: "get",
            data: mydata,
            success: function (data) {
                fn(data);
            }
        })
    }

    // 获取限行城市列表
    cls.getLimitCity = function (params, dataUrl, fn) {
        var url = BolaaUrl.old + "/common/xianxingCityInfo";
        this.requestWithToken(url, {
            type: "get",
            success: function (data) {
                fn(data);
            }
        })
    };
    // 获取限行信息
    cls.getLimit = function (params, dataUrl, mydata, fn) {
        var url = BolaaUrl.old + "/common/xianxingNoInfo";
        this.requestWithToken(url, {
            type: "get",
            data: mydata,
            success: function (data) {
                fn(data);
            }
        })
    };
    // 上传图片
    cls.uploadImage = function (params, dataUrl, mydata, fn) {
        var url = BolaaUrl.old + "/common/uploadImage";
        this.requestWithToken(url, {
            type: "post",
            data: mydata,
            success: function (data) {
                fn(data);
            }
        })
    };
    // 关注公众号 关注话题
    cls.addPublicNum = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/careAdd";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 公众号取消订阅
    cls.canclePublic = function (params, dataUrl, myData, fn, fn1) {
        var url = BolaaUrl.old + "/common/unsubscribe";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            },
        })
    };

    // 公众号消息提醒
    cls.publicNews = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/noinfo";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取所有公众号
    cls.getAllPublic = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/subscriptionInfo";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 支持违章查询城市
    cls.wzCitys = function (params, dataUrl, fn) {
        var url = BolaaUrl.old + "/common/wzCitys";
        this.requestWithToken(url, {
            type: "get",
            success: function (data) {
                fn(data);
            }
        })
    };

    // 违章信息查询
    cls.wzInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/wzInfo";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            },
            complate: function (e) {

            }
        })
    };


    // 获取全国油价
    cls.getOilPrice = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/oilInfo";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };// 获取全国油价
    cls.getOilPrice = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/oilInfo";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 活动报名
    cls.signUp = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=activejoin";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };
    // 活动信息
    cls.getActivities = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getactivelist";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            dataType: "json",
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        })
    };

    // 通过ID获取活动信息
    cls.getPublicActiviteById = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getactivedetail";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        })
    };

    // 活动详情留言列表
    cls.getActivitiesDetailReplyList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gettalkcommentlist";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            dataType: "json",
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        })
    };

    // 通过ID获取资讯信息
    cls.getPublicAttentionById = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getPublicAttentionById";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 顶部搜索
    cls.getTopSearch = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getTopSearch";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取banner图片
    cls.getBannerImg = function (params, dataUrl, myData, fn) {
        //var url = "http://qqfw.changan001.cn/banners/getlist";
        var url = BolaaUrl.now + "/api.ashx?m=getbannerlist";
        this.requestWithToken(url, {
            type: "post",
            success: function (data) {
                fn(data);
            }
        })
    }

    // 获取服务页banner图片
    cls.getbannerlist1 = function (params, dataUrl, myData, fn) {
        //var url = "http://qqfw.changan001.cn/banners/getlist";
        var url = BolaaUrl.now + "/api.ashx?m=getbannerlist1";
        this.requestWithToken(url, {
            type: "post",
            success: function (data) {
                fn(data);
            }
        })
    }

    // 我报名的活动
    cls.getMyActivities = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyActivities";
        this.requestWithToken(url, {
            type: "get",
            data: {"user_id": "1"},
            success: function (data) {
                fn(data);
            }
        })
    };

    // 图片查询
    cls.getImg = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getImages";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取每日关注文章
    cls.getPublicattention = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getPublicattention";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            },
            error: function (e) {

            }
        })
    };

    // 获取每日关注文章
    cls.getPublicattention = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getPublicattention";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            },
            error: function (e) {

            }
        })
    };


    // 每日关注文章阅读
    cls.readPublicAttention = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/readPublicattention";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };


    // 每日关注历史信息
    cls.getPublicattentionPage = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getPublicattentionPage";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 每日关注文章分享
    cls.sharePublicAttention = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/sharePublicattention";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取维保记录
    cls.getmaintainlist = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmaintainlist";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取关注人信息
    cls.getCareMsg = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getCareMsg";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取粉丝信息
    cls.getFansMsg = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getFansMsg";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 获取推送信息
    cls.getInformationCenter = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getInformationCenter";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };


    // 积分消耗记录
    cls.getMyTransactionInfoVO = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyTransactionInfoVO";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };

    // 专属客服
    cls.getMyExclusiveService = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyExclusiveService";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };


    // 添加评价
    cls.evaluateAdd = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/evaluateAdd";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };


    // 获取我的兴趣
    cls.getMyInterest = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/myInterest";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        })
    };
    //获取车友圈版块信息
    cls.getCarFriendPart = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/topicPlate";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取车友圈版块信息
    cls.getTopicArticleByPlate = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getTopicArticleByPlate";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取关键字
    cls.getKeyWord = function (params, dataUrl, keyWord, fn) {
        var url = BolaaUrl.old + "/common/keyWordsFilter";
        this.requestWithToken(url, {
            type: "get",
            data: keyWord,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取逆编码城市
    cls.getMyCity = function (params, dataUrl, keyWord, fn) {
        var url = dataUrl;
        this.requestWithToken(url, {
            type: "get",
            data: keyWord,
            success: function (data) {
                fn(data);
            }
        });
    };


    //获取查找4S店信息
    cls.getMy4SMall = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/myEvaluate";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取4S店用户评价记录信息

    cls.getMyEvaluate = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmaintainevaluate";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取4S店评价记录信息
    cls.getMy4SEvaluate = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/my4SEvaluate";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取所有的话题（未推荐）
    cls.getAllTopicArticle = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getAllTopicArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取该话题所有的回复信息
    cls.getTopicArticleReply = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getTopicArticleReply";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取所有的话题（推荐）
    cls.getAllTopicArticleRecommon = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getAllTopicArticleRecommon";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    //获取我发表的话题
    cls.getMyTopicArticle = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyTopicArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取我关注的话题
    cls.getMyCareTopicArticle = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyCareTopicArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取我参与的话题
    cls.getMyInTopicArticle = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyInTopicArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取阅读文章后，阅读数增加
    cls.readTopicArticle = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/readTopicArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    //获取资讯阅读后，阅读数增加
    cls.readNewsMsg = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/readNewsMsg";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取话题点赞 数量增加
    cls.praiseArticle = function (params, dataUrl, myData, fn, fn1) {
        var url = BolaaUrl.old + "/common/praiseArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            },
            complete: function (data) {
                fn1(data)
            },
        });
    };
    //获取用户发表的话题
    cls.saveTopicArticle = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/saveTopicArticle";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //添加推荐购车信息
    cls.addRecommendCar = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/addrecommendcar";
        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //查找4S店信息
    cls.find4sShop = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/find4sshop";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //查询配件信息
    cls.getCarFittings = function (params, dataUrl, myData, fn) {
        //var url = BolaaUrl.old + "/common/carFittings";
        var url = BolaaUrl.now + "/api.ashx?m=getpartslist";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            },
        });
    };
    //查询配件车型接口
    //cls.getCarFittingsCars = function (params, dataUrl, myData, fn) {
    //    var url = BolaaUrl.old + "/common/carFittingsCars";
    //    var url = BolaaUrl.old + "/common/carFittingsCars";
    //    this.requestWithToken(url, {
    //        type: "GET",
    //        data: myData,
    //        success: function (data) {
    //            fn(data);
    //        }
    //    });
    //};
    // 获取车主手册的信息
    cls.getQueList = function (params, dataUrl, myData, fn) {
        var url = dataUrl + "/help/getlist";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            dataType: "json",
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取专属经销商信息
    cls.getMyDealerInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyDealerInfo";

        this.requestWithToken(url, {
            type: "get",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取作者信息
    cls.getAuthorInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/authorInfo";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //推荐购车省
    cls.getRecommendCarProvince = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/recommendCarDealerInfoProvince";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //推荐购车市
    cls.getRecommendCarCity = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/recommendCarDealerInfoCity";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //推荐购车经销商
    cls.getRecommendCarDealerInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/recommendCarDealerInfo";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取推荐购车记录
    cls.getMyRecommendCarInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/getMyRecommendCarInfo";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取话题点赞 数量减少
    cls.getCancelPraiseArticle = function (params, dataUrl, myData, fn, fn1) {
        var url = BolaaUrl.old + "/common/cancelPraiseArticle";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            },
            complete: function (data) {
                fn1(data);
            }
        });
    };

    //获取4S店所在的城市
    cls.get4SCity = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/get4SCity";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    cls.get4SInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/get4SInfo";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //通过ID寻找4S店信息
    cls.find4sshopbyid = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/find4sshopbyid";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //话题回复点赞
    cls.getPraiseReply = function (params, dataUrl, myData, fn, fn1) {
        var url = BolaaUrl.old + "/common/praiseReply";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            },
            complete: function (data) {
                fn1(data)
            }
        });
    };
    //话题回复点赞取消
    cls.cancelPraiseReply = function (params, dataUrl, myData, fn, fn1) {
        var url = BolaaUrl.old + "/common/cancelPraiseReply";
        this.requestWithToken(url, {
            type: "GET",
            data: myData,
            success: function (data) {
                fn(data);
            },
            complete: function (data) {
                fn1(data)
            }
        });
    };

    //查询常用配件信息
    cls.carCommonFittings = function (params, dataUrl, myData, fn) {
        //var url = BolaaUrl.old + "/common/carCommonFittings";
        var url = BolaaUrl.now + "/api.ashx?m=getofftenparts";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            },
        });
    };

    //修改个人信息接口
    cls.editUserInfo = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/editUserInfo";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取车型信息接口
    cls.SelectActionResult = function (params, dataUrl, myData, fn) {
        var url = dataUrl + "/Dictionary/SelectActionResult";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取车型列表与车型参数地址
    cls.getbrandinfo = function (params, dataUrl, myData, fn) {
        var url = dataUrl + "/api/getbrandinfo";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //保存话题评论的接口
    cls.getReplayTopic = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.old + "/common/replyTopic";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取资讯类型
    cls.getInformationType = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinformationtype";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //经销商顶部图片
    cls.getbusinessbanner = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getbusinessbanner";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };   //获取关注用户列表
    cls.getConcernList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getfollowlist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取粉丝用户列表
    cls.getFansList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getfanslist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取我发布的资讯列表
    cls.getTopicList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmypubinfomationlist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取首页资讯列表
    cls.getisshowinfomation = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getisshowinfomation";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取我发布的资讯详情
    cls.getinformationdetail = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinformationdetail";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取我的活动列表
    cls.getMyActiveList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyactivelist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取我的消息列表
    cls.getmymsglist = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmymsglist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取我的消息详情
    cls.getmsgdetail = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmsgdetail";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //会员认证
    cls.certification = function (myData, fn,err) {
        var url = BolaaUrl.now + "/api.ashx?m=certification";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            },
            error:function(msg){
                err(msg)
            }
        });
    };


    //资讯举报
    cls.setinformationreqort = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setinformationreqort";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //资讯详情评论
    cls.setinformationcomment = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setinformationcomment";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //资讯详情评论回复
    cls.setcommentrep = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setcommentrep";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //资讯详情评论列表
    cls.getinformationcommentlist = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinformationcommentlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //资讯详情更多回复列表
    cls.getinformationcomments = function (myData, fn) {
        var url =BolaaUrl.now + "/api.ashx?m=getinformationcomments";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //资讯详情评论点赞
    cls.setcommentpraise = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setcommentpraise";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取资讯是否点赞
    cls.isinformationprises = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=isinformationprises";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取资讯是否收藏
    cls.isinformationcollect = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=isinformationcollect";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //资讯点赞
    cls.setinformationpraise = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setinformationpraise";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //资讯收藏
    cls.setinformationcollect = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setinformationcollect";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //资讯取消收藏
    cls.setnoinformationcollect = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setnoinformationcollect";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //资讯随机Hot
    cls.getinformationone = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinformationone";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //资讯打赏
    cls.setinfomationgive = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setinfomationgive";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show()
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //觅尚配置
    cls.getserverpageconfig = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getserverpageconfig";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show()
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取我回复的资讯列表
    cls.getTopicReplyList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyreplyinfomationlist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取我求助的列表
    cls.getHelpEachList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyhelplist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取获取经销商省份
    cls.getProvince = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getdealerprovince";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取获取经销商城市
    cls.getDealerCity = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getdealercity";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取获取经销商
    cls.getDealer = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getdealer";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //铁粉申报
    cls.fansApply = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setfansapply";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取我服务的列表
    cls.getMyServiceList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyhelptolist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取资讯收藏列表
    cls.getTopicCollectionList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinfomationcollectlist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取求助收藏列表
    cls.getHelpCollectionList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmycollectlist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取我的欧贝明细列表
    cls.getMyCurrencyList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmycurrencylist";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //是否首次发帖
    cls.publicFirst = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=isfirstinformat";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取我的积分余额
    cls.getMyCurrency = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmycurrency";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取我的勋章
    cls.getMyMedal = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmymedal";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取勋章列表
    cls.getMedal = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmedal";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取任务列表
    cls.getTask = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gettask";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取消息列表
    cls.getmsgstate = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmsgstate";
        this.requestWithToken(url, {
            type: "POST",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    //活动留言

    cls.setactivetalk = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setactivetalk";
        this.requestWithToken(url, {
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    }


    cls.getInformationList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinfomationlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取求助列表信息
    cls.getHelpLists = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelplist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取求助类型
    cls.getHelpType = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelptype";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取求助详情信息
    cls.getHelpDetail = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelpdetail";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //签到
    cls.onSign = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setmembersign";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }

        });
    };
    //获取首页活动列表
    cls.getIndexActList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmainactivelist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }


        });
    };
    //获取首页置顶资讯
    cls.getIndexInfoList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmaininformationlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }

        });
    };

    //获取首页获得积分百分比
    cls.getMemCur = function (myData, fn, fail) {
        var url = BolaaUrl.now + "/api.ashx?m=getMemCur";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            },
            error: function (errmsg) {
                fn(errmsg);
            }

        });
    };
    //获取首页求助列表
    cls.getIndexHelpList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmainhelplist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //获取首页大咖列表
    cls.getIndexHotMan = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmainbiguser";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }

        });
    };
    //获取人物关注信息
    cls.getmembertotal = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmembertotal";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }

        });
    };
    //快速求助类型
    cls.getFastHelpType = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelptemplatelist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //发布求助
    cls.getRequestHelp = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelptype";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //发布资讯话题
    cls.setpubinformation = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setpubinformation";
        this.requestWithToken(url, {
            contentType: false,
            processData: false,
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //发布求助
    cls.setHelp1 = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=sethelp";
        this.requestWithToken(url, {
            contentType: false,
            processData: false,
            type: "post",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //剩余积分
    cls.getSurplus = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmycurrency";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //上传发布求助
    cls.publicHelp = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=sethelp";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //发布成功
    cls.RequestSuccess = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelpdetail";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //认证车主
    cls.getOwner = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmymedal";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //发布话题--资讯类型
    cls.getReleaseTopicCategory = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinformationtype";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //我发布的话题
    cls.getRelease = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmypubinfomationlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //我回复的话题
    cls.getReply = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyreplyinfomationlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //我帮助过的求助
    cls.getHelp = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyhelptolist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //求助采纳
    cls.getHelpAccept = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=sethelpok";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //求助操作收藏
    cls.getHelpCollect = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=helpcollect";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //求助是否收藏
    cls.getIsCollect = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=ishelpcollect";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //求助取消收藏
    cls.getCanCollect = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=helpnocollect";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    //求助操作点赞
    cls.getHelpPraise = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=sethelppraise";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    //求助是否点赞
    cls.getIsPraise = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=ishelpprises";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取经销商的省市
    cls.getrecommenddealerprovince = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getrecommenddealerprovince";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取经销商的省市
    cls.getrecommenddealercity = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getrecommenddealercity";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取经销商的信息
    cls.getrecommenddealerlist = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getrecommenddealerlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取经销商的信息
    cls.setrecommend = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setrecommend";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //获取推荐有礼列表
    cls.getrecommendlist = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getrecommendlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //我的求助
    cls.getSeekHelp = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyhelplist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //求助回复
    cls.getHelpReply = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=sethelpcomment";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //求助详情回复列表
    cls.getHelpDetailReplyList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelpcommentlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //求助详情已采纳回复列表
    cls.getHelpCommentComm = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelpcommentcomm";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };



    //求助回复的回复
    cls.getHelpRepeatReply = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=sethelpcommentrep";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    //是否关注
    cls.getFollow = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=isfollow";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //关注、粉丝
    cls.getTotalFollow = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gettotalfollow";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };
    //影响力
    cls.geteffectrankmember = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=geteffectrankmember";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //我的影响力
    cls.getmyeffectrank = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyeffectrank";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //会员等级
    cls.getCardLevel = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmemberinfo1";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //是否报名活动
    cls.getActiveUser = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getactiveuserjoin";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //是否报名活动
    cls.getActiveCount = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getactivejoincount";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //统计活动已报名人数
    cls.getActiveCount = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getactivejoincount";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };
    //取消关注
    cls.setnofollow = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setnofollow";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //操作---关注好友
    cls.setfollow = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=setfollow";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //cls.uiAddChrysanthemum=function() {
    //    var me = this;
    //    if (me.$el.parent().find('.chrysanthemum').length === 0) {
    //        me.$el.parent().append("<div class='chrysanthemum active'><div></div><div style='font-size: 14px;color: white;margin-top: 50px;text-align: center;'>加载中...</div></div>");
    //    }
    //}
    //cls.uiRemoveChrysanthemum= function() {
    //    if ($('.chrysanthemum')) {
    //        $('.chrysanthemum').remove();
    //    }
    //},
    //获取最新的求助列表
    cls.getNewHelpList = function (params, dataUrl, myData, fn) {
        var me = this;
        var url = BolaaUrl.now + "/api.ashx?m=getnewhelplist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
                $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取悬赏金额最高的求助列表
    cls.getCurrencyHelpList = function (params, dataUrl, myData, fn) {
        var me = this;
        var url = BolaaUrl.now + "/api.ashx?m=getcurrencyhelplist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
               $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    //获取已采纳求助列表
    cls.getStateHelpList = function (params, dataUrl, myData, fn) {
        var me = this;
        var url = BolaaUrl.now + "/api.ashx?m=getstatehelplist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            beforeSend: function() {
               $(".chrysanthemum").show();
            },
            success: function (data) {
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            }
        });
    };

    cls.getgameinfolist = function(params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getgameinfolist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    cls.getweekrank = function(params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getweekrank";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    cls.getuserweekrank = function(params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getuserweekrank";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    // 获取求助标签列表
    cls.getHelpLable = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=gethelp_lable";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };


    // 我的助力回复
    cls.getMyHelpCommentList = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyhelpcommentlist";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    cls.getmyhelps = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getmyhelps";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //是否首次发贴
    cls.getToday = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getinformationtoday";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //获取签到数据
    cls.getUsersign = function (params, dataUrl, myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getusersign";
        this.requestWithToken(url, {
            type: "post",
            dataType: "json",
            data: myData,
            success: function (data) {
                fn(data);
            }
        });
    };

    //新增登录
    cls.loginnew = function (myData, fn,er) {
        var url = BolaaUrl.now + "/api.ashx?m=loginnew";
        $.ajax(url,{
            type: "POST",
            dataType: "json",
            data: myData,
            success:function(data){
                fn(data);
            },
            error:function (err) {
                er(err)
            }
        })
    };
    //获取登录公钥
    cls.getgenerate = function (myData, fn) {
        var url = BolaaUrl.now + "/api.ashx?m=getgenerate";
        $.ajax(url,{
            type: "POST",
            dataType: "json",
            data: myData,
            beforeSend:function(){
                $(".chrysanthemum").show();
            },
            success:function(data){
                fn(data);
            },
            complete: function() {
                $(".chrysanthemum").hide();
            },
        })
    };


    return cls;

});