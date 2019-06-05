//
//  WebViewJSExports.swift
//  OuShangStyle
//
//  Created by shifangyuan on 2018/9/24.
//  Copyright © 2018 OuShang. All rights reserved.
//

import Foundation
import JavaScriptCore

@objc protocol WebViewJSExports : JSExport {
    
    func getNetStatue() -> Bool
    
    /***************************************************/
    /*********************车控交互***********************/
    /***************************************************/
    // MARK: 车控
    /// 刷新用户token
    func refreshToken_by_zh(_ param: JSValue, _ callback: String)
    /// 打开电子围栏
    func openCarLocationView(_ param: JSValue)
    /// 展示loading
    func showCarLocationViewLoading(_ param: JSValue)
    /// 停止loading
    func stopCarLocationViewLoading(_ param: JSValue)
    /// 展示错误弹窗
    func getCarError(_ param: JSValue)
    /// 更新图片验证码
    func updateImageCode(_ param: JSValue)
    /// 更新汽车位置
    func refreshLocation(_ param: JSValue)
    /// 展示pin码输入框
    func showPinInput(_ param: JSValue)
    /// 显示验证码输入框
    func showAuthCodeView(_ param: JSValue)
    /// 更新车辆状态
    func updateCarState(_ param: JSValue)
    /// 获取到围栏列表
    func getEfenceList(_ param: JSValue)
    /// 验证码获取成功调用
    func getAuthCode(_ param: JSValue)
    /// 电子围栏第一次保存成功嗲用
    func fenceFirstSaved(_ param: JSValue)
    /// 展示弹窗
    func showStatus(_ param: JSValue, _ text : JSValue)
    /// 成功获取一个围栏
    func getEfenceDataModel(_ param: JSValue)
    /// 打开行车记录
    func openDrivingTrajectory(_ param: JSValue)
    /// 行车记录添加数据
    func oneTrajectoryData(_ param: JSValue)
    /// 设置高德地图key
    func setAMapKey(_ param: JSValue)
    /// 下载资源更新
    func downloadP(_ url: JSValue, _ path: JSValue, _ call: String)
    /// 获取版本号
    func getVersion() -> String?
    /// 设备信息
    func getInfo() -> String?
    /// 设置RSA
    func RSA(_ param: JSValue) -> String?
    ///内存
    func getMemory(_ param: JSValue) -> String?
    /// CPU
    func getCpuInfo(_ param: JSValue) -> String?
    /// 获取资源包文件路径
    func getModalPath() -> String
    /// 是否允许加载3D模型
    func isLoadCarModal() -> Bool
    /// 选择联系人 -- 获取手机号信息
    func showContactsList(_ json: String, _ callback: String)
    /// 打开身份证正面识别
    func openOCRView_IdCardFront(_ json: String, _ callback: String)
    /// 打开身份证反面识别
    func openOCRView_IdCardBack(_ json: String, _ callback: String)
    
    /// 打开媒体资料库选择或则拍照获得图片(base64)的方法 , isIDCard（bool值类型）为真标记为身份证选择会按照17:11进行裁剪， compress（整数类型）大于1时，传入值为大小限制（单位：KB）, 默认不进行压缩（小于等于1）。callback 回调方法名自定义接收方法
    func openPhotoLibrary(_ isIDCard: Bool,_ compress: NSInteger, _ callback: String)
    
