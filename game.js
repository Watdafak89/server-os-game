/* ServerOps: Data Center Defender — Complete RPG, Auth, Leaderboard & Teacher Engine */
(() => {
  const PREFS_KEY = 'serverops_prefs_v2';

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

  function avatarHtml(val, sizeCls = 'hud-fit') {
    const av = resolveAvatar(val);
    return `<img src="${av.src}" alt="${av.name}" class="avatar-img ${sizeCls}" />`;
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
      blitzHighScore: saved.blitzHighScore || 0,
      dailyQuests: { ...base.dailyQuests, ...(saved.dailyQuests || {}) }
    };
    ensureTodayQuests();
    return true;
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function ensureTodayQuests() {
    const today = getTodayKey();
    if (!state.dailyQuests || state.dailyQuests.date !== today) {
      state.dailyQuests = { date: today, battlesWon: 0, labsOrPuzzles: 0, arcadePlayed: 0, claimed: [] };
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
    if (isCorrect) state.analytics[cat].correct += 1;
    saveState();
  }

  function grantRewards(xp, coins) {
    const oldLv = getRankInfo(state.xp).level;
    state.xp += xp;
    state.coins += coins;
    const newInfo = getRankInfo(state.xp);
    if (newInfo.level > oldLv) {
      SoundFX.levelUp();
      showToast(`🎉 LEVEL UP! เลื่อนขั้นเป็น LV.${newInfo.level} — ${newInfo.title}`);
    }
    checkBadges();
    saveState();
    renderHud();
  }

  function checkBadges() {
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
    if (state.completedLabs.length >= 15) unlock('cli_hero');
    if (state.completedLabs.length >= CLI_LABS.length) unlock('cli_god');
    if (state.defenseHighScore >= 1500) unlock('port_defender');
    if (state.blitzHighScore >= 1200) unlock('blitz_flash');
    if ((state.solvedFirewall || []).length >= FIREWALL_PUZZLES.length) unlock('firewall_ace');
    if ((state.solvedSubnet || []).length >= SUBNET_PUZZLES.length) unlock('subnet_guru');
    if (state.solvedChmod.length >= 4 && state.solvedRaid.length >= 4) unlock('puzzle_master');
    if ((state.installedVms || []).length >= 5) unlock('vbox_master');
    if (state.examPassed) unlock('certified');
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

  function switchAuthTab(tab) {
    SoundFX.click();
    showAuthError('');
    showAuthInfo('');
    $('tabStudentBtn').classList.toggle('active', tab === 'student');
    $('tabTeacherBtn').classList.toggle('active', tab === 'teacher');
    $('studentLoginForm').classList.toggle('hidden', tab !== 'student');
    $('teacherAuthWrap').classList.toggle('hidden', tab !== 'teacher');
    if (tab === 'teacher') {
      $('loginForm').classList.remove('hidden');
      $('registerForm').classList.add('hidden');
    }
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
    $('titleFreePlayToggle').checked = state.freePlay;

    if (loggedIn && currentAccount) {
      $('authGate').classList.add('hidden');
      $('loggedInGate').classList.remove('hidden');
      $('resumeAvatar').innerHTML = avatarHtml(state.avatar, 'hud-fit');
      $('resumeFullName').textContent = currentAccount.fullName;
      const rBadge = $('resumeRoleBadge');
      rBadge.textContent = currentAccount.role === 'teacher' ? '👨‍🏫 ครูผู้สอน' : '🎓 นักศึกษา';
      rBadge.className = `role-badge ${currentAccount.role === 'teacher' ? 'teacher' : ''}`;
      $('resumeMeta').textContent = `@${currentAccount.username} • ห้อง: ${currentAccount.classroom || '-'}`;

      const rank = getRankInfo(state.xp);
      const maxStars = ALL_STAGES_FLAT.length * 3;
      $('titleSavePreview').innerHTML = `
        <span class="save-chip">LV.${rank.level} ${rank.title}</span>
        <span class="save-chip">⭐ ${getTotalStars()}/${maxStars} ดาว</span>
        <span class="save-chip">💰 ${state.coins} เหรียญ</span>
        <span class="save-chip">🏆 ${state.unlockedBadges.length}/${BADGES.length} เหรียญตรา</span>
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

    $('hudAvatar').innerHTML = avatarHtml(state.avatar, 'hud-fit');
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
    state.freePlay = $('titleFreePlayToggle').checked || state.freePlay;
    $('mapFreePlayToggle').checked = state.freePlay;
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

    if (screenName === 'map') renderWorldMap();
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
    { id: 'dq_battle', field: 'battlesWon', target: 1, title: '⚔️ ชนะด่านแคมเปญ 1 ด่าน', xp: 60, coins: 50 },
    { id: 'dq_lab', field: 'labsOrPuzzles', target: 1, title: '🧩 ผ่าน CLI หรือพัซเซิล 1 ข้อ', xp: 55, coins: 45 },
    { id: 'dq_arcade', field: 'arcadePlayed', target: 1, title: '⚡ เล่นโหมดอาร์เคด 1 รอบ', xp: 50, coins: 45 }
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

  function isStageUnlocked(flatIdx) {
    if (state.freePlay || flatIdx === 0) return true;
    const prevStage = ALL_STAGES_FLAT[flatIdx - 1];
    return Boolean(state.stageStars[prevStage.id]);
  }

  function isZoneUnlocked(zoneIdx) {
    if (state.freePlay || zoneIdx === 0) return true;
    const prevZone = CAMPAIGN_ZONES[zoneIdx - 1];
    const prevBoss = prevZone.stages[prevZone.stages.length - 1];
    return Boolean(state.stageStars[prevBoss.id]);
  }

  function renderRoWorldMap() {
    const routesLayer = $('roRoutesLayer');
    const pinsLayer = $('roPinsLayer');
    routesLayer.innerHTML = '';
    pinsLayer.innerHTML = '';

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

    // 1. Draw SVG travel routes connecting regions sequentially
    for (let i = 0; i < CAMPAIGN_ZONES.length - 1; i++) {
      const a = CAMPAIGN_ZONES[i];
      const b = CAMPAIGN_ZONES[i + 1];
      const x1 = a.mapX * 10;
      const y1 = a.mapY * 6;
      const x2 = b.mapX * 10;
      const y2 = b.mapY * 6;
      const unlockedRoute = isZoneUnlocked(i + 1);

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

    // 2. Render clickable RO Region Pins
    CAMPAIGN_ZONES.forEach((zone, zIdx) => {
      const unlocked = isZoneUnlocked(zIdx);
      const earned = zone.stages.reduce((s, st) => s + (state.stageStars[st.id] || 0), 0);
      const maxS = zone.stages.length * 3;
      const cleared = zone.stages.every((st) => Boolean(state.stageStars[st.id]));
      const isCurrent = zone.id === currentTargetZoneId;
      const bossStage = zone.stages[zone.stages.length - 1];

      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = `ro-pin ${cleared ? 'cleared' : ''} ${isCurrent ? 'current-target' : ''}`;
      pin.style.left = `${zone.mapX}%`;
      pin.style.top = `${zone.mapY}%`;
      pin.style.setProperty('--zone-color', zone.themeColor);
      pin.disabled = !unlocked;
      pin.innerHTML = `
        <div class="ro-pin-orb">
          ${isCurrent ? `<span class="ro-pin-player">${avatarHtml(state.avatar, 'map-pin')}</span>` : ''}
          <span>${unlocked ? zone.icon : '🔒'}</span>
        </div>
        <div class="ro-pin-plate">
          <span class="ro-pin-name">${zone.roName}</span>
          <span class="ro-pin-meta">${zone.lvRange} • ⭐${earned}/${maxS}</span>
        </div>
      `;

      const updatePreview = () => {
        $('roPreviewTitle').textContent = `[${zone.roCode}] ${zone.roName} — ${zone.name} (${zone.lvRange})`;
        $('roPreviewDesc').textContent = unlocked
          ? `${zone.subtitle} • 👑 MVP: ${bossStage.enemy.name} • คลิกเพื่อวาร์ปเข้าแมพ!`
          : `🔒 ล็อกอยู่ — ปราบ MVP ของโซนก่อนหน้าให้สำเร็จ (หรือเปิดโหมดปลดล็อกทุกแมพ)`;
      };

      pin.addEventListener('mouseenter', updatePreview);
      pin.addEventListener('focus', updatePreview);
      pin.addEventListener('click', () => {
        if (!unlocked) return;
        SoundFX.shield();
        openRoFieldMap(zone.id);
      });

      pinsLayer.appendChild(pin);
    });

    // Show current target zone info by default
    const defZone = CAMPAIGN_ZONES.find((z) => z.id === currentTargetZoneId) || CAMPAIGN_ZONES[0];
    const defBoss = defZone.stages[defZone.stages.length - 1];
    $('roPreviewTitle').textContent = `[${defZone.roCode}] ${defZone.roName} — ${defZone.name} (${defZone.lvRange})`;
    $('roPreviewDesc').textContent = `${defZone.subtitle} • 👑 MVP: ${defBoss.enemy.name} • คลิกที่ไอคอนเมืองบนแผนที่เพื่อเข้าไปตะลุยด่าน!`;
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
    $('roFieldPlayerSprite').innerHTML = avatarHtml(state.avatar, 'walker');
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
        <div class="ro-monster-sprite">${unlocked ? stage.enemy.sprite : '🔒'}</div>
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
      nextBtn.classList.remove('hidden');
      nextBtn.disabled = !nextUnlocked;
      $('roNextPortalLabel').textContent = nextUnlocked ? `วาร์ปไป ${nextZone.roName}` : `🔒 ปราบ MVP ก่อน`;
      nextBtn.onclick = () => {
        if (!nextUnlocked) return;
        SoundFX.shield();
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
    $('mapFreePlayToggle').checked = state.freePlay;

    $('mapViewRoBtn').className = `btn btn-sm ${mapViewMode === 'ro' ? 'btn-neon' : 'btn-ghost'}`;
    $('mapViewListBtn').className = `btn btn-sm ${mapViewMode === 'list' ? 'btn-neon' : 'btn-ghost'}`;

    if (mapViewMode === 'ro') {
      $('worldMapContainer').classList.add('hidden');
      if (activeRoZoneId) {
        openRoFieldMap(activeRoZoneId);
      } else {
        $('roFieldView').classList.add('hidden');
        $('roWorldMapWrap').classList.remove('hidden');
        renderRoWorldMap();
      }
      return;
    }

    // List View mode
    $('roWorldMapWrap').classList.add('hidden');
    $('roFieldView').classList.add('hidden');
    $('worldMapContainer').classList.remove('hidden');

    const container = $('worldMapContainer');
    container.innerHTML = '';

    const nextTargetStage = ALL_STAGES_FLAT.find((s, i) => isStageUnlocked(i) && !state.stageStars[s.id]);
    const nextTargetId = nextTargetStage ? nextTargetStage.id : null;

    let globalIdx = 0;
    CAMPAIGN_ZONES.forEach((zone) => {
      const zoneEarned = zone.stages.reduce((acc, st) => acc + (state.stageStars[st.id] || 0), 0);
      const zoneMax = zone.stages.length * 3;

      const card = document.createElement('section');
      card.className = 'zone-card';
      card.style.setProperty('--zone-color', zone.themeColor);

      const stagesHtml = zone.stages.map((stage) => {
        const myFlatIdx = globalIdx++;
        const unlocked = isStageUnlocked(myFlatIdx);
        const stars = state.stageStars[stage.id] || 0;
        const isNext = stage.id === nextTargetId;
        const starStr = stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : (unlocked ? '☆☆☆' : '🔒 ล็อกอยู่');

        return `
          <button type="button" class="stage-node ${stars > 0 ? 'cleared' : ''} ${stage.isBoss ? 'boss-node' : ''} ${isNext ? 'next-target-node' : ''} ${!unlocked ? 'locked' : ''}"
            data-stage-id="${stage.id}" ${!unlocked ? 'disabled' : ''}>
            ${isNext ? '<span class="next-badge">▶ NEXT</span>' : ''}
            <div class="node-sprite">${unlocked ? stage.enemy.sprite : '🔒'}</div>
            <div class="node-name">${stage.title}</div>
            <div class="node-stars">${starStr}</div>
            <div class="node-reward">+${stage.xp}XP • 💰${stage.coins}</div>
          </button>
        `;
      }).join('');

      card.innerHTML = `
        <div class="zone-header">
          <div class="zone-title-wrap">
            <div class="zone-icon">${zone.icon}</div>
            <div>
              <div class="zone-code">${zone.roCode} • ${zone.roName}</div>
              <h3>${zone.name}</h3>
              <p class="muted-text" style="font-size:0.78rem;">${zone.subtitle}</p>
            </div>
          </div>
          <div class="zone-stars">⭐ ${zoneEarned}/${zoneMax}</div>
        </div>
        <div class="stage-path">${stagesHtml}</div>
      `;

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

  /* ==================== SCREEN 2: RPG BATTLE ENGINE + VFX ==================== */
  let battle = null;

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
    if (stage.isBoss) SoundFX.bossAlert();
    else SoundFX.click();
    if (mapViewMode === 'ro' && stage.zoneId) {
      activeRoZoneId = stage.zoneId;
    }

    battle = {
      stage,
      qIdx: 0,
      playerHp: 3,
      maxPlayerHp: 3,
      enemyHp: stage.enemy.hp,
      maxEnemyHp: stage.enemy.hp,
      combo: 0,
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
    $('battlePlayerSprite').innerHTML = avatarHtml(state.avatar, 'battle');
    $('battlePlayerLabel').textContent = `${state.playerName}'s Server Core`;
    $('enemySprite').textContent = stage.enemy.sprite;
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
    battle.answered = false;
    battle.hintUsedThisQ = false;
    const q = battle.stage.questions[battle.qIdx];
    $('battleStepPill').textContent = `Wave ${battle.qIdx + 1} / ${battle.stage.questions.length}`;
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
    $('battleNextBtn').classList.add('hidden');

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
    const q = battle.stage.questions[battle.qIdx];
    const isCorrect = selectedIdx === q.answer;
    recordAnalytics(battle.stage.category, isCorrect);

    const allBtns = $('battleOptions').querySelectorAll('.option-btn');
    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add('correct');
    });

    const debrief = $('battleDebrief');
    debrief.classList.remove('hidden', 'ok', 'err');

    const dmgPerHit = Math.ceil(battle.maxEnemyHp / battle.stage.questions.length);

    if (isCorrect) {
      SoundFX.attack();
      battle.combo += 1;
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

      // Enemy counter-lunge + Red beam!
      animateClass('enemySprite', 'lunge-left', 380);
      spawnBeam('enemy-beam');

      if (battle.shieldActive) {
        SoundFX.shield();
        battle.shieldActive = false;
        setTimeout(() => {
          spawnShockwave('shield-pos');
          spawnParticles(22, ['#38bdf8', '#7dd3fc', '#ffffff'], 14);
          spawnFx('🛡️ BLOCKED!', 'shield');
        }, 170);
        debrief.classList.add('err');
        debrief.innerHTML = `<strong>🛡️ UPS Shield ป้องกันความเสียหายไว้ได้!</strong> — ${q.explain}`;
      } else {
        SoundFX.wrong();
        battle.playerHp = Math.max(0, battle.playerHp - 1);
        setTimeout(() => {
          triggerShake('playerCombatant');
          animateClass('combatArena', 'arena-shake-heavy', 480);
          spawnShockwave('player-pos');
          spawnParticles(22, ['#ef4444', '#f97316', '#fde047'], 14);
          spawnFx('-1 HP!', 'hit');
        }, 170);
        debrief.classList.add('err');
        debrief.innerHTML = `<strong>💥 เซิร์ฟเวอร์ได้รับความเสียหาย!</strong> — ${q.explain}`;
      }
    }

    updateBattleBars();
    const nextBtn = $('battleNextBtn');
    nextBtn.classList.remove('hidden');

    if (battle.playerHp <= 0) {
      nextBtn.textContent = 'สรุปผลการต่อสู้';
    } else if (battle.qIdx === battle.stage.questions.length - 1) {
      nextBtn.textContent = 'ปิดฉากและรับรางวัล 🏆';
    } else {
      nextBtn.textContent = 'ลุยเวฟถัดไป ⚡';
    }
  }

  function finishBattle() {
    $('battleConsole').classList.add('hidden');
    $('battleOutcomeCard').classList.remove('hidden');
    $('victoryConfettiLayer').innerHTML = '';

    const won = battle.playerHp > 0;
    const nextBtn = $('outcomeNextStageBtn');

    if (won) {
      SoundFX.levelUp();
      const stars = battle.playerHp === 3 ? 3 : battle.playerHp === 2 ? 2 : 1;
      const prevStars = state.stageStars[battle.stage.id] || 0;
      const isFirstClear = prevStars === 0;
      if (stars > prevStars) state.stageStars[battle.stage.id] = stars;

      const mult = state.xpBoostActive ? 2 : 1;
      const baseXp = isFirstClear ? battle.stage.xp : Math.round(battle.stage.xp * 0.35);
      const baseCoins = isFirstClear ? battle.stage.coins : Math.round(battle.stage.coins * 0.4);
      const earnedXp = baseXp * mult;
      const earnedCoins = baseCoins * mult;
      if (state.xpBoostActive) state.xpBoostActive = false;

      bumpDailyQuest('battlesWon');
      grantRewards(earnedXp, earnedCoins);

      $('outcomeEmoji').textContent = battle.stage.isBoss ? '👑🏆' : '🏆';
      $('outcomeTitle').textContent = battle.stage.isBoss ? 'BOSS DEFEATED!' : 'STAGE CLEARED!';
      renderAnimatedStars(stars);
      spawnVictoryConfetti();
      $('outcomeSub').textContent = isFirstClear
        ? `ยอดเยี่ยมมาก! คุณเอาชนะ ${battle.stage.enemy.name} และปลดล็อกด่านถัดไปเรียบร้อยแล้ว`
        : `ทบทวนด่านสำเร็จ! (สถิติสูงสุด: ${state.stageStars[battle.stage.id]} ดาว)`;
      $('outcomeRewards').innerHTML = `
        <div class="reward-box"><span>XP ที่ได้รับ</span><strong>+${earnedXp} XP</strong></div>
        <div class="reward-box"><span>เหรียญรางวัล</span><strong>+💰 ${earnedCoins}</strong></div>
        <div class="reward-box"><span>Server HP คงเหลือ</span><strong>${battle.playerHp}/${battle.maxPlayerHp}</strong></div>
      `;

      const flatIdx = ALL_STAGES_FLAT.findIndex((s) => s.id === battle.stage.id);
      const nextStage = ALL_STAGES_FLAT[flatIdx + 1];
      if (nextStage) {
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
      $('outcomeSub').textContent = 'Server HP หมดก่อนพิชิตภัยคุกคาม ลองทบทวนในคัมภีร์หรือซื้อไอเทม UPS Shield / Repair Kit ในร้านค้าแล้วมาสู้ใหม่!';
      $('outcomeRewards').innerHTML = `
        <div class="reward-box"><span>ปลอบใจฝึกซ้อม</span><strong>+15 XP</strong></div>
      `;
      grantRewards(15, 0);
      nextBtn.classList.add('hidden');
    }
  }

  $('battleNextBtn').addEventListener('click', () => {
    SoundFX.click();
    if (battle.playerHp <= 0 || battle.qIdx >= battle.stage.questions.length - 1) {
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
    const q = battle.stage.questions[battle.qIdx];
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

    const xp = Math.min(160, Math.round(def.score / 25));
    const coins = Math.min(130, Math.round(def.score / 30));
    if (def.score > state.defenseHighScore) state.defenseHighScore = def.score;
    bumpDailyQuest('arcadePlayed');
    grantRewards(xp, coins);

    $('defOverStats').innerHTML = `
      <div class="reward-box"><span>คะแนนรวม</span><strong>${def.score.toLocaleString()}</strong></div>
      <div class="reward-box"><span>ผ่านถึง Wave</span><strong>${def.wave}</strong></div>
      <div class="reward-box"><span>Combo สูงสุด</span><strong>x${def.maxCombo}</strong></div>
      <div class="reward-box"><span>รางวัล</span><strong>+${xp}XP • 💰${coins}</strong></div>
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
      fb.style.color = 'var(--accent)';
      fb.textContent = `⚡ ถูกต้อง! +${gained} คะแนน (+2 วิ) — ${blitz.current.fact}`;
    } else {
      SoundFX.wrong();
      blitz.combo = 1;
      blitz.timeLeft = Math.max(0, blitz.timeLeft - 3);
      fb.style.color = 'var(--danger)';
      fb.textContent = `❌ ผิด! (-3 วิ) — ${blitz.current.fact}`;
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

    const xp = Math.min(150, Math.round(blitz.score / 18));
    const coins = Math.min(120, Math.round(blitz.score / 22));
    if (blitz.score > (state.blitzHighScore || 0)) state.blitzHighScore = blitz.score;
    bumpDailyQuest('arcadePlayed');
    grantRewards(xp, coins);
    SoundFX.levelUp();

    $('blitzOverStats').innerHTML = `
      <div class="reward-box"><span>คะแนนรวม</span><strong>${blitz.score.toLocaleString()}</strong></div>
      <div class="reward-box"><span>ตอบถูกทั้งหมด</span><strong>${blitz.correct} ข้อ</strong></div>
      <div class="reward-box"><span>สถิติสูงสุด</span><strong>${state.blitzHighScore.toLocaleString()}</strong></div>
      <div class="reward-box"><span>รางวัล</span><strong>+${xp}XP • 💰${coins}</strong></div>
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
        grantRewards(55, 45);
        SoundFX.coin();
        fb.innerHTML = `<strong>✅ ออกแบบผ่านฉลุย!</strong> ${ch.explain} • รับ +55 XP และ +💰45`;
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
      const ownedText = item.id === 'boost'
        ? (state.xpBoostActive ? '🔥 กำลังเปิดใช้งาน (x2 ด่านถัดไป)' : 'ยังไม่ได้เปิดใช้งาน')
        : `มีในกระเป๋า: ${state.inventory[item.id] || 0} ชิ้น`;
      const canBuy = state.coins >= item.price && !(item.id === 'boost' && state.xpBoostActive);

      const card = document.createElement('article');
      card.className = 'shop-card';
      card.innerHTML = `
        <div class="shop-icon">${item.icon}</div>
        <h3>${item.name}</h3>
        <p class="muted-text" style="flex:1">${item.desc}</p>
        <div class="shop-owned">${ownedText}</div>
        <button class="btn btn-neon btn-sm" ${!canBuy ? 'disabled' : ''}>ซื้อ 💰 ${item.price}</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (state.coins < item.price) return;
        state.coins -= item.price;
        if (item.id === 'boost') state.xpBoostActive = true;
        else state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
        SoundFX.coin();
        showToast(`🛒 ซื้อ ${item.icon} ${item.name} สำเร็จ!`);
        saveState();
        renderHud();
        renderShop();
      });
      grid.appendChild(card);
    });
  }

  /* ==================== SCREEN 7: INTERACTIVE CODEX LIBRARY & STATS ==================== */
  let activeCodexIdx = null;

  function renderCodexBookshelf() {
    const readList = state.readChapters || [];
    $('codexReadChip').textContent = `อ่านแล้ว ${readList.length} / ${CODEX_VOLUMES.length} เล่ม`;

    const q = ($('codexSearchInput').value || '').trim().toLowerCase();
    const grid = $('codexChapters');
    grid.innerHTML = '';

    const filtered = CODEX_VOLUMES.map((vol, idx) => ({ vol, idx })).filter(({ vol }) => {
      if (!q) return true;
      return vol.title.toLowerCase().includes(q) ||
        vol.subtitle.toLowerCase().includes(q) ||
        vol.vol.toLowerCase().includes(q);
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
          <span class="stage-chip">⏱️ เวลาอ่านประมาณ ${vol.readTime}</span>
          ${isRead ? '<span class="role-badge">✅ อ่านเข้าใจแล้ว</span>' : ''}
        </div>
        <h2>${vol.title}</h2>
        <p class="muted-text">${vol.subtitle}</p>
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
    if (elig.eligible) {
      readyEl.textContent = `✅ ปลดล็อกสิทธิ์สอบรับรองแล้ว! (ครบ ${elig.total}/${elig.total} เหรียญตราบังคับ • สะสมรวม ${unlockedTotal}/${BADGES.length} เหรียญ)`;
      readyEl.style.color = 'var(--accent)';
    } else {
      readyEl.textContent = `🔒 สะสมแล้ว ${elig.unlockedCount}/${elig.total} เหรียญบังคับ — ขาดอีก ${elig.missing.length} เหรียญจึงจะปลดล็อกสิทธิ์เข้าสอบรับรอง`;
      readyEl.style.color = 'var(--gold)';
    }

    const badgesEl = $('badgesContainer');
    badgesEl.innerHTML = '';
    BADGES.forEach((b) => {
      const unlocked = state.unlockedBadges.includes(b.id);
      const targetScreen = b.id === 'certified' ? 'exam' : (BADGE_SCREEN_MAP[b.id] || 'map');
      const card = document.createElement('div');
      card.className = `badge-item badge-card-full ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="badge-status-pill ${unlocked ? 'ok' : ''}">${unlocked ? '✅ ปลดล็อกแล้ว' : '🔒 ยังไม่ปลดล็อก'}</div>
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
  const EXAM_REQUIRED_BADGES = BADGES.filter((b) => b.id !== 'certified');
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
    cli_hero: 'cli',
    cli_god: 'cli',
    port_defender: 'defense',
    blitz_flash: 'defense',
    firewall_ace: 'puzzles',
    subnet_guru: 'puzzles',
    puzzle_master: 'puzzles',
    vbox_master: 'vbox'
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
    examQs = shuffle(EXAM_BANK).slice(0, EXAM_QUESTION_COUNT);
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
      state.examPassed = true;
      grantRewards(220, 150);
      SoundFX.levelUp();
      $('examResultHeading').textContent = '🎉 ยินดีด้วย! คุณสอบผ่านรับเกียรติบัตร Certified SysAdmin';
      $('examResultSub').textContent = `คะแนน ${score}/${examQs.length} (${pct}%) • รับ +220 XP และ +💰150`;
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
    return {
      xp: g.xp || 0,
      stars,
      labs,
      defense: g.defenseHighScore || 0,
      exam: g.examBestScore || 0,
      passed: Boolean(g.examPassed),
      avatar: g.avatar || '👨‍💻',
      rank: getRankInfo(g.xp || 0)
    };
  }

  function renderLeaderboard() {
    const accounts = AuthSystem.getAllAccountsList()
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

    // Top 3 Podium
    const podium = $('lbPodium');
    podium.innerHTML = '';
    const medals = ['🥇 อันดับ 1', '🥈 อันดับ 2', '🥉 อันดับ 3'];
    accounts.slice(0, 3).forEach((entry, idx) => {
      const metricStr = lbSortBy === 'stars' ? `⭐ ${entry.m.stars}/${maxStars}`
        : lbSortBy === 'defense' ? `🛡️ ${entry.m.defense.toLocaleString()}`
        : lbSortBy === 'exam' ? `🎓 ${entry.m.exam}/${EXAM_QUESTION_COUNT}`
        : `⚡ ${entry.m.xp.toLocaleString()} XP`;
      const card = document.createElement('div');
      card.className = `podium-card rank-${idx + 1}`;
      card.innerHTML = `
        <div class="podium-medal">${medals[idx]}</div>
        <div class="podium-avatar">${avatarHtml(entry.m.avatar, 'podium')}</div>
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
      tr.innerHTML = `
        <td><strong>#${idx + 1}</strong></td>
        <td>${avatarHtml(entry.m.avatar, 'xs')} <strong>${entry.acc.fullName}</strong> ${isMe ? '<span class="stage-chip">คุณ</span>' : ''}</td>
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

    $('teacherKpis').innerHTML = `
      <div class="kpi-card"><span>นักศึกษาทั้งหมด</span><strong>${count} คน</strong></div>
      <div class="kpi-card"><span>ค่าเฉลี่ย XP</span><strong>${avgXp.toLocaleString()} XP</strong></div>
      <div class="kpi-card"><span>ค่าเฉลี่ยดาวแคมเปญ</span><strong>⭐ ${avgStars} / ${maxStars}</strong></div>
      <div class="kpi-card"><span>สอบผ่านรับเกียรติบัตร</span><strong>🎓 ${passedCert} / ${count}</strong></div>
    `;

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

    const tbody = $('teacherTableBody');
    tbody.innerHTML = '';
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:1.5rem;">ไม่พบข้อมูลนักศึกษาตามเงื่อนไข</td></tr>';
    } else {
      filtered.forEach(({ acc, m }) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${acc.username}</code></td>
          <td>${avatarHtml(m.avatar, 'xs')} <strong>${acc.fullName}</strong></td>
          <td>${acc.classroom || '-'}</td>
          <td><strong>${m.xp.toLocaleString()}</strong></td>
          <td>⭐ ${m.stars}/${maxStars}</td>
          <td>💻 ${m.labs}/${maxLabs}</td>
          <td>${m.defense.toLocaleString()}</td>
          <td>${m.exam}/${EXAM_QUESTION_COUNT}</td>
          <td>${m.passed ? '<span class="role-badge">ผ่าน ✓</span>' : '<span class="muted-text">ยังไม่ผ่าน</span>'}</td>
          <td>
            <button class="btn btn-ghost btn-xs t-reset-pw" data-u="${acc.username}" title="รีเซ็ตรหัสผ่านเป็น 123456">🔑 รีเซ็ตรหัส</button>
            <button class="btn btn-ghost btn-xs t-del-u" data-u="${acc.username}" title="ลบบัญชีนี้">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
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
  $('tabStudentBtn').addEventListener('click', () => switchAuthTab('student'));
  $('tabTeacherBtn').addEventListener('click', () => switchAuthTab('teacher'));

  $('showTeacherRegBtn').addEventListener('click', () => {
    SoundFX.click();
    showAuthError('');
    $('loginForm').classList.add('hidden');
    $('registerForm').classList.remove('hidden');
  });

  $('backTeacherLoginBtn').addEventListener('click', () => {
    SoundFX.click();
    showAuthError('');
    $('registerForm').classList.add('hidden');
    $('loginForm').classList.remove('hidden');
  });

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

  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    showAuthError('');
    const res = await AuthSystem.login($('loginUsername').value, $('loginPassword').value);
    if (!res.ok) {
      SoundFX.wrong();
      showAuthError(res.error);
      return;
    }
    $('loginPassword').value = '';
    enterGame();
  });

  $('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    showAuthError('');
    const pw = $('regPassword').value;
    const cf = $('regConfirm').value;
    if (pw !== cf) {
      SoundFX.wrong();
      showAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    const res = await AuthSystem.register({
      username: $('regUsername').value,
      fullName: $('regFullName').value,
      classroom: 'ผู้ดูแลรายวิชา',
      password: pw,
      role: 'teacher',
      teacherCode: $('regTeacherCode').value,
      avatar: '🛡️'
    });
    if (!res.ok) {
      SoundFX.wrong();
      showAuthError(res.error);
      return;
    }
    $('registerForm').reset();
    showToast(`🎉 สมัครบัญชีครูผู้สอนสำเร็จ ยินดีต้อนรับ ${res.account.fullName}!`);
    enterGame();
  });

  $('demoStudentBtn').addEventListener('click', async () => {
    SoundFX.click();
    const res = await AuthSystem.studentQuickLogin({ studentId: 'student01', password: '123456' });
    if (res.ok) enterGame();
    else {
      const fallback = await AuthSystem.login('student01', '123456');
      if (fallback.ok) enterGame();
      else showAuthError(fallback.error || res.error);
    }
  });

  $('demoTeacherBtn').addEventListener('click', async () => {
    SoundFX.click();
    const res = await AuthSystem.login('teacher', '123456');
    if (res.ok) enterGame();
  });

  /* ==================== GLOBAL BINDINGS & INIT ==================== */
  $('enterGameBtn').addEventListener('click', enterGame);
  $('hudHomeBtn').addEventListener('click', returnToTitle);
  $('hudProfileBtn').addEventListener('click', openAvatarModal);
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
    SoundFX.click();
    state.freePlay = e.target.checked;
    $('titleFreePlayToggle').checked = state.freePlay;
    saveState();
    renderWorldMap();
    showToast(state.freePlay ? '🔓 เปิดโหมดอิสระ: ปลดล็อกครบทุกด่านแล้ว!' : '🔒 กลับสู่โหมดเนื้อเรื่องตามลำดับ');
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
