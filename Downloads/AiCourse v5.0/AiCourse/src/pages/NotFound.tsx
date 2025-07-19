
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from '@/components/SEO';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation('common');
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEO
        title={t('notFound.seo.title')}
        description={t('notFound.seo.description')}
        keywords={t('notFound.seo.keywords')}
      />
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="w-full max-w-md text-center space-y-8 animate-fade-in">
          <div className="relative mx-auto">
            <div className="bg-primary/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-2xl font-bold rounded-full h-16 w-16 flex items-center justify-center border-4 border-background shadow-lg">
              404
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t('notFound.title')}</h1>
            <p className="text-muted-foreground">
              {t('notFound.description')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('notFound.returnHome')}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">
                {t('notFound.goToDashboard')}
              </Link>
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            <p>{t('notFound.contactSupport')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;