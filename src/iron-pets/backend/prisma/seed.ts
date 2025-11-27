/**
 * Iron Pets MVP - Database Seed Script
 *
 * Seeds the database with:
 * - Sample categories (hierarchical structure)
 * - Sample brands (10 popular pet brands)
 * - Sample products (20+ products across categories)
 * - Sample promo codes
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, PetSpecies, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================
  // 1. CATEGORIES (Hierarchical Structure)
  // ============================================
  console.log('📂 Creating categories...');

  const dogCategory = await prisma.category.create({
    data: {
      name: 'Dogs',
      slug: 'dogs',
      description: 'Everything your dog needs to be happy and healthy',
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
      sortOrder: 1,
      isActive: true,
    },
  });

  const catCategory = await prisma.category.create({
    data: {
      name: 'Cats',
      slug: 'cats',
      description: 'Premium products for your feline friends',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
      sortOrder: 2,
      isActive: true,
    },
  });

  const smallPetsCategory = await prisma.category.create({
    data: {
      name: 'Small Pets',
      slug: 'small-pets',
      description: 'Quality care for rabbits, hamsters, guinea pigs and more',
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca',
      sortOrder: 3,
      isActive: true,
    },
  });

  // Dog Subcategories
  const dogFood = await prisma.category.create({
    data: {
      name: 'Dog Food',
      slug: 'dog-food',
      description: 'Nutritious meals for dogs of all sizes',
      parentId: dogCategory.id,
      sortOrder: 1,
    },
  });

  const dogTreats = await prisma.category.create({
    data: {
      name: 'Dog Treats',
      slug: 'dog-treats',
      description: 'Tasty rewards for your good boy',
      parentId: dogCategory.id,
      sortOrder: 2,
    },
  });

  const dogToys = await prisma.category.create({
    data: {
      name: 'Dog Toys',
      slug: 'dog-toys',
      description: 'Fun and durable toys for playtime',
      parentId: dogCategory.id,
      sortOrder: 3,
    },
  });

  // Cat Subcategories
  const catFood = await prisma.category.create({
    data: {
      name: 'Cat Food',
      slug: 'cat-food',
      description: 'Premium nutrition for cats',
      parentId: catCategory.id,
      sortOrder: 1,
    },
  });

  const catTreats = await prisma.category.create({
    data: {
      name: 'Cat Treats',
      slug: 'cat-treats',
      description: 'Delicious treats your cat will love',
      parentId: catCategory.id,
      sortOrder: 2,
    },
  });

  const catToys = await prisma.category.create({
    data: {
      name: 'Cat Toys',
      slug: 'cat-toys',
      description: 'Interactive toys to keep cats entertained',
      parentId: catCategory.id,
      sortOrder: 3,
    },
  });

  // Small Pets Subcategories
  const smallPetFood = await prisma.category.create({
    data: {
      name: 'Small Pet Food',
      slug: 'small-pet-food',
      description: 'Healthy food for small animals',
      parentId: smallPetsCategory.id,
      sortOrder: 1,
    },
  });

  const bedding = await prisma.category.create({
    data: {
      name: 'Bedding & Litter',
      slug: 'bedding-litter',
      description: 'Comfortable and absorbent bedding',
      parentId: smallPetsCategory.id,
      sortOrder: 2,
    },
  });

  console.log(`✅ Created ${await prisma.category.count()} categories`);

  // ============================================
  // 2. BRANDS (10 Popular Pet Brands)
  // ============================================
  console.log('🏷️  Creating brands...');

  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Royal Canin',
        slug: 'royal-canin',
        description: 'Premium pet nutrition backed by science',
        logoUrl: 'https://example.com/logos/royal-canin.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Blue Buffalo',
        slug: 'blue-buffalo',
        description: 'Natural, holistic pet food',
        logoUrl: 'https://example.com/logos/blue-buffalo.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Purina Pro Plan',
        slug: 'purina-pro-plan',
        description: 'Advanced nutrition for pets',
        logoUrl: 'https://example.com/logos/purina.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: "Hill's Science Diet",
        slug: 'hills-science-diet',
        description: 'Precisely balanced nutrition',
        logoUrl: 'https://example.com/logos/hills.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Wellness',
        slug: 'wellness',
        description: 'Complete and balanced pet nutrition',
        logoUrl: 'https://example.com/logos/wellness.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'KONG',
        slug: 'kong',
        description: 'Durable toys for dogs',
        logoUrl: 'https://example.com/logos/kong.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Temptations',
        slug: 'temptations',
        description: 'Irresistible cat treats',
        logoUrl: 'https://example.com/logos/temptations.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Oxbow',
        slug: 'oxbow',
        description: 'Quality nutrition for small animals',
        logoUrl: 'https://example.com/logos/oxbow.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Greenies',
        slug: 'greenies',
        description: 'Dental treats for healthier teeth',
        logoUrl: 'https://example.com/logos/greenies.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Merrick',
        slug: 'merrick',
        description: 'Real whole foods for pets',
        logoUrl: 'https://example.com/logos/merrick.png',
      },
    }),
  ]);

  console.log(`✅ Created ${brands.length} brands`);

  // ============================================
  // 3. PRODUCTS (20+ across categories)
  // ============================================
  console.log('📦 Creating products...');

  const products = [];

  // DOG FOOD PRODUCTS
  products.push(
    await prisma.product.create({
      data: {
        sku: 'DOG-RC-001',
        name: 'Royal Canin Adult Dry Dog Food - 30lb',
        slug: 'royal-canin-adult-dry-dog-food-30lb',
        shortDescription: 'Premium nutrition for adult dogs',
        description: 'Royal Canin Adult formula provides complete and balanced nutrition tailored for adult dogs. Made with high-quality proteins and easily digestible ingredients.',
        price: 54.99,
        comparePrice: 64.99,
        cost: 35.00,
        categoryId: dogFood.id,
        brandId: brands[0].id, // Royal Canin
        stockQuantity: 100,
        lowStockThreshold: 10,
        weight: 480, // 30 lbs in oz
        specifications: {
          size: '30 lbs',
          lifestage: 'Adult',
          protein: '23%',
          fat: '12%',
          ingredients: 'Chicken, rice, corn, wheat',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119',
              altText: 'Royal Canin Dog Food Bag',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  products.push(
    await prisma.product.create({
      data: {
        sku: 'DOG-BB-001',
        name: 'Blue Buffalo Life Protection Formula Adult Chicken & Brown Rice',
        slug: 'blue-buffalo-adult-chicken-brown-rice',
        shortDescription: 'Natural dog food with real chicken',
        description: 'Blue Buffalo Life Protection Formula features real chicken as the first ingredient. Enhanced with LifeSource Bits - a precise blend of antioxidants, vitamins and minerals.',
        price: 49.99,
        categoryId: dogFood.id,
        brandId: brands[1].id, // Blue Buffalo
        stockQuantity: 75,
        weight: 384, // 24 lbs
        specifications: {
          size: '24 lbs',
          lifestage: 'Adult',
          protein: '24%',
          fat: '14%',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def',
              altText: 'Blue Buffalo Dog Food',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // DOG TREATS
  products.push(
    await prisma.product.create({
      data: {
        sku: 'DOG-GR-001',
        name: 'Greenies Original Regular Size Dental Treats - 36oz',
        slug: 'greenies-original-regular-dental-treats',
        shortDescription: 'Dental treats for clean teeth and fresh breath',
        description: 'Greenies Original dental treats are veterinarian recommended for at-home oral care. The chewy texture helps clean down to the gumline.',
        price: 29.99,
        comparePrice: 34.99,
        categoryId: dogTreats.id,
        brandId: brands[8].id, // Greenies
        stockQuantity: 120,
        weight: 36,
        specifications: {
          count: '36 treats',
          size: 'Regular',
          benefits: 'Dental health, fresh breath',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1603923227984-b44c448f4d1a',
              altText: 'Greenies Dental Treats',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // DOG TOYS
  products.push(
    await prisma.product.create({
      data: {
        sku: 'DOG-KONG-001',
        name: 'KONG Classic Dog Toy - Large',
        slug: 'kong-classic-dog-toy-large',
        shortDescription: 'Durable rubber toy for power chewers',
        description: 'The KONG Classic is the gold standard of dog toys. Made from ultra-durable natural rubber, its perfect for satisfying dogs instinctual needs and providing mental stimulation.',
        price: 13.99,
        categoryId: dogToys.id,
        brandId: brands[5].id, // KONG
        stockQuantity: 200,
        weight: 8,
        specifications: {
          size: 'Large',
          material: 'Natural rubber',
          'suitable-for': 'Dogs 30-65 lbs',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17',
              altText: 'KONG Classic Red Toy',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // CAT FOOD
  products.push(
    await prisma.product.create({
      data: {
        sku: 'CAT-RC-001',
        name: 'Royal Canin Feline Health Nutrition Indoor Adult Dry Cat Food',
        slug: 'royal-canin-indoor-adult-cat-food',
        shortDescription: 'Complete nutrition for indoor cats',
        description: 'Royal Canin Indoor Adult formula is designed specifically for cats living indoors. Helps maintain ideal weight and reduces stool odor.',
        price: 44.99,
        categoryId: catFood.id,
        brandId: brands[0].id, // Royal Canin
        stockQuantity: 85,
        weight: 192, // 12 lbs
        specifications: {
          size: '12 lbs',
          lifestage: 'Adult',
          protein: '27%',
          fat: '11%',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119',
              altText: 'Royal Canin Cat Food',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  products.push(
    await prisma.product.create({
      data: {
        sku: 'CAT-WELL-001',
        name: 'Wellness CORE Grain-Free Indoor Formula Dry Cat Food',
        slug: 'wellness-core-indoor-cat-food',
        shortDescription: 'Protein-focused grain-free formula',
        description: 'Wellness CORE is based on the nutritional philosophy that pets thrive on a diet mainly comprised of meat. Rich in protein from quality sources.',
        price: 39.99,
        categoryId: catFood.id,
        brandId: brands[4].id, // Wellness
        stockQuantity: 60,
        weight: 176, // 11 lbs
        specifications: {
          size: '11 lbs',
          protein: '38%',
          'grain-free': true,
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42',
              altText: 'Wellness Cat Food',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // CAT TREATS
  products.push(
    await prisma.product.create({
      data: {
        sku: 'CAT-TEMP-001',
        name: 'Temptations Classic Treats for Cats - Tasty Chicken Flavor',
        slug: 'temptations-chicken-treats',
        shortDescription: 'Irresistibly tasty cat treats',
        description: 'Temptations are 100% nutritionally complete and balanced for adult cat maintenance. Under 2 calories per treat with a satisfying crunch.',
        price: 8.99,
        categoryId: catTreats.id,
        brandId: brands[6].id, // Temptations
        stockQuantity: 250,
        weight: 6.3,
        specifications: {
          flavor: 'Chicken',
          count: 'Approx 130 treats',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1611003228941-98852ba62227',
              altText: 'Temptations Cat Treats',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // CAT TOYS
  products.push(
    await prisma.product.create({
      data: {
        sku: 'CAT-TOY-001',
        name: 'Interactive Feather Wand Cat Toy Set',
        slug: 'interactive-feather-wand-toy-set',
        shortDescription: '10 pieces interactive cat teaser toys',
        description: 'Keep your cat entertained for hours with this interactive feather wand set. Includes 10 different attachments to satisfy your cats hunting instincts.',
        price: 12.99,
        categoryId: catToys.id,
        brandId: brands[5].id, // Generic/KONG
        stockQuantity: 150,
        weight: 4,
        specifications: {
          pieces: '10',
          material: 'Feathers, bells, ribbons',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f',
              altText: 'Cat Feather Toy',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // SMALL PET FOOD
  products.push(
    await prisma.product.create({
      data: {
        sku: 'SMALL-OX-001',
        name: 'Oxbow Essentials Adult Guinea Pig Food',
        slug: 'oxbow-guinea-pig-food',
        shortDescription: 'Fortified food for adult guinea pigs',
        description: 'Oxbow Essentials is a uniform, fortified food that provides complete nutrition. Stabilized Vitamin C and high fiber support digestive health.',
        price: 24.99,
        categoryId: smallPetFood.id,
        brandId: brands[7].id, // Oxbow
        stockQuantity: 45,
        weight: 80, // 5 lbs
        specifications: {
          size: '5 lbs',
          'vitamin-c': 'Stabilized',
          fiber: 'High',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1548366086-7f1b76106622',
              altText: 'Oxbow Guinea Pig Food',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  products.push(
    await prisma.product.create({
      data: {
        sku: 'SMALL-OX-002',
        name: 'Oxbow Essentials Adult Rabbit Food (Timothy Based)',
        slug: 'oxbow-adult-rabbit-food',
        shortDescription: 'Timothy-based nutrition for adult rabbits',
        description: 'Oxbow Essentials Adult Rabbit Food provides complete nutrition with high fiber timothy grass. Supports healthy digestion and dental health.',
        price: 21.99,
        categoryId: smallPetFood.id,
        brandId: brands[7].id, // Oxbow
        stockQuantity: 50,
        weight: 80, // 5 lbs
        specifications: {
          size: '5 lbs',
          'primary-ingredient': 'Timothy hay',
          fiber: '25-29%',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1535241749838-299277b6305f',
              altText: 'Oxbow Rabbit Food',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // BEDDING
  products.push(
    await prisma.product.create({
      data: {
        sku: 'SMALL-BED-001',
        name: 'Carefresh Complete Natural Paper Bedding',
        slug: 'carefresh-paper-bedding',
        shortDescription: 'Soft, absorbent bedding for small pets',
        description: 'Carefresh is the #1 best-selling paper bedding in the US. Made from reclaimed natural fiber. 2x more absorbent than shavings.',
        price: 19.99,
        categoryId: bedding.id,
        brandId: brands[7].id, // Generic/Oxbow category
        stockQuantity: 80,
        weight: 80, // 50L volume
        specifications: {
          volume: '50 liters',
          material: 'Paper fiber',
          'odor-control': 'Up to 10 days',
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1548366086-7f1b76106622',
              altText: 'Carefresh Bedding',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  // Additional products for variety
  products.push(
    await prisma.product.create({
      data: {
        sku: 'DOG-MERR-001',
        name: 'Merrick Grain Free Real Beef + Sweet Potato Recipe Dry Dog Food',
        slug: 'merrick-grain-free-beef-sweet-potato',
        shortDescription: 'Grain-free recipe with real deboned beef',
        description: 'Merrick Grain Free features real deboned beef as the #1 ingredient. 70% protein and healthy fat + 30% fresh produce, fiber, vitamins, minerals.',
        price: 59.99,
        categoryId: dogFood.id,
        brandId: brands[9].id, // Merrick
        stockQuantity: 40,
        weight: 320, // 20 lbs
        specifications: {
          size: '20 lbs',
          protein: '38%',
          'grain-free': true,
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119',
              altText: 'Merrick Dog Food',
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        },
      },
    })
  );

  console.log(`✅ Created ${products.length} products`);

  // ============================================
  // 4. PROMO CODES
  // ============================================
  console.log('🎟️  Creating promo codes...');

  const promoCodes = await Promise.all([
    prisma.promoCode.create({
      data: {
        code: 'WELCOME10',
        description: 'First-time customer 10% discount',
        discountType: DiscountType.percentage,
        discountValue: 10,
        minOrderValue: 30,
        maxUses: 1000,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    }),
    prisma.promoCode.create({
      data: {
        code: 'FREESHIP50',
        description: 'Free shipping on orders $50+',
        discountType: DiscountType.fixed,
        discountValue: 5.99,
        minOrderValue: 50,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    }),
    prisma.promoCode.create({
      data: {
        code: 'SAVE20',
        description: '$20 off orders $100+',
        discountType: DiscountType.fixed,
        discountValue: 20,
        minOrderValue: 100,
        maxUses: 500,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    }),
  ]);

  console.log(`✅ Created ${promoCodes.length} promo codes`);

  // ============================================
  // 5. DEMO USER (Optional for testing)
  // ============================================
  console.log('👤 Creating demo user...');

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@ironpets.com',
      passwordHash: await bcrypt.hash('Demo123!', 12),
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'User',
          phone: '555-123-4567',
          marketingOptIn: true,
        },
      },
      pets: {
        create: [
          {
            name: 'Max',
            species: PetSpecies.dog,
            breed: 'Golden Retriever',
            birthDate: new Date('2020-05-15'),
            weight: 65,
            weightUnit: 'lbs',
          },
          {
            name: 'Luna',
            species: PetSpecies.cat,
            breed: 'Siamese',
            birthDate: new Date('2021-08-22'),
            weight: 10,
            weightUnit: 'lbs',
          },
        ],
      },
    },
  });

  console.log('✅ Created demo user');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Categories: ${await prisma.category.count()}`);
  console.log(`   Brands: ${await prisma.brand.count()}`);
  console.log(`   Products: ${await prisma.product.count()}`);
  console.log(`   Promo Codes: ${await prisma.promoCode.count()}`);
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Pets: ${await prisma.pet.count()}`);
  console.log('\n✅ You can now start the application!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
