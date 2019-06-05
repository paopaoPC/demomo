define(
    {
        name: "主动维修",
        runtime: "RELEASE",
        application: "application/imApplication",
        DEBUG: { //开发环境
            debug: true,
            netDebug: true,
            server: "http://tspdemo.changan.com.cn"
        },
        DEBUG_NO_NET_DEBUG: { //预生产环境
            debug: false,
            netDebug: true,
            // server:"https://113.204.202.69"
            server:"http://preprod.changan.com.cn"
        },
        RELEASE: {//正式环境
            debug: false,
            netDebug: true,
            server: "https://incallapi.changan.com.cn"
            // 
        }
    });
