//
//  RTSegment.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/15.
//
//
#import "BundleTools.h"
#import "RTSegment.h"
#import "UIView+Extension.h"
#define TriangleHeight 8
#define TriangleWidth 18
#define BorderWidth 0.5
#define BorderColor [UIColor colorWithRed:236/255.f green:236/255.f blue:236/255.f alpha:1]
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface RTSegment()

@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UILabel *label;

@property (strong, nonatomic)UIView *backgroundView;
@property (strong, nonatomic)CAShapeLayer *shapeLayer;

@property (copy, nonatomic)NSString *normal_img;
@property (copy, nonatomic)NSString *selected_img;

@property (copy, nonatomic)NSString *normal_title;
@property (copy, nonatomic)NSString *selected_title;

@property (strong, nonatomic)UIColor *normal_titleColor;
@property (strong, nonatomic)UIColor *selected_titleColor;

@property (strong, nonatomic)UIColor *normal_bgColor;
@property (strong, nonatomic)UIColor *selected_bgColor;

@property (strong, nonatomic)id target;
@property (assign, nonatomic)SEL selector;

@property (assign, nonatomic)SegmentState currentState;

@end

@implementation RTSegment

- (instancetype)init{
    self = [[[BundleTools getBundle] loadNibNamed:@"RTSegment" owner:nil options:nil] firstObject];
    
    [self setBackground];
    
    return self;
}


#pragma mark --- Public Methods

- (void)setFrame:(CGRect)frame{
    [super setFrame:frame];
    _backgroundView.frame = self.bounds;
//    _image.width = _image.height = _image.width * factor_h;
//    _label.width *= factor_w;
//    _label.height *= factor_h;
//    _label.font = [UIFont systemFontOfSize:_label.font.pointSize * factor_h];
    
}

/**
 设置图片
 */
- (void)setImage:(NSString *)imageName forState:(SegmentState)state{
    if (state == NormalState) {
        self.normal_img = imageName;
    }else{
        self.selected_img = imageName;
    }
}

/**
 设置背景颜色
 */
- (void)setBackgroundColor:(UIColor *)backgroundColor forState:(SegmentState)state{
    if (state == NormalState) {
        _normal_bgColor = backgroundColor;
    }else{
        _selected_bgColor = backgroundColor;
    }
}

/**
 设置文字
 */
- (void)setTitle:(NSString *)title forState:(SegmentState)state{
    if (state == NormalState) {
        self.normal_title = title;
    }else{
        self.selected_title = title;
    }
}

/**
 设置文字颜色
 */
- (void)setTitleColor:(UIColor *)Color forState:(SegmentState)state{
    if (state == NormalState) {
        self.normal_titleColor = Color;
    }else{
        self.selected_titleColor = Color;
    }
}

- (void)setTarget:(id)target selector:(SEL)selector{
    self.target = target;
    self.selector = selector;
}


- (void)setSelected:(BOOL)aBool{
    if (aBool) {
        _selected = YES;
        [self showSelectedView];
    }else{
        _selected = NO;
        [self showNormalView];
    }
}
#pragma mark --- Private Methods

- (CAShapeLayer *)shapeLayer{
    if (!_shapeLayer) {
        UIBezierPath *path = [UIBezierPath bezierPath];
        [path moveToPoint:CGPointMake(0, 0)];
        [path addLineToPoint:CGPointMake(0, _backgroundView.height)];
        
        [path addLineToPoint:CGPointMake(_backgroundView.width/2 - factor_w * TriangleWidth/2, _backgroundView.height)];
        [path addLineToPoint:CGPointMake(_backgroundView.width/2, _backgroundView.height -factor_h * TriangleHeight)];
        [path addLineToPoint:CGPointMake(_backgroundView.width/2 + factor_w * TriangleWidth/2, _backgroundView.height)];
        
        [path addLineToPoint:CGPointMake(_backgroundView.width, _backgroundView.height)];
        [path addLineToPoint:CGPointMake(_backgroundView.width, 0)];
        
        _shapeLayer = [CAShapeLayer layer];
        _shapeLayer.frame = self.backgroundView.bounds;
        _shapeLayer.path = path.CGPath;
      
        _shapeLayer.fillColor = _selected_bgColor ? _selected_bgColor.CGColor :   [UIColor colorWithRed:70/255.f green:170/255.f blue:243/255.f alpha:1].CGColor;
    }
    return _shapeLayer;
}

- (void)setBackground{
    _backgroundView = [[UIView alloc]initWithFrame:self.frame];
    _backgroundView.layer.borderWidth = BorderWidth;
    _backgroundView.layer.borderColor = BorderColor.CGColor;
    [self insertSubview:_backgroundView atIndex:0];
}

- (void)showSelectedView{
    
    [_image setImage:[BundleTools imageNamed:_selected_img ? _selected_img : _normal_img]];
    _label.text = _selected_title ? _selected_title : _normal_title;
    _label.textColor = _selected_titleColor ? _selected_titleColor : [UIColor whiteColor];
    [self showSelectedBg];
}

- (void)showNormalView{
    [_image setImage:[BundleTools imageNamed:_normal_img]];
    _label.text = _normal_title ? _normal_title : @"";
    _label.textColor = _normal_titleColor ? _normal_titleColor : [UIColor blackColor];
    [self showNormalBg];
}

- (void)showNormalBg{
    _backgroundView.backgroundColor = _normal_bgColor ? _normal_bgColor : [UIColor whiteColor];
    _backgroundView.layer.borderWidth = BorderWidth;
    [_shapeLayer removeFromSuperlayer];
}

- (void)showSelectedBg{
    _backgroundView.layer.borderWidth = 0;
    
    [_backgroundView.layer addSublayer:self.shapeLayer];
    
}

- (void)layoutSubviews{
    if (self.isSelected) {
        [self showSelectedView];
    }else{
        [self showNormalView];
    }
}

#pragma mark --- Events
- (IBAction)clicked:(UIButton *)sender {
    if (_target && [_target respondsToSelector:_selector]) {
        [_target performSelector:_selector withObject:self afterDelay:0];
    }
}

@end
