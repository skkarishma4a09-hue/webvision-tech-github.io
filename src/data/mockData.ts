export const creators = [
  { id:'1', name:'Aria Chen', username:'@ariachen', initials:'AC', color:'#8B5CF6', verified:true, level:'Elite', rating:4.97, reviews:342, skills:['AI Content','SEO Writing','Blog Posts','Copywriting'], jobs:487, price:45, responseTime:'< 1 hr', availability:'Available', bio:'Award-winning AI content strategist with 7+ years crafting viral content for Fortune 500 brands.', location:'San Francisco, CA', responseRate:99, completionRate:98, tags:['Top Creator','5-Star Creator','AI Expert'], joined:'2022-03-15', country:'United States', earnings:89420, views:12840 },
  { id:'2', name:'Marcus Johnson', username:'@marcusj', initials:'MJ', color:'#3B82F6', verified:true, level:'Expert', rating:4.91, reviews:218, skills:['Video Scripts','YouTube SEO','Podcast Content','Social Media'], jobs:312, price:65, responseTime:'< 2 hrs', availability:'Available', bio:'YouTube growth specialist helping 50+ channels reach 100K+ subscribers through data-driven content.', location:'Austin, TX', responseRate:97, completionRate:96, tags:['Rising Star','Fast Responder'], joined:'2022-08-20', country:'United States', earnings:67300, views:9210 },
  { id:'3', name:'Sofia Martinez', username:'@sofiamartinez', initials:'SM', color:'#EC4899', verified:true, level:'Elite', rating:4.99, reviews:567, skills:['Brand Storytelling','Email Marketing','Landing Pages','Ad Copy'], jobs:621, price:55, responseTime:'< 30 min', availability:'Busy', bio:'Conversion copywriter. My email campaigns average 48% open rates. Worked with Shopify, Airbnb, and 200+ startups.', location:'Barcelona, Spain', responseRate:100, completionRate:99, tags:['Top Creator','5-Star Creator','Trusted Creator','100+ Projects'], joined:'2021-11-08', country:'Spain', earnings:112000, views:18650 },
  { id:'4', name:'Kenji Tanaka', username:'@kenjit', initials:'KT', color:'#10B981', verified:true, level:'Professional', rating:4.85, reviews:134, skills:['Technical Writing','AI Prompts','Documentation','WhitePapers'], jobs:198, price:75, responseTime:'< 3 hrs', availability:'Available', bio:'Technical writer and AI prompt engineer creating docs for SaaS and fintech companies.', location:'Tokyo, Japan', responseRate:95, completionRate:97, tags:['AI Expert','Rising Star'], joined:'2023-01-12', country:'Japan', earnings:45600, views:6320 },
  { id:'5', name:'Priya Patel', username:'@priyap', initials:'PP', color:'#F59E0B', verified:true, level:'Expert', rating:4.93, reviews:289, skills:['Social Media Strategy','Instagram Growth','Influencer Content','Reels'], jobs:354, price:40, responseTime:'< 1 hr', availability:'Available', bio:'Social media maven specializing in Instagram, TikTok, and LinkedIn growth hacking.', location:'Mumbai, India', responseRate:98, completionRate:97, tags:['Top Creator','Fast Responder','Trusted Creator'], joined:'2022-06-03', country:'India', earnings:78900, views:11430 },
  { id:'6', name:'Alex Rivera', username:'@alexrivera', initials:'AR', color:'#06B6D4', verified:false, level:'Starter', rating:4.72, reviews:67, skills:['Creative Writing','Fiction','Short Stories','Content Strategy'], jobs:89, price:30, responseTime:'< 4 hrs', availability:'Available', bio:'Creative writer and storyteller passionate about building brand narratives.', location:'Miami, FL', responseRate:92, completionRate:94, tags:['Rising Star'], joined:'2024-02-18', country:'United States', earnings:18400, views:3240 },
  { id:'7', name:'Emma Thompson', username:'@emmat', initials:'ET', color:'#8B5CF6', verified:true, level:'Elite', rating:4.98, reviews:412, skills:['PR Writing','Press Releases','Brand Voice','Corporate Communications'], jobs:530, price:85, responseTime:'< 1 hr', availability:'Available', bio:'Former PR director crafting narratives for global brands, IPOs, and product launches.', location:'London, UK', responseRate:100, completionRate:99, tags:['Top Creator','5-Star Creator','Trusted Creator','100+ Projects'], joined:'2021-09-01', country:'United Kingdom', earnings:134500, views:21000 },
  { id:'8', name:'Liam O\'Brien', username:'@liamob', initials:'LO', color:'#EC4899', verified:true, level:'Professional', rating:4.88, reviews:178, skills:['UX Writing','Product Copy','Microcopy','App Content'], jobs:243, price:60, responseTime:'< 2 hrs', availability:'Busy', bio:'UX writer bringing clarity and delight to digital products for top Silicon Valley startups.', location:'Dublin, Ireland', responseRate:96, completionRate:95, tags:['AI Expert','Fast Responder'], joined:'2022-12-05', country:'Ireland', earnings:56700, views:8900 },
];

