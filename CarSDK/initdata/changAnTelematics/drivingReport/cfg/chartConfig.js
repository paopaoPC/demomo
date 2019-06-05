define(["highcharts"], function () {
    var cfg =
    {
        distance: {
            chartStyle: "background-color:#09aaec;",
            titleLineStyle: "background-color:#09aaec;",
            hLineColor: "#09aaec",
            plotLineColor: "#09aaec",
            title: "当月累计里程",
            unit: "(Km)",
            totalStyle: "color:#09aaec"
        },
        petrol: {
            chartStyle: "background-color:#09aaec;",
            titleLineStyle: "background-color:#09aaec;",
            hLineColor: "#09aaec",
            plotLineColor: "#09aaec",
            title: "当月累计耗油",
            unit: "(L)",
            totalStyle: "color:#09aaec"
        },
        maxVelo: {
            chartStyle: "background-color:#09aaec;",
            titleLineStyle: "background-color:#09aaec;",
            hLineColor: "#09aaec",
            plotLineColor: "#09aaec",
            title: "当月平均时速",
            unit: "(Km/h)",
            totalStyle: "color:#09aaec"
        },

        chartDefaultOptions: {
            credits: {
                enabled: false
            },
            chart: {
                type: 'area',
                backgroundColor: {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, 'rgba(96, 96, 96, 0)'],
                        [1, 'rgba(16, 16, 16, 0)']
                    ]
                }
            },
            title: {
                text: ''
            },
            legend: {
                enabled: false
            },
            xAxis: {
                lineColor: "rgb(255, 0, 0)",	// X 轴颜色
                tickColor: "rgba(0, 0, 0, 0)", 	// 坐标栏颜色
                type: 'category'
            },
            yAxis: {
                title: {
                    text: '',
                    style: {
                        color: '#AAA',
                        font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
                    }
                },
                labels: {
                    style: {
                        color: '#b5c2be',
                        fontWeight: "10"
                    }
                }
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, '#ace7f7'],
                            [1, '#fff']
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            }
        },
        getCategories: function (name, length) {
            var monthDays = function (month, year) {
                month %= 12;
                var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (month == 1 && year) {
                    return ((year % 4) == 0 && (year % 100) != 0) || ((year % 400) == 0) ? 29 : 28;
                }
                return days[month];
            };
            var today = new Date(name);
            var day = today.getDate();
            --day;	// to 0-30
            var month = today.getMonth();
            var year = today.getFullYear();
            var weekDay = today.getDay();
            weekDay = (weekDay - 1 + 7) % 7;
            day -= weekDay;
            if (day < 0) // To pre month
            {
                month = ((month + 12) - 1) % 12;
                day = day + monthDays(month, year) - 1;
            }
            var days = monthDays(month);
            var ret = {tip: (month + 1) + "月", cats: []};
            for (var i = length; i > 0; i--) {
                var day = today.getDate();
                ret.cats[i - 1] = day;
                ret.tip = (today.getMonth() + 1) + "月";
                today.setDate(today.getDate() - 1);
            }
            return ret;
        },
        DayNumOfMonth: function (Year, Month) {
            var d = new Date(Year, Month, 0);
            return d.getDate();
        }
    };

    return cfg;
});