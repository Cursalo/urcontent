
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Users, Award, Sparkles, Target, ArrowRight } from 'lucide-react';
import { appName, companyName } from '@/constants';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';

const About = () => {
  const { t } = useTranslation('about');
  
  return (
    <>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
      />
      <div className="min-h-screen bg-background">
      {/* Header/Navigation will be inherited from parent layout */}

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {t('hero.title', { appName })}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t('mission.title')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('mission.description1', { appName })}
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('mission.description2')}
              </p>
            </div>
            <div className="mt-10 lg:mt-0 flex justify-center">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <Target className="h-12 w-12 mb-4" />
                  <p className="text-xl font-medium text-center">
                    {t('mission.quote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center mb-16">
            {t('story.title')}
          </h2>
          <div className="relative">
            <p className="mt-4 text-lg text-muted-foreground">
              {t('story.description1', { companyName })}
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('story.description2', { companyName })}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('team.title')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t('team.description', { companyName })}
          </p>

        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            {t('cta.description', { appName })}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link to="/signup">
                {t('cta.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link to="/contact">
                {t('cta.contactUs')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default About;
