export const getPaddedNumber = (month: number) => {
  return month < 10 ? `0${month}` : month;
};

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const isInViewport = (element: HTMLElement) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  );
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getMoveClassificationIcon = (classification: string): string => {
  const iconMap: Record<string, string> = {
    splendid: "Genius",
    perfect: "Masterstroke",
    best: "Optimal",
    excellent: "Strong",
    okay: "Solid",
    opening: "Book",
    inaccuracy: "Slip",
    mistake: "Mistake",
    blunder: "Blunder",
    forced: "Forced",
  };
  return iconMap[classification] || classification;
};
