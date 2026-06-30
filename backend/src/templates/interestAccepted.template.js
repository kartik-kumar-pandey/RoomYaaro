import {
    baseTemplate,
    propertyCard,
    divider,
    button,
} from "./base.template.js";

export const interestAcceptedTemplate = ({
    tenantName,
    ownerName,
    listing,
    actionUrl,
}) => {

    const content = `

<p class="text">
Hi <strong>${tenantName}</strong>,
</p>

<p class="text">
🎉 Congratulations! Your request for the following property has been
<strong>accepted</strong>.
</p>

<div
style="
padding:18px;
background:#ECFDF5;
border:1px solid #BBF7D0;
border-radius:12px;
margin:28px 0;
">

<div
style="
font-size:16px;
font-weight:700;
color:#15803D;
margin-bottom:6px;
">
✅ Request Accepted
</div>

<div
style="
font-size:15px;
line-height:1.7;
color:#166534;
">
The property owner would like to continue the conversation with you.
You can now chat directly and arrange a visit.
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

<table
width="100%"
cellpadding="0"
cellspacing="0">

<tr>

<td width="50%">

<div
style="
font-size:13px;
color:#6B7280;
margin-bottom:6px;
">
Property Owner
</div>

<div
style="
font-size:16px;
font-weight:600;
color:#111827;
">
${ownerName}
</div>

</td>

<td align="right">

<div
style="
font-size:13px;
color:#6B7280;
margin-bottom:6px;
">
Status
</div>

<div
style="
font-size:16px;
font-weight:700;
color:#16A34A;
">
Accepted
</div>

</td>

</tr>

</table>

${divider}

<p class="text">

You can now discuss:

</p>

<ul
style="
color:#4B5563;
font-size:15px;
line-height:2;
padding-left:20px;
">

<li>Viewing Schedule</li>

<li>Move-in Date</li>

<li>Rental Agreement</li>

<li>Room Rules</li>

<li>Security Deposit</li>

</ul>

${button(
"Open Chat",
actionUrl
)}

<p
style="
margin-top:30px;
font-size:13px;
color:#9CA3AF;
line-height:1.8;
">

We recommend responding within 24 hours to keep your request active.

</p>

`;

    return baseTemplate({

        title: "Your Request Has Been Accepted 🎉",

        preview:
            "The property owner accepted your interest request.",

        content,

    });

};
