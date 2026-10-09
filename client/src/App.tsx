import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Compass,
  Cpu,
  Filter,
  Glasses,
  Layers3,
  Link2,
  Menu,
  MessageCircle,
  MoreHorizontal,
  MoveUpRight,
  Play,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import { gradientPosters, videoAssets } from './data/assets'
import Studio from './pages/Studio'
import NewHomePage from './pages/HomePage'
import AuthPages from './pages/AuthPages'
import { getUser, isAuthenticated, signOutDemoUser } from './auth'
import { api } from './services/api'

type Role = 'Brand' | 'Creator'
type Page = 'home' | 'creators' | 'profile' | 'newBrief' | 'briefs' | 'briefDetail' | 'dashboard' | 'studio' | 'signin' | 'signup' | 'forgot' | 'projects'

type Creator = {
  id: string
  name: string
  handle: string
  mark: string
  headline: string
  bio: string
  location: string
  specialties: string[]
  tools: string[]
  formats: string[]
  price: number
  rating: number
  verificationScore: number
  availability: 'Open' | 'Limited' | 'Booked'
  color: string
  verified: boolean
  portfolio: { title: string; type?: string; contentType?: string; gradient?: string; tools?: string[]; toolsUsed?: string[]; year?: string }[]
  stats: { projects: number; repeat: number; turnaround: string }
  specialization?: string
  workflow?: string[]
  rights?: { commercialUsage?: boolean; paidAds?: boolean; license12Months?: boolean; exclusive?: boolean }
}

type Brief = {
  id: string
  title: string
  brand: string
  status: 'Published' | 'In review' | 'Draft' | 'Awarded'
  type: string
  description: string
  style: string[]
  formats: string[]
  tools: string[]
  budget: string
  deadline: string
  deliverables: number
}

const creators: Creator[] = [
  {
    id: 'mara-lennox', name: 'Mara Lennox', handle: '@maralennox', mark: 'ML', headline: 'Cinematic product worlds for brands with a point of view.', bio: 'I build tactile, high-contrast narratives that make impossible products feel inevitable. My process sits between art direction, motion design, and generative film.', location: 'London · GMT', specialties: ['Product film', 'Brand identity', '3D render'], tools: ['Runway', 'Veo', 'ComfyUI', 'After Effects'], formats: ['16:9', '9:16', '1:1'], price: 2400, rating: 4.98, verificationScore: 97, availability: 'Open', color: '#b08cff', verified: true, stats: { projects: 46, repeat: 82, turnaround: '5–7 days' }, portfolio: [
      { title: 'The object, reimagined', type: 'Brand film', gradient: gradientPosters[0], tools: ['Veo', 'ComfyUI'], year: '2025' }, { title: 'Soft hardware', type: 'Launch film', gradient: gradientPosters[3], tools: ['Runway', 'After Effects'], year: '2025' }, { title: 'A quiet future', type: 'Social loop', gradient: gradientPosters[4], tools: ['Kling', 'Flux'], year: '2024' },
    ]
  },
  {
    id: 'kenji-park', name: 'Kenji Park', handle: '@kenjipark', mark: 'KP', headline: 'Surreal motion systems for fashion, culture, and music.', bio: 'My work turns movement into identity. I use procedural systems, image models, and sound to create visuals that feel discovered rather than designed.', location: 'Seoul · GMT+9', specialties: ['Fashion', 'Motion graphics', 'Music video'], tools: ['Kling', 'Sora', 'Suno', 'Topaz'], formats: ['9:16', '16:9', '4:5'], price: 1800, rating: 4.94, verificationScore: 91, availability: 'Limited', color: '#5eead4', verified: true, stats: { projects: 39, repeat: 76, turnaround: '4–6 days' }, portfolio: [
      { title: 'Afterimage studies', type: 'Fashion film', gradient: gradientPosters[2], tools: ['Kling', 'Suno'], year: '2025' }, { title: 'Orbit / 02', type: 'Motion system', gradient: gradientPosters[1], tools: ['Sora', 'Topaz'], year: '2024' }, { title: 'Nocturne', type: 'Music visual', gradient: gradientPosters[0], tools: ['Runway', 'Suno'], year: '2024' },
    ]
  },
  {
    id: 'joa-velasquez', name: 'Joa Velásquez', handle: '@joavfx', mark: 'JV', headline: 'Playful character animation with an editorial edge.', bio: 'I make character-led stories for people who want their brands to feel alive. Expect warm worlds, bold poses, and a process you can actually follow.', location: 'Mexico City · GMT-6', specialties: ['Character animation', 'Social shorts', 'Brand film'], tools: ['Midjourney', 'Runway', 'ElevenLabs', 'Flux'], formats: ['9:16', '1:1', '4:5'], price: 1250, rating: 4.9, verificationScore: 84, availability: 'Open', color: '#f2a65a', verified: true, stats: { projects: 28, repeat: 68, turnaround: '3–5 days' }, portfolio: [
      { title: 'Small acts of magic', type: 'Character film', gradient: gradientPosters[1], tools: ['Midjourney', 'Runway'], year: '2025' }, { title: 'The happy machine', type: 'Social short', gradient: gradientPosters[2], tools: ['Flux', 'ElevenLabs'], year: '2025' }, { title: 'New rituals', type: 'Brand film', gradient: gradientPosters[4], tools: ['Runway', 'After Effects'], year: '2024' },
    ]
  },
  {
    id: 'rhea-okafor', name: 'Rhea Okafor', handle: '@rheaokafor', mark: 'RO', headline: 'High-gloss visual worlds, built for the scroll.', bio: 'I help premium products earn attention in the first frame. My workflow is fast, precise, and designed around modular content systems.', location: 'New York · EST', specialties: ['Social shorts', 'Product film', 'Fashion'], tools: ['Flux', 'Veo', 'Topaz'], formats: ['9:16', '1:1'], price: 980, rating: 4.87, verificationScore: 78, availability: 'Open', color: '#ff8870', verified: false, stats: { projects: 19, repeat: 61, turnaround: '2–4 days' }, portfolio: [
      { title: 'Still moving', type: 'Social loop', gradient: gradientPosters[3], tools: ['Flux', 'Veo'], year: '2025' }, { title: 'Future skin', type: 'Product film', gradient: gradientPosters[0], tools: ['Veo', 'Topaz'], year: '2025' },
    ]
  },
  {
    id: 'adrien-sol', name: 'Adrien Sol', handle: '@adriensol', mark: 'AS', headline: 'Minimalist 3D, luminous materials, quiet confidence.', bio: 'I create objects and spaces that hold attention without shouting. Best for product launches, identity systems, and artful explainers.', location: 'Paris · CET', specialties: ['3D render', 'Brand identity', 'Product film'], tools: ['Blender', 'ComfyUI', 'After Effects'], formats: ['16:9', '1:1', '21:9'], price: 3200, rating: 4.99, verificationScore: 99, availability: 'Booked', color: '#87b4ff', verified: true, stats: { projects: 52, repeat: 89, turnaround: '7–10 days' }, portfolio: [
      { title: 'Form / function', type: '3D film', gradient: gradientPosters[4], tools: ['Blender', 'ComfyUI'], year: '2025' }, { title: 'Daylight protocol', type: 'Identity film', gradient: gradientPosters[3], tools: ['Blender', 'After Effects'], year: '2024' },
    ]
  },
  {
    id: 'nina-ibarra', name: 'Nina Ibarra', handle: '@ninaibarra', mark: 'NI', headline: 'Human-scale stories from machine-made ingredients.', bio: 'I blend documentary sensibility with generative texture for brands that want to feel close, not polished flat.', location: 'Barcelona · CET', specialties: ['Brand film', 'Social shorts', 'Cinematic'], tools: ['Runway', 'Sora', 'ElevenLabs'], formats: ['16:9', '9:16', '4:5'], price: 1500, rating: 4.92, verificationScore: 88, availability: 'Limited', color: '#ffd36a', verified: true, stats: { projects: 32, repeat: 71, turnaround: '4–6 days' }, portfolio: [
      { title: 'Everyday futures', type: 'Brand film', gradient: gradientPosters[1], tools: ['Sora', 'Runway'], year: '2025' }, { title: 'Common ground', type: 'Social short', gradient: gradientPosters[2], tools: ['Runway', 'ElevenLabs'], year: '2024' },
    ]
  },
]

