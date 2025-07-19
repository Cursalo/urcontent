
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const pricingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation('home');

  const plans = [
    {
      name: FreeType,
      description: "",
      price: FreeCost,
      features: [
        t('pricing.plans.free.features.0'),
        t('pricing.plans.free.features.1'),
        t('pricing.plans.free.features.2'),
        t('pricing.plans.free.features.3'),
      ],
      featured: false,
      cta: t('pricing.getStarted'),
      billing: "forever"
    },
    {
      name: MonthType,
      description: "",
      price: MonthCost,
      features: [
        t('pricing.plans.monthly.features.0'),
        t('pricing.plans.monthly.features.1'),
        t('pricing.plans.monthly.features.2'),
        t('pricing.plans.monthly.features.3'),
        t('pricing.plans.monthly.features.4'),
        t('pricing.plans.monthly.features.5'),
        t('pricing.plans.monthly.features.6'),
      ],
      featured: true,
      cta: t('pricing.getStarted'),
      billing: "monthly"
    },
    {
      name: YearType,
      description: "",
      price: YearCost,
      features: [
        t('pricing.plans.yearly.features.0'),
        t('pricing.plans.yearly.features.1'),
        t('pricing.plans.yearly.features.2'),
        t('pricing.plans.yearly.features.3'),
        t('pricing.plans.yearly.features.4'),
        t('pricing.plans.yearly.features.5'),
        t('pricing.plans.yearly.features.6'),
      ],
      featured: false,
      cta: t('pricing.getStarted'),
      billing: "yearly"
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

    const titleEl = document.querySelector('.pricing-title');
    if (titleEl) observer.observe(titleEl);

    const switcherEl = document.querySelector('.pricing-switcher');
    if (switcherEl) observer.observe(switcherEl);

    const elements = pricingRef.current?.querySelectorAll('.pricing-card');
    elements?.forEach((el, index) => {
      // Add staggered delay
      el.setAttribute('style', `transition-delay: ${index * 100}ms`);
      observer.observe(el);
    });

    return () => {
      if (titleEl) observer.unobserve(titleEl);
      if (switcherEl) observer.unobserve(switcherEl);
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const getAdjustedPrice = (basePrice: number) => {
    return basePrice;
  };

  return (
    <section id="pricing" className="py-20 md:py-32 px-6 md:px-10 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            {t('pricing.badge')}
          </span>
          <h2 className="pricing-title opacity-0 font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            {t('pricing.title')}, <span className="text-primary">{t('pricing.titleHighlight')}</span> {t('pricing.titleEnd')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="pricing-switcher opacity-0 flex justify-center items-center space-x-4 mb-16">
        </div>

        {/* Pricing cards */}
        <div
          ref={pricingRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "pricing-card opacity-0 bg-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col",
                plan.featured ?
                  "border-2 border-primary shadow-lg shadow-primary/10 lg:-mt-6 lg:mb-6" :
                  "border border-border/50 shadow-sm hover:shadow-md"
              )}
            >
              {plan.featured && (
                <div className="bg-primary py-1.5 text-center">
                  <span className="text-sm font-medium text-white">{t('pricing.mostPopular')}</span>
                </div>
              )}
              <div className="p-8 flex-1">
                <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">${getAdjustedPrice(plan.price)}</span>
                  <span className="text-muted-foreground ml-2">{plan.billing === 'monthly' ? t('pricing.billing.monthly') : plan.billing === 'yearly' ? t('pricing.billing.yearly') : ''}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 pt-0">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className={cn(
                    "w-full",
                    plan.featured ? "bg-primary hover:bg-primary/90" : ""
                  )}
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
