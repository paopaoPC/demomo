(function($) {
    function CircleProgress(config) {
        this.init(config);
    }

    CircleProgress.prototype = {
      
        value: 0.0,
        size: 100.0,
        startAngle: -Math.PI,
        thickness: 'auto',
        fill: {
            gradient: ['#3aeabb', '#fdd250']
        },

        emptyFill: 'rgba(0, 0, 0, .1)',

        animation: {
            duration: 1200,
            easing: 'circleProgressEasing'
        },

        animationStartValue: 0.0,

        reverse: false,

        lineCap: 'butt',

        constructor: CircleProgress,

        el: null,

        canvas: null,

        ctx: null,

        radius: 0.0,

        arcFill: null,

        lastFrameValue: 0.0,

        init: function(config) {
            $.extend(this, config);
            this.radius = this.size / 2;
            this.initWidget();
            this.initFill();
            this.draw();
        },
        initWidget: function() {
            var canvas = this.canvas = this.canvas || $('<canvas>').prependTo(this.el)[0];
            canvas.width = this.size;
            canvas.height = this.size;
            this.ctx = canvas.getContext('2d');
        },
        initFill: function() {
            var self = this,
                fill = this.fill,
                ctx = this.ctx,
                size = this.size;

            if (!fill)
                throw Error("The fill is not specified!");

            if (fill.color)
                this.arcFill = fill.color;

            if (fill.gradient) {
                var gr = fill.gradient;

                if (gr.length == 1) {
                    this.arcFill = gr[0];
                } else if (gr.length > 1) {
                    var ga = fill.gradientAngle || 0, // gradient direction angle; 0 by default
                        gd = fill.gradientDirection || [
                            size / 2 * (1 - Math.cos(ga)), // x0
                            size / 2 * (1 + Math.sin(ga)), // y0
                            size / 2 * (1 + Math.cos(ga)), // x1
                            size / 2 * (1 - Math.sin(ga))  // y1
                        ];

                    var lg = ctx.createLinearGradient.apply(ctx, gd);

                    for (var i = 0; i < gr.length; i++) {
                        var color = gr[i],
                            pos = i / (gr.length - 1);

                        if ($.isArray(color)) {
                            pos = color[1];
                            color = color[0];
                        }

                        lg.addColorStop(pos, color);
                    }

                    this.arcFill = lg;
                }
            }

            if (fill.image) {
                var img;

                if (fill.image instanceof Image) {
                    img = fill.image;
                } else {
                    img = new Image();
                    img.src = fill.image;
                }

                if (img.complete)
                    setImageFill();
                else
                    img.onload = setImageFill;
            }

            function setImageFill() {
                var bg = $('<canvas>')[0];
                bg.width = self.size;
                bg.height = self.size;
                bg.getContext('2d').drawImage(img, 0, 0, size, size);
                self.arcFill = self.ctx.createPattern(bg, 'no-repeat');
                self.drawFrame(self.lastFrameValue);
            }
        },

        draw: function() {
            if (this.animation)
                this.drawAnimated(this.value);
            else
                this.drawFrame(this.value);
        },
        drawFrame: function(v) {
            this.lastFrameValue = v;
            this.ctx.clearRect(0, 0, this.size, this.size);
            // this.drawEmptyArc(v);
            this.drawArc(v);
        },
        drawArc: function(v) {
            var ctx = this.ctx,
                r = this.radius,
                t = this.getThickness(),
                a = this.startAngle;

            ctx.save();
            ctx.beginPath();

            if (!this.reverse) {
                ctx.arc(r, r, r - t / 2, a, a + Math.PI * 2 * v*0.75);
            } else {
                ctx.arc(r, r, r - t / 2, a - Math.PI * 2 * v*0.75, a);
            }

            ctx.lineWidth = t;
            ctx.lineCap = this.lineCap;
            ctx.strokeStyle = this.arcFill;
            ctx.stroke();
            ctx.restore();
        },
        drawEmptyArc: function(v) {
            var ctx = this.ctx,
                r = this.radius,
                t = this.getThickness(),
                a = this.startAngle;

            if (v < 1) {
                ctx.save();
                ctx.beginPath();
                if (v <= 0) {
                    ctx.arc(r, r, r - t / 2, 0, Math.PI * 2);
                } else {
                    if (!this.reverse) {
                        ctx.arc(r, r, r - t / 2, a + Math.PI * 2 * v, a);
                    } else {
                        ctx.arc(r, r, r - t / 2, a, a - Math.PI * 2 * v);
                    }
                }

                ctx.lineWidth = t;
                ctx.strokeStyle = this.emptyFill;
                ctx.stroke();
                ctx.restore();
            }
        },
        drawAnimated: function(v) {
            var self = this,
                el = this.el;
            el.trigger('circle-animation-start');
            $(this.canvas)
                .stop(true, true)
                .css({ animationProgress: 0 })
                .animate({ animationProgress: 1 }, $.extend({}, this.animation, {
                    step: function(animationProgress) {
                        var stepValue = self.animationStartValue * (1 - animationProgress) + v * animationProgress;
                        self.drawFrame(stepValue);
                        el.trigger('circle-animation-progress', [animationProgress, stepValue]);
                    },
                    complete: function() {
                        el.trigger('circle-animation-end');
                    }
                }));
        },
        getThickness: function() {
            return $.isNumeric(this.thickness) ? this.thickness : this.size / 14;
        }
    };

    $.circleProgress = {
        defaults: CircleProgress.prototype
    };

    $.easing.circleProgressEasing = function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    };
    $.fn.circleProgress = function(config) {
        var dataName = 'circle-progress';

        if (config == 'widget') {
            var data = this.data(dataName);
            return data && data.canvas;
        }

        return this.each(function() {
            var el = $(this).off(),
                instance = el.data(dataName),
                cfg = $.isPlainObject(config) ? config : {};

            if (instance) {
                instance.init(cfg);
            } else {
                cfg.el = el;
                instance = new CircleProgress(cfg);
                el.data(dataName, instance);
            }
        });
    };
})(jQuery);
