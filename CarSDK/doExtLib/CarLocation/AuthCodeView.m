//
//  AuthCodeView.m
//  chameleon
//
//  Created by mac on 16/10/18.
//
//
#import "BundleTools.h"
#import "AuthCodeView.h"
#import "UIView+Extension.h"
#import "SVProgressHUD.h"
#import "M0038_CarNetMap_App.h"
#define MAXCOUNT 60
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface AuthCodeView()<UITextFieldDelegate>

@property (copy, nonatomic) AuthCodeViewBlock requestImageAuthCodeBlock;
@property (strong,nonatomic)UIView *mask;

@property (weak, nonatomic) IBOutlet UIButton *sendAuthCodeBtn;
@property (weak, nonatomic) IBOutlet UITextField *authCodeField;
@property (weak, nonatomic) IBOutlet UITextField *imageAuthCodeField;
@property (weak, nonatomic) IBOutlet UIImageView *imageAuthCode;
@property (strong, nonatomic)UITapGestureRecognizer *tapGesture;

@property (nonatomic, copy)NSString *currentImageId;

@property (strong, nonatomic)NSTimer *timer;
@property (assign, nonatomic)int count;

@end

@implementation AuthCodeView

- (instancetype)initWithRequestImageAuthCodeHandler:(AuthCodeViewBlock)handler{
    NSArray *nib = [[BundleTools getBundle]loadNibNamed:@"AuthCodeView" owner:self options:nil];
    self = [nib objectAtIndex:0];
    if (self) {
        if (handler) {
            self.requestImageAuthCodeBlock = handler;
        }
        CGRect frame;
        frame.size.width = 303;
        frame.size.height = 174;
        self.frame = frame;
        self.count = MAXCOUNT;
        self.tapGesture = [[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(reRequestImageAuthCode)];
        self.imageAuthCode.userInteractionEnabled = YES;
        [self.imageAuthCode addGestureRecognizer:self.tapGesture];
        [self registerForKeyboardNotifications];
    }
    return self;
}

- (IBAction)sendAuthCodeBtnClicked:(id)sender {
    if (_imageAuthCodeField.text && ![_imageAuthCodeField.text isEqualToString:@""]) {
        //传递参数 code和imageId，调用JS向手机发送验证码，等待发送回调
        NSString *js = [NSString stringWithFormat:@"sentCode('%@','%@')",_imageAuthCodeField.text,_currentImageId];
        [[DoEventManager shared] javaScriptCallMethod:js];
    }else{
        [SVProgressHUD showErrorWithStatus:@"请先输入图片验证码"];
    }
    
    if (self.delegete && [self.delegete respondsToSelector:@selector(didClickGetAuthCode:inputedImageAuthCode:imageId:)]) {
        [self.delegete didClickGetAuthCode:self inputedImageAuthCode:_imageAuthCodeField.text imageId:_currentImageId];
    }
}

- (IBAction)confirm:(id)sender {
    
    if (_authCodeField.text.length < 6) {
        [SVProgressHUD showErrorWithStatus:@"请输入六位手机验证码"];
        return;
    }
    NSString *js = [NSString stringWithFormat:@"controlAuthMethod('%@')",_authCodeField.text];
    [[DoEventManager shared] javaScriptCallMethod:js];
    [self dismiss];
    
    if (self.delegete && [self.delegete respondsToSelector:@selector(didClickConfirmOnAuthCodeView:inputAuthCode:)]) {
        [self.delegete didClickConfirmOnAuthCodeView:self inputAuthCode:_authCodeField.text];
    }
}

- (IBAction)cancel:(id)sender {
    if (self.delegete && [self.delegete respondsToSelector:@selector(didClickCancelOnAuthCodeView:)]) {
        [self.delegete didClickCancelOnAuthCodeView:self];
    }
    [self dismiss];
}

- (void)dismiss{
    [_authCodeField endEditing:YES];
    [_imageAuthCodeField endEditing:YES];
    _authCodeField.text = @"";
    _imageAuthCodeField.text = @"";
    self.delegete = nil;
    [self deactivateMask];
    [self removeFromSuperview];
}

- (void)startInputAuthViewCode{
    _authCodeField.text = @"";
    [_imageAuthCodeField becomeFirstResponder];
    _authCodeField.delegate = self;
    [self activateMask];
    _imageAuthCode.image = [BundleTools imageNamed:@"image_error"];
    [[DoEventManager shared] javaScriptCallMethod:@"getImageCode"];
}

- (void)reRequestImageAuthCode{
    
    self.requestImageAuthCodeBlock();
    
}

- (void)setAuthCodeImage:(UIImage *)image forImageId:(NSString *)imageId{
    if (image) {
        _imageAuthCode.image = image;
        self.currentImageId = imageId;
    }else{
        _imageAuthCode.image = [BundleTools imageNamed:@"image_error"];
    }
}


- (void)startCountDown{
    _sendAuthCodeBtn.userInteractionEnabled = NO;
    _sendAuthCodeBtn.alpha = 0.5;
    if (_timer == nil) {
        _timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(oneSecBeat) userInfo:nil repeats:YES];
        [_authCodeField becomeFirstResponder];
    }
}

