// Animation rules for the scene SVGs, kept as one string. animationCss() in render-scenes.mjs ships only
// the rules (and the keyframes they reference) that a given scene actually uses.
export const ANIM = String.raw`
.rain{animation:fall linear infinite}@keyframes fall{from{transform:translateY(-30px)}to{transform:translateY(460px)}}
.tw{animation:tw 3s steps(1) infinite}@keyframes tw{0%{opacity:1}55%{opacity:.15}65%{opacity:1}}
.fl{animation:fl 6s steps(1) infinite}@keyframes fl{0%,100%{opacity:1}42%{opacity:1}43%{opacity:.25}45%{opacity:1}47%{opacity:.4}48%{opacity:1}}
.cat{transform-box:fill-box;transform-origin:center;animation:roam 22s linear infinite}
@keyframes roam{0%{transform:translateX(0) scaleX(1)}46%{transform:translateX(230px) scaleX(1)}50%{transform:translateX(230px) scaleX(-1)}96%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}}
.legA{animation:legs .5s steps(1) infinite}.legB{animation:legs .5s steps(1) infinite reverse}@keyframes legs{0%{opacity:1}50%{opacity:0}}
.tail{transform-box:fill-box;transform-origin:bottom center;animation:wag 1.6s ease-in-out infinite alternate}@keyframes wag{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
.type{animation:tap .28s steps(1) infinite}@keyframes tap{0%{transform:translateY(0)}50%{transform:translateY(2px)}}
.type2{animation:tap .28s steps(1) infinite;animation-delay:-.14s}
.code{animation:scroll 3s steps(6) infinite}@keyframes scroll{to{transform:translateY(-36px)}}
.pulse{animation:pulse 2s ease-in-out infinite alternate}@keyframes pulse{from{opacity:.35}to{opacity:1}}
.drift{animation:drift linear infinite}@keyframes drift{from{transform:translateX(-1150px)}to{transform:translateX(900px)}}
.steam{animation:rise 3.2s ease-out infinite}@keyframes rise{from{transform:translateY(0);opacity:.6}to{transform:translateY(-40px);opacity:0}}
.flyR{animation:flyR linear infinite}@keyframes flyR{from{transform:translateX(-200px)}to{transform:translateX(850px)}}
.flyL{animation:flyL linear infinite}@keyframes flyL{from{transform:translateX(1000px)}to{transform:translateX(-250px)}}
.sm{animation:smoke 4s ease-out infinite;transform-box:fill-box;transform-origin:center}@keyframes smoke{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:.4}100%{transform:translate(14px,-46px) scale(2.2);opacity:0}}
.fl1{transform-box:fill-box;transform-origin:50% 100%;animation:flk .5s ease-in-out infinite alternate}.fl2{transform-box:fill-box;transform-origin:50% 100%;animation:flk .38s ease-in-out infinite alternate-reverse}.fl3{transform-box:fill-box;transform-origin:50% 100%;animation:flk .3s ease-in-out infinite alternate}
@keyframes flk{from{transform:scale(1,1) skewX(0)}to{transform:scale(.88,1.14) skewX(5deg)}}
.flick{animation:flick 1.1s ease-in-out infinite alternate}@keyframes flick{from{opacity:.55}to{opacity:1}}
.ember{animation:flick .9s ease-in-out infinite alternate}
.lg{transform-box:fill-box;transform-origin:50% 0;animation:swing .45s ease-in-out infinite alternate}.lg2{animation-direction:alternate-reverse}@keyframes swing{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}
.bank{animation:bank 6s ease-in-out infinite alternate}@keyframes bank{from{transform:rotate(-8deg)}to{transform:rotate(-2deg)}}
.trail{transform-box:fill-box;transform-origin:100% 50%;animation:trl 3s ease-in-out infinite alternate}@keyframes trl{from{opacity:.4;transform:scaleX(.92)}to{opacity:1;transform:scaleX(1)}}
.tfall{animation:tfall 2.6s steps(8,end) infinite}@keyframes tfall{from{transform:translateY(0)}to{transform:translateY(42px)}}
.roll{animation:roll .45s linear infinite}@keyframes roll{to{transform:translateY(12px)}}
.obs{animation:obs 2s linear infinite}@keyframes obs{to{transform:translateY(70px)}}
.sway{animation:sway 1.6s ease-in-out infinite alternate}@keyframes sway{from{transform:translateX(-8px)}to{transform:translateX(24px)}}
.pad{animation:pad 1.2s ease-in-out infinite alternate}@keyframes pad{from{transform:translateY(-8px)}to{transform:translateY(14px)}}
.chompA{animation:chA .3s ease-in-out infinite alternate}.chompB{animation:chB .3s ease-in-out infinite alternate}@keyframes chA{from{transform:rotate(0)}to{transform:rotate(-26deg)}}@keyframes chB{from{transform:rotate(0)}to{transform:rotate(26deg)}}
.flow{animation:flow .8s linear infinite}@keyframes flow{to{stroke-dashoffset:-72}}
.wheel{animation:spin .5s linear infinite}
.sweep{animation:sweep 2.8s ease-in-out infinite alternate}@keyframes sweep{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}
.tick{animation:tick 4s ease-in-out infinite}@keyframes tick{0%,10%{opacity:0}30%,80%{opacity:1}100%{opacity:0}}
.breathe{animation:breathe 2.6s ease-in-out infinite alternate}@keyframes breathe{to{transform:translateY(-1.3px)}}
.patrol{transform-box:fill-box;transform-origin:center;animation:patrol 20s linear infinite}@keyframes patrol{0%{transform:translateX(0) scaleX(1)}46%{transform:translateX(150px) scaleX(1)}50%{transform:translateX(150px) scaleX(-1)}96%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}}
.swim{animation:swim 10s ease-in-out infinite alternate}@keyframes swim{from{transform:translateX(0)}to{transform:translateX(86px)}}
.stroke{animation:stk .9s steps(1) infinite}@keyframes stk{0%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.stroll{animation:stroll 46s linear infinite;animation-delay:-14s}@keyframes stroll{from{transform:translateX(-60px)}to{transform:translateX(880px)}}
.duck{animation:duck 4s ease-in-out infinite alternate}@keyframes duck{from{transform:translate(0,0)}to{transform:translate(34px,1px)}}
.ctail{transform-origin:4px -12px;animation:wag 1.6s ease-in-out infinite alternate}
.wave{animation:wave .55s ease-in-out infinite alternate}@keyframes wave{from{transform:rotate(-14deg)}to{transform:rotate(18deg)}}
.scanrow{animation:scanrow 2.5s steps(5) infinite}@keyframes scanrow{from{transform:translateY(0)}to{transform:translateY(40px)}}
.clk{animation:spin 20s linear infinite}.clk2{animation:spin 240s linear infinite}
.fanr{animation:spin 1.2s linear infinite}.spinw{animation:spin 30s linear infinite}
.fan{transform-box:fill-box;transform-origin:center;animation:spin 2.4s linear infinite}
.spin{animation:spin 24s linear infinite;transform-origin:400px 206px}@keyframes spin{to{transform:rotate(360deg)}}
.bob{animation:bob 1.4s ease-in-out infinite alternate}@keyframes bob{to{transform:translateY(5px)}}
.drip{animation:drip 2.4s ease-in infinite}@keyframes drip{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(60px);opacity:0}}
@media (prefers-reduced-motion:reduce){.scene *{animation:none!important}}
`;
