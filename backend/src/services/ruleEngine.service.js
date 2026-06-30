const normalizeLocation = (location) => {
  if (!location) return '';
  return location.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
};

const calculateBudgetScore = (minBudget, maxBudget, rent) => {
  if (!minBudget && !maxBudget) return 30;
  if (!rent) return 0;

  const min = minBudget ?? 0;
  const max = maxBudget ?? Infinity;

  if (rent >= min && rent <= max) return 60;

  if (rent < min) {
    const diff = ((min - rent) / min) * 100;
    return Math.max(0, 60 - diff * 0.5);
  }

  const diff = ((rent - max) / max) * 100;
  return Math.max(0, 60 - diff * 0.8);
};

const calculateLocationScore = (preferredLocation, listingLocation) => {
  if (!preferredLocation) return 20;
  if (!listingLocation) return 0;

  const preferred = normalizeLocation(preferredLocation);
  const listing = normalizeLocation(listingLocation);

  if (preferred === listing) return 40;
  if (listing.includes(preferred) || preferred.includes(listing)) return 35;

  const preferredWords = preferred.split(/\s+/).filter(Boolean);
  const listingWords = listing.split(/\s+/).filter(Boolean);
  const matches = preferredWords.filter((w) => listingWords.some((lw) => lw.includes(w) || w.includes(lw)));

  if (matches.length > 0) {
    return Math.round((matches.length / preferredWords.length) * 40);
  }

  return 5;
};

export const calculateRuleBasedScore = (tenantProfile, listing) => {
  const budgetScore = calculateBudgetScore(
    tenantProfile.minBudget,
    tenantProfile.maxBudget,
    listing.rent
  );
  const locationScore = calculateLocationScore(
    tenantProfile.preferredLocation,
    listing.location
  );

  const score = Math.round(Math.min(100, budgetScore + locationScore));

  let explanation = '';
  if (score >= 80) {
    explanation = `Excellent match! The rent of ₹${listing.rent} fits your budget and the location "${listing.location}" aligns well with your preference.`;
  } else if (score >= 60) {
    explanation = `Good match. Budget and location partially align. Rent is ₹${listing.rent} in ${listing.location}.`;
  } else if (score >= 40) {
    explanation = `Moderate match. Some factors don't align perfectly — review budget (₹${listing.rent}) and location (${listing.location}).`;
  } else {
    explanation = `Low compatibility. The listing may not match your budget range or preferred location.`;
  }

  return { score, explanation, source: 'rule-engine' };
};
