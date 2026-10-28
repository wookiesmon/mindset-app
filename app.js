// ===== State & migration (v1 -> v2 keeps the same 'bmt' key and all data) =====
let S=JSON.parse(localStorage.bmt||'{}');
S.days??={};S.bank??=[];S.affDays??=[];S.settings={morning:'06:30',evening:'21:00',chime:true,bells:true,vib:true,credit:10000,pin:'',...(S.settings||{})};
if(S.profile&&S.profile.onboarded===undefined)S.profile.onboarded=true;S.v=2;
const save=()=>localStorage.bmt=JSON.stringify(S);save();
const FAST=/fast/.test(location.search); // test mode: 1 min = 1 s
const key=d=>d.toLocaleDateString('en-CA'),today=()=>key(new Date()),D=(k=today())=>S.days[k]??={};
const $=s=>document.querySelector(s),app=$('#app'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`,vib=n=>S.settings.vib&&navigator.vibrate?.(n);
const money=n=>'$'+Math.round(n).toLocaleString();
// ===== Sound (WebAudio, generated, no files) =====
let AC;const actx=()=>{AC??=new (window.AudioContext||window.webkitAudioContext)();AC.resume?.();return AC};
function tone(f,dur=1.5,vol=.08){try{const c=actx(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(vol,c.currentTime+.05);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur)}catch(e){}}
const bell=()=>{tone(392,3,.1);setTimeout(()=>tone(784,2.5,.05),60)};
function ambient(){try{const c=actx(),g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=600;g.gain.value=0;g.gain.linearRampToValueAtTime(.05,c.currentTime+3);const os=[110,164.8,220.5].map(fr=>{const o=c.createOscillator();o.frequency.value=fr;o.connect(f);o.start();return o});f.connect(g).connect(c.destination);return()=>{g.gain.linearRampToValueAtTime(0,c.currentTime+1);setTimeout(()=>os.forEach(o=>o.stop()),1100)}}catch(e){return()=>{}}}
// ===== IndexedDB for voice recordings =====
const idb=()=>new Promise((r,j)=>{const q=indexedDB.open('bmt',1);q.onupgradeneeded=()=>q.result.createObjectStore('a');q.onsuccess=()=>r(q.result);q.onerror=j});
const idbPut=async(k,v)=>{const db=await idb();return new Promise(r=>{const t=db.transaction('a','readwrite');t.objectStore('a').put(v,k);t.oncomplete=r})};
const idbGet=async k=>{const db=await idb();return new Promise(r=>{const q=db.transaction('a').objectStore('a').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})};
// ===== Content =====
const affirm=()=>{const p=S.profile||{};return p.affirmations||[`I am becoming the person who reaches ${p.net||'my target net worth'}.`,`I am building: ${p.goal||'my big goal'}.`,'Money flows to me through value I create.','My thoughts and habits shape my life, and I choose them on purpose.','I am a faithful steward of what I have been given.']};
const HABITS=['Movement / exercise','Cold shower','Morning sunlight 10 min','Keep my eating window','Water first','No phone first 30 min','Read 10 pages','Walk after meals'];
const GOALS=['Wealth','Health','Faith','Peace of mind','Relationships','Purpose'];
const MOODS=['😞','😕','😐','🙂','😄'];
const MED_M=()=>`Close your eyes. Let go of your body, your room and your schedule. Picture yourself five years ahead, having reached your goal. How do you wake up? How do you speak, decide, give, and treat people? Feel gratitude as if it is already done. Ask: which old habit does this person no longer have? Rehearse one moment from today as that person.`;
const SESS={
m:()=>[
{t:'Box breathing',tr:'mind',min:5,type:'breath'},
{t:'Scripture & prayer',tr:'faith',min:4,type:'form',body:()=>`<blockquote>${esc(verse[2])}</blockquote>`,fields:[['mVerse','What is this saying to me today?',['Trust God with the outcome','Act in faith today','Renew one specific thought','Be a faithful steward']]]},
{t:'Future-self meditation',tr:'mind',min:12,type:'med',text:MED_M,over:()=>S.profile.goal||'My future self'},
{t:'Affirmations',tr:'mind',min:3,type:'aff'},
{t:'Intention & money moves',tr:'money',min:5,type:'form',fields:[['intent','Today I am…',['calm and decisive','bold','generous','focused on value']],['a1','Money action 1',['Reach out to one potential client','Ship one thing','Learn a money skill for 30 min','Review spending']],['a2','Money action 2',['Follow up on a lead','Improve my offer','Read about investing']],['a3','Money action 3',['Save or invest a set amount','Cut one expense','Ask for a referral']]]},
{t:'Body',tr:'body',min:3,type:'check'},
{t:'How do you feel?',min:0,type:'mood'}],
e:()=>[
{t:'Review the day',tr:'money',min:5,type:'review'},
{t:'Belief rewrite',tr:'mind',min:4,type:'form',fields:[['oldB','Old belief that showed up',['Money is hard to get','People like me don\'t get rich','There is never enough','I must work harder, not smarter']],['newB','New belief I choose',['Money flows to me through value I create','I learn fast and adapt','There is more than enough','I build leverage and systems']]]},
{t:'Gratitude',tr:'faith',min:3,type:'form',fields:[['grat','Three things I am grateful for',['My health','My family','A lesson today','A small win','God\'s provision']]]},
{t:'Prayer',tr:'faith',min:3,type:'med',text:()=>'"Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." Philippians 4:6 (KJV). Write your prayer intention, then pray quietly.',field:['prayer','My prayer intention',['Wisdom for tomorrow','Provision and generosity','Peace for my family','Guidance in my work']],over:()=>D().prayer||'Thank you.'},
{t:'Wind-down meditation',tr:'mind',min:8,type:'med',text:()=>'Lie down. Breathe out longer than in. Release the day part by part, from feet to head. Hand your worries to God for the night (Matthew 6:34). Fall asleep as your future self.',over:()=>'Rest. Release. Receive.'},
{t:'How do you feel?',min:0,type:'mood'}]};
const sumMin=st=>st.reduce((a,s)=>a+s.min,0);
// ===== Streaks (gentle: one grace day per 7 days) =====
const done=d=>d&&(d.mDone||d.eDone);
function streak(pred=done){let cur=0,lg=-99,t=new Date();for(let i=0;i<3000;i++){if(pred(S.days[key(t)]))cur++;else if(i===0);else if(i-lg>=7)lg=i;else break;t.setDate(t.getDate()-1)}return cur}
function longest(pred=done){const ks=Object.keys(S.days).sort();if(!ks.length)return 0;let t=new Date(ks[0]+'T12:00'),run=0,best=0,lg=-99,i=0;const end=today();while(key(t)<=end){if(pred(S.days[key(t)])){run++;best=Math.max(best,run)}else if(key(t)!==end){if(run>0&&i-lg>=7)lg=i;else run=0}t.setDate(t.getDate()+1);i++}return best}
const trackP=tr=>d=>d?.tracks?.includes(tr);
// ===== Router =====
let view='today';
function go(v){view=v;stopT();if(!S.profile?.onboarded)return onboard(0);if(S.settings.pin&&!sessionStorage.unl)return lock();
 document.body.className=new Date().getHours()<17?'morning':'evening';$('#nav').style.display='';
 app.innerHTML=`<div class="fade">${V[v]()}</div>`;scrollTo(0,0);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v))}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
function lock(){$('#nav').style.display='none';app.innerHTML=`<div class="fade" style="text-align:center;margin-top:30vh"><h1>Welcome back</h1><input id="pin" type="password" inputmode="numeric" placeholder="PIN" style="max-width:200px;text-align:center"><br><button onclick="if($('#pin').value===S.settings.pin){sessionStorage.unl=1;go('today')}else{$('#pin').value='';vib(200)}">Unlock</button><p class="muted">Light lock only: it keeps casual eyes out, not a security feature.</p></div>`}
// ===== Today =====
const V={};
V.today=()=>{const k=new Date().getHours()<17?'m':'e',d=D(),st=SESS[k](),steps=d.steps||{},left=st.reduce((a,s,i)=>a+(steps[k+i]?0:s.min),0),isDone=d[k+'Done'],o=k=='m'?'e':'m';
 const backup=Object.keys(S.days).length>2&&(!S.lastExport||Date.now()-S.lastExport>7*864e5)?`<div class="banner">💾 It's been a while since your last backup. Your data lives only on this phone.<br><button onclick="exportData()">Back up now</button></div>`:'';
 return `${backup}<p class="muted">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})} · 🔥 ${streak()} day streak</p>
<div class="card hero"><h1>${k=='m'?'☀️ Morning session':'🌙 Evening session'}</h1><p class="muted">${isDone?'Completed today. Beautiful work.':`${left} min left · ${st.length} steps`}</p>
${st.map((s,i)=>`<label class="row ${steps[k+i]?'done':''}"><input type="checkbox" ${steps[k+i]?'checked':''} onchange="tick('${k}',${i},this.checked)">${esc(s.t)}<span class="r">${s.min?s.min+' min':''}</span></label>`).join('')}
<button class="big" style="margin-top:14px" onclick="play('${k}')">${isDone?'Do it again':'Start '+(k=='m'?'Morning':'Evening')}</button></div>
<button class="ghost" onclick="play('${o}')">Open ${o=='m'?'morning':'evening'} session instead ${d[o+'Done']?'✓':''}</button>
<div class="card"><div class="muted">Lesson of the day · ${esc(lesson[0])}</div><h2>${esc(lesson[1])}</h2><p>${esc(lesson[2])}</p></div>
<div class="card"><div class="muted">Scripture of the day</div><h2>${esc(verse[1])}</h2><blockquote>${esc(verse[2])}</blockquote></div>
<p class="muted">Other teachers' ideas are paraphrased; scripture is quoted from the public-domain KJV. They're separate traditions and aren't presented as making the same claims. For growth and reflection only, with no health or wealth guarantees. Check with a doctor before fasting, cold exposure or new exercise.</p>`};
function tick(k,i,v){const d=D();(d.steps??={})[k+i]=v;save();const st=SESS[k]();if(st.every((s,j)=>d.steps[k+j])&&!d[k+'Done'])finish(k);else go('today')}
V.lessons=()=>`<h1>Lessons</h1><p class="muted">${L.length} cards. Teachers' ideas are paraphrased; scripture is KJV.</p><div>${['All','Faith','Mind','Body','Money'].map(f=>`<span class="chip ${LF==f?'on':''}" onclick="LF='${f}';go('lessons')">${f}</span>`).join('')}</div>`+
 L.filter(l=>LF=='All'||(LF=='Faith'?/KJV|Jesus/.test(l[0]):LF=='Mind'?/Lipton|Dispenza|Habits|Oprah|Dalio|Blakely/.test(l[0]):LF=='Body'?/Sinclair/.test(l[0]):/Buffett|Munger|Naval|Bezos|Musk|Carnegie/.test(l[0]))).map(l=>`<div class="card"><div class="muted">${esc(l[0])}</div><h2>${esc(l[1])}</h2><p>${esc(l[2])}</p></div>`).join('');
