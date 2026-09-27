/* ═══════════════════════════════════════════
   MyCoach — Application Logic v5
   Auth Gate (FG007) · Deselect / Undo · Confetti & Micro-Interactions
   Clean Direct-Touch UI (No Floating Input Bar)
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ──────────────────────────────────────────
  // Constants & Auth Configuration
  // ──────────────────────────────────────────
  const GRACE_MINUTES = 10;
  const STORAGE_KEY = 'mycoach_v5';
  const AUTH_KEY = 'mycoach_auth_v5';

  const AUTH_CREDENTIALS = {
    username: 'FG007',
    password: 'fg007',
  };

  // Base routine KRs (always present)
  const BASE_KRS = [
    { id: 'kr1', name: 'Wake Up',            planned: '07:00', icon: '🌅' },
    { id: 'kr2', name: 'Breakfast',          planned: '08:30', icon: '🍳' },
    { id: 'kr_gym', name: 'Gym / Workout',   planned: '16:00', end: '5:00 PM', icon: '🏋️' },
    { id: 'kr6', name: 'Evening Study',      planned: '19:00', icon: '📖' },
    { id: 'kr7', name: 'Sleep / Lights Out', planned: '23:00', icon: '🌙' },
  ];

  // Recurring Gym days: Saturday(6), Sunday(0), Monday(1), Tuesday(2), Thursday(4)
  const GYM_DAYS = [6, 0, 1, 2, 4];

  // Class Schedules by day of week:
  // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  const CLASS_SCHEDULE = {
    0: { // Sunday — Morning
      sessionName: 'Morning Session',
      leaveTime: '09:00',
      lunchTime: '13:00',
      classes: [
        { id: 'cls_bus101', name: 'BUS-101 Class', planned: '10:00', end: '11:20 AM', room: 'NA-1105', icon: '📚' },
        { id: 'cls_cse102', name: 'CSE-102 Class', planned: '11:30', end: '12:50 PM', room: '1105',    icon: '💻' },
      ],
    },
    1: { // Monday — Morning
      sessionName: 'Morning Session',
      leaveTime: '09:00',
      lunchTime: '13:00',
      classes: [
        { id: 'cls_bus101', name: 'BUS-101 Class', planned: '10:00', end: '11:20 AM', room: 'NA-1105', icon: '📚' },
        { id: 'cls_cse102', name: 'CSE-102 Class', planned: '11:30', end: '12:50 PM', room: '1105',    icon: '💻' },
      ],
    },
    3: { // Wednesday — Afternoon
      sessionName: 'Afternoon Session',
      leaveTime: '12:00',
      lunchTime: '11:30',
      classes: [
        { id: 'cls_ppd103', name: 'PPD-103 Class', planned: '13:00', end: '2:20 PM', room: '1105', icon: '📝' },
        { id: 'cls_mat104', name: 'MAT-104 Class', planned: '14:30', end: '3:50 PM', room: '1105', icon: '🧮' },
      ],
    },
    4: { // Thursday — Afternoon
      sessionName: 'Afternoon Session',
      leaveTime: '12:00',
      lunchTime: '11:30',
      classes: [
        { id: 'cls_ppd103', name: 'PPD-103 Class', planned: '13:00', end: '2:20 PM', room: '1105', icon: '📝' },
        { id: 'cls_mat104', name: 'MAT-104 Class', planned: '14:30', end: '3:50 PM', room: '1105', icon: '🧮' },
      ],
    },
  };

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const ENCOURAGE = [
    "Consistency is the true foundation of greatness. Keep it up! 👑",
    "Small daily wins compound into massive long-term success! 💪",
    "Focus on progress, not absolute perfection. You're building solid discipline! 🚀",
    "Every timely check-in strengthens your habit loop. Outstanding work! ✨",
    "Discipline is simply choosing what you want most over what you want right now. 🌟",
    "One disciplined day at a time — you have total control! 🏆",
    "Stay locked in. Tomorrow will be even smoother! 🌱",
  ];

  // ──────────────────────────────────────────
  // Interactive Celebration Confetti Engine
  // ──────────────────────────────────────────
  let confettiParticles = [];
  const canvas = document.getElementById('celebrationCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  function resizeCanvas() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerCelebration(originX, originY, isGrand) {
    if (!ctx) return;
    const count = isGrand ? 120 : 35;
    const startX = originX || window.innerWidth / 2;
    const startY = originY || window.innerHeight / 3;
    const colors = ['#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#3b82f6', '#fbbf24'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const velocity = isGrand ? 6 + Math.random() * 8 : 3 + Math.random() * 5;
      confettiParticles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (isGrand ? 4 : 2),
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: Math.random() * 0.015 + 0.015,
      });
    }

    if (confettiParticles.length === count) {
      requestAnimationFrame(renderConfetti);
    }
  }

  function renderConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // Gravity
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    }

    if (confettiParticles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ──────────────────────────────────────────
  // State Management & Persistence
  // ──────────────────────────────────────────
  let state = loadState();
  let currentUser = checkAuth();

  function freshState() {
    return {
      days: {},
      reports: [],
      customKRs: [],
      krOverrides: {},
      streak: 0,
      lastActiveDate: null,
    };
  }

  function loadState() {
    try {
      const v4 = localStorage.getItem('routinecoach_v4') || localStorage.getItem('routinecoach_v3');
      const v5 = localStorage.getItem(STORAGE_KEY);
      const raw = v5 || v4;
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          if (!s.days) s.days = {};
          if (!s.reports) s.reports = [];
          if (!s.customKRs) s.customKRs = [];
          if (!s.krOverrides) s.krOverrides = {};
          if (typeof s.streak !== 'number') s.streak = 0;
          return s;
        }
      }
    } catch (e) {
      console.warn('Error loading state:', e);
    }
    return freshState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  function todayKey() {
    return dateToKey(new Date());
  }

  function dateToKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function todayEntries() {
    const key = todayKey();
    if (!state.days[key]) {
      state.days[key] = { entries: [] };
    }
    return state.days[key].entries;
  }

  // ──────────────────────────────────────────
  // Authentication & Session Guard
  // ──────────────────────────────────────────
  function checkAuth() {
    try {
      const oldAuth = localStorage.getItem('routinecoach_auth_v4');
      const stored = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY) || oldAuth;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username && parsed.username.toUpperCase() === AUTH_CREDENTIALS.username.toUpperCase()) {
          return parsed;
        }
      }
    } catch (_) {}
    return null;
  }

  function initAuthUI() {
    const overlay = document.getElementById('authOverlay');
    const form = document.getElementById('loginForm');
    const userInp = document.getElementById('loginUser');
    const passInp = document.getElementById('loginPass');
    const remChk = document.getElementById('rememberMe');
    const errEl = document.getElementById('authError');

    if (!currentUser) {
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
      updateProfileUI(currentUser.username);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredUser = userInp.value.trim();
      const enteredPass = passInp.value;

      if (enteredUser.toUpperCase() === AUTH_CREDENTIALS.username.toUpperCase() && enteredPass === AUTH_CREDENTIALS.password) {
        const authData = {
          username: AUTH_CREDENTIALS.username,
          loggedInAt: Date.now(),
        };

        if (remChk.checked) {
          localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        } else {
          sessionStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        }

        currentUser = authData;
        errEl.classList.remove('visible');
        overlay.classList.remove('visible');
        updateProfileUI(authData.username);
        triggerCelebration(window.innerWidth / 2, window.innerHeight / 2, true);
        showToast(`👋 Welcome back, Agent ${authData.username}!`);
      } else {
        errEl.textContent = '❌ Invalid credentials. Username: FG007 | Password: fg007';
        errEl.classList.add('visible');
        userInp.focus();
      }
    });

    // Profile Dropdown Toggle
    const profileBtn = document.getElementById('userProfileBtn');
    const profileMenu = document.getElementById('userProfileMenu');

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('open');
      updateDropdownStats();
    });

    document.addEventListener('click', (e) => {
      if (!profileMenu.contains(e.target)) {
        profileMenu.classList.remove('open');
      }
    });

    // Profile Action Buttons
    const btnStatus = document.getElementById('btnProfileStatus');
    if (btnStatus) {
      btnStatus.addEventListener('click', () => {
        profileMenu.classList.remove('open');
        cmdStatus();
      });
    }

    const btnSummary = document.getElementById('btnProfileSummary');
    if (btnSummary) {
      btnSummary.addEventListener('click', () => {
        profileMenu.classList.remove('open');
        cmdSummary();
      });
    }

    const btnWeekly = document.getElementById('btnProfileWeekly');
    if (btnWeekly) {
      btnWeekly.addEventListener('click', () => {
        profileMenu.classList.remove('open');
        cmdWeekly();
      });
    }

    const btnReset = document.getElementById('btnProfileReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        profileMenu.classList.remove('open');
        cmdResetToday();
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
        currentUser = null;
        profileMenu.classList.remove('open');
        overlay.classList.add('visible');
        passInp.value = '';
        showToast('🔒 Logged out successfully.');
      });
    }
  }

  function updateProfileUI(username) {
    const initials = username.slice(0, 2).toUpperCase();
    const hAvatar = document.getElementById('headerAvatar');
    const hUser = document.getElementById('headerUsername');
    const dAvatar = document.getElementById('dropdownAvatar');
    const dUser = document.getElementById('dropdownUsername');

    if (hAvatar) hAvatar.textContent = initials;
    if (hUser) hUser.textContent = username;
    if (dAvatar) dAvatar.textContent = initials;
    if (dUser) dUser.textContent = username;

    updateDropdownStats();
  }

  function updateDropdownStats() {
    const streak = computeStreak();
    const entries = todayEntries();
    const { score } = computeScore(entries);
    const reportsCount = state.reports ? state.reports.length : 0;

    const streakEl = document.getElementById('udStreak');
    const scoreEl = document.getElementById('udScore');
    const repEl = document.getElementById('udReports');

    if (streakEl) streakEl.textContent = `${streak}d`;
    if (scoreEl) scoreEl.textContent = `${(score * 100).toFixed(0)}%`;
    if (repEl) repEl.textContent = `${reportsCount}`;
  }

  // ──────────────────────────────────────────
  // Effective Day-Aware Routine Generator
  // ──────────────────────────────────────────
  function getEffectiveKRs(date) {
    const d = date || new Date();
    const dow = d.getDay();
    const schedule = CLASS_SCHEDULE[dow];
    const list = [];

    // 1. Wake Up
    list.push(findBaseKR('kr1'));

    // 2. Breakfast
    list.push(findBaseKR('kr2'));

    // 3. Classes and Lunch based on University Day
    if (schedule) {
      list.push({
        id: 'kr3',
        name: 'Leave Home / Reach University',
        planned: schedule.leaveTime,
        icon: '🏫',
      });

      const lunchKR = {
        id: 'kr5',
        name: 'Lunch',
        planned: schedule.lunchTime,
        icon: '🍽️',
      };

      if (timeToMinutes(schedule.lunchTime) < timeToMinutes(schedule.classes[0].planned)) {
        list.push(lunchKR);
        schedule.classes.forEach(c => list.push({ ...c }));
      } else {
        schedule.classes.forEach(c => list.push({ ...c }));
        list.push(lunchKR);
      }
    } else {
      list.push({
        id: 'kr5',
        name: 'Lunch',
        planned: '13:00',
        icon: '🍽️',
      });
    }

    // 4. Gym / Workout on Saturday, Sunday, Monday, Tuesday, Thursday (4:00 PM – 5:00 PM)
    if (GYM_DAYS.includes(dow)) {
      list.push(findBaseKR('kr_gym'));
    }

    // 5. Evening Study & Sleep
    list.push(findBaseKR('kr6'));
    list.push(findBaseKR('kr7'));

    // 5. Custom user KRs
    if (state.customKRs && state.customKRs.length > 0) {
      state.customKRs.forEach(c => list.push({ ...c, isCustom: true }));
    }

    // Chronologically sort all routine activities by planned time
    list.sort((a, b) => timeToMinutes(a.planned) - timeToMinutes(b.planned));

    return list;
  }

  function findBaseKR(id) {
    const base = BASE_KRS.find(k => k.id === id);
    if (!base) return { id, name: id, planned: '12:00', icon: '📌' };
    if (state.krOverrides && state.krOverrides[id]) {
      return { ...base, planned: state.krOverrides[id] };
    }
    return { ...base };
  }

  // ──────────────────────────────────────────
  // Time Utilities
  // ──────────────────────────────────────────
  function nowHHMM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function timeToMinutes(hhmm) {
    if (!hhmm) return 0;
    const parts = hhmm.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function formatTime12(hhmm) {
    if (!hhmm) return '—';
    const [hStr, mStr] = hhmm.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // ──────────────────────────────────────────
  // Check-In & Deselect Engine
  // ──────────────────────────────────────────
  function logCheckin(kr, actualTime, skipped, clickCoords) {
    const entries = todayEntries();
    const idx = entries.findIndex(e => e.krId === kr.id);
    if (idx >= 0) entries.splice(idx, 1);

    let status, delay = 0;

    if (skipped) {
      status = 'skipped';
      delay = null;
    } else if (!kr.planned) {
      status = 'ok';
      delay = 0;
    } else {
      const plannedMin = timeToMinutes(kr.planned);
      const actualMin = timeToMinutes(actualTime);
      delay = actualMin - plannedMin;
      status = delay <= GRACE_MINUTES ? 'ok' : 'late';
    }

    entries.push({
      krId: kr.id,
      krName: kr.name,
      icon: kr.icon,
      actual: skipped ? null : actualTime,
      planned: kr.planned,
      status,
      delay,
      timestamp: Date.now(),
    });

    saveState();
    renderAll();

    // Check if 100% complete
    const effective = getEffectiveKRs();
    if (entries.length === effective.length) {
      triggerCelebration(window.innerWidth / 2, window.innerHeight / 3, true);
      showToast(`🎉 Outstanding! All ${effective.length} daily habits completed today!`);
    } else if (status === 'ok') {
      const x = clickCoords ? clickCoords.x : window.innerWidth / 2;
      const y = clickCoords ? clickCoords.y : window.innerHeight / 2;
      triggerCelebration(x, y, false);
      const extra = kr.planned && delay > 0 ? ` (+${delay}m grace)` : '';
      showToast(`Noted ✅ ${kr.name} — On Time${extra}!`);
    } else if (status === 'late') {
      showToast(`Noted 🔴 ${kr.name} — ${delay} min late.`);
    } else {
      showToast(`Noted ⏭️ ${kr.name} — marked skipped.`);
    }

    return { status, delay, kr };
  }

  function logDeselect(kr) {
    const entries = todayEntries();
    const idx = entries.findIndex(e => e.krId === kr.id);
    if (idx >= 0) {
      entries.splice(idx, 1);
      saveState();
      renderAll();
      showToast(`↺ Deselected ${kr.name} — set back to Pending.`);
      return true;
    }
    return false;
  }

  function addCustomTask(name, planned, icon) {
    if (!name || !planned) return false;
    if (!state.customKRs) state.customKRs = [];
    const id = 'custom_' + Date.now();
    state.customKRs.push({
      id,
      name: name.trim(),
      planned: planned.trim(),
      icon: icon || '🎯',
      isCustom: true,
    });
    saveState();
    renderAll();
    triggerCelebration(window.innerWidth / 2, window.innerHeight / 2, false);
    showToast(`✨ Added new activity "${name.trim()}" at ${formatTime12(planned)}!`);
    return true;
  }

  function deleteCustomTask(id) {
    if (!state.customKRs) return;
    const task = state.customKRs.find(k => k.id === id);
    state.customKRs = state.customKRs.filter(k => k.id !== id);
    // Also remove from today's entries if logged
    const entries = todayEntries();
    const idx = entries.findIndex(e => e.krId === id);
    if (idx >= 0) entries.splice(idx, 1);
    saveState();
    renderAll();
    showToast(`🗑️ Removed "${task ? task.name : 'task'}" from routine.`);
  }

  function computeScore(entries, date) {
    const krs = getEffectiveKRs(date);
    const total = krs.length;
    if (!entries || entries.length === 0) {
      return { ok: 0, late: 0, skipped: 0, logged: 0, total, score: 0 };
    }

    const ok = entries.filter(e => e.status === 'ok').length;
    const late = entries.filter(e => e.status === 'late').length;
    const skipped = entries.filter(e => e.status === 'skipped').length;
    const logged = entries.length;
    const score = total > 0 ? ok / total : 0;

    return { ok, late, skipped, logged, total, score };
  }

  function computeStreak() {
    const days = Object.keys(state.days).sort().reverse();
    let streak = 0;
    const today = todayKey();

    for (const day of days) {
      if (day > today) continue;
      const entries = state.days[day]?.entries || [];
      const dayDate = new Date(day + 'T12:00:00');
      const { ok, total } = computeScore(entries, dayDate);

      if (ok === total && total > 0 && entries.length === total) {
        streak++;
      } else if (day === today) {
        continue;
      } else {
        break;
      }
    }

    state.streak = streak;
    return streak;
  }

  // ──────────────────────────────────────────
  // Report Generation & Archiving
  // ──────────────────────────────────────────
  function generateReport(dateKey, isSnapshotOnly) {
    const key = dateKey || todayKey();
    const dayData = state.days[key] || { entries: [] };
    const date = new Date(key + 'T12:00:00');
    const dow = date.getDay();
    const schedule = CLASS_SCHEDULE[dow];
    const entries = dayData.entries || [];
    const score = computeScore(entries, date);

    let classAttendance = null;
    if (schedule && schedule.classes) {
      classAttendance = schedule.classes.map(c => {
        const entry = entries.find(e => e.krId === c.id);
        let status = 'missed';
        if (entry) {
          status = entry.status;
        }
        return {
          id: c.id,
          name: c.name,
          icon: c.icon,
          planned: c.planned,
          room: c.room,
          end: c.end,
          attended: entry ? entry.status !== 'skipped' : false,
          status,
          actual: entry ? entry.actual : null,
          delay: entry ? entry.delay : null,
        };
      });
    }

    const report = {
      date: key,
      dayName: DAY_NAMES[dow],
      dayOfWeek: dow,
      entries: JSON.parse(JSON.stringify(entries)),
      score,
      classAttendance,
      generatedAt: nowHHMM(),
    };

    if (!isSnapshotOnly) {
      state.reports = state.reports.filter(r => r.date !== key);
      state.reports.unshift(report);
      if (state.reports.length > 90) state.reports = state.reports.slice(0, 90);
      saveState();
    }

    return report;
  }

  function saveTodayReport() {
    const report = generateReport(todayKey(), false);
    renderReports();
    renderHeader();
    triggerCelebration(window.innerWidth / 2, window.innerHeight / 2, true);
    showToast('📊 Today\'s report saved to Daily Reports archive!');
    return report;
  }

  function performDailyReset(dateKey) {
    const key = dateKey || todayKey();
    generateReport(key, false);
    if (state.days[key]) {
      state.days[key].entries = [];
    }
    saveState();
  }

  function deleteReport(date) {
    state.reports = state.reports.filter(r => r.date !== date);
    saveState();
    renderReports();
    showToast('🗑️ Report deleted from archives.');
  }

  function loadDemoReports() {
    const now = new Date();
    const d1 = new Date(now);
    d1.setDate(d1.getDate() - 1);
    const key1 = dateToKey(d1);

    const d2 = new Date(now);
    d2.setDate(d2.getDate() - 2);
    const key2 = dateToKey(d2);

    const r1KRs = getEffectiveKRs(d1);
    const r1Entries = r1KRs.map((k, i) => ({
      krId: k.id,
      krName: k.name,
      icon: k.icon,
      planned: k.planned,
      actual: i === 2 ? '09:20' : k.planned,
      status: i === 2 ? 'late' : (i === 4 ? 'skipped' : 'ok'),
      delay: i === 2 ? 20 : (i === 4 ? null : 0),
    }));

    const r2KRs = getEffectiveKRs(d2);
    const r2Entries = r2KRs.map(k => ({
      krId: k.id,
      krName: k.name,
      icon: k.icon,
      planned: k.planned,
      actual: k.planned,
      status: 'ok',
      delay: 0,
    }));

    const report1 = {
      date: key1,
      dayName: DAY_NAMES[d1.getDay()],
      dayOfWeek: d1.getDay(),
      entries: r1Entries,
      score: computeScore(r1Entries, d1),
      classAttendance: CLASS_SCHEDULE[d1.getDay()] ? CLASS_SCHEDULE[d1.getDay()].classes.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        planned: c.planned,
        room: c.room,
        end: c.end,
        attended: true,
        status: 'ok',
        actual: c.planned,
        delay: 0,
      })) : null,
      generatedAt: '23:59',
    };

    const report2 = {
      date: key2,
      dayName: DAY_NAMES[d2.getDay()],
      dayOfWeek: d2.getDay(),
      entries: r2Entries,
      score: computeScore(r2Entries, d2),
      classAttendance: CLASS_SCHEDULE[d2.getDay()] ? CLASS_SCHEDULE[d2.getDay()].classes.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        planned: c.planned,
        room: c.room,
        end: c.end,
        attended: true,
        status: 'ok',
        actual: c.planned,
        delay: 0,
      })) : null,
      generatedAt: '23:59',
    };

    state.reports = state.reports.filter(r => r.date !== key1 && r.date !== key2);
    state.reports.unshift(report1, report2);
    saveState();
    renderReports();
    triggerCelebration(window.innerWidth / 2, window.innerHeight / 2, false);
    showToast('✨ 2 sample past reports loaded for demonstration!');
  }

  // ──────────────────────────────────────────
  // Auto-Reset at 11:59 PM Watchdog
  // ──────────────────────────────────────────
  function setupAutoReset() {
    setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      const clockEl = document.getElementById('liveClock');
      if (clockEl) {
        clockEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }

      if (h === 23 && m === 59) {
        const today = todayKey();
        if (!state.reports.find(r => r.date === today)) {
          performDailyReset(today);
          renderAll();
          showToast('🌙 11:59 PM: Daily report generated & tasks refreshed for tomorrow!');
        }
      }
    }, 1000);
  }

  function checkDayChange() {
    const today = todayKey();
    if (state.lastActiveDate && state.lastActiveDate !== today) {
      if (!state.reports.find(r => r.date === state.lastActiveDate)) {
        const oldEntries = state.days[state.lastActiveDate]?.entries || [];
        if (oldEntries.length > 0) {
          generateReport(state.lastActiveDate, false);
        }
      }
    }
    state.lastActiveDate = today;
    saveState();
  }

  // ──────────────────────────────────────────
  // Command Dialogs & Summaries
  // ──────────────────────────────────────────
  function cmdStatus() {
    const entries = todayEntries();
    const { ok, late, skipped, total, score } = computeScore(entries);
    const effectiveKRs = getEffectiveKRs();
    const loggedIds = new Set(entries.map(e => e.krId));
    const remaining = effectiveKRs.filter(k => !loggedIds.has(k.id));

    let html = `<h3>📊 Today's Routine Status</h3>`;
    html += statLine('Daily OKR Score', (score * 100).toFixed(0) + `% (${score.toFixed(2)})`, 'var(--accent-light)');
    html += statLine('Completed', `${entries.length} of ${total} tasks`, 'var(--text-primary)');
    html += statLine('On-Time', `✅ ${ok}`, 'var(--ok)');
    html += statLine('Late', `🔴 ${late}`, 'var(--late)');
    html += statLine('Skipped', `⏭️ ${skipped}`, 'var(--skip)');

    if (remaining.length > 0) {
      html += `<div style="margin-top:14px; font-size:0.84rem; color:var(--text-secondary);">
        <strong>Upcoming / Pending:</strong>
        <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:6px;">
          ${remaining.map(r => `<span style="background:rgba(255,255,255,0.06); padding:3px 8px; border-radius:100px; font-size:0.75rem;">${r.icon} ${r.name} (${formatTime12(r.planned)})</span>`).join('')}
        </div>
      </div>`;
    }

    openModal(html);
  }

  function cmdSummary() {
    const entries = todayEntries();
    const { ok, late, skipped, total, score } = computeScore(entries);
    const streak = computeStreak();
    const lateEntries = entries.filter(e => e.status === 'late').sort((a, b) => b.delay - a.delay);

    let html = `<h3>📝 Daily Performance Summary</h3>`;
    html += statLine('Daily OKR Score', `${score.toFixed(2)} (${(score * 100).toFixed(0)}%)`, 'var(--accent-light)');
    html += statLine('On-Time Tasks', `✅ ${ok}`, 'var(--ok)');
    html += statLine('Late Tasks', `🔴 ${late}`, 'var(--late)');
    html += statLine('Skipped Tasks', `⏭️ ${skipped}`, 'var(--skip)');
    html += statLine('Current Streak', `🔥 ${streak} Days`, '#f97316');

    if (lateEntries.length > 0) {
      html += `<div style="margin-top:14px;">
        <strong style="font-size:0.85rem; color:var(--late);">Delay Breakdown:</strong>`;
      lateEntries.forEach(e => {
        html += `<div style="font-size:0.82rem; padding:4px 0; color:var(--text-secondary);">🔴 ${e.icon} ${e.krName} was ${e.delay} mins late (Planned: ${formatTime12(e.planned)}, Done: ${formatTime12(e.actual)})</div>`;
      });
      html += `</div>`;
    }

    html += `<div class="focus-box">🎯 <strong>Action Tip:</strong> ${getFocusSuggestion(entries)}</div>`;
    html += `<p class="encourage-quote">"${ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]}"</p>`;
    openModal(html);
  }

  function cmdWeekly() {
    const days = Object.keys(state.days).sort().reverse().slice(0, 7);
    if (days.length === 0) {
      showToast('No past records found for weekly review yet.');
      return;
    }

    let totalOk = 0, totalLate = 0, totalSkipped = 0, totalScore = 0;
    for (const day of days) {
      const entries = state.days[day]?.entries || [];
      const sc = computeScore(entries, new Date(day + 'T12:00:00'));
      totalOk += sc.ok;
      totalLate += sc.late;
      totalSkipped += sc.skipped;
      totalScore += sc.score;
    }

    const avgScore = days.length > 0 ? (totalScore / days.length).toFixed(2) : '0.00';
    const streak = computeStreak();

    let html = `<h3>📅 7-Day Performance Review</h3>`;
    html += statLine('Days Tracked', `${days.length} days`);
    html += statLine('Average OKR Score', `${avgScore}`, 'var(--accent-light)');
    html += statLine('Total On-Time', `✅ ${totalOk}`, 'var(--ok)');
    html += statLine('Total Late', `🔴 ${totalLate}`, 'var(--late)');
    html += statLine('Total Skipped', `⏭️ ${totalSkipped}`, 'var(--skip)');
    html += statLine('Active Streak', `🔥 ${streak} Days`, '#f97316');

    html += `<div class="focus-box">💡 Review your weekly trends to adapt your planned wakeup or departure times if needed!</div>`;
    openModal(html);
  }

  function cmdResetToday() {
    const key = todayKey();
    if (state.days[key]) {
      state.days[key].entries = [];
    }
    saveState();
    renderAll();
    showToast('🔄 Today\'s routine has been reset. Fresh start!');
  }

  function getFocusSuggestion(entries) {
    const late = entries.filter(e => e.status === 'late').sort((a, b) => b.delay - a.delay);
    const skips = entries.filter(e => e.status === 'skipped');
    if (skips.length > 0) return `Prioritize ${skips[0].krName} tomorrow. Even a 5-minute effort preserves the habit.`;
    if (late.length > 0) return `Set an alarm for ${late[0].krName} about ${Math.min(late[0].delay, 20)} minutes earlier.`;
    return `You executed today with high precision! Maintain this exact rhythm tomorrow.`;
  }

  function statLine(label, value, color) {
    return `<div class="modal-stat-line">
      <span class="label">${label}</span>
      <span class="val" style="color:${color || 'var(--text-primary)'}">${value}</span>
    </div>`;
  }

  // ──────────────────────────────────────────
  // UI Rendering: Header & Progress
  // ──────────────────────────────────────────
  function renderAll() {
    renderHeader();
    renderClassBanner();
    renderTaskList();
    renderReports();
    updateDropdownStats();
    updateAvatarDisplays();
  }

  function renderHeader() {
    const d = new Date();
    const dow = d.getDay();
    const schedule = CLASS_SCHEDULE[dow];
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateText = d.toLocaleDateString('en-US', opts);

    if (schedule) {
      dateText += ` · ${schedule.sessionName}`;
    } else {
      dateText += ' · Off Day (No Classes)';
    }

    const dateLineEl = document.getElementById('dateLine');
    if (dateLineEl) dateLineEl.textContent = dateText;

    const entries = todayEntries();
    const effectiveKRs = getEffectiveKRs();
    const total = effectiveKRs.length;
    const { ok, late, skipped, score } = computeScore(entries);
    const streak = computeStreak();

    const loggedCount = entries.length;
    const pct = total > 0 ? Math.round((loggedCount / total) * 100) : 0;

    const progTextEl = document.getElementById('progressPctText');
    if (progTextEl) progTextEl.textContent = `${pct}% (${loggedCount}/${total})`;

    const progFillEl = document.getElementById('progressBarFill');
    if (progFillEl) progFillEl.style.width = `${pct}%`;

    const scoreEl = document.getElementById('pillScore');
    if (scoreEl) scoreEl.textContent = score.toFixed(2);

    const okEl = document.getElementById('pillOk');
    if (okEl) okEl.textContent = ok;

    const lateEl = document.getElementById('pillLate');
    if (lateEl) lateEl.textContent = late;

    const skipEl = document.getElementById('pillSkip');
    if (skipEl) skipEl.textContent = skipped;

    const streakEl = document.getElementById('pillStreak');
    if (streakEl) streakEl.textContent = streak;

    const badgeEl = document.getElementById('reportCountBadge');
    if (badgeEl) badgeEl.textContent = state.reports ? state.reports.length : 0;
  }

  // ──────────────────────────────────────────
  // UI Rendering: University Schedule Card
  // ──────────────────────────────────────────
  function renderClassBanner() {
    const dow = new Date().getDay();
    const schedule = CLASS_SCHEDULE[dow];
    const banner = document.getElementById('classBanner');
    if (!banner) return;

    if (schedule) {
      banner.className = 'schedule-card';
      let html = `
        <div class="schedule-header">
          <div class="schedule-title-wrap">
            <span class="pulse-dot"></span>
            <span>TODAY'S UNIVERSITY CLASSES</span>
          </div>
          <span class="schedule-tag">${schedule.sessionName}</span>
        </div>
        <div class="class-items-list">
      `;

      schedule.classes.forEach(c => {
        html += `
          <div class="class-item-row">
            <div class="class-item-left">
              <span class="class-item-icon">${c.icon}</span>
              <div>
                <div class="class-item-name">${c.name}</div>
                <div class="class-item-meta">${formatTime12(c.planned)} – ${c.end}</div>
              </div>
            </div>
            <span class="class-room-badge">Room ${c.room}</span>
          </div>
        `;
      });

      html += `</div>`;
      banner.innerHTML = html;
    } else {
      banner.className = 'schedule-card off-day';
      banner.innerHTML = `
        <div class="schedule-header">
          <div class="schedule-title-wrap">
            <span style="color:var(--text-muted)">📅</span>
            <span>UNIVERSITY SCHEDULE</span>
          </div>
          <span class="schedule-tag">Off Day</span>
        </div>
        <div class="off-day-text">
          <span>🌴</span>
          <span>No classes scheduled today (${DAY_NAMES[dow]}). Perfect day for dedicated self-study and deep routine building.</span>
        </div>
      `;
    }
  }

  // ──────────────────────────────────────────
  // UI Rendering: Task Checklist with Deselect
  // ──────────────────────────────────────────
  function renderTaskList() {
    const list = document.getElementById('taskList');
    if (!list) return;

    const entries = todayEntries();
    const entryMap = {};
    entries.forEach(e => { entryMap[e.krId] = e; });
    const effectiveKRs = getEffectiveKRs();

    // Update Checklist Count Chip in section header
    const countChip = document.getElementById('checklistCountChip');
    if (countChip) {
      countChip.textContent = `${entries.length}/${effectiveKRs.length} Done`;
    }

    list.innerHTML = '';

    // Calculate which pending item is Next Up based on current time
    const currentMin = timeToMinutes(nowHHMM());
    let nextUpKRId = null;
    let minFutureDiff = Infinity;

    effectiveKRs.forEach(k => {
      if (!entryMap[k.id] && k.planned) {
        const pMin = timeToMinutes(k.planned);
        const diff = pMin - currentMin;
        // Within 45 minutes in future or 20 minutes in past
        if (diff >= -20 && diff < minFutureDiff) {
          minFutureDiff = diff;
          nextUpKRId = k.id;
        }
      }
    });

    effectiveKRs.forEach((kr, index) => {
      const entry = entryMap[kr.id];
      const li = document.createElement('li');
      li.className = 'task-item';
      li.style.setProperty('--item-idx', index);

      if (kr.id === nextUpKRId && !entry) {
        li.classList.add('is-next-up');
      }

      let checkBtnClass = '';
      let badgeClass = 'badge-pending';
      let badgeText = 'Pending';
      let timingHTML = `<span class="timing-planned">PLANNED ${formatTime12(kr.planned)}${kr.end && !kr.room ? ' – ' + kr.end : ''}</span>`;

      if (entry) {
        li.classList.add('is-completed');
        li.classList.add(`is-${entry.status}`);
        if (entry.status === 'ok') {
          checkBtnClass = 'done-ok';
          badgeClass = 'badge-ok';
          badgeText = '✅ On Time';
          timingHTML = `<span class="timing-actual ok">DONE AT ${formatTime12(entry.actual)}</span>`;
        } else if (entry.status === 'late') {
          checkBtnClass = 'done-late';
          badgeClass = 'badge-late';
          badgeText = `🔴 Late ${entry.delay}m`;
          timingHTML = `<span class="timing-actual late">DONE AT ${formatTime12(entry.actual)} (+${entry.delay}m)</span>`;
        } else {
          checkBtnClass = 'done-skip';
          badgeClass = 'badge-skip';
          badgeText = '⏭️ Skipped';
          timingHTML = `<span class="timing-actual skip">SKIPPED</span>`;
        }
      }

      if (kr.room) {
        timingHTML += ` · <span style="color:var(--text-secondary)">ROOM ${kr.room}</span>`;
      }

      let actionsHTML = '';
      if (!entry) {
        actionsHTML = `<button type="button" class="btn-task-skip" data-kr-id="${kr.id}">Skip</button>`;
      } else {
        actionsHTML = `<button type="button" class="btn-task-deselect" data-kr-id="${kr.id}" title="Undo / Deselect this activity">↺ Deselect</button>`;
      }

      if (kr.isCustom) {
        actionsHTML += `<button type="button" class="btn-task-delete" data-kr-id="${kr.id}" title="Delete this custom task">×</button>`;
      }

      // Next up live badge
      const nextUpBadge = (kr.id === nextUpKRId && !entry)
        ? `<span class="live-task-tag">⚡ NEXT UP</span>`
        : '';

      li.innerHTML = `
        <div class="task-main">
          <button type="button" class="task-check-btn ${checkBtnClass}" data-kr-id="${kr.id}" title="${entry ? 'Click to Deselect / Reset' : 'Click to Complete'}"></button>
          <div class="task-details">
            <div class="task-title">
              <span class="task-icon">${kr.icon}</span>
              <span>${kr.name}</span>
              ${nextUpBadge}
            </div>
            <div class="task-timing">${timingHTML}</div>
          </div>
        </div>
        <div class="task-actions">
          ${actionsHTML}
          <span class="status-badge ${badgeClass}">${badgeText}</span>
        </div>
      `;

      // Checkbox click handler with ripple effect
      const checkBtn = li.querySelector('.task-check-btn');
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = checkBtn.getBoundingClientRect();
        const coords = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        if (!entry) {
          li.classList.add('just-checked');
          logCheckin(kr, nowHHMM(), false, coords);
        } else {
          logDeselect(kr);
        }
      });

      // Skip button handler
      const skipBtn = li.querySelector('.btn-task-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          logCheckin(kr, nowHHMM(), true);
        });
      }

      // Deselect button handler
      const deselectBtn = li.querySelector('.btn-task-deselect');
      if (deselectBtn) {
        deselectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          logDeselect(kr);
        });
      }

      // Delete custom task handler
      const delBtn = li.querySelector('.btn-task-delete');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomTask(kr.id);
        });
      }

      list.appendChild(li);
    });
  }

  // ──────────────────────────────────────────
  // UI Rendering: Daily Reports Section
  // ──────────────────────────────────────────
  function renderReports() {
    const previewContainer = document.getElementById('todayReportPreview');
    const reportsList = document.getElementById('reportsList');
    const countText = document.getElementById('savedReportsCountText');
    const badgeEl = document.getElementById('reportCountBadge');

    const totalSaved = state.reports ? state.reports.length : 0;
    if (countText) countText.textContent = `${totalSaved} ${totalSaved === 1 ? 'report' : 'reports'}`;
    if (badgeEl) badgeEl.textContent = totalSaved;

    // 1. Render Today's Live Preview Card
    if (previewContainer) {
      const todayReport = generateReport(todayKey(), true);
      const { ok, late, skipped, total, score } = todayReport.score;
      const todayFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      let classesSnippet = '';
      if (todayReport.classAttendance && todayReport.classAttendance.length > 0) {
        classesSnippet = `<div style="margin-top:8px; font-size:0.78rem; color:var(--text-secondary); display:flex; gap:10px; flex-wrap:wrap;">`;
        todayReport.classAttendance.forEach(c => {
          const sIcon = c.status === 'ok' ? '✅' : c.status === 'late' ? '🔴' : c.status === 'skipped' ? '⏭️' : '⏳';
          classesSnippet += `<span>${c.icon} ${c.name}: <strong>${sIcon} ${c.status}</strong></span>`;
        });
        classesSnippet += `</div>`;
      }

      previewContainer.innerHTML = `
        <div class="live-card">
          <div class="live-card-header">
            <div class="live-badge">
              <span class="dot"></span>
              <span>Today's Live Snapshot (${todayFormatted})</span>
            </div>
            <span class="live-score-pill">Score ${(score * 100).toFixed(0)}%</span>
          </div>
          <div class="live-card-summary">
            <span>✅ On-Time: <strong style="color:var(--ok)">${ok}</strong></span>
            <span>🔴 Late: <strong style="color:var(--late)">${late}</strong></span>
            <span>⏭️ Skipped: <strong style="color:var(--skip)">${skipped}</strong></span>
            <span>Total Tasks: <strong>${total}</strong></span>
          </div>
          ${classesSnippet}
        </div>
      `;
    }

    // 2. Render Saved Reports Archive List
    if (!reportsList) return;
    reportsList.innerHTML = '';

    if (!state.reports || state.reports.length === 0) {
      reportsList.innerHTML = `
        <div class="empty-reports">
          <div class="empty-icon">📊</div>
          <h3>No Saved Reports Yet</h3>
          <p>Your daily routine report will automatically be generated at <strong>11:59 PM</strong> tonight, or you can manually save today's progress right now.</p>
          <div class="empty-actions">
            <button type="button" class="btn-primary" id="btnEmptySaveToday">
              💾 Save Today's Report
            </button>
            <button type="button" class="btn-ghost" id="btnEmptyLoadDemo">
              ✨ Load Sample Past Reports
            </button>
          </div>
        </div>
      `;

      const btnEmptySave = document.getElementById('btnEmptySaveToday');
      if (btnEmptySave) btnEmptySave.addEventListener('click', saveTodayReport);

      const btnEmptyDemo = document.getElementById('btnEmptyLoadDemo');
      if (btnEmptyDemo) btnEmptyDemo.addEventListener('click', loadDemoReports);
      return;
    }

    state.reports.forEach((report, index) => {
      const { ok, late, skipped, total, score } = report.score;
      const card = document.createElement('div');
      card.className = 'report-card' + (index === 0 ? ' expanded' : '');

      const [yr, mo, da] = report.date.split('-').map(Number);
      const dateObj = new Date(yr, mo - 1, da);
      const dateTitle = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      let classesHTML = '';
      if (report.classAttendance && report.classAttendance.length > 0) {
        classesHTML = `<div class="report-classes-box">
          <div class="report-subhead">University Class Attendance</div>`;
        report.classAttendance.forEach(c => {
          const sClass = c.status === 'ok' ? 'ok' : c.status === 'late' ? 'late' : c.status === 'skipped' ? 'skip' : 'miss';
          const sText = c.status === 'ok' ? 'Attended On Time' : c.status === 'late' ? `Attended Late (+${c.delay || 0}m)` : c.status === 'skipped' ? 'Skipped' : 'Not Attended';
          classesHTML += `
            <div class="report-class-row">
              <span class="report-class-left">${c.icon} ${c.name} (${formatTime12(c.planned)})</span>
              <span class="report-class-badge badge-${sClass}">${sText}</span>
            </div>
          `;
        });
        classesHTML += `</div>`;
      } else {
        classesHTML = `<div class="report-classes-box">
          <div class="report-subhead">University Class Attendance</div>
          <div style="font-size:0.78rem; color:var(--text-muted)">No classes scheduled on this day (${report.dayName}).</div>
        </div>`;
      }

      let tasksHTML = `<div class="report-tasks-box">
        <div class="report-subhead">Detailed Task Breakdown</div>`;
      const dayKRs = getEffectiveKRs(dateObj);
      dayKRs.forEach(kr => {
        const entry = (report.entries || []).find(e => e.krId === kr.id);
        let dot = 'miss', statusBadge = 'Pending', actualTimeStr = '—';
        if (entry) {
          if (entry.status === 'ok') {
            dot = 'ok';
            statusBadge = 'On Time';
            actualTimeStr = formatTime12(entry.actual);
          } else if (entry.status === 'late') {
            dot = 'late';
            statusBadge = `Late (+${entry.delay}m)`;
            actualTimeStr = formatTime12(entry.actual);
          } else {
            dot = 'skip';
            statusBadge = 'Skipped';
            actualTimeStr = 'Skipped';
          }
        }

        tasksHTML += `
          <div class="report-task-row">
            <div class="report-task-left">
              <span class="report-dot ${dot}"></span>
              <span class="report-task-title">${kr.icon} ${kr.name}</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="report-task-time">${actualTimeStr}</span>
              <span class="status-badge badge-${dot}">${statusBadge}</span>
            </div>
          </div>
        `;
      });
      tasksHTML += `</div>`;

      card.innerHTML = `
        <div class="report-card-header">
          <div class="report-header-left">
            <div class="report-date">${dateTitle}</div>
            <div class="report-day-meta">
              <span>${report.dayName}</span>
              <span>·</span>
              <span>${report.classAttendance ? report.classAttendance.length + ' Classes' : 'Off Day'}</span>
            </div>
          </div>
          <div class="report-header-right">
            <span class="report-stat-chip ok">✅ ${ok}</span>
            <span class="report-stat-chip late">🔴 ${late}</span>
            <span class="report-stat-chip skip">⏭️ ${skipped}</span>
            <span class="report-score-box">${(score * 100).toFixed(0)}%</span>
            <span class="report-caret">▼</span>
          </div>
        </div>
        <div class="report-card-body">
          <div class="report-body-content">
            ${classesHTML}
            ${tasksHTML}
            <div class="report-card-footer">
              <button type="button" class="btn-delete-report" data-date="${report.date}">Delete this report</button>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.report-card-header').addEventListener('click', () => {
        card.classList.toggle('expanded');
      });

      const delBtn = card.querySelector('.btn-delete-report');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteReport(report.date);
        });
      }

      reportsList.appendChild(card);
    });
  }

  // ──────────────────────────────────────────
  // Modal Controller
  // ──────────────────────────────────────────
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  function openModal(html) {
    if (modalBody && modalOverlay) {
      modalBody.innerHTML = html;
      modalOverlay.classList.add('open');
    }
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('open');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // ──────────────────────────────────────────
  // Toast Hub
  // ──────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3600);
  }

  // ──────────────────────────────────────────
  // Navigation & Tab Switching
  // ──────────────────────────────────────────
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const target = tab.dataset.tab === 'tasks' ? 'viewTasks' : 'viewReports';
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add('active');

      if (tab.dataset.tab === 'reports') {
        renderReports();
      }
    });
  });

  const btnSaveToday = document.getElementById('btnSaveTodayReport');
  if (btnSaveToday) {
    btnSaveToday.addEventListener('click', saveTodayReport);
  }

  const btnLoadDemo = document.getElementById('btnLoadDemoReports');
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener('click', loadDemoReports);
  }

  // ──────────────────────────────────────────
  // Add Task Drawer UI Controller
  // ──────────────────────────────────────────
  function initAddTaskUI() {
    const triggerBtn = document.getElementById('btnOpenAddTask');
    const drawer = document.getElementById('addTaskDrawer');
    const form = document.getElementById('addTaskForm');
    const nameInp = document.getElementById('newTaskName');
    const timeInp = document.getElementById('newTaskTime');
    const iconSel = document.getElementById('newTaskIcon');
    const iconPreview = document.getElementById('iconPreviewDisplay');
    const cancelBtn = document.getElementById('btnCancelAddTask');

    if (!triggerBtn || !drawer || !form) return;

    function openDrawer() {
      drawer.classList.add('open');
      triggerBtn.classList.add('active');
      triggerBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span>Close</span>
      `;
      if (timeInp && !timeInp.value) {
        timeInp.value = nowHHMM();
      }
      setTimeout(() => {
        if (nameInp) nameInp.focus();
      }, 120);
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      triggerBtn.classList.remove('active');
      triggerBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>Add Task</span>
      `;
      form.reset();
      if (iconPreview) iconPreview.textContent = '🎯';
    }

    triggerBtn.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeDrawer);
    }

    if (iconSel && iconPreview) {
      iconSel.addEventListener('change', () => {
        iconPreview.textContent = iconSel.value;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInp ? nameInp.value : '';
      const time = timeInp ? timeInp.value : '';
      const icon = iconSel ? iconSel.value : '🎯';

      if (!name.trim()) {
        showToast('Please enter an activity name.');
        return;
      }
      if (!time) {
        showToast('Please specify a planned time.');
        return;
      }

      addCustomTask(name, time, icon);
      closeDrawer();
    });
  }

  // ──────────────────────────────────────────
  // Profile Picture Management (Custom Upload)
  // ──────────────────────────────────────────
  function updateAvatarDisplays() {
    const pic = localStorage.getItem('mycoach_profile_pic_v5');
    const headerAvatar = document.getElementById('headerAvatar');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const removeBtn = document.getElementById('btnRemovePicTrigger');

    if (pic) {
      if (headerAvatar) {
        headerAvatar.classList.add('has-pic');
        headerAvatar.style.backgroundImage = `url("${pic}")`;
        headerAvatar.textContent = '';
      }
      if (dropdownAvatar) {
        dropdownAvatar.classList.add('has-pic');
        dropdownAvatar.style.backgroundImage = `url("${pic}")`;
        dropdownAvatar.textContent = '';
      }
      if (removeBtn) removeBtn.style.display = 'flex';
    } else {
      const username = (currentUser && currentUser.username) ? currentUser.username : 'FG007';
      const initials = username.slice(0, 2).toUpperCase();
      if (headerAvatar) {
        headerAvatar.classList.remove('has-pic');
        headerAvatar.style.backgroundImage = 'none';
        headerAvatar.textContent = initials;
      }
      if (dropdownAvatar) {
        dropdownAvatar.classList.remove('has-pic');
        dropdownAvatar.style.backgroundImage = 'none';
        dropdownAvatar.textContent = initials;
      }
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  function initProfilePicUI() {
    const fileInp = document.getElementById('avatarFileInput');
    const uploadTrigger = document.getElementById('btnUploadPicTrigger');
    const removeTrigger = document.getElementById('btnRemovePicTrigger');

    if (uploadTrigger && fileInp) {
      uploadTrigger.addEventListener('click', () => fileInp.click());
    }

    if (fileInp) {
      fileInp.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file (PNG, JPG, WEBP).');
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          showToast('Image is large. Please select a photo under 5MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
          const dataUrl = evt.target.result;
          try {
            localStorage.setItem('mycoach_profile_pic_v5', dataUrl);
            updateAvatarDisplays();
            triggerCelebration(window.innerWidth - 80, 60, false);
            showToast('📸 Profile picture updated successfully!');
          } catch (err) {
            console.error(err);
            showToast('Unable to save picture in storage (file may be too large).');
          }
        };
        reader.readAsDataURL(file);
        fileInp.value = '';
      });
    }

    if (removeTrigger) {
      removeTrigger.addEventListener('click', () => {
        localStorage.removeItem('mycoach_profile_pic_v5');
        updateAvatarDisplays();
        showToast('Profile picture removed.');
      });
    }
  }

  // ──────────────────────────────────────────
  // Data Backup & Restore (Vercel & Multi-Device)
  // ──────────────────────────────────────────
  function initDataBackupUI() {
    const btnExport = document.getElementById('btnExportData');
    const btnImportTrigger = document.getElementById('btnImportDataTrigger');
    const importInput = document.getElementById('importFileInput');

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const backupData = {
          app: 'MyCoach',
          version: '5.0',
          exportedAt: new Date().toISOString(),
          state: state,
          auth: currentUser || { username: 'FG007' },
          profilePic: localStorage.getItem('mycoach_profile_pic_v5') || null,
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mycoach_backup_${todayKey()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        triggerCelebration(window.innerWidth - 80, 70, false);
        showToast('💾 Backup downloaded! Keep this file safe for instant restoration on Vercel.');
      });
    }

    if (btnImportTrigger && importInput) {
      btnImportTrigger.addEventListener('click', () => importInput.click());

      importInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');

            if (parsed.state) {
              state = parsed.state;
              saveState();
            }
            if (parsed.profilePic) {
              localStorage.setItem('mycoach_profile_pic_v5', parsed.profilePic);
            }
            if (parsed.auth) {
              localStorage.setItem(AUTH_KEY, JSON.stringify(parsed.auth));
              currentUser = parsed.auth;
            }

            renderAll();
            triggerCelebration(window.innerWidth / 2, window.innerHeight / 2, true);
            showToast('🎉 Routine & historical data restored 100% successfully!');
          } catch (err) {
            console.error('Import error:', err);
            showToast('⚠️ Could not restore data. File is invalid or corrupted.');
          }
          importInput.value = '';
        };
        reader.readAsText(file);
      });
    }
  }

  // ──────────────────────────────────────────
  // Interactive Pop Cat Custom Cursor
  // ──────────────────────────────────────────
  function initCustomCursor() {
    const cat = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!cat || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        cat.style.left = `${mouseX}px`;
        cat.style.top = `${mouseY}px`;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        cat.style.opacity = '1';
        ring.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cat.style.opacity = '0';
      ring.style.opacity = '0';
    });
    window.addEventListener('blur', () => {
      isVisible = false;
      cat.style.opacity = '0';
      ring.style.opacity = '0';
    });

    function updateCursor() {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      cat.style.left = `${mouseX}px`;
      cat.style.top = `${mouseY}px`;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    const interactiveSel = 'button, a, input, select, textarea, .task-item, .task-check-btn, .user-profile-btn, .stat-box, .report-card-header, .nav-tab, .avatar-upload-badge, label, .modal-close-btn, .btn, .tag-pill';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSel)) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSel)) {
        document.body.classList.remove('cursor-hover');
      }
    });

    // Pop Cat Audio & Click Interactive Physics
    let popSoundEnabled = localStorage.getItem('mycoach_pop_sound') !== 'false';
    let audioCtx = null;

    function playPopSound() {
      if (!popSoundEnabled) return;
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        if (audioCtx) {
          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(540, now);
          osc.frequency.exponentialRampToValueAtTime(170, now + 0.07);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.07);
        }
      } catch (err) {
        // audio fail silently
      }
    }

    function createClickRipple(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'popcat-click-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '34px';
      ripple.style.height = '34px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    }

    window.addEventListener('mousedown', (e) => {
      document.body.classList.add('cursor-click');
      playPopSound();
      createClickRipple(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-click');
    });

    // Sound toggle controller
    const soundToggle = document.getElementById('popSoundToggle');
    if (soundToggle) {
      const updateToggleUI = () => {
        soundToggle.classList.toggle('active', popSoundEnabled);
        soundToggle.innerHTML = popSoundEnabled ? '🐱 Pop: ON' : '🐱 Pop: OFF';
        soundToggle.title = popSoundEnabled ? 'Click to mute Pop Cat sound' : 'Click to enable Pop Cat sound';
      };
      updateToggleUI();
      soundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        popSoundEnabled = !popSoundEnabled;
        localStorage.setItem('mycoach_pop_sound', popSoundEnabled ? 'true' : 'false');
        updateToggleUI();
        if (popSoundEnabled) playPopSound();
      });
    }
  }

  function initShadowShift() {
    let ticking = false;
    window.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const normX = (e.clientX / window.innerWidth - 0.5) * 2;
          const normY = (e.clientY / window.innerHeight - 0.5) * 2;
          document.documentElement.style.setProperty('--shadow-shift-x', `${(normX * 14).toFixed(1)}px`);
          document.documentElement.style.setProperty('--shadow-shift-y', `${(normY * 14).toFixed(1)}px`);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ──────────────────────────────────────────
  // Initialization
  // ──────────────────────────────────────────
  initAuthUI();
  initAddTaskUI();
  initProfilePicUI();
  initDataBackupUI();
  initCustomCursor();
  initShadowShift();
  checkDayChange();
  renderAll();
  setupAutoReset();

})();
