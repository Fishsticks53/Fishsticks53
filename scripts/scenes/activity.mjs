import { rng, R, P, T, plate, scene, bg, rain } from '../draw.mjs';
import { textWidth } from '../font.mjs';
import { bucketLevels } from '../stats.mjs';

// Activity: the last 30 days as a skyline, one building per day, with a count tile and date under each.
// `levels` (optional) overrides the quartile colour buckets.
export function activity(days, stats, levels) {
  const H=470,base=372,pitch=26,w=18,d=7;let o=bg('g2','--s2a','--s2b',H);
  const last=days.slice(-30);
  while(last.length<30)last.unshift({date:null,contributionCount:0});
  const raw=last.map(x=>x.contributionCount),counts=raw.map(c=>Math.min(c,11)),lvs=levels??bucketLevels(raw); // building height saturates at 11; the tile keeps the real count
  const mon=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const monthOf=i=>last[i].date?mon[Number(last[i].date.slice(5,7))-1]:'',dayOf=i=>last[i].date?last[i].date.slice(8,10):'--';
  const total=stats.count,streak=stats.days;
  // horizon haze + distant skyline
  o+=`<defs><linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--mg);stop-opacity:0"/><stop offset="1" style="stop-color:var(--mg);stop-opacity:.22"/></linearGradient></defs>`+R(0,220,800,152,'url(#hz)');
  const q0=rng(8);for(let x=0;x<800;x+=18+Math.floor(q0()*14)){const bw=14+Math.floor(q0()*3)*6,bh=50+Math.floor(q0()*8)*16;o+=R(x,base-bh,bw,bh,'var(--bld)','','; opacity:.7');for(let wy=base-bh+8;wy<base-8;wy+=12)if(q0()<.3)o+=R(x+4,wy,3,5,'var(--win)','tw',`;animation-delay:${(-q0()*3).toFixed(1)}s;opacity:.7`)}
  // aircraft: flat-shaded crisp polygons with swept wings and tail planes, engines ahead of the wings, nav strobes and contrails
  o+=`<defs><linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:#fff;stop-opacity:0"/><stop offset="1" style="stop-color:#fff;stop-opacity:.5"/></linearGradient></defs>`;
  const plane=(y,dur,delay,dir,sc)=>{
    const W1='#dfe5fb',W2='#aab4dc',W3='#8791bf',IN='#1a1e3c';
    let b=`<rect class="trail" x="-300" y="26" width="290" height="3" style="fill:url(#trail)"/><rect class="trail" x="-260" y="-20" width="250" height="2" style="fill:url(#trail);animation-delay:-1.2s"/>`
      +P('12,-6 -22,-34 -36,-32 -14,-6',W3)+P('-38,-34 -30,-34 -32,-30 -38,-30',W2)
      +P('-2,-22 16,-22 20,-19 16,-16 -2,-16',W3)+R(16,-21,3,5,IN)
      +P('-42,-6 -56,-6 -72,-16 -62,-16',W3)
      +P('-44,-8 -60,-34 -50,-34 -30,-8','var(--lv4)')+P('-50,-34 -44,-34 -34,-8 -38,-8','#fff','.25')
      +P('-64,-4 -44,-9 40,-9 54,-7 64,1 54,8 40,10 -44,10 -62,4',W1)+P('-44,3 58,3 62,2 54,8 40,10 -44,10',W2)+R(-60,2,118,2,'var(--lv4)')
      +P('47,-6 58,-4 61,0 49,-1','var(--cy)','','pulse');
    for(let k=0;k<11;k++)b+=R(-30+k*6,-4,3,3,'#9fe9ff','tw',`;animation-delay:${(-k*.3).toFixed(1)}s`);
    b+=P('-40,4 -56,4 -74,20 -64,20',W1)+P('-64,20 -74,20 -72,18 -64,18',W3)
      +P('14,5 -26,42 -44,40 -14,5',W1)+P('-14,5 -44,40 -40,41 -8,12',W2)+P('-44,40 -26,42 -30,46 -46,44',W3)
      +P('-10,22 -2,22 -2,26 -10,27',W3)+P('-8,24 14,24 18,28 14,33 -8,33',W1)+P('-8,30 14,30 18,28 14,33 -8,33',W2)+R(14,25,4,7,IN)+R(16,27,2,3,'var(--cy)','','; opacity:.6')
      +R(-47,40,4,4,'#ff2a2a','fl')+R(-37,-33,3,3,'#2aff6a','fl','; animation-delay:-2s')+R(-53,-36,3,3,'#fff','tw')+R(0,10,3,2,'#ff2a2a','fl','; animation-delay:-1s');
    return `<g class="${dir>0?'flyR':'flyL'}" style="animation-duration:${dur}s;animation-delay:${delay}s"><g transform="translate(0 ${y}) scale(${dir*sc} ${sc})"><g class="bank">${b}</g></g></g>`};
  o+=plane(150,40,-14,1,.6)+plane(188,52,-8,-1,.45)+plane(128,62,-40,1,.34);
  // towers: glass-gradient bodies with side and top faces, window grids, shopfront lobbies, varied crowns
  o+=`<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:#fff;stop-opacity:.24"/><stop offset=".55" style="stop-color:#fff;stop-opacity:0"/><stop offset="1" style="stop-color:#000;stop-opacity:.42"/></linearGradient><linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--mg);stop-opacity:0"/><stop offset="1" style="stop-color:var(--mg);stop-opacity:.3"/></linearGradient></defs>`;
  const wr=rng(5);let glow='';
  const box=(x,yb,bw,bh,L,dd)=>{const y=yb-bh,sd=`${x+bw},${yb} ${x+bw+dd},${yb-4} ${x+bw+dd},${y-4} ${x+bw},${y}`,tp=`${x},${y} ${x+bw},${y} ${x+bw+dd},${y-4} ${x+dd},${y-4}`;
    return R(x,y,bw,bh,L)+R(x,y,bw,bh,'url(#tg)')+P(sd,L)+P(sd,'var(--shade)','.52')+P(tp,L)+P(tp,'#fff','.25')+R(x,y,1,bh,'#fff','','; opacity:.28')+R(x+bw-1,y,1,bh,'var(--shade)','','; opacity:.3')};
  const neon=['var(--mg)','var(--cy)','var(--acc)'],bws=[16,18,20,18,22];
  for(let i=0;i<30;i++){
    const n=counts[i],tx=14+i*pitch;
    if(n===0){ // empty lot: fenced site with a small crane
      o+=R(tx+1,base-6,18,6,'var(--shade)','','; opacity:.55')+R(tx+1,base-6,18,2,'var(--acc)','','; opacity:.45')
        +R(tx+5,base-30,2,30,'var(--ink2)')+R(tx+1,base-30,16,2,'var(--ink2)')+R(tx+14,base-28,1,9,'var(--ink2)')+R(tx+13,base-19,3,2,'var(--ink2)')+R(tx+5,base-33,2,3,'#ff3b3b','fl');
      continue}
    const bw=bws[(i*3+n)%5],x=tx+Math.round((20-bw)/2),h=36+n*17,y=base-h,lv=lvs[i],L=`var(--lv${lv})`,nc=neon[i%3];
    const st=(i*7+n)%6;let topY=y;
    if(n>=7)o+=`<ellipse cx="${x+bw/2+3}" cy="${y+h/2}" rx="26" ry="${h/2+14}" style="fill:var(--lv4);opacity:.12"/>`;
    o+=box(x,base,bw,h,L,d);
    if(h>=70){
      if(st===0){o+=R(x+3,y-10,2,10,'var(--roof2)')+R(x+bw-5,y-10,2,10,'var(--roof2)')+R(x+2,y-16,bw-4,7,'var(--roof2)')+R(x+2,y-17,bw-4,1,'#fff','','; opacity:.2')+P(`${x+2},${y-16} ${x+bw-2},${y-16} ${x+bw/2},${y-21}`,'var(--roof2)');topY=y-21}
      else if(st===1||st===3){const h2=Math.round(h*.16);o+=box(x+3,y,bw-6,h2,L,5);topY=y-h2;if(st===3){const h3=Math.round(h*.1);o+=box(x+6,topY,bw-12,h3,L,3);topY-=h3}}
      else if(st===2){o+=P(`${x},${y} ${x+bw},${y-12} ${x+bw},${y}`,L)+P(`${x},${y} ${x+bw},${y-12} ${x+bw},${y}`,'#fff','.15')+P(`${x+bw},${y-12} ${x+bw+d},${y-16} ${x+bw+d},${y-4} ${x+bw},${y}`,'var(--shade)','.5');topY=y-12}
      else if(st===4){o+=R(x+3,y-14,2,12,L)+R(x+bw-5,y-9,2,7,L)+R(x+bw-8,y-12,6,2,'var(--ink2)');topY=y-14}
      else{o+=R(x+1,y-3,bw-2,3,'var(--roof2)')+R(x+3,y-2,bw-6,1,'#fff','','; opacity:.5')+R(x+1,y-5,2,2,'#ff3b3b','fl')+R(x+bw-3,y-5,2,2,'#ff3b3b','fl','; animation-delay:-1.5s');topY=y-5}
    }
    if(n>=5)o+=R(x+bw/2,topY-18,2,16,L)+R(x+bw/2-1,topY-22,4,4,'#ff3b3b','fl');
    // window grid: unlit panes keep the structure visible, lit ones vary in color
    const cols=Math.floor((bw-3)/5),sx=x+Math.round((bw-(cols*5-2))/2);
    for(let wy=base-20;wy>y+5;wy-=7){
      const full=wr()<.06;
      for(let c=0;c<cols;c++){const wx=sx+c*5;
        if(full||wr()<.26+n*.05){const t=wr()<.2,k=wr(),cl=k<.8?'var(--win)':k<.92?'var(--cy)':'var(--mg)';o+=R(wx,wy,3,4,cl,t?'tw':'',(full?';opacity:.95':'')+(t?`;animation-delay:${(-wr()*3).toFixed(1)}s`:''))}
        else o+=R(wx,wy,3,4,'var(--shade)','','; opacity:.28')}
      if(wr()<.3)o+=R(x+bw+2,wy-1,3,4,'var(--win)','','; opacity:.55');
    }
    if(i%4===1&&h>90)o+=R(x+2,y+10,bw-4,11,'var(--plate)','','; stroke:'+nc+';stroke-width:1')+R(x+4,y+13,bw-8,2,nc,'pulse')+R(x+4,y+17,Math.round((bw-8)*.6),2,nc,'pulse','; animation-delay:-1s');
    if(lv>=3&&i%2===0)o+=R(x+bw+2,y+8,2,Math.min(70,Math.round(h*.5)),nc,'pulse','; opacity:.9');
    // ground-floor shopfront with neon sign and lit door
    o+=R(x,base-10,bw,10,'var(--shade)','','; opacity:.6')+R(x+2,base-9,bw-4,2,nc)+R(x+Math.floor(bw/2)-2,base-6,4,6,'var(--win)','','; opacity:.85');
    glow+=R(x,base+1,bw,3,nc,'','; opacity:.3');
    if(i===29)o+=`<rect x="${x-1}" y="${y-1}" width="${bw+2}" height="${h+2}" class="pulse" style="fill:none;stroke:var(--acc);stroke-width:2"/>`;
  }
  o+=R(0,base-46,800,46,'url(#fog)');
  // platform
  o+=R(4,base,792,14,'var(--tilebd)')+R(4,base,792,2,'var(--cy)','','; opacity:.6')+R(4,base+14,792,64,'var(--tile)')+R(4,base+14,792,2,'var(--shade)','','; opacity:.4');
  o+=R(4,base+14,792,64,'var(--shade)','','; opacity:.12');
  o+=glow;
  // count tiles and dates
  for(let i=0;i<30;i++){
    const n=raw[i],x=14+i*pitch,lv=lvs[i];
    o+=R(x-1,base+24,w+4,22,`var(--lv${lv})`)+R(x-1,base+24,w+4,2,'#fff','','; opacity:.3')+R(x-1,base+44,w+4,2,'var(--shade)','','; opacity:.4');
    if(n>0)o+=T(x+w/2+1,base+40,11,Math.min(n,99),lv>=3?'var(--plate)':'var(--ink)','middle');
    o+=T(x+w/2+1,base+64,10,dayOf(i),i===29?'var(--acc)':'var(--ink2)','middle');
    if(i===29)o+=`<rect x="${x-2}" y="${base+23}" width="${w+6}" height="24" class="pulse" style="fill:none;stroke:var(--acc);stroke-width:2"/>`;
  }
  o+=T(10,base+11,10,monthOf(0),'var(--ink)')+T(14+29*pitch-6,base+11,10,monthOf(29),'var(--ink)');
  {const x0=792-textWidth(10,'TODAY');o+=T(792,base+78,10,'TODAY','var(--acc)','end')+P(`${x0-8.7},${base+78} ${x0-2.2},${base+78} ${x0-5.5},${base+73}`,'var(--acc)');}
  o+=rain(H,33,24);
  o+=plate('ACTIVITY');
  o+=R(20,64,262,64,'var(--plate)','','; stroke:var(--tilebd);stroke-width:2')
    +T(32,84,13,'NOW','var(--acc)')+T(32,102,12,`last commit ${stats.ago}`,'var(--ink)')
    +T(32,119,12,`${total} contributions · ${streak} day streak`,'var(--ink2)');
  o+=T(10,base+92,11,'LAST 30 DAYS · TALLER AND BRIGHTER = MORE CONTRIBUTIONS','var(--ink2)');
  return scene(H,`Skyline of the last 30 days of GitHub contributions, one building per day from left to right: ${total} contributions, a ${streak} day streak, last commit ${stats.ago}. Taller, brighter buildings are busier days. Select to view the contribution graph.`,o);
}

