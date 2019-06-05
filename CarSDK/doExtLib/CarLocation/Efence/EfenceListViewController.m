//
//  EfenceListViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2017/1/12.
//
//

#import "EfenceListViewController.h"
#import "NaviBarView.h"
#import "UIView+Extension.h"
#import "EfenceListTableViewCell.h"
#import "CHXColor.h"
#import "EfenceDataModel.h"
#import "BundleTools.h"
#define FenceCellID @"fenceCell"

#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface EfenceListViewController ()<UITableViewDelegate,UITableViewDataSource>;

@property (assign, nonatomic)id<EfenceListVCDelegate>delegate;

@property (weak, nonatomic)NaviBarView *barView;

@property (weak, nonatomic)UITableView *fenceList;

@property (strong, nonatomic)NSMutableArray *fenceArr;
@property (weak, nonatomic) IBOutlet UILabel *noteLabel;

@end

@implementation EfenceListViewController

#pragma mark --- Init Methods

- (instancetype)initWithFenceArray:(NSArray *)fences delegate:(id<EfenceListVCDelegate>)delegate{
    self = [self init];
    if (self) {
        
        self.delegate = delegate;
        
        self.fenceArr = [NSMutableArray arrayWithArray:fences];
        
        [self initNaviNar];
        
        if (fences.count > 0) {
            [self initFenceListTable];
            _noteLabel.hidden = YES;
        }
    }
    
    return self;
}

- (void)initNaviNar{
    NaviBarView *bar = [NaviBarView creatNaviBarView];
    [self.view addSubview:bar];
    _barView = bar;
    [_barView.backBtn addTarget:self action:@selector(back) forControlEvents:UIControlEventTouchUpInside];
    _barView.title = @"电子围栏";
    UIButton *add = [UIButton buttonWithType:UIButtonTypeCustom];
    [add setImage:[BundleTools imageNamed:@"icon_add"] forState:UIControlStateNormal];
    add.frame = CGRectMake(0, 0, 40, 40);
    add.imageView.contentMode = UIViewContentModeCenter;
    [_barView setRightItemWith:add];
    
    [add addTarget:self action:@selector(addNewFence) forControlEvents:UIControlEventTouchUpInside];
}

- (void)initFenceListTable{
    UITableView *list = [[UITableView alloc]initWithFrame:CGRectMake(0, _barView.height, SCREEN_W, SCREEN_H - _barView.height) style:UITableViewStyleGrouped];
    [self.view addSubview:list];
    list.backgroundColor = [CHXColor hxcolorWithHexString:@"#f0f0f0"];;
    _fenceList = list;
    _fenceList.dataSource = self;
    _fenceList.delegate = self;
    [_fenceList registerNib:[UINib nibWithNibName:@"EfenceListTableViewCell" bundle:[BundleTools getBundle]] forCellReuseIdentifier:FenceCellID];
    UIView *footer = [[UIView alloc]init];
    _fenceList.tableFooterView = footer;
    _fenceList.separatorStyle = UITableViewCellSeparatorStyleNone;
}

#pragma mark --- ViewController

- (instancetype)init
{
    self = [super initWithNibName:NSStringFromClass(self.class) bundle:[BundleTools getBundle]];
    if (self) {
        
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
}

- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
 
        [self.navigationController setNavigationBarHidden:YES];
    
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
//    [MobClick beginLogPageView:@"电子围栏列表"];
}

- (void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
//    [MobClick endLogPageView:@"电子围栏列表"];
}
#pragma mark --- Public Methods



#pragma mark --- Private Methods



#pragma mark --- Events

- (void)back{
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)addNewFence{
//    if (_fenceArr.count == 5) {
//        UIAlertView *alert = [[UIAlertView alloc]initWithTitle:@"提示" message:@"最多设置5个电子围栏" delegate:nil cancelButtonTitle:@"确定" otherButtonTitles:nil];
//        [alert show];
//        return;
//    }
    if (self.delegate && [self.delegate respondsToSelector:@selector(clickAddNewFenceBtn:)]) {
        [self.delegate clickAddNewFenceBtn:self];
    }
    [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark --- UITableViewDelegate,UITableViewDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return _fenceArr.count;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    EfenceListTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:FenceCellID];
    cell.fenceData = _fenceArr[indexPath.section];
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section{
    return 12*factor_h;
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section{
    return 0.000001;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return 66*factor_h;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    if (self.delegate && [self.delegate respondsToSelector:@selector(EfenceListVC:didSelectEfence:)]) {
        [self.delegate EfenceListVC:self didSelectEfence:_fenceArr[indexPath.section]];
    }
    [self.navigationController popViewControllerAnimated:YES];
}

- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath{
    return UITableViewCellEditingStyleDelete;
}

- (NSString *)tableView:(UITableView *)tableView titleForDeleteConfirmationButtonForRowAtIndexPath:(NSIndexPath *)indexPath{
    return @"删除";
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath{
    
    EfenceDataModel *fence = _fenceArr[indexPath.section];
    [EfenceDataModel clearFenceData:fence.fenceId];
    [_fenceArr removeObjectAtIndex:indexPath.section];
    [tableView reloadData];
    //        [tableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationFade];
    if (_fenceArr.count == 0) {
        _fenceList.hidden = YES;
        _noteLabel.hidden = NO;
    }
}

@end
