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
  // 안드로이드 Chrome에서는 녹음(getUserMedia)과 음성 인식이 동시에 마이크를 쓰면 인식 결과가 비는 사례가 보고됨
  // (공식 문서로 확인된 동작은 아님). 그래서 '인식만' 모드를 두고 안드로이드에서는 기본으로 고름.
  function recMode() { var e = $('recMode'); return e ? e.value : 'both'; }
  function releaseMic() { stopMeter(); if (micStream) { micStream.getTracks().forEach(function (tk) { tk.stop(); }); micStream = null; } }
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
  // 녹음 파일에 목소리 크기의 소리가 있는지 확인 (실패하면 판단 보류 = false)
  async function hasVoice(blob) { return (await voicedSeconds(blob)) >= 1; }
  // 녹음에서 일정 크기 이상의 소리가 난 시간(초). 판단 실패 시 0. 기준값은 자체 설정
  async function voicedSeconds(blob) {
    try {
      var ctx = ensureAudioCtx(); if (!ctx || !blob || !blob.size) return false;
      var buf = await ctx.decodeAudioData(await blob.arrayBuffer());
      var d = buf.getChannelData(0), win = Math.floor(buf.sampleRate * 0.05), loud = 0;
      for (var i = 0; i + win <= d.length; i += win) {
        var s = 0; for (var k = i; k < i + win; k++) s += d[k] * d[k];
        if (Math.sqrt(s / win) > 0.01) loud++;
      }
      return loud * 0.05;
    } catch (e) { return 0; }
  }
  // ---------- 폰 안에서 녹음 파일 인식 (Whisper, transformers.js) ----------
  // 안드로이드처럼 녹음과 실시간 음성 인식을 동시에 못 하는 기기용. 시험이 끝난 뒤 녹음 파일을 기기 안에서 글자로 바꿈.
  // 라이브러리는 jsDelivr, 모델(Xenova/whisper-tiny.en)은 Hugging Face에서 처음 한 번 내려받고, 음성은 기기 밖으로 나가지 않음.
  var TJS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js';
  var ASR_MODEL = 'Xenova/whisper-tiny.en';
  var asrPipe = null;
  async function getAsr(onProg) {
    if (asrPipe) return asrPipe;
    var T = await import(TJS_URL);
    asrPipe = await T.pipeline('automatic-speech-recognition', ASR_MODEL, { progress_callback: onProg });
    return asrPipe;
  }
  async function toPcm16k(blob) {
    var ctx = ensureAudioCtx();
    var buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    var off = new OfflineAudioContext(1, Math.max(1, Math.ceil(buf.duration * 16000)), 16000);
    var src = off.createBufferSource(); src.buffer = buf; src.connect(off.destination); src.start();
    return (await off.startRendering()).getChannelData(0);
  }
  function cleanAsr(text) { return String(text || '').replace(/\[[^\]]*\]|\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim(); }
  async function localRecognize(qs, trs, recs) {
    var skip = false, msg = el('div', 'directions', '녹음한 답변을 폰 안에서 글자로 바꾸는 중입니다...'), sub = el('div', 'note', '');
    var btn = el('button', 'btn', '인식 건너뛰기'); btn.type = 'button'; btn.onclick = function () { skip = true; };
    stage([msg, sub, btn]);
    var files = {}, pipe = null, why = '';
    try {
      pipe = await getAsr(function (p) {
        if (p && p.status === 'progress' && p.file) { files[p.file] = p.progress || 0; }
        var ks = Object.keys(files); if (!ks.length) return;
        var avg = ks.reduce(function (a, k) { return a + files[k]; }, 0) / ks.length;
        sub.textContent = '음성 인식 모델 내려받는 중 ' + Math.round(avg) + '% (처음 한 번만, 수십 MB · 와이파이 권장)';
      });
    } catch (e) { why = '음성 인식 모델을 불러오지 못했습니다(인터넷 연결 확인)'; console.error(e); }
    var todo = qs.filter(function (q) { return trs[q] && trs[q].error === 'local-pending'; });
    for (var i = 0; i < todo.length; i++) {
      var q = todo[i], b = recs[q];
      if (!pipe || skip) { trs[q] = { text: '', error: 'local-fail', msg: (skip ? '인식을 건너뛰었습니다.' : why) + ' 녹음은 아래에서 들을 수 있습니다.' }; continue; }
      if (!b || !b.size) { trs[q] = { text: '', error: null }; continue; }
      sub.textContent = '답변 ' + (i + 1) + ' / ' + todo.length + ' 인식 중 (Question ' + q + ')';
      try {
        if (!(await hasVoice(b))) { trs[q] = { text: '', error: null }; continue; } // 무음에서 생기는 엉뚱한 글자 방지
        var out = await pipe(await toPcm16k(b), { chunk_length_s: 30, stride_length_s: 5 });
        trs[q] = { text: cleanAsr(out && out.text), error: null };
      } catch (e) { console.error(e); trs[q] = { text: '', error: 'local-fail', msg: '이 답변은 폰 안 음성 인식에 실패했습니다. 녹음은 아래에서 들을 수 있습니다.' }; }
    }
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
    // 확정(final) 결과만 모으면, 답변 시간이 끝나 말이 끊긴 마지막 문장이나 인식이 스스로 멈출 때의 문장이
    // 확정되지 못하고 사라질 수 있음. 그래서 중간(interim) 결과도 받아 두었다가 확정되지 않은 채 끝나면 그것을 씀.
    var text = '', interim = '', err = null, active = true, rec = null, ended = null;
    function flushInterim() { if (interim.trim()) text += interim.trim() + ' '; interim = ''; }
    function make() {
      rec = new SR();
      rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
      rec.onresult = function (e) {
        var cur = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
          else cur += e.results[i][0].transcript + ' ';
        }
        interim = cur;
      };
      rec.onerror = function (e) {
        if (e.error !== 'no-speech' && e.error !== 'aborted') err = e.error;
        if (/not-allowed|service-not-allowed|network|language-not-supported/.test(e.error)) active = false;
      };
      // 크롬은 말이 잠시 끊기면 인식을 스스로 멈추므로 답변 시간 동안 다시 켬
      rec.onend = function () {
        flushInterim();
        if (active) { try { make(); } catch (x) { active = false; if (ended) ended(); } }
        else if (ended) ended();
      };
      // 안드로이드: 녹음 중인 마이크 스트림을 음성 인식에 그대로 넘겨 마이크를 두 번 잡지 않게 시도
      // (Web Speech API 표준의 start(MediaStreamTrack). 안드로이드 Chrome 지원 여부는 확인 못 함 → 실패하면 기존 방식)
      var track = /Android/i.test(navigator.userAgent) && micStream && micStream.getAudioTracks()[0];
      if (track) { try { rec.start(track); return; } catch (x) { /* 지원 안 함: 아래 기본 방식 */ } }
      rec.start();
    }
    try { make(); } catch (x) { return { stop: function () { return Promise.resolve({ text: '', error: 'start-failed' }); } }; }
    return {
      stop: function () {
        active = false;
        return new Promise(function (resolve) {
          var t = setTimeout(go, 2500);
          function go() { clearTimeout(t); flushInterim(); resolve({ text: text.trim(), error: text.trim() ? null : err }); }
          ended = go;
          try { rec.stop(); } catch (x) { go(); }
        });
      }
    };
  }
  // 음성 인식은 켜지는 데 시간이 걸려 첫 단어를 놓칠 수 있으므로, 시작 삐 소리 직전에 미리 켬
  function armSR() {
    return recMode() === 'local' && $('analyze').checked ? { stop: function () { return Promise.resolve({ text: '', error: 'local-pending' }); } } : startRecognition();
  }
  async function beepThenRespond(qnum, sec) {
    var pre = armSR();
    try { await beep(); } catch (e) { pre.stop(); throw e; }
    await respond(qnum, sec, pre);
  }
  async function respond(qnum, sec, pre) {
    var r = recMode() === 'sr' ? null : startRecording();
    var sr = pre || armSR();
    setStatus(r ? '<span class="recdot"></span> 녹음 중' : recMode() === 'sr' ? '<span class="recdot"></span> 음성 인식 중 (녹음 안 함)' : '마이크가 꺼져 있어 녹음되지 않습니다');
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
    await beepThenRespond(qnum, resp);
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
      await beepThenRespond(q, times[i]);
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
      await beepThenRespond(q, times[i]);
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
    if (recMode() === 'sr') releaseMic();
    else if (!micStream) { try { await getMic(); } catch (e) { /* 녹음 없이 진행 */ } }
    lastRun = { set: s, mode: mode };
    session = { aborted: false, skip: null, skipped: false, recordings: {}, transcripts: {} };
    $('btnSkip').classList.toggle('hidden', !$('practice').checked);
    show('test');
    try {
      if (recMode() === 'sr') setStatus('음성 인식만 사용 중 (녹음·다시 듣기 없음)');
      else if (!micStream) { setStatus('마이크를 사용할 수 없어 녹음 없이 진행합니다'); }
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
  // 녹음 파일을 기기 안의 Whisper로 다시 인식해 그 문항만 다시 채점 (실시간 인식이 말을 빠뜨렸을 때)
  function reRecognizeBtn(m, s, blob, rows, card) {
    var box = el('span', 'rerec'), btn = el('button', 'btn', '녹음으로 다시 인식'), info = el('span', 'note', '');
    btn.type = 'button'; box.appendChild(btn); box.appendChild(info);
    btn.onclick = async function () {
      var idx = rows.findIndex(function (x) { return x.q === m.q; }), old = rows[idx];
      btn.disabled = true; info.textContent = ' 준비 중...';
      try {
        var files = {};
        var pipe = await getAsr(function (p) {
          if (p && p.status === 'progress' && p.file) files[p.file] = p.progress || 0;
          var ks = Object.keys(files); if (ks.length) info.textContent = ' 인식 모델 내려받는 중 ' + Math.round(ks.reduce(function (a, k) { return a + files[k]; }, 0) / ks.length) + '% (처음 한 번만)';
        });
        info.textContent = ' 인식 중...';
        var out = await pipe(await toPcm16k(blob), { chunk_length_s: 30, stride_length_s: 5 });
        var text = cleanAsr(out && out.text);
        var nr = analyze(m, s, { text: text, error: null, voiced: old && old.voiced, engine: 'whisper', prevText: old ? (old.text || '') : '' });
        if (old && old.node && old.node.parentNode === card) card.replaceChild(nr.node, old.node); else card.appendChild(nr.node);
        if (idx >= 0) rows[idx] = nr; else rows.push(nr);
        info.textContent = text ? ' 다시 인식했습니다.' : ' 다시 인식했지만 글자가 나오지 않았습니다.';
        if (reportRefresh) reportRefresh();
        runGrammar([nr], reportRefresh);
      } catch (e) { console.error(e); info.textContent = ' 다시 인식하지 못했습니다(인터넷 연결 또는 기기 성능 문제).'; }
      btn.disabled = false;
    };
    return box;
  }
  async function finishTest(keys) {
    var recs = session.recordings, s = lastRun.set, list = $('reviewList');
    list.innerHTML = '';
    hideTimer(); stage([el('div', 'directions', '답변을 정리하는 중입니다...')]);
    var trs = {}, qs = Object.keys(session.transcripts);
    for (var i = 0; i < qs.length; i++) trs[qs[i]] = await session.transcripts[qs[i]];
    if (qs.some(function (q) { return trs[q] && trs[q].error === 'local-pending'; })) await localRecognize(qs, trs, session.recordings);
    // 인식 결과가 비었는데 녹음에는 목소리가 있으면 '무응답'이 아니라 '인식 실패'로 처리
    for (var j = 0; j < qs.length; j++) {
      var q = qs[j], tr0 = trs[q];
      if (tr0 && !tr0.text && !tr0.error && session.recordings[q] && await hasVoice(session.recordings[q])) trs[q] = { text: '', error: 'recog-empty' };
      if (trs[q] && session.recordings[q]) trs[q].voiced = await voicedSeconds(session.recordings[q]);
    }
    var shownTip = {}, metas = qMeta(s, keys), rows = [];
    metas.forEach(function (m) { if (trs[m.q]) rows.push(analyze(m, s, trs[m.q])); });
    var top = reportTop(rows, keys); list.appendChild(top);
    reportRefresh = function () { var nt = reportTop(rows, keys); list.replaceChild(nt, top); top = nt; };
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
        if ($('analyze').checked) c.appendChild(reRecognizeBtn(m, s, b, rows, c));
      } else c.appendChild(el('div', 'note', recMode() === 'sr' ? '‘음성 인식만’ 모드라 녹음하지 않았습니다.' : '녹음된 답변이 없습니다 (마이크 꺼짐 또는 건너뜀).'));
      var an = rows.filter(function (r) { return r.q === m.q; })[0];
      if (an) c.appendChild(an.node);
      if (!shownTip[m.part]) { shownTip[m.part] = 1; c.appendChild(el('div', 'tip', '점검 포인트: ' + TIPS[m.part])); }
      list.appendChild(c);
    });
    session = null;
    show('review');
    runGrammar(rows, reportRefresh);
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
    'start-failed': '음성 인식을 시작하지 못했습니다.',
    'recog-empty': '녹음에는 목소리가 있는데 음성 인식 결과가 비어 있습니다. 무응답이 아니라 인식 실패라서 점수에서 뺐습니다. 위의 ‘녹음으로 다시 인식’을 누르면 녹음 파일로 다시 인식해 채점합니다. 안드로이드 폰이라면 다음부터 첫 화면 ‘답변 기록 방식’을 ‘녹음 + 시험 후 폰 안에서 인식’으로 바꿔 보세요.'
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
  function addCheck(list, crit, label, status, detail, tip) { var c = { crit: crit, label: label, status: status, detail: detail, tip: tip || '' }; list.push(c); return c; }
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
    r.voiced = tr.voiced; r.engine = tr.engine; r.prevText = tr.prevText;
    box.appendChild(el('div', 'ah', 'ETS 평가 항목: ' + CRIT[m.part].join(' · ') + '  (척도 0–' + r.max + '점)'));
    if (!tr.text) {
      if (tr.error) { box.appendChild(el('div', '', tr.msg || ERRMSG[tr.error] || ('음성 인식 오류: ' + tr.error))); return r; }
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
      if (gramMode() === 'auto') {
        var gc = addCheck(L, '문법', '문법 정확성 (자동 검사)', 'wait', '문법 검사 중입니다...', '');
        gc.gram = true;
      } else selfCheck(addCheck(L, '문법', '문법 정확성 (자가 채점)', 'self', GRAM_SELF, ''));
      addCheck(L, '발음', '발음·억양·전달', 'na', '프로그램이 판단할 수 없습니다. 녹음을 들으며 확인하세요: 긴 멈춤이나 “um, uh”가 잦은지, 문장 끝을 흐리지 않는지, 핵심 단어에 힘을 주는지.', '');
    }
    r.text = tr.text; r.m = m; r.set = s;
    r.body = el('div'); box.appendChild(r.body);
    renderResult(r);
    return r;
  }
  var GRAM_SELF = '녹음을 듣고 아래 버튼으로 직접 골라 주세요. 점검할 것: 시제(과거 경험은 과거형), 3인칭 단수 -s(He works), 관사(a/the), 복수형(two people), 주어·동사 빠짐 없음.';
  var SELF_TIP = {
    ok: '',
    mid: '녹음에서 틀린 문장을 찾아 바르게 고쳐 3번 소리 내어 말해 보세요. 자주 틀리는 것: 3인칭 단수 -s, 과거형, 관사(a/the), 복수형 -s.',
    bad: '문법이 자주 틀리면 짧고 정확한 문장이 더 유리합니다. 답변 틀(아래)의 문장을 그대로 외워 쓰고, 녹음해서 틀린 곳을 고치는 연습을 반복하세요.'
  };
  function gramMode() { var g = $('gramMode'); return g ? g.value : 'auto'; }
  function selfCheck(c) { c.self = true; c.status = 'self'; c.detail = c.detail || GRAM_SELF; return c; }
  function scoreOf(r) {
    var sc = r.checks.filter(function (c) { return c.status === 'ok' || c.status === 'mid' || c.status === 'bad'; })
      .map(function (c) { return c.status === 'ok' ? 1 : c.status === 'mid' ? 0.5 : 0; });
    var f = sc.length ? sc.reduce(function (a, b) { return a + b; }, 0) / sc.length : 0;
    r.frac = f;
    var score = Math.max(1, Math.round(f * r.max));
    // 답이 아주 짧으면 다른 항목이 좋아도 높은 점수를 줄 수 없도록 상한 적용 (자체 기준)
    if (r.qtyRatio != null) {
      if (r.qtyRatio < 0.3) score = Math.min(score, 1);
      else if (r.qtyRatio < 0.6) score = Math.min(score, Math.ceil(r.max / 2));
    }
    return score;
  }
  // 항목별 해설: 왜 중요한지(ETS 평가 항목과 연결) · 잘했을 때 · 연습법. 연습법은 자체 제안입니다.
  var FB = [
    ['발음 명료성', { why: 'ETS는 Q1–2를 “단어·문장 강세를 포함한 전반적인 알아듣기 쉬움(intelligibility)”으로 채점합니다. 기계가 못 알아들은 단어는 채점관도 알아듣기 어려웠을 가능성이 있습니다.', good: '대부분의 단어가 정확히 인식될 만큼 또렷하게 읽었습니다.', drill: '빨간 단어만 따로 모아 사전 발음 듣기 → 따라 하기 3번 → 그 단어가 든 문장 전체를 다시 읽고 녹음해서 비교하세요.' }],
    ['끝까지 읽기', { why: '읽지 못한 부분은 평가할 내용이 없어 점수를 받을 수 없습니다. 45초는 보통 속도로 읽으면 충분한 시간입니다.', good: '시간 안에 지문을 끝까지 읽었습니다.', drill: '타이머를 45초로 맞추고 소리 내어 읽는 연습을 하세요. 40초 안에 끝나는 속도가 안전합니다.' }],
    ['억양·강세', { why: 'ETS는 억양·강세를 “강조, 쉼, 올리고 내리는 음높이를 쓰는 능력”으로 정의합니다. 같은 발음이라도 단조롭게 읽으면 이 항목에서 낮게 평가될 수 있습니다.', good: '', drill: '지문에 쉼표(/)·끊어 읽기(//)·강조할 단어(밑줄)를 표시하고 그대로 읽어 녹음하세요. 원어민 뉴스나 광고 문장을 따라 읽는 쉐도잉도 효과적입니다.' }],
    ['말한 분량', { why: '답변 시간을 거의 비워 두면 ETS가 보는 “내용 완성도”와 “전달(delivery)” 모두에서 보여 줄 것이 줄어듭니다.', good: '답변 시간에 맞는 분량을 말했습니다.', drill: '같은 질문으로 3번 연속 답해 보세요. 1번째는 그냥, 2번째는 이유를 하나 더, 3번째는 예시를 하나 더 붙여서 말합니다.' }],
    ['도입 문장', { why: '첫 문장으로 장소를 소개하면 이후 묘사가 하나의 흐름으로 이어져 ‘일관성(cohesion)’이 좋아집니다.', good: '장소를 소개하는 문장으로 시작했습니다.', drill: '사진을 볼 때마다 첫 3초 안에 “This picture was taken at/in ___.”를 말하는 습관을 들이세요.' }],
    ['현재진행형', { why: '사진 속 사람의 동작은 현재진행형으로 말하는 것이 문법적으로 자연스럽고, ETS가 보는 ‘문법’ 항목에서 정확성을 보여 줄 수 있습니다.', good: '사람의 동작을 현재진행형으로 묘사했습니다.', drill: '사진 속 사람 3명을 골라 “A man is ___ing ___.” 문장을 하나씩 만들어 말해 보세요.' }],
    ['위치 표현', { why: '위치 표현은 사진 속 대상들을 연결해 듣는 사람이 그림을 떠올리게 해 주므로 ‘어휘’와 ‘일관성’에 함께 도움이 됩니다.', good: '위치 표현으로 대상을 연결했습니다.', drill: 'on the left / on the right / in the middle / in the background / next to 다섯 개를 한 사진에 모두 써서 말해 보세요.' }],
    ['사람 묘사', { why: 'TOEIC 사진 문항은 대부분 사람이 무언가 하는 장면이라, 사람을 빼면 사진의 핵심 내용(관련성)을 놓치게 됩니다.', good: '사람을 묘사했습니다.', drill: '사람 한 명당 동작 → 옷차림 → 표정 순서로 세 문장씩 말하는 연습을 하세요.' }],
    ['어휘 다양성', { why: 'ETS는 Q3부터 ‘어휘’를 평가합니다. 같은 단어만 반복하면 표현 범위가 좁게 들립니다.', good: '다양한 단어를 사용했습니다.', drill: '자주 쓰는 단어(good, nice, many, busy)마다 바꿔 쓸 표현 2개씩을 정리해 외우세요.' }],
    ['질문과의 관련성', { why: 'ETS는 Q5부터 ‘내용 관련성’을 평가합니다. 질문의 단어를 그대로 써서 답하면 질문에 정확히 답하고 있다는 것이 분명해집니다.', good: '질문의 핵심 단어를 사용해 질문에 맞게 답했습니다.', drill: '질문을 듣자마자 주어만 I로 바꿔 첫 문장을 만드는 연습을 하세요(아래 ‘첫 문장 예시’ 참고).' }],
    ['이유 말하기', { why: 'Why가 들어간 질문에 이유를 빼면 질문의 절반에만 답한 것이라 ‘내용 완성도’가 떨어집니다.', good: '질문이 요구한 이유를 말했습니다.', drill: '모든 의견 문장 뒤에 “because ___”를 자동으로 붙이는 연습을 하세요.' }],
    ['시간·빈도 표현', { why: 'how often / how long / when 질문은 구체적인 시간을 말해야 질문에 완전히 답한 것이 됩니다.', good: '시간·빈도를 구체적으로 말했습니다.', drill: 'once a week / twice a month / every day / about 30 minutes / last weekend를 문장에 넣어 말해 보세요.' }],
    ['두 가지를 묻는 질문', { why: '두 가지를 묻는 질문에서 하나만 답하면 ‘내용 완성도’가 떨어집니다.', good: '', drill: '질문을 들을 때 손가락으로 물음의 개수를 세고, 답할 때 그 순서대로 하나씩 답하세요.' }],
    ['표의 핵심 정보', { why: 'Q8–10은 표의 정보를 정확히 전달하는 것이 핵심인 ‘내용 관련성·완성도’ 과제입니다. 정보 하나가 빠지면 답이 불완전해집니다.', good: '질문이 요구한 정보를 모두 말했습니다.', drill: '질문이 나오기 전 45초 동안 날짜·시간·장소·사람 이름·가격에 표시하고, 질문의 의문사(where/when/who)에 맞는 칸을 바로 찾는 연습을 하세요.' }],
    ['완전한 문장', { why: '단어만 나열하면 정보는 맞아도 ‘문법’과 ‘일관성’을 보여 줄 수 없습니다.', good: '정보를 완전한 문장으로 말했습니다.', drill: '“It will be held at ___, and it starts at ___.” 같은 고정 문장 틀을 3개 외워 두고 정보만 바꿔 끼우세요.' }],
    ['잘못된 정보 정정', { why: '상대가 잘못 알고 있는 정보를 바로잡는 것이 이 문항의 과제입니다. 정정하지 않고 정보만 말하면 과제를 반만 수행한 것입니다.', good: '잘못된 정보를 먼저 정정했습니다.', drill: '“Actually, that’s not correct. / I’m sorry, but ___.”로 시작해 올바른 정보를 말하는 연습을 하세요.' }],
    ['정보 정리 표현', { why: '여러 정보를 말할 때 개수를 먼저 말하고 순서대로 정리하면 듣는 사람이 따라가기 쉬워 ‘일관성’이 좋아집니다.', good: '정보를 순서대로 정리해 말했습니다.', drill: '“There are two ___. First, ___. Second, ___.” 틀로 표의 항목을 말해 보세요.' }],
    ['입장 밝히기', { why: 'Q11은 의견을 말하는 과제라, 입장이 분명하지 않으면 이후 이유와 예시가 무엇을 뒷받침하는지 알 수 없습니다.', good: '첫 부분에서 입장을 분명히 밝혔습니다.', drill: '찬반 질문을 보면 5초 안에 한쪽을 고르세요. 어느 쪽이 더 맞는지보다 이유를 말하기 쉬운 쪽이 유리합니다.' }],
    ['이유 제시', { why: 'ETS 레벨 설명에서 높은 레벨과 낮은 레벨을 가르는 기준 중 하나가 의견을 이유로 뒷받침하는지입니다.', good: '이유를 들어 의견을 뒷받침했습니다.', drill: '자주 나오는 주제(일·공부·여가)마다 쓸 수 있는 이유 3개(시간 절약, 돈 절약, 건강·스트레스)를 미리 정해 두세요.' }],
    ['구체적 예시', { why: '예시는 이유를 설득력 있게 만들고, 60초를 채우는 데 가장 효과적인 방법입니다.', good: '구체적인 예시를 들었습니다.', drill: '“For example, when I ___, I ___.” 형식으로 내 경험 3가지(회사·학교·여행)를 미리 준비해 두고 여러 주제에 돌려 쓰세요.' }],
    ['마무리 문장', { why: '마지막에 입장을 다시 말하면 답변 전체가 하나로 묶여 ‘일관성’이 좋아집니다.', good: '입장을 다시 말하며 마무리했습니다.', drill: '답변 시간이 10초 남으면 무조건 “That’s why I think ___.”로 끝내는 습관을 들이세요.' }],
    ['연결어 사용', { why: '연결어는 문장 사이의 관계(이유·예시·대조)를 보여 줘서 ‘일관성’ 평가에 직접 도움이 됩니다.', good: '연결어를 충분히 사용했습니다.', drill: 'first, second, for example, in addition, however, that’s why를 카드에 적어 두고, 답할 때마다 4개 이상 쓰는 연습을 하세요.' }],
    ['문법 정확성', { why: 'ETS는 Q3부터 문법을 “범위와 정확성”으로 평가합니다. 같은 실수가 반복되면 의미 전달에도 영향을 줍니다.', good: '자동 검사에서 문법 지적이 거의 없었습니다.', drill: '지적된 문장을 바르게 고쳐 3번 소리 내어 말하고, 자주 나온 실수(3인칭 -s, 과거형, 관사, 복수형)를 메모해 다음 시험에서 그것만 집중해 확인하세요.' }],
    ['발음·억양·전달', { why: 'ETS는 Q3 이후에도 발음·억양을 계속 평가하고, 전달(delivery)을 “분명하고 매끄러우며 끝까지 일관되게 알아듣기 쉬운지”로 봅니다.', good: '', drill: '녹음을 들으며 2초 넘게 멈춘 곳과 “um, uh”를 세어 보세요. 다음 연습에서 그 숫자를 절반으로 줄이는 것을 목표로 하세요.' }]
  ];
  function fbFor(label) { for (var i = 0; i < FB.length; i++) if (label.indexOf(FB[i][0]) === 0) return FB[i][1]; return {}; }
  function fbLine(parent, head, text, cls) {
    if (!text) return;
    var p = el('div', 'fbl' + (cls ? ' ' + cls : '')); p.appendChild(el('b', '', head + ' ')); p.appendChild(document.createTextNode(text)); parent.appendChild(p);
  }
  var ST_LABEL = { ok: '✓ 좋음', mid: '△ 보통', bad: '✗ 부족', na: '◇ 직접 확인', self: '◇ 자가 채점', wait: '… 검사 중' };
  var reportRefresh = null;
  function renderResult(r) {
    var L = r.checks, b = r.body;
    r.score = scoreOf(r);
    b.innerHTML = '';
    b.appendChild(el('div', 'scoreline', '추정 점수: ' + r.score + ' / ' + r.max));
    b.appendChild(el('div', 'tr', (r.engine === 'whisper' ? '녹음 파일로 다시 인식한 내 답변: “' : '인식된 내 답변: “') + r.text + '”'));
    if (r.prevText != null) b.appendChild(el('div', 'note', '처음 인식 결과: “' + (r.prevText || '(없음)') + '”'));
    if (r.voiced) {
      var rate = r.wc / r.voiced, low = r.voiced >= 3 && rate < 1;
      b.appendChild(el('div', low ? 'qwarn' : 'note', '인식 점검: 목소리가 난 시간 약 ' + r.voiced.toFixed(1) + '초 · 인식된 단어 ' + r.wc + '개 (1초당 ' + rate.toFixed(1) + '단어)' +
        (low ? (r.engine === 'whisper' ? ' → 다시 인식해도 단어가 적습니다. 녹음을 들어 보고, 실제로 말을 적게 했는지 발음이 불분명했는지 확인해 보세요.' : ' → 말한 양에 비해 인식된 단어가 적습니다. 일부가 인식에서 빠졌을 수 있으니 녹음을 들어 보고, 위의 ‘녹음으로 다시 인식’을 눌러 보세요. 점수도 이 때문에 낮게 나왔을 수 있습니다.') : '')));
    }
    var weak = L.filter(function (c) { return c.status === 'bad' || c.status === 'mid'; }).length;
    var good = L.filter(function (c) { return c.status === 'ok'; }).length;
    b.appendChild(el('div', 'fbsum', '잘한 항목 ' + good + '개 · 보완할 항목 ' + weak + '개' + (weak ? ' (빨간색·주황색 항목부터 보세요)' : '')));
    L.forEach(function (c) {
      var f = fbFor(c.label), it = el('div', 'fbitem ' + c.status);
      var hd = el('div', 'fbh'); hd.appendChild(el('span', 'st ' + c.status, ST_LABEL[c.status])); hd.appendChild(el('span', 'cl', c.label)); hd.appendChild(el('span', 'cc', 'ETS 항목: ' + c.crit));
      it.appendChild(hd);
      fbLine(it, '결과', c.detail);
      if (c.errs && c.errs.length) {
        var ul = document.createElement('ul'); ul.className = 'gerr';
        c.errs.forEach(function (x) {
          var li = el('li'); li.appendChild(el('b', '', '“' + x.bad + '”'));
          li.appendChild(document.createTextNode((x.fix ? ' → “' + x.fix + '”' : '') + ' · ' + x.msg));
          ul.appendChild(li);
        });
        it.appendChild(ul);
      }
      if (c.self) {
        var bx = el('div', 'selfbtns');
        [['ok', '✓ 좋음'], ['mid', '△ 보통'], ['bad', '✗ 부족']].forEach(function (o) {
          var btn = el('button', 'btn' + (c.status === o[0] ? ' on' : ''), o[1]);
          btn.type = 'button';
          btn.onclick = function () { c.status = o[0]; c.tip = SELF_TIP[o[0]]; renderResult(r); if (reportRefresh) reportRefresh(); };
          bx.appendChild(btn);
        });
        it.appendChild(bx);
      }
      fbLine(it, '왜 중요한가', f.why);
      if (c.status === 'ok') fbLine(it, '잘한 점', f.good, 'good');
      if (c.tip && c.status !== 'ok') fbLine(it, '고치는 법', c.tip, 'fix');
      if (c.status !== 'ok') fbLine(it, '연습법', f.drill, 'drill');
      b.appendChild(it);
    });
    if (!weak) b.appendChild(el('div', 'ok', '프로그램이 확인할 수 있는 항목은 모두 좋았습니다. ‘직접 확인’ 항목을 녹음으로 점검해 보세요.'));
    var m = r.m || {}, s0 = r.set;
    if (s0 && r.part === 'p3' && s0.q5_7 && s0.q5_7.starters && s0.q5_7.starters[r.q - 5]) b.appendChild(el('div', 'tpl', '이렇게 답해 볼 수 있습니다 (예시): ' + s0.q5_7.starters[r.q - 5]));
    if (s0 && r.part === 'p4' && s0.q8_10 && s0.q8_10.models && s0.q8_10.models[r.q - 8]) b.appendChild(el('div', 'tpl', '모범 답안 예시 (표의 정보 기준): ' + s0.q8_10.models[r.q - 8]));
    if (TEMPLATES[r.part]) b.appendChild(el('div', 'tpl', '답변 틀: ' + TEMPLATES[r.part]));
  }

  // ---------- 자동 문법 검사 (LanguageTool 공개 API) ----------
  // https://dev.languagetool.org/public-http-api : POST /v2/check, IP당 분당 20회·75KB, 요청당 20KB.
  // 시험 한 번에 모든 답변을 묶어 1회만 요청. 음성 인식 결과에는 대문자·문장부호가 없으므로
  // 철자·대소문자·문장부호·문체 항목은 빼고 문법 관련 지적만 셉니다.
  var LT_URL = 'https://api.languagetool.org/v2/check';
  var LT_SKIP = /TYPO|CASING|PUNCTUATION|TYPOGRAPHY|STYLE|WHITESPACE|REDUNDANCY|PLAIN_ENGLISH|WIKIPEDIA/;
  function gramUsable(mt) {
    var cat = (mt.rule && mt.rule.category && mt.rule.category.id) || '', it = (mt.rule && mt.rule.issueType) || '';
    return !LT_SKIP.test(cat) && !/misspelling|typographical|whitespace|style|register/.test(it);
  }
  function gramFail(rows, why, refresh) {
    rows.forEach(function (r) {
      (r.checks || []).forEach(function (c) {
        if (c.gram && c.status === 'wait') { c.label = '문법 정확성 (자가 채점)'; selfCheck(c); c.detail = '자동 문법 검사를 하지 못했습니다(' + why + '). ' + GRAM_SELF; }
      });
      if (r.body) renderResult(r);
    });
    if (refresh) refresh();
  }
  async function runGrammar(rows, refresh) {
    var todo = rows.filter(function (r) { return (r.checks || []).some(function (c) { return c.gram && c.status === 'wait'; }); });
    if (!todo.length) return;
    var text = '', segs = [];
    todo.forEach(function (r) { var t = r.text.trim(); segs.push({ r: r, from: text.length, to: text.length + t.length }); text += t + '\n\n'; });
    var res;
    try {
      var ctl = new AbortController(), tm = setTimeout(function () { ctl.abort(); }, 20000);
      var resp = await fetch(LT_URL, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ text: text, language: 'en-US', motherTongue: 'ko' }).toString() });
      clearTimeout(tm);
      if (!resp.ok) throw new Error(resp.status === 429 ? '요청이 너무 많음, 잠시 후 다시' : '서버 응답 ' + resp.status);
      res = await resp.json();
    } catch (e) { gramFail(todo, e && e.name === 'AbortError' ? '응답 시간 초과' : (e && e.message && /^서버|요청/.test(e.message) ? e.message : '인터넷 연결 또는 서버 접속 실패'), refresh); return; }
    todo.forEach(function (sg, i) {
      var seg = segs[i], r = seg.r, c = r.checks.filter(function (x) { return x.gram; })[0];
      var errs = (res.matches || []).filter(function (mt) { return mt.offset >= seg.from && mt.offset < seg.to && gramUsable(mt); }).map(function (mt) {
        return { bad: text.substr(mt.offset, mt.length), fix: mt.replacements && mt.replacements[0] ? mt.replacements[0].value : '', msg: mt.shortMessage || mt.message || '' };
      });
      var per100 = errs.length / Math.max(1, r.wc) * 100;
      c.errs = errs.slice(0, 8);
      c.status = errs.length === 0 || per100 < 3 ? 'ok' : per100 < 8 ? 'mid' : 'bad';
      if (errs.length === 1 && c.status === 'bad') c.status = 'mid'; // 짧은 답에서 실수 1개로 '부족'이 되지 않도록
      c.detail = errs.length ? '문법 지적 ' + errs.length + '개 (100단어당 ' + per100.toFixed(1) + '개)' + (errs.length > 8 ? ', 앞의 8개만 표시' : '') + '. 음성 인식이 잘못 받아 적어서 생긴 지적일 수도 있으니 녹음과 비교해 보세요.'
        : '자동 검사에서 문법 지적이 없었습니다. 다만 음성 인식이 문장을 다듬어 적었을 수 있으니 녹음도 들어 보세요.';
      c.tip = c.status === 'ok' ? '' : '지적된 표현을 바르게 고쳐 3번 소리 내어 말해 보세요. 같은 실수가 반복되면(예: 3인칭 -s, 과거형) 그 규칙 하나만 집중해서 고치는 것이 가장 빠릅니다.';
      renderResult(r);
    });
    if (refresh) refresh();
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
      c.appendChild(el('div', '', '음성 인식 결과가 없어 평가할 수 없습니다. Chrome에서 인터넷이 연결된 상태로, ‘자동 분석’을 켜고 시험을 봐 주세요. 녹음이 있다면 각 문항의 ‘녹음으로 다시 인식’을 눌러 보세요. 안드로이드 폰이라면 첫 화면 ‘답변 기록 방식’을 ‘녹음 + 시험 후 폰 안에서 인식’으로 바꿔 보세요.'));
      return c;
    }
    if (usable.every(function (r) { return r.wc === 0; })) c.appendChild(el('div', 'miss', '모든 문항에서 말이 인식되지 않았습니다. 실제로 답을 했다면 음성 인식이 동작하지 않은 것이니 아래 결과는 무시하고, Chrome·인터넷 연결·마이크 권한을 확인한 뒤 다시 보세요.'));
    var by = {};
    usable.forEach(function (r) { (by[r.part] = by[r.part] || []).push(r); });
    var parts = Object.keys(by), pf = {};
    parts.forEach(function (k) { pf[k] = by[k].reduce(function (a, r) { return a + r.score / r.max; }, 0) / by[k].length; });

    if (keys.length === 5) {
      var total = 0; parts.forEach(function (k) { total += pf[k] * PART_W[k]; });
      var unanswered = rows.filter(function (r) { return r.ok && r.wc === 0; }).length;
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
    c.appendChild(el('div', 'note', '추정 점수와 레벨은 음성 인식 결과로 계산한 자체 진단입니다. ETS는 문항별 점수 기준표와 200점 환산 방법을 공개하지 않아, 점검 항목·가중치(Q1–2 15%, Q3–4 15%, Q5–7 20%, Q8–10 20%, Q11 30%)는 제가 정한 값입니다. 답변 분량이 권장량의 30% 미만이면 1점, 60% 미만이면 만점의 절반까지로 제한했습니다. 문법 정확성은 자동 검사(LanguageTool) 또는 자가 채점 결과를 점수에 넣습니다. 자동 검사는 음성 인식이 받아 적은 글자를 검사하므로, 인식 오류가 문법 오류로 잡히거나 실제 실수를 놓칠 수 있습니다. 발음·억양의 질은 판단할 수 없어 ‘직접 확인’으로 표시하고 점수에서 뺐습니다. 자가 채점 항목을 고르기 전에는 그 항목도 점수에서 빠집니다.'));
    if (gramMode() === 'auto') {
      var lt = el('div', 'note'); lt.appendChild(document.createTextNode('문법 자동 검사: '));
      var la = document.createElement('a'); la.href = 'https://languagetool.org'; la.target = '_blank'; la.rel = 'noopener'; la.textContent = 'LanguageTool (languagetool.org)';
      lt.appendChild(la); lt.appendChild(document.createTextNode(' 공개 API 사용. 인식된 답변 글자(Q3–11)가 LanguageTool 서버로 전송됩니다.')); c.appendChild(lt);
    }
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
    if (/Android/i.test(navigator.userAgent) && $('recMode')) $('recMode').value = 'local';
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
