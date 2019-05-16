import 'dart:io';

/**
 * 基于 tlxfif/weiqi v1.0.0
 */

//棋子类型 空、黑、白
class qiType {
  static const empty=0;
  static const black=1;
  static const white=2;
}

class core {
  //路数
  var boardSize = 19;
  //棋盘
  var pan = [];
  //下棋记录
  var record = [];
  //跳转指针 上一步 下一步
  var jumpPointer = -1;
  //黑白提子
  var blackUpCount = 0;
  var whiteUpCount = 0;
  //下一手 颜色 黑先
  var whoIsPlay=qiType.black;

  //计算 提子数
  calcUpQi(){
    if(record.length==0||jumpPointer<0||jumpPointer>record.length-1){return false;}
    blackUpCount=0;
    whiteUpCount=0;
    for (var i=0;i<=jumpPointer;i++){
      var r=record[i];
      if(r[2]==qiType.white){
        whiteUpCount+=r[3].length;
      }else{
        blackUpCount+=r[3].length;
      }
    }
  }
  backStep() {
    if(record.length==0){return false;}
    if(jumpPointer<0){
      exception("已经是第一步了");
    }
    if(record[jumpPointer][2]==qiType.white){
      whiteUpCount-=record[jumpPointer][3].length;
    }else{
      blackUpCount-=record[jumpPointer][3].length;
    }
    setQi(record[jumpPointer],true);
    jumpPointer-=1;

  }
  nextStep() {
    if(record.length==0){return false;}
    if(jumpPointer+1>record.length-1){
      exception("已经是第最后一步了");
    }
    jumpPointer+=1;
    if(record[jumpPointer][2]==qiType.white){
      whiteUpCount+=record[jumpPointer][3].length;
    }else{
      blackUpCount+=record[jumpPointer][3].length;
    }
    setQi(record[jumpPointer],false);
  }
  startStep() {
    if(record.length==0){return false;}
    jumpPointer=-1;
    pan=BoardGenerator(boardSize);
    blackUpCount=0;
    whiteUpCount=0;
  }
  endStep() {
    if(record.length==0){return false;}
    startStep();
    jumpPointer=record.length-1;
    for(var i=0;i<jumpPointer+1;i++){
      setQi(record[i],false);
    }
    calcUpQi();
  }
  //设置棋盘布局 [x,y,qiType.black,upArr]
  setQi(r,[isBack=true]) {
    if(!r||r.length!=4){
      return false;
    }
    setOneRecord(r,isBack);
    if(isBack){
      prevPlay();
    }else{
      whoIsPlay=getAnotherPlay(r[2]);
    }
  }
  //设置一条记录 [[x,y,qiType.black,upArr]]
  setOneRecord(r,[isBack=true]) {
    if(isBack){
      pan[r[0]][r[1]] = qiType.empty;
      if(r[3].length>0){
        setAreaQi(r[3],getAnotherPlay(r[2]));
      }
    }else{
      pan[r[0]][r[1]]=r[2];
      if(r[3].length>0){
        setAreaQi(r[3]);
      }
    }
  }

