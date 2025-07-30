import { Navbar } from"@/components/layout/Navbar";
import { Hero } from"@/components/home/Hero";
import { HowItWorks } from"@/components/home/HowItWorks";
import { Features } from"@/components/home/Features";
import { Testimonials } from"@/components/home/Testimonials";
import { CTA } from"@/components/home/CTA";
import { Footer } from"@/components/layout/Footer"; const Index = () => { return ( <div className="min-h-screen bg-background"> <Navbar /> <main> <Hero /> <HowItWorks /> <Features /> <Testimonials /> <CTA /> </main> <Footer /> </div> );
}; export default Index;
