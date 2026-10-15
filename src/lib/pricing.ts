// 뉴브런즈윅 음식 세율 (HST 15%)
export const HST_RATE = 0.15;

export function calcTax(base: number): number {
  return Math.round(base * HST_RATE * 100) / 100;
}
