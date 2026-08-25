import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Test from './test/Test.jsx'
import Test2 from './test/Test2.jsx'
import Test3 from './test/Test3.jsx'
import Test4 from './test/Test4.jsx'
import Test6 from './test/EtherealArchPhoto.jsx'
import Test5 from './test/Test5.jsx'
import WaterSplashEffect from './test/WaterSplashEffectt.jsx'
import Aure from './test/Aure.jsx'
import LandingPage from './LandingPage.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
