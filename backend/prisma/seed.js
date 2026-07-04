import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING DATABASE SEEDING ---');

  // 1. Clean up existing data (optional, but ensures fresh seed)
  console.log('Cleaning up existing compatibility scores, chats, interests, listings, and users...');
  await prisma.compatibilityScore.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatRoom.deleteMany({});
  await prisma.interestRequest.deleteMany({});
  await prisma.listingPhoto.deleteMany({});
  await prisma.savedListing.deleteMany({});
  await prisma.tenantProfile.deleteMany({});
  await prisma.roomListing.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash common password
  const hashedPassword = await bcrypt.hash('Password@123', 12);

  // 3. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@roomyaaro.com';
  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME || 'Platform Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log('seeded: Admin user');

  // 4. Mock Data Configuration (Noida, Delhi, Bangalore, Kanpur, Lucknow, Pune, Mumbai)
  const mockLocations = [
    {
      city: 'Noida',
      preferredLocation: 'Sector 62, Noida',
      rent: 9500,
      minBudget: 8000,
      maxBudget: 12000,
      listingTitle: 'Premium PG Room in Sector 62',
      listingDesc: 'Furnished single room available in a highly secure residential society near Sector 62 metro. High-speed internet and daily housekeeping included.',
      roomType: 'SINGLE',
      furnishingStatus: 'FURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Delhi',
      preferredLocation: 'Connaught Place, Delhi',
      rent: 14500,
      minBudget: 12000,
      maxBudget: 18000,
      listingTitle: 'Sleek Studio near Metro Station',
      listingDesc: 'Semi-furnished cozy studio apartment situated in Connaught Place. 5-min walk to Central Secretariat metro. Perfect for professionals or students.',
      roomType: 'STUDIO',
      furnishingStatus: 'SEMI_FURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Bangalore',
      preferredLocation: 'Indiranagar, Bangalore',
      rent: 18000,
      minBudget: 15000,
      maxBudget: 25000,
      listingTitle: 'Spacious Flatmate Room in Indiranagar',
      listingDesc: 'Fully furnished private room in a premium 3BHK apartment. Located in the heart of Indiranagar, close to popular cafes, parks, and metro station.',
      roomType: 'DOUBLE',
      furnishingStatus: 'FURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Kanpur',
      preferredLocation: 'Kalyanpur, Kanpur',
      rent: 6000,
      minBudget: 5000,
      maxBudget: 8000,
      listingTitle: 'Cozy Room near IIT Kanpur',
      listingDesc: 'Unfurnished single occupancy room available in Kalyanpur. Close proximity to IIT Kanpur. Safe, peaceful locality with constant water and power backup.',
      roomType: 'SINGLE',
      furnishingStatus: 'UNFURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Lucknow',
      preferredLocation: 'Hazratganj, Lucknow',
      rent: 8500,
      minBudget: 7000,
      maxBudget: 11000,
      listingTitle: 'Spacious Flatmate Room in Hazratganj',
      listingDesc: 'Beautiful semi-furnished double room in a 2BHK. High ceilings, ample ventilation, and located in the main market area of Hazratganj.',
      roomType: 'DOUBLE',
      furnishingStatus: 'SEMI_FURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Pune',
      preferredLocation: 'Hinjewadi, Pune',
      rent: 11000,
      minBudget: 9000,
      maxBudget: 14000,
      listingTitle: 'Single Occupancy Room near IT Park',
      listingDesc: 'Fully furnished single room in Hinjewadi Phase 1. Walking distance to major tech giants. Attached bathroom, modular kitchen access, and gym access.',
      roomType: 'SINGLE',
      furnishingStatus: 'FURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Mumbai',
      preferredLocation: 'Bandra West, Mumbai',
      rent: 28000,
      minBudget: 20000,
      maxBudget: 35000,
      listingTitle: 'Charming Studio Flat in Bandra West',
      listingDesc: 'Fully furnished studio room with sea view. Centrally located in Bandra, 24/7 water supply, gated security, close to train station and main avenues.',
      roomType: 'STUDIO',
      furnishingStatus: 'FURNISHED',
      photoUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // 5. Seed Users, Profiles, and Listings
  for (const loc of mockLocations) {
    const cityNameLower = loc.city.toLowerCase();

    // Create Owner User
    const owner = await prisma.user.create({
      data: {
        name: `${loc.city} Room Owner`,
        email: `owner_${cityNameLower}@roomyaaro.com`,
        password: hashedPassword,
        role: 'OWNER',
        isActive: true,
        isEmailVerified: true,
      },
    });

    // Create Tenant User
    const tenant = await prisma.user.create({
      data: {
        name: `${loc.city} Flatmate Seeker`,
        email: `tenant_${cityNameLower}@roomyaaro.com`,
        password: hashedPassword,
        role: 'TENANT',
        isActive: true,
        isEmailVerified: true,
      },
    });

    // Create Tenant Profile
    await prisma.tenantProfile.create({
      data: {
        userId: tenant.id,
        preferredLocation: loc.preferredLocation,
        minBudget: loc.minBudget,
        maxBudget: loc.maxBudget,
        moveInDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      },
    });

    // Create Listing
    const listing = await prisma.roomListing.create({
      data: {
        ownerId: owner.id,
        title: loc.listingTitle,
        location: loc.preferredLocation,
        rent: loc.rent,
        availableFrom: new Date(),
        roomType: loc.roomType,
        furnishingStatus: loc.furnishingStatus,
        description: loc.listingDesc,
        status: 'AVAILABLE',
      },
    });

    // Create Listing Photo
    await prisma.listingPhoto.create({
      data: {
        listingId: listing.id,
        url: loc.photoUrl,
        order: 0,
      },
    });

    console.log(`seeded: Owner & Tenant pair for city: ${loc.city}`);
  }

  // 6. Pre-calculate mock Compatibility Scores and mock Chat messages
  console.log('Generating sample compatibility scores...');
  const tenantProfiles = await prisma.tenantProfile.findMany({});
  const listings = await prisma.roomListing.findMany({ include: { owner: true } });

  for (const profile of tenantProfiles) {
    for (const listing of listings) {
      // Calculate a dummy score based on location similarity
      let score = 50;
      let explanation = 'Moderate match based on budget and regional constraints.';

      if (listing.location.toLowerCase().includes(profile.preferredLocation.toLowerCase().split(',')[0].trim())) {
        score = 95;
        explanation = `Excellent match! The rent of ₹${listing.rent} fits your budget, and the location is in your preferred area "${profile.preferredLocation}".`;
      } else if (listing.rent >= profile.minBudget && listing.rent <= profile.maxBudget) {
        score = 75;
        explanation = `Decent match. The rent is within your budget, but the location is in a different city or sector.`;
      }

      await prisma.compatibilityScore.create({
        data: {
          tenantId: profile.id,
          listingId: listing.id,
          score,
          explanation,
          source: 'rule-engine',
        },
      });
    }
  }

  // 7. Seed active sample Interest requests & chat message history for each city
  console.log('Seeding active interest requests and chat conversations for all city pairs...');
  
  // Find all tenants and owner listings
  const tenants = await prisma.user.findMany({ where: { role: 'TENANT' } });
  const allListings = await prisma.roomListing.findMany({ include: { owner: true } });

  for (const tenantUser of tenants) {
    const cityName = tenantUser.name.split(' ')[0]; // Noida, Delhi, etc.
    const matchingListing = allListings.find(l => l.location.toLowerCase().includes(cityName.toLowerCase()));

    if (matchingListing) {
      // Interest Request
      const interest = await prisma.interestRequest.create({
        data: {
          tenantId: tenantUser.id,
          listingId: matchingListing.id,
          status: 'ACCEPTED',
        },
      });

      // Chat Room
      const chatRoom = await prisma.chatRoom.create({
        data: {
          interestId: interest.id,
          listingId: matchingListing.id,
        },
      });

      // Chat Messages
      await prisma.chatMessage.create({
        data: {
          roomId: chatRoom.id,
          senderId: tenantUser.id,
          content: `Hey! I saw your listing: "${matchingListing.title}" in ${cityName} and the AI compatibility score is very high. Is it still available for rent?`,
        },
      });

      await prisma.chatMessage.create({
        data: {
          roomId: chatRoom.id,
          senderId: matchingListing.ownerId,
          content: `Hello! Yes, the room is indeed available. It's clean, ready, and fully conforms to the description. When would you like to schedule a virtual tour or call?`,
        },
      });

      await prisma.chatMessage.create({
        data: {
          roomId: chatRoom.id,
          senderId: tenantUser.id,
          content: `That sounds great! I'm free this weekend on Saturday afternoon. Does that work for you?`,
        },
      });

      await prisma.chatMessage.create({
        data: {
          roomId: chatRoom.id,
          senderId: matchingListing.ownerId,
          content: `Saturday afternoon works perfectly. Let's connect then!`,
        },
      });
    }
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
