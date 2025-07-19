import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Send, Check } from 'lucide-react';
import SEO from '@/components/SEO';
import { appName, serverURL } from '@/constants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API request
    const postURL = serverURL + '/api/contact';
    const response = await axios.post(postURL, { fname: name, lname: subject, email, phone: '', msg: message });
    if (response.data.success) {
      toast({
        title: t('toast.messageSent'),
        description: response.data.message,
      });
    } else {
      toast({
        title: t('toast.failed'),
        description: response.data.message,
      });
    }
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
      />
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle', { appName })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                {t('form.title')}
              </h2>

              {isSubmitted ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{t('success.title')}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t('success.description')}
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>{t('success.sendAnother')}</Button>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('form.yourName')}</Label>
                      <Input
                        id="name"
                        placeholder={t('form.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('form.emailAddress')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('form.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('form.subject')}</Label>
                    <Select onValueChange={setSubject} required>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder={t('form.subjectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t('form.subjects.general')}</SelectItem>
                        <SelectItem value="support">{t('form.subjects.support')}</SelectItem>
                        <SelectItem value="billing">{t('form.subjects.billing')}</SelectItem>
                        <SelectItem value="feedback">{t('form.subjects.feedback')}</SelectItem>
                        <SelectItem value="partnership">{t('form.subjects.partnership')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('form.yourMessage')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('form.messagePlaceholder')}
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      t('form.sending')
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('form.sendMessage')}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">{t('faq.title')}</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('faq.resetPassword.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('faq.resetPassword.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('faq.paymentMethods.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('faq.paymentMethods.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('faq.generateCourse.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('faq.generateCourse.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('faq.downloadCertificates.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('faq.downloadCertificates.answer')}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
