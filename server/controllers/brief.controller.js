import { Brief } from '../models/Brief.js'
import { CreatorProfile } from '../models/CreatorProfile.js'
import { Submission } from '../models/Submission.js'
import { createBriefSchema, sendBriefSchema } from '../validators/brief.validator.js'

export async function createBrief(req, res, next) {
  try {
    const data = createBriefSchema.parse(req.body)

    const brief = await Brief.create({
      ...data,
      brandId: req.user._id,
      brandName: data.brandName || req.user.name,
      status: 'Published'
    })

    const json = brief.toJSON()
    return res.status(201).json({
      ...json,
      id: brief._id.toString(),
      brand: brief.brandName,
      type: brief.contentType,
      formats: brief.aspectRatio,
      tools: brief.requiredTools,
      deliverables: brief.assetCount
    })
  } catch (error) {
    next(error)
  }
}

export async function listBriefs(req, res, next) {
  try {
    const briefs = await Brief.find().sort({ createdAt: -1 })
    const items = briefs.map((b) => ({
      ...b.toJSON(),
      id: b._id.toString(),
      brand: b.brandName,
      type: b.contentType,
      formats: b.aspectRatio,
      tools: b.requiredTools,
      deliverables: b.assetCount
    }))
    return res.json({ items, total: items.length })
  } catch (error) {
    next(error)
  }
}

export async function getBriefById(req, res, next) {
  try {
    const { id } = req.params
    let brief = null
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brief = await Brief.findById(id)
    }
    if (!brief) {
      // Fallback for demo brief slugs or titles
      brief = await Brief.findOne({ title: new RegExp(id.replace(/-/g, ' '), 'i') })
    }
    if (!brief) {
      // Return first brief if in dev demo mode
      brief = await Brief.findOne()
    }
    if (!brief) {
      return res.status(404).json({ error: 'Brief not found' })
    }

    return res.json({
      ...brief.toJSON(),
      id: brief._id.toString(),
      brand: brief.brandName,
      type: brief.contentType,
      formats: brief.aspectRatio,
      tools: brief.requiredTools,
      deliverables: brief.assetCount
    })
  } catch (error) {
    next(error)
  }
}

