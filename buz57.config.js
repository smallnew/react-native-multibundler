const pathSep = require('path').sep;
const plaformModules = require('./moduleMap/platformMapping.json');

function getModuleId(projectRootPath,path){
  let name = '';
  if (path.indexOf('node_modules' + pathSep + 'react-native' + pathSep + 'Libraries' + pathSep) > 0) {
    name = path.substr(path.lastIndexOf(pathSep) + 1);
  } else if (path.indexOf(projectRootPath) == 0) {
    name = path.substr(projectRootPath.length + 1);
  }
  name = name.replace('.js', '');
  name = name.replace('.png', '');
  let regExp = pathSep == '\\' ? new RegExp('\\\\', "gm") : new RegExp(pathSep, "gm");
  name = name.replace(regExp, '_');//把path中的/换成下划线
  return name;
}

function postProcessModulesFilter(module) {
  const projectRootPath = __dirname;
  if (plaformModules == null || plaformModules.length == 0) {
    console.log('请先打基础包');
    process.exit(1);
    return false;
  }
  const path = module['path']
  if (path.indexOf("__prelude__") >= 0 ||
    path.indexOf("/node_modules/react-native/Libraries/polyfills") >= 0 ||
    path.indexOf("source-map") >= 0 ||
    path.indexOf("/node_modules/metro/src/lib/polyfills/") >= 0) {
    return false;
  }
  if (module['path'].indexOf(pathSep + 'node_modules' + pathSep) > 0) {
    if ('js' + pathSep + 'script' + pathSep + 'virtual' == module['output'][0]['type']) {
      return true;
    }
    const name = getModuleId(projectRootPath,path);
    if (plaformModules.indexOf(name) >= 0) {//这个模块在基础包已打好，过滤
      return false;
    }
  }
  return true;
}

function createModuleIdFactory() {
  const projectRootPath = __dirname;
  return path => {
    let name = getModuleId(projectRootPath,path);
    return name;
  };
}


module.exports = {

  serializer: {
    createModuleIdFactory: createModuleIdFactory,
    processModuleFilter: postProcessModulesFilter
    /* serializer options */
  }
};