let LF='All';
// ===== Player =====
let PL=null;
function play(k,i){const d=D(),st=SESS[k](),steps=d.steps||{};if(i==null){i=st.findIndex((s,j)=>!steps[k+j]);if(i<0)i=0}PL={k,i,st};let el=$('#player');if(!el){el=document.createElement('div');el.id='player';document.body.appendChild(el)}renderStep()}
function renderStep(){stopT();const {k,i,st}=PL,s=st[i],el=$('#player'),d=D();el.className=k;
 let h=`<div style="display:flex;justify-content:space-between" class="muted"><span>Step ${i+1} of ${st.length}${s.tr?' · '+s.tr:''}</span><span onclick="closeP()" style="cursor:pointer">✕ Close</span></div><div class="bar"><i style="width:${(i+1)/st.length*100}%"></i></div><h1>${esc(s.t)}</h1>`;
 if(s.type=='breath')h+=`<p class="muted">Box breathing: in 4 · hold 4 · out 4 · hold 4. Relax shoulders and jaw.</p><div class="bc" id="bc"></div><div class="cue" id="cue">Ready</div>${ring(s.min)}<button class="big" onclick="startBreath(${s.min})">Begin</button>${soundTog()}`;
 if(s.type=='form')h+=(s.body?s.body():'')+s.fields.map(f=>field(...f)).join('');
 if(s.type=='med')h+=`<div id="medtxt"><p>${esc(s.text())}</p>${s.field?field(...s.field):''}</div><div class="ovtext" id="ov" style="display:none"></div>${ring(s.min)}<button class="big" id="medb" onclick="startMed()">Begin ${s.min} min</button>${soundTog()}`;
 if(s.type=='aff')h+=affBlock();
 if(s.type=='check'){const mine=S.profile.habits||[];h+=`<p class="muted">★ = habits you committed to</p>`+[...mine,...HABITS.filter(x=>!mine.includes(x))].map(x=>`<label class="row"><input type="checkbox" ${d.body?.[x]?'checked':''} onchange="(D().body??={})['${esc(x)}']=this.checked;save()">${mine.includes(x)?'★ ':''}${esc(x)}</label>`).join('')}
 if(s.type=='review')h+=[1,2,3].map(n=>d['a'+n]?`<label class="row"><input type="checkbox" ${d['a'+n+'ok']?'checked':''} onchange="D()['a${n}ok']=this.checked;save()">${esc(d['a'+n])}</label>`:'').join('')+(d.a1||d.a2||d.a3?`<p class="muted">Each completed money action credits ${money(S.settings.credit)} to your Mental Bank.</p>`:'<p class="muted">No money actions set this morning. Note what you did instead.</p>')+field('review','What went well? What would I do differently?',['I kept my word to myself','I procrastinated on…','I created value by…','Tomorrow I will…'])+field('money','What did I learn about money today?',[])+`<label class="row"><input type="checkbox" ${d.gave?'checked':''} onchange="D().gave=this.checked;save()">I gave or helped someone today</label>`;
 if(s.type=='mood'){const mk=k+'Mood';h+=`<p>Slide to how you feel right now.</p><div style="font-size:60px;text-align:center" id="mo">${MOODS[(d[mk]||3)-1]}</div><input type="range" min="1" max="5" value="${d[mk]||3}" oninput="D()['${mk}']=+this.value;$('#mo').textContent=MOODS[this.value-1];save()">`}
 h+=`<div class="navb">${i>0?'<button class="ghost" onclick="nav(-1)">Back</button>':''}<button onclick="nav(1)" id="next">${i==st.length-1?'Finish ✓':'Next'}</button></div>`;
 el.innerHTML=`<div class="fade">${h}</div>`;el.scrollTop=0}
