/* Educational Curriculum Data for: รายวิชาระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้น */

const CATEGORIES = {
  fundamentals: 'พื้นฐาน Server OS & ฮาร์ดแวร์',
  network: 'เครือข่าย พอร์ต และบริการหลัก',
  users: 'ผู้ใช้ กลุ่ม สิทธิ์ & Active Directory',
  cli: 'คำสั่งจัดการระบบ (CLI / Terminal)',
  security: 'ความปลอดภัย Firewall & Backup'
};

const RANKS = [
  { minXp: 0, title: 'SysAdmin ฝึกหัด' },
  { minXp: 200, title: 'Junior Server Technician' },
  { minXp: 450, title: 'System Administrator' },
  { minXp: 750, title: 'Senior Infrastructure Admin' },
  { minXp: 1100, title: 'Data Center Architect' }
];

const BADGES = [
  { id: 'first_mission', emoji: '🛡️', name: 'ผู้พิทักษ์เซิร์ฟเวอร์', desc: 'ผ่านภารกิจจำลองครั้งแรก' },
  { id: 'all_missions', emoji: '👑', name: 'เจ้าแห่งศูนย์ข้อมูล', desc: 'ผ่านภารกิจจำลองครบทั้ง 8 ด่าน' },
  { id: 'cli_novice', emoji: '⌨️', name: 'จอมยุทธ์ Terminal', desc: 'สำเร็จแล็บ CLI อย่างน้อย 4 แล็บ' },
  { id: 'cli_master', emoji: '💻', name: 'ปรมาจารย์ Linux CLI', desc: 'สำเร็จแล็บ CLI ครบทั้ง 8 แล็บ' },
  { id: 'port_ace', emoji: '⚡', name: 'นักคัดแยกพอร์ตไวแสง', desc: 'ทำคะแนน Port Rush ได้ตั้งแต่ 1,000 ขึ้นไป' },
  { id: 'certified', emoji: '🎓', name: 'Certified SysAdmin', desc: 'สอบวัดความรู้ผ่านเกณฑ์ 70% ขึ้นไป' }
];

