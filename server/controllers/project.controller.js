import { Project } from '../models/Project.js'

export async function listProjects(req, res, next) {
  try {
    const { status, q } = req.query
    const filter = {}

    if (status) {
      filter.status = status
    }

    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brandName: searchRegex },
        { tags: searchRegex }
      ]
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .populate('brandId', 'name email')

    const items = projects.map((p) => ({
      ...p.toJSON(),
      id: p._id.toString()
    }))

    return res.json({
      items,
      total: items.length
    })
  } catch (error) {
    next(error)
  }
}

export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params
    let project = null

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id).populate('brandId', 'name email')
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    return res.json({
      ...project.toJSON(),
      id: project._id.toString()
    })
  } catch (error) {
    next(error)
  }
}
