import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SellerNamePromptProps {
  open: boolean;
  initialValue: string;
  email?: string | null;
  saving: boolean;
  onSubmit: (value: string) => Promise<void>;
}

export const SellerNamePrompt = ({ open, initialValue, email, saving, onSubmit }: SellerNamePromptProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, open]);

  const handleSubmit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    await onSubmit(trimmedValue);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md rounded-[2rem] liquid-glass border-border/15"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Choose your seller name</DialogTitle>
          <DialogDescription>
            This name will appear on your seller profile and in listings. {email ? `Signed in as ${email}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seller-name" className="text-xs font-semibold uppercase tracking-wider">Seller name</Label>
            <Input
              id="seller-name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={50}
              placeholder="Enter your seller name"
              autoFocus
              className="h-11 rounded-xl"
            />
          </div>

          <Button className="w-full rounded-xl h-11 btn-premium" disabled={saving || !value.trim()} onClick={() => void handleSubmit()}>
            {saving ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};