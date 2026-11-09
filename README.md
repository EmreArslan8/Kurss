# Kurss — çok markalı online eğitim & video kurs satış platformu (MVP)

Tek altyapıdan birden fazla eğitim markası: her marka kendi domaini, satış sayfası, fiyatı ve eğitimleriyle çalışır; hepsi tek yönetim panelinden yönetilir.

> Bu sürüm **tıklanabilir bir MVP**'dir: tüm akışlar çalışır, veriler mock'tur ve tarayıcıda (localStorage) saklanır. Ödeme, fatura ve yapay zekâ çağrıları simüle edilir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ (SPA — vercel.json rewrite hazır)
```

Ana sayfadaki demo hesaplara tıklayarak her panele tek tıkla girebilirsin. "Demo verisini sıfırla" ile başlangıç verisine dönülür.

## İlandaki maddelerin karşılığı

| # | İstenen | MVP'de |
|---|---------|--------|
| 1 | Düzenlenebilir landing page | `/:marka` — Headline, sub-headline, VSL, videolu yorumlar, yazılı yorumlar, paket & satın alma, SSS. Hepsi `Yönetim → Markalar → Düzenle` ekranından kodsuz değişir, sağda canlı önizleme. `*yıldız*` ile vurgulu kelime. VSL için YouTube / Vimeo / mp4 bağlantısı. |
| 2 | PayTR + e-Fatura/e-Arşiv | `/:marka/odeme/:paket` — bireysel (e-Arşiv) / kurumsal (e-Fatura, VKN), taksit seçimi, PayTR iFrame simülasyonu. Onayda sipariş + fatura no oluşur, eğitim otomatik öğrenci hesabına tanımlanır, kullanıcı yoksa açılır. Sonu `0000` olan kart reddedilir. |
| 3 | Öğretmen paneli | Video yükleme (simüle), ders başlık/açıklama, PDF/Excel/ZIP doküman ekleme, bölüm/ders ekleme, AI sorularını inceleme-düzenleme-onaylama. |
| 4 | Öğrenci paneli | Satın alınan eğitimler, bölümlere ayrılmış dersler, ders altı dokümanlar, video sonu test + açıklamalı geri bildirim, tamamlama ve ilerleme takibi. |
| 5 | AI soru sistemi | Video **bir kez** analiz edilir → taslak → eğitmen onayı → tüm öğrencilere aynı set. Analiz edilmiş derste buton bir daha çıkmaz; öğrenci tarafında hiç model çağrısı yok. `Yönetim → Yapay zekâ maliyeti` her çalıştırmanın token/TL kaydını gösterir. |
| 6 | Yönetici & çoklu marka | Marka bazlı filtreli ciro/satış özeti, sipariş-fatura listesi (CSV, iade), kullanıcı/rol yönetimi, eğitim-eğitmen ataması, yeni marka + domain ekleme, marka bazlı paket/fiyat/içerik. |

## Klasör yapısı

```
src/
  data/       types.ts (veri modeli) · seed.ts (mock veri) · media.ts (stok görsel/video)
  lib/        store.tsx (durum + aksiyonlar) · ai.ts (soru üretimi simülasyonu) · tenant.ts (domain → marka)
  components/ ui.tsx (görsel, video, ikon…) · Shell.tsx (panel iskeleti)
  pages/      public/ (hub, landing, ödeme) · student/ · teacher/ · admin/
```

## Canlıya geçiş için önerilen mimari

- **Uygulama:** Next.js (App Router) + PostgreSQL (Prisma). Middleware `Host` başlığından `brand_id` çözer — `src/lib/tenant.ts` bunun karşılığı. Tüm tablolarda `brand_id`; yeni marka = DB kaydı + DNS CNAME, yeni kod yok.
- **Video:** Bunny Stream / Cloudflare Stream (imzalı URL, HLS, indirme koruması).
- **Ödeme:** PayTR iFrame API → `merchant_oid` ile sipariş; `callback` URL'inde hash doğrulama, sonra kayıt + fatura kuyruğu. Marka başına ayrı mağaza bilgisi desteklenir.
- **Fatura:** GİB entegratörü (Paraşüt / Uyumsoft / Logo vb.) API'si; ödeme onayında kuyruk işi ile e-Arşiv veya (VKN varsa) e-Fatura, iadede iptal.
- **Yapay zekâ:** Yüklemede tek seferlik iş: Whisper ile transkript → Claude ile JSON formatında soru seti → `lesson_questions` tablosu (`status: draft`). Eğitmen onayıyla `published`. Öğrenciler yalnızca DB'den okur; video değişmedikçe yeniden çalışmaz (`lesson.video_hash` kontrolü).
