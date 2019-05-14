
let move_show_flag=false;
//棋盘规格
let goSize=boardSize;
//棋盘大小
let goWidth=600;
let goHeight=goWidth;

//棋盘边距 小方框大小
let goMargin=goWidth/(goSize+1);
//棋子半径
let piecesRadius=goMargin/2;

//自动下一步
let autoNext=false;

function draw() {
    var c = document.getElementById("weiqi");
    var cxt = c.getContext("2d");
    cxt.strokeStyle="black";

    /* 清空，重新画线等 */
    cxt.clearRect(0,0,goWidth,goHeight);
    cxt.fillStyle = "#ebc98a";
    cxt.fillRect(0,0,goWidth,goHeight);
    grid(cxt);
    ninePoints(cxt);

    for (var i = 0; i < goSize; i++) {
        for (var j = 0; j < goSize; j++) {
            if (pan[i][j] === 1) { //black
                var rg = cxt.createRadialGradient((i+1)*goMargin-3, (j+1)*goMargin-3, 1, (i+1)*goMargin-4, (j+1)*goMargin-4, 11);
                rg.addColorStop(1, /*"black"*/"#202020");
                rg.addColorStop(0, "gray");
                cxt.beginPath();
                cxt.arc((i+1)*goMargin, (j+1)*goMargin,piecesRadius,0,2*Math.PI,false);
                //cxt.fillStyle="black";
                cxt.fillStyle=rg;
                cxt.fill();

            }
            else if (pan[i][j] === 2) { //white
                var rg = cxt.createRadialGradient((i+1)*goMargin-3, (j+1)*goMargin-3, 1, (i+1)*goMargin-4, (j+1)*goMargin-4, 11);
                rg.addColorStop(1, /*"lightgray"*/"#e0e0e0");
                rg.addColorStop(0, "white");
                cxt.beginPath();
                cxt.arc((i+1)*goMargin, (j+1)*goMargin,piecesRadius,0,2*Math.PI,false);
                //cxt.fillStyle="white";
                cxt.fillStyle=rg;
                cxt.fill();
            }
            else if (pan[i][j] === 7) { // fill color
                cxt.beginPath();
                cxt.arc((i+1)*goMargin, (j+1)*goMargin,piecesRadius,0,2*Math.PI,false);
                cxt.fillStyle="red";
                cxt.fill();
            }
        }
    }


    // 显示手数
    let qiCountArr=[];
    if (move_show_flag) {
        let count=0;
        for (let m = jumpPointer; m >=0; m--) {
            if(record[m][0]===recordType.down){
                count++;
            }
        }
        for (let m =jumpPointer; m >=0; m--) { // 最新的一手由后面的红色标记
            let r=record[m];
            let x=record[m][1][0][0];
            let y=record[m][1][0][1];

            //提子不记
            if(r[0]===recordType.up){
                continue;
            }
            // 判断是否被提子
            if (pan[x][y] === 0){
                count--;
                continue;
            }
            let flag=arrayAdd(x,y,r[1][0][2],qiCountArr);
            if(!flag){
                count--;
                continue;
            }

            if (r[1][0][2]===qiType.white) { //black
                cxt.fillStyle="black";
            } else {
                cxt.fillStyle="white";
            }
            cxt.font="bold "+piecesRadius+"px sans-serif";
            cxt.textAlign="center";
            cxt.fillText(count+"", (x+1)*goMargin, (y+1)*goMargin+(piecesRadius/2)-4);
            count--;
        }
    }
    // 特别显示最新的一手
    if (jumpPointer >= 0) {
        cxt.fillStyle = "red";
        if(record[jumpPointer][0]===recordType.up){
            cxt.fillRect(
                (record[jumpPointer-1][1][0][0]+1)*goMargin-5,
                (record[jumpPointer-1][1][0][1]+1)*goMargin-5,
                10, 10
            );
        }else {
            cxt.fillRect(
                (record[jumpPointer][1][0][0] + 1) * goMargin - 5,
                (record[jumpPointer][1][0][1] + 1) * goMargin - 5,
                10, 10
            );
        }
    }
}

//线条宽度
let lineWidth=0.4;

