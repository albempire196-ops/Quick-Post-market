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

const Index = lazy(() => import("./pages/Index"));

const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Workers = lazy(() => import("./pages/Workers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
                <Suspense fallback={
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-primary animate-morph flex items-center justify-center shadow-button">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      </div>
                      <div className="w-32 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-primary rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      </div>
                    </div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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