    /***************************************************/
    /*********************蓝牙钥匙***********************/
    /***************************************************/
    /// 登录
    func loginandgetdata_blueTooth(_ json: String, _ callback: String)
    /// 刷新
    func reflash_blueTooth(_ param: JSValue, _ callback: String)
    /// 连接蓝牙
    func connectbt_blueTooth(_ json: String, _ callback: String)
    /// 设置默认车辆
    func setdefaultvehicle_blueTooth(_ json: String, _ callback: String)
    /// 锁车指令
    func actionLock_blueTooth(_ param: JSValue, _ callback: String)
    /// 解锁指令
    func actionUnlock_blueTooth(_ param: JSValue, _ callback: String)
    /// 寻车
    func actionSearchVeicle_blueTooth(_ param: JSValue, _ callback: String)
    /// 熄火
    func actionStopEngine_blueTooth(_ param: JSValue, _ callback: String)
    /// 启动引擎
    func actionStartEngine_blueTooth(_ param: JSValue, _ callback: String)
    /// 打开后备箱
    func actionOpenTrunk_blueTooth(_ param: JSValue, _ callback: String)
    /// 打开右侧滑门
    func actionRightSlidingDoor_blueTooth(_ param: JSValue, _ callback: String)
    /// 打开左侧滑门
    func actionLeftSlidingDoor_blueTooth(_ param: JSValue, _ callback: String)
    /// 车窗自动降窗
    func actionLongUnlock_blueTooth(_ param: JSValue, _ callback: String)
    /// 车窗自动升起
    func actionLongLock_blueTooth(_ param: JSValue, _ callback: String)
    /// 获取配对码
    func getpasscode_blueTooth(_ json: String, _ callback: String)
    /// 对用户授权
    func grantUser_blueTooth(_ json: String, _ callback: String)
    /// 取消用户授权
    func revokePermissionbtn_blueTooth(_ json: String, _ callback: String)
    /// 获取授权列表
    func grantList_blueTooth(_ json: String, _ callback: String)
    /// 获取分享给我的列表
    func getVehicleListWithPhone_blueTooth(_ json: String, _ callback: String)
    /// 获取蓝牙开关状态
    func getBlueToothStatus_blueTooth(_ param: JSValue, _ callback: String)
    /// 获取蓝牙连接状态
    func getConnectStatus_blueTooth(_ param: JSValue, _ callback: String)
    /// 解除绑定
    func unBind_blueTooth(_ json: String, _ callback: String)
    /// 断开蓝牙连接
    func cancelConnect_blueTooth(_ param: JSValue, _ callback: String)
    /// ------ some ------
    func whistle0_blueTooth(_ param: JSValue, _ callback: String)
    func whistle1_blueTooth(_ param: JSValue, _ callback: String)
    func actionSunroofClose(_ param: JSValue, _ callback: String)
    func actionSunroofOpen(_ param: JSValue, _ callback: String)
    func getOfflineExpiryTime() -> Int
    func getOfflineRemainingTimes() -> Int32
    func modifyPermissionWithOtherPhone_blueTooth(_ json: String, _ callback: String)
}


@objc class WebViewJSInstance : NSObject, WebViewJSExports {
    
    /// ZipArchive 解压完成回调
    //var zipArchiveCallBack: String!
    
    override init() { super.init() }
    
    /// 网络状态
    func getNetStatue() -> Bool {
        return true//PushManager.default.isNetworking
    }
    
    /***************************************************/
    /*********************车控交互***********************/
    /***************************************************/
    /// 打开电子围栏
    func openCarLocationView(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().openCarLocationView(param.toString())
    }
    /// 展示loading
    func showCarLocationViewLoading(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().showCarLocationViewLoading()
    }
    /// 停止loading
    func stopCarLocationViewLoading(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().stopCarLocationViewLoading()
    }
    /// 展示错误弹窗
    func getCarError(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().getCarError()
    }
    /// 更新图片验证码
    func updateImageCode(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().updateImageCode(param.toString())
    }
    /// 更新汽车位置
    func refreshLocation(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().refreshLocation(param.toString())
    }
    /// 展示pin码输入框
    func showPinInput(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().showPinInput(param.toString())
    }
    /// 显示验证码输入框
    func showAuthCodeView(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().showAuthCodeView()
    }
    /// 更新车辆状态
    func updateCarState(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().updateCarState(param.toString())
    }
    /// 获取到围栏列表
    func getEfenceList(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().getEfenceList(param.toString())
    }
    /// 验证码获取成功调用
    func getAuthCode(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().getAuthCode()
    }
    /// 电子围栏第一次保存成功嗲用
    func fenceFirstSaved(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().fenceFirstSaved(param.toString())
    }
    /// 展示弹窗
    func showStatus(_ param: JSValue, _ text : JSValue) {
        M0038_CarNetMap_SM.shared().showStatus(param.toString(), text.toString())
    }
    /// 成功获取一个围栏
    func getEfenceDataModel(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().getEfenceDataModel(param.toString())
    }
    /// 打开行车记录
    func openDrivingTrajectory(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().openDrivingTrajectory(param.toString())
    }
    /// 行车记录添加数据
    func oneTrajectoryData(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().oneTrajectoryData(param.toString())
    }
    /// 设置高德地图key
    func setAMapKey(_ param: JSValue) {
        M0038_CarNetMap_SM.shared().setAMapKey()
    }
    
