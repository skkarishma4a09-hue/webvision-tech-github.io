import { prisma } from './config/prisma';

const NOW = () => new Date();

async function getSkill(name: string) {
  return prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
}

async function seedCreator(props: any) {
  const email = props.email;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: props.name,
        role: 'CREATOR',
        emailVerified: true,
        lastLoginAt: NOW(),
        profile: {
          create: {
            name: props.name,
            username: props.username,
            headline: props.headline,
            about: props.bio,
            location: props.location,
            country: props.country,
            verified: props.verified,
            level: props.level,
            availability: props.availability,
            responseTime: props.responseTime,
            completionRate: props.completionRate,
            basePrice: props.price,
            profilePhoto: props.photo || null,
          },
        },
      },
    });
  }
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (profile) {
    for (const sk of props.skills) {
      const skill = await getSkill(sk);
      await prisma.userSkill.upsert({ where: { profileId_skillId: { profileId: profile.id, skillId: skill.id } }, update: { rating: 5 }, create: { profileId: profile.id, skillId: skill.id, rating: 5, yearsOfExperience: 3 } }).catch(() => null);
    }
  }
  return user;
}

async function seedService(creatorId: string, props: any) {
  return prisma.service.create({
    data: {
      creatorId,
      category: props.category,
      title: props.title,
      description: props.description,
      tags: JSON.stringify(props.tags),
      packages: JSON.stringify(props.packages),
      gallery: JSON.stringify(props.gallery),
      faqs: JSON.stringify(props.faqs || []),
      deliveryTime: props.delivery,
      revisions: props.revisions,
      featured: props.featured || false,
      rating: props.rating || 0,
      reviewCount: props.reviewCount || 0,
      views: props.views || 0,
    },
  });
}

