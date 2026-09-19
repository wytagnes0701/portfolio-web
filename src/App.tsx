import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './components/Layout'
import { PortfolioProvider } from './data/PortfolioContext'
import { ScrollOnRouteChange } from './hooks/ScrollOnRouteChange'
import { AboutPage, ContactPage, MorePage } from './pages/MorePages'
import { EducationPage } from './pages/EducationPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { GalleryPage, ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { SplashPage } from './pages/SplashPage'
import { YoutubePage } from './pages/YoutubePage'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export default function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter basename={routerBasename}>
        <ScrollOnRouteChange />
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project/:itemId" element={<ProjectDetailPage />} />
            <Route path="/gallery/:itemId" element={<GalleryPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/youtube" element={<YoutubePage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PortfolioProvider>
  )
}
