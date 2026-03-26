
// ================================================================
// STORAGE
// ================================================================
const SK='nika_v3_state',LK='nika_v3_labels',TK='nika_v3_theme';

function save(){try{localStorage.setItem(SK,JSON.stringify({tournaments:S.tournaments,players:S.players,registrations:S.registrations,matches:S.matches,drawState:S.drawState,evenList:S.evenList,evenPrize:S.evenPrize}));}catch(e){}}
function saveL(){try{localStorage.setItem(LK,JSON.stringify(S.labels));}catch(e){}}
function saveT(){try{localStorage.setItem(TK,JSON.stringify(S.theme));}catch(e){}}

function loadAll(){
  try{
    const r=localStorage.getItem(SK);
    if(r){const d=JSON.parse(r);if(d.tournaments&&d.tournaments.length>0){Object.assign(S,{tournaments:d.tournaments,players:d.players||[],registrations:d.registrations||[],matches:d.matches||[],drawState:d.drawState||{},evenList:d.evenList||[],evenPrize:d.evenPrize||{text:'Phần Thưởng Đặc Biệt',img:''}});return true;}}
  }catch(e){}
  return false;
}
function loadL(){try{const r=localStorage.getItem(LK);if(r)Object.assign(S.labels,JSON.parse(r));}catch(e){}}
function loadT(){try{const r=localStorage.getItem(TK);if(r)Object.assign(S.theme,JSON.parse(r));}catch(e){}}

// ================================================================
// STATE
// ================================================================
const S={
  tournaments:[],players:[],registrations:[],matches:[],
  currentTournamentId:null,currentAdminSection:'dashboard',
  avatarDataUrl:null,drawState:{},
  evenList:[],evenPrize:{text:'Phần Thưởng Đặc Biệt',img:''},
  labels:{
    logoBrand:'NIKA',logoSub:'Billiards Tournament',livePill:'TRỰC TIẾP',
    heroEyebrow:'Hệ Thống Quản Lý Giải Đấu Chuyên Nghiệp',heroBrand:'NIKA',
    heroSubtitle:'GIẢI ĐẤU BILLIARDS',
    heroDesc:'Nền tảng tổ chức giải đấu Bi-a chuyên nghiệp cho Carom 3 Băng và Pool. Bảng thi đấu LED thời gian thực, quản lý điểm số trực tuyến, chuyên nghiệp như giải vô địch quốc gia.',
    regTitle:'Đăng Ký Tham Dự',regSub:'Tham gia giải đấu – Thể hiện đẳng cấp của bạn',
  },
  theme:{gold:'#D4AF37',goldBright:'#FFD700',neonBlue:'#00D4FF',neonGreen:'#00FF88',red:'#FF3B5C',bg:'#080C14',text:'#E2E8F0'},
};

// ================================================================
// SEED
// ================================================================
function seedData(){
  const names=['Nguyễn Văn An','Trần Minh Đức','Lê Hoàng Nam','Phạm Quốc Bảo','Hoàng Thế Vinh','Đỗ Mạnh Tuấn','Vũ Thanh Long','Đặng Xuân Hùng','Bùi Công Thành','Ngô Đức Hải','Lý Văn Minh','Trương Quốc Thái','Đinh Anh Khoa','Cao Văn Phúc','Lâm Thành Tùng','Đào Minh Quân'];
  const skills=['A','A','A','B','B','B','B','C','C','C'];
  names.forEach((n,i)=>S.players.push({id:i+1,name:n,skill:skills[i%skills.length],phone:`09${String(Math.floor(10000000+Math.random()*89999999))}`,avatar:null,status:'approved'}));
  const ts=[
    {id:1,name:'Giải Carom Mùa Xuân 2025',discipline:'Carom 3 Băng',format:'Loại Trực Tiếp',status:'live',date:'2025-04-15',location:'CLB Bi-a Hà Nội',maxPlayers:16,winPoints:15,smartDraw:true,playerIds:[],createdAt:new Date().toISOString()},
    {id:2,name:'Pool Mở Rộng Mùa Hè',discipline:'Pool',format:'Loại Trực Tiếp',status:'open',date:'2025-06-01',location:'Trung tâm Cue Sports HCM',maxPlayers:8,winPoints:7,smartDraw:true,playerIds:[],createdAt:new Date().toISOString()},
  ];
  S.tournaments=ts;
  const sh=arr=>[...arr].sort(()=>Math.random()-0.5);
  S.tournaments[0].playerIds=sh(S.players).slice(0,16).map(p=>p.id);
  S.tournaments[1].playerIds=sh(S.players).slice(0,8).map(p=>p.id);
  generateBracket(S.tournaments[0],S.tournaments[0].playerIds.map(id=>getP(id)).filter(Boolean),true);
  generateBracket(S.tournaments[1],S.tournaments[1].playerIds.map(id=>getP(id)).filter(Boolean),false);
  S.registrations=names.slice(0,4).map((n,i)=>({id:i+100,playerId:i+1,tournamentId:2,status:'pending'}));
  // seed even list
  S.evenList=[
    {id:1,name:'Nguyễn Văn An',lucky:7},{id:2,name:'Trần Minh Đức',lucky:13},
    {id:3,name:'Lê Hoàng Nam',lucky:88},{id:4,name:'Phạm Quốc Bảo',lucky:22},
    {id:5,name:'Hoàng Thế Vinh',lucky:99},
  ];
  save();
}

// ================================================================
// BRACKET
// ================================================================
function generateBracket(tournament,players,smart){
  const n=players.length;if(n<2)return;
  const rounds=Math.ceil(Math.log2(n)),sz=Math.pow(2,rounds);
  let seeded=[...players];
  if(smart){const t=seeded.filter(p=>p.skill==='A').sort(()=>Math.random()-0.5),r=seeded.filter(p=>p.skill!=='A').sort(()=>Math.random()-0.5);seeded=[];const l=Math.max(t.length,r.length);for(let i=0;i<l;i++){if(t[i])seeded.push(t[i]);if(r[i])seeded.push(r[i]);}}
  else seeded.sort(()=>Math.random()-0.5);
  while(seeded.length<sz)seeded.push(null);
  const ms=[];let mid=S.matches.length+1;const r1=[];
  for(let i=0;i<sz;i+=2){
    const m={id:mid++,tournamentId:tournament.id,round:1,matchNum:r1.length+1,p1:seeded[i]?seeded[i].id:null,p2:seeded[i+1]?seeded[i+1].id:null,score1:0,score2:0,winnerId:null,nextMatchId:null,status:'pending',livestream:null};
    if(!seeded[i]&&seeded[i+1]){m.winnerId=seeded[i+1].id;m.status='done';}
    if(seeded[i]&&!seeded[i+1]){m.winnerId=seeded[i].id;m.status='done';}
    r1.push(m);ms.push(m);
  }
  let prev=r1;
  for(let r=2;r<=rounds;r++){
    const cur=[];
    for(let i=0;i<prev.length;i+=2){
      const m={id:mid++,tournamentId:tournament.id,round:r,matchNum:cur.length+1,p1:null,p2:null,score1:0,score2:0,winnerId:null,nextMatchId:null,status:'pending',livestream:null};
      prev[i].nextMatchId=m.id;if(prev[i+1])prev[i+1].nextMatchId=m.id;
      cur.push(m);ms.push(m);
    }
    prev=cur;
  }
  if(tournament.status!=='open')simResults(ms,tournament);
  S.matches.push(...ms);tournament.matchIds=ms.map(m=>m.id);tournament.rounds=rounds;
}

function simResults(ms,t){
  const rounds=Math.max(...ms.map(m=>m.round)),mx=t.status==='live'?Math.ceil(rounds/2):rounds-1;
  for(let r=1;r<=mx;r++){
    ms.filter(m=>m.round===r).forEach(m=>{
      if(m.status==='done')return;const pl=[m.p1,m.p2].filter(Boolean);if(pl.length<2)return;
      const w=pl[Math.floor(Math.random()*2)];m.winnerId=w;m.score1=w===m.p1?15:Math.floor(Math.random()*13);m.score2=w===m.p2?15:Math.floor(Math.random()*13);m.status='done';
      if(m.nextMatchId){const nx=ms.find(x=>x.id===m.nextMatchId);if(nx){if(!nx.p1)nx.p1=w;else nx.p2=w;if(nx.p1&&nx.p2)nx.status=r<mx?'done':(t.status==='live'?'live':'pending');}}
    });
  }
}

// ================================================================
// HELPERS
// ================================================================
function getP(id){return S.players.find(p=>p.id===id);}
function getT(id){return S.tournaments.find(t=>t.id===id);}
function getTMs(tId){return S.matches.filter(m=>m.tournamentId===tId);}
function initials(name){return name?name.split(' ').slice(-2).map(w=>w[0]).join('').toUpperCase():'?';}
function skillBadge(s){return `<span class="skill-badge-mini skill-${s||'C'}">${s||'C'}</span>`;}
function nextId(){return Date.now()+Math.floor(Math.random()*1000);}
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function showToast(msg,type='info'){
  const c=document.getElementById('toast-container'),t=document.createElement('div');
  t.className=`toast toast-${type}`;t.textContent=msg;c.appendChild(t);setTimeout(()=>t.remove(),3100);
}

function closeModal(id){document.getElementById(id)?.classList.add('hidden');}

function openGenericModal(title,html,wide=false){
  const el=document.getElementById('genericModal');
  el.querySelector('.modal').className='modal'+(wide?' modal-wide':'');
  document.getElementById('genericModalTitle').textContent=title;
  document.getElementById('genericModalBody').innerHTML=html;
  el.classList.remove('hidden');
}

// ================================================================
// NAVIGATE
// ================================================================
function navigate(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+page)?.classList.add('active');
  document.getElementById('nav-'+page)?.classList.add('active');
  if(page==='tournaments')renderTournaments();
  if(page==='home')updateHeroStats();
  if(page==='admin')renderAdmin();
  if(page==='register')populateRegT();
  if(page==='draw')initDrawPage();
  if(page==='even'){renderEvenList();renderEvenSpin();}
  window.scrollTo(0,0);
}

function switchTab(tab){
  ['bracket','matches','players','standings'].forEach(t=>{document.getElementById('tab-'+t).style.display=t===tab?'block':'none';});
  document.querySelectorAll('#detail-tabs .tab-btn').forEach((b,i)=>{b.classList.toggle('active',['bracket','matches','players','standings'][i]===tab);});
  if(tab==='bracket')renderBracket(S.currentTournamentId);
  if(tab==='matches')renderMatchesTab(S.currentTournamentId);
  if(tab==='players')renderPlayersTab(S.currentTournamentId);
  if(tab==='standings')renderStandingsTab(S.currentTournamentId);
}

function updateHeroStats(){
  animCount('stat-tournaments',S.tournaments.length);
  animCount('stat-players',S.players.length);
  animCount('stat-matches',S.matches.filter(m=>m.status==='done').length);
  animCount('stat-live',S.tournaments.filter(t=>t.status==='live').length);
}

