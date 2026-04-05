import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ColorThemeProvider } from "@/contexts/ColorThemeContext";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import SellerProfile from "./pages/SellerProfile";

const Jobs = lazy(() => import("./pages/Jobs"));
const Workers = lazy(() => import("./pages/Workers"));
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ColorThemeProvider>
        <AuthProvider>
          <LanguageProvider>
          <SubscriptionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/workers" element={<Workers />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/seller/:sellerId" element={<SellerProfile />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    {/* Catch all routes starting with /~oauth and redirect to home */}
                    <Route path="/~oauth/*" element={<Navigate to="/" replace />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </SubscriptionProvider>
          </LanguageProvider>
        </AuthProvider>
      </ColorThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
