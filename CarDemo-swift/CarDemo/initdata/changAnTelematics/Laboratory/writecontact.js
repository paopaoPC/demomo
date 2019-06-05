define(
    [
        "text!Laboratory/writecontact.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "iscroll",
        "common/disUtil",
        "shared/js/notification",
        "Laboratory/lab-client"
    ],
    function (template, View, Butterfly, ssUtil, iscroll, disUtil, Notification, LabClient) {
        var Base = View;
        var cls =
        {
            _value: true,
            carData: null,
            events: {
                "click #save_contact": "save_contact"
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {
            this._data = pushData;
        };
        cls.onShow = function () {
            this.templateon(this._data);
            $("#contact_name").html(this._name);
        };
        cls.save_contact = function (e) {
            var ContactName = $("#contact_name").val();
            var ContactPhone = $("#phonenumber").val();
            var id = $("#display")[0].children[1].id;
            var data = {"id": id, "contactName": ContactName, "contactPhone": ContactPhone, "userId": "15023316545"};
            LabClient.updateContact({
                data: data,
                success: function () {
                    window.history.go(-1);
                },
                error: function () {

                }
            });
        };
        cls.templateon = function (data) {
            $("#display").html("");
            var template = _.template(this.elementHTML('#displaycontact'), {
                data: data
            });
            $("#display").append(template);
        };
        return Base.extend(cls);
    }
);


