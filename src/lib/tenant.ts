import type { Brand } from '../data/types'

/**
 * Çoklu marka çözümlemesi. Canlıda her marka kendi domaininden açılır
 * (defter.academy, kadraj.studio ...). Aynı uygulama Host'a bakarak markayı seçer.
 * Lokal/demo ortamda eşleşme olmazsa platform ana menüsü gösterilir.
 */
export function resolveBrandFromHost(brands: Brand[], host = typeof window !== 'undefined' ? window.location.hostname : ''): Brand | null {
  const h = host.replace(/^www\./, '').toLowerCase()
  return brands.find((b) => b.active && b.domain.toLowerCase() === h) ?? null
}