const briefs: Brief[] = [
  { id: 'brief-01', title: 'A new kind of morning', brand: 'Aster & Co.', status: 'Published', type: 'Brand film', description: 'A 45-second launch film for a ritual-forward coffee system. The visual language should feel tactile, warm, and a little otherworldly.', style: ['Cinematic', 'Minimal', 'Photoreal'], formats: ['16:9', '9:16'], tools: ['Veo', 'ComfyUI'], budget: '$8k – $12k', deadline: 'Nov 18, 2026', deliverables: 4 },
  { id: 'brief-02', title: 'Motion with a pulse', brand: 'Vanta Records', status: 'In review', type: 'Music visual', description: 'A modular world for a new electronic record: reactive forms, black chrome, and a visual system that can scale across social and stage.', style: ['Surreal', '3D glossy'], formats: ['16:9', '1:1', '9:16'], tools: ['Kling', 'Suno'], budget: '$5k – $8k', deadline: 'Dec 03, 2026', deliverables: 8 },
  { id: 'brief-03', title: 'Objects of attention', brand: 'Northline Studio', status: 'Awarded', type: 'Product film', description: 'A set of three short product films that give ordinary desk objects an elevated, collectible presence.', style: ['Editorial', '3D glossy'], formats: ['1:1', '4:5'], tools: ['Blender', 'Flux'], budget: '$3k – $5k', deadline: 'Oct 29, 2026', deliverables: 6 },
]

const specialtyOptions = ['Product film', 'Fashion', 'Cinematic', 'Character animation', 'Motion graphics', 'Social shorts', '3D render', 'Brand identity']
const toolOptions = ['Veo', 'Runway', 'Kling', 'Sora', 'Midjourney', 'Flux', 'ComfyUI', 'Suno']

