//
//  OSCarControlManager.swift
//  OuShangStyle
//
//  Created by shifangyuan on 2018/9/28.
//  Copyright © 2018年 OuShang. All rights reserved.
//

import UIKit
import JavaScriptCore

class OSCarControlManager: NSObject {
    static let shared = OSCarControlManager()
    
    let manager = M0038_CarNetMap_SM.init()
    private override init() {}
    
    /// 打开电子围栏
    func openCarLocationView(_ param: JSValue) {
        manager.openCarLocationView(param.toString())
    }
    /// 展示loading
    func showCarLocationViewLoading(_ param: JSValue) {
        manager.showCarLocationViewLoading()
    }
    /// 停止loading
    func stopCarLocationViewLoading(_ param: JSValue) {
        manager.stopCarLocationViewLoading()
    }
    /// 展示错误弹窗
    func getCarError(_ param: JSValue) {
        manager.getCarError()
    }
    /// 更新图片验证码
    func updateImageCode(_ param: JSValue) {
        manager.updateImageCode(param.toString())
    }
    /// 更新汽车位置
    func refreshLocation(_ param: JSValue) {
        manager.refreshLocation(param.toString())
    }
    /// 展示pin码输入框
    func showPinInput(_ param: JSValue) {
        manager.showPinInput(param.toString())
    }
    /// 显示验证码输入框
    func showAuthCodeView(_ param: JSValue) {
        manager.showAuthCodeView()
    }
    /// 更新车辆状态
    func updateCarState(_ param: JSValue) {
        manager.updateCarState(param.toString())
    }
    /// 获取到围栏列表
    func getEfenceList(_ param: JSValue) {
        manager.getEfenceList(param.toString())
    }
    /// 验证码获取成功调用
    func getAuthCode(_ param: JSValue) {
        manager.getAuthCode()
    }
    /// 电子围栏第一次保存成功嗲用
    func fenceFirstSaved(_ param: JSValue) {
        manager.fenceFirstSaved(param.toString())
    }
    /// 展示弹窗
    func showStatus(_ param: JSValue, _ text: JSValue) {
        manager.showStatus(param.toString(), text.toString())
    }
    /// 成功获取一个围栏
    func getEfenceDataModel(_ param: JSValue) {
        manager.getEfenceDataModel(param.toString())
    }
    /// 打开行车记录
    func openDrivingTrajectory(_ param: JSValue) {
        manager.openDrivingTrajectory(param.toString())
    }
    /// 行车记录添加数据
    func oneTrajectoryData(_ param: JSValue) {
        manager.oneTrajectoryData(param.toString())
    }
    /// 设置高德地图key
    func setAMapKey(_ param: JSValue) {
        manager.setAMapKey()
    }
}
