//
//  M0038_CarNetMap_SM.m
//
//  Created by @AppWorker on @2018/4/11.
//  Copyright (c) 2018年 AppWorker. All rights reserved.
//
#import "BaiduMapViewController.h"
#import "M0038_CarNetMap_SM.h"
#import "CarLocationViewController.h"
#import "M0038_CarNetMap_App.h"
#import "SVProgressHUD.h"
#import "DotCDictionaryWrapper.h"
#import "DrivingRouteViewController.h"
#import "RSA.h"
#import "PinAuth.h"
#import "EfenceDataModel.h"
//#import "AFNetworking.h"
//#import "ZipArchive.h"

#import <AMapFoundationKit/AMapFoundationKit.h>
#define psdPublicKey  @"-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCUYcZzlJ0dhaAQ2PKnBCazHFQXgBaVvzJ6ApY5JsmiRs5oJihg9tQE8khmyrcaQN7xyBcR8c8sJm+aNMOldY3YztMj9ePi16sCY4U56eDwgtrov5idsu0EjKQNMe2oc1YSflUMfGChJ11qtYXFgzf5NCISs69brNSM+z76TE83BwIDAQAB\n-----END PUBLIC KEY-----"
#define pinPublicKey  @"-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFbuHbViS9FGuXsW7poi1zltbChRdI45uO4D13NS+JTQADqR85MnhberTgeG8E/dvid6IRojS7jsrinNIozYtnVB2qlIPQbn/S76CVW9EzBlm/Afm0TJofLhyG1SBk+EkdCTuGtAQzb34J7ClGUQR/kJ7gaoS6Hnz2AJeyMZL3yQIDAQAB\n-----END PUBLIC KEY-----"
@interface M0038_CarNetMap_SM()
@property(nonatomic,strong) CarLocationViewController *carLocationVC;
@property(nonatomic,strong) DrivingRouteViewController *dvc;
@property(nonatomic,assign) BOOL         isChexinSdkOk;
@end

@implementation M0038_CarNetMap_SM

static M0038_CarNetMap_SM *manager;
static dispatch_once_t once;

+ (M0038_CarNetMap_SM *)shared {
    dispatch_once(&once, ^{
        manager = [[M0038_CarNetMap_SM alloc] init];
    });
    return manager;
}

#pragma mark - 注册属性（--属性定义--）

