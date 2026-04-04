import { countries } from "@/data/countries";

const countryNameMap: { [key: string]: string } = {};
for (const c of countries) {
  countryNameMap[c.code] = c.name;
}

export const useCountryNames = () => {
  return (code: string) => countryNameMap[code] || code;
};
