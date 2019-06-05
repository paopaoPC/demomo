define([
  "text!myinfo/maintainHistory.html",
  "common/navView",
  "shared/js/datasource",
  "listview/ListView",
  "butterfly",
  "common/ssUtil",
  "swipe",
  "underscore",
  "listview/ListViewItem",
  "common/osUtil",
  "shared/js/notification",
  "css!myinfo/maintainHistory.css"
], function(
  template,
  View,
  Datasource,
  ListView,
  Butterfly,
  ssUtil,
  swipe,
  _,
  ListItemBase,
  osUtil,
  Notification
) {
  var LIST_VIEW_CACHE_ID = "maintainHistory";
  var Base = View;
  var cls = {
    id: "maintainHistory",
    events: {
      "click #navRight, .message": "addRecord",
      "click .maintainContentBlock": "gotoDetail",
      "click .maintainShopBlock": "gotoBmap",
      "click .headContent1,.float-left,.float-right": "notifyDatas"
    }
  };
  var oldYear = 0;
  var isLoadData = 0;
  var originalDataSource = new Array();
  var newDataSource = new Array();
  var nowDateStr = "";
  var nearestTime = null;
  var RankListItem = ListItemBase.extend({
    initialize: function(options) {
      ListItemBase.prototype.initialize.call(this, options);
      var originalItem = options.data;
      newDataSource.push(osUtil.clone(options.data));

      isLoadData = 1;
      //是否为官方，为否时显示删除按钮
      if (originalItem.type != "person") {
        //lxc 原代码未实现
        //originalItem.noteMess = "你在里程数"+originalItem.mileage+"的时候进行了一次维保<br>";
      } else {
        //originalItem.noteMess = originalItem.noteMess + "<br>" + "<br>";
      }

      var e = $(options.userData.template(options.data));
      this.setContent(e);
      //是否隐藏年份
      //初始化时间
      if (!originalItem.maintenanceTime || originalItem.maintenanceTime.length != 10) {
        originalItem.maintenanceTime = nowDateStr;
      }

      //设置下次维保时间
      var sel = $("#next_time");
      var val = Date.parse(originalItem.maintenanceTime);
      var newDate = new Date(val);

      if (nearestTime == null) {
        nearestTime = newDate;
      } else {
        if (newDate > nearestTime) {
          nearestTime = newDate;
        }
      }

      var timeToShow = new Date(nearestTime);
      timeToShow.setMonth(timeToShow.getMonth() + 5);
      sel.val(timeToShow.format("yyyy/MM/dd"));

      var currentYear = originalItem.maintenanceTime.substr(0, 4);
      var currentMonth = moment(originalItem.maintenanceTime).format("M/DD");
      e.find(".timeLineYear").text(currentYear);
      e.find(".timeLineMonth").text(currentMonth);

      if (options.index == 0) {
        oldYear = 0;
        originalDataSource = new Array();
      }

      //添加数据到数组
      originalDataSource.push(originalItem);

      if (oldYear == 0 || oldYear != currentYear) {
        //显示年
        e.find("#timeLineYear").show();
      } else {
        //隐藏年
        e.find("#timeLineYear").text("");
      }
      oldYear = currentYear;

      osUtil.delayCall(function() {
        var height = 0;
        var container = e[0];
        var clientRect = container.getBoundingClientRect();
        height = clientRect.height || container.offsetHeight;
        e.find(".timeLineMonth").css("top", parseInt(height * 0.4) + "px");
        e.find(".timeLineBlackLine1").css("height", 25 + "px");
        e.find(".timeLineBlackLine2").css("height", height - 41 + "px");
        e.find(".timeLineBlackLine2").css("top", 41 + "px");
        e.find(".redPointAndTriangle").css("top", 25 + "px");

        //是否为官方，为否时显示删除按钮
        if (originalItem.type == 1) {
          //官方图标(54X54)
          e.find("#maintainTime").css("height", 27 + "px");
          e.find("#maintainTime").css("width", 27 + "px");
          e.find("#maintainTime").css(
            "background-image",
            "url('../myinfo/image/sign_guanfang.png')"
          );
          e.find("#maintainCost").hide();
          e.find("#maintainTime").css("margin-top", 15 + "px");
          e.find("#maintainTime").css("margin-right", -9 + "px");
        } else {
          //非官方图标(36X36)
          e.find("#maintainTime").css("height", 27 + "px");
          e.find("#maintainTime").css("width", 27 + "px");
          e.find("#maintainTime").css("background-image", "url('../myinfo/image/sign_geren.png')");
          e.find("#maintainCost").show();
          e.find("#maintainTime").css("margin-top", 15 + "px");
          e.find("#maintainTime").css("margin-right", -9 + "px");
        }
        // e.find(".timeLineBlackLine2").height(height);
      });
    }
  });

  cls.onViewBack = function(backFrom, backData) {
    //lxc
    var me = this;
    if (backFrom == "myinfo/addMaintainRecord" && backData) {
      this._nextMile = ssUtil.load("lastMile");
      var surplusMaile =
        parseInt(this._spanceMile) + parseInt(this._nextMile) - parseInt(this._wholeMile);
      me.getElement("#nextMaile").html(
        this._nextMile + "<span style='font-size:13px;margin-left:9px'>km</span>"
      );
      me.getElement("#surplusMaile").html(
        surplusMaile < 0 || !surplusMaile
          ? 0
          : surplusMaile + "<span style='font-size:13px;margin-left:9px'>km</span>"
      );
      me.reloadListView();
    } else if (backFrom == "myinfo/myMaintenanceDetail" && backData) {
      me.reloadListView();
    } else {
      if (backData) {
        var surplusMaile;
        if (backData.from == "totalOdometer") {
          me.getElement("#wholeMaile")
            .html(backData.typeValue + "<span style='font-size:13px;margin-left:9px'>km</span>")
            .addClass("notifyStyle");
          surplusMaile =
            parseInt(this._spanceMile) + parseInt(this._nextMile) - parseInt(backData.typeValue);
          this._wholeMile = backData.typeValue;
          ssUtil.save("totalMile", this._wholeMile);
        } else if (backData.from == "maintainSpaceMileage") {
          me.getElement("#spaceMaile")
            .html(backData.typeValue + " km")
            .addClass("notifyStyle1");
          surplusMaile =
            parseInt(this._nextMile) + parseInt(backData.typeValue) - parseInt(this._wholeMile);
          this._spanceMile = backData.typeValue;
          ssUtil.save("spaceMile", this._spanceMile);
          ssUtil.save("copSpaceMile", this._spanceMile);
        } else if (backData.from == "lastMaintainMileage") {
          me.getElement("#nextMaile")
            .html(backData.typeValue + " km")
            .addClass("notifyStyle1");
          surplusMaile =
            parseInt(backData.typeValue) + parseInt(this._spanceMile) - parseInt(this._wholeMile);
          this._nextMile = backData.typeValue;
          ssUtil.save("lastMile", this._nextMile);
          ssUtil.save("copLastMile", this._nextMile);
        }
        if (
          parseInt(this._spanceMile) == -1 ||
          parseInt(this._wholeMile) == -1 ||
          parseInt(this._nextMile) == -1
        ) {
          me.getElement("#surplusMaile").html("--");
          return;
        }
        me.getElement("#surplusMaile").html(
          surplusMaile < 0 || !surplusMaile
            ? 0
            : surplusMaile + "<span style='font-size:13px;margin-left:9px'>km</span>"
        );
      }
    }
  };
  cls.onViewPush = function(pushFrom, pushData) {
    if (!pushData) {
      return;
    }
    this._spanceMile = pushData.spanceMile;
    this._nextMile = pushData.nextMile;
    this._wholeMile = pushData.wholeMile;
    this._isTbox = pushData.isTbox;
    ssUtil.save("totalMile", this._wholeMile);
    ssUtil.save("lastMile", this._nextMile);
    ssUtil.save("spaceMile", this._spanceMile);
  };
  cls.notifyDatas = function(el) {
    var target = $(el.currentTarget);
    var typeValue = target.attr("data-value");
    if (this._isTbox && typeValue == "totalOdometer") {
      return;
    }
    bfNaviController.push("/myinfo/notifyMaintanceData.html", {
      spaceMile: this._spanceMile,
      wholeMile: this._wholeMile,
      nextMile: this._nextMile,
      typeValue: typeValue
    });
  };
  //onshow事件，初始化element
  cls.onShow = function() {};
  cls.reWrite = function(e) {
    //lxc
    //修改维保信息的方法
    var me = this;
    var currentDomClass = e.target.className;
    var maintanenceId = currentDomClass.split(" ")[1];
    bfNaviController.push("/myinfo/addMaintainRecord.html", {
      maintanceId: maintanenceId,
      carId: me._currentCarId,
      from: "update"
    });
  };
  cls.posGenHTML = function() {
    var me = this;
    if (this._isTbox) {
      this.$(".headContent1").addClass("noSelect");
    }
    this.initListView(bfDataCenter.getCarId());
  };

  //初始化listview
  cls.initListView = function(carId) {
    var me = this;
    var self = this;

    this._dataSource = new Datasource({
      storage: "local",
      identifier: LIST_VIEW_CACHE_ID + "-" + carId + "-list",
      url: bfConfig.server + bfClient.MAINTAIN_HISTORY_URL,
      pageParam: "pageIndex",
      requestParams: {
        carId: carId
      }
    });

    var listEl = this.getElement("#maintainHistory-list"); //容器的element
    listEl.find("ul").empty();
    var template = _.template(this.elementHTML("#maintainHistory"));
    this._listView = new ListView({
      id: "listview.maintainHistory",
      el: listEl,
      itemClass: RankListItem,
      pageSize: 10,
      userData: { template: template },
      dataSource: this._dataSource,
      isPullToRefresh: true,
      isLine: true
    });
    this.listenTo(this._listView, "itemSelect", this.onItemSelect);
    this.getElement(".empty").html("快为你的爱车<br>添加维保信息吧");
    Date.prototype.format = function(fmt) {
      //author: meizz
      var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
          );
      return fmt;
    };
    //设置下次维保时间(没有数据时)
    var nowDate = new Date();
    var sel = this.getElement("#next_time");
    nowDate.setMonth(nowDate.getMonth() + 5);
    sel.val(nowDate.format("yyyy/MM/dd"));
    this.getMaintenceMile();
  };
  cls.getMaintenceMile = function() {
    var me = this;
    var wholeMaileNode = me.getElement("#wholeMaile");
    var spaceMaileNode = me.getElement("#spaceMaile");
    var nextMaileNode = me.getElement("#nextMaile");
    var wholeMile = parseInt(this._wholeMile);
    var spaceMile = parseInt(this._spanceMile);
    var nextMile = parseInt(this._nextMile);
    if (wholeMile < 0 || isNaN(wholeMile)) {
      if (this._isTbox) {
        wholeMaileNode.html("数据读取失败");
      } else {
        wholeMaileNode.html("未填写");
      }
    } else {
      wholeMaileNode
        .html(wholeMile + "<span style='font-size:13px;margin-left:9px'>km</span>")
        .addClass("notifyStyle");
    }
    if (spaceMile < 0 || isNaN(spaceMile)) {
      spaceMaileNode.html("未填写");
    } else {
      if (ssUtil.load("copSpaceMile")) {
        spaceMaileNode.html(ssUtil.load("copSpaceMile") + " km").addClass("notifyStyle1");
      } else {
        spaceMaileNode.html(spaceMile + " km").addClass("notifyStyle1");
      }
    }
    if (nextMile < 0 || isNaN(nextMile)) {
      nextMaileNode.html("未填写");
    } else {
      if (ssUtil.load("copLastMile")) {
        nextMaileNode.html(ssUtil.load("copLastMile") + " km").addClass("notifyStyle1");
      } else {
        nextMaileNode.html(nextMile + " km").addClass("notifyStyle1");
      }
    }
    if (nextMile == -1) {
      this._nextMile = 0;
    }
    if (spaceMile == -1 || wholeMile == -1 || nextMile == -1 || !spaceMile || isNaN(wholeMile)) {
      me.getElement("#surplusMaile").html("--");
      return;
    }
    var surplusMaile = spaceMile + nextMile - wholeMile;
    me.getElement("#surplusMaile").html(
      surplusMaile < 0 ? 0 : surplusMaile + "<span style='font-size:13px;margin-left:9px'>km</span>"
    );
  };

  //item点击事件
  var currentLocation = "";

  cls.onItemSelect = function(listview, item, index, event) {
    currentLocation = originalDataSource[index].dealerName;
    ssUtil.save("CURRENT_MAINTAIN_DETAIL", originalDataSource[index]); // lxc
  };

  //重新加载listView
  cls.reloadListView = function() {
    var self = this;
    var carId = bfDataCenter.getCarId();
    // self._currentCarId=carId;  //lxc
    this._dataSource.setOptions({
      storage: "local",
      identifier: LIST_VIEW_CACHE_ID + "-" + carId + "-list",
      url: bfConfig.server + bfClient.MAINTAIN_HISTORY_URL,
      pageParam: "pageIndex",
      requestParams: {
        carId: carId
      }
    });

    bfClient.getNextMaintenanceMile({
      data: { carId: carId },
      success: function(data) {
        if (data.success) {
          self
            .getElement("#totleKm")
            .val(data.data.totalMeter + "<span style='font-size:13px;margin-left:9px'>km</span>");
          self
            .getElement("#extroKm")
            .val(
              data.data.maintainMileageRemaind +
                "<span style='font-size:13px;margin-left:9px'>km</span>"
            );
        } else {
          self.getElement("#totleKm").val("--");
          self.getElement("#extroKm").val("--");
        }
      }
    });

    originalDataSource = [];
    this._listView.reloadData();

    //设置下次维保时间(没有数据时)
    var nowDate = new Date();
    var sel = this.getElement("#next_time");
    if (originalDataSource.length === 0) {
      nowDate.setMonth(nowDate.getMonth() + 5);
      sel.val(nowDate.format("yyyy/MM/dd"));
    }
  };

  cls.addRecord = function() {
    bfNaviController.push("/myinfo/addMaintainRecord.html", { carId: bfDataCenter.getCarId() });
  };

  cls.onLeft = function() {
    nearestTime = null;
    bfNaviController.pop();
  };
  cls.onDeviceBack = function() {
    this.onLeft();
    return true;
  };
  cls.gotoDetail = function(el) {
    if (!currentLocation || currentLocation == "null") {
      Notification.show({
        type: "error",
        message: "维保内容不存在"
      });
      return;
    }
    var currentDomClass = el.target.className;
    var maintanenceId = currentDomClass.split(" ")[1];
    bfNaviController.push("/myinfo/myMaintenanceDetail.html", {
      maintanceId: maintanenceId,
      carId: bfDataCenter.getCarId()
    });
  };

  cls.gotoBmap = function(el) {
    if (!currentLocation || currentLocation == "null") {
      Notification.show({
        type: "error",
        message: "4s店信息不存在"
      });
      return;
    }

    bfNaviController.push("/myinfo/maintainMapMessage.html", currentLocation);
  };
  return Base.extend(cls);
});