export async function matchCreators(req, res, next) {
  try {
    const { id } = req.params

    let brief = null
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brief = await Brief.findById(id)
    }
    if (!brief) {
      brief = await Brief.findOne()
    }
    if (!brief) {
      return res.status(404).json({ error: 'Brief not found for matching' })
    }

    const requiredTools = brief.requiredTools || []
    const requiredAspects = brief.aspectRatio || ['16:9']
    const contentType = (brief.contentType || '').toLowerCase()

    // 1. Pre-filter in Mongo: Creators that are verified and open/limited availability
    const candidates = await CreatorProfile.find({
      $or: [
        { isVerified: true },
        { availability: { $in: ['Open', 'Limited', 'open', 'limited'] } }
      ]
    }).populate('userId', 'name email')

    // 2. Score each candidate in code out of 100:
    // - Specialization: 30
    // - Tools: 25
    // - Rights: 20
    // - Platform / Aspect ratio: 15
    // - Budget: 10
    const scored = candidates.map((creator) => {
      const creatorTools = (creator.tools || []).map((t) => (t.name || '').toLowerCase())
      const creatorFormats = (creator.formats || []).map((f) => f.toLowerCase())
      const creatorSpecialization = (creator.specialization || '').toLowerCase()

      // 1) Specialization score (max 30)
      let specializationScore = 15 // base match
      if (
        creatorSpecialization.includes(contentType) ||
        contentType.includes(creatorSpecialization) ||
        (contentType.includes('video') && creatorSpecialization.includes('video')) ||
        (contentType.includes('animation') && creatorSpecialization.includes('animation')) ||
        (contentType.includes('product') && creatorSpecialization.includes('product'))
      ) {
        specializationScore = 30
      } else if (creator.skills?.some((s) => contentType.includes(s.toLowerCase()))) {
        specializationScore = 24
      }

      // 2) Tools score (max 25)
      let toolsScore = 10
      let toolOverlapCount = 0
      if (requiredTools.length > 0) {
        toolOverlapCount = requiredTools.filter((reqTool) =>
          creatorTools.some((cTool) => cTool.includes(reqTool.toLowerCase()))
        ).length
        toolsScore = Math.min(25, Math.round((toolOverlapCount / requiredTools.length) * 25))
      } else {
        // Fallback for general AI video/image toolkit
        const commonTools = ['runway', 'kling', 'veo', 'sora', 'flux', 'midjourney']
        toolOverlapCount = creatorTools.filter((ct) => commonTools.includes(ct)).length
        toolsScore = Math.min(25, 12 + toolOverlapCount * 4)
      }

      // 3) Rights score (max 20)
      let rightsScore = 0
      const hasCommercial = creator.rights?.commercialUsage !== false
      const hasPaidAds = creator.rights?.paidAds !== false
      if (hasCommercial) rightsScore += 10
      if (hasPaidAds) rightsScore += 10

      // 4) Platform / Aspect Ratio score (max 15)
      let aspectScore = 5
      const aspectOverlap = requiredAspects.filter((aspect) =>
        creatorFormats.includes(aspect.toLowerCase())
      ).length
      if (aspectOverlap > 0) {
        aspectScore = Math.min(15, Math.round((aspectOverlap / requiredAspects.length) * 15))
      }

      // 5) Budget score (max 10)
      let budgetScore = 8
      if (creator.price && brief.budgetNum) {
        budgetScore = creator.price <= brief.budgetNum ? 10 : 6
      }

      const totalScore = Math.min(100, specializationScore + toolsScore + rightsScore + aspectScore + budgetScore)

      // Matched-criteria flags:
      const flags = {
        aiVideo: creatorSpecialization.includes('video') || creatorTools.some((t) => ['runway', 'veo', 'kling', 'sora'].includes(t)),
        tool: toolOverlapCount > 0,
        aspectRatio: aspectOverlap > 0,
        paidAds: hasPaidAds,
        commercialRights: hasCommercial
      }

      const formattedCreator = {
        ...creator.toJSON(),
        id: creator._id.toString(),
        name: creator.displayName,
        specialties: [creator.specialization, ...(creator.skills || [])],
        tools: (creator.tools || []).map((t) => t.name),
        verified: creator.isVerified
      }

      return {
        creator: formattedCreator,
        score: totalScore,
        breakdown: {
          specialization: specializationScore,
          tools: toolsScore,
          rights: rightsScore,
          aspectRatio: aspectScore,
          budget: budgetScore
        },
        flags
      }
    })

    // Sort descending by score and pick top 5
    scored.sort((a, b) => b.score - a.score)
    const top5 = scored.slice(0, 5)

    return res.json({
      briefId: brief._id.toString(),
      briefTitle: brief.title,
      matches: top5
    })
  } catch (error) {
    next(error)
  }
}

export async function sendBrief(req, res, next) {
  try {
    const { id } = req.params
    const { creatorId, notes } = sendBriefSchema.parse(req.body)

    let brief = null
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brief = await Brief.findById(id)
    }
    if (!brief) {
      brief = await Brief.findOne()
    }
    if (!brief) {
      return res.status(404).json({ error: 'Brief not found' })
    }

    let creator = null
    if (creatorId.match(/^[0-9a-fA-F]{24}$/)) {
      creator = await CreatorProfile.findById(creatorId)
    }
    if (!creator) {
      creator = await CreatorProfile.findOne({
        $or: [{ handle: creatorId }, { handle: `@${creatorId}` }]
      })
    }
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' })
    }

    const submission = await Submission.create({
      briefId: brief._id,
      creatorId: creator._id,
      brandId: req.user._id,
      status: 'sent',
      progress: 10,
      notes: notes || 'Brief invitation sent via Genra Match Engine.'
    })

    return res.status(201).json({
      message: `Brief invitation sent to ${creator.displayName} successfully.`,
      submission: {
        ...submission.toJSON(),
        id: submission._id.toString(),
        briefTitle: brief.title,
        creatorName: creator.displayName
      }
    })
  } catch (error) {
    next(error)
  }
}
