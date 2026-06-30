import express from "express";
import {
    sendHighMatchEmail,
    sendInterestAcceptedEmail,
    sendInterestRejectedEmail,
} from "../services/email.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const listing = {
        title: "Luxury PG",
        location: "Indiranagar, Bengaluru",
        rent: "₹12,000 / month",
        roomType: "Private Room",
        availableFrom: "1 July 2026",
    };

    try {
        await sendHighMatchEmail({
            ownerEmail: "kartikp98321@gmail.com",
            ownerName: "Rahul",
            tenantName: "Aarav",
            compatibilityScore: 93,
            explanation: "Excellent budget and location match.",
            listing,
            actionUrl: "http://localhost:5173/owner/interests",
        });

        await sendInterestAcceptedEmail({
            tenantEmail: "kartikp98321@gmail.com",
            tenantName: "Aarav",
            ownerName: "Rahul",
            listing,
            actionUrl: "http://localhost:5173/tenant/chat",
        });

        await sendInterestRejectedEmail({
            tenantEmail: "kartikp98321@gmail.com",
            tenantName: "Aarav",
            listing,
            actionUrl: "http://localhost:5173/tenant/listings",
        });

        res.json({
            success: true,
            message: "All emails sent successfully.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
