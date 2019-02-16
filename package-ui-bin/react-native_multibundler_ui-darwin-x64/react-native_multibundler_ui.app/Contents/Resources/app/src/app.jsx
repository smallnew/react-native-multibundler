import React from 'react';

import {Button, Checkbox, Input, Radio} from 'antd';
const CheckboxGroup = Checkbox.Group;
import {ipcRenderer, remote} from "electron";
import {ChildProcess} from "child_process";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const path = require('path');
const fs=require("fs");
var _ = require('lodash');
const { TextArea } = Input;
const packageLockFileName = 'package-lock.json';
const packageFileName = 'package.json';
//1 bin 2 0.58 0.59 3 demo
export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      platform:'android',//平台 android iOS
      env:'false',//环境 release debug
      entry:null,//打包入口
      type:'base',//基础包 业务包
      bundleDir:null,//打包后bundle目录
      bundleName:null,//bundle名
      assetsDir:null,
      deps:[],//
      depsChecked:[],
      cmdStr:'',
      loading:false
    };
    this.onDepCheckChange = this.onDepCheckChange.bind(this);
    this.selectFile = this.selectFile.bind(this);
    this.renderFileSelect = this.renderFileSelect.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.render = this.render.bind(this);
    this.renderPlatformSelect = this.renderPlatformSelect.bind(this);
    this.renderEnvSelect = this.renderEnvSelect.bind(this);
    this.fileSelected = this.fileSelected.bind(this);
    this.renderTypeSelect = this.renderTypeSelect.bind(this);
    this.renderBundleName = this.renderBundleName.bind(this);
    this.startPackage = this.startPackage.bind(this);
  }

  componentDidMount(){
    //load lock.json
    const curDir = /*'/Users/wangeuipeng/Works/learn/react-native/reactnative_multibundler';*/__dirname;
    console.log('curDir',path.dirname(curDir));
    let dirTmp = /*'/Users/wangeuipeng/Works/learn/react-native/reactnative_multibundler';*/__dirname;
    dirTmp = path.dirname(dirTmp);
    dirTmp = path.dirname(dirTmp);
    while(dirTmp.length>2){
      console.log('curDir',dirTmp);
      let packageLockFile = path.join(dirTmp,packageLockFileName);
      let packageJsonFile = path.join(dirTmp,packageFileName);
      if(fs.existsSync(packageLockFile)){
        console.log('package-lock.json',packageLockFile);
        this.projDir = dirTmp;//要分包的项目目录
        this.projPackageDir = dirTmp;
        this.packageFilePath = packageJsonFile;//packageJson
        this.packageFileLockPath = packageLockFile;
        break;
      }
      dirTmp = path.dirname(dirTmp);
    }
    console.log('projDir',this.projDir);
    if(this.packageFilePath!=null){
      this.setState({entry:this.projPackageDir+path.sep+'platformDep-ui.js'});
      fs.readFile(this.packageFilePath, 'utf8', (err, fileContent) => {
        if (err) {
          if (err.code === 'ENOENT') {
            return
          }
          throw new Error(err)
        }

        const content = JSON.parse(fileContent);
        let deps = content['dependencies'];
        this.depsStrs = Object.keys(deps);
        let depsArray = Object.keys(deps);
        for(let i=0;i<depsArray.length;i++){
          let depStr = depsArray[i];
          if(depStr=='react'||depStr=='react-native'){
            depsArray[i]={value:depStr,label:depStr,check:true,disabled:true};
          }
        }
        this.setState({deps:depsArray});
        console.log('package json content',content);
      });
    }else{
      alert('请在先在目标工程执行npm install');
    }
    const fixPath = require('fix-path');
    fixPath();

  }


  renderItem(name,item) {
    return (<div style={{display:'flex',flexDirection:'row',alignItems:'center',marginTop:'12px'}}>
      <div style={{marginRight:'10px'}}>{name+' :  '}</div>
      <div style={{display:'flex',flexDirection:'row'}}>{item}</div>
    </div>)
  }

  renderPlatformSelect(){
    return (<Radio.Group defaultValue="android" buttonStyle="solid"
                         onChange={(e)=>{
                           console.log('renderPlatformSelect',e.target.value);
                           this.setState({platform:e.target.value});
                         }
                         }>
      <Radio.Button value="android">Android</Radio.Button>
      <Radio.Button value="ios">iOS</Radio.Button>
    </Radio.Group>);
  }
  renderEnvSelect(){
    return (<Radio.Group defaultValue="false" buttonStyle="solid"
    onChange={(e)=>{
      console.log('renderEnvSelect',e);
      this.setState({env:e.target.value});
    }}>
      <Radio.Button value="false">Release</Radio.Button>
      <Radio.Button value="true">Debug</Radio.Button>
    </Radio.Group>);
  }
  renderTypeSelect(){
    return (<Radio.Group defaultValue="base" buttonStyle="solid"
                         onChange={(e)=>{
                           console.log('renderEnvSelect',e);
                           this.setState({type:e.target.value});
                           if(e.target.value=='base'){
                             this.setState({entry:this.projPackageDir+path.sep+'platformDep-ui.js'});
                           }else{
                             this.setState({entry:''});
                           }
                         }}
    >
      <Radio.Button value="base">基础包</Radio.Button>
      <Radio.Button value="buz">业务包</Radio.Button>
    </Radio.Group>);
  }
  renderFileSelect(id){
    let buttonName = '选择目录';
    if(id=='entry'){//file
      buttonName = '选择文件';
      if(this.state.entry){
        buttonName = this.state.entry;
      }
    }else if(id=='bundle'){
      if(this.state.bundleDir){
        buttonName = this.state.bundleDir;
      }
    }else if(id=='assets'){
      if(this.state.assetsDir){
        buttonName = this.state.assetsDir;
      }
    }
    return (<Button  onClick={_=>this.selectFile(id)}  block>{buttonName}</Button>);
  }

  fileSelected(id,path){
    if(id=='entry'){//file
      this.setState({entry:path});
    }else if(id=='bundle'){
      this.setState({bundleDir:path});
    }else if(id=='assets'){
      this.setState({assetsDir:path});
    }
  }

  selectFile(id){
    let openType = 'openDirectory';
    let title = '选择';
    let filter = undefined;
    if(id=='entry') {
      openType = 'openFile';
      title = '打包入口文件选择';
      filter = [
        {
          extensions: ['js']
        }
      ]
    }else if(id=='bundle'){
      title = '打包bundle目录选择';
    }else if(id=='assets'){
      title = '打包资源目录选择';
    }
    console.log('projDir',this.projDir);
    remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        defaultPath:this.projDir,
        title: title,
        buttonLabel: '选择',
        filters: filter,
        properties: [openType]
      },
      (filePath) => {
        if (filePath) {
          const directory = filePath[0];
          this.fileSelected(id,directory);
        }
      }
    )
  }

  renderBundleName(){
    return (<Input ref={(componentInput)=>{this.bundleNameInput = componentInput}}/>);
  }

  onDepCheckChange(e){
    const {type} = this.state;
    if(type=='buz'){
      e = e.filter((value)=>!(value=='react'||value=='react-native'));
    }
    console.log('onDepCheckChange',e);
    this.setState({depsChecked:e});
  }

  renderDep(){
    const {deps,depsChecked,type} = this.state;
    let options = deps;
    let defaultChecked = ['react','react-native'];
    if(type=='buz'){//业务包不可能把react打进去
      options =options.filter((value)=>!(value=='react'||value=='react-native'
        ||value.value=='react'||value.value=='react-native'));
      defaultChecked = undefined;
    }
    return <CheckboxGroup options={options} onChange={this.onDepCheckChange} defaultValue={defaultChecked}/>
  }

  getAllDeps(platformDepArray,lockDeps){
    let allPlatformDep = [];
    let travelStack = platformDepArray;
    while(travelStack.length!=0){
      let depItem = travelStack.pop();
      allPlatformDep.push(depItem);
      console.log('depItem',depItem);
      let depDetail = lockDeps[depItem];
      if(depDetail==null){
        console.log('depItem no found',depItem);
        continue;
      }
      let depReq = depDetail['requires'];
      if(depReq!=null) {
        travelStack = travelStack.concat(_.difference(Object.keys(depReq),allPlatformDep));//difference防止循环依赖
      }
    }
    return _.uniq(allPlatformDep);
  }

  startPackage(){
    this.setState({cmdStr:''});
    const { exec } = require('child_process');
    const {platform,env,entry,type,bundleDir,assetsDir,depsChecked} = this.state;
    let bundleName = this.bundleNameInput.state.value;
    console.log('bundleName',bundleName
    ,'platform',platform,'env',env,'entry',entry,'type',type,'bundleDir',bundleDir,'assetsDir',assetsDir
    ,'depsChecked',depsChecked);
    if(entry==null){
      alert("请选择打包的js入口");
      return;
    }
    if(bundleDir==null){
      alert("请选择jsbundle的目标目录");
      return;
    }
    if(bundleName==null){
      alert("请选择jsbundle的文件名称");
      return;
    }
    if(assetsDir==null){
      alert("请选择资源文件的目标目录");
      return
    }
    let bundleConifgName;
    let platformDepJsonPath = this.projPackageDir+path.sep+'platformDep.json';
    if(type=='base'){
      bundleConifgName = 'platform-ui.config.js';
      fs.writeFileSync(platformDepJsonPath,JSON.stringify(depsChecked));
      let platformDepImportPath = this.projPackageDir+path.sep+'platformDep-import.js';
      let importStr = '';
      depsChecked.forEach((moduleStr)=>{
        importStr = importStr+'import \''+moduleStr+'\'\n';
      });
      fs.writeFileSync(platformDepImportPath,importStr);
    }else {
      bundleConifgName = 'buz-ui.config.js';
      const platformDepArray = require(platformDepJsonPath);
      if(!Array.isArray(platformDepArray)){
        alert("必须先打基础包");
        return;//必须先打基础包
      }
      if(depsChecked.length>0){//需要过滤platformDepArray
        const packageLockObj = require(this.packageFileLockPath);
        const lockDeps = packageLockObj['dependencies'];
        console.log('start deal platform dep');
        let allPlatformDep = this.getAllDeps(platformDepArray,lockDeps);
        console.log('start deal buz dep');
        let allBuzDep = this.getAllDeps(depsChecked,lockDeps);
        let filteredBuzDep = _.difference(allBuzDep,allPlatformDep);
        let buzDepJsonPath = this.projPackageDir+path.sep+'buzDep.json';//业务包依赖的路径
        fs.writeFileSync(buzDepJsonPath,JSON.stringify(filteredBuzDep));//todo 打包脚本读取该数组
      }
    }
    let cmdStr = 'node ./node_modules/react-native/local-cli/cli.js bundle  --platform '+platform
      +' --dev '+env+' --entry-file '+entry+' --bundle-output '+bundleDir+path.sep+bundleName
      + ' --assets-dest '+assetsDir+' --config '+this.projPackageDir+path.sep+bundleConifgName;
    this.setState({loading:true});
    let packageProcess = exec(cmdStr, {cwd:this.projDir},(error, stdout, stderr) => {
      this.setState({loading:false});
      if (error) {
        console.error(`执行出错: ${error}`);
        this.setState({cmdStr:error});
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
    packageProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      let cmdRetStrs = data+this.state.cmdStr;
      this.setState({cmdStr:cmdRetStrs});
    });
  }

  render() {
    return (<div style={{paddingLeft:30,paddingTop:18,display:'flex',flexDirection:'column'}}>
      {this.renderItem('平台',this.renderPlatformSelect())}
      {this.renderItem('环境',this.renderEnvSelect())}
      {this.renderItem('类型',this.renderTypeSelect())}
      {this.renderItem('入口',this.renderFileSelect('entry'))}
      {this.renderItem('bundle目录',this.renderFileSelect('bundle'))}
      {this.renderItem('bundle名称',this.renderBundleName())}
      {this.renderItem('assets目录',this.renderFileSelect('assets'))}
      {this.renderItem('模块依赖',this.renderDep())}
      <Button style={{marginTop:12,marginLeft:10,width:100}} loading={this.state.loading} onClick={this.startPackage}>打包</Button>
      <TextArea value={this.state.cmdStr} rows={4} readonly={true} style={{marginTop:12,width:500}}/>
    </div>);
  }
}
