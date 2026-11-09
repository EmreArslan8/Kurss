import type { AppState, Brand, Course, Enrollment, Lesson, Order, Package, Section, User } from './types'
import { img, people, video } from './media'
import { generateQuestions, topicOf } from '../lib/ai'

const days = (n: number, h = 10) => {
  const d = new Date('2026-11-09T00:00:00')
  d.setDate(d.getDate() - n)
  d.setHours(h, (n * 17) % 60)
  return d.toISOString()
}

/* ---------------- Markalar ---------------- */

const brands: Brand[] = [
  {
    id: 'b_defter',
    slug: 'defter',
    name: 'Defter',
    domain: 'defter.academy',
    accent: '#1f6b4a',
    accentSoft: '#dfeee4',
    monogram: 'D',
    tagline: 'Uygulamalı ön muhasebe okulu',
    active: true,
    invoiceTitle: 'Defter Eğitim Teknolojileri A.Ş.',
    taxNo: '2910384471',
    landing: {
      eyebrow: 'Sıfırdan · 9 hafta · Logo & Excel uygulamalı',
      headline: 'Muhasebeyi ezberleyerek değil, *fiş keserek* öğren.',
      subheadline:
        'Gerçek bir şirketin 3 aylık evrakını baştan sona işliyorsun. Kursun sonunda elinde bir mizan, bir beyanname taslağı ve iş görüşmesinde gösterebileceğin bir dosya oluyor.',
      vslUrl: video.a,
      vslPoster: img.ledger,
      vslCaption: '6 dk · Eğitmen Murat Koç programı anlatıyor',
      heroImage: img.calculator,
      ctaLabel: 'Kayıt ol, bugün başla',
      guarantee: '14 gün içinde, ilk 3 dersten sonra vazgeçersen ücretin tamamı iade.',
      stats: [
        { value: '4.812', label: 'mezun' },
        { value: '%71', label: '6 ay içinde işe giren' },
        { value: '96', label: 'video ders' },
      ],
      videoTestimonials: [
        { id: 'vt1', name: 'Zeynep A.', role: 'Ön muhasebe uzmanı, İzmir', poster: people.w1, videoUrl: video.a, quote: 'Mülakatta mizanımı açtım, orada bitti.' },
        { id: 'vt2', name: 'Hakan T.', role: 'Esnaf, kendi defterini tutuyor', poster: people.m1, videoUrl: video.a, quote: 'Mali müşavire giden param yarıya indi.' },
        { id: 'vt3', name: 'Elif S.', role: 'Üniversite 3. sınıf', poster: people.w2, videoUrl: video.a, quote: 'Okulda anlamadığım her şey burada oturdu.' },
        { id: 'vt4', name: 'Can D.', role: 'Kariyer değiştirdi, eski satışçı', poster: people.m2, videoUrl: video.a, quote: '34 yaşında yeni meslek. Pişman değilim.' },
      ],
      textTestimonials: [
        { id: 'tt1', name: 'Ayşe Karaca', role: 'Muhasebe asistanı', avatar: people.w3, rating: 5, text: 'Hiçbir kursta fatura, irsaliye, banka dekontu bu kadar gerçek değildi. Her hafta bir klasör evrak geliyor ve sen işliyorsun.' },
        { id: 'tt2', name: 'Serkan Öz', role: 'KOBİ sahibi', avatar: people.m3, rating: 5, text: 'Murat Hoca’nın KDV dersini iki kez izledim. İlk defa beyannamemin ne dediğini anladım.' },
        { id: 'tt3', name: 'Derya Kılıç', role: 'Yeni mezun', avatar: people.w4, rating: 4, text: 'Video sonu testler can sıkıcı gibi geliyor ama beni en çok onlar geliştirdi. Yanlış yaptığın yerin açıklaması geliyor.' },
        { id: 'tt4', name: 'Oğuz Erdem', role: 'Lojistik firması', avatar: people.m4, rating: 5, text: 'Ekibimden üç kişiyi kaydettim. Kurumsal fatura sorunsuz geldi.' },
      ],
      faq: [
        { id: 'f1', q: 'Hiç muhasebe bilgim yok, takip edebilir miyim?', a: 'Evet. İlk bölüm “borç-alacak nedir”den başlar. Matematik olarak dört işlem yeterli.' },
        { id: 'f2', q: 'Eğitime ne kadar süre erişebilirim?', a: 'Satın aldığın paket boyunca ve sonrasında 12 ay. Güncellenen dersler de dahil.' },
        { id: 'f3', q: 'Fatura kesiliyor mu?', a: 'Ödeme tamamlandığı anda e-Arşiv faturan e-postana gelir. Şirket adına alıyorsan vergi numaranı girmen yeterli, e-Fatura olarak düzenlenir.' },
        { id: 'f4', q: 'Taksit yapabilir miyim?', a: 'Tüm kredi kartlarına 6 taksite kadar seçenek var. Ödeme PayTR güvencesiyle alınır.' },
        { id: 'f5', q: 'Sertifika veriliyor mu?', a: 'Tüm dersleri ve testleri tamamladığında doğrulanabilir bir katılım belgesi oluşturulur.' },
      ],
    },
  },
  {
    id: 'b_kadraj',
    slug: 'kadraj',
    name: 'Kadraj',
    domain: 'kadraj.studio',
    accent: '#d2461e',
    accentSoft: '#fbe3d8',
    monogram: 'K',
    tagline: 'Telefonla profesyonel video',
    active: true,
    invoiceTitle: 'Defter Eğitim Teknolojileri A.Ş.',
    taxNo: '2910384471',
    landing: {
      eyebrow: 'Mobil çekim & kurgu · 6 hafta',
      headline: 'Cebindeki telefon, *ilk kameran* olsun.',
      subheadline:
        'Işık, ses, kadraj ve kurgu. Pahalı ekipman almadan; markalar için reklam, kendin için içerik üretmeyi öğren. Her bölümün sonunda bir çekim ödevi var.',
      vslUrl: video.a,
      vslPoster: img.camera,
      vslCaption: '4 dk · Ece Demir, iPhone ile çektiği reklamı parçalara ayırıyor',
      heroImage: img.phoneShoot,
      ctaLabel: 'Çekmeye başla',
      guarantee: 'İlk hafta beğenmezsen tek tıkla iade.',
      stats: [
        { value: '2.140', label: 'öğrenci' },
        { value: '38', label: 'çekim ödevi' },
        { value: '4,9', label: 'ortalama puan' },
      ],
      videoTestimonials: [
        { id: 'vk1', name: 'Melis K.', role: 'Kafe sahibi', poster: people.w5, videoUrl: video.a, quote: 'Reklam ajansına vereceğim parayla mutfağı yeniledim.' },
        { id: 'vk2', name: 'Barış E.', role: 'Düğün videografı', poster: people.m2, videoUrl: video.a, quote: 'Işık bölümü işimi değiştirdi.' },
        { id: 'vk3', name: 'İpek Y.', role: 'İçerik üreticisi', poster: people.w6, videoUrl: video.a, quote: 'Takipçim 3 ayda 4 katına çıktı.' },
      ],
      textTestimonials: [
        { id: 'tk1', name: 'Selin Uçar', role: 'Butik sahibi', avatar: people.w7, rating: 5, text: 'Ürün videolarımı artık kendim çekiyorum. Ödevlere Ece Hanım tek tek dönüş yapıyor.' },
        { id: 'tk2', name: 'Emre Polat', role: 'Öğrenci', avatar: people.m1, rating: 5, text: 'CapCut’ı biliyorum sanıyordum. Kurgu bölümünden sonra eski videolarımı sildim.' },
        { id: 'tk3', name: 'Gizem Aksoy', role: 'Diyetisyen', avatar: people.w1, rating: 4, text: 'Kısa ve net dersler. Bir oturuşta iki ders bitirip hemen uyguluyorum.' },
      ],
      faq: [
        { id: 'k1', q: 'Hangi telefon gerekli?', a: 'Son 4 yılda çıkmış herhangi bir iPhone ya da Android yeterli.' },
        { id: 'k2', q: 'Ekipman almam gerekiyor mu?', a: 'Hayır. Opsiyonel 3 parça (yaka mikrofonu, tripod, LED) için bütçe önerileri veriyoruz.' },
        { id: 'k3', q: 'Fatura kesiliyor mu?', a: 'Evet, ödeme sonrası otomatik e-Arşiv fatura gönderilir.' },
      ],
    },
  },
  {
    id: 'b_kumbara',
    slug: 'kumbara',
    name: 'Kumbara',
    domain: 'kumbara.okul',
    accent: '#2c48c9',
    accentSoft: '#e1e6fb',
    monogram: 'Ku',
    tagline: 'Kişisel finans, sade dille',
    active: false,
    invoiceTitle: 'Defter Eğitim Teknolojileri A.Ş.',
    taxNo: '2910384471',
    landing: {
      eyebrow: 'Yakında · ön kayıt açık',
      headline: 'Maaş gününden *sonraki* gün için bir plan.',
      subheadline: 'Bütçe, borç, birikim ve ilk yatırım. Uygulama tabloları ve haftalık görevlerle 30 günde paranla aranı düzelt.',
      vslUrl: video.a,
      vslPoster: img.coins,
      vslCaption: '3 dk · Programın özeti',
      heroImage: img.chart,
      ctaLabel: 'Ön kayıt yap',
      guarantee: '30 gün koşulsuz iade.',
      stats: [
        { value: '30', label: 'gün' },
        { value: '24', label: 'kısa ders' },
        { value: '12', label: 'hazır tablo' },
      ],
      videoTestimonials: [],
      textTestimonials: [
        { id: 'tf1', name: 'Pilot grup katılımcısı', role: 'Öğretmen', avatar: people.w3, rating: 5, text: 'İlk ay kredi kartı borcumu kapatmak için gerçekçi bir takvim çıkardım.' },
      ],
      faq: [{ id: 'q1', q: 'Yatırım tavsiyesi veriyor musunuz?', a: 'Hayır. Kavramları ve araçları öğretiyoruz; karar sizin.' }],
    },
  },
]

