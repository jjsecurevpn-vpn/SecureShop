import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Usar requestAnimationFrame para asegurar que se ejecute después del render
    requestAnimationFrame(() => {
      // Intentar scroll en el contenedor primero
      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
      // Siempre hacer scroll en window para cubrir casos en móvil
      window.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;