define([
  "text!myinfo/notifyMaintanceData.html",
  "common/navView",
  "butterfly",
  "underscore",
  "shared/js/notification",
  "common/ssUtil"
], function(template, View, Butterfly, _, Notification, ssUtil) {
  var Base = View;
  return Base.extend({
    template: template,
    events: {
      "click .submitData": "submitData"
    },
    onViewPush: function(pushFrom, pushData) {
      this._typeValue = pushData.typeValue;
      this._wholeMile = pushData.wholeMile;
      this._nextMile = pushData.nextMile;
      this._spaceMile = pushData.spaceMile;
      this._wholeMile = parseInt(this._wholeMile);
      this._nextMile = parseInt(this._nextMile);
      this._spaceMile = parseInt(this._spaceMile);
    },
    onShow: function() {},
    posGenHTML: function() {
      this._type = 0;

      var totalMileNode = this.getElement(".totalMile");
      var spaceMileNode = this.getElement(".spaceMaintance");
      var lastMileNode = this.getElement(".lastMaintance");
      if (this._typeValue == "totalOdometer") {
        totalMileNode.show();
        totalMileNode.find("input").val(this._wholeMile == -1 ? "" : this._wholeMile);
        this._type = 0;
      } else if (this._typeValue == "maintainSpaceMileage") {
        spaceMileNode.show();
        spaceMileNode.find("input").val(this._spaceMile == -1 ? "" : this._spaceMile);
        this._type = 1;
      } else if (this._typeValue == "lastMaintainMileage") {
        lastMileNode.show();
        lastMileNode.find("input").val(this._nextMile == -1 ? "" : this._nextMile);
        this._type = 2;
      }
    },
    showInfo: function(type) {
      if (!type) {
        Notification.show({
          type: "error",
          message: "请输入数据"
        });
        return;
      }
    },
    submitData: function() {
      var me = this;
      var carId = bfDataCenter.getCarId();
      var typeValue;
      if (this._type == 0) {
        typeValue = this.getElement(".totalMile input").val();
        if (!typeValue) {
          Notification.show({
            type: "error",
            message: "请输入数据"
          });
          return;
        }
        if (parseInt(typeValue) < this._nextMile && this._nextMile != -1) {
          Notification.show({
            type: "error",
            message: "车辆总里程应该大于上次保养里程"
          });
          return;
        }
      } else if (this._type == 1) {
        typeValue = this.getElement(".spaceMaintance input").val();
        if (!typeValue) {
          Notification.show({
            type: "error",
            message: "请输入数据"
          });
          return;
        }
      } else {
        typeValue = this.getElement(".lastMaintance input").val();
        if (!typeValue) {
          Notification.show({
            type: "error",
            message: "请输入数据"
          });
          return;
        }
        if (parseInt(typeValue) > this._wholeMile && this._wholeMile != -1) {
          Notification.show({
            type: "error",
            message: "上次保养里程应该小于车辆总里程"
          });
          return;
        }
      }
      var reg = new RegExp("^[0-9]*$");
      if (!reg.test(typeValue)) {
        Notification.show({ type: "error", message: "请输入数字" });
        return;
      }
      if (this._typeValue == "totalOdometer") {
        bfClient.setMaintainMileageRemaind(
          {
            carId: carId,
            totalOdometer: typeValue
          },
          function(data) {
            if (data.code == 0) {
              bfAPP.trigger("IM_EVENT_CAR_CHANGED");
              bfNaviController.pop(1, { typeValue: typeValue, from: me._typeValue });
            } else if (data.code == 3) {
              Notification.show({
                type: "error",
                message: data.msg
              });
            }
          }
        );
      } else if (this._typeValue == "maintainSpaceMileage") {
        bfClient.setMaintainMileageRemaind(
          {
            carId: carId,
            maintainSpaceMileage: typeValue
          },
          function(data) {
            if (data.code == 0) {
              bfAPP.trigger("IM_EVENT_CAR_CHANGED");
              bfNaviController.pop(1, { typeValue: typeValue, from: me._typeValue });
            } else if (data.code == 3) {
              Notification.show({
                type: "error",
                message: data.msg
              });
            }
          }
        );
      } else if (this._typeValue == "lastMaintainMileage") {
        bfClient.setMaintainMileageRemaind(
          {
            carId: carId,
            lastMaintainMileage: typeValue
          },
          function(data) {
            if (data.code == 0) {
              bfAPP.trigger("IM_EVENT_CAR_CHANGED");
              bfNaviController.pop(1, { typeValue: typeValue, from: me._typeValue });
            } else if (data.code == 3) {
              Notification.show({
                type: "error",
                message: data.msg
              });
            }
          }
        );
      }
    }
  });
});
