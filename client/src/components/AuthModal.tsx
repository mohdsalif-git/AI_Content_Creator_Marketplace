import { ArrowUpRight, X } from 'lucide-react'

type AuthModalProps = { title?: string; description?: string; onClose: () => void; onAuth: () => void }

export default function AuthModal({ title = 'Welcome back to Genra', description = 'Continue as a demo user to explore your Genra workspace.', onClose, onAuth }: AuthModalProps) {
  return <div className="studio-auth-backdrop" role="dialog" aria-modal="true" aria-labelledby="genra-auth-title"><div className="studio-auth-card"><button className="studio-auth-close" onClick={onClose} aria-label="Close authentication prompt"><X size={17} /></button><span className="studio-auth-mark">G/</span><span className="home-kicker">GENRA / DEMO ACCESS</span><h2 id="genra-auth-title">{title}</h2><p>{description}</p><button className="home-primary studio-auth-action" onClick={onAuth}>Continue as Demo User <ArrowUpRight size={15} /></button><button className="studio-auth-browse" onClick={onClose}>Continue browsing</button></div></div>
}
