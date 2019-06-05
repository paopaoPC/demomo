var Ui = pc.createScript("ui");
Ui.attributes.add("cssUi", {
    default: [],
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}), Ui.prototype.initialize = function () {
    if (document.body) {
        var t = document.createElement("style");
        document.head.appendChild(t), t.innerHTML = this.cssUi.resource || ""
    }
    this.vrImg = null, this.app.ui = this
}, Ui.prototype.ShowExitVr = function () {
    this.vrImg = document.createElement("img"), this.vrImg.src = this.app.assets.get(10732597).getFileUrl(), this.vrImg.classList.add("enterImg"), document.body.appendChild(this.vrImg), this.vrImg.addEventListener("click", this.clickExitVR.bind(this), !1)
}, Ui.prototype.CloseExitVr = function () {
    this.vrImg.removeEventListener("click", this.clickExitVR.bind(this), !1), document.body.removeChild(this.vrImg)
}, Ui.prototype.clickExitVR = function () {
    this.CloseExitVr(), this.app._mouseLook.leaveVr()
};
var AutoDistance = pc.createScript("autoDistance");
AutoDistance.attributes.add("defaultDist", {
    type: "number",
    default: 4
}), AutoDistance.attributes.add("zDist", {
    type: "number",
    default: 3.3
}), AutoDistance.attributes.add("xDist", {
    type: "number",
    default: 2.2
}), AutoDistance.attributes.add("parentMovement", {
    type: "number",
    default: 1.5
}), AutoDistance.attributes.add("speed", {
    type: "number",
    default: 1
}), AutoDistance.attributes.add("distMult", {
    type: "number",
    default: 1
}), AutoDistance.attributes.add("minFov", {
    type: "number",
    default: 1,
    title: "最小视觉",
    min: 0,
    max: 90
}), AutoDistance.attributes.add("maxFov", {
    type: "number",
    default: 1,
    title: "最大视觉",
    max: 90,
    min: 0
}), AutoDistance.prototype.initialize = function () {
    this.weight = 1, this.cam = this.entity.camera.camera, this.cam.horizontalFov = !0, this.mult = (this.maxFov - this.minFov) / 8, this.distance = pc.math.lerp(this.minFov, this.maxFov, .5), this.targetDistance = this.distance, this.lpos2 = new pc.Vec3, this.app._autoDistance = this, this.app.graphicsDevice.width / this.app.graphicsDevice.height < 1 && this.setMinFov()
}, AutoDistance.prototype.postUpdate = function (t) {
    if (this.enabled) {
        var i = t * this.speed * this.weight,
            s = this.entity.forward,
            e = Math.abs(s.z),
            a = Math.abs(s.x),
            o = Math.abs(s.y),
            n = this.smoothstep(this.defaultDist, this.xDist, a);
        n = this.smoothstep(n, this.zDist, e) * this.distMult;
        var h = this.entity.getLocalPosition();
        h.z = this.smoothstep(h.z, n, i), this.entity.setLocalPosition(h), this.lpos2.z = this.smoothstep(this.lpos2.z, -s.z * this.parentMovement, i), this.lpos2.y = this.smoothstep(this.lpos2.y, s.y * (1.25 * o + 1) * (o * -e + 1), i), this.entity.getParent().setPosition(this.lpos2), this.distance = pc.math.lerp(this.distance, this.targetDistance, t / .2), this.cam.fov = this.distance
    }
}, AutoDistance.prototype.smoothstep = function (t, i, s) {
    return s = s * s * (3 - 2 * s), pc.math.lerp(t, i, s)
}, AutoDistance.prototype.onMouseWheel = function (t) {
    var i = t * -this.mult;
    this.targetDistance += i, this.targetDistance < this.minFov ? this.targetDistance = this.minFov : this.targetDistance > this.maxFov && (this.targetDistance = this.maxFov)
}, AutoDistance.prototype.startFovScale = function () {}, AutoDistance.prototype.camFovScale = function (t) {
    this.targetDistance -= .1 * t, this.targetDistance = pc.math.clamp(this.targetDistance, this.minFov, this.maxFov)
}, AutoDistance.prototype.setMinFov = function () {
    this.targetDistance = this.minFov
};
var Blob = pc.createScript("blob");
Blob.attributes.add("asset", {
    type: "asset",
    array: !0,
    default: []
}), Blob.attributes.add("scale", {
    type: "number",
    default: 1
}), Blob.attributes.add("opacity", {
    type: "number",
    default: 1,
    min: 0,
    max: 1
}), Blob.prototype.initialize = function () {
    this.texture = null, this.asset[0] && (this.textureAsset = this.app.assets.find(this.asset[0].name), this.setTexture(this.textureAsset.resource), this.opacityOld = this.opacity, this.scaleOld = this.scale)
}, Blob.prototype.setTexture = function (t) {
    this.texture = t, this.entity.model.model.meshInstances[0].setParameter("texture_diffuseMap", this.texture), this.entity.model.model.meshInstances[0].setParameter("opacity", this.opacity), this.entity.model.model.meshInstances[0].setParameter("scale", this.scale)
}, Blob.prototype.update = function (t) {
    this.opacityOld !== this.opacity && (this.opacityOld = this.opacity, this.entity.model.model.meshInstances[0].setParameter("opacity", this.opacity)), this.scaleOld !== this.scale && (this.scaleOld = this.scale, this.entity.model.model.meshInstances[0].setParameter("scale", this.scale))
};
var Dpi = pc.createScript("dpi");
Dpi.prototype.initialize = function () {
    /(Android\s(4))|(OS\s8_)/.test(navigator.userAgent) && (this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio)
};
var Blobs = pc.createScript("blobs");
Blobs.attributes.add("mats", {
    type: "asset",
    assetType: "material",
    array: !0
}), Blobs.prototype.initialize = function () {
    this.list = [], this.isOn = !0, this.material = new pc.BasicMaterial, this.material.updateShader = function (t) {
        this.shader = new pc.Shader(t, {
            attributes: {
                vertex_position: "POSITION"
            },
            vshader: "                 attribute vec3 vertex_position;\n                 uniform mat4 matrix_model;\n                 uniform mat4 matrix_projection;\n                 uniform mat4 matrix_view;\n                 uniform mat3 matrix_normal;\n                 uniform float scale;\n                 varying vec2 vUv0;\n                 void main(void)\n                 {\n                     vec3 normal = normalize(matrix_normal * vec3(0, 1, 0));\n                     float d = max(0.0, (dot(vec3(matrix_view[0][2], matrix_view[1][2], matrix_view[2][2]), normal) - 0.35) * (1.0 / (1.0 - 0.35)));\n                     mat4 modelMatrix = matrix_view * matrix_model;\n                     modelMatrix[0][0] = 1.0;\n                     modelMatrix[0][1] = 0.0;\n                     modelMatrix[0][2] = 0.0;\n                     modelMatrix[1][0] = 0.0;\n                     modelMatrix[1][1] = 1.0;\n                     modelMatrix[1][2] = 0.0;\n                     modelMatrix[2][0] = 0.0;\n                     modelMatrix[2][1] = 0.0;\n                     modelMatrix[2][2] = 1.0;\n                     vec4 positionW = modelMatrix * vec4(vertex_position * scale * d, 1.0);\n                     gl_Position = matrix_projection * positionW;\n                     vUv0 = vertex_position.xy + vec2(0.5);\n                     vUv0.y = 1.0 - vUv0.y;\n                 }\n",
            fshader: "                 precision highp float;\n                 varying vec2 vUv0;\n                 uniform float opacity;\n                 uniform sampler2D texture_diffuseMap;\n                 void main(void)\n                 {\n                     vec3 diffuse = texture2D(texture_diffuseMap, vUv0).rgb;\n                     if (diffuse.r * opacity < 0.001) discard;\n                     gl_FragColor = vec4(diffuse * opacity, 1.0);\n                 }\n"
        })
    }, this.material.depthTest = !1, this.material.depthWrite = !1, this.material.blend = !0, this.material.blendSrc = 1, this.material.blendDst = 1, this.material.update();
    for (var t = [-.5, .5, 0, .5, .5, 0, .5, -.5, 0, -.5, -.5, 0], e = [2, 1, 0, 0, 3, 2], i = new pc.VertexFormat(this.app.graphicsDevice, [{
            semantic: pc.SEMANTIC_POSITION,
            components: 3,
            type: pc.ELEMENTTYPE_FLOAT32
        }]), n = new pc.VertexBuffer(this.app.graphicsDevice, i, t.length / 3), a = new pc.VertexIterator(n), r = 0; r < t.length / 3; r++) a.element[pc.SEMANTIC_POSITION].set(t[3 * r], t[3 * r + 1], t[3 * r + 2]), a.next();
    a.end();
    var o = new pc.IndexBuffer(this.app.graphicsDevice, pc.INDEXFORMAT_UINT16, e.length);
    new Uint16Array(o.lock()).set(e), o.unlock();
    var s = new pc.Mesh;
    s.vertexBuffer = n, s.indexBuffer[0] = o, s.primitive[0].type = pc.PRIMITIVE_TRIANGLES, s.primitive[0].base = 0, s.primitive[0].count = e.length, s.primitive[0].indexed = !0;
    var p = new pc.GraphNode,
        m = new pc.MeshInstance(p, s, this.material);
    m.updateKey();
    var l = new pc.Model;
    l.graph = p, l.meshInstances = [m], this.processEntity(this.entity, l), this.app.on("deng:toggle", function (t) {
        this.isOn = !t, this.switch()
    }, this), this.switch(), this.addToBM()
}, Blobs.prototype.processEntity = function (t, e) {
    t.script && t.script.blob && (this.list.push(t), t.model.model = e.clone());
    for (var i = t.getChildren(), n = 0; n < i.length; n++) this.processEntity(i[n], e)
}, Blobs.prototype.addToBM = function () {
    for (var t = this.app.root.findByName("beimen"), e = this.app.root.findByTag("bmd"), i = 0; i < e.length; i++) e[i].reparent(t), e[i].setPosition(0, 0, 0), "RL_LIGHT1_b" === e[i].name ? e[i].setPosition(-.632, 1.035, -2.12) : "RL_LIGHT2_b" === e[i].name ? e[i].setPosition(-.577, 1.043, -2.14) : "RL_LIGHT3_b" === e[i].name ? e[i].setPosition(-.679, 1.032, -2.1) : "RR_LIGHT1_b" === e[i].name ? e[i].setPosition(.632, 1.035, -2.12) : "RR_LIGHT2_b" === e[i].name ? e[i].setPosition(.577, 1.043, -2.14) : "RR_LIGHT3_b" === e[i].name && e[i].setPosition(.679, 1.032, -2.1)
}, Blobs.prototype.switch = function () {
    this.isOn = !this.isOn;
    for (var t = 0; t < this.list.length; t++) this.list[t].enabled = this.isOn
};
var Exposure = pc.createScript("exposure");
Exposure.prototype.initialize = function () {
    this.old_exposure = this.app.scene.exposure, this.app.scene.exposure = 0, this.speed = .001
}, Exposure.prototype.update = function (e) {
    this.app.scene.exposure < this.old_exposure && (this.app.scene.exposure += e * this.speed, this.speed += .02 * (4 - this.speed), this.app.scene.exposure >= this.old_exposure && (this.app.scene.exposure = this.old_exposure, this.enabled = !1))
};
var Floor = pc.createScript("floor");
Floor.attributes.add("speed", {
    type: "number"
}), Floor.attributes.add("maxSpeed", {
    type: "number",
    default: 180,
    title: "最大速度"
}), Floor.prototype.initialize = function () {
    this.vec = new pc.Vec4(8, 8, .5, 0), this.autoSpeed = 0, this.jd = 1, this.currState = !1, this.app.on("speed:toggle", function (t) {
        this.currState = t, this.updateSpeed()
    }, this)
}, Floor.prototype.updateSpeed = function () {
    this.speed = this.app.shiti ? 0 : this.currState ? 0 : 3
}, Floor.prototype.update = function (t) {
    this.entity.model.model && (this.entity.model.model.meshInstances[0].setParameter("texture_diffuseMapTransform", this.vec.data), this.speed <= 0 || (this.vec.w = this.vec.w - 1e3 * this.speed / 60 / 60 * t, this.vec.w < 0 && (this.vec.w += 1)))
};
var PatchSkybox = pc.createScript("patchSkybox");
PatchSkybox.prototype.initialize = function () {
    pc.shaderChunks.skyboxHDRPS = "        varying vec3 vViewDir;        uniform samplerCube texture_cubeMap;        void main(void) {            vec3 color = processEnvironment($textureCubeSAMPLE(texture_cubeMap, fixSeamsStatic(vViewDir, $FIXCONST)).rgb);            color = toneMap(color * 0.2);            color = gammaCorrectOutput(color);            gl_FragColor = vec4(color, 1.0);        }"
};
"undefined" != typeof document && (function (t, e) {
    function s(t, e) {
        for (var n in e) try {
            t.style[n] = e[n]
        } catch (t) {}
        return t
    }

    function H(t) {
        return null == t ? String(t) : "object" == typeof t || "function" == typeof t ? Object.prototype.toString.call(t).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof t
    }

    function R(t, e) {
        if ("array" !== H(e)) return -1;
        if (e.indexOf) return e.indexOf(t);
        for (var n = 0, o = e.length; n < o; n++)
            if (e[n] === t) return n;
        return -1
    }

    function I() {
        var t, e = arguments;
        for (t in e[1])
            if (e[1].hasOwnProperty(t)) switch (H(e[1][t])) {
                case "object":
                    e[0][t] = I({}, e[0][t], e[1][t]);
                    break;
                case "array":
                    e[0][t] = e[1][t].slice(0);
                    break;
                default:
                    e[0][t] = e[1][t]
            }
        return 2 < e.length ? I.apply(null, [e[0]].concat(Array.prototype.slice.call(e, 2))) : e[0]
    }

    function N(t) {
        return 1 === (t = Math.round(255 * t).toString(16)).length ? "0" + t : t
    }

    function S(t, e, n, o) {
        t.addEventListener ? t[o ? "removeEventListener" : "addEventListener"](e, n, !1) : t.attachEvent && t[o ? "detachEvent" : "attachEvent"]("on" + e, n)
    }

    function D(t, o) {
        function g(t, e, n, o) {
            return l[0 | t][Math.round(Math.min((e - n) / (o - n) * z, z))]
        }

        function r() {
            C.legend.fps !== L && (C.legend.fps = L, C.legend[c] = L ? "FPS" : "ms"), w = L ? O.fps : O.duration, C.count[c] = 999 < w ? "999+" : w.toFixed(99 < w ? 0 : F.decimals)
        }

        function m() {
            for (p = n(), T < p - F.threshold && (O.fps -= O.fps / Math.max(1, 60 * F.smoothing / F.interval), O.duration = 1e3 / O.fps), y = F.history; y--;) j[y] = 0 === y ? O.fps : j[y - 1], q[y] = 0 === y ? O.duration : q[y - 1];
            if (r(), F.heat) {
                if (E.length)
                    for (y = E.length; y--;) E[y].el.style[h[E[y].name].heatOn] = L ? g(h[E[y].name].heatmap, O.fps, 0, F.maxFps) : g(h[E[y].name].heatmap, O.duration, F.threshold, 0);
                if (C.graph && h.column.heatOn)
                    for (y = M.length; y--;) M[y].style[h.column.heatOn] = L ? g(h.column.heatmap, j[y], 0, F.maxFps) : g(h.column.heatmap, q[y], F.threshold, 0)
            }
            if (C.graph)
                for (v = 0; v < F.history; v++) M[v].style.height = (L ? j[v] ? Math.round(b / F.maxFps * Math.min(j[v], F.maxFps)) : 0 : q[v] ? Math.round(b / F.threshold * Math.min(q[v], F.threshold)) : 0) + "px"
        }

        function k() {
            20 > F.interval ? (f = i(k), m()) : (f = setTimeout(k, F.interval), x = i(m))
        }

        function G(t) {
            (t = t || window.event).preventDefault ? (t.preventDefault(), t.stopPropagation()) : (t.returnValue = !1, t.cancelBubble = !0), O.toggle()
        }

        function U() {
            F.toggleOn && S(C.container, F.toggleOn, G, 1), t.removeChild(C.container)
        }

        function V() {
            if (C.container && U(), h = D.theme[F.theme], !(l = h.compiledHeatmaps || []).length && h.heatmaps.length) {
                for (v = 0; v < h.heatmaps.length; v++)
                    for (l[v] = [], y = 0; y <= z; y++) {
                        var e, n = l[v],
                            o = y;
                        e = .33 / z * y;
                        var a = h.heatmaps[v].saturation,
                            i = h.heatmaps[v].lightness,
                            p = void 0,
                            c = void 0,
                            u = void 0,
                            d = u = void 0,
                            g = p = c = void 0;
                        g = void 0;
                        0 === (u = .5 >= i ? i * (1 + a) : i + a - i * a) ? e = "#000" : (c = (u - (d = 2 * i - u)) / u, g = (e *= 6) - (p = Math.floor(e)), g *= u * c, 0 === p || 6 === p ? (p = u, c = d + g, u = d) : 1 === p ? (p = u - g, c = u, u = d) : 2 === p ? (p = d, c = u, u = d + g) : 3 === p ? (p = d, c = u - g) : 4 === p ? (p = d + g, c = d) : (p = u, c = d, u -= g), e = "#" + N(p) + N(c) + N(u)), n[o] = e
                    }
                h.compiledHeatmaps = l
            }
            for (var m in C.container = s(document.createElement("div"), h.container), C.count = C.container.appendChild(s(document.createElement("div"), h.count)), C.legend = C.container.appendChild(s(document.createElement("div"), h.legend)), C.graph = F.graph ? C.container.appendChild(s(document.createElement("div"), h.graph)) : 0, E.length = 0, C) C[m] && h[m].heatOn && E.push({
                name: m,
                el: C[m]
            });
            if (M.length = 0, C.graph)
                for (C.graph.style.width = F.history * h.column.width + (F.history - 1) * h.column.spacing + "px", y = 0; y < F.history; y++) M[y] = C.graph.appendChild(s(document.createElement("div"), h.column)), M[y].style.position = "absolute", M[y].style.bottom = 0, M[y].style.right = y * h.column.width + y * h.column.spacing + "px", M[y].style.width = h.column.width + "px", M[y].style.height = "0px";
            s(C.container, F), r(), t.appendChild(C.container), C.graph && (b = C.graph.clientHeight), F.toggleOn && ("click" === F.toggleOn && (C.container.style.cursor = "pointer"), S(C.container, F.toggleOn, G))
        }
        "object" === H(t) && t.nodeType === e && (o = t, t = document.body), t || (t = document.body);
        var h, l, p, f, x, b, w, y, v, O = this,
            F = I({}, D.defaults, o || {}),
            C = {},
            M = [],
            z = 100,
            E = [],
            A = F.threshold,
            P = 0,
            T = n() - A,
            j = [],
            q = [],
            L = "fps" === F.show;
        O.options = F, O.fps = 0, O.duration = 0, O.isPaused = 0, O.tickStart = function () {
            P = n()
        }, O.tick = function () {
            p = n(), A += (p - T - A) / F.smoothing, O.fps = 1e3 / A, O.duration = P < T ? A : p - P, T = p
        }, O.pause = function () {
            return f && (O.isPaused = 1, clearTimeout(f), a(f), a(x), f = x = 0), O
        }, O.resume = function () {
            return f || (O.isPaused = 0, k()), O
        }, O.set = function (t, e) {
            return F[t] = e, L = "fps" === F.show, -1 !== R(t, u) && V(), -1 !== R(t, d) && s(C.container, F), O
        }, O.showDuration = function () {
            return O.set("show", "ms"), O
        }, O.showFps = function () {
            return O.set("show", "fps"), O
        }, O.toggle = function () {
            return O.set("show", L ? "ms" : "fps"), O
        }, O.hide = function () {
            return O.pause(), C.container.style.display = "none", O
        }, O.show = function () {
            return O.resume(), C.container.style.display = "block", O
        }, O.destroy = function () {
            O.pause(), U(), O.tick = O.tickStart = function () {}
        }, V(), k()
    }
    var n, o = t.performance;
    n = o && (o.now || o.webkitNow) ? o[o.now ? "now" : "webkitNow"].bind(o) : function () {
        return +new Date
    };
    for (var a = t.cancelAnimationFrame || t.cancelRequestAnimationFrame, i = t.requestAnimationFrame, h = 0, l = 0, p = (o = ["moz", "webkit", "o"]).length; l < p && !a; ++l) i = (a = t[o[l] + "CancelAnimationFrame"] || t[o[l] + "CancelRequestAnimationFrame"]) && t[o[l] + "RequestAnimationFrame"];
    a || (i = function (e) {
        var o = n(),
            a = Math.max(0, 16 - (o - h));
        return h = o + a, t.setTimeout(function () {
            e(o + a)
        }, a)
    }, a = function (t) {
        clearTimeout(t)
    });
    var c = "string" === H(document.createElement("div").textContent) ? "textContent" : "innerText";
    D.extend = I, window.FPSMeter = D, D.defaults = {
        interval: 100,
        smoothing: 10,
        show: "fps",
        toggleOn: "click",
        decimals: 1,
        maxFps: 60,
        threshold: 100,
        position: "absolute",
        zIndex: 10,
        left: "5px",
        top: "5px",
        right: "auto",
        bottom: "auto",
        margin: "0 0 0 0",
        theme: "dark",
        heat: 0,
        graph: 0,
        history: 20
    };
    var u = ["toggleOn", "theme", "heat", "graph", "history"],
        d = "position zIndex left top right bottom margin".split(" ")
}(window), function (t, e) {
    e.theme = {};
    var n = e.theme.base = {
        heatmaps: [],
        container: {
            heatOn: null,
            heatmap: null,
            padding: "5px",
            minWidth: "95px",
            height: "30px",
            lineHeight: "30px",
            textAlign: "right",
            textShadow: "none"
        },
        count: {
            heatOn: null,
            heatmap: null,
            position: "absolute",
            top: 0,
            right: 0,
            padding: "5px 10px",
            height: "30px",
            fontSize: "24px",
            fontFamily: "Consolas, Andale Mono, monospace",
            zIndex: 2
        },
        legend: {
            heatOn: null,
            heatmap: null,
            position: "absolute",
            top: 0,
            left: 0,
            padding: "5px 10px",
            height: "30px",
            fontSize: "12px",
            lineHeight: "32px",
            fontFamily: "sans-serif",
            textAlign: "left",
            zIndex: 2
        },
        graph: {
            heatOn: null,
            heatmap: null,
            position: "relative",
            boxSizing: "padding-box",
            MozBoxSizing: "padding-box",
            height: "100%",
            zIndex: 1
        },
        column: {
            width: 4,
            spacing: 1,
            heatOn: null,
            heatmap: null
        }
    };
    e.theme.dark = e.extend({}, n, {
        heatmaps: [{
            saturation: .8,
            lightness: .8
        }],
        container: {
            background: "#222",
            color: "#fff",
            border: "1px solid #1a1a1a",
            textShadow: "1px 1px 0 #222"
        },
        count: {
            heatOn: "color"
        },
        column: {
            background: "#3f3f3f"
        }
    }), e.theme.light = e.extend({}, n, {
        heatmaps: [{
            saturation: .5,
            lightness: .5
        }],
        container: {
            color: "#666",
            background: "#fff",
            textShadow: "1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
        },
        count: {
            heatOn: "color"
        },
        column: {
            background: "#eaeaea"
        }
    }), e.theme.colorful = e.extend({}, n, {
        heatmaps: [{
            saturation: .5,
            lightness: .6
        }],
        container: {
            heatOn: "backgroundColor",
            background: "#888",
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,.2)",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
        },
        column: {
            background: "#777",
            backgroundColor: "rgba(0,0,0,.2)"
        }
    }), e.theme.transparent = e.extend({}, n, {
        heatmaps: [{
            saturation: .8,
            lightness: .5
        }],
        container: {
            padding: 0,
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,.5)"
        },
        count: {
            padding: "0 5px",
            height: "40px",
            lineHeight: "40px"
        },
        legend: {
            padding: "0 5px",
            height: "40px",
            lineHeight: "42px"
        },
        graph: {
            height: "40px"
        },
        column: {
            width: 5,
            background: "#999",
            heatOn: "backgroundColor",
            opacity: .5
        }
    })
}(window, FPSMeter));
var Fps = pc.createScript("fps");
Fps.prototype.initialize = function () {
    this.fps = new FPSMeter({
        heat: !0,
        graph: !0
    })
}, Fps.prototype.update = function (t) {
    this.fps.tick()
};
var Hotspot = pc.createScript("hotspot");
Hotspot.attributes.add("fadeDropOff", {
    type: "number",
    default: .4,
    title: "Fade Drop Off",
    description: "When to start fading out hotspot relative to the camera direction. 1 for when hotspot is directly inline with the camera. 0 for never."
}), Hotspot.attributes.add("enterRender", {
    type: "boolean",
    default: !1,
    title: "是否在车内模式才渲染"
}), Hotspot.attributes.add("isShow", {
    type: "boolean",
    default: !1,
    title: "是否总是显示"
}), Hotspot.attributes.add("isAnim", {
    type: "boolean",
    default: !0,
    title: "是否动画（上下跳动）"
}), Hotspot.prototype.initialize = function () {
    this.doing = !1, this.cameraEntity = this.app.root.findByName("Camera"), this.defaultForwardDirection = this.entity.forward.clone(), this.directionToCamera = new pc.Vec3, this.sprite = this.entity.children[0], this.sprite.element.on("click", this.onClick, this), this.dot = -1, this.isAnim && this.sprite.tween(this.sprite.getLocalPosition()).to({
        y: .01
    }, .4, pc.Linear).yoyo(!0).loop(!0).start()
}, Hotspot.prototype.update = function (t) {
    if (this.app.isEnter === (this.enterRender ? 1 : 0)) {
        var e = this.cameraEntity.getPosition();
        if (this.entity.lookAt(e), this.isShow) this.sprite.enabled || (this.sprite.enabled = !0);
        else if (this.directionToCamera.sub2(e, this.entity.getPosition()), this.directionToCamera.normalize(), this.dot = this.directionToCamera.dot(this.defaultForwardDirection), this.dot < 0) this.sprite.enabled && !this.doing && (this.sprite.enabled = !1);
        else {
            this.sprite.enabled || this.doing || (this.sprite.enabled = !0);
            var i = pc.math.clamp(this.dot / this.fadeDropOff, 0, 1);
            this.sprite.element.opacity = i
        }
    } else this.sprite.enabled && (this.sprite.enabled = !1)
}, Hotspot.prototype.onClick = function (t) {
    this.sprite.enabled && this.app.isEnter === (this.enterRender ? 1 : 0) && (window.top.postMessage({
        hotspotName: this.entity.name,
        type: "three"
    }, "*"), this.entity.fire("fun:do"), this.entity.setLocalScale(new pc.Vec3(.7, .7, .7)), this.entity.tween(this.entity.getLocalScale()).to(pc.Vec3.ONE, .5, pc.CubicOut).start()), t.event.preventDefault()
}, Hotspot.prototype.OnComplete = function () {
    this.doing = !1
};
pc.extend(pc, function () {
        var t = function (t) {
            this._app = t, this._tweens = [], this._add = []
        };
        t.prototype = {
            add: function (t) {
                return this._add.push(t), t
            },
            update: function (t) {
                for (var i = 0, e = this._tweens.length; i < e;) this._tweens[i].update(t) ? i++ : (this._tweens.splice(i, 1), e--);
                this._add.length && (this._tweens = this._tweens.concat(this._add), this._add.length = 0)
            }
        };
        var i = function (t, i, e) {
            pc.events.attach(this), this.manager = i, e && (this.entity = null), this.time = 0, this.complete = !1, this.playing = !1, this.stopped = !0, this.pending = !1, this.target = t, this.duration = 0, this._currentDelay = 0, this.timeScale = 1, this._reverse = !1, this._delay = 0, this._yoyo = !1, this._count = 0, this._numRepeats = 0, this._repeatDelay = 0, this._from = !1, this._slerp = !1, this._fromQuat = new pc.Quat, this._toQuat = new pc.Quat, this._quat = new pc.Quat, this.easing = pc.EASE_LINEAR, this._sv = {}, this._ev = {}
        };
        i.prototype = {
            to: function (t, i, e, s, n, r) {
                return t instanceof pc.Vec3 ? this._properties = {
                    x: t.x,
                    y: t.y,
                    z: t.z
                } : t instanceof pc.Color ? (this._properties = {
                    r: t.r,
                    g: t.g,
                    b: t.b
                }, void 0 !== t.a && (this._properties.a = t.a)) : this._properties = t, this.duration = i, e && (this.easing = e), s && this.delay(s), n && this.repeat(n), r && this.yoyo(r), this
            },
            from: function (t, i, e, s, n, r) {
                return t instanceof pc.Vec3 ? this._properties = {
                    x: t.x,
                    y: t.y,
                    z: t.z
                } : t instanceof pc.Color ? (this._properties = {
                    r: t.r,
                    g: t.g,
                    b: t.b
                }, void 0 !== t.a && (this._properties.a = t.a)) : this._properties = t, this.duration = i, e && (this.easing = e), s && this.delay(s), n && this.repeat(n), r && this.yoyo(r), this._from = !0, this
            },
            rotate: function (t, i, e, s, n, r) {
                return t instanceof pc.Quat ? this._properties = {
                    x: t.x,
                    y: t.y,
                    z: t.z,
                    w: t.w
                } : t instanceof pc.Vec3 ? this._properties = {
                    x: t.x,
                    y: t.y,
                    z: t.z
                } : t instanceof pc.Color ? (this._properties = {
                    r: t.r,
                    g: t.g,
                    b: t.b
                }, void 0 !== t.a && (this._properties.a = t.a)) : this._properties = t, this.duration = i, e && (this.easing = e), s && this.delay(s), n && this.repeat(n), r && this.yoyo(r), this._slerp = !0, this
            },
            start: function () {
                if (this.playing = !0, this.complete = !1, this.stopped = !1, this._count = 0, this.pending = this._delay > 0, this._reverse && !this.pending ? this.time = this.duration : this.time = 0, this._from) {
                    for (var t in this._properties) this._sv[t] = this._properties[t], this._ev[t] = this.target[t];
                    if (this._slerp) {
                        this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);
                        var i = void 0 !== this._properties.x ? this._properties.x : this.target.x,
                            e = void 0 !== this._properties.y ? this._properties.y : this.target.y,
                            s = void 0 !== this._properties.z ? this._properties.z : this.target.z;
                        this._fromQuat.setFromEulerAngles(i, e, s)
                    }
                } else {
                    for (var t in this._properties) this._sv[t] = this.target[t], this._ev[t] = this._properties[t];
                    if (this._slerp) {
                        this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);
                        i = void 0 !== this._properties.x ? this._properties.x : this.target.x, e = void 0 !== this._properties.y ? this._properties.y : this.target.y, s = void 0 !== this._properties.z ? this._properties.z : this.target.z;
                        this._toQuat.setFromEulerAngles(i, e, s)
                    }
                }
                return this._currentDelay = this._delay, this.manager.add(this), this
            },
            pause: function () {
                this.playing = !1
            },
            resume: function () {
                this.playing = !0
            },
            stop: function () {
                this.playing = !1, this.stopped = !0
            },
            delay: function (t) {
                return this._delay = t, this.pending = !0, this
            },
            repeat: function (t, i) {
                return this._count = 0, this._numRepeats = t, this._repeatDelay = i || 0, this
            },
            loop: function (t) {
                return t ? (this._count = 0, this._numRepeats = 1 / 0) : this._numRepeats = 0, this
            },
            yoyo: function (t) {
                return this._yoyo = t, this
            },
            reverse: function () {
                return this._reverse = !this._reverse, this
            },
            chain: function () {
                for (var t = arguments.length; t--;) t > 0 ? arguments[t - 1]._chained = arguments[t] : this._chained = arguments[t];
                return this
            },
            update: function (t) {
                if (this.stopped) return !1;
                if (!this.playing) return !0;
                if (!this._reverse || this.pending ? this.time += t * this.timeScale : this.time -= t * this.timeScale, this.pending) {
                    if (!(this.time > this._currentDelay)) return !0;
                    this._reverse ? this.time = this.duration - (this.time - this._currentDelay) : this.time = this.time - this._currentDelay, this.pending = !1
                }
                var i = 0;
                (!this._reverse && this.time > this.duration || this._reverse && this.time < 0) && (this._count++, this.complete = !0, this.playing = !1, this._reverse ? (i = this.duration - this.time, this.time = 0) : (i = this.time - this.duration, this.time = this.duration));
                var e, s, n = this.time / this.duration,
                    r = this.easing(n);
                for (var h in this._properties) e = this._sv[h], s = this._ev[h], this.target[h] = e + (s - e) * r;
                if (this._slerp && this._quat.slerp(this._fromQuat, this._toQuat, r), this.entity && (this.entity._dirtify(!0), this.element && this.entity.element && (this.entity.element[this.element] = this.target), this._slerp && this.entity.setLocalRotation(this._quat)), this.fire("update", t), this.complete) {
                    var a = this._repeat(i);
                    return a ? this.fire("loop") : (this.fire("complete", i), this._chained && this._chained.start()), a
                }
                return !0
            },
            _repeat: function (t) {
                if (this._count < this._numRepeats) {
                    if (this._reverse ? this.time = this.duration - t : this.time = t, this.complete = !1, this.playing = !0, this._currentDelay = this._repeatDelay, this.pending = !0, this._yoyo) {
                        for (var i in this._properties) tmp = this._sv[i], this._sv[i] = this._ev[i], this._ev[i] = tmp;
                        this._slerp && (this._quat.copy(this._fromQuat), this._fromQuat.copy(this._toQuat), this._toQuat.copy(this._quat))
                    }
                    return !0
                }
                return !1
            }
        };
        var e = function (t) {
                return 1 - s(1 - t)
            },
            s = function (t) {
                return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
            };
        return {
            TweenManager: t,
            Tween: i,
            Linear: function (t) {
                return t
            },
            QuadraticIn: function (t) {
                return t * t
            },
            QuadraticOut: function (t) {
                return t * (2 - t)
            },
            QuadraticInOut: function (t) {
                return (t *= 2) < 1 ? .5 * t * t : -.5 * (--t * (t - 2) - 1)
            },
            CubicIn: function (t) {
                return t * t * t
            },
            CubicOut: function (t) {
                return --t * t * t + 1
            },
            CubicInOut: function (t) {
                return (t *= 2) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2)
            },
            QuarticIn: function (t) {
                return t * t * t * t
            },
            QuarticOut: function (t) {
                return 1 - --t * t * t * t
            },
            QuarticInOut: function (t) {
                return (t *= 2) < 1 ? .5 * t * t * t * t : -.5 * ((t -= 2) * t * t * t - 2)
            },
            QuinticIn: function (t) {
                return t * t * t * t * t
            },
            QuinticOut: function (t) {
                return --t * t * t * t * t + 1
            },
            QuinticInOut: function (t) {
                return (t *= 2) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2)
            },
            SineIn: function (t) {
                return 0 === t ? 0 : 1 === t ? 1 : 1 - Math.cos(t * Math.PI / 2)
            },
            SineOut: function (t) {
                return 0 === t ? 0 : 1 === t ? 1 : Math.sin(t * Math.PI / 2)
            },
            SineInOut: function (t) {
                return 0 === t ? 0 : 1 === t ? 1 : .5 * (1 - Math.cos(Math.PI * t))
            },
            ExponentialIn: function (t) {
                return 0 === t ? 0 : Math.pow(1024, t - 1)
            },
            ExponentialOut: function (t) {
                return 1 === t ? 1 : 1 - Math.pow(2, -10 * t)
            },
            ExponentialInOut: function (t) {
                return 0 === t ? 0 : 1 === t ? 1 : (t *= 2) < 1 ? .5 * Math.pow(1024, t - 1) : .5 * (2 - Math.pow(2, -10 * (t - 1)))
            },
            CircularIn: function (t) {
                return 1 - Math.sqrt(1 - t * t)
            },
            CircularOut: function (t) {
                return Math.sqrt(1 - --t * t)
            },
            CircularInOut: function (t) {
                return (t *= 2) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
            },
            BackIn: function (t) {
                return t * t * (2.70158 * t - 1.70158)
            },
            BackOut: function (t) {
                return --t * t * (2.70158 * t + 1.70158) + 1
            },
            BackInOut: function (t) {
                var i = 2.5949095;
                return (t *= 2) < 1 ? t * t * ((i + 1) * t - i) * .5 : .5 * ((t -= 2) * t * ((i + 1) * t + i) + 2)
            },
            BounceIn: e,
            BounceOut: s,
            BounceInOut: function (t) {
                return t < .5 ? .5 * e(2 * t) : .5 * s(2 * t - 1) + .5
            },
            ElasticIn: function (t) {
                var i, e = .1;
                return 0 === t ? 0 : 1 === t ? 1 : (!e || e < 1 ? (e = 1, i = .1) : i = .4 * Math.asin(1 / e) / (2 * Math.PI), -e * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - i) * (2 * Math.PI) / .4))
            },
            ElasticOut: function (t) {
                var i, e = .1;
                return 0 === t ? 0 : 1 === t ? 1 : (!e || e < 1 ? (e = 1, i = .1) : i = .4 * Math.asin(1 / e) / (2 * Math.PI), e * Math.pow(2, -10 * t) * Math.sin((t - i) * (2 * Math.PI) / .4) + 1)
            },
            ElasticInOut: function (t) {
                var i, e = .1;
                return 0 === t ? 0 : 1 === t ? 1 : (!e || e < 1 ? (e = 1, i = .1) : i = .4 * Math.asin(1 / e) / (2 * Math.PI), (t *= 2) < 1 ? e * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - i) * (2 * Math.PI) / .4) * -.5 : e * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - i) * (2 * Math.PI) / .4) * .5 + 1)
            }
        }
    }()),
    function () {
        var t = pc.Application.getApplication();
        t && (t._tweenManager = new pc.TweenManager(t), t.on("update", function (i) {
            t._tweenManager.update(i)
        }), pc.Application.prototype.tween = function (t) {
            return new pc.Tween(t, this._tweenManager)
        }, pc.Entity.prototype.tween = function (t, i) {
            var e = this._app.tween(t);
            return e.entity = this, i && i.element && (e.element = element), e
        })
    }();