const soundTog=()=>`<p class="muted"><label style="display:inline"><input type="checkbox" ${S.settings.chime?'checked':''} onchange="S.settings.chime=this.checked;save()">Soft chime</label> &nbsp; <label style="display:inline"><input type="checkbox" ${S.settings.bells?'checked':''} onchange="S.settings.bells=this.checked;save()">Start/end bells</label></p>`;
function field(k,lab,chips){return `<label>${esc(lab)}<textarea rows="2" data-k="${k}" oninput="D()['${k}']=this.value;save()">${esc(D()[k])}</textarea></label><div>${(chips||[]).map(c=>`<span class="chip" onclick="chip('${k}',this)">${esc(c)}</span>`).join('')}</div>`}
function chip(k,el){const t=document.querySelector(`[data-k="${k}"]`);t.value=(t.value?t.value.replace(/\s*$/,'')+(t.value.match(/[,.;]$/)?' ':', '):'')+el.textContent;D()[k]=t.value;save();el.classList.add('on')}
function nav(n){const s=PL.st[PL.i];if(n>0){(D().steps??={})[PL.k+PL.i]=true;if(s.type=='aff')markAff();save()}if(PL.i+n>=PL.st.length)return finish(PL.k);PL.i=Math.max(0,PL.i+n);renderStep()}
function closeP(){stopT();$('#player')?.remove();PL=null;go(view)}
// ===== Timers =====
let RT=null;
function stopT(){if(RT){clearInterval(RT.iv);RT.stop?.();RT=null}}
const ring=m=>`<div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="rb"/><circle cx="60" cy="60" r="54" class="rf" id="rf" stroke-dasharray="339.3" stroke-dashoffset="0"/></svg><div class="rt" id="rt">${m}:00</div></div>`;
function startT(min,o={}){stopT();const tot=min*60,t0=Date.now(),sp=FAST?60:1;if(S.settings.bells)bell();RT={stop:o.stop};RT.iv=setInterval(()=>{const el=Math.min(tot,(Date.now()-t0)/1000*sp),left=tot-el;$('#rt')&&($('#rt').textContent=fmt(left));$('#rf')?.setAttribute('stroke-dashoffset',339.3*el/tot);o.tick?.(el);if(left<=0){const end=o.end;stopT();if(S.settings.bells)bell();vib([200,100,200]);end?.()}},250)}
function startBreath(min){const cues=['Breathe in','Hold','Breathe out','Hold'],fr=[440,494,392,349];let ph=-1;
 startT(min,{tick:el=>{const p=Math.floor(el/(FAST?240:4))%4;if(p!==ph){ph=p;$('#cue').textContent=cues[p];$('#bc').classList.toggle('in',p<2);if(S.settings.chime)tone(fr[p],1.2,.04);vib(40)}},end:()=>{$('#cue').textContent='Well done ✓';$('#bc').classList.remove('in')}})}