/* ---------------- Kullanıcılar ---------------- */

const users: User[] = [
  { id: 'u_admin', name: 'Selin Aydın', email: 'selin@defter.academy', role: 'admin', avatar: people.w4, createdAt: days(400), brandIds: brands.map((b) => b.id) },
  { id: 'u_t1', name: 'Murat Koç', email: 'murat@defter.academy', role: 'teacher', avatar: people.m3, createdAt: days(380), brandIds: ['b_defter'] },
  { id: 'u_t2', name: 'Ece Demir', email: 'ece@kadraj.studio', role: 'teacher', avatar: people.w6, createdAt: days(210), brandIds: ['b_kadraj'] },
  { id: 'u_t3', name: 'Tolga Şen', email: 'tolga@kumbara.okul', role: 'teacher', avatar: people.m4, createdAt: days(40), brandIds: ['b_kumbara'] },
  { id: 'u_s1', name: 'Burak Yılmaz', email: 'burak.yilmaz@gmail.com', phone: '0532 418 22 90', role: 'student', avatar: people.m1, createdAt: days(26), brandIds: ['b_defter', 'b_kadraj'] },
]

const firstNames = ['Ayşe', 'Mehmet', 'Fatma', 'Ali', 'Zeynep', 'Mustafa', 'Elif', 'Emre', 'Merve', 'Kerem', 'Büşra', 'Onur', 'Gamze', 'Tuna', 'Sena', 'Cem', 'İrem', 'Okan', 'Deniz', 'Pelin', 'Arda', 'Nazlı', 'Yusuf', 'Ceren']
const lastNames = ['Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Öztürk', 'Aydın', 'Arslan', 'Doğan', 'Kılıç', 'Koç', 'Kurt', 'Özdemir', 'Polat', 'Erdoğan', 'Aksoy']
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Eskişehir', 'Kocaeli', 'Adana', 'Trabzon']
const avatars = Object.values(people)