/* ==================== 8 INCIDENT MISSIONS (2 STEPS EACH) ==================== */
const MISSIONS = [
  {
    id: 'm1',
    title: 'ด่าน 1: วางโครงสร้างเครื่องแม่ข่ายใหม่',
    category: 'fundamentals',
    difficulty: 'เริ่มต้น',
    xp: 80,
    summary: 'วิทยาลัยกำลังจัดตั้งระบบเครือข่ายห้องปฏิบัติการคอมพิวเตอร์ 60 เครื่อง ต้องเลือกสถาปัตยกรรมและฮาร์ดแวร์ที่เหมาะสม',
    steps: [
      {
        context: 'ผู้บริหารต้องการให้จัดเก็บบัญชีผู้ใช้และไฟล์งานไว้ที่ส่วนกลาง บริหารจัดการความปลอดภัยได้จากจุดเดียว รองรับเครื่องลูกข่าย 60 เครื่อง',
        question: 'สถาปัตยกรรมเครือข่ายแบบใดเหมาะสมที่สุดสำหรับองค์กรนี้?',
        options: [
          'Peer-to-Peer (P2P) เพราะทุกเครื่องมีสิทธิ์เท่ากันและไม่ต้องใช้เครื่องแม่ข่าย',
          'Client-Server เพราะมีเครื่องแม่ข่ายจัดการสิทธิ์ ข้อมูล และบริการจากส่วนกลางได้',
          'Standalone Network เพราะไม่ต้องเชื่อมต่อเครือข่ายจึงปลอดภัยที่สุด',
          'Personal Area Network (PAN) เชื่อมต่อผ่าน Bluetooth ระหว่างห้องเรียน'
        ],
        answer: 1,
        explanation: 'ระบบ Client-Server เหมาะกับองค์กรที่มีเครื่องจำนวนมาก (มากกว่า 10 เครื่องขึ้นไป) เพราะรวมศูนย์การจัดการบัญชีผู้ใช้ ความปลอดภัย การสำรองข้อมูล และบริการเครือข่ายไว้ที่ Server'
      },
      {
        context: 'เมื่อเลือกซื้อฮาร์ดแวร์สำหรับเครื่อง Server ที่ต้องเปิดทำงานตลอด 24 ชั่วโมง 7 วัน (24/7)',
        question: 'คุณสมบัติฮาร์ดแวร์คู่ใดที่เป็นจุดเด่นสำคัญของเครื่องแม่ข่าย (Server) ต่างจาก PC ทั่วไป?',
        options: [
          'การ์ดจอเล่นเกม RGB และระบบระบายความร้อนด้วยน้ำแบบเปิด',
          'ECC RAM (ตรวจจับและแก้ไขข้อผิดพลาดหน่วยความจำ) และ Redundant Power Supply (แหล่งจ่ายไฟสำรอง)',
          'ลำโพงรอบทิศทาง 7.1 และจอภาพความถี่ 240Hz',
          'แบตเตอรี่ลิเธียมในตัวเหมือนโน้ตบุ๊ก และพอร์ต HDMI 4 ช่อง'
        ],
        answer: 1,
        explanation: 'เครื่องแม่ข่ายเน้นเสถียรภาพ (Reliability) และความพร้อมใช้งานสูง (High Availability) จึงใช้ ECC RAM ลดอาการจอฟ้า/ข้อมูลเพี้ยน และ Redundant PSU เพื่อไม่ให้เครื่องดับเมื่อเพาเวอร์ซัพพลายตัวหนึ่งเสีย'
      }
    ]
  },
  {
    id: 'm2',
    title: 'ด่าน 2: เว็บไซต์วิทยาลัยล่มกะทันหัน!',
    category: 'cli',
    difficulty: 'เริ่มต้น',
    xp: 90,
    summary: 'นักศึกษาแจ้งว่าเข้าเว็บลงทะเบียนเรียนไม่ได้ (Connection Refused) คุณต้องตรวจสอบบริการ Web Server บน Ubuntu Server',
    steps: [
      {
        context: 'คุณ SSH เข้าไปยังเครื่อง SRV-WEB-01 (Ubuntu Server) และต้องการดูว่าบริการ Nginx ยังทำงานอยู่หรือไม่',
        code: 'root@srv-web-01:~# ???',
        question: 'คำสั่งใดใช้ตรวจสอบสถานะการทำงานของ Service "nginx" บน Linux รุ่นใหม่ (systemd)?',
        options: [
          'systemctl status nginx',
          'ipconfig /all nginx',
          'mkdir status nginx',
          'chmod 777 nginx'
        ],
        answer: 0,
        explanation: 'คำสั่ง systemctl status <ชื่อบริการ> ใช้ดูสถานะของ Service บนระบบ Linux ที่ใช้ systemd เช่น Ubuntu Server, Debian, Rocky Linux และ RHEL'
      },
      {
        context: 'ผลลัพธ์แสดงว่า Active: inactive (dead) หลังจากอัปเดตไฟล์ตั้งค่า คุณต้องการสั่งเริ่มบริการใหม่และให้เปิดอัตโนมัติทุกครั้งที่รีบูตเครื่อง',
        code: '● nginx.service - A high performance web server\n   Loaded: loaded\n   Active: inactive (dead)',
        question: 'ควรใช้คำสั่งใดเพื่อเริ่มบริการและตั้งค่าเปิดอัตโนมัติเมื่อเปิดเครื่อง?',
        options: [
          'systemctl stop nginx && systemctl disable nginx',
          'systemctl enable --now nginx (หรือ start แล้ว enable)',
          'rm -rf /etc/nginx',
          'apt remove nginx'
        ],
        answer: 1,
        explanation: 'systemctl start nginx ใช้เปิดบริการทันที ส่วน systemctl enable nginx ใช้ตั้งให้เปิดอัตโนมัติตอนบูตเครื่อง (หรือรวมกันเป็น systemctl enable --now nginx)'
      }
    ]
  },
  {
    id: 'm3',
    title: 'ด่าน 3: วิกฤตเครือข่าย ไร้ IP & เข้าเว็บด้วยชื่อไม่ได้',
    category: 'network',
    difficulty: 'ปานกลาง',
    xp: 100,
    summary: 'ห้องแล็บใหม่เปิดเครื่องแล้วไม่ได้รับหมายเลข IP และเครื่องที่กรอก IP เองกลับเข้าเว็บไซต์ด้วยชื่อโดเมนไม่ได้',
    steps: [
      {
        context: 'เครื่องลูกข่ายทุกเครื่องในห้องแล็บขึ้น IP เป็น 169.254.x.x (APIPA) ซึ่งบ่งชี้ว่าไม่ได้รับการแจกหมายเลข IP อัตโนมัติ',
        question: 'คุณควรตรวจสอบบริการใดบนเครื่องแม่ข่ายเป็นอันดับแรก และเครื่อง Server เองควรตั้งค่า IP แบบใด?',
        options: [
          'ตรวจสอบบริการ DHCP Server / และเครื่อง Server ควรกำหนดเป็น Static IP',
          'ตรวจสอบบริการ FTP Server / และเครื่อง Server ควรรับ IP แบบสุ่มทุกวัน',
          'ตรวจสอบบริการ SMTP Server / และปิดการ์ดแลนทั้งหมด',
          'ตรวจสอบบริการ Print Server / และตั้งค่า Subnet Mask เป็น 0.0.0.0'
        ],
        answer: 0,
        explanation: 'DHCP (Port 67/68) มีหน้าที่แจก IP, Subnet Mask, Gateway และ DNS อัตโนมัติให้ Client ส่วนตัวเครื่อง Server เองต้องตั้งค่า Static IP เพื่อไม่ให้ IP เปลี่ยนจน Client ติดต่อไม่ได้'
      },
      {
        context: 'หลังกู้ DHCP สำเร็จ เครื่องลูกข่ายสามารถ ping 8.8.8.8 ได้ปกติ แต่เมื่อเปิดเบราว์เซอร์พิมพ์ www.college.ac.th กลับขึ้น "DNS_PROBE_FINISHED_NXDOMAIN"',
        question: 'ปัญหาดังกล่าวเกิดจากบริการใดทำงานผิดพลาด และบริการนั้นใช้พอร์ตมาตรฐานหมายเลขใด?',
        options: [
          'SSH — พอร์ต 22',
          'DNS (Domain Name System) — พอร์ต 53',
          'HTTP — พอร์ต 80',
          'RDP — พอร์ต 3389'
        ],
        answer: 1,
        explanation: 'DNS (พอร์ต 53 ทั้ง UDP และ TCP) ทำหน้าที่แปลงชื่อโดเมนที่มนุษย์จำง่ายให้เป็นหมายเลข IP Address หาก ping IP ได้แต่เข้าด้วยชื่อไม่ได้ แสดงว่า DNS มีปัญหา'
      }
    ]
  },
  {
    id: 'm4',
    title: 'ด่าน 4: จัดระเบียบบัญชีผู้ใช้ด้วย Windows Active Directory',
    category: 'users',
    difficulty: 'ปานกลาง',
    xp: 100,
    summary: 'บริษัทขยายทีมเพิ่ม 3 แผนก (บัญชี, ไอที, การตลาด) ต้องจัดการบัญชีผู้ใช้และนโยบายเครื่องบน Windows Server',
    steps: [
      {
        context: 'คุณติดตั้ง Windows Server 2022 เพื่อทำหน้าที่เป็น Domain Controller (DC) จัดการล็อกอินส่วนกลางให้ทุกเครื่องในองค์กร',
        question: 'Role (บทบาท) ใดบน Windows Server ที่ต้องติดตั้งเพื่อสร้างระบบ Domain และจัดการผู้ใช้ส่วนกลาง?',
        options: [
          'Active Directory Domain Services (AD DS)',
          'Windows Media Streaming Service',
          'Print and Document Services',
          'Hyper-V Virtual Switch Only'
        ],
        answer: 0,
        explanation: 'Active Directory Domain Services (AD DS) คือหัวใจหลักของ Windows Server ในการสร้าง Domain, เก็บข้อมูลผู้ใช้/กลุ่ม/คอมพิวเตอร์ และยืนยันตัวตน (Authentication)'
      },
      {
        context: 'ฝ่ายบริหารต้องการบังคับให้พนักงานแผนกบัญชีทุกคนเปลี่ยนรหัสผ่านทุก 90 วัน และล็อกหน้าจออัตโนมัติเมื่อไม่ใช้งาน 10 นาที โดยไม่ต้องเดินไปตั้งค่าทีละเครื่อง',
        question: 'เครื่องมือใดใน Active Directory ใช้กำหนดนโยบายลงไปยังกลุ่มผู้ใช้หรือ Organizational Unit (OU) ได้พร้อมกัน?',
        options: [
          'Disk Defragmenter',
          'Group Policy Object (GPO)',
          'Task Manager',
          'Device Manager'
        ],
        answer: 1,
        explanation: 'Group Policy (GPO) ช่วยให้ผู้ดูแลระบบกำหนดนโยบายความปลอดภัย การติดตั้งซอฟต์แวร์ และการตั้งค่าเครื่องลูกข่ายทั้งหมดใน OU ได้จากส่วนกลาง'
      }
    ]
  },
  {
    id: 'm5',
    title: 'ด่าน 5: ไฟล์ความลับรั่วไหล! แก้ไขสิทธิ์ Linux Permissions',
    category: 'users',
    difficulty: 'ปานกลาง',
    xp: 110,
    summary: 'พบไฟล์สคริปต์และไฟล์คีย์เชื่อมต่อฐานข้อมูลถูกตั้งสิทธิ์เป็น 777 ทำให้ผู้ใช้ทุกคนแก้ไขและอ่านรหัสผ่านได้',
    steps: [
      {
        context: 'ไฟล์ db_secret.env มีรหัสผ่านฐานข้อมูลอยู่ข้างใน คุณต้องการให้เฉพาะเจ้าของไฟล์ (Owner) อ่านและแก้ไขได้เท่านั้น ส่วนกลุ่ม (Group) และผู้อื่น (Others) ห้ามเข้าถึงเลย',
        code: '-rwxrwxrwx 1 admin staff 512 Nov 20 db_secret.env',
        question: 'ควรใช้คำสั่ง chmod ค่าใดตามหลัก Principle of Least Privilege?',
        options: [
          'chmod 777 db_secret.env',
          'chmod 600 db_secret.env',
          'chmod 644 db_secret.env',
          'chmod 111 db_secret.env'
        ],
        answer: 1,
        explanation: '600 หมายถึง Owner = 4(r)+2(w) = 6 (อ่านและเขียนได้), Group = 0 (ไม่มีสิทธิ์), Others = 0 (ไม่มีสิทธิ์) แสดงเป็น -rw------- เหมาะมากสำหรับไฟล์รหัสผ่านและ SSH Private Key'
      },
      {
        context: 'ต่อไปคุณมีไฟล์สคริปต์สำรองข้อมูลชื่อ backup.sh ที่ต้องการให้ Owner อ่าน-เขียน-รันได้ (rwx) ส่วน Group และ Others อ่านและรันได้ (r-x) แต่ห้ามแก้ไข',
        question: 'รหัสเลขฐานแปดใดตรงกับสิทธิ์ -rwxr-xr-x?',
        options: [
          '755',
          '744',
          '655',
          '700'
        ],
        answer: 0,
        explanation: 'Owner: r(4)+w(2)+x(1) = 7, Group: r(4)+x(1) = 5, Others: r(4)+x(1) = 5 รวมเป็น 755 ซึ่งเป็นสิทธิ์มาตรฐานของสคริปต์และไดเรกทอรีบน Linux Server'
      }
    ]
  },
  {
    id: 'm6',
    title: 'ด่าน 6: ตั้งปราการ Firewall รับมือผู้บุกรุก',
    category: 'security',
    difficulty: 'ปานกลาง',
    xp: 110,
    summary: 'ระบบตรวจจับพบการสแกนพอร์ตจากภายนอกจำนวนมาก คุณต้องกำหนดกฎ Firewall (UFW) บน Web Server สาธารณะ',
    steps: [
      {
        context: 'เครื่อง SRV-WEB-01 ให้บริการเฉพาะเว็บไซต์ (HTTP/HTTPS) และต้องให้ผู้ดูแลระบบเข้าจัดการผ่าน SSH เท่านั้น ส่วนพอร์ตฐานข้อมูล (3306) ไม่ควรเปิดรับจากอินเทอร์เน็ตภายนอก',
        question: 'ชุดพอร์ตใดควรอนุญาต (Allow) จากภายนอกบน Firewall ของ Web Server นี้?',
        options: [
          'พอร์ต 22 (SSH), 80 (HTTP), 443 (HTTPS)',
          'พอร์ต 23 (Telnet), 3306 (MySQL), 445 (SMB)',
          'เปิดทุกพอร์ต 1–65535 เพื่อให้ใช้งานได้สะดวก',
          'ปิดทุกพอร์ตรวมถึงพอร์ต 22 ขณะกำลังรีโมท SSH อยู่โดยไม่วางแผน'
        ],
        answer: 0,
        explanation: 'หลักการ Firewall ที่ดีคือ Default Deny Incoming แล้วเปิดเฉพาะพอร์ตที่จำเป็นจริง ๆ ได้แก่ 80/443 สำหรับเว็บ และ 22 สำหรับ SSH (ห้ามเปิด Telnet ที่ไม่เข้ารหัส หรือพอร์ต DB ออกสู่สาธารณะ)'
      },
      {
        context: 'คุณพบว่ามีบอตพยายามสุ่มรหัสผ่านเข้าบัญชี root ผ่านพอร์ต SSH 22 ตลอดทั้งคืน',
        question: 'แนวทาง SSH Hardening ใดช่วยเพิ่มความปลอดภัยให้เครื่องแม่ข่าย Linux ได้ดีที่สุด?',
        options: [
          'ตั้งรหัสผ่าน root เป็น 123456 เพื่อให้ทีมงานจำง่าย',
          'ปิดการล็อกอินตรงด้วย root (PermitRootLogin no) และใช้ SSH Key Authentication แทนรหัสผ่าน',
          'เปลี่ยนไปใช้โปรโตคอล Telnet พอร์ต 23 แทน SSH',
          'ลบไฟล์ /etc/passwd ออกจากเครื่อง'
        ],
        answer: 1,
        explanation: 'การใช้ SSH Public/Private Key ร่วมกับการปิด PermitRootLogin และใช้โปรแกรมป้องกันอย่าง Fail2ban ช่วยลดความเสี่ยงจากการโจมตีแบบ Brute-Force ได้อย่างมหาศาล'
      }
    ]
  },
  {
    id: 'm7',
    title: 'ด่าน 7: ดิสก์ใกล้เต็ม & ระบบ RAID เสีย 1 ลูก!',
    category: 'fundamentals',
    difficulty: 'ท้าทาย',
    xp: 120,
    summary: 'เซิร์ฟเวอร์ฐานข้อมูลส่งสัญญาณเตือนไฟสีส้ม ฮาร์ดดิสก์ 1 ลูกในชุด RAID มีปัญหา และพาร์ติชัน /var ใกล้เต็ม',
    steps: [
      {
        context: 'เครื่องฐานข้อมูลใช้ฮาร์ดดิสก์ขนาด 2 TB จำนวน 4 ลูก และต้องการทั้ง "ความเร็วสูง" และ "ทนทานต่อดิสก์เสียได้" หากต้องเลือกระหว่าง RAID 0 กับ RAID 5',
        question: 'ข้อใดอธิบายความแตกต่างระหว่าง RAID 0 และ RAID 5 ได้ถูกต้องที่สุด?',
        options: [
          'RAID 0 ทนดิสก์เสียได้ 2 ลูก ส่วน RAID 5 ไม่ทนดิสก์เสียเลย',
          'RAID 0 เร็วและได้ความจุเต็มแต่หากดิสก์เสีย 1 ลูกข้อมูลหายหมด ส่วน RAID 5 ใช้ Parity ทนดิสก์เสียได้ 1 ลูก',
          'RAID 0 ใช้ดิสก์อย่างน้อย 5 ลูก ส่วน RAID 5 ใช้ดิสก์แค่ 1 ลูก',
          'ทั้ง RAID 0 และ RAID 5 สามารถทดแทนการทำ Backup นอกสถานที่ได้ 100%'
        ],
        answer: 1,
        explanation: 'RAID 0 ทำ Striping ล้วนไม่มีการสำรองข้อมูล (Fault Tolerance = 0) ส่วน RAID 5 ใช้ดิสก์อย่างน้อย 3 ลูก มี Parity กระจาย ทำให้ทนดิสก์เสียได้ 1 ลูก แต่จำไว้เสมอว่า "RAID ไม่ใช่ Backup!"'
      },
      {
        context: 'ระบบแจ้งเตือนว่าไม่สามารถเขียนไฟล์ Log ได้อีกต่อไปเพราะพื้นที่เก็บข้อมูลเต็ม คุณต้องการตรวจสอบการใช้งานพื้นที่ดิสก์แต่ละพาร์ติชันบน Linux แบบอ่านหน่วย GB/MB ได้ง่าย',
        question: 'คำสั่งใดใช้ตรวจสอบพื้นที่ว่างของดิสก์ในรูปแบบที่มนุษย์อ่านง่าย (Human-readable)?',
        options: [
          'df -h',
          'ping -t',
          'useradd -m',
          'nslookup'
        ],
        answer: 0,
        explanation: 'df -h (Disk Free, -h = human-readable) แสดงพื้นที่ทั้งหมด พื้นที่ใช้ไป และพื้นที่ว่างของแต่ละ Mount Point เป็นหน่วย MB/GB ได้อย่างชัดเจน'
      }
    ]
  },
  {
    id: 'm8',
    title: 'ด่าน 8: รับมือแรนซัมแวร์และวางแผน Backup 3-2-1',
    category: 'security',
    difficulty: 'ท้าทาย',
    xp: 130,
    summary: 'เกิดเหตุไฟล์งานบางส่วนถูกเข้ารหัสเรียกค่าไถ่ (Ransomware) ฝ่ายไอทีต้องวางนโยบายสำรองข้อมูลมาตรฐานสากล',
    steps: [
      {
        context: 'อาจารย์หัวหน้าสาขาให้คุณออกแบบแผนสำรองข้อมูลตาม "กฎ 3-2-1 Backup Rule" เพื่อป้องกันทั้งฮาร์ดดิสก์เสีย ไฟไหม้ และ Ransomware',
        question: 'กฎการสำรองข้อมูล 3-2-1 หมายถึงอะไร?',
        options: [
          'สำรองข้อมูล 3 ปีครั้ง, ใช้ 2 รหัสผ่าน, เก็บไว้ 1 โฟลเดอร์ในเครื่องเดิม',
          'มีข้อมูล 3 ชุด, เก็บบนสื่อบันทึกอย่างน้อย 2 ชนิด, และเก็บนอกสถานที่ (Off-site/Cloud) อย่างน้อย 1 ชุด',
          'ใช้ฮาร์ดดิสก์ 3 ลูกทำ RAID 0, ติดตั้ง 2 OS, และมีผู้ดูแล 1 คน',
          'บีบอัดไฟล์ 3 รอบ, ส่งอีเมล 2 ฉบับ, พิมพ์ใส่กระดาษ 1 ชุด'
        ],
        answer: 1,
        explanation: 'กฎ 3-2-1 คือมาตรฐานสากล: 3 ชุด (ต้นฉบับ 1 + สำรอง 2), บนสื่อ 2 ประเภทต่างกัน (เช่น NAS + External/Tape/Cloud), และอย่างน้อย 1 ชุดต้องอยู่นอกสถานที่หรือตัดขาดจากเครือข่าย (Air-gapped/Immutable)'
      },
      {
        context: 'ฐานข้อมูลมีขนาดใหญ่ 500 GB หากทำ Full Backup ทุกวันจะเต็มเร็วและใช้เวลานานมาก คุณต้องการให้การสำรองรายวันเร็วที่สุดและใช้พื้นที่น้อยที่สุด โดยบันทึกเฉพาะข้อมูลที่เปลี่ยนแปลงนับจาก Backup ครั้งล่าสุด (ไม่ว่าจะเป็น Full หรือ Incremental)',
        question: 'รูปแบบการสำรองข้อมูลแบบใดตรงกับความต้องการนี้?',
        options: [
          'Full Backup ทุกวัน',
          'Incremental Backup',
          'Disk Formatting',
          'RAID 0 Striping'
        ],
        answer: 1,
        explanation: 'Incremental Backup สำรองเฉพาะไฟล์ที่เปลี่ยนแปลงตั้งแต่การสำรองครั้งก่อนหน้า จึงใช้เวลาและพื้นที่น้อยที่สุด (แต่เวลา Restore ต้องไล่กู้ตั้งแต่ Full ล่าสุดตามด้วย Incremental ทุกชุดตามลำดับ)'
      }
    ]
  }
];