function animCount(id,target){
  const el=document.getElementById(id);if(!el)return;
  let cur=0;const step=Math.max(1,Math.ceil(target/25));
  const iv=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(iv);},38);
}

function populateRegT(){
  const s=document.getElementById('reg-tournament');
  s.innerHTML='<option value="">Chọn giải đấu</option>';
  S.tournaments.filter(t=>t.status==='open').forEach(t=>s.innerHTML+=`<option value="${t.id}">${t.name}</option>`);
}

// ================================================================
// TOURNAMENTS
// ================================================================
function renderTournaments(){
  const grid=document.getElementById('tournament-grid');
  const disc=document.getElementById('filter-discipline').value,st=document.getElementById('filter-status').value;
  let list=S.tournaments;
  if(disc)list=list.filter(t=>t.discipline===disc);
  if(st)list=list.filter(t=>t.status===st);
  grid.innerHTML=list.map(t=>{
    const played=getTMs(t.id).filter(m=>m.status==='done').length,total=getTMs(t.id).length;
    const sl=t.status==='live'?'🔴 ĐANG DIỄN RA':t.status==='open'?'MỞ ĐĂNG KÝ':'ĐÃ KẾT THÚC';
    return `<div class="t-card" onclick="openTournament(${t.id})">
      <div class="t-card-header"><span class="discipline-badge ${t.discipline==='Pool'?'disc-pool':'disc-carom'}">${t.discipline}</span><span class="status-badge status-${t.status}">${sl}</span></div>
      <div class="t-card-name">${t.name}</div>
      <div class="t-card-meta"><div class="meta-item">👥 ${t.playerIds.length}/${t.maxPlayers}</div><div class="meta-item">📍 ${t.location}</div><div class="meta-item">📅 ${t.date}</div></div>
      ${total>0?`<div class="progress-bar"><div class="progress-fill" style="width:${Math.round(played/total*100)}%"></div></div>`:''}
    </div>`;
  }).join('');
  if(!list.length)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:4rem;font-weight:700;">KHÔNG TÌM THẤY GIẢI ĐẤU</div>';
}

function openTournament(id){
  S.currentTournamentId=id;navigate('detail');
  const t=getT(id),champ=getChampion(id);
  const sl=t.status==='live'?'🔴 ĐANG DIỄN RA':t.status==='open'?'MỞ ĐĂNG KÝ':'ĐÃ KẾT THÚC';
  document.getElementById('detail-header').innerHTML=`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
      <div><div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.45rem;"><span class="discipline-badge ${t.discipline==='Pool'?'disc-pool':'disc-carom'}">${t.discipline}</span><span class="status-badge status-${t.status}">${sl}</span></div>
      <h1 style="font-size:1.4rem;font-weight:900;color:var(--gold);margin-bottom:0.35rem;">${t.name}</h1>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.75rem;color:var(--text-dim);font-weight:500;"><span>📍 ${t.location}</span><span>📅 ${t.date}</span><span>👥 ${t.playerIds.length} VĐV</span></div></div>
      ${champ?`<div style="text-align:center;padding:0.65rem 1.1rem;background:rgba(212,175,55,0.05);border:1px solid var(--border);border-radius:var(--radius-lg);"><div style="font-size:1.2rem;">👑</div><div style="font-size:0.58rem;font-weight:700;letter-spacing:0.18em;color:var(--gold);">VÔ ĐỊCH</div><div style="font-size:0.88rem;font-weight:900;color:var(--gold-bright);">${champ.name}</div></div>`:''}
    </div>`;
  switchTab('bracket');
}

function getChampion(tId){const t=getT(tId);if(!t||t.status!=='done')return null;const ms=getTMs(tId),fm=ms.filter(m=>m.round===t.rounds).find(m=>m.status==='done');return fm&&fm.winnerId?getP(fm.winnerId):null;}

// ================================================================
// BRACKET RENDER
// ================================================================
function renderBracket(tId){
  const c=document.getElementById('bracket-view'),t=getT(tId);if(!t)return;
  const ms=getTMs(tId),rounds=t.rounds||0,by={};
  for(let r=1;r<=rounds;r++)by[r]=ms.filter(m=>m.round===r);
  const champ=getChampion(tId);let html='';
  if(champ)html+=`<div class="champion-card"><div style="font-size:2rem;margin-bottom:0.35rem;">👑</div><div style="font-size:0.62rem;font-weight:700;letter-spacing:0.2em;color:var(--gold);margin-bottom:0.6rem;">VÔ ĐỊCH</div><div class="champion-name">${champ.name}</div></div>`;
  if(!rounds){html+='<div style="text-align:center;padding:4rem;color:var(--text-dim);font-weight:600;">Giải đấu chưa bắt đầu</div>';c.innerHTML=html;return;}
  html+='<div class="bracket-wrap">';
  for(let r=1;r<=rounds;r++){
    const iF=r===rounds,iS=r===rounds-1;
    const rl=iF?'CHUNG KẾT':iS?'BÁN KẾT':r===rounds-2?'TỨ KẾT':`VÒNG ${r}`;
    const rc=iF?'round-final':iS?'round-semi':`round-${r-1}`;
    html+=`<div class="bracket-round ${rc}"><div class="round-label ${rc}">${rl}</div>`;
    (by[r]||[]).forEach(m=>{html+=renderMCard(m,iF);});
    html+='</div>';
    if(r<rounds)html+='<div class="bracket-sep"></div>';
  }
  html+='</div>';c.innerHTML=html;
}

function renderMCard(m,iF){
  const p1=m.p1?getP(m.p1):null,p2=m.p2?getP(m.p2):null,hw=!!m.winnerId,live=m.status==='live';
  const cc=['match-card',hw?'has-winner':'',live?'match-live':'',iF?'match-final':''].filter(Boolean).join(' ');
  const rp=(p,sc,iw)=>p?`<div class="player-row ${iw?'winner':''}"><div class="avatar-mini">${p.avatar?`<img src="${p.avatar}">`:''}${!p.avatar?initials(p.name):''}</div><span class="player-name ${iw?'winner-name':''}">${p.name}</span>${skillBadge(p.skill)}<span class="player-score ${iw?'winner-score':''}">${sc}</span></div>`:`<div class="player-row" style="opacity:0.3;"><div class="avatar-mini" style="font-size:0.5rem;color:var(--text-dim);">BYE</div><span class="player-name" style="color:var(--text-dim);font-size:0.7rem;">— Miễn —</span></div>`;
  return `<div class="${cc}" onclick="openMatchScore(${m.id})"><div class="match-number"><span>Trận ${m.matchNum}</span>${live?'<div class="live-dot"></div>':''}</div>${rp(p1,m.score1,m.winnerId===m.p1)}<div style="height:1px;background:rgba(255,255,255,0.04);"></div>${rp(p2,m.score2,m.winnerId===m.p2)}</div>`;
}

// ================================================================
// MATCHES / PLAYERS / STANDINGS TABS
// ================================================================
function renderMatchesTab(tId){
  const c=document.getElementById('tab-matches'),t=getT(tId),ms=getTMs(tId),rounds=t.rounds||0;
  let html='';
  for(let r=1;r<=rounds;r++){
    const rm=ms.filter(m=>m.round===r),iF=r===rounds,rl=iF?'CHUNG KẾT':r===rounds-1?'BÁN KẾT':r===rounds-2?'TỨ KẾT':`VÒNG ${r}`;
    html+=`<div style="margin-bottom:1.75rem;"><div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;color:${iF?'var(--gold)':'var(--neon-blue)'};text-transform:uppercase;margin-bottom:0.75rem;padding-bottom:0.4rem;border-bottom:1px solid var(--border);">${rl}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.6rem;">`;
    rm.forEach(m=>{
      const p1=m.p1?getP(m.p1):null,p2=m.p2?getP(m.p2):null,sl=m.status==='done'?'XONG':m.status==='live'?'TRỰC TIẾP':'CHỜ';
      html+=`<div class="match-card" onclick="openMatchScore(${m.id})" style="padding-bottom:0.35rem;"><div class="match-number"><span>Trận ${m.matchNum}</span><span class="status-badge status-${m.status==='done'?'done':m.status==='live'?'live':'open'}" style="font-size:0.55rem;">${sl}</span></div>
      ${p1?`<div class="player-row ${m.winnerId===m.p1?'winner':''}"><div class="avatar-mini">${initials(p1.name)}</div><span class="player-name ${m.winnerId===m.p1?'winner-name':''}">${p1.name}</span><span class="player-score ${m.winnerId===m.p1?'winner-score':''}">${m.score1}</span></div>`:'<div style="padding:0.4rem 0.6rem;font-size:0.7rem;color:var(--text-dim);">Chờ xác định</div>'}
      ${p2?`<div class="player-row ${m.winnerId===m.p2?'winner':''}"><div class="avatar-mini">${initials(p2.name)}</div><span class="player-name ${m.winnerId===m.p2?'winner-name':''}">${p2.name}</span><span class="player-score ${m.winnerId===m.p2?'winner-score':''}">${m.score2}</span></div>`:'<div style="padding:0.4rem 0.6rem;font-size:0.7rem;color:var(--text-dim);">Chờ xác định</div>'}
      </div>`;
    });
    html+='</div></div>';
  }
  c.innerHTML=html||'<div style="text-align:center;padding:3rem;color:var(--text-dim);">Chưa có trận nào</div>';
}

function renderPlayersTab(tId){
  const c=document.getElementById('tab-players'),t=getT(tId),pl=t.playerIds.map(id=>getP(id)).filter(Boolean),ms=getTMs(tId);
  c.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0.6rem;">${pl.map(p=>{const w=ms.filter(m=>m.winnerId===p.id).length,l=ms.filter(m=>(m.p1===p.id||m.p2===p.id)&&m.winnerId&&m.winnerId!==p.id).length;return `<div class="player-item"><div class="player-avatar">${p.avatar?`<img src="${p.avatar}">`:''}${!p.avatar?initials(p.name):''}</div><div class="player-info"><div class="player-name-main">${p.name}</div><div class="player-sub">${skillBadge(p.skill)} &nbsp;T:${w} B:${l}</div></div></div>`;}).join('')}</div>`;
}

