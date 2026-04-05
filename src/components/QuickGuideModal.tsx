import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Heart, MessageCircle, MapPin, Star, Store, ChevronLeft, ChevronRight, X } from "lucide-react";

interface QuickGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Search,
    color: "from-blue-500 to-indigo-600",
    title: "Browse Products",
    desc: "Explore thousands of listings from sellers in your country. Use the search bar to find exactly what you're looking for.",
  },
  {
    icon: Store,
    color: "from-fuchsia-500 to-pink-600",
    title: "Advertise Your Business",
    desc: "You can promote any type of business — hotel, restaurant, shop, service, or anything else. Reach customers in your area and beyond with a simple listing.",
  },
  {
    icon: MapPin,
    color: "from-emerald-500 to-teal-600",
    title: "Filter by Country",
    desc: "Set your preferred country in Settings to see local listings first. Switch between countries anytime.",
  },
  {
    icon: Star,
    color: "from-amber-500 to-orange-600",
    title: "Filter & Sort",
    desc: "Narrow results by category, price range and status (available, reserved, sold). Sort by newest or price.",
  },
  {
    icon: PlusCircle,
    color: "from-violet-500 to-purple-600",
    title: "Post a Product",
    desc: "Sign in and tap the '+' button to list your own item. Add photos, set a price and publish in seconds.",
  },
  {
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    title: "Save Favorites",
    desc: "Bookmark products you like by tapping the heart icon. Find them later in Settings → Saved Products.",
  },
  {
    icon: MessageCircle,
    color: "from-cyan-500 to-sky-600",
    title: "Contact Sellers",
    desc: "Open any product and use the contact info to reach the seller directly via phone or email.",
  },
];

export const QuickGuideModal = ({ open, onClose }: QuickGuideModalProps) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm rounded-[2rem] p-0 overflow-hidden border-border/15">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 bg-black/10 hover:bg-black/20 backdrop-blur-sm transition-all duration-300"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Hero gradient */}
        <div className={`bg-gradient-to-br ${current.color} p-10 flex flex-col items-center gap-4 transition-all duration-500 ease-premium`}>
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-white font-display font-bold text-2xl text-center">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-muted-foreground text-center leading-relaxed">{current.desc}</p>

          {/* Dots */}
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {isLast ? (
              <Button className="flex-1 rounded-xl h-11" onClick={onClose}>
                Get Started!
              </Button>
            ) : (
              <Button className="flex-1 rounded-xl h-11" onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {!isLast && (
            <button onClick={onClose} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip guide
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
