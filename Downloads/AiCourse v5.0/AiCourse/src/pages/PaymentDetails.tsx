// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Wallet,
  Building,
  Smartphone,
  MapPin,
  CheckCircle,
  CreditCard as CreditCardIcon,
  Globe,
  DollarSign,
  HandCoins
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { amountInZarOne, amountInZarTwo, appLogo, appName, companyName, flutterwaveEnabled, flutterwavePlanIdOne, flutterwavePlanIdTwo, flutterwavePublicKey, FreeCost, FreeType, MonthCost, MonthType, paypalEnabled, paypalPlanIdOne, paypalPlanIdTwo, paystackEnabled, paystackPlanIdOne, paystackPlanIdTwo, razorpayEnabled, razorpayPlanIdOne, razorpayPlanIdTwo, serverURL, stripeEnabled, stripePlanIdOne, stripePlanIdTwo, YearCost, YearType, mercadopagoEnabled, mercadopagoPlanIdOne, mercadopagoPlanIdTwo } from '@/constants';
import axios from 'axios';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

// Form validation schema - will be created inside component to access translations

type FormValues = z.infer<typeof formSchema>;

const plans = {
  free: { name: FreeType, price: FreeCost },
  monthly: { name: MonthType, price: MonthCost },
  yearly: { name: YearType, price: YearCost }
};

const getPlanFeatures = (planName: string) => {
    if (planName === FreeType) {
      return [
        t('plans.free.features.0'),
        t('plans.free.features.1'),
        t('plans.free.features.2'),
        t('plans.free.features.3')
      ];
    } else if (planName === MonthType) {
      return [
        t('plans.monthly.features.0'),
        t('plans.monthly.features.1'),
        t('plans.monthly.features.2'),
        t('plans.monthly.features.3'),
        t('plans.monthly.features.4'),
        t('plans.monthly.features.5'),
        t('plans.monthly.features.6')
      ];
    } else if (planName === YearType) {
      return [
        t('plans.yearly.features.0'),
        t('plans.yearly.features.1'),
        t('plans.yearly.features.2'),
        t('plans.yearly.features.3'),
        t('plans.yearly.features.4'),
        t('plans.yearly.features.5'),
        t('plans.yearly.features.6')
      ];
    }
    return [];
  };

