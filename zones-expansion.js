/* ServerOps: 50-Zone World Map Expansion (Zones 9–50 = 126 New Stages, 84 New Monsters & 42 New MVP Bosses)
 * Automatically appends Zones 9..50 to CAMPAIGN_ZONES and tags Continents 1..5 (10 Zones per Continent).
 */
const WORLD_CONTINENTS = [
  { id: 1, name: 'ทวีปที่ 1: Midgard Server Core', range: 'Zone 01–10', subtitle: 'รากฐาน Server OS, ฮาร์ดแวร์, เครือข่าย, Forensics, BIOS/UEFI & Hypervisor', theme: '#38bdf8', badge: '🖥️ CORE' },
  { id: 2, name: 'ทวีปที่ 2: Linuxia Empire', range: 'Zone 11–20', subtitle: 'เจาะลึก Linux Server: FHS, Systemd, LVM, Bash, SSH, Nginx & SELinux', theme: '#34d399', badge: '🐧 LINUX' },
  { id: 3, name: 'ทวีปที่ 3: WinServer Kingdom', range: 'Zone 21–30', subtitle: 'อาณาจักร Windows Server: Active Directory, GPO, IIS, Hyper-V, PKI & Kerberos', theme: '#60a5fa', badge: '🪟 WINSERV' },
  { id: 4, name: 'ทวีปที่ 4: NetCloud Sky-Realm', range: 'Zone 31–40', subtitle: 'เครือข่ายขั้นสูง, VLAN, BGP, IPv6, VPN, SQL/Redis, Kubernetes & GitOps', theme: '#22d3ee', badge: '☁️ CLOUD' },
  { id: 5, name: 'ทวีปที่ 5: CyberSec & Quantum Apex', range: 'Zone 41–50', subtitle: 'ความมั่นคงไซเบอร์ระดับองค์กร, WAF, SOC, Data Center Tier-IV & Grand Architect', theme: '#fb923c', badge: '🔥 APEX' }
];