    func getVersion() -> String? {
        return M0038_CarNetMap_SM.shared().getVersion().ex_ToString
    }
    
    func getInfo() -> String? {
        return M0038_CarNetMap_SM.shared().getInfo().ex_ToString
    }
    
    func RSA(_ param: JSValue) -> String? {
        return M0038_CarNetMap_SM.shared().rsa(param.toString())
    }
    
    func getCpuInfo(_ param: JSValue) -> String? {
        return M0038_CarNetMap_SM.shared().getCpuInfo()
    }
    
    func getMemory(_ param: JSValue) -> String? {
        return M0038_CarNetMap_SM.shared().getMemory()
    }
    
    func openPhotoLibrary(_ isIDCard: Bool, _ compress: NSInteger, _ callback: String) {
        print("demo 暂不支持图片选择")
    }
    
    /// 资源包更新
    func downloadP(_ url: JSValue, _ path: JSValue, _ call: String) {
        print("demo 暂不支持资源下载")
        
//        let config = URLSessionConfiguration.default
//        config.timeoutIntervalForRequest = 500
//        let manager = AFURLSessionManager.init(sessionConfiguration: config)
//        let request = AFHTTPRequestSerializer.init().request(withMethod: "GET", urlString: url.toString(), parameters: nil, error: nil)
//        let task = manager.downloadTask(with: request as URLRequest, progress: { (progress) in
//            DispatchQueue.main.async {
//                let p = CGFloat(progress.completedUnitCount) / CGFloat(progress.totalUnitCount)
//                let js = call + "(1,\(p))"
//                DoEventManager.shared()?.javaScriptCallMethod(js)
//            }
//        }, destination: { (tpath, response) -> URL in
//            let dpath = YYTools.getConfigureFileName("car/version/ppResource/zipmodel")
//            let savepath = dpath! + "/" + response.suggestedFilename!
//            let filePath = URL(fileURLWithPath: savepath)
//            return filePath
//        }, completionHandler: { (response, filePath, error) in
//            if error == nil {
//                let dpath = YYTools.getConfigureFileName("car/version/ppResource/zipmodel")
//                let fileName = dpath! + "/" + response.suggestedFilename!
//                self.zipArchiveCallBack = call
//                // 解压文件路径
//                let unpath : String = YYTools.getConfigureFileName("car/version/ppResource/" + path.toString())
//                // 判断车型模型文件是否存在，并删除旧车型模型文件
//                YYTools.removeConfigure(withName: "car/version/ppResource/" + path.toString())
//                // 开始解压
//                let result = SSZipArchive.unzipFile(atPath: fileName, toDestination: unpath, delegate: self)
//                if !result {
//                    let js = call + "(0,'error')"
//                    DoEventManager.shared()?.javaScriptCallMethod(js)
//                    // 删除压缩包文件
//                    YYTools.removeConfigure(withName: "car/version/ppResource/zipmodel")
//                }
//            } else {
//                let js = call + "(0,'error')"
//                DoEventManager.shared()?.javaScriptCallMethod(js)
//                // 删除压缩包文件
//                YYTools.removeConfigure(withName: "car/version/ppResource/zipmodel")
//            }
//        })
//
//        task.resume()
    }
    
    /// 解压完成
//    func zipArchiveDidUnzipArchive(atPath path: String, zipInfo: unz_global_info, unzippedPath: String) {
//        let js = self.zipArchiveCallBack + "(1)"
//        DoEventManager.shared()?.javaScriptCallMethod(js)
//        // 删除压缩包文件
//        YYTools.removeConfigure(withName: "car/version/ppResource/zipmodel")
//    }
    
    func getModalPath() -> String {
        return ""//YYTools.getConfigureFileName("car/version/ppResource/")
    }
    
    func isLoadCarModal() -> Bool {
        return false//kUserDefaultModal
    }
    
