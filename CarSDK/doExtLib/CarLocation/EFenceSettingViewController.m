//
//  EFenceSettingViewController.m
//  chameleon
//
//  Created by Foreveross on 16/3/29.
//
//

#import "EFenceSettingViewController.h"
#import "UIView+Extension.h"
#import "SVProgressHUD.h"
#import "NSString+Extension.h"
#import "BundleTools.h"
#import <AddressBookUI/ABPeoplePickerNavigationController.h>
#import <AddressBook/ABPerson.h>
#import <AddressBookUI/ABPersonViewController.h>
#define MAXRADIUS 500000
#define MINRADIUS 500
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface EFenceSettingViewController ()<UIActionSheetDelegate,UIAlertViewDelegate,ABPeoplePickerNavigationControllerDelegate,UITextFieldDelegate>

@property (weak, nonatomic) IBOutlet UIButton *ArrowBtn;

@property (weak, nonatomic) IBOutlet UILabel *radiusLable;
@property (assign, nonatomic) NSInteger radius;//半径数值
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *configBtn;
@property (strong, nonatomic) UISwipeGestureRecognizer *swipeGesture;//使围栏设置界面可滑动显示更多；
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *deletBtn;

@property (weak, nonatomic) IBOutlet UILabel *notifyTypeLabel;
@property (weak, nonatomic) IBOutlet UILabel *notifyPhoneLabel;
@property (weak, nonatomic) IBOutlet UISwitch *efenceSwitch;//围栏启用开关
@property (strong, nonatomic) IBOutlet UIView *menuView;
@property (weak, nonatomic) IBOutlet UILabel *noteLabel;

@property (weak, nonatomic) IBOutlet UILabel *fenceNameLabel;

@property (unsafe_unretained, nonatomic) IBOutlet UIButton *jian;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *jia;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *arrimg;

@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *arrimag1;
@property (weak, nonatomic) IBOutlet UIButton *saveBtn;//保存围栏按钮
@property (weak, nonatomic) IBOutlet UIButton *backBtn;//取消，返回按钮

@property (strong, nonatomic) EfenceDataModel *previousEfenceData;//保存围栏未修改前的数据，用于点击取消更改后，并在点击保存后更新
@property (assign, nonatomic) BOOL isEditing;

@end

@implementation EFenceSettingViewController



- (void)setEfenceData:(EfenceDataModel *)efenceData{
    self.isEditing = efenceData.isDefaultData;
    _efenceData = efenceData;
    _previousEfenceData = [efenceData mutableCopy];
    [self initSettingView];
}

- (void)setRadius:(NSInteger)radius{
    _radius = radius;
    
    if (_radius >= 1000) {
        NSString *radiusStr = [NSString stringWithFormat:@"%ld公里",(long)_radius / 1000];
        self.radiusLable.attributedText = [self attributedRadiusStrWithString:radiusStr unit:@"公里"];
    }else{
        NSString *radiusStr = [NSString stringWithFormat:@"%ld米",(long)_radius];
        self.radiusLable.attributedText = [self attributedRadiusStrWithString:radiusStr unit:@"米"];;
    }
    
    self.efenceData.distance = [NSString stringWithFormat:@"%ld",_radius];
    [self.delegate dataChanged];//通知代理数据更改
    [self enableSaveBtn];
}
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
    [self.backBtn setImage:[BundleTools imageNamed:@"e_cancel"] forState:0];
    [self.saveBtn setImage:[BundleTools imageNamed:@"e_save"] forState:0];
    [self.jian setImage:[BundleTools imageNamed:@"cut_icon"] forState:0];
    [self.jia setImage:[BundleTools imageNamed:@"plus_icon"] forState:0];
    [self.arrimg setImage:[BundleTools imageNamed:@"jiantou_right"]];
    [self.arrimag1 setImage:[BundleTools imageNamed:@"jiantou_right"]];
    [self.ArrowBtn setImage:[BundleTools imageNamed:@"drawer_bar"] forState:0];
    [self.ArrowBtn setImage:[BundleTools imageNamed:@"drawer_bar"] forState:UIControlStateSelected];
    self.view.frame = CGRectMake(0, SCREEN_H - 96, SCREEN_W, self.view.height);
    self.view.alpha = 0.95;
    
    self.menuView.frame = CGRectMake(0, SCREEN_H - 96, SCREEN_W, 96);
    self.menuView.alpha = 0.95;
    _noteLabel.font = [UIFont systemFontOfSize:_noteLabel.font.pointSize * SCREEN_W / 375];
    _swipeGesture = [[UISwipeGestureRecognizer alloc]initWithTarget:self action:@selector(EFenceAnimation)];
    [self.view addGestureRecognizer:_swipeGesture];
    [_swipeGesture setDirection:UISwipeGestureRecognizerDirectionUp];//手势初始化时设为可向上滑动
    
    [self initSettingView];
    
}
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
- (void)enableSaveBtn{
    [self.saveBtn setEnabled:YES];
    self.saveBtn.alpha = 1;
}

