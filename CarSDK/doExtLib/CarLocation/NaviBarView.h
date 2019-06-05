//
//  NaviBarView.h
//  chameleon
//
//  Created by Foreveross on 16/7/4.
//
//

#import <UIKit/UIKit.h>
@class NaviBarView;
@interface NaviBarView : UIView

@property (nonatomic, weak, readonly)UIButton *backBtn; //返回按钮
@property (nonatomic, weak)NSString *title;             //页面标题
/**
 *  创建后直接添加至需要导航栏的页面
 */
+ (instancetype)creatNaviBarView;
/**
 *  设置导航栏右侧按钮
 */
- (void)setRightItemWith:(UIView *)rightItem;
/**
 *  设置标题视图
 */
- (void)setTitleView:(UIView *)view;

/**
 设置返回按钮图案
 */
- (void)setBackBtnImg:(NSString *)img;

/**
 设置底部分割线
 */
- (void)setBottomSeperatorWidth:(float)width color:(UIColor *)color;

@end
