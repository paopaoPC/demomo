//
//  UILabel+Extension.h
//  YTS
//
//  Created by 傅祚鹏 on 16/2/4.
//  Copyright © 2016年 Rusted. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UILabel (Extension)

+ (CGSize)sizeWithText:(NSString *)text font:(UIFont *)font maxW:(CGFloat)maxW;

+ (CGSize)sizeWithText:(NSString *)text font:(UIFont *)font;

/**
 *  自动计算宽高
 */
- (void)autoSize;

- (void)resizeWidthUpTo:(CGFloat)max;

@end
