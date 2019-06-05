//
//  CarItem.h
//  libBtKey
//
//  Created by cds on 2018/9/19.
//  Copyright © 2018年 cds. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CarItem : NSObject

@property (nonatomic,strong) NSString *phone;//手机号
@property (nonatomic,strong) NSString *vin;//车架号
@property (nonatomic,strong) NSString *userType;//用户类型OWNER、USER
@property (nonatomic,strong) NSString *authPhone;//授权人手机号
@property (nonatomic,assign) long startTime;//授权开始时间long类型，精确到秒
@property (nonatomic,assign) long endTime;//授权结束时间，精确到秒


@end