- (void)oneSecBeat{
    if (_count == 0) {
        _sendAuthCodeBtn.alpha = 1;
        _sendAuthCodeBtn.userInteractionEnabled = YES;
        _sendAuthCodeBtn.titleLabel.text = @"重新发送";
        [_sendAuthCodeBtn setTitle:@"重新发送" forState:UIControlStateNormal];
        [_sendAuthCodeBtn setBackgroundColor:[UIColor colorWithRed:0.000 green:0.714 blue:0.976 alpha:1.000]];
        [_timer invalidate];
        _timer = nil;
        _count = MAXCOUNT;
        return;
    }
    _sendAuthCodeBtn.titleLabel.text = [NSString stringWithFormat:@"%ds",_count];
    [_sendAuthCodeBtn setTitle:[NSString stringWithFormat:@"%ds",_count] forState:UIControlStateNormal];
    _sendAuthCodeBtn.titleLabel.textColor = [UIColor whiteColor];
    [_sendAuthCodeBtn setBackgroundColor:[UIColor colorWithWhite:0.706 alpha:1.000]];
    _count -= 1;
    
}

- (void)activateMask{
    _mask = [[UIView alloc]initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height)];
    [self.superview insertSubview:_mask belowSubview:self];
    
}

- (void)deactivateMask{
    [_mask removeFromSuperview];
}

- (void)registerForKeyboardNotifications{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardDidShow:) name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHide:) name:UIKeyboardWillHideNotification object:nil];
}

- (void)resignForKeyboardNotifications{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillHideNotification object:nil];
}

- (void)keyboardDidShow:(NSNotification*)aNotification{
    NSDictionary* info = [aNotification userInfo];
    CGSize kbSize = [[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue].size;
    CGFloat kbHeight = kbSize.height;
    if (CGRectGetMaxY(self.frame) > SCREEN_H - kbHeight) {
        [UIView animateWithDuration:0.5 animations:^{
            self.y -= (CGRectGetMaxY(self.frame) - (SCREEN_H - kbHeight) + 10);
        }];
    }
}

- (void)keyboardWillHide:(NSNotification*)aNotification{
    
    
}

- (void)dealloc{
    [self resignForKeyboardNotifications];
}
#pragma mark --- UITextFieldDelegate

- (BOOL)textField:(UITextField *) textField shouldChangeCharactersInRange:(NSRange)range replacementString:
(NSString *)string {
    if(range.length + range.location > textField.text.length)
    {
        return false;
    }
    
    NSUInteger newLength = [textField.text length] + [string length] - range.length;
    return newLength <= 6;
}

@end