function renderStandingsTab(tId){
  const c=document.getElementById('tab-standings'),t=getT(tId),pl=t.playerIds.map(id=>getP(id)).filter(Boolean),ms=getTMs(tId);
  const st=pl.map(p=>{const w=ms.filter(m=>m.winnerId===p.id).length,l=ms.filter(m=>(m.p1===p.id||m.p2===p.id)&&m.winnerId&&m.winnerId!==p.id).length,pts=ms.filter(m=>m.p1===p.id||m.p2===p.id).reduce((s,m)=>s+(m.p1===p.id?m.score1:m.score2),0);return{...p,w,l,pts};}).sort((a,b)=>b.w-a.w||(b.pts-a.pts));
  c.innerHTML=`<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Vận Động Viên</th><th>Trình Độ</th><th>Thắng</th><th>Thua</th><th>Tổng Điểm</th></tr></thead><tbody>${st.map((p,i)=>`<tr><td style="font-family:var(--font-display);font-weight:700;color:${i===0?'var(--gold)':i===1?'#94a3b8':i===2?'#b45309':'var(--text-dim)'};">${['🥇','🥈','🥉'][i]||i+1}</td><td style="font-weight:700;">${p.name}</td><td>${skillBadge(p.skill)}</td><td style="color:var(--neon-green);font-weight:800;">${p.w}</td><td style="color:var(--red);">${p.l}</td><td style="font-family:var(--font-display);color:var(--gold);">${p.pts}</td></tr>`).join('')}</tbody></table></div>`;
}

// ================================================================
// SCORE MODAL
// ================================================================
function openMatchScore(mId){
  const m=S.matches.find(x=>x.id===mId);if(!m)return;
  const p1=m.p1?getP(m.p1):null,p2=m.p2?getP(m.p2):null;
  document.getElementById('scoreModalTitle').textContent=`TRẬN ${m.matchNum} — VÒNG ${m.round}`;
  document.getElementById('scoreModalBody').innerHTML=`
    <div class="score-display">
      <div class="score-side"><div class="score-player-name">${p1?p1.name:'Chờ'}</div><div class="score-number" id="sm-s1">${m.score1}</div><div class="score-controls"><button class="score-btn" onclick="adjSc(${mId},1,1)">+</button><button class="score-btn" onclick="adjSc(${mId},1,-1)" style="font-size:0.95rem;">−</button></div></div>
      <div class="score-vs">VS</div>
      <div class="score-side"><div class="score-player-name">${p2?p2.name:'Chờ'}</div><div class="score-number" id="sm-s2">${m.score2}</div><div class="score-controls"><button class="score-btn" onclick="adjSc(${mId},2,1)">+</button><button class="score-btn" onclick="adjSc(${mId},2,-1)" style="font-size:0.95rem;">−</button></div></div>
    </div>
    <div style="padding:0 0.15rem;">
      ${m.status==='done'?`<div style="text-align:center;margin-bottom:0.75rem;padding:0.5rem;background:rgba(212,175,55,0.05);border-radius:var(--radius);border:1px solid var(--border);font-size:0.78rem;font-weight:700;color:var(--gold);">🏆 NGƯỜI THẮNG: ${m.winnerId?getP(m.winnerId)?.name:'—'}</div>`:''}
      ${p1&&p2?`<div style="display:flex;gap:0.6rem;margin-bottom:0.75rem;"><button class="btn-ghost" style="flex:1;font-size:0.74rem;" onclick="setWinner(${mId},${m.p1})">✓ ${p1.name}</button><button class="btn-ghost" style="flex:1;font-size:0.74rem;" onclick="setWinner(${mId},${m.p2})">✓ ${p2.name}</button></div>`:''}
      <button class="btn-primary" style="width:100%;margin-bottom:0.4rem;" onclick="saveSc(${mId})">LƯU ĐIỂM SỐ</button>
      ${m.status==='done'?`<button class="btn-danger" style="width:100%;" onclick="resetMatch(${mId})">ĐẶT LẠI</button>`:''}
    </div>`;
  document.getElementById('scoreModal').classList.remove('hidden');
}

function adjSc(mId,pl,d){const m=S.matches.find(x=>x.id===mId);if(!m)return;if(pl===1){m.score1=Math.max(0,m.score1+d);document.getElementById('sm-s1').textContent=m.score1;}else{m.score2=Math.max(0,m.score2+d);document.getElementById('sm-s2').textContent=m.score2;}}

function setWinner(mId,wId){const m=S.matches.find(x=>x.id===mId);if(!m)return;m.winnerId=wId;m.status='done';advWinner(m);closeModal('scoreModal');showToast('Xác nhận người thắng!','success');save();refreshView();}

function saveSc(mId){
  const m=S.matches.find(x=>x.id===mId);if(!m)return;
  const t=getT(m.tournamentId),wp=t.winPoints;
  if(m.score1>=wp||m.score2>=wp){m.winnerId=m.score1>=wp?m.p1:m.p2;m.status='done';advWinner(m);showToast('Trận đấu kết thúc!','success');}
  else{m.status=m.p1&&m.p2?'live':'pending';showToast('Đã cập nhật điểm','info');}
  closeModal('scoreModal');save();refreshView();
}

function advWinner(m){if(!m.nextMatchId||!m.winnerId)return;const nx=S.matches.find(x=>x.id===m.nextMatchId);if(!nx)return;if(!nx.p1)nx.p1=m.winnerId;else if(!nx.p2)nx.p2=m.winnerId;if(nx.p1&&nx.p2)nx.status='live';}

function resetMatch(mId){
  const m=S.matches.find(x=>x.id===mId);if(!m)return;
  m.score1=0;m.score2=0;m.winnerId=null;m.status='pending';
  if(m.nextMatchId){const nx=S.matches.find(x=>x.id===m.nextMatchId);if(nx){if(nx.p1===m.p1||nx.p1===m.p2)nx.p1=null;if(nx.p2===m.p1||nx.p2===m.p2)nx.p2=null;nx.status='pending';}}
  closeModal('scoreModal');showToast('Đã đặt lại trận đấu','info');save();refreshView();
}

document.getElementById('scoreModal').addEventListener('click',e=>{if(e.target===document.getElementById('scoreModal'))closeModal('scoreModal');});
document.getElementById('genericModal').addEventListener('click',e=>{if(e.target===document.getElementById('genericModal'))closeModal('genericModal');});

function refreshView(){
  const ap=document.querySelector('.page.active')?.id;
  if(ap==='page-detail'){const at=document.querySelector('#detail-tabs .tab-btn.active')?.textContent||'';if(at.includes('Bảng'))renderBracket(S.currentTournamentId);else if(at.includes('Trận'))renderMatchesTab(S.currentTournamentId);else if(at.includes('Hạng'))renderStandingsTab(S.currentTournamentId);}
  if(ap==='page-admin')renderAdmin();
}

// ================================================================
// REGISTER
// ================================================================
function handleAvatarUpload(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{S.avatarDataUrl=ev.target.result;document.getElementById('avatarPreview').innerHTML=`<img src="${ev.target.result}">`};r.readAsDataURL(f);}

function submitRegistration(){
  const name=document.getElementById('reg-name').value.trim(),phone=document.getElementById('reg-phone').value.trim(),skill=document.getElementById('reg-skill').value,tId=parseInt(document.getElementById('reg-tournament').value),disc=document.getElementById('reg-discipline').value;
  if(!name||!phone||!skill){showToast('Vui lòng điền đầy đủ thông tin','error');return;}
  let p=S.players.find(p=>p.name.toLowerCase()===name.toLowerCase());
  if(!p){p={id:nextId(),name,phone,skill,discipline:disc,avatar:S.avatarDataUrl||null,status:'approved'};S.players.push(p);}
  if(tId){const t=getT(tId);if(t&&!t.playerIds.includes(p.id)){t.playerIds.push(p.id);S.registrations.push({id:nextId(),playerId:p.id,tournamentId:tId,status:'pending'});}}
  showToast(`Đăng ký thành công! Chào mừng, ${name}`,'success');
  document.getElementById('reg-name').value='';document.getElementById('reg-phone').value='';document.getElementById('reg-skill').value='';
  S.avatarDataUrl=null;document.getElementById('avatarPreview').innerHTML='<span style="font-size:1.3rem;color:var(--text-dim);">📷</span>';
  save();
}

