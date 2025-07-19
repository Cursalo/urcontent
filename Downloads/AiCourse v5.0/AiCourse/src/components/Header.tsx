
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { appName } from '@/constants';
import Logo from '../res/logo.svg';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-10 py-4",
        isScrolled ? "bg-glass border-b border-border/40" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
            <img src={Logo} alt="Logo" className='h-6 w-6' />
          </div>
          <span className="font-display font-medium text-lg">{appName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">{t('navigation.features')}</a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">{t('navigation.howItWorks')}</a>
          <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">{t('navigation.pricing')}</a>
        </nav>

        {/* Call to Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm">{t('login')}</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90 transition-colors">{t('getStarted')}</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            className="flex flex-col space-y-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={cn(
              "block w-6 h-0.5 bg-foreground transition-transform duration-300",
              isMobileMenuOpen && "translate-y-2 rotate-45"
            )}></span>
            <span className={cn(
              "block w-6 h-0.5 bg-foreground transition-opacity duration-300",
              isMobileMenuOpen && "opacity-0"
            )}></span>
            <span className={cn(
              "block w-6 h-0.5 bg-foreground transition-transform duration-300",
              isMobileMenuOpen && "-translate-y-2 -rotate-45"
            )}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-x-0 bg-background border-b border-border/40 transition-all duration-300 ease-in-out",
        isMobileMenuOpen ? "top-[64px] opacity-100" : "-top-full opacity-0"
      )}>
        <div className="px-6 py-6 flex flex-col space-y-4">
          <a href="#features" className="text-base font-medium py-2">{t('navigation.features')}</a>
          <a href="#how-it-works" className="text-base font-medium py-2">{t('navigation.howItWorks')}</a>
          <a href="#pricing" className="text-base font-medium py-2">{t('navigation.pricing')}</a>
          <div className="flex flex-col space-y-2 pt-2">
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full">{t('login')}</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="w-full">{t('getStarted')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
