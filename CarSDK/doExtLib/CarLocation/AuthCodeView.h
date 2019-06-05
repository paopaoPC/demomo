//
//  AuthCodeView.h
//  chameleon
//
//  Created by mac on 16/10/18.
//
//

#import <UIKit/UIKit.h>
typedef void(^AuthCodeViewBlock)();
@class AuthCodeView;

@protocol AuthCodeViewDelegate <NSObject>

@optional

- (void)didClickConfirmOnAuthCodeView:(AuthCodeView *)authCodeView inputAuthCode:(NSString *)code;

- (void)didClickCancelOnAuthCodeView:(AuthCodeView *)authCodeView;


- (void)didClickGetAuthCode:(AuthCodeView *)authCodeView inputedImageAuthCode:(NSString *)code imageId:(NSString *)imageId;


@end

@interface AuthCodeView : UIView

@property (nonatomic,assign)id<AuthCodeViewDelegate> delegete;

- (instancetype)initWithRequestImageAuthCodeHandler:(AuthCodeViewBlock)handler;

- (void)startInputAuthViewCode;

- (void)setAuthCodeImage:(UIImage *)image forImageId:(NSString *)imageId;

- (void)startCountDown;

- (void)dismiss;
@end
