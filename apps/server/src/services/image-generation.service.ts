import { createCanvas } from 'canvas'

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const B = {
  bgDeep:    '#0d0825',
  bgPanel:   '#130f32',
  bgNavy:    '#0c0d1a',
  bgFb:      '#13102a',
  accent:    '#7c3aed',
  accentMid: '#6d28d9',
  accentSoft:'#a78bfa',
  textWhite: '#ffffff',
  textLav:   '#c4b5fd',
  textMuted: '#7c6faa',
  divider:   'rgba(124,58,237,0.3)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rr(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function wrapText(ctx: any, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

function drawDots(ctx: any, x: number, y: number, w: number, h: number, gap = 30, alpha = 0.07) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`
  for (let dy = y + gap / 2; dy < y + h; dy += gap) {
    for (let dx = x + gap / 2; dx < x + w; dx += gap) {
      ctx.beginPath(); ctx.arc(dx, dy, 1.2, 0, Math.PI * 2); ctx.fill()
    }
  }
}

// Fixed: alpha=0.40 default (was 0.18), size=180 calls (was 120), clearer pages
function drawBookLogo(ctx: any, cx: number, cy: number, size: number, alpha = 0.40) {
  const s = size
  const bw = s * 0.42
  const bh = s * 0.65   // taller pages
  const bx = cx - bw
  const by = cy - bh / 2
  const r = s * 0.06

  ctx.shadowColor = `rgba(124,58,237,0.5)`
  ctx.shadowBlur = 30

  // Left page — slightly brighter
  rr(ctx, bx - bw, by, bw - 3, bh, r)
  ctx.fillStyle = `rgba(124,58,237,${alpha + 0.15})`
  ctx.fill()

  // Page lines on left page
  ctx.strokeStyle = `rgba(196,181,253,${alpha * 0.8})`
  ctx.lineWidth = 1.5
  for (let i = 1; i <= 5; i++) {
    const ly = by + bh * (i / 6.5)
    ctx.beginPath()
    ctx.moveTo(bx - bw + s * 0.08, ly)
    ctx.lineTo(bx - 3 - s * 0.04, ly)
    ctx.stroke()
  }

  // Right page
  rr(ctx, bx + 3, by, bw - 3, bh, r)
  ctx.fillStyle = `rgba(124,58,237,${alpha})`
  ctx.fill()

  // Page lines on right page
  for (let i = 1; i <= 5; i++) {
    const ly = by + bh * (i / 6.5)
    ctx.beginPath()
    ctx.moveTo(bx + 3 + s * 0.04, ly)
    ctx.lineTo(bx + bw - s * 0.08, ly)
    ctx.stroke()
  }

  // Spine
  ctx.shadowBlur = 0
  ctx.fillStyle = `rgba(167,139,250,${alpha + 0.15})`
  rr(ctx, bx - 3, by - 2, 6, bh + 4, 3)
  ctx.fill()
}

function drawBrandPanel(ctx: any, px: number, W: number, H: number) {
  ctx.fillStyle = B.bgPanel
  ctx.fillRect(px, 0, W - px, H)

  // Vertical separator with gradient
  const sg = ctx.createLinearGradient(px, 0, px, H)
  sg.addColorStop(0, 'transparent')
  sg.addColorStop(0.3, B.divider)
  sg.addColorStop(0.7, B.divider)
  sg.addColorStop(1, 'transparent')
  ctx.strokeStyle = sg; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()

  const cx = px + (W - px) / 2
  const cy = H / 2

  drawDots(ctx, px + 1, 0, W - px - 1, H, 28, 0.05)

  // Concentric rings
  ctx.strokeStyle = `rgba(124,58,237,0.1)`; ctx.lineWidth = 1
  for (let r = 60; r <= 200; r += 45) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.strokeStyle = `rgba(124,58,237,0.28)`; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.stroke()

  // Book icon — FIXED: size 180, alpha 0.40
  drawBookLogo(ctx, cx, cy, 180, 0.40)

  // Wordmark
  ctx.fillStyle = `rgba(167,139,250,0.60)`
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  ctx.fillText('P A P E R B O O K', cx, H - 52)

  ctx.fillStyle = `rgba(124,110,170,0.45)`
  ctx.font = '11px sans-serif'
  ctx.fillText('School Management Platform', cx, H - 34)

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog Cover — 1200×630 — editorial two-panel
// ─────────────────────────────────────────────────────────────────────────────
export async function generateBlogCoverImage(post: {
  title: string; category?: string | null; excerpt?: string | null
}): Promise<Buffer> {
  const W = 1200, H = 630
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = B.bgDeep; ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 600)
  glow.addColorStop(0, 'rgba(124,58,237,0.13)'); glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)

  drawDots(ctx, 0, 0, 800, H, 30, 0.055)

  const SPLIT = 780
  drawBrandPanel(ctx, SPLIT, W, H)

  // Top accent bar
  const tb = ctx.createLinearGradient(0, 0, SPLIT, 0)
  tb.addColorStop(0, B.accent); tb.addColorStop(1, B.accentMid)
  ctx.fillStyle = tb; ctx.fillRect(0, 0, SPLIT, 5)

  const PAD = 64
  let y = 60

  // Category badge
  const cat = (post.category || 'General').toUpperCase()
  ctx.font = 'bold 11px sans-serif'
  const catW = ctx.measureText(cat).width + 28
  rr(ctx, PAD, y, catW, 28, 14)
  ctx.fillStyle = 'rgba(124,58,237,0.25)'; ctx.fill()
  rr(ctx, PAD, y, catW, 28, 14)
  ctx.strokeStyle = 'rgba(167,139,250,0.5)'; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = B.accentSoft; ctx.textBaseline = 'middle'
  ctx.fillText(cat, PAD + 14, y + 14)
  ctx.textBaseline = 'alphabetic'

  y += 56
  ctx.fillStyle = B.textWhite; ctx.font = 'bold 52px sans-serif'
  const tl = wrapText(ctx, post.title, SPLIT - PAD - 40)
  tl.slice(0, 3).forEach((line, i) => ctx.fillText(line, PAD, y + i * 72))
  y += Math.min(tl.length, 3) * 72 + 28

  if (post.excerpt) {
    ctx.fillStyle = B.textLav; ctx.font = '22px sans-serif'
    wrapText(ctx, post.excerpt, SPLIT - PAD - 60).slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, PAD, y + i * 34))
  }

  // Bottom branding
  const BY = H - 52
  ctx.strokeStyle = 'rgba(124,58,237,0.25)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, BY - 16); ctx.lineTo(SPLIT - 40, BY - 16); ctx.stroke()

  ctx.fillStyle = B.accent; ctx.font = 'bold 18px sans-serif'
  ctx.fillText('paperbook.app', PAD, BY + 4)
  ctx.fillStyle = B.textMuted
  ctx.beginPath(); ctx.arc(PAD + 136, BY - 3, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.font = '16px sans-serif'
  ctx.fillText('#1 School Management Platform', PAD + 148, BY + 4)

  return canvas.toBuffer('image/png')
}

// ─────────────────────────────────────────────────────────────────────────────
// LinkedIn Post — 1200×627 — professional single-panel, navy
// ─────────────────────────────────────────────────────────────────────────────
export async function generateLinkedInPostImage(post: {
  title: string; category?: string | null; excerpt?: string | null
}): Promise<Buffer> {
  const W = 1200, H = 627
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Background: near-black navy
  ctx.fillStyle = B.bgNavy; ctx.fillRect(0, 0, W, H)

  // Subtle gradient wash top
  const topg = ctx.createLinearGradient(0, 0, 0, H * 0.6)
  topg.addColorStop(0, 'rgba(124,58,237,0.08)'); topg.addColorStop(1, 'transparent')
  ctx.fillStyle = topg; ctx.fillRect(0, 0, W, H)

  // Very fine dot grid
  drawDots(ctx, 0, 0, W, H, 36, 0.04)

  // Left accent strip (6px, full height, bright purple)
  ctx.fillStyle = B.accent; ctx.fillRect(0, 0, 6, H)

  const PAD = 80

  // Top-left brand badge
  const badgeY = 44
  rr(ctx, PAD, badgeY, 38, 38, 8)
  ctx.fillStyle = 'rgba(124,58,237,0.25)'; ctx.fill()
  rr(ctx, PAD, badgeY, 38, 38, 8)
  ctx.strokeStyle = 'rgba(167,139,250,0.4)'; ctx.lineWidth = 1; ctx.stroke()
  drawBookLogo(ctx, PAD + 19, badgeY + 19, 28, 0.70)

  ctx.fillStyle = 'rgba(196,181,253,0.80)'
  ctx.font = 'bold 14px sans-serif'; ctx.textBaseline = 'middle'
  ctx.fillText('PAPERBOOK', PAD + 48, badgeY + 12)
  ctx.fillStyle = B.textMuted; ctx.font = '11px sans-serif'
  ctx.fillText('School Management Platform', PAD + 48, badgeY + 27)
  ctx.textBaseline = 'alphabetic'

  // Category chip
  if (post.category) {
    const cat = post.category.toUpperCase()
    ctx.font = 'bold 11px sans-serif'
    const cw = ctx.measureText(cat).width + 24
    rr(ctx, PAD, 112, cw, 26, 13)
    ctx.fillStyle = `rgba(124,58,237,0.3)`; ctx.fill()
    ctx.fillStyle = B.accentSoft; ctx.textBaseline = 'middle'
    ctx.fillText(cat, PAD + 12, 125)
    ctx.textBaseline = 'alphabetic'
  }

  // Large title
  ctx.fillStyle = B.textWhite; ctx.font = 'bold 66px sans-serif'
  const tl = wrapText(ctx, post.title, W - PAD - 120)
  const titleTop = post.category ? 160 : 130
  tl.slice(0, 2).forEach((line, i) => ctx.fillText(line, PAD, titleTop + i * 86))

  // Excerpt
  if (post.excerpt) {
    const ey = titleTop + Math.min(tl.length, 2) * 86 + 24
    ctx.fillStyle = B.textLav; ctx.font = '24px sans-serif'
    wrapText(ctx, post.excerpt, W - PAD - 120).slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, PAD, ey + i * 36))
  }

  // Large "P" watermark — bottom-right, very faint
  ctx.fillStyle = 'rgba(124,58,237,0.05)'
  ctx.font = `bold 320px sans-serif`
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'
  ctx.fillText('P', W - 20, H + 10)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  // Bottom strip
  ctx.fillStyle = 'rgba(8,6,20,0.90)'
  ctx.fillRect(0, H - 58, W, 58)
  ctx.strokeStyle = `rgba(124,58,237,0.35)`; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H - 58); ctx.lineTo(W, H - 58); ctx.stroke()

  ctx.fillStyle = B.accent; ctx.font = 'bold 16px sans-serif'; ctx.textBaseline = 'middle'
  ctx.fillText('📌 Read on paperbook.app', PAD, H - 29)
  ctx.textAlign = 'right'; ctx.fillStyle = B.textMuted; ctx.font = '13px sans-serif'
  ctx.fillText('School Management · #EdTech · #India', W - PAD, H - 29)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  return canvas.toBuffer('image/png')
}

// ─────────────────────────────────────────────────────────────────────────────
// Twitter / X Post — 1200×675 — bold & punchy
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTwitterPostImage(post: {
  title: string; category?: string | null; excerpt?: string | null
}): Promise<Buffer> {
  const W = 1200, H = 675
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Diagonal gradient bg
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1a0845'); bg.addColorStop(0.5, B.bgDeep); bg.addColorStop(1, '#0a0620')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  drawDots(ctx, 0, 0, W, H, 34, 0.05)

  // Diagonal stripe decoration — top-right corner
  ctx.save()
  ctx.translate(W, 0)
  ctx.rotate(Math.PI / 4)
  ctx.strokeStyle = `rgba(124,58,237,0.12)`; ctx.lineWidth = 28
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-200 + i * 60, -50); ctx.lineTo(-200 + i * 60, 260); ctx.stroke()
  }
  ctx.restore()

  // Top brand bar
  ctx.fillStyle = 'rgba(10,6,30,0.80)'
  ctx.fillRect(0, 0, W, 52)
  ctx.strokeStyle = `rgba(124,58,237,0.3)`; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(W, 52); ctx.stroke()

  ctx.fillStyle = 'rgba(167,139,250,0.65)'
  ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('P A P E R B O O K  ·  School Management Platform  ·  paperbook.app', W / 2, 26)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  // Title accent lines
  const titleTop = H * 0.28
  ctx.strokeStyle = `rgba(124,58,237,0.45)`; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(60, titleTop - 24); ctx.lineTo(W - 60, titleTop - 24); ctx.stroke()

  // Title — large, centered
  ctx.fillStyle = B.textWhite; ctx.font = 'bold 58px sans-serif'
  ctx.textAlign = 'center'
  const tl = wrapText(ctx, post.title, W - 160)
  tl.slice(0, 3).forEach((line, i) => ctx.fillText(line, W / 2, titleTop + i * 78))

  ctx.strokeStyle = `rgba(124,58,237,0.35)`; ctx.lineWidth = 2
  const afterTitle = titleTop + Math.min(tl.length, 3) * 78
  ctx.beginPath(); ctx.moveTo(60, afterTitle + 12); ctx.lineTo(W - 60, afterTitle + 12); ctx.stroke()

  // Excerpt
  if (post.excerpt) {
    ctx.fillStyle = B.textLav; ctx.font = '22px sans-serif'
    wrapText(ctx, post.excerpt, W - 200).slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, W / 2, afterTitle + 40 + i * 34))
  }

  ctx.textAlign = 'left'

  // Bottom
  ctx.fillStyle = 'rgba(8,6,20,0.85)'
  ctx.fillRect(0, H - 52, W, 52)
  ctx.strokeStyle = `rgba(124,58,237,0.3)`; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H - 52); ctx.lineTo(W, H - 52); ctx.stroke()

  ctx.fillStyle = B.textMuted; ctx.font = '14px sans-serif'; ctx.textBaseline = 'middle'
  ctx.fillText('#SchoolManagement  #EdTech  #India  #SchoolERP', 60, H - 26)
  ctx.textAlign = 'right'; ctx.fillStyle = B.accent; ctx.font = 'bold 14px sans-serif'
  ctx.fillText('paperbook.app', W - 60, H - 26)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  return canvas.toBuffer('image/png')
}

// ─────────────────────────────────────────────────────────────────────────────
// Facebook Post — 1200×628 — clean & friendly
// ─────────────────────────────────────────────────────────────────────────────
export async function generateFacebookPostImage(post: {
  title: string; category?: string | null; excerpt?: string | null
}): Promise<Buffer> {
  const W = 1200, H = 628
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = B.bgFb; ctx.fillRect(0, 0, W, H)

  // Warm glow — bottom-right
  const glow = ctx.createRadialGradient(W, H, 0, W * 0.8, H * 0.8, 500)
  glow.addColorStop(0, 'rgba(109,40,217,0.12)'); glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)

  drawDots(ctx, 0, 0, W, H - 72, 32, 0.05)

  // Overlapping circles — decorative, bottom-right
  const circles = [
    { x: W - 80, y: H - 130, r: 180, a: 0.05 },
    { x: W - 10, y: H - 160, r: 130, a: 0.07 },
    { x: W - 150, y: H - 80, r: 100, a: 0.06 },
  ]
  circles.forEach(({ x, y, r, a }) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(124,58,237,${a})`; ctx.lineWidth = 40; ctx.stroke()
  })

  const PAD = 64

  // Top pills row: category left, brand right
  if (post.category) {
    const cat = post.category.toUpperCase()
    ctx.font = 'bold 11px sans-serif'
    const cw = ctx.measureText(cat).width + 24
    rr(ctx, PAD, 44, cw, 26, 13)
    ctx.fillStyle = `rgba(124,58,237,0.3)`; ctx.fill()
    ctx.strokeStyle = 'rgba(167,139,250,0.4)'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = B.accentSoft; ctx.textBaseline = 'middle'
    ctx.fillText(cat, PAD + 12, 57)
    ctx.textBaseline = 'alphabetic'
  }

  // Brand pill — top right
  const brand = 'PAPERBOOK'
  ctx.font = 'bold 11px sans-serif'
  const bw = ctx.measureText(brand).width + 24
  rr(ctx, W - PAD - bw, 44, bw, 26, 13)
  ctx.fillStyle = `rgba(124,58,237,0.2)`; ctx.fill()
  ctx.strokeStyle = 'rgba(167,139,250,0.3)'; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = 'rgba(167,139,250,0.6)'; ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'; ctx.fillText(brand, W - PAD - bw / 2, 57)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  // Title
  ctx.fillStyle = B.textWhite; ctx.font = 'bold 54px sans-serif'
  const tl = wrapText(ctx, post.title, W - PAD * 2 - 80)
  tl.slice(0, 3).forEach((line, i) => ctx.fillText(line, PAD, 118 + i * 72))

  // Excerpt
  if (post.excerpt) {
    const ey = 118 + Math.min(tl.length, 3) * 72 + 16
    ctx.fillStyle = B.textLav; ctx.font = '21px sans-serif'
    wrapText(ctx, post.excerpt, W - PAD * 2 - 80).slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, PAD, ey + i * 32))
  }

  // Solid purple bottom bar
  ctx.fillStyle = '#4c1d95'
  ctx.fillRect(0, H - 72, W, 72)

  // Book icon in bottom bar
  drawBookLogo(ctx, PAD + 20, H - 36, 32, 0.80)

  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif'; ctx.textBaseline = 'middle'
  ctx.fillText('paperbook.app', PAD + 48, H - 40)
  ctx.fillStyle = 'rgba(196,181,253,0.70)'; ctx.font = '13px sans-serif'
  ctx.fillText('School ERP for India', PAD + 48, H - 22)
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(196,181,253,0.45)'; ctx.font = '12px sans-serif'
  ctx.fillText('School Management · EdTech · India', W - PAD, H - 30)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  return canvas.toBuffer('image/png')
}

