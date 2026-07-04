import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Globe, Activity, Users, Wallet, Target, Rocket, Coins, CheckCircle2,
  ArrowRight, LogOut, TrendingUp, Clock, Zap, Lock, AlertCircle
} from 'lucide-react';

import FeatureCard from '../components/FeatureCard';
import StepCard from '../components/StepCard';
import CampaignCard from '../components/CampaignCard';
import { useAuth } from '../context/AuthContext';
import { usePublicCampaigns } from '../hooks/usePublicCampaigns';

const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { campaigns, loading: campaignsLoading, error: campaignsError } = usePublicCampaigns(3);

  // Helper to determine dashboard url based on user role
  const getDashboardUrl = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'projectOwner':
        return '/campaign-owner/dashboard';
      case 'contributor':
      default:
        return '/contributor/dashboard';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
            <li><a href="#" className="text-ink-muted hover:text-brand-500 font-medium text-[0.875rem] transition-colors">About Us</a></li>
          </ul>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'projectOwner' && (
                  <Link to="/campaign-owner/create" className="bg-brand-500 text-white px-[1.2rem] py-[0.55rem] rounded-full text-[0.82rem] font-semibold transition-all hover:bg-brand-600 hover:-translate-y-[1px]">
                    Create Campaign
                  </Link>
                )}
                <Link to={getDashboardUrl()} className="text-[0.875rem] font-medium text-ink hover:text-brand-500 transition-colors no-underline">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[0.875rem] font-medium text-ink-muted hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[0.875rem] font-medium text-ink hover:text-brand-500 transition-colors no-underline">Login</Link>
                <Link to="/register" className="bg-brand-500 text-white px-[1.4rem] py-[0.6rem] rounded-full text-[0.875rem] font-semibold transition-all hover:bg-brand-600 hover:-translate-y-[1px]">
                  Start a Campaign
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-[120px] pb-[140px] px-8 max-w-[1000px] mx-auto flex flex-col items-center text-center relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-100/40 blur-[140px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-brand-200/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-600 text-[0.78rem] font-semibold px-4 py-[0.4rem] rounded-full mb-7 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          Blockchain-Powered Crowdfunding
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.1] tracking-[-0.03em] text-ink mb-6 max-w-[850px]">
          Fund Your Vision.<br />
          <span className="text-brand-500">Transparently. Trustlessly.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-ink-muted text-[clamp(1rem,1.8vw,1.15rem)] leading-[1.75] max-w-[640px] mb-10">
          PureRaise is a decentralized crowdfunding platform where creators launch campaigns and backers fund milestones — all secured by smart contracts on the blockchain. <strong className="text-ink font-semibold">No middlemen. No hidden fees. No trust required.</strong>
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          <Link
            to="/register"
            className="bg-brand-500 text-white px-8 py-[0.9rem] rounded-full font-display font-bold text-[0.95rem] shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-[2px] hover:shadow-brand-500/50 flex items-center gap-2"
          >
            <Rocket size={17} />
            Start a Campaign
          </Link>
          <a
            href="#campaigns"
            className="bg-white border border-surface-muted text-ink px-8 py-[0.9rem] rounded-full font-semibold text-[0.95rem] shadow-sm transition-all hover:-translate-y-[1px] hover:border-brand-300 flex items-center gap-2"
          >
            Explore Projects <ArrowRight size={16} />
          </a>
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap justify-center gap-6 text-ink-muted text-[0.82rem]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-500" />
            <span>Audited Smart Contracts</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-brand-500" />
            <span>Global & Borderless</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-brand-500" />
            <span>Crypto-Native Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-500" />
            <span>10,000+ Backers Worldwide</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white border-y border-surface-muted py-24 px-8">
        <div className="text-center max-w-[620px] mx-auto mb-14">
          <div className="text-[.72rem] font-bold tracking-[.12em] uppercase text-brand-500 mb-3">Why PureRaise</div>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-.02em] text-ink">The Future of Funding is On-Chain</h2>
          <p className="text-ink-muted mt-3 text-[1.02rem]">We've removed traditional barriers — giving you global reach, instant settlements, and absolute transparency via smart contracts.</p>
        </div>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={ShieldCheck}
            title="Transparent Transactions"
            desc="Every contribution is recorded on an immutable public ledger — no black boxes, no hidden movements of funds."
          />
          <FeatureCard
            icon={Target}
            title="Milestone-Based Release"
            desc="Funds unlock automatically via smart contracts only when your community votes that a project milestone is complete."
          />
          <FeatureCard
            icon={Lock}
            title="No Middlemen"
            desc="Operating peer-to-peer on the blockchain removes gatekeeper fees, platform cuts, and approval delays entirely."
          />
          <FeatureCard
            icon={Globe}
            title="Global Reach"
            desc="Campaigns are instantly visible to a borderless community of backers — anyone with a crypto wallet can contribute."
          />
          <FeatureCard
            icon={Activity}
            title="Real-Time Tracking"
            desc="Backers get granular, live insights into fund allocation, milestone progress, and project momentum at all times."
          />
          <FeatureCard
            icon={Zap}
            title="Instant Settlements"
            desc="No waiting for bank transfers or payment processors. Crypto contributions reach your wallet the moment they're made."
          />
        </div>
      </section>

      {/* STEPS */}
      <section id="how-it-works" className="py-24 px-8 max-w-[1200px] mx-auto text-center">
        <div className="text-[.72rem] font-bold tracking-[.12em] uppercase text-brand-500 mb-2">Process</div>
        <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-ink mb-2">Launch in 4 Simple Steps</h2>
        <p className="text-ink-muted text-[0.97rem] max-w-[520px] mx-auto mb-12">
          From idea to fully funded project — PureRaise makes the path simple, transparent, and fast.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-[1.5px] bg-gradient-to-r from-brand-100 via-brand-300 to-brand-100"></div>
          <StepCard num="01" icon={Wallet} title="Connect Wallet" desc="Link your MetaMask or any Web3 wallet to authenticate and transact on the platform." />
          <StepCard num="02" icon={Target} title="Define Milestones" desc="Break your project into clear, verifiable stages. Each milestone unlocks a portion of the funds." />
          <StepCard num="03" icon={Users} title="Get Funded" desc="Share your campaign globally. Backers contribute ETH directly — no credit cards, no delays." />
          <StepCard num="04" icon={Rocket} title="Auto-Release" desc="Smart contracts release milestone funds automatically once your community votes approval." />
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section id="campaigns" className="bg-surface-muted/30 border-y border-surface-muted py-24 px-8">
        <div className="max-w-[1200px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="text-[.72rem] font-bold tracking-[.12em] uppercase text-brand-500 mb-2">Live on PureRaise</div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-ink mb-2">Featured Campaigns</h2>
            <p className="text-ink-muted max-w-[480px] text-[0.95rem]">
              Real projects, real creators, real blockchain accountability. Every campaign below is
              milestone-locked and community-verified.
            </p>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-[6px] text-brand-500 font-semibold text-[0.875rem] no-underline whitespace-nowrap group"
          >
            View all campaigns <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Campaign Grid */}
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-7">

          {/* ── Loading skeletons ── */}
          {campaignsLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-surface-muted animate-pulse">
              <div className="h-[200px] bg-slate-100 m-2 rounded-[18px]" />
              <div className="p-6 pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100" />
                  <div className="h-3 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="h-4 bg-slate-100 rounded-full w-full" />
                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                <div className="mt-4 h-2 bg-slate-100 rounded-full w-full" />
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-slate-100 rounded-full" />
                  <div className="h-3 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl mt-2" />
              </div>
            </div>
          ))}

          {/* ── Real campaign data ── */}
          {!campaignsLoading && campaigns.length > 0 && campaigns.map((c) => {
            const totalContributed = c.contributions?.reduce(
              (sum, contrib) => sum + parseFloat(contrib.amountEth || '0'), 0
            ) ?? 0;
            const raisedEth = totalContributed.toFixed(3);
            const targetEth = c.targetFunding;
            const progress = targetEth > 0
              ? Math.min(100, Math.round((totalContributed / targetEth) * 100))
              : 0;

            return (
              <CampaignCard
                key={c.id}
                tag={c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                src={c.coverImage}
                author={c.owner?.name ?? 'Campaign Creator'}
                authorSeed={c.id}
                title={c.title}
                raised={`${raisedEth} ETH`}
                target={`${targetEth} ETH`}
                progress={progress}
              />
            );
          })}

          {/* ── Offline / empty fallback ── */}
          {!campaignsLoading && (campaigns.length === 0 || campaignsError) && (
            <>
              {campaignsError === 'offline' && (
                <div className="lg:col-span-3 flex flex-col items-center gap-3 py-8 text-ink-muted text-[0.87rem]">
                  <AlertCircle size={22} className="text-amber-400" />
                  <span>Backend offline — showing sample campaigns. Start the backend to see real data.</span>
                </div>
              )}
              <CampaignCard
                tag="DeFi Protocol"
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800"
                author="Chain Capital Labs"
                authorSeed="ChainCapitalLabs"
                title="Open-Source DeFi Lending Protocol for Emerging Markets"
                raised="0.92 ETH"
                target="1.2 ETH"
                progress={77}
              />
              <CampaignCard
                tag="DAO Tooling"
                src="https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&q=80&w=800"
                author="Governance Guild"
                authorSeed="GovernanceGuild"
                title="DAO Voting Dashboard with On-Chain Proposal Execution"
                raised="0.38 ETH"
                target="0.6 ETH"
                progress={63}
              />
              <CampaignCard
                tag="Creator Economy"
                src="https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80&w=800"
                author="Pixel Forge Studio"
                authorSeed="PixelForgeStudio"
                title="NFT-Gated Membership Platform for Independent Artists"
                raised="0.19 ETH"
                target="0.5 ETH"
                progress={38}
              />
            </>
          )}
        </div>

        {/* Bottom trust note */}
        <div className="max-w-[1200px] mx-auto mt-10 flex flex-wrap items-center justify-center gap-6 text-ink-muted text-[0.82rem]">
          <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-green-500" /> All funds locked in audited smart contracts</div>
          <div className="flex items-center gap-2"><Clock size={15} className="text-brand-500" /> Milestone release requires community vote</div>
          <div className="flex items-center gap-2"><TrendingUp size={15} className="text-brand-500" /> Live progress updates on-chain</div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="bg-white border border-surface-muted rounded-[28px] p-12 grid md:grid-cols-3 gap-10 text-center shadow-sm shadow-brand-500/5">
          <div className="md:border-r border-surface-muted last:border-0 pr-4">
            <div className="font-display text-[2.75rem] font-extrabold text-brand-500 mb-1">100%</div>
            <div className="font-bold text-[1rem] mb-1 text-ink">Funds On-Chain</div>
            <div className="text-[.82rem] text-ink-muted">Every ETH contribution is locked in a verified smart contract — never held by PureRaise.</div>
          </div>
          <div className="md:border-r border-surface-muted last:border-0 px-4">
            <div className="font-display text-[2.75rem] font-extrabold text-brand-500 mb-1">24/7</div>
            <div className="font-bold text-[1rem] mb-1 text-ink">Always Available</div>
            <div className="text-[.82rem] text-ink-muted">Decentralized infrastructure — no downtime, no maintenance windows, no gatekeepers.</div>
          </div>
          <div className="last:border-0 pl-4">
            <div className="font-display text-[2.75rem] font-extrabold text-brand-500 mb-1">Zero</div>
            <div className="font-bold text-[1rem] mb-1 text-ink">Platform Fees</div>
            <div className="text-[.82rem] text-ink-muted">PureRaise takes no percentage cut. You keep what your backers pledge, minus only gas.</div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="why-us" className="py-24 px-8 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <div className="text-[.72rem] font-bold tracking-[.12em] uppercase text-brand-500 mb-3">Why switch?</div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-ink mb-4">PureRaise vs. Traditional Crowdfunding</h2>
            <p className="text-ink-muted mb-6 text-[.97rem] leading-[1.75]">
              Platforms like Kickstarter and GoFundMe take 5–10% of every pledge, hold funds centrally,
              and offer zero post-funding accountability. PureRaise is built differently — from the ground up
              on trustless, programmable smart contracts.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-[0.75rem] rounded-full font-bold text-[0.875rem] no-underline hover:bg-brand-600 transition-all hover:-translate-y-[1px] shadow-md shadow-brand-500/25">
              Get Started Free <ArrowRight size={16} />
            </Link>
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
                <ComparisonRow bad="5–10% platform & payment fees" good="Near-zero gas fees only" />
                <ComparisonRow bad="Funds held by a central company" good="Smart contract self-custody" />
                <ComparisonRow bad="No milestone accountability" good="Milestone-locked fund release" />
                <ComparisonRow bad="Restricted to supported countries" good="Borderless crypto contributions" />
                <ComparisonRow bad="Opaque fund usage post-campaign" good="Verifiable on-chain spending" />
                <ComparisonRow bad="Refunds require manual review" good="Automatic refund if goal isn't met" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="bg-brand-500 rounded-[2.5rem] py-20 px-8 text-center relative overflow-hidden shadow-panel">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full pointer-events-none" />
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-[0.78rem] font-semibold px-4 py-[0.4rem] rounded-full mb-6 relative z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
            Join the Decentralized Revolution
          </div>
          <h2 className="font-display text-white text-[clamp(2rem,3.5vw,3rem)] font-extrabold mb-4 relative z-10">Launch your idea without limits.</h2>
          <p className="text-white/75 text-[1.05rem] mb-10 max-w-[600px] mx-auto relative z-10">
            Join thousands of creators and backers building a fairer funding ecosystem — powered by code, not corporations.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link to="/register" className="bg-white text-brand-600 px-8 py-[0.85rem] rounded-full font-display font-extrabold text-[0.95rem] shadow-lg transition-transform hover:-translate-y-[2px] no-underline">
              Create Your Campaign
            </Link>
            <a href="#campaigns" className="bg-brand-700/50 text-white border border-white/20 px-8 py-[0.85rem] rounded-full font-semibold text-[0.95rem] backdrop-blur hover:bg-brand-700/80 transition-colors no-underline">
              Explore Live Projects
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-surface-muted pt-16 pb-8 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-[10px] mb-3 no-underline">
                <div className="w-[34px] h-[34px] rounded-lg bg-brand-500 text-white font-display font-extrabold text-[18px] flex items-center justify-center">P</div>
                <span className="font-display font-bold text-[1.05rem] text-ink">PureRaise</span>
              </Link>
              <p className="text-ink-muted text-[.85rem] leading-[1.7] max-w-[260px]">
                The decentralized crowdfunding platform empowering creators globally through blockchain technology and smart contracts.
              </p>
              <div className="flex gap-3 mt-5">
                {['𝕏', 'in', 'gh', 'dc'].map((s, i) => (
                  <div key={i} className="w-[34px] h-[34px] rounded-full bg-surface border border-surface-muted flex items-center justify-center text-ink-muted text-[.8rem] font-semibold cursor-pointer hover:text-brand-500 hover:border-brand-500/50 transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {/* Platform links */}
            <div>
              <h4 className="font-display font-bold text-[.9rem] mb-5 text-ink tracking-tight">Platform</h4>
              <ul className="list-none space-y-[.65rem] p-0 m-0">
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Home</a></li>
                <li><a href="#campaigns" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Explore Campaigns</a></li>
                <li><a href="#how-it-works" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">How it Works</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Campaign Guidelines</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Smart Contract Audit</a></li>
              </ul>
            </div>
            {/* Company links */}
            <div>
              <h4 className="font-display font-bold text-[.9rem] mb-5 text-ink tracking-tight">Company</h4>
              <ul className="list-none space-y-[.65rem] p-0 m-0">
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">About Us</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Blog</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-ink-muted text-[.85rem] hover:text-brand-500 no-underline transition-colors">Contact</a></li>
              </ul>
            </div>
            {/* Newsletter */}
            <div>
              <h4 className="font-display font-bold text-[.9rem] mb-5 text-ink tracking-tight">Stay Updated</h4>
              <p className="text-ink-muted text-[.82rem] mb-3">Get the latest on new campaigns and platform updates.</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-[.55rem] rounded-full border border-surface-muted text-[.82rem] outline-none focus:border-brand-500 transition-colors bg-white shadow-inner"
                  type="email"
                  placeholder="Enter email"
                />
                <button className="bg-brand-500 text-white px-[1.1rem] py-[.55rem] rounded-full text-[.82rem] font-bold hover:bg-brand-600 transition-colors cursor-pointer border-none">Join</button>
              </div>
              <p className="text-ink-faint text-[.75rem] mt-2">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
          <div className="border-t border-surface-muted pt-6 flex flex-wrap justify-between items-center gap-3 text-ink-faint text-[.78rem]">
            <div>© 2026 PureRaise Protocol. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="text-ink-faint hover:text-brand-500 no-underline transition-colors">Privacy Policy</a>
              <a href="#" className="text-ink-faint hover:text-brand-500 no-underline transition-colors">Terms of Service</a>
              <a href="#" className="text-ink-faint hover:text-brand-500 no-underline transition-colors">Cookie Policy</a>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Powered by Web3
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ─── SUBCOMPONENTS ─── */

const ComparisonRow = ({ bad, good }: { bad: string; good: string }) => (
  <tr className="hover:bg-surface/50 group transition-colors">
    <td className="p-[.85rem_.75rem] border-b border-surface-muted/50 align-middle">
      <div className="text-ink-mid text-[.85rem] flex items-start gap-2">
        <span className="text-red-500 font-bold shrink-0">✕</span>
        <span>{bad}</span>
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