-(void)dealloc{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - M0038_CarNetMap_ISM协议方法（必须）
#pragma mark - 同步方法

- (void)startCuntDown:(NSArray *)parms{
    dispatch_async(dispatch_get_main_queue(), ^{
        [PinAuth startCountDown];
    });
}

- (NSString *)RSA:(NSString *)parms {
//    NSDictionary *dictParas = [self stringToJson:parms];
//    NSLog(@"TORSA------%@",parms);
    NSString *rsa = [RSA encryptString:parms/*dictParas[@"str"]*/ publicKey:pinPublicKey];
//    NSLog(@"RSA--------%@",rsa);
    return rsa;
}

- (NSString *)getMemory
{
    int64_t totalMemory = [[NSProcessInfo processInfo] physicalMemory];
    if (totalMemory < -1) totalMemory = -1;
    return [NSString stringWithFormat:@"%f",(CGFloat)totalMemory];
}

- (NSString *)getCpuInfo
{
    return [NSString stringWithFormat:@"%lu",(unsigned long)[NSProcessInfo processInfo].activeProcessorCount];
}

- (NSDictionary *)getVersion;
{
    NSString *build = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
    NSString *code = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    NSString *ver = @"com.changan.oushangCos1";
    NSMutableDictionary *version = [NSMutableDictionary dictionary];
    [version setValue:code forKey:@"code"];
    [version setValue:build forKey:@"build"];
    [version setValue:ver forKey:@"ver"];
    return [version copy];
}

- (NSDictionary *)getInfo
{
    NSString *deviceId = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    NSString *deviceName = [UIDevice currentDevice].name;
    NSString *os = [UIDevice currentDevice].systemName;
    NSString *osversion = [UIDevice currentDevice].systemVersion;
    
    NSMutableDictionary *infoData = [NSMutableDictionary dictionary];
    [infoData setValue:deviceId forKey:@"deviceId"];
    [infoData setValue:os forKey:@"OS"];
    [infoData setValue:osversion forKey:@"OSVersion"];
    [infoData setValue:deviceName forKey:@"deviceName"];
    [infoData setValue:[NSNumber numberWithFloat:[UIScreen mainScreen].bounds.size.width] forKey:@"screenH"];
    [infoData setValue:osversion forKey:@"sdkVersion"];
    [infoData setValue:@"iPhone X" forKey:@"phoneType"];
    
    return [infoData copy];
}

- (void)setAMapKey {
//    NSLog(@"webView设置AMapServices -- key:%@",self.amapKey);
//    [AMapServices sharedServices].apiKey = self.amapKey;
}

- (void)setAMapKey:(NSString *)apikey {
    /// didFinishLaunchingWithOptions 中必须实现此方法
    NSLog(@"手动默认设置AMapServices -- key:%@",apikey);
    [AMapServices sharedServices].apiKey = apikey;
}

- (void)oneTrajectoryData:(NSString *)parms {
    NSDictionary *dictParas = [self stringToJson:parms];
    UIViewController* controller = [self.dvc navigationController].topViewController;
    if(![controller isKindOfClass:[DrivingRouteViewController class]]) { return; }
    
    int indxe = [dictParas[@"index"] intValue];
    NSString* carDevice = dictParas[@"carDevice"];
    dispatch_async(dispatch_get_main_queue(), ^{
        DotCDictionaryWrapper*  data = [DotCDictionaryWrapper wrapperFromDictionary:dictParas[@"data"]];
        self.dvc.carDevice = carDevice;
        [self.dvc updateItemData:data at:indxe];
    });
}
- (void)openDrivingTrajectory:(NSString *)parms {
    NSDictionary *dictParas = [self stringToJson:parms];
    NSArray *list = dictParas[@"list"];
    DotCWDictionaryWrapper* data = [[DotCWDictionaryWrapper alloc] init];
    [data set:@"cur" value:[NSString stringWithFormat:@"%@",dictParas[@"cur"]]];
    NSMutableArray *newList = @[].mutableCopy;
    for(NSInteger i = 0, i_sz = list.count; i < i_sz; ++i) {
        [newList addObject:[list[i] objectForKey:@"drivingHistoryId"]];
    }
    [data set:@"list" value:newList];
    
    if (!self.dvc) {
        DrivingRouteViewController* controller = [[DrivingRouteViewController alloc] initWithData:data];
        self.dvc = controller;
    }
    UINavigationController *na = [[UINavigationController alloc] initWithRootViewController:self.dvc];
    [na setNavigationBarHidden:YES animated:YES];
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:na animated:YES completion:nil];
    
    //自己的代码实现
}
- (void)getEfenceDataModel:(NSString *)parms {
    NSDictionary *dictParas = [self stringToJson:parms];
    UIViewController* controller = self.carLocationVC.navigationController.topViewController;
    if(![controller isKindOfClass:[CarLocationViewController class]]) { return; }
    dispatch_async(dispatch_get_main_queue(), ^{
        [((CarLocationViewController*)controller) getEfenceDataModel:dictParas];
    });
}

- (void)showStatus:(NSString *)status :(NSString *)text {
    //自己的代码实现
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([status isEqualToString:@"success"]) {
            [SVProgressHUD showSuccessWithStatus:text];
        }else if ([status isEqualToString:@"error"]){
            [SVProgressHUD showErrorWithStatus:text];
        }else{
            [SVProgressHUD showImage:[UIImage new] status:status];
        }
    });
}


- (void)openCarLocationView:(NSString *)parms {
    // 不知道用来做什么
    //    BOOL showControl = [parms boolValue];
    if (!self.carLocationVC) {
        CarLocationViewController *vc  = [[CarLocationViewController alloc] init];
        self.carLocationVC  = vc;
    }
    UINavigationController *na = [[UINavigationController alloc] initWithRootViewController:self.carLocationVC];
    [na setNavigationBarHidden:YES animated:YES];
    [UIApplication sharedApplication].statusBarStyle = UIStatusBarStyleDefault;
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:na animated:YES completion:nil];
}
- (void)showCarLocationViewLoading {
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC showLoading];
        });
    }
}
- (void)stopCarLocationViewLoading {
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC stopLoading];
        });
    }
}
- (void)getCarError {
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC getCarError];
        });
    }
}
- (void)updateImageCode:(NSString *)parms {
    NSDictionary *dictParas = [self stringToJson:parms];
    dispatch_async(dispatch_get_main_queue(), ^{
        [PinAuth updateAuthImage:dictParas];
    });
}
- (void)refreshLocation:(NSString *)parms {
    NSDictionary *dictParas = [self stringToJson:parms];
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC refreshLocation:dictParas];
        });
    }
}
- (void)showPinInput:(NSString *)parms {
    dispatch_async(dispatch_get_main_queue(), ^{
        [PinAuth showPinInputViewWithJSFunctionName:parms];
    });
}
- (void)showAuthCodeView{
    dispatch_async(dispatch_get_main_queue(), ^{
        [PinAuth showImageAuthView];
    });
}
- (void)updateCarState:(NSString *)parms {
    
    NSDictionary *dictParas = [self stringToJson:parms];
    
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC updateCarState:dictParas];
        });
        
    }
}
- (void)getEfenceList:(NSString *)parms{
    NSArray *dictParas = [self stringToJson:parms];
    if (self.carLocationVC) {
        NSMutableArray *fences = [NSMutableArray array];
        if (![dictParas isKindOfClass:[NSNull class]]) {
            
            for (NSDictionary *fencedata in dictParas) {
                EfenceDataModel *model = [EfenceDataModel generateDataModelWithData:fencedata];
                [fences addObject:model];
            }
        }
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC getEfenceList:fences];
        });
    }
}
- (void)getAuthCode {
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC getAuthCode];
        });
    }
}
- (void)fenceFirstSaved:(NSString *)parms {
    if (self.carLocationVC) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.carLocationVC fenceFirstSaved:parms];
        });
    }
}

