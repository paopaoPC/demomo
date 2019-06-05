define(['shared/js/notification'], function (Notification) {
    var modulesManagPage = function () {
    };
    var ModuleManager;
    _.extend(modulesManagPage.prototype, {
        init: function (info, object) {
            var me = this;
            ModuleManager = object;
            if (info.auto) {
                me.auto = info.auto;
            }
            //请求模块信息队列。
            var task = 2;
            me.initializeInstalledModules(function () { //请求已安装模块
                me.initializeNotInstallModules(function () { //获取未安装模块时，要先获取到已安装的模块。
                    if (--task == 0) {
                        me.taskAfter();
                    }
                });
            });

            me.initializeUpdateModules(function () { //请求需要更新与安装的模块
                if (--task == 0) {
                    me.taskAfter();
                }
            });
        },
        taskAfter: function () { //模块信息请求完后.
            var me = this;
            //result3 = result1 + result2; result3为未安装模块与已安装模块的集合
            //result 已安装模块（本地模块）
            //result1未安装模块
            //result2待更新模块

            _.map(me.result1, function (item) {
                item['type'] = 'install';
            })

            var localModulesMapping = _.object(_.map(me.result1, function (module) {
                return module.identifier;
            }), me.result1);

            _.map(me.result2, function (item, key) { //特殊情况处理
                item['type'] = 'update';
                if (localModulesMapping[item.identifier]) { //在ModuleManager中已经把待安装的模块 添加到了待更新中，所以要在这里剔除
                    me.result2.splice(key, 1);
                }
            })
            me.result3 = me.result1.concat(me.result2);
            me.listInitialize(me.result3, 'category');
            //如果是自动检查更新跳入则直接更新
            if (me.auto && this.result3.length > 0) {
                new ModuleManager().downloadModules(this.result3);
            }
        },
        initializeInstalledModules: function (success) { //初始化，本地已安装模块
            var me = this;
            new ModuleManager().getLocalModulesInfo(function (result) {
                if (result.length > 0) {
                    me.result = result;
                }
                success();
            }, function () {
                me.uiAjaxError();
            });

        },
        initializeNotInstallModules: function (success) { //初始化，未安装模块
            var me = this;
            new ModuleManager().getLastestModulesUpdateInfo(function (result) {
                var localModulesMapping = _.object(_.map(me.result, function (module) {

                    return module.identifier;
                }), me.result);

                me.result1 = _.reject(result, function (item) { //过滤，未安装的模块
                    return localModulesMapping[item.identifier];
                })
                success();

            }, function (error) {
                me.uiAjaxError();
            });
        },
        initializeUpdateModules: function (success) { //初始化，待更新模块
            var me = this;
            new ModuleManager().checkModulesUpdate(function (result) {
                if (result.length > 0) {
                    me.result2 = result;
                    //此处作用是过滤，不显示已经更新的模块(因为更新文件需要重启应用),且需要更新的版本要大于 更新过的模块版本(缓存中的)
                    var updateCompleteModules = JSON.parse(window.sessionStorage.getItem('updateCompleteModules'));
                    if (updateCompleteModules != null && updateCompleteModules != '') {
                        var updateModules = _.object(_.map(updateCompleteModules, function (module) {
                            return module.identifier;
                        }), updateCompleteModules);

                        me.result2 = _.filter(me.result2, function (item) {
                            if (item.version > updateModules[item.identifier].version) {
                                return updateModules[item.identifier]
                            }
                        })

                    }
                } else {
                    me.result2 = [];
                }
                success();

            }, function () {
                me.uiAjaxError();
            });
        },
        uiAjaxError: function () { //网络请求失败
            Notification.show({
                "type": "error",
                "message": "获取更新信息失败"
            });
        },
        listInitialize: function (dateSource, filterValue) { //数据源，分类标识
            var me = this;
            var moduleCategory = _.uniq(_.pluck(dateSource, filterValue));
            _.each(moduleCategory, function (value) {
                var classificationName;
                if (value === true) { //已安装页面，根据hidden(true,false)分类，需要处理。
                    classificationName = '业务模块';
                } else if (value === false) {
                    classificationName = '功能模块';
                } else {
                    classificationName = value;
                }
            })
            if (dateSource && dateSource.length > 0) {
                dateSource.forEach(function (value) {
                    // var list = _.template(me.$el.find("#modules-template").html(), value);
                    var classification;
                    if (filterValue === 'category') { //未安装与待更新是根据category分类，已安装是根据hidden分类
                        classification = value.category;
                    } else {
                        classification = value.hidden;
                    }
                })
            } else { //无更新模块提示

            }

        }
    })
    return modulesManagPage;
})