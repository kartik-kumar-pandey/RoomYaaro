import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import prisma from "../config/db.js";

import { highMatchTemplate } from "../templates/highMatch.template.js";
import { interestAcceptedTemplate } from "../templates/interestAccepted.template.js";
import { interestRejectedTemplate } from "../templates/interestRejected.template.js";
import { verifyEmailTemplate } from "../templates/verifyEmail.template.js";
import { passwordResetTemplate } from "../templates/passwordReset.template.js";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/*
|--------------------------------------------------------------------------
| Verify SMTP Connection
|--------------------------------------------------------------------------
*/

export const verifyEmailConnection = async () => {
    try {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const isSMTPConfigured = user && pass &&
          !user.includes('your-email') &&
          !pass.includes('your-app-password');

        if (isSMTPConfigured) {
            await transporter.verify();
            console.log("✅ SMTP Server Connected");
        } else {
            console.log("⚠️ SMTP Server Credentials not fully set, skipping verification.");
        }
    } catch (error) {
        console.error("❌ SMTP Connection Failed");
        console.error(error);
    }
};

/*
|--------------------------------------------------------------------------
| Common Email Sender (with Prisma Database Logging)
|--------------------------------------------------------------------------
*/

const sendEmail = async ({
    to,
    subject,
    html,
    type = "GENERAL",
}) => {
    // Attempt to log to DB if user exists
    let userId = null;
    try {
        const user = await prisma.user.findUnique({ where: { email: to } });
        if (user) {
            userId = user.id;
        }
    } catch (e) {
        console.error("DB User lookup failed:", e.message);
    }

    let notification = null;
    if (userId) {
        try {
            notification = await prisma.emailNotification.create({
                data: { userId, type, subject, body: html },
            });
        } catch (e) {
            console.error("DB Notification creation failed:", e.message);
        }
    }

    try {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const isSMTPConfigured = user && pass &&
          !user.includes('your-email') &&
          !pass.includes('your-app-password');

        if (isSMTPConfigured) {
            // Check if it's a Brevo API Key (starts with xsmtpsib-)
            if (pass.startsWith('xsmtpsib-')) {
                console.log(`ℹ️ Brevo SMTP API Key detected. Trying to send via HTTP API (port 443)...`);
                
                try {
                    // Parse sender details
                    let senderName = "RoomYaaro";
                    let senderEmail = "roomyaaro@gmail.com";
                    const emailFrom = process.env.EMAIL_FROM;
                    if (emailFrom) {
                        const match = emailFrom.match(/^(?:"?([^"<]+)"?\s)?<?([^>]+)>?$/);
                        if (match) {
                            senderName = match[1]?.trim() || "RoomYaaro";
                            senderEmail = match[2]?.trim() || "roomyaaro@gmail.com";
                        }
                    }

                    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'api-key': pass,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            sender: { name: senderName, email: senderEmail },
                            to: [{ email: to }],
                            subject: subject,
                            htmlContent: html
                        })
                    });

                    if (!response.ok) {
                        const errBody = await response.text();
                        throw new Error(`Brevo HTTP API failed: ${response.status} ${errBody}`);
                    }

                    const resData = await response.json();
                    console.log(`✅ Email sent via Brevo HTTP API to ${to}:`, resData);

                    if (notification) {
                        await prisma.emailNotification.update({
                            where: { id: notification.id },
                            data: { isSent: true, sentAt: new Date() },
                        });
                    }
                    return resData;
                } catch (httpErr) {
                    console.warn(`⚠️ Brevo HTTP API failed (${httpErr.message}). Falling back to standard SMTP Relay...`);
                }
            }

            // Otherwise, fall back to standard SMTP (useful for other providers or local relays)
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to,
                subject,
                html,
            });
            console.log(`✅ Email sent to ${to} via SMTP`);

            if (notification) {
                await prisma.emailNotification.update({
                    where: { id: notification.id },
                    data: { isSent: true, sentAt: new Date() },
                });
            }
            return info;
        } else {
            console.log(`⚠️ SMTP not fully configured, skipped sending email to ${to}`);
            return { messageId: "skipped-smtp-not-configured" };
        }
    } catch (error) {
        console.error("❌ Email Sending Failed");
        console.error(error.message || error);
        throw error;
    }
};

/*
|--------------------------------------------------------------------------
| High Compatibility Email
|--------------------------------------------------------------------------
*/

