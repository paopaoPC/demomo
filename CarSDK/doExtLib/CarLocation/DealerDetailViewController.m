//
//  DealerDetailViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/15.
//
//

#import "DealerDetailViewController.h"
#import "BundleTools.h"
#import "UIView+Extension.h"
#import "RTSegment.h"
#pragma mark --- AddressBar
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface AddressBar : UIView
@end

@interface AddressBar()
@property (copy, nonatomic)UILabel *dealerNameLabel;            //经销商名字
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *imgv;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *imgv1;
@property (weak, nonatomic) IBOutlet UILabel *addressLabel; //地址
@property (weak, nonatomic) IBOutlet UILabel *timeLable;    //营业时间
@property (weak, nonatomic) IBOutlet UILabel *distanceLabel;//距离
@property (copy, nonatomic) NSString *phoneNumber;          //电话号码

@end

@implementation AddressBar

- (instancetype)initWithPhoneNumber:(NSString *)phoneNumber{
    self = [[[BundleTools getBundle] loadNibNamed:@"AddressBar" owner:nil options:nil] firstObject];
    if (self) {
        self.phoneNumber = phoneNumber;
        [self.imgv setImage:[BundleTools imageNamed:@"icon_location.png"]];
        [self.imgv1 setImage:[BundleTools imageNamed:@"icon_phone.png"] forState:0];
        [self setDealerNameLable];
    }
    return self;
}

- (void)setDealerNameLable{
    UILabel *lable = [[UILabel alloc]init];
    lable.height = factor_h * 20;
    lable.x = 12 * factor_h;
    lable.width = self.width - 2 * lable.x;
    lable.y = - lable.height - 12 * factor_h;
    NSDictionary *attributs = @{NSFontAttributeName:[UIFont systemFontOfSize:17], NSForegroundColorAttributeName:[UIColor whiteColor], NSStrokeWidthAttributeName:@0, NSStrokeColorAttributeName:[UIColor blackColor]};
    NSAttributedString *string = [[NSAttributedString alloc]initWithString:@"重庆樱花汽车销售服务有限公司" attributes:attributs];
    lable.attributedText = string;
    [self addSubview:lable];
    _dealerNameLabel = lable;
}

- (IBAction)phoneCallBtnClicked:(id)sender {
    if (self.phoneNumber) {
        if ([[[UIDevice currentDevice] systemVersion] floatValue] < 8.0) {
            NSMutableString * str=[[NSMutableString alloc] initWithFormat:@"telprompt://%@",self.phoneNumber];
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:str]];
        }else{
            UIAlertController *alertVC = [UIAlertController alertControllerWithTitle:@"即将进行通话" message:@"请您确认是否跟%@进行通话" preferredStyle:UIAlertControllerStyleAlert];
            UIAlertAction *confirm = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
                NSMutableString * str=[[NSMutableString alloc] initWithFormat:@"tel://%@",self.phoneNumber];
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:str]];
                
            }];
            
            [alertVC addAction:confirm];
            UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleDefault handler:nil];
            [alertVC addAction:cancel];
            
            [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:alertVC animated:YES completion:nil];
        }

    }
}

@end

#pragma mark --- SegmentBar

@interface SegmentBar : UIView
@end

typedef enum{
    SegmentOne = 100,  //预约试驾
    SegmentTwo,        //预约保养
    SegmentThree,      //车辆置换
}SegmentType;

@protocol SegmentBarDelegate <NSObject>

@optional

/**
 点击某个Segment
 */
- (void)segmentBar:(SegmentBar *)segmentBar didSelectSegment:(SegmentType)type;

@end

static RTSegment *currentSelectedSegment;

@interface SegmentBar()

@end

@implementation SegmentBar

