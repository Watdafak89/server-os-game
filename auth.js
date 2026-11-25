/* ServerOps: Data Center Defender — Authentication, Role Management, Leaderboard & Firebase Cloud Sync */
const AuthSystem = (() => {
  const ACCOUNTS_KEY = 'serverops_accounts_v2';
  const SESSION_KEY = 'serverops_session_v2';
  const CLOUD_URL_KEY = 'serverops_cloud_url_v2';
  const MAP_LOCK_KEY = 'serverops_map_lock_v1';
  const MAP_LOCK_CLOUD_KEY = '__map_settings__';
  const TEACHER_SIGNUP_CODE = 'TEACHER2026';

  /* Pure-JS SHA-256 fallback (works even on file:// where crypto.subtle may be unavailable) */
  function fallbackHash(str) {
    let h1 = 0xdeadbeef ^ str.length;
    let h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'fb_' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  async function hashPassword(password, salt) {
    const text = `${salt}:${password}:serverops_v2`;
    try {
      if (window.crypto && window.crypto.subtle) {
        const buf = new TextEncoder().encode(text);
        const digest = await window.crypto.subtle.digest('SHA-256', buf);
        return 'sha_' + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // fallback below
    }
    return fallbackHash(text);
  }

  function sanitizeCloudUrl(url) {
    let clean = (url || '').trim().replace(/\/+$/, '');
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;
    return clean;
  }

  /* Auto-capture ?cloud=... share link from URL on startup */
  function captureCloudUrlFromQuery() {
    try {
      const params = new URLSearchParams(window.location.search);
      const qCloud = params.get('cloud');
      if (qCloud && qCloud.trim()) {
        const clean = sanitizeCloudUrl(qCloud);
        localStorage.setItem(CLOUD_URL_KEY, clean);
        params.delete('cloud');
        const newSearch = params.toString();
        const nextUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
        window.history.replaceState({}, '', nextUrl);
      }
    } catch {
      // ignore
    }
  }
  captureCloudUrlFromQuery();

  function getCloudUrl() {
    try {
      const stored = sanitizeCloudUrl(localStorage.getItem(CLOUD_URL_KEY) || '');
      if (stored) return stored;
    } catch {
      // ignore
    }
    const cfgUrl = sanitizeCloudUrl(window.SERVEROPS_CLOUD_CONFIG?.firebaseRtdbUrl || '');
    return cfgUrl;
  }

  function setCloudUrl(url) {
    const clean = sanitizeCloudUrl(url);
    try {
      if (clean) localStorage.setItem(CLOUD_URL_KEY, clean);
      else localStorage.removeItem(CLOUD_URL_KEY);
    } catch {
      // ignore
    }
    return clean;
  }

  function buildClassroomShareUrl() {
    const cloud = getCloudUrl();
    if (!cloud) return '';
    const isFile = window.location.protocol === 'file:';
    const base = isFile
      ? 'https://watdafak89.github.io/server-os-game/'
      : (window.location.origin + window.location.pathname);
    return `${base}?cloud=${encodeURIComponent(cloud)}`;
  }

  function safeFirebaseKey(username) {
    return String(username || '').toLowerCase().replace(/[.#$\[\]\/]/g, '_');
  }

  function createEmptyGameData(fullName, avatar) {
    return {
      playerName: fullName || 'SysAdmin',
      avatar: avatar || 'avatar1',
      xp: 0,
      coins: 100,
      xpBoostActive: false,
      freePlay: false,
      warpPassPurchased: false,
      warpedZones: [],
      inventory: { shield: 1, hint: 1, heal: 0, warp_pass: 0 },
      stageStars: {},
      completedLabs: [],
      solvedChmod: [],
      solvedRaid: [],
      solvedFirewall: [],
      solvedSubnet: [],
      readChapters: [],
      installedVms: [],
      defenseHighScore: 0,
      blitzHighScore: 0,
      dailyQuests: {
        date: '',
        battlesWon: 0,
        labsOrPuzzles: 0,
        arcadePlayed: 0,
        claimed: []
      },
      examBestScore: 0,
      examPassed: false,
      currentCorrectStreak: 0,
      bestCorrectStreak: 0,
      unlockedBadges: [],
      analytics: {
        fundamentals: { correct: 0, total: 0 },
        hardware: { correct: 0, total: 0 },
        storage: { correct: 0, total: 0 },
        network: { correct: 0, total: 0 },
        users: { correct: 0, total: 0 },
        cli: { correct: 0, total: 0 },
        security: { correct: 0, total: 0 },
        backup: { correct: 0, total: 0 },
        cloud: { correct: 0, total: 0 },
        forensics: { correct: 0, total: 0 }
      }
    };
  }

  function loadAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  }

  function saveAccounts(accounts) {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }

  async function ensureSeedAccounts() {
    const accounts = loadAccounts();
    let changed = false;

    if (!accounts['teacher']) {
      const hash = await hashPassword('123456', 'teacher');
      accounts['teacher'] = {
        username: 'teacher',
        fullName: 'อาจารย์ผู้สอน (Demo)',
        classroom: 'ผู้ดูแลรายวิชา',
        role: 'teacher',
        passwordHash: hash,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        gameData: {
          ...createEmptyGameData('อาจารย์ผู้สอน', 'avatar6'),
          xp: 0,
          freePlay: true,
          coins: 999
        }
      };
      changed = true;
    } else if (accounts['teacher'].gameData && (accounts['teacher'].gameData.xp || 0) !== 0) {
      accounts['teacher'].gameData.xp = 0;
      accounts['teacher'].updatedAt = new Date().toISOString();
      changed = true;
      syncAccountToCloud(accounts['teacher']).catch(() => {});
    }

    if (!accounts['student01']) {
      const hash = await hashPassword('123456', 'student01');
      accounts['student01'] = {
        username: 'student01',
        fullName: 'นายสมชาย ใจดี (Demo)',
        classroom: 'ปวส.1/1',
        role: 'student',
        passwordHash: hash,
        passwordRequired: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        gameData: createEmptyGameData('นายสมชาย ใจดี', 'avatar1')
      };
      changed = true;
    }

    if (changed) saveAccounts(accounts);
    return accounts;
  }

  /* ==================== MAP ZONE LOCK SETTINGS (LOCAL + CLOUD) ==================== */
  const VALID_LOCK_MODES = ['sequential', 'unlock_all', 'up_to', 'custom'];

  function defaultMapLockConfig() {
    return {
      _isMapSettings: true,
      mode: 'sequential',
      maxZone: 10,
      upToFreeAccess: false,
      unlockedZones: ['z1'],
      customFreeAccess: true,
      updatedAt: '',
      updatedBy: ''
    };
  }

  function normalizeMapLockConfig(raw) {
    const def = defaultMapLockConfig();
    if (!raw || typeof raw !== 'object') return def;
    const mode = VALID_LOCK_MODES.includes(raw.mode) ? raw.mode : 'sequential';
    const maxZoneNum = Math.max(1, Math.min(50, Math.round(Number(raw.maxZone) || 10)));
    const unlockedZones = Array.isArray(raw.unlockedZones)
      ? [...new Set(raw.unlockedZones.map((z) => String(z)).filter(Boolean))]
      : ['z1'];
    if (!unlockedZones.length) unlockedZones.push('z1');
    return {
      _isMapSettings: true,
      mode,
      maxZone: maxZoneNum,
      upToFreeAccess: Boolean(raw.upToFreeAccess),
      unlockedZones,
      customFreeAccess: raw.customFreeAccess === undefined ? true : Boolean(raw.customFreeAccess),
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
      updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : ''
    };
  }

  function getMapLockConfig() {
    try {
      const raw = localStorage.getItem(MAP_LOCK_KEY);
      if (raw) return normalizeMapLockConfig(JSON.parse(raw));
    } catch {
      // ignore
    }
    return defaultMapLockConfig();
  }

  function writeLocalMapLockConfig(cfg) {
    try {
      localStorage.setItem(MAP_LOCK_KEY, JSON.stringify(cfg));
    } catch {
      // ignore
    }
  }

  function mergeCloudMapLockConfig(cloudRaw) {
    if (!cloudRaw || typeof cloudRaw !== 'object' || !cloudRaw._isMapSettings) return false;
    const incoming = normalizeMapLockConfig(cloudRaw);
    const local = getMapLockConfig();
    const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
    const cloudTime = incoming.updatedAt ? new Date(incoming.updatedAt).getTime() : 0;
    if (!local.updatedAt || cloudTime >= localTime) {
      writeLocalMapLockConfig(incoming);
      return true;
    }
    return false;
  }

  async function saveMapLockConfig(nextCfg, updatedBy) {
    const normalized = normalizeMapLockConfig({
      ...getMapLockConfig(),
      ...nextCfg,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || getCurrentAccount()?.fullName || 'ครูผู้สอน'
    });
    writeLocalMapLockConfig(normalized);
    const base = getCloudUrl();
    if (!base) return { ok: true, synced: false, config: normalized };
    try {
      const res = await fetch(`${base}/serverops_accounts/${MAP_LOCK_CLOUD_KEY}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      return { ok: true, synced: res.ok, status: res.status, config: normalized };
    } catch {
      return { ok: true, synced: false, status: 0, config: normalized };
    }
  }

  async function pullMapLockConfigFromCloud() {
    const base = getCloudUrl();
    if (!base) return { ok: false, config: getMapLockConfig() };
    try {
      const res = await fetch(`${base}/serverops_accounts/${MAP_LOCK_CLOUD_KEY}.json`);
      if (!res.ok) return { ok: false, config: getMapLockConfig() };
      const data = await res.json();
      const changed = mergeCloudMapLockConfig(data);
      return { ok: true, changed, config: getMapLockConfig() };
    } catch {
      return { ok: false, config: getMapLockConfig() };
    }
  }

  /* ==================== FIREBASE RTDB REST SYNC ==================== */
  async function syncAccountToCloud(account) {
    const base = getCloudUrl();
    if (!base || !account?.username) return { ok: false, skipped: true };
    try {
      const key = safeFirebaseKey(account.username);
      const res = await fetch(`${base}/serverops_accounts/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      return { ok: res.ok, status: res.status };
    } catch {
      return { ok: false, status: 0 };
    }
  }

  async function fetchSingleCloudAccount(username) {
    const base = getCloudUrl();
    if (!base || !username) return null;
    try {
      const key = safeFirebaseKey(username);
      const res = await fetch(`${base}/serverops_accounts/${key}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.username ? data : null;
    } catch {
      return null;
    }
  }

  async function deleteCloudAccount(username) {
    const base = getCloudUrl();
    if (!base || !username) return false;
    try {
      const key = safeFirebaseKey(username);
      const res = await fetch(`${base}/serverops_accounts/${key}.json`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  const CAMPAIGN_BADGE_IDS = [
    'first_blood',
    'zone1_clear', 'zone2_clear', 'zone3_clear', 'zone4_clear', 'zone5_clear',
    'final_boss', 'zone7_clear', 'zone8_clear', 'zone9_clear', 'zone10_clear'
  ];

  function shouldAcceptCloudAccount(localAcc, cloudAcc) {
    if (!localAcc) return true;
    const localAdminTs = Math.max(
      localAcc?.gameData?.mapResetAt ? new Date(localAcc.gameData.mapResetAt).getTime() : 0,
      localAcc?.gameData?.xpResetAt ? new Date(localAcc.gameData.xpResetAt).getTime() : 0,
      localAcc?.gameData?.xpBonusAt ? new Date(localAcc.gameData.xpBonusAt).getTime() : 0
    );
    const cloudAdminTs = Math.max(
      cloudAcc?.gameData?.mapResetAt ? new Date(cloudAcc.gameData.mapResetAt).getTime() : 0,
      cloudAcc?.gameData?.xpResetAt ? new Date(cloudAcc.gameData.xpResetAt).getTime() : 0,
      cloudAcc?.gameData?.xpBonusAt ? new Date(cloudAcc.gameData.xpBonusAt).getTime() : 0
    );
    if (cloudAdminTs > localAdminTs) return true;
    if (localAdminTs > cloudAdminTs) return false;
    const localTime = localAcc?.updatedAt ? new Date(localAcc.updatedAt).getTime() : 0;
    const cloudTime = cloudAcc?.updatedAt ? new Date(cloudAcc.updatedAt).getTime() : 0;
    const localXp = localAcc?.gameData?.xp || 0;
    const cloudXp = cloudAcc?.gameData?.xp || 0;
    return cloudTime >= localTime || cloudXp > localXp;
  }

  function applyMapResetToAccount(acc, options = {}) {
    if (!acc || acc.role === 'teacher') return false;
    const now = new Date().toISOString();
    const base = createEmptyGameData(acc.fullName, acc.gameData?.avatar || 'avatar1');
    const prev = acc.gameData || {};
    const nextBadges = Array.isArray(prev.unlockedBadges)
      ? prev.unlockedBadges.filter((id) => !CAMPAIGN_BADGE_IDS.includes(id))
      : [];
    const nextInv = {
      ...base.inventory,
      ...(prev.inventory || {}),
      warp_pass: 0
    };
    acc.gameData = {
      ...base,
      ...prev,
      stageStars: {},
      importedStars: 0,
      warpedZones: [],
      warpPassPurchased: false,
      inventory: nextInv,
      unlockedBadges: nextBadges,
      mapResetAt: now
    };
    if (options.resetXpAndCoins) {
      acc.gameData.xp = 0;
      acc.gameData.coins = 100;
    }
    acc.updatedAt = now;
    return true;
  }

  async function resetStudentMapProgress(username, options = {}) {
    const accounts = loadAccounts();
    const acc = accounts[username];
    if (!acc || acc.role === 'teacher') return { ok: false, error: 'ไม่พบบัญชีนักศึกษา' };
    applyMapResetToAccount(acc, options);
    accounts[username] = acc;
    saveAccounts(accounts);
    const syncRes = await syncAccountToCloud(acc);
    return { ok: true, account: acc, synced: Boolean(syncRes?.ok) };
  }

  async function resetStudentsMapProgress(options = {}) {
    const classroom = (options.classroom || '').trim();
    const accounts = loadAccounts();
    const targets = Object.values(accounts).filter((acc) => {
      if (!acc || acc.role !== 'student') return false;
      if (classroom && (acc.classroom || '-') !== classroom) return false;
      return true;
    });
    if (!targets.length) {
      return { ok: false, count: 0, synced: 0, error: 'ไม่พบรายชื่อนักศึกษาตามเงื่อนไขที่เลือก' };
    }
    targets.forEach((acc) => {
      applyMapResetToAccount(acc, options);
      accounts[acc.username] = acc;
    });
    saveAccounts(accounts);
    let synced = 0;
    if (getCloudUrl()) {
      for (const acc of targets) {
        const r = await syncAccountToCloud(acc);
        if (r?.ok) synced += 1;
      }
    }
    return { ok: true, count: targets.length, synced };
  }

  function applyXpResetToAccount(acc) {
    if (!acc || acc.role === 'teacher') return false;
    const now = new Date().toISOString();
    const base = createEmptyGameData(acc.fullName, acc.gameData?.avatar || 'avatar1');
    acc.gameData = {
      ...base,
      ...(acc.gameData || {}),
      xp: 0,
      xpResetAt: now
    };
    acc.updatedAt = now;
    return true;
  }

  async function resetStudentXp(username) {
    const accounts = loadAccounts();
    const acc = accounts[username];
    if (!acc || acc.role === 'teacher') return { ok: false, error: 'ไม่พบบัญชีนักศึกษา' };
    applyXpResetToAccount(acc);
    accounts[username] = acc;
    saveAccounts(accounts);
    const syncRes = await syncAccountToCloud(acc);
    return { ok: true, account: acc, synced: Boolean(syncRes?.ok) };
  }

  async function resetStudentsXp(options = {}) {
    const classroom = (options.classroom || '').trim();
    const accounts = loadAccounts();
    const targets = Object.values(accounts).filter((acc) => {
      if (!acc || acc.role !== 'student') return false;
      if (classroom && (acc.classroom || '-') !== classroom) return false;
      return true;
    });
    if (!targets.length) {
      return { ok: false, count: 0, synced: 0, error: 'ไม่พบรายชื่อนักศึกษาตามเงื่อนไขที่เลือก' };
    }
    targets.forEach((acc) => {
      applyXpResetToAccount(acc);
      accounts[acc.username] = acc;
    });
    saveAccounts(accounts);
    let synced = 0;
    if (getCloudUrl()) {
      for (const acc of targets) {
        const r = await syncAccountToCloud(acc);
        if (r?.ok) synced += 1;
      }
    }
    return { ok: true, count: targets.length, synced };
  }

  function applyXpGrantToAccount(acc, amount, reason, grantedBy) {
    if (!acc || acc.role === 'teacher') return false;
    const delta = Math.round(Number(amount) || 0);
    if (delta === 0) return false;
    const now = new Date().toISOString();
    const base = createEmptyGameData(acc.fullName, acc.gameData?.avatar || 'avatar1');
    const prev = acc.gameData || {};
    const nextXp = Math.max(0, (prev.xp || 0) + delta);
    acc.gameData = {
      ...base,
      ...prev,
      xp: nextXp,
      xpBonusAt: now,
      lastXpBonus: {
        amount: delta,
        reason: (reason || '').trim() || 'ตอบคำถามในห้องเรียนได้',
        by: grantedBy || getCurrentAccount()?.fullName || 'ครูผู้สอน',
        at: now
      }
    };
    acc.updatedAt = now;
    return true;
  }

  async function grantStudentXp(username, amount, reason = '') {
    const delta = Math.round(Number(amount) || 0);
    if (!delta) return { ok: false, error: 'กรุณาระบุจำนวน XP ที่ไม่เป็น 0' };
    const accounts = loadAccounts();
    const acc = accounts[username];
    if (!acc || acc.role === 'teacher') return { ok: false, error: 'ไม่พบบัญชีนักศึกษา' };
    applyXpGrantToAccount(acc, delta, reason);
    accounts[username] = acc;
    saveAccounts(accounts);
    const syncRes = await syncAccountToCloud(acc);
    return { ok: true, account: acc, newXp: acc.gameData.xp, synced: Boolean(syncRes?.ok) };
  }

  async function grantStudentsXp({ classroom = '', amount = 50, reason = '' } = {}) {
    const delta = Math.round(Number(amount) || 0);
    if (!delta) return { ok: false, count: 0, synced: 0, error: 'กรุณาระบุจำนวน XP ที่ไม่เป็น 0' };
    const cleanClass = (classroom || '').trim();
    const accounts = loadAccounts();
    const targets = Object.values(accounts).filter((acc) => {
      if (!acc || acc.role !== 'student') return false;
      if (cleanClass && (acc.classroom || '-') !== cleanClass) return false;
      return true;
    });
    if (!targets.length) {
      return { ok: false, count: 0, synced: 0, error: 'ไม่พบรายชื่อนักศึกษาตามเงื่อนไขที่เลือก' };
    }
    targets.forEach((acc) => {
      applyXpGrantToAccount(acc, delta, reason);
      accounts[acc.username] = acc;
    });
    saveAccounts(accounts);
    let synced = 0;
    if (getCloudUrl()) {
      for (const acc of targets) {
        const r = await syncAccountToCloud(acc);
        if (r?.ok) synced += 1;
      }
    }
    return { ok: true, count: targets.length, synced };
  }

  async function pullAllFromCloud() {
    const base = getCloudUrl();
    if (!base) return { ok: false, error: 'ยังไม่ได้ตั้งค่า Firebase Realtime DB URL' };
    try {
      const res = await fetch(`${base}/serverops_accounts.json`);
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: 'ติดสิทธิ์ Firebase Rules (401/403) — กรุณาเปิดสิทธิ์ .read และ .write ที่เมนู Rules ใน Firebase' };
      }
      if (!res.ok) {
        return { ok: false, error: `เชื่อมต่อไม่สำเร็จ (HTTP ${res.status}) — ตรวจสอบ URL อีกครั้ง` };
      }
      const cloudData = await res.json();
      if (!cloudData || typeof cloudData !== 'object') {
        return { ok: true, count: 0 };
      }
      if (cloudData[MAP_LOCK_CLOUD_KEY]) {
        mergeCloudMapLockConfig(cloudData[MAP_LOCK_CLOUD_KEY]);
      }
      const local = loadAccounts();
      let count = 0;
      Object.values(cloudData).forEach((acc) => {
        if (!acc || !acc.username) return;
        if (acc.username === 'teacher' && acc.gameData) {
          acc.gameData.xp = 0;
        }
        const prev = local[acc.username];
        if (shouldAcceptCloudAccount(prev, acc)) {
          local[acc.username] = acc;
          count += 1;
        }
      });
      saveAccounts(local);
      return { ok: true, count };
    } catch {
      return { ok: false, error: 'ไม่สามารถเชื่อมต่อ Firebase ได้ (ตรวจสอบอินเทอร์เน็ตหรือ URL)' };
    }
  }

  async function pushAllToCloud() {
    const base = getCloudUrl();
    if (!base) return { ok: false, error: 'ยังไม่ได้ตั้งค่า Firebase URL' };
    const list = Object.values(loadAccounts());
    let synced = 0;
    for (const acc of list) {
      const r = await syncAccountToCloud(acc);
      if (r.ok) synced += 1;
      else if (r.status === 401 || r.status === 403) {
        return { ok: false, error: 'ติดสิทธิ์เขียนข้อมูล Firebase Rules (401/403)' };
      }
    }
    const lockCfg = getMapLockConfig();
    if (lockCfg.updatedAt) {
      await fetch(`${base}/serverops_accounts/${MAP_LOCK_CLOUD_KEY}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockCfg)
      }).catch(() => {});
    }
    return { ok: true, synced };
  }

  async function testCloudConnection(inputUrl) {
    const base = sanitizeCloudUrl(inputUrl || getCloudUrl());
    if (!base) return { ok: false, error: 'กรุณากรอก Firebase Realtime Database URL ก่อนทดสอบ' };
    try {
      const pingUrl = `${base}/serverops_healthcheck.json`;
      const putRes = await fetch(pingUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ok', checkedAt: new Date().toISOString() })
      });
      if (putRes.status === 401 || putRes.status === 403) {
        return { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ได้ แต่ติดสิทธิ์ Rules (401/403) กรุณาตั้งค่า Rules ตามตัวอย่างด้านล่าง' };
      }
      if (!putRes.ok) {
        return { ok: false, error: `URL ไม่ถูกต้องหรือไม่พบฐานข้อมูล (HTTP ${putRes.status})` };
      }
      const getRes = await fetch(pingUrl);
      if (!getRes.ok) {
        return { ok: false, error: `เขียนได้แต่อ่านไม่ได้ (HTTP ${getRes.status})` };
      }
      return { ok: true, url: base };
    } catch {
      return { ok: false, error: 'เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบรูปแบบ URL (ต้องลงท้ายด้วย firebaseio.com หรือ firebasedatabase.app)' };
    }
  }

  /* ==================== REGISTER & LOGIN ==================== */
  async function register({ username, fullName, classroom, password, role, teacherCode, avatar }) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();
    const cleanClass = (classroom || '').trim() || '-';

    if (!/^[a-z0-9._-]{3,24}$/.test(cleanUser)) {
      return { ok: false, error: 'รหัสนักศึกษา/ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 3–24 ตัว (ห้ามเว้นวรรค)' };
    }
    if (!cleanName || cleanName.length < 2) {
      return { ok: false, error: 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร' };
    }
    if (!password || password.length < 4) {
      return { ok: false, error: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' };
    }
    if (role === 'teacher' && (teacherCode || '').trim().toUpperCase() !== TEACHER_SIGNUP_CODE) {
      return { ok: false, error: `รหัสยืนยันครูผู้สอนไม่ถูกต้อง (ค่าเริ่มต้นคือ ${TEACHER_SIGNUP_CODE})` };
    }

    const accounts = await ensureSeedAccounts();

    // Check duplicate on Cloud too if configured
    if (getCloudUrl()) {
      const cloudExisting = await fetchSingleCloudAccount(cleanUser);
      if (cloudExisting) {
        accounts[cleanUser] = cloudExisting;
        saveAccounts(accounts);
      }
    }

    if (accounts[cleanUser]) {
      return { ok: false, error: `บัญชี "${cleanUser}" ถูกใช้งานแล้ว กรุณาใช้รหัสอื่นหรือเข้าสู่ระบบ` };
    }

    const passwordHash = await hashPassword(password, cleanUser);
    const now = new Date().toISOString();
    const newAccount = {
      username: cleanUser,
      fullName: cleanName,
      classroom: cleanClass,
      role: role === 'teacher' ? 'teacher' : 'student',
      passwordHash,
      passwordRequired: true,
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      gameData: {
        ...createEmptyGameData(cleanName, avatar || (role === 'teacher' ? '🛡️' : '👨‍💻')),
        freePlay: role === 'teacher'
      }
    };

    accounts[cleanUser] = newAccount;
    saveAccounts(accounts);
    setSession(cleanUser);
    await syncAccountToCloud(newAccount);
    return { ok: true, account: newAccount };
  }

  async function login(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const accounts = await ensureSeedAccounts();

    // Sync latest account from Cloud so user can seamlessly continue on another device
    if (getCloudUrl()) {
      const cloudAcc = await fetchSingleCloudAccount(cleanUser);
      if (cloudAcc) {
        const localAcc = accounts[cleanUser];
        if (shouldAcceptCloudAccount(localAcc, cloudAcc)) {
          accounts[cleanUser] = cloudAcc;
          saveAccounts(accounts);
        }
      }
    }

    const latestAccounts = loadAccounts();
    const acc = latestAccounts[cleanUser];
    if (!acc) {
      return { ok: false, error: `ไม่พบบัญชีผู้ใช้ "${cleanUser}" กรุณาสมัครสมาชิกก่อน` };
    }

    const inputHash = await hashPassword(password || '', cleanUser);
    if (acc.passwordHash !== inputHash) {
      return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    acc.lastLogin = new Date().toISOString();
    if (acc.username === 'teacher' && acc.gameData) {
      acc.gameData.xp = 0;
      syncAccountToCloud(acc).catch(() => {});
    }
    latestAccounts[cleanUser] = acc;
    saveAccounts(latestAccounts);
    setSession(cleanUser);
    return { ok: true, account: acc };
  }

  function setSession(username) {
    try {
      if (username) localStorage.setItem(SESSION_KEY, username);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }

  function getSessionUsername() {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  }

  function getCurrentAccount() {
    const uname = getSessionUsername();
    if (!uname) return null;
    const accounts = loadAccounts();
    return accounts[uname] || null;
  }

  function logout() {
    setSession(null);
  }

  function updateCurrentGameData(gameData) {
    const uname = getSessionUsername();
    if (!uname) return;
    const accounts = loadAccounts();
    if (!accounts[uname]) return;
    if (uname === 'teacher' && gameData) {
      gameData.xp = 0;
    }
    accounts[uname].gameData = gameData;
    accounts[uname].updatedAt = new Date().toISOString();
    saveAccounts(accounts);
    syncAccountToCloud(accounts[uname]).catch(() => {});
  }

  function getAllAccountsList() {
    const accounts = loadAccounts();
    return Object.values(accounts);
  }

  async function deleteAccount(username) {
    const accounts = loadAccounts();
    if (!accounts[username] || username === getSessionUsername()) return false;
    delete accounts[username];
    saveAccounts(accounts);
    await deleteCloudAccount(username);
    return true;
  }

  async function lookupStudent(studentId) {
    const cleanId = (studentId || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(cleanId)) {
      return { ok: false, error: 'รหัสนักศึกษาต้องเป็นตัวเลขหรือตัวอักษรภาษาอังกฤษ 3–24 ตัว (ห้ามเว้นวรรค)' };
    }

    const accounts = await ensureSeedAccounts();
    if (getCloudUrl()) {
      const cloudAcc = await fetchSingleCloudAccount(cleanId);
      if (cloudAcc) {
        const localAcc = accounts[cleanId];
        if (shouldAcceptCloudAccount(localAcc, cloudAcc)) {
          accounts[cleanId] = cloudAcc;
          saveAccounts(accounts);
        }
      }
    }

    const acc = loadAccounts()[cleanId] || null;
    if (!acc) return { ok: true, exists: false, studentId: cleanId };
    return {
      ok: true,
      exists: true,
      studentId: cleanId,
      account: acc,
      requiresPassword: Boolean(acc.passwordRequired || acc.role === 'teacher')
    };
  }

  async function studentQuickLogin({ studentId, fullName, classroom, password, avatar }) {
    const check = await lookupStudent(studentId);
    if (!check.ok) return check;

    const cleanId = check.studentId;
    const accounts = loadAccounts();

    if (check.exists) {
      const acc = check.account;
      if (acc.passwordRequired || acc.role === 'teacher') {
        if (!password) {
          return { ok: false, needPassword: true, account: acc, error: 'บัญชีนี้ตั้งรหัสผ่านไว้ กรุณากรอกรหัสผ่าน' };
        }
        const hash = await hashPassword(password, cleanId);
        if (acc.passwordHash !== hash) {
          return { ok: false, needPassword: true, account: acc, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่' };
        }
      }
      acc.lastLogin = new Date().toISOString();
      accounts[cleanId] = acc;
      saveAccounts(accounts);
      setSession(cleanId);
      return { ok: true, account: acc, isNew: false };
    }

    // First-time student: create account immediately
    const cleanName = (fullName || '').trim();
    const cleanClass = (classroom || '').trim() || '-';
    if (!cleanName || cleanName.length < 2) {
      return { ok: false, needRegister: true, error: 'ไม่พบรหัสนักศึกษานี้ในระบบ กรุณากรอกชื่อ-นามสกุลเพื่อลงทะเบียนครั้งแรก' };
    }
    if (password && password.length < 4) {
      return { ok: false, needRegister: true, error: 'หากต้องการตั้งรหัสผ่านเสริม ต้องมีอย่างน้อย 4 ตัวอักษร (หรือเว้นว่างไว้ได้)' };
    }

    const hasPw = Boolean(password && password.length >= 4);
    const passwordHash = await hashPassword(hasPw ? password : ('sid:' + cleanId), cleanId);
    const now = new Date().toISOString();
    const newAcc = {
      username: cleanId,
      fullName: cleanName,
      classroom: cleanClass,
      role: 'student',
      passwordHash,
      passwordRequired: hasPw,
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      gameData: createEmptyGameData(cleanName, avatar || '👨‍💻')
    };

    accounts[cleanId] = newAcc;
    saveAccounts(accounts);
    setSession(cleanId);
    await syncAccountToCloud(newAcc);
    return { ok: true, account: newAcc, isNew: true };
  }

  async function bulkImportStudents(rawText) {
    const lines = (rawText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return { ok: false, error: 'กรุณาวางรายชื่อนักศึกษาอย่างน้อย 1 บรรทัด' };

    const accounts = await ensureSeedAccounts();
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    for (const line of lines) {
      // Support Tab (copy directly from Excel) or Comma
      const cols = line.includes('\t')
        ? line.split('\t').map((c) => c.trim())
        : line.split(',').map((c) => c.trim());

      const rawId = (cols[0] || '').toLowerCase().replace(/\s+/g, '');
      const fullName = cols[1] || '';
      const classroom = cols[2] || '-';

      // Skip header row like "รหัสนักศึกษา, ชื่อ-นามสกุล"
      if (!/^[a-z0-9._-]{3,24}$/.test(rawId) || !fullName) {
        skipped += 1;
        continue;
      }

      if (accounts[rawId]) {
        if (accounts[rawId].role !== 'teacher') {
          accounts[rawId].fullName = fullName;
          if (classroom && classroom !== '-') accounts[rawId].classroom = classroom;
          accounts[rawId].gameData.playerName = fullName;
          accounts[rawId].updatedAt = now;
          await syncAccountToCloud(accounts[rawId]);
          updated += 1;
        } else {
          skipped += 1;
        }
      } else {
        const pwHash = await hashPassword('sid:' + rawId, rawId);
        accounts[rawId] = {
          username: rawId,
          fullName,
          classroom,
          role: 'student',
          passwordHash: pwHash,
          passwordRequired: false,
          createdAt: now,
          updatedAt: now,
          lastLogin: now,
          gameData: createEmptyGameData(fullName, '👨‍💻')
        };
        await syncAccountToCloud(accounts[rawId]);
        added += 1;
      }
    }

    saveAccounts(accounts);
    if (added + updated === 0) {
      return { ok: false, error: 'ไม่พบบรรทัดที่รูปแบบถูกต้อง (รูปแบบ: รหัสนักศึกษา, ชื่อ-นามสกุล, ห้องเรียน)' };
    }
    return { ok: true, added, updated, skipped };
  }

  async function resetUserPassword(username, newPassword) {
    const accounts = loadAccounts();
    if (!accounts[username]) return false;
    accounts[username].passwordHash = await hashPassword(newPassword, username);
    accounts[username].passwordRequired = Boolean(newPassword);
    accounts[username].updatedAt = new Date().toISOString();
    saveAccounts(accounts);
    await syncAccountToCloud(accounts[username]);
    return true;
  }

  /* ==================== OFFLINE SCORE CODE EXPORT / IMPORT ==================== */
  function encodeScoreReport(account) {
    const g = account.gameData || {};
    const payload = {
      v: 2,
      u: account.username,
      n: account.fullName,
      c: account.classroom,
      r: account.role,
      av: g.avatar || '👨‍💻',
      xp: g.xp || 0,
      coins: g.coins || 0,
      stars: Object.values(g.stageStars || {}).reduce((a, b) => a + b, 0),
      labs: (g.completedLabs || []).length,
      def: g.defenseHighScore || 0,
      exam: g.examBestScore || 0,
      pass: Boolean(g.examPassed),
      badges: (g.unlockedBadges || []).length,
      ts: new Date().toISOString()
    };
    const json = JSON.stringify(payload);
    return 'SOPS2:' + btoa(unescape(encodeURIComponent(json)));
  }

  function importScoreReport(codeStr) {
    try {
      const cleaned = (codeStr || '').trim();
      if (!cleaned.startsWith('SOPS2:')) {
        return { ok: false, error: 'รูปแบบรหัสคะแนนไม่ถูกต้อง (ต้องขึ้นต้นด้วย SOPS2:)' };
      }
      const json = decodeURIComponent(escape(atob(cleaned.slice(6))));
      const p = JSON.parse(json);
      if (!p.u || !p.n) return { ok: false, error: 'ข้อมูลในรหัสคะแนนไม่ครบถ้วน' };

      const accounts = loadAccounts();
      const existing = accounts[p.u];
      const baseGame = existing?.gameData || createEmptyGameData(p.n, p.av);

      const existingStars = Object.values(baseGame.stageStars || {}).reduce((a, b) => a + b, 0);
      const mergedData = {
        ...baseGame,
        playerName: p.n,
        avatar: p.av || baseGame.avatar,
        xp: Math.max(baseGame.xp || 0, p.xp || 0),
        coins: Math.max(baseGame.coins || 0, p.coins || 0),
        defenseHighScore: Math.max(baseGame.defenseHighScore || 0, p.def || 0),
        examBestScore: Math.max(baseGame.examBestScore || 0, p.exam || 0),
        examPassed: Boolean(baseGame.examPassed || p.pass),
        importedStars: Math.max(existingStars, p.stars || 0),
        importedLabs: Math.max((baseGame.completedLabs || []).length, p.labs || 0),
        importedBadges: Math.max((baseGame.unlockedBadges || []).length, p.badges || 0)
      };

      accounts[p.u] = {
        username: p.u,
        fullName: p.n,
        classroom: p.c || '-',
        role: p.r === 'teacher' ? 'teacher' : 'student',
        passwordHash: existing?.passwordHash || fallbackHash('imported:' + p.u),
        createdAt: existing?.createdAt || p.ts,
        updatedAt: p.ts,
        lastLogin: p.ts,
        gameData: mergedData
      };

      saveAccounts(accounts);
      syncAccountToCloud(accounts[p.u]).catch(() => {});
      return { ok: true, studentName: p.n, username: p.u };
    } catch {
      return { ok: false, error: 'ไม่สามารถถอดรหัสคะแนนได้ กรุณาตรวจสอบว่าคัดลอกมาครบทุกตัวอักษร' };
    }
  }

  /* ==================== CSV EXPORT (UTF-8 BOM FOR THAI EXCEL) ==================== */
  function exportScoresCsv() {
    const rows = getAllAccountsList()
      .filter((a) => a.role === 'student')
      .sort((a, b) => (b.gameData?.xp || 0) - (a.gameData?.xp || 0));

    const header = [
      'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ห้องเรียน', 'XP รวม',
      'ดาวแคมเปญ (เต็ม 450)', 'แล็บ CLI (เต็ม 30)', 'VirtualBox (เต็ม 5)', 'Packet Defense สูงสุด',
      'Lightning Blitz สูงสุด', 'คะแนนสอบสูงสุด (เต็ม 30)', 'เกียรติบัตร', 'เหรียญตรา', 'อัปเดตล่าสุด'
    ];

    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [header.map(esc).join(',')];

    rows.forEach((acc) => {
      const g = acc.gameData || {};
      const stars = Math.max(
        Object.values(g.stageStars || {}).reduce((s, x) => s + x, 0),
        g.importedStars || 0
      );
      const labs = Math.max((g.completedLabs || []).length, g.importedLabs || 0);
      const vbox = Array.isArray(g.installedVms) ? g.installedVms.length : 0;
      const badges = Math.max((g.unlockedBadges || []).length, g.importedBadges || 0);
      lines.push([
        acc.username,
        acc.fullName,
        acc.classroom || '-',
        g.xp || 0,
        stars,
        labs,
        vbox,
        g.defenseHighScore || 0,
        g.blitzHighScore || 0,
        g.examBestScore || 0,
        g.examPassed ? 'ผ่าน' : 'ยังไม่ผ่าน',
        badges,
        acc.updatedAt ? new Date(acc.updatedAt).toLocaleString('th-TH') : '-'
      ].map(esc).join(','));
    });

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateTag = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `serverops_scores_${dateTag}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return rows.length;
  }

  return {
    TEACHER_SIGNUP_CODE,
    ensureSeedAccounts,
    createEmptyGameData,
    lookupStudent,
    studentQuickLogin,
    bulkImportStudents,
    register,
    login,
    logout,
    getCurrentAccount,
    updateCurrentGameData,
    getAllAccountsList,
    deleteAccount,
    resetUserPassword,
    encodeScoreReport,
    importScoreReport,
    exportScoresCsv,
    getCloudUrl,
    setCloudUrl,
    buildClassroomShareUrl,
    testCloudConnection,
    syncAccountToCloud,
    pullAllFromCloud,
    pushAllToCloud,
    getMapLockConfig,
    saveMapLockConfig,
    pullMapLockConfigFromCloud,
    resetStudentMapProgress,
    resetStudentsMapProgress,
    resetStudentXp,
    resetStudentsXp,
    grantStudentXp,
    grantStudentsXp
  };
})();
