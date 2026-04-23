import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Globe, Activity, Users, Wallet, Target, Rocket, Coins, CheckCircle2,
  ArrowRight, LayoutDashboard
} from 'lucide-react';

import FeatureCard from '../components/FeatureCard';
import StepCard from '../components/StepCard';
import CampaignCard from '../components/CampaignCard';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink selection:bg-brand-100 selection:text-brand-700">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-surface/88 backdrop-blur-xl border-b border-surface-muted px-8">
        <div className="max-w-[1200px] mx-auto h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[10px] no-underline">
            <div className="w-[34px] h-[34px] rounded-lg bg-brand-500 text-white font-display font-extrabold text-[18px] flex items-center justify-center">
              P
            </div>
            <span className="font-display font-bold text-[1.15rem] text-ink">PureRaise</span>
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none">
            <li><a href="#" className="text-brand-500 font-medium text-[0.875rem] transition-colors">Home</a></li>
            <li><a href="#campaigns" className="text-ink-muted hover:text-brand-500 font-medium text-[0.875rem] transition-colors">Featured Campaigns</a></li>
            <li><a href="#how-it-works" className="text-ink-muted hover:text-brand-500 font-medium text-[0.875rem] transition-colors">How it Works</a></li>
            <li><a href="#" className="text-ink-muted hover:text-brand-500 font-medium text-[0.875rem] transition-colors">Portfolios</a></li>
            <li><a href="#" className="text-ink-muted hover:text-brand-500 font-medium text-[0.875rem] transition-colors">About Us</a></li>
          </ul>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[0.875rem] font-medium text-ink hover:text-brand-500 transition-colors no-underline">Login</Link>
            <Link to="/register" className="bg-brand-500 text-white px-[1.4rem] py-[0.6rem] rounded-full text-[0.875rem] font-semibold transition-all hover:bg-brand-600 hover:-translate-y-[1px]">
              Start a Campaign
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-[120px] pb-[140px] px-8 max-w-[1000px] mx-auto flex flex-col items-center text-center relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-100/40 blur-[120px] rounded-full -z-10"></div>
        
        <div className="animate-slide-up flex flex-col items-center">
          <div className="inline-flex items-center gap-[8px] bg-brand-100 text-brand-500 text-[0.75rem] font-bold tracking-[.1em] uppercase px-[1.2rem] py-[0.45rem] rounded-full mb-8 border border-brand-500/20 shadow-sm shadow-brand-500/5">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Transforming Global Impact
          </div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,4.5rem)] font-[800] leading-[1.05] mb-8 text-ink tracking-[-.03em] max-w-[900px]">
            Transparent Crowdfunding<br />
            <span className="text-brand-500 font-[400]">Powered by Blockchain</span>
          </h1>
          <p className="text-[1.15rem] text-ink-muted leading-[1.8] mb-12 max-w-[640px]">
            PureRaise empowers innovators and communities to fund their projects globally, transparently, and securely using smart contracts and decentralized protocols.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
            <Link to="/register" className="bg-brand-500 text-white px-10 py-[1rem] rounded-full text-[1rem] font-bold flex items-center gap-2 transition-all hover:bg-brand-600 hover:-translate-y-[2px] shadow-lg shadow-brand-500/25">
              Start a campaign
            </Link>
            <a href="#campaigns" className="bg-white border border-surface-muted text-ink px-[1.8rem] py-[0.95rem] rounded-full text-[1rem] font-semibold flex items-center gap-2 transition-all hover:border-brand-500 hover:text-brand-500 hover:shadow-md">
              Explore projects
              <ArrowRight size={18} />
            </a>
          </div>
          
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="text-ink text-center">
              <div className="font-bold text-[1rem]">Join 10,000+ Backers</div>
              <div className="text-[0.82rem] text-ink-muted">Trusted by innovators and contributors worldwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white border-y border-surface-muted py-24 px-8">
        <div className="text-center max-w-[620px] mx-auto mb-14">
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-.02em] text-ink">The Future of Funding is On-Chain</h2>
          <p className="text-ink-muted mt-3 text-[1.02rem]">We've removed traditional barriers to funding giving you global reach, instant settlements, and absolute transparency via smart contracts.</p>
        </div>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={ShieldCheck} 
            title="Transparent Transactions" 
            desc="Every contribution is recorded on an immutable ledger, ensuring absolute trust and visibility."
          />
          <FeatureCard 
            icon={Target} 
            title="Milestone-Based Release" 
            desc="Funds are unlocked automatically via smart contracts only when predefined project milestones are met."
          />
          <FeatureCard 
            icon={LayoutDashboard} 
            title="No Middlemen" 
            desc="Operating on a decentralized platform removes third-party gatekeeper fees and processing delays."
          />
          <FeatureCard 
            icon={Globe} 
            title="Global Reach" 
            desc="Campaigns are instantly exposed to a borderless community of potential backers globally."
          />
          <FeatureCard 
            icon={Activity} 
            title="Real-Time Tracking" 
            desc="Backers get granular, real-time insights into resource allocation and project momentum."
          />
          <FeatureCard 
            icon={Users} 
            title="Direct Interaction" 
            desc="Communicate directly with your backers, fostering strong communities and increasing loyalty."
          />
        </div>
      </section>

      {/* STEPS */}
      <section id="how-it-works" className="py-24 px-8 max-w-[1200px] mx-auto text-center">
        <div className="text-[.72rem] font-bold tracking-[.12em] uppercase text-brand-500 mb-2">Process</div>
        <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-ink">Launch in 4 Simple Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative mt-12">
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-[1.5px] bg-gradient-to-r from-brand-100 via-brand-300 to-brand-100"></div>
          
          <StepCard 
            num="01" 
            icon={Wallet} 
            title="Connect Wallet" 
            desc="Link your secure Web3 wallet to authenticate and interact with the platform seamlessly." 
          />
          <StepCard 
            num="02" 
            icon={Target} 
            title="Set Milestones" 
            desc="Define clear project goals and the specific funding required to achieve each stage." 
          />
          <StepCard 
            num="03" 
            icon={Users} 
            title="Get Funded" 
            desc="Share your campaign globally and receive contributions directly via crypto." 
          />
          <StepCard 
            num="04" 
            icon={Rocket} 
            title="Auto-Release" 
            desc="Smart contracts automatically release funds as your community approves milestone completions." 
          />
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section id="campaigns" className="bg-surface-muted/30 border-y border-surface-muted py-24 px-8">
        <div className="max-w-[1200px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-ink mb-2">Active Campaigns</h2>
            <p className="text-ink-muted max-w-[480px] text-[0.95rem]">Discover visionary projects actively shaping the future of global sustainability, technology, and more.</p>
          </div>
          <a href="#" className="flex items-center gap-[6px] text-brand-500 font-semibold text-[0.875rem] no-underline whitespace-nowrap group">
            View all projects <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          <CampaignCard 
            tag="Sustainability"
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800"
            author="Eco Visionaries"
            authorSeed="EcoVisionaries"
            title="Next-Gen Community Solar Grid Initiative"
            raised="$145,000"
            target="$200,000"
            progress={72}
          />
          <CampaignCard 
            tag="Web3 Infrastructure"
            src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800"
            author="Data Mesh"
            authorSeed="DataMesh"
            title="Decentralized Cloud Storage Protocol"
            raised="$890,500"
            target="$1,000,000"
            progress={89}
          />
          <CampaignCard 
            tag="AgriTech"
            src="https://images.unsplash.com/photo-1530836369250-ef71a3f5e4bd?auto=format&fit=crop&q=80&w=800"
            author="Urban Yield"
            authorSeed="UrbanYield"
            title="AeroFarms: Vertical Urban Grow Systems"
            raised="$42,000"
            target="$120,000"
            progress={35}
          />
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="bg-white border border-surface-muted rounded-[28px] p-12 grid md:grid-cols-3 gap-10 text-center shadow-sm shadow-brand-500/5">
          <div className="md:border-r border-surface-muted last:border-0 pr-4">
            <div className="font-display text-[2.75rem] font-extrabold text-brand-500 mb-1">100%</div>
            <div className="font-bold text-[1rem] mb-1 text-ink">Funds Raised</div>
            <div className="text-[.82rem] text-ink-muted">Locked securely in audited smart contracts.</div>
          </div>
          <div className="md:border-r border-surface-muted last:border-0 px-4">
            <div className="font-display text-[2.75rem] font-extrabold text-brand-500 mb-1">24/7</div>
            <div className="font-bold text-[1rem] mb-1 text-ink">Uptime</div>
            <div className="text-[.82rem] text-ink-muted">Always-on decentralized network architecture.</div>
          </div>
          <div className="last:border-0 pl-4">
            <div className="font-display text-[2.75rem] font-extrabold text-brand-500 mb-1">Zero</div>
            <div className="font-bold text-[1rem] mb-1 text-ink">Middlemen</div>
            <div className="text-[.82rem] text-ink-muted">Complete peer-to-peer funding ecosystem.</div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-24 px-8 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-ink mb-4">Why PureRaise Wins Over Traditional Platforms</h2>
            <p className="text-ink-muted mb-8 text-[.97rem] leading-[1.75]">Web2 platforms inherently rely on centralized control, expensive processing fees, and geo-restrictions. PureRaise flips the script, leaning into the power of the blockchain for ultimate freedom.</p>
          </div>

          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-[.8rem] font-bold p-[.6rem_.75rem] border-b-[1.5px] border-surface-muted text-left text-ink-muted uppercase tracking-wider">Traditional</th>
                  <th className="text-[.8rem] font-bold p-[.6rem_.75rem] border-b-[1.5px] border-surface-muted text-left text-brand-500 uppercase tracking-wider">PureRaise</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow bad="High platform & processing fees (5–10%)" good="Near-Zero interaction fees" />
                <ComparisonRow bad="Funds held by centralized entities" good="Smart contract self-custody" />
                <ComparisonRow bad="Hidden algorithms control visibility" good="Transparent, merit-based ranking" />
                <ComparisonRow bad="Restricted global payment processing" good="Borderless crypto transactions" />
                <ComparisonRow bad="Opaque tracking post-funding" good="Verifiable on-chain milestone completion" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="bg-brand-500 rounded-[2.5rem] py-20 px-8 text-center relative overflow-hidden shadow-panel">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full pointer-events-none"></div>
          
          <h2 className="font-display text-white text-[clamp(2rem,3.5vw,3rem)] font-extrabold mb-4 relative z-10">Launch your idea without limits.</h2>
          <p className="text-white/75 text-[1.05rem] mb-10 max-w-[600px] mx-auto relative z-10">Join a global network of forward-thinking creators and backers. Start your journey on PureRaise today.</p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link to="/register" className="bg-white text-brand-600 px-8 py-[0.85rem] rounded-full font-display font-extrabold text-[0.95rem] shadow-lg transition-transform hover:-translate-y-[2px]">
              Create Your Campaign
            </Link>
            <Link to="/login" className="bg-brand-700/50 text-white border border-brand-500/50 px-8 py-[0.85rem] rounded-full font-semibold text-[0.95rem] backdrop-blur hover:bg-brand-700/80">
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-surface-muted pt-16 pb-8 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-[10px] mb-3 no-underline">
                <div className="w-[34px] h-[34px] rounded-lg bg-brand-500 text-white font-display font-extrabold text-[18px] flex items-center justify-center">
                  P
                </div>
                <span className="font-display font-bold text-[1.05rem] text-ink">PureRaise</span>
              </Link>
              <p className="text-ink-muted text-[.85rem] leading-[1.7] max-w-[260px]">The decentralized crowdfunding platform empowering creators globally through blockchain technology.</p>
              <div className="flex gap-3 mt-5">
                {['𝕏', 'in', 'gh', 'dc'].map((s, i) => (
                  <div key={i} className="w-[34px] h-[34px] rounded-full bg-surface border border-surface-muted flex items-center justify-center text-ink-muted text-[.8rem] font-semibold cursor-pointer hover:text-brand-500 hover:border-brand-500/50 transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-[.9rem] mb-5 text-ink tracking-tight">Platform</h4>
              <ul className="list-none space-y-[.65rem]">
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Home</a></li>
                <li><a href="#campaigns" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Explore</a></li>
                <li><a href="#how-it-works" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">How it Works</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Guidelines</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Safety & Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-[.9rem] mb-5 text-ink tracking-tight">Company</h4>
              <ul className="list-none space-y-[.65rem]">
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">About Us</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Careers</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Blog</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-[.9rem] mb-5 text-ink tracking-tight">Stay Updated</h4>
              <p className="text-ink-muted text-[.82rem] mb-3">Join us to get the latest decentralized funding news.</p>
              <div className="flex gap-2">
                <input className="flex-1 px-4 py-[.55rem] rounded-full border border-surface-muted text-[.82rem] outline-none focus:border-brand-500 transition-colors bg-white shadow-inner" type="email" placeholder="Enter email" />
                <button className="bg-brand-500 text-white px-[1.1rem] py-[.55rem] rounded-full text-[.82rem] font-bold hover:bg-brand-600 transition-colors">Join</button>
              </div>
            </div>
          </div>
          <div className="border-t border-surface-muted pt-6 flex flex-wrap justify-between items-center gap-3 text-ink-faint text-[.78rem]">
            <div>© 2024 PureRaise Protocol. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="text-ink-faint hover:text-brand-500 no-underline transition-colors">Privacy Policy</a>
              <a href="#" className="text-ink-faint hover:text-brand-500 no-underline transition-colors">Terms of Service</a>
              <a href="#" className="text-ink-faint hover:text-brand-500 no-underline transition-colors">Cookie Policy</a>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> Powered by Web3
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const ComparisonRow = ({ bad, good }: { bad: string; good: string }) => (
  <tr className="hover:bg-surface/50 group transition-colors">
    <td className="p-[.85rem_.75rem] border-b border-surface-muted/50 align-middle">
      <div className="text-ink-mid text-[.85rem] flex items-start gap-2">
        <span className="text-red-500 font-bold shrink-0">✕</span> {bad}
      </div>
    </td>
    <td className="p-[.85rem_.75rem] border-b border-surface-muted/50 align-middle">
      <div className="text-brand-700 font-bold text-[.85rem] flex items-start gap-2 border-l border-surface-muted pl-4">
        <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-[2px]" /> {good}
      </div>
    </td>
  </tr>
);

export default LandingPage;