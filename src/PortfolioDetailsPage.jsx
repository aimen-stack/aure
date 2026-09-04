import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProjectDetails from './components/ProjectDetails';
import { projectData } from './data/projects';

export default function PortfolioDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get active index from location state, default to 0
  const initialIndex = location.state?.activeIndex || 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeIndex]);

  const activeData = projectData[activeIndex];
  
  if (!activeData) return null;

  return (
    <div style={{ backgroundColor: activeData.theme?.bg || '#D9CFC1', minHeight: '100vh' }}>
      <ProjectDetails
        title={activeData.title}
        subtitle={activeData.subtitle}
        heroSubtitle={activeData.heroSubtitle}
        heroImage={activeData.heroImage}
        logoImage={activeData.logoImage}
        services={activeData.services}
        theme={activeData.theme}
        textTop={activeData.textTop}
        textBottom={activeData.textBottom}
        images={activeData.images || [
          `/projects/${activeData.id}/image1.png`,
          `/projects/${activeData.id}/image2.png`,
          `/projects/${activeData.id}/image3.png`,
          `/projects/${activeData.id}/image4.png`,
          `/projects/${activeData.id}/image5.png`,
          `/projects/${activeData.id}/image6.png`,
          `/projects/${activeData.id}/image7.png`,
          `/projects/${activeData.id}/image8.png`,
          `/projects/${activeData.id}/image9.png`
        ]}
        onClose={() => navigate(-1)}
        nextProject={{
          title: projectData[(activeIndex + 1) % projectData.length].title,
          image: `/projects/${projectData[(activeIndex + 1) % projectData.length].id}/image1.png`
        }}
        onNextProject={() => {
          setActiveIndex((activeIndex + 1) % projectData.length);
        }}
      />
    </div>
  );
}
