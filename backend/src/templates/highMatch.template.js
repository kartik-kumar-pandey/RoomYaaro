import {
    baseTemplate,
    propertyCard,
    divider,
    button,
} from "./base.template.js";

export const highMatchTemplate = ({
    ownerName,
    tenantName,
    compatibilityScore,
    explanation,
    listing,
    actionUrl,
}) => {
    const content = `
<p class="text">
Hi <strong>${ownerName}</strong>,
</p>

<p class="text">
🔥 Great news! A tenant named <strong>${tenantName}</strong> has shown interest in your property, and they are an exceptionally high match.
</p>

<div
style="
padding:18px;
background:#EFF6FF;
border:1px solid #BFDBFE;
border-radius:12px;
margin:28px 0;
">

<div
style="
font-size:16px;
font-weight:700;
color:#1D4ED8;
margin-bottom:6px;
">
⭐ RoomYaaro Match™: ${compatibilityScore}% Compatible
</div>

<div
style="
font-size:15px;
line-height:1.7;
color:#1E40AF;
">
${explanation}
</div>

</div>

${divider}

${propertyCard({
    title: listing.title,
    location: listing.location,
    rent: listing.rent,
    roomType: listing.roomType,
    availableFrom: listing.availableFrom,
})}

${divider}

${button(
"View Tenant Profile",
actionUrl
)}

<p
style="
margin-top:30px;
font-size:13px;
color:#9CA3AF;
line-height:1.8;
">
Highly compatible requests tend to get filled quickly. We recommend reviewing the details and responding as soon as possible.
</p>
`;

    return baseTemplate({
        title: `New High Match! (${compatibilityScore}%)`,
        preview: `A tenant with a ${compatibilityScore}% match is interested in your room.`,
        content,
    });
};