    func showContactsList(_ json: String, _ callback: String) {
        print("demo 暂不支持联系人选择")
//        OSContactsManager.manager.showContactsController(completion: { (phone, status) in
//            let data = ["data":phone,"success":status] as [String : Any]
//            let js = callback + "(" + "\(data.ex_ToString ?? "")" + ")"
//            DoEventManager.shared()?.javaScriptCallMethod(js)
//        })
    }
    
    /***************************************************/
    /*********************蓝牙钥匙***********************/
    /***************************************************/
    /// 登录
    func loginandgetdata_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().loginandgetdata_blueTooth(json, callback)
        }
    }
    /// 刷新
    func reflash_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().reflash_blueTooth()
        }
    }
    /// 连接蓝牙
    func connectbt_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().connectbt_blueTooth(json, callback)
        }
    }
    /// 设置默认车辆
    func setdefaultvehicle_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().setdefaultvehicle_blueTooth(json, callback)
        }
    }
    /// 锁车指令
    func actionLock_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionLock_blueTooth(callback)
        }
    }
    /// 解锁指令
    func actionUnlock_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionUnlock_blueTooth(callback)
        }
    }
    /// 寻车
    func actionSearchVeicle_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionSearchVeicle_blueTooth(callback)
        }
    }
    /// 熄火
    func actionStopEngine_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionStopEngine_blueTooth(callback)
        }
    }
    /// 启动引擎
    func actionStartEngine_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionStartEngine_blueTooth(callback)
        }
    }
    /// 打开后备箱
    func actionOpenTrunk_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionOpenTrunk_blueTooth(callback)
        }
    }
    /// 打开右侧滑门
    func actionRightSlidingDoor_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionRightSlidingDoor_blueTooth(callback)
        }
    }
    /// 打开左侧滑门
    func actionLeftSlidingDoor_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionLeftSlidingDoor_blueTooth(callback)
        }
    }
    /// 车窗自动降窗
    func actionLongUnlock_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionLongUnlock_blueTooth(callback)
        }
    }
    /// 车窗自动升起
    func actionLongLock_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionLongLock_blueTooth(callback)
        }
    }
    /// 获取配对码
    func getpasscode_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().getpasscode_blueTooth(json, callback)
        }
    }
    /// 对用户授权
    func grantUser_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().grantUser_blueTooth(json, callback)
        }
    }
    /// 取消用户授权
    func revokePermissionbtn_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().revokePermissionbtn_blueTooth(json, callback)
        }
    }
    /// 获取授权列表
    func grantList_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().grantList_blueTooth(json, callback)
        }
    }
    /// 获取分享给我的列表
    func getVehicleListWithPhone_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().getVehicleList(withPhone_blueTooth: json, callback)
        }
    }
    /// 获取蓝牙开关状态
    func getBlueToothStatus_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().getBlueToothStatus_blueTooth(callback)
        }
    }
    /// 获取蓝牙连接状态
    func getConnectStatus_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().getConnectStatus_blueTooth(callback)
        }
    }
    /// 解除绑定
    func unBind_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().unBind_blueTooth(json, callback)
        }
    }
    /// 断开蓝牙连接
    func cancelConnect_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().cancelConnect_blueTooth()
        }
    }
    
    func whistle0_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().whistle0_blueTooth(callback)
        }
    }
    
    func whistle1_blueTooth(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().whistle1_blueTooth(callback)
        }
    }
    
    func actionSunroofClose(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionSunroofClose(callback)
        }
    }
    
    func actionSunroofOpen(_ param: JSValue, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().actionSunroofOpen(callback)
        }
    }
    
    func getOfflineExpiryTime() -> Int {
        return InterfacePlugin.shared().getOfflineExpiryTime()
    }
    
    func getOfflineRemainingTimes() -> Int32 {
        return InterfacePlugin.shared().getOfflineRemainingTimes()
    }
    
    func modifyPermissionWithOtherPhone_blueTooth(_ json: String, _ callback: String) {
        DispatchQueue.main.async {
            InterfacePlugin.shared().modifyPermission(withOtherPhone_blueTooth: json, callback)
        }
    }
    
    // 身份证正面
    func openOCRView_IdCardFront(_ json: String, _ callback: String) {
        openOCRView_IdCard(json, callback, false)
    }
    
    // 身份证反面
    func openOCRView_IdCardBack(_ json: String, _ callback: String) {
        openOCRView_IdCard(json, callback, true)
    }
    
    // 调用识别接口
    func openOCRView_IdCard(_ json: String, _ callback: String, _ isback: Bool) {
//        DispatchQueue.main.async {
//            let vc = AipCaptureCardVC.viewController(with: isback ? CardType.localIdCardBack : CardType.localIdCardFont) { (image) in
//                guard let dimage = image else { return }
//                self.ocrCardDiscern(dimage, callback: callback, isBack: isback)
//            }
//            guard let ocrvc = vc else { return }
//            rootViewController?.present(ocrvc, animated: true, completion: nil)
//        }
    }
    // 开始识别  isBack 是否身份证反面
    func ocrCardDiscern(_ image: UIImage, callback: String, isBack: Bool) {
//        if isBack {
//            AipOcrService.shard()?.detectIdCardBack(from: image, withOptions: nil, successHandler: { (response) in
//                self.ocrCardSuccess(image, callback: callback, response: response)
//            }, failHandler: { (error) in
//                self.ocrCallBack(callback, success: false, image: image, text: "识别失败")
//            })
//        } else {
//            AipOcrService.shard().detectIdCardFront(from: image, withOptions: nil, successHandler: { (response) in
//                self.ocrCardSuccess(image, callback: callback, response: response)
//            }, failHandler: { (error) in
//                self.ocrCallBack(callback, success: false, image: image, text: "识别失败")
//            })
//        }
    }
    // 识别成功处理
    func ocrCardSuccess(_ image: UIImage, callback: String, response: Any?) {
        guard let data = response as? [String : Any] else {
            self.ocrCallBack(callback, success: false, image: image, text: "识别失败")
            return
        }
        self.ocrCallBack(callback, success: true, image: image, data: data)
    }
    // 识别回调
    func ocrCallBack(_ callback: String, success: Bool, image: UIImage?, text: String? = nil, data: [String : Any]? = nil) {
//        var params = [String : Any]()
//        if text != nil { params["data"] = text }
//        if data != nil { params["data"] = data }
//        params["success"] = success ? "true" : "false"
//        if let cimage = image {
//            let imageData = UIImageJPEGRepresentation(cimage, 1.0)
//            //            debuglog("原图片大小------" + "\(data!.count / 1024)kb")
//            //            let imageData = cimage.compression()
//            //            debuglog("压缩图片大小------" + "\(imageData.count / 1024)kb")
//            let imgBase64 = "data:image/png;base64," + imageData!.base64EncodedString()
//            params["image"] = imgBase64
//        }
//
//        DispatchQueue.main.async {
//            let js = callback + "(" + "\(params.ex_ToString ?? "")" + ")"
//            DoEventManager.shared()?.javaScriptCallMethod(js)
//            rootViewController?.dismiss(animated: true, completion: nil)
//        }
    }
    
    // 车控刷新token
    func refreshToken_by_zh(_ param: JSValue, _ callback: String) {
//        let request = APIRequest.init("/changan/refreshToken")
//        NetworkCenter.request(request, method: .post, params: nil).subscribe(onNext: { [weak self] (response) in
//            guard let data = response.data as? [String: Any] else {
//                self?.refreshTokenError(callback)
//                return
//            }
//            let eventManager = DoEventManager.shared()!
//            let jsonStr = callback + "(\(data.ex_ToString ?? ""))"
//            eventManager.javaScriptCallMethod(jsonStr)
//            }, onError: { [weak self] (err) in
//                self?.refreshTokenError(callback)
//        }).disposed(by: bag)
    }
    
    func refreshTokenError(_ callback: String) {
        let param = ["msg":"网络开小差","code":"503"]
        let eventManager = DoEventManager.shared()!
        let jsonStr = callback + "(\(param.ex_ToString ?? ""))"
        eventManager.javaScriptCallMethod(jsonStr)
    }
}


extension Dictionary {
    var ex_ToString: String? {
        get {
            if #available(iOS 11.0, *) {
                guard let data = try? JSONSerialization.data(withJSONObject: self, options: [JSONSerialization.WritingOptions.sortedKeys]),
                    let json = String(data: data, encoding: String.Encoding.utf8) else {
                        return ""
                }
                return json
            } else {
                return ""
            }
        }
    }
}
