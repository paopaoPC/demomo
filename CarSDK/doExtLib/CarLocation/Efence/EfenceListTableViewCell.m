//
//  EfenceListTableViewCell.m
//  chameleon
//
//  Created by 傅祚鹏 on 2017/1/12.
//
//
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
#import "EfenceListTableViewCell.h"
#import "EfenceDataModel.h"
@interface EfenceListTableViewCell()

@property (weak, nonatomic) IBOutlet UILabel *fenceNameLabel;

@property (weak, nonatomic) IBOutlet UILabel *fenceRadiusLabel;
@property (weak, nonatomic) IBOutlet UISwitch *fenceSwitch;

@end

@implementation EfenceListTableViewCell

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
    self.fenceNameLabel.font = [UIFont systemFontOfSize:self.fenceNameLabel.font.pointSize*factor_h];
    self.fenceRadiusLabel.font = [UIFont systemFontOfSize:self.fenceRadiusLabel.font.pointSize*factor_h];
    self.selectionStyle = UITableViewCellSelectionStyleNone;
}

- (void)setFenceData:(EfenceDataModel *)fenceData{
    _fenceData = fenceData;
    
    _fenceNameLabel.text = [NSString stringWithFormat:@"电子围栏：%@",_fenceData.name];
    _fenceRadiusLabel.text = [NSString stringWithFormat:@"围栏半径：%@",[fenceData adaptRadiusContent]];
    _fenceSwitch.on = fenceData.isActivated;
}

- (IBAction)fenceSwitch:(UISwitch *)sender {
    _fenceData.isActivated = sender.isOn;
    [EfenceDataModel updateFenceData:_fenceData];
}

@end