/* ==================== 8 INTERACTIVE LINUX CLI LABS ==================== */
const CLI_LABS = [
  {
    id: 'lab1',
    title: 'แล็บ 1: ตรวจสอบตัวตนและระบบปฏิบัติการ',
    category: 'cli',
    xp: 50,
    goal: 'ตรวจสอบชื่อบัญชีผู้ใช้ปัจจุบันหรือข้อมูล Kernel/OS ของเครื่องแม่ข่าย ด้วยคำสั่ง `whoami` หรือ `uname -a`',
    hint: 'พิมพ์คำสั่ง: whoami หรือ uname -a แล้วกด Enter',
    quickCmds: ['whoami', 'uname -a', 'hostname', 'help'],
    check: (cmd) => /^(whoami|uname(\s+-[a-z]+)?|hostname)$/.test(cmd.trim())
  },
  {
    id: 'lab2',
    title: 'แล็บ 2: ตรวจสอบหมายเลข IP ของเครื่องแม่ข่าย',
    category: 'network',
    xp: 60,
    goal: 'ดูข้อมูลการ์ดเครือข่ายและหมายเลข IP Address ของเครื่อง Linux Server (ใช้คำสั่ง `ip a` หรือ `ip addr`)',
    hint: 'พิมพ์คำสั่ง: ip a (หรือ ip addr / ifconfig)',
    quickCmds: ['ip a', 'ip addr', 'ping 8.8.8.8'],
    check: (cmd) => /^(ip\s+a(ddr)?|ifconfig)$/.test(cmd.trim())
  },
  {
    id: 'lab3',
    title: 'แล็บ 3: กู้คืนบริการ Web Server (Nginx)',
    category: 'cli',
    xp: 70,
    goal: 'บริการ nginx กำลังหยุดทำงาน (inactive) ให้สั่งเริ่มบริการ nginx ขึ้นมาใหม่ด้วย `systemctl start nginx`',
    hint: 'ตรวจสอบก่อนด้วย systemctl status nginx แล้วสั่ง: systemctl start nginx (หรือ systemctl restart nginx)',
    quickCmds: ['systemctl status nginx', 'systemctl start nginx', 'systemctl enable nginx'],
    check: (cmd, state) => state.services.nginx === 'active'
  },
  {
    id: 'lab4',
    title: 'แล็บ 4: ตรวจสอบพื้นที่ว่างของฮาร์ดดิสก์',
    category: 'fundamentals',
    xp: 60,
    goal: 'ตรวจสอบพื้นที่การใช้งานดิสก์ทุกพาร์ติชันในรูปแบบที่อ่านหน่วย GB/MB ได้ง่าย (`df -h`)',
    hint: 'พิมพ์คำสั่ง: df -h',
    quickCmds: ['df -h', 'free -h', 'ls -la'],
    check: (cmd) => /^df\s+-h$/.test(cmd.trim())
  },
  {
    id: 'lab5',
    title: 'แล็บ 5: ป้องกันไฟล์ความลับด้วย chmod',
    category: 'users',
    xp: 80,
    goal: 'ไฟล์ `secret.key` มีสิทธิ์หละหลวมเกินไป ให้เปลี่ยนสิทธิ์ให้เฉพาะเจ้าของอ่านและเขียนได้เท่านั้น (`chmod 600 secret.key`)',
    hint: 'ดูสิทธิ์เดิมด้วย ls -l แล้วพิมพ์: chmod 600 secret.key',
    quickCmds: ['ls -l', 'chmod 600 secret.key', 'chmod 755 backup.sh'],
    check: (cmd, state) => state.files['secret.key'] === '-rw-------'
  },
  {
    id: 'lab6',
    title: 'แล็บ 6: ทำให้สคริปต์ backup.sh รันได้',
    category: 'users',
    xp: 80,
    goal: 'ตั้งค่าสิทธิ์ไฟล์ `backup.sh` เป็น 755 (Owner=rwx, Group=r-x, Others=r-x) ด้วยคำสั่ง `chmod 755 backup.sh`',
    hint: 'พิมพ์คำสั่ง: chmod 755 backup.sh',
    quickCmds: ['ls -l', 'chmod 755 backup.sh'],
    check: (cmd, state) => state.files['backup.sh'] === '-rwxr-xr-x'
  },
  {
    id: 'lab7',
    title: 'แล็บ 7: เปิดพอร์ต HTTPS (443) บน Firewall',
    category: 'security',
    xp: 80,
    goal: 'อนุญาตทราฟฟิกเว็บไซต์แบบเข้ารหัส HTTPS (พอร์ต 443) ผ่าน UFW Firewall ด้วยคำสั่ง `ufw allow 443` หรือ `ufw allow https`',
    hint: 'ดูสถานะด้วย ufw status แล้วพิมพ์: ufw allow 443',
    quickCmds: ['ufw status', 'ufw allow 443', 'ufw allow 80'],
    check: (cmd, state) => state.firewall.includes('443/tcp (HTTPS)')
  },
  {
    id: 'lab8',
    title: 'แล็บ 8: สร้างบัญชีผู้ใช้ใหม่บนระบบ Server',
    category: 'users',
    xp: 80,
    goal: 'สร้างบัญชีผู้ใช้ชื่อ `student01` สำหรับเข้าใช้งานระบบด้วยคำสั่ง `useradd student01` (หรือ `adduser student01`)',
    hint: 'พิมพ์คำสั่ง: useradd student01',
    quickCmds: ['useradd student01', 'id student01', 'cat /etc/passwd'],
    check: (cmd, state) => state.users.includes('student01')
  }
];