export async function seedMarketplace() {
  console.log('🌱 Seeding marketplace data...');

  const buyers: any[] = [];
  const buyerA = await prisma.user.upsert({
    where: { email: 'buyer@synapse.io' },
    update: {},
    create: { email: 'buyer@synapse.io', name: 'Alex Johnson', role: 'USER', emailVerified: true, lastLoginAt: NOW(), profile: { create: { name: 'Alex Johnson', headline: 'Marketing Lead', about: 'Building brands with great content.' } } },
  });
  buyers.push(buyerA);
  const buyerB = await prisma.user.upsert({
    where: { email: 'client@synapse.io' },
    update: {},
    create: { email: 'client@synapse.io', name: 'Maya White', role: 'USER', emailVerified: true, lastLoginAt: NOW(), profile: { create: { name: 'Maya White', headline: 'Startup Founder', about: 'Scaling an AI SaaS.' } } },
  });
  buyers.push(buyerB);

  const aria = await seedCreator({ email: 'aria@synapse.io', name: 'Aria Chen', username: 'ariachen', headline: 'Award-winning AI content strategist', bio: '7+ years crafting viral content for Fortune 500 brands.', location: 'San Francisco, CA', country: 'United States', verified: true, level: 'Elite', availability: 'Available', responseTime: '< 1 hr', completionRate: 98, price: 45, skills: ['AI Content', 'SEO Writing', 'Blog Posts', 'Copywriting'], photo: null });
  const marcus = await seedCreator({ email: 'marcus@synapse.io', name: 'Marcus Johnson', username: 'marcusj', headline: 'YouTube growth specialist', bio: 'Helping 50+ channels reach 100K+ subscribers.', location: 'Austin, TX', country: 'United States', verified: true, level: 'Expert', availability: 'Available', responseTime: '< 2 hrs', completionRate: 96, price: 65, skills: ['Video Scripts', 'YouTube SEO', 'Podcast Content', 'Social Media'], photo: null });
  const sofia = await seedCreator({ email: 'sofia@synapse.io', name: 'Sofia Martinez', username: 'sofiamartinez', headline: 'Conversion copywriter', bio: 'Email campaigns average 48% open rates. Worked with Shopify, Airbnb.', location: 'Barcelona, Spain', country: 'Spain', verified: true, level: 'Elite', availability: 'Busy', responseTime: '< 30 min', completionRate: 99, price: 55, skills: ['Brand Storytelling', 'Email Marketing', 'Landing Pages', 'Ad Copy'], photo: null });
  const kenji = await seedCreator({ email: 'kenji@synapse.io', name: 'Kenji Tanaka', username: 'kenjit', headline: 'Technical writer and AI prompt engineer', bio: 'Docs for SaaS and fintech companies.', location: 'Tokyo, Japan', country: 'Japan', verified: true, level: 'Professional', availability: 'Available', responseTime: '< 3 hrs', completionRate: 97, price: 75, skills: ['Technical Writing', 'AI Prompts', 'Documentation', 'WhitePapers'], photo: null });
  const priya = await seedCreator({ email: 'priya@synapse.io', name: 'Priya Patel', username: 'priyap', headline: 'Social media maven', bio: 'Instagram, TikTok and LinkedIn growth hacking.', location: 'Mumbai, India', country: 'India', verified: true, level: 'Expert', availability: 'Available', responseTime: '< 1 hr', completionRate: 97, price: 40, skills: ['Social Media Strategy', 'Instagram Growth', 'Influencer Content', 'Reels'], photo: null });
  const emma = await seedCreator({ email: 'emma@synapse.io', name: 'Emma Thompson', username: 'emmat', headline: 'Former PR director', bio: 'Crafting narratives for global brands and product launches.', location: 'London, UK', country: 'United Kingdom', verified: true, level: 'Elite', availability: 'Available', responseTime: '< 1 hr', completionRate: 99, price: 85, skills: ['PR Writing', 'Press Releases', 'Brand Voice', 'Corporate Communications'], photo: null });

  const svcDefs = [
    { creator: aria, props: { category: 'Blog Content', title: 'SEO Blog Articles Package', description: 'Keyword-optimized blog articles that rank. Includes research, outline, draft and one round of revisions.', tags: ['SEO', 'Blog', 'Content Strategy'], delivery: '3 days', revisions: 2, rating: 4.97, reviewCount: 68, views: 12000, gallery: ['https://picsum.photos/800/500?random=11', 'https://picsum.photos/800/500?random=12'], packages: { basic: { name: 'Basic', price: 40, delivery: '2 days', desc: '1 article up to 800 words', revisions: 1 }, standard: { name: 'Standard', price: 80, delivery: '3 days', desc: '2 articles up to 1200 words + keywords', revisions: 2 }, premium: { name: 'Premium', price: 160, delivery: '5 days', desc: '4 articles + SEO meta + content calendar', revisions: 3 } } } },
    { creator: marcus, props: { category: 'Video', title: 'YouTube Script & Channel Strategy', description: 'Retention-optimized YouTube scripts with hooks, structure and CTAs plus channel growth roadmap.', tags: ['YouTube', 'Video Scripts', 'SEO'], delivery: '3 days', revisions: 2, rating: 4.91, reviewCount: 24, views: 9000, gallery: ['https://picsum.photos/800/500?random=21', 'https://picsum.photos/800/500?random=22'], packages: { basic: { name: 'Basic', price: 60, delivery: '2 days', desc: '1 script (1500 words)', revisions: 1 }, standard: { name: 'Standard', price: 130, delivery: '3 days', desc: '1 script + title/thumbnail ideas', revisions: 2 }, premium: { name: 'Premium', price: 260, delivery: '5 days', desc: '4 scripts + channel audit', revisions: 4 } } } },
    { creator: sofia, props: { category: 'Email Marketing', title: 'Email Sequence That Sells', description: 'High-open-rate email sequences built on proven frameworks with subject line A/B options.', tags: ['Email', 'Copywriting', 'Conversion'], delivery: '2 days', revisions: 2, rating: 4.99, reviewCount: 120, views: 15000, gallery: ['https://picsum.photos/800/500?random=31', 'https://picsum.photos/800/500?random=32'], packages: { basic: { name: 'Basic', price: 55, delivery: '1 day', desc: '3 emails + subject lines', revisions: 1 }, standard: { name: 'Standard', price: 110, delivery: '2 days', desc: '5 emails + flow setup doc', revisions: 2 }, premium: { name: 'Premium', price: 220, delivery: '4 days', desc: '10 emails + segmentation guide', revisions: 3 } } } },
    { creator: kenji, props: { category: 'Technical', title: 'Product Documentation & Guides', description: 'Clear developer and end-user documentation with API references and quick-start guides.', tags: ['Documentation', 'Technical Writing'], delivery: '4 days', revisions: 3, rating: 4.85, reviewCount: 9, views: 6000, gallery: ['https://picsum.photos/800/500?random=41', 'https://picsum.photos/800/500?random=42'], packages: { basic: { name: 'Basic', price: 75, delivery: '2 days', desc: 'Getting-started guide', revisions: 2 }, standard: { name: 'Standard', price: 150, delivery: '4 days', desc: 'Full guide + API reference', revisions: 3 }, premium: { name: 'Premium', price: 300, delivery: '7 days', desc: 'Full doc suite + architecture', revisions: 5 } } } },
    { creator: priya, props: { category: 'Social Media', title: 'Social Media Growth Pack', description: '30-day content calendar with captions, hashtags and posting strategy for Instagram/TikTok/LinkedIn.', tags: ['Social Media', 'Growth', 'Reels'], delivery: '2 days', revisions: 2, rating: 4.93, reviewCount: 34, views: 11000, gallery: ['https://picsum.photos/800/500?random=51', 'https://picsum.photos/800/500?random=52'], packages: { basic: { name: 'Basic', price: 40, delivery: '1 day', desc: '7 days of content + captions', revisions: 1 }, standard: { name: 'Standard', price: 90, delivery: '2 days', desc: '30 days calendar + strategy', revisions: 2 }, premium: { name: 'Premium', price: 180, delivery: '4 days', desc: 'Full playbook + templates', revisions: 3 } } } },
    { creator: emma, props: { category: 'PR', title: 'Press Release & PR Kit', description: 'Launch-ready press releases, media lists and pitch notes crafted by a former PR director.', tags: ['PR', 'Press Release', 'Media'], delivery: '1 day', revisions: 2, rating: 4.98, reviewCount: 15, views: 5000, gallery: ['https://picsum.photos/800/500?random=61', 'https://picsum.photos/800/500?random=62'], packages: { basic: { name: 'Basic', price: 85, delivery: '1 day', desc: '1 press release (500 words)', revisions: 1 }, standard: { name: 'Standard', price: 170, delivery: '2 days', desc: 'Press release + pitch notes', revisions: 2 }, premium: { name: 'Premium', price: 340, delivery: '3 days', desc: 'PR kit + media list', revisions: 3 } } } },
  ];

  const services: any[] = [];
  for (const { creator, props } of svcDefs) {
    services.push(await seedService(creator.id, props));
  }

  // Orders with a full lifecycle demo
  const o1 = await prisma.order.create({
    data: {
      serviceId: services[0].id, buyerId: buyerA.id, creatorId: aria.id, packageName: 'standard', amount: 80,
      requirements: '3 SEO articles for my SaaS targeting marketing managers.',
      milestones: JSON.stringify([{ title: 'Outline & keyword research', done: true }, { title: 'First draft', done: true }, { title: 'Revisions & delivery', done: false }]),
      timeline: JSON.stringify([{ status: 'PENDING', at: NOW().toISOString(), note: 'Order created' }, { status: 'ACTIVE', at: NOW().toISOString(), note: 'Creator started' }, { status: 'DELIVERED', at: NOW().toISOString(), note: 'Delivered 3 articles' }]),
      status: 'DELIVERED', revisionsUsed: 1, deadline: new Date(Date.now() + 4 * 86400000),
    },
  });
  const o2 = await prisma.order.create({
    data: {
      serviceId: services[1].id, buyerId: buyerB.id, creatorId: marcus.id, packageName: 'basic', amount: 60,
      requirements: 'YouTube script for my tech channel.',
      milestones: JSON.stringify([{ title: 'Hook & structure', done: true }, { title: 'Final script', done: false }]),
      timeline: JSON.stringify([{ status: 'PENDING', at: NOW().toISOString(), note: 'Order created' }, { status: 'ACTIVE', at: NOW().toISOString(), note: 'Creator started' }]),
      status: 'ACTIVE', deadline: new Date(Date.now() + 2 * 86400000),
    },
  });
  const o3 = await prisma.order.create({
    data: {
      serviceId: services[2].id, buyerId: buyerA.id, creatorId: sofia.id, packageName: 'standard', amount: 110,
      requirements: 'Onboarding email sequence.',
      milestones: JSON.stringify([{ title: 'Draft', done: true }, { title: 'Final', done: true }]),
      timeline: JSON.stringify([{ status: 'PENDING', at: NOW().toISOString(), note: 'Order created' }, { status: 'ACTIVE', at: NOW().toISOString(), note: 'Started' }, { status: 'DELIVERED', at: NOW().toISOString(), note: 'Delivered' }, { status: 'REVIEW', at: NOW().toISOString(), note: 'In review' }, { status: 'COMPLETED', at: NOW().toISOString(), note: 'Completed' }]),
      status: 'COMPLETED', revisionsUsed: 2, deadline: new Date(Date.now() - 2 * 86400000),
    },
  });

  // Work projects from active/delivered orders
  await prisma.workProject.create({
    data: { orderId: o1.id, clientId: buyerA.id, creatorId: aria.id, title: 'SEO Blog Articles Package', category: 'Blog Content', budget: 80, progress: 70, status: 'ACTIVE', deadline: new Date(Date.now() + 4 * 86400000), milestones: JSON.stringify([{ id: 'm1', title: 'Outline & keyword research', done: true }, { id: 'm2', title: 'First draft', done: true }, { id: 'm3', title: 'Revisions & delivery', done: false }]), checklist: JSON.stringify([{ id: 'c1', title: 'Confirm keywords', done: true }, { id: 'c2', title: 'Approve outline', done: true }, { id: 'c3', title: 'Publish to blog', done: false }]), deliverables: JSON.stringify([{ id: 'd1', name: 'Article 1 draft.docx', url: '#', version: 'v1' }]), activity: JSON.stringify([{ at: NOW().toISOString(), text: 'Created' }, { at: NOW().toISOString(), text: 'Aria: Outline approved' }]), comments: JSON.stringify([{ id: 'cm1', userId: buyerA.id, userName: 'Alex Johnson', text: 'Outline looks great!', at: NOW().toISOString() }]) },
  });

  // Reviews
  await prisma.review.create({ data: { serviceId: services[0].id, orderId: o1.id, creatorId: aria.id, authorId: buyerA.id, rating: 5, text: 'Incredible quality and delivered ahead of schedule.', verified: true } });
  await prisma.review.create({ data: { serviceId: services[2].id, orderId: o3.id, creatorId: sofia.id, authorId: buyerA.id, rating: 5, text: 'Best creator on the platform. Nails the tone every time.', verified: true } });
  await prisma.review.create({ data: { serviceId: services[1].id, creatorId: marcus.id, authorId: buyerB.id, rating: 4, text: 'Great scripts, clear communication.', verified: false } });

  // Conversations + messages
  const conv = await prisma.conversation.create({ data: { members: { create: [{ userId: buyerA.id }, { userId: aria.id }] } } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: aria.id, text: 'Hi Alex! First draft is ready for review 🎉' } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: buyerA.id, text: 'Amazing, checking now!' } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: buyerA.id, text: 'Great work, please proceed with revisions.' } });

  // Notifications for demo buyer
  await prisma.notification.createMany({
    data: [
      { userId: buyerA.id, type: 'ORDERS', title: 'Order delivered 📦', body: 'Your SEO blog order was delivered.' },
      { userId: buyerA.id, type: 'MESSAGES', title: 'New message 💬', body: 'Aria: First draft is ready for review 🎉' },
      { userId: buyerA.id, type: 'ORDERS', title: 'Order completed ✅', body: 'Your email sequence order was completed.' },
      { userId: aria.id, type: 'ORDERS', title: 'New order received 🎉', body: 'Alex Johnson ordered SEO Blog Articles Package.' },
    ],
  });

  // AI generation history
  await prisma.aiGeneration.create({ data: { userId: buyerA.id, toolId: 'blog', input: 'AI-powered content marketing', output: 'Sample generated article about AI content marketing.', settings: '{"tone":"professional"}' } });

  console.log('✅ Marketplace seeded.');
  console.log('- Creators: aria@synapse.io, marcus@synapse.io, sofia@synapse.io, kenji@synapse.io, priya@synapse.io, emma@synapse.io');
  console.log('- Buyers: buyer@synapse.io, client@synapse.io');
  console.log('- OTP sign-in: enter any seeded email (code prints to console in dev when SMTP is unset)');
}

if (process.argv[1]?.includes('seedMarketplace')) {
  seedMarketplace()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Marketplace seeding failed:', err);
      process.exit(1);
    });
}