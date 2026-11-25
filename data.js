/* ServerOps: Data Center Defender — Full RPG Curriculum & Game Data */

const CATEGORIES = {
  fundamentals: 'พื้นฐาน Server OS & สถาปัตยกรรม',
  hardware: 'ฮาร์ดแวร์ Server, VM & Container',
  storage: 'ระบบจัดเก็บข้อมูล RAID & File System',
  network: 'เครือข่าย พอร์ต DNS & DHCP',
  users: 'ผู้ใช้ กลุ่ม สิทธิ์ & Active Directory',
  cli: 'คำสั่งจัดการระบบ (Linux & Windows CLI)',
  security: 'ความปลอดภัย Firewall, SSH & Logs',
  backup: 'การสำรองข้อมูล & กู้คืนภัยพิบัติ (DR)',
  cloud: 'Docker, Cloud & ระบบอัตโนมัติ',
  forensics: 'วิเคราะห์ Log, สมรรถนะ & รับมือเหตุการณ์'
};

const AVATARS = [
  { id: 'avatar1', name: 'Kai', role: 'Net-Runner', src: 'assets/avatars/avatar1.jpg' },
  { id: 'avatar2', name: 'Hana', role: 'Cloud Dev', src: 'assets/avatars/avatar2.jpg' },
  { id: 'avatar3', name: 'NOVA-09', role: 'AI Core', src: 'assets/avatars/avatar3.jpg' },
  { id: 'avatar4', name: 'Ren', role: 'Kitsune Ops', src: 'assets/avatars/avatar4.jpg' },
  { id: 'avatar5', name: 'Sora', role: 'Sec Paladin', src: 'assets/avatars/avatar5.jpg' },
  { id: 'avatar6', name: 'Sensei Ken', role: 'Architect', src: 'assets/avatars/avatar6.jpg' }
];

const LEGACY_AVATAR_MAP = {
  '👨‍💻': 'avatar1',
  '👩‍💻': 'avatar2',
  '🤖': 'avatar3',
  '🦊': 'avatar4',
  '🛡️': 'avatar5',
  '⚡': 'avatar6'
};

function resolveAvatar(val) {
  const mappedId = LEGACY_AVATAR_MAP[val] || val;
  return AVATARS.find((a) => a.id === mappedId) || AVATARS[0];
}

const RANKS = [
  { minXp: 0, title: 'Rookie Technician' },
  { minXp: 250, title: 'Junior SysAdmin' },
  { minXp: 650, title: 'Server Operator' },
  { minXp: 1200, title: 'Network & CLI Specialist' },
  { minXp: 1900, title: 'Senior Systems Engineer' },
  { minXp: 2800, title: 'Virtualization Architect' },
  { minXp: 3900, title: 'Cloud & Security Specialist' },
  { minXp: 5200, title: 'Principal Infrastructure Lead' },
  { minXp: 6800, title: 'Grand Data Center Architect' },
  { minXp: 8500, title: 'Legend of Infrastructure' }
];

const SHOP_ITEMS = [
  {
    id: 'shield',
    icon: '🛡️',
    name: 'UPS Power Shield',
    price: 60,
    desc: 'สร้างเกราะป้องกันความเสียหาย 1 ครั้งเมื่อตอบผิดในฉากต่อสู้ (ไม่เสีย Server HP)'
  },
  {
    id: 'hint',
    icon: '💡',
    name: 'NOVA-OS AI Scan',
    price: 50,
    desc: 'สแกนตัดตัวเลือกที่ผิดออก 2 ข้อทันทีในฉากต่อสู้ (50/50)'
  },
  {
    id: 'heal',
    icon: '💊',
    name: 'Hot-Swap Repair Kit',
    price: 75,
    desc: 'เปลี่ยนอะไหล่ด่วน ฟื้นฟู Server HP กลับมาเต็มหลอดทันทีระหว่างสู้บอส'
  },
  {
    id: 'boost',
    icon: '⚡',
    name: 'Overclock XP Boost',
    price: 90,
    desc: 'เปิดใช้งานคูณ XP และเหรียญ x2 เมื่อชนะด่านแคมเปญถัดไป'
  },
  {
    id: 'warp_pass',
    icon: '🌀',
    name: 'Dimensional Zone Warp Pass',
    price: 350,
    maxBuy: 1,
    desc: 'ตั๋ววาร์ปข้ามมิติ! ใช้ปลดล็อกข้ามไปยังโซนที่ยังล็อกอยู่ได้ 1 โซนทันทีเพื่อปราบมอนสเตอร์และบอสประจำโซน (จำกัดซื้อได้เพียง 1 ครั้งต่อบัญชี)'
  }
];

const BADGES = [
  { id: 'first_blood', emoji: '⚔️', name: 'ภารกิจแรกสำเร็จ', desc: 'ชนะด่านในแคมเปญครั้งแรก' },
  { id: 'zone1_clear', emoji: '🖥️', name: 'ผู้เชี่ยวชาญฮาร์ดแวร์', desc: 'พิชิตบอสโซน 1 (Hardware & Core)' },
  { id: 'zone2_clear', emoji: '🌐', name: 'เจ้าแห่งเครือข่าย', desc: 'พิชิตบอสโซน 2 (Network Hub)' },
  { id: 'zone3_clear', emoji: '🔐', name: 'ผู้พิทักษ์สิทธิ์', desc: 'พิชิตบอสโซน 3 (Identity Vault)' },
  { id: 'zone4_clear', emoji: '⌨️', name: 'จอมยุทธ์ Dual-OS', desc: 'พิชิตบอสโซน 4 (Command Deck)' },
  { id: 'zone5_clear', emoji: '🛡️', name: 'ปราการเหล็กไซเบอร์', desc: 'พิชิตบอสโซน 5 (Defense Bunker)' },
  { id: 'final_boss', emoji: '👑', name: 'ผู้กอบกู้ศูนย์ข้อมูล (โซน 6)', desc: 'พิชิตบอสโซน 6 (Blackout Overlord)' },
  { id: 'zone7_clear', emoji: '🐳', name: 'กัปตัน Docker & Cloud (โซน 7)', desc: 'พิชิตบอสโซน 7 (Cloud & Automation)' },
  { id: 'zone8_clear', emoji: '🔍', name: 'ยอดนักสืบไซเบอร์ (โซน 8)', desc: 'พิชิตบอสโซน 8 (Enterprise Forensics)' },
  { id: 'zone9_clear', emoji: '⚡', name: 'จ้าวแห่ง Boot & UEFI (โซน 9)', desc: 'พิชิตบอสโซน 9 (BIOS, UEFI & GRUB2)' },
  { id: 'zone10_clear', emoji: '🧊', name: 'ผู้คุม Hypervisor (โซน 10)', desc: 'พิชิตบอสโซน 10 (Virtualization Spire)' },
  { id: 'cli_hero', emoji: '💻', name: 'แฮกเกอร์สายขาว CLI', desc: 'ผ่านแล็บ CLI อย่างน้อย 15 แล็บ' },
  { id: 'cli_god', emoji: '🚀', name: 'ปรมาจารย์ CLI ครบสูตร', desc: 'ผ่านแล็บ Linux & Windows ครบทั้ง 30 แล็บ' },
  { id: 'port_defender', emoji: '⚡', name: 'แนวป้องกันแพ็กเก็ต', desc: 'ทำคะแนน Packet Defense ถึง 1,500' },
  { id: 'blitz_flash', emoji: '🔥', name: 'สายฟ้าแลบ Server OS', desc: 'ทำคะแนน Lightning Blitz ถึง 1,200' },
  { id: 'firewall_ace', emoji: '🧱', name: 'สถาปนิก Firewall', desc: 'ผ่านภารกิจ Firewall Rule Master ครบ 6 ด่าน' },
  { id: 'subnet_guru', emoji: '📡', name: 'เซียนคำนวณ IP & Subnet', desc: 'ผ่านภารกิจ IP & Subnet Medic ครบ 6 ด่าน' },
  { id: 'puzzle_master', emoji: '🧩', name: 'ยอดนักไขปริศนา', desc: 'ผ่านทั้ง CHMOD และ RAID อย่างน้อย 4 ด่าน' },
  { id: 'vbox_master', emoji: '💿', name: 'ปรมาจารย์ VirtualBox', desc: 'จำลองติดตั้ง OS บน VirtualBox ครบทั้ง 5 ระบบ' },
  { id: 'certified', emoji: '🎓', name: 'Certified SysAdmin', desc: 'สอบผ่าน Guild Exam ตั้งแต่ 70% ขึ้นไป' }
];