function startMed(){const s=PL.st[PL.i],el=$('#player');el.classList.add('imm');$('#medtxt').style.display='none';$('#ov').style.display='';$('#ov').textContent=s.over();$('#medb').textContent='End early';$('#medb').onclick=()=>{stopT();endMed()};
 startT(s.min,{end:endMed})}
function endMed(){$('#player')?.classList.remove('imm');if($('#medb')){$('#medb').textContent='Done ✓ · tap Next';$('#medb').onclick=null}}
// ===== Affirmations: voice, loop, feed, 21-day set =====
function markAff(){if(!S.affDays.includes(today()))S.affDays.push(today());save()}
const affCount=()=>{const n=S.affDays.length;return{day:n?((n-1)%21)+1:0,sets:Math.floor(n/21)}};
function affBlock(){const c=affCount();return `<p class="muted">21-day set: day ${c.day} of 21${c.sets?` · ${c.sets} set(s) completed`:''}</p>${affirm().map(a=>`<blockquote>${esc(a)}</blockquote>`).join('')}
<button onclick="feed()">Full-screen feed</button><button class="ghost" id="recb" onclick="rec()">🎙 Record my voice</button><button class="ghost" onclick="loopPlay(3)">▶ Play my voice loop (3 min)</button><button class="ghost" onclick="editAff()">Edit</button><div id="affst" class="muted"></div><div class="ringwrap"></div>`}
function feed(){markAff();const f=document.createElement('div');f.className='feed';f.innerHTML=affirm().map(a=>`<div>${esc(a)}</div>`).join('')+`<div>Swipe complete ✓<br><small style="font-size:16px">Read each one slowly, out loud, and feel it.</small></div>`;const x=document.createElement('button');x.className='x';x.textContent='✕';x.onclick=()=>{f.remove();x.remove()};document.body.append(f,x)}
let MR;async function rec(){const st=$('#affst');if(MR&&MR.state=='recording'){MR.stop();return}
 try{const s=await navigator.mediaDevices.getUserMedia({audio:true});const ch=[];MR=new MediaRecorder(s);MR.ondataavailable=e=>ch.push(e.data);MR.onstop=async()=>{s.getTracks().forEach(t=>t.stop());await idbPut('aff',new Blob(ch,{type:MR.mimeType}));st.textContent='Saved your voice recording ✓';$('#recb').textContent='🎙 Re-record'};MR.start();st.textContent='Recording… read your affirmations slowly, then tap Stop.';$('#recb').textContent='⏹ Stop'}catch(e){st.textContent='Microphone not available: '+e.message}}