export const services = [
  { id:'s1', title:'AI-Powered SEO Blog Articles', desc:'Fully researched, SEO-optimized blog articles that rank higher and convert readers.', creator:creators[0], category:'Blog Writing', tags:['SEO','Blog','AI-Enhanced'], rating:4.97, reviews:234, delivery:'2 days', packages:{ basic:{name:'Basic',price:45,delivery:'3 days',desc:'1000-word SEO article',revisions:2}, standard:{name:'Standard',price:95,delivery:'2 days',desc:'2000-word in-depth guide',revisions:3}, premium:{name:'Premium',price:180,delivery:'1 day',desc:'3500-word pillar + images',revisions:999} }, featured:true, queue:8 },
  { id:'s2', title:'Viral YouTube Video Scripts', desc:'Hook-driven, retention-optimized scripts that make viewers stay, engage, and subscribe.', creator:creators[1], category:'Video Scripts', tags:['YouTube','Script','Viral'], rating:4.91, reviews:156, delivery:'1 day', packages:{ basic:{name:'Basic',price:65,delivery:'2 days',desc:'5-min script',revisions:2}, standard:{name:'Standard',price:120,delivery:'1 day',desc:'10-min script + B-roll notes',revisions:3}, premium:{name:'Premium',price:220,delivery:'1 day',desc:'20-min script + thumbnail',revisions:999} }, featured:true, queue:3 },
  { id:'s3', title:'High-Converting Email Sequences', desc:'Automated email sequences that nurture leads and drive sales. Average 48% open rates.', creator:creators[2], category:'Email Marketing', tags:['Email','Automation','Conversion'], rating:4.99, reviews:389, delivery:'3 days', packages:{ basic:{name:'Basic',price:55,delivery:'4 days',desc:'3-email welcome sequence',revisions:2}, standard:{name:'Standard',price:140,delivery:'3 days',desc:'7-email nurture sequence',revisions:3}, premium:{name:'Premium',price:280,delivery:'2 days',desc:'14-email funnel + variants',revisions:999} }, featured:true, queue:12 },
  { id:'s4', title:'Social Media Content Calendar', desc:'30-day social strategy with posts, captions, and hashtag sets for all platforms.', creator:creators[4], category:'Social Media', tags:['Social','Instagram','LinkedIn'], rating:4.93, reviews:201, delivery:'4 days', packages:{ basic:{name:'Basic',price:40,delivery:'5 days',desc:'15 posts, 1 platform',revisions:2}, standard:{name:'Standard',price:90,delivery:'4 days',desc:'30 posts, 2 platforms',revisions:3}, premium:{name:'Premium',price:170,delivery:'3 days',desc:'60 posts, 3 platforms + Canva',revisions:999} }, featured:false, queue:5 },
  { id:'s5', title:'Technical Documentation & API Docs', desc:'Clear, developer-friendly documentation that developers actually want to read.', creator:creators[3], category:'Technical Writing', tags:['Technical','API Docs','SaaS'], rating:4.85, reviews:98, delivery:'5 days', packages:{ basic:{name:'Basic',price:75,delivery:'7 days',desc:'Basic API reference',revisions:2}, standard:{name:'Standard',price:160,delivery:'5 days',desc:'Full API docs + quickstart',revisions:3}, premium:{name:'Premium',price:350,delivery:'3 days',desc:'Complete developer portal',revisions:999} }, featured:false, queue:2 },
  { id:'s6', title:'PR Press Releases & Media Kits', desc:'Newsroom-ready press releases that get you featured in top publications.', creator:creators[6], category:'PR & Communications', tags:['PR','Press Release','Media'], rating:4.98, reviews:312, delivery:'1 day', packages:{ basic:{name:'Basic',price:85,delivery:'2 days',desc:'Single press release',revisions:2}, standard:{name:'Standard',price:200,delivery:'1 day',desc:'3 press releases + list',revisions:3}, premium:{name:'Premium',price:450,delivery:'1 day',desc:'Full media kit + 5 releases',revisions:999} }, featured:true, queue:6 },
];

