import { Submission } from '../models/Submission.js'
import { Brief } from '../models/Brief.js'

export async function getDashboardProjects(req, res, next) {
  try {
    // Submissions populated with brief and creator
    const submissions = await Submission.find()
      .populate('briefId', 'title deadline budget contentType')
      .populate('creatorId', 'displayName handle mark avatarUrl specialization')
      .sort({ updatedAt: -1 })

    const activeBriefs = []
    const applications = []
    const inProgress = []
    const completed = []

    submissions.forEach((sub) => {
      const briefTitle = sub.briefId?.title || 'Creative Campaign'
      const creatorName = sub.creatorId?.displayName || 'Verified Creator'
      const deadline = sub.briefId?.deadline || 'Dec 15, 2026'

      const item = {
        id: sub._id.toString(),
        name: briefTitle,
        creator: creatorName,
        status: sub.status,
        deadline,
        progress: sub.progress || 10,
        creatorMark: sub.creatorId?.mark || 'CR',
        specialization: sub.creatorId?.specialization || 'AI Video Ads'
      }

      if (sub.status === 'sent') {
        activeBriefs.push(item)
      } else if (sub.status === 'applied') {
        applications.push(item)
      } else if (sub.status === 'in_progress') {
        inProgress.push(item)
      } else if (sub.status === 'completed') {
        completed.push(item)
      }
    })

    // Also include briefs in activeBriefs if count is low
    if (activeBriefs.length < 2) {
      const extraBriefs = await Brief.find({ status: { $in: ['Published', 'published'] } }).limit(2)
      extraBriefs.forEach((b) => {
        activeBriefs.push({
          id: b._id.toString(),
          name: b.title,
          creator: 'Awaiting Match',
          status: 'Published',
          deadline: b.deadline || 'Nov 18, 2026',
          progress: 15,
          creatorMark: 'GN',
          specialization: b.contentType
        })
      })
    }

    return res.json({
      activeBriefs,
      applications,
      inProgress,
      completed
    })
  } catch (error) {
    next(error)
  }
}
