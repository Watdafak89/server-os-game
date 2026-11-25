/* ServerOps: Data Center Defender — Complete RPG, Auth, Leaderboard & Teacher Engine */
(() => {
  const PREFS_KEY = 'serverops_prefs_v2';

  /* ==================== UNIFIED XP ECONOMY BALANCING ==================== */
  // Normalize rewards across all modes so Campaign, CLI, VirtualBox, Puzzles, Codex, Arcade & Exam stay well-balanced
  const CONT_STAGE_XP = {
    1: [20, 25, 35],
    2: [25, 30, 42],
    3: [30, 35, 50],
    4: [35, 40, 58],
    5: [40, 45, 65]
  };
  CAMPAIGN_ZONES.forEach((zone) => {
    const c = Math.max(1, Math.min(5, zone.continent || 1));
    const table = CONT_STAGE_XP[c];
    zone.stages.forEach((stage, sIdx) => {
      stage.xp = stage.isBoss ? table[2] : (table[sIdx] ?? table[1]);
    });
  });
  CLI_LABS.forEach((lab, idx) => {
    lab.xp = 30 + Math.round((idx / Math.max(1, CLI_LABS.length - 1)) * 20);
  });
  CHMOD_PUZZLES.forEach((p) => { p.rewardXp = 30; });
  FIREWALL_PUZZLES.forEach((p) => { p.rewardXp = 40; });
  SUBNET_PUZZLES.forEach((p) => { p.rewardXp = 40; });

  const ALL_STAGES_FLAT = CAMPAIGN_ZONES.flatMap((zone) =>
    zone.stages.map((stage) => ({ ...stage, zoneId: zone.id, zoneCode: zone.code, zoneName: zone.name }))
  );

  let prefs = loadPrefs();
  let currentAccount = null;
  let state = AuthSystem.createEmptyGameData('SysAdmin', 'avatar1');
  let selectedRegAvatar = 'avatar1';
  let lbSortBy = 'xp';
  let defIntervalId = null;
  let blitzIntervalId = null;

  function getAvatarTierClass(level, role) {
    if (role === 'teacher') return 'av-tier-teacher';
    const lv = Math.max(1, Math.min(10, Number(level) || 1));
    return `av-tier-lv${lv}`;
  }

  function applyAvatarFrame(el, level, role) {
    if (!el) return;
    el.className = el.className
      .split(/\s+/)
      .filter((c) => c && !c.startsWith('av-tier-') && c !== 'av-framed')
      .join(' ');
    el.classList.add('av-framed', getAvatarTierClass(level, role));
  }

  function avatarHtml(val, sizeCls = 'hud-fit', tierCls = '') {
    const av = resolveAvatar(val);
    const extra = tierCls ? ` ${tierCls}` : '';
    return `<img src="${av.src}" alt="${av.name}" class="avatar-img ${sizeCls}${extra}" />`;
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { theme: 'dark', sound: true, bgm: true, ...JSON.parse(raw) } : { theme: 'dark', sound: true, bgm: true };
    } catch {
      return { theme: 'dark', sound: true, bgm: true };
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }

  function hydrateFromCurrentAccount() {
    currentAccount = AuthSystem.getCurrentAccount();
    if (!currentAccount) {
      state = AuthSystem.createEmptyGameData('SysAdmin', '👨‍💻');
      return false;
    }
    const base = AuthSystem.createEmptyGameData(currentAccount.fullName, currentAccount.gameData?.avatar);
    const saved = currentAccount.gameData || {};
    state = {
      ...base,
      ...saved,
      playerName: currentAccount.fullName,
      inventory: { ...base.inventory, ...(saved.inventory || {}) },
      analytics: { ...base.analytics, ...(saved.analytics || {}) },
      solvedFirewall: saved.solvedFirewall || [],
      solvedSubnet: saved.solvedSubnet || [],
      readChapters: saved.readChapters || [],
      installedVms: saved.installedVms || [],
      warpPassPurchased: Boolean(saved.warpPassPurchased),
      warpedZones: Array.isArray(saved.warpedZones) ? saved.warpedZones : [],
      blitzHighScore: saved.blitzHighScore || 0,
      currentCorrectStreak: saved.currentCorrectStreak || 0,
      bestCorrectStreak: saved.bestCorrectStreak || 0,
      dailyQuests: { ...base.dailyQuests, ...(saved.dailyQuests || {}) }
    };
    if (currentAccount.role !== 'teacher') state.freePlay = false;
    if (currentAccount.role === 'teacher') {
      state.unlockedBadges = BADGES.map((b) => b.id);
      ALL_STAGES_FLAT.forEach((st) => {
        state.stageStars[st.id] = 3;
      });
      state.xp = 9999;
    }
    ensureTodayQuests();
    return true;
  }

  function isTeacherAccount() {
    return currentAccount?.role === 'teacher';
  }

  function isDemoTeacherAccount() {
    return currentAccount?.username === 'teacher';
  }

  function canUseFreePlay() {
    return isTeacherAccount() && Boolean(state.freePlay);
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function ensureTodayQuests() {
    const today = getTodayKey();
    if (!state.dailyQuests || state.dailyQuests.date !== today) {
      state.dailyQuests = { date: today, battlesWon: 0, labsOrPuzzles: 0, arcadePlayed: 0, claimed: [] };
    }
    if (isTeacherAccount()) {
      state.dailyQuests.battlesWon = Math.max(1, state.dailyQuests.battlesWon || 0);
      state.dailyQuests.labsOrPuzzles = Math.max(1, state.dailyQuests.labsOrPuzzles || 0);
      state.dailyQuests.arcadePlayed = Math.max(1, state.dailyQuests.arcadePlayed || 0);
      state.dailyQuests.claimed = ['dq_battle', 'dq_lab', 'dq_arcade'];
    }
  }

  function bumpDailyQuest(field) {
    ensureTodayQuests();
    state.dailyQuests[field] = (state.dailyQuests[field] || 0) + 1;
    saveState();
  }

  function saveState() {
    if (currentAccount) {
      AuthSystem.updateCurrentGameData(state);
      currentAccount = AuthSystem.getCurrentAccount();
    }
  }

  /* ==================== UTILITIES ==================== */
  const $ = (id) => document.getElementById(id);
  let toastTimer = null;

  function showToast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3300);
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function randomizeQuestionChoices(q) {
    if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;
    const indexed = q.options.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
    const shuffled = shuffle(indexed);
    return {
      ...q,
      options: shuffled.map((o) => o.text),
      answer: shuffled.findIndex((o) => o.isCorrect)
    };
  }

  function getTotalStars() {
    return Object.values(state.stageStars).reduce((sum, s) => sum + s, 0);
  }

  function getRankInfo(xp) {
    let idx = 0;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXp) idx = i;
    }
    const cur = RANKS[idx];
    const next = RANKS[idx + 1] || null;
    const pct = next ? Math.min(100, Math.round(((xp - cur.minXp) / (next.minXp - cur.minXp)) * 100)) : 100;
    return { level: idx + 1, title: cur.title, next, pct };
  }

  function recordAnalytics(cat, isCorrect) {
    if (!state.analytics[cat]) state.analytics[cat] = { correct: 0, total: 0 };
    state.analytics[cat].total += 1;
    if (isCorrect) {
      state.analytics[cat].correct += 1;
      state.currentCorrectStreak = (state.currentCorrectStreak || 0) + 1;
      state.bestCorrectStreak = Math.max(state.bestCorrectStreak || 0, state.currentCorrectStreak);
      checkBadges();
    } else {
      state.currentCorrectStreak = 0;
    }
    saveState();
    renderHud();
  }

  function grantRewards(xp, coins) {
    const teacherMax = isTeacherAccount();
    const oldLv = getRankInfo(state.xp).level;
    state.xp = teacherMax ? 9999 : Math.max(0, (state.xp || 0) + xp);
    state.coins = Math.max(0, (state.coins || 0) + coins);
    const newInfo = getRankInfo(state.xp);
    if (!teacherMax && xp > 0 && newInfo.level > oldLv) {
      SoundFX.levelUp();
      showToast(`🎉 LEVEL UP! เลื่อนขั้นเป็น LV.${newInfo.level} — ${newInfo.title}`);
    }
    checkBadges();
    saveState();
    renderHud();
  }

  function deductXp(amount) {
    const prev = Math.max(0, state.xp || 0);
    const loss = Math.max(0, Math.round(Number(amount) || 0));
    const next = Math.max(0, prev - loss);
    const actualLoss = prev - next;
    state.xp = next;
    saveState();
    renderHud();
    return actualLoss;
  }

  const ARCADE_DAILY_XP_CAP = 90;
  function applyArcadeXpCap(rawXp) {
    ensureTodayQuests();
    const earnedToday = Math.max(0, state.dailyQuests.arcadeXpEarned || 0);
    const remaining = Math.max(0, ARCADE_DAILY_XP_CAP - earnedToday);
    const granted = Math.min(Math.max(0, rawXp), remaining);
    state.dailyQuests.arcadeXpEarned = earnedToday + granted;
    return { granted, remainingAfter: Math.max(0, remaining - granted) };
  }

  const CONSOLATION_DAILY_XP_CAP = 30;
  function applyConsolationXpCap(rawXp) {
    ensureTodayQuests();
    const earnedToday = Math.max(0, state.dailyQuests.consolationXpEarned || 0);
    const remaining = Math.max(0, CONSOLATION_DAILY_XP_CAP - earnedToday);
    const granted = Math.min(Math.max(0, rawXp), remaining);
    state.dailyQuests.consolationXpEarned = earnedToday + granted;
    return { granted, remainingAfter: Math.max(0, remaining - granted) };
  }

  function checkBadges() {
    if (isTeacherAccount()) {
      state.unlockedBadges = BADGES.map((b) => b.id);
      return;
    }
    const unlock = (id) => {
      if (!state.unlockedBadges.includes(id)) {
        state.unlockedBadges.push(id);
        const b = BADGES.find((x) => x.id === id);
        if (b) {
          SoundFX.levelUp();
          showToast(`🏆 ปลดล็อกเหรียญตรา: ${b.emoji} ${b.name}`);
        }
      }
    };

    if (Object.keys(state.stageStars).length >= 1) unlock('first_blood');
    if (state.stageStars['z1_boss']) unlock('zone1_clear');
    if (state.stageStars['z2_boss']) unlock('zone2_clear');
    if (state.stageStars['z3_boss']) unlock('zone3_clear');
    if (state.stageStars['z4_boss']) unlock('zone4_clear');
    if (state.stageStars['z5_boss']) unlock('zone5_clear');
    if (state.stageStars['z6_boss']) unlock('final_boss');
    if (state.stageStars['z7_boss']) unlock('zone7_clear');
    if (state.stageStars['z8_boss']) unlock('zone8_clear');
    if (state.stageStars['z9_boss']) unlock('zone9_clear');
    if (state.stageStars['z10_boss']) unlock('zone10_clear');
    if (state.completedLabs.length >= 15) unlock('cli_hero');
    if (state.completedLabs.length >= CLI_LABS.length) unlock('cli_god');
    if (state.defenseHighScore >= 1500) unlock('port_defender');
    if (state.blitzHighScore >= 1200) unlock('blitz_flash');
    if ((state.solvedFirewall || []).length >= FIREWALL_PUZZLES.length) unlock('firewall_ace');
    if ((state.solvedSubnet || []).length >= SUBNET_PUZZLES.length) unlock('subnet_guru');
    if (state.solvedChmod.length >= 4 && state.solvedRaid.length >= 4) unlock('puzzle_master');
    if ((state.installedVms || []).length >= 5) unlock('vbox_master');
    if (state.examPassed) unlock('certified');
    if ((state.bestCorrectStreak || 0) >= 5) unlock('streak_5');
    if ((state.bestCorrectStreak || 0) >= 10) unlock('streak_10');
    if ((state.bestCorrectStreak || 0) >= 20) unlock('streak_20');
    const perfectStages = Object.values(state.stageStars || {}).filter((s) => s >= 3).length;
    if (perfectStages >= 10) unlock('perfectionist');
    if ((state.readChapters || []).length >= 10) unlock('codex_scholar');
    if (Boolean(state.xpBonusAt)) unlock('teacher_star');
    const bossClears = Object.keys(state.stageStars || {}).filter((id) => id.endsWith('_boss') && state.stageStars[id] > 0).length;
    if (bossClears >= 15) unlock('boss_hunter');
  }

  /* ==================== THEME & SOUND ==================== */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', prefs.theme);
    const icon = prefs.theme === 'dark' ? '☀️' : '🌙';
    $('titleThemeBtn').textContent = icon;
    $('hudThemeBtn').textContent = icon;
  }

  function applySound() {
    SoundFX.setEnabled(prefs.sound);
    const icon = prefs.sound ? '🔊' : '🔇';
    $('titleSoundBtn').textContent = icon;
    $('hudSoundBtn').textContent = icon;
  }

  function applyBgm() {
    SoundFX.setBgmEnabled(prefs.bgm);
    const icon = prefs.bgm ? '🎵' : '🔕';
    $('titleBgmBtn').textContent = icon;
    $('hudBgmBtn').textContent = icon;
  }

  function toggleTheme() {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    savePrefs();
    SoundFX.click();
  }

  function toggleSound() {
    prefs.sound = !prefs.sound;
    applySound();
    savePrefs();
    if (prefs.sound) SoundFX.click();
  }

  function toggleBgm() {
    prefs.bgm = !prefs.bgm;
    applyBgm();
    savePrefs();
    showToast(prefs.bgm ? '🎵 เปิดดนตรีพื้นหลังแล้ว' : '🔕 ปิดดนตรีพื้นหลังแล้ว');
  }

  /* ==================== AUTH GATE, TITLE SCREEN & HUD ==================== */
  function showAuthError(msg) {
    const box = $('authErrorBox');
    if (!msg) {
      box.classList.add('hidden');
      box.textContent = '';
    } else {
      box.textContent = `⚠️ ${msg}`;
      box.classList.remove('hidden');
    }
  }

  function showAuthInfo(msg) {
    const box = $('authInfoBox');
    if (!msg) {
      box.classList.add('hidden');
      box.textContent = '';
    } else {
      box.textContent = msg;
      box.classList.remove('hidden');
    }
  }

  function resetStudentFormExtras() {
    $('stuFirstTimeFields').classList.add('hidden');
    $('stuPasswordField').classList.add('hidden');
    $('stuPasswordInput').value = '';
    $('stuSubmitBtn').textContent = '🚀 เข้าสู่ระบบด้วยรหัสนักศึกษา';
  }

  function renderAvatarPicker() {
    const picker = $('avatarPicker');
    picker.innerHTML = '';
    AVATARS.forEach((av) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `avatar-choice ${selectedRegAvatar === av.id ? 'active' : ''}`;
      btn.innerHTML = `
        <img src="${av.src}" alt="${av.name}" />
        <span class="avatar-choice-name">${av.name}</span>
        <span class="avatar-choice-role">${av.role}</span>
      `;
      btn.addEventListener('click', () => {
        SoundFX.click();
        selectedRegAvatar = av.id;
        renderAvatarPicker();
      });
      picker.appendChild(btn);
    });
  }

  function openAvatarModal() {
    SoundFX.click();
    const grid = $('modalAvatarGrid');
    grid.innerHTML = '';
    const currentId = resolveAvatar(state.avatar).id;
    AVATARS.forEach((av) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `modal-avatar-card ${currentId === av.id ? 'active' : ''}`;
      btn.innerHTML = `
        <img src="${av.src}" alt="${av.name}" />
        <strong>${av.name}</strong>
        <span class="muted-text" style="font-size:0.74rem;">${av.role}</span>
      `;
      btn.addEventListener('click', () => {
        SoundFX.coin();
        state.avatar = av.id;
        saveState();
        renderHud();
        renderTitleScreen();
        if (activeRoZoneId) openRoFieldMap(activeRoZoneId);
        else renderRoWorldMap();
        closeAvatarModal();
        showToast(`🎨 เปลี่ยน Avatar เป็น ${av.name} (${av.role}) เรียบร้อย!`);
      });
      grid.appendChild(btn);
    });
    $('avatarModal').classList.remove('hidden');
  }

  function closeAvatarModal() {
    $('avatarModal').classList.add('hidden');
  }

  function updateCloudBadges() {
    const hasCloud = Boolean(AuthSystem.getCloudUrl());
    const hudBadge = $('hudCloudBadge');
    const titleBadge = $('titleCloudStatus');
    if (hudBadge) {
      hudBadge.classList.toggle('connected', hasCloud);
      hudBadge.innerHTML = hasCloud ? '<span>☁️ Cloud</span>' : '<span>💾 Local</span>';
    }
    if (titleBadge) {
      titleBadge.textContent = hasCloud ? '☁️ Cloud Sync Active' : '💾 Local Mode';
    }
  }

  function renderTitleScreen() {
    renderAvatarPicker();
    showAuthError('');
    showAuthInfo('');
    resetStudentFormExtras();
    updateCloudBadges();
    const loggedIn = hydrateFromCurrentAccount();
    const allowFreePlay = isTeacherAccount();
    $('titleFreePlayWrap').classList.toggle('hidden', !allowFreePlay);
    $('titleFreePlayToggle').checked = allowFreePlay && state.freePlay;

    if (loggedIn && currentAccount) {
      $('authGate').classList.add('hidden');
      $('loggedInGate').classList.remove('hidden');
      const rank = getRankInfo(state.xp);
      $('resumeAvatar').innerHTML = `<div class="av-frame-inner">${avatarHtml(state.avatar, 'hud-fit')}</div>`;
      applyAvatarFrame($('resumeAvatar'), rank.level, currentAccount.role);
      $('resumeFullName').textContent = currentAccount.fullName;
      const rBadge = $('resumeRoleBadge');
      rBadge.textContent = currentAccount.role === 'teacher' ? '👨‍🏫 ครูผู้สอน' : '🎓 นักศึกษา';
      rBadge.className = `role-badge ${currentAccount.role === 'teacher' ? 'teacher' : ''}`;
      $('resumeMeta').textContent = `@${currentAccount.username} • ห้อง: ${currentAccount.classroom || '-'}`;

      const maxStars = ALL_STAGES_FLAT.length * 3;
      const unlockedList = BADGES
        .filter((b) => state.unlockedBadges.includes(b.id))
        .sort((a, b) => (b.special ? 1 : 0) - (a.special ? 1 : 0));
      const badgesPreviewHtml = unlockedList.length
        ? `<div class="profile-badges-row">${unlockedList.map((b) =>
          `<span class="profile-badge-chip ${b.special ? 'is-special' : ''}" title="${b.name} — ${b.desc}">${b.emoji} ${b.name}</span>`
        ).join('')}</div>`
        : '';
      $('titleSavePreview').innerHTML = `
        <span class="save-chip">LV.${rank.level} ${rank.title}</span>
        <span class="save-chip">⭐ ${getTotalStars()}/${maxStars} ดาว</span>
        <span class="save-chip">💰 ${state.coins} เหรียญ</span>
        <span class="save-chip">🏆 ${state.unlockedBadges.length}/${BADGES.length} เหรียญตรา</span>
        ${(state.bestCorrectStreak || 0) > 0 ? `<span class="save-chip">🔥 ตอบถูกติดกันสูงสุด ${state.bestCorrectStreak} ข้อ</span>` : ''}
        ${badgesPreviewHtml}
      `;
    } else {
      $('loggedInGate').classList.add('hidden');
      $('authGate').classList.remove('hidden');
    }
  }

  function renderHud() {
    const rank = getRankInfo(state.xp);
    const maxStars = ALL_STAGES_FLAT.length * 3;
    const isTeacher = currentAccount?.role === 'teacher';

    $('hudAvatar').innerHTML = `<div class="av-frame-inner">${avatarHtml(state.avatar, 'hud-fit')}</div>`;
    applyAvatarFrame($('hudAvatar'), rank.level, currentAccount?.role);
    $('hudPlayerName').textContent = currentAccount ? currentAccount.fullName : state.playerName;
    $('hudLevel').textContent = `LV.${rank.level}`;
    const hudRole = $('hudRoleBadge');
    hudRole.textContent = isTeacher ? 'ครูผู้สอน' : 'นักศึกษา';
    hudRole.className = `role-badge sm ${isTeacher ? 'teacher' : ''}`;
    $('hudRank').textContent = `${rank.title} • @${currentAccount?.username || 'guest'}`;
    $('hudXpFill').style.width = `${rank.pct}%`;
    $('hudStars').textContent = `${getTotalStars()}/${maxStars}`;
    $('hudCoins').textContent = state.coins.toLocaleString();
    $('hudXp').textContent = `${state.xp} XP`;
    $('hudBoostBadge').classList.toggle('hidden', !state.xpBoostActive);
    $('shopCoinsDisplay').textContent = state.coins.toLocaleString();
    $('dockTeacherBtn').classList.toggle('hidden', !isTeacher);

    // Render unlocked badge icons directly in top HUD personal profile
    const hudBadgesEl = $('hudBadgesStrip');
    if (hudBadgesEl) {
      const unlockedList = BADGES
        .filter((b) => (state.unlockedBadges || []).includes(b.id))
        .sort((a, b) => (b.special ? 1 : 0) - (a.special ? 1 : 0));
      const shown = unlockedList.slice(0, 8);
      const extra = unlockedList.length - shown.length;
      const curStreak = state.currentCorrectStreak || 0;
      const streakHtml = curStreak >= 2
        ? `<span class="hud-streak-pill" title="กำลังตอบถูกต่อเนื่อง ${curStreak} ข้อ (สูงสุด ${state.bestCorrectStreak || curStreak} ข้อ)">🔥 ${curStreak} ติด</span>`
        : '';
      if (shown.length || streakHtml) {
        hudBadgesEl.innerHTML =
          shown.map((b) =>
            `<span class="hud-badge-ico ${b.special ? 'is-special' : ''}" title="${b.emoji} ${b.name} — ${b.desc}">${b.emoji}</span>`
          ).join('') +
          (extra > 0 ? `<span class="hud-badge-more" title="ดูเหรียญตราทั้งหมด (${unlockedList.length}/${BADGES.length})">+${extra}</span>` : '') +
          streakHtml;
      } else {
        hudBadgesEl.innerHTML = `<span class="hud-badge-more" title="คลิกเพื่อดูรายการเหรียญตรา">🏆 0/${BADGES.length} เหรียญตรา</span>`;
      }
    }
    updateCloudBadges();

    // Auto-fill Exam name/studentId from logged-in account
    if (currentAccount) {
      if (!$('studentNameInput').value.trim()) $('studentNameInput').value = currentAccount.fullName;
      if (!$('studentIdInput').value.trim()) {
        $('studentIdInput').value = `${currentAccount.username}${currentAccount.classroom && currentAccount.classroom !== '-' ? ' • ' + currentAccount.classroom : ''}`;
      }
    }
  }

  function enterGame() {
    if (!hydrateFromCurrentAccount()) {
      showAuthError('กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนเข้าเล่นเกม');
      return;
    }
    SoundFX.levelUp();
    const allowFreePlay = isTeacherAccount();
    state.freePlay = allowFreePlay ? ($('titleFreePlayToggle').checked || state.freePlay) : false;
    $('mapFreePlayWrap').classList.toggle('hidden', !allowFreePlay);
    $('mapFreePlayToggle').checked = allowFreePlay && state.freePlay;
    saveState();

    $('titleScreen').classList.add('hidden');
    $('gameShell').classList.remove('hidden');
    renderHud();
    switchScreen(currentAccount.role === 'teacher' ? 'teacher' : 'map');
  }

  function returnToTitle() {
    SoundFX.click();
    stopDefenseTimer();
    stopBlitzTimer();
    SoundFX.setBgmTrack('town');
    $('gameShell').classList.add('hidden');
    $('titleScreen').classList.remove('hidden');
    renderTitleScreen();
  }

  function handleLogout() {
    SoundFX.click();
    stopDefenseTimer();
    stopBlitzTimer();
    SoundFX.setBgmTrack('town');
    AuthSystem.logout();
    currentAccount = null;
    $('studentNameInput').value = '';
    $('studentIdInput').value = '';
    $('gameShell').classList.add('hidden');
    $('titleScreen').classList.remove('hidden');
    renderTitleScreen();
    showToast('🚪 ออกจากระบบเรียบร้อยแล้ว');
  }

  function switchScreen(screenName) {
    SoundFX.click();
    if (screenName !== 'defense') {
      stopDefenseTimer();
      stopBlitzTimer();
    }
    if (screenName !== 'battle') {
      clearBattleCooldowns();
    }
    if (screenName === 'teacher' && currentAccount?.role !== 'teacher') {
      showToast('⚠️ หน้านี้สงวนสิทธิ์เฉพาะบัญชีครูผู้สอนเท่านั้น');
      return;
    }

    // Adaptive BGM mood per screen
    if (screenName === 'map' || screenName === 'shop' || screenName === 'leaderboard' || screenName === 'badges' || screenName === 'teacher') {
      SoundFX.setBgmTrack('town');
    } else if (screenName === 'codex' || screenName === 'cli' || screenName === 'vbox' || screenName === 'puzzles' || screenName === 'exam') {
      SoundFX.setBgmTrack('study');
    } else if (screenName === 'defense') {
      SoundFX.setBgmTrack('battle');
    }

    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const target = $(`screen-${screenName}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.dock-btn').forEach((btn) => {
      const match = btn.dataset.screen === (screenName === 'battle' ? 'map' : screenName);
      btn.classList.toggle('active', match);
    });

    if (screenName === 'map') {
      renderWorldMap();
      maybePullPeersForMap(false);
    }
    if (screenName === 'cli') {
      renderCliSidebar();
      setTimeout(() => $('terminalInput')?.focus(), 60);
    }
    if (screenName === 'vbox') {
      VBoxSim.render();
    }
    if (screenName === 'shop') renderShop();
    if (screenName === 'codex') renderCodexAndStats();
    if (screenName === 'badges') renderBadgesScreen();
    if (screenName === 'exam') renderExamGate();
    if (screenName === 'puzzles') {
      renderChmodVault();
      renderRaidChallenge();
      renderFirewallPuzzle();
      renderSubnetPuzzle();
    }
    if (screenName === 'defense') {
      $('defHigh').textContent = state.defenseHighScore.toLocaleString();
      $('blitzHigh').textContent = (state.blitzHighScore || 0).toLocaleString();
    }
    if (screenName === 'leaderboard') {
      renderLeaderboard();
      if (AuthSystem.getCloudUrl()) {
        AuthSystem.pullAllFromCloud().then((res) => { if (res.ok) renderLeaderboard(); });
      }
    }
    if (screenName === 'teacher') {
      renderTeacherDashboard();
      if (AuthSystem.getCloudUrl()) {
        AuthSystem.pullAllFromCloud().then((res) => { if (res.ok) renderTeacherDashboard(); });
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==================== DAILY QUESTS & SCREEN 1: CAMPAIGN WORLD MAP ==================== */
  const DAILY_DEFS = [
    { id: 'dq_battle', field: 'battlesWon', target: 1, title: '⚔️ ชนะด่านแคมเปญ 1 ด่าน', xp: 30, coins: 50 },
    { id: 'dq_lab', field: 'labsOrPuzzles', target: 1, title: '🧩 ผ่าน CLI หรือพัซเซิล 1 ข้อ', xp: 25, coins: 45 },
    { id: 'dq_arcade', field: 'arcadePlayed', target: 1, title: '⚡ เล่นโหมดอาร์เคด 1 รอบ', xp: 25, coins: 45 }
  ];

  function renderDailyQuests() {
    ensureTodayQuests();
    $('dailyDateChip').textContent = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    const grid = $('dailyQuestsGrid');
    grid.innerHTML = '';

    DAILY_DEFS.forEach((dq) => {
      const cur = Math.min(dq.target, state.dailyQuests[dq.field] || 0);
      const claimed = (state.dailyQuests.claimed || []).includes(dq.id);
      const ready = cur >= dq.target && !claimed;

      const card = document.createElement('div');
      card.className = `daily-card ${ready ? 'ready' : ''} ${claimed ? 'claimed' : ''}`;
      card.innerHTML = `
        <div>
          <div class="daily-title">${dq.title}</div>
          <div class="daily-sub">ความคืบหน้า: ${cur}/${dq.target} • +${dq.xp}XP 💰${dq.coins}</div>
        </div>
        ${claimed
          ? '<span class="stage-chip">✓ รับแล้ว</span>'
          : (ready
            ? `<button class="btn btn-neon btn-xs dq-claim" data-id="${dq.id}">🎁 รับรางวัล</button>`
            : '<span class="muted-text" style="font-size:0.74rem;">ยังไม่ครบ</span>')}
      `;

      const claimBtn = card.querySelector('.dq-claim');
      if (claimBtn) {
        claimBtn.addEventListener('click', () => {
          state.dailyQuests.claimed.push(dq.id);
          grantRewards(dq.xp, dq.coins);
          SoundFX.coin();
          showToast(`🎁 รับรางวัลภารกิจประจำวัน +${dq.xp} XP และ +💰${dq.coins}!`);
          renderDailyQuests();
        });
      }
      grid.appendChild(card);
    });
  }

  let mapViewMode = 'ro'; // 'ro' | 'list'
  let activeRoZoneId = null;
  let activeContinentId = 1;
  let mapPeerFilter = 'all'; // 'all' | 'class'
  let lastMapCloudPull = 0;

  function checkStudentRemoteMapReset() {
    if (!currentAccount || isTeacherAccount()) return false;
    const fresh = AuthSystem.getCurrentAccount();
    const freshMapReset = fresh?.gameData?.mapResetAt ? new Date(fresh.gameData.mapResetAt).getTime() : 0;
    const localMapReset = state?.mapResetAt ? new Date(state.mapResetAt).getTime() : 0;
    const freshXpReset = fresh?.gameData?.xpResetAt ? new Date(fresh.gameData.xpResetAt).getTime() : 0;
    const localXpReset = state?.xpResetAt ? new Date(state.xpResetAt).getTime() : 0;
    const freshXpBonus = fresh?.gameData?.xpBonusAt ? new Date(fresh.gameData.xpBonusAt).getTime() : 0;
    const localXpBonus = state?.xpBonusAt ? new Date(state.xpBonusAt).getTime() : 0;
    if (freshMapReset > localMapReset) {
      hydrateFromCurrentAccount();
      activeRoZoneId = null;
      activeContinentId = 1;
      renderHud();
      showToast('🔄 ครูผู้สอนได้รีเซ็ตการตะลุยแผนที่ของคุณกลับสู่จุดเริ่มต้น (Zone 1) แล้ว!');
      return true;
    }
    if (freshXpReset > localXpReset) {
      hydrateFromCurrentAccount();
      renderHud();
      showToast('⚡ ครูผู้สอนได้รีเซ็ตค่า XP ของคุณกลับเป็น 0 แล้ว!');
      return true;
    }
    if (freshXpBonus > localXpBonus) {
      hydrateFromCurrentAccount();
      checkBadges();
      saveState();
      renderHud();
      SoundFX.levelUp();
      const b = state.lastXpBonus || {};
      const amt = b.amount || 0;
      const reason = b.reason ? ` (${b.reason})` : '';
      showToast(`🎉 ครูผู้สอนมอบโบนัส ${amt >= 0 ? '+' : ''}${amt} XP ให้คุณ!${reason}`);
      return true;
    }
    return false;
  }

  function maybePullPeersForMap(force = false) {
    if (!AuthSystem.getCloudUrl()) return;
    const now = Date.now();
    if (!force && now - lastMapCloudPull < 20000) return;
    lastMapCloudPull = now;
    AuthSystem.pullAllFromCloud().then((res) => {
      if (res.ok) {
        const wasReset = checkStudentRemoteMapReset();
        if ($('screen-map')?.classList.contains('active')) {
          renderWorldMap();
          if (force && !wasReset) showToast('☁️ อัปเดตตำแหน่งผู้เล่นอื่นล่าสุดจาก Cloud แล้ว!');
        }
      }
    });
  }

  function getAccountFrontierInfo(acc) {
    const g = acc.gameData || {};
    const starsMap = g.stageStars || {};
    let frontierIdx = 0;
    let clearedZones = 0;
    let highestStarZoneIdx = 0;

    CAMPAIGN_ZONES.forEach((z, idx) => {
      const hasAnyStar = z.stages.some((st) => (starsMap[st.id] || 0) > 0);
      if (hasAnyStar) highestStarZoneIdx = Math.max(highestStarZoneIdx, idx);
      const boss = z.stages[z.stages.length - 1];
      if ((starsMap[boss.id] || 0) > 0) {
        clearedZones += 1;
        if (idx + 1 < CAMPAIGN_ZONES.length) frontierIdx = Math.max(frontierIdx, idx + 1);
        else frontierIdx = idx;
      }
    });

    const targetIdx = Math.max(frontierIdx, highestStarZoneIdx);
    const zone = CAMPAIGN_ZONES[targetIdx] || CAMPAIGN_ZONES[0];
    const totalStars = Math.max(
      Object.values(starsMap).reduce((s, x) => s + x, 0),
      g.importedStars || 0
    );
    return {
      acc,
      isMe: Boolean(currentAccount && acc.username === currentAccount.username),
      zone,
      zoneIdx: targetIdx,
      zoneNum: targetIdx + 1,
      continent: zone.continent || 1,
      clearedZones,
      totalStars,
      xp: g.xp || 0,
      avatar: g.avatar || 'avatar1',
      pct: Math.round((clearedZones / CAMPAIGN_ZONES.length) * 100)
    };
  }

  function getMapPeersSnapshot() {
    const myClass = (currentAccount?.classroom || '').trim();
    const all = AuthSystem.getAllAccountsList()
      .filter((a) => a.role !== 'teacher' || (currentAccount && a.username === currentAccount.username))
      .map(getAccountFrontierInfo)
      .filter((info) => {
        if (mapPeerFilter === 'class' && myClass && myClass !== '-') {
          return (info.acc.classroom || '').trim() === myClass || info.isMe;
        }
        return true;
      })
      .sort((a, b) => b.clearedZones - a.clearedZones || b.totalStars - a.totalStars || b.xp - a.xp);

    const othersByZone = {};
    const othersByContinent = {};
    all.forEach((p) => {
      if (p.isMe) return;
      if (!othersByZone[p.zone.id]) othersByZone[p.zone.id] = [];
      othersByZone[p.zone.id].push(p);
      othersByContinent[p.continent] = (othersByContinent[p.continent] || 0) + 1;
    });

    return { all, othersByZone, othersByContinent };
  }

  function renderMapPeersPanel(snap) {
    const grid = $('mapPeersGrid');
    if (!grid) return;

    const myClass = (currentAccount?.classroom || '').trim();
    $('mapPeerClassBtn').classList.toggle('hidden', !myClass || myClass === '-');
    $('mapPeerAllBtn').className = `btn btn-xs ${mapPeerFilter === 'all' ? 'btn-neon' : 'btn-ghost'}`;
    $('mapPeerClassBtn').className = `btn btn-xs ${mapPeerFilter === 'class' ? 'btn-neon' : 'btn-ghost'}`;
    $('mapSyncPeersBtn').classList.toggle('hidden', !AuthSystem.getCloudUrl());

    const maxStars = ALL_STAGES_FLAT.length * 3;
    const otherCount = snap.all.filter((p) => !p.isMe).length;
    $('mapPeersCountChip').textContent = `${otherCount} เพื่อน • รวม ${snap.all.length} คน`;

    if (!snap.all.length) {
      grid.innerHTML = '<div class="muted-text" style="grid-column:1/-1;text-align:center;padding:1rem;">ยังไม่มีข้อมูลผู้เล่นอื่นบนแผนที่</div>';
      return;
    }

    grid.innerHTML = '';
    snap.all.slice(0, 24).forEach((p, idx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `map-peer-card ${p.isMe ? 'is-me' : ''}`;
      card.innerHTML = `
        <div class="peer-rank-num">#${idx + 1}</div>
        <div class="peer-av-wrap">${avatarHtml(p.avatar, 'hud-fit')}</div>
        <div class="peer-info">
          <div class="peer-name-row">
            <strong>${p.acc.fullName}</strong>
            ${p.isMe ? '<span class="role-badge sm">คุณ</span>' : ''}
          </div>
          <div class="peer-zone-tag" style="color:${p.zone.themeColor};">📍 ${p.zone.code}: ${p.zone.roName}</div>
          <div class="peer-meta-row">
            <span>ผ่าน ${p.clearedZones}/${CAMPAIGN_ZONES.length} โซน</span>
            <span>⭐ ${p.totalStars}/${maxStars}</span>
          </div>
          <div class="hud-xp-bar" style="height:5px;margin-top:0.25rem;">
            <div class="hud-xp-fill" style="width:${Math.max(2, p.pct)}%"></div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        SoundFX.click();
        activeContinentId = p.continent;
        activeRoZoneId = null;
        renderWorldMap();
        $('roPreviewTitle').textContent = `👤 ${p.acc.fullName} กำลังอยู่ที่ [${p.zone.code}] ${p.zone.roName}`;
        $('roPreviewDesc').textContent = `ผ่านแล้ว ${p.clearedZones}/${CAMPAIGN_ZONES.length} โซน • สะสม ⭐ ${p.totalStars}/${maxStars} • ${p.xp} XP`;
        $('roWorldMapWrap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      grid.appendChild(card);
    });
  }

  function renderContinentBar(snap) {
    const bar = $('continentTabsBar');
    if (!bar || typeof WORLD_CONTINENTS === 'undefined') return;
    const peerMap = snap || getMapPeersSnapshot();
    bar.innerHTML = '';

    WORLD_CONTINENTS.forEach((cont) => {
      const cZones = CAMPAIGN_ZONES.map((z, idx) => ({ z, idx })).filter(({ z }) => (z.continent || 1) === cont.id);
      const earned = cZones.reduce((sum, { z }) => sum + z.stages.reduce((s, st) => s + (state.stageStars[st.id] || 0), 0), 0);
      const maxS = cZones.reduce((sum, { z }) => sum + z.stages.length * 3, 0);
      const unlocked = cZones.some(({ idx }) => isZoneUnlocked(idx));
      const active = cont.id === activeContinentId;
      const peersHere = peerMap.othersByContinent[cont.id] || 0;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `continent-tab ${active ? 'active' : ''} ${unlocked ? '' : 'locked-cont'}`;
      btn.style.setProperty('--cont-color', cont.theme);
      btn.innerHTML = `
        <div class="cont-tab-top">
          <span class="cont-badge">${cont.badge}</span>
          <span class="cont-range">${cont.range}</span>
        </div>
        <div class="cont-name">${cont.name.replace(/^ทวีปที่ \d+:\s*/, '')}</div>
        <div class="cont-foot-row">
          <span class="cont-stars">${unlocked ? `⭐ ${earned}/${maxS}` : '🔒 ล็อกอยู่'}</span>
          ${peersHere > 0 ? `<span class="cont-peer-pill">👥 ${peersHere}</span>` : ''}
        </div>
      `;
      btn.addEventListener('click', () => {
        SoundFX.click();
        activeContinentId = cont.id;
        activeRoZoneId = null;
        renderWorldMap();
      });
      bar.appendChild(btn);
    });
  }

  /* ==================== MAP ZONE LOCK MODE LOGIC ==================== */
  function getMapLockConfig() {
    return AuthSystem.getMapLockConfig();
  }

  function getMapLockModeShortLabel(cfg) {
    const c = cfg || getMapLockConfig();
    if (c.mode === 'unlock_all') return 'เปิดทุกโซน';
    if (c.mode === 'up_to') return `เปิดถึง Z${c.maxZone}`;
    if (c.mode === 'custom') return `กำหนดเอง (${(c.unlockedZones || []).length}/${CAMPAIGN_ZONES.length})`;
    return 'ตามลำดับ';
  }

  function getMapLockModeLongLabel(cfg) {
    const c = cfg || getMapLockConfig();
    if (c.mode === 'unlock_all') {
      return '🔓 โหมดปลดล็อกทุกโซน — นักศึกษาสามารถเข้าเล่นได้อิสระครบทั้ง 50 โซน';
    }
    if (c.mode === 'up_to') {
      const sub = c.upToFreeAccess
        ? 'เข้าโซน 1–' + c.maxZone + ' ได้อิสระทันที'
        : 'เล่นตามลำดับภายในโซน 1–' + c.maxZone;
      return `🚧 โหมดจำกัดโซน — เปิดถึง Zone ${c.maxZone} (${sub} • โซน ${Math.min(50, c.maxZone + 1)}–50 ล็อกโดยครูผู้สอน)`;
    }
    if (c.mode === 'custom') {
      const n = (c.unlockedZones || []).length;
      const sub = c.customFreeAccess ? 'เข้าโซนที่เปิดได้ทันที' : 'ต้องผ่านตามลำดับภายในโซนที่เปิด';
      return `🎛️ โหมดกำหนดรายโซน — ครูผู้สอนเปิดให้เล่น ${n}/${CAMPAIGN_ZONES.length} โซน (${sub})`;
    }
    return '🔒 โหมดล็อกตามลำดับ (ค่าเริ่มต้น) — ผ่าน MVP Boss ของโซนก่อนหน้าเพื่อเปิดโซนถัดไป';
  }

  function getZonePolicyForStudents(zoneIdx, cfg) {
    const c = cfg || getMapLockConfig();
    const zone = CAMPAIGN_ZONES[zoneIdx];
    if (!zone) return { teacherLocked: true, freeEntry: false };
    const zoneNum = zoneIdx + 1;

    if (c.mode === 'unlock_all') {
      return { teacherLocked: false, freeEntry: true };
    }
    if (c.mode === 'up_to') {
      if (zoneNum > c.maxZone) {
        return { teacherLocked: true, freeEntry: false };
      }
      return { teacherLocked: false, freeEntry: Boolean(c.upToFreeAccess) };
    }
    if (c.mode === 'custom') {
      const isOpen = (c.unlockedZones || []).includes(zone.id);
      if (!isOpen) {
        return { teacherLocked: true, freeEntry: false };
      }
      return { teacherLocked: false, freeEntry: Boolean(c.customFreeAccess) };
    }
    return { teacherLocked: false, freeEntry: false };
  }

  function isZoneTeacherLocked(zoneIdx) {
    return getZonePolicyForStudents(zoneIdx).teacherLocked;
  }

  function isZoneUnlocked(zoneIdx) {
    if (canUseFreePlay()) return true;
    const zone = CAMPAIGN_ZONES[zoneIdx];
    if (!zone) return false;
    const policy = getZonePolicyForStudents(zoneIdx);
    if (policy.teacherLocked) return false;
    if (policy.freeEntry || zoneIdx === 0) return true;
    if ((state.warpedZones || []).includes(zone.id)) return true;
    const prevZone = CAMPAIGN_ZONES[zoneIdx - 1];
    const prevBoss = prevZone.stages[prevZone.stages.length - 1];
    return Boolean(state.stageStars[prevBoss.id]);
  }

  function isStageUnlocked(flatIdx) {
    if (canUseFreePlay()) return true;
    const stage = ALL_STAGES_FLAT[flatIdx];
    if (!stage) return false;
    const zoneIdx = CAMPAIGN_ZONES.findIndex((z) => z.id === stage.zoneId);
    if (zoneIdx === -1) return false;
    const policy = getZonePolicyForStudents(zoneIdx);
    if (policy.teacherLocked) return false;
    if (flatIdx === 0) return true;
    if (stage.id.endsWith('_s1')) {
      if (policy.freeEntry) return true;
      if ((state.warpedZones || []).includes(stage.zoneId)) return true;
    }
    const prevStage = ALL_STAGES_FLAT[flatIdx - 1];
    return Boolean(state.stageStars[prevStage.id]);
  }

  function useWarpPassOnZone(zone) {
    if (!state.inventory || (state.inventory.warp_pass || 0) <= 0) return;
    const ok = confirm(
      `🌀 ต้องการใช้ "Dimensional Zone Warp Pass" (1 ชิ้นสุดท้าย) เพื่อปลดล็อกข้ามไปยัง [${zone.code}: ${zone.roName} — ${zone.name}] ใช่หรือไม่?\n\n⚠️ หมายเหตุ: ไอเทมนี้ซื้อได้เพียง 1 ครั้งต่อบัญชี เมื่อใช้แล้วจะไม่สามารถซื้อเพิ่มได้อีก`
    );
    if (!ok) return;

    state.inventory.warp_pass = Math.max(0, (state.inventory.warp_pass || 1) - 1);
    if (!Array.isArray(state.warpedZones)) state.warpedZones = [];
    if (!state.warpedZones.includes(zone.id)) state.warpedZones.push(zone.id);
    saveState();
    SoundFX.levelUp();
    showToast(`🌀 ปลดล็อกข้ามมิติสู่ ${zone.code}: ${zone.roName} สำเร็จ! เข้าปราบมอนสเตอร์ได้เลย!`);
    if (mapViewMode === 'ro') {
      renderContinentBar();
      openRoFieldMap(zone.id);
    } else {
      renderWorldMap();
    }
  }

  function renderRoWorldMap(snap) {
    const routesLayer = $('roRoutesLayer');
    const pinsLayer = $('roPinsLayer');
    routesLayer.innerHTML = '';
    pinsLayer.innerHTML = '';
    const peerMap = snap || getMapPeersSnapshot();

    const contInfo = (typeof WORLD_CONTINENTS !== 'undefined' && WORLD_CONTINENTS.find((c) => c.id === activeContinentId)) || null;
    if (contInfo) {
      $('roMapTopTitle').textContent = `🧭 ${contInfo.name} (${contInfo.range})`;
      $('roMapTopHint').textContent = contInfo.subtitle;
    }
    const canvas = $('roWorldCanvas');
    if (canvas) canvas.className = `ro-map-canvas continent-${activeContinentId}`;

    // Filter the 10 zones belonging to the active continent
    const continentEntries = CAMPAIGN_ZONES
      .map((zone, zIdx) => ({ zone, zIdx }))
      .filter(({ zone }) => (zone.continent || 1) === activeContinentId);

    // Find current frontier zone for hopping player avatar
    let currentTargetZoneId = CAMPAIGN_ZONES[CAMPAIGN_ZONES.length - 1].id;
    for (let i = 0; i < CAMPAIGN_ZONES.length; i++) {
      const z = CAMPAIGN_ZONES[i];
      const allCleared = z.stages.every((s) => Boolean(state.stageStars[s.id]));
      if (isZoneUnlocked(i) && !allCleared) {
        currentTargetZoneId = z.id;
        break;
      }
    }

    // 1. Draw SVG travel routes connecting the 10 regions on this continent
    for (let i = 0; i < continentEntries.length - 1; i++) {
      const a = continentEntries[i].zone;
      const b = continentEntries[i + 1].zone;
      const bIdx = continentEntries[i + 1].zIdx;
      const x1 = a.mapX * 10;
      const y1 = a.mapY * 6;
      const x2 = b.mapX * 10;
      const y2 = b.mapY * 6;
      const unlockedRoute = isZoneUnlocked(bIdx);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', unlockedRoute ? '#fde047' : 'rgba(148,163,184,0.45)');
      line.setAttribute('stroke-width', unlockedRoute ? '4.5' : '3');
      line.setAttribute('stroke-dasharray', unlockedRoute ? '10 6' : '6 8');
      line.setAttribute('stroke-linecap', 'round');
      routesLayer.appendChild(line);
    }

    function shortPeerName(name) {
      const cleaned = String(name || 'ผู้เล่น').replace(/^(นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง)\s*/u, '').trim();
      const first = cleaned.split(/\s+/)[0] || cleaned;
      return first.length > 11 ? first.slice(0, 10) + '…' : first;
    }

    function renderPreviewPeers(peersList) {
      const box = $('roPreviewPeers');
      if (!box) return;
      if (!peersList || !peersList.length) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
      }
      box.classList.remove('hidden');
      box.innerHTML = `
        <div class="zone-peers-lbl">👥 เพื่อนในโซนนี้ (${peersList.length} คน):</div>
        <div class="zone-peers-rows">
          ${peersList.map((p) => `
            <div class="zone-peer-line">
              <span class="peer-av-1cm">${avatarHtml(p.avatar, 'hud-fit')}</span>
              <span class="peer-chip-name">${p.acc.fullName}</span>
              <span class="peer-chip-star">⭐${p.totalStars}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 2. Render clickable RO Region Pins (10 per continent) + Animated Boss Hover Hologram
    const bossHoverCard = $('roBossHoverCard');
    const hideBossHoverCard = () => {
      if (!bossHoverCard) return;
      bossHoverCard.classList.add('hidden');
      bossHoverCard.setAttribute('aria-hidden', 'true');
    };
    hideBossHoverCard();
    if (canvas) {
      canvas.onmouseleave = hideBossHoverCard;
    }

    const showBossHoverCard = (zone, bossStage, { unlocked, teacherLocked, canWarpHere, cleared, earned, maxS, peersHere = [] }) => {
      if (!bossHoverCard || !bossStage) return;
      const isLockedView = !unlocked && !canWarpHere;
      const hasPeers = peersHere.length > 0;
      const clampedX = hasPeers
        ? Math.max(27, Math.min(73, zone.mapX))
        : Math.max(18, Math.min(82, zone.mapX));
      const placeBelow = zone.mapY < 48;
      const topPct = placeBelow ? Math.min(68, zone.mapY + 12) : Math.max(12, zone.mapY - 11);

      const statusLabel = cleared
        ? '✅ พิชิตแล้ว'
        : (unlocked
          ? '🔓 เปิดให้ท้าสู้'
          : (canWarpHere ? '🌀 วาร์ปได้' : (teacherLocked ? '🔐 ครูล็อก' : '🔒 ล็อกอยู่')));
      const ctaText = unlocked
        ? (cleared ? '✨ คลิกเพื่อเข้าไปทบทวนด่านอีกครั้ง' : '⚔️ คลิกที่โซนเพื่อเข้าท้าสู้บอส!')
        : (canWarpHere
          ? '🌀 คลิกเพื่อใช้ตั๋ววาร์ปปลดล็อกโซนนี้ทันที!'
          : (teacherLocked
            ? '🔐 รอครูผู้สอนปลดล็อกโซนนี้ตามแผนการสอน'
            : '🔒 ปราบ MVP Boss โซนก่อนหน้าเพื่อปลดล็อก'));

      const peersPaneHtml = hasPeers
        ? `<div class="ro-boss-peers-col">
            <div class="ro-boss-peers-head">👥 เพื่อนในโซนนี้ (${peersHere.length} คน)</div>
            <div class="ro-boss-peers-list">
              ${peersHere.slice(0, 8).map((p) => `
                <div class="ro-boss-peer-item">
                  <span class="peer-av-1cm">${avatarHtml(p.avatar, 'hud-fit')}</span>
                  <span class="ro-boss-peer-name">${p.acc.fullName}</span>
                  <span class="ro-boss-peer-star">⭐${p.totalStars}</span>
                </div>
              `).join('')}
              ${peersHere.length > 8 ? `<div class="ro-boss-peer-more">และเพื่อนอีก ${peersHere.length - 8} คน...</div>` : ''}
            </div>
          </div>`
        : '';

      bossHoverCard.className = `ro-boss-hover-card ${placeBelow ? 'pos-below' : ''} ${isLockedView ? 'is-locked-boss' : ''} ${hasPeers ? 'has-peers-pane' : ''}`;
      bossHoverCard.style.left = `${clampedX}%`;
      bossHoverCard.style.top = `${topPct}%`;
      bossHoverCard.style.setProperty('--boss-accent', zone.themeColor || '#38bdf8');
      bossHoverCard.setAttribute('aria-hidden', 'false');
      bossHoverCard.innerHTML = `
        <div class="ro-boss-col">
          <div class="ro-boss-hover-stage">
            <div class="ro-boss-holo-ring"></div>
            <div class="ro-boss-holo-scan"></div>
            <span class="ro-boss-crown-pill">👑 MVP BOSS</span>
            <span class="ro-boss-status-pill ${isLockedView ? 'locked' : ''}">${statusLabel}</span>
            <div class="ro-boss-hover-sprite">${AnimeSprites.getEnemySprite(bossStage.id)}</div>
          </div>
          <div class="ro-boss-hover-name">${bossStage.enemy.name}</div>
          <div class="ro-boss-hover-zone">${zone.code}: ${zone.roName} • ${zone.lvRange}</div>
          <div class="ro-boss-hover-stats">
            <span class="ro-boss-stat-chip">❤️ HP ${bossStage.enemy.hp}</span>
            <span class="ro-boss-stat-chip">⚡ +${bossStage.xp} XP</span>
            <span class="ro-boss-stat-chip">⭐ ${earned}/${maxS}</span>
          </div>
          <div class="ro-boss-hover-cta">${ctaText}</div>
        </div>
        ${peersPaneHtml}
      `;
    };

    const hasWarpPass = (state.inventory?.warp_pass || 0) > 0;
    continentEntries.forEach(({ zone, zIdx }) => {
      const unlocked = isZoneUnlocked(zIdx);
      const teacherLocked = isZoneTeacherLocked(zIdx);
      const canWarpHere = !unlocked && !teacherLocked && hasWarpPass;
      const earned = zone.stages.reduce((s, st) => s + (state.stageStars[st.id] || 0), 0);
      const maxS = zone.stages.length * 3;
      const cleared = zone.stages.every((st) => Boolean(state.stageStars[st.id]));
      const isCurrent = zone.id === currentTargetZoneId;
      const bossStage = zone.stages[zone.stages.length - 1];
      const peersHere = peerMap.othersByZone[zone.id] || [];

      let peerLabelHtml = '';
      let peerPopoverHtml = '';
      if (peersHere.length > 0) {
        const shownOnPin = peersHere.slice(0, 2);
        const extraOnPin = peersHere.length - shownOnPin.length;
        peerLabelHtml = `
          <div class="ro-pin-peers-rows">
            ${shownOnPin.map((p) => `
              <div class="ro-pin-peer-row">
                <span class="peer-av-1cm">${avatarHtml(p.avatar, 'hud-fit')}</span>
                <span class="ro-peer-tag-name">${shortPeerName(p.acc.fullName)}</span>
              </div>
            `).join('')}
            ${extraOnPin > 0 ? `<div class="ro-pin-peer-more">👥 + อีก ${extraOnPin} คน (ชี้เพื่อดูทั้งหมด)</div>` : ''}
          </div>
        `;
      }
      if (peersHere.length > 1) {
        const popPos = zone.mapY < 38 ? 'pop-bottom' : 'pop-top';
        peerPopoverHtml = `
          <div class="ro-pin-peer-popover ${popPos}">
            <div class="pop-head">👥 เพื่อนในโซนนี้ (${peersHere.length} คน)</div>
            <div class="pop-grid">
              ${peersHere.slice(0, 8).map((p) => `
                <div class="pop-row">
                  <span class="peer-av-1cm">${avatarHtml(p.avatar, 'hud-fit')}</span>
                  <span class="pop-name">${p.acc.fullName}</span>
                  <span class="pop-star">⭐${p.totalStars}</span>
                </div>
              `).join('')}
              ${peersHere.length > 8 ? `<div class="pop-more">และเพื่อนอีก ${peersHere.length - 8} คน...</div>` : ''}
            </div>
          </div>
        `;
      }

      const pin = document.createElement('button');
      pin.type = 'button';
      const isPinLocked = !unlocked && !canWarpHere;
      pin.className = `ro-pin ${cleared ? 'cleared' : ''} ${isCurrent ? 'current-target' : ''} ${canWarpHere ? 'can-warp' : ''} ${teacherLocked ? 'teacher-locked' : ''} ${isPinLocked ? 'is-locked' : ''} ${peersHere.length ? 'has-peers' : ''}`;
      pin.style.left = `${zone.mapX}%`;
      pin.style.top = `${zone.mapY}%`;
      pin.style.setProperty('--zone-color', zone.themeColor);
      if (isPinLocked) pin.setAttribute('aria-disabled', 'true');
      const pinMetaText = canWarpHere
        ? '🌀 คลิกใช้ตั๋ววาร์ป!'
        : (teacherLocked && !unlocked
          ? '🔐 ล็อกโดยครู'
          : (teacherLocked && canUseFreePlay()
            ? `🔐 ปิดสำหรับ นศ. • ⭐${earned}/${maxS}`
            : `${zone.lvRange} • ⭐${earned}/${maxS}`));
      pin.innerHTML = `
        <div class="ro-pin-orb">
          ${isCurrent ? `<span class="ro-pin-player">${avatarHtml(state.avatar, 'map-pin')}</span>` : ''}
          <span class="ro-pin-art">${unlocked ? AnimeSprites.getZoneIcon(zone.id, zone.tag) : (canWarpHere ? '🌀' : (teacherLocked ? '🔐' : '🔒'))}</span>
        </div>
        <div class="ro-pin-plate">
          <span class="ro-pin-name">${zone.code}: ${zone.roName}</span>
          <span class="ro-pin-meta">${pinMetaText}</span>
        </div>
        ${peerLabelHtml}
      `;

      const updatePreview = () => {
        $('roPreviewTitle').textContent = `[${zone.code} • ${zone.roCode}] ${zone.roName} — ${zone.name} (${zone.lvRange})`;
        $('roPreviewDesc').textContent = unlocked
          ? `${teacherLocked && canUseFreePlay() ? '🔐 [ล็อกสำหรับนักศึกษา] ' : ''}${zone.subtitle} • 👑 MVP: ${bossStage.enemy.name}`
          : (teacherLocked
            ? `🔐 โซนนี้ถูกล็อกโดยครูผู้สอนชั่วคราว — รอครูผู้สอนปลดล็อกตามแผนการสอน!`
            : (canWarpHere
              ? `🌀 คลิกเพื่อใช้ Dimensional Zone Warp Pass ปลดล็อกข้ามโซนทันที! • 👑 MVP: ${bossStage.enemy.name}`
              : `🔒 ล็อกอยู่ — ปราบ MVP Boss ของโซนก่อนหน้าให้สำเร็จเพื่อปลดล็อก!`));
        renderPreviewPeers(peersHere);
      };

      const onPinHover = () => {
        updatePreview();
        showBossHoverCard(zone, bossStage, { unlocked, teacherLocked, canWarpHere, cleared, earned, maxS, peersHere });
      };

      pin.addEventListener('mouseenter', onPinHover);
      pin.addEventListener('focus', onPinHover);
      pin.addEventListener('mouseleave', hideBossHoverCard);
      pin.addEventListener('blur', hideBossHoverCard);
      pin.addEventListener('click', () => {
        if (unlocked) {
          hideBossHoverCard();
          SoundFX.shield();
          openRoFieldMap(zone.id);
        } else if (canWarpHere) {
          hideBossHoverCard();
          useWarpPassOnZone(zone);
        } else {
          SoundFX.wrong();
          showToast(teacherLocked ? '🔐 โซนนี้ถูกล็อกโดยครูผู้สอนชั่วคราว' : '🔒 ปราบ MVP Boss ของโซนก่อนหน้าเพื่อปลดล็อก!');
        }
      });

      pinsLayer.appendChild(pin);
    });

    // Show current target zone (or first zone in this continent) info by default
    const defEntry = continentEntries.find((e) => e.zone.id === currentTargetZoneId) || continentEntries[0];
    if (defEntry) {
      const defZone = defEntry.zone;
      const defBoss = defZone.stages[defZone.stages.length - 1];
      $('roPreviewTitle').textContent = `[${defZone.code} • ${defZone.roCode}] ${defZone.roName} — ${defZone.name} (${defZone.lvRange})`;
      $('roPreviewDesc').textContent = `${defZone.subtitle} • 👑 MVP: ${defBoss.enemy.name} • คลิกที่ไอคอนเมืองบนแผนที่เพื่อเข้าไปตะลุยด่าน!`;
      renderPreviewPeers(peerMap.othersByZone[defZone.id] || []);
    }
  }

  function openRoFieldMap(zoneId) {
    const zIdx = CAMPAIGN_ZONES.findIndex((z) => z.id === zoneId);
    if (zIdx === -1) return;
    const zone = CAMPAIGN_ZONES[zIdx];
    activeRoZoneId = zoneId;

    $('roWorldMapWrap').classList.add('hidden');
    $('worldMapContainer').classList.add('hidden');
    $('roFieldView').classList.remove('hidden');

    const earned = zone.stages.reduce((s, st) => s + (state.stageStars[st.id] || 0), 0);
    const maxS = zone.stages.length * 3;
    $('roFieldCode').textContent = zone.roCode;
    $('roFieldName').textContent = `${zone.roName} (${zone.name})`;
    $('roFieldLv').textContent = zone.lvRange;
    $('roFieldStars').textContent = `⭐ ${earned}/${maxS}`;

    const ground = $('roFieldGround');
    ground.className = `ro-field-ground ${zone.biome}`;
    const playerTierCls = getAvatarTierClass(getRankInfo(state.xp).level, currentAccount?.role);
    $('roFieldPlayerSprite').innerHTML = avatarHtml(state.avatar, 'walker', playerTierCls);
    $('roFieldPlayerName').textContent = state.playerName;
    $('roFieldPlayer').classList.remove('dash-attack');

    // Render 3 Monsters / MVP inside this field
    const monstersWrap = $('roFieldMonsters');
    monstersWrap.innerHTML = '';

    zone.stages.forEach((stage) => {
      const flatIdx = ALL_STAGES_FLAT.findIndex((s) => s.id === stage.id);
      const flatStage = ALL_STAGES_FLAT[flatIdx];
      const unlocked = isStageUnlocked(flatIdx);
      const stars = state.stageStars[stage.id] || 0;
      const starStr = stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : (unlocked ? '☆☆☆' : '🔒 ล็อกอยู่');

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `ro-monster-card ${stars > 0 ? 'cleared' : ''} ${stage.isBoss ? 'mvp-card' : ''}`;
      card.disabled = !unlocked;
      card.innerHTML = `
        ${stage.isBoss ? '<span class="ro-mvp-crown">👑 MVP BOSS</span>' : ''}
        <div class="ro-monster-sprite ${unlocked ? 'has-anime-art' : ''}">${unlocked ? AnimeSprites.getEnemySprite(stage.id) : '🔒'}</div>
        <div class="ro-monster-name">${stage.enemy.name}</div>
        <div class="ro-monster-stage">${stage.title}</div>
        <div class="node-stars">${starStr}</div>
        <div class="node-reward">+${stage.xp}XP • 💰${stage.coins}</div>
        <div class="ro-fight-cta">${unlocked ? (stage.isBoss ? '⚔️ ท้าสู้ MVP!' : '⚔️ เข้าโจมตี!') : '🔒 ผ่านตัวก่อนหน้า'}</div>
      `;

      card.addEventListener('click', () => {
        if (!unlocked) return;
        SoundFX.attack();
        $('roFieldPlayer').classList.add('dash-attack');
        setTimeout(() => {
          $('roFieldPlayer').classList.remove('dash-attack');
          startBattle(flatStage);
        }, 240);
      });

      monstersWrap.appendChild(card);
    });

    // Next Zone Warp Portal
    const nextZone = CAMPAIGN_ZONES[zIdx + 1];
    const nextBtn = $('roNextRegionPortal');
    if (nextZone) {
      const nextUnlocked = isZoneUnlocked(zIdx + 1);
      const nextTeacherLocked = isZoneTeacherLocked(zIdx + 1);
      nextBtn.classList.remove('hidden');
      nextBtn.disabled = !nextUnlocked;
      $('roNextPortalLabel').textContent = nextUnlocked
        ? `วาร์ปไป ${nextZone.roName}`
        : (nextTeacherLocked ? '🔐 ครูล็อกโซนถัดไป' : '🔒 ปราบ MVP ก่อน');
      nextBtn.onclick = () => {
        if (!nextUnlocked) return;
        SoundFX.shield();
        activeContinentId = nextZone.continent || 1;
        renderContinentBar();
        openRoFieldMap(nextZone.id);
      };
    } else {
      nextBtn.classList.add('hidden');
    }

    $('roFieldTip').innerHTML = `🗺️ <strong>${zone.roName}:</strong> ${zone.subtitle} — คลิกที่มอนสเตอร์หรือ <strong>👑 MVP Boss</strong> เพื่อเข้าต่อสู้!`;
  }

  function closeRoFieldMap() {
    SoundFX.click();
    activeRoZoneId = null;
    renderWorldMap();
  }

  function renderWorldMap() {
    renderDailyQuests();
    const peerSnap = getMapPeersSnapshot();
    renderContinentBar(peerSnap);
    renderMapPeersPanel(peerSnap);
    const allowFreePlay = isTeacherAccount();
    const lockCfg = getMapLockConfig();
    $('mapFreePlayWrap').classList.toggle('hidden', !allowFreePlay);
    $('mapFreePlayToggle').checked = allowFreePlay && state.freePlay;

    const lockBtn = $('mapLockConfigBtn');
    if (lockBtn) {
      lockBtn.classList.toggle('hidden', !allowFreePlay);
      $('mapLockModeChip').textContent = getMapLockModeShortLabel(lockCfg);
    }
    if (!allowFreePlay) {
      $('teacherZoneLockPanel')?.classList.add('hidden');
    }

    const lockBanner = $('mapZoneLockBanner');
    if (lockBanner) {
      const showBanner = lockCfg.mode !== 'sequential';
      lockBanner.classList.toggle('hidden', !showBanner);
      lockBanner.className = `zone-lock-banner mode-${lockCfg.mode} ${showBanner ? '' : 'hidden'}`;
      if (showBanner) {
        $('mapZoneLockBannerText').textContent = getMapLockModeLongLabel(lockCfg);
        $('mapZoneLockBannerEditBtn')?.classList.toggle('hidden', !allowFreePlay);
      }
    }

    const hasWarpPass = (state.inventory?.warp_pass || 0) > 0;
    $('mapWarpPassBanner')?.classList.toggle('hidden', !hasWarpPass);

    $('mapViewRoBtn').className = `btn btn-sm ${mapViewMode === 'ro' ? 'btn-neon' : 'btn-ghost'}`;
    $('mapViewListBtn').className = `btn btn-sm ${mapViewMode === 'list' ? 'btn-neon' : 'btn-ghost'}`;

    if (mapViewMode === 'ro') {
      $('worldMapContainer').classList.add('hidden');
      if (activeRoZoneId) {
        openRoFieldMap(activeRoZoneId);
      } else {
        $('roFieldView').classList.add('hidden');
        $('roWorldMapWrap').classList.remove('hidden');
        renderRoWorldMap(peerSnap);
      }
      return;
    }

    // List View mode (filtered by active continent for fast, clean browsing across 50 zones)
    $('roWorldMapWrap').classList.add('hidden');
    $('roFieldView').classList.add('hidden');
    $('worldMapContainer').classList.remove('hidden');

    const container = $('worldMapContainer');
    container.innerHTML = '';

    const nextTargetStage = ALL_STAGES_FLAT.find((s, i) => isStageUnlocked(i) && !state.stageStars[s.id]);
    const nextTargetId = nextTargetStage ? nextTargetStage.id : null;

    let globalIdx = 0;
    CAMPAIGN_ZONES.forEach((zone, zIdx) => {
      const zoneStartFlatIdx = globalIdx;
      globalIdx += zone.stages.length;
      if ((zone.continent || 1) !== activeContinentId) return;

      const zoneUnlocked = isZoneUnlocked(zIdx);
      const teacherLocked = isZoneTeacherLocked(zIdx);
      const canWarpZone = !zoneUnlocked && !teacherLocked && hasWarpPass;
      const zoneEarned = zone.stages.reduce((acc, st) => acc + (state.stageStars[st.id] || 0), 0);
      const zoneMax = zone.stages.length * 3;

      const card = document.createElement('section');
      card.className = 'zone-card';
      card.style.setProperty('--zone-color', zone.themeColor);

      const stagesHtml = zone.stages.map((stage, sOffset) => {
        const myFlatIdx = zoneStartFlatIdx + sOffset;
        const unlocked = isStageUnlocked(myFlatIdx);
        const stars = state.stageStars[stage.id] || 0;
        const isNext = stage.id === nextTargetId;
        const starStr = stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : (unlocked ? '☆☆☆' : '🔒 ล็อกอยู่');

        return `
          <button type="button" class="stage-node ${stars > 0 ? 'cleared' : ''} ${stage.isBoss ? 'boss-node' : ''} ${isNext ? 'next-target-node' : ''} ${!unlocked ? 'locked' : ''}"
            data-stage-id="${stage.id}" ${!unlocked ? 'disabled' : ''}>
            ${isNext ? '<span class="next-badge">▶ NEXT</span>' : ''}
            <div class="node-sprite ${unlocked ? 'has-anime-art' : ''}">${unlocked ? AnimeSprites.getEnemySprite(stage.id) : '🔒'}</div>
            <div class="node-name">${stage.title}</div>
            <div class="node-stars">${starStr}</div>
            <div class="node-reward">+${stage.xp}XP • 💰${stage.coins}</div>
          </button>
        `;
      }).join('');

      const zonePeers = peerSnap.othersByZone[zone.id] || [];
      const visiblePeers = zonePeers.slice(0, 4);
      const hiddenPeers = zonePeers.slice(4);
      const renderPeerLine = (p) => `
        <div class="zone-peer-line">
          <span class="peer-av-1cm">${avatarHtml(p.avatar, 'hud-fit')}</span>
          <span class="peer-chip-name">${p.acc.fullName}</span>
          ${p.acc.classroom && p.acc.classroom !== '-' ? `<span class="peer-chip-class">${p.acc.classroom}</span>` : ''}
          <span class="peer-chip-star">⭐${p.totalStars}</span>
        </div>
      `;
      const zonePeersHtml = zonePeers.length
        ? `<div class="zone-peers-strip">
            <div class="zone-peers-head">
              <span class="zone-peers-lbl">👥 เพื่อนที่อยู่โซนนี้ (${zonePeers.length} คน)</span>
              ${hiddenPeers.length ? `<button type="button" class="btn btn-ghost btn-xs toggle-extra-peers-btn">ดูทั้งหมด (+${hiddenPeers.length} คน) ▾</button>` : ''}
            </div>
            <div class="zone-peers-rows">
              ${visiblePeers.map(renderPeerLine).join('')}
              ${hiddenPeers.length ? `<div class="extra-peers-wrap hidden">${hiddenPeers.map(renderPeerLine).join('')}</div>` : ''}
            </div>
          </div>`
        : '';

      card.innerHTML = `
        <div class="zone-header">
          <div class="zone-title-wrap">
            <div class="zone-icon anime-zone-thumb">${AnimeSprites.getZoneIcon(zone.id, zone.tag)}</div>
            <div>
              <div class="zone-code">${zone.code} • ${zone.roCode} • ${zone.roName}</div>
              <h3>${zone.name}</h3>
              <p class="muted-text" style="font-size:0.78rem;">${zone.subtitle}</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            ${teacherLocked ? `<span class="teacher-lock-pill">🔐 ${canUseFreePlay() ? 'ปิดสำหรับ นศ.' : 'ครูผู้สอนล็อกโซนนี้'}</span>` : ''}
            ${canWarpZone ? `<button type="button" class="btn btn-neon btn-xs list-warp-btn">🌀 ใช้ตั๋ววาร์ปปลดล็อกโซนนี้</button>` : ''}
            <div class="zone-stars">⭐ ${zoneEarned}/${zoneMax}</div>
          </div>
        </div>
        ${zonePeersHtml}
        <div class="stage-path">${stagesHtml}</div>
      `;

      card.querySelector('.list-warp-btn')?.addEventListener('click', () => useWarpPassOnZone(zone));
      card.querySelector('.toggle-extra-peers-btn')?.addEventListener('click', (ev) => {
        const extra = card.querySelector('.extra-peers-wrap');
        if (!extra) return;
        const open = extra.classList.toggle('hidden');
        ev.currentTarget.textContent = open ? `ดูทั้งหมด (+${hiddenPeers.length} คน) ▾` : 'ซ่อนบางส่วน ▴';
      });

      card.querySelectorAll('.stage-node:not(:disabled)').forEach((btn) => {
        btn.addEventListener('click', () => {
          const st = ALL_STAGES_FLAT.find((x) => x.id === btn.dataset.stageId);
          if (st) startBattle(st);
        });
      });

      container.appendChild(card);
    });
  }

  $('roBackToWorldBtn').addEventListener('click', closeRoFieldMap);
  $('roEntryPortal').addEventListener('click', closeRoFieldMap);
  $('mapViewRoBtn').addEventListener('click', () => {
    SoundFX.click();
    mapViewMode = 'ro';
    activeRoZoneId = null;
    renderWorldMap();
  });
  $('mapViewListBtn').addEventListener('click', () => {
    SoundFX.click();
    mapViewMode = 'list';
    renderWorldMap();
  });
  $('mapPeerAllBtn').addEventListener('click', () => {
    SoundFX.click();
    mapPeerFilter = 'all';
    renderWorldMap();
  });
  $('mapPeerClassBtn').addEventListener('click', () => {
    SoundFX.click();
    mapPeerFilter = 'class';
    renderWorldMap();
  });
  $('mapSyncPeersBtn').addEventListener('click', () => {
    SoundFX.click();
    maybePullPeersForMap(true);
  });

  /* ==================== TEACHER MAP ZONE LOCK PANEL ==================== */
  let zoneLockDraft = null;
  let zoneLockCustomContinent = 1;

  function openZoneLockPanel(forceOpen = null) {
    if (!isTeacherAccount()) return;
    const panel = $('teacherZoneLockPanel');
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    const shouldOpen = forceOpen === null ? isHidden : Boolean(forceOpen);
    panel.classList.toggle('hidden', !shouldOpen);
    if (shouldOpen) {
      const cur = getMapLockConfig();
      zoneLockDraft = {
        ...cur,
        unlockedZones: [...(cur.unlockedZones || ['z1'])]
      };
      zoneLockCustomContinent = activeContinentId || 1;
      renderZoneLockPanel();
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function renderZoneLockPanel() {
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    const d = zoneLockDraft;

    document.querySelectorAll('#zoneLockModeGrid .zlock-mode-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.mode === d.mode);
    });

    $('zoneLockUpToBox').classList.toggle('hidden', d.mode !== 'up_to');
    $('zoneLockCustomBox').classList.toggle('hidden', d.mode !== 'custom');

    // Sync 'up_to' controls
    const clampedMax = Math.max(1, Math.min(CAMPAIGN_ZONES.length, Number(d.maxZone) || 10));
    d.maxZone = clampedMax;
    $('zoneLockMaxRange').value = String(clampedMax);
    $('zoneLockMaxNumber').value = String(clampedMax);
    const maxZoneObj = CAMPAIGN_ZONES[clampedMax - 1];
    $('zoneLockMaxValue').textContent = maxZoneObj
      ? `Zone ${clampedMax} (${maxZoneObj.roName})`
      : `Zone ${clampedMax}`;
    $('zoneLockUpToFreeToggle').checked = Boolean(d.upToFreeAccess);

    // Sync 'custom' controls
    if (d.mode === 'custom') {
      const openSet = new Set(d.unlockedZones || []);
      $('zoneLockCustomSummary').textContent = `เปิดอยู่ ${openSet.size} / ${CAMPAIGN_ZONES.length} โซน`;
      $('zoneLockCustomFreeToggle').checked = Boolean(d.customFreeAccess);

      // Continent selector pills
      const pillsWrap = $('zlockContPills');
      pillsWrap.innerHTML = '';
      if (typeof WORLD_CONTINENTS !== 'undefined') {
        WORLD_CONTINENTS.forEach((cont) => {
          const contZones = CAMPAIGN_ZONES.filter((z) => (z.continent || 1) === cont.id);
          const openInCont = contZones.filter((z) => openSet.has(z.id)).length;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `zlock-cont-pill ${cont.id === zoneLockCustomContinent ? 'active' : ''}`;
          btn.textContent = `${cont.badge} ทวีป ${cont.id} (${openInCont}/${contZones.length})`;
          btn.addEventListener('click', () => {
            SoundFX.click();
            zoneLockCustomContinent = cont.id;
            renderZoneLockPanel();
          });
          pillsWrap.appendChild(btn);
        });
      }

      // 10-zone grid for selected continent
      const grid = $('zlockZonesGrid');
      grid.innerHTML = '';
      const contZones = CAMPAIGN_ZONES.filter((z) => (z.continent || 1) === zoneLockCustomContinent);
      contZones.forEach((z) => {
        const isOpen = openSet.has(z.id);
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = `zlock-zone-tile ${isOpen ? 'unlocked' : 'locked'}`;
        tile.innerHTML = `
          <div class="zlock-tile-top">
            <span>${z.code}</span>
            <span>${isOpen ? '🔓 เปิด' : '🔐 ล็อก'}</span>
          </div>
          <div class="zlock-tile-name">${z.roName}</div>
        `;
        tile.addEventListener('click', () => {
          SoundFX.click();
          if (openSet.has(z.id)) {
            if (openSet.size <= 1) {
              showToast('⚠️ ต้องเปิดไว้อย่างน้อย 1 โซนบนแผนที่');
              return;
            }
            openSet.delete(z.id);
          } else {
            openSet.add(z.id);
          }
          d.unlockedZones = [...openSet];
          renderZoneLockPanel();
        });
        grid.appendChild(tile);
      });
    }

    const saved = getMapLockConfig();
    $('zoneLockStatusMeta').textContent = saved.updatedAt
      ? `อัปเดตล่าสุด: ${new Date(saved.updatedAt).toLocaleString('th-TH')} โดย ${saved.updatedBy || 'ครูผู้สอน'}`
      : 'ยังใช้ค่าเริ่มต้น (ล็อกตามลำดับ)';

    // Populate classroom dropdown for student map reset
    const resetSel = $('mapResetClassSelect');
    if (resetSel) {
      const prevVal = resetSel.value;
      const students = AuthSystem.getAllAccountsList().filter((a) => a.role === 'student');
      const classes = [...new Set(students.map((s) => s.classroom || '-'))].sort();
      resetSel.innerHTML = `<option value="">นักศึกษาทุกคน (${students.length} คน)</option>` +
        classes.map((c) => {
          const cnt = students.filter((s) => (s.classroom || '-') === c).length;
          return `<option value="${c}">ห้อง ${c} (${cnt} คน)</option>`;
        }).join('');
      if (classes.includes(prevVal)) resetSel.value = prevVal;
    }
  }

  $('mapLockConfigBtn')?.addEventListener('click', () => {
    SoundFX.click();
    openZoneLockPanel();
  });

  $('mapZoneLockBannerEditBtn')?.addEventListener('click', () => {
    SoundFX.click();
    openZoneLockPanel(true);
  });

  $('closeZoneLockPanelBtn')?.addEventListener('click', () => {
    SoundFX.click();
    openZoneLockPanel(false);
  });

  document.querySelectorAll('#zoneLockModeGrid .zlock-mode-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (!isTeacherAccount()) return;
      SoundFX.click();
      if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
      zoneLockDraft.mode = card.dataset.mode;
      renderZoneLockPanel();
    });
  });

  $('zoneLockMaxRange')?.addEventListener('input', (e) => {
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    zoneLockDraft.maxZone = Number(e.target.value) || 1;
    renderZoneLockPanel();
  });

  $('zoneLockMaxNumber')?.addEventListener('change', (e) => {
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    zoneLockDraft.maxZone = Math.max(1, Math.min(CAMPAIGN_ZONES.length, Number(e.target.value) || 1));
    renderZoneLockPanel();
  });

  document.querySelectorAll('.zlock-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
      zoneLockDraft.maxZone = Number(btn.dataset.max) || 10;
      renderZoneLockPanel();
    });
  });

  $('zoneLockUpToFreeToggle')?.addEventListener('change', (e) => {
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    zoneLockDraft.upToFreeAccess = e.target.checked;
  });

  $('zoneLockCustomFreeToggle')?.addEventListener('change', (e) => {
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    zoneLockDraft.customFreeAccess = e.target.checked;
  });

  $('zlockUnlockAllCustomBtn')?.addEventListener('click', () => {
    SoundFX.click();
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    zoneLockDraft.unlockedZones = CAMPAIGN_ZONES.map((z) => z.id);
    renderZoneLockPanel();
  });

  $('zlockLockAllCustomBtn')?.addEventListener('click', () => {
    SoundFX.click();
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    zoneLockDraft.unlockedZones = ['z1'];
    renderZoneLockPanel();
  });

  $('zlockToggleContBtn')?.addEventListener('click', () => {
    SoundFX.click();
    if (!zoneLockDraft) zoneLockDraft = getMapLockConfig();
    const contZones = CAMPAIGN_ZONES.filter((z) => (z.continent || 1) === zoneLockCustomContinent);
    const openSet = new Set(zoneLockDraft.unlockedZones || []);
    const allOpen = contZones.every((z) => openSet.has(z.id));
    if (allOpen) {
      contZones.forEach((z) => openSet.delete(z.id));
      if (openSet.size === 0) openSet.add('z1');
    } else {
      contZones.forEach((z) => openSet.add(z.id));
    }
    zoneLockDraft.unlockedZones = [...openSet];
    renderZoneLockPanel();
  });

  $('zoneLockResetBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) return;
    SoundFX.click();
    zoneLockDraft = {
      mode: 'sequential',
      maxZone: 10,
      upToFreeAccess: false,
      unlockedZones: ['z1'],
      customFreeAccess: true
    };
    const res = await AuthSystem.saveMapLockConfig(zoneLockDraft, currentAccount?.fullName);
    renderZoneLockPanel();
    renderWorldMap();
    showToast(res.synced
      ? '↩️ รีเซ็ตเป็นโหมดล็อกตามลำดับและซิงค์ขึ้น Cloud แล้ว!'
      : '↩️ รีเซ็ตเป็นโหมดล็อกตามลำดับเรียบร้อยแล้ว!');
  });

  $('zoneLockSaveBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) {
      showToast('🔒 สงวนสิทธิ์เฉพาะครูผู้สอนเท่านั้น');
      return;
    }
    SoundFX.levelUp();
    const btn = $('zoneLockSaveBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังบันทึกและซิงค์...';
    try {
      const res = await AuthSystem.saveMapLockConfig(zoneLockDraft || getMapLockConfig(), currentAccount?.fullName);
      renderZoneLockPanel();
      renderWorldMap();
      showToast(res.synced
        ? `✅ บันทึกโหมดแผนที่ (${getMapLockModeShortLabel(res.config)}) และซิงค์ให้นักศึกษาแล้ว!`
        : `✅ บันทึกโหมดแผนที่ (${getMapLockModeShortLabel(res.config)}) บนเครื่องนี้เรียบร้อยแล้ว!`);
    } finally {
      btn.disabled = false;
      btn.textContent = '💾 บันทึกและซิงค์ให้นักศึกษา';
    }
  });

  $('mapResetStudentsBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) {
      showToast('🔒 สงวนสิทธิ์เฉพาะครูผู้สอนเท่านั้น');
      return;
    }
    const classroom = ($('mapResetClassSelect')?.value || '').trim();
    const resetXpAndCoins = Boolean($('mapResetXpCoinsToggle')?.checked);
    const scopeLabel = classroom ? `ห้อง "${classroom}"` : 'ทุกคนทุกห้อง';
    const extraNote = resetXpAndCoins
      ? '\n⚠️ รวมถึงล้าง XP เป็น 0 และเหรียญเป็น 100 ด้วย'
      : '\n(ยังคงคะแนนสอบ, CLI Lab, พัซเซิล และ XP เดิมไว้)';
    const ok = confirm(
      `🔄 ยืนยันการรีเซ็ตการตะลุยแผนที่ของนักศึกษา${scopeLabel} กลับไปเริ่มต้นที่ Zone 1 ใช่หรือไม่?${extraNote}`
    );
    if (!ok) return;

    SoundFX.click();
    const btn = $('mapResetStudentsBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังรีเซ็ตและซิงค์...';
    try {
      const res = await AuthSystem.resetStudentsMapProgress({ classroom, resetXpAndCoins });
      if (!res.ok) {
        SoundFX.wrong();
        showToast(`⚠️ ${res.error || 'ไม่พบรายชื่อนักศึกษา'}`);
        return;
      }
      SoundFX.levelUp();
      renderZoneLockPanel();
      renderWorldMap();
      showToast(
        AuthSystem.getCloudUrl()
          ? `🔄 รีเซ็ตแผนที่นักศึกษา${scopeLabel} กลับสู่ Zone 1 สำเร็จ ${res.count} คน (ซิงค์ Cloud ${res.synced} คน)!`
          : `🔄 รีเซ็ตแผนที่นักศึกษา${scopeLabel} กลับสู่ Zone 1 สำเร็จ ${res.count} คน!`
      );
    } finally {
      btn.disabled = false;
      btn.textContent = '🔄 รีเซ็ตแผนที่นักศึกษา';
    }
  });

  $('mapResetXpOnlyBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) {
      showToast('🔒 สงวนสิทธิ์เฉพาะครูผู้สอนเท่านั้น');
      return;
    }
    const classroom = ($('mapResetClassSelect')?.value || '').trim();
    const scopeLabel = classroom ? `ห้อง "${classroom}"` : 'ทุกคนทุกห้อง';
    const ok = confirm(
      `⚡ ยืนยันการรีเซ็ตค่า XP ของนักศึกษา${scopeLabel} กลับเป็น 0 XP ใช่หรือไม่?\n(ยังคงความก้าวหน้าแผนที่ คะแนนสอบ และ CLI Lab ไว้)`
    );
    if (!ok) return;

    SoundFX.click();
    const btn = $('mapResetXpOnlyBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังรีเซ็ต XP...';
    try {
      const res = await AuthSystem.resetStudentsXp({ classroom });
      if (!res.ok) {
        SoundFX.wrong();
        showToast(`⚠️ ${res.error || 'ไม่พบรายชื่อนักศึกษา'}`);
        return;
      }
      SoundFX.levelUp();
      renderZoneLockPanel();
      renderWorldMap();
      showToast(
        AuthSystem.getCloudUrl()
          ? `⚡ รีเซ็ต XP นักศึกษา${scopeLabel} เป็น 0 สำเร็จ ${res.count} คน (ซิงค์ Cloud ${res.synced} คน)!`
          : `⚡ รีเซ็ต XP นักศึกษา${scopeLabel} เป็น 0 สำเร็จ ${res.count} คน!`
      );
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ รีเซ็ต XP นักศึกษาเป็น 0';
    }
  });

  /* ==================== SCREEN 2: RPG BATTLE ENGINE + VFX ==================== */
  let battle = null;
  let battleCooldownTimer = null;
  let retryCooldownTimer = null;

  function clearBattleCooldowns() {
    if (battleCooldownTimer) {
      clearInterval(battleCooldownTimer);
      battleCooldownTimer = null;
    }
    if (retryCooldownTimer) {
      clearInterval(retryCooldownTimer);
      retryCooldownTimer = null;
    }
  }

  function animateClass(elOrId, cls, durationMs = 600) {
    const el = typeof elOrId === 'string' ? $(elOrId) : elOrId;
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    if (durationMs > 0) {
      setTimeout(() => el.classList.remove(cls), durationMs);
    }
  }

  function spawnFx(text, cls) {
    const layer = $('battleFxLayer');
    const el = document.createElement('div');
    el.className = `float-fx ${cls}`;
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 980);
  }

  function spawnBeam(cls) {
    const layer = $('battleFxLayer');
    const beam = document.createElement('div');
    beam.className = `energy-beam ${cls}`;
    layer.appendChild(beam);
    setTimeout(() => beam.remove(), 380);
  }

  function spawnShockwave(posCls) {
    const layer = $('battleFxLayer');
    const ring = document.createElement('div');
    ring.className = `impact-ring ${posCls}`;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 520);
  }

  function spawnParticles(leftPct, colors, count = 12) {
    const layer = $('battleFxLayer');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'vfx-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 38 + Math.random() * 68;
      p.style.left = `${leftPct}%`;
      p.style.top = '45%';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', `${Math.round(Math.cos(angle) * dist)}px`);
      p.style.setProperty('--dy', `${Math.round(Math.sin(angle) * dist)}px`);
      layer.appendChild(p);
      setTimeout(() => p.remove(), 650);
    }
  }

  function playIntroBanner(text, isBoss) {
    const banner = $('battleIntroBanner');
    banner.textContent = text;
    banner.className = `battle-intro-banner ${isBoss ? 'boss-banner' : ''}`;
    void banner.offsetWidth;
    setTimeout(() => banner.classList.add('hidden'), 1380);
  }

  function spawnVictoryConfetti() {
    const layer = $('victoryConfettiLayer');
    layer.innerHTML = '';
    const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#ffffff'];
    for (let i = 0; i < 38; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${(Math.random() * 0.45).toFixed(2)}s`;
      piece.style.setProperty('--dur', `${(1.4 + Math.random() * 1.1).toFixed(2)}s`);
      piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 140)}px`);
      piece.style.setProperty('--rot', `${Math.round(360 + Math.random() * 540)}deg`);
      layer.appendChild(piece);
    }
  }

  function renderAnimatedStars(earnedStars) {
    const wrap = $('outcomeStars');
    wrap.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = 'star-pop';
      span.style.animationDelay = `${0.14 + i * 0.22}s`;
      span.textContent = i < earnedStars ? '⭐' : '☆';
      wrap.appendChild(span);
      if (i < earnedStars) {
        setTimeout(() => SoundFX.coin(), 160 + i * 220);
      }
    }
  }

  function triggerShake(elId) {
    animateClass(elId, 'shake-hit', 420);
  }

  function startBattle(stage) {
    clearBattleCooldowns();
    if (stage.isBoss) SoundFX.bossAlert();
    else SoundFX.click();
    if (mapViewMode === 'ro' && stage.zoneId) {
      activeRoZoneId = stage.zoneId;
    }

    const originalQuestions = stage.questions || [];
    const randomizedQuestions = originalQuestions.map((orig) => ({
      ...randomizeQuestionChoices(orig),
      _orig: orig,
      _isRetry: false
    }));

    battle = {
      stage,
      questions: randomizedQuestions,
      baseQuestionCount: originalQuestions.length || 1,
      qIdx: 0,
      playerHp: 3,
      maxPlayerHp: 3,
      enemyHp: stage.enemy.hp,
      maxEnemyHp: stage.enemy.hp,
      combo: 0,
      correctCount: 0,
      wrongCount: 0,
      wrongStreak: 0,
      questionShownAt: Date.now(),
      shieldActive: false,
      hintUsedThisQ: false,
      answered: false
    };

    $('battleConsole').classList.remove('hidden');
    $('battleOutcomeCard').classList.add('hidden');
    $('combatArena').classList.toggle('boss-arena', Boolean(stage.isBoss));
    $('enemySprite').classList.remove('enemy-ko');
    $('battleZoneChip').textContent = stage.zoneCode;
    $('battleStageTitle').textContent = stage.title;
    $('battleDialogueText').textContent = stage.dialogue;
    const battleTierCls = getAvatarTierClass(getRankInfo(state.xp).level, currentAccount?.role);
    $('battlePlayerSprite').innerHTML = avatarHtml(state.avatar, 'battle', battleTierCls);
    $('battlePlayerLabel').textContent = `${state.playerName}'s Server Core`;
    $('enemySprite').innerHTML = AnimeSprites.getEnemySprite(stage.id);
    $('enemySprite').classList.toggle('is-boss-sprite', Boolean(stage.isBoss));
    $('enemyName').textContent = stage.enemy.name;
    $('enemyBossTag').classList.toggle('hidden', !stage.isBoss);

    switchScreen('battle');
    SoundFX.setBgmTrack(stage.isBoss ? 'boss' : 'battle');
    animateClass('playerCombatant', 'enter-left', 600);
    animateClass('enemyCombatant', 'enter-right', 600);
    playIntroBanner(
      stage.isBoss ? `🚨 WARNING! BOSS: ${stage.enemy.name} 🚨` : `⚔️ ${stage.title} — FIGHT!`,
      stage.isBoss
    );
    updateBattleBars();
    renderBattleQuestion();
  }

  function updateBattleBars() {
    const pPct = Math.round((battle.playerHp / battle.maxPlayerHp) * 100);
    const ePct = Math.max(0, Math.round((battle.enemyHp / battle.maxEnemyHp) * 100));
    $('playerHpBar').style.width = `${pPct}%`;
    $('playerHpText').textContent = `HP: ${battle.playerHp} / ${battle.maxPlayerHp} ${'💚'.repeat(battle.playerHp)}${'🖤'.repeat(battle.maxPlayerHp - battle.playerHp)}`;
    $('enemyHpBar').style.width = `${ePct}%`;
    $('enemyHpText').textContent = `HP: ${battle.enemyHp} / ${battle.maxEnemyHp}`;
    $('battleShieldBadge').classList.toggle('hidden', !battle.shieldActive);

    const comboEl = $('battleComboChip');
    if (battle.combo >= 2) {
      comboEl.textContent = `🔥 x${battle.combo} COMBO`;
      comboEl.classList.remove('hidden');
    } else {
      comboEl.classList.add('hidden');
    }

    // Update Toolkit button quantities
    $('qtyShield').textContent = state.inventory.shield;
    $('qtyHint').textContent = state.inventory.hint;
    $('qtyHeal').textContent = state.inventory.heal;
    $('useShieldBtn').disabled = state.inventory.shield <= 0 || battle.shieldActive || battle.answered;
    $('useHintBtn').disabled = state.inventory.hint <= 0 || battle.hintUsedThisQ || battle.answered;
    $('useHealBtn').disabled = state.inventory.heal <= 0 || battle.playerHp >= battle.maxPlayerHp || battle.answered;
  }

  function renderBattleQuestion() {
    clearBattleCooldowns();
    battle.answered = false;
    battle.hintUsedThisQ = false;
    battle.questionShownAt = Date.now();
    const q = battle.questions[battle.qIdx];
    $('battleStepPill').textContent = q._isRetry
      ? `🔁 ทบทวนข้อที่ผิด (Wave ${battle.qIdx + 1}/${battle.questions.length})`
      : `Wave ${battle.qIdx + 1} / ${battle.questions.length}`;
    $('battleContext').textContent = q.context;
    $('battleQuestion').textContent = q.q;

    const codeEl = $('battleCodeBlock');
    if (q.code) {
      codeEl.textContent = q.code;
      codeEl.classList.remove('hidden');
    } else {
      codeEl.classList.add('hidden');
    }

    $('battleDebrief').classList.add('hidden');
    const nextBtn = $('battleNextBtn');
    nextBtn.classList.add('hidden');
    nextBtn.disabled = false;

    const optsEl = $('battleOptions');
    optsEl.innerHTML = '';
    const keys = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn option-pop';
      btn.style.animationDelay = `${idx * 0.06}s`;
      btn.dataset.idx = idx;
      btn.innerHTML = `<span class="opt-key">${keys[idx]}</span><span>${optText}</span>`;
      btn.addEventListener('click', () => handleBattleAnswer(idx, btn));
      optsEl.appendChild(btn);
    });
    updateBattleBars();
  }

  function handleBattleAnswer(selectedIdx, btn) {
    if (battle.answered) return;
    battle.answered = true;
    const q = battle.questions[battle.qIdx];
    const isCorrect = selectedIdx === q.answer;
    recordAnalytics(battle.stage.category, isCorrect);

    const allBtns = $('battleOptions').querySelectorAll('.option-btn');
    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add('correct');
    });

    const debrief = $('battleDebrief');
    debrief.classList.remove('hidden', 'ok', 'err');

    const dmgPerHit = Math.ceil(battle.maxEnemyHp / (battle.baseQuestionCount || battle.questions.length));
    const answerElapsedMs = Date.now() - (battle.questionShownAt || 0);
    let wrongCooldownSec = 0;

    if (isCorrect) {
      SoundFX.attack();
      battle.combo += 1;
      battle.correctCount += 1;
      battle.wrongStreak = 0;
      battle.enemyHp = Math.max(0, battle.enemyHp - dmgPerHit);

      // Player lunge + Plasma beam -> Enemy impact VFX!
      animateClass('battlePlayerSprite', 'lunge-right', 380);
      spawnBeam('player-beam');
      setTimeout(() => {
        triggerShake('enemyCombatant');
        animateClass('combatArena', 'arena-flash-ok', 460);
        spawnShockwave('enemy-pos');
        spawnParticles(78, ['#34d399', '#38bdf8', '#fde047'], battle.combo >= 2 ? 16 : 11);
        if (battle.combo >= 2) {
          spawnFx(`🔥 x${battle.combo} -${dmgPerHit} CRIT!`, 'super-crit');
        } else {
          spawnFx(`-${dmgPerHit} DMG!`, 'dmg');
        }
        if (battle.enemyHp <= 0) {
          $('enemySprite').classList.add('enemy-ko');
          spawnParticles(78, ['#fbbf24', '#ffffff', '#34d399'], 22);
        }
      }, 170);

      debrief.classList.add('ok');
      debrief.innerHTML = `<strong>⚡ โจมตีสำเร็จ!</strong> ${q.explain}`;
    } else {
      btn.classList.add('wrong');
      battle.combo = 0;
      battle.wrongCount = (battle.wrongCount || 0) + 1;
      battle.wrongStreak += 1;
      const isFastSpam = answerElapsedMs < 2000;

      // Enemy counter-lunge + Red beam!
      animateClass('enemySprite', 'lunge-left', 380);
      spawnBeam('enemy-beam');

      let wasBlocked = false;
      let xpPenalty = 0;
      let actualXpLost = 0;
      if (battle.shieldActive) {
        wasBlocked = true;
        SoundFX.shield();
        battle.shieldActive = false;
        setTimeout(() => {
          spawnShockwave('shield-pos');
          spawnParticles(22, ['#38bdf8', '#7dd3fc', '#ffffff'], 14);
          spawnFx('🛡️ BLOCKED!', 'shield');
        }, 170);
      } else {
        SoundFX.wrong();
        battle.playerHp = Math.max(0, battle.playerHp - 1);
        xpPenalty = (isFastSpam || battle.wrongStreak >= 2) ? 20 : 10;
        actualXpLost = deductXp(xpPenalty);
        setTimeout(() => {
          triggerShake('playerCombatant');
          animateClass('combatArena', 'arena-shake-heavy', 480);
          spawnShockwave('player-pos');
          spawnParticles(22, ['#ef4444', '#f97316', '#fde047'], 14);
          spawnFx(actualXpLost > 0 ? `-1 HP • -${actualXpLost} XP!` : '-1 HP!', 'hit');
        }, 170);
      }

      // Re-queue missed question with newly shuffled choices so students cannot rush through by guessing wrong
      const willRequeue = battle.playerHp > 0 && battle.enemyHp > 0 && q._orig;
      if (willRequeue) {
        battle.questions.push({
          ...randomizeQuestionChoices(q._orig),
          _orig: q._orig,
          _isRetry: true
        });
      }

      // Enforce read-explanation cooldown on wrong answers (escalates on fast spam or consecutive misses)
      if (!canUseFreePlay()) {
        wrongCooldownSec = Math.min(12, 5 + (battle.wrongStreak - 1) * 3 + (isFastSpam ? 3 : 0));
      }

      const xpLossTag = wasBlocked
        ? ''
        : (actualXpLost > 0
          ? ` (หัก -${actualXpLost} XP • คงเหลือ ${state.xp} XP)`
          : ' (XP คงเหลือ 0 XP)');
      const headMsg = wasBlocked
        ? '🛡️ UPS Shield ป้องกันความเสียหายและ XP ไว้ได้!'
        : `💥 เซิร์ฟเวอร์ได้รับความเสียหาย!${xpLossTag}`;
      const spamNote = isFastSpam
        ? '<div class="debrief-spam-warn">⚠️ ตอบเร็วเกินไป! กรุณาอ่านโจทย์และคำอธิบายให้เข้าใจก่อนตอบในรอบถัดไป</div>'
        : '';
      const requeueNote = willRequeue
        ? '<div class="debrief-requeue-note">🔁 ข้อนี้จะถูกนำกลับมาทดสอบอีกครั้ง (สลับตัวเลือกใหม่) — ต้องตอบถูกให้ครบเพื่อปราบมอนสเตอร์!</div>'
        : '';
      const cooldownBarHtml = wrongCooldownSec > 0
        ? `<div class="debrief-cooldown-wrap"><div class="debrief-cooldown-bar" style="animation-duration:${wrongCooldownSec}s;"></div></div>`
        : '';

      debrief.classList.add('err');
      debrief.innerHTML = `<strong>${headMsg}</strong> — ${q.explain}${spamNote}${requeueNote}${cooldownBarHtml}`;
    }

    updateBattleBars();
    const nextBtn = $('battleNextBtn');
    nextBtn.classList.remove('hidden');

    const finalNextLabel = battle.playerHp <= 0
      ? 'สรุปผลการต่อสู้'
      : (battle.enemyHp <= 0 || battle.qIdx >= battle.questions.length - 1
        ? 'ปิดฉากและรับรางวัล 🏆'
        : 'ลุยเวฟถัดไป ⚡');

    if (wrongCooldownSec > 0) {
      let remain = wrongCooldownSec;
      nextBtn.disabled = true;
      nextBtn.textContent = `⏳ อ่านคำอธิบายก่อนไปต่อ (${remain} วิ)...`;
      battleCooldownTimer = setInterval(() => {
        remain -= 1;
        if (remain <= 0) {
          clearBattleCooldowns();
          nextBtn.disabled = false;
          nextBtn.textContent = finalNextLabel;
        } else {
          nextBtn.textContent = `⏳ อ่านคำอธิบายก่อนไปต่อ (${remain} วิ)...`;
        }
      }, 1000);
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = finalNextLabel;
    }
  }

  function finishBattle() {
    clearBattleCooldowns();
    $('battleConsole').classList.add('hidden');
    $('battleOutcomeCard').classList.remove('hidden');
    $('victoryConfettiLayer').innerHTML = '';

    const won = battle.playerHp > 0 && battle.enemyHp <= 0;
    const nextBtn = $('outcomeNextStageBtn');
    const retryBtn = $('outcomeRetryBtn');
    retryBtn.disabled = false;
    retryBtn.textContent = '🔄 เล่นด่านนี้อีกครั้ง';

    if (won) {
      SoundFX.levelUp();
      const stars = battle.playerHp === 3 ? 3 : battle.playerHp === 2 ? 2 : 1;
      const prevStars = state.stageStars[battle.stage.id] || 0;
      const isFirstClear = prevStars === 0;
      const improvedStars = !isFirstClear && stars > prevStars;
      if (stars > prevStars) state.stageStars[battle.stage.id] = stars;

      const starFactor = (s) => (s >= 3 ? 1 : s === 2 ? 0.8 : s === 1 ? 0.6 : 0);
      const mult = (isFirstClear && state.xpBoostActive) ? 2 : 1;
      const baseXp = isFirstClear
        ? Math.round(battle.stage.xp * starFactor(stars))
        : (improvedStars
          ? Math.max(0, Math.round(battle.stage.xp * starFactor(stars)) - Math.round(battle.stage.xp * starFactor(prevStars)))
          : 0);
      const baseCoins = isFirstClear ? battle.stage.coins : Math.round(battle.stage.coins * 0.2);
      const earnedXp = baseXp * mult;
      const earnedCoins = baseCoins * mult;
      if (isFirstClear && state.xpBoostActive) state.xpBoostActive = false;

      bumpDailyQuest('battlesWon');
      grantRewards(earnedXp, earnedCoins);

      $('outcomeEmoji').textContent = battle.stage.isBoss ? '👑🏆' : '🏆';
      $('outcomeTitle').textContent = battle.stage.isBoss ? 'BOSS DEFEATED!' : 'STAGE CLEARED!';
      renderAnimatedStars(stars);
      spawnVictoryConfetti();
      $('outcomeSub').textContent = isFirstClear
        ? `ยอดเยี่ยมมาก! คุณเอาชนะ ${battle.stage.enemy.name} และปลดล็อกด่านถัดไปเรียบร้อยแล้ว`
        : (improvedStars
          ? `ทำลายสถิติดาวสำเร็จ! (สถิติใหม่: ${state.stageStars[battle.stage.id]} ดาว • รับโบนัส +${earnedXp} XP)`
          : `ทบทวนด่านสำเร็จ! (ผ่านด่านนี้แล้วจึงไม่ได้รับ XP ซ้ำ เพื่อป้องกัน XP เฟ้อ)`);
      $('outcomeRewards').innerHTML = `
        <div class="reward-box"><span>XP ที่ได้รับ</span><strong>${earnedXp > 0 ? `+${earnedXp} XP` : '0 XP (ด่านซ้ำ)'}</strong></div>
        <div class="reward-box"><span>เหรียญรางวัล</span><strong>+💰 ${earnedCoins}</strong></div>
        <div class="reward-box"><span>Server HP คงเหลือ</span><strong>${battle.playerHp}/${battle.maxPlayerHp}</strong></div>
      `;

      const flatIdx = ALL_STAGES_FLAT.findIndex((s) => s.id === battle.stage.id);
      const nextStage = ALL_STAGES_FLAT[flatIdx + 1];
      if (nextStage && isStageUnlocked(flatIdx + 1)) {
        nextBtn.classList.remove('hidden');
        nextBtn.onclick = () => startBattle(nextStage);
      } else {
        nextBtn.classList.add('hidden');
      }
    } else {
      SoundFX.wrong();
      $('outcomeEmoji').textContent = '💥';
      $('outcomeTitle').textContent = 'SERVER DOWN! (พ่ายแพ้)';
      $('outcomeStars').textContent = '☆☆☆';
      const missedCount = battle.wrongCount || 0;
      let consolationXp = 0;
      let consolationNote = '0 XP';
      if (missedCount >= 3) {
        const { granted, remainingAfter } = applyConsolationXpCap(5);
        consolationXp = granted;
        if (granted > 0) {
          grantRewards(granted, 0);
          consolationNote = `+${granted} XP (ปลอบใจความพยายาม • เหลือโควตาวันนี้ ${remainingAfter} XP)`;
        } else {
          consolationNote = '0 XP (รับโควตาปลอบใจครบ 30 XP/วันแล้ว)';
        }
      }
      $('outcomeSub').textContent = consolationXp > 0
        ? `ตอบผิด ${missedCount} ข้อ — รับ +${consolationXp} XP ปลอบใจความพยายาม! ลองทบทวนเนื้อหาในคัมภีร์แล้วกลับมาสู้ใหม่นะ`
        : 'Server HP หมดก่อนพิชิตภัยคุกคาม — ลองทบทวนเนื้อหาในคัมภีร์แล้วกลับมาสู้ใหม่!';
      $('outcomeRewards').innerHTML = `
        <div class="reward-box"><span>💖 XP ปลอบใจ</span><strong>${consolationNote}</strong></div>
        <div class="reward-box"><span>XP คงเหลือ</span><strong>${state.xp.toLocaleString()} XP</strong></div>
      `;
      nextBtn.classList.add('hidden');

      if (!canUseFreePlay()) {
        let retryRemain = 5;
        retryBtn.disabled = true;
        retryBtn.textContent = `⏳ รอทบทวนก่อนลองใหม่ (${retryRemain} วิ)...`;
        retryCooldownTimer = setInterval(() => {
          retryRemain -= 1;
          if (retryRemain <= 0) {
            clearBattleCooldowns();
            retryBtn.disabled = false;
            retryBtn.textContent = '🔄 เล่นด่านนี้อีกครั้ง';
          } else {
            retryBtn.textContent = `⏳ รอทบทวนก่อนลองใหม่ (${retryRemain} วิ)...`;
          }
        }, 1000);
      }
    }
  }

  $('battleNextBtn').addEventListener('click', () => {
    if ($('battleNextBtn').disabled) return;
    SoundFX.click();
    if (battle.playerHp <= 0 || battle.enemyHp <= 0 || battle.qIdx >= battle.questions.length - 1) {
      finishBattle();
    } else {
      battle.qIdx += 1;
      renderBattleQuestion();
    }
  });

  $('battleRetreatBtn').addEventListener('click', () => switchScreen('map'));
  $('outcomeMapBtn').addEventListener('click', () => switchScreen('map'));
  $('outcomeRetryBtn').addEventListener('click', () => startBattle(battle.stage));

  // Toolkit Power-ups inside Battle
  $('useShieldBtn').addEventListener('click', () => {
    if (state.inventory.shield <= 0 || battle.shieldActive || battle.answered) return;
    state.inventory.shield -= 1;
    battle.shieldActive = true;
    SoundFX.shield();
    spawnShockwave('shield-pos');
    spawnParticles(22, ['#38bdf8', '#7dd3fc', '#ffffff'], 12);
    spawnFx('🛡️ SHIELD ON!', 'shield');
    saveState();
    updateBattleBars();
  });

  $('useHintBtn').addEventListener('click', () => {
    if (state.inventory.hint <= 0 || battle.hintUsedThisQ || battle.answered) return;
    state.inventory.hint -= 1;
    battle.hintUsedThisQ = true;
    const q = battle.questions[battle.qIdx];
    const wrongIndices = shuffle([0, 1, 2, 3].filter((i) => i !== q.answer)).slice(0, 2);
    $('battleOptions').querySelectorAll('.option-btn').forEach((btn) => {
      if (wrongIndices.includes(Number(btn.dataset.idx))) {
        btn.disabled = true;
        btn.classList.add('eliminated');
      }
    });
    SoundFX.correct();
    showToast('💡 NOVA-OS สแกนตัดตัวเลือกที่ผิดออกให้ 2 ข้อแล้ว!');
    saveState();
    updateBattleBars();
  });

  $('useHealBtn').addEventListener('click', () => {
    if (state.inventory.heal <= 0 || battle.playerHp >= battle.maxPlayerHp || battle.answered) return;
    state.inventory.heal -= 1;
    battle.playerHp = battle.maxPlayerHp;
    SoundFX.levelUp();
    spawnShockwave('heal-pos');
    spawnParticles(22, ['#34d399', '#6ee7b7', '#ffffff'], 16);
    spawnFx('💊 FULL HP!', 'shield');
    saveState();
    updateBattleBars();
  });

  /* ==================== SCREEN 3: DUAL-OS CLI HACKER ARENA ==================== */
  let cliFilterOs = 'all';
  let activeCliLabId = CLI_LABS[0].id;
  let cliHistory = [];
  let cliHistPtr = -1;

  const simEnv = {
    services: { nginx: 'inactive', ssh: 'active', ufw: 'active', mysql: 'active' },
    winServices: { DNS: 'Stopped', DHCP: 'Running', NTDS: 'Running', W3SVC: 'Running' },
    files: {
      'secret.key': '-rwxrwxrwx',
      'backup.sh': '-rw-r--r--',
      'nginx.conf': '-rw-r--r--'
    },
    webOwner: 'root:root',
    sudoUsers: ['root', 'admin'],
    roguePidKilled: false,
    firewall: ['22/tcp (SSH)', '23/tcp (Telnet - INSECURE)', '80/tcp (HTTP)'],
    users: ['root', 'admin', 'www-data'],
    winAdUsers: [
      { name: 'Administrator', dept: 'IT-Core' },
      { name: 'somchai.k', dept: 'Accounting' },
      { name: 'student01', dept: 'Computer-IT' }
    ],
    winFirewallPorts: ['53', '389', '445', '3389'],
    dockerRunning: [
      { id: 'a8f2c91b40e1', image: 'nginx:alpine', ports: '0.0.0.0:8080->80/tcp', name: 'web-frontend' },
      { id: '3d19e7c2b0a4', image: 'mysql:8.0', ports: '3306/tcp', name: 'db-core' }
    ]
  };

  function getActiveCliLab() {
    return CLI_LABS.find((l) => l.id === activeCliLabId) || CLI_LABS[0];
  }

  function appendTerm(text, cls = '') {
    const out = $('terminalOutput');
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }

  function syncTerminalOsTheme(os) {
    const shell = $('terminalShell');
    if (os === 'windows') {
      shell.classList.add('win-mode');
      $('termWindowTitle').textContent = 'Administrator: Windows PowerShell (Windows Server 2022 DC-01)';
      $('termOsBadge').textContent = 'POWERSHELL • RDP 3389';
      $('termPromptText').textContent = 'PS C:\\ServerAdmin>';
    } else {
      shell.classList.remove('win-mode');
      $('termWindowTitle').textContent = 'root@srv-linux-01:~ (Ubuntu Server 24.04 LTS)';
      $('termOsBadge').textContent = 'BASH • SSH 22';
      $('termPromptText').textContent = 'root@srv-linux-01:~#';
    }
  }

  function initCliWelcome() {
    const lab = getActiveCliLab();
    syncTerminalOsTheme(lab.os);
    $('terminalOutput').innerHTML = '';
    if (lab.os === 'windows') {
      appendTerm('Windows PowerShell — Microsoft Windows Server 2022 Datacenter (DC-01)', 'term-line-muted');
      appendTerm('พิมพ์ "help" เพื่อดูคำสั่ง Windows Server PowerShell/CMD ที่รองรับ\n', 'term-line-muted');
    } else {
      appendTerm('Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)', 'term-line-muted');
      appendTerm('พิมพ์ "help" เพื่อดูคำสั่ง Linux Server ที่รองรับ\n', 'term-line-muted');
    }
  }

  function renderCliSidebar() {
    $('cliProgressChip').textContent = `${state.completedLabs.length} / ${CLI_LABS.length}`;
    const list = $('cliMissionList');
    list.innerHTML = '';

    const visibleLabs = CLI_LABS.filter((l) => cliFilterOs === 'all' || l.os === cliFilterOs);
    if (!visibleLabs.some((l) => l.id === activeCliLabId) && visibleLabs.length > 0) {
      activeCliLabId = visibleLabs[0].id;
    }

    visibleLabs.forEach((lab) => {
      const done = state.completedLabs.includes(lab.id);
      const btn = document.createElement('button');
      btn.className = `cli-item ${lab.id === activeCliLabId ? 'active' : ''} ${done ? 'done' : ''}`;
      btn.innerHTML = `<span>${lab.os === 'windows' ? '🪟' : '🐧'} ${lab.title}</span><span>${done ? '✅' : '○'}</span>`;
      btn.addEventListener('click', () => {
        SoundFX.click();
        const prevOs = getActiveCliLab().os;
        activeCliLabId = lab.id;
        renderCliSidebar();
        if (prevOs !== lab.os) initCliWelcome();
      });
      list.appendChild(btn);
    });

    const cur = getActiveCliLab();
    syncTerminalOsTheme(cur.os);
    $('cliBriefOs').textContent = cur.os === 'windows' ? '🪟 WINDOWS SERVER POWERSHELL' : '🐧 UBUNTU LINUX SERVER';
    $('cliBriefTitle').textContent = `${cur.title} (+${cur.xp} XP, 💰${cur.coins})`;
    $('cliBriefGoal').textContent = cur.goal;
    $('cliHintBox').textContent = `💡 คำใบ้: ${cur.hint}`;
    $('cliHintBox').classList.add('hidden');

    const qList = $('quickCmdList');
    qList.innerHTML = '';
    cur.quickCmds.forEach((c) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-cmd-chip';
      chip.textContent = c;
      chip.addEventListener('click', () => {
        $('terminalInput').value = c;
        $('terminalInput').focus();
      });
      qList.appendChild(chip);
    });
  }

  function octalToSym(oct) {
    if (!/^[0-7]{3}$/.test(oct)) return null;
    const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    return '-' + map[+oct[0]] + map[+oct[1]] + map[+oct[2]];
  }

  function executeCli(rawCmd) {
    const lab = getActiveCliLab();
    const promptPrefix = lab.os === 'windows' ? 'PS C:\\ServerAdmin> ' : 'root@srv-linux-01:~# ';
    appendTerm(`${promptPrefix}${rawCmd}`, 'term-line-cmd');
    const cmd = rawCmd.trim().replace(/^sudo\s+/i, '');
    if (!cmd) return;

    SoundFX.terminal();
    const parts = cmd.split(/\s+/);
    const bin = parts[0].toLowerCase();

    if (bin === 'clear' || bin === 'cls') {
      initCliWelcome();
      return;
    }

    if (bin === 'help') {
      if (lab.os === 'windows') {
        appendTerm(
`คำสั่ง Windows Server PowerShell / CMD ที่รองรับ:
  ipconfig /all | ipconfig /flushdns     ดูค่า IP/DNS และล้างแคช DNS
  nslookup <domain> | netstat -ano       ตรวจ DNS และดูพอร์ตที่เปิดพร้อม PID
  Get-Service / Restart-Service <name>   ดูและรีสตาร์ท Windows Services (DNS, DHCP, NTDS)
  gpupdate /force                        บังคับอัปเดต Group Policy (GPO) ทันที
  Get-ADUser -Filter *                   ดูรายชื่อผู้ใช้ Active Directory
  New-ADUser -Name <user>                สร้างบัญชีผู้ใช้ใหม่ใน Active Directory
  Test-NetConnection <host> -Port <p>    ทดสอบพอร์ต TCP ปลายทาง
  New-NetFirewallRule ... -LocalPort 443 สร้างกฎ Windows Firewall
  Get-EventLog -LogName Security -InstanceId 4625  สืบสวน Event Log ล็อกอินพลาด
  cls                                    ล้างหน้าจอ`, 'term-line-muted');
      } else {
        appendTerm(
`คำสั่ง Linux Server Bash ที่รองรับ:
  whoami, hostname, uname -a, uptime     ข้อมูลผู้ใช้ ระบบปฏิบัติการ และ Load Average
  ip a | ifconfig | ping | ss -tulnp     ตรวจเครือข่าย IP และพอร์ตที่เปิด Listening
  systemctl status|start|restart|enable <svc>  จัดการบริการ (nginx, ssh, mysql, ufw)
  journalctl -u <svc> | tail -f <log>    ดู Systemd Logs และเฝ้าดู Log แบบสด
  grep Failed /var/log/auth.log          ค้นหาประวัติการบุกรุกในไฟล์ Log
  df -h | du -sh /var/* | free -h        ตรวจสอบดิสก์ โฟลเดอร์ และ RAM
  ps aux | kill -9 <pid>                 ตรวจสอบและยุติ Process ที่ค้าง/อันตราย
  ls -l | chmod <mode> <f> | chown       จัดการสิทธิ์ rwx และเจ้าของไฟล์
  useradd <name> | usermod -aG sudo <u>  สร้างผู้ใช้และมอบสิทธิ์ sudo
  ufw status | ufw allow/deny <port>     จัดการ Firewall UFW
  tar -czvf backup.tar.gz /var/www/html  บีบอัดไฟล์สำรองข้อมูล
  docker ps | docker run -d -p 8080:80 nginx  จัดการ Docker Container
  apt update | crontab -l | clear        อัปเดตแพ็กเกจ ดู Cron และล้างหน้าจอ`, 'term-line-muted');
      }
    }
    /* Windows Server Commands */
    else if (bin === 'ipconfig') {
      if (parts.some((p) => p.toLowerCase() === '/flushdns')) {
        appendTerm('Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.', 'term-line-ok');
      } else {
        appendTerm(
`Windows IP Configuration
   Host Name . . . . . . . . . . . . : SRV-DC-01
   Primary Dns Suffix  . . . . . . . : college.local
Ethernet adapter Ethernet0:
   DHCP Enabled. . . . . . . . . . . : No (Static)
   IPv4 Address. . . . . . . . . . . : 192.168.10.2
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.10.1
   DNS Servers . . . . . . . . . . . : 127.0.0.1`, 'term-line-ok');
      }
    } else if (bin === 'nslookup') {
      const dom = parts[1] || 'college.ac.th';
      appendTerm(`Server:  srv-dc-01.college.local\nAddress:  192.168.10.2\n\nName:    ${dom}\nAddress:  203.150.10.25`);
    } else if (bin === 'get-service') {
      const target = parts[1];
      const entries = Object.entries(simEnv.winServices).filter(([k]) => !target || k.toLowerCase() === target.toLowerCase());
      if (!entries.length) appendTerm(`Get-Service : Cannot find any service with service name '${target}'.`, 'term-line-err');
      else appendTerm(`Status   Name     DisplayName\n------   ----     -----------\n${entries.map(([k, v]) => `${v.padEnd(9)}${k.padEnd(9)}Windows ${k} Server Service`).join('\n')}`);
    } else if (bin === 'restart-service' || bin === 'start-service') {
      const target = parts[1] || '';
      const key = Object.keys(simEnv.winServices).find((k) => k.toLowerCase() === target.toLowerCase());
      if (!key) appendTerm(`Restart-Service : Cannot find service '${target}' (ลองใช้ DNS, DHCP, NTDS)`, 'term-line-err');
      else {
        simEnv.winServices[key] = 'Running';
        appendTerm(`Service '${key}' is now Running.`, 'term-line-ok');
      }
    } else if (bin === 'gpupdate') {
      appendTerm('Updating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.', 'term-line-ok');
    } else if (bin === 'get-aduser') {
      const rows = simEnv.winAdUsers.map((u) => `${u.name.padEnd(17)}True      ${u.dept}`).join('\n');
      appendTerm(`SamAccountName   Enabled   Department\n--------------   -------   ----------\n${rows}`);
    } else if (bin === 'new-aduser') {
      const nameIdx = parts.findIndex((p) => p.toLowerCase() === '-name');
      const rawName = nameIdx !== -1 ? (parts[nameIdx + 1] || '').replace(/^["']|["']$/g, '') : '';
      if (!rawName) {
        appendTerm('Usage: New-ADUser -Name <username> (เช่น New-ADUser -Name suda.r)', 'term-line-err');
      } else {
        if (!simEnv.winAdUsers.some((u) => u.name.toLowerCase() === rawName.toLowerCase())) {
          simEnv.winAdUsers.push({ name: rawName, dept: 'New-Student' });
        }
        appendTerm(`Active Directory user '${rawName}' created in CN=Users,DC=college,DC=local.`, 'term-line-ok');
      }
    } else if (bin === 'new-netfirewallrule') {
      const portIdx = parts.findIndex((p) => p.toLowerCase() === '-localport');
      const port = portIdx !== -1 ? parts[portIdx + 1] : '';
      const allow = /allow/i.test(cmd);
      if (!port) {
        appendTerm('Usage: New-NetFirewallRule -DisplayName HTTPS -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow', 'term-line-err');
      } else {
        if (allow && !simEnv.winFirewallPorts.includes(port)) simEnv.winFirewallPorts.push(port);
        appendTerm(`Windows Firewall Rule created:\n  DisplayName : Allow-Port-${port}\n  Direction   : Inbound\n  LocalPort   : ${port}/TCP\n  Action      : ${allow ? 'Allow' : 'Block'}\n  Enabled     : True`, 'term-line-ok');
      }
    } else if (bin === 'get-winevent' || bin === 'get-eventlog') {
      appendTerm(
`TimeCreated           Id     LevelDisplayName  Message
-----------           --     ----------------  -------
21/11/2026 03:14:02   4625   Audit Failure     An account failed to log on (User: Administrator, SrcIP: 185.220.101.4)
21/11/2026 03:14:05   4625   Audit Failure     An account failed to log on (User: Administrator, SrcIP: 185.220.101.4)
21/11/2026 03:14:08   4625   Audit Failure     An account failed to log on (User: root, SrcIP: 185.220.101.4)`, 'term-line-ok');
    } else if (bin === 'test-netconnection' || bin === 'tnc') {
      const host = parts[1] || '192.168.10.10';
      const portIdx = parts.findIndex((p) => p.toLowerCase() === '-port');
      const port = portIdx !== -1 ? parts[portIdx + 1] : '80';
      appendTerm(
`ComputerName     : ${host}
RemoteAddress    : ${host}
RemotePort       : ${port}
InterfaceAlias   : Ethernet0
TcpTestSucceeded : True`, 'term-line-ok');
    }
    /* Linux Commands */
    else if (bin === 'whoami') {
      appendTerm(lab.os === 'windows' ? 'college\\administrator' : 'root');
    } else if (bin === 'hostname') {
      appendTerm(lab.os === 'windows' ? 'SRV-DC-01' : 'srv-linux-01');
    } else if (bin === 'uname') {
      appendTerm('Linux srv-linux-01 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux');
    } else if (bin === 'ip' && (parts[1] === 'a' || parts[1] === 'addr')) {
      appendTerm(`1: lo: <LOOPBACK,UP> inet 127.0.0.1/8\n2: eth0: <BROADCAST,MULTICAST,UP> inet 192.168.10.10/24 scope global static eth0`);
    } else if (bin === 'ifconfig') {
      appendTerm('eth0: inet 192.168.10.10  netmask 255.255.255.0  broadcast 192.168.10.255');
    } else if (bin === 'ping') {
      const t = parts[1] || '8.8.8.8';
      appendTerm(`PING ${t}: 64 bytes icmp_seq=1 ttl=58 time=11.4 ms\nPING ${t}: 64 bytes icmp_seq=2 ttl=58 time=10.9 ms\n0% packet loss`, 'term-line-ok');
    } else if (bin === 'systemctl') {
      const act = parts[1];
      const svc = parts[2];
      if (!svc || !(svc in simEnv.services)) {
        appendTerm(`Unit ${svc || ''}.service could not be found (ลอง nginx, ssh, mysql, ufw)`, 'term-line-err');
      } else if (act === 'status') {
        const st = simEnv.services[svc];
        appendTerm(`● ${svc}.service\n   Loaded: loaded\n   Active: ${st === 'active' ? 'active (running)' : 'inactive (dead)'}`, st === 'active' ? 'term-line-ok' : 'term-line-err');
      } else if (act === 'start' || act === 'restart') {
        simEnv.services[svc] = 'active';
        appendTerm(`Service ${svc}.service is now active (running).`, 'term-line-ok');
      } else if (act === 'stop') {
        simEnv.services[svc] = 'inactive';
        appendTerm(`Service ${svc}.service stopped.`, 'term-line-muted');
      } else if (act === 'enable') {
        if (parts.includes('--now')) simEnv.services[svc] = 'active';
        appendTerm(`Created symlink for ${svc}.service.`, 'term-line-ok');
      } else {
        appendTerm(`Unknown systemctl action: ${act}`, 'term-line-err');
      }
    } else if (bin === 'journalctl') {
      appendTerm(
`Nov 21 15:10:02 srv-linux-01 systemd[1]: Starting A high performance web server...
Nov 21 15:10:03 srv-linux-01 nginx[1422]: nginx: configuration file /etc/nginx/nginx.conf test is successful
Nov 21 15:10:03 srv-linux-01 systemd[1]: Started nginx.service.`, 'term-line-ok');
    } else if (bin === 'ss' || bin === 'netstat') {
      appendTerm(
`Proto  Local Address:Port   State       Process/PID
tcp    0.0.0.0:22           LISTEN      sshd (912)
tcp    0.0.0.0:80           LISTEN      nginx (1422)
tcp    0.0.0.0:443          LISTEN      nginx (1422)
tcp    127.0.0.1:3306       LISTEN      mysqld (1104)`);
    } else if (bin === 'df') {
      appendTerm(`Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   19G   29G  40% /\n/dev/sdb1       200G  142G   48G  75% /var/www`);
    } else if (bin === 'du') {
      appendTerm(`1.4G\t/var/log\n138G\t/var/www\n420M\t/var/cache`);
    } else if (bin === 'free') {
      appendTerm(`               total   used   free   available\nMem:           16Gi    4.2Gi  7.8Gi  11.4Gi`);
    } else if (bin === 'ls') {
      if (parts[1] === '/var/log') {
        appendTerm('auth.log   kern.log   nginx/   syslog   ufw.log');
      } else if (parts.some((p) => p.startsWith('-') && p.includes('l'))) {
        appendTerm(Object.entries(simEnv.files).map(([f, p]) => `${p} 1 root admin 2048 Nov 21 15:00 ${f}`).join('\n'));
      } else {
        appendTerm(Object.keys(simEnv.files).join('   '));
      }
    } else if (bin === 'chmod') {
      const mode = parts[1];
      const file = parts[2];
      const sym = octalToSym(mode);
      if (!sym) appendTerm('Usage: chmod <3-digit> <file> (เช่น chmod 600 secret.key)', 'term-line-err');
      else if (!(file in simEnv.files)) appendTerm(`chmod: cannot access '${file}': No such file`, 'term-line-err');
      else {
        simEnv.files[file] = sym;
        appendTerm(`Updated '${file}' -> ${sym} (${mode})`, 'term-line-ok');
      }
    } else if (bin === 'chown') {
      const ownerArg = parts.find((p) => p.includes(':'));
      const pathArg = parts[parts.length - 1];
      if (!ownerArg || !pathArg || pathArg === ownerArg) {
        appendTerm('Usage: chown -R www-data:www-data /var/www/html', 'term-line-err');
      } else {
        if (pathArg.includes('/var/www')) simEnv.webOwner = ownerArg;
        appendTerm(`Changed ownership of '${pathArg}' to ${ownerArg}`, 'term-line-ok');
      }
    } else if (bin === 'ufw') {
      if (parts[1] === 'status') {
        appendTerm(`Status: active\n\nTo                           Action   From\n--                           ------   ----\n${simEnv.firewall.map((r) => r.padEnd(29) + 'ALLOW    Anywhere').join('\n')}`);
      } else if (parts[1] === 'allow') {
        const t = (parts[2] || '').toLowerCase();
        let rule = null;
        if (t === '443' || t === '443/tcp' || t === 'https') rule = '443/tcp (HTTPS)';
        else if (t === '80' || t === '80/tcp' || t === 'http') rule = '80/tcp (HTTP)';
        else if (/^\d+$/.test(t)) rule = `${t}/tcp`;
        if (!rule) appendTerm('Usage: ufw allow <port> (เช่น ufw allow 443)', 'term-line-err');
        else {
          if (!simEnv.firewall.includes(rule)) simEnv.firewall.push(rule);
          appendTerm(`Rule added: ALLOW ${rule}`, 'term-line-ok');
        }
      } else if (parts[1] === 'deny') {
        const t = (parts[2] || '').toLowerCase();
        if (t === '23' || t === '23/tcp' || t === 'telnet') {
          simEnv.firewall = simEnv.firewall.filter((r) => !r.startsWith('23/tcp'));
          appendTerm('Rule updated: DENY 23/tcp (Telnet blocked securely!)', 'term-line-ok');
        } else if (/^\d+$/.test(t)) {
          simEnv.firewall = simEnv.firewall.filter((r) => !r.startsWith(`${t}/tcp`));
          appendTerm(`Rule added: DENY ${t}/tcp`, 'term-line-ok');
        } else {
          appendTerm('Usage: ufw deny <port> (เช่น ufw deny 23)', 'term-line-err');
        }
      } else {
        appendTerm('ใช้คำสั่ง ufw status, ufw allow <port> หรือ ufw deny <port>', 'term-line-err');
      }
    } else if (bin === 'useradd' || bin === 'adduser') {
      const u = parts[1];
      if (!u) appendTerm('Usage: useradd <username>', 'term-line-err');
      else if (simEnv.users.includes(u)) appendTerm(`useradd: user '${u}' already exists`, 'term-line-err');
      else {
        simEnv.users.push(u);
        appendTerm(`User '${u}' created successfully.`, 'term-line-ok');
      }
    } else if (bin === 'usermod') {
      const u = parts[parts.length - 1];
      if (cmd.includes('-aG') && cmd.includes('sudo') && u && u !== 'sudo') {
        if (!simEnv.users.includes(u)) simEnv.users.push(u);
        if (!simEnv.sudoUsers.includes(u)) simEnv.sudoUsers.push(u);
        appendTerm(`Added user '${u}' to supplementary group 'sudo'.`, 'term-line-ok');
      } else {
        appendTerm('Usage: usermod -aG sudo <username> (เช่น usermod -aG sudo student01)', 'term-line-err');
      }
    } else if (bin === 'id') {
      const u = parts[1] || 'root';
      if (simEnv.users.includes(u)) {
        const extra = simEnv.sudoUsers.includes(u) ? ',27(sudo)' : '';
        appendTerm(`uid=1002(${u}) gid=1002(${u}) groups=1002(${u})${extra}`);
      } else appendTerm(`id: '${u}': no such user`, 'term-line-err');
    } else if (bin === 'cat' && parts[1] === '/etc/passwd') {
      appendTerm(simEnv.users.map((u, i) => `${u}:x:${i === 0 ? 0 : 1000 + i}:1000::/home/${u}:/bin/bash`).join('\n'));
    } else if (bin === 'grep') {
      appendTerm(
`Nov 21 03:11:04 srv-linux-01 sshd[2201]: Failed password for root from 185.220.101.4 port 51202 ssh2
Nov 21 03:11:07 srv-linux-01 sshd[2201]: Failed password for root from 185.220.101.4 port 51204 ssh2
Nov 21 03:11:10 srv-linux-01 sshd[2205]: Failed password for admin from 185.220.101.4 port 51209 ssh2`, 'term-line-ok');
    } else if (bin === 'tar') {
      const outFile = parts.find((p) => p.endsWith('.tar.gz')) || 'backup.tar.gz';
      simEnv.files[outFile] = '-rw-r--r--';
      appendTerm(`/var/www/html/\n/var/www/html/index.html\n/var/www/html/styles.css\nArchive '${outFile}' created successfully (1.2 MB).`, 'term-line-ok');
    } else if (bin === 'ps') {
      const rogueLine = simEnv.roguePidKilled ? '' : '\nwww-data  4099 99.4 14.2 812040 220400 ?  R    03:10  48:21 /tmp/miner_bot';
      appendTerm(
`USER       PID %CPU %MEM    VSZ   RSS TTY STAT START   TIME COMMAND
root         1  0.0  0.2 168920 11200 ?   Ss   00:00   0:04 /sbin/init
root       912  0.1  0.3  15420  6200 ?   Ss   00:01   0:02 sshd: /usr/sbin/sshd
www-data  1422  0.4  0.8  55320 14800 ?   S    00:02   0:11 nginx: worker process${rogueLine}`);
    } else if (bin === 'kill') {
      const pid = parts[parts.length - 1];
      if (pid === '4099') {
        simEnv.roguePidKilled = true;
        appendTerm('Process 4099 (miner_bot) terminated (SIGKILL). CPU usage back to normal (3%).', 'term-line-ok');
      } else {
        appendTerm(`kill: (${pid || ''}) - ลองตรวจ PID ด้วย ps aux (โปรเซสมัลแวร์คือ 4099)`, 'term-line-err');
      }
    } else if (bin === 'docker') {
      if (parts[1] === 'ps') {
        const rows = simEnv.dockerRunning.map((c) => `${c.id}   ${c.image.padEnd(14)} Up 4 days   ${c.ports.padEnd(23)} ${c.name}`).join('\n');
        appendTerm(`CONTAINER ID   IMAGE          STATUS      PORTS                   NAMES\n${rows}`, 'term-line-ok');
      } else if (parts[1] === 'run') {
        const newId = 'f9c4e12a88b0';
        if (!simEnv.dockerRunning.some((c) => c.id === newId)) {
          simEnv.dockerRunning.push({ id: newId, image: 'nginx', ports: '0.0.0.0:8080->80/tcp', name: 'web01' });
        }
        appendTerm(`${newId}d4b91a82e01c7b9f8831\nContainer started in detached mode (0.0.0.0:8080->80/tcp).`, 'term-line-ok');
      } else if (parts[1] === 'images') {
        appendTerm(`REPOSITORY   TAG      IMAGE ID       SIZE\nnginx        alpine   4f380adfc10f   41.2MB\nmysql        8.0      91c95931e552   578MB`);
      } else {
        appendTerm('รองรับคำสั่ง: docker ps, docker ps -a, docker images, docker run -d -p 8080:80 nginx', 'term-line-muted');
      }
    } else if (bin === 'apt') {
      if (parts[1] === 'update') {
        appendTerm(`Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nGet:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]\nReading package lists... Done\nAll security repositories are up to date.`, 'term-line-ok');
      } else if (parts[1] === 'upgrade') {
        appendTerm('0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.', 'term-line-ok');
      } else {
        appendTerm('รองรับคำสั่ง: apt update, apt upgrade', 'term-line-muted');
      }
    } else if (bin === 'crontab') {
      appendTerm('# m h  dom mon dow   command\n0 2 * * * /opt/backup.sh\n*/15 * * * * /usr/local/bin/healthcheck.sh', 'term-line-ok');
    } else if (bin === 'tail') {
      appendTerm(
`2026/11/21 16:05:11 [notice] nginx worker process 1422 started
2026/11/21 16:06:04 [info] GET /index.html HTTP/2.0 200 OK
2026/11/21 16:07:30 [warn] rate limit triggered for 45.12.88.9`, 'term-line-ok');
    } else if (bin === 'uptime') {
      appendTerm(' 16:08:12 up 42 days,  5:19,  1 user,  load average: 0.34, 0.41, 0.38');
    } else {
      appendTerm(`ไม่พบคำสั่ง '${parts[0]}' — พิมพ์ 'help' เพื่อดูคำสั่งที่รองรับ`, 'term-line-err');
    }

    // Check lab completions
    let passedAny = false;
    CLI_LABS.forEach((item) => {
      if (!state.completedLabs.includes(item.id) && item.check(cmd, simEnv)) {
        state.completedLabs.push(item.id);
        recordAnalytics(item.category, true);
        bumpDailyQuest('labsOrPuzzles');
        grantRewards(item.xp, item.coins);
        SoundFX.coin();
        appendTerm(`\n✅ [MISSION COMPLETE] ผ่าน "${item.title}" (+${item.xp} XP, +💰${item.coins})\n`, 'term-line-ok');
        showToast(`💻 ผ่าน ${item.title} (+${item.xp} XP, +💰${item.coins})`);
        passedAny = true;
      }
    });

    if (passedAny) {
      const nextTodo = CLI_LABS.find((l) => !state.completedLabs.includes(l.id) && (cliFilterOs === 'all' || l.os === cliFilterOs));
      if (nextTodo) activeCliLabId = nextTodo.id;
      renderCliSidebar();
    }
  }

  $('terminalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('terminalInput');
    if (inp.value.trim()) {
      cliHistory.push(inp.value);
      cliHistPtr = cliHistory.length;
    }
    executeCli(inp.value);
    inp.value = '';
  });

  $('terminalInput').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && cliHistPtr > 0) {
      e.preventDefault();
      cliHistPtr -= 1;
      $('terminalInput').value = cliHistory[cliHistPtr];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cliHistPtr < cliHistory.length - 1) {
        cliHistPtr += 1;
        $('terminalInput').value = cliHistory[cliHistPtr];
      } else {
        cliHistPtr = cliHistory.length;
        $('terminalInput').value = '';
      }
    }
  });

  document.querySelectorAll('.os-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      cliFilterOs = btn.dataset.os;
      document.querySelectorAll('.os-tab').forEach((b) => {
        const active = b.dataset.os === cliFilterOs;
        b.className = `btn btn-sm os-tab ${active ? 'btn-neon active' : 'btn-ghost'}`;
      });
      renderCliSidebar();
      initCliWelcome();
    });
  });

  $('cliHintBtn').addEventListener('click', () => {
    SoundFX.click();
    $('cliHintBox').classList.toggle('hidden');
  });

  $('cliClearBtn').addEventListener('click', () => {
    SoundFX.click();
    initCliWelcome();
  });

  /* ==================== SCREEN 4: PACKET DEFENSE ARCADE ==================== */
  let def = {
    waveMode: true,
    wave: 1,
    hearts: 3,
    score: 0,
    combo: 1,
    maxCombo: 1,
    correctCount: 0,
    packetCount: 0,
    isBossPacket: false,
    timeMs: 9000,
    maxTimeMs: 9000,
    card: null,
    locked: false
  };

  function stopDefenseTimer() {
    clearInterval(defIntervalId);
    defIntervalId = null;
  }

  function updateDefHud() {
    $('defWave').textContent = def.waveMode ? def.wave : '∞';
    $('defHearts').textContent = def.waveMode ? ('💚'.repeat(def.hearts) + '🖤'.repeat(3 - def.hearts)) : '♾️';
    $('defScore').textContent = def.score.toLocaleString();
    $('defCombo').textContent = `x${def.combo}`;
    $('defHigh').textContent = Math.max(state.defenseHighScore, def.score).toLocaleString();
  }

  function startDefense(waveMode) {
    SoundFX.click();
    stopDefenseTimer();
    def = {
      waveMode,
      wave: 1,
      hearts: 3,
      score: 0,
      combo: 1,
      maxCombo: 1,
      correctCount: 0,
      packetCount: 0,
      isBossPacket: false,
      timeMs: 9000,
      maxTimeMs: 9000,
      card: null,
      locked: false
    };

    $('defIntro').classList.add('hidden');
    $('defOver').classList.add('hidden');
    $('defPlay').classList.remove('hidden');
    $('defFeedback').textContent = '';

    updateDefHud();
    spawnNextPacket();
  }

  function spawnNextPacket() {
    stopDefenseTimer();
    def.locked = false;
    def.packetCount += 1;
    def.isBossPacket = def.waveMode && def.packetCount % 5 === 0;
    def.card = PORT_CARDS[Math.floor(Math.random() * PORT_CARDS.length)];

    const pCard = $('defPacketCard');
    pCard.classList.toggle('boss-packet', def.isBossPacket);
    $('defPacketTag').textContent = def.isBossPacket ? '⚠️ BOSS PACKET (x2 POINTS!)' : `INCOMING PACKET #${def.packetCount}`;
    $('defPacketLayer').textContent = def.card.layer;
    $('defPacketPrompt').textContent = def.card.prompt;
    $('defPacketSub').textContent = def.card.sub;

    const distractors = shuffle(PORT_CARDS.filter((c) => c.port !== def.card.port)).slice(0, 3);
    const choices = shuffle([def.card, ...distractors]);

    const grid = $('defChoices');
    grid.innerHTML = '';
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'port-choice-btn';
      btn.innerHTML = `<span class="port-choice-num">Port ${choice.port}</span><span class="port-choice-proto">${choice.proto}</span>`;
      btn.addEventListener('click', () => handleDefAnswer(choice, btn));
      grid.appendChild(btn);
    });

    if (def.waveMode) {
      def.maxTimeMs = Math.max(3600, 9500 - (def.wave - 1) * 900 - (def.isBossPacket ? 1000 : 0));
      def.timeMs = def.maxTimeMs;
      $('defTimerBar').style.width = '100%';
      defIntervalId = setInterval(() => {
        def.timeMs -= 100;
        const pct = Math.max(0, (def.timeMs / def.maxTimeMs) * 100);
        $('defTimerBar').style.width = `${pct}%`;
        if (def.timeMs <= 0) {
          handleDefTimeout();
        }
      }, 100);
    } else {
      $('defTimerBar').style.width = '100%';
    }
  }

  function handleDefTimeout() {
    if (def.locked) return;
    def.locked = true;
    stopDefenseTimer();
    SoundFX.wrong();
    def.combo = 1;
    def.hearts = Math.max(0, def.hearts - 1);
    recordAnalytics('network', false);
    $('defFeedback').style.color = 'var(--danger)';
    $('defFeedback').textContent = `⏱️ หมดเวลา! แพ็กเก็ตหลุดเข้า Firewall — คำตอบคือ Port ${def.card.port} (${def.card.proto})`;
    updateDefHud();

    setTimeout(() => {
      if (def.hearts <= 0) endDefenseGame();
      else spawnNextPacket();
    }, 900);
  }

  function handleDefAnswer(choice, btn) {
    if (def.locked) return;
    def.locked = true;
    stopDefenseTimer();

    const ok = choice.port === def.card.port;
    recordAnalytics('network', ok);
    const fb = $('defFeedback');

    if (ok) {
      SoundFX.attack();
      const mult = def.isBossPacket ? 2 : 1;
      const pts = 100 * def.combo * mult;
      def.score += pts;
      def.correctCount += 1;
      def.combo = Math.min(6, def.combo + 1);
      def.maxCombo = Math.max(def.maxCombo, def.combo);
      if (def.waveMode && def.correctCount % 5 === 0) {
        def.wave += 1;
        SoundFX.levelUp();
        showToast(`🌊 เข้าสู่ Wave ${def.wave}! แพ็กเก็ตเร็วขึ้นแล้ว!`);
      }
      btn.style.borderColor = 'var(--accent)';
      btn.style.background = 'rgba(52, 211, 153, 0.22)';
      fb.style.color = 'var(--accent)';
      fb.textContent = `✅ ป้องกันสำเร็จ! Port ${def.card.port} (${def.card.proto}) +${pts} คะแนน`;
    } else {
      SoundFX.wrong();
      def.combo = 1;
      if (def.waveMode) def.hearts = Math.max(0, def.hearts - 1);
      btn.style.borderColor = 'var(--danger)';
      btn.style.background = 'rgba(248, 113, 113, 0.22)';
      fb.style.color = 'var(--danger)';
      fb.textContent = `❌ ผิดพอร์ต! คำตอบคือ Port ${def.card.port} (${def.card.proto})`;
    }

    updateDefHud();
    setTimeout(() => {
      if (def.waveMode && def.hearts <= 0) endDefenseGame();
      else spawnNextPacket();
    }, 750);
  }

  function endDefenseGame() {
    stopDefenseTimer();
    $('defPlay').classList.add('hidden');
    $('defOver').classList.remove('hidden');

    const rawXp = Math.min(30, Math.round(def.score / 80));
    const { granted: xp, remainingAfter } = applyArcadeXpCap(rawXp);
    const coins = Math.min(60, Math.round(def.score / 45));
    if (def.score > state.defenseHighScore) state.defenseHighScore = def.score;
    bumpDailyQuest('arcadePlayed');
    grantRewards(xp, coins);

    $('defOverStats').innerHTML = `
      <div class="reward-box"><span>คะแนนรวม</span><strong>${def.score.toLocaleString()}</strong></div>
      <div class="reward-box"><span>ผ่านถึง Wave</span><strong>${def.wave}</strong></div>
      <div class="reward-box"><span>Combo สูงสุด</span><strong>x${def.maxCombo}</strong></div>
      <div class="reward-box"><span>รางวัล (โควตา XP วันนี้เหลือ ${remainingAfter})</span><strong>+${xp}XP • 💰${coins}</strong></div>
    `;
  }

  $('defStartWaveBtn').addEventListener('click', () => startDefense(true));
  $('defBigWaveBtn').addEventListener('click', () => startDefense(true));
  $('defStartEndlessBtn').addEventListener('click', () => startDefense(false));
  $('defBigPracticeBtn').addEventListener('click', () => startDefense(false));
  $('defReplayBtn').addEventListener('click', () => startDefense(def.waveMode));

  /* ==================== ARCADE 2: LIGHTNING BLITZ 45s ==================== */
  let blitz = {
    timeLeft: 45,
    score: 0,
    combo: 1,
    correct: 0,
    count: 0,
    queue: [],
    current: null,
    locked: false
  };

  function stopBlitzTimer() {
    clearInterval(blitzIntervalId);
    blitzIntervalId = null;
  }

  function updateBlitzHud() {
    $('blitzTimer').textContent = `${Math.max(0, blitz.timeLeft)}s`;
    $('blitzScore').textContent = blitz.score.toLocaleString();
    $('blitzCombo').textContent = `x${blitz.combo}`;
    $('blitzCorrect').textContent = blitz.correct;
    $('blitzHigh').textContent = Math.max(state.blitzHighScore || 0, blitz.score).toLocaleString();
  }

  function startBlitz() {
    SoundFX.bossAlert();
    stopBlitzTimer();
    blitz = {
      timeLeft: 45,
      score: 0,
      combo: 1,
      correct: 0,
      count: 0,
      queue: shuffle(BLITZ_QUESTIONS),
      current: null,
      locked: false
    };
    $('blitzIntro').classList.add('hidden');
    $('blitzOver').classList.add('hidden');
    $('blitzPlay').classList.remove('hidden');
    $('blitzFeedback').textContent = '';

    updateBlitzHud();
    nextBlitzQuestion();

    blitzIntervalId = setInterval(() => {
      blitz.timeLeft -= 1;
      updateBlitzHud();
      if (blitz.timeLeft <= 0) finishBlitz();
    }, 1000);
  }

  function nextBlitzQuestion() {
    blitz.locked = false;
    if (!blitz.queue.length) blitz.queue = shuffle(BLITZ_QUESTIONS);
    blitz.current = blitz.queue.pop();
    blitz.count += 1;
    $('blitzCountBadge').textContent = `ข้อที่ ${blitz.count}`;
    $('blitzStatement').textContent = blitz.current.stmt;
    $('blitzTrueBtn').disabled = false;
    $('blitzFalseBtn').disabled = false;
  }

  function answerBlitz(choiceBool) {
    if (blitz.locked || blitz.timeLeft <= 0) return;
    blitz.locked = true;
    $('blitzTrueBtn').disabled = true;
    $('blitzFalseBtn').disabled = true;

    const ok = choiceBool === blitz.current.isTrue;
    const fb = $('blitzFeedback');
    if (ok) {
      SoundFX.attack();
      const gained = 80 * blitz.combo;
      blitz.score += gained;
      blitz.correct += 1;
      blitz.combo = Math.min(6, blitz.combo + 1);
      blitz.timeLeft = Math.min(60, blitz.timeLeft + 2);
      state.currentCorrectStreak = (state.currentCorrectStreak || 0) + 1;
      state.bestCorrectStreak = Math.max(state.bestCorrectStreak || 0, state.currentCorrectStreak);
      checkBadges();
      renderHud();
      fb.style.color = 'var(--accent)';
      fb.textContent = `⚡ ถูกต้อง! +${gained} คะแนน (+2 วิ) — ${blitz.current.fact}`;
    } else {
      SoundFX.wrong();
      blitz.combo = 1;
      blitz.timeLeft = Math.max(0, blitz.timeLeft - 3);
      state.currentCorrectStreak = 0;
      const lostXp = deductXp(5);
      fb.style.color = 'var(--danger)';
      fb.textContent = `❌ ผิด! (-3 วิ${lostXp > 0 ? `, -${lostXp} XP` : ''}) — ${blitz.current.fact}`;
    }

    updateBlitzHud();
    if (blitz.timeLeft <= 0) {
      setTimeout(finishBlitz, 500);
    } else {
      setTimeout(nextBlitzQuestion, 850);
    }
  }

  function finishBlitz() {
    stopBlitzTimer();
    $('blitzPlay').classList.add('hidden');
    $('blitzOver').classList.remove('hidden');

    const rawXp = Math.min(30, Math.round(blitz.score / 70));
    const { granted: xp, remainingAfter } = applyArcadeXpCap(rawXp);
    const coins = Math.min(60, Math.round(blitz.score / 40));
    if (blitz.score > (state.blitzHighScore || 0)) state.blitzHighScore = blitz.score;
    bumpDailyQuest('arcadePlayed');
    grantRewards(xp, coins);
    SoundFX.levelUp();

    $('blitzOverStats').innerHTML = `
      <div class="reward-box"><span>คะแนนรวม</span><strong>${blitz.score.toLocaleString()}</strong></div>
      <div class="reward-box"><span>ตอบถูกทั้งหมด</span><strong>${blitz.correct} ข้อ</strong></div>
      <div class="reward-box"><span>สถิติสูงสุด</span><strong>${state.blitzHighScore.toLocaleString()}</strong></div>
      <div class="reward-box"><span>รางวัล (โควตา XP วันนี้เหลือ ${remainingAfter})</span><strong>+${xp}XP • 💰${coins}</strong></div>
    `;
  }

  $('blitzStartBtn').addEventListener('click', startBlitz);
  $('blitzReplayBtn').addEventListener('click', startBlitz);
  $('blitzTrueBtn').addEventListener('click', () => answerBlitz(true));
  $('blitzFalseBtn').addEventListener('click', () => answerBlitz(false));

  document.querySelectorAll('.arcade-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      stopDefenseTimer();
      stopBlitzTimer();
      const target = btn.dataset.arcade;
      document.querySelectorAll('.arcade-tab').forEach((b) => {
        b.className = `btn btn-sm arcade-tab ${b.dataset.arcade === target ? 'btn-neon active' : 'btn-ghost'}`;
      });
      $('arcade-packet').classList.toggle('hidden', target !== 'packet');
      $('arcade-blitz').classList.toggle('hidden', target !== 'blitz');
      $('blitzHigh').textContent = (state.blitzHighScore || 0).toLocaleString();
    });
  });

  /* ==================== SCREEN 5: PUZZLE VAULT (CHMOD + RAID) ==================== */
  let vaultIdx = 0;
  let raidIdx = 0;
  let selectedRaidLevel = '5';

  function getChmodModeString() {
    const vals = { u: 0, g: 0, o: 0 };
    document.querySelectorAll('.chmod-cb').forEach((cb) => {
      if (cb.checked) vals[cb.dataset.role] += Number(cb.dataset.val);
    });
    return { vals, mode: `${vals.u}${vals.g}${vals.o}` };
  }

  function updateChmodDisplay() {
    const { vals, mode } = getChmodModeString();
    const curPuzzle = CHMOD_PUZZLES[vaultIdx];
    $('chmodU').textContent = vals.u;
    $('chmodG').textContent = vals.g;
    $('chmodO').textContent = vals.o;
    $('chmodCmdOut').textContent = `chmod ${mode} ${curPuzzle.file}`;
    $('chmodSymOut').textContent = octalToSym(mode);

    const notes = {
      '755': '755 (-rwxr-xr-x): มาตรฐานสคริปต์และโฟลเดอร์เว็บ ปลอดภัยและรันได้',
      '644': '644 (-rw-r--r--): มาตรฐานไฟล์ตั้งค่าและไฟล์เอกสารทั่วไป',
      '600': '600 (-rw-------): ปลอดภัยสูงสุดสำหรับ SSH Private Key และไฟล์รหัสผ่าน',
      '750': '750 (-rwxr-x---): เฉพาะเจ้าของและคนในกลุ่มใช้งานได้ คนนอกห้ามเข้า',
      '777': '⚠️ 777 (-rwxrwxrwx): อันตรายมาก! อนุญาตให้ทุกคนแก้ไขและรันไฟล์ได้ ห้ามใช้บน Server จริง'
    };
    $('chmodNote').textContent = notes[mode] || `ค่าปัจจุบันคือ ${mode} (${octalToSym(mode)}) — Read=4, Write=2, Execute=1`;
  }

  function setChmodBoxes(modeStr) {
    const digits = { u: +modeStr[0], g: +modeStr[1], o: +modeStr[2] };
    document.querySelectorAll('.chmod-cb').forEach((cb) => {
      cb.checked = Boolean(digits[cb.dataset.role] & Number(cb.dataset.val));
    });
    updateChmodDisplay();
  }

  function renderChmodVault() {
    const p = CHMOD_PUZZLES[vaultIdx];
    const solved = state.solvedChmod.includes(p.id);
    $('chmodSolvedChip').textContent = `ผ่านแล้ว ${state.solvedChmod.length} / ${CHMOD_PUZZLES.length}`;
    $('vaultFileName').textContent = `${p.file} ${solved ? '✅ (ปลดล็อกแล้ว)' : ''}`;
    $('vaultBrief').textContent = p.brief;
    $('vaultIndexText').textContent = `ด่าน ${vaultIdx + 1} / ${CHMOD_PUZZLES.length}`;
    $('vaultFeedback').classList.add('hidden');
    updateChmodDisplay();
  }

  $('vaultCheckBtn').addEventListener('click', () => {
    const p = CHMOD_PUZZLES[vaultIdx];
    const { mode } = getChmodModeString();
    const fb = $('vaultFeedback');
    fb.classList.remove('hidden', 'ok', 'err');

    if (mode === p.target) {
      recordAnalytics('users', true);
      fb.classList.add('ok');
      if (!state.solvedChmod.includes(p.id)) {
        state.solvedChmod.push(p.id);
        bumpDailyQuest('labsOrPuzzles');
        grantRewards(p.rewardXp, p.rewardCoins);
        SoundFX.coin();
        fb.innerHTML = `<strong>🔓 ปลดล็อกตู้เซฟสำเร็จ!</strong> <code>chmod ${p.target} ${p.file}</code> (${octalToSym(p.target)}) • รับ +${p.rewardXp} XP และ +💰${p.rewardCoins}`;
      } else {
        SoundFX.correct();
        fb.innerHTML = `<strong>🔓 ถูกต้อง!</strong> <code>chmod ${p.target} ${p.file}</code> (${octalToSym(p.target)})`;
      }
      $('chmodSolvedChip').textContent = `ผ่านแล้ว ${state.solvedChmod.length} / ${CHMOD_PUZZLES.length}`;
      $('vaultFileName').textContent = `${p.file} ✅ (ปลดล็อกแล้ว)`;
    } else {
      SoundFX.wrong();
      recordAnalytics('users', false);
      fb.classList.add('err');
      fb.innerHTML = `<strong>❌ รหัสยังไม่ตรง!</strong> ตอนนี้คุณตั้งไว้เป็น <code>${mode}</code> (${octalToSym(mode)}) ลองเช็กสิทธิ์ Owner / Group / Others อีกครั้ง`;
    }
  });

  $('vaultPrevBtn').addEventListener('click', () => {
    SoundFX.click();
    vaultIdx = (vaultIdx - 1 + CHMOD_PUZZLES.length) % CHMOD_PUZZLES.length;
    renderChmodVault();
  });

  $('vaultNextBtn').addEventListener('click', () => {
    SoundFX.click();
    vaultIdx = (vaultIdx + 1) % CHMOD_PUZZLES.length;
    renderChmodVault();
  });

  document.querySelectorAll('.chmod-cb').forEach((cb) => cb.addEventListener('change', () => {
    SoundFX.click();
    updateChmodDisplay();
  }));

  document.querySelectorAll('.chmod-preset').forEach((btn) => btn.addEventListener('click', () => {
    SoundFX.click();
    setChmodBoxes(btn.dataset.mode);
  }));

  /* RAID Architect */
  function renderRaidVisual(level, failedDiskCount = 0) {
    selectedRaidLevel = level;
    const info = RAID_INFO[level];
    document.querySelectorAll('.raid-tab').forEach((btn) => {
      btn.className = `btn btn-sm raid-tab ${btn.dataset.raid === level ? 'btn-neon' : 'btn-ghost'}`;
    });

    const vis = $('raidVisual');
    vis.innerHTML = '';
    info.disks.forEach((d, idx) => {
      const isFailed = idx < failedDiskCount;
      const col = document.createElement('div');
      col.className = `raid-disk ${isFailed ? 'failed' : ''}`;
      col.innerHTML = `
        <div class="raid-disk-title">${d.name}</div>
        ${d.blocks.map((b) => `<div class="raid-block ${b.cls}">${b.label}</div>`).join('')}
        ${isFailed ? '<div class="raid-fail-tag">💥 DISK FAILED</div>' : ''}
      `;
      vis.appendChild(col);
    });

    const survived = failedDiskCount <= info.faultTolerance;
    const statusChip = $('raidStatusChip');
    if (failedDiskCount === 0) {
      statusChip.textContent = 'HEALTHY';
      statusChip.style.color = 'var(--accent)';
    } else if (survived) {
      statusChip.textContent = `DEGRADED — DATA SAFE ✓ (${failedDiskCount} ดิสก์พัง)`;
      statusChip.style.color = 'var(--gold)';
    } else {
      statusChip.textContent = `CRITICAL — DATA LOST! ✕ (${failedDiskCount} ดิสก์พัง)`;
      statusChip.style.color = 'var(--danger)';
    }

    $('raidDetails').innerHTML = `
      <div><strong>${info.name}</strong> (ขั้นต่ำ ${info.minDisks} ลูก)</div>
      <div>• <strong>พื้นที่ใช้งานจริง:</strong> ${info.usable}</div>
      <div>• <strong>ความทนทาน:</strong> ${info.faultText}</div>
      <div>• <strong>ความเร็ว:</strong> ${info.speed}</div>
      <div>• <strong>งานที่เหมาะสม:</strong> ${info.useCase}</div>
    `;
  }

  function renderRaidChallenge() {
    const ch = RAID_CHALLENGES[raidIdx];
    const done = state.solvedRaid.includes(ch.id);
    $('raidSolvedChip').textContent = `ผ่านแล้ว ${state.solvedRaid.length} / ${RAID_CHALLENGES.length}`;
    $('raidClientName').textContent = `${ch.client} ${done ? '✅' : ''}`;
    $('raidChallengeBrief').textContent = ch.brief;
    $('raidIndexText').textContent = `โจทย์ ${raidIdx + 1} / ${RAID_CHALLENGES.length}`;
    $('raidFeedback').classList.add('hidden');
    renderRaidVisual(selectedRaidLevel, 0);
  }

  $('raidSubmitBtn').addEventListener('click', () => {
    const ch = RAID_CHALLENGES[raidIdx];
    renderRaidVisual(selectedRaidLevel, ch.failCount);
    const fb = $('raidFeedback');
    fb.classList.remove('hidden', 'ok', 'err');

    if (selectedRaidLevel === ch.answer) {
      recordAnalytics('storage', true);
      fb.classList.add('ok');
      if (!state.solvedRaid.includes(ch.id)) {
        state.solvedRaid.push(ch.id);
        bumpDailyQuest('labsOrPuzzles');
        grantRewards(35, 45);
        SoundFX.coin();
        fb.innerHTML = `<strong>✅ ออกแบบผ่านฉลุย!</strong> ${ch.explain} • รับ +35 XP และ +💰45`;
      } else {
        SoundFX.correct();
        fb.innerHTML = `<strong>✅ ถูกต้อง!</strong> ${ch.explain}`;
      }
      $('raidSolvedChip').textContent = `ผ่านแล้ว ${state.solvedRaid.length} / ${RAID_CHALLENGES.length}`;
      $('raidClientName').textContent = `${ch.client} ✅`;
    } else {
      SoundFX.wrong();
      recordAnalytics('storage', false);
      fb.classList.add('err');
      fb.innerHTML = `<strong>❌ ยังไม่เหมาะกับโจทย์นี้</strong> — คุณเลือก RAID ${selectedRaidLevel} ลองพิจารณาเรื่องจำนวนดิสก์ ความจุ และจำนวนดิสก์ที่ทนเสียได้อีกครั้ง!`;
    }
  });

  $('raidSimFailBtn').addEventListener('click', () => {
    SoundFX.bossAlert();
    renderRaidVisual(selectedRaidLevel, 1);
  });

  $('raidPrevBtn').addEventListener('click', () => {
    SoundFX.click();
    raidIdx = (raidIdx - 1 + RAID_CHALLENGES.length) % RAID_CHALLENGES.length;
    renderRaidChallenge();
  });

  $('raidNextBtn').addEventListener('click', () => {
    SoundFX.click();
    raidIdx = (raidIdx + 1) % RAID_CHALLENGES.length;
    renderRaidChallenge();
  });

  document.querySelectorAll('.raid-tab').forEach((btn) => btn.addEventListener('click', () => {
    SoundFX.click();
    renderRaidVisual(btn.dataset.raid, 0);
  }));

  /* Puzzle 3: Firewall Rule Master */
  let fwIdx = 0;
  let fwUserState = {};

  function renderFirewallPuzzle() {
    const p = FIREWALL_PUZZLES[fwIdx];
    const solved = (state.solvedFirewall || []).includes(p.id);
    $('fwSolvedChip').textContent = `ผ่านแล้ว ${(state.solvedFirewall || []).length} / ${FIREWALL_PUZZLES.length}`;
    $('fwServerName').textContent = `${p.serverName} ${solved ? '✅' : ''}`;
    $('fwBrief').textContent = p.brief;
    $('fwIndexText').textContent = `ด่าน ${fwIdx + 1} / ${FIREWALL_PUZZLES.length}`;
    $('fwFeedback').classList.add('hidden');

    fwUserState = {};
    const grid = $('fwRulesGrid');
    grid.innerHTML = '';

    p.ports.forEach((item) => {
      fwUserState[item.port] = false; // Default Deny!
      const row = document.createElement('div');
      row.className = 'fw-rule-card is-deny';
      row.innerHTML = `
        <div>
          <div class="fw-port-num">Port ${item.port}</div>
          <div class="fw-port-label">${item.label}</div>
        </div>
        <button type="button" class="fw-toggle-btn deny">DENY ✕</button>
      `;
      const btn = row.querySelector('button');
      btn.addEventListener('click', () => {
        SoundFX.click();
        fwUserState[item.port] = !fwUserState[item.port];
        const allow = fwUserState[item.port];
        row.className = `fw-rule-card ${allow ? 'is-allow' : 'is-deny'}`;
        btn.className = `fw-toggle-btn ${allow ? 'allow' : 'deny'}`;
        btn.textContent = allow ? 'ALLOW ✓' : 'DENY ✕';
      });
      grid.appendChild(row);
    });
  }

  $('fwTestBtn').addEventListener('click', () => {
    const p = FIREWALL_PUZZLES[fwIdx];
    const mistakes = p.ports.filter((item) => Boolean(fwUserState[item.port]) !== item.shouldAllow);
    const fb = $('fwFeedback');
    fb.classList.remove('hidden', 'ok', 'err');

    if (mistakes.length === 0) {
      recordAnalytics('security', true);
      fb.classList.add('ok');
      if (!state.solvedFirewall.includes(p.id)) {
        state.solvedFirewall.push(p.id);
        bumpDailyQuest('labsOrPuzzles');
        grantRewards(p.rewardXp, p.rewardCoins);
        SoundFX.coin();
        fb.innerHTML = `<strong>🛡️ ปราการ Firewall สมบูรณ์แบบ!</strong> ${p.explain} • รับ +${p.rewardXp} XP และ +💰${p.rewardCoins}`;
      } else {
        SoundFX.correct();
        fb.innerHTML = `<strong>🛡️ กฎ Firewall ถูกต้อง 100%!</strong> ${p.explain}`;
      }
      $('fwSolvedChip').textContent = `ผ่านแล้ว ${state.solvedFirewall.length} / ${FIREWALL_PUZZLES.length}`;
      $('fwServerName').textContent = `${p.serverName} ✅`;
    } else {
      SoundFX.wrong();
      recordAnalytics('security', false);
      const hintPorts = mistakes.map((m) => `Port ${m.port} (${m.label})`).join(', ');
      fb.classList.add('err');
      fb.innerHTML = `<strong>❌ ทดสอบทราฟฟิกไม่ผ่าน!</strong> พบกฎที่ยังไม่ถูกต้อง ${mistakes.length} จุด ได้แก่: <strong>${hintPorts}</strong> — ลองปรับ Allow/Deny ใหม่แล้วกดทดสอบอีกครั้ง!`;
    }
  });

  $('fwPrevBtn').addEventListener('click', () => {
    SoundFX.click();
    fwIdx = (fwIdx - 1 + FIREWALL_PUZZLES.length) % FIREWALL_PUZZLES.length;
    renderFirewallPuzzle();
  });

  $('fwNextBtn').addEventListener('click', () => {
    SoundFX.click();
    fwIdx = (fwIdx + 1) % FIREWALL_PUZZLES.length;
    renderFirewallPuzzle();
  });

  /* Puzzle 4: IP & Subnet Medic */
  let snIdx = 0;

  function renderSubnetPuzzle() {
    const p = SUBNET_PUZZLES[snIdx];
    const solved = (state.solvedSubnet || []).includes(p.id);
    $('snSolvedChip').textContent = `ผ่านแล้ว ${(state.solvedSubnet || []).length} / ${SUBNET_PUZZLES.length}`;
    $('snTitle').textContent = `${p.title} ${solved ? '✅' : ''}`;
    $('snBrief').textContent = p.brief;
    $('snIndexText').textContent = `เคส ${snIdx + 1} / ${SUBNET_PUZZLES.length}`;
    $('snFeedback').classList.add('hidden');

    const opts = $('snOptions');
    opts.innerHTML = '';
    const keys = ['A', 'B', 'C', 'D'];
    p.options.forEach((text, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="opt-key">${keys[i]}</span><span>${text}</span>`;
      btn.addEventListener('click', () => {
        const fb = $('snFeedback');
        fb.classList.remove('hidden', 'ok', 'err');
        opts.querySelectorAll('.option-btn').forEach((b, idx) => {
          b.disabled = true;
          if (idx === p.answer) b.classList.add('correct');
        });
        if (i === p.answer) {
          recordAnalytics('network', true);
          fb.classList.add('ok');
          if (!state.solvedSubnet.includes(p.id)) {
            state.solvedSubnet.push(p.id);
            bumpDailyQuest('labsOrPuzzles');
            grantRewards(p.rewardXp, p.rewardCoins);
            SoundFX.coin();
            fb.innerHTML = `<strong>📡 คำนวณถูกต้อง!</strong> ${p.explain} • รับ +${p.rewardXp} XP และ +💰${p.rewardCoins}`;
          } else {
            SoundFX.correct();
            fb.innerHTML = `<strong>📡 ถูกต้อง!</strong> ${p.explain}`;
          }
          $('snSolvedChip').textContent = `ผ่านแล้ว ${state.solvedSubnet.length} / ${SUBNET_PUZZLES.length}`;
          $('snTitle').textContent = `${p.title} ✅`;
        } else {
          SoundFX.wrong();
          btn.classList.add('wrong');
          recordAnalytics('network', false);
          fb.classList.add('err');
          fb.innerHTML = `<strong>❌ ยังไม่ถูกต้อง</strong> — ${p.explain}`;
        }
      });
      opts.appendChild(btn);
    });
  }

  $('snPrevBtn').addEventListener('click', () => {
    SoundFX.click();
    snIdx = (snIdx - 1 + SUBNET_PUZZLES.length) % SUBNET_PUZZLES.length;
    renderSubnetPuzzle();
  });

  $('snNextBtn').addEventListener('click', () => {
    SoundFX.click();
    snIdx = (snIdx + 1) % SUBNET_PUZZLES.length;
    renderSubnetPuzzle();
  });

  document.querySelectorAll('.puzzle-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      const target = btn.dataset.ptab;
      document.querySelectorAll('.puzzle-tab').forEach((b) => {
        b.className = `btn btn-sm puzzle-tab ${b.dataset.ptab === target ? 'btn-neon active' : 'btn-ghost'}`;
      });
      ['chmod', 'raid', 'firewall', 'subnet'].forEach((t) => {
        $(`ptab-${t}`).classList.toggle('hidden', target !== t);
      });
    });
  });

  /* ==================== SCREEN 6: TOOLKIT SHOP ==================== */
  function renderShop() {
    $('shopCoinsDisplay').textContent = state.coins.toLocaleString();
    const grid = $('shopGrid');
    grid.innerHTML = '';

    SHOP_ITEMS.forEach((item) => {
      const isWarpPass = item.id === 'warp_pass';
      const warpBought = isWarpPass && Boolean(state.warpPassPurchased);
      const warpInBag = state.inventory.warp_pass || 0;

      let ownedText = `มีในกระเป๋า: ${state.inventory[item.id] || 0} ชิ้น`;
      let btnLabel = `ซื้อ 💰 ${item.price}`;
      let canBuy = state.coins >= item.price;

      if (item.id === 'boost') {
        ownedText = state.xpBoostActive ? '🔥 กำลังเปิดใช้งาน (x2 ด่านถัดไป)' : 'ยังไม่ได้เปิดใช้งาน';
        if (state.xpBoostActive) canBuy = false;
      } else if (isWarpPass) {
        if (warpBought) {
          ownedText = warpInBag > 0
            ? '🌀 มีในกระเป๋า: 1 ชิ้น (ไปที่แผนที่โลกแล้วคลิกโซนที่ล็อกเพื่อใช้!) • ครบสิทธิ์ 1/1'
            : '✅ ใช้สิทธิ์ซื้อครบแล้ว (1 / 1 ครั้ง)';
          btnLabel = '🔒 จำกัดซื้อได้ 1 ครั้ง (ซื้อแล้ว)';
          canBuy = false;
        } else {
          ownedText = '⭐ สินค้าพิเศษ — จำกัดสิทธิ์ซื้อได้เพียง 1 ครั้งต่อบัญชี!';
        }
      }

      const card = document.createElement('article');
      card.className = `shop-card ${isWarpPass ? 'shop-card-special' : ''}`;
      card.innerHTML = `
        ${isWarpPass ? '<span class="shop-limit-badge">LIMIT 1 / ACCOUNT</span>' : ''}
        <div class="shop-icon">${item.icon}</div>
        <h3>${item.name}</h3>
        <p class="muted-text" style="flex:1">${item.desc}</p>
        <div class="shop-owned">${ownedText}</div>
        <button class="btn btn-neon btn-sm" ${!canBuy ? 'disabled' : ''}>${btnLabel}</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (state.coins < item.price) return;
        if (isWarpPass && state.warpPassPurchased) {
          SoundFX.wrong();
          showToast('🔒 คุณใช้สิทธิ์ซื้อ Dimensional Zone Warp Pass ครบ 1 ครั้งแล้ว!');
          return;
        }
        state.coins -= item.price;
        if (item.id === 'boost') {
          state.xpBoostActive = true;
          SoundFX.coin();
          showToast(`🛒 ซื้อ ${item.icon} ${item.name} สำเร็จ!`);
        } else if (isWarpPass) {
          state.warpPassPurchased = true;
          state.inventory.warp_pass = 1;
          SoundFX.levelUp();
          showToast('🌀 ซื้อ Dimensional Zone Warp Pass สำเร็จ! ไปที่แผนที่โลกแล้วคลิกโซนที่ล็อกเพื่อปลดล็อกข้ามโซนได้เลย!');
        } else {
          state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
          SoundFX.coin();
          showToast(`🛒 ซื้อ ${item.icon} ${item.name} สำเร็จ!`);
        }
        saveState();
        renderHud();
        renderShop();
      });
      grid.appendChild(card);
    });
  }

  /* ==================== SCREEN 7: INTERACTIVE CODEX LIBRARY & STATS ==================== */
  let activeCodexIdx = null;
  let codexContFilter = 0; // 0 = all, 1..5 = continent

  function renderCodexFilterBar() {
    const bar = $('codexContinentFilter');
    if (!bar) return;
    const filters = [
      { id: 0, label: `📚 ทั้งหมด (${CODEX_VOLUMES.length} เล่ม)` },
      { id: 1, label: '🖥️ ทวีป 1: Core (Z01–10)' },
      { id: 2, label: '🐧 ทวีป 2: Linuxia (Z11–20)' },
      { id: 3, label: '🪟 ทวีป 3: WinServer (Z21–30)' },
      { id: 4, label: '☁️ ทวีป 4: NetCloud (Z31–40)' },
      { id: 5, label: '🔥 ทวีป 5: Apex (Z41–50)' }
    ];
    bar.innerHTML = '';
    filters.forEach((f) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-xs ${codexContFilter === f.id ? 'btn-neon' : 'btn-ghost'}`;
      btn.textContent = f.label;
      btn.addEventListener('click', () => {
        SoundFX.click();
        codexContFilter = f.id;
        renderCodexBookshelf();
      });
      bar.appendChild(btn);
    });
  }

  function renderCodexBookshelf() {
    renderCodexFilterBar();
    const readList = state.readChapters || [];
    $('codexReadChip').textContent = `อ่านแล้ว ${readList.length} / ${CODEX_VOLUMES.length} เล่ม`;

    const q = ($('codexSearchInput').value || '').trim().toLowerCase();
    const grid = $('codexChapters');
    grid.innerHTML = '';

    const filtered = CODEX_VOLUMES.map((vol, idx) => ({ vol, idx })).filter(({ vol }) => {
      if (codexContFilter > 0 && (vol.continent || 1) !== codexContFilter) return false;
      if (!q) return true;
      return vol.title.toLowerCase().includes(q) ||
        vol.subtitle.toLowerCase().includes(q) ||
        vol.vol.toLowerCase().includes(q) ||
        (vol.zoneRange || '').toLowerCase().includes(q);
    });

    if (!filtered.length) {
      grid.innerHTML = '<div class="panel" style="grid-column:1/-1;text-align:center;color:var(--text-muted);">ไม่พบบทเรียนที่ตรงกับคำค้นหา</div>';
      return;
    }

    filtered.forEach(({ vol, idx }) => {
      const isRead = readList.includes(vol.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `book-card ${isRead ? 'is-read' : ''}`;
      card.style.setProperty('--book-color', vol.color);
      card.innerHTML = `
        <div class="book-top">
          <span class="book-vol-tag">${vol.vol} • ⏱️ ${vol.readTime}</span>
          <span class="book-icon">${vol.icon}</span>
        </div>
        ${vol.zoneRange ? `<div class="book-zone-pill">🗺️ สำหรับพิชิต: ${vol.zoneRange}</div>` : ''}
        <div class="book-title">${vol.title}</div>
        <div class="book-sub">${vol.subtitle}</div>
        <div class="book-foot">
          <span>${isRead ? '✅ อ่านเข้าใจแล้ว' : '📘 ยังไม่ได้อ่าน (+25 XP)'}</span>
          <span class="book-cta">เปิดอ่านตำรา →</span>
        </div>
      `;
      card.addEventListener('click', () => {
        SoundFX.click();
        openCodexChapter(idx);
      });
      grid.appendChild(card);
    });
  }

  function openCodexChapter(idx) {
    activeCodexIdx = idx;
    const vol = CODEX_VOLUMES[idx];
    if (!vol) return;

    $('codexLibraryView').classList.add('hidden');
    $('codexReaderView').classList.remove('hidden');

    const isRead = (state.readChapters || []).includes(vol.id);
    const sectionsHtml = vol.sections.map((sec) => {
      let body = '';
      if (sec.bullets) {
        body += `<ul>${sec.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
      }
      if (sec.table) {
        body += `
          <div class="codex-table-wrap">
            <table class="codex-table">
              <thead><tr>${sec.table.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${sec.table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        `;
      }
      return `<section class="reader-section"><h3>${sec.heading}</h3>${body}</section>`;
    }).join('');

    $('codexReaderBody').innerHTML = `
      <div class="reader-hero">
        <div class="reader-hero-top">
          <span class="book-vol-tag" style="--book-color:${vol.color}">${vol.icon} ${vol.vol}</span>
          ${vol.zoneRange ? `<span class="stage-chip">🗺️ ${vol.zoneRange}</span>` : ''}
          <span class="stage-chip">⏱️ เวลาอ่านประมาณ ${vol.readTime}</span>
          ${isRead ? '<span class="role-badge">✅ อ่านเข้าใจแล้ว</span>' : ''}
        </div>
        <h2>${vol.title}</h2>
        <p class="muted-text">${vol.subtitle}</p>
        ${vol.zoneRange ? `<div style="margin-top:0.7rem;"><button type="button" class="btn btn-secondary btn-sm" id="codexGoZoneBtn">⚔️ ไปพิชิต ${vol.zoneRange} บนแผนที่โลก →</button></div>` : ''}
      </div>

      <div class="reader-objectives">
        <h4>🎯 เป้าหมายการเรียนรู้ประจำบทนี้</h4>
        <ul>${vol.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
      </div>

      <div class="diagram-stage">
        ${vol.diagramSvg}
        <div class="diagram-caption">🖼️ แผนภาพประกอบ ${vol.vol}: ${vol.title}</div>
      </div>

      ${sectionsHtml}

      <div class="analogy-box">${vol.analogy}</div>

      <section class="reader-section">
        <h3>💻 ตัวอย่างคำสั่งจริงที่ใช้หน้างาน (Cheat Sheet)</h3>
        <pre class="code-snippet">${vol.cheatSheet}</pre>
      </section>

      <div class="exam-tip-box">
        <h4>⚠️ ข้อควรระวัง &amp; จุดที่มักออกสอบ</h4>
        <ul>${vol.examTips.map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>
    `;

    $('codexGoZoneBtn')?.addEventListener('click', () => {
      activeCodexIdx = null;
      activeContinentId = vol.continent || 1;
      activeRoZoneId = null;
      switchScreen('map');
    });

    $('codexPrevBtn').disabled = idx <= 0;
    const isLast = idx >= CODEX_VOLUMES.length - 1;
    $('codexNextBtn').disabled = isLast;
    $('codexNextBottomBtn').disabled = isLast;

    const markBtn = $('codexMarkReadBtn');
    if (isRead) {
      markBtn.textContent = '✅ อ่านบทนี้เรียบร้อยแล้ว';
      markBtn.disabled = true;
    } else {
      markBtn.textContent = '✅ ทำเครื่องหมายว่าอ่านเข้าใจแล้ว (+25 XP, 💰20)';
      markBtn.disabled = false;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeCodexReader() {
    SoundFX.click();
    activeCodexIdx = null;
    $('codexReaderView').classList.add('hidden');
    $('codexLibraryView').classList.remove('hidden');
    renderCodexAndStats();
  }

  function renderCodexAndStats() {
    if (activeCodexIdx !== null) {
      openCodexChapter(activeCodexIdx);
      return;
    }
    $('codexReaderView').classList.add('hidden');
    $('codexLibraryView').classList.remove('hidden');
    renderCodexBookshelf();

    const analyticsEl = $('analyticsContainer');
    analyticsEl.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([key, label]) => {
      const st = state.analytics[key] || { correct: 0, total: 0 };
      const pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="analytics-row-head">
          <span>${label}</span>
          <strong>${st.total === 0 ? 'ยังไม่เริ่ม' : `${pct}% (${st.correct}/${st.total})`}</strong>
        </div>
        <div class="hud-xp-bar" style="height:8px;"><div class="hud-xp-fill" style="width:${pct}%"></div></div>
      `;
      analyticsEl.appendChild(row);
    });
  }

  /* ==================== SCREEN 7B: ACHIEVEMENT BADGES ==================== */
  function renderBadgesScreen() {
    const elig = getExamEligibility();
    const unlockedTotal = state.unlockedBadges.length;
    const pct = BADGES.length > 0 ? Math.round((unlockedTotal / BADGES.length) * 100) : 0;

    $('badgeCountChip').textContent = `${unlockedTotal} / ${BADGES.length}`;
    $('badgesProgressBar').style.width = `${pct}%`;

    const readyEl = $('badgesExamReadyText');
    const streakSummary = ` • 🔥 ตอบถูกติดกันสูงสุด ${state.bestCorrectStreak || 0} ข้อ (ปัจจุบัน ${state.currentCorrectStreak || 0})`;
    if (elig.eligible) {
      readyEl.textContent = `✅ ปลดล็อกสิทธิ์สอบรับรองแล้ว! (ครบ ${elig.total}/${elig.total} เหรียญตราบังคับ • สะสมรวม ${unlockedTotal}/${BADGES.length} เหรียญ${streakSummary})`;
      readyEl.style.color = 'var(--accent)';
    } else {
      readyEl.textContent = `🔒 สะสมแล้ว ${elig.unlockedCount}/${elig.total} เหรียญบังคับ — ขาดอีก ${elig.missing.length} เหรียญจึงจะปลดล็อกสิทธิ์เข้าสอบรับรอง${streakSummary}`;
      readyEl.style.color = 'var(--gold)';
    }

    const badgesEl = $('badgesContainer');
    badgesEl.innerHTML = '';
    BADGES.forEach((b) => {
      const unlocked = state.unlockedBadges.includes(b.id);
      const targetScreen = b.id === 'certified' ? 'exam' : (BADGE_SCREEN_MAP[b.id] || 'map');
      const card = document.createElement('div');
      card.className = `badge-item badge-card-full badge-card ${b.special ? 'special-badge' : ''} ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="badge-status-pill ${unlocked ? 'ok' : ''}">${unlocked ? (b.special ? '✨ เหรียญพิเศษ • ปลดล็อกแล้ว' : '✅ ปลดล็อกแล้ว') : (b.special ? '🌟 เหรียญพิเศษ' : '🔒 ยังไม่ปลดล็อก')}</div>
        <div class="badge-emoji">${b.emoji}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
        ${!unlocked ? `<button type="button" class="btn btn-ghost btn-xs badge-action-btn">ไปทำภารกิจ →</button>` : ''}
      `;
      if (!unlocked) {
        card.querySelector('.badge-action-btn')?.addEventListener('click', () => switchScreen(targetScreen));
      }
      badgesEl.appendChild(card);
    });
  }

  $('badgesGoExamBtn')?.addEventListener('click', () => switchScreen('exam'));

  $('codexSearchInput').addEventListener('input', renderCodexBookshelf);
  $('codexBackBtn').addEventListener('click', closeCodexReader);
  $('codexPrevBtn').addEventListener('click', () => {
    if (activeCodexIdx > 0) { SoundFX.click(); openCodexChapter(activeCodexIdx - 1); }
  });
  $('codexNextBtn').addEventListener('click', () => {
    if (activeCodexIdx < CODEX_VOLUMES.length - 1) { SoundFX.click(); openCodexChapter(activeCodexIdx + 1); }
  });
  $('codexNextBottomBtn').addEventListener('click', () => {
    if (activeCodexIdx < CODEX_VOLUMES.length - 1) { SoundFX.click(); openCodexChapter(activeCodexIdx + 1); }
  });
  $('codexMarkReadBtn').addEventListener('click', () => {
    if (activeCodexIdx === null) return;
    const vol = CODEX_VOLUMES[activeCodexIdx];
    if (!state.readChapters) state.readChapters = [];
    if (!state.readChapters.includes(vol.id)) {
      state.readChapters.push(vol.id);
      grantRewards(25, 20);
      SoundFX.coin();
      showToast(`📖 บันทึกว่าอ่าน "${vol.vol}" เข้าใจแล้ว! (+25 XP, +💰20)`);
      openCodexChapter(activeCodexIdx);
    }
  });

  /* ==================== SCREEN 8: GUILD CERTIFICATION EXAM ==================== */
  const EXAM_QUESTION_COUNT = 30;
  const EXAM_REQUIRED_BADGES = BADGES.filter((b) => b.id !== 'certified' && !b.special);
  const BADGE_SCREEN_MAP = {
    first_blood: 'map',
    zone1_clear: 'map',
    zone2_clear: 'map',
    zone3_clear: 'map',
    zone4_clear: 'map',
    zone5_clear: 'map',
    final_boss: 'map',
    zone7_clear: 'map',
    zone8_clear: 'map',
    zone9_clear: 'map',
    zone10_clear: 'map',
    cli_hero: 'cli',
    cli_god: 'cli',
    port_defender: 'defense',
    blitz_flash: 'defense',
    firewall_ace: 'puzzles',
    subnet_guru: 'puzzles',
    puzzle_master: 'puzzles',
    vbox_master: 'vbox',
    codex_scholar: 'codex',
    teacher_star: 'leaderboard',
    perfectionist: 'map',
    boss_hunter: 'map'
  };

  let examQs = [];
  let examIdx = 0;
  let examAns = [];
  let examPick = null;

  function getExamEligibility() {
    checkBadges();
    const total = EXAM_REQUIRED_BADGES.length;
    const missing = EXAM_REQUIRED_BADGES.filter((b) => !state.unlockedBadges.includes(b.id));
    const unlockedCount = total - missing.length;
    return {
      total,
      unlockedCount,
      missing,
      eligible: missing.length === 0
    };
  }

  function renderExamGate() {
    const elig = getExamEligibility();
    const pct = elig.total > 0 ? Math.round((elig.unlockedCount / elig.total) * 100) : 0;

    $('examGateCountChip').textContent = `🏆 เหรียญตรา ${elig.unlockedCount} / ${elig.total}`;
    $('examGateProgressBar').style.width = `${pct}%`;

    const gateBox = $('examBadgeGate');
    gateBox.classList.toggle('locked', !elig.eligible);
    gateBox.classList.toggle('unlocked', elig.eligible);

    const startBtn = $('startExamBtn');
    if (elig.eligible) {
      $('examGateEmoji').textContent = '🎓⚔️';
      $('examGateStatus').textContent = '✅ ปลดล็อกสิทธิ์สอบรับรองแล้ว! คุณผ่านเหรียญตราความสำเร็จครบทุกเหรียญ';
      $('examGateRemain').textContent = `ครบ ${elig.total}/${elig.total} เหรียญ ✓`;
      startBtn.disabled = false;
      startBtn.textContent = `▶ เริ่มทำแบบทดสอบ (${EXAM_QUESTION_COUNT} ข้อ)`;
    } else {
      $('examGateEmoji').textContent = '🔒🎓';
      $('examGateStatus').textContent = '🔒 ยังไม่มีสิทธิ์ทำข้อสอบ — ต้องผ่านทุกเหรียญตราความสำเร็จก่อน';
      $('examGateRemain').textContent = `ขาดอีก ${elig.missing.length} เหรียญ`;
      startBtn.disabled = true;
      startBtn.textContent = `🔒 ล็อกอยู่ — ต้องปลดล็อกเหรียญตราให้ครบก่อน (${elig.unlockedCount}/${elig.total})`;
    }

    const grid = $('examGateBadgesGrid');
    grid.innerHTML = '';
    EXAM_REQUIRED_BADGES.forEach((b) => {
      const done = state.unlockedBadges.includes(b.id);
      const targetScreen = BADGE_SCREEN_MAP[b.id] || 'map';
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `exam-gate-badge ${done ? 'done' : 'missing'}`;
      el.innerHTML = `
        <span class="egb-ic">${done ? '✅' : '🔒'} ${b.emoji}</span>
        <span class="egb-body">
          <strong>${b.name}</strong>
          <small>${b.desc}</small>
        </span>
        ${done ? '' : '<span class="egb-go">ไปทำ →</span>'}
      `;
      if (!done) {
        el.title = `คลิกเพื่อไปทำภารกิจ: ${b.desc}`;
        el.addEventListener('click', () => switchScreen(targetScreen));
      } else {
        el.disabled = true;
      }
      grid.appendChild(el);
    });
  }

  function startExam() {
    const elig = getExamEligibility();
    if (!elig.eligible) {
      SoundFX.wrong();
      renderExamGate();
      showToast(`🔒 ยังไม่มีสิทธิ์ทำข้อสอบ! ต้องผ่านเหรียญตราความสำเร็จให้ครบทั้ง ${elig.total} เหรียญก่อน (ขาดอีก ${elig.missing.length} เหรียญ)`);
      return;
    }

    SoundFX.bossAlert();
    examQs = shuffle(EXAM_BANK).slice(0, EXAM_QUESTION_COUNT).map(randomizeQuestionChoices);
    examIdx = 0;
    examAns = [];
    examPick = null;

    $('examIntro').classList.add('hidden');
    $('examResult').classList.add('hidden');
    $('examRunner').classList.remove('hidden');
    renderExamQ();
  }

  function renderExamQ() {
    examPick = null;
    $('examNextBtn').disabled = true;
    const q = examQs[examIdx];
    $('examCategory').textContent = CATEGORIES[q.category];
    $('examProgressText').textContent = `ข้อที่ ${examIdx + 1} / ${examQs.length}`;
    $('examProgressBar').style.width = `${((examIdx + 1) / examQs.length) * 100}%`;
    $('examQuestionText').textContent = `${examIdx + 1}. ${q.q}`;
    $('examNextBtn').textContent = examIdx === examQs.length - 1 ? 'ส่งข้อสอบ ✓' : 'ข้อถัดไป →';

    const opts = $('examOptions');
    opts.innerHTML = '';
    const keys = ['ก', 'ข', 'ค', 'ง'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="opt-key">${keys[i]}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => {
        SoundFX.click();
        examPick = i;
        opts.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        $('examNextBtn').disabled = false;
      });
      opts.appendChild(btn);
    });
  }

  function finishExam() {
    $('examRunner').classList.add('hidden');
    $('examResult').classList.remove('hidden');

    let score = 0;
    const rev = $('examReviewList');
    rev.innerHTML = '';

    examQs.forEach((q, idx) => {
      const ok = examAns[idx] === q.answer;
      recordAnalytics(q.category, ok);
      if (ok) score += 1;
      const item = document.createElement('div');
      item.className = `review-item ${ok ? 'ok' : 'err'}`;
      item.innerHTML = `
        <div><strong>${ok ? '✅' : '❌'} ข้อ ${idx + 1}:</strong> ${q.q}</div>
        <div class="muted-text" style="margin-top:0.2rem;">คำตอบที่ถูก: <strong>${q.options[q.answer]}</strong> — ${q.explain}</div>
      `;
      rev.appendChild(item);
    });

    const pct = Math.round((score / examQs.length) * 100);
    const passed = pct >= 70;
    $('examScoreCircle').textContent = `${score}/${examQs.length}`;
    $('examScoreCircle').style.borderColor = passed ? 'var(--accent)' : 'var(--danger)';
    $('examScoreCircle').style.color = passed ? 'var(--accent)' : 'var(--danger)';

    if (score > state.examBestScore) state.examBestScore = score;
    if (passed) {
      const firstExamPass = !state.examPassed;
      state.examPassed = true;
      if (firstExamPass) {
        grantRewards(300, 150);
      } else {
        saveState();
      }
      SoundFX.levelUp();
      $('examResultHeading').textContent = '🎉 ยินดีด้วย! คุณสอบผ่านรับเกียรติบัตร Certified SysAdmin';
      $('examResultSub').textContent = firstExamPass
        ? `คะแนน ${score}/${examQs.length} (${pct}%) • รับรางวัลสอบผ่านครั้งแรก +300 XP และ +💰150`
        : `คะแนน ${score}/${examQs.length} (${pct}%) • ทบทวนสำเร็จ (เคยรับรางวัลสอบผ่านไปแล้ว)`;
      $('printCertBtn').classList.remove('hidden');
      $('certificateCard').classList.remove('hidden');

      const sName = $('studentNameInput').value.trim() || state.playerName;
      const sId = $('studentIdInput').value.trim();
      $('certStudentName').textContent = sName;
      $('certStudentId').textContent = sId ? `รหัสนักศึกษา / ห้องเรียน: ${sId}` : '';
      $('certScore').textContent = `${score}/${examQs.length} (${pct}%)`;
      $('certRank').textContent = getRankInfo(state.xp).title;
      $('certDate').textContent = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      saveState();
      SoundFX.wrong();
      $('examResultHeading').textContent = 'ยังไม่ผ่านเกณฑ์ 70%';
      $('examResultSub').textContent = `คะแนน ${score}/${examQs.length} (${pct}%) — ทบทวนในคัมภีร์แล้วมาท้าสอบใหม่ได้เลย!`;
      $('printCertBtn').classList.add('hidden');
      $('certificateCard').classList.add('hidden');
    }
    renderHud();
  }

  $('startExamBtn').addEventListener('click', startExam);
  $('examNextBtn').addEventListener('click', () => {
    examAns.push(examPick);
    if (examIdx < examQs.length - 1) {
      examIdx += 1;
      renderExamQ();
    } else {
      finishExam();
    }
  });
  $('retakeExamBtn').addEventListener('click', () => {
    SoundFX.click();
    $('examResult').classList.add('hidden');
    $('examIntro').classList.remove('hidden');
    renderExamGate();
  });
  $('printCertBtn').addEventListener('click', () => window.print());

  /* ==================== SCREEN 9: LEADERBOARD ==================== */
  function getAccountMetrics(acc) {
    const g = acc.gameData || {};
    const stars = Math.max(
      Object.values(g.stageStars || {}).reduce((s, x) => s + x, 0),
      g.importedStars || 0
    );
    const labs = Math.max((g.completedLabs || []).length, g.importedLabs || 0);
    const vboxList = Array.isArray(g.installedVms) ? g.installedVms : [];
    const effectiveXp = acc.role === 'teacher' ? 9999 : (g.xp || 0);
    return {
      xp: effectiveXp,
      stars,
      labs,
      vbox: vboxList.length,
      vboxList,
      defense: g.defenseHighScore || 0,
      exam: g.examBestScore || 0,
      passed: Boolean(g.examPassed),
      avatar: g.avatar || '👨‍💻',
      rank: getRankInfo(effectiveXp)
    };
  }

  function renderLeaderboard() {
    const accounts = AuthSystem.getAllAccountsList()
      .filter((acc) => acc.role !== 'teacher' && (acc.classroom || '').trim() !== 'ผู้ดูแลรายวิชา')
      .map((acc) => ({ acc, m: getAccountMetrics(acc) }))
      .sort((a, b) => {
        if (lbSortBy === 'stars') return b.m.stars - a.m.stars || b.m.xp - a.m.xp;
        if (lbSortBy === 'defense') return b.m.defense - a.m.defense || b.m.xp - a.m.xp;
        if (lbSortBy === 'exam') return b.m.exam - a.m.exam || b.m.xp - a.m.xp;
        return b.m.xp - a.m.xp || b.m.stars - a.m.stars;
      });

    $('lbSyncCloudBtn').classList.toggle('hidden', !AuthSystem.getCloudUrl());

    const maxStars = ALL_STAGES_FLAT.length * 3;
    const maxLabs = CLI_LABS.length;
    const maxVbox = (typeof VBoxSim !== 'undefined' && Array.isArray(VBoxSim.OS_MISSIONS))
      ? VBoxSim.OS_MISSIONS.length
      : 5;

    // Top 3 Podium
    const podium = $('lbPodium');
    podium.innerHTML = '';
    const medals = ['🥇 อันดับ 1', '🥈 อันดับ 2', '🥉 อันดับ 3'];
    const frameOrnaments = ['👑', '✦', '❖'];
    accounts.slice(0, 3).forEach((entry, idx) => {
      const rankNum = idx + 1;
      const metricStr = lbSortBy === 'stars' ? `⭐ ${entry.m.stars}/${maxStars}`
        : lbSortBy === 'defense' ? `🛡️ ${entry.m.defense.toLocaleString()}`
        : lbSortBy === 'exam' ? `🎓 ${entry.m.exam}/${EXAM_QUESTION_COUNT}`
        : `⚡ ${entry.m.xp.toLocaleString()} XP`;
      const card = document.createElement('div');
      card.className = `podium-card rank-${rankNum}`;
      card.innerHTML = `
        <div class="podium-medal">${medals[idx]}</div>
        <div class="podium-avatar">
          <div class="podium-avatar-frame frame-rank-${rankNum}">
            <span class="podium-frame-ring"></span>
            <span class="podium-frame-orbit"></span>
            <span class="podium-frame-ornament">${frameOrnaments[idx]}</span>
            <div class="podium-avatar-inner">${avatarHtml(entry.m.avatar, 'podium')}</div>
            <span class="podium-frame-badge">#${rankNum}</span>
          </div>
        </div>
        <strong>${entry.acc.fullName}</strong>
        <span class="muted-text" style="font-size:0.76rem;">@${entry.acc.username} • ${entry.acc.classroom || '-'}</span>
        <div class="podium-score">${metricStr}</div>
        <span class="stage-chip">LV.${entry.m.rank.level} ${entry.m.rank.title}</span>
      `;
      podium.appendChild(card);
    });

    // Table Body
    const tbody = $('lbTableBody');
    tbody.innerHTML = '';
    accounts.forEach((entry, idx) => {
      const isMe = currentAccount && entry.acc.username === currentAccount.username;
      const tr = document.createElement('tr');
      if (isMe) tr.className = 'me-row';
      const rowTierCls = getAvatarTierClass(entry.m.rank.level, entry.acc.role);
      tr.innerHTML = `
        <td><strong>#${idx + 1}</strong></td>
        <td>${avatarHtml(entry.m.avatar, 'xs', rowTierCls)} <strong>${entry.acc.fullName}</strong> ${isMe ? '<span class="stage-chip">คุณ</span>' : ''}</td>
        <td>${entry.acc.classroom || '-'}</td>
        <td><strong>${entry.m.xp.toLocaleString()} XP</strong> <span class="muted-text">(LV.${entry.m.rank.level})</span></td>
        <td>⭐ ${entry.m.stars}/${maxStars}</td>
        <td>💻 ${entry.m.labs}/${maxLabs}</td>
        <td>${entry.m.defense.toLocaleString()}</td>
        <td>${entry.m.exam}/${EXAM_QUESTION_COUNT} ${entry.m.passed ? '✅' : ''}</td>
      `;
      tbody.appendChild(tr);
    });

    // Student score code
    if (currentAccount) {
      $('myScoreCodeOutput').value = AuthSystem.encodeScoreReport(currentAccount);
    }
  }

  document.querySelectorAll('.lb-sort').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      lbSortBy = btn.dataset.sort;
      document.querySelectorAll('.lb-sort').forEach((b) => {
        b.className = `btn btn-sm lb-sort ${b.dataset.sort === lbSortBy ? 'btn-neon active' : 'btn-ghost'}`;
      });
      renderLeaderboard();
    });
  });

  $('copyScoreCodeBtn').addEventListener('click', () => {
    const txt = $('myScoreCodeOutput').value;
    if (!txt) return;
    navigator.clipboard?.writeText(txt).then(
      () => { SoundFX.coin(); showToast('📋 คัดลอกรหัสคะแนนส่งงานแล้ว! ส่งให้ครูทางแชทได้เลย'); },
      () => { $('myScoreCodeOutput').select(); document.execCommand('copy'); showToast('📋 คัดลอกรหัสคะแนนแล้ว'); }
    );
  });

  $('lbSyncCloudBtn').addEventListener('click', async () => {
    SoundFX.click();
    const res = await AuthSystem.pullAllFromCloud();
    if (res.ok) {
      showToast(`☁️ ซิงค์ข้อมูลล่าสุดสำเร็จ (${res.count} บัญชี)`);
      renderLeaderboard();
    } else {
      showToast(`⚠️ ${res.error}`);
    }
  });

  /* ==================== SCREEN 10: TEACHER DASHBOARD ==================== */
  function renderTeacherDashboard() {
    const allStudents = AuthSystem.getAllAccountsList()
      .filter((a) => a.role === 'student')
      .map((acc) => ({ acc, m: getAccountMetrics(acc) }))
      .sort((a, b) => b.m.xp - a.m.xp);

    // KPIs
    const count = allStudents.length;
    const avgXp = count ? Math.round(allStudents.reduce((s, x) => s + x.m.xp, 0) / count) : 0;
    const avgStars = count ? (allStudents.reduce((s, x) => s + x.m.stars, 0) / count).toFixed(1) : '0.0';
    const passedCert = allStudents.filter((x) => x.m.passed).length;

    const maxStars = ALL_STAGES_FLAT.length * 3;
    const maxLabs = CLI_LABS.length;
    const maxVbox = (typeof VBoxSim !== 'undefined' && Array.isArray(VBoxSim.OS_MISSIONS))
      ? VBoxSim.OS_MISSIONS.length
      : 5;

    $('teacherKpis').innerHTML = `
      <div class="kpi-card"><span>นักศึกษาทั้งหมด</span><strong>${count} คน</strong></div>
      <div class="kpi-card"><span>ค่าเฉลี่ย XP</span><strong>${avgXp.toLocaleString()} XP</strong></div>
      <div class="kpi-card"><span>ค่าเฉลี่ยดาวแคมเปญ</span><strong>⭐ ${avgStars} / ${maxStars}</strong></div>
      <div class="kpi-card"><span>สอบผ่านรับเกียรติบัตร</span><strong>🎓 ${passedCert} / ${count}</strong></div>
    `;

    const lockSummaryEl = $('teacherMapLockSummary');
    if (lockSummaryEl) {
      lockSummaryEl.textContent = getMapLockModeLongLabel(getMapLockConfig());
    }

    // Populate classroom dropdown
    const filterSel = $('teacherClassFilter');
    const prevSelected = filterSel.value;
    const classes = [...new Set(allStudents.map((x) => x.acc.classroom || '-'))].sort();
    filterSel.innerHTML = '<option value="">ทุกห้องเรียน</option>' +
      classes.map((c) => `<option value="${c}">${c}</option>`).join('');
    if (classes.includes(prevSelected)) filterSel.value = prevSelected;

    // Filter rows
    const q = ($('teacherSearchInput').value || '').trim().toLowerCase();
    const cls = filterSel.value;
    const filtered = allStudents.filter(({ acc }) => {
      const matchClass = !cls || (acc.classroom || '-') === cls;
      const matchQuery = !q || acc.username.toLowerCase().includes(q) || acc.fullName.toLowerCase().includes(q);
      return matchClass && matchQuery;
    });

    // Populate Award Bonus XP student dropdown
    const grantSel = $('teacherGrantStudentSelect');
    if (grantSel) {
      const prevGrantVal = grantSel.value;
      const classOpt = cls
        ? `<option value="__class__">👥 ทั้งห้อง ${cls} (${filtered.length} คน)</option>`
        : `<option value="__all__">👥 นักศึกษาทุกคน (${allStudents.length} คน)</option>`;
      grantSel.innerHTML = `<option value="">-- เลือกนักศึกษาที่ตอบคำถามได้ --</option>${classOpt}` +
        filtered.map(({ acc, m }) =>
          `<option value="${acc.username}">${acc.fullName} (@${acc.username} • ${acc.classroom || '-'} • ${m.xp} XP)</option>`
        ).join('');
      if ([...grantSel.options].some((o) => o.value === prevGrantVal)) grantSel.value = prevGrantVal;
    }

    const tbody = $('teacherTableBody');
    tbody.innerHTML = '';
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--text-muted);padding:1.5rem;">ไม่พบข้อมูลนักศึกษาตามเงื่อนไข</td></tr>';
    } else {
      filtered.forEach(({ acc, m }) => {
        const vboxNames = (m.vboxList || []).map((id) => {
          const found = typeof VBoxSim !== 'undefined' && VBoxSim.OS_MISSIONS
            ? VBoxSim.OS_MISSIONS.find((x) => x.id === id)
            : null;
          return found ? found.shortName : id;
        });
        const vboxTitle = vboxNames.length ? `ติดตั้งแล้ว: ${vboxNames.join(', ')}` : 'ยังไม่ได้ติดตั้ง VM ใน VirtualBox';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${acc.username}</code></td>
          <td>${avatarHtml(m.avatar, 'xs')} <strong>${acc.fullName}</strong></td>
          <td>${acc.classroom || '-'}</td>
          <td><strong>${m.xp.toLocaleString()}</strong></td>
          <td>⭐ ${m.stars}/${maxStars}</td>
          <td>💻 ${m.labs}/${maxLabs}</td>
          <td title="${vboxTitle}">💿 ${m.vbox}/${maxVbox}</td>
          <td>${m.defense.toLocaleString()}</td>
          <td>${m.exam}/${EXAM_QUESTION_COUNT}</td>
          <td>${m.passed ? '<span class="role-badge">ผ่าน ✓</span>' : '<span class="muted-text">ยังไม่ผ่าน</span>'}</td>
          <td>
            <button class="btn btn-neon btn-xs t-add-xp" data-u="${acc.username}" data-name="${acc.fullName}" title="เพิ่ม XP ให้นักศึกษาเมื่อตอบคำถามได้">➕ เพิ่ม XP</button>
            <button class="btn btn-ghost btn-xs t-reset-xp" data-u="${acc.username}" title="รีเซ็ตค่า XP กลับเป็น 0">⚡ รีเซ็ต XP</button>
            <button class="btn btn-ghost btn-xs t-reset-map" data-u="${acc.username}" title="รีเซ็ตการตะลุยแผนที่กลับไปเริ่ม Zone 1">🔄 รีเซ็ตแผนที่</button>
            <button class="btn btn-ghost btn-xs t-reset-pw" data-u="${acc.username}" title="รีเซ็ตรหัสผ่านเป็น 123456">🔑 รีเซ็ตรหัส</button>
            <button class="btn btn-ghost btn-xs t-del-u" data-u="${acc.username}" title="ลบบัญชีนี้">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.t-add-xp').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const u = btn.dataset.u;
          const fullName = btn.dataset.name || u;
          const raw = prompt(`✨ มอบโบนัส XP ให้ "${fullName}" (@${u}) เมื่อตอบคำถามได้:\nกรอกจำนวน XP ที่ต้องการเพิ่ม`, '50');
          if (raw === null) return;
          const amount = Math.round(Number(raw));
          if (!amount || amount <= 0) {
            SoundFX.wrong();
            showToast('⚠️ กรุณากรอกจำนวน XP เป็นตัวเลขมากกว่า 0');
            return;
          }
          const res = await AuthSystem.grantStudentXp(u, amount, 'ตอบคำถามในห้องเรียนได้');
          if (res.ok) {
            SoundFX.levelUp();
            renderTeacherDashboard();
            showToast(`✨ มอบ +${amount} XP ให้ ${fullName} สำเร็จ! (รวม ${res.newXp.toLocaleString()} XP)`);
          }
        });
      });

      tbody.querySelectorAll('.t-reset-xp').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const u = btn.dataset.u;
          if (confirm(`⚡ รีเซ็ตค่า XP ของ "${u}" กลับเป็น 0 XP ใช่หรือไม่?`)) {
            const res = await AuthSystem.resetStudentXp(u);
            if (res.ok) {
              SoundFX.levelUp();
              renderTeacherDashboard();
              showToast(`⚡ รีเซ็ตค่า XP ของ ${u} เป็น 0 เรียบร้อยแล้ว`);
            }
          }
        });
      });

      tbody.querySelectorAll('.t-reset-map').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const u = btn.dataset.u;
          if (confirm(`🔄 รีเซ็ตการตะลุยแผนที่ของ "${u}" กลับไปเริ่มต้นที่ Zone 1 ใช่หรือไม่?\n(ล้างดาวแคมเปญและโซนที่ผ่านแล้ว แต่ยังคงคะแนนสอบและ CLI Lab ไว้)`)) {
            const res = await AuthSystem.resetStudentMapProgress(u);
            if (res.ok) {
              SoundFX.levelUp();
              renderTeacherDashboard();
              showToast(`🔄 รีเซ็ตการตะลุยแผนที่ของ ${u} กลับสู่ Zone 1 เรียบร้อยแล้ว`);
            }
          }
        });
      });

      tbody.querySelectorAll('.t-reset-pw').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const u = btn.dataset.u;
          if (confirm(`รีเซ็ตรหัสผ่านของ "${u}" เป็น 123456 ใช่หรือไม่?`)) {
            await AuthSystem.resetUserPassword(u, '123456');
            showToast(`🔑 รีเซ็ตรหัสผ่านของ ${u} เป็น 123456 แล้ว`);
          }
        });
      });

      tbody.querySelectorAll('.t-del-u').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const u = btn.dataset.u;
          if (confirm(`ต้องการลบบัญชีนักศึกษา "${u}" ออกจากระบบใช่หรือไม่?`)) {
            await AuthSystem.deleteAccount(u);
            showToast(`🗑️ ลบบัญชี ${u} เรียบร้อยแล้ว`);
            renderTeacherDashboard();
          }
        });
      });
    }

    // Cloud URL & Share Link display
    const savedUrl = AuthSystem.getCloudUrl();
    $('cloudUrlInput').value = savedUrl;
    $('cloudStatusText').textContent = savedUrl
      ? `สถานะ: 🟢 เชื่อมต่อ Cloud Sync แล้ว (${savedUrl})`
      : 'สถานะ: 🟡 ทำงานแบบ Local/Offline (ยังไม่ตั้งค่า Firebase URL)';

    const shareBox = $('shareLinkBox');
    if (savedUrl) {
      shareBox.classList.remove('hidden');
      $('shareLinkPreview').value = AuthSystem.buildClassroomShareUrl();
    } else {
      shareBox.classList.add('hidden');
    }
    updateCloudBadges();
  }

  $('teacherSearchInput').addEventListener('input', renderTeacherDashboard);
  $('teacherClassFilter').addEventListener('change', renderTeacherDashboard);
  $('teacherRefreshBtn').addEventListener('click', () => {
    SoundFX.click();
    renderTeacherDashboard();
    showToast('🔄 อัปเดตตารางคะแนนแล้ว');
  });

  $('teacherOpenMapLockBtn')?.addEventListener('click', () => {
    if (!isTeacherAccount()) return;
    SoundFX.click();
    activeRoZoneId = null;
    switchScreen('map');
    openZoneLockPanel(true);
  });

  $('teacherResetAllMapBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) return;
    const classroom = ($('teacherClassFilter')?.value || '').trim();
    const scopeLabel = classroom ? `ห้อง "${classroom}"` : 'ทุกคนทุกห้อง';
    const ok = confirm(
      `🔄 ยืนยันรีเซ็ตการตะลุยแผนที่ของนักศึกษา${scopeLabel} กลับไปเริ่มต้นที่ Zone 1 ใช่หรือไม่?\n(ล้างดาวแคมเปญ โซนที่ผ่านแล้ว และโซนวาร์ป — ยังคงคะแนนสอบและ CLI Lab ไว้)`
    );
    if (!ok) return;
    SoundFX.click();
    const btn = $('teacherResetAllMapBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังรีเซ็ต...';
    try {
      const res = await AuthSystem.resetStudentsMapProgress({ classroom, resetXpAndCoins: false });
      if (!res.ok) {
        SoundFX.wrong();
        showToast(`⚠️ ${res.error || 'ไม่พบรายชื่อนักศึกษา'}`);
        return;
      }
      SoundFX.levelUp();
      renderTeacherDashboard();
      showToast(
        AuthSystem.getCloudUrl()
          ? `🔄 รีเซ็ตแผนที่นักศึกษา${scopeLabel} กลับสู่ Zone 1 สำเร็จ ${res.count} คน (ซิงค์ Cloud ${res.synced} คน)!`
          : `🔄 รีเซ็ตแผนที่นักศึกษา${scopeLabel} กลับสู่ Zone 1 สำเร็จ ${res.count} คน!`
      );
    } finally {
      btn.disabled = false;
      btn.textContent = '🔄 รีเซ็ตการตะลุยแผนที่นักศึกษา';
    }
  });

  $('teacherResetAllXpBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) return;
    const classroom = ($('teacherClassFilter')?.value || '').trim();
    const scopeLabel = classroom ? `ห้อง "${classroom}"` : 'ทุกคนทุกห้อง';
    const ok = confirm(
      `⚡ ยืนยันรีเซ็ตค่า XP ของนักศึกษา${scopeLabel} กลับเป็น 0 XP ใช่หรือไม่?\n(ยังคงความก้าวหน้าแผนที่ คะแนนสอบ และ CLI Lab ไว้)`
    );
    if (!ok) return;
    SoundFX.click();
    const btn = $('teacherResetAllXpBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังรีเซ็ต XP...';
    try {
      const res = await AuthSystem.resetStudentsXp({ classroom });
      if (!res.ok) {
        SoundFX.wrong();
        showToast(`⚠️ ${res.error || 'ไม่พบรายชื่อนักศึกษา'}`);
        return;
      }
      SoundFX.levelUp();
      renderTeacherDashboard();
      showToast(
        AuthSystem.getCloudUrl()
          ? `⚡ รีเซ็ต XP นักศึกษา${scopeLabel} เป็น 0 สำเร็จ ${res.count} คน (ซิงค์ Cloud ${res.synced} คน)!`
          : `⚡ รีเซ็ต XP นักศึกษา${scopeLabel} เป็น 0 สำเร็จ ${res.count} คน!`
      );
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ รีเซ็ต XP นักศึกษา';
    }
  });

  document.querySelectorAll('.t-xp-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      const inp = $('teacherGrantXpAmount');
      if (inp) inp.value = btn.dataset.xp || '50';
    });
  });

  $('teacherGrantXpBtn')?.addEventListener('click', async () => {
    if (!isTeacherAccount()) return;
    const target = ($('teacherGrantStudentSelect')?.value || '').trim();
    const amount = Math.round(Number($('teacherGrantXpAmount')?.value || 0));
    const reason = ($('teacherGrantXpReason')?.value || '').trim() || 'ตอบคำถามในห้องเรียนได้';

    if (!target) {
      SoundFX.wrong();
      showToast('⚠️ กรุณาเลือกนักศึกษา (หรือทั้งห้อง) ที่ต้องการมอบ XP');
      return;
    }
    if (!amount || amount <= 0) {
      SoundFX.wrong();
      showToast('⚠️ กรุณาระบุจำนวน XP มากกว่า 0');
      return;
    }

    const btn = $('teacherGrantXpBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังมอบ XP...';
    try {
      if (target === '__all__' || target === '__class__') {
        const classroom = target === '__class__' ? ($('teacherClassFilter')?.value || '').trim() : '';
        const scopeLabel = classroom ? `ห้อง "${classroom}"` : 'ทุกคน';
        if (!confirm(`✨ ยืนยันมอบโบนัส +${amount} XP ให้นักศึกษา${scopeLabel} ใช่หรือไม่?\nเหตุผล: ${reason}`)) return;
        const res = await AuthSystem.grantStudentsXp({ classroom, amount, reason });
        if (!res.ok) {
          SoundFX.wrong();
          showToast(`⚠️ ${res.error || 'ไม่สามารถมอบ XP ได้'}`);
          return;
        }
        SoundFX.levelUp();
        renderTeacherDashboard();
        showToast(`✨ มอบ +${amount} XP ให้นักศึกษา${scopeLabel} สำเร็จ ${res.count} คน!`);
      } else {
        const res = await AuthSystem.grantStudentXp(target, amount, reason);
        if (!res.ok) {
          SoundFX.wrong();
          showToast(`⚠️ ${res.error || 'ไม่พบบัญชีนักศึกษา'}`);
          return;
        }
        SoundFX.levelUp();
        renderTeacherDashboard();
        showToast(`✨ มอบ +${amount} XP ให้ ${res.account.fullName} สำเร็จ! (รวม ${res.newXp.toLocaleString()} XP)`);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ มอบ XP ทันที';
    }
  });

  $('exportCsvBtn').addEventListener('click', () => {
    SoundFX.coin();
    const n = AuthSystem.exportScoresCsv();
    showToast(`📥 ดาวน์โหลดไฟล์ CSV คะแนนนักศึกษา ${n} คนเรียบร้อย!`);
  });

  $('teacherImportBtn').addEventListener('click', () => {
    const raw = $('teacherImportInput').value.trim();
    if (!raw) {
      showToast('⚠️ กรุณาวางรหัส SOPS2:... ก่อนกดนำเข้า');
      return;
    }
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let okCount = 0;
    let errMsg = '';
    lines.forEach((line) => {
      const res = AuthSystem.importScoreReport(line);
      if (res.ok) okCount += 1;
      else errMsg = res.error;
    });
    if (okCount > 0) {
      SoundFX.levelUp();
      $('teacherImportInput').value = '';
      renderTeacherDashboard();
      showToast(`✅ นำเข้าคะแนนนักศึกษาสำเร็จ ${okCount} คน!`);
    } else {
      SoundFX.wrong();
      showToast(`❌ ${errMsg || 'รหัสไม่ถูกต้อง'}`);
    }
  });

  $('testCloudBtn').addEventListener('click', async () => {
    SoundFX.click();
    $('cloudStatusText').textContent = '⏳ กำลังทดสอบเชื่อมต่อและสิทธิ์อ่าน/เขียน Firebase...';
    const res = await AuthSystem.testCloudConnection($('cloudUrlInput').value);
    if (res.ok) {
      SoundFX.correct();
      $('cloudStatusText').textContent = `✅ เชื่อมต่อสำเร็จ! อ่านและเขียนฐานข้อมูลได้ปกติ (${res.url})`;
      showToast('✅ ทดสอบเชื่อมต่อ Firebase สำเร็จ!');
    } else {
      SoundFX.wrong();
      $('cloudStatusText').textContent = `❌ ${res.error}`;
      showToast(`❌ ${res.error}`);
    }
  });

  $('saveCloudUrlBtn').addEventListener('click', async () => {
    SoundFX.click();
    const inputUrl = $('cloudUrlInput').value.trim();
    if (!inputUrl) {
      AuthSystem.setCloudUrl('');
      renderTeacherDashboard();
      showToast('ปิดการใช้งาน Cloud Sync แล้ว (กลับสู่ Local Mode)');
      return;
    }
    $('cloudStatusText').textContent = '⏳ กำลังตรวจสอบและซิงค์ข้อมูลขึ้น Cloud...';
    const test = await AuthSystem.testCloudConnection(inputUrl);
    if (!test.ok) {
      SoundFX.wrong();
      $('cloudStatusText').textContent = `❌ ${test.error}`;
      showToast(`❌ ${test.error}`);
      return;
    }
    AuthSystem.setCloudUrl(test.url);
    await AuthSystem.pushAllToCloud();
    const pulled = await AuthSystem.pullAllFromCloud();
    SoundFX.levelUp();
    renderTeacherDashboard();
    showToast(`☁️ เชื่อมต่อและซิงค์ Firebase สำเร็จ! (${pulled.count || 0} บัญชี)`);
  });

  $('copyShareLinkBtn').addEventListener('click', () => {
    const link = $('shareLinkPreview').value;
    if (!link) return;
    navigator.clipboard?.writeText(link).then(
      () => { SoundFX.coin(); showToast('🔗 คัดลอกลิงก์ห้องเรียนแล้ว! ส่งให้นักศึกษาเปิดเล่นได้เลย'); },
      () => { $('shareLinkPreview').select(); document.execCommand('copy'); showToast('🔗 คัดลอกลิงก์ห้องเรียนแล้ว!'); }
    );
  });

  $('pullCloudBtn').addEventListener('click', async () => {
    SoundFX.click();
    const res = await AuthSystem.pullAllFromCloud();
    if (res.ok) {
      SoundFX.levelUp();
      renderTeacherDashboard();
      showToast(`⬇️ ซิงค์ข้อมูลจาก Cloud สำเร็จ (${res.count} บัญชี)`);
    } else {
      SoundFX.wrong();
      showToast(`❌ ${res.error}`);
    }
  });

  $('bulkRosterImportBtn').addEventListener('click', async () => {
    SoundFX.click();
    const text = $('bulkRosterInput').value.trim();
    if (!text) {
      showToast('⚠️ กรุณาวางรายชื่อนักศึกษาก่อนกดนำเข้า');
      return;
    }
    $('bulkRosterStatus').textContent = '⏳ กำลังนำเข้าและซิงค์ขึ้น Cloud...';
    const res = await AuthSystem.bulkImportStudents(text);
    if (!res.ok) {
      SoundFX.wrong();
      $('bulkRosterStatus').textContent = `❌ ${res.error}`;
      showToast(`❌ ${res.error}`);
      return;
    }
    SoundFX.levelUp();
    $('bulkRosterInput').value = '';
    $('bulkRosterStatus').textContent = `✅ เพิ่มใหม่ ${res.added} คน, อัปเดต ${res.updated} คน` + (res.skipped ? ` (ข้าม ${res.skipped} บรรทัด)` : '');
    renderTeacherDashboard();
    showToast(`📋 นำเข้ารายชื่อนักศึกษาสำเร็จ ${res.added + res.updated} คน!`);
  });

  /* ==================== AUTH FORM BINDINGS ==================== */
  $('stuIdInput').addEventListener('input', () => {
    showAuthError('');
    showAuthInfo('');
    resetStudentFormExtras();
  });

  $('studentLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    showAuthError('');
    showAuthInfo('');
    const sid = $('stuIdInput').value.trim();
    const isFirstTimeVisible = !$('stuFirstTimeFields').classList.contains('hidden');
    const isPwVisible = !$('stuPasswordField').classList.contains('hidden');

    $('stuSubmitBtn').disabled = true;
    $('stuSubmitBtn').textContent = '⏳ กำลังตรวจสอบรหัสนักศึกษา...';

    try {
      const res = await AuthSystem.studentQuickLogin({
        studentId: sid,
        fullName: isFirstTimeVisible ? $('stuFullNameInput').value : '',
        classroom: isFirstTimeVisible ? $('stuClassInput').value : '',
        password: isPwVisible ? $('stuPasswordInput').value : (isFirstTimeVisible ? $('stuOptPassInput').value : ''),
        avatar: selectedRegAvatar
      });

      if (res.ok) {
        $('studentLoginForm').reset();
        resetStudentFormExtras();
        showToast(res.isNew
          ? `🎉 ลงทะเบียนรหัส ${res.account.username} สำเร็จ ยินดีต้อนรับ ${res.account.fullName}!`
          : `👋 ยินดีต้อนรับกลับมา ${res.account.fullName}!`);
        enterGame();
        return;
      }

      if (res.needRegister) {
        SoundFX.click();
        $('stuFirstTimeFields').classList.remove('hidden');
        $('stuPasswordField').classList.add('hidden');
        showAuthInfo(`✨ พบรหัสนักศึกษาใหม่ "${sid}"! กรอกชื่อ-นามสกุลและห้องเรียนครั้งแรก (ครั้งต่อไปพิมพ์แค่รหัสนักศึกษาเข้าได้เลย)`);
        $('stuSubmitBtn').textContent = '✨ ยืนยันลงทะเบียนและเข้าเล่นเกม';
        $('stuFullNameInput').focus();
        return;
      }

      if (res.needPassword) {
        SoundFX.click();
        $('stuPasswordField').classList.remove('hidden');
        $('stuFirstTimeFields').classList.add('hidden');
        if (isPwVisible) showAuthError(res.error);
        else showAuthInfo(`🔒 บัญชี ${res.account.fullName} (@${res.account.username}) ตั้งรหัสผ่านไว้ กรุณากรอกรหัสผ่าน`);
        $('stuSubmitBtn').textContent = '🔓 ยืนยันรหัสผ่านและเข้าเกม';
        $('stuPasswordInput').focus();
        return;
      }

      SoundFX.wrong();
      showAuthError(res.error);
      $('stuSubmitBtn').textContent = '🚀 เข้าสู่ระบบด้วยรหัสนักศึกษา';
    } finally {
      $('stuSubmitBtn').disabled = false;
    }
  });

  /* ==================== GLOBAL BINDINGS & INIT ==================== */
  $('enterGameBtn').addEventListener('click', enterGame);
  $('hudHomeBtn').addEventListener('click', returnToTitle);
  $('hudProfileBtn').addEventListener('click', openAvatarModal);
  $('hudBadgesStrip')?.addEventListener('click', (e) => {
    e.stopPropagation();
    switchScreen('badges');
  });
  $('titleChangeAvatarBtn').addEventListener('click', openAvatarModal);
  $('closeAvatarModalBtn').addEventListener('click', closeAvatarModal);
  $('avatarModal').addEventListener('click', (e) => {
    if (e.target === $('avatarModal')) closeAvatarModal();
  });
  $('hudLogoutBtn').addEventListener('click', handleLogout);
  $('titleLogoutBtn').addEventListener('click', handleLogout);
  $('titleThemeBtn').addEventListener('click', toggleTheme);
  $('hudThemeBtn').addEventListener('click', toggleTheme);
  $('titleSoundBtn').addEventListener('click', toggleSound);
  $('hudSoundBtn').addEventListener('click', toggleSound);
  $('titleBgmBtn').addEventListener('click', toggleBgm);
  $('hudBgmBtn').addEventListener('click', toggleBgm);

  $('mapFreePlayToggle').addEventListener('change', (e) => {
    if (!isTeacherAccount()) {
      e.target.checked = false;
      state.freePlay = false;
      SoundFX.wrong();
      showToast('🔒 สงวนสิทธิ์เฉพาะครูผู้สอนเท่านั้น — นักศึกษาต้องผ่านด่านตามลำดับ');
      return;
    }
    SoundFX.click();
    state.freePlay = e.target.checked;
    $('titleFreePlayToggle').checked = state.freePlay;
    saveState();
    renderWorldMap();
    showToast(state.freePlay ? '🔓 โหมดครูผู้สอน: ปลดล็อกครบทุกด่านแล้ว!' : '🔒 กลับสู่โหมดเนื้อเรื่องตามลำดับ');
  });

  document.querySelectorAll('.dock-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.screen === 'map') activeRoZoneId = null;
      if (btn.dataset.screen === 'codex') activeCodexIdx = null;
      switchScreen(btn.dataset.screen);
    });
  });

  $('resetSaveBtn').addEventListener('click', () => {
    if (!currentAccount) return;
    if (confirm(`ต้องการล้างความก้าวหน้าเกมทั้งหมดของบัญชี "${currentAccount.username}" ใช่หรือไม่?`)) {
      state = AuthSystem.createEmptyGameData(currentAccount.fullName, state.avatar);
      if (currentAccount.role === 'teacher') state.freePlay = true;
      saveState();
      renderHud();
      renderWorldMap();
      renderCliSidebar();
      renderCodexAndStats();
      showToast('ล้างเซฟเริ่มต้นใหม่เรียบร้อยแล้ว');
    }
  });

  // Boot
  (async () => {
    applyTheme();
    applySound();
    applyBgm();
    SoundFX.setBgmTrack('town');
    await AuthSystem.ensureSeedAccounts();
    hydrateFromCurrentAccount();
    renderTitleScreen();
    renderHud();
    if (AuthSystem.getCloudUrl()) {
      AuthSystem.pullMapLockConfigFromCloud().then((res) => {
        if (res.changed && $('screen-map')?.classList.contains('active')) {
          renderWorldMap();
        }
      });
    }
    initCliWelcome();
    renderChmodVault();
    renderRaidVisual('5', 0);
    VBoxSim.bindEvents();
    VBoxSim.init({
      getInstalled: () => state.installedVms || [],
      playSound: (name) => { if (SoundFX[name]) SoundFX[name](); },
      toast: showToast,
      onMissionComplete: (mission) => {
        if (!state.installedVms) state.installedVms = [];
        recordAnalytics('hardware', true);
        if (!state.installedVms.includes(mission.id)) {
          state.installedVms.push(mission.id);
          bumpDailyQuest('labsOrPuzzles');
          grantRewards(mission.xp, mission.coins);
          showToast(`💿 ติดตั้ง ${mission.name} สำเร็จ! (+${mission.xp} XP, +💰${mission.coins})`);
        } else {
          showToast(`✨ ทบทวนการติดตั้ง ${mission.name} เสร็จเรียบร้อย!`);
        }
      }
    });
  })();
})();