// ================================================================
// ADMIN
// ================================================================
function adminNav(s){
  S.currentAdminSection=s;
  document.querySelectorAll('.sidebar-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('adm-'+s)?.classList.add('active');
  renderAdmin();
}

function renderAdmin(){
  const c=document.getElementById('admin-content');
  const map={dashboard:renderAdmDash,create:renderAdmCreate,'manage-tournaments':renderAdmManage,'players-admin':renderAdmPlayers,'matches-admin':renderAdmMatches,'even-admin':renderAdmEven,rankings:renderAdmRankings,customize:renderAdmCustomize};
  if(map[S.currentAdminSection])c.innerHTML=map[S.currentAdminSection]();
}

function renderAdmDash(){
  const played=S.matches.filter(m=>m.status==='done').length,pend=S.registrations.filter(r=>r.status==='pending').length;
  return `<div>
    <h2 class="section-title" style="margin-bottom:1.5rem;">BẢNG TỔNG QUAN</h2>
    <div class="stat-cards">
      <div class="stat-card gold-accent"><div class="stat-card-num">${S.tournaments.length}</div><div class="stat-card-label">Tổng Giải Đấu</div></div>
      <div class="stat-card red-accent"><div class="stat-card-num">${S.tournaments.filter(t=>t.status==='live').length}</div><div class="stat-card-label">Đang Diễn Ra</div></div>
      <div class="stat-card blue-accent"><div class="stat-card-num">${S.players.length}</div><div class="stat-card-label">Vận Động Viên</div></div>
      <div class="stat-card green-accent"><div class="stat-card-num">${played}</div><div class="stat-card-label">Trận Đã Đấu</div></div>
    </div>
    ${pend>0?`<div style="background:rgba(255,59,92,0.06);border:1px solid rgba(255,59,92,0.25);border-radius:var(--radius);padding:0.8rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.7rem;"><span>⚠️</span><div style="flex:1;"><div style="font-weight:800;color:var(--red);font-size:0.85rem;">${pend} Đơn Đăng Ký Chờ Duyệt</div></div><button class="btn-ghost btn-sm" onclick="adminNav('players-admin')">Xem →</button></div>`:''}
    <div style="background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.12);border-radius:var(--radius);padding:0.85rem 1rem;margin-bottom:1.5rem;">
      <div style="font-size:0.68rem;font-weight:700;color:var(--neon-blue);margin-bottom:0.35rem;letter-spacing:0.05em;">💾 TỰ ĐỘNG LƯU</div>
      <div style="font-size:0.78rem;color:var(--text-dim);">Mọi thao tác đều được lưu vào LocalStorage.</div>
      <button class="btn-secondary btn-sm" style="margin-top:0.55rem;" onclick="save();showToast('Đã lưu!','success')">💾 Lưu Ngay</button>
    </div>
    <h3 class="section-title" style="margin-bottom:0.85rem;font-size:0.9rem;">HOẠT ĐỘNG GẦN ĐÂY</h3>
    <div style="display:flex;flex-direction:column;gap:0.4rem;">
      ${S.matches.filter(m=>m.status==='done').slice(-5).reverse().map(m=>{const t=getT(m.tournamentId),w=m.winnerId?getP(m.winnerId):null;return `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.62rem 0.85rem;background:rgba(13,18,32,0.6);border:1px solid var(--border);border-radius:var(--radius);"><span>🏆</span><div style="flex:1;min-width:0;"><div style="font-size:0.8rem;font-weight:700;">${w?w.name:'—'} thắng</div><div style="font-size:0.68rem;color:var(--text-dim);">${t?t.name:''} — ${m.score1}–${m.score2}</div></div><span style="font-family:var(--font-mono);font-size:0.62rem;color:var(--gold);">V.${m.round}</span></div>`;}).join('')}
    </div>
  </div>`;
}

function renderAdmCreate(){
  return `<div><h2 class="section-title" style="margin-bottom:1.5rem;">TẠO GIẢI ĐẤU MỚI</h2>
  <div class="glass-panel" style="max-width:560px;">
    <div class="form-group"><label class="form-label">Tên Giải Đấu *</label><input type="text" class="form-input" id="ct-name" placeholder="Ví dụ: Giải Carom Mùa Xuân 2025"></div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Môn Thi Đấu</label><select class="form-select" id="ct-disc"><option value="Carom 3 Băng">Carom 3 Băng</option><option value="Pool">Pool</option></select></div>
      <div class="form-group"><label class="form-label">Thể Thức</label><select class="form-select" id="ct-fmt"><option>Loại Trực Tiếp</option><option>Loại Kép</option><option>Vòng Tròn</option></select></div>
    </div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Số VĐV Tối Đa</label><select class="form-select" id="ct-max"><option value="8">8</option><option value="16" selected>16</option><option value="32">32</option><option value="64">64</option></select></div>
      <div class="form-group"><label class="form-label">Điểm / Ván Thắng</label><input type="number" class="form-input" id="ct-wp" value="15" min="1"></div>
    </div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Ngày Thi Đấu</label><input type="date" class="form-input" id="ct-date"></div>
      <div class="form-group"><label class="form-label">Địa Điểm</label><input type="text" class="form-input" id="ct-loc" placeholder="Tên sân / địa chỉ"></div>
    </div>
    <div class="form-group" style="display:flex;align-items:center;gap:0.7rem;"><input type="checkbox" id="ct-smart" checked style="accent-color:var(--gold);width:15px;height:15px;"><label for="ct-smart" style="font-size:0.78rem;color:var(--text-dim);cursor:pointer;">Bốc thăm thông minh (tách VĐV hạng cao)</label></div>
    <button class="btn-primary" onclick="createTournament()">TẠO GIẢI ĐẤU</button>
  </div></div>`;
}

function createTournament(){
  const name=document.getElementById('ct-name')?.value.trim();if(!name){showToast('Vui lòng nhập tên giải đấu','error');return;}
  const t={id:nextId(),name,discipline:document.getElementById('ct-disc').value,format:document.getElementById('ct-fmt').value,status:'open',date:document.getElementById('ct-date').value||new Date().toISOString().slice(0,10),location:document.getElementById('ct-loc').value||'Chưa xác định',maxPlayers:parseInt(document.getElementById('ct-max').value),winPoints:parseInt(document.getElementById('ct-wp').value)||15,smartDraw:document.getElementById('ct-smart').checked,playerIds:[],matchIds:[],rounds:0,createdAt:new Date().toISOString()};
  S.tournaments.push(t);showToast(`Đã tạo "${name}"!`,'success');save();adminNav('manage-tournaments');
}

function renderAdmManage(){
  return `<div>
    <div class="section-header" style="margin-bottom:1.25rem;"><h2 class="section-title">QUẢN LÝ GIẢI ĐẤU</h2><button class="btn-primary btn-sm" onclick="adminNav('create')">+ Tạo Mới</button></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Tên Giải</th><th>Môn</th><th>Trạng Thái</th><th>VĐV</th><th>Trận</th><th>Thao Tác</th></tr></thead><tbody>
    ${S.tournaments.map(t=>{const pl=getTMs(t.id).filter(m=>m.status==='done').length,tot=getTMs(t.id).length,sl=t.status==='live'?'ĐANG DIỄN RA':t.status==='open'?'MỞ ĐĂNG KÝ':'KẾT THÚC';
    return `<tr><td style="font-weight:700;">${t.name}</td><td><span class="discipline-badge ${t.discipline==='Pool'?'disc-pool':'disc-carom'}">${t.discipline}</span></td><td><span class="status-badge status-${t.status}">${sl}</span></td><td>${t.playerIds.length}/${t.maxPlayers}</td><td style="font-family:var(--font-mono);font-size:0.75rem;">${pl}/${tot}</td>
    <td><div class="actions">
      <button class="btn-ghost btn-sm" onclick="openTournament(${t.id})">Xem</button>
      ${t.status==='open'?`<button class="btn-secondary btn-sm" onclick="navigate('draw')" style="font-size:0.68rem;">🎲 Bốc Thăm</button>`:''}
      ${t.status==='open'?`<button class="btn-green btn-sm" onclick="startTournament(${t.id})">Bắt Đầu</button>`:''}
      ${t.status==='live'?`<button class="btn-ghost btn-sm" onclick="finishTournament(${t.id})">Kết Thúc</button>`:''}
      <button class="btn-danger btn-sm" onclick="delTournament(${t.id})">Xóa</button>
    </div></td></tr>`;}).join('')}
    </tbody></table></div>
  </div>`;
}

function startTournament(tId){const t=getT(tId);if(!t)return;if(t.playerIds.length<2){showToast('Cần ít nhất 2 VĐV','error');return;}if(!t.matchIds||!t.matchIds.length){const pl=t.playerIds.map(id=>getP(id)).filter(Boolean);generateBracket(t,pl,t.smartDraw);}t.status='live';showToast(`Giải "${t.name}" đã bắt đầu!`,'success');save();renderAdmin();}
function finishTournament(tId){const t=getT(tId);if(t){t.status='done';showToast('Giải đấu đã kết thúc','info');save();renderAdmin();}}
function delTournament(tId){S.tournaments=S.tournaments.filter(t=>t.id!==tId);S.matches=S.matches.filter(m=>m.tournamentId!==tId);showToast('Đã xóa giải đấu','info');save();renderAdmin();}

function renderAdmPlayers(){
  const pend=S.registrations.filter(r=>r.status==='pending');
  return `<div>
    <div class="section-header" style="margin-bottom:1.25rem;"><h2 class="section-title">QUẢN LÝ VĐV</h2><div style="font-size:0.72rem;font-weight:600;color:var(--text-dim);">${S.players.length} vận động viên</div></div>
    ${pend.length>0?`<div style="margin-bottom:1.5rem;"><h3 style="font-size:0.74rem;font-weight:800;letter-spacing:0.06em;color:var(--red);margin-bottom:0.75rem;">⚠️ CHỜ PHÊ DUYỆT (${pend.length})</h3>${pend.map(r=>{const p=getP(r.playerId),t=getT(r.tournamentId);return p?`<div class="player-item" style="border-color:rgba(255,59,92,0.25);"><div class="player-avatar">${initials(p.name)}</div><div class="player-info"><div class="player-name-main">${p.name}</div><div class="player-sub">${skillBadge(p.skill)} • ${p.phone} • ${t?t.name:''}</div></div><div class="player-actions"><button class="btn-green btn-sm" onclick="approveReg(${r.id})">✓ Duyệt</button><button class="btn-danger btn-sm" onclick="rejectReg(${r.id})">✕ Từ Chối</button></div></div>`:'';}).join('')}</div>`:''}
    <h3 style="font-size:0.74rem;font-weight:800;letter-spacing:0.06em;color:var(--text-dim);margin-bottom:0.75rem;">TẤT CẢ VĐV</h3>
    ${S.players.map(p=>`<div class="player-item"><div class="player-avatar">${p.avatar?`<img src="${p.avatar}">`:''}${!p.avatar?initials(p.name):''}</div><div class="player-info"><div class="player-name-main">${p.name}</div><div class="player-sub">${skillBadge(p.skill)} • ${p.phone}</div></div><div class="player-actions"><button class="btn-ghost btn-sm" onclick="openEditPlayer(${p.id})">✏️ Sửa</button><button class="btn-purple btn-sm" onclick="openAssignPlayer(${p.id})">🏆 Gán Giải</button><button class="btn-danger btn-sm" onclick="delPlayer(${p.id})">Xóa</button></div></div>`).join('')}
  </div>`;
}

function approveReg(rId){const r=S.registrations.find(x=>x.id===rId);if(r){r.status='approved';showToast('Đã phê duyệt','success');save();renderAdmin();}}
function rejectReg(rId){S.registrations=S.registrations.filter(x=>x.id!==rId);showToast('Đã từ chối','info');save();renderAdmin();}
function delPlayer(pId){S.players=S.players.filter(p=>p.id!==pId);showToast('Đã xóa VĐV','info');save();renderAdmin();}

function openEditPlayer(pId){
  const p=getP(pId);if(!p)return;
  openGenericModal('✏️ SỬA THÔNG TIN VĐV',`
    <div class="form-group"><label class="form-label">Họ và Tên</label><input type="text" class="form-input" id="ep-name" value="${p.name}"></div>
    <div class="form-group"><label class="form-label">Số Điện Thoại</label><input type="text" class="form-input" id="ep-phone" value="${p.phone}"></div>
    <div class="form-group"><label class="form-label">Trình Độ</label><select class="form-select" id="ep-skill">${['A','B','C','D'].map(s=>`<option value="${s}" ${p.skill===s?'selected':''}>${s}</option>`).join('')}</select></div>
    <button class="btn-primary" style="width:100%;" onclick="saveEditPlayer(${pId})">LƯU THAY ĐỔI</button>`);
}

function saveEditPlayer(pId){
  const p=getP(pId);if(!p)return;
  p.name=document.getElementById('ep-name').value.trim()||p.name;
  p.phone=document.getElementById('ep-phone').value.trim()||p.phone;
  p.skill=document.getElementById('ep-skill').value||p.skill;
  closeModal('genericModal');showToast('Đã cập nhật VĐV','success');save();renderAdmin();
}

function openAssignPlayer(pId){
  const p=getP(pId);if(!p)return;
  const opts=S.tournaments.map(t=>{const has=t.playerIds.includes(pId);return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.65rem 0.85rem;background:rgba(255,255,255,0.02);border-radius:var(--radius);margin-bottom:0.4rem;border:1px solid ${has?'rgba(0,255,136,0.2)':'var(--border)'};">
    <div><div style="font-weight:700;font-size:0.85rem;">${t.name}</div><div style="font-size:0.68rem;color:var(--text-dim);">${t.discipline} • ${t.status==='open'?'Mở đăng ký':'Đã bắt đầu'}</div></div>
    ${has?`<button class="btn-danger btn-sm" onclick="removeFromTournament(${pId},${t.id})">Gỡ Bỏ</button>`:`<button class="btn-green btn-sm" onclick="addToTournament(${pId},${t.id})">Thêm Vào</button>`}
  </div>`;}).join('');
  openGenericModal(`🏆 GÁN "${p.name}" VÀO GIẢI ĐẤU`,opts||'<div style="color:var(--text-dim);text-align:center;padding:2rem;">Chưa có giải đấu nào</div>');
}

