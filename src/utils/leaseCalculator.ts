export interface LeaseCalculation {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
}

export function calculateLease(
  principal: number,
  duration: number,
  residualValue: number,
  annualRate: number = 8.99
): LeaseCalculation {
  const monthlyRate = annualRate / 100 / 12;
  const financeAmount = principal - residualValue;

  if (monthlyRate === 0) {
    const monthlyPayment = financeAmount / duration;
    return {
      monthlyPayment,
      totalAmount: principal,
      totalInterest: 0,
    };
  }

  const monthlyPayment =
    (financeAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
    (Math.pow(1 + monthlyRate, duration) - 1);

  const totalAmount = monthlyPayment * duration + residualValue;
  const totalInterest = totalAmount - principal;

  return {
    monthlyPayment,
    totalAmount,
    totalInterest,
  };
}
