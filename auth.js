/* ServerOps: Data Center Defender — Authentication, Role Management, Leaderboard & Teacher Sync */
const AuthSystem = (() => {
  const ACCOUNTS_KEY = 'serverops_accounts_v2';
  const SESSION_KEY = 'serverops_session_v2';
  const CLOUD_URL_KEY = 'serverops_cloud_url_v2';
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

  function createEmptyGameData(fullName, avatar) {
    return {
      playerName: fullName || 'SysAdmin',
      avatar: avatar || '👨‍💻',
      xp: 0,
      coins: 100,
      xpBoostActive: false,
      freePlay: false,
      inventory: { shield: 1, hint: 1, heal: 0 },
      stageStars: {},
      completedLabs: [],
      solvedChmod: [],
      solvedRaid: [],
      defenseHighScore: 0,
      examBestScore: 0,
      examPassed: false,
      unlockedBadges: [],
      analytics: {
        fundamentals: { correct: 0, total: 0 },
        hardware: { correct: 0, total: 0 },
        storage: { correct: 0, total: 0 },
        network: { correct: 0, total: 0 },
        users: { correct: 0, total: 0 },
        cli: { correct: 0, total: 0 },
        security: { correct: 0, total: 0 },
        backup: { correct: 0, total: 0 }
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
          ...createEmptyGameData('อาจารย์ผู้สอน', '🛡️'),
          freePlay: true,
          coins: 999
        }
      };
      changed = true;
    }

    if (!accounts['student01']) {
      const hash = await hashPassword('123456', 'student01');
      accounts['student01'] = {
        username: 'student01',
        fullName: 'นายสมชาย ใจดี (Demo)',
        classroom: 'ปวส.1/1',
        role: 'student',
        passwordHash: hash,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        gameData: createEmptyGameData('นายสมชาย ใจดี', '👨‍💻')
      };
      changed = true;
    }

    if (changed) saveAccounts(accounts);
    return accounts;
  }

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
    if (accounts[cleanUser]) {
      return { ok: false, error: `บัญชี "${cleanUser}" ถูกใช้งานแล้ว กรุณาใช้รหัสอื่นหรือเข้าสู่ระบบ` };
    }

    const passwordHash = await hashPassword(password, cleanUser);
    const newAccount = {
      username: cleanUser,
      fullName: cleanName,
      classroom: cleanClass,
      role: role === 'teacher' ? 'teacher' : 'student',
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      gameData: {
        ...createEmptyGameData(cleanName, avatar || (role === 'teacher' ? '🛡️' : '👨‍💻')),
        freePlay: role === 'teacher'
      }
    };

    accounts[cleanUser] = newAccount;
    saveAccounts(accounts);
    setSession(cleanUser);
    syncAccountToCloud(newAccount).catch(() => {});
    return { ok: true, account: newAccount };
  }

  async function login(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const accounts = await ensureSeedAccounts();

    // Try pulling fresh account from optional cloud if not found locally
    if (!accounts[cleanUser] && getCloudUrl()) {
      await pullAllFromCloud().catch(() => {});
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
    accounts[uname].gameData = gameData;
    accounts[uname].updatedAt = new Date().toISOString();
    saveAccounts(accounts);
    syncAccountToCloud(accounts[uname]).catch(() => {});
  }

  function getAllAccountsList() {
    const accounts = loadAccounts();
    return Object.values(accounts);
  }

  function deleteAccount(username) {
    const accounts = loadAccounts();
    if (!accounts[username] || username === getSessionUsername()) return false;
    delete accounts[username];
    saveAccounts(accounts);
    return true;
  }

  async function resetUserPassword(username, newPassword) {
    const accounts = loadAccounts();
    if (!accounts[username]) return false;
    accounts[username].passwordHash = await hashPassword(newPassword, username);
    saveAccounts(accounts);
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

      // Build synthetic stars map only if imported externally without full details
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
        lastLogin: p.ts,
        gameData: mergedData
      };

      saveAccounts(accounts);
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
      'ดาวแคมเปญ (เต็ม 54)', 'แล็บ CLI (เต็ม 14)', 'Packet Defense สูงสุด',
      'คะแนนสอบสูงสุด (เต็ม 15)', 'เกียรติบัตร', 'เหรียญตรา', 'อัปเดตล่าสุด'
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
      const badges = Math.max((g.unlockedBadges || []).length, g.importedBadges || 0);
      lines.push([
        acc.username,
        acc.fullName,
        acc.classroom || '-',
        g.xp || 0,
        stars,
        labs,
        g.defenseHighScore || 0,
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

  /* ==================== OPTIONAL FIREBASE RTDB REST CLOUD SYNC ==================== */
  function getCloudUrl() {
    try {
      return (localStorage.getItem(CLOUD_URL_KEY) || '').trim().replace(/\/+$/, '');
    } catch {
      return '';
    }
  }

  function setCloudUrl(url) {
    const clean = (url || '').trim().replace(/\/+$/, '');
    try {
      if (clean) localStorage.setItem(CLOUD_URL_KEY, clean);
      else localStorage.removeItem(CLOUD_URL_KEY);
    } catch {
      // ignore
    }
    return clean;
  }

  async function syncAccountToCloud(account) {
    const base = getCloudUrl();
    if (!base || !account?.username) return false;
    const safeKey = account.username.replace(/[.#$\[\]]/g, '_');
    const res = await fetch(`${base}/serverops_accounts/${safeKey}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    return res.ok;
  }

  async function pullAllFromCloud() {
    const base = getCloudUrl();
    if (!base) return { ok: false, error: 'ยังไม่ได้ตั้งค่า Firebase Realtime DB URL' };
    try {
      const res = await fetch(`${base}/serverops_accounts.json`);
      if (!res.ok) return { ok: false, error: `เชื่อมต่อไม่สำเร็จ (HTTP ${res.status})` };
      const cloudData = await res.json();
      if (!cloudData || typeof cloudData !== 'object') {
        return { ok: true, count: 0 };
      }
      const local = loadAccounts();
      let count = 0;
      Object.values(cloudData).forEach((acc) => {
        if (!acc || !acc.username) return;
        const prev = local[acc.username];
        if (!prev || (acc.gameData?.xp || 0) >= (prev.gameData?.xp || 0)) {
          local[acc.username] = acc;
          count += 1;
        }
      });
      saveAccounts(local);
      return { ok: true, count };
    } catch {
      return { ok: false, error: 'ไม่สามารถเชื่อมต่อ Cloud ได้ (ตรวจสอบอินเทอร์เน็ตหรือสิทธิ์ Rules ของ Firebase)' };
    }
  }

  return {
    TEACHER_SIGNUP_CODE,
    ensureSeedAccounts,
    createEmptyGameData,
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
    syncAccountToCloud,
    pullAllFromCloud
  };
})();
