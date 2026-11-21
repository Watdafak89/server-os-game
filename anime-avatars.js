/* ServerOps: 24 Additional Studio-Painted Japanese Anime Avatars (avatar7..avatar30, Total = 30 Avatars) */
(() => {
  const EXTRA_ANIME_AVATARS = [
    { id: 'avatar7',  name: 'Zero',    role: 'Mecha-Fox Ops' },
    { id: 'avatar8',  name: 'Akira',   role: 'Crimson Headset' },
    { id: 'avatar9',  name: 'Naoki',   role: 'Red-Team SOC' },
    { id: 'avatar10', name: 'Ryuji',   role: 'Crimson Kernel' },
    { id: 'avatar11', name: 'Sakura',  role: 'Pink DevOps' },
    { id: 'avatar12', name: 'Haruto',  role: 'Emerald Mecha' },
    { id: 'avatar13', name: 'Yuna',    role: 'Amethyst K8s' },
    { id: 'avatar14', name: 'Mio',     role: 'Rose Android' },
    { id: 'avatar15', name: 'Takumi',  role: 'Cobalt Architect' },
    { id: 'avatar16', name: 'Shinji',  role: 'Royal Fox Ops' },
    { id: 'avatar17', name: 'Ayaka',   role: 'Frost Zero-Trust' },
    { id: 'avatar18', name: 'Touma',   role: 'Matrix Basher' },
    { id: 'avatar19', name: 'Chihiro', role: 'Crimson Valkyrie' },
    { id: 'avatar20', name: 'Hikari',  role: 'Apex Gold AI' },
    { id: 'avatar21', name: 'Kaito',   role: 'Violet Phantom' },
    { id: 'avatar22', name: 'Nanami',  role: 'Violet Subnet' },
    { id: 'avatar23', name: 'Tsubasa', role: 'Neon Fox Pilot' },
    { id: 'avatar24', name: 'Riku',    role: 'Teal Commander' },
    { id: 'avatar25', name: 'Reina',   role: 'Mint SELinux' },
    { id: 'avatar26', name: 'Mei',     role: 'Jade Core AI' },
    { id: 'avatar27', name: 'Sho',     role: 'Blaze Kitsune' },
    { id: 'avatar28', name: 'Honoka',  role: 'Amber Backup' },
    { id: 'avatar29', name: 'Daiki',   role: 'Solar Runner' },
    { id: 'avatar30', name: 'Shiori',  role: 'Scarlet Paladin' }
  ];

  EXTRA_ANIME_AVATARS.forEach((av) => {
    AVATARS.push({
      id: av.id,
      name: av.name,
      role: av.role,
      src: `assets/avatars/${av.id}.jpg`
    });
  });
})();
