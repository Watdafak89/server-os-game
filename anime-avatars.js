/* ServerOps: 40 Additional Modern Japanese Anime Cyber-SysAdmin Avatars (avatar7..avatar46)
 * Automatically appends 40 distinct cel-shaded Japanese anime portraits into AVATARS (total = 46 avatars).
 */
(() => {
  const SKINS = [
    { base: '#ffe2cc', shadow: '#f2bfa0', blush: '#ff96a8' },
    { base: '#ffd9be', shadow: '#ebb08d', blush: '#fb8c9f' },
    { base: '#f7cca8', shadow: '#dfa47a', blush: '#f48698' },
    { base: '#ffe9d9', shadow: '#f0c8b0', blush: '#ff9db2' }
  ];

  const EXTRA_AVATAR_SPECS = [
    // [idNum, name, role, bg1, bg2, accent, hairMain, hairHi, eyeCol, jacketCol, hairStyle, accType, skinIdx, smileType]
    [7,  'Akira',   'Kernel Knight',   '#0c4a6e', '#071326', '#38bdf8', '#1e293b', '#60a5fa', '#38bdf8', '#0f172a', 0, 0, 0, 0],
    [8,  'Yuki',    'Cloud Mage',      '#1e3a8a', '#0c102e', '#93c5fd', '#e0f2fe', '#ffffff', '#60a5fa', '#1e3a8a', 1, 2, 3, 1],
    [9,  'Haruto',  'Linux Samurai',   '#064e3b', '#051a14', '#34d399', '#0f172a', '#34d399', '#10b981', '#064e3b', 7, 5, 1, 2],
    [10, 'Mio',     'Docker Idol',     '#831843', '#1c0716', '#f472b6', '#f472b6', '#fbcfe8', '#ec4899', '#1e1b4b', 2, 1, 0, 1],
    [11, 'Ryuji',   'RAID Breaker',    '#7f1d1d', '#170609', '#f87171', '#b91c1c', '#fca5a5', '#fbbf24', '#18181b', 0, 3, 2, 2],
    [12, 'Aoi',     'Net Sniper',      '#0e7490', '#061d29', '#22d3ee', '#0284c7', '#7dd3fc', '#22d3ee', '#0f172a', 3, 0, 3, 0],
    [13, 'Daiki',   'Firewall Tank',   '#78350f', '#1c0f06', '#fbbf24', '#78350f', '#fcd34d', '#f59e0b', '#27272a', 5, 4, 2, 0],
    [14, 'Sakura',  'PKI Shrine',      '#9d174d', '#1f0816', '#fda4af', '#f9a8d4', '#fff1f2', '#f43f5e', '#3b0764', 1, 6, 3, 1],
    [15, 'Kaito',   'SSH Phantom',     '#312e81', '#0a0821', '#818cf8', '#312e81', '#a5b4fc', '#a78bfa', '#090d1a', 5, 7, 1, 2],
    [16, 'Rin',     'Cron Alchemist',  '#7c2d12', '#1a0a05', '#fb923c', '#ea580c', '#fed7aa', '#34d399', '#1c1917', 4, 3, 0, 1],
    [17, 'Takumi',  'BGP Tactician',   '#1d4ed8', '#091230', '#60a5fa', '#334155', '#94a3b8', '#38bdf8', '#1e293b', 9, 0, 1, 0],
    [18, 'Yuna',    'K8s Captain',     '#0369a1', '#061629', '#38bdf8', '#c084fc', '#f3e8ff', '#38bdf8', '#0c4a6e', 2, 4, 3, 1],
    [19, 'Shinji',  'Hypervisor Ace',  '#4c1d95', '#100724', '#c084fc', '#1e1b4b', '#818cf8', '#e879f9', '#18181b', 0, 7, 0, 0],
    [20, 'Mei',     'SQL Oracle',      '#065f46', '#051a14', '#2dd4bf', '#064e3b', '#5eead4', '#fbbf24', '#134e4a', 8, 6, 0, 1],
    [21, 'Hayato',  'SOC Hunter',      '#991b1b', '#14050a', '#fb7185', '#18181b', '#f87171', '#ef4444', '#0f172a', 7, 3, 2, 2],
    [22, 'Natsuki', 'DevOps Pilot',    '#a16207', '#1a1104', '#fde047', '#f59e0b', '#fef08a', '#0ea5e9', '#1e293b', 4, 1, 0, 1],
    [23, 'Hiro',    'AD Paladin',      '#1e40af', '#09122e', '#93c5fd', '#475569', '#e2e8f0', '#60a5fa', '#1e3a8a', 9, 5, 1, 0],
    [24, 'Kanade',  'TLS Virtuoso',    '#581c87', '#140624', '#d8b4fe', '#e9d5ff', '#ffffff', '#c084fc', '#2e1065', 1, 4, 3, 1],
    [25, 'Touma',   'Bash Striker',    '#15803d', '#061a0e', '#4ade80', '#14532d', '#86efac', '#4ade80', '#0f172a', 0, 4, 2, 2],
    [26, 'Ayaka',   'Zero-Trust Maid', '#0f766e', '#051c1c', '#5eead4', '#e2e8f0', '#ffffff', '#2dd4bf', '#0f172a', 3, 2, 3, 1],
    [27, 'Kazuki',  'DNS Ranger',      '#0284c7', '#061a2e', '#7dd3fc', '#0369a1', '#bae6fd', '#fde047', '#0f172a', 5, 0, 1, 0],
    [28, 'Hikari',  'Fiber Angel',     '#b45309', '#1c0f04', '#fcd34d', '#fde047', '#ffffff', '#38bdf8', '#1e1b4b', 1, 6, 3, 1],
    [29, 'Itsuki',  'Packet Ninja',    '#334155', '#090d1a', '#38bdf8', '#0f172a', '#64748b', '#f43f5e', '#111827', 7, 5, 1, 2],
    [30, 'Chihiro', 'Redis Sprinter',  '#be123c', '#1c050d', '#fda4af', '#9f1239', '#fda4af', '#fde047', '#18181b', 2, 1, 0, 1],
    [31, 'Riku',    'VLAN Commander',  '#0e7490', '#061e2b', '#67e8f9', '#1e3a8a', '#38bdf8', '#22d3ee', '#1e293b', 9, 3, 2, 0],
    [32, 'Nanami',  'Subnet Genius',   '#4338ca', '#0e0c2b', '#a5b4fc', '#6366f1', '#c7d2fe', '#f472b6', '#1e1b4b', 3, 7, 3, 1],
    [33, 'Sho',     'LVM Forger',      '#9a3412', '#1c0904', '#fdba74', '#431407', '#fb923c', '#fb923c', '#27272a', 5, 4, 2, 2],
    [34, 'Kotone',  'Grafana Muse',    '#c2410c', '#1c0a04', '#fb923c', '#f97316', '#ffedd5', '#38bdf8', '#0f172a', 8, 2, 0, 1],
    [35, 'Yuto',    'IPv6 Voyager',    '#1d4ed8', '#081230', '#38bdf8', '#38bdf8', '#e0f2fe', '#818cf8', '#0f172a', 0, 0, 0, 0],
    [36, 'Mizuki',  'Nginx Priestess', '#047857', '#041c15', '#6ee7b7', '#065f46', '#6ee7b7', '#34d399', '#0f172a', 1, 6, 3, 1],
    [37, 'Masato',  'PowerShell Lord', '#1e3a8a', '#061233', '#60a5fa', '#1e293b', '#93c5fd', '#fde047', '#0284c7', 9, 7, 1, 0],
    [38, 'Honoka',  'Backup Guardian', '#86198f', '#1c0620', '#f0abfc', '#d946ef', '#fae8ff', '#fbbf24', '#1e1b4b', 4, 1, 3, 1],
    [39, 'Sota',    'WAF Sentinel',    '#9f1239', '#1c050d', '#fb7185', '#18181b', '#fb7185', '#38bdf8', '#1e293b', 5, 0, 1, 2],
    [40, 'Reina',   'SELinux Valkyrie','#0f766e', '#051a19', '#34d399', '#e2e8f0', '#99f6e4', '#f43f5e', '#111827', 4, 3, 3, 0],
    [41, 'Tsubasa', 'GitOps Aviator',  '#6d28d9', '#120829', '#c4b5fd', '#7c3aed', '#ddd6fe', '#38bdf8', '#0f172a', 0, 4, 0, 1],
    [42, 'Koharu',  'ISO Auditor',     '#a16207', '#1a1104', '#fde047', '#713f12', '#fde047', '#34d399', '#1e293b', 3, 7, 0, 1],
    [43, 'Naoki',   'Tier-4 Engineer', '#065f46', '#041a13', '#34d399', '#0f172a', '#4ade80', '#38bdf8', '#1f2937', 9, 4, 2, 0],
    [44, 'Ayumi',   'AI-Ops Prodigy',  '#7e22ce', '#150626', '#e879f9', '#ec4899', '#fbcfe8', '#22d3ee', '#0f172a', 2, 2, 3, 1],
    [45, 'Keita',   'Chaos Breaker',   '#b91c1c', '#180509', '#fbbf24', '#dc2626', '#fde047', '#fde047', '#0f172a', 7, 5, 1, 2],
    [46, 'Shiori',  'Apex Sovereign',  '#92400e', '#0c0519', '#fbbf24', '#f8fafc', '#fde047', '#38bdf8', '#1e1b4b', 1, 6, 3, 1]
  ];

  function renderBackHair(style, col, hi) {
    if (style === 1) {
      // Long flowing straight anime hair
      return `<path d="M22 66 Q18 118 24 154 H136 Q142 118 138 66 Q132 18 80 16 Q28 18 22 66 Z" fill="${col}" stroke="#090d1c" stroke-width="2.6"/>`;
    }
    if (style === 2) {
      // Twin-tails
      return `<g fill="${col}" stroke="#090d1c" stroke-width="2.6">
        <path d="M28 58 Q4 82 10 144 Q26 142 36 112 Z"/>
        <path d="M132 58 Q156 82 150 144 Q134 142 124 112 Z"/>
        <ellipse cx="80" cy="60" rx="48" ry="44"/>
      </g>`;
    }
    if (style === 3) {
      // Sleek bob cut
      return `<path d="M26 68 Q22 104 36 122 H124 Q138 104 134 68 Q130 18 80 16 Q30 18 26 68 Z" fill="${col}" stroke="#090d1c" stroke-width="2.6"/>`;
    }
    if (style === 4) {
      // High ponytail
      return `<g fill="${col}" stroke="#090d1c" stroke-width="2.6">
        <path d="M108 32 Q152 38 148 110 Q130 100 116 66 Z"/>
        <ellipse cx="80" cy="58" rx="46" ry="42"/>
      </g>`;
    }
    if (style === 8) {
      // Twin cyber-buns
      return `<g fill="${col}" stroke="#090d1c" stroke-width="2.6">
        <circle cx="30" cy="34" r="18"/>
        <circle cx="130" cy="34" r="18"/>
        <ellipse cx="80" cy="60" rx="46" ry="42"/>
      </g>`;
    }
    if (style === 7) {
      // Samurai topknot / spiky wolf-cut
      return `<g fill="${col}" stroke="#090d1c" stroke-width="2.6">
        <path d="M68 20 Q80 2 96 14 Q92 28 74 28 Z"/>
        <path d="M24 72 L16 98 L34 94 L30 118 H130 L126 94 L144 98 L136 72 Q132 18 80 16 Q28 18 24 72 Z"/>
      </g>`;
    }
    // Spiky / wolf / short anime hair
    return `<path d="M26 68 Q24 22 80 18 Q136 22 134 68 L128 104 H32 Z" fill="${col}" stroke="#090d1c" stroke-width="2.6"/>`;
  }

  function renderFrontBangs(style, col, hi, acc) {
    let bangs = '';
    if (style === 0 || style === 5) {
      // Sharp shonen spiky bangs
      bangs = `<path d="M28 66 Q30 18 80 16 Q130 18 132 66 L124 84 L116 52 L106 72 L96 48 L82 74 L70 46 L56 72 L46 50 L36 82 Z" fill="${col}" stroke="#090d1c" stroke-width="2.4" stroke-linejoin="round"/>`;
    } else if (style === 1 || style === 2 || style === 8) {
      // Soft parted hime/idol bangs
      bangs = `<path d="M28 68 Q30 18 80 16 Q130 18 132 68 L124 98 Q116 80 116 54 L104 68 L94 46 L82 68 L74 44 L60 68 L48 52 Q44 82 36 98 Z" fill="${col}" stroke="#090d1c" stroke-width="2.4" stroke-linejoin="round"/>`;
    } else if (style === 3 || style === 4) {
      // Asymmetric swept stylish bangs
      bangs = `<path d="M28 66 Q32 18 80 16 Q130 18 132 66 L124 88 Q116 66 112 50 L92 70 L78 46 L52 74 L42 54 L34 86 Z" fill="${col}" stroke="#090d1c" stroke-width="2.4" stroke-linejoin="round"/>`;
    } else {
      // Sleek tactical parted bangs
      bangs = `<path d="M30 64 Q32 18 80 16 Q128 18 130 64 L120 76 L110 46 L94 64 L80 42 L64 68 L50 48 L38 76 Z" fill="${col}" stroke="#090d1c" stroke-width="2.4" stroke-linejoin="round"/>`;
    }
    // Glossy anime hair halo highlight
    const sheen = `<path d="M48 38 Q64 30 78 36 M88 36 Q102 30 114 39" fill="none" stroke="${hi}" stroke-width="3.4" stroke-linecap="round" opacity="0.72"/>`;
    // Hair ribbon / cyber clip accent
    const clip = (style === 2 || style === 4 || style === 8)
      ? `<rect x="106" y="42" width="14" height="5" rx="2.5" fill="${acc}" stroke="#090d1c" stroke-width="1.4" transform="rotate(24 113 44)"/>`
      : '';
    return bangs + sheen + clip;
  }

  function renderAccessory(accType, acc) {
    if (accType === 0) {
      // Glowing AR Cyber Visor Glasses
      return `<g>
        <path d="M40 73 H72 L77 81 L72 87 H44 Z" fill="${acc}" fill-opacity="0.28" stroke="${acc}" stroke-width="2.2"/>
        <path d="M120 73 H88 L83 81 L88 87 H116 Z" fill="${acc}" fill-opacity="0.28" stroke="${acc}" stroke-width="2.2"/>
        <line x1="72" y1="77" x2="88" y2="77" stroke="${acc}" stroke-width="2.2"/>
      </g>`;
    }
    if (accType === 1) {
      // Neon Cat-Ear Cyber Headphones
      return `<g stroke="#090d1c" stroke-width="2.2" stroke-linejoin="round">
        <path d="M26 78 Q26 16 80 16 Q134 16 134 78" fill="none" stroke="#1e293b" stroke-width="6"/>
        <polygon points="36,34 26,6 56,22" fill="#1e293b"/>
        <polygon points="39,28 33,13 50,22" fill="${acc}" stroke="none"/>
        <polygon points="124,34 134,6 104,22" fill="#1e293b"/>
        <polygon points="121,28 127,13 110,22" fill="${acc}" stroke="none"/>
        <rect x="18" y="68" width="14" height="28" rx="6" fill="#0f172a"/>
        <rect x="21" y="74" width="6" height="16" rx="3" fill="${acc}" stroke="none"/>
        <rect x="128" y="68" width="14" height="28" rx="6" fill="#0f172a"/>
        <rect x="133" y="74" width="6" height="16" rx="3" fill="${acc}" stroke="none"/>
      </g>`;
    }
    if (accType === 2) {
      // Floating Hologram Cyber-Halo + Hairpins
      return `<g>
        <ellipse cx="80" cy="14" rx="28" ry="6" fill="none" stroke="${acc}" stroke-width="2.8"/>
        <rect x="40" y="45" width="14" height="4.5" rx="2" fill="${acc}" transform="rotate(-18 47 47)"/>
        <rect x="106" y="45" width="14" height="4.5" rx="2" fill="${acc}" transform="rotate(18 113 47)"/>
      </g>`;
    }
    if (accType === 3) {
      // Holographic Tactical Monocle Scanner (Right Eye)
      return `<g>
        <polygon points="88,70 120,70 124,84 114,90 88,88" fill="${acc}" fill-opacity="0.28" stroke="${acc}" stroke-width="2.2"/>
        <line x1="94" y1="76" x2="114" y2="76" stroke="#ffffff" stroke-width="1.3" opacity="0.75"/>
        <circle cx="118" cy="74" r="2.2" fill="#ffffff"/>
      </g>`;
    }
    if (accType === 4) {
      // Sleek Studio/Gaming Cyber Headphones
      return `<g stroke="#090d1c" stroke-width="2.2">
        <path d="M24 76 Q26 14 80 14 Q134 14 136 76" fill="none" stroke="#1e293b" stroke-width="6.5"/>
        <path d="M36 30 Q80 10 124 30" fill="none" stroke="${acc}" stroke-width="2.4"/>
        <rect x="16" y="66" width="16" height="30" rx="7" fill="#0f172a"/>
        <circle cx="24" cy="81" r="4.5" fill="${acc}" stroke="none"/>
        <rect x="128" y="66" width="16" height="30" rx="7" fill="#0f172a"/>
        <circle cx="136" cy="81" r="4.5" fill="${acc}" stroke="none"/>
      </g>`;
    }
    if (accType === 5) {
      // Cyber Tactical Neck Scarf + Ear Mic
      return `<g>
        <path d="M40 122 Q80 134 120 122 L126 142 Q80 152 34 142 Z" fill="${acc}" stroke="#090d1c" stroke-width="2.2"/>
        <path d="M126 88 Q122 104 98 106" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="96" cy="106" r="3" fill="${acc}"/>
      </g>`;
    }
    if (accType === 6) {
      // Japanese Kitsune Hairpin + Cyber Ribbon
      return `<g stroke="#090d1c" stroke-width="1.8">
        <polygon points="104,34 114,16 128,30 116,44" fill="#ffffff"/>
        <polygon points="109,32 115,22 122,30" fill="${acc}" stroke="none"/>
        <circle cx="115" cy="36" r="2.5" fill="#ef4444" stroke="none"/>
      </g>`;
    }
    // Sleek Half-Rim Anime Glasses
    return `<g fill="none" stroke="${acc}" stroke-width="2.2">
      <rect x="44" y="74" width="28" height="14" rx="4" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="88" y="74" width="28" height="14" rx="4" fill="#ffffff" fill-opacity="0.14"/>
      <line x1="72" y1="80" x2="88" y2="80"/>
    </g>`;
  }

  function makeAnimeAvatarUri(spec) {
    const [num, name, role, bg1, bg2, acc, hairCol, hairHi, eyeCol, jacketCol, hairStyle, accType, skinIdx, smileType] = spec;
    const skin = SKINS[skinIdx % SKINS.length];

    const mouth = smileType === 1
      ? `<path d="M72 103 Q80 110 88 103" fill="none" stroke="#9f4a4a" stroke-width="2.3" stroke-linecap="round"/>`
      : smileType === 2
        ? `<path d="M72 104 Q82 106 89 101" fill="none" stroke="#8a3d3d" stroke-width="2.3" stroke-linecap="round"/>`
        : `<path d="M74 104 Q80 108 86 104" fill="none" stroke="#9f4a4a" stroke-width="2.2" stroke-linecap="round"/>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <radialGradient id="bg" cx="50%" cy="35%" r="72%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </radialGradient>
        <linearGradient id="eyeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#090d1c"/>
          <stop offset="48%" stop-color="${eyeCol}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <!-- Vibrant Cyber-Anime Background -->
      <rect width="160" height="160" fill="url(#bg)"/>
      <g opacity="0.24" stroke="${acc}" stroke-width="1.3" fill="none">
        <circle cx="80" cy="78" r="64" stroke-dasharray="10 6"/>
        <path d="M10 28 H38 L48 38 M150 28 H122 L112 38 M12 132 H40 M148 132 H120"/>
      </g>
      <!-- Back Hair -->
      ${renderBackHair(hairStyle, hairCol, hairHi)}
      <!-- Neck & Modern Cyber-Tech Jacket -->
      <path d="M68 112 H92 V132 H68 Z" fill="${skin.base}" stroke="#090d1c" stroke-width="2"/>
      <path d="M68 114 Q80 124 92 114 V123 Q80 129 68 123 Z" fill="${skin.shadow}"/>
      <path d="M20 160 Q28 124 66 122 L80 136 L94 122 Q132 124 140 160 Z" fill="${jacketCol}" stroke="#090d1c" stroke-width="2.5"/>
      <!-- High-Tech Glowing Jacket Collar & Stripes -->
      <polygon points="62,122 80,142 98,122 80,132" fill="#e2e8f0" stroke="#090d1c" stroke-width="1.6"/>
      <path d="M40 132 L54 156 M120 132 L106 156" stroke="${acc}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="80" cy="147" r="4" fill="${acc}"/>
      <!-- Anime Ears -->
      <ellipse cx="38" cy="84" rx="6.5" ry="9" fill="${skin.base}" stroke="#090d1c" stroke-width="2"/>
      <ellipse cx="122" cy="84" rx="6.5" ry="9" fill="${skin.base}" stroke="#090d1c" stroke-width="2"/>
      <!-- Anime Face & Chin Contour -->
      <path d="M40 62 Q40 34 80 34 Q120 34 120 62 V84 Q118 106 80 118 Q42 106 40 84 Z" fill="${skin.base}" stroke="#090d1c" stroke-width="2.4"/>
      <!-- Soft Anime Cheek Blush -->
      <ellipse cx="53" cy="94" rx="7.5" ry="3.8" fill="${skin.blush}" opacity="0.42"/>
      <ellipse cx="107" cy="94" rx="7.5" ry="3.8" fill="${skin.blush}" opacity="0.42"/>
      <!-- Expressive Large Japanese Anime Eyes -->
      <g>
        <!-- Left Eye -->
        <ellipse cx="59" cy="81" rx="10.5" ry="11.2" fill="#ffffff"/>
        <ellipse cx="60" cy="82" rx="7.8" ry="9.2" fill="url(#eyeG)"/>
        <circle cx="60" cy="82" r="3.6" fill="#090d1c"/>
        <circle cx="56.5" cy="77.5" r="3" fill="#ffffff"/>
        <circle cx="63.5" cy="86" r="1.5" fill="#ffffff"/>
        <path d="M47 76 Q59 68 71 75" fill="none" stroke="#090d1c" stroke-width="3.2" stroke-linecap="round"/>
        <!-- Right Eye -->
        <ellipse cx="101" cy="81" rx="10.5" ry="11.2" fill="#ffffff"/>
        <ellipse cx="100" cy="82" rx="7.8" ry="9.2" fill="url(#eyeG)"/>
        <circle cx="100" cy="82" r="3.6" fill="#090d1c"/>
        <circle cx="96.5" cy="77.5" r="3" fill="#ffffff"/>
        <circle cx="103.5" cy="86" r="1.5" fill="#ffffff"/>
        <path d="M89 75 Q101 68 113 76" fill="none" stroke="#090d1c" stroke-width="3.2" stroke-linecap="round"/>
        <!-- Eyebrows -->
        <path d="M49 66 Q59 62 69 65" fill="none" stroke="${hairCol}" stroke-width="2.3" stroke-linecap="round"/>
        <path d="M91 65 Q101 62 111 66" fill="none" stroke="${hairCol}" stroke-width="2.3" stroke-linecap="round"/>
      </g>
      <!-- Tiny Anime Nose & Mouth -->
      <path d="M80 91 L78.5 95 L81 95.5" fill="none" stroke="${skin.shadow}" stroke-width="1.6" stroke-linecap="round"/>
      ${mouth}
      <!-- Front Anime Bangs & Hair Highlight -->
      ${renderFrontBangs(hairStyle, hairCol, hairHi, acc)}
      <!-- Modern Cyber/Tech Accessory -->
      ${renderAccessory(accType, acc)}
      <!-- Sparkle Stars -->
      <circle cx="18" cy="22" r="2.2" fill="#ffffff" opacity="0.8"/>
      <circle cx="142" cy="48" r="2" fill="${acc}" opacity="0.85"/>
    </svg>`;

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  EXTRA_AVATAR_SPECS.forEach((spec) => {
    AVATARS.push({
      id: `avatar${spec[0]}`,
      name: spec[1],
      role: spec[2],
      src: makeAnimeAvatarUri(spec)
    });
  });
})();
