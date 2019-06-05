//
//  EfenceDataModel.h
//  chameleon
//
//  Created by Foreveross on 16/3/30.
//
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
@class EfenceDataModel;
@interface EfenceDataModel : NSObject<NSMutableCopying>
@property (nonatomic, copy)NSString *fenceId;
@property (nonatomic, assign) CLLocationCoordinate2D point;
@property (nonatomic, copy)NSString *name;
@property (nonatomic, copy)NSString *distance;
@property (nonatomic, copy)NSString *notifyType;
@property (nonatomic, copy)NSString *notifyPhone;
//@property (nonatomic, copy)NSString *status;
@property (nonatomic, assign)BOOL isActivated;
@property (nonatomic, assign)BOOL isDefaultData;


/**
 *  根据数据生成围栏数据模型
 *
 *  @return 返回数据模型
 */
+ (EfenceDataModel *)generateDataModelWithData:(NSDictionary *)data;

/**
 *  更新本地和服务器的围栏数据
 *
 *  @param dataModel 新数据模型
 */
+ (void)updateFenceData:(EfenceDataModel *)dataModel;

/**
 *  清空数据并更新
 */
+ (void)clearFenceData:(NSString *)fenceId;


/**
 根据半径大小显示米还是公里
 */
- (NSString*)adaptRadiusContent;

@end
