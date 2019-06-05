define([
		'butterfly/view',
		"text!shared/footer.html",
		"css!shared/footer"
	],
	function(View, viewTemplate) {
		return View.extend({

			id: 'main-footer',
			from: null,
			events: {
				"click .moreList": "showTab",
				// "click .moreList": "goToMore",
			},
			initialize: function(options) {
				this.callback = options.callback;
				this.render();
			},
			render: function() {
				$(this.el).html(viewTemplate);
				$("body").append(this.el);
				this.onShow();
			},
			onShow: function() {
				this.uiFooter();
			},
			uiFooter: function() {
				/*var me = this;
				if (me.from) {
					var arr = me.$el.find('.footerName');
					_.map(arr, function(listitem) {
						if ($(listitem).text().trim() === me.from) {
							$(listitem).parent().find('.detailicon').addClass('footerActive');
							$(listitem).css({
								'color': '#319ce7'
							});
						}
					})
				}*/
				$($(".footerContent").find(".detailicon")[0]).addClass("footerActive");
				$($(".footerContent").find(".footerName")[0]).addClass("footerNameActive");
				$("body").append(this.$el);
			},
			showTab: function(el) {
				var me = this;
				$target = $(el.currentTarget);
				var tab = $target.attr("data-navigator");
				if ($($target.children().get(0)).hasClass("footerActive")) {
					return;
				} else {
					$(".footerContent").find(".detailicon").removeClass("footerActive");
					$(".footerContent").find(".footerName").removeClass("footerNameActive");
					$target.find(".detailicon").addClass("footerActive");
					$target.find(".footerName").addClass("footerNameActive");
					switch (tab) {
						case "service/index":
							me.callback.uiShowTabItem(0);
							break;
						case "consult/index":
							me.callback.uiShowTabItem(1);
							break;
						case "custom/index":
							me.callback.uiShowTabItem(2);
							break;
						case "myinfo/index":
							me.callback.uiShowTabItem(3);
							break;
					}
				}
			}
		}); //view define	

	});