import { Search, Plus, Sparkles, LogOut, Settings, MessageCircle, Menu, Download } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface HeaderProps {
  onAddProduct: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const Header = ({ onAddProduct, searchQuery, onSearchChange }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { canInstall, isInstalled, install } = usePWAInstall();

  const userEmail = user?.email || "";
  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl hidden sm:block">Marketplace</span>
          </div>
          
          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search_products")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 bg-secondary/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground md:hidden"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Spacer for mobile */}
          <div className="flex-1 md:hidden" />
          
          {/* Desktop Download App Button */}
          {canInstall && !isInstalled && (
            <Button
              onClick={install}
              variant="outline"
              className="gap-2 font-semibold h-12 px-5 rounded-xl hidden md:flex"
            >
              <Download className="w-5 h-5" />
              Download App
            </Button>
          )}

          {/* Desktop CTA Button */}
          <Button 
            onClick={onAddProduct} 
            size="lg" 
            className="gap-2 font-semibold h-12 px-6 bg-gradient-primary hover:opacity-90 rounded-xl shadow-button hidden md:flex"
          >
            <Plus className="w-5 h-5" />
            {t("post_product")}
          </Button>

          {/* Desktop nav items */}
          <div className="hidden sm:flex items-center gap-1">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/chat")}
                className="w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-border hover:ring-primary transition-all">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={userEmail} />
                      <AvatarFallback className="bg-secondary text-sm font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-sm truncate">{userEmail}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    {t("settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    {t("sign_out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground sm:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* User info */}
                {user && (
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={userEmail} />
                        <AvatarFallback className="bg-secondary text-sm font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu items */}
                <nav className="flex-1 p-4 space-y-1">
                  <button
                    onClick={() => { onAddProduct(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-gradient-primary text-primary-foreground font-semibold shadow-button"
                  >
                    <Plus className="w-5 h-5" />
                    {t("post_product")}
                  </button>

                  {canInstall && !isInstalled && (
                    <button
                      onClick={() => { install(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-secondary/80 transition-colors"
                    >
                      <Download className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Download App</span>
                    </button>
                  )}

                  {user && (
                    <button
                      onClick={() => { navigate("/chat"); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-secondary/80 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{"Messages"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-secondary/80 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{t("settings")}</span>
                  </button>
                </nav>

                {/* Sign out */}
                {user && (
                  <div className="p-4 border-t border-border">
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">{t("sign_out")}</span>
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Search Bar - expandable */}
        {mobileSearchOpen && (
          <div className="mt-3 md:hidden animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("search_products")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 h-11 bg-secondary/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
