//
//  DealersTableViewCell.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/15.
//
//

#import "DealersTableViewCell.h"
#import "BundleTools.h"
@interface DealersTableViewCell()
@property (weak, nonatomic) IBOutlet UIView *containerView;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img1;

@end

@implementation DealersTableViewCell


- (void)awakeFromNib {
    [super awakeFromNib];
    [_img1 setImage:[BundleTools imageNamed:@"icon_location"]];
    // Initialization code
    self.backgroundColor = [UIColor clearColor];
    self.selectionStyle = UITableViewCellSelectionStyleNone;
    _containerView.layer.borderWidth = 1;
    _containerView.layer.borderColor = [UIColor colorWithRed:217/255.f green:217/255.f blue:217/255.f alpha:1].CGColor;
}

- (void)setDealer:(Dealer *)dealer{
    if (dealer) {
        _dealer = dealer;
    }
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end
