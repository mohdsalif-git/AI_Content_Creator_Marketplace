export type StudioTab = 'Create' | 'Image' | 'Video' | 'Motion' | 'Edit' | 'History'

export const studioModels = {
  create: ['Genra Vision', 'Genra Motion', 'Cinematic', 'Fast Render'],
  image: ['Genra Image', 'Flux', 'Nano Banana', 'Creative Model'],
  video: ['Genra Motion', 'Kling', 'Veo', 'Sora', 'Seedance'],
}

export const studioPresets = [
  { title: 'Cinematic Product', description: 'Tactile light, polished materials, a story in every frame.', gradient: 'linear-gradient(135deg,#e6e6ff,#8d77c8 52%,#d4f6f4)', prompt: 'A cinematic product film for a futuristic skincare brand, soft daylight, glass reflections, minimal luxury aesthetic.', style: 'Cinematic' },
  { title: 'Luxury Fashion', description: 'Editorial movement with a premium magazine point of view.', gradient: 'linear-gradient(135deg,#f3e2ea,#ca7c9a 50%,#f7d5a0)', prompt: 'Editorial luxury fashion campaign, cinematic lighting, soft shadows, premium magazine aesthetic, sculptural styling.', style: 'Fashion' },
  { title: 'Editorial Portrait', description: 'Quiet character, directional light, considered composition.', gradient: 'linear-gradient(135deg,#dceeff,#7795bd 55%,#f8e9d7)', prompt: 'An editorial portrait with directional window light, subtle texture, intimate framing, and art-book restraint.', style: 'Editorial' },
  { title: 'AI UGC', description: 'Native, human, and built for a fast-moving social feed.', gradient: 'linear-gradient(135deg,#e7fff5,#65c9b1 50%,#fff1cd)', prompt: 'A social-first product story that feels candid, warm, tactile, and human, made for a vertical feed.', style: 'Social' },
  { title: 'Futuristic', description: 'Speculative surfaces and a clean, cinematic atmosphere.', gradient: 'linear-gradient(135deg,#e9e6ff,#8a79d5 50%,#bfe8ff)', prompt: 'A futuristic visual system with luminous materials, atmospheric depth, and precise cinematic camera movement.', style: 'Surreal' },
  { title: 'Minimal Product', description: 'Less noise, more object. Designed for clarity and conversion.', gradient: 'linear-gradient(135deg,#f5f5f5,#c9d0d7 52%,#ffffff)', prompt: 'A minimal product still life with soft daylight, clean geometry, quiet shadows, and a premium studio finish.', style: 'Minimal' },
  { title: 'Surreal World', description: 'Impossible scale, dream logic, and a little strange.', gradient: 'linear-gradient(135deg,#eee4ff,#bc81db 48%,#ffd39d)', prompt: 'A surreal world where everyday objects float through a soft, dreamlike landscape with cinematic color.', style: 'Surreal' },
  { title: 'Social Ad', description: 'A sharp visual hook with a clear path to action.', gradient: 'linear-gradient(135deg,#ffe2d5,#f38167 48%,#ffd866)', prompt: 'A scroll-stopping social ad with a bold opening frame, product clarity, and a memorable visual hook.', style: 'Product' },
]

export const studioHistory = [
  { id: 'history-01', title: 'Cinematic Product', type: 'AI Video', prompt: 'Slow cinematic camera push toward the product while reflections move across the glass.', date: 'Today, 10:42', model: 'Genra Motion', status: 'Completed', gradient: studioPresets[0].gradient },
  { id: 'history-02', title: 'Soft hardware', type: 'AI Image', prompt: 'A luminous object study for a calm technology launch.', date: 'Yesterday', model: 'Genra Image', status: 'Completed', gradient: studioPresets[5].gradient },
  { id: 'history-03', title: 'Future skin', type: 'AI Motion', prompt: 'Bring a still product image to life with a slow orbit.', date: 'Oct 06, 2026', model: 'Genra Motion', status: 'Completed', gradient: studioPresets[4].gradient },
]

export const studioProjects = [
  { id: 'project-01', title: 'GlowSkin Campaign', type: 'AI Video', creator: 'Maya Chen', lastEdited: 'Today', status: 'Draft', gradient: studioPresets[0].gradient },
  { id: 'project-02', title: 'Aster Morning Ritual', type: 'AI Image', creator: 'Mara Lennox', lastEdited: 'Yesterday', status: 'Ready for brief', gradient: studioPresets[5].gradient },
  { id: 'project-03', title: 'Motion with a pulse', type: 'AI Motion', creator: 'Kenji Park', lastEdited: 'Oct 04, 2026', status: 'In collaboration', gradient: studioPresets[4].gradient },
]
