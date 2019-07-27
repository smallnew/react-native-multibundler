const pathSep = require('path').sep;
const fs=require("fs");
const moduleMapDir = "multibundler";
const platfromMapName = "platformMapping.json";
const platfromNameArray = [];
const getModuleId = require('./multibundler/getModulelId').getModuleId;

function createModuleIdFactory() {
    const projectRootPath = __dirname;//获取当前目录，__dirname是nodejs提供的变量
    return path => {
      let name = getModuleId(projectRootPath,path);
      platfromNameArray.push(name);
      const platformMapDir = __dirname+pathSep+moduleMapDir;
      if(!fs.existsSync(platformMapDir)){
        fs.mkdirSync(platformMapDir);
      }
      const platformMapPath = platformMapDir+pathSep+platfromMapName;
      fs.writeFileSync(platformMapPath,JSON.stringify(platfromNameArray));

        return name;
    };
}


module.exports = {

    serializer: {
        createModuleIdFactory:createModuleIdFactory
        /* serializer options */
    }
};
