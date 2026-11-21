/* ServerOps: Data Center Defender — Complete RPG, Auth, Leaderboard & Teacher Engine */
(() => {
  const PREFS_KEY = 'serverops_prefs_v2';

  const ALL_STAGES_FLAT = CAMPAIGN_ZONES.flatMap((zone) =>
    zone.stages.map((stage) => ({ ...stage, zoneId: zone.id, zoneCode: zone.code, zoneName: zone.name }))
  );

  let prefs = loadPrefs();
  let currentAccount = null;
  let state = AuthSystem.createEmptyGameData('SysAdmin', '👨‍💻');
  let selectedRegAvatar = '👨‍💻';
  let lbSortBy = 'xp';
  let defIntervalId = null;

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { theme: 'dark', sound: true, ...JSON.parse(raw) } : { theme: 'dark', sound: true };
    } catch {
      return { theme: 'dark', sound: true };
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
      analytics: { ...base.analytics, ...(saved.analytics || {}) }
    };
    return true;
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
    if (state.completedLabs.length >= 7) unlock('cli_hero');
    if (state.completedLabs.length >= CLI_LABS.length) unlock('cli_god');
    if (state.defenseHighScore >= 1500) unlock('port_defender');
    if (state.solvedChmod.length >= 3 && state.solvedRaid.length >= 3) unlock('puzzle_master');
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

  function switchAuthTab(tab) {
    SoundFX.click();
    showAuthError('');
    $('tabLoginBtn').classList.toggle('active', tab === 'login');
    $('tabRegisterBtn').classList.toggle('active', tab === 'register');
    $('loginForm').classList.toggle('hidden', tab !== 'login');
    $('registerForm').classList.toggle('hidden', tab !== 'register');
  }

  function renderAvatarPicker() {
    const picker = $('avatarPicker');
    picker.innerHTML = '';
    AVATARS.forEach((av) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `avatar-choice ${selectedRegAvatar === av ? 'active' : ''}`;
      btn.textContent = av;
      btn.addEventListener('click', () => {
        SoundFX.click();
        selectedRegAvatar = av;
        renderAvatarPicker();
      });
      picker.appendChild(btn);
    });
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
    updateCloudBadges();
    const loggedIn = hydrateFromCurrentAccount();
    $('titleFreePlayToggle').checked = state.freePlay;

    if (loggedIn && currentAccount) {
      $('authGate').classList.add('hidden');
      $('loggedInGate').classList.remove('hidden');
      $('resumeAvatar').textContent = state.avatar;
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

    $('hudAvatar').textContent = state.avatar;
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
    $('gameShell').classList.add('hidden');
    $('titleScreen').classList.remove('hidden');
    renderTitleScreen();
  }

  function handleLogout() {
    SoundFX.click();
    stopDefenseTimer();
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
    if (screenName !== 'defense') stopDefenseTimer();
    if (screenName === 'teacher' && currentAccount?.role !== 'teacher') {
      showToast('⚠️ หน้านี้สงวนสิทธิ์เฉพาะบัญชีครูผู้สอนเท่านั้น');
      return;
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
    if (screenName === 'shop') renderShop();
    if (screenName === 'codex') renderCodexAndStats();
    if (screenName === 'puzzles') {
      renderChmodVault();
      renderRaidChallenge();
    }
    if (screenName === 'defense') {
      $('defHigh').textContent = state.defenseHighScore.toLocaleString();
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

  /* ==================== SCREEN 1: CAMPAIGN WORLD MAP ==================== */
  function isStageUnlocked(flatIdx) {
    if (state.freePlay || flatIdx === 0) return true;
    const prevStage = ALL_STAGES_FLAT[flatIdx - 1];
    return Boolean(state.stageStars[prevStage.id]);
  }

  function renderWorldMap() {
    $('mapFreePlayToggle').checked = state.freePlay;
    const container = $('worldMapContainer');
    container.innerHTML = '';

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
        const starStr = stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : (unlocked ? '☆☆☆' : '🔒 ล็อกอยู่');

        return `
          <button type="button" class="stage-node ${stars > 0 ? 'cleared' : ''} ${stage.isBoss ? 'boss-node' : ''} ${!unlocked ? 'locked' : ''}"
            data-stage-id="${stage.id}" ${!unlocked ? 'disabled' : ''}>
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
              <div class="zone-code">${zone.code}</div>
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

  /* ==================== SCREEN 2: RPG BATTLE ENGINE ==================== */
  let battle = null;

  function spawnFx(text, cls) {
    const layer = $('battleFxLayer');
    const el = document.createElement('div');
    el.className = `float-fx ${cls}`;
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  function triggerShake(elId) {
    const el = $(elId);
    el.classList.remove('shake-hit');
    void el.offsetWidth;
    el.classList.add('shake-hit');
  }

  function startBattle(stage) {
    if (stage.isBoss) SoundFX.bossAlert();
    else SoundFX.click();

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
    $('battleZoneChip').textContent = stage.zoneCode;
    $('battleStageTitle').textContent = stage.title;
    $('battleDialogueText').textContent = stage.dialogue;
    $('battlePlayerSprite').textContent = state.avatar;
    $('battlePlayerLabel').textContent = `${state.playerName}'s Server Core`;
    $('enemySprite').textContent = stage.enemy.sprite;
    $('enemyName').textContent = stage.enemy.name;
    $('enemyBossTag').classList.toggle('hidden', !stage.isBoss);

    switchScreen('battle');
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
      btn.className = 'option-btn';
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
      triggerShake('enemyCombatant');
      spawnFx(`-${dmgPerHit} CRIT!`, 'dmg');
      debrief.classList.add('ok');
      debrief.innerHTML = `<strong>⚡ โจมตีสำเร็จ!</strong> ${q.explain}`;
    } else {
      btn.classList.add('wrong');
      battle.combo = 0;
      if (battle.shieldActive) {
        SoundFX.shield();
        battle.shieldActive = false;
        spawnFx('🛡️ BLOCKED!', 'shield');
        debrief.classList.add('err');
        debrief.innerHTML = `<strong>🛡️ UPS Shield ป้องกันความเสียหายไว้ได้!</strong> — ${q.explain}`;
      } else {
        SoundFX.wrong();
        battle.playerHp = Math.max(0, battle.playerHp - 1);
        triggerShake('playerCombatant');
        spawnFx('-1 HP!', 'hit');
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

      grantRewards(earnedXp, earnedCoins);

      $('outcomeEmoji').textContent = battle.stage.isBoss ? '👑🏆' : '🏆';
      $('outcomeTitle').textContent = battle.stage.isBoss ? 'BOSS DEFEATED!' : 'STAGE CLEARED!';
      $('outcomeStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
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
    firewall: ['22/tcp (SSH)', '80/tcp (HTTP)'],
    users: ['root', 'admin', 'www-data']
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
  ipconfig /all                          ดูข้อมูล IP, Subnet, Gateway, DNS ทั้งหมด
  nslookup <domain>                      ตรวจสอบการแปลงชื่อ DNS
  Get-Service [name]                     ดูสถานะ Windows Services (DNS, DHCP, NTDS)
  Restart-Service <name>                 รีสตาร์ทบริการบน Windows Server
  gpupdate /force                        บังคับอัปเดต Group Policy (GPO) ทันที
  Get-ADUser -Filter *                   แสดงรายชื่อผู้ใช้ใน Active Directory
  Test-NetConnection <host> -Port <p>    ทดสอบการเชื่อมต่อพอร์ต TCP
  netstat -ano                           ดูพอร์ตที่เปิดและ PID
  cls                                    ล้างหน้าจอ`, 'term-line-muted');
      } else {
        appendTerm(
`คำสั่ง Linux Server Bash ที่รองรับ:
  whoami, hostname, uname -a             ข้อมูลผู้ใช้และระบบปฏิบัติการ
  ip a | ifconfig | ping <host>          ตรวจสอบเครือข่ายและ IP
  systemctl status|start|restart|enable <svc>
  journalctl -u <svc>                    ดู Systemd Logs (เช่น nginx)
  ss -tulnp | netstat -tulnp             ดูพอร์ตที่เปิด Listening อยู่
  df -h | du -sh /var/* | free -h        ตรวจสอบดิสก์และหน่วยความจำ RAM
  ls -l | chmod <mode> <file>            จัดการไฟล์และสิทธิ์ rwx
  ufw status | ufw allow <port>          จัดการ Firewall UFW
  useradd <name> | id <name> | cat /etc/passwd
  clear                                  ล้างหน้าจอ`, 'term-line-muted');
      }
    }
    /* Windows Server Commands */
    else if (bin === 'ipconfig') {
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
      appendTerm(`SamAccountName   Enabled   Department\n--------------   -------   ----------\nAdministrator    True      IT-Core\nsomchai.k        True      Accounting\nstudent01        True      Computer-IT`);
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
    } else if (bin === 'ufw') {
      if (parts[1] === 'status') {
        appendTerm(`Status: active\n\nTo                     Action   From\n--                     ------   ----\n${simEnv.firewall.map((r) => r.padEnd(23) + 'ALLOW    Anywhere').join('\n')}`);
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
      } else {
        appendTerm('ใช้คำสั่ง ufw status หรือ ufw allow <port>', 'term-line-err');
      }
    } else if (bin === 'useradd' || bin === 'adduser') {
      const u = parts[1];
      if (!u) appendTerm('Usage: useradd <username>', 'term-line-err');
      else if (simEnv.users.includes(u)) appendTerm(`useradd: user '${u}' already exists`, 'term-line-err');
      else {
        simEnv.users.push(u);
        appendTerm(`User '${u}' created successfully.`, 'term-line-ok');
      }
    } else if (bin === 'id') {
      const u = parts[1] || 'root';
      if (simEnv.users.includes(u)) appendTerm(`uid=1002(${u}) gid=1002(${u}) groups=1002(${u}),users`);
      else appendTerm(`id: '${u}': no such user`, 'term-line-err');
    } else if (bin === 'cat' && parts[1] === '/etc/passwd') {
      appendTerm(simEnv.users.map((u, i) => `${u}:x:${i === 0 ? 0 : 1000 + i}:1000::/home/${u}:/bin/bash`).join('\n'));
    } else {
      appendTerm(`ไม่พบคำสั่ง '${parts[0]}' — พิมพ์ 'help' เพื่อดูคำสั่งที่รองรับ`, 'term-line-err');
    }

    // Check lab completions
    let passedAny = false;
    CLI_LABS.forEach((item) => {
      if (!state.completedLabs.includes(item.id) && item.check(cmd, simEnv)) {
        state.completedLabs.push(item.id);
        recordAnalytics(item.category, true);
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

  document.querySelectorAll('.puzzle-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      const target = btn.dataset.ptab;
      document.querySelectorAll('.puzzle-tab').forEach((b) => {
        b.className = `btn btn-sm puzzle-tab ${b.dataset.ptab === target ? 'btn-neon active' : 'btn-ghost'}`;
      });
      $('ptab-chmod').classList.toggle('hidden', target !== 'chmod');
      $('ptab-raid').classList.toggle('hidden', target !== 'raid');
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

  /* ==================== SCREEN 7: CODEX & STATS ==================== */
  function renderCodexAndStats() {
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

    $('badgeCountChip').textContent = `${state.unlockedBadges.length} / ${BADGES.length}`;
    const badgesEl = $('badgesContainer');
    badgesEl.innerHTML = '';
    BADGES.forEach((b) => {
      const unlocked = state.unlockedBadges.includes(b.id);
      const card = document.createElement('div');
      card.className = `badge-item ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="badge-emoji">${b.emoji}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      `;
      badgesEl.appendChild(card);
    });

    const chaptersEl = $('codexChapters');
    if (!chaptersEl.hasChildNodes()) {
      CODEX_CHAPTERS.forEach((ch) => {
        const card = document.createElement('article');
        card.className = 'codex-card';
        card.innerHTML = `<h4>${ch.title}</h4><ul>${ch.points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
        chaptersEl.appendChild(card);
      });
    }
  }

  /* ==================== SCREEN 8: GUILD CERTIFICATION EXAM ==================== */
  let examQs = [];
  let examIdx = 0;
  let examAns = [];
  let examPick = null;

  function startExam() {
    SoundFX.bossAlert();
    examQs = shuffle(EXAM_BANK).slice(0, 15);
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

    // Top 3 Podium
    const podium = $('lbPodium');
    podium.innerHTML = '';
    const medals = ['🥇 อันดับ 1', '🥈 อันดับ 2', '🥉 อันดับ 3'];
    accounts.slice(0, 3).forEach((entry, idx) => {
      const metricStr = lbSortBy === 'stars' ? `⭐ ${entry.m.stars}/54`
        : lbSortBy === 'defense' ? `🛡️ ${entry.m.defense.toLocaleString()}`
        : lbSortBy === 'exam' ? `🎓 ${entry.m.exam}/15`
        : `⚡ ${entry.m.xp.toLocaleString()} XP`;
      const card = document.createElement('div');
      card.className = `podium-card rank-${idx + 1}`;
      card.innerHTML = `
        <div class="podium-medal">${medals[idx]}</div>
        <div class="podium-avatar">${entry.m.avatar}</div>
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
        <td>${entry.m.avatar} <strong>${entry.acc.fullName}</strong> ${isMe ? '<span class="stage-chip">คุณ</span>' : ''}</td>
        <td>${entry.acc.classroom || '-'}</td>
        <td><strong>${entry.m.xp.toLocaleString()} XP</strong> <span class="muted-text">(LV.${entry.m.rank.level})</span></td>
        <td>⭐ ${entry.m.stars}/54</td>
        <td>💻 ${entry.m.labs}/14</td>
        <td>${entry.m.defense.toLocaleString()}</td>
        <td>${entry.m.exam}/15 ${entry.m.passed ? '✅' : ''}</td>
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

    $('teacherKpis').innerHTML = `
      <div class="kpi-card"><span>นักศึกษาทั้งหมด</span><strong>${count} คน</strong></div>
      <div class="kpi-card"><span>ค่าเฉลี่ย XP</span><strong>${avgXp.toLocaleString()} XP</strong></div>
      <div class="kpi-card"><span>ค่าเฉลี่ยดาวแคมเปญ</span><strong>⭐ ${avgStars} / 54</strong></div>
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
          <td>${m.avatar} <strong>${acc.fullName}</strong></td>
          <td>${acc.classroom || '-'}</td>
          <td><strong>${m.xp.toLocaleString()}</strong></td>
          <td>⭐ ${m.stars}/54</td>
          <td>💻 ${m.labs}/14</td>
          <td>${m.defense.toLocaleString()}</td>
          <td>${m.exam}/15</td>
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

  /* ==================== AUTH FORM BINDINGS ==================== */
  $('tabLoginBtn').addEventListener('click', () => switchAuthTab('login'));
  $('tabRegisterBtn').addEventListener('click', () => switchAuthTab('register'));

  $('regRole').addEventListener('change', (e) => {
    $('teacherCodeField').classList.toggle('hidden', e.target.value !== 'teacher');
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
      classroom: $('regClassroom').value,
      password: pw,
      role: $('regRole').value,
      teacherCode: $('regTeacherCode').value,
      avatar: selectedRegAvatar
    });
    if (!res.ok) {
      SoundFX.wrong();
      showAuthError(res.error);
      return;
    }
    $('registerForm').reset();
    $('teacherCodeField').classList.add('hidden');
    showToast(`🎉 สมัครสมาชิกสำเร็จ ยินดีต้อนรับ ${res.account.fullName}!`);
    enterGame();
  });

  $('demoStudentBtn').addEventListener('click', async () => {
    SoundFX.click();
    const res = await AuthSystem.login('student01', '123456');
    if (res.ok) enterGame();
  });

  $('demoTeacherBtn').addEventListener('click', async () => {
    SoundFX.click();
    const res = await AuthSystem.login('teacher', '123456');
    if (res.ok) enterGame();
  });

  /* ==================== GLOBAL BINDINGS & INIT ==================== */
  $('enterGameBtn').addEventListener('click', enterGame);
  $('hudHomeBtn').addEventListener('click', returnToTitle);
  $('hudProfileBtn').addEventListener('click', returnToTitle);
  $('hudLogoutBtn').addEventListener('click', handleLogout);
  $('titleLogoutBtn').addEventListener('click', handleLogout);
  $('titleThemeBtn').addEventListener('click', toggleTheme);
  $('hudThemeBtn').addEventListener('click', toggleTheme);
  $('titleSoundBtn').addEventListener('click', toggleSound);
  $('hudSoundBtn').addEventListener('click', toggleSound);

  $('mapFreePlayToggle').addEventListener('change', (e) => {
    SoundFX.click();
    state.freePlay = e.target.checked;
    $('titleFreePlayToggle').checked = state.freePlay;
    saveState();
    renderWorldMap();
    showToast(state.freePlay ? '🔓 เปิดโหมดอิสระ: ปลดล็อกครบทุกด่านแล้ว!' : '🔒 กลับสู่โหมดเนื้อเรื่องตามลำดับ');
  });

  document.querySelectorAll('.dock-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
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
    await AuthSystem.ensureSeedAccounts();
    hydrateFromCurrentAccount();
    renderTitleScreen();
    renderHud();
    initCliWelcome();
    renderChmodVault();
    renderRaidVisual('5', 0);
  })();
})();
