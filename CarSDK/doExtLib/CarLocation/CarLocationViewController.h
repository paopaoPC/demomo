//
//  CarLocationViewController.h
//  chameleon
//
//  Created by Checker on 16/1/27.
//
//

#import <UIKit/UIKit.h>

@interface CarLocationViewController : UIViewController

/**
 *  初始化控制器
 */
- (instancetype)init;
- (instancetype)initWithData:(NSDictionary*) data;
/**
 *  更新汽车位置
 */
- (void) refreshLocation:(NSDictionary*) location;

/**
 获取汽车位置失败
 */
- (void)getCarError;

/**
 *  显示加载
 */
- (void) showLoading;
/**
 *  隐藏加载
 */
- (void) stopLoading;
/**
 *  显示PIN码输入窗口
 */
- (void) showPinInput;
/**
 *  显示验证码输入框
 */
- (void)showAuthCodeView;
/**
 *  更新汽车状态
 */
- (void) updateCarState:(NSDictionary*) location;
/**
 *  获取围栏数据模型
 */
- (void) getEfenceDataModel:(NSDictionary *)data;


/**
 获取到围栏列表
 */
- (void)getEfenceList:(NSArray *)fences;


/**
 图片验证码更新成功
 */
- (void)updateImageCode:(NSDictionary *)data;
/**
 *  验证码申请成功
 */
- (void)getAuthCode;

/**
 电子围栏第一次保存成功
 */
- (void)fenceFirstSaved:(NSString *)fenceId;
@end
