import { Search, Plus, Sparkles, LogOut, Settings, Menu, Download, UserRound, Briefcase, Users, X, LayoutDashboard, LogIn, Home, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { countries } from "@/data/countries";

interface HeaderProps {
  onAddProduct: () => void;
  onAddWorker?: () => void;
  onSignIn?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const Header = ({ onAddProduct, onAddWorker, onSignIn, searchQuery, onSearchChange }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [jobCountryModalOpen, setJobCountryModalOpen] = useState(false);
  const [jobCountry, setJobCountry] = useState("");
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userEmail = user?.email || "";
  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "?";

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`navbar-glass sticky top-0 z-50 transition-all duration-700 ease-premium ${scrolled ? 'navbar-glass--scrolled py-1.5 sm:py-2' : 'py-2.5 sm:py-3'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button group-hover:scale-110 group-hover:shadow-glow group-hover:rotate-3 transition-all duration-500 ease-premium relative overflow-hidden">
              <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary-foreground relative z-10" />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-bold text-[15px] leading-tight tracking-tight">Quick Post</span>
              <span className="text-[9px] font-sans font-semibold text-primary/80 tracking-[0.2em] uppercase">Marketplace</span>
            </div>
          </button>
          
          {/* Desktop Nav Links — Pill style */}
          <nav className="hidden md:flex items-center gap-0.5 bg-secondary/30 rounded-2xl p-1 border border-border/15">
            <button
              onClick={() => navigate("/")}
              className={`nav-pill ${isActive("/") ? "nav-pill--active" : ""}`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className={`nav-pill ${isActive("/dashboard") ? "nav-pill--active" : ""}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setJobCountryModalOpen(true)}
              className="nav-pill"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Jobs
            </button>
          </nav>
          
          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              type="text"
              placeholder={t("search_products")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 input-premium"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-all duration-200"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 md:hidden transition-all duration-300"
          >
            {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>

          {/* Spacer for mobile */}
          <div className="flex-1 md:hidden" />
          
          {/* Desktop Download App Button */}
          {canInstall && !isInstalled && (
            <Button
              onClick={install}
              variant="outline"
              className="gap-2 font-semibold h-11 px-5 rounded-2xl hidden md:flex border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Download App
            </Button>
          )}

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              onClick={onAddProduct} 
              className="gap-2 font-semibold h-9 px-5 btn-premium text-xs"
            >
              <span className="btn-shine" />
              <Plus className="w-3.5 h-3.5" />
              {t("post_product")}
            </Button>

            <Button
              onClick={() => onAddWorker?.()}
              variant="ghost"
              className="gap-2 font-semibold h-9 px-4 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-300"
            >
              <Users className="w-3.5 h-3.5" />
              {t('find_worker')}
            </Button>
          </div>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-border/30 hover:ring-primary/40 hover:scale-105 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={userEmail} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 navbar-dropdown rounded-2xl p-1.5 shadow-premium border-border/20">
                  <div className="px-3 py-2.5 border-b border-border/20 mb-1">
                    <p className="font-semibold text-sm truncate">{userEmail}</p>
                    <p className="text-[11px] text-muted-foreground">Member</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/")} className="gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 focus:bg-secondary/60">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 focus:bg-secondary/60">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 focus:bg-secondary/60">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    {t("settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => user && navigate(`/seller/${user.id}`)} className="gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 focus:bg-secondary/60">
                    <UserRound className="w-4 h-4 text-muted-foreground" />
                    My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="gap-2.5 text-destructive cursor-pointer rounded-xl px-3 py-2.5 focus:bg-destructive/10">
                    <LogOut className="w-4 h-4" />
                    {t("sign_out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onSignIn}
                variant="outline"
                className="gap-2 font-semibold h-9 px-4 rounded-xl text-xs btn-secondary-premium"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground md:hidden transition-all duration-300"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-l-0 navbar-mobile-sheet overflow-hidden">
              <SheetTitle className="sr-only">Menu</SheetTitle>

              {/* Top light refraction line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent z-10 pointer-events-none" />

              {/* Ambient glow orbs */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-20 left-0 w-32 h-32 bg-accent/6 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex flex-col h-full relative">
                {/* User Section - Premium glassmorphic header */}
                <div className="relative px-5 pt-14 pb-5">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent pointer-events-none" />
                  {user ? (
                    <div className="relative flex items-center gap-3.5">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 blur-sm animate-pulse" style={{ animationDuration: '3s' }} />
                        <Avatar className="w-12 h-12 ring-2 ring-white/20 shadow-lg relative">
                          <AvatarImage src={user?.user_metadata?.avatar_url} alt={userEmail} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{userEmail}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.500)]" />
                          <p className="text-[11px] text-muted-foreground font-medium">Active Member</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                        <UserRound className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Welcome</p>
                        <p className="text-[11px] text-muted-foreground">Sign in to get started</p>
                      </div>
                    </div>
                  )}
                  {/* Subtle bottom separator with glow */}
                  <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-border/30 to-transparent" />
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto mobile-nav-scroll">
                  {/* Primary Navigation */}
                  <div className="px-2 pt-1 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Navigate</p>
                  </div>

                  <button
                    onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
                    className={`mobile-nav-item group ${isActive("/") ? "mobile-nav-item--active" : ""}`}
                  >
                    <div className={`mobile-nav-icon ${isActive("/") ? "mobile-nav-icon--active" : ""}`}>
                      <Home className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1 font-semibold text-[13px]">Home</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                  </button>

                  <button
                    onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                    className={`mobile-nav-item group ${isActive("/dashboard") ? "mobile-nav-item--active" : ""}`}
                  >
                    <div className={`mobile-nav-icon ${isActive("/dashboard") ? "mobile-nav-icon--active" : ""}`}>
                      <LayoutDashboard className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1 font-semibold text-[13px]">Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                  </button>

                  {/* Actions Section */}
                  <div className="px-2 pt-4 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Actions</p>
                  </div>

                  <button
                    onClick={() => { onAddProduct(); setMobileMenuOpen(false); }}
                    className="mobile-nav-item--cta group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Plus className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1 font-bold text-[13px]">{t("post_product")}</span>
                    <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </div>
                  </button>

                  <button
                    onClick={() => { setJobCountryModalOpen(true); setMobileMenuOpen(false); }}
                    className="mobile-nav-item group"
                  >
                    <div className="mobile-nav-icon">
                      <Briefcase className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1 font-semibold text-[13px]">{t('find_job')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                  </button>

                  <button
                    onClick={() => { onAddWorker?.(); setMobileMenuOpen(false); }}
                    className="mobile-nav-item group"
                  >
                    <div className="mobile-nav-icon">
                      <Users className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1 font-semibold text-[13px]">{t('find_worker')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                  </button>

                  {canInstall && !isInstalled && (
                    <button
                      onClick={() => { install(); setMobileMenuOpen(false); }}
                      className="mobile-nav-item group"
                    >
                      <div className="mobile-nav-icon">
                        <Download className="w-[18px] h-[18px]" />
                      </div>
                      <span className="flex-1 font-semibold text-[13px]">Download App</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                    </button>
                  )}

                  {/* Account Section */}
                  <div className="px-2 pt-4 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Account</p>
                  </div>

                  {user && (
                    <button
                      onClick={() => { navigate(`/seller/${user.id}`); setMobileMenuOpen(false); }}
                      className="mobile-nav-item group"
                    >
                      <div className="mobile-nav-icon">
                        <UserRound className="w-[18px] h-[18px]" />
                      </div>
                      <span className="flex-1 font-semibold text-[13px]">My Profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                    </button>
                  )}

                  <button
                    onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}
                    className="mobile-nav-item group"
                  >
                    <div className="mobile-nav-icon">
                      <Settings className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1 font-semibold text-[13px]">{t("settings")}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all duration-300" />
                  </button>
                </nav>

                {/* Bottom Action — Sign Out / Sign In */}
                <div className="relative px-3 pb-4 pt-2">
                  <div className="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-border/25 to-transparent" />
                  {user ? (
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-destructive/80 hover:text-destructive hover:bg-destructive/[0.06] transition-all duration-300"
                    >
                      <div className="w-9 h-9 rounded-xl bg-destructive/8 flex items-center justify-center">
                        <LogOut className="w-[18px] h-[18px]" />
                      </div>
                      <span className="font-semibold text-[13px]">{t("sign_out")}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { onSignIn?.(); setMobileMenuOpen(false); }}
                      className="mobile-nav-item--cta group w-full"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <LogIn className="w-[18px] h-[18px]" />
                      </div>
                      <span className="flex-1 font-bold text-[13px]">Sign In</span>
                      <Shield className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  )}

                  {/* Trust badge */}
                  <div className="flex items-center justify-center gap-1.5 mt-3 opacity-40">
                    <Shield className="w-3 h-3" />
                    <span className="text-[9px] font-medium tracking-wider uppercase">Encrypted & Secure</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Search Bar - expandable */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-premium ${mobileSearchOpen ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search_products")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 bg-secondary/40 border border-border/40 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 placeholder:text-muted-foreground/50"
              autoFocus={mobileSearchOpen}
            />
          </div>
        </div>
      </div>

      {/* Job country modal */}
      <Dialog open={jobCountryModalOpen} onOpenChange={(o) => setJobCountryModalOpen(o)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('find_job')}</DialogTitle>
            <DialogDescription>Choose a country to filter job listings</DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Country</label>
            <div className="max-w-xs">
              <Select value={jobCountry || "__all"} onValueChange={(v) => setJobCountry(v === "__all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="All countries" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="__all">All countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setJobCountryModalOpen(false)}>Cancel</Button>
              <Button onClick={() => { setJobCountryModalOpen(false); if (jobCountry) navigate(`/jobs?country=${jobCountry}`); else navigate('/jobs'); }}>
                View Jobs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