/* ==================== 6 CAMPAIGN ZONES (18 STAGES = 42 QUESTIONS) ==================== */
const CAMPAIGN_ZONES = [
  {
    id: 'z1',
    code: 'ZONE 01',
    roCode: 'prt_core01',
    roName: 'Prontera Core',
    lvRange: 'Lv.1–10',
    biome: 'biome-prontera',
    mapX: 20,
    mapY: 74,
    name: 'Hardware & Server Core',
    subtitle: 'พื้นฐาน Server OS, ฮาร์ดแวร์, Virtualization และ RAID',
    themeColor: '#38bdf8',
    icon: '🖥️',
    stages: [
      {
        id: 'z1_s1',
        title: '1-1: ปฐมบท Client-Server',
        category: 'fundamentals',
        isBoss: false,
        enemy: { name: 'Legacy P2P Drone', sprite: '🤖', hp: 100 },
        dialogue: 'NOVA-OS: ยินดีต้อนรับ SysAdmin ใหม่! ห้องแล็บ 60 เครื่องกำลังจะเปลี่ยนจาก P2P เป็นระบบศูนย์กลาง ช่วยออกแบบสถาปัตยกรรมที!',
        xp: 70,
        coins: 45,
        questions: [
          {
            context: 'องค์กรมีคอมพิวเตอร์ 80 เครื่อง ต้องการควบคุมบัญชีผู้ใช้ นโยบายความปลอดภัย และการสำรองไฟล์จากจุดเดียว',
            q: 'สถาปัตยกรรมเครือข่ายแบบใดเหมาะสมที่สุด?',
            options: [
              'Peer-to-Peer (P2P) เพราะไม่ต้องตั้งรหัสผ่าน',
              'Client-Server เพราะมีเครื่องแม่ข่ายรวมศูนย์การจัดการและให้บริการ',
              'Workgroup อิสระแยกกัน 80 เครื่องโดยไม่เชื่อมสายแลน',
              'Bluetooth Mesh เชื่อมต่อทีละคู่'
            ],
            answer: 1,
            explain: 'ระบบ Client-Server รองรับองค์กรขนาดกลาง-ใหญ่ รวมศูนย์การยืนยันตัวตน (Authentication), สิทธิ์การใช้งาน, การแชร์ไฟล์ และบริการเครือข่ายไว้ที่ Server'
          },
          {
            context: 'ผู้ดูแลระบบต้องเลือกระบบปฏิบัติการสำหรับเครื่องแม่ข่ายเว็บโอเพนซอร์สที่เสถียร ฟรี ไม่มีค่าลิขสิทธิ์ และรองรับ Long Term Support (LTS)',
            q: 'ระบบปฏิบัติการคู่ใดเป็น Linux Server OS ยอดนิยมในองค์กร?',
            options: [
              'Windows 11 Home และ macOS Sonoma',
              'Ubuntu Server LTS และ Rocky Linux / RHEL',
              'Android TV และ iPadOS',
              'MS-DOS 6.22 และ Windows ME'
            ],
            answer: 1,
            explain: 'Ubuntu Server LTS และตระกูล RHEL (Red Hat Enterprise Linux / Rocky Linux / AlmaLinux) เป็น Linux Server OS มาตรฐานอุตสาหกรรม ส่วนฝั่ง Microsoft คือ Windows Server'
          }
        ]
      },
      {
        id: 'z1_s2',
        title: '1-2: ฮาร์ดแวร์ 24/7 & Virtualization',
        category: 'hardware',
        isBoss: false,
        enemy: { name: 'Overheat Gremlin', sprite: '🔥', hp: 100 },
        dialogue: 'ผอ.เก่ง: เครื่อง Server ของเราต้องรัน 24 ชั่วโมงห้ามดับ! แถมต้องรันหลายบริการพร้อมกันบนเครื่องจริงเครื่องเดียว',
        xp: 80,
        coins: 55,
        questions: [
          {
            context: 'ในห้อง Data Center จริง มักพบคุณสมบัติฮาร์ดแวร์เฉพาะทางที่ไม่มีในเครื่อง PC บ้านทั่วไป',
            q: 'คู่ฮาร์ดแวร์ใดช่วยป้องกัน "ข้อมูลในแรมเพี้ยน" และ "เครื่องดับเมื่อเพาเวอร์ซัพพลายเสีย 1 ตัว"?',
            options: [
              'ECC RAM และ Redundant Power Supply (PSU คู่)',
              'การ์ดจอ RGB และพัดลมเคส LED',
              'แบตเตอรี่ลิเธียม และซาวด์การ์ด 7.1',
              'SSD M.2 1 ตัว และจอ 144Hz'
            ],
            answer: 0,
            explain: 'ECC (Error-Correcting Code) RAM ตรวจแก้บิตผิดพลาดในหน่วยความจำอัตโนมัติ และ Redundant PSU จ่ายไฟสำรองสลับทันทีหากเพาเวอร์ซัพพลายตัวหลักเสีย'
          },
          {
            context: 'ฝ่ายไอทีซื้อ Server จริงแรง ๆ 1 เครื่อง (CPU 64 Core, RAM 256 GB) และต้องการแบ่งรัน Web Server, AD Server และ DB Server แยก OS กันอย่างมีประสิทธิภาพสูงสุด',
            q: 'เทคโนโลยีใดที่ติดตั้งลงบนฮาร์ดแวร์โดยตรง (Bare-Metal) เพื่อสร้างเครื่องเสมือน (VM) หลายเครื่อง?',
            options: [
              'Type-1 Hypervisor เช่น VMware ESXi, Proxmox VE หรือ Microsoft Hyper-V',
              'เว็บเบราว์เซอร์ Google Chrome เปิดหลายแท็บ',
              'โปรแกรมบีบอัดไฟล์ WinRAR',
              'การลง Windows ซ้ำในโฟลเดอร์เดียวกัน'
            ],
            answer: 0,
            explain: 'Type-1 (Bare-Metal) Hypervisor รันตรงบนฮาร์ดแวร์โดยไม่ต้องผ่าน Host OS ทำให้มีประสิทธิภาพและเสถียรภาพสูงกว่า Type-2 (เช่น VirtualBox) จึงใช้ใน Data Center จริง'
          }
        ]
      },
      {
        id: 'z1_boss',
        title: '1-BOSS: RAID & Storage Colossus',
        category: 'storage',
        isBoss: true,
        enemy: { name: 'Disk-Crash Colossus', sprite: '💀', hp: 150 },
        dialogue: '⚠️ BOSS ALERT! ดิสก์ในคลังข้อมูลกำลังถูกโจมตี! จงเลือกโครงสร้าง RAID และระบบไฟล์ให้ถูกต้องเพื่อโค่น Disk-Crash Colossus!',
        xp: 120,
        coins: 90,
        questions: [
          {
            context: 'ฐานข้อมูลมีฮาร์ดดิสก์ 4 ลูก ขนาดลูกละ 2 TB และต้องการพื้นที่ใช้งานสูงถึง 6 TB พร้อมทนดิสก์เสียได้ 1 ลูก',
            q: 'ควรเลือกโครงสร้าง RAID ระดับใด?',
            options: [
              'RAID 0 (ได้ 8 TB แต่เสีย 1 ลูกข้อมูลหายหมด)',
              'RAID 5 (ได้ (N-1)=6 TB มี Parity ทนเสียได้ 1 ลูก)',
              'RAID 1 (ใช้ได้เพียง 2 ลูกคู่เดียว)',
              'ไม่ใช้ RAID เลย'
            ],
            answer: 1,
            explain: 'RAID 5 ใช้ดิสก์อย่างน้อย 3 ลูก มีความจุใช้งาน (N-1) ลูก (4-1 = 3 ลูก = 6 TB) และกระจาย Parity ทำให้ทนดิสก์เสียได้ 1 ลูก'
          },
          {
            context: 'หากเปลี่ยนโจทย์เป็นระบบคลังข้อมูลขนาดใหญ่ 6 ลูก ที่ต้องทนฮาร์ดดิสก์เสียพร้อมกันได้ถึง "2 ลูก"',
            q: 'RAID ระดับใดที่มี Dual Parity ทนดิสก์เสียพร้อมกันได้ 2 ลูก?',
            options: [
              'RAID 0',
              'RAID 1',
              'RAID 5',
              'RAID 6'
            ],
            answer: 3,
            explain: 'RAID 6 ใช้ดิสก์อย่างน้อย 4 ลูก มี Parity 2 ชุด (Dual Parity) ความจุใช้งานคือ (N-2) ลูก และทนดิสก์เสียพร้อมกันได้ถึง 2 ลูก'
          },
          {
            context: 'คุณต้องเลือก File System สำหรับเซิร์ฟเวอร์ Linux รุ่นใหม่ที่รองรับไฟล์ขนาดใหญ่ระดับ Terabyte และรองรับ Journaling ป้องกันข้อมูลพังเวลาไฟดับ',
            q: 'ข้อใดคือระบบไฟล์ (File System) มาตรฐานของ Linux Server?',
            options: [
              'FAT16 และ FAT32',
              'ext4, XFS หรือ ZFS',
              'NTFS เท่านั้น',
              'CDFS (ระบบไฟล์แผ่นซีดี)'
            ],
            answer: 1,
            explain: 'Linux Server นิยมใช้ ext4 (มาตรฐาน Ubuntu/Debian), XFS (มาตรฐาน RHEL/Rocky) หรือ ZFS (เด่นเรื่อง Snapshot และตรวจข้อมูลเสียหาย) ส่วน NTFS/ReFS เป็นของ Windows Server'
          }
        ]
      }
    ]
  },
  {
    id: 'z2',
    code: 'ZONE 02',
    roCode: 'gef_net02',
    roName: 'Geffen Net-Tower',
    lvRange: 'Lv.11–20',
    biome: 'biome-geffen',
    mapX: 44,
    mapY: 78,
    name: 'Network & Protocol Hub',
    subtitle: 'Static IP, Subnet, DHCP DORA, DNS Records และ 18 พอร์ตมาตรฐาน',
    themeColor: '#34d399',
    icon: '🌐',
    stages: [
      {
        id: 'z2_s1',
        title: '2-1: Static IP & DHCP DORA',
        category: 'network',
        isBoss: false,
        enemy: { name: 'IP-Conflict Phantom', sprite: '👾', hp: 100 },
        dialogue: 'NOVA-OS: ห้องปฏิบัติการ 200 เครื่องขึ้น IP 169.254.x.x กันหมด! รีบตรวจสอบกระบวนการ DHCP และค่า Static IP ของ Server ด่วน!',
        xp: 80,
        coins: 55,
        questions: [
          {
            context: 'เครื่องลูกข่ายเปิดขึ้นมาแล้วได้ IP 169.254.45.12 (APIPA) ซึ่งหมายความว่าติดต่อเครื่องแจก IP อัตโนมัติไม่ได้',
            q: 'กระบวนการ 4 ขั้นตอนที่เครื่อง Client ขอรับ IP จาก DHCP Server เรียกว่าอะไรตามลำดับ?',
            options: [
              'DORA: Discover → Offer → Request → Acknowledge',
              'HTTP: Header → Text → Transfer → Protocol',
              'CRUD: Create → Read → Update → Delete',
              'PING: Pack → In → Net → Gate'
            ],
            answer: 0,
            explain: 'DHCP ใช้ขั้นตอน DORA: Client ส่ง Discover หา Server → Server ส่ง Offer เสนอ IP → Client ส่ง Request ขอยืนยัน → Server ส่ง Acknowledge (ACK) อนุมัติ IP'
          },
          {
            context: 'เครือข่ายองค์กรใช้ Subnet 192.168.10.0/24 (Subnet Mask 255.255.255.0)',
            q: 'มีจำนวนหมายเลข IP ที่สามารถกำหนดให้เครื่องใช้งานได้จริง (Usable Host IPs) กี่หมายเลข และเครื่อง Server ควรใช้ IP แบบใด?',
            options: [
              '254 หมายเลข / และ Server ควรตั้งเป็น Static IP',
              '256 หมายเลข / และ Server ควรเปลี่ยน IP ทุกชั่วโมง',
              '10 หมายเลข / และไม่ต้องตั้ง Gateway',
              '1,000 หมายเลข / และใช้ IP 192.168.10.255 ให้เครื่องเว็บ'
            ],
            answer: 0,
            explain: 'Subnet /24 มีทั้งหมด 256 หมายเลข หัก Network ID (.0) และ Broadcast (.255) ออก เหลือใช้งานจริง 254 หมายเลข (.1 ถึง .254) โดย Server ต้องกำหนด Static IP เพื่อไม่ให้ IP เปลี่ยน'
          }
        ]
      },
      {
        id: 'z2_s2',
        title: '2-2: เจาะลึก DNS Records',
        category: 'network',
        isBoss: false,
        enemy: { name: 'NXDOMAIN Glitch', sprite: '🌀', hp: 100 },
        dialogue: 'ผอ.เก่ง: เว็บวิทยาลัยและอีเมลองค์กรเข้าด้วยชื่อโดเมนไม่ได้! มาตรวจสอบ DNS Record แต่ละประเภทกัน',
        xp: 85,
        coins: 60,
        questions: [
          {
            context: 'คุณต้องการผูกชื่อโดเมน www.college.ac.th ให้ชี้ไปยัง IPv4 Address 203.150.10.25 ของเครื่อง Web Server',
            q: 'ต้องสร้าง DNS Record ประเภทใด?',
            options: [
              'A Record (Address Record สำหรับ IPv4)',
              'MX Record (Mail Exchanger)',
              'PTR Record (Reverse DNS)',
              'TXT Record (ข้อความทั่วไป)'
            ],
            answer: 0,
            explain: 'A Record แปลงชื่อโดเมนเป็น IPv4 (ส่วน AAAA Record ใช้กับ IPv6), CNAME ใช้ทำชื่อนามแฝง (Alias), และ MX Record ใช้ระบุ Mail Server'
          },
          {
            context: 'หากอีเมลที่ส่งมายัง user@college.ac.th ตีกลับทั้งหมดเพราะระบบไม่รู้ว่าจะส่งเมลไปที่ Mail Server เครื่องใด',
            q: 'ผู้ดูแลระบบต้องตรวจสอบและตั้งค่า DNS Record ประเภทใด?',
            options: [
              'MX Record (Mail Exchanger)',
              'AAAA Record',
              'DHCP Scope',
              'RAID Parity'
            ],
            answer: 0,
            explain: 'MX (Mail Exchanger) Record ทำหน้าที่ชี้บอกว่า Mail Server เครื่องใดรับผิดชอบรับอีเมลของโดเมนนั้น พร้อมค่า Priority'
          }
        ]
      },
      {
        id: 'z2_boss',
        title: '2-BOSS: Port Storm Hydra',
        category: 'network',
        isBoss: true,
        enemy: { name: 'Port-Storm Hydra', sprite: '🐙', hp: 160 },
        dialogue: '⚠️ BOSS ALERT! Port-Storm Hydra ส่งแพ็กเก็ตหลากโปรโตคอลถล่มเกตเวย์! แยกแยะพอร์ตและโปรโตคอลให้แม่นยำ!',
        xp: 130,
        coins: 100,
        questions: [
          {
            context: 'ทราฟฟิกชุดแรกต้องการเชื่อมต่อ "ฐานข้อมูล MySQL" และ "รีโมทหน้าจอ Windows Server" จากเครือข่ายฝ่ายไอที',
            q: 'คู่หมายเลขพอร์ตมาตรฐานใดตรงกับบริการทั้งสอง?',
            options: [
              '3306 (MySQL) และ 3389 (RDP)',
              '80 (HTTP) และ 25 (SMTP)',
              '21 (FTP) และ 23 (Telnet)',
              '53 (DNS) และ 123 (NTP)'
            ],
            answer: 0,
            explain: 'MySQL/MariaDB ใช้พอร์ต 3306 ส่วน Windows Remote Desktop (RDP) ใช้พอร์ต 3389'
          },
          {
            context: 'เครื่องแม่ข่ายหลายเครื่องในคลัสเตอร์เวลาคลาดเคลื่อนกัน 5 นาที ทำให้ระบบยืนยันตัวตน Kerberos ใน Active Directory ล้มเหลว!',
            q: 'ต้องเปิดใช้งานบริการเทียบเวลามาตรฐานใด และใช้พอร์ตหมายเลขใด?',
            options: [
              'NTP (Network Time Protocol) — พอร์ต 123 (UDP)',
              'FTP — พอร์ต 21',
              'POP3 — พอร์ต 110',
              'SMB — พอร์ต 445'
            ],
            answer: 0,
            explain: 'NTP (UDP Port 123) ใช้ซิงค์เวลาเครื่องแม่ข่ายทุกเครื่องให้ตรงกัน ซึ่งสำคัญมากต่อ Kerberos (AD), SSL Certificate และ Log Audit'
          },
          {
            context: 'ระบบ Monitoring ต้องการดึงค่า CPU/RAM/Traffic จาก Switch และ Server อัตโนมัติ และส่งไฟล์ Log รวมศูนย์',
            q: 'โปรโตคอลคู่ใดใช้สำหรับ Network Monitoring และส่งข้อความ Log รวมศูนย์?',
            options: [
              'SNMP (พอร์ต 161) และ Syslog (พอร์ต 514)',
              'Telnet (พอร์ต 23) และ HTTP (พอร์ต 80)',
              'IMAP (พอร์ต 143) และ RDP (พอร์ต 3389)',
              'DHCP (พอร์ต 67) และ SSH (พอร์ต 22)'
            ],
            answer: 0,
            explain: 'SNMP (Port 161/162) ใช้มอนิเตอร์อุปกรณ์เครือข่ายและเซิร์ฟเวอร์ ส่วน Syslog (Port 514) ใช้ส่ง Log ไปรวมที่ Log Server'
          }
        ]
      }
    ]
  },
  {
    id: 'z3',
    code: 'ZONE 03',
    roCode: 'pay_vault03',
    roName: 'Payon Identity Vault',
    lvRange: 'Lv.21–30',
    biome: 'biome-payon',
    mapX: 74,
    mapY: 74,
    name: 'Identity & Access Vault',
    subtitle: 'Active Directory (AD DS), OU, GPO, Linux Users, chmod & chown',
    themeColor: '#a78bfa',
    icon: '🔐',
    stages: [
      {
        id: 'z3_s1',
        title: '3-1: ป้อมปราการ Active Directory',
        category: 'users',
        isBoss: false,
        enemy: { name: 'Rogue Account Mimic', sprite: '🎭', hp: 100 },
        dialogue: 'ผอ.เก่ง: พนักงานใหม่เข้ามาพร้อมกัน 40 คนใน 4 แผนก! มาจัดระเบียบบัญชีและนโยบายด้วย Windows Server Active Directory กัน',
        xp: 85,
        coins: 60,
        questions: [
          {
            context: 'บน Windows Server คุณต้องการจัดกลุ่มบัญชีผู้ใช้และเครื่องคอมพิวเตอร์ตามแผนก (เช่น บัญชี, ไอที, บุคคล) เพื่อผูกรวมนโยบายแยกแต่ละแผนก',
            q: 'โครงสร้างใดใน Active Directory ใช้จัดหมวดหมู่และผูกกับ Group Policy (GPO) ได้โดยตรง?',
            options: [
              'Organizational Unit (OU)',
              'Recycle Bin',
              'Control Panel',
              'Windows Media Player'
            ],
            answer: 0,
            explain: 'Organizational Unit (OU) เป็นภาชนะจัดระเบียบ Users/Groups/Computers ใน Domain และเป็นจุดที่ผู้ดูแลระบบนำ GPO ไปผูกเพื่อบังคับใช้นโยบาย'
          },
          {
            context: 'โปรโตคอลใดที่ Active Directory ใช้เป็นมาตรฐานในการค้นหาข้อมูลผู้ใช้ในไดเรกทอรี (Directory Query) และยืนยันตัวตน (Authentication)?',
            q: 'เลือกคู่โปรโตคอลหลักของ Active Directory Domain Services (AD DS)',
            options: [
              'LDAP (พอร์ต 389) และ Kerberos (พอร์ต 88)',
              'FTP (พอร์ต 21) และ Telnet (พอร์ต 23)',
              'POP3 (พอร์ต 110) และ IMAP (พอร์ต 143)',
              'HTTP (พอร์ต 80) และ NTP (พอร์ต 123)'
            ],
            answer: 0,
            explain: 'Active Directory อาศัย LDAP (Port 389/636) สำหรับสืบค้นข้อมูลไดเรกทอรี และ Kerberos (Port 88) สำหรับออกตั๋วยืนยันตัวตนอย่างปลอดภัย'
          }
        ]
      },
      {
        id: 'z3_s2',
        title: '3-2: Linux Users, Groups & Shadow',
        category: 'users',
        isBoss: false,
        enemy: { name: 'Privilege Escalator', sprite: '🕵️', hp: 100 },
        dialogue: 'NOVA-OS: มีคนพยายามแอบเจาะไฟล์รหัสผ่าน Linux! คุณต้องรู้ว่า Linux เก็บบัญชีและรหัสผ่านเข้ารหัสไว้ที่ไฟล์ใด',
        xp: 90,
        coins: 65,
        questions: [
          {
            context: 'บน Linux Server ข้อมูลรายชื่อผู้ใช้จะอยู่ใน /etc/passwd ซึ่งทุกคนอ่านได้ แต่รหัสผ่านที่ถูกแฮช (Hashed Password) จะถูกแยกเก็บในไฟล์ที่เฉพาะ root อ่านได้เท่านั้น',
            q: 'ไฟล์ใดบน Linux ที่เก็บรหัสผ่านแบบเข้ารหัส (Hashed Passwords)?',
            options: [
              '/etc/shadow',
              '/etc/hosts',
              '/var/www/index.html',
              '/tmp/passwords.txt'
            ],
            answer: 0,
            explain: '/etc/shadow เก็บรหัสผ่านแบบแฮชและนโยบายวันหมดอายุรหัสผ่าน โดยมีสิทธิ์จำกัดเฉพาะ root/shadow เท่านั้นเพื่อความปลอดภัย'
          },
          {
            context: 'คุณสร้างบัญชีผู้ใช้ชื่อ somchai และต้องการมอบสิทธิ์ให้สามารถรันคำสั่งผู้ดูแลระบบผ่าน sudo ได้บน Ubuntu Server',
            q: 'คำสั่งใดใช้เพิ่มผู้ใช้ somchai เข้ากลุ่ม sudo โดยไม่ลบกลุ่มเดิมที่เขาอยู่?',
            options: [
              'usermod -aG sudo somchai',
              'rm -rf /home/somchai',
              'chmod 000 somchai',
              'ping sudo somchai'
            ],
            answer: 0,
            explain: 'usermod -aG <group> <user> (-a = append เพิ่มต่อท้าย, -G = supplementary group) จะเพิ่มผู้ใช้เข้ากลุ่ม sudo โดยยังคงกลุ่มเดิมไว้ครบถ้วน'
          }
        ]
      },
      {
        id: 'z3_boss',
        title: '3-BOSS: Permission Sentinel',
        category: 'users',
        isBoss: true,
        enemy: { name: 'Rootkit Sentinel', sprite: '👹', hp: 160 },
        dialogue: '⚠️ BOSS ALERT! Rootkit Sentinel ป่วนสิทธิ์ไฟล์ทั้งเซิร์ฟเวอร์! คำนวณ chmod และ chown ให้เป๊ะเพื่อทวงคืนการควบคุม!',
        xp: 140,
        coins: 110,
        questions: [
          {
            context: 'ไฟล์กุญแจ SSH ส่วนตัว id_rsa ต้องจำกัดสิทธิ์ให้เฉพาะเจ้าของ (Owner) อ่านและเขียนได้เท่านั้น ห้ามกลุ่มและคนอื่นเข้าถึงเด็ดขาด',
            code: '-rwxrwxrwx 1 admin dev 1679 Nov 21 id_rsa',
            q: 'ต้องใช้คำสั่งใดแก้ไขสิทธิ์ของ id_rsa?',
            options: [
              'chmod 600 id_rsa',
              'chmod 777 id_rsa',
              'chmod 644 id_rsa',
              'chmod 755 id_rsa'
            ],
            answer: 0,
            explain: '600 (-rw-------) คือ Owner อ่าน+เขียน (4+2=6) ส่วน Group และ Others = 0 (ไม่มีสิทธิ์เลย) หากตั้งสิทธิ์กว้างกว่านี้ SSH จะปฏิเสธไม่ยอมใช้คีย์เพื่อความปลอดภัย'
          },
          {
            context: 'เว็บเซิร์ฟเวอร์ Nginx ทำงานภายใต้ผู้ใช้ www-data แต่โฟลเดอร์ /var/www/html ยังมีเจ้าของเป็น root ทำให้เว็บอัปโหลดไฟล์ไม่ได้',
            q: 'คำสั่งใดใช้เปลี่ยน "เจ้าของไฟล์และกลุ่มเจ้าของ" ของโฟลเดอร์ /var/www/html ทั้งหมดให้เป็น www-data?',
            options: [
              'chown -R www-data:www-data /var/www/html',
              'df -h /var/www/html',
              'ufw allow www-data',
              'cat /var/www/html'
            ],
            answer: 0,
            explain: 'chown (Change Owner) ใช้เปลี่ยนเจ้าของและกลุ่ม โดยออปชัน -R (Recursive) จะเปลี่ยนรวมทุกไฟล์และโฟลเดอร์ย่อยข้างในด้วย'
          },
          {
            context: 'เมื่อกำหนดสิทธิ์แชร์โฟลเดอร์บน Windows Server โดยตั้ง Share Permission = Full Control แต่ตั้ง NTFS Permission = Read Only',
            q: 'เมื่อผู้ใช้เชื่อมต่อผ่านเครือข่ายเข้ามา สิทธิ์ที่มีผลบังคับใช้จริง (Effective Permission) คืออะไร?',
            options: [
              'Read Only (ยึดสิทธิ์ที่เข้มงวดกว่าเสมอเมื่อ Share กับ NTFS รวมกัน)',
              'Full Control (ยึดสิทธิ์ที่กว้างกว่าเสมอ)',
              'สามารถลบโฟลเดอร์ได้แต่เปิดอ่านไม่ได้',
              'กลายเป็น Domain Admin อัตโนมัติ'
            ],
            answer: 0,
            explain: 'กฎสำคัญของ Windows File Server: เมื่อเข้าผ่าน Network Share ระบบจะนำ Share Permission มาตัดกับ NTFS Permission แล้วเลือก "สิทธิ์ที่เข้มงวดที่สุด (Most Restrictive)"'
          }
        ]
      }
    ]
  },
  {
    id: 'z4',
    code: 'ZONE 04',
    roCode: 'moc_cli04',
    roName: 'Morroc CLI Desert',
    lvRange: 'Lv.31–45',
    biome: 'biome-morroc',
    mapX: 82,
    mapY: 47,
    name: 'Linux & Windows Command Deck',
    subtitle: 'systemd, Process, Disk/RAM Monitoring, Logs และ Windows PowerShell',
    themeColor: '#fbbf24',
    icon: '⌨️',
    stages: [
      {
        id: 'z4_s1',
        title: '4-1: คุมบริการ & Process บน Linux',
        category: 'cli',
        isBoss: false,
        enemy: { name: 'Zombie Process Swarm', sprite: '🧟', hp: 100 },
        dialogue: 'NOVA-OS: CPU พุ่ง 100% และบริการเว็บค้าง! ใช้คำสั่งจัดการ Service และ Process บน Linux Server แก้ไขสถานการณ์ด่วน!',
        xp: 90,
        coins: 65,
        questions: [
          {
            context: 'หลังแก้ไขไฟล์ตั้งค่า /etc/nginx/nginx.conf คุณต้องการสั่งให้บริการ nginx โหลดค่าใหม่และเปิดทำงานอัตโนมัติทุกครั้งที่บูตเครื่อง',
            q: 'คำสั่งใดใช้ตรวจสอบสถานะและสั่งรีสตาร์ทบริการบน systemd?',
            options: [
              'systemctl restart nginx และ systemctl enable nginx',
              'ipconfig /flushdns nginx',
              'mkdir -p nginx',
              'apt purge nginx'
            ],
            answer: 0,
            explain: 'systemctl restart ใช้รีสตาร์ทบริการทันทีหลังแก้คอนฟิก ส่วน systemctl enable ตั้งให้บริการเริ่มอัตโนมัติเมื่อเปิดเครื่อง'
          },
          {
            context: 'เครื่องแม่ข่ายทำงานช้าผิดปกติ คุณต้องการดูรายการ Process ที่กำลังกิน CPU และ RAM แบบเรียลไทม์ รวมถึงดูพื้นที่ RAM ที่เหลืออยู่',
            q: 'ชุดคำสั่งใดเหมาะสำหรับตรวจสอบ Process และ RAM บน Linux Server?',
            options: [
              'top (หรือ htop) และ free -h',
              'touch และ mkdir',
              'chmod และ chown',
              'echo และ pwd'
            ],
            answer: 0,
            explain: 'top/htop แสดง Process ที่ใช้ CPU/RAM แบบเรียลไทม์, ps aux ดูรายการโปรเซสทั้งหมด และ free -h ดูหน่วยความจำ RAM/Swap แบบอ่านง่าย'
          }
        ]
      },
      {
        id: 'z4_s2',
        title: '4-2: บัญชาการ Windows PowerShell',
        category: 'cli',
        isBoss: false,
        enemy: { name: 'BlueScreen Specter', sprite: '👻', hp: 100 },
        dialogue: 'ผอ.เก่ง: สลับมาดูแลเครื่อง Windows Server Core ที่ไม่มีหน้าต่าง GUI กันบ้าง! ต้องใช้ PowerShell cmdlet จัดการให้คล่อง!',
        xp: 95,
        coins: 70,
        questions: [
          {
            context: 'คุณเพิ่งแก้ Group Policy (GPO) บน Windows Server และต้องการบังคับให้เครื่องลูกข่ายดึงนโยบายใหม่ไปใช้งานทันทีโดยไม่ต้องรอ 90 นาที',
            q: 'คำสั่งใดบน Windows CMD/PowerShell ใช้บังคับอัปเดต Group Policy ทันที?',
            options: [
              'gpupdate /force',
              'format C:',
              'chmod 755 gpo',
              'systemctl reload gpo'
            ],
            answer: 0,
            explain: 'gpupdate /force บังคับให้ Windows ดึงและประยุกต์ใช้ Group Policy ใหม่จาก Domain Controller ทันที'
          },
          {
            context: 'บน Windows PowerShell คำสั่งจะใช้โครงสร้างแบบ Verb-Noun (กริยา-คำนาม) เช่น Get-Service, Restart-Service',
            q: 'หากต้องการทดสอบว่าเครื่อง Server ปลายทาง 192.168.10.20 เปิดพอร์ต 443 หรือไม่บน PowerShell ใช้คำสั่งใด?',
            options: [
              'Test-NetConnection 192.168.10.20 -Port 443',
              'Delete-Port 443',
              'Show-Wallpaper 443',
              'ufw allow 443'
            ],
            answer: 0,
            explain: 'Test-NetConnection (ชื่อย่อ tnc) เป็นคำสั่ง PowerShell ที่ยอดเยี่ยมมากสำหรับทดสอบ Ping และทดสอบการเชื่อมต่อพอร์ต TCP ของเซิร์ฟเวอร์ปลายทาง'
          }
        ]
      },
      {
        id: 'z4_boss',
        title: '4-BOSS: Kernel Panic Automaton',
        category: 'cli',
        isBoss: true,
        enemy: { name: 'Kernel-Panic Mech', sprite: '🦾', hp: 170 },
        dialogue: '⚠️ BOSS ALERT! Kernel-Panic Mech บุกลานคำสั่ง! วิเคราะห์ Log, พื้นที่ดิสก์ และแพ็กเกจซอฟต์แวร์เพื่อหยุดมัน!',
        xp: 150,
        coins: 120,
        questions: [
          {
            context: 'บริการ nginx เปิดไม่ขึ้น คุณต้องการอ่านข้อความ Error Log ล่าสุดของบริการ nginx จากระบบ systemd',
            q: 'คำสั่งใดใช้ดู Log ของบริการ systemd และไฟล์ Log ระบบหลักบน Linux เก็บอยู่ที่โฟลเดอร์ใด?',
            options: [
              'journalctl -u nginx / โฟลเดอร์ Log หลักอยู่ที่ /var/log',
              'df -h nginx / โฟลเดอร์ Log อยู่ที่ /bin',
              'useradd nginx / โฟลเดอร์ Log อยู่ที่ /boot',
              'ping nginx / โฟลเดอร์ Log อยู่ที่ /dev'
            ],
            answer: 0,
            explain: 'journalctl -u <service> ใช้ดู Log ของ service ใน systemd และไฟล์ Log ของโปรแกรมต่าง ๆ บน Linux จะรวมไว้ที่ /var/log (เช่น /var/log/syslog, /var/log/auth.log)'
          },
          {
            context: 'ดิสก์ /var เต็ม 99% คุณใช้ df -h เห็นพาร์ติชันเต็มแล้ว แต่อยากรู้ว่า "โฟลเดอร์ย่อยไหนใน /var กินพื้นที่มากที่สุด"',
            q: 'คำสั่งใดใช้สรุปขนาดพื้นที่ของแต่ละโฟลเดอร์แบบอ่านง่าย?',
            options: [
              'du -sh /var/*',
              'whoami /var/*',
              'nslookup /var/*',
              'hostname /var/*'
            ],
            answer: 0,
            explain: 'df -h ดูพื้นที่ว่างทั้งพาร์ติชัน ส่วน du -sh (Disk Usage, -s summary, -h human-readable) ใช้หาว่าโฟลเดอร์หรือไฟล์ใดกินพื้นที่มากที่สุด'
          },
          {
            context: 'คุณต้องการอัปเดตรายการแพ็กเกจและติดตั้ง Security Patch ล่าสุดบน Ubuntu Server',
            q: 'คำสั่งคู่ใดถูกต้องสำหรับการอัปเดตบน Ubuntu/Debian Server?',
            options: [
              'sudo apt update && sudo apt upgrade',
              'sudo rm -rf /etc/apt',
              'ipconfig /renew',
              'chmod 777 /usr'
            ],
            answer: 0,
            explain: 'apt update จะดึงรายการแพ็กเกจล่าสุดจาก Repository ก่อน แล้ว apt upgrade จึงจะดาวน์โหลดและติดตั้งแพ็กเกจเวอร์ชันใหม่'
          }
        ]
      }
    ]
  },
  {
    id: 'z5',
    code: 'ZONE 05',
    roCode: 'alde_sec05',
    roName: 'Al De Baran Defense',
    lvRange: 'Lv.46–60',
    biome: 'biome-aldebaran',
    mapX: 54,
    mapY: 48,
    name: 'Cyber Defense & Backup Bunker',
    subtitle: 'Firewall, DMZ, SSH Hardening, SSL/TLS, 3-2-1 Backup และ Disaster Recovery',
    themeColor: '#f87171',
    icon: '🛡️',
    stages: [
      {
        id: 'z5_s1',
        title: '5-1: ปราการ Firewall & DMZ',
        category: 'security',
        isBoss: false,
        enemy: { name: 'Brute-Force Botnet', sprite: '🕷️', hp: 110 },
        dialogue: 'NOVA-OS: ตรวจพบการยิงสแกนพอร์ตและสุ่มรหัสผ่าน SSH กว่า 10,000 ครั้ง/นาที! รีบตั้งกฎ Firewall และ SSH Hardening!',
        xp: 100,
        coins: 75,
        questions: [
          {
            context: 'องค์กรมี Web Server ที่ต้องเปิดให้คนจากอินเทอร์เน็ตเข้าชม และมี Database Server ที่เก็บข้อมูลความลับภายใน',
            q: 'โซนเครือข่ายใดที่ใช้แยก Web Server สาธารณะออกจากเครือข่ายภายใน (Internal LAN) เพื่อลดความเสียหายหากเว็บถูกแฮก?',
            options: [
              'DMZ (Demilitarized Zone)',
              'Home Wi-Fi Guest',
              'Loopback 127.0.0.1',
              'USB Hub'
            ],
            answer: 0,
            explain: 'DMZ เป็นโซนกันชนระหว่างอินเทอร์เน็ตกับเครือข่ายภายใน วางเครื่องที่ต้องรับทราฟฟิกจากภายนอก (เช่น Web/Mail/DNS Proxy) โดยไม่ให้เข้าถึง Internal DB ได้โดยตรง'
          },
          {
            context: 'คุณต้องการป้องกันการโจมตี Brute-Force ที่พยายามสุ่มรหัสผ่าน SSH (พอร์ต 22) เข้าบัญชี root',
            q: 'แนวทาง SSH Hardening ใดปลอดภัยที่สุด?',
            options: [
              'ปิด PermitRootLogin, ใช้ SSH Key Authentication แทนรหัสผ่าน และติดตั้ง Fail2ban',
              'เปลี่ยนไปใช้ Telnet พอร์ต 23 แทน SSH',
              'ปิด Firewall ทั้งหมดเพื่อลดภาระ CPU',
              'ตั้งรหัสผ่าน root เป็น admin1234'
            ],
            answer: 0,
            explain: 'SSH Key + ปิดการล็อกอิน root ตรง + Fail2ban (แบน IP ที่สุ่มรหัสผิดซ้ำ ๆ) เป็นแนวปฏิบัติมาตรฐานทองคำของการป้องกัน Linux Server'
          }
        ]
      },
      {
        id: 'z5_s2',
        title: '5-2: SSL/TLS & แผนสำรองข้อมูล 3-2-1',
        category: 'backup',
        isBoss: false,
        enemy: { name: 'Data-Wiper Virus', sprite: '🦠', hp: 110 },
        dialogue: 'ผอ.เก่ง: ข้อมูลนักศึกษาและระบบการเงินต้องปลอดภัยทั้งขณะส่งผ่านเว็บ และต้องกู้คืนได้แม้เกิดไฟไหม้หรือ Ransomware!',
        xp: 105,
        coins: 80,
        questions: [
          {
            context: 'เว็บไซต์ลงทะเบียนยังขึ้น "Not Secure" (HTTP พอร์ต 80) ทำให้รหัสผ่านที่นักศึกษาพิมพ์อาจถูกดักอ่านระหว่างทาง',
            q: 'ต้องติดตั้งเทคโนโลยีใดบน Web Server เพื่อให้รับส่งข้อมูลแบบเข้ารหัส HTTPS (พอร์ต 443)?',
            options: [
              'ใบรับรอง SSL/TLS Certificate (เช่น จาก Let’s Encrypt หรือ CA)',
              'การเปลี่ยนฟอนต์เว็บไซต์เป็นตัวหนา',
              'การเปิดพอร์ต FTP 21 เพิ่ม',
              'การปิดบริการ DNS'
            ],
            answer: 0,
            explain: 'SSL/TLS Certificate ใช้เข้ารหัสการเชื่อมต่อระหว่างเบราว์เซอร์กับ Web Server (HTTPS พอร์ต 443) และยืนยันตัวตนของเว็บไซต์'
          },
          {
            context: 'ฝ่ายไอทีออกแบบแผนสำรองข้อมูลตาม "กฎ 3-2-1 Backup Rule" เพื่อป้องกันทั้งดิสก์เสียและภัยพิบัติ',
            q: 'กฎ 3-2-1 หมายถึงข้อใด?',
            options: [
              'เก็บข้อมูล 3 ชุด • บนสื่อบันทึกอย่างน้อย 2 ชนิด • เก็บนอกสถานที่ (Off-site/Cloud) อย่างน้อย 1 ชุด',
              'สำรองข้อมูล 3 เดือนครั้ง • ใช้ 2 รหัสผ่าน • เก็บในไดรฟ์ C: 1 โฟลเดอร์',
              'ใช้ RAID 0 จำนวน 3 ลูก • Windows 2 เครื่อง • แอดมิน 1 คน',
              'บีบอัด 3 รอบ • แตกไฟล์ 2 รอบ • ส่งเมล 1 ครั้ง'
            ],
            answer: 0,
            explain: '3-2-1 (และยุคใหม่ขยายเป็น 3-2-1-1-0 คือเพิ่ม 1 ชุดแบบ Offline/Immutable กัน Ransomware และ 0 Error จากการทดสอบกู้คืน)'
          }
        ]
      },
      {
        id: 'z5_boss',
        title: '5-BOSS: RansomWorm-X',
        category: 'backup',
        isBoss: true,
        enemy: { name: 'RansomWorm-X', sprite: '🐉', hp: 180 },
        dialogue: '⚠️ BOSS ALERT! RansomWorm-X บุกเข้ารหัสไฟล์ในเซิร์ฟเวอร์! ใช้ความรู้เรื่อง Backup Types และ RTO/RPO กอบกู้ระบบ!',
        xp: 160,
        coins: 130,
        questions: [
          {
            context: 'องค์กรทำ Full Backup ทุกวันอาทิตย์ และต้องการแบ็กอัปวันจันทร์-เสาร์ให้ "ใช้เวลาและพื้นที่น้อยที่สุด" โดยเก็บเฉพาะไฟล์ที่เปลี่ยนแปลงนับจากครั้งก่อนหน้า',
            q: 'รูปแบบ Backup ใดตรงกับความต้องการนี้?',
            options: [
              'Incremental Backup',
              'Full Backup ทุกวัน',
              'RAID 0 Striping',
              'Disk Defragmentation'
            ],
            answer: 0,
            explain: 'Incremental Backup เร็วและประหยัดพื้นที่ที่สุด แต่ตอนกู้คืนต้องใช้ Full ล่าสุด + Incremental ทุกชุดเรียงลำดับ ส่วน Differential กู้คืนเร็วกว่า (ใช้ Full + Differential ล่าสุด) แต่กินพื้นที่เพิ่มทุกวัน'
          },
          {
            context: 'ผู้บริหารกำหนดเงื่อนไข Disaster Recovery ว่า "ระบบต้องกู้กลับมาออนไลน์ภายใน 2 ชั่วโมง" และ "ยอมรับข้อมูลสูญหายย้อนหลังได้ไม่เกิน 15 นาที"',
            q: 'ตัวชี้วัดคู่ใดตรงกับ "ระยะเวลากู้คืน (2 ชม.)" และ "จุดข้อมูลที่ยอมเสียได้ (15 นาที)" ตามลำดับ?',
            options: [
              'RTO (Recovery Time Objective) และ RPO (Recovery Point Objective)',
              'CPU และ GPU',
              'DNS และ DHCP',
              'RAM และ ROM'
            ],
            answer: 0,
            explain: 'RTO = ระยะเวลาสูงสุดที่ยอมให้ระบบล่มได้ก่อนกู้กลับมา (2 ชม.) ส่วน RPO = ช่วงเวลาข้อมูลย้อนหลังสูงสุดที่ยอมให้สูญหายได้ (15 นาที → ต้องสำรอง/Replicate ทุก 15 นาที)'
          },
          {
            context: 'มีคนเถียงว่า "เราทำ RAID 10 แล้ว ไม่ต้องทำ Backup ก็ได้!"',
            q: 'เหตุใดคำกล่าว "RAID ไม่ใช่ Backup (RAID is NOT a Backup)" จึงเป็นความจริงสำคัญสำหรับ SysAdmin?',
            options: [
              'เพราะ RAID กันได้แค่ฮาร์ดดิสก์เสีย แต่ถ้าเผลอลบไฟล์ โดน Ransomware หรือไฟไหม้ ข้อมูลจะพังพร้อมกันทุกดิสก์',
              'เพราะ RAID เก็บได้เฉพาะไฟล์รูปภาพเท่านั้น',
              'เพราะ RAID ใช้กับ Windows Server ไม่ได้',
              'เพราะ RAID ช้ากว่าแผ่นฟลอปปี้ดิสก์'
            ],
            answer: 0,
            explain: 'RAID ช่วยเรื่องความพร้อมใช้งาน (Availability) เมื่อดิสก์พัง แต่เมื่อไฟล์ถูกลบหรือถูกเข้ารหัสจาก Ransomware ระบบจะเขียนทับไปยังทุกดิสก์ทันที จึงต้องมี Offline/Off-site Backup เสมอ'
          }
        ]
      }
    ]
  },
  {
    id: 'z6',
    code: 'FINAL ZONE',
    roCode: 'gl_black06',
    roName: 'Glast Heim Blackout',
    lvRange: 'Lv.61–75',
    biome: 'biome-glastheim',
    mapX: 22,
    mapY: 44,
    name: 'Data Center Blackout Crisis',
    subtitle: 'ภารกิจรวมทุกศาสตร์! โค่น Final Boss กอบกู้ศูนย์ข้อมูลระดับประเทศ',
    themeColor: '#f472b6',
    icon: '👑',
    stages: [
      {
        id: 'z6_s1',
        title: '6-1: แนวรบ Container & Load Balancer',
        category: 'hardware',
        isBoss: false,
        enemy: { name: 'DDoS Overload Core', sprite: '⚡', hp: 130 },
        dialogue: 'NOVA-OS: ผู้ใช้งานพร้อมกันพุ่งเป็น 50,000 คน! เซิร์ฟเวอร์เครื่องเดียวรับไม่ไหวแล้ว ต้องใช้ High Availability & Container!',
        xp: 120,
        coins: 95,
        questions: [
          {
            context: 'เว็บประกาศผลสอบมีคนเข้าพร้อมกันจำนวนมากจน Web Server 1 เครื่องล่ม คุณจึงติดตั้ง Web Server 3 เครื่องทำงานคู่กัน',
            q: 'อุปกรณ์หรือซอฟต์แวร์ใดทำหน้าที่กระจายทราฟฟิกให้ Web Server ทั้ง 3 เครื่องอย่างสมดุล และตัดเครื่องที่ล่มออกอัตโนมัติ?',
            options: [
              'Load Balancer (เช่น Nginx, HAProxy หรือ Cloud Load Balancer)',
              'เครื่องพิมพ์เลเซอร์เครือข่าย',
              'DHCP Client',
              'สาย HDMI Splitter'
            ],
            answer: 0,
            explain: 'Load Balancer ช่วยกระจายภาระงาน (Load Distribution) และทำ Health Check เพื่อให้ได้ High Availability (HA) แม้เซิร์ฟเวอร์บางเครื่องจะล่ม ระบบก็ยังให้บริการต่อได้'
          },
          {
            context: 'ทีมพัฒนาต้องการแพ็กเกจแอปพลิเคชันเว็บให้เปิดทำงานเร็วภายในไม่กี่วินาทีและกินทรัพยากรน้อยกว่าการสร้าง VM เต็มรูปแบบ',
            q: 'ข้อใดคือความแตกต่างหลักระหว่าง Container (เช่น Docker) กับ Virtual Machine (VM)?',
            options: [
              'Container แชร์ Kernel ของ Host OS จึงเบาและเริ่มทำงานเร็วกว่า ส่วน VM จำลองทั้งฮาร์ดแวร์และ Guest OS แยกเต็มระบบ',
              'Container ต้องใช้ฮาร์ดดิสก์อย่างน้อย 500 GB ต่อ 1 ตัว',
              'VM ไม่ต้องใช้ CPU ในการทำงาน',
              'Container ทำงานได้เฉพาะบน Windows 95'
            ],
            answer: 0,
            explain: 'Container (Docker/Podman) แยกสภาพแวดล้อมระดับ OS-level โดยแชร์ Host Kernel จึงประหยัด RAM และเปิดได้ในเสี้ยววินาที ต่างจาก VM ที่ต้องบูต Guest OS แยกทุกตัว'
          }
        ]
      },
      {
        id: 'z6_s2',
        title: '6-2: ฉุกเฉิน! กู้ระบบ 3 ชั้นรวด',
        category: 'security',
        isBoss: false,
        enemy: { name: 'Zero-Day Shadow', sprite: '🌑', hp: 140 },
        dialogue: 'ผอ.เก่ง: ก่อนถึงห้องบอสใหญ่ ระบบแจ้งเตือนทั้งพอร์ตหลุด, Log ผิดปกติ และไฟล์คอนฟิกพัง จงวิเคราะห์อย่างมีสติ!',
        xp: 130,
        coins: 100,
        questions: [
          {
            context: 'คุณต้องการตรวจสอบว่าขณะนี้เครื่อง Linux Server กำลังเปิดพอร์ต TCP/UDP ใดรอรับการเชื่อมต่ออยู่บ้าง และโปรแกรมใดเป็นคนเปิดพอร์ตนั้น',
            q: 'คำสั่งใดให้ข้อมูล Listening Ports พร้อมชื่อ Process ได้ชัดเจนที่สุด?',
            options: [
              'sudo ss -tulnp',
              'ls -a',
              'mkdir -p ports',
              'cat /etc/hostname'
            ],
            answer: 0,
            explain: 'ss -tulnp (-t TCP, -u UDP, -l Listening, -n ตัวเลขพอร์ต, -p ชื่อ Process) เป็นคำสั่งมาตรฐานยุคใหม่แทน netstat สำหรับตรวจพอร์ตเปิดบน Linux'
          },
          {
            context: 'หลักการ CIA Triad เป็นหัวใจสำคัญของความปลอดภัยระบบเครื่องแม่ข่าย',
            q: 'ตัวอักษร C - I - A ย่อมาจากอะไร?',
            options: [
              'Confidentiality (ความลับ), Integrity (ความถูกต้องครบถ้วน), Availability (ความพร้อมใช้งาน)',
              'Computer, Internet, Antivirus',
              'CPU, IP, Admin',
              'Cloud, Interface, Access'
            ],
            answer: 0,
            explain: 'CIA Triad คือ 3 เสาหลักของความมั่นคงปลอดภัยสารสนเทศ: รักษาความลับ (C), ข้อมูลไม่ถูกปลอมแปลงแก้ไข (I), และระบบพร้อมให้บริการเสมอ (A)'
          }
        ]
      },
      {
        id: 'z6_boss',
        title: 'FINAL BOSS: Blackout Overlord',
        category: 'cli',
        isBoss: true,
        enemy: { name: 'BLACKOUT OVERLORD', sprite: '👾👑', hp: 250 },
        dialogue: '🚨 FINAL BOSS! BLACKOUT OVERLORD กำลังจะปิดศูนย์ข้อมูลทั้งหมด! ตอบให้แม่นยำทั้ง 4 ขั้นตอนเพื่อกอบกู้ Data Center แห่งชาติ!',
        xp: 250,
        coins: 200,
        questions: [
          {
            context: '[Phase 1 — Network] ผู้ใช้เข้าเว็บไม่ได้ แต่ ping IP 203.150.10.25 เจอปกติ ขณะที่ nslookup ล้มเหลว',
            q: 'ต้องเร่งกู้บริการใดและพอร์ตใดเป็นอันดับแรก?',
            options: [
              'DNS Server (พอร์ต 53)',
              'FTP Server (พอร์ต 21)',
              'SMTP Server (พอร์ต 25)',
              'RDP (พอร์ต 3389)'
            ],
            answer: 0,
            explain: 'Ping ด้วย IP ได้แต่แปลงชื่อไม่ได้ คืออาการคลาสสิกของ DNS Server (พอร์ต 53) ขัดข้อง'
          },
          {
            context: '[Phase 2 — Linux Permissions] พบไฟล์สคริปต์ระบบสำคัญ /opt/recovery.sh ถูกลดสิทธิ์เหลือ 000 จนรันไม่ได้',
            q: 'คำสั่งใดตั้งสิทธิ์ให้ Owner อ่าน-เขียน-รัน และ Group/Others อ่าน-รันได้ (-rwxr-xr-x)?',
            options: [
              'chmod 755 /opt/recovery.sh',
              'chmod 600 /opt/recovery.sh',
              'chmod 444 /opt/recovery.sh',
              'chmod 777 /opt/recovery.sh'
            ],
            answer: 0,
            explain: '755 = Owner(rwx=7), Group(r-x=5), Others(r-x=5) ปลอดภัยและเหมาะกับสคริปต์ระบบ'
          },
          {
            context: '[Phase 3 — Firewall] ระบบกู้เว็บกลับมาแล้ว แต่ต้องบล็อกพอร์ตอันตรายทั้งหมดและเปิดเฉพาะ SSH(22) กับ HTTPS(443)',
            q: 'ลำดับแนวคิด Firewall ที่ถูกต้องบน Ubuntu UFW คือข้อใด?',
            options: [
              'ufw default deny incoming → ufw allow 22 → ufw allow 443 → ufw enable',
              'ufw default allow incoming → ufw deny 22',
              'ufw disable เพื่อให้เข้าเว็บง่ายที่สุด',
              'ufw allow 23 เพื่อเปิด Telnet'
            ],
            answer: 0,
            explain: 'ต้องเปิดพอร์ต SSH (22) ก่อนเปิด ufw enable เสมอ เพื่อไม่ให้เผลอตัดการเชื่อมต่อ SSH ของตัวเอง!'
          },
          {
            context: '[Phase 4 — Final Strike: Disaster Recovery] ข้อมูลฐานข้อมูลหลักถูกโจมตี แต่เรามี Backup 3-2-1 แบบ Full วันอาทิตย์ + Differential ทุกวัน (วันนี้วันพฤหัสฯ)',
            q: 'ต้องใช้ชุดข้อมูลใดบ้างในการ Restore ฐานข้อมูลให้กลับมาสมบูรณ์เร็วที่สุด?',
            options: [
              'Full Backup วันอาทิตย์ + Differential Backup ล่าสุด (วันพุธ) เพียง 2 ชุดเท่านั้น',
              'Full Backup วันอาทิตย์ + ไฟล์ทุกวันตั้งแต่วันจันทร์ถึงพุธครบทุกชุด',
              'ใช้เพียง RAID 0 ก็กู้ไฟล์ที่ถูกไวรัสเข้ารหัสได้',
              'ไม่สามารถกู้คืนได้ ต้องพิมพ์ข้อมูลใหม่ทั้งหมด'
            ],
            answer: 0,
            explain: 'จุดเด่นของ Differential Backup คือเก็บทุกอย่างที่เปลี่ยนนับจาก Full ล่าสุด ดังนั้นเวลา Restore ใช้แค่ Full ล่าสุด + Differential ชุดล่าสุดเพียง 2 ชุด!'
          }
        ]
      }
    ]
  },
  {
    id: 'z7',
    code: 'ZONE 07',
    roCode: 'yuno_cld07',
    roName: 'Juno Cloud Sky-City',
    lvRange: 'Lv.76–90',
    biome: 'biome-juno',
    mapX: 34,
    mapY: 19,
    name: 'Cloud, Docker & Automation Forge',
    subtitle: 'Docker Container, Cron Job Automation, Reverse Proxy และ Cloud Computing',
    themeColor: '#22d3ee',
    icon: '🐳',
    stages: [
      {
        id: 'z7_s1',
        title: '7-1: โรงงาน Docker Container',
        category: 'cloud',
        isBoss: false,
        enemy: { name: 'Dependency Hydra', sprite: '🐳', hp: 130 },
        dialogue: 'NOVA-OS: ทีม Dev บ่นว่า "รันบนเครื่องผมได้ แต่ขึ้น Server พัง!" มาแก้ปัญหาด้วย Docker Container กันเถอะ!',
        xp: 125,
        coins: 95,
        questions: [
          {
            context: 'คุณต้องการสร้างและรันเว็บเซิร์ฟเวอร์ Nginx จาก Docker Image โดยแมปพอร์ต 8080 บนเครื่องโฮสต์เข้ากับพอร์ต 80 ใน Container และให้ทำงานเบื้องหลัง',
            code: 'docker run -d -p 8080:80 --name myweb nginx',
            q: 'ออปชัน -d และ -p 8080:80 ในคำสั่งข้างต้นหมายถึงอะไร?',
            options: [
              '-d = Detached (รันเบื้องหลัง) • -p 8080:80 = แมปพอร์ต 8080 ของโฮสต์เข้าสู่พอร์ต 80 ใน Container',
              '-d = Delete ลบทิ้งทันที • -p 8080:80 = ตั้งรหัสผ่านเป็น 8080',
              '-d = Download Windows • -p = ปิดเครื่องอัตโนมัติ',
              '-d = Format Disk • -p = เปิดพอร์ตทั้งหมด 8080 พอร์ต'
            ],
            answer: 0,
            explain: '-d (Detached mode) ให้ Container ทำงานเบื้องหลัง และ -p HostPort:ContainerPort ใช้เชื่อมพอร์ตภายนอกเข้ากับบริการใน Container'
          },
          {
            context: 'ข้อมูลในฐานข้อมูลที่รันอยู่ใน Docker Container จะหายไปหาก Container ถูกลบและสร้างใหม่',
            q: 'ฟีเจอร์ใดของ Docker ที่ใช้เก็บข้อมูลให้คงอยู่ถาวร (Persistent Data) แม้ Container จะถูกลบหรืออัปเดต?',
            options: [
              'Docker Volume (หรือ Bind Mount)',
              'RAM Cache ชั่วคราว',
              'คำสั่ง docker rm -f',
              'การปิดเครื่องแล้วเปิดใหม่'
            ],
            answer: 0,
            explain: 'Docker Volume เก็บข้อมูลแยกไว้ภายนอก Lifecycle ของ Container ทำให้ข้อมูลฐานข้อมูลและไฟล์อัปโหลดยังคงอยู่ถาวรแม้จะอัปเกรด Container'
          }
        ]
      },
      {
        id: 'z7_s2',
        title: '7-2: ตั้งเวลางานอัตโนมัติ (Cron & Script)',
        category: 'cloud',
        isBoss: false,
        enemy: { name: 'Manual-Task Golem', sprite: '⏰', hp: 135 },
        dialogue: 'ผอ.เก่ง: แอดมินมืออาชีพไม่ตื่นตี 2 มารันสคริปต์ Backup เองทุกคืน! มาตั้งเวลาทำงานอัตโนมัติด้วย Cron Job กัน!',
        xp: 130,
        coins: 100,
        questions: [
          {
            context: 'บน Linux Server คำสั่ง crontab ใช้ตั้งเวลารันงานอัตโนมัติ โดยมีช่องเวลา 5 ช่องเรียงลำดับ: นาที ชั่วโมง วันที่ เดือน วันในสัปดาห์',
            code: '0 2 * * * /opt/backup.sh',
            q: 'ตารางเวลา "0 2 * * *" สั่งให้สคริปต์ /opt/backup.sh ทำงานเมื่อใด?',
            options: [
              'ทุกวัน เวลา 02:00 น. (ตีสองตรง)',
              'ทุก ๆ 2 นาทีตลอดทั้งวัน',
              'เฉพาะวันที่ 2 กุมภาพันธ์ของทุกปี',
              'ทุกวันอังคาร เวลา 00:00 น.'
            ],
            answer: 0,
            explain: 'ช่องที่ 1 = นาทีที่ 0, ช่องที่ 2 = ชั่วโมงที่ 2 (02:00), อีก 3 ช่องเป็น * (ทุกวัน ทุกเดือน ทุกวันในสัปดาห์) ดังนั้นคือทุกวันเวลา 02:00 น.'
          },
          {
            context: 'องค์กรมี Linux Server 50 เครื่องและต้องการติดตั้งแพ็กเกจ + แก้ไฟล์ตั้งค่าเหมือนกันทั้ง 50 เครื่องอย่างอัตโนมัติโดยเขียนเป็นไฟล์ YAML',
            q: 'เครื่องมือ Automation / Configuration Management ใดนิยมใช้จัดการเซิร์ฟเวอร์จำนวนมากผ่าน SSH?',
            options: [
              'Ansible',
              'Microsoft Paint',
              'Notepad',
              'Calculator'
            ],
            answer: 0,
            explain: 'Ansible เป็นเครื่องมือ IT Automation แบบ Agentless ที่สั่งงานผ่าน SSH เพื่อติดตั้งและตั้งค่าเซิร์ฟเวอร์หลายสิบถึงหลายพันเครื่องพร้อมกันได้อย่างแม่นยำ'
          }
        ]
      },
      {
        id: 'z7_boss',
        title: '7-BOSS: Cloud-Scale Kraken',
        category: 'cloud',
        isBoss: true,
        enemy: { name: 'Cloud-Scale Kraken', sprite: '🦑⚡', hp: 200 },
        dialogue: '⚠️ BOSS ALERT! Cloud-Scale Kraken ปั่นทราฟฟิกระดับ Cloud! จงแยกแยะโมเดล IaaS/PaaS/SaaS และ Reverse Proxy ให้ขาด!',
        xp: 180,
        coins: 145,
        questions: [
          {
            context: 'บริษัทต้องการเช่าเฉพาะเครื่องเสมือน (VM), พื้นที่ดิสก์ และเครือข่ายบน Cloud (เช่น AWS EC2, Google Compute Engine) โดยที่ฝ่ายไอทีเป็นผู้ลง OS และดูแลเองทั้งหมด',
            q: 'บริการ Cloud ลักษณะนี้จัดอยู่ในรูปแบบใด?',
            options: [
              'IaaS (Infrastructure as a Service)',
              'SaaS (Software as a Service)',
              'PaaS (Platform as a Service)',
              'USB as a Service'
            ],
            answer: 0,
            explain: 'IaaS ให้เช่าโครงสร้างพื้นฐาน (VM/Network/Disk) เราคุม OS เอง • PaaS ให้แพลตฟอร์มวางโค้ดได้เลยไม่ต้องคุม OS • SaaS คือแอปสำเร็จรูปพร้อมใช้เช่น Gmail/Office 365'
          },
          {
            context: 'คุณมีแอปเว็บ 3 ตัวรันอยู่หลังเครื่องเดียวบนพอร์ต 3001, 3002, 3003 แต่อยากให้ผู้ใช้เข้าผ่านโดเมน HTTPS พอร์ต 443 เดียวกันอย่างปลอดภัย',
            q: 'ควรติดตั้ง Nginx ทำหน้าที่ใดไว้ด้านหน้าแอปพลิเคชันทั้ง 3 ตัว?',
            options: [
              'Reverse Proxy (รับ HTTPS พอร์ต 443 แล้วส่งต่อให้พอร์ตภายในตามชื่อโดเมน)',
              'DHCP Client',
              'Print Spooler',
              'BIOS Firmware'
            ],
            answer: 0,
            explain: 'Reverse Proxy รับคำขอจากอินเทอร์เน็ตที่พอร์ต 443 จัดการ SSL/TLS ไว้จุดเดียว (SSL Termination) แล้วส่งต่อคำขอไปยัง Backend Services ภายในอย่างปลอดภัย'
          },
          {
            context: 'คำสั่งใดใน Docker ใช้แสดงรายการ Container ที่กำลังรันอยู่ทั้งหมด (และออปชันดูรวมตัวที่หยุดไปแล้วด้วย)?',
            q: 'เลือกคำสั่งตรวจสอบสถานะ Container ที่ถูกต้อง',
            options: [
              'docker ps (และ docker ps -a เพื่อดูทั้งหมด)',
              'docker ipconfig /all',
              'chmod 755 docker',
              'ufw status docker'
            ],
            answer: 0,
            explain: 'docker ps แสดง Container ที่กำลังทำงาน ส่วน docker ps -a แสดงรวม Container ที่หยุดทำงานแล้วด้วย'
          }
        ]
      }
    ]
  },
  {
    id: 'z8',
    code: 'ZONE 08',
    roCode: 'tha_for08',
    roName: 'Thanatos Forensics Spire',
    lvRange: 'Lv.91–99',
    biome: 'biome-thanatos',
    mapX: 68,
    mapY: 18,
    name: 'Enterprise Forensics & Performance',
    subtitle: 'สืบสวน Log, Event Viewer, จูนสมรรถนะ Server และรับมือเหตุการณ์ไซเบอร์',
    themeColor: '#fb923c',
    icon: '🔍',
    stages: [
      {
        id: 'z8_s1',
        title: '8-1: สืบสวน Log & ล่าผู้บุกรุก',
        category: 'forensics',
        isBoss: false,
        enemy: { name: 'Log-Eraser Ghost', sprite: '🕵️‍♂️', hp: 140 },
        dialogue: 'NOVA-OS: มีคนแอบพยายามล็อกอินเข้า Server ตอนตี 3! มาตรวจสอบไฟล์ Log บน Linux และ Windows Event Viewer เพื่อแกะรอยกัน!',
        xp: 135,
        coins: 105,
        questions: [
          {
            context: 'คุณสงสัยว่ามีแฮกเกอร์สุ่มรหัสผ่าน SSH เข้าเครื่อง Ubuntu Server เมื่อคืนนี้',
            q: 'ไฟล์ Log ใดบน Ubuntu/Debian ที่บันทึกประวัติการล็อกอิน SSH และการใช้คำสั่ง sudo?',
            options: [
              '/var/log/auth.log',
              '/etc/hostname',
              '/home/readme.txt',
              '/boot/grub.cfg'
            ],
            answer: 0,
            explain: 'บน Ubuntu/Debian บันทึกการยืนยันตัวตน SSH และ sudo จะอยู่ที่ /var/log/auth.log (ส่วนตระกูล RHEL/Rocky อยู่ที่ /var/log/secure)'
          },
          {
            context: 'บน Windows Server คุณเปิด Event Viewer → Security Log เพื่อตรวจสอบความพยายามล็อกอินผิดพลาดจำนวนมาก (Brute Force)',
            q: 'Windows Security Event ID หมายเลขใดหมายถึง "An account failed to log on (ล็อกอินไม่สำเร็จ)"?',
            options: [
              'Event ID 4625 (ส่วน 4624 คือล็อกอินสำเร็จ)',
              'Event ID 404',
              'Event ID 80',
              'Event ID 22'
            ],
            answer: 0,
            explain: 'Event ID 4625 = Failed Logon (สำคัญมากในการตรวจจับ Brute-Force Attack บน Windows Server) ส่วน 4624 = Successful Logon'
          }
        ]
      },
      {
        id: 'z8_s2',
        title: '8-2: จูนสมรรถนะ & แก้คอขวด Server',
        category: 'forensics',
        isBoss: false,
        enemy: { name: 'Memory-Leak Slime', sprite: '🧪', hp: 145 },
        dialogue: 'ผอ.เก่ง: เว็บช้ามากจนค้าง! มาดูกันว่าคอขวดอยู่ที่ CPU, RAM หรือ Disk I/O เพื่อแก้ให้ตรงจุด!',
        xp: 140,
        coins: 110,
        questions: [
          {
            context: 'เครื่อง Linux Server มี CPU 4 Core แต่เมื่อรันคำสั่ง uptime พบว่า Load Average อยู่ที่ 12.50, 11.80, 10.90 และ RAM เหลือ 0% จนระบบต้องสลับข้อมูลลง Swap ตลอดเวลา',
            q: 'อาการที่ RAM เต็มจนระบบเขียน-อ่านลงพื้นที่ Swap บนดิสก์อย่างหนักจนเครื่องอืดมากเรียกว่าอะไร?',
            options: [
              'Swap Thrashing (RAM ไม่เพียงพอ ควรหา Process ที่กินแรม/Memory Leak หรือเพิ่ม RAM)',
              'Load Balancing',
              'DNS Caching',
              'Static Routing'
            ],
            answer: 0,
            explain: 'เมื่อ RAM เต็ม OS จะย้ายหน่วยความจำไปไว้บนดิสก์ (Swap) ซึ่งช้ากว่า RAM หลายร้อยเท่า เกิดภาวะ Thrashing ทำให้ Load พุ่งและเครื่องตอบสนองช้ามาก'
          },
          {
            context: 'คุณต้องการเฝ้าดูไฟล์ Log ที่กำลังวิ่งเข้ามาแบบสด ๆ (Real-time) ขณะที่กำลังทดสอบแก้ปัญหา Web Server',
            q: 'คำสั่งใดบน Linux ใช้ติดตามบรรทัดใหม่ที่เขียนลงไฟล์ /var/log/nginx/error.log แบบเรียลไทม์?',
            options: [
              'tail -f /var/log/nginx/error.log',
              'rm -f /var/log/nginx/error.log',
              'mkdir -p /var/log/nginx/error.log',
              'chmod 000 /var/log/nginx/error.log'
            ],
            answer: 0,
            explain: 'tail -f (follow) แสดงบรรทัดท้ายสุดของไฟล์และอัปเดตข้อความใหม่ทันทีที่มีการเขียน Log เหมาะมากกับการไล่แก้ปัญหาหน้างาน'
          }
        ]
      },
      {
        id: 'z8_boss',
        title: '8-BOSS: APT Zero-Day Overlord',
        category: 'forensics',
        isBoss: true,
        enemy: { name: 'APT ZERO-DAY OVERLORD', sprite: '👁️🔥', hp: 260 },
        dialogue: '🚨 GRAND MASTER BOSS! APT ZERO-DAY OVERLORD แฝงตัวอยู่ในเครือข่ายองค์กร! ใช้กระบวนการ Incident Response ระดับ Enterprise โค่นมัน!',
        xp: 280,
        coins: 240,
        questions: [
          {
            context: '[Phase 1 — Containment] พบว่าเครื่อง Web Server เครื่องหนึ่งติดมัลแวร์และกำลังส่งข้อมูลออกไปข้างนอกอย่างต่อเนื่อง',
            q: 'ขั้นตอน "Containment (ควบคุมและจำกัดวงความเสียหาย)" ที่ถูกต้องที่สุดทันทีที่พบเหตุคือข้อใด?',
            options: [
              'ตัดแยกเครื่องออกจากเครือข่าย (Network Isolation) แต่ยังเก็บหลักฐาน Log/Memory ไว้ตรวจสอบ',
              'รีบฟอร์แมตเครื่องทิ้งทันทีโดยไม่เก็บหลักฐานและไม่บอกใคร',
              'ปล่อยให้มัลแวร์ทำงานต่อไปจนถึงวันศุกร์ค่อยดู',
              'แจกรหัสผ่าน Admin ให้ทุกคนช่วยกันดู'
            ],
            answer: 0,
            explain: 'Containment คือหยุดการแพร่กระจายทันที (เช่น ตัด VLAN/บล็อก Firewall) โดยไม่ทำลายหลักฐานทางนิติวิทยา (Forensic Evidence) เพื่อให้รู้ต้นตอช่องโหว่'
          },
          {
            context: '[Phase 2 — SIEM] องค์กรมีเซิร์ฟเวอร์ 40 เครื่อง ต้องการรวม Log ทั้งหมดมาวิเคราะห์และแจ้งเตือนอัตโนมัติเมื่อเกิดพฤติกรรมน่าสงสัย',
            q: 'ระบบศูนย์รวมวิเคราะห์ Log และแจ้งเตือนภัยคุกคามทางไซเบอร์เรียกว่าอะไร?',
            options: [
              'SIEM (Security Information and Event Management) เช่น Wazuh, Splunk, ELK',
              'RAID Controller',
              'DHCP Scope',
              'BIOS Setup'
            ],
            answer: 0,
            explain: 'SIEM รวมศูนย์ Log จากทุก Server/Firewall มาเชื่อมโยงเหตุการณ์ (Correlation) และแจ้งเตือนผู้ดูแลระบบทันทีที่พบสัญญาณการโจมตี'
          },
          {
            context: '[Phase 3 — Final Blow] หลังกำจัดมัลแวร์ อุดช่องโหว่ และกู้ระบบจาก Clean Backup กลับมาออนไลน์สำเร็จแล้ว',
            q: 'ขั้นตอนสุดท้ายของ Incident Response (Lessons Learned) มีเป้าหมายเพื่ออะไร?',
            options: [
              'สรุปบทเรียน หาสาเหตุรากเหง้า (Root Cause) และปรับปรุงระบบป้องกันไม่ให้เกิดซ้ำอีก',
              'ลบ Backup ทั้งหมดทิ้งเพื่อประหยัดพื้นที่',
              'ปิด Firewall ถาวรเพราะเหตุการณ์จบแล้ว',
              'เปลี่ยนรหัสผ่านทุกเครื่องกลับเป็น 123456'
            ],
            answer: 0,
            explain: 'Lessons Learned / Post-Incident Review ช่วยให้ทีมไอทีอุดจุดอ่อน ปรับปรุงคู่มือรับมือ และเสริมความแข็งแกร่งให้โครงสร้างพื้นฐานระยะยาว'
          }
        ]
      }
    ]
  }
];

