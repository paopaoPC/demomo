define(["common/navView", "butterfly", "shared/js/notification", "shared/timePicker/js/date", "shared/js/client", "shared/plugin_dialog/js/dialog", "common/disUtil", "map/map-client", "main/Plugins", "underscore", "common/imageCodeInterface", "common/countDwonUtil", "shared/js/input-bind-offset"], function(e, t, n, i, o, r, s, a, l, c, d, g, h) {
	return e.extend({
		events: {
			"click .close-button": "clearInput",
			"click #registerBackButton11": "registerBack",
			"click .registeBotton": "onRegiste",
			"click .sexItem": "changeSex",
			"input input": "onInput",
			"click .verifiation-btn": "getVerificationCode",
			"click .nextPage": "nextPage",
			"click .image-code": function() {
				this.getImageCode()
			}
		},
		registerBack: function() {
			bfNaviController.pop(1)
		},
		posGenHTML: function() {},
		onShow: function() {
			"undefined" != typeof cordova && navigator.packaging.setBaseUrl({
				baseUrl: bfConfig.server,
				isNev: window.localStorage.isNev
			}, function() {}, function() {}), $("#newRegister #phone-number").on("input", function(e) {
				var t = $("#newRegister #phone-number").val();
				if (11 == t.length) {
					var n = /^((\+?86)|(\(\+86\)))?1\d{10}$/;
					if (n.test(t)) {
						var i = {
							mobile: t
						};
						bfClient.checkPhone(i, function(e) {
							if(22 == e.code){
								$("#register-tel-inf").css("display", "block").html(e.msg)
								$("#newRegister .password,.password-info").hide()
								$("#newRegister .password").hide()
							} else {
								if(e.success ){
									$("#register-tel-inf").css("display", "none")
									$("#newRegister .password #password").attr("placeholder", "请为账号设置密码")
									$("#newRegister .password,.password-info").show()
								} else {
									$("#register-tel-inf").css("display", "none")
									$("#newRegister .password #password").attr("placeholder", "请输入登录密码") 
									$("#newRegister .password").show(), $(".password-info").hide()
								}
							}
						})
					} else $("#newRegister #register-tel-inf").show(), $("#newRegister #register-tel-inf").text("请输入正确的手机号码")
				}
			}), $("#newRegister #phone-number").blur(function() {
				$("#newRegister #phone-number").val().length < 11 && $("#newRegister #phone-number").val().length > 0 && ($("#newRegister #register-tel-inf").css("display", "block"), $("#newRegister #register-tel-inf").text("手机号位数错误"))
			})
		},
		nextPage: function() {
			var e = $("#newRegister #phone-number").val(),
				t = $(".auth-code").val(),
				i = $("#newRegister .password #password").val();
			if (!e || "" == e) return void n.show({
				type: "error",
				message: "手机号码为注册必填项，请填写。"
			});
			var o = /^((\+?86)|(\(\+86\)))?1\d{10}$/;
			if (!o.test(e)) return void n.show({
				type: "error",
				message: "请输入正确的手机号码"
			});
			if (!t || "" == t) return void n.show({
				type: "error",
				message: "请输入验证码"
			});
			if (!i || "" == i) return void n.show({
				type: "error",
				message: "请输入密码"
			});
			var r = {
				mobile: e,
				password: i,
				vercode: t
			};
			navigator.packaging.goWxBind(r, function(e) {
				if (window.localStorage.setItem("loginModel", "authother"), console.log(e), e && "bind" == e.isBind) {
					console.log(e.token), console.log(e.refreshToken), window.localStorage.setItem("token", e.token), "undefined" != typeof cordova || window.localStorage.setItem("refreshToken", e.refreshToken);
					var t = {};
					t.token = e.token, t.style = !0, window.sessionStorage.setItem("bind_user_cache_info", JSON.stringify(t)), n.show({
						type: "error",
						message: "绑定成功"
					}), bfNaviController.startWith("/login/index.html")
				} else n.show({
					type: "error",
					message: e.message
				})
			}, function() {
				alert("失败")
			})
		},
		getImageCode: function() {
			var e = this.getElement("#checkImg");
			d.getImageCode(e)
		},
		bindDatePicker: function() {
			var e = this;
			e.dp = i($), e.$el.find(".birthDay").date({
				theme: "date"
			}, function(t) {
				t = moment(t, "YYYY-MM-DD").format("YYYY-MM-DD");
				var i = new Date,
					o = i.getMonth() + 1 < 10 ? "0" + (i.getMonth() + 1) : i.getMonth() + 1;
				return i = i.getFullYear() + "-" + o + "-" + i.getDate(), t > i ? void n.show({
					type: "error",
					message: "出生时间应该小于当前时间"
				}) : (e.$el.find(".birthDay").find(".inputText").text(t), e.$el.find(".birthDay").find(".inputText").text(t).css("color", "black"), e.$el.find(".birthDay").find(".hint").hide(), void(e.dp.time = t))
			}, function() {})
		},
		valiPassWord: function(e) {
			var t = 0,
				i = new RegExp("[a-z]"),
				o = new RegExp("[A-Z]"),
				r = new RegExp("[0-9]"),
				s = new RegExp("((?=[!-~]+)[^A-Za-z0-9])");
			return e.length < 6 || e.length > 16 ? (n.show({
				type: "info",
				message: "请输入6-16位的密码"
			}), !1) : (i.test(e) && t++, o.test(e) && t++, r.test(e) && t++, s.test(e) && t++, t >= 2 || (n.show({
				type: "info",
				message: "密码需大、小写字母、数字、特殊字符中的至少两种"
			}), !1))
		},
		getByteLen: function(e) {
			for (var t = 0, n = 0; n < e.length; n++) {
				var i = e.charAt(n);
				t += null != i.match(/[^-ÿ]/gi) ? 2 : 1
			}
			return t
		},
		uiAddChrysanthemum: function() {
			var e = this;
			0 === e.$el.find(".chrysanthemum").length && e.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>加载中...</div></div>")
		},
		uiRemoveChrysanthemum: function() {
			$(".chrysanthemum").remove()
		},
		changeSex: function(e) {
			var t = $(e.currentTarget);
			this.$el.find(".sex").find(".sexPoint-icon").removeClass("check"), t.find(".sexPoint-icon").addClass("check")
		},
		onInput: function(e) {
			var t = $(e.currentTarget);
			"" != t.val() ? t.parent().find(".close-button").show() : t.parent().find(".close-button").hide()
		},
		clearInput: function(e) {
			var t = $(e.currentTarget);
			"login" == this._showPage ? (t.siblings("input").val(""), window.localStorage.password = null) : t.parent().find("input").val(""), t.parent().find("input").focus(), t.hide()
		},
		getVerificationCode: function() {
			var e = this;
			this._txt = this.getElement(".verifiation-btn");
			var t = this.getElement("#phone-number").val();
			this.getElement(".imageCode").find("input").val();
			e.uiAddChrysanthemum();
			d.verificationCodeOuth2(this._txt, t, function() {
				e.uiRemoveChrysanthemum()
			})
		}
	})
});