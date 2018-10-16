//
//  RCTBridge.h
//  HePmsApp
//
//  Created by wangeuipeng on 2018/10/15.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface RCTBridge (RnLoadJS) // RN私有类 ，这里暴露他的接口

- (void)executeSourceCode:(NSData *)sourceCode sync:(BOOL)sync;

@end