const trSlug = (s: string) =>
  s.toLowerCase().replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')

for (let i = 0; i < 46; i++) {
  const fn = firstNames[(i * 7) % firstNames.length]
  const ln = lastNames[(i * 5 + 3) % lastNames.length]
  users.push({
    id: `u_g${i}`,
    name: `${fn} ${ln}`,
    email: `${trSlug(fn)}.${trSlug(ln)}${i}@gmail.com`,
    phone: `05${30 + (i % 9)} ${100 + i * 7} ${10 + (i % 80)} ${20 + (i % 70)}`,
    role: 'student',
    avatar: avatars[i % avatars.length],
    createdAt: days(Math.floor((i * 37) % 60) + 1),
    brandIds: [i % 3 === 0 ? 'b_kadraj' : 'b_defter'],
  })
}

/* ---------------- Kurslar ---------------- */

let lid = 0
const L = (title: string, min: number, summary: string, docs: Lesson['docs'] = []): Lesson => ({
  id: `l${++lid}`,
  title,
  duration: min * 60 + ((lid * 13) % 50),
  videoUrl: video.a,
  summary,
  docs,
  ai: { status: 'none', questions: [] },
})
const S = (id: string, title: string, lessons: Lesson[]): Section => ({ id, title, lessons })

const courses: Course[] = [
  {
    id: 'c_muh',
    brandId: 'b_defter',
    teacherId: 'u_t1',
    title: 'Sıfırdan Ön Muhasebe',
    cover: img.ledger,
    description: 'Gerçek bir şirketin üç aylık evrakını işleyerek yevmiyeden mizana kadar tüm akış.',
    level: 'Başlangıç',
    sections: [
      S('s1', 'Temel kavramlar', [
        L('Muhasebe neyi kaydeder?', 9, 'Varlık, kaynak ve işlem kavramları; neden çift taraflı kayıt tutarız.', [
          { id: 'd1', name: 'Kavram haritası.pdf', kind: 'pdf', size: '420 KB' },
        ]),
        L('Borç, alacak ve çift taraflı kayıt', 14, 'Her işlemin iki yüzü. T-cetvelleri ile ilk kayıtlar.', [
          { id: 'd2', name: 'T-cetveli çalışma kâğıdı.pdf', kind: 'pdf', size: '180 KB' },
          { id: 'd3', name: 'Örnek kayıtlar.xlsx', kind: 'xlsx', size: '64 KB' },
        ]),
        L('Tekdüzen hesap planı', 12, '1’den 9’a hesap grupları ve en sık kullanılan 30 hesap.', [
          { id: 'd4', name: 'Hesap planı (özet).pdf', kind: 'pdf', size: '1,2 MB' },
        ]),
      ]),
      S('s2', 'Evrak ve kayıt', [
        L('Fatura, irsaliye, makbuz', 11, 'Hangi belge neyi ispatlar; e-Fatura ve e-Arşiv farkı.', [
          { id: 'd5', name: 'Evrak klasörü – Ekim.zip', kind: 'zip', size: '8,4 MB' },
        ]),
        L('Yevmiye kaydı uygulaması', 18, 'Ekim ayı evrakını sırasıyla deftere işliyoruz.', [
          { id: 'd6', name: 'Yevmiye şablonu.xlsx', kind: 'xlsx', size: '92 KB' },
        ]),
        L('KDV hesaplama', 15, 'Matrah, oran, indirilecek ve hesaplanan KDV.'),
      ]),
      S('s3', 'Ay sonu', [
        L('Mizan çıkarmak', 16, 'Büyük defterden mizana; tutmayan mizanı bulmanın 5 yolu.', [
          { id: 'd7', name: 'Mizan kontrol listesi.pdf', kind: 'pdf', size: '210 KB' },
        ]),
        L('KDV beyannamesi taslağı', 13, 'Ay sonu kapanışı ve beyanname alanlarının doldurulması.'),
      ]),
    ],
  },
  {
    id: 'c_excel',
    brandId: 'b_defter',
    teacherId: 'u_t1',
    title: 'Muhasebeciler için Excel',
    cover: img.desk,
    description: 'DÜŞEYARA’dan pivot tablolara, cari ve banka mutabakatı için hazır şablonlar.',
    level: 'Orta',
    sections: [
      S('s4', 'Hızlı başlangıç', [
        L('Tablo mantığı ve veri temizliği', 10, 'Bankadan gelen ham dökümü kullanılabilir hale getirmek.'),
        L('DÜŞEYARA ve ÇAPRAZARA', 12, 'Cari kodlarını eşleştirme.', [{ id: 'd8', name: 'Cari listesi.xlsx', kind: 'xlsx', size: '120 KB' }]),
      ]),
      S('s5', 'Mutabakat', [
        L('Banka mutabakatı şablonu', 17, 'Hareketleri otomatik eşleyen şablon.'),
        L('Pivot ile aylık rapor', 14, 'Patrona tek sayfalık rapor.'),
      ]),
    ],
  },
  {
    id: 'c_kad',
    brandId: 'b_kadraj',
    teacherId: 'u_t2',
    title: 'Telefonla Reklam Filmi',
    cover: img.camera,
    description: 'Işık, ses, kadraj ve kurgu ile 30 saniyelik ürün reklamı.',
    level: 'Başlangıç',
    sections: [
      S('s6', 'Kamera', [
        L('Telefon kamerasını manuel kullanmak', 8, 'AE/AF kilidi, pozlama, beyaz dengesi.'),
        L('Kadraj ve kompozisyon', 10, 'Üçler kuralı, öncü çizgiler, boşluk.', [{ id: 'd9', name: 'Kadraj kartları.pdf', kind: 'pdf', size: '2,1 MB' }]),
        L('Hareket: 180° kuralı ve fps', 9, 'Sinematik hareket için enstantane ayarı.'),
      ]),
      S('s7', 'Işık & ses', [
        L('Pencere ışığıyla üç nokta aydınlatma', 12, 'Ekipmansız ışık kurulumu.'),
        L('Temiz ses kaydı', 9, 'Yaka mikrofonu ve oda akustiği.'),
      ]),
      S('s8', 'Kurgu', [
        L('İlk 2 saniye: hook', 7, 'Kaydırmayı durduran açılışlar.'),
        L('CapCut’ta ritim kurgusu', 15, 'Müziğe göre kesme, geçişler.', [{ id: 'd10', name: 'Proje dosyası.zip', kind: 'zip', size: '46 MB' }]),
      ]),
    ],
  },
  {
    id: 'c_fin',
    brandId: 'b_kumbara',
    teacherId: 'u_t3',
    title: '30 Günde Bütçe',
    cover: img.coins,
    description: 'Bütçe, borç kapatma ve birikim alışkanlığı.',
    level: 'Başlangıç',
    sections: [
      S('s9', 'Hafta 1', [
        L('Paranın nereye gittiğini bulmak', 8, 'Son 3 ayın dökümünü sınıflandırmak.'),
        L('Önce kendine öde', 6, 'Birikimi gider kalemi yapmak.'),
      ]),
    ],
  },
]