//线
function grid(cxt) {
    //竖线
    for (let i = 0; i < goSize; i++) {
        cxt.beginPath();
        cxt.moveTo(0+goMargin,   (i+1)*goMargin);
        cxt.lineTo(goWidth-goMargin, (i+1)*goMargin);
        cxt.lineWidth = lineWidth;
        cxt.stroke();
    }
    //横线
    for (let i = 0; i < goSize; i++) {
        cxt.beginPath();
        cxt.moveTo((i+1)*goMargin,   0+goMargin);
        cxt.lineTo((i+1)*goMargin, goHeight-goMargin);
        cxt.lineWidth = lineWidth;
        cxt.stroke();
    }

}
//天元与边角星
function ninePoints(cxt) {
    var np = [];
    let left=3,right=goSize-1-left,center=(goSize-1)/2;
    if(goSize<13){
        left=2;
        right=goSize-1-left;
    }
    get(center,center);//天元
    get(left,center);
    get(center,left);
    get(right,center);
    get(center,right);
    get(left,left);
    get(left,right);
    get(right,left);
    get(right,right);
    function get(x,y) {
        np.push([goMargin*(1+x),goMargin*(1+y)]);
    }
    for (var i = 0; i < np.length; i++) {
        cxt.beginPath();
        cxt.arc(np[i][0],np[i][1],3,0,2*Math.PI,false);
        cxt.fillStyle="#654e32";
        cxt.fill();
    }
}

function mousedownHandler(e) {
    var x, y;
    if (e.offsetX || e.offsetX == 0) {
        x = e.offsetX; //- imageView.offsetLeft;
        y = e.offsetY; //- imageView.offsetTop;
    }
    if (x < goMargin-10 || x > goWidth-goMargin+10)
        return;
    if (y < goMargin-10 || y > goHeight-goMargin+10)
        return;

    var xok = false;
    var yok = false;
    var x_;
    var y_;
    for (var i = 1; i <= goSize; i++) {
        if (x > i*goMargin-piecesRadius && x < i*goMargin+piecesRadius) {
            x = i*goMargin;
            xok = true;
            x_ = i - 1;
        }
        if (y > i*goMargin-piecesRadius && y < i*goMargin+piecesRadius) {
            y = i*goMargin;
            yok = true;
            y_ = i - 1;
        }
    }
    if (!xok || !yok)
        return;

    play(x_, y_);
    draw();
}

function mousemoveHandler(e) {
    var x, y;
    if (e.offsetX || e.offsetX == 0) {
        x = e.offsetX ;//- imageView.offsetLeft;
        y = e.offsetY ;//- imageView.offsetTop;
    }
    if (x < goMargin-10 || x > goWidth-goMargin+10)
        return;
    if (y < goMargin-10 || y > goHeight-goMargin+10)
        return;

    var xok = false;
    var yok = false;
    for (var i = 1; i <= goSize; i++) {
        if (x > i*goMargin-piecesRadius && x < i*goMargin+piecesRadius) {
            x = i*goMargin;
            xok = true;
        }
        if (y > i*goMargin-piecesRadius && y < i*goMargin+piecesRadius) {
            y = i*goMargin;
            yok = true;
        }
    }
    if (!xok || !yok)
        return;

    var c = document.getElementById("path");
    var cxt = c.getContext("2d");

    // clear the path
    cxt.clearRect(0,0,goWidth,goHeight);

    cxt.beginPath();
    cxt.arc(x,y,piecesRadius,0,2*Math.PI,false);
    if (whoIsPlay===qiType.black)
        cxt.fillStyle="rgba(2,2,3,0.3)";
    else
        cxt.fillStyle="rgba(255,255,255,0.5)";
    cxt.fill();
}

function mouseoutHandler(e) {
    var c = document.getElementById("path");
    var cxt = c.getContext("2d");
    cxt.clearRect(0,0,goWidth,goHeight);
}

function initBoard() {
    var c_path = document.getElementById("path");
    c_path.addEventListener('mousedown', mousedownHandler, false);
    c_path.addEventListener('mousemove', mousemoveHandler, false);
    c_path.addEventListener('mouseout', mouseoutHandler, false);
    draw();
}
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}
//window.addEventListener("load", initBoard, true);
addLoadEvent(initBoard);