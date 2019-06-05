//
//  PinAuth.h
//  chameleon
//
//  Created by 傅祚鹏 on 2017/3/23.
//
//

#import <Foundation/Foundation.h>

@interface PinAuth : NSObject

/**
 开始进行控车码验证

 @param paramter 调用JS方法需要的参数
 */
+ (void)startPinAuthentication:(NSDictionary *)paramter;

/**
 显示控车码输入界面,传入需要调用的JS方法名
 */
+ (void)showPinInputViewWithJSFunctionName:(NSString *)functionName;

/**
 显示图片验证码输入界面
 */
+ (void)showImageAuthView;

/**
 更新验证图片
 */
+ (void)updateAuthImage:(NSDictionary *)imageInfo;

/**
 开始发送一次手机验证码后的倒计时
 */
+ (void)startCountDown;

@end
