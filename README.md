# Sabbarah_Website_Upgrade

الموقع الرسمي المطوَّر لصبّارة AI — https://sabbarahai.com/

Upgraded official website of SABBARAH AI for the existing domain **https://sabbarahai.com/**.

This project is a careful upgrade of the original site
(`D:\Sabbarh\site\website github\sabbarahai.com-main` — kept untouched as a permanent backup/reference).
The design, structure, layout, branding, content, and identity are preserved exactly.
Only two things were added on top:

1. **Living green glow system** — subtle, premium, always-moving light.
2. **Sabbarah cactus assistant** — the signature bilingual website assistant.

## Structure

```
Sabbarah_Website_Upgrade/
├── index.html            Same page structure & content as the original site
├── CNAME                 sabbarahai.com (domain unchanged)
├── README.md
├── assets/               Brand assets (copied from the original project)
├── css/
│   ├── main.css          Base styles — preserved from the original site
│   ├── glow.css          Living glow system (all new animation layers)
│   └── assistant.css     Cactus assistant styles & animations
└── js/
    ├── main.js           Base behavior — preserved (nav, booking, reveal)
    ├── glow.js           Particle canvas + cursor-following card glow
    └── assistant.js      Cactus character, chat UI, bilingual logic, knowledge base
```

## Living glow system (`css/glow.css` + `js/glow.js`)

Official Sabbarah colors only — Deep Jade `#0E5C4A`, Sabbarah Green `#1FD9A0`,
Mint AI `#6BF5CE`, Desert Gold `#C9A227` (kept under 5% usage).

- Drifting, breathing ambient orbs + soft aurora veil behind the whole page
- Floating light particles (canvas, ~95% green family / ~5% gold, pauses on hidden tab)
- Rotating hero orbits with luminous markers, breathing logo, pulsing gold nodes
- Slow mint shimmer across the green hero headline
- Cursor-following glow on all cards, governance cards, steps, and FAQ items
- Traveling border light around the feature and CTA panels
- Flowing gradient line across the process steps
- Animated hairline under the header when scrolled; gentle primary-button glow pulse
- Everything is fully disabled under `prefers-reduced-motion`

## Sabbarah cactus assistant (`js/assistant.js` + `css/assistant.css`)

Not a generic chat bubble — a brand-built cactus character 🌵 that:

- Rises from the bottom corner of the screen, waves, and greets the visitor
- Blinks, bobs, and re-waves occasionally; opens the assistant panel on click
- Speaks **Arabic and English**, auto-detecting the visitor's language per message
- Answers **only Sabbarah topics**: services, products, portfolio, pricing,
  process, security/governance, website pages, booking, and contact info
- Politely refuses anything unrelated (politics, religion, coding help,
  general knowledge, …) in the visitor's language
- 100% client-side (no external services), with quick-suggestion chips,
  typing indicator, and keyboard/Escape support

## Run locally

It is a fully static site — open `index.html` directly, or:

```
cd D:\Sabbarh\site\Sabbarah_Website_Upgrade
python -m http.server 8080
```

then visit http://localhost:8080

## Deployment

Deploy the folder contents as-is (GitHub Pages compatible — `CNAME` already
points to `sabbarahai.com`). No build step required.
