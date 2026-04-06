import { useCanonical } from '../hooks/useCanonical';
import { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { PopularBrands } from '../components/PopularBrands';
import { WhyWiselease } from '../components/WhyWiselease';
import { BlogSection } from '../components/BlogSection';
import { initScrollReveal } from '../utils/scrollReveal';
import HoeWerktHetAnimatie from '../components/HoeWerktHetAnimatie';

export function HomePage() {
  useCanonical();
  useEffect(() => {
    const cleanup = initScrollReveal();
    return cleanup;
  }, []);

  return (
    <>
      <Hero />
      <PopularBrands />
      <WhyWiselease />
      <HoeWerktHetAnimatie />
      <BlogSection />
    </>
  );
}