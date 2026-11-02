import { rng, R, P, T, plate, scene, bg, B3 } from '../draw.mjs';

// Portfolio: a vault door under a neon sign, flanked by two guards and a maintenance wall.
export function portfolio() {
  const H=390,cx=400,cy=206;let o=bg('g4','--s4a','--s4b',H);
  // back wall, ceiling beam, pipes
  o+=R(0,0,800,300,'var(--wall)');
  for(let x=0;x<800;x+=100)o+=R(x,12,2,288,'var(--shade)','','; opacity:.3');
  for(let y=70;y<300;y+=64)o+=R(0,y,800,2,'var(--shade)','','; opacity:.22');
  o+=R(0,0,800,12,'var(--shade)','','; opacity:.55');
  for(let i=0;i<40;i++)o+=P(`${i*20},0 ${i*20+10},0 ${i*20+10},12 ${i*20},12`,'var(--acc)');
  o+=R(0,36,800,10,'var(--pipe)')+R(0,37,800,2,'#fff','','; opacity:.18')+R(0,54,800,6,'var(--pipe)','','; opacity:.7');
  for(let x=50;x<800;x+=100)o+=R(x,32,6,34,'var(--doorrim)');
  // ceiling lamps (boxes) with light cones
  [215,585].forEach(x=>{o+=B3(x-14,12,28,8,6,4,'var(--doorrim)')+R(x-10,20,20,4,'var(--warm)','pulse')+P(`${x-10},24 ${x+10},24 ${x+80},338 ${x-70},338`,'var(--warm)','.07','pulse')});
  // floor receding to the front edge, then the front face of the platform
  o+=R(0,300,800,38,'var(--floor)')+R(0,300,800,2,'var(--cy)','','; opacity:.4');
  for(let x=-60;x<860;x+=60)o+=P(`${x},338 ${x+2},338 ${x+68},300 ${x+66},300`,'var(--rackbd)','.4');
  o+=R(0,310,800,1,'var(--rackbd)','','; opacity:.35')+R(0,322,800,1,'var(--rackbd)','','; opacity:.35');
  o+=R(0,338,800,16,'var(--doorrim)')+R(0,338,800,2,'var(--cy)','','; opacity:.5')+R(0,354,800,36,'var(--s4b)');
  for(let i=0;i<40;i++)o+=P(`${i*20},341 ${i*20+10},341 ${i*20+4},352 ${i*20-6},352`,'var(--acc)','.55');
  // door: framed box, recess, thick slab with wheel, seam light on its side face
  o+=B3(296,96,208,204,14,8,'var(--doorrim)')+R(304,104,192,196,'var(--shade)','','; opacity:.85');
  o+=P(`${cx+88},112 ${cx+100},105 ${cx+100},293 ${cx+88},300 ${cx+60},338 ${cx+210},338`,'var(--acc)','.10','pulse');
  o+=B3(312,112,176,188,12,7,'var(--door)');
  for(let a=0;a<360;a+=30){const rad=a*Math.PI/180,bx=Math.round(cx+Math.cos(rad)*74-4),by=Math.round(cy+Math.sin(rad)*74-4);o+=R(bx,by,8,8,'var(--doorrim)')+R(bx+2,by+2,3,3,'#fff','','; opacity:.3')}
  // vault wheel: octagonal bezel, locking bars (boxes), six shaded spokes with knobs, a thick hub
  const oct=(r,f,ex='')=>P(`${cx-r*.34},${cy-r} ${cx+r*.34},${cy-r} ${cx+r},${cy-r*.34} ${cx+r},${cy+r*.34} ${cx+r*.34},${cy+r} ${cx-r*.34},${cy+r} ${cx-r},${cy+r*.34} ${cx-r},${cy-r*.34}`,f,ex);
  o+=oct(66,'var(--doorrim)')+oct(66,'#fff','.12')+oct(58,'var(--shade)','.7')+oct(52,'var(--shade)','.35');
  o+=B3(cx-100,cy-6,34,12,6,3,'var(--rackbd)')+B3(cx+66,cy-6,34,12,6,3,'var(--rackbd)')+B3(cx-6,cy-100,12,34,6,3,'var(--rackbd)')+B3(cx-6,cy+66,12,34,6,3,'var(--rackbd)');
  let sp='';for(let a=0;a<360;a+=60)sp+=`<g transform="rotate(${a})">${R(10,-4,36,8,'#4aa8c0')}${R(10,-4,36,2,'#bff6ff')}${R(10,2,36,2,'#1f6f86')}${R(44,-7,12,14,'var(--cy)')}${R(44,-7,12,3,'#fff','','; opacity:.5')}${R(44,4,12,3,'#1f6f86')}</g>`;
  o+=`<g transform="translate(${cx} ${cy})"><g class="spinw">${sp}</g></g>`;
  o+=B3(cx-14,cy-14,28,28,6,4,'var(--plate)')+R(cx-8,cy-8,16,16,'var(--cy)')+R(cx-8,cy-8,16,2,'#fff','','; opacity:.4')+R(cx-3,cy-3,6,6,'var(--shade)');
  o+=P(`${cx+88},112 ${cx+100},105 ${cx+100},293 ${cx+88},300`,'var(--acc)','.55','pulse');
  // steps: a landing box in front of the door
  o+=B3(270,318,260,20,12,7,'var(--door)')+R(280,324,240,2,'var(--shade)','','; opacity:.3');
  o+=R(cx-110,310,220,10,'var(--mg)','','; opacity:.08');
  // keypad (box on the wall)
  o+=B3(540,186,34,56,6,4,'var(--plate)')+R(546,192,22,8,'var(--scr)')+R(548,194,10,4,'var(--cy)','pulse');
  for(let k=0;k<6;k++)o+=R(547+(k%3)*8,206+Math.floor(k/3)*10,6,6,'var(--doorrim)');
  o+=R(566,232,4,4,'#2fd6a0','tw');
  // left wall: pipe manifold, gauge, lockers (boxes), vent fan
  o+=R(40,60,8,66,'var(--pipe)')+R(41,60,2,66,'#fff','','; opacity:.18')+R(34,116,20,8,'var(--doorrim)')+R(36,126,16,6,'var(--mg)')+R(40,122,8,12,'var(--mg)');
  o+=B3(84,92,34,34,5,3,'var(--plate)')+R(88,96,26,26,'var(--scr)')+R(100,108,2,12,'var(--acc)','pulse')+R(96,106,10,2,'var(--cy)','','; opacity:.5');
  o+=R(98,126,6,22,'var(--pipe)')+R(60,144,82,6,'var(--pipe)')+R(60,145,82,1,'#fff','','; opacity:.18');
  for(let k=0;k<3;k++){const x=24+k*44,y=176;
    o+=B3(x,y,38,124,8,5,'var(--door)');
    if(k===1)o+=R(x+3,y+3,32,118,'var(--shade)')+R(x+6,y+60,26,3,'var(--cy)','pulse')+R(x+6,y+90,26,3,'var(--acc)','pulse','; animation-delay:-1s');
    else{for(let j=0;j<4;j++)o+=R(x+6,y+10+j*6,26,2,'var(--shade)','','; opacity:.6');o+=R(x+30,y+62,3,12,'var(--cy)')+R(x+11,y+96,16,8,'var(--plate)')+R(x+14,y+99,4,2,'var(--acc)')}
  }
  // wall fan: boxed housing, recessed octagonal opening, six shaded blades behind a fixed grille
  o+=B3(178,112,60,60,8,5,'var(--doorrim)')+R(184,118,48,48,'var(--shade)');
  for(const [sx,sy] of [[181,115],[231,115],[181,165],[231,165]])o+=R(sx,sy,3,3,'var(--ink2)');
  const octp=(cx0,cy0,r)=>`${cx0-r*.34},${cy0-r} ${cx0+r*.34},${cy0-r} ${cx0+r},${cy0-r*.34} ${cx0+r},${cy0+r*.34} ${cx0+r*.34},${cy0+r} ${cx0-r*.34},${cy0+r} ${cx0-r},${cy0+r*.34} ${cx0-r},${cy0-r*.34}`;
  o+=P(octp(208,142,22),'#04050c');
  let bl='';for(let a=0;a<360;a+=60)bl+=`<g transform="rotate(${a})">${P('3,-3 19,-7 20,-2 3,0','var(--cy)')}${P('3,0 20,-2 19,3 3,4','#1f7f96')}</g>`;
  o+=`<g transform="translate(208 142)"><g class="fanr">${bl}</g></g>`;
  o+=R(184,141,48,2,'var(--rackbd)')+R(207,118,2,48,'var(--rackbd)')+R(190,126,36,1,'var(--rackbd)','','; opacity:.6')+R(190,158,36,1,'var(--rackbd)','','; opacity:.6');
  o+=P(octp(208,142,6),'var(--ink2)')+P(octp(208,142,6),'#fff','.2')+R(206,140,4,4,'var(--shade)');
  // right wall: protruding monitors (boxes), counter with a deep top, crate, cable reels, extinguisher, sign
  o+=R(606,86,176,14,'var(--plate)','','; stroke:var(--doorrim);stroke-width:1')+T(694,97,10,'ACCESS NODE','var(--cy)','middle');
  const mq=rng(88);
  for(let j=0;j<2;j++)for(let i=0;i<3;i++){const x=610+i*58,y=106+j*46;
    o+=B3(x,y,50,36,8,5,'var(--plate)')+R(x+3,y+3,44,30,'var(--scr)');
    for(let l=0;l<5;l++)o+=R(x+6,y+7+l*5,8+Math.floor(mq()*26),2,['var(--cy)','var(--acc)','var(--mg)'][Math.floor(mq()*3)],mq()<.3?'tw':'',`;animation-delay:${(-mq()*3).toFixed(1)}s`);}
  o+=P('722,222 738,206 754,222 738,238','var(--acc)')+R(737,212,2,12,'var(--plate)')+R(737,227,2,2,'var(--plate)');
  o+=R(604,258,6,42,'var(--doorrim)')+R(778,258,6,42,'var(--doorrim)');
  o+=B3(600,250,190,8,14,9,'var(--door)')+R(640,243,42,5,'var(--roof2)')+R(690,238,9,10,'var(--ink)')+R(692,232,2,4,'var(--ink2)','steam','; opacity:.5');
  o+=B3(622,268,36,32,8,5,'var(--doorrim)')+R(628,278,26,2,'var(--shade)','','; opacity:.5')+R(628,286,26,2,'var(--shade)','','; opacity:.5');
  for(let k=0;k<3;k++)o+=B3(676,292-k*8,40,8,6,4,k%2?'var(--mg)':'var(--cy)');
  o+=R(748,248,14,52,'#e8384f')+R(749,248,3,52,'#fff','','; opacity:.25')+R(759,248,3,52,'var(--shade)','','; opacity:.35')+R(750,240,10,8,'var(--ink2)')+R(760,244,10,3,'var(--ink2)')+R(751,258,8,10,'var(--plate)');
  // security guards flanking the door: angular armour built from extruded planes, glowing visors, idle animations
  const guard=(gx,yb,dir,mode)=>{
    const c=(x,y,w,h,f,cl='',ex='')=>R(x*3,y*3,w*3,h*3,f,cl,ex);
    const K='var(--shade)',A='var(--doorrim)',D='var(--door)',Hh='#8d98e0',Y='var(--acc)',CY='var(--cy)';
    let g=c(-8,0,16,1,'#000','','; opacity:.3');
    g+=c(-4,-10,3,8,D)+c(1,-10,3,8,A)+c(1,-10,1,8,Hh,'','; opacity:.5')+c(-4,-6,3,1,A)+c(1,-6,3,1,Hh)+c(-5,-2,5,2,K)+c(0,-2,5,2,K)+c(-5,0,5,1,CY)+c(0,0,5,1,CY);
    g+=`<g class="breathe">`;
    g+=c(-5,-22,10,10,A)+c(-5,-22,2,10,D)+c(2,-22,3,10,Hh,'','; opacity:.55')+c(-3,-21,6,5,D,'','; opacity:.35')+c(-3,-21,6,1,Hh,'','; opacity:.6')+c(-1,-18,2,2,Y)+c(-5,-13,10,2,K)+c(-1,-13,2,2,Y)+c(-4,-11,8,2,A);
    g+=c(-8,-25,4,4,D)+c(-8,-25,4,1,A)+c(4,-25,4,4,A)+c(4,-25,4,1,Hh)+c(7,-24,1,3,Y,'','; opacity:.7');
    g+=c(-3,-34,6,1,K)+c(-4,-33,8,8,K)+c(-3,-33,6,7,A)+c(-3,-33,2,7,D)+c(1,-33,2,7,Hh,'','; opacity:.55')+c(-3,-31,6,2,CY,'pulse')+c(1,-31,2,1,'#fff')+c(-2,-26,4,1,D)+c(0,-37,1,3,K)+c(0,-38,1,1,'#ff3b3b','fl')+c(-1,-25,2,1,K);
    if(mode==='scan'){
      g+=c(-8,-21,2,9,D)+c(5,-22,2,4,A)+c(5,-19,8,2,A)+c(5,-19,8,1,Hh,'','; opacity:.5')+c(12,-20,2,3,K)+c(13,-19,5,2,'var(--rackbd)')+c(18,-19,1,2,Y,'pulse');
      g+=`<g transform="translate(57 -54)"><g class="sweep"><polygon points="0,0 130,-26 130,26" style="fill:var(--acc);opacity:.10"/>${R(0,-1,130,2,'var(--acc)','','; opacity:.85')}</g></g>`;
    }else{
      g+=c(-8,-21,2,9,D)+c(5,-22,2,4,A)+c(5,-19,5,2,A)+c(5,-19,5,1,Hh,'','; opacity:.5')+c(9,-20,2,3,K);
      g+=c(11,-29,11,9,CY,'pulse','; opacity:.2')+c(11,-29,11,1,CY)+c(11,-21,11,1,CY)+c(11,-29,1,9,CY)+c(21,-29,1,9,CY);
      for(let k=0;k<3;k++)g+=c(13,-27+k*2,5+(k%2)*2,1,CY)+c(19,-27+k*2,1,1,'#2fd6a0','tick',`;animation-delay:${(k*.9).toFixed(1)}s`);
    }
    g+=`</g>`;
    return `<g transform="translate(${gx} ${yb}) scale(${dir} 1)">${g}</g>`};
  o+=guard(236,328,1,'scan')+guard(598,330,-1,'holo');
  // dust in the light
  const dq=rng(61);for(let i=0;i<14;i++)o+=R(Math.floor(190+dq()*50)+(i%2)*370,Math.floor(100+dq()*200),2,2,'var(--warm)','steam',`;animation-delay:${(-dq()*3).toFixed(1)}s;opacity:.6`);
  // neon sign as a thick box on rods
  o+=R(300,12,4,12,'var(--ink2)')+R(496,12,4,12,'var(--ink2)');
  o+=B3(270,24,260,52,10,6,'var(--plate)')+R(276,30,248,40,'none','','; stroke:var(--mg);stroke-width:2');
  o+=`<g class="fl" style="filter:drop-shadow(0 0 6px var(--mg))">${T(cx,64,34,'PORTFOLIO','var(--mg)','middle')}</g>`;
  o+=`<g class="bob">${T(cx-8,87,12,'ENTER','var(--acc)','middle')}${P(`${cx+15},85.5 ${cx+22},85.5 ${cx+18.5},91.5`,'var(--acc)')}</g>`;
  o+=plate('PORTFOLIO');
  return scene(H,'A vault door drawn in 2.5D under a neon portfolio sign, with two guards in pixel armour (one sweeping a laser scanner, one reading a holographic clipboard), a wall fan, a keypad and light leaking from the seam. Select to visit the portfolio.',o);
}
