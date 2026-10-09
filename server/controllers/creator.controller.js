import { CreatorProfile } from '../models/CreatorProfile.js'

export async function listCreators(req, res, next) {
  try {
    const { q, specialization, tools, skills, rights, verifiedOnly, page = 1, limit = 50 } = req.query

    const filter = {}

    // 1. Text or keyword query search
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i')
      filter.$or = [
        { displayName: searchRegex },
        { headline: searchRegex },
        { bio: searchRegex },
        { specialization: searchRegex },
        { skills: searchRegex },
        { 'tools.name': searchRegex }
      ]
    }

    // 2. Specialization filter
    if (specialization) {
      filter.$or = filter.$or || []
      const specList = Array.isArray(specialization) ? specialization : specialization.split(',').filter(Boolean)
      if (specList.length > 0) {
        filter.specialization = { $in: specList.map((s) => new RegExp(`^${s.trim()}$`, 'i')) }
      }
    }

    // 3. Tools filter
    if (tools) {
      const toolList = Array.isArray(tools) ? tools : tools.split(',').filter(Boolean)
      if (toolList.length > 0) {
        filter['tools.name'] = { $in: toolList.map((t) => new RegExp(`^${t.trim()}$`, 'i')) }
      }
    }

    // 4. Skills filter
    if (skills) {
      const skillList = Array.isArray(skills) ? skills : skills.split(',').filter(Boolean)
      if (skillList.length > 0) {
        filter.skills = { $in: skillList.map((s) => new RegExp(`^${s.trim()}$`, 'i')) }
      }
    }

    // 5. Rights filter
    if (rights === 'commercial' || rights === 'true') {
      filter['rights.commercialUsage'] = true
    }

    // 6. Verified filter
    if (verifiedOnly === 'true' || verifiedOnly === true) {
      filter.isVerified = true
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 50)
    const skip = (pageNum - 1) * limitNum

    const [creators, total] = await Promise.all([
      CreatorProfile.find(filter)
        .populate('userId', 'name email role')
        .sort({ rating: -1, verificationScore: -1 })
        .skip(skip)
        .limit(limitNum),
      CreatorProfile.countDocuments(filter)
    ])

    const formatted = creators.map((c) => {
      const json = c.toJSON()
      return {
        ...json,
        id: c._id.toString(),
        name: c.displayName,
        specialties: [c.specialization, ...(c.skills || [])],
        tools: (c.tools || []).map((t) => t.name),
        verified: c.isVerified
      }
    })

    // Compute facets for filter counts
    const allProfiles = await CreatorProfile.find({}, 'tools skills specialization')
    const facets = { tools: {}, skills: {}, specializations: {} }
    allProfiles.forEach((p) => {
      p.tools?.forEach((t) => { facets.tools[t.name] = (facets.tools[t.name] || 0) + 1 })
      p.skills?.forEach((s) => { facets.skills[s] = (facets.skills[s] || 0) + 1 })
      if (p.specialization) facets.specializations[p.specialization] = (facets.specializations[p.specialization] || 0) + 1
    })

    return res.json({
      items: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      facets
    })
  } catch (error) {
    next(error)
  }
}

export async function getCreatorById(req, res, next) {
  try {
    const { id } = req.params

    let creator = null
    // Try find by MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      creator = await CreatorProfile.findById(id).populate('userId', 'name email role')
    }

    // If not found, try by handle or case-insensitive name
    if (!creator) {
      const slugName = id.replace(/-/g, ' ')
      creator = await CreatorProfile.findOne({
        $or: [
          { handle: id },
          { handle: `@${id}` },
          { displayName: new RegExp(`^${slugName}$`, 'i') }
        ]
      }).populate('userId', 'name email role')
    }

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' })
    }

    const json = creator.toJSON()
    const fullProfile = {
      ...json,
      id: creator._id.toString(),
      name: creator.displayName,
      specialties: [creator.specialization, ...(creator.skills || [])],
      tools: (creator.tools || []).map((t) => t.name),
      verified: creator.isVerified
    }

    return res.json(fullProfile)
  } catch (error) {
    next(error)
  }
}