export const categories = [
  { id:'c1', name:'Blog & Articles', icon:'📝', count:2840, color:'#8B5CF6' },
  { id:'c2', name:'Social Media', icon:'📱', count:1920, color:'#EC4899' },
  { id:'c3', name:'Video & Scripts', icon:'🎬', count:1540, color:'#3B82F6' },
  { id:'c4', name:'Email Marketing', icon:'📧', count:1180, color:'#10B981' },
  { id:'c5', name:'SEO Content', icon:'🔍', count:980, color:'#F59E0B' },
  { id:'c6', name:'Ad Copywriting', icon:'📣', count:860, color:'#06B6D4' },
  { id:'c7', name:'Technical Writing', icon:'⚙️', count:720, color:'#8B5CF6' },
  { id:'c8', name:'AI Prompts', icon:'🤖', count:640, color:'#EC4899' },
  { id:'c9', name:'PR & Media', icon:'📰', count:540, color:'#3B82F6' },
  { id:'c10', name:'UX Writing', icon:'✏️', count:480, color:'#10B981' },
  { id:'c11', name:'E-commerce', icon:'🛍️', count:760, color:'#F59E0B' },
  { id:'c12', name:'Translations', icon:'🌐', count:620, color:'#06B6D4' },
];

export const testimonials = [
  { id:'t1', name:'David Park', role:'CMO at TechFlow Inc.', initials:'DP', color:'#8B5CF6', rating:5, text:'SynapseAI completely transformed our content pipeline. We cut production time by 70% while tripling our output. The AI matching system found us the perfect creator instantly.', result:'3x content output' },
  { id:'t2', name:'Rachel Kim', role:'Founder at GrowthLoop', initials:'RK', color:'#EC4899', rating:5, text:'The AI Studio tools are incredible. I generated a full email sequence, blog series, and social calendar in 2 hours. Then refined it with a creator. Phenomenal results.', result:'48% email open rate' },
  { id:'t3', name:'James Mitchell', role:'Head of Content at ScaleUp', initials:'JM', color:'#3B82F6', rating:5, text:'Finally a platform combining AI tools AND real creators seamlessly. We use AI for first drafts and creators for refinement. It\'s a perfect creative workflow.', result:'50K YouTube subscribers' },
  { id:'t4', name:'Aisha Williams', role:'Brand Director at Luminary', initials:'AW', color:'#10B981', rating:5, text:'Creator vetting on SynapseAI is unmatched. Every creator I\'ve hired has been exceptional. Projects are organized and deliveries always on time.', result:'Featured in Forbes' },
  { id:'t5', name:'Carlos Mendez', role:'CEO at Prism Digital', initials:'CM', color:'#F59E0B', rating:5, text:'We\'ve tried every content platform. SynapseAI is the only one that uses AI intelligently. The creator match feature alone saves us 10 hours per week.', result:'10 hrs saved/week' },
];

export const notifications = [
  { id:'n1', type:'message', icon:'💬', title:'New message from Aria Chen', text:'First draft is ready for review!', time:'2m', unread:true },
  { id:'n2', type:'order', icon:'📦', title:'Order #4821 delivered', text:'Sofia Martinez delivered your email sequence', time:'1h', unread:true },
  { id:'n3', type:'payment', icon:'💳', title:'Payment confirmed', text:'$180 for Premium SEO Package processed', time:'3h', unread:true },
  { id:'n4', type:'review', icon:'⭐', title:'New 5-star review received', text:'David Park left you a 5-star review', time:'5h', unread:false },
  { id:'n5', type:'ai', icon:'🤖', title:'AI generation complete', text:'5 blog drafts ready in AI Studio', time:'1d', unread:false },
  { id:'n6', type:'system', icon:'✅', title:'Profile verified', text:'Your profile is now a Trusted Creator', time:'2d', unread:false },
  { id:'n7', type:'project', icon:'🎯', title:'Milestone approved', text:'Client approved Milestone 2 — Q4 Strategy', time:'2d', unread:false },
];