- (void)disableSaveBtn{
    [self.saveBtn setEnabled:NO];
    self.saveBtn.alpha = 0.4;
}
/**
 *  显示菜单
 */
- (void)showMenuViewOn:(UIView*)view{
    if (_efenceData.isDefaultData) {
        self.view.hidden = YES;
        self.menuView.hidden = YES;
    }else{
        self.view.hidden = YES;
        self.menuView.hidden = NO;
    }
    [view addSubview:self.menuView];
    [view addSubview:self.view];
}

- (void)showMenu{
    self.view.hidden = NO;
    self.menuView.hidden = YES;
    [self menuHalfUp];
}

/**
 *  移除菜单
 */
- (void)dismissMenuView{
    [self.view removeFromSuperview];
    [self.menuView removeFromSuperview];
}
#pragma mark - Button ckicking events
/**
 *  围栏启用开关
 */
- (IBAction)efenceSwitch:(UISwitch *)sender {
    _efenceData.isActivated = sender.isOn;
//    if (!sender.isOn) {
//        UIAlertView *alert = [[UIAlertView alloc]initWithTitle:@"温馨提示" message:@"禁用围栏后您将不会收到短信提醒" delegate:nil cancelButtonTitle:@"确定" otherButtonTitles: nil];
//        [alert show];
//    }
    [self enableSaveBtn];
}
/**
 *  点击箭头
 *
 */
- (IBAction)ClickArrow:(UIButton *)sender {
    if (sender.selected) {
        [self EFenceAnimation];
        [sender setSelected:NO];
    }else{
        [self EFenceAnimation];
        [sender setSelected:YES];
    }
}
/**
 *  删除围栏
 *
 */
- (IBAction)cancelBtn:(UIButton *)sender {
    [self dismissMenuView];
    [self.delegate efenceDeleted];
}
/**
 *  取消更改，返回上级菜单
 */
- (IBAction)backBtn:(UIButton *)sender {
    if (_previousEfenceData.isDefaultData) {
        [self menuTotalDown];
        self.menuView.hidden = YES;
        self.view.hidden = YES;
//        _efenceData = [_previousEfenceData mutableCopy];
        [self initSettingView];
        [self.delegate cancelInitializeFence];
        return;
    }
    [UIView animateWithDuration:0.1 animations:^{
        self.view.y = SCREEN_H - 96;
    } completion:^(BOOL finished) {
        [_swipeGesture setDirection:UISwipeGestureRecognizerDirectionUp];
        [_ArrowBtn setSelected:NO];
        self.menuView.hidden = NO;
        self.view.hidden = YES;
    }];
    _efenceData = [_previousEfenceData mutableCopy];
    self.isEditing = NO;
    if (_HitConfigBlock) {
        _HitConfigBlock(_isEditing);
    }
    [self initSettingView];
    [self.delegate dataChanged];
}

/**
 *  进入设置
 */
- (IBAction)config:(UIButton *)sender {
    self.menuView.hidden = YES;
    self.view.hidden = NO;
    self.isEditing = YES;
    [self menuHalfUp];
    if (_HitConfigBlock) {
        _HitConfigBlock(_isEditing);
    }
}

/**
 *  保存围栏
 */
