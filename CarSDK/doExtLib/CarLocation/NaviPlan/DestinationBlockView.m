//
//  DestinationBlockView.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/25.
//
//

#import "DestinationBlockView.h"
#import "UIView+Extension.h"
#import "PinView.h"
#import "AuthCodeView.h"
#import "BundleTools.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface DestinationBlockView()

@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img2;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img3;

@property (assign, nonatomic)id<DestinationBlockViewDelegate>delegate;

@property (weak, nonatomic) IBOutlet UILabel *nameLable;
@property (weak, nonatomic) IBOutlet UILabel *addressLabel;

@property (weak, nonatomic) IBOutlet UILabel *buttonTextLabel_1;
@property (weak, nonatomic) IBOutlet UILabel *buttonTextLabel_2;
@property (weak, nonatomic) IBOutlet UILabel *buttonTextLabel_3;

@property (weak, nonatomic) IBOutlet UIImageView *buttonIcon_1;


@end


@implementation DestinationBlockView

#pragma mark --- Init Methods

- (instancetype)initWithDelegate:(id<DestinationBlockViewDelegate>)delegate{
    self = [[[BundleTools getBundle] loadNibNamed:@"DestinationBlockView" owner:nil options:nil] firstObject];
    if (self) {
        self.delegate = delegate;
        self.width = SCREEN_W;
        self.height *= factor_h;
        self.x = 0;
        self.y = SCREEN_H - self.height;
//        [_buttonIcon_1 setImage: [UIImage imageNamed:@"oil"]];
        [self.buttonIcon_1 setImage:[BundleTools imageNamed:@"收藏"]];
        [self.img2 setImage:[BundleTools imageNamed:@"gothere"]];
        [self.img3 setImage:[BundleTools imageNamed:@"icon_sendtocar.png"]];
        [self resetFont:self.nameLable];
        [self resetFont:self.addressLabel];
        [self resetFont:_buttonTextLabel_1];
        [self resetFont:_buttonTextLabel_2];
        [self resetFont:_buttonTextLabel_3];
        [self setShadowForColor:[UIColor grayColor] offset:CGSizeMake(0, 0) opacity:0.8 radius:2];
    }
    return self;
}

#pragma mark --- Publick Mthods

- (void)setDisplayedName:(NSString *)name{
    
    _nameLable.text = name;
}

- (void)setDisplayedAddress:(NSString *)address{
    
    _addressLabel.text = address;
}

- (void)setDisplayedIsFavorite:(BOOL)isFavorite {
    if(isFavorite){
        _buttonTextLabel_1.text = @"已收藏";
    } else {
        _buttonTextLabel_1.text = @"收藏";
    }
}

#pragma mark --- Private Methods

- (void)resetFont:(UILabel *)label{
    label.font = [UIFont systemFontOfSize:label.font.pointSize*factor_h];
}

#pragma mark --- Events 

- (IBAction)favoriteBtnClicked:(UIButton *)sender {
    NSLog(@"111");
    if (self.delegate && [self.delegate respondsToSelector:@selector(didClickedFavoriteBtn:)]) {
        [self.delegate didClickedFavoriteBtn:self];
    }
}

- (IBAction)goToThereBtnClicked:(UIButton *)sender {
    NSLog(@"222");
    if (self.delegate && [self.delegate respondsToSelector:@selector(didClickedGoToThereBtn:)]) {
        [self.delegate didClickedGoToThereBtn:self];
    }
}

- (IBAction)sendToCarBtnClicked:(UIButton *)sender {
    NSLog(@"333");
    if (self.delegate && [self.delegate respondsToSelector:@selector(didClickedSendToCarBtn:)]) {
        [self.delegate didClickedSendToCarBtn:self];
    }
}

@end
