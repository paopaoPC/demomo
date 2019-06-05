//
//  NaviPointAnnotation.h
//  AMapNaviKit
//
//  Created by 刘博 on 16/3/8.
//  Copyright © 2016年 AutoNavi. All rights reserved.
//


#import <MAMapKit/MAMapKit.h>

typedef NS_ENUM(NSInteger, NaviPointAnnotationType)
{
    NaviPointAnnotationStart,
    NaviPointAnnotationWay,
    NaviPointAnnotationEnd,
    NaviPointAnnotationSpeedUp,
    NaviPointAnnotationSpeedDown,
    NaviPointAnnotationRapidTurn
};

@interface NaviPointAnnotation : MAPointAnnotation

@property (nonatomic, assign) NaviPointAnnotationType navPointType;
@property (nonatomic, assign)NSInteger index;
@property (nonatomic, copy)NSString *name;
@property (nonatomic, copy)NSString *address;
@end