/* ==================== 14 INTERACTIVE CLI LABS (10 LINUX + 4 WINDOWS POWERSHELL) ==================== */
const CLI_LABS = [
  {
    id: 'lab1',
    os: 'linux',
    title: 'L1: ตรวจสอบตัวตนและระบบ Linux',
    category: 'cli',
    xp: 50,
    coins: 35,
    goal: 'ตรวจสอบบัญชีผู้ใช้ปัจจุบันหรือข้อมูล Kernel ของเครื่องด้วย `whoami` หรือ `uname -a`',
    hint: 'พิมพ์: whoami หรือ uname -a',
    quickCmds: ['whoami', 'uname -a', 'hostname', 'help'],
    check: (cmd) => /^(whoami|uname(\s+-[a-z]+)?|hostname)$/.test(cmd.trim())
  },
  {
    id: 'lab2',
    os: 'linux',
    title: 'L2: ตรวจสอบหมายเลข IP ของเครื่อง',
    category: 'network',
    xp: 55,
    coins: 40,
    goal: 'ตรวจสอบการ์ดเครือข่ายและ Static IP บน Linux Server ด้วย `ip a` (หรือ `ip addr`)',
    hint: 'พิมพ์: ip a',
    quickCmds: ['ip a', 'ip addr', 'ping 8.8.8.8'],
    check: (cmd) => /^(ip\s+a(ddr)?|ifconfig)$/.test(cmd.trim())
  },
  {
    id: 'lab3',
    os: 'linux',
    title: 'L3: กู้คืนบริการ Web Server (Nginx)',
    category: 'cli',
    xp: 65,
    coins: 45,
    goal: 'บริการ nginx หยุดทำงานอยู่ ให้สั่งเริ่มบริการด้วย `systemctl start nginx`',
    hint: 'เช็กก่อนด้วย systemctl status nginx แล้วพิมพ์: systemctl start nginx',
    quickCmds: ['systemctl status nginx', 'systemctl start nginx', 'systemctl enable nginx'],
    check: (cmd, s) => s.services.nginx === 'active'
  },
  {
    id: 'lab4',
    os: 'linux',
    title: 'L4: ตรวจสอบพอร์ตที่กำลังเปิดฟังอยู่',
    category: 'network',
    xp: 65,
    coins: 45,
    goal: 'ตรวจสอบพอร์ต TCP/UDP ที่กำลังเปิด Listening พร้อมชื่อโปรเซสด้วย `ss -tulnp`',
    hint: 'พิมพ์: ss -tulnp (หรือ netstat -tulnp)',
    quickCmds: ['ss -tulnp', 'netstat -tulnp'],
    check: (cmd) => /^(ss|netstat)\s+-[a-z]*t[a-z]*$/.test(cmd.trim())
  },
  {
    id: 'lab5',
    os: 'linux',
    title: 'L5: ตรวจพื้นที่ดิสก์และหน่วยความจำ',
    category: 'storage',
    xp: 60,
    coins: 40,
    goal: 'ตรวจสอบพื้นที่ว่างของดิสก์ทุกพาร์ติชันแบบอ่านหน่วย GB ได้ง่ายด้วย `df -h`',
    hint: 'พิมพ์: df -h',
    quickCmds: ['df -h', 'du -sh /var/*', 'free -h'],
    check: (cmd) => /^df\s+-h$/.test(cmd.trim())
  },
  {
    id: 'lab6',
    os: 'linux',
    title: 'L6: ล็อกไฟล์ความลับด้วย chmod 600',
    category: 'users',
    xp: 75,
    coins: 55,
    goal: 'ไฟล์ `secret.key` มีสิทธิ์ 777 อันตราย! เปลี่ยนสิทธิ์เป็น 600 ด้วย `chmod 600 secret.key`',
    hint: 'พิมพ์: chmod 600 secret.key',
    quickCmds: ['ls -l', 'chmod 600 secret.key'],
    check: (cmd, s) => s.files['secret.key'] === '-rw-------'
  },
  {
    id: 'lab7',
    os: 'linux',
    title: 'L7: ตั้งสิทธิ์สคริปต์ backup.sh เป็น 755',
    category: 'users',
    xp: 75,
    coins: 55,
    goal: 'เปลี่ยนสิทธิ์ไฟล์ `backup.sh` ให้รันได้ (-rwxr-xr-x) ด้วย `chmod 755 backup.sh`',
    hint: 'พิมพ์: chmod 755 backup.sh',
    quickCmds: ['ls -l', 'chmod 755 backup.sh'],
    check: (cmd, s) => s.files['backup.sh'] === '-rwxr-xr-x'
  },
  {
    id: 'lab8',
    os: 'linux',
    title: 'L8: เปิดพอร์ต HTTPS (443) บน Firewall',
    category: 'security',
    xp: 80,
    coins: 60,
    goal: 'อนุญาตพอร์ต 443 (HTTPS) ผ่าน UFW Firewall ด้วย `ufw allow 443` หรือ `ufw allow https`',
    hint: 'พิมพ์: ufw allow 443',
    quickCmds: ['ufw status', 'ufw allow 443', 'ufw allow 80'],
    check: (cmd, s) => s.firewall.includes('443/tcp (HTTPS)')
  },
  {
    id: 'lab9',
    os: 'linux',
    title: 'L9: สร้างผู้ใช้ใหม่และตรวจสิทธิ์',
    category: 'users',
    xp: 80,
    coins: 60,
    goal: 'สร้างบัญชีผู้ใช้ชื่อ `student01` บนเครื่องแม่ข่ายด้วย `useradd student01`',
    hint: 'พิมพ์: useradd student01',
    quickCmds: ['useradd student01', 'id student01', 'cat /etc/passwd'],
    check: (cmd, s) => s.users.includes('student01')
  },
  {
    id: 'lab10',
    os: 'linux',
    title: 'L10: ตรวจสอบ Log ระบบของ Nginx',
    category: 'security',
    xp: 80,
    coins: 60,
    goal: 'ใช้คำสั่ง `journalctl -u nginx` เพื่อตรวจสอบประวัติการทำงานและ Error Log ของบริการ nginx',
    hint: 'พิมพ์: journalctl -u nginx',
    quickCmds: ['journalctl -u nginx', 'ls /var/log'],
    check: (cmd) => /^journalctl\s+-u\s+nginx$/.test(cmd.trim())
  },
  {
    id: 'lab11',
    os: 'windows',
    title: 'W1: ตรวจค่า IP & DNS (Windows Server)',
    category: 'network',
    xp: 70,
    coins: 50,
    goal: '[Windows PowerShell] ตรวจสอบข้อมูล IP, Subnet Mask, Gateway และ DNS Server ทั้งหมดด้วย `ipconfig /all`',
    hint: 'พิมพ์: ipconfig /all',
    quickCmds: ['ipconfig /all', 'nslookup college.ac.th', 'help'],
    check: (cmd) => /^ipconfig\s+\/all$/i.test(cmd.trim())
  },
  {
    id: 'lab12',
    os: 'windows',
    title: 'W2: รีสตาร์ทบริการ DNS บน Windows',
    category: 'cli',
    xp: 80,
    coins: 60,
    goal: '[Windows PowerShell] บริการ DNS หยุดทำงานอยู่ ให้รีสตาร์ทด้วยคำสั่ง `Restart-Service DNS`',
    hint: 'ดูสถานะด้วย Get-Service DNS แล้วพิมพ์: Restart-Service DNS',
    quickCmds: ['Get-Service DNS', 'Restart-Service DNS'],
    check: (cmd, s) => s.winServices.DNS === 'Running'
  },
  {
    id: 'lab13',
    os: 'windows',
    title: 'W3: บังคับอัปเดต Group Policy (GPO)',
    category: 'users',
    xp: 80,
    coins: 60,
    goal: '[Windows PowerShell] บังคับให้เครื่องอัปเดตนโยบาย Active Directory ทันทีด้วย `gpupdate /force`',
    hint: 'พิมพ์: gpupdate /force',
    quickCmds: ['gpupdate /force', 'Get-ADUser -Filter *'],
    check: (cmd) => /^gpupdate\s+\/force$/i.test(cmd.trim())
  },
  {
    id: 'lab14',
    os: 'windows',
    title: 'W4: ทดสอบพอร์ตปลายทางด้วย PowerShell',
    category: 'network',
    xp: 85,
    coins: 65,
    goal: '[Windows PowerShell] ทดสอบว่าเซิร์ฟเวอร์ 192.168.10.10 เปิดพอร์ต 443 หรือไม่ด้วย `Test-NetConnection 192.168.10.10 -Port 443`',
    hint: 'พิมพ์: Test-NetConnection 192.168.10.10 -Port 443',
    quickCmds: ['Test-NetConnection 192.168.10.10 -Port 443', 'netstat -ano'],
    check: (cmd) => /^(test-netconnection|tnc)\s+\S+\s+-port\s+443$/i.test(cmd.trim())
  },
  {
    id: 'lab15',
    os: 'linux',
    title: 'L11: ตรวจสอบ Docker Containers',
    category: 'cloud',
    xp: 85,
    coins: 65,
    goal: 'ตรวจสอบรายการ Docker Containers ที่กำลังทำงานอยู่บนเครื่องแม่ข่ายด้วย `docker ps` (หรือ `docker ps -a`)',
    hint: 'พิมพ์: docker ps',
    quickCmds: ['docker ps', 'docker ps -a', 'docker images'],
    check: (cmd) => /^docker\s+ps(\s+-a)?$/.test(cmd.trim())
  },
  {
    id: 'lab16',
    os: 'linux',
    title: 'L12: หาโฟลเดอร์กินพื้นที่ด้วย du -sh',
    category: 'storage',
    xp: 85,
    coins: 65,
    goal: 'ตรวจสอบขนาดของโฟลเดอร์ย่อยภายใน `/var/*` เพื่อหาว่าโฟลเดอร์ใดกินพื้นที่ดิสก์มากที่สุดด้วย `du -sh /var/*`',
    hint: 'พิมพ์: du -sh /var/*',
    quickCmds: ['du -sh /var/*', 'df -h'],
    check: (cmd) => /^du\s+-sh\s+\/var(\/\*)?$/.test(cmd.trim())
  },
  {
    id: 'lab17',
    os: 'linux',
    title: 'L13: อัปเดตแพ็กเกจและตรวจ Cron Job',
    category: 'cloud',
    xp: 85,
    coins: 65,
    goal: 'ดึงรายการอัปเดตแพ็กเกจความปลอดภัยล่าสุดด้วย `apt update` หรือตรวจตารางงานอัตโนมัติด้วย `crontab -l`',
    hint: 'พิมพ์: apt update หรือ crontab -l',
    quickCmds: ['apt update', 'crontab -l', 'tail -f /var/log/nginx/error.log'],
    check: (cmd) => /^(apt\s+update|crontab\s+-l|tail\s+-f\s+\S+)$/.test(cmd.trim())
  },
  {
    id: 'lab18',
    os: 'windows',
    title: 'W5: ดึงรายชื่อผู้ใช้ Active Directory',
    category: 'users',
    xp: 90,
    coins: 70,
    goal: '[Windows PowerShell] ตรวจสอบรายชื่อบัญชีผู้ใช้ทั้งหมดใน Active Directory ด้วย `Get-ADUser -Filter *`',
    hint: 'พิมพ์: Get-ADUser -Filter *',
    quickCmds: ['Get-ADUser -Filter *', 'Get-Service NTDS'],
    check: (cmd) => /^get-aduser\s+-filter\s+\*$/i.test(cmd.trim())
  },
  {
    id: 'lab19',
    os: 'linux',
    title: 'L14: เปลี่ยนเจ้าของโฟลเดอร์เว็บ (chown)',
    category: 'users',
    xp: 85,
    coins: 65,
    goal: 'โฟลเดอร์ `/var/www/html` ยังเป็นของ root ให้เปลี่ยนเจ้าของและกลุ่มเป็น `www-data:www-data` ด้วย `chown -R www-data:www-data /var/www/html`',
    hint: 'พิมพ์: chown -R www-data:www-data /var/www/html',
    quickCmds: ['chown -R www-data:www-data /var/www/html', 'ls -l'],
    check: (cmd, s) => s.webOwner === 'www-data:www-data'
  },
  {
    id: 'lab20',
    os: 'linux',
    title: 'L15: มอบสิทธิ์ sudo ให้ผู้ใช้ (usermod)',
    category: 'users',
    xp: 90,
    coins: 70,
    goal: 'เพิ่มบัญชี `student01` เข้ากลุ่ม `sudo` โดยไม่ลบกลุ่มเดิม ด้วยคำสั่ง `usermod -aG sudo student01`',
    hint: 'พิมพ์: usermod -aG sudo student01',
    quickCmds: ['usermod -aG sudo student01', 'id student01'],
    check: (cmd, s) => s.sudoUsers.includes('student01')
  },
  {
    id: 'lab21',
    os: 'linux',
    title: 'L16: ล่าแฮกเกอร์ใน Log ด้วย grep',
    category: 'forensics',
    xp: 95,
    coins: 75,
    goal: 'ค้นหาประวัติการสุ่มรหัสผ่าน SSH ที่ล้มเหลว (`Failed`) ใน `/var/log/auth.log` ด้วย `grep Failed /var/log/auth.log`',
    hint: 'พิมพ์: grep Failed /var/log/auth.log',
    quickCmds: ['grep Failed /var/log/auth.log', 'tail -f /var/log/auth.log'],
    check: (cmd) => /^grep\s+(-i\s+)?["']?failed["']?\s+\/var\/log\/auth\.log$/i.test(cmd.trim())
  },
  {
    id: 'lab22',
    os: 'linux',
    title: 'L17: บีบอัดไฟล์สำรองข้อมูลด้วย tar',
    category: 'backup',
    xp: 95,
    coins: 75,
    goal: 'สำรองและบีบอัดโฟลเดอร์ `/var/www/html` เป็นไฟล์ `backup.tar.gz` ด้วย `tar -czvf backup.tar.gz /var/www/html`',
    hint: 'พิมพ์: tar -czvf backup.tar.gz /var/www/html',
    quickCmds: ['tar -czvf backup.tar.gz /var/www/html', 'ls -l'],
    check: (cmd) => /^tar\s+-[a-z]*c[a-z]*z[a-z]*f\s+\S+\.tar\.gz\s+\/var\/www\/html$/i.test(cmd.trim())
  },
  {
    id: 'lab23',
    os: 'linux',
    title: 'L18: หยุด Process มัลแวร์ที่กิน CPU 100%',
    category: 'forensics',
    xp: 95,
    coins: 75,
    goal: 'ตรวจพบโปรเซส `miner_bot` (PID 4099) กิน CPU เต็ม! ตรวจด้วย `ps aux` แล้วสั่งปิดทันทีด้วย `kill -9 4099`',
    hint: 'ดูรายการด้วย ps aux แล้วพิมพ์: kill -9 4099',
    quickCmds: ['ps aux', 'kill -9 4099', 'uptime'],
    check: (cmd, s) => s.roguePidKilled === true
  },
  {
    id: 'lab24',
    os: 'linux',
    title: 'L19: สั่งรัน Docker Nginx Container',
    category: 'cloud',
    xp: 100,
    coins: 80,
    goal: 'เปิด Container เว็บ Nginx แบบเบื้องหลังและแมปพอร์ต 8080→80 ด้วย `docker run -d -p 8080:80 nginx`',
    hint: 'พิมพ์: docker run -d -p 8080:80 nginx',
    quickCmds: ['docker run -d -p 8080:80 nginx', 'docker ps'],
    check: (cmd) => /^docker\s+run\s+.*-d.*-p\s+8080:80.*nginx/i.test(cmd.trim())
  },
  {
    id: 'lab25',
    os: 'linux',
    title: 'L20: ปิดช่องโหว่บล็อกพอร์ต Telnet (23)',
    category: 'security',
    xp: 100,
    coins: 80,
    goal: 'พบพอร์ต Telnet (23) ที่ไม่เข้ารหัสเปิดทิ้งไว้! สั่งบล็อกพอร์ต 23 บน Firewall ทันทีด้วย `ufw deny 23`',
    hint: 'เช็กสถานะด้วย ufw status แล้วพิมพ์: ufw deny 23',
    quickCmds: ['ufw status', 'ufw deny 23'],
    check: (cmd, s) => !s.firewall.includes('23/tcp (Telnet - INSECURE)')
  },
  {
    id: 'lab26',
    os: 'windows',
    title: 'W6: สร้างบัญชีผู้ใช้ AD ใหม่ (New-ADUser)',
    category: 'users',
    xp: 90,
    coins: 70,
    goal: '[Windows PowerShell] สร้างบัญชีผู้ใช้ใหม่ชื่อ `suda.r` ใน Active Directory ด้วย `New-ADUser -Name suda.r`',
    hint: 'พิมพ์: New-ADUser -Name suda.r',
    quickCmds: ['New-ADUser -Name suda.r', 'Get-ADUser -Filter *'],
    check: (cmd, s) => s.winAdUsers.some((u) => u.name.toLowerCase() === 'suda.r')
  },
  {
    id: 'lab27',
    os: 'windows',
    title: 'W7: ตรวจพอร์ตเปิดและ PID (netstat -ano)',
    category: 'network',
    xp: 85,
    coins: 65,
    goal: '[Windows PowerShell] ตรวจสอบพอร์ตที่เปิดรอรับการเชื่อมต่อทั้งหมดพร้อมหมายเลข PID ด้วย `netstat -ano`',
    hint: 'พิมพ์: netstat -ano',
    quickCmds: ['netstat -ano', 'ipconfig /all'],
    check: (cmd) => /^netstat\s+-ano$/i.test(cmd.trim())
  },
  {
    id: 'lab28',
    os: 'windows',
    title: 'W8: ล้างแคช DNS บน Windows Server',
    category: 'network',
    xp: 85,
    coins: 65,
    goal: '[Windows PowerShell] แก้ปัญหาเว็บค้าง IP เก่าด้วยการล้าง DNS Resolver Cache ด้วย `ipconfig /flushdns`',
    hint: 'พิมพ์: ipconfig /flushdns',
    quickCmds: ['ipconfig /flushdns', 'nslookup college.ac.th'],
    check: (cmd) => /^ipconfig\s+\/flushdns$/i.test(cmd.trim())
  },
  {
    id: 'lab29',
    os: 'windows',
    title: 'W9: เปิดพอร์ต HTTPS 443 บน Windows Firewall',
    category: 'security',
    xp: 100,
    coins: 80,
    goal: '[Windows PowerShell] สร้างกฎ Firewall อนุญาตพอร์ต TCP 443 ขาเข้าด้วย `New-NetFirewallRule -DisplayName HTTPS -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow`',
    hint: 'คลิกปุ่มคำสั่งช่วยจำด้านล่าง หรือพิมพ์ New-NetFirewallRule ... -LocalPort 443 ... -Action Allow',
    quickCmds: ['New-NetFirewallRule -DisplayName HTTPS -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow'],
    check: (cmd, s) => s.winFirewallPorts.includes('443')
  },
  {
    id: 'lab30',
    os: 'windows',
    title: 'W10: สืบสวน Event ID 4625 (จับ Brute-Force)',
    category: 'forensics',
    xp: 105,
    coins: 85,
    goal: '[Windows PowerShell] ดึงประวัติการล็อกอินล้มเหลว Event ID 4625 จาก Security Log ด้วย `Get-WinEvent -FilterHashtable @{LogName="Security"; ID=4625}` หรือ `Get-EventLog -LogName Security -InstanceId 4625`',
    hint: 'คลิกปุ่มช่วยจำด้านล่าง หรือพิมพ์ Get-EventLog -LogName Security -InstanceId 4625',
    quickCmds: ['Get-EventLog -LogName Security -InstanceId 4625', 'Get-WinEvent -FilterHashtable @{LogName="Security"; ID=4625}'],
    check: (cmd) => /^(get-winevent|get-eventlog)\s+.*4625/i.test(cmd.trim())
  }
];

/* ==================== 18 STANDARD PORTS FOR PACKET DEFENSE ARCADE ==================== */
const PORT_CARDS = [
  { port: '22', proto: 'SSH / SFTP', layer: 'Secure Remote', prompt: 'รีโมทเข้าจัดการ Linux Server และโอนไฟล์แบบเข้ารหัสปลอดภัย', sub: 'Secure Shell Protocol' },
  { port: '80', proto: 'HTTP', layer: 'Web Service', prompt: 'ให้บริการหน้าเว็บไซต์ปกติ (ยังไม่เข้ารหัส SSL/TLS)', sub: 'Hypertext Transfer Protocol' },
  { port: '443', proto: 'HTTPS', layer: 'Encrypted Web', prompt: 'ให้บริการเว็บไซต์แบบเข้ารหัสปลอดภัยด้วย SSL/TLS', sub: 'HTTP over TLS' },
  { port: '53', proto: 'DNS', layer: 'Name Resolution', prompt: 'แปลงชื่อโดเมน (เช่น college.ac.th) เป็นหมายเลข IP Address', sub: 'Domain Name System (UDP/TCP)' },
  { port: '67 / 68', proto: 'DHCP', layer: 'IP Assignment', prompt: 'แจก IP, Subnet Mask, Gateway และ DNS อัตโนมัติให้เครื่องลูกข่าย', sub: 'Dynamic Host Configuration Protocol' },
  { port: '21', proto: 'FTP', layer: 'File Transfer', prompt: 'เชื่อมต่อควบคุมการรับ-ส่งไฟล์ระหว่าง Client กับ File Server', sub: 'File Transfer Protocol (Control)' },
  { port: '25', proto: 'SMTP', layer: 'Mail Sending', prompt: 'ส่งอีเมลออกจากเครื่องหรือส่งต่อระหว่าง Mail Server', sub: 'Simple Mail Transfer Protocol' },
  { port: '3389', proto: 'RDP', layer: 'Windows Remote', prompt: 'รีโมทควบคุมหน้าจอกราฟิก (GUI) ของ Windows Server', sub: 'Remote Desktop Protocol' },
  { port: '445', proto: 'SMB / CIFS', layer: 'Windows Sharing', prompt: 'แชร์ไฟล์และเครื่องพิมพ์ในเครือข่ายท้องถิ่นของ Windows', sub: 'Server Message Block' },
  { port: '3306', proto: 'MySQL / MariaDB', layer: 'Database', prompt: 'พอร์ตมาตรฐานเชื่อมต่อฐานข้อมูล MySQL หรือ MariaDB', sub: 'Relational Database Service' },
  { port: '5432', proto: 'PostgreSQL', layer: 'Database', prompt: 'พอร์ตมาตรฐานเชื่อมต่อฐานข้อมูลโอเพนซอร์ส PostgreSQL', sub: 'PostgreSQL Database' },
  { port: '23', proto: 'Telnet', layer: 'Legacy Insecure', prompt: 'รีโมทแบบข้อความธรรมดาไม่เข้ารหัส (เสี่ยงสูง ไม่ควรเปิดใช้)', sub: 'Unencrypted Terminal' },
  { port: '110', proto: 'POP3', layer: 'Mail Receiving', prompt: 'ดึงอีเมลจาก Mail Server ลงเครื่องผู้รับ', sub: 'Post Office Protocol v3' },
  { port: '143', proto: 'IMAP', layer: 'Mail Sync', prompt: 'อ่านและซิงค์อีเมลบนเซิร์ฟเวอร์ให้ตรงกันทุกอุปกรณ์', sub: 'Internet Message Access Protocol' },
  { port: '123', proto: 'NTP', layer: 'Time Sync', prompt: 'ซิงค์นาฬิกาเครื่องแม่ข่ายทุกเครื่องให้เวลาตรงกัน', sub: 'Network Time Protocol (UDP)' },
  { port: '389', proto: 'LDAP', layer: 'Directory Service', prompt: 'สืบค้นข้อมูลบัญชีผู้ใช้และไดเรกทอรีใน Active Directory / OpenLDAP', sub: 'Lightweight Directory Access Protocol' },
  { port: '161', proto: 'SNMP', layer: 'Monitoring', prompt: 'ดึงค่าสถานะ CPU/RAM/Traffic จาก Server และ Switch มาเฝ้าระวัง', sub: 'Simple Network Management Protocol' },
  { port: '514', proto: 'Syslog', layer: 'Central Logging', prompt: 'ส่งข้อความบันทึกเหตุการณ์ (System Logs) ไปรวมที่ Log Server', sub: 'System Logging Protocol (UDP)' }
];

/* ==================== 8 CHMOD VAULT CRACKER PUZZLES ==================== */
const CHMOD_PUZZLES = [
  { id: 'c1', file: 'id_rsa', target: '600', brief: 'ล็อกไฟล์ SSH Private Key: เฉพาะ Owner อ่านและเขียนได้เท่านั้น ห้าม Group และ Others เข้าถึงเลย', rewardXp: 40, rewardCoins: 30 },
  { id: 'c2', file: 'deploy.sh', target: '755', brief: 'สคริปต์ Deploy เว็บ: Owner อ่าน/เขียน/รันได้ ส่วน Group และ Others อ่านและรันได้ (ห้ามแก้)', rewardXp: 45, rewardCoins: 35 },
  { id: 'c3', file: 'nginx.conf', target: '644', brief: 'ไฟล์ตั้งค่าเว็บเซิร์ฟเวอร์: Owner อ่านและเขียนได้ ส่วน Group และ Others อ่านได้อย่างเดียว', rewardXp: 40, rewardCoins: 30 },
  { id: 'c4', file: 'admin_vault/', target: '700', brief: 'โฟลเดอร์ลับของผู้ดูแลระบบ: เฉพาะ Owner เท่านั้นที่ทำได้ทุกอย่าง (rwx) คนอื่นห้ามเข้าเด็ดขาด', rewardXp: 45, rewardCoins: 35 },
  { id: 'c5', file: 'team_report.txt', target: '664', brief: 'ไฟล์รายงานทีม: ทั้ง Owner และ Group อ่านและแก้ไขได้ ส่วน Others อ่านได้อย่างเดียว', rewardXp: 50, rewardCoins: 40 },
  { id: 'c6', file: 'team_script.sh', target: '750', brief: 'สคริปต์ภายในแผนกไอที: Owner ทำได้ทุกอย่าง, Group อ่านและรันได้, ส่วน Others ห้ามเข้าถึงเลย', rewardXp: 55, rewardCoins: 45 },
  { id: 'c7', file: 'readonly_policy.pdf', target: '444', brief: 'ไฟล์ประกาศนโยบายถาวร: ให้ทุกคน (Owner, Group, Others) อ่านได้อย่างเดียว ห้ามแก้ไขและห้ามรัน', rewardXp: 50, rewardCoins: 40 },
  { id: 'c8', file: 'db_backup.sql', target: '640', brief: 'ไฟล์สำรองฐานข้อมูล: Owner อ่าน/เขียนได้, Group อ่านได้อย่างเดียว, Others ไม่มีสิทธิ์เลย', rewardXp: 55, rewardCoins: 45 }
];

/* ==================== RAID SIMULATOR & 6 ARCHITECT CHALLENGES ==================== */
const RAID_INFO = {
  '0': {
    name: 'RAID 0 (Striping)',
    minDisks: 2,
    usable: '100% (4 TB จาก 4 ลูก)',
    faultTolerance: 0,
    faultText: '0 ลูก (ดิสก์พังแม้แต่ 1 ลูก ข้อมูลหายทั้งหมด!)',
    speed: 'เร็วสูงสุดทั้งอ่านและเขียน',
    useCase: 'งานประมวลผลชั่วคราว/แคช ที่เน้นความเร็วล้วน ไม่ห่วงข้อมูลหาย',
    disks: [
      { name: 'Disk 1', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'A5', cls: 'block-data' }] },
      { name: 'Disk 2', blocks: [{ label: 'A2', cls: 'block-data' }, { label: 'A6', cls: 'block-data' }] },
      { name: 'Disk 3', blocks: [{ label: 'A3', cls: 'block-data' }, { label: 'A7', cls: 'block-data' }] },
      { name: 'Disk 4', blocks: [{ label: 'A4', cls: 'block-data' }, { label: 'A8', cls: 'block-data' }] }
    ]
  },
  '1': {
    name: 'RAID 1 (Mirroring)',
    minDisks: 2,
    usable: '50% (1 TB จาก 2 ลูก)',
    faultTolerance: 1,
    faultText: 'ทนดิสก์เสียได้ 1 ลูก (ข้อมูลสำเนาอยู่ครบ)',
    speed: 'อ่านเร็ว / เขียนปกติ',
    useCase: 'ดิสก์ติดตั้ง OS เครื่องแม่ข่าย หรือข้อมูลสำคัญที่ใช้ดิสก์แค่ 2 ลูก',
    disks: [
      { name: 'Disk 1 (Main)', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'A2', cls: 'block-data' }, { label: 'A3', cls: 'block-data' }] },
      { name: 'Disk 2 (Mirror)', blocks: [{ label: 'A1 Copy', cls: 'block-mirror' }, { label: 'A2 Copy', cls: 'block-mirror' }, { label: 'A3 Copy', cls: 'block-mirror' }] }
    ]
  },
  '5': {
    name: 'RAID 5 (Striping + Single Parity)',
    minDisks: 3,
    usable: '(N-1) ลูก → 3 TB จาก 4 ลูก (75%)',
    faultTolerance: 1,
    faultText: 'ทนดิสก์เสียได้ 1 ลูก (คำนวณกู้คืนจาก Parity)',
    speed: 'อ่านเร็วมาก / เขียนปานกลาง',
    useCase: 'File Server / Web Server ยอดนิยม สมดุลทั้งความจุ ความเร็ว และความปลอดภัย',
    disks: [
      { name: 'Disk 1', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'B1', cls: 'block-data' }, { label: 'Parity C', cls: 'block-parity' }] },
      { name: 'Disk 2', blocks: [{ label: 'A2', cls: 'block-data' }, { label: 'Parity B', cls: 'block-parity' }, { label: 'C1', cls: 'block-data' }] },
      { name: 'Disk 3', blocks: [{ label: 'A3', cls: 'block-data' }, { label: 'B2', cls: 'block-data' }, { label: 'C2', cls: 'block-data' }] },
      { name: 'Disk 4', blocks: [{ label: 'Parity A', cls: 'block-parity' }, { label: 'B3', cls: 'block-data' }, { label: 'C3', cls: 'block-data' }] }
    ]
  },
  '6': {
    name: 'RAID 6 (Striping + Dual Parity)',
    minDisks: 4,
    usable: '(N-2) ลูก → 2 TB จาก 4 ลูก (50%) หรือ 4 TB จาก 6 ลูก',
    faultTolerance: 2,
    faultText: 'ทนดิสก์เสียพร้อมกันได้ถึง 2 ลูก!',
    speed: 'อ่านเร็ว / เขียนช้ากว่า RAID 5 เล็กน้อย (คำนวณ Parity 2 ชุด)',
    useCase: 'คลังข้อมูลขนาดใหญ่ (Archive / Storage Server) ที่ห้ามข้อมูลหายเด็ดขาดแม้เสีย 2 ลูกซ้อน',
    disks: [
      { name: 'Disk 1', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'P-B1', cls: 'block-parity' }] },
      { name: 'Disk 2', blocks: [{ label: 'A2', cls: 'block-data' }, { label: 'P-B2', cls: 'block-parity' }] },
      { name: 'Disk 3', blocks: [{ label: 'P-A1', cls: 'block-parity' }, { label: 'B1', cls: 'block-data' }] },
      { name: 'Disk 4', blocks: [{ label: 'P-A2', cls: 'block-parity' }, { label: 'B2', cls: 'block-data' }] }
    ]
  },
  '10': {
    name: 'RAID 10 (RAID 1+0: Mirror + Stripe)',
    minDisks: 4,
    usable: '50% (2 TB จาก 4 ลูก)',
    faultTolerance: 1,
    faultText: 'ทนดิสก์เสียได้ 1 ลูกต่อคู่ Mirror (สูงสุด 2 ลูกต่างคู่)',
    speed: 'เร็วสูงมากทั้งอ่านและเขียน (IOPS สูงสุดแบบปลอดภัย)',
    useCase: 'Database Server ที่มีคนอ่าน-เขียนพร้อมกันหนาแน่น (OLTP / E-Commerce)',
    disks: [
      { name: 'Disk 1 (M1)', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'A3', cls: 'block-data' }] },
      { name: 'Disk 2 (M1)', blocks: [{ label: 'A1 Copy', cls: 'block-mirror' }, { label: 'A3 Copy', cls: 'block-mirror' }] },
      { name: 'Disk 3 (M2)', blocks: [{ label: 'A2', cls: 'block-data' }, { label: 'A4', cls: 'block-data' }] },
      { name: 'Disk 4 (M2)', blocks: [{ label: 'A2 Copy', cls: 'block-mirror' }, { label: 'A4 Copy', cls: 'block-mirror' }] }
    ]
  }
};

