// Boss encounter SFX (Jump Gate v2 + Marauder / Mother Core / Garganta gates).
// One shared Web Audio engine on window.BossSFX, so a gate and the fight it opens never double up.
// Clips: the processed pack in assets/sfx/boss (manifest.json if the merged v2+pack manifest is present,
// else manifest_pack.json) + the existing Space Dice clips on R2. Missing ids stay silent and warn once.
// Sound effects: Helton Yan — Pixel Combat (CC BY 4.0).
(function () {
  if (window.BossSFX) return;
  var R2 = 'https://pub-3d18c0cc748f418297166885dea0c707.r2.dev/sfx/', LOCAL = 'assets/sfx/boss/';
  // friendly names for the existing clips (first SFX map, already on R2; their bus gain is baked into the files)
  var EXIST = {
    tonal_click: 'ui_counter_tick', dramatic_finish: 'route_race_won', coin_toss: 'econ_gold_gain', whimsy_coin: 'econ_cargo_gain',
    ship_passby: 'route_travel_beat', coin_spend: 'econ_spend_gold', whoosh: 'card_deal', metallic_click: 'card_flip', bit_sword: 'card_pick',
    denied: 'ui_denied', mecha_repair: 'hull_repair_hull', slot_flash: 'dice_slot_fill_flash', die_hull: 'dice_die_land_hull',
    dice_roll: 'dice_roll_shake', die_land: 'dice_die_land_slot'
  };
  var NOJIT = { encounter_alarm: 1, reveal_marauder: 1, reveal_mothercore: 1, reveal_garganta: 1, boss_warp_in: 1, garganta_bite: 1, boss_death: 1, fleet_defeat: 1 };
  var S = { ac: null, master: null, clips: {}, buf: {}, pend: {}, last: {}, warned: {}, ready: null, muted: false, pre: false };
  var dir = 'mp3'; try { if (new Audio().canPlayType('audio/ogg; codecs="vorbis"')) dir = 'ogg'; } catch (e) {}
  function ac() {
    if (!S.ac) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; S.ac = new AC(); S.master = S.ac.createGain(); S.master.connect(S.ac.destination); }
    if (S.ac.state === 'suspended') S.ac.resume().catch(function () {});
    return S.ac;
  }
  function json(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function fileUrl(f) { return LOCAL + (typeof f === 'string' ? f : (f[dir] || f.ogg || f.mp3)); }
  function load() {
    if (S.ready) return S.ready;
    var BA = window.BreachAudio;
    if (BA) {  // canvas build: every clip lives in a sprite (boss = this pack, main = the shared Space Dice clips)
      (BA.boss.clips || []).forEach(function (c) { S.clips[c.id] = { tier: c.tier, db: c.gain_db || 0, urls: c.files.slice(), sprite: 'boss', loop: !!c.loop }; });
      Object.keys(EXIST).forEach(function (k) { var id = EXIST[k], e = BA.manifest.events[id]; if (e) S.clips[id] = { tier: e.tier, db: 0, urls: (e.ogg || []).map(function (p) { return p.split('/').pop().replace(/\.ogg$/, ''); }), sprite: 'main' }; });
      return (S.ready = Promise.resolve());
    }
    var pack = json(LOCAL + 'manifest.json').catch(function () { return json(LOCAL + 'manifest_pack.json'); }).then(function (m) {
      (m.clips || []).forEach(function (c) { S.clips[c.id] = { tier: c.tier, db: c.gain_db || 0, urls: (c.files || []).map(fileUrl), loop: !!c.loop }; });
    }).catch(function () { console.warn('[boss sfx] no local manifest'); });
    var r2 = json(R2 + 'manifest.json').then(function (m) {
      Object.keys(EXIST).forEach(function (k) { var id = EXIST[k], e = m.events[id]; if (e) S.clips[id] = { tier: e.tier, db: 0, urls: (e[dir] || e.mp3).map(function (p) { return R2 + p; }) }; });
    }).catch(function () { console.warn('[boss sfx] R2 manifest unreachable'); });
    return (S.ready = Promise.all([pack, r2]));
  }
  function get(id, i) {
    var k = id + '#' + i, c = S.clips[id], a = ac(); if (S.buf[k]) return Promise.resolve(S.buf[k]); if (S.pend[k]) return S.pend[k]; if (!a) return Promise.reject();
    return (S.pend[k] = (c.sprite && window.BreachAudio ? window.BreachAudio.clip(c.sprite, c.urls[i]) : fetch(c.urls[i]).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (res, rej) { a.decodeAudioData(b, res, rej); }); }))
      .then(function (b) { S.buf[k] = b; delete S.pend[k]; return b; })
      .catch(function (e) { delete S.pend[k]; throw e; }));
  }
  // round-robin: random file, never the same one twice in a row
  function pick(id) { var n = S.clips[id].urls.length, i; if (n < 2) return 0; do { i = (Math.random() * n) | 0; } while (i === S.last[id]); S.last[id] = i; return i; }
  // play(name, { delay ms, db, vol, pitch, semi, jitter:false, loop:true }) → handle; handle.stop(fadeMs) fades it out (and cancels one still loading)
  function play(name, o) {
    o = o || {}; var h = { done: false, src: null, g: null, stop: function (ms) { h.done = true; halt(h, ms); } };
    if (S.muted) return h; var a = ac(); if (!a) return h; var t0 = performance.now();
    load().then(function () {
      var id = EXIST[name] || name, c = S.clips[id];
      if (!c || !c.urls.length) { if (!S.warned[id]) { S.warned[id] = 1; console.warn('[boss sfx] missing clip: ' + id); } return; }
      get(id, pick(id)).then(function (buf) {
        if (S.muted || h.done) return;
        var jit = c.tier === 'combat' && !NOJIT[id] && o.jitter !== false, src = a.createBufferSource(), g = a.createGain();
        var late = (performance.now() - t0) / 1000, rate = (o.pitch || 1) * Math.pow(2, (o.semi || 0) / 12) * (jit ? 0.96 + Math.random() * 0.08 : 1);
        src.buffer = buf; src.playbackRate.value = rate; src.loop = !!o.loop;
        g.gain.value = Math.pow(10, (c.db + (o.db || 0) + (jit ? Math.random() * 3 - 1.5 : 0)) / 20) * (o.vol == null ? 1 : o.vol);
        src.connect(g); g.connect(S.master); src.start(a.currentTime + Math.max(0, (o.delay || 0) / 1000 - late)); h.src = src; h.g = g;
      }).catch(function () {});
    });
    return h;
  }
  function halt(h, ms) {
    if (!h.src || !S.ac) return; var t = S.ac.currentTime, d = Math.max(0.01, (ms == null ? 120 : ms) / 1000);
    try { h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + d); h.src.stop(t + d + 0.02); } catch (e) {}
  }
  function preload() {
    if (S.pre) return; S.pre = true; ac();
    if (window.BreachAudio) { window.BreachAudio.decode('main').catch(function () {}); window.BreachAudio.decode('boss').catch(function () {}); return; }
    load().then(function () {
      var jobs = []; Object.keys(S.clips).forEach(function (id) { S.clips[id].urls.forEach(function (_, i) { jobs.push([id, i]); }); });
      var n = 0; function work() { if (n >= jobs.length) return Promise.resolve(); var j = jobs[n++]; return get(j[0], j[1]).catch(function () {}).then(work); }
      for (var w = 0; w < 6; w++) work();
    });
  }
  function unlock() { ac(); preload(); }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { capture: true, passive: true }); });
  load();
  window.BossSFX = { play: play, preload: preload, setMuted: function (m) { S.muted = !!m; if (S.master) S.master.gain.value = m ? 0 : 1; }, _s: S };
})();
