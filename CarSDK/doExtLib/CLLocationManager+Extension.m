//
//  CLLocationManager+Extension.m
//  chameleon
//
//  Created by mac on 16/10/21.
//
//

#import "CLLocationManager+Extension.h"
#define LATEST_LAT @"latest_lat"
#define LATEST_LNG @"latest_lng"
    #import <UIKit/UIKit.h>
#import <AMapFoundationKit/AMapFoundationKit.h>
static CLLocationManager *locationManager;
static CLLocationCoordinate2D latestLocation;
static CLLocationCoordinate2D latestCarLocation;
static updateLocationSucess updateSucceed;
static updateLocationFailure updateFailure;

@interface LocateDelegate : NSObject<CLLocationManagerDelegate>


@end


@implementation LocateDelegate

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations{
    CLLocation *currentLoc = [locations lastObject];
    latestLocation = currentLoc.coordinate;
    if (updateSucceed) {
        updateSucceed(currentLoc.coordinate);
    }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error{
    if (updateFailure) {
        updateFailure(error);
    }
}


@end

static LocateDelegate *locateDelegate;

@implementation CLLocationManager (Extension)

#pragma mark --- Public Methods

+ (BOOL)checkLocationServiceStatus{
    
    if ([self CheckAppAuthorization] && [self CheckLocationServiceStatus]) {
        return YES;
    }else{
        return NO;
    }
}


+ (BOOL)checkLocationServiceStatusWithAlert{
    
    if (![self CheckLocationServiceStatus]) {
        [self showSystemAuthorizationAlert];
        return NO;
    }else if (![self CheckAppAuthorization]){
        [self showAppAuthorizationAlert];
        return NO;
    }else{
        return YES;
    }
}


/**
 检查该App是否被禁用定位
 */
+ (BOOL)CheckLocationServiceStatus{
    if (![CLLocationManager locationServicesEnabled]) {
        return NO;
    }else{
        return YES;
    }
}

/**
 检查系统定位是否被禁用
 */
+ (BOOL)CheckAppAuthorization{
    
    if ([CLLocationManager authorizationStatus] == kCLAuthorizationStatusDenied) {
        return NO;
    }else{
        return YES;
    }
}

+ (CLLocationCoordinate2D)lastUserLocation{
    if (latestLocation.latitude == 0) {
        NSLog(@"GPS定位失败，将获取上次保存的坐标");
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        latestLocation.latitude = [defaults doubleForKey:LATEST_LAT];
        latestLocation.longitude = [defaults doubleForKey:LATEST_LNG];
        
    }
    return latestLocation;
}

+ (BOOL)saveUserLocation:(CLLocationCoordinate2D)loc{
    NSUserDefaults *defaulsts = [NSUserDefaults standardUserDefaults];
    if (loc.latitude == 0) {
        return NO;
    }
    [defaulsts setDouble:loc.latitude forKey:LATEST_LAT];
    [defaulsts setDouble:loc.longitude forKey:LATEST_LNG];
    
    NSLog(@"latitude------%f    longitude--------%f",loc.latitude,loc.longitude);
    return YES;
}

+ (void)startLocationsucess:(updateLocationSucess)sucess failed:(updateLocationFailure)failure{
    if (!locationManager) {
        locateDelegate = [[LocateDelegate alloc]init];
        locationManager = [[CLLocationManager alloc]init];
        locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        locationManager.distanceFilter = 10;
        locationManager.delegate = locateDelegate;
        [locationManager requestAlwaysAuthorization];
    }
    if (sucess) {
        updateSucceed = sucess;
    }
    if (failure) {
        updateFailure = failure;
    }
    [locationManager startUpdatingLocation];
}

+ (void)stopLocation{
    [locationManager stopUpdatingLocation];
    [self saveUserLocation:latestLocation];
}

+ (CLLocationCoordinate2D)tranferGPSToAMap:(CLLocationCoordinate2D)originCoordinate{
    return AMapCoordinateConvert(originCoordinate, AMapCoordinateTypeGPS);
}

+ (CLLocationCoordinate2D)tranferBaiduToAMap:(CLLocationCoordinate2D)originCoordinate{
    return AMapCoordinateConvert(originCoordinate, AMapCoordinateTypeBaidu);
}

double transformLat(double x,double y){
    double ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * sqrt(fabs(x));
    ret += (20.0 * sin(6.0 * x * M_PI) + 20.0 * sin(2.0 * x * M_PI)) * 2.0 / 3.0;
    ret += (20.0 * sin(y * M_PI) + 40.0 * sin(y / 3.0 * M_PI)) * 2.0 / 3.0;
    ret += (160.0 * sin(y / 12.0 * M_PI) + 320 * sin(y * M_PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

double transformLng(double x,double y){
    double ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * sqrt(fabs(x));
    ret += (20.0 * sin(6.0 * x * M_PI) + 20.0 * sin(2.0 * x * M_PI)) * 2.0 / 3.0;
    ret += (20.0 * sin(x * M_PI) + 40.0 * sin(x / 3.0 * M_PI)) * 2.0 / 3.0;
    ret += (150.0 * sin(x / 12.0 * M_PI) + 300.0 * sin(x / 30.0 * M_PI)) * 2.0 / 3.0;
    return ret;
}

+ (CLLocationCoordinate2D)convertAMapToGPS:(CLLocationCoordinate2D)originCoordinate{
    double lat = originCoordinate.latitude;
    double lng = originCoordinate.longitude;
    
    double a = 6378245.0;
    double ee = 0.00669342162296594323;
    
    double dLat = transformLat(lng - 105.0, lat - 35.0);
    double dLon = transformLng(lng - 105.0, lat - 35.0);
    
    double radLat = lat / 180.0 * M_PI;
    double magic = sin(radLat);
    magic = 1 - ee * magic * magic;
    double sqrtMagic = sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * M_PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * cos(radLat) * M_PI);
    
    CLLocationCoordinate2D GPSCoor = CLLocationCoordinate2DMake(lat - dLat, lng - dLon);
    
    return GPSCoor;
}


+ (void)saveLatestCarLocation:(CLLocationCoordinate2D)location{
    latestCarLocation = location;
}

+ (CLLocationCoordinate2D)lastCarLocaiton{
    return latestCarLocation;
}

#pragma mark -- Private Methods

/**
 App被禁用定位，弹出提示框
 */
+ (void)showAppAuthorizationAlert{
    UIAlertController *alertVC = [UIAlertController alertControllerWithTitle:@"定位失败" message:@"请在设置中打开定位功能" preferredStyle:UIAlertControllerStyleAlert];
    
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
        
        UIAlertAction *setting = [UIAlertAction actionWithTitle:@"去设置" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
        }];
        
        [alertVC addAction:setting];
        
    }
//    else{
//
//        UIAlertAction *setting = [UIAlertAction actionWithTitle:@"去设置" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
//            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"prefs:root=LOCATION_SERVICES"]];
//        }];
//
//        [alertVC addAction:setting];
//
//
//    }
    UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:nil];
    [alertVC addAction:cancel];
    
    
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:alertVC animated:YES completion:nil];
    
}



/**
 系统定位服务被禁用，弹出提示框
 */
+ (void)showSystemAuthorizationAlert{
    UIAlertController *alertVC = [UIAlertController alertControllerWithTitle:@"定位服务被禁用" message:@"请在设置->隐私中启用系统定位服务" preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleDefault handler:nil];
    
    [alertVC addAction:cancel];
    
    

    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:alertVC animated:YES completion:nil];
    
}


@end
