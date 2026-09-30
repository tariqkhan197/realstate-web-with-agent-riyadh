// DEMO DATA — fictional brokers. Names and numbers are not real people or licences.
import type { Broker } from "@/types";

export const BROKERS: Broker[] = [
  { id: "owner-direct", name: "Property owner", company: "Direct from owner", phoneMasked: "+966 5• ••• ••12", responseTime: "Usually replies within a day", listings: 1, initials: "OW" },
  { id: "b-najd", name: "Faisal Al-Harbi", company: "Najd Homes Realty (demo)", phoneMasked: "+966 5• ••• ••48", responseTime: "Usually replies within 1 hour", listings: 38, initials: "FH" },
  { id: "b-sahel", name: "Reem Al-Qahtani", company: "Sahel Property Partners (demo)", phoneMasked: "+966 5• ••• ••07", responseTime: "Usually replies within 2 hours", listings: 24, initials: "RQ" },
  { id: "b-bahr", name: "Omar Bakr", company: "Bahr Coastal Estates (demo)", phoneMasked: "+966 5• ••• ••91", responseTime: "Usually replies same day", listings: 17, initials: "OB" },
  { id: "b-sharqiya", name: "Noura Al-Dossary", company: "Sharqiya Living (demo)", phoneMasked: "+966 5• ••• ••33", responseTime: "Usually replies within 3 hours", listings: 21, initials: "ND" },
  { id: "b-haram", name: "Yousef Al-Zahrani", company: "Haramain Realty (demo)", phoneMasked: "+966 5• ••• ••64", responseTime: "Usually replies within a day", listings: 12, initials: "YZ" },
];

export const getBroker = (id: string) => BROKERS.find((b) => b.id === id) ?? BROKERS[1];