export const sendHighMatchEmail = async ({
    ownerEmail,
    ownerName,
    tenantName,
    compatibilityScore,
    explanation,
    listing,
    actionUrl,
}) => {
    const html = highMatchTemplate({
        ownerName,
        tenantName,
        compatibilityScore,
        explanation,
        listing,
        actionUrl,
    });

    return sendEmail({
        to: ownerEmail,
        subject: `🎉 ${compatibilityScore}% Match for Your Listing`,
        html,
        type: "HIGH_MATCH",
    });
};

/*
|--------------------------------------------------------------------------
| Interest Accepted Email
|--------------------------------------------------------------------------
*/

export const sendInterestAcceptedEmail = async ({
    tenantEmail,
    tenantName,
    ownerName,
    listing,
    actionUrl,
}) => {
    const html = interestAcceptedTemplate({
        tenantName,
        ownerName,
        listing,
        actionUrl,
    });

    return sendEmail({
        to: tenantEmail,
        subject: "🎉 Your Interest Request Was Accepted",
        html,
        type: "INTEREST_ACCEPTED",
    });
};

/*
|--------------------------------------------------------------------------
| Interest Rejected Email
|--------------------------------------------------------------------------
*/

export const sendInterestRejectedEmail = async ({
    tenantEmail,
    tenantName,
    listing,
    actionUrl,
}) => {
    const html = interestRejectedTemplate({
        tenantName,
        listing,
        actionUrl,
    });

    return sendEmail({
        to: tenantEmail,
        subject: "Update on Your Interest Request",
        html,
        type: "INTEREST_REJECTED",
    });
};

/*
|--------------------------------------------------------------------------
| Backward Compatibility Wrapper Functions (for controller imports)
|--------------------------------------------------------------------------
*/

export const notifyHighMatch = async (owner, tenant, listing, score) => {
    return sendHighMatchEmail({
        ownerEmail: owner.email,
        ownerName: owner.name,
        tenantName: tenant.name,
        compatibilityScore: score,
        explanation: "Excellent location and budget match.",
        listing: {
            title: listing.title,
            location: listing.location,
            rent: `₹${listing.rent?.toLocaleString()} / month`,
            roomType: listing.roomType ? listing.roomType.replace('_', ' ') : 'Room',
            availableFrom: listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Immediate',
        },
        actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/owner/interests`,
    });
};

export const notifyInterestAccepted = async (tenant, listing) => {
    let ownerName = "Property Owner";
    try {
        const owner = await prisma.user.findUnique({ where: { id: listing.ownerId } });
        if (owner) {
            ownerName = owner.name;
        }
    } catch (e) {
        console.error("Failed to find owner details:", e);
    }

    return sendInterestAcceptedEmail({
        tenantEmail: tenant.email,
        tenantName: tenant.name,
        ownerName,
        listing: {
            title: listing.title,
            location: listing.location,
            rent: `₹${listing.rent?.toLocaleString()} / month`,
            roomType: listing.roomType ? listing.roomType.replace('_', ' ') : 'Room',
            availableFrom: listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Immediate',
        },
        actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/tenant/chat`,
    });
};

export const notifyInterestRejected = async (tenant, listing) => {
    return sendInterestRejectedEmail({
        tenantEmail: tenant.email,
        tenantName: tenant.name,
        listing: {
            title: listing.title,
            location: listing.location,
            rent: `₹${listing.rent?.toLocaleString()} / month`,
            roomType: listing.roomType ? listing.roomType.replace('_', ' ') : 'Room',
            availableFrom: listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Immediate',
        },
        actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/tenant/listings`,
    });
};

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

export const sendVerificationEmail = async (user, rawToken) => {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}`;
    console.log(`\n🔑 [DEVELOPMENT LINK] Email Verification URL for ${user.email}:\n${verifyUrl}\n`);
    const html = verifyEmailTemplate({ name: user.name, verifyUrl });

    return sendEmail({
        to: user.email,
        subject: '✅ Verify Your RoomYaaro Account',
        html,
        type: 'GENERAL',
    });
};

/*
|--------------------------------------------------------------------------
| Password Reset
|--------------------------------------------------------------------------
*/

export const sendPasswordResetEmail = async (user, rawToken) => {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    console.log(`\n🔒 [DEVELOPMENT LINK] Password Reset URL for ${user.email}:\n${resetUrl}\n`);
    const html = passwordResetTemplate({ name: user.name, resetUrl });

    return sendEmail({
        to: user.email,
        subject: '🔒 Reset Your RoomYaaro Password',
        html,
        type: 'GENERAL',
    });
};

export default transporter;