// ─────────────────────────────────────────────────────────────────────────────
// Instagram Post — 1080×1080 — square, centered, radial
// ─────────────────────────────────────────────────────────────────────────────
export async function generateInstagramPostImage(post: {
  title: string; category?: string | null; excerpt?: string | null
}): Promise<Buffer> {
  const W = 1080, H = 1080
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Radial gradient bg
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.75)
  bg.addColorStop(0, '#2d1b69'); bg.addColorStop(0.5, '#130f32'); bg.addColorStop(1, B.bgDeep)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Concentric rings (radar-style)
  for (let r = 80; r <= 480; r += 80) {
    ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(124,58,237,${0.12 - r * 0.00018})`; ctx.lineWidth = 1.5; ctx.stroke()
  }
  // Inner bright ring
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 80, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(167,139,250,0.25)`; ctx.lineWidth = 2; ctx.stroke()

  drawDots(ctx, 0, 0, W, H, 40, 0.04)

  // Top brand bar
  ctx.fillStyle = 'rgba(10,6,30,0.70)'; ctx.fillRect(0, 0, W, 70)
  ctx.strokeStyle = `rgba(124,58,237,0.35)`; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(W, 70); ctx.stroke()

  ctx.fillStyle = 'rgba(167,139,250,0.70)'
  ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('P A P E R B O O K', W / 2, 35)
  ctx.textBaseline = 'alphabetic'

  // Book icon center (subtle)
  drawBookLogo(ctx, W / 2, H / 2, 120, 0.12)

  // Vertical center: title
  const titleFontSize = 68
  ctx.fillStyle = B.textWhite; ctx.font = `bold ${titleFontSize}px sans-serif`
  const tl = wrapText(ctx, post.title, W - 140)
  const totalTitleH = Math.min(tl.length, 3) * (titleFontSize + 16)
  const titleStartY = H / 2 - totalTitleH / 2 + 30

  tl.slice(0, 3).forEach((line, i) => {
    ctx.textAlign = 'center'
    ctx.fillText(line, W / 2, titleStartY + i * (titleFontSize + 16))
  })

  // Category below title
  const afterTitle = titleStartY + Math.min(tl.length, 3) * (titleFontSize + 16) + 20
  if (post.category) {
    const cat = post.category.toUpperCase()
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'
    const cw = ctx.measureText(cat).width + 32
    rr(ctx, W / 2 - cw / 2, afterTitle, cw, 30, 15)
    ctx.fillStyle = `rgba(124,58,237,0.35)`; ctx.fill()
    ctx.strokeStyle = 'rgba(167,139,250,0.5)'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = B.accentSoft; ctx.textBaseline = 'middle'
    ctx.fillText(cat, W / 2, afterTitle + 15)
    ctx.textBaseline = 'alphabetic'
  }

  // Excerpt near bottom
  if (post.excerpt) {
    ctx.fillStyle = B.textLav; ctx.font = '22px sans-serif'; ctx.textAlign = 'center'
    wrapText(ctx, post.excerpt, W - 200).slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, W / 2, H - 140 + i * 32))
  }

  // Bottom brand bar
  ctx.fillStyle = 'rgba(8,6,20,0.80)'; ctx.fillRect(0, H - 72, W, 72)
  ctx.strokeStyle = `rgba(124,58,237,0.35)`; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H - 72); ctx.lineTo(W, H - 72); ctx.stroke()

  ctx.fillStyle = B.accent; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('paperbook.app', W / 2, H - 36)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'

  return canvas.toBuffer('image/png')
}

// Legacy export for backward compat — routes that call generateSocialPostImage directly
export async function generateSocialPostImage(platform: string, title: string, excerpt: string): Promise<Buffer> {
  const post = { title, excerpt }
  if (platform === 'instagram') return generateInstagramPostImage(post)
  if (platform === 'twitter')   return generateTwitterPostImage(post)
  if (platform === 'facebook')  return generateFacebookPostImage(post)
  return generateLinkedInPostImage(post)
}
