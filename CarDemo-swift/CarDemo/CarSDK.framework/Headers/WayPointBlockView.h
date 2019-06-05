//
//  WayPointBlockView.h
//  chameleon
//
//  Created by 傅祚鹏 on 2017/1/3.
//
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
@class DestinationLocation;
@class WayPointBlockView;
@class NaviPointAnnotation;
@protocol WayPointBlockViewDelegate <NSObject>
@optional
/**
 点击了确定按钮
 */
- (void)didClickComfirmBtn:(WayPointBlockView*)wayPointView info:(NSDictionary *)info;

/**
 点击了删除按钮
 */
- (void)didClickDeleteBtn:(WayPointBlockView*)wayPointView annotation:(NaviPointAnnotation *)annotation;

/**
 点击了取消按钮
 */
- (void)didClickCancelBtn:(WayPointBlockView*)wayPointView;

@end

@interface WayPointBlockView : UIView

@property (nonatomic,assign,getter=isDeleteMode)BOOL deleteMode;          //是否是删除模式

@property (nonatomic, weak)NaviPointAnnotation *associatedAnno;           //当前关联标注

- (instancetype)initWithDelegate:(id<WayPointBlockViewDelegate>)delegate;

/**
 通过坐标定位所选的途径点地址
 */
- (void)locateSelectedwaypoint:(CLLocationCoordinate2D)coordinate;


/**
 使用已有地点作为途径点
 */
- (void)setWayPointWithLocation:(DestinationLocation *)location;

/**
 取消地图选择途径点
 */
- (void)cancelChooseWaypoint;
@end