function addToTournament(pId,tId){
  const t=getT(tId);if(!t||t.playerIds.includes(pId))return;
  t.playerIds.push(pId);
  S.registrations.push({id:nextId(),playerId:pId,tournamentId:tId,status:'approved'});
  showToast('Đã thêm VĐV vào giải đấu','success');save();openAssignPlayer(pId);
}

function removeFromTournament(pId,tId){
  const t=getT(tId);if(!t)return;
  t.playerIds=t.playerIds.filter(id=>id!==pId);
  S.registrations=S.registrations.filter(r=>!(r.playerId===pId&&r.tournamentId===tId));
  showToast('Đã gỡ VĐV khỏi giải đấu','info');save();openAssignPlayer(pId);
}

function renderAdmMatches(){
  const lm=S.matches.filter(m=>m.status==='live'||m.status==='pending');
  return `<div><h2 class="section-title" style="margin-bottom:1.25rem;">CẬP NHẬT ĐIỂM SỐ</h2>
  <div style="display:flex;flex-direction:column;gap:0.45rem;">
    ${lm.length===0?'<div style="text-align:center;padding:3rem;color:var(--text-dim);font-weight:600;">Không có trận đang diễn ra</div>':''}
    ${lm.map(m=>{const t=getT(m.tournamentId),p1=m.p1?getP(m.p1):null,p2=m.p2?getP(m.p2):null;return `<div style="display:flex;align-items:center;gap:0.85rem;padding:0.8rem 0.95rem;background:rgba(13,18,32,0.8);border:1px solid ${m.status==='live'?'rgba(255,59,92,0.3)':'var(--border)'};border-radius:var(--radius);"><div style="flex:1;min-width:0;"><div style="font-size:0.68rem;color:var(--text-dim);margin-bottom:0.18rem;font-weight:600;">${t?t.name:''} — Vòng ${m.round}</div><div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;"><span style="font-weight:700;font-size:0.85rem;">${p1?p1.name:'Chờ'}</span><span style="font-family:var(--font-display);font-size:0.9rem;color:var(--gold);">${m.score1}–${m.score2}</span><span style="font-weight:700;font-size:0.85rem;">${p2?p2.name:'Chờ'}</span></div></div><span class="status-badge status-${m.status==='live'?'live':'open'}" style="font-size:0.58rem;">${m.status==='live'?'TRỰC TIẾP':'CHỜ'}</span><button class="btn-ghost btn-sm" onclick="openMatchScore(${m.id})">Cập Nhật</button></div>`;}).join('')}
  </div></div>`;
}

function renderAdmEven(){
  return `<div><h2 class="section-title" style="margin-bottom:1.25rem;">QUẢN LÝ EVENT</h2>
  <div class="glass-panel" style="max-width:600px;">
    <div class="form-group"><label class="form-label">Nội Dung Phần Thưởng</label><input type="text" class="form-input" id="ev-prize-text" value="${S.evenPrize.text}" placeholder="Ví dụ: Voucher 500k, iPhone 15..."></div>
    <div class="form-group"><label class="form-label">Hình Ảnh Phần Thưởng (URL hoặc Upload)</label>
      <input type="text" class="form-input" id="ev-prize-url" value="${S.evenPrize.img}" placeholder="https://... hoặc để trống" style="margin-bottom:0.4rem;">
      <input type="file" accept="image/*" onchange="handlePrizeImg(event)" style="font-size:0.78rem;color:var(--text-dim);">
    </div>
    ${S.evenPrize.img?`<img src="${S.evenPrize.img}" style="width:120px;height:120px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--border);margin-bottom:0.75rem;">`:''}
    <button class="btn-primary" onclick="savePrize()">💾 Lưu Phần Thưởng</button>
  </div></div>`;
}

function handlePrizeImg(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{S.evenPrize.img=ev.target.result;save();renderAdmin();};r.readAsDataURL(f);}
function savePrize(){S.evenPrize.text=document.getElementById('ev-prize-text').value||S.evenPrize.text;const url=document.getElementById('ev-prize-url').value;if(url)S.evenPrize.img=url;showToast('Đã lưu phần thưởng','success');save();renderAdmin();}

function renderAdmRankings(){
  const ps=S.players.map(p=>{const w=S.matches.filter(m=>m.winnerId===p.id).length,l=S.matches.filter(m=>(m.p1===p.id||m.p2===p.id)&&m.winnerId&&m.winnerId!==p.id).length,pts=S.matches.filter(m=>m.p1===p.id||m.p2===p.id).reduce((s,m)=>s+(m.p1===p.id?m.score1:m.score2),0),pl=w+l;return{...p,w,l,pl,pts,wr:pl?Math.round(w/pl*100):0};}).sort((a,b)=>b.w-a.w||(b.wr-a.wr));
  return `<div><h2 class="section-title" style="margin-bottom:1.25rem;">BẢNG XẾP HẠNG TOÀN CỤC</h2>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Vận Động Viên</th><th>Trình Độ</th><th>Đã Đấu</th><th>Thắng</th><th>Thua</th><th>Tỉ Lệ</th><th>Điểm</th></tr></thead><tbody>
  ${ps.map((p,i)=>`<tr><td style="font-family:var(--font-display);font-weight:700;color:${i===0?'var(--gold)':i===1?'#94a3b8':i===2?'#b45309':'var(--text-dim)'};">${['🥇','🥈','🥉'][i]||i+1}</td><td style="font-weight:700;">${p.name}</td><td>${skillBadge(p.skill)}</td><td style="color:var(--text-dim);">${p.pl}</td><td style="color:var(--neon-green);font-weight:800;">${p.w}</td><td style="color:var(--red);">${p.l}</td><td><div style="display:flex;align-items:center;gap:0.4rem;"><div style="width:50px;height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;"><div style="width:${p.wr}%;height:100%;background:${p.wr>=70?'var(--gold)':p.wr>=50?'var(--neon-blue)':'var(--text-dim)'};border-radius:2px;"></div></div><span style="font-family:var(--font-mono);font-size:0.68rem;">${p.wr}%</span></div></td><td style="font-family:var(--font-display);color:var(--gold);">${p.pts}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

// ================================================================
// CUSTOMIZE
// ================================================================
let custTab='labels';
function renderAdmCustomize(){
  return `<div><h2 class="section-title" style="margin-bottom:1.1rem;">🎨 TUỲ CHỈNH GIAO DIỆN</h2>
  <div class="cust-tabs">
    <button class="cust-tab ${custTab==='labels'?'active':''}" onclick="setCustTab('labels')">📝 Nhãn & Văn Bản</button>
    <button class="cust-tab ${custTab==='colors'?'active':''}" onclick="setCustTab('colors')">🎨 Màu Sắc</button>
    <button class="cust-tab ${custTab==='fonts'?'active':''}" onclick="setCustTab('fonts')">🔤 Font Chữ</button>
  </div>
  <div class="glass-panel">
    ${custTab==='labels'?renderLblEditor():''}${custTab==='colors'?renderColorEditor():''}${custTab==='fonts'?renderFontEditor():''}
  </div></div>`;
}

function setCustTab(t){custTab=t;renderAdmin();}

function renderLblEditor(){
  const defs=[{k:'logoBrand',l:'Logo — Tên thương hiệu'},{k:'logoSub',l:'Logo — Dòng phụ'},{k:'livePill',l:'Nav — Badge TRỰC TIẾP'},{k:'heroEyebrow',l:'Trang chủ — Dòng trên'},{k:'heroBrand',l:'Trang chủ — Tên lớn'},{k:'heroSubtitle',l:'Trang chủ — Phụ đề'},{k:'heroDesc',l:'Trang chủ — Mô tả'},{k:'regTitle',l:'Đăng ký — Tiêu đề'},{k:'regSub',l:'Đăng ký — Phụ đề'}];
  return `<h3 style="font-size:0.82rem;font-weight:800;color:var(--gold);margin-bottom:1.1rem;">Chỉnh Sửa Văn Bản Hiển Thị</h3>
  ${defs.map(d=>`<div class="label-row"><div class="lkey">${d.l}</div><input type="text" class="form-input" style="flex:1;" value="${S.labels[d.k]||''}" oninput="S.labels['${d.k}']=this.value"></div>`).join('')}
  <div style="display:flex;gap:0.7rem;margin-top:1.1rem;"><button class="btn-primary" onclick="applyLabels()">✅ Áp Dụng</button><button class="btn-ghost" onclick="resetLabels()">↺ Mặc Định</button></div>`;
}

function applyLabels(){
  const m=S.labels;
  [['lbl-logo-brand',m.logoBrand],['lbl-logo-sub',m.logoSub],['lbl-live-pill',m.livePill],['lbl-hero-eyebrow',m.heroEyebrow],['lbl-hero-brand',m.heroBrand],['lbl-hero-subtitle',m.heroSubtitle],['lbl-hero-desc',m.heroDesc],['lbl-reg-title',m.regTitle],['lbl-reg-sub',m.regSub]].forEach(([id,v])=>{const el=document.getElementById(id);if(el&&v!==undefined)el.textContent=v;});
  saveL();showToast('Đã áp dụng nhãn!','success');
}

function resetLabels(){S.labels={logoBrand:'NIKA',logoSub:'Billiards Tournament',livePill:'TRỰC TIẾP',heroEyebrow:'Hệ Thống Quản Lý Giải Đấu Chuyên Nghiệp',heroBrand:'NIKA',heroSubtitle:'GIẢI ĐẤU BILLIARDS',heroDesc:'Nền tảng tổ chức giải đấu Bi-a chuyên nghiệp.',regTitle:'Đăng Ký Tham Dự',regSub:'Tham gia giải đấu – Thể hiện đẳng cấp của bạn'};applyLabels();saveL();renderAdmin();showToast('Đã khôi phục mặc định','info');}

function renderColorEditor(){
  const defs=[{k:'gold',l:'Vàng chính',v:'--gold'},{k:'goldBright',l:'Vàng sáng',v:'--gold-bright'},{k:'neonBlue',l:'Xanh neon',v:'--neon-blue'},{k:'neonGreen',l:'Xanh lá neon',v:'--neon-green'},{k:'red',l:'Đỏ / Cảnh báo',v:'--red'},{k:'bg',l:'Nền trang',v:'--bg'},{k:'text',l:'Văn bản',v:'--text'}];
  return `<h3 style="font-size:0.82rem;font-weight:800;color:var(--gold);margin-bottom:1.1rem;">Tuỳ Chỉnh Bảng Màu</h3>
  ${defs.map(c=>`<div class="color-row"><label>${c.l}</label><div class="color-swatch" id="sw-${c.k}" style="background:${S.theme[c.k]};"></div><input type="color" value="${S.theme[c.k]}" oninput="updateColor('${c.k}','${c.v}',this.value)"></div>`).join('')}
  <div style="display:flex;gap:0.7rem;margin-top:1.1rem;"><button class="btn-primary" onclick="applyTheme()">✅ Áp Dụng</button><button class="btn-ghost" onclick="resetTheme()">↺ Mặc Định</button></div>`;
}

function updateColor(k,v,val){S.theme[k]=val;document.documentElement.style.setProperty(v,val);const sw=document.getElementById('sw-'+k);if(sw)sw.style.background=val;}
function applyTheme(){const m={gold:'--gold',goldBright:'--gold-bright',neonBlue:'--neon-blue',neonGreen:'--neon-green',red:'--red',bg:'--bg',text:'--text'};Object.entries(S.theme).forEach(([k,v])=>{if(m[k])document.documentElement.style.setProperty(m[k],v);});saveT();showToast('Đã áp dụng màu sắc!','success');}
function resetTheme(){S.theme={gold:'#D4AF37',goldBright:'#FFD700',neonBlue:'#00D4FF',neonGreen:'#00FF88',red:'#FF3B5C',bg:'#080C14',text:'#E2E8F0'};applyTheme();saveT();renderAdmin();showToast('Đã khôi phục màu mặc định','info');}

function renderFontEditor(){
  const fonts=[{n:'Be Vietnam Pro',v:"'Be Vietnam Pro',sans-serif"},{n:'Orbitron',v:"'Orbitron',sans-serif"},{n:'Inter',v:"Inter,sans-serif"},{n:'Roboto',v:"Roboto,sans-serif"},{n:'Montserrat',v:"Montserrat,sans-serif"},{n:'Poppins',v:"Poppins,sans-serif"},{n:'Share Tech Mono (Mono)',v:"'Share Tech Mono',monospace"}];
  return `<h3 style="font-size:0.82rem;font-weight:800;color:var(--gold);margin-bottom:1.1rem;">Tuỳ Chỉnh Font Chữ</h3>
  <div class="form-group"><label class="form-label">Font Chính</label><select class="form-select" id="fsel-main" onchange="prevFont('main',this.value)">${fonts.map(f=>`<option value="${f.v}">${f.n}</option>`).join('')}</select></div>
  <div class="form-group"><label class="form-label">Font Tiêu Đề</label><select class="form-select" id="fsel-disp" onchange="prevFont('disp',this.value)">${fonts.map(f=>`<option value="${f.v}">${f.n}</option>`).join('')}</select></div>
  <div style="padding:1rem;background:rgba(212,175,55,0.03);border:1px solid var(--border);border-radius:var(--radius);margin-top:0.25rem;">
    <div id="fprev-main" style="font-size:0.9rem;margin-bottom:0.35rem;">Văn bản chính: Chào mừng tới NIKA Billiards!</div>
    <div id="fprev-disp" style="font-size:1.4rem;font-weight:900;color:var(--gold);">NIKA BILLIARDS</div>
  </div>
  <div style="display:flex;gap:0.7rem;margin-top:1.1rem;"><button class="btn-primary" onclick="applyFonts()">✅ Áp Dụng</button><button class="btn-ghost" onclick="resetFonts()">↺ Mặc Định</button></div>`;
}

function prevFont(t,v){const el=document.getElementById(`fprev-${t}`);if(el)el.style.fontFamily=v;}
function applyFonts(){const m=document.getElementById('fsel-main'),d=document.getElementById('fsel-disp');if(m)document.documentElement.style.setProperty('--font-main',m.value);if(d)document.documentElement.style.setProperty('--font-display',d.value);showToast('Đã áp dụng font!','success');}
function resetFonts(){document.documentElement.style.setProperty('--font-main',"'Be Vietnam Pro',sans-serif");document.documentElement.style.setProperty('--font-display',"'Orbitron',sans-serif");showToast('Đã khôi phục font','info');}

// ================================================================
// EXPORT / IMPORT
// ================================================================
function exportData(){
  const d={...S.theme&&{theme:S.theme},labels:S.labels,tournaments:S.tournaments,players:S.players,registrations:S.registrations,matches:S.matches,drawState:S.drawState,evenList:S.evenList,evenPrize:S.evenPrize,exportedAt:new Date().toISOString(),version:'3.0'};
  const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`nika-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();showToast('Đã xuất dữ liệu!','success');
}
function importData(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d.tournaments){Object.assign(S,{tournaments:d.tournaments||[],players:d.players||[],registrations:d.registrations||[],matches:d.matches||[],drawState:d.drawState||{},evenList:d.evenList||[],evenPrize:d.evenPrize||S.evenPrize});if(d.labels)Object.assign(S.labels,d.labels);if(d.theme)Object.assign(S.theme,d.theme);save();saveL();saveT();applyLabels();applyTheme();renderAdmin();updateHeroStats();showToast('Nhập dữ liệu thành công!','success');}else showToast('File không hợp lệ!','error');}catch(err){showToast('Lỗi đọc file!','error');}};r.readAsText(f);e.target.value='';
}

