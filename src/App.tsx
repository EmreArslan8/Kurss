import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider, lessonsOf, useStore } from './lib/store'
import { Shell } from './components/Shell'
import Hub from './pages/public/Hub'
import Login from './pages/public/Login'
import LandingRoute from './pages/public/Landing'
import Checkout, { CheckoutSuccess } from './pages/public/Checkout'
import { CoursePlayer, StudentHome, StudentOrders } from './pages/student/Student'
import { CourseEditor, TeacherHome } from './pages/teacher/Teacher'
import { AdminAi, AdminBrands, AdminCourses, AdminDashboard, AdminOrders, AdminUsers } from './pages/admin/Admin'
import BrandEditor from './pages/admin/BrandEditor'
import { resolveBrandFromHost } from './lib/tenant'

function TeacherShell() {
  const { state, me } = useStore()
  const pending = state.courses
    .filter((c) => c.teacherId === me?.id)
    .flatMap(lessonsOf)
    .filter((l) => l.ai.status === 'review').length
  return (
    <Shell
      role="teacher"
      title="Eğitmen"
      nav={[
        { to: '/egitmen', label: 'Özet', icon: 'grid', end: true, badge: pending },
        ...state.courses.filter((c) => c.teacherId === me?.id).map((c) => ({ to: `/egitmen/kurs/${c.id}`, label: c.title, icon: 'book' })),
      ]}
    />
  )
}

function Root() {
  const { state } = useStore()
  // Prod: aynı build tüm domainlerde çalışır; Host başlığı markayı seçer.
  const hosted = resolveBrandFromHost(state.brands)
  return (
    <Routes>
      <Route path="/" element={hosted ? <Navigate to={`/${hosted.slug}`} replace /> : <Hub />} />
      <Route path="/giris" element={<Login />} />

      <Route element={<Shell role="student" title="Öğrenci" nav={[{ to: '/ogrenci', label: 'Eğitimlerim', icon: 'book', end: true }, { to: '/ogrenci/siparisler', label: 'Siparişler', icon: 'receipt' }]} />}>
        <Route path="/ogrenci" element={<StudentHome />} />
        <Route path="/ogrenci/siparisler" element={<StudentOrders />} />
        <Route path="/ogrenci/kurs/:courseId/:lessonId?" element={<CoursePlayer />} />
      </Route>

      <Route element={<TeacherShell />}>
        <Route path="/egitmen" element={<TeacherHome />} />
        <Route path="/egitmen/kurs/:courseId/:lessonId?" element={<CourseEditor />} />
      </Route>

      <Route
        element={
          <Shell
            role="admin"
            title="Yönetim"
            nav={[
              { to: '/yonetim', label: 'Genel bakış', icon: 'grid', end: true },
              { to: '/yonetim/markalar', label: 'Markalar & sayfalar', icon: 'globe' },
              { to: '/yonetim/egitimler', label: 'Eğitimler', icon: 'book' },
              { to: '/yonetim/siparisler', label: 'Satış & fatura', icon: 'receipt' },
              { to: '/yonetim/kullanicilar', label: 'Kullanıcılar', icon: 'users' },
              { to: '/yonetim/yapay-zeka', label: 'Yapay zekâ maliyeti', icon: 'spark' },
            ]}
          />
        }
      >
        <Route path="/yonetim" element={<AdminDashboard />} />
        <Route path="/yonetim/markalar" element={<AdminBrands />} />
        <Route path="/yonetim/markalar/:brandId" element={<BrandEditor />} />
        <Route path="/yonetim/egitimler" element={<AdminCourses />} />
        <Route path="/yonetim/egitimler/:courseId/:lessonId?" element={<CourseEditor />} />
        <Route path="/yonetim/siparisler" element={<AdminOrders />} />
        <Route path="/yonetim/kullanicilar" element={<AdminUsers />} />
        <Route path="/yonetim/yapay-zeka" element={<AdminAi />} />
      </Route>

      <Route path="/:slug" element={<LandingRoute />} />
      <Route path="/:slug/odeme/:packageId" element={<Checkout />} />
      <Route path="/:slug/odeme/sonuc/:orderId" element={<CheckoutSuccess />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </StoreProvider>
  )
}
