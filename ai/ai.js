// 初始化网络
let net = new convnetjs.Net();
net.fromJSON(json_net);

function convMove() {
    //********* buildLibertyEncoding

    let data = new convnetjs.Vol(25, 25, 8, 0);
    for (let x = 0; x < 25; x++) {
        for (let y = 0; y < 25; y++) {
            if (x < 3 || x >= 22 || y < 3 || y >= 22) {
                data.set(x, y, 7, 1);
            }
        }
    }
    //得到预测结果
    for (let x = 3; x < 22; x++) {
        for (let y = 3; y < 22; y++) {
            let i=pan[x-3][y-3];
            if(i!==0){//空棋子不用设置
                let arr=[];
                let numLiberties = 0;
                getQi(x-3,y-3,[],arr);
                numLiberties=arr.length>=4?3:arr.length;
                let depth = numLiberties - 1;
                if(i!==whoIsPlay){
                    depth += 3;
                }
                console.log({x, y, depth})
                data.set(x, y, depth, 1);
            }
        }
    }
    let jie_x=-1;
    let jie_y=-1;
    //劫的判断
    if(record.length>=1){
        //上一步
        let backStep = record[record.length-1];
        //如果上一步有吃子 并且 吃的是一个
        if(backStep[3].length===1){
            jie_x=backStep[3][0][0];
            jie_y=backStep[3][0][1];
            console.log("劫",backStep[3][0][0],backStep[3][0][1])
            data.set(backStep[3][0][0] + 3, backStep[3][0][1] + 3, 6, 1);
        }
    }
    console.log(data)
    //**********  getConvPrediction

    let p = net.forward(data).w;
    //清除有子的地方
    for (let i = 1; i < p.length; i++) {
        let y = Math.floor(i / 19);
        let x = i % 19;
        if (pan[x][y]!==0||(jie_x===x&&jie_y===y)) {
            console.log("--",x,y)
            p[i] = 0;
        }
    }
    //归一化
    scaleArray(p);
    console.log("p.length"+p.length)
    console.log(p)
    console.log("p.length"+p.length)

    //**********  convMove


    let maxi = 0;
    let maxv = -1;
    console.log("=================")
    for (let i = 0; i < p.length; i++) {
        console.log(i,p[i])
        if (p[i] > maxv) {
            maxv = p[i];
            maxi = i;
        }
    }
    console.log("=================")
    let p_y = Math.floor(maxi / 19);
    let p_x = maxi % 19;
    console.log({p_x,p_y})
    play(p_x,p_y)
    draw()
}

//归一化函数
function scaleArray(arr) {
    let m = Math.max.apply(null, arr);
    for (let i = 0; i < arr.length; i++) {
        arr[i] /= m;
    }
}