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
    RefreshToken.deleteMany({})
  ])
  console.log('[Seed] Cleared existing data.')

  // 2. Hash standard demo password
  const defaultPasswordHash = await hashPassword('Genra123')

  // 3. Create demo brand / client user
  const demoBrandUser = await User.create({
    name: 'Aster & Co. Brand Studio',
    email: 'demo@genra.ai',
    passwordHash: defaultPasswordHash,
    role: 'both'
  })

  const clientUser2 = await User.create({
    name: 'Vanta Records',
    email: 'creative@vanta.example',
    passwordHash: defaultPasswordHash,
    role: 'brand'
  })

  // 4. Create 6+ creator users & profiles covering all 5 specializations:
  // AI Video Ads, AI Product Images, AI UGC, AI Animation, AI Branding
  const creatorSeeds = [
    {
      name: 'Mara Lennox',
      email: 'mara@genra.ai',
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
        },
        {
          title: 'A quiet future',
          contentType: 'AI Product Images',
          imageUrl: '',
          toolsUsed: ['Kling', 'Flux'],
          rights: 'Commercial',
          platform: 'Web',
          aspectRatio: '1:1',
          year: '2024',
          gradient: 'linear-gradient(135deg, #09203f 0%, #537895 100%)'
        }
      ],
      stats: { projects: 46, repeat: 82, turnaround: '5–7 days' },
      formats: ['16:9', '9:16', '1:1']
    },
    {
      name: 'Kenji Park',
      email: 'kenji@genra.ai',
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
        },
        {
          title: 'Orbit / 02',
          contentType: 'AI Animation',
          imageUrl: '',
          toolsUsed: ['Sora', 'Topaz'],
          rights: 'Commercial',
          platform: 'Reels / Shorts',
          aspectRatio: '9:16',
          year: '2024',
          gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)'
        }
      ],
      stats: { projects: 39, repeat: 76, turnaround: '4–6 days' },
      formats: ['9:16', '16:9', '4:5']
    },
    {
      name: 'Joa Velásquez',
      email: 'joa@genra.ai',
      handle: '@joavfx',
      mark: 'JV',
      headline: 'Playful character animation with an editorial edge.',
      specialization: 'AI Animation',
      bio: 'I make character-led stories for people who want their brands to feel alive. Expect warm worlds, bold poses, and a process you can actually follow.',
      location: 'Mexico City · GMT-6',
      rating: 4.9,
      price: 1250,
      availability: 'Open',
      color: '#f2a65a',
      isVerified: true,
      verificationScore: 84,
      tools: [
        { name: 'Midjourney', verified: true },
        { name: 'Runway', verified: true },
        { name: 'ElevenLabs', verified: true },
        { name: 'Flux', verified: false }
      ],
      skills: ['Character Animation', 'Prompt Engineering', 'Storytelling'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Small acts of magic',
          contentType: 'AI Animation',
          imageUrl: '',
          toolsUsed: ['Midjourney', 'Runway'],
          rights: 'Commercial · Social',
          platform: 'Instagram',
          aspectRatio: '9:16',
          year: '2025',
          gradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)'
        }
      ],
      stats: { projects: 28, repeat: 68, turnaround: '3–5 days' },
      formats: ['9:16', '1:1', '4:5']
    },
    {
      name: 'Rhea Okafor',
      email: 'rhea@genra.ai',
      handle: '@rheaokafor',
      mark: 'RO',
      headline: 'High-gloss visual worlds, built for the scroll.',
      specialization: 'AI UGC',
      bio: 'I help premium products earn attention in the first frame. My workflow is fast, precise, and designed around modular content systems for social ads.',
      location: 'New York · EST',
      rating: 4.87,
      price: 980,
      availability: 'Open',
      color: '#ff8870',
      isVerified: true,
      verificationScore: 88,
      tools: [
        { name: 'Flux', verified: true },
        { name: 'Veo', verified: true },
        { name: 'Topaz', verified: true },
        { name: 'ChatGPT', verified: true }
      ],
      skills: ['Image Generation', 'Prompt Engineering', 'Video Editing'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Still moving',
          contentType: 'AI UGC',
          imageUrl: '',
          toolsUsed: ['Flux', 'Veo'],
          rights: 'Paid Ads · 12 Months',
          platform: 'TikTok / Reels',
          aspectRatio: '9:16',
          year: '2025',
          gradient: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)'
        }
      ],
      stats: { projects: 19, repeat: 61, turnaround: '2–4 days' },
      formats: ['9:16', '1:1']
    },
    {
      name: 'Adrien Sol',
      email: 'adrien@genra.ai',
      handle: '@adriensol',
      mark: 'AS',
      headline: 'Minimalist 3D, luminous materials, quiet confidence.',
      specialization: 'AI Product Images',
      bio: 'I create objects and spaces that hold attention without shouting. Best for product launches, identity systems, and artful explainers.',
      location: 'Paris · CET',
      rating: 4.99,
      price: 3200,
      availability: 'Booked',
      color: '#87b4ff',
      isVerified: true,
      verificationScore: 99,
      tools: [
        { name: 'Blender', verified: true },
        { name: 'ComfyUI', verified: true },
        { name: 'After Effects', verified: true },
        { name: 'Midjourney', verified: true }
      ],
      skills: ['Product Visualization', '3D Art Direction', 'Image Generation'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: true },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Form / function',
          contentType: 'AI Product Images',
          imageUrl: '',
          toolsUsed: ['Blender', 'ComfyUI'],
          rights: 'Commercial · Exclusive',
          platform: 'Web / Print / OOH',
          aspectRatio: '16:9',
          year: '2025',
          gradient: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)'
        }
      ],
      stats: { projects: 52, repeat: 89, turnaround: '7–10 days' },
      formats: ['16:9', '1:1', '21:9']
    },
    {
      name: 'Nina Ibarra',
      email: 'nina@genra.ai',
      handle: '@ninaibarra',
      mark: 'NI',
      headline: 'Human-scale stories from machine-made ingredients.',
      specialization: 'AI Branding',
      bio: 'I blend documentary sensibility with generative texture for brands that want to feel close, not polished flat.',
      location: 'Barcelona · CET',
      rating: 4.92,
      price: 1500,
      availability: 'Limited',
      color: '#ffd36a',
      isVerified: true,
      verificationScore: 88,
      tools: [
        { name: 'Runway', verified: true },
        { name: 'Sora', verified: true },
        { name: 'ElevenLabs', verified: true },
        { name: 'ChatGPT', verified: true }
      ],
      skills: ['Storytelling', 'Prompt Engineering', 'Art Direction'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Everyday futures',
          contentType: 'AI Branding',
          imageUrl: '',
          toolsUsed: ['Sora', 'Runway'],
          rights: 'Commercial · Global',
          platform: 'Brand Film / Web',
          aspectRatio: '16:9',
          year: '2025',
          gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
        }
      ],
      stats: { projects: 32, repeat: 71, turnaround: '4–6 days' },
      formats: ['16:9', '9:16', '4:5']
    },
    {
      name: 'Maya Chen',
      email: 'maya@genra.ai',
      handle: '@mayachen',
      mark: 'MC',
      headline: 'Precision photoreal product visualization and e-commerce campaigns.',
      specialization: 'AI Product Images',
      bio: 'High-end cosmetics and consumer tech visualization using multi-model LoRA pipelines and exacting lighting passes.',
      location: 'San Francisco · PST',
      rating: 4.95,
      price: 2100,
      availability: 'Open',
      color: '#c084fc',
      isVerified: true,
      verificationScore: 94,
      tools: [
        { name: 'Midjourney', verified: true },
        { name: 'Flux', verified: true },
        { name: 'ComfyUI', verified: true },
        { name: 'ChatGPT', verified: true }
      ],
      skills: ['Product Visualization', 'Image Generation', 'Prompt Engineering'],
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      workflow: WORKFLOW_STEPS,
      portfolio: [
        {
          title: 'Luminous skin series',
          contentType: 'AI Product Images',
          imageUrl: '',
          toolsUsed: ['Flux', 'ComfyUI'],
          rights: 'Commercial · Digital Ads',
          platform: 'Web / Social',
          aspectRatio: '1:1',
          year: '2025',
          gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
        }
      ],
      stats: { projects: 34, repeat: 79, turnaround: '3–5 days' },
      formats: ['1:1', '4:5', '16:9']
    }
  ]

  const createdCreators = []
  for (const seed of creatorSeeds) {
    const user = await User.create({
      name: seed.name,
      email: seed.email,
      passwordHash: defaultPasswordHash,
      role: 'creator'
    })

    const profile = await CreatorProfile.create({
      userId: user._id,
      displayName: seed.name,
      handle: seed.handle,
      mark: seed.mark,
      headline: seed.headline,
      specialization: seed.specialization,
      bio: seed.bio,
      location: seed.location,
      rating: seed.rating,
      price: seed.price,
      availability: seed.availability,
      color: seed.color,
      isVerified: seed.isVerified,
      verificationScore: seed.verificationScore,
      tools: seed.tools,
      skills: seed.skills,
      rights: seed.rights,
      workflow: seed.workflow,
      portfolio: seed.portfolio,
      formats: seed.formats,
      stats: seed.stats
    })
    createdCreators.push({ user, profile })
  }
  console.log(`[Seed] Created ${createdCreators.length} creators across 5 specializations.`)

  // 5. Create Public Projects (for GET /projects and GET /projects/:id)
  const projectsData = [
    {
      title: 'A New Kind of Morning',
      description: 'A 45-second launch film for a ritual-forward coffee system. Tactile, warm, and otherworldly.',
      budget: '$8,000 – $12,000',
      deadline: 'Nov 18, 2026',
      status: 'open',
      brandId: demoBrandUser._id,
      brandName: 'Aster & Co.',
      tags: ['AI Video Ads', 'Runway', '16:9']
    },
    {
      title: 'Motion with a Pulse',
      description: 'A modular world for an electronic record: reactive forms, black chrome, and high-energy motion design.',
      budget: '$5,000 – $8,000',
      deadline: 'Dec 03, 2026',
      status: 'in_progress',
      brandId: clientUser2._id,
      brandName: 'Vanta Records',
      tags: ['AI Animation', 'Kling', 'Suno']
    },
    {
      title: 'Objects of Attention',
      description: 'A set of three short product films that give ordinary desk objects an elevated, collectible presence.',
      budget: '$3,000 – $5,000',
      deadline: 'Oct 29, 2026',
      status: 'completed',
      brandId: demoBrandUser._id,
      brandName: 'Northline Studio',
      tags: ['AI Product Images', 'Blender', '1:1']
    },
    {
      title: 'Future Skin Modular Campaign',
      description: 'Series of 9:16 social UGC clips showcasing next-gen biotech skincare with verified creators.',
      budget: '$4,000 – $7,000',
      deadline: 'Jan 15, 2027',
      status: 'open',
      brandId: demoBrandUser._id,
      brandName: 'Aura Labs',
      tags: ['AI UGC', 'Flux', '9:16']
    }
  ]

  const createdProjects = await Project.insertMany(projectsData)
  console.log(`[Seed] Created ${createdProjects.length} public projects.`)

  // 6. Create Seed Briefs
  const briefsData = [
    {
      brandId: demoBrandUser._id,
      title: 'A new kind of morning',
      brandName: 'Aster & Co.',
      contentType: 'AI Video Ads',
      style: ['Cinematic', 'Minimal', 'Photoreal'],
      aspectRatio: ['16:9', '9:16'],
      platform: 'YouTube & Paid Social',
      usage: 'Commercial · Global',
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      requiredTools: ['Runway', 'Veo', 'ComfyUI'],
      assetCount: 4,
      budget: '$8k – $12k',
      budgetNum: 10000,
      deadline: 'Nov 18, 2026',
      description: 'A 45-second launch film for a ritual-forward coffee system. Tactile, warm, and otherworldly.',
      status: 'Published'
    },
    {
      brandId: clientUser2._id,
      title: 'Motion with a pulse',
      brandName: 'Vanta Records',
      contentType: 'AI Animation',
      style: ['Surreal', '3D glossy'],
      aspectRatio: ['16:9', '1:1', '9:16'],
      platform: 'Cross-platform',
      usage: 'Commercial · Global',
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: true },
      requiredTools: ['Kling', 'Sora', 'Suno'],
      assetCount: 8,
      budget: '$5k – $8k',
      budgetNum: 6500,
      deadline: 'Dec 03, 2026',
      description: 'A modular world for an electronic record: reactive forms, black chrome, and stage-ready systems.',
      status: 'In review'
    },
    {
      brandId: demoBrandUser._id,
      title: 'Objects of attention',
      brandName: 'Northline Studio',
      contentType: 'AI Product Images',
      style: ['Editorial', '3D glossy'],
      aspectRatio: ['1:1', '4:5'],
      platform: 'Web & Social',
      usage: 'Commercial · Digital',
      rights: { commercialUsage: true, paidAds: true, license12Months: true, exclusive: false },
      requiredTools: ['Blender', 'Flux'],
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

  // 7. Create Submissions for the 4 dashboard categories
  // (Active Briefs, Applications, In Progress, Completed)
  await Submission.create([
    {
      briefId: createdBriefs[0]._id,
      creatorId: createdCreators[0].profile._id, // Mara Lennox
      brandId: demoBrandUser._id,
      status: 'sent',
      progress: 25,
      notes: 'Initial invitation sent'
    },
    {
      briefId: createdBriefs[1]._id,
      creatorId: createdCreators[1].profile._id, // Kenji Park
      brandId: clientUser2._id,
      status: 'applied',
      progress: 40,
      notes: 'Creator submitted application with treatment board'
    },
    {
      briefId: createdBriefs[0]._id,
      creatorId: createdCreators[3].profile._id, // Rhea Okafor
      brandId: demoBrandUser._id,
      status: 'in_progress',
      progress: 70,
      notes: 'Generation pass underway'
    },
    {
      briefId: createdBriefs[2]._id,
      creatorId: createdCreators[4].profile._id, // Adrien Sol
      brandId: demoBrandUser._id,
      status: 'completed',
      progress: 100,
      notes: 'All 6 deliverables packaged with commercial rights'
    }
  ])
  console.log('[Seed] Created initial submissions for Dashboard.')

  console.log('[Seed] Database seeding completed successfully!')
}

// If run directly via node server/seed.js
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