- (IBAction)saveBtn:(UIButton *)sender {
//    if (_efenceData.point.latitude == 0.0) {
//        [SVProgressHUD showErrorWithStatus:@"请点击地图设置围栏中心点"];
//        return;
//    }
    [self.delegate efenceSaved];
//    [self enableBackBtn];
    [self menuTotalDown];
    self.view.hidden = YES;
    self.menuView.hidden = NO;
    self.isEditing = NO;
    if (_HitConfigBlock) {
        _HitConfigBlock(_isEditing);
    }
    _efenceData.isDefaultData = NO;
    _previousEfenceData = [_efenceData mutableCopy];
}


/**
 *  增加半径
 *
 */
- (IBAction)increaseBtn:(UIButton *)sender {
    if (_radius >= 1000 && _radius < MAXRADIUS) {// 半径大于1公里且小于最大半径时；
        self.radius += 1000;
    }else if (_radius >= MINRADIUS && _radius < 1000){//半径大于最小半径并小于1公里时；
        self.radius += 100;
    }else{
        return;
    }
}
/**
 *  减少半径
 *
 */
- (IBAction)decreaseBtn:(UIButton *)sender {
    if (_radius > 1000 && _radius <= MAXRADIUS) {// 半径大于1公里且小于最大半径时；
        self.radius -= 1000;
    }else if (_radius > MINRADIUS && _radius <= 1000){//半径大于最小半径并小于1公里时；
        self.radius -= 100;
    }else{
        return;
    }
}
/**
 *  更改通知电话
 *
 */
- (IBAction)changeNotifyPhone:(UIButton *)sender {
//    UIActionSheet *actionSheet = [[UIActionSheet alloc]initWithTitle:nil delegate:self cancelButtonTitle:@"取消" destructiveButtonTitle:nil otherButtonTitles:@"手动输入",@"从通讯录获取", nil];
    
    UIActionSheet *actionSheet = [[UIActionSheet alloc]initWithTitle:nil delegate:self cancelButtonTitle:@"取消" destructiveButtonTitle:nil otherButtonTitles:@"手动输入", nil];
    
    actionSheet.tag = 101;
    [actionSheet showInView:[UIApplication sharedApplication].keyWindow.rootViewController.view];
}
/**
 *  更改预警类型
 *
 */
- (IBAction)changeNotifyType:(UIButton *)sender {
    UIActionSheet *actionSheet = [[UIActionSheet alloc]initWithTitle:@"请选择预警类型" delegate:self cancelButtonTitle:@"取消" destructiveButtonTitle:nil otherButtonTitles:@"入围预警",@"出围预警", nil];
    actionSheet.tag = 100;
    [actionSheet showInView:[UIApplication sharedApplication].keyWindow.rootViewController.view];
}

- (IBAction)changeFenceName:(UIButton *)sender {
    UIAlertView *dialog = [[UIAlertView alloc]initWithTitle:@"请输入围栏名称" message:nil delegate:self cancelButtonTitle:@"取消" otherButtonTitles:@"确定", nil];
    [dialog setAlertViewStyle:UIAlertViewStylePlainTextInput];
    [[dialog textFieldAtIndex:0] setKeyboardType:UIKeyboardTypeDefault];
    [dialog show];
}


#pragma mark - Gesture recognized

- (void)EFenceAnimation{
    if (_swipeGesture.direction == UISwipeGestureRecognizerDirectionUp) {//向上滑动
        [self menuTotalUp];
    }else{//向下滑动
        [self menuTotalDown];
    }
}

#pragma mark - UIActionSheetDelegate

- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex{
    if (actionSheet.tag == 100) {
        switch (buttonIndex) {
            case 0:             //选择了入围预警
                _notifyTypeLabel.text = @"入围预警";
                break;
            case 1:             //选择了出围预警
                _notifyTypeLabel.text = @"出围预警";
                break;
            default:
                break;
        }
        _efenceData.notifyType = ([_notifyTypeLabel.text isEqualToString:@"入围预警"] ? @"inwarn" : @"outwarn");
        [self enableSaveBtn];
    }else{
        switch (buttonIndex) {
            case 0: {            //手动输入
                UIAlertView *dialog = [[UIAlertView alloc]initWithTitle:@"请输入手机号" message:nil delegate:self cancelButtonTitle:@"取消" otherButtonTitles:@"确定", nil];
                [dialog setAlertViewStyle:UIAlertViewStylePlainTextInput];
                [[dialog textFieldAtIndex:0] addTarget:self action:@selector(phoneTextChange:) forControlEvents:UIControlEventEditingChanged];
                [[dialog textFieldAtIndex:0] setKeyboardType:UIKeyboardTypeNumberPad];
                [dialog show];
            }
                break;
//            case 1:             //从通讯录获取
//                [self chooseContact];
//                break;
            default:
                break;
        }
    }
}

- (void)phoneTextChange:(UITextField *)textField{
    UITextRange *selectedRange = textField.markedTextRange;
    UITextPosition *position = [textField positionFromPosition:selectedRange.start offset:0];
    if (!position) {
        // 没有高亮选择的字
        // 1. 过滤非汉字、字母、数字字符
        textField.text = [self filterCharactor:textField.text withRegex:@"[^a-zA-Z0-9\u4e00-\u9fa5]"];
        // 2. 截取
        if (textField.text.length >= 11) {
            textField.text = [textField.text substringToIndex:11];
        }
    } else {
        // 有高亮选择的字 不做任何操作
    }
}
// 过滤字符串中的非汉字、字母、数字
- (NSString *)filterCharactor:(NSString *)string withRegex:(NSString *)regexStr{
    NSString *filterText = string;
    NSError *error = NULL;
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:regexStr options:NSRegularExpressionCaseInsensitive error:&error];
    NSString *result = [regex stringByReplacingMatchesInString:filterText options:NSMatchingReportCompletion range:NSMakeRange(0, filterText.length) withTemplate:@""];
    return result;
}

#pragma mark - ABPeoplePickerNavigationControllerDelegate
/**
 *  取消选择联系人
 */
- (void)peoplePickerNavigationControllerDidCancel:(ABPeoplePickerNavigationController *)peoplePicker{
    [peoplePicker dismissViewControllerAnimated:YES completion:nil];
}
/**
 *  选择联系人并更改通知电话
 */

- (void)peoplePickerNavigationController:(ABPeoplePickerNavigationController *)peoplePicker didSelectPerson:(ABRecordRef)person property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifier{
    ABMultiValueRef phone = ABRecordCopyValue(person, kABPersonPhoneProperty);
    CFIndex index = ABMultiValueGetIndexForIdentifier(phone,identifier);
    NSString *phoneNum = (__bridge NSString *)ABMultiValueCopyValueAtIndex(phone, index);
    NSString *phoneNumFixed =  [[phoneNum componentsSeparatedByCharactersInSet:[[NSCharacterSet characterSetWithCharactersInString:@"0123456789"] invertedSet]] componentsJoinedByString:@""];
//    DEBUG_LOG(@"电话号码－%@",phoneNumFixed);
    if ([phoneNumFixed isMobileNumber]) {
        _notifyPhoneLabel.text = phoneNumFixed;
        _efenceData.notifyPhone = phoneNumFixed;
        [self enableSaveBtn];
        [SVProgressHUD showSuccessWithStatus:@"手机号码设置成功"];
    }else{
        [SVProgressHUD showErrorWithStatus:@"请输入正确的手机号码"];
    }
}

