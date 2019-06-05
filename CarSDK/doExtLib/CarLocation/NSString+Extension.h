//
//  NSString+Extension.h
//  chameleon
//
//  Created by Foreveross on 16/3/30.
//
//

#import <Foundation/Foundation.h>

@interface NSString (Extension)
/**
 *  判断字符串是否为手机号码
 *
 */
- (BOOL)isMobileNumber;


- (NSString *)getAllNumbers;

/**
 获取设备型号
 */
+ (NSString *)getDeviceVersion;


/**
 将多个字符串连接起来

 @param strings 需要拼接的多个字符串
 @param string 字符串之间的连接字符串
 */
+ (NSString *)joinStrings:(NSArray<NSString*>*)strings with:(NSString *)string;


- (id)stringToJson;

@end
