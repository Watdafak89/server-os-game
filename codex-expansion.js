/* ServerOps: Codex Textbook Expansion (Volumes 11–20 covering ALL 50 World Map Zones across 5 Continents!)
 * Tags existing Volumes 1–10 with Zone mappings and appends Volumes 11–20 into CODEX_VOLUMES.
 */
(() => {
  /* Tag Volumes 1–10 with their mapped Continent & Zone IDs */
  const BASE_ZONE_MAP = {
    vol1:  { continent: 1, zoneRange: 'Zone 01 (ด่าน 1-1)', targetZoneId: 'z1' },
    vol2:  { continent: 1, zoneRange: 'Zone 01 (ด่าน 1-2)', targetZoneId: 'z1' },
    vol3:  { continent: 1, zoneRange: 'Zone 01 (บอสโซน 1)', targetZoneId: 'z1' },
    vol4:  { continent: 1, zoneRange: 'Zone 02 (Network Hub)', targetZoneId: 'z2' },
    vol5:  { continent: 1, zoneRange: 'Zone 03 (Identity Vault)', targetZoneId: 'z3' },
    vol6:  { continent: 1, zoneRange: 'Zone 04 (Command Deck)', targetZoneId: 'z4' },
    vol7:  { continent: 1, zoneRange: 'Zone 05 (Defense Bunker)', targetZoneId: 'z5' },
    vol8:  { continent: 1, zoneRange: 'Zone 06 (Blackout Crisis)', targetZoneId: 'z6' },
    vol9:  { continent: 1, zoneRange: 'Zone 07 (Cloud & Docker)', targetZoneId: 'z7' },
    vol10: { continent: 1, zoneRange: 'Zone 08 (Forensics Spire)', targetZoneId: 'z8' }
  };

  CODEX_VOLUMES.forEach((v) => {
    const m = BASE_ZONE_MAP[v.id];
    if (m) Object.assign(v, m);
  });

  const NEW_VOLUMES = [
    /* ==================== VOL 11: ZONE 09–10 ==================== */
    {
      id: 'vol11',
      vol: 'บทที่ 11',
      continent: 1,
      zoneRange: 'Zone 09–10 (ทวีปที่ 1)',
      targetZoneId: 'z9',
      icon: '⚡',
      color: '#38bdf8',
      title: 'BIOS/UEFI, GRUB2 & Enterprise Hypervisor',
      subtitle: 'กระบวนการบูตเครื่องแม่ข่าย POST, UEFI+GPT, Secure Boot, Type-1 Hypervisor และ Live Migration',
      readTime: '6 นาที',
      objectives: [
        'ไล่ลำดับการบูตเครื่องแม่ข่ายตั้งแต่ POST → UEFI/GPT → GRUB2 → Kernel ได้ถูกต้อง',
        'แยกความต่างระหว่าง Type-1 (Bare-Metal) และ Type-2 Hypervisor พร้อมจัดการ VM Snapshot & Live Migration',
        'เข้าใจการจัดการเครื่องระยะไกลแบบ Out-of-Band (iDRAC / iLO / IPMI) เมื่อระบบปฏิบัติการล่ม'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 210" class="codex-svg">
          <rect width="760" height="210" rx="14" fill="#0b1325"/>
          <text x="380" y="28" text-anchor="middle" fill="#38bdf8" font-size="15" font-weight="700">ลำดับการบูต Server (Zone 09) &amp; โครงสร้าง Type-1 Hypervisor (Zone 10)</text>
          <rect x="26" y="48" width="128" height="48" rx="8" fill="#1e3a5f" stroke="#38bdf8"/>
          <text x="90" y="70" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">1. Power + POST</text>
          <text x="90" y="86" text-anchor="middle" fill="#bae6fd" font-size="10">เช็ก CPU/RAM/Disk</text>
          <text x="168" y="76" fill="#fbbf24" font-size="18">→</text>
          <rect x="186" y="48" width="142" height="48" rx="8" fill="#1e3a5f" stroke="#34d399"/>
          <text x="257" y="70" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">2. UEFI + GPT</text>
          <text x="257" y="86" text-anchor="middle" fill="#a7f3d0" font-size="10">Secure Boot (&gt;2TB)</text>
          <text x="342" y="76" fill="#fbbf24" font-size="18">→</text>
          <rect x="360" y="48" width="150" height="48" rx="8" fill="#1e3a5f" stroke="#fbbf24"/>
          <text x="435" y="70" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">3. GRUB2 (/boot)</text>
          <text x="435" y="86" text-anchor="middle" fill="#fde68a" font-size="10">โหลด Kernel/initramfs</text>
          <text x="524" y="76" fill="#fbbf24" font-size="18">→</text>
          <rect x="542" y="48" width="192" height="48" rx="8" fill="#134e4a" stroke="#2dd4bf"/>
          <text x="638" y="70" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">4. Type-1 Hypervisor</text>
          <text x="638" y="86" text-anchor="middle" fill="#99f6e4" font-size="10">ESXi / Proxmox / Hyper-V</text>
          <rect x="40" y="122" width="210" height="62" rx="10" fill="#172554" stroke="#60a5fa"/>
          <text x="145" y="148" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="700">Host A (VT-x / AMD-V)</text>
          <text x="145" y="168" text-anchor="middle" fill="#e2e8f0" font-size="11">VM-Web • VM-DB (Snapshot ✓)</text>
          <line x1="255" y1="153" x2="495" y2="153" stroke="#34d399" stroke-width="3" stroke-dasharray="7 4"/>
          <text x="375" y="144" text-anchor="middle" fill="#34d399" font-size="12" font-weight="700">Live Migration (Zero Downtime)</text>
          <rect x="505" y="122" width="210" height="62" rx="10" fill="#172554" stroke="#60a5fa"/>
          <text x="610" y="148" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="700">Host B (Standby/Active)</text>
          <text x="610" y="168" text-anchor="middle" fill="#e2e8f0" font-size="11">รับช่วง VM ต่อทันทีไม่หลุด!</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. UEFI + GPT vs Legacy BIOS + MBR (พิชิต Zone 09)',
          table: {
            headers: ['หัวข้อ', 'Legacy BIOS + MBR', 'UEFI + GPT (มาตรฐานยุคใหม่)'],
            rows: [
              ['ขนาดดิสก์สูงสุด', 'ไม่เกิน 2 TB (4 Primary Partitions)', 'ใหญ่กว่า 2 TB (ระดับ Zettabyte, 128 Partitions)'],
              ['ความปลอดภัยตอนบูต', 'ไม่มีการตรวจลายเซ็น', 'รองรับ Secure Boot ป้องกัน Bootkit/Rootkit'],
              ['Bootloader Linux', 'GRUB / GRUB2 ใน /boot', 'GRUB2 + EFI System Partition (ESP) ใน /boot/efi']
            ]
          }
        },
        {
          heading: '2. Virtualization & การจัดการเครื่องระยะไกล (พิชิต Zone 10)',
          bullets: [
            '<strong>POST (Power-On Self-Test):</strong> ตรวจสอบ CPU/RAM/อุปกรณ์ทันทีที่เปิดเครื่องก่อนส่งต่อให้ Bootloader',
            '<strong>IPMI / Dell iDRAC / HPE iLO:</strong> การ์ดจัดการ Out-of-Band ใช้เข้าหน้าจอ BIOS และ Mount ISO ข้ามเน็ตได้แม้ OS ล่ม',
            '<strong>Type-1 Hypervisor:</strong> ติดตั้งตรงบนฮาร์ดแวร์ (VMware ESXi, Proxmox VE/KVM, Hyper-V) ต้องเปิด <strong>Intel VT-x / AMD-V</strong> ใน BIOS',
            '<strong>VM Snapshot & Live Migration:</strong> Snapshot ใช้ย้อนจุดก่อนอัปเดต • Live Migration (vMotion) ย้าย VM ข้าม Host โดยไม่ต้องปิดเครื่อง',
            '<strong>Thin Provisioning:</strong> จองดิสก์โตตามข้อมูลจริง ประหยัดพื้นที่แต่ต้องเฝ้าระวังไม่ให้ Storage จริงเต็ม (Overcommit)'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> UEFI + Secure Boot เหมือนยามหน้าประตูตึกที่ตรวจบัตรประชาชนก่อนให้เข้าตึก ส่วน Live Migration เหมือนการเปลี่ยนยางรถหรือย้ายผู้โดยสารข้ามตู้รถไฟระหว่างที่รถไฟยังวิ่งอยู่โดยผู้โดยสารไม่รู้ตัว!',
      cheatSheet: `# ตรวจสอบโหมด UEFI และอัปเดต GRUB2 บน Ubuntu Server
ls /sys/firmware/efi
sudo nano /etc/default/grub
sudo update-grub

# ตรวจสอบว่าเปิด CPU Virtualization (VT-x / AMD-V) แล้วหรือยัง
egrep -c '(vmx|svm)' /proc/cpuinfo`,
      examTips: [
        'ดิสก์ใหญ่กว่า 2 TB และต้องการ Secure Boot ต้องใช้ <strong>UEFI + GPT</strong> เสมอ',
        'แก้ <code>/etc/default/grub</code> แล้วต้องรัน <code>sudo update-grub</code> เสมอ • ไฟล์ Kernel อยู่ใน <code>/boot</code>',
        'โหมดการ์ดแลน <strong>Bridged Adapter</strong> ทำให้ VM ได้ IP วง LAN เดียวกับเครื่องจริง'
      ]
    },

    /* ==================== VOL 12: ZONE 11–13 ==================== */
    {
      id: 'vol12',
      vol: 'บทที่ 12',
      continent: 2,
      zoneRange: 'Zone 11–13 (ทวีปที่ 2: Linuxia)',
      targetZoneId: 'z11',
      icon: '🌳',
      color: '#34d399',
      title: 'Linux Core: FHS, Package Manager & Systemd',
      subtitle: 'โครงสร้างไดเรกทอรี /etc /var /proc, Inode, APT vs DNF, GPG Repo, systemctl และ journalctl',
      readTime: '6 นาที',
      objectives: [
        'ระบุหน้าที่ของไดเรกทอรีหลักใน Linux FHS (/etc, /var/log, /proc, /boot, /dev/null) และแก้ปัญหา Inode เต็มได้',
        'เลือกใช้ APT (Debian/Ubuntu) และ DNF (Rocky/RHEL) รวมถึงตรวจสอบความปลอดภัย GPG Key ได้',
        'ควบคุมบริการผ่าน systemd (reload vs restart, enable --now, mask, daemon-reload) และไล่ Log ด้วย journalctl ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 210" class="codex-svg">
          <rect width="760" height="210" rx="14" fill="#071915"/>
          <text x="380" y="28" text-anchor="middle" fill="#34d399" font-size="15" font-weight="700">Linux Filesystem Hierarchy (FHS) &amp; Systemd PID 1 (Zone 11–13)</text>
          <rect x="330" y="42" width="100" height="32" rx="8" fill="#065f46" stroke="#34d399" stroke-width="2"/>
          <text x="380" y="63" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">/ (Root)</text>
          <g stroke="#34d399" stroke-width="1.6">
            <line x1="350" y1="74" x2="90" y2="112"/><line x1="365" y1="74" x2="235" y2="112"/>
            <line x1="380" y1="74" x2="380" y2="112"/><line x1="395" y1="74" x2="525" y2="112"/>
            <line x1="410" y1="74" x2="670" y2="112"/>
          </g>
          <rect x="28" y="112" width="124" height="68" rx="8" fill="#0f2922" stroke="#38bdf8"/>
          <text x="90" y="136" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="700">/etc</text>
          <text x="90" y="156" text-anchor="middle" fill="#cbd5e1" font-size="10">ไฟล์ตั้งค่าระบบ</text>
          <text x="90" y="170" text-anchor="middle" fill="#94a3b8" font-size="9">nginx, ssh, fstab</text>
          <rect x="173" y="112" width="124" height="68" rx="8" fill="#0f2922" stroke="#fbbf24"/>
          <text x="235" y="136" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="700">/var/log</text>
          <text x="235" y="156" text-anchor="middle" fill="#cbd5e1" font-size="10">ไฟล์ Log &amp; DB</text>
          <text x="235" y="170" text-anchor="middle" fill="#94a3b8" font-size="9">auth.log, syslog</text>
          <rect x="318" y="112" width="124" height="68" rx="8" fill="#0f2922" stroke="#c084fc"/>
          <text x="380" y="136" text-anchor="middle" fill="#c084fc" font-size="13" font-weight="700">/proc</text>
          <text x="380" y="156" text-anchor="middle" fill="#cbd5e1" font-size="10">Virtual FS ใน RAM</text>
          <text x="380" y="170" text-anchor="middle" fill="#94a3b8" font-size="9">cpuinfo, PIDs</text>
          <rect x="463" y="112" width="124" height="68" rx="8" fill="#0f2922" stroke="#f472b6"/>
          <text x="525" y="136" text-anchor="middle" fill="#f472b6" font-size="13" font-weight="700">/boot</text>
          <text x="525" y="156" text-anchor="middle" fill="#cbd5e1" font-size="10">Kernel + GRUB2</text>
          <text x="525" y="170" text-anchor="middle" fill="#94a3b8" font-size="9">vmlinuz, initrd</text>
          <rect x="608" y="112" width="124" height="68" rx="8" fill="#0f2922" stroke="#34d399"/>
          <text x="670" y="136" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700">/dev/null</text>
          <text x="670" y="156" text-anchor="middle" fill="#cbd5e1" font-size="10">หลุมดำทิ้ง Output</text>
          <text x="670" y="170" text-anchor="middle" fill="#94a3b8" font-size="9">&gt; /dev/null 2&gt;&amp;1</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. Inode, Symlink & คลังแพ็กเกจ (พิชิต Zone 11–12)',
          bullets: [
            '<strong>Inode เต็ม (<code>df -i</code>):</strong> แม้เหลือพื้นที่ GB แต่หากมีไฟล์เล็กนับล้านจน Inode 100% จะสร้างไฟล์ใหม่ไม่ได้เลย!',
            '<strong>Symbolic Link (<code>ln -s target link</code>):</strong> สร้างทางลัดชี้ไปโฟลเดอร์เวอร์ชันใหม่ได้ทันที • ค้นหาไฟล์ใช้ <code>find /var/log -name "*.log"</code>',
            '<strong>Ubuntu/Debian ใช้ APT (<code>.deb</code>) vs Rocky/RHEL ใช้ DNF (<code>.rpm</code>):</strong> ต้องสั่ง <code>apt update</code> (อัปเดตดัชนี) ก่อน <code>apt upgrade</code> (ติดตั้งเวอร์ชันใหม่)',
            '<strong>GPG Public Key & unattended-upgrades:</strong> GPG ยืนยันว่าแพ็กเกจไม่ถูกปลอมแปลง • <code>apt autoremove</code> ล้างไลบรารีที่ไม่ได้ใช้แล้ว'
          ]
        },
        {
          heading: '2. Systemd (PID 1) & การคุมบริการแบบ Zero-Downtime (พิชิต Zone 13)',
          table: {
            headers: ['คำสั่ง systemd', 'ผลลัพธ์การทำงานจริง'],
            rows: [
              ['systemctl enable --now nginx', 'ตั้งให้เปิดอัตโนมัติตอนบูต + สั่งเริ่มทำงานทันทีในคำสั่งเดียว'],
              ['systemctl reload vs restart', 'reload โหลด config ใหม่โดยไม่ตัดลูกค้า • restart ปิดแล้วเปิดใหม่'],
              ['systemctl daemon-reload', 'ต้องรันทุกครั้งหลังสร้าง/แก้ไฟล์ /etc/systemd/system/*.service'],
              ['systemctl mask <svc>', 'ล็อกบริการไม่ให้สั่ง start ได้เลย (ลิงก์ไป /dev/null)'],
              ['journalctl -u mysql -n 50 -f', 'ดู Log ของ mysql 50 บรรทัดล่าสุดพร้อมติดตามสดเรียลไทม์']
            ]
          }
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> Inode เหมือน "เลขทะเบียนบ้าน" แม้มีที่ดินว่างเหลือเฟือ (GB เหลือ) แต่ถ้าเลขทะเบียนบ้านหมด ก็สร้างบ้านหลังใหม่ไม่ได้! ส่วน <code>systemd</code> คือผู้จัดการอาคาร (PID 1) ที่คอยปลุกบริการที่ดับให้ตื่นขึ้นมาใหม่ (<code>Restart=always</code>)',
      cheatSheet: `df -i                                   # เช็กเปอร์เซ็นต์ Inode เต็มหรือไม่
find /var/log -name "*.log"             # ค้นหาไฟล์ .log ทั้งหมด
sudo apt update && sudo apt upgrade -y  # อัปเดต Ubuntu/Debian
sudo apt install ./app.deb              # ติดตั้งไฟล์ .deb พร้อมแก้ dependency
sudo systemctl daemon-reload            # โหลด Unit file ใหม่
journalctl -u nginx -n 50 -f            # ดู Log บริการสด ๆ`,
      examTips: [
        '<code>/proc</code> เป็น Virtual Filesystem ใน RAM (ไม่ได้กินพื้นที่ดิสก์) • <code>/dev/null</code> คือหลุมดำทิ้งข้อมูล',
        'ความต่าง <code>reload</code> (ไม่ตัดลูกค้า) vs <code>restart</code> (ปิด-เปิดใหม่) ออกข้อสอบและบอสโซน 13 บ่อยมาก!',
        'ตั้งค่า <code>Restart=always</code> ในไฟล์ <code>.service</code> เพื่อให้แอปฟื้นตัวอัตโนมัติเมื่อแครช'
      ]
    },

    /* ==================== VOL 13: ZONE 14–16 ==================== */
    {
      id: 'vol13',
      vol: 'บทที่ 13',
      continent: 2,
      zoneRange: 'Zone 14–16 (ทวีปที่ 2: Linuxia)',
      targetZoneId: 'z14',
      icon: '💽',
      color: '#10b981',
      title: 'LVM Storage, Process Control & Bash Scripting',
      subtitle: 'ขยายดิสก์ออนไลน์ด้วย LVM (PV→VG→LV), /etc/fstab UUID, kill -15/-9, OOM Killer และ Pipe/grep/awk',
      readTime: '7 นาที',
      objectives: [
        'อธิบายโครงสร้าง LVM 3 ชั้น (PV → VG → LV) และขยายพื้นที่พาร์ติชันออนไลน์โดยไม่เสียข้อมูลได้',
        'ควบคุมโปรเซส Linux ด้วย ps aux, kill -15 vs -9, nice (-20..+19), cgroups และ lsof ได้',
        'เขียน Bash Script และใช้ Pipe |, Redirection (> vs >>), Exit Code ($?), grep และ awk วิเคราะห์ Log ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 210" class="codex-svg">
          <rect width="760" height="210" rx="14" fill="#071915"/>
          <text x="380" y="28" text-anchor="middle" fill="#34d399" font-size="15" font-weight="700">สถาปัตยกรรม LVM 3 ชั้น (Zone 14) &amp; ท่อส่งข้อมูล Bash Pipe (Zone 16)</text>
          <rect x="30" y="142" width="130" height="44" rx="8" fill="#1e293b" stroke="#94a3b8"/>
          <text x="95" y="168" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="700">PV: /dev/sdb</text>
          <rect x="175" y="142" width="130" height="44" rx="8" fill="#1e293b" stroke="#94a3b8"/>
          <text x="240" y="168" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="700">PV: /dev/sdc</text>
          <rect x="30" y="92" width="275" height="38" rx="8" fill="#065f46" stroke="#34d399"/>
          <text x="167" y="116" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">VG (Volume Group — บ่อรวมพื้นที่)</text>
          <rect x="30" y="44" width="130" height="38" rx="8" fill="#0284c7" stroke="#38bdf8"/>
          <text x="95" y="68" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">LV: /var (ext4)</text>
          <rect x="175" y="44" width="130" height="38" rx="8" fill="#0ea5e9" stroke="#38bdf8"/>
          <text x="240" y="68" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">LV: /data (XFS)</text>
          <line x1="345" y1="42" x2="345" y2="190" stroke="rgba(148,163,184,0.3)" stroke-dasharray="5 5"/>
          <text x="550" y="62" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="700">Bash Pipeline (Zone 16)</text>
          <rect x="372" y="82" width="106" height="42" rx="8" fill="#0f172a" stroke="#38bdf8"/>
          <text x="425" y="107" text-anchor="middle" fill="#7dd3fc" font-size="11">cat access.log</text>
          <text x="490" y="108" fill="#fbbf24" font-size="18" font-weight="700">|</text>
          <rect x="505" y="82" width="104" height="42" rx="8" fill="#0f172a" stroke="#34d399"/>
          <text x="557" y="107" text-anchor="middle" fill="#6ee7b7" font-size="11">grep "404"</text>
          <text x="620" y="108" fill="#fbbf24" font-size="18" font-weight="700">|</text>
          <rect x="636" y="82" width="96" height="42" rx="8" fill="#0f172a" stroke="#f472b6"/>
          <text x="684" y="107" text-anchor="middle" fill="#fbcfe8" font-size="11">wc -l</text>
          <text x="550" y="156" text-anchor="middle" fill="#cbd5e1" font-size="11">&gt; เขียนทับไฟล์เดิม • &gt;&gt; ต่อท้ายไฟล์เดิม • $? = 0 คือสำเร็จ!</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. LVM Storage & การ Mount ถาวรใน /etc/fstab (พิชิต Zone 14)',
          bullets: [
            '<strong>ลำดับ LVM 3 ชั้น:</strong> ดิสก์จริง <code>PV (Physical Volume)</code> → รวมเป็นบ่อ <code>VG (Volume Group)</code> → แบ่งใช้งานเป็น <code>LV (Logical Volume)</code>',
            '<strong>ขยายพื้นที่ออนไลน์:</strong> สั่ง <code>lvextend -L +20G /dev/vg0/lv_data</code> แล้วต้องขยาย File System ตามด้วย <code>resize2fs</code> (ext4) หรือ <code>xfs_growfs</code> (XFS) (หรือใส่ <code>-r</code> จบในคำสั่งเดียว)',
            '<strong>/etc/fstab:</strong> ควรระบุด้วย <code>UUID=...</code> แทน <code>/dev/sdb1</code> กันชื่อดิสก์สลับ และทดสอบก่อนรีบูตด้วย <code>sudo mount -a</code> • ดูผังดิสก์ด้วย <code>lsblk</code>'
          ]
        },
        {
          heading: '2. การคุม Process, Signals & Bash Automation (พิชิต Zone 15–16)',
          bullets: [
            '<strong>kill -15 (SIGTERM) vs kill -9 (SIGKILL):</strong> ใช้ <code>-15</code> ขอให้โปรแกรมเซฟและปิดเรียบร้อยก่อนเสมอ หากค้างจริงค่อยใช้ <code>-9</code> บังคับตัดจบ',
            '<strong>ค่า nice (-20 ถึง +19):</strong> ค่ายิ่งติดลบ (<code>-20</code>) ยิ่งได้สิทธิ์ CPU สูงสุด • <strong>OOM Killer</strong> จะปิดโปรเซสที่กินแรมหนักเมื่อ RAM+Swap เต็ม 100%',
            '<strong>Zombie Process (Z):</strong> ลูกตายแล้วแต่แม่ยังไม่เก็บสถานะ • <strong>cgroups</strong> จำกัดโควตา CPU/RAM • <strong>lsof -i :80</strong> ดูโปรเซสที่ยึดพอร์ต',
            '<strong>Bash Essentials:</strong> บรรทัดแรกใส่ Shebang <code>#!/bin/bash</code> • Exit Code <code>$? == 0</code> คือสำเร็จ • <code>&amp;&amp;</code> รันคำสั่งขวาเฉพาะเมื่อซ้ายผ่าน • <code>grep -i</code> ค้นหาไม่สนตัวเล็ก-ใหญ่ • <code>awk</code> ดึงคอลัมน์ข้อมูล'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> LVM เหมือนการเทน้ำจากถังหลายใบ (PV) รวมใส่แทงก์ใหญ่ (VG) แล้วค่อยต่อท่อแบ่งน้ำไปแต่ละห้อง (LV) — ห้องไหนน้ำไม่พอก็เปิดวาล์วขยายได้ทันทีไม่ต้องทุบกำแพง!',
      cheatSheet: `lsblk                                     # ดูผังดิสก์ พาร์ติชัน และ LVM
sudo lvextend -r -L +20G /dev/vg0/lv_data # ขยาย LV + File System ทันที
sudo mount -a                             # ทดสอบ /etc/fstab ก่อนรีบูต
ps aux | grep nginx && lsof -i :80        # เช็กโปรเซสและพอร์ตที่เปิดอยู่
grep -i "Failed password" /var/log/auth.log | awk '{print $11}'`,
      examTips: [
        'ห้ามใช้ <code>mkfs.ext4</code> ตอนขยาย LVM เพราะจะฟอร์แมตล้างข้อมูลทิ้ง! ต้องใช้ <code>resize2fs</code> หรือ <code>lvextend -r</code>',
        'จำ <code>&gt;</code> เขียนทับ vs <code>&gt;&gt;</code> เขียนต่อท้าย และ Exit Code <code>0</code> = สำเร็จ (Success)',
        '<code>nice -20</code> สำคัญสูงสุด • <code>nice +19</code> สำคัญต่ำสุด (ใจดีแบ่ง CPU ให้คนอื่น)'
      ]
    },

    /* ==================== VOL 14: ZONE 17–20 ==================== */
    {
      id: 'vol14',
      vol: 'บทที่ 14',
      continent: 2,
      zoneRange: 'Zone 17–20 (ทวีปที่ 2: Linuxia)',
      targetZoneId: 'z17',
      icon: '🔑',
      color: '#06b6d4',
      title: 'SSH Hardening, NFS/Samba, Nginx & SELinux',
      subtitle: 'กุญแจ Ed25519, Fail2ban, SMBv3 vs SMBv1, Reverse Proxy/502/Certbot และ MAC (SELinux/AppArmor)',
      readTime: '7 นาที',
      objectives: [
        'ตั้งค่า SSH Key-Based Authentication (Ed25519), ปิด Root/Password Login, ใช้ Fail2ban และ SSH Tunneling ได้',
        'เลือกใช้ NFS (Linux↔Linux) และ Samba/SMB3 (Linux↔Windows) พร้อมปิดช่องโหว่ SMBv1 ได้',
        'ตั้งค่า Nginx Reverse Proxy/Upstream Load Balancer, แก้ Error 502, ติด SSL Certbot และจัดการ SELinux Context ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 210" class="codex-svg">
          <rect width="760" height="210" rx="14" fill="#081426"/>
          <text x="380" y="28" text-anchor="middle" fill="#22d3ee" font-size="15" font-weight="700">Linux Production Stack: SSH Key + Nginx Reverse Proxy + SELinux (Zone 17–20)</text>
          <rect x="28" y="54" width="150" height="122" rx="10" fill="#162238" stroke="#38bdf8"/>
          <text x="103" y="80" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="700">Admin / Users</text>
          <text x="103" y="106" text-anchor="middle" fill="#e2e8f0" font-size="10">SSH Ed25519 Key (22)</text>
          <text x="103" y="128" text-anchor="middle" fill="#34d399" font-size="10">HTTPS + Certbot (443)</text>
          <text x="103" y="150" text-anchor="middle" fill="#fbbf24" font-size="10">Samba SMB3 (445 LAN)</text>
          <line x1="178" y1="115" x2="246" y2="115" stroke="#34d399" stroke-width="2.5"/>
          <rect x="248" y="54" width="220" height="122" rx="10" fill="#0c4a6e" stroke="#22d3ee" stroke-width="2"/>
          <text x="358" y="80" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">Nginx Reverse Proxy</text>
          <text x="358" y="102" text-anchor="middle" fill="#bae6fd" font-size="10">Event-Driven • upstream pool</text>
          <text x="358" y="124" text-anchor="middle" fill="#fde047" font-size="10">nginx -t ก่อน reload เสมอ!</text>
          <text x="358" y="148" text-anchor="middle" fill="#f87171" font-size="10">Backend ดับ = 502 Bad Gateway</text>
          <line x1="468" y1="90" x2="536" y2="90" stroke="#38bdf8" stroke-width="2"/>
          <line x1="468" y1="140" x2="536" y2="140" stroke="#38bdf8" stroke-width="2"/>
          <rect x="538" y="54" width="194" height="54" rx="8" fill="#064e3b" stroke="#34d399"/>
          <text x="635" y="78" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">SELinux (Enforcing)</text>
          <text x="635" y="96" text-anchor="middle" fill="#a7f3d0" font-size="10">ls -Z • restorecon -Rv</text>
          <rect x="538" y="122" width="194" height="54" rx="8" fill="#1e1b4b" stroke="#a78bfa"/>
          <text x="635" y="146" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Fail2ban + NFS/Samba</text>
          <text x="635" y="164" text-anchor="middle" fill="#ddd6fe" font-size="10">แบน Brute-Force อัตโนมัติ</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. SSH Hardening & Cross-OS File Sharing (พิชิต Zone 17–18)',
          bullets: [
            '<strong>SSH Key-Based Auth:</strong> สร้างคู่กุญแจ <code>ssh-keygen -t ed25519</code> ส่งเฉพาะ <strong>Public Key (.pub)</strong> ขึ้น Server ด้วย <code>ssh-copy-id</code> (เก็บ Private Key ไว้ที่เครื่องเราห้ามเผยแพร่)',
            '<strong>ล็อก sshd_config:</strong> ตั้ง <code>PermitRootLogin no</code> + <code>PasswordAuthentication no</code> แล้วตรวจก่อนรีสตาร์ทด้วย <code>sudo sshd -t</code> • ใช้ <strong>Fail2ban</strong> แบน IP ยิง Brute-Force • โอนไฟล์ปลอดภัยด้วย <code>scp</code> / <code>rsync -e ssh</code>',
            '<strong>Samba (SMB3 พอร์ต 445):</strong> แชร์ไฟล์ Linux→Windows แก้ใน <code>/etc/samba/smb.conf</code> ตรวจด้วย <code>testparm</code> เพิ่มรหัสด้วย <code>smbpasswd -a</code> และ<strong>ปิด SMBv1 เสมอ</strong> (กัน WannaCry/EternalBlue) ห้ามเปิด 445 ออกเน็ต!',
            '<strong>NFS (พอร์ต 2049):</strong> แชร์ไฟล์ Linux↔Linux ใน <code>/etc/exports</code> ใช้ตัวเลือก <code>root_squash</code> ป้องกัน Client สิทธิ์ root แก้ไฟล์ระบบบน Server'
          ]
        },
        {
          heading: '2. Nginx Reverse Proxy & SELinux/AppArmor (พิชิต Zone 19–20)',
          bullets: [
            '<strong>HTTP Status Codes:</strong> <code>200 OK</code>, <code>301 Moved Permanently</code>, <code>403 Forbidden</code>, <code>404 Not Found</code>, <code>502 Bad Gateway</code> (แอป Backend ด้านหลังดับ/ไม่ตอบสนอง)',
            '<strong>Nginx Power:</strong> ใช้ <code>upstream</code> ทำ Load Balancing, ใช้ <code>server</code> block (Virtual Host) โฮสต์หลายเว็บใน 1 IP, ขอ SSL ฟรีด้วย <strong>Certbot (Let\'s Encrypt)</strong> และเช็กไฟล์ก่อน reload ด้วย <code>sudo nginx -t</code>',
            '<strong>SELinux (Rocky/RHEL) vs AppArmor (Ubuntu):</strong> เป็นระบบ MAC ระดับเคอร์เนล (Enforcing / Permissive / Disabled) หาก SELinux บล็อกเว็บ ห้ามปิดถาวร! ให้ดู <code>/var/log/audit/audit.log</code>, เช็กป้ายด้วย <code>ls -Z</code>, ซ่อมด้วย <code>restorecon -Rv</code> หรือเปิด Boolean ด้วย <code>setsebool -P httpd_can_network_connect 1</code>'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> DAC (<code>chmod</code>) เหมือนกุญแจห้องส่วนตัว แต่ MAC (<code>SELinux</code>) คือกฎเหล็กของตึกที่กำหนดว่า "พนักงานครัว (Nginx) ห้ามเดินเข้าห้องเก็บเงิน (<code>/etc/shadow</code>) ต่อให้ประตูไม่ได้ล็อกก็ตาม!"',
      cheatSheet: `ssh-keygen -t ed25519 && ssh-copy-id admin@192.168.10.10
sudo sshd -t && sudo systemctl reload ssh
sudo nginx -t && sudo systemctl reload nginx
sudo restorecon -Rv /var/www/html
sudo setsebool -P httpd_can_network_connect 1`,
      examTips: [
        '<code>502 Bad Gateway</code> บน Nginx Reverse Proxy = แอป Backend ด้านหลังหยุดทำงาน',
        'SSH Local Port Forwarding (<code>ssh -L</code>) ช่วยเข้าถึงฐานข้อมูลภายในอย่างปลอดภัยโดยไม่ต้องเปิดพอร์ต 3306 ออกเน็ต',
        'อย่าปิด SELinux (<code>setenforce 0</code> ถาวร) ให้ใช้ <code>restorecon -Rv</code> และ <code>setsebool -P</code> แทน'
      ]
    },

    /* ==================== VOL 15: ZONE 21–24 ==================== */
    {
      id: 'vol15',
      vol: 'บทที่ 15',
      continent: 3,
      zoneRange: 'Zone 21–24 (ทวีปที่ 3: WinServer)',
      targetZoneId: 'z21',
      icon: '🏰',
      color: '#60a5fa',
      title: 'Windows AD Forest, GPO, DNS/DHCP & IIS',
      subtitle: 'โครงสร้าง AD DS, FSMO, ลำดับ GPO (LSDOU/Enforced), DNS PTR/CNAME, DHCP Failover และ IIS App Pools',
      readTime: '7 นาที',
      objectives: [
        'เข้าใจโครงสร้าง Forest → Domain → OU, บทบาท PDC Emulator, AD Recycle Bin และความสำคัญของ DNS SRV Records',
        'ไล่ลำดับการใช้ Group Policy (LSDOU), Enforced vs Block Inheritance, SYSVOL และตรวจผลด้วย gpresult /r ได้',
        'ตั้งค่า DNS Forward/Reverse (PTR/CNAME/Forwarder), DHCP Reservation/Exclusion/Failover และแก้ปัญหา IIS 503 ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 210" class="codex-svg">
          <rect width="760" height="210" rx="14" fill="#0b1530"/>
          <text x="380" y="28" text-anchor="middle" fill="#60a5fa" font-size="15" font-weight="700">ลำดับการบังคับใช้ Group Policy (LSDOU) &amp; Active Directory (Zone 21–24)</text>
          <rect x="28" y="54" width="128" height="52" rx="8" fill="#1e293b" stroke="#94a3b8"/>
          <text x="92" y="77" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">1. Local</text>
          <text x="92" y="95" text-anchor="middle" fill="#94a3b8" font-size="10">มีผลน้อยสุด</text>
          <text x="170" y="84" fill="#60a5fa" font-size="18">→</text>
          <rect x="192" y="54" width="128" height="52" rx="8" fill="#1e3a8a" stroke="#60a5fa"/>
          <text x="256" y="77" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">2. Site</text>
          <text x="256" y="95" text-anchor="middle" fill="#bfdbfe" font-size="10">ระดับสาขา</text>
          <text x="334" y="84" fill="#60a5fa" font-size="18">→</text>
          <rect x="356" y="54" width="156" height="52" rx="8" fill="#1d4ed8" stroke="#93c5fd"/>
          <text x="434" y="77" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">3. Domain (Enforced!)</text>
          <text x="434" y="95" text-anchor="middle" fill="#dbeafe" font-size="10">SYSVOL + Security Filter</text>
          <text x="526" y="84" fill="#60a5fa" font-size="18">→</text>
          <rect x="548" y="54" width="184" height="52" rx="8" fill="#065f46" stroke="#34d399" stroke-width="2"/>
          <text x="640" y="77" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">4. OU (ชนะหากไม่ Enforced)</text>
          <text x="640" y="95" text-anchor="middle" fill="#a7f3d0" font-size="10">ลูกชนะแม่ • รอบอัปเดต 90 นาที</text>
          <rect x="40" y="130" width="680" height="56" rx="10" fill="#172554" stroke="#38bdf8"/>
          <text x="380" y="153" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700">พอร์ต &amp; บริการสำคัญ Windows Server: Kerberos(88) • LDAP(389/636) • DNS(53) • DHCP(67/68) • IIS W3SVC(80/443 SNI)</text>
          <text x="380" y="173" text-anchor="middle" fill="#cbd5e1" font-size="11">PDC Emulator = เทียบเวลาหลัก • AD Recycle Bin = กู้ Object พร้อม SID เดิม • IIS 503 = App Pool หยุดทำงาน!</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. Active Directory & Group Policy (พิชิต Zone 21–22)',
          bullets: [
            '<strong>Forest &amp; OU:</strong> Forest คือขอบเขตความปลอดภัยสูงสุด • <strong>OU (Organizational Unit)</strong> ใช้จัดกลุ่มแผนกและผูก GPO • ต้องมี <strong>DC อย่างน้อย 2 เครื่อง</strong> เพื่อ Redundancy และต้องมี <strong>DNS (SRV Records)</strong> เสมอ',
            '<strong>PDC Emulator &amp; AD Recycle Bin:</strong> PDC Emulator เป็นตัวเทียบเวลาหลักในโดเมน • AD Recycle Bin กู้บัญชีที่เผลอลบกลับมาพร้อม SID เดิม',
            '<strong>ลำดับ GPO (LSDOU):</strong> Local → Site → Domain → OU (ตัวหลังชนะ) แต่ <strong>Enforced ชนะ Block Inheritance เสมอ!</strong> • เก็บไฟล์ GPO ใน <code>SYSVOL</code> • กรองเฉพาะกลุ่มด้วย <strong>Security Filtering</strong> • รอบอัปเดตอัตโนมัติทุก ~90 นาที'
          ]
        },
        {
          heading: '2. Windows DNS, DHCP & IIS Web Server (พิชิต Zone 23–24)',
          bullets: [
            '<strong>DNS:</strong> <code>PTR Record</code> แปลง IP→ชื่อ (Reverse Lookup) • <code>CNAME</code> ชื่อเล่นชี้โฮสต์จริง • <code>Forwarder</code> ส่งคำถามโดเมนภายนอกไปถาม 8.8.8.8/1.1.1.1',
            '<strong>DHCP:</strong> <code>Exclusion Range</code> กันช่วง IP ไม่ให้แจก • <code>Reservation</code> จอง IP คงที่ผูก MAC Address (เช่น พรินเตอร์) • ต้องกด <strong>Authorize ใน AD</strong> กัน Rogue DHCP • ใช้ <strong>DHCP Failover</strong> สำรอง 2 เครื่อง',
            '<strong>IIS (W3SVC):</strong> ขึ้น <code>503 Service Unavailable</code> ให้เช็ก <strong>Application Pool</strong> หยุดทำงานหรือไม่ • เปิด <strong>SNI</strong> เพื่อให้หลายเว็บใช้ HTTPS 443 บน IP เดียว • Log อยู่ที่ <code>C:\\inetpub\\logs\\LogFiles</code> • ใช้ <strong>URL Rewrite</strong> บังคับ HTTP→HTTPS'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> Enforced GPO เหมือน "กฎกระทรวงศึกษาธิการ" ที่ห้ามโรงเรียนใดสั่งยกเว้น (Block Inheritance) ได้ ส่วน IIS Application Pool เหมือนการแยกห้องครัวแต่ละร้านอาหาร ถ้าร้านหนึ่งไฟดับ ร้านอื่นในศูนย์อาหารยังขายต่อได้!',
      cheatSheet: `gpresult /r                          # ตรวจดู GPO ที่มีผลจริงบนเครื่องลูกข่าย
gpupdate /force                      # บังคับอัปเดต GPO ทันที
Restart-Service W3SVC                # รีสตาร์ทบริการเว็บเซิร์ฟเวอร์ IIS
netdom query fsmo                    # ตรวจสอบเครื่องที่ถือ FSMO Roles 5 ตัว`,
      examTips: [
        'จำแม่น: <strong>Enforced ชนะ Block Inheritance</strong> เสมอ!',
        '<strong>Exclusion</strong> = ห้าม DHCP แจกช่วงนี้ • <strong>Reservation</strong> = จอง IP เดิมให้ MAC Address นั้นทุกครั้ง',
        'IIS ขึ้น Error <code>503</code> → ตรวจ Application Pool เป็นจุดแรก!'
      ]
    },

    /* ==================== VOL 16: ZONE 25–27 ==================== */
    {
      id: 'vol16',
      vol: 'บทที่ 16',
      continent: 3,
      zoneRange: 'Zone 25–27 (ทวีปที่ 3: WinServer)',
      targetZoneId: 'z25',
      icon: '💠',
      color: '#4f46e5',
      title: 'Windows DFS/ReFS, Hyper-V Cluster & PowerShell',
      subtitle: 'Shadow Copies (VSS), ReFS, DFS-N/DFS-R, FSRM, Hyper-V Gen 2/Quorum/CSV และ PowerShell Pipeline',
      readTime: '6 นาที',
      objectives: [
        'ใช้งาน VSS, ReFS, Storage Spaces, DFS Namespace/Replication และ FSRM ป้องกัน Ransomware บน File Server ได้',
        'ออกแบบ Hyper-V Gen 2, Virtual Switches (External/Internal/Private), Failover Cluster Quorum และ VHDX ได้',
        'เขียนคำสั่ง PowerShell แบบ Verb-Noun, Object Pipeline, Export-Csv, WinRM Remoting และทดสอบด้วย -WhatIf ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 200" class="codex-svg">
          <rect width="760" height="200" rx="14" fill="#0d102b"/>
          <text x="380" y="28" text-anchor="middle" fill="#818cf8" font-size="15" font-weight="700">Hyper-V Failover Cluster + DFS Storage + PowerShell Automation (Zone 25–27)</text>
          <rect x="30" y="48" width="210" height="124" rx="10" fill="#1e1b4b" stroke="#6366f1"/>
          <text x="135" y="72" text-anchor="middle" fill="#a5b4fc" font-size="12" font-weight="700">Windows File &amp; DFS</text>
          <text x="135" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• ReFS กัน Bit Rot อัตโนมัติ</text>
          <text x="135" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• VSS (Previous Versions)</text>
          <text x="135" y="136" text-anchor="middle" fill="#e2e8f0" font-size="10">• DFS-N รวมลิงก์ • DFS-R ซิงค์</text>
          <text x="135" y="156" text-anchor="middle" fill="#34d399" font-size="10">• FSRM ตั้งโควตา/บล็อกไฟล์</text>
          <rect x="275" y="48" width="210" height="124" rx="10" fill="#172554" stroke="#38bdf8"/>
          <text x="380" y="72" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">Hyper-V Cluster (Gen 2)</text>
          <text x="380" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• UEFI + Secure Boot + TPM</text>
          <text x="380" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• .vhdx สูงสุด 64 TB</text>
          <text x="380" y="136" text-anchor="middle" fill="#fbbf24" font-size="10">• Quorum กัน Split-Brain</text>
          <text x="380" y="156" text-anchor="middle" fill="#e2e8f0" font-size="10">• CSV แชร์ดิสก์กลางทุกโหนด</text>
          <rect x="520" y="48" width="210" height="124" rx="10" fill="#012456" stroke="#fde047"/>
          <text x="625" y="72" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700">PowerShell Automation</text>
          <text x="625" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• รูปแบบ Verb-Noun</text>
          <text x="625" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• ส่ง .NET Objects ผ่าน Pipe</text>
          <text x="625" y="136" text-anchor="middle" fill="#34d399" font-size="10">• WinRM พอร์ต 5985 / 5986</text>
          <text x="625" y="156" text-anchor="middle" fill="#fbbf24" font-size="10">• -WhatIf จำลองก่อนลบจริง!</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. Windows Storage, ReFS & DFS (พิชิต Zone 25)',
          bullets: [
            '<strong>VSS (Volume Shadow Copy):</strong> ช่วยผู้ใช้คลิกขวา "Previous Versions" กู้ไฟล์ที่เผลอแก้ทับได้เอง',
            '<strong>ReFS &amp; Storage Spaces:</strong> ReFS ตรวจซ่อมข้อมูลเพี้ยน (Bit Rot) อัตโนมัติ • Storage Spaces คือ Software-Defined RAID ใน Windows Server',
            '<strong>DFS-N vs DFS-R:</strong> <code>DFS Namespace</code> รวมแชร์หลายเซิร์ฟเวอร์ไว้ใต้ลิงก์กลางเดียว • <code>DFS Replication</code> ซิงค์ไฟล์ข้ามสาขาอัตโนมัติ',
            '<strong>FSRM (File Server Resource Manager):</strong> ตั้งโควตาพื้นที่และทำ File Screening บล็อกนามสกุลไฟล์ Ransomware • ยึดสิทธิ์เข้มงวดสุดระหว่าง Share กับ NTFS'
          ]
        },
        {
          heading: '2. Hyper-V Cluster & PowerShell (พิชิต Zone 26–27)',
          bullets: [
            '<strong>Hyper-V Gen 2 + .vhdx:</strong> รองรับ UEFI, Secure Boot, vTPM 2.0 และดิสก์ <code>.vhdx</code> สูงสุด 64 TB • <strong>External vSwitch</strong> ออกเน็ตจริงได้',
            '<strong>Failover Cluster:</strong> ใช้ <strong>Quorum (Witness)</strong> ป้องกันปัญหา <em>Split-Brain</em> • ใช้ <strong>CSV (Cluster Shared Volumes)</strong> แชร์ไฟล์ VHDX กลาง • <strong>Hyper-V Replica</strong> จำลอง VM ข้ามไปยัง DR Site',
            '<strong>PowerShell Mastery:</strong> Cmdlet เป็น <code>Verb-Noun</code> • กรองด้วย <code>Where-Object</code> • ส่งออก Excel ด้วย <code>Export-Csv</code> • สั่งข้ามเครื่องผ่าน <strong>WinRM (5985/5986)</strong> • คุมการรัน <code>.ps1</code> ด้วย <code>Set-ExecutionPolicy RemoteSigned</code> • ใส่ <code>-WhatIf</code> จำลองก่อนแก้จริง!'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> Quorum Witness ใน Cluster เหมือน "กรรมการคนที่ 3" ในห้องประชุม 2 คน — ถ้า 2 คนขาดการติดต่อกัน กรรมการจะเป็นเสียงข้างมากตัดสินว่าฝั่งไหนมีสิทธิ์รัน VM ต่อ เพื่อไม่ให้ข้อมูลพังทั้งคู่!',
      cheatSheet: `Get-Service | Where-Object {$_.Status -eq "Stopped"}
Get-ADUser -Filter * | Export-Csv C:\\users.csv -NoTypeInformation -Encoding UTF8
Set-ExecutionPolicy RemoteSigned
Remove-ADUser -Identity "test01" -WhatIf     # จำลองดูก่อน ไม่ลบจริง!
Get-Help Get-Process -Examples`,
      examTips: [
        'นามสกุลไฟล์ดิสก์รุ่นใหม่ของ Hyper-V คือ <code>.vhdx</code> (64 TB) และต้องใช้ <strong>Gen 2</strong> สำหรับ Win 11 / Server 2022',
        '<strong>-WhatIf</strong> ใช้จำลองคำสั่งอันตรายก่อนรันจริง • <strong>WinRM</strong> ใช้พอร์ต <code>5985</code> (HTTP) และ <code>5986</code> (HTTPS)'
      ]
    },

    /* ==================== VOL 17: ZONE 28–30 ==================== */
    {
      id: 'vol17',
      vol: 'บทที่ 17',
      continent: 3,
      zoneRange: 'Zone 28–30 (ทวีปที่ 3: WinServer)',
      targetZoneId: 'z28',
      icon: '🔏',
      color: '#8b5cf6',
      title: 'WSUS Patching, PKI/TLS 1.3 & Kerberos SSO',
      subtitle: 'Patch Deployment Rings, Offline Root CA, CSR/CRL/OCSP, TLS 1.3, Kerberos TGT, krbtgt และ SAML/MFA',
      readTime: '6 นาที',
      objectives: [
        'วางแผน WSUS Patch Management แบบ Deployment Rings (Test → Pilot → Production) และ Rollback ได้',
        'อธิบายโครงสร้าง PKI (Offline Root CA + Online Issuing CA), CSR, การเพิกถอน CRL/OCSP และ TLS 1.3 ได้',
        'เข้าใจกลไก Kerberos (TGT, Time Skew 5 นาที), ป้องกัน NTLM/Golden Ticket (krbtgt) และทำ SSO + MFA ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 200" class="codex-svg">
          <rect width="760" height="200" rx="14" fill="#130924"/>
          <text x="380" y="28" text-anchor="middle" fill="#c084fc" font-size="15" font-weight="700">Enterprise Trust: WSUS Rings + PKI CA Hierarchy + Kerberos SSO (Zone 28–30)</text>
          <rect x="28" y="50" width="215" height="122" rx="10" fill="#1e1b4b" stroke="#38bdf8"/>
          <text x="135" y="74" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="700">WSUS Patching (Z28)</text>
          <text x="135" y="98" text-anchor="middle" fill="#e2e8f0" font-size="10">1. Backup/Snapshot ก่อน!</text>
          <text x="135" y="118" text-anchor="middle" fill="#e2e8f0" font-size="10">2. Test → Pilot → Prod</text>
          <text x="135" y="138" text-anchor="middle" fill="#fbbf24" font-size="10">3. Patch Tuesday (อังคาร 2)</text>
          <text x="135" y="158" text-anchor="middle" fill="#94a3b8" font-size="10">4. ถอนแพตช์: wusa /uninstall</text>
          <rect x="272" y="50" width="215" height="122" rx="10" fill="#2e1065" stroke="#c084fc"/>
          <text x="380" y="74" text-anchor="middle" fill="#d8b4fe" font-size="12" font-weight="700">PKI &amp; TLS 1.3 (Z29)</text>
          <text x="380" y="98" text-anchor="middle" fill="#e2e8f0" font-size="10">• Offline Root CA (ปลอดภัยสุด)</text>
          <text x="380" y="118" text-anchor="middle" fill="#e2e8f0" font-size="10">• ส่ง CSR ขอใบรับรอง</text>
          <text x="380" y="138" text-anchor="middle" fill="#f87171" font-size="10">• คีย์หลุด → Revoke (CRL/OCSP)</text>
          <text x="380" y="158" text-anchor="middle" fill="#34d399" font-size="10">• ปิด TLS 1.0/1.1 ใช้ 1.2/1.3</text>
          <rect x="516" y="50" width="215" height="122" rx="10" fill="#172554" stroke="#fbbf24"/>
          <text x="623" y="74" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700">Kerberos &amp; SSO (Z30)</text>
          <text x="623" y="98" text-anchor="middle" fill="#e2e8f0" font-size="10">• เวลาห้ามเพี้ยนเกิน 5 นาที!</text>
          <text x="623" y="118" text-anchor="middle" fill="#e2e8f0" font-size="10">• KDC ออกตั๋ว TGT (SSO)</text>
          <text x="623" y="138" text-anchor="middle" fill="#f87171" font-size="10">• Golden Ticket → รี krbtgt 2x</text>
          <text x="623" y="158" text-anchor="middle" fill="#34d399" font-size="10">• SAML/OIDC + MFA (&gt;99%)</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. WSUS Patch Management & PKI/TLS 1.3 (พิชิต Zone 28–29)',
          bullets: [
            '<strong>WSUS:</strong> โหลดแพตช์จาก Microsoft มาพักไว้ที่ศูนย์กลางครั้งเดียว ประหยัดเน็ตและควบคุมการอนุมัติเป็น Ring (Test ก่อน Production) • ก่อนแพตช์ Server สำคัญต้อง Backup/Snapshot เสมอ • ถอน Update ด้วย <code>wusa /uninstall /kb:XXXXXXX</code>',
            '<strong>PKI Hierarchy:</strong> แยก <strong>Offline Root CA</strong> (ปิดเครื่องเก็บไว้ปลอดภัย) ออกจาก Online Issuing CA • ขอใบรับรองโดยส่ง <strong>CSR</strong> • หาก Private Key รั่วต้องสั่ง <strong>Revoke</strong> ลง <code>CRL/OCSP</code> ทันที',
            '<strong>Hybrid TLS 1.3:</strong> ใช้ Asymmetric (Public/Private) ยืนยันตัวตนและแลก Key ตอน Handshake แล้วใช้ Symmetric (AES) เข้ารหัสข้อมูลจริงเพราะเร็วมาก • แจกใบรับรองอัตโนมัติผ่าน GPO ด้วย <strong>Certificate Auto-Enrollment</strong>'
          ]
        },
        {
          heading: '2. Kerberos, NTLM & Enterprise SSO (พิชิต Zone 30)',
          bullets: [
            '<strong>Kerberos Time Skew:</strong> นาฬิกา Client กับ DC ห้ามต่างกันเกิน <strong>5 นาที</strong> (ต้องตั้ง NTP 123 เสมอ) • ตั๋วใบแรกที่ KDC ออกให้คือ <strong>TGT (Ticket Granting Ticket)</strong>',
            '<strong>ปิด NTLMv1 &amp; ป้องกัน Golden Ticket:</strong> NTLM อ่อนแอต่อ Pass-the-Hash • หากสงสัยโดน Golden Ticket ต้องรีเซ็ตรหัสผ่านบัญชี <code>krbtgt</code> <strong>2 ครั้ง</strong> (ห่างกันอย่างน้อย 10 ชม.)',
            '<strong>Tiered Admin + SSO/MFA:</strong> ห้ามใช้ Domain Admin ล็อกอินเครื่อง Workstation ทั่วไป • ใช้ <strong>SAML 2.0 / OIDC</strong> ทำ SSO เข้า Cloud + เปิด <strong>MFA</strong> ป้องกันการยึดบัญชีได้กว่า 99%'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> ตั๋ว Kerberos TGT เหมือน "สายรัดข้อมือสวนสนุก" — ยืนยันตัวตนที่ประตูหน้า (KDC) ครั้งเดียว แล้วเอาสายรัดข้อมือไปเล่นเครื่องเล่นทุกเครื่องได้ตลอดวันโดยไม่ต้องโชว์บัตรประชาชนซ้ำ!',
      cheatSheet: `wusa /uninstall /kb:5034441 /quiet /norestart
klist                                  # ดูตั๋ว Kerberos TGT ปัจจุบัน
w32tm /query /status                   # ตรวจสถานะเทียบเวลา NTP บน Windows`,
      examTips: [
        'Patch Tuesday = <strong>วันอังคารที่สองของทุกเดือน</strong>',
        'Kerberos ทนเวลาคลาดเคลื่อนได้สูงสุด <strong>5 นาที</strong> • บัญชีเข้ารหัส TGT ทั้งโดเมนคือ <code>krbtgt</code>',
        'TLS 1.0/1.1 เลิกใช้แล้ว ต้องเปิดเฉพาะ <strong>TLS 1.2 / TLS 1.3</strong>'
      ]
    },

    /* ==================== VOL 18: ZONE 31–36 ==================== */
    {
      id: 'vol18',
      vol: 'บทที่ 18',
      continent: 4,
      zoneRange: 'Zone 31–36 (ทวีปที่ 4: NetCloud)',
      targetZoneId: 'z31',
      icon: '🧭',
      color: '#22d3ee',
      title: 'Enterprise Network (VLAN/BGP/IPv6/VPN) & Databases',
      subtitle: '802.1Q Trunk/STP/LACP, Longest Prefix Match, BGP, IPv6 128-bit, WireGuard/Bastion, SQL ACID และ Redis',
      readTime: '8 นาที',
      objectives: [
        'ออกแบบ VLAN (802.1Q Trunk), STP กันลูป, LACP รวมสาย, Routing (OSPF/BGP/DNAT) และ IPv6 (::1, fe80::, AAAA, SLAAC) ได้',
        'เลือกใช้ WireGuard/IPsec VPN, Zero Trust และ Bastion Host เพื่อปกป้อง Private Subnet ได้',
        'บริหารฐานข้อมูล SQL (MySQL 3306 / PostgreSQL 5432, ACID, Index, Replica) และ NoSQL/Redis Cache (6379, TTL, Cache-Aside) ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 210" class="codex-svg">
          <rect width="760" height="210" rx="14" fill="#061926"/>
          <text x="380" y="28" text-anchor="middle" fill="#22d3ee" font-size="15" font-weight="700">Enterprise Network &amp; Database Layer (Zone 31–36)</text>
          <rect x="26" y="48" width="160" height="132" rx="10" fill="#0e3a53" stroke="#38bdf8"/>
          <text x="106" y="72" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">L2/L3 Network</text>
          <text x="106" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• VLAN 802.1Q Trunk</text>
          <text x="106" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• STP กัน Switching Loop</text>
          <text x="106" y="136" text-anchor="middle" fill="#e2e8f0" font-size="10">• BGP(โลก) / OSPF(ใน)</text>
          <text x="106" y="156" text-anchor="middle" fill="#fbbf24" font-size="10">• Longest Prefix Match</text>
          <rect x="206" y="48" width="160" height="132" rx="10" fill="#0c4a6e" stroke="#22d3ee"/>
          <text x="286" y="72" text-anchor="middle" fill="#67e8f9" font-size="12" font-weight="700">IPv6 &amp; Zero-Trust</text>
          <text x="286" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• 128-bit • LAN /64</text>
          <text x="286" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• ::1 Loop • fe80:: Link</text>
          <text x="286" y="136" text-anchor="middle" fill="#34d399" font-size="10">• WireGuard (51820)</text>
          <text x="286" y="156" text-anchor="middle" fill="#fbbf24" font-size="10">• Bastion + IPsec 500/4500</text>
          <rect x="386" y="48" width="168" height="132" rx="10" fill="#3b2609" stroke="#f59e0b"/>
          <text x="470" y="72" text-anchor="middle" fill="#fcd34d" font-size="12" font-weight="700">SQL (ACID)</text>
          <text x="470" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• MySQL 3306 / PG 5432</text>
          <text x="470" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• Index เร่ง SELECT</text>
          <text x="470" y="136" text-anchor="middle" fill="#e2e8f0" font-size="10">• Primary → Read Replica</text>
          <text x="470" y="156" text-anchor="middle" fill="#34d399" font-size="10">• bind-address=127.0.0.1</text>
          <rect x="574" y="48" width="160" height="132" rx="10" fill="#3f0d18" stroke="#f43f5e"/>
          <text x="654" y="72" text-anchor="middle" fill="#fda4af" font-size="12" font-weight="700">NoSQL &amp; Redis</text>
          <text x="654" y="96" text-anchor="middle" fill="#e2e8f0" font-size="10">• Redis 6379 (In-RAM)</text>
          <text x="654" y="116" text-anchor="middle" fill="#e2e8f0" font-size="10">• TTL + Cache-Aside</text>
          <text x="654" y="136" text-anchor="middle" fill="#e2e8f0" font-size="10">• RDB + AOF ลงดิสก์</text>
          <text x="654" y="156" text-anchor="middle" fill="#fbbf24" font-size="10">• MongoDB 27017 (JSON)</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. VLAN, Routing, IPv6 & Zero-Trust VPN (พิชิต Zone 31–34)',
          bullets: [
            '<strong>VLAN &amp; Switch (Z31):</strong> แยก Broadcast Domain ด้วย VLAN • สายเชื่อมระหว่าง Switch ใช้ <strong>Trunk Port (802.1Q)</strong> • <strong>STP</strong> กันลูป • <strong>LACP (802.3ad)</strong> รวมสายแลน • ข้าม VLAN ต้องใช้ L3 Switch/Router • อย่าปล่อย Management ใน VLAN 1',
            '<strong>Routing &amp; NAT (Z32):</strong> <code>0.0.0.0/0</code> = Default Gateway • <strong>PAT</strong> พาเครื่องภายในออกเน็ตผ่าน Public IP เดียว • <strong>DNAT / Port Forwarding</strong> เปิดทางเข้า Server ภายใน • <strong>BGP</strong> เชื่อม ISP ทั่วโลก • กฎ <strong>Longest Prefix Match</strong> (/26 ชนะ /24) • ไล่ Hop ด้วย <code>traceroute</code>',
            '<strong>IPv6 (Z33):</strong> ขนาด 128 บิต (Hex 8 กลุ่ม) ย่อ <code>::</code> ได้ครั้งเดียว • <code>::1</code> = Loopback, <code>fe80::/10</code> = Link-Local • DNS ใช้ <strong>AAAA Record</strong> • <strong>SLAAC</strong> รับ IP เองอัตโนมัติ • LAN มาตรฐาน <code>/64</code> • เปลี่ยนผ่านด้วย <strong>Dual-Stack</strong>',
            '<strong>VPN &amp; Zero Trust (Z34):</strong> <strong>WireGuard (UDP 51820)</strong> เบาเร็วใน Kernel • <strong>IPsec (UDP 500/4500)</strong> • <strong>Zero Trust</strong> = "Never Trust, Always Verify" + Micro-Segmentation • ใช้ <strong>Bastion Host (Jump Server)</strong> เป็นจุดกระโดดเข้า Private Subnet'
          ]
        },
        {
          heading: '2. SQL Stronghold & Redis/NoSQL Cache (พิชิต Zone 35–36)',
          bullets: [
            '<strong>SQL (Z35):</strong> MySQL/MariaDB (<code>3306</code>), PostgreSQL (<code>5432</code>), MSSQL (<code>1433</code>) • คุณสมบัติ <strong>ACID</strong> (Atomicity, Consistency, Isolation, Durability) • <strong>Index</strong> เร่งความเร็ว SELECT • <strong>Primary-Replica</strong> แบ่งโหลดอ่าน • สำรองด้วย <code>mysqldump</code> • ห้ามให้เว็บต่อ DB ด้วย <code>root</code> และตั้ง <code>bind-address = 127.0.0.1</code>',
            '<strong>Redis &amp; NoSQL (Z36):</strong> Redis (<code>6379</code>) เก็บใน RAM เร็วระดับ Sub-ms • ตั้ง <strong>TTL</strong> กันข้อมูลเก่าค้าง • ใช้ <strong>RDB/AOF</strong> บันทึกลงดิสก์ • รูปแบบ <strong>Cache-Aside</strong> เช็ก Redis ก่อนค่อยตกไป DB • MongoDB (<code>27017</code>) เก็บแบบ JSON Document ยืดหยุ่น'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> Redis Cache เหมือน "กระดาษโพสต์อิตแปะหน้าจอ" หยิบดูได้ใน 1 วินาที ส่วน SQL Database เหมือน "ตู้เอกสารห้องสมุด" ที่เก็บข้อมูลหลักอย่างแม่นยำ (ACID) หากโพสต์อิตไม่มี (Cache Miss) ค่อยเดินไปค้นตู้เอกสาร!',
      cheatSheet: `ip route                                   # ดู Routing Table + Default Gateway
traceroute 8.8.8.8                         # ไล่ตรวจ Hop ที่แพ็กเก็ตติดขัด
mysqldump -u root -p college_db > db.sql   # สำรองฐานข้อมูล MySQL`,
      examTips: [
        'IPv6: <strong>128 บิต</strong>, DNS <strong>AAAA</strong>, Loopback <code>::1</code>, Link-Local <code>fe80::</code>, LAN <code>/64</code>',
        'IPsec ใช้พอร์ต <strong>UDP 500 &amp; 4500</strong> • Redis <code>6379</code> ห้ามเปิดออกเน็ตโดยไม่ตั้งรหัสผ่าน!',
        'Router เลือกเส้นทางที่เจาะจงที่สุดเสมอ (<strong>Longest Prefix Match</strong>: /26 ชนะ /24)'
      ]
    },

    /* ==================== VOL 19: ZONE 37–40 ==================== */
    {
      id: 'vol19',
      vol: 'บทที่ 19',
      continent: 4,
      zoneRange: 'Zone 37–40 (ทวีปที่ 4: NetCloud)',
      targetZoneId: 'z37',
      icon: '☸️',
      color: '#2563eb',
      title: 'Docker Compose, Kubernetes, CI/CD & SRE',
      subtitle: 'Multi-Stage Dockerfile, K8s Pods/Services/etcd/HPA, Terraform IaC, Blue-Green/Canary และ Prometheus+Grafana',
      readTime: '7 นาที',
      objectives: [
        'สร้าง Docker Image ที่เล็กปลอดภัย (Multi-Stage + Alpine + Non-Root) และรันหลายบริการด้วย Docker Compose ได้',
        'อธิบายสถาปัตยกรรม Kubernetes (Pod, Deployment, Service, ConfigMap/Secret, etcd, HPA, kubectl) ได้',
        'เข้าใจ CI/CD, Terraform IaC, GitOps, Blue-Green/Canary, 3 Pillars of Observability และ Four Golden Signals ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 205" class="codex-svg">
          <rect width="760" height="205" rx="14" fill="#091229"/>
          <text x="380" y="28" text-anchor="middle" fill="#60a5fa" font-size="15" font-weight="700">Cloud-Native Lifecycle: GitOps → Docker/K8s → Prometheus &amp; Grafana (Zone 37–40)</text>
          <rect x="26" y="54" width="152" height="118" rx="10" fill="#1e1b4b" stroke="#8b5cf6"/>
          <text x="102" y="78" text-anchor="middle" fill="#c4b5fd" font-size="12" font-weight="700">1. CI/CD &amp; GitOps</text>
          <text x="102" y="102" text-anchor="middle" fill="#e2e8f0" font-size="10">• Terraform (IaC)</text>
          <text x="102" y="122" text-anchor="middle" fill="#e2e8f0" font-size="10">• Blue-Green / Canary</text>
          <text x="102" y="142" text-anchor="middle" fill="#f87171" font-size="10">• ห้ามใส่ Secret ใน Git!</text>
          <text x="190" y="116" fill="#38bdf8" font-size="18">→</text>
          <rect x="210" y="54" width="152" height="118" rx="10" fill="#0c4a6e" stroke="#38bdf8"/>
          <text x="286" y="78" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">2. Docker Build</text>
          <text x="286" y="102" text-anchor="middle" fill="#e2e8f0" font-size="10">• Multi-Stage + Alpine</text>
          <text x="286" y="122" text-anchor="middle" fill="#e2e8f0" font-size="10">• USER nonroot</text>
          <text x="286" y="142" text-anchor="middle" fill="#34d399" font-size="10">• docker compose up -d</text>
          <text x="374" y="116" fill="#38bdf8" font-size="18">→</text>
          <rect x="394" y="54" width="160" height="118" rx="10" fill="#172554" stroke="#60a5fa"/>
          <text x="474" y="78" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="700">3. Kubernetes (K8s)</text>
          <text x="474" y="102" text-anchor="middle" fill="#e2e8f0" font-size="10">• Pod + Deployment</text>
          <text x="474" y="122" text-anchor="middle" fill="#e2e8f0" font-size="10">• Service + HPA Scale</text>
          <text x="474" y="142" text-anchor="middle" fill="#fbbf24" font-size="10">• etcd เก็บ State ทั้งหมด</text>
          <text x="566" y="116" fill="#38bdf8" font-size="18">→</text>
          <rect x="586" y="54" width="150" height="118" rx="10" fill="#431407" stroke="#fb923c"/>
          <text x="661" y="78" text-anchor="middle" fill="#fdba74" font-size="12" font-weight="700">4. Observability</text>
          <text x="661" y="102" text-anchor="middle" fill="#e2e8f0" font-size="10">• Metrics/Logs/Traces</text>
          <text x="661" y="122" text-anchor="middle" fill="#e2e8f0" font-size="10">• Prometheus+Grafana</text>
          <text x="661" y="142" text-anchor="middle" fill="#34d399" font-size="10">• 99.99% = ~52.6 นาที/ปี</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. Docker Compose & Kubernetes Armada (พิชิต Zone 37–38)',
          bullets: [
            '<strong>Docker Best Practices (Z37):</strong> ใช้ <strong>Multi-Stage Build + Alpine</strong> ลดขนาด Image และ Attack Surface • รันด้วย <code>USER nonroot</code> • เชื่อมหลายบริการด้วย <code>docker compose up -d</code> (เรียกหากันผ่านชื่อ Service ด้วย Internal DNS) • เก็บ Image บน <strong>Container Registry</strong> • ดู Log ด้วย <code>docker logs -f</code>',
            '<strong>Kubernetes (Z38):</strong> <strong>Pod</strong> = หน่วยเล็กสุด • <strong>Deployment</strong> = รักษาจำนวน Replica (Self-Healing) • <strong>Service</strong> = IP/DNS คงที่พร้อม Load Balance • <strong>ConfigMap</strong> (ค่าตั้งค่าทั่วไป) vs <strong>Secret</strong> (รหัสผ่าน/คีย์) • <strong>HPA</strong> ขยาย Pod อัตโนมัติ • <strong>etcd</strong> คือฐานข้อมูลหัวใจของ Control Plane'
          ]
        },
        {
          heading: '2. CI/CD, GitOps & SRE Observability (พิชิต Zone 39–40)',
          bullets: [
            '<strong>DevOps &amp; IaC (Z39):</strong> <strong>Terraform (IaC)</strong> เขียนโครงสร้าง Server เป็นโค้ด • <strong>Blue-Green</strong> สลับระบบคู่ขนาน Rollback ใน 1 วิ • <strong>Canary</strong> ปล่อยผู้ใช้ส่วนน้อย 5%→100% • <strong>GitOps</strong> ใช้ Git เป็น Single Source of Truth • <strong>Immutable Infrastructure</strong> ไม่แก้เครื่องสดแต่สร้างใหม่แทน • <em>ห้ามฮาร์ดโค้ด Secret ลง Git!</em>',
            '<strong>Observability &amp; SRE (Z40):</strong> 3 เสาหลัก = <strong>Metrics, Logs, Traces</strong> • <strong>Prometheus</strong> เก็บ Metrics + <strong>Grafana</strong> วาดกราฟ • <strong>Four Golden Signals</strong> = Latency, Traffic, Errors, Saturation • <strong>SLI</strong> (ค่าวัดจริง) / <strong>SLO</strong> (เป้าทีม) / <strong>SLA</strong> (สัญญาลูกค้า — 99.99% ล่มได้ ~52.6 นาที/ปี) • <strong>Blameless Postmortem</strong> แก้ระบบไม่หาแพะ'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> Kubernetes เหมือน "กัปตันเรือบรรทุกตู้คอนเทนเนอร์อัตโนมัติ" — ถ้าตู้คอนเทนเนอร์ (Pod) ตู้ไหนตกน้ำ กัปตันจะยกตู้ใหม่มาวางแทนทันที และถ้าลูกค้าเยอะขึ้นก็จะสั่งเปิดตู้เพิ่มเอง (HPA)!',
      cheatSheet: `docker compose up -d              # เปิดทุกบริการใน docker-compose.yml
docker logs -f web-api            # ติดตาม Log ของ Container สด ๆ
kubectl get pods -A               # ดู Pod ทั้งหมดใน Kubernetes Cluster
kubectl logs -f <pod-name>        # ดู Log ของ Pod`,
      examTips: [
        'ฐานข้อมูลหัวใจของ Kubernetes Control Plane คือ <strong>etcd</strong> (ต้องทำ Snapshot สำรองเสมอ)',
        '<strong>Four Golden Signals</strong>: Latency, Traffic, Errors, Saturation • <strong>99.99%</strong> = ล่มได้ ~52.6 นาที/ปี',
        '<strong>Blue-Green</strong> สลับทันที 100% • <strong>Canary</strong> ทยอยปล่อยกลุ่มเล็ก (5%→25%→100%)'
      ]
    },

    /* ==================== VOL 20: ZONE 41–50 ==================== */
    {
      id: 'vol20',
      vol: 'บทที่ 20',
      continent: 5,
      zoneRange: 'Zone 41–50 (ทวีปที่ 5: APEX)',
      targetZoneId: 'z41',
      icon: '🏆',
      color: '#fb923c',
      title: 'CyberSec, Data Center Tier-IV, PDPA & AI-Ops Apex',
      subtitle: 'WAF/IDS/CVE/Nmap, Immutable 3-2-1-1-0, SPF/DKIM/DMARC, Tier-IV/PUE, HA/VRRP, พ.ร.บ. คอมฯ/PDPA และ AI-Ops',
      readTime: '9 นาที',
      objectives: [
        'แยกแยะ WAF vs L3/L4 Firewall, IDS vs IPS, CVE/CVSS, 3-2-1-1-0 Immutable Backup และ SPF/DKIM/DMARC ได้แม่นยำ',
        'ออกแบบ Data Center Tier-IV (PUE, Hot/Cold Aisle, Clean Agent, UPS+Gen) และ High Availability (VRRP, Stateless, Chaos) ได้',
        'ปฏิบัติตามกฎหมาย พ.ร.บ. คอมพิวเตอร์ (Log 90 วัน), PDPA (แจ้งเหตุ 72 ชม.), ISO 27001 และเข้าใจโครงสร้าง GPU/Edge/AIOps ได้'
      ],
      diagramSvg: `
        <svg viewBox="0 0 760 215" class="codex-svg">
          <rect width="760" height="215" rx="14" fill="#180a08"/>
          <text x="380" y="28" text-anchor="middle" fill="#fbbf24" font-size="15" font-weight="700">GRAND ARCHITECT BLUEPRINT — พิชิตทวีปที่ 5 (Zone 41–50)</text>
          <rect x="24" y="48" width="170" height="142" rx="10" fill="#3f0d1c" stroke="#f43f5e"/>
          <text x="109" y="70" text-anchor="middle" fill="#fda4af" font-size="11.5" font-weight="700">CyberSec (Z41–45)</text>
          <text x="109" y="92" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• WAF(L7) + Rate Limit</text>
          <text x="109" y="110" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• IDS(เตือน) vs IPS(บล็อก)</text>
          <text x="109" y="128" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• CVE/CVSS + Nmap -sV</text>
          <text x="109" y="146" text-anchor="middle" fill="#fde047" font-size="9.5">• 3-2-1-1-0 WORM Backup</text>
          <text x="109" y="164" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• SPF + DKIM + DMARC</text>
          <text x="109" y="182" text-anchor="middle" fill="#34d399" font-size="9.5">• IMAPS 993 / SMTP 587</text>
          <rect x="206" y="48" width="170" height="142" rx="10" fill="#063d2d" stroke="#10b981"/>
          <text x="291" y="70" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">DC Tier-IV &amp; HA (Z46–47)</text>
          <text x="291" y="92" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• Tier IV: 99.995% (2N)</text>
          <text x="291" y="110" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• PUE ใกล้ 1.0 (ประหยัดไฟ)</text>
          <text x="291" y="128" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• Hot/Cold Aisle + 1U=1.75"</text>
          <text x="291" y="146" text-anchor="middle" fill="#fde047" font-size="9.5">• ดับเพลิง: Clean Agent Gas</text>
          <text x="291" y="164" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• VRRP VIP • Stateless App</text>
          <text x="291" y="182" text-anchor="middle" fill="#38bdf8" font-size="9.5">• Multi-AZ + Chaos Drill</text>
          <rect x="388" y="48" width="170" height="142" rx="10" fill="#3b2f08" stroke="#eab308"/>
          <text x="473" y="70" text-anchor="middle" fill="#fde047" font-size="11.5" font-weight="700">PDPA &amp; ISO 27001 (Z48)</text>
          <text x="473" y="92" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• พ.ร.บ. คอมฯ: Log ≥ 90 วัน</text>
          <text x="473" y="110" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• PDPA: แจ้งรั่วไหล ≤ 72 ชม.</text>
          <text x="473" y="128" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• ISO 27001 (ISMS)</text>
          <text x="473" y="146" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• At Rest + In Transit Enc</text>
          <text x="473" y="164" text-anchor="middle" fill="#f87171" font-size="9.5">• Offboarding: Disable ทันที</text>
          <text x="473" y="182" text-anchor="middle" fill="#34d399" font-size="9.5">• Separation of Duties</text>
          <rect x="570" y="48" width="166" height="142" rx="10" fill="#2e1065" stroke="#a855f7"/>
          <text x="653" y="70" text-anchor="middle" fill="#e9d5ff" font-size="11.5" font-weight="700">AI-Ops &amp; Apex (Z49–50)</text>
          <text x="653" y="92" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• GPU Cluster + Liquid Cool</text>
          <text x="653" y="110" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• Edge: Ultra-Low Latency</text>
          <text x="653" y="128" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• AIOps Predictive Maint.</text>
          <text x="653" y="146" text-anchor="middle" fill="#34d399" font-size="9.5">• MTBF สูง • MTTR ต่ำ</text>
          <text x="653" y="164" text-anchor="middle" fill="#e2e8f0" font-size="9.5">• OpenTelemetry (OTel)</text>
          <text x="653" y="182" text-anchor="middle" fill="#fbbf24" font-size="9.5">• 👑 Grand Architect Z50!</text>
        </svg>
      `,
      sections: [
        {
          heading: '1. WAF, IDS/IPS, Pentest, Immutable Backup & Email Security (พิชิต Zone 41–45)',
          bullets: [
            '<strong>WAF &amp; DDoS (Z41):</strong> WAF ตรวจเนื้อหา Layer 7 (กัน SQLi/XSS) • กัน SQLi ที่โค้ดด้วย <strong>Prepared Statements</strong> • ซ่อน Origin IP ไว้หลัง CDN/WAF • ใช้ <strong>HSTS</strong> บังคับ HTTPS • SYN Flood โจมตี 3-Way Handshake',
            '<strong>IDS/IPS &amp; Packet (Z42):</strong> IDS แจ้งเตือน (Passive ผ่าน <strong>SPAN/Port Mirroring</strong>) vs IPS บล็อกทันที (Inline) • <strong>False Negative</strong> (ปล่อยภัยผ่าน) อันตรายสุด • จับแพ็กเก็ตบน Linux ด้วย <code>tcpdump -i any port 443 -w capture.pcap</code> • ระวัง <strong>DNS Tunneling</strong> (Subdomain ยาวสุ่ม)',
            '<strong>Vuln &amp; Hardening (Z43):</strong> รหัส <strong>CVE</strong> + คะแนน <strong>CVSS 0–10</strong> • สแกนเครื่องตัวเองด้วย <code>nmap -sV</code> • ใช้แนวคิด <strong>Defense in Depth</strong> และปิด <code>server_tokens off;</code> ใน Nginx • ระวังไฟล์ <code>SUID</code>',
            '<strong>Ransomware &amp; Backup (Z44):</strong> กฎ <strong>3-2-1-1-0</strong> (1 ชุด Offline/<strong>Immutable WORM</strong> + 0 Error หลังซ้อม Restore จริง) • <strong>EDR</strong> กักกันเครื่องทันที • ห้ามจ่ายค่าไถ่ (ระวัง Double Extortion) • DR Site: Hot (เร็วสุด) &gt; Warm &gt; Cold',
            '<strong>Email Security (Z45):</strong> <strong>SPF + DKIM + DMARC (<code>p=reject</code>) + PTR Record</strong> กันปลอมอีเมล • ปิด Open Relay • ใช้พอร์ตเข้ารหัส <strong>IMAPS 993</strong> และ <strong>SMTP 587</strong>'
          ]
        },
        {
          heading: '2. Data Center Tier-IV, HA, Compliance PDPA/ISO & AI-Ops (พิชิต Zone 46–50)',
          bullets: [
            '<strong>Data Center (Z46):</strong> <strong>Tier IV (99.995%)</strong> มีไฟ/แอร์คู่แบบ 2N • <strong>PUE</strong> ยิ่งใกล้ 1.0 ยิ่งประหยัด • แยก <strong>Hot/Cold Aisle</strong> • ดับเพลิงด้วย <strong>Clean Agent Gas</strong> (FM-200/Novec) • <code>1U = 1.75 นิ้ว</code> • UPS ประคองไฟ 0 ms รอ Diesel Generator',
            '<strong>HA &amp; Chaos (Z47):</strong> กำจัด <strong>SPOF</strong> • ใช้ <strong>Keepalived/VRRP</strong> แชร์ Virtual IP • ทำเว็บเป็น <strong>Stateless</strong> (เก็บ Session ใน Redis) • <strong>Multi-AZ</strong> กันตึกดับ • <strong>Chaos Engineering</strong> จำลองเหตุล่มเพื่อทดสอบความอึด • Health Check ตรวจ HTTP <code>/healthz</code>',
            '<strong>กฎหมาย &amp; มาตรฐาน (Z48):</strong> พ.ร.บ. คอมพิวเตอร์ไทยเก็บ Log <strong>ไม่น้อยกว่า 90 วัน</strong> • <strong>PDPA</strong> แจ้งเหตุข้อมูลรั่วภายใน <strong>72 ชม.</strong> • <strong>ISO/IEC 27001</strong> (ISMS) • เข้ารหัสทั้ง At Rest และ In Transit • พนักงานลาออกต้อง Disable บัญชีทันที (Offboarding)',
            '<strong>AI-Ops &amp; Grand Apex (Z49–50):</strong> GPU Cluster + Liquid Cooling • <strong>Edge Computing</strong> ลด Latency • <strong>MTBF</strong> (เวลาทำงานปกติ ยิ่งมากยิ่งดี) vs <strong>MTTR</strong> (เวลาซ่อม ยิ่งน้อยยิ่งดี) • <strong>OpenTelemetry (OTel)</strong> มาตรฐานเก็บ Telemetry กลาง • ผ่านทั้งหมดนี้พร้อมโค่น <strong>👑 OMEGA-CORE ARCHITECT (Zone 50)</strong>!'
          ]
        }
      ],
      analogy: '💡 <strong>เปรียบเทียบให้เห็นภาพ:</strong> Immutable Backup (WORM) เหมือน "ตู้เซฟตั้งเวลาล็อก" ที่ต่อให้โจรจับเจ้าของบ้าน (Admin) มาบังคับเปิด ตู้เซฟก็ไม่ยอมให้ลบข้อมูลจนกว่าจะครบกำหนดเวลา!',
      cheatSheet: `sudo tcpdump -i any port 443 -w capture.pcap   # จับแพ็กเก็ตบน Linux
nmap -sV 192.168.10.10                         # ตรวจพอร์ตและเวอร์ชันเครื่องตัวเอง
# Wireshark Display Filter:
ip.addr == 192.168.10.10 && tcp.port == 22`,
      examTips: [
        'พ.ร.บ. คอมพิวเตอร์ (ไทย): เก็บ Log ≥ <strong>90 วัน</strong> • PDPA: แจ้ง สคส. ภายใน <strong>72 ชั่วโมง</strong>',
        'ห้อง Data Center ห้ามใช้สปริงเกลอร์น้ำธรรมดา ต้องใช้ <strong>Clean Agent Gas</strong> • PUE ที่ดีคือ <strong>ใกล้ 1.0</strong>',
        '<strong>MTBF</strong> ยิ่งมากยิ่งดี (เสถียร) • <strong>MTTR</strong> ยิ่งน้อยยิ่งดี (กู้คืนไว)'
      ]
    }
  ];

  NEW_VOLUMES.forEach((v) => CODEX_VOLUMES.push(v));
})();