export const messages = [
  { id:'m1', user:{ name:'Aria Chen', initials:'AC', color:'#8B5CF6', online:true }, lastMsg:'First draft is ready! Check it out 🎉', time:'2m', unread:2, chat:[
    { from:'them', text:'Hi! I\'ve reviewed your project brief and I\'m excited to get started.', time:'10:20 AM' },
    { from:'me', text:'Great! Here\'s the brief and some reference articles.', time:'10:22 AM' },
    { from:'them', text:'Perfect. I\'ll have the first draft ready by tomorrow. Preferred tone?', time:'10:23 AM' },
    { from:'me', text:'Conversational but professional. Think HubSpot blog style.', time:'10:25 AM' },
    { from:'them', text:'First draft is ready! Check it out 🎉', time:'11:04 AM' },
  ]},
  { id:'m2', user:{ name:'Marcus Johnson', initials:'MJ', color:'#3B82F6', online:true }, lastMsg:'YouTube script ready for your review.', time:'1h', unread:0, chat:[
    { from:'them', text:'Checking in on the script revision. Any feedback?', time:'09:15 AM' },
    { from:'me', text:'Looking good! Can you punch up the hook?', time:'09:30 AM' },
    { from:'them', text:'Done! YouTube script ready for your review.', time:'10:00 AM' },
  ]},
  { id:'m3', user:{ name:'Sofia Martinez', initials:'SM', color:'#EC4899', online:false }, lastMsg:'Email sequence delivered. 7 emails, segmented.', time:'3h', unread:1, chat:[
    { from:'them', text:'Email sequence delivered. 7 emails, segmented by buyer persona.', time:'08:00 AM' },
  ]},
  { id:'m4', user:{ name:'Kenji Tanaka', initials:'KT', color:'#10B981', online:false }, lastMsg:'Sure, I can add webhook endpoint docs too.', time:'1d', unread:0, chat:[
    { from:'me', text:'Can you also cover the webhook endpoints?', time:'Yesterday' },
    { from:'them', text:'Sure, I can add webhook endpoint docs too. Give me a day.', time:'Yesterday' },
  ]},
];

export const orders = [
  { id:'ORD-4821', service:'AI-Powered SEO Blog Articles', creator:creators[0], pkg:'Premium', amount:180, date:'2026-10-05', status:'Delivered', due:'2026-10-07' },
  { id:'ORD-4756', service:'High-Converting Email Sequences', creator:creators[2], pkg:'Standard', amount:140, date:'2026-10-03', status:'Active', due:'2026-10-10' },
  { id:'ORD-4698', service:'Viral YouTube Video Scripts', creator:creators[1], pkg:'Standard', amount:120, date:'2026-09-28', status:'Completed', due:'2026-09-30' },
  { id:'ORD-4612', service:'Social Media Content Calendar', creator:creators[4], pkg:'Premium', amount:170, date:'2026-09-20', status:'Completed', due:'2026-09-25' },
  { id:'ORD-4540', service:'PR Press Releases', creator:creators[6], pkg:'Basic', amount:85, date:'2026-09-15', status:'Cancelled', due:'2026-09-17' },
  { id:'ORD-4490', service:'Technical Documentation', creator:creators[3], pkg:'Premium', amount:350, date:'2026-09-10', status:'Completed', due:'2026-09-16' },
];

