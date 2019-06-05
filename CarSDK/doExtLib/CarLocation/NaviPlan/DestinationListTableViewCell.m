//
//  DestinationListTableViewCell.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/26.
//
//

#import "DestinationListTableViewCell.h"
#import "UILabel+Extension.h"
#import "UIView+Extension.h"
#import "BundleTools.h"
#import "DestinationLocation.h"
#define TriangleHeight 8
#define TriangleWidth 18
#define BorderWidth 0.5
#define BorderColor [UIColor colorWithRed:236/255.f green:236/255.f blue:236/255.f alpha:1]
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface DestinationListTableViewCell()

@property (weak, nonatomic) IBOutlet UILabel *nameLabel;

@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img1;
@property (weak, nonatomic) IBOutlet UILabel *addressLabel;

@end

@implementation DestinationListTableViewCell



- (void)awakeFromNib {
    [super awakeFromNib];
    [self.img1 setImage:[BundleTools imageNamed:@"location_black"]];
    // Initialization code
    self.nameLabel.font = [UIFont systemFontOfSize:self.nameLabel.font.pointSize * factor_h];
    self.addressLabel.font = [UIFont systemFontOfSize:self.addressLabel.font.pointSize * factor_h];
}

- (void)setLocation:(DestinationLocation *)location{
    _location = location;
    _nameLabel.text = location.name;
    [_nameLabel resizeWidthUpTo:(SCREEN_W - 2*_nameLabel.x)];
    
    _addressLabel.text = location.address;
    [_addressLabel resizeWidthUpTo:(SCREEN_W - 2*_nameLabel.x)];
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end