const RAID_CHALLENGES = [
  {
    id: 'r1',
    client: 'สตูดิโอตัดต่อวิดีโอ 8K (Temp Cache)',
    brief: 'มีดิสก์ 4 ลูก ต้องการความเร็วอ่าน-เขียนและพื้นที่ 100% เต็มพิกัดสำหรับไฟล์แคชชั่วคราว (ไม่ซีเรียสหากดิสก์เสีย)',
    answer: '0',
    failCount: 0,
    explain: 'RAID 0 ให้พื้นที่ 100% และเร็วสูงสุด เหมาะกับงานแคชชั่วคราวที่ไม่ห่วงการสูญหายของข้อมูล'
  },
  {
    id: 'r2',
    client: 'เครื่อง Boot OS ของ Domain Controller',
    brief: 'มีงบซื้อ SSD แค่ 2 ลูก ต้องการให้เครื่องยังเปิดทำงานต่อได้ทันทีแม้ SSD พังไป 1 ลูก',
    answer: '1',
    failCount: 1,
    explain: 'RAID 1 (Mirroring) ใช้ดิสก์เพียง 2 ลูกและสำเนาข้อมูลเหมือนกัน 100% เหมาะที่สุดสำหรับ OS Drive'
  },
  {
    id: 'r3',
    client: 'File Server ของวิทยาลัย (4 ดิสก์)',
    brief: 'มีดิสก์ 4 ลูก ต้องการพื้นที่ใช้งานคุ้มค่าถึง 75% (3 ลูก) และทนดิสก์เสียได้ 1 ลูก',
    answer: '5',
    failCount: 1,
    explain: 'RAID 5 ให้ความจุใช้งาน (N-1) = 75% จาก 4 ลูก พร้อม Parity ทนดิสก์เสียได้ 1 ลูก'
  },
  {
    id: 'r4',
    client: 'คลังข้อมูลโรงพยาบาล (Critical Storage)',
    brief: 'มีดิสก์ 4–6 ลูก ต้องการความปลอดภัยระดับสูงสุด สามารถทนฮาร์ดดิสก์เสียพร้อมกันได้ถึง 2 ลูกไม่ว่าลูกใดก็ตาม!',
    answer: '6',
    failCount: 2,
    explain: 'RAID 6 มี Dual Parity จึงทนดิสก์เสียพร้อมกันได้ถึง 2 ลูกอย่างแน่นอน'
  },
  {
    id: 'r5',
    client: 'ฐานข้อมูลลงทะเบียนเรียน High-IOPS',
    brief: 'มีดิสก์ 4 ลูก ต้องการความเร็วในการเขียนฐานข้อมูลสูงสุดโดยไม่ต้องเสียเวลาคำนวณ Parity และยังทนดิสก์เสียได้',
    answer: '10',
    failCount: 1,
    explain: 'RAID 10 ผสาน Mirror+Stripe ไม่มีภาระคำนวณ Parity จึงให้ IOPS การเขียนสูงสุดสำหรับ Database Server'
  },
  {
    id: 'r6',
    client: 'ทดสอบความทนทาน 2 ดิสก์พังพร้อมกัน!',
    brief: 'จำลองเหตุการณ์ดิสก์พังพร้อมกัน 2 ลูกในอาร์เรย์ 4 ลูก เลือก RAID ที่การันตีรอด 100% ไม่ว่า 2 ลูกไหนจะพัง',
    answer: '6',
    failCount: 2,
    explain: 'RAID 6 การันตีทนดิสก์เสียได้ 2 ลูกใด ๆ ก็ตาม (ต่างจาก RAID 10 ที่หากพัง 2 ลูกในคู่ Mirror เดียวกันข้อมูลจะหาย)'
  }
];