export const projects = [
  { id:'p1', title:'Q4 Content Strategy Campaign', desc:'Comprehensive content campaign for Q4 2026.', status:'In Progress', progress:65, budget:2400, spent:1560, deadline:'2026-11-30', creator:creators[0], category:'Content Marketing',
    milestones:[
      { id:'m1', name:'Content Strategy Brief', amount:300, due:'2026-10-10', status:'Completed', progress:100 },
      { id:'m2', name:'Blog Series (10 articles)', amount:900, due:'2026-10-25', status:'In Progress', progress:60 },
      { id:'m3', name:'Email Sequence (7 emails)', amount:700, due:'2026-11-10', status:'Pending', progress:0 },
      { id:'m4', name:'Social Media Pack', amount:500, due:'2026-11-25', status:'Pending', progress:0 },
    ]},
  { id:'p2', title:'YouTube Channel Launch', desc:'Launch and grow a YouTube channel from 0 to 10K subscribers.', status:'Active', progress:35, budget:1800, spent:630, deadline:'2026-12-31', creator:creators[1], category:'Video Content',
    milestones:[
      { id:'m1', name:'Channel Strategy & Branding', amount:400, due:'2026-10-15', status:'Completed', progress:100 },
      { id:'m2', name:'First 5 Video Scripts', amount:600, due:'2026-11-01', status:'In Progress', progress:40 },
      { id:'m3', name:'SEO Optimization', amount:400, due:'2026-11-15', status:'Pending', progress:0 },
      { id:'m4', name:'Growth & Analytics Review', amount:400, due:'2026-12-15', status:'Pending', progress:0 },
    ]},
];

export const analytics = {
  earnings:[
    {month:'May',amount:3200},{month:'Jun',amount:4800},{month:'Jul',amount:4200},
    {month:'Aug',amount:6100},{month:'Sep',amount:5800},{month:'Oct',amount:7400},
  ],
  orders:[
    {month:'May',count:18},{month:'Jun',count:24},{month:'Jul',count:21},
    {month:'Aug',count:32},{month:'Sep',count:29},{month:'Oct',count:38},
  ],
  aiUsage:[
    {tool:'Blog Gen',uses:142},{tool:'Social Media',uses:98},{tool:'Email',uses:87},
    {tool:'SEO',uses:76},{tool:'Ad Copy',uses:65},{tool:'Rewriter',uses:54},
  ],
  weekly:[
    {day:'Mon',projects:4,msgs:12,earn:340},{day:'Tue',projects:6,msgs:18,earn:520},
    {day:'Wed',projects:3,msgs:8,earn:280},{day:'Thu',projects:8,msgs:24,earn:740},
    {day:'Fri',projects:5,msgs:15,earn:480},{day:'Sat',projects:2,msgs:6,earn:190},
    {day:'Sun',projects:1,msgs:4,earn:120},
  ],
};

export const aiTemplates = [
  { id:'at1', name:'SaaS Product Launch Blog', category:'Blog', uses:1842, rating:4.8, desc:'Complete blog template for launching a SaaS product with SEO optimization.' },
  { id:'at2', name:'Instagram Reels Caption Pack', category:'Social', uses:3241, rating:4.9, desc:'30 high-engagement captions for Instagram Reels in various niches.' },
  { id:'at3', name:'Abandoned Cart Email Sequence', category:'Email', uses:2103, rating:4.7, desc:'5-email sequence to recover abandoned cart users for e-commerce.' },
  { id:'at4', name:'YouTube Tutorial Script', category:'Video', uses:1567, rating:4.8, desc:'Structured script template for educational YouTube tutorials.' },
  { id:'at5', name:'LinkedIn Thought Leadership', category:'Social', uses:2890, rating:4.9, desc:'Framework for viral LinkedIn posts that establish authority.' },
  { id:'at6', name:'Product Description Optimizer', category:'E-commerce', uses:4120, rating:4.9, desc:'Convert bland product specs into compelling descriptions that sell.' },
  { id:'at7', name:'PR Press Release Template', category:'PR', uses:987, rating:4.6, desc:'Newsroom-ready press release structure for product announcements.' },
  { id:'at8', name:'Ad Copy A/B Testing Pack', category:'Ads', uses:1654, rating:4.7, desc:'10 ad copy variations for Facebook, Google, and LinkedIn.' },
];

export const platformStats = {
  creators:24800, services:68400, projects:312000, countries:142,
  satisfaction:98.4, avgDelivery:1.8,
};

