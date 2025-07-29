import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Precios = lazy(() => import("./pages/Precios"));
const ComoFunciona = lazy(() => import("./pages/ComoFunciona"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Experiences = lazy(() => import("./pages/Experiences"));
const ExperiencesSimple = lazy(() => import("./pages/ExperiencesSimple"));
const Membership = lazy(() => import("./pages/Membership"));
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const CampaignManagement = lazy(() => import("./pages/CampaignManagement"));
const Messages = lazy(() => import("./pages/Messages"));
const RegistroComercio = lazy(() => import("./pages/RegistroComercio"));
const RegistroCreador = lazy(() => import("./pages/RegistroCreador"));
const BusinessOnboarding = lazy(() => import("./pages/BusinessOnboarding"));
const CreatorOnboarding = lazy(() => import("./pages/CreatorOnboarding"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VenueDashboard = lazy(() => import("./pages/business/VenueDashboard"));
const ContentReview = lazy(() => import("./pages/business/ContentReview"));
const PublicCreatorProfile = lazy(() => import("./pages/PublicCreatorProfile"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const TestPayments = lazy(() => import("./pages/TestPayments"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/precios" element={<Precios />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/experiences" element={<ExperiencesSimple />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/creator/:id" element={<CreatorProfile />} />
            <Route path="/c/:slug" element={<PublicCreatorProfile />} />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <CampaignManagement />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/registro/comercio" element={<RegistroComercio />} />
            <Route path="/onboarding/business" element={<BusinessOnboarding />} />
            <Route path="/registro/creador" element={<RegistroCreador />} />
            <Route path="/onboarding/creator" element={<CreatorOnboarding />} />
            {/* BULLETPROOF DASHBOARD ROUTING: Auto-detect role or force specific role */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/:role" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/venue-dashboard" element={
              <ProtectedRoute>
                <VenueDashboard />
              </ProtectedRoute>
            } />
            <Route path="/content-review" element={
              <ProtectedRoute requiredRole="business">
                <ContentReview />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/messages/:conversationId" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentPending />} />
            <Route path="/test-payments" element={<TestPayments />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
