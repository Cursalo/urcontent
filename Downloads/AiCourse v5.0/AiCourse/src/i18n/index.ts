import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Spanish translations (PRIMARY)
import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esDashboard from './locales/es/dashboard.json';
import esPayment from './locales/es/payment.json';
import esCourse from './locales/es/course.json';
import esAdmin from './locales/es/admin.json';
import esHome from './locales/es/home.json';
import esProfile from './locales/es/profile.json';
import esContact from './locales/es/contact.json';
import esCertificate from './locales/es/certificate.json';
import esAbout from './locales/es/about.json';
import esLegal from './locales/es/legal.json';
import esBlog from './locales/es/blog.json';

// English translations (FALLBACK)
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enPayment from './locales/en/payment.json';
import enCourse from './locales/en/course.json';
import enAdmin from './locales/en/admin.json';
import enHome from './locales/en/home.json';
import enProfile from './locales/en/profile.json';
import enContact from './locales/en/contact.json';
import enCertificate from './locales/en/certificate.json';
import enAbout from './locales/en/about.json';
import enLegal from './locales/en/legal.json';
import enBlog from './locales/en/blog.json';

const resources = {
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    payment: esPayment,
    course: esCourse,
    admin: esAdmin,
    home: esHome,
    profile: esProfile,
    contact: esContact,
    certificate: esCertificate,
    about: esAbout,
    legal: esLegal,
    blog: esBlog,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    payment: enPayment,
    course: enCourse,
    admin: enAdmin,
    home: enHome,
    profile: enProfile,
    contact: enContact,
    certificate: enCertificate,
    about: enAbout,
    legal: enLegal,
    blog: enBlog,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Spanish as default
    fallbackLng: 'en', // English as fallback
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'payment', 'course', 'admin', 'home', 'profile', 'contact', 'certificate', 'about', 'legal', 'blog'],
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

export default i18n;