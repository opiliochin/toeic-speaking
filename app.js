/* 토익스피킹 모의고사 - 시험 진행 엔진 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'tsm_custom_sets_v1';
  var ABORT = { abort: true };

  // ---------- 파트 정의 (시간은 ETS 공식 안내 기준) ----------
  var PARTS = {
    p1: { key: 'p1', title: 'Questions 1-2: Read a Text Aloud', say: 'Questions one and two. Read a text aloud.',
      dir: 'In this part of the test, you will read aloud the text on the screen. You will have 45 seconds to prepare. Then you will have 45 seconds to read the text aloud.' },
    p2: { key: 'p2', title: 'Questions 3-4: Describe a Picture', say: 'Questions three and four. Describe a picture.',
      dir: 'In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to prepare your response. Then you will have 30 seconds to speak about the picture.' },
    p3: { key: 'p3', title: 'Questions 5-7: Respond to Questions', say: 'Questions five through seven. Respond to questions.',
      dir: 'In this part of the test, you will answer three questions. You will have three seconds to prepare after you hear each question. You will have 15 seconds to respond to Questions 5 and 6, and 30 seconds to respond to Question 7.' },
    p4: { key: 'p4', title: 'Questions 8-10: Respond to Questions Using Information Provided', say: 'Questions eight through ten. Respond to questions using information provided.',
      dir: 'In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have three seconds to prepare after you hear each question. You will have 15 seconds to respond to Questions 8 and 9, and 30 seconds to respond to Question 10. Question 10 will be asked twice.' },
    p5: { key: 'p5', title: 'Question 11: Express an Opinion', say: 'Question eleven. Express an opinion.',
      dir: 'In this part of the test, you will give your opinion about a specific topic. Be sure to say as much as you can in the time allowed. You will have 45 seconds to prepare. Then you will have 60 seconds to speak.' }
  };
  var TIPS = {
    p1: '끊어 읽기(쉼표·마침표에서 쉬기), 나열(A, B, and C)은 올렸다가 마지막에 내리기, 숫자·고유명사를 또박또박. 45초 안에 끝까지 읽는 것이 우선입니다.',
    p2: '장소 → 가장 눈에 띄는 사람/사물 → 주변 순서로, 현재진행형(is ~ing)으로 묘사. 30초를 꽉 채우는 연습을 하세요.',
    p3: '질문에 들어있는 의문사(예: how often + where)를 모두 답했는지 확인. 질문 문장을 재활용해 첫 문장을 빠르게 시작하면 3초 준비가 편해집니다.',
    p4: '표에서 정확한 시간·장소·이름을 말하기. 9번처럼 틀린 정보를 묻는 질문은 “Actually, ~” 로 정정. 10번은 해당 항목을 빠짐없이 순서대로 정리.',
    p5: '입장 → 이유 1·2 → 구체적 예시 → 결론 순서. 60초 동안 말이 끊기지 않도록 이유를 미리 두 개 정해 두세요.'
  };

  // ---------- 상태 ----------
  var sets = [];
  var micStream = null, audioCtx = null, analyser = null, meterRAF = 0;
  var session = null; // { aborted, skip, recordings }
  var lastRun = null;

  // ---------- 세트 관리 ----------
  function loadCustom() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveCustom(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  function refreshSets(selectId) {
    sets = (window.BUILTIN_SETS || []).concat(loadCustom());
    var sel = $('setSel'); sel.innerHTML = '';
    sets.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.title + (s.id.indexOf('builtin') === 0 ? '' : ' (내 자료)');
      sel.appendChild(o);
    });
    if (selectId) sel.value = selectId;
  }
  function currentSet() { var id = $('setSel').value; return sets.filter(function (s) { return s.id === id; })[0]; }

  function validateSet(s) {
    if (!s || typeof s !== 'object') return '파일 내용이 객체 형식이 아닙니다.';
    if (!s.title) return 'title(세트 이름)이 없습니다.';
    var has = false;
    if (s.q1 || s.q2) { has = true; if ((s.q1 && !s.q1.text) || (s.q2 && !s.q2.text)) return 'q1/q2에는 text가 필요합니다.'; }
    if (s.q3 || s.q4) { has = true; if ((s.q3 && !s.q3.image) || (s.q4 && !s.q4.image)) return 'q3/q4에는 image가 필요합니다.'; }
    if (s.q5_7) { has = true; if (!s.q5_7.context || !Array.isArray(s.q5_7.questions) || s.q5_7.questions.length !== 3) return 'q5_7에는 context와 질문 3개(questions)가 필요합니다.'; }
    if (s.q8_10) { has = true; var i = s.q8_10.info; if (!i || !i.title || !Array.isArray(i.rows) || !Array.isArray(s.q8_10.questions) || s.q8_10.questions.length !== 3) return 'q8_10에는 info(title, rows)와 질문 3개(questions)가 필요합니다.'; }
    if (s.q11) { has = true; if (!s.q11.text) return 'q11에는 text가 필요합니다.'; }
    if (!has) return '문항(q1~q11)이 하나도 없습니다.';
    return null;
  }

  // ---------- 음성(TTS) ----------
  var voices = [];
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    var sel = $('voiceSel'), prev = sel.value; sel.innerHTML = '';
    if (!voices.length) { var o = document.createElement('option'); o.textContent = '영어 음성 없음 (질문이 화면 자막으로 표시됨)'; o.value = ''; sel.appendChild(o); return; }
    voices.sort(function (a, b) { return score(b) - score(a); });
    voices.forEach(function (v) { var o = document.createElement('option'); o.value = v.name; o.textContent = v.name + ' (' + v.lang + ')'; sel.appendChild(o); });
    if (prev) sel.value = prev;
    function score(v) { return (/en[-_]US/i.test(v.lang) ? 2 : 0) + (/google|natural|samantha|aria|jenny/i.test(v.name) ? 1 : 0); }
  }
  function ttsAvailable() { return 'speechSynthesis' in window && voices.length > 0; }
  function speakOnce(text) {
    return new Promise(function (resolve) {
      var u = new SpeechSynthesisUtterance(text);
      var v = voices.filter(function (x) { return x.name === $('voiceSel').value; })[0] || voices[0];
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
      u.rate = parseFloat($('rate').value) || 1;
      var done = false, fin = function () { if (!done) { done = true; clearTimeout(t); resolve(); } };
      // 일부 브라우저에서 onend가 오지 않는 문제 대비
      var t = setTimeout(fin, (text.split(/\s+/).length * 0.6 / u.rate + 3) * 1000);
      u.onend = fin; u.onerror = fin;
      if (session) session.skip = function () { session.skipped = true; speechSynthesis.cancel(); fin(); };
      speechSynthesis.speak(u);
    });
  }
  function dirLine(p) { return p.say + ' ' + p.dir; }
  // 미리 녹음해 둔 고품질 음성(audio.js)이 있으면 그것을 재생
  function clipFor(text) {
    var c = window.AUDIO_CLIPS;
    return c && $('useClips') && $('useClips').checked ? c[text] : null;
  }
  // 사파리는 사용자가 누른 직후가 아니면 소리 재생을 막으므로,
  // '시험 시작'을 누를 때 하나의 재생기를 깨워 두고 계속 다시 씀
  var player = null;
  var SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  function unlockAudio() {
    if (!player) player = new Audio();
    try { player.src = SILENT; var p = player.play(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* 무시 */ }
  }
  function playClip(src) {
    return new Promise(function (resolve) {
      if (!player) player = new Audio();
      var a = player, done = false;
      var fin = function (r) { if (!done) { done = true; a.onended = a.onerror = null; a.pause(); resolve(r); } };
      a.onended = function () { fin(); }; a.onerror = function () { fin('error'); };
      if (session) session.skip = function () { session.skipped = true; fin(); };
      a.src = src;
      var p = a.play(); if (p && p.catch) p.catch(function () { fin('blocked'); });
    });
  }
  async function speak(text, opts) {
    opts = opts || {};
    check();
    if (session) session.skipped = false;
    if (opts.caption) setCaption(text);
    var clip = clipFor(text);
    if (clip) {
      var res = await playClip(clip);
      if (session) session.skipped = false;
      check();
      if (!res) return;
      // 재생이 막히면 자막으로 대신 보여 줌
      setCaption(text);
      await sleep(Math.max(2, text.split(/\s+/).length * 0.4) * 1000);
      return;
    }
    if (!ttsAvailable()) {
      setCaption(text);
      await sleep(Math.max(2, text.split(/\s+/).length * 0.4) * 1000);
      return;
    }
    // 긴 문장이 중간에 끊기는 브라우저 버그를 피하려고 문장 단위로 읽음
    var parts = text.match(/[^.!?]+[.!?]*["']?\s*/g) || [text];
    for (var i = 0; i < parts.length; i++) {
      check();
      if (session && session.skipped) break;
      await speakOnce(parts[i].trim());
    }
    if (session) session.skipped = false;
    check();
  }

  // ---------- 소리·대기·타이머 ----------
  function ensureAudioCtx() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function beep() {
    var ctx = ensureAudioCtx(); if (!ctx) return sleep(300);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 1000; g.gain.value = 0.25;
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.4);
    return sleep(550);
  }
  function check() { if (!session || session.aborted) throw ABORT; }
  function sleep(ms) {
    return new Promise(function (resolve) {
      var t = setTimeout(done, ms);
      function done() { clearTimeout(t); resolve(); }
      if (session) session.skip = function () { session.skipped = true; done(); };
    }).then(check);
  }
  function fmt(sec) { var m = Math.floor(sec / 60), s = sec % 60; return '00:' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function countdown(sec, kind) {
    var labels = { prep: 'PREPARATION TIME', resp: 'RESPONSE TIME', read: 'READING TIME' };
    var tm = $('timer');
    tm.classList.remove('hidden'); tm.classList.toggle('resp', kind === 'resp');
    $('timerLabel').textContent = labels[kind];
    $('timerVal').textContent = fmt(sec);
    return new Promise(function (resolve) {
      var end = Date.now() + sec * 1000;
      var iv = setInterval(tick, 100);
      function tick() {
        var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        $('timerVal').textContent = fmt(left);
        if (left <= 0) finish();
      }
      function finish() { clearInterval(iv); resolve(); }
      if (session) { session.skip = finish; session.stopTimer = finish; }
    }).then(function () { $('timerVal').textContent = fmt(0); check(); });
  }
  function hideTimer() { $('timer').classList.add('hidden'); }
  function setStatus(html) { $('status').innerHTML = html || ''; }

  // ---------- 녹음 ----------
  async function getMic() {
    if (micStream) return micStream;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('이 브라우저는 마이크 녹음을 지원하지 않습니다.');
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return micStream;
  }
  function pickMime() {
    var c = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    if (!window.MediaRecorder) return null;
    for (var i = 0; i < c.length; i++) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c[i])) return c[i];
    return '';
  }
  function startRecording() {
    if (!micStream || !window.MediaRecorder) return null;
    var mime = pickMime(), chunks = [];
    var rec = mime ? new MediaRecorder(micStream, { mimeType: mime }) : new MediaRecorder(micStream);
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    var stopped = new Promise(function (resolve) {
      rec.onstop = function () { resolve(new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' })); };
    });
    rec.start();
    return { stop: function () { if (rec.state !== 'inactive') rec.stop(); return stopped; } };
  }
  // ---------- 답변 음성 인식 (Chrome의 Web Speech API, 인터넷 필요) ----------
  function startRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!$('analyze').checked) return { stop: function () { return Promise.resolve({ text: '', error: 'off' }); } };
    if (!SR) return { stop: function () { return Promise.resolve({ text: '', error: 'not-supported' }); } };
    var text = '', err = null, active = true, rec = null, ended = null;
    function make() {
      rec = new SR();
      rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
      };
      rec.onerror = function (e) {
        if (e.error !== 'no-speech' && e.error !== 'aborted') err = e.error;
        if (/not-allowed|service-not-allowed|network|language-not-supported/.test(e.error)) active = false;
      };
      // 크롬은 말이 잠시 끊기면 인식을 스스로 멈추므로 답변 시간 동안 다시 켬
      rec.onend = function () {
        if (active) { try { make(); } catch (x) { active = false; if (ended) ended(); } }
        else if (ended) ended();
      };
      rec.start();
    }
    try { make(); } catch (x) { return { stop: function () { return Promise.resolve({ text: '', error: 'start-failed' }); } }; }
    return {
      stop: function () {
        active = false;
        return new Promise(function (resolve) {
          var t = setTimeout(go, 2500);
          function go() { clearTimeout(t); resolve({ text: text.trim(), error: text.trim() ? null : err }); }
          ended = go;
          try { rec.stop(); } catch (x) { go(); }
        });
      }
    };
  }
  async function respond(qnum, sec) {
    var r = startRecording();
    var sr = startRecognition();
    setStatus(r ? '<span class="recdot"></span> 녹음 중' : '마이크가 꺼져 있어 녹음되지 않습니다');
    try { await countdown(sec, 'resp'); }
    finally {
      if (r) {
        var blob = await r.stop();
        if (session) session.recordings[qnum] = blob;
      }
      if (session) session.transcripts[qnum] = sr.stop(); else sr.stop();
      setStatus('');
    }
    await beepEnd();
  }
  function beepEnd() { return sleep(400); }

  // ---------- 화면 그리기 ----------
  function show(id) { ['home', 'test', 'review'].forEach(function (x) { $(x).classList.toggle('hidden', x !== id); }); window.scrollTo(0, 0); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function stage(nodes) { var s = $('stageInner'); s.innerHTML = ''; nodes.forEach(function (n) { if (n) s.appendChild(n); }); }
  function header(q, sub) { $('qinfo').textContent = q ? 'Question ' + q + ' of 11' : ''; $('subbar').textContent = sub || ''; }
  function setCaption(text) {
    var c = $('caption');
    if (!c) { c = el('div', 'caption'); c.id = 'caption'; $('stageInner').appendChild(c); }
    c.textContent = text;
  }
  function pictureNode(src) {
    var d = el('div', 'picture');
    if (typeof src === 'string' && src.trim().indexOf('<svg') === 0) d.innerHTML = src;
    else { var img = document.createElement('img'); img.src = src; img.alt = 'Picture'; d.appendChild(img); }
    return d;
  }
  function infoNode(info) {
    var box = el('div', 'infobox');
    box.appendChild(el('div', 'ititle', info.title));
    if (info.subtitle) box.appendChild(el('div', 'isub', info.subtitle));
    var tb = document.createElement('table');
    (info.rows || []).forEach(function (r) {
      var tr = document.createElement('tr');
      (Array.isArray(r) ? r : [r]).forEach(function (c) { tr.appendChild(el('td', '', c)); });
      tb.appendChild(tr);
    });
    box.appendChild(tb);
    if (info.notes && info.notes.length) { var n = el('div', 'inotes'); info.notes.forEach(function (x) { n.appendChild(el('div', '', '* ' + x)); }); box.appendChild(n); }
    return box;
  }

  // ---------- 진행 ----------
  async function directions(p) {
    header('', p.title);
    var d = el('div', 'directions');
    d.appendChild(el('b', '', p.title)); d.appendChild(document.createElement('br'));
    d.appendChild(el('span', '', 'Directions: ' + p.dir));
    stage([d]); hideTimer();
    await speak(dirLine(p));
    await sleep(800);
  }
  async function prepThenSpeak(qnum, prep, resp, verb) {
    await speak('Begin preparing now.');
    await beep();
    await countdown(prep, 'prep');
    await speak('Begin ' + verb + ' now.');
    await beep();
    await respond(qnum, resp);
  }
  async function runP1(s) {
    var qs = [[1, s.q1], [2, s.q2]];
    for (var i = 0; i < qs.length; i++) {
      if (!qs[i][1]) continue;
      header(qs[i][0], PARTS.p1.title); hideTimer();
      stage([el('div', 'readtext', qs[i][1].text)]);
      await prepThenSpeak(qs[i][0], 45, 45, 'reading aloud');
    }
  }
  async function runP2(s) {
    var qs = [[3, s.q3], [4, s.q4]];
    for (var i = 0; i < qs.length; i++) {
      if (!qs[i][1]) continue;
      header(qs[i][0], PARTS.p2.title); hideTimer();
      stage([pictureNode(qs[i][1].image)]);
      await prepThenSpeak(qs[i][0], 45, 30, 'speaking');
    }
  }
  async function runP3(s) {
    var d = s.q5_7, times = [15, 15, 30];
    header(5, PARTS.p3.title); hideTimer();
    stage([el('div', 'context', d.context)]);
    await speak(d.context);
    for (var i = 0; i < 3; i++) {
      var q = 5 + i;
      header(q, PARTS.p3.title); hideTimer();
      stage([el('div', 'context', d.context), el('div', 'qtext', 'Question ' + q + ': ' + d.questions[i])]);
      await speak(d.questions[i]);
      await countdown(3, 'prep');
      await beep();
      await respond(q, times[i]);
    }
  }
  async function runP4(s) {
    var d = s.q8_10, times = [15, 15, 30], cap = $('captions').checked;
    header(8, PARTS.p4.title); hideTimer();
    stage([infoNode(d.info)]);
    await countdown(45, 'read');
    hideTimer();
    if (d.intro) await speak(d.intro, { caption: cap });
    for (var i = 0; i < 3; i++) {
      var q = 8 + i;
      header(q, PARTS.p4.title); hideTimer();
      stage([infoNode(d.info)]);
      await speak(d.questions[i], { caption: cap });
      if (q === 10) { await sleep(1200); await speak(d.questions[i], { caption: cap }); }
      await countdown(3, 'prep');
      await beep();
      await respond(q, times[i]);
    }
  }
  async function runP5(s) {
    header(11, PARTS.p5.title); hideTimer();
    stage([el('div', 'qtext', s.q11.text)]);
    await speak(s.q11.text);
    await prepThenSpeak(11, 45, 60, 'speaking');
  }
  // 빌드 스크립트가 미리 녹음할 문장 목록을 뽑을 때 사용
  window.TSM_LINES = function (s) {
    var L = [];
    function add(text, role) { if (text) L.push({ text: text, role: role }); }
    if (!s) {
      ['TOEIC Speaking Test.', 'Begin preparing now.', 'Begin reading aloud now.', 'Begin speaking now.', 'This is the end of the test.'].forEach(function (t) { add(t, 'narrator'); });
      Object.keys(PARTS).forEach(function (k) { add(dirLine(PARTS[k]), 'narrator'); });
      return L;
    }
    if (s.q5_7) { add(s.q5_7.context, 'narrator'); s.q5_7.questions.forEach(function (q) { add(q, 'q57'); }); }
    if (s.q8_10) { add(s.q8_10.intro, 'q810'); s.q8_10.questions.forEach(function (q) { add(q, 'q810'); }); }
    if (s.q11) add(s.q11.text, 'narrator');
    return L;
  };
  var RUNNERS = { p1: runP1, p2: runP2, p3: runP3, p4: runP4, p5: runP5 };
  function partAvailable(s, k) {
    return { p1: s.q1 || s.q2, p2: s.q3 || s.q4, p3: s.q5_7, p4: s.q8_10, p5: s.q11 }[k];
  }

  async function startTest(s, mode) {
    if (!s) return;
    var keys = mode === 'all' ? ['p1', 'p2', 'p3', 'p4', 'p5'] : [mode];
    keys = keys.filter(function (k) { return partAvailable(s, k); });
    if (!keys.length) { alert('이 세트에는 선택한 범위의 문항이 없습니다.'); return; }
    ensureAudioCtx();
    unlockAudio();
    stopMeter();
    if (!micStream) { try { await getMic(); } catch (e) { /* 녹음 없이 진행 */ } }
    lastRun = { set: s, mode: mode };
    session = { aborted: false, skip: null, skipped: false, recordings: {}, transcripts: {} };
    $('btnSkip').classList.toggle('hidden', !$('practice').checked);
    show('test');
    try {
      if (!micStream) { setStatus('마이크를 사용할 수 없어 녹음 없이 진행합니다'); }
      header('', 'TOEIC Speaking Test');
      stage([el('div', 'directions', 'TOEIC Speaking Test — ' + (mode === 'all' ? '11 questions. ' : 'Practice. ') + 'Listen to the directions. Answer only after you hear the beep. Your answers will be recorded.')]);
      await speak('TOEIC Speaking Test.');
      await sleep(1000);
      for (var i = 0; i < keys.length; i++) {
        await directions(PARTS[keys[i]]);
        await RUNNERS[keys[i]](s);
      }
      header('', '');
      hideTimer();
      stage([el('div', 'directions', 'This is the end of the test.')]);
      await speak('This is the end of the test.');
      await sleep(800);
      await finishTest(keys);
    } catch (e) {
      if (e !== ABORT) { console.error(e); alert('오류가 발생했습니다: ' + (e && e.message)); show('home'); }
    }
  }
  function abortTest() {
    if (!session) return;
    session.aborted = true;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (session.stopTimer) session.stopTimer();
    if (session.skip) session.skip();
  }

  // ---------- 결과 ----------
  function qMeta(s, keys) {
    var out = [];
    function add(q, part, task, prompt, image, question) { out.push({ q: q, part: part, task: task, prompt: prompt, image: image, question: question }); }
    keys.forEach(function (k) {
      if (k === 'p1') { if (s.q1) add(1, k, 'Read a text aloud', s.q1.text); if (s.q2) add(2, k, 'Read a text aloud', s.q2.text); }
      if (k === 'p2') { if (s.q3) add(3, k, 'Describe a picture', '', s.q3.image); if (s.q4) add(4, k, 'Describe a picture', '', s.q4.image); }
      if (k === 'p3') s.q5_7.questions.forEach(function (x, i) { add(5 + i, k, 'Respond to questions', s.q5_7.context + '\n\n' + x, null, x); });
      if (k === 'p4') s.q8_10.questions.forEach(function (x, i) {
        var info = s.q8_10.info, lines = [info.title + (info.subtitle ? ' / ' + info.subtitle : '')].concat(info.rows.map(function (r) { return (Array.isArray(r) ? r.join('  ') : r); })).concat((info.notes || []).map(function (n) { return '* ' + n; }));
        add(8 + i, k, 'Respond to questions using information provided', (i === 0 ? lines.join('\n') + '\n\n' : '') + (i === 0 && s.q8_10.intro ? '[Intro] ' + s.q8_10.intro + '\n' : '') + 'Q: ' + x, null, x);
      });
      if (k === 'p5') add(11, k, 'Express an opinion', s.q11.text, null, s.q11.text);
    });
    return out;
  }
  async function finishTest(keys) {
    var recs = session.recordings, s = lastRun.set, list = $('reviewList');
    list.innerHTML = '';
    hideTimer(); stage([el('div', 'directions', '답변을 정리하는 중입니다...')]);
    var trs = {}, qs = Object.keys(session.transcripts);
    for (var i = 0; i < qs.length; i++) trs[qs[i]] = await session.transcripts[qs[i]];
    var shownTip = {}, metas = qMeta(s, keys), rows = [];
    metas.forEach(function (m) { if (trs[m.q]) rows.push(analyze(m, s, trs[m.q])); });
    list.appendChild(reportTop(rows, keys));
    metas.forEach(function (m, idx) {
      var c = el('div', 'rcard');
      c.appendChild(el('h3', '', 'Question ' + m.q + ' · ' + m.task));
      if (m.image) { var th = pictureNode(m.image); th.className = 'thumb'; c.appendChild(th); }
      if (m.prompt) c.appendChild(el('div', 'prompt', m.prompt));
      var b = recs[m.q];
      if (b && b.size) {
        var url = URL.createObjectURL(b);
        var a = document.createElement('audio'); a.controls = true; a.src = url; c.appendChild(a);
        var dl = document.createElement('a'); dl.href = url; dl.className = 'btn';
        var ext = /mp4/.test(b.type) ? 'm4a' : /ogg/.test(b.type) ? 'ogg' : 'webm';
        dl.download = 'TOEIC-Speaking-Q' + m.q + '.' + ext; dl.textContent = '파일로 저장';
        c.appendChild(dl);
      } else c.appendChild(el('div', 'note', '녹음된 답변이 없습니다 (마이크 꺼짐 또는 건너뜀).'));
      var an = rows.filter(function (r) { return r.q === m.q; })[0];
      if (an) c.appendChild(an.node);
      if (!shownTip[m.part]) { shownTip[m.part] = 1; c.appendChild(el('div', 'tip', '점검 포인트: ' + TIPS[m.part])); }
      list.appendChild(c);
    });
    session = null;
    show('review');
  }

  // ---------- 자동 분석 (참고용, ETS 공식 점수 아님) ----------
  var RESP_SEC = { 1: 45, 2: 45, 3: 30, 4: 30, 5: 15, 6: 15, 7: 30, 8: 15, 9: 15, 10: 30, 11: 60 };
  var CONNECTORS = ['because', 'since', 'for example', 'for instance', 'first', 'firstly', 'second', 'secondly', 'also', 'in addition', 'moreover', 'however', 'therefore', 'so', 'in conclusion', 'that is why', 'for these reasons'];
  var ERRMSG = {
    off: '자동 분석을 끈 상태로 시험을 봤습니다.',
    'not-supported': '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome에서 열어 주세요.',
    network: '음성 인식 서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.',
    'not-allowed': '음성 인식 권한이 거부되었습니다.',
    'service-not-allowed': '이 브라우저에서 음성 인식 서비스를 사용할 수 없습니다. Chrome에서 열어 주세요.',
    'audio-capture': '마이크를 음성 인식에 사용할 수 없었습니다.',
    'start-failed': '음성 인식을 시작하지 못했습니다.'
  };
  // 음성 인식은 숫자를 '20%'처럼 쓰므로 0~99는 영어 단어로 바꿔 지문(twenty percent)과 비교
  var ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
  var TENS = ',,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety'.split(',');
  function numWord(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); }
  function words(t) {
    t = (t || '').toLowerCase().replace(/[’‘]/g, "'").replace(/%/g, ' percent ').replace(/[^a-z0-9' ]+/g, ' ');
    t = t.replace(/\b\d{1,2}\b/g, function (d) { return numWord(parseInt(d, 10)); });
    return t.split(/\s+/).filter(Boolean);
  }
  function has(hay, phrase) { return (' ' + hay + ' ').indexOf(' ' + words(phrase).join(' ') + ' ') >= 0; }
  // 지문 단어 중 내가 읽은 단어 표시 (최장 공통 부분열)
  function matchRef(ref, hyp) {
    var n = ref.length, m = hyp.length, dp = [], i, j;
    for (i = 0; i <= n; i++) { dp.push(new Uint16Array(m + 1)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) dp[i][j] = ref[i] === hyp[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var hit = new Array(n).fill(false); i = 0; j = 0;
    while (i < n && j < m) { if (ref[i] === hyp[j]) { hit[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
    return hit;
  }
  // ---------- 문항별 진단 (ETS 공식 평가 항목에 맞춘 자체 진단) ----------
  // 평가 항목과 척도는 ETS TOEIC Score User Guide – Speaking & Writing (2024) 기준:
  // Q1–10은 0–3점, Q11은 0–5점. 항목별 점수 기준표(루브릭)는 ETS가 공개하지 않아,
  // 아래의 '점검'과 '추정 점수'는 음성 인식 결과로 계산한 자체 기준입니다.
  var CRIT = {
    p1: ['발음', '억양·강세'],
    p2: ['발음', '억양·강세', '문법', '어휘', '일관성(cohesion)'],
    p3: ['발음', '억양·강세', '문법', '어휘', '일관성(cohesion)', '내용 관련성', '내용 완성도'],
    p4: ['발음', '억양·강세', '문법', '어휘', '일관성(cohesion)', '내용 관련성', '내용 완성도'],
    p5: ['발음', '억양·강세', '문법', '어휘', '일관성(cohesion)', '내용 관련성', '내용 완성도']
  };
  var STOP = ' a an the and or but so of to in on at for with from by about as is are am was were be been being do does did have has had i you he she it we they me my your our their this that these those there here what when where who whom which why how often long far much many would could should can will may might must not no yes if then than very just also please tell me us like some any one'.split(' ').reduce(function (o, w) { if (w) o[w] = 1; return o; }, {});
  function contentWords(text) { return words(text).filter(function (w) { return !STOP[w] && w.length > 2; }); }
  function uniq(a) { var o = {}; return a.filter(function (x) { return o[x] ? false : (o[x] = 1); }); }
  function countAny(joined, list) { return list.filter(function (p) { return has(joined, p); }); }
  function wordTarget(sec) { return Math.round(sec * 1.7); }
  var SPEAK_TIP = {
    p2: '30초 동안 멈추지 않는 것이 목표입니다. 장소 → 가장 눈에 띄는 사람 → 다른 사람·사물 → 배경 → 느낌 순서로 말하면 할 말이 떨어지지 않습니다.',
    p3: '첫 문장은 질문을 그대로 바꿔 시작하고(예: “I use public transportation …”), 한 문장을 더 붙여 이유나 구체적인 상황을 말하세요.',
    p4: '표에서 찾은 정보를 단어로만 말하지 말고 완전한 문장으로 말하세요(예: “The meeting starts at 9 a.m. in Room 302.”).',
    p5: '60초를 채우려면 이유 2개와 그중 하나에 대한 구체적인 경험 예시가 필요합니다. 준비 시간 45초에 이유 2개와 예시 1개를 키워드로 정해 두세요.'
  };
  function addCheck(list, crit, label, status, detail, tip) { list.push({ crit: crit, label: label, status: status, detail: detail, tip: tip || '' }); }
  function qtyCheck(list, r, part) {
    var t = wordTarget(r.sec), ratio = r.wc / t;
    r.qtyRatio = ratio;
    addCheck(list, '전달·내용 완성도', '말한 분량', ratio >= 0.8 ? 'ok' : ratio >= 0.5 ? 'mid' : 'bad',
      r.wc + '단어 (답변 시간 ' + r.sec + '초 기준 권장 약 ' + t + '단어)',
      ratio >= 0.8 ? '' : '답변 시간의 상당 부분이 비어 있었습니다. ' + (SPEAK_TIP[part] || ''));
  }
  function vocabCheck(list, r, w) {
    var u = uniq(w.filter(function (x) { return !STOP[x] && x.length > 2; })).length, need = Math.round(r.sec * 0.5);
    addCheck(list, '어휘', '어휘 다양성', u >= need ? 'ok' : u >= need / 2 ? 'mid' : 'bad',
      '서로 다른 내용어(명사·동사·형용사 등) ' + u + '개 (권장 ' + need + '개 이상)',
      u >= need ? '' : '같은 단어를 반복하기보다 비슷한 뜻의 다른 표현을 섞으세요(예: good → helpful, convenient, useful / busy → crowded).');
  }
  function analyze(m, s, tr) {
    var box = el('div', 'analysis'), sec = RESP_SEC[m.q] || 30;
    var r = { q: m.q, part: m.part, node: box, wc: 0, wpm: 0, ok: !tr.error, sec: sec, max: m.q === 11 ? 5 : 3, score: null, checks: [] };
    box.appendChild(el('div', 'ah', 'ETS 평가 항목: ' + CRIT[m.part].join(' · ') + '  (척도 0–' + r.max + '점)'));
    if (!tr.text) {
      if (tr.error) { box.appendChild(el('div', '', ERRMSG[tr.error] || ('음성 인식 오류: ' + tr.error))); return r; }
      r.score = 0;
      box.appendChild(el('div', 'scoreline', '추정 점수: 0 / ' + r.max));
      box.appendChild(el('div', 'miss', '인식된 말이 없습니다. 답변을 하지 않았거나 소리가 너무 작았을 수 있습니다. 실제 시험에서 무응답은 0점입니다. 한 문장이라도 말하는 것이 훨씬 유리합니다.'));
      return r;
    }
    var w = words(tr.text), joined = w.join(' '), L = r.checks;
    r.wc = w.length; r.wpm = Math.round(w.length / sec * 60);

    if (m.part === 'p1') {
      var raw = (m.q === 1 ? s.q1 : s.q2).text, toks = raw.split(/\s+/), ref = toks.map(function (t) { return words(t).join(' '); });
      var refW = ref.filter(Boolean), hit = matchRef(refW, w), k = 0, rd = el('div', 'refmark'), missed = [];
      toks.forEach(function (t, i) {
        var ok = ref[i] ? hit[k++] : true;
        if (!ok) missed.push(t.replace(/[.,!?"]/g, ''));
        rd.appendChild(el('span', ok ? '' : 'miss', t)); rd.appendChild(document.createTextNode(' '));
      });
      var pct = Math.round(hit.filter(Boolean).length / Math.max(1, hit.length) * 100);
      var tail = hit.slice(Math.floor(hit.length * 0.85)), tailPct = tail.filter(Boolean).length / Math.max(1, tail.length);
      r.acc = pct;
      addCheck(L, '발음', '발음 명료성 (음성 인식 일치율)', pct >= 90 ? 'ok' : pct >= 75 ? 'mid' : 'bad',
        '지문과 ' + pct + '% 일치' + (missed.length ? ' · 인식되지 않은 단어: ' + uniq(missed).slice(0, 12).join(', ') : ''),
        pct >= 90 ? '' : '빨간 단어를 사전의 발음 듣기로 확인하고 따라 읽으세요. 특히 r/l, f/p, v/b, th 소리와 단어 강세 위치를 점검하세요.');
      addCheck(L, '발음', '끝까지 읽기', tailPct >= 0.5 ? 'ok' : 'bad',
        tailPct >= 0.5 ? '마지막 부분까지 읽었습니다.' : '지문 마지막 부분이 거의 인식되지 않았습니다(시간 부족이거나 끝을 흐렸을 수 있음).',
        tailPct >= 0.5 ? '' : '45초 안에 끝까지 읽는 것이 우선입니다. 준비 시간에 소리 내어 한 번 읽어 보고, 너무 천천히 읽지 마세요.');
      var lists = raw.match(/[A-Za-z' -]+, [A-Za-z' -]+,? and [A-Za-z' -]+/g) || [];
      var qs = raw.match(/[^.!?]*\?/g) || [];
      var into = [];
      if (lists.length) into.push('나열 “' + lists[0].trim() + '” → 앞 항목은 올리고(↗) 마지막 항목은 내리기(↘)');
      if (qs.length) into.push('의문문 “' + qs[0].trim() + '” → Yes/No 질문은 끝을 올리고(↗), 의문사 질문은 내리기(↘)');
      into.push('쉼표에서 짧게, 마침표에서 길게 쉬기 · 고유명사·숫자·핵심 단어는 힘주어 읽기');
      addCheck(L, '억양·강세', '억양·강세', 'na', '프로그램이 판단할 수 없습니다. 녹음을 들으며 직접 확인하세요: ' + into.join(' / '), '');
      box.appendChild(rd);
    }

    if (m.part === 'p2') {
      qtyCheck(L, r, 'p2');
      var intro = countAny(joined, ['this picture', 'this is a picture', 'this photo', 'this is a photo', 'was taken', 'in this picture', 'in the picture']);
      addCheck(L, '일관성(cohesion)', '도입 문장(장소 소개)', intro.length ? 'ok' : 'mid',
        intro.length ? '“' + intro[0] + '”로 시작했습니다.' : '사진이 어디서 찍혔는지 소개하는 문장이 인식되지 않았습니다.',
        intro.length ? '' : '“This picture was taken at a café / in an office.”처럼 장소로 시작하면 이후 묘사가 자연스럽게 이어집니다.');
      var prog = (joined.match(/\b(is|are|am)( \w+)? \w+ing\b/g) || []).length;
      addCheck(L, '문법', '현재진행형(be + -ing) 사용', prog >= 2 ? 'ok' : prog === 1 ? 'mid' : 'bad', prog + '회 사용',
        prog >= 2 ? '' : '사람의 동작은 “A man is holding a cup.”, “Two women are talking.”처럼 현재진행형으로 묘사하세요.');
      var pos = countAny(joined, ['on the left', 'on the right', 'in the middle', 'in the center', 'in front of', 'behind', 'next to', 'beside', 'in the background', 'in the foreground', 'at the top', 'at the bottom', 'near', 'around']);
      addCheck(L, '어휘', '위치 표현', pos.length >= 2 ? 'ok' : pos.length === 1 ? 'mid' : 'bad', pos.length ? pos.join(', ') : '없음',
        pos.length >= 2 ? '' : '“On the left, …”, “In the background, …”, “next to …” 같은 위치 표현으로 사진 속 대상을 연결하세요.');
      var ppl = countAny(joined, ['man', 'woman', 'men', 'women', 'people', 'person', 'he', 'she', 'they', 'customer', 'customers', 'worker', 'workers']);
      addCheck(L, '내용 관련성', '사람 묘사', ppl.length ? 'ok' : 'bad', ppl.length ? '사람을 묘사했습니다.' : '사람에 대한 묘사가 인식되지 않았습니다.',
        ppl.length ? '' : '사진에서 가장 눈에 띄는 사람이 무엇을 하고 있는지, 옷차림·표정은 어떤지 꼭 말하세요.');
      vocabCheck(L, r, w);
    }

    if (m.part === 'p3' || m.part === 'p4' || m.part === 'p5') {
      var qcw = uniq(contentWords(m.question || '')), used = qcw.filter(function (x) { return w.indexOf(x) >= 0; });
      var rel = qcw.length ? used.length / qcw.length : 1;
      if (m.part !== 'p4') addCheck(L, '내용 관련성', '질문과의 관련성', rel >= 0.4 || used.length >= 2 ? 'ok' : used.length ? 'mid' : 'bad',
        '질문의 핵심 단어 ' + qcw.length + '개 중 ' + used.length + '개 사용' + (used.length ? ' (' + used.join(', ') + ')' : ''),
        rel >= 0.4 || used.length >= 2 ? '' : '질문의 핵심 단어(' + qcw.slice(0, 5).join(', ') + ')를 첫 문장에 넣어 질문에 정확히 답하고 있다는 것을 보여 주세요.');
    }

    if (m.part === 'p3') {
      qtyCheck(L, r, 'p3');
      var q = (m.question || '').toLowerCase();
      if (/\bwhy\b/.test(q)) {
        var why = countAny(joined, ['because', 'since', 'the reason', 'so that', 'that is why', 'that\'s why']);
        addCheck(L, '내용 완성도', '이유 말하기 (질문에 Why 포함)', why.length ? 'ok' : 'bad', why.length ? why.join(', ') + ' 사용' : '이유를 나타내는 말이 인식되지 않았습니다.',
          why.length ? '' : '“Why?”가 있는 질문은 “because …”로 이유를 꼭 붙여야 완성도 점수를 받습니다.');
      }
      if (/how often|how long|when|what time|how far in advance/.test(q)) {
        var tm = countAny(joined, ['every', 'once', 'twice', 'times', 'minutes', 'hours', 'hour', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'ago', 'last', 'usually', 'always', 'sometimes', 'often', 'never', 'morning', 'evening', 'weekend']);
        addCheck(L, '내용 완성도', '시간·빈도 표현', tm.length ? 'ok' : 'bad', tm.length ? tm.slice(0, 5).join(', ') : '시간·빈도를 나타내는 말이 인식되지 않았습니다.',
          tm.length ? '' : '“how often / how long / when” 질문에는 “twice a week”, “about 30 minutes”, “last weekend”처럼 구체적인 시간을 말하세요.');
      }
      var asks = (q.match(/\b(how often|how long|how far|where|when|what|who|which|why|how)\b/g) || []);
      if (uniq(asks).length >= 2) addCheck(L, '내용 완성도', '두 가지를 묻는 질문', 'na', '이 질문은 “' + uniq(asks).join(' + ') + '” 두 가지를 묻습니다. 녹음을 듣고 둘 다 답했는지 확인하세요.', '');
      if (m.q === 7) vocabCheck(L, r, w);
    }

    if (m.part === 'p4') {
      var groups = (s.q8_10 && s.q8_10.keys && s.q8_10.keys[m.q - 8]) || null;
      if (groups) {
        var got = [], miss = [];
        groups.forEach(function (g) { (g.some(function (alt) { return has(joined, alt); }) ? got : miss).push(g[0]); });
        r.keyRatio = got.length / groups.length;
        addCheck(L, '내용 완성도', '표의 핵심 정보', r.keyRatio >= 0.99 ? 'ok' : r.keyRatio >= 0.5 ? 'mid' : 'bad',
          got.length + '/' + groups.length + ' 포함' + (got.length ? ' · 말함: ' + got.join(', ') : '') + (miss.length ? ' · 빠짐: ' + miss.join(', ') : ''),
          miss.length ? '빠진 정보(' + miss.join(', ') + ')를 표에서 찾아 문장에 넣으세요. 질문이 나오기 전 45초 동안 날짜·장소·시간·이름부터 눈에 익혀 두세요.' : '');
      }
      if (m.q === 8) addCheck(L, '문법', '완전한 문장', r.wc >= 8 ? 'ok' : 'mid', r.wc + '단어',
        r.wc >= 8 ? '' : '“Harbor View Hotel, nine.”처럼 단어만 말하지 말고 “It will be held at …, and it starts at ….”처럼 문장으로 답하세요.');
      if (m.q === 9) {
        var cor = countAny(joined, ['actually', 'i\'m afraid', 'i am afraid', 'unfortunately', 'sorry', 'not', 'no', 'that\'s not', 'isn\'t', 'aren\'t', 'don\'t', 'doesn\'t', 'wrong', 'mistake']);
        addCheck(L, '내용 관련성', '잘못된 정보 정정', cor.length ? 'ok' : 'bad', cor.length ? '정정 표현 사용: ' + cor.slice(0, 3).join(', ') : '상대가 잘못 알고 있는 정보를 바로잡는 표현이 인식되지 않았습니다.',
          cor.length ? '' : '9번은 대부분 상대가 잘못 알고 있는 내용을 묻습니다. “Actually, that’s not correct. … is … .” 형식으로 먼저 정정하고 올바른 정보를 말하세요.');
      }
      if (m.q === 10) {
        var org = countAny(joined, ['first', 'second', 'then', 'after that', 'also', 'finally', 'there are two', 'there are three', 'there will be', 'the first', 'the second', 'the last']);
        addCheck(L, '일관성(cohesion)', '정보 정리 표현', org.length >= 2 ? 'ok' : org.length ? 'mid' : 'bad', org.length ? org.join(', ') : '없음',
          org.length >= 2 ? '' : '“There are two sessions. First, … at …. Second, … at ….”처럼 개수를 먼저 말하고 순서대로 정리하세요.');
        qtyCheck(L, r, 'p4');
      }
    }

    if (m.part === 'p5') {
      qtyCheck(L, r, 'p5');
      var op = countAny(joined, ['i agree', 'i disagree', 'i prefer', 'i think', 'in my opinion', 'i believe', 'i would rather', 'i\'d rather', 'i would choose', 'i\'d choose', 'is better', 'it is better']);
      addCheck(L, '내용 관련성', '입장 밝히기', op.length ? 'ok' : 'bad', op.length ? op.slice(0, 2).join(', ') : '내 입장을 밝히는 문장이 인식되지 않았습니다.',
        op.length ? '' : '첫 문장에서 “I agree with the statement.” / “I prefer working in a private office.”처럼 입장을 분명히 말하세요.');
      var rs = countAny(joined, ['because', 'since', 'the reason', 'first', 'firstly', 'second', 'secondly', 'one reason', 'another reason', 'also']);
      addCheck(L, '내용 완성도', '이유 제시', rs.length >= 2 ? 'ok' : rs.length ? 'mid' : 'bad', rs.length ? rs.join(', ') : '없음',
        rs.length >= 2 ? '' : '이유를 2개 말하세요: “First, … . Second, … .” 이유가 하나뿐이면 의견을 충분히 뒷받침하지 못한 것으로 보일 수 있습니다.');
      var ex = countAny(joined, ['for example', 'for instance', 'when i', 'in my case', 'my friend', 'last year', 'last month', 'last week', 'once', 'personally']);
      addCheck(L, '내용 완성도', '구체적 예시', ex.length ? 'ok' : 'bad', ex.length ? ex.join(', ') : '예시가 인식되지 않았습니다.',
        ex.length ? '' : '“For example, when I worked at …, I …”처럼 실제 경험을 하나 넣으면 설득력과 분량이 함께 올라갑니다.');
      var cl = countAny(joined, ['so i', 'therefore', 'that\'s why', 'that is why', 'in conclusion', 'for these reasons', 'to sum up', 'overall']);
      addCheck(L, '일관성(cohesion)', '마무리 문장', cl.length ? 'ok' : 'mid', cl.length ? cl.join(', ') : '없음',
        cl.length ? '' : '마지막에 “That’s why I think … .” / “For these reasons, I … .”로 입장을 한 번 더 말하며 끝내세요.');
      var conn = countAny(joined, CONNECTORS);
      addCheck(L, '일관성(cohesion)', '연결어 사용', conn.length >= 4 ? 'ok' : conn.length >= 2 ? 'mid' : 'bad', conn.length + '개' + (conn.length ? ' (' + conn.join(', ') + ')' : ''),
        conn.length >= 4 ? '' : 'because, for example, in addition, however, that’s why 같은 연결어로 문장을 이어 주세요.');
      vocabCheck(L, r, w);
    }

    if (m.part !== 'p1') {
      addCheck(L, '문법', '문법 정확성', 'na', '프로그램이 판단할 수 없습니다. 녹음을 들으며 확인하세요: 시제(과거 경험은 과거형), 3인칭 단수 -s(He works), 관사(a/the), 복수형(two people), 주어-동사 빠짐 없음.', '');
      addCheck(L, '발음', '발음·억양·전달', 'na', '프로그램이 판단할 수 없습니다. 녹음을 들으며 확인하세요: 긴 멈춤이나 “um, uh”가 잦은지, 문장 끝을 흐리지 않는지, 핵심 단어에 힘을 주는지.', '');
    }

    // 추정 점수: 판단 가능한 점검 결과의 평균으로 계산 (자체 기준)
    var sc = L.filter(function (c) { return c.status !== 'na'; }).map(function (c) { return c.status === 'ok' ? 1 : c.status === 'mid' ? 0.5 : 0; });
    var f = sc.length ? sc.reduce(function (a, b) { return a + b; }, 0) / sc.length : 0;
    r.frac = f;
    r.score = Math.max(1, Math.round(f * r.max));
    // 답이 아주 짧으면 다른 항목이 좋아도 높은 점수를 줄 수 없도록 상한 적용 (자체 기준)
    if (r.qtyRatio != null) {
      if (r.qtyRatio < 0.3) r.score = Math.min(r.score, 1);
      else if (r.qtyRatio < 0.6) r.score = Math.min(r.score, Math.ceil(r.max / 2));
    }

    box.appendChild(el('div', 'scoreline', '추정 점수: ' + r.score + ' / ' + r.max));
    box.appendChild(el('div', 'tr', '인식된 내 답변: “' + tr.text + '”'));
    var tb = document.createElement('table'); tb.className = 'chk';
    L.forEach(function (c) {
      var row = document.createElement('tr');
      row.appendChild(el('td', 'st ' + c.status, { ok: '✓ 좋음', mid: '△ 보통', bad: '✗ 부족', na: '◇ 직접 확인' }[c.status]));
      row.appendChild(el('td', 'cl', c.label));
      row.appendChild(el('td', 'cc', c.crit));
      row.appendChild(el('td', '', c.detail));
      tb.appendChild(row);
    });
    box.appendChild(tb);
    var tips = L.filter(function (c) { return c.tip; });
    if (tips.length) {
      box.appendChild(el('div', 'ah2', '점수를 올리려면'));
      var ul = document.createElement('ul'); ul.className = 'tips';
      tips.forEach(function (c) { ul.appendChild(el('li', '', c.tip)); });
      box.appendChild(ul);
    } else box.appendChild(el('div', 'ok', '프로그램이 확인할 수 있는 항목은 모두 좋았습니다. ‘직접 확인’ 항목을 녹음으로 점검해 보세요.'));
    if (TEMPLATES[m.part]) box.appendChild(el('div', 'tpl', '답변 틀: ' + TEMPLATES[m.part]));
    return r;
  }
  var TEMPLATES = {
    p2: 'This picture was taken at/in ___. The first thing I see is ___. He/She is ___ing ___. On the left/right, ___. In the background, ___. Overall, it looks like ___.',
    p3: '(질문 단어 그대로) I ___ about ___ times a ___. Usually I ___, because ___.',
    p4: 'Q8: It will be held at ___, and it starts at ___. / Q9: Actually, that’s not correct. ___ is ___. / Q10: There are two ___. First, ___ at ___. Second, ___ at ___.',
    p5: 'I agree / I prefer ___ for two reasons. First, ___. For example, ___. Second, ___. That’s why I think ___.'
  };

  // ---------- 추정 레벨 ----------
  // 레벨별 점수 구간·설명은 ETS 공식 자료(TOEIC Speaking & Writing Score Descriptors) 기준
  var LEVELS = [
    { lv: 8, min: 190, range: '190–200', desc: '업무 상황에 맞게 길고 연결된 말을 할 수 있고, 의견·복잡한 요청에도 매우 알아듣기 쉽게 답함' },
    { lv: 7, min: 160, range: '160–180', desc: '업무 상황에 맞게 길고 연결된 말을 할 수 있음. 긴 답변에서 발음·억양·문법의 사소한 실수가 있지만 의미 전달에 지장 없음' },
    { lv: 6, min: 130, range: '130–150', desc: '의견·복잡한 요청에 관련 있는 답은 하지만, 이유나 설명이 듣는 사람에게 분명하지 않은 경우가 많음' },
    { lv: 5, min: 110, range: '110–120', desc: '의견 제시·복잡한 요청에 대한 답이 제한적. 표현이 부정확하거나 반복되고, 긴 멈춤이 있음' },
    { lv: 4, min: 80, range: '80–100', desc: '대체로 의견을 설명하지 못하고, 답이 한 문장이나 단편적인 말에 그침' },
    { lv: 3, min: 60, range: '60–70', desc: '어렵게 의견을 말할 수는 있지만 이유를 들어 뒷받침하지 못함' },
    { lv: 2, min: 40, range: '40–50', desc: '대체로 의견을 말하거나 뒷받침하지 못함' },
    { lv: 1, min: 0, range: '0–30', desc: '시험의 상당 부분에 답하지 못함' }
  ];
  var PART_NAME = { p1: 'Q1–2 지문 읽기', p2: 'Q3–4 사진 묘사', p3: 'Q5–7 질문에 답하기', p4: 'Q8–10 정보 보고 답하기', p5: 'Q11 의견 말하기' };
  // ETS: 상위 난이도 문항이 총점에 더 크게 반영됨 (가중치 수치는 비공개라 자체 설정)
  var PART_W = { p1: 0.15, p2: 0.15, p3: 0.2, p4: 0.2, p5: 0.3 };
  function reportTop(rows, keys) {
    var c = el('div', 'rcard levelcard');
    c.appendChild(el('h3', '', '평가 결과 (ETS 평가 항목 기준 자체 진단 · 공식 점수 아님)'));
    var usable = rows.filter(function (r) { return r.ok; });
    if (!usable.length) {
      c.appendChild(el('div', '', '음성 인식 결과가 없어 평가할 수 없습니다. Chrome에서 인터넷이 연결된 상태로, ‘자동 분석’을 켜고 시험을 봐 주세요.'));
      return c;
    }
    if (usable.every(function (r) { return r.wc === 0; })) c.appendChild(el('div', 'miss', '모든 문항에서 말이 인식되지 않았습니다. 실제로 답을 했다면 음성 인식이 동작하지 않은 것이니 아래 결과는 무시하고, Chrome·인터넷 연결·마이크 권한을 확인한 뒤 다시 보세요.'));
    var by = {};
    usable.forEach(function (r) { (by[r.part] = by[r.part] || []).push(r); });
    var parts = Object.keys(by), pf = {};
    parts.forEach(function (k) { pf[k] = by[k].reduce(function (a, r) { return a + r.score / r.max; }, 0) / by[k].length; });

    if (keys.length === 5) {
      var total = 0; parts.forEach(function (k) { total += pf[k] * PART_W[k]; });
      var unanswered = rows.filter(function (r) { return r.wc === 0; }).length;
      var est = Math.round(total * 200 / 10) * 10;
      var Lv = LEVELS.filter(function (x) { return est >= x.min; })[0];
      if (unanswered > 5) Lv = LEVELS[LEVELS.length - 1];
      var big = el('div', 'levelbig');
      big.appendChild(el('div', 'lvnum', '추정 Level ' + Lv.lv));
      big.appendChild(el('div', 'lvrange', 'ETS 공식 점수 구간 ' + Lv.range + '점에 해당하는 수준'));
      c.appendChild(big);
      c.appendChild(el('div', 'lvdesc', 'ETS 레벨 ' + Lv.lv + ' 설명: ' + Lv.desc));
      var nx = LEVELS.filter(function (x) { return x.lv === Lv.lv + 1; })[0];
      if (nx) c.appendChild(el('div', 'lvdesc', '다음 단계(Level ' + nx.lv + ', ' + nx.range + '점): ' + nx.desc));
    } else c.appendChild(el('div', '', '파트 연습에서는 문항 점수만 보여 줍니다. 최종 레벨은 ‘전체 모의고사(11문항)’를 봐야 나옵니다.'));

    var t = document.createElement('table'); t.className = 'fmt';
    var h = document.createElement('tr'); ['문항', '추정 점수', '단어 수', '부족한 점'].forEach(function (x) { h.appendChild(el('th', '', x)); }); t.appendChild(h);
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      var weak = (r.checks || []).filter(function (x) { return x.status === 'bad' || x.status === 'mid'; }).map(function (x) { return x.label; });
      ['Q' + r.q, r.score == null ? '-' : r.score + ' / ' + r.max, r.wc ? String(r.wc) : '-', r.score === 0 ? '무응답' : (weak.join(', ') || '없음')].forEach(function (x) { tr.appendChild(el('td', '', x)); });
      t.appendChild(tr);
    });
    c.appendChild(t);

    // 우선 고칠 점: 비중이 큰 파트의 '부족' 항목부터
    var pri = [];
    usable.forEach(function (r) {
      if (r.score === 0) pri.push({ w: PART_W[r.part] * 2, text: 'Q' + r.q + ' 무응답 — 한 문장이라도 말하세요. 무응답은 0점입니다.' });
      (r.checks || []).forEach(function (x) { if (x.tip && x.status !== 'ok') pri.push({ w: PART_W[r.part] * (x.status === 'bad' ? 1 : 0.5), text: 'Q' + r.q + ' ' + x.label + ' — ' + x.tip }); });
    });
    pri.sort(function (a, b) { return b.w - a.w; });
    var seen = {}, top = pri.filter(function (p) { var k = p.text.replace(/^Q\d+ /, ''); return seen[k] ? false : (seen[k] = 1); }).slice(0, 5);
    if (top.length) {
      c.appendChild(el('div', 'ah2', '점수를 올리기 위해 먼저 고칠 점 (비중이 큰 문항 순)'));
      var ol = document.createElement('ol'); ol.className = 'tips';
      top.forEach(function (p) { ol.appendChild(el('li', '', p.text)); });
      c.appendChild(ol);
    }
    c.appendChild(el('div', 'note', '평가 항목과 척도는 ETS 공식 기준입니다: Q1–2 발음·억양/강세, Q3–4 여기에 문법·어휘·일관성 추가, Q5–11 여기에 내용 관련성·완성도 추가. Q1–10은 0–3점, Q11은 0–5점이며, ETS는 상위 난이도 문항이 총점에 더 크게 반영된다고 밝히고 있습니다(출처: TOEIC Score User Guide – Speaking & Writing, 2024).'));
    c.appendChild(el('div', 'note', '추정 점수와 레벨은 음성 인식 결과로 계산한 자체 진단입니다. ETS는 문항별 점수 기준표와 200점 환산 방법을 공개하지 않아, 점검 항목·가중치(Q1–2 15%, Q3–4 15%, Q5–7 20%, Q8–10 20%, Q11 30%)는 제가 정한 값입니다. 답변 분량이 권장량의 30% 미만이면 1점, 60% 미만이면 만점의 절반까지로 제한했습니다. 문법 정확성과 발음·억양의 질은 프로그램이 판단할 수 없어 ‘직접 확인’으로 표시했고 점수에 넣지 않았습니다. 그래서 문법 실수가 많으면 실제보다 높게 나올 수 있습니다.'));
    return c;
  }

  // ---------- 마이크 점검 ----------
  function startMeter() {
    var ctx = ensureAudioCtx(); if (!ctx || !micStream) return;
    analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    ctx.createMediaStreamSource(micStream).connect(analyser);
    var data = new Uint8Array(analyser.fftSize);
    (function loop() {
      analyser.getByteTimeDomainData(data);
      var max = 0; for (var i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i] - 128));
      $('meterBar').style.width = Math.min(100, max / 128 * 250) + '%';
      meterRAF = requestAnimationFrame(loop);
    })();
  }
  function stopMeter() { cancelAnimationFrame(meterRAF); $('meterBar').style.width = '0'; }

  // ---------- 이벤트 ----------
  function renderCredits() {
    var c = $('credits'); if (!c) return;
    c.textContent = '사진 출처 (CC BY 2.0): ';
    (window.TSM_PHOTO_CREDITS || []).forEach(function (x, i) {
      if (i) c.appendChild(document.createTextNode(' · '));
      var a = document.createElement('a'); a.href = x.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '“' + x.title + '” by ' + x.author;
      c.appendChild(a);
    });
    c.appendChild(document.createTextNode('. 녹음 음성: Kokoro-82M 음성 합성 모델(Apache 2.0)로 만든 음성입니다.'));
  }
  function init() {
    refreshSets();
    renderCredits();
    loadVoices();
    if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;
    $('rate').oninput = function () { $('rateVal').textContent = this.value; };
    $('btnVoiceTest').onclick = function () {
      var cl = clipFor('TOEIC Speaking Test.');
      if (cl) { if (!player) player = new Audio(); player.src = cl; player.play(); return; }
      if (!ttsAvailable()) { alert('이 브라우저에서 영어 음성(TTS)을 찾지 못했습니다. Chrome 또는 Edge를 권장합니다. 음성이 없으면 질문이 화면에 자막으로 표시됩니다.'); return; }
      speechSynthesis.cancel(); var keep = session; session = null;
      speakOnce('Hello. This is a sound check for the TOEIC Speaking practice test.'); session = keep;
    };
    $('btnMic').onclick = async function () {
      try {
        await getMic(); startMeter();
        $('btnMic').textContent = '마이크 켜짐'; $('btnMic').disabled = true; $('btnRecTest').disabled = false;
        $('micNote').textContent = '마이크가 켜졌습니다. 말을 해 보고 막대가 움직이는지 확인하세요.';
      } catch (e) {
        $('micNote').textContent = '마이크를 켜지 못했습니다: ' + (e && e.message ? e.message : e) + ' — 주소창의 마이크 권한을 허용했는지 확인하세요. (파일을 더블클릭해 열었을 때 막히면 README의 “마이크가 안 될 때”를 참고)';
      }
    };
    $('btnRecTest').onclick = async function () {
      var btn = this; btn.disabled = true; btn.textContent = '녹음 중... 말해 보세요';
      var r = startRecording();
      await new Promise(function (res) { setTimeout(res, 5000); });
      var blob = await r.stop();
      var a = $('recTestAudio'); a.src = URL.createObjectURL(blob); a.classList.remove('hidden'); a.play();
      btn.disabled = false; btn.textContent = '5초 녹음 테스트';
    };
    $('btnStart').onclick = function () { startTest(currentSet(), $('modeSel').value); };
    $('btnSkip').onclick = function () { if (session && session.skip) session.skip(); };
    $('btnExit').onclick = function () {
      if (!confirm('시험을 종료할까요? 지금까지의 녹음은 사라집니다.')) return;
      abortTest(); session = null; show('home'); if (micStream) startMeter();
    };
    $('btnHome').onclick = function () { show('home'); if (micStream) startMeter(); };
    $('btnRetry').onclick = function () { if (lastRun) startTest(lastRun.set, lastRun.mode); };

    $('fileImport').onchange = function () {
      var f = this.files && this.files[0]; if (!f) return;
      var input = this, rd = new FileReader();
      rd.onload = function () {
        var data;
        try { data = JSON.parse(rd.result); } catch (e) { $('importNote').textContent = 'JSON 형식 오류: ' + e.message; return; }
        var arr = Array.isArray(data) ? data : [data], list = loadCustom(), lastId = null;
        for (var i = 0; i < arr.length; i++) {
          var err = validateSet(arr[i]);
          if (err) { $('importNote').textContent = (arr.length > 1 ? (i + 1) + '번째 세트: ' : '') + err; return; }
          arr[i].id = 'custom-' + Date.now() + '-' + i; lastId = arr[i].id; list.push(arr[i]);
        }
        var ok = saveCustom(list);
        if (!ok) { window.BUILTIN_SETS = (window.BUILTIN_SETS || []).concat(arr); }
        refreshSets(lastId);
        $('importNote').textContent = arr.length + '개 세트를 추가했습니다.' + (ok ? '' : ' (브라우저 저장소를 쓸 수 없어 이번 접속에서만 유지됩니다. 이미지가 크면 저장 용량을 넘을 수 있습니다.)');
        input.value = '';
      };
      rd.readAsText(f, 'utf-8');
    };
    $('btnTemplate').onclick = function () {
      var t = {
        title: '내 모의고사 세트 이름',
        q1: { text: 'Q1 지문을 여기에 입력' },
        q2: { text: 'Q2 지문을 여기에 입력' },
        q3: { image: 'images/q3.jpg  (또는 https://... 주소, 또는 data:image/jpeg;base64,...)' },
        q4: { image: 'images/q4.jpg' },
        q5_7: { context: 'Imagine that ... (상황 설명)', questions: ['Q5 질문', 'Q6 질문', 'Q7 질문'] },
        q8_10: {
          info: { title: '표 제목', subtitle: '장소 | 날짜', rows: [['9:00 A.M.', '항목 내용'], ['10:00 A.M.', '항목 내용']], notes: ['하단 메모(선택)'] },
          intro: '전화 건 사람의 첫 말 (선택)',
          questions: ['Q8 질문', 'Q9 질문', 'Q10 질문']
        },
        q11: { text: 'Q11 의견 질문' }
      };
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }));
      a.download = 'toeic-speaking-set-template.json'; document.body.appendChild(a); a.click(); a.remove();
    };
    $('btnDelSet').onclick = function () {
      var id = $('setSel').value;
      if (id.indexOf('builtin') === 0) { $('importNote').textContent = '기본 내장 세트는 삭제할 수 없습니다.'; return; }
      saveCustom(loadCustom().filter(function (s) { return s.id !== id; }));
      window.BUILTIN_SETS = (window.BUILTIN_SETS || []).filter(function (s) { return s.id !== id; });
      refreshSets(); $('importNote').textContent = '삭제했습니다.';
    };
  }
  init();
})();
