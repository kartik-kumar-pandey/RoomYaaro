import {
    baseTemplate,
    propertyCard,
    divider,
    button,
} from "./base.template.js";

export const interestRejectedTemplate = ({
    tenantName,
    listing,
    actionUrl,
}) => {

    const content = `

<p class="text">
Hi <strong>${tenantName}</strong>,
</p>

<p class="text">
Thank you for showing interest in the property below.
Unfortunately, the owner has decided to move forward with another applicant.
</p>

<div
style="
padding:18px;
background:#FEF2F2;
border:1px solid #FECACA;
border-radius:12px;
margin:28px 0;
">

<div
style="
font-size:16px;
font-weight:700;
color:#B91C1C;
margin-bottom:6px;
">
Request Not Selected
</div>

<div
style="
font-size:15px;
line-height:1.7;
color:#7F1D1D;
">
This doesn't necessarily reflect your suitability. Owners often receive multiple applications and make decisions based on timing and personal preferences.
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

<p class="text">

Don't give up! Every day new rooms matching your preferences are added.

We recommend exploring more listings and sending new interest requests.

</p>

${button(
"Browse More Listings",
actionUrl,
true
)}

<p
style="
margin-top:32px;
font-size:13px;
color:#9CA3AF;
line-height:1.8;
">

Tip: Completing your profile with accurate preferences can improve your compatibility scores and increase your chances of finding the right room.

</p>

`;

    return baseTemplate({

        title: "Update on Your Interest Request",

        preview:
            "The owner has responded to your interest request.",

        content,

    });

};
