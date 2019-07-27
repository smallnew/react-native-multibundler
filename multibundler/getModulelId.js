const pathSep = require('path').sep;
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

module.exports={getModuleId}
