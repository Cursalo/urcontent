
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { appName } from '@/constants';
import { useTranslation } from 'react-i18next';


const Testimonials = () => {
  const { t } = useTranslation('home');
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  const testimonials = [
    {
      quote: t('testimonials.items.0.quote', { appName }),
      author: t('testimonials.items.0.author'),
      title: t('testimonials.items.0.title'),
      stars: 5
    },
    {
      quote: t('testimonials.items.1.quote', { appName }),
      author: t('testimonials.items.1.author'),
      title: t('testimonials.items.1.title'),
      stars: 5
    },
    {
      quote: t('testimonials.items.2.quote', { appName }),
      author: t('testimonials.items.2.author'),
      title: t('testimonials.items.2.title'),
      stars: 5
    },
    {
      quote: t('testimonials.items.3.quote'),
      author: t('testimonials.items.3.author'),
      title: t('testimonials.items.3.title'),
      stars: 4
    }
  ];
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const titleEl = document.querySelector('.testimonials-title');
    if (titleEl) observer.observe(titleEl);
    
    const elements = testimonialsRef.current?.querySelectorAll('.testimonial-item');
    elements?.forEach((el, index) => {
      // Add staggered delay
      el.setAttribute('style', `transition-delay: ${index * 100}ms`);
      observer.observe(el);
    });
    
    return () => {
      if (titleEl) observer.unobserve(titleEl);
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="py-20 md:py-32 px-6 md:px-10 bg-secondary/50 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
{t('testimonials.badge')}
          </span>
          <h2 className="testimonials-title opacity-0 font-display text-3xl md:text-4xl lg:text-5xl font-bold">
{t('testimonials.title')}
          </h2>
        </div>
        
        <div 
          ref={testimonialsRef} 
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-item opacity-0 bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-8 border border-border/50 flex flex-col"
            >
              <div className="flex mb-4">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
                {Array.from({ length: 5 - testimonial.stars }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-muted-foreground" />
                ))}
              </div>
              <blockquote className="flex-1 text-lg font-medium mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-muted-foreground text-sm">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
