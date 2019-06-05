//
//  BaiduMapViewController.h
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/21.
//
//

#import <UIKit/UIKit.h>
@class BaiduMapViewController;
@class DestinationLocation;
@protocol BaiduMapViewControllerDelegate <NSObject>

@optional

/**
 点击了返回按钮
 */
- (void)didClickedBackBtn:(BaiduMapViewController *)BaiduMapViewController;

/**
 点击了收藏按钮
 */
- (void)BaiduMapVC:(BaiduMapViewController *)BaiduMapViewController didClickSaveLocation:(DestinationLocation *)location;

/**
 取消收藏地点
 */
- (void)baiduMapVC:(BaiduMapViewController *)baiduMapViewController didRemoveFavoriteLocation:(DestinationLocation *)location;

@end

@interface BaiduMapViewController : UIViewController

@property (assign,nonatomic,getter=isSettingWayPointMode)BOOL settingWayPointMode;  //设置途径点模式

@property (nonatomic,strong)DestinationLocation *destination;

@property (nonatomic,assign)BOOL isFavorite;

- (instancetype)initWithDelegate:(id<BaiduMapViewControllerDelegate>)delegate;

/**
 显示目的地视图
 */
- (void)showDestinationView;

/**
 显示途径点选择视图
 */
- (void)showWaypointView;
@end