// ================================================================
// BỐC THĂM
// ================================================================
let drawTimer=null,drawSpinning=false,curDrawTId=null;

function initDrawPage(){
  const sel=document.getElementById('draw-tournament-select');
  sel.innerHTML='<option value="">-- Chọn giải đấu --</option>';
  S.tournaments.forEach(t=>sel.innerHTML+=`<option value="${t.id}">${t.name} (${t.playerIds.length} VĐV)</option>`);
  document.getElementById('slot-machine').style.display='none';
  document.getElementById('drawn-results').style.display='none';
  document.getElementById('draw-pairs-section').style.display='none';
  document.getElementById('draw-players-count').textContent='';
}

function initDraw(){
  const tId=parseInt(document.getElementById('draw-tournament-select').value);
  if(!tId){document.getElementById('slot-machine').style.display='none';document.getElementById('drawn-results').style.display='none';document.getElementById('draw-pairs-section').style.display='none';return;}
  const t=getT(tId);if(!t)return;
  curDrawTId=tId;
  if(!S.drawState[tId]||S.drawState[tId].remaining===undefined){const all=[...t.playerIds];shuffleArr(all);S.drawState[tId]={drawn:[],remaining:all};}
  const ds=S.drawState[tId],total=ds.drawn.length+ds.remaining.length;
  document.getElementById('draw-players-count').innerHTML=`<span style="color:var(--gold);">🎱 ${total} vận động viên</span> — Đã bốc: <span style="color:var(--neon-green);">${ds.drawn.length}</span> / Còn lại: <span style="color:var(--neon-blue);">${ds.remaining.length}</span>`;
  document.getElementById('slot-machine').style.display='block';
  document.getElementById('drawn-results').style.display='block';
  updateDrawUI();save();
}

function updateDrawUI(){
  const tId=curDrawTId;if(!tId)return;
  const ds=S.drawState[tId];if(!ds)return;
  const total=ds.drawn.length+ds.remaining.length,done=ds.drawn.length;
  const pct=total?Math.round(done/total*100):0;
  document.getElementById('draw-prog-fill').style.width=pct+'%';
  document.getElementById('draw-prog-label').textContent=`${done} / ${total} đã bốc`;
  document.getElementById('draw-current-pos').textContent=done<total?`#${done+1}`:'✅';

  // drawn grid
  const grid=document.getElementById('drawn-grid');grid.innerHTML='';
  for(let i=0;i<total;i++){
    const div=document.createElement('div');div.className='drawn-slot'+(ds.drawn[i]?' filled':'');
    if(ds.drawn[i]){const p=getP(ds.drawn[i]);div.innerHTML=`<div class="drawn-pos">${i+1}</div><div class="drawn-info"><div class="drawn-name">${p?p.name:'?'}</div><div class="drawn-badge">${p?skillBadge(p.skill):''}</div></div>`;}
    else div.innerHTML=`<div class="drawn-pos" style="color:var(--text-dim);opacity:0.35;">${i+1}</div><div class="drawn-info"><div class="drawn-name" style="color:var(--text-dim);opacity:0.35;font-size:0.75rem;">Chưa bốc</div></div>`;
    grid.appendChild(div);
  }

  // actions
  const actDiv=document.getElementById('drawn-actions');
  actDiv.innerHTML='';
  if(done>0&&done>=total){
    const badge=document.createElement('span');badge.className='status-badge status-open';badge.textContent='✅ HOÀN TẤT';actDiv.appendChild(badge);
    const btn=document.createElement('button');btn.className='btn-primary btn-sm';btn.textContent='🏁 Hoàn Tất & Tạo Lịch';btn.onclick=finalizeDraw;actDiv.appendChild(btn);
  }

  // match pairs section
  const t=getT(tId);
  if(ds.drawn.length>0){renderMatchPairs(ds.drawn,t);}

  const go=document.getElementById('btn-draw-go'),all=document.getElementById('btn-draw-all');
  if(go)go.disabled=ds.remaining.length===0;
  if(all)all.disabled=ds.remaining.length===0;
  if(ds.remaining.length===0){const el=document.getElementById('slot-name-display');if(el){el.textContent='🎉 BỐC THĂM HOÀN TẤT!';el.classList.remove('idle');}}
}

function renderMatchPairs(drawnIds,t){
  const sec=document.getElementById('draw-pairs-section');
  sec.style.display='block';
  const grid=document.getElementById('match-pairs-grid');
  grid.innerHTML='';
  const pairs=[];
  for(let i=0;i<drawnIds.length;i+=2){
    const p1=getP(drawnIds[i]),p2=drawnIds[i+1]?getP(drawnIds[i+1]):null;
    pairs.push({num:Math.floor(i/2)+1,pos1:i+1,p1,pos2:i+2,p2});
  }
  pairs.forEach(pair=>{
    const card=document.createElement('div');card.className='match-pair-card';
    card.innerHTML=`
      <div class="match-pair-header">TRẬN ${pair.num}</div>
      <div class="match-pair-player">
        <div class="match-pair-num">${pair.pos1}</div>
        <div class="player-avatar" style="width:28px;height:28px;font-size:0.65rem;border-width:1px;">${pair.p1?initials(pair.p1.name):'?'}</div>
        <div class="match-pair-name">${pair.p1?pair.p1.name:'Chưa xác định'}</div>
        ${pair.p1?skillBadge(pair.p1.skill):''}
      </div>
      <div class="match-pair-vs">VS</div>
      <div class="match-pair-player">
        <div class="match-pair-num">${pair.pos2}</div>
        <div class="player-avatar" style="width:28px;height:28px;font-size:0.65rem;border-width:1px;">${pair.p2?initials(pair.p2.name):'BYE'}</div>
        <div class="match-pair-name">${pair.p2?pair.p2.name:'— Miễn Đấu —'}</div>
        ${pair.p2?skillBadge(pair.p2.skill):''}
      </div>`;
    grid.appendChild(card);
  });
}

