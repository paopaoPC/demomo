define(["common/navView", "underscore","shared/js/notification"], function (Base, _,Notification) {
    var Class = {};

    Class.posGenHTML = function () {

    }
    Class.onShow=function () {
        this._itemTemplate = _.template(this.elementHTML("#historyItemTemplate"));
        var self = this;
        bfClient.getCarTestHistory(function (netData) {
            if(netData.code==0 &&netData.success == true){
                self.onGetCarTestHistory(netData)
            }else{
                Notification.show({
                    "type":"error",
                    "message":netData.msg
                });
            }
        });
    };

    Class.onGetCarTestHistory = function (netData) {
        var container = this.elementFragment("#testHistoryList");
        container.holder().empty();

        var list = netData.data;
        var elem = null;
        var self = this;
        var onClick = function (e) {
            self.onClickItem($(e.currentTarget).attr("itemID"));
        }
        for (var i = 0, i_sz = list.length; i < i_sz; ++i) {
            var item = list[i].carDataUpdateTime;
            var index = item.indexOf(' ');
            list[i].dataTime = item.substr(0, index);
            list[i].time = item.substr(index + 1, item.length);
            elem = $(this._itemTemplate(list[i]));
            elem.find("#testHistoryItem").on("click", onClick);

            container.append(elem);
        }

        container.setup();
        if(list.length>0){
            this.elementHTML("#testHistoryLabel", "最近" + list.length + "次报告");
        }else{
            this.elementHTML("#testHistoryLabel", "暂无历史诊断记录");
        }

    }

    Class.onClickItem = function (itemID) {
        var commontForItemId = window.localStorage.getItem('commontForItemId');
        bfNaviController.push('/cartest/testdetails.html', {
            "id": itemID,
            commontForItemId: commontForItemId
        });
    }


    return Base.extend(Class);
})
;