/* ==================== 8 COMPREHENSIVE CODEX CHAPTERS ==================== */
const CODEX_CHAPTERS = [
  {
    title: 'บทที่ 1: พื้นฐาน Server OS & สถาปัตยกรรม',
    points: [
      '<strong>Client-Server vs P2P:</strong> Client-Server รวมศูนย์บัญชีผู้ใช้ สิทธิ์ และบริการ เหมาะกับองค์กรตั้งแต่ 10 เครื่องขึ้นไป ส่วน P2P ต่างคนต่างจัดการ',
      '<strong>ประเภทของ Server:</strong> Web (Nginx/Apache/IIS), File (SMB/NFS), DNS, DHCP, Database (MySQL/PostgreSQL), Mail, Proxy, Application และ Log Server',
      '<strong>Server OS ยอดนิยม:</strong> Windows Server 2022/2025 (เด่นเรื่อง AD DS & GUI) และ Linux Server เช่น Ubuntu Server LTS, RHEL, Rocky Linux, Debian (เด่นเรื่องความเบา เสถียร ฟรี และ CLI)'
    ]
  },
  {
    title: 'บทที่ 2: ฮาร์ดแวร์ Server, Virtualization & Container',
    points: [
      '<strong>รูปแบบเครื่อง:</strong> Tower Server (ตั้งพื้น), Rack Server (1U/2U/4U ใส่ตู้แร็ก), Blade Server (ประหยัดพื้นที่ใน Data Center ใหญ่)',
      '<strong>ฮาร์ดแวร์ 24/7:</strong> CPU ตระกูล Xeon/EPYC, <strong>ECC RAM</strong> แก้บิตเพี้ยนอัตโนมัติ, <strong>Redundant PSU</strong>, Hot-Swap Drive และระบบจัดการระยะไกล IPMI/iDRAC/iLO',
      '<strong>Virtualization vs Container:</strong> Type-1 Hypervisor (ESXi, Proxmox, Hyper-V) รัน VM แยก OS เต็มตัว ส่วน <strong>Docker Container</strong> แชร์ Host Kernel จึงเบาและบูตเร็วมาก'
    ]
  },
  {
    title: 'บทที่ 3: ระบบจัดเก็บข้อมูล RAID & File Systems',
    points: [
      '<strong>RAID 0:</strong> เร็ว+จุ 100% แต่ทนเสีย 0 ลูก • <strong>RAID 1:</strong> Mirror 2 ลูก จุ 50% ทนเสีย 1 ลูก',
      '<strong>RAID 5:</strong> อย่างน้อย 3 ลูก จุ (N-1) ทนเสีย 1 ลูก • <strong>RAID 6:</strong> อย่างน้อย 4 ลูก จุ (N-2) ทนเสีย 2 ลูกพร้อมกัน',
      '<strong>RAID 10:</strong> อย่างน้อย 4 ลูก จุ 50% เร็วสูงสุดสำหรับ Database • <strong>จำไว้:</strong> RAID ไม่ใช่ Backup!',
      '<strong>File Systems:</strong> Linux ใช้ <code>ext4</code>, <code>XFS</code>, <code>ZFS</code> • Windows Server ใช้ <code>NTFS</code>, <code>ReFS</code>'
    ]
  },
  {
    title: 'บทที่ 4: เครือข่าย พอร์ต DNS & DHCP',
    points: [
      '<strong>Static IP:</strong> เครื่อง Server ต้องใช้ IP คงที่เสมอ • Subnet <code>/24</code> (255.255.255.0) มี Host ใช้งานได้ 254 IP',
      '<strong>DHCP (67/68):</strong> แจก IP อัตโนมัติด้วยขั้นตอน <strong>DORA</strong> (Discover → Offer → Request → Acknowledge)',
      '<strong>DNS (53):</strong> <code>A</code>=IPv4, <code>AAAA</code>=IPv6, <code>CNAME</code>=ชื่อนามแฝง, <code>MX</code>=Mail Server, <code>TXT</code>=ยืนยันโดเมน/SPF',
      '<strong>พอร์ตต้องจำ:</strong> 21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 123 NTP, 161 SNMP, 389 LDAP, 443 HTTPS, 445 SMB, 514 Syslog, 3306 MySQL, 3389 RDP, 5432 PostgreSQL'
    ]
  },
  {
    title: 'บทที่ 5: ผู้ใช้ กลุ่ม สิทธิ์ & Active Directory',
    points: [
      '<strong>Windows Active Directory (AD DS):</strong> จัดการ Domain, OU, Users, Groups และบังคับนโยบายด้วย <strong>GPO</strong> (ใช้ LDAP 389 + Kerberos 88)',
      '<strong>Share vs NTFS:</strong> เมื่อเข้าผ่านเครือข่าย ยึดสิทธิ์ที่ <strong>เข้มงวดที่สุด (Most Restrictive)</strong>',
      '<strong>Linux Accounts:</strong> รายชื่ออยู่ที่ <code>/etc/passwd</code> รหัสผ่านแฮชอยู่ที่ <code>/etc/shadow</code> เพิ่มสิทธิ์ sudo ด้วย <code>usermod -aG sudo &lt;user&gt;</code>',
      '<strong>Linux Permissions:</strong> r=4, w=2, x=1 • <code>755</code> สคริปต์/โฟลเดอร์, <code>644</code> คอนฟิก, <code>600</code> คีย์ลับ • เปลี่ยนเจ้าของด้วย <code>chown</code>'
    ]
  },
  {
    title: 'บทที่ 6: คำสั่งจัดการระบบ Linux & Windows CLI',
    points: [
      '<strong>Linux Services & Logs:</strong> <code>systemctl status/start/restart/enable</code>, <code>journalctl -u &lt;svc&gt;</code>, <code>/var/log/</code>',
      '<strong>Linux System & Net:</strong> <code>df -h</code> (ดิสก์), <code>du -sh</code> (ขนาดโฟลเดอร์), <code>free -h</code> (แรม), <code>top/htop</code>, <code>ip a</code>, <code>ss -tulnp</code>, <code>apt update && apt upgrade</code>',
      '<strong>Windows PowerShell/CMD:</strong> <code>ipconfig /all</code>, <code>nslookup</code>, <code>netstat -ano</code>, <code>Get-Service</code>, <code>Restart-Service</code>, <code>gpupdate /force</code>, <code>Test-NetConnection -Port</code>'
    ]
  },
  {
    title: 'บทที่ 7: ความปลอดภัย Firewall, SSH & Monitoring',
    points: [
      '<strong>CIA Triad:</strong> Confidentiality (ความลับ), Integrity (ความถูกต้อง), Availability (ความพร้อมใช้งาน)',
      '<strong>DMZ & Firewall:</strong> วาง Web Server ใน DMZ, ตั้ง Firewall แบบ Default Deny ขาเข้า แล้วอนุญาตเฉพาะพอร์ตที่จำเป็น',
      '<strong>SSH Hardening:</strong> ปิด <code>PermitRootLogin</code>, ใช้ SSH Key, ติดตั้ง <code>Fail2ban</code> และห้ามใช้ Telnet (23)',
      '<strong>Encryption & Monitoring:</strong> ใช้ SSL/TLS Certificate สำหรับ HTTPS (443), เฝ้าระวังด้วย SNMP (161) และรวมศูนย์ Log ด้วย Syslog (514)'
    ]
  },
  {
    title: 'บทที่ 8: การสำรองข้อมูล (Backup) & กู้คืนภัยพิบัติ (DR)',
    points: [
      '<strong>กฎ 3-2-1-1-0:</strong> 3 ชุดข้อมูล • 2 ชนิดสื่อ • 1 ชุด Off-site • 1 ชุด Offline/Immutable กัน Ransomware • 0 Error จากการซ้อมกู้คืน',
      '<strong>ชนิด Backup:</strong> Full (ครบทั้งหมด), Incremental (เปลี่ยนจากครั้งล่าสุด—เร็วสุด กู้หลายชุด), Differential (เปลี่ยนจาก Full ล่าสุด—กู้เร็วใช้แค่ 2 ชุด)',
      '<strong>RTO vs RPO:</strong> RTO = เวลากู้ระบบสูงสุดที่ยอมรับได้ • RPO = ช่วงข้อมูลย้อนหลังสูงสุดที่ยอมให้สูญหายได้',
      '<strong>High Availability (HA):</strong> ใช้ Load Balancer + Redundant Servers ลด Single Point of Failure'
    ]
  },
  {
    title: 'บทที่ 9: Docker, Cloud Computing & Automation',
    points: [
      '<strong>Docker Container:</strong> แชร์ Host Kernel เบาและบูตเร็ว • คำสั่งหลัก: <code>docker run -d -p 8080:80</code>, <code>docker ps -a</code>, <code>docker images</code> และใช้ <strong>Volume</strong> เก็บข้อมูลถาวร',
      '<strong>Cron Job (Linux):</strong> ตั้งเวลางานอัตโนมัติ 5 ช่อง <code>นาที ชั่วโมง วันที่ เดือน วันในสัปดาห์</code> เช่น <code>0 2 * * *</code> (ตี 2 ทุกวัน)',
      '<strong>Cloud Models:</strong> <strong>IaaS</strong> (เช่า VM/เน็ต คุม OS เอง), <strong>PaaS</strong> (วางโค้ดได้เลย), <strong>SaaS</strong> (ซอฟต์แวร์พร้อมใช้)',
      '<strong>Reverse Proxy & Automation:</strong> ใช้ Nginx Reverse Proxy รับ HTTPS พอร์ต 443 และใช้ <strong>Ansible</strong> จัดการเซิร์ฟเวอร์จำนวนมากผ่าน SSH'
    ]
  },
  {
    title: 'บทที่ 10: Log Forensics, Performance & Incident Response',
    points: [
      '<strong>การตรวจ Log:</strong> Ubuntu เก็บประวัติ SSH/sudo ที่ <code>/var/log/auth.log</code> • ดูสดด้วย <code>tail -f</code> • Windows Event Viewer ID <strong>4625</strong> (ล็อกอินพลาด) / <strong>4624</strong> (ล็อกอินสำเร็จ)',
      '<strong>SIEM:</strong> ระบบรวมศูนย์วิเคราะห์ Log และแจ้งเตือนภัยคุกคาม เช่น Wazuh, Splunk, ELK Stack',
      '<strong>คอขวดสมรรถนะ:</strong> <code>uptime</code> ดู Load Average • <code>free -h</code> ตรวจ <strong>Swap Thrashing</strong> (RAM เต็มจนต้องสลับลงดิสก์)',
      '<strong>Incident Response:</strong> Preparation → Identification → <strong>Containment</strong> (ตัดแยกเครือข่ายแต่เก็บหลักฐาน) → Eradication → Recovery → Lessons Learned'
    ]
  }
];

