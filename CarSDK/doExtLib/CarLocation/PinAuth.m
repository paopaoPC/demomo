//
//  PinAuth.m
//  chameleon
//
//  Created by 傅祚鹏 on 2017/3/23.
//
//

#import "PinAuth.h"
#import "PinView.h"
#import "AuthCodeView.h"
#import "SVProgressHUD.h"
//#import "AppDelegate.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
#import "NSString+Extension.h"
#import "M0038_CarNetMap_App.h"
@class PinAuther;

static PinView *_pinView;
static AuthCodeView *_imageAuth;
static PinAuther * _pinAuther;

@interface PinAuther : NSObject<PinViewDelegate,AuthCodeViewDelegate>

@property (nonatomic, strong)NSMutableDictionary *params;

@property (nonatomic, copy)NSString *JSFunctionName;

@end

@implementation PinAuther


#pragma mark -- PinViewDelegate

- (void)didClickConfirmOnPinView:(PinView *)pinView inputPinCode:(NSString *)PinCode{
    if (self.JSFunctionName && ![_JSFunctionName isEqualToString:@""]) {
        [_params setObject:PinCode forKey:@"pin"];
        
        NSData *data = [NSJSONSerialization dataWithJSONObject:_params options:NSJSONWritingPrettyPrinted error:nil];
        NSString *JSON = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
        
        NSString *JSStr = [NSString stringWithFormat:@"%@(%@)",_JSFunctionName,JSON];
        //发起js请求
        [[DoEventManager shared] javaScriptCallMethod:JSStr];
        [SVProgressHUD show];
    }
    _pinView = nil;
}

- (void)didClickCancelOnPinView:(PinView *)pinView{
    _pinView = nil;
}


#pragma mark -- AuthCodeViewDelegate

- (void)didClickConfirmOnAuthCodeView:(AuthCodeView *)authCodeView inputAuthCode:(NSString *)code{
    [SVProgressHUD showWithStatus:@"正在验证短信验证码"];
}

- (void)didClickCancelOnAuthCodeView:(AuthCodeView *)authCodeView{
    
}


- (void)didClickGetAuthCode:(AuthCodeView *)authCodeView inputedImageAuthCode:(NSString *)code imageId:(NSString *)imageId{
    
}

@end

@implementation PinAuth

+ (void)initialize{
    [super initialize];
    _pinAuther = [[PinAuther alloc]init];
}

+ (void)startPinAuthentication:(NSDictionary *)paramter{
    if (!paramter) {
        return;
    }
    
    _pinAuther.params = [[NSMutableDictionary alloc]initWithDictionary:paramter];
    
    NSData *data = [NSJSONSerialization dataWithJSONObject:paramter options:NSJSONWritingPrettyPrinted error:nil];
    NSString *JSON = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    
    NSString *js = [NSString stringWithFormat:@"RemoteControlFunc(%@)",JSON];
    [[DoEventManager shared] javaScriptCallMethod:js];
    [SVProgressHUD show];
}


+ (void)showPinInputViewWithJSFunctionName:(NSString *)functionName{
    
    [SVProgressHUD dismiss];
    
    if (!functionName || [functionName isEqualToString:@""]) {
        return;
    }
    
    _pinAuther.JSFunctionName = functionName;
    
    if (!_pinView) {
        _pinView = [[PinView alloc]init];
        _pinView.center = CGPointMake(SCREEN_W/2, SCREEN_W*3/4);
    }
    [[UIApplication sharedApplication].keyWindow addSubview:_pinView];
    [_pinView startInputPinCode];
    _pinView.delegete = _pinAuther;
}

+ (AuthCodeView *)extracted {
    return [[AuthCodeView alloc]initWithRequestImageAuthCodeHandler:^{
        [[DoEventManager shared] javaScriptCallMethod:@"getImageCode"];
    }];
}

+ (void)showImageAuthView{
    
    [SVProgressHUD dismiss];
    
    if (!_imageAuth) {
        _imageAuth = [self extracted];
        _imageAuth.center = CGPointMake(SCREEN_W/2, SCREEN_H*3/4);
    }
    [[UIApplication sharedApplication].keyWindow addSubview:_imageAuth];
    [_imageAuth startInputAuthViewCode];
    _imageAuth.delegete = _pinAuther;
}


+ (void)updateAuthImage:(NSDictionary *)imageInfo{
    NSString *imageId = imageInfo[@"imageId"];
    NSString *imageCode = imageInfo[@"imageCode"];
    
    NSData *imageData = [[NSData alloc]initWithBase64EncodedString:imageCode options:NSDataBase64DecodingIgnoreUnknownCharacters];
    
    UIImage *image = [UIImage imageWithData:imageData];
    
    [_imageAuth setAuthCodeImage:image forImageId:imageId];
}

+ (void)startCountDown{
    [_imageAuth startCountDown];
}
@end