/* ==================== PORT & SERVICE RUSH DATA ==================== */
const PORT_CARDS = [
  { port: '22', proto: 'SSH', layer: 'Secure Remote CLI', prompt: 'รีโมทเข้าจัดการ Linux Server แบบเข้ารหัสผ่าน Command Line', sub: 'Secure Shell Protocol' },
  { port: '80', proto: 'HTTP', layer: 'Web Service', prompt: 'ให้บริการหน้าเว็บไซต์แบบปกติ (ยังไม่เข้ารหัส SSL/TLS)', sub: 'Hypertext Transfer Protocol' },
  { port: '443', proto: 'HTTPS', layer: 'Secure Web', prompt: 'ให้บริการหน้าเว็บไซต์แบบเข้ารหัสปลอดภัย (มีรูปแม่กุญแจ)', sub: 'HTTP over TLS/SSL' },
  { port: '53', proto: 'DNS', layer: 'Name Resolution', prompt: 'แปลงชื่อโดเมน (เช่น google.com) ให้เป็นหมายเลข IP Address', sub: 'Domain Name System (UDP/TCP)' },
  { port: '67 / 68', proto: 'DHCP', layer: 'IP Assignment', prompt: 'แจกหมายเลข IP, Subnet Mask และ Gateway อัตโนมัติให้เครื่องลูกข่าย', sub: 'Dynamic Host Configuration Protocol' },
  { port: '21', proto: 'FTP', layer: 'File Transfer', prompt: 'รับ-ส่งและอัปโหลดไฟล์ระหว่าง Client กับ File Server (Control Port)', sub: 'File Transfer Protocol' },
  { port: '25', proto: 'SMTP', layer: 'Mail Sending', prompt: 'ส่งอีเมลออกจากเครื่องหรือส่งต่ออีเมลระหว่าง Mail Server', sub: 'Simple Mail Transfer Protocol' },
  { port: '3389', proto: 'RDP', layer: 'Windows Remote', prompt: 'รีโมทควบคุมหน้าจอแบบกราฟิก (GUI) ของเครื่อง Windows Server', sub: 'Remote Desktop Protocol' },
  { port: '445', proto: 'SMB / CIFS', layer: 'File Sharing', prompt: 'แชร์ไฟล์และแชร์เครื่องพิมพ์ในเครือข่ายท้องถิ่นของ Windows', sub: 'Server Message Block' },
  { port: '3306', proto: 'MySQL / MariaDB', layer: 'Database', prompt: 'เชื่อมต่อบริการฐานข้อมูลยอดนิยม MySQL หรือ MariaDB', sub: 'Relational Database Port' },
  { port: '23', proto: 'Telnet', layer: 'Legacy (Insecure)', prompt: 'รีโมทควบคุมผ่านข้อความแบบไม่เข้ารหัส (ไม่แนะนำให้ใช้งานจริง)', sub: 'Unencrypted Remote Terminal' },
  { port: '110', proto: 'POP3', layer: 'Mail Receiving', prompt: 'ดึงอีเมลจาก Mail Server ลงมาเก็บไว้บนเครื่องผู้รับ', sub: 'Post Office Protocol v3' },
  { port: '143', proto: 'IMAP', layer: 'Mail Sync', prompt: 'อ่านและซิงค์อีเมลบนเซิร์ฟเวอร์ให้ตรงกันทุกอุปกรณ์', sub: 'Internet Message Access Protocol' },
  { port: '123', proto: 'NTP', layer: 'Time Sync', prompt: 'ซิงโครไนซ์นาฬิกาและเวลาของเครื่อง Server ทุกเครื่องให้ตรงกัน', sub: 'Network Time Protocol' }
];

