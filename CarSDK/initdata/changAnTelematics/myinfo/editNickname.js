
define([
        'common/navView',
        'text!myinfo/editNickname.html',
        'shared/js/notification'
        ],
    function (View, viewTemplate, Notification) {

        var View = View.extend({
            events: {
                "click .submitName":"submit"
            },
            onViewPush:function(pushFrom, pushData){
                if (pushData) {
                    this._pushData = pushData;                   
                }
            },
            onShow:function(){
                var inputNode = this.getElement("#editNickname_nickname");
                inputNode[0].focus();
            },
            posGenHTML:function () {
                var inputNode = this.getElement("#editNickname_nickname");
                var inputPassword = this.getElement("#editNickname_Password");
                if (this._pushData.typeName == "nickName") {
                    inputNode.val(this._pushData.data.userFullname);
                    this.getElement(".password-info").hide();
                    this.getElement(".rename_input_wrap")[1].remove();
                }else{
                    inputNode.val(this._pushData.data.userName);
                    this.setTitle('修改用户名');
                    this.getElement('#editNickname_nickname').attr("placeholder",'请输入用户名')
                }
            },
            submit:function(){
                var self = this;
                var name = this.getElement("#editNickname_nickname").val();
                var inputPassword = this.getElement("#editNickname_Password");
                var passWord;
                if(this._pushData.typeName === "userName"){
                    passWord = inputPassword.val();
                }
                if (!name) {
                    Notification.show({
                        type:"error",
                        message:"需填写的信息不能为空"
                    });
                    return ;
                }
                if(this._pushData.typeName === "userName"&& (!passWord || passWord.length < 6)){
                    Notification.show({
                        type:"error",
                        message:"请输入正确的用户密码"
                    });
                    return ;
                }
                if (this._pushData.typeName == "nickName") {
                    this.editNickname(name)
                }else{
                    this.Password = passWord;
                    this.editUserName(name)
                }
                
            },
            editUserName: function(name){
                var self = this;
                if( this.cheeckUserNameLength(name) ){
                    this.addUserName(name);
                } else {
                    Notification.show({
                        type: "info",
                        message: '用户名为3-15个字符，中文代表两个字符'
                    })
                }
            },
            addUserName: function(name){
                var password = this.Password || '';
                bfClient.addUserName({
                    type: 'post',
                    data: {'userName': name, 'password': password},
                    success: function (data) {
                        if (data && data.code == 0) {
                            bfNaviController.pop(1);
                            bfDataCenter.setUserSessionValue("userName",name);
                        } else {
                            if(data){
                                Notification.show({
                                    type: "error",
                                    message: data.msg
                                })
                            } else {
                                Notification.show({
                                    type: "error",
                                    message: '获取数据失败'
                                })

                            }
                             
                        }
                    },
                    error: function(){
                         Notification.show({
                            "type":"error",
                             message: '网络开小差'
                        });
                    }
                });
            },
           cheeckUserNameLength:function(userName){
                var length = userName.length;
                _.each(userName, function(item){
                    (item.charCodeAt(0) > 10000) && length++
                })
                if(length >=3 && length <= 15){
                    return true;
                } else {
                    return false;
                }
            },
            editNickname: function(name){
                var self = this;
                //调用接口更新用户信息
                 bfClient.saveMyinfo({
                        "userFullname": name,
                        success:function(data){
                            if(data.success){
                                bfDataCenter.setUserSessionValue("userFullname",name);
                                Notification.show({
                                    "type":"info",
                                    "message":"修改成功"
                                });
                                bfDataCenter.setUserName(name);
                                self.onLeft();
                            }else{
                                Notification.show({
                                    "type":"error",
                                    "message":"修改失败"
                                });
                            }
                        },
                        error:function(data){
                            Notification.show({
                                type:"error",
                                message:'网络开小差'
                            });
                        }
                })
            }
        })
        return View;

    });