//
//  NaviBarView.m
//  chameleon
//
//  Created by Foreveross on 16/7/4.
//
//
#import "BundleTools.h"
#import "NaviBarView.h"
#import "UIView+Extension.h"
#import "UILabel+Extension.h"
#define titleViewMargin 2.5
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface NaviBarView()

@property (nonatomic, weak)UIButton *backBtn;
@property (nonatomic, weak)UIView *rightItem;
@property (nonatomic, weak)UIView *titleViewContainer;
@property (nonatomic, weak)UILabel *titleLable;
@property (nonatomic, weak)UIView *titleView;
@property (nonatomic, weak)UIImageView *backImgView;

@end

@implementation NaviBarView


- (instancetype)init{
    self = [super init];
    if (self) {
        [self setBarView];
    }
    return self;
}

+ (instancetype)creatNaviBarView{
    return [[self alloc]init];
}


- (void)setTitle:(NSString *)title{
    if (title) {
        [self setTitleLable];
        _titleLable.text = title;
        _titleLable.size = [UILabel sizeWithText:_titleLable.text font:_titleLable.font maxW:_titleViewContainer.width];
        _titleLable.center = CGPointMake(_titleViewContainer.width/2, _titleViewContainer.height/2);
    }
}

- (void)setBarView{
    self.frame = CGRectMake(0, 0, SCREEN_W, 64*factor_h);
    self.backgroundColor = [UIColor colorWithRed:0.149 green:0.149 blue:0.188 alpha:1.000];
    [self setbackBtn];
    [self setRightItem];
    [self setTitleViewContainer];
}

- (void)setbackBtn{
    UIImageView *backImage = [[UIImageView alloc]initWithImage:[BundleTools imageNamed:@"back.png"]];
    backImage.frame = CGRectMake(14*factor_w, 32*factor_h, 20*factor_w, 20*factor_h);
    [self addSubview:backImage];
    _backImgView = backImage;
    
    UIButton *backBtn = [[UIButton alloc]init];
    backBtn.frame = CGRectMake(0, self.height - 40*factor_h, 40*factor_w, 40*factor_h);
    _backBtn = backBtn;
    [self addSubview:_backBtn];
}

- (void)setBackBtnImg:(NSString *)img{
    _backImgView.image = [BundleTools imageNamed:img];
}

- (void)setBottomSeperatorWidth:(float)width color:(UIColor *)color{
    UIView *bottomSeperator = [[UIView alloc]initWithFrame:CGRectMake(0, 0, self.width, width)];
    bottomSeperator.backgroundColor = color;
    self.height += width;
    bottomSeperator.y = self.height - width;
    [self addSubview:bottomSeperator];
}

- (void)setTitleLable{
    if (!_titleLable) {
        UILabel *label = [[UILabel alloc]init];
        label.font = [UIFont systemFontOfSize:19*factor_h];
        label.textColor = [UIColor whiteColor];
        _titleLable = label;
        [_titleViewContainer addSubview:_titleLable];
    }
}


- (void)setRightItem{
    UIView *view = [[UIView alloc]init];
    view.y = 32*factor_h;
    view.width = 40*factor_h;
    view.height = 20*factor_h;
    view.x = SCREEN_W - (13 + 40)*factor_h;
    _rightItem = view;
    [self addSubview:_rightItem];
}

- (void)setTitleViewContainer{
    UIView *titleViewContainer = [[UIView alloc]init];
    titleViewContainer.backgroundColor = [UIColor clearColor];
    titleViewContainer.width = (SCREEN_W - 50 - 50 - titleViewMargin*2)*factor_h;
    titleViewContainer.height = (40 - titleViewMargin*2)*factor_h;
    titleViewContainer.centerX = self.width / 2;
    titleViewContainer.y = (24 + titleViewMargin)*factor_h;
    _titleViewContainer = titleViewContainer;
    [self addSubview:_titleViewContainer];
}

- (void)setRightItemWith:(UIView *)rightItem{
    rightItem.width = _rightItem.width;
    rightItem.height = _rightItem.height;
    rightItem.center = _rightItem.center;
    [self addSubview:rightItem];
}

- (void)setTitleView:(UIView *)view{
    if (_titleView) {
        [_titleView removeFromSuperview];
    }
    _titleView = view;
    _titleView.width = MIN(_titleView.width, _titleViewContainer.width);
    _titleView.height = MIN(_titleView.height, _titleViewContainer.height);
    _titleView.center = CGPointMake(_titleViewContainer.width/2, _titleViewContainer.height/2);
    [_titleViewContainer addSubview:_titleView];
    
    _backImgView.centerX = _backBtn.width > _titleViewContainer.x ? _titleViewContainer.x/2 : _backBtn.width/2;
}
@end
