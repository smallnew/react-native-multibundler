//
//  ReactController.m
//  reactnative_multibundler
//
//  Created by smallnew on 2019/12/27.
//

#import <Foundation/Foundation.h>
#import "ReactController.h"
#import <React/RCTRootView.h>
#import "ScriptLoadUtil.h"
#import "BundleDownloadHandler.h"

@interface ReactController()
@property (nonatomic, strong) UIView *rctView;
@property (nonatomic, readonly) RCTBridge *rctBridge;
@property (nonatomic, strong) NSString *url;
@property (nonatomic, strong) NSString *path;
@property (nonatomic, assign) BundleType type;
@property (nonatomic, strong) NSString *name;
@end


@implementation ReactController
- (instancetype)initWithURL:(NSString *)url path:(NSString *)path type:(BundleType) type moduleName:(NSString *) name{
  if (self = [super init]) {
    self.url = url;
    self.path = path;
    self.type = type;
    self.name = name;
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  if([ScriptLoadUtil isDebugable]!=YES){
    [self loadScript];
  }
  if(self.type==InApp||[ScriptLoadUtil isScriptLoaded:self.name]){
    [self initView];
  }
}

-(void)loadScript{
  RCTBridge* bridge = [ScriptLoadUtil getBridge];
  if(self.type==InApp){
    NSString* mainBundlePath = [NSBundle mainBundle].bundlePath;
    [[NSNotificationCenter defaultCenter] postNotificationName:@"BundleLoad" object:nil userInfo:@{@"path":[@"file://" stringByAppendingString:[mainBundlePath stringByAppendingString:@"/"]]}];//通知rn更换查找图片资源的路径
    [ScriptLoadUtil loadScriptWithBridge:bridge path:self.path moduleName:self.name mainBundle:true];
  }else if(self.type==NetWork){
    NSString* downloadedBundlePath = [ScriptLoadUtil getDownloadedScriptDirWithModuleName:self.name];
    if([ScriptLoadUtil isScriptLoaded:self.name]){
      [[NSNotificationCenter defaultCenter] postNotificationName:@"BundleLoad" object:nil userInfo:@{@"path":[@"file://" stringByAppendingString:[downloadedBundlePath stringByAppendingString:@"/"]]}];//通知rn更换查找图片资源的路径
      return;
    }
    self.view.backgroundColor = [UIColor whiteColor];
    UIActivityIndicatorView* loadingView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:(UIActivityIndicatorViewStyleGray)];
    loadingView.center = CGPointMake([[UIScreen mainScreen] bounds].size.width/2, 200);
    loadingView.color = [UIColor blueColor];
    [self.view addSubview:loadingView];
    [loadingView startAnimating];
  BundleDownloadHandler* downloadHandler = [BundleDownloadHandler alloc];
   [downloadHandler downloadBundle:self.url moduleName:self.name downloadCompleteHandler:^(BOOL success, NSString *bundlePath) {
     NSLog(@"unzip success %@",bundlePath);
    [[NSNotificationCenter defaultCenter] postNotificationName:@"BundleLoad" object:nil userInfo:@{@"path":[@"file://" stringByAppendingString:[downloadedBundlePath stringByAppendingString:@"/"]]}];//通知rn更换查找图片资源的路径
     [[NSOperationQueue mainQueue] addOperationWithBlock:^{
       [loadingView stopAnimating];
       [loadingView removeFromSuperview];
       [ScriptLoadUtil loadScriptWithBridge:bridge path:self.path moduleName:self.name mainBundle:false];
       [self initView];
     }];
   }];
  }
  
}

-(void)initView{
  RCTBridge* bridge = [ScriptLoadUtil getBridge];
  RCTRootView* view = [[RCTRootView alloc] initWithBridge:bridge moduleName:self.name initialProperties:nil];
  view.frame = self.view.bounds;
  view.backgroundColor = [UIColor whiteColor];
  [self setView:view];
}
@end
