import { PrismaClient } from '@prisma/client';
import { getOrCreateCompatibilityScore } from '../src/services/compatibility.service.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- START COMPATIBILITY & FALLBACK TEST ---');

  // 1. Setup mock tenant user, profile and listing
  let tenantUser = await prisma.user.findFirst({ where: { role: 'TENANT' } });
  if (!tenantUser) {
    tenantUser = await prisma.user.create({
      data: {
        name: 'Test Tenant',
        email: 'testtenant@example.com',
        password: 'Password@123',
        role: 'TENANT',
        isActive: true,
        isEmailVerified: true,
      },
    });
  }

  let tenantProfile = await prisma.tenantProfile.findUnique({ where: { userId: tenantUser.id } });
  if (!tenantProfile) {
    tenantProfile = await prisma.tenantProfile.create({
      data: {
        userId: tenantUser.id,
        preferredLocation: 'Indiranagar',
        minBudget: 10000,
        maxBudget: 15000,
      },
    });
  } else {
    // Reset tenant profile to initial preferences
    tenantProfile = await prisma.tenantProfile.update({
      where: { id: tenantProfile.id },
      data: {
        preferredLocation: 'Indiranagar',
        minBudget: 10000,
        maxBudget: 15000,
        updatedAt: new Date(),
      },
    });
  }

  let ownerUser = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  if (!ownerUser) {
    ownerUser = await prisma.user.create({
      data: {
        name: 'Test Owner',
        email: 'testowner@example.com',
        password: 'Password@123',
        role: 'OWNER',
        isActive: true,
        isEmailVerified: true,
      },
    });
  }

  let listing = await prisma.roomListing.findFirst({ where: { ownerId: ownerUser.id } });
  if (!listing) {
    listing = await prisma.roomListing.create({
      data: {
        ownerId: ownerUser.id,
        title: 'Nice room in Indiranagar',
        location: 'Indiranagar, Bangalore',
        rent: 12000,
        availableFrom: new Date(),
        roomType: 'SINGLE',
        furnishingStatus: 'FURNISHED',
        description: 'Cozy single room near metro station',
        status: 'AVAILABLE',
      },
    });
  }

  // Clear any existing compatibility score to start fresh
  await prisma.compatibilityScore.deleteMany({
    where: { tenantId: tenantProfile.id, listingId: listing.id },
  });

  // 2. Fetch compatibility score first time
  console.log('Calculating initial compatibility score...');
  const firstScore = await getOrCreateCompatibilityScore(tenantProfile.id, listing.id);
  console.log('First compatibility score:', {
    score: firstScore.score,
    source: firstScore.source,
    explanation: firstScore.explanation,
    generatedAt: firstScore.generatedAt,
  });

  // 3. Fetch again without updates - should reuse cached score (same generatedAt)
  console.log('Fetching again immediately (should reuse cache)...');
  const secondScore = await getOrCreateCompatibilityScore(tenantProfile.id, listing.id);
  const isReused = secondScore.generatedAt.getTime() === firstScore.generatedAt.getTime();
  console.log(`Score reused: ${isReused} (${secondScore.generatedAt.toISOString()} vs ${firstScore.generatedAt.toISOString()})`);
  if (!isReused) {
    throw new Error('Failure: Score was not reused from cache');
  }

  // 4. Update tenant profile preferences (change location)
  console.log('Updating tenant profile preferred location to "Whitefield" (Preference changed)...');
  // Wait a moment to ensure timestamp changes
  await new Promise((resolve) => setTimeout(resolve, 1000));
  tenantProfile = await prisma.tenantProfile.update({
    where: { id: tenantProfile.id },
    data: {
      preferredLocation: 'Whitefield',
    },
  });

  // 5. Fetch score again - should recalculate/update since profile has updated
  console.log('Fetching compatibility score after preference change (should update)...');
  const thirdScore = await getOrCreateCompatibilityScore(tenantProfile.id, listing.id);
  console.log('Updated compatibility score:', {
    score: thirdScore.score,
    source: thirdScore.source,
    explanation: thirdScore.explanation,
    generatedAt: thirdScore.generatedAt,
  });

  const isUpdated = thirdScore.generatedAt.getTime() > firstScore.generatedAt.getTime();
  console.log(`Score successfully updated: ${isUpdated}`);
  if (!isUpdated) {
    throw new Error('Failure: Score was not updated after preference change');
  }

  // 6. Test Fallback by temporariliy nullifying environment variables or forcing error
  console.log('Testing fallback behavior...');
  const originalGemini = process.env.GEMINI_API_KEY;
  const originalNvidia = process.env.NVIDIA_API_KEY;
  process.env.GEMINI_API_KEY = '';
  process.env.NVIDIA_API_KEY = '';

  // Trigger recalculation by updating tenant profile again
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await prisma.tenantProfile.update({
    where: { id: tenantProfile.id },
    data: {
      preferredLocation: 'Marathahalli',
    },
  });

  const fallbackScore = await getOrCreateCompatibilityScore(tenantProfile.id, listing.id);
  console.log('Fallback compatibility score (expected source: "rule-engine"):', {
    score: fallbackScore.score,
    source: fallbackScore.source,
    explanation: fallbackScore.explanation,
  });

  if (fallbackScore.source !== 'rule-engine') {
    throw new Error(`Failure: Fallback did not use rule-engine, got: ${fallbackScore.source}`);
  }

  // Restore env vars
  process.env.GEMINI_API_KEY = originalGemini;
  process.env.NVIDIA_API_KEY = originalNvidia;

  console.log('--- COMPATIBILITY & FALLBACK TEST PASSED ---');
}

main()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
