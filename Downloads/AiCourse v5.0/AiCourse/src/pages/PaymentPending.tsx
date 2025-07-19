
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink, CheckCircle, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { serverURL, websiteURL } from '@/constants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';

const PaymentPending = () => {
    const { t } = useTranslation('payment');
    const navigate = useNavigate();
    const { toast } = useToast();
    const { state } = useLocation();
    const { sub, link, planName, planCost } = state || {};
    const [processing, setProcessing] = useState(false);

    const handleVerifyPayment = async () => {
        const dataToSend = {
            sub: sub
        };
        try {
            toast({
                title: t('pending.verifying.title'),
                description: t('pending.verifying.description'),
            });
            setProcessing(true);
            const postURL = serverURL + '/api/razorapypending';
            await axios.post(postURL, dataToSend).then(res => {
                if (res.data.status === 'active') {
                    setProcessing(true);
                    const approveHref = websiteURL + '/payment-success/' + sub;
                    window.location.href = approveHref;
                } else if (res.data.status === 'expired' || res.data.status === 'cancelled') {
                    const approveHref = websiteURL + '/payment-failed';
                    window.location.href = approveHref;
                }
                else {
                    toast({
                        title: t('pending.stillPending.title'),
                        description: t('pending.stillPending.description'),
                    });
                    setProcessing(false);
                }
            });
        } catch (error) {
            console.error(error);
            setProcessing(false);
            toast({
                title: t('error.title'),
                description: t('error.internalServerError'),
            });
        }
    };

    const handlePaymentLink = () => {
        toast({
            title: t('pending.opening.title'),
            description: t('pending.opening.description'),
        });
        window.open(link, '_blank');
    };

    return (
        <>
            <SEO
                title={t('pending.seo.title')}
                description={t('pending.seo.description')}
                keywords={t('pending.seo.keywords')}
            />
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center border-b pb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('pending.title')}</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        {t('pending.description')}
                    </p>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('pending.plan')}</p>
                                <p className="font-medium">{planName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">{t('pending.amount')}</p>
                                <p className="font-medium">${planCost}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">{t('pending.whatNext.title')}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                {t('pending.whatNext.step1')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('pending.whatNext.step2')}
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={handlePaymentLink}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('pending.paymentLink')}
                    </Button>

                    <Button onClick={handleVerifyPayment}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {processing ? t('pending.verifying.button') : t('pending.verifyPayment')}
                    </Button>
                </CardFooter>
            </Card>
            </div>
        </>
    );
};

export default PaymentPending;