/* ==================== RAID SIMULATOR DATA ==================== */
const RAID_INFO = {
  '0': {
    name: 'RAID 0 (Striping)',
    minDisks: 2,
    usable: '100% (4 TB จาก 4 ลูก)',
    faultTolerance: '0 ลูก (เสีย 1 ลูก ข้อมูลหายทั้งหมด!)',
    speed: 'เร็วมากทั้งอ่านและเขียน',
    useCase: 'งานตัดต่อวิดีโอชั่วคราวหรือแคชที่ไม่ห่วงข้อมูลหาย (ไม่เหมาะเก็บข้อมูลสำคัญ)',
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
    faultTolerance: 'ทนดิสก์เสียได้ 1 ลูก (ข้อมูลยังครบ)',
    speed: 'อ่านเร็ว / เขียนปกติ',
    useCase: 'ดิสก์ติดตั้ง OS ของ Server หรือข้อมูลสำคัญที่ต้องการความเสถียรสูงแต่ใช้ดิสก์น้อย',
    disks: [
      { name: 'Disk 1 (Main)', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'A2', cls: 'block-data' }, { label: 'A3', cls: 'block-data' }] },
      { name: 'Disk 2 (Mirror)', blocks: [{ label: 'A1 Copy', cls: 'block-mirror' }, { label: 'A2 Copy', cls: 'block-mirror' }, { label: 'A3 Copy', cls: 'block-mirror' }] }
    ]
  },
  '5': {
    name: 'RAID 5 (Striping with Parity)',
    minDisks: 3,
    usable: '(N-1) ลูก → 3 TB จาก 4 ลูก (75%)',
    faultTolerance: 'ทนดิสก์เสียได้ 1 ลูก (กู้คืนจาก Parity)',
    speed: 'อ่านเร็วมาก / เขียนปานกลาง (ต้องคำนวณ Parity)',
    useCase: 'File Server และ Web Server ยอดนิยม สมดุลระหว่างความจุ ความเร็ว และความปลอดภัย',
    disks: [
      { name: 'Disk 1', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'B1', cls: 'block-data' }, { label: 'Parity C', cls: 'block-parity' }] },
      { name: 'Disk 2', blocks: [{ label: 'A2', cls: 'block-data' }, { label: 'Parity B', cls: 'block-parity' }, { label: 'C1', cls: 'block-data' }] },
      { name: 'Disk 3', blocks: [{ label: 'A3', cls: 'block-data' }, { label: 'B2', cls: 'block-data' }, { label: 'C2', cls: 'block-data' }] },
      { name: 'Disk 4', blocks: [{ label: 'Parity A', cls: 'block-parity' }, { label: 'B3', cls: 'block-data' }, { label: 'C3', cls: 'block-data' }] }
    ]
  },
  '10': {
    name: 'RAID 10 (RAID 1+0: Mirror + Stripe)',
    minDisks: 4,
    usable: '50% (2 TB จาก 4 ลูก)',
    faultTolerance: 'ทนดิสก์เสียได้ 1 ลูกต่อคู่ Mirror (สูงสุด 2 ลูกต่างคู่)',
    speed: 'เร็วสูงมากทั้งอ่านและเขียน',
    useCase: 'Database Server ที่มีธุรกรรมหนาแน่น (High IOPS) และต้องการความเสถียรระดับสูงสุด',
    disks: [
      { name: 'Disk 1 (M1)', blocks: [{ label: 'A1', cls: 'block-data' }, { label: 'A3', cls: 'block-data' }] },
      { name: 'Disk 2 (M1)', blocks: [{ label: 'A1 Copy', cls: 'block-mirror' }, { label: 'A3 Copy', cls: 'block-mirror' }] },
      { name: 'Disk 3 (M2)', blocks: [{ label: 'A2', cls: 'block-data' }, { label: 'A4', cls: 'block-data' }] },
      { name: 'Disk 4 (M2)', blocks: [{ label: 'A2 Copy', cls: 'block-mirror' }, { label: 'A4 Copy', cls: 'block-mirror' }] }
    ]
  }
};

