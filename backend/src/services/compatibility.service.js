import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildCompatibilityPrompt } from '../prompts/compatibility.js';
import { calculateRuleBasedScore } from './ruleEngine.service.js';
import prisma from '../config/db.js';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const parseGeminiResponse = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON response from Gemini');

  const parsed = JSON.parse(jsonMatch[0]);
  const score = Math.min(100, Math.max(0, Math.round(Number(parsed.score))));
  const explanation = String(parsed.explanation || 'Compatibility calculated.');

  return { score, explanation, source: 'gemini' };
};

const callNvidiaAPI = async (tenantProfile, listing) => {
  if (!process.env.NVIDIA_API_KEY) throw new Error('NVIDIA API key not configured');

  const prompt = buildCompatibilityPrompt(tenantProfile, listing);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(process.env.NVIDIA_INVOKE_URL || 'https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        top_p: 0.95
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NVIDIA API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from NVIDIA API');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response from NVIDIA API');

    const parsed = JSON.parse(jsonMatch[0]);
    const score = Math.min(100, Math.max(0, Math.round(Number(parsed.score))));
    const explanation = String(parsed.explanation || 'Compatibility calculated.');

    return { score, explanation, source: 'nvidia' };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const callGeminiAPI = async (tenantProfile, listing) => {
  if (!genAI) throw new Error('Gemini API key not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildCompatibilityPrompt(tenantProfile, listing);

  const apiCall = model.generateContent(prompt);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API call timed out')), 5000)
  );

  const result = await Promise.race([apiCall, timeoutPromise]);
  const text = result.response.text();

  return parseGeminiResponse(text);
};

export const getOrCreateCompatibilityScore = async (tenantProfileId, listingId) => {
  const tenantProfile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  });

  const listing = await prisma.roomListing.findUnique({
    where: { id: listingId },
  });

  if (!tenantProfile || !listing) {
    throw new Error('Tenant profile or listing not found');
  }

  const existing = await prisma.compatibilityScore.findUnique({
    where: {
      tenantId_listingId: { tenantId: tenantProfileId, listingId },
    },
  });

  if (existing) {
    const scoreGeneratedAt = new Date(existing.generatedAt);
    const tenantUpdatedAt = tenantProfile.updatedAt ? new Date(tenantProfile.updatedAt) : new Date(0);
    const listingUpdatedAt = listing.updatedAt ? new Date(listing.updatedAt) : new Date(0);

    if (scoreGeneratedAt >= tenantUpdatedAt && scoreGeneratedAt >= listingUpdatedAt) {
      return existing;
    }
  }

  let result;
  try {
    if (process.env.NVIDIA_API_KEY) {
      try {
        result = await callNvidiaAPI(tenantProfile, listing);
      } catch (nvidiaErr) {
        console.error('NVIDIA API failed, falling back to Gemini...', nvidiaErr.message);
        result = await callGeminiAPI(tenantProfile, listing);
      }
    } else {
      result = await callGeminiAPI(tenantProfile, listing);
    }
  } catch (err) {
    console.error('LLM APIs failed, falling back to Rule Engine...', err.message);
    result = calculateRuleBasedScore(tenantProfile, listing);
  }

  return prisma.compatibilityScore.upsert({
    where: {
      tenantId_listingId: { tenantId: tenantProfileId, listingId },
    },
    update: {
      score: result.score,
      explanation: result.explanation,
      source: result.source,
      generatedAt: new Date(),
    },
    create: {
      tenantId: tenantProfileId,
      listingId,
      score: result.score,
      explanation: result.explanation,
      source: result.source,
      generatedAt: new Date(),
    },
  });
};

export const getRecommendations = async (tenantProfileId, limit = 10) => {
  const listings = await prisma.roomListing.findMany({
    where: { status: 'AVAILABLE', isDeleted: false },
    include: {
      photos: { orderBy: { order: 'asc' }, take: 1 },
      owner: { select: { id: true, name: true } },
    },
  });

  const scoredListings = await Promise.all(
    listings.map(async (listing) => {
      const score = await getOrCreateCompatibilityScore(tenantProfileId, listing.id);
      return { ...listing, compatibility: score };
    })
  );

  return scoredListings
    .sort((a, b) => b.compatibility.score - a.compatibility.score)
    .slice(0, limit);
};