async function loopPlay(min){const st=$('#affst'),b=await idbGet('aff');if(!b){st.textContent='Record your voice first.';return}markAff();const a=new Audio(URL.createObjectURL(b));a.loop=true;a.play();const stopAmb=ambient();
 $('.ringwrap').innerHTML=ring(min)+'<button class="ghost" onclick="stopT()">Stop</button>';startT(min,{stop:()=>{a.pause();stopAmb();st.textContent='Loop finished ✓'}})}
function editAff(){const r=prompt('Edit affirmations (separate with |)',affirm().join(' | '));if(r!=null){S.profile.affirmations=r.split('|').map(s=>s.trim()).filter(Boolean);save();PL?renderStep():go(view)}}
// ===== Finish & celebration =====
function finish(k){stopT();const d=D(),st=SESS[k]();let credit=0;
 if(!d[k+'Done']){d[k+'Done']=true;d.min=(d.min||0)+sumMin(st);d.tracks=[...new Set([...(d.tracks||[]),...st.map(s=>s.tr).filter(Boolean)])];
  if(k=='e'&&!d.credited){const n=[1,2,3].filter(i=>d['a'+i+'ok']).length+(d.oldB&&d.newB?1:0);credit=n*S.settings.credit;if(credit){const bal=(S.bank.at(-1)?.bal||0)+credit;S.bank.push({date:today(),amt:credit,bal})}d.credited=true}}
 (d.steps??={});st.forEach((s,i)=>d.steps[k+i]=true);save();$('#player')?.remove();PL=null;
 const c=document.createElement('div');c.className='over cele';c.innerHTML=`<div class="fade"><div style="font-size:72px">${k=='m'?'☀️':'🌙'}</div><h1>${k=='m'?'Morning complete':'Evening complete'}</h1><p>🔥 ${streak()} day streak · ${d.min} min today</p>${credit?`<p>Mental Bank +${money(credit)}</p>`:''}<p class="muted">${k=='m'?'Go live today as your future self.':'Rest well. Tomorrow you start again, renewed.'}</p><button class="big" onclick="this.closest('.over').remove();go('today')">Continue</button></div>`;document.body.appendChild(c);
 if(S.settings.bells)bell();vib([100,50,100]);for(let i=0;i<40;i++){const p=document.createElement('i');p.className='spark';p.style.left=Math.random()*100+'vw';p.style.top=-Math.random()*30+'vh';p.style.animationDelay=Math.random()+'s';c.appendChild(p)}}
