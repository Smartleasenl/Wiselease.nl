import { useEffect, useRef, useState } from 'react';
import { Shield, Clock, ThumbsUp, Users } from 'lucide-react';

const usps = [
  {
    icon: Users,
    title: '62.000+',
    subtitle: 'Voertuigen beschikbaar',
    color: 'text-smartlease-yellow',
  },
  {
    icon: Shield,
    title: '500+',
    subtitle: 'Gecertificeerde dealers',
    color: 'text-blue-600',
  },
  {
    icon: ThumbsUp,
    title: '4,9/5',
    subtitle: 'Klantbeoordeling',
    color: 'text-yellow-500',
  },
  {
    icon: Clock,
    title: '24/7',
    subtitle: 'Online beschikbaar',
    color: 'text-green-600',
  },
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  return <span ref={ref}>{count.toLocaleString('nl-NL')}</span>;
}

export function USPSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Waarom Smartlease?
          </h2>
          <p className="text-lg text-gray-600">
            De slimste keuze voor jouw lease auto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <div
                key={index}
                className="reveal text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-smartlease-yellow hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white mb-4 border border-gray-200">
                  <Icon className={`h-6 w-6 ${usp.color}`} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {usp.title.includes('+') ? (
                    <>
                      <AnimatedCounter target={parseInt(usp.title.replace(/[^0-9]/g, ''))} />
                      {usp.title.replace(/[0-9]/g, '')}
                    </>
                  ) : (
                    usp.title
                  )}
                </h3>
                <p className="text-gray-600 text-sm">{usp.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
