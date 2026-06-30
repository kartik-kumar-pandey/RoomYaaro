export const COMPATIBILITY_PROMPT = `You are a rental compatibility expert. Given a tenant profile and a room listing, calculate a compatibility score between 0 and 100.

Consider these factors:
- Budget alignment (tenant's min/max budget vs listing rent)
- Location preference match
- Move-in date vs listing availability
- Room type and furnishing preferences

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "explanation": "<2-3 sentence explanation of the score>"
}

Tenant Profile:
- Preferred Location: {preferredLocation}
- Budget Range: ₹{minBudget} - ₹{maxBudget}
- Move-in Date: {moveInDate}

Room Listing:
- Title: {title}
- Location: {location}
- Rent: ₹{rent}
- Available From: {availableFrom}
- Room Type: {roomType}
- Furnishing: {furnishingStatus}
- Description: {description}`;

export const buildCompatibilityPrompt = (tenantProfile, listing) => {
  return COMPATIBILITY_PROMPT
    .replace('{preferredLocation}', tenantProfile.preferredLocation || 'Not specified')
    .replace('{minBudget}', tenantProfile.minBudget ?? 'Not specified')
    .replace('{maxBudget}', tenantProfile.maxBudget ?? 'Not specified')
    .replace('{moveInDate}', tenantProfile.moveInDate
      ? new Date(tenantProfile.moveInDate).toLocaleDateString()
      : 'Not specified')
    .replace('{title}', listing.title)
    .replace('{location}', listing.location)
    .replace('{rent}', listing.rent)
    .replace('{availableFrom}', new Date(listing.availableFrom).toLocaleDateString())
    .replace('{roomType}', listing.roomType)
    .replace('{furnishingStatus}', listing.furnishingStatus)
    .replace('{description}', listing.description);
};