+ (SegmentBar *)segmentBar{
    SegmentBar *segmentBar = [[SegmentBar alloc]init];
    segmentBar.width = SCREEN_W;
    segmentBar.height = factor_h * 86;
    segmentBar.backgroundColor = [UIColor whiteColor];
    RTSegment *segment_one = [segmentBar segmentWithTitle:@"预约试驾" normalImg:@"icon_phone.png" selectedImg:@"icon_TeamLeader.png" target:segmentBar selector:@selector(segmentSelected:) type:SegmentOne];
    RTSegment *segment_two = [segmentBar segmentWithTitle:@"预约保养" normalImg:@"icon_phone.png" selectedImg:@"icon_TeamLeader.png" target:segmentBar selector:@selector(segmentSelected:) type:SegmentTwo];
    RTSegment *segment_three = [segmentBar segmentWithTitle:@"车辆置换" normalImg:@"icon_phone.png" selectedImg:@"icon_TeamLeader.png" target:segmentBar selector:@selector(segmentSelected:) type:SegmentThree];
    segment_one.height = segment_two.height = segment_three.height = segmentBar.height;
    segment_one.width = segment_two.width = segment_three.width = segmentBar.width/3;
    segment_one.y = segment_two.y = segment_three.y = 0;
    segment_one.x = 0;
    segment_two.x = CGRectGetMaxX(segment_one.frame);
    segment_three.x = CGRectGetMaxX(segment_two.frame);
    [segmentBar addSubview:segment_one];
    [segmentBar addSubview:segment_two];
    [segmentBar addSubview:segment_three];
    [segment_one setSelected:YES];
    currentSelectedSegment = segment_one;
    return segmentBar;
}

- (RTSegment *)segmentWithTitle:(NSString *)title normalImg:(NSString *)normalImg selectedImg:(NSString *)selectedImg target:(id)target selector:(SEL)selector type:(SegmentType)type{
    RTSegment *seg = [[RTSegment alloc]init];
    [seg setImage:normalImg forState:NormalState];
    [seg setImage:selectedImg forState:SelectedState];
    [seg setTitle:title forState:NormalState];
    [seg setTarget:target selector:selector];
    seg.tag = type;
    return seg;
}

- (void)segmentSelected:(RTSegment *)sender{
    if (sender.isSelected) {
        return;
    }else{
        [currentSelectedSegment setSelected:NO];
        [sender setSelected:YES];
        currentSelectedSegment = sender;
    }
}

@end

#pragma mark --- DealerDetailViewController

#define IMG_Height SCREEN_W*227/375  //单个图片高度

@interface DealerDetailViewController ()<UITableViewDelegate,UITableViewDataSource,SegmentBarDelegate>

@property (nonatomic, weak)UIView *dealerDetailContainer;
@property (nonatomic, weak)AddressBar *addressBar;
@property (nonatomic, weak)UIScrollView *imgContainer;
@property (nonatomic, weak)UIView *swipeMask;
@property (nonatomic, weak)UIButton *resumeBtn;                       //详情复位按钮
@property (nonatomic, strong)UISwipeGestureRecognizer *swipeGesture;
@property (nonatomic, strong)UITableViewController *listVC;

@end

@implementation DealerDetailViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.view.backgroundColor = [UIColor whiteColor];
    
    [self initialDetailsView];
    
    [self initialImageScroll];
    
    [self initSwipeMask];
    
    UIButton *exit = [UIButton buttonWithType:UIButtonTypeContactAdd];
    exit.y = 30;
    [exit addTarget:self action:@selector(back) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:exit];
    
}

- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
#pragma mark --- DealerDetailVC Private Methods
- (void)back{
    [self.navigationController popViewControllerAnimated:YES];
}
/**
 初始化详情展示控件
 */
- (void)initialDetailsView{
    
    UIView *dealerDetailContainer = [[UIView alloc]init];
    dealerDetailContainer.backgroundColor = [UIColor whiteColor];
    dealerDetailContainer.x = 0;
    dealerDetailContainer.y = IMG_Height;
    dealerDetailContainer.width = SCREEN_W;
    dealerDetailContainer.height = SCREEN_H - dealerDetailContainer.y;
    [self.view addSubview:dealerDetailContainer];
    _dealerDetailContainer = dealerDetailContainer;
    
    AddressBar *addr = [[AddressBar alloc]initWithPhoneNumber:@"10086"];
    addr.width = SCREEN_W;
    addr.height *= factor_h;
    addr.x = 0;
    addr.y = 0;
    [_dealerDetailContainer addSubview:addr];
    _addressBar = addr;
    
    SegmentBar *segmentBar = [SegmentBar segmentBar];
    segmentBar.y = CGRectGetMaxY(addr.frame) + 10;
    [_dealerDetailContainer addSubview:segmentBar];
    
    UITableView *table = [[UITableView alloc]initWithFrame:CGRectMake(0, CGRectGetMaxY(segmentBar.frame), SCREEN_W, SCREEN_H - CGRectGetMaxY(segmentBar.frame)) style:UITableViewStylePlain];
    [_dealerDetailContainer addSubview:table];
}

/**
 初始化图片展示📜
 */