// ===== Journal =====
const ENTRY=[['intent','Intention'],['a1','Money action'],['a2','Money action'],['a3','Money action'],['mVerse','Scripture reflection'],['review','Review'],['money','Money lesson'],['grat','Gratitude'],['prayer','Prayer']];
function entryHTML(k,d){return `<div class="card"><b>${k}</b> ${d.mDone?'☀️':''}${d.eDone?'🌙':''} ${d.mMood?MOODS[d.mMood-1]:''}${d.eMood?MOODS[d.eMood-1]:''}${ENTRY.filter(([f])=>d[f]).map(([f,l])=>`<p><span class="muted">${l}:</span> ${esc(d[f])}${d[f+'ok']?' ✓':''}</p>`).join('')}${d.oldB?`<p><span class="muted">Belief:</span> <s>${esc(d.oldB)}</s> → ${esc(d.newB)}</p>`:''}</div>`}
V.journal=()=>{const ks=Object.keys(S.days).sort().reverse().filter(k=>ENTRY.some(([f])=>S.days[k][f])||S.days[k].oldB);const t=new Date(),md=today().slice(5);
 const otd=ks.filter(k=>k!==today()&&(k.slice(5)==md||[7,30,90,365].some(n=>{const x=new Date();x.setDate(t.getDate()-n);return key(x)==k})));
 return `<h1>Journal</h1>${otd.length?`<h3>On this day</h3>${otd.map(k=>entryHTML(k,S.days[k])).join('')}<h3>Timeline</h3>`:''}${ks.map(k=>entryHTML(k,S.days[k])).join('')||'<p class="muted">Your entries will appear here after your first session.</p>'}`};