/* ==================== 6 FIREWALL RULE MASTER PUZZLES ==================== */
const FIREWALL_PUZZLES = [
  {
    id: 'fw1',
    serverName: 'SRV-WEB-DMZ (Public Web Server)',
    brief: 'เครื่อง Web Server สาธารณะบน Linux ต้องเปิดให้บริการเว็บทั้ง HTTP/HTTPS และให้แอดมินเข้าจัดการผ่าน SSH เท่านั้น ห้ามเปิด Telnet, SMB และ MySQL ออกสู่ภายนอก!',
    ports: [
      { port: '22', label: 'SSH (Linux Remote)', shouldAllow: true },
      { port: '23', label: 'Telnet (ไม่เข้ารหัส)', shouldAllow: false },
      { port: '80', label: 'HTTP (Web)', shouldAllow: true },
      { port: '443', label: 'HTTPS (Secure Web)', shouldAllow: true },
      { port: '445', label: 'SMB (Windows Share)', shouldAllow: false },
      { port: '3306', label: 'MySQL Database', shouldAllow: false }
    ],
    rewardXp: 60,
    rewardCoins: 50,
    explain: 'Public Web Server เปิดเฉพาะ 22 (SSH), 80 (HTTP), 443 (HTTPS) ส่วนพอร์ตฐานข้อมูล 3306, SMB 445 และ Telnet 23 ต้อง DENY เสมอ!'
  },
  {
    id: 'fw2',
    serverName: 'SRV-DB-INT (Internal Database Server)',
    brief: 'เครื่องฐานข้อมูล MySQL ภายในห้องแล็บ ต้องอนุญาตเฉพาะ SSH สำหรับดูแลระบบ และพอร์ตฐานข้อมูล MySQL เท่านั้น ปิดพอร์ตเว็บและแชร์ไฟล์ทั้งหมด',
    ports: [
      { port: '22', label: 'SSH (Admin)', shouldAllow: true },
      { port: '21', label: 'FTP (File Transfer)', shouldAllow: false },
      { port: '80', label: 'HTTP (Web)', shouldAllow: false },
      { port: '443', label: 'HTTPS (Web)', shouldAllow: false },
      { port: '3306', label: 'MySQL / MariaDB', shouldAllow: true },
      { port: '3389', label: 'RDP (Windows GUI)', shouldAllow: false }
    ],
    rewardXp: 65,
    rewardCoins: 55,
    explain: 'Database Server ไม่จำเป็นต้องเปิดเว็บ (80/443) หรือ FTP/RDP ควรจำกัดเฉพาะ 22 (SSH) และ 3306 (MySQL) เฉพาะเครือข่ายภายใน'
  },
  {
    id: 'fw3',
    serverName: 'SRV-DC-01 (Windows Domain Controller)',
    brief: 'เครื่อง Windows Server Active Directory ต้องให้บริการแปลงชื่อ DNS, ค้นหาผู้ใช้ LDAP, แชร์นโยบายผ่าน SMB และรีโมท RDP ส่วน Telnet และ FTP ต้องบล็อกทั้งหมด!',
    ports: [
      { port: '53', label: 'DNS (Name Resolution)', shouldAllow: true },
      { port: '389', label: 'LDAP (Active Directory)', shouldAllow: true },
      { port: '445', label: 'SMB (SYSVOL / Share)', shouldAllow: true },
      { port: '3389', label: 'RDP (Windows Remote)', shouldAllow: true },
      { port: '23', label: 'Telnet (Insecure)', shouldAllow: false },
      { port: '21', label: 'FTP (Insecure)', shouldAllow: false }
    ],
    rewardXp: 70,
    rewardCoins: 60,
    explain: 'Windows Domain Controller ใช้พอร์ตหลักคือ 53 (DNS), 389 (LDAP), 445 (SMB) และ 3389 (RDP) โดยปิดบริการเก่าไม่ปลอดภัยอย่าง Telnet/FTP'
  },
  {
    id: 'fw4',
    serverName: 'SRV-MAIL-01 (Enterprise Mail Server)',
    brief: 'เครื่อง Mail Server บน Linux ต้องรับ-ส่งเมลผ่าน SMTP และให้ผู้ใช้ซิงค์เมลด้วย IMAP พร้อม SSH สำหรับผู้ดูแลระบบ ปิดพอร์ตฐานข้อมูลและ Windows Share',
    ports: [
      { port: '22', label: 'SSH (Admin)', shouldAllow: true },
      { port: '25', label: 'SMTP (Mail Send/Relay)', shouldAllow: true },
      { port: '143', label: 'IMAP (Mail Sync)', shouldAllow: true },
      { port: '23', label: 'Telnet', shouldAllow: false },
      { port: '445', label: 'SMB', shouldAllow: false },
      { port: '5432', label: 'PostgreSQL DB', shouldAllow: false }
    ],
    rewardXp: 70,
    rewardCoins: 60,
    explain: 'Mail Server ต้องการ 25 (SMTP) สำหรับรับส่งเมล, 143 (IMAP) สำหรับซิงค์เมล และ 22 (SSH) สำหรับแอดมิน'
  },
  {
    id: 'fw5',
    serverName: 'SRV-MON-01 (Monitoring & SIEM Log Server)',
    brief: 'เซิร์ฟเวอร์เฝ้าระวังระบบและรวมศูนย์ Log ต้องเปิดรับ SNMP, Syslog และเว็บแดชบอร์ด HTTPS พร้อม SSH ส่วนพอร์ตอันตรายอื่นปิดหมด!',
    ports: [
      { port: '22', label: 'SSH (Admin)', shouldAllow: true },
      { port: '161', label: 'SNMP (Monitoring)', shouldAllow: true },
      { port: '514', label: 'Syslog (Central Log)', shouldAllow: true },
      { port: '443', label: 'HTTPS (Dashboard)', shouldAllow: true },
      { port: '23', label: 'Telnet', shouldAllow: false },
      { port: '3389', label: 'RDP', shouldAllow: false }
    ],
    rewardXp: 75,
    rewardCoins: 65,
    explain: 'Monitoring & SIEM Server ใช้ 161 (SNMP), 514 (Syslog), 443 (HTTPS Dashboard) และ 22 (SSH)'
  },
  {
    id: 'fw6',
    serverName: 'SRV-BASTION-01 (Hardened Jump Host)',
    brief: 'เครื่อง Bastion / Jump Host สำหรับเป็นประตูด่านเดียวให้แอดมินผ่านเข้าไปจัดการระบบภายใน ต้องเปิดเฉพาะ SSH (22) พอร์ตเดียวเท่านั้น ปิดทุกพอร์ตที่เหลือทั้งหมด!',
    ports: [
      { port: '22', label: 'SSH (Only Allowed Entry)', shouldAllow: true },
      { port: '21', label: 'FTP', shouldAllow: false },
      { port: '80', label: 'HTTP', shouldAllow: false },
      { port: '443', label: 'HTTPS', shouldAllow: false },
      { port: '3306', label: 'MySQL', shouldAllow: false },
      { port: '3389', label: 'RDP', shouldAllow: false }
    ],
    rewardXp: 80,
    rewardCoins: 70,
    explain: 'Bastion / Jump Host ยึดหลัก Attack Surface น้อยที่สุด จึงเปิดเฉพาะพอร์ต 22 (SSH + Key Auth) เพียงพอร์ตเดียวเท่านั้น!'
  }
];

