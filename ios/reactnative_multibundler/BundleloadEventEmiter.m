//
//  BundleloadEventEmiter.m
//  reactnative_multibundler
//
//  Created by smallnew on 2020/1/11.
//

#import <Foundation/Foundation.h>
#import "BundleloadEventEmiter.h"

@implementation BundleloadEventEmiter

{
  bool hasListeners;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(bundleLoaded:)
                                                 name:@"BundleLoad"
                                               object:nil];
  }
  return self;
}

RCT_EXPORT_MODULE();

// Will be called when this module's first listener is added.
-(void)startObserving
{
  hasListeners = YES;
  // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving
{
  hasListeners = NO;
  // Remove upstream listeners, stop unnecessary background tasks
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"BundleLoad"];
}

- (void)bundleLoaded:(NSNotification *)notification
{
  NSString *bundlePath = notification.userInfo[@"path"];
  if (hasListeners) { // Only send events if anyone is listening
    [self sendEventWithName:@"BundleLoad" body:@{@"path": bundlePath}];
  }
}

@end