- (void)initialImageScroll{
    UIScrollView *imgContainer = [[UIScrollView alloc]initWithFrame:self.view.bounds];
    imgContainer.showsVerticalScrollIndicator = NO;
    imgContainer.showsHorizontalScrollIndicator = NO;
//    imgContainer.bounces = NO;
    NSMutableArray *array = [NSMutableArray array];
    int imgMargin = 10;
    for (int i = 0; i < 6; i ++) {
        float y = IMG_Height * i + imgMargin * i;
        UIImageView *imageView = [[UIImageView alloc]initWithFrame:CGRectMake(0, y, SCREEN_W, IMG_Height)];
        imageView.image = [BundleTools imageNamed:@"sampleCar"];
        imageView.layer.borderWidth = 0.5;
        imageView.layer.borderColor = [UIColor lightGrayColor].CGColor;
        [array addObject:imageView];
    }
    for (int i = 0; i < array.count; i ++) {
        UIImageView *imageview = array[i];
        [imgContainer addSubview:imageview];
    }
    imgContainer.contentSize = CGSizeMake(SCREEN_W, array.count * IMG_Height + imgMargin * (array.count - 1));
    [self.view insertSubview:imgContainer atIndex:0];
    _imgContainer = imgContainer;
    UIView *view = [[UIView alloc]initWithFrame:CGRectMake(0, 0, 1, 1)];
    [self.view insertSubview:view atIndex:0];
}

/**
 初始化手势及遮罩及复位按钮
 */
- (void)initSwipeMask{
    _swipeGesture = [[UISwipeGestureRecognizer alloc]initWithTarget:self action:@selector(swipeDown)];
    [self.view addGestureRecognizer:_swipeGesture];
    _swipeGesture.direction = UISwipeGestureRecognizerDirectionDown;
    
    UIView *swipeMask = [[UIView alloc]initWithFrame:self.view.bounds];
    swipeMask.backgroundColor = [UIColor clearColor];
    [self.view insertSubview:swipeMask aboveSubview:_imgContainer];
    _swipeMask = swipeMask;
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.frame = [_addressBar.dealerNameLabel convertRect:_addressBar.dealerNameLabel.bounds toView:[UIApplication sharedApplication].keyWindow];
    [button setBackgroundColor:[UIColor clearColor]];
    [button addTarget:self action:@selector(resumeDetails) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button];
    button.userInteractionEnabled = NO;
    _resumeBtn = button;
    
}

/**
 响应手势向下滑动
 */
- (void)swipeDown{
    [self hideDetailView];
}

/**
 详情界面显示
 */
- (void)showDetailView{
    _swipeMask.hidden = NO;
    [_imgContainer setContentOffset:CGPointMake(0, 0) animated:YES];
    [UIView animateWithDuration:0.5 delay:0 options:UIViewAnimationOptionCurveEaseInOut animations:^{
        _dealerDetailContainer.y = IMG_Height;
        _resumeBtn.frame = [_addressBar.dealerNameLabel convertRect:_addressBar.dealerNameLabel.bounds toView:[UIApplication sharedApplication].keyWindow];
        _addressBar.dealerNameLabel.textAlignment = NSTextAlignmentLeft;
        _addressBar.dealerNameLabel.backgroundColor = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
    } completion:^(BOOL finished) {
        _resumeBtn.userInteractionEnabled = NO;
    }];
}

/**
 详情页面隐藏
 */
- (void)hideDetailView{
    [UIView animateWithDuration:0.5 delay:0 options:UIViewAnimationOptionCurveEaseInOut animations:^{
        _dealerDetailContainer.y = SCREEN_H;
        _resumeBtn.frame = [_addressBar.dealerNameLabel convertRect:_addressBar.dealerNameLabel.bounds toView:[UIApplication sharedApplication].keyWindow];
        _addressBar.dealerNameLabel.textAlignment = NSTextAlignmentCenter;
    } completion:^(BOOL finished) {
        _swipeMask.hidden = YES;
        _resumeBtn.userInteractionEnabled = YES;
        _addressBar.dealerNameLabel.backgroundColor = [UIColor colorWithRed:0 green:0 blue:0 alpha:0.5];
    }];
}

- (void)resumeDetails{
    [self showDetailView];
}
#pragma mark --- SegmentBarDelegate

- (void)segmentBar:(SegmentBar *)segmentBar didSelectSegment:(SegmentType)type{
    switch (type) {
        case SegmentOne:
            
            break;
        case SegmentTwo:
            
            break;
        case SegmentThree:
            
            break;
            
        default:
            break;
    }
}

#pragma mark --- UITableViewDelegate,UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return 4;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell) {
        cell = [[UITableViewCell alloc]initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}


@end
