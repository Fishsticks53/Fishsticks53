import { rng, R, P, T, plate, scene, bg, rain, B3 } from '../draw.mjs';
import { PROFILE } from '../profile.mjs';

// About: a 2.5D high-rise cut-away with a developer at the desk, a balcony with pool, grill and cat, and a layered skyline.
export function about() {
  const H=470,r=rng(7);let o=bg('g1','--s1a','--s1b',H);
  o+=`<defs><mask id="dry"><rect width="800" height="470" fill="#fff"/><polygon points="6,196 444,160 444,342 6,342" fill="#000"/></mask>
    <radialGradient id="glow"><stop offset="0" style="stop-color:var(--warm);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--warm);stop-opacity:0"/></radialGradient>
    <radialGradient id="fireglow"><stop offset="0" style="stop-color:#ff9a3c;stop-opacity:.75"/><stop offset="1" style="stop-color:#ff6a1a;stop-opacity:0"/></radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s1b);stop-opacity:0"/><stop offset="1" style="stop-color:var(--s1b);stop-opacity:.55"/></linearGradient>
    <linearGradient id="jg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:#ff8a9c"/><stop offset=".45" style="stop-color:var(--jacket)"/><stop offset="1" style="stop-color:#6e1427"/></linearGradient>
    <linearGradient id="sk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--skin)"/><stop offset="1" style="stop-color:#a8734f"/></linearGradient>
    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--pants)"/><stop offset="1" style="stop-color:#1c2040"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cat)"/><stop offset="1" style="stop-color:#1c2040"/></linearGradient>
    <linearGradient id="bowlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--rackbd)"/><stop offset="1" style="stop-color:var(--shade)"/></linearGradient></defs>`;
  // three skyline planes: extruded boxes (left face + roof face), lit from the right, fading with distance
  const sky=(seed,hMin,hVar,col,op,lit,d,e)=>{const q=rng(seed);let x=-12,s='';
    while(x<470){const w=34+Math.floor(q()*5)*8,h=hMin+Math.floor(q()*hVar)*18,y=470-h,lf=`${x},${y} ${x-d},${y-e} ${x-d},${470-e} ${x},470`,tp=`${x},${y} ${x+w},${y} ${x+w-d},${y-e} ${x-d},${y-e}`;
      s+=`<g style="opacity:${op}">`+R(x,y,w,h,col)+P(lf,col)+P(lf,'var(--shade)','.45')+P(tp,col)+P(tp,'#fff','.2')+R(x+w-1,y,1,h,'var(--cy)','','; opacity:.4')+`</g>`;
      if(h>250&&q()<.5)s+=R(x+w/2-1,y-e-24,2,22,col,'',`;opacity:${op}`)+R(x+w/2-2,y-e-28,4,4,'#ff3b3b','fl');
      for(let wx=x+5;wx<x+w-7;wx+=9)for(let wy=y+9;wy<462;wy+=13){if(q()<lit){const t=q()<.3;s+=R(wx,wy,4,6,'var(--win)',t?'tw':'',t?`;animation-delay:${(-q()*3).toFixed(1)}s`:'')}}
      x+=w+4+Math.floor(q()*10)}
    return s};
  o+=sky(3,190,9,'var(--bld2)',.5,.1,5,2.5)+R(0,180,470,290,'url(#haze)')+sky(4,140,8,'var(--bld2)',.8,.15,8,4)+R(0,250,470,220,'url(#haze)')+sky(5,90,8,'var(--bld)',1,.2,12,6);
  const lights=(x0,x1,y,sag,seed)=>{const q=rng(seed);let s='',n=Math.floor((x1-x0)/19);
    for(let i=0;i<=n;i++){const f=i/n,x=x0+f*(x1-x0),yy=y+Math.sin(f*Math.PI)*sag;
      s+=R(x-1,yy-3,2,3,'var(--ink2)')+R(x-2,yy,5,5,['var(--warm)','var(--mg)','var(--cy)'][i%3],'tw',`;animation-delay:${(-q()*3).toFixed(1)}s;animation-duration:${(2+q()*2).toFixed(1)}s`)}
    return s};
  const iso=(cx,yb,hw,hh,h,Lf,Lr,Lt)=>{const gl=[cx-hw,yb-hh],gb=[cx,yb],gr=[cx+hw,yb-hh],tl=[cx-hw,yb-hh-h],tb=[cx,yb-h],tr=[cx+hw,yb-hh-h],tt=[cx,yb-2*hh-h];
    return P(`${gl} ${gb} ${tb} ${tl}`,Lf)+P(`${gb} ${gr} ${tr} ${tb}`,Lr)+P(`${tt} ${tr} ${tb} ${tl}`,Lt)+P(`${tt} ${tr} ${tb} ${tl}`,'#fff','.2')+P(`${gb} ${gr} ${tr} ${tb}`,'var(--shade)','.45')};
  // ----- balcony: back rail, receding floor, front slab -----
  o+=R(4,276,436,38,'var(--cy)','','; opacity:.07')+R(0,272,444,4,'var(--ink2)')+R(0,272,444,1,'#fff','','; opacity:.45')+R(0,296,444,2,'var(--ink2)')+R(0,312,444,5,'var(--ink2)')+R(0,312,444,1,'#fff','','; opacity:.3');for(let x=6;x<444;x+=8)o+=R(x,276,1,36,'var(--ink2)','','; opacity:.55');
  for(let x=0;x<=440;x+=44)o+=R(x,270,5,48,'var(--ink2)')+R(x,270,5,2,'#fff','','; opacity:.4');
  o+=P('0,340 444,340 417,318 -27,318','var(--roof)')+P('0,340 444,340 417,318 -27,318','#fff','.07');
  for(let x=0;x<460;x+=40)o+=P(`${x},340 ${x+2},340 ${x-25},318 ${x-27},318`,'var(--roof2)','.6');
  o+=R(0,340,444,14,'var(--roof)')+R(0,340,444,2,'#fff','','; opacity:.22')+R(0,354,444,8,'var(--shade)','','; opacity:.55');
  for(let x=10;x<444;x+=52)o+=R(x,346,30,2,'var(--roof2)');
  // fire glow on the floor, then the furniture
  // ----- swimming pool set flush into the balcony floor: stone coping, banded water, steps, ladder and a swimmer -----
  const X1=232,X2=388,YF=337,YB=323,sh=y=>19*(YF-y)/(YF-YB);
  o+=P(`${X1-5},340 ${X2+5},340 ${X2+5-22},320 ${X1-5-22},320`,'var(--roof2)')+P(`${X1-5},340 ${X2+5},340 ${X2+5-22},320 ${X1-5-22},320`,'#fff','.18');
  const wcol=['#8af0ff','#5fd4f4','#3fb4e2','#2a92c8','#1f78b0'];
  for(let k=0;k<5;k++){const ya=YF-k*(YF-YB)/5,yb=YF-(k+1)*(YF-YB)/5;o+=P(`${X1-sh(ya)},${ya} ${X2-sh(ya)},${ya} ${X2-sh(yb)},${yb} ${X1-sh(yb)},${yb}`,wcol[k])}
  for(let i=0;i<14;i++){const yy=324+(i*5)%12,xx=X1-sh(yy)+8+((i*23)%140);o+=R(Math.round(xx),yy,5,1,'#fff','tw',`;animation-delay:${(-i*.41).toFixed(2)}s`)}
  for(let k=0;k<3;k++)o+=P(`${X1+1-sh(336-k*3)},${336-k*3} ${X1+11-sh(336-k*3)},${336-k*3} ${X1+11-sh(334-k*3)},${334-k*3} ${X1+1-sh(334-k*3)},${334-k*3}`,'#d6fbff','.55');
  o+=R(X1-3,334,3,3,'#fffbd0','pulse')+R(X2,334,3,3,'#fffbd0','pulse','; animation-delay:-1s');
  o+=`<g transform="translate(${X1+44} 331)"><g class="swim">${R(-14,0,10,2,'#e8b48f','','; opacity:.55')+R(0,-6,7,6,'#e8b48f')+R(0,-7,7,3,'#ff0267')+R(4,-4,3,2,'#4de1ff')+R(-10,-3,10,3,'#e8b48f')}<g class="stroke">${R(-6,-6,8,2,'#e8b48f')}</g>${R(-18,1,4,1,'#fff','','; opacity:.7')+R(-26,2,6,1,'#fff','','; opacity:.4')}</g></g>`;
  o+=R(X2-34,306,2,22,'#dfe5fb')+R(X2-28,306,2,22,'#dfe5fb')+R(X2-34,306,8,2,'#dfe5fb')+R(X2-34,314,8,1,'#dfe5fb')+R(X2-34,321,8,1,'#dfe5fb');
  o+=`<ellipse class="flick" cx="88" cy="337" rx="40" ry="6" fill="url(#fireglow)" style="animation-delay:-.7s"/>`;
  const LG='#47d49a',LB='#2a9d78',LD='#1d7a5a',TC='#c8693a',TCD='#9a4a28',TCL='#e08a5a';
  const leaf=(x,y,w,h,dir)=>R(x+1,y,w-2,h,LB)+R(x,y+1,w,h-2,LB)+R(x+1,y,w-2,1,LG)+R(x+(dir>0?1:w-3),y+1,2,h-2,LG,'','; opacity:.7')+R(x+1,y+h-1,w-2,1,LD)+R(x+Math.floor(w/2),y+1,1,h-2,LD,'','; opacity:.6');
  const hang=(x)=>{let t=R(x+9,296,2,12,'var(--ink2)')+R(x+3,296,14,1,'var(--ink2)')+R(x,308,20,10,TC)+R(x,308,20,2,TCL)+R(x+2,316,16,2,TCD)+R(x+2,305,16,4,LB)+R(x+6,302,8,4,LG);
    [[2,16],[7,26],[12,12],[16,20]].forEach(([vx,len])=>{t+=R(x+vx,318,2,len,LD);for(let j=0;j*6<len-2;j++)t+=R(x+vx-2,320+j*6,3,3,LB)+R(x+vx+1,323+j*6,3,3,LG)});return t};
  o+=hang(130);
  o+=R(166,292,8,34,'var(--wood)')+R(166,322,50,6,'var(--wood)')+R(170,308,36,14,'var(--mg)','','; opacity:.9')+R(176,312,36,8,'var(--hood)')+R(168,328,4,10,'var(--wood)')+R(210,328,4,10,'var(--wood)');
  const potted=(x)=>{let t=R(x+6,300,3,22,LD)+R(x+17,290,3,30,LD)+R(x+28,302,3,20,LD);
    [[x,286,14,10,-1],[x+3,274,12,10,-1],[x+13,264,14,10,1],[x+22,276,14,10,1],[x+24,290,14,10,1],[x-2,300,14,10,-1],[x+12,284,10,9,1]].forEach(([lx,ly,lw,lh,d])=>{t+=leaf(lx,ly,lw,lh,d)});
    return t+R(x+4,320,28,18,TC)+R(x+4,320,28,2,TCL)+R(x+2,316,32,5,TC)+R(x+2,316,32,1,TCL)+R(x+4,332,28,6,TCD)+R(x+6,316,24,2,'#3a2a1a')};
  o+=potted(18)+potted(398);
  // ----- grill: kettle on legs, glowing embers, drifting smoke, side shelf -----
  o+=R(70,326,3,12,'var(--ink2)')+R(103,326,3,12,'var(--ink2)')+R(87,328,3,10,'var(--rackbd)')
    +`<path d="M68 303 Q69 281 88 279 Q107 281 108 303 Z" style="fill:var(--rack)"/><path d="M71 296 Q74 284 88 282" style="fill:none;stroke:var(--warm);stroke-width:1.2;opacity:.6"/>`+R(86,275,4,5,'var(--ink2)')
    +`<path d="M66 304 L110 304 Q108 328 88 328 Q68 328 66 304 Z" style="fill:url(#bowlg)"/><path d="M69 312 Q72 324 82 326" style="fill:none;stroke:var(--warm);stroke-width:1.2;opacity:.5"/>`
    +`<ellipse cx="88" cy="304" rx="22" ry="4" style="fill:var(--shade);opacity:.9"/><ellipse class="ember" cx="88" cy="305" rx="18" ry="2.6" style="fill:#ff5a1f"/>`
    +R(80,303,2,2,'#ffd27a','tw')+R(90,304,2,2,'#ffd27a','tw','; animation-delay:-1s')+R(97,303,2,2,'#ffd27a','tw','; animation-delay:-2s')
    +`<path d="M70 304 L106 304 M72 302 L104 302" style="fill:none;stroke:var(--ink2);stroke-width:.8;opacity:.7"/>`
    +R(79,301,10,3,'#c2573a')+R(92,301,10,3,'#c2573a')
    +R(110,316,24,3,'var(--wood)')+R(130,319,2,19,'var(--wood)')+R(116,310,6,6,'var(--ink)');
  for(let k=0;k<5;k++)o+=`<circle class="sm" cx="${86+(k%2)*5}" cy="298" r="${3+k%3}" style="fill:var(--ink2);animation-delay:${(-k*.8).toFixed(1)}s"/>`;
  // ----- cat: pixel sprite on a 2px grid, two walk frames, pink rim from the string lights -----
  const C2=(x,y,w,h,f,c='',st='')=>R(x*2,y*2,w*2,h*2,f,c,st),CL='var(--cat)',CD='#252a55',CH='#7a84c8';
  o+=`<g transform="translate(130 340)"><g class="cat">`
    +C2(2,0,20,1,'#000','','; opacity:.25')
    +`<g class="tail">`+C2(1,-8,3,2,CL)+C2(0,-11,2,4,CL)+C2(0,-14,2,3,CL)+C2(1,-15,2,2,CL)+`</g>`
    +C2(9,-4,2,4,CD)+C2(14,-4,2,4,CD)
    +C2(4,-8,13,4,CL)+C2(3,-9,4,6,CL)+C2(15,-9,4,6,CL)+C2(6,-8,9,1,CH)+C2(15,-9,4,1,CH)+C2(5,-5,11,1,CD)+C2(8,-9,7,1,'var(--mg)','','; opacity:.75')
    +C2(5,-4,2,4,CL,'legA')+C2(17,-4,2,4,CL,'legA')+C2(7,-4,2,4,CL,'legB')+C2(15,-4,2,4,CL,'legB')
    +C2(17,-14,7,6,CL)+C2(18,-14,5,1,CH)+C2(17,-9,7,1,CD)
    +C2(17,-16,3,2,CL)+C2(21,-16,3,2,CL)+C2(18,-17,1,1,CL)+C2(22,-17,1,1,CL)+C2(18,-15,1,1,'var(--mg)')+C2(22,-15,1,1,'var(--mg)')
    +C2(19,-12,1,2,'var(--cy)')+C2(22,-12,1,2,'var(--cy)')+C2(20,-10,2,1,'var(--mg)')
    +`</g></g>`;
  o+=`<g mask="url(#dry)">${rain(H,11,34,440)}</g>`;
  // ----- lower floors under the balcony slab -----
  const win=(x,y,k)=>{let t=R(x-3,y-3,54,36,'var(--roof2)')+R(x,y,48,30,k===0?'var(--s1b)':'var(--warm)','',k===0?'':';opacity:.82');
    if(k===0)t+=R(x+6,y+5,12,2,'#fff','','; opacity:.12')+R(x+26,y+14,8,2,'#fff','','; opacity:.08');
    if(k===2)t+=R(x+34,y+12,2,16,'var(--ink2)')+P(`${x+30},${y+12} ${x+40},${y+12} ${x+38},${y+5} ${x+32},${y+5}`,'#fff','.9')+R(x+6,y+20,10,10,'var(--leaf)');
    if(k===3)t+=R(x,y,48,30,'var(--cy)','fl','; opacity:.4')+R(x+8,y+18,32,10,'var(--room2)')+R(x+10,y+12,28,6,'var(--room2)');
    if(k===4)t+=R(x,y,13,30,'var(--mg)','','; opacity:.6')+R(x+35,y,13,30,'var(--mg)','','; opacity:.6');
    if(k===5)t+=R(x+19,y+11,10,19,'var(--room2)')+R(x+21,y+4,6,7,'var(--room2)');
    return t+R(x+22,y,4,30,'var(--roof2)')};
  o+=R(0,362,444,108,'var(--bld)')+R(0,362,444,5,'var(--bld2)')+R(0,367,444,3,'var(--shade)','','; opacity:.4');
  for(let x=0;x<=444;x+=74)o+=R(x,370,5,100,'var(--bld2)');
  o+=R(0,420,444,4,'var(--bld2)')+R(0,424,444,2,'var(--shade)','','; opacity:.35');
  const lq=rng(91);
  for(let c=0;c<6;c++)for(let q=0;q<2;q++){const k=Math.floor(lq()*6);o+=win(12+c*74+8,q?434:380,k)}
  o+=R(0,354,444,8,'var(--bld2)')+R(0,354,444,2,'#fff','','; opacity:.12');
  // ----- high-rise: front facade with an extruded right face and roof face -----
  const BX=764;
  const rf=`${BX},40 800,22 800,452 ${BX},470`,tf=`444,40 ${BX},40 800,22 480,22`;
  o+=P(rf,'var(--bld)')+P(rf,'var(--shade)','.5')+P(tf,'var(--bld2)')+P(tf,'#fff','.18');
  const lw=rng(55);
  for(let q=0;q<9;q++){let g='';for(let c=0;c<3;c++){const k=lw()<.45;g+=R(3+c*11,16+q*48,8,30,k?'var(--warm)':'var(--s1b)','',k?';opacity:.7':'')}o+=`<g transform="matrix(1,-.5,0,1,${BX},40)">${g}</g>`}
  o+=R(444,40,BX-444,430,'var(--bld)')+R(444,40,BX-444,8,'var(--roof2)')+R(444,48,BX-444,2,'var(--shade)','','; opacity:.4')+R(BX-1,40,1,164,'var(--cy)','','; opacity:.3');
  for(let c=0;c<=5;c++)o+=R(444+c*64-(c===5?4:0),48,4,156,'var(--bld2)');
  for(let q=0;q<3;q++)o+=R(444,90+q*48,BX-444,4,'var(--bld2)')+R(444,94+q*48,BX-444,2,'var(--shade)','','; opacity:.35');
  const wq=rng(77);
  for(let q=0;q<3;q++)for(let c=0;c<5;c++){
    const x=454+c*64,y=56+q*48,k=Math.floor(wq()*6);
    o+=win(x,y,k);
    if(wq()<.35){o+=R(x-6,y+30,60,3,'var(--ink2)');for(let j=0;j<10;j++)o+=R(x-6+j*6,y+30,2,6,'var(--ink2)','','; opacity:.7');if(k!==2)o+=R(x+4,y+22,9,8,'var(--leaf)')}
  }
  o+=R(470,22,3,18,'var(--roof2)')+R(504,22,3,18,'var(--roof2)')+R(466,6,46,18,'var(--bld2)')+R(466,12,46,2,'var(--shade)','','; opacity:.4')+R(466,18,46,2,'var(--shade)','','; opacity:.4')+P('464,6 514,6 489,-6 489,-6','var(--roof2)');
  o+=R(560,24,14,16,'var(--bld2)')+R(558,22,18,3,'var(--roof2)')+R(564,12,3,8,'var(--ink2)','steam','; opacity:.5');
  o+=R(610,32,40,8,'var(--leaf)')+R(620,26,12,8,'var(--leaf)')+R(638,28,10,6,'var(--leaf)');
  o+=lights(520,690,32,4,12);
  o+=R(704,8,3,32,'var(--roof2)')+R(722,14,3,26,'var(--roof2)')+R(698,16,16,3,'var(--roof2)')+R(702,4,8,6,'#ff3b3b','fl')+R(720,10,8,6,'#ff3b3b','fl','; animation-delay:-2s')+R(736,22,22,16,'var(--roof2)')+R(740,26,14,8,'var(--cy)','pulse','; opacity:.6');
  o+=R(436,204,BX-436,10,'var(--roof2)');
  // ----- study: an open box with a receding floor and a left inner wall -----
  const lwall=(y0,y1)=>P(`444,${y0} 458,${y0} 458,${y1-10} 444,${y1}`,'var(--room)')+P(`444,${y0} 458,${y0} 458,${y1-10} 444,${y1}`,'var(--shade)','.35');
  o+=R(442,214,BX-442,126,'var(--room)')+lwall(214,340);
  o+=P(`444,340 ${BX},340 ${BX},330 458,330`,'var(--wood)','.75');
  for(let x=450;x<BX;x+=36)o+=P(`${x},340 ${x+2},340 ${x+12},330 ${x+10},330`,'var(--shade)','.25');
  o+=`<ellipse cx="640" cy="290" rx="230" ry="110" fill="url(#glow)"/>`;
  o+=lights(462,756,224,8,4);
  o+=B3(466,230,44,110,8,5,'var(--wood)');
  for(let s2=0;s2<4;s2++){o+=R(469,236+s2*26,38,22,'var(--room2)');let bx=470;const q=rng(40+s2);while(bx<502){const bw=3+Math.floor(q()*4);o+=R(bx,240+s2*26+Math.floor(q()*4),bw,18-Math.floor(q()*4),['var(--mg)','var(--cy)','var(--acc)','var(--hood)'][Math.floor(q()*4)]);bx+=bw+1}}
  o+=B3(516,234,64,66,4,3,'var(--roof2)')+R(520,238,56,58,'var(--s1b)')+R(546,238,4,58,'var(--roof2)')+R(520,264,56,4,'var(--roof2)');
  o+=R(526,278,6,4,'var(--win)','tw')+R(560,246,4,4,'var(--win)','tw','; animation-delay:-1s')+R(530,252,2,10,'var(--rain)','','; opacity:.4');
  o+=B3(612,228,34,24,4,3,'var(--roof2)')+R(615,231,28,18,'var(--mg)','','; opacity:.8')+R(622,238,14,10,'var(--cy)','','; opacity:.8')+B3(656,232,22,18,4,3,'var(--roof2)')+R(659,235,16,12,'var(--acc)','','; opacity:.8');
  // desk, laptop, mug
  o+=B3(596,300,84,6,8,4,'var(--desk)')+R(600,306,5,34,'var(--desk)')+R(648,306,5,34,'var(--desk)');
  let code='';const cr=rng(3);for(let i=0;i<14;i++){const ind=(i%3)*6,w=8+Math.floor(cr()*26);code+=R(624+ind,262+i*6,w,3,['var(--cy)','var(--acc)','var(--mg)','var(--ink2)'][i%4])}
  o+=`<clipPath id="scr"><rect x="620" y="258" width="46" height="36"/></clipPath><g transform="translate(322 150) scale(.5)">${R(616,296,54,4,'var(--roof2)')+R(618,256,50,40,'var(--roof2)')+R(620,258,46,36,'var(--scr)')}<g clip-path="url(#scr)"><g class="code">${code}</g></g>${R(620,258,46,36,'var(--cy)','pulse','; opacity:.08')}</g>`;
  o+=R(604,292,9,8,'var(--ink)')+R(606,286,2,4,'var(--ink2)','steam','; opacity:.5');
  // chair + developer: a simple chunky 2D figure on a 2px grid
  o+=B3(702,290,6,30,5,3,'var(--desk)')+B3(676,316,32,5,6,3,'var(--desk)')+R(689,321,4,17,'var(--desk)')+R(680,338,24,3,'var(--desk)');
  const JD='#b82a40',SD='#c48e66';
  o+=R(672,318,6,18,'#2a3060')+R(670,336,10,4,'#aab4dc');                                              // far leg
  o+=R(666,314,32,8,'var(--pants)')+R(664,322,8,14,'var(--pants)')+R(658,336,16,4,'#e8ecff');            // near leg and shoe
  o+=R(700,288,6,10,JD);                                                                                // hood
  o+=R(688,290,14,24,'var(--jacket)')+R(698,290,4,24,JD);                                               // torso
  o+=R(692,288,4,2,SD)+R(688,276,12,12,'var(--skin)')+R(686,282,2,2,'var(--skin)');                      // neck, head, nose
  o+=R(686,272,16,6,'var(--hair)')+R(698,276,4,8,'var(--hair)')+R(690,281,2,2,'#1f1630');               // hair, eye
  o+=`<g class="type2">${R(664,302,28,4,JD)+R(660,302,4,4,SD)}</g>`;
  o+=`<g class="type">${R(660,298,32,6,'var(--jacket)')}${R(690,294,6,10,'var(--jacket)')}${R(656,298,4,6,'var(--skin)')}</g>`;
  // floor lamp, plant
  o+=R(750,266,4,74,'var(--ink2)')+P('740,266 764,266 758,244 746,244','var(--warm)','.95')+R(740,338,24,3,'var(--ink2)');
  o+=R(724,322,22,18,'var(--wood)')+R(732,296,4,26,'var(--leaf)')+R(722,300,12,8,'var(--leaf)')+R(736,306,12,8,'var(--leaf)')+R(726,290,10,8,'var(--leaf)');
  o+=R(436,214,10,126,'var(--roof2)')+R(442,214,22,126,'var(--hood)','','; opacity:.45')+R(442,214,6,126,'var(--hood)','','; opacity:.55');
  // ----- living room: the same open-box treatment, furniture built from extruded boxes -----
  o+=R(442,354,BX-442,116,'var(--room2)')+lwall(354,464);
  o+=R(436,340,BX-436,14,'var(--roof)')+R(442,340,BX-442,3,'var(--cy)','','; opacity:.4');
  o+=`<ellipse cx="620" cy="420" rx="200" ry="80" fill="url(#glow)" style="opacity:.6"/>`;
  o+=P(`444,464 ${BX},464 ${BX},454 458,454`,'var(--wood)','.8');
  for(let x=450;x<BX;x+=36)o+=P(`${x},464 ${x+2},464 ${x+12},454 ${x+10},454`,'var(--shade)','.25');
  o+=R(442,464,BX-442,6,'var(--wood)')+R(442,464,BX-442,6,'var(--shade)','','; opacity:.3');
  o+=P('480,462 604,462 596,456 488,456','var(--mg)','.45')+P('480,462 604,462 596,456 488,456','var(--shade)','.15');
  o+=B3(474,368,34,22,4,3,'var(--roof2)')+R(477,371,28,16,'var(--hood)','','; opacity:.8');
  const SL='#c9548a',SM='var(--sofa)',SK='#7a2850';
  o+=R(474,454,6,8,'var(--wood)')+R(590,454,6,8,'var(--wood)')+R(468,448,134,8,SK)
    +R(476,402,118,30,SM)+R(476,402,118,3,SL)+R(480,408,54,22,SM)+R(538,408,54,22,SM)+R(480,408,54,2,SL)+R(538,408,54,2,SL)+R(534,408,4,22,SK)
    +R(476,430,118,18,SM)+R(480,430,54,16,SM)+R(538,430,54,16,SM)+R(480,430,54,2,SL)+R(538,430,54,2,SL)+R(534,430,4,16,SK)+R(476,446,118,2,SK)
    +R(466,416,12,34,SM)+R(466,416,12,3,SL)+R(466,444,12,6,SK)+R(592,416,12,34,SM)+R(592,416,12,3,SL)+R(592,444,12,6,SK)+R(476,418,2,28,SK,'','; opacity:.5')+R(592,418,2,28,SK,'','; opacity:.5')
    +R(486,410,18,16,'var(--warm)','','; opacity:.75')+R(560,410,18,16,'var(--cy)','','; opacity:.55');
  o+=B3(624,442,60,6,12,6,'var(--wood)')+R(628,448,4,14,'var(--wood)')+R(676,448,4,14,'var(--wood)')+R(646,432,10,10,'var(--ink)')+R(649,426,2,4,'var(--ink2)','steam','; opacity:.5');
  o+=R(704,392,4,70,'var(--ink2)')+P('694,392 718,392 712,372 700,372','var(--warm)','.95')+R(696,460,20,3,'var(--ink2)');
  o+=B3(722,438,34,24,6,4,'var(--wood)')+B3(726,404,30,24,6,4,'var(--roof2)')+R(729,407,24,18,'var(--scr)')+R(729,407,24,18,'var(--cy)','fl','; opacity:.3')+R(736,428,10,10,'var(--roof2)');
  // ----- tent canopy over the balcony, attached to the building -----
  const yT=x=>168+(444-x)*.0744;
  for(let x=6,k=0;x<444;x+=24,k++){const x2=Math.min(x+24,444),c=k%2?'#0a061c':'#ff0267';
    o+=P(`${x},${yT(x)} ${x2},${yT(x2)} ${x2},${yT(x2)+10} ${x},${yT(x)+10}`,c)+P(`${x},${yT(x)} ${x2},${yT(x2)} ${x2},${yT(x2)+2} ${x},${yT(x)+2}`,'#fff','.25')
      +R(x+2,yT(x)+10,Math.max(0,x2-x-4),3,c)+R(x+5,yT(x)+13,Math.max(0,x2-x-10),2,c);}
  o+=R(438,162,10,22,'var(--roof2)')+R(2,198,5,98,'var(--roof2)')+R(0,196,10,4,'var(--roof2)')+P('7,224 62,205 62,208 7,227','var(--roof2)');
  o+=lights(14,430,232,10,2);
  o+=R(3,212,2,10,'var(--rain)','drip')+R(9,214,2,8,'var(--rain)','drip','; animation-delay:-.9s')+R(2,206,2,8,'var(--rain)','drip','; animation-delay:-1.7s');
  o+=plate('ABOUT ME');
  o+=T(24,84,13,PROFILE.headline,'var(--ink)');
  o+=T(24,102,12,PROFILE.tagline,'var(--ink2)');
  return scene(H,`A cozy high-rise drawn in 2.5D. A developer types at a desk inside while a cat walks the balcony, which has a swimming pool with a swimmer, a smoking grill, potted plants, string lights and a steel guard rail, and looks out over layered skyscrapers in the rain. ${PROFILE.headline}, ${PROFILE.tagline}. Select to visit the portfolio.`,o);
}

