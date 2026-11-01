(function(){
"use strict";
var DATA, STATE, NOTES, INTRO, Q = {}, L, PARTS, TOTAL;
var app = document.getElementById("app");
var canManage = false;
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function parseDate(s){ var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null; }
function dateOf(d){ var s = parseDate(STATE.startDate); if(!s) return null; return new Date(s.getFullYear(), s.getMonth(), s.getDate() + d - (INTRO ? 0 : 1)); }
var WD = "일월화수목금토";
function fmt(x){ return (x.getMonth()+1) + "월 " + x.getDate() + "일 (" + WD[x.getDay()] + ")"; }
function fmtShort(x){ return (x.getMonth()+1) + "/" + x.getDate(); }
function todayDay(){ var s = parseDate(STATE.startDate); if(!s) return null; var t = new Date(); t = new Date(t.getFullYear(), t.getMonth(), t.getDate()); return Math.round((t - s) / 86400000) + (INTRO ? 0 : 1); }
function qRange(l){ var a = l.qs[0], b = l.qs[l.qs.length-1]; return a === b ? "제" + a + "문" : "제" + a + "~" + b + "문"; }
function partOf(d){ for(var i=0;i<PARTS.length;i++){ if(d >= PARTS[i].from && d <= PARTS[i].to) return PARTS[i]; } return null; }
function linkOf(d){ return STATE.links[d] || {}; }
function safeUrl(u){ return /^https?:\/\/\S+$/i.test(u || "") ? u : ""; }
function ytSearch(l){ return "https://www.youtube.com/results?search_query=" + encodeURIComponent("소요리문답 " + qRange(l)); }

function topbar(showBrand){
  var a = "";
  if(safeUrl(STATE.chatUrl)) a += '<a class="btn small ghost" href="' + esc(STATE.chatUrl) + '" target="_blank" rel="noopener">채팅방 열기</a>';
  if(canManage) a += '<a class="btn small ghost" href="#manage">관리</a>';
  return '<div class="top">' + (showBrand ? '<a class="brand" href="#">소요리문답 38일</a>' : '<span></span>') + '<div class="actions">' + a + '</div></div>';
}

function renderHome(){
  var td = todayDay(), first = INTRO ? 0 : 1;
  var firstQ = INTRO ? (INTRO.lead || "") : L[0].k, firstHref = INTRO ? "#day-0" : "#day-1";
  var hero;
  if(td == null){
    hero = '<p class="today-label">시작일이 아직 정해지지 않았어요</p><h2 class="today-title">' + first + '일째부터 차례로 열어 보세요</h2><p class="today-q">' + esc(firstQ) + '</p><a class="btn" href="' + firstHref + '">' + first + '일째 열기</a>';
  } else if(td < first){
    hero = '<p class="today-label">' + (first - td) + '일 뒤에 시작해요</p><h2 class="today-title">' + fmt(dateOf(first)) + ' 시작</h2><p class="today-q">' + esc(firstQ) + '</p><a class="btn" href="' + firstHref + '">' + first + '일째 미리 보기</a>';
  } else if(td === 0){
    hero = '<p class="today-label">오늘은 0일째, 시작하기 전에</p><h2 class="today-title">' + esc(INTRO.title) + '</h2><p class="today-q">' + esc(firstQ) + '</p><a class="btn" href="' + firstHref + '">오늘 이야기 열기</a>';
  } else if(td > TOTAL){
    hero = '<p class="today-label">' + TOTAL + '일 과정이 끝났어요</p><h2 class="today-title">끝까지 함께해 줘서 고마워요</h2><p class="today-q">빠진 날이 있다면 아래에서 골라 이어서 보세요.</p>';
  } else {
    var l = L[td-1];
    hero = '<p class="today-label">오늘은 ' + td + '일째, ' + qRange(l) + '</p><h2 class="today-title">' + esc(l.t) + '</h2><p class="today-q">' + esc(l.k) + '</p><a class="btn" href="#day-' + td + '">오늘 문답 열기</a>';
  }
  var parts = "";
  PARTS.forEach(function(p, pi){
    var rows = "";
    if(pi === 0 && INTRO){ var d0 = dateOf(0); rows += '<a class="row" href="#day-0"><span class="n">0</span><span><span class="t">' + esc(INTRO.title) + '</span><span class="m">시작하기 전에' + (d0 ? " / " + fmt(d0) : "") + '</span></span><span class="s"></span></a>'; }
    for(var d = p.from; d <= p.to; d++){
      var l = L[d-1], dt = dateOf(d);
      rows += '<a class="row" href="#day-' + d + '"><span class="n">' + d + '</span><span><span class="t">' + esc(l.t) + '</span><span class="m">' + qRange(l) + (dt ? " / " + fmt(dt) : "") + '</span></span></a>';
    }
    parts += '<section class="part"><h2>' + esc(p.name) + '</h2><p class="range">' + p.from + '~' + p.to + '일째, ' + esc(p.qr) + '</p>' + rows + '</section>';
  });
  app.innerHTML = '<div class="wrap">' + topbar(false) +
    '<header class="masthead"><h1><span class="mh-num">' + TOTAL + '</span><span class="mh-txt">일의<br>소요리문답</span></h1><p>하루 한 편, 유튜브로 말씀을 듣고 웨스트민스터 소요리문답을 읽은 뒤, 마음에 와닿은 부분을 채팅방에 나눠요.</p></header>' +
    '<section class="today">' + hero + '</section>' +
    parts +
    '<footer>본문은 대한예수교장로회(합동) 교단에서 사용하는 소요리문답 번역을 따랐습니다.</footer></div>';
}

function qaHtml(n){
  var q = Q[n];
  return '<article class="qa"><p class="qn">제' + n + '문</p><p class="qq">' + esc(q.q) + '</p><p class="qa-a"><b>답.</b> ' + esc(q.a) + '</p>' + (q.r ? '<p class="refs">함께 볼 말씀: ' + esc(q.r) + '</p>' : "") + '</article>';
}
function noteQs(n){ var qs = []; (n.days || []).forEach(function(d){ if(L[d-1]) qs = qs.concat(L[d-1].qs); }); return qs; }

function renderDay(d){
  var l = L[d-1]; if(!l){ location.hash = ""; return; }
  var p = partOf(d), dt = dateOf(d), lk = linkOf(d), url = safeUrl(lk.url);
  var video = url
    ? '<p class="vt">' + esc(lk.title || "오늘의 말씀") + '</p><a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">유튜브에서 말씀 보기</a>'
    : '<p>아직 말씀 링크가 등록되지 않았어요. 아래에서 이 문답 말씀을 찾아볼 수 있어요.</p><a class="btn ghost" href="' + ytSearch(l) + '" target="_blank" rel="noopener">유튜브에서 “소요리문답 ' + qRange(l) + '” 찾기</a>';
  var qa = l.qs.map(qaHtml).join("");
  var n = notesForDay(d)[0], vids = n ? noteVids(n) : "";
  if(vids) video = '<div class="vids">' + vids + '</div>';
  else video = '<div class="video">' + video + '</div>';
  app.innerHTML = '<div class="wrap">' + topbar(true) +
    '<div class="crumbs"><a class="btn small ghost" href="#">전체 일정</a></div>' +
    '<header class="lesson-head"><p class="dayno"><span class="dn">' + d + '</span><span class="du">일째</span></p><p class="meta">' + (p ? esc(p.name) : "") + (dt ? (p ? ", " : "") + fmt(dt) : "") + '</p><h1>' + esc(l.t) + '</h1><p class="key">' + esc(l.k) + '</p>' + (n && n.lead ? '<p class="lead">' + esc(n.lead) + '</p>' : '') + '</header>' +
    '<section class="step"><h2>오늘의 말씀</h2>' + video + '</section>' +
    '<section class="step"><h2>오늘의 문답</h2>' + qa + (n ? easyHtml(n) : '') + '</section>' +
    (n ? noteBody(n) + shareHtml(n) : '') +
    '<div class="btns" style="margin-top:28px"><button class="btn ghost" data-act="announce">오늘 안내 글 복사</button>' + (n ? '<button class="btn gold" data-act="copynote">본문 전체 복사</button>' : '') + '</div>' +
    '<nav class="pager">' + (d > 1 ? '<a class="btn small ghost" href="#day-' + (d-1) + '">' + (d-1) + '일째</a>' : INTRO ? '<a class="btn small ghost" href="#day-0">0일째</a>' : '<span></span>') + (d < TOTAL ? '<a class="btn small ghost" href="#day-' + (d+1) + '">' + (d+1) + '일째</a>' : '<span></span>') + '</nav></div>';

  app.querySelector('[data-act="announce"]').addEventListener("click", function(){ copyText(announceText(l)); });
  if(n) app.querySelector('[data-act="copynote"]').addEventListener("click", function(){ copyText(noteText(n)); });
}


function noteById(id){ for(var i=0;i<NOTES.length;i++){ if(NOTES[i].id === id) return NOTES[i]; } return null; }
function notesForDay(d){ return NOTES.filter(function(n){ return (n.days || []).indexOf(d) >= 0; }); }
function noteHref(n){ return n.days && n.days.length ? "#day-" + n.days[0] : "#day-0"; }
function ytId(u){ var m = /[?&]v=([\w-]{11})/.exec(u || "") || /youtu\.be\/([\w-]{11})/.exec(u || ""); return m ? m[1] : ""; }
function noteVids(n){ return (n.videos || []).map(function(v){
  var u = safeUrl(v.u), id = ytId(u); if(!u) return "";
  return '<a class="vcard" href="' + esc(u) + '" target="_blank" rel="noopener">' +
    (id ? '<span class="vthumb"><img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy"><span class="vplay" aria-hidden="true"></span></span>' : '') +
    '<span class="vmeta"><span class="vtitle">' + esc(v.t) + '</span><span class="vsrc">유튜브에서 영상 보기</span></span></a>';
}).join(""); }
function easyHtml(n){
  if(!n.easy && !(n.words && n.words.length)) return "";
  var w = (n.words || []).map(function(x){ return '<p><b>' + esc(x.t) + '</b>' + esc(x.d) + '</p>'; }).join("");
  return '<div class="easy">' + (n.easy ? '<p class="el">쉬운 말로</p><p>' + esc(n.easy) + '</p>' : '') + (w ? '<div class="words"><p class="el">어려운 단어</p>' + w + '</div>' : '') + '</div>';
}
function shareHtml(n){
  if(!n.share) return "";
  return '<section class="note-sec"><h2>생각해 보기</h2><div class="share"><p>' + esc(n.share) + '</p>' + (n.read ? '<p class="read">찾아 읽기 · ' + esc(n.read) + '</p>' : '') + '</div></section>';
}
function noteBody(n){
  var html = "";
  (n.sections || []).forEach(function(sec){
    html += '<section class="note-sec"><h2>' + esc(sec.h) + '</h2>';
    (sec.p || []).forEach(function(p){ html += '<p>' + esc(p) + '</p>'; });
    if(sec.items && sec.items.length){
      html += '<div class="terms">';
      sec.items.forEach(function(it){ html += '<div class="term"><div><p class="tt">' + esc(it.t) + '</p><p class="td">' + esc(it.d) + '</p></div></div>'; });
      html += '</div>';
    }
    (sec.after || []).forEach(function(p){ html += '<p>' + esc(p) + '</p>'; });
    html += '</section>';
  });
  if(n.key) html += '<section class="note-sec"><h2>오늘의 한 문장</h2><blockquote class="quote"><p>' + esc(n.key.q) + '</p>' + (n.key.d ? '<span>' + esc(n.key.d) + '</span>' : '') + '</blockquote></section>';
  return html;
}
function renderIntro(){
  var n = INTRO; if(!n){ location.replace("#day-1"); return; }
  var vids = noteVids(n), d0 = dateOf(0);
  app.innerHTML = '<div class="wrap">' + topbar(true) + '<div class="crumbs"><a class="btn small ghost" href="#">전체 일정</a></div>' +
    '<header class="lesson-head"><p class="dayno"><span class="dn">0</span><span class="du">일째</span></p><p class="meta">시작하기 전에' + (d0 ? ", " + fmt(d0) : "") + '</p><h1>' + esc(n.title) + '</h1>' + (n.lead ? '<p class="lead">' + esc(n.lead) + '</p>' : '') + '</header>' +
    (vids ? '<section class="step"><h2>오늘의 말씀</h2><div class="vids">' + vids + '</div></section>' : '') +
    noteBody(n) + shareHtml(n) +
    '<div class="btns" style="margin-top:28px"><button class="btn ghost" data-act="announce">오늘 안내 글 복사</button><button class="btn gold" data-act="copynote">본문 전체 복사</button></div>' +
    '<nav class="pager"><span></span><a class="btn small ghost" href="#day-1">1일째</a></nav></div>';
  app.querySelector('[data-act="announce"]').addEventListener("click", function(){ copyText(introAnnounceText(n)); });
  app.querySelector('[data-act="copynote"]').addEventListener("click", function(){ copyText(noteText(n)); });
}
function noteText(n){
  var s = "📖 " + (n.label ? "[" + n.label + "] " : "") + n.title + "\n";
  if(n.lead) s += "\n" + n.lead + "\n";
  noteQs(n).forEach(function(k){ var q = Q[k]; s += "\n제" + k + "문. " + q.q + "\n답. " + q.a + "\n"; });
  (n.sections || []).forEach(function(sec){
    s += "\n■ " + sec.h + "\n";
    (sec.p || []).forEach(function(p){ s += p + "\n"; });
    (sec.items || []).forEach(function(it, i){ s += "- " + it.t + ": " + it.d + "\n"; });
    (sec.after || []).forEach(function(p){ s += p + "\n"; });
  });
  if(n.key) s += "\n■ 오늘의 한 문장\n“" + n.key.q + "”\n";
  if(n.share) s += "\n💭 생각해 보기\n" + n.share + "\n";
  (n.videos || []).forEach(function(v, i){ if(i === 0) s += "\n🎥 말씀\n"; s += v.t + " " + v.u + "\n"; });
  return s.trim();
}

function shortYt(u){ var m = /[?&]v=([\w-]{11})/.exec(u || ""); return m ? "https://youtu.be/" + m[1] : u; }
function pageUrl(d){ return location.origin + location.pathname + "#day-" + d; }
function announceText(l){
  var dt = dateOf(l.d), url = safeUrl(linkOf(l.d).url), n = notesForDay(l.d)[0];
  var s = "📖 소요리문답 " + l.d + "일째" + (dt ? " (" + fmtShort(dt) + ")" : "") + "\n" + l.t + "\n\n";
  l.qs.forEach(function(k){ var q = Q[k]; s += "제" + k + "문. " + q.q + "\n답. " + q.a + "\n\n"; });
  if(url) s += "🎥 " + shortYt(url) + "\n";
  if(n && n.share) s += "💭 " + n.share + "\n";
  return s + "👉 오늘 글 보기 " + pageUrl(l.d);
}
function introAnnounceText(n){
  var dt = dateOf(0), v = (n.videos || [])[0];
  return "📖 소요리문답 0일째" + (dt ? " (" + fmtShort(dt) + ")" : "") + "\n" + n.title + "\n\n" + (n.lead ? n.lead + "\n\n" : "") + (v && safeUrl(v.u) ? "🎥 " + shortYt(v.u) + "\n" : "") + "👉 오늘 글 보기 " + pageUrl(0);
}

var toastTimer;
function toast(t){ var el = document.getElementById("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function(){ el.classList.remove("show"); }, 2200); }
function copyText(t){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){ toast("복사했어요. 채팅방에 붙여 넣으세요."); }, function(){ showCopy(t); });
  } else showCopy(t);
}
function showCopy(t){
  var m = document.createElement("div"); m.className = "modal";
  m.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-label="복사할 글"><p style="margin:0 0 10px;font-weight:600">아래 글을 전체 선택해서 복사하세요</p><textarea readonly></textarea><div class="btns" style="margin-top:12px"><button class="btn">닫기</button></div></div>';
  m.querySelector("textarea").value = t;
  document.body.appendChild(m);
  var ta = m.querySelector("textarea"); ta.focus(); ta.select();
  function close(){ m.remove(); }
  m.querySelector("button").addEventListener("click", close);
  m.addEventListener("click", function(e){ if(e.target === m) close(); });
}

function route(){
  var h = (location.hash || "").replace(/^#/, "");
  var m = /^day-(\d{1,2})$/.exec(h);
  if(m && +m[1] === 0) renderIntro();
  else if(m) renderDay(+m[1]);
  else if(/^note-[a-z0-9-]+$/.test(h)){ var n = noteById(h.slice(5)); location.replace(n ? noteHref(n) : "#"); return; }
  else if(h === "notes"){ location.replace("#"); return; }
  else renderHome();
  window.scrollTo(0, 0);
}
function getJSON(p){ return fetch(p, {cache: "no-cache"}).then(function(r){ if(!r.ok) throw new Error(p + " " + r.status); return r.json(); }); }
Promise.all([getJSON("data/catechism.json"), getJSON("data/config.json"), getJSON("data/notes.json")]).then(function(r){
  DATA = r[0]; STATE = r[1] || {}; NOTES = r[2] || [];
  STATE.links = STATE.links || {};
  DATA.qs.forEach(function(q){ Q[q.n] = q; });
  INTRO = NOTES.filter(function(n){ return !(n.days && n.days.length); })[0] || null;
  L = DATA.lessons; PARTS = DATA.parts; TOTAL = L.length;
  window.addEventListener("hashchange", route);
  route();
}).catch(function(e){
  app.innerHTML = '<div class="wrap"><div class="notice">내용을 불러오지 못했어요. 잠시 뒤 새로고침해 주세요.</div><p class="hint">관리자 참고: 파일을 더블클릭해 열면 이 화면이 나와요. GitHub Pages에 올리거나 로컬 서버(python -m http.server)로 열어 주세요.</p></div>';
  console.error(e);
});

})();
