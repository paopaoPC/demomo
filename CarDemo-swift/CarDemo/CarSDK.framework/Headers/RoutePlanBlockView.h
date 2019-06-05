//
//  RoutePlanBlockView.h
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/26.
//
//

#import <UIKit/UIKit.h>
#import <AMapNaviKit/AMapNaviKit.h>
@class RoutePlanBlockView;

@protocol RoutePlanBlockViewDelegate <NSObject>

@optional

/**
 选中一个segment
 */
- (void)routePlanBlockView:(RoutePlanBlockView *)routePlanBlockView didSelectSegment:(NSInteger)segmentIndex;

/**
 点击了‘开始导航’按钮
 */
- (void)didClickStartNavigateBtn:(RoutePlanBlockView *)routePlanBlockView;


/**
 导航语音文本
 */
- (void)routePlanBlockView:(RoutePlanBlockView *)routePlanBlockView playNaviSoundString:(NSString *)soundStr;

/**
 搜索到驾车路线
 
 @param result 路线搜索结果
 */
- (void)onGetDrivingSearchResult:(RoutePlanBlockView *)routePlanBlockView naviRouts:(NSDictionary<NSNumber *, AMapNaviRoute *> *)naviRoutes;

@end

@interface RoutePlanBlockView : UIView

@property (strong, nonatomic)AMapNaviDriveManager *driveManager;

@property (assign, nonatomic)id<RoutePlanBlockViewDelegate>delegate;

- (instancetype)initWithDelegate:(id<RoutePlanBlockViewDelegate>)delegate;

/**
 重置按钮
 */
- (void)resetSegment;

- (void)searchDrivingRouteWithStart:(CLLocationCoordinate2D)start end:(CLLocationCoordinate2D)end waypoints:(NSArray *)waypoints;
- (void)searchDrivingRouteWithAnnotaions:(NSArray *)nodes;
@end
