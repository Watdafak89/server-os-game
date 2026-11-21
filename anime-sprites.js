/* ServerOps: Japanese Anime-Cyber Computer Art Sprites (8 Zones + 16 Monsters + 8 MVP Bosses)
 * Cohesive cel-shaded Japanese anime mecha / cyber-spirit vector artwork with computer & server hardware motifs.
 */
const AnimeSprites = (() => {
  /* Shared cel-shaded anime badge frame helper with unique gradient IDs */
  function wrapSvg(uid, bg1, bg2, accent, inner, isBoss = false) {
    return `<svg viewBox="0 0 120 120" class="anime-svg-art ${isBoss ? 'is-boss-art' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <defs>
        <radialGradient id="g_${uid}_bg" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </radialGradient>
        <linearGradient id="g_${uid}_hi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.08"/>
        </linearGradient>
        <linearGradient id="g_${uid}_acc" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="116" rx="22" fill="url(#g_${uid}_bg)" stroke="${accent}" stroke-width="${isBoss ? 3.2 : 2.2}"/>
      <!-- Subtle anime cyber-circuit grid backdrop -->
      <g opacity="0.22" stroke="${accent}" stroke-width="1.1" fill="none">
        <path d="M12 24 H34 L42 32 M108 26 H86 L78 34 M14 96 H38 L46 88 M106 94 H84 L76 86"/>
        <circle cx="34" cy="24" r="2" fill="${accent}"/>
        <circle cx="86" cy="26" r="2" fill="${accent}"/>
        <circle cx="38" cy="96" r="2" fill="${accent}"/>
        <circle cx="84" cy="94" r="2" fill="${accent}"/>
      </g>
      <!-- Anime speed-burst aura -->
      ${isBoss ? `<g opacity="0.34" stroke="${accent}" stroke-width="1.5">
        <circle cx="60" cy="60" r="48" fill="none" stroke-dasharray="10 6"/>
        <polygon points="60,8 65,20 55,20" fill="${accent}"/>
        <polygon points="60,112 65,100 55,100" fill="${accent}"/>
        <polygon points="8,60 20,55 20,65" fill="${accent}"/>
        <polygon points="112,60 100,55 100,65" fill="${accent}"/>
      </g>` : `<circle cx="60" cy="60" r="44" fill="none" stroke="${accent}" stroke-opacity="0.2" stroke-width="1.4"/>`}
      ${inner}
      <!-- Glossy anime top sheen -->
      <path d="M16 8 H104 Q112 8 112 16 V34 Q60 48 8 34 V16 Q8 8 16 8 Z" fill="url(#g_${uid}_hi)" opacity="0.26"/>
    </svg>`;
  }

  /* Reusable expressive Japanese Anime Eyes */
  function animeEyes(color = '#38bdf8', angry = false, y = 58) {
    if (angry) {
      return `<g>
        <!-- Left fierce anime eye -->
        <polygon points="36,${y - 4} 53,${y + 2} 50,${y + 9} 38,${y + 7}" fill="#070b18"/>
        <polygon points="39,${y - 2} 51,${y + 3} 48,${y + 8} 40,${y + 6}" fill="${color}"/>
        <circle cx="43" cy="${y + 2}" r="2.1" fill="#ffffff"/>
        <!-- Right fierce anime eye -->
        <polygon points="84,${y - 4} 67,${y + 2} 70,${y + 9} 82,${y + 7}" fill="#070b18"/>
        <polygon points="81,${y - 2} 69,${y + 3} 72,${y + 8} 80,${y + 6}" fill="${color}"/>
        <circle cx="77" cy="${y + 2}" r="2.1" fill="#ffffff"/>
      </g>`;
    }
    return `<g>
      <!-- Left bright anime eye -->
      <ellipse cx="45" cy="${y}" rx="7.2" ry="8.4" fill="#070b18"/>
      <ellipse cx="45" cy="${y + 1}" rx="5.5" ry="6.2" fill="${color}"/>
      <circle cx="43" cy="${y - 2}" r="2.4" fill="#ffffff"/>
      <circle cx="47.5" cy="${y + 3.5}" r="1.2" fill="#ffffff"/>
      <!-- Right bright anime eye -->
      <ellipse cx="75" cy="${y}" rx="7.2" ry="8.4" fill="#070b18"/>
      <ellipse cx="75" cy="${y + 1}" rx="5.5" ry="6.2" fill="${color}"/>
      <circle cx="73" cy="${y - 2}" r="2.4" fill="#ffffff"/>
      <circle cx="77.5" cy="${y + 3.5}" r="1.2" fill="#ffffff"/>
    </g>`;
  }

  /* ==================== 8 WORLD MAP ZONE ANIME-CYBER ICONS ==================== */
  const ZONES = {
    // Zone 1: Prontera Core — Anime Server Rack Citadel + Glowing CPU Crystal
    z1: () => wrapSvg('z1', '#0c4a6e', '#071326', '#38bdf8', `
      <g stroke="#081226" stroke-width="2.2" stroke-linejoin="round">
        <!-- Flanking server rack towers -->
        <rect x="20" y="46" width="22" height="54" rx="4" fill="#1e293b"/>
        <rect x="78" y="46" width="22" height="54" rx="4" fill="#1e293b"/>
        <!-- Central anime citadel spire -->
        <polygon points="60,14 82,40 82,100 38,100 38,40" fill="#e2e8f0"/>
        <polygon points="60,14 82,40 60,40" fill="#bae6fd"/>
        <!-- Server blade LED rows -->
        <rect x="24" y="54" width="14" height="4" rx="1.5" fill="#38bdf8" stroke="none"/>
        <rect x="24" y="64" width="14" height="4" rx="1.5" fill="#34d399" stroke="none"/>
        <rect x="24" y="74" width="14" height="4" rx="1.5" fill="#38bdf8" stroke="none"/>
        <rect x="82" y="54" width="14" height="4" rx="1.5" fill="#38bdf8" stroke="none"/>
        <rect x="82" y="64" width="14" height="4" rx="1.5" fill="#34d399" stroke="none"/>
        <rect x="82" y="74" width="14" height="4" rx="1.5" fill="#38bdf8" stroke="none"/>
        <!-- Glowing CPU Core Emblem -->
        <rect x="47" y="48" width="26" height="26" rx="5" fill="#0f172a"/>
        <polygon points="60,52 68,61 60,70 52,61" fill="#38bdf8" stroke="#ffffff" stroke-width="1.2"/>
        <!-- Cyber Castle Gate -->
        <path d="M51 100 V84 Q60 76 69 84 V100 Z" fill="#0284c7"/>
      </g>
      <circle cx="60" cy="24" r="4" fill="#fde047"/>
    `),

    // Zone 2: Geffen Net-Tower — Anime Network Spire + Orbital Data Rings
    z2: () => wrapSvg('z2', '#312e81', '#0c0a24', '#818cf8', `
      <ellipse cx="60" cy="52" rx="44" ry="14" fill="none" stroke="#38bdf8" stroke-width="2.5" transform="rotate(-18 60 52)"/>
      <ellipse cx="60" cy="52" rx="44" ry="14" fill="none" stroke="#c084fc" stroke-width="2" transform="rotate(18 60 52)"/>
      <g stroke="#090d24" stroke-width="2.2" stroke-linejoin="round">
        <!-- Spire tower -->
        <polygon points="60,12 72,42 78,102 42,102 48,42" fill="#e0e7ff"/>
        <polygon points="60,12 72,42 60,102" fill="#a5b4fc"/>
        <!-- Router signal dish top -->
        <circle cx="60" cy="24" r="6" fill="#38bdf8"/>
        <!-- Network windows -->
        <rect x="53" y="48" width="14" height="8" rx="2" fill="#0f172a"/>
        <rect x="55" y="50" width="10" height="4" fill="#34d399" stroke="none"/>
        <rect x="51" y="64" width="18" height="8" rx="2" fill="#0f172a"/>
        <rect x="53" y="66" width="14" height="4" fill="#38bdf8" stroke="none"/>
        <rect x="49" y="80" width="22" height="10" rx="2" fill="#1e1b4b"/>
      </g>
      <!-- Orbiting anime data packet orbs -->
      <circle cx="24" cy="64" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.3"/>
      <circle cx="96" cy="40" r="4.5" fill="#f472b6" stroke="#ffffff" stroke-width="1.3"/>
    `),

    // Zone 3: Payon Identity Vault — Japanese Cyber-Torii Gate + Holographic Padlock
    z3: () => wrapSvg('z3', '#064e3b', '#051a14', '#34d399', `
      <g stroke="#041510" stroke-width="2.2" stroke-linejoin="round">
        <!-- Japanese Cyber Torii Gate -->
        <path d="M16 34 Q60 22 104 34 L100 44 Q60 34 20 44 Z" fill="#ef4444"/>
        <rect x="26" y="48" width="68" height="8" rx="2" fill="#dc2626"/>
        <rect x="32" y="40" width="10" height="60" rx="2" fill="#b91c1c"/>
        <rect x="78" y="40" width="10" height="60" rx="2" fill="#b91c1c"/>
        <!-- Digital Shield Padlock Core -->
        <path d="M49 65 V56 A11 11 0 0 1 71 56 V65" fill="none" stroke="#6ee7b7" stroke-width="4.5" stroke-linecap="round"/>
        <rect x="44" y="64" width="32" height="28" rx="7" fill="#0f172a" stroke="#34d399" stroke-width="2.4"/>
        <circle cx="60" cy="75" r="4.5" fill="#34d399" stroke="none"/>
        <rect x="58" y="77" width="4" height="9" rx="1.5" fill="#34d399" stroke="none"/>
      </g>
      <!-- Digital sakura petals -->
      <ellipse cx="24" cy="24" rx="4" ry="2" fill="#fda4af" transform="rotate(-30 24 24)"/>
      <ellipse cx="95" cy="22" rx="4" ry="2" fill="#fda4af" transform="rotate(25 95 22)"/>
      <ellipse cx="22" cy="76" rx="3.5" ry="1.8" fill="#6ee7b7" transform="rotate(40 22 76)"/>
    `),

    // Zone 4: Morroc CLI Desert — Cyber Pyramid + Glowing Terminal Console
    z4: () => wrapSvg('z4', '#78350f', '#1c0f06', '#fbbf24', `
      <!-- Glowing cyber desert sun -->
      <circle cx="88" cy="28" r="14" fill="#f59e0b" opacity="0.85"/>
      <g stroke="#1c0f06" stroke-width="2.2" stroke-linejoin="round">
        <!-- Cyber Pyramid -->
        <polygon points="60,18 102,98 18,98" fill="#d97706"/>
        <polygon points="60,18 102,98 64,98" fill="#92400e"/>
        <!-- Floating Anime Terminal Screen -->
        <rect x="26" y="44" width="68" height="44" rx="7" fill="#020617" stroke="#fbbf24" stroke-width="2.4"/>
        <rect x="26" y="44" width="68" height="10" rx="4" fill="#1e293b" stroke="none"/>
        <circle cx="33" cy="49" r="2" fill="#ef4444" stroke="none"/>
        <circle cx="40" cy="49" r="2" fill="#fbbf24" stroke="none"/>
        <circle cx="47" cy="49" r="2" fill="#34d399" stroke="none"/>
        <!-- Terminal prompt >_ -->
        <polyline points="37,64 47,71 37,78" fill="none" stroke="#34d399" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="53" y1="78" x2="72" y2="78" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
      </g>
    `),

    // Zone 5: Al De Baran Defense — Anime Hex-Firewall Fortress Shield
    z5: () => wrapSvg('z5', '#831843', '#1e0818', '#f472b6', `
      <g stroke="#190714" stroke-width="2.2" stroke-linejoin="round">
        <!-- Winged anime cyber-shield -->
        <path d="M16 42 L34 34 L34 62 L18 56 Z" fill="#ec4899"/>
        <path d="M104 42 L86 34 L86 62 L102 56 Z" fill="#ec4899"/>
        <path d="M60 16 L94 30 V58 C94 82 78 97 60 106 C42 97 26 82 26 58 V30 Z" fill="#0f172a" stroke="#f472b6" stroke-width="2.8"/>
        <path d="M60 24 L86 35 V57 C86 76 74 88 60 96 C46 88 34 76 34 57 V35 Z" fill="#1e1b4b"/>
        <!-- Firewall brick energy matrix -->
        <rect x="42" y="44" width="16" height="9" rx="2" fill="#f472b6" stroke="none"/>
        <rect x="62" y="44" width="16" height="9" rx="2" fill="#38bdf8" stroke="none"/>
        <rect x="38" y="57" width="22" height="9" rx="2" fill="#38bdf8" stroke="none"/>
        <rect x="64" y="57" width="18" height="9" rx="2" fill="#f472b6" stroke="none"/>
        <rect x="46" y="70" width="28" height="9" rx="2" fill="#34d399" stroke="none"/>
      </g>
    `),

    // Zone 6: Glast Heim Blackout — Crimson Gothic Server Fortress + Lightning
    z6: () => wrapSvg('z6', '#7f1d1d', '#140509', '#f87171', `
      <!-- Blood cyber moon -->
      <circle cx="60" cy="40" r="24" fill="#dc2626" opacity="0.5"/>
      <g stroke="#120408" stroke-width="2.2" stroke-linejoin="round">
        <!-- Gothic spires -->
        <polygon points="28,34 38,56 38,100 18,100 18,56" fill="#1e293b"/>
        <polygon points="92,34 102,56 102,100 82,100 82,56" fill="#1e293b"/>
        <polygon points="60,12 76,42 78,100 42,100 44,42" fill="#0f172a" stroke="#f87171"/>
        <!-- Crimson Crown Emblem -->
        <polygon points="46,48 53,36 60,46 67,36 74,48 72,56 48,56" fill="#fbbf24"/>
        <!-- Fractured power core -->
        <polygon points="63,60 51,78 60,78 55,95 71,73 61,73" fill="#ef4444" stroke="#fde047" stroke-width="1.4"/>
      </g>
    `),

    // Zone 7: Juno Cloud Sky-City — Floating Anime Cloud Island + Docker Containers
    z7: () => wrapSvg('z7', '#0e7490', '#06202b', '#22d3ee', `
      <g stroke="#06202b" stroke-width="2.2" stroke-linejoin="round">
        <!-- Floating sky island base -->
        <polygon points="24,72 96,72 78,96 60,106 42,96" fill="#1e293b"/>
        <!-- Thruster jets -->
        <polygon points="46,96 52,110 56,96" fill="#38bdf8" stroke="none"/>
        <polygon points="64,96 68,110 74,96" fill="#38bdf8" stroke="none"/>
        <!-- Cloud dome platform -->
        <path d="M22 72 Q16 56 32 52 Q38 36 58 38 Q76 34 84 50 Q104 52 98 72 Z" fill="#e0f2fe"/>
        <!-- Glowing Container Blocks on Cloud City -->
        <rect x="36" y="48" width="14" height="12" rx="2.5" fill="#0284c7"/>
        <rect x="53" y="48" width="14" height="12" rx="2.5" fill="#0ea5e9"/>
        <rect x="70" y="48" width="14" height="12" rx="2.5" fill="#38bdf8"/>
        <rect x="44" y="33" width="14" height="12" rx="2.5" fill="#22d3ee"/>
        <rect x="61" y="33" width="14" height="12" rx="2.5" fill="#34d399"/>
      </g>
    `),

    // Zone 8: Thanatos Forensics Spire — Obsidian Radar Eye Watchtower
    z8: () => wrapSvg('z8', '#7c2d12', '#170a05', '#fb923c', `
      <!-- Scanning radar rings -->
      <circle cx="60" cy="42" r="30" fill="none" stroke="#fb923c" stroke-width="1.6" stroke-dasharray="6 4" opacity="0.75"/>
      <g stroke="#140804" stroke-width="2.2" stroke-linejoin="round">
        <!-- Obsidian Tower -->
        <polygon points="44,102 50,52 70,52 76,102" fill="#1e293b"/>
        <polygon points="34,54 46,38 48,74" fill="#334155"/>
        <polygon points="86,54 74,38 72,74" fill="#334155"/>
        <!-- Glowing Cyber Forensics Eye -->
        <path d="M32 42 Q60 16 88 42 Q60 66 32 42 Z" fill="#0f172a" stroke="#fb923c" stroke-width="2.6"/>
        <circle cx="60" cy="42" r="12" fill="#f97316"/>
        <circle cx="60" cy="42" r="6" fill="#fef08a" stroke="none"/>
        <circle cx="56" cy="38" r="2.5" fill="#ffffff" stroke="none"/>
        <!-- Log beam stripes -->
        <rect x="53" y="68" width="14" height="4" rx="1.5" fill="#fb923c" stroke="none"/>
        <rect x="51" y="78" width="18" height="4" rx="1.5" fill="#fde047" stroke="none"/>
        <rect x="49" y="88" width="22" height="4" rx="1.5" fill="#fb923c" stroke="none"/>
      </g>
    `)
  };

  /* ==================== 24 ANIME CYBER-COMPUTER MONSTERS & MVP BOSSES ==================== */
  const ENEMIES = {
    /* ---------- ZONE 1 ---------- */
    z1_s1: () => wrapSvg('z1s1', '#0369a1', '#08172e', '#38bdf8', `
      <!-- Legacy P2P Drone: Anime hovering CRT/PC Mecha-Drone -->
      <g stroke="#061020" stroke-width="2.3" stroke-linejoin="round">
        <line x1="42" y1="30" x2="34" y2="16" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="34" cy="15" r="4" fill="#fde047"/>
        <line x1="78" y1="30" x2="86" y2="16" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="86" cy="15" r="4" fill="#fde047"/>
        <!-- Floating wing thrusters -->
        <polygon points="14,54 28,46 28,70 14,66" fill="#0284c7"/>
        <polygon points="106,54 92,46 92,70 106,66" fill="#0284c7"/>
        <!-- Monitor mecha head -->
        <rect x="26" y="28" width="68" height="54" rx="14" fill="#e2e8f0"/>
        <rect x="33" y="36" width="54" height="36" rx="9" fill="#0f172a"/>
        <!-- Hover base -->
        <path d="M44 82 H76 L70 96 H50 Z" fill="#334155"/>
        <ellipse cx="60" cy="102" rx="16" ry="4" fill="#38bdf8" stroke="none" opacity="0.7"/>
      </g>
      ${animeEyes('#38bdf8', false, 53)}
      <path d="M53 64 Q60 69 67 64" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
    `),

    z1_s2: () => wrapSvg('z1s2', '#9a3412', '#1c0705', '#fb923c', `
      <!-- Overheat Gremlin: Fiery Anime CPU Fan Imp -->
      <g stroke="#1a0604" stroke-width="2.3" stroke-linejoin="round">
        <!-- Flame hair spikes -->
        <path d="M26 52 Q24 22 44 28 Q54 10 64 26 Q84 14 86 38 Q102 36 92 56 Z" fill="#f97316"/>
        <path d="M36 46 Q44 24 58 32 Q68 18 76 34 Q86 30 82 48 Z" fill="#fde047" stroke="none"/>
        <!-- CPU Chip armored body -->
        <rect x="30" y="38" width="60" height="54" rx="14" fill="#1e293b"/>
        <!-- Golden CPU Pins -->
        <path d="M22 48 H30 M22 58 H30 M22 68 H30 M90 48 H98 M90 58 H98 M90 68 H98" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Glowing heatsink core -->
        <circle cx="60" cy="84" r="8" fill="#ef4444"/>
      </g>
      ${animeEyes('#fde047', true, 58)}
      <path d="M48 72 L54 68 L60 72 L66 68 L72 72" fill="none" stroke="#fb923c" stroke-width="2.4" stroke-linecap="round"/>
    `),

    z1_boss: () => wrapSvg('z1b', '#7f1d1d', '#0f0714', '#f87171', `
      <!-- MVP BOSS: Disk-Crash Colossus — Shattered RAID Platter Mecha Titan -->
      <g stroke="#0b0510" stroke-width="2.4" stroke-linejoin="round">
        <!-- Massive spinning HDD Platter Shoulders -->
        <circle cx="24" cy="54" r="18" fill="#cbd5e1"/>
        <circle cx="24" cy="54" r="6" fill="#ef4444"/>
        <circle cx="96" cy="54" r="18" fill="#cbd5e1"/>
        <circle cx="96" cy="54" r="6" fill="#ef4444"/>
        <!-- Horned Gundam-Mecha Helm -->
        <polygon points="36,36 22,12 48,26" fill="#fbbf24"/>
        <polygon points="84,36 98,12 72,26" fill="#fbbf24"/>
        <polygon points="60,18 86,36 82,86 60,102 38,86 34,36" fill="#1e293b"/>
        <polygon points="60,24 78,38 74,76 60,88 46,76 42,38" fill="#334155"/>
        <!-- Visor slit -->
        <polygon points="39,46 81,46 76,62 44,62" fill="#050814"/>
        <!-- Glowing fractured chest RAID core -->
        <polygon points="60,68 70,79 60,92 50,79" fill="#ef4444" stroke="#fde047" stroke-width="1.6"/>
      </g>
      ${animeEyes('#ef4444', true, 52)}
    `, true),

    /* ---------- ZONE 2 ---------- */
    z2_s1: () => wrapSvg('z2s1', '#1e3a8a', '#090d26', '#60a5fa', `
      <!-- IP-Conflict Phantom: Dual-Glitch Anime Cyber Spirit -->
      <g opacity="0.55" transform="translate(-6,0)">
        <path d="M36 94 V48 A24 24 0 0 1 84 48 V94 L72 84 L60 94 L48 84 Z" fill="#f472b6"/>
      </g>
      <g opacity="0.55" transform="translate(6,0)">
        <path d="M36 94 V48 A24 24 0 0 1 84 48 V94 L72 84 L60 94 L48 84 Z" fill="#22d3ee"/>
      </g>
      <g stroke="#080c20" stroke-width="2.3" stroke-linejoin="round">
        <path d="M34 94 V48 A26 26 0 0 1 86 48 V94 L73 84 L60 94 L47 84 Z" fill="#e0f2fe"/>
        <rect x="34" y="42" width="52" height="22" rx="8" fill="#0f172a"/>
        <!-- Antenna -->
        <line x1="60" y1="22" x2="60" y2="12" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="60" cy="11" r="4" fill="#f472b6"/>
      </g>
      ${animeEyes('#38bdf8', true, 52)}
      <text x="60" y="79" text-anchor="middle" fill="#1e3a8a" font-family="monospace" font-weight="900" font-size="11">IP:ERR</text>
    `),

    z2_s2: () => wrapSvg('z2s2', '#4c1d95', '#100724', '#a78bfa', `
      <!-- NXDOMAIN Glitch: Swirling Anime Cyber Vortex Entity -->
      <circle cx="60" cy="60" r="40" fill="none" stroke="#c084fc" stroke-width="4" stroke-dasharray="18 8"/>
      <circle cx="60" cy="60" r="30" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="12 7"/>
      <g stroke="#100724" stroke-width="2.2">
        <polygon points="60,24 88,44 82,80 60,96 38,80 32,44" fill="#1e1b4b"/>
        <rect x="36" y="44" width="48" height="26" rx="8" fill="#09071a"/>
      </g>
      ${animeEyes('#e879f9', false, 56)}
      <text x="60" y="84" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="900" font-size="11">DNS 404</text>
    `),

    z2_boss: () => wrapSvg('z2b', '#1d4ed8', '#080e2b', '#38bdf8', `
      <!-- MVP BOSS: Port-Storm Hydra — 3-Headed Neon Cyber Dragon -->
      <g stroke="#060b20" stroke-width="2.3" stroke-linejoin="round">
        <!-- Lightning wings -->
        <polygon points="10,40 34,48 26,76 12,68" fill="#38bdf8"/>
        <polygon points="110,40 86,48 94,76 108,68" fill="#38bdf8"/>
        <!-- Left & Right Dragon Heads -->
        <polygon points="18,28 40,26 42,48 22,50" fill="#1e40af"/>
        <circle cx="29" cy="37" r="3.2" fill="#fde047" stroke="none"/>
        <polygon points="102,28 80,26 78,48 98,50" fill="#1e40af"/>
        <circle cx="91" cy="37" r="3.2" fill="#fde047" stroke="none"/>
        <!-- Center Cyber Hydra Boss Head -->
        <polygon points="60,14 82,34 78,86 60,102 42,86 38,34" fill="#0f172a"/>
        <polygon points="46,24 60,12 74,24 68,36 52,36" fill="#38bdf8"/>
        <!-- Fiber-optic chest reactor -->
        <circle cx="60" cy="78" r="10" fill="#0284c7" stroke="#fde047" stroke-width="2"/>
        <circle cx="60" cy="78" r="4.5" fill="#ffffff" stroke="none"/>
      </g>
      ${animeEyes('#38bdf8', true, 52)}
    `, true),

    /* ---------- ZONE 3 ---------- */
    z3_s1: () => wrapSvg('z3s1', '#065f46', '#061a14', '#34d399', `
      <!-- Rogue Account Mimic: Cyber Kitsune Phantom Thief -->
      <g stroke="#041510" stroke-width="2.2" stroke-linejoin="round">
        <!-- Kitsune cyber ears -->
        <polygon points="28,46 24,14 48,30" fill="#f8fafc"/>
        <polygon points="31,39 29,21 43,32" fill="#34d399" stroke="none"/>
        <polygon points="92,46 96,14 72,30" fill="#f8fafc"/>
        <polygon points="89,39 91,21 77,32" fill="#34d399" stroke="none"/>
        <!-- Masquerade Cyber Mask Face -->
        <path d="M28 44 Q60 28 92 44 L84 82 L60 98 L36 82 Z" fill="#f8fafc"/>
        <path d="M32 50 Q60 40 88 50 L82 66 Q60 60 38 66 Z" fill="#0f172a"/>
        <!-- Red Japanese kitsune markings -->
        <path d="M36 74 L46 78 M84 74 L74 78" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
      </g>
      ${animeEyes('#34d399', true, 55)}
    `),

    z3_s2: () => wrapSvg('z3s2', '#134e4a', '#061717', '#2dd4bf', `
      <!-- Privilege Escalator: Hooded Anime Cyber Ninja Hacker -->
      <g stroke="#041212" stroke-width="2.2" stroke-linejoin="round">
        <!-- Cyber Ninja Hood -->
        <path d="M22 94 L30 34 Q60 12 90 34 L98 94 Z" fill="#0f172a"/>
        <path d="M34 42 Q60 32 86 42 L82 76 L60 86 L38 76 Z" fill="#1e293b"/>
        <!-- Glowing Neon Visor Scarf -->
        <rect x="34" y="64" width="52" height="18" rx="6" fill="#0d9488"/>
        <!-- Twin SUDO energy daggers -->
        <polygon points="14,76 28,60 32,68 18,86" fill="#2dd4bf"/>
        <polygon points="106,76 92,60 88,68 102,86" fill="#2dd4bf"/>
      </g>
      ${animeEyes('#2dd4bf', true, 52)}
      <text x="60" y="77" text-anchor="middle" fill="#041212" font-family="monospace" font-weight="900" font-size="10">SUDO</text>
    `),

    z3_boss: () => wrapSvg('z3b', '#991b1b', '#14050a', '#fb7185', `
      <!-- MVP BOSS: Rootkit Sentinel — Japanese Cyber-Oni Samurai -->
      <g stroke="#0d0307" stroke-width="2.3" stroke-linejoin="round">
        <!-- Glowing Laser Katana behind -->
        <line x1="16" y1="98" x2="104" y2="20" stroke="#34d399" stroke-width="5.5" stroke-linecap="round"/>
        <line x1="16" y1="98" x2="104" y2="20" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <!-- Samurai Kabuto Crest & Oni Horns -->
        <polygon points="44,28 24,10 36,38" fill="#fbbf24"/>
        <polygon points="76,28 96,10 84,38" fill="#fbbf24"/>
        <path d="M26 52 Q60 16 94 52 L90 82 L60 100 L30 82 Z" fill="#1e293b"/>
        <!-- Oni Cyber Menpo Mask -->
        <path d="M34 64 L60 56 L86 64 L80 86 L60 96 L40 86 Z" fill="#dc2626"/>
        <polygon points="46,74 51,84 55,74" fill="#ffffff" stroke="none"/>
        <polygon points="65,74 69,84 74,74" fill="#ffffff" stroke="none"/>
      </g>
      ${animeEyes('#fde047', true, 48)}
    `, true),

    /* ---------- ZONE 4 ---------- */
    z4_s1: () => wrapSvg('z4s1', '#365314', '#0e1706', '#a3e635', `
      <!-- Zombie Process Swarm: Chibi Anime Cyber-Zombie -->
      <g stroke="#0a1204" stroke-width="2.3" stroke-linejoin="round">
        <rect x="28" y="28" width="64" height="62" rx="18" fill="#4d7c0f"/>
        <!-- Circuit stitch headband -->
        <rect x="28" y="34" width="64" height="10" fill="#1e293b"/>
        <circle cx="40" cy="39" r="2.5" fill="#a3e635" stroke="none"/>
        <circle cx="60" cy="39" r="2.5" fill="#ef4444" stroke="none"/>
        <circle cx="80" cy="39" r="2.5" fill="#a3e635" stroke="none"/>
        <!-- PID tag -->
        <rect x="40" y="72" width="40" height="14" rx="4" fill="#0f172a"/>
      </g>
      ${animeEyes('#bef264', false, 56)}
      <text x="60" y="83" text-anchor="middle" fill="#a3e635" font-family="monospace" font-weight="900" font-size="9">PID:99</text>
    `),

    z4_s2: () => wrapSvg('z4s2', '#1d4ed8', '#081844', '#60a5fa', `
      <!-- BlueScreen Specter: Anime BSOD Monitor Ghost -->
      <g stroke="#06102e" stroke-width="2.3" stroke-linejoin="round">
        <path d="M24 32 Q24 20 36 20 H84 Q96 20 96 32 V86 L82 78 L70 90 L60 80 L50 90 L38 78 L24 86 Z" fill="#2563eb"/>
        <rect x="32" y="28" width="56" height="44" rx="8" fill="#1e40af" stroke="#93c5fd" stroke-width="1.8"/>
      </g>
      ${animeEyes('#ffffff', false, 47)}
      <path d="M48 64 Q60 56 72 64" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <text x="60" y="84" text-anchor="middle" fill="#bae6fd" font-family="monospace" font-weight="900" font-size="9">BSOD</text>
    `),

    z4_boss: () => wrapSvg('z4b', '#b45309', '#1c0d04', '#fbbf24', `
      <!-- MVP BOSS: Kernel-Panic Mech — Gundam-Style Heavy Warning Mecha -->
      <g stroke="#140903" stroke-width="2.3" stroke-linejoin="round">
        <!-- Twin Shoulder Plasma Cannons -->
        <rect x="12" y="26" width="18" height="40" rx="4" fill="#334155"/>
        <circle cx="21" cy="30" r="5" fill="#38bdf8"/>
        <rect x="90" y="26" width="18" height="40" rx="4" fill="#334155"/>
        <circle cx="99" cy="30" r="5" fill="#38bdf8"/>
        <!-- V-Fin Gundam Antenna -->
        <polygon points="60,26 30,12 44,32" fill="#fbbf24"/>
        <polygon points="60,26 90,12 76,32" fill="#fbbf24"/>
        <!-- Armored Head & Torso -->
        <polygon points="36,30 84,30 88,76 60,98 32,76" fill="#e2e8f0"/>
        <rect x="38" y="42" width="44" height="18" rx="4" fill="#0f172a"/>
        <!-- Warning Chest Core -->
        <polygon points="60,64 74,84 46,84" fill="#fbbf24" stroke="#ef4444" stroke-width="2"/>
        <text x="60" y="81" text-anchor="middle" fill="#0f172a" font-family="monospace" font-weight="900" font-size="12" stroke="none">!</text>
      </g>
      ${animeEyes('#ef4444', true, 50)}
    `, true),

    /* ---------- ZONE 5 ---------- */
    z5_s1: () => wrapSvg('z5s1', '#831843', '#1a0613', '#f472b6', `
      <!-- Brute-Force Botnet: Anime Cyber Arachnid Mecha -->
      <g stroke="#f472b6" stroke-width="3.2" stroke-linecap="round" fill="none">
        <path d="M34 52 L14 38 L10 54"/>
        <path d="M32 62 L12 64 L10 80"/>
        <path d="M36 72 L18 86 L16 98"/>
        <path d="M86 52 L106 38 L110 54"/>
        <path d="M88 62 L108 64 L110 80"/>
        <path d="M84 72 L102 86 L104 98"/>
      </g>
      <g stroke="#14040e" stroke-width="2.3">
        <ellipse cx="60" cy="60" rx="28" ry="26" fill="#1e293b"/>
        <rect x="36" y="46" width="48" height="22" rx="9" fill="#090714"/>
      </g>
      ${animeEyes('#f43f5e', true, 56)}
      <circle cx="60" cy="48" r="3" fill="#fde047"/>
    `),

    z5_s2: () => wrapSvg('z5s2', '#581c87', '#130620', '#c084fc', `
      <!-- Data-Wiper Virus: Spiky Neon Anime Cyber-Virus Core -->
      <g stroke="#12051e" stroke-width="2.2" stroke-linejoin="round">
        <!-- Spikes -->
        <polygon points="60,10 67,30 53,30" fill="#c084fc"/>
        <polygon points="60,110 67,90 53,90" fill="#c084fc"/>
        <polygon points="10,60 30,53 30,67" fill="#c084fc"/>
        <polygon points="110,60 90,53 90,67" fill="#c084fc"/>
        <polygon points="24,24 40,34 34,40" fill="#f472b6"/>
        <polygon points="96,24 80,34 86,40" fill="#f472b6"/>
        <polygon points="24,96 40,86 34,80" fill="#f472b6"/>
        <polygon points="96,96 80,86 86,80" fill="#f472b6"/>
        <!-- Core body -->
        <circle cx="60" cy="60" r="30" fill="#1e1b4b"/>
      </g>
      ${animeEyes('#f472b6', true, 56)}
      <path d="M46 72 Q60 80 74 72" fill="none" stroke="#c084fc" stroke-width="2.6" stroke-linecap="round"/>
    `),

    z5_boss: () => wrapSvg('z5b', '#9f1239', '#1a050c', '#fb7185', `
      <!-- MVP BOSS: RansomWorm-X — Crimson Cyber Dragon + Encrypted Padlock -->
      <g stroke="#140309" stroke-width="2.3" stroke-linejoin="round">
        <!-- Coiled cyber serpent armor -->
        <path d="M20 88 Q12 52 38 36 Q60 22 86 38 Q108 54 96 86 Q76 104 42 96" fill="none" stroke="#be123c" stroke-width="14" stroke-linecap="round"/>
        <path d="M20 88 Q12 52 38 36 Q60 22 86 38 Q108 54 96 86" fill="none" stroke="#fb7185" stroke-width="3" stroke-dasharray="6 6"/>
        <!-- Dragon Head -->
        <polygon points="60,14 84,32 78,66 60,78 42,66 36,32" fill="#0f172a"/>
        <polygon points="40,28 24,12 48,20" fill="#fde047"/>
        <polygon points="80,28 96,12 72,20" fill="#fde047"/>
        <!-- Ransom Padlock Orb -->
        <rect x="47" y="78" width="26" height="22" rx="5" fill="#fbbf24"/>
        <circle cx="60" cy="88" r="3.2" fill="#0f172a" stroke="none"/>
      </g>
      ${animeEyes('#fde047', true, 46)}
    `, true),

    /* ---------- ZONE 6 ---------- */
    z6_s1: () => wrapSvg('z6s1', '#a16207', '#1a0f04', '#fde047', `
      <!-- DDoS Overload Core: Crackling Anime Plasma Battery Mecha -->
      <g stroke="#140b03" stroke-width="2.3" stroke-linejoin="round">
        <!-- Lightning bolts -->
        <polygon points="22,22 10,48 22,48 14,72 32,42 22,42" fill="#fde047"/>
        <polygon points="98,22 110,48 98,48 106,72 88,42 98,42" fill="#fde047"/>
        <!-- Reactor Cell Body -->
        <rect x="44" y="18" width="32" height="10" rx="3" fill="#94a3b8"/>
        <rect x="30" y="28" width="60" height="68" rx="14" fill="#1e293b"/>
        <rect x="36" y="38" width="48" height="30" rx="8" fill="#090d16"/>
        <!-- Overload bar -->
        <rect x="38" y="75" width="44" height="10" rx="4" fill="#ef4444"/>
      </g>
      ${animeEyes('#fde047', true, 52)}
    `),

    z6_s2: () => wrapSvg('z6s2', '#312e81', '#070614', '#818cf8', `
      <!-- Zero-Day Shadow: Cloaked Dark-Anime Cyber Wraith -->
      <g stroke="#05040d" stroke-width="2.3" stroke-linejoin="round">
        <!-- Shadow blades -->
        <polygon points="10,72 34,44 36,62 18,90" fill="#6366f1"/>
        <polygon points="110,72 86,44 84,62 102,90" fill="#6366f1"/>
        <!-- Dark Anime Cloak -->
        <path d="M24 98 L34 30 Q60 12 86 30 L96 98 L76 86 L60 98 L44 86 Z" fill="#0f172a"/>
        <ellipse cx="60" cy="52" rx="22" ry="18" fill="#020617"/>
      </g>
      ${animeEyes('#f43f5e', true, 51)}
      <text x="60" y="80" text-anchor="middle" fill="#a5b4fc" font-family="monospace" font-weight="900" font-size="10">0-DAY</text>
    `),

    z6_boss: () => wrapSvg('z6b', '#991b1b', '#0a030f', '#fbbf24', `
      <!-- FINAL BOSS: BLACKOUT OVERLORD — Dark Anime Cyber Demon King -->
      <g stroke="#09020e" stroke-width="2.3" stroke-linejoin="round">
        <!-- Cyber Demon Wings -->
        <polygon points="8,28 38,44 34,78 14,70 22,52" fill="#dc2626"/>
        <polygon points="112,28 82,44 86,78 106,70 98,52" fill="#dc2626"/>
        <!-- Blazing Golden Holographic Crown -->
        <polygon points="36,34 42,12 52,26 60,8 68,26 78,12 84,34" fill="#fbbf24"/>
        <!-- Overlord Armored Visage -->
        <polygon points="34,34 86,34 82,82 60,104 38,82" fill="#0f172a"/>
        <polygon points="40,42 80,42 76,62 44,62" fill="#020617"/>
        <!-- Crimson Server Core -->
        <polygon points="60,68 72,82 60,96 48,82" fill="#ef4444" stroke="#fbbf24" stroke-width="2"/>
      </g>
      ${animeEyes('#fbbf24', true, 51)}
    `, true),

    /* ---------- ZONE 7 ---------- */
    z7_s1: () => wrapSvg('z7s1', '#0e7490', '#061d29', '#22d3ee', `
      <!-- Dependency Hydra: Cute-Fierce Anime Cyber-Whale Container Beast -->
      <g stroke="#051722" stroke-width="2.2" stroke-linejoin="round">
        <!-- Stacked container armor -->
        <rect x="34" y="22" width="16" height="12" rx="2.5" fill="#38bdf8"/>
        <rect x="52" y="22" width="16" height="12" rx="2.5" fill="#22d3ee"/>
        <rect x="70" y="22" width="16" height="12" rx="2.5" fill="#34d399"/>
        <rect x="43" y="34" width="16" height="12" rx="2.5" fill="#0ea5e9"/>
        <rect x="61" y="34" width="16" height="12" rx="2.5" fill="#38bdf8"/>
        <!-- Cyber Whale Mecha Body -->
        <path d="M18 68 Q20 44 60 44 Q92 44 96 66 Q98 88 60 92 Q20 92 18 68 Z" fill="#0284c7"/>
        <polygon points="94,64 110,48 106,74" fill="#38bdf8"/>
      </g>
      ${animeEyes('#fde047', false, 64)}
      <path d="M46 78 Q60 85 74 78" fill="none" stroke="#e0f2fe" stroke-width="2.5" stroke-linecap="round"/>
    `),

    z7_s2: () => wrapSvg('z7s2', '#475569', '#0f172a', '#fbbf24', `
      <!-- Manual-Task Golem: Anime Clockwork Server Golem -->
      <g stroke="#090f1d" stroke-width="2.3" stroke-linejoin="round">
        <!-- Spinning gear shoulders -->
        <circle cx="22" cy="58" r="13" fill="#f59e0b" stroke-dasharray="6 3"/>
        <circle cx="98" cy="58" r="13" fill="#f59e0b" stroke-dasharray="6 3"/>
        <!-- Heavy Golem Head & Clock Chest -->
        <rect x="30" y="24" width="60" height="72" rx="14" fill="#334155"/>
        <rect x="36" y="34" width="48" height="24" rx="6" fill="#0f172a"/>
        <!-- Analog Cron Clock Chest -->
        <circle cx="60" cy="76" r="13" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.4"/>
        <line x1="60" y1="76" x2="60" y2="67" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="60" y1="76" x2="68" y2="76" stroke="#ef4444" stroke-width="2.4" stroke-linecap="round"/>
      </g>
      ${animeEyes('#fbbf24', true, 45)}
    `),

    z7_boss: () => wrapSvg('z7b', '#0369a1', '#061429', '#22d3ee', `
      <!-- MVP BOSS: Cloud-Scale Kraken — Electric Anime Cyber-Leviathan -->
      <g stroke="#051124" stroke-width="2.3" stroke-linejoin="round">
        <!-- Electric cyber tentacles -->
        <path d="M36 74 Q16 82 16 102" fill="none" stroke="#22d3ee" stroke-width="7" stroke-linecap="round"/>
        <path d="M48 78 Q38 94 34 106" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <path d="M72 78 Q82 94 86 106" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <path d="M84 74 Q104 82 104 102" fill="none" stroke="#22d3ee" stroke-width="7" stroke-linecap="round"/>
        <!-- Crowned Kraken Dome -->
        <path d="M26 56 Q26 14 60 14 Q94 14 94 56 L86 80 H34 Z" fill="#0f172a"/>
        <polygon points="44,24 60,10 76,24 68,36 52,36" fill="#22d3ee"/>
        <!-- Lightning bolts -->
        <polygon points="20,24 12,42 22,42 16,58 30,36 20,36" fill="#fde047" stroke="none"/>
        <polygon points="100,24 108,42 98,42 104,58 90,36 100,36" fill="#fde047" stroke="none"/>
      </g>
      ${animeEyes('#fde047', true, 54)}
    `, true),

    /* ---------- ZONE 8 ---------- */
    z8_s1: () => wrapSvg('z8s1', '#334155', '#090d1a', '#38bdf8', `
      <!-- Log-Eraser Ghost: Anime Cyber-Detective Phantom -->
      <g stroke="#060914" stroke-width="2.2" stroke-linejoin="round">
        <!-- Cyber Fedora Hat -->
        <ellipse cx="60" cy="36" rx="40" ry="9" fill="#1e293b"/>
        <path d="M36 36 L44 16 H76 L84 36 Z" fill="#0f172a"/>
        <rect x="39" y="28" width="42" height="5" fill="#fb923c" stroke="none"/>
        <!-- Glowing Phantom Body -->
        <path d="M32 42 H88 L84 94 L70 84 L60 94 L50 84 L36 94 Z" fill="#1e293b"/>
        <rect x="36" y="46" width="48" height="22" rx="7" fill="#020617"/>
      </g>
      ${animeEyes('#fb923c', true, 56)}
    `),

    z8_s2: () => wrapSvg('z8s2', '#15803d', '#061a0e', '#4ade80', `
      <!-- Memory-Leak Slime: Glowing Anime Cyber-Slime + RAM Stick -->
      <g stroke="#04140a" stroke-width="2.2" stroke-linejoin="round">
        <!-- RAM Stick sticking out -->
        <rect x="52" y="14" width="38" height="16" rx="3" fill="#065f46" transform="rotate(24 71 22)"/>
        <rect x="58" y="18" width="6" height="8" fill="#0f172a" stroke="none" transform="rotate(24 71 22)"/>
        <rect x="68" y="18" width="6" height="8" fill="#0f172a" stroke="none" transform="rotate(24 71 22)"/>
        <!-- Translucent Anime Slime Blob -->
        <path d="M18 82 Q16 40 60 36 Q104 40 102 82 Q102 98 60 98 Q18 98 18 82 Z" fill="#22c55e"/>
        <ellipse cx="40" cy="50" rx="10" ry="5" fill="#bbf7d0" stroke="none" opacity="0.7" transform="rotate(-22 40 50)"/>
      </g>
      ${animeEyes('#052e16', false, 64)}
      <path d="M52 78 Q60 84 68 78" fill="none" stroke="#052e16" stroke-width="2.6" stroke-linecap="round"/>
    `),

    z8_boss: () => wrapSvg('z8b', '#c2410c', '#120508', '#fb923c', `
      <!-- GRAND MASTER BOSS: APT ZERO-DAY OVERLORD — Blazing Cyber-Seraph Eye Entity -->
      <g stroke="#120406" stroke-width="2.3" stroke-linejoin="round">
        <!-- 4 Blazing Anime Cyber-Seraph Wings -->
        <polygon points="8,24 44,44 36,64 12,50" fill="#f97316"/>
        <polygon points="112,24 76,44 84,64 108,50" fill="#f97316"/>
        <polygon points="14,74 44,66 38,94 18,96" fill="#ef4444"/>
        <polygon points="106,74 76,66 82,94 102,96" fill="#ef4444"/>
        <!-- Floating Halo Ring -->
        <ellipse cx="60" cy="20" rx="26" ry="7" fill="none" stroke="#fde047" stroke-width="3"/>
        <!-- Armored Seraph Core -->
        <polygon points="60,24 88,58 60,100 32,58" fill="#0f172a" stroke="#fb923c" stroke-width="2.6"/>
        <!-- Piercing All-Seeing Anime Cyber Eye -->
        <path d="M36 58 Q60 36 84 58 Q60 80 36 58 Z" fill="#fef08a"/>
        <circle cx="60" cy="58" r="11" fill="#dc2626"/>
        <circle cx="60" cy="58" r="5" fill="#0f172a" stroke="none"/>
        <circle cx="56" cy="54" r="2.6" fill="#ffffff" stroke="none"/>
      </g>
    `, true)
  };

  function getZoneIcon(zoneId) {
    return ZONES[zoneId] ? ZONES[zoneId]() : ZONES.z1();
  }

  function getEnemySprite(stageId) {
    return ENEMIES[stageId] ? ENEMIES[stageId]() : ENEMIES.z1_s1();
  }

  return {
    getZoneIcon,
    getEnemySprite
  };
})();
