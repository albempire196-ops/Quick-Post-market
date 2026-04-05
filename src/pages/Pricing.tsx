import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Check, Crown, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, productId, isTrialing, subscriptionEnd, checkSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planKey: string) => {
    if (!user) {
      toast.error("You must sign in to subscribe");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong with the payment");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast.error("Something went wrong");
    }
  };

  const plans = Object.entries(SUBSCRIPTION_PLANS);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 mesh-gradient opacity-80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[130px] pointer-events-none animate-float" />

      <header className="sticky top-0 z-50 liquid-glass">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-2xl btn-ghost-premium hover:scale-105 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-xl">Pricing</h1>
          </div>
          {subscribed && (
            <Button variant="outline" size="sm" onClick={handleManage} className="ml-auto rounded-2xl btn-secondary-premium">
              Manage Subscription
            </Button>
          )}
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-20 max-w-5xl section-aura">
        <div className="text-center mb-16 sm:mb-20 space-y-5">
          <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full border-border/30 animate-blur-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Choose your plan</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Start Selling <span className="text-gradient animate-gradient bg-[length:200%_200%]">Today</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Choose the plan that fits you to post unlimited products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
          {plans.map(([key, plan]) => {
            const isActive = subscribed && productId === plan.product_id;
            const isLoading = loadingPlan === key;
            const isPopular = plan.badge === "Most Popular";

            return (
              <div
                key={key}
                className={`relative group liquid-glass card-glow rounded-[2rem] p-7 sm:p-8 space-y-6 border-border/15 ${
                  isActive ? "ring-2 ring-primary shadow-glow" : ""
                } ${isPopular ? "md:-mt-4 md:mb-4 border-primary/15" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 btn-premium text-primary-foreground px-5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                    {plan.badge}
                  </div>
                )}

                {isActive && (
                  <div className="absolute -top-3 right-4 bg-emerald-500 text-white px-3.5 py-1 rounded-full text-xs font-bold">
                    {isTrialing ? "Free Trial" : "Active"}
                  </div>
                )}

                <div>
                  <h3 className="font-display font-bold text-2xl">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl sm:text-6xl font-display font-bold text-gradient animate-gradient bg-[length:200%_200%]">{plan.price}</span>
                  <span className="text-muted-foreground text-lg">/{plan.interval}</span>
                </div>

                <ul className="space-y-3.5">
                  {["Unlimited product listings", "Connect with buyers", "Priority support", "No ads"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                  {plan.trial && (
                    <li className="flex items-center gap-3 text-sm font-semibold text-primary">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      2 weeks free trial
                    </li>
                  )}
                </ul>

                {isActive ? (
                  <Button variant="outline" className="w-full h-12 rounded-2xl btn-secondary-premium" onClick={handleManage}>
                    Manage Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full h-13 rounded-2xl btn-premium font-semibold text-base"
                    onClick={() => handleSubscribe(plan.price_id, key)}
                    disabled={isLoading}
                  >
                    <span className="btn-shine" />
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Now"}
                  </Button>
                )}

                {isActive && subscriptionEnd && (
                  <p className="text-xs text-muted-foreground text-center">
                    {isTrialing ? "Trial ends on " : "Renews on "}
                    {new Date(subscriptionEnd).toLocaleDateString("en-US")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" size="sm" onClick={checkSubscription} className="text-muted-foreground btn-ghost-premium">
            Refresh subscription status
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
