define([
  "text!cartest/index1.html",
  "common/navView",
  "butterfly",
  "common/ssUtil",
  "shared/js/scroll-pull-down",
  "common/disUtil",
  "shared/js/notification",
  "shared/js/swiper_min",
  "moment"
], function(
  template,
  View,
  Butterfly,
  ssUtil,
  ScrollPullDown,
  disUtil,
  Notification,
  Swiper,
  moment
) {
  var Base = View;
  var PULLDOWN_Y = 60;
  var cls = {
    id: "cartestContent",
    html: template,
    _value: true,
    carData: null,
    events: {
      "click .mileage-detail": "goMaintance",
      "click #navRight": "onClickRight"
      // 'click #navLeft':'onClickLeft',
    }
  };

  cls.onClickRight = function() {
    bfNaviController.push("cartest/testHistory.html");
  };
  // cls.onClickLeft = function(){
  //     if(navigator.appInfo && navigator.appInfo.emitOldWebviewEvent){
  //        navigator.appInfo.emitOldWebviewEvent()
  //        navigator.appInfo.closeNewWebview()
  //     }

  // }
  cls.goMaintance = function() {
    if (typeof MobclickAgent != "undefined") {
      MobclickAgent.onEvent("0102");
    }
    if (this._pushData && this._pushData._caData) {
      bfNaviController.push("/myinfo/maintainHistory.html", {
        spanceMile: this._pushData._caData.maintainSpaceMileage,
        wholeMile: this._pushData._caData.totalMeter,
        nextMile: this._pushData._caData.lastMaintainMileage,
        isTbox: true
      });
    } else {
      bfNaviController.push("/myinfo/maintainHistory.html", {});
    }
  };

  cls.update = function(mile) {
    var me = this;
    var rem = parseFloat(document.documentElement.style.fontSize);
    var mileAge = me.$("#mileageView #CTanimateShow");
    mileAge.css("transition-duration", "0s");
    mileAge.addClass("reset").width(0);

    setTimeout(function() {
      var per;
      var spaceMileage = me._pushData._caData.maintainSpaceMileage;
      if (isNaN(spaceMileage) || spaceMileage <= 0) {
        mile = "";
      }

      switch (true) {
        case mile > 300:
          per = (mile / spaceMileage) * 100 >= 100 ? "100%" : (mile / spaceMileage) * 100 + "%";
          mileAge.css({ "transition-duration": "0.6s", "background-color": "#fff" });
          mileAge.width(per);
          break;
        //小于300km，字体颜色变成橘红色,以提醒用户
        case 0 < mile && mile <= 300:
          per = (mile / spaceMileage) * 100 >= 100 ? "100%" : (mile / spaceMileage) * 100 + "%";
          mileAge.css({ "transition-duration": "0.6s", "background-color": "#fff" });
          mileAge.width(per);
          break;
        case mile !== "" && mile != -1 && mile <= 0:
          break;
        default:
      }
    }, 5);
  };

  cls.updateOil = function(oil) {
    // var me = this;
    // var rem=parseFloat(document.documentElement.style.fontSize);
    // var mileAge = me.$('#oilView #CTanimateShow');
    // mileAge.css('transition-duration','0s');
    // mileAge.addClass('reset').width(0);
    // var OIL_WARNING = 0.05;
    // setTimeout(function () {
    //     var per;
    //     switch(true) {
    //         case oil > OIL_WARNING:
    //             per= Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
    //             mileAge.css({'transition-duration':'0.6s','background-color':'#00d5fe'});
    //             // $oilText.html(per);
    //             mileAge.width(per+'%');
    //             break;
    //         //小于300km，字体颜色变成橘红色,以提醒用户
    //         case 0<=oil&&oil<=OIL_WARNING:
    //             per=Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
    //             mileAge.css({'transition-duration':'0.6s','background-color':'#f00c0c'});
    //             // $oilText.html(per);
    //             mileAge.width(per+'%');
    //             break;
    //         case oil !=='' &&oil != -1 && oil <=0:
    //             // $oilText.html(0);
    //             break;
    //         default:
    //             // $oilText.html('--');
    //     }
    // },5);
  };

  cls.onShow = function() {
    var self = this;
    var me = this;
    this.getElement(".odb_li").removeClass("backChange");
    // if(self.backView==true){
    //     return;
    // }
    if (!this.firstView) {
      // this.getElement('.content').on("touchmove", function (e) {
      //     if (self._jinzhi == 0) {
      //         e.preventDefault();
      //         e.stopPropagation();
      //     }
      // });
      this.TestOrNo();
      this.lis();
      this.initScroll();
      // me._mySwiper = new Swiper(this.$("#swiper-message")[0], {
      //   direction: "horizontal",
      //   loop: false,
      //   initialSlide: this.controlIndex,
      //   // 如果需要分页器
      //   pagination: "#cartestContent1 .content .swiper-pagination",
      //   onSlideChangeEnd: function(swiper) {
      //     if (swiper.activeIndex) {
      //       me._navTitle.text("车辆诊断");
      //     } else {
      //       me._navTitle.text("车况");
      //     }
      //   }
      // });
      me.update(me._pushData.remainMileage);
      me.updateOil(me._pushData.oil);
      this.firstView = true;
    }
  };
  cls.posGenHTML = function() {
    this.controlIndex = 0;
    this.setLeftVisible(true);
    if (this._pushData) {
      if (
        bfDataCenter.getCarData().seriesCode &&
        bfDataCenter.getCarData().seriesCode.toLowerCase() == "v302" &&
        this._pushData.defaultPicture
      ) {
        this.$(".bg-one").css("background-image", "url(" + this._pushData.defaultPicture + ")");
        this.$(".bg-one").css("background-position", "center");
        this.$(".bg-one").css("background-repeat", "no-repeat");

        this.$("#car_bg").css("background-image", "url(" + this._pushData.defaultPicture + ")");
        this.$("#car_bg").css("background-size", "2.8rem");
        this.$("#car_bg").css("background-position", "center center");
        this.$("#car_bg").css("background-repeat", "no-repeat");
      }
      if (this._pushData.airPurifyStatus) {
        if (this._pushData.PM25) {
          this.$(".pm25-value").html(this._pushData.PM25);
        } else {
          this.$(".pm25-value").html("--");
        }
        this.$(".pm25-warp").show();
      } else {
        this.$(".pm25-warp").hide();
      }
      if (this._pushData.temp) {
        this.$(".temp-value").html(this._pushData.temp + "℃");
      } else {
        this.$(".temp-value").html("--");
      }
      if (this._pushData.remoteControl && this._pushData.remoteControl.ac == "2") {
        this.$(".temp-wrap").show();
      } else {
        this.$(".temp-wrap").hide();
      }
    }
  };
  cls.onViewBack = function(backFrom, backData) {
    var me = this;
    if (backFrom == "myinfo/maintainHistory") {
      if (ssUtil.load("copSpaceMile")) {
        me._pushData._caData.maintainSpaceMileage = ssUtil.load("copSpaceMile");
      }
      if (ssUtil.load("copLastMile") != null) {
        me._pushData._caData.lastMaintainMileage = ssUtil.load("copLastMile");
      }
    }
  };
  cls.onViewBack = function(backFrom, backData) {
    var me = this;
    if (backFrom == "myinfo/maintainHistory") {
      if (ssUtil.load("copSpaceMile")) {
        me._pushData._caData.maintainSpaceMileage = ssUtil.load("copSpaceMile");
      }
      if (ssUtil.load("copLastMile") != null) {
        me._pushData._caData.lastMaintainMileage = ssUtil.load("copLastMile");
      }
    }
  };
  cls.onViewPush = function(pushFrom, pushData) {
    this._pushFrom = pushFrom;
    this._pushData = pushData;
  };
  cls.TestOrNo = function() {
    var self = this;
    this.testAgain();
  };
  //动画
  // cls.animate_on = function () {
  //     var self = this;
  //     this._width = 0;
  //     // this._interval = setInterval(function () {
  //     //     self._width = self._width + 1;
  //     //     if (self._width >= 98) {
  //     //         self._width = 98
  //     //     }
  //     //     var width = self._width + '%';
  //     //     self.getElement('#car_light').animate({
  //     //         'width': width
  //     //     }, 100);
  //     // }, 100);
  // };
  cls.onRemove = function() {
    this.stopAnimate();
    document.removeEventListener("touchmove", function() {}, false);
  };

  //停止动画
  cls.stopAnimate = function() {
    if (this._listener) {
      for (var i = 0; i < this._testItems.length; i++) {
        this._lis[i]
          .find(".dis_pop_div")[0]
          .removeEventListener("webkitAnimationEnd", function() {}, false);
      }
    }
  };

  cls.testAgain = function() {
    var self = this;
    // this.getElement('.content').scrollTop(0);
    // this.getElement('.needChange').css({
    //     'position': 'relative',
    //     'top': '0px',
    //     'left': '0px'
    // });
    // this.getElement('#data').css('top', '0px');
    // this._jinzhi = 0;
    // if (!this._value) {
    //     return;
    // } else {

    //动画修改
    this.cartest();
    // }
  };

  cls.cartest = function() {
    var self = this;

    var updateTestData = function() {
      self._value = false;
      // self.animate_on();
      // self.getElement('#car_bg').css({
      //     'background': 'url(../cartest/img/halo.png) no-repeat center',
      //     'background-size': '2.8rem 1.52rem'
      // });
      self.elementHTML("#time", " ");
      // self.getElement('#car_light').css('display', 'block');
      // self.getElement('#car_light').css('width', '6%');
      self.getElement("#light").css("display", "block");
      self._width = 9;
      self.elementHTML("#result-text", "正在获取中...");
      //动画修改
      // self.getElement('#car_light').css({
      //     "background": "url(../cartest/img/halo.png) no-repeat center",
      //     "background-size": "2.8rem 1.52rem",
      //     "background-position": "-0.26rem -0.01rem"
      // });
      bfClient.getCarTestData({
        data: { carId: bfDataCenter.getCarId() },
        success: function(data) {
          if (data.success) {
            if (data.data.status == -1) {
              self.addCarDetail();
              var temp = _.template(self.elementHTML("#other_temp"), {
                otherItems: self._testItems
              });
              self.elementHTML("#data", temp);
              ///移除动画修改
              self.getElement("#light").hide();
              self.elementHTML("#result-text", "检测失败~");
              // self.getElement("#reflesh").css("display","inline-block");
              if (self._interval) {
                clearInterval(self._interval);
              }
              setTimeout(function() {
                self.getElement("#car_light").css("width", "0%");
              }, 200);
              self._value = true;
              self._jinzhi = 1;
              //移除动画修改
              self._index = 0;
              return;
            }
            //  detail中的item的checkResultId，没有值得时候，去掉
            // data.data.details = _.filter(data.data.details,function(items){ return items.checkResultId });

            //  detail中的item的status，没有值得时候，默认为normal
            self._faultItems = _.each(data.data.details, function(item) {
              item.status || (item.status = "normal");
            });
            self._faultOthers = data.data;
            self.TempviewRender();
            self.elementHTML(
              "#time",
              "<div>更新时间：" +
                moment(data.data.carDataUpdateTime).format("YYYY.MM.DD HH:mm:ss") +
                "</div>"
            );
          } else {
            self.addCarDetail();
            var temp = _.template(self.elementHTML("#other_temp"), {
              otherItems: self._testItems
            });
            self.elementHTML("#data", temp);
            ///移除动画修改
            self.getElement("#light").hide();
            self.elementHTML("#result-text", "检测失败~");
            // self.getElement("#reflesh").css("display","inline-block");
            if (self._interval) {
              clearInterval(self._interval);
            }
            setTimeout(function() {
              self.getElement("#car_light").css("width", "0%");
            }, 200);
            self._value = true;
            self._jinzhi = 1;
            //移除动画修改
            self._index = 0;
            return;
          }
        },
        error: function() {
          self.addCarDetail();
          var temp = _.template(self.elementHTML("#other_temp"), {
            otherItems: self._testItems
          });
          self.elementHTML("#data", temp);

          ///移除动画修改
          self.getElement("#light").hide();
          self.elementHTML("#result-text", "检测失败~");
          // self.getElement("#reflesh").css("display","inline-block");
          if (self._interval) {
            clearInterval(self._interval);
          }
          // setTimeout(function () {
          //     self.getElement('#car_light').css('width', '0%');
          //     self.getElement('#car_light').css({
          //         "background": "url(../cartest/img/halo.png) no-repeat center",
          //         "background-size": "2.8rem 1.52rem",
          //         "background-position": "-0.26rem -0.01rem"
          //     });
          // }, 200);
          self._value = true;
          self._jinzhi = 1;
          //移除动画修改
          self._index = 0;
          return;
        },
        complete: function() {
          self.initScroll();
        }
      });
    };

    bfClient.getTestItems({
      data: { carId: bfDataCenter.getCarId() },
      success: function(data) {
        //让loding看不到
        self.scrollPullDown && self.scrollPullDown.resizePulldown();
        if (data.success) {
          self._testItems = data.data;
          self.setCommontForItemId(self._testItems);
          updateTestData();
        } else {
          self.getElement("#car_light").hide();
          self.getElement("#light").hide();
          self.elementHTML("#result-text", "检测失败~");
          // self.getElement("#reflesh").css("display","inline-block");
        }
      },
      error: function() {
        //让loding看不到
        self.scrollPullDown && self.scrollPullDown.resizePulldown();
        ///移除动画修改
        self.getElement("#car_light").hide();
        self.getElement("#light").hide();
        self.elementHTML("#result-text", "检测失败~");
        // self.getElement("#reflesh").css("display","inline-block");
      }
    });
  };
  // 这里吧东西放到localStorage里面 是因为这个页面第二次进来是不会刷新页面的  放到this是有问题的,也不要放到window下面
  cls.setCommontForItemId = function(data) {
    if (data) {
      window.localStorage.setItem(
        "commontForItemId",
        JSON.stringify(this.generateCommontForItemId(data))
      );
    } else {
      window.localStorage.setItem("commontForItemId", undefined);
    }
  };
  cls.generateCommontForItemId = function(data) {
    var newArr = [];
    _.each(data, function(item) {
      var newItem = {};
      newItem.itemId = item.itemId;
      newItem.comment = item.comment || "";
      newArr.push(newItem);
      if (item.child) {
        _.each(item.child, function(child) {
          var childItem = {};
          childItem.itemId = child.itemId;
          childItem.comment = child.comment || "";
          newArr.push(childItem);
        });
      }
    });
    return newArr;
  };
  //下拉刷新
  cls.initScroll = function() {
    var me = this;
    me.$pullDown = me.$(".pulldown");
    if (!me.scrollPullDown) {
      me.scrollPullDown = new ScrollPullDown({
        el: me.$el,
        onScrollCallback: function() {
          me.testAgain();
        },
        onScrollEnd: function() {
          if (me.$pullDown.hasClass("flip")) {
            me.$pullDown.addClass("loading");
            me.$(".pulldown .label").html("正在刷新...");
            me.scrollPullDown.scrollCallback();
          }
          me.scrollPullDown.setUILoadingPer(0);
        }
      });
    } else {
      me.scrollPullDown.myscroll.refresh();
    }
  };
  cls.lis = function() {
    var self = this;
    if (!self._testItems) {
      return;
    }
    // if (bfDataCenter.getCarDevice() != null && bfDataCenter.getCarDevice() == 'obd') {
    //     this._lis = this.getElement('#data .odb_li');
    // } else {
    //     this._lis = this.getElement('#data .div_li');
    // }
    var divNode = this.getElement("#data .div_li");
    var obdNode = this.getElement("#data .odb_li");
    this._lis = divNode.length ? divNode : obdNode;
    if (self._index + 1 == self._testItems.length) {
      self._jinzhi = 1;
    }
    if (obdNode.length) {
      if (this._index + 1 >= this._testItems.length) {
        // setTimeout(function () {
        self.getElement("#data").css("top", "0px");
        //todo 缓存页面
        window.carTestPage = self.$el.find(".content").html();
        window.hasTest = true;
        window._faultItems = self._faultItems;
        window._testItems = self._testItems;
        // }, 600);
        var yc = 0;
        for (var i = 0; i < this._testItems.length; i++) {
          if (self._lis.eq(i).find(".correct").length > 0) {
          } else {
            yc++;
          }
        }
        var str = "您的爱车有 " + yc + " 项异常，" + (this._testItems.length - yc) + " 项正常！";
        this.elementHTML("#result-text", str);
        this._value = true;
        this.getElement(".go_pop").removeClass("go_pop");

        ///移除动画修改
        this.getElement("#light").hide();
        //移除动画修改
        this.getElement(".odb_li")
          .unbind()
          .on("click", function(el) {
            var elementOdb = $(this);
            var words = $(this).attr("data-id");
            $(el.currentTarget).addClass("backChange");
            var commontForItemId =
              (window.localStorage.getItem("commontForItemId") &&
                JSON.parse(window.localStorage.getItem("commontForItemId"))) ||
              [];

            for (
              var i = 0, _faultItemslength = self._faultItems.length;
              i < _faultItemslength;
              i++
            ) {
              if (self._faultItems[i].checkHistoryId) {
                var s_checkHistoryId = self._faultItems[i].checkHistoryId;
                i = _faultItemslength;
              }
            }

            bfNaviController.push("/cartest/testItemDetail.html", {
              //"id": self._faultItems[0].checkHistoryId,
              id: s_checkHistoryId,
              words: words,
              commontForItemId: commontForItemId
            });
          });
        this.getElement("#light").hide();
        return;
      }
      this._lis
        .eq(this._index + 1)
        .find(".dis_pop_div")
        .addClass("go_pop");
      setTimeout(function() {
        if (self._lis.eq(self._index).find(".error")) {
          self._lis
            .eq(self._index)
            .find(".error")
            .css("display", "block");
        }
        if (self._lis.eq(self._index).find(".danger")) {
          self._lis
            .eq(self._index)
            .find(".danger")
            .css("display", "block");
        }
        if (self._lis.eq(self._index).find(".correct")) {
          self._lis
            .eq(self._index)
            .find(".correct")
            .css("display", "block");
        }
        if (self._lis.eq(self._index).find(".arrow")) {
          self._lis
            .eq(self._index)
            .find(".arrow")
            .css("display", "block");
        }
      }, 0);
      var needHeight = parseInt(this.getElement(".needChange").css("height"));
      var headerHeight = parseInt(this.getElement("#nav-bar").css("height"));

      var height = disUtil.navClientHeight - needHeight - headerHeight + "px";
      var start = Math.floor(parseInt(height) / 65);
      var top = "-" + (this._index + 1) * 0.75;
      top = disUtil.remToPx(top) + "px";
      // this.getElement('#data').animate({
      //     "top": top
      // }, 500);
      this._index++;
      return;
    }
    if (this._index + 1 >= this._testItems.length) {
      setTimeout(function() {
        self.getElement("#data").css("top", "0px");
        //todo 缓存页面
        window.carTestPage = self.$el.find(".content").html();
        window.hasTest = true;
        window._faultItems = self._faultItems;
        window._testItems = self._testItems;
      }, 600);
      var dev_li = this.getElement(".div_li");
      var window_li = this.getElement(".window");
      var c_str = "";
      var e_str = "";
      var yc = 0;
      var ycTotal = 0;
      for (var i = 0; i < this._testItems.length; i++) {
        if (dev_li.eq(i).find(".correct").length > 0) {
          c_str += dev_li.eq(i).prop("outerHTML");
          c_str += window_li.eq(i).prop("outerHTML");
        } else {
          e_str += dev_li.eq(i).prop("outerHTML");
          e_str += window_li.eq(i).prop("outerHTML");
          // yc++;
        }
      }
      //注释上面的 yc++;  按照异常实际条数来计算,不根据大item计算
      _.each(this._faultItems, function(items) {
        _.each(items.child, function(item) {
          if (item.status == "risk" || item.status == "fault") {
            yc++;
          }
        });
        ycTotal += (items.child && items.child.length) || 0;
      });

      var str = "您的爱车有 " + yc + " 项异常，" + (ycTotal - yc) + " 项正常！";
      this.elementHTML("#result-text", str);
      this.elementHTML("#data", e_str + c_str);
      this._value = true;
      this.getElement(".go_pop").removeClass("go_pop");
      this.getElement(".fault_li,.normal_li")
        .unbind()
        .on("click", function(el) {
          var words = $(this).attr("data-id");
          $(el.currentTarget).addClass("active");
          var commontForItemId =
            (window.localStorage.getItem("commontForItemId") &&
              JSON.parse(window.localStorage.getItem("commontForItemId"))) ||
            [];
          for (var i = 0, _faultItemslength = self._faultItems.length; i < _faultItemslength; i++) {
            if (self._faultItems[i].child && self._faultItems[i].child[0]) {
              var checkHistoryId = self._faultItems[i].child[0].checkHistoryId;
              i = _faultItemslength;
            }
          }
          bfNaviController.push("/cartest/testItemDetail.html", {
            id: checkHistoryId,
            words: words,
            commontForItemId: commontForItemId
          });
        });

      ///移除动画修改
      this.getElement("#light").hide();
      //移除动画修改

      //根据action不同，跳转到不同的页面
      this.getElement(".actions div").on("click", function() {
        var me = $(this);
        //跳转的连接
        var url = me.attr("url");
        if (me.html() == "去加油") {
          //去加油
          butterfly.navigate("/cartest/map.html");
        } else if (me.html() == "去维修") {
          //去维修
          butterfly.navigate("/applyService/index.html");
        } else {
          //跳转到
        }
      });
      //根据action不同，跳转到不同的页面

      this.getElement("#data .div_li").on("click", function() {
        var of = true;
        var index = $(this).index() / 2;
        if (of) {
          of = false;
          var arrow = $(this).find(".arrow");
          var em = self.getElement("#data .window").eq(index);
          if (em.hasClass("down")) {
            em.removeClass("down");
            em.slideUp(200);
            arrow.removeClass("ani_down");
            arrow.addClass("ani_up");
            setTimeout(function() {
              of = true;
              arrow.css("transform", "rotate(0deg)");
              self.initScroll();
            }, 200);
          } else {
            em.addClass("down");
            em.slideDown(200);
            arrow.removeClass("ani_up");
            arrow.addClass("ani_down");
            setTimeout(function() {
              of = true;
              arrow.css("transform", "rotate(180deg)");
              self.initScroll();
            }, 200);
          }
        }
      });
      //正常项目的展开
      this.getElement("#data .normal_identify").on("click", function() {
        var of = true;
        var em = $(this).find(".arrow");
        var wrap = $(this).siblings(".normal_wrap");
        if (of) {
          if (!em.hasClass("up")) {
            em.removeClass("ani_up");
            em.addClass("ani_down");
            wrap.slideDown(200);
            setTimeout(function() {
              of = true;
              em.removeClass("down");
              em.addClass("up");
              self.initScroll();
            }, 200);
          } else {
            em.removeClass("ani_down");
            em.addClass("ani_up");
            wrap.slideUp(200);
            setTimeout(function() {
              of = true;
              em.addClass("down");
              em.removeClass("up");
              self.initScroll();
            }, 200);
          }
        }
      });

      return;
    }
    this._lis
      .eq(this._index + 1)
      .find(".dis_pop_div")
      .addClass("go_pop");
    setTimeout(function() {
      if (self._lis.eq(self._index).find(".error")) {
        self._lis
          .eq(self._index)
          .find(".error")
          .css("display", "block");
      }
      if (self._lis.eq(self._index).find(".danger")) {
        self._lis
          .eq(self._index)
          .find(".danger")
          .css("display", "block");
      }
      if (self._lis.eq(self._index).find(".correct")) {
        self._lis
          .eq(self._index)
          .find(".correct")
          .css("display", "block");
      }
      if (self._lis.eq(self._index).find(".arrow")) {
        self._lis
          .eq(self._index)
          .find(".arrow")
          .css("display", "block");
      }
    }, 0);
    var needHeight = parseInt(this.getElement(".needChange").css("height"));
    var headerHeight = parseInt(this.getElement("#nav-bar").css("height"));

    var height = disUtil.navClientHeight - needHeight - headerHeight + "px";
    var start = Math.floor(parseInt(height) / 65);
    var top = "-" + (this._index + 1) * 0.75;
    top = disUtil.remToPx(top) + "px";
    // this.getElement('#data').animate({
    //     "top": top
    // }, 500);

    this._index++;
  };

  cls.addCarDetail = function() {
    this.elementHTML("#data0", " ");
    var template = _.template(this.elementHTML("#odb_temp"), {
      data: {
        status: "normal",
        itemName: "车内pm2.5: 中，车内温度： 12 ℃"
      }
    });
    this.getElement("#data0").append(template);
    var template = _.template(this.elementHTML("#odb_temp"), {
      data: {
        status: "normal",
        itemName: "剩余保养里程 860 km"
      }
    });
    this.getElement("#data0").append(template);

    this.$("#data0 .correct").show();
    this.$("#data0 .arrow").show();
  };

  cls.onRight = function() {
    // if (this._index >= this._testItems.length - 1) {
    butterfly.navigate("/cartest/testHistory.html");
    // }
  };

  cls.TempviewRender = function() {
    var self = this;
    var html = "";
    if (this._faultOthers.status == -1) {
      var temp = _.template(this.elementHTML("#other_temp"), {
        otherItems: this._testItems
      });
      this.elementHTML("#data", temp);
      ///移除动画修改
      this.elementHTML("#result-text", "检测失败~");
      // self.getElement("#reflesh").css("display","inline-block");
      if (this._interval) {
        clearInterval(this._interval);
      }
      this.getElement("#car_light").css("width", "0%");
      // self.getElement('#car_light').css({
      //     "background": "url(../cartest/img/halo.png) no-repeat center",
      //     "background-size": "2.8rem 1.52rem",
      //     "background-position": "-0.26rem -0.01rem"
      // });
      this._value = true;
      this._jinzhi = 1;
      //移除动画修改
      this._index = this._testItems.length - 1;
      return;
    }
    this.getElement("#data").html(" ");
    //测试odb
    // if (bfDataCenter.getCarDevice() != null && bfDataCenter.getCarDevice() == 'obd') {
    //     //odb 拍一下序
    //     self._faultItems = _.sortBy(self._faultItems, function (item) {
    //         switch (item.status) {
    //             case 'fault':
    //                 return 0;
    //             case 'risk':
    //                 return 1;
    //             case 'normal':
    //                 return 2;
    //                 defalut:
    //                     return 3;
    //         }
    //     });
    //     var html = '';
    //     if (self._faultItems.length <= 0) {
    //         this.elementHTML('#data', ' ');
    //         ///移除动画修改
    //         this.elementHTML('#result-text', '检测失败~');
    //         // self.getElement("#reflesh").css("display","inline-block");
    //         if (this._interval) {
    //             clearInterval(this._interval);
    //         }
    //         setTimeout(function () {
    //             self.getElement('#car_light').css('width', '0%');
    //             ///移除动画修改
    //             self.getElement('#light').hide();
    //             //移除动画修改
    //         }, 500);
    //         this._value = true;
    //         this._jinzhi = 1;
    //         //移除动画修改
    //         this._index = this._testItems.length - 1;
    //         return;
    //     }
    //     for (var j = 0; j < self._faultItems.length; j++) {
    //         var template = _.template(self.elementHTML("#odb_temp"), {
    //             "data": self._faultItems[j]
    //         });
    //         html = html + template;
    //     }
    //     this.getElement('#data').append(html);
    //     this._lis = this.getElement('#data .odb_li');
    //     this._lis.eq(0).find('.dis_pop_div').addClass('go_pop');
    //     this._index = 0;
    //     var timeTemp = this._testItems.length * 0.5 * 1000 + 500;
    //     if (this._interval) {
    //         clearInterval(this._interval);
    //     }
    //     self.getElement('#car_light').animate({
    //         'width': '98%'
    //     }, timeTemp);
    //     setTimeout(function () {
    //         if (self._lis.eq(0).find('.error')) {
    //             self._lis.eq(0).find('.error').css('display', 'block');
    //         }
    //         if (self._lis.eq(0).find('.danger')) {
    //             self._lis.eq(0).find('.danger').css('display', 'block');
    //         }
    //         if (self._lis.eq(0).find('.correct')) {
    //             self._lis.eq(0).find('.correct').css('display', 'block');
    //         }
    //         if (self._lis.eq(0).find('.arrow')) {
    //             self._lis.eq(0).find('.arrow').css('display', 'block');
    //         }
    //     }, 250);
    //     for (var i = 0; i < this._testItems.length; i++) {
    //         this._lis.eq(i).find('.dis_pop_div')[0].addEventListener('webkitAnimationEnd', function () {
    //             self.lis();
    //         }, false);
    //     }
    //     return;
    // }
    var hasNoSecondNevel = function(i) {
      var template = _.template(self.elementHTML("#odb_temp"), {
        data: self._faultItems[i]
      });
      self.getElement("#data").append(template);
    };
    var hasSecondeNevel = function(i) {
      var normalItems = [];
      var faultItems = [];
      var d = 0;
      var f = 0;
      var faultTemplate = "";
      var actionTemplate = "";

      var normalTemplate = "";
      var faultExist = false;
      var actions;
      var htmlChild;
      var urls;
      var classTemp = "";
      if (
        self._faultItems[i].suggestAction != "-" &&
        self._faultItems[i].suggestAction != undefined
      ) {
        actions = self._faultItems[i].suggestAction.split("-");
      } else {
        actions = [];
      }
      if (
        self._faultItems[i].suggestActionUrl != "-" &&
        self._faultItems[i].suggestActionUrl != undefined
      ) {
        urls = self._faultItems[i].suggestActionUrl.split("-");
      }
      if (self._faultItems[i].child) {
        for (var j = 0; j < self._faultItems[i].child.length; j++) {
          if (self._faultItems[i].child[j].status == "normal") {
            normalItems.push(self._faultItems[i].child[j]);
          } else if (self._faultItems[i].child[j].status == "fault") {
            faultItems.push(self._faultItems[i].child[j]);
            d++;
          } else {
            faultItems.push(self._faultItems[i].child[j]);
            f++;
          }
        }
      } else {
      }

      if (faultItems.length != 0) {
        faultTemplate = _.template(self.elementHTML("#fault_temp"), {
          faultItems: faultItems
        });
        faultExist = true;
      }
      if (normalItems) {
        normalTemplate = _.template(self.elementHTML("#normal_temp"), {
          normalItems: normalItems,
          faultExist: faultExist
        });
      }
      if (d != 0) {
        if (self._faultItems[i].itemCode == "powerSystem") {
          classTemp = "dongli";
        } else if (self._faultItems[i].itemCode == "chassisSystem") {
          classTemp = "dipan";
        } else if (self._faultItems[i].itemCode == "electricSystem") {
          classTemp = "dianqi";
        }
        htmlChild =
          "<div class='div_li'><div class='" +
          classTemp +
          "'></div><div class='error'></div><div class='dis_pop_div'></div><div class='p_name'>" +
          self._faultItems[i].itemName +
          "</div><div class='arrow'></div></div><div class='window'>" +
          faultTemplate +
          actionTemplate +
          normalTemplate +
          "</div>";
      } else if (d == 0 && f != 0) {
        if (self._faultItems[i].itemCode == "powerSystem") {
          classTemp = "dongli";
        } else if (self._faultItems[i].itemCode == "chassisSystem") {
          classTemp = "dipan";
        } else if (self._faultItems[i].itemCode == "electricSystem") {
          classTemp = "dianqi";
        }
        htmlChild =
          "<div class='div_li'><div class='" +
          classTemp +
          "'></div><div class='danger'></div><div class='dis_pop_div'></div><div class='p_name'>" +
          self._faultItems[i].itemName +
          "</div><div class='arrow'></div></div><div class='window'>" +
          faultTemplate +
          actionTemplate +
          normalTemplate +
          "</div>";
      } else {
        if (self._faultItems[i].itemCode == "powerSystem") {
          classTemp = "dongli";
        } else if (self._faultItems[i].itemCode == "chassisSystem") {
          classTemp = "dipan";
        } else if (self._faultItems[i].itemCode == "electricSystem") {
          classTemp = "dianqi";
        }
        htmlChild =
          "<div class='div_li'><div class='" +
          classTemp +
          "'></div><div class='correct'></div><div class='dis_pop_div'></div><div class='p_name'>" +
          self._faultItems[i].itemName +
          "</div><div class='arrow'></div></div><div class='window'>" +
          faultTemplate +
          actionTemplate +
          normalTemplate +
          "</div>";
      }
      html += htmlChild;
    };
    //测试odb
    //根据模板完成html的渲染

    if (self._faultItems.length <= 0) {
      this.elementHTML("#data", " ");
      ///移除动画修改
      this.elementHTML("#result-text", "检测失败~");
      // self.getElement("#reflesh").css("display","inline-block");
      if (this._interval) {
        clearInterval(this._interval);
      }
      setTimeout(function() {
        self.getElement("#car_light").css("width", "0%");
        ///移除动画修改
        self.getElement("#light").hide();
        //移除动画修改
      }, 500);
      this._value = true;
      this._jinzhi = 1;
      //移除动画修改
      this._index = this._testItems.length - 1;
      return;
    }

    self.addCarDetail();
    for (var i = 0; i < this._testItems.length; i++) {
      if (this._testItems[i].child) {
        hasSecondeNevel(i);
      } else {
        hasNoSecondNevel(i);
      }
    }
    self.getElement("#data").append(html);
    var divNode = this.getElement("#data .div_li");
    var obdNode = this.getElement("#data .odb_li");
    this._lis = divNode.length ? divNode : obdNode;
    this._lis
      .eq(0)
      .find(".dis_pop_div")
      .addClass("go_pop");
    this._index = 0;
    var timeTemp = this._testItems.length * 0.5 * 1000 + 500;
    if (this._interval) {
      clearInterval(this._interval);
    }
    // self.getElement('#car_light').animate({
    //     'width': '98%'
    // }, timeTemp);
    setTimeout(function() {
      if (self._lis.eq(0).find(".error")) {
        self._lis
          .eq(0)
          .find(".error")
          .css("display", "block");
      }
      if (self._lis.eq(0).find(".danger")) {
        self._lis
          .eq(0)
          .find(".danger")
          .css("display", "block");
      }
      if (self._lis.eq(0).find(".correct")) {
        self._lis
          .eq(0)
          .find(".correct")
          .css("display", "block");
      }
      if (self._lis.eq(0).find(".arrow")) {
        self._lis
          .eq(0)
          .find(".arrow")
          .css("display", "block");
      }
    }, 0);
    for (var i = 0; i < this._testItems.length; i++) {
      // this._lis.eq(i).find('.dis_pop_div')[0].addEventListener('webkitAnimationEnd', function () {
      self.lis();
      // }, false);
    }
  };

  return Base.extend(cls);
});
