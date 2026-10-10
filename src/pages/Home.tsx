import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Star, CheckCircle, ChevronDown, ChevronUp,
  Zap, Users, Shield, Clock, TrendingUp, Award, Play, Quote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { creators, services, categories, testimonials, platformStats, aiTemplates } from '../data/mockData';

const faqs = [
  { q:'How does the AI Creator Match work?', a:'Our AI analyzes your project requirements, budget, and timeline, then matches you with creators whose skills, style, and availability align perfectly. It looks at 20+ factors including past performance, response rate, and portfolio quality.' },
  { q:'Is SynapseAI\'s AI content free to use?', a:'The AI Studio tools offer a generous free tier with 10 generations per day. Premium plans unlock unlimited generations, advanced models, and team collaboration features.' },
  { q:'How are creators vetted?', a:'Every creator goes through identity verification, portfolio review, and a test project assessment. We also monitor ongoing performance metrics including completion rate, response time, and client satisfaction.' },
  { q:'What payment methods do you accept?', a:'We accept all major credit cards, PayPal, Stripe, bank transfers, and cryptocurrency. All payments are held in escrow and released only when you approve the work.' },
  { q:'Can I try a creator before committing to a large project?', a:'Absolutely! You can start with a small test project or order a Basic package to evaluate a creator\'s work quality before investing in larger projects.' },
];

function StarRating({ rating }: { rating:number }) {
  return (
    <div className="stars" style={{ fontSize:12 }}>
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={12} fill={i<=Math.floor(rating)?'currentColor':'none'} style={{ opacity:i<=Math.floor(rating)?1:.3 }}/>
      ))}
    </div>
  );
}