/* ==================== CODEX CHAPTERS ==================== */
const CODEX_CHAPTERS = [
  {
    title: 'บทที่ 1: พื้นฐานระบบปฏิบัติการเครื่องแม่ข่าย',
    points: [
      '<strong>Server OS</strong> ออกแบบมาเพื่อให้บริการเครื่องลูกข่ายจำนวนมากอย่างต่อเนื่อง 24/7 เช่น Windows Server, Ubuntu Server, RHEL/Rocky Linux',
      '<strong>Client-Server</strong> รวมศูนย์การยืนยันตัวตน ข้อมูล และบริการ ต่างจาก Peer-to-Peer ที่จัดการแยกทีละเครื่อง',
      '<strong>ฮาร์ดแวร์ระดับ Server</strong> มักมี ECC RAM, Redundant PSU, Hot-Swap Drive และระบบ RAID เพื่อความเสถียรสูง',
      '<strong>Virtualization</strong> (เช่น VMware ESXi, Proxmox, Hyper-V) ช่วยรัน Server เสมือนหลายเครื่องบนเครื่องจริงเครื่องเดียว'
    ]
  },
  {
    title: 'บทที่ 2: บริการเครือข่ายและพอร์ตมาตรฐาน',
    points: [
      'เครื่อง Server ต้องใช้ <strong>Static IP</strong> เพื่อไม่ให้หมายเลข IP เปลี่ยนจน Client เชื่อมต่อไม่ได้',
      '<strong>DNS (53)</strong> แปลงชื่อโดเมนเป็น IP • <strong>DHCP (67/68)</strong> แจก IP อัตโนมัติให้เครื่องลูกข่าย',
      '<strong>HTTP (80) / HTTPS (443)</strong> บริการเว็บ • <strong>SSH (22)</strong> รีโมท Linux • <strong>RDP (3389)</strong> รีโมท Windows',
      '<strong>SMB (445)</strong> แชร์ไฟล์เครือข่าย Windows • <strong>FTP (21)</strong> โอนถ่ายไฟล์ • <strong>NTP (123)</strong> เทียบเวลา'
    ]
  },
  {
    title: 'บทที่ 3: การจัดการผู้ใช้ กลุ่ม และสิทธิ์เข้าถึง',
    points: [
      '<strong>Windows Server Active Directory (AD DS)</strong> จัดการ Domain, Users, Groups, OU และบังคับใช้นโยบายด้วย <strong>GPO</strong>',
      '<strong>Linux Permissions</strong> แบ่ง 3 กลุ่มคือ Owner (u), Group (g), Others (o) โดยมีค่า Read=4, Write=2, Execute=1',
      'ค่าสิทธิ์ยอดนิยม: <code>755</code> (สคริปต์/โฟลเดอร์), <code>644</code> (ไฟล์ตั้งค่าทั่วไป), <code>600</code> (ไฟล์ความลับ/SSH Key)',
      'ยึดหลัก <strong>Least Privilege</strong> ให้สิทธิ์เท่าที่จำเป็นต่อหน้าที่เพื่อลดความเสียหายหากบัญชีถูกแฮก'
    ]
  },
  {
    title: 'บทที่ 4: คำสั่งพื้นฐานสำหรับผู้ดูแลระบบ (CLI)',
    points: [
      'จัดการบริการ: <code>systemctl status / start / restart / enable &lt;service&gt;</code>',
      'ตรวจสอบระบบ: <code>df -h</code> (พื้นที่ดิสก์), <code>free -h</code> (แรม), <code>top/htop</code> (CPU/Process)',
      'ตรวจสอบเครือข่าย: <code>ip a</code>, <code>ping</code>, <code>ss -tulnp</code> (ดูพอร์ตที่เปิดฟังอยู่), <code>nslookup</code>',
      'จัดการไฟล์และผู้ใช้: <code>ls -la</code>, <code>chmod</code>, <code>chown</code>, <code>useradd</code>, <code>passwd</code>, <code>sudo</code>'
    ]
  },
  {
    title: 'บทที่ 5: ความปลอดภัย Firewall และการสำรองข้อมูล',
    points: [
      '<strong>Firewall (UFW / iptables / Windows Firewall)</strong> ตั้ง Default Deny ขาเข้า แล้วอนุญาตเฉพาะพอร์ตที่จำเป็น',
      '<strong>SSH Hardening</strong>: ปิด Root Login ตรง, ใช้ SSH Key แทนรหัสผ่าน, หมั่นอัปเดต Security Patch',
      '<strong>Backup 3-2-1</strong>: 3 ชุดข้อมูล • 2 ประเภทสื่อบันทึก • 1 ชุดอยู่นอกสถานที่/ออฟไลน์',
      '<strong>ชนิด Backup</strong>: Full (ครบทั้งหมด), Incremental (เฉพาะที่เปลี่ยนจากครั้งล่าสุด), Differential (ที่เปลี่ยนจาก Full ล่าสุด)'
    ]
  }
];

