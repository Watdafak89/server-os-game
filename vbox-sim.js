/* ServerOps: Realistic Oracle VM VirtualBox 7.x & Multi-OS Installation Simulator */
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
      brief: 'ติดตั้ง Ubuntu Server 24.04 LTS สำหรับทำ Web Server (RAM ≥ 2 GB, CPU ≥ 2, Disk ≥ 20 GB, เปิด OpenSSH Server)'
    },
    {
      id: 'winserv2022',
      name: 'Windows Server 2022 Datacenter',
      shortName: 'Windows Server 2022',
      icon: '🪟',
      badge: 'Windows • Desktop Experience',
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
      brief: 'ติดตั้ง Windows Server 2022 (Desktop Experience) สำหรับสร้าง Domain Controller (RAM ≥ 4 GB, CPU ≥ 2, Disk ≥ 40 GB)'
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
      brief: 'ติดตั้ง Rocky Linux 9 (ตระกูล RHEL) ผ่านหน้าจอ Anaconda Summary Hub พร้อมเปิดการ์ดแลนและตั้งรหัส Root'
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
      brief: 'ติดตั้ง Debian 12 แบบ Headless Server (ไม่ลง GUI) พร้อมเลือก SSH Server ใน tasksel และติดตั้ง GRUB'
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
      brief: 'ติดตั้ง Windows 11 Pro เพื่อจำลองเครื่องลูกข่ายเข้า Domain (ต้องเปิด EFI + TPM 2.0, RAM ≥ 4 GB, Disk ≥ 64 GB)'
    }
  ];

  const ALL_ISOS = [
    { file: '', label: '(Empty — ยังไม่ใส่แผ่น ISO)' },
    ...OS_MISSIONS.map((m) => ({ file: m.isoName, label: `💿 ${m.isoName} (${m.shortName})` }))
  ];

  let callbacks = {
    getInstalled: () => [],
    onMissionComplete: () => {},
    playSound: () => {},
    toast: () => {}
  };

  let activeMissionId = 'ubuntu24';
  let vms = [];
  let selectedVmId = null;
  let runningVm = null;
  let installerStep = 0;
  let installerData = {};
  let installProgressTimer = null;

  const $ = (id) => document.getElementById(id);

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
    const root = $('vboxAppRoot');
    if (!root) return;
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
        <span class="vbox-pill-sub">${done ? '✅ ผ่านแล้ว' : m.badge}</span>
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
    const step2Ok = Boolean(vm && vm.iso === m.isoName);
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
        <span>${step3Ok ? '✅' : '3️⃣'}</span> กด <strong>▶ Start</strong> และติดตั้ง OS จนบูตสำเร็จ (+${m.xp} XP, 💰${m.coins})
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
              ${vm.installedOsId ? '🟢 Installed (Ready)' : '⚪ Powered Off'}
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
          <p>ซอฟต์แวร์จำลองเครื่องแม่ข่าย (Type-2 Hypervisor Simulator) สำหรับฝึกสร้าง Virtual Machine, แบ่งทรัพยากร RAM/CPU/VDI, ตั้งค่าการ์ดแลน (NAT / Bridged / Internal) และฝึกติดตั้ง Linux / Windows Server ทีละขั้นตอนเหมือนเครื่องจริง!</p>
          <button type="button" class="btn btn-neon" id="vboxQuickNewBtn">➕ สร้าง Virtual Machine ใหม่ (New VM)</button>
        </div>
      `;
      $('vboxQuickNewBtn')?.addEventListener('click', openNewVmModal);
    } else {
      detailEl.innerHTML = `
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

  /* ==================== BOOT VM & REALISTIC OS INSTALLERS ==================== */
  function startSelectedVm() {
    const vm = getSelectedVm();
    if (!vm) return;
    callbacks.playSound('shield');
    runningVm = vm;
    installerStep = 0;
    installerData = {
      lang: 'English',
      hostname: vm.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      username: 'admin',
      ipMode: 'Static (192.168.10.10/24)',
      installSsh: true,
      winEdition: 'Windows Server 2022 Datacenter Evaluation (Desktop Experience)',
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
    $('vboxLedIso').textContent = vm.iso ? `💿 ${vm.iso}` : '💿 No Disc';
    $('vboxLedNet').textContent = `🌐 ${vm.network}`;

    renderBiosBoot();
  }

  function powerOffVm() {
    clearInterval(installProgressTimer);
    installProgressTimer = null;
    runningVm = null;
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
      // 1. Check if ISO is mounted!
      if (!vm.iso) {
        callbacks.playSound('wrong');
        setGuestScreen(`
          <div class="bios-fatal">
            <div>Oracle VM VirtualBox — Virtual Machine Boot Error</div>
            <br/>
            <div style="color:#f87171;font-weight:700;">FATAL: No bootable medium found! System halted.</div>
            <br/>
            <div style="color:#cbd5e1;">💡 สาเหตุ: คุณยังไม่ได้ใส่ไฟล์แผ่นติดตั้ง (.iso) ใน Optical Drive!</div>
            <div style="color:#94a3b8;">วิธีแก้: กดปุ่ม Power Off ด้านบน → กด ⚙️ Settings → เลือกไฟล์ .iso แล้วกด ▶ Start ใหม่</div>
            <br/>
            <button type="button" class="btn btn-secondary btn-sm" id="fatalBackBtn">🔌 ปิดเครื่องกลับไปใส่แผ่น ISO</button>
          </div>
        `, 'guest-bios');
        $('fatalBackBtn')?.addEventListener('click', powerOffVm);
        return;
      }

      // Identify OS from mounted ISO
      const osMission = OS_MISSIONS.find((m) => m.isoName === vm.iso);
      if (!osMission) return;
      activeMissionId = osMission.id;
      renderMissionBar();

      // 2. Check Hardware Specs (RAM / Disk / TPM)
      if (vm.ram < osMission.minRam || vm.disk < osMission.minDisk) {
        callbacks.playSound('wrong');
        setGuestScreen(`
          <div class="bios-fatal">
            <div style="color:#fbbf24;font-weight:700;">⚠️ HARDWARE REQUIREMENT ERROR (${osMission.name})</div>
            <br/>
            <div>สเปกเครื่อง VM ที่ตั้งไว้ไม่เพียงพอสำหรับการติดตั้ง ${osMission.name}:</div>
            <div>• RAM ปัจจุบัน: ${vm.ram} MB (ต้องการอย่างน้อย ${osMission.minRam} MB)</div>
            <div>• Disk ปัจจุบัน: ${vm.disk} GB (ต้องการอย่างน้อย ${osMission.minDisk} GB)</div>
            <br/>
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
                💡 <strong>บทเรียน VirtualBox:</strong> การลง Windows 11 ต้องเปิด <strong>Enable EFI</strong> และ <strong>TPM v2.0</strong> ในหน้า Settings → System ก่อนเสมอ!
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="tpmBackBtn">⚙️ ปิดเครื่องไปเปิด EFI + TPM 2.0</button>
            </div>
          </div>
        `, 'guest-win11');
        $('tpmBackBtn')?.addEventListener('click', powerOffVm);
        return;
      }

      // Launch corresponding OS realistic installer!
      if (osMission.id === 'ubuntu24') renderUbuntuStep(0);
      else if (osMission.id === 'winserv2022') renderWinServerStep(0);
      else if (osMission.id === 'rocky9') renderRockyStep(0);
      else if (osMission.id === 'debian12') renderDebianStep(0);
      else if (osMission.id === 'win11pro') renderWin11Step(0);
    }, 1150);
  }

  function completeOsInstallation(osId, finalSummaryHtml, guestTheme) {
    const m = getMission(osId);
    if (runningVm) runningVm.installedOsId = osId;
    callbacks.onMissionComplete(m);
    callbacks.playSound('levelUp');

    setGuestScreen(`
      ${finalSummaryHtml}
      <div class="install-success-banner">
        <div>🎉 <strong>ติดตั้ง ${m.name} บน Oracle VM VirtualBox สำเร็จสมบูรณ์!</strong></div>
        <div style="margin-top:0.5rem;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="btn btn-neon btn-sm" id="osDoneBackBtn">🖥️ กลับหน้า VirtualBox Manager</button>
        </div>
      </div>
    `, guestTheme);

    $('osDoneBackBtn')?.addEventListener('click', powerOffVm);
    renderMissionBar();
  }

  /* -------------------- 1. UBUNTU SERVER 24.04 (SUBIQUITY TUI) -------------------- */
  function renderUbuntuStep(step) {
    installerStep = step;
    callbacks.playSound('click');

    if (step === 0) {
      setGuestScreen(`
        <div class="grub-screen">
          <div class="grub-title">GNU GRUB version 2.12 — Ubuntu Server 24.04 LTS</div>
          <div class="grub-box">
            <button type="button" class="grub-item active" id="ubBootBtn">*Try or Install Ubuntu Server</button>
            <div class="grub-item">Ubuntu Server with the HWE kernel</div>
            <div class="grub-item">Test memory (memtest86+)</div>
          </div>
          <div class="grub-foot">คลิกเลือก <strong>*Try or Install Ubuntu Server</strong> เพื่อเข้าสู่ตัวติดตั้ง Subiquity</div>
        </div>
      `, 'guest-bios');
      $('ubBootBtn').addEventListener('click', () => renderUbuntuStep(1));
    } else if (step === 1) {
      setGuestScreen(`
        <div class="ub-tui">
          <div class="ub-bar">Ubuntu Server 24.04 LTS Installer — Step 1/5: Network Connections</div>
          <div class="ub-body">
            <p>Configure at least one interface this server can use to talk to other machines:</p>
            <div class="ub-panel">
              <div><strong>Interface:</strong> enp0s3 (eth — ${runningVm.network})</div>
              <div style="margin-top:0.5rem;">
                <label><input type="radio" name="ubNet" value="Static (192.168.10.10/24)" checked /> กำหนด Static IP: <code>192.168.10.10/24</code> (แนะนำสำหรับ Server)</label><br/>
                <label><input type="radio" name="ubNet" value="DHCPv4 (Auto)" /> รับ IP อัตโนมัติ (DHCPv4)</label>
              </div>
            </div>
            <div class="ub-actions">
              <button type="button" class="ub-btn primary" id="ubNext2">[ Done ]</button>
            </div>
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
          <div class="ub-bar">Ubuntu Server 24.04 LTS Installer — Step 2/5: Guided Storage Configuration</div>
          <div class="ub-body">
            <p>เลือกรูปแบบการแบ่งพาร์ติชันบน Virtual Hard Disk (<code>/dev/sda — ${runningVm.disk}.0 GB VBOX HARDDISK</code>):</p>
            <div class="ub-panel">
              <div><code>[X] Use an entire disk</code> (ใช้พื้นที่ดิสก์ทั้งหมด ${runningVm.disk} GB)</div>
              <div><code>[X] Set up this disk as an LVM group</code> (ext4 mount on <code>/</code>)</div>
              <div style="color:#a7f3d0;margin-top:0.4rem;">MOUNT POINT: /boot (2G) • / (ubuntu-lv ${runningVm.disk - 2}G ext4)</div>
            </div>
            <div class="ub-actions">
              <button type="button" class="ub-btn primary" id="ubNext3">[ Done &amp; Continue ]</button>
            </div>
          </div>
        </div>
      `, 'guest-ubuntu');
      $('ubNext3').addEventListener('click', () => renderUbuntuStep(3));
    } else if (step === 3) {
      setGuestScreen(`
        <div class="ub-tui">
          <div class="ub-bar">Ubuntu Server 24.04 LTS Installer — Step 3/5: Profile &amp; SSH Setup</div>
          <div class="ub-body">
            <div class="ub-form-grid">
              <label>Server's name: <input type="text" id="ubHostInp" value="${installerData.hostname}" class="ub-inp" /></label>
              <label>Pick a username: <input type="text" id="ubUserInp" value="${installerData.username}" class="ub-inp" /></label>
              <label>Choose a password: <input type="password" id="ubPassInp" value="Admin@1234" class="ub-inp" /></label>
              <label style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem;">
                <input type="checkbox" id="ubSshChk" checked /> <strong>[X] Install OpenSSH server</strong> (เปิดรีโมท SSH พอร์ต 22)
              </label>
            </div>
            <div class="ub-actions">
              <button type="button" class="ub-btn primary" id="ubStartInst">[ Install Ubuntu Server ]</button>
            </div>
          </div>
        </div>
      `, 'guest-ubuntu');
      $('ubStartInst').addEventListener('click', () => {
        installerData.hostname = $('ubHostInp').value.trim() || 'srv-ubuntu';
        installerData.username = $('ubUserInp').value.trim() || 'admin';
        installerData.installSsh = $('ubSshChk').checked;
        renderUbuntuStep(4);
      });
    } else if (step === 4) {
      const logs = [
        'curtin: partitioning /dev/sda (GPT + ext4 LVM)... OK',
        'curtin: mounting target filesystem /target... OK',
        'extracting ubuntu-24.04-server-amd64.squashfs...',
        'configuring netplan (' + installerData.ipMode + ')... OK',
        installerData.installSsh ? 'installing openssh-server (Port 22/tcp)... OK' : 'skipping openssh-server...',
        'installing GRUB bootloader to /dev/sda... OK',
        'updating initramfs & security packages... DONE!'
      ];
      setGuestScreen(`
        <div class="ub-tui">
          <div class="ub-bar">Installing system... (Subiquity Live Log)</div>
          <div class="ub-body">
            <div class="ub-progress-track"><div class="ub-progress-fill" id="ubProgFill" style="width:8%"></div></div>
            <pre class="ub-log" id="ubLogOut"></pre>
            <div class="ub-actions">
              <button type="button" class="ub-btn primary hidden" id="ubRebootBtn">[ Reboot Now ]</button>
            </div>
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
          $('ubRebootBtn').addEventListener('click', () => {
            completeOsInstallation('ubuntu24', `
              <div class="final-tty">
                <div>Ubuntu 24.04.1 LTS ${installerData.hostname} tty1</div>
                <div style="color:#34d399;margin-top:0.4rem;">${installerData.hostname} login: ${installerData.username} (Authenticated ✓)</div>
                <div>IP Config: ${installerData.ipMode} • OpenSSH: ${installerData.installSsh ? 'Active (Port 22)' : 'Not Installed'}</div>
                <div style="color:#38bdf8;">${installerData.username}@${installerData.hostname}:~$ _</div>
              </div>
            `, 'guest-bios');
          });
        }
      }, 360);
    }
  }

  /* -------------------- 2. WINDOWS SERVER 2022 SETUP -------------------- */
  function renderWinServerStep(step) {
    installerStep = step;
    callbacks.playSound('click');

    if (step === 0) {
      setGuestScreen(`
        <div class="bios-fatal">
          <div>Press any key to boot from CD or DVD.....</div>
          <br/>
          <button type="button" class="btn btn-neon btn-sm" id="wsAnyKeyBtn">⌨️ กดปุ่มใดก็ได้เพื่อบูตจากแผ่น Windows Server 2022</button>
        </div>
      `, 'guest-bios');
      $('wsAnyKeyBtn').addEventListener('click', () => renderWinServerStep(1));
    } else if (step === 1) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Windows Setup — Windows Server 2022</div>
          <div class="win-setup-body">
            <h4>Select language &amp; regional format</h4>
            <div class="win-form-row"><span>Language to install:</span><strong>English (United States)</strong></div>
            <div class="win-form-row"><span>Time and currency format:</span><strong>Thai (Thailand)</strong></div>
            <div class="win-form-row"><span>Keyboard or input method:</span><strong>US / Thai Kedmanee</strong></div>
            <div class="win-actions">
              <button type="button" class="win-btn" id="wsInstallNow">Install now →</button>
            </div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsInstallNow').addEventListener('click', () => renderWinServerStep(2));
    } else if (step === 2) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Select the operating system you want to install</div>
          <div class="win-setup-body">
            <p class="win-hint">💡 <strong>ข้อควรรู้:</strong> แบบ <em>Desktop Experience</em> จะมีหน้าต่าง GUI เต็มรูปแบบ ส่วนแบบไม่ระบุคือ <em>Server Core</em> (มีแต่ CMD/PowerShell)</p>
            <div class="win-list">
              <label class="win-list-row"><input type="radio" name="wsEd" value="Standard Evaluation (Server Core)" /> Windows Server 2022 Standard Evaluation (CLI Only)</label>
              <label class="win-list-row"><input type="radio" name="wsEd" value="Standard Evaluation (Desktop Experience)" /> Windows Server 2022 Standard Evaluation (Desktop Experience)</label>
              <label class="win-list-row"><input type="radio" name="wsEd" value="Datacenter Evaluation (Server Core)" /> Windows Server 2022 Datacenter Evaluation (CLI Only)</label>
              <label class="win-list-row active"><input type="radio" name="wsEd" value="Datacenter Evaluation (Desktop Experience)" checked /> <strong>Windows Server 2022 Datacenter Evaluation (Desktop Experience)</strong></label>
            </div>
            <div class="win-actions">
              <button type="button" class="win-btn" id="wsEdNext">Next →</button>
            </div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsEdNext').addEventListener('click', () => {
        const p = document.querySelector('input[name="wsEd"]:checked');
        if (p) installerData.winEdition = p.value;
        renderWinServerStep(3);
      });
    } else if (step === 3) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Which type of installation do you want?</div>
          <div class="win-setup-body">
            <button type="button" class="win-choice-card" disabled>
              <strong>Upgrade: Install Microsoft Server OS and keep files</strong>
              <span>(ใช้ได้เฉพาะอัปเกรดจาก Windows เดิมเท่านั้น)</span>
            </button>
            <button type="button" class="win-choice-card primary" id="wsCustomBtn">
              <strong>✅ Custom: Install Microsoft Server Operating System only (advanced)</strong>
              <span>ติดตั้งใหม่บนดิสก์เปล่า VirtualBox VDI (${runningVm.disk} GB) — เลือกอันนี้!</span>
            </button>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsCustomBtn').addEventListener('click', () => renderWinServerStep(4));
    } else if (step === 4) {
      const partHtml = installerData.partitionCreated
        ? `
          <div class="win-disk-row">Drive 0 Partition 1: System Reserved • 500 MB • System</div>
          <div class="win-disk-row active">Drive 0 Partition 2 • ${(runningVm.disk - 0.5).toFixed(1)} GB • Primary (Selected ✓)</div>
        `
        : `<div class="win-disk-row active">Drive 0 Unallocated Space • ${runningVm.disk}.0 GB (ยังไม่ได้แบ่งพาร์ติชัน)</div>`;

      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Where do you want to install the operating system?</div>
          <div class="win-setup-body">
            <div class="win-disk-table">${partHtml}</div>
            <div class="win-actions" style="justify-content:space-between;">
              <button type="button" class="win-btn secondary" id="wsNewPartBtn" ${installerData.partitionCreated ? 'disabled' : ''}>✨ New (สร้างพาร์ติชัน)</button>
              <button type="button" class="win-btn" id="wsStartCopyBtn">Next (เริ่มติดตั้ง) →</button>
            </div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsNewPartBtn')?.addEventListener('click', () => {
        installerData.partitionCreated = true;
        renderWinServerStep(4);
      });
      $('wsStartCopyBtn').addEventListener('click', () => renderWinServerStep(5));
    } else if (step === 5) {
      const stages = [
        'Copying Windows files... 100%',
        'Getting files ready for installation... 35%',
        'Getting files ready for installation... 78%',
        'Getting files ready for installation... 100%',
        'Installing features... Done',
        'Installing updates... Done',
        'Finishing up & Rebooting...'
      ];
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Installing Microsoft Server Operating System</div>
          <div class="win-setup-body">
            <div class="ub-progress-track"><div class="ub-progress-fill" id="wsProgFill" style="width:10%;background:#2563eb;"></div></div>
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
          renderWinServerStep(6);
        }
      }, 360);
    } else if (step === 6) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Customize settings — Administrator Account</div>
          <div class="win-setup-body">
            <p style="margin-bottom:0.65rem;">ตั้งรหัสผ่านบัญชี <strong>Administrator</strong> (Windows Server บังคับ Password Complexity: พิมพ์ใหญ่+พิมพ์เล็ก+ตัวเลข+สัญลักษณ์)</p>
            <div class="win-form-row"><span>User name:</span><strong>Administrator</strong></div>
            <div class="win-form-row"><span>Password:</span><input type="password" id="wsAdminPw" value="P@ssw0rd2026!" class="win-inp" /></div>
            <div id="wsPwErr" style="color:#dc2626;font-size:0.82rem;margin-top:0.35rem;"></div>
            <div class="win-actions">
              <button type="button" class="win-btn" id="wsFinishBtn">Finish ✓</button>
            </div>
          </div>
        </div>
      `, 'guest-winserv');
      $('wsFinishBtn').addEventListener('click', () => {
        const pw = $('wsAdminPw').value;
        if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
          callbacks.playSound('wrong');
          $('wsPwErr').textContent = '⚠️ รหัสผ่านไม่ผ่านเกณฑ์ความปลอดภัย (ต้อง ≥ 8 ตัว มีตัวพิมพ์ใหญ่และตัวเลข)';
          return;
        }
        completeOsInstallation('winserv2022', `
          <div class="win-desktop-mock">
            <div style="font-size:1.1rem;font-weight:700;">🪟 Windows Server 2022 — Server Manager Dashboard</div>
            <div style="font-size:0.84rem;opacity:0.9;margin-top:0.35rem;">
              Edition: ${installerData.winEdition} • Host: ${runningVm.name} • User: Administrator • Network: ${runningVm.network}
            </div>
          </div>
        `, 'guest-winserv');
      });
    }
  }

  /* -------------------- 3. ROCKY LINUX 9 (ANACONDA HUB) -------------------- */
  function renderRockyStep(step) {
    installerStep = step;
    callbacks.playSound('click');

    if (step === 0) {
      const ready = installerData.rockyDestDone && installerData.rockyRootDone && installerData.rockyNetDone;
      setGuestScreen(`
        <div class="rocky-box">
          <div class="rocky-header">🏔️ ROCKY LINUX 9.4 — INSTALLATION SUMMARY (Anaconda)</div>
          <div class="rocky-body">
            <p style="margin-bottom:0.75rem;font-size:0.86rem;">คลิกตั้งค่าให้ครบทั้ง 3 รายการ (เครื่องหมาย ⚠️) ก่อนกดปุ่ม <strong>Begin Installation</strong>:</p>
            <div class="rocky-hub-grid">
              <button type="button" class="rocky-tile ${installerData.rockyDestDone ? 'ok' : ''}" id="rkDestBtn">
                <div class="rk-ic">💾</div>
                <strong>Installation Destination</strong>
                <span>${installerData.rockyDestDone ? `✅ /dev/sda (${runningVm.disk} GB XFS)` : '⚠️ คลิกเลือกดิสก์อัตโนมัติ'}</span>
              </button>
              <button type="button" class="rocky-tile ${installerData.rockyRootDone ? 'ok' : ''}" id="rkRootBtn">
                <div class="rk-ic">🔑</div>
                <strong>Root Password</strong>
                <span>${installerData.rockyRootDone ? '✅ ตั้งรหัส Root + SSH แล้ว' : '⚠️ คลิกตั้งรหัสผ่าน root'}</span>
              </button>
              <button type="button" class="rocky-tile ${installerData.rockyNetDone ? 'ok' : ''}" id="rkNetBtn">
                <div class="rk-ic">🌐</div>
                <strong>Network &amp; Host Name</strong>
                <span>${installerData.rockyNetDone ? `✅ ens33 ON (${runningVm.network})` : '⚠️ คลิกเปิดการ์ดแลน ens33'}</span>
              </button>
            </div>
            <div class="win-actions" style="margin-top:1rem;">
              <button type="button" class="btn btn-neon btn-sm" id="rkBeginBtn" ${!ready ? 'disabled' : ''}>▶ Begin Installation</button>
            </div>
          </div>
        </div>
      `, 'guest-rocky');

      $('rkDestBtn').addEventListener('click', () => { installerData.rockyDestDone = true; renderRockyStep(0); });
      $('rkRootBtn').addEventListener('click', () => { installerData.rockyRootDone = true; renderRockyStep(0); });
      $('rkNetBtn').addEventListener('click', () => { installerData.rockyNetDone = true; renderRockyStep(0); });
      $('rkBeginBtn').addEventListener('click', () => renderRockyStep(1));
    } else if (step === 1) {
      const steps = [
        'Creating XFS filesystem on /dev/sda2...',
        'Installing DNF core packages (342/342)...',
        'Configuring SELinux (Enforcing) & Firewalld...',
        'Installing GRUB2 Bootloader... Complete!'
      ];
      setGuestScreen(`
        <div class="rocky-box">
          <div class="rocky-header">🏔️ ROCKY LINUX 9.4 — INSTALLING...</div>
          <div class="rocky-body">
            <div class="ub-progress-track"><div class="ub-progress-fill" id="rkProgFill" style="width:15%;background:#10b981;"></div></div>
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
          completeOsInstallation('rocky9', `
            <div class="final-tty">
              <div>Rocky Linux 9.4 (Blue Onyx) • Kernel 5.14.0-el9.x86_64</div>
              <div style="color:#34d399;margin-top:0.4rem;">${runningVm.name} login: root (SELinux: Enforcing • FileSystem: XFS)</div>
              <div style="color:#38bdf8;">[root@${runningVm.name} ~]# _</div>
            </div>
          `, 'guest-bios');
        }
      }, 420);
    }
  }

  /* -------------------- 4. DEBIAN 12 (CLASSIC BLUE-GREY NCURSES TUI) -------------------- */
  function renderDebianStep(step) {
    installerStep = step;
    callbacks.playSound('click');

    if (step === 0) {
      setGuestScreen(`
        <div class="deb-tui">
          <div class="deb-box">
            <div class="deb-title">[!] Configure the network &amp; Partition disks (Debian 12)</div>
            <p>Hostname: <strong>${runningVm.name}</strong> • Domain: <strong>college.local</strong></p>
            <p style="margin-top:0.4rem;">Partitioning method: <strong>Guided - use entire disk (${runningVm.disk} GB VBOX HARDDISK) → All files in one partition</strong></p>
            <div class="deb-actions">
              <button type="button" class="deb-btn" id="debStep1">&lt; Continue &amp; Write changes to disk &gt;</button>
            </div>
          </div>
        </div>
      `, 'guest-debian');
      $('debStep1').addEventListener('click', () => renderDebianStep(1));
    } else if (step === 1) {
      setGuestScreen(`
        <div class="deb-tui">
          <div class="deb-box">
            <div class="deb-title">[!] Software selection (tasksel)</div>
            <p style="margin-bottom:0.5rem;">เลือกซอฟต์แวร์สำหรับ Debian Headless Server (แนะนำ: ไม่ต้องลง Desktop GUI เพื่อประหยัด RAM!):</p>
            <label style="display:block;"><input type="checkbox" id="debGuiChk" /> [ ] Debian desktop environment (GNOME GUI)</label>
            <label style="display:block;"><input type="checkbox" id="debSshChk" checked /> [*] SSH server (พอร์ต 22)</label>
            <label style="display:block;"><input type="checkbox" checked disabled /> [*] standard system utilities</label>
            <div class="deb-actions">
              <button type="button" class="deb-btn" id="debStep2">&lt; Continue (Install Packages &amp; GRUB) &gt;</button>
            </div>
          </div>
        </div>
      `, 'guest-debian');
      $('debStep2').addEventListener('click', () => {
        installerData.debianGui = $('debGuiChk').checked;
        installerData.debianSsh = $('debSshChk').checked;
        renderDebianStep(2);
      });
    } else if (step === 2) {
      setGuestScreen(`
        <div class="deb-tui">
          <div class="deb-box">
            <div class="deb-title">Installing Debian 12 "Bookworm" + GRUB Bootloader</div>
            <div class="ub-progress-track" style="margin:0.8rem 0;"><div class="ub-progress-fill" id="debProg" style="width:20%;background:#ef4444;"></div></div>
            <div id="debLog" style="font-size:0.84rem;">Installing base system...</div>
          </div>
        </div>
      `, 'guest-debian');
      let pct = 20;
      installProgressTimer = setInterval(() => {
        pct += 25;
        $('debProg').style.width = `${Math.min(100, pct)}%`;
        callbacks.playSound('terminal');
        if (pct === 45) $('debLog').textContent = 'Installing openssh-server & systemd...';
        if (pct === 70) $('debLog').textContent = 'Installing GRUB boot loader on /dev/sda...';
        if (pct >= 100) {
          clearInterval(installProgressTimer);
          completeOsInstallation('debian12', `
            <div class="final-tty">
              <div>Debian GNU/Linux 12 ${runningVm.name} tty1</div>
              <div style="color:#34d399;margin-top:0.4rem;">Mode: ${installerData.debianGui ? 'Desktop GUI' : 'Headless Server (Minimal RAM!)'} • SSH: ${installerData.debianSsh ? 'Active' : 'Off'}</div>
              <div style="color:#38bdf8;">root@${runningVm.name}:~# _</div>
            </div>
          `, 'guest-bios');
        }
      }, 420);
    }
  }

  /* -------------------- 5. WINDOWS 11 PRO (DOMAIN CLIENT) -------------------- */
  function renderWin11Step(step) {
    installerStep = step;
    callbacks.playSound('click');

    if (step === 0) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Windows 11 Setup (UEFI + TPM 2.0 Verified ✓)</div>
          <div class="win-setup-body">
            <p style="margin-bottom:0.65rem;">💡 <strong>บทเรียน Domain Client:</strong> หากต้องการนำเครื่องลูกข่าย Join เข้า Active Directory Domain ต้องเลือก <strong>Windows 11 Pro</strong> (รุ่น Home ไม่สามารถ Join Domain ได้!)</p>
            <div class="win-list">
              <label class="win-list-row"><input type="radio" name="w11Ed" value="Home" /> Windows 11 Home (ไม่รองรับ Join AD Domain)</label>
              <label class="win-list-row active"><input type="radio" name="w11Ed" value="Pro" checked /> <strong>Windows 11 Pro (รองรับ Join Active Directory &amp; GPO ✓)</strong></label>
            </div>
            <div id="w11Err" style="color:#dc2626;font-size:0.82rem;margin-top:0.35rem;"></div>
            <div class="win-actions">
              <button type="button" class="win-btn" id="w11Next1">Next →</button>
            </div>
          </div>
        </div>
      `, 'guest-win11');
      $('w11Next1').addEventListener('click', () => {
        const val = document.querySelector('input[name="w11Ed"]:checked')?.value;
        if (val !== 'Pro') {
          callbacks.playSound('wrong');
          $('w11Err').textContent = '⚠️ Windows 11 Home ไม่สามารถเข้าร่วม Active Directory Domain ได้ กรุณาเลือก Windows 11 Pro!';
          return;
        }
        renderWin11Step(1);
      });
    } else if (step === 1) {
      setGuestScreen(`
        <div class="win-setup-box">
          <div class="win-setup-header">Installing Windows 11 Pro on Drive 0 (${runningVm.disk} GB GPT)</div>
          <div class="win-setup-body">
            <div class="ub-progress-track" style="margin:0.8rem 0;"><div class="ub-progress-fill" id="w11Prog" style="width:15%;background:#0284c7;"></div></div>
            <div id="w11Log" style="font-size:0.86rem;">Copying Windows 11 Pro files...</div>
          </div>
        </div>
      `, 'guest-win11');
      let pct = 15;
      installProgressTimer = setInterval(() => {
        pct += 25;
        $('w11Prog').style.width = `${Math.min(100, pct)}%`;
        callbacks.playSound('terminal');
        if (pct === 40) $('w11Log').textContent = 'Installing drivers & VirtualBox Guest Additions...';
        if (pct === 65) $('w11Log').textContent = 'Configuring OOBE (Region: Thailand, Local Account: client01)...';
        if (pct >= 100) {
          clearInterval(installProgressTimer);
          completeOsInstallation('win11pro', `
            <div class="win-desktop-mock">
              <div style="font-size:1.1rem;font-weight:700;">💻 Windows 11 Pro Desktop — Ready to Join Domain!</div>
              <div style="font-size:0.84rem;opacity:0.9;margin-top:0.35rem;">
                UEFI + TPM 2.0 ✓ • Host: ${runningVm.name} • Network: ${runningVm.network} • พร้อมเชื่อมต่อ Active Directory!
              </div>
            </div>
          `, 'guest-win11');
        }
      }, 420);
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
    $('vboxStartBtn')?.addEventListener('click', startSelectedVm);
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
        callbacks.playSound('click');
        renderManagerView();
      }
    });

    $('vmRamInp')?.addEventListener('input', (e) => {
      $('vmRamVal').textContent = `${e.target.value} MB`;
    });

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
        const newVm = { id: 'vm_' + Date.now(), installedOsId: null, ...vmData };
        vms.push(newVm);
        selectedVmId = newVm.id;
        callbacks.toast(`🖥️ สร้างเครื่องเสมือน "${vmData.name}" สำเร็จ! กด ▶ Start เพื่อติดตั้ง OS`);
      }
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
