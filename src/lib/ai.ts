import type { Lesson, Question } from '../data/types'

/**
 * MVP'de yapay zekâ çağrısı simüle edilir.
 * Prod akışı: video yüklenir → Whisper ile transkript → LLM'e transkript + ders başlığı
 * gönderilir → JSON soru seti döner → DB'ye kaydedilir (lesson_id başına TEK kayıt).
 * Öğrenciler yalnızca onaylı soruları DB'den okur; öğrenci başına model çağrısı yoktur.
 */

const bank: Record<string, Omit<Question, 'id' | 'approved'>[]> = {
  default: [
    {
      text: 'Bu derste anlatılan yöntemin ilk adımı aşağıdakilerden hangisidir?',
      options: ['Mevcut durumu kayıt altına almak', 'Doğrudan sonuca geçmek', 'Rakipleri incelemek', 'Bütçeyi artırmak'],
      answer: 0,
      explanation: 'Videonun 01:12 civarında anlatıldığı gibi süreç, mevcut durumun yazılı hale getirilmesiyle başlar.',
    },
    {
      text: 'Eğitmenin “en sık yapılan hata” olarak gösterdiği durum hangisidir?',
      options: ['Kontrol listesi kullanmak', 'Ara adımları atlamak', 'Not almak', 'Örnek üzerinden çalışmak'],
      answer: 1,
      explanation: 'Ara adımlar atlandığında sonuç doğru görünse bile tekrar üretilemez hale gelir.',
    },
    {
      text: 'Dersin sonunda verilen ödev hangi çıktıyı istemektedir?',
      options: ['Tek sayfalık özet', 'Video kaydı', 'Kendi örneğinizle doldurulmuş şablon', 'Sunum dosyası'],
      answer: 2,
      explanation: 'Ekli dokümandaki şablon kendi verilerinizle doldurulup bir sonraki derse getirilir.',
    },
    {
      text: 'Anlatılan konuda “doğru” kabul edilen ifade hangisidir?',
      options: [
        'Her durumda aynı oran uygulanır',
        'Koşullara göre yöntem değişebilir, ancak kayıt mantığı sabittir',
        'Kayıt tutmak isteğe bağlıdır',
        'Sonuç tek seferde kesinleşir',
      ],
      answer: 1,
      explanation: 'Eğitmen yöntemin esnek, kayıt disiplininin ise sabit olduğunu vurgular.',
    },
    {
      text: 'Videoda verilen örnekte kullanılan kontrol sorusu nedir?',
      options: ['“Bunu kim onayladı?”', '“Toplamlar tutuyor mu?”', '“Ne zaman bitecek?”', '“Maliyeti kim üstlenir?”'],
      answer: 1,
      explanation: 'Her adım sonunda toplamların tutarlılığı kontrol edilir.',
    },
  ],
  muh: [
    {
      text: 'Çift taraflı kayıt ilkesine göre her işlem için hangisi doğrudur?',
      options: [
        'Yalnızca borç kaydı yapılır',
        'Borç ve alacak toplamları eşit olmalıdır',
        'Alacak her zaman borçtan büyüktür',
        'Kayıt ay sonunda topluca yapılır',
      ],
      answer: 1,
      explanation: 'Her yevmiye kaydında borç tarafı toplamı, alacak tarafı toplamına eşittir.',
    },
    {
      text: '100 Kasa hesabı hangi grupta yer alır?',
      options: ['Dönen varlıklar', 'Duran varlıklar', 'Kısa vadeli yabancı kaynaklar', 'Özkaynaklar'],
      answer: 0,
      explanation: '1 ile başlayan hesaplar dönen varlıklardır; kasa en likit kalemdir.',
    },
    {
      text: 'Peşin mal satışında kasa hesabı nasıl çalışır?',
      options: ['Alacaklandırılır', 'Borçlandırılır', 'Kullanılmaz', 'Kapatılır'],
      answer: 1,
      explanation: 'Kasaya para girdiği için 100 Kasa hesabı borçlandırılır.',
    },
    {
      text: 'KDV dahil 1.200 TL’lik satışta (%20 KDV) matrah kaç TL’dir?',
      options: ['960 TL', '1.000 TL', '1.040 TL', '1.200 TL'],
      answer: 1,
      explanation: '1.200 / 1,20 = 1.000 TL matrah, 200 TL KDV.',
    },
  ],
  kad: [
    {
      text: 'Telefonla çekimde pozlamayı sabitlemek için önerilen yöntem hangisidir?',
      options: ['Otomatik modda bırakmak', 'Ekrana basılı tutup AE/AF kilidi kullanmak', 'Flaşı açmak', 'Zoom yapmak'],
      answer: 1,
      explanation: 'AE/AF kilidi, çekim boyunca ışığın ve odağın sabit kalmasını sağlar.',
    },
    {
      text: '25 fps çekimde doğal hareket bulanıklığı için önerilen enstantane nedir?',
      options: ['1/25', '1/50', '1/500', '1/2000'],
      answer: 1,
      explanation: '180° kuralı: enstantane ≈ 1 / (2 × fps).',
    },
    {
      text: 'Üçler kuralında konu nereye yerleştirilir?',
      options: ['Tam merkeze', 'Kesişim noktalarından birine', 'Kadrajın dışına', 'En alt kenara'],
      answer: 1,
      explanation: 'Çizgilerin kesişim noktaları göz için doğal odak noktalarıdır.',
    },
    {
      text: 'Reels kurgusunda ilk 2 saniyenin amacı nedir?',
      options: ['Logo göstermek', 'İzleyiciyi durdurmak (hook)', 'Müzik açmak', 'Altyazı denemek'],
      answer: 1,
      explanation: 'Akışta kaydırmayı durduran şey ilk karedeki merak unsurudur.',
    },
  ],
  fin: [
    {
      text: 'Acil durum fonu için genellikle önerilen büyüklük nedir?',
      options: ['1 haftalık gider', '3–6 aylık zorunlu gider', '1 yıllık gelir', 'Maaşın %5’i'],
      answer: 1,
      explanation: 'Gelir kesintisine karşı 3–6 aylık zorunlu gider yeterli tampon sağlar.',
    },
    {
      text: 'Bileşik getiride sonucu en çok etkileyen değişken hangisidir?',
      options: ['Hesap türü', 'Süre', 'Banka şubesi', 'Para birimi sembolü'],
      answer: 1,
      explanation: 'Getiri, getiri üzerine işlediği için zaman en güçlü çarpandır.',
    },
    {
      text: 'Bütçede “önce kendine öde” ilkesi neyi ifade eder?',
      options: [
        'Maaş gelir gelmez birikimi ayırmak',
        'Ay sonunda kalanı biriktirmek',
        'Kredi kartını önce ödemek',
        'Harcamaları ertelemek',
      ],
      answer: 0,
      explanation: 'Birikim, harcamadan arta kalan değil, ilk ayrılan kalemdir.',
    },
    {
      text: 'Çeşitlendirmenin temel amacı nedir?',
      options: ['Getiriyi garanti etmek', 'Tek bir varlığın riskini azaltmak', 'Vergiyi sıfırlamak', 'İşlem sayısını artırmak'],
      answer: 1,
      explanation: 'Farklı davranan varlıklar portföy dalgalanmasını yumuşatır.',
    },
  ],
}

let seq = 0
const rid = () => `q_${Date.now().toString(36)}_${(seq++).toString(36)}`

export function generateQuestions(lesson: Lesson, topic: string): { questions: Question[]; tokens: number; cost: number } {
  const pool = bank[topic] ?? bank.default
  const seed = lesson.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const count = 4
  const picked: Question[] = []
  for (let i = 0; i < count; i++) {
    const src = pool[(seed + i) % pool.length]
    if (picked.some((q) => q.text === src.text)) continue
    picked.push({ ...src, options: [...src.options], id: rid(), approved: false })
  }
  // transkript + çıktı token tahmini: dakika başı ~180 kelime
  const tokens = Math.round((lesson.duration / 60) * 260 + 900)
  const cost = +(tokens * 0.000012 * 38).toFixed(2) // ≈ TL
  return { questions: picked, tokens, cost }
}

export const topicOf = (brandSlug: string) =>
  brandSlug.startsWith('defter') ? 'muh' : brandSlug.startsWith('kadraj') ? 'kad' : brandSlug.startsWith('kumbara') ? 'fin' : 'default'
