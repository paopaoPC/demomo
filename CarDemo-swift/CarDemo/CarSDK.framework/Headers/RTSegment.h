//
//  RTSegment.h
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/15.
//
//

#import <UIKit/UIKit.h>

typedef enum{
    NormalState = 0,
    SelectedState,
}SegmentState;

@interface RTSegment : UIView

@property (assign, nonatomic,getter=isSelected)BOOL selected;
/**
 设置是否被选中
 */
- (void)setSelected:(BOOL)aBool;

/**
 设置图片
 */
- (void)setImage:(NSString *)imageName forState:(SegmentState)state;

/**
 设置背景颜色
 */
- (void)setBackgroundColor:(UIColor *)backgroundColor forState:(SegmentState)state;

/**
 设置文字
 */
- (void)setTitle:(NSString *)title forState:(SegmentState)state;

/**
 设置文字颜色
 */
- (void)setTitleColor:(UIColor *)Color forState:(SegmentState)state;

/**
 设置响应事件
 */
- (void)setTarget:(id)target selector:(SEL)selector;

@end
