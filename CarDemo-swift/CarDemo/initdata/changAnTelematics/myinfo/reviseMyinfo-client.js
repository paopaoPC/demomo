define(['shared/js/client', 'moment'], function (BaseClient, moment) {
    return _.extend(BaseClient, {
        checkTime: function (checkValue) {
            if (!checkValue) {
                return false;
            } else {
                var startDate = moment().startOf('day')._d.getTime();
                var endDate = moment(checkValue, 'YYYY-MM-DD')._d.getTime();
                if (startDate >= endDate) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    });
});