(() => {
  /* Tag existing Zones 1–8 into Continent 1 and arrange clean 10-pin layout for Continent 1 */
  const C1_COORDS = [
    { x: 14, y: 76 }, { x: 28, y: 58 }, { x: 44, y: 78 }, { x: 58, y: 56 },
    { x: 74, y: 74 }, { x: 88, y: 50 }, { x: 72, y: 26 }, { x: 52, y: 22 },
    { x: 32, y: 26 }, { x: 15, y: 34 }
  ];
  const PIN_PATTERNS = [
    // Continent 2: Winding Emerald Path
    [{ x: 13, y: 74 }, { x: 26, y: 44 }, { x: 36, y: 76 }, { x: 49, y: 46 }, { x: 60, y: 74 }, { x: 73, y: 44 }, { x: 87, y: 70 }, { x: 82, y: 22 }, { x: 54, y: 19 }, { x: 22, y: 19 }],
    // Continent 3: Royal Citadel Zig-Zag
    [{ x: 15, y: 24 }, { x: 32, y: 46 }, { x: 18, y: 74 }, { x: 42, y: 76 }, { x: 52, y: 42 }, { x: 44, y: 18 }, { x: 68, y: 24 }, { x: 66, y: 72 }, { x: 86, y: 58 }, { x: 86, y: 20 }],
    // Continent 4: Sky Archipelago Arc
    [{ x: 13, y: 66 }, { x: 25, y: 34 }, { x: 40, y: 56 }, { x: 46, y: 20 }, { x: 60, y: 44 }, { x: 56, y: 78 }, { x: 74, y: 72 }, { x: 88, y: 48 }, { x: 78, y: 20 }, { x: 90, y: 18 }],
    // Continent 5: Spiral Summit to Zone 50 Throne
    [{ x: 14, y: 78 }, { x: 34, y: 80 }, { x: 56, y: 78 }, { x: 82, y: 74 }, { x: 88, y: 46 }, { x: 74, y: 20 }, { x: 48, y: 20 }, { x: 20, y: 24 }, { x: 26, y: 52 }, { x: 54, y: 48 }]
  ];

  CAMPAIGN_ZONES.forEach((z, idx) => {
    z.continent = 1;
    if (C1_COORDS[idx]) {
      z.mapX = C1_COORDS[idx].x;
      z.mapY = C1_COORDS[idx].y;
    }
  });

  const BIOMES = [
    'biome-prontera', 'biome-geffen', 'biome-payon', 'biome-morroc',
    'biome-alde', 'biome-glast', 'biome-juno', 'biome-thanatos'
  ];

  /* Deterministic option shuffler so correct answer is distributed evenly across A/B/C/D */
  function makeQ(raw, seed) {
    const opts = [...raw[2]];
    const correctText = opts[0];
    // Deterministic Fisher-Yates using simple LCG seeded per zone+stage+question
    let s = (seed * 9301 + 49297) % 233280;
    for (let i = opts.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = s % (i + 1);
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return {
      context: raw[0],
      q: raw[1],
      options: opts,
      answer: opts.indexOf(correctText),
      explain: raw[3]
    };
  }

  /* Compact structured zone builder -> outputs full CAMPAIGN_ZONES objects identical to Zones 1–8 */
  function buildZone(def) {
    const num = def.num;
    const continent = Math.ceil(num / 10);
    const slot = (num - 1) % 10;
    const pt = continent === 1 ? C1_COORDS[slot] : PIN_PATTERNS[continent - 2][slot];
    const lvStart = (num - 1) * 10 + 1;
    const lvEnd = num * 10;
    const xpBase = 110 + num * 6;
    const coinBase = 85 + num * 5;

    return {
      id: `z${num}`,
      code: `ZONE ${String(num).padStart(2, '0')}`,
      continent,
      roCode: def.roCode,
      roName: def.roName,
      lvRange: `Lv.${lvStart}–${lvEnd}`,
      biome: BIOMES[(num - 1) % BIOMES.length],
      mapX: pt.x,
      mapY: pt.y,
      name: def.name,
      subtitle: def.subtitle,
      themeColor: def.color,
      icon: def.icon,
      tag: def.tag,
      stages: [
        {
          id: `z${num}_s1`,
          title: `${num}-1: ${def.s1.title}`,
          category: def.cat,
          isBoss: false,
          enemy: { name: def.s1.enemy, sprite: '🤖', hp: 120 + num * 3 },
          dialogue: `NOVA-OS: [${def.roName}] ${def.s1.dlg}`,
          xp: xpBase,
          coins: coinBase,
          questions: def.s1.qs.map((q, qi) => makeQ(q, num * 31 + qi * 7 + 1))
        },
        {
          id: `z${num}_s2`,
          title: `${num}-2: ${def.s2.title}`,
          category: def.cat,
          isBoss: false,
          enemy: { name: def.s2.enemy, sprite: '👾', hp: 130 + num * 3 },
          dialogue: `ผอ.เก่ง: [${def.roName}] ${def.s2.dlg}`,
          xp: xpBase + 15,
          coins: coinBase + 10,
          questions: def.s2.qs.map((q, qi) => makeQ(q, num * 37 + qi * 11 + 2))
        },
        {
          id: `z${num}_boss`,
          title: `${num}-BOSS: ${def.boss.enemy}`,
          category: def.cat,
          isBoss: true,
          enemy: { name: def.boss.enemy, sprite: '👑', hp: 190 + num * 5 },
          dialogue: `⚠️ MVP BOSS ALERT! ${def.boss.enemy} ปรากฏตัวใน ${def.roName}! ${def.boss.dlg}`,
          xp: xpBase + 75,
          coins: coinBase + 55,
          questions: def.boss.qs.map((q, qi) => makeQ(q, num * 43 + qi * 13 + 3))
        }
      ]
    };
  }

  /* ==================== EXPANSION ZONES 9–29 ==================== */
  const EXPANSION_DEFS_PART1 = [
    {
      num: 9, roCode: 'prt_uefi09', roName: 'Einbroch Boot Citadel', name: 'BIOS, UEFI & Bootloader Core',
      subtitle: 'กระบวนการ POST, UEFI vs Legacy BIOS, GPT/MBR, Secure Boot และ GRUB2', color: '#38bdf8', icon: '⚡', tag: 'UEFI', cat: 'hardware',
      s1: {
        title: 'ด่านปลุกชีพ POST & UEFI', enemy: 'Corrupt-CMOS Imp', dlg: 'เครื่องเซิร์ฟเวอร์บูตไม่ขึ้น! มาตรวจสอบขั้นตอน POST และความต่างของ UEFI กัน!',
        qs: [
          ['เมื่อกดปุ่มเปิดเครื่อง Server เฟิร์มแวร์จะตรวจสอบ CPU, RAM และอุปกรณ์พื้นฐานก่อนโหลด OS', 'ขั้นตอนการตรวจสอบฮาร์ดแวร์อัตโนมัติทันทีที่เปิดเครื่องเรียกว่าอะไร?', ['POST (Power-On Self-Test)', 'DHCP Discovery', 'DNS Lookup', 'SSH Handshake'], 'POST ตรวจสอบความพร้อมของฮาร์ดแวร์ หาก RAM หรือการ์ดจอเสียเครื่องจะส่งเสียง Beep Code หรือแสดงรหัสไฟเตือน'],
          ['คุณต้องติดตั้ง Server OS ลงบนฮาร์ดดิสก์ขนาด 8 TB และต้องการรองรับ Secure Boot', 'เฟิร์มแวร์และตารางพาร์ติชันคู่ใดที่รองรับดิสก์ใหญ่กว่า 2 TB และ Secure Boot?', ['UEFI + GPT (GUID Partition Table)', 'Legacy BIOS + MBR', 'FAT12 + Floppy Boot', 'Telnet + ARP'], 'MBR จำกัดขนาดดิสก์ที่ 2 TB และได้แค่ 4 Primary Partitions ส่วน UEFI + GPT รองรับดิสก์ระดับ Zettabyte และ Secure Boot']
        ]
      },
      s2: {
        title: 'กู้คืน GRUB2 & Secure Boot', enemy: 'MBR-Breaker Drone', dlg: 'ไฟล์ Bootloader เสียหายหลังอัปเดตเคอร์เนล! ต้องซ่อม GRUB2 ให้บูตกลับเข้า Linux ให้ได้!',
        qs: [
          ['บน Linux Server เมื่อเครื่องผ่าน UEFI แล้ว โปรแกรมตัวแรกที่แสดงเมนูเลือก Kernel คืออะไร?', 'Bootloader มาตรฐานของ Linux Server สมัยใหม่คือข้อใด?', ['GRUB2 (Grand Unified Bootloader)', 'Microsoft Paint', 'Notepad.exe', 'DHCP Relay'], 'GRUB2 ทำหน้าที่โหลด Linux Kernel และ initramfs ขึ้นสู่หน่วยความจำ RAM'],
          ['ฟีเจอร์ Secure Boot ใน UEFI ช่วยป้องกันภัยคุกคามระดับใด?', 'ประโยชน์หลักของ UEFI Secure Boot คือข้อใด?', ['ตรวจสอบลายเซ็นดิจิทัลของ Bootloader และ OS เพื่อป้องกัน Bootkit/Rootkit', 'เพิ่มความเร็ว Wi-Fi เป็น 10 Gbps', 'ลบไฟล์ขยะในถังขยะอัตโนมัติ', 'แทนที่การสำรองข้อมูล RAID'], 'Secure Boot อนุญาตให้บูตเฉพาะซอฟต์แวร์ที่มี Digital Signature ที่เชื่อถือได้เท่านั้น']
        ]
      },
      boss: {
        enemy: 'KERNEL-BOOT TITAN', dlg: 'จอมหุ่น Bootloader ล็อกลำดับการบูตทั้ง Rack! ฝ่าให้ได้!',
        qs: [
          ['ใน Linux หลังแก้ไฟล์ /etc/default/grub บน Ubuntu Server แล้ว', 'ต้องรันคำสั่งใดเพื่อสร้างไฟล์ตั้งค่า grub.cfg ใหม่ให้มีผลตอนรีบูต?', ['sudo update-grub (หรือ grub-mkconfig)', 'sudo ipconfig /flushdns', 'sudo chmod 000 /boot', 'sudo ping grub'], 'การแก้ /etc/default/grub ต้องสั่ง update-grub เพื่อคอมไพล์ลง /boot/grub/grub.cfg'],
          ['โฟลเดอร์ใดบน Linux ที่ใช้เก็บไฟล์ Kernel (vmlinuz), initramfs และไฟล์ตั้งค่า GRUB?', 'เลือกพาธเก็บไฟล์บูตระบบที่ถูกต้อง', ['/boot', '/home', '/tmp', '/var/www'], '/boot เก็บไฟล์สำคัญสำหรับเริ่มระบบทั้งหมด หากเผลอลบเครื่องจะบูตไม่ได้'],
          ['หากเครื่อง Server มีปัญหาบูตเข้า OS ไม่ได้และอยู่คนละจังหวัด แอดมินควรเข้าหน้าจอ BIOS ผ่านระบบใด?', 'เลือกเทคโนโลยี Out-of-Band Management', ['IPMI / Dell iDRAC / HPE iLO', 'Google Chrome', 'Bluetooth', 'HDMI Splitter'], 'iDRAC/iLO/IPMI ช่วยดูหน้าจอ Console ระดับ BIOS และ Mount ISO ข้ามเครือข่ายได้แม้ OS ล่ม']
        ]
      }
    },
    {
      num: 10, roCode: 'yuno_hyp10', roName: 'Lighthalzen Hypervisor Spire', name: 'Virtualization & Hypervisor Core',
      subtitle: 'Type-1 vs Type-2 Hypervisor, Proxmox/ESXi/KVM, Snapshot และ Live Migration', color: '#818cf8', icon: '🧊', tag: 'KVM', cat: 'hardware',
      s1: {
        title: 'สถาปัตยกรรม Hypervisor', enemy: 'VCPU-Steal Phantom', dlg: 'Data Center กำลังยุบเครื่อง Physical 20 เครื่องให้เหลือ Host เพียง 3 เครื่องด้วย Virtualization!',
        qs: [
          ['คุณต้องการประสิทธิภาพสูงสุดในการรัน VM 40 เครื่องใน Data Center จริง', 'ข้อใดคือ Type-1 (Bare-Metal) Hypervisor ทั้งหมด?', ['VMware ESXi, Proxmox VE (KVM), Microsoft Hyper-V', 'VirtualBox, VMware Workstation, Parallels', 'Chrome, Safari, Firefox', 'Excel, Word, PowerPoint'], 'Type-1 ติดตั้งตรงบนฮาร์ดแวร์โดยไม่ผ่าน Desktop OS จึงมี Overhead ต่ำและเสถียรกว่า Type-2'],
          ['ก่อนอัปเกรดระบบสำคัญบน VM แอดมินต้องการจุดย้อนกลับทันทีหากอัปเดตพัง', 'ฟีเจอร์ใดของ Hypervisor ใช้บันทึกสถานะของ VM ณ เวลานั้นเพื่อ Rollback ได้ทันที?', ['VM Snapshot', 'Disk Defragment', 'Ping Flood', 'DNS Flush'], 'Snapshot เก็บสถานะดิสก์ (และ RAM) ณ ขณะนั้น แต่ไม่ควรเก็บไว้นานถาวรเพราะกินพื้นที่และลดประสิทธิภาพ I/O']
        ]
      },
      s2: {
        title: 'เครือข่ายเสมือน & Live Migration', enemy: 'vSwitch-Loop Golem', dlg: 'ต้องซ่อมบำรุงเครื่อง Host ตัวที่ 1 แต่ห้ามปิด VM ที่ให้บริการลูกค้าอยู่!',
        qs: [
          ['คุณต้องย้าย VM ที่กำลังเปิดใช้งานอยู่จาก Host A ไป Host B โดยที่ผู้ใช้ไม่หลุดการเชื่อมต่อ', 'เทคโนโลยีนี้เรียกว่าอะไร?', ['Live Migration (เช่น vMotion / Proxmox Live Migration)', 'Cold Format', 'Static ARP', 'MBR Clone'], 'Live Migration ย้ายข้อมูล RAM ของ VM ข้ามเครือข่ายความเร็วสูงระหว่างที่ VM ยังทำงานอยู่โดยแทบไม่มี Downtime'],
          ['ใน VirtualBox หรือ Hypervisor หากต้องการให้ VM ได้รับ IP วงเดียวกับเครื่องจริงในห้องแล็บและเครื่องอื่น Ping เข้ามาได้ตรง ๆ', 'ควรตั้งโหมดการ์ดเครือข่ายของ VM เป็นแบบใด?', ['Bridged Adapter', 'Internal Network Only', 'Not Attached', 'Loopback Only'], 'Bridged Adapter เชื่อมต่อ VM เข้ากับ Switch/Router จริงเหมือนเป็นคอมพิวเตอร์อีกเครื่องในวง LAN']
        ]
      },
      boss: {
        enemy: 'OVERCOMMIT LEVIATHAN', dlg: 'มังกร Hypervisor ดูด RAM และ vCPU จน Host ล่ม! จัดการทรัพยากรให้เฉียบขาด!',
        qs: [
          ['การกำหนดขนาด Virtual Disk แบบ Thin Provisioning (Dynamically Allocated) มีข้อดีและข้อควรระวังอย่างไร?', 'เลือกคำอธิบายที่ถูกต้องที่สุด', ['ใช้พื้นที่ดิสก์จริงตามข้อมูลที่เขียน แต่ต้องเฝ้าระวังไม่ให้พื้นที่ Host เต็มจน VM หยุดทำงาน', 'จองพื้นที่เต็ม 100% ทันทีตั้งแต่สร้างไฟล์', 'ไม่สามารถเก็บไฟล์ขนาดเกิน 4 GB ได้', 'ทำให้ไม่ต้องใช้ RAM ใน VM'], 'Thin Provisioning ประหยัดพื้นที่เริ่มต้น แต่หาก Overcommit มากเกินไปจน Storage เต็ม ทุก VM จะค้างพร้อมกัน'],
          ['เทคโนโลยี Hardware-Assisted Virtualization ในซีพียู Intel และ AMD ที่ต้องเปิดใน BIOS ก่อนรัน 64-bit VM คือข้อใด?', 'เลือกฟีเจอร์ CPU Virtualization', ['Intel VT-x และ AMD-V', 'Bluetooth 5.0', 'HDMI CEC', 'RGB Sync'], 'หากไม่เปิด VT-x/AMD-V ใน BIOS จะไม่สามารถรัน VM 64-bit หรือ KVM ได้'],
          ['ซอฟต์แวร์เสริมที่ติดตั้งใน Guest OS (เช่น VirtualBox Guest Additions / QEMU Guest Agent) มีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['เพิ่มประสิทธิภาพกราฟิก/เครือข่าย แชร์ Clipboard และสั่ง Shutdown VM อย่างปลอดภัยจาก Host', 'ลบระบบปฏิบัติการ Host OS', 'ปิด Firewall อัตโนมัติ', 'เพิ่มความจุฮาร์ดดิสก์จริงฟรี 10 TB'], 'Guest Agent/Additions ช่วยให้ Host สื่อสารกับ Guest OS ได้อย่างลื่นไหลและปลอดภัย']
        ]
      }
    },
    {
      num: 11, roCode: 'lnx_fhs11', roName: 'Payon Root Tree', name: 'Linux Filesystem Hierarchy (FHS)',
      subtitle: 'โครงสร้างไดเรกทอรี /etc, /var, /proc, /opt, Inode และ Symbolic/Hard Link', color: '#34d399', icon: '🌳', tag: 'FHS', cat: 'storage',
      s1: {
        title: 'แผนที่ไดเรกทอรี Linux', enemy: 'Orphan-Inode Slime', dlg: 'ไฟล์ตั้งค่าและไฟล์ Log กระจายอยู่ในต้นไม้ `/` มาจำแนกหน้าที่ของแต่ละโฟลเดอร์ให้แม่น!',
        qs: [
          ['บน Linux Server แอดมินต้องการแก้ไขไฟล์ตั้งค่าของบริการ Nginx, SSH หรือ Netplan', 'ไฟล์ตั้งค่าระบบทั้งหมดจะถูกเก็บไว้ในไดเรกทอรีใด?', ['/etc', '/tmp', '/dev', '/media'], '/etc เก็บไฟล์ Configuration ของระบบและบริการต่าง ๆ ส่วน /var เก็บข้อมูลที่เปลี่ยนแปลงตลอดเช่น Log และฐานข้อมูล'],
          ['ไดเรกทอรี `/var/log` มีหน้าที่เก็บข้อมูลประเภทใด?', 'เลือกคำตอบที่ถูกต้อง', ['ไฟล์บันทึกเหตุการณ์ (System & Service Log Files)', 'ไฟล์เคอร์เนลสำหรับบูตเครื่อง', 'โฟลเดอร์ส่วนตัวของผู้ใช้ทั่วไป', 'ไดรเวอร์อุปกรณ์ฮาร์ดแวร์'], '/var/log เก็บ Log สำคัญ เช่น syslog, auth.log, nginx/access.log']
        ]
      },
      s2: {
        title: 'Inode & Symbolic Link', enemy: 'Broken-Symlink Wraith', dlg: 'ดิสก์ยังเหลือพื้นที่ว่าง 40% แต่ระบบฟ้อง "No space left on device"! สาเหตุคืออะไร?!',
        qs: [
          ['หากดิสก์ยังมีพื้นที่ว่าง (GB) แต่มีไฟล์เล็ก ๆ นับล้านไฟล์จนสร้างไฟล์ใหม่ไม่ได้', 'ทรัพยากรใดของระบบไฟล์ Linux ที่หมดลง และเช็กด้วยคำสั่งใด?', ['Inode เต็ม — ตรวจสอบด้วยคำสั่ง df -i', 'RAM เต็ม — ตรวจสอบด้วย ping', 'DNS เต็ม — ตรวจสอบด้วย nslookup', 'พอร์ต 80 เต็ม — ตรวจสอบด้วย ufw'], 'ทุกไฟล์และโฟลเดอร์บน Linux ใช้ 1 Inode หาก Inode เต็ม (100% ใน df -i) จะสร้างไฟล์ใหม่ไม่ได้แม้เหลือพื้นที่ GB'],
          ['คำสั่ง `ln -s /var/www/v2 /var/www/current` สร้างลิงก์ประเภทใด?', 'เลือกคำตอบที่ถูกต้อง', ['Symbolic Link (Soft Link) ชี้ไปยังพาธเป้าหมายคล้าย Shortcut', 'Hard Format ดิสก์ใหม่', 'บีบอัดไฟล์เป็น ZIP', 'เปลี่ยนเจ้าของไฟล์'], 'ln -s สร้าง Symbolic Link นิยมมากในการสลับเวอร์ชันเว็บไซต์แบบ Zero-Downtime']
        ]
      },
      boss: {
        enemy: 'ROOT-TREE BEHEMOTH', dlg: 'ต้นไม้ไฟล์ยักษ์ `/proc` และ `/dev` กำลังปั่นป่วน! พิชิตมันด้วยความรู้ FHS!',
        qs: [
          ['ไดเรกทอรี `/proc` บน Linux มีลักษณะพิเศษอย่างไร?', 'เลือกคำอธิบายที่ถูกต้อง', ['เป็น Virtual Filesystem ใน RAM แสดงข้อมูลโปรเซสและเคอร์เนลแบบเรียลไทม์ (เช่น /proc/cpuinfo)', 'เป็นโฟลเดอร์เก็บไฟล์ MP3', 'เป็นถังขยะของระบบ', 'เป็นพาร์ติชัน Windows C:'], '/proc ไม่ได้ใช้พื้นที่ดิสก์จริง แต่เป็นหน้าต่างให้ดูและปรับค่า Kernel/Process สด ๆ'],
          ['ไฟล์อุปกรณ์พิเศษ `/dev/null` มีหน้าที่อะไรในการเขียนคำสั่ง Linux?', 'เลือกหน้าที่ของ /dev/null', ['หลุมดำทิ้งข้อมูล (Data Sink) เมื่อสั่ง > /dev/null 2>&1 เพื่อซ่อนข้อความที่ไม่ต้องการ', 'เก็บข้อมูลสำรองฐานข้อมูลหลัก', 'เก็บประวัติการล็อกอิน root', 'เป็นที่ตั้งค่า IP Address'], '/dev/null ทิ้งทุกไบต์ที่เขียนลงไป นิยมใช้ใน Cron Job เพื่อซ่อน Output ที่ไม่จำเป็น'],
          ['คำสั่งใดใช้ค้นหาไฟล์ทั้งหมดที่มีนามสกุล `.log` ภายใต้ `/var/log`?', 'เลือกคำสั่งค้นหาที่ถูกต้อง', ['find /var/log -name "*.log"', 'mkdir /var/log/*.log', 'chmod /var/log *.log', 'ip route *.log'], 'find <path> -name "<pattern>" เป็นคำสั่งค้นหาไฟล์ทรงพลังที่สุดบน Linux']
        ]
      }
    },
    {
      num: 12, roCode: 'lnx_pkg12', roName: 'Geffen Repo Forge', name: 'Linux Package & Repo Forge',
      subtitle: 'APT (Debian/Ubuntu) vs DNF (RHEL/Rocky), Repository, GPG Keys และ Patching', color: '#10b981', icon: '📦', tag: 'APT/DNF', cat: 'cli',
      s1: {
        title: 'APT vs DNF Package Manager', enemy: 'Dependency-Hell Gremlin', dlg: 'เซิร์ฟเวอร์มีทั้ง Ubuntu และ Rocky Linux! อย่าใช้คำสั่งติดตั้งแพ็กเกจสลับค่ายเด็ดขาด!',
        qs: [
          ['ก่อนสั่ง `sudo apt install nginx` บน Ubuntu Server 24.04 แอดมินควรรันคำสั่งใดก่อนเสมอ?', 'เลือกคำสั่งอัปเดตรายชื่อแพ็กเกจล่าสุดจาก Repository', ['sudo apt update', 'sudo apt delete', 'sudo format /dev/sda', 'sudo reboot -f'], 'apt update ดึงดัชนีเวอร์ชันแพ็กเกจล่าสุดจาก Repository เพื่อไม่ให้โหลดเวอร์ชันเก่าหรือลิงก์ 404'],
          ['บน Rocky Linux 9 / RHEL 9 ระบบจัดการแพ็กเกจมาตรฐานคือข้อใด?', 'เลือกตัวจัดการแพ็กเกจตระกูล Red Hat', ['dnf (พัฒนาต่อยอดจาก yum ใช้ไฟล์ .rpm)', 'apt-get (ไฟล์ .deb)', 'msiexec', 'pacman'], 'ตระกูล RHEL/Rocky/AlmaLinux ใช้ dnf/rpm ส่วนตระกูล Debian/Ubuntu ใช้ apt/dpkg']
        ]
      },
      s2: {
        title: 'ความปลอดภัยของ Repository & GPG', enemy: 'Tampered-Pkg Mimic', dlg: 'มีแพ็กเกจปลอมแอบแฝงเข้ามาใน Repo! ใช้ GPG Signature ตรวจสอบความถูกต้อง!',
        qs: [
          ['เหตุใดการเพิ่ม Third-Party Repository บน Linux จึงต้องนำเข้า GPG Public Key ด้วย?', 'เลือกเหตุผลด้านความปลอดภัย', ['เพื่อยืนยันลายเซ็นดิจิทัลว่าแพ็กเกจมาจากผู้พัฒนาจริงและไม่ถูกดัดแปลงระหว่างทาง', 'เพื่อให้ดาวน์โหลดได้โดยไม่ต้องต่ออินเทอร์เน็ต', 'เพื่อเปลี่ยนสีหน้าจอ Terminal', 'เพื่อปิดการใช้งาน Firewall'], 'GPG Key ช่วยป้องกัน Supply Chain Attack และการปลอมแปลงไฟล์ติดตั้ง'],
          ['คำสั่ง `sudo apt autoremove` มีหน้าที่ทำอะไร?', 'เลือกหน้าที่ที่ถูกต้อง', ['ลบแพ็กเกจ Dependency ที่เคยติดตั้งอัตโนมัติแต่ไม่มีโปรแกรมใดใช้งานแล้ว', 'ลบระบบปฏิบัติการ Ubuntu ทั้งเครื่อง', 'ลบผู้ใช้ทั้งหมดใน /home', 'รีสตาร์ทการ์ดเครือข่าย'], 'apt autoremove ช่วยคืนพื้นที่ดิสก์จาก Library เก่าที่ไม่ได้ใช้แล้วอย่างปลอดภัย']
        ]
      },
      boss: {
        enemy: 'BROKEN-REPO GOLEM', dlg: 'คลังซอฟต์แวร์ติดล็อก Dependency วนลูป! กอบกู้ Package Manager ให้สำเร็จ!',
        qs: [
          ['ความแตกต่างระหว่าง `apt update` กับ `apt upgrade` คือข้อใด?', 'เลือกคำอธิบายที่ถูกต้อง', ['apt update อัปเดตเฉพาะรายชื่อแพ็กเกจ • apt upgrade ดาวน์โหลดและติดตั้งเวอร์ชันใหม่จริง', 'ทั้งสองคำสั่งเหมือนกัน 100%', 'apt update ลบไฟล์ • apt upgrade สร้างผู้ใช้', 'apt upgrade ใช้ได้เฉพาะ Windows'], 'ต้องรัน apt update ก่อน แล้วจึงรัน apt upgrade เพื่ออัปเดตแพ็กเกจให้เป็นปัจจุบัน'],
          ['หากต้องการติดตั้งไฟล์ `.deb` ที่ดาวน์โหลดมาไว้ในเครื่องเองโดยตรง ใช้คำสั่งใด?', 'เลือกคำสั่งติดตั้งไฟล์ .deb', ['sudo dpkg -i package.deb (หรือ sudo apt install ./package.deb)', 'sudo ping package.deb', 'sudo tar -x package.deb', 'sudo chmod 777 package.deb'], 'sudo apt install ./file.deb สะดวกมากเพราะจะช่วยดึง Dependency ที่ขาดให้อัตโนมัติด้วย'],
          ['แพ็กเกจ `unattended-upgrades` บน Ubuntu Server ใช้เพื่อวัตถุประสงค์ใด?', 'เลือกหน้าที่ที่ถูกต้อง', ['ดาวน์โหลดและติดตั้งแพตช์ความปลอดภัย (Security Updates) ให้อัตโนมัติ', 'ปิดเครื่องทุกเที่ยงคืน', 'ลบไฟล์ Log อัตโนมัติ', 'สร้างบัญชี root เพิ่ม'], 'unattended-upgrades ช่วยอุดช่องโหว่สำคัญของ Server ได้รวดเร็วและสม่ำเสมอ']
        ]
      }
    },
    {
      num: 13, roCode: 'lnx_sysd13', roName: 'Aldebaran Systemd Foundry', name: 'Systemd & Daemon Foundry',
      subtitle: 'PID 1, Unit Files, systemctl, journalctl, Boot Targets และ Auto-Restart', color: '#2dd4bf', icon: '⚙️', tag: 'SYSD', cat: 'cli',
      s1: {
        title: 'ควบคุม Daemon ด้วย systemctl', enemy: 'Crashed-Daemon Imp', dlg: 'บริการเว็บเพิ่งถูกแก้ไฟล์ config! ต้องสั่ง Reload และ Enable ให้เปิดเองตอนรีบูต!',
        qs: [
          ['คำสั่ง `systemctl enable --now nginx` ทำหน้าที่อะไรพร้อมกัน 2 อย่าง?', 'เลือกผลลัพธ์ที่ถูกต้อง', ['ตั้งให้ nginx เปิดอัตโนมัติทุกครั้งที่บูต และสั่งเริ่มทำงานทันทีตอนนี้', 'ปิด nginx ถาวรและลบโปรแกรม', 'ตรวจสอบพื้นที่ดิสก์ของ nginx', 'เปลี่ยนพอร์ต nginx เป็น 22'], 'enable ตั้งค่าเปิดตอนบูต ส่วน --now สั่ง start ทันทีในคำสั่งเดียว'],
          ['ความต่างระหว่าง `systemctl reload nginx` กับ `systemctl restart nginx` คือข้อใด?', 'เลือกความต่างที่สำคัญในงาน Production', ['reload โหลดไฟล์ตั้งค่าใหม่โดยไม่ตัดการเชื่อมต่อลูกค้า • restart ปิดบริการแล้วเปิดใหม่ทั้งหมด', 'reload ลบไฟล์ config • restart ไม่ทำอะไร', 'ทั้งคู่เหมือนกันทุกประการ', 'reload ใช้รีบูตทั้งเครื่อง'], 'reload ช่วยให้เว็บเซิร์ฟเวอร์อัปเดตค่าตั้งค่าใหม่ได้แบบ Zero-Downtime']
        ]
      },
      s2: {
        title: 'แกะรอยบริการด้วย journalctl', enemy: 'Silent-Crash Specter', dlg: 'บริการ API สตาร์ตไม่ขึ้นแต่ไม่บอกเหตุผลบนจอ! เปิดดู systemd journal กัน!',
        qs: [
          ['คำสั่งใดใช้ดู Log เฉพาะของบริการ `mysql` และแสดง 50 บรรทัดล่าสุดพร้อมติดตามสด?', 'เลือกคำสั่ง journalctl ที่ถูกต้อง', ['journalctl -u mysql -n 50 -f', 'ls -la mysql', 'chmod 755 mysql', 'ip route mysql'], '-u ระบุ Unit, -n 50 ดู 50 บรรทัดท้าย, -f (follow) ติดตาม Log แบบเรียลไทม์'],
          ['ใน Linux สมัยใหม่ โปรเซสหมายเลข PID 1 ที่ควบคุมการเริ่มบริการทั้งหมดคืออะไร?', 'เลือกชื่อ Init System มาตรฐาน', ['systemd', 'notepad', 'explorer.exe', 'telnetd'], 'systemd เป็น PID 1 จัดการ Service, Socket, Timer และ Mount ของระบบ Linux สมัยใหม่']
        ]
      },
      boss: {
        enemy: 'PID-ONE SOVEREIGN', dlg: 'ผู้คุม PID 1 กำลังสั่งหยุดทุก Service! เขียน Unit File และกู้ระบบกลับมา!',
        qs: [
          ['หากเขียนไฟล์ `/etc/systemd/system/myapp.service` เสร็จใหม่ ๆ ก่อนสั่ง start ต้องรันคำสั่งใดให้ systemd อ่านไฟล์ใหม่?', 'เลือกคำสั่งที่จำเป็น', ['sudo systemctl daemon-reload', 'sudo apt remove systemd', 'sudo ufw reset', 'sudo df -h'], 'ทุกครั้งที่สร้างหรือแก้ไข Unit File ต้องสั่ง systemctl daemon-reload ก่อนเสมอ'],
          ['ในไฟล์ `.service` ของ systemd ค่า `Restart=always` มีความหมายว่าอย่างไร?', 'เลือกความหมายที่ถูกต้อง', ['หากแอปพลิเคชันแครชหรือดับไป ให้ systemd สั่งเปิดขึ้นมาใหม่ให้อัตโนมัติ', 'สั่งรีบูตเครื่อง Server ทุก 1 นาที', 'ห้ามเปิดบริการนี้เด็ดขาด', 'ลบไฟล์ Log หลังปิดบริการ'], 'Restart=always ช่วยเพิ่มความพร้อมใช้งาน (Availability) ให้แอปที่รันเป็นบริการ'],
          ['คำสั่ง `systemctl mask <service>` แตกต่างจาก `disable` อย่างไร?', 'เลือกความต่างที่ถูกต้อง', ['mask ลิงก์ Unit ไปที่ /dev/null ทำให้ไม่สามารถสั่ง start ได้เลยไม่ว่าด้วยมือหรือบริการอื่น', 'mask เปลี่ยนสีไอคอน', 'mask ใช้เปิดบริการแทน start', 'ไม่แตกต่างกันเลย'], 'mask ใช้ล็อกบริการที่ไม่ต้องการให้ทำงานอย่างเด็ดขาด (เช่น mask firewalld เมื่อใช้ ufw)']
        ]
      }
    },
    {
      num: 14, roCode: 'lnx_lvm14', roName: 'Mjolnir Storage Caverns', name: 'LVM & Enterprise Storage',
      subtitle: 'Physical Volume, Volume Group, Logical Volume, ขยายดิสก์ออนไลน์ และ /etc/fstab', color: '#14b8a6', icon: '💽', tag: 'LVM', cat: 'storage',
      s1: {
        title: '3 ชั้นของ LVM Storage', enemy: 'Full-Partition Worm', dlg: 'พาร์ติชัน `/var` เต็ม 99% แล้ว! โชคดีที่เครื่องนี้ใช้ LVM จึงขยายพื้นที่ออนไลน์ได้โดยไม่ต้องปิดเครื่อง!',
        qs: [
          ['สถาปัตยกรรมของ LVM (Logical Volume Manager) เรียงลำดับจากล่าง (ดิสก์จริง) ขึ้นบน (พาร์ติชันใช้งาน) อย่างไร?', 'เลือกลำดับที่ถูกต้อง', ['PV (Physical Volume) → VG (Volume Group) → LV (Logical Volume)', 'LV → VG → PV', 'DNS → DHCP → HTTP', 'MBR → RAM → CPU'], 'นำดิสก์จริงมาทำ PV รวมเป็นบ่อความจุ VG แล้วจึงแบ่งเป็น LV เพื่อฟอร์แมตและ Mount ใช้งาน'],
          ['เหตุใดองค์กรจึงนิยมใช้ LVM แทน Standard Partition แบบธรรมดาบน Linux Server?', 'เลือกจุดเด่นของ LVM', ['ขยายขนาดพาร์ติชันออนไลน์ได้ ยืดหยุ่นข้ามฮาร์ดดิสก์หลายลูก และทำ LVM Snapshot ได้', 'ทำให้ฮาร์ดดิสก์หมุนเร็วขึ้น 10 เท่า', 'ไม่ต้องใช้ File System อีกต่อไป', 'ป้องกันไฟดับแทน UPS'], 'LVM ช่วยให้แอดมินเพิ่มดิสก์ใหม่เข้า VG แล้วขยาย LV ได้ทันทีโดยไม่เสียข้อมูล']
        ]
      },
      s2: {
        title: 'Mount ถาวรด้วย /etc/fstab', enemy: 'Unmounted-Disk Golem', dlg: 'รีบูตเครื่องแล้วดิสก์เก็บข้อมูลหายไป! ลืมลงทะเบียนใน `/etc/fstab` นั่นเอง!',
        qs: [
          ['ไฟล์ใดบน Linux ใช้กำหนดให้ระบบ Mount พาร์ติชันฮาร์ดดิสก์ให้อัตโนมัติทุกครั้งที่เปิดเครื่อง?', 'เลือกชื่อไฟล์ที่ถูกต้อง', ['/etc/fstab', '/etc/passwd', '/etc/hostname', '/var/log/syslog'], '/etc/fstab เก็บรายการดิสก์ (นิยมอ้างอิงด้วย UUID), จุด Mount และชนิด File System'],
          ['หลังแก้ไขไฟล์ `/etc/fstab` คำสั่งใดใช้ทดสอบว่าไฟล์เขียนถูกต้องก่อนรีบูต (ป้องกันเครื่องบูตค้าง)?', 'เลือกคำสั่งทดสอบที่ปลอดภัยที่สุด', ['sudo mount -a (และ findmnt --verify)', 'sudo rm -f /etc/fstab', 'sudo poweroff -f', 'sudo ping fstab'], 'หาก mount -a ไม่ฟ้อง Error แสดงว่า fstab ถูกต้องพร้อมรีบูตอย่างปลอดภัย']
        ]
      },
      boss: {
        enemy: 'STORAGE-SAN COLOSSUS', dlg: 'อสูรดิสก์ SAN กำลังบีบพื้นที่ให้เต็ม! ขยาย Logical Volume และ File System ให้ถูกต้อง!',
        qs: [
          ['หลังสั่ง `lvextend -L +20G /dev/vg0/lv_data` แล้ว หากต้องการให้ File System แบบ ext4 มองเห็นพื้นที่ใหม่ทันทีต้องสั่งคำสั่งใดต่อ?', 'เลือกคำสั่งขยาย File System ext4', ['resize2fs /dev/vg0/lv_data (หรือใช้แฟลก -r ใน lvextend)', 'mkfs.ext4 (ซึ่งจะล้างข้อมูลทิ้ง!)', 'chmod 777 /dev/vg0/lv_data', 'ip link set up'], 'lvextend ขยายเฉพาะก้อน LV ต้องตามด้วย resize2fs (สำหรับ ext4) หรือ xfs_growfs (สำหรับ XFS) หรือใส่ -r ใน lvextend'],
          ['ทำไมใน `/etc/fstab` จึงนิยมระบุพาร์ติชันด้วย `UUID=...` แทน `/dev/sdb1`?', 'เลือกเหตุผลที่ถูกต้อง', ['เพราะชื่อ /dev/sdX อาจสลับลำดับเมื่อเสียบดิสก์เพิ่ม แต่ UUID คงที่เสมอไม่เปลี่ยน', 'เพราะ UUID สั้นกว่า', 'เพราะ /dev/sdb1 ใช้ไม่ได้กับ Linux', 'เพื่อให้เข้ารหัสข้อมูลอัตโนมัติ'], 'UUID ป้องกันปัญหาดิสก์สลับชื่อหลังเพิ่มหรือถอดฮาร์ดดิสก์ใน Server'],
          ['คำสั่งใดใช้ดูรายการบล็อกดิสก์ พาร์ติชัน และจุด Mount ทั้งหมดแบบแผนผังต้นไม้เข้าใจง่าย?', 'เลือกคำสั่งที่นิยมใช้ที่สุด', ['lsblk', 'whoami', 'nslookup', 'gpupdate'], 'lsblk (List Block Devices) แสดงโครงสร้างดิสก์ พาร์ติชัน LVM และ Mountpoint ชัดเจน']
        ]
      }
    },
    {
      num: 15, roCode: 'lnx_proc15', roName: 'Izlude Process Arena', name: 'Linux Process & Resource Arena',
      subtitle: 'ps, top/htop, Signals (SIGTERM vs SIGKILL), Nice/Renice และ OOM Killer', color: '#22c55e', icon: '📈', tag: 'PROC', cat: 'forensics',
      s1: {
        title: 'จัดการโปรเซส & สัญญาณ Kill', enemy: 'Runaway-Loop Drone', dlg: 'สคริปต์ตัวหนึ่งกิน CPU 100% ค้างทั้ง 8 คอร์! จงหยุดมันอย่างถูกวิธี!',
        qs: [
          ['ความแตกต่างระหว่าง `kill -15 <PID>` (SIGTERM) กับ `kill -9 <PID>` (SIGKILL) คือข้อใด?', 'เลือกความต่างที่สำคัญ', ['SIGTERM (-15) ขอให้โปรแกรมปิดตัวเองอย่างเรียบร้อยและเซฟข้อมูลก่อน • SIGKILL (-9) บังคับตัดจบทันที', 'SIGTERM ลบโปรแกรมออกจากดิสก์', 'SIGKILL ทำให้โปรแกรมทำงานเร็วขึ้น', 'ทั้งสองคำสั่งเหมือนกัน'], 'ควรลอง SIGTERM (-15) ก่อนเสมอ โดยเฉพาะกับ Database เพื่อป้องกันไฟล์เสียหาย หากไม่ยอมปิดจึงใช้ -9'],
          ['คำสั่งใดแสดงรายการโปรเซสทั้งหมดพร้อมผู้ใช้, PID, %CPU และ %MEM แบบละเอียดในครั้งเดียว?', 'เลือกคำสั่งมาตรฐาน', ['ps aux', 'mkdir aux', 'ufw aux', 'tar aux'], 'ps aux (หรือ ps -ef) ใช้ตรวจสอบโปรเซสที่กำลังรันอยู่ทั้งหมดบน Linux']
        ]
      },
      s2: {
        title: 'ลำดับความสำคัญ Nice & OOM Killer', enemy: 'OOM-Reaper Phantom', dlg: 'RAM ของเครื่องใกล้หมดแล้ว! Linux Kernel กำลังจะเรียก OOM Killer มาสังหารโปรเซส!',
        qs: [
          ['ค่า `nice` บน Linux มีช่วงตั้งแต่ -20 ถึง +19 ค่าใดที่หมายถึง "ลำดับความสำคัญสูงสุด (ได้ CPU มากที่สุด)"?', 'เลือกค่า nice ที่ถูกต้อง', ['-20 (ค่ายิ่งน้อย ยิ่งสำคัญมาก • +19 คือสำคัญน้อยสุด)', '+19', '0 เท่านั้น', '+100'], 'จำง่าย ๆ: nice สูง = ใจดีแบ่ง CPU ให้คนอื่น (Priority ต่ำ) • nice ติดลบ = เห็นแก่ตัวดึง CPU ก่อน (Priority สูง)'],
          ['เมื่อ RAM และ Swap ของ Linux Server เต็ม 100% กลไกใดของ Kernel จะเลือกปิดโปรเซสที่กินแรมหนักที่สุดเพื่อไม่ให้ทั้งระบบค้าง?', 'เลือกชื่อกลไกของ Linux Kernel', ['OOM Killer (Out-Of-Memory Killer)', 'DNS Resolver', 'DHCP Agent', 'GRUB Loader'], 'สามารถตรวจสอบประวัติการถูก OOM Killer ปิดได้ใน dmesg หรือ /var/log/syslog']
        ]
      },
      boss: {
        enemy: 'FORK-BOMB HYDRA', dlg: 'ระเบิดโปรเซส Fork Bomb กำลังโคลนตัวเองเต็มเครื่อง! คุม cgroups และ ulimit ให้ได้!',
        qs: [
          ['หากพบโปรเซสสถานะ `Z` (Zombie / defunct) ในคำสั่ง `ps aux` เกิดจากสาเหตุใด?', 'เลือกสาเหตุที่ถูกต้อง', ['Child Process ทำงานจบแล้วแต่ Parent Process ยังไม่ได้เก็บ Exit Status คืน', 'เครื่องติดไวรัสเรียกค่าไถ่', 'ฮาร์ดดิสก์เสีย', 'การ์ดแลนหลุด'], 'Zombie Process ไม่กิน CPU/RAM แต่กินช่อง PID ใน Process Table ต้องแก้หรือรีสตาร์ท Parent Process'],
          ['ฟีเจอร์ใดของ Linux Kernel ที่ใช้จำกัดโควตา CPU, RAM และ I/O ของแต่ละกลุ่มโปรเซส (และเป็นรากฐานของ Docker)?', 'เลือกชื่อฟีเจอร์ Kernel', ['cgroups (Control Groups)', 'FAT32', 'Telnet', 'BIOS Setup'], 'Linux Containers (Docker) อาศัย Namespaces (แยกพื้นที่มองเห็น) + cgroups (จำกัดทรัพยากร)'],
          ['คำสั่งใดใช้ดูไฟล์หรือพอร์ตเครือข่ายที่โปรเซสกำลังเปิดใช้งานอยู่ (List Open Files)?', 'เลือกคำสั่งตรวจสอบ', ['lsof (เช่น lsof -i :80)', 'rmdir', 'passwd', 'hostname'], 'lsof ช่วยหาว่าโปรเซสใดกำลังยึดพอร์ตหรือเปิดไฟล์ที่ลบไม่ออกอยู่']
        ]
      }
    },
    {
      num: 16, roCode: 'lnx_sh16', roName: 'Morroc Bash Bastion', name: 'Bash Scripting & Text Tools',
      subtitle: 'Shebang, Pipe |, Redirection, grep/awk/sed, ตัวแปร และ Exit Code ($?)', color: '#84cc16', icon: '📜', tag: 'BASH', cat: 'cli',
      s1: {
        title: 'พลังแห่ง Pipe & Redirection', enemy: 'Syntax-Error Imp', dlg: 'แอดมินเก่ง ๆ ไม่ไล่อ่าน Log 100,000 บรรทัดด้วยตาเปล่า! ใช้ `grep`, `pipe` และ `>` กรองใน 1 วินาที!',
        qs: [
          ['ความแตกต่างระหว่าง `echo "hi" > log.txt` กับ `echo "hi" >> log.txt` คือข้อใด?', 'เลือกความต่างที่สำคัญมาก', ['> เขียนทับไฟล์เดิมทั้งหมด • >> เขียนต่อท้ายไฟล์เดิมโดยไม่ลบข้อมูลเก่า', '> ลบไฟล์ • >> คัดลอกไฟล์', 'ทั้งคู่เหมือนกัน', '>> ใช้ได้เฉพาะ root'], 'ระวังการใช้ > กับไฟล์สำคัญเพราะจะล้างเนื้อหาเดิมทันที ถ้าจะเก็บ Log ต่อเนื่องต้องใช้ >> เสมอ'],
          ['สัญลักษณ์ `|` (Pipe) ในคำสั่ง `cat access.log | grep "404" | wc -l` ทำหน้าที่อะไร?', 'เลือกหน้าที่ของ Pipe', ['ส่งผลลัพธ์ (stdout) ของคำสั่งซ้ายไปเป็นข้อมูลนำเข้า (stdin) ของคำสั่งขวา', 'ลบไฟล์ที่อยู่ทางซ้าย', 'รันคำสั่งสองฝั่งพร้อมกันโดยไม่เกี่ยวข้องกัน', 'ปิดเครื่องอัตโนมัติ'], 'คำสั่งนี้จะนับจำนวนบรรทัดที่มีคำว่า 404 ในไฟล์ access.log ได้ทันที']
        ]
      },
      s2: {
        title: 'เขียนสคริปต์ Bash อัตโนมัติ', enemy: 'ExitCode-One Wraith', dlg: 'สคริปต์สำรองข้อมูลรันไม่ผ่าน! มาตรวจ Shebang และ Exit Code `$?` กัน!',
        qs: [
          ['บรรทัดแรกสุดของไฟล์ Bash Script (`#!/bin/bash`) เรียกว่าอะไรและมีหน้าที่ใด?', 'เลือกคำตอบที่ถูกต้อง', ['Shebang — บอกระบบปฏิบัติการให้ใช้ตัวแปลคำสั่ง /bin/bash ในการรันไฟล์นี้', 'Comment ธรรมดาไม่มีผลใด ๆ', 'รหัสผ่านเข้าเครื่อง', 'คำสั่งลบไฟล์'], 'หลังจากใส่ #!/bin/bash แล้วต้องกำหนดสิทธิ์รันด้วย chmod +x script.sh ด้วย'],
          ['บน Linux เมื่อคำสั่งทำงานสำเร็จสมบูรณ์ ค่า Exit Status (`echo $?`) จะมีค่าเท่าใด?', 'เลือกค่า Exit Code มาตรฐาน', ['0 (ส่วนค่าที่ไม่ใช่ 0 เช่น 1, 2, 127 หมายถึงเกิดข้อผิดพลาด)', '100', '404', '200'], 'Exit Code 0 = Success ทำให้สคริปต์และ CI/CD Pipeline ตรวจสอบได้ว่าขั้นตอนก่อนหน้าผ่านหรือไม่']
        ]
      },
      boss: {
        enemy: 'REGEX-KRAKEN SCRIPT', dlg: 'มอนสเตอร์ข้อความนับล้านบรรทัดกำลังถล่ม! ใช้ grep, awk และ sed สยบมัน!',
        qs: [
          ['คำสั่งใดใช้ค้นหาคำว่า `Failed password` แบบไม่สนตัวพิมพ์เล็ก-ใหญ่ในไฟล์ `/var/log/auth.log`?', 'เลือกคำสั่ง grep ที่ถูกต้อง', ['grep -i "Failed password" /var/log/auth.log', 'rm -i "Failed password" /var/log/auth.log', 'mkdir -i "Failed password"', 'ip -i auth.log'], 'ออปชัน -i ของ grep คือ case-insensitive (ไม่แยกตัวพิมพ์เล็ก-ใหญ่)'],
          ['เครื่องมือมาตรฐานบน Linux ใดนิยมใช้ดึงคอลัมน์ข้อมูล (เช่น แสดงเฉพาะคอลัมน์ที่ 1 และ 4 ของไฟล์ Log)?', 'เลือกเครื่องมือ Text Processing', ['awk (เช่น awk \'{print $1, $4}\' access.log)', 'ping', 'reboot', 'fdisk'], 'awk เก่งเรื่องตัดคอลัมน์และสรุปข้อมูล ส่วน sed เก่งเรื่องค้นหาและแทนที่ข้อความแบบ Stream'],
          ['สัญลักษณ์ `&&` ในคำสั่ง `apt update && apt upgrade -y` มีความหมายว่าอย่างไร?', 'เลือกการทำงานที่ถูกต้อง', ['จะรันคำสั่งที่สองก็ต่อเมื่อคำสั่งแรกทำงานสำเร็จ (Exit Code = 0) เท่านั้น', 'รันคำสั่งที่สองเฉพาะเมื่อคำสั่งแรกพัง', 'ไม่รันคำสั่งใดเลย', 'ข้ามคำสั่งแรกไปทำคำสั่งสองทันที'], '&& ช่วยป้องกันไม่ให้คำสั่งถัดไปรันต่อเมื่อขั้นตอนก่อนหน้าล้มเหลว']
        ]
      }
    },
    {
      num: 17, roCode: 'lnx_ssh17', roName: 'Comodo SSH Fortress', name: 'SSH Hardening & Tunneling',
      subtitle: 'SSH Key-Based Auth (Ed25519), sshd_config, ปิด Root Login, Fail2ban และ SCP', color: '#06b6d4', icon: '🔑', tag: 'SSH', cat: 'security',
      s1: {
        title: 'SSH Key-Based Authentication', enemy: 'Brute-Key Bot', dlg: 'มีบอทสุ่มรหัสผ่าน SSH เข้าพอร์ต 22 นาทีละ 500 ครั้ง! เปลี่ยนไปใช้ SSH Key แล้วปิด Password Login ซะ!',
        qs: [
          ['เมื่อสร้างคู่กุญแจ SSH ด้วย `ssh-keygen -t ed25519` กุญแจตัวใดที่ต้องนำไปวางบน Server ปลายทาง (`~/.ssh/authorized_keys`)?', 'เลือกกุญแจที่ถูกต้อง', ['Public Key (ไฟล์ .pub) — ห้ามส่ง Private Key ออกไปเด็ดขาด!', 'Private Key (id_ed25519)', 'รหัสผ่าน BIOS', 'ส่งทั้งสองไฟล์ไปแชร์สาธารณะ'], 'Public Key วางบน Server ส่วน Private Key เก็บไว้ที่เครื่องแอดมินและตั้งสิทธิ์ chmod 600 เสมอ'],
          ['คำสั่งใดใช้คัดลอก Public Key ไปติดตั้งบนเครื่อง Server ปลายทางอย่างสะดวกและปลอดภัย?', 'เลือกคำสั่งมาตรฐาน', ['ssh-copy-id admin@192.168.10.10', 'telnet 192.168.10.10', 'chmod 777 ~/.ssh', 'ping -k 192.168.10.10'], 'ssh-copy-id จะเพิ่ม Public Key ลง ~/.ssh/authorized_keys พร้อมตั้งสิทธิ์ไฟล์ให้ถูกต้องอัตโนมัติ']
        ]
      },
      s2: {
        title: 'เสริมแกร่ง sshd_config & Fail2ban', enemy: 'Root-Sniper Phantom', dlg: 'มาล็อกไฟล์ `/etc/ssh/sshd_config` และตั้งยาม Fail2ban แบน IP ผู้บุกรุกอัตโนมัติ!',
        qs: [
          ['การตั้งค่าคู่ใดใน `/etc/ssh/sshd_config` ช่วยป้องกันการสุ่มรหัสผ่าน Brute-Force ได้แข็งแกร่งที่สุด?', 'เลือกการตั้งค่าที่แนะนำระดับ Enterprise', ['PermitRootLogin no และ PasswordAuthentication no (ใช้เฉพาะ SSH Key)', 'PermitRootLogin yes และ PermitEmptyPasswords yes', 'Port 23 (Telnet)', 'AllowAllPasswords yes'], 'ปิดการล็อกอิน root โดยตรงและบังคับใช้ SSH Key ช่วยตัดวงจร Brute-Force ได้เกือบ 100%'],
          ['โปรแกรม `Fail2ban` บน Linux Server มีหน้าที่ช่วยป้องกันเรื่องใด?', 'เลือกหน้าที่ของ Fail2ban', ['เฝ้าดูไฟล์ Log แล้วสั่งแบน IP ที่ล็อกอินผิดเกินกำหนดผ่าน Firewall อัตโนมัติ', 'สำรองฐานข้อมูลลง Google Drive', 'เร่งความเร็วการ์ดจอ', 'แจก IP Address แทน DHCP'], 'Fail2ban จับตา /var/log/auth.log เมื่อพบ IP ยิงรหัสผิดซ้ำ ๆ จะบล็อก IP นั้นชั่วคราวหรือถาวรทันที']
        ]
      },
      boss: {
        enemy: 'CIPHER-TUNNEL WARDEN', dlg: 'ผู้คุมอุโมงค์ SSH กำลังทดสอบการโอนไฟล์เข้ารหัสและ Port Forwarding!',
        qs: [
          ['คำสั่งใดใช้คัดลอกไฟล์ `db.sql` จากเครื่องเราส่งขึ้น Linux Server ปลายทางผ่านช่องทางเข้ารหัส SSH?', 'เลือกคำสั่งที่ปลอดภัย', ['scp db.sql admin@192.168.10.10:/tmp/ (หรือ rsync -avz -e ssh)', 'ftp plaintext db.sql', 'telnet send db.sql', 'ping db.sql'], 'scp และ rsync over SSH เข้ารหัสข้อมูลทั้งหมดระหว่างโอนย้าย ปลอดภัยกว่า FTP ธรรมดามาก'],
          ['หลังแก้ไขไฟล์ `/etc/ssh/sshd_config` แอดมินควรรันคำสั่งใดก่อนรีสตาร์ท sshd เพื่อไม่ให้เผลอพิมพ์ผิดจนรีโมทเข้าไม่ได้?', 'เลือกคำสั่งตรวจไวยากรณ์ sshd', ['sudo sshd -t (Test configuration)', 'sudo rm /etc/ssh/sshd_config', 'sudo reboot -f', 'sudo ufw deny 22'], 'sshd -t ตรวจ Syntax ของ sshd_config และควรเปิดหน้าต่าง SSH เดิมค้างไว้ขณะทดสอบล็อกอินหน้าต่างใหม่'],
          ['SSH Local Port Forwarding (`ssh -L 8080:127.0.0.1:3306 admin@srv`) มีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['เข้าถึงบริการภายใน Server (เช่น พอร์ต 3306) ผ่านอุโมงค์ SSH เข้ารหัสโดยไม่ต้องเปิดพอร์ตฐานข้อมูลออกเน็ต', 'เปิดพอร์ต 3306 ให้ทั้งโลกเข้าได้ฟรี', 'ลบฐานข้อมูล MySQL', 'เปลี่ยน IP ของเครื่อง Server'], 'SSH Tunneling ช่วยให้แอดมินเชื่อมต่อเครื่องมือภายในได้อย่างปลอดภัยโดยไม่เปิดพอร์ตสู่สาธารณะ']
        ]
      }
    },
    {
      num: 18, roCode: 'lnx_smb18', roName: 'Alberta File-Share Bridge', name: 'NFS & Samba Cross-OS Bridge',
      subtitle: 'แชร์ไฟล์ Linux↔Linux (NFS) และ Linux↔Windows (Samba/SMB3) พร้อมตั้งสิทธิ์ปลอดภัย', color: '#0ea5e9', icon: '🌉', tag: 'SMB/NFS', cat: 'network',
      s1: {
        title: 'สะพานแชร์ไฟล์ NFS & Samba', enemy: 'Mount-Denied Imp', dlg: 'ออฟฟิศมีทั้งเครื่อง Windows และ Linux ต้องแชร์โฟลเดอร์กลางร่วมกันให้ราบรื่น!',
        qs: [
          ['หากต้องการให้เครื่อง **Linux Server** เปิดแชร์โฟลเดอร์ให้เครื่องลูกข่าย **Windows** เข้าผ่าน `\\\\192.168.10.10\\shared` ต้องติดตั้งบริการใด?', 'เลือกบริการที่รองรับโปรโตคอล SMB/CIFS บน Linux', ['Samba (พอร์ต TCP 445)', 'Apache2', 'Bind9 DNS', 'Cron'], 'Samba ทำให้ Linux ทำหน้าที่เป็น File/Print Server ที่คุยกับ Windows ผ่าน SMB ได้อย่างสมบูรณ์'],
          ['หากต้องการแชร์พื้นที่จัดเก็บไฟล์ระหว่าง **Linux Server ด้วยกันเอง** โดยเน้นความเร็วสูง ควรใช้โปรโตคอลใด?', 'เลือกโปรโตคอลมาตรฐานฝั่ง Unix/Linux', ['NFS (Network File System — พอร์ต 2049)', 'RDP (3389)', 'POP3 (110)', 'Telnet (23)'], 'NFS เป็นมาตรฐานการแชร์ไฟล์ข้ามเครื่อง Linux/Unix ผ่านไฟล์ตั้งค่า /etc/exports']
        ]
      },
      s2: {
        title: 'ตั้งค่า Samba & ป้องกันช่องโหว่ SMBv1', enemy: 'EternalBlue Specter', dlg: 'พบโปรโตคอล SMBv1 รุ่นเก่าเปิดค้างอยู่ เสี่ยงโดนมัลแวร์แบบ WannaCry! ปิดทันที!',
        qs: [
          ['เหตุใดผู้ดูแลระบบจึงต้องปิด **SMBv1** และบังคับใช้ **SMB 3.0** ขึ้นไปเสมอ?', 'เลือกเหตุผลด้านความปลอดภัย', ['SMBv1 มีช่องโหว่ร้ายแรง (เช่น EternalBlue/WannaCry) และไม่รองรับการเข้ารหัสสมัยใหม่', 'SMBv1 ส่งไฟล์ได้เฉพาะไฟล์ภาพ', 'SMB 3.0 ไม่ต้องใช้ IP Address', 'SMBv1 กินไฟเยอะกว่า'], 'SMB 3.0+ รองรับ Encryption, Signing และอุดช่องโหว่ระดับตำนานของ SMBv1'],
          ['ไฟล์ตั้งค่าหลักของบริการ Samba บน Linux และคำสั่งตรวจสอบไวยากรณ์คือข้อใด?', 'เลือกคู่ที่ถูกต้อง', ['/etc/samba/smb.conf และคำสั่ง testparm', '/etc/hosts และ ping', '/etc/fstab และ df', '/boot/grub.cfg และ uname'], 'testparm ตรวจสอบความถูกต้องของไฟล์ smb.conf ก่อนสั่ง systemctl restart smbd']
        ]
      },
      boss: {
        enemy: 'CROSS-OS BRIDGE TITAN', dlg: 'สะพานเชื่อมข้อมูล Linux–Windows สั่นสะเทือน! จงกำหนดสิทธิ์ NFS/Samba ให้ไร้ช่องโหว่!',
        qs: [
          ['ในไฟล์ `/etc/exports` ของ NFS ตัวเลือก `root_squash` มีหน้าที่ป้องกันอะไร?', 'เลือกคำตอบที่ถูกต้อง', ['ลดสิทธิ์ผู้ใช้ root จากเครื่อง Client ให้กลายเป็นผู้ใช้ไร้สิทธิ์ (nobody) บน Server เพื่อความปลอดภัย', 'ให้ Client ทุกเครื่องเป็น root บน Server ได้หมด', 'บีบอัดไฟล์เป็น zip', 'ลบไฟล์ที่แชร์ทุกคืน'], 'root_squash ป้องกันไม่ให้เครื่องลูกข่ายที่มีสิทธิ์ root แอบแก้ไขไฟล์ระบบบน NFS Server'],
          ['หากเพิ่มผู้ใช้ Linux ใหม่ชื่อ `somchai` แล้วต้องการให้ล็อกอินเข้า Samba Share ได้ ต้องสร้างรหัสผ่าน Samba ด้วยคำสั่งใด?', 'เลือกคำสั่งที่ถูกต้อง', ['sudo smbpasswd -a somchai', 'sudo ping somchai', 'sudo chmod 777 somchai', 'sudo ip addr somchai'], 'Samba แยกฐานข้อมูลรหัสผ่านจาก /etc/shadow จึงต้องเพิ่มผู้ใช้เข้า Samba ด้วย smbpasswd -a'],
          ['การเปิดพอร์ต SMB (445) ออกสู่ Public Internet โดยตรงมีความเสี่ยงอย่างไร?', 'เลือกความเสี่ยงที่แท้จริง', ['เสี่ยงสูงมากต่อการถูกสแกนโจมตี ขโมยข้อมูล และแพร่กระจาย Ransomware ควรอนุญาตเฉพาะภายใน LAN/VPN เท่านั้น', 'ไม่มีความเสี่ยงใด ๆ ควรเปิดให้ทั้งโลก', 'ทำให้เว็บไซต์โหลดเร็วขึ้น', 'ช่วยป้องกัน DDoS'], 'พอร์ต 445 ต้องจำกัดเฉพาะเครือข่ายภายในหรือผ่าน VPN ห้ามเปิดออกอินเทอร์เน็ตสาธารณะ']
        ]
      }
    },
    {
      num: 19, roCode: 'lnx_web19', roName: 'Prontera Web Citadel', name: 'Nginx & Apache Web Citadel',
      subtitle: 'Virtual Host, Reverse Proxy, Load Balancing, SSL/TLS Certbot และ HTTP Status Codes', color: '#38bdf8', icon: '🌐', tag: 'NGINX', cat: 'network',
      s1: {
        title: 'HTTP Status Codes & Virtual Host', enemy: 'Error-502 Mimic', dlg: 'หน้าเว็บขึ้น Error 502 Bad Gateway! มาวินิจฉัยรหัสสถานะ HTTP และตั้งค่า Nginx กัน!',
        qs: [
          ['เมื่อ Nginx ทำหน้าที่ Reverse Proxy แล้วหน้าเว็บขึ้น `502 Bad Gateway` สาเหตุที่พบบ่อยที่สุดคืออะไร?', 'เลือกสาเหตุที่ถูกต้อง', ['บริการแอป Backend ด้านหลัง (เช่น Node/PHP-FPM) หยุดทำงานหรือไม่ตอบสนอง', 'อินเทอร์เน็ตของลูกค้าหลุด', 'รหัสผ่าน Windows หมดอายุ', 'สายจอภาพหลุด'], '502 Bad Gateway แปลว่า Proxy (Nginx) ยังทำงานอยู่ แต่คุยกับ Backend Upstream ด้านหลังไม่สำเร็จ'],
          ['รหัสสถานะ HTTP `200`, `301`, `403`, `404` หมายถึงอะไรตามลำดับ?', 'เลือกความหมายที่ถูกต้อง', ['OK (สำเร็จ), Moved Permanently (ย้ายถาวร), Forbidden (ห้ามเข้าถึง), Not Found (ไม่พบหน้า)', 'Error ทั้งหมด', 'รหัสพอร์ตของ TCP', 'เลขเวอร์ชันของ Linux'], 'เข้าใจ HTTP Status Codes (2xx สำเร็จ, 3xx ย้ายทาง, 4xx ฝั่งผู้ใช้ผิดพลาด, 5xx ฝั่งเซิร์ฟเวอร์ผิดพลาด) ช่วยไล่บั๊กไวมาก']
        ]
      },
      s2: {
        title: 'HTTPS ด้วย Let\'s Encrypt & Load Balance', enemy: 'Plaintext-HTTP Ghost', dlg: 'เบราว์เซอร์ขึ้นเตือน "Not Secure"! มาติดตั้ง SSL/TLS ฟรีด้วย Certbot และกระจายโหลดกัน!',
        qs: [
          ['เครื่องมือยอดนิยมใดใช้ขอและต่ออายุใบรับรอง SSL/TLS ฟรีจาก Let\'s Encrypt ให้ Nginx/Apache อัตโนมัติ?', 'เลือกชื่อเครื่องมือ', ['Certbot', 'WinRAR', 'Notepad', 'Diskpart'], 'Certbot ขอใบรับรอง HTTPS ฟรีและตั้ง Timer ต่ออายุให้อัตโนมัติทุก 60–90 วัน'],
          ['คำสั่งใดใช้ตรวจสอบความถูกต้องของไฟล์ตั้งค่า Nginx ก่อนสั่ง reload เพื่อไม่ให้เว็บล่ม?', 'เลือกคำสั่งตรวจ Config ของ Nginx', ['sudo nginx -t', 'sudo nginx -delete', 'sudo chmod 777 /etc/nginx', 'sudo ping nginx'], 'nginx -t ตรวจ Syntax และพาธใบรับรองทั้งหมด ถ้าขึ้น syntax is ok & test is successful จึงค่อย reload']
        ]
      },
      boss: {
        enemy: 'GATEWAY-504 OVERLORD', dlg: 'ทราฟฟิกเว็บพุ่ง 50,000 req/s จน Backend ล่ม! ตั้งค่า Reverse Proxy & Upstream Pool โค่นมัน!',
        qs: [
          ['บล็อกคำสั่งใดใน Nginx ที่ใช้กำหนดกลุ่ม Backend Server หลายเครื่องเพื่อทำ Load Balancing?', 'เลือก Directive ที่ถูกต้อง', ['upstream backend_pool { server 10.0.0.11; server 10.0.0.12; }', 'dhcp_pool { ... }', 'raid_array { ... }', 'bios_boot { ... }'], 'Nginx ใช้บล็อก upstream ร่วมกับ proxy_pass เพื่อกระจายโหลด (Round-Robin, Least Connections, IP Hash)'],
          ['เหตุใด Nginx จึงรับการเชื่อมต่อพร้อมกันจำนวนมาก (High Concurrency) ได้ดีกว่า Apache แบบ Prefork รุ่นเก่า?', 'เลือกเหตุผลด้านสถาปัตยกรรม', ['Nginx ใช้สถาปัตยกรรม Event-Driven & Asynchronous ทำให้กิน RAM ต่ำมากต่อการเชื่อมต่อ', 'Nginx ไม่ใช้เครือข่าย TCP', 'Nginx เขียนด้วย HTML ล้วน', 'Nginx บังคับปิด Firewall'], 'Event-Driven Worker ของ Nginx รองรับการเชื่อมต่อพร้อมกันหลักหมื่นถึงแสนโดยใช้หน่วยความจำน้อยมาก'],
          ['Virtual Host (Apache) หรือ Server Block (Nginx) มีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['โฮสต์หลายเว็บไซต์/หลายชื่อโดเมนบนเครื่อง Server และหมายเลข IP เดียวกันได้', 'สร้างเครื่องเสมือน Windows 11', 'เพิ่มพื้นที่ฮาร์ดดิสก์เป็น 2 เท่า', 'ส่งอีเมลสแปม'], 'Server Block แยกเว็บไซต์ตามชื่อโดเมน (Host Header) ทำให้ 1 Server รันได้หลายเว็บ']
        ]
      }
    },
    {
      num: 20, roCode: 'lnx_mac20', roName: 'Glast SELinux Citadel', name: 'SELinux & AppArmor Citadel',
      subtitle: 'Mandatory Access Control (MAC), Enforcing/Permissive, Contexts และ Security Audit', color: '#059669', icon: '🛡️', tag: 'SELINUX', cat: 'security',
      s1: {
        title: 'DAC vs MAC & โหมด SELinux', enemy: 'Denied-Context Imp', dlg: 'ตั้ง `chmod 755` ถูกต้องทุกอย่างแล้ว แต่เว็บเซิร์ฟเวอร์บน Rocky Linux ยังอ่านไฟล์ไม่ได้! นี่คือฝีมือ SELinux!',
        qs: [
          ['บน Rocky Linux / RHEL โหมดการทำงานของ SELinux 3 โหมดได้แก่อะไรบ้าง?', 'เลือกชุดโหมดที่ถูกต้อง', ['Enforcing (บังคับใช้และบล็อก), Permissive (บันทึกเตือนอย่างเดียว), Disabled (ปิด)', 'Allow, Deny, Ping', 'Start, Stop, Reboot', 'NAT, Bridged, Host-Only'], 'เวลาแก้ปัญหาไม่ควรปิด SELinux ถาวร ให้เช็กด้วย getenforce หรือลอง Permissive ชั่วคราวเพื่อดู audit log'],
          ['บน Ubuntu Server ระบบ Mandatory Access Control (MAC) ที่ติดตั้งมาเป็นค่าเริ่มต้นแทน SELinux คืออะไร?', 'เลือกชื่อระบบ MAC ของ Ubuntu', ['AppArmor', 'Windows Defender', 'BitLocker', 'NTFS'], 'Ubuntu/Debian ใช้ AppArmor (อ้างอิงตามพาธไฟล์) ส่วน RHEL/Rocky/Fedora ใช้ SELinux (อ้างอิงตาม Security Label/Context)']
        ]
      },
      s2: {
        title: 'แก้สิทธิ์ SELinux Context อย่างมืออาชีพ', enemy: 'Audit-AVC Phantom', dlg: 'เจอข้อความ `AVC denied` ใน audit.log! มาซ่อม SELinux Label แทนการสั่งปิด SELinux กัน!',
        qs: [
          ['คำสั่งใดบน Linux ใช้แสดง SELinux Security Context ของไฟล์หรือโฟลเดอร์?', 'เลือกออปชันที่ถูกต้อง', ['ls -Z (และ ps -eZ สำหรับโปรเซส)', 'ls -X', 'ping -Z', 'df -Z'], 'ออปชัน -Z แสดงป้ายกำกับ SELinux เช่น httpd_sys_content_t เพื่อให้รู้ว่าเว็บเซิร์ฟเวอร์มีสิทธิ์อ่านหรือไม่'],
          ['เมื่อย้ายไฟล์เว็บจาก `/root` ไป `/var/www/html` แล้ว SELinux บล็อก คำสั่งใดใช้คืนค่า Context เริ่มต้นให้ถูกต้อง?', 'เลือกคำสั่งที่ปลอดภัยและถูกต้องที่สุด', ['sudo restorecon -Rv /var/www/html', 'sudo setenforce 0 ถาวร', 'sudo chmod 777 /var/www/html', 'sudo rm -rf /var/www/html'], 'restorecon คืนค่าป้ายกำกับ SELinux ตามนโยบายของโฟลเดอร์ปลายทางโดยยังคงความปลอดภัย Enforcing ไว้ครบถ้วน']
        ]
      },
      boss: {
        enemy: 'EMPEROR OF LINUXIA', dlg: 'จอมจักรพรรดิแห่งทวีป Linuxia ทดสอบบทสรุปความปลอดภัย Linux ระดับองค์กร!',
        qs: [
          ['ข้อแตกต่างสำคัญระหว่าง DAC (chmod/chown) กับ MAC (SELinux/AppArmor) คือข้อใด?', 'เลือกความต่างที่แท้จริง', ['MAC บังคับใช้นโยบายระดับเคอร์เนล แม้บริการถูกแฮกก็ไม่สามารถข้ามไปอ่านไฟล์นอกขอบเขตที่กำหนดได้', 'MAC ใช้เปลี่ยนรหัสผ่านผู้ใช้เท่านั้น', 'DAC ปลอดภัยกว่า MAC เสมอ', 'MAC ใช้ได้เฉพาะบน Windows'], 'MAC ทำหน้าที่เป็นเกราะชั้นในสุด (Defense in Depth) จำกัดความเสียหายแม้แอปพลิเคชันจะมีช่องโหว่'],
          ['ไฟล์ Log ใดบน Rocky Linux/RHEL ที่เก็บเหตุการณ์การบล็อกของ SELinux (AVC Denials)?', 'เลือกพาธไฟล์ Log', ['/var/log/audit/audit.log', '/etc/hostname', '/home/audit.txt', '/tmp/selinux.jpg'], 'แอดมินใช้ audit2why หรือ ausearch -m avc อ่าน /var/log/audit/audit.log เพื่อแก้ปัญหา SELinux ได้ตรงจุด'],
          ['หากต้องการให้ Nginx บน Rocky Linux เชื่อมต่อออกเครือข่ายไปยัง Backend ได้ ต้องเปิด SELinux Boolean ตัวใด?', 'เลือกคำสั่ง setsebool ที่ถูกต้อง', ['sudo setsebool -P httpd_can_network_connect 1', 'sudo chmod 777 nginx', 'sudo ufw disable', 'sudo reboot'], 'SELinux Boolean (-P คือบันทึกถาวร) ควบคุมสิทธิ์เฉพาะด้านของบริการได้อย่างละเอียดโดยไม่ต้องปิด SELinux']
        ]
      }
    },
    {
      num: 21, roCode: 'win_ad21', roName: 'Prontera AD Forest', name: 'Active Directory Forest & OU',
      subtitle: 'Forest, Tree, Domain, Organizational Unit (OU), Global Catalog และ FSMO Roles', color: '#60a5fa', icon: '🏰', tag: 'AD DS', cat: 'users',
      s1: {
        title: 'โครงสร้าง Forest, Domain & OU', enemy: 'Rogue-OU Mimic', dlg: 'ยินดีต้อนรับสู่ทวีป Windows Server! มาจัดระเบียบผู้ใช้ 2,000 คนด้วย Active Directory ให้เป็นระบบ!',
        qs: [
          ['ใน Active Directory หน่วยย่อยภายใน Domain ที่ใช้จัดกลุ่มผู้ใช้/คอมพิวเตอร์เพื่อผูก Group Policy (GPO) หรือมอบหมายสิทธิ์ดูแลเฉพาะแผนกเรียกว่าอะไร?', 'เลือกองค์ประกอบที่ถูกต้อง', ['OU (Organizational Unit)', 'DNS Zone', 'RAID Array', 'Subnet Mask'], 'OU ช่วยจัดโครงสร้างตามแผนก เช่น OU=Accounting, OU=IT และผูก GPO เฉพาะแผนกได้โดยไม่กระทบทั้งบริษัท'],
          ['ขอบเขตความปลอดภัยสูงสุด (Security Boundary) ที่ครอบคลุมทุก Domain และใช้ Schema เดียวกันใน Active Directory คืออะไร?', 'เลือกคำตอบที่ถูกต้อง', ['Forest', 'Workgroup', 'Folder', 'Recycle Bin'], 'Forest เป็นระดับบนสุดของโครงสร้าง AD ประกอบด้วย 1 หรือหลาย Tree/Domain ที่เชื่อถือกันอัตโนมัติ (Transitive Trust)']
        ]
      },
      s2: {
        title: 'Domain Controller & FSMO Roles', enemy: 'PDC-Drift Phantom', dlg: 'องค์กรมี Domain Controller 2 เครื่องเพื่อสำรองกัน! มาทำความรู้จัก Global Catalog และ FSMO Roles!',
        qs: [
          ['บทบาทใดใน 5 FSMO Roles ที่ทำหน้าที่เป็นตัวเทียบเวลาหลัก (Time Source) และประมวลผลการเปลี่ยนรหัสผ่านเร่งด่วนใน Domain?', 'เลือก FSMO Role ที่ถูกต้อง', ['PDC Emulator (Primary Domain Controller Emulator)', 'Print Spooler', 'DHCP Relay', 'Disk Defragmenter'], 'PDC Emulator สำคัญมากต่อการเทียบเวลา (NTP) เพื่อไม่ให้ Kerberos หลุด และการล็อกบัญชีผู้ใช้'],
          ['เหตุใดองค์กรจึงควรมี Domain Controller (DC) อย่างน้อย 2 เครื่องเสมอ?', 'เลือกเหตุผลด้านความเสถียร', ['เพื่อทำ Redundancy & Fault Tolerance หาก DC ตัวแรกล่ม ผู้ใช้ยังล็อกอินและใช้ DNS/AD ได้ต่อเนื่อง', 'เพราะ Windows บังคับไม่ให้สร้างแค่ 1 เครื่อง', 'เพื่อทำให้หน้าจอสว่างขึ้น', 'เพื่อไม่ต้องตั้งรหัสผ่าน'], 'AD ใช้ Multi-Master Replication ซิงค์ข้อมูลระหว่าง DC ทุกตัวอัตโนมัติ ช่วยป้องกัน Single Point of Failure']
        ]
      },
      boss: {
        enemy: 'FOREST-SCHEMA TITAN', dlg: 'ผู้พิทักษ์ Active Directory Forest เปิดการทดสอบขั้นสูง! จงผ่านให้ได้!',
        qs: [
          ['บริการใดที่จำเป็นต้องทำงานคู่กับ Active Directory Domain Services (AD DS) เสมอเพื่อให้เครื่องลูกข่ายค้นหา Domain Controller เจอ?', 'เลือกบริการที่ขาดไม่ได้', ['DNS Server (โดยเฉพาะ SRV Records)', 'FTP Server', 'Print Server', 'Telnet Server'], 'AD พึ่งพา DNS SRV Records (เช่น _ldap._tcp, _kerberos._tcp) ในการค้นหา Domain Controller'],
          ['พอร์ตมาตรฐานสำหรับ LDAP และการยืนยันตัวตน Kerberos ของ Active Directory คือหมายเลขใดตามลำดับ?', 'เลือกคู่พอร์ตที่ถูกต้อง', ['389 (LDAP / LDAPS 636) และ 88 (Kerberos)', '80 และ 443', '21 และ 22', '25 และ 110'], 'จำแม่น ๆ: Kerberos = 88, LDAP = 389, LDAPS = 636, Global Catalog = 3268'],
          ['ฟีเจอร์ `Active Directory Recycle Bin` มีประโยชน์อย่างไรเมื่อแอดมินเผลอลบบัญชีผู้ใช้หรือ OU?', 'เลือกประโยชน์ที่ถูกต้อง', ['กู้คืน Object (ผู้ใช้/กลุ่ม/OU) กลับมาพร้อม SID และสิทธิ์เดิมทั้งหมดได้โดยไม่ต้อง Restore จาก Backup', 'ลบไฟล์ขยะในไดรฟ์ C:', 'ล้างแคช DNS', 'เพิ่มพื้นที่ RAM'], 'การกู้จาก AD Recycle Bin รักษา SID เดิมไว้ครบ ทำให้ผู้ใช้ไม่เสียสิทธิ์เข้าโฟลเดอร์แชร์เดิม']
        ]
      }
    },
    {
      num: 22, roCode: 'win_gpo22', roName: 'Geffen GPO Palace', name: 'Group Policy (GPO) Palace',
      subtitle: 'ลำดับ LSDOU, Enforced vs Block Inheritance, gpupdate, gpresult และ Security Baselines', color: '#3b82f6', icon: '📋', tag: 'GPO', cat: 'users',
      s1: {
        title: 'ลำดับการบังคับใช้ LSDOU', enemy: 'Conflicting-Policy Imp', dlg: 'นโยบายล็อก USB ไม่ทำงานบนเครื่องแผนกบัญชี! มาไล่ลำดับการใช้ GPO กัน!',
        qs: [
          ['ลำดับการประมวลผล Group Policy (GPO) บน Windows Domain เรียงจากก่อนไปหลัง (ตัวหลังชนะหากตั้งค่าชนกัน) คือข้อใด?', 'เลือกลำดับมาตรฐาน LSDOU', ['Local → Site → Domain → OU (ลูกชนะแม่)', 'OU → Domain → Site → Local', 'DNS → DHCP → HTTP', 'BIOS → RAM → CPU'], 'จำย่อว่า L-S-D-O-U นโยบายที่อยู่ใกล้ตัวผู้ใช้/เครื่องที่สุด (OU ชั้นในสุด) จะมีผลทับตัวก่อนหน้า'],
          ['คำสั่งใดบนเครื่องลูกข่าย Windows ใช้ตรวจสอบรายงานว่า GPO ตัวใดบ้างที่มีผลบังคับใช้จริงอยู่ตอนนี้?', 'เลือกคำสั่งตรวจสอบ GPO', ['gpresult /r (หรือ gpresult /h report.html)', 'ping /gpo', 'chmod /gpo', 'df -gpo'], 'gpresult /r แสดงสรุป GPO ที่ถูก Apply ทั้งฝั่ง Computer และ User ได้ทันที']
        ]
      },
      s2: {
        title: 'Enforced vs Block Inheritance', enemy: 'Override-Rule Specter', dlg: 'แผนกหนึ่งสั่ง Block Inheritance เพื่อหนีนโยบายความปลอดภัยของบริษัท! ทำอย่างไรให้ GPO ระดับ Domain บังคับใช้เสมอ?',
        qs: [
          ['หาก OU กด `Block Inheritance` แต่นโยบายระดับ Domain ถูกติ๊ก `Enforced (No Override)` ผลลัพธ์จะเป็นอย่างไร?', 'เลือกกฎที่ถูกต้องของ GPO', ['Enforced ชนะ Block Inheritance เสมอ — นโยบายระดับ Domain จะยังคงถูกบังคับใช้', 'Block Inheritance ชนะเสมอ', 'เครื่องลูกข่ายจะจอฟ้า', 'นโยบายทั้งคู่จะถูกลบทิ้ง'], 'Enforced ใช้สำหรับนโยบายความปลอดภัยภาคบังคับขององค์กรที่ห้ามแผนกใดยกเว้นเด็ดขาด'],
          ['การตั้งค่า GPO แบ่งออกเป็น 2 ฝั่งใหญ่ ๆ ได้แก่ข้อใด?', 'เลือก 2 ส่วนของ GPO', ['Computer Configuration (มีผลตอนบูตเครื่อง) และ User Configuration (มีผลตอนล็อกอิน)', 'RAM Configuration และ Fan Configuration', 'Linux Config และ Android Config', 'BIOS Config และ Monitor Config'], 'Computer Config คุมตัวเครื่องไม่ว่าใครล็อกอิน ส่วน User Config ตามตัวผู้ใช้ไปทุกเครื่องที่ล็อกอิน']
        ]
      },
      boss: {
        enemy: 'POLICY-ARBITER MECH', dlg: 'ตุลาการ GPO ตรวจสอบความแม่นยำการควบคุมนโยบายทั้งองค์กร!',
        qs: [
          ['โฟลเดอร์แชร์พิเศษบน Domain Controller ที่ใช้เก็บไฟล์เทมเพลต GPO และ Logon Scripts เพื่อซิงค์ให้ทุก DC คือข้อใด?', 'เลือกชื่อโฟลเดอร์สำคัญของ AD', ['SYSVOL (\\\\domain\\SYSVOL)', 'C:\\Downloads', 'C:\\Temp', '/var/www'], 'หาก SYSVOL ไม่ซิงค์ระหว่าง DC เครื่องลูกข่ายจะดึง Group Policy ไปใช้งานไม่ได้'],
          ['หากต้องการให้ GPO ล็อกหน้าจออัตโนมัติมีผลเฉพาะกลุ่มผู้ใช้ `Finance_Staff` ภายใน OU เดียวกัน ควรใช้ฟีเจอร์ใด?', 'เลือกวิธีกรองเป้าหมาย GPO', ['Security Filtering (หรือ Item-Level Targeting)', 'Format Drive C:', 'Disable DNS', 'Uninstall AD DS'], 'Security Filtering จำกัดขอบเขตให้ GPO ทำงานเฉพาะ Security Group หรือผู้ใช้ที่ระบุเท่านั้น'],
          ['รอบเวลาปกติที่เครื่องลูกข่าย Windows Domain จะอัปเดต GPO เบื้องหลังอัตโนมัติ (โดยไม่รัน gpupdate /force) คือประมาณกี่นาที?', 'เลือกค่ามาตรฐานของ Windows', ['ทุก 90 นาที (บวกลบสุ่ม 0–30 นาที เพื่อไม่ให้โหลดชนกัน)', 'ทุก 1 วินาที', 'ปีละ 1 ครั้ง', 'ไม่อัปเดตเลยตลอดไป'], 'การสุ่ม Offset 0–30 นาทีช่วยกระจายโหลดไม่ให้เครื่องลูกข่ายหลายพันเครื่องดึง GPO จาก DC พร้อมกัน']
        ]
      }
    },
    {
      num: 23, roCode: 'win_dns23', roName: 'Al De Baran Net-Tower', name: 'Windows DNS & DHCP Tower',
      subtitle: 'Forward/Reverse Lookup Zones, DHCP Scopes, Exclusions, Reservations และ Failover', color: '#0284c7', icon: '📡', tag: 'DNS/DHCP', cat: 'network',
      s1: {
        title: 'Forward & Reverse Lookup DNS', enemy: 'Poisoned-Cache Drone', dlg: 'เครื่องลูกข่ายแปลงชื่อโดเมนเป็น IP ได้ แต่แปลง IP กลับเป็นชื่อไม่ได้! มาตั้ง Reverse Lookup Zone กัน!',
        qs: [
          ['DNS Record ประเภทใดที่ใช้ใน **Reverse Lookup Zone** เพื่อแปลงหมายเลข IP กลับเป็นชื่อโฮสต์ (Hostname)?', 'เลือกประเภท Record ที่ถูกต้อง', ['PTR Record (Pointer Record)', 'A Record', 'MX Record', 'CNAME Record'], 'Forward Lookup ใช้ A/AAAA (ชื่อ→IP) ส่วน Reverse Lookup ใช้ PTR (IP→ชื่อ) สำคัญมากต่อ Mail Server และ Audit'],
          ['หากต้องการให้ `www.college.local` ชี้เป็นชื่อเล่น (Alias) ไปยังชื่อโฮสต์จริง `web01.college.local` ควรสร้าง Record ใด?', 'เลือก DNS Record ที่เหมาะสม', ['CNAME Record (Canonical Name)', 'PTR Record', 'SOA Record', 'DHCP Scope'], 'CNAME ช่วยผูกชื่อโดเมนย่อยหลายชื่อเข้ากับชื่อโฮสต์เป้าหมายเดียว หากเปลี่ยน IP ที่ A Record ของโฮสต์หลัก ทุกชื่อเล่นจะตามไปอัตโนมัติ']
        ]
      },
      s2: {
        title: 'บริหาร DHCP Scope & Reservation', enemy: 'Rogue-DHCP Mimic', dlg: 'พรินเตอร์เครือข่ายเปลี่ยน IP เองทุกเช้าจนพิมพ์งานไม่ได้! แก้ด้วย DHCP Reservation!',
        qs: [
          ['ต้องการให้พรินเตอร์รับ IP อัตโนมัติจาก DHCP แต่ต้องได้หมายเลขเดิม `192.168.10.200` ทุกครั้ง ต้องตั้งค่าใดโดยอ้างอิงจากอะไร?', 'เลือกคำตอบที่ถูกต้อง', ['DHCP Reservation โดยผูกหมายเลข IP กับ MAC Address ของพรินเตอร์', 'ตั้งเวลา Lease Time เป็น 1 วินาที', 'ปิด DHCP Server', 'เปลี่ยนสายแลนเป็นสีแดง'], 'DHCP Reservation จ่าย IP เดิมให้เครื่องเดิมเสมอผ่าน MAC Address ช่วยจัดการง่ายจากศูนย์กลาง'],
          ['ความต่างระหว่าง `Exclusion Range` กับ `Reservation` ใน Windows DHCP Server คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['Exclusion กันช่วง IP ไม่ให้ DHCP แจก (เพื่อเอาไปตั้ง Static เอง) • Reservation จอง IP เฉพาะให้ MAC นั้น', 'ทั้งสองอย่างเหมือนกัน', 'Exclusion แจก IP ซ้ำให้ทุกเครื่อง', 'Reservation ใช้ลบ Scope'], 'Exclusion มักใช้กันช่วง IP ของ Router และ Server ที่ตั้ง Static IP ไว้แล้วไม่ให้ DHCP แจกชน']
        ]
      },
      boss: {
        enemy: 'SPLIT-BRAIN HYDRA', dlg: 'อสูร DNS/DHCP กำลังแจก IP ผิดวงและปลอมคำตอบโดเมน! กอบกู้หอคอยเครือข่าย!',
        qs: [
          ['บน Windows Active Directory เหตุใดก่อนที่ DHCP Server ตัวใหม่จะเริ่มแจก IP ได้ ต้องกด **Authorize** ใน AD ก่อน?', 'เลือกเหตุผลด้านความปลอดภัย', ['เพื่อป้องกัน Rogue DHCP Server เถื่อนที่ผู้ไม่หวังดีแอบนำมาเสียบในเครือข่ายองค์กร', 'เพื่อจ่ายค่าลิขสิทธิ์เพิ่ม', 'เพื่อเปิดไฟ LED ที่การ์ดแลน', 'เพื่อปิดการทำงานของ DNS'], 'Windows DHCP Server จะตรวจสอบสิทธิ์ใน AD ก่อนเริ่มจ่าย IP ลดความเสี่ยง Rogue DHCP ภายในโดเมน'],
          ['การตั้งค่า **DHCP Failover** (Load Balance / Hot Standby) ระหว่าง Server 2 เครื่องมีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['หาก DHCP Server ตัวหลักล่ม ตัวสำรองจะแจกและต่ออายุ IP แทนได้ทันทีโดยไม่แจก IP ชนกัน', 'เพิ่มความเร็วอินเทอร์เน็ต 2 เท่า', 'สร้างเว็บไซต์อัตโนมัติ', 'ไม่ต้องใช้ Subnet Mask'], 'DHCP Failover ซิงค์ฐานข้อมูล Lease ระหว่าง 2 เซิร์ฟเวอร์ ทำให้ระบบแจก IP มี High Availability'],
          ['ตัวเลือก `DNS Forwarder` ใน Windows DNS Server ทำหน้าที่อะไร?', 'เลือกหน้าที่ที่ถูกต้อง', ['ส่งต่อคำถามชื่อโดเมนภายนอกที่ Server ไม่รู้จัก (เช่น google.com) ไปถาม DNS ภายนอกเช่น 8.8.8.8 หรือ 1.1.1.1', 'ลบ Domain ภายในทิ้ง', 'บล็อกทุกเว็บไซต์', 'เปลี่ยนชื่อเครื่องลูกข่าย'], 'Forwarder ช่วยให้เครื่องภายในเข้าได้ทั้งโดเมนองค์กร (college.local) และเว็บไซต์บนอินเทอร์เน็ต']
        ]
      }
    },
    {
      num: 24, roCode: 'win_iis24', roName: 'Juno IIS Bastion', name: 'IIS & Windows Web Bastion',
      subtitle: 'IIS Manager, Application Pools, Site Bindings, HTTPS SSL และ Logging', color: '#2563eb', icon: '🕸️', tag: 'IIS', cat: 'network',
      s1: {
        title: 'Application Pools & Site Bindings', enemy: 'AppPool-Crash Imp', dlg: 'เว็บทะเบียนนักศึกษาบน Windows Server หยุดทำงาน (503 Service Unavailable)! มาตรวจ IIS Application Pool กัน!',
        qs: [
          ['ใน IIS (Internet Information Services) เมื่อหน้าเว็บขึ้น `503 Service Unavailable` จุดแรกที่ควรตรวจสอบใน IIS Manager คืออะไร?', 'เลือกจุดตรวจสอบหลักของ IIS', ['Application Pool ของเว็บไซต์นั้นหยุดทำงาน (Stopped) หรือไม่', 'สายคีย์บอร์ดหลุดหรือไม่', 'เมาส์มีถ่านหรือไม่', 'วอลเปเปอร์หน้าจอ'], 'หากรหัสผ่าน Identity ผิดหรือแอปแครชซ้ำ ๆ Application Pool จะหยุดตัวเองและตอบกลับ 503 ทันที'],
          ['ฟีเจอร์ `Application Pool` ใน IIS ช่วยแยกการทำงานของหลายเว็บไซต์อย่างไร?', 'เลือกประโยชน์สำคัญ', ['แยก Worker Process (w3wp.exe) อิสระต่อกัน หากเว็บหนึ่งแครชจะไม่ลากเว็บอื่นล่มตาม', 'รวมทุกเว็บไว้ในไฟล์เดียว', 'บีบอัดรูปภาพอัตโนมัติ', 'แทนที่ระบบฐานข้อมูล SQL'], 'การแยก App Pool เพิ่มทั้งความเสถียรและความปลอดภัย (Isolation) ระหว่างแต่ละเว็บแอป']
        ]
      },
      s2: {
        title: 'HTTPS Binding & W3C Logs', enemy: 'Expired-Cert Ghost', dlg: 'ใบรับรอง SSL บน IIS หมดอายุ! มาผูก HTTPS Binding พอร์ต 443 และตรวจ IIS Logs กัน!',
        qs: [
          ['ในการตั้งค่า **Site Bindings** ของ IIS เพื่อให้หลายเว็บใช้ HTTPS พอร์ต 443 ร่วมกันบน IP เดียว ต้องติ๊กเปิดฟีเจอร์ใด?', 'เลือกฟีเจอร์มาตรฐาน TLS', ['Require Server Name Indication (SNI)', 'Disable TCP/IP', 'Enable Telnet', 'Force HTTP Only'], 'SNI ทำให้ IIS เลือกส่งใบรับรอง SSL ให้ตรงกับชื่อโดเมนที่เบราว์เซอร์ร้องขอได้แม้ใช้ IP เดียวกัน'],
          ['โฟลเดอร์เริ่มต้นที่ IIS เก็บไฟล์ Log การเข้าชมเว็บ (W3C Extended Log) คือที่ใด?', 'เลือกพาธเริ่มต้นของ IIS Logs', ['C:\\inetpub\\logs\\LogFiles', 'C:\\Windows\\Fonts', 'C:\\Users\\Public\\Music', '/etc/nginx'], 'แอดมินใช้ Log ใน C:\\inetpub\\logs\\LogFiles วิเคราะห์ทราฟฟิก Error 500/404 และการโจมตีเว็บ']
        ]
      },
      boss: {
        enemy: 'WORKER-PROCESS TITAN', dlg: 'Worker Process w3wp.exe กิน RAM ทะลุเพดาน! ควบคุม IIS ให้กลับมาเสถียร!',
        qs: [
          ['บริการ Windows Service ที่ทำหน้าที่เป็นแกนหลักของเว็บเซิร์ฟเวอร์ IIS มีชื่อ Service Name ว่าอะไร?', 'เลือกชื่อบริการที่ถูกต้อง', ['W3SVC (World Wide Web Publishing Service)', 'Spooler', 'Audiosrv', 'Themes'], 'สามารถสั่ง Restart-Service W3SVC หรือ iisreset ใน PowerShell ได้เมื่อจำเป็น'],
          ['การตั้งค่า `Application Pool Recycling` ใน IIS มีวัตถุประสงค์เพื่ออะไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['รีสตาร์ท Worker Process อย่างนุ่มนวลตามเวลาหรือขีดจำกัด RAM เพื่อป้องกันอาการ Memory Leak สะสม', 'ลบไฟล์เว็บไซต์ทั้งหมดทิ้ง', 'ฟอร์แมตดิสก์ทุกสัปดาห์', 'ปิดเว็บไซต์ตอนกลางคืน'], 'Overlapped Recycling สร้าง Process ใหม่มารับงานก่อนปิดตัวเก่า ช่วยให้เว็บไม่สะดุด'],
          ['โมดูล `URL Rewrite` ใน IIS นิยมนำมาใช้ทำหน้าที่ใดมากที่สุด?', 'เลือกการใช้งานที่พบบ่อย', ['เปลี่ยนเส้นทาง HTTP (80) ไปยัง HTTPS (443) อัตโนมัติ และช่วยทำ Reverse Proxy', 'เปลี่ยนฟอนต์ Windows', 'สร้างผู้ใช้ Active Directory', 'แบ่งพาร์ติชันดิสก์'], 'URL Rewrite ช่วยบังคับให้ผู้ใช้ทุกคนเข้าเว็บผ่าน HTTPS ที่ปลอดภัยเสมอ']
        ]
      }
    },
    {
      num: 25, roCode: 'win_dfs25', roName: 'Payon DFS Storage Vault', name: 'Windows Storage, ReFS & DFS',
      subtitle: 'NTFS vs ReFS, Storage Spaces, DFS Namespace, DFS Replication และ Shadow Copies', color: '#4f46e5', icon: '🗄️', tag: 'DFS', cat: 'storage',
      s1: {
        title: 'NTFS vs ReFS & Shadow Copies', enemy: 'BitRot-Corrupt Slime', dlg: 'ไฟล์สำคัญบน File Server ถูกผู้ใช้เผลอเซฟทับ! กู้คืนใน 10 วินาทีด้วย Volume Shadow Copy!',
        qs: [
          ['ฟีเจอร์ใดบน Windows File Server ที่ช่วยให้ผู้ใช้คลิกขวา "Previous Versions" เพื่อกู้ไฟล์เวอร์ชันเมื่อวานที่เผลอแก้ทับได้เอง?', 'เลือกฟีเจอร์ที่ถูกต้อง', ['Volume Shadow Copy Service (VSS)', 'Disk Cleanup', 'Windows Paint', 'Task Manager'], 'VSS สร้างจุดสำเนาไฟล์ตามตารางเวลา ช่วยลดภาระแอดมินในการกู้ไฟล์ที่ผู้ใช้เผลอลบหรือแก้ผิด'],
          ['ระบบไฟล์ **ReFS (Resilient File System)** บน Windows Server มีจุดเด่นเหนือ NTFS ในด้านใด?', 'เลือกจุดเด่นของ ReFS', ['มี Integrity Streams ตรวจจับและซ่อมแซมข้อมูลเพี้ยน (Bit Rot) อัตโนมัติ และรองรับ Volume ขนาดมหาศาล', 'ใช้ได้เฉพาะแฟลชไดรฟ์ 2 GB', 'ไม่รองรับไฟล์ใหญ่กว่า 4 GB', 'บูตระบบปฏิบัติการ Linux'], 'ReFS ออกแบบมาสำหรับพื้นที่เก็บข้อมูลขนาดใหญ่และ Hyper-V VHDX ที่ต้องการความทนทานสูง']
        ]
      },
      s2: {
        title: 'DFS Namespace & Replication', enemy: 'Split-File Phantom', dlg: 'บริษัทมี File Server 3 สาขา แต่อยากให้พนักงานเข้าผ่านลิงก์เดียว `\\\\college.local\\files`!',
        qs: [
          ['ฟีเจอร์ **DFS Namespaces (DFS-N)** บน Windows Server ช่วยเรื่องใด?', 'เลือกคำอธิบายที่ถูกต้อง', ['รวมโฟลเดอร์แชร์จากหลายเซิร์ฟเวอร์มาแสดงภายใต้ชื่อลิงก์กลางเดียว ทำให้ผู้ใช้ไม่ต้องจำชื่อเครื่อง Server', 'แปลงชื่อโดเมนเป็น IP แทน DNS', 'แจก IP อัตโนมัติแทน DHCP', 'ป้องกันไวรัสแทน Antivirus'], 'หากย้ายไฟล์ไปเครื่อง Server ใหม่ แอดมินแค่เปลี่ยนปลายทางใน DFS Namespace ผู้ใช้ยังเข้าลิงก์เดิมได้ทันที'],
          ['ฟีเจอร์ **DFS Replication (DFS-R)** ทำหน้าที่อะไร?', 'เลือกหน้าที่ที่ถูกต้อง', ['ซิงโครไนซ์ไฟล์ระหว่าง File Server หลายเครื่องหรือหลายสาขาให้อัปเดตตรงกันอัตโนมัติ (ส่งเฉพาะส่วนที่เปลี่ยน)', 'บีบอัดไฟล์เป็น PDF', 'ล็อกหน้าจอพนักงาน', 'สแกนพอร์ตเครือข่าย'], 'DFS-R ใช้ RDC (Remote Differential Compression) ส่งเฉพาะบล็อกข้อมูลที่เปลี่ยนแปลง ช่วยประหยัดแบนด์วิดท์ WAN']
        ]
      },
      boss: {
        enemy: 'STORAGE-SPACES GOLEM', dlg: 'คลังจัดเก็บข้อมูล DFS และ NTFS กำลังถูกท้าทาย! รักษาสิทธิ์และข้อมูลให้สมบูรณ์!',
        qs: [
          ['หากตั้งค่า Share Permission = `Change` และ NTFS Permission = `Full Control` สิทธิ์การใช้งานจริงเมื่อเข้าผ่านเครือข่ายคืออะไร?', 'เลือกสิทธิ์ Effective Permission ที่ถูกต้อง', ['Change (เพราะระบบยึดสิทธิ์ที่เข้มงวดที่สุดระหว่าง Share และ NTFS)', 'Full Control', 'Deny ทั้งหมด', 'Read อย่างเดียว'], 'แนวปฏิบัติที่ดีที่สุด (Best Practice) คือตั้ง Share = Authenticated Users: Change แล้วคุมสิทธิ์ละเอียดด้วย NTFS'],
          ['เครื่องมือ `File Server Resource Manager (FSRM)` บน Windows Server มีฟีเจอร์สำคัญใดบ้าง?', 'เลือกฟีเจอร์ของ FSRM', ['ตั้งโควตาพื้นที่โฟลเดอร์ (Quotas) และบล็อกการเซฟไฟล์นามสกุลต้องห้าม/Ransomware (File Screening)', 'ออกแบบกราฟิก 3 มิติ', 'ติดตั้ง Linux Kernel', 'ทำ Load Balancing เว็บ'], 'FSRM File Screening ช่วยตรวจจับและบล็อกไฟล์นามสกุลของ Ransomware ไม่ให้เขียนลง File Server ได้'],
          ['เทคโนโลยี **Storage Spaces** บน Windows Server คล้ายคลึงกับแนวคิดใด?', 'เลือกแนวคิดที่ใกล้เคียงที่สุด', ['Software-Defined RAID (รวมดิสก์หลายลูกเป็น Storage Pool แล้วสร้าง Virtual Disk แบบ Mirror/Parity)', 'DNS Cache', 'SSH Tunnel', 'Group Policy'], 'Storage Spaces ช่วยทำ Mirror/Parity และ Storage Tiering (SSD+HDD) ด้วยซอฟต์แวร์ใน Windows Server']
        ]
      }
    },
    {
      num: 26, roCode: 'win_hv26', roName: 'Einbroch Hyper-V Cluster', name: 'Hyper-V & Failover Clustering',
      subtitle: 'Hyper-V Gen 1/2, External/Internal vSwitch, Failover Cluster, Quorum และ CSV', color: '#6366f1', icon: '⚡', tag: 'HYPER-V', cat: 'hardware',
      s1: {
        title: 'Hyper-V Generation 2 & vSwitch', enemy: 'VHDX-Lock Drone', dlg: 'มาสร้าง VM สมัยใหม่บน Microsoft Hyper-V และเลือก Virtual Switch ให้ตรงงาน!',
        qs: [
          ['ข้อดีของ **Hyper-V Generation 2 VM** เมื่อเทียบกับ Generation 1 คือข้อใด?', 'เลือกข้อดีที่ถูกต้อง', ['รองรับ UEFI, Secure Boot, Virtual TPM 2.0 และบูตจาก SCSI VHDX ได้เร็วกว่า', 'รันได้เฉพาะ MS-DOS', 'ไม่ต้องใช้ RAM', 'จำกัดดิสก์ที่ 2 GB'], 'การติดตั้ง Windows Server 2022 หรือ Windows 11 บน Hyper-V ควรเลือก Generation 2 เสมอ'],
          ['ชนิดของ Virtual Switch ใน Hyper-V ใดที่อนุญาตให้ VM คุยกับ Host และออกเครือข่ายจริงภายนอกได้?', 'เลือกชนิด vSwitch', ['External Virtual Switch', 'Private Virtual Switch (คุยกันเฉพาะ VM)', 'Internal Virtual Switch (คุยได้แค่ VM กับ Host)', 'Disconnected Switch'], 'External ผูกกับการ์ดแลนจริง • Internal คุยกับ Host ได้แต่ไม่ออกเน็ต • Private แยกวงเฉพาะ VM ด้วยกัน']
        ]
      },
      s2: {
        title: 'Failover Cluster & Quorum', enemy: 'Split-Quorum Wraith', dlg: 'โหนด Hyper-V ตัวที่ 1 ไฟดับกะทันหัน! Failover Cluster ต้องย้าย VM ไปเปิดที่โหนด 2 ทันที!',
        qs: [
          ['ใน Windows Failover Clustering แนวคิด **Quorum (Witness)** มีไว้เพื่อป้องกันปัญหาใด?', 'เลือกปัญหาที่ Quorum ป้องกัน', ['Split-Brain (ป้องกันโหนดที่ขาดการติดต่อกันต่างคนต่างรัน VM ตัวเดียวกันจนข้อมูลพัง)', 'พัดลมหมุนช้า', 'จอภาพกระพริบ', 'คีย์บอร์ดพิมพ์ไทยไม่ได้'], 'Quorum ใช้หลักเสียงข้างมาก (เช่น 2 โหนด + 1 File Share/Cloud Witness) เพื่อให้มีเพียงฝั่งเดียวที่ทำงานต่อได้'],
          ['พื้นที่จัดเก็บข้อมูลกลางที่ทุกโหนดใน Hyper-V Cluster สามารถอ่าน-เขียนไฟล์ VHDX พร้อมกันได้เรียกว่าอะไร?', 'เลือกชื่อเทคโนโลยี', ['CSV (Cluster Shared Volumes)', 'FAT16', 'Recycle Bin', 'Pagefile'], 'CSV ทำให้ Live Migration และ Auto-Failover ระหว่างโหนด Hyper-V ทำงานได้อย่างรวดเร็ว']
        ]
      },
      boss: {
        enemy: 'FAILOVER-NODE COLOSSUS', dlg: 'พายุไฟฟ้าโจมตี Cluster 3 โหนด! รักษา High Availability ให้รอดพ้น!',
        qs: [
          ['นามสกุลไฟล์ Virtual Hard Disk รุ่นใหม่ของ Hyper-V ที่รองรับขนาดสูงสุด 64 TB และทนทานต่อไฟดับดีกว่า VHD เดิมคือข้อใด?', 'เลือกนามสกุลไฟล์', ['.vhdx', '.txt', '.mp4', '.exe'], 'VHDX มีระบบ Log ภายในป้องกันไฟล์เสียหายเมื่อไฟดับ และรองรับพื้นที่ถึง 64 TB (VHD เดิมได้แค่ 2 TB)'],
          ['ฟีเจอร์ **Dynamic Memory** ใน Hyper-V ช่วยบริหารจัดการทรัพยากรอย่างไร?', 'เลือกคำอธิบายที่ถูกต้อง', ['ปรับเพิ่ม-ลด RAM ให้ VM อัตโนมัติตามภาระงานจริงในช่วง Minimum–Maximum ที่กำหนด', 'เพิ่มความจุฮาร์ดดิสก์อัตโนมัติ', 'เปลี่ยนรหัสผ่านทุกชั่วโมง', 'ปิดเครื่องอัตโนมัติ'], 'Dynamic Memory ช่วยให้ Host เดียวรองรับจำนวน VM ได้มากขึ้นโดยไม่ทิ้ง RAM ไว้เฉย ๆ'],
          ['ฟีเจอร์ **Hyper-V Replica** ใช้เพื่อวัตถุประสงค์ใดในแผน Disaster Recovery?', 'เลือกคำตอบที่ถูกต้อง', ['จำลอง (Replicate) VM ข้ามไปยังไซต์สำรอง (DR Site) อย่างต่อเนื่องเพื่อเปิดใช้งานแทนหากศูนย์หลักล่ม', 'ลบ VM เก่าทิ้ง', 'สแกนไวรัสในเครือข่าย', 'สร้างใบรับรอง SSL'], 'Hyper-V Replica ช่วยลด RTO และ RPO ได้อย่างมากโดยไม่ต้องลงทุน SAN Replication ราคาแพง']
        ]
      }
    },
    {
      num: 27, roCode: 'win_ps27', roName: 'Morroc PowerShell Temple', name: 'PowerShell Automation Temple',
      subtitle: 'Verb-Noun Cmdlets, Object Pipeline, Where-Object, Export-Csv และ PSRemoting', color: '#0284c7', icon: '💠', tag: 'PWSH', cat: 'cli',
      s1: {
        title: 'หลักการ Verb-Noun & Object Pipeline', enemy: 'String-Parse Imp', dlg: 'PowerShell ไม่ได้ส่งแค่ตัวหนังสือเหมือน CMD แต่ส่งเป็น .NET Objects! มาฝึกเขียนคำสั่งแบบโปร!',
        qs: [
          ['โครงสร้างการตั้งชื่อคำสั่ง (Cmdlet) ใน PowerShell เป็นไปตามรูปแบบใด?', 'เลือกรูปแบบมาตรฐาน', ['Verb-Noun (กริยา-นาม) เช่น Get-Service, Restart-Computer, New-ADUser', 'ตัวเลข 4 หลัก', 'ชื่อโฟลเดอร์เท่านั้น', 'คำย่อ 2 ตัวอักษร'], 'ระบบ Verb-Noun ทำให้เดาคำสั่งได้ง่าย เช่น Get- (ดู), Set- (แก้), New- (สร้าง), Remove- (ลบ)'],
          ['คำสั่งใดใช้แสดงเฉพาะ Windows Services ที่กำลังหยุดทำงาน (`Stopped`)?', 'เลือกคำสั่ง Pipeline ที่ถูกต้อง', ['Get-Service | Where-Object {$_.Status -eq "Stopped"}', 'Get-Service | Delete-All', 'ipconfig | Stopped', 'ping Stopped'], 'PowerShell ส่ง Object ผ่าน Pipe ทำให้กรองด้วย Property เช่น $_.Status ได้แม่นยำโดยไม่ต้องตัดข้อความ']
        ]
      },
      s2: {
        title: 'PSRemoting & Export-Csv', enemy: 'Manual-Click Golem', dlg: 'ต้องดึงรายชื่อผู้ใช้ AD 500 คนส่งรายงาน Excel และรีสตาร์ทบริการบน Server 20 เครื่องพร้อมกัน!',
        qs: [
          ['คำสั่งใดใน PowerShell ใช้ส่งออกผลลัพธ์จาก `Get-ADUser -Filter *` เป็นไฟล์ CSV เปิดใน Excel ได้ทันที?', 'เลือก Cmdlet ส่งออกไฟล์', ['Export-Csv -Path C:\\users.csv -NoTypeInformation -Encoding UTF8', 'Print-Excel C:\\users.csv', 'Format-C users.csv', 'Ping-Csv users.csv'], 'Export-Csv เป็นคำสั่งคู่ใจ SysAdmin สำหรับสร้างรายงานและทำ Bulk Import-Csv กลับเข้า AD'],
          ['ฟีเจอร์ **PowerShell Remoting (WinRM)** ใช้พอร์ตมาตรฐานหมายเลขใดในการสั่งงานข้ามเครื่อง Server?', 'เลือกพอร์ตมาตรฐาน WinRM', ['5985 (HTTP) และ 5986 (HTTPS)', '21 และ 23', '80 และ 110', '3306 และ 5432'], 'WinRM + Invoke-Command ช่วยให้รันสคริปต์บน Windows Server หลายสิบเครื่องพร้อมกันในบรรทัดเดียว']
        ]
      },
      boss: {
        enemy: 'SCRIPT-EXECUTION PHANTOM', dlg: 'Execution Policy บล็อกสคริปต์กู้ระบบ! จงเข้าใจ PowerShell Security & Automation ให้ครบ!',
        qs: [
          ['คำสั่งใดใช้ตรวจสอบหรือปรับนโยบายการอนุญาตรันไฟล์สคริปต์ `.ps1` (เช่น `RemoteSigned`)?', 'เลือก Cmdlet ที่ถูกต้อง', ['Get-ExecutionPolicy และ Set-ExecutionPolicy RemoteSigned', 'chmod +x script.ps1', 'ufw allow ps1', 'ipconfig /ps1'], 'RemoteSigned อนุญาตให้รันสคริปต์ที่เขียนเองในเครื่อง แต่สคริปต์ที่โหลดจากเน็ตต้องมีลายเซ็นดิจิทัล'],
          ['หากต้องการทดสอบคำสั่งลบหรือแก้ไข (เช่น `Remove-ADUser`) โดยยังไม่ให้ลบจริงเพื่อตรวจดูก่อน ควรเติมพารามิเตอร์ใดท้ายคำสั่ง?', 'เลือกพารามิเตอร์ป้องกันความผิดพลาด', ['-WhatIf', '-DestroyNow', '-ForceDelete', '-SkipCheck'], '-WhatIf จะจำลองและพิมพ์บอกว่าจะเกิดอะไรขึ้นโดยไม่แก้ไขข้อมูลจริง ช่วยชีวิตแอดมินมานับครั้งไม่ถ้วน!'],
          ['คำสั่งใดใช้ดูคู่มือวิธีใช้และตัวอย่างของ Cmdlet เช่น `Get-Process` ใน PowerShell?', 'เลือกคำสั่งขอความช่วยเหลือ', ['Get-Help Get-Process -Examples', 'Google-It Get-Process', 'Delete-Help Get-Process', 'Ping-Help'], 'Get-Help พร้อม -Examples แสดงตัวอย่างการใช้งานจริงของทุก Cmdlet ได้ทันทีแม้ไม่มีอินเทอร์เน็ต']
        ]
      }
    },
    {
      num: 28, roCode: 'win_wsus28', roName: 'Al De Baran Patch Citadel', name: 'WSUS & Enterprise Patching',
      subtitle: 'Patch Management, WSUS Approval Rings, Test Group, Rollback และ Zero-Day Patch', color: '#38bdf8', icon: '🩹', tag: 'WSUS', cat: 'security',
      s1: {
        title: 'บริหารแพตช์ด้วย WSUS', enemy: 'Unpatched-CVE Imp', dlg: 'เครื่องลูกข่าย 300 เครื่องกำลังโหลด Windows Update จากเน็ตพร้อมกันจนเน็ตทั้งวิทยาลัยล่ม! ใช้ WSUS แก้ด่วน!',
        qs: [
          ['ประโยชน์หลักของ **WSUS (Windows Server Update Services)** ในองค์กรขนาดกลาง-ใหญ่คือข้อใด?', 'เลือกคำตอบที่ถูกต้อง', ['ดาวน์โหลดแพตช์จาก Microsoft มาเก็บไว้ที่ Server กลางครั้งเดียว ควบคุมการอนุมัติ และประหยัดแบนด์วิดท์เน็ต', 'ปิด Windows Update ถาวรทุกเครื่อง', 'แจกเกมให้พนักงาน', 'แทนที่ Firewall หลัก'], 'WSUS ช่วยประหยัดเน็ตมหาศาลและให้แอดมินทดสอบแพตช์ก่อนปล่อยจริงลงเครื่องสำคัญ'],
          ['แนวปฏิบัติ **Patch Deployment Rings** ที่ปลอดภัยที่สุดก่อนปล่อยแพตช์ลงเครื่อง Production ทั้งหมดคืออะไร?', 'เลือกขั้นตอนที่ถูกต้อง', ['ทดสอบในกลุ่ม Pilot/Test Group ก่อน → ตรวจสอบว่าไม่พัง → จึงอนุมัติลงกลุ่ม Production', 'ปล่อยลงทุกเครื่องพร้อมกันทันทีในเวลาทำงาน', 'ไม่แพตช์เลยตลอด 5 ปี', 'ปิด Backup ก่อนแพตช์'], 'การแบ่ง Ring (Test → Pilot → Production) ช่วยกันไม่ให้แพตช์ที่มีบั๊กทำระบบองค์กรล่มพร้อมกันทั้งหมด']
        ]
      },
      s2: {
        title: 'Patch Tuesday & Emergency Rollback', enemy: 'BlueScreen-KB Drone', dlg: 'แพตช์ตัวใหม่ทำให้แอปบัญชีเปิดไม่ได้! ต้องสั่ง Decline บน WSUS และ Uninstall แพตช์ออก!',
        qs: [
          ['ช่วงเวลาปกติที่ Microsoft ปล่อยอัปเดตความปลอดภัยประจำเดือน (Patch Tuesday) คือวันใด?', 'เลือกวันมาตรฐาน', ['วันอังคารที่สองของทุกเดือน', 'ทุกวันอาทิตย์ตี 5', 'วันที่ 31 ธันวาคมปีละครั้ง', 'ไม่มีกำหนดแน่นอน'], 'แอดมินทั่วโลกจะวางแผน Maintenance Window หลัง Patch Tuesday เพื่อตรวจสอบและทดสอบแพตช์'],
          ['หากแพตช์ Windows ทำให้ระบบมีปัญหาและต้องถอนออกอย่างเร่งด่วน คำสั่งใดใช้ถอนการติดตั้ง Update หมายเลข KB?', 'เลือกคำสั่งที่ถูกต้อง', ['wusa /uninstall /kb:XXXXXXX', 'format C:', 'ipconfig /uninstall', 'gpupdate /delete'], 'wusa (Windows Update Standalone Installer) หรือคำสั่ง DISM ใช้ถอนแพตช์ที่มีปัญหาได้']
        ]
      },
      boss: {
        enemy: 'ZERO-DAY PATCH TITAN', dlg: 'ช่องโหว่ระดับ Critical (CVSS 9.8) ถูกประกาศ! จงวางแผน Patch & Maintenance ให้สมบูรณ์!',
        qs: [
          ['ก่อนเริ่มแพตช์เครื่อง Production Server ในช่วง Maintenance Window แอดมินต้องทำสิ่งใดเป็นอันดับแรก?', 'เลือกมาตรการป้องกันที่สำคัญที่สุด', ['สำรองข้อมูล (Backup) และ/หรือสร้าง VM Snapshot พร้อมแผน Rollback', 'ปิดระบบมอนิเตอร์ทั้งหมด', 'แจ้งผู้ใช้หลังจากระบบดับไปแล้ว', 'ลบ Log เก่าทิ้ง'], 'ห้ามแพตช์เครื่องสำคัญโดยไม่มี Backup หรือแผนย้อนกลับเด็ดขาด!'],
          ['ทำไมไม่ควรปล่อยให้ Server สำคัญรีบูตเองอัตโนมัติกลางวันแสก ๆ หลังโหลดแพตช์?', 'เลือกเหตุผลที่ถูกต้อง', ['จะทำให้บริการหยุดชะงัก (Unplanned Downtime) กระทบผู้ใช้ ควรตั้ง Active Hours และนัด Maintenance Window', 'เพราะตอนกลางวันไฟไม่พอ', 'เพราะแพตช์ทำงานได้เฉพาะกลางคืน', 'เพราะรีบูตแล้วข้อมูลหายหมด'], 'ควบคุมเวลารีบูตผ่าน GPO / WSUS ช่วยให้ธุรกิจดำเนินต่อได้ไม่สะดุด'],
          ['ในรายงาน WSUS หากพบเครื่องจำนวนมากสถานะ `Not Reported` มาเกิน 30 วัน แอดมินควรตรวจสอบอะไร?', 'เลือกจุดตรวจสอบที่ถูกต้อง', ['ตรวจว่าเครื่องยังออนไลน์อยู่ไหม, บริการ Windows Update (wuauserv) ทำงานอยู่ และ GPO ชี้มาที่ WSUS URL ถูกต้อง', 'ซื้อจอภาพใหม่', 'เปลี่ยนเมาส์ทุกเครื่อง', 'ลบ Active Directory'], 'เครื่องที่ไม่รายงานตัวอาจตกหล่นแพตช์ความปลอดภัย กลายเป็นจุดอ่อนให้แฮกเกอร์เจาะได้']
        ]
      }
    },
    {
      num: 29, roCode: 'win_pki29', roName: 'Lighthalzen PKI Vault', name: 'PKI, SSL/TLS & Certificate Vault',
      subtitle: 'AD CS, Root CA, CSR, Asymmetric Encryption, TLS 1.3 และ CRL/OCSP', color: '#8b5cf6', icon: '🔏', tag: 'PKI', cat: 'security',
      s1: {
        title: 'โครงสร้าง PKI & ใบรับรองดิจิทัล', enemy: 'SelfSigned-Warn Imp', dlg: 'ระบบ Intranet ภายในขึ้นเตือนสีแดง "Certificate Not Trusted"! มาสร้าง Enterprise CA (AD CS) กัน!',
        qs: [
          ['ในระบบ PKI (Public Key Infrastructure) หน่วยงานที่ทำหน้าที่ออกและลงนามรับรองความน่าเชื่อถือให้ใบรับรองดิจิทัลเรียกว่าอะไร?', 'เลือกชื่อองค์ประกอบ', ['CA (Certificate Authority)', 'DHCP Relay', 'RAID Controller', 'Print Server'], 'เมื่อเครื่องลูกข่ายเชื่อถือ Root CA ขององค์กร ทุกใบรับรองที่ออกโดย CA นั้นจะขึ้นแม่กุญแจสีเขียวปลอดภัยทันที'],
          ['เมื่อต้องการขอใบรับรอง SSL/TLS สำหรับเว็บเซิร์ฟเวอร์ ไฟล์คำขอที่มี Public Key และข้อมูลโดเมนที่ส่งให้ CA เรียกว่าอะไร?', 'เลือกชื่อย่อที่ถูกต้อง', ['CSR (Certificate Signing Request)', 'MBR', 'CSV', 'ISO'], 'Server จะสร้าง Private Key เก็บไว้เองแล้วส่งเฉพาะ CSR ให้ CA ลงนามกลับมาเป็นไฟล์ Certificate']
        ]
      },
      s2: {
        title: 'TLS 1.3 & การเพิกถอนใบรับรอง', enemy: 'Revoked-Cert Specter', dlg: 'Private Key ของเว็บเซิร์ฟเวอร์รั่วไหล! ต้องเพิกถอนใบรับรองเดิมทันทีด้วย CRL/OCSP!',
        qs: [
          ['หาก Private Key ของใบรับรอง SSL รั่วไหล แอดมินต้องทำอย่างไรเพื่อไม่ให้แฮกเกอร์นำไปปลอมเว็บได้?', 'เลือกขั้นตอนที่ถูกต้อง', ['สั่ง Revoke ใบรับรองเดิมที่ CA (ประกาศลง CRL/OCSP) แล้วสร้าง Key คู่ใหม่ขอใบรับรองใหม่ทันที', 'เปลี่ยนชื่อเว็บไซต์ใหม่', 'ปล่อยไว้จนหมดอายุปีหน้า', 'ลบเบราว์เซอร์ของทุกคน'], 'CRL (Certificate Revocation List) และ OCSP แจ้งเบราว์เซอร์ว่าใบรับรองนั้นถูกยกเลิกแล้ว ห้ามเชื่อถือ'],
          ['เหตุใดองค์กรจึงควรปิด **TLS 1.0 / 1.1** และเปิดใช้ **TLS 1.2 / TLS 1.3** เท่านั้น?', 'เลือกเหตุผลที่ถูกต้อง', ['TLS 1.0/1.1 มีช่องโหว่การเข้ารหัสที่ถูกเจาะได้แล้ว ส่วน TLS 1.3 ปลอดภัยสูงและทำ Handshake เร็วกว่า', 'TLS 1.3 ไม่ต้องใช้ใบรับรอง', 'TLS 1.0 ใช้กับพอร์ต 443 ไม่ได้', 'TLS 1.3 ใช้เฉพาะอีเมล'], 'TLS 1.3 ตัดอัลกอริทึมเก่าที่อ่อนแอทิ้งทั้งหมดและลดเวลาเชื่อมต่อเหลือเพียง 1-RTT']
        ]
      },
      boss: {
        enemy: 'MITM-FORGER OVERLORD', dlg: 'จอมปลอมใบรับรองกำลังทำ Man-in-the-Middle! พิสูจน์ความเชี่ยวชาญ PKI & TLS โค่นมัน!',
        qs: [
          ['ในการออกแบบ PKI ระดับองค์กร เหตุใดจึงนิยมแยก **Offline Root CA** ออกจาก **Online Issuing (Subordinate) CA**?', 'เลือกเหตุผลด้านความปลอดภัยสูงสุด', ['เก็บ Root CA ปิดเครื่องไว้แบบ Offline เพื่อไม่ให้แฮกเกอร์ขโมย Root Key ไปปลอมใบรับรองทั้งองค์กรได้', 'เพราะ Root CA กินไฟเยอะ', 'เพราะ Windows ไม่ให้เปิดพร้อมกัน', 'เพื่อประหยัดสายแลน'], 'หาก Issuing CA ถูกเจาะ ยังสามารถใช้ Offline Root CA เพิกถอนแล้วออก Issuing CA ตัวใหม่ได้'],
          ['การเข้ารหัสแบบ **Asymmetric (Public/Private Key)** กับ **Symmetric (AES)** ทำงานร่วมกันอย่างไรใน HTTPS/TLS?', 'เลือกการทำงานที่ถูกต้อง', ['ใช้ Asymmetric ยืนยันตัวตนและแลกเปลี่ยน Session Key ตอน Handshake แล้วใช้ Symmetric (AES) เข้ารหัสข้อมูลจริงเพราะเร็วกว่ามาก', 'ใช้ Asymmetric เข้ารหัสทุกไบต์ตลอดการเชื่อมต่อ', 'ไม่ใช้การเข้ารหัสเลย', 'ใช้เฉพาะรหัสผ่าน 4 หลัก'], 'การผสาน Hybrid Encryption ทำให้ HTTPS ทั้งปลอดภัยจากการดักฟังและมีความเร็วสูง'],
          ['ฟีเจอร์ `Certificate Auto-Enrollment` ผ่าน GPO บน Active Directory มีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['แจกจ่ายและต่ออายุใบรับรองดิจิทัลให้เครื่องคอมพิวเตอร์และผู้ใช้ในโดเมนอัตโนมัติ ลดปัญหาใบรับรองหมดอายุ', 'ลบใบรับรองทุกวัน', 'เปลี่ยนรหัสผ่าน Wi-Fi', 'ปิดการใช้งาน HTTPS'], 'Auto-Enrollment ช่วยให้ระบบ Wi-Fi 802.1X, VPN และ Intranet ใช้งานใบรับรองได้อย่างไม่สะดุด']
        ]
      }
    }
  ];

  /* Attach Part 1 to temporary namespace for Part 2 to finalize */
  window.__EXPANSION_BUILD_ZONE = buildZone;
  window.__EXPANSION_PART1 = EXPANSION_DEFS_PART1;
})();

(() => {
  /* ==================== EXPANSION ZONES 30–50 ==================== */
  const EXPANSION_DEFS_PART2 = [
    {
      num: 30, roCode: 'win_krb30', roName: 'Glast Kerberos Sanctuary', name: 'Kerberos, NTLM & Enterprise SSO',
      subtitle: 'KDC, TGT Tickets, Time Sync, NTLM vs Kerberos, Pass-the-Hash และ SAML/OIDC SSO', color: '#3b82f6', icon: '👑', tag: 'KRB5', cat: 'security',
      s1: {
        title: 'ตั๋ว Kerberos & การเทียบเวลา', enemy: 'Clock-Skew Phantom', dlg: 'ผู้ใช้ทั้งแผนกล็อกอินเข้า Active Directory ไม่ได้เพราะนาฬิกา Server เพี้ยนไป 10 นาที!',
        qs: [
          ['ในระบบยืนยันตัวตน **Kerberos** ของ Active Directory หากนาฬิกาของเครื่องลูกข่ายกับ Domain Controller ต่างกันเกินกี่นาทีจะล็อกอินไม่ผ่าน?', 'เลือกค่ามาตรฐาน Kerberos Time Skew', ['5 นาที (เพื่อป้องกัน Replay Attack จึงต้องตั้ง NTP ให้ตรงกันเสมอ)', '5 ชั่วโมง', '5 วัน', 'เวลาไม่เกี่ยวข้องกับ Kerberos'], 'การตั้ง NTP (Port 123) ซิงค์เวลาให้ตรงกันทั่วทั้งโดเมนเป็นกฎเหล็กของ Active Directory'],
          ['ตั๋วใบแรกที่ KDC (Key Distribution Center) ออกให้ผู้ใช้หลังยืนยันตัวตนสำเร็จ เพื่อนำไปขอเข้าใช้บริการอื่นโดยไม่ต้องกรอกรหัสผ่านซ้ำเรียกว่าอะไร?', 'เลือกชื่อย่อของตั๋ว Kerberos', ['TGT (Ticket Granting Ticket)', 'DNS', 'MBR', 'CSV'], 'TGT ทำให้เกิด Single Sign-On (SSO) ภายในโดเมน Windows โดยไม่ต้องส่งรหัสผ่านจริงวิ่งผ่านเครือข่ายซ้ำ ๆ']
        ]
      },
      s2: {
        title: 'ป้องกัน NTLM & Pass-the-Hash', enemy: 'Golden-Ticket Mimic', dlg: 'ตรวจพบแฮกเกอร์พยายามใช้ Pass-the-Hash และ Golden Ticket ในโดเมน! เร่งป้องกันทันที!',
        qs: [
          ['เหตุใดองค์กรจึงควรจำกัดหรือปิดโปรโตคอล **NTLMv1** และใช้ **Kerberos** แทนเสมอ?', 'เลือกเหตุผลด้านความปลอดภัย', ['NTLM อ่อนแอต่อการโจมตี Relay และ Pass-the-Hash และไม่มี Mutual Authentication เหมือน Kerberos', 'NTLM ใช้งานไม่ได้กับ Windows', 'Kerberos ไม่ต้องใช้รหัสผ่าน', 'NTLM ใช้พอร์ต 80'], 'Kerberos ตรวจสอบตัวตนทั้ง 2 ฝั่ง (Client ↔ Server) และใช้ตั๋วเข้ารหัสที่ปลอดภัยกว่า NTLM มาก'],
          ['มาตรฐาน **SAML 2.0** และ **OpenID Connect (OIDC)** นิยมใช้สำหรับงานใดในองค์กรสมัยใหม่?', 'เลือกการใช้งานหลัก', ['ทำ Single Sign-On (SSO) เชื่อมต่อบัญชีองค์กรเข้ากับเว็บแอปและ Cloud SaaS (เช่น Microsoft 365, Google Workspace)', 'บีบอัดไฟล์สำรอง', 'แบ่งพาร์ติชันฮาร์ดดิสก์', 'แจก IP Address'], 'SSO + MFA ช่วยให้พนักงานล็อกอินปลอดภัยทุกแอปด้วยบัญชีเดียว และฝ่ายไอทีปิดสิทธิ์ได้ทันทีที่จุดเดียว']
        ]
      },
      boss: {
        enemy: 'KING OF WINSERVER', dlg: 'ราชาแห่งอาณาจักร Windows Server ทดสอบความเข้าใจ Enterprise Identity & Kerberos ระดับสูงสุด!',
        qs: [
          ['บัญชีพิเศษ `krbtgt` ใน Active Directory มีความสำคัญอย่างไร และต้องจัดการอย่างไรหากสงสัยว่าโดนโจมตี Golden Ticket?', 'เลือกคำตอบที่ถูกต้อง', ['เป็นบัญชีที่ใช้เข้ารหัสตั๋ว TGT ทั้งโดเมน — หากโดนแฮกต้องรีเซ็ตรหัสผ่าน krbtgt 2 ครั้ง (ห่างกันอย่างน้อย 10 ชม.)', 'เป็นบัญชี Guest ลบทิ้งได้ทันที', 'เป็นบัญชีพรินเตอร์', 'ไม่สำคัญอะไรเลย'], 'การรีเซ็ต krbtgt สองครั้งทำให้ตั๋ว Golden Ticket ที่แฮกเกอร์ปลอมไว้ใช้งานไม่ได้ทันที'],
          ['หลักการ **Tiered Administration Model** ในการดูแล Active Directory แนะนำข้อใด?', 'เลือกแนวปฏิบัติที่ดีที่สุด', ['ห้ามใช้บัญชี Domain Admin ล็อกอินเครื่อง Workstation ทั่วไป เพื่อกันขโมย Credential จากเครื่องลูกข่าย', 'ให้พนักงานทุกคนเป็น Domain Admin', 'ใช้รหัสผ่าน Domain Admin เหมือนกันทุกเว็บ', 'ปิด Windows Defender บน Domain Controller'], 'การแยกบัญชี Admin ออกจากบัญชีใช้งานทั่วไปช่วยป้องกัน Lateral Movement ได้อย่างมีประสิทธิภาพ'],
          ['ฟีเจอร์ **MFA (Multi-Factor Authentication)** ช่วยป้องกันการถูกยึดบัญชีได้อย่างไร?', 'เลือกคำตอบที่ถูกต้อง', ['ต้องยืนยันตัวตนอย่างน้อย 2 ปัจจัย (เช่น รหัสผ่าน + แอป Authenticator/FIDO2 Key) แม้รหัสผ่านหลุดแฮกเกอร์ก็ยังเข้าไม่ได้', 'ทำให้ไม่ต้องตั้งรหัสผ่าน', 'เพิ่มความเร็วอินเทอร์เน็ต', 'ลบไฟล์ไวรัสอัตโนมัติ'], 'Microsoft ระบุว่า MFA เพียงอย่างเดียวช่วยป้องกันการโจมตีบัญชีได้มากกว่า 99%']
        ]
      }
    },
    {
      num: 31, roCode: 'net_vl31', roName: 'Izlude VLAN Archipelago', name: 'VLAN, Trunking & STP Archipelago',
      subtitle: '802.1Q VLAN Tagging, Access vs Trunk Port, Inter-VLAN Routing และ Spanning Tree (STP)', color: '#06b6d4', icon: '🏝️', tag: 'VLAN', cat: 'network',
      s1: {
        title: 'แยกวง VLAN & 802.1Q Trunk', enemy: 'Broadcast-Storm Slime', dlg: 'เครือข่ายห้องแล็บ 500 เครื่องช้ามากเพราะ Broadcast ท่วมทั้งตึก! มาแบ่ง VLAN แยกแผนกกัน!',
        qs: [
          ['ประโยชน์หลักของการแบ่ง **VLAN (Virtual LAN)** บน Managed Switch คืออะไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['แบ่ง Broadcast Domain แยกวงเครือข่ายแต่ละแผนก/เซิร์ฟเวอร์ เพิ่มความปลอดภัยและลดทราฟฟิกขยะโดยไม่ต้องซื้อ Switch แยก', 'เพิ่มความยาวสายแลนเป็น 1 กิโลเมตร', 'เปลี่ยนสายทองแดงเป็นไฟเบอร์', 'ทำให้ไม่ต้องใช้ Router'], 'การแยก VLAN Server, VLAN Staff, VLAN Guest ช่วยจำกัด Broadcast และกั้นไม่ให้แขกเข้าถึงเซิร์ฟเวอร์ภายใน'],
          ['พอร์ตเชื่อมระหว่าง Switch กับ Switch ที่ต้องส่งข้อมูลของหลาย VLAN วิ่งผ่านสายเส้นเดียวกันพร้อมติดแท็ก **IEEE 802.1Q** เรียกว่าพอร์ตอะไร?', 'เลือกชนิดของพอร์ต Switch', ['Trunk Port (ส่วนพอร์ตต่อเครื่อง PC/Server ทั่วไปคือ Access Port)', 'Console Port', 'USB Port', 'Loopback Port'], 'Access Port อยู่ใน VLAN เดียว ส่วน Trunk Port ติดแท็ก 802.1Q เพื่อพาหลาย VLAN ข้ามระหว่าง Switch หรือไป Router']
        ]
      },
      s2: {
        title: 'Inter-VLAN Routing & STP', enemy: 'Switching-Loop Hydra', dlg: 'มีคนเผลอเสียบสายแลนวนลูประหว่าง Switch 2 ตัวจนไฟ Switch กะพริบรัวทั้งตู้! โชคดีมี STP!',
        qs: [
          ['โปรโตคอล **STP / RSTP (Spanning Tree Protocol)** บน Switch มีหน้าที่ป้องกันหายนะเครือข่ายใด?', 'เลือกปัญหาที่ STP ป้องกัน', ['Layer 2 Switching Loop และ Broadcast Storm เมื่อมีการต่อสายสำรองวนลูประหว่าง Switch', 'ไวรัสเรียกค่าไถ่', 'ฮาร์ดดิสก์เสีย', 'รหัสผ่านหมดอายุ'], 'STP จะบล็อกพอร์ตสำรองชั่วคราวไม่ให้เกิดลูป และจะเปิดใช้งานทันทีหากสายหลักขาด'],
          ['หากเครื่องใน VLAN 10 ต้องการติดต่อกับ Server ใน VLAN 20 ต้องอาศัยอุปกรณ์ระดับใดในการส่งต่อ?', 'เลือกอุปกรณ์ที่ทำ Inter-VLAN Routing', ['Layer 3 Switch (SVI) หรือ Router (Router-on-a-Stick)', 'สายแลนไขว้ธรรมดา', 'Hub 8 พอร์ต', 'UPS สำรองไฟ'], 'คนละ VLAN คือคนละ Subnet จึงต้องผ่านอุปกรณ์ Layer 3 (Routing) เสมอเพื่อข้ามวงและกรองด้วย ACL/Firewall']
        ]
      },
      boss: {
        enemy: 'BROADCAST-STORM LEVIATHAN', dlg: 'พายุแพ็กเก็ต Layer 2 ถล่มหมู่เกาะ VLAN! จงจัดการ Trunk และ Security ให้เรียบร้อย!',
        qs: [
          ['เหตุใดจึงไม่ควรปล่อยให้ Management Interface ของ Switch/Server อยู่ใน **VLAN 1 (Default VLAN)**?', 'เลือกเหตุผลด้านความปลอดภัย', ['VLAN 1 เป็นค่าเริ่มต้นที่ทุกพอร์ตเชื่อมต่อกัน เสี่ยงต่อ VLAN Hopping และผู้ไม่หวังดีเข้าถึงหน้าจัดการ Switch ได้ง่าย', 'VLAN 1 ส่งข้อมูลได้ช้ากว่า 10 เท่า', 'Switch ห้ามใช้ VLAN 1 เด็ดขาด', 'VLAN 1 ไม่มี MAC Address'], 'แนวปฏิบัติที่ดีคือแยก Management VLAN โดยเฉพาะ (เช่น VLAN 99) และปิดพอร์ตที่ไม่ได้ใช้งาน'],
          ['ฟีเจอร์ **Link Aggregation (LACP / 802.3ad)** บน Server และ Switch มีประโยชน์อย่างไร?', 'เลือกประโยชน์ของ LACP', ['รวมสายแลนหลายเส้น (เช่น 2×1Gbps) เป็นท่อเดียว เพิ่มแบนด์วิดท์และสำรองกันหากสายเส้นหนึ่งขาด', 'ลบ VLAN ทั้งหมด', 'ลดความเร็วเหลือ 10 Mbps', 'เปลี่ยน IP อัตโนมัติ'], 'Server มักทำ NIC Teaming / Bonding แบบ LACP เพื่อให้ทั้งเร็วขึ้นและไม่หลุดเมื่อสายแลนหรือพอร์ตเสีย'],
          ['ในตาราง MAC Address Table ของ Switch อุปกรณ์ใช้ข้อมูลใดในการตัดสินใจว่าจะส่ง Frame ออกพอร์ตไหน?', 'เลือกข้อมูลระดับ Layer 2', ['Destination MAC Address', 'ชื่อไฟล์เอกสาร', 'รหัสผ่านผู้ใช้', 'URL เว็บไซต์'], 'Switch ทำงานระดับ Layer 2 เรียนรู้ Source MAC และส่ง Frame ไปยังพอร์ตของ Destination MAC']
        ]
      }
    },
    {
      num: 32, roCode: 'net_bgp32', roName: 'Morroc Routing Crossroads', name: 'Routing, NAT & BGP Crossroads',
      subtitle: 'Static vs Dynamic Routing, OSPF, BGP Internet Backbone, NAT/PAT และ Traceroute', color: '#0ea5e9', icon: '🧭', tag: 'BGP', cat: 'network',
      s1: {
        title: 'เส้นทาง Routing & NAT/PAT', enemy: 'Blackhole-Route Imp', dlg: 'เครื่อง Server Ping ออกอินเทอร์เน็ตไม่ได้เพราะลืมตั้ง Default Gateway! มาแก้ Routing Table กัน!',
        qs: [
          ['เส้นทาง `0.0.0.0/0` ใน Routing Table ของ Server หรือ Router มีความหมายว่าอย่างไร?', 'เลือกความหมายที่ถูกต้อง', ['Default Route (Default Gateway) — ส่งแพ็กเก็ตที่ไม่ตรงกับวงภายในทั้งหมดออกทางเส้นทางนี้', 'บล็อกอินเทอร์เน็ตทั้งหมด', 'ที่อยู่ Loopback ของเครื่องเอง', 'พอร์ตของ DNS'], 'หากไม่มี Default Route เครื่องจะคุยได้เฉพาะใน Subnet เดียวกันแต่ติดต่อข้ามเครือข่ายหรือออกเน็ตไม่ได้'],
          ['เทคโนโลยี **PAT (Port Address Translation / NAT Overload)** ช่วยให้อุปกรณ์ในโรงเรียน 500 เครื่องใช้ Public IP เดียวออกเน็ตได้อย่างไร?', 'เลือกการทำงานของ PAT', ['แปลง Private IP หลายเครื่องให้ออกผ่าน Public IP เดียวโดยแยกแยะแต่ละการเชื่อมต่อด้วยหมายเลข Source Port ที่ต่างกัน', 'แจก Public IP จริงให้ครบ 500 เครื่อง', 'ปิดการใช้งาน TCP', 'เก็บหน้าเว็บไว้ใน Router'], 'PAT ช่วยประหยัด IPv4 สาธารณะและซ่อนโครงสร้าง Private IP ภายในองค์กร']
        ]
      },
      s2: {
        title: 'OSPF ภายใน vs BGP ระดับโลก', enemy: 'BGP-Hijack Wraith', dlg: 'ศูนย์ข้อมูลเชื่อมต่อ ISP 2 ค่ายพร้อมกัน! มาแยกแยะ OSPF กับ BGP ให้ชัดเจน!',
        qs: [
          ['โปรโตคอล Routing ใดที่เป็นแกนหลักของอินเทอร์เน็ตโลก ใช้แลกเปลี่ยนเส้นทางระหว่างระบบอิสระ (Autonomous Systems / ISP)?', 'เลือกโปรโตคอลระดับอินเทอร์เน็ต', ['BGP (Border Gateway Protocol)', 'ARP', 'DHCP', 'SMTP'], 'BGP (EGP) เชื่อมโยง ISP และ Data Center ทั่วโลก ส่วน OSPF เป็น IGP ที่นิยมใช้หาเส้นทางเร็วที่สุดภายในองค์กร'],
          ['คำสั่งใดบน Linux (`traceroute`) หรือ Windows (`tracert`) ใช้ตรวจสอบเส้นทาง Router ทุกจุดที่แพ็กเก็ตวิ่งผ่านไปยังปลายทาง?', 'เลือกประโยชน์ของ Traceroute', ['ระบุได้ว่าแพ็กเก็ตไปติดขัดหรือขาดการเชื่อมต่อที่ Router จุด (Hop) ใดระหว่างทาง', 'เพิ่มความเร็วเน็ต 5 เท่า', 'เปลี่ยนรหัสผ่าน Router', 'สร้างพาร์ติชันใหม่'], 'Traceroute อาศัยค่า TTL (Time To Live) ที่เพิ่มขึ้นทีละ 1 เพื่อเปิดเผยทุก Hop จนถึงปลายทาง']
        ]
      },
      boss: {
        enemy: 'ASYMMETRIC-ROUTE TITAN', dlg: 'ตารางเส้นทางทั้งทวีปสับสน! จงปรับ Routing, Metric และ Port Forwarding ให้แม่นยำ!',
        qs: [
          ['หาก Router มีเส้นทางไปยังปลายทางเดียวกัน 2 เส้นทางคือ `/24` และ `/26` Router จะเลือกส่งแพ็กเก็ตไปทางใด?', 'เลือกกฎทองของ IP Routing', ['Longest Prefix Match — เลือกเส้นทางที่เจาะจงที่สุดคือ /26 ก่อนเสมอ', 'เลือกแบบสุ่ม', 'เลือก /24 เพราะเลขน้อยกว่า', 'ทิ้งแพ็กเก็ตไม่ส่งเลย'], 'Longest Prefix Match เป็นกฎพื้นฐานที่สุดที่ Router ทุกตัวทั่วโลกใช้ตัดสินใจ'],
          ['ในงาน Server หากต้องการให้ผู้ใช้ภายนอกเข้าเว็บเซิร์ฟเวอร์ภายใน (`192.168.10.10:443`) ผ่าน Public IP ของ Firewall ต้องตั้งค่าใด?', 'เลือกเทคนิค NAT ที่ถูกต้อง', ['DNAT / Port Forwarding (แปลงปลายทาง PublicIP:443 → 192.168.10.10:443)', 'DHCP Exclusion', 'ARP Poisoning', 'Disable Routing'], 'DNAT (Destination NAT) เปิดช่องทางเฉพาะพอร์ตที่อนุญาตให้เข้าถึง Server ในโซน DMZ ได้อย่างปลอดภัย'],
          ['คำสั่งใดบน Linux ใช้ดูตาราง Routing ปัจจุบันของเครื่อง Server?', 'เลือกคำสั่งมาตรฐานสมัยใหม่', ['ip route (หรือ ip r)', 'df -route', 'chmod route', 'tar -r'], 'ip route แสดงเส้นทางทุกวงและ Default Gateway (default via ...) ได้ชัดเจน']
        ]
      }
    },
    {
      num: 33, roCode: 'net_v633', roName: 'Juno IPv6 Frontier', name: 'IPv6 & Next-Gen Networking',
      subtitle: '128-bit Address, การย่อรูป ::, Link-Local (fe80::), SLAAC และ Dual-Stack', color: '#38bdf8', icon: '🚀', tag: 'IPv6', cat: 'network',
      s1: {
        title: 'โครงสร้าง IPv6 128-bit & การย่อรูป', enemy: 'IPv4-Exhaustion Drone', dlg: 'IPv4 สาธารณะทั่วโลกหมดเกลี้ยงแล้ว! ได้เวลาอัปเกรดโครงสร้างพื้นฐานสู่ IPv6 128 บิต!',
        qs: [
          ['หมายเลข **IPv6** มีขนาดกี่บิต และเขียนด้วยเลขฐานใด?', 'เลือกโครงสร้างที่ถูกต้อง', ['128 บิต เขียนด้วยเลขฐานสิบหก (Hexadecimal) 8 กลุ่ม คั่นด้วยเครื่องหมายโคลอน (:)', '32 บิต เลขฐานสิบคั่นด้วยจุด', '64 บิต เลขฐานแปด', '16 บิต ตัวอักษรไทย'], 'IPv6 มีที่อยู่มากถึง 2^128 หมายเลข แก้ปัญหา IPv4 หมดโลกอย่างถาวร'],
          ['ข้อใดคือการย่อรูปที่ถูกต้องของ IPv6 `2001:0db8:0000:0000:0000:0000:0000:0001`?', 'เลือกกฎการย่อ IPv6 ที่ถูกต้อง', ['2001:db8::1 (ตัด 0 นำหน้าแต่ละกลุ่ม และใช้ :: ย่อกลุ่ม 0 ติดกันได้เพียง 1 ครั้งต่อที่อยู่)', '2001:db8::0::1 (ใช้ :: สองครั้ง)', '2001.db8.1', '192.168.0.1'], 'กฎเหล็ก IPv6: ใช้ :: แทนกลุ่ม 0 ติดกันได้สูงสุดเพียงครั้งเดียวต่อ 1 Address เพื่อไม่ให้กำกวม']
        ]
      },
      s2: {
        title: 'Link-Local, Loopback & Dual-Stack', enemy: 'DualStack-Glitch Imp', dlg: 'การ์ดแลน Linux แสดงที่อยู่ `fe80::...` กับ `::1` มันคืออะไรกันแน่?',
        qs: [
          ['ใน IPv6 ที่อยู่ `::1` และช่วง `fe80::/10` หมายถึงอะไรตามลำดับ?', 'เลือกความหมายที่ถูกต้อง', ['::1 = Loopback (เทียบเท่า 127.0.0.1) • fe80::/10 = Link-Local Address (ใช้สื่อสารในลิงก์ LAN เดียวกัน)', 'Public IP ทั้งคู่', 'DNS Server ของ Google', 'Broadcast Address'], 'ทุกการ์ดแลนที่เปิด IPv6 จะสร้าง Link-Local (fe80::) ให้อัตโนมัติ และใน IPv6 ไม่มี Broadcast แล้ว (ใช้ Multicast แทน)'],
          ['กลยุทธ์การเปลี่ยนผ่านที่นิยมใช้มากที่สุดเพื่อให้ Server รองรับทั้งลูกค้า IPv4 และ IPv6 พร้อมกันเรียกว่าอะไร?', 'เลือกเทคนิค Transition', ['Dual-Stack (เปิดใช้งานทั้ง IPv4 และ IPv6 คู่กันบนเครื่องเดียว)', 'IPv4 Format', 'Static ARP', 'RAID 0'], 'Dual-Stack ให้ความเสถียรสูงสุดและไม่กระทบลูกค้าเก่าที่ยังใช้ IPv4']
        ]
      },
      boss: {
        enemy: 'HEX-ADDRESS SERAPH', dlg: 'เทพีแห่งเครือข่าย 128 บิตทดสอบ DNS AAAA และ SLAAC!',
        qs: [
          ['DNS Record ประเภทใดใช้แปลงชื่อโดเมนเป็นหมายเลข **IPv6 Address**?', 'เลือกประเภท Record ที่ถูกต้อง', ['AAAA Record (Quad-A Record)', 'A Record (สำหรับ IPv4 เท่านั้น)', 'MX Record', 'PTR Record'], 'จำง่าย ๆ: IPv4 (32 บิต) = A • IPv6 (128 บิต = 4×32) = AAAA!'],
          ['กลไกใดใน IPv6 ที่ทำให้เครื่องลูกข่ายสร้าง IPv6 ให้ตัวเองได้อัตโนมัติจาก Router Advertisement โดยไม่ต้องพึ่ง DHCP Server?', 'เลือกชื่อกลไก', ['SLAAC (Stateless Address Autoconfiguration)', 'DORA', 'BIOS POST', 'NAT Overload'], 'SLAAC ใช้ ICMPv6 Router Advertisement (RA) ช่วยให้เครื่องใหม่ได้ Prefix และกำหนด IPv6 ได้ทันที'],
          ['ขนาด Subnet มาตรฐานที่แนะนำสำหรับวง LAN ทั่วไปในระบบ IPv6 คือ Prefix ขนาดเท่าใด?', 'เลือก Prefix มาตรฐาน LAN IPv6', ['/64 (64 บิตแรกเป็น Network, 64 บิตหลังเป็น Interface ID)', '/24', '/30', '/8'], 'IPv6 LAN ใช้ /64 เป็นมาตรฐานเพื่อให้ SLAAC ทำงานได้อย่างสมบูรณ์']
        ]
      }
    },
    {
      num: 34, roCode: 'net_vpn34', roName: 'Comodo Zero-Trust Tunnel', name: 'VPN & Zero-Trust Tunnel',
      subtitle: 'WireGuard vs IPsec vs OpenVPN, Site-to-Site VPN, Split Tunneling และ Zero Trust', color: '#14b8a6', icon: '🚇', tag: 'VPN', cat: 'security',
      s1: {
        title: 'อุโมงค์เข้ารหัส WireGuard & IPsec', enemy: 'Packet-Sniffer Spider', dlg: 'ทีมผู้ดูแลระบบต้อง Work From Home และเชื่อมสาขาจันทบุรีกับกรุงเทพฯ อย่างปลอดภัย! สร้าง VPN Tunnel ด่วน!',
        qs: [
          ['ความแตกต่างระหว่าง **Site-to-Site VPN** กับ **Remote Access VPN** คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['Site-to-Site เชื่อมเครือข่าย 2 สำนักงานถาวรผ่าน Gateway • Remote Access ให้พนักงานแต่ละคนต่อจากนอกสถานที่เข้าองค์กร', 'Site-to-Site ใช้ได้เฉพาะมือถือ', 'Remote Access ไม่มีการเข้ารหัส', 'ทั้งคู่เหมือนกันทุกประการ'], 'Site-to-Site นิยมใช้ IPsec/WireGuard ระหว่าง Firewall ส่วน Remote Access ให้แอดมินต่อเข้ามาดูแล Server'],
          ['จุดเด่นของโปรโตคอล **WireGuard** ที่ทำให้ได้รับความนิยมอย่างรวดเร็วบน Linux Server สมัยใหม่คืออะไร?', 'เลือกจุดเด่นของ WireGuard', ['ทำงานใน Linux Kernel โค้ดกระชับ เร็วมาก ใช้การเข้ารหัสสมัยใหม่ และใช้พอร์ต UDP (เช่น 51820)', 'ส่งข้อมูลไม่เข้ารหัส', 'ใช้ได้เฉพาะ Windows 98', 'ต้องใช้สายโทรศัพท์บ้าน'], 'WireGuard มีโค้ดเพียง ~4,000 บรรทัด ตรวจสอบความปลอดภัยง่ายและให้ Throughput สูงกว่า OpenVPN มาก']
        ]
      },
      s2: {
        title: 'Zero Trust Network Architecture', enemy: 'Lateral-Move Phantom', dlg: 'แนวคิด "อยู่ข้างใน LAN แล้วไว้ใจได้หมด" ใช้ไม่ได้อีกต่อไป! ก้าวสู่ Zero Trust!',
        qs: [
          ['หัวใจสำคัญของสถาปัตยกรรม **Zero Trust ("Never Trust, Always Verify")** คือข้อใด?', 'เลือกหลักการที่ถูกต้อง', ['ไม่ไว้ใจผู้ใช้หรืออุปกรณ์ใดโดยอัตโนมัติแม้จะอยู่ใน LAN เดียวกัน ต้องยืนยันตัวตน ตรวจสิทธิ์น้อยที่สุด (Least Privilege) ทุกคำขอ', 'ปิดอินเทอร์เน็ตของทั้งบริษัท', 'ไม่ใช้รหัสผ่านเลย', 'เปิดทุกพอร์ตในวง LAN'], 'Zero Trust ช่วยหยุดไม่ให้แฮกเกอร์ที่เจาะเครื่องลูกข่ายได้ 1 เครื่องลุกลามไปยึด Server ทั้ง Data Center'],
          ['**Full Tunnel VPN** แตกต่างจาก **Split Tunnel VPN** อย่างไร?', 'เลือกความต่างที่ถูกต้อง', ['Full Tunnel ส่งทราฟฟิกทั้งหมด (รวมเน็ตทั่วไป) ผ่าน VPN องค์กร • Split Tunnel ส่งเฉพาะทราฟฟิกไปวงองค์กรผ่าน VPN', 'Split Tunnel ไม่เข้ารหัส', 'Full Tunnel ใช้ได้เฉพาะ Wi-Fi', 'ทั้งคู่เหมือนกัน'], 'Full Tunnel ปลอดภัยและตรวจ Log ได้ครบกว่า ส่วน Split Tunnel ลดภาระแบนด์วิดท์ของ Firewall สำนักงาน']
        ]
      },
      boss: {
        enemy: 'TUNNEL-BREAKER WARDEN', dlg: 'ผู้คุมอุโมงค์เข้ารหัสทดสอบความแข็งแกร่งของ IPsec, Bastion Host และ Zero Trust!',
        qs: [
          ['เครื่อง **Bastion Host (Jump Server)** ในสถาปัตยกรรมเซิร์ฟเวอร์มีหน้าที่ทำอะไร?', 'เลือกหน้าที่ของ Jump Server', ['เป็นจุดผ่านทางเดี่ยวที่เสริมเกราะแข็งแกร่ง (SSH Key + MFA + Log) สำหรับให้แอดมินกระโดดเข้าไปดูแล Server ใน Private Subnet', 'เป็นเครื่องไว้เล่นเกมพักเที่ยง', 'เป็นเครื่องเก็บไฟล์ขยะ', 'ใช้แทน Load Balancer'], 'Bastion Host ทำให้ Server ฐานข้อมูลและแอปภายในไม่ต้องเปิดพอร์ต SSH/RDP สู่ภายนอกเลย'],
          ['ในการเชื่อมต่อ IPsec VPN พอร์ต UDP หมายเลขใดที่ใช้สำหรับ IKE / NAT-Traversal?', 'เลือกคู่พอร์ตมาตรฐาน IPsec', ['UDP 500 และ UDP 4500', 'TCP 80 และ 443', 'TCP 21 และ 23', 'UDP 53 และ 67'], 'หาก Firewall บล็อก UDP 500/4500 อุโมงค์ IPsec VPN จะเจรจา Key (Phase 1/2) ไม่สำเร็จ'],
          ['เหตุใดการทำ **Micro-Segmentation** ใน Data Center จึงช่วยหยุดยั้ง Ransomware ได้ดี?', 'เลือกเหตุผลที่ถูกต้อง', ['กำหนด Firewall กั้นระหว่างแต่ละ Server/โซน (East-West Traffic) แม้เครื่องหนึ่งติดมัลแวร์ก็ลามไปเครื่องอื่นไม่ได้', 'ทำให้ฮาร์ดดิสก์ใหญ่ขึ้น', 'ลบอีเมลขยะ', 'เพิ่มความเร็ว CPU'], 'East-West Firewall ตัดเส้นทาง Lateral Movement ภายในศูนย์ข้อมูลอย่างเด็ดขาด']
        ]
      }
    },
    {
      num: 35, roCode: 'cld_sql35', roName: 'Aldebaran SQL Stronghold', name: 'SQL Database Server Stronghold',
      subtitle: 'MySQL/PostgreSQL, ACID, Indexing, Primary-Replica Replication และ Backup Dump', color: '#f59e0b', icon: '🛢️', tag: 'SQL', cat: 'storage',
      s1: {
        title: 'พอร์ต SQL, ACID & Indexing', enemy: 'Full-Table-Scan Golem', dlg: 'ฐานข้อมูลค้างเพราะคิวรีตาราง 10 ล้านแถวโดยไม่มี Index! มาจูน Database Server กัน!',
        qs: [
          ['พอร์ตมาตรฐานของ **MySQL/MariaDB** และ **PostgreSQL** คือหมายเลขใดตามลำดับ?', 'เลือกคู่พอร์ตฐานข้อมูลยอดนิยม', ['3306 (MySQL/MariaDB) และ 5432 (PostgreSQL)', '80 และ 443', '22 และ 25', '3389 และ 445'], 'และสำหรับ Microsoft SQL Server ใช้พอร์ตมาตรฐาน 1433 (ทั้งหมดนี้ห้ามเปิดออกอินเทอร์เน็ตสาธารณะ!)'],
          ['การสร้าง **Index** บนคอลัมน์ที่ถูกค้นหาบ่อย (`WHERE student_id = ...`) ช่วย Database Server อย่างไร?', 'เลือกผลลัพธ์ที่ถูกต้อง', ['เร่งความเร็วการค้นหา (SELECT) จากการไล่อ่านทั้งตาราง (Full Table Scan) ให้เร็วขึ้นมหาศาลเหมือนสารบัญหนังสือ', 'ลบข้อมูลเก่าทิ้งอัตโนมัติ', 'ไม่ต้องสำรองข้อมูลอีก', 'เปลี่ยน SQL เป็น HTML'], 'Index ช่วยให้ SELECT เร็วขึ้นมาก แต่ไม่ควรสร้างเกินจำเป็นเพราะจะกินพื้นที่ดิสก์และทำให้ INSERT/UPDATE ช้าลงเล็กน้อย']
        ]
      },
      s2: {
        title: 'Database Replication & Backup', enemy: 'Corrupt-Table Worm', dlg: 'เว็บมีคนอ่านข้อมูลพร้อมกัน 10,000 คนจน Database Primary รับไม่ไหว! ตั้ง Read Replica และ Backup ด่วน!',
        qs: [
          ['การทำ **Primary-Replica (Master-Slave) Replication** บนฐานข้อมูลมีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['กระจายงานอ่าน (SELECT) ไปที่ Replica ช่วยลดภาระ Primary และมีสำเนาข้อมูลพร้อมสลับใช้งานหากเครื่องหลักพัง', 'ทำให้ไม่ต้องตั้งรหัสผ่านฐานข้อมูล', 'ลบตารางที่ซ้ำกัน', 'แทนที่ Web Server'], 'Primary รับงานเขียน (INSERT/UPDATE/DELETE) แล้วส่ง Binary Log/WAL ไปซิงค์ที่ Replica ทันที'],
          ['คำสั่งใดใช้สำรองฐานข้อมูล MySQL/MariaDB ชื่อ `college_db` ออกมาเป็นไฟล์ SQL Script?', 'เลือกคำสั่ง Backup ที่ถูกต้อง', ['mysqldump -u root -p college_db > backup.sql', 'ping college_db > backup.sql', 'chmod 777 college_db', 'ip route backup.sql'], 'mysqldump (หรือ pg_dump สำหรับ PostgreSQL) สร้าง Logical Backup ที่นำไป Restore ข้ามเวอร์ชันได้สะดวก']
        ]
      },
      boss: {
        enemy: 'DEADLOCK-ACID BEHEMOTH', dlg: 'Transaction ชนกันจนเกิด Deadlock ทั่วฐานข้อมูล! ปราบมันด้วยหลัก ACID & DB Security!',
        qs: [
          ['คุณสมบัติ **ACID** ของฐานข้อมูลเชิงสัมพันธ์ (RDBMS) ย่อมาจากอะไร?', 'เลือกคำเต็มที่ถูกต้อง', ['Atomicity, Consistency, Isolation, Durability', 'Admin, Cloud, IP, DNS', 'Apache, Cron, IIS, Docker', 'Access, Control, Identity, Domain'], 'ACID รับประกันความถูกต้องของธุรกรรม เช่น โอนเงินต้องตัดบัญชีต้นทางและเข้าปลายทางสำเร็จพร้อมกันหรือยกเลิกทั้งหมด'],
          ['เหตุใดจึงห้ามให้เว็บแอปพลิเคชันเชื่อมต่อฐานข้อมูลด้วยบัญชี `root` ของ MySQL?', 'เลือกเหตุผลด้านความปลอดภัย (Least Privilege)', ['หากเว็บมีช่องโหว่ SQL Injection แฮกเกอร์จะได้สิทธิ์สูงสุดลบทุกฐานข้อมูลและอ่านไฟล์บน Server ได้', 'เพราะบัญชี root เชื่อมผ่านพอร์ต 3306 ไม่ได้', 'เพราะ root ทำงานช้ากว่า', 'เพราะ MySQL ห้ามใช้ root'], 'ควรสร้างบัญชีเฉพาะแอปที่ให้สิทธิ์แค่ฐานข้อมูลของตัวเอง (เช่น SELECT, INSERT, UPDATE, DELETE เท่านั้น)'],
          ['การตั้งค่า `bind-address = 127.0.0.1` ในไฟล์ตั้งค่า MySQL/PostgreSQL มีผลอย่างไร?', 'เลือกผลลัพธ์ที่ถูกต้อง', ['อนุญาตให้เชื่อมต่อฐานข้อมูลได้เฉพาะจากภายในเครื่อง Server ตัวเองเท่านั้น ไม่รับการเชื่อมต่อจากภายนอก', 'เปิดให้ทั้งอินเทอร์เน็ตเชื่อมต่อได้', 'ปิดฐานข้อมูลถาวร', 'เปลี่ยนพอร์ตเป็น 80'], 'จำกัด bind-address + Firewall ช่วยป้องกันการเจาะพอร์ตฐานข้อมูลจากภายนอกได้อย่างดีเยี่ยม']
        ]
      }
    },
    {
      num: 36, roCode: 'cld_nosql36', roName: 'Geffen Redis Cache Spire', name: 'NoSQL & Redis Cache Spire',
      subtitle: 'Redis In-Memory Cache, TTL, Session Store, MongoDB Document และ Cache Invalidation', color: '#ef4444', icon: '⚡', tag: 'REDIS', cat: 'cloud',
      s1: {
        title: 'เร่งความเร็วด้วย Redis In-Memory', enemy: 'Cache-Miss Imp', dlg: 'ฐานข้อมูลหลักรับโหลดไม่ไหวเพราะคนเปิดหน้าแรกซ้ำ ๆ วินาทีละ 5,000 ครั้ง! วาง Redis Cache ดักหน้าไว้เลย!',
        qs: [
          ['เหตุใด **Redis** (พอร์ต 6379) จึงตอบสนองการอ่านข้อมูลได้เร็วระดับต่ำกว่ามิลลิวินาที (Sub-millisecond)?', 'เลือกเหตุผลหลัก', ['เพราะเก็บข้อมูลแบบ Key-Value ไว้ในหน่วยความจำ RAM (In-Memory) แทนการอ่านจากฮาร์ดดิสก์ทุกครั้ง', 'เพราะไม่เก็บข้อมูลจริง', 'เพราะใช้สายแลน 2 เส้น', 'เพราะเขียนด้วย CSS'], 'Redis นิยมใช้ทำ Cache หน้าเว็บ, เก็บ Login Session, Leaderboard เกม และ Rate Limiting'],
          ['การตั้งค่า **TTL (Time To Live)** ให้ Key ใน Redis มีประโยชน์อย่างไร?', 'เลือกประโยชน์ของ TTL', ['กำหนดเวลาหมดอายุให้ข้อมูล Cache ถูกลบอัตโนมัติ เพื่อไม่ให้ RAM เต็มและไม่ค้างข้อมูลเก่าตลอดไป', 'เพิ่มขนาด RAM ฟรี', 'ล็อกรหัสผ่านผู้ใช้', 'เปิดพอร์ต Firewall'], 'TTL ช่วยควบคุมอายุข้อมูล Cache (เช่น เก็บไว้ 60 วินาทีแล้วค่อยดึงสดจาก Database ใหม่)']
        ]
      },
      s2: {
        title: 'MongoDB Document & Cache Strategy', enemy: 'Stale-Data Specter', dlg: 'สินค้าปรับราคาแล้วแต่หน้าเว็บยังโชว์ราคาเก่าจาก Cache! มาเข้าใจ NoSQL และ Cache Invalidation!',
        qs: [
          ['ฐานข้อมูล **NoSQL แบบ Document** (เช่น MongoDB พอร์ต 27017) เก็บข้อมูลในรูปแบบคล้ายสิ่งใด?', 'เลือกรูปแบบการจัดเก็บ', ['เอกสาร JSON / BSON ที่โครงสร้างฟิลด์ยืดหยุ่น (Flexible Schema) ไม่ต้องกำหนดตารางตายตัวเหมือน SQL', 'ไฟล์เสียง MP3', 'ตาราง Excel เท่านั้น', 'ภาพ BMP'], 'NoSQL เหมาะกับข้อมูลโครงสร้างเปลี่ยนบ่อย, Log ขนาดใหญ่, แคตตาล็อกสินค้า และการขยายแบบ Horizontal Scaling'],
          ['ความเสี่ยงร้ายแรงที่สุดหากเปิด **Redis (6379)** ออกอินเทอร์เน็ตโดยไม่ตั้งรหัสผ่าน (`requirepass`) และไม่เปิด Firewall คืออะไร?', 'เลือกความเสี่ยงจริงที่พบบ่อยมาก', ['แฮกเกอร์สามารถเชื่อมต่อเข้ามาขโมยข้อมูล Session, ล้าง Cache หรือยัด SSH Key เพื่อยึดเครื่อง Server ได้ทันที', 'ไม่มีความเสี่ยงเพราะเป็นแค่ Cache', 'Redis จะปิดตัวเอง', 'ทำให้เว็บเร็วขึ้น'], 'Redis ออกแบบให้วิ่งใน Private Network เสมอ ต้องตั้ง requirepass/ACL และบล็อกพอร์ต 6379 จากภายนอก']
        ]
      },
      boss: {
        enemy: 'CACHE-STAMPEDE HYDRA', dlg: 'Cache หมดอายุพร้อมกันจนคำขอหมื่นสายพุ่งถล่ม Database! ควบคุม Redis Persistence & Scaling!',
        qs: [
          ['กลไก **RDB (Snapshot)** และ **AOF (Append-Only File)** ใน Redis มีไว้เพื่ออะไร?', 'เลือกหน้าที่ที่ถูกต้อง', ['บันทึกข้อมูลจาก RAM ลงดิสก์อย่างต่อเนื่อง เพื่อกู้คืนข้อมูลกลับมาได้หากเครื่อง Server ไฟดับหรือรีสตาร์ท', 'บีบอัดรูปภาพในเว็บ', 'สร้างบัญชีผู้ใช้ Linux', 'สแกนพอร์ต TCP'], 'RDB เซฟภาพรวมเป็นระยะ ส่วน AOF บันทึกทุกคำสั่งเขียน ทำให้ Redis เก็บข้อมูลถาวรได้แม้เป็น In-Memory'],
          ['เมื่อไหร่ควรเลือก **SQL (RDBMS)** มากกว่า **NoSQL**?', 'เลือกโจทย์ที่เหมาะกับ SQL ที่สุด', ['ระบบบัญชี การเงิน ธนาคาร หรือลงทะเบียนเรียนที่ต้องการความสัมพันธ์ซับซ้อน (JOIN) และความถูกต้อง ACID 100%', 'เก็บ Cache ชั่วคราว 5 วินาที', 'เก็บไฟล์วิดีโอ 4K', 'ไม่ควรใช้ SQL เลย'], 'สถาปนิกมืออาชีพมักใช้ Polyglot Persistence: SQL เก็บข้อมูลหลักที่แม่นยำ + Redis ทำ Cache ให้เร็วสุดขีด'],
          ['รูปแบบ **Cache-Aside (Lazy Loading)** ทำงานอย่างไรเมื่อแอปต้องการอ่านข้อมูล?', 'เลือกลำดับการทำงานที่ถูกต้อง', ['เช็กใน Redis ก่อน → ถ้าเจอ (Cache Hit) ส่งทันที → ถ้าไม่เจอ (Cache Miss) ไปดึงจาก DB แล้วเก็บลง Redis ไว้รอบหน้า', 'ลบข้อมูลใน DB ทิ้งก่อน', 'ส่งตรงไป DB ตลอดโดยไม่ถาม Redis', 'รีสตาร์ท Redis ทุกครั้ง'], 'Cache-Aside เป็นแพตเทิร์นที่เรียบง่าย ทนทาน (แม้ Redis ล่มแอปยังตกกลับไปอ่าน DB ได้) และนิยมใช้ที่สุด']
        ]
      }
    },
    {
      num: 37, roCode: 'cld_dkr37', roName: 'Alberta Docker Shipyard', name: 'Docker Compose & Image Shipyard',
      subtitle: 'Dockerfile Layers, Multi-Stage Build, Docker Compose, Bridge Network และ Registry', color: '#0284c7', icon: '🐳', tag: 'DOCKER', cat: 'cloud',
      s1: {
        title: 'Dockerfile & Multi-Stage Build', enemy: 'Bloated-Image Whale', dlg: 'Docker Image ของทีม Dev ใหญ่ถึง 1.8 GB จน Deploy ช้ามาก! มาหั่นขนาดลงด้วย Alpine & Multi-Stage Build!',
        qs: [
          ['ไฟล์สูตรที่เขียนคำสั่ง (`FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`) สำหรับสร้าง Docker Image เรียกว่าอะไร?', 'เลือกชื่อไฟล์มาตรฐาน', ['Dockerfile', 'index.html', 'fstab', 'smb.conf'], 'แต่ละบรรทัดใน Dockerfile จะสร้าง Image Layer ที่แคชได้ ทำให้ Build รอบถัดไปเร็วมาก'],
          ['เทคนิค **Multi-Stage Build** และการใช้ Base Image แบบ `alpine` ช่วยอะไรในการทำ Docker Image?', 'เลือกประโยชน์ที่สำคัญที่สุด', ['ลดขนาด Image ลงมหาศาล (จากหลัก GB เหลือหลักสิบ MB) ดึงขึ้น Production เร็ว และลดพื้นที่ผิวช่องโหว่ (Attack Surface)', 'ทำให้ไม่ต้องใช้ RAM', 'ปิดการใช้งานเครือข่าย', 'รัน Windows 95 ใน Container'], 'Multi-Stage Build คอมไพล์โค้ดใน Stage แรกแล้วคัดลอกเฉพาะไฟล์ผลลัพธ์ไปใส่ Stage สุดท้ายที่เบาและปลอดภัย']
        ]
      },
      s2: {
        title: 'เชื่อมหลาย Container ด้วย Docker Compose', enemy: 'Orphan-Container Imp', dlg: 'ระบบเรามีทั้ง Nginx + Node API + MySQL + Redis! สั่งเปิดทั้งหมดพร้อมเครือข่ายด้วยคำสั่งเดียว!',
        qs: [
          ['คำสั่งใดใช้สร้างและรันทุกบริการที่กำหนดไว้ในไฟล์ `docker-compose.yml` ให้อยู่เบื้องหลังพร้อมกัน?', 'เลือกคำสั่งมาตรฐานสมัยใหม่', ['docker compose up -d', 'docker delete all', 'ping compose.yml', 'chmod 777 docker'], 'Docker Compose สร้าง Bridge Network ให้อัตโนมัติ ทำให้ Container เรียกหากันด้วยชื่อ Service (เช่น mysql:3306) ได้เลย'],
          ['เหตุใดใน `docker-compose.yml` แอปจึงเรียกหาฐานข้อมูลด้วยชื่อ `db` แทนการฮาร์ดโค้ด IP เช่น `172.18.0.4`?', 'เลือกเหตุผลที่ถูกต้อง', ['เพราะ IP ภายใน Container เปลี่ยนได้ทุกครั้งที่สร้างใหม่ แต่ Docker มี Internal DNS แปลงชื่อ Service เป็น IP ล่าสุดให้เสมอ', 'เพราะ Docker ไม่มี IP', 'เพราะชื่อสั้นกว่า 1 ตัวอักษร', 'เพราะ MySQL ไม่รับ IP'], 'Service Discovery ผ่าน Docker Internal DNS ทำให้ระบบ Container ยืดหยุ่นและไม่พังตอนรีสตาร์ท']
        ]
      },
      boss: {
        enemy: 'CONTAINER-DRIFT KRAKEN', dlg: 'อู่ต่อเรือ Container เจอปัญหา Security & Volume! ปกป้อง Docker Host ให้ไร้รอยรั่ว!',
        qs: [
          ['เหตุใดจึงควรระบุคำสั่ง `USER nonroot` ใน Dockerfile แทนการปล่อยให้แอปใน Container รันด้วยสิทธิ์ `root`?', 'เลือกเหตุผลด้านความปลอดภัย', ['ลดความเสียหายหากแอปถูกเจาะ (Container Escape) ตามหลัก Least Privilege ไม่ให้ผู้บุกรุกได้สิทธิ์ root', 'เพื่อให้ Container รันช้าลง', 'เพราะ root รัน Node.js ไม่ได้', 'เพื่อให้ลบ Image ง่ายขึ้น'], 'การรัน Container แบบ Non-Root และ Read-Only Filesystem เป็นมาตรฐานความมั่นคงของ Container'],
          ['คลังเก็บ Docker Image ส่วนกลาง (เช่น Docker Hub, GitHub Container Registry, Harbor) เรียกว่าอะไร?', 'เลือกชื่อเรียกมาตรฐาน', ['Container Registry', 'DNS Zone', 'Active Directory', 'DHCP Pool'], 'ทีมพัฒนาจะ Push Image ที่ทดสอบแล้วขึ้น Registry แล้วให้ Server ปลายทาง Pull ไปรันแบบเหมือนกันทุกสภาพแวดล้อม'],
          ['คำสั่งใดใช้ดูบันทึก Log ของ Container ชื่อ `web-api` แบบติดตามสดเพื่อแก้ปัญหา?', 'เลือกคำสั่งที่ถูกต้อง', ['docker logs -f web-api', 'docker rm -f web-api', 'docker rmi web-api', 'ufw logs web-api'], 'docker logs -f แสดง stdout/stderr ของแอปใน Container แบบเรียลไทม์ (และใช้ docker exec -it เพื่อเปิด Shell เข้าไปข้างใน)']
        ]
      }
    },
    {
      num: 38, roCode: 'cld_k8s38', roName: 'Juno Kubernetes Armada', name: 'Kubernetes Sky-Armada',
      subtitle: 'Control Plane & Worker Nodes, Pods, Deployments, Services, Ingress และ Auto-Scaling', color: '#2563eb', icon: '☸️', tag: 'K8S', cat: 'cloud',
      s1: {
        title: 'Pod, Deployment & Self-Healing', enemy: 'CrashLoop-BackOff Drone', dlg: 'Container ตัวหนึ่งแครชตอนตี 3! Kubernetes ต้องปลุก Pod ใหม่ขึ้นมาแทนอัตโนมัติใน 3 วินาที!',
        qs: [
          ['ใน **Kubernetes (K8s)** หน่วยเล็กที่สุดที่สามารถสร้างและรัน Container (1 หรือหลาย Container ที่แชร์ IP/Storage ร่วมกัน) เรียกว่าอะไร?', 'เลือกชื่อหน่วยพื้นฐานของ K8s', ['Pod', 'Rack', 'VLAN', 'Forest'], 'ปกติเรามักไม่สร้าง Pod เดี่ยว ๆ แต่จัดการผ่าน Deployment เพื่อให้มี Self-Healing และ Rolling Update'],
          ['หากตั้งค่า `replicas: 3` ใน Kubernetes Deployment แล้ว Pod ตัวหนึ่งล่มไป ระบบจะทำอย่างไร?', 'เลือกพฤติกรรม Self-Healing ของ K8s', ['Controller Manager จะตรวจพบว่าจำนวนจริงไม่ตรง Desired State แล้วสร้าง Pod ใหม่ขึ้นมาทดแทนให้ครบ 3 ตัวอัตโนมัติ', 'ปิด Pod ที่เหลืออีก 2 ตัว', 'ส่งอีเมลให้แอดมินมาเปิดเองตอนเช้า', 'ลบ Cluster ทิ้ง'], 'Desired State Reconciliation คือพลังหลักที่ทำให้ Kubernetes รักษาระบบให้รันได้ตลอด 24/7']
        ]
      },
      s2: {
        title: 'Service, Ingress & ConfigMap', enemy: 'ImagePull-Err Phantom', dlg: 'Pod เกิดใหม่ได้ IP ใหม่ตลอดเวลา! จะส่งทราฟฟิกเข้าหา Pod อย่างเสถียรได้อย่างไร?',
        qs: [
          ['องค์ประกอบใดใน Kubernetes ทำหน้าที่เป็นจุดรับทราฟฟิก IP/DNS คงที่ และทำ Load Balancing กระจายคำขอไปยัง Pod ด้านหลัง?', 'เลือกชื่อ Object ใน K8s', ['Service (เช่น ClusterIP, NodePort, LoadBalancer)', 'CronJob', 'BIOS', 'Swap'], 'Service เชื่อมกับ Pod ผ่าน Label Selector แม้ Pod จะตายแล้วเกิดใหม่ได้ IP ใหม่ Service ก็ยังส่งทราฟฟิกถูกเสมอ'],
          ['ความแตกต่างระหว่าง **ConfigMap** กับ **Secret** ใน Kubernetes คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['ConfigMap เก็บค่าตั้งค่าทั่วไปที่ไม่เป็นความลับ • Secret เก็บข้อมูลอ่อนไหวเช่น รหัสผ่าน, API Key, TLS Cert', 'Secret เก็บเฉพาะไฟล์รูปภาพ', 'ConfigMap ใช้เก็บข้อมูลในฮาร์ดดิสก์ลูกค้า', 'ทั้งคู่เหมือนกันทุกประการ'], 'การแยก ConfigMap/Secret ออกจากโค้ดช่วยให้ใช้ Docker Image เดียวกันรันได้ทั้ง Dev, Staging และ Production']
        ]
      },
      boss: {
        enemy: 'KUBE-SCHEDULER LEVIATHAN', dlg: 'กองเรือลอยฟ้า Kubernetes เผชิญทราฟฟิกพุ่ง 10 เท่า! ใช้ HPA และ kubectl สั่งการกองเรือ!',
        qs: [
          ['ฟีเจอร์ **HPA (Horizontal Pod Autoscaler)** ใน Kubernetes ทำหน้าที่อะไรเมื่อทราฟฟิกพุ่งสูง?', 'เลือกการทำงานของ HPA', ['เพิ่มจำนวน Pod (Scale Out) อัตโนมัติเมื่อ CPU/Memory หรือ Metrics สูงเกินเกณฑ์ และลดจำนวนลงเมื่อทราฟฟิกซา', 'ซื้อเครื่อง Server จริงเพิ่มทางออนไลน์', 'ปิดเว็บไซต์ชั่วคราว', 'เปลี่ยนภาษาโค้ด'], 'HPA ช่วยรับมือทราฟฟิกกระชาก (เช่น วันลงทะเบียนเรียนหรือแฟลชเซล) และประหยัดค่า Cloud ในช่วงเวลากลางคืน'],
          ['องค์ประกอบใดบน **Control Plane** ของ Kubernetes ที่เป็นฐานข้อมูล Key-Value เก็บสถานะทั้งหมดของทั้ง Cluster?', 'เลือกชื่อฐานข้อมูลหัวใจของ K8s', ['etcd', 'Microsoft Access', 'Notepad', 'Excel'], 'หาก etcd พังและไม่มี Backup จะสูญเสียการตั้งค่าทั้ง Kubernetes Cluster จึงต้องทำ etcd Snapshot สม่ำเสมอ'],
          ['คำสั่ง CLI มาตรฐานที่ใช้ควบคุมและดูสถานะ Pod ทั้งหมดใน Kubernetes Cluster คือข้อใด?', 'เลือกคำสั่งที่ถูกต้อง', ['kubectl get pods -A', 'k8s ping all', 'systemctl pods', 'ipconfig /pods'], 'kubectl เป็นเครื่องมือหลักสื่อสารกับ kube-apiserver เพื่อ Deploy, ตรวจ Log (kubectl logs) และแก้ปัญหา Cluster']
        ]
      }
    },
    {
      num: 39, roCode: 'cld_ci39', roName: 'Einbroch CI/CD Forge', name: 'CI/CD, GitOps & IaC Forge',
      subtitle: 'GitHub Actions, Build-Test-Deploy Pipeline, Terraform IaC และ Blue-Green / Canary', color: '#8b5cf6', icon: '🔄', tag: 'CI/CD', cat: 'cloud',
      s1: {
        title: 'CI/CD Pipeline & Infrastructure as Code', enemy: 'Manual-Deploy Golem', dlg: 'หมดยุคอัปโหลดไฟล์ด้วย FTP มือแล้วเว็บพัง! มาสร้าง Pipeline อัตโนมัติและ Terraform IaC กัน!',
        qs: [
          ['กระบวนการ **CI (Continuous Integration)** และ **CD (Continuous Delivery/Deployment)** ช่วยทีมไอทีอย่างไร?', 'เลือกคำตอบที่ถูกต้อง', ['รวมโค้ด รันทดสอบอัตโนมัติ (Automated Test) สแกนช่องโหว่ และส่งขึ้น Server อย่างสม่ำเสมอ ลดความผิดพลาดจากคน', 'เขียนโค้ดแทนมนุษย์ทั้งหมดโดยไม่ต้องตรวจ', 'ลบประวัติ Git ทุกวัน', 'แทนที่การสำรองข้อมูล'], 'CI/CD (เช่น GitHub Actions, GitLab CI, Jenkins) ทำให้ปล่อยฟีเจอร์และแพตช์ความปลอดภัยได้ไวและมั่นใจขึ้น'],
          ['แนวคิด **IaC (Infrastructure as Code)** เช่น **Terraform** มีจุดเด่นอย่างไรในการสร้าง Server บน Cloud/VM?', 'เลือกจุดเด่นของ IaC', ['ประกาศโครงสร้าง Server, Network, Firewall เป็นไฟล์โค้ด เก็บใน Git และสร้างซ้ำได้เหมือนกัน 100% ทุกครั้ง', 'ต้องคลิกเมาส์สร้างทีละเครื่องทุกครั้ง', 'ใช้สร้างได้เฉพาะไฟล์ HTML', 'ไม่ต้องใช้เครือข่าย'], 'IaC ป้องกันปัญหา Configuration Drift และกู้คืนโครงสร้างทั้งระบบใหม่ได้ในไม่กี่นาที']
        ]
      },
      s2: {
        title: 'Blue-Green & Canary Deployment', enemy: 'Downtime-Spike Imp', dlg: 'ต้องอัปเดตเวอร์ชันใหม่ของระบบธนาคารห้ามเว็บล่มแม้แต่วินาทีเดียว และต้อง Rollback ได้ใน 1 วิ!',
        qs: [
          ['กลยุทธ์ **Blue-Green Deployment** ลดความเสี่ยงตอนปล่อยเวอร์ชันใหม่อย่างไร?', 'เลือกการทำงานที่ถูกต้อง', ['เตรียมสภาพแวดล้อมใหม่ (Green) คู่ขนานกับของเดิม (Blue) พอทดสอบผ่านก็สลับ Load Balancer ไป Green ทันที และสลับกลับ Blue ได้ใน 1 วินาทีหากมีบั๊ก', 'ปิดเซิร์ฟเวอร์ Blue ทิ้ง 2 ชั่วโมงก่อนลงใหม่', 'ทาสีตู้แร็กเป็นสีน้ำเงินและเขียว', 'ส่งโค้ดตรงเข้า Database'], 'Blue-Green ให้ Zero-Downtime และ Rollback เร็วที่สุด (Instant Rollback)'],
          ['กลยุทธ์ **Canary Deployment** แตกต่างจาก Blue-Green อย่างไร?', 'เลือกความต่างที่ถูกต้อง', ['ทยอยปล่อยทราฟฟิกผู้ใช้จริงเพียงส่วนน้อย (เช่น 5%→25%→100%) เข้าเวอร์ชันใหม่ก่อน เพื่อเฝ้าดู Error ก่อนเปิดครบทุกคน', 'ปล่อยให้ทุกคน 100% ทันทีพร้อมกัน', 'ปิดระบบทั้งหมดวันอาทิตย์', 'ใช้ได้เฉพาะฐานข้อมูล SQL'], 'ชื่อ "นกขมิ้นในเหมือง (Canary)" สื่อถึงการทดสอบสัญญาณอันตรายกับผู้ใช้กลุ่มเล็กก่อนเพื่อจำกัดผลกระทบ']
        ]
      },
      boss: {
        enemy: 'PIPELINE-DRIFT TITAN', dlg: 'หุ่นเหล็ก DevOps ทดสอบ GitOps, Secret Scanning และ Immutable Infrastructure!',
        qs: [
          ['ข้อใดคือข้อห้ามร้ายแรงที่สุดในการเขียนไฟล์โค้ด Git / Terraform / GitHub Actions?', 'เลือกข้อห้ามด้านความปลอดภัย', ['ห้ามฮาร์ดโค้ดรหัสผ่าน, API Key หรือ Private Key ลงใน Git Repository เด็ดขาด (ต้องเก็บใน Secret Manager/Env)', 'ห้ามเขียน Comment อธิบายโค้ด', 'ห้ามตั้งชื่อ Branch', 'ห้ามใช้ไฟล์ YAML'], 'รหัสผ่านที่หลุดเข้า Git แม้ลบใน Commit ใหม่ก็ยังค้างอยู่ใน Git History ต้องใช้ Secrets Vault และ Secret Scanning เสมอ'],
          ['แนวคิด **GitOps** (เช่น ArgoCD, Flux) มีหลักการสำคัญอย่างไร?', 'เลือกหลักการของ GitOps', ['ใช้ Git Repository เป็นแหล่งความจริงเดียว (Single Source of Truth) ระบบจะซิงค์ Cluster ให้ตรงกับไฟล์ใน Git อัตโนมัติ', 'ห้ามใช้ Git ในองค์กร', 'เก็บไฟล์ฐานข้อมูลทั้งหมดใน Git', 'SSH เข้าไปแก้ไฟล์ในเครื่อง Production ด้วยมือ'], 'GitOps ทำให้ทุกการเปลี่ยนแปลงมีประวัติ Audit ครบถ้วน ตรวจสอบผ่าน Pull Request และย้อนกลับได้ง่ายด้วย git revert'],
          ['แนวคิด **Immutable Infrastructure** หมายถึงอะไร?', 'เลือกความหมายที่ถูกต้อง', ['ไม่แก้เครื่อง Server เดิมด้วยมือหลัง Deploy แต่สร้าง Image/VM เวอร์ชันใหม่ที่สะอาดแล้วสลับแทนตัวเก่าทั้งหมด', 'ห้ามอัปเดตซอฟต์แวร์ตลอดไป', 'ห้ามปิดเครื่อง Server', 'ล็อกเคสคอมพิวเตอร์ด้วยกุญแจ'], 'Immutable Infrastructure ขจัดปัญหา "เครื่องแต่ละตัวตั้งค่าไม่เหมือนกัน" (Snowflake Servers) ได้เด็ดขาด']
        ]
      }
    },
    {
      num: 40, roCode: 'cld_obs40', roName: 'Thanatos Grafana Observatory', name: 'Observability, Metrics & SRE',
      subtitle: 'Prometheus, Grafana, 3 Pillars of Observability, Alerting และ SLI/SLO/SLA', color: '#f97316', icon: '📊', tag: 'SRE', cat: 'forensics',
      s1: {
        title: '3 เสาหลัก Observability & Prometheus', enemy: 'Blindspot-Metric Imp', dlg: 'ลูกค้าโทรมาบอกว่าเว็บล่มมา 20 นาทีแล้วแต่ทีมไอทีไม่รู้ตัว! ถึงเวลาติดตั้ง Prometheus + Grafana!',
        qs: [
          ['**3 เสาหลักของระบบ Observability (Three Pillars)** ที่ช่วยให้มองเห็นสุขภาพ Server และแอปพลิเคชันได้รอบด้านคืออะไร?', 'เลือก 3 เสาหลักที่ถูกต้อง', ['Metrics (ตัวเลขวัดผล), Logs (บันทึกเหตุการณ์), และ Traces (ติดตามเส้นทางคำขอข้ามบริการ)', 'CPU, Mouse, Keyboard', 'HTML, CSS, JPG', 'BIOS, MBR, ISO'], 'Metrics บอกว่า "เกิดอะไรขึ้น" • Logs บอก "ทำไมถึงเกิด" • Traces บอก "ช้าหรือพังที่จุดไหนระหว่างบริการ"'],
          ['การทำงานร่วมกันของ **Prometheus** และ **Grafana** ในศูนย์ข้อมูลคืออะไร?', 'เลือกบทบาทที่ถูกต้อง', ['Prometheus ดึงและเก็บข้อมูล Metrics แบบ Time-Series (เช่น CPU, RAM, Latency) • Grafana นำมาวาด Dashboard และแจ้งเตือน', 'Grafana เป็น Firewall • Prometheus เป็น DNS', 'ทั้งคู่เป็นโปรแกรมแต่งรูป', 'ใช้แทนระบบปฏิบัติการ Linux'], 'Node Exporter บน Linux และ Windows Exporter ส่งค่าสุขภาพเครื่องให้ Prometheus เก็บแล้วโชว์กราฟสดบน Grafana']
        ]
      },
      s2: {
        title: 'SLI, SLO, SLA & Alert Fatigue', enemy: 'Alert-Spam Phantom', dlg: 'ช่อง LINE/Slack แจ้งเตือนดังวันละ 800 ครั้งจนไม่มีใครอ่าน และพลาดแจ้งเตือนจริงที่ระบบล่ม!',
        qs: [
          ['ข้อตกลงความพร้อมใช้งาน (Availability) ที่ **99.99% (Four Nines)** ยอมให้ระบบล่มได้สูงสุดประมาณเท่าใดต่อปี?', 'เลือกเวลา Downtime ต่อปีที่ถูกต้อง', ['ประมาณ 52.6 นาทีต่อปี (ส่วน 99.9% คือ ~8.76 ชั่วโมง/ปี)', '36 วันต่อปี', '100 ชั่วโมงต่อเดือน', '0 วินาทีเป๊ะทุกกรณี'], 'ยิ่งจำนวนเลข 9 เพิ่มขึ้น ต้นทุนด้าน Redundancy, Multi-Zone และ HA ก็ยิ่งสูงขึ้นตามไปด้วย'],
          ['อาการ **Alert Fatigue** ในทีม Ops เกิดจากอะไรและควรแก้อย่างไร?', 'เลือกแนวทางแก้ไขที่ถูกต้อง', ['เกิดจากแจ้งเตือนปลอม/ไม่สำคัญมากเกินไปจนทีมชินชา — ควรตั้ง Alert เฉพาะอาการที่ต้องลงมือแก้จริง (Actionable Alerts)', 'ปิดระบบแจ้งเตือนทั้งหมดทิ้ง', 'เพิ่มเสียงลำโพงให้ดังขึ้น', 'ส่งอีเมลทุก 1 วินาที'], 'แจ้งเตือนที่ดีต้องชัดเจน บอกผลกระทบต่อผู้ใช้ และแนบ Runbook วิธีแก้ไขเบื้องต้น']
        ]
      },
      boss: {
        enemy: 'SOVEREIGN OF NETCLOUD', dlg: 'ผู้ปกครองทวีป NetCloud ทดสอบหลัก SRE, Four Golden Signals และ Postmortem!',
        qs: [
          ['Google SRE เสนอ **Four Golden Signals** 4 ตัวชี้วัดสำคัญที่สุดที่ต้องมอนิเตอร์ทุกบริการ ได้แก่ข้อใด?', 'เลือก 4 สัญญาณทองคำ', ['Latency (ความช้า), Traffic (ปริมาณคำขอ), Errors (อัตราผิดพลาด), Saturation (ความอิ่มตัวของทรัพยากร)', 'Color, Font, Size, Audio', 'Mouse, Monitor, Cable, Desk', 'Ping, Telnet, FTP, POP3'], 'เฝ้าดู Four Golden Signals ช่วยตรวจพบปัญหาได้ตั้งแต่ก่อนที่ระบบจะล่มจริง'],
          ['วัฒนธรรม **Blameless Postmortem** หลังเกิดเหตุระบบล่มในทีม SRE/DevOps มีจุดประสงค์เพื่ออะไร?', 'เลือกเป้าหมายที่ถูกต้อง', ['มุ่งวิเคราะห์จุดอ่อนของระบบและกระบวนการเพื่อป้องกันไม่ให้เกิดซ้ำ แทนการหาแพะรับบาปลงโทษตัวบุคคล', 'หาคนผิดมาไล่ออกทันที', 'ปิดข่าวไม่ให้ใครรู้ว่าระบบล่ม', 'ลบ Log เหตุการณ์ทั้งหมด'], 'Blameless Postmortem ทำให้ทีมกล้ารายงานปัญหาตรงไปตรงมาและช่วยกันสร้างระบบที่ทนทานต่อความผิดพลาดของมนุษย์'],
          ['ความต่างระหว่าง **SLI**, **SLO** และ **SLA** คือข้อใด?', 'เลือกคำนิยามที่ถูกต้อง', ['SLI = ค่าที่วัดได้จริง • SLO = เป้าหมายภายในที่ทีมตั้งไว้ • SLA = สัญญาทางธุรกิจกับลูกค้า (มีค่าปรับหากทำไม่ได้)', 'ทั้งสามคำเหมือนกัน', 'SLA คือชื่อไวรัส', 'SLO คือพอร์ตเครือข่าย'], 'โดยทั่วไปทีมจะตั้ง SLO เข้มงวดกว่า SLA เล็กน้อยเพื่อให้มีระยะปลอดภัยแจ้งเตือนก่อนผิดสัญญาลูกค้า']
        ]
      }
    },
    {
      num: 41, roCode: 'sec_waf41', roName: 'Prontera WAF Shield Wall', name: 'WAF, DDoS & OWASP Shield Wall',
      subtitle: 'Layer 3/4 vs Layer 7 DDoS, WAF, Rate Limiting, Anycast CDN และ OWASP Top 10', color: '#ec4899', icon: '🧱', tag: 'WAF', cat: 'security',
      s1: {
        title: 'รับมือ DDoS & ปราการ WAF', enemy: 'SYN-Flood Swarm', dlg: 'เว็บวิทยาลัยถูกยิง SYN Flood และ SQL Injection พร้อมกัน! เปิด WAF + Rate Limiting ด่วน!',
        qs: [
          ['ความแตกต่างระหว่าง **Network Firewall (L3/L4)** กับ **WAF (Web Application Firewall — L7)** คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['Firewall ทั่วไปกรอง IP/Port • WAF ตรวจสอบเนื้อหา HTTP/HTTPS เพื่อบล็อก SQL Injection, XSS และ Bot โจมตีเว็บ', 'WAF ใช้กรองเฉพาะไฟบ้าน', 'Firewall กรอง SQL Injection ได้ครบอยู่แล้ว', 'WAF ใช้ได้เฉพาะ Wi-Fi'], 'เว็บเซิร์ฟเวอร์ที่ออกเน็ตสาธารณะควรมี WAF (เช่น Cloudflare, ModSecurity, AWS WAF) ป้องกันอยู่ด้านหน้าเสมอ'],
          ['การโจมตี **SYN Flood** อาศัยช่องโหว่ขั้นตอนใดของโปรโตคอล TCP เพื่อทำให้ Server รับการเชื่อมต่อใหม่ไม่ได้?', 'เลือกขั้นตอน TCP ที่ถูกโจมตี', ['TCP 3-Way Handshake (ส่ง SYN จำนวนมหาศาลแต่ไม่ส่ง ACK กลับ ทำให้คิว Half-Open เต็ม)', 'DHCP DORA', 'DNS Reverse Lookup', 'ARP Reply'], 'ป้องกันด้วย SYN Cookies บน Kernel, Rate Limiting และ DDoS Scrubbing / Anycast CDN']
        ]
      },
      s2: {
        title: 'อุดช่องโหว่ OWASP Top 10', enemy: 'SQLi-Injector Wraith', dlg: 'WAF ตรวจจับ Payload `\' OR 1=1 --` ยิงเข้ามาที่หน้าล็อกอิน! มาเข้าใจการป้องกันระดับโค้ดและเซิร์ฟเวอร์!',
        qs: [
          ['วิธีป้องกันการโจมตี **SQL Injection (SQLi)** ที่ได้ผลดีที่สุดที่ระดับโปรแกรมคือข้อใด?', 'เลือกวิธีป้องกันมาตรฐาน', ['ใช้ Parameterized Queries / Prepared Statements (ไม่นำค่าจากผู้ใช้มาต่อสตริง SQL ตรง ๆ)', 'ซ่อนปุ่มล็อกอิน', 'เปลี่ยนสีหน้าเว็บ', 'ปิดฐานข้อมูลตอนกลางคืน'], 'Prepared Statements แยกโครงสร้างคำสั่ง SQL ออกจากข้อมูลผู้ใช้อย่างเด็ดขาด พร้อมใช้ WAF เสริมเป็นเกราะชั้นที่สอง'],
          ['**CDN (Content Delivery Network)** เช่น Cloudflare/Akamai ช่วยรับมือการโจมตี Volumetric DDoS ได้อย่างไร?', 'เลือกกลไกป้องกัน', ['ใช้เครือข่าย Anycast กระจาย Edge Server ทั่วโลกช่วยดูดซับและกรองทราฟฟิกโจมตีก่อนจะวิ่งถึง Origin Server จริง', 'ปิดอินเทอร์เน็ตทั่วโลก', 'เปลี่ยน IP เครื่องลูกค้า', 'ลบไฟล์เว็บไซต์'], 'นอกจากกัน DDoS แล้ว CDN ยังช่วยแคชไฟล์ภาพ/CSS ใกล้ผู้ใช้ทำให้เว็บโหลดเร็วขึ้นด้วย']
        ]
      },
      boss: {
        enemy: 'LAYER-7 BOTNET OVERLORD', dlg: 'กองทัพบอทเน็ต 200,000 เครื่องยิง HTTP Flood ถล่มกำแพง! คุม WAF & Rate Limit ให้มั่น!',
        qs: [
          ['เทคนิค **Rate Limiting** บน Nginx/WAF (เช่น จำกัดไม่เกิน 30 คำขอต่อนาทีต่อ IP) ช่วยป้องกันการโจมตีแบบใด?', 'เลือกการโจมตีที่ Rate Limit ช่วยหยุดได้', ['Brute-Force รหัสผ่าน, Credential Stuffing, API Scraping และ HTTP Flood ขนาดย่อม', 'ฮาร์ดดิสก์พัง', 'ไฟดับในห้องแอร์', 'สายแลนขาด'], 'Rate Limiting เป็นแนวป้องกันที่เบาและมีประสิทธิภาพสูงมากบน Reverse Proxy และ API Gateway'],
          ['HTTP Security Header `Strict-Transport-Security (HSTS)` สั่งให้เบราว์เซอร์ทำสิ่งใด?', 'เลือกหน้าที่ของ HSTS', ['บังคับให้เชื่อมต่อกับเว็บไซต์นี้ผ่าน HTTPS เท่านั้น ป้องกันการถูกโจมตี Downgrade เป็น HTTP', 'เปิดให้เข้าผ่าน HTTP เท่านั้น', 'ปิดการใช้ JavaScript ทั้งหมด', 'บันทึกประวัติรหัสผ่านลงเครื่อง'], 'HSTS + CSP (Content-Security-Policy) ช่วยยกระดับความปลอดภัยฝั่งเว็บเบราว์เซอร์ได้อย่างมาก'],
          ['เหตุใดจึงต้องซ่อน **Origin Server IP** ไว้หลัง WAF/CDN และตั้ง Firewall รับทราฟฟิกพอร์ต 80/443 เฉพาะจาก IP ของ WAF เท่านั้น?', 'เลือกเหตุผลที่ถูกต้อง', ['เพื่อไม่ให้แฮกเกอร์ยิงโจมตีข้าม WAF ตรงไปยัง IP จริงของเซิร์ฟเวอร์ (Origin Bypass)', 'เพื่อให้จำ IP ง่ายขึ้น', 'เพราะ WAF ไม่มี IP', 'เพื่อลดขนาดไฟล์ HTML'], 'หากแฮกเกอร์รู้ Origin IP และ Firewall ไม่บล็อกการเข้าตรง WAF ที่จ่ายเงินซื้อมาก็จะไร้ความหมายทันที!']
        ]
      }
    },
    {
      num: 42, roCode: 'sec_ids42', roName: 'Geffen IDS Packet Lab', name: 'IDS/IPS & Packet Analysis Lab',
      subtitle: 'IDS vs IPS, Suricata/Snort, Wireshark/tcpdump, Port Mirroring และ Anomaly Detection', color: '#f43f5e', icon: '🔬', tag: 'IDS/IPS', cat: 'forensics',
      s1: {
        title: 'IDS vs IPS & Port Mirroring', enemy: 'Stealth-Probe Drone', dlg: 'มีการสแกนพอร์ตและทราฟฟิกแปลกปลอมวิ่งในห้องเซิร์ฟเวอร์! มาติดเซ็นเซอร์ IDS/IPS ดักจับกัน!',
        qs: [
          ['ความแตกต่างสำคัญระหว่าง **IDS (Intrusion Detection System)** กับ **IPS (Intrusion Prevention System)** คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['IDS วางแบบ Passive คอยตรวจจับและแจ้งเตือนอย่างเดียว • IPS วางขวางทางเดินข้อมูล (Inline) สามารถบล็อกทราฟฟิกโจมตีได้ทันที', 'IDS บล็อกได้ • IPS แจ้งเตือนอย่างเดียว', 'ทั้งคู่เป็นโปรแกรมแต่งภาพ', 'IPS ใช้ได้เฉพาะคอมพิวเตอร์บ้าน'], 'เครื่องมือโอเพนซอร์สยอดนิยมอย่าง Suricata และ Snort สามารถตั้งให้ทำงานได้ทั้งโหมด IDS และ IPS'],
          ['ฟีเจอร์ใดบน Switch ที่ใช้คัดลอกทราฟฟิกจากพอร์ตเป้าหมายส่งไปให้เครื่อง IDS หรือ Wireshark ตรวจสอบโดยไม่รบกวนระบบจริง?', 'เลือกชื่อฟีเจอร์ Switch', ['Port Mirroring (SPAN — Switched Port Analyzer)', 'DHCP Snooping', 'RAID 5', 'BIOS Reset'], 'SPAN/Port Mirroring หรือ Network TAP ช่วยให้ทีม SOC มองเห็นแพ็กเก็ตจริงในเครือข่ายได้อย่างสมบูรณ์']
        ]
      },
      s2: {
        title: 'จับแพ็กเก็ตด้วย tcpdump & Wireshark', enemy: 'Cleartext-Leak Imp', dlg: 'ต้องพิสูจน์ว่าแอปเก่าส่งรหัสผ่านแบบไม่เข้ารหัสผ่านเครือข่ายหรือไม่! จับแพ็กเก็ตดูด้วย `tcpdump`!',
        qs: [
          ['คำสั่งใดบน Linux Server (ไม่มีหน้าจอ GUI) ใช้ดักจับแพ็กเก็ตเฉพาะพอร์ต 443 ลงไฟล์ `capture.pcap` เพื่อนำไปเปิดวิเคราะห์ใน Wireshark?', 'เลือกคำสั่ง tcpdump ที่ถูกต้อง', ['sudo tcpdump -i any port 443 -w capture.pcap', 'sudo ping -w capture.pcap', 'sudo chmod 443 capture.pcap', 'sudo df -443'], 'tcpdump จับแพ็กเก็ตบนเซิร์ฟเวอร์ Linux ได้แม่นยำ แล้วดึงไฟล์ .pcap มาเปิดดูอย่างละเอียดใน Wireshark'],
          ['ในโปรแกรม **Wireshark** หากต้องการกรองดูเฉพาะแพ็กเก็ตที่มีปลายทางหรือต้นทางเป็น IP `192.168.10.10` และใช้พอร์ต TCP 22 ใช้ Display Filter ใด?', 'เลือก Filter Wireshark ที่ถูกต้อง', ['ip.addr == 192.168.10.10 && tcp.port == 22', 'SELECT * FROM packets', 'chmod 22 192.168.10.10', 'grep 192.168.10.10'], 'การเขียน Wireshark Display Filter เป็นทักษะทองคำของทั้ง Network Engineer และ Cybersecurity Analyst']
        ]
      },
      boss: {
        enemy: 'C2-BEACON PHANTOM', dlg: 'มัลแวร์แอบส่งสัญญาณ Beacon ออกไปยังเครื่องควบคุม C2 ทุก 60 วินาที! แกะรอยแพ็กเก็ตจับมันให้ได้!',
        qs: [
          ['ข้อแตกต่างระหว่าง **Signature-Based Detection** กับ **Anomaly-Based Detection** ในระบบ IDS/IPS คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['Signature เทียบลายเซ็นภัยคุกคามที่รู้จักแล้ว (แม่นยำสูงแต่จับ Zero-Day ใหม่ไม่ได้) • Anomaly จับพฤติกรรมผิดปกติจาก Baseline (จับ Zero-Day ได้แต่มี False Positive มากกว่า)', 'Signature จับได้เฉพาะไวรัสใน USB', 'Anomaly ไม่ต้องใช้ข้อมูลเครือข่าย', 'ทั้งสองอย่างเหมือนกัน'], 'ระบบ SOC สมัยใหม่ผสานทั้ง Signature, Behavioral/Anomaly และ Threat Intelligence เข้าด้วยกัน'],
          ['ในงานตรวจสอบภัยคุกคาม คำว่า **False Positive** และ **False Negative** ตัวไหนอันตรายต่อความปลอดภัยมากกว่ากัน?', 'เลือกคำตอบที่ถูกต้อง', ['False Negative (มีการโจมตีจริงแต่ระบบไม่แจ้งเตือน/ปล่อยผ่าน) อันตรายกว่า False Positive (แจ้งเตือนผิดทั้งที่ปลอดภัย)', 'False Positive อันตรายกว่าเสมอ', 'ทั้งสองอย่างไม่มีผล', 'หมายถึงความเร็วเน็ต'], 'การจูน IDS/SIEM คือการลด False Positive เพื่อไม่ให้ทีมล้า ขณะเดียวกันต้องไม่เกิด False Negative กับภัยร้ายแรง'],
          ['พฤติกรรม **DNS Tunneling** ที่แฮกเกอร์แอบลักลอบส่งข้อมูลออกนอกองค์กรผ่านพอร์ต 53 มีลักษณะเด่นให้ตรวจจับได้อย่างไร?', 'เลือกสัญญาณผิดปกติใน DNS Log', ['มี Subdomain ยาวผิดปกติแบบสุ่ม/เข้ารหัส (เช่น a9f2c8d1e4...badsite.com) และยิงคำขอ DNS ถี่ผิดปกติไปยังโดเมนแปลกหน้า', 'มีการเปิดเว็บ google.com วันละ 1 ครั้ง', 'มีการ Ping 127.0.0.1', 'มีการใช้ HTTPS พอร์ต 443'], 'การมอนิเตอร์ DNS Logs เป็นจุดยุทธศาสตร์สำคัญมากในการจับมัลแวร์ C2 และ Data Exfiltration']
        ]
      }
    },
    {
      num: 43, roCode: 'sec_pt43', roName: 'Morroc Pentest Arena', name: 'Vulnerability & Hardening Arena',
      subtitle: 'CVE/CVSS Scoring, Nmap Scanning, CIS Benchmarks, Attack Surface และ Patch Priority', color: '#e11d48', icon: '🎯', tag: 'CVE', cat: 'security',
      s1: {
        title: 'CVE, CVSS & การสแกนด้วย Nmap', enemy: 'OpenPort-Mimic', dlg: 'ทีม Audit กำลังสแกนช่องโหว่ Server ประจำไตรมาส! มาเข้าใจรหัส CVE, คะแนน CVSS และ Nmap กัน!',
        qs: [
          ['รหัส **CVE (Common Vulnerabilities and Exposures)** และคะแนน **CVSS (0.0–10.0)** ใช้เพื่อวัตถุประสงค์ใด?', 'เลือกคำตอบที่ถูกต้อง', ['ระบุรหัสช่องโหว่มาตรฐานสากลและประเมินระดับความรุนแรง (9.0–10.0 = Critical) เพื่อจัดลำดับความเร่งด่วนในการแพตช์', 'วัดความเร็วฮาร์ดดิสก์', 'นับจำนวนผู้ใช้ในโดเมน', 'ตั้งชื่อเครื่อง Server'], 'ช่องโหว่ระดับ Critical ที่เปิดออกอินเทอร์เน็ตและมีโค้ดโจมตีสาธารณะ (Exploit) ต้องได้รับความสำคัญอันดับ 1 ในการแพตช์'],
          ['คำสั่ง **Nmap** ใดที่ผู้ดูแลระบบใช้ตรวจสอบพอร์ต TCP ที่เปิดอยู่และตรวจจับเวอร์ชันของบริการบนเครื่องตัวเอง (`192.168.10.10`)?', 'เลือกคำสั่ง Nmap ที่ถูกต้อง', ['nmap -sV 192.168.10.10', 'nmap --format 192.168.10.10', 'chmod -sV 192.168.10.10', 'df -sV'], 'หมายเหตุทางจริยธรรม: ห้ามใช้ Nmap สแกนเครือข่ายหรือระบบของผู้อื่นโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรเด็ดขาด!']
        ]
      },
      s2: {
        title: 'Server Hardening & CIS Benchmarks', enemy: 'Default-Creds Imp', dlg: 'เพิ่งลง Server OS เสร็จใหม่ ๆ ห้ามเอาขึ้นใช้งานจริงทันที! ต้องทำ Server Hardening ตามมาตรฐาน CIS ก่อน!',
        qs: [
          ['แนวทางปฏิบัติ **Server Hardening (ลด Attack Surface)** ข้อใดถูกต้องที่สุด?', 'เลือกมาตรการ Hardening ที่ถูกต้อง', ['เปลี่ยนรหัสผ่านเริ่มต้น ปิดบริการ/พอร์ตที่ไม่จำเป็น อัปเดตแพตช์ เปิด Firewall และใช้สิทธิ์น้อยที่สุด', 'เปิดทุกพอร์ตและติดตั้งทุกโปรแกรมเผื่อไว้ก่อน', 'ตั้งรหัสผ่าน admin/admin เพื่อให้ทีมจำง่าย', 'ปิดระบบ Log เพื่อประหยัดดิสก์'], 'CIS Benchmarks เป็นคู่มือมาตรฐานสากลที่ทีม Security ทั่วโลกใช้ตรวจเช็กลิสต์การทำ Hardening ให้ Linux และ Windows Server'],
          ['ความแตกต่างระหว่าง **Vulnerability Scanning** กับ **Penetration Testing (Pentest)** คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['Vulnerability Scan ใช้เครื่องมืออัตโนมัติค้นหารายการช่องโหว่ • Pentest คือผู้เชี่ยวชาญจำลองการเจาะระบบจริงเพื่อทดสอบว่าช่องโหว่ถูกโจมตีต่อยอดได้แค่ไหน', 'ทั้งสองอย่างเหมือนกัน 100%', 'Pentest คือการลบข้อมูลลูกค้าจริง', 'Vulnerability Scan ทำได้เฉพาะบนมือถือ'], 'องค์กรควรทำ Vulnerability Scan เป็นประจำทุกเดือน และทำ Pentest อย่างน้อยปีละ 1 ครั้งหรือก่อนเปิดระบบสำคัญ']
        ]
      },
      boss: {
        enemy: 'EXPLOIT-CHAIN WARDEN', dlg: 'จอมทดสอบเจาะระบบจำลองการโจมตีแบบ Red Team! ปิดจุดอ่อนทุกชั้นเพื่อชัยชนะ!',
        qs: [
          ['หลักการป้องกันแบบ **Defense in Depth (การป้องกันเชิงลึกหลายชั้น)** หมายถึงอะไร?', 'เลือกความหมายที่ถูกต้อง', ['วางมาตรการป้องกันซ้อนกันหลายชั้น (Network → Firewall/WAF → OS Hardening → App Auth → Encryption → Backup) หากชั้นหนึ่งแตกยังมีชั้นถัดไปกันไว้', 'ซื้อ Firewall แพง ๆ ตัวเดียวแล้วไม่ต้องทำอย่างอื่น', 'ซ่อนเครื่อง Server ไว้ใต้โต๊ะ', 'ไม่ต่ออินเทอร์เน็ตตลอดไป'], 'ไม่มีเครื่องมือความปลอดภัยใดที่กันได้ 100% การป้องกันหลายชั้นจึงเป็นหัวใจของ Cybersecurity'],
          ['หากพบไฟล์หรือบริการที่ไม่จำเป็นรันด้วยสิทธิ์ `SUID` บน Linux แอดมินควรระวังภัยคุกคามใด?', 'เลือกความเสี่ยงที่เกี่ยวข้อง', ['Privilege Escalation (ผู้บุกรุกใช้ไฟล์ที่มี SUID bit ของ root ยกระดับสิทธิ์ตัวเองเป็น root ได้)', 'DNS Spoofing', 'RAM เสีย', 'ไฟดับ'], 'แอดมินสาย Security จะตรวจหา SUID binaries แปลกปลอมเป็นประจำด้วยคำสั่ง find / -perm -4000 2>/dev/null'],
          ['เหตุใดจึงไม่ควรเผยเลขเวอร์ชันซอฟต์แวร์ละเอียดใน HTTP Header (เช่นตั้ง `server_tokens off;` ใน Nginx)?', 'เลือกเหตุผลที่ถูกต้อง', ['ลดข้อมูลที่ช่วยแฮกเกอร์ในขั้นตอน Reconnaissance (หาเวอร์ชันเพื่อจับคู่กับ CVE ที่ตรงกัน)', 'ทำให้เว็บโหลดช้าลง', 'ทำให้ใช้ HTTPS ไม่ได้', 'เพื่อให้ Google หาเว็บไม่เจอ'], 'การปิด Banner/Version Disclosure เป็นขั้นตอนพื้นฐานที่ดีใน Server Hardening']
        ]
      }
    },
    {
      num: 44, roCode: 'sec_rw44', roName: 'Glast Immutable Vault', name: 'Ransomware & Immutable Backup',
      subtitle: 'กฎ 3-2-1-1-0 Backup, Air-Gapped & Immutable (WORM), EDR และ Disaster Recovery Drills', color: '#dc2626', icon: '🔐', tag: 'WORM', cat: 'backup',
      s1: {
        title: 'กฎทอง 3-2-1-1-0 & Immutable Backup', enemy: 'Backup-Encryptor Worm', dlg: 'Ransomware รุ่นใหม่ฉลาดมาก! มันเข้าไปลบไฟล์ Backup บน NAS ที่ต่อค้างไว้ก่อนจะเข้ารหัส Server!',
        qs: [
          ['กฎการสำรองข้อมูลยุคใหม่ **3-2-1-1-0** เลข `1` ตัวที่สอง และเลข `0` หมายถึงอะไร?', 'เลือกความหมายของ 3-2-1-1-0', ['อย่างน้อย 1 ชุดเป็น Offline / Air-Gapped / Immutable (แก้ไขลบไม่ได้) • และ 0 ข้อผิดพลาดหลังทดสอบ Restore จริง', 'สำรอง 1 ครั้งต่อ 0 ปี', 'ใช้ฮาร์ดดิสก์ 10 ลูก', 'รหัสผ่าน 32110'], 'หากไม่มี Immutable/Offline Backup เมื่อแฮกเกอร์ยึด Domain Admin ได้มันจะสั่งลบ Backup ออนไลน์ทิ้งทั้งหมดก่อนเรียกค่าไถ่!'],
          ['คุณสมบัติ **Immutable Storage / WORM (Write Once, Read Many)** บน Cloud Object Lock หรือ Backup Server ช่วยป้องกันอะไร?', 'เลือกประโยชน์สำคัญที่สุด', ['ป้องกันไม่ให้ใครก็ตาม (แม้แต่บัญชี Admin หรือ Ransomware) ลบหรือแก้ไขไฟล์ Backup ก่อนครบกำหนดเวลา Retention', 'ทำให้ไฟล์ Backup เล็กลง 99%', 'เปิดให้ทุกคนแก้ไฟล์ได้อิสระ', 'แทนที่ระบบ Firewall'], 'Immutable Backup คือหลักประกันสุดท้ายที่ทำให้องค์กรไม่ต้องยอมจ่ายค่าไถ่ให้แฮกเกอร์']
        ]
      },
      s2: {
        title: 'EDR & การซ้อมแผนกู้คืน (DR Drill)', enemy: 'Untested-Backup Ghost', dlg: 'Backup ขึ้นสีเขียวทุกคืนมา 2 ปี แต่พอวันจริงไฟล์เสีย Restore ไม่ได้! อย่าตกหลุมพรางนี้เด็ดขาด!',
        qs: [
          ['คำกล่าวในวงการ SysAdmin ว่า **"Backup ที่ไม่เคยทดสอบ Restore ก็ไม่ต่างจากไม่มี Backup"** สอนเรื่องใด?', 'เลือกแนวปฏิบัติที่จำเป็น', ['ต้องซ้อมทดสอบ Restore จริงลงเครื่องทดสอบ (DR Drill) สม่ำเสมอ เพื่อยืนยันว่าไฟล์สมบูรณ์และกู้ได้ทันตาม RTO จริง', 'ไม่ต้องทำ Backup เลย', 'ดูแค่สัญลักษณ์ถูกสีเขียวก็พอแล้ว', 'เก็บ Backup ไว้ในเครื่องเดียวกับต้นฉบับ'], 'หลายองค์กรเพิ่งรู้ตัววันโดนโจมตีว่า Backup ไม่ครบหรือลืมรหัสผ่านถอดรหัส Backup การซ้อม DR Drill ช่วยอุดช่องโหว่นี้'],
          ['ระบบ **EDR (Endpoint Detection and Response)** เหนือกว่า Antivirus ดั้งเดิมอย่างไร?', 'เลือกจุดเด่นของ EDR', ['เฝ้าตรวจพฤติกรรมโปรเซสแบบเรียลไทม์ ตรวจจับการเข้ารหัสไฟล์ผิดปกติ สั่งกักกันเครื่อง (Isolate Host) และย้อนรอยเหตุการณ์ได้', 'เปลี่ยนวอลเปเปอร์อัตโนมัติ', 'ใช้ได้เฉพาะเช็กไฟล์ .txt', 'ไม่ต้องอัปเดตฐานข้อมูล'], 'EDR ทำงานร่วมกับ SIEM/SOC ช่วยหยุด Ransomware ตั้งแต่เครื่องแรกก่อนลุกลามทั้งเครือข่าย']
        ]
      },
      boss: {
        enemy: 'CRYPTO-LOCKER EMPEROR', dlg: 'จอมมาร Ransomware ปล่อยตัวเข้ารหัสพร้อมกันทั่วเครือข่าย! ใช้ Playbook 3-2-1-1-0 & DR กู้ชีพองค์กร!',
        qs: [
          ['เมื่อเกิดเหตุ Ransomware โจมตีระบบแล้ว เหตุใดหน่วยงานความมั่นคงไซเบอร์ทั่วโลกจึงแนะนำ **"ไม่ให้จ่ายค่าไถ่"**?', 'เลือกเหตุผลที่ถูกต้อง', ['ไม่มีหลักประกันว่าจะได้ตัวถอดรหัสที่สมบูรณ์ ข้อมูลอาจถูกขโมยไปขายต่อ และยิ่งเป็นการสนับสนุนทุนให้กลุ่มอาชญากรโจมตีซ้ำ', 'เพราะจ่ายเงินแล้วคอมพิวเตอร์จะระเบิด', 'เพราะแฮกเกอร์ไม่รับเงิน', 'เพราะไฟล์จะหายไปเองใน 1 นาที'], 'การเตรียม Immutable Backup + DR Plan ที่ซ้อมไว้จริงทำให้องค์กรฟื้นตัวได้อย่างมีศักดิ์ศรีโดยไม่ต้องจ่ายค่าไถ่'],
          ['กลยุทธ์ **Double Extortion** ของกลุ่ม Ransomware ยุคใหม่คืออะไร?', 'เลือกคำอธิบายที่ถูกต้อง', ['ขโมยข้อมูลลับออกไปก่อนแล้วค่อยเข้ารหัสเครื่อง ขู่ว่าจะปล่อยข้อมูลรั่วไหลสู่สาธารณะ (กระทบ PDPA) หากไม่จ่ายเงิน', 'เข้ารหัสเครื่องเดิม 2 รอบ', 'ส่งอีเมล 2 ฉบับ', 'ล็อกเฉพาะเมาส์และคีย์บอร์ด'], 'ดังนั้นการป้องกัน Data Exfiltration (DLP, Firewall Egress Filtering, การเข้ารหัสข้อมูล) จึงสำคัญไม่แพ้ Backup'],
          ['ในแผน **BCP / DRP** ความแตกต่างระหว่าง **Cold Site**, **Warm Site** และ **Hot Site** คืออะไร?', 'เลือกคำตอบที่ถูกต้อง', ['Hot Site พร้อมสลับใช้งานทันที (RTO ต่ำสุด/แพงสุด) • Warm Site มีเครื่องพร้อมแต่ต้องโหลดข้อมูลล่าสุด • Cold Site มีแค่อาคาร/ไฟต้องขนเครื่องไปตั้งใหม่', 'Cold Site คือห้องแอร์เย็นกว่า Hot Site', 'ทั้งสามแบบสลับงานได้ใน 1 วินาทีเท่ากัน', 'Hot Site ไม่มีไฟฟ้า'], 'องค์กรจะเลือกประเภท DR Site ให้สมดุลระหว่างงบประมาณกับค่า RTO/RPO ของแต่ละระบบ']
        ]
      }
    },
    {
      num: 45, roCode: 'sec_eml45', roName: 'Alberta Mail Security Gate', name: 'Email Server & Anti-Phish Gate',
      subtitle: 'SMTP/SMTPS/IMAP, SPF, DKIM, DMARC, Open Relay Protection และ Anti-Phishing', color: '#a855f7', icon: '📧', tag: 'DMARC', cat: 'security',
      s1: {
        title: '3 ทหารเสือ SPF, DKIM & DMARC', enemy: 'Spoofed-CEO Mimic', dlg: 'มีมิจฉาชีพปลอมอีเมลเป็น "ผอ.วิทยาลัย" สั่งให้โอนเงินด่วน! ติดตั้งเกราะ SPF + DKIM + DMARC บน DNS เดี๋ยวนี้!',
        qs: [
          ['DNS TXT Record 3 ตัวที่ใช้ยืนยันตัวตนอีเมลและป้องกันการปลอมแปลงชื่อโดเมน (Email Spoofing) คือข้อใด?', 'เลือกชุดมาตรฐาน Email Authentication', ['SPF, DKIM และ DMARC', 'HTTP, FTP และ SSH', 'RAID, LVM และ NTFS', 'VLAN, STP และ BGP'], 'SPF ระบุ IP ที่ส่งเมลได้ • DKIM แนบลายเซ็นดิจิทัลยืนยันเนื้อหาไม่ถูกแก้ • DMARC กำหนดนโยบายว่าถ้าไม่ผ่านให้กักกันหรือปฏิเสธ'],
          ['หากตั้งค่านโยบาย DMARC เป็น `p=reject` จะเกิดผลอย่างไรเมื่อมีมิจฉาชีพปลอมโดเมนของเราส่งอีเมลฟิชชิ่ง?', 'เลือกผลลัพธ์ของ p=reject', ['Mail Server ปลายทางจะปฏิเสธและทิ้งอีเมลปลอมนั้นทันที ไม่ให้เข้าไปถึงกล่อง Inbox ของเหยื่อ', 'ปล่อยผ่านเข้า Inbox ทุกฉบับ', 'ส่งอีเมลนั้นให้ทุกคนในบริษัท', 'ปิดการใช้งาน DNS'], 'ขั้นตอนแนะนำคือเริ่มจาก p=none (เก็บรายงาน) → p=quarantine → p=reject เมื่อตรวจสอบครบถ้วนแล้ว']
        ]
      },
      s2: {
        title: 'พอร์ตอีเมลเข้ารหัส & ปิด Open Relay', enemy: 'Spam-Relay Bot', dlg: 'IP ของวิทยาลัยติด Blacklist ส่งเมลหา Gmail ไม่เข้า เพราะ Mail Server เผลอเปิด Open Relay!',
        qs: [
          ['ปัญหา **Open Relay** บน Mail Server (SMTP) คืออะไรและส่งผลเสียอย่างไร?', 'เลือกคำตอบที่ถูกต้อง', ['Mail Server ยอมส่งอีเมลให้ใครก็ได้โดยไม่ต้องยืนยันตัวตน ทำให้แฮกเกอร์เอาไปยิงสแปมจน IP องค์กรติด Blacklist', 'เปิดให้พนักงานอ่านเมลเร็วขึ้น', 'ช่วยเข้ารหัสอีเมลอัตโนมัติ', 'เป็นฟีเจอร์ป้องกันไวรัส'], 'Mail Server ต้องบังคับ SMTP Authentication (พอร์ต 587 STARTTLS / 465 SMTPS) ก่อนส่งออกภายนอกเสมอ'],
          ['พอร์ตมาตรฐานสำหรับรับอีเมลแบบเข้ารหัส **IMAPS** และส่งอีเมลแบบยืนยันตัวตน **SMTP Submission** คือข้อใด?', 'เลือกคู่พอร์ตที่ปลอดภัย', ['993 (IMAPS) และ 587 (SMTP Submission + STARTTLS)', '23 และ 80', '21 และ 69', '110 (ไม่เข้ารหัส) และ 25 เท่านั้น'], 'ควรหลีกเลี่ยง IMAP (143) และ POP3 (110) แบบไม่เข้ารหัส เพื่อป้องกันรหัสผ่านอีเมลถูกดักจับ']
        ]
      },
      boss: {
        enemy: 'PHISHING-SIREN OVERLORD', dlg: 'ไซเรนฟิชชิ่งส่งอีเมลหลอกลวงแนบมัลแวร์เข้าองค์กร! ป้องกันทั้งเทคนิคและคนให้ครบ!',
        qs: [
          ['**DKIM (DomainKeys Identified Mail)** ใช้เทคโนโลยีใดในการพิสูจน์ว่าอีเมลไม่ได้ถูกแก้ไขข้อความระหว่างทาง?', 'เลือกกลไกของ DKIM', ['ลายเซ็นดิจิทัลแบบ Asymmetric Cryptography (เซิร์ฟเวอร์ผู้ส่งเซ็นด้วย Private Key และผู้รับตรวจด้วย Public Key ใน DNS)', 'การใส่สีตัวอักษรแดง', 'การบีบอัดไฟล์ ZIP', 'การเปลี่ยนพอร์ตเป็น 8080'], 'หากใครแอบแก้เลขบัญชีในอีเมลระหว่างทาง ลายเซ็น DKIM จะตรวจไม่ผ่านทันที'],
          ['นอกจาก SPF/DKIM/DMARC แล้ว การมี **PTR Record (Reverse DNS)** ให้ IP ของ Mail Server สำคัญอย่างไร?', 'เลือกเหตุผลที่ถูกต้อง', ['ผู้ให้บริการอีเมลใหญ่ (เช่น Gmail/Outlook) จะตรวจ Reverse DNS ของ IP ผู้ส่ง หากไม่มีหรือชื่อไม่ตรงอาจถูกปัดตกถังสแปม', 'ช่วยให้แนบไฟล์ใหญ่ 10 GB ได้', 'ทำให้ไม่ต้องใช้รหัสผ่าน', 'ใช้แทน SSL'], 'Mail Server คุณภาพต้องครบทั้ง A Record, MX Record, PTR Record, SPF, DKIM และ DMARC'],
          ['ทำไมการฝึกอบรม **Security Awareness & Phishing Simulation** ให้บุคลากรจึงจำเป็นมากแม้จะมี Email Gateway ราคาแพง?', 'เลือกเหตุผลที่ถูกต้อง', ['เพราะมนุษย์มักเป็นเป้าหมายหลักของ Social Engineering การฝึกให้สังเกตลิงก์ปลอมและไม่กรอกรหัสผ่านสุ่มสี่สุ่มห้าคือแนวป้องกันสำคัญ', 'เพราะ Email Gateway ใช้กับภาษาไทยไม่ได้', 'เพื่อลดค่าไฟ', 'เพราะกฎหมายห้ามใช้ Firewall'], 'เทคโนโลยีที่ดี + บุคลากรที่รู้เท่าทัน (Human Firewall) คือชุดป้องกันฟิชชิ่งที่แข็งแกร่งที่สุด']
        ]
      }
    },
    {
      num: 46, roCode: 'dc_tier46', roName: 'Lighthalzen Green DC Core', name: 'Data Center Tier-IV & Cooling',
      subtitle: 'Uptime Tier I–IV, PUE, Hot/Cold Aisle Containment, Dual PSU/UPS และ Fire Suppression', color: '#10b981', icon: '🏢', tag: 'TIER-4', cat: 'hardware',
      s1: {
        title: 'Uptime Tier I–IV & ระบบไฟฟ้าสำรอง', enemy: 'Power-Surge Golem', dlg: 'ออกแบบห้อง Data Center ให้รัน 24/7 ไม่มีวันดับ! มาเรียนรู้มาตรฐาน Tier I–IV และระบบไฟฟ้าคู่!',
        qs: [
          ['ตามมาตรฐาน Uptime Institute Data Center ระดับ **Tier IV** (Fault Tolerant, Uptime 99.995%) มีจุดเด่นสำคัญอย่างไร?', 'เลือกคุณสมบัติของ Tier IV', ['มีเส้นทางจ่ายไฟและระบบทำความเย็นสำรองครบคู่แบบ Active (2N / 2N+1) ทนทานต่ออุปกรณ์เสียหรือซ่อมบำรุงได้โดยไม่ดับเลย', 'มีปลั๊กไฟเส้นเดียวและพัดลมบ้าน 1 ตัว', 'ปิดเครื่องทุกวันเสาร์-อาทิตย์', 'ไม่ต้องมีเครื่องปั่นไฟ'], 'Server ใน Tier IV จะเสียบสายไฟ 2 เส้น (Dual PSU) แยกเข้าปลั๊ก PDU ฝั่ง A และฝั่ง B ที่ต่อจาก UPS/Generator คนละชุด'],
          ['การจัดวางตู้แร็กแบบ **Hot Aisle / Cold Aisle Containment** ในห้อง Data Center มีจุดประสงค์เพื่ออะไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['หันหน้าตู้ดูดลมเย็นชนกัน (Cold Aisle) และหันหลังตู้เป่าลมร้อนชนกัน (Hot Aisle) ไม่ให้ลมร้อน-เย็นปนกัน ประหยัดค่าแอร์และระบายความร้อนได้ดีมาก', 'ทำให้เดินในห้องได้ง่ายขึ้นเท่านั้น', 'ป้องกันน้ำท่วม', 'เพิ่มความเร็วสายแลน'], 'การแยกช่องลมร้อน-เย็นช่วยลดอุณหภูมิหน้าตู้เซิร์ฟเวอร์และยืดอายุฮาร์ดแวร์ได้หลายปี']
        ]
      },
      s2: {
        title: 'ค่า PUE & ระบบดับเพลิงห้องเซิร์ฟเวอร์', enemy: 'Thermal-Runaway Imp', dlg: 'เกิดควันในตู้แร็กเซิร์ฟเวอร์! ห้ามใช้หัวฉีดน้ำสปริงเกลอร์ธรรมดาเด็ดขาด!',
        qs: [
          ['ค่า **PUE (Power Usage Effectiveness)** ของ Data Center คำนวณจาก `พลังงานรวมทั้งศูนย์ ÷ พลังงานที่ใช้กับอุปกรณ์ IT` — ค่าใดถือว่าประหยัดพลังงานยอดเยี่ยม?', 'เลือกค่า PUE ที่ดีที่สุด', ['ใกล้เคียง 1.0 ที่สุด (เช่น 1.1–1.3 หมายถึงใช้ไฟไปกับ IT เป็นหลัก ไม่สูญเสียไปกับแอร์มากเกินไป)', '10.0 ยิ่งมากยิ่งดี', '0.0', '50.0'], 'Data Center ยุคใหม่ (Green DC) แข่งขันกันลดค่า PUE ให้ต่ำที่สุดเพื่อประหยัดพลังงานและลดคาร์บอน'],
          ['ระบบดับเพลิงที่เหมาะสมสำหรับห้อง Data Center เพื่อไม่ให้แผงวงจรเซิร์ฟเวอร์ช็อตพังจากน้ำคือข้อใด?', 'เลือกชนิดสารดับเพลิงสำหรับห้องเซิร์ฟเวอร์', ['Clean Agent Gas (เช่น FM-200, Novec 1230, IG-541) ที่ดับไฟได้โดยไม่ทิ้งคราบและไม่นำไฟฟ้า', 'สายยางฉีดน้ำแรงดันสูง', 'ถังผงเคมีแห้งธรรมดา (ผงเกาะแผงวงจรพังหมด)', 'พัดลมเป่าแรง ๆ'], 'Clean Agent ดับไฟรวดเร็วและปลอดภัยต่ออุปกรณ์อิเล็กทรอนิกส์ราคาแพงใน Data Center']
        ]
      },
      boss: {
        enemy: 'BLACKOUT-THERMAL TITAN', dlg: 'เครื่องปรับอากาศ Precision AC ตัวที่ 1 ดับและไฟการไฟฟ้าตก! รักษาห้อง Data Center ให้รอด!',
        qs: [
          ['หน่วยวัดความสูงของเครื่อง Rack Server มาตรฐาน **1U** มีความสูงประมาณเท่าใด?', 'เลือกขนาดมาตรฐาน 1U', ['1.75 นิ้ว (ประมาณ 4.45 เซนติเมตร) โดยตู้แร็กมาตรฐานมักสูง 42U', '1 เมตร', '10 เซนติเมตร', '1 ฟุต'], 'แอดมินต้องคำนวณขนาด U, น้ำหนัก และกำลังไฟ (Watt) ของทุกเครื่องก่อนติดตั้งลงตู้แร็ก 42U'],
          ['ระบบ **UPS (Uninterruptible Power Supply)** ทำงานประสานกับ **Diesel Generator** ใน Data Center อย่างไรเมื่อไฟดับ?', 'เลือกการทำงานที่ถูกต้อง', ['UPS จ่ายไฟจากแบตเตอรี่ทันทีแบบไร้รอยต่อ (0 ms) ประคองเครื่องไว้ระหว่างรอ Generator สตาร์ตและจ่ายไฟหลักภายใน 10–30 วินาที', 'UPS ใช้แทน Generator ได้ 30 วัน', 'Generator ติดก่อนแล้วค่อยเปิด UPS', 'ทั้งสองอย่างทำงานแทนแอร์'], 'UPS แบบ Online Double-Conversion ยังช่วยกรองไฟตก ไฟกระชาก ให้แรงดันนิ่งตลอด 24/7 ด้วย'],
          ['มาตรการ **Physical Security** ในห้อง Data Center ระดับองค์กรควรมีสิ่งใดบ้าง?', 'เลือกมาตรการที่ถูกต้อง', ['ประตูควบคุมสิทธิ์ (Biometric/Keycard + Mantrap), กล้อง CCTV, บันทึกสมุดเข้า-ออก และเซ็นเซอร์วัดอุณหภูมิ/ความชื้น/น้ำรั่ว', 'เปิดประตูห้องเซิร์ฟเวอร์ทิ้งไว้ระบายอากาศ', 'ให้ใครก็เดินเข้ามาชาร์จมือถือได้', 'ไม่ต้องติดกล้องวงจรปิด'], 'ความปลอดภัยไซเบอร์จะไร้ความหมายทันทีหากใครก็ได้เดินมาถอดฮาร์ดดิสก์ออกจากตู้แร็กได้ง่าย ๆ!']
        ]
      }
    },
    {
      num: 47, roCode: 'dc_ha47', roName: 'Juno High-Availability Sky', name: 'High Availability & Chaos Lab',
      subtitle: 'Active-Active vs Active-Passive, Keepalived/VRRP, Virtual IP, Split-Brain และ Chaos Testing', color: '#06b6d4', icon: '♾️', tag: 'HA-VIP', cat: 'hardware',
      s1: {
        title: 'Active-Active & Virtual IP (VRRP)', enemy: 'SPOF-Breaker Drone', dlg: 'Load Balancer มีแค่เครื่องเดียว กลายเป็น Single Point of Failure (SPOF)! มาทำ HA คู่ด้วย Keepalived!',
        qs: [
          ['คำว่า **SPOF (Single Point of Failure)** ในการออกแบบระบบเซิร์ฟเวอร์หมายถึงอะไร?', 'เลือกความหมายที่ถูกต้อง', ['จุดใดจุดหนึ่งของระบบที่ไม่มีตัวสำรอง หากจุดนั้นพังจะทำให้ทั้งระบบล่มทันที', 'เซิร์ฟเวอร์ที่มีความเร็วสูงสุด', 'ชื่อโปรโตคอลเครือข่าย', 'รหัสผ่านแบบใช้ครั้งเดียว'], 'งานสำคัญของ Systems Architect คือไล่กำจัด SPOF ทุกจุด (ไฟคู่, เน็ตคู่, Switch คู่, LB คู่, DB Replica)'],
          ['โปรโตคอล **VRRP (Keepalived)** บน Linux Load Balancer 2 เครื่องช่วยให้ระบบไม่ล่มเมื่อ LB ตัวหลักพังได้อย่างไร?', 'เลือกการทำงานของ VRRP', ['แบ่งปัน Virtual IP (VIP) เดียวกัน หาก Master ล่ม Backup จะย้าย VIP มารับช่วงต่อภายในเสี้ยววินาทีอัตโนมัติ', 'ลบ IP ของเครื่อง Backup ทิ้ง', 'สั่งผู้ใช้เปลี่ยนลิงก์เว็บใหม่', 'ปิด Firewall ทั้งสองเครื่อง'], 'Keepalived + HAProxy/Nginx เป็นคู่หูโอเพนซอร์สยอดนิยมสำหรับสร้าง Active-Passive Load Balancer']
        ]
      },
      s2: {
        title: 'Active-Active vs Chaos Engineering', enemy: 'Chaos-Monkey Imp', dlg: 'จะรู้ได้อย่างไรว่าแผน HA ใช้ได้จริงตอนตี 2? ลองทดสอบถอดปลั๊กจำลองในเวลางานด้วย Chaos Engineering!',
        qs: [
          ['ความแตกต่างระหว่างคลัสเตอร์แบบ **Active-Active** กับ **Active-Passive** คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['Active-Active ทุกโหนดช่วยกันรับงานพร้อมกัน (คุ้มค่าทรัพยากร) • Active-Passive ตัวหลักรับงาน ตัวสำรองรอสลับเมื่อตัวหลักพัง', 'Active-Passive รับงานพร้อมกัน 10 เครื่อง', 'Active-Active ไม่มีตัวสำรอง', 'ทั้งสองแบบเหมือนกัน'], 'Active-Active ใช้ประโยชน์จากเครื่องได้เต็มที่ แต่ต้องออกแบบระบบให้รองรับการซิงค์ข้อมูล/Session ร่วมกัน (Stateless App)'],
          ['แนวคิด **Chaos Engineering** (ริเริ่มโดย Netflix Chaos Monkey) มีจุดประสงค์เพื่ออะไร?', 'เลือกเป้าหมายของ Chaos Engineering', ['จงใจจำลองเหตุขัดข้องอย่างควบคุมได้ (เช่น ปิดโหนด/เพิ่ม Latency) เพื่อค้นหาจุดอ่อนและพิสูจน์ว่าระบบ HA ฟื้นตัวเองได้จริง', 'แกล้งลบฐานข้อมูลลูกค้าเล่น', 'ปิดระบบสำรองไฟทั้งหมด', 'ปล่อยไวรัสลงเครื่องพนักงาน'], 'การทดสอบความทนทานล่วงหน้าช่วยให้ทีมมั่นใจว่าระบบจะรอดเมื่อเกิดภัยพิบัติจริง']
        ]
      },
      boss: {
        enemy: 'SPLIT-BRAIN HYDRA', dlg: 'โหนด HA ทั้งสองฝั่งต่างคิดว่าตัวเองเป็น Master! แก้เกม Split-Brain และ Multi-AZ ให้ขาด!',
        qs: [
          ['การวางระบบแบบ **Multi-AZ (Multiple Availability Zones)** บน Cloud ช่วยป้องกันภัยระดับใด?', 'เลือกขอบเขตการป้องกัน', ['ป้องกันกรณีอาคาร Data Center หนึ่งแห่งไฟดับ น้ำท่วม หรือไฟไหม้ ระบบยังทำงานต่อได้จากอีก AZ หนึ่ง', 'ป้องกันผู้ใช้ลืมรหัสผ่าน', 'ป้องกันไวรัสบนมือถือลูกค้า', 'ช่วยเขียนโค้ดอัตโนมัติ'], 'การกระจาย Web/App/DB ข้ามอย่างน้อย 2–3 Availability Zones เป็นมาตรฐานของระบบ Production บน Cloud'],
          ['เหตุใดการทำเว็บแอปพลิเคชันให้เป็น **Stateless** (เก็บ Session ใน Redis/DB แทนการเก็บไว้ใน RAM ของเครื่องเว็บเอง) จึงสำคัญต่อ HA & Auto-Scaling?', 'เลือกเหตุผลที่ถูกต้อง', ['ทำให้ Load Balancer ส่งผู้ใช้ไปเครื่อง Web Server ตัวไหนก็ได้โดยไม่หลุดล็อกอิน และเพิ่ม-ลดจำนวนเครื่องได้ทันที', 'ทำให้เว็บไม่ต้องใช้ CSS', 'ทำให้ไม่ต้องมีฐานข้อมูล', 'ทำให้ใช้ RAM มากขึ้น 10 เท่า'], 'Stateless Application + External Session Store คือรากฐานสำคัญของ Cloud-Native Architecture'],
          ['กลไก **Health Check** ของ Load Balancer ควรตรวจสอบระดับใดจึงจะแม่นยำที่สุด?', 'เลือกวิธี Health Check ที่ดีที่สุด', ['ตรวจ HTTP Endpoint (เช่น GET /healthz ตอบ 200 OK พร้อมเช็กการต่อ DB) ไม่ใช่แค่ Ping ICMP อย่างเดียว', 'แค่ดูว่าเครื่องเปิดไฟติดอยู่', 'ไม่ต้องทำ Health Check', 'ให้ลูกค้าโทรมาบอกเอง'], 'หลายครั้งเครื่องยัง Ping ติด แต่แอปค้างไปแล้ว HTTP Health Check จึงคัดเครื่องป่วยออกจาก Pool ได้แม่นยำกว่ามาก']
        ]
      }
    },
    {
      num: 48, roCode: 'sec_iso48', roName: 'Aldebaran ISO 27001 Hall', name: 'Compliance, PDPA & ISO 27001',
      subtitle: 'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA), ISO/IEC 27001, พ.ร.บ. คอมฯ Log 90 วัน และ Audit', color: '#eab308', icon: '⚖️', tag: 'ISO27K', cat: 'security',
      s1: {
        title: 'พ.ร.บ. คอมพิวเตอร์ & PDPA สำหรับ SysAdmin', enemy: 'Unlogged-Audit Ghost', dlg: 'ผู้ตรวจสอบ (Auditor) ขอตรวจ Log จราจรคอมพิวเตอร์และมาตรการคุ้มครองข้อมูลส่วนบุคคลของวิทยาลัย!',
        qs: [
          ['ตาม **พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ (ประเทศไทย)** ผู้ให้บริการ/องค์กรต้องเก็บรักษาข้อมูลจราจรทางคอมพิวเตอร์ (Log) ไว้อย่างน้อยกี่วัน?', 'เลือกระยะเวลาขั้นต่ำตามกฎหมายไทย', ['ไม่น้อยกว่า 90 วัน (และพนักงานเจ้าหน้าที่อาจสั่งขยายได้ถึง 2 ปีในกรณีจำเป็น) พร้อมเทียบเวลาให้ตรง (NTP)', '7 วัน', '1 วัน', 'ไม่ต้องเก็บเลย'], 'ระบบเก็บ Log ที่ถูกต้องต้องซิงค์เวลา NTP แม่นยำและป้องกันการแก้ไขปลอมแปลง Log (Integrity)'],
          ['ภายใต้ **PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล)** หน้าที่ทางเทคนิคสำคัญของ SysAdmin ในการดูแลฐานข้อมูลที่มีข้อมูลส่วนบุคคลคืออะไร?', 'เลือกมาตรการทางเทคนิคที่เหมาะสม', ['เข้ารหัสข้อมูล (Encryption at Rest & in Transit), จำกัดสิทธิ์เข้าถึง (RBAC/Least Privilege), เก็บ Audit Log และมีแผนแจ้งเหตุรั่วไหลภายใน 72 ชม.', 'เปิดฐานข้อมูลให้ทุกคนดาวน์โหลดได้', 'ส่งไฟล์ Excel รายชื่อลูกค้าทางกลุ่มแชตสาธารณะ', 'ไม่ต้องตั้งรหัสผ่าน Server'], 'หากเกิดเหตุข้อมูลส่วนบุคคลรั่วไหลที่มีความเสี่ยง องค์กรต้องแจ้ง สคส. ภายใน 72 ชั่วโมงนับแต่ทราบเหตุ']
        ]
      },
      s2: {
        title: 'มาตรฐาน ISO/IEC 27001 & RBAC', enemy: 'Excess-Priv Mimic', dlg: 'องค์กรกำลังขอรับรองมาตรฐาน **ISO/IEC 27001 (ISMS)**! มาตรวจการควบคุมสิทธิ์และ Change Management!',
        qs: [
          ['มาตรฐานสากล **ISO/IEC 27001** เป็นมาตรฐานเกี่ยวกับระบบการจัดการด้านใด?', 'เลือกคำตอบที่ถูกต้อง', ['ระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ (ISMS — Information Security Management System)', 'มาตรฐานความเร็วสายแลน', 'มาตรฐานการออกแบบกราฟิกเกม', 'มาตรฐานการผลิตฮาร์ดดิสก์'], 'ISO 27001 ครอบคลุมทั้งนโยบาย บุคลากร กายภาพ และเทคโนโลยี โดยใช้การประเมินความเสี่ยง (Risk Management) เป็นแกนกลาง'],
          ['หลักการ **Separation of Duties (การแบ่งแยกหน้าที่)** ในงานไอทีองค์กรมีไว้เพื่อป้องกันอะไร?', 'เลือกวัตถุประสงค์ที่ถูกต้อง', ['ป้องกันไม่ให้คนเดียวมีอำนาจครบทุกขั้นตอน (เช่น ทั้งเขียนโค้ด อนุมัติ และย้ายขึ้น Production เอง) เพื่อลดความเสี่ยงทุจริตและข้อผิดพลาด', 'ทำให้ทำงานช้าลงโดยไร้เหตุผล', 'ประหยัดเงินเดือนพนักงาน', 'ลดจำนวนเซิร์ฟเวอร์'], 'Separation of Duties + Change Management ช่วยให้การเปลี่ยนแปลงระบบสำคัญมีการตรวจทาน (Peer Review) เสมอ']
        ]
      },
      boss: {
        enemy: 'COMPLIANCE-AUDIT ARBITER', dlg: 'ผู้ตรวจประเมิน ISO 27001 เข้าตรวจระบบ! ตอบให้เฉียบคมเพื่อรับตราผ่านมาตรฐาน!',
        qs: [
          ['ความแตกต่างระหว่าง **Encryption at Rest** กับ **Encryption in Transit** คือข้อใด?', 'เลือกความต่างที่ถูกต้อง', ['At Rest = เข้ารหัสข้อมูลที่เก็บนิ่งบนดิสก์/DB/Backup (เช่น BitLocker, LUKS, AES-256) • In Transit = เข้ารหัสขณะวิ่งผ่านเครือข่าย (เช่น TLS 1.3, SSH, VPN)', 'At Rest คือตอนปิดเครื่อง • In Transit คือตอนถือโน้ตบุ๊กเดิน', 'ทั้งสองอย่างเหมือนกัน', 'ไม่ต้องเข้ารหัสหากอยู่ในองค์กร'], 'การปกป้องข้อมูลต้องครอบคลุมทั้ง At Rest และ In Transit เพื่อความปลอดภัยครบวงจร'],
          ['เมื่อพนักงานลาออก ขั้นตอน **Offboarding** ที่ฝ่าย SysAdmin ต้องรีบดำเนินการทันทีคือข้อใด?', 'เลือกขั้นตอนที่ถูกต้องที่สุด', ['ระงับบัญชี AD/SSO/VPN/อีเมลทันที (Disable แทนการลบก่อนเพื่อเก็บ Audit Trail) และเพิกถอน SSH Key/Token ทั้งหมด', 'ปล่อยบัญชีค้างไว้เผื่อกลับมาเยี่ยม', 'แชร์รหัสผ่านของคนเก่าให้พนักงานใหม่ใช้ต่อ', 'ฟอร์แมตเซิร์ฟเวอร์ทั้งองค์กร'], 'บัญชีร้างของอดีตพนักงาน (Orphaned Accounts) เป็นช่องโหว่ยอดฮิตที่ Auditor ตรวจเจอและแฮกเกอร์ชอบใช้'],
          ['**Access Review (การทบทวนสิทธิ์ผู้ใช้เป็นระยะ)** มีประโยชน์อย่างไร?', 'เลือกประโยชน์ที่ถูกต้อง', ['ตรวจจับและถอดถอนสิทธิ์เกินจำเป็น (Privilege Creep) เมื่อพนักงานย้ายแผนกหรือเปลี่ยนตำแหน่ง', 'เพิ่มสิทธิ์ Admin ให้ทุกคนทุกปี', 'ลบไฟล์งานของพนักงาน', 'เปลี่ยนชื่อโดเมน'], 'การทำ Access Review รายไตรมาสหรือรายปีช่วยรักษาหลัก Least Privilege ให้เป็นจริงตลอดเวลา']
        ]
      }
    },
    {
      num: 49, roCode: 'ai_edge49', roName: 'Juno AI-Ops & Edge Nexus', name: 'AI Ops, GPU Clusters & Edge Nexus',
      subtitle: 'GPU Server Clusters, Edge Computing, AIOps Predictive Monitoring และ Telemetry', color: '#a855f7', icon: '🧠', tag: 'AI-OPS', cat: 'cloud',
      s1: {
        title: 'GPU Server Clusters & Edge Computing', enemy: 'Latency-Bottleneck Drone', dlg: 'องค์กรเริ่มรันโมเดล AI ภายในและติดตั้ง IoT Edge Server ที่โรงงาน! มาเข้าใจโครงสร้าง AI & Edge กัน!',
        qs: [
          ['เหตุใดงานประมวลผล **AI / Deep Learning** บนเซิร์ฟเวอร์จึงต้องใช้ **GPU Cluster** (พร้อมโครงข่ายความเร็วสูงเช่น InfiniBand/RoCE) มากกว่า CPU ล้วน?', 'เลือกเหตุผลทางสถาปัตยกรรม', ['เพราะ GPU มีแกนประมวลผลขนานนับพันคอร์เหมาะกับการคำนวณเมทริกซ์ขนาดมหาศาลเร็วกว่า CPU หลายสิบเท่า', 'เพราะ GPU ใช้พื้นที่ดิสก์น้อยกว่า', 'เพราะ CPU ต่ออินเทอร์เน็ตไม่ได้', 'เพราะ GPU ไม่เกิดความร้อน'], 'GPU Server กินไฟและปล่อยความร้อนสูงมาก (10–40+ kW ต่อตู้แร็ก) จึงมักต้องใช้ระบบระบายความร้อน Liquid Cooling ใน Data Center ยุคใหม่'],
          ['แนวคิด **Edge Computing** ช่วยงานโรงงานอัจฉริยะหรือกล้อง AI ตรวจจับเรียลไทม์อย่างไร?', 'เลือกข้อดีของ Edge Computing', ['ประมวลผลข้อมูลใกล้จุดกำเนิด (ที่ Edge Server หน้างาน) ช่วยลดความหน่วง (Ultra-Low Latency) และลดภาระส่งข้อมูลมหาศาลขึ้น Cloud', 'โยนข้อมูลทั้งหมดไปเก็บที่ต่างประเทศ', 'ปิดการใช้งานเครือข่าย LAN', 'แทนที่ระบบไฟฟ้า'], 'Edge + Cloud Hybrid ช่วยให้ตัดสินใจหน้างานได้ในไม่กี่มิลลิวินาทีแล้วค่อยส่งสรุปขึ้น Cloud กลาง']
        ]
      },
      s2: {
        title: 'AIOps & การพยากรณ์ระบบล่วงหน้า', enemy: 'Silent-Degrade Phantom', dlg: 'AIOps ตรวจพบแนวโน้มดิสก์ลูกที่ 3 มี I/O Error เพิ่มขึ้นผิดปกติและกำลังจะพังใน 48 ชั่วโมง! รีบเปลี่ยนก่อนพังจริง!',
        qs: [
          ['**AIOps (AI for IT Operations)** เข้ามาช่วยงานผู้ดูแลระบบ (SysAdmin/SRE) ในด้านใดมากที่สุด?', 'เลือกประโยชน์ของ AIOps', ['วิเคราะห์ Log และ Metrics มหาศาลแบบเรียลไทม์ คัดกรองแจ้งเตือนซ้ำซ้อน (Noise Reduction) และพยากรณ์ความเสียหาย (Predictive Maintenance) ล่วงหน้า', 'เดินสายแลนแทนช่างเทคนิค', 'ยกตู้แร็กเข้าห้องเซิร์ฟเวอร์', 'ยกเลิกการสำรองข้อมูล'], 'AIOps ช่วยลดเวลาวินิจฉัยปัญหา (MTTR — Mean Time To Resolution) ลงอย่างมาก'],
          ['ค่า **MTBF** และ **MTTR** ในการบริหารจัดการเครื่องแม่ข่ายหมายถึงอะไรตามลำดับ?', 'เลือกคำนิยามที่ถูกต้อง', ['MTBF = ระยะเวลาเฉลี่ยที่ระบบทำงานได้ปกติก่อนเสีย (ยิ่งมากยิ่งดี) • MTTR = เวลาเฉลี่ยที่ใช้ซ่อมกู้คืนระบบ (ยิ่งน้อยยิ่งดี)', 'MTTR ยิ่งมากยิ่งดี', 'ทั้งสองคำคือความเร็วพัดลม', 'เป็นชื่อสายไฟเบอร์'], 'ทีม Ops มุ่งเพิ่ม MTBF ด้วยฮาร์ดแวร์/HA คุณภาพ และลด MTTR ด้วย Observability, Automation และ Runbook']
        ]
      },
      boss: {
        enemy: 'NEURAL-CLUSTER OVERMIND', dlg: 'ปัญญาประดิษฐ์ผู้คุมคลัสเตอร์ GPU ทดสอบการออกแบบโครงสร้างพื้นฐานยุค AI!',
        qs: [
          ['ในการรัน AI/ML Workload ในองค์กรแบบ **On-Premises Private AI** มีข้อได้เปรียบสำคัญด้านใดเหนือการส่งข้อมูลไป Public AI ภายนอก?', 'เลือกข้อได้เปรียบหลัก', ['ข้อมูลความลับองค์กรและข้อมูลส่วนบุคคล (PDPA) ไม่หลุดออกนอกเครือข่าย ควบคุมความปลอดภัยและการปฏิบัติตามกฎหมายได้ 100%', 'ไม่ต้องใช้ไฟฟ้า', 'ไม่ต้องดูแลเซิร์ฟเวอร์เลย', 'ฟรีค่าฮาร์ดดิสก์'], 'หลายโรงพยาบาล ธนาคาร และหน่วยงานรัฐเลือกตั้ง Private GPU Server เพื่อรักษา Data Sovereignty'],
          ['ระบบระบายความร้อน **Direct-to-Chip Liquid Cooling** เริ่มจำเป็นสำหรับ AI Data Center เพราะเหตุใด?', 'เลือกเหตุผลที่ถูกต้อง', ['ชิป GPU ระดับ Data Center ปล่อยความร้อนหนาแน่นสูงเกินกว่าการเป่าลมแอร์ธรรมดา (Air Cooling) จะระบายทัน', 'เพื่อทำให้ห้องเซิร์ฟเวอร์เสียงดังขึ้น', 'เพราะแอร์ใช้ไม่ได้กับ Linux', 'เพื่อให้ตู้แร็กหนักขึ้น'], 'การระบายความร้อนด้วยของเหลวยังช่วยลดค่า PUE ของศูนย์ข้อมูลได้อย่างมีนัยสำคัญ'],
          ['มาตรฐาน **OpenTelemetry (OTel)** ในระบบ Cloud/AI ยุคใหม่มีบทบาทอย่างไร?', 'เลือกบทบาทของ OpenTelemetry', ['เป็นมาตรฐานกลางแบบ Open-Source สำหรับเก็บและส่ง Metrics, Logs และ Traces โดยไม่ยึดติดกับผู้ให้บริการเจ้าใดเจ้าหนึ่ง (Vendor-Neutral)', 'เป็นระบบปฏิบัติการแทน Windows', 'เป็นฮาร์ดดิสก์แบบใหม่', 'เป็นสายแลน Cat9'], 'OpenTelemetry ทำให้เปลี่ยนเครื่องมือมอนิเตอร์ปลายทางได้อิสระโดยไม่ต้องรื้อโค้ดแอปใหม่']
        ]
      }
    },
    {
      num: 50, roCode: 'apex_throne50', roName: 'Grand Cyber-Midgard Throne', name: 'GRAND ARCHITECT FINAL APEX',
      subtitle: 'บททดสอบสูงสุดแห่งผู้สถาปนาศูนย์ข้อมูลครบวงจร 50 โซน — พิชิตบัลลังก์แห่ง Cyber-Midgard!', color: '#fbbf24', icon: '🏆', tag: 'APEX-50', cat: 'forensics',
      s1: {
        title: 'บททดสอบสถาปนิก: Multi-Layer Crisis', enemy: 'Omnibus-Fault Sentinel', dlg: 'ยินดีต้อนรับสู่โซนที่ 50 โซนสุดท้ายแห่งตำนาน! ภัยพิบัติซ้อน 3 ชั้นกำลังโจมตีศูนย์ข้อมูลพร้อมกัน!',
        qs: [
          ['[Scenario 1] เว็บอีคอมเมิร์ซล่มกะทันหัน: Ping เครื่อง Load Balancer ติด แต่หน้าเว็บขึ้น `502 Bad Gateway` และในเครื่อง App Server พบ `df -i` ขึ้น 100% บน `/var` — จุดเริ่มต้นการแก้ปัญหาที่ตรงจุดที่สุดคือ?', 'เลือกการวิเคราะห์ที่แม่นยำระดับ Senior Architect', ['ลบไฟล์ขยะ/Session เล็ก ๆ จำนวนมหาศาลที่ทำให้ Inode เต็มใน /var แล้วสั่งรีสตาร์ทบริการแอป Backend', 'เปลี่ยนสายแลนของลูกค้าทุกคน', 'ซื้อใบรับรอง SSL ใหม่', 'เปลี่ยน IP เป็น DHCP'], '502 บอกว่า Backend พัง และ df -i 100% คือ Inode เต็มทำให้แอปเขียนไฟล์ Session/Log ไม่ได้จนแครช — วิเคราะห์เชื่อมโยงได้ครบทุกชั้น!'],
          ['[Scenario 2] คุณต้องออกแบบโครงสร้างระบบลงทะเบียนเรียนระดับประเทศที่รองรับผู้ใช้พร้อมกัน 100,000 คน แบบปลอดภัยและไม่ล่ม — องค์ประกอบชุดใดครบถ้วนที่สุด?', 'เลือกสถาปัตยกรรม Enterprise ที่สมบูรณ์แบบ', ['Anycast CDN+WAF → HA Load Balancer → Auto-Scaling Stateless App (K8s) → Redis Cache + Primary/Replica SQL ใน Private Subnet + 3-2-1-1-0 Immutable Backup + Prometheus/SIEM', 'เครื่อง PC 1 เครื่องลง Windows 11 Home เปิดพอร์ต 80 และ 3389 ออกเน็ตตรง ๆ', 'RAID 0 อย่างเดียวโดยไม่มี Backup และปิด Firewall', 'ใช้ Telnet และ FTP จัดการระบบทั้งหมด'], 'นี่คือภาพรวมสถาปัตยกรรม Production ระดับโลกที่ผสานทุกความรู้ตั้งแต่โซน 1 ถึงโซน 50!']
        ]
      },
      s2: {
        title: 'บททดสอบสถาปนิก: Zero-Trust Defense', enemy: 'Quantum-Intruder Seraph', dlg: 'ด่านรองสุดท้ายก่อนพบบอสใหญ่โซน 50! พิสูจน์วิจารณญาณการรับมือเหตุการณ์วิกฤตระดับสูงสุด!',
        qs: [
          ['[Scenario 3] ระบบ SIEM แจ้งเตือน Event ID 4625 นับพันครั้งต่อด้วย Event ID 4624 จาก IP แปลกหน้าบนเครื่อง File Server ในเวลาตี 3 — ขั้นตอน Incident Response แรกสุดที่ถูกต้องคือ?', 'เลือกการตอบสนองที่ถูกต้อง', ['Containment ทันที: ตัดแยกเครือข่าย (Isolate) เครื่องต้องสงสัย ระงับบัญชีที่ถูกเจาะ เก็บหลักฐาน Log/Memory แล้วไล่สืบหาต้นตอ (Root Cause)', 'รีบฟอร์แมตเครื่องทิ้งโดยไม่เก็บ Log', 'รอจนถึงวันจันทร์ค่อยเปิดดู', 'ปิด SIEM เพื่อไม่ให้แจ้งเตือนรบกวน'], 'Containment + Preservation of Evidence หยุดการลุกลามโดยไม่ทำลายหลักฐานทางนิติวิทยา'],
          ['[Scenario 4] องค์กรมีงบประมาณจำกัดแต่ต้องการยกระดับความปลอดภัยที่คุ้มค่าที่สุด (Highest Security ROI) ควรทำสิ่งใดเป็นอันดับแรก?', 'เลือกชุดมาตรการพื้นฐานที่ทรงพลังที่สุด', ['เปิด MFA ทุกบัญชี, อัปเดตแพตช์สม่ำเสมอ, ใช้ Least Privilege (แยกบัญชี Admin), ปิดพอร์ตเสี่ยง (SMB/RDP/SSH ออกเน็ต) และมี Offline/Immutable Backup ที่ทดสอบ Restore แล้ว', 'ซื้อจอ 4K ให้ทุกคน', 'ทาสีห้องเซิร์ฟเวอร์ใหม่', 'เปลี่ยนชื่อเว็บไซต์ทุกเดือน'], 'Cyber Hygiene พื้นฐานที่ทำอย่างมีวินัยป้องกันการโจมตีในโลกจริงได้มากกว่า 90%!']
        ]
      },
      boss: {
        enemy: 'OMEGA-CORE ARCHITECT', dlg: '👑 FINAL APEX BOSS แห่งโซนที่ 50! เอาชนะบททดสอบสุดท้ายเพื่อขึ้นเป็นตำนาน Grand Data Center Architect แห่ง ServerOps!',
        qs: [
          ['[Final Phase 1 — Hybrid Cloud & Dual-OS] องค์กรต้องการให้เครื่อง Linux Web Server (Ubuntu) คุยกับ Windows Active Directory, สำรองข้อมูลแบบปลอดภัย และมอนิเตอร์รวมศูนย์ — ชุดมาตรฐานใดทำงานร่วมกันได้อย่างสมบูรณ์?', 'เลือกชุดเทคโนโลยีที่ถูกต้อง', ['NTP (123) เทียบเวลาตรงกัน + DNS (53) + HTTPS/TLS 1.3 (443) + SSH Key (22) + Immutable 3-2-1-1-0 Backup + SIEM/Observability', 'SMBv1 + Telnet (23) + HTTP (80) + Default Password', 'RAID 0 + Public Port 3306 + ปิด Firewall', 'Dynamic DHCP บนทุก Server + ไม่เก็บ Log'], 'ทุกบริการในองค์กรจริงต้องประสานกันด้วยเวลาตรงกัน, การเข้ารหัส, สิทธิ์น้อยที่สุด, สำรองข้อมูล และมอนิเตอร์ครบวงจร'],
          ['[Final Phase 2 — Ultimate Recovery] ศูนย์ข้อมูลหลักไฟไหม้ทั้งอาคาร แต่บริษัทวางแผน DRP ระดับ Enterprise ไว้สมบูรณ์ — ปัจจัยคู่ใดที่จะทำให้บริษัทเปิดให้บริการใหม่จากศูนย์สำรองได้เร็วและข้อมูลหายน้อยที่สุด?', 'เลือกคำตอบที่ถูกต้องที่สุด', ['ค่า RTO และ RPO ต่ำ (ผ่าน Hot/Warm DR Site + Real-time Replication + Immutable Backup + ผ่านการซ้อม DR Drill จริงมาแล้ว)', 'มีแค่ RAID 1 ในอาคารเดิมที่ไฟไหม้', 'เก็บ Backup ไว้บนโต๊ะข้าง ๆ Server', 'ไม่มีแผน DRP แต่รอกู้คืนทีหลัง'], 'DRP ที่ดีต้องออกแบบทั้งโครงสร้างสำรองข้ามสถานที่และผ่านการซ้อมมือจริง'],
          ['[Final Strike — Grand Architect Creed] คุณสมบัติสูงสุดของ "ผู้ดูแลระบบเครื่องแม่ข่ายมืออาชีพ (Grand SysAdmin)" คือข้อใด?', 'เลือกคำตอบปิดฉากแห่งตำนานโซนที่ 50!', ['ผสานความรู้ลึกทั้ง Hardware, OS (Linux & Windows), Network, Security, Automation และความรับผิดชอบทางจริยธรรม เพื่อสร้างระบบที่เสถียร ปลอดภัย และพร้อมรับใช้ผู้ใช้ตลอด 24/7', 'รู้แค่คำสั่งเดียวแล้วปิดระบบป้องกันทั้งหมด', 'จำรหัสผ่านของคนอื่นเพื่อแอบดูข้อมูลส่วนตัว', 'ไม่เคยจดบันทึกเอกสารและไม่เคยสำรองข้อมูล'], '🎉 ยินดีด้วย! คุณพิชิตครบทั้ง 50 โซน (150 ด่าน) แห่ง ServerOps: Data Center Defender แล้ว คุณคือ Grand Data Center Architect ตัวจริง!']
        ]
      }
    }
  ];

  const buildZone = window.__EXPANSION_BUILD_ZONE;
  const allNewDefs = [...(window.__EXPANSION_PART1 || []), ...EXPANSION_DEFS_PART2];
  allNewDefs.forEach((def) => {
    CAMPAIGN_ZONES.push(buildZone(def));
  });
  delete window.__EXPANSION_BUILD_ZONE;
  delete window.__EXPANSION_PART1;
})();
