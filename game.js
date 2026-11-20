/* ServerOps Academy — Core Game & Simulation Engine */
(() => {
  const STORAGE_KEY = 'serverops_academy_v1';

  const defaultState = () => ({
    xp: 0,
    completedMissions: [],
    completedLabs: [],
    portHighScore: 0,
    examBestScore: 0,
    examPassed: false,
    unlockedBadges: [],
    analytics: {
      fundamentals: { correct: 0, total: 0 },
      network: { correct: 0, total: 0 },
      users: { correct: 0, total: 0 },
      cli: { correct: 0, total: 0 },
      security: { correct: 0, total: 0 }
    },
    theme: 'dark',
    sound: true
  });

  let state = loadState();
  let portTimerId = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        analytics: { ...defaultState().analytics, ...(parsed.analytics || {}) }
      };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }

  /* ==================== HELPERS ==================== */
  const $ = (id) => document.getElementById(id);
  let toastTimer = null;

  function showToast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getRankInfo(xp) {
    let idx = 0;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXp) idx = i;
    }
    const current = RANKS[idx];
    const next = RANKS[idx + 1] || null;
    const progressPct = next
      ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
      : 100;
    return { level: idx + 1, title: current.title, next, progressPct };
  }

  function recordAnalytics(category, isCorrect) {
    if (!state.analytics[category]) {
      state.analytics[category] = { correct: 0, total: 0 };
    }
    state.analytics[category].total += 1;
    if (isCorrect) state.analytics[category].correct += 1;
    saveState();
  }

  function awardXp(amount) {
    const oldLevel = getRankInfo(state.xp).level;
    state.xp += amount;
    const newInfo = getRankInfo(state.xp);
    if (newInfo.level > oldLevel) {
      SoundFX.levelUp();
      showToast(`🎉 เลื่อนระดับเป็น Lv.${newInfo.level} — ${newInfo.title}!`);
    }
    checkBadges();
    saveState();
    renderHeaderAndDashboard();
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

    if (state.completedMissions.length >= 1) unlock('first_mission');
    if (state.completedMissions.length >= MISSIONS.length) unlock('all_missions');
    if (state.completedLabs.length >= 4) unlock('cli_novice');
    if (state.completedLabs.length >= CLI_LABS.length) unlock('cli_master');
    if (state.portHighScore >= 1000) unlock('port_ace');
    if (state.examPassed) unlock('certified');
  }

  /* ==================== NAVIGATION & THEME ==================== */
  function switchView(viewName) {
    SoundFX.click();
    if (viewName !== 'portrush') {
      clearInterval(portTimerId);
    }
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const target = $(`view-${viewName}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    if (viewName === 'dashboard') renderHeaderAndDashboard();
    if (viewName === 'missions') renderMissionGrid();
    if (viewName === 'terminal') {
      renderLabSidebar();
      setTimeout(() => $('terminalInput')?.focus(), 60);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    $('themeToggleBtn').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }

  function applySound() {
    SoundFX.setEnabled(state.sound);
    $('soundToggleBtn').textContent = state.sound ? '🔊' : '🔇';
  }

  /* ==================== DASHBOARD RENDERING ==================== */
  function renderHeaderAndDashboard() {
    const info = getRankInfo(state.xp);
    $('headerLevel').textContent = `Lv.${info.level}`;
    $('headerXp').textContent = `${state.xp} XP`;

    $('dashRank').textContent = info.title;
    $('dashXpBar').style.width = `${info.progressPct}%`;
    $('dashXpText').textContent = info.next
      ? `${state.xp} / ${info.next.minXp} XP สู่ระดับ ${info.next.title}`
      : `${state.xp} XP • ระดับสูงสุดแล้ว!`;

    $('dashMissionsDone').textContent = state.completedMissions.length;
    $('dashMissionsTotal').textContent = MISSIONS.length;
    $('dashLabsDone').textContent = state.completedLabs.length;
    $('dashLabsTotal').textContent = CLI_LABS.length;
    $('dashPortHigh').textContent = state.portHighScore.toLocaleString();

    // Learning Analytics
    const analyticsEl = $('analyticsContainer');
    analyticsEl.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([key, label]) => {
      const stat = state.analytics[key] || { correct: 0, total: 0 };
      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      const statusText = stat.total === 0 ? 'ยังไม่เริ่มฝึก' : `${pct}% (${stat.correct}/${stat.total})`;
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="analytics-row-head">
          <span>${label}</span>
          <strong>${statusText}</strong>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      `;
      analyticsEl.appendChild(row);
    });

    // Badges
    const badgesEl = $('badgesContainer');
    badgesEl.innerHTML = '';
    $('badgeCountText').textContent = `${state.unlockedBadges.length} / ${BADGES.length}`;
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
  }

  /* ==================== MODE 1: INCIDENT MISSIONS ==================== */
  let activeMission = null;
  let missionStepIdx = 0;
  let missionHearts = 3;
  let missionAnswered = false;

  function updateMissionHearts() {
    $('missionHealthDisplay').textContent = '💚'.repeat(missionHearts) + '🖤'.repeat(3 - missionHearts);
  }

  function renderMissionGrid() {
    $('missionSelector').classList.remove('hidden');
    $('missionRunner').classList.add('hidden');
    const grid = $('missionSelector');
    grid.innerHTML = '';

    MISSIONS.forEach((m) => {
      const done = state.completedMissions.includes(m.id);
      const card = document.createElement('article');
      card.className = `mission-card ${done ? 'completed' : ''}`;
      card.innerHTML = `
        <div class="mission-card-top">
          <span class="badge-chip">${CATEGORIES[m.category]}</span>
          <span class="status-pill ${done ? 'done' : 'todo'}">${done ? '✓ ผ่านแล้ว' : m.difficulty}</span>
        </div>
        <h3>${m.title}</h3>
        <p class="muted-text" style="flex:1">${m.summary}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;margin-top:0.35rem;">
          <span style="color:var(--accent);font-weight:600;">+${m.xp} XP</span>
          <span style="color:var(--primary);font-weight:600;">${done ? 'เล่นทบทวน →' : 'รับภารกิจ →'}</span>
        </div>
      `;
      card.addEventListener('click', () => startMission(m));
      grid.appendChild(card);
    });
  }

  function startMission(mission) {
    SoundFX.click();
    activeMission = mission;
    missionStepIdx = 0;
    missionHearts = 3;
    updateMissionHearts();
    $('missionSelector').classList.add('hidden');
    $('missionRunner').classList.remove('hidden');
    renderMissionStep();
  }

  function renderMissionStep() {
    missionAnswered = false;
    const step = activeMission.steps[missionStepIdx];
    $('missionCategoryBadge').textContent = CATEGORIES[activeMission.category];
    $('missionStepCounter').textContent = `ขั้นที่ ${missionStepIdx + 1} / ${activeMission.steps.length}`;
    $('missionTitle').textContent = activeMission.title;
    $('missionContext').textContent = step.context;
    $('missionQuestion').textContent = step.question;

    const codeEl = $('missionCodeBlock');
    if (step.code) {
      codeEl.textContent = step.code;
      codeEl.classList.remove('hidden');
    } else {
      codeEl.classList.add('hidden');
    }

    $('missionFeedback').classList.add('hidden');
    $('missionNextBtn').classList.add('hidden');

    const optsEl = $('missionOptions');
    optsEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    step.options.forEach((optText, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="opt-key">${letters[i]}</span><span>${optText}</span>`;
      btn.addEventListener('click', () => handleMissionAnswer(i, btn));
      optsEl.appendChild(btn);
    });
  }

  function handleMissionAnswer(selectedIdx, clickedBtn) {
    if (missionAnswered) return;
    missionAnswered = true;
    const step = activeMission.steps[missionStepIdx];
    const isCorrect = selectedIdx === step.answer;
    recordAnalytics(activeMission.category, isCorrect);

    const allBtns = $('missionOptions').querySelectorAll('.option-btn');
    allBtns.forEach((b, idx) => {
      b.disabled = true;
      if (idx === step.answer) b.classList.add('correct');
    });

    const fb = $('missionFeedback');
    fb.classList.remove('hidden', 'ok', 'err');

    if (isCorrect) {
      SoundFX.correct();
      fb.classList.add('ok');
      fb.innerHTML = `<strong>✅ ถูกต้อง!</strong> ${step.explanation}`;
    } else {
      SoundFX.wrong();
      clickedBtn.classList.add('wrong');
      missionHearts = Math.max(0, missionHearts - 1);
      updateMissionHearts();
      fb.classList.add('err');
      fb.innerHTML = `<strong>❌ ยังไม่ถูกต้อง</strong> — ${step.explanation}`;
    }

    const nextBtn = $('missionNextBtn');
    nextBtn.classList.remove('hidden');
    const isLast = missionStepIdx === activeMission.steps.length - 1;
    nextBtn.textContent = isLast ? 'สรุปภารกิจ ✓' : 'ขั้นตอนถัดไป →';
  }

  $('missionNextBtn').addEventListener('click', () => {
    SoundFX.click();
    if (missionStepIdx < activeMission.steps.length - 1) {
      missionStepIdx += 1;
      renderMissionStep();
    } else {
      const alreadyDone = state.completedMissions.includes(activeMission.id);
      if (!alreadyDone) {
        state.completedMissions.push(activeMission.id);
        awardXp(activeMission.xp);
        showToast(`✅ ปิดเคส "${activeMission.title}" สำเร็จ! (+${activeMission.xp} XP)`);
      } else {
        showToast(`✨ ทบทวน "${activeMission.title}" เสร็จเรียบร้อย`);
      }
      renderMissionGrid();
    }
  });

  $('backToMissionsBtn').addEventListener('click', () => {
    SoundFX.click();
    renderMissionGrid();
  });

  /* ==================== MODE 2: INTERACTIVE LINUX CLI LAB ==================== */
  let currentLabIdx = 0;
  let cmdHistory = [];
  let historyPtr = -1;

  const simServer = {
    hostname: 'srv-lab-01',
    user: 'root',
    ip: '192.168.10.10/24',
    services: {
      nginx: 'inactive',
      ssh: 'active',
      ufw: 'active',
      mysql: 'active'
    },
    files: {
      'secret.key': '-rwxrwxrwx',
      'backup.sh': '-rw-r--r--',
      'nginx.conf': '-rw-r--r--'
    },
    firewall: ['22/tcp (SSH)', '80/tcp (HTTP)'],
    users: ['root', 'admin', 'www-data']
  };

  function appendTerm(text, cls = '') {
    const out = $('terminalOutput');
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }

  function initTerminalWelcome() {
    $('terminalOutput').innerHTML = '';
    appendTerm('Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)', 'term-line-muted');
    appendTerm('ServerOps Academy Interactive CLI Sandbox — พิมพ์ "help" เพื่อดูคำสั่งที่รองรับ\n', 'term-line-muted');
  }

  function renderLabSidebar() {
    $('labProgressBadge').textContent = `สำเร็จ ${state.completedLabs.length} / ${CLI_LABS.length} แล็บ`;
    const list = $('labTaskList');
    list.innerHTML = '';

    CLI_LABS.forEach((lab, idx) => {
      const done = state.completedLabs.includes(lab.id);
      const btn = document.createElement('button');
      btn.className = `lab-task-item ${idx === currentLabIdx ? 'active' : ''} ${done ? 'done' : ''}`;
      btn.innerHTML = `<span>${lab.title}</span><span>${done ? '✅' : '○'}</span>`;
      btn.addEventListener('click', () => {
        SoundFX.click();
        currentLabIdx = idx;
        renderLabSidebar();
      });
      list.appendChild(btn);
    });

    const lab = CLI_LABS[currentLabIdx];
    $('labCurrentTitle').textContent = lab.title;
    $('labCurrentGoal').textContent = lab.goal;
    $('labHintBox').textContent = `💡 คำใบ้: ${lab.hint}`;
    $('labHintBox').classList.add('hidden');

    const quickEl = $('quickCmdButtons');
    quickEl.innerHTML = '';
    lab.quickCmds.forEach((cmd) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-cmd-chip';
      chip.textContent = cmd;
      chip.addEventListener('click', () => {
        $('terminalInput').value = cmd;
        $('terminalInput').focus();
      });
      quickEl.appendChild(chip);
    });
  }

  function octalToSym(oct) {
    if (!/^[0-7]{3}$/.test(oct)) return null;
    const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    return '-' + map[+oct[0]] + map[+oct[1]] + map[+oct[2]];
  }

  function executeCliCommand(rawCmd) {
    const cmd = rawCmd.trim().replace(/^sudo\s+/, '');
    appendTerm(`root@srv-lab-01:~# ${rawCmd}`, 'term-line-cmd');
    if (!cmd) return;

    SoundFX.terminal();
    const parts = cmd.split(/\s+/);
    const bin = parts[0];

    if (bin === 'clear') {
      initTerminalWelcome();
      return;
    }

    if (bin === 'help') {
      appendTerm(
`คำสั่งที่รองรับในห้องแล็บจำลองนี้:
  whoami, hostname, uname -a       ตรวจสอบข้อมูลผู้ใช้และระบบปฏิบัติการ
  ip a | ip addr | ifconfig        ตรวจสอบหมายเลข IP และการ์ดเครือข่าย
  ping <host>                      ทดสอบการเชื่อมต่อเครือข่าย
  systemctl status|start|stop|restart|enable <service>
                                   จัดการบริการ (nginx, ssh, mysql, ufw)
  df -h / free -h                  ตรวจสอบพื้นที่ดิสก์และหน่วยความจำ RAM
  ls / ls -l / ls -la              แสดงรายชื่อไฟล์และสิทธิ์การเข้าถึง
  chmod <mode> <file>              เปลี่ยนสิทธิ์ไฟล์ (เช่น chmod 600 secret.key)
  ufw status / ufw allow <port>    ตรวจสอบและเปิดพอร์ต Firewall
  useradd <name> / id <name>       สร้างและตรวจสอบบัญชีผู้ใช้
  ss -tulnp                        ตรวจสอบพอร์ตที่เปิดฟังอยู่
  clear                            ล้างหน้าจอ Terminal`, 'term-line-muted');
    } else if (bin === 'whoami') {
      appendTerm(simServer.user);
    } else if (bin === 'hostname') {
      appendTerm(simServer.hostname);
    } else if (bin === 'uname') {
      appendTerm('Linux srv-lab-01 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux');
    } else if (bin === 'ip' && (parts[1] === 'a' || parts[1] === 'addr')) {
      appendTerm(
`1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500
    inet ${simServer.ip} brd 192.168.10.255 scope global static eth0`);
    } else if (bin === 'ifconfig') {
      appendTerm(`eth0: flags=4163<UP,BROADCAST,RUNNING>\n        inet 192.168.10.10  netmask 255.255.255.0  broadcast 192.168.10.255`);
    } else if (bin === 'ping') {
      const target = parts[1] || '8.8.8.8';
      appendTerm(
`PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=58 time=12.4 ms
64 bytes from ${target}: icmp_seq=2 ttl=58 time=11.9 ms
--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss`, 'term-line-ok');
    } else if (bin === 'systemctl') {
      const action = parts[1];
      const svc = parts[2];
      if (!svc || !(svc in simServer.services)) {
        appendTerm(`Unit ${svc || '(none)'}.service could not be found. (ลองใช้ nginx, ssh, mysql, ufw)`, 'term-line-err');
      } else if (action === 'status') {
        const st = simServer.services[svc];
        appendTerm(
`● ${svc}.service - ${svc.toUpperCase()} Server Daemon
     Loaded: loaded (/lib/systemd/system/${svc}.service; enabled)
     Active: ${st === 'active' ? 'active (running)' : 'inactive (dead)'}`, st === 'active' ? 'term-line-ok' : 'term-line-err');
      } else if (action === 'start' || action === 'restart') {
        simServer.services[svc] = 'active';
        appendTerm(`Service ${svc}.service is now active (running).`, 'term-line-ok');
      } else if (action === 'stop') {
        simServer.services[svc] = 'inactive';
        appendTerm(`Service ${svc}.service stopped.`, 'term-line-muted');
      } else if (action === 'enable') {
        if (parts.includes('--now')) simServer.services[svc] = 'active';
        appendTerm(`Created symlink /etc/systemd/system/multi-user.target.wants/${svc}.service.`, 'term-line-ok');
      } else {
        appendTerm(`Unknown systemctl action: ${action}`, 'term-line-err');
      }
    } else if (bin === 'df') {
      appendTerm(
`Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   18G   30G  38% /
/dev/sdb1       200G  142G   48G  75% /var/www
tmpfs           4.0G   12M  4.0G   1% /run`);
    } else if (bin === 'free') {
      appendTerm(
`               total        used        free      shared  buff/cache   available
Mem:           8.0Gi       2.1Gi       3.4Gi       120Mi       2.5Gi       5.6Gi
Swap:          2.0Gi          0B       2.0Gi`);
    } else if (bin === 'ls') {
      const longFmt = parts.some((p) => p.startsWith('-') && p.includes('l'));
      if (longFmt) {
        const lines = Object.entries(simServer.files).map(
          ([fname, perm]) => `${perm} 1 root admin 2048 Nov 20 10:00 ${fname}`
        );
        appendTerm(`total 12\n${lines.join('\n')}`);
      } else {
        appendTerm(Object.keys(simServer.files).join('   '));
      }
    } else if (bin === 'chmod') {
      const mode = parts[1];
      const file = parts[2];
      const sym = octalToSym(mode);
      if (!sym) {
        appendTerm('Usage: chmod <3-digit-octal> <filename> (เช่น chmod 600 secret.key)', 'term-line-err');
      } else if (!(file in simServer.files)) {
        appendTerm(`chmod: cannot access '${file}': No such file or directory`, 'term-line-err');
      } else {
        simServer.files[file] = sym;
        appendTerm(`Updated permissions of '${file}' -> ${sym} (${mode})`, 'term-line-ok');
      }
    } else if (bin === 'ufw') {
      if (parts[1] === 'status') {
        appendTerm(`Status: active\n\nTo                         Action      From\n--                         ------      ----\n${simServer.firewall.map((r) => r.padEnd(27) + 'ALLOW       Anywhere').join('\n')}`);
      } else if (parts[1] === 'allow') {
        const target = (parts[2] || '').toLowerCase();
        let rule = null;
        if (target === '443' || target === '443/tcp' || target === 'https') rule = '443/tcp (HTTPS)';
        else if (target === '80' || target === '80/tcp' || target === 'http') rule = '80/tcp (HTTP)';
        else if (target === '22' || target === '22/tcp' || target === 'ssh') rule = '22/tcp (SSH)';
        else if (/^\d+$/.test(target)) rule = `${target}/tcp`;

        if (!rule) {
          appendTerm('Usage: ufw allow <port/service> (เช่น ufw allow 443)', 'term-line-err');
        } else {
          if (!simServer.firewall.includes(rule)) simServer.firewall.push(rule);
          appendTerm(`Rule added: ALLOW ${rule}`, 'term-line-ok');
        }
      } else {
        appendTerm('รองรับคำสั่ง: ufw status และ ufw allow <port>', 'term-line-err');
      }
    } else if (bin === 'useradd' || bin === 'adduser') {
      const uname = parts[1];
      if (!uname) {
        appendTerm('Usage: useradd <username> (เช่น useradd student01)', 'term-line-err');
      } else if (simServer.users.includes(uname)) {
        appendTerm(`useradd: user '${uname}' already exists`, 'term-line-err');
      } else {
        simServer.users.push(uname);
        appendTerm(`User '${uname}' created successfully (uid=1002, gid=1002).`, 'term-line-ok');
      }
    } else if (bin === 'id') {
      const uname = parts[1] || 'root';
      if (simServer.users.includes(uname)) {
        appendTerm(`uid=1002(${uname}) gid=1002(${uname}) groups=1002(${uname}),users`);
      } else {
        appendTerm(`id: '${uname}': no such user`, 'term-line-err');
      }
    } else if (bin === 'cat' && parts[1] === '/etc/passwd') {
      appendTerm(simServer.users.map((u, i) => `${u}:x:${i === 0 ? 0 : 1000 + i}:1000::/home/${u}:/bin/bash`).join('\n'));
    } else if (bin === 'ss' || bin === 'netstat') {
      appendTerm(
`Netid  State   Local Address:Port   Process
tcp    LISTEN  0.0.0.0:22           users:(("sshd"))
tcp    LISTEN  0.0.0.0:80           users:(("nginx"))
tcp    LISTEN  127.0.0.1:3306       users:(("mysqld"))`);
    } else {
      appendTerm(`bash: ${bin}: command not found — พิมพ์ 'help' เพื่อดูรายการคำสั่งที่รองรับ`, 'term-line-err');
    }

    // Check lab completion (current lab or any uncompleted lab satisfied by this command)
    let passedAny = false;
    CLI_LABS.forEach((lab) => {
      if (!state.completedLabs.includes(lab.id) && lab.check(cmd, simServer)) {
        state.completedLabs.push(lab.id);
        recordAnalytics(lab.category, true);
        awardXp(lab.xp);
        appendTerm(`\n✅ [LAB PASSED] ยินดีด้วย! คุณผ่าน "${lab.title}" (+${lab.xp} XP)\n`, 'term-line-ok');
        showToast(`💻 ผ่าน ${lab.title} (+${lab.xp} XP)`);
        passedAny = true;
      }
    });

    if (passedAny) {
      const nextIdx = CLI_LABS.findIndex((l) => !state.completedLabs.includes(l.id));
      if (nextIdx !== -1) currentLabIdx = nextIdx;
      renderLabSidebar();
    } else {
      const activeLab = CLI_LABS[currentLabIdx];
      if (activeLab && state.completedLabs.includes(activeLab.id) && activeLab.check(cmd, simServer)) {
        appendTerm(`✓ คำสั่งถูกต้องตามโจทย์ ${activeLab.title}`, 'term-line-ok');
      }
    }
  }

  $('terminalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('terminalInput');
    const val = input.value;
    if (val.trim()) {
      cmdHistory.push(val);
      historyPtr = cmdHistory.length;
    }
    executeCliCommand(val);
    input.value = '';
  });

  $('terminalInput').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && historyPtr > 0) {
      e.preventDefault();
      historyPtr -= 1;
      $('terminalInput').value = cmdHistory[historyPtr];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPtr < cmdHistory.length - 1) {
        historyPtr += 1;
        $('terminalInput').value = cmdHistory[historyPtr];
      } else {
        historyPtr = cmdHistory.length;
        $('terminalInput').value = '';
      }
    }
  });

  $('labHintBtn').addEventListener('click', () => {
    SoundFX.click();
    $('labHintBox').classList.toggle('hidden');
  });

  $('labResetBtn').addEventListener('click', () => {
    SoundFX.click();
    initTerminalWelcome();
  });

  /* ==================== MODE 3: PORT & SERVICE RUSH ==================== */
  let portIsTimed = true;
  let portTimeLeft = 60;
  let portScore = 0;
  let portCombo = 1;
  let portMaxCombo = 1;
  let portCorrect = 0;
  let portAttempts = 0;
  let currentPortCard = null;
  let portLock = false;

  function updatePortHud() {
    $('portScore').textContent = portScore.toLocaleString();
    $('portCombo').textContent = `x${portCombo}`;
    $('portTimer').textContent = portIsTimed ? `${portTimeLeft}s` : '∞';
    const acc = portAttempts === 0 ? 100 : Math.round((portCorrect / portAttempts) * 100);
    $('portAccuracy').textContent = `${acc}%`;
  }

  function startPortRush(timed) {
    SoundFX.click();
    clearInterval(portTimerId);
    portIsTimed = timed;
    portTimeLeft = 60;
    portScore = 0;
    portCombo = 1;
    portMaxCombo = 1;
    portCorrect = 0;
    portAttempts = 0;
    portLock = false;

    $('portIntroState').classList.add('hidden');
    $('portResultState').classList.add('hidden');
    $('portPlayState').classList.remove('hidden');
    $('portMiniFeedback').textContent = '';

    updatePortHud();
    nextPortQuestion();

    if (timed) {
      portTimerId = setInterval(() => {
        portTimeLeft -= 1;
        updatePortHud();
        if (portTimeLeft <= 0) {
          finishPortRush();
        }
      }, 1000);
    }
  }

  function nextPortQuestion() {
    portLock = false;
    currentPortCard = PORT_CARDS[Math.floor(Math.random() * PORT_CARDS.length)];
    $('packetLayer').textContent = currentPortCard.layer;
    $('packetPrompt').textContent = currentPortCard.prompt;
    $('packetSub').textContent = currentPortCard.sub;

    const distractors = shuffle(PORT_CARDS.filter((c) => c.port !== currentPortCard.port)).slice(0, 3);
    const choices = shuffle([currentPortCard, ...distractors]);

    const grid = $('portChoices');
    grid.innerHTML = '';
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'port-choice-btn';
      btn.innerHTML = `
        <span class="port-choice-num">Port ${choice.port}</span>
        <span class="port-choice-proto">${choice.proto}</span>
      `;
      btn.addEventListener('click', () => handlePortChoice(choice, btn));
      grid.appendChild(btn);
    });
  }

  function handlePortChoice(choice, btn) {
    if (portLock) return;
    portLock = true;
    portAttempts += 1;

    const isCorrect = choice.port === currentPortCard.port;
    recordAnalytics('network', isCorrect);
    const fb = $('portMiniFeedback');

    if (isCorrect) {
      SoundFX.correct();
      const gained = 100 * portCombo;
      portScore += gained;
      portCorrect += 1;
      portCombo = Math.min(5, portCombo + 1);
      portMaxCombo = Math.max(portMaxCombo, portCombo);
      btn.style.borderColor = 'var(--accent)';
      btn.style.background = 'rgba(52, 211, 153, 0.2)';
      fb.style.color = 'var(--accent)';
      fb.textContent = `✅ ถูกต้อง! Port ${currentPortCard.port} (${currentPortCard.proto}) +${gained} คะแนน`;
    } else {
      SoundFX.wrong();
      portCombo = 1;
      btn.style.borderColor = 'var(--danger)';
      btn.style.background = 'rgba(248, 113, 113, 0.2)';
      fb.style.color = 'var(--danger)';
      fb.textContent = `❌ คำตอบที่ถูกคือ Port ${currentPortCard.port} (${currentPortCard.proto})`;
    }

    updatePortHud();
    setTimeout(() => {
      if (!portIsTimed || portTimeLeft > 0) nextPortQuestion();
    }, 650);
  }

  function finishPortRush() {
    clearInterval(portTimerId);
    $('portPlayState').classList.add('hidden');
    $('portResultState').classList.remove('hidden');

    const xpEarned = Math.min(120, Math.round(portScore / 20));
    if (portScore > state.portHighScore) {
      state.portHighScore = portScore;
    }
    if (xpEarned > 0) awardXp(xpEarned);
    else saveState();

    $('portFinalScore').textContent = portScore.toLocaleString();
    $('portFinalCorrect').textContent = `${portCorrect} / ${portAttempts}`;
    $('portFinalMaxCombo').textContent = `x${portMaxCombo}`;
    $('portFinalXp').textContent = `+${xpEarned} XP`;
    SoundFX.levelUp();
  }

  $('portStartTimedBtn').addEventListener('click', () => startPortRush(true));
  $('portBigStartBtn').addEventListener('click', () => startPortRush(true));
  $('portStartPracticeBtn').addEventListener('click', () => startPortRush(false));
  $('portBigPracticeBtn').addEventListener('click', () => startPortRush(false));
  $('portPlayAgainBtn').addEventListener('click', () => startPortRush(portIsTimed));

  /* ==================== MODE 4: CODEX (CHMOD & RAID TOOLS) ==================== */
  function updateChmodTool() {
    const vals = { u: 0, g: 0, o: 0 };
    document.querySelectorAll('.chmod-cb').forEach((cb) => {
      if (cb.checked) vals[cb.dataset.role] += Number(cb.dataset.val);
    });
    const mode = `${vals.u}${vals.g}${vals.o}`;
    $('chmodU').textContent = vals.u;
    $('chmodG').textContent = vals.g;
    $('chmodO').textContent = vals.o;
    $('chmodCmdOutput').textContent = `chmod ${mode} server.sh`;
    $('chmodSymOutput').textContent = octalToSym(mode);

    const tips = {
      '755': 'เหมาะสำหรับสคริปต์และโฟลเดอร์เว็บ: เจ้าของแก้ไขได้เต็มที่ ส่วนกลุ่มและผู้อื่นอ่านและรันได้อย่างปลอดภัย',
      '644': 'เหมาะสำหรับไฟล์เอกสารและไฟล์ตั้งค่า (เช่น .conf, .html): เจ้าของแก้ไขได้ คนอื่นอ่านได้อย่างเดียว',
      '600': 'ปลอดภัยสูงสุดสำหรับไฟล์ความลับ เช่น SSH Private Key และไฟล์เก็บรหัสผ่านฐานข้อมูล',
      '700': 'เหมาะสำหรับโฟลเดอร์ส่วนตัวของผู้ดูแลระบบ ห้ามกลุ่มและคนอื่นเข้ามายุ่ง',
      '777': '⚠️ อันตรายมาก! อนุญาตให้ทุกคนแก้ไขและรันไฟล์ได้ ไม่ควรใช้บน Server จริงเด็ดขาด'
    };
    $('chmodExplain').textContent =
      tips[mode] || `Owner=${vals.u}, Group=${vals.g}, Others=${vals.o} (Read=4, Write=2, Execute=1)`;
  }

  function setChmodMode(modeStr) {
    const digits = { u: +modeStr[0], g: +modeStr[1], o: +modeStr[2] };
    document.querySelectorAll('.chmod-cb').forEach((cb) => {
      const d = digits[cb.dataset.role];
      const v = Number(cb.dataset.val);
      cb.checked = Boolean(d & v);
    });
    updateChmodTool();
  }

  function renderRaidTool(level) {
    const info = RAID_INFO[level];
    document.querySelectorAll('.raid-tab').forEach((btn) => {
      const active = btn.dataset.raid === level;
      btn.className = `btn btn-sm raid-tab ${active ? 'btn-primary' : 'btn-ghost'}`;
    });

    const vis = $('raidVisual');
    vis.innerHTML = '';
    info.disks.forEach((d) => {
      const col = document.createElement('div');
      col.className = 'raid-disk';
      col.innerHTML = `<div class="raid-disk-title">${d.name}</div>` +
        d.blocks.map((b) => `<div class="raid-block ${b.cls}">${b.label}</div>`).join('');
      vis.appendChild(col);
    });

    $('raidDetails').innerHTML = `
      <div><strong>${info.name}</strong> (ใช้ดิสก์อย่างน้อย ${info.minDisks} ลูก)</div>
      <div>• <strong>พื้นที่ใช้งานได้:</strong> ${info.usable}</div>
      <div>• <strong>ความทนทานต่อดิสก์เสีย:</strong> ${info.faultTolerance}</div>
      <div>• <strong>ประสิทธิภาพความเร็ว:</strong> ${info.speed}</div>
      <div>• <strong>งานที่เหมาะสม:</strong> ${info.useCase}</div>
    `;
  }

  function renderCodexChapters() {
    const wrap = $('codexChapters');
    wrap.innerHTML = '';
    CODEX_CHAPTERS.forEach((ch) => {
      const card = document.createElement('article');
      card.className = 'codex-card';
      card.innerHTML = `
        <h4>${ch.title}</h4>
        <ul>${ch.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      `;
      wrap.appendChild(card);
    });
  }

  document.querySelectorAll('.chmod-cb').forEach((cb) => cb.addEventListener('change', () => {
    SoundFX.click();
    updateChmodTool();
  }));

  document.querySelectorAll('.chmod-preset').forEach((btn) => btn.addEventListener('click', () => {
    SoundFX.click();
    setChmodMode(btn.dataset.mode);
  }));

  document.querySelectorAll('.raid-tab').forEach((btn) => btn.addEventListener('click', () => {
    SoundFX.click();
    renderRaidTool(btn.dataset.raid);
  }));

  /* ==================== MODE 5: CERTIFICATION EXAM & CERTIFICATE ==================== */
  let examQuestions = [];
  let examIdx = 0;
  let examAnswers = [];
  let examSelected = null;

  function startExam() {
    SoundFX.click();
    examQuestions = shuffle(EXAM_BANK).slice(0, 10);
    examIdx = 0;
    examAnswers = [];
    examSelected = null;

    $('examIntro').classList.add('hidden');
    $('examResult').classList.add('hidden');
    $('examRunner').classList.remove('hidden');
    renderExamQuestion();
  }

  function renderExamQuestion() {
    examSelected = null;
    $('examNextBtn').disabled = true;
    const q = examQuestions[examIdx];
    $('examCategory').textContent = CATEGORIES[q.category];
    $('examProgressText').textContent = `ข้อที่ ${examIdx + 1} / ${examQuestions.length}`;
    $('examProgressBar').style.width = `${((examIdx + 1) / examQuestions.length) * 100}%`;
    $('examQuestionText').textContent = `${examIdx + 1}. ${q.q}`;
    $('examNextBtn').textContent = examIdx === examQuestions.length - 1 ? 'ส่งข้อสอบ ✓' : 'ข้อถัดไป →';

    const opts = $('examOptions');
    opts.innerHTML = '';
    const letters = ['ก', 'ข', 'ค', 'ง'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="opt-key">${letters[i]}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => {
        SoundFX.click();
        examSelected = i;
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
    const reviewEl = $('examReviewList');
    reviewEl.innerHTML = '';

    examQuestions.forEach((q, idx) => {
      const userAns = examAnswers[idx];
      const ok = userAns === q.answer;
      recordAnalytics(q.category, ok);
      if (ok) score += 1;

      const item = document.createElement('div');
      item.className = `review-item ${ok ? 'ok' : 'err'}`;
      item.innerHTML = `
        <div><strong>${ok ? '✅' : '❌'} ข้อ ${idx + 1}:</strong> ${q.q}</div>
        <div class="muted-text" style="margin-top:0.25rem;">
          คำตอบที่ถูกต้อง: <strong>${q.options[q.answer]}</strong> — ${q.explain}
        </div>
      `;
      reviewEl.appendChild(item);
    });

    const pct = Math.round((score / examQuestions.length) * 100);
    const passed = pct >= 70;
    $('examScoreCircle').textContent = `${score}/${examQuestions.length}`;
    $('examScoreCircle').style.borderColor = passed ? 'var(--accent)' : 'var(--danger)';
    $('examScoreCircle').style.color = passed ? 'var(--accent)' : 'var(--danger)';

    if (score > state.examBestScore) state.examBestScore = score;
    if (passed) {
      state.examPassed = true;
      awardXp(150);
      SoundFX.levelUp();
      $('examResultHeading').textContent = '🎉 ยินดีด้วย! คุณสอบผ่านเกณฑ์รับเกียรติบัตร';
      $('examResultSub').textContent = `คะแนน ${score}/${examQuestions.length} (${pct}%) — สามารถพิมพ์หรือบันทึกเกียรติบัตรเป็น PDF ได้ทันที`;
      $('printCertBtn').classList.remove('hidden');
      $('certificateCard').classList.remove('hidden');

      const name = $('studentNameInput').value.trim() || 'ผู้เรียน ServerOps Academy';
      const sid = $('studentIdInput').value.trim();
      $('certStudentName').textContent = name;
      $('certStudentId').textContent = sid ? `รหัสนักศึกษา / ห้องเรียน: ${sid}` : '';
      $('certScore').textContent = `${score}/${examQuestions.length} (${pct}%)`;
      $('certDate').textContent = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      saveState();
      SoundFX.wrong();
      $('examResultHeading').textContent = 'ยังไม่ผ่านเกณฑ์ (ต้องได้ 70% ขึ้นไป)';
      $('examResultSub').textContent = `คะแนน ${score}/${examQuestions.length} (${pct}%) — ลองทบทวนในคลังความรู้แล้วสอบใหม่อีกครั้ง!`;
      $('printCertBtn').classList.add('hidden');
      $('certificateCard').classList.add('hidden');
    }
    renderHeaderAndDashboard();
  }

  $('startExamBtn').addEventListener('click', startExam);
  $('examNextBtn').addEventListener('click', () => {
    examAnswers.push(examSelected);
    if (examIdx < examQuestions.length - 1) {
      examIdx += 1;
      renderExamQuestion();
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

  /* ==================== GLOBAL BINDINGS & INIT ==================== */
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', () => switchView(el.dataset.goto));
  });

  $('brandHomeBtn').addEventListener('click', () => switchView('dashboard'));
  $('brandHomeBtn').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') switchView('dashboard');
  });

  $('themeToggleBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveState();
    SoundFX.click();
  });

  $('soundToggleBtn').addEventListener('click', () => {
    state.sound = !state.sound;
    applySound();
    saveState();
    if (state.sound) SoundFX.click();
  });

  $('resetProgressBtn').addEventListener('click', () => {
    if (confirm('ต้องการล้างข้อมูลคะแนน XP ความก้าวหน้า และเหรียญตราทั้งหมดใช่หรือไม่?')) {
      const keepTheme = state.theme;
      const keepSound = state.sound;
      state = defaultState();
      state.theme = keepTheme;
      state.sound = keepSound;
      saveState();
      renderHeaderAndDashboard();
      renderMissionGrid();
      renderLabSidebar();
      showToast('รีเซ็ตความก้าวหน้าเรียบร้อยแล้ว');
    }
  });

  // Boot up
  applyTheme();
  applySound();
  initTerminalWelcome();
  renderCodexChapters();
  updateChmodTool();
  renderRaidTool('5');
  renderHeaderAndDashboard();
  renderMissionGrid();
  renderLabSidebar();
})();
