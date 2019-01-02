const pathSep = require('path').sep;
function createModuleIdFactory() {
    const projectRootPath = __dirname;//获取命令行执行的目录，__dirname是nodejs提供的变量
    return path => {
        let name = '';
        if(path.indexOf('node_modules'+pathSep+'react-native'+pathSep+'Libraries'+pathSep)>0){
            name = path.substr(path.lastIndexOf(pathSep)+1);//这里是去除路径中的'node_modules/react-native/Libraries/‘之前（包括）的字符串，可以减少包大小，可有可无
        }else if(path.indexOf(projectRootPath)==0){
            name = path.substr(projectRootPath.length+1);//这里是取相对路径，不这么弄的话就会打出_user_smallnew_works_....这么长的路径，还会把计算机名打进去
        }
        name = name.replace('.js','');//js png字符串没必要打进去
        name = name.replace('.png','');
        name = name.replace(new RegExp(pathSep,"gm"),'_');//把path中的/换成下划线

        return name;
    };
}


module.exports = {

    serializer: {
        createModuleIdFactory:createModuleIdFactory
        /* serializer options */
    }
};
