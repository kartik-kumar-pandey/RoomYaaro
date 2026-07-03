import dotenv from 'dotenv';
dotenv.config();

import {
  sendHighMatchEmail,
  sendInterestAcceptedEmail,
  sendInterestRejectedEmail
} from './src/services/email.service.js';

const listing = {
  title: "Luxury PG Room",
  location: "Indiranagar, Bengaluru",
  rent: "₹12,000 / month",
  roomType: "Private Room",
  availableFrom: "1 July 2026",
};

async function testNewTemplates() {
  console.log("Sending new premium template test emails...");
  try {
    await sendHighMatchEmail({
      ownerEmail: "roomyaaro@gmail.com",
      ownerName: "Rahul Kumar",
      tenantName: "Aarav Sharma",
      compatibilityScore: 93,
      explanation: "Excellent budget and location match.",
      listing,
      actionUrl: "http://localhost:5173/owner/interests",
    });
    console.log("✅ High Match Email Sent");

    await sendInterestAcceptedEmail({
      tenantEmail: "roomyaaro@gmail.com",
      tenantName: "Aarav Sharma",
      ownerName: "Rahul Kumar",
      listing,
      actionUrl: "http://localhost:5173/tenant/chat",
    });
    console.log("✅ Interest Accepted Email Sent");

    await sendInterestRejectedEmail({
      tenantEmail: "roomyaaro@gmail.com",
      tenantName: "Aarav Sharma",
      listing,
      actionUrl: "http://localhost:5173/tenant/listings",
    });
    console.log("✅ Interest Rejected Email Sent");
    
    console.log("🎉 SUCCESS: All new template emails sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send emails:", error);
  }
}

testNewTemplates();