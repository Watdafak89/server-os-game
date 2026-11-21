# ServerOps: Data Center Defender (Edition 2.0)

เกมสื่อการสอนแนว **RPG & Simulation** เต็มรูปแบบสำหรับรายวิชา **ระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้น (Introduction to Server Operating Systems)** ทำงานได้ทันทีบนเว็บเบราว์เซอร์ 100% ออฟไลน์โดยไม่ต้องติดตั้งโปรแกรมเสริม

## วิธีเปิดเล่นเกม
1. เปิดผ่าน **GitHub Pages** ที่ `https://watdafak89.github.io/server-os-game/` (หลังเปิดใช้งานใน Settings → Pages)
2. หรือดับเบิลคลิกเปิดไฟล์ `index.html` ในเบราว์เซอร์ได้ทันที
3. สำหรับการสอนหน้าชั้นเรียนผ่านโปรเจคเตอร์ สามารถกดสลับ **โหมดมืด/โหมดสว่าง (☀️/🌙)** และเปิด **🔓 โหมดอิสระ (Free Play)** เพื่อข้ามไปยังด่านใดก็ได้ทันที

## ระบบล็อกอิน บทบาทผู้ใช้ และห้องเรียน (Edition 2.1)
- **🔑 สมัครสมาชิก & เข้าสู่ระบบ**: แยกบัญชีและเซฟเกมรายบุคคล เข้ารหัสรหัสผ่านด้วย SHA-256 (พร้อมระบบ Fallback ใช้งานได้ทั้งบน GitHub Pages และเปิดไฟล์ `index.html` แบบออฟไลน์)
- **บัญชีทดลองเริ่มต้น (Demo Accounts)**:
  - 🎓 นักศึกษา: Username `student01` / Password `123456`
  - 👨‍🏫 ครูผู้สอน: Username `teacher` / Password `123456`
  - *รหัสยืนยันสำหรับสมัครบัญชีครูผู้สอนใหม่:* `TEACHER2026` (เปลี่ยนได้ในไฟล์ `auth.js`)
- **🏆 Leaderboard (ตารางอันดับคะแนน)**: แสดงโพเดียม Top 3 และตารางอันดับเรียงตาม XP, ดาวแคมเปญ, Packet Defense หรือคะแนนสอบ พร้อมปุ่มคัดลอก **รหัสส่งคะแนน (`SOPS2:...`)**
- **👨‍🏫 Teacher Dashboard (เฉพาะบัญชีครูผู้สอน)**:
  - สรุป KPI ทั้งห้อง, ค้นหานักศึกษา และกรองตามห้องเรียน
  - **📥 ส่งออก Excel (CSV UTF-8 BOM)** ภาษาไทยสมบูรณ์ เปิดใน Microsoft Excel ได้ทันที
  - **📥 นำเข้ารหัสคะแนนนักศึกษา** วางรหัส `SOPS2:...` ที่นักศึกษาส่งมาหลายบรรทัดพร้อมกันเพื่อรวมเข้าตาราง
  - **☁️ ตัวเลือกเสริม Cloud Sync (Firebase RTDB URL)** สำหรับซิงค์บัญชีและ Leaderboard ข้ามอุปกรณ์อัตโนมัติทั้งห้อง

## โครงสร้างเกมและเนื้อหาที่ครอบคลุม (Edition 2.0+)
- **หน้าเริ่มเกม & สร้างตัวละคร SysAdmin**: เลือก Avatar 6 แบบ ตั้งชื่อตัวละคร พร้อมระบบเซฟอัตโนมัติ (Level, XP, ดาวสะสม 54 ดวง, เหรียญ 💰, คลังไอเทม และ 12 เหรียญตรา)
- **🗺️ Campaign World Map (6 โซน • 18 ด่าน • 6 บอสใหญ่ • 42 สถานการณ์ต่อสู้)**
  - **Zone 1: Hardware & Server Core** — Client-Server vs P2P, Server OS, ECC RAM, Redundant PSU, Type-1 Hypervisor, RAID 0/1/5/6/10, Linux File Systems (`ext4`/`XFS`/`ZFS`)
  - **Zone 2: Network & Protocol Hub** — Static IP, Subnet `/24`, DHCP DORA Process, DNS Records (`A`/`AAAA`/`CNAME`/`MX`), 18 พอร์ตมาตรฐาน (`NTP 123`, `SNMP 161`, `Syslog 514`, `RDP 3389`, `MySQL 3306` ฯลฯ)
  - **Zone 3: Identity & Access Vault** — Windows Active Directory (`AD DS`, `OU`, `GPO`, `LDAP 389`, `Kerberos 88`), Share vs NTFS Effective Permissions, Linux `/etc/shadow`, `usermod -aG sudo`, `chmod`, `chown`
  - **Zone 4: Linux & Windows Command Deck** — `systemctl`, `top`/`free -h`, `journalctl`, `/var/log`, `du -sh`, `apt update && upgrade` และ **Windows Server PowerShell** (`gpupdate /force`, `Test-NetConnection`, `Restart-Service`)
  - **Zone 5: Cyber Defense & Backup Bunker** — DMZ, Firewall UFW, SSH Hardening & Fail2ban, SSL/TLS HTTPS, กฎสำรองข้อมูล 3-2-1-1-0, Incremental vs Differential, RTO/RPO และเหตุผลที่ RAID ไม่ใช่ Backup
  - **Zone 6: Final Boss — Data Center Blackout Crisis!** — Load Balancer (HA), Docker Container vs VM, `ss -tulnp`, CIA Triad และศึกชี้ชะตา 4 เฟสกับ **Blackout Overlord**
- **💻 CLI Hacker Arena (14 ภารกิจ Dual-OS Terminal)**
  - **Linux Ubuntu Bash (10 ภารกิจ):** `whoami`, `ip a`, `systemctl`, `ss -tulnp`, `df -h`, `chmod 600/755`, `ufw allow`, `useradd`, `journalctl`
  - **Windows Server PowerShell (4 ภารกิจ):** `ipconfig /all`, `Restart-Service DNS`, `gpupdate /force`, `Test-NetConnection -Port 443`
- **🛡️ Packet Defense Arcade (18 พอร์ตมาตรฐาน)**
  - โหมดป้องกันเวฟ (Wave Defense) พร้อมหลอดจับเวลา, Boss Packet คะแนน x2, Combo และโหมดฝึกซ้อม
- **🧩 Puzzle Vault (2 มินิเกมปฏิบัติการ)**
  - **CHMOD Vault Cracker (8 ด่าน):** ตั้งสวิตช์สิทธิ์ `rwx` ปลดล็อกตู้เซฟ Server
  - **RAID Architect Lab (6 โจทย์):** ออกแบบ RAID 0/1/5/6/10 พร้อมปุ่มจำลองดิสก์พังจริง (Simulate Disk Failure)
- **🛒 SysAdmin Toolkit Shop:** ใช้เหรียญ 💰 ซื้อไอเทมช่วยสู้บอส (`UPS Shield`, `AI Scan 50/50`, `Hot-Swap Repair`, `Overclock XP Boost x2`)
- **📖 คัมภีร์ความรู้ 8 บทเรียน + วิเคราะห์จุดแข็ง 8 หมวด + 12 เหรียญตรา**
- **🎓 Guild Certification Exam:** สุ่มข้อสอบ 15 ข้อจากคลัง 30 ข้อ สอบผ่าน 70% รับเกียรติบัตรพิมพ์เป็น PDF ได้ทันที
