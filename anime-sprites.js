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

  /* ==================== RAGNAROK ONLINE MONSTERS & MVP BOSSES LIBRARY ==================== */
  const RO_MONSTERS = {
    // 1. Poring / Drops / Poporing / Marin
    poring: (uid, body, shade, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#2a0a18" stroke-width="2.4" stroke-linejoin="round">
        <ellipse cx="60" cy="98" rx="34" ry="7" fill="#020617" opacity="0.45" stroke="none"/>
        <path d="M60 22 C66 36 96 52 96 74 C96 92 80 98 60 98 C40 98 24 92 24 74 C24 52 54 36 60 22 Z" fill="${body}"/>
        <path d="M26 76 C30 90 46 95 60 95 C74 95 90 90 94 76 C84 86 72 88 60 88 C48 88 36 86 26 76 Z" fill="${shade}" stroke="none" opacity="0.65"/>
        <ellipse cx="44" cy="54" rx="7" ry="11" fill="#ffffff" stroke="none" opacity="0.65" transform="rotate(-24 44 54)"/>
        <circle cx="38" cy="68" r="3" fill="#ffffff" stroke="none" opacity="0.55"/>
        <ellipse cx="38" cy="74" rx="6" ry="3.5" fill="#fb7185" stroke="none" opacity="0.55"/>
        <ellipse cx="82" cy="74" rx="6" ry="3.5" fill="#fb7185" stroke="none" opacity="0.55"/>
        <circle cx="47" cy="66" r="4.2" fill="#1e1b2e" stroke="none"/>
        <circle cx="45.6" cy="64.5" r="1.4" fill="#ffffff" stroke="none"/>
        <circle cx="73" cy="66" r="4.2" fill="#1e1b2e" stroke="none"/>
        <circle cx="71.6" cy="64.5" r="1.4" fill="#ffffff" stroke="none"/>
        <path d="M53 74 Q56.5 78 60 74 Q63.5 78 67 74" fill="none" stroke="#1e1b2e" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    `),

    // 2. Lunatic / Eclipse (Fluffy RO Bunny)
    lunatic: (uid, fur, earIn, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1e1b2e" stroke-width="2.3" stroke-linejoin="round">
        <ellipse cx="60" cy="100" rx="30" ry="6" fill="#020617" opacity="0.4" stroke="none"/>
        <ellipse cx="43" cy="30" rx="9" ry="22" fill="${fur}" transform="rotate(-14 43 30)"/>
        <ellipse cx="43" cy="31" rx="4.5" ry="15" fill="${earIn}" stroke="none" transform="rotate(-14 43 31)"/>
        <ellipse cx="77" cy="30" rx="9" ry="22" fill="${fur}" transform="rotate(14 77 30)"/>
        <ellipse cx="77" cy="31" rx="4.5" ry="15" fill="${earIn}" stroke="none" transform="rotate(14 77 31)"/>
        <circle cx="91" cy="82" r="9" fill="${fur}"/>
        <ellipse cx="60" cy="72" rx="32" ry="27" fill="${fur}"/>
        <ellipse cx="44" cy="95" rx="9" ry="5" fill="${fur}"/>
        <ellipse cx="76" cy="95" rx="9" ry="5" fill="${fur}"/>
        <ellipse cx="47" cy="68" rx="4.5" ry="5.5" fill="#dc2626" stroke="none"/>
        <circle cx="45.5" cy="66" r="1.6" fill="#ffffff" stroke="none"/>
        <ellipse cx="73" cy="68" rx="4.5" ry="5.5" fill="#dc2626" stroke="none"/>
        <circle cx="71.5" cy="66" r="1.6" fill="#ffffff" stroke="none"/>
        <polygon points="57,74 63,74 60,78" fill="#f472b6" stroke="none"/>
        <path d="M54 81 Q60 85 66 81" fill="none" stroke="#1e1b2e" stroke-width="2" stroke-linecap="round"/>
      </g>
    `),

    // 3. Chonchon / Steel Chonchon / Hunter Fly
    chonchon: (uid, body, wing, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#0f172a" stroke-width="2.2" stroke-linejoin="round">
        <ellipse cx="32" cy="44" rx="22" ry="11" fill="${wing}" opacity="0.78" transform="rotate(-26 32 44)"/>
        <ellipse cx="88" cy="44" rx="22" ry="11" fill="${wing}" opacity="0.78" transform="rotate(26 88 44)"/>
        <path d="M52 44 Q44 26 36 28" fill="none" stroke="${acc}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M68 44 Q76 26 84 28" fill="none" stroke="${acc}" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="60" cy="70" rx="22" ry="26" fill="${body}"/>
        <path d="M40 76 Q60 83 80 76" fill="none" stroke="#0f172a" stroke-width="2"/>
        <path d="M43 85 Q60 91 77 85" fill="none" stroke="#0f172a" stroke-width="2"/>
        <circle cx="48" cy="56" r="11" fill="#fde047"/>
        <circle cx="48" cy="56" r="5" fill="#0f172a" stroke="none"/>
        <circle cx="46" cy="53" r="2.2" fill="#ffffff" stroke="none"/>
        <circle cx="72" cy="56" r="11" fill="#fde047"/>
        <circle cx="72" cy="56" r="5" fill="#0f172a" stroke="none"/>
        <circle cx="70" cy="53" r="2.2" fill="#ffffff" stroke="none"/>
      </g>
    `),

    // 4. Spore / Poison Spore (RO Mushroom)
    spore: (uid, cap, spots, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1e1b2e" stroke-width="2.3" stroke-linejoin="round">
        <ellipse cx="60" cy="100" rx="28" ry="6" fill="#020617" opacity="0.4" stroke="none"/>
        <path d="M36 58 H84 L88 94 Q60 102 32 94 Z" fill="#fef3c7"/>
        <path d="M16 62 C16 24 40 16 60 16 C80 16 104 24 104 62 Q60 72 16 62 Z" fill="${cap}"/>
        <circle cx="38" cy="40" r="7" fill="${spots}" stroke="none"/>
        <circle cx="62" cy="28" r="8" fill="${spots}" stroke="none"/>
        <circle cx="84" cy="44" r="6.5" fill="${spots}" stroke="none"/>
        <circle cx="52" cy="48" r="5" fill="${spots}" stroke="none"/>
        <circle cx="49" cy="76" r="4" fill="#1e1b2e" stroke="none"/>
        <circle cx="47.8" cy="74.5" r="1.3" fill="#ffffff" stroke="none"/>
        <circle cx="71" cy="76" r="4" fill="#1e1b2e" stroke="none"/>
        <circle cx="69.8" cy="74.5" r="1.3" fill="#ffffff" stroke="none"/>
        <path d="M54 85 Q60 90 66 85" fill="none" stroke="#1e1b2e" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    `),

    // 5. Whisper / Giant Whisper (Geffen Ghost)
    whisper: (uid, cloth, eye, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1e1b2e" stroke-width="2.3" stroke-linejoin="round">
        <path d="M24 96 L28 48 C28 22 44 16 60 16 C76 16 92 22 92 48 L96 96 L82 86 L70 98 L60 86 L50 98 L38 86 Z" fill="${cloth}"/>
        <path d="M28 54 L12 68 L26 74 Z" fill="${cloth}"/>
        <path d="M92 54 L108 68 L94 74 Z" fill="${cloth}"/>
        <ellipse cx="60" cy="48" rx="18" ry="14" fill="#0f172a"/>
        <ellipse cx="52" cy="47" rx="4.2" ry="5" fill="${eye}" stroke="none"/>
        <ellipse cx="68" cy="47" rx="4.2" ry="5" fill="${eye}" stroke="none"/>
        <circle cx="51" cy="45" r="1.4" fill="#ffffff" stroke="none"/>
        <circle cx="67" cy="45" r="1.4" fill="#ffffff" stroke="none"/>
      </g>
    `),

    // 6. Munak / Bongun (Payon Cave Jiangshi)
    munak: (uid, hat, robe, talisman, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#0f172a" stroke-width="2.3" stroke-linejoin="round">
        <path d="M30 98 L36 62 H84 L90 98 Z" fill="${robe}"/>
        <path d="M46 62 V98 M74 62 V98" stroke="${acc}" stroke-width="2"/>
        <rect x="14" y="68" width="22" height="10" rx="4" fill="#cbd5e1"/>
        <rect x="84" y="68" width="22" height="10" rx="4" fill="#cbd5e1"/>
        <circle cx="60" cy="48" r="20" fill="#e2e8f0"/>
        <path d="M34 36 Q60 16 86 36 Z" fill="${hat}"/>
        <circle cx="60" cy="18" r="5" fill="#ef4444"/>
        <rect x="53" y="28" width="14" height="24" rx="2" fill="${talisman}"/>
        <path d="M56 34 H64 M60 32 V48 M56 42 H64" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="48" cy="48" r="3" fill="#ef4444" stroke="none"/>
        <circle cx="72" cy="48" r="3" fill="#ef4444" stroke="none"/>
      </g>
    `),

    // 7. Nine Tail / Sohee (Payon Fox Spirit)
    sohee: (uid, fur, tailTip, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1e1b2e" stroke-width="2.2" stroke-linejoin="round">
        <path d="M56 76 Q14 70 16 40 Q32 48 44 68 Z" fill="${fur}"/>
        <path d="M64 76 Q106 70 104 40 Q88 48 76 68 Z" fill="${fur}"/>
        <path d="M48 84 Q12 96 18 72 Q34 74 48 80 Z" fill="${tailTip}"/>
        <path d="M72 84 Q108 96 102 72 Q86 74 72 80 Z" fill="${tailTip}"/>
        <polygon points="36,44 28,14 52,32" fill="${fur}"/>
        <polygon points="37,38 33,21 48,33" fill="${tailTip}" stroke="none"/>
        <polygon points="84,44 92,14 68,32" fill="${fur}"/>
        <polygon points="83,38 87,21 72,33" fill="${tailTip}" stroke="none"/>
        <path d="M34 46 Q60 28 86 46 L78 82 L60 94 L42 82 Z" fill="${fur}"/>
        <path d="M44 76 Q60 92 76 76 L60 94 Z" fill="#fef3c7" stroke="none"/>
        ${animeEyes(acc, true, 54)}
        <polygon points="57,67 63,67 60,71" fill="#1e1b2e" stroke="none"/>
      </g>
    `),

    // 8. Peco Peco / Grand Peco (Morroc Desert Bird)
    peco: (uid, feather, crest, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1c1917" stroke-width="2.3" stroke-linejoin="round">
        <polygon points="48,30 40,10 58,24 66,8 70,26 84,16 74,34" fill="${crest}"/>
        <ellipse cx="26" cy="70" rx="14" ry="18" fill="${feather}" transform="rotate(18 26 70)"/>
        <ellipse cx="94" cy="70" rx="14" ry="18" fill="${feather}" transform="rotate(-18 94 70)"/>
        <ellipse cx="60" cy="74" rx="28" ry="24" fill="${feather}"/>
        <circle cx="60" cy="46" r="20" fill="${feather}"/>
        <polygon points="50,52 70,52 60,68" fill="#f97316"/>
        <circle cx="49" cy="44" r="5" fill="#ffffff"/>
        <circle cx="50" cy="44" r="2.6" fill="#0f172a" stroke="none"/>
        <circle cx="71" cy="44" r="5" fill="#ffffff"/>
        <circle cx="70" cy="44" r="2.6" fill="#0f172a" stroke="none"/>
      </g>
    `),

    // 9. Orc Warrior / High Orc
    orc: (uid, skin, armor, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#0f172a" stroke-width="2.3" stroke-linejoin="round">
        <line x1="88" y1="22" x2="96" y2="96" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
        <path d="M90 24 Q112 24 110 46 Q98 48 88 40 Z" fill="#cbd5e1"/>
        <path d="M30 40 Q14 26 24 14 Q32 24 38 30 Z" fill="#fef3c7"/>
        <path d="M90 40 Q106 26 96 14 Q88 24 82 30 Z" fill="#fef3c7"/>
        <path d="M32 46 Q60 16 88 46 Z" fill="${armor}"/>
        <rect x="34" y="42" width="52" height="44" rx="14" fill="${skin}"/>
        <rect x="28" y="80" width="64" height="20" rx="8" fill="${armor}"/>
        <polygon points="44,78 48,65 53,78" fill="#fef9c3"/>
        <polygon points="67,78 72,65 76,78" fill="#fef9c3"/>
        ${animeEyes('#fde047', true, 54)}
      </g>
    `),

    // 10. Raydric / Abysmal Knight (Glast Heim Cursed Knight)
    raydric: (uid, armor, plume, eye, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#050814" stroke-width="2.3" stroke-linejoin="round">
        <path d="M56 18 Q84 6 94 28 Q78 24 64 28 Z" fill="${plume}"/>
        <polygon points="94,16 102,22 98,92 90,92" fill="#e2e8f0"/>
        <rect x="84" y="76" width="22" height="6" rx="2" fill="#fbbf24"/>
        <polygon points="16,66 36,56 36,92 20,96" fill="${armor}"/>
        <polygon points="104,66 84,56 84,92 100,96" fill="${armor}"/>
        <path d="M36 42 Q60 18 84 42 L80 80 L60 94 L40 80 Z" fill="${armor}"/>
        <polygon points="42,48 78,48 74,62 46,62" fill="#050814"/>
        <line x1="60" y1="62" x2="60" y2="88" stroke="${acc}" stroke-width="2.5"/>
        ${animeEyes(eye, true, 54)}
      </g>
    `),

    // 11. Deviruchi / Diabolic (Cute-Evil RO Imp)
    deviruchi: (uid, body, wing, eye, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#090414" stroke-width="2.3" stroke-linejoin="round">
        <path d="M34 58 L10 38 L16 68 L28 66 L22 78 L36 74 Z" fill="${wing}"/>
        <path d="M86 58 L110 38 L104 68 L92 66 L98 78 L84 74 Z" fill="${wing}"/>
        <path d="M74 88 Q98 94 96 78" fill="none" stroke="${body}" stroke-width="4" stroke-linecap="round"/>
        <polygon points="96,72 103,80 91,82" fill="${acc}"/>
        <path d="M40 36 Q28 16 44 18 Q44 26 48 32 Z" fill="${acc}"/>
        <path d="M80 36 Q92 16 76 18 Q76 26 72 32 Z" fill="${acc}"/>
        <circle cx="60" cy="58" r="26" fill="${body}"/>
        <path d="M44 80 L60 96 L76 80 Z" fill="${body}"/>
        ${animeEyes(eye, true, 55)}
        <path d="M48 70 Q60 77 72 70" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        <polygon points="51,71 54,77 57,72" fill="#ffffff" stroke="none"/>
        <polygon points="63,72 66,77 69,71" fill="#ffffff" stroke="none"/>
      </g>
    `),

    // 12. Clock / Alarm (Al De Baran Clock Tower)
    clock: (uid, brass, face, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1c1917" stroke-width="2.3" stroke-linejoin="round">
        <circle cx="34" cy="28" r="11" fill="${brass}"/>
        <circle cx="86" cy="28" r="11" fill="${brass}"/>
        <rect x="54" y="14" width="12" height="12" rx="3" fill="${brass}"/>
        <path d="M42 92 L34 104 M78 92 L86 104" stroke="${brass}" stroke-width="5" stroke-linecap="round"/>
        <circle cx="60" cy="62" r="34" fill="${brass}"/>
        <circle cx="60" cy="62" r="26" fill="${face}"/>
        <line x1="60" y1="62" x2="60" y2="42" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="60" y1="62" x2="76" y2="66" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="62" r="4" fill="${acc}"/>
        <circle cx="48" cy="54" r="3.5" fill="#dc2626" stroke="none"/>
        <circle cx="72" cy="54" r="3.5" fill="#dc2626" stroke="none"/>
      </g>
    `)
  };

  const RO_MVPS = {
    // 1. Baphomet (Curved Ram Horns + Giant Crescent Scythe)
    baphomet: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#09040e" stroke-width="2.4" stroke-linejoin="round">
        <line x1="16" y1="104" x2="96" y2="20" stroke="#78350f" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M88 18 Q116 24 106 58 Q96 38 78 30 Z" fill="#e2e8f0" stroke="${acc}" stroke-width="2"/>
        <path d="M42 36 C16 24 12 4 36 10 C48 14 48 26 42 32" fill="none" stroke="#d97706" stroke-width="8" stroke-linecap="round"/>
        <path d="M78 36 C104 24 108 4 84 10 C72 14 72 26 78 32" fill="none" stroke="#d97706" stroke-width="8" stroke-linecap="round"/>
        <path d="M32 42 Q60 22 88 42 L80 86 L60 102 L40 86 Z" fill="#27272a"/>
        <path d="M44 74 L60 98 L76 74 Z" fill="#18181b"/>
        <circle cx="60" cy="38" r="5" fill="${acc}" stroke="none"/>
        ${animeEyes('#ef4444', true, 54)}
      </g>
    `, true),

    // 2. Doppelganger (Geffen Dark Swordsman MVP)
    doppelganger: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#090410" stroke-width="2.3" stroke-linejoin="round">
        <polygon points="94,10 104,18 98,96 88,96" fill="#dc2626"/>
        <polygon points="96,14 101,18 96,86 92,86" fill="#fca5a5" stroke="none"/>
        <path d="M18 100 L30 46 Q60 26 90 46 L102 100 L78 90 L60 102 L42 90 Z" fill="#18181b"/>
        <path d="M28 54 L60 72 L92 54" fill="none" stroke="#ef4444" stroke-width="3.5"/>
        <path d="M34 46 L26 24 L44 30 L56 12 L68 28 L88 20 L84 46 Z" fill="#0f172a"/>
        <path d="M38 44 Q60 36 82 44 L76 74 L60 82 L44 74 Z" fill="#e2e8f0"/>
        ${animeEyes('#ef4444', true, 54)}
      </g>
    `, true),

    // 3. Moonlight Flower (Payon Nine-Tailed Fox Girl MVP)
    moonlight: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1e1b2e" stroke-width="2.2" stroke-linejoin="round">
        <circle cx="18" cy="34" r="7" fill="#38bdf8" stroke="none" opacity="0.8"/>
        <circle cx="102" cy="34" r="7" fill="#38bdf8" stroke="none" opacity="0.8"/>
        <path d="M60 78 Q10 74 14 44 Q32 52 50 70 Z" fill="#fbbf24"/>
        <path d="M60 78 Q110 74 106 44 Q88 52 70 70 Z" fill="#fbbf24"/>
        <polygon points="36,44 26,10 52,32" fill="#f59e0b"/>
        <polygon points="84,44 94,10 68,32" fill="#f59e0b"/>
        <circle cx="60" cy="54" r="24" fill="#fef3c7"/>
        <path d="M34 52 Q60 22 86 52 Q72 38 60 40 Q48 38 34 52 Z" fill="#fde047"/>
        <path d="M36 78 L60 98 L84 78 Z" fill="#dc2626"/>
        <circle cx="60" cy="82" r="6" fill="#fde047"/>
        ${animeEyes('#38bdf8', false, 56)}
      </g>
    `, true),

    // 4. Pharaoh / Osiris (Morroc Pyramid MVP)
    pharaoh: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#0f172a" stroke-width="2.3" stroke-linejoin="round">
        <path d="M22 92 L28 32 Q60 12 92 32 L98 92 L78 86 L74 44 H46 L42 86 Z" fill="#fbbf24"/>
        <path d="M27 46 H93 M25 60 H95 M24 74 H96" stroke="#1d4ed8" stroke-width="4.5"/>
        <circle cx="60" cy="22" r="7" fill="#fde047"/>
        <circle cx="60" cy="22" r="2.5" fill="#ef4444" stroke="none"/>
        <path d="M40 42 H80 L74 78 L60 88 L46 78 Z" fill="#1e293b"/>
        <rect x="55" y="84" width="10" height="16" rx="3" fill="#fbbf24"/>
        ${animeEyes('#22d3ee', true, 56)}
      </g>
    `, true),

    // 5. Orc Lord (Crowned Warlord MVP)
    orclord: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#090410" stroke-width="2.4" stroke-linejoin="round">
        <path d="M88 18 Q114 18 112 44 Q98 46 88 38 Z" fill="#ef4444"/>
        <line x1="88" y1="16" x2="96" y2="100" stroke="#fbbf24" stroke-width="5"/>
        <polygon points="34,34 42,10 52,26 60,8 68,26 78,10 86,34" fill="#fbbf24"/>
        <polygon points="14,72 36,60 36,96 18,98" fill="#7f1d1d"/>
        <polygon points="106,72 84,60 84,96 102,98" fill="#7f1d1d"/>
        <rect x="34" y="34" width="52" height="52" rx="14" fill="#15803d"/>
        <polygon points="40,80 46,62 52,80" fill="#fef9c3"/>
        <polygon points="68,80 74,62 80,80" fill="#fef9c3"/>
        ${animeEyes('#fde047', true, 50)}
      </g>
    `, true),

    // 6. Dark Lord (Glast Heim Lich King MVP)
    darklord: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#090312" stroke-width="2.4" stroke-linejoin="round">
        <path d="M16 74 Q12 42 32 48 Q26 24 44 34" fill="none" stroke="#a855f7" stroke-width="5" stroke-linecap="round"/>
        <path d="M104 74 Q108 42 88 48 Q94 24 76 34" fill="none" stroke="#a855f7" stroke-width="5" stroke-linecap="round"/>
        <path d="M22 102 L32 34 Q60 12 88 34 L98 102 L78 90 L60 104 L42 90 Z" fill="#1e1b4b"/>
        <polygon points="38,34 22,10 48,26" fill="#dc2626"/>
        <polygon points="82,34 98,10 72,26" fill="#dc2626"/>
        <path d="M40 42 Q60 28 80 42 L76 74 L60 84 L44 74 Z" fill="#e2e8f0"/>
        <path d="M50 74 V82 M56 75 V83 M64 75 V83 M70 74 V82" stroke="#0f172a" stroke-width="2"/>
        ${animeEyes('#ef4444', true, 54)}
      </g>
    `, true),

    // 7. Valkyrie Randgris (Juno Radiant Winged MVP)
    valkyrie: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#0f172a" stroke-width="2.2" stroke-linejoin="round">
        <ellipse cx="60" cy="18" rx="22" ry="6" fill="none" stroke="#fde047" stroke-width="3.2"/>
        <path d="M40 56 L8 28 L16 56 L10 76 L38 74 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2"/>
        <path d="M80 56 L112 28 L104 56 L110 76 L82 74 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2"/>
        <polygon points="36,42 22,22 46,34" fill="#fbbf24"/>
        <polygon points="84,42 98,22 74,34" fill="#fbbf24"/>
        <path d="M38 42 Q60 24 82 42 L78 78 L60 94 L42 78 Z" fill="#f8fafc"/>
        <path d="M42 72 L60 94 L78 72 Z" fill="#0284c7"/>
        ${animeEyes('#38bdf8', true, 54)}
      </g>
    `, true),

    // 8. Memory of Thanatos (6 Spectral Swords + Phantom Armor)
    thanatos: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#090414" stroke-width="2.3" stroke-linejoin="round">
        <polygon points="10,24 42,46 36,56 8,36" fill="#c084fc"/>
        <polygon points="110,24 78,46 84,56 112,36" fill="#c084fc"/>
        <polygon points="12,80 42,64 38,76 16,92" fill="#f472b6"/>
        <polygon points="108,80 78,64 82,76 104,92" fill="#f472b6"/>
        <polygon points="60,16 86,44 78,92 60,104 42,92 34,44" fill="#0f172a" stroke="#e2e8f0" stroke-width="2.4"/>
        <polygon points="44,44 76,44 70,74 60,84 50,74" fill="#f8fafc"/>
        ${animeEyes('#dc2626', true, 56)}
      </g>
    `, true),

    // 9. Angeling / Archangeling (Giant Winged Holy Poring MVP)
    angeling: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <g stroke="#1e1b2e" stroke-width="2.3" stroke-linejoin="round">
        <ellipse cx="60" cy="18" rx="20" ry="6" fill="none" stroke="#fde047" stroke-width="3.5"/>
        <path d="M32 62 L8 38 L14 66 L10 80 L34 78 Z" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
        <path d="M88 62 L112 38 L106 66 L110 80 L86 78 Z" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
        <path d="M60 28 C66 42 94 56 94 76 C94 94 78 100 60 100 C42 100 26 94 26 76 C26 56 54 42 60 28 Z" fill="#f472b6"/>
        <ellipse cx="45" cy="58" rx="7" ry="10" fill="#ffffff" stroke="none" opacity="0.7" transform="rotate(-22 45 58)"/>
        <circle cx="48" cy="70" r="4.2" fill="#1e1b2e" stroke="none"/>
        <circle cx="72" cy="70" r="4.2" fill="#1e1b2e" stroke="none"/>
        <path d="M53 78 Q56.5 82 60 78 Q63.5 82 67 78" fill="none" stroke="#1e1b2e" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    `, true),

    // 10. Satan Morroc (Grand Apex Demon Lord of Midgard)
    satanmorroc: (uid, bg1, bg2, acc) => wrapSvg(uid, bg1, bg2, acc, `
      <circle cx="60" cy="60" r="46" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="14 6"/>
      <g stroke="#09030c" stroke-width="2.4" stroke-linejoin="round">
        <polygon points="4,18 44,44 36,66 10,50" fill="#dc2626"/>
        <polygon points="116,18 76,44 84,66 110,50" fill="#dc2626"/>
        <polygon points="8,76 42,66 36,96 14,96" fill="#f59e0b"/>
        <polygon points="112,76 78,66 84,96 106,96" fill="#f59e0b"/>
        <polygon points="38,34 16,6 50,24" fill="#fbbf24"/>
        <polygon points="82,34 104,6 70,24" fill="#fbbf24"/>
        <polygon points="34,30 86,30 84,82 60,104 36,82" fill="#18181b" stroke="#fbbf24" stroke-width="2.4"/>
        <polygon points="60,64 74,80 60,96 46,80" fill="#ef4444" stroke="#fde047" stroke-width="2"/>
        <circle cx="60" cy="80" r="5" fill="#fef08a" stroke="none"/>
        ${animeEyes('#fde047', true, 48)}
      </g>
    `, true)
  };

  /* Lore-accurate Ragnarok Online Monsters & MVP Bosses for Zones 1–8 & Zone 50 */
  const ENEMIES = {
    // Zone 1: Prontera Core — Poring, Lunatic, MVP Baphomet
    z1_s1: () => RO_MONSTERS.poring('z1s1', '#f472b6', '#db2777', '#831843', '#1a0613', '#f472b6'),
    z1_s2: () => RO_MONSTERS.lunatic('z1s2', '#f8fafc', '#fda4af', '#0369a1', '#08172e', '#38bdf8'),
    z1_boss: () => RO_MVPS.baphomet('z1b', '#7f1d1d', '#0f0510', '#fbbf24'),

    // Zone 2: Geffen Net-Tower — Chonchon, Whisper, MVP Doppelganger
    z2_s1: () => RO_MONSTERS.chonchon('z2s1', '#38bdf8', '#bae6fd', '#0c4a6e', '#071326', '#38bdf8'),
    z2_s2: () => RO_MONSTERS.whisper('z2s2', '#f1f5f9', '#a855f7', '#4c1d95', '#100724', '#c084fc'),
    z2_boss: () => RO_MVPS.doppelganger('z2b', '#881337', '#0f0510', '#ef4444'),

    // Zone 3: Payon Identity Vault — Munak, Nine Tail, MVP Moonlight Flower
    z3_s1: () => RO_MONSTERS.munak('z3s1', '#1e3a8a', '#312e81', '#fde047', '#1e3a8a', '#090d26', '#60a5fa'),
    z3_s2: () => RO_MONSTERS.sohee('z3s2', '#f97316', '#fde047', '#7c2d12', '#170a05', '#fb923c'),
    z3_boss: () => RO_MVPS.moonlight('z3b', '#92400e', '#1a0b04', '#fbbf24'),

    // Zone 4: Morroc CLI Desert — Drops (Orange Poring), Peco Peco, MVP Pharaoh
    z4_s1: () => RO_MONSTERS.poring('z4s1', '#fb923c', '#ea580c', '#7c2d12', '#1c0904', '#fb923c'),
    z4_s2: () => RO_MONSTERS.peco('z4s2', '#fbbf24', '#ef4444', '#78350f', '#1c0f04', '#fbbf24'),
    z4_boss: () => RO_MVPS.pharaoh('z4b', '#1e3a8a', '#0b0a1f', '#fbbf24'),

    // Zone 5: Al De Baran Defense — Clock, Orc Warrior, MVP Orc Lord
    z5_s1: () => RO_MONSTERS.clock('z5s1', '#d97706', '#fef3c7', '#78350f', '#170b04', '#fbbf24'),
    z5_s2: () => RO_MONSTERS.orc('z5s2', '#22c55e', '#475569', '#065f46', '#051a14', '#34d399'),
    z5_boss: () => RO_MVPS.orclord('z5b', '#7f1d1d', '#140808', '#fbbf24'),

    // Zone 6: Glast Heim Blackout — Raydric, Deviruchi, MVP Dark Lord
    z6_s1: () => RO_MONSTERS.raydric('z6s1', '#334155', '#ef4444', '#f87171', '#312e81', '#090717', '#818cf8'),
    z6_s2: () => RO_MONSTERS.deviruchi('z6s2', '#3b0764', '#581c87', '#fde047', '#4c1d95', '#100724', '#c084fc'),
    z6_boss: () => RO_MVPS.darklord('z6b', '#4c1d95', '#090314', '#ef4444'),

    // Zone 7: Juno Cloud Sky-City — Marin (Blue Poring), Spore, MVP Valkyrie Randgris
    z7_s1: () => RO_MONSTERS.poring('z7s1', '#38bdf8', '#0284c7', '#0c4a6e', '#071326', '#38bdf8'),
    z7_s2: () => RO_MONSTERS.spore('z7s2', '#ef4444', '#ffffff', '#0e7490', '#06202b', '#22d3ee'),
    z7_boss: () => RO_MVPS.valkyrie('z7b', '#0369a1', '#071326', '#fde047'),

    // Zone 8: Thanatos Forensics Spire — Poison Spore, Abysmal Knight, MVP Memory of Thanatos
    z8_s1: () => RO_MONSTERS.spore('z8s1', '#9333ea', '#a3e635', '#4c1d95', '#100724', '#c084fc'),
    z8_s2: () => RO_MONSTERS.raydric('z8s2', '#1e1b4b', '#a855f7', '#38bdf8', '#1e1b4b', '#070614', '#c084fc'),
    z8_boss: () => RO_MVPS.thanatos('z8b', '#581c87', '#090314', '#f472b6'),

    // Zone 50: Grand Apex Final Boss — Satan Morroc
    z50_boss: () => RO_MVPS.satanmorroc('z50b', '#92400e', '#090314', '#fbbf24')
  };

  /* ==================== PROCEDURAL JAPANESE ANIME-CYBER GENERATOR (ZONES 9–50) ==================== */
  const PALETTES = [
    { bg1: '#0c4a6e', bg2: '#071326', acc: '#38bdf8', sub: '#34d399', eye: '#38bdf8' },
    { bg1: '#065f46', bg2: '#051a14', acc: '#34d399', sub: '#fde047', eye: '#a3e635' },
    { bg1: '#1e3a8a', bg2: '#090d26', acc: '#60a5fa', sub: '#c084fc', eye: '#38bdf8' },
    { bg1: '#4c1d95', bg2: '#100724', acc: '#c084fc', sub: '#f472b6', eye: '#f472b6' },
    { bg1: '#831843', bg2: '#1a0613', acc: '#f472b6', sub: '#38bdf8', eye: '#fde047' },
    { bg1: '#7c2d12', bg2: '#170a05', acc: '#fb923c', sub: '#fde047', eye: '#fde047' },
    { bg1: '#0e7490', bg2: '#06202b', acc: '#22d3ee', sub: '#fbbf24', eye: '#22d3ee' },
    { bg1: '#7f1d1d', bg2: '#140509', acc: '#f87171', sub: '#fbbf24', eye: '#fde047' },
    { bg1: '#365314', bg2: '#0e1706', acc: '#a3e635', sub: '#38bdf8', eye: '#bef264' },
    { bg1: '#78350f', bg2: '#1c0f06', acc: '#fbbf24', sub: '#38bdf8', eye: '#fbbf24' }
  ];

  function buildProceduralZone(num, tag) {
    const p = PALETTES[(num * 3) % PALETTES.length];
    const uid = `z${num}`;
    const label = (tag || `Z${num}`).slice(0, 7);

    if (num === 50) {
      return wrapSvg(uid, '#92400e', '#0c0519', '#fbbf24', `
        <circle cx="60" cy="54" r="36" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="10 5"/>
        <g stroke="#0c0519" stroke-width="2.2" stroke-linejoin="round">
          <polygon points="24,96 34,40 46,56 60,14 74,56 86,40 96,96" fill="#fbbf24"/>
          <polygon points="38,96 46,52 60,26 74,52 82,96" fill="#0f172a"/>
          <polygon points="60,44 70,58 60,72 50,58" fill="#38bdf8" stroke="#fde047" stroke-width="1.8"/>
          <rect x="30" y="80" width="60" height="16" rx="5" fill="#0f172a" stroke="#fbbf24"/>
        </g>
        <text x="60" y="92" text-anchor="middle" fill="#fde047" font-family="monospace" font-weight="900" font-size="10">APEX-50</text>
      `, true);
    }

    const arch = num % 6;
    let shape = '';
    if (arch === 0) {
      // Twin Server Citadel + Tech Badge
      shape = `<g stroke="#081020" stroke-width="2.2" stroke-linejoin="round">
        <rect x="18" y="42" width="22" height="54" rx="4" fill="#1e293b"/>
        <rect x="80" y="42" width="22" height="54" rx="4" fill="#1e293b"/>
        <polygon points="60,14 82,38 82,96 38,96 38,38" fill="#e2e8f0"/>
        <rect x="22" y="50" width="14" height="4" fill="${p.acc}" stroke="none"/>
        <rect x="22" y="60" width="14" height="4" fill="${p.sub}" stroke="none"/>
        <rect x="84" y="50" width="14" height="4" fill="${p.acc}" stroke="none"/>
        <rect x="84" y="60" width="14" height="4" fill="${p.sub}" stroke="none"/>
        <polygon points="60,40 70,52 60,64 50,52" fill="${p.acc}"/>
      </g>`;
    } else if (arch === 1) {
      // Floating Cyber Orbital Spire
      shape = `<ellipse cx="60" cy="48" rx="44" ry="13" fill="none" stroke="${p.acc}" stroke-width="2.4" transform="rotate(-14 60 48)"/>
      <g stroke="#081020" stroke-width="2.2" stroke-linejoin="round">
        <polygon points="60,12 76,42 80,94 40,94 44,42" fill="#1e293b"/>
        <polygon points="60,12 76,42 60,42" fill="${p.acc}"/>
        <circle cx="60" cy="54" r="10" fill="${p.sub}"/>
        <circle cx="22" cy="56" r="4.5" fill="${p.sub}"/>
        <circle cx="98" cy="40" r="4.5" fill="${p.acc}"/>
      </g>`;
    } else if (arch === 2) {
      // Japanese Cyber Torii Gate + Core
      shape = `<g stroke="#081020" stroke-width="2.2" stroke-linejoin="round">
        <path d="M16 32 Q60 20 104 32 L100 42 Q60 32 20 42 Z" fill="${p.acc}"/>
        <rect x="26" y="45" width="68" height="7" rx="2" fill="${p.sub}"/>
        <rect x="32" y="38" width="10" height="58" rx="2" fill="#1e293b"/>
        <rect x="78" y="38" width="10" height="58" rx="2" fill="#1e293b"/>
        <rect x="46" y="54" width="28" height="24" rx="6" fill="#0f172a" stroke="${p.acc}" stroke-width="2"/>
        <circle cx="60" cy="66" r="6" fill="${p.acc}" stroke="none"/>
      </g>`;
    } else if (arch === 3) {
      // Cyber Terminal Pyramid Fortress
      shape = `<circle cx="88" cy="26" r="12" fill="${p.sub}" opacity="0.8"/>
      <g stroke="#081020" stroke-width="2.2" stroke-linejoin="round">
        <polygon points="60,16 100,94 20,94" fill="#1e293b"/>
        <rect x="26" y="40" width="68" height="36" rx="7" fill="#020617" stroke="${p.acc}" stroke-width="2.2"/>
        <polyline points="36,52 46,58 36,64" fill="none" stroke="${p.sub}" stroke-width="3" stroke-linecap="round"/>
        <line x1="52" y1="64" x2="78" y2="64" stroke="${p.acc}" stroke-width="3" stroke-linecap="round"/>
      </g>`;
    } else if (arch === 4) {
      // Winged Cyber Shield Bastion
      shape = `<g stroke="#081020" stroke-width="2.2" stroke-linejoin="round">
        <polygon points="12,40 32,32 32,62 16,56" fill="${p.sub}"/>
        <polygon points="108,40 88,32 88,62 104,56" fill="${p.sub}"/>
        <path d="M60 16 L90 28 V54 C90 74 76 86 60 94 C44 86 30 74 30 54 V28 Z" fill="#0f172a" stroke="${p.acc}" stroke-width="2.5"/>
        <polygon points="60,30 74,48 60,66 46,48" fill="${p.acc}"/>
      </g>`;
    } else {
      // Floating Cloud Container Sky-Island
      shape = `<g stroke="#081020" stroke-width="2.2" stroke-linejoin="round">
        <polygon points="24,68 96,68 78,90 60,98 42,90" fill="#1e293b"/>
        <path d="M22 68 Q18 52 34 48 Q42 32 60 36 Q78 32 86 48 Q102 52 98 68 Z" fill="#e0f2fe"/>
        <rect x="36" y="44" width="15" height="12" rx="2.5" fill="${p.acc}"/>
        <rect x="53" y="44" width="15" height="12" rx="2.5" fill="${p.sub}"/>
        <rect x="70" y="44" width="15" height="12" rx="2.5" fill="${p.acc}"/>
      </g>`;
    }

    return wrapSvg(uid, p.bg1, p.bg2, p.acc, `
      ${shape}
      <rect x="26" y="84" width="68" height="17" rx="5" fill="#020617" stroke="${p.acc}" stroke-width="1.6"/>
      <text x="60" y="96" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-weight="900" font-size="10">${label}</text>
    `);
  }

  function buildProceduralEnemy(num, slot) {
    const isBoss = slot === 'boss';
    const seed = num * 7 + (slot === 's1' ? 1 : slot === 's2' ? 3 : 5);
    const p = PALETTES[seed % PALETTES.length];
    const uid = `z${num}_${slot}`;

    if (isBoss) {
      const mvpKeys = [
        'baphomet', 'doppelganger', 'moonlight', 'pharaoh', 'orclord',
        'darklord', 'valkyrie', 'thanatos', 'angeling', 'satanmorroc'
      ];
      const key = mvpKeys[num % mvpKeys.length];
      return RO_MVPS[key](uid, p.bg1, p.bg2, p.acc);
    }

    // Cycle across all 12 classic Ragnarok Online monsters with elemental color variants
    const mIdx = seed % 12;
    if (mIdx === 0) return RO_MONSTERS.poring(uid, p.acc, p.bg1, p.bg1, p.bg2, p.acc);
    if (mIdx === 1) return RO_MONSTERS.lunatic(uid, '#f8fafc', p.acc, p.bg1, p.bg2, p.acc);
    if (mIdx === 2) return RO_MONSTERS.chonchon(uid, p.acc, p.sub, p.bg1, p.bg2, p.acc);
    if (mIdx === 3) return RO_MONSTERS.spore(uid, p.acc, p.sub, p.bg1, p.bg2, p.acc);
    if (mIdx === 4) return RO_MONSTERS.whisper(uid, '#e2e8f0', p.eye, p.bg1, p.bg2, p.acc);
    if (mIdx === 5) return RO_MONSTERS.munak(uid, p.bg1, '#1e293b', '#fde047', p.bg1, p.bg2, p.acc);
    if (mIdx === 6) return RO_MONSTERS.sohee(uid, p.acc, p.sub, p.bg1, p.bg2, p.acc);
    if (mIdx === 7) return RO_MONSTERS.peco(uid, p.sub, p.acc, p.bg1, p.bg2, p.acc);
    if (mIdx === 8) return RO_MONSTERS.orc(uid, p.sub, '#334155', p.bg1, p.bg2, p.acc);
    if (mIdx === 9) return RO_MONSTERS.raydric(uid, '#1e293b', p.acc, p.eye, p.bg1, p.bg2, p.acc);
    if (mIdx === 10) return RO_MONSTERS.deviruchi(uid, p.bg1, '#1e1b4b', p.eye, p.bg1, p.bg2, p.acc);
    return RO_MONSTERS.clock(uid, p.sub, '#fef3c7', p.bg1, p.bg2, p.acc);
  }

  function getZoneIcon(zoneId, tag) {
    if (ZONES[zoneId]) return ZONES[zoneId]();
    const m = String(zoneId).match(/^z(\d+)$/);
    if (m) return buildProceduralZone(Number(m[1]), tag);
    return ZONES.z1();
  }

  function getEnemySprite(stageId) {
    if (ENEMIES[stageId]) return ENEMIES[stageId]();
    const m = String(stageId).match(/^z(\d+)_(s1|s2|boss)$/);
    if (m) return buildProceduralEnemy(Number(m[1]), m[2]);
    return ENEMIES.z1_s1();
  }

  return {
    getZoneIcon,
    getEnemySprite
  };
})();