var Shock = pc.createScript("shock");
Shock.attributes.add("target", {
    type: "entity",
    title: "震动的物体"
}), Shock.attributes.add("zf", {
    type: "number",
    title: "振幅",
    default: .2
}), Shock.attributes.add("floor", {
    type: "entity",
    title: "地面"
}), Shock.prototype.initialize = function () {
    this.target || (this.target = this.entity), this.oldPos = this.target.getLocalPosition().clone()
}, Shock.prototype.update = function (t) {
    if (this.floor) {
        var o = this.floor.script.floor.speed,
            i = this.zf;
        i = o >= 60 && !this.app.isEnter ? pc.math.lerp(.005, .016, (o - 60) / 120) : 0;
        var e = pc.math.random(-i, i) + this.oldPos.x,
            s = pc.math.random(-i, i) + this.oldPos.y;
        this.target.setLocalPosition(e, s, this.oldPos.z)
    }
};
var BtnStates = pc.createScript("btnStates");
BtnStates.attributes.add("activeAsset", {
    type: "asset",
    assetType: "texture"
}), BtnStates.attributes.add("nodes", {
    type: "string",
    array: !0,
    title: "模型名称数组",
    description: "模型索引和下面材质一一对应，注意此项必填，如果材质不足，默认为最后一个材质"
}), BtnStates.attributes.add("mats", {
    type: "asset",
    assetType: "material",
    array: !0,
    default: [],
    title: "替换材质列表",
    description: "材质列表索引和上面模型一一对应，如果没有材质，不替换材质而改变本身的材质，如果材质不足，默认为最后一个材质"
}), BtnStates.attributes.add("isColor", {
    type: "boolean",
    title: "是否更改颜色",
    default: !0,
    description: "材质和颜色必填至少一项"
}), BtnStates.attributes.add("color", {
    type: "rgb",
    title: "颜色值"
}), BtnStates.attributes.add("skyTag", {
    type: "string",
    title: "内饰全景图标签",
    default: ""
}), BtnStates.prototype.initialize = function () {
    this.originalTexture = this.entity.element.textureAsset, (!this.app.currSkyTag || this.app.currSkyTag.length <= 0) && this.skyTag.length > 0 && (this.app.currSkyTag = this.skyTag)
}, BtnStates.prototype.setActive = function () {
    if (this.entity.element.textureAsset = this.activeAsset, this.skyTag.length > 0 && (this.app.currSkyTag = this.skyTag), this.nodes && 0 !== this.nodes.length && (this.isColor || 0 !== this.mats.length))
        for (var t = 0; t < this.nodes.length; t++) {
            var e = null;
            this.mats.length > 0 && (e = t < this.mats.length ? this.mats[t] : this.mats[this.mats.length - 1]), this.app.fire("changecolor", this.nodes[t], e ? e.name : "", this.isColor ? this.color : null)
        }
}, BtnStates.prototype.setDefault = function () {
    this.entity.element.textureAsset = this.originalTexture
};
var UiState = pc.createScript("uiState");
UiState.attributes.add("isOut", {
    type: "boolean",
    title: "是否车外功能"
}), UiState.prototype.initialize = function () {
    this.currState = null;
    for (var t = 0; t < this.entity.children.length - 1; t++) {
        this.entity.children[t].element.on("click", this.onClick, this)
    }
}, UiState.prototype.onClick = function (t) {
    var e = t.element.entity.script.btnStates;
    this.setActive(e), this.isOut ? this.app.isEnter && pc.app._openDoor.toggle() : this.app.isEnter ? this.app._openDoor.carNeiQie() : pc.app.car.OnDefaultQZM()
}, UiState.prototype.setActive = function (t) {
    if (t) {
        if (t === this.currState) return;
        this.currState && this.currState.setDefault(), t.setActive(), this.currState = t
    }
};
var UiAutoScale = pc.createScript("uiAutoScale");
UiAutoScale.prototype.initialize = function () {
    window.addEventListener("resize", this.reflow.bind(this)), window.addEventListener("orientationchange", this.reflow.bind(this)), this.reflow()
}, UiAutoScale.prototype.reflow = function () {
    var i = this.app.graphicsDevice.width / this.app.graphicsDevice.height;
    i = pc.math.clamp(i, 1.2, 1.7);
    var t = pc.math.lerp(.85, .6, 2 * (i - 1.2));
    this.entity.setLocalScale(t, t, 1)
};
pc.extend(pc, function () {
    var e = function (e) {
        var o = {
                aPosition: pc.SEMANTIC_POSITION
            },
            r = ["attribute vec2 aPosition;", "", "void main(void)", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "}"].join("\n"),
            a = ["precision " + e.precision + " float;", "", "uniform sampler2D uColorBuffer;", "uniform vec2 uResolution;", "", "#define FXAA_REDUCE_MIN   (1.0/128.0)", "#define FXAA_REDUCE_MUL   (1.0/8.0)", "#define FXAA_SPAN_MAX     8.0", "", "void main()", "{", "    vec3 rgbNW = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * uResolution ).xyz;", "    vec3 rgbNE = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * uResolution ).xyz;", "    vec3 rgbSW = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * uResolution ).xyz;", "    vec3 rgbSE = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * uResolution ).xyz;", "    vec4 rgbaM  = texture2D( uColorBuffer,  gl_FragCoord.xy  * uResolution );", "    vec3 rgbM  = rgbaM.xyz;", "    float opacity  = rgbaM.w;", "", "    vec3 luma = vec3( 0.299, 0.587, 0.114 );", "", "    float lumaNW = dot( rgbNW, luma );", "    float lumaNE = dot( rgbNE, luma );", "    float lumaSW = dot( rgbSW, luma );", "    float lumaSE = dot( rgbSE, luma );", "    float lumaM  = dot( rgbM,  luma );", "    float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );", "    float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );", "", "    vec2 dir;", "    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));", "    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));", "", "    float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );", "", "    float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );", "    dir = min( vec2( FXAA_SPAN_MAX, FXAA_SPAN_MAX), max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * uResolution;", "", "    vec3 rgbA = 0.5 * (", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * ( 1.0 / 3.0 - 0.5 ) ).xyz +", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * ( 2.0 / 3.0 - 0.5 ) ).xyz );", "", "    vec3 rgbB = rgbA * 0.5 + 0.25 * (", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * -0.5 ).xyz +", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * 0.5 ).xyz );", "", "    float lumaB = dot( rgbB, luma );", "", "    if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) )", "    {", "        gl_FragColor = vec4( rgbA, opacity );", "    }", "    else", "    {", "        gl_FragColor = vec4( rgbB, opacity );", "    }", "}"].join("\n");
        this.fxaaShader = new pc.Shader(e, {
            attributes: o,
            vshader: r,
            fshader: a
        }), this.resolution = new Float32Array(2)
    };
    return (e = pc.inherits(e, pc.PostEffect)).prototype = pc.extend(e.prototype, {
        render: function (e, o, r) {
            var a = this.device,
                t = a.scope;
            this.resolution[0] = 1 / e.width, this.resolution[1] = 1 / e.height, t.resolve("uResolution").setValue(this.resolution), t.resolve("uColorBuffer").setValue(e.colorBuffer), pc.drawFullscreenQuad(a, o, this.vertexBuffer, this.fxaaShader, r)
        }
    }), {
        FxaaEffect: e
    }
}());
var Fxaa = pc.createScript("fxaa");
Fxaa.prototype.initialize = function () {
    this.effect = new pc.FxaaEffect(this.app.graphicsDevice);
    var e = this.entity.camera.postEffects;
    e.addEffect(this.effect), this.on("state", function (o) {
        o ? e.addEffect(this.effect) : e.removeEffect(this.effect)
    }), this.on("destroy", function () {
        e.removeEffect(this.effect)
    })
};
pc.extend(pc, function () {
    function createRenderTarget(e) {
        var t = new pc.Texture(e, {
            width: e.width,
            height: e.height,
            format: pc.PIXELFORMAT_R8_G8_B8,
            autoMipmap: !1
        });
        return t.minFilter = pc.FILTER_LINEAR, t.magFilter = pc.FILTER_LINEAR, t.addressU = pc.ADDRESS_CLAMP_TO_EDGE, t.addressV = pc.ADDRESS_CLAMP_TO_EDGE, new pc.RenderTarget(e, t, {
            depth: !0
        })
    }
    var e = function (e) {
        var t = ["attribute vec2 aPosition;", "", "varying vec2 vUv0;", "", "void main(void)", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "    vUv0 = (aPosition.xy + 1.0) * 0.5;", "}"].join("\n");
        this.blurShader = new pc.Shader(e, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: t,
            fshader: ["precision " + e.precision + " float;", "", "uniform float uAmount;", "uniform sampler2D uCurrColorBuffer;", "uniform sampler2D uPrevColorBuffer;", "", "varying vec2 vUv0;", "", "void main() {", "    vec4 color1 = texture2D(uCurrColorBuffer, vUv0);", "    vec4 color2 = texture2D(uPrevColorBuffer, vUv0);", "", "    gl_FragColor = mix(color1, color2, uAmount);", "}"].join("\n")
        }), this.copyShader = new pc.Shader(e, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: t,
            fshader: ["precision " + e.precision + " float;", "", "uniform sampler2D uColorBuffer;", "", "varying vec2 vUv0;", "", "void main() {", "    vec4 color = texture2D(uColorBuffer, vUv0);", "", "    gl_FragColor = color;", "}"].join("\n")
        }), this.tempTarget = createRenderTarget(e), this.amount = 1
    };
    return (e = pc.inherits(e, pc.PostEffect)).prototype = pc.extend(e.prototype, {
        render: function (e, t, r) {
            var o = this.device,
                i = o.scope;
            this.prevTarget ? (i.resolve("uAmount").setValue(this.amount), i.resolve("uCurrColorBuffer").setValue(e.colorBuffer), i.resolve("uPrevColorBuffer").setValue(this.prevTarget.colorBuffer), pc.drawFullscreenQuad(o, this.tempTarget, this.vertexBuffer, this.blurShader, r)) : (this.prevTarget = createRenderTarget(o), i.resolve("uColorBuffer").setValue(e.colorBuffer), pc.drawFullscreenQuad(o, this.tempTarget, this.vertexBuffer, this.copyShader, r)), i.resolve("uColorBuffer").setValue(this.tempTarget.colorBuffer), pc.drawFullscreenQuad(o, this.prevTarget, this.vertexBuffer, this.copyShader, r), i.resolve("uColorBuffer").setValue(this.tempTarget.colorBuffer), pc.drawFullscreenQuad(o, t, this.vertexBuffer, this.copyShader, r)
        }
    }), {
        MotionBlur: e
    }
}());
var MotionBlur = pc.createScript("motionBlur");
MotionBlur.attributes.add("amount", {
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: .01
}), MotionBlur.prototype.initialize = function () {
    this.effect = new pc.MotionBlur(this.app.graphicsDevice), this.effect.amount = this.amount, this.on("set", this.onAttributeChanged, this), this.on("attr", function (e, t, r) {
        this.effect[e] = t
    }), this.on("enable", function () {
        this.entity.camera.postEffects.addEffect(this.effect)
    }), this.on("disable", function () {
        this.entity.camera.postEffects.removeEffect(this.effect)
    }), this.entity.camera.renderTarget = this.effect.prevTarget, this.entity.camera.postEffects.addEffect(this.effect)
};
var Rotation = pc.createScript("rotation");
Rotation.attributes.add("sensivity", {
    type: "number",
    default: .5
}), Rotation.attributes.add("easing", {
    type: "number",
    default: .2
}), Rotation.attributes.add("maxPitchUp", {
    type: "number",
    default: 25
}), Rotation.attributes.add("maxPitchDown", {
    type: "number",
    default: 25
}), Rotation.attributes.add("autoRotation", {
    type: "boolean",
    default: !1,
    title: "是否自动旋转"
}), Rotation.attributes.add("cam", {
    type: "entity",
    title: "摄像机"
}), Rotation.prototype.initialize = function () {
    this.weight = 1, this.oldQuat = new pc.Quat, this.pitchS = -15, this.yawS = 10, pc.platform.touch ? (window.addEventListener("touchstart", this.onTouchStart.bind(this)), window.addEventListener("touchmove", this.onTouchMove.bind(this)), window.addEventListener("touchend", this.onTouchEnd.bind(this))) : (this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this)), window.addEventListener("orientationchange", this.reflow.bind(this)), this.rotating = !1, this.pitch = .11, this.yaw = this.yawTarget = this.entity.getLocalEulerAngles().y, this.pitchTarget = 0, this.m = {
        x: 0,
        y: 0
    }, this.ml = {
        x: 0,
        y: 0
    }, this.entity.setEulerAngles(this.pitch, this.yaw, 0), this.rotateEnd = 0, this.lastPinchDistance = 0, this.augmentEntity = this.app.root.findByTag("hotsPoint"), this.app._carPivotRotation = this
}, Rotation.prototype.reflow = function () {
    this.enabled && (this.app.graphicsDevice.width / this.app.graphicsDevice.height > 1 && this.app._autoDistance.setMinFov())
}, Rotation.prototype.onMouseDown = function (t) {
    if (this.enabled && "CANVAS" === t.event.target.tagName) {
        this.rotating = !0, this.m.x = t.x, this.m.y = t.y, this.ml.x = this.m.x, this.ml.y = this.m.y;
        for (var i = 0; i < this.augmentEntity.length; i++) this.augmentEntity[i].script.augment.buttonEventDown(new pc.Vec2(this.m.x, this.m.y))
    }
}, Rotation.prototype.onMouseMove = function (t) {
    this.m.x = t.x, this.m.y = t.y
}, Rotation.prototype.onMouseUp = function (t) {
    this.rotating = !1, this.rotateEnd = Date.now();
    for (var i = 0; i < this.augmentEntity.length; i++) this.augmentEntity[i].script.augment.buttonEventUp(new pc.Vec2(this.m.x, this.m.y))
}, Rotation.prototype.onMouseWheel = function (t) {
    this.enabled && (this.cam.script.autoDistance.onMouseWheel(t.wheel), t.event.preventDefault())
}, Rotation.prototype.onTouchStart = function (t) {
    if (this.enabled && "CANVAS" === t.target.tagName) {
        var i = t.touches[0];
        this.rotating = !0, this.m.x = i.clientX, this.m.y = i.clientY, this.ml.x = this.m.x, this.ml.y = this.m.y;
        var e = t.touches;
        2 == e.length && (this.lastPinchDistance = this.getPinchDistance(e[0], e[1]));
        for (var n = 0; n < this.augmentEntity.length; n++) this.augmentEntity[n].script.augment.buttonEventDown(new pc.Vec2(this.m.x, this.m.y))
    }
}, Rotation.prototype.onTouchMove = function (t) {
    var i = t.touches;
    if (1 == i.length) {
        var e = i[0];
        this.m.x = e.clientX, this.m.y = e.clientY
    } else if (2 == i.length) {
        var n = this.getPinchDistance(i[0], i[1]),
            s = n - this.lastPinchDistance;
        this.lastPinchDistance = n, this.cam.script.autoDistance.camFovScale(s)
    }
}, Rotation.prototype.onTouchEnd = function (t) {
    this.rotating = !1, this.rotateEnd = Date.now();
    for (var i = 0; i < this.augmentEntity.length; i++) this.augmentEntity[i].script.augment.buttonEventUp(new pc.Vec2(this.m.x, this.m.y))
}, Rotation.prototype.getPinchDistance = function (t, i) {
    var e = t.clientX - i.clientX,
        n = t.clientY - i.clientY;
    return Math.sqrt(e * e + n * n)
}, Rotation.prototype.update = function (t) {
    if (this.enabled) {
        if (this.rotating) {
            var i = this.ml.x - this.m.x,
                e = this.ml.y - this.m.y;
            this.pitchTarget = Math.max(-this.maxPitchUp, Math.min(this.maxPitchDown, this.pitchTarget + e * this.sensivity)), this.yawTarget += i * this.sensivity, this.ml.x = this.m.x, this.ml.y = this.m.y
        } else Date.now() - this.rotateEnd > 1e3 && this.autoRotation && (this.yawTarget += 5 * t * Math.min(1, (Date.now() - this.rotateEnd - 1e3) / 2e3));
        Math.abs(this.pitch - this.pitchTarget) + Math.abs(this.yaw - this.yawTarget) > .1 && (this.pitch += (this.pitchTarget - this.pitch) * this.easing, this.yaw += (this.yawTarget - this.yaw) * this.easing, this.oldQuat.copy(this.entity.getRotation()), this.entity.setEulerAngles(this.pitch + this.pitchS, this.yaw + this.yawS, 0), this.oldQuat.slerp(this.oldQuat, this.entity.getRotation(), this.weight), this.entity.setRotation(this.oldQuat))
    }
};
var Augmented = pc.createScript("augmented");
Augmented.attributes.add("docID", {
    type: "string",
    default: "9223282"
}), Augmented.attributes.add("yunRID", {
    type: "string",
    default: "9223283"
}), Augmented.attributes.add("yunWID", {
    type: "string",
    default: "9223280"
}), Augmented.attributes.add("buttonID", {
    type: "string",
    default: "9223279"
}), Augmented.attributes.add("closeID", {
    type: "string",
    default: "9223281"
}), Augmented.attributes.add("miniCloseID", {
    type: "string",
    default: "9223286"
}), Augmented.attributes.add("duBugText", {
    type: "string",
    default: ""
}), Augmented.prototype.initialize = function () {
    var s = this.app;
    this.canvas = document.createElement("canvas"), this.canvas.id = "3dui-canvas", this.canvas.width = getClentRect().w, this.canvas.height = getClentRect().h, this.canvas.style.position = "fixed", this.canvas.style.display = "block", this.canvas.style.left = "0px", this.canvas.style.top = "0px", this.canvas.style.right = "0px", this.canvas.style.bottom = "0px", this.canvas.style.margin = "0", this.canvas.style.visibility = "hidden", document.body.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.camera = this.app.root.findByName("Camera"), this.app.topCanvas = this.canvas, this.one = new pc.Vec2, this.two = new pc.Vec2;
    var t = s.assets.get(this.docID);
    this.doc = new Image, this.doc.src = t.getFileUrl();
    var e = s.assets.get(this.yunRID);
    this.yunR = new Image, this.yunR.src = e.getFileUrl();
    var i = s.assets.get(this.yunWID);
    this.yunW = new Image, this.yunW.src = i.getFileUrl();
    var a = s.assets.get(this.buttonID);
    this.button = new Image, this.button.src = a.getFileUrl();
    var h = s.assets.get(this.closeID);
    this.close = new Image, this.close.src = h.getFileUrl();
    var c = s.assets.get(this.miniCloseID);
    this.miniClose = new Image, this.miniClose.src = c.getFileUrl(), this.app.hotCanvas = this.canvas, this.scale = 1
}, Augmented.prototype.update = function (s) {
    this.app;
    getClentRect().w === this.canvas.width && getClentRect().h === this.canvas.height || (this.canvas.width = getClentRect().w, this.canvas.height = getClentRect().h), this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.canvas.width <= 600 ? this.scale = this.canvas.width / 600 : this.scale = this.canvas.width / 1280, this.scale = Math.max(.6, Math.min(this.scale, 1))
}, Augmented.prototype.drawLine = function (s, t, e, i, a, h, c) {
    var l = this.ctx;
    l.save(), l.globalAlpha = c, l.translate(s, t), l.beginPath(), l.moveTo(e, i), l.lineTo(a, h), l.lineWidth = 1, l.strokeStyle = "#fff", l.stroke(), l.restore()
}, Augmented.prototype.drawImage = function (s, t, e, i, a, h, c, l, n) {
    var d = this.ctx;
    d.save(), d.globalAlpha = n, d.translate(s, t), d.scale(e, i), d.rotate(3.1415926 / 180 * a), d.beginPath(), d.drawImage(h, -.5 * c, -.5 * l, c, l), d.stroke(), d.restore()
}, Augmented.prototype.drawTextImageUp = function (s, t, e, i, a, h, c, l) {
    var n = this.ctx;
    n.save(), n.globalAlpha = l, n.translate(s, t + e * (c - a)), n.scale(e, e), n.beginPath(), n.drawImage(i, 0, c - a, h, a, 0, 0, h, a), n.stroke(), n.restore()
}, Augmented.prototype.drawSound = function (s, t, e, i, a, h, c, l, n, d, r, o, g, w, m) {
    if (!(l <= 0)) {
        var u = .4,
            I = i + 48 - h - 12;
        if (l <= 25) {
            this.one.set(0, 0), 1 == r ? this.two.set(this.scale * i * u, this.scale * -e) : this.two.set(-this.scale * i * u, this.scale * -e);
            var y = this.one.lerp(this.one, this.two, l / 25);
            this.drawLine(s, t, 0, 0, y.x, y.y, d)
        } else if (l <= 50) {
            1 == r ? (this.one.set(this.scale * i * u, this.scale * -e), this.two.set(this.scale * i, this.scale * -e)) : (this.one.set(-this.scale * i * u, this.scale * -e), this.two.set(-this.scale * i, this.scale * -e));
            var p = this.one.lerp(this.one, this.two, (l - 25) / 25);
            1 == r ? (this.drawLine(s, t, 0, 0, this.scale * i * u, this.scale * -e, d), this.drawLine(s, t, this.scale * i * u, this.scale * -e, p.x, p.y, d)) : (this.drawLine(s, t, 0, 0, -this.scale * i * u, this.scale * -e, d), this.drawLine(s, t, -this.scale * i * u, this.scale * -e, p.x, p.y, d))
        } else if (l <= 100) {
            var v = .9 * (l - 50) / 50;
            1 == r ? (this.drawLine(s, t, 0, 0, this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, this.scale * (i * u), this.scale * -e, this.scale * i, -this.scale * e, d), this.drawImage(s + this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, .2 + v, .2 + v, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, .2 + v, .2 + v, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, .2 + v, .2 + v, n, this.yunR, 250 * this.scale, 250 * this.scale, d)) : (this.drawLine(s, t, 0, 0, -this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, -this.scale * (i * u), this.scale * -e, -this.scale * i, this.scale * -e, d), this.drawImage(s - this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, .2 + v, .2 + v, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, .2 + v, .2 + v, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, .2 + v, .2 + v, n, this.yunR, 250 * this.scale, 250 * this.scale, d))
        } else if (l <= 125) {
            1 == r ? (this.one.set(this.scale * (i + 48), this.scale * (-e - 15)), this.two.set(this.scale * I, this.scale * (-e - 15))) : (this.one.set(-this.scale * (i + 48), this.scale * (-e - 15)), this.two.set(-this.scale * I, this.scale * (-e - 15)));
            var b = this.one.lerp(this.one, this.two, (l - 100) / 25),
                L = (m - .2) * (l - 100) / 20;
            1 == r ? (this.drawLine(s, t, 0, 0, this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, this.scale * (i * u), this.scale * -e, this.scale * i, -this.scale * e, d), this.drawImage(s + this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, -n, this.yunR, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 40), t - this.scale * (e + 80), .2 + L, .2 + L, 0, this.close, 40 * this.scale, 40 * this.scale, d), this.drawLine(s, t, this.scale * (i + 48), this.scale * (-e - 15), b.x, b.y, d)) : (this.drawLine(s, t, 0, 0, -this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, -this.scale * (i * u), this.scale * -e, -this.scale * i, this.scale * -e, d), this.drawImage(s - this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, -n, this.yunR, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 40), t - this.scale * (e + 80), .2 + L, .2 + L, 0, this.close, 40 * this.scale, 40 * this.scale, d), this.drawLine(s, t, -this.scale * (i + 48), this.scale * (-e - 15), b.x, b.y, d))
        } else if (l <= 150) {
            var x = this.scale * c * (l - 125) / 25;
            1 == r ? (this.drawLine(s, t, 0, 0, this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, this.scale * (i * u), this.scale * -e, this.scale * i, this.scale * -e, d), this.drawImage(s + this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, -n, this.yunR, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 40), t - this.scale * (e + 80), 1, 1, 0, this.close, 40 * this.scale, 40 * this.scale, d), this.drawLine(s, t, this.scale * (i + 48), this.scale * (-e - 15), this.scale * I, this.scale * (-e - 15), d), this.drawImage(s + this.scale * (I - 6), t - this.scale * (e + 15), 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawTextImageUp(s + this.scale * (I + 6), t - this.scale * (e + c + 20), this.scale, a, x, h, c, d)) : (this.drawLine(s, t, 0, 0, -this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, -this.scale * (i * u), this.scale * -e, -this.scale * i, this.scale * -e, d), this.drawImage(s - this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, -n, this.yunR, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 40), t - this.scale * (e + 80), 1, 1, 0, this.close, 40 * this.scale, 40 * this.scale, d), this.drawLine(s, t, -this.scale * (i + 48), this.scale * (-e - 15), -this.scale * I, this.scale * (-e - 15), d), this.drawImage(s - this.scale * (I - 6), t - this.scale * (e + 15), 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawTextImageUp(s - this.scale * (I + h + 6), t - this.scale * (e + c + 20), this.scale, a, x, h, c, d))
        } else 1 == r ? (this.drawLine(s, t, 0, 0, this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, this.scale * (i * u), this.scale * -e, this.scale * i, this.scale * -e, d), this.drawImage(s + this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, w, w, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 146), t - this.scale * e, 1, 1, -n, this.yunR, 250 * this.scale, 250 * this.scale, d), this.drawImage(s + this.scale * (i + 40), t - this.scale * (e + 80), m, m, 0, this.close, 40 * this.scale, 40 * this.scale, d), this.drawLine(s, t, this.scale * (i + 48), this.scale * (-e - 15), this.scale * I, this.scale * (-e - 15), d), this.drawImage(s + this.scale * (I - 6), t - this.scale * (e + 15), 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawTextImageUp(s + this.scale * (I + 6), t - this.scale * (e + c + 20), this.scale, a, c, h, c, d), o.x = s + this.scale * (i + 146), o.y = t - this.scale * e, g.x = s + this.scale * (i + 40), g.y = t - this.scale * (e + 80)) : (this.drawLine(s, t, 0, 0, -this.scale * (i * u), this.scale * -e, d), this.drawLine(s, t, -this.scale * (i * u), this.scale * -e, -this.scale * i, this.scale * -e, d), this.drawImage(s - this.scale * (i + 6), t - this.scale * e, 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, w, w, 0, this.button, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, n, this.yunW, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 146), t - this.scale * e, 1, 1, -n, this.yunR, 250 * this.scale, 250 * this.scale, d), this.drawImage(s - this.scale * (i + 40), t - this.scale * (e + 80), m, m, 0, this.close, 40 * this.scale, 40 * this.scale, d), this.drawLine(s, t, -this.scale * (i + 48), this.scale * (-e - 15), -this.scale * I, this.scale * (-e - 15), d), this.drawImage(s - this.scale * (I - 6), t - this.scale * (e + 15), 1, 1, 0, this.doc, 13 * this.scale, 13 * this.scale, d), this.drawTextImageUp(s - this.scale * (I + h + 6), t - this.scale * (e + c + 20), this.scale, a, c, h, c, d), o.x = s - this.scale * (i + 146), o.y = t - this.scale * e, g.x = s - this.scale * (i + 40), g.y = t - this.scale * (e + 80))
    }
}, Augmented.prototype.drawBill = function (s, t, e, i, a, h, c, l, n, d, r, o, g, w, m, u) {};
var Augment = pc.createScript("augment");
Augment.attributes.add("Speed", {
    type: "number",
    default: 4
}), Augment.attributes.add("TextID", {
    type: "string",
    default: "9223284"
}), Augment.attributes.add("TextID_height", {
    type: "number",
    default: 80
}), Augment.attributes.add("TextID_length", {
    type: "number",
    default: 250
}), Augment.attributes.add("Sound_height", {
    type: "number",
    default: 50
}), Augment.attributes.add("Sound_length", {
    type: "number",
    default: 180
}), Augment.attributes.add("videoUrl", {
    type: "string",
    default: ""
}), Augment.attributes.add("isSoundMode", {
    type: "boolean",
    default: !0
}), Augment.prototype.initialize = function () {
    var t = this.app;
    this.ar = t.root.getChildren()[0].script.augmented, this.camera = t.root.findByName("Camera");
    var e = t.assets.get(this.TextID);
    this.text = new Image, this.text.src = e.getFileUrl(), this.angleM = 0, this.opacity = 0, this.progress = 0, this.rotation = t.root.findByName("pivot").script.rotation, this.state = "closed", this.soundPlay = new pc.Vec2, this.soundClose = new pc.Vec2, this.billClose = new pc.Vec2, this.playScale = 1, this.closeScale = 1, this.entity.on("fun:do", function () {
        this.open()
    }, this)
}, Augment.prototype.open = function () {
    this.ar.duBugText = this.state, this.app.currAug && this.app.currAug != this && this.app.currAug.close(), "opening" != this.state && "opend" != this.state && (this.app.hotCanvas.style.visibility = "visible", this.app.fire("hot:canvas_show", !0), this.state = "opening", this.app.currAug = this)
}, Augment.prototype.close = function () {
    "closeing" != this.state && "closed" != this.state && (this.state = "closeing")
}, Augment.prototype.distance = function (t, e) {
    var s = t.x - e.x,
        i = t.y - e.y;
    return Math.pow(s * s + i * i, .5)
}, Augment.prototype.buttonEventDown = function (t) {
    if ("opend" == this.state) {
        if (this.isSoundMode) {
            if (this.distance(t, this.soundPlay) <= 100 * this.ar.scale) return this.playScale = 1.1, !0;
            this.distance(t, this.soundClose) <= 30 * this.ar.scale && (this.closeScale = 1.1)
        }
        return !1
    }
}, Augment.prototype.buttonEventUp = function (t) {
    "opend" == this.state && (this.playScale = 1, this.closeScale = 1, this.isSoundMode && (this.distance(t, this.soundPlay) <= 100 * this.ar.scale ? this.app.fire("onHotPlay", this.videoUrl) : this.distance(t, this.soundClose) <= 30 * this.ar.scale && this.close()))
}, Augment.prototype.update = function (t) {
    this.entity.script.hotspot && this.entity.script.hotspot.dot >= 0 || this.close(), "opening" == this.state && (this.progress += this.Speed, (this.isSoundMode && this.progress >= 150 || !this.isSoundMode && this.progress >= 190) && (this.state = "opend")), "closeing" == this.state && (this.progress -= this.Speed, this.progress <= 0 && (this.progress = 0, this.state = "closed", this.app.fire("hot:canvas_show", !1), this.app.currAug == this && (this.app.hotCanvas.style.visibility = "hidden", this.app.currAug = null))), this.angleM >= 360 ? this.angleM = 0 : this.angleM++;
    var e = this.camera.camera.worldToScreen(this.entity.getPosition()),
        s = 1;
    e.x >= getClentRect().w / 2 && (s = 2), this.isSoundMode && this.ar.drawSound(e.x, e.y, this.Sound_height, this.Sound_length, this.text, this.TextID_length, this.TextID_height, this.progress, this.angleM, 1, s, this.soundPlay, this.soundClose, this.playScale, this.closeScale)
};
var MouseLook = pc.createScript("mouseLook");
pc.PROJECTION_VR = 0, MouseLook.attributes.add("weight", {
    type: "number",
    default: 1
}), MouseLook.attributes.add("sensivity", {
    type: "number",
    default: .25
}), MouseLook.attributes.add("easing", {
    type: "number",
    default: .2
}), MouseLook.attributes.add("maxPitchUp", {
    type: "number",
    default: 25
}), MouseLook.attributes.add("maxPitchDown", {
    type: "number",
    default: 25
}), MouseLook.attributes.add("minFov", {
    type: "number",
    default: 1,
    title: "最小视觉",
    min: 0,
    max: 90
}), MouseLook.attributes.add("maxFov", {
    type: "number",
    default: 1,
    title: "最大视觉",
    max: 90,
    min: 0
}), MouseLook.prototype.postInitialize = function () {
    var t, i = this;
    this.oldQuat = new pc.Quat, this.app._mouseLook = this, this.magicWindowOffsetEntity = this.entity, this.inVr = !1, t = this.entity.camera ? this.entity.camera.clearColor : new pc.Color(.1, .1, .1), this.left = new pc.Entity, this.entity.addChild(this.left), this.left.addComponent("camera", {
        clearColor: t,
        rect: new pc.Vec4(0, 0, .5, 1)
    }), this.left.camera.projection = pc.PROJECTION_VR, this.left.enabled = !1, this.right = new pc.Entity, this.entity.addChild(this.right), this.right.addComponent("camera", {
        clearColor: t,
        rect: new pc.Vec4(.5, 0, .5, 1)
    }), this.right.camera.projection = pc.PROJECTION_VR, this.right.enabled = !1, this.right.camera.fov = 90, this.left.camera.fov = 90, pc.platform.touch ? (window.addEventListener("touchstart", this.onTouchStart.bind(this)), window.addEventListener("touchmove", this.onTouchMove.bind(this)), window.addEventListener("touchend", this.onTouchEnd.bind(this))) : (this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this)), this.alpha = 0, this.gamma = 0, this.beta = 0, this.vr = window.DeviceOrientationEvent && pc.platform.mobile, this.vr && window.addEventListener("deviceorientation", function (t) {
        i.alpha = t.alpha, i.beta = t.beta, i.gamma = t.gamma
    }, !0), this.so = window.orientation || 0, window.addEventListener("orientationchange", function () {
        i.so = window.orientation || 0
    }, !1), this.augmentEntity = this.app.root.findByTag("hotsPoint"), this.mult = (this.maxFov - this.minFov) / 8, this.distance = pc.math.lerp(this.minFov, this.maxFov, 1), this.targetDistance = this.distance, this.lastPinchDistance = 0, this.rotating = !1, this.pitch = 0, this.yaw = 0, this.pitchTarget = 0, this.yawTarget = 0, this.m = {
        x: 0,
        y: 0
    }, this.ml = {
        x: 0,
        y: 0
    }, this.touchInd = -1, this.enabled = !1, this.alwaysAcceptInput = !1, this.ttt = !1, this.www = !1, this.init(), this.loadingEnd = !1, this.cameraAng = new pc.Vec3, this.app._openDoor.entity.on("state", function (t) {
        t == EnterCar.OPEN && (i.loadingEnd = !0, i.www = !0, i.magicWindowOffsetEntity = i.entity.parent, i.cameraAng = i.entity.getLocalEulerAngles(), i.entity.setLocalEulerAngles(0, 0, 0))
    }, this), this.app._openDoor.entity.on("stateStart", function (t) {
        t == EnterCar.CLOSED ? (i.magicWindowOffsetEntity = i.entity, i.entity.setLocalEulerAngles(i.cameraAng)) : (i.alwaysAcceptInput && pc.app.gyroBtn.updateData(), i.init())
    }, this)
}, MouseLook.prototype.checkVRR = function () {
    this.inVr
}, MouseLook.prototype.init = function () {
    this.magicWindowOffsetEntity = this.entity, this.pitch = -15, this.yaw = 0, this.pitchTarget = -15, this.yawTarget = 0, this.loadingEnd = !1, this.www = !1
}, MouseLook.prototype.onMouseWheel = function (t) {
    if (this.enabled) {
        var i = t.wheel * -this.mult;
        this.targetDistance += i, this.targetDistance < this.minFov ? this.targetDistance = this.minFov : this.targetDistance > this.maxFov && (this.targetDistance = this.maxFov), t.event.preventDefault()
    }
}, MouseLook.prototype.onMouseDown = function (t) {
    if (this.loadingEnd && "CANVAS" === t.event.target.tagName) {
        this.rotating = !0, this.m.x = t.x, this.m.y = t.y, this.ml.x = this.m.x, this.ml.y = this.m.y;
        for (var i = 0; i < this.augmentEntity.length; i++) this.augmentEntity[i].script.augment.buttonEventDown(new pc.Vec2(this.m.x, this.m.y))
    }
}, MouseLook.prototype.onMouseMove = function (t) {
    this.m.x = t.x, this.m.y = t.y
}, MouseLook.prototype.onMouseUp = function (t) {
    this.rotating = !1;
    for (var i = 0; i < this.augmentEntity.length; i++) this.augmentEntity[i].script.augment.buttonEventUp(new pc.Vec2(this.m.x, this.m.y))
}, MouseLook.prototype.onTouchStart = function (t) {
    if (this.enabled && this.loadingEnd && "CANVAS" == t.target.tagName && -1 === this.touchInd && t.touches.length) {
        var i = t.touches[0];
        this.rotating = !0, this.touchInd = i.identifier, this.m.x = i.clientX, this.m.y = i.clientY, this.ml.x = this.m.x, this.ml.y = this.m.y;
        var e = t.touches;
        2 == e.length && (this.lastPinchDistance = this.getPinchDistance(e[0], e[1]));
        for (var s = 0; s < this.augmentEntity.length; s++) this.augmentEntity[s].script.augment.buttonEventDown(new pc.Vec2(i.clientX, i.clientY))
    }
}, MouseLook.prototype.onTouchMove = function (t) {
    var i = t.touches;
    if (1 == i.length) {
        var e = i[0];
        this.m.x = e.clientX, this.m.y = e.clientY
    } else if (2 == i.length) {
        this.ttt || (this.ttt = !0, this.lastPinchDistance = this.getPinchDistance(i[0], i[1]));
        var s = this.getPinchDistance(i[0], i[1]),
            n = s - this.lastPinchDistance;
        this.lastPinchDistance = s, this.targetDistance -= .1 * n, this.targetDistance = pc.math.clamp(this.targetDistance, this.minFov, this.maxFov)
    }
}, MouseLook.prototype.onTouchEnd = function (t) {
    this.rotating = !1, this.touchInd = -1, this.ttt = !1;
    for (var i = 0; i < this.augmentEntity.length; i++) this.augmentEntity[i].script.augment.buttonEventUp(new pc.Vec2(this.m.x, this.m.y))
}, MouseLook.prototype.getPinchDistance = function (t, i) {
    var e = t.clientX - i.clientX,
        s = t.clientY - i.clientY;
    return Math.sqrt(e * e + s * s)
}, MouseLook.prototype.enterVr = function () {
    this.inVr || (this.entity.camera.enabled = !1, this.right.camera.projection = pc.PROJECTION_VR, this.right.enabled = !0, this.left.camera.projection = pc.PROJECTION_VR, this.left.enabled = !0, this.inVr = !0, this.app.fire("vr:enter"), this.app.root.findByName("2D Screen").enabled = !1, this.app.root.findByName("Fun").enabled = !1, this.app.root.findByName("QH").enabled = !1, this.app.ui.ShowExitVr(), this.checkVRR())
}, MouseLook.prototype.leaveVr = function () {
    this.inVr && (this.right.enabled = !1, this.left.enabled = !1, this.entity.camera && (this.entity.camera.enabled = !0), this.inVr = !1, this.app.fire("vr:leave"), this.app.root.findByName("2D Screen").enabled = !0, this.app.root.findByName("Fun").enabled = !0, this.app.root.findByName("QH").enabled = !0)
}, MouseLook.prototype.update = function (t) {
    if (this.enabled) {
        if (this.rotating) {
            var i = this.ml.x - this.m.x,
                e = this.ml.y - this.m.y;
            i *= -.7, e *= -.7, this.pitchTarget = this.pitchTarget + e * this.sensivity * this.weight, this.yawTarget += i * this.sensivity * this.weight, this.ml.x = this.m.x, this.ml.y = this.m.y
        }
        this.pitch += (this.pitchTarget - this.pitch) * this.easing, this.yaw += (this.yawTarget - this.yaw) * this.easing, this.oldQuat.copy(this.magicWindowOffsetEntity.getRotation()), this.magicWindowOffsetEntity.setEulerAngles(0, this.yaw + 180, 0);
        var s = this.magicWindowOffsetEntity.getRotation();
        if ((n = new pc.Quat).setFromAxisAngle(this.entity.right, this.pitch), n.mul(s), this.magicWindowOffsetEntity.setRotation(n), this.oldQuat.slerp(this.oldQuat, this.magicWindowOffsetEntity.getRotation(), this.weight), this.magicWindowOffsetEntity.setRotation(this.oldQuat), this.vr && this.loadingEnd && (this.inVr || this.alwaysAcceptInput)) {
            var n, o = pc.math.DEG_TO_RAD * this.beta,
                a = pc.math.DEG_TO_RAD * this.alpha,
                h = pc.math.DEG_TO_RAD * -this.gamma,
                c = Math.cos(o / 2),
                r = Math.cos(a / 2),
                p = Math.cos(h / 2),
                u = Math.sin(o / 2),
                m = Math.sin(a / 2),
                l = Math.sin(h / 2),
                d = new pc.Quat(u * r * p + c * m * l, c * m * p - u * r * l, c * r * l - u * m * p, c * r * p + u * m * l),
                g = new pc.Quat(-Math.sqrt(.5), 0, 0, Math.sqrt(.5));
            d.mul(g), (n = new pc.Quat).setFromAxisAngle(pc.Vec3.FORWARD, this.so), d.mul(n), this.jzEA = this.jzEA || pc.Vec3.ZERO, this.www && (this.www = !1, this.jzEA = d.getEulerAngles().clone()), this.entity.setLocalRotation(d)
        }
        this.distance = pc.math.lerp(this.distance, this.targetDistance, t / .2), this.entity.camera.fov = this.distance
    }
}, MouseLook.prototype.setGyro = function (t) {
    this.alwaysAcceptInput = t
}, MouseLook.prototype.setVR = function (t) {
    this.enterVr()
}, MouseLook.prototype.activate = function () {
    this.right.enabled = !0, this.left.enabled = !0
};
var LeftBtnState = pc.createScript("leftBtnState");
LeftBtnState.attributes.add("activeAsset", {
    type: "asset",
    assetType: "texture"
}), LeftBtnState.attributes.add("deng", {
    type: "boolean",
    title: "开关灯"
}), LeftBtnState.attributes.add("speed", {
    type: "boolean",
    title: "开车"
}), LeftBtnState.attributes.add("gyro", {
    type: "boolean",
    title: "陀螺仪"
}), LeftBtnState.attributes.add("vr", {
    type: "boolean",
    title: "VR"
}), LeftBtnState.attributes.add("try", {
    type: "boolean",
    title: "预约试驾"
}), LeftBtnState.attributes.add("wai", {
    type: "boolean",
    title: "是否外面显示",
    default: !0
}), LeftBtnState.prototype.initialize = function () {
    this.toggle = !1, this.originalTexture = this.entity.element.textureAsset, this.entity.element.on("click", this.onClick, this), this.gyro && (this.app.gyroBtn = this)
}, LeftBtnState.prototype.onClick = function (t) {
    "application-canvas" == t.event.target.id && this.updateData()
}, LeftBtnState.prototype.updateData = function () {
    if (this.toggle = !this.toggle, this.entity.element.textureAsset = this.toggle ? this.activeAsset : this.originalTexture, this.deng && this.app.fire("deng:toggle", this.toggle), this.speed && this.app.fire("speed:toggle", this.toggle), this.gyro && this.app._mouseLook.setGyro(this.toggle), this.vr && this.app._mouseLook.setVR(this.toggle), this.try) {
        var t = document.getElementById("MYTRY");
        t && (t.style.display = "inline")
    }
}, LeftBtnState.prototype.update = function (t) {
    pc.platform.mobile || !this.gyro && !this.vr ? 1 === this.app.isEnter ? this.wai ? this.entity.element.enabled && (this.entity.element.enabled = !1) : this.entity.element.enabled || (this.entity.element.enabled = !0) : 0 === this.app.isEnter && this.wai ? this.entity.element.enabled || (this.entity.element.enabled = !0) : this.entity.element.enabled && (this.entity.element.enabled = !1) : this.entity.element.enabled && (this.entity.element.enabled = !1)
};
var LoadShitiRes = pc.createScript("loadShitiRes");
LoadShitiRes.prototype.initialize = function () {
    this.app.isShitiLoader = !1, this.loading = !1, this.loadedFire = !0
}, LoadShitiRes.prototype.loadRes = function (i) {
    var t = this;
    if (this.loadedFire = i, !t.loading) {
        t.loading = !t.loading;
        for (var e = t.app.assets.findByTag("shiticj"), o = 0, s = e.length, a = function () {
                (o += 1) === s && t.onAssetsLoaded()
            }, d = 0; d < e.length; d++) e[d].resource ? a() : (e[d].once("load", a), t.app.assets.load(e[d]));
        e.length || t.onAssetsLoaded()
    }
}, LoadShitiRes.prototype.onAssetsLoaded = function () {
    this.app.isShitiLoader = !0, this.loadedFire && this.app.fire("shitires:loaded")
};
var Gz = pc.createScript("gz");
Gz.attributes.add("partNode", {
    type: "string",
    title: "父节点",
    description: "父节点名称，用,隔开"
}), Gz.attributes.add("modelName", {
    type: "string",
    title: "默认模型名",
    description: "默认模型名，用,隔开"
}), Gz.attributes.add("modelName2", {
    type: "string",
    title: "模型名2",
    description: "模型2名，用,隔开"
}), Gz.attributes.add("activeAsset", {
    type: "asset",
    assetType: "texture"
}), Gz.prototype.initialize = function () {
    this.originalTexture = this.entity.element.textureAsset, this.entity.element.on("click", this.onClick, this), this.truning = !1, this.index = !1
}, Gz.prototype.onClick = function (t) {
    if (!this.truning && 0 === this.app.isEnter) {
        this.index = !this.index, pc.app.fire("changegz", this.partNode, !1 === this.index ? this.modelName : this.modelName2);
        var e = this.entity.tween(this.entity.getLocalScale()).to({
            x: 0
        }, .3, pc.CubicOut);
        e.on("complete", function () {
            this.entity.element.textureAsset = !1 === this.index ? this.originalTexture : this.activeAsset;
            var t = this.entity.tween(this.entity.getLocalScale()).to({
                x: 1
            }, .3, pc.CubicOut);
            t.on("complete", function () {
                this.truning = !1
            }, this), t.start()
        }, this), e.start(), this.truning = !0
    }
}, Gz.prototype.setDefault = function () {
    this.entity.element.textureAsset = this.originalTexture
};
var Car2 = pc.createScript("car2");
Car2.attributes.add("carName", {
    type: "string",
    title: "标识"
}), Car2.attributes.add("radius", {
    type: "number",
    default: 25,
    title: "轮子半径"
}), Car2.attributes.add("baseMats", {
    type: "asset",
    assetType: "material",
    array: !0,
    default: [],
    title: "材质列表"
}), Car2.attributes.add("floor", {
    type: "entity",
    title: "地面"
}), Car2.attributes.add("shitiRes", {
    type: "entity",
    title: "实体脚本"
}), Car2.prototype.initialize = function () {
    var e = this;
    this.color_mats = [], this.isCarBasicLoaded = !1, this.funDo = this.app.root.findByName("FunDo"), this.funs = this.app.root.findByName("Fun"), this.hasLoad = !1, this.baseMatObj = {};
    for (var t = 0; t < this.baseMats.length; t++) {
        var o = this.baseMats[t];
        this.baseMatObj[o.name.toLowerCase()] = o.resource
    }
    this.ReplaceCar(this.carName);
    var n = function (t, o, n) {
        e.ChangeColorAndMat(t, o, n)
    };
    this.app.on("changecolor", n), this.on("destroy", function () {
        e.app.off("changecolor", n)
    }), this.app.car = this, this.app.isEnter = 0
}, Car2.prototype.ReplaceCar = function (e) {
    var t = this;
    t.wheels = [], t.windows = [];
    var o = t.app.assets.find(e + "_basic.json", "model");
    if (o) {
        o.ready(function (o) {
            var n = new pc.Entity;
            n.addComponent("model"), n.model.model = o.resource, n.name = o.name;
            for (var a = 0; a < n.children[0].children.length; a++) {
                var i = n.children[0].children[a],
                    s = new pc.Entity;
                t.entity.addChild(s), s.name = i.name;
                var r = i.getPosition();
                if (s.setPosition(r), i.name.indexOf("lun") > -1 && t.wheels.push(s), i.name.indexOf("boli") > -1 && t.windows.push(s), "zuoqianmen" === i.name) {
                    var l = t.funDo.clone();
                    l.name = "qlc", l.setPosition(.1, .02, -.9), l.setLocalEulerAngles(0, -90, 0), s.addChild(l), l.on("fun:do", t.OnLDoor)
                } else if ("youqianmen" === i.name) {
                    var c = t.funDo.clone();
                    c.name = "qrc", c.setPosition(-.1, .03, -.9), c.setLocalEulerAngles(0, 90, 0), s.addChild(c), c.on("fun:do", t.OnRDoor)
                } else if ("zuohoumen" === i.name) {
                    var p = t.funDo.clone();
                    p.name = "hlc", p.setPosition(.14, .08, -.87), p.setLocalEulerAngles(0, -90, 0), s.addChild(p), p.on("fun:do", t.OnLDoor)
                } else if ("youhoumen" === i.name) {
                    var h = t.funDo.clone();
                    h.name = "hrc", h.setPosition(-.14, .08, -.87), h.setLocalEulerAngles(0, 90, 0), s.addChild(h), h.on("fun:do", t.OnRDoor)
                } else if ("beimen" === i.name) {
                    var d = t.funDo.clone();
                    d.name = "bc", d.setPosition(0, -.6, -.55), d.setLocalEulerAngles(0, 0, 0), s.addChild(d), d.on("fun:do", t.OnBDoor)
                } else if ("tianchuang" === i.name) {
                    var u = t.funDo.clone();
                    u.name = "tcc", u.setLocalPosition(0, .09, .25), u.setLocalEulerAngles(90, 90, 0), s.addChild(u), u.on("fun:do", t.OnDM)
                } else if ("zuoqianboli" === i.name) {
                    var m = t.funDo.clone();
                    m.name = "qlbc", m.setLocalPosition(.14, .22, -.1), m.setLocalEulerAngles(0, -90, 0), s.addChild(m), m.on("fun:do", t.OnBL)
                } else if ("youqianboli" === i.name) {
                    var f = t.funDo.clone();
                    f.name = "qrbc", f.setLocalPosition(-.14, .22, -.1), f.setLocalEulerAngles(0, 90, 0), s.addChild(f), f.on("fun:do", t.OnBL)
                } else if ("zuohouboli" === i.name) {
                    var y = t.funDo.clone();
                    y.name = "hlbc", y.setLocalPosition(.14, .25, -0), y.setLocalEulerAngles(0, -90, 0), s.addChild(y), y.on("fun:do", t.OnBL)
                } else if ("youhouboli" === i.name) {
                    var g = t.funDo.clone();
                    g.name = "hrbc", g.setLocalPosition(-.14, .25, -0), g.setLocalEulerAngles(0, 90, 0), s.addChild(g), g.on("fun:do", t.OnBL)
                }
            }
            n.destroy(), t.funDo.enabled = !1, t.isCarBasicLoaded = !0;
            for (var v = 0; v < t.entity.children.length; v++) {
                var C = t.entity.children[v],
                    b = e + "_" + C.name;
                t.loadPart(b, C)
            }
            t.hasLoad = !0
        }), t.app.assets.load(o);
        for (var n = 0; n < t.windows.length; n++) {
            var a = t.windows[n],
                i = a.getPosition();
            if ("youhouboli" === a.name) {
                var s = t.entity.findByName("youhoumen"),
                    r = s.getPosition();
                a.reparent(s), a.setLocalPosition(i.x - r.x, i.y - r.y, i.z - r.z)
            } else if ("youqianboli" === a.name) {
                var l = t.entity.findByName("youqianmen"),
                    c = l.getPosition();
                a.reparent(l), a.setLocalPosition(i.x - c.x, i.y - c.y, i.z - c.z)
            } else if ("zuohouboli" === a.name) {
                var p = t.entity.findByName("zuohoumen"),
                    h = p.getPosition();
                a.reparent(p), a.setLocalPosition(i.x - h.x, i.y - h.y, i.z - h.z)
            } else if ("zuoqianboli" === a.name) {
                var d = t.entity.findByName("zuoqianmen"),
                    u = d.getPosition();
                a.reparent(d), a.setLocalPosition(i.x - u.x, i.y - u.y, i.z - u.z)
            }
        }
    } else console.error(e + "_basic.json 加载失败！！！")
}, Car2.prototype.loadPart = function (e, t, o, n) {
    var a = this,
        i = a.app.assets.find(e + ".json", "model");

    function setAsset(e) {
        var i = new pc.Entity;
        i.addComponent("model"), i.model.model = e.resource.clone(), i.name = e.name, t.insertChild(i, 0), n && i.rotateLocal(0, 180, 0);
        for (var s = 0; s < i.model.model.meshInstances.length; s++) {
            var r = i.model.model.meshInstances[s],
                l = r.node.name.split("_")[0],
                c = a.baseMatObj[l.toLowerCase()];
            r.material = c ? c.clone() : r.material.clone()
        }
        if (o) {
            var p = new pc.Entity;
            p.addComponent("model"), p.model.model = i.model.model.clone(), p.name = e.name, o.insertChild(p, 0), n && p.rotateLocal(0, 180, 0)
        }
    }
    i ? i.resource ? setAsset(i) : (i.ready(function (e) {
        setAsset(e)
    }), a.app.assets.load(i)) : console.log(e + " 加载失败！！！")
}, Car2.prototype.ChangeColorAndMat = function (e, t, o) {
    o && (o = o.clone());
    for (var n = 0; n < this.entity.children.length; n++)
        if (!(this.entity.children[n].children.length <= 0)) try {
            var a = this.entity.children[n].children[0].model.model;
            if (a)
                for (var i = 0; i < a.meshInstances.length; i++) {
                    var s = a.meshInstances[i];
                    if (s.node.name === e) {
                        var r = s.material.diffuse;
                        if (t && "" !== t && s.material.getName() !== t) {
                            var l = this.baseMatObj[t.toLowerCase()];
                            s.material = l.clone()
                        }
                        var c = o || s.material.diffuse;
                        o && (s.material.ambient = r, s.material.diffuse = r, s.material.update(), this.color_mats.push({
                            m: s.material,
                            c: [c.r, c.g, c.b],
                            p: 0
                        }))
                    }
                }
        } catch (e) {}
}, Car2.prototype.OnTweenRotation = function (e, t, o) {
    if (!e.tweening) {
        var n = e.getParent();
        e.tweening = !0;
        var a = n.tween(n.getLocalEulerAngles()).rotate(n.open ? {
            x: 0,
            y: 0,
            z: 0
        } : t, 1.6, pc.CubicOut);
        a.on("complete", function () {
            n.open = !n.open, e.tweening = !1, e.script.hotspot.OnComplete(), o && o()
        }, e), a.start()
    }
}, Car2.prototype.OnLDoor = function () {
    pc.app.car.OnTweenRotation(this, {
        x: 0,
        y: -65,
        z: 0
    })
}, Car2.prototype.OnRDoor = function () {
    pc.app.car.OnTweenRotation(this, {
        x: 0,
        y: 65,
        z: 0
    })
}, Car2.prototype.OnBDoor = function () {
    pc.app.car.OnTweenRotation(this, {
        x: 80,
        y: 0,
        z: 0
    })
}, Car2.prototype.OnDM = function () {
    if (!this.tweening) {
        this.tweening = !0;
        var e = this.getParent();
        if (this.par_pos || (this.par_pos = e.getLocalPosition().clone()), e.open) {
            var t = e.tween(e.getLocalPosition()).to({
                x: this.par_pos.x,
                y: this.par_pos.y,
                z: this.par_pos.z
            }, 1.5, pc.CubicOut);
            t.on("complete", function () {
                var t = e.tween(e.getLocalEulerAngles()).rotate({
                    x: 0,
                    y: 0,
                    z: 0
                }, .5, pc.CubicOut);
                t.on("complete", function () {
                    e.open = !e.open, this.tweening = !1, this.script.hotspot.OnComplete()
                }, this), t.start()
            }, this), t.start()
        } else {
            var o = e.tween(e.getLocalEulerAngles()).rotate({
                x: -2,
                y: 0,
                z: 0
            }, .5, pc.CubicOut);
            o.on("complete", function () {
                var t = e.tween(e.getLocalPosition()).to({
                    x: this.par_pos.x,
                    y: this.par_pos.y - .02,
                    z: this.par_pos.z - .63
                }, 1.5, pc.CubicOut);
                t.on("complete", function () {
                    e.open = !e.open, this.tweening = !1, this.script.hotspot.OnComplete()
                }, this), t.start()
            }, this), o.start()
        }
    }
}, Car2.prototype.OnBL = function (e) {
    if (e || (e = 1), !this.tweening) {
        this.tweening = !0;
        var t = this.getParent();
        if (this.par_pos || (this.par_pos = t.getLocalPosition().clone()), t.open) {
            var o = t.tween(t.getLocalPosition()).to({
                x: this.par_pos.x,
                y: this.par_pos.y,
                z: this.par_pos.z
            }, 1.5, pc.CubicOut);
            o.on("complete", function () {
                var e = t.tween(t.getLocalEulerAngles()).rotate({
                    x: 0,
                    y: 0,
                    z: 0
                }, .5, pc.CubicOut);
                e.on("complete", function () {
                    t.open = !t.open, this.tweening = !1, this.script.hotspot.OnComplete()
                }, this), e.start()
            }, this), o.start()
        } else {
            var n = t.tween(t.getLocalEulerAngles()).rotate({
                x: 0,
                y: 0,
                z: 0
            }, .5, pc.CubicOut);
            n.on("complete", function () {
                var o = t.tween(t.getLocalPosition()).to({
                    x: this.par_pos.x > 0 ? this.par_pos.x - .1 * e * .7 : this.par_pos.x + .1 * e * .7,
                    y: this.par_pos.y - .44 * e * .7,
                    z: this.par_pos.z
                }, 1.5, pc.CubicOut);
                o.on("complete", function () {
                    t.open = !t.open, this.tweening = !1, this.script.hotspot.OnComplete()
                }, this), o.start()
            }, this), n.start()
        }
    }
}, Car2.prototype.update = function (e) {
    var t = 0;
    try {
        var o = this.floor.script.floor;
        t = 1 / (Math.PI * this.radius * 2 / 100) * (1e3 * o.speed / 60 / 60) * 360 * e
    } catch (e) {}
    for (var n = 0; n < this.wheels.length; n++) {
        this.wheels[n].rotateLocal(t, 0, 0)
    }
    if (this.color_mats.length > 0)
        for (var a = 0; a < this.color_mats.length; a++) {
            var i = this.color_mats[a].m,
                s = this.color_mats[a].c,
                r = this.color_mats[a].p;
            r = Math.min(1, r + 2 * e), this.color_mats[a].p = r;
            for (var l = 0; l < 3; l++) i.ambient.data[l] = pc.math.lerp(i.ambient.data[l], s[l], r), i.diffuse.data[l] = pc.math.lerp(i.diffuse.data[l], s[l], r);
            i.update(), r >= 1 && (this.color_mats.splice(a, 1), a--)
        }
};
var ClickShiti = pc.createScript("clickShiti");
ClickShiti.attributes.add("floor", {
    type: "entity",
    title: "地面"
}), ClickShiti.attributes.add("shitiRes", {
    type: "entity",
    title: "实体脚本"
}), ClickShiti.prototype.initialize = function () {
    this.app.shiti = !1;
    var i = this,
        t = function () {
            i.onlyShow(), i.app.off("shitires:loaded", t)
        };
    this.entity.element.on("click", this.onClick, this), this.app.on("shitires:loaded", t)
}, ClickShiti.prototype.onClick = function () {
    !1 === this.app.isShitiLoader ? this.shitiRes.script.loadShitiRes.loadRes(!0) : this.onlyShow()
}, ClickShiti.prototype.onlyShow = function () {
    if (0 === this.app.isEnter) {
        this.app.shiti = !this.app.shiti;
        var i = pc.app.root.findByName("shiti");
        this.app.shiti && i.children.length <= 0 && (this.LoadPart("tian"), this.LoadPart("di")), i.enabled = this.app.shiti, this.floor.script.floor.updateSpeed(), this.floor.model.enabled = !this.app.shiti, this.app.setSkybox(this.app.assets.get(this.app.shiti ? null : 11571219))
    }
}, ClickShiti.prototype.LoadPart = function (i) {
    var t = this.app.assets.find(i + ".json", "model");

    function setAsset(i) {
        var t = new pc.Entity;
        t.addComponent("model"), t.model.model = i.resource.clone(), t.name = i.name, pc.app.root.findByName("shiti").insertChild(t, 0)
    }
    t ? t.resource ? setAsset(t) : (t.ready(function (i) {
        setAsset(i)
    }), this.app.assets.load(t)) : console.log(i + " 加载失败！！！")
};
window.speedToggle = function (t) {
    var e = pc.Application.getApplication().root.findByTag("kc");
    e[0] && e[0].script && (e[0].script.leftBtnState.toggle = Boolean(parseInt(t)), e[0].script.leftBtnState.updateData())
}, window.rotationToggle = function (t) {
    var e = pc.Application.getApplication().root.findByName("pivot");
    e && e.script && (e.script.rotation.autoRotation = Boolean(parseInt(t)))
}, window.lightToggle = function (t) {
    var e = pc.Application.getApplication().root.findByTag("kd");
    e[0] && e[0].script && (e[0].script.leftBtnState.toggle = !Boolean(parseInt(t)), e[0].script.leftBtnState.updateData())
}, window.changeColor = function (t) {
    var e = pc.Application.getApplication(),
        o = e.root.findByName("cheqi").script.uiState;
    if ("#B4001E" === t) {
        var i = e.root.findByName("Image0");
        o.setActive(i.script.btnStates)
    } else if ("#034180" === t) {
        var n = e.root.findByName("Image1");
        o.setActive(n.script.btnStates)
    } else if ("#4C4A48" === t) {
        var a = e.root.findByName("Image2");
        o.setActive(a.script.btnStates)
    } else if ("#D8D7D3" === t) {
        var r = e.root.findByName("Image3");
        o.setActive(r.script.btnStates)
    } else if ("#38220A" === t) {
        var p = e.root.findByName("Image4");
        o.setActive(p.script.btnStates)
    } else if ("#06070A" === t) {
        var c = e.root.findByName("Image5");
        o.setActive(c.script.btnStates)
    }
}, window.changeAnyColor = function (t) {
    for (var e = pc.Application.getApplication(), o = (e.root.findByName("Car").script.car2, e.root.findByName("Image0").script.btnStates), i = 0; i < o.nodes.length; i++) o.app.fire("changecolor", o.nodes[i], "", o.isColor ? (new pc.Color).fromString(t) : null)
}, window.openDoor = function (t, e) {
    var o = pc.Application.getApplication().root.findByName(t);
    o && o.getParent() && (o.getParent().open = !Boolean(parseInt(e)), o.fire("fun:do"))
}, window.openWindows = function (t, e, o) {
    var i = pc.Application.getApplication().root.findByName(t);
    i && i.getParent() && (i.getParent().open = !Boolean(parseInt(e)), i.fire("fun:do", o))
}, window.pause = function () {
    var app = pc.Application.getApplication();
    // app.destroy();
    app.autoRender = false;
},

window.recovery = function () {
    var app = pc.Application.getApplication();
    app.autoRender=true;
};
var Boot = pc.createScript("boot");
Boot.prototype.initialize = function () {
    var t = document.getElementsByTagName("body")[0],
        e = document.getElementsByTagName("html")[0],
        o = document.getElementsByTagName("canvas")[0];
    t.style.backgroundColor = "transparent", e.style.backgroundColor = "transparent", o.style.backgroundColor = "transparent"
}, Boot.prototype.update = function (t) {};