/* ==================== 6 IP & SUBNET MEDIC PUZZLES ==================== */
const SUBNET_PUZZLES = [
  {
    id: 'sn1',
    title: 'เคส 1: หาจำนวน IP ใช้งานได้จริงของ Subnet /24',
    brief: 'ห้องแล็บได้รับวงเครือข่าย 192.168.50.0/24 (Subnet Mask 255.255.255.0) — ช่วง IP ที่กำหนดให้เครื่องใช้งานได้จริง (Usable Hosts) คือข้อใด?',
    options: [
      '192.168.50.1 ถึง 192.168.50.254 (254 เครื่อง)',
      '192.168.50.0 ถึง 192.168.50.255 (256 เครื่อง)',
      '192.168.50.1 ถึง 192.168.50.126 (126 เครื่อง)',
      '192.168.50.1 ถึง 192.168.50.62 (62 เครื่อง)'
    ],
    answer: 0,
    rewardXp: 55,
    rewardCoins: 45,
    explain: 'สูตร Usable Hosts = 2^(32-24) - 2 = 2^8 - 2 = 254 เครื่อง (หัก .0 Network ID และ .255 Broadcast Address)'
  },
  {
    id: 'sn2',
    title: 'เคส 2: แบ่งครึ่งวงเครือข่ายด้วย Subnet /25',
    brief: 'ฝ่ายไอทีแบ่งวง 192.168.10.0/24 ออกเป็น 2 วงย่อยด้วย /25 (Mask 255.255.255.128) วงแรกคือ 192.168.10.0/25 — Broadcast Address ของวงแรกคือ IP ใด?',
    options: [
      '192.168.10.127',
      '192.168.10.128',
      '192.168.10.255',
      '192.168.10.63'
    ],
    answer: 0,
    rewardXp: 65,
    rewardCoins: 55,
    explain: 'วง /25 มีขนาดบล็อกละ 128 IP: วงแรกคือ .0–.127 (Network=.0, Usable=.1–.126, Broadcast=.127) ส่วนวงที่สองเริ่มที่ .128–.255'
  },
  {
    id: 'sn3',
    title: 'เคส 3: ทำไมสองเครื่องนี้ Ping กันไม่เจอ?',
    brief: 'เครื่อง SRV-A ใช้ IP 192.168.10.50/25 และเครื่อง SRV-B ใช้ IP 192.168.10.150/25 ต่ออยู่ Switch เดียวกันโดยไม่มี Router — เหตุใดทั้งสองเครื่องจึงติดต่อกันโดยตรงไม่ได้?',
    options: [
      'อยู่คนละ Subnet กัน (SRV-A อยู่วง .0–.127 ส่วน SRV-B อยู่วง .128–.255)',
      'สายแลนสีไม่เหมือนกัน',
      'เพราะ 192.168.10.150 เป็น Public IP',
      'เพราะ IP ขึ้นต้นด้วย 192 ติดต่อกันไม่ได้'
    ],
    answer: 0,
    rewardXp: 70,
    rewardCoins: 60,
    explain: 'ภายใต้ /25 ขอบเขตวงแรกสิ้นสุดที่ .127 ดังนั้น .50 และ .150 อยู่คนละ Network ต้องมี Router / Layer-3 Switch ช่วยส่งต่อข้ามวง'
  },
  {
    id: 'sn4',
    title: 'เคส 4: คัดแยก Private IP (RFC 1918)',
    brief: 'ข้อใดต่อไปนี้เป็น "Private IP Address" ที่ใช้ภายในองค์กรได้ฟรีทั้งหมด (ไม่ชนกับ Public IP บนอินเทอร์เน็ต)?',
    options: [
      '10.0.0.5, 172.16.20.10, 192.168.1.100',
      '8.8.8.8, 1.1.1.1, 203.150.10.25',
      '169.254.12.5, 127.0.0.1, 224.0.0.1',
      '172.64.10.1, 192.169.1.1, 11.0.0.1'
    ],
    answer: 0,
    rewardXp: 60,
    rewardCoins: 50,
    explain: 'ช่วง Private IP (RFC 1918) คือ: Class A (10.0.0.0/8), Class B (172.16.0.0 – 172.31.255.255), และ Class C (192.168.0.0/16)'
  },
  {
    id: 'sn5',
    title: 'เคส 5: วินิจฉัย IP พิเศษ (127.0.0.1 & 169.254.x.x)',
    brief: 'เครื่องลูกข่ายแสดง IP 169.254.88.14 ขณะที่แอดมินลอง ping 127.0.0.1 บนเครื่องแม่ข่าย — IP ทั้งสองชุดนี้หมายถึงอะไรตามลำดับ?',
    options: [
      'APIPA (ขอรับ IP จาก DHCP ไม่สำเร็จ) และ Loopback (ทดสอบการ์ดแลน/TCP-IP ของเครื่องตัวเอง)',
      'Public IP ของ Google และ IP ของ Gateway',
      'Broadcast IP และ DNS Server',
      'IPv6 และ MAC Address'
    ],
    answer: 0,
    rewardXp: 65,
    rewardCoins: 55,
    explain: '169.254.0.0/16 คือ APIPA ที่ OS กำหนดเองเมื่อติดต่อ DHCP Server ไม่ได้ ส่วน 127.0.0.1 (localhost) คือ Loopback สำหรับทดสอบระบบเครือข่ายภายในเครื่องเอง'
  },
  {
    id: 'sn6',
    title: 'เคส 6: ลิงก์ Point-to-Point ด้วย Subnet /30',
    brief: 'การเชื่อมต่อระหว่าง Router 2 ตัวแบบ Point-to-Point นิยมใช้ Subnet /30 (Mask 255.255.255.252) เพื่อประหยัด IP — วง /30 มี Usable Host IP กี่หมายเลข?',
    options: [
      '2 หมายเลข (พอดีสำหรับปลายทาง 2 ฝั่ง)',
      '4 หมายเลข',
      '6 หมายเลข',
      '30 หมายเลข'
    ],
    answer: 0,
    rewardXp: 70,
    rewardCoins: 60,
    explain: 'สูตร Usable Hosts ของ /30 = 2^(32-30) - 2 = 2^2 - 2 = 2 หมายเลขพอดีสำหรับ Router ฝั่งซ้ายและฝั่งขวา ไม่เปลือง IP!'
  }
];

/* ==================== 24 LIGHTNING BLITZ QUESTIONS (TRUE / FALSE SPEED RUN) ==================== */
const BLITZ_QUESTIONS = [
  { stmt: 'RAID 0 สามารถทนฮาร์ดดิสก์เสียได้ 1 ลูกโดยข้อมูลไม่สูญหาย', isTrue: false, fact: 'RAID 0 ทำ Striping ล้วน Fault Tolerance = 0 เสีย 1 ลูกข้อมูลหายทั้งหมด!' },
  { stmt: 'เครื่องแม่ข่าย (Server) ควรกำหนดหมายเลข IP แบบ Static IP เสมอ', isTrue: true, fact: 'ถูกต้อง! Static IP ทำให้ IP คงที่ Client และ DNS เชื่อมต่อได้ตลอดเวลา' },
  { stmt: 'โปรโตคอล SSH ใช้พอร์ตมาตรฐานหมายเลข 22 และมีการเข้ารหัสข้อมูล', isTrue: true, fact: 'ถูกต้อง! SSH (Port 22) เข้ารหัสข้อมูลทั้งหมด ปลอดภัยกว่า Telnet (23)' },
  { stmt: 'Telnet (พอร์ต 23) ส่งรหัสผ่านแบบเข้ารหัส AES-256 ที่ปลอดภัยสูงมาก', isTrue: false, fact: 'ผิด! Telnet ส่งข้อมูลและรหัสผ่านเป็นข้อความธรรมดา (Plaintext) ห้ามใช้บน Server จริง' },
  { stmt: 'บน Linux สิทธิ์ไฟล์ chmod 600 หมายถึงเฉพาะเจ้าของ (Owner) อ่านและเขียนได้เท่านั้น', isTrue: true, fact: 'ถูกต้อง! 600 = -rw------- เหมาะสำหรับ SSH Private Key และไฟล์รหัสผ่าน' },
  { stmt: 'RAID 5 หรือ RAID 10 สามารถใช้แทนการทำ Off-site Backup ได้ 100%', isTrue: false, fact: 'ผิด! RAID ไม่ใช่ Backup เพราะหากเผลอลบไฟล์หรือโดน Ransomware ข้อมูลพังทุกดิสก์ทันที' },
  { stmt: 'DNS (Domain Name System) ทำงานบนพอร์ตมาตรฐานหมายเลข 53', isTrue: true, fact: 'ถูกต้อง! DNS ใช้พอร์ต 53 (UDP/TCP) แปลงชื่อโดเมนเป็น IP Address' },
  { stmt: 'DHCP ใช้กระบวนการ DORA: Discover → Offer → Request → Acknowledge', isTrue: true, fact: 'ถูกต้อง! เป็น 4 ขั้นตอนมาตรฐานในการแจก IP อัตโนมัติบนพอร์ต 67/68' },
  { stmt: 'ไฟล์ /etc/shadow บน Linux เก็บรหัสผ่านแบบแฮชและจำกัดให้เฉพาะ root อ่านได้', isTrue: true, fact: 'ถูกต้อง! แยกจาก /etc/passwd เพื่อให้ผู้ใช้ทั่วไปไม่สามารถแอบอ่านแฮชรหัสผ่านได้' },
  { stmt: 'คำสั่ง df -h บน Linux ใช้สำหรับลบไฟล์ขยะทั้งหมดในฮาร์ดดิสก์', isTrue: false, fact: 'ผิด! df -h (Disk Free) ใช้ตรวจสอบพื้นที่ว่างของแต่ละพาร์ติชันแบบอ่านง่าย' },
  { stmt: 'Windows Server ใช้พอร์ต 3389 สำหรับ Remote Desktop Protocol (RDP)', isTrue: true, fact: 'ถูกต้อง! RDP ใช้พอร์ต 3389 สำหรับรีโมทหน้าจอ GUI ของ Windows' },
  { stmt: 'บน Windows Server เมื่อ Share Permission กับ NTFS Permission รวมกัน จะยึดสิทธิ์ที่กว้างกว่าเสมอ', isTrue: false, fact: 'ผิด! Windows จะยึดสิทธิ์ที่ "เข้มงวดที่สุด (Most Restrictive)" เสมอ' },
  { stmt: 'ECC RAM ในเครื่องแม่ข่ายช่วยตรวจจับและแก้ไขข้อผิดพลาดของบิตในหน่วยความจำอัตโนมัติ', isTrue: true, fact: 'ถูกต้อง! ลดอาการข้อมูลเพี้ยนและระบบแครชเมื่อรัน 24/7' },
  { stmt: 'กฎ 3-2-1 Backup Rule กำหนดให้เก็บสำเนาอย่างน้อย 1 ชุดไว้นอกสถานที่ (Off-site)', isTrue: true, fact: 'ถูกต้อง! 3 ชุด • 2 ชนิดสื่อ • 1 ชุด Off-site' },
  { stmt: 'RAID 6 สามารถทนฮาร์ดดิสก์เสียพร้อมกันได้ถึง 2 ลูก (Dual Parity)', isTrue: true, fact: 'ถูกต้อง! ใช้ดิสก์อย่างน้อย 4 ลูก ความจุใช้งานคือ (N-2)' },
  { stmt: 'Docker Container ต้องบูตระบบปฏิบัติการ Guest OS แยกเต็มรูปแบบเหมือน VM ทุกตัว', isTrue: false, fact: 'ผิด! Container แชร์ Kernel ของ Host OS จึงเบาและเริ่มทำงานเร็วกว่า VM มาก' },
  { stmt: 'คำสั่ง gpupdate /force บน Windows ใช้บังคับอัปเดตนโยบาย Group Policy ทันที', isTrue: true, fact: 'ถูกต้อง! ไม่ต้องรอรอบอัปเดตปกติ 90 นาที' },
  { stmt: 'Subnet 192.168.1.0/24 มีหมายเลข IP ที่กำหนดให้เครื่องใช้งานจริงได้ 256 หมายเลข', isTrue: false, fact: 'ผิด! ใช้งานได้จริง 254 หมายเลข เพราะต้องหัก Network ID (.0) และ Broadcast (.255)' },
  { stmt: 'โปรโตคอล NTP (พอร์ต 123) ใช้สำหรับเทียบเวลาของเครื่อง Server ทุกเครื่องให้ตรงกัน', isTrue: true, fact: 'ถูกต้อง! สำคัญมากต่อ Kerberos (AD), SSL และ Log Audit' },
  { stmt: 'คำสั่ง chown บน Linux ใช้เปลี่ยนสิทธิ์ rwx ของไฟล์ ส่วน chmod ใช้เปลี่ยนเจ้าของไฟล์', isTrue: false, fact: 'สลับกัน! chmod เปลี่ยนสิทธิ์ rwx ส่วน chown (Change Owner) เปลี่ยนเจ้าของไฟล์' },
  { stmt: 'DMZ คือโซนเครือข่ายกันชนสำหรับวาง Web Server สาธารณะแยกออกจากฐานข้อมูลภายใน', isTrue: true, fact: 'ถูกต้อง! ลดความเสียหายหากเครื่องสาธารณะถูกโจมตี' },
  { stmt: 'Windows Event ID 4625 บันทึกเหตุการณ์เมื่อมีการล็อกอินไม่สำเร็จ (Failed Logon)', isTrue: true, fact: 'ถูกต้อง! ใช้ตรวจจับ Brute-Force Attack บน Windows Server ได้ดีมาก' },
  { stmt: 'ตารางเวลา Cron "0 2 * * *" หมายถึงรันงานทุกวันเวลา 02:00 น.', isTrue: true, fact: 'ถูกต้อง! นาทีที่ 0 ชั่วโมงที่ 2 ทุกวัน ทุกเดือน ทุกวันในสัปดาห์' },
  { stmt: 'RTO คือช่วงเวลาข้อมูลย้อนหลังสูงสุดที่ยอมให้สูญหายได้ ส่วน RPO คือเวลากู้ระบบ', isTrue: false, fact: 'สลับกัน! RTO (Time) = เวลากู้ระบบสูงสุดที่ยอมได้ • RPO (Point) = จุดข้อมูลย้อนหลังที่ยอมสูญหายได้' }
];

