
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import { appLogo, appName, companyName, serverURL } from '@/constants';
import Logo from '../res/logo.svg';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation
    if (!email) {
      setError(t('forgotPassword.errors.emailRequired'));
      setIsLoading(false);
      return;
    }

    try {
      const postURL = serverURL + '/api/forgot';
      const response = await axios.post(postURL, { email, name: appName, company: companyName, logo: appLogo });
      if (response.data.success) {
        setSuccess(true);
        toast({
          title: t('forgotPassword.success.title'),
          description: t('forgotPassword.success.description'),
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setError(response.data.message);
      }

    } catch (err) {
      setError(t('forgotPassword.errors.failedToSend'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={t('forgotPassword.seo.title')}
        description={t('forgotPassword.seo.description')}
        keywords={t('forgotPassword.seo.keywords')}
      />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <img src={Logo} alt="Logo" className='h-6 w-6' />
            </div>
            <span className="font-display font-medium text-lg">{appName}</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">{t('forgotPassword.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">{t('forgotPassword.checkEmail.title')}</h3>
                <p className="text-muted-foreground">
                  {t('forgotPassword.checkEmail.description', { email })}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {t('forgotPassword.checkEmail.noEmail')} <button className="text-primary hover:underline" onClick={() => setSuccess(false)}>{t('forgotPassword.checkEmail.tryAgain')}</button>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('forgotPassword.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('forgotPassword.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t p-6">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
{t('forgotPassword.backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
      </div>
    </>
  );
};

export default ForgotPassword;