//- (void)downloadP:(NSString *)url :(NSString *)path :(NSString *)call {
//    NSLog(@"准备开始下载：%@-----%@-----%@",url,path,call);
//
//    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
//    configuration.timeoutIntervalForRequest = 500;
//    AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:configuration];
//    NSURLRequest *request = [[AFHTTPRequestSerializer serializer] requestWithMethod:@"GET" URLString:url parameters:nil error:nil];
//
//    NSURLSessionDownloadTask *downloadTask = [manager downloadTaskWithRequest:request progress:^(NSProgress *downloadProgress){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            CGFloat progress = (CGFloat)downloadProgress.completedUnitCount / (CGFloat)downloadProgress.totalUnitCount;
//            NSString *js = [NSString stringWithFormat:@"%@('%.2f')",call,progress];
//            [[DoEventManager shared] javaScriptCallMethod:js];
//        });
//    } destination:^NSURL *(NSURL *targetPath, NSURLResponse *response) {
//        NSString *tpath = [path componentsSeparatedByString:@"://"].lastObject;
//        NSString *cachesPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
//        NSString *path = [cachesPath stringByAppendingPathComponent:[NSString stringWithFormat:@"%@/%@",tpath,response.suggestedFilename]];
//        NSURL *filePath = [NSURL fileURLWithPath:path];
//        NSLog(@"保存文件路径：-------- %@   文件地址-------%@",path,filePath);
//        return filePath;
//
//    } completionHandler:^(NSURLResponse *response, NSURL *filePath, NSError *error) {
//        NSLog(@"下载完成：error:%@ ------- filePath:%@",error.description,filePath);
//        if (!error) {
//            NSString *pathString = [filePath path];
//            NSString *tpath = [path componentsSeparatedByString:@"://"].lastObject;
//            NSString *cachesPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
//            NSString *savePath = [cachesPath stringByAppendingPathComponent:tpath];
//
//            dispatch_async(dispatch_get_main_queue(), ^{
//                /// 解压
//                /*BOOL result = */[SSZipArchive unzipFileAtPath:pathString toDestination:savePath];
//                NSLog(@"解压成功");
//                NSString *js = [NSString stringWithFormat:@"%@()",call];
//                [[DoEventManager shared] javaScriptCallMethod:js];
//
////                NSLog(@"开始解压zip文件路径：%@ ------ 输出目录：%@",pathString,savePath);
////                if (result) {
////                    NSLog(@"解压成功");
////                    NSString *js = [NSString stringWithFormat:@"%@('%@')",call,nil];
////                    [[DoEventManager shared] javaScriptCallMethod:js];
////                } else {
////                    NSLog(@"解压失败1");
////                    NSString *js = [NSString stringWithFormat:@"%@('%@')",call,@"error"];
////                    [[DoEventManager shared] javaScriptCallMethod:js];
////                }
//            });
//        } else {
//            NSLog(@"下载失败1");
//            NSString *js = [NSString stringWithFormat:@"%@('%@')",call,@"error"];
//            [[DoEventManager shared] javaScriptCallMethod:js];
//        }
//    }];
//
//    [downloadTask resume];
//}

- (id)stringToJson:(NSString *)content
{
    NSData *jsonData = [content dataUsingEncoding:NSUTF8StringEncoding];
    id object = [NSJSONSerialization JSONObjectWithData:[[NSData alloc]
                                                         initWithData:jsonData]
                                                options:NSJSONReadingMutableContainers
                                                  error:nil];
    
    return object;
}

#pragma mark - 异步方法





@end
