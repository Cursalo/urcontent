import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Precios from "./pages/Precios";
import ComoFunciona from "./pages/ComoFunciona";
import Marketplace from "./pages/Marketplace";
import Experiences from "./pages/Experiences";
import ExperiencesSimple from "./pages/ExperiencesSimple";
import Membership from "./pages/Membership";
import CreatorProfile from "./pages/CreatorProfile";
import CampaignManagement from "./pages/CampaignManagement";
import Messages from "./pages/Messages";
import RegistroComercio from "./pages/RegistroComercio";
import RegistroCreador from "./pages/RegistroCreador";
import BusinessOnboarding from "./pages/BusinessOnboarding";
import CreatorOnboarding from "./pages/CreatorOnboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import VenueDashboard from "./pages/business/VenueDashboard";
import ContentReview from "./pages/business/ContentReview";
import PublicCreatorProfile from "./pages/PublicCreatorProfile";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentPending from "./pages/PaymentPending";
import TestPayments from "./pages/TestPayments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/dashboard" element={
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
