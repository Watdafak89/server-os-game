/* ServerOps: Realistic Oracle VM VirtualBox 7.x — Full OS Installation & Interactive Bootable OS Simulator */
const VBoxSim = (() => {
  const OS_MISSIONS = [
    {
      id: 'ubuntu24',
      name: 'Ubuntu Server 24.04 LTS',
      shortName: 'Ubuntu Server',
      icon: '🐧',
      badge: 'Linux • Subiquity TUI',
      osType: 'Linux',
      osVersion: 'Ubuntu (64-bit)',
      isoName: 'ubuntu-24.04-live-server-amd64.iso',
      minRam: 2048,
      minCpu: 2,
      minDisk: 20,
      needTpm: false,
      recNet: 'Bridged Adapter',
      xp: 120,
      coins: 90,
      brief: 'ติดตั้ง Ubuntu Server 24.04 LTS (RAM ≥ 2 GB, CPU ≥ 2, Disk ≥ 20 GB) แล้วบูตเข้าใช้งาน Console จริงได้!'
    },
    {
      id: 'winserv2022',
      name: 'Windows Server 2022 Datacenter',
      shortName: 'Windows Server 2022',
      icon: '🪟',
      badge: 'Windows • Server Manager',
      osType: 'Microsoft Windows',
      osVersion: 'Windows 2022 (64-bit)',
      isoName: 'SERVER_EVAL_x64FRE_en-us.iso',
      minRam: 4096,
      minCpu: 2,
      minDisk: 40,
      needTpm: false,
      recNet: 'Bridged Adapter',
      xp: 140,
      coins: 110,
      brief: 'ติดตั้ง Windows Server 2022 (Desktop Experience) แล้วบูตเข้าหน้า Desktop + Server Manager ติดตั้ง AD DS / DNS / IIS ได้จริง!'
    },
    {
      id: 'rocky9',
      name: 'Rocky Linux 9.4 Minimal',
      shortName: 'Rocky Linux 9',
      icon: '🏔️',
      badge: 'Linux • RHEL Anaconda',
      osType: 'Linux',
      osVersion: 'Red Hat (64-bit)',
      isoName: 'Rocky-9.4-x86_64-minimal.iso',
      minRam: 2048,
      minCpu: 2,
      minDisk: 20,
      needTpm: false,
      recNet: 'Bridged Adapter',
      xp: 130,
      coins: 100,
      brief: 'ติดตั้ง Rocky Linux 9 ผ่าน Anaconda Summary Hub แล้วบูตเข้าใช้งาน RHEL-compatible Terminal ได้จริง!'
    },
    {
      id: 'debian12',
      name: 'Debian 12 "Bookworm" Server',
      shortName: 'Debian 12',
      icon: '🌀',
      badge: 'Linux • Classic Ncurses',
      osType: 'Linux',
      osVersion: 'Debian (64-bit)',
      isoName: 'debian-12.7.0-amd64-netinst.iso',
      minRam: 1024,
      minCpu: 1,
      minDisk: 15,
      needTpm: false,
      recNet: 'NAT',
      xp: 120,
      coins: 90,
      brief: 'ติดตั้ง Debian 12 Headless Server ผ่าน tasksel แล้วบูตเข้าใช้งาน Debian TTY Console ได้จริง!'
    },
    {
      id: 'win11pro',
      name: 'Windows 11 Pro (Domain Client)',
      shortName: 'Windows 11 Pro',
      icon: '💻',
      badge: 'Windows • EFI + TPM 2.0',
      osType: 'Microsoft Windows',
      osVersion: 'Windows 11 (64-bit)',
      isoName: 'Win11_24H2_Thai_x64.iso',
      minRam: 4096,
      minCpu: 2,
      minDisk: 64,
      needTpm: true,
      recNet: 'Internal Network',
      xp: 140,
      coins: 110,
      brief: 'ติดตั้ง Windows 11 Pro (ต้องเปิด EFI + TPM 2.0) แล้วบูตเข้า Desktop ฝึก Join Domain "college.local" และเปิด Edge ได้จริง!'
    }
  ];

  const ALL_ISOS = [
    { file: '', label: '(Empty — ยังไม่ใส่แผ่น ISO)' },
    ...OS_MISSIONS.map((m) => ({ file: m.isoName, label: `💿 ${m.isoName} (${m.shortName})` }))
  ];

  const VM_STORAGE_KEY = 'serverops_vbox_vms_v1';

  let callbacks = {
    getInstalled: () => [],
    onMissionComplete: () => {},
    playSound: () => {},
    toast: () => {}
  };

  let activeMissionId = 'ubuntu24';
  let vms = loadVms();
  let selectedVmId = vms[0]?.id || null;
  let runningVm = null;
  let installerData = {};
  let installProgressTimer = null;

  const $ = (id) => document.getElementById(id);

  function loadVms() {
    try {
      const raw = localStorage.getItem(VM_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveVms() {
    try {
      localStorage.setItem(VM_STORAGE_KEY, JSON.stringify(vms));
    } catch {
      // ignore
    }
  }

  function getMission(id) {
    return OS_MISSIONS.find((m) => m.id === id) || OS_MISSIONS[0];
  }

  function getSelectedVm() {
    return vms.find((v) => v.id === selectedVmId) || null;
  }

  function init(opts) {
    callbacks = { ...callbacks, ...opts };
    render();
  }

  function render() {
    if (!$('vboxAppRoot')) return;
    renderMissionBar();
    renderManagerView();
  }

  function renderMissionBar() {
    const installed = callbacks.getInstalled();
    const chip = $('vboxProgressChip');
    if (chip) chip.textContent = `ติดตั้งสำเร็จ ${installed.length} / ${OS_MISSIONS.length} ระบบ`;

    const bar = $('vboxMissionPicker');
    if (!bar) return;
    bar.innerHTML = '';

    OS_MISSIONS.forEach((m) => {
      const done = installed.includes(m.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `vbox-mission-pill ${m.id === activeMissionId ? 'active' : ''} ${done ? 'done' : ''}`;
      btn.innerHTML = `
        <span>${m.icon} ${m.shortName}</span>
        <span class="vbox-pill-sub">${done ? '✅ ติดตั้งแล้ว' : m.badge}</span>
      `;
      btn.addEventListener('click', () => {
        callbacks.playSound('click');
        activeMissionId = m.id;
        renderMissionBar();
        renderChecklist();
      });
      bar.appendChild(btn);
    });
    renderChecklist();
  }

  function renderChecklist() {
    const m = getMission(activeMissionId);
    const vm = getSelectedVm();
    const installed = callbacks.getInstalled().includes(m.id);

    const step1Ok = Boolean(vm && vm.ram >= m.minRam && vm.cpu >= m.minCpu && vm.disk >= m.minDisk && (!m.needTpm || (vm.efi && vm.tpm)));
    const step2Ok = Boolean(vm && (vm.iso === m.isoName || vm.installedOsId === m.id));
    const step3Ok = Boolean(installed || (vm && vm.installedOsId === m.id));

    $('vboxBriefText').innerHTML = `<strong>${m.icon} โจทย์: ${m.name}</strong> — ${m.brief}`;
    $('vboxStepsBar').innerHTML = `
      <div class="vbox-step-item ${step1Ok ? 'ok' : ''}">
        <span>${step1Ok ? '✅' : '1️⃣'}</span> สร้าง VM (RAM ≥ ${m.minRam} MB, CPU ≥ ${m.minCpu}, Disk ≥ ${m.minDisk} GB${m.needTpm ? ', เปิด EFI+TPM 2.0' : ''})
      </div>
      <div class="vbox-step-item ${step2Ok ? 'ok' : ''}">
        <span>${step2Ok ? '✅' : '2️⃣'}</span> ใส่แผ่น ISO: <code>${m.isoName}</code>
      </div>
      <div class="vbox-step-item ${step3Ok ? 'ok' : ''}">
        <span>${step3Ok ? '✅' : '3️⃣'}</span> กด <strong>▶ Start</strong> ติดตั้งและบูตเข้าใช้งาน OS จริง (+${m.xp} XP, 💰${m.coins})
      </div>
    `;
  }

  /* ==================== ORACLE VM VIRTUALBOX MANAGER UI ==================== */
  function renderManagerView() {
    const listEl = $('vboxVmList');
    const detailEl = $('vboxVmDetails');
    if (!listEl || !detailEl) return;

    const sel = getSelectedVm();
    $('vboxSettingsBtn').disabled = !sel;
    $('vboxRemoveBtn').disabled = !sel;
    $('vboxStartBtn').disabled = !sel;
    $('vboxStartBtn').innerHTML = sel && sel.installedOsId
      ? '<span>▶️</span><small>Boot OS</small>'
      : '<span>▶️</span><small>Start</small>';

    if (!vms.length) {
      listEl.innerHTML = `
        <div class="vbox-empty-list">
          <div style="font-size:2rem;margin-bottom:0.35rem;">📦</div>
          <div>ยังไม่มีเครื่องเสมือน (VM)</div>
          <div style="font-size:0.75rem;opacity:0.75;margin-top:0.25rem;">กดปุ่ม <strong>➕ New</strong> ด้านบนเพื่อสร้าง VM ใหม่</div>
        </div>
      `;
    } else {
      listEl.innerHTML = '';
      vms.forEach((vm) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `vbox-vm-item ${vm.id === selectedVmId ? 'selected' : ''}`;
        item.innerHTML = `
          <div class="vbox-vm-icon">${vm.osType === 'Microsoft Windows' ? '🪟' : '🐧'}</div>
          <div class="vbox-vm-info">
            <strong>${vm.name}</strong>
            <span class="vbox-vm-state ${vm.installedOsId ? 'installed' : ''}">
              ${vm.installedOsId ? `🟢 Installed (${getMission(vm.installedOsId).shortName})` : '⚪ Powered Off'}
            </span>
          </div>
        `;
        item.addEventListener('click', () => {
          callbacks.playSound('click');
          selectedVmId = vm.id;
          renderManagerView();
          renderChecklist();
        });
        listEl.appendChild(item);
      });
    }

    if (!sel) {
      detailEl.innerHTML = `
        <div class="vbox-welcome-pane">
          <div class="vbox-cube-logo">🟦</div>
          <h3>Welcome to Oracle VM VirtualBox Manager</h3>
          <p>จำลองการสร้าง Virtual Machine, แบ่งสเปก RAM/CPU/VDI/EFI/TPM 2.0, ตั้งค่า Network และฝึกติดตั้ง Linux / Windows Server — <strong>เมื่อติดตั้งเสร็จสามารถบูตเข้าใช้งานหน้าจอ OS จริงได้ทันที!</strong></p>
          <button type="button" class="btn btn-neon" id="vboxQuickNewBtn">➕ สร้าง Virtual Machine ใหม่ (New VM)</button>
        </div>
      `;
      $('vboxQuickNewBtn')?.addEventListener('click', openNewVmModal);
    } else {
      const osStateHtml = sel.installedOsId
        ? `<div class="vbox-ready-banner">
            <div>✅ ติดตั้ง <strong>${getMission(sel.installedOsId).name}</strong> บนดิสก์ <code>${sel.name}.vdi</code> เรียบร้อยแล้ว!</div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;">
              <button type="button" class="btn btn-neon btn-sm" id="vboxBootInstalledBtn">🚀 บูตเข้าหน้าจอ OS จริง (Boot OS)</button>
              <button type="button" class="btn btn-ghost btn-xs" id="vboxReinstallBtn">💿 ล้างดิสก์ติดตั้งใหม่ (Reinstall)</button>
            </div>
          </div>`
        : '';

      detailEl.innerHTML = `
        ${osStateHtml}
        <div class="vbox-detail-card">
          <div class="vbox-detail-head">🔧 General</div>
          <div class="vbox-kv"><span>Name:</span><strong>${sel.name}</strong></div>
          <div class="vbox-kv"><span>Operating System:</span><span>${sel.osVersion}</span></div>
        </div>
        <div class="vbox-detail-card">
          <div class="vbox-detail-head">⚙️ System</div>
          <div class="vbox-kv"><span>Base Memory:</span><strong>${sel.ram} MB</strong></div>
          <div class="vbox-kv"><span>Processors:</span><strong>${sel.cpu} vCPU</strong></div>
          <div class="vbox-kv"><span>Firmware / Security:</span><span>${sel.efi ? 'EFI Enabled' : 'Legacy BIOS'} ${sel.tpm ? '• TPM v2.0 ✓' : ''}</span></div>
        </div>
        <div class="vbox-detail-card">
          <div class="vbox-detail-head">💾 Storage</div>
          <div class="vbox-kv"><span>Controller: SATA (Port 0):</span><span>${sel.name}.vdi (${sel.disk} GB, Dynamically allocated)</span></div>
          <div class="vbox-kv"><span>Controller: IDE (Optical Drive):</span><strong style="color:${sel.iso ? '#34d399' : '#f87171'}">${sel.iso || '[Empty — กรุณาใส่ ISO ใน Settings]'}</strong></div>
        </div>
        <div class="vbox-detail-card">
          <div class="vbox-detail-head">🌐 Network</div>
          <div class="vbox-kv"><span>Adapter 1:</span><strong>${sel.network}</strong> (Intel PRO/1000 MT Desktop)</div>
        </div>
      `;

      $('vboxBootInstalledBtn')?.addEventListener('click', () => startSelectedVm(false));
      $('vboxReinstallBtn')?.addEventListener('click', () => {
        if (confirm(`ต้องการล้างดิสก์และจำลองติดตั้ง OS ใหม่บน "${sel.name}" ใช่หรือไม่?`)) {
          sel.installedOsId = null;
          saveVms();
          startSelectedVm(true);
        }
      });
    }
    renderChecklist();
  }

  /* ==================== NEW VM WIZARD & SETTINGS MODAL ==================== */
  function openNewVmModal() {
    callbacks.playSound('click');
    const m = getMission(activeMissionId);
    $('vboxModalTitle').textContent = '➕ Create Virtual Machine (VirtualBox Wizard)';
    $('vboxModalSaveBtn').textContent = '✅ สร้างเครื่อง VM (Finish)';
    $('vboxModalForm').dataset.mode = 'new';

    $('vmNameInp').value = m.id === 'ubuntu24' ? 'SRV-Ubuntu24'
      : m.id === 'winserv2022' ? 'SRV-Win2022-DC'
      : m.id === 'rocky9' ? 'SRV-Rocky9'
      : m.id === 'debian12' ? 'SRV-Debian12'
      : 'CLIENT-Win11';
    $('vmOsTypeInp').value = m.osType;
    $('vmOsVerInp').value = m.osVersion;
    $('vmRamInp').value = m.minRam;
    $('vmRamVal').textContent = `${m.minRam} MB`;
    $('vmCpuInp').value = m.minCpu;
    $('vmDiskInp').value = m.minDisk;
    $('vmNetInp').value = m.recNet;
    $('vmIsoInp').value = m.isoName;
    $('vmEfiInp').checked = m.needTpm;
    $('vmTpmInp').checked = m.needTpm;

    $('vboxModal').classList.remove('hidden');
  }

  function openSettingsModal() {
    const sel = getSelectedVm();
    if (!sel) return;
    callbacks.playSound('click');
    $('vboxModalTitle').textContent = `⚙️ ${sel.name} — Settings`;
    $('vboxModalSaveBtn').textContent = '💾 บันทึกการตั้งค่า (OK)';
    $('vboxModalForm').dataset.mode = 'edit';

    $('vmNameInp').value = sel.name;
    $('vmOsTypeInp').value = sel.osType;
    $('vmOsVerInp').value = sel.osVersion;
    $('vmRamInp').value = sel.ram;
    $('vmRamVal').textContent = `${sel.ram} MB`;
    $('vmCpuInp').value = sel.cpu;
    $('vmDiskInp').value = sel.disk;
    $('vmNetInp').value = sel.network;
    $('vmIsoInp').value = sel.iso;
    $('vmEfiInp').checked = sel.efi;
    $('vmTpmInp').checked = sel.tpm;

    $('vboxModal').classList.remove('hidden');
  }

  function closeModal() {
    $('vboxModal').classList.add('hidden');
  }

  /* ==================== BOOT VM (INSTALL OR LIVE INSTALLED OS!) ==================== */
  function startSelectedVm(forceInstall = false) {
    const vm = getSelectedVm();
    if (!vm) return;
    callbacks.playSound('shield');
    runningVm = vm;
    installerData = {
      hostname: vm.osState?.hostname || vm.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      username: vm.osState?.username || 'admin',
      ipMode: vm.osState?.ipMode || 'Static (192.168.10.10/24)',
      installSsh: vm.osState?.installSsh ?? true,
      winEdition: vm.osState?.winEdition || 'Datacenter Evaluation (Desktop Experience)',
      partitionCreated: false,
      rockyDestDone: false,
      rockyRootDone: false,
      rockyNetDone: false,
      debianSsh: true,
      debianGui: false
    };

    $('vboxManagerFrame').classList.add('hidden');
    $('vboxGuestFrame').classList.remove('hidden');
    $('vboxGuestTitle').textContent = `${vm.name} [Running] — Oracle VM VirtualBox`;
    $('vboxLedIso').textContent = vm.iso ? `💿 ${vm.iso}` : '💿 Empty';
    $('vboxLedNet').textContent = `🌐 ${vm.network}`;

    if (vm.installedOsId && !forceInstall) {
      bootInstalledOs(vm);
    } else {
      renderBiosBoot();
    }
  }

  function powerOffVm() {
    clearInterval(installProgressTimer);
    installProgressTimer = null;
    runningVm = null;
    saveVms();
    $('vboxGuestFrame').classList.add('hidden');
    $('vboxManagerFrame').classList.remove('hidden');
    renderManagerView();
  }

  function setGuestScreen(html, themeClass = 'guest-bios') {
    const scr = $('vboxGuestScreen');
    scr.className = `vbox-guest-screen ${themeClass}`;
    scr.innerHTML = html;
  }

  function renderBiosBoot() {
    const vm = runningVm;
    setGuestScreen(`
      <div class="bios-splash">
        <div class="bios-logo">Oracle VM VirtualBox</div>
        <div class="bios-sub">VirtualBox BIOS v7.0 • Base Memory: ${vm.ram} MB • ${vm.cpu} vCPU • ${vm.efi ? 'UEFI Mode' : 'Legacy BIOS'}</div>
        <div class="bios-bar"><div class="bios-bar-fill"></div></div>
        <div class="bios-hint">Booting from Optical Drive (${vm.iso || 'Empty'})...</div>
      </div>
    `, 'guest-bios');

    setTimeout(() => {
      if (!runningVm) return;
      if (!vm.iso) {
        callbacks.playSound('wrong');
        setGuestScreen(`
          <div class="bios-fatal">
            <div>Oracle VM VirtualBox — Virtual Machine Boot Error</div><br/>
            <div style="color:#f87171;font-weight:700;">FATAL: No bootable medium found! System halted.</div><br/>
            <div style="color:#cbd5e1;">💡 สาเหตุ: คุณยังไม่ได้ใส่ไฟล์แผ่นติดตั้ง (.iso) ใน Optical Drive!</div>
            <div style="color:#94a3b8;">วิธีแก้: กดปิดเครื่อง → กด ⚙️ Settings → เลือกไฟล์ .iso แล้วกด ▶ Start ใหม่</div><br/>
            <button type="button" class="btn btn-secondary btn-sm" id="fatalBackBtn">🔌 ปิดเครื่องกลับไปใส่แผ่น ISO</button>
          </div>
        `, 'guest-bios');
        $('fatalBackBtn')?.addEventListener('click', powerOffVm);
        return;
      }

      const osMission = OS_MISSIONS.find((m) => m.isoName === vm.iso);
      if (!osMission) return;
      activeMissionId = osMission.id;
      renderMissionBar();

      if (vm.ram < osMission.minRam || vm.disk < osMission.minDisk) {
        callbacks.playSound('wrong');
        setGuestScreen(`
          <div class="bios-fatal">
            <div style="color:#fbbf24;font-weight:700;">⚠️ HARDWARE REQUIREMENT ERROR (${osMission.name})</div><br/>
            <div>• RAM ปัจจุบัน: ${vm.ram} MB (ต้องการอย่างน้อย ${osMission.minRam} MB)</div>
            <div>• Disk ปัจจุบัน: ${vm.disk} GB (ต้องการอย่างน้อย ${osMission.minDisk} GB)</div><br/>
            <button type="button" class="btn btn-secondary btn-sm" id="specBackBtn">⚙️ ปิดเครื่องไปปรับสเปกใน Settings</button>
          </div>
        `, 'guest-bios');
        $('specBackBtn')?.addEventListener('click', powerOffVm);
        return;
      }

      if (osMission.needTpm && (!vm.efi || !vm.tpm)) {
        callbacks.playSound('wrong');
        setGuestScreen(`
          <div class="win-setup-box">
            <div class="win-setup-header">Windows 11 Setup</div>
            <div class="win-setup-body">
              <h3 style="color:#dc2626;margin-bottom:0.5rem;">This PC can't run Windows 11</h3>
              <p>This PC doesn't meet the minimum system requirements to install this version of Windows.</p>
              <div style="margin:0.85rem 0;padding:0.7rem;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#991b1b;font-size:0.86rem;">
                💡 <strong>บทเรียน VirtualBox:</strong> การลง Windows 11 ต้องเปิด <strong>Enable EFI</strong> และ <strong>TPM v2.0</strong> ในหน้า Settings ก่อนเสมอ!
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="tpmBackBtn">⚙️ ปิดเครื่องไปเปิด EFI + TPM 2.0</button>
            </div>
          </div>
        `, 'guest-win11');
        $('tpmBackBtn')?.addEventListener('click', powerOffVm);
        return;
      }

      if (osMission.id === 'ubuntu24') renderUbuntuStep(0);
      else if (osMission.id === 'winserv2022') renderWinServerStep(0);
      else if (osMission.id === 'rocky9') renderRockyStep(0);
      else if (osMission.id === 'debian12') renderDebianStep(0);
      else if (osMission.id === 'win11pro') renderWin11Step(0);
    }, 1050);
  }

  function completeOsInstallation(osId) {
    const m = getMission(osId);
    if (runningVm) {
      runningVm.installedOsId = osId;
      runningVm.osState = {
        hostname: installerData.hostname || runningVm.name.toLowerCase(),
        username: installerData.username || 'admin',
        ipMode: installerData.ipMode || 'Static (192.168.10.10/24)',
        ip: osId === 'winserv2022' ? '192.168.10.2' : (osId === 'win11pro' ? '192.168.10.50' : '192.168.10.10'),
        installSsh: Boolean(installerData.installSsh),
        winEdition: installerData.winEdition,
        packages: ['openssh-server'],
        winRoles: ['File and Storage Services'],
        adUsers: ['Administrator', 'somchai.k', 'student01'],
        domainJoined: false,
        domainName: 'WORKGROUP'
      };
      saveVms();
    }
    callbacks.onMissionComplete(m);
    callbacks.playSound('levelUp');
    renderMissionBar();

    setGuestScreen(`
      <div class="install-success-banner" style="max-width:620px;margin:0 auto;">
        <div style="font-size:2.4rem;margin-bottom:0.35rem;">${m.icon}🎉</div>
        <h3 style="margin-bottom:0.35rem;">ติดตั้ง ${m.name} สำเร็จสมบูรณ์!</h3>
        <p style="font-size:0.86rem;opacity:0.9;margin-bottom:1rem;">ระบบพร้อมบูตจาก Virtual Hard Disk (<code>${runningVm.name}.vdi</code>) แล้ว คุณสามารถเข้าใช้งานหน้าจอระบบปฏิบัติการจริงได้ทันที!</p>
        <div style="display:flex;gap:0.65rem;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="btn btn-neon" id="bootLiveOsNowBtn">🚀 บูตเข้าใช้งาน ${m.shortName} จริงตอนนี้!</button>
          <button type="button" class="btn btn-secondary btn-sm" id="osDoneBackBtn">🖥️ กลับหน้า VirtualBox Manager</button>
        </div>
      </div>
    `, 'guest-bios');

    $('bootLiveOsNowBtn')?.addEventListener('click', () => bootInstalledOs(runningVm));
    $('osDoneBackBtn')?.addEventListener('click', powerOffVm);
  }

  /* ==================== LIVE BOOTABLE OS EXPERIENCES ==================== */
  function bootInstalledOs(vm) {
    const osId = vm.installedOsId;
    const m = getMission(osId);
    if (!vm.osState) {
      vm.osState = {
        hostname: vm.name.toLowerCase(),
        username: 'admin',
        ip: osId === 'winserv2022' ? '192.168.10.2' : '192.168.10.10',
        packages: ['openssh-server'],
        winRoles: ['File and Storage Services'],
        adUsers: ['Administrator', 'somchai.k', 'student01'],
        domainJoined: false,
        domainName: 'WORKGROUP'
      };
    }

    setGuestScreen(`
      <div class="bios-splash">
        <div style="font-size:2.4rem;margin-bottom:0.4rem;">${m.icon}</div>
        <div class="bios-logo" style="font-size:1.35rem;">Booting ${m.name}...</div>
        <div class="bios-sub">Loading from SATA Port 0: ${vm.name}.vdi (${vm.ram} MB RAM • ${vm.network})</div>
        <div class="bios-bar"><div class="bios-bar-fill"></div></div>
      </div>
    `, 'guest-bios');

    setTimeout(() => {
      if (!runningVm) return;
      if (osId === 'ubuntu24' || osId === 'rocky9' || osId === 'debian12') {
        renderLiveLinuxLogin(vm);
      } else if (osId === 'winserv2022') {
        renderLiveWinServerLock(vm);
      } else if (osId === 'win11pro') {
        renderLiveWin11Lock(vm);
      }
    }, 900);
  }

  /* ---------- LIVE LINUX OS (UBUNTU / ROCKY / DEBIAN) TTY LOGIN & LIVE SHELL ---------- */
  function renderLiveLinuxLogin(vm) {
    const osId = vm.installedOsId;
    const banner = osId === 'ubuntu24' ? 'Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)'
      : osId === 'rocky9' ? 'Rocky Linux 9.4 (Blue Onyx) • Kernel 5.14.0-427.el9.x86_64'
      : 'Debian GNU/Linux 12 (bookworm) • Kernel 6.1.0-25-amd64';

    const host = vm.osState.hostname || 'linux-srv';
    const defUser = osId === 'ubuntu24' ? (vm.osState.username || 'admin') : 'root';

    setGuestScreen(`
      <div class="live-tty-wrap">
        <div class="tty-boot-log">
          <div>[  <span style="color:#34d399;">OK</span>  ] Started systemd-journald.service - Journal Service.</div>
          <div>[  <span style="color:#34d399;">OK</span>  ] Reached target network-online.target (${vm.network}: ${vm.osState.ip}/24).</div>
          <div>[  <span style="color:#34d399;">OK</span>  ] Started ssh.service - OpenBSD Secure Shell server (Port 22).</div>
          <div style="margin-top:0.65rem;color:#f8fafc;font-weight:700;">${banner}</div>
        </div>
        <form id="ttyLoginForm" class="tty-login-box">
          <div class="tty-row"><span>${host} login:</span><input type="text" id="ttyUserInp" value="${defUser}" class="tty-inp" /></div>
          <div class="tty-row"><span>Password:</span><input type="password" id="ttyPassInp" value="Admin@1234" class="tty-inp" /></div>
          <div style="margin-top:0.65rem;display:flex;gap:0.5rem;">
            <button type="submit" class="btn btn-neon btn-xs">🔓 Login เข้าใช้งานระบบ</button>
          </div>
        </form>
      </div>
    `, 'guest-bios');

    $('ttyLoginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      callbacks.playSound('correct');
      const u = $('ttyUserInp').value.trim() || defUser;
      renderLiveLinuxShell(vm, u);
    });
  }

  function renderLiveLinuxShell(vm, user) {
    const osId = vm.installedOsId;
    const host = vm.osState.hostname || 'linux-srv';
    const promptStr = user === 'root' ? `root@${host}:~#` : `${user}@${host}:~$`;
    const pkgCmd = osId === 'rocky9' ? 'sudo dnf install httpd' : 'sudo apt install nginx';
    const webSvc = osId === 'rocky9' ? 'httpd' : 'nginx';

    setGuestScreen(`
      <div class="live-shell-box">
        <div id="vmTtyOut" class="vm-tty-out"></div>
        <form id="vmTtyForm" class="vm-tty-input-row" autocomplete="off">
          <span class="vm-tty-prompt">${promptStr}</span>
          <input type="text" id="vmTtyInp" class="vm-tty-inp" placeholder="พิมพ์คำสั่ง Linux จริง เช่น ls, ip a, cat /etc/os-release, ${pkgCmd}, poweroff ..." spellcheck="false" />
          <button type="submit" class="btn btn-neon btn-xs">Enter</button>
        </form>
        <div class="vm-quick-bar">
          <span style="font-size:0.72rem;color:#94a3b8;">คำสั่งทดลองใน VM นี้:</span>
          <button type="button" class="quick-cmd-chip vm-qcmd">cat /etc/os-release</button>
          <button type="button" class="quick-cmd-chip vm-qcmd">ip a</button>
          <button type="button" class="quick-cmd-chip vm-qcmd">df -h</button>
          <button type="button" class="quick-cmd-chip vm-qcmd">free -h</button>
          <button type="button" class="quick-cmd-chip vm-qcmd">${pkgCmd}</button>
          <button type="button" class="quick-cmd-chip vm-qcmd">systemctl status ${webSvc}</button>
          <button type="button" class="quick-cmd-chip vm-qcmd">poweroff</button>
        </div>
      </div>
    `, 'guest-bios');

    const out = $('vmTtyOut');
    const writeLine = (txt, color = '#d1fae5') => {
      const d = document.createElement('div');
      d.style.color = color;
      d.textContent = txt;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
    };

    writeLine(`Welcome to ${getMission(osId).name} (${vm.name})!`, '#38bdf8');
    writeLine(`System load: 0.08 | Memory: ${vm.ram} MB | Disk: ${vm.disk} GB | IP: ${vm.osState.ip}/24 (${vm.network})`, '#94a3b8');
    writeLine(`พิมพ์ 'help' เพื่อดูคำสั่งที่ทดลองรันในเครื่อง VM นี้ได้\n`, '#94a3b8');

    const runVmCmd = (raw) => {
      const clean = raw.trim();
      writeLine(`${promptStr} ${raw}`, '#38bdf8');
      if (!clean) return;
      callbacks.playSound('terminal');
      const cmd = clean.replace(/^sudo\s+/, '');
      const parts = cmd.split(/\s+/);
      const bin = parts[0];

      if (bin === 'clear') { out.innerHTML = ''; return; }
      if (bin === 'poweroff' || bin === 'shutdown' || bin === 'exit') {
        writeLine('System is shutting down...', '#fbbf24');
        setTimeout(powerOffVm, 450);
        return;
      }
      if (bin === 'reboot') {
        writeLine('Rebooting VM...', '#fbbf24');
        setTimeout(() => bootInstalledOs(vm), 450);
        return;
      }
      if (bin === 'help') {
        writeLine(`คำสั่งในเครื่องเสมือน ${getMission(osId).shortName}:\n  cat /etc/os-release, uname -a, whoami, hostname\n  ip a, ping 8.8.8.8, df -h, free -h, ls -la\n  ${pkgCmd}  (ทดลองติดตั้ง Web Server จริงบน VM!)\n  systemctl status ${webSvc}, systemctl status ssh\n  reboot, poweroff, clear`, '#94a3b8');
      } else if (bin === 'whoami') writeLine(user);
      else if (bin === 'hostname') writeLine(host);
      else if (bin === 'uname') writeLine(`Linux ${host} 6.8.0-generic x86_64 GNU/Linux`);
      else if (bin === 'pwd') writeLine(user === 'root' ? '/root' : `/home/${user}`);
      else if (bin === 'ls') writeLine(vm.osState.packages.includes(webSvc) ? 'Desktop  backup.sh  www_status.txt' : 'backup.sh  readme.txt');
      else if (bin === 'cat' && parts[1] === '/etc/os-release') {
        if (osId === 'ubuntu24') writeLine('PRETTY_NAME="Ubuntu 24.04.1 LTS"\nID=ubuntu\nVERSION_ID="24.04"');
        else if (osId === 'rocky9') writeLine('PRETTY_NAME="Rocky Linux 9.4 (Blue Onyx)"\nID="rocky"\nPLATFORM_ID="platform:el9"');
        else writeLine('PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\nID=debian\nVERSION_ID="12"');
      } else if (bin === 'ip') {
        writeLine(`1: lo: inet 127.0.0.1/8\n2: enp0s3: inet ${vm.osState.ip}/24 (${vm.network}) state UP`);
      } else if (bin === 'ping') {
        const t = parts[1] || '8.8.8.8';
        writeLine(`PING ${t}: 64 bytes icmp_seq=1 ttl=58 time=9.8 ms\nPING ${t}: 64 bytes icmp_seq=2 ttl=58 time=10.1 ms\n2 packets transmitted, 2 received, 0% packet loss`, '#34d399');
      } else if (bin === 'df') {
        writeLine(`Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2       ${vm.disk}G  3.2G  ${vm.disk - 3}G  16% /`);
      } else if (bin === 'free') {
        writeLine(`               total        used        free\nMem:           ${vm.ram}Mi       312Mi       ${vm.ram - 312}Mi`);
      } else if ((bin === 'apt' || bin === 'dnf') && parts[1] === 'install') {
        const pkg = parts[2] || webSvc;
        if (!vm.osState.packages.includes(pkg)) vm.osState.packages.push(pkg);
        saveVms();
        writeLine(`Downloading ${pkg}... [100%]\nSetting up ${pkg}...\n✅ Installed '${pkg}' and started service on ${host}!`, '#34d399');
        callbacks.playSound('coin');
      } else if (bin === 'systemctl') {
        const svc = parts[2] || 'ssh';
        const installed = svc === 'ssh' || svc === 'sshd' || vm.osState.packages.includes(svc);
        writeLine(installed
          ? `● ${svc}.service — Active: active (running) on ${host}`
          : `Unit ${svc}.service could not be found. (ลองติดตั้งด้วย ${pkgCmd})`, installed ? '#34d399' : '#f87171');
      } else {
        writeLine(`bash: ${bin}: command not found (พิมพ์ 'help' ดูรายการคำสั่ง)`, '#f87171');
      }
    };

    $('vmTtyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      runVmCmd($('vmTtyInp').value);
      $('vmTtyInp').value = '';
    });

    document.querySelectorAll('.vm-qcmd').forEach((b) => {
      b.addEventListener('click', () => {
        $('vmTtyInp').value = b.textContent;
        $('vmTtyInp').focus();
      });
    });
    setTimeout(() => $('vmTtyInp')?.focus(), 50);
  }

  /* ---------- LIVE WINDOWS SERVER 2022 DESKTOP & SERVER MANAGER ---------- */
  function renderLiveWinServerLock(vm) {
    setGuestScreen(`
      <div class="win-lock-screen">
        <div class="win-lock-time">${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="win-lock-sub">Windows Server 2022 • ${vm.name}</div>
        <div style="margin:1.25rem 0;">Press <strong>Ctrl + Alt + Delete</strong> to unlock</div>
        <button type="button" class="btn btn-neon" id="wsCtrlAltDelBtn">⌨️ ส่งคำสั่ง Ctrl + Alt + Del (Sign in as Administrator)</button>
      </div>
    `, 'guest-winserv');
    $('wsCtrlAltDelBtn').addEventListener('click', () => {
      callbacks.playSound('correct');
      renderLiveWinServerDesktop(vm, 'dashboard');
    });
  }

  function renderLiveWinServerDesktop(vm, activeWin = 'dashboard') {
    const roles = vm.osState.winRoles || ['File and Storage Services'];
    const hasAd = roles.includes('AD DS (Active Directory)');

    let appWindowHtml = '';
    if (activeWin === 'dashboard') {
      const availRoles = [
        { name: 'AD DS (Active Directory)', desc: 'Domain Controller (college.local)' },
        { name: 'DNS Server', desc: 'แปลงชื่อโดเมน Port 53' },
        { name: 'DHCP Server', desc: 'แจก IP อัตโนมัติ Port 67/68' },
        { name: 'IIS Web Server', desc: 'ให้บริการเว็บไซต์ Port 80/443' }
      ];
      appWindowHtml = `
        <div class="os-app-win">
          <div class="os-app-titlebar"><span>📊 Server Manager — ${vm.name}</span><span>${vm.osState.ip}</span></div>
          <div class="os-app-body">
            <div class="sm-summary-row">
              <div><strong>Computer Name:</strong> ${vm.name}</div>
              <div><strong>IPv4:</strong> ${vm.osState.ip}/24 (${vm.network})</div>
              <div><strong>Domain:</strong> ${hasAd ? 'college.local (DC ✓)' : 'WORKGROUP'}</div>
            </div>
            <div style="font-weight:700;font-size:0.84rem;margin:0.7rem 0 0.4rem;">➕ Add Roles and Features (คลิกเพื่อติดตั้งบทบาทลงบน Server เครื่องนี้จริง!):</div>
            <div class="sm-roles-grid">
              ${availRoles.map((r) => {
                const on = roles.includes(r.name);
                return `<button type="button" class="sm-role-btn ${on ? 'installed' : ''}" data-role="${r.name}">
                  <strong>${on ? '✅' : '➕'} ${r.name}</strong>
                  <span>${r.desc}</span>
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (activeWin === 'powershell') {
      appWindowHtml = `
        <div class="os-app-win ps-win">
          <div class="os-app-titlebar" style="background:#0f172a;color:#fde047;"><span>💻 Administrator: Windows PowerShell</span><span>${vm.name}</span></div>
          <div id="wsPsOut" class="ws-ps-out">Windows PowerShell — ${vm.name}\nพิมพ์คำสั่ง: ipconfig /all, Get-WindowsFeature, hostname, whoami, ping 8.8.8.8\n</div>
          <form id="wsPsForm" class="vm-tty-input-row" style="background:#01183b;">
            <span style="color:#fde047;font-family:monospace;font-size:0.8rem;">PS C:\\Users\\Administrator&gt;</span>
            <input type="text" id="wsPsInp" class="vm-tty-inp" placeholder="พิมพ์คำสั่ง PowerShell..." />
            <button type="submit" class="btn btn-neon btn-xs">Run</button>
          </form>
        </div>
      `;
    } else if (activeWin === 'aduc') {
      appWindowHtml = `
        <div class="os-app-win">
          <div class="os-app-titlebar"><span>👥 Active Directory Users and Computers (college.local)</span></div>
          <div class="os-app-body">
            ${!hasAd
              ? '<div style="color:#dc2626;padding:1rem;text-align:center;">⚠️ ยังไม่ได้ติดตั้ง Role <strong>AD DS</strong> — กรุณาไปที่ Server Manager แล้วกดติดตั้ง AD DS ก่อน!</div>'
              : `
                <div style="margin-bottom:0.65rem;display:flex;gap:0.5rem;">
                  <input type="text" id="wsNewAdUserInp" class="win-inp" style="flex:1;" placeholder="ชื่อผู้ใช้ AD ใหม่ เช่น student02" />
                  <button type="button" class="win-btn" id="wsAddAdUserBtn">➕ เพิ่มผู้ใช้ใน Domain</button>
                </div>
                <div class="win-disk-table">
                  ${(vm.osState.adUsers || []).map((u) => `<div class="win-disk-row">👤 ${u}@college.local • Domain User (Enabled ✓)</div>`).join('')}
                </div>
              `}
          </div>
        </div>
      `;
    }

    setGuestScreen(`
      <div class="os-desktop ws-desktop">
        <div class="os-desktop-icons">
          <button type="button" class="desk-icon" id="wsIconSm"><span>📊</span><small>Server Manager</small></button>
          <button type="button" class="desk-icon" id="wsIconPs"><span>💻</span><small>PowerShell</small></button>
          <button type="button" class="desk-icon" id="wsIconAd"><span>👥</span><small>AD Users</small></button>
        </div>
        <div class="os-desktop-stage">${appWindowHtml}</div>
        <div class="os-taskbar">
          <button type="button" class="task-start" id="wsShutBtn">🪟 Shut Down VM</button>
          <div class="task-info">Windows Server 2022 • ${vm.osState.ip} • Roles: ${roles.length}</div>
        </div>
      </div>
    `, 'guest-winserv');

    $('wsIconSm').addEventListener('click', () => { callbacks.playSound('click'); renderLiveWinServerDesktop(vm, 'dashboard'); });
    $('wsIconPs').addEventListener('click', () => { callbacks.playSound('click'); renderLiveWinServerDesktop(vm, 'powershell'); });
    $('wsIconAd').addEventListener('click', () => { callbacks.playSound('click'); renderLiveWinServerDesktop(vm, 'aduc'); });
    $('wsShutBtn').addEventListener('click', powerOffVm);

    document.querySelectorAll('.sm-role-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const r = btn.dataset.role;
        if (!vm.osState.winRoles.includes(r)) {
          vm.osState.winRoles.push(r);
          saveVms();
          callbacks.playSound('coin');
          callbacks.toast(`✅ ติดตั้ง Role "${r}" บน ${vm.name} สำเร็จ!`);
          renderLiveWinServerDesktop(vm, 'dashboard');
        }
      });
    });

    $('wsAddAdUserBtn')?.addEventListener('click', () => {
      const u = $('wsNewAdUserInp').value.trim();
      if (!u) return;
      if (!vm.osState.adUsers.includes(u)) vm.osState.adUsers.push(u);
      saveVms();
      callbacks.playSound('coin');
      renderLiveWinServerDesktop(vm, 'aduc');
    });

    $('wsPsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = $('wsPsInp').value.trim();
      if (!raw) return;
      const out = $('wsPsOut');
      out.textContent += `\nPS C:\\Users\\Administrator> ${raw}\n`;
      callbacks.playSound('terminal');
      const low = raw.toLowerCase();
      if (low.startsWith('ipconfig')) out.textContent += `IPv4 Address: ${vm.osState.ip} | Mask: 255.255.255.0 | Adapter: ${vm.network}\n`;
      else if (low.startsWith('get-windowsfeature')) out.textContent += `Installed Roles:\n${vm.osState.winRoles.map((r) => ` [X] ${r}`).join('\n')}\n`;
      else if (low === 'hostname') out.textContent += `${vm.name}\n`;
      else if (low === 'whoami') out.textContent += `${hasAd ? 'college' : vm.name}\\administrator\n`;
      else if (low.startsWith('ping')) out.textContent += `Reply from 8.8.8.8: bytes=32 time=11ms TTL=58 (0% loss)\n`;
      else if (low === 'cls' || low === 'clear') out.textContent = '';
      else out.textContent += `คำสั่งที่รองรับ: ipconfig /all, Get-WindowsFeature, hostname, whoami, ping 8.8.8.8, cls\n`;
      out.scrollTop = out.scrollHeight;
      $('wsPsInp').value = '';
    });
  }

  /* ---------- LIVE WINDOWS 11 PRO DESKTOP (DOMAIN JOIN + CMD + EDGE) ---------- */
  function renderLiveWin11Lock(vm) {
    setGuestScreen(`
      <div class="win-lock-screen">
        <div class="win-lock-time">${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="win-lock-sub">Windows 11 Pro • ${vm.name} (${vm.osState.domainName || 'WORKGROUP'})</div>
        <button type="button" class="btn btn-neon" style="margin-top:1rem;" id="w11SignInBtn">👤 Sign in as client01</button>
      </div>
    `, 'guest-win11');
    $('w11SignInBtn').addEventListener('click', () => {
      callbacks.playSound('correct');
      renderLiveWin11Desktop(vm, 'domain');
    });
  }

  function renderLiveWin11Desktop(vm, activeWin = 'domain') {
    const joined = Boolean(vm.osState.domainJoined);
    const hasWebVm = vms.some((v) => v.installedOsId && v.osState?.packages?.some((p) => p === 'nginx' || p === 'httpd'));

    let appHtml = '';
    if (activeWin === 'domain') {
      appHtml = `
        <div class="os-app-win">
          <div class="os-app-titlebar"><span>⚙️ Settings — Join Active Directory Domain (Windows 11 Pro)</span></div>
          <div class="os-app-body">
            <div class="sm-summary-row">
              <div><strong>Device:</strong> ${vm.name}</div>
              <div><strong>IP:</strong> ${vm.osState.ip}/24</div>
              <div><strong>Status:</strong> <strong style="color:${joined ? '#059669' : '#d97706'}">${joined ? `Joined: ${vm.osState.domainName} ✅` : 'WORKGROUP (ยังไม่เข้า Domain)'}</strong></div>
            </div>
            ${joined
              ? `<div style="margin-top:0.85rem;padding:0.85rem;border-radius:10px;background:#ecfdf5;border:1px solid #10b981;color:#065f46;">
                  🎉 เครื่องลูกข่าย <strong>${vm.name}</strong> เข้าร่วมโดเมน <strong>${vm.osState.domainName}</strong> และรับนโยบาย Group Policy (GPO) เรียบร้อยแล้ว!
                </div>`
              : `<form id="w11JoinForm" style="margin-top:0.85rem;display:flex;flex-direction:column;gap:0.55rem;">
                  <label style="font-size:0.84rem;">Domain Name (ชื่อโดเมนจาก Windows Server): <input type="text" id="w11DomInp" value="college.local" class="win-inp" style="width:100%;margin-top:0.2rem;" /></label>
                  <button type="submit" class="win-btn">🔗 Join Domain (เข้าร่วมโดเมน)</button>
                </form>`}
          </div>
        </div>
      `;
    } else if (activeWin === 'edge') {
      appHtml = `
        <div class="os-app-win">
          <div class="os-app-titlebar" style="background:#0284c7;"><span>🌐 Microsoft Edge — http://192.168.10.10 (Lab Intranet)</span></div>
          <div class="os-app-body" style="text-align:center;padding:1.5rem;">
            ${hasWebVm
              ? `<h3 style="color:#059669;">✅ Welcome to nginx / Apache on Linux Server VM!</h3>
                 <p style="margin-top:0.4rem;color:#475569;">เครื่องลูกข่าย Windows 11 Pro สามารถเข้าชมเว็บไซต์จาก Linux Server VM ใน VirtualBox ได้สำเร็จ!</p>`
              : `<h3 style="color:#d97706;">🌐 Connected to Lab Network (${vm.network})</h3>
                 <p style="margin-top:0.4rem;color:#475569;">ลองไปบูตเครื่อง <strong>Ubuntu Server VM</strong> แล้วพิมพ์ <code>sudo apt install nginx</code> จากนั้นกลับมาเปิดหน้านี้ดูสิ!</p>`}
          </div>
        </div>
      `;
    } else if (activeWin === 'cmd') {
      appHtml = `
        <div class="os-app-win ps-win">
          <div class="os-app-titlebar" style="background:#0f172a;"><span>💻 Command Prompt — ${vm.name}</span></div>
          <div id="w11CmdOut" class="ws-ps-out">Microsoft Windows [Version 10.0.26100]\nพิมพ์คำสั่ง: ipconfig, whoami, ping 192.168.10.2, nslookup college.local\n</div>
          <form id="w11CmdForm" class="vm-tty-input-row">
            <span style="color:#e2e8f0;font-family:monospace;font-size:0.8rem;">C:\\Users\\client01&gt;</span>
            <input type="text" id="w11CmdInp" class="vm-tty-inp" placeholder="พิมพ์คำสั่ง CMD..." />
            <button type="submit" class="btn btn-neon btn-xs">Run</button>
          </form>
        </div>
      `;
    }

    setGuestScreen(`
      <div class="os-desktop w11-desktop">
        <div class="os-desktop-icons">
          <button type="button" class="desk-icon" id="w11IconDom"><span>⚙️</span><small>Join Domain</small></button>
          <button type="button" class="desk-icon" id="w11IconEdge"><span>🌐</span><small>Edge Browser</small></button>
          <button type="button" class="desk-icon" id="w11IconCmd"><span>💻</span><small>CMD Terminal</small></button>
        </div>
        <div class="os-desktop-stage">${appHtml}</div>
        <div class="os-taskbar" style="justify-content:center;gap:1rem;">
          <button type="button" class="task-start" id="w11ShutBtn">🪟 Shut Down</button>
          <div class="task-info">Windows 11 Pro • ${joined ? vm.osState.domainName : 'WORKGROUP'} • ${vm.osState.ip}</div>
        </div>
      </div>
    `, 'guest-win11');

    $('w11IconDom').addEventListener('click', () => { callbacks.playSound('click'); renderLiveWin11Desktop(vm, 'domain'); });
    $('w11IconEdge').addEventListener('click', () => { callbacks.playSound('click'); renderLiveWin11Desktop(vm, 'edge'); });
    $('w11IconCmd').addEventListener('click', () => { callbacks.playSound('click'); renderLiveWin11Desktop(vm, 'cmd'); });
    $('w11ShutBtn').addEventListener('click', powerOffVm);

    $('w11JoinForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const dom = $('w11DomInp').value.trim() || 'college.local';
      vm.osState.domainJoined = true;
      vm.osState.domainName = dom;
      saveVms();
      callbacks.playSound('levelUp');
      callbacks.toast(`🎉 Welcome to the ${dom} domain!`);
      renderLiveWin11Desktop(vm, 'domain');
    });

    $('w11CmdForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = $('w11CmdInp').value.trim();
      if (!raw) return;
      const out = $('w11CmdOut');
      out.textContent += `\nC:\\Users\\client01> ${raw}\n`;
      callbacks.playSound('terminal');
      const low = raw.toLowerCase();
      if (low.startsWith('ipconfig')) out.textContent += `IPv4 Address: ${vm.osState.ip} | Gateway: 192.168.10.1 | DNS: 192.168.10.2\n`;
      else if (low === 'whoami') out.textContent += `${joined ? vm.osState.domainName : vm.name}\\client01\n`;
      else if (low.startsWith('ping')) out.textContent += `Reply from 192.168.10.2: bytes=32 time<1ms TTL=128\n`;
      else if (low.startsWith('nslookup')) out.textContent += `Name: college.local | Address: 192.168.10.2 (SRV-Win2022-DC)\n`;
      else if (low === 'cls') out.textContent = '';
      else out.textContent += `รองรับคำสั่ง: ipconfig, whoami, ping 192.168.10.2, nslookup college.local, cls\n`;
      out.scrollTop = out.scrollHeight;
      $('w11CmdInp').value = '';
    });
  }

  /* ==================== 5 OS INSTALLER FLOWS ==================== */
  function renderUbuntuStep(step) {
    callbacks.playSound('click');
    if (step === 0) {
      setGuestScreen(`
        <div class="grub-screen">
          <div class="grub-title">GNU GRUB version 2.12 — Ubuntu Server 24.04 LTS</div>
          <div class="grub-box">
            <button type="button" class="grub-item active" id="ubBootBtn">*Try or Install Ubuntu Server</button>
            <div class="grub-item">Ubuntu Server with the HWE kernel</div>
          </div>
          <div class="grub-foot">คลิกเลือก <strong>*Try or Install Ubuntu Server</strong></div>
        </div>
      `, 'guest-bios');
      $('ubBootBtn').addEventListener('click', () => renderUbuntuStep(1));
    } else if (step === 1) {
      setGuestScreen(`
        <div class="ub-tui">
          <div class="ub-bar">Ubuntu Server 24.04 LTS Installer — Step 1/4: Network Connections</div>
          <div class="ub-body">
            <div class="ub-panel">
              <div><strong>Interface:</strong> enp0s3 (${runningVm.network})</div>
              <div style="margin-top:0.5rem;">
                <label><input type="radio" name="ubNet" value="Static (192.168.10.10/24)" checked /> Static IP: <code>192.168.10.10/24</code></label><br/>
                <label><input type="radio" name="ubNet" value="DHCPv4 (Auto)" /> DHCPv4 (Auto)</label>
              </div>
            </div>
            <div class="ub-actions"><button type="button" class="ub-btn" id="ubNext2">[ Done ]</button></div>
          </div>
        </div>
      `, 'guest-ubuntu');
      $('ubNext2').addEventListener('click', () => {
        const picked = document.querySelector('input[name="ubNet"]:checked');
        if (picked) installerData.ipMode = picked.value;
        renderUbuntuStep(2);
      });
    } else if (step === 2) {
      setGuestScreen(`
        <div class="ub-tui">
          <div class="ub-bar">Ubuntu Server 24.04 LTS Installer — Step 2/4: Guided Storage &amp; Profile</div>
          <div class="ub-body">
            <div class="ub-panel"><code>[X] Use an entire disk (/dev/sda ${runningVm.disk} GB LVM ext4)</code></div>
            <div class="ub-form-grid">
              <label>Server's name: <input type="text" id="ubHostInp" value="${installerData.hostname}" class="ub-inp" /></label>
              <label>Username: <input type="text" id="ubUserInp" value="${installerData.username}" class="ub-inp" /></label>
              <label style="display:flex;align-items:center;gap:0.5rem;"><input type="checkbox" id="ubSshChk" checked /> <strong>[X] Install OpenSSH server (Port 22)</strong></label>
            </div>
            <div class="ub-actions"><button type="button" class="ub-btn" id="ubStartInst">[ Install Ubuntu Server ]</button></div>
          </div>
        </div>
      `, 'guest-ubuntu');
      $('ubStartInst').addEventListener('click', () => {
        installerData.hostname = $('ubHostInp').value.trim() || 'srv-ubuntu';
        installerData.username = $('ubUserInp').value.trim() || 'admin';
        installerData.installSsh = $('ubSshChk').checked;
        renderUbuntuStep(3);
      });
    } else if (step === 3) {
      const logs = [
        'curtin: partitioning /dev/sda (GPT + ext4 LVM)... OK',
        'extracting ubuntu-24.04-server-amd64.squashfs... OK',
        `configuring netplan (${installerData.ipMode})... OK`,
        installerData.installSsh ? 'installing openssh-server (Port 22/tcp)... OK' : 'skipping openssh-server...',
        'installing GRUB bootloader to /dev/sda... DONE!'
      ];
      setGuestScreen(`
        <div class="ub-tui">
          <div class="ub-bar">Installing Ubuntu Server 24.04 LTS...</div>
          <div class="ub-body">
            <div class="ub-progress-track"><div class="ub-progress-fill" id="ubProgFill" style="width:10%"></div></div>
            <pre class="ub-log" id="ubLogOut"></pre>
            <div class="ub-actions"><button type="button" class="ub-btn hidden" id="ubRebootBtn">[ Reboot Now ]</button></div>
          </div>
        </div>
      `, 'guest-ubuntu');
      let i = 0;
      installProgressTimer = setInterval(() => {
        if (i < logs.length) {
          $('ubLogOut').textContent += `[OK] ${logs[i]}\n`;
          $('ubProgFill').style.width = `${Math.round(((i + 1) / logs.length) * 100)}%`;
          callbacks.playSound('terminal');
          i++;
        } else {
          clearInterval(installProgressTimer);
          $('ubRebootBtn').classList.remove('hidden');
          $('ubRebootBtn').addEventListener('click', () => completeOsInstallation('ubuntu24'));
        }
      }, 340);
    }
  }

  function renderWinServerStep(step) {
    callbacks.playSound('click');
    if (step === 0) {
      setGuestScreen(`
        <div class="bios-fatal">
          <div>Press any key to boot from CD or DVD.....</div><br/>
          <button type="button" class="btn btn-neon btn-sm" id="wsAnyKeyBtn">⌨️ กดปุ่มใดก็ได้เพื่อบูตจากแผ่น Windows Server 2022</button>
        </div>
      `, 'guest-bios');
      $('wsAnyKeyBtn').addEventListener('click', () => renderWinServerStep(1));
    } else if (step === 1) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Windows Setup — Select Operating System</div>
          <div class="win-setup-body">
            <p class="win-hint">💡 เลือก <strong>Desktop Experience</strong> เพื่อติดตั้งพร้อมหน้าต่าง GUI &amp; Server Manager</p>
            <div class="win-list">
              <label class="win-list-row"><input type="radio" name="wsEd" value="Standard Evaluation (Server Core)" /> Windows Server 2022 Standard (Server Core)</label>
              <label class="win-list-row active"><input type="radio" name="wsEd" value="Datacenter Evaluation (Desktop Experience)" checked /> <strong>Windows Server 2022 Datacenter (Desktop Experience)</strong></label>
            </div>
            <div class="win-actions"><button type="button" class="win-btn" id="wsEdNext">Next →</button></div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsEdNext').addEventListener('click', () => {
        installerData.winEdition = document.querySelector('input[name="wsEd"]:checked')?.value || 'Datacenter (Desktop Experience)';
        renderWinServerStep(2);
      });
    } else if (step === 2) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Which type of installation do you want?</div>
          <div class="win-setup-body">
            <button type="button" class="win-choice-card" disabled><strong>Upgrade</strong><span>(สำหรับอัปเกรด Windows เดิม)</span></button>
            <button type="button" class="win-choice-card primary" id="wsCustomBtn"><strong>✅ Custom: Install Microsoft Server OS only (advanced)</strong><span>ติดตั้งใหม่บนดิสก์เปล่า ${runningVm.disk} GB</span></button>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsCustomBtn').addEventListener('click', () => renderWinServerStep(3));
    } else if (step === 3) {
      const partHtml = installerData.partitionCreated
        ? `<div class="win-disk-row">Drive 0 Partition 1: System Reserved • 500 MB</div><div class="win-disk-row active">Drive 0 Partition 2 • ${(runningVm.disk - 0.5).toFixed(1)} GB • Primary ✓</div>`
        : `<div class="win-disk-row active">Drive 0 Unallocated Space • ${runningVm.disk}.0 GB</div>`;
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Where do you want to install Windows?</div>
          <div class="win-setup-body">
            <div class="win-disk-table">${partHtml}</div>
            <div class="win-actions" style="justify-content:space-between;">
              <button type="button" class="win-btn secondary" id="wsNewPartBtn" ${installerData.partitionCreated ? 'disabled' : ''}>✨ New (สร้างพาร์ติชัน)</button>
              <button type="button" class="win-btn" id="wsStartCopyBtn">Next (เริ่มติดตั้ง) →</button>
            </div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsNewPartBtn')?.addEventListener('click', () => { installerData.partitionCreated = true; renderWinServerStep(3); });
      $('wsStartCopyBtn').addEventListener('click', () => renderWinServerStep(4));
    } else if (step === 4) {
      const stages = ['Copying Windows files... 100%', 'Getting files ready... 55%', 'Getting files ready... 100%', 'Installing features & updates... Done!'];
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Installing Windows Server 2022</div>
          <div class="win-setup-body">
            <div class="ub-progress-track"><div class="ub-progress-fill" id="wsProgFill" style="width:15%;background:#2563eb;"></div></div>
            <div id="wsProgLog" style="font-size:0.86rem;margin-top:0.75rem;line-height:1.7;"></div>
          </div>
        </div>
      `, 'guest-winserv');
      let i = 0;
      installProgressTimer = setInterval(() => {
        if (i < stages.length) {
          $('wsProgLog').innerHTML += `<div>✓ ${stages[i]}</div>`;
          $('wsProgFill').style.width = `${Math.round(((i + 1) / stages.length) * 100)}%`;
          callbacks.playSound('terminal');
          i++;
        } else {
          clearInterval(installProgressTimer);
          renderWinServerStep(5);
        }
      }, 360);
    } else if (step === 5) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Customize settings — Administrator Account</div>
          <div class="win-setup-body">
            <div class="win-form-row"><span>User name:</span><strong>Administrator</strong></div>
            <div class="win-form-row"><span>Password:</span><input type="password" id="wsAdminPw" value="P@ssw0rd2026!" class="win-inp" /></div>
            <div id="wsPwErr" style="color:#dc2626;font-size:0.82rem;margin-top:0.35rem;"></div>
            <div class="win-actions"><button type="button" class="win-btn" id="wsFinishBtn">Finish ✓</button></div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsFinishBtn').addEventListener('click', () => {
        const pw = $('wsAdminPw').value;
        if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
          callbacks.playSound('wrong');
          $('wsPwErr').textContent = '⚠️ รหัสผ่านต้อง ≥ 8 ตัว มีตัวพิมพ์ใหญ่และตัวเลข';
          return;
        }
        completeOsInstallation('winserv2022');
      });
    }
  }

  function renderRockyStep(step) {
    callbacks.playSound('click');
    if (step === 0) {
      const ready = installerData.rockyDestDone && installerData.rockyRootDone && installerData.rockyNetDone;
      setGuestScreen(`
        <div class="rocky-box">
          <div class="rocky-header">🏔️ ROCKY LINUX 9.4 — INSTALLATION SUMMARY (Anaconda)</div>
          <div class="rocky-body">
            <div class="rocky-hub-grid">
              <button type="button" class="rocky-tile ${installerData.rockyDestDone ? 'ok' : ''}" id="rkDestBtn">
                <div class="rk-ic">💾</div><strong>Installation Destination</strong>
                <span>${installerData.rockyDestDone ? `✅ /dev/sda (${runningVm.disk} GB XFS)` : '⚠️ คลิกเลือกดิสก์'}</span>
              </button>
              <button type="button" class="rocky-tile ${installerData.rockyRootDone ? 'ok' : ''}" id="rkRootBtn">
                <div class="rk-ic">🔑</div><strong>Root Password</strong>
                <span>${installerData.rockyRootDone ? '✅ ตั้งรหัส Root แล้ว' : '⚠️ คลิกตั้งรหัส Root'}</span>
              </button>
              <button type="button" class="rocky-tile ${installerData.rockyNetDone ? 'ok' : ''}" id="rkNetBtn">
                <div class="rk-ic">🌐</div><strong>Network &amp; Host Name</strong>
                <span>${installerData.rockyNetDone ? `✅ ens33 ON` : '⚠️ คลิกเปิดการ์ดแลน'}</span>
              </button>
            </div>
            <div class="win-actions" style="margin-top:1rem;"><button type="button" class="btn btn-neon btn-sm" id="rkBeginBtn" ${!ready ? 'disabled' : ''}>▶ Begin Installation</button></div>
          </div>
        </div>
      `, 'guest-rocky');
      $('rkDestBtn').addEventListener('click', () => { installerData.rockyDestDone = true; renderRockyStep(0); });
      $('rkRootBtn').addEventListener('click', () => { installerData.rockyRootDone = true; renderRockyStep(0); });
      $('rkNetBtn').addEventListener('click', () => { installerData.rockyNetDone = true; renderRockyStep(0); });
      $('rkBeginBtn').addEventListener('click', () => renderRockyStep(1));
    } else {
      const steps = ['Creating XFS filesystem...', 'Installing DNF core packages (342/342)...', 'Configuring SELinux & GRUB2... Done!'];
      setGuestScreen(`
        <div class="rocky-box">
          <div class="rocky-header">🏔️ ROCKY LINUX 9.4 — INSTALLING...</div>
          <div class="rocky-body">
            <div class="ub-progress-track"><div class="ub-progress-fill" id="rkProgFill" style="width:20%;background:#10b981;"></div></div>
            <div id="rkLog" style="margin-top:0.75rem;font-size:0.86rem;line-height:1.7;"></div>
          </div>
        </div>
      `, 'guest-rocky');
      let i = 0;
      installProgressTimer = setInterval(() => {
        if (i < steps.length) {
          $('rkLog').innerHTML += `<div>✓ ${steps[i]}</div>`;
          $('rkProgFill').style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
          callbacks.playSound('terminal');
          i++;
        } else {
          clearInterval(installProgressTimer);
          completeOsInstallation('rocky9');
        }
      }, 400);
    }
  }

  function renderDebianStep(step) {
    callbacks.playSound('click');
    if (step === 0) {
      setGuestScreen(`
        <div class="deb-tui"><div class="deb-box">
          <div class="deb-title">[!] Partition disks — Debian 12 "Bookworm"</div>
          <p>Hostname: <strong>${runningVm.name}</strong> • Guided - use entire disk (${runningVm.disk} GB)</p>
          <div class="deb-actions"><button type="button" class="deb-btn" id="debStep1">&lt; Continue &amp; Write changes &gt;</button></div>
        </div></div>
      `, 'guest-debian');
      $('debStep1').addEventListener('click', () => renderDebianStep(1));
    } else if (step === 1) {
      setGuestScreen(`
        <div class="deb-tui"><div class="deb-box">
          <div class="deb-title">[!] Software selection (tasksel)</div>
          <label style="display:block;"><input type="checkbox" id="debGuiChk" /> [ ] Debian desktop environment (GUI)</label>
          <label style="display:block;"><input type="checkbox" id="debSshChk" checked /> [*] SSH server (Port 22)</label>
          <label style="display:block;"><input type="checkbox" checked disabled /> [*] standard system utilities</label>
          <div class="deb-actions"><button type="button" class="deb-btn" id="debStep2">&lt; Install Base &amp; GRUB &gt;</button></div>
        </div></div>
      `, 'guest-debian');
      $('debStep2').addEventListener('click', () => {
        installerData.debianGui = $('debGuiChk').checked;
        installerData.debianSsh = $('debSshChk').checked;
        renderDebianStep(2);
      });
    } else {
      setGuestScreen(`
        <div class="deb-tui"><div class="deb-box">
          <div class="deb-title">Installing Debian 12 + GRUB Bootloader</div>
          <div class="ub-progress-track" style="margin:0.8rem 0;"><div class="ub-progress-fill" id="debProg" style="width:25%;background:#ef4444;"></div></div>
          <div id="debLog" style="font-size:0.84rem;">Installing base system...</div>
        </div></div>
      `, 'guest-debian');
      let pct = 25;
      installProgressTimer = setInterval(() => {
        pct += 25;
        $('debProg').style.width = `${Math.min(100, pct)}%`;
        callbacks.playSound('terminal');
        if (pct === 50) $('debLog').textContent = 'Installing openssh-server...';
        if (pct === 75) $('debLog').textContent = 'Installing GRUB on /dev/sda...';
        if (pct >= 100) { clearInterval(installProgressTimer); completeOsInstallation('debian12'); }
      }, 380);
    }
  }

  function renderWin11Step(step) {
    callbacks.playSound('click');
    if (step === 0) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Windows 11 Setup (UEFI + TPM 2.0 Verified ✓)</div>
          <div class="win-setup-body">
            <p class="win-hint">💡 เลือก <strong>Windows 11 Pro</strong> เพื่อรองรับการ Join เข้า Active Directory Domain</p>
            <div class="win-list">
              <label class="win-list-row"><input type="radio" name="w11Ed" value="Home" /> Windows 11 Home (ไม่รองรับ Join Domain)</label>
              <label class="win-list-row active"><input type="radio" name="w11Ed" value="Pro" checked /> <strong>Windows 11 Pro (รองรับ Join AD Domain ✓)</strong></label>
            </div>
            <div id="w11Err" style="color:#dc2626;font-size:0.82rem;margin-top:0.35rem;"></div>
            <div class="win-actions"><button type="button" class="win-btn" id="w11Next1">Next →</button></div>
          </div>
        </div>
      `, 'guest-win11');
      $('w11Next1').addEventListener('click', () => {
        if (document.querySelector('input[name="w11Ed"]:checked')?.value !== 'Pro') {
          callbacks.playSound('wrong');
          $('w11Err').textContent = '⚠️ Windows 11 Home ไม่รองรับ Join Domain กรุณาเลือก Windows 11 Pro!';
          return;
        }
        renderWin11Step(1);
      });
    } else {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Installing Windows 11 Pro on Drive 0 (${runningVm.disk} GB)</div>
          <div class="win-setup-body">
            <div class="ub-progress-track" style="margin:0.8rem 0;"><div class="ub-progress-fill" id="w11Prog" style="width:20%;background:#0284c7;"></div></div>
            <div id="w11Log" style="font-size:0.86rem;">Copying Windows 11 Pro files...</div>
          </div>
        </div>
      `, 'guest-win11');
      let pct = 20;
      installProgressTimer = setInterval(() => {
        pct += 27;
        $('w11Prog').style.width = `${Math.min(100, pct)}%`;
        callbacks.playSound('terminal');
        if (pct >= 47) $('w11Log').textContent = 'Installing Guest Additions & OOBE Setup...';
        if (pct >= 100) { clearInterval(installProgressTimer); completeOsInstallation('win11pro'); }
      }, 400);
    }
  }

  /* ==================== BIND UI EVENTS ONCE ==================== */
  function bindEvents() {
    const isoSel = $('vmIsoInp');
    if (isoSel && !isoSel.options.length) {
      ALL_ISOS.forEach((iso) => {
        const opt = document.createElement('option');
        opt.value = iso.file;
        opt.textContent = iso.label;
        isoSel.appendChild(opt);
      });
    }

    $('vboxNewBtn')?.addEventListener('click', openNewVmModal);
    $('vboxSettingsBtn')?.addEventListener('click', openSettingsModal);
    $('vboxStartBtn')?.addEventListener('click', () => startSelectedVm(false));
    $('vboxPowerOffBtn')?.addEventListener('click', () => {
      callbacks.playSound('click');
      powerOffVm();
    });

    $('vboxRemoveBtn')?.addEventListener('click', () => {
      const sel = getSelectedVm();
      if (!sel) return;
      if (confirm(`ต้องการลบเครื่องเสมือน "${sel.name}" ออกจาก VirtualBox ใช่หรือไม่?`)) {
        vms = vms.filter((v) => v.id !== sel.id);
        selectedVmId = vms[0]?.id || null;
        saveVms();
        callbacks.playSound('click');
        renderManagerView();
      }
    });

    $('vmRamInp')?.addEventListener('input', (e) => { $('vmRamVal').textContent = `${e.target.value} MB`; });
    $('closeVboxModalBtn')?.addEventListener('click', closeModal);
    $('vboxModalCancelBtn')?.addEventListener('click', closeModal);

    $('vboxModalForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const mode = e.target.dataset.mode;
      const vmData = {
        name: $('vmNameInp').value.trim() || 'New-VM',
        osType: $('vmOsTypeInp').value,
        osVersion: $('vmOsVerInp').value,
        ram: Number($('vmRamInp').value),
        cpu: Number($('vmCpuInp').value),
        disk: Number($('vmDiskInp').value),
        network: $('vmNetInp').value,
        iso: $('vmIsoInp').value,
        efi: $('vmEfiInp').checked,
        tpm: $('vmTpmInp').checked
      };

      if (mode === 'edit' && selectedVmId) {
        const idx = vms.findIndex((v) => v.id === selectedVmId);
        if (idx !== -1) vms[idx] = { ...vms[idx], ...vmData };
        callbacks.toast(`💾 อัปเดตการตั้งค่า "${vmData.name}" แล้ว`);
      } else {
        const newVm = { id: 'vm_' + Date.now(), installedOsId: null, osState: null, ...vmData };
        vms.push(newVm);
        selectedVmId = newVm.id;
        callbacks.toast(`🖥️ สร้างเครื่องเสมือน "${vmData.name}" สำเร็จ! กด ▶ Start เพื่อติดตั้ง OS`);
      }
      saveVms();
      callbacks.playSound('correct');
      closeModal();
      renderManagerView();
    });
  }

  return {
    OS_MISSIONS,
    init,
    bindEvents,
    render,
    powerOffVm
  };
})();
