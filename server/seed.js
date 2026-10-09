import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { User } from './models/User.js'
import { CreatorProfile } from './models/CreatorProfile.js'
import { Project } from './models/Project.js'
import { Brief } from './models/Brief.js'
import { Submission } from './models/Submission.js'
import { PasswordReset } from './models/PasswordReset.js'
import { RefreshToken } from './models/RefreshToken.js'
import { GenerationJob } from './models/GenerationJob.js'
import { Conversation } from './models/Conversation.js'
import { Message } from './models/Message.js'
import { hashPassword } from './utils/argon2.js'
import { WORKFLOW_STEPS } from './constants/index.js'

dotenv.config()

export async function seedDatabase() {
  console.log('[Seed] Starting database seed...')
  await connectDB()

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    CreatorProfile.deleteMany({}),
    Project.deleteMany({}),
    Brief.deleteMany({}),
    Submission.deleteMany({}),
    PasswordReset.deleteMany({}),
    RefreshToken.deleteMany({}),
    GenerationJob.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({})
  ])
  console.log('[Seed] Cleared existing data across all collections.')

  // 2. Hash standard demo passwords
  const defaultPasswordHash = await hashPassword('Demo@12345')
  const genraPasswordHash = await hashPassword('Genra123')

  // 3. Create 5 Brand Users
  const brandUsersData = [
    { email: 'brand1@genra.demo', name: 'Apex Brands Studio', role: 'brand' },
    { email: 'brand2@genra.demo', name: 'Lumina Labs', role: 'brand' },
    { email: 'brand3@genra.demo', name: 'Nova Apparel', role: 'brand' },
    { email: 'brand4@genra.demo', name: 'Vanta Creative Records', role: 'brand' },
    { email: 'brand5@genra.demo', name: 'Solstice Media', role: 'brand' }
  ]

  const brandUsers = await User.create(
    brandUsersData.map((b) => ({
      ...b,
      passwordHash: defaultPasswordHash
    }))
  )
  console.log(`[Seed] Created ${brandUsers.length} brand users.`)

  // Also create legacy test users for seamless test compatibility
  const legacyUsers = await User.create([
    {
      name: 'Aster & Co. Demo Brand',
      email: 'demo@genra.ai',
      passwordHash: genraPasswordHash,
      role: 'both'
    },
    {
      name: 'Test User',
      email: 'testuser@genra.ai',
      passwordHash: genraPasswordHash,
      role: 'both'
    }
  ])

  // 4. Create 5 Creator Users & Profiles
  const creatorSeeds = [
    {
      email: 'creator1@genra.demo',
      name: 'Mara Lennox',
      handle: '@maralennox',
      mark: 'ML',
      headline: 'Cinematic product worlds for brands with a point of view.',
      specialization: 'AI Video Ads',
      bio: 'I build tactile, high-contrast narratives that make impossible products feel inevitable. My process sits between art direction, motion design, and generative film.',
      location: 'London · GMT',
      rating: 4.98,
      price: 2400,
      availability: 'Open',
      color: '#b08cff',
      isVerified: true,
      verificationScore: 97,
      tools: [
        { name: 'Runway', verified: true },
        { name: 'Veo', verified: true },
        { name: 'ComfyUI', verified: true },
        { name: 'After Effects', verified: true }
      ],
      skills: ['Video Editing', 'Prompt Engineering', 'Product Visualization', 'Storytelling'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'The object, reimagined',
          contentType: 'AI Video Ads',
          imageUrl: '',
          toolsUsed: ['Runway', 'Veo', 'ComfyUI'],
          rights: 'Commercial · Paid Social & Web',
          platform: 'Instagram / YouTube',
          aspectRatio: '16:9',
          year: '2025',
          gradient: 'linear-gradient(135deg, #181926 0%, #2f334d 100%)'
        },
        {
          title: 'Soft hardware',
          contentType: 'AI Video Ads',
          imageUrl: '',
          toolsUsed: ['Runway', 'After Effects'],
          rights: 'Commercial · Paid Ads',
          platform: 'TikTok / Reels',
          aspectRatio: '9:16',
          year: '2025',
          gradient: 'linear-gradient(135deg, #2a1b4e 0%, #683bb5 100%)'
        }
      ],
      stats: { projects: 46, repeat: 82, turnaround: '5–7 days' },
      formats: ['16:9', '9:16', '1:1']
    },
    {
      email: 'creator2@genra.demo',
      name: 'Kenji Park',
      handle: '@kenjipark',
      mark: 'KP',
      headline: 'Surreal motion systems for fashion, culture, and music.',
      specialization: 'AI Animation',
      bio: 'My work turns movement into identity. I use procedural systems, image models, and sound to create visuals that feel discovered rather than designed.',
      location: 'Seoul · GMT+9',
      rating: 4.94,
      price: 1800,
      availability: 'Limited',
      color: '#5eead4',
      isVerified: true,
      verificationScore: 91,
      tools: [
        { name: 'Kling', verified: true },
        { name: 'Sora', verified: true },
        { name: 'Suno', verified: true },
        { name: 'Topaz', verified: true }
      ],
      skills: ['Motion Systems', 'Video Editing', 'Sound Design', 'Storytelling'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: true },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Afterimage studies',
          contentType: 'AI Animation',
          imageUrl: '',
          toolsUsed: ['Kling', 'Suno'],
          rights: 'Commercial · Global',
          platform: 'YouTube / Concert Visuals',
          aspectRatio: '16:9',
          year: '2025',
          gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
        }
      ],
      stats: { projects: 38, repeat: 78, turnaround: '4–6 days' },
      formats: ['16:9', '1:1']
    },
    {
      email: 'creator3@genra.demo',
      name: 'Elena Rostova',
      handle: '@elenarostova',
      mark: 'ER',
      headline: 'Hyper-editorial brand imagery and tactile product stills.',
      specialization: 'AI Product Images',
      bio: 'Focusing on photorealistic luxury stills, lighting fidelity, and prompt consistency across global campaigns.',
      location: 'Berlin · CET',
      rating: 4.96,
      price: 2100,
      availability: 'Open',
      color: '#f43f5e',
      isVerified: true,
      verificationScore: 94,
      tools: [
        { name: 'Midjourney', verified: true },
        { name: 'Flux', verified: true },
        { name: 'ComfyUI', verified: true }
      ],
      skills: ['Prompt Engineering', 'Product Visualization', 'Art Direction'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Vesper Chronometer',
          contentType: 'AI Product Images',
          imageUrl: '',
          toolsUsed: ['Flux', 'ComfyUI'],
          rights: 'Commercial',
          platform: 'Web & Print',
          aspectRatio: '1:1',
          year: '2025',
          gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
        }
      ],
      stats: { projects: 52, repeat: 89, turnaround: '2–4 days' },
      formats: ['1:1', '16:9']
    },
    {
      email: 'creator4@genra.demo',
      name: 'Rhea Okafor',
      handle: '@rheaokafor',
      mark: 'RO',
      headline: 'High-converting social UGC avatars and creator campaigns.',
      specialization: 'AI UGC',
      bio: 'Authentic creator personas and AI UGC formats that scale performance marketing across TikTok and Meta.',
      location: 'Lagos · WAT',
      rating: 4.91,
      price: 1500,
      availability: 'Open',
      color: '#f59e0b',
      isVerified: true,
      verificationScore: 89,
      tools: [
        { name: 'Runway', verified: true },
        { name: 'ElevenLabs', verified: true },
        { name: 'ChatGPT', verified: true }
      ],
      skills: ['Prompt Engineering', 'Storytelling', 'Video Editing'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Glow Serum Organic Social',
          contentType: 'AI UGC',
          imageUrl: '',
          toolsUsed: ['Runway', 'ElevenLabs'],
          rights: 'Commercial · Paid Social',
          platform: 'TikTok / Instagram Reels',
          aspectRatio: '9:16',
          year: '2025',
          gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)'
        }
      ],
      stats: { projects: 64, repeat: 85, turnaround: '1–3 days' },
      formats: ['9:16']
    },
    {
      email: 'creator5@genra.demo',
      name: 'Adrien Sol',
      handle: '@adriensol',
      mark: 'AS',
      headline: 'Generative brand identities, style guides, and design systems.',
      specialization: 'AI Branding',
      bio: 'Bridging high-end brand design with generative consistency matrices for future-facing tech and consumer brands.',
      location: 'Paris · CET',
      rating: 4.99,
      price: 3200,
      availability: 'Limited',
      color: '#3b82f6',
      isVerified: true,
      verificationScore: 98,
      tools: [
        { name: 'Midjourney', verified: true },
        { name: 'Flux', verified: true },
        { name: 'Blender', verified: true }
      ],
      skills: ['Art Direction', 'Motion Systems', 'Prompt Engineering'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: true },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Aura Protocol Identity',
          contentType: 'AI Branding',
          imageUrl: '',
          toolsUsed: ['Flux', 'Blender'],
          rights: 'Exclusive Commercial',
          platform: 'Identity & Web',
          aspectRatio: '16:9',
          year: '2025',
          gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)'
        }
      ],
      stats: { projects: 31, repeat: 94, turnaround: '7–10 days' },
      formats: ['16:9', '1:1']
    }
  ]

  const createdCreators = []
  for (const s of creatorSeeds) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      passwordHash: defaultPasswordHash,
      role: 'creator'
    })

    const profile = await CreatorProfile.create({
      userId: user._id,
      displayName: s.name,
      handle: s.handle,
      mark: s.mark,
      headline: s.headline,
      specialization: s.specialization,
      bio: s.bio,
      location: s.location,
      rating: s.rating,
      price: s.price,
      availability: s.availability,
      color: s.color,
      isVerified: s.isVerified,
      verificationScore: s.verificationScore,
      tools: s.tools,
      skills: s.skills,
      rights: s.rights,
      workflow: s.workflow,
      portfolio: s.portfolio,
      formats: s.formats,
      stats: s.stats
    })

    createdCreators.push({ user, profile })
  }
  console.log(`[Seed] Created ${createdCreators.length} creator users and profiles.`)

  // 5. Create Projects (Public & Associated)
  const projectsData = [
    {
      title: 'Solstice Autonomous Vehicle Teaser',
      brand: 'Solstice Mobility',
      category: 'AI Video Ads',
      tag: 'Autonomous',
      year: '2025',
      duration: '0:45',
      aspectRatio: '16:9',
      tools: ['Runway', 'Veo', 'ComfyUI'],
      rights: 'Commercial · Global broadcast & paid media',
      description: 'Speculative reveal film for next-gen electric vehicle.',
      gradient: 'linear-gradient(135deg, #181926 0%, #2f334d 100%)',
      featured: true,
      status: 'completed',
      creatorId: createdCreators[0].profile._id
    },
    {
      title: 'Vesper High-Jewelry Campaign',
      brand: 'Maison Vesper',
      category: 'AI Product Images',
      tag: 'Luxury',
      year: '2025',
      duration: 'Stills',
      aspectRatio: '1:1',
      tools: ['Midjourney', 'Flux', 'ComfyUI'],
      rights: 'Commercial · Print, OOH, Digital',
      description: 'Diamond caustics and macroscopic jewelry imagery.',
      gradient: 'linear-gradient(135deg, #09203f 0%, #537895 100%)',
      featured: true,
      status: 'completed',
      creatorId: createdCreators[2].profile._id
    },
    {
      title: 'Kinetica Sound Architecture',
      brand: 'Kinetica Audio',
      category: 'AI Animation',
      tag: 'Audio',
      year: '2025',
      duration: '1:12',
      aspectRatio: '16:9',
      tools: ['Kling', 'Sora', 'Topaz'],
      rights: 'Commercial · Live performance & online',
      description: 'Generative frequency visualizer for flagship spatial headphones.',
      gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      featured: true,
      status: 'open',
      creatorId: createdCreators[1].profile._id
    },
    {
      title: 'Terra Hydro Performance UGC Series',
      brand: 'Terra Health',
      category: 'AI UGC',
      tag: 'UGC',
      year: '2025',
      duration: '0:30',
      aspectRatio: '9:16',
      tools: ['Runway', 'ElevenLabs', 'ChatGPT'],
      rights: 'Commercial · Paid Meta & TikTok',
      description: '6 viral hook variants for electrolyte drink launch.',
      gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
      featured: false,
      status: 'in_progress',
      creatorId: createdCreators[3].profile._id
    },
    {
      title: 'Synthetix Brand Architecture System',
      brand: 'Synthetix Robotics',
      category: 'AI Branding',
      tag: 'System',
      year: '2025',
      duration: 'Guidebook',
      aspectRatio: '16:9',
      tools: ['Midjourney', 'Flux', 'Blender'],
      rights: 'Exclusive Commercial',
      description: 'Complete visual identity including typography and logo motion.',
      gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
      featured: false,
      status: 'open',
      creatorId: createdCreators[4].profile._id
    }
  ]

  const createdProjects = await Project.insertMany(projectsData)
  console.log(`[Seed] Created ${createdProjects.length} projects.`)

  // 6. Create Briefs
  const briefsData = [
    {
      title: 'Kinetic Footwear Launch · 3D AI Motion Teaser',
      brandName: 'Aethel Footwear',
      brandId: brandUsers[0]._id,
      contentType: 'AI Video Ads',
      assetCount: 4,
      budget: '$4k – $6k',
      budgetNum: 5000,
      deadline: 'Nov 12, 2026',
      description: 'Looking for a creator to deliver four high-velocity motion vignettes highlighting our lightweight cushioning system.',
      status: 'Published'
    },
    {
      title: 'Botanical Fragrance World · Surreal Macro Stills',
      brandName: 'Oceane Parfums',
      brandId: brandUsers[1]._id,
      contentType: 'AI Product Images',
      assetCount: 8,
      budget: '$2.5k – $4k',
      budgetNum: 3200,
      deadline: 'Nov 20, 2026',
      description: 'High-res hyper-tactile imagery capturing dew, raw glass, and floral blooms in extreme macro detail.',
      status: 'In review'
    },
    {
      title: 'Desk Objects of the Near Future · Video Ad Series',
      brandName: 'Monolith Hardware',
      brandId: brandUsers[2]._id,
      contentType: 'AI Video Ads',
      assetCount: 6,
      budget: '$3k – $5k',
      budgetNum: 4000,
      deadline: 'Oct 29, 2026',
      description: 'A set of short product films giving desk objects an elevated, collectible presence.',
      status: 'Awarded'
    }
  ]

  const createdBriefs = await Brief.insertMany(briefsData)
  console.log(`[Seed] Created ${createdBriefs.length} briefs.`)

  // 7. Create Submissions
  await Submission.create([
    {
      briefId: createdBriefs[0]._id,
      creatorId: createdCreators[0].profile._id,
      brandId: brandUsers[0]._id,
      status: 'sent',
      progress: 25,
      notes: 'Initial invitation sent'
    },
    {
      briefId: createdBriefs[1]._id,
      creatorId: createdCreators[1].profile._id,
      brandId: brandUsers[1]._id,
      status: 'applied',
      progress: 40,
      notes: 'Creator submitted application with treatment board'
    },
    {
      briefId: createdBriefs[0]._id,
      creatorId: createdCreators[3].profile._id,
      brandId: brandUsers[0]._id,
      status: 'in_progress',
      progress: 70,
      notes: 'Generation pass underway'
    },
    {
      briefId: createdBriefs[2]._id,
      creatorId: createdCreators[4].profile._id,
      brandId: brandUsers[2]._id,
      status: 'completed',
      progress: 100,
      notes: 'All 6 deliverables packaged with commercial rights'
    }
  ])
  console.log('[Seed] Created dashboard submissions.')

  // 8. Create Conversations & Messages
  const conversation1 = await Conversation.create({
    participants: [brandUsers[0]._id, createdCreators[0].user._id],
    lastMessage: 'The first motion cut looks breathtaking! Can we try 9:16 for Reels?',
    lastMessageAt: new Date()
  })

  await Message.create([
    {
      conversationId: conversation1._id,
      senderId: brandUsers[0]._id,
      content: 'Hi Mara, excited to work with you on the footwear launch.'
    },
    {
      conversationId: conversation1._id,
      senderId: createdCreators[0].user._id,
      content: 'Thanks! I have uploaded the first cinematic storyboard pass for your review.'
    },
    {
      conversationId: conversation1._id,
      senderId: brandUsers[0]._id,
      content: 'The first motion cut looks breathtaking! Can we try 9:16 for Reels?'
    }
  ])

  const conversation2 = await Conversation.create({
    participants: [brandUsers[1]._id, createdCreators[2].user._id],
    lastMessage: 'Macro lighting is locked. Rendering 4k plates now.',
    lastMessageAt: new Date()
  })

  await Message.create([
    {
      conversationId: conversation2._id,
      senderId: brandUsers[1]._id,
      content: 'Hello Elena, let us confirm the fragrance bottle glass caustics.'
    },
    {
      conversationId: conversation2._id,
      senderId: createdCreators[2].user._id,
      content: 'Macro lighting is locked. Rendering 4k plates now.'
    }
  ])
  console.log('[Seed] Created conversations and messages.')

  // 9. Create GenerationJobs
  await GenerationJob.create([
    {
      userId: brandUsers[0]._id,
      type: 'image',
      prompt: 'Futuristic glass bottle with glowing amber liquid, studio cinematic lighting',
      aspectRatio: '16:9',
      style: 'Cinematic',
      status: 'completed',
      resultUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      provider: 'seedream'
    },
    {
      userId: brandUsers[0]._id,
      type: 'video',
      prompt: 'Liquid mercury droplet floating in zero gravity, morphing into metallic spheres',
      aspectRatio: '16:9',
      duration: 5,
      status: 'completed',
      resultUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      provider: 'seedance'
    },
    {
      userId: brandUsers[1]._id,
      type: 'image',
      prompt: 'Minimalist brutalist architecture against sunset sky, ultra sharp, 8k',
      aspectRatio: '1:1',
      style: 'Photorealistic',
      status: 'processing',
      provider: 'seedream'
    }
  ])
  console.log('[Seed] Created sample generation jobs.')

  // 10. Query data back from Atlas/Mongo and print counts per collection
  const counts = {
    users: await User.countDocuments(),
    creatorProfiles: await CreatorProfile.countDocuments(),
    projects: await Project.countDocuments(),
    briefs: await Brief.countDocuments(),
    submissions: await Submission.countDocuments(),
    conversations: await Conversation.countDocuments(),
    messages: await Message.countDocuments(),
    generationJobs: await GenerationJob.countDocuments()
  }

  console.log('\n======================================================')
  console.log('       DATABASE VERIFICATION - COLLECTION COUNTS       ')
  console.log('======================================================')
  console.table(counts)
  console.log('Seeding successfully completed and verified in database.\n')

  return counts
}

// If run directly via node
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
    .catch(async (err) => {
      console.error('[Seed] Error during seeding:', err)
      await mongoose.disconnect()
      process.exit(1)
    })
}
