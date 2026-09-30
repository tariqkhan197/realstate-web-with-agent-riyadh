// Home-financing calculator (standard amortising / annuity formula).
// Saudi home finance is commonly offered as Murabaha / Ijara with a "profit rate"; the
// maths for a fixed-rate schedule is equivalent. Rates here are DEMO assumptions.

export const DEMO_PROFIT_RATE = 5.0; // % per year — demo assumption, not a bank quote
export const DEFAULT_TERM_YEARS = 15;
export const DEFAULT_DOWN_PCT = 10;

export interface MortgageInput { price: number; downPayment: number; years: number; ratePct: number }
export interface MortgageResult extends MortgageInput {
  loanAmount: number; monthlyPayment: number; totalPayment: number; totalProfit: number; months: number;
  yearly: { year: number; balance: number; paidPrincipal: number; paidProfit: number }[];
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const price = Math.max(0, input.price);
  const downPayment = Math.min(Math.max(0, input.downPayment), price);
  const loanAmount = price - downPayment;
  const months = Math.max(1, Math.round(input.years * 12));
  const r = input.ratePct / 100 / 12;
  const monthlyPayment = loanAmount === 0 ? 0 : r === 0 ? loanAmount / months : (loanAmount * r) / (1 - Math.pow(1 + r, -months));
  const totalPayment = monthlyPayment * months;
  const yearly: MortgageResult["yearly"] = [];
  let bal = loanAmount, pp = 0, pi = 0;
  for (let m = 1; m <= months; m++) {
    const interest = bal * r; const principal = monthlyPayment - interest;
    bal = Math.max(0, bal - principal); pp += principal; pi += interest;
    if (m % 12 === 0 || m === months) yearly.push({ year: Math.ceil(m / 12), balance: bal, paidPrincipal: pp, paidProfit: pi });
  }
  return { ...input, price, downPayment, loanAmount, monthlyPayment, totalPayment, totalProfit: totalPayment - loanAmount, months, yearly };
}

export const defaultMortgageFor = (price: number) =>
  calculateMortgage({ price, downPayment: Math.round(price * DEFAULT_DOWN_PCT / 100), years: DEFAULT_TERM_YEARS, ratePct: DEMO_PROFIT_RATE });
