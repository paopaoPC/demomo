//
//  CLLocationManager+Extension.h
//  chameleon
//
//  Created by mac on 16/10/21.
//
//

#import <CoreLocation/CoreLocation.h>
typedef void(^updateLocationSucess)(CLLocationCoordinate2D coordinate);
typedef void(^updateLocationFailure)(NSError * error);
@interface CLLocationManager (Extension)


/**
 检查定位服务是否可用
 */
+ (BOOL)checkLocationServiceStatus;


/**
 检查定位服务是否可用，并弹出提示框引导用户设置
 */
+ (BOOL)checkLocationServiceStatusWithAlert;

/**
 转换GPS坐标至高德地图坐标
 */
+ (CLLocationCoordinate2D)tranferGPSToAMap:(CLLocationCoordinate2D)originCoordinate;

/**
 转换高德地图坐标至GPS坐标
 */
+ (CLLocationCoordinate2D)convertAMapToGPS:(CLLocationCoordinate2D)originCoordinate;

/**
 转换baidu地图坐标至高德地图坐标
 */
//+ (CLLocationCoordinate2D)tranferBaiduToAMap:(CLLocationCoordinate2D)originCoordinate;
/**
 获取用户最后的定位
 */
+ (CLLocationCoordinate2D)lastUserLocation;
/**
 保存用户最后的定位
 */
+ (BOOL)saveUserLocation:(CLLocationCoordinate2D)loc;

/**
 保存车辆最新的位置，只会在程序运行时保存
 */
+ (void)saveLatestCarLocation:(CLLocationCoordinate2D)location;
/**
 获取最新的车辆位置
 */
+ (CLLocationCoordinate2D)lastCarLocaiton;

/**
 开始定位

 @param sucess 定位成功回调，每次更新都会调用
 @param failure 定位失败回调，每次更新都会调用
 */
+ (void)startLocationsucess:(updateLocationSucess)sucess failed:(updateLocationFailure)failure;

/**
 停止定位
 */
+ (void)stopLocation;
@end