export default function Home() {
  const { setAuthView, addToast, favorites, toggleFav } = useApp();
  const [searchQ, setSearchQ] = useState('');
  const [openFaq, setOpenFaq] = useState<number|null>(null);

  return (
    <div style={{ paddingTop:70 }}>

      {/* ── HERO ── */}
      <section style={{ padding:'100px 0 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, left:-100, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.22) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:100, right:-150, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.16) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-50, left:'40%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%)', pointerEvents:'none' }}/>

        <div className="container" style={{ position:'relative' }}>
          <div className="hero-panel">
            <div className="hero-panel-inner" style={{ textAlign:'center' }}>
              <div className="hero-badges">
                <div className="hero-badge"><Zap size={12} color="var(--purple)" fill="var(--purple)"/>AI-Powered Creator Marketplace</div>
                <div className="hero-badge"><Shield size={12} color="var(--green)"/>Verified talent</div>
              </div>

              <h1 style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:900, lineHeight:1.02, marginBottom:24, maxWidth:930, margin:'0 auto 24px' }}>
                Create, Collaborate &{' '}
                <span className="gradient-text">Scale</span>{' '}
                with AI
              </h1>

              <p style={{ fontSize:'clamp(15px,2vw,19px)', color:'var(--text-2)', maxWidth:680, margin:'0 auto 32px', lineHeight:1.7 }}>
                The world’s most advanced creator network for brands, studios, and founders who want premium content, AI-assisted execution, and faster growth from a single platform.
              </p>

              <div style={{ maxWidth:680, margin:'0 auto 32px', position:'relative' }}>
                <div style={{ display:'flex', background:'rgba(10,12,20,.9)', border:'1px solid rgba(139,92,246,.25)', borderRadius:16, overflow:'hidden', boxShadow:'0 22px 48px rgba(76,29,149,.18)' }}>
                  <Search size={16} color="var(--text-3)" style={{ margin:'0 0 0 18px', alignSelf:'center', flexShrink:0 }}/>
                  <input
                    value={searchQ}
                    onChange={e=>setSearchQ(e.target.value)}
                    placeholder="Search creators, services, or AI tools..."
                    style={{ flex:1, padding:'16px 14px', background:'transparent', border:'none', outline:'none', fontSize:15, color:'var(--text-1)' }}
                    onKeyDown={e=>e.key==='Enter'&&addToast('info',`Searching for "${searchQ}"`)}
                  />
                  <button className="btn btn-primary" style={{ margin:6, borderRadius:12, padding:'10px 22px' }} onClick={()=>addToast('info',`Searching for "${searchQ}"`)}>
                    Search
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
                <Link to="/ai-studio" className="btn btn-primary btn-xl" style={{ gap:8 }}>
                  <Sparkles size={18}/>Start Creating
                </Link>
                <Link to="/creators" className="btn btn-secondary btn-xl" style={{ gap:8 }}>
                  <Users size={18}/>Find a Creator
                </Link>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, flexWrap:'wrap', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:-8 }}>
                  {creators.slice(0,5).map((c,i)=>(
                    <div key={c.id} style={{ width:34, height:34, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white', border:'2px solid rgba(5,5,8,.9)', marginLeft:i>0?-10:0 }}>{c.initials}</div>
                  ))}
                </div>
                <div style={{ fontSize:13, color:'var(--text-2)' }}>
                  <span style={{ fontWeight:700, color:'var(--text-1)' }}>24,800+</span> creators • 
                  <span style={{ fontWeight:700, color:'var(--text-1)' }}> 98.4%</span> satisfaction rate
                </div>
                <div style={{ display:'flex', gap:2, alignItems:'center' }}>
                  {[1,2,3,4,5].map(i=><Star key={i} size={14} fill="var(--orange)" color="var(--orange)"/>) }
                  <span style={{ fontSize:13, color:'var(--text-2)', marginLeft:4 }}>4.9/5 from 50K+ reviews</span>
                </div>
              </div>

              <div className="market-preview">
                <div className="preview-stack">
                  <div className="preview-header">
                    <div className="preview-dots"><span/><span/><span/></div>
                    <div className="premium-tag"><TrendingUp size={12}/>Live growth</div>
                  </div>
                  <div className="preview-grid">
                    <div className="preview-analytics">
                      <div style={{ fontSize:12, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.6px', fontWeight:700 }}>Campaign momentum</div>
                      <div style={{ fontSize:26, fontWeight:800, marginTop:10 }}>+284%</div>
                      <div className="chart-bars">
                        <span style={{ height:'44%' }}/>
                        <span style={{ height:'62%' }}/>
                        <span style={{ height:'52%' }}/>
                        <span style={{ height:'76%' }}/>
                        <span style={{ height:'88%' }}/>
                        <span style={{ height:'100%' }}/>
                      </div>
                    </div>
                    <div className="preview-project">
                      <div className="mini-row"><span style={{ fontSize:12, color:'var(--text-3)' }}>Top creator</span><span style={{ fontSize:11, fontWeight:700, color:'var(--text-1)' }}>Maya K.</span></div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                        <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>MK</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700 }}>Brand launch</div>
                          <div style={{ fontSize:11, color:'var(--text-3)' }}>4-day sprint</div>
                        </div>
                      </div>
                      <div className="mini-row"><span style={{ fontSize:12, color:'var(--text-3)' }}>Status</span><span style={{ fontSize:10, padding:'4px 8px', borderRadius:999, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', color:'#34d399', fontWeight:700 }}>On track</span></div>
                      <div className="mini-row"><span style={{ fontSize:12, color:'var(--text-3)' }}>Deliverables</span><span style={{ fontSize:12, fontWeight:700 }}>18 assets</span></div>
                    </div>
                  </div>
                </div>

                <div className="floating-card">
                  <div className="muted">Avg. project value</div>
                  <div className="value">$8.4K</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                    <span style={{ fontSize:11, color:'var(--text-3)' }}>This month</span>
                    <span className="spark"><TrendingUp size={11}/>+32.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:'40px 0', background:'var(--bg-secondary)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:20 }}>
            {[
              { n:`${(platformStats.creators/1000).toFixed(1)}K+`, l:'Elite Creators' },
              { n:`${(platformStats.services/1000).toFixed(0)}K+`, l:'Active Services' },
              { n:`${(platformStats.projects/1000).toFixed(0)}K+`, l:'Projects Completed' },
              { n:`${platformStats.countries}+`, l:'Countries' },
              { n:`${platformStats.satisfaction}%`, l:'Satisfaction Rate' },
              { n:`${platformStats.avgDelivery} days`, l:'Avg. Delivery' },
            ].map((s,i)=>(
              <div key={i} className="premium-card" style={{ textAlign:'center', padding:'20px 14px' }}>
                <div style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, marginBottom:4 }} className="gradient-text">{s.n}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="container">
          <div className="s-head">
            <div>
              <div className="section-tag"><Sparkles size={11}/>Categories</div>
              <h2 className="s-title">Explore by Category</h2>
              <p className="s-sub">From AI-enhanced blogs to viral social content — find your niche.</p>
            </div>
            <Link to="/explore" className="btn btn-secondary btn-sm">View all <ArrowRight size={13}/></Link>
          </div>
          <div className="grid-4">
            {categories.map(cat=>(
              <Link key={cat.id} to="/services" className="premium-card" style={{ display:'flex', flexDirection:'column', gap:12, padding:20, textDecoration:'none', color:'var(--text-1)', cursor:'pointer' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=cat.color+'60';(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow=`0 10px 28px ${cat.color}20`;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='none';}}
              >
                <div style={{ width:48, height:48, borderRadius:14, background:`${cat.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:`1px solid ${cat.color}30` }}>{cat.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{cat.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>{cat.count.toLocaleString()} services</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CREATORS ── */}
      <section className="section" style={{ background:'var(--bg-secondary)' }}>
        <div className="container">
          <div className="s-head">
            <div>
              <div className="section-tag"><Award size={11}/>Top Talent</div>
              <h2 className="s-title">Featured Creators</h2>
              <p className="s-sub">Handpicked elite creators with proven track records.</p>
            </div>
            <Link to="/creators" className="btn btn-secondary btn-sm">Browse all <ArrowRight size={13}/></Link>
          </div>
          <div className="grid-4">
            {creators.slice(0,8).map(c=>(
              <div key={c.id} className="creator-card">
                {/* Cover */}
                <div style={{ height:80, background:`linear-gradient(135deg,${c.color}40,${c.color}20)`, position:'relative' }}>
                  <div style={{ position:'absolute', bottom:-24, left:16, width:52, height:52, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'white', border:'3px solid var(--bg-card)' }}>{c.initials}</div>
                  <button
                    onClick={()=>toggleFav(c.id)}
                    style={{ position:'absolute', top:8, right:8, width:28, height:28, borderRadius:7, background:'rgba(0,0,0,.3)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
                  >
                    <Star size={13} fill={favorites.includes(c.id)?'var(--orange)':'none'} color={favorites.includes(c.id)?'var(--orange)':'white'}/>
                  </button>
                </div>
                <div style={{ padding:'32px 16px 16px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>{c.name}</span>
                        {c.verified && <CheckCircle size={14} color="var(--blue)" fill="var(--blue)"/>}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-3)' }}>{c.username}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:99, background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}30` }}>{c.level}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
                    <StarRating rating={c.rating}/>
                    <span style={{ fontSize:12, fontWeight:600 }}>{c.rating}</span>
                    <span style={{ fontSize:11, color:'var(--text-3)' }}>({c.reviews})</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                    {c.skills.slice(0,3).map(s=>(
                      <span key={s} style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:'var(--bg-glass)', border:'1px solid var(--border)', color:'var(--text-2)' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, fontSize:12, color:'var(--text-3)' }}>
                    <span>💼 {c.jobs} jobs</span>
                    <span>⏱ {c.responseTime}</span>
                  </div>
                  <div className="divider" style={{ margin:'10px 0' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <span style={{ fontSize:11, color:'var(--text-3)' }}>Starting at</span>
                      <div style={{ fontWeight:700, fontSize:16 }}>${c.price}</div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <Link to={`/creator/${c.id}`} className="btn btn-secondary btn-sm" style={{ fontSize:11 }}>View</Link>
                      <button className="btn btn-primary btn-sm" style={{ fontSize:11 }} onClick={()=>addToast('success',`Hiring ${c.name}... Redirecting to checkout.`)}>Hire</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR SERVICES ── */}
      <section className="section">
        <div className="container">
          <div className="s-head">
            <div>
              <div className="section-tag"><TrendingUp size={11}/>Trending</div>
              <h2 className="s-title">Popular Services</h2>
              <p className="s-sub">The most in-demand gigs on the platform right now.</p>
            </div>
            <Link to="/services" className="btn btn-secondary btn-sm">See all <ArrowRight size={13}/></Link>
          </div>
          <div className="grid-3">
            {services.map(s=>(
              <div key={s.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', transition:'all .3s ease', cursor:'pointer' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-accent)';(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow='var(--shadow)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='none';}}
              >
                <div style={{ height:140, background:`linear-gradient(135deg,${s.creator.color}30,rgba(59,130,246,.1))`, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ fontSize:48 }}>{s.creator.initials[0]}</div>
                  </div>
                  {s.featured && <span style={{ position:'absolute', top:10, left:10, padding:'3px 10px', borderRadius:99, background:'rgba(139,92,246,.9)', fontSize:10, fontWeight:700, color:'white', letterSpacing:.5 }}>FEATURED</span>}
                  <span style={{ position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:99, background:'rgba(0,0,0,.5)', fontSize:10, color:'white', backdropFilter:'blur(4px)' }}>{s.queue} in queue</span>
                </div>
                <div style={{ padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:s.creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0 }}>{s.creator.initials}</div>
                    <span style={{ fontSize:12, color:'var(--text-2)' }}>{s.creator.name}</span>
                    {s.creator.verified && <CheckCircle size={11} color="var(--blue)" fill="var(--blue)"/>}
                  </div>
                  <h3 style={{ fontSize:14, fontWeight:600, marginBottom:8, lineHeight:1.3 }}>{s.title}</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                    <StarRating rating={s.rating}/>
                    <span style={{ fontSize:12, fontWeight:600 }}>{s.rating}</span>
                    <span style={{ fontSize:11, color:'var(--text-3)' }}>({s.reviews})</span>
                  </div>
                  <div className="divider" style={{ margin:'10px 0' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <span style={{ fontSize:11, color:'var(--text-3)' }}>Starting at</span>
                      <div style={{ fontWeight:700, fontSize:16 }}>${s.packages.basic.price}</div>
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      <Link to="/services" className="btn btn-secondary btn-sm" style={{ fontSize:11 }}>Details</Link>
                      <button className="btn btn-primary btn-sm" style={{ fontSize:11 }} onClick={()=>addToast('success','Added to cart!')}>Order</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI TOOLS PREVIEW ── */}
      <section className="section" style={{ background:'var(--bg-secondary)' }}>
        <div className="container">
          <div className="s-head">
            <div>
              <div className="section-tag"><Zap size={11}/>AI Studio</div>
              <h2 className="s-title">AI Content Tools</h2>
              <p className="s-sub">20+ AI tools to generate, rewrite, and optimize any type of content.</p>
            </div>
            <Link to="/ai-studio" className="btn btn-primary btn-sm"><Sparkles size={13}/>Open AI Studio</Link>
          </div>
          <div className="grid-4">
            {[
              { n:'Blog Generator', icon:'📝', c:'#8B5CF6', stat:'142K articles generated' },
              { n:'Email Generator', icon:'📧', c:'#10B981', stat:'98K emails written' },
              { n:'Social Media', icon:'📱', c:'#EC4899', stat:'320K posts created' },
              { n:'YouTube Scripts', icon:'🎬', c:'#EF4444', stat:'54K scripts written' },
              { n:'Ad Copy', icon:'📣', c:'#F59E0B', stat:'87K ads optimized' },
              { n:'SEO Content', icon:'🔍', c:'#3B82F6', stat:'76K pages optimized' },
              { n:'Translator', icon:'🌐', c:'#06B6D4', stat:'45 languages supported' },
              { n:'Summarizer', icon:'📋', c:'#8B5CF6', stat:'230K docs summarized' },
            ].map((t,i)=>(
              <Link key={i} to="/ai-studio" style={{ display:'flex', gap:12, padding:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, textDecoration:'none', color:'var(--text-1)', transition:'all .3s ease', alignItems:'center' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=t.c+'50';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';}}
              >
                <div style={{ width:42, height:42, borderRadius:11, background:`${t.c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{t.n}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{t.stat}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container" style={{ textAlign:'center' }}>
          <div className="section-tag" style={{ margin:'0 auto 12px' }}><Play size={11}/>How It Works</div>
          <h2 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:700, marginBottom:14 }}>Get started in 3 simple steps</h2>
          <p style={{ color:'var(--text-2)', fontSize:15, maxWidth:500, margin:'0 auto 56px' }}>From project idea to finished content — faster than ever before.</p>
          <div className="grid-3" style={{ textAlign:'left' }}>
            {[
              { step:'01', icon:<Search size={22}/>, color:'#8B5CF6', title:'Discover', desc:'Browse 24,800+ verified creators or use our AI Studio to generate content instantly. Search by skill, budget, or category.' },
              { step:'02', icon:<Sparkles size={22}/>, color:'#3B82F6', title:'Create & Match', desc:'Let our AI match you with the perfect creator for your project, or use AI tools to draft content and have creators refine it.' },
              { step:'03', icon:<CheckCircle size={22}/>, color:'#10B981', title:'Collaborate & Deliver', desc:'Work together in our project workspace with milestones, file sharing, chat, and payment protection built in.' },
            ].map((s,i)=>(
              <div key={i} style={{ padding:28, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-12, right:-12, fontSize:80, fontWeight:900, color:`${s.color}08`, fontFamily:'Space Grotesk', lineHeight:1 }}>{s.step}</div>
                <div style={{ width:50, height:50, borderRadius:14, background:`${s.color}18`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" style={{ background:'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-tag" style={{ margin:'0 auto 12px' }}><Star size={11}/>Success Stories</div>
            <h2 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:700, marginBottom:10 }}>What our clients say</h2>
            <p style={{ color:'var(--text-2)', fontSize:15 }}>Join thousands of businesses growing with SynapseAI creators.</p>
          </div>
          <div className="grid-3">
            {testimonials.slice(0,3).map(t=>(
              <div key={t.id} style={{ padding:24, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:14 }}>
                  {[1,2,3,4,5].map(i=><Star key={i} size={14} fill="var(--orange)" color="var(--orange)"/>)}
                </div>
                <Quote size={20} color="var(--purple)" style={{ opacity:.4, marginBottom:10 }}/>
                <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.7, marginBottom:18 }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft:'auto', padding:'3px 10px', borderRadius:99, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', fontSize:10, fontWeight:600, color:'var(--green)' }}>{t.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section">
        <div className="container" style={{ maxWidth:760 }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div className="section-tag" style={{ margin:'0 auto 12px' }}>FAQ</div>
            <h2 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:700, marginBottom:10 }}>Frequently Asked Questions</h2>
            <p style={{ color:'var(--text-2)', fontSize:14 }}>Everything you need to know about SynapseAI.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {faqs.map((faq,i)=>(
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'16px 20px', background:'transparent', border:'none', cursor:'pointer', color:'var(--text-1)', fontSize:14, fontWeight:600, textAlign:'left', gap:12 }}>
                  {faq.q}
                  {openFaq===i?<ChevronUp size={16} color="var(--purple)"/>:<ChevronDown size={16} color="var(--text-3)"/>}
                </button>
                {openFaq===i && <div style={{ padding:'0 20px 16px', fontSize:13, color:'var(--text-2)', lineHeight:1.7 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:'80px 0', background:'linear-gradient(135deg,rgba(139,92,246,.12),rgba(59,130,246,.08))', borderTop:'1px solid var(--border)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 32px rgba(139,92,246,.4)' }}>
            <Zap size={28} color="white" fill="white"/>
          </div>
          <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, marginBottom:14 }}>
            Ready to <span className="gradient-text">create something great?</span>
          </h2>
          <p style={{ fontSize:16, color:'var(--text-2)', maxWidth:480, margin:'0 auto 36px' }}>
            Join 24,800+ creators and 50,000+ businesses already using SynapseAI to produce extraordinary content.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary btn-xl" onClick={()=>setAuthView('login')}>
              <Sparkles size={18}/>Start for Free
            </button>
            <Link to="/creators" className="btn btn-secondary btn-xl">
              Find a Creator <ArrowRight size={18}/>
            </Link>
          </div>
          <p style={{ fontSize:12, color:'var(--text-3)', marginTop:16 }}>No credit card required · Free tier available · Cancel anytime</p>
        </div>
      </section>

    </div>
  );
}
