// Stok görseller (Unsplash) ve örnek videolar. Prod'da CDN/Bunny Stream'e taşınır.
const u = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70`

export const img = {
  // konu görselleri
  ledger: u('1554224155-6726b3ff858f', 1400, 1000),
  calculator: u('1554224154-26032ffc0d07', 1200, 900),
  desk: u('1460925895917-afdab827c52f', 1200, 900),
  notebook: u('1501504905252-473c47e087f8', 1200, 900),
  camera: u('1516035069371-29a1b244cc32', 1400, 1000),
  phoneShoot: u('1502920917128-1aa500764cbd', 1200, 900),
  filmSet: u('1492691527719-9d1e07e534b4', 1200, 900),
  coins: u('1579621970563-ebec7560ff3e', 1400, 1000),
  chart: u('1611974789855-9c2a0a7236a3', 1200, 900),
  study: u('1522202176988-66273c2fd55f', 1200, 900),
  writing: u('1434030216411-0b793f4b4173', 1200, 900),
}

const p = (id: string) => u(id, 480, 640)
export const people = {
  w1: p('1544005313-94ddf0286df2'),
  m1: p('1507003211169-0a1dd7228f2d'),
  w2: p('1494790108377-be9c29b29330'),
  m2: p('1500648767791-00dcc994a43e'),
  w3: p('1438761681033-6461ffad8d80'),
  m3: p('1472099645785-5658abf4ff4e'),
  w4: p('1580489944761-15a19d654956'),
  m4: p('1506794778202-cad84cf45f1d'),
  w5: p('1534528741775-53994a69daeb'),
  w6: p('1517841905240-472988babdf9'),
  w7: p('1554151228-14d9def656e4'),
}

export const video = {
  a: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  b: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
}