// Yapay zekâ ile soru üretilmiş ve onaylanmış dersler (bir kez çalıştırılmış)
const aiLedger: AppState['aiLedger'] = []
const runAi = (course: Course, lessonIds: string[], approve: boolean) => {
  const slug = brands.find((b) => b.id === course.brandId)!.slug
  course.sections.forEach((s) =>
    s.lessons.forEach((l) => {
      if (!lessonIds.includes(l.id)) return
      const r = generateQuestions(l, topicOf(slug))
      const at = days(20 - Number(l.id.slice(1)), 14)
      l.ai = {
        status: approve ? 'approved' : 'review',
        generatedAt: at,
        approvedAt: approve ? at : undefined,
        tokens: r.tokens,
        cost: r.cost,
        questions: r.questions.map((q) => ({ ...q, approved: approve })),
      }
      aiLedger.push({ lessonId: l.id, at, tokens: r.tokens, cost: r.cost })
    }),
  )
}
runAi(courses[0], ['l1', 'l2', 'l3', 'l4', 'l5'], true)
runAi(courses[0], ['l6'], false)
runAi(courses[2], ['l13', 'l14', 'l15', 'l16'], true)
runAi(courses[2], ['l17'], false)

/* ---------------- Paketler ---------------- */

const packages: Package[] = [
  {
    id: 'p_muh_temel',
    brandId: 'b_defter',
    title: 'Ön Muhasebe',
    price: 2490,
    oldPrice: 3990,
    installments: 6,
    courseIds: ['c_muh'],
    features: ['8 bölüm, 64 video ders', 'Gerçek şirket evrak klasörleri', 'Her ders sonunda test', '12 ay erişim'],
    active: true,
  },
  {
    id: 'p_muh_pro',
    brandId: 'b_defter',
    title: 'Ön Muhasebe + Excel',
    price: 3290,
    oldPrice: 5490,
    installments: 6,
    courseIds: ['c_muh', 'c_excel'],
    features: ['Ön Muhasebe eğitiminin tamamı', 'Muhasebeciler için Excel', 'Mutabakat ve rapor şablonları', 'Katılım belgesi', '12 ay erişim'],
    badge: 'En çok tercih edilen',
    active: true,
  },
  {
    id: 'p_kad',
    brandId: 'b_kadraj',
    title: 'Telefonla Reklam Filmi',
    price: 1890,
    oldPrice: 2690,
    installments: 3,
    courseIds: ['c_kad'],
    features: ['7 ders + 38 çekim ödevi', 'Ödevlere eğitmen geri bildirimi', 'CapCut proje dosyaları', 'Ömür boyu erişim'],
    active: true,
  },
  {
    id: 'p_fin',
    brandId: 'b_kumbara',
    title: '30 Günde Bütçe',
    price: 690,
    installments: 1,
    courseIds: ['c_fin'],
    features: ['24 kısa ders', '12 hazır tablo', 'Haftalık görevler'],
    active: true,
  },
]

