const S=JSON.parse(localStorage.bmt||'{"profile":null,"days":{}}');const save=()=>localStorage.bmt=JSON.stringify(S);
const today=()=>new Date().toLocaleDateString('en-CA');const D=()=>S.days[today()]??={};
const $=s=>document.querySelector(s),app=$('#app'),esc=s=>String(s??'').replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const P='Paraphrased idea from ',L=[
['Bruce Lipton','Beliefs shape biology',P+'Bruce Lipton: cells respond to their environment, and your perceptions and beliefs are part of that environment. Change the perception, change the signal.'],
['Bruce Lipton','The subconscious runs most of the day',P+'Bruce Lipton: much behavior runs on subconscious programs learned early in life. Repetition and habit are ways to rewrite them.'],
['Bruce Lipton','Programs from childhood',P+'Bruce Lipton: many money beliefs were absorbed before age seven. Name one you inherited, then question whether it is true.'],
['Bruce Lipton','Growth vs. protection',P+'Bruce Lipton: the body can lean toward growth or protection. Chronic fear pulls energy from growth and creativity.'],
['Bruce Lipton','Repetition rewires',P+'Bruce Lipton: the subconscious learns through repetition, like learning to drive. Daily affirmations work by repetition, not one-time insight.'],
['Joe Dispenza','Break the habit of being yourself',P+'Joe Dispenza: if you think the same thoughts, make the same choices and feel the same emotions daily, you keep recreating the same life.'],
['Joe Dispenza','Rehearse the future self',P+'Joe Dispenza: mentally rehearse who you want to become: how they think, act and feel, until it becomes familiar.'],
['Joe Dispenza','Feel it before it happens',P+'Joe Dispenza: pair a clear intention with an elevated emotion such as gratitude, as though the outcome were already real.'],
['Joe Dispenza','Neurons that fire together',P+'Joe Dispenza (drawing on Hebbian learning): repeated thought patterns become wired-in. Choose which ones you repeat.'],
['Joe Dispenza','Observe your automatic self',P+'Joe Dispenza: awareness comes first. Notice the moment you slip into the old self, and choose again.'],
['Joe Dispenza','Get beyond the body, environment, time',P+'Joe Dispenza: in meditation, let go of identity, surroundings and schedule so new possibilities can be imagined.'],
['David Sinclair','Mild stress, strong body',P+'David Sinclair: mild stresses like exercise, fasting windows and cold may activate the body\'s defense and repair pathways.'],
['David Sinclair','Eat less often',P+'David Sinclair: he has spoken about skipping meals or narrowing his eating window. Discuss fasting with a doctor first.'],
['David Sinclair','Move and sweat',P+'David Sinclair: regular exercise, including intense bursts, is one of the most reliable longevity habits.'],
['David Sinclair','Sleep is maintenance',P+'David Sinclair and many longevity researchers: consistent, good sleep supports repair. Protect your bedtime.'],
['David Sinclair','Plants and less sugar',P+'David Sinclair: he favors mostly plant-based eating and cutting sugar and processed foods.'],
['Warren Buffett','Compounding takes time',P+'Warren Buffett: wealth compounds like a snowball. You need wet snow and a very long hill. Start early, stay patient.'],
['Warren Buffett','Invest in yourself',P+'Warren Buffett: the best investment is in your own skills; nobody can tax or steal them.'],
['Warren Buffett','Circle of competence',P+'Warren Buffett: know the edges of what you truly understand, and stay inside them.'],
['Charlie Munger','Avoid stupidity',P+'Charlie Munger: much of success comes from consistently avoiding big mistakes, not from brilliance.'],
['Charlie Munger','Invert',P+'Charlie Munger: ask what would guarantee failure, then avoid those things.'],
['Naval Ravikant','Own equity',P+'Naval Ravikant: you will not get rich renting out your time. Own a piece of a business or build products.'],
['Naval Ravikant','Specific knowledge',P+'Naval Ravikant: build knowledge that feels like play to you but looks like work to others.'],
['Naval Ravikant','Leverage',P+'Naval Ravikant: code, media, capital and people multiply your effort.'],
['Jeff Bezos','Regret minimization',P+'Jeff Bezos: imagine yourself at 80. Which choice would you regret not making?'],
['Jeff Bezos','Day 1 thinking',P+'Jeff Bezos: keep a beginner\'s urgency and customer obsession, however far you get.'],
['Elon Musk','First principles',P+'Elon Musk: break problems down to fundamental truths and reason up from there instead of by analogy.'],
['Ray Dalio','Pain + reflection = progress',P+'Ray Dalio: mistakes, reflected on honestly, are the raw material of improvement.'],
['Sara Blakely','Redefine failure',P+'Sara Blakely: her father celebrated "what did you fail at this week?" Failure meant not trying.'],
['Oprah Winfrey','Gratitude multiplies',P+'Oprah Winfrey: she has long kept a gratitude journal and credits it with shifting her focus.'],
['Andrew Carnegie','Wealth as stewardship',P+'Andrew Carnegie: he argued that great wealth carries a duty to give it away well.'],
['Habits','1% better',P+'James Clear: small habits compound. Focus on systems and identity, not only goals.'],
['Jesus (KJV)','Renewing of the mind','"And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God." Romans 12:2 (KJV)'],
['Jesus (KJV)','All things are possible','"Jesus said unto him, If thou canst believe, all things are possible to him that believeth." Mark 9:23 (KJV)'],
['Jesus (KJV)','Ask, seek, knock','"Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you." Matthew 7:7 (KJV)'],
['Jesus (KJV)','Where your treasure is','"For where your treasure is, there will your heart be also." Matthew 6:21 (KJV)'],
['Jesus (KJV)','Do not worry about tomorrow','"Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof." Matthew 6:34 (KJV)'],
['Jesus (KJV)','Seek first','"But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." Matthew 6:33 (KJV)'],
['Jesus (KJV)','Parable of the talents','"Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things." Matthew 25:21 (KJV). Reflection: faithfulness with what you have now comes first.'],
['Jesus (KJV)','Give, and it shall be given','"Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over." Luke 6:38 (KJV)'],
['Jesus (KJV)','More blessed to give','"It is more blessed to give than to receive." Acts 20:35 (KJV, words of Jesus quoted by Paul)'],
['Scripture (KJV)','As he thinketh','"For as he thinketh in his heart, so is he." Proverbs 23:7 (KJV)'],
['Scripture (KJV)','Prayer over anxiety','"Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." Philippians 4:6 (KJV)'],
['Scripture (KJV)','What faith is','"Now faith is the substance of things hoped for, the evidence of things not seen." Hebrews 11:1 (KJV)'],
['Jesus (paraphrased)','Stewardship',"Paraphrased from Jesus' parables (Luke 16:10): whoever is faithful in little is faithful in much. Manage today's money with care."]];
const FAITH=L.filter(l=>/KJV|Jesus/.test(l[0])),dayN=Math.floor(Date.now()/864e5);
const lesson=L[dayN%L.length],verse=FAITH[dayN%FAITH.length];
function affirm(){const p=S.profile||{};return p.affirmations||[`I am becoming the person who reaches ${p.net||'my target net worth'}.`,`I am building: ${p.goal||'my big goal'}.`,'Money flows to me through value I create.','My thoughts and habits shape my life, and I choose them on purpose.','I am a faithful steward of what I have been given.'];}
let tmr;function timer(id,min){clearInterval(tmr);let s=min*60;const el=$('#'+id);tmr=setInterval(()=>{s--;el.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;if(s<=0){clearInterval(tmr);el.textContent='Done ✓';navigator.vibrate?.(300)}},1000)}
const T=(id,m)=>`<div class="timer" id="${id}">${m}:00</div><button onclick="timer('${id}',${m})">Start ${m} min</button>`;
const fld=(k,lab,rows=2)=>`<label>${lab}<textarea rows="${rows}" data-k="${k}">${esc(D()[k])}</textarea></label>`;
const chk=(k,lab)=>`<label><input type="checkbox" style="width:auto" data-c="${k}" ${D()[k]?'checked':''}> ${lab}</label>`;
const V={
onboard:()=>`<h1>Welcome, Wook</h1><div class="card"><label>Your big goal<textarea id="g"></textarea></label><label>Target net worth<input id="n" placeholder="$1,000,000,000"></label><label>Current beliefs about money (be honest)<textarea id="b"></textarea></label><button onclick="onb()">Begin</button></div><p class="muted">For growth and reflection only. Not medical, financial or religious authority advice; check with a doctor before fasting, cold exposure or new exercise.</p>`,
home:()=>{const d=D();return `<h1>Today</h1><div class="card"><b>Streak:</b> ${streak()} days<br>Morning ${d.mDone?'✓':'○'} · Evening ${d.eDone?'✓':'○'}</div>
<div class="card"><div class="muted">Lesson of the day · ${esc(lesson[0])}</div><h2>${esc(lesson[1])}</h2><p>${esc(lesson[2])}</p></div>
<div class="card"><div class="muted">Scripture of the day</div><h2>${esc(verse[1])}</h2><p>${esc(verse[2])}</p></div>
<div class="card"><b>Goal:</b> ${esc(S.profile.goal)}<br><b>Target:</b> ${esc(S.profile.net)}</div><p class="muted">Lessons from other teachers are paraphrased ideas; scripture is quoted from the public-domain KJV. They are separate traditions and are not presented as making the same claims. No guarantees of health or wealth outcomes.</p>`},
morning:()=>`<h1>Morning · ~35 min</h1>
<div class="card"><h2>1. Breathwork · 5 min</h2><p>Box breathing: in 4, hold 4, out 4, hold 4. Relax shoulders and jaw.</p>${T('t1',5)}</div>
<div class="card"><h2>2. Scripture & prayer · 5 min</h2><p>${esc(verse[2])}</p>${fld('mVerse','What is this saying to me today?')}</div>
<div class="card"><h2>3. Future-self meditation · 12 min</h2><p>Close your eyes. Let go of your body, your room and your schedule. Picture yourself 5 years ahead, having reached <i>${esc(S.profile.goal)}</i>. How do you wake up? How do you speak, decide, give, and treat people? Feel gratitude as if it is already done. Ask: which old habit does this person no longer have? Rehearse one moment from today as that person.</p>${T('t2',12)}</div>
<div class="card"><h2>4. Affirmations · 3 min</h2>${affirm().map(a=>`<p>• ${esc(a)}</p>`).join('')}<button class="ghost" onclick="editAff()">Edit affirmations</button></div>
<div class="card"><h2>5. Intention & money actions · 5 min</h2>${fld('intent','Today I am…',1)}${fld('a1','Money action 1',1)}${fld('a2','Money action 2',1)}${fld('a3','Money action 3',1)}</div>
<div class="card"><h2>6. Body</h2>${chk('move','Movement / exercise')}${chk('cold','Cold shower or cold exposure')}${chk('sun','Morning sunlight 10 min')}${chk('fast','Keeping my eating window')}${chk('water','Water first')}</div>
<button onclick="done('mDone')">Complete morning ✓</button>`,
evening:()=>{const d=D();return `<h1>Evening · ~25 min</h1>
<div class="card"><h2>1. Review</h2>${[1,2,3].map(i=>d['a'+i]?chk('a'+i+'ok','Done: '+esc(d['a'+i])):'').join('')}${fld('review','What went well? What would I do differently?',3)}</div>
<div class="card"><h2>2. Money reflection</h2>${fld('money','What value did I create? What did I learn about money today?')}</div>
<div class="card"><h2>3. Belief rewrite</h2>${fld('oldB','Old belief that showed up',1)}${fld('newB','New belief I choose',1)}</div>
<div class="card"><h2>4. Gratitude & prayer</h2>${fld('grat','Three things I am grateful for',3)}${fld('prayer','Prayer: thanks, requests, people to lift up',3)}${chk('gave','I gave or helped someone today (generosity)')}</div>
<div class="card"><h2>5. Wind-down meditation · 8 min</h2><p>Lie down. Breathe out longer than in. Release the day part by part, from feet to head. Hand your worries to God for the night (Matthew 6:34). Fall asleep as your future self.</p>${T('t3',8)}</div>
<button onclick="done('eDone')">Complete evening ✓</button>`},
lessons:()=>`<h1>Lessons (${L.length})</h1>`+L.map(l=>`<div class="card"><div class="muted">${esc(l[0])}</div><h2>${esc(l[1])}</h2><p>${esc(l[2])}</p></div>`).join(''),
progress:()=>`<h1>Progress</h1><div class="card">Current streak: <b>${streak()}</b> days · Days logged: ${Object.keys(S.days).length}</div><button onclick="exp()">Export JSON</button><button class="ghost" onclick="S.profile=null;save();go('onboard')">Redo onboarding</button>`+
Object.entries(S.days).sort().reverse().map(([k,d])=>`<div class="card"><b>${k}</b> ${d.mDone?'☀️':''}${d.eDone?'🌙':''}<p class="muted">${esc([d.intent,d.review,d.grat,d.oldB&&d.oldB+' → '+d.newB].filter(Boolean).join(' | '))}</p></div>`).join('')};
function streak(){let n=0,t=new Date();for(;;){const k=t.toLocaleDateString('en-CA'),d=S.days[k];if(d&&(d.mDone||d.eDone))n++;else if(n||k!==today())break;t.setDate(t.getDate()-1)}return n}
function go(v){if(!S.profile)v='onboard';app.innerHTML=V[v]();scrollTo(0,0);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v))}
function onb(){S.profile={goal:$('#g').value,net:$('#n').value,beliefs:$('#b').value};save();go('home')}
function editAff(){const r=prompt('One affirmation per line (separate with |)',affirm().join(' | '));if(r!=null){S.profile.affirmations=r.split('|').map(s=>s.trim()).filter(Boolean);save();go('morning')}}
function done(k){D()[k]=true;save();alert('Great work. Logged ✓');go('home')}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='mindset-'+today()+'.json';a.click()}
app.addEventListener('input',e=>{const k=e.target.dataset.k,c=e.target.dataset.c;if(k)D()[k]=e.target.value;if(c)D()[c]=e.target.checked;save()});
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
'serviceWorker' in navigator&&navigator.serviceWorker.register('sw.js');go('home');
