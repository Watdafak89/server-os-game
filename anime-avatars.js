/* ServerOps: 40 High-Detail Painted Japanese Anime Cyber-SysAdmin Avatars (avatar7..avatar46)
 * Matches the studio-painted Japanese anime style of the first 6 avatars (total = 46 avatars).
 */
(() => {
  const EXTRA_ANIME_AVATARS = [
    { id: 'avatar7',  name: 'Akira',   role: 'Crimson Kernel' },
    { id: 'avatar8',  name: 'Yuki',    role: 'Sakura Cloud' },
    { id: 'avatar9',  name: 'Haruto',  role: 'Emerald Kitsune' },
    { id: 'avatar10', name: 'Mio',     role: 'Rose Android' },
    { id: 'avatar11', name: 'Ryuji',   role: 'Inferno Visor' },
    { id: 'avatar12', name: 'Aoi',     role: 'Cyan Paladin' },
    { id: 'avatar13', name: 'Daiki',   role: 'Solar Architect' },
    { id: 'avatar14', name: 'Sakura',  role: 'Pink DevOps' },
    { id: 'avatar15', name: 'Kaito',   role: 'Violet Phantom' },
    { id: 'avatar16', name: 'Rin',     role: 'Amber AI Core' },
    { id: 'avatar17', name: 'Takumi',  role: 'Cobalt Tactician' },
    { id: 'avatar18', name: 'Yuna',    role: 'Amethyst K8s' },
    { id: 'avatar19', name: 'Shinji',  role: 'Royal Fox Ops' },
    { id: 'avatar20', name: 'Mei',     role: 'Jade SQL Mage' },
    { id: 'avatar21', name: 'Hayato',  role: 'Red-Team Hunter' },
    { id: 'avatar22', name: 'Natsuki', role: 'Gold Cyber-Pilot' },
    { id: 'avatar23', name: 'Hiro',    role: 'Azure AD Lord' },
    { id: 'avatar24', name: 'Kanade',  role: 'Magenta Knight' },
    { id: 'avatar25', name: 'Touma',   role: 'Matrix Basher' },
    { id: 'avatar26', name: 'Ayaka',   role: 'Frost Zero-Trust' },
    { id: 'avatar27', name: 'Kazuki',  role: 'Ice Kitsune' },
    { id: 'avatar28', name: 'Hikari',  role: 'Emerald Angel' },
    { id: 'avatar29', name: 'Itsuki',  role: 'Shadow SSH' },
    { id: 'avatar30', name: 'Chihiro', role: 'Crimson Valkyrie' },
    { id: 'avatar31', name: 'Riku',    role: 'Teal Commander' },
    { id: 'avatar32', name: 'Nanami',  role: 'Violet Subnet' },
    { id: 'avatar33', name: 'Sho',     role: 'Blaze Kitsune' },
    { id: 'avatar34', name: 'Kotone',  role: 'Astral Core' },
    { id: 'avatar35', name: 'Yuto',    role: 'Gold Net-Runner' },
    { id: 'avatar36', name: 'Mizuki',  role: 'Emerald Warden' },
    { id: 'avatar37', name: 'Masato',  role: 'Violet Mentor' },
    { id: 'avatar38', name: 'Honoka',  role: 'Amber Backup' },
    { id: 'avatar39', name: 'Sota',    role: 'Jade Sentinel' },
    { id: 'avatar40', name: 'Reina',   role: 'Mint SELinux' },
    { id: 'avatar41', name: 'Tsubasa', role: 'Neon Fox Pilot' },
    { id: 'avatar42', name: 'Koharu',  role: 'Ruby AI Guard' },
    { id: 'avatar43', name: 'Naoki',   role: 'Crimson SOC' },
    { id: 'avatar44', name: 'Ayumi',   role: 'Cyber-Pink Ops' },
    { id: 'avatar45', name: 'Keita',   role: 'Scarlet Paladin' },
    { id: 'avatar46', name: 'Shiori',  role: 'Apex Sovereign' }
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