const PaymentMethodButton = ({
  icon: Icon,
  name,
  onClick,
  isSelected
}: {
  icon: React.ElementType,
  name: string,
  onClick: () => void,
  isSelected: boolean
}) => (
  <Button
    variant="outline"
    className={`flex items-center justify-start h-auto px-4 py-3 w-full ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    onClick={onClick}
  >
    <Icon className={`mr-2 h-5 w-5 ${isSelected ? 'text-primary' : ''}`} />
    <span>{name}</span>
    {isSelected && <CheckCircle className="ml-auto h-4 w-4 text-primary" />}
  </Button>
);

const PaymentDetails = () => {
  const { t } = useTranslation('payment');
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  // Form validation schema with translations
  const formSchema = z.object({
    firstName: z.string().min(2, t('details.errors.firstName')),
    lastName: z.string().min(2, t('details.errors.lastName')),
    email: z.string().email(t('details.errors.email')),
    address: z.string().min(5, t('details.errors.address')),
    city: z.string().min(2, t('details.errors.city')),
    state: z.string().min(2, t('details.errors.state')),
    zipCode: z.string().min(3, t('details.errors.zipCode')),
    country: z.string().min(2, t('details.errors.country'))
  });
  const [paymentMethod, setPaymentMethod] = useState<string>(
    paypalEnabled ? 'paypal' : 
    stripeEnabled ? 'stripe' : 
    mercadopagoEnabled ? 'mercadopago' :
    flutterwaveEnabled ? 'flutterwave' :
    paystackEnabled ? 'paystack' :
    razorpayEnabled ? 'razorpay' : 'paypal'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = planId && plans[planId as keyof typeof plans]
    ? plans[planId as keyof typeof plans]
    : { name: 'Unknown Plan', price: 0 };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: sessionStorage.getItem('mName'),
      lastName: '',
      email: sessionStorage.getItem('email'),
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsProcessing(true);
    if (paymentMethod === 'paypal') {
      startPayPal(data);
    } else if (paymentMethod === 'stripe') {
      startStripe();
    } else if (paymentMethod === 'flutterwave') {
      setIsProcessing(false);
      handleFlutterPayment({
        callback: (response) => {
          sessionStorage.setItem('stripe', "" + response.transaction_id);
          sessionStorage.setItem('method', 'flutterwave');
          sessionStorage.setItem('plan', plan.name);
          navigate('/payment-success/' + response.transaction_id);
          closePaymentModal();
        },
        onClose: () => { },
      });
    } else if (paymentMethod === 'paystack') {
      startPaystack(data);
    } else if (paymentMethod === 'razorpay') {
      startRazorpay(data);
    } else if (paymentMethod === 'mercadopago') {
      startMercadoPago(data);
    } else {
      return;
    }

  };


  async function startRazorpay(data: FormValues) {

    const fullAddress = data.address + ' ' + data.state + ' ' + data.zipCode + ' ' + data.country;
    let planId = razorpayPlanIdTwo;
    if (plan.name === 'Monthly Plan') {
      planId = razorpayPlanIdOne;
    }
    const dataToSend = {
      plan: planId,
      email: data.email,
      fullAddress: fullAddress
    };
    try {
      const postURL = serverURL + '/api/razorpaycreate';
      const res = await axios.post(postURL, dataToSend);
      sessionStorage.setItem('method', 'razorpay');
      setIsProcessing(false);
      sessionStorage.setItem('plan', plan.name);
      window.open(res.data.short_url, '_blank');
      navigate('/payment-pending', { state: { sub: res.data.id, link: res.data.short_url, planName: plan.name, planCost: plan.price } });
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({
        title: t('error.title'),
        description: t('details.errors.internalError'),
      });
    }
  }

  async function startMercadoPago(data: FormValues) {
    let planId = mercadopagoPlanIdTwo;
    if (plan.name === 'Monthly Plan') {
      planId = mercadopagoPlanIdOne;
    }
    const dataToSend = {
      planId: planId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country
    };
    try {
      const postURL = serverURL + '/api/mercadopago';
      const res = await axios.post(postURL, dataToSend);
      sessionStorage.setItem('mercadopago', res.data.id);
      sessionStorage.setItem('method', 'mercadopago');
      sessionStorage.setItem('plan', plan.name);
      setIsProcessing(false);
      window.location.href = res.data.init_point;
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({
        title: t('error.title'),
        description: t('details.errors.internalError'),
      });
    }
  }

  async function startPaystack(data: FormValues) {
    let planId = paystackPlanIdTwo;
    let amountInZar = amountInZarTwo;
    if (plan.name === 'Monthly Plan') {
      planId = paystackPlanIdOne;
      amountInZar = amountInZarOne;
    }
    const dataToSend = {
      planId: planId,
      amountInZar,
      email: data.email
    };
    try {
      const postURL = serverURL + '/api/paystackpayment';
      const res = await axios.post(postURL, dataToSend);
      sessionStorage.setItem('paystack', res.data.id);
      sessionStorage.setItem('method', 'paystack');
      sessionStorage.setItem('plan', plan.name);
      setIsProcessing(false);
      window.location.href = res.data.url;

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({
        title: t('error.title'),
        description: t('details.errors.internalError'),
      });
    }
  }

  const config = {
    public_key: flutterwavePublicKey,
    tx_ref: Date.now(),
    currency: 'USD',
    amount: plan.name === 'Monthly Plan' ? MonthCost : YearCost,
    payment_options: "card",
    payment_plan: plan.name === 'Monthly Plan' ? flutterwavePlanIdOne : flutterwavePlanIdTwo,
    customer: {
      email: sessionStorage.getItem('email'),
      name: sessionStorage.getItem('mName'),
    },
    customizations: {
      title: appName,
      description: plan.name + 'Subscription Payment',
      logo: appLogo,
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  async function startStripe() {
    let planId = stripePlanIdTwo;
    if (plan.name === 'Monthly Plan') {
      planId = stripePlanIdOne;
    }
    const dataToSend = {
      planId: planId
    };
    try {
      const postURL = serverURL + '/api/stripepayment';
      const res = await axios.post(postURL, dataToSend);
      sessionStorage.setItem('stripe', res.data.id);
      sessionStorage.setItem('method', 'stripe');
      sessionStorage.setItem('plan', plan.name);
      setIsProcessing(false);
      window.location.href = res.data.url;

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({
        title: t('error.title'),
        description: t('details.errors.internalError'),
      });
    }
  }

  const countryList = [
    { name: "Afghanistan", code: "AF" },
    { name: "Albania", code: "AL" },
    { name: "Algeria", code: "DZ" },
    { name: "Andorra", code: "AD" },
    { name: "Angola", code: "AO" },
    { name: "Antigua and Barbuda", code: "AG" },
    { name: "Argentina", code: "AR" },
    { name: "Armenia", code: "AM" },
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Azerbaijan", code: "AZ" },
    { name: "Bahamas", code: "BS" },
    { name: "Bahrain", code: "BH" },
    { name: "Bangladesh", code: "BD" },
    { name: "Barbados", code: "BB" },
    { name: "Belarus", code: "BY" },
    { name: "Belgium", code: "BE" },
    { name: "Belize", code: "BZ" },
    { name: "Benin", code: "BJ" },
    { name: "Bhutan", code: "BT" },
    { name: "Bolivia", code: "BO" },
    { name: "Bosnia and Herzegovina", code: "BA" },
    { name: "Botswana", code: "BW" },
    { name: "Brazil", code: "BR" },
    { name: "Brunei Darussalam", code: "BN" },
    { name: "Bulgaria", code: "BG" },
    { name: "Burkina Faso", code: "BF" },
    { name: "Burundi", code: "BI" },
    { name: "Cabo Verde", code: "CV" },
    { name: "Cambodia", code: "KH" },
    { name: "Cameroon", code: "CM" },
    { name: "Canada", code: "CA" },
    { name: "Central African Republic", code: "CF" },
    { name: "Chad", code: "TD" },
    { name: "Chile", code: "CL" },
    { name: "China", code: "CN" },
    { name: "Colombia", code: "CO" },
    { name: "Comoros", code: "KM" },
    { name: "Congo (Congo-Brazzaville)", code: "CG" },
    { name: "Congo (Democratic Republic) (Congo-Kinshasa)", code: "CD" },
    { name: "Costa Rica", code: "CR" },
    { name: "Croatia", code: "HR" },
    { name: "Cuba", code: "CU" },
    { name: "Cyprus", code: "CY" },
    { name: "Czech Republic", code: "CZ" },
    { name: "Denmark", code: "DK" },
    { name: "Djibouti", code: "DJ" },
    { name: "Dominica", code: "DM" },
    { name: "Dominican Republic", code: "DO" },
    { name: "Ecuador", code: "EC" },
    { name: "Egypt", code: "EG" },
    { name: "El Salvador", code: "SV" },
    { name: "Equatorial Guinea", code: "GQ" },
    { name: "Eritrea", code: "ER" },
    { name: "Estonia", code: "EE" },
    { name: "Eswatini (fmr. 'Swaziland')", code: "SZ" },
    { name: "Ethiopia", code: "ET" },
    { name: "Fiji", code: "FJ" },
    { name: "Finland", code: "FI" },
    { name: "France", code: "FR" },
    { name: "Gabon", code: "GA" },
    { name: "Gambia", code: "GM" },
    { name: "Georgia", code: "GE" },
    { name: "Germany", code: "DE" },
    { name: "Ghana", code: "GH" },
    { name: "Greece", code: "GR" },
    { name: "Grenada", code: "GD" },
    { name: "Guatemala", code: "GT" },
    { name: "Guinea", code: "GN" },
    { name: "Guinea-Bissau", code: "GW" },
    { name: "Guyana", code: "GY" },
    { name: "Haiti", code: "HT" },
    { name: "Honduras", code: "HN" },
    { name: "Hungary", code: "HU" },
    { name: "Iceland", code: "IS" },
    { name: "India", code: "IN" },
    { name: "Indonesia", code: "ID" },
    { name: "Iran", code: "IR" },
    { name: "Iraq", code: "IQ" },
    { name: "Ireland", code: "IE" },
    { name: "Israel", code: "IL" },
    { name: "Italy", code: "IT" },
    { name: "Jamaica", code: "JM" },
    { name: "Japan", code: "JP" },
    { name: "Jordan", code: "JO" },
    { name: "Kazakhstan", code: "KZ" },
    { name: "Kenya", code: "KE" },
    { name: "Kiribati", code: "KI" },
    { name: "Korea (North)", code: "KP" },
    { name: "Korea (South)", code: "KR" },
    { name: "Kuwait", code: "KW" },
    { name: "Kyrgyzstan", code: "KG" },
    { name: "Laos", code: "LA" },
    { name: "Latvia", code: "LV" },
    { name: "Lebanon", code: "LB" },
    { name: "Lesotho", code: "LS" },
    { name: "Liberia", code: "LR" },
    { name: "Libya", code: "LY" },
    { name: "Liechtenstein", code: "LI" },
    { name: "Lithuania", code: "LT" },
    { name: "Luxembourg", code: "LU" },
    { name: "Madagascar", code: "MG" },
    { name: "Malawi", code: "MW" },
    { name: "Malaysia", code: "MY" },
    { name: "Maldives", code: "MV" },
    { name: "Mali", code: "ML" },
    { name: "Malta", code: "MT" },
    { name: "Marshall Islands", code: "MH" },
    { name: "Mauritania", code: "MR" },
    { name: "Mauritius", code: "MU" },
    { name: "Mexico", code: "MX" },
    { name: "Micronesia", code: "FM" },
    { name: "Moldova", code: "MD" },
    { name: "Monaco", code: "MC" },
    { name: "Mongolia", code: "MN" },
    { name: "Montenegro", code: "ME" },
    { name: "Morocco", code: "MA" },
    { name: "Mozambique", code: "MZ" },
    { name: "Myanmar (Burma)", code: "MM" },
    { name: "Namibia", code: "NA" },
    { name: "Nauru", code: "NR" },
    { name: "Nepal", code: "NP" },
    { name: "Netherlands", code: "NL" },
    { name: "New Zealand", code: "NZ" },
    { name: "Nicaragua", code: "NI" },
    { name: "Niger", code: "NE" },
    { name: "Nigeria", code: "NG" },
    { name: "North Macedonia", code: "MK" },
    { name: "Norway", code: "NO" },
    { name: "Oman", code: "OM" },
    { name: "Pakistan", code: "PK" },
    { name: "Palau", code: "PW" },
    { name: "Palestine", code: "PS" },
    { name: "Panama", code: "PA" },
    { name: "Papua New Guinea", code: "PG" },
    { name: "Paraguay", code: "PY" },
    { name: "Peru", code: "PE" },
    { name: "Philippines", code: "PH" },
    { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" },
    { name: "Qatar", code: "QA" },
    { name: "Romania", code: "RO" },
    { name: "Russia", code: "RU" },
    { name: "Rwanda", code: "RW" },
    { name: "Saint Kitts and Nevis", code: "KN" },
    { name: "Saint Lucia", code: "LC" },
    { name: "Saint Vincent and the Grenadines", code: "VC" },
    { name: "Samoa", code: "WS" },
    { name: "San Marino", code: "SM" },
    { name: "Sao Tome and Principe", code: "ST" },
    { name: "Saudi Arabia", code: "SA" },
    { name: "Senegal", code: "SN" },
    { name: "Serbia", code: "RS" },
    { name: "Seychelles", code: "SC" },
    { name: "Sierra Leone", code: "SL" },
    { name: "Singapore", code: "SG" },
    { name: "Slovakia", code: "SK" },
    { name: "Slovenia", code: "SI" },
    { name: "Solomon Islands", code: "SB" },
    { name: "Somalia", code: "SO" },
    { name: "South Africa", code: "ZA" },
    { name: "South Sudan", code: "SS" },
    { name: "Spain", code: "ES" },
    { name: "Sri Lanka", code: "LK" },
    { name: "Sudan", code: "SD" },
    { name: "Suriname", code: "SR" },
    { name: "Sweden", code: "SE" },
    { name: "Switzerland", code: "CH" },
    { name: "Syria", code: "SY" },
    { name: "Taiwan", code: "TW" },
    { name: "Tajikistan", code: "TJ" },
    { name: "Tanzania", code: "TZ" },
    { name: "Thailand", code: "TH" },
    { name: "Timor-Leste", code: "TL" },
    { name: "Togo", code: "TG" },
    { name: "Tonga", code: "TO" },
    { name: "Trinidad and Tobago", code: "TT" },
    { name: "Tunisia", code: "TN" },
    { name: "Turkey", code: "TR" },
    { name: "Turkmenistan", code: "TM" },
    { name: "Tuvalu", code: "TV" },
    { name: "Uganda", code: "UG" },
    { name: "Ukraine", code: "UA" },
    { name: "United Arab Emirates", code: "AE" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
    { name: "Uruguay", code: "UY" },
    { name: "Uzbekistan", code: "UZ" },
    { name: "Vanuatu", code: "VU" },
    { name: "Vatican City", code: "VA" },
    { name: "Venezuela", code: "VE" },
    { name: "Vietnam", code: "VN" },
    { name: "Yemen", code: "YE" },
    { name: "Zambia", code: "ZM" },
    { name: "Zimbabwe", code: "ZW" }
  ];

  const normalize = (str) => str.toLowerCase().replace(/\s+/g, "");

  async function startPayPal(data: FormValues) {

    let planId = paypalPlanIdTwo;
    if (plan.name === "Monthly Plan") {
      planId = paypalPlanIdOne;
    }
    const codeCountry = findCountryCode(data.country);
    const dataToSend = {
      planId: planId,
      email: data.email,
      name: data.firstName,
      lastName: data.lastName,
      post: data.zipCode,
      address: data.address,
      country: codeCountry,
      brand: companyName,
      admin: data.state
    };
    try {
      const postURL = serverURL + '/api/paypal';
      const res = await axios.post(postURL, dataToSend);
      sessionStorage.setItem('method', 'paypal');
      sessionStorage.setItem('plan', plan.name);
      setIsProcessing(false);
      const links = res.data.links;
      const approveLink = links.find(link => link.rel === "approve");
      const approveHref = approveLink ? approveLink.href : null;
      window.location.href = approveHref;
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({
        title: t('error.title'),
        description: t('details.errors.internalError'),
      });
    }
  }

  const findCountryCode = (country) => {
    const normalizedInput = normalize(country);

    const match = countryList.find(
      (item) => normalize(item.name) === normalizedInput
    );

    if (match) {
      return match.code;
    } else {
      return "US";
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('details.title')}</h1>
        <p className="text-muted-foreground">
          {t('details.subtitle', { planName: plan.name })}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Payment Info */}
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    {t('details.billingInformation')}
                  </CardTitle>
                  <CardDescription>
                    {t('details.billingDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('firstName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('details.placeholders.firstName')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('lastName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('details.placeholders.lastName')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('details.placeholders.email')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {t('details.shippingAddress')}
                  </CardTitle>
                  <CardDescription>
                    {t('details.shippingDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('details.placeholders.address')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('city')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('details.placeholders.city')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('state')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('details.placeholders.state')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('zipCode')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('details.placeholders.zipCode')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('country')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('details.placeholders.country')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t('paymentMethod')}
                  </CardTitle>
                  <CardDescription>
                    {t('details.paymentMethodDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid grid-cols-6 mb-6">
                      {paypalEnabled ? <TabsTrigger value="paypal">PayPal</TabsTrigger> : null}
                      {stripeEnabled ? <TabsTrigger value="stripe">Stripe</TabsTrigger> : null}
                      {flutterwaveEnabled ? <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger> : null}
                      {paystackEnabled ? <TabsTrigger value="paystack">Paystack</TabsTrigger> : null}
                      {razorpayEnabled ? <TabsTrigger value="razorpay">Razorpay</TabsTrigger> : null}
                      {mercadopagoEnabled ? <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger> : null}
                    </TabsList>

                    <TabsContent value="paypal">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <Globe className="h-12 w-12 text-blue-500" />
                        <p className="text-center">
                          {t('details.paypalDescription')}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="stripe">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <CreditCardIcon className="h-12 w-12 text-indigo-500" />
                        <p className="text-center">
                          {t('details.stripeDescription')}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="flutterwave">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <Smartphone className="h-12 w-12 text-orange-500" />
                        <p className="text-center">
                          {t('details.flutterwaveDescription')}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="paystack">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <HandCoins className="h-12 w-12 text-purple-500" />
                        <p className="text-center">
                          {t('details.paystackDescription')}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="razorpay">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <DollarSign className="h-12 w-12 text-blue-600" />
                        <p className="text-center">
                          {t('details.razorpayDescription')}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="mercadopago">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <CreditCardIcon className="h-12 w-12 text-blue-400" />
                        <p className="text-center">
                          {t('details.mercadopagoDescription')}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-primary"
                    disabled={isProcessing}
                  >
                    {isProcessing ? t('details.processing') : t('details.payButton', { amount: plan.price })}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>{t('details.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">{plan.name}</span>
                <span>${plan.price}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>{t('details.total')}</span>
                <span>${plan.price}</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <h4 className="font-medium mb-2">{t('details.whatsIncluded')}</h4>
                <ul className="space-y-2 text-sm">

                  {getPlanFeatures(plan.name).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
