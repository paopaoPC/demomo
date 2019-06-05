//
//  PinView.m
//  chameleon
//
//  Created by mac on 16/10/18.
//
//

#import "PinView.h"
#import "UIView+Extension.h"
#import "SVProgressHUD.h"
#import "BundleTools.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
//#import "AppDelegate.h"
@interface PinView()<UITextFieldDelegate>

@property (weak, nonatomic) IBOutlet UITextField *pinCodeField;
@property (strong,nonatomic)UIView *mask;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img1;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img2;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img3;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img4;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img5;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img6;

@end

static int DOT_ID_BEG   = 110;
static int DOT_ID_SIZE  = 6;

@implementation PinView

- (instancetype)init{
    NSArray *nib = [[ BundleTools getBundle]loadNibNamed:@"PinView" owner:self options:nil];
    self = [nib objectAtIndex:0];
    if (self) {
        CGRect frame;
        
        frame.size.width = 303;
        frame.size.height = 174;
        self.frame = frame;
        UIView* v = nil;
        NSArray *arr = @[_img1,_img2,_img3,_img4,_img5,_img6];
        for (UIImageView *img in arr) {
             [img setImage:[BundleTools imageNamed:@"dot"]];
        }
        for(int i = DOT_ID_BEG, i_sz = DOT_ID_BEG+DOT_ID_SIZE; i<i_sz; ++i)
        {
            v = [self viewWithTag:i];
            v.hidden = true;
        }
        [self registerForKeyboardNotifications];
        
        
    }
    return self;
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

- (void)startInputPinCode{
    _pinCodeField.text = @"";
    [_pinCodeField becomeFirstResponder];
    [_pinCodeField addTarget:self action:@selector(textFieldDidChange:) forControlEvents:UIControlEventEditingChanged];
    _pinCodeField.delegate = self;
    [self activateMask];
    
}

- (IBAction)confirm:(id)sender {
    if (_pinCodeField.text.length < 6) {
        [SVProgressHUD showErrorWithStatus:@"请输入六位控车码"];
        return;
    }
    
    if (self.delegete && [self.delegete respondsToSelector:@selector(didClickConfirmOnPinView:inputPinCode:)]) {
        
        [self.delegete didClickConfirmOnPinView:self inputPinCode:_pinCodeField.text];
        
    }
    
    [self dismiss];
}

- (IBAction)cancel:(id)sender {
    
    if (self.delegete && [self.delegete respondsToSelector:@selector(didClickCancelOnPinView:)]) {
        
        [self.delegete didClickCancelOnPinView:self];
        
    }
    [self dismiss];
}

- (void)dismiss{
    [_pinCodeField endEditing:YES];
    self.delegete = nil;
    [self deactivateMask];
    [self removeFromSuperview];
}

- (void) textFieldDidChange:(id) textField
{
    NSLog(@"------------");
    UIView* v = nil;
    for(int i = DOT_ID_BEG, i_sz = DOT_ID_BEG+DOT_ID_SIZE, j=0; i<i_sz; ++i, ++j)
    {
        v = [self viewWithTag:i];
        v.hidden = j>=_pinCodeField.text.length;
    }
}

- (void)activateMask{
    _mask = [[UIView alloc]initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height)];
    [self.superview insertSubview:_mask belowSubview:self];
    
}

- (void)deactivateMask{
    [_mask removeFromSuperview];
}

- (void)dealloc{
    [self resignForKeyboardNotifications];
}
#pragma mark - UITextFieldDelegate

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
