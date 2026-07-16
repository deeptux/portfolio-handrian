// Cyberpunk placeholder project catalogue. Edit values here to change what
// renders in the projects list panel and the terminal-deck screen preview.

export const PROJECTS = [
  {
    id: 'neon-drift',
    title: 'NEON DRIFT',
    tagline: 'Realtime shader-driven racing HUD',
    year: '2087.11',
    role: 'Creative Technologist',
    tags: ['WebGL', 'GLSL', 'React Three Fiber'],
    accent: '#00f0ff',
    color: 'cyan',
    description:
      'A high-frequency HUD overlay for autonomous street-racers streaming through Neo-Kowloon. Custom vertex shaders morph a Voronoi terrain in real time, blending odometry telemetry with weathered chromatic aberration for that mid-90s arcade decay.',
    highlights: [
      'Custom GLSL Voronoi field @ 120fps on integrated GPUs',
      'Latency budget: <14ms end-to-end telemetry render',
      'Deployed on 4 mobile network operators, 11 city zones',
    ],
    url: 'https://handrian.space/neon-drift',
    screen: [
      '> boot://neon-drift/hud.exe',
      '> loading vector maps ................ [ok]',
      '> attaching telemetry stream ......... [ok]',
      '> compiling shaders/voronoi.glsl ..... [ok]',
      '> render latency ..................... 11.2ms',
      '> status ............................. LIVE',
    ],
  },
  {
    id: 'ghost-signal',
    title: 'GHOST SIGNAL',
    tagline: 'AI-augmented pirate radio deck',
    year: '2086.07',
    role: 'Product Engineer',
    tags: ['Next.js', 'WebAudio', 'Realtime'],
    accent: '#ff0055',
    color: 'magenta',
    description:
      'A distributed pirate-broadcast board — anonymised transmitters ride a lattice of relays. Signal decays are visualised as a live phosphor scope. The audience becomes the aerial.',
    highlights: [
      '340k concurrent listeners at peak drop',
      'Zero-trust relay handoff (WebRTC + ed25519)',
      'Community-authored bumpers, editorially curated',
    ],
    url: 'https://handrian.space/ghost-signal',
    screen: [
      '> ghost-signal /relay handshake',
      '> node[0x4a9] verified .............. TRUST',
      '> tuning 88.7 MHz .................... LOCKED',
      '> peers now on-air ................... 12,481',
      '> uplink ............................. STABLE',
    ],
  },
  {
    id: 'blackout-atlas',
    title: 'BLACKOUT ATLAS',
    tagline: 'City-scale data cartography',
    year: '2086.02',
    role: 'Lead Frontend',
    tags: ['D3', 'Mapbox', 'Motion'],
    accent: '#8D00FF',
    color: 'violet',
    description:
      'Interactive atlas mapping district-wide power outages, drone patrols, and off-grid safehouses. Rendered as a hand-drawn CRT overlay across satellite panorama tiles.',
    highlights: [
      '9 million geo-events indexed nightly',
      'Timeline scrubber traverses 6 years of history',
      'Referenced by 3 investigative newsrooms',
    ],
    url: 'https://handrian.space/blackout-atlas',
    screen: [
      '> loading atlas/districts.geojson',
      '> events streamed .................... 9,124,332',
      '> patrols overlay .................... ON',
      '> safehouse markers .................. 218 nearby',
      '> pan/zoom ready',
    ],
  },
  {
    id: 'chrome-oracle',
    title: 'CHROME ORACLE',
    tagline: 'Cybernetic tarot & divination engine',
    year: '2085.10',
    role: 'Creative Director',
    tags: ['Three.js', 'AI', 'Storytelling'],
    accent: '#00f0ff',
    color: 'cyan',
    description:
      'A ritual interface for a modern oracle deck. Cards are rendered as holographic prisms; every draw is a bespoke shader coreography narrated in the second person.',
    highlights: [
      '78 hand-authored card scenes',
      'Bespoke narrator voice model (opt-in)',
      'Featured in 4 design annuals & 1 gallery show',
    ],
    url: 'https://handrian.space/chrome-oracle',
    screen: [
      '> chrome-oracle.session init',
      '> draw ............................... THE HACKER',
      '> confidence ......................... 0.913',
      '> narrative branch ................... 42-C',
      '> sequence rendered .................. 1.3s',
    ],
  },
  {
    id: 'vaporwave-terminal',
    title: 'VAPORWAVE TERMINAL',
    tagline: 'Nostalgic OS emulator in the browser',
    year: '2085.03',
    role: 'Solo Build',
    tags: ['Emulator', 'Canvas', 'Retro'],
    accent: '#E5FF00',
    color: 'yellow',
    description:
      'A love letter to 90s workstation UIs. A working desktop, file manager, doom-adjacent screensaver, and a hidden note from 20 years ago. Runs entirely in-browser.',
    highlights: [
      'Full window manager under 42kb gz',
      '11 easter eggs, 1 solved so far',
      'Frontpaged twice on the community boards',
    ],
    url: 'https://handrian.space/vaporwave-terminal',
    screen: [
      '> vpr-term v0.9.4 booting',
      '> mounting /home/handrian ............ ok',
      '> window manager ..................... online',
      '> screensaver idle timeout ........... 60s',
      '> tip: try typing "help"',
    ],
  },
];

export const IDLE_SCREEN = [
  '> handrian.space // terminal.deck',
  '> awaiting input ....................... IDLE',
  '> uplink ............................... STABLE',
  '> select a project from the list',
  '> or press [A] for /about',
];

export const ABOUT_CONTENT = {
  greeting: 'Hey — I\'m Handrian.',
  role: 'Creative Technologist · Cyber-frontend Engineer',
  bio: [
    'I build immersive, shader-driven interfaces at the intersection of the web and the imagined city. My work lives between shipping product code and staging small worlds — Three.js, GLSL, motion design, and stubborn attention to detail.',
    'Currently pushing pixels for record labels, indie studios, and a handful of night-market operators who prefer to remain unlisted. Available for select engagements in Q1 and beyond.',
  ],
  stats: [
    { label: 'ships in production', value: '31' },
    { label: 'shaders written', value: '2.4k' },
    { label: 'cities patched into', value: '9' },
    { label: 'coffee vessels docked', value: '∞' },
  ],
  contact: 'hello@handrian.space',
  socials: [
    { label: 'GitHub', href: 'https://github.com/handrian', id: 'gh' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/handrian', id: 'li' },
    { label: 'X / Twitter', href: 'https://twitter.com/handrian', id: 'tw' },
    { label: 'Resume', href: '#resume', id: 'cv' },
  ],
};
