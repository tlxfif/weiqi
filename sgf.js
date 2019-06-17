let testSgf="(;FF[4]CA[UTF-8]KM[7.5]OT[3x60 byo-yomi]PB[AlphaGo Master]PW[AlphaGo Zero]\n" +
    "RE[W+R]RU[Chinese]TM[7200];B[dd];W[pp];B[cp];W[pd];B[fp];W[cc];B[cd];W[dc];\n" +
    "B[fc];W[ec];B[ed];W[fb];B[dj];W[nq];B[mp];W[hq];B[qf];W[qk];B[nc];W[pf];B[pg];\n" +
    "W[of];B[qd];W[qc];B[qe];W[pc];B[qi];W[md];B[og];W[mc];B[gb];W[gc];B[fd];W[hb];\n" +
    "B[gd];W[ga];B[hp];W[ip];B[ho];W[gq];B[fq];W[io];B[np];W[mq];B[in];W[jq];B[jn];\n" +
    "W[op];B[lq];W[lr];B[lp];W[kq];B[ek];W[dp];B[dq];W[bj];B[bl];W[cq];B[me];W[le];\n" +
    "B[lf];W[mf];B[ne];W[nf];B[ke];W[ld];B[kd];W[nd];B[cr];W[ch];B[eh];W[be];B[bd];\n" +
    "W[cf];B[rn];W[rp];B[qo];W[qp];B[mr];W[nr];B[ir];W[iq];B[on];W[eg];B[dh];W[dg];\n" +
    "B[fg];W[bg];B[mh];W[lg];B[kf];W[nh];B[mj];W[mg];B[kg];W[lh];B[kh];W[hf];B[gf];\n" +
    "W[hd];B[hg];W[ml];B[nl];W[nm];B[om];W[ck];B[cl];W[nk];B[ol];W[mk];B[pj];W[eq];\n" +
    "B[dr];W[fr];B[fo];W[qm];B[qn];W[pn];B[po];W[oo];B[pk];W[er];B[ep];W[ri];B[rh];\n" +
    "W[do];B[es];W[gr];B[kj];W[pm];B[rm];W[ql];B[qj];W[hn];B[hm];W[dk];B[dl];W[ej];\n" +
    "B[co];W[rj];B[pl];W[fk];B[el];W[di];B[fj];W[ei];B[fi];W[fh];B[gh];W[rk];B[si];\n" +
    "W[ff];B[gg];W[ie];B[ge];W[kc];B[lj];W[ko];B[lm];W[nj];B[mi];W[ni];B[kr];W[ms];\n" +
    "B[jd];W[kk];B[nn];W[km];B[kn];W[ng];B[jk];W[jl];B[bk];W[cj];B[rc];W[rb];B[jc];\n" +
    "W[jj];B[ik];W[gi];B[gj];W[ij];B[hj];W[il];B[hk];W[ki];B[ji];W[gn];B[dn];W[hl];\n" +
    "B[gl];W[gm];B[kb];W[lb];B[mb];W[nb];B[bc];W[bb];B[ab];W[ba];B[da];W[db];B[ma];\n" +
    "W[na];B[ea];W[eb];B[sd];W[ln];B[lo];W[im];B[aj];W[ai];B[sb];W[ra];B[jr];W[hr];\n" +
    "B[ii];W[la];B[he];W[id];B[if];W[ro];B[rl];W[lk];B[li];W[sn];B[sk];W[fn];B[eo];\n" +
    "W[sm];B[sj];W[ib];B[jb];W[kp];B[jo];W[mm];B[mn];W[qb];B[jp];W[ks];B[fm];W[em];\n" +
    "B[fl];W[en];B[fs];W[sa];B[ef];W[ak];B[al];W[dm];B[cm];W[ee];B[fe];W[de];B[ae];\n" +
    "W[ce];B[af];W[sc];B[rd];W[ph];B[qg];W[oh];B[pe];W[oe];B[pr];W[rr];B[rq];W[qq];\n" +
    "B[so];W[sp];B[sl];W[so];B[ic];W[hc];B[ag];W[ah];B[gs];W[is];B[eh];W[je];B[jf];\n" +
    "W[ia];B[aj];W[bf];B[ad];W[ak];B[gp];W[js];B[aj];W[lc];B[no];W[ak];B[sb];W[aj])";

//sgf.match(/;(W|B)\[([a-zA-Z]+?)\]/g);


//sgf格式初始化 去除 空格 换行
function sgfInit(sgf){
    sgf=sgf.replace(/\ +/g,"");
    sgf=sgf.replace(/[\r\n]/g,"");
    return sgf;
}

//sgf格式校验
function valid(sgf) {
    const ERROR_MSG="sgf格式有误 ";
    let arr=sgf.split(";");
    if(arr.length<3){
        exception(ERROR_MSG);//(;FF[4]CA[UTF-8]KM;)
    }
    //左括号检测
    if(arr[0]!=="("){
        exception(ERROR_MSG+arr[0]);
    }
    //右括号检测
    let last=arr[arr.length-1];
    if(last.length===0||last.indexOf(")")!==last.length-1){
        exception(ERROR_MSG+last);
    }
    //FIXME 没有检测 sgf头信息
    //检测每一步棋
    console.log(arr)
    for(let i=1;i<arr.length;i++){
        let item=arr[i];
        //最后一手检测括号
        if(i===arr.length-1){
            if(!/((([wW])|([bB]))\[([a-sA-S]{2})]\)|(\)))/g.test(item)){
                exception(ERROR_MSG+item);
            }
        }else{
            if(!/(([wW])|([bB]))\[([a-sA-S]{2})]/g.test(item)){
                exception(ERROR_MSG+item);
            }
        }
    }
    return arr;
}

//解析 成 下棋数组
//    black:1,
//    white:2
function parser(sgf) {
    let init=sgfInit(sgf);
    let val=valid(init);
    let record=[];

    for(let i=1;i<val.length;i++){
        let item=val[i].toLowerCase();
        //最后一手检测括号
        if(i===val.length-1){
            if(item.length!==1){
                analysis(item);
            }
        }else{
            analysis(item)
        }
    }
    function analysis(i) {
        let qi=i[0]==="b"?1:2;
        let x=i[2].charCodeAt()-97;
        let y=i[3].charCodeAt()-97;
        record.push([x,y,qi]);
    }
    return record;
}



function exception(msg) {
    throw new SyntaxError(msg)
}