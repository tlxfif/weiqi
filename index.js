
let move_show_flag=false;

function draw() {
    var c = document.getElementById("weiqi");
    var cxt = c.getContext("2d");
    cxt.strokeStyle="black";

    /* 清空，重新画线等 */
    cxt.clearRect(0,0,600,600);
    cxt.fillStyle = "sandybrown";
    cxt.fillRect(0,0,600,600);
    grid(cxt);
    ninePoints(cxt);

    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            if (pan[i][j] === 1) { //black
                var rg = cxt.createRadialGradient((i+1)*30-3, (j+1)*30-3, 1, (i+1)*30-4, (j+1)*30-4, 11);
                rg.addColorStop(1, /*"black"*/"#202020");
                rg.addColorStop(0, "gray");
                cxt.beginPath();
                cxt.arc((i+1)*30, (j+1)*30,15,0,2*Math.PI,false);
                //cxt.fillStyle="black";
                cxt.fillStyle=rg;
                cxt.fill();

            }
            else if (pan[i][j] === 2) { //white
                var rg = cxt.createRadialGradient((i+1)*30-3, (j+1)*30-3, 1, (i+1)*30-4, (j+1)*30-4, 11);
                rg.addColorStop(1, /*"lightgray"*/"#e0e0e0");
                rg.addColorStop(0, "white");
                cxt.beginPath();
                cxt.arc((i+1)*30, (j+1)*30,15,0,2*Math.PI,false);
                //cxt.fillStyle="white";
                cxt.fillStyle=rg;
                cxt.fill();
            }
            else if (pan[i][j] === 7) { // fill color
                cxt.beginPath();
                cxt.arc((i+1)*30, (j+1)*30,15,0,2*Math.PI,false);
                cxt.fillStyle="red";
                cxt.fill();
            }
        }
    }
    // 显示手数
    if (move_show_flag) {
        for (var m = 0; m < move_record.length-1; m++) { // 最新的一手由后面的红色标记
            // 先判断一下棋子还在不在棋盘上
            if (pan[move_record[m][0]][move_record[m][1]] === 0)
                continue;

            // 而且只应该画最新的数字（打劫后，可能导致一个坐标上重复许多步数）
            var repeat_move_flag = false;
            for (var j = m+1; j < move_record.length; j++) {
                if (move_record[m][0] === move_record[j][0] &&
                    move_record[m][1] === move_record[j][1]) {
                    repeat_move_flag = true;
                    break;
                }
            }
            if (repeat_move_flag)
                continue;

            // 这下可以放心绘制手数数字啦
            if (move_record[m][2] % 2 === 1) { //black
                cxt.fillStyle="white";
            } else {
                cxt.fillStyle="black";
            }
            cxt.font="bold 18px sans-serif";
            if (move_record[m][2] > 99) {
                cxt.font="bold 16px sans-serif";
            }
            cxt.font="bold 16px sans-serif";
            cxt.textAlign="center";
            var move_msg = move_record[m][2].toString();
            //cxt.fillText(move_msg, (i+1)*30, (j+1)*30+6);
            cxt.fillText(move_msg, (move_record[m][0]+1)*30, (move_record[m][1]+1)*30+6);
        }
    }
    // 特别显示最新的一手
    if (record.length > 0) {
        cxt.fillStyle = "red";
        var newest_move = record.length-1;
        cxt.fillRect(
            (record[newest_move][1][0])*30-5,
            (record[newest_move][1][1])*30-5,
            10, 10
        );
    }
}



//线
function grid(cxt) {
    for (var i = 0; i < 19; i++) {
        cxt.beginPath();
        cxt.moveTo(0+30,   (i+1)*30);
        cxt.lineTo(600-30, (i+1)*30);
        cxt.stroke();
    }
    for (var i = 0; i < 19; i++) {
        cxt.beginPath();
        cxt.moveTo((i+1)*30,   0+30);
        cxt.lineTo((i+1)*30, 600-30);
        cxt.stroke();
    }

}
//天元与边角星
function ninePoints(cxt) {
    var np = new Array(
        [120,120],[300,120],[480,120],
        [120,300],[300,300],[480,300],
        [120,480],[300,480],[480,480]
    );

    for (var i = 0; i < np.length; i++) {
        cxt.beginPath();
        cxt.arc(np[i][0],np[i][1],3,0,2*Math.PI,false);
        cxt.fillStyle="black";
        cxt.fill();
    }
}

function mousedownHandler(e) {
    var x, y;
    if (e.offsetX || e.offsetX == 0) {
        x = e.offsetX; //- imageView.offsetLeft;
        y = e.offsetY; //- imageView.offsetTop;
    }
    if (x < 30-10 || x > 600-30+10)
        return;
    if (y < 30-10 || y > 600-30+10)
        return;

    var xok = false;
    var yok = false;
    var x_;
    var y_;
    for (var i = 1; i <= 19; i++) {
        if (x > i*30-15 && x < i*30+15) {
            x = i*30;
            xok = true;
            x_ = i - 1;
        }
        if (y > i*30-15 && y < i*30+15) {
            y = i*30;
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
    if (x < 30-10 || x > 600-30+10)
        return;
    if (y < 30-10 || y > 600-30+10)
        return;

    var xok = false;
    var yok = false;
    for (var i = 1; i <= 19; i++) {
        if (x > i*30-15 && x < i*30+15) {
            x = i*30;
            xok = true;
        }
        if (y > i*30-15 && y < i*30+15) {
            y = i*30;
            yok = true;
        }
    }
    if (!xok || !yok)
        return;

    var c = document.getElementById("path");
    var cxt = c.getContext("2d");

    // clear the path
    cxt.clearRect(0,0,600,600);

    // put a new Gray stone
    cxt.beginPath();
    cxt.arc(x,y,15,0,2*Math.PI,false);
    cxt.fillStyle="gray";
    cxt.fill();

    cxt.beginPath();
    cxt.arc(x,y,10,0,2*Math.PI,false);
    if (whoIsPlay===qiType.black)
        cxt.fillStyle="black";
    else
        cxt.fillStyle="white";
    cxt.fill();
}

function mouseoutHandler(e) {
    var c = document.getElementById("path");
    var cxt = c.getContext("2d");
    cxt.clearRect(0,0,600,600);
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