/* ---------------- Siparişler ---------------- */

const orders: Order[] = []
const enrollments: Enrollment[] = []
let inv = 1041
const buyable = packages.filter((p) => p.brandId !== 'b_kumbara')
const students = users.filter((u) => u.role === 'student')

students.forEach((s, i) => {
  const pkg = s.id === 'u_s1' ? packages[1] : buyable[(i * 5) % buyable.length]
  const age = s.id === 'u_s1' ? 26 : Math.floor((i * 37) % 60) + 1
  const failed = i % 11 === 7
  const refunded = i % 17 === 9
  const o: Order = {
    id: `SP-${(26110 - i * 3).toString()}`,
    brandId: pkg.brandId,
    packageId: pkg.id,
    userId: s.id,
    amount: pkg.price,
    status: failed ? 'basarisiz' : refunded ? 'iade' : 'odendi',
    createdAt: days(age, 9 + (i % 12)),
    paytrRef: `PT${(9183400 + i * 131).toString(36).toUpperCase()}`,
    installment: [1, 1, 3, 6, 1, 2][i % 6],
    buyer: { name: s.name, email: s.email, phone: s.phone ?? '', city: cities[i % cities.length], ...(i % 9 === 4 ? { company: `${s.name.split(' ')[1]} Lojistik Ltd.`, taxNo: `48${i}1029384`.slice(0, 10) } : {}) },
  }
  if (!failed) {
    o.invoice = {
      no: `${pkg.brandId === 'b_kadraj' ? 'KDR' : 'DFT'}2026${(inv++).toString().padStart(9, '0')}`,
      type: o.buyer.taxNo ? 'e-Fatura' : 'e-Arşiv',
      status: refunded ? 'iptal' : 'kesildi',
      issuedAt: o.createdAt,
    }
    if (!refunded) pkg.courseIds.forEach((c) => enrollments.push({ userId: s.id, courseId: c, orderId: o.id, createdAt: o.createdAt }))
  }
  orders.push(o)
})
// Burak'ın ikinci markadan alımı
orders.push({
  id: 'SP-26131',
  brandId: 'b_kadraj',
  packageId: 'p_kad',
  userId: 'u_s1',
  amount: 1890,
  status: 'odendi',
  createdAt: days(4, 21),
  paytrRef: 'PT5TQ2ZA',
  installment: 3,
  buyer: { name: 'Burak Yılmaz', email: 'burak.yilmaz@gmail.com', phone: '0532 418 22 90', city: 'İstanbul' },
  invoice: { no: 'KDR2026000001102', type: 'e-Arşiv', status: 'kesildi', issuedAt: days(4, 21) },
})
enrollments.push({ userId: 'u_s1', courseId: 'c_kad', orderId: 'SP-26131', createdAt: days(4, 21) })
orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

/* ---------------- İlerleme ---------------- */

const progress: AppState['progress'] = {
  u_s1: {
    l1: { completed: true, completedAt: days(24), quizScore: 4, quizTotal: 4 },
    l2: { completed: true, completedAt: days(22), quizScore: 3, quizTotal: 4 },
    l3: { completed: true, completedAt: days(19), quizScore: 4, quizTotal: 4 },
    l4: { completed: true, completedAt: days(12), quizScore: 2, quizTotal: 4 },
    l13: { completed: true, completedAt: days(3), quizScore: 4, quizTotal: 4 },
  },
}

export const SEED_VERSION = 3

export const seed = (): AppState =>
  JSON.parse(
    JSON.stringify({
      version: SEED_VERSION,
      currentUserId: null,
      brands,
      courses,
      packages,
      users,
      orders,
      enrollments,
      progress,
      aiLedger,
    }),
  )
