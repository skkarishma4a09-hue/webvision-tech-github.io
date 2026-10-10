import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Star, ArrowRight, Zap, Users, ShoppingBag,
  Award, Clock, Globe, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { creators, services, categories, aiTemplates, platformStats } from '../data/mockData';

export default function Explore() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<'all'|'creators'|'services'|'ai'|'templates'>('all');

  return (
    <div style={{ paddingTop:70 }}>
      {/* Hero */}
      <div style={{ padding:'50px 0 36px', background:'linear-gradient(135deg,rgba(139,92,246,.1),rgba(59,130,246,.06))', borderBottom:'1px solid var(--border)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <div className="section-tag" style={{ margin:'0 auto 14px' }}><Sparkles size={11}/>Explore SynapseAI</div>
          <h1 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:800, marginBottom:12 }}>
            Discover the Future of <span className="gradient-text">Content Creation</span>
          </h1>
          <p style={{ color:'var(--text-2)', fontSize:15, maxWidth:560, margin:'0 auto 28px' }}>
            Explore top creators, premium services, AI tools, and templates — all in one place.
          </p>
          <div className="tabs" style={{ display:'inline-flex' }}>
            {(['all','creators','services','ai','templates'] as const).map(t=>(
              <button key={t} className={`tab${tab===t?' active':''}`} style={{ textTransform:'capitalize', fontSize:13 }} onClick={()=>setTab(t)}>{t==='ai'?'AI Tools':t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px' }}>

        {/* Platform stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:40 }}>
          {[
            { icon:<Users size={18}/>, n:`${(platformStats.creators/1000).toFixed(1)}K+`, l:'Elite Creators', c:'var(--purple)' },
            { icon:<ShoppingBag size={18}/>, n:`${(platformStats.services/1000).toFixed(0)}K+`, l:'Active Services', c:'var(--blue)' },
            { icon:<Award size={18}/>, n:`${(platformStats.projects/1000).toFixed(0)}K+`, l:'Projects Done', c:'var(--green)' },
            { icon:<Globe size={18}/>, n:`${platformStats.countries}+`, l:'Countries', c:'var(--cyan)' },
            { icon:<Star size={18}/>, n:`${platformStats.satisfaction}%`, l:'Satisfaction', c:'var(--orange)' },
            { icon:<Clock size={18}/>, n:`${platformStats.avgDelivery}d`, l:'Avg. Delivery', c:'var(--pink)' },
          ].map((s,i)=>(
            <div key={i} style={{ padding:'16px 18px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${s.c}14`, color:s.c, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>{s.n}</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {(tab==='all'||tab==='creators') && (
          <div style={{ marginBottom:40 }}>
            <div className="s-head" style={{ marginBottom:20 }}>
              <div><div className="section-tag" style={{ marginBottom:6 }}><Award size={10}/>Featured</div><h2 className="s-title">Top Creators</h2></div>
              <Link to="/creators" className="btn btn-secondary btn-sm">View all <ArrowRight size={13}/></Link>
            </div>
            <div className="grid-4">
              {creators.slice(0,4).map(c=>(
                <div key={c.id} style={{ padding:18, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, transition:'all .3s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-accent)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';}}
                >
                  <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                    <div style={{ width:46, height:46, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'white', flexShrink:0 }}>{c.initials}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{c.name}</div>
                      <div style={{ fontSize:10, padding:'2px 7px', borderRadius:99, background:`${c.color}18`, color:c.color, display:'inline-block', marginTop:2 }}>{c.level}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:8, lineHeight:1.5 }}>{c.bio.slice(0,80)}...</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
                    <Star size={12} fill="var(--orange)" color="var(--orange)"/>
                    <span style={{ fontSize:12, fontWeight:600 }}>{c.rating}</span>
                    <span style={{ fontSize:11, color:'var(--text-3)' }}>· {c.jobs} jobs · ${c.price}/hr</span>
                  </div>
                  <Link to={`/creator/${c.id}`} className="btn btn-secondary btn-sm" style={{ width:'100%', fontSize:11, justifyContent:'center' }}>View Profile</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab==='all'||tab==='services') && (
          <div style={{ marginBottom:40 }}>
            <div className="s-head" style={{ marginBottom:20 }}>
              <div><div className="section-tag" style={{ marginBottom:6 }}><TrendingUp size={10}/>Trending</div><h2 className="s-title">Popular Services</h2></div>
              <Link to="/services" className="btn btn-secondary btn-sm">Browse all <ArrowRight size={13}/></Link>
            </div>
            <div className="grid-3">
              {services.slice(0,3).map(s=>(
                <div key={s.id} style={{ padding:18, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, transition:'all .3s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-accent)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';}}
                >
                  <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:s.creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>{s.creator.initials}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{s.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>by {s.creator.name}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
                    <Star size={12} fill="var(--orange)" color="var(--orange)"/>
                    <span style={{ fontSize:12, fontWeight:600 }}>{s.rating}</span>
                    <span style={{ fontSize:11, color:'var(--text-3)' }}>({s.reviews})</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>from ${s.packages.basic.price}</span>
                    <Link to="/services" className="btn btn-primary btn-sm" style={{ fontSize:11 }}>Order</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab==='all'||tab==='ai') && (
          <div style={{ marginBottom:40 }}>
            <div className="s-head" style={{ marginBottom:20 }}>
              <div><div className="section-tag" style={{ marginBottom:6 }}><Zap size={10}/>AI Tools</div><h2 className="s-title">AI Studio Tools</h2></div>
              <Link to="/ai-studio" className="btn btn-primary btn-sm"><Sparkles size={13}/>Open Studio</Link>
            </div>
            <div className="grid-4">
              {[
                { n:'Blog Generator', icon:'📝', c:'#8B5CF6', uses:'142K uses' },
                { n:'Email Writer', icon:'📧', c:'#10B981', uses:'98K uses' },
                { n:'Social Media', icon:'📱', c:'#EC4899', uses:'320K uses' },
                { n:'YouTube Scripts', icon:'🎬', c:'#EF4444', uses:'54K uses' },
                { n:'Ad Copy', icon:'📣', c:'#F59E0B', uses:'87K uses' },
                { n:'SEO Content', icon:'🔍', c:'#3B82F6', uses:'76K uses' },
                { n:'Translator', icon:'🌐', c:'#06B6D4', uses:'45 languages' },
                { n:'Summarizer', icon:'📋', c:'#8B5CF6', uses:'230K docs' },
              ].map((t,i)=>(
                <Link key={i} to="/ai-studio" style={{ display:'flex', gap:10, padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, textDecoration:'none', color:'var(--text-1)', transition:'all .2s', alignItems:'center' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=t.c+'44';(e.currentTarget as HTMLElement).style.transform='translateY(-1px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';}}
                >
                  <div style={{ width:38, height:38, borderRadius:10, background:`${t.c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12 }}>{t.n}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{t.uses}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(tab==='all'||tab==='templates') && (
          <div>
            <div className="s-head" style={{ marginBottom:20 }}>
              <div><div className="section-tag" style={{ marginBottom:6 }}><Cpu size={10}/>Templates</div><h2 className="s-title">Content Templates</h2></div>
            </div>
            <div className="grid-4">
              {aiTemplates.map(t=>(
                <div key={t.id} style={{ padding:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, cursor:'pointer', transition:'all .25s' }}
                  onClick={()=>addToast('info',`Template "${t.name}" loaded in AI Studio!`)}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-accent)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='none';}}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontWeight:600, fontSize:13 }}>{t.name}</span>
                    <span style={{ fontSize:9, padding:'2px 7px', borderRadius:99, background:'rgba(139,92,246,.12)', color:'var(--purple)', border:'1px solid rgba(139,92,246,.2)' }}>{t.category}</span>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:10, lineHeight:1.5 }}>{t.desc}</p>
                  <div style={{ display:'flex', gap:10, fontSize:11, color:'var(--text-3)' }}>
                    <span>⭐ {t.rating}</span>
                    <span>🔥 {t.uses.toLocaleString()} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
