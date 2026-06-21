import { Hero } from '@/components/home/Hero';
import { TrustedBy } from '@/components/home/TrustedBy';
import { Statistics } from '@/components/home/Statistics';
import { Features } from '@/components/home/Features';
import { HowAIWorks } from '@/components/home/HowAIWorks';
import { LatestStrategies } from '@/components/home/LatestStrategies';
import { Pricing } from '@/components/home/Pricing';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQ } from '@/components/home/FAQ';
import { Newsletter } from '@/components/home/Newsletter';
import { CTA } from '@/components/home/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Statistics />
      <Features />
      <HowAIWorks />
      <LatestStrategies />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <CTA />
    </>
  );
}
