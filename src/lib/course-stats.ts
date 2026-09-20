export const parseMinutes = (duration?: string | null): number => {
  if (!duration) return 0;
  const text = duration.trim().toLowerCase();
  const hours = text.match(/(\d+(?:\.\d+)?)\s*h(?:r|rs|our|ours)?/);
  const minutes = text.match(/(\d+(?:\.\d+)?)\s*m(?:in|ins)?/);
  let total = 0;
  if (hours) total += parseFloat(hours[1]) * 60;
  if (minutes) total += parseFloat(minutes[1]);
  return Math.round(total);
};

export const sumDurations = (durations: (string | null | undefined)[]): number =>
  durations.reduce((acc, d) => acc + parseMinutes(d), 0);

export const formatMinutes = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return "–";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hr${h > 1 ? "s" : ""} ${m} min`;
};

export const discountPercent = (price?: number, priceOld?: number): number | null => {
  if (price == null || priceOld == null || priceOld <= 0) return null;
  if (price >= priceOld) return null;
  return Math.round(((priceOld - price) / priceOld) * 100);
};

export const formatPrice = (price?: number): string =>
  price == null ? "" : `₹${new Intl.NumberFormat("en-IN").format(price)}`;