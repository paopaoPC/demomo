//
//  DoEventManager.h
//  CarSDK
//
//  Created by shifangyuan on 2018/9/29.
//  Copyright © 2018年 石方圆. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol DoEventManagerDelegate <NSObject>

@required
/// 车控调用js方法（jsname为js方法）
-(void)javaScriptCallBack:(NSString *)jsname;

/// 被挤掉线推出车控界面
- (void)loginOutCarControlEvent;
@end

@interface DoEventManager : NSObject

+(DoEventManager *)shared;

/// 主动调用JS方法。 jsname:js方法名
//@property (copy, nonatomic) void (^javaScriptCallBlock)(NSString *jsname);

/// delegate 必须实现代理方法（-javaScriptCallBack）
@property (weak, nonatomic) id<DoEventManagerDelegate> delegate;

///
- (void)javaScriptCallMethod:(NSString *)jsname;

/// 退出车控方法
-(void)loginOutCarControl;

@end