function finalizeDraw(){
  const tId=curDrawTId;if(!tId)return;
  const t=getT(tId),ds=S.drawState[tId];if(!t||!ds||ds.drawn.length===0)return;

  // Remove old matches for this tournament
  S.matches=S.matches.filter(m=>m.tournamentId!==tId);
  t.matchIds=[];t.rounds=0;

  // Generate bracket from draw order
  const players=ds.drawn.map(id=>getP(id)).filter(Boolean);
  generateBracketFromOrder(t,players);

  showToast(`Đã lưu lịch thi đấu cho "${t.name}"!`,'success');
  save();
  showToast('Chuyển đến trang giải đấu để xem lịch!','info');
  triggerFireworks(3500);
}

function generateBracketFromOrder(tournament,players){
  const n=players.length;if(n<2)return;
  const rounds=Math.ceil(Math.log2(n)),sz=Math.pow(2,rounds);
  const seeded=[...players];while(seeded.length<sz)seeded.push(null);
  const ms=[];let mid=S.matches.length+1;const r1=[];
  for(let i=0;i<sz;i+=2){
    const m={id:mid++,tournamentId:tournament.id,round:1,matchNum:r1.length+1,p1:seeded[i]?seeded[i].id:null,p2:seeded[i+1]?seeded[i+1].id:null,score1:0,score2:0,winnerId:null,nextMatchId:null,status:'pending',livestream:null};
    if(!seeded[i]&&seeded[i+1]){m.winnerId=seeded[i+1].id;m.status='done';}
    if(seeded[i]&&!seeded[i+1]){m.winnerId=seeded[i].id;m.status='done';}
    r1.push(m);ms.push(m);
  }
  let prev=r1;
  for(let r=2;r<=rounds;r++){
    const cur=[];
    for(let i=0;i<prev.length;i+=2){
      const m={id:mid++,tournamentId:tournament.id,round:r,matchNum:cur.length+1,p1:null,p2:null,score1:0,score2:0,winnerId:null,nextMatchId:null,status:'pending',livestream:null};
      prev[i].nextMatchId=m.id;if(prev[i+1])prev[i+1].nextMatchId=m.id;
      cur.push(m);ms.push(m);
    }
    prev=cur;
  }
  S.matches.push(...ms);tournament.matchIds=ms.map(m=>m.id);tournament.rounds=rounds;
}

function doDraw(){
  if(drawSpinning)return;
  const tId=curDrawTId,ds=S.drawState[tId];
  if(!ds||ds.remaining.length===0)return;
  drawSpinning=true;
  const go=document.getElementById('btn-draw-go');if(go)go.disabled=true;
  playSpinSound();
  const reel=document.getElementById('slot-name-display');
  reel.classList.remove('idle');
  const names=ds.remaining.map(id=>{const p=getP(id);return p?p.name:'?';});
  let cnt=0,total=28+Math.floor(Math.random()*12),interval=35;
  function step(){
    reel.textContent=names[Math.floor(Math.random()*names.length)];
    cnt++;
    if(cnt>total*0.65)interval=Math.min(interval*1.14,200);
    if(cnt>=total){
      const idx=Math.floor(Math.random()*ds.remaining.length);
      const wId=ds.remaining.splice(idx,1)[0];
      ds.drawn.push(wId);
      const w=getP(wId);
      reel.textContent=w?w.name:'?';
      reel.style.color='var(--gold-bright)';reel.style.textShadow='0 0 25px rgba(212,175,55,0.9)';
      setTimeout(()=>{reel.style.color='';reel.style.textShadow='';drawSpinning=false;playRevealSound();triggerFireworks(2800);updateDrawUI();save();},550);
    }else drawTimer=setTimeout(step,interval);
  }
  step();
}

function drawAll(){
  if(drawSpinning)return;
  const tId=curDrawTId,ds=S.drawState[tId];
  if(!ds||ds.remaining.length===0)return;
  shuffleArr(ds.remaining);
  while(ds.remaining.length>0)ds.drawn.push(ds.remaining.shift());
  updateDrawUI();save();playRevealSound();triggerFireworks(4500);showToast('Đã bốc thăm tất cả!','success');
}

function resetDraw(){
  const tId=curDrawTId;if(!tId)return;
  clearTimeout(drawTimer);drawSpinning=false;
  const t=getT(tId);if(!t)return;
  const all=[...t.playerIds];shuffleArr(all);
  S.drawState[tId]={drawn:[],remaining:all};
  const el=document.getElementById('slot-name-display');if(el){el.textContent='Nhấn BỐC THĂM để bắt đầu';el.classList.add('idle');}
  document.getElementById('draw-pairs-section').style.display='none';
  updateDrawUI();save();showToast('Đã đặt lại bốc thăm','info');
}

// ================================================================
// EVEN — DANH SÁCH
// ================================================================
let evenTab='list';
function switchEvenTab(t){
  evenTab=t;
  document.getElementById('even-tab-list').classList.toggle('active',t==='list');
  document.getElementById('even-tab-spin').classList.toggle('active',t==='spin');
  document.getElementById('even-panel-list').style.display=t==='list'?'block':'none';
  document.getElementById('even-panel-spin').style.display=t==='spin'?'block':'none';
  if(t==='spin')renderEvenSpin();
}

