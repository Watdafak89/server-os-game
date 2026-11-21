/* ServerOps: Interactive Illustrated Textbook Library (10 Comprehensive Volumes) */
const CODEX_VOLUMES = [
  {
    id: 'vol1',
    vol: 'บทที่ 1',
    icon: '🖥️',
    color: '#38bdf8',
    title: 'พื้นฐาน Server OS & สถาปัตยกรรมเครือข่าย',
    subtitle: 'Client-Server vs P2P, ประเภทของ Server และเปรียบเทียบ Windows Server กับ Linux Server',
    readTime: '4 นาที',
    objectives: [
      'อธิบายความแตกต่างระหว่างสถาปัตยกรรม Client-Server และ Peer-to-Peer (P2P) ได้',
      'จำแนกบทบาทของเครื่องแม่ข่ายแต่ละประเภทในองค์กรได้ถูกต้อง',
      'เปรียบเทียบจุดเด่นของ Windows Server และ Linux Server เพื่อเลือกใช้งานได้เหมาะสม'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 230" class="codex-svg">
        <rect width="760" height="230" rx="14" fill="#0b1325" />
        <!-- Left: Client-Server -->
        <text x="190" y="28" text-anchor="middle" fill="#38bdf8" font-size="15" font-weight="700">Client-Server (รวมศูนย์ — องค์กร)</text>
        <rect x="145" y="48" width="90" height="58" rx="10" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2" />
        <text x="190" y="74" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="700">SERVER</text>
        <text x="190" y="92" text-anchor="middle" fill="#7dd3fc" font-size="10">AD / Web / File</text>
        <line x1="165" y1="106" x2="85" y2="155" stroke="#34d399" stroke-width="2" stroke-dasharray="5 3" />
        <line x1="190" y1="106" x2="190" y2="155" stroke="#34d399" stroke-width="2" stroke-dasharray="5 3" />
        <line x1="215" y1="106" x2="295" y2="155" stroke="#34d399" stroke-width="2" stroke-dasharray="5 3" />
        <rect x="45" y="155" width="80" height="44" rx="8" fill="#162238" stroke="#94a3b8" />
        <text x="85" y="182" text-anchor="middle" fill="#e2e8f0" font-size="12">Client 1</text>
        <rect x="150" y="155" width="80" height="44" rx="8" fill="#162238" stroke="#94a3b8" />
        <text x="190" y="182" text-anchor="middle" fill="#e2e8f0" font-size="12">Client 2</text>
        <rect x="255" y="155" width="80" height="44" rx="8" fill="#162238" stroke="#94a3b8" />
        <text x="295" y="182" text-anchor="middle" fill="#e2e8f0" font-size="12">Client 3</text>
        <!-- Divider -->
        <line x1="380" y1="20" x2="380" y2="210" stroke="rgba(148,163,184,0.25)" stroke-dasharray="6 6" />
        <!-- Right: Peer-to-Peer -->
        <text x="570" y="28" text-anchor="middle" fill="#fbbf24" font-size="15" font-weight="700">Peer-to-Peer (เท่าเทียม — บ้าน/ขนาดเล็ก)</text>
        <line x1="570" y1="75" x2="475" y2="165" stroke="#fbbf24" stroke-width="2" />
        <line x1="570" y1="75" x2="665" y2="165" stroke="#fbbf24" stroke-width="2" />
        <line x1="475" y1="165" x2="665" y2="165" stroke="#fbbf24" stroke-width="2" />
        <rect x="530" y="54" width="80" height="42" rx="8" fill="#2d2618" stroke="#fbbf24" />
        <text x="570" y="80" text-anchor="middle" fill="#fef08a" font-size="12">PC A</text>
        <rect x="435" y="150" width="80" height="42" rx="8" fill="#2d2618" stroke="#fbbf24" />
        <text x="475" y="176" text-anchor="middle" fill="#fef08a" font-size="12">PC B</text>
        <rect x="625" y="150" width="80" height="42" rx="8" fill="#2d2618" stroke="#fbbf24" />
        <text x="665" y="176" text-anchor="middle" fill="#fef08a" font-size="12">PC C</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. ระบบปฏิบัติการเครื่องแม่ข่าย (Server OS) คืออะไร?',
        bullets: [
          '<strong>Server OS</strong> คือระบบปฏิบัติการที่ออกแบบมาเพื่อให้บริการทรัพยากร ข้อมูล และแอปพลิเคชันแก่เครื่องลูกข่าย (Clients) จำนวนมากพร้อมกันอย่างต่อเนื่อง 24 ชั่วโมง 7 วัน (24/7)',
          'แตกต่างจาก Desktop OS (เช่น Windows 11 Home) ตรงที่รองรับการเชื่อมต่อพร้อมกันหลายร้อย–หลายพันเครื่อง, จัดการสิทธิ์ระดับองค์กร, รองรับ CPU หลายตัว/RAM ระดับ Terabyte และเน้นความเสถียรสูง (High Availability)'
        ]
      },
      {
        heading: '2. ประเภทของเครื่องแม่ข่ายที่พบบ่อยในองค์กร',
        table: {
          headers: ['ประเภท Server', 'หน้าที่หลัก', 'ซอฟต์แวร์ยอดนิยม'],
          rows: [
            ['Web Server', 'ให้บริการหน้าเว็บไซต์และ API ผ่าน HTTP/HTTPS', 'Nginx, Apache, IIS'],
            ['File Server', 'จัดเก็บและแชร์ไฟล์ส่วนกลางพร้อมกำหนดสิทธิ์', 'Windows SMB, Samba, NFS'],
            ['Database Server', 'จัดเก็บและประมวลผลฐานข้อมูลขนาดใหญ่', 'MySQL, MariaDB, PostgreSQL, SQL Server'],
            ['DNS & DHCP Server', 'แปลงชื่อโดเมนเป็น IP และแจก IP อัตโนมัติ', 'BIND9, Windows DNS/DHCP'],
            ['Directory Server', 'จัดการบัญชีผู้ใช้ กลุ่ม และนโยบายส่วนกลาง', 'Active Directory (AD DS), OpenLDAP'],
            ['Mail & Proxy Server', 'รับ-ส่งอีเมลองค์กร และกรอง/แคชทราฟฟิกเว็บ', 'Postfix/Exchange, Squid, HAProxy']
          ]
        }
      },
      {
        heading: '3. เปรียบเทียบ Windows Server vs Linux Server',
        table: {
          headers: ['หัวข้อเปรียบเทียบ', 'Windows Server (2022/2025)', 'Linux Server (Ubuntu LTS / RHEL / Rocky)'],
          rows: [
            ['ค่าลิขสิทธิ์', 'มีค่าลิขสิทธิ์ (License + CAL)', 'โอเพนซอร์ส ใช้งานฟรี (หรือจ่ายเฉพาะ Support)'],
            ['การใช้งานหลัก', 'มี GUI สวยงาม + PowerShell โดดเด่นด้าน Active Directory', 'เน้น Command Line (CLI) เบา กิน RAM น้อยมาก'],
            ['งานที่นิยมใช้', 'องค์กรที่ใช้ Windows PC, AD DS, File/Print Server', 'Web Server, Cloud, Docker, Database, Firewall']
          ]
        }
      }
    ],
    analogy: '🏢 เปรียบเทียบให้เห็นภาพ: ระบบ Peer-to-Peer เหมือน "เพื่อน 4 คนนั่งทำงานกลุ่มแล้วส่งไฟล์ผ่านแฟลชไดรฟ์กันเอง" สะดวกตอนคนน้อย แต่ถ้ามี 100 คนจะวุ่นวายมาก! ส่วน Client-Server เหมือน "ห้องสมุดกลางที่มีบรรณารักษ์ (Server)" คอยจัดเก็บหนังสือ ตรวจบัตรสมาชิก และคุมกฎระเบียบให้ทุกคนจากจุดเดียว',
    cheatSheet: '# ตัวอย่างตรวจสอบข้อมูล OS บน Linux Server\nuname -a\ncat /etc/os-release\nhostname',
    examTips: [
      'องค์กรที่มีคอมพิวเตอร์ตั้งแต่ 10 เครื่องขึ้นไป ควรเลือกสถาปัตยกรรม Client-Server เพื่อรวมศูนย์การจัดการและความปลอดภัย',
      'Ubuntu Server LTS (Long Term Support) และ Rocky Linux/RHEL เป็นตระกูล Linux Server ที่นิยมสูงสุดในองค์กร'
    ]
  },
  {
    id: 'vol2',
    vol: 'บทที่ 2',
    icon: '⚙️',
    color: '#60a5fa',
    title: 'ฮาร์ดแวร์เครื่องแม่ข่าย, Virtualization & Container',
    subtitle: 'ECC RAM, Redundant PSU, IPMI/iDRAC, Type-1 Hypervisor และเปรียบเทียบ VM vs Docker Container',
    readTime: '5 นาที',
    objectives: [
      'ระบุความแตกต่างของฮาร์ดแวร์ระดับ Server (ECC RAM, Redundant PSU, Hot-Swap) ได้',
      'จำแนก Type-1 (Bare-Metal) และ Type-2 (Hosted) Hypervisor ได้',
      'อธิบายเหตุผลที่ Docker Container เบาและเริ่มทำงานเร็วกว่า Virtual Machine (VM)'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 240" class="codex-svg">
        <rect width="760" height="240" rx="14" fill="#0b1325" />
        <!-- Left: Virtual Machines -->
        <text x="190" y="26" text-anchor="middle" fill="#60a5fa" font-size="14" font-weight="700">Virtual Machine (Type-1 Hypervisor)</text>
        <rect x="45" y="42" width="135" height="32" rx="6" fill="#1e3a5f" stroke="#60a5fa" /><text x="112" y="63" text-anchor="middle" fill="#fff" font-size="11">App A + Libs</text>
        <rect x="200" y="42" width="135" height="32" rx="6" fill="#1e3a5f" stroke="#60a5fa" /><text x="267" y="63" text-anchor="middle" fill="#fff" font-size="11">App B + Libs</text>
        <rect x="45" y="80" width="135" height="36" rx="6" fill="#312e81" stroke="#a78bfa" /><text x="112" y="102" text-anchor="middle" fill="#e9d5ff" font-size="11" font-weight="600">Guest OS (Ubuntu)</text>
        <rect x="200" y="80" width="135" height="36" rx="6" fill="#312e81" stroke="#a78bfa" /><text x="267" y="102" text-anchor="middle" fill="#e9d5ff" font-size="11" font-weight="600">Guest OS (Windows)</text>
        <rect x="45" y="124" width="290" height="38" rx="6" fill="#0f766e" /><text x="190" y="148" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">Type-1 Hypervisor (ESXi / Proxmox / Hyper-V)</text>
        <rect x="45" y="170" width="290" height="42" rx="6" fill="#1e293b" stroke="#64748b" /><text x="190" y="196" text-anchor="middle" fill="#cbd5e1" font-size="12">Server Hardware (Xeon + ECC RAM + RAID)</text>
        <!-- Right: Docker Containers -->
        <text x="570" y="26" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">Container (Docker — แชร์ Host Kernel)</text>
        <rect x="425" y="48" width="90" height="68" rx="6" fill="#064e3b" stroke="#34d399" /><text x="470" y="78" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Container 1</text><text x="470" y="96" text-anchor="middle" fill="#a7f3d0" font-size="10">Nginx</text>
        <rect x="525" y="48" width="90" height="68" rx="6" fill="#064e3b" stroke="#34d399" /><text x="570" y="78" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Container 2</text><text x="570" y="96" text-anchor="middle" fill="#a7f3d0" font-size="10">Node/API</text>
        <rect x="625" y="48" width="90" height="68" rx="6" fill="#064e3b" stroke="#34d399" /><text x="670" y="78" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Container 3</text><text x="670" y="96" text-anchor="middle" fill="#a7f3d0" font-size="10">MySQL</text>
        <rect x="425" y="124" width="290" height="38" rx="6" fill="#0284c7" /><text x="570" y="148" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">Container Engine (Docker) + Shared Host OS Kernel</text>
        <rect x="425" y="170" width="290" height="42" rx="6" fill="#1e293b" stroke="#64748b" /><text x="570" y="196" text-anchor="middle" fill="#cbd5e1" font-size="12">Server Hardware (Physical / Cloud VM)</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. รูปแบบและฮาร์ดแวร์เฉพาะทางของเครื่องแม่ข่าย',
        bullets: [
          '<strong>Form Factors:</strong> <strong>Tower</strong> (ตั้งพื้นคล้าย PC เหมาะกับออฟฟิศเล็ก), <strong>Rack Server</strong> (ขนาดความสูง 1U/2U/4U ใส่ตู้แร็กมาตรฐาน Data Center), <strong>Blade Server</strong> (บางเฉียบประหยัดพื้นที่ในศูนย์ข้อมูลขนาดใหญ่)',
          '<strong>ECC RAM (Error-Correcting Code):</strong> หน่วยความจำที่ตรวจจับและแก้ Single-bit Error อัตโนมัติ ลดอาการจอฟ้า/Kernel Panic',
          '<strong>Redundant PSU & Hot-Swap:</strong> มีแหล่งจ่ายไฟ 2 ตัว (เสีย 1 ตัวอีกตัวทำงานแทนทันที) และถอดเปลี่ยนฮาร์ดดิสก์ได้โดยไม่ต้องปิดเครื่อง (Hot-Swap)',
          '<strong>Out-of-Band Management (IPMI / Dell iDRAC / HPE iLO):</strong> การ์ดจัดการแยกอิสระ ให้แอดมินสั่งเปิด-ปิดเครื่องและดูหน้าจอ BIOS ผ่านเครือข่ายได้แม้ OS ล่ม'
        ]
      },
      {
        heading: '2. Virtualization (เครื่องเสมือน) vs Container',
        bullets: [
          '<strong>Type-1 Hypervisor (Bare-Metal):</strong> ติดตั้งลงฮาร์ดแวร์โดยตรง ไม่ต้องมี OS คั่นกลาง เช่น <strong>VMware ESXi, Proxmox VE, Microsoft Hyper-V</strong> ประสิทธิภาพสูงสุด ใช้ใน Data Center จริง',
          '<strong>Type-2 Hypervisor (Hosted):</strong> ติดตั้งเป็นโปรแกรมบน Windows/macOS เช่น VirtualBox, VMware Workstation เหมาะสำหรับฝึกเรียนและทดสอบ',
          '<strong>Container (Docker / Podman):</strong> ไม่ต้องจำลองฮาร์ดแวร์และไม่ต้องบูต Guest OS แยกทุกตัว แต่แชร์ Kernel ของ Host OS จึงกิน RAM น้อยกว่าและสตาร์ตได้ภายในไม่กี่วินาที'
        ]
      }
    ],
    analogy: '🏠 เปรียบเทียบให้เห็นภาพ: Virtual Machine เหมือน "บ้านเดี่ยวแต่ละหลัง" ที่มีรั้ว ท่อน้ำ และระบบไฟฟ้าแยกขาดจากกัน (ปลอดภัยแยก OS เต็มตัว แต่สร้างช้าและกินพื้นที่) ส่วน Docker Container เหมือน "ห้องชุดคอนโด" ที่แชร์โครงสร้างตึกและระบบน้ำไฟหลักร่วมกัน (สร้างเร็ว เบา และยัดได้หลายห้องบนพื้นที่เท่าเดิม)',
    cheatSheet: '# ตรวจสอบ CPU, RAM และอุปกรณ์ฮาร์ดแวร์บน Linux\nlscpu\nfree -h\nlsblk',
    examTips: [
      'จำให้แม่น: ECC RAM = แก้บิตเพี้ยนในแรม • Redundant PSU = เพาเวอร์ซัพพลายสำรองป้องกันเครื่องดับ',
      'Type-1 Hypervisor รันตรงบนฮาร์ดแวร์ (ESXi, Proxmox, Hyper-V) จึงแรงและเสถียรกว่า Type-2'
    ]
  },
  {
    id: 'vol3',
    vol: 'บทที่ 3',
    icon: '💾',
    color: '#34d399',
    title: 'ระบบจัดเก็บข้อมูล RAID & File Systems',
    subtitle: 'สูตรคำนวณ RAID 0, 1, 5, 6, 10 และระบบไฟล์ ext4, XFS, ZFS, NTFS, ReFS',
    readTime: '5 นาที',
    objectives: [
      'คำนวณพื้นที่ใช้งานจริง (Usable Capacity) และความทนทานต่อดิสก์เสียของ RAID 0, 1, 5, 6, 10 ได้',
      'เลือกโครงสร้าง RAID ให้เหมาะกับประเภทงาน (Web, File, Database, Archive)',
      'เข้าใจว่าเหตุใด RAID จึงไม่สามารถทดแทนการทำ Backup ได้'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 220" class="codex-svg">
        <rect width="760" height="220" rx="14" fill="#0b1325" />
        <text x="380" y="28" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">เปรียบเทียบการจัดวางข้อมูลในชุดดิสก์ RAID (สมมติดิสก์ลูกละ 1 TB)</text>
        <!-- RAID 0 -->
        <rect x="20" y="46" width="135" height="154" rx="10" fill="#132036" stroke="#38bdf8" />
        <text x="87" y="68" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="700">RAID 0</text>
        <text x="87" y="85" text-anchor="middle" fill="#94a3b8" font-size="10">Stripe (เร็วสุด)</text>
        <rect x="34" y="96" width="46" height="44" rx="5" fill="#0c4a6e" /><text x="57" y="122" text-anchor="middle" fill="#7dd3fc" font-size="11">A1 A3</text>
        <rect x="92" y="96" width="46" height="44" rx="5" fill="#0c4a6e" /><text x="115" y="122" text-anchor="middle" fill="#7dd3fc" font-size="11">A2 A4</text>
        <text x="87" y="164" text-anchor="middle" fill="#f87171" font-size="10" font-weight="700">ทนเสีย: 0 ลูก!</text>
        <text x="87" y="182" text-anchor="middle" fill="#e2e8f0" font-size="10">จุ: 100% (N)</text>
        <!-- RAID 1 -->
        <rect x="168" y="46" width="135" height="154" rx="10" fill="#132036" stroke="#34d399" />
        <text x="235" y="68" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700">RAID 1</text>
        <text x="235" y="85" text-anchor="middle" fill="#94a3b8" font-size="10">Mirror (สำเนาคู่)</text>
        <rect x="182" y="96" width="46" height="44" rx="5" fill="#0c4a6e" /><text x="205" y="122" text-anchor="middle" fill="#7dd3fc" font-size="11">A1 A2</text>
        <rect x="240" y="96" width="46" height="44" rx="5" fill="#065f46" /><text x="263" y="122" text-anchor="middle" fill="#6ee7b7" font-size="11">Copy</text>
        <text x="235" y="164" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">ทนเสีย: 1 ลูก</text>
        <text x="235" y="182" text-anchor="middle" fill="#e2e8f0" font-size="10">จุ: 50%</text>
        <!-- RAID 5 -->
        <rect x="316" y="46" width="135" height="154" rx="10" fill="#132036" stroke="#fbbf24" />
        <text x="383" y="68" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="700">RAID 5</text>
        <text x="383" y="85" text-anchor="middle" fill="#94a3b8" font-size="10">1 Parity (≥3 ลูก)</text>
        <rect x="326" y="96" width="32" height="44" rx="4" fill="#0c4a6e" /><text x="342" y="122" text-anchor="middle" fill="#7dd3fc" font-size="10">A1</text>
        <rect x="366" y="96" width="32" height="44" rx="4" fill="#0c4a6e" /><text x="382" y="122" text-anchor="middle" fill="#7dd3fc" font-size="10">A2</text>
        <rect x="406" y="96" width="32" height="44" rx="4" fill="#78350f" /><text x="422" y="122" text-anchor="middle" fill="#fde047" font-size="10">P1</text>
        <text x="383" y="164" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">ทนเสีย: 1 ลูก</text>
        <text x="383" y="182" text-anchor="middle" fill="#e2e8f0" font-size="10">จุ: N - 1</text>
        <!-- RAID 6 -->
        <rect x="464" y="46" width="135" height="154" rx="10" fill="#132036" stroke="#f97316" />
        <text x="531" y="68" text-anchor="middle" fill="#fb923c" font-size="13" font-weight="700">RAID 6</text>
        <text x="531" y="85" text-anchor="middle" fill="#94a3b8" font-size="10">2 Parity (≥4 ลูก)</text>
        <rect x="472" y="96" width="26" height="44" rx="4" fill="#0c4a6e" /><text x="485" y="122" text-anchor="middle" fill="#7dd3fc" font-size="9">A1</text>
        <rect x="502" y="96" width="26" height="44" rx="4" fill="#0c4a6e" /><text x="515" y="122" text-anchor="middle" fill="#7dd3fc" font-size="9">A2</text>
        <rect x="532" y="96" width="26" height="44" rx="4" fill="#78350f" /><text x="545" y="122" text-anchor="middle" fill="#fde047" font-size="9">P1</text>
        <rect x="562" y="96" width="26" height="44" rx="4" fill="#78350f" /><text x="575" y="122" text-anchor="middle" fill="#fde047" font-size="9">P2</text>
        <text x="531" y="164" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">ทนเสีย: 2 ลูก!</text>
        <text x="531" y="182" text-anchor="middle" fill="#e2e8f0" font-size="10">จุ: N - 2</text>
        <!-- RAID 10 -->
        <rect x="612" y="46" width="130" height="154" rx="10" fill="#132036" stroke="#a78bfa" />
        <text x="677" y="68" text-anchor="middle" fill="#a78bfa" font-size="13" font-weight="700">RAID 10</text>
        <text x="677" y="85" text-anchor="middle" fill="#94a3b8" font-size="10">1+0 (DB เร็วสุด)</text>
        <rect x="622" y="96" width="50" height="44" rx="5" fill="#065f46" /><text x="647" y="122" text-anchor="middle" fill="#6ee7b7" font-size="10">M1+C1</text>
        <rect x="680" y="96" width="50" height="44" rx="5" fill="#065f46" /><text x="705" y="122" text-anchor="middle" fill="#6ee7b7" font-size="10">M2+C2</text>
        <text x="677" y="164" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">ทนเสีย: 1/คู่</text>
        <text x="677" y="182" text-anchor="middle" fill="#e2e8f0" font-size="10">จุ: 50% (≥4 ลูก)</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. ตารางสรุปสูตร RAID ยอดนิยม (ออกสอบบ่อยมาก!)',
        table: {
          headers: ['ระดับ RAID', 'ดิสก์ขั้นต่ำ', 'ความจุใช้งาน', 'ทนดิสก์เสียได้', 'เหมาะกับงาน'],
          rows: [
            ['RAID 0 (Stripe)', '2 ลูก', '100% (N)', '0 ลูก (เสีย 1 พังหมด)', 'งานแคชชั่วคราว/ตัดต่อวิดีโอ'],
            ['RAID 1 (Mirror)', '2 ลูก', '50%', '1 ลูก', 'ดิสก์ลง OS ของ Server'],
            ['RAID 5 (Parity)', '3 ลูก', '(N - 1) ลูก', '1 ลูก', 'File Server / Web Server'],
            ['RAID 6 (Dual Parity)', '4 ลูก', '(N - 2) ลูก', '2 ลูกพร้อมกัน', 'Storage / คลังข้อมูลสำคัญสูง'],
            ['RAID 10 (1+0)', '4 ลูก', '50%', '1 ลูกต่อคู่ Mirror', 'Database Server (High IOPS)']
          ]
        }
      },
      {
        heading: '2. ระบบไฟล์ (File Systems) บน Server OS',
        bullets: [
          '<strong>Linux Server:</strong> <code>ext4</code> (เสถียร มาตรฐาน Ubuntu/Debian), <code>XFS</code> (เด่นไฟล์ใหญ่ มาตรฐาน RHEL/Rocky), <code>ZFS</code> (รองรับ Snapshot, Compression และเช็กข้อมูลเพี้ยนอัตโนมัติ)',
          '<strong>Windows Server:</strong> <code>NTFS</code> (มาตรฐาน รองรับสิทธิ์ละเอียดและการเข้ารหัส), <code>ReFS</code> (Resilient File System ออกแบบให้ทนความเสียหายสำหรับ Storage ขนาดใหญ่)'
        ]
      }
    ],
    analogy: '📚 เปรียบเทียบให้เห็นภาพ: RAID 1 เหมือน "จดเลกเชอร์ใส่สมุด 2 เล่มพร้อมกัน" หายเล่มหนึ่งยังมีอีกเล่ม! แต่จำไว้เสมอว่า "RAID ไม่ใช่ Backup" เพราะถ้าคุณเผลอเอาปากกาขีดฆ่าข้อมูล หรือโดนไวรัส Ransomware มันจะถูกเขียนทับพังไปพร้อมกันทั้ง 2 เล่มในเสี้ยววินาที!',
    cheatSheet: '# ตรวจสอบดิสก์ พาร์ติชัน และพื้นที่ว่างบน Linux\ndf -h\ndu -sh /var/*\nlsblk -f',
    examTips: [
      'โจทย์คำนวณยอดฮิต: ดิสก์ 4 ลูก × 2 TB ทำ RAID 5 ได้พื้นที่ (4-1) × 2 = 6 TB และทนเสียได้ 1 ลูก',
      'Database ที่มีคนเขียนข้อมูลหนัก ๆ เลือก RAID 10 เพราะไม่ต้องเสียเวลาคำนวณ Parity'
    ]
  },
  {
    id: 'vol4',
    vol: 'บทที่ 4',
    icon: '🌐',
    color: '#2dd4bf',
    title: 'เครือข่าย, Static IP, DHCP DORA, DNS & 18 พอร์ตมาตรฐาน',
    subtitle: 'Subnet /24 /25 /30, ขั้นตอน DHCP DORA, DNS Records และตารางพอร์ตที่ SysAdmin ต้องจำขึ้นใจ',
    readTime: '6 นาที',
    objectives: [
      'อธิบาย 4 ขั้นตอนของ DHCP (DORA) และเหตุผลที่ Server ต้องตั้ง Static IP ได้',
      'แยกประเภท DNS Records (A, AAAA, CNAME, MX, TXT) ได้ถูกต้อง',
      'จดจำหมายเลขพอร์ตมาตรฐาน 18 พอร์ต และคำนวณ Usable Hosts ของ Subnet เบื้องต้นได้'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 220" class="codex-svg">
        <rect width="760" height="220" rx="14" fill="#0b1325" />
        <text x="380" y="26" text-anchor="middle" fill="#2dd4bf" font-size="14" font-weight="700">กระบวนการขอรับ IP อัตโนมัติของ DHCP (D-O-R-A Process • UDP 67/68)</text>
        <rect x="55" y="45" width="120" height="150" rx="12" fill="#162238" stroke="#38bdf8" stroke-width="2" />
        <text x="115" y="112" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">CLIENT</text>
        <text x="115" y="132" text-anchor="middle" fill="#94a3b8" font-size="11">(ยังไม่มี IP)</text>
        <rect x="585" y="45" width="120" height="150" rx="12" fill="#13332e" stroke="#34d399" stroke-width="2" />
        <text x="645" y="112" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">DHCP SERVER</text>
        <text x="645" y="132" text-anchor="middle" fill="#6ee7b7" font-size="11">192.168.10.2</text>
        <!-- 4 Arrows -->
        <line x1="185" y1="68" x2="570" y2="68" stroke="#38bdf8" stroke-width="2.5" />
        <polygon points="575,68 563,62 563,74" fill="#38bdf8" />
        <text x="380" y="61" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">1. DISCOVER (Broadcast: มี DHCP Server อยู่ไหม?)</text>

        <line x1="575" y1="104" x2="190" y2="104" stroke="#34d399" stroke-width="2.5" />
        <polygon points="185,104 197,98 197,110" fill="#34d399" />
        <text x="380" y="97" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">2. OFFER (เสนอ IP: เอา 192.168.10.50 ไปใช้ไหม?)</text>

        <line x1="185" y1="140" x2="570" y2="140" stroke="#fbbf24" stroke-width="2.5" />
        <polygon points="575,140 563,134 563,146" fill="#fbbf24" />
        <text x="380" y="133" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700">3. REQUEST (ตกลง! ขอใช้ 192.168.10.50 นะ)</text>

        <line x1="575" y1="176" x2="190" y2="176" stroke="#a78bfa" stroke-width="2.5" />
        <polygon points="185,176 197,170 197,182" fill="#a78bfa" />
        <text x="380" y="169" text-anchor="middle" fill="#ddd6fe" font-size="12" font-weight="700">4. ACKNOWLEDGE / ACK (อนุมัติ! พร้อม Subnet, Gateway &amp; DNS)</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. Static IP, Private IP และสูตรคำนวณ Subnet',
        bullets: [
          '<strong>Static IP:</strong> เครื่องแม่ข่ายทุกเครื่องต้องกำหนด IP แบบคงที่ (Static) ไม่รับแบบสุ่มจาก DHCP เพราะหาก IP เปลี่ยน เครื่องลูกข่ายและ DNS จะติดต่อไม่ได้ทันที',
          '<strong>ช่วง Private IP (RFC 1918):</strong> <code>10.0.0.0/8</code>, <code>172.16.0.0 – 172.31.255.255</code>, <code>192.168.0.0/16</code>',
          '<strong>IP พิเศษต้องรู้:</strong> <code>127.0.0.1</code> = Loopback (ทดสอบเครื่องตัวเอง) • <code>169.254.x.x</code> = APIPA (ติดต่อ DHCP Server ไม่ได้!)',
          '<strong>สูตร Usable Hosts:</strong> <code>2^(32 - prefix) - 2</code> → เช่น <code>/24</code> = 254 เครื่อง, <code>/25</code> = 126 เครื่อง, <code>/30</code> = 2 เครื่อง (Point-to-Point)'
        ]
      },
      {
        heading: '2. ประเภท DNS Records ที่ใช้จริง',
        bullets: [
          '<strong>A Record:</strong> แปลงชื่อโดเมนเป็น IPv4 (เช่น <code>www.college.ac.th → 203.150.10.25</code>)',
          '<strong>AAAA Record:</strong> แปลงชื่อโดเมนเป็น IPv6',
          '<strong>CNAME Record:</strong> ชื่อนามแฝง (Alias) ชี้ชื่อโดเมนหนึ่งไปยังอีกชื่อหนึ่ง',
          '<strong>MX Record:</strong> ระบุเครื่อง Mail Server ที่รับอีเมลของโดเมนนั้น'
        ]
      },
      {
        heading: '3. ตารางพอร์ตมาตรฐาน 18 พอร์ต (ท่องให้ขึ้นใจ!)',
        table: {
          headers: ['พอร์ต', 'โปรโตคอล', 'หน้าที่การใช้งาน'],
          rows: [
            ['21 / 22 / 23', 'FTP / SSH / Telnet', 'โอนไฟล์ / รีโมทเข้ารหัส (ปลอดภัย) / รีโมทไม่เข้ารหัส (ห้ามใช้!)'],
            ['25 / 110 / 143', 'SMTP / POP3 / IMAP', 'ส่งอีเมล / ดึงอีเมล / ซิงค์อีเมลทุกอุปกรณ์'],
            ['53 / 67-68 / 123', 'DNS / DHCP / NTP', 'แปลงชื่อโดเมน / แจก IP อัตโนมัติ / เทียบเวลาให้ตรงกัน'],
            ['80 / 443', 'HTTP / HTTPS', 'เว็บไซต์ปกติ / เว็บไซต์เข้ารหัส SSL/TLS'],
            ['161 / 389 / 514', 'SNMP / LDAP / Syslog', 'มอนิเตอร์ระบบ / ไดเรกทอรี AD / รวมศูนย์ Log'],
            ['445 / 3389', 'SMB / RDP', 'แชร์ไฟล์เครือข่าย Windows / รีโมทหน้าจอ Windows Server'],
            ['3306 / 5432', 'MySQL / PostgreSQL', 'ฐานข้อมูล MySQL-MariaDB / ฐานข้อมูล PostgreSQL']
          ]
        }
      }
    ],
    analogy: '📞 เปรียบเทียบให้เห็นภาพ: DNS เหมือน "สมุดรายชื่อในมือถือ" ที่เราจำชื่อเพื่อน (google.com) แทนที่จะจำเบอร์โทร 10 หลัก (IP Address) ส่วนหมายเลข Port เหมือน "เลขห้องในคอนโด" — IP พาคุณมาถึงหน้าตึก ส่วน Port 80/443/22 บอกว่าจะเดินขึ้นไปเคาะห้องบริการไหน!',
    cheatSheet: '# Linux ตรวจสอบ IP, พอร์ตเปิด และทดสอบ DNS\nip a\nss -tulnp\nping 8.8.8.8\n\n# Windows Server\nipconfig /all\nnslookup college.ac.th',
    examTips: [
      'หาก Ping ด้วย IP ได้ปกติ แต่เข้าเว็บด้วยชื่อโดเมนไม่ได้ → สาเหตุคือ DNS Server (พอร์ต 53) มีปัญหา!',
      'หากเครื่องลูกข่ายได้ IP ขึ้นต้นด้วย 169.254.x.x → สาเหตุคือติดต่อ DHCP Server (พอร์ต 67/68) ไม่ได้!'
    ]
  },
  {
    id: 'vol5',
    vol: 'บทที่ 5',
    icon: '🔐',
    color: '#a78bfa',
    title: 'ผู้ใช้ กลุ่ม สิทธิ์ & Windows Active Directory',
    subtitle: 'AD DS, Domain Controller, OU, GPO, Share vs NTFS และ Linux chmod/chown',
    readTime: '6 นาที',
    objectives: [
      'อธิบายโครงสร้าง Windows Active Directory (Domain, OU, GPO, LDAP, Kerberos) ได้',
      'คำนวณ Effective Permission ระหว่าง Share และ NTFS Permission บน Windows Server ได้',
      'คำนวณเลขฐานแปด Linux Permissions (chmod) และใช้คำสั่ง chown/usermod ได้แม่นยำ'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 225" class="codex-svg">
        <rect width="760" height="225" rx="14" fill="#0b1325" />
        <!-- Left: Active Directory -->
        <text x="180" y="26" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="700">Windows Active Directory (AD DS)</text>
        <rect x="105" y="42" width="150" height="36" rx="8" fill="#312e81" stroke="#a78bfa" />
        <text x="180" y="65" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">Domain: college.local</text>
        <line x1="145" y1="78" x2="95" y2="112" stroke="#a78bfa" stroke-width="2" />
        <line x1="215" y1="78" x2="265" y2="112" stroke="#a78bfa" stroke-width="2" />
        <rect x="35" y="112" width="120" height="42" rx="8" fill="#1e293b" stroke="#38bdf8" />
        <text x="95" y="131" text-anchor="middle" fill="#7dd3fc" font-size="11" font-weight="700">OU: IT-Dept</text>
        <text x="95" y="146" text-anchor="middle" fill="#94a3b8" font-size="10">ผูก GPO นโยบายไอที</text>
        <rect x="205" y="112" width="120" height="42" rx="8" fill="#1e293b" stroke="#34d399" />
        <text x="265" y="131" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">OU: Students</text>
        <text x="265" y="146" text-anchor="middle" fill="#94a3b8" font-size="10">ผูก GPO ล็อกหน้าจอ</text>
        <text x="180" y="192" text-anchor="middle" fill="#cbd5e1" font-size="11">โปรโตคอลหลัก: LDAP (389) + Kerberos (88)</text>
        <!-- Divider -->
        <line x1="375" y1="20" x2="375" y2="205" stroke="rgba(148,163,184,0.25)" stroke-dasharray="6 6" />
        <!-- Right: Linux CHMOD -->
        <text x="568" y="26" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">สูตรคำนวณสิทธิ์ Linux (chmod 755)</text>
        <rect x="405" y="48" width="102" height="94" rx="10" fill="#064e3b" stroke="#34d399" />
        <text x="456" y="70" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">Owner (u)</text>
        <text x="456" y="96" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">r w x</text>
        <text x="456" y="116" text-anchor="middle" fill="#fde047" font-size="11">4 + 2 + 1 = 7</text>
        <rect x="518" y="48" width="102" height="94" rx="10" fill="#162238" stroke="#38bdf8" />
        <text x="569" y="70" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">Group (g)</text>
        <text x="569" y="96" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">r - x</text>
        <text x="569" y="116" text-anchor="middle" fill="#fde047" font-size="11">4 + 0 + 1 = 5</text>
        <rect x="631" y="48" width="102" height="94" rx="10" fill="#162238" stroke="#fbbf24" />
        <text x="682" y="70" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700">Others (o)</text>
        <text x="682" y="96" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">r - x</text>
        <text x="682" y="116" text-anchor="middle" fill="#fde047" font-size="11">4 + 0 + 1 = 5</text>
        <text x="568" y="176" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700">-rwxr-xr-x  →  chmod 755 script.sh</text>
        <text x="568" y="198" text-anchor="middle" fill="#94a3b8" font-size="11">Read (r) = 4  •  Write (w) = 2  •  Execute (x) = 1</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. Windows Server Active Directory (AD DS)',
        bullets: [
          '<strong>Domain Controller (DC):</strong> เครื่องแม่ข่ายที่รัน AD DS ทำหน้าที่ยืนยันตัวตน (Authentication) และคุมเครื่องลูกข่ายทั้งหมดในโดเมน',
          '<strong>Organizational Unit (OU):</strong> โฟลเดอร์จัดกลุ่มผู้ใช้และคอมพิวเตอร์ตามแผนก เพื่อผูก <strong>GPO (Group Policy Object)</strong> บังคับใช้นโยบายพร้อมกันทั้งแผนก',
          '<strong>กฎ Share vs NTFS Permission:</strong> เมื่อผู้ใช้เข้าถึงไฟล์ผ่านเครือข่าย ระบบจะนำสิทธิ์ Share มาตัดกับสิทธิ์ NTFS แล้วเลือก <strong>สิทธิ์ที่เข้มงวดที่สุด (Most Restrictive)</strong> เสมอ!'
        ]
      },
      {
        heading: '2. บัญชีผู้ใช้และสิทธิ์บน Linux Server',
        bullets: [
          '<code>/etc/passwd</code> เก็บรายชื่อผู้ใช้ (ทุกคนอ่านได้) • <code>/etc/shadow</code> เก็บรหัสผ่านแบบแฮช (เฉพาะ root อ่านได้)',
          '<code>usermod -aG sudo somchai</code> เพิ่มผู้ใช้เข้ากลุ่มผู้ดูแลระบบโดยไม่ลบกลุ่มเดิม',
          '<code>chmod</code> เปลี่ยนสิทธิ์ rwx (เช่น <code>600</code> ไฟล์ลับ/SSH Key, <code>644</code> ไฟล์คอนฟิก, <code>755</code> สคริปต์/เว็บ) • <code>chown -R user:group /path</code> เปลี่ยนเจ้าของไฟล์และกลุ่ม',
          '<strong>Principle of Least Privilege:</strong> ยึดหลักให้สิทธิ์เฉพาะเท่าที่จำเป็นต่องาน เพื่อจำกัดความเสียหายหากบัญชีถูกแฮก'
        ]
      }
    ],
    analogy: '🔑 เปรียบเทียบให้เห็นภาพ: กฎ Share vs NTFS เหมือน "ประตูรั้วหน้าบ้าน (Share)" กับ "แม่กุญแจประตูห้องนอน (NTFS)" ต่อให้ประตูรั้วเปิดกว้างเต็มที่ (Full Control) แต่ประตูห้องล็อกให้มองผ่านกระจกได้อย่างเดียว (Read) คุณก็ทำได้แค่มองเท่านั้น!',
    cheatSheet: '# Linux จัดการผู้ใช้และสิทธิ์\nuseradd -m student01\nusermod -aG sudo student01\nchmod 600 id_rsa\nchown -R www-data:www-data /var/www/html\n\n# Windows Server อัปเดตนโยบาย GPO ทันที\ngpupdate /force',
    examTips: [
      'ห้ามตั้ง chmod 777 บนเครื่องแม่ข่ายจริงเด็ดขาด เพราะอนุญาตให้ทุกคนแก้ไขและรันไฟล์ได้',
      'จำให้แม่น: chmod = เปลี่ยนสิทธิ์ rwx • chown = เปลี่ยนเจ้าของไฟล์'
    ]
  },
  {
    id: 'vol6',
    vol: 'บทที่ 6',
    icon: '⌨️',
    color: '#fbbf24',
    title: 'คำสั่งจัดการระบบ (Linux Bash & Windows PowerShell)',
    subtitle: 'ตารางเทียบคำสั่ง 2 ระบบปฏิบัติการ การคุม Services, Process, Disk และ Network Troubleshooting',
    readTime: '5 นาที',
    objectives: [
      'ใช้คำสั่ง systemd (systemctl / journalctl) จัดการบริการและดู Log บน Linux ได้',
      'ใช้คำสั่ง Windows PowerShell (Verb-Noun) ตรวจสอบบริการ เครือข่าย และ Active Directory ได้',
      'แยกแยะคำสั่งตรวจทรัพยากรระบบ (CPU, RAM, Disk, Ports) ได้แม่นยำ'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 215" class="codex-svg">
        <rect width="760" height="215" rx="14" fill="#0b1325" />
        <text x="380" y="26" text-anchor="middle" fill="#fbbf24" font-size="14" font-weight="700">เทียบคำสั่งดูแล Server หน้างานจริง: Linux Bash 🐧 vs Windows PowerShell 🪟</text>
        <rect x="30" y="44" width="335" height="152" rx="10" fill="#050a12" stroke="#34d399" />
        <text x="48" y="68" fill="#34d399" font-size="12" font-weight="700">root@ubuntu-srv:~# (Linux Bash)</text>
        <text x="48" y="92" fill="#e2e8f0" font-size="11" font-family="monospace">$ systemctl restart nginx</text>
        <text x="48" y="114" fill="#e2e8f0" font-size="11" font-family="monospace">$ ip a  &amp;&amp;  ss -tulnp</text>
        <text x="48" y="136" fill="#e2e8f0" font-size="11" font-family="monospace">$ df -h  &amp;&amp;  du -sh /var/*</text>
        <text x="48" y="158" fill="#e2e8f0" font-size="11" font-family="monospace">$ journalctl -u nginx -n 50</text>
        <text x="48" y="180" fill="#e2e8f0" font-size="11" font-family="monospace">$ sudo apt update &amp;&amp; sudo apt upgrade</text>

        <rect x="395" y="44" width="335" height="152" rx="10" fill="#012456" stroke="#60a5fa" />
        <text x="413" y="68" fill="#fde047" font-size="12" font-weight="700">PS C:\\ServerAdmin&gt; (Windows PowerShell)</text>
        <text x="413" y="92" fill="#e2e8f0" font-size="11" font-family="monospace">&gt; Restart-Service DNS</text>
        <text x="413" y="114" fill="#e2e8f0" font-size="11" font-family="monospace">&gt; ipconfig /all  ;  netstat -ano</text>
        <text x="413" y="136" fill="#e2e8f0" font-size="11" font-family="monospace">&gt; Test-NetConnection 192.168.10.10 -Port 443</text>
        <text x="413" y="158" fill="#e2e8f0" font-size="11" font-family="monospace">&gt; Get-ADUser -Filter *</text>
        <text x="413" y="180" fill="#e2e8f0" font-size="11" font-family="monospace">&gt; gpupdate /force</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. ตารางเทียบคำสั่งสำคัญข้ามระบบปฏิบัติการ',
        table: {
          headers: ['ภารกิจดูแลระบบ', 'Linux Server (Bash)', 'Windows Server (CMD / PowerShell)'],
          rows: [
            ['ดูสถานะ/รีสตาร์ทบริการ', 'systemctl status / restart <svc>', 'Get-Service / Restart-Service <svc>'],
            ['ดู IP และการ์ดเครือข่าย', 'ip a (หรือ ip addr)', 'ipconfig /all'],
            ['ดูพอร์ตที่เปิดฟังอยู่', 'ss -tulnp', 'netstat -ano'],
            ['ทดสอบพอร์ตปลายทาง', 'nc -zv <host> <port>', 'Test-NetConnection <host> -Port <p>'],
            ['ดูพื้นที่ดิสก์และ RAM', 'df -h / du -sh / free -h', 'Get-PSDrive / systeminfo'],
            ['ดู Process กิน CPU', 'top / htop / ps aux', 'Get-Process / tasklist']
          ]
        }
      },
      {
        heading: '2. โครงสร้างคำสั่ง PowerShell (Verb-Noun)',
        bullets: [
          'คำสั่ง PowerShell (Cmdlet) ออกแบบให้อ่านเข้าใจง่ายด้วยรูปแบบ <strong>กริยา-คำนาม</strong> เช่น <code>Get-Service</code> (ดึงข้อมูล), <code>Restart-Service</code> (รีสตาร์ท), <code>New-ADUser</code> (สร้างผู้ใช้ใหม่), <code>Test-NetConnection</code> (ทดสอบเครือข่าย)'
        ]
      }
    ],
    analogy: '🕹️ เปรียบเทียบให้เห็นภาพ: การใช้ GUI (คลิกเมาส์) เหมือน "ขับรถเกียร์ออโต้ในซอย" ส่วน CLI/PowerShell เหมือน "แผงควบคุมนักบิน" ที่สั่งงานเซิร์ฟเวอร์ 100 เครื่องพร้อมกันได้ในบรรทัดเดียว กินเน็ตน้อยมาก และเขียนเป็นสคริปต์รันอัตโนมัติได้!',
    cheatSheet: '# ยกระดับสิทธิ์ชั่วคราวบน Ubuntu\nsudo systemctl enable --now nginx\n\n# ตรวจสอบว่าโฟลเดอร์ไหนกินพื้นที่มากสุด\ndu -sh /var/*',
    examTips: [
      'แยกให้ออก: df -h ดูพื้นที่ว่างทั้งพาร์ติชัน • du -sh ดูขนาดของโฟลเดอร์ย่อย',
      'systemctl enable ทำให้บริการเปิดอัตโนมัติทุกครั้งที่รีบูต (ใส่ --now เพื่อเริ่มทันทีด้วย)'
    ]
  },
  {
    id: 'vol7',
    vol: 'บทที่ 7',
    icon: '🛡️',
    color: '#f87171',
    title: 'ความปลอดภัย Firewall, DMZ, SSH Hardening & SSL/TLS',
    subtitle: 'หลัก CIA Triad, การวางโซน DMZ, ตั้งกฎ Firewall Default Deny และการป้องกัน SSH',
    readTime: '5 นาที',
    objectives: [
      'อธิบาย 3 เสาหลักของความมั่นคงปลอดภัยสารสนเทศ (CIA Triad) ได้',
      'ออกแบบโซน DMZ แยก Web Server สาธารณะออกจากฐานข้อมูลภายในได้',
      'กำหนดกฎ Firewall (UFW) และมาตรการ SSH Hardening ได้อย่างปลอดภัย'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 215" class="codex-svg">
        <rect width="760" height="215" rx="14" fill="#0b1325" />
        <text x="380" y="26" text-anchor="middle" fill="#f87171" font-size="14" font-weight="700">สถาปัตยกรรมโซนกันชน DMZ (Demilitarized Zone) ปกป้องฐานข้อมูลภายใน</text>
        <!-- Internet -->
        <rect x="24" y="75" width="110" height="70" rx="12" fill="#3f1d2e" stroke="#f87171" stroke-width="2" />
        <text x="79" y="106" text-anchor="middle" fill="#fecaca" font-size="13" font-weight="700">INTERNET</text>
        <text x="79" y="125" text-anchor="middle" fill="#fca5a5" font-size="10">ผู้ใช้ / แฮกเกอร์</text>
        <!-- FW 1 -->
        <line x1="134" y1="110" x2="178" y2="110" stroke="#fbbf24" stroke-width="3" />
        <rect x="178" y="62" width="76" height="96" rx="8" fill="#7c2d12" stroke="#fbbf24" stroke-width="2" />
        <text x="216" y="103" text-anchor="middle" fill="#fde047" font-size="11" font-weight="700">FIREWALL</text>
        <text x="216" y="121" text-anchor="middle" fill="#fed7aa" font-size="9">Allow 80/443</text>
        <text x="216" y="135" text-anchor="middle" fill="#fca5a5" font-size="9">Deny All</text>
        <!-- DMZ -->
        <line x1="254" y1="110" x2="294" y2="110" stroke="#38bdf8" stroke-width="3" />
        <rect x="294" y="48" width="164" height="126" rx="12" fill="#132a45" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 3" />
        <text x="376" y="72" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="700">DMZ ZONE</text>
        <rect x="316" y="84" width="120" height="34" rx="6" fill="#1e3a5f" /><text x="376" y="106" text-anchor="middle" fill="#fff" font-size="11">Web Server (443)</text>
        <rect x="316" y="126" width="120" height="34" rx="6" fill="#1e3a5f" /><text x="376" y="148" text-anchor="middle" fill="#fff" font-size="11">Mail / Reverse Proxy</text>
        <!-- FW 2 -->
        <line x1="458" y1="110" x2="498" y2="110" stroke="#34d399" stroke-width="3" />
        <rect x="498" y="62" width="76" height="96" rx="8" fill="#7c2d12" stroke="#fbbf24" stroke-width="2" />
        <text x="536" y="103" text-anchor="middle" fill="#fde047" font-size="11" font-weight="700">INT FW</text>
        <text x="536" y="121" text-anchor="middle" fill="#6ee7b7" font-size="9">Strict Rules</text>
        <!-- Internal LAN -->
        <line x1="574" y1="110" x2="610" y2="110" stroke="#34d399" stroke-width="3" />
        <rect x="610" y="54" width="126" height="114" rx="12" fill="#064e3b" stroke="#34d399" stroke-width="2" />
        <text x="673" y="80" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">INTERNAL LAN</text>
        <text x="673" y="106" text-anchor="middle" fill="#fff" font-size="11">Database (3306)</text>
        <text x="673" y="128" text-anchor="middle" fill="#fff" font-size="11">Active Directory</text>
        <text x="673" y="150" text-anchor="middle" fill="#a7f3d0" font-size="10">ห้ามเข้าตรงจากเน็ต!</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. เสาหลักความมั่นคงปลอดภัย (CIA Triad)',
        bullets: [
          '<strong>Confidentiality (ความลับ):</strong> ข้อมูลต้องไม่รั่วไหลถึงผู้ไม่มีสิทธิ์ (ป้องกันด้วยการเข้ารหัส SSL/TLS, SSH, สิทธิ์ chmod 600)',
          '<strong>Integrity (ความถูกต้องครบถ้วน):</strong> ข้อมูลต้องไม่ถูกแก้ไขปลอมแปลงโดยไม่ได้รับอนุญาต (ใช้ Hashing, Digital Signature, Permission)',
          '<strong>Availability (ความพร้อมใช้งาน):</strong> ระบบต้องพร้อมให้บริการตลอดเวลาเมื่อผู้ใช้ต้องการ (ใช้ RAID, Redundant PSU, Load Balancer, Backup)'
        ]
      },
      {
        heading: '2. กฎเหล็กการตั้ง Firewall & SSH Hardening',
        bullets: [
          '<strong>Default Deny Incoming:</strong> ปิดพอร์ตขาเข้าทั้งหมดไว้ก่อน แล้วเปิด (Allow) เฉพาะพอร์ตที่จำเป็นจริง ๆ เท่านั้น',
          '<strong>SSH Hardening:</strong> ปิด <code>PermitRootLogin no</code>, ใช้ <strong>SSH Public/Private Key</strong> แทนรหัสผ่าน, ติดตั้ง <strong>Fail2ban</strong> แบน IP ที่เดารหัสผิดซ้ำ ๆ และห้ามเปิด Telnet (23)',
          '<strong>SSL/TLS Certificate:</strong> ติดตั้งใบรับรอง (เช่น Let’s Encrypt ฟรี) เพื่อเข้ารหัสเว็บเป็น HTTPS พอร์ต 443'
        ]
      }
    ],
    analogy: '🏦 เปรียบเทียบให้เห็นภาพ: โซน DMZ เหมือน "โถงเคาน์เตอร์ต้อนรับของธนาคาร" ที่ลูกค้าภายนอกเดินเข้ามาติดต่อได้ แต่ห้องตู้เซฟเก็บเงินสด (Database / AD) จะอยู่ลึกเข้าไปหลังประตูล็อกชั้นที่ 2 ที่อนุญาตเฉพาะพนักงานที่มีบัตรผ่านเท่านั้น!',
    cheatSheet: '# ลำดับตั้งค่า UFW Firewall บน Ubuntu อย่างปลอดภัย (อย่าลืมเปิด 22 ก่อน!)\nsudo ufw default deny incoming\nsudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status',
    examTips: [
      'ข้อควรระวังหน้างานจริง: ต้องพิมพ์ ufw allow 22 ก่อน ufw enable เสมอ ไม่อย่างนั้นจะตัด SSH ตัวเองหลุดจาก Server!',
      'พอร์ตฐานข้อมูล (3306, 5432) และ SMB (445) ไม่ควรเปิดรับจากอินเทอร์เน็ตสาธารณะเด็ดขาด'
    ]
  },
  {
    id: 'vol8',
    vol: 'บทที่ 8',
    icon: '📦',
    color: '#f472b6',
    title: 'การสำรองข้อมูล (Backup) & แผนกู้คืนภัยพิบัติ (DR)',
    subtitle: 'กฎ 3-2-1-1-0, เปรียบเทียบ Full / Incremental / Differential และตัวชี้วัด RTO vs RPO',
    readTime: '5 นาที',
    objectives: [
      'ออกแบบแผนสำรองข้อมูลตามมาตรฐาน 3-2-1-1-0 Backup Rule ได้',
      'เปรียบเทียบข้อดี-ข้อเสียของ Full, Incremental และ Differential Backup ได้',
      'แยกความแตกต่างระหว่าง RTO (เวลากู้ระบบ) และ RPO (จุดข้อมูลย้อนหลัง) ได้ชัดเจน'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 210" class="codex-svg">
        <rect width="760" height="210" rx="14" fill="#0b1325" />
        <text x="380" y="26" text-anchor="middle" fill="#f472b6" font-size="14" font-weight="700">แผนภาพเส้นเวลา Disaster Recovery: RPO vs RTO</text>
        <!-- Timeline Line -->
        <line x1="60" y1="115" x2="700" y2="115" stroke="#64748b" stroke-width="4" />
        <!-- Last Backup -->
        <circle cx="150" cy="115" r="10" fill="#34d399" />
        <text x="150" y="148" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">Backup ล่าสุด</text>
        <text x="150" y="165" text-anchor="middle" fill="#94a3b8" font-size="10">11:45 น.</text>
        <!-- Disaster -->
        <circle cx="380" cy="115" r="12" fill="#ef4444" />
        <text x="380" y="148" text-anchor="middle" fill="#fca5a5" font-size="12" font-weight="700">💥 เกิดเหตุระบบล่ม!</text>
        <text x="380" y="165" text-anchor="middle" fill="#94a3b8" font-size="10">12:00 น.</text>
        <!-- Recovered -->
        <circle cx="620" cy="115" r="10" fill="#38bdf8" />
        <text x="620" y="148" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">✅ กู้ระบบกลับมาออนไลน์</text>
        <text x="620" y="165" text-anchor="middle" fill="#94a3b8" font-size="10">14:00 น.</text>
        <!-- RPO Bracket -->
        <rect x="155" y="54" width="220" height="44" rx="8" fill="rgba(251,191,36,0.16)" stroke="#fbbf24" />
        <text x="265" y="73" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700">← RPO (ข้อมูลที่ยอมหายได้) →</text>
        <text x="265" y="90" text-anchor="middle" fill="#fef08a" font-size="10">ตัวอย่าง: 15 นาที (11:45 → 12:00)</text>
        <!-- RTO Bracket -->
        <rect x="385" y="54" width="230" height="44" rx="8" fill="rgba(56,189,248,0.16)" stroke="#38bdf8" />
        <text x="500" y="73" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">← RTO (เวลาที่ยอมให้ล่มได้) →</text>
        <text x="500" y="90" text-anchor="middle" fill="#bae6fd" font-size="10">ตัวอย่าง: 2 ชม. (12:00 → 14:00)</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. กฎสำรองข้อมูลสากล 3-2-1-1-0',
        bullets: [
          '<strong>3 ชุดข้อมูล:</strong> ข้อมูลต้นฉบับ 1 ชุด + ข้อมูลสำรองอย่างน้อย 2 ชุด',
          '<strong>2 ชนิดสื่อบันทึก:</strong> เก็บบนสื่อต่างประเภทกัน เช่น NAS/HDD ภายใน + External Drive หรือ Cloud Storage',
          '<strong>1 ชุด Off-site:</strong> เก็บนอกสถานที่ (เช่น Cloud หรือสาขาอื่น) ป้องกันไฟไหม้/น้ำท่วม',
          '<strong>1 ชุด Offline / Immutable:</strong> ตัดขาดจากเครือข่ายหรือล็อกห้ามแก้ไข เพื่อป้องกัน Ransomware วิ่งตามมาเข้ารหัสไฟล์สำรอง',
          '<strong>0 Error:</strong> ต้องซ้อมทดสอบกู้คืน (Restore Test) สม่ำเสมอให้มั่นใจว่ากู้ได้จริง 0 ข้อผิดพลาด!'
        ]
      },
      {
        heading: '2. เปรียบเทียบ Full vs Incremental vs Differential Backup',
        table: {
          headers: ['รูปแบบ', 'เก็บอะไรบ้าง', 'ความเร็วตอนสำรอง', 'ความยากตอนกู้คืน (Restore)'],
          rows: [
            ['Full Backup', 'สำรองข้อมูลทั้งหมด 100%', 'ช้าที่สุด + กินพื้นที่มาก', 'ง่ายและเร็วสุด (ใช้แค่ 1 ชุด)'],
            ['Incremental', 'เฉพาะที่เปลี่ยนจาก Backup ครั้งล่าสุด (ทุกชนิด)', 'เร็วที่สุด + ประหยัดพื้นที่สุด', 'ช้า (ต้องใช้ Full + Incremental ทุกชุดเรียงกัน)'],
            ['Differential', 'ทุกอย่างที่เปลี่ยนนับจาก Full Backup ล่าสุด', 'ปานกลาง (ขนาดโตขึ้นทุกวัน)', 'เร็ว (ใช้แค่ Full ล่าสุด + Differential ล่าสุด = 2 ชุด)']
          ]
        }
      }
    ],
    analogy: '⏱️ เปรียบเทียบ RTO & RPO ให้จำไม่เคยลืม: สมมติคุณพิมพ์รายงานใน Word แล้วกดเซฟทุก 15 นาที (= RPO 15 นาที เพราะถ้าไฟดับ งานหายย้อนหลังไม่เกิน 15 นาที) ส่วนเวลาที่คุณเดินไปยืมคอมเพื่อนมาเปิดไฟล์ทำงานต่อได้ภายใน 30 นาที (= RTO 30 นาที)!',
    cheatSheet: '# ตัวอย่างสำรองโฟลเดอร์เว็บแบบบีบอัดด้วย tar บน Linux\ntar -czvf /backup/www_$(date +%F).tar.gz /var/www/html\n\n# ซิงค์ข้อมูลสำรองข้ามเครื่องอย่างปลอดภัยด้วย rsync ผ่าน SSH\nrsync -avz /backup/ admin@192.168.10.50:/offsite_backup/',
    examTips: [
      'Full วันอาทิตย์ + Differential ทุกวัน (จ.–พ.) → กู้วันพฤหัสฯ ใช้แค่ 2 ชุด (Full อาทิตย์ + Diff พุธ)',
      'RTO (Time) = ระยะเวลา Downtime ที่รับได้ • RPO (Point) = ช่วงข้อมูลย้อนหลังที่ยอมเสียได้'
    ]
  },
  {
    id: 'vol9',
    vol: 'บทที่ 9',
    icon: '🐳',
    color: '#22d3ee',
    title: 'Docker, Cloud Computing, Reverse Proxy & Automation',
    subtitle: 'Docker Volume/Port Mapping, Cron Job 5 ช่อง, โมเดล IaaS/PaaS/SaaS และ Ansible',
    readTime: '5 นาที',
    objectives: [
      'ใช้งานคำสั่ง Docker พื้นฐาน (run, ps, images, port mapping, volume) ได้',
      'อ่านและเขียนตารางเวลา Linux Cron Job 5 ช่องได้ถูกต้อง',
      'จำแนกรูปแบบบริการ Cloud (IaaS, PaaS, SaaS) และหน้าที่ของ Reverse Proxy ได้'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 215" class="codex-svg">
        <rect width="760" height="215" rx="14" fill="#0b1325" />
        <text x="380" y="26" text-anchor="middle" fill="#22d3ee" font-size="14" font-weight="700">โครงสร้างเวลา Linux Cron Job 5 ช่อง (ตัวอย่าง: 0 2 * * * = ตี 2 ทุกวัน)</text>
        <rect x="45" y="48" width="120" height="92" rx="10" fill="#132a45" stroke="#38bdf8" />
        <text x="105" y="84" text-anchor="middle" fill="#fde047" font-size="24" font-weight="800">0</text>
        <text x="105" y="108" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">นาที (Minute)</text>
        <text x="105" y="126" text-anchor="middle" fill="#94a3b8" font-size="10">0 – 59</text>

        <rect x="182" y="48" width="120" height="92" rx="10" fill="#132a45" stroke="#34d399" />
        <text x="242" y="84" text-anchor="middle" fill="#fde047" font-size="24" font-weight="800">2</text>
        <text x="242" y="108" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">ชั่วโมง (Hour)</text>
        <text x="242" y="126" text-anchor="middle" fill="#94a3b8" font-size="10">0 – 23</text>

        <rect x="319" y="48" width="120" height="92" rx="10" fill="#132a45" stroke="#a78bfa" />
        <text x="379" y="84" text-anchor="middle" fill="#fde047" font-size="24" font-weight="800">*</text>
        <text x="379" y="108" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">วันที่ (Day)</text>
        <text x="379" y="126" text-anchor="middle" fill="#94a3b8" font-size="10">1 – 31 (* = ทุกวัน)</text>

        <rect x="456" y="48" width="120" height="92" rx="10" fill="#132a45" stroke="#f472b6" />
        <text x="516" y="84" text-anchor="middle" fill="#fde047" font-size="24" font-weight="800">*</text>
        <text x="516" y="108" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">เดือน (Month)</text>
        <text x="516" y="126" text-anchor="middle" fill="#94a3b8" font-size="10">1 – 12 (* = ทุกเดือน)</text>

        <rect x="593" y="48" width="122" height="92" rx="10" fill="#132a45" stroke="#fb923c" />
        <text x="654" y="84" text-anchor="middle" fill="#fde047" font-size="24" font-weight="800">*</text>
        <text x="654" y="108" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">วันในสัปดาห์</text>
        <text x="654" y="126" text-anchor="middle" fill="#94a3b8" font-size="10">0=อา. ... 6=ส.</text>

        <text x="380" y="178" text-anchor="middle" fill="#6ee7b7" font-size="13" font-family="monospace">0 2 * * *  /opt/backup.sh   →   รันสคริปต์สำรองข้อมูลอัตโนมัติทุกวันเวลา 02:00 น.</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. พื้นฐาน Docker Container สำหรับผู้ดูแลระบบ',
        bullets: [
          '<strong>Image vs Container:</strong> Image คือแม่พิมพ์สำเร็จรูป (Read-only) ส่วน Container คือตัวโปรแกรมที่กำลังรันจริงจาก Image นั้น',
          '<strong>Port Mapping (<code>-p 8080:80</code>):</strong> เปิดพอร์ต 8080 บนเครื่อง Host เพื่อส่งทราฟฟิกเข้าไปยังพอร์ต 80 ภายใน Container',
          '<strong>Docker Volume:</strong> ใช้เก็บข้อมูลฐานข้อมูลหรือไฟล์อัปโหลดไว้ภายนอก Container เพื่อให้ข้อมูลอยู่ถาวรแม้ลบหรืออัปเกรด Container'
        ]
      },
      {
        heading: '2. โมเดลบริการ Cloud Computing (IaaS / PaaS / SaaS)',
        table: {
          headers: ['โมเดล Cloud', 'สิ่งที่ผู้ให้บริการดูแล', 'สิ่งที่เราดูแลเอง', 'ตัวอย่าง'],
          rows: [
            ['IaaS (Infrastructure)', 'ฮาร์ดแวร์, เน็ตเวิร์ก, Hypervisor', 'OS, Security Patch, แอป, ข้อมูล', 'AWS EC2, Google Compute Engine'],
            ['PaaS (Platform)', 'ฮาร์ดแวร์ + OS + Runtime', 'โค้ดแอปพลิเคชันและข้อมูล', 'Firebase, Render, Google App Engine'],
            ['SaaS (Software)', 'ดูแลให้ครบทั้งระบบ 100%', 'ใช้งานและจัดการผู้ใช้เท่านั้น', 'Gmail, Google Workspace, Microsoft 365']
          ]
        }
      },
      {
        heading: '3. Reverse Proxy & Server Automation',
        bullets: [
          '<strong>Reverse Proxy (Nginx / Caddy):</strong> ยืนหน้าด่านรับ HTTPS พอร์ต 443 จัดการใบรับรอง SSL ไว้ที่เดียว แล้วส่งต่อคำขอไปยังแอปภายในพอร์ต 3000/8000',
          '<strong>Automation (Cron & Ansible):</strong> ใช้ <code>crontab -e</code> ตั้งงานอัตโนมัติบนเครื่องเดียว และใช้ <strong>Ansible</strong> จัดการเซิร์ฟเวอร์พร้อมกันหลายสิบเครื่องผ่าน SSH'
        ]
      }
    ],
    analogy: '🍕 เปรียบเทียบ Cloud 3 แบบด้วย "การกินพิซซ่า": ซื้อเครื่องทำเองหมด = On-Premise • เช่าห้องครัว+เตาอบแต่ทำแป้งเอง = IaaS • สั่งพิซซ่าเดลิเวอรีมากินที่โต๊ะ = PaaS • ไปนั่งกินที่ร้านพิซซ่าเลยไม่ต้องล้างจาน = SaaS!',
    cheatSheet: '# คำสั่ง Docker & Cron ที่ใช้บ่อย\ndocker run -d -p 8080:80 --name web nginx\ndocker ps -a\ndocker images\ncrontab -l',
    examTips: [
      'จำช่องที่ 5 ของ Cron: เลข 0 (หรือ 7) = วันอาทิตย์ → ดังนั้น 0 3 * * 0 คือทุกวันอาทิตย์ตี 3!',
      'หากข้อมูลใน Docker Container หายเมื่อลบสร้างใหม่ แสดงว่ายังไม่ได้ผูก Docker Volume'
    ]
  },
  {
    id: 'vol10',
    vol: 'บทที่ 10',
    icon: '🔍',
    color: '#fb923c',
    title: 'สืบสวน Log, จูนสมรรถนะ & Incident Response',
    subtitle: 'การอ่าน /var/log/auth.log, Event Viewer ID 4625, Swap Thrashing, SIEM และ 6 ขั้นตอนรับมือเหตุการณ์',
    readTime: '5 นาที',
    objectives: [
      'ระบุแหล่งเก็บไฟล์ Log สำคัญบน Linux และ Windows Event Viewer ได้',
      'วินิจฉัยคอขวดสมรรถนะ Server (CPU Load Average, Swap Thrashing) ได้',
      'ปฏิบัติตาม 6 ขั้นตอนของ Incident Response เมื่อเกิดเหตุการณ์ภัยคุกคามทางไซเบอร์ได้'
    ],
    diagramSvg: `
      <svg viewBox="0 0 760 205" class="codex-svg">
        <rect width="760" height="205" rx="14" fill="#0b1325" />
        <text x="380" y="26" text-anchor="middle" fill="#fb923c" font-size="14" font-weight="700">วงจรรับมือเหตุการณ์ไซเบอร์ 6 ขั้นตอน (NIST / SANS Incident Response)</text>
        <g font-size="11" font-weight="700" text-anchor="middle">
          <rect x="20" y="55" width="110" height="82" rx="10" fill="#1e3a5f" stroke="#38bdf8" />
          <text x="75" y="84" fill="#7dd3fc">1. Preparation</text><text x="75" y="106" fill="#cbd5e1" font-size="9" font-weight="400">เตรียมพร้อม/Backup</text>

          <rect x="142" y="55" width="110" height="82" rx="10" fill="#312e81" stroke="#a78bfa" />
          <text x="197" y="84" fill="#ddd6fe">2. Identification</text><text x="197" y="106" fill="#cbd5e1" font-size="9" font-weight="400">ตรวจพบจาก Log/SIEM</text>

          <rect x="264" y="55" width="110" height="82" rx="10" fill="#7c2d12" stroke="#f87171" stroke-width="2" />
          <text x="319" y="84" fill="#fca5a5">3. Containment</text><text x="319" y="106" fill="#fed7aa" font-size="9" font-weight="400">ตัดแยกเน็ต+เก็บหลักฐาน</text>

          <rect x="386" y="55" width="110" height="82" rx="10" fill="#581c87" stroke="#f472b6" />
          <text x="441" y="84" fill="#fbcfe8">4. Eradication</text><text x="441" y="106" fill="#cbd5e1" font-size="9" font-weight="400">กำจัดมัลแวร์+อุดช่องโหว่</text>

          <rect x="508" y="55" width="110" height="82" rx="10" fill="#064e3b" stroke="#34d399" />
          <text x="563" y="84" fill="#6ee7b7">5. Recovery</text><text x="563" y="106" fill="#cbd5e1" font-size="9" font-weight="400">กู้ Clean Backup ขึ้นใช้</text>

          <rect x="630" y="55" width="110" height="82" rx="10" fill="#422006" stroke="#fbbf24" />
          <text x="685" y="84" fill="#fde047">6. Lessons</text><text x="685" y="106" fill="#fef08a" font-size="9" font-weight="400">สรุปบทเรียนกันเกิดซ้ำ</text>
        </g>
        <text x="380" y="176" text-anchor="middle" fill="#94a3b8" font-size="11">หัวใจสำคัญ: ห้ามฟอร์แมตเครื่องทิ้งก่อนเก็บ Log และหลักฐานนิติวิทยา (Forensics) เด็ดขาด!</text>
      </svg>
    `,
    sections: [
      {
        heading: '1. แหล่งเก็บ Log สำคัญสำหรับงานสืบสวน (Forensics)',
        bullets: [
          '<strong>Ubuntu / Debian:</strong> <code>/var/log/auth.log</code> (ประวัติ SSH & sudo), <code>/var/log/syslog</code> (เหตุการณ์ระบบ), <code>/var/log/nginx/error.log</code> (Error เว็บเซิร์ฟเวอร์)',
          '<strong>Windows Server Event Viewer:</strong> <strong>Event ID 4625</strong> = ล็อกอินไม่สำเร็จ (ใช้จับ Brute-Force), <strong>Event ID 4624</strong> = ล็อกอินสำเร็จ, <strong>Event ID 4720</strong> = สร้างบัญชีผู้ใช้ใหม่',
          '<strong>SIEM (Security Information and Event Management):</strong> ระบบรวมศูนย์ Log จากทุก Server เพื่อวิเคราะห์และแจ้งเตือนอัตโนมัติ เช่น Wazuh, Splunk, ELK Stack'
        ]
      },
      {
        heading: '2. การวิเคราะห์คอขวดสมรรถนะ Server',
        bullets: [
          '<strong>CPU Load Average (<code>uptime</code> / <code>top</code>):</strong> แสดงค่าเฉลี่ย 1, 5, 15 นาที หากค่าสูงกว่าจำนวน CPU Core ต่อเนื่อง แสดงว่า CPU ล้นหรือมีงานรอ Disk I/O ค้าง',
          '<strong>Swap Thrashing:</strong> อาการที่ RAM เต็มจน OS ต้องสลับข้อมูลลงพื้นที่ Swap บนดิสก์อย่างหนัก ทำให้เครื่องช้าจนค้าง วิธีแก้คือหา Process ที่มี Memory Leak หรือเพิ่ม RAM'
        ]
      }
    ],
    analogy: '🚓 เปรียบเทียบ Containment ให้เห็นภาพ: เมื่อเกิดเหตุขโมยขึ้นบ้าน ขั้นตอนแรกคือ "ปิดล้อมพื้นที่และกั้นเทปเหลืองเก็บลายนิ้วมือ (Containment)" ไม่ใช่รีบกวาดบ้านทำความสะอาดทิ้ง (Format) จนตำรวจไม่รู้ว่าโจรปีนเข้ามาทางหน้าต่างบานไหน!',
    cheatSheet: '# ดู Error Log สด ๆ แบบเรียลไทม์\ntail -f /var/log/nginx/error.log\n\n# ค้นหาการล็อกอิน SSH ที่ล้มเหลว\ngrep "Failed password" /var/log/auth.log\n\n# ตรวจ Load Average และ RAM/Swap\nuptime && free -h',
    examTips: [
      'Windows Event ID 4625 = Failed Logon • Linux auth log (Ubuntu) = /var/log/auth.log',
      'คำสั่ง tail -f ใช้เฝ้าดู Log ที่กำลังวิ่งเข้ามาแบบสด ๆ (Real-time)'
    ]
  }
];