function useRoute(): [Page, string | undefined, (path: string) => void] {
  const get = (): [Page, string | undefined] => {
    const path = window.location.pathname
    if (path === '/signin') return ['signin', undefined]
    if (path === '/create-account') return ['signup', undefined]
    if (path === '/forgot-password') return ['forgot', undefined]
    if (path === '/projects' || path.startsWith('/projects/')) return ['projects', path.split('/')[2]]
    const protectedPath = path === '/creators' || path.startsWith('/creators/') || path === '/briefs' || path === '/briefs/new' || path.startsWith('/briefs/') || path === '/dashboard' || path === '/profile' || path === '/brands'
    if (protectedPath && !isAuthenticated()) { sessionStorage.setItem('genra-auth-destination', path); window.history.replaceState({}, '', '/signin'); return ['signin', undefined] }
    if (path === '/creators') return ['creators', undefined]
    if (path.startsWith('/creators/')) return ['profile', path.split('/')[2]]
    if (path === '/briefs/new') return ['newBrief', undefined]
    if (path === '/briefs' || path === '/brands') return ['briefs', undefined]
    if (path.startsWith('/briefs/')) return ['briefDetail', path.split('/')[2]]
    if (path === '/dashboard' || path === '/profile') return ['dashboard', undefined]
    if (path === '/studio' || path === '/studio/history') return ['studio', undefined]
    return ['home', undefined]
  }
  const [route, setRoute] = useState<[Page, string | undefined]>(get)
  useEffect(() => {
    const onPop = () => setRoute(get())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setRoute(get())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return [route[0], route[1], navigate]
}

function App() {
  const [page, id, navigate] = useRoute()
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('genra-role') as Role) || 'Brand')
  const [toast, setToast] = useState('')
  const [getStartedOpen, setGetStartedOpen] = useState(false)
  useEffect(() => { localStorage.setItem('genra-role', role) }, [role])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const openAuth = (destination = '/dashboard') => { sessionStorage.setItem('genra-auth-destination', destination); navigate('/signin') }
  const openStudio = () => navigate('/studio')
  const openCreator = () => { if (isAuthenticated()) navigate('/creators'); else openAuth('/creators') }
  const openBrand = () => { if (isAuthenticated()) navigate('/brands'); else openAuth('/brands') }
  const startGetStarted = () => setGetStartedOpen(true)
  const chooseGetStarted = (destination: string) => { setGetStartedOpen(false); if (destination === '/studio') openStudio(); else navigate(destination) }
  const activeCreator = creators.find((creator) => creator.id === id) || creators[0]
  const activeBrief = briefs.find((brief) => brief.id === id) || briefs[0]
  return <div className="app-shell">
    <Navbar role={role} setRole={setRole} navigate={navigate} onStudioClick={openStudio} onCreatorClick={openCreator} onBrandClick={openBrand} onSignIn={() => openAuth('/dashboard')} onGetStarted={startGetStarted} />
    <main>
      {page === 'home' && <NewHomePage navigate={navigate} onStudioClick={openStudio} onSignIn={() => openAuth('/dashboard')} onGetStarted={startGetStarted} />}
      {page === 'projects' && <ProjectsPage navigate={navigate} />}
      {page === 'creators' && <CreatorsPage navigate={navigate} />}
      {page === 'profile' && <CreatorProfile creator={activeCreator} id={id} navigate={navigate} notify={notify} />}
      {page === 'newBrief' && <BriefBuilder navigate={navigate} notify={notify} />}
      {page === 'briefs' && <BriefsPage navigate={navigate} />}
      {page === 'briefDetail' && <BriefDetail brief={activeBrief} id={id} navigate={navigate} notify={notify} />}
      {page === 'dashboard' && <DashboardPage navigate={navigate} notify={notify} />}
      {page === 'studio' && <Studio navigate={navigate} notify={notify} />}
      {page === 'signin' && <AuthPages mode="signin" navigate={navigate} />}
      {page === 'signup' && <AuthPages mode="signup" navigate={navigate} />}
      {page === 'forgot' && <AuthPages mode="forgot" navigate={navigate} />}
    </main>
    {page !== 'home' && false && <Footer navigate={navigate} />}
    {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    {getStartedOpen && <GetStartedModal onClose={() => setGetStartedOpen(false)} onChoose={chooseGetStarted} />}
  </div>
}

function GetStartedModal({ onClose, onChoose }: { onClose: () => void; onChoose: (path: string) => void }) {
  return <div className="studio-auth-backdrop" role="dialog" aria-modal="true" aria-labelledby="get-started-title"><div className="studio-auth-card"><button className="studio-auth-close" onClick={onClose} aria-label="Close Get Started choices"><X size={17} /></button><span className="studio-auth-mark">G/</span><span className="home-kicker">GENRA / GET STARTED</span><h2 id="get-started-title">What are you here to do?</h2><p>Choose the fastest way into the Genra workspace.</p><button className="home-primary studio-auth-action" onClick={() => onChoose('/dashboard')}>I'm a Creator <ArrowUpRight size={15} /></button><button className="home-secondary studio-auth-action" onClick={() => onChoose('/briefs/new')}>I'm a Brand <ArrowUpRight size={15} /></button><button className="studio-auth-browse" onClick={() => onChoose('/studio')}>Create with AI Studio</button></div></div>
}

function Navbar({ role, setRole, navigate, onStudioClick, onCreatorClick, onBrandClick, onSignIn, onGetStarted }: { role: Role; setRole: (role: Role) => void; navigate: (path: string) => void; onStudioClick: () => void; onCreatorClick: () => void; onBrandClick: () => void; onSignIn: () => void; onGetStarted: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const loggedIn = isAuthenticated()
  const user = getUser()
  return <header className="site-nav-wrap">
    <nav className="site-nav" aria-label="Main navigation">
      <button className="wordmark" onClick={() => navigate('/')} aria-label="Go to Genra home"><span className="wordmark-mark">G<span>/</span></span><span>Genra</span></button>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => { onStudioClick(); setMenuOpen(false) }}>AI Studio</button>
        <button onClick={() => { navigate('/projects'); setMenuOpen(false) }}>Projects</button>
        <button className="mobile-role" onClick={() => { onCreatorClick(); setMenuOpen(false) }}>Creator</button>
        <button className="mobile-role" onClick={() => { onBrandClick(); setMenuOpen(false) }}>Brand</button>
      </div>
      <div className="nav-actions">
        <button className="nav-role-link" onClick={() => { onCreatorClick(); setMenuOpen(false) }}>Creator</button>
        <button className="nav-role-link" onClick={() => { onBrandClick(); setMenuOpen(false) }}>Brand</button>
        {loggedIn ? <><button className="nav-signup" onClick={() => navigate('/dashboard')}>Dashboard <ArrowUpRight size={14} /></button><button className="nav-role-link" onClick={() => { signOutDemoUser(); navigate('/') }}>Logout</button></> : <><button className="nav-signup" onClick={onSignIn}>Sign In <ArrowUpRight size={14} /></button><button className="nav-signup" onClick={onGetStarted}>Get Started <ArrowUpRight size={14} /></button></>}
        <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={18} /></button>
      </div>
    </nav>
  </header>
}

function HomePage({ navigate }: { navigate: (path: string) => void }) {
  const [query, setQuery] = useState('')
  const submitSearch = () => navigate(`/creators${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  return <>
    <section className="hero-section">
      <div className="hero-video"><video autoPlay muted loop playsInline poster="" src={videoAssets.hero} onError={(event) => { event.currentTarget.style.display = 'none' }} /></div>
      <div className="hero-noise" />
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-orb"><div className="orb-core" /><span>01 / 03</span></div>
      <div className="hero-content page-pad">
        <div className="eyebrow"><span className="eyebrow-dot" /> THE AI CREATOR MARKETPLACE</div>
        <h1>Hire the <em>AI-native</em><br />creators.</h1>
        <p className="hero-copy">The best AI creators are already building the next visual language. Genra helps you find the ones who can make your brief impossible to ignore.</p>
        <div className="hero-search glass-pill">
          <Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitSearch()} placeholder="Search skills, tools, styles..." aria-label="Search creators" /><button onClick={submitSearch} aria-label="Search"><ArrowUpRight size={20} /></button>
        </div>
        <div className="hero-actions"><button className="gradient-button" onClick={() => navigate('/briefs/new')}>Post a brief <ArrowUpRight size={15} /></button><button className="text-button" onClick={() => navigate('/creators')}>Explore creators <ArrowDownRight size={16} /></button></div>
      </div>
      <div className="hero-bottom page-pad"><span className="scroll-cue"><span className="scroll-line" /> SCROLL TO EXPLORE</span><div className="hero-socials"><button aria-label="Learn about verification"><ShieldCheck size={15} /></button><button aria-label="See the process"><Command size={15} /></button><button aria-label="View network"><Link2 size={15} /></button></div><span className="hero-count">01 <i>/</i> 05</span></div>
    </section>
    <section className="featured-section section-pad" id="creator-discovery"><div className="section-heading-row"><div><span className="section-kicker">01 / CREATOR DISCOVERY</span><h2>Find the right<br /><em>creative signal.</em></h2></div><p>Browse AI-native talent<br />by taste, tools, and trust.</p></div><div className="statement-copy discovery-copy"><p className="body-copy">Genra makes the new creative network searchable. Compare specialties, workflows, verification, and commercial terms before you ever send an invite.</p><button className="text-button" onClick={() => navigate('/creators')}>Explore all creators <ArrowUpRight size={15} /></button></div><div className="featured-grid">{creators.slice(0, 3).map((creator) => <CreatorCard key={creator.id} creator={creator} navigate={navigate} />)}</div></section>
    <section className="process-section section-pad" id="how-it-works"><div className="section-heading-row"><div><span className="section-kicker">02 / BRIEF MARKETPLACE</span><h2>Turn the idea<br />into <em>momentum.</em></h2></div><p>A structured path from<br />rough thought to right match.</p></div><div className="process-grid">{[{ number: '01', title: 'Shape the brief', text: 'Start with the messy version. Genra turns intent into a clear, structured brief.', icon: WandSparkles }, { number: '02', title: 'Match with signal', text: 'See creators ranked by tool overlap, format coverage, commercial fit, and verification.', icon: Sparkles }, { number: '03', title: 'Move to action', text: 'Invite the right person, align on the details, and get the work moving without the guesswork.', icon: MoveUpRight }].map((step) => <div className="process-card glass-card" key={step.number}><div className="process-number">{step.number}</div><step.icon size={24} strokeWidth={1.4} /><h3>{step.title}</h3><p>{step.text}</p><span className="card-arrow"><ArrowUpRight size={16} /></span></div>)}</div><button className="gradient-button section-cta-button" onClick={() => navigate('/briefs/new')}>Build a brief <WandSparkles size={15} /></button></section>
    <section className="marquee-section section-pad" id="portfolio-showcase"><div className="section-heading-row"><div><span className="section-kicker">03 / PORTFOLIO SHOWCASE</span><h2>See what<br /><em>AI can become.</em></h2></div><p>Real work. Visible process.<br />No empty portfolio boxes.</p></div><div className="marquee-row row-one">{[...creators, ...creators].map((creator, index) => <PortfolioTile key={`${creator.id}-${index}`} creator={creator} index={index} />)}</div><div className="marquee-row row-two">{[...creators.slice().reverse(), ...creators.slice().reverse()].map((creator, index) => <PortfolioTile key={`${creator.id}-r-${index}`} creator={creator} index={index + 2} />)}</div></section>
    <section className="verification-section section-pad" id="engagement-management"><div className="verification-panel"><div className="verification-art"><div className="ring ring-a" /><div className="ring ring-b" /><div className="verification-score"><strong>97</strong><span>TRUST<br />SIGNALS</span></div></div><div className="verification-content"><span className="section-kicker">04 / ENGAGEMENT MANAGEMENT</span><h2>From first message<br />to <em>final delivery.</em></h2><p>Keep discovery, collaboration, and delivery in one calm workspace. Verification makes the first move easier; clear briefs make every move after it faster.</p><div className="trust-list">{[['Invite with context', 'Send a structured brief with the tools, formats, budget, and rights already clear.'], ['Collaborate with confidence', 'Keep the creative relationship human while the workflow stays legible.'], ['Deliver with provenance', 'Know what was made, how it was made, and what you can use.']].map(([title, text]) => <div className="trust-item" key={title}><span className="trust-icon"><BadgeCheck size={16} /></span><div><strong>{title}</strong><span>{text}</span></div></div>)}</div><div className="engagement-actions"><button className="light-button" onClick={() => navigate('/briefs')}>View brief marketplace <ArrowUpRight size={15} /></button><button className="outline-light-button" onClick={() => navigate('/dashboard')}>Creator studio <ArrowUpRight size={15} /></button></div></div></div></section>
    <section className="cta-section"><div className="cta-video"><video autoPlay muted loop playsInline src={videoAssets.object} onError={(event) => { event.currentTarget.style.display = 'none' }} /></div><div className="cta-overlay" /><div className="cta-inner"><span className="section-kicker">05 / BUILD WHAT'S NEXT</span><h2>Your next<br /><em>best move</em> starts here.</h2><div><button className="light-button" onClick={() => navigate('/creators')}>Find creators <ArrowUpRight size={15} /></button><button className="outline-light-button" onClick={() => navigate('/briefs/new')}>Post a brief <ArrowUpRight size={15} /></button></div></div></section>
  </>
}

function PortfolioTile({ creator, index }: { creator: Creator; index: number }) { const item = creator.portfolio[index % creator.portfolio.length]; return <div className="portfolio-tile" style={{ background: item.gradient }}><div className="tile-overlay" /><div className="tile-caption"><span>{item.type}</span><strong>{item.title}</strong></div><span className="tile-play"><Play size={13} fill="currentColor" /></span></div> }

function CreatorCard({ creator, navigate }: { creator: Creator; navigate: (path: string) => void }) { return <article className="creator-card glass-card" onClick={() => navigate(`/creators/${creator.id}`)}><div className="creator-card-visual" style={{ background: creator.portfolio[0].gradient }}><div className="visual-grid" /><span className="visual-mark">{creator.mark}</span><span className="visual-index">VIEW / 0{creator.portfolio.length}</span><span className="card-play"><Play size={12} fill="currentColor" /></span></div><div className="creator-card-body"><div className="creator-card-top"><div><h3>{creator.name}</h3><span>{creator.handle}</span></div><span className="availability"><i className={creator.availability.toLowerCase()} /> {creator.availability}</span></div><p>{creator.headline}</p><div className="creator-card-bottom"><span>{creator.specialties[0]} · {creator.location.split(' · ')[0]}</span><span className="rating"><Star size={13} fill="currentColor" /> {creator.rating}</span></div></div></article> }

function CreatorsPage({ navigate }: { navigate: (path: string) => void }) {
  const params = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(params.get('q') || '')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedTool, setSelectedTool] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState('Relevance')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [creatorList, setCreatorList] = useState<Creator[]>(creators)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.creators
      .list({
        q: query,
        specialization: selectedSpecialty,
        tools: selectedTool,
        verifiedOnly
      })
      .then((res) => {
        if (!active) return
        setCreatorList(res.items || [])
        setError('')
      })
      .catch((err) => {
        if (!active) return
        console.error('Failed to load creators from API:', err)
        setError(err.message || 'Error fetching creators')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [query, selectedSpecialty, selectedTool, verifiedOnly])

  const filtered = useMemo(() => {
    return [...creatorList].sort((a, b) =>
      sort === 'Rating' ? b.rating - a.rating : sort === 'Price' ? a.price - b.price : sort === 'Newest' ? b.verificationScore - a.verificationScore : 0
    )
  }, [creatorList, sort])

  const clear = () => { setQuery(''); setSelectedSpecialty(''); setSelectedTool(''); setVerifiedOnly(false) }

  return <div className="page-frame section-pad"><div className="page-title-row"><div><span className="section-kicker">THE CREATOR INDEX / 2026</span><h1>Find your <em>people.</em></h1><p>AI-native talent, made legible.</p></div><div className="result-note"><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>creators<br />in the network</span></div></div><div className="search-toolbar"><div className="search-field glass-pill"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, skill, tool..." /><kbd>⌘ K</kbd></div><button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><Filter size={15} /> Filters {selectedSpecialty || selectedTool || verifiedOnly ? <span className="filter-count">{[selectedSpecialty, selectedTool, verifiedOnly ? 'verified' : ''].filter(Boolean).length}</span> : null}</button><div className="sort-select"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Relevance</option><option>Rating</option><option>Price</option><option>Newest</option></select><ChevronDown size={14} /></div></div><div className="active-chips">{selectedSpecialty && <button onClick={() => setSelectedSpecialty('')}>{selectedSpecialty} <X size={13} /></button>}{selectedTool && <button onClick={() => setSelectedTool('')}>{selectedTool} <X size={13} /></button>}{verifiedOnly && <button onClick={() => setVerifiedOnly(false)}>Verified <X size={13} /></button>}{(selectedSpecialty || selectedTool || verifiedOnly || query) && <button className="clear-filter" onClick={clear}>Clear all</button>}</div><div className="browse-layout"><aside className={`filter-panel glass-card ${filtersOpen ? 'mobile-open' : ''}`}><div className="filter-panel-head"><span>Refine the signal</span><button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={16} /></button></div><FilterGroup title="Specialization"><div className="filter-options">{specialtyOptions.map((option) => <button className={selectedSpecialty === option ? 'selected' : ''} key={option} onClick={() => setSelectedSpecialty(selectedSpecialty === option ? '' : option)}>{option}<span>{creatorList.filter((creator) => (creator.specialties || []).includes(option)).length}</span></button>)}</div></FilterGroup><FilterGroup title="Tools"><div className="filter-options">{toolOptions.slice(0, 6).map((option) => <button className={selectedTool === option ? 'selected' : ''} key={option} onClick={() => setSelectedTool(selectedTool === option ? '' : option)}>{option}<span>{creatorList.filter((creator) => (creator.tools || []).includes(option)).length}</span></button>)}</div></FilterGroup><FilterGroup title="Trust & availability"><label className="check-row"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} /><span className="fake-check"><Check size={12} /></span>Verified only</label><label className="check-row"><input type="checkbox" /><span className="fake-check"><Check size={12} /></span>Commercial use</label><label className="check-row"><input type="checkbox" /><span className="fake-check"><Check size={12} /></span>Available now</label></FilterGroup><button className="filter-brief-cta" onClick={() => navigate('/briefs/new')}><WandSparkles size={15} /> Let a brief do the work <ArrowUpRight size={14} /></button></aside><div className="results-grid">{loading ? <div className="empty-state glass-card"><p>Loading creators from network...</p></div> : error ? <div className="empty-state glass-card"><p>{error}</p></div> : filtered.length ? filtered.map((creator) => <CreatorCard key={creator.id} creator={creator} navigate={navigate} />) : <div className="empty-state glass-card"><div className="empty-icon"><Search size={21} /></div><h2>No creators match your requirements.</h2><p>Try loosening a filter, or give your idea a home and let the brief builder find the right signal.</p><button className="gradient-button" onClick={() => navigate('/briefs/new')}>Post a brief <ArrowUpRight size={15} /></button></div>}</div></div></div>
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) { return <div className="filter-group"><div className="filter-group-title">{title}<ChevronDown size={14} /></div>{children}</div> }

function CreatorProfile({ creator, id, navigate, notify }: { creator: Creator; id?: string; navigate: (path: string) => void; notify: (message: string) => void }) {
  const [profileData, setProfileData] = useState<Creator>(creator)
  const [selected, setSelected] = useState<Creator['portfolio'][number] | null>(null)

  useEffect(() => {
    if (id) {
      api.creators.getById(id)
        .then((data) => {
          if (data && data.name) setProfileData(data)
        })
        .catch(() => {
          // fallback to initial
        })
    }
  }, [id])

  const targetCreator = profileData || creator

  return <div className="profile-page"><section className="profile-hero section-pad"><button className="back-button" onClick={() => navigate('/creators')}><ArrowLeft size={15} /> Back to creators</button><div className="profile-hero-content"><div className="profile-identity"><div className="profile-avatar" style={{ background: targetCreator.color || '#b08cff' }}>{targetCreator.mark || 'CR'}</div><div><div className="eyebrow"><span className="eyebrow-dot" /> {targetCreator.location}</div><h1>{targetCreator.name?.split(' ')[0]} <em>{targetCreator.name?.split(' ').slice(1).join(' ')}</em></h1><p>{targetCreator.headline}</p><div className="profile-badges"><span className="teal-badge"><BadgeCheck size={14} /> {targetCreator.verificationScore || 90}% verified</span><span className="status-badge"><i className={(targetCreator.availability || 'Open').toLowerCase()} /> {targetCreator.availability || 'Open'}</span></div></div></div><div className="profile-meta"><div><span>RATING</span><strong><Star size={15} fill="currentColor" /> {targetCreator.rating || 4.9}</strong></div><div><span>FROM</span><strong>${(targetCreator.price || 2000).toLocaleString()}<small> / project</small></strong></div><div><span>REPEAT CLIENTS</span><strong>{targetCreator.stats?.repeat || 80}%</strong></div></div></div></section><section className="profile-content section-pad"><div className="profile-main"><div className="profile-section-heading"><span className="section-kicker">SELECTED WORK</span><span>{(targetCreator.portfolio || []).length} pieces / 2024—25</span></div><div className="profile-portfolio">{(targetCreator.portfolio || []).map((item, index) => <button className={`profile-work work-${index}`} key={item.title} style={{ background: item.gradient || gradientPosters[index % gradientPosters.length] }} onClick={() => setSelected(item)}><div className="work-shine" /><span>{item.type || item.contentType}</span><strong>{item.title}</strong><small>{(item.tools || item.toolsUsed || []).join(' · ')}</small><i><Play size={13} fill="currentColor" /></i></button>)}</div><div className="profile-about"><div><span className="section-kicker">ABOUT THE PRACTICE</span><p>{targetCreator.bio}</p></div><div className="profile-stats"><div><strong>{targetCreator.stats?.projects || 24}</strong><span>projects<br />completed</span></div><div><strong>{targetCreator.stats?.turnaround || '4-6 days'}</strong><span>average<br />turnaround</span></div></div></div></div><aside className="profile-aside"><div className="aside-card glass-card"><span className="section-kicker">THE TOOLKIT</span><h3>Craft, with receipts.</h3><div className="tool-list">{(targetCreator.tools || []).map((tool) => <div key={tool}><span>{tool}</span><BadgeCheck size={15} /></div>)}</div><div className="aside-note"><ShieldCheck size={15} /><span>Tool use verified through a live process capture.</span></div></div><div className="aside-card glass-card"><span className="section-kicker">WORKFLOW</span><div className="workflow-list">{['Brief & direction board', 'Script & style development', 'Generative exploration', 'Edit, grade & audio', 'Delivery with provenance'].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong></div>)}</div><div className="workflow-foot"><span><Clock3 size={14} /> {targetCreator.stats?.turnaround || '5-7 days'}</span><span><Layers3 size={14} /> 2 revisions</span></div></div><div className="aside-card glass-card licensing-card"><span className="section-kicker">LICENSING</span><div className="license-line"><BadgeCheck size={15} /><strong>Commercial use available</strong></div><p>Work-for-hire or non-exclusive rights. Global territories. Provenance included.</p><div className="format-tags">{(targetCreator.formats || ['16:9', '9:16']).map((format) => <span key={format}>{format}</span>)}</div></div><button className="gradient-button invite-button" onClick={() => notify(`Invite sent to ${targetCreator.name}`)}>Invite to a brief <Send size={15} /></button></aside></section>{selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="work-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={17} /></button><div className="modal-art" style={{ background: selected.gradient || gradientPosters[0] }}><span className="modal-mark">{targetCreator.mark}</span><span className="modal-play"><Play size={22} fill="currentColor" /></span></div><div className="modal-copy"><span className="section-kicker">{selected.type || selected.contentType} / {selected.year || '2025'}</span><h2>{selected.title}</h2><p>AI-native visual development built with a clear creative direction, an auditable process, and room for the unexpected.</p><div className="modal-tags">{(selected.tools || selected.toolsUsed || []).map((tool) => <span key={tool}>{tool}</span>)}</div></div></div></div>}</div>
}

function BriefBuilder({ navigate, notify }: { navigate: (path: string) => void; notify: (message: string) => void }) {
  const [idea, setIdea] = useState('')
  const [built, setBuilt] = useState(false)
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [type, setType] = useState('Brand film')
  const [style, setStyle] = useState<string[]>(['Cinematic'])
  const [formats, setFormats] = useState<string[]>(['16:9'])
  const [building, setBuilding] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const build = () => { setBuilding(true); window.setTimeout(() => { const lower = idea.toLowerCase(); setTitle(lower.includes('coffee') ? 'A new kind of morning' : lower.includes('fashion') ? 'A moving point of view' : 'A brief with a point of view'); setObjective('Create a visual world that earns attention in the first frame and gives the idea room to breathe.'); setType(lower.includes('social') ? 'Social short' : lower.includes('music') ? 'Music visual' : 'Brand film'); setStyle(lower.includes('surreal') ? ['Surreal', 'Cinematic'] : ['Cinematic', 'Minimal']); setFormats(lower.includes('social') ? ['9:16', '1:1'] : ['16:9', '9:16']); setBuilding(false); setBuilt(true) }, 1000) }

  const publishBrief = async () => {
    setSubmitting(true)
    try {
      const res = await api.briefs.create({
        title: title || 'A new kind of morning',
        description: objective || 'A visual narrative built for the AI era.',
        contentType: type === 'Brand film' ? 'AI Video Ads' : type,
        style,
        aspectRatio: formats,
        budget: '$8k – $12k',
        deadline: 'Nov 18, 2026'
      })
      notify('Brief published — matches are ready')
      navigate(`/briefs/${res.id || 'brief-01'}`)
    } catch (err: any) {
      notify('Brief saved — matches are ready')
      navigate('/briefs/brief-01')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="brief-builder page-frame section-pad"><div className="page-title-row builder-title"><div><span className="section-kicker">BRIEF STUDIO / 01</span><h1>Make the <em>intention</em><br />clear.</h1><p>Start with the messy version. We’ll structure the signal.</p></div><div className="step-pill"><span className="active">01</span><i /><span className={built ? 'active' : ''}>02</span><i /><span>03</span></div></div>{!built ? <section className="idea-stage"><div className="idea-copy"><span className="eyebrow"><span className="eyebrow-dot" /> THE FAST PATH</span><h2>What are you<br />trying to <em>make?</em></h2><p>Tell us the rough idea, the feeling, or the problem. Don’t worry about the right words yet.</p></div><div className="idea-input-wrap glass-card"><textarea autoFocus value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="We want to make a launch film for..." /><div className="idea-input-foot"><span>{idea.length > 0 ? `${idea.length} characters` : 'No wrong answers here'}</span><button className="gradient-button" disabled={!idea.trim() || building} onClick={build}>{building ? <><span className="spinner" /> Structuring...</> : <>Build my brief <WandSparkles size={15} /></>}</button></div></div><div className="prompt-suggestions"><span>Try a starting point</span><button onClick={() => setIdea('A surreal 30-second film for a new fragrance launch — glossy, intimate, a little strange.')}>“A surreal launch film for a new fragrance...”</button><button onClick={() => setIdea('Social-first product stories for a sustainable coffee system. Warm, tactile, and human.')}>“Social-first stories for a sustainable product...”</button></div></section> : <section className="builder-workspace"><div className="builder-form"><div className="ai-filled-note"><Sparkles size={15} /> We structured your idea. Make it yours.</div><FormSection number="01" title="Campaign"><label>Working title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>What should this make people feel?<textarea value={objective} onChange={(event) => setObjective(event.target.value)} /></label></FormSection><FormSection number="02" title="Content"><div className="two-fields"><label>Content type<select value={type} onChange={(event) => setType(event.target.value)}><option>Brand film</option><option>Product film</option><option>Social short</option><option>Music visual</option></select></label><label>Deliverables<input defaultValue="3" /></label></div><ChoiceRow label="Style" options={['Cinematic', 'Minimal', 'Surreal', '3D glossy', 'Photoreal']} selected={style} setSelected={setStyle} /><ChoiceRow label="Formats" options={['16:9', '9:16', '1:1', '4:5']} selected={formats} setSelected={setFormats} /></FormSection><FormSection number="03" title="Commercial use"><div className="use-card"><BadgeCheck size={17} /><div><strong>Commercial usage required</strong><span>Global · Paid social, web, OOH · 12 months</span></div><button className="toggle on"><span /></button></div></FormSection><button className="gradient-button publish-button" disabled={submitting} onClick={publishBrief}>{submitting ? 'Publishing brief...' : <>Publish brief <ArrowUpRight size={15} /></>}</button></div><aside className="brief-preview"><div className="preview-label"><span>LIVE PREVIEW</span><span className="live-dot">● LIVE</span></div><div className="preview-card glass-card"><span className="section-kicker">{type} / DRAFT</span><h3>{title || 'Your brief title'}</h3><p>{objective || 'A clear creative direction will appear here as you shape your brief.'}</p><div className="preview-divider" /><div className="preview-detail"><span>STYLE</span><strong>{style.join(' · ')}</strong></div><div className="preview-detail"><span>FORMATS</span><strong>{formats.join(' · ')}</strong></div><div className="preview-detail"><span>EST. MATCHES</span><strong>12 creators <ArrowUpRight size={13} /></strong></div></div><div className="completeness"><div><span>COMPLETENESS</span><strong>72%</strong></div><div className="progress-bar"><span style={{ width: '72%' }} /></div><p>Add a budget to increase match precision.</p></div></aside></section>}</div>
}

function FormSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <section className="form-section"><div className="form-section-title"><span>{number}</span><h3>{title}</h3></div>{children}</section> }
function ChoiceRow({ label, options, selected, setSelected }: { label: string; options: string[]; selected: string[]; setSelected: (values: string[]) => void }) { return <div className="choice-row"><span>{label}</span><div>{options.map((option) => <button key={option} className={selected.includes(option) ? 'selected' : ''} onClick={() => setSelected(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])}>{selected.includes(option) && <Check size={12} />}{option}</button>)}</div></div> }

function BriefsPage({ navigate }: { navigate: (path: string) => void }) {
  const [briefList, setBriefList] = useState<Brief[]>(briefs)
  useEffect(() => {
    api.briefs.list()
      .then((res) => { if (res.items?.length) setBriefList(res.items) })
      .catch(() => {})
  }, [])
  return <div className="page-frame section-pad"><div className="page-title-row"><div><span className="section-kicker">BRIEF LIBRARY / YOUR WORKSPACE</span><h1>Creative work,<br /><em>in motion.</em></h1><p>Live briefs, clean handoffs, better outcomes.</p></div><button className="gradient-button" onClick={() => navigate('/briefs/new')}>New brief <Plus size={16} /></button></div><div className="brief-list">{briefList.map((brief) => <button className="brief-list-row glass-card" key={brief.id} onClick={() => navigate(`/briefs/${brief.id}`)}><div className="brief-status"><span className={`status-dot ${(brief.status || 'Published').toLowerCase().replace(' ', '-')}`} /><span>{brief.status || 'Published'}</span></div><div className="brief-list-main"><span>{brief.brand}</span><h3>{brief.title}</h3></div><div className="brief-list-meta"><span>{brief.type}</span><span>{brief.budget}</span><span>{brief.deadline}</span></div><ArrowUpRight size={17} /></button>)}</div><div className="brief-bottom-note"><CircleHelp size={16} /><span>Need a stronger starting point?</span><button onClick={() => navigate('/briefs/new')}>Build a brief with AI <ArrowUpRight size={14} /></button></div></div>
}

function BriefDetail({ brief, id, navigate, notify }: { brief: Brief; id?: string; navigate: (path: string) => void; notify: (message: string) => void }) {
  const [activeBrief, setActiveBrief] = useState<Brief>(brief)
  const [matchResults, setMatchResults] = useState<any[]>([])
  const [invitedCreators, setInvitedCreators] = useState<Record<string, boolean>>({})
  const [sendingModalCreator, setSendingModalCreator] = useState<any | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const briefId = id || brief.id
    if (briefId) {
      api.briefs.getById(briefId)
        .then((b) => { if (b) setActiveBrief(b) })
        .catch(() => {})

      // Match creators with backend 100 pt scoring engine
      api.briefs.match(briefId)
        .then((res) => {
          if (res.matches?.length) setMatchResults(res.matches)
        })
        .catch(() => {})
    }
  }, [id, brief.id])

  const sendBriefSubmission = async (creatorId: string, creatorName: string) => {
    try {
      await api.briefs.send(activeBrief.id, { creatorId, notes })
      setInvitedCreators((prev) => ({ ...prev, [creatorId]: true }))
      notify(`Submission saved: Brief invitation dispatched to ${creatorName}`)
      setSendingModalCreator(null)
      setNotes('')
    } catch (err: any) {
      notify(`Submission saved: Brief sent to ${creatorName}`)
      setInvitedCreators((prev) => ({ ...prev, [creatorId]: true }))
      setSendingModalCreator(null)
    }
  }

  const fallbackMatches = creators.slice(0, 3).map((c, i) => ({
    creator: c,
    score: 98 - i * 4,
    flags: { aiVideo: true, tool: true, aspectRatio: true, paidAds: true, commercialRights: true }
  }))

  const displayMatches = matchResults.length ? matchResults : fallbackMatches

  return <div className="page-frame section-pad brief-detail-page"><button className="back-button" onClick={() => navigate('/briefs')}><ArrowLeft size={15} /> Back to briefs</button><div className="brief-detail-head"><div><div className="brief-status large"><span className={`status-dot ${(activeBrief.status || 'Published').toLowerCase().replace(' ', '-')}`} /> {activeBrief.status || 'Published'}</div><span className="section-kicker">{activeBrief.brand} / {activeBrief.type}</span><h1>{activeBrief.title}</h1><p>{activeBrief.description}</p></div><button className="gradient-button" onClick={() => notify('Brief shared with your team')}><Send size={15} /> Share brief</button></div><div className="brief-detail-layout"><section className="brief-specs glass-card"><div className="spec-grid"><div><span>DELIVERABLES</span><strong>{activeBrief.deliverables || 4} assets</strong></div><div><span>BUDGET</span><strong>{activeBrief.budget || '$8k - $12k'}</strong></div><div><span>DEADLINE</span><strong>{activeBrief.deadline || 'Nov 18, 2026'}</strong></div><div><span>USAGE</span><strong>Commercial · Global</strong></div></div><div className="spec-block"><span>STYLE DIRECTION</span><div className="format-tags">{(activeBrief.style || ['Cinematic']).map((item) => <span key={item}>{item}</span>)}</div></div><div className="spec-block"><span>REQUIRED TOOLS</span><div className="format-tags tool-tags">{(activeBrief.tools || ['Runway', 'Veo']).map((item) => <span key={item}><Cpu size={12} /> {item}</span>)}</div></div><div className="spec-block"><span>FORMATS</span><div className="format-tags">{(activeBrief.formats || ['16:9', '9:16']).map((item) => <span key={item}>{item}</span>)}</div></div></section><aside className="match-rail"><div className="match-rail-title"><div><span className="section-kicker">MATCH ENGINE</span><h2>Good signals,<br /><em>already moving.</em></h2></div><span className="match-count">{displayMatches.length} matches</span></div>{displayMatches.map((matchItem) => {
    const creator = matchItem.creator
    const score = matchItem.score
    const flags = matchItem.flags || {}
    const isInvited = invitedCreators[creator.id]
    return <div className="match-card glass-card" key={creator.id} onClick={() => navigate(`/creators/${creator.id}`)}><div className="match-card-top"><div className="mini-avatar" style={{ background: creator.color || '#b08cff' }}>{creator.mark || 'CR'}</div><div><strong>{creator.name}</strong><span>{(creator.specialties || [creator.specialization])[0]}</span></div><div className="match-score"><strong>{score}%</strong><span>match</span></div></div><div className="match-reasons">{flags.aiVideo && <span><Check size={12} /> AI Video</span>}{flags.tool && <span><Check size={12} /> Tool overlap</span>}{flags.aspectRatio && <span><Check size={12} /> Format coverage</span>}{flags.commercialRights && <span><BadgeCheck size={12} /> Commercial rights</span>}{flags.paidAds && <span><Check size={12} /> Paid Ads</span>}</div><button className={`invite-link ${isInvited ? 'invited' : ''}`} onClick={(event) => { event.stopPropagation(); setSendingModalCreator(creator) }}>{isInvited ? 'Submission Saved ✓' : <>Send Brief <ArrowUpRight size={14} /></>}</button></div>
  })}</aside></div>{sendingModalCreator && <div className="modal-backdrop" onClick={() => setSendingModalCreator(null)}><div className="work-modal glass-card" style={{ maxWidth: '480px', padding: '32px' }} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSendingModalCreator(null)}><X size={18} /></button><span className="section-kicker">SEND BRIEF TO CREATOR</span><h2 style={{ margin: '10px 0', fontSize: '24px' }}>Invite {sendingModalCreator.name}</h2><p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>Send {activeBrief.title} directly to {sendingModalCreator.name}. This will create an active Submission in your Dashboard.</p><label style={{ display: 'block', marginBottom: '16px' }}><span style={{ fontSize: '13px', color: '#ccc', display: 'block', marginBottom: '6px' }}>Project Notes or Creative Directions</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Let us know your earliest availability and reference questions..." style={{ width: '100%', minHeight: '90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px' }} /></label><div style={{ display: 'flex', gap: '12px' }}><button className="gradient-button" style={{ flex: 1 }} onClick={() => sendBriefSubmission(sendingModalCreator.id, sendingModalCreator.name)}>Send Brief & Save <ArrowUpRight size={14} /></button><button className="outline-button" onClick={() => setSendingModalCreator(null)}>Cancel</button></div></div></div>}</div>
}

function DashboardPage({ navigate, notify }: { navigate: (path: string) => void; notify: (message: string) => void }) {
  const user = getUser()
  const displayName = user?.name || 'Your Genra profile'
  const accountType = user?.accountType || 'Creator'
  const [dashboardData, setDashboardData] = useState<{
    activeBriefs: any[]
    applications: any[]
    inProgress: any[]
    completed: any[]
  }>({
    activeBriefs: [],
    applications: [],
    inProgress: [],
    completed: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.dashboard.getProjects()
      .then((data) => {
        if (!active) return
        setDashboardData(data)
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return <div className="page-frame section-pad dashboard-page"><div className="dashboard-top"><div><span className="section-kicker">CREATOR STUDIO / YOUR SPACE</span><h1>Make your work<br /><em>legible.</em></h1><p>Keep the signal fresh. Let the right briefs find you.</p></div><div className="dashboard-avatar">{displayName.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase()}</div></div><div className="dashboard-grid"><section className="dashboard-card glass-card profile-edit-card"><div className="dash-card-head"><div><span className="section-kicker">PROFILE</span><h2>{displayName}</h2><p>{accountType} account · Genra workspace</p></div><button className="icon-button" aria-label="Edit profile" onClick={() => notify('Profile editor opened')}><MoreHorizontal size={18} /></button></div><div className="profile-meter"><div className="meter-orb">84%</div><div><strong>Profile strength</strong><span>Add your commercial terms to reach 100%.</span><div className="progress-bar"><span style={{ width: '84%' }} /></div></div></div><div className="dash-tags"><span>Motion graphics</span><span>Runway</span><span>Veo</span><span>Social shorts</span></div><button className="outline-button" onClick={() => notify('Profile editor opened')}>Edit profile <ArrowUpRight size={14} /></button></section><section className="dashboard-card glass-card invitations-card"><div className="dash-card-head"><div><span className="section-kicker">SECTION 01</span><h2>Active Briefs</h2></div><span className="unread-count">{dashboardData.activeBriefs.length} active</span></div>{dashboardData.activeBriefs.length ? dashboardData.activeBriefs.map((item) => <div className="invitation-row" key={item.id}><div className="invitation-mark">{item.creatorMark || 'A'}</div><div><strong>{item.name}</strong><span>Due {item.deadline} · {item.creator} · {item.progress}% progress</span></div><ArrowUpRight size={15} /></div>) : <p style={{ fontSize: '13px', color: '#888' }}>No active briefs currently.</p>}<button className="text-button" onClick={() => navigate('/briefs')}>View all briefs <ArrowUpRight size={14} /></button></section><section className="dashboard-card glass-card"><div className="dash-card-head"><div><span className="section-kicker">SECTION 02</span><h2>Applications</h2></div><span className="unread-count">{dashboardData.applications.length} submitted</span></div>{dashboardData.applications.length ? dashboardData.applications.map((item) => <div className="invitation-row" key={item.id}><div className="invitation-mark">AP</div><div><strong>{item.name}</strong><span>{item.creator} · {item.status} · {item.progress}%</span></div><ArrowUpRight size={15} /></div>) : <p style={{ fontSize: '13px', color: '#888' }}>No applications pending.</p>}</section><section className="dashboard-card glass-card"><div className="dash-card-head"><div><span className="section-kicker">SECTION 03</span><h2>In Progress</h2></div><span className="unread-count">{dashboardData.inProgress.length} running</span></div>{dashboardData.inProgress.length ? dashboardData.inProgress.map((item) => <div className="invitation-row" key={item.id}><div className="invitation-mark">IP</div><div><strong>{item.name}</strong><span>{item.creator} · Due {item.deadline}</span><div className="progress-bar" style={{ marginTop: '6px' }}><span style={{ width: `${item.progress}%` }} /></div></div><ArrowUpRight size={15} /></div>) : <p style={{ fontSize: '13px', color: '#888' }}>No in-progress projects.</p>}</section><section className="dashboard-card glass-card"><div className="dash-card-head"><div><span className="section-kicker">SECTION 04</span><h2>Completed</h2></div><span className="unread-count">{dashboardData.completed.length} archive</span></div>{dashboardData.completed.length ? dashboardData.completed.map((item) => <div className="invitation-row" key={item.id}><div className="invitation-mark">✓</div><div><strong>{item.name}</strong><span>{item.creator} · Delivered 100%</span></div><BadgeCheck size={16} /></div>) : <p style={{ fontSize: '13px', color: '#888' }}>No completed deliverables yet.</p>}</section></div><div className="dashboard-footer-note"><Zap size={15} /> Your next best brief is probably one filter away. <button onClick={() => { navigate('/creators'); notify('Browsing the network') }}>Browse the network <ArrowUpRight size={14} /></button></div></div>
}

function ProjectsPage({ navigate }: { navigate: (path: string) => void }) {
  const [projectList, setProjectList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.projects.list()
      .then((res) => {
        if (!active) return
        setProjectList(res.items || [])
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Failed to load projects')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return <div className="page-frame section-pad"><div className="page-title-row"><div><span className="section-kicker">PUBLIC OPPORTUNITIES / 2026</span><h1>Explore active <em>projects.</em></h1><p>Public creative briefs and production calls from world-class brands.</p></div><div className="result-note"><strong>{projectList.length.toString().padStart(2, '0')}</strong><span>public calls<br />open</span></div></div>{loading ? <div className="empty-state glass-card"><p>Loading public projects...</p></div> : error ? <div className="empty-state glass-card"><p>{error}</p></div> : <div className="results-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>{projectList.map((proj) => <article key={proj.id} className="creator-card glass-card" style={{ padding: '24px', cursor: 'default' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}><span className="teal-badge"><BadgeCheck size={13} /> {proj.status?.toUpperCase() || 'OPEN'}</span><span style={{ fontSize: '13px', color: '#999' }}>{proj.deadline}</span></div><h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{proj.title}</h3><p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.5, marginBottom: '16px' }}>{proj.description}</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}><strong style={{ fontSize: '15px', color: '#5eead4' }}>{proj.budget}</strong><span style={{ fontSize: '13px', color: '#888' }}>{proj.brandName || 'Verified Brand'}</span></div></article>)}</div>}</div>
}

function Footer({ navigate }: { navigate: (path: string) => void }) { return <footer className="site-footer section-pad"><div className="footer-top"><div><button className="wordmark footer-wordmark" onClick={() => navigate('/')}><span className="wordmark-mark">G<span>/</span></span><span>Genra</span></button><p>Creative talent for the<br />next visual language.</p></div><div className="footer-links"><div><span>EXPLORE</span><button onClick={() => navigate('/creators')}>Creators</button><button onClick={() => navigate('/briefs')}>Briefs</button></div><div><span>FOR CREATORS</span><button onClick={() => navigate('/dashboard')}>Creator studio</button><button onClick={() => navigate('/briefs/new')}>Join the network</button></div><div><span>FOLLOW</span><button>Instagram <ArrowUpRight size={12} /></button><button>Are.na <ArrowUpRight size={12} /></button></div></div></div><div className="footer-bottom"><span>© 2026 Genra</span><span>Built for the ones making what's next.</span><span>Privacy / Terms</span></div></footer> }

export default App
