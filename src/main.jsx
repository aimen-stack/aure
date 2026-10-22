import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './LandingPage.jsx'

const Test = lazy(() => import('./test/Test.jsx'))
const Test2 = lazy(() => import('./test/Test2.jsx'))
const Test3 = lazy(() => import('./test/Test3.jsx'))
const Test4 = lazy(() => import('./test/Test4.jsx'))
const Test6 = lazy(() => import('./test/EtherealArchPhoto.jsx'))
const Test5 = lazy(() => import('./test/Test5.jsx'))
const WaterSplashEffect = lazy(() => import('./test/WaterSplashEffectt.jsx'))
const Aure = lazy(() => import('./test/Aure.jsx'))
const AllProjectsPage = lazy(() => import('./AllProjectsPage.jsx'))
const PortfolioDetailsPage = lazy(() => import('./PortfolioDetailsPage.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test2" element={<Test2 />} />
          <Route path="/test3" element={<Test3 />} />
          <Route path="/test4" element={<Test4 />} />
          <Route path="/test6" element={<Test6 />} />
          <Route path="/test5" element={<Test5 />} />
          <Route path="/WaterSplashEffect" element={<WaterSplashEffect />} />
          <Route path="/Aure" element={<Aure />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/projects" element={<AllProjectsPage />} />
          <Route path="/portfolio-details" element={<PortfolioDetailsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
