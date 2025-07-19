'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Brain, 
  Twitter, 
  Github, 
  Mail, 
  ArrowRight,
  BookOpen,
  BarChart3,
  Chrome,
  Shield,
  HelpCircle,
  FileText
} from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Bonsai</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              The future of SAT preparation. AI-powered tutoring, real-time assistance, 
              and advanced analytics to help you achieve your target score.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Stay updated with SAT tips & features</p>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email" 
                  type="email"
                  className="max-w-64"
                />
                <Button size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-foreground flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Features
                </Link>
              </li>
              <li>
                <Link href="/extension" className="text-muted-foreground hover:text-foreground flex items-center">
                  <Chrome className="h-4 w-4 mr-2" />
                  Browser Extension
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-muted-foreground hover:text-foreground">
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  SAT Blog
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-muted-foreground hover:text-foreground">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-muted-foreground hover:text-foreground">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 Bonsai. All rights reserved. Built for students, by educators.
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="https://twitter.com/bonsaisat" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://github.com/bonsaisat" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="mailto:support@bonsaisat.com" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}