export const aiTools = [
  { id:'blog', name:'Blog Generator', icon:'📝', desc:'Long-form SEO articles', color:'#8B5CF6', field:'Topic or keyword' },
  { id:'social', name:'Social Media', icon:'📱', desc:'Posts for all platforms', color:'#EC4899', field:'Product/brand/topic' },
  { id:'caption', name:'Caption Generator', icon:'✍️', desc:'Engaging captions', color:'#3B82F6', field:'Image or product description' },
  { id:'ad', name:'Ad Generator', icon:'📣', desc:'High-converting ad copy', color:'#F59E0B', field:'Product and target audience' },
  { id:'youtube', name:'YouTube Scripts', icon:'🎬', desc:'Retention-optimized scripts', color:'#EF4444', field:'Video topic and channel niche' },
  { id:'seo', name:'SEO Generator', icon:'🔍', desc:'Keyword-optimized content', color:'#10B981', field:'Target keyword and URL' },
  { id:'product', name:'Product Description', icon:'🛍️', desc:'Descriptions that sell', color:'#06B6D4', field:'Product name and features' },
  { id:'email', name:'Email Generator', icon:'📧', desc:'High-open-rate emails', color:'#8B5CF6', field:'Email purpose and audience' },
  { id:'story', name:'Story Generator', icon:'📖', desc:'Engaging narratives', color:'#EC4899', field:'Story premise and genre' },
  { id:'rewrite', name:'Content Rewriter', icon:'🔄', desc:'Fresh version of any text', color:'#3B82F6', field:'Paste your content here' },
  { id:'grammar', name:'Grammar Checker', icon:'✅', desc:'Fix grammar and style', color:'#10B981', field:'Paste text to check' },
  { id:'summary', name:'Summarizer', icon:'📋', desc:'Condense long content', color:'#F59E0B', field:'Paste content to summarize' },
  { id:'translate', name:'Translator', icon:'🌐', desc:'Translate to any language', color:'#06B6D4', field:'Text to translate' },
  { id:'tone', name:'Tone Changer', icon:'🎭', desc:'Match any brand voice', color:'#8B5CF6', field:'Paste content to restyle' },
  { id:'headline', name:'Headline Generator', icon:'💡', desc:'Click-worthy headlines', color:'#EC4899', field:'Article topic or angle' },
  { id:'hashtag', name:'Hashtag Generator', icon:'#️⃣', desc:'Trending hashtag sets', color:'#3B82F6', field:'Post topic and platform' },
  { id:'ideas', name:'Content Ideas', icon:'🚀', desc:'Endless content angles', color:'#F59E0B', field:'Your niche or industry' },
  { id:'pro', name:'Professional Writer', icon:'💼', desc:'Corporate, formal tone', color:'#10B981', field:'Topic and context' },
  { id:'creative', name:'Creative Writer', icon:'🎨', desc:'Imaginative, vivid writing', color:'#06B6D4', field:'Creative brief or concept' },
  { id:'simplify', name:'Simplifier', icon:'✨', desc:'Plain language rewrites', color:'#8B5CF6', field:'Complex text to simplify' },
];

export const badges = [
  { id:'b1', name:'Top Creator', icon:'🏆', color:'#F59E0B', desc:'Consistently in top 5% of creators' },
  { id:'b2', name:'Rising Star', icon:'⭐', color:'#3B82F6', desc:'Fastest growing creator this month' },
  { id:'b3', name:'Fast Responder', icon:'⚡', color:'#06B6D4', desc:'Responds within 1 hour 98% of the time' },
  { id:'b4', name:'5-Star Creator', icon:'🌟', color:'#F59E0B', desc:'Maintains 4.9+ rating across 50+ reviews' },
  { id:'b5', name:'AI Expert', icon:'🤖', color:'#8B5CF6', desc:'Certified in AI content creation' },
  { id:'b6', name:'Trusted Creator', icon:'🛡️', color:'#10B981', desc:'Verified identity and track record' },
  { id:'b7', name:'100+ Projects', icon:'🎯', color:'#EC4899', desc:'Successfully completed 100+ projects' },
];

export const levels = [
  { name:'Starter', color:'#6B7280', min:0, max:10, perks:['Basic marketplace access','Standard support'] },
  { name:'Professional', color:'#3B82F6', min:11, max:50, perks:['Priority listing','Advanced analytics','Custom packages'] },
  { name:'Expert', color:'#06B6D4', min:51, max:150, perks:['Featured placement','Dedicated manager','API access'] },
  { name:'Elite', color:'#F59E0B', min:151, max:9999, perks:['Top of search results','White-glove support','Revenue share bonus'] },
];
