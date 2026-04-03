import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { countries } from "@/data/countries";

interface CountrySelectModalProps {
  open: boolean;
  onSelectCountry: (country: string) => void;
}

export const CountrySelectModal = ({ open, onSelectCountry }: CountrySelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl [&>button]:hidden">
        <div className="bg-gradient-primary p-8 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-4">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl text-primary-foreground font-display">Mirësevjen!</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-base mt-2">
              Zgjidh shtetin tënd për të parë produktet e disponueshme
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Kërko shtetin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-secondary/50 border-0 rounded-xl"
            />
          </div>

          <div className="max-h-[45vh] overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-2 gap-2">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => onSelectCountry(country.code)}
                  className="flex items-center gap-3 p-4 rounded-xl text-left hover:bg-secondary/80 transition-all group"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {country.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