  addRecord(r){
    if(jumpPointer<=record.length-1){
      if(jumpPointer==-1){
        record=[];//数组清空
      }else{
        record=record.sublist(0,jumpPointer+1);
      }
    }
    record.add(r);
    jumpPointer=record.length-1;

  }
  play(row, col,[player=null]) {
    if (player!=null && (player == qiType.black || player == qiType.white)) {
      whoIsPlay = player;
    }
    onTheBoard(row, col, () {
      exception("超出棋盘限制");
    });
    // 处理已有棋子在此
    if (pan[row][col] != 0) {
      exception("此数有棋子");
    }
    var qi = [];
    var deadArray = [];
    //判断是否有气
    if (haveAir(row, col, qi) == 0) {
      var is_eat;
      //是否能吃 对手的棋
      deadArray = eat(row, col, qi);
      if (deadArray.length > 0) {
        is_eat = true;
      }
      jie(row, col, deadArray);
      //无气并且没有吃对方
      if (!is_eat) {
        var count = 0;
        var sumQi = 0;
        for (var g = 0; g < qi.length; g++) {
          //气点与势力范围
          var round = [],
              point = [];
          if (pan[qi[g][0]][qi[g][1]] != whoIsPlay) {
            continue;
          }
          count++;
          sumQi += getQi(qi[g][0], qi[g][1], round, point);
        }
        if (count >= sumQi) {
          exception("禁入点,没有气不能下");
        }
      }
    } else {
      deadArray = eat(row,col,qi);
    }
    pan[row][col] = whoIsPlay;
    addRecord([row, col, whoIsPlay, deadArray]);
    if (whoIsPlay == qiType.white) {
      whiteUpCount += deadArray.length;
    } else {
      blackUpCount += deadArray.length;
    }
    setAreaQi(deadArray);
    nextPlay();
  }
  //设置棋数组->空 如果有类型就设置类型
  setAreaQi(deadArray,[num type=null]) {
    if(deadArray.length>0){
      for(var k=0;k<deadArray.length;k++){
        pan[deadArray[k][0]][deadArray[k][1]]=type!=null?type:qiType.empty;
      }
    }
  }
  //吃子函数  qi 势力范围
  eat(row,col,qi) {
    //死亡区域
    var deadRound=[];
    for(var i=0;i<qi.length;i++){
      //先处理对手的
      if(qi[i][2]!=whoIsPlay){
        //气点与势力范围
        var round=[],point=[];
        var qiCount=getQi(qi[i][0],qi[i][1],round,point);
        //只有一气，并且 气点在当前下的坐标时 提子
        if(qiCount==1&&point.length==1){
          if(point[0][0]==row&&point[0][1]==col){
            if(round.length>0){
              deadRound.addAll(round);
            }
          }
        }
      }
    }
    return deadRound;
  }
  //劫
  jie(row,col,deadArray) {
    //目前只判断单劫
    if(deadArray.length!=1){
      return false;
    }
    //至少有两步记录 判断劫 up/down
    if(record.length>=2){
      //上一步
      var backStep = record[record.length-1];
      //如果上一步有吃子 并且 吃的是一个
      if(backStep[3].length==1){
        //死亡的地方正是被下的地方
        if(backStep[3][0][0]==row&&backStep[3][0][1]==col){
          exception("劫");
        }
      }
    }
    return false;
  }
  //判断单个子是否有气  返回相邻元素  只得空气点
  haveAir(row,col,array,[onlyEmpty=false]){
    isAir(r, c) {
      var flag;
      //四个方向判断
      flag=onTheBoard(r,c, () {
        return false;
      });
      if(flag){
        if(onlyEmpty){
          if(pan[r][c]==qiType.empty){
            arrayAdd(r,c,pan[r][c],array);
          }
        }else{
          arrayAdd(r,c,pan[r][c],array);
        }
        if(pan[r][c]==qiType.empty){
          return 1;
        }
      }
      return 0;
    }
    var flag1=isAir(row-1, col);
    var flag2=isAir(row+1, col);
    var flag3=isAir(row, col-1);
    var flag4=isAir(row, col+1);
    return flag1+flag2+flag3+flag4;
  }
  //得到气的多少  x,y,势力范围,气点
  getQi(row, col,round,point) {
    allHaveAir(row, col,null,round);
    for(var i=0;i<round.length;i++){
      haveAir(round[i][0],round[i][1],point,true);
    }
    return point.length;
  }
  //得到势力范围
  allHaveAir(row, col,type,array){
    var flag;
    //四个方向判断
    flag=onTheBoard(row,col,() {
      return false;
    });
    if(flag){
      if(pan[row][col]==qiType.empty){
      return array;
      }else{
      if(type==null){
        type=pan[row][col];
        var ret=arrayAdd(row,col,type,array);
        if(ret==false){
          return false;
        }
      }else{
        if(pan[row][col]==type){
          var ret=arrayAdd(row,col,type,array);
          if(ret==false){
          return false;
          }
        }else{
          return false;
        }
      }
    }
    allHaveAir(row-1, col,type,array);
    allHaveAir(row+1, col,type,array);
    allHaveAir(row, col-1,type,array);
    allHaveAir(row, col+1,type,array);
    }
  }
  //数组去重增加
  arrayAdd(row,col,type,array) {
    if(array==null){
      return false;
    }
    for(var i=0;i<array.length;i++){
      if(array[i][0]==row&&array[i][1]==col){
        return false;
      }
    }
    array.add([row,col,type]);
    return true;
  }
  //棋子是否在棋盘内
  onTheBoard(row,col,callback) {
    if(row<0||row>boardSize-1||col<0||col>boardSize-1){
      if(callback!=null){
        return callback();
      }
    }
    return true;
  }
  //上一手角色
  prevPlay() {
    if(jumpPointer<=0||record.length<=1){
      whoIsPlay=qiType.black;
    }else{
      whoIsPlay=record[jumpPointer][2];
    }
  }
  //下一手角色
  nextPlay() {
    if(whoIsPlay==qiType.black){
      whoIsPlay=qiType.white;
    }else{
      whoIsPlay=qiType.black;
    }
  }
  //另一手角色
  getAnotherPlay(type) {
    if(type==qiType.black){
      type=qiType.white;
    }else{
      type=qiType.black;
    }
    return type;
  }
  //棋盘大小生成函数 必须为单数
  BoardGenerator(size) {
    if (size < 7 || size % 2 != 1) {
      exception("棋盘必须为大于7的单数");
    }
    var yArr = [];
    for (var i = 0; i < size; i++) {
      List<num> xArr = [];
      for (var j = 0; j < size; j++) {
        xArr.add(0);
      }
      yArr.add(xArr);
    }
    pan=yArr;
  }

  //抛出异常
  exception(msg) {
    throw msg;
  }


}
void main(List<String> arguments) {
  var weiqi=new core();
  weiqi.BoardGenerator(19);
  while (true) {
    var byte = stdin.readLineSync().trim();
    if (byte==0) {
      print("退出游戏");
      return null;
    }
    var z=byte.split(",");
    weiqi.play(int.parse(z[0]),int.parse(z[1]));
    printPan(weiqi.pan);
  }
}

printPan(pan){
  for(var i=0;i<pan.length;i++){
    print(pan[i]);
  }
  print("---------------------------------------------------------");
}