/* ==================== 30 CERTIFICATION EXAM QUESTIONS (RANDOM 15) ==================== */
const EXAM_BANK = [
  { category: 'fundamentals', q: 'ข้อใดคือข้อได้เปรียบหลักของสถาปัตยกรรม Client-Server เมื่อเทียบกับ Peer-to-Peer ในองค์กรขนาด 100 เครื่อง?', options: ['ไม่ต้องใช้สายแลนหรือสวิตช์', 'รวมศูนย์การจัดการบัญชีผู้ใช้ ความปลอดภัย และการสำรองข้อมูลไว้ที่จุดเดียว', 'ทุกเครื่องไม่ต้องติดตั้งระบบปฏิบัติการ', 'ทำให้เครื่องลูกข่ายกลายเป็นเครื่องแม่ข่ายพร้อมกันทุกเครื่อง'], answer: 1, explain: 'Client-Server ช่วยให้ผู้ดูแลระบบบริหารจัดการบัญชี สิทธิ์ นโยบาย และข้อมูลจากศูนย์กลางได้อย่างมีประสิทธิภาพ' },
  { category: 'fundamentals', q: 'ระบบปฏิบัติการใดต่อไปนี้จัดเป็น Server OS ทั้งหมด?', options: ['Windows Server 2022, Ubuntu Server, Rocky Linux', 'Windows 11 Home, Android 14, iOS', 'macOS Home, ChromeOS, Nintendo OS', 'MS-DOS, Windows 98, Symbian'], answer: 0, explain: 'Windows Server, Ubuntu Server และ Rocky Linux/RHEL ล้วนออกแบบมาสำหรับงานเครื่องแม่ข่ายโดยเฉพาะ' },
  { category: 'hardware', q: 'หน้าที่สำคัญของ ECC RAM ในเครื่องแม่ข่ายคือข้อใด?', options: ['เพิ่มความสว่างของจอภาพ', 'ตรวจจับและแก้ไขข้อผิดพลาดของข้อมูลในหน่วยความจำอัตโนมัติ ลดอาการระบบล่ม', 'สำรองไฟแทน UPS ได้ 2 ชั่วโมง', 'เพิ่มจำนวนพอร์ต USB ด้านหลังเครื่อง'], answer: 1, explain: 'ECC RAM แก้ Single-bit Error อัตโนมัติ ช่วยให้เครื่องแม่ข่ายทำงาน 24/7 ได้อย่างเสถียร' },
  { category: 'hardware', q: 'ข้อใดคือตัวอย่างของ Type-1 (Bare-Metal) Hypervisor ที่ใช้ใน Data Center?', options: ['VMware ESXi, Proxmox VE, Microsoft Hyper-V', 'Google Chrome, Firefox, Edge', 'Microsoft Word, Excel, PowerPoint', 'WinRAR, 7-Zip, Notepad++'], answer: 0, explain: 'Type-1 Hypervisor ติดตั้งตรงบนฮาร์ดแวร์โดยไม่ผ่าน Host OS จึงมีประสิทธิภาพสูงสุด' },
  { category: 'hardware', q: 'เหตุใด Docker Container จึงเปิดทำงานได้เร็วและกินทรัพยากรน้อยกว่า Virtual Machine (VM)?', options: ['เพราะ Container แชร์ Kernel ของ Host OS ไม่ต้องบูต Guest OS แยกเต็มระบบ', 'เพราะ Container ไม่ใช้ RAM เลย', 'เพราะ Container ไม่ต้องใช้ซีพียู', 'เพราะ VM ไม่สามารถรันเว็บเซิร์ฟเวอร์ได้'], answer: 0, explain: 'Container เป็น OS-level Virtualization แชร์ Host Kernel จึงเบากว่าและสตาร์ตได้ภายในเสี้ยววินาที' },
  { category: 'hardware', q: 'อุปกรณ์ใดช่วยกระจายทราฟฟิกไปยัง Web Server หลายเครื่องและตัดเครื่องที่ล่มออกอัตโนมัติ?', options: ['Load Balancer', 'Dot-Matrix Printer', 'Sound Card', 'KVM Mouse'], answer: 0, explain: 'Load Balancer ช่วยกระจายภาระงานและทำ Health Check เพื่อให้ได้ High Availability (HA)' },
  { category: 'storage', q: 'หากนำฮาร์ดดิสก์ 4 ลูก ขนาดลูกละ 2 TB มาทำ RAID 5 จะได้พื้นที่ใช้งานจริงเท่าใด และทนเสียได้กี่ลูก?', options: ['8 TB / 0 ลูก', '6 TB / 1 ลูก', '4 TB / 2 ลูก', '2 TB / 3 ลูก'], answer: 1, explain: 'RAID 5 มีความจุ (N-1) = 3 × 2 TB = 6 TB และทนดิสก์เสียได้ 1 ลูก' },
  { category: 'storage', q: 'RAID ระดับใดที่มี Dual Parity สามารถทนฮาร์ดดิสก์เสียพร้อมกันได้ 2 ลูกใด ๆ ก็ตาม?', options: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6'], answer: 3, explain: 'RAID 6 ใช้ Parity 2 ชุด ทนดิสก์เสียพร้อมกันได้ถึง 2 ลูก ความจุใช้งาน (N-2)' },
  { category: 'storage', q: 'RAID ระดับใดเหมาะสมที่สุดสำหรับ Database Server ที่ต้องการความเร็วเขียนสูง (High IOPS) และยังทนดิสก์เสียได้?', options: ['RAID 0', 'RAID 10 (1+0)', 'ไม่ใช้ RAID', 'Floppy RAID'], answer: 1, explain: 'RAID 10 ผสาน Mirror + Stripe ไม่มีภาระคำนวณ Parity จึงให้ประสิทธิภาพการอ่าน-เขียนสูงสุดแบบปลอดภัย' },
  { category: 'storage', q: 'File System ใดเป็นมาตรฐานยอดนิยมของ Linux Server สมัยใหม่?', options: ['ext4 และ XFS', 'FAT12 และ FAT16', 'exFAT เท่านั้น', 'CDFS'], answer: 0, explain: 'Linux Server นิยมใช้ ext4, XFS และ ZFS ซึ่งรองรับ Journaling และไฟล์ขนาดใหญ่' },
  { category: 'network', q: 'เหตุใดเครื่องแม่ข่ายจึงควรกำหนดเป็น Static IP แทนที่จะรับ IP แบบสุ่มจาก DHCP?', options: ['เพื่อให้หมายเลข IP คงที่ ไม่เปลี่ยนแปลง ทำให้ Client และ DNS ติดต่อได้เสมอ', 'เพราะ Static IP ไม่ต้องใช้สายแลน', 'เพราะ DHCP ใช้ได้เฉพาะมือถือ', 'เพื่อประหยัดค่าไฟ'], answer: 0, explain: 'เครื่องแม่ข่ายต้องมีที่อยู่ IP คงที่เพื่อให้เครื่องลูกข่ายและบริการอื่นเชื่อมต่อไปยังจุดหมายเดิมได้ตลอดเวลา' },
  { category: 'network', q: 'ขั้นตอนการขอรับหมายเลข IP อัตโนมัติของ DHCP (DORA) เรียงลำดับอย่างไร?', options: ['Discover → Offer → Request → Acknowledge', 'Delete → Open → Reset → Accept', 'Download → Order → Run → Apply', 'Direct → Output → Route → Address'], answer: 0, explain: 'DHCP ใช้ 4 ขั้นตอน DORA: Discover, Offer, Request, Acknowledge บนพอร์ต UDP 67/68' },
  { category: 'network', q: 'DNS Record ประเภทใดใช้แปลงชื่อโดเมนเป็น IPv4 และประเภทใดใช้ระบุ Mail Server?', options: ['A Record และ MX Record', 'MX Record และ PTR Record', 'TXT Record และ NS Record', 'CNAME และ DHCP'], answer: 0, explain: 'A Record ชี้ไปยัง IPv4 (AAAA สำหรับ IPv6) ส่วน MX Record ชี้ไปยัง Mail Server ของโดเมน' },
  { category: 'network', q: 'เครือข่าย 192.168.1.0/24 (Subnet Mask 255.255.255.0) มีหมายเลข IP ที่กำหนดให้เครื่องใช้งานได้จริงกี่หมายเลข?', options: ['254 หมายเลข', '256 หมายเลข', '128 หมายเลข', '100 หมายเลข'], answer: 0, explain: '256 - 2 (หัก Network Address .0 และ Broadcast Address .255) = 254 Usable Hosts' },
  { category: 'network', q: 'พอร์ตมาตรฐาน 3389, 445 และ 123 ตรงกับบริการใดตามลำดับ?', options: ['RDP, SMB และ NTP', 'HTTP, FTP และ DNS', 'SSH, SMTP และ POP3', 'MySQL, LDAP และ SNMP'], answer: 0, explain: '3389 = RDP (Windows Remote), 445 = SMB (Windows File Share), 123 = NTP (Time Sync)' },
  { category: 'network', q: 'หากต้องการสืบค้นข้อมูลไดเรกทอรี Active Directory (LDAP) และมอนิเตอร์อุปกรณ์เครือข่าย (SNMP) ใช้พอร์ตใดตามลำดับ?', options: ['389 และ 161', '80 และ 443', '21 และ 22', '25 และ 110'], answer: 0, explain: 'LDAP ใช้พอร์ต 389 (LDAPS 636) และ SNMP ใช้พอร์ต 161' },
  { category: 'users', q: 'บน Windows Server องค์ประกอบใดใน Active Directory ใช้บังคับนโยบายความปลอดภัยลงเครื่องลูกข่ายทั้งแผนกพร้อมกัน?', options: ['Group Policy Object (GPO)', 'Disk Cleanup', 'Windows Paint', 'Taskbar Settings'], answer: 0, explain: 'GPO ผูกกับ Domain หรือ OU เพื่อกระจายนโยบายความปลอดภัยและการตั้งค่าจากส่วนกลาง' },
  { category: 'users', q: 'หากโฟลเดอร์แชร์บน Windows Server ตั้ง Share Permission = Full Control แต่ NTFS Permission = Read สิทธิ์จริงเมื่อเข้าผ่านเครือข่ายคือข้อใด?', options: ['Read (ยึดสิทธิ์ที่เข้มงวดที่สุด)', 'Full Control', 'Modify', 'ไม่มีผลใด ๆ'], answer: 0, explain: 'เมื่อ Share กับ NTFS รวมกัน ระบบ Windows จะยึดสิทธิ์ที่เข้มงวดที่สุด (Most Restrictive) เสมอ' },
  { category: 'users', q: 'บน Linux ไฟล์ใดที่เก็บรหัสผ่านแบบแฮช (Hashed Passwords) ของผู้ใช้และจำกัดให้เฉพาะ root อ่านได้?', options: ['/etc/shadow', '/etc/passwd', '/etc/hosts', '/var/www'], answer: 0, explain: '/etc/shadow แยกเก็บรหัสผ่านที่เข้ารหัสไว้ต่างหากเพื่อป้องกันผู้ใช้ทั่วไปแอบอ่าน' },
  { category: 'users', q: 'สิทธิ์ไฟล์ Linux "-rwxr-x---" ตรงกับรหัสเลขฐานแปดใด?', options: ['750', '755', '640', '600'], answer: 0, explain: 'rwx = 4+2+1 = 7, r-x = 4+1 = 5, --- = 0 รวมเป็น 750' },
  { category: 'users', q: 'คำสั่งใดบน Linux ใช้เปลี่ยนเจ้าของไฟล์ (Owner) และกลุ่มเจ้าของ (Group)?', options: ['chown', 'chmod', 'ping', 'df'], answer: 0, explain: 'chown = Change Owner (เปลี่ยนเจ้าของ/กลุ่ม), ส่วน chmod = Change Mode (เปลี่ยนสิทธิ์ rwx)' },
  { category: 'cli', q: 'คำสั่งใดบน Linux ใช้รีสตาร์ทบริการ Apache (apache2) และดู Log ของบริการนั้น?', options: ['systemctl restart apache2 และ journalctl -u apache2', 'ipconfig /all และ gpupdate', 'mkdir apache2 และ rm apache2', 'whoami และ hostname'], answer: 0, explain: 'systemctl จัดการสถานะบริการ ส่วน journalctl -u ดูบันทึกเหตุการณ์ของบริการใน systemd' },
  { category: 'cli', q: 'คำสั่งใดใช้ดูพื้นที่ว่างของทุกพาร์ติชัน และคำสั่งใดใช้หาว่าโฟลเดอร์ย่อยใดกินพื้นที่มากที่สุดบน Linux?', options: ['df -h และ du -sh', 'top และ kill', 'chmod และ useradd', 'ping และ traceroute'], answer: 0, explain: 'df -h ดูพื้นที่ว่างทั้งพาร์ติชัน ส่วน du -sh สรุปขนาดของแต่ละโฟลเดอร์/ไฟล์' },
  { category: 'cli', q: 'คำสั่งใดบน Windows Server PowerShell ใช้บังคับอัปเดต Group Policy ทันที?', options: ['gpupdate /force', 'systemctl reload gpo', 'ufw reload', 'apt update'], answer: 0, explain: 'gpupdate /force ใช้บังคับโหลดนโยบาย GPO ใหม่จาก Domain Controller ทันที' },
  { category: 'cli', q: 'คำสั่งใดบน Windows PowerShell ใช้ทดสอบการเชื่อมต่อพอร์ต TCP ของเครื่องแม่ข่ายปลายทาง?', options: ['Test-NetConnection <host> -Port <port>', 'chmod 443', 'df -h', 'useradd -p 443'], answer: 0, explain: 'Test-NetConnection (หรือ tnc) ใช้ตรวจสอบว่าพอร์ตปลายทางเปิดและเชื่อมต่อได้หรือไม่' },
  { category: 'security', q: 'เหตุใดจึงควรวาง Web Server สาธารณะไว้ในโซน DMZ?', options: ['เพื่อแยกเครื่องที่รับทราฟฟิกจากอินเทอร์เน็ตออกจากเครือข่ายภายใน ลดความเสียหายหากถูกเจาะ', 'เพื่อให้ไม่ต้องตั้งรหัสผ่านให้ Web Server', 'เพื่อให้ไม่ต้องใช้ Firewall', 'เพื่อเพิ่มความเร็วฮาร์ดดิสก์ 10 เท่า'], answer: 0, explain: 'DMZ เป็นพื้นที่กันชนป้องกันไม่ให้ผู้บุกรุกที่ยึด Web Server ได้เข้าถึงฐานข้อมูลใน Internal LAN โดยตรง' },
  { category: 'security', q: 'เหตุใด SSH (พอร์ต 22) จึงปลอดภัยกว่า Telnet (พอร์ต 23)?', options: ['SSH เข้ารหัสข้อมูลและรหัสผ่านทั้งหมดระหว่างรับส่ง ส่วน Telnet ส่งเป็นข้อความธรรมดา', 'Telnet ใช้ไม่ได้กับ Linux', 'SSH ไม่ต้องใช้เครือข่าย', 'Telnet ไม่มีพอร์ตมาตรฐาน'], answer: 0, explain: 'Telnet ส่งข้อมูลแบบ Plaintext เสี่ยงถูกดักจับ (Sniffing) จึงต้องใช้ SSH แทนเสมอ' },
  { category: 'security', q: 'หลักการ CIA Triad ประกอบด้วย 3 เสาหลักใดบ้าง?', options: ['Confidentiality, Integrity, Availability', 'CPU, IP, Admin', 'Cloud, Internet, App', 'Create, Insert, Alter'], answer: 0, explain: 'CIA Triad = ความลับ (Confidentiality), ความถูกต้องสมบูรณ์ (Integrity), ความพร้อมใช้งาน (Availability)' },
  { category: 'backup', q: 'ความหมายของ RTO และ RPO ในแผนกู้คืนภัยพิบัติ (Disaster Recovery) คือข้อใด?', options: ['RTO = เวลากู้ระบบสูงสุดที่ยอมได้ • RPO = ช่วงข้อมูลย้อนหลังสูงสุดที่ยอมให้หายได้', 'RTO = ขนาดดิสก์ • RPO = ความเร็วเน็ต', 'RTO = ชื่อผู้ใช้ • RPO = รหัสผ่าน', 'ทั้งสองคำหมายถึงจำนวนดิสก์ใน RAID'], answer: 0, explain: 'RTO (Recovery Time Objective) คือระยะเวลา Downtime ที่รับได้ ส่วน RPO (Recovery Point Objective) คือจุดข้อมูลที่ยอมสูญเสียได้' },
  { category: 'backup', q: 'หากมี Full Backup วันอาทิตย์ และ Differential Backup ทุกวัน (จันทร์–พุธ) เมื่อเกิดเหตุวันพฤหัสฯ ต้องใช้กี่ชุดในการ Restore?', options: ['2 ชุด (Full วันอาทิตย์ + Differential วันพุธล่าสุด)', '4 ชุดครบทุกวัน', '1 ชุดคือ Differential วันพุธอย่างเดียว', 'กู้คืนไม่ได้เพราะไม่มี Incremental'], answer: 0, explain: 'Differential Backup เก็บข้อมูลที่เปลี่ยนทั้งหมดนับจาก Full ล่าสุด จึงใช้แค่ Full + Differential ล่าสุดเพียง 2 ชุดในการกู้คืน' },
  { category: 'cloud', q: 'คำสั่ง "docker run -d -p 8080:80 nginx" ออปชัน -p 8080:80 มีความหมายว่าอย่างไร?', options: ['เชื่อมโยงพอร์ต 8080 ของเครื่อง Host เข้าสู่พอร์ต 80 ภายใน Container', 'เปิดพอร์ตตั้งแต่ 80 ถึง 8080 ทั้งหมด', 'ตั้งรหัสผ่านเข้า Nginx เป็น 8080', 'จำกัดความเร็วเน็ตที่ 80 Mbps'], answer: 0, explain: 'รูปแบบ -p HostPort:ContainerPort ใช้รับทราฟฟิกจากภายนอกที่พอร์ต 8080 ส่งเข้าพอร์ต 80 ใน Container' },
  { category: 'cloud', q: 'หากต้องการเก็บข้อมูลฐานข้อมูลใน Docker Container ให้คงอยู่ถาวรแม้จะลบและสร้าง Container ใหม่ ควรใช้อะไร?', options: ['Docker Volume (หรือ Bind Mount)', 'RAM ชั่วคราว', 'คำสั่ง docker kill', 'ไฟล์ /tmp ใน Container'], answer: 0, explain: 'Docker Volume แยกที่เก็บข้อมูลออกจาก Container ทำให้ข้อมูลไม่สูญหายเมื่ออัปเดตหรือลบ Container' },
  { category: 'cloud', q: 'ตารางเวลา Cron Job "0 3 * * 0" บน Linux Server สั่งให้สคริปต์ทำงานเมื่อใด?', options: ['ทุกวันอาทิตย์ เวลา 03:00 น.', 'ทุกวัน เวลา 00:03 น.', 'ทุก 3 ชั่วโมงตลอดปี', 'เฉพาะวันที่ 3 ของทุกเดือน'], answer: 0, explain: 'นาที=0, ชั่วโมง=3, วันที่=*, เดือน=*, วันในสัปดาห์=0 (วันอาทิตย์) คือทุกวันอาทิตย์เวลา 03:00 น.' },
  { category: 'cloud', q: 'บริการ Cloud ที่ให้เช่าเครื่องเสมือน (VM), ดิสก์ และเครือข่าย โดยผู้ใช้เป็นผู้ติดตั้งและดูแล OS เองจัดเป็นโมเดลใด?', options: ['IaaS (Infrastructure as a Service)', 'SaaS (Software as a Service)', 'PaaS (Platform as a Service)', 'LAN Only'], answer: 0, explain: 'IaaS (เช่น AWS EC2, Google Compute Engine) ให้โครงสร้างพื้นฐานโดยผู้ดูแลระบบควบคุม OS และซอฟต์แวร์เอง' },
  { category: 'cloud', q: 'บทบาทใดของ Nginx ที่ใช้รับ HTTPS พอร์ต 443 จากภายนอกแล้วส่งต่อคำขอไปยังแอปภายในพอร์ต 3000/8000?', options: ['Reverse Proxy', 'DHCP Relay', 'Print Server', 'NTP Client'], answer: 0, explain: 'Reverse Proxy ช่วยรวมศูนย์ SSL/TLS, ซ่อนพอร์ตแอปภายใน และช่วยกระจายโหลดได้' },
  { category: 'network', q: 'วงเครือข่าย 192.168.10.0/25 (Mask 255.255.255.128) มี Broadcast Address อยู่ที่หมายเลขใด?', options: ['192.168.10.127', '192.168.10.128', '192.168.10.255', '192.168.10.63'], answer: 0, explain: 'วง /25 แบ่งบล็อกละ 128 IP: วงแรกคือ .0 ถึง .127 โดย .127 คือ Broadcast Address' },
  { category: 'forensics', q: 'ไฟล์ Log ใดบน Ubuntu Server ที่บันทึกประวัติการล็อกอิน SSH และการใช้คำสั่ง sudo?', options: ['/var/log/auth.log', '/etc/hosts', '/bin/bash', '/boot/vmlinuz'], answer: 0, explain: '/var/log/auth.log บน Ubuntu/Debian เก็บเหตุการณ์ยืนยันตัวตน SSH และ sudo (ส่วน RHEL/Rocky คือ /var/log/secure)' },
  { category: 'forensics', q: 'บน Windows Server Event Viewer หมายเลข Event ID ใดใช้ตรวจจับการล็อกอินผิดพลาด (Failed Logon)?', options: ['Event ID 4625', 'Event ID 404', 'Event ID 80', 'Event ID 22'], answer: 0, explain: 'Event ID 4625 คือ Failed Logon (พบจำนวนมากแสดงว่าอาจโดน Brute-Force) ส่วน 4624 คือล็อกอินสำเร็จ' },
  { category: 'forensics', q: 'คำสั่งใดบน Linux ใช้ติดตามบรรทัดใหม่ของไฟล์ Error Log แบบเรียลไทม์ (Real-time)?', options: ['tail -f /var/log/nginx/error.log', 'rm -rf /var/log/nginx', 'mkdir /var/log/nginx', 'chmod 000 /var/log/nginx'], answer: 0, explain: 'tail -f แสดงท้ายไฟล์และอัปเดตข้อความใหม่ทันทีที่ระบบเขียนลงไฟล์ Log' },
  { category: 'forensics', q: 'ในกระบวนการรับมือเหตุการณ์ไซเบอร์ (Incident Response) ขั้นตอน "Containment" ที่ถูกต้องทันทีที่พบ Server ติดมัลแวร์คือข้อใด?', options: ['ตัดแยกเครื่องออกจากเครือข่ายเพื่อหยุดการแพร่กระจายโดยยังคงเก็บหลักฐาน Log ไว้ตรวจสอบ', 'รีบฟอร์แมตดิสก์ทิ้งทันทีโดยไม่เก็บ Log', 'ปล่อยไว้จนกว่าจะหมดสัปดาห์', 'ปิด Firewall ทุกเครื่องเพื่อเช็กสัญญาณ'], answer: 0, explain: 'Containment คือจำกัดวงความเสียหายทันทีโดยรักษาหลักฐานทางนิติวิทยา (Forensics) ไว้หาต้นตอช่องโหว่' },
  { category: 'hardware', q: 'ระบบจัดการเครื่องแม่ข่ายระยะไกลแบบ Out-of-Band เช่น Dell iDRAC, HPE iLO หรือ IPMI มีประโยชน์อย่างไร?', options: ['สามารถสั่งเปิด-ปิดเครื่องและดูหน้าจอ BIOS ผ่านเครือข่ายได้แม้ระบบปฏิบัติการ OS ล่ม', 'ใช้เพิ่มความเร็ว Wi-Fi ให้โน้ตบุ๊ก', 'ใช้แทนระบบสำรองข้อมูล 3-2-1', 'ใช้สำหรับออกแบบเว็บไซต์ HTML'], answer: 0, explain: 'IPMI/iDRAC/iLO เป็นการ์ดจัดการแยกอิสระจาก OS ทำให้ผู้ดูแลระบบกู้เครื่องหรือรีบูตจากระยะไกลได้แม้เครื่องค้างหรือ OS พัง' },
  { category: 'storage', q: 'คำกล่าวว่า "RAID ไม่ใช่ Backup (RAID is NOT a Backup)" มีเหตุผลสำคัญมาจากข้อใด?', options: ['RAID ป้องกันเฉพาะฮาร์ดดิสก์เสีย แต่หากไฟล์ถูกลบหรือโดน Ransomware เข้ารหัส ข้อมูลจะเสียหายพร้อมกันทุกดิสก์', 'RAID เก็บข้อมูลได้เพียง 100 MB เท่านั้น', 'RAID ใช้ไม่ได้กับระบบปฏิบัติการ Linux', 'RAID ไม่สามารถอ่านไฟล์ข้อความได้'], answer: 0, explain: 'RAID ช่วยเรื่อง Availability เมื่อดิสก์พัง แต่ไม่สามารถย้อนเวลากู้ไฟล์ที่ถูกลบหรือถูก Ransomware เข้ารหัสได้ จึงต้องมี Backup แยกเสมอ' },
  { category: 'network', q: 'หากเครื่องลูกข่ายในห้องปฏิบัติการแสดง IP เป็น 169.254.23.10 (APIPA) สาเหตุหลักเกิดจากอะไร?', options: ['เครื่องลูกข่ายไม่สามารถติดต่อขอรับหมายเลข IP จาก DHCP Server ได้', 'การ์ดจอเสีย', 'รหัสผ่าน Windows หมดอายุ', 'เปิดพอร์ต HTTPS 443 ซ้ำกัน'], answer: 0, explain: 'APIPA (169.254.0.0/16) จะถูกกำหนดอัตโนมัติเมื่อเครื่องที่ตั้งรับ IP แบบ DHCP ติดต่อ DHCP Server ไม่สำเร็จ' },
  { category: 'network', q: 'ข้อใดต่อไปนี้เป็นช่วง Private IP Address ตามมาตรฐาน RFC 1918 ทั้งหมด?', options: ['10.0.0.1, 172.16.5.10, 192.168.10.20', '8.8.8.8, 1.1.1.1, 203.150.10.1', '127.0.0.1, 169.254.1.1, 224.0.0.1', '172.64.0.1, 192.169.1.1, 9.9.9.9'], answer: 0, explain: 'ช่วง Private IP ได้แก่ 10.0.0.0/8, 172.16.0.0–172.31.255.255 และ 192.168.0.0/16' },
  { category: 'network', q: 'เครือข่าย Point-to-Point ที่ใช้ Subnet /30 (255.255.255.252) มีหมายเลข IP ที่กำหนดให้เครื่องใช้งานได้จริงกี่หมายเลข?', options: ['2 หมายเลข', '4 หมายเลข', '14 หมายเลข', '30 หมายเลข'], answer: 0, explain: '2^(32-30) - 2 = 4 - 2 = 2 Usable Host IPs พอดีสำหรับการเชื่อมต่อระหว่าง Router 2 ฝั่ง' },
  { category: 'users', q: 'คำสั่งใดบน Ubuntu Server ใช้เพิ่มผู้ใช้ชื่อ student01 เข้ากลุ่ม sudo โดยไม่ลบกลุ่มเดิมที่มีอยู่?', options: ['usermod -aG sudo student01', 'chmod 777 student01', 'df -h student01', 'ping sudo student01'], answer: 0, explain: 'usermod -aG (-a append, -G supplementary group) เพิ่มผู้ใช้เข้ากลุ่มใหม่โดยไม่ทับกลุ่มเดิม' },
  { category: 'cli', q: 'คำสั่งใดบน Linux ใช้บีบอัดโฟลเดอร์ /var/www/html ให้เป็นไฟล์สำรอง backup.tar.gz?', options: ['tar -czvf backup.tar.gz /var/www/html', 'ufw allow backup.tar.gz', 'ip a /var/www/html', 'nslookup backup.tar.gz'], answer: 0, explain: 'tar -czvf (-c create, -z gzip, -v verbose, -f file) เป็นคำสั่งมาตรฐานในการสร้างไฟล์สำรองแบบบีบอัดบน Linux' },
  { category: 'cli', q: 'คำสั่งใดบน Windows Server ใช้ล้างแคชการแปลงชื่อโดเมน (DNS Resolver Cache)?', options: ['ipconfig /flushdns', 'systemctl restart dns', 'chmod 53 dns', 'apt clean dns'], answer: 0, explain: 'ipconfig /flushdns ล้าง DNS Cache เก่าบน Windows เพื่อให้เครื่องสอบถาม IP ล่าสุดจาก DNS Server ใหม่' },
  { category: 'security', q: 'ก่อนสั่งเปิดใช้งาน Firewall ด้วย "ufw enable" บนเครื่อง Linux ที่รีโมทผ่าน SSH อยู่ ข้อควรระวังสำคัญที่สุดคืออะไร?', options: ['ต้องสั่ง "ufw allow 22" อนุญาตพอร์ต SSH ก่อนเสมอ เพื่อไม่ให้เผลอตัดการเชื่อมต่อของตัวเอง', 'ต้องลบผู้ใช้ root ทิ้งก่อน', 'ต้องเปิดพอร์ต Telnet 23 ไว้สำรอง', 'ต้องปิดการ์ดเครือข่าย eth0 ก่อน'], answer: 0, explain: 'หากตั้ง Default Deny Incoming แล้วเปิด ufw enable โดยยังไม่ allow พอร์ต 22 แอดมินจะถูกล็อกออกจากเครื่องทันที!' },
  { category: 'forensics', q: 'อาการที่หน่วยความจำ RAM ของเครื่องแม่ข่ายเต็มจนระบบต้องเขียน-อ่านสลับลงพื้นที่ Swap บนดิสก์อย่างหนักจนเครื่องอืดค้างเรียกว่าอะไร?', options: ['Swap Thrashing', 'Load Balancing', 'Port Forwarding', 'DNS Caching'], answer: 0, explain: 'Swap Thrashing เกิดเมื่อ RAM ไม่พอจน OS สลับหน้าหน่วยความจำลงดิสก์ตลอดเวลา ทำให้ Load Average พุ่งสูงและระบบตอบสนองช้ามาก' }
];
