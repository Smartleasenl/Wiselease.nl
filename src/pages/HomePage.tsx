import { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { PopularBrands } from '../components/PopularBrands';
import { WhySmartlease } from '../components/WhySmartlease';
import { BlogSection } from '../components/BlogSection';
import { initScrollReveal } from '../utils/scrollReveal';

export function HomePage() {
  useEffect(() => {
    const cleanup = initScrollReveal();
    return cleanup;
  }, []);

  return (
    <>
      <Hero />
      <PopularBrands />
      <WhySmartlease />
      <BlogSection />
    </>
  );
}