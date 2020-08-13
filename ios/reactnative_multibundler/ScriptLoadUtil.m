//
//  ScriptLoadUtil.m
//  reactnative_multibundler
//
//  Created by smallnew on 2019/12/30.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "ScriptLoadUtil.h"
#import "RCTBridge.h"
#import <React/RCTBridge+Private.h>
#import "objc/runtime.h"
#import <React/CoreModulesPlugins.h>

static const BOOL MULTI_DEBUG = NO;//如果画要调试，需设置成YES
static NSMutableArray* loadedScripts = nil;
static RCTBridge *rctBridge = nil;

@implementation ScriptLoadUtil

+(void)init:(RCTBridge*) bridge{
  rctBridge = bridge;
}

+(RCTBridge*)getBridge{
  return rctBridge;
}

+(BOOL)isDebugable{
  return MULTI_DEBUG;
}

+(BOOL)isScriptLoaded:(NSString*) moduleName{
  if(loadedScripts==nil){
    return NO;
  }
  return [loadedScripts indexOfObject:moduleName]!=NSNotFound;
}

+(NSString*) getDownloadedScriptPath:(NSString*)path moduleName:(NSString*) moduleName{
  NSString* subScriptDir = [@"Bundles" stringByAppendingPathComponent:moduleName];
  NSString * bundlePath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:subScriptDir];
  NSString* scriptPath = [bundlePath stringByAppendingPathComponent:path];
  return scriptPath;
}

+(NSString*) getDownloadedScriptDirWithModuleName:(NSString*) moduleName{
  NSString* subScriptDir = [@"Bundles" stringByAppendingPathComponent:moduleName];
  NSString * bundlePath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:subScriptDir];
  return bundlePath;
}

+(void)loadScriptWithBridge:(RCTBridge*)bridge path:(NSString*)path moduleName:(NSString*) moduleName mainBundle:(BOOL)inMain{
  if(loadedScripts==nil){
    loadedScripts = [NSMutableArray array];
  }
  if([loadedScripts indexOfObject:moduleName]==NSNotFound){
    [loadedScripts addObject:moduleName];
    NSString *jsCodeLocationBuz = nil;
    if(inMain==YES){
      jsCodeLocationBuz = [[NSBundle mainBundle] URLForResource:path withExtension:@""].path;
    }else{
      NSString* scriptPath = [self getDownloadedScriptPath:path moduleName:moduleName];
      jsCodeLocationBuz = scriptPath;
    }
    NSError *error = nil;
    NSData *sourceBuz = [NSData dataWithContentsOfFile:jsCodeLocationBuz
                                           options:NSDataReadingMappedIfSafe
                                             error:&error];
    [bridge.batchedBridge executeSourceCode:sourceBuz sync:NO];
  }
  return;
}

@end