#pragma mark - UIAlertViewDelegate

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex{
    if (buttonIndex == alertView.firstOtherButtonIndex) {
        switch ([alertView textFieldAtIndex:0].keyboardType) {
            case UIKeyboardTypeDefault:{
                NSString *newName = [alertView textFieldAtIndex:0].text;
                if (newName && newName.length > 0) {
                    _fenceNameLabel.text = newName;
                    _efenceData.name = newName;
                    [self enableSaveBtn];
                }
            }
                break;
            case UIKeyboardTypeNumberPad:{
                NSString *number = [alertView textFieldAtIndex:0].text;
                if ([number isMobileNumber]) {
                    _notifyPhoneLabel.text = number;
                    _efenceData.notifyPhone = number;
                    [self enableSaveBtn];
                    [SVProgressHUD showSuccessWithStatus:@"手机号码设置成功"];
                }else{
                    [SVProgressHUD showErrorWithStatus:@"请输入正确的手机号码"];
                }
            }
                break;
            default:{
                NSString *number = [alertView textFieldAtIndex:0].text;
                if ([number isMobileNumber]) {
                    _notifyPhoneLabel.text = number;
                    _efenceData.notifyPhone = number;
                    [self enableSaveBtn];
                    [SVProgressHUD showSuccessWithStatus:@"手机号码设置成功"];
                }else{
                    [SVProgressHUD showErrorWithStatus:@"请输入正确的手机号码"];
                }
            }
                break;
        }
    }
}

#pragma mark - Private methods
- (void)enableBackBtn{
    self.backBtn.alpha = 1;
    [self.backBtn setEnabled:YES];
}
- (void)disableBackBtn{
    self.backBtn.alpha = 0.4;
    [self.backBtn setEnabled:NO];
}
/**
 *  菜单部分上移
 */
- (void)menuHalfUp{
    [UIView animateWithDuration:0.2 animations:^{
        self.view.y = SCREEN_H -  195;
    }];
}

/**
 *  菜单全部上移
 */
- (void)menuTotalUp{
    [UIView animateWithDuration:0.2 animations:^{
        self.view.y = SCREEN_H -  self.view.height;
    }];
    [_swipeGesture setDirection:UISwipeGestureRecognizerDirectionDown];
    [_ArrowBtn setSelected:YES];
}
/**
 *  菜单全部下移
 */
- (void)menuTotalDown{
    [UIView animateWithDuration:0.2 animations:^{
        self.view.y = SCREEN_H - 96;
    }];
    [_swipeGesture setDirection:UISwipeGestureRecognizerDirectionUp];
    [_ArrowBtn setSelected:NO];
}

/**
 *  初始化设置页面
 */
- (void)initSettingView{
    //半径
    NSInteger radius = [_efenceData.distance intValue];
    self.radius = radius;
    //名称
    _fenceNameLabel.text = _efenceData.name;
    //电话
    _notifyPhoneLabel.text = _efenceData.notifyPhone;
    //预警类型
    _notifyTypeLabel.text = ([_efenceData.notifyType isEqualToString:@"inwarn"] ? @"入围预警" : @"出围预警");
    //是否启用围栏
    [_efenceSwitch setOn:_efenceData.isActivated];
    if (_efenceData.isDefaultData) {
//        [self disableBackBtn];
    }
    [self disableSaveBtn];
    
}
/**
 *  显示通讯录界面
 */
- (void)chooseContact{
    ABPeoplePickerNavigationController *nav = [[ABPeoplePickerNavigationController alloc] init];
    nav.peoplePickerDelegate = self;
    nav.predicateForSelectionOfPerson = [NSPredicate predicateWithValue:false];
    [self.parentViewController presentViewController:nav animated:YES completion:nil];
}



- (NSMutableAttributedString *)attributedRadiusStrWithString:(NSString *)radiusStr unit:(NSString *)unit{
    NSRange unitRange;
    NSRange numRange;
    if ([unit isEqualToString:@"公里"]) {
        unitRange = [radiusStr rangeOfString:@"公里"];
        numRange = NSMakeRange(0, unitRange.location);
    }else{
        unitRange = [radiusStr rangeOfString:@"米"];
        numRange = NSMakeRange(0, unitRange.location);
    }
    NSMutableAttributedString *attributedText = [[NSMutableAttributedString alloc]initWithString:radiusStr];
    [attributedText addAttribute:NSFontAttributeName value:[UIFont systemFontOfSize:21] range:numRange];
    [attributedText addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithRed:0.039 green:0.663 blue:0.922 alpha:1.000] range:numRange];
    [attributedText addAttribute:NSFontAttributeName value:[UIFont systemFontOfSize:14] range:unitRange];
    [attributedText addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithWhite:0.600 alpha:1.000] range:unitRange];
    return attributedText;
}

@end