// ===== Me: progress, bank, ledger, settings =====
function heat(){const t=new Date();t.setDate(t.getDate()-34);let h='';for(let i=0;i<35;i++){const d=S.days[key(t)]||{},n=(d.mDone?1:0)+(d.eDone?1:0);h+=`<div class="h${n}" title="${key(t)}">${d.mDone?'☀️':''}${d.eDone?'🌙':''}</div>`;t.setDate(t.getDate()+1)}return `<div class="heat">${h}</div>`}
function chart(){const b=S.bank;if(!b.length)return '<p class="muted">Complete evening reviews to grow your Mental Bank.</p>';const mx=Math.max(...b.map(x=>x.bal)),pts=[{bal:0},...b].map((x,i,a)=>`${i/(a.length-1||1)*300},${100-x.bal/mx*90}`).join(' ');return `<svg viewBox="0 0 300 105" style="width:100%"><polyline points="${pts}" fill="none" stroke="#d4af37" stroke-width="2.5"/></svg>`}
V.me=()=>{const tot=Object.values(S.days).reduce((a,d)=>a+(d.min||0),0),c=affCount(),ledger=Object.entries(S.days).filter(([,d])=>d.oldB).sort();const st=S.settings;
 return `<h1>${esc(S.profile.name||'Me')}</h1><div class="card"><div class="muted">Goal</div><h3>${esc(S.profile.goal)}</h3><div class="muted">Target: ${esc(S.profile.net)}</div></div>
<div class="card"><h2>Progress</h2><div class="stat"><div><b>${streak()}</b>current streak</div><div><b>${longest()}</b>longest streak</div><div><b>${tot}</b>total minutes</div><div><b>${Object.values(S.days).filter(done).length}</b>days practiced</div></div>
<p class="muted">Gentle streaks: one missed day per week is forgiven automatically.</p><div class="stat">${['mind','body','faith','money'].map(tr=>`<div><b>${streak(trackP(tr))}</b>${tr} streak</div>`).join('')}</div><h3>Last 5 weeks</h3>${heat()}</div>
<div class="card"><h2>Mental Bank</h2><p>Balance: <b style="color:var(--g)">${money(S.bank.at(-1)?.bal||0)}</b></p>${chart()}<label>Credit per completed action / belief rewrite<input type="number" value="${st.credit}" onchange="S.settings.credit=+this.value||0;save()"></label><p class="muted">A visualization tool, not real money.</p></div>
<div class="card"><h2>Belief ledger</h2>${ledger.map(([k,d])=>`<p><span class="muted">${k}</span><br><s>${esc(d.oldB)}</s> → <b>${esc(d.newB)}</b></p>`).join('')||'<p class="muted">Your belief rewrites will build up here.</p>'}</div>
<div class="card"><h2>Affirmations</h2><p class="muted">21-day set: day ${c.day} of 21 · ${c.sets} set(s) complete</p>${affBlock()}</div>
<div class="card"><h2>Reminders</h2><label>Morning<input type="time" value="${st.morning}" onchange="S.settings.morning=this.value;save()"></label><label>Evening<input type="time" value="${st.evening}" onchange="S.settings.evening=this.value;save()"></label>
<button onclick="ics()">📅 Add daily alarms to calendar (.ics)</button><button class="ghost" onclick="notif()">🔔 Enable notifications</button><p class="muted">The calendar file is the most reliable alarm. App notifications only fire while the app is open or running in the background (iPhone: after you add it to the Home Screen).</p></div>
<div class="card"><h2>Settings</h2>${soundTog()}<label class="row"><input type="checkbox" ${st.vib?'checked':''} onchange="S.settings.vib=this.checked;save()">Vibration</label>
<label>PIN lock (light lock; leave blank to turn off)<input type="password" inputmode="numeric" maxlength="8" value="${esc(st.pin)}" onchange="S.settings.pin=this.value;save()"></label></div>
<div class="card"><h2>Backup</h2><p class="muted">Last backup: ${S.lastExport?new Date(S.lastExport).toLocaleDateString():'never'}. Voice recordings are not included.</p><button onclick="exportData()">Export JSON</button><button class="ghost" onclick="$('#imp').click()">Import</button><input id="imp" type="file" accept="application/json" style="display:none" onchange="importData(this.files[0])"></div>
<button class="ghost" onclick="S.profile.onboarded=false;save();go('today')">Redo onboarding</button>
<p class="muted">For growth and reflection only. Not medical, financial, or religious authority advice; no guaranteed outcomes. Check with a doctor before fasting, cold exposure or new exercise.</p>`};
function exportData(){S.lastExport=Date.now();save();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='mindset-backup-'+today()+'.json';a.click();go(view)}
function importData(f){if(!f)return;f.text().then(t=>{const o=JSON.parse(t);if(!o.days)throw 0;if(confirm('Replace data on this phone with this backup?')){localStorage.bmt=JSON.stringify(o);location.reload()}}).catch(()=>alert('That file is not a valid backup.'))}
function ics(){const st=S.settings,d=new Date();d.setDate(d.getDate()+1);const ds=key(d).replace(/-/g,''),ev=(id,t,name,dur)=>`BEGIN:VEVENT\r\nUID:bmt-${id}@mindset\r\nDTSTAMP:${ds}T000000Z\r\nDTSTART:${ds}T${t.replace(':','')}00\r\nDURATION:PT${dur}M\r\nRRULE:FREQ=DAILY\r\nSUMMARY:${name}\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${name}\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
 const s=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Mindset Training//EN\r\n${ev('m',st.morning,'☀️ Morning mindset session',35)}${ev('e',st.evening,'🌙 Evening mindset session',25)}END:VCALENDAR\r\n`;
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/calendar'}));a.download='mindset-reminders.ics';a.click()}
async function notif(){if(!('Notification' in window))return alert('Notifications are not supported here. Use the calendar file instead.');const p=await Notification.requestPermission();S.settings.notif=p=='granted';save();alert(p=='granted'?'Notifications on.':'Notifications were not allowed.')}
setInterval(async()=>{if(!S.settings.notif||Notification.permission!='granted')return;const n=new Date(),hm=n.toTimeString().slice(0,5),d=D();for(const [k,t,txt] of [['m',S.settings.morning,'Time for your morning session ☀️'],['e',S.settings.evening,'Time for your evening session 🌙']])if(hm==t&&!d[k+'Done']&&!d[k+'Notified']){d[k+'Notified']=1;save();(await navigator.serviceWorker?.ready)?.showNotification('Mindset Training',{body:txt,icon:'icon.svg'})}},30000);
// ===== Onboarding =====
let OB={};
function onboard(n){document.body.className='morning';$('#nav').style.display='none';const p=S.profile||{};OB={goal:p.goal||'',net:p.net||'',beliefs:p.beliefs||'',rank:p.rank||[],habits:p.habits||[],...OB};
 const scr=[
 ()=>`<h1>Welcome, Wook</h1><p>A daily training for mind, body, faith and money. About an hour a day, morning and evening.</p><label>Your big goal<textarea id="g">${esc(OB.goal)}</textarea></label><label>Target net worth<input id="n" value="${esc(OB.net)}" placeholder="$1,000,000,000"></label>`,
 ()=>`<h1>What matters most?</h1><p class="muted">Tap in order of priority.</p>${GOALS.map(g=>`<span class="chip ${OB.rank.includes(g)?'on':''}" onclick="rk('${g}')">${OB.rank.includes(g)?OB.rank.indexOf(g)+1+'. ':''}${g}</span>`).join('')}`,
 ()=>`<h1>Your money beliefs</h1><p class="muted">Be honest. We'll use these to aim your belief rewrites.</p><textarea id="b" rows="4">${esc(OB.beliefs)}</textarea>${['Money is hard to get','Rich people are greedy','I am bad with money','There is never enough','I don\'t deserve wealth'].map(c=>`<span class="chip" onclick="$('#b').value+=($('#b').value?', ':'')+this.textContent">${c}</span>`).join('')}`,
 ()=>`<h1>Commit to 3 habits</h1><p class="muted">Pick three body habits for your mornings (${OB.habits.length}/3).</p>${HABITS.map(h=>`<span class="chip ${OB.habits.includes(h)?'on':''}" onclick="hb('${h}')">${h}</span>`).join('')}`,
 ()=>`<h1>Your times</h1><label>Morning session<input type="time" id="tm" value="${S.settings.morning}"></label><label>Evening session<input type="time" id="te" value="${S.settings.evening}"></label><p class="muted">You can add calendar alarms from the Me tab.</p>`,
 ()=>`<h1>Your plan</h1><div class="card hero"><p>🎯 <b>${esc(OB.goal)}</b><br>💰 ${esc(OB.net)}</p><p>☀️ ${S.settings.morning}: breathwork, scripture, future-self meditation, affirmations, money moves, body (~35 min)</p><p>🌙 ${S.settings.evening}: review, belief rewrite, gratitude, prayer, wind-down (~25 min)</p><p>★ ${OB.habits.map(esc).join(' · ')||'Choose habits anytime'}</p><p>Priorities: ${OB.rank.join(' → ')||'—'}</p></div><p class="muted">For growth and reflection only, with no medical or financial guarantees. Check with a doctor before fasting, cold exposure or new exercise.</p>`];
 app.innerHTML=`<div class="fade"><div class="bar"><i style="width:${(n+1)/scr.length*100}%"></i></div>${scr[n]()}<div class="navb">${n?`<button class="ghost" onclick="obSave();onboard(${n-1})">Back</button>`:''}<button id="obn" onclick="obSave();${n<scr.length-1?`onboard(${n+1})`:'obDone()'}">${n<scr.length-1?'Next':'Begin my training'}</button></div></div>`;scrollTo(0,0)}
function obSave(){if($('#g'))OB.goal=$('#g').value;if($('#n'))OB.net=$('#n').value;if($('#b'))OB.beliefs=$('#b').value;if($('#tm')){S.settings.morning=$('#tm').value;S.settings.evening=$('#te').value;save()}}
function rk(g){OB.rank=OB.rank.includes(g)?OB.rank.filter(x=>x!=g):[...OB.rank,g];onboard(1)}
function hb(h){OB.habits=OB.habits.includes(h)?OB.habits.filter(x=>x!=h):[...OB.habits,h].slice(-3);onboard(3)}
function obDone(){S.profile={...(S.profile||{}),goal:OB.goal,net:OB.net,beliefs:OB.beliefs,rank:OB.rank,habits:OB.habits,onboarded:true};save();go('today')}
'serviceWorker' in navigator&&navigator.serviceWorker.register('sw.js');go('today');
