//
//  UIView+Extension.h
//
//  Created by apple on 16-03-28.
//  Copyright (c) 2014年 apple. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIView (Extension)
@property (nonatomic, assign) CGFloat x;
@property (nonatomic, assign) CGFloat y;
@property (nonatomic, assign) CGFloat centerX;
@property (nonatomic, assign) CGFloat centerY;
@property (nonatomic, assign) CGFloat width;
@property (nonatomic, assign) CGFloat height;
@property (nonatomic, assign) CGSize size;
@property (nonatomic, assign) CGPoint origin;

/**
 设置阴影

 @param color 阴影颜色
 @param offset 阴影偏移量
 @param opacity 阴影可见度
 @param radius 阴影半径
 */
- (void)setShadowForColor:(UIColor *)color offset:(CGSize)offset opacity:(float)opacity radius:(float)radius;
@end
