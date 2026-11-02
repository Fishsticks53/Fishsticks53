import { rng, R, P, T, plate, scene, bg, B3 } from '../draw.mjs';

// Tech stack: an arcade station with one cabinet per technology, passengers, security, and an arriving train.
export function stack() {
  const H=500,r=rng(9);let o=bg('g3','--s3a','--s3b',H);
  o+=`<defs><pattern id="scan" width="4" height="2" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".28"/></pattern>
    <radialGradient id="vig"><stop offset=".6" style="stop-color:#000;stop-opacity:0"/><stop offset="1" style="stop-color:#000;stop-opacity:.55"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:#bff6ff;stop-opacity:.5"/><stop offset="1" style="stop-color:#bff6ff;stop-opacity:0"/></linearGradient></defs>`;
  for(let x=0;x<800;x+=100)o+=R(x,64,2,274,'var(--shade)','','; opacity:.3');
  // ceiling, pipes, cable tray
  o+=R(0,0,800,64,'var(--ceil)')+R(0,64,800,4,'var(--shade)','','; opacity:.4');
  o+=R(0,22,800,8,'var(--pipe)')+R(0,23,800,2,'#fff','','; opacity:.15')+R(0,34,800,6,'var(--pipe)','','; opacity:.7');
  for(let x=30;x<800;x+=90)o+=R(x,18,6,26,'var(--rackbd)');
  o+=R(0,84,800,7,'var(--rackbd)');for(let x=10;x<800;x+=40)o+=R(x,91,3,6,'var(--rackbd)');
  for(let i=0;i<8;i++){const cx0=20+i*94+32;o+=R(cx0-2,91,3,213-10-91,'var(--cable)')+R(cx0+8,91,3,213-10-91,'var(--cable)','','; opacity:.7');}
  // station wall: neon tubes, departure board, hanging platform sign, clock
  o+=R(0,100,800,2,'var(--mg)','','; opacity:.55;filter:drop-shadow(0 0 4px var(--mg))')+R(0,106,800,2,'var(--cy)','','; opacity:.55;filter:drop-shadow(0 0 4px var(--cy))');
  o+=B3(36,126,176,54,6,4,'var(--plate)')+R(40,130,168,46,'var(--scr)')+T(48,145,10,'NEXT   PORTFOLIO   2 MIN','var(--acc)')+T(48,160,10,'THEN   ACTIVITY    9 MIN','var(--cy)')+R(48,168,4,4,'#2fd6a0','tw');
  o+=R(340,92,3,34,'var(--ink2)')+R(458,92,3,34,'var(--ink2)')+B3(320,124,160,34,8,4,'var(--plate)')+R(324,128,152,26,'none','','; stroke:var(--cy);stroke-width:1')+`<g style="filter:drop-shadow(0 0 4px var(--cy))">${T(400,148,14,'PLATFORM 1','var(--cy)','middle')}</g>`;
  const octa=(cx,cy,rr)=>`${cx-rr*.34},${cy-rr} ${cx+rr*.34},${cy-rr} ${cx+rr},${cy-rr*.34} ${cx+rr},${cy+rr*.34} ${cx+rr*.34},${cy+rr} ${cx-rr*.34},${cy+rr} ${cx-rr},${cy+rr*.34} ${cx-rr},${cy-rr*.34}`;
  o+=P(octa(730,150,24),'var(--rackbd)')+P(octa(730,150,20),'var(--plate)');
  for(let k=0;k<12;k++){const a=k*Math.PI/6;o+=R(Math.round(730+Math.sin(a)*16)-1,Math.round(150-Math.cos(a)*16)-1,2,2,k%3?'var(--ink2)':'var(--ink)')}
  o+=`<g transform="translate(730 150)"><g class="clk2">${R(-1,-13,2,13,'var(--ink)')}</g><g class="clk">${R(-1,-9,2,9,'var(--acc)')}</g></g>`+R(-2,-2,0,0,'none')+R(728,148,4,4,'var(--ink)');
  const names=['TYPESCRIPT','REACT','PYTHON','FASTAPI','PYTORCH','LANGCHAIN','DOCKER','POSTGRES'],cols=['#3a86ff','#4de1ff','#ffd34d','#2fd6a0','#ff6b4a','#b47cff','#00c2ff','#ff8fb8'];
  // station floor with a yellow safety line and tactile edge, then the platform edge
  o+=R(0,338,800,38,'var(--floor)')+R(0,338,800,2,'var(--cy)','','; opacity:.35');
  for(let x=-60;x<860;x+=60)o+=P(`${x},376 ${x+2},376 ${x+68},338 ${x+66},338`,x%120?'var(--mg)':'var(--cy)','.3');
  o+=R(0,350,800,1,'var(--rackbd)','','; opacity:.35')+R(0,362,800,1,'var(--rackbd)','','; opacity:.35');
  o+=R(0,368,800,3,'#ffd34d','','; opacity:.85');for(let x=0;x<800;x+=8)o+=R(x,372,4,2,'var(--acc)','','; opacity:.7');
  o+=R(0,376,800,16,'var(--rackbd)')+R(0,376,800,2,'var(--cy)','','; opacity:.5');
  for(let x=0;x<800;x+=40)o+=P(`${x},379 ${x+14},379 ${x+8},390 ${x-6},390`,'var(--acc)','.5');
  const game=(i)=>{
    switch(i){
      case 0:{ // Tetris-style falling blocks
        let s=R(0,0,68,56,'#05122a');
        const stack=[[0,0,'#3a86ff'],[6,0,'#4de1ff'],[12,0,'#3a86ff'],[18,0,'#fff'],[24,0,'#4de1ff'],[36,0,'#3a86ff'],[42,0,'#4de1ff'],[48,0,'#fff'],[54,0,'#3a86ff'],[60,0,'#4de1ff'],[6,-6,'#4de1ff'],[12,-6,'#3a86ff'],[42,-6,'#3a86ff'],[48,-6,'#4de1ff'],[48,-12,'#fff']];
        stack.forEach(([x,y,c],k)=>{s+=R(x+1,50+y,5,5,c,k<5&&y===0?'tw':'',k<5&&y===0?`;animation-delay:${(-k*.4).toFixed(1)}s`:'')});
        s+=`<g class="tfall">${R(25,0,5,5,'#ff6b4a')+R(31,0,5,5,'#ff6b4a')+R(37,0,5,5,'#ff6b4a')+R(31,-6,5,5,'#ff6b4a')}</g><g class="tfall" style="animation-delay:-1.3s">${R(7,-12,5,5,'#ffd34d')+R(13,-12,5,5,'#ffd34d')+R(7,-6,5,5,'#ffd34d')+R(13,-6,5,5,'#ffd34d')}</g>`;
        return s+T(34,8,6,'TS','#fff','middle')}
      case 1:{ // orbit defender: atom with electrons
        let s=R(0,0,68,56,'#06142a');for(let k=0;k<9;k++)s+=R(4+k*7,5+(k*13)%46,1,1,'#fff','tw',`;animation-delay:${(-k*.3).toFixed(1)}s`);
        s+=`<g transform="translate(34 28)">`;
        [0,60,120].forEach((a,k)=>{s+=`<g transform="rotate(${a})"><ellipse rx="24" ry="9" style="fill:none;stroke:#4de1ff;stroke-width:1.2;opacity:.8"/><circle r="2.2" style="fill:#fff"><animateMotion dur="${2.2+k*.5}s" repeatCount="indefinite" path="M24,0 A24,9 0 1,1 -24,0 A24,9 0 1,1 24,0"/></circle></g>`});
        return s+`<circle r="3.2" class="pulse" style="fill:#4de1ff"/></g>`}
      case 2:{ // snake loop
        let s=R(0,0,68,56,'#06180f');s+=R(46,12,3,3,'#ff6b4a','tw');
        const path='M8,8 H58 V46 H8 Z';
        for(let k=7;k>=0;k--)s+=`<rect width="4" height="4" x="-2" y="-2" style="fill:${k===0?'#ffd34d':'#3a86ff'}"><animateMotion dur="5s" begin="${(-k*.16).toFixed(2)}s" repeatCount="indefinite" path="${path}"/></rect>`;
        return s+T(34,52,5,'SCORE 0420','#9affc0','middle')}
      case 3:{ // racing
        let s=R(0,0,68,56,'#0b1a16')+R(14,0,40,56,'#1c2a30')+R(12,0,2,56,'#2fd6a0')+R(54,0,2,56,'#2fd6a0');
        s+=`<g class="roll">`;for(let k=-1;k<6;k++)s+=R(33,k*12,2,6,'#fff','','; opacity:.8');s+=`</g>`;
        s+=`<g class="obs">${R(20,-8,8,10,'#ffd34d')}</g><g class="obs" style="animation-delay:-1s">${R(40,-8,8,10,'#b47cff')}</g>`;
        return s+`<g class="sway">${R(26,42,10,10,'#ff3b6a')+R(28,44,6,3,'#bff6ff')}</g>`}
      case 4:{ // pong
        let s=R(0,0,68,56,'#160b0b');for(let k=0;k<7;k++)s+=R(33,k*8+2,2,4,'#fff','','; opacity:.5');
        s+=`<g class="pad">${R(4,16,3,14,'#ff6b4a')}</g><g class="pad" style="animation-delay:-.8s">${R(61,24,3,14,'#ff6b4a')}</g>`;
        s+=`<rect width="4" height="4" x="-2" y="-2" style="fill:#fff"><animateMotion dur="2.4s" repeatCount="indefinite" path="M8,12 L60,34 L8,44 L60,16 L8,12" calcMode="linear"/></rect>`;
        return s+T(24,9,7,'3','#fff','middle')+T(44,9,7,'2','#fff','middle')}
      case 6:{ // docker: whale carrying containers
        let s=R(0,0,68,56,'#04182a');for(let k=0;k<5;k++)s+=R(0,38+k*4,68,1,'#0b3a66','','; opacity:.7');
        s+=`<g class="bob">`+R(10,34,40,12,'#1d9bf0')+R(10,42,40,4,'#7fd0ff')+P('50,36 62,28 62,36 54,44','#1d9bf0')+R(14,38,3,3,'#fff')+R(15,39,1,1,'#04182a')
          +R(14,24,9,10,'#ff6b4a')+R(24,24,9,10,'#ffd34d')+R(34,24,9,10,'#2fd6a0')+R(19,14,9,10,'#b47cff')+R(29,14,9,10,'#ff8fb8')+R(24,6,9,8,'#4de1ff','tw')+`</g>`;
        for(let k=0;k<4;k++)s+=R(52+k*3,22-k*2,2,2,'#bff6ff','steam',`;animation-delay:${(-k*.7).toFixed(1)}s`);
        return s+T(34,52,5,'docker run','#7fd0ff','middle')}
      case 7:{ // postgres: query scanning a table
        let s=R(0,0,68,56,'#0b1424');
        for(let rw=0;rw<5;rw++)for(let cl=0;cl<4;cl++)s+=R(5+cl*15,8+rw*8,13,6,rw===0?'#2b4a78':'#14233b');
        s+=`<g class="scanrow">${R(4,8,60,6,'#ff8fb8','','; opacity:.35')}${R(4,8,60,1,'#ff8fb8')}</g>`;
        s+=R(5,50,2,4,'#fff','tw')+T(10,54,5,'SELECT *','#ff8fb8');
        return s+T(34,6,5,'users','#6aa0d8','middle')}
      default:{ // chain chomper eating dots
        let s=R(0,0,68,56,'#10091f');for(let k=0;k<7;k++){const t=(k+1)/9;s+=`<rect x="${8+k*8}" y="27" width="2" height="2" style="fill:#fff"><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;${t.toFixed(2)};${(t+.02).toFixed(2)};.98;1" dur="3.6s" repeatCount="indefinite"/></rect>`}
        s+=`<g><animateTransform attributeName="transform" type="translate" values="4,0;58,0" dur="3.6s" repeatCount="indefinite"/><g transform="translate(0 28)"><g class="chompA"><path d="M0 0 L8 0 A8 8 0 0 0 -8 0 Z" style="fill:#b47cff"/></g><g class="chompB"><path d="M0 0 L-8 0 A8 8 0 0 0 8 0 Z" style="fill:#b47cff"/></g></g></g>`;
        s+=`<g><animateTransform attributeName="transform" type="translate" values="-14,0;40,0" dur="3.6s" repeatCount="indefinite"/><path d="M0 24 Q0 18 6 18 Q12 18 12 24 L12 32 L9 30 L6 32 L3 30 L0 32 Z" style="fill:#4de1ff"/>${R(3,22,2,2,'#fff')+R(8,22,2,2,'#fff')}</g>`;
        return s+T(34,10,5,'LINK UP','#b47cff','middle')}
    }};

  for(let i=0;i<8;i++)o+=`<ellipse cx="${20+i*94+38}" cy="340" rx="44" ry="4" style="fill:${cols[i]};opacity:.2"/>`;
  names.forEach((nm,i)=>{
    const o0=o;o='';
    const x=0,y=0,rw=96,col=cols[i];
    // cabinet body, with neon side art on the extruded face
    o+=B3(x,y+22,rw,168,14,8,'var(--rack)');
    o+=R(x+2,y+24,rw-4,164,'none','','; stroke:var(--rackbd);stroke-width:1');
    let side='';for(let k=0;k<5;k++)side+=R(3,16+k*30,8,18,col,'tw',`;opacity:.7;animation-delay:${(-k*.5).toFixed(1)}s`);
    o+=`<g transform="matrix(1,-.571,0,1,${x+rw},${y+22})">${side}</g>`;
    // angled marquee
    o+=P(`${x+6},${y} ${x+rw-6},${y} ${x+rw+4},${y-6} ${x+16},${y-6}`,'var(--plate)')+P(`${x+6},${y} ${x+rw-6},${y} ${x+rw+4},${y-6} ${x+16},${y-6}`,'#fff','.2')
      +P(`${x+rw-2},${y+22} ${x+rw-6},${y} ${x+rw+4},${y-6} ${x+rw+12},${y+16}`,'var(--shade)','.5')
      +P(`${x+2},${y+22} ${x+rw-2},${y+22} ${x+rw-6},${y} ${x+6},${y}`,'var(--plate)')+P(`${x+6},${y} ${x+rw-6},${y} ${x+rw-6},${y+3} ${x+6},${y+3}`,col)
      +`<g style="filter:drop-shadow(0 0 4px ${col})">${T(x+rw/2,y+16,12,nm,col,'middle')}</g>`
      +R(x+10,y+19,rw-20,1,col,'pulse');
    // recessed CRT: bezel, screen with game, scanlines, vignette, glass shine
    o+=R(x+8,y+26,80,66,'var(--shade)')+R(x+8,y+26,80,2,'#000','','; opacity:.6')+R(x+8,y+26,2,66,'#000','','; opacity:.6')+R(x+8,y+90,80,1,'#fff','','; opacity:.15');
    const SX=x+14,SY=y+31;
    o+=`<clipPath id="crt${i}"><rect x="${SX}" y="${SY}" width="68" height="56" rx="4"/></clipPath><g clip-path="url(#crt${i})"><g transform="translate(${SX} ${SY})">${game(i)}</g><rect x="${SX}" y="${SY}" width="68" height="56" fill="url(#scan)"/><rect x="${SX}" y="${SY}" width="68" height="56" fill="url(#vig)"/><polygon points="${SX},${SY} ${SX+30},${SY} ${SX},${SY+24}" fill="#fff" opacity=".07"/></g>`;
    // control deck: thick lip, top panel with joystick and buttons
    o+=B3(x+2,y+106,rw-4,8,12,16,'var(--rackbd)');
    o+=R(x+30,y+96,2,8,'var(--ink2)')+`<circle cx="${x+31}" cy="${y+94}" r="3.6" style="fill:#ff2a4a"/><circle cx="${x+30}" cy="${y+93}" r="1.2" style="fill:#fff;opacity:.6"/>`;
    [[52,99,'#ffd34d'],[62,97,col],[72,95,'#fff']].forEach(([bx,by,c])=>o+=`<circle cx="${x+bx}" cy="${y+by}" r="2.6" style="fill:${c}"/>`);
    // coin door and kick plate
    o+=R(x+14,y+122,68,38,'var(--slot)')+R(x+24,y+130,10,14,'var(--plate)')+R(x+28,y+133,2,8,'var(--acc)','pulse')+R(x+60,y+130,10,14,'var(--plate)')+R(x+64,y+133,2,8,col,'pulse','; animation-delay:-1s');
    for(let k=0;k<4;k++)o+=R(x+38,y+130+k*4,18,1,'var(--rackbd)');
    o+=R(x+4,y+172,rw-8,18,'var(--shade)','','; opacity:.55')+R(x+rw/2+4,y-14,4,4,col,'tw');
    const SC=.66,CX=20+i*94;
    o=o0+`<g transform="translate(${CX} ${338-190*SC}) scale(${SC})">${o}</g>`;
  });

  // station furniture: bench and vending machine
  o+=B3(360,352,70,4,10,4,'var(--wood)')+R(364,356,4,16,'var(--wood)')+R(422,356,4,16,'var(--wood)')+R(362,334,3,20,'var(--wood)')+R(425,334,3,20,'var(--wood)');for(let k=0;k<3;k++)o+=B3(362,336+k*6,66,3,9,3,'var(--wood)');
  o+=B3(762,296,30,78,6,4,'var(--plate)')+R(768,304,18,26,'var(--scr)')+R(770,308,14,4,'#ff8fb8','tw')+R(770,316,14,4,'#4de1ff','tw','; animation-delay:-1s')+R(770,324,14,3,'#ffd34d','tw','; animation-delay:-2s')+R(768,338,18,6,'var(--shade)')+R(772,350,10,3,'var(--acc)','pulse')+R(768,360,18,10,'var(--shade)','','; opacity:.6');
  // passengers going about their day: students and office workers waiting, reading, listening to music, or walking home
  const pp=(o)=>{
    const K='#1f1630',S=o.skin||'#e8b48f',SD='#c48e66',T=o.top,TD=o.topD,Pn=o.pants,PD=o.pantsD||o.pants,H=o.hair||'#2b2040',SH=o.shoe||'#2a2f58',dy=o.sit?2:0;
    const c=(x,y,w,h,f,cl='',ex='')=>R(x*2,y*2,w*2,h*2,f,cl,ex);
    let g=c(-7,0,14,1,'#000','','; opacity:.28');
    const legs=(a,b,fa,fb)=>c(a,-13,4,11,Pn)+c(b,-13,4,11,PD)+c(a-1,-2,5,2,SH)+c(b,-2,5,2,SH);
    if(o.sit)g+=c(-4,-11,9,3,Pn)+c(4,-11,4,3,PD)+c(4,-8,4,8,Pn)+c(3,-2,5,2,SH);
    else if(o.walk)g+=`<g class="legA">${c(-5,-13,4,11,Pn)+c(1,-13,3,10,PD)+c(-6,-2,5,2,SH)+c(1,-3,4,2,SH)}</g><g class="legB">${c(-4,-13,3,10,Pn)+c(1,-13,4,11,PD)+c(-4,-3,4,2,SH)+c(1,-2,5,2,SH)}</g>`;
    else if(o.skirt)g+=c(-4,-8,3,6,SD)+c(1,-8,3,6,SD)+c(-4,-6,3,2,'#fff')+c(1,-6,3,2,'#fff')+c(-5,-2,4,2,SH)+c(1,-2,4,2,SH)+c(-5,-13,10,5,Pn);
    else g+=legs(-4,0);
    g+=`<g${o.sit?'':' class="breathe"'}>`;
    if(o.bag)g+=c(4,-24+dy,4,12,o.bag)+c(4,-24+dy,4,1,'#fff','','; opacity:.3');
    g+=c(-5,-25+dy,10,12,T)+c(2,-25+dy,3,12,TD)+c(-5,-14+dy,10,1,TD);
    if(o.vest)g+=c(-5,-25+dy,10,12,'#ffd34d')+c(-5,-25+dy,2,12,'#e0a800')+c(-5,-21+dy,10,1,'#e8ecff')+c(-5,-17+dy,10,1,'#e8ecff')+c(-1,-25+dy,2,12,T);
    if(o.back&&o.bag)g+=c(-4,-24+dy,8,11,o.bag)+c(-4,-24+dy,8,1,'#fff','','; opacity:.3')+c(-3,-19+dy,6,4,o.bagD||o.bag,'','; opacity:.7')+c(-4,-14+dy,8,1,'#000','','; opacity:.25');
    if(o.collar)g+=c(-2,-25+dy,4,2,'#fff');
    if(o.tie)g+=c(0,-24+dy,1,7,o.tie);
    if(o.badge)g+=c(-1,-24+dy,1,8,'#4de1ff')+c(-2,-16+dy,3,3,'#fff')+c(-1,-15+dy,1,1,K);
    if(o.strap)g+=c(-4,-24+dy,1,9,o.bag)+c(3,-24+dy,1,9,o.bag);
    const arm=(x,t)=>c(x,-25+dy,2,10,t)+c(x,-15+dy,2,2,S);
    if(o.item==='book'){g+=c(-7,-25+dy,2,6,T)+c(5,-25+dy,2,6,TD)+c(-5,-22+dy,10,6,o.cover||'#ff8fb8')+c(-5,-22+dy,10,1,'#fff')+c(-5,-17+dy,10,1,'#fff')+c(-6,-19+dy,2,2,S)+c(4,-19+dy,2,2,S)}
    else if(o.item==='phone'){g+=arm(-7,T)+c(5,-25+dy,2,5,TD)+c(3,-23+dy,4,2,TD)+c(3,-25+dy,3,5,'#4de1ff','tw')+c(3,-21+dy,3,2,S)}
    else if(o.item==='coffee'){g+=arm(-7,T)+c(5,-25+dy,2,8,TD)+c(5,-17+dy,2,2,S)+c(6,-21+dy,4,5,'#fff')+c(6,-20+dy,4,2,'#b86a10')+c(7,-24+dy,1,2,'#fff','steam','; opacity:.6')}
    else if(o.item==='briefcase'){g+=arm(-7,T)+arm(5,TD)+c(4,-12+dy,10,7,'#6a4129')+c(4,-12+dy,10,1,'#8a5a3c')+c(7,-14+dy,4,2,'#3e2615')+c(8,-9+dy,2,1,'#ffd34d')}
    else if(o.item==='watch'){g+=arm(-7,T)+c(5,-25+dy,2,6,TD)+c(3,-21+dy,4,2,TD)+c(2,-23+dy,2,2,S)+c(4,-22+dy,2,1,'#ffd34d')}
    else if(o.item==='tote'){g+=arm(-7,T)+arm(5,TD)+c(5,-14+dy,9,8,'#e0b87a')+c(5,-14+dy,9,1,'#f0d098')+c(7,-19+dy,5,5,'none','','; stroke:#e0b87a;stroke-width:2')}
    else if(o.item==='play')g+=c(-8,-25+dy,3,5,T)+c(5,-25+dy,3,5,TD)+c(-6,-21+dy,4,2,T)+c(2,-21+dy,4,2,TD)+`<g class="type">${c(-3,-21+dy,2,2,S)}${c(1,-21+dy,2,2,S)}</g>`;
    else g+=arm(-7,T)+arm(5,TD);
    if(o.radio)g+=c(5,-26+dy,2,4,'#222')+c(5,-28+dy,1,2,'#222')+c(6,-26+dy,1,1,'#2fd6a0','tw');
    if(o.back){g+=c(-4,-35+dy,8,9,H)+c(-5,-37+dy,10,3,H)+c(-5,-34+dy,1,6,H)+c(4,-34+dy,1,6,H)+c(-1,-26+dy,2,1,SD)+(o.hairStyle==='long'?c(-5,-34+dy,2,10,H)+c(3,-34+dy,2,10,H):'');if(o.phones)g+=c(-5,-34+dy,1,4,'#2a2f58')+c(4,-34+dy,1,4,'#2a2f58')+c(-4,-38+dy,8,1,'#2a2f58')+c(-6,-33+dy,2,4,'#ff4fa3')+c(4,-33+dy,2,4,'#ff4fa3');g+=`</g>`;return g}
    g+=c(-1,-26+dy,2,1,SD)+c(-4,-35+dy,8,9,S)+c(-4,-35+dy,1,9,S,'','; opacity:.9')+c(3,-35+dy,1,9,SD,'','; opacity:.5');
    if(o.hairStyle==='long')g+=c(-5,-37+dy,10,3,H)+c(-5,-34+dy,2,10,H)+c(3,-34+dy,2,10,H)+c(-3,-35+dy,6,1,H);
    else if(o.hairStyle==='pony')g+=c(-5,-37+dy,10,3,H)+c(-5,-34+dy,1,3,H)+c(4,-34+dy,1,3,H)+c(4,-33+dy,2,7,H);
    else g+=c(-5,-37+dy,10,3,H)+c(-5,-34+dy,1,3,H)+c(4,-34+dy,1,3,H);
    g+=c(-2,-31+dy,1,2,K)+c(1,-31+dy,1,2,K)+c(-1,-28+dy,2,1,'#a8553f');
    if(o.glasses)g+=c(-3,-32+dy,3,1,K)+c(0,-32+dy,3,1,K);
    if(o.phones)g+=c(-5,-34+dy,1,4,'#2a2f58')+c(4,-34+dy,1,4,'#2a2f58')+c(-4,-38+dy,8,1,'#2a2f58')+c(-6,-33+dy,2,4,'#ff4fa3')+c(4,-33+dy,2,4,'#ff4fa3');
    if(o.buds)g+=c(-5,-31+dy,1,1,'#fff')+c(4,-31+dy,1,1,'#fff');
    if(o.cap)g+=c(-5,-38+dy,10,3,o.cap)+c(-6,-35+dy,12,1,o.cap)+c(-1,-37+dy,2,1,'#ffd34d');
    g+=`</g>`;
    return g};
  const place=(x,y,flip,o,cls='')=>`<g transform="translate(${x} ${y}) scale(${flip?-1:1} 1)"><g${cls?` class="${cls}"`:''}>${pp(o)}</g></g>`;
  const NAVY='#2a3a7a',NAVYD='#1e2a5c';
  o+=place(52,366,0,{back:1,top:NAVY,topD:NAVYD,pants:'#7a1f3a',skirt:1,hair:'#5a3822',hairStyle:'long',bag:'#ff8fb8',bagD:'#d86a98',item:'play'});                              // school student at the arcade
  o+=place(146,366,0,{back:1,top:NAVY,topD:NAVYD,pants:'#5a6070',pantsD:'#4a505e',hair:'#1f1630',bag:'#3a86ff',bagD:'#2a62c0',item:'play'});                         // school student at the arcade
  o+=place(268,361,0,{top:'#7c52d6',topD:'#5a38a6',pants:'#3a5a9a',pantsD:'#2e4a80',hair:'#8a4a28',item:'coffee',buds:1,bag:'#e0b87a'});                           // college student with coffee
  o+=place(398,371,1,{sit:1,top:'#ee7a4a',topD:'#c85a2e',pants:'#2e3a6a',hair:'#2b2040',item:'phone',bag:'#3a86ff',glasses:1});                                         // student on the bench
  o+=place(470,364,0,{top:'#4a4f6a',topD:'#363a52',collar:1,tie:'#e4384e',pants:'#2a2d40',hair:'#3e2615',item:'briefcase'});                                               // office worker with briefcase
  o+=place(522,366,0,{back:1,top:NAVY,topD:NAVYD,pants:'#5a6070',pantsD:'#4a505e',hair:'#9a6a4a',bag:'#2fd6a0',bagD:'#1f9a72',phones:1,item:'play'});                  // school student at the arcade
  o+=place(592,366,1,{top:'#2fb7a8',topD:'#238c82',collar:1,badge:1,pants:'#2a2d40',hair:'#1f1630',hairStyle:'pony',item:'phone',skin:'#d09a76'});                       // office worker on her phone
  o+=place(668,363,0,{top:'#2a3a7a',topD:'#1e2a5c',collar:1,tie:'#ffd34d',pants:'#363a52',hair:'#9a6a4a',item:'watch',glasses:1,skin:'#f0cba0'});                         // office worker checking the time
  o+=`<g class="stroll">${place(0,368,0,{top:'#58607a',topD:'#444b62',collar:1,tie:'#4de1ff',pants:'#2a2d40',hair:'#1f1630',item:'coffee',walk:1,bag:'#6a4129',skin:'#d09a76'})}</g>`;
  o+=`<g class="patrol">${place(560,367,0,{top:'#1e2a5c',topD:'#16204a',pants:'#1e2a5c',pantsD:'#16204a',hair:'#1f1630',vest:1,cap:'#1e2a5c',radio:1,walk:1,shoe:'#111',skin:'#d09a76'})}</g>`;                         // station security on the platform edge
  // track bed with overhead catenary, then the articulated train with an engine at each end
  o+=R(0,392,800,108,'var(--s3b)','','; opacity:.95');
  for(let x=-10;x<810;x+=26)o+=P(`${x},468 ${x+16},468 ${x+14},486 ${x-2},486`,'var(--rackbd)','.6');
  o+=R(0,467,800,3,'var(--track)')+R(0,481,800,5,'var(--track)')+R(0,481,800,1,'#fff','','; opacity:.2');
  o+=`<line class="flow" x1="0" y1="483" x2="800" y2="483" style="stroke:#fff;stroke-width:1;stroke-dasharray:8 28;opacity:.55"/><line class="flow" x1="0" y1="468" x2="800" y2="468" style="stroke:#fff;stroke-width:1;stroke-dasharray:6 30;opacity:.35;animation-duration:1.1s"/>`;
  for(let x=70;x<800;x+=240)o+=R(x,394,5,92,'var(--ink2)')+R(x+1,394,1,92,'#fff','','; opacity:.2')+R(x-34,394,40,3,'var(--ink2)')+R(x-34,397,3,6,'var(--cy)')+R(x-2,482,12,6,'var(--rackbd)');
  o+=R(0,400,800,2,'var(--ink2)')+R(0,394,800,1,'var(--ink2)');
  for(let x=0;x<800;x+=36)o+=R(x,395,1,6,'var(--ink2)','','; opacity:.7');
  let tr='';const cw=228,jg=12,by=424,bh=56;
  const nose=(x0,dir)=>{const q=(dx,dy)=>`${x0+dir*dx},${dy}`;
    const body=[q(0,by-2),q(24,by+4),q(50,by+28),q(54,by+bh),q(0,by+bh)].join(' '),glass=[q(4,by+6),q(22,by+10),q(38,by+26),q(4,by+26)].join(' '),bev=[q(0,by-2),q(24,by+4),q(24,by+7),q(0,by+2)].join(' ');
    return P(body,'var(--train)')+P(body,'var(--shade)','.3')+P(glass,'var(--cy)','.85')+P(bev,'#fff','.25')+R(dir>0?x0:x0-48,by+36,48,4,'var(--acc)')};
  const panto=(px)=>R(px-12,by-4,6,3,'var(--ink2)')+R(px+6,by-4,6,3,'var(--ink2)')+P(`${px-9},${by-4} ${px-6},${by-4} ${px+2},402 ${px-1},402`,'var(--ink2)')+P(`${px+9},${by-4} ${px+6},${by-4} ${px-2},402 ${px+1},402`,'var(--ink2)')+R(px-10,400,20,2,'#fff')+R(px+2,398,2,2,'#ffd27a','tw');
  // bogies and wheels sit behind full-length skirts, so only the skirt and the rail show
  let hidden='';for(let c=0;c<3;c++){const x=c*(cw+jg);[x+36,x+cw-36].forEach(cx=>{hidden+=R(cx-20,462,40,18,'var(--shade)')});if(c<2)hidden+=R(x+cw+jg/2-20,462,40,18,'var(--shade)')}
  tr+=hidden;
  for(let c=0;c<3;c++){const x=c*(cw+jg);
    tr+=B3(x,by,cw,bh,12,6,'var(--train)')+R(x,by+36,cw,4,'var(--acc)')+R(x,by+42,cw,14,'var(--shade)','','; opacity:.5');
    for(let k=0;k<7;k++)tr+=R(x+14+k*32,by+46,20,2,'var(--rackbd)')+R(x+14+k*32,by+51,20,1,'var(--rackbd)','','; opacity:.6');
    for(let k=0;k<6;k++){const wx=k<3?x+10+k*28:x+138+(k-3)*28;
      tr+=R(wx,by+9,24,20,'var(--shade)')+R(wx+1,by+10,22,18,'var(--win)','','; opacity:.92')+R(wx+6,by+17,5,11,'var(--shade)','','; opacity:.5')+R(wx+7,by+13,3,4,'var(--shade)','','; opacity:.5')
        +R(wx+15,by+18,5,10,'var(--shade)','tw',`;opacity:.5;animation-delay:${(-k*.5).toFixed(1)}s`)+R(wx+16,by+14,3,4,'var(--shade)','','; opacity:.5')}
    tr+=R(x+98,by+6,32,46,'var(--rackbd)')+R(x+113,by+6,2,46,'var(--shade)')+R(x+102,by+10,8,24,'var(--win)','','; opacity:.8')+R(x+118,by+10,8,24,'var(--win)','','; opacity:.8')+R(x+112,by+3,4,2,'#2fd6a0','tw');
    tr+=B3(x+36,by-6,32,5,8,4,'var(--roof2)')+B3(x+150,by-6,32,5,8,4,'var(--roof2)');
    if(c!==1)tr+=panto(x+(c===0?cw-40:60));
    if(c<2)tr+=P(`${x+cw},${by+2} ${x+cw+jg},${by+2} ${x+cw+jg},${by+bh} ${x+cw},${by+bh}`,'var(--shade)')+R(x+cw,by-3,jg,4,'var(--shade)')+R(x+cw+2,by+4,1,bh-6,'var(--ink2)','','; opacity:.6')+R(x+cw+5,by+4,1,bh-6,'var(--ink2)','','; opacity:.6')+R(x+cw+8,by+4,1,bh-6,'var(--ink2)','','; opacity:.6');
  }
  tr+=nose(0,-1)+R(-50,by+40,6,6,'#ff2a2a','fl');                     // rear engine cab
  tr+=nose(2*(cw+jg)+cw,1)+R(2*(cw+jg)+cw+44,by+40,6,6,'#fff','pulse')   // front engine cab
    +P(`${2*(cw+jg)+cw+50},${by+42} ${2*(cw+jg)+cw+230},${by+12} ${2*(cw+jg)+cw+230},${by+72} ${2*(cw+jg)+cw+50},${by+46}`,'url(#beam)','','pulse');
  o+=`<g class="drift" style="animation-duration:22s;animation-delay:-9s">${tr}</g>`;
  o+=plate('TECH STACK');
  return scene(H,'A retro arcade station with eight 2.5D arcade cabinets, each with an angled marquee, a recessed CRT, a joystick and buttons, and an animated mini-game for TypeScript, React, Python, FastAPI, PyTorch, LangChain, Docker and Postgres. Students and office workers wait on the platform, some playing the games, while station security patrols and an articulated train with an engine at each end arrives under an overhead wire. Select to see my repositories.',o);
}

