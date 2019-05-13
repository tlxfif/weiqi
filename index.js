//棋子类型 空、黑、白
let qiType={
    empty:0,
    black:1,
    white:2
};
let boardSize=19;
//棋盘大小
let pan=BoardGenerator(boardSize);
//下棋记录
let record=[];
let recordType={
    down:1, //下子
    up:1    //提子
};
//arr=[x,y,qiType.black]
function addRecord(recordType,re){
    record.push([recordType,re])
}
//下一手 颜色 黑先
let whoIsPlay=qiType.black;
function play(row, col) {
    onTheBoard(row,col,function () {
        exception("超出棋盘限制")
    });
    // 处理已有棋子在此
    if (pan[row][col] !== 0) {
        exception("此数有棋子")
    }
    let qi=[];
    let deadArray=[];
    //判断是否有气
    if(haveAir(row,col,qi)===0){
        let is_eat;
        //是否能吃 对手的棋
        deadArray=eat(row,col,qi)
        if(deadArray.length>0){
            is_eat=true;
        }
        jie(row,col,deadArray)
        //无气并且没有吃对方
        if(!is_eat){
            let count=0;
            let sumQi=0;
            for(let g=0;g<qi.length;g++){
                //气点与势力范围
                let round=[],point=[];
                if(pan[qi[g][0]][qi[g][1]]!==whoIsPlay){
                    continue;
                }
                count++;
                sumQi+=getQi(qi[g][0],qi[g][1],round,point)
            }
            if(count>=sumQi){
                exception("禁入点,没有气不能下")
            }
        }
    }else{
        deadArray=eat(row,col,qi,deadArray)
    }
    pan[row][col]=whoIsPlay;
    addRecord(recordType.down,[[row,col,whoIsPlay]]);
    if(deadArray.length>0){
        addRecord(recordType.up,deadArray);
        for(let k=0;k<deadArray.length;k++){
            pan[deadArray[k][0]][deadArray[k][1]]=qiType.empty;
        }
    }
    nextPlay();
}
//吃子函数  qi 势力范围
function eat(row,col,qi) {
    //死亡区域
    let deadRound=[];
    for(let i=0;i<qi.length;i++){
        //先处理对手的
        if(qi[i][2]!==whoIsPlay){
            //气点与势力范围
            let round=[],point=[];
            let qiCount=getQi(qi[i][0],qi[i][1],round,point)
            //只有一气，并且 气点在当前下的坐标时 提子
            if(qiCount===1&&point.length===1){
                if(point[0][0]===row&&point[0][1]===col){
                    if(round.length>0){
                        deadRound=deadRound.concat(round)
                    }
                }
            }
        }
    }
    return deadRound;
}
//劫
function jie(row,col,deadArray) {
    //目前只判断单劫
    if(deadArray.length!==1){
        return false;
    }
    //至少有两步记录 判断劫 up/down
    if(record.length>=2){
        //上一步
        let backStep = record[record.length-1];
        //上上一步
        let backBackStep = record[record.length-2];
        //如果上一步是吃子
        if(backStep[0]===recordType.up){
            //如果上上一步是下子
            if(backBackStep[0]===recordType.down){
                //死亡的地方正是被下的地方
                if(backStep[1][0][0]===row&&backStep[1][0][1]===col&&backStep[1][0][2]===whoIsPlay){
                    exception("劫")
                }
            }
        }
    }
    return false;
}
//判断单个子是否有气  返回相邻元素  只得空气点
function haveAir(row,col,array,onlyEmpty=false){
    function isAir(r, c) {
        let flag;
        //四个方向判断
        flag=onTheBoard(r,c,function () {
            return false;
        });
        if(flag){
            if(onlyEmpty){
                if(pan[r][c]===qiType.empty){
                    arrayAdd(r,c,pan[r][c],array)
                }
            }else{
                arrayAdd(r,c,pan[r][c],array)
            }
            if(pan[r][c]===qiType.empty){
                return 1;
            }
        }
        return 0;
    }
    let flag1=isAir(row-1, col);
    let flag2=isAir(row+1, col);
    let flag3=isAir(row, col-1);
    let flag4=isAir(row, col+1);
    return flag1+flag2+flag3+flag4;

}
//得到气的多少  x,y,势力范围,气点
function getQi(row, col,round,point) {
    allHaveAir(row, col,undefined,round);
    let qi=0;
    for(let i=0;i<round.length;i++){
        qi+=haveAir(round[i][0],round[i][1],point,true);
    }
    return qi;
}
//得到势力范围
function allHaveAir(row, col,type=undefined,array){
    let flag;
    //四个方向判断
    flag=onTheBoard(row,col,function () {
        return false;
    });
    if(flag){
        if(pan[row][col]===qiType.empty){
            return array;
        }else{
            if(type===undefined){
                type=pan[row][col]
                let ret=arrayAdd(row,col,type,array)
                if(ret===false){
                    return false;
                }
            }else{
                if(pan[row][col]===type){
                    let ret=arrayAdd(row,col,type,array)
                    if(ret===false){
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
function arrayAdd(row,col,type,array) {
    if(typeof array==="undefined"){
        return false;
    }
    for(let i=0;i<array.length;i++){
        if(array[i][0]===row&&array[i][1]===col){
            return false;
        }
    }
    array.push([row,col,type])
    return true;
}
//棋子是否在棋盘内
function onTheBoard(row,col,callback) {
    if(row<0||row>boardSize-1||col<0||col>boardSize-1){
        if(typeof callback==="function"){
            return callback();
        }
    }
    return true;
}
//下一手角色
function nextPlay() {
    if(whoIsPlay===qiType.black){
        whoIsPlay=qiType.white;
    }else{
        whoIsPlay=qiType.black;
    }
}
//棋盘大小生成函数 必须为单数
function BoardGenerator(size=19) {
    if(size<7||size%2!==1){
        exception("棋盘必须为大于1的单数")
    }
    let yArr=[];
    for(let i=0;i<size;i++){
        let xArr=[];
        for(let j=0;j<size;j++){
            xArr.push(0);
        }
        yArr.push(xArr);
    }
    return yArr;
}
function exception(msg) {
    throw new SyntaxError(msg)
}