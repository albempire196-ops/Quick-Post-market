import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { AddProductModal } from "@/components/AddProductModal";
import AddWorkerModal from "@/components/AddWorkerModal";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { QuickGuideModal } from "@/components/QuickGuideModal";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/home-interior.jpg";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Users, Star, Hotel, Building2, CarFront, Wrench, ShoppingBag, Sparkles, ChevronRight, CheckCircle2, Layers, LayoutDashboard } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedCountry] = useState<string>("al");
  const [searchQuery, setSearchQuery] = useState("");

  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("marketplace-guide-seen")) {
      setShowGuide(true);
      localStorage.setItem("marketplace-guide-seen", "1");
    }
  }, []);

  const handlePostProduct = () => {
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleAddWorker = () => {
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setShowAddWorkerModal(true);
    }
  };

  const features = [
    { icon: Zap, title: t("fast_listing"), desc: t("fast_listing_desc"), color: "from-violet-500 to-purple-600" },
    { icon: Shield, title: t("secure_transactions"), desc: t("secure_transactions_desc"), color: "from-emerald-500 to-teal-600" },
    { icon: Globe, title: t("global_reach"), desc: t("global_reach_desc"), color: "from-amber-500 to-orange-600" },
  ];

  const quickCategories = [
    { icon: Hotel, label: "Hotels", color: "from-blue-500 to-cyan-500", category: "hotels" },
    { icon: Building2, label: "Houses", color: "from-emerald-500 to-teal-500", category: "house_rent" },
    { icon: CarFront, label: "Cars", color: "from-amber-500 to-orange-500", category: "car_rent" },
    { icon: ShoppingBag, label: "Products", color: "from-violet-500 to-purple-500", category: "all" },
    { icon: Wrench, label: "Services", color: "from-rose-500 to-pink-500", category: "services" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden page-enter">
      <div className="fixed inset-0 mesh-gradient opacity-90 pointer-events-none" />
      
      {/* Ambient glow orbs — dramatic visible */}
      <div className="fixed top-[-15%] left-[5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px] pointer-events-none animate-float-slow" />
      <div className="fixed top-[25%] right-[-10%] w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="fixed bottom-[-15%] left-[25%] w-[700px] h-[700px] bg-[hsl(280,80%,65%)]/12 rounded-full blur-[160px] pointer-events-none animate-float-slow" style={{ animationDelay: '4s' }} />
      <div className="fixed top-[60%] left-[60%] w-[400px] h-[400px] bg-[hsl(160,70%,50%)]/8 rounded-full blur-[120px] pointer-events-none animate-float" />
      
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />

      <Header
        onAddProduct={handlePostProduct}
        onAddWorker={handleAddWorker}
        onSignIn={() => setShowAuthPrompt(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section — Multi-industry cinematic */}
      <section className="relative min-h-[520px] sm:min-h-[600px] lg:min-h-[720px] overflow-hidden pb-0">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Home interior" 
            className="w-full h-full object-cover scale-105 animate-[scale-in_1.5s_ease-out_forwards]" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background)/0.5)_100%)]" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left — content */}
            <div className="max-w-2xl liquid-glass rounded-[2rem] p-7 sm:p-10 space-y-6 sm:space-y-8 flex-1">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 animate-blur-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex -space-x-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-background">Q</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-accent flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-background">P</div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-background">M</div>
                </div>
                <span className="text-sm font-semibold">Trusted by thousands worldwide</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t("hero_title_1")}{" "}
                <span className="text-gradient animate-gradient bg-[length:200%_200%]">{t("hero_title_2")}</span>
                <br />{t("hero_title_3")}
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg opacity-0 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                {t("hero_subtitle")}
              </p>

              {/* Quick category pills */}
              <div className="flex flex-wrap gap-2.5 opacity-0 animate-fade-in" style={{ animationDelay: '0.45s' }}>
                {quickCategories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => {
                      navigate(`/dashboard?category=${cat.category}`);
                    }}
                    className="group/pill pill-aura flex items-center gap-2 glass rounded-2xl px-4 py-2.5 hover:scale-[1.04] active:scale-[0.97] transition-all duration-300 ease-premium border border-transparent hover:border-primary/20"
                  style={{ '--pill-color': `hsl(var(--primary) / 0.08)` } as React.CSSProperties}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm group-hover/pill:shadow-button transition-shadow duration-300`}>
                      <cat.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold">{cat.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.55s' }}>
                <Button 
                  onClick={handlePostProduct} 
                  size="lg" 
                  className="h-13 sm:h-14 px-7 sm:px-8 text-sm sm:text-base font-semibold btn-premium group"
                >
                  <span className="btn-shine" />
                  {t("list_product")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300 ease-premium" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-background flex items-center justify-center">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-foreground">4.9/5</span>
                    <span className="text-muted-foreground ml-1">from users</span>
                  </div>
                </div>
              </div>

              {/* Live stats strip */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border/20 opacity-0 animate-fade-in" style={{ animationDelay: '0.65s' }}>
                <div className="flex items-center gap-2">
                  <div className="status-dot bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground"><strong className="text-foreground">195+</strong> Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground"><strong className="text-foreground">Free</strong> to list</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground"><strong className="text-foreground">Instant</strong> posting</span>
                </div>
              </div>
            </div>

            {/* Right — 3D Glassmorphism floating element */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {/* Outer glow */}
              <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/25 via-accent/20 to-[hsl(280,80%,65%)]/15 blur-[80px] animate-breathe" />
              
              {/* Main 3D glass orb */}
              <div className="glass-orb relative w-[320px] h-[320px] xl:w-[380px] xl:h-[380px] rounded-[4rem] animate-float-slow"
                style={{ transformStyle: 'preserve-3d', perspective: '800px' }}>
                {/* Glass faces */}
                <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-br from-white/20 via-white/5 to-transparent backdrop-blur-xl border border-white/25 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.05),inset_0_0_80px_rgba(255,255,255,0.08)] overflow-hidden">
                  {/* Refraction highlight */}
                  <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-t-[4rem]" />
                  {/* Inner glow effect */}
                  <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-gradient-x" style={{ backgroundSize: '200% 200%' }} />
                  {/* Floating icons inside */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0s' }}>
                        <Hotel className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '2s' }}>
                        <CarFront className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '3s' }}>
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground/80 mt-2">All in one place</p>
                  </div>
                </div>
                
                {/* Orbiting small glass chips */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl glass-strong border border-white/20 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-2xl glass-strong border border-white/20 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="absolute top-1/2 -right-6 w-14 h-14 rounded-xl glass-strong border border-white/20 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '2.5s' }}>
                  <Globe className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth curved transition — SVG wave that blends hero into features */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[1px]">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[60px] sm:h-[80px] lg:h-[120px]" preserveAspectRatio="none">
            <path d="M0 120L0 60C240 20 480 0 720 10C960 20 1200 60 1440 40L1440 120L0 120Z" fill="hsl(var(--background))" />
            <path d="M0 120L0 80C320 40 640 20 720 25C800 30 1120 60 1440 55L1440 120L0 120Z" fill="hsl(var(--background))" fillOpacity="0.5" />
          </svg>
        </div>
      </section>

      {/* Features Section — premium glass cards with header */}
      <section className="relative py-16 sm:py-24 -mt-1 section-aura" style={{ background: 'hsl(var(--background))' }}>
        {/* Atmospheric orbs for this section */}
        <div className="absolute top-12 left-[10%] w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none animate-breathe" />
        <div className="absolute bottom-0 right-[15%] w-[350px] h-[350px] bg-accent/[0.04] rounded-full blur-[100px] pointer-events-none animate-breathe" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-5 animate-blur-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">Why Quick Post Market</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
              The smarter way to{" "}
              <span className="text-gradient animate-gradient bg-[length:200%_200%]">buy & sell</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Everything you need in one beautiful platform — from hotels to houses, cars to services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7 stagger-children">
            {features.map((feature, i) => (
              <div key={feature.title} className="group/feature relative liquid-glass rounded-[2rem] p-7 sm:p-8 card-shine hover:shadow-card-hover hover:-translate-y-3 transition-all duration-500 ease-premium overflow-hidden">
                {/* Decorative gradient blob */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-[0.07] rounded-full blur-3xl group-hover/feature:opacity-[0.18] transition-opacity duration-700`} />
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-button mb-6 group-hover/feature:scale-110 group-hover/feature:shadow-glow group-hover/feature:rotate-3 transition-all duration-500 ease-premium`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-sans font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.desc}</p>
                  <div className="flex items-center gap-1.5 text-primary text-sm font-semibold opacity-0 translate-y-2 group-hover/feature:opacity-100 group-hover/feature:translate-y-0 transition-all duration-400 ease-premium">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="section-divider" />

      {/* How It Works — 3-step glass timeline */}
      <section className="relative py-16 sm:py-24 overflow-hidden section-aura-alt">
        {/* Flowing decorative orbs */}
        <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-[hsl(280,80%,65%)]/[0.04] rounded-full blur-[140px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-[hsl(160,70%,50%)]/[0.04] rounded-full blur-[120px] pointer-events-none animate-float-slow" style={{ animationDelay: '3s' }} />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-5">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">How it works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
              Get started in <span className="text-gradient animate-gradient bg-[length:200%_200%]">seconds</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 relative">
            {/* Connector line — gradient with glow */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 blur-[6px] rounded-full" />
            </div>
            
            {[
              { step: "01", title: "Create your listing", desc: "Upload photos, set your price, and describe what you're offering — hotels, houses, cars, or anything.", icon: Sparkles, color: "from-violet-500 to-purple-600" },
              { step: "02", title: "Connect with buyers", desc: "Your listing goes live instantly. Interested buyers reach out directly via chat or contact details.", icon: Users, color: "from-emerald-500 to-teal-600" },
              { step: "03", title: "Close the deal", desc: "Agree on terms, finalize the transaction, and mark your listing as sold. Simple and secure.", icon: CheckCircle2, color: "from-amber-500 to-orange-600" },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group/step opacity-0 animate-fade-in" style={{ animationDelay: `${0.15 * i}s` }}>
                <div className="relative inline-flex mb-6">
                  {/* Aura glow behind icon */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.color} opacity-0 group-hover/step:opacity-30 blur-2xl transition-opacity duration-700 scale-150`} />
                  {/* Step icon */}
                  <div className={`w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-button group-hover/step:scale-110 group-hover/step:shadow-glow transition-all duration-500 ease-premium relative z-10`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  {/* Glass badge with step # */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl glass-strong border border-white/25 flex items-center justify-center text-xs font-bold text-primary z-20 shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-sans font-bold text-lg sm:text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="section-divider" />

      {/* Stats counter section */}
      <section className="relative py-14 sm:py-20 section-aura">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="liquid-glass rounded-[2.5rem] p-8 sm:p-12 overflow-hidden relative">
            {/* Background decorations with animation */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[80px] animate-breathe" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-[60px] animate-breathe" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent rounded-full blur-[60px]" />
            
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
              {[
                { value: "195+", label: "Countries", color: "text-primary" },
                { value: "100%", label: "Free to list", color: "text-emerald-500" },
                { value: "24/7", label: "Support", color: "text-amber-500" },
                { value: "10K+", label: "Happy Users", color: "text-violet-500" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center opacity-0 animate-counter group/stat" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-display font-bold ${stat.color} mb-1 group-hover/stat:scale-110 transition-transform duration-500 ease-premium`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="section-divider" />

      {/* CTA — Explore Marketplace */}
      <section className="relative py-20 sm:py-28 section-aura-alt overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="liquid-glass rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/20 rounded-full blur-[80px] animate-breathe" />
              <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-accent/15 rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent rounded-full blur-[60px]" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                <LayoutDashboard className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold tracking-wider uppercase text-primary">Marketplace</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
                Ready to explore{" "}
                <span className="text-gradient animate-gradient bg-[length:200%_200%]">listings?</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
                Browse thousands of products, hotels, houses, cars and services from sellers worldwide — all in your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="h-14 px-10 text-base font-semibold btn-premium group"
                >
                  <span className="btn-shine" />
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Open Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300 ease-premium" />
                </Button>
                <Button
                  onClick={handlePostProduct}
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-semibold btn-secondary-premium"
                >
                  {t("list_product")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AddProductModal open={showAddModal} onClose={() => setShowAddModal(false)} country={selectedCountry} />
      <AddWorkerModal open={showAddWorkerModal} onClose={() => setShowAddWorkerModal(false)} />

      <QuickGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default Index;
