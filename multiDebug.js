const pathSep = require('path').sep;
const fs=require("fs");
const buzEntrys = require("./multibundler/DegbugBuzEntrys.json");

let buzDebugCode = 'import {AppRegistry} from \'react-native\';\n';
buzEntrys.forEach((entryItem)=>{
  let buzItemStr = fs.readFileSync(entryItem,'utf-8');
  let buzAfter = buzItemStr.replace(/(AppRegistry,|AppRegistry ,|AppRegistry)/,'');
  buzDebugCode+=buzAfter;
});

fs.writeFileSync('./MultiDenugEntry.js',buzDebugCode);//拼接需要测试的buz模块

const { exec } = require('child_process');
let cmdStr = 'node ./node_modules/react-native/local-cli/cli.js start';//执行start
let packageProcess = exec(cmdStr, {cwd:__dirname},(error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错: ${error}`);
    return;
  }
  console.log(`${stdout}`);
  console.log(`${stderr}`);
});
packageProcess.stdout.on('data', (data) => {
  console.log(`${data}`);
});