/* ==================== EXAM QUESTION BANK (15 QUESTIONS -> RANDOM 10) ==================== */
const EXAM_BANK = [
  {
    category: 'fundamentals',
    q: 'ข้อใดคือหน้าที่หลักของ ECC RAM ในเครื่องแม่ข่าย (Server)?',
    options: [
      'เพิ่มเฟรมเรตการแสดงผลกราฟิก 3 มิติ',
      'ตรวจจับและแก้ไขข้อผิดพลาดของข้อมูลในหน่วยความจำอัตโนมัติ ลดอาการระบบล่ม',
      'สำรองไฟฟ้าแทนเครื่อง UPS เมื่อไฟดับ',
      'แปลงสัญญาณอินเทอร์เน็ตจากสายไฟเบอร์เป็น Wi-Fi'
    ],
    answer: 1,
    explain: 'ECC (Error-Correcting Code) RAM สามารถตรวจจับและแก้ Single-bit Error ได้ ช่วยให้เครื่องแม่ข่ายทำงานต่อเนื่องได้อย่างเสถียร'
  },
  {
    category: 'fundamentals',
    q: 'หากต้องการใช้ฮาร์ดดิสก์ 4 ลูก ขนาดลูกละ 2 TB ทำ RAID 5 จะได้พื้นที่ใช้งานจริงประมาณเท่าใด และทนดิสก์เสียได้กี่ลูก?',
    options: [
      '8 TB / ทนเสียได้ 0 ลูก',
      '6 TB / ทนเสียได้ 1 ลูก',
      '4 TB / ทนเสียได้ 3 ลูก',
      '2 TB / ทนเสียได้ 2 ลูก'
    ],
    answer: 1,
    explain: 'RAID 5 มีพื้นที่ใช้งานเท่ากับ (N - 1) × ขนาดดิสก์ = (4 - 1) × 2 TB = 6 TB และทนดิสก์เสียได้ 1 ลูก'
  },
  {
    category: 'fundamentals',
    q: 'ข้อใดกล่าวถูกต้องเกี่ยวกับ Virtualization (เทคโนโลยีเครื่องเสมือน)?',
    options: [
      'ต้องซื้อเครื่องแม่ข่ายจริง 1 เครื่องต่อ 1 บริการเสมอ',
      'ใช้ Hypervisor แบ่งทรัพยากรเครื่องจริง 1 เครื่อง เพื่อรัน Server เสมือน (VM) หลายเครื่องพร้อมกันได้',
      'ใช้ได้เฉพาะบนระบบปฏิบัติการ Windows 98 เท่านั้น',
      'ทำให้ไม่จำเป็นต้องติดตั้งระบบปฏิบัติการใด ๆ เลย'
    ],
    answer: 1,
    explain: 'Hypervisor (เช่น Proxmox, ESXi, Hyper-V) ช่วยรัน VM หลายตัวบนฮาร์ดแวร์เดียว ทำให้ใช้ทรัพยากรคุ้มค่าและทำ Snapshot/Backup ได้ง่าย'
  },
  {
    category: 'network',
    q: 'เหตุใดเครื่องแม่ข่าย (Server) จึงควรกำหนดหมายเลข IP แบบ Static IP แทนที่จะรับแบบ DHCP อัตโนมัติ?',
    options: [
      'เพราะ Static IP ทำให้ความเร็วอินเทอร์เน็ตเพิ่มขึ้น 10 เท่า',
      'เพื่อให้หมายเลข IP คงที่ ไม่เปลี่ยนแปลง ทำให้เครื่องลูกข่ายและระบบ DNS ติดต่อได้ตลอดเวลา',
      'เพราะระบบปฏิบัติการ Server ไม่รองรับ DHCP',
      'เพื่อประหยัดพลังงานไฟฟ้าของเครื่องแม่ข่าย'
    ],
    answer: 1,
    explain: 'หาก Server เปลี่ยน IP ไปเรื่อย ๆ บริการเว็บ ฐานข้อมูล หรือ DNS จะไม่สามารถเชื่อมต่อได้จากเครื่องลูกข่าย'
  },
  {
    category: 'network',
    q: 'บริการใดทำหน้าที่แปลงชื่อโดเมน (Domain Name) ให้เป็นหมายเลข IP Address และใช้พอร์ตหมายเลขใด?',
    options: [
      'DHCP — พอร์ต 67/68',
      'DNS — พอร์ต 53',
      'SSH — พอร์ต 22',
      'SMTP — พอร์ต 25'
    ],
    answer: 1,
    explain: 'DNS (Domain Name System) ทำงานบนพอร์ต 53 ทำหน้าที่แปลงชื่อโดเมนเป็น IP Address'
  },
  {
    category: 'network',
    q: 'หากผู้ดูแลระบบต้องการรีโมทเข้าไปจัดการหน้าจอ GUI ของ Windows Server ต้องเปิดพอร์ตมาตรฐานใด?',
    options: [
      'พอร์ต 22 (SSH)',
      'พอร์ต 80 (HTTP)',
      'พอร์ต 3389 (RDP)',
      'พอร์ต 110 (POP3)'
    ],
    answer: 2,
    explain: 'RDP (Remote Desktop Protocol) ของ Windows ใช้พอร์ตมาตรฐาน 3389'
  },
  {
    category: 'users',
    q: 'บนระบบปฏิบัติการ Linux สิทธิ์ของไฟล์แสดงเป็น "-rw-r--r--" เทียบเท่ากับรหัสเลขฐานแปดใด?',
    options: [
      '755',
      '644',
      '600',
      '777'
    ],
    answer: 1,
    explain: 'rw- = 4+2 = 6, r-- = 4, r-- = 4 รวมกันเป็น 644 ซึ่งเป็นสิทธิ์มาตรฐานของไฟล์ทั่วไปบน Linux'
  },
  {
    category: 'users',
    q: 'บน Windows Server องค์ประกอบใดใน Active Directory ที่ใช้กำหนดนโยบายความปลอดภัยลงไปยังเครื่องลูกข่ายทั้งหมดในแผนกได้พร้อมกัน?',
    options: [
      'Group Policy Object (GPO)',
      'Recycle Bin',
      'Windows Paint',
      'Disk Cleanup'
    ],
    answer: 0,
    explain: 'Group Policy Object (GPO) ใช้กำหนดและบังคับใช้นโยบายกับผู้ใช้และเครื่องคอมพิวเตอร์ใน Domain/OU จากส่วนกลาง'
  },
  {
    category: 'users',
    q: 'หลักการ "Principle of Least Privilege" ในการดูแลระบบเครื่องแม่ข่ายหมายถึงข้อใด?',
    options: [
      'ให้ผู้ใช้ทุกคนมีสิทธิ์ Administrator เพื่อทำงานได้เร็วที่สุด',
      'ให้สิทธิ์ผู้ใช้และบริการต่าง ๆ เฉพาะเท่าที่จำเป็นต่อการปฏิบัติงานเท่านั้น',
      'ลบบัญชีผู้ใช้ทั้งหมดออกจากระบบทุกสัปดาห์',
      'ไม่ต้องตั้งรหัสผ่านให้บัญชีผู้ดูแลระบบ'
    ],
    answer: 1,
    explain: 'Principle of Least Privilege ช่วยจำกัดขอบเขตความเสียหายหากบัญชีใดบัญชีหนึ่งถูกโจมตีหรือใช้งานผิดพลาด'
  },
  {
    category: 'cli',
    q: 'คำสั่งใดบน Linux Server ใช้สำหรับรีสตาร์ทบริการเว็บเซิร์ฟเวอร์ Apache (apache2)?',
    options: [
      'systemctl restart apache2',
      'chmod restart apache2',
      'df -h apache2',
      'ping apache2'
    ],
    answer: 0,
    explain: 'คำสั่ง systemctl restart <service> ใช้หยุดและเริ่มบริการใหม่ทันที (มักใช้หลังแก้ไขไฟล์คอนฟิก)'
  },
  {
    category: 'cli',
    q: 'คำสั่งใดใช้ตรวจสอบพอร์ตเครือข่ายที่เครื่อง Linux Server กำลังเปิดรอรับการเชื่อมต่อ (Listening Ports)?',
    options: [
      'ss -tulnp (หรือ netstat -tulnp)',
      'mkdir -p',
      'touch port.txt',
      'pwd'
    ],
    answer: 0,
    explain: 'ss -tulnp แสดงพอร์ต TCP/UDP ที่กำลังเปิด Listening พร้อมชื่อ Process ที่ใช้งานพอร์ตนั้น'
  },
  {
    category: 'cli',
    q: 'หากต้องการรันคำสั่งที่มีสิทธิ์ผู้ดูแลระบบ (Root) ชั่วคราวจากบัญชีผู้ใช้ทั่วไปบน Ubuntu Server ควรพิมพ์คำสั่งใดนำหน้า?',
    options: [
      'sudo',
      'cd',
      'echo',
      'cat'
    ],
    answer: 0,
    explain: 'sudo (Superuser Do) ใช้ยกระดับสิทธิ์ชั่วคราวเพื่อรันคำสั่งระดับผู้ดูแลระบบอย่างปลอดภัยและมีการบันทึก Log'
  },
  {
    category: 'security',
    q: 'เหตุใดผู้ดูแลระบบจึงควรใช้ SSH (พอร์ต 22) แทน Telnet (พอร์ต 23) ในการรีโมทจัดการเครื่องแม่ข่าย?',
    options: [
      'เพราะ Telnet มีขนาดไฟล์ใหญ่กว่า',
      'เพราะ SSH เข้ารหัสข้อมูลและรหัสผ่านทั้งหมดระหว่างการรับส่ง ส่วน Telnet ส่งเป็นข้อความธรรมดา (Plaintext)',
      'เพราะ SSH ไม่ต้องใช้อินเทอร์เน็ตหรือเครือข่าย',
      'เพราะ Telnet ใช้ได้เฉพาะกับเครื่องพิมพ์'
    ],
    answer: 1,
    explain: 'Telnet ส่งข้อมูลและรหัสผ่านแบบไม่เข้ารหัส ทำให้ถูกดักจับ (Sniffing) ได้ง่าย จึงต้องใช้ SSH ที่เข้ารหัสแทนเสมอ'
  },
  {
    category: 'security',
    q: 'ตามกฎ 3-2-1 Backup Rule เลข "1" หมายถึงข้อใด?',
    options: [
      'ต้องสำรองข้อมูลเพียง 1 ครั้งต่อปี',
      'ต้องมีสำเนาข้อมูลอย่างน้อย 1 ชุดเก็บรักษานอกสถานที่ (Off-site) หรือแยกขาดจากเครือข่ายหลัก',
      'ต้องใช้ฮาร์ดดิสก์เพียง 1 ลูกในการเก็บทั้งต้นฉบับและสำรอง',
      'ต้องมีผู้ดูแลระบบเพียง 1 คนเท่านั้นที่รู้รหัสผ่าน'
    ],
    answer: 1,
    explain: 'เลข 1 ในกฎ 3-2-1 คือการเก็บสำเนาอย่างน้อย 1 ชุดไว้ Off-site (เช่น Cloud หรือสาขาอื่น) เพื่อป้องกันภัยพิบัติหรือ Ransomware ในสถานที่หลัก'
  },
  {
    category: 'security',
    q: 'ข้อใดคือความแตกต่างสำคัญระหว่าง Incremental Backup กับ Differential Backup?',
    options: [
      'Incremental เก็บเฉพาะที่เปลี่ยนจาก Backup ครั้งล่าสุดทุกชนิด ส่วน Differential เก็บทุกอย่างที่เปลี่ยนจาก Full Backup ล่าสุด',
      'Incremental ใช้พื้นที่มากกว่า Full Backup เสมอ',
      'Differential ไม่ต้องมี Full Backup ตั้งต้นเลย',
      'ทั้งสองแบบเหมือนกันทุกประการ ต่างกันแค่ชื่อเรียก'
    ],
    answer: 0,
    explain: 'Incremental แบ็กอัปเร็วและใช้พื้นที่น้อยที่สุด แต่ตอนกู้คืนต้องใช้หลายชุด ส่วน Differential ใช้พื้นที่เพิ่มขึ้นเรื่อย ๆ แต่กู้คืนง่ายกว่า (ใช้แค่ Full + Differential ล่าสุด)'
  }
];
