define([
		"common/navView",
        "common/LocalResizeIMG",
        "text!addChanganCar/addCarView.html",
		'butterfly',
		"shared/js/notification"
	],
	function(View, localResizeIMG,template,Butterfly,Notification){
        var Base = View;
		return Base.extend({
			id: 'addCarView',
			html: template,
			events:{
				"click #submit_carid": "submitData",
				"click #addCarDemo":"addCarDemo",
				"click #navLeft":"asdasd",
				"click .dialog-step-1-btn":"closeDialog",
				// "click .input-gcNumber":"showDialog",
                "click .items": "addImage",
                "click .showScanFanCode": "showScanFanCode",
                "click .dialog-step-1-btn-alert": "closeAlertVinInfo",
                "click .openPicView_1":"openPicView_1",
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
            openPicView_1: function(el){
                var me = this;
                 this.cacheE  = el;
                this._target = this.$('.item1');
                window.openPicView_1 = function(data){
                    if(data){
                        me.uiAddChrysanthemum();
                         me.uploadFile(me.convertBase64UrlToBlob(data), function (data) {
                            var uploadImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data[0].result;
                            me.uploadFileSuccess(uploadImg)
                        });
                    }
                }
                OSApp.openPhotoLibrary(false,500,'window.openPicView_1')
            },
			closeAlertVinInfo: function(){
				this.$('.dialog-step-wrap-alert').hide()
				this.submitData(undefined,true)
			},
			showScanFanCode: function(){
				var me = this;
				window.showScanBarCode_addCarView = function(data){
					me.$('.car_vin').val(data)
				}
				OSApp.showScanBarCode('{}','showScanBarCode_addCarView');
			},
			 closeMask: function () {
                var $mask = $(this.getElement("#mask"));
                $mask.off("click");
                $mask.remove();
            },
			addImage: function (el, need) {
                this.cacheE  = el;
                this._target = $(el.currentTarget);
                var me = this;
                // var temp = _.template(this.elementHTML('#tips'));
                var index = $(el.currentTarget).attr("data-value");
                this._indexImg = index;
                var str = '.dialog-step-wrap-' + index;
                this.$(str).show();
                // if (index == 1 && !need) {
                //     oldDialog.createDialog({
                //         closeBtn: false,
                //         buttons: {
                //             '确定': function () {
                //                 me.addImage(el, true);
                //                 this.close();
                //             },

                //         },
                //         content: "1.请勿使用前置摄像头拍照<br/>2.请保持手持身份证件清晰"
                //     });
                //     return;
                // }
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

                    this.$('.dialog-step-1-btn input').localResizeIMG({
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
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>上传中...</div></div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                $('#chrysanthemumWarp').remove();
            },
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
                this.uiAddChrysanthemum();
                $.ajax({
                    url: imageupload,
                    type: 'POST',
                    data: fromData,
                    timeout: 15000,
                    processData: false,
                    contentType: false,
                    success: function (result) {
                    	me.uiRemoveChrysanthemum()
                        callback(result);
                        $("#mask").remove();
                    },
                    error: function (data) {
                    	me.uiRemoveChrysanthemum()
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
			closeDialog: function(){
				this.$('.dialog-step-wrap').hide()
				// this.$('.dialog-step-1-btn').trigger('click',this.cacheE)
			},
			showDialog: function(e){
				this.cacheE = e;
				this.$('.dialog-step-wrap').show()
			},
			asdasd: function(){
				if(window.localStorage['goMainIndex'] == '2'){
					OSApp.closeView();
				} else {
					bfNaviController.pop(1)
				}
			},
			onViewPush:function(pushFrom, pushData){
				if (pushData) {
					this.__orderId = pushData.orderId;
					if(pushData.vin){
						this.getElement("#vin").val(pushData.vin);
					}
					if (pushData.hasVirtalCar) {
						this.getElement("#addCarDemo").hide()
					};
				};
			},
			posGenHTML: function() {
                if(window.localStorage['goMainIndex'] == '2'){
                    this.$('.showScanFanCode').hide()
                    var vin = window.localStorage['goMainIndex2Vin']
                    this.$(".car_vin").css('color','#948686')
                    this.$(".car_vin").val(vin)
                    this.$(".car_vin").attr("disabled","disabled");
                }
			},
			onShow:function(){
				var me = this;
				if(!me.first){
				    me.first =true;
				    var H = this.$('.content').height()  - 85;
				    this.$('#submit_carid').css('margin-top',H+'px').show()
				    
				}
			},
			addCarDemo: function (el) {
				var tar = $(el.currentTarget);
				var self = this;
				//添加虚拟车辆
				bfClient.addDemoCar({
					type: 'post',
					success: function (data) {
						if (data.code == 0) {
							Notification.show({
								type: 'info',
								message: '添加虚拟车辆成功~~'
							});
							bfAPP.trigger("IM_EVENT_CAR_CHANGED");
							// self.goBack();
							bfNaviController.pop(1)
						} else if (data.code == 1) {
							Notification.show({
								type: 'error',
								message: '添加失败~~'
							});
						}
					}
				});
			},
			submitData: function(el,need){

                    var carVin = this.getElement("#vin").val();
	                var receiptHandle = this.getElement(".item1").find("img").attr("src");
                if(!need){

					// var engineNum = this.getElement("#engineNum").val().trim();
					if (!carVin) {
						Notification.show({
	                        type: "error",
	                        message: "请输入车架号"
	                    });
	                    return;
					};
					// if (!engineNum) {
					// 	Notification.show({
					// 		type:"error",
					// 		message:"请输入发动机号"
					// 	})
					// };
					//对车架号的判断，必须为17位
	                _valid = new RegExp("^[A-Za-z0-9]+$");
					if (carVin.length != 17) {
						Notification.show({
	                        type: "error",
	                        message: "车架号错误"
	                    });
	                    return;
					}
					if (!_valid.test(carVin)) {
						Notification.show({
	                        type: "error",
	                        message: "请输入数字和字母"
	                    });
	                    return;
					};
					if (!receiptHandle) {
	                    Notification.show({
	                        type: "error",
	                        message: "请上传照片"
	                    });
	                    return;
	                };
                	this.$('.dialog-step-wrap-alert').show()
                } else {
                	var carData = {
                		vin: carVin, 
                		enginNo: '',
                		orderId: this.__orderId
                	}

                	bfClient.getChanganCar({
                		data: carData,
                		success: function(data){
                			if (data.code == 0) {
                				bfNaviController.push("addChanganCar/carInfo.html",carData)
                			}else{
                				Notification.show({
                					type:"error",
                					message:data.msg
                				})
                			}
                		},
                		error: function(){
                			Notification.show({
                				type:"error",
                				message:"网络开小差"
                			})
                		}
                	})
                }
                


			}
		}); 
	});