define([
        "common/navView",
        "common/LocalResizeIMG",
        'butterfly',
        "shared/js/notification",
        'ImageCache/ImageCache',
        "shared/plugin_dialogOld/js/dialog",
        'shared/js/mobileSelect'
    ],
    function (View, localResizeIMG, Butterfly, Notification, ImageCache, oldDialog,MobileSelect) {
        var Base = View;
        return Base.extend({
            events: {
                "click #submit_carid": "submitData",
                // "click .info_ul li":"notifyInfo",
                "click .items": "addImage",
                "click .poto-modle": "showPhotoView",
                "click .dialog-step-1-btn":"closeDialog",
                "click .input-gcNumber":"showDialog",
                "click .dialog-step-1-btn-alert":"alertBtn",
                "click .openOCRView_IdCardFront":"openOCRView_IdCardFront",
                "click .openOCRView_IdCardBack":"openOCRView_IdCardBack",
                "click .openPicView_4":"openPicView_4",
            },
            alertBtn: function(){
                    this.$('.dialog-step-wrap-alert').hide()
                this.addImage(this._addImageEl,true)
            },
            convertBase64UrlToBlob: function(urlData) {

                var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte
                //处理异常,将ascii码小于0的转换为大于0
                var ab = new ArrayBuffer(bytes.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < bytes.length; i++) {
                    ia[i] = bytes.charCodeAt(i);
                }

                return new Blob([ab], {
                    type: 'image/png'
                });
            },
            openPicView_4: function(el){
                var me = this;
                 this.cacheE  = el;
                this._target = this.$('.item2');
                window.openPicView_4 = function(data){
                    if(data){
                        me.uiAddChrysanthemum11();
                         me.uploadFile(me.convertBase64UrlToBlob(data), function (data) {
                            var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                            me.uploadFileSuccess(uploadImg)
                        });
                    }
                }
                OSApp.openPhotoLibrary(false,500,'window.openPicView_4')
            },
            openOCRView_IdCardFront: function(el){
                var me = this;
                 this.cacheE  = el;
                this._target = this.$('.item3');
                window.openOCRView_IdCardFront_xxx = function(data){
                    if(data.success == 'true' || data.success == true){
                        try {
                            var words_result = JSON.parse(data.data).words_result;
                            var gender = words_result['性别'].words;
                            var idcardType = 'IDCARD'
                            var info_username = words_result['姓名'].words;
                            var idCard = words_result['公民身份号码'].words;

                             var select = me.getElement("#certificate_select");
                              // select.attr("disabled", true);
                              // select.find("option[value='" + idcardType + "']").attr({
                              //     "selected": true
                              // })
                                select.attr('data-id','IDCARD')
                                select.html('身份证')
                              me.getElement("#certificate-number").text(idCard);
                               me.$('#info_username').html(info_username)
                               var select1 = me.getElement("#gender_select");

                               if(gender == '男'){
                                select1.attr('data-id','m')
                                select1.html('男')
                               } else {
                                select1.attr('data-id','f')
                                select1.html('女')
                               }
                                
                                // select1.find("option[value='" + gender + "']").attr({
                                //     "selected": true
                                // })
             
                        } catch(err) {
                        }
                        me.uiAddChrysanthemum11();
                         me.uploadFile(me.convertBase64UrlToBlob(data.image), function (data) {
                            var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                            me.uploadFileSuccess(uploadImg)
                        });
                             
                        // var img = "<img src='" + this._carInfo_data.imagesPath[2] + "' style='display:none' />";
                        // this.$('.items.item3').append(img);
                        // this.$('.items.item3').css('background-image','url('+this._carInfo_data.imagesPath[2]+')')

                    } else {
                        if(data.image){
                            me.uiAddChrysanthemum11();
                          me.uploadFile(me.convertBase64UrlToBlob(data.image), function (data) {
                                var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                                me.uploadFileSuccess(uploadImg)
                            });  
                        }
                          
                       // Notification.show({
                       //      type: "error",
                       //      message: "身份识别识别"
                       //  }); 
                    }
                }
                OSApp.openOCRView_IdCardFront("{}",'openOCRView_IdCardFront_xxx')
            },
            openOCRView_IdCardBack: function(el){
                var me = this;
                this.cacheE  = el;
                this._target = this.$('.item4');
                window.openOCRView_IdCardBack_xxx = function(data){
                    if(data.success  == 'true'){
                        me.uiAddChrysanthemum11();
                         me.uploadFile(me.convertBase64UrlToBlob(data.image), function (data) {
                                var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                                me.uploadFileSuccess(uploadImg)
                            });
                        // var img = "<img src='" + this._carInfo_data.imagesPath[3] + "' style='display:none' />";
                        // this.$('.items.item4').append(img);
                        // this.$('.items.item4').css('background-image','url('+this._carInfo_data.imagesPath[3]+')')
                    } else {
                        if(data.image){
                            me.uiAddChrysanthemum11();
                          me.uploadFile(me.convertBase64UrlToBlob(data.image), function (data) {
                                var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                                me.uploadFileSuccess(uploadImg)
                            });  
                        }
                        // Notification.show({
                        //      type: "error",
                        //      message: "身份识别识别"
                        //  }); 
                    }
                }
                OSApp.openOCRView_IdCardBack("{}",'openOCRView_IdCardBack_xxx')
            },
            closeDialog: function(event){
                var me = this;
                this.$('.dialog-step-wrap').hide()
                var str = '.item-input-carInfo-' + this._indexImg;
                this.$(str).click()
            },
            // showDialog: function(e){
            //     this.cacheE = e;
            //     this.$('.dialog-step-wrap').show()
            // },
            onViewPush: function (pushFrom, pushData) {
                if (pushData) {
                    this._carData = pushData
                };
            },
            onViewBack: function (backFrom, backData) {
                if (backData) {
                    this._data = backData.data;
                    if (backFrom == "addChanganCar/notifiUserName") {
                        this.getElement("#info_username").text(this._data)
                    } else if (backFrom == "addChanganCar/notifyCertificate") {
                        this.getElement("#certificate-number").text(this._data)
                    };
                };
            },
            showPhotoView: function () {
                bfNaviController.push("addChanganCar/photoExampleView.html")
            },
            posGenHTML: function () {
                var me = this;
                // this.getElement("#submit_carid").on("click", function(el){
                // 	me.submitData(el)
                // })
                me.tipsInfo = [{
                        title: '上传发票照片',
                        numId: '',
                        infos: ['请提交《机动车统一销售发票》', '若遗失或购车超过一年，请前往4s店完成认证']
                    },
                    {
                        title: '上传持证照',
                        numId: 'two',
                        infos: ['请遵照上图所示提交照片']
                    },
                    {
                        title: '上传证件正面照片',
                        numId: 'three',
                        infos: ['请提交证件正面照片，确保文字清晰、无反光、无遮挡']
                    },
                    {
                        title: '上传证件反面照片',
                        numId: 'four',
                        infos: ['请提交证件反面照片，确保文字清晰、无反光、无遮挡']
                    }
                ];
                if (typeof cordova == "undefined") {
                    return;
                }
                me.pictureSource = navigator.camera.PictureSourceType;
                me.destinationType = navigator.camera.DestinationType;

                
            },
            onShow: function () {
                var me = this;
                this.getElement(".info_ul").find("li").on("click", function (el) {
                    me.notifyInfo(el)
                })
                var idcardType = bfDataCenter.getUserIdCardType();
                var idCard = bfDataCenter.getUserIdCard();
                if(!me.first){
                  me.first = true
                  if (idcardType && idCard) {
                      // var select = this.getElement("#certificate_select");
                      // // select.attr("disabled", true);
                      // select.find("option[value='" + idcardType + "']").attr({
                      //     "selected": true
                      // })
                      this.getElement("#certificate-number").text(idCard);
                      // this.getElement(".last").unbind("click");
                  }  
                  var mobileSelect1 = new MobileSelect({
                    trigger: '#gender_select',
                    title: '选择性别',
                    wheels: [
                                {data:
                                    [{id:'m',value:'男'},
                                    {id:'f',value:'女'}]
                                }
                            ],
                    callback: function(indexArr, data){
                        me.$('#gender_select').attr('data-id',data.id)
                        me.$('#gender_select').html(data.value)
                    }
                });
                var mobileSelect2 = new MobileSelect({
                    trigger: '#certificate_select',
                    title: '选择证件类型',
                    wheels: [
                                {data:
                                    [{id:'IDCARD',value:'身份证'},
                                    {id:'PASSPORT',value:'护照'},
                                    {id:'PLA',value:'军官证'},
                                    {id:'POLICEPAPER',value:'警官证'},
                                    {id:'TAIBAOZHENG',value:'台湾居民来往大陆通行证'},
                                    {id:'HKIDCARD',value:'港澳居民来往内地通行证'},
                                    {id:'UNITCREDITCODE',value:'统一社会信用代码'},
                                    {id:'OTHERLICENCE',value:'其他'}]
                                }
                            ],
                    callback: function(indexArr, data){
                        me.$('#certificate_select').attr('data-id',data.id)
                        me.$('#certificate_select').html(data.value)
                    }
                });
                }
                
               
            },
            addImage: function (el, need) {
                this.cacheE  = el;
                this._target = $(el.currentTarget);
                var me = this;
                 var index = $(el.currentTarget).attr("data-value");
                this._indexImg = index;
                // var temp = _.template(this.elementHTML('#tips'));
      
                if (index == 1 && !need) {
                    this._addImageEl = el;
                    this.$('.dialog-step-wrap-alert').show()
                    return;
                }
               
                var str = '.dialog-step-wrap-' + index;
                this.$(str).show();
                // var info = this.tipsInfo[index];
                // temp = temp(info);
                // $(this.getElement('.content')).append(temp);
                // $(this.getElement("#mask")).on("click", function (el) {
                //     var ment = $(el.target).attr('id');
                //     switch (ment) {
                //         case 'closeMask':
                //             me.closeMask();
                //             break;
                //             // case 'upgrade':
                //             //     var result = me.ReportFileStatus();
                //             //     if (result == "true") {
                //             //         if(deviceIsIOS){
                //             //             // 先这样处理，后面改原生逻辑，质量压缩到500k
                //             //             me.getPhotolab(me.pictureSource.PHOTOLIBRARY,95,true,1300,1300);
                //             //         } else {
                //             //             me.getPhotolab(me.pictureSource.PHOTOLIBRARY,80,true);
                //             //         }
                //             //     }
                //             //     me.closeMask();
                //             // break;
                //             // case 'takePhoto':
                //             //     // var result = me.ReportFileStatus();
                //             //     // if (result == "true") {
                //             //     //     if(deviceIsIOS){
                //             //     //         me.getPhotolab(me.pictureSource.CAMERA,95,true,1300,1300);
                //             //     //     } else {
                //             //     //         me.getPhotolab(me.pictureSource.CAMERA,80,false);
                //             //     //     }

                //             //     // }
                //             //     me.choseImage(1000,1000,function(data){
                //             //         if(data[0] && data[0].result){
                //             //             var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                //             //             me.uploadFileSuccess(uploadImg)
                //             //         }
                //             //     });
                //             //     me.closeMask();
                //             //     break;
                //         default:
                //             break;
                //     }

                    $('.dialog-step-1-btn input').localResizeIMG({
                        width: 1800,
                        quality: 0.8,
                        before: function (that, blob,file) {
                            me.closeMask();
                            me.uploadFile(file, function (data) {
                                var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                                me.uploadFileSuccess(uploadImg)
                            });

                        },
                        success: function (result) {
                            // var img = new Image();
                            // img.src = result.base64;
                            // $('body').append(img);
                            // alert('111');
                            // console.log(result);
                            // var a = convertBase64UrlToBlob(result.base64)
                            // me.closeMask();
                            me.uploadFile(result, function (data) {
                                var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                                me.uploadFileSuccess(uploadImg)
                            });

                        }
                    });

                    // /**
                    //  * 将以base64的图片url数据转换为Blob 可以直接上传文件
                    //  * @param urlData
                    //  * 用url方式表示的base64图片数据
                    //  */
                    // function convertBase64UrlToBlob(urlData) {

                    //     var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte
                    //     //处理异常,将ascii码小于0的转换为大于0
                    //     var ab = new ArrayBuffer(bytes.length);
                    //     var ia = new Uint8Array(ab);
                    //     for (var i = 0; i < bytes.length; i++) {
                    //         ia[i] = bytes.charCodeAt(i);
                    //     }

                    //     return new Blob([ab], {
                    //         type: 'image/png'
                    //     });
                    // }



                    
                // });
            },
            // choseImage: function(wdith,height,callback){
            //     var me = this;
            //     //添加图片
            //     sm("do_Page").fire("choseImage",{"number":1,"w":wdith,"h":height});
            //     sm("do_Page").on("didChoseImage",function(img){
            //         me.uploadFile(img,function(data){
            //             callback(data);
            //         });
            //     });
            // },
            uploadFile: function (file, callback) {
                // require("wy").httpTool.HTuploadFile(imageupload, file, function(data) {
                //      //data 是恒拓上传接口返回的数据
                //      callback(data)
                // });
                // OSApp.showToast(imageupload)
                var me = this;
                var imageupload = bfDataCenter.getBaseConfig_dssUploadUrl() + "&token=" + window.localStorage.token; //文件上传地址
                var fromData = new FormData;
                fromData.append('files', file);
                this.uiAddChrysanthemum11();
                $.ajax({
                    url: imageupload,
                    type: 'POST',
                    data: fromData,
                    timeout: 15000,
                    processData: false,
                    contentType: false,
                    success: function (result) {
                        callback(result);
                        me.uiRemoveChrysanthemum();
                        $("#mask").remove();
                    },
                    error: function (data) {
                        me.uiRemoveChrysanthemum();
                        alert('图片上传失败')
                    }
                })
            },
            uploadFileSuccess: function (imageURI) {
                var self = this;
                self._target.text("");
                var img = "<img src='" + imageURI + "' style='display:none' />";
                self._target.append(img);
                self._target.css('background-image','url('+imageURI+')')
            },
            closeMask: function () {
                var $mask = $(this.getElement("#mask"));
                $mask.off("click");
                $mask.remove();
            },
            ReportFileStatus: function () { //判断cordova.js是否存在
                var s = false;
                if (typeof navigator.camera != "undefined") {
                    s = "true";
                }
                return (s);
            },
            getPhotolab: function (source, quality, allowEdit, targetWidth, targetHeight) { //调用手机相册方法
                var el = this;
                navigator.camera.getPicture(function (imageURL) {
                    el.onPhotoSuccess(imageURL);
                }, function (message) {
                    el.Fail(message);
                }, {
                    quality: quality,
                    destinationType: el.destinationType.FILE_URI,
                    sourceType: source,
                    allowEdit: allowEdit,
                    targetWidth: targetWidth,
                    targetHeight: targetHeight
                });
            },
            Fail: function (message) { //照片回调失败
                console.log("调用手机失败");
            },
            onPhotoSuccess: function (imageURI) { //选择照片成功的回调函数
                var self = this;
                if (imageURI.substring(0, 21) == "content://com.android") {
                    photo_split = imageURI.split("%3A");
                    imageURI = "content://media/external/images/media/" + photo_split[1];
                }
                self.fileSize(imageURI, function () {
                    self._target.text("");
                    var img = "<img src='" + imageURI + "' style='width:100%;height:100%' />";
                    self._target.append(img);
                });
            },
            fileSize: function (url, successFunc) {
                var me = this;
                if (typeof cordova == "undefined") {
                    return;
                }
                window.resolveLocalFileSystemURL(url, function (entry) {
                    entry.file(function (file) {
                        var size = file.size / 1024;
                        if (size && size <= 1024 * 20) {
                            successFunc();
                        } else {
                            navigator.appInfo.showStatus("error", "图片文件不能超过 20MB");
                        }
                    }, function () {
                        console.log("文件读取失败");
                    });
                }, function () {
                    console.log("获取文件失败");
                });
            },
            submitData: function (el) {
                var me = this;
                var tar = $(el.currentTarget);
                var userFullname = this.getElement("#info_username").text();
                var gender = this.getElement("#gender_select").attr('data-id');
                var idcardType = this.getElement("#certificate_select").attr('data-id');
                var idcard = this.getElement("#certificate-number").text();
                var receiptHandle = $("#addCarView .item1").find("img").attr("src");
                var licensedPhotosHandle = this.getElement(".item2").find("img").attr("src");
                var idcardPhotoPosHandle = this.getElement(".item3").find("img").attr("src");
                var idcardPhotoNavHandle = this.getElement(".item4").find("img").attr("src");
                var filter = /^[A-Za-z0-9]+$/;
                if (!userFullname) {
                    Notification.show({
                        type: "error",
                        message: "请输入本人姓名"
                    });
                    return;
                };
                if (!idcard) {
                    Notification.show({
                        type: "error",
                        message: "请输入对应的证件号码"
                    });
                    return;
                };
                if (!filter.test(idcard)) {
                    Notification.show({
                        type: "error",
                        message: "证件号码格式错误"
                    });
                    return;
                };
                if (!receiptHandle || !licensedPhotosHandle || !idcardPhotoNavHandle || !idcardPhotoPosHandle) {
                    Notification.show({
                        type: "error",
                        message: "请上传照片"
                    });
                    return;
                };
                var imagesPath = [receiptHandle, licensedPhotosHandle, idcardPhotoPosHandle, idcardPhotoNavHandle];
                var orderId = this._carData.orderId ? this._carData.orderId : "";
                var carInfo = {
                    orderId: this._carData.orderId,
                    vin: this._carData.vin,
                    enginNo: this._carData.enginNo,
                    userFullname: userFullname,
                    gender: gender,
                    idcardType: idcardType,
                    idcard: idcard
                }
                bfNaviController.push('addChanganCar/carInfo-real.html',{
                    imagesPath: imagesPath,
                    carInfo: carInfo
                })
                // this.uiAddChrysanthemum();
                // this.submitImages(imagesPath, carInfo, tar);
            },
            submitImages: function (imagesPath, carInfo, tar) {
                var me = this;
                var targetNode = tar;
                var imageupload = bfDataCenter.getBaseConfig_dssUploadUrl() + "&token=" + window.localStorage.token; //文件上传地址
                var sendData = function (carInfo, id) {
                    // me.uiRemoveChrysanthemum();
                    // id = id.split(",");
                    carInfo.receiptHandle = id[0];
                    carInfo.licensedPhotosHandle = id[1];
                    carInfo.idcardPhotoPosHandle = id[2];
                    carInfo.idcardPhotoNavHandle = id[3];
                    bfClient.addChanganCarInfo({
                        data: carInfo,
                        beforeSend: function () {
                            me.uiAddChrysanthemum()
                        },
                        success: function (data) {
                            if (data.code == 0) {
                                bfNaviController.push("addChanganCar/auditing.html")
                            } else {
                                Notification.show({
                                    type: "error",
                                    message: data.msg
                                })
                            }
                        },
                        error: function () {
                            Notification.show({
                                type: "error",
                                message: "网络开小差"
                            })
                        },
                        complete: function () {
                            me.uiRemoveChrysanthemum()
                        }
                    })
                }
                // var fail = function () {
                //     me.uiRemoveChrysanthemum();
                // };
                //测试数据
                // var Idstring = "1,2,3,4";
                // sendData(carInfo,Idstring)
                // ImageCache.uploadMoreFile(imageupload, imagesPath, function (Idstring) {
                var imagesPathLength = imagesPath.length;
                var Idstring = [];
                for (var i = 0; i < imagesPathLength; i++) {
                    var ids = imagesPath[i].slice(imagesPath[i].indexOf('&dsshandle=') + 11);
                    Idstring.push(ids)
                }
                sendData(carInfo, Idstring);
                // }, fail);
            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>发送中...</div></div></div>");
                }
            },
            uiAddChrysanthemum11: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>上传中...</div></div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                $('#chrysanthemumWarp').remove();
            },
            notifyInfo: function (el) {
                var target = $(el.currentTarget);
                var type = target.attr("data-value");
                var data = target.find("div").text();
                if (type == "userName") {
                    bfNaviController.push("addChanganCar/notifiUserName.html", {
                        data: data
                    })
                } else if (type == "certificateNum") {
                    bfNaviController.push("addChanganCar/notifyCertificate.html", {
                        data: data
                    })
                };
            }
        });
    });