function renderEvenList(){
  const panel=document.getElementById('even-panel-list');
  panel.innerHTML=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1rem;flex-wrap:wrap;gap:0.65rem;">
    <div style="font-size:0.78rem;color:var(--text-dim);font-weight:600;">${S.evenList.length} người tham dự</div>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
      <button class="btn-primary btn-sm" onclick="openAddEvenMember()">+ Thêm Người</button>
      <button class="btn-ghost btn-sm" onclick="importPlayersToEven()">📥 Nhập từ VĐV</button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="even-list-table">
      <thead><tr><th style="width:60px;">STT</th><th>Họ Tên</th><th style="width:130px;">Số May Mắn</th><th style="width:120px;">Thao Tác</th></tr></thead>
      <tbody>
        ${S.evenList.length===0?'<tr><td colspan="4" style="text-align:center;padding:2.5rem;color:var(--text-dim);">Chưa có người tham dự</td></tr>':''}
        ${S.evenList.map((m,i)=>`<tr>
          <td style="font-family:var(--font-display);font-weight:700;color:var(--text-dim);text-align:center;">${i+1}</td>
          <td style="font-weight:600;font-size:0.9rem;">${m.name}</td>
          <td style="text-align:center;"><span class="lucky-num">${m.lucky}</span></td>
          <td><div style="display:flex;gap:0.3rem;"><button class="btn-ghost btn-sm" onclick="openEditEvenMember(${m.id})">✏️</button><button class="btn-danger btn-sm" onclick="delEvenMember(${m.id})">✕</button></div></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function openAddEvenMember(){
  openGenericModal('➕ THÊM NGƯỜI THAM DỰ',`
    <div class="form-group"><label class="form-label">Họ Tên</label><input type="text" class="form-input" id="em-name" placeholder="Nhập họ tên"></div>
    <div class="form-group"><label class="form-label">Số May Mắn</label><input type="number" class="form-input" id="em-lucky" placeholder="Nhập số may mắn" min="1"></div>
    <button class="btn-primary" style="width:100%;" onclick="addEvenMember()">THÊM VÀO DANH SÁCH</button>`);
}

function addEvenMember(){
  const name=document.getElementById('em-name')?.value.trim(),lucky=parseInt(document.getElementById('em-lucky')?.value)||Math.floor(Math.random()*999)+1;
  if(!name){showToast('Vui lòng nhập họ tên','error');return;}
  S.evenList.push({id:nextId(),name,lucky});
  closeModal('genericModal');showToast('Đã thêm thành viên','success');save();renderEvenList();
}

function openEditEvenMember(id){
  const m=S.evenList.find(x=>x.id===id);if(!m)return;
  openGenericModal('✏️ CHỈNH SỬA THÔNG TIN',`
    <div class="form-group"><label class="form-label">Họ Tên</label><input type="text" class="form-input" id="em-name" value="${m.name}"></div>
    <div class="form-group"><label class="form-label">Số May Mắn</label><input type="number" class="form-input" id="em-lucky" value="${m.lucky}"></div>
    <button class="btn-primary" style="width:100%;" onclick="saveEvenMember(${id})">LƯU THAY ĐỔI</button>`);
}

function saveEvenMember(id){
  const m=S.evenList.find(x=>x.id===id);if(!m)return;
  m.name=document.getElementById('em-name')?.value.trim()||m.name;
  m.lucky=parseInt(document.getElementById('em-lucky')?.value)||m.lucky;
  closeModal('genericModal');showToast('Đã cập nhật','success');save();renderEvenList();
}

function delEvenMember(id){S.evenList=S.evenList.filter(x=>x.id!==id);save();renderEvenList();}

function importPlayersToEven(){
  if(!S.players.length){showToast('Chưa có VĐV nào trong hệ thống','error');return;}
  const added=[];
  S.players.forEach(p=>{
    if(!S.evenList.find(m=>m.name===p.name)){S.evenList.push({id:nextId(),name:p.name,lucky:Math.floor(Math.random()*999)+1});added.push(p.name);}
  });
  if(added.length>0){showToast(`Đã nhập ${added.length} VĐV vào danh sách Event`,'success');save();renderEvenList();}
  else showToast('Tất cả VĐV đã có trong danh sách','info');
}

// ================================================================
// EVEN — SPIN WHEEL
// ================================================================
let wheelAngle=0,wheelSpinning=false,wheelRAF=null,wheelVelocity=0,wheelWinner=null,wheelCountdown=null;

function renderEvenSpin(){
  const panel=document.getElementById('even-panel-spin');
  if(!S.evenList.length){panel.innerHTML='<div class="glass-panel" style="text-align:center;padding:3rem;color:var(--text-dim);"><div style="font-size:2rem;margin-bottom:0.5rem;">😢</div><div>Danh sách trống. Vui lòng thêm người tham dự trước.</div></div>';return;}
  panel.innerHTML=`
    <div class="wheel-container">
      <div style="text-align:center;margin-bottom:1rem;">
        <div class="wheel-timer" id="wheel-timer">45</div>
        <div class="wheel-timer-label" id="wheel-timer-label">Nhấn QUAY để bắt đầu</div>
      </div>
      <div class="wheel-outer">
        <div class="wheel-pointer"></div>
        <canvas class="wheel-canvas" id="wheel-canvas" width="340" height="340"></canvas>
        <button class="wheel-center-btn" id="wheel-center-btn" onclick="spinWheel()">QUAY</button>
      </div>
      <div id="wheel-result-area" style="margin-top:1.5rem;min-height:60px;"></div>
    </div>`;
  drawWheel();
}

const WHEEL_COLORS=['#D4AF37','#00D4FF','#00FF88','#FF3B5C','#A855F7','#F97316','#06B6D4','#EC4899','#84CC16','#EAB308','#3B82F6','#14B8A6'];

function drawWheel(){
  const canvas=document.getElementById('wheel-canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d'),W=340,cx=W/2,cy=W/2,r=cx-8;
  const items=S.evenList;const total=items.length;
  if(!total)return;
  const arc=2*Math.PI/total;
  ctx.clearRect(0,0,W,W);
  // shadow
  ctx.save();ctx.shadowColor='rgba(212,175,55,0.3)';ctx.shadowBlur=20;
  ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.fillStyle='rgba(8,12,20,0.9)';ctx.fill();ctx.restore();
  items.forEach((item,i)=>{
    const start=wheelAngle+i*arc,end=start+arc;
    ctx.save();
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,start,end);ctx.closePath();
    ctx.fillStyle=WHEEL_COLORS[i%WHEEL_COLORS.length];ctx.globalAlpha=0.9;ctx.fill();
    ctx.strokeStyle='rgba(8,12,20,0.5)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
    // text
    ctx.save();ctx.translate(cx,cy);ctx.rotate(start+arc/2);
    ctx.textAlign='right';ctx.fillStyle='#fff';ctx.font=`bold ${Math.min(13,r*0.11)}px 'Be Vietnam Pro',sans-serif`;
    ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=4;
    const label=item.name.length>12?item.name.slice(0,12)+'…':item.name;
    ctx.fillText(label,r-14,5);ctx.restore();
  });
  // outer ring
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.strokeStyle=WHEEL_COLORS[0];ctx.lineWidth=4;ctx.globalAlpha=0.6;ctx.stroke();ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r+5,0,2*Math.PI);ctx.strokeStyle='rgba(212,175,55,0.25)';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}

function spinWheel(){
  if(wheelSpinning||!S.evenList.length)return;
  wheelSpinning=true;wheelWinner=null;
  const btn=document.getElementById('wheel-center-btn');if(btn)btn.disabled=true;
  const timerEl=document.getElementById('wheel-timer'),labelEl=document.getElementById('wheel-timer-label');

  // start velocity
  wheelVelocity=0.18+Math.random()*0.12;
  let elapsed=0,duration=45000; // 45 seconds
  let lastTime=null,timerLeft=45;
  playWheelMusic();

  function tick(ts){
    if(!lastTime)lastTime=ts;
    const dt=ts-lastTime;lastTime=ts;elapsed+=dt;
    timerLeft=Math.max(0,Math.ceil((duration-elapsed)/1000));
    if(timerEl)timerEl.textContent=timerLeft;

    // ease out in last 8 seconds
    const remaining=duration-elapsed;
    if(remaining<8000)wheelVelocity=Math.max(0.004,wheelVelocity*0.985);

    wheelAngle=(wheelAngle+wheelVelocity)%(2*Math.PI);
    drawWheel();

    if(elapsed<duration&&wheelVelocity>0.004){
      wheelRAF=requestAnimationFrame(tick);
    } else {
      // determine winner
      const total=S.evenList.length,arc=2*Math.PI/total;
      // pointer is at top = angle 0 => -PI/2 offset
      const norm=(((-wheelAngle-Math.PI/2)%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
      const idx=Math.floor(norm/arc)%total;
      wheelWinner=S.evenList[idx];
      wheelSpinning=false;
      stopWheelMusic();
      showWheelResult(wheelWinner);
      if(btn)btn.disabled=false;
      if(labelEl)labelEl.textContent='Nhấn QUAY để bốc lại';
      if(timerEl)timerEl.textContent='🎉';
    }
  }
  if(labelEl)labelEl.textContent='Đang quay...';
  wheelRAF=requestAnimationFrame(tick);
}

function showWheelResult(winner){
  const area=document.getElementById('wheel-result-area');
  if(!area||!winner)return;
  const msg=`Chúc mừng <strong style="color:var(--gold-bright);">${winner.name}</strong> với <strong style="color:var(--neon-blue);">con số may mắn ${winner.lucky}</strong> đã trúng thưởng <strong style="color:var(--neon-green);">${S.evenPrize.text}</strong>`;
  area.innerHTML=`<div class="wheel-result">
    <div style="font-size:2.5rem;margin-bottom:0.5rem;">🎊</div>
    <div class="wheel-result-title">CHÚC MỪNG NGƯỜI MAY MẮN!</div>
    <div class="wheel-result-name">${winner.name}</div>
    <div class="wheel-result-msg">${msg}</div>
    ${S.evenPrize.img?`<img src="${S.evenPrize.img}" class="wheel-prize-img" alt="Phần thưởng">`:''}
  </div>`;
  triggerFireworks(6000);
}

// ================================================================
// AUDIO
// ================================================================
let _audioCtx=null,wheelMusicNodes=[];
function getACtx(){if(!_audioCtx)_audioCtx=new(window.AudioContext||window.webkitAudioContext)();return _audioCtx;}
function playTone(f,d,t='sine',v=0.25){try{const c=getACtx(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);o.start(c.currentTime);o.stop(c.currentTime+d);}catch(e){}}
function playSpinSound(){let i=0;const iv=setInterval(()=>{playTone(180+Math.random()*280,0.05,'square',0.12);i++;if(i>7)clearInterval(iv);},75);}
function playRevealSound(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,0.4,'sine',0.38),i*115));setTimeout(()=>playTone(1047,0.85,'sine',0.28),460);}

function playWheelMusic(){
  try{
    const c=getACtx();
    const notes=[261,294,330,349,392,440,494,523,587,659,698,784,880,988,1047];
    let t=c.currentTime;
    const nds=[];
    for(let i=0;i<200;i++){
      const o=c.createOscillator(),g=c.createGain();
      const note=notes[Math.floor(Math.random()*notes.length)];
      o.frequency.value=note;o.type='sine';
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.06,t+0.05);g.gain.linearRampToValueAtTime(0,t+0.18);
      o.connect(g);g.connect(c.destination);
      o.start(t);o.stop(t+0.2);
      t+=0.22+Math.random()*0.12;
      nds.push(o,g);
    }
    wheelMusicNodes=nds;
  }catch(e){}
}

function stopWheelMusic(){wheelMusicNodes.forEach(n=>{try{n.stop&&n.stop();}catch(e){}});wheelMusicNodes=[];}

// ================================================================
// FIREWORKS
// ================================================================
const fwC=document.getElementById('fw-canvas'),fwX=fwC.getContext('2d');
let fwPs=[],fwActive=false,fwEnd=0,fwRaf=null,lastLaunch=0;
function resizeFW(){fwC.width=window.innerWidth;fwC.height=window.innerHeight;}
window.addEventListener('resize',resizeFW);resizeFW();
const FWC=['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#DDA0DD','#F0E68C','#00FF88','#00D4FF','#FF3B5C','#FFA500','#FF69B4','#A855F7'];
class FWP{constructor(x,y,c){this.x=x;this.y=y;this.c=c;this.vx=(Math.random()-0.5)*9;this.vy=(Math.random()-0.5)*9-3.5;this.a=1;this.s=Math.random()*3.5+1.2;this.g=0.16;this.d=Math.random()*0.011+0.007;}update(){this.vx*=0.98;this.vy+=this.g;this.x+=this.vx;this.y+=this.vy;this.a-=this.d;}draw(ctx){ctx.save();ctx.globalAlpha=Math.max(0,this.a);ctx.fillStyle=this.c;ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,Math.PI*2);ctx.fill();ctx.restore();}}
function launchFW(){const x=Math.random()*fwC.width,y=Math.random()*(fwC.height*0.55),c=FWC[Math.floor(Math.random()*FWC.length)];for(let i=0;i<65;i++)fwPs.push(new FWP(x,y,c));for(let i=0;i<8;i++){const p=new FWP(x,y,'#fff');p.vx=(Math.random()-0.5)*16;p.vy=(Math.random()-0.5)*16;p.s=1.8;fwPs.push(p);}try{playTone(280+Math.random()*450,0.25,'sawtooth',0.1);}catch(e){}}
function animFW(){if(!fwActive&&!fwPs.length){fwRaf=null;return;}fwRaf=requestAnimationFrame(animFW);fwX.clearRect(0,0,fwC.width,fwC.height);const now=Date.now();if(fwActive&&now<fwEnd&&now-lastLaunch>260){launchFW();if(Math.random()<0.3)setTimeout(launchFW,130);lastLaunch=now;}if(now>=fwEnd)fwActive=false;fwPs=fwPs.filter(p=>p.a>0);fwPs.forEach(p=>{p.update();p.draw(fwX);});}
function triggerFireworks(dur){fwActive=true;fwEnd=Date.now()+dur;if(!fwRaf)animFW();}

// ================================================================
// INIT
// ================================================================
const loaded=loadAll();loadL();loadT();
if(!loaded)seedData();
applyLabels();applyTheme();
updateHeroStats();
navigate('home');

setInterval(()=>{const ap=document.querySelector('.page.active')?.id;if(ap==='page-detail'){const at=document.querySelector('#detail-tabs .tab-btn.active')?.textContent||'';if(at.includes('Bảng'))renderBracket(S.currentTournamentId);}},7000);
export { S,save,saveL,saveT,loadAll,loadL,loadT,nextId,shuffleArr,seedData,generateBracket,simResults,generateBracketFromOrder,getP,getT,getTMs,initials,skillBadge,showToast,closeModal,openGenericModal,navigate,switchTab,updateHeroStats,animCount,populateRegT,renderTournaments,openTournament,getChampion,renderBracket,renderMCard,renderMatchesTab,renderPlayersTab,renderStandingsTab,openMatchScore,adjSc,setWinner,saveSc,advWinner,resetMatch,refreshView,handleAvatarUpload,submitRegistration,adminNav,renderAdmin,renderAdmDash,renderAdmCreate,createTournament,renderAdmManage,startTournament,finishTournament,delTournament,renderAdmPlayers,approveReg,rejectReg,delPlayer,openEditPlayer,saveEditPlayer,openAssignPlayer,addToTournament,removeFromTournament,renderAdmMatches,renderAdmEven,handlePrizeImg,savePrize,renderAdmRankings,renderAdmCustomize,setCustTab,renderLblEditor,applyLabels,resetLabels,renderColorEditor,updateColor,applyTheme,resetTheme,renderFontEditor,prevFont,applyFonts,resetFonts,exportData,importData,initDrawPage,initDraw,updateDrawUI,renderMatchPairs,finalizeDraw,doDraw,drawAll,resetDraw,switchEvenTab,renderEvenList,openAddEvenMember,addEvenMember,openEditEvenMember,saveEvenMember,delEvenMember,importPlayersToEven,renderEvenSpin,drawWheel,spinWheel,showWheelResult,getACtx,playTone,playSpinSound,playRevealSound,playWheelMusic,stopWheelMusic,resizeFW,triggerFireworks };
