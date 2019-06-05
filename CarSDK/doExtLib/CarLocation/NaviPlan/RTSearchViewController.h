//
//  SearchViewController.h
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/21.
//
//

#import <UIKit/UIKit.h>
@class RTSearchViewController;
@class DestinationLocation;
@protocol RTSearchViewControllerDelegate <NSObject>

@optional

/**
 点击返回按钮
 */
- (void)didClickedBackBtnSearchVC:(RTSearchViewController *)searchVC;

/**
 一个目的地被选中
 */
- (void)searchVC:(RTSearchViewController *)searchVC didSelectOneDestination:(DestinationLocation *)destination;
- (void)searchVC:(RTSearchViewController *)searchVC isFavorite:(BOOL)isFavorite;
@end

@interface RTSearchViewController : UIViewController



- (instancetype)initWithDelegate:(id<RTSearchViewControllerDelegate>)delegate;

/**
 显示搜索界面
 */
- (void)showSearchView;

/**
 隐藏搜索界面
 */
- (void)switchToMapView;


/**
 收藏一个地点
 @return 收藏是否成功，NO表示已经收藏过该地点s
 */
- (BOOL)saveOneDestinationLocation:(DestinationLocation *)detination;

/**
 取消收藏一个地点
 */
- (void)removeOneSavedLocation:(DestinationLocation *)destination;
@end
