/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "RCTBridge.h"
#import <React/RCTBridge+Private.h>

@interface AppDelegate ()
{
  RCTBridge *bridge;
  BOOL isBuzLoaded;
}
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"platform.ios" withExtension:@"bundle"];
  NSString *path = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask,YES) objectAtIndex:0];
  NSLog(@"RCTCXXBridge jscode path %@",path);
  bridge = [[RCTBridge alloc] initWithBundleURL:jsCodeLocation
                                 moduleProvider:nil
                                  launchOptions:launchOptions];
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(loadBuzBundle) name:@"RCTJavaScriptDidLoadNotification" object:nil];
  return YES;
}

-(void)loadBuzBundle{
  NSLog(@"RCTCXXBridge loadBuzBundle");
  if(isBuzLoaded){
    return;
  }
  NSURL *jsCodeLocationBuz = [[NSBundle mainBundle] URLForResource:@"index.ios" withExtension:@"bundle"];
  NSError *error = nil;
  NSData *sourceBuz = [NSData dataWithContentsOfFile:jsCodeLocationBuz.path
                                             options:NSDataReadingMappedIfSafe
                                               error:&error];
  [bridge.batchedBridge executeSourceCode:sourceBuz sync:NO];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"reactnative_multibundler" initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  isBuzLoaded = YES;
}

@end
