import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, MessageSquare, Bookmark, Share2, Flag,
  MapPin, Clock, Award, Shield, Globe, ChevronRight, Heart, Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { creators, services, badges } from '../data/mockData';

export default function CreatorProfile() {
  const { id } = useParams();
  const { addToast, savedCreators, toggleSaved } = useApp();
  const creator = creators.find(c => c.id === id) || creators[0];
  const [tab, setTab] = useState('Overview');
  const [hireOpen, setHireOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [followed, setFollowed] = useState(false);
  const [imgOpen, setImgOpen] = useState<string|null>(null);

  const creatorServices = services.filter(s => s.creator.id === creator.id);
  const creatorBadges = badges.filter(b => creator.tags.some(t => t === b.name));

  const reviews = [
    { name:'David Park', init:'DP', color:'#8B5CF6', rating:5, text:'Absolutely incredible work. Delivered ahead of schedule and the quality exceeded my expectations.', date:'Oct 2026', project:'Blog Series (10 articles)' },
    { name:'Rachel Kim', init:'RK', color:'#EC4899', rating:5, text:'Best creator on the platform. Understands the brief immediately and nails the tone every time.', date:'Sep 2026', project:'Email Marketing Campaign' },
    { name:'James Mitchell', init:'JM', color:'#3B82F6', rating:5, text:'Third time working together. Consistent, reliable, and the ROI on the content has been exceptional.', date:'Sep 2026', project:'SEO Content Strategy' },
  ];

  const portfolioPreviews = [
    { type:'image', label:'Blog Series: AI Marketing', img:`https://picsum.photos/400/300?random=${creator.id}1` },
    { type:'image', label:'Email Campaign Design', img:`https://picsum.photos/400/300?random=${creator.id}2` },
    { type:'video', label:'YouTube Script Showcase', img:`https://picsum.photos/400/300?random=${creator.id}3` },
    { type:'image', label:'SEO Content Case Study', img:`https://picsum.photos/400/300?random=${creator.id}4` },
  ];

  return (
    <div style={{ paddingTop:70 }}>
      {/* Cover */}
      <div style={{ height:200, background:`linear-gradient(135deg,${creator.color}40,${creator.color}18,rgba(59,130,246,.1))`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle at 30% 50%, ${creator.color}30, transparent 60%)` }}/>
      </div>

      <div className="container" style={{ padding:'0 24px' }}>
        {/* Profile header */}
        <div style={{ display:'flex', gap:20, marginTop:-40, marginBottom:28, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ width:90, height:90, borderRadius:'50%', background:creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:700, color:'white', border:'4px solid var(--bg-primary)', flexShrink:0 }}>
            {creator.initials}
          </div>
          <div style={{ flex:1, paddingBottom:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <h1 style={{ fontSize:26, fontWeight:700 }}>{creator.name}</h1>
              {creator.verified && <CheckCircle size={20} color="var(--blue)" fill="var(--blue)"/>}
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:`${creator.color}18`, color:creator.color, border:`1px solid ${creator.color}30` }}>{creator.level}</span>
            </div>
            <div style={{ fontSize:14, color:'var(--text-2)', marginBottom:6 }}>{creator.username} · {creator.location}</div>
            <div style={{ display:'flex', gap:14, fontSize:13, color:'var(--text-2)', flexWrap:'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Star size={13} fill="var(--orange)" color="var(--orange)"/> {creator.rating} ({creator.reviews} reviews)</span>
              <span>💼 {creator.jobs} jobs completed</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={12}/>Responds {creator.responseTime}</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button className="btn btn-secondary btn-sm" style={{ gap:5 }} onClick={()=>{ setFollowed(!followed); addToast('success', followed?'Unfollowed':'Following '+creator.name+'!'); }}>
              <Heart size={13} fill={followed?'var(--pink)':'none'} color={followed?'var(--pink)':'currentColor'}/>
              {followed?'Following':'Follow'}
            </button>
            <button className="btn btn-secondary btn-sm" style={{ gap:5 }} onClick={()=>toggleSaved(creator.id)}>
              <Bookmark size={13} fill={savedCreators.includes(creator.id)?'var(--purple)':'none'} color={savedCreators.includes(creator.id)?'var(--purple)':'currentColor'}/>
              {savedCreators.includes(creator.id)?'Saved':'Save'}
            </button>
            <button className="btn btn-secondary btn-sm" style={{ gap:5 }} onClick={()=>{ addToast('info','Share link copied!'); }}><Share2 size={13}/>Share</button>
            <button className="btn btn-secondary btn-sm" style={{ gap:5 }} onClick={()=>setMsgOpen(true)}><MessageSquare size={13}/>Message</button>
            <button className="btn btn-primary" style={{ gap:5 }} onClick={()=>setHireOpen(true)}>🚀 Hire Now</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:28 }}>
          {/* Main */}
          <div>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom:24 }}>
              {['Overview','Portfolio','Services','Reviews'].map(t=>(
                <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}</button>
              ))}
            </div>

            {tab==='Overview' && (
              <>
                <div style={{ marginBottom:24, padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>About {creator.name}</h3>
                  <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.8 }}>{creator.bio}</p>
                </div>
                <div style={{ marginBottom:24, padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Skills & Expertise</h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {creator.skills.map(s=><span key={s} className="chip active" style={{ fontSize:12 }}>{s}</span>)}
                    {['Content Strategy','Brand Voice','SEO','Analytics','AI Tools'].map(s=><span key={s} className="chip" style={{ fontSize:12 }}>{s}</span>)}
                  </div>
                </div>
                {creatorBadges.length>0 && (
                  <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Achievements & Badges</h3>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                      {creatorBadges.map(b=>(
                        <div key={b.id} style={{ display:'flex', gap:10, padding:'10px 14px', borderRadius:10, background:`${b.color}12`, border:`1px solid ${b.color}25`, alignItems:'center' }}>
                          <span style={{ fontSize:20 }}>{b.icon}</span>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600, color:b.color }}>{b.name}</div>
                            <div style={{ fontSize:10, color:'var(--text-3)' }}>{b.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {tab==='Portfolio' && (
              <div className="grid-2" style={{ gap:14 }}>
                {portfolioPreviews.map((p,i)=>(
                  <div key={i} style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', cursor:'pointer', transition:'all .2s' }}
                    onClick={()=>setImgOpen(p.img)}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.01)';(e.currentTarget as HTMLElement).style.boxShadow='var(--shadow)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='none';}}
                  >
                    <div style={{ height:180, background:`linear-gradient(135deg,${creator.color}30,${creator.color}15)`, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {p.type==='video'
                        ? <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}><Play size={22} color="white" fill="white"/></div>
                        : <span style={{ fontSize:40, opacity:.4 }}>🖼️</span>
                      }
                      <div style={{ position:'absolute', top:8, right:8, padding:'2px 8px', borderRadius:99, background:'rgba(0,0,0,.5)', fontSize:9, color:'white' }}>{p.type}</div>
                    </div>
                    <div style={{ padding:'10px 12px', background:'var(--bg-card)' }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{p.label}</div>
                      <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text-3)', marginTop:4 }}>
                        <span>❤️ {Math.floor(Math.random()*200)+50}</span>
                        <span>🔖 {Math.floor(Math.random()*50)+10}</span>
                        <span>↗️ {Math.floor(Math.random()*30)+5}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==='Services' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {(creatorServices.length > 0 ? creatorServices : services.slice(0,2)).map(s=>(
                  <div key={s.id} style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, display:'flex', gap:16, alignItems:'center' }}>
                    <div style={{ width:56, height:56, borderRadius:12, background:`${creator.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📝</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{s.title}</div>
                      <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:6 }}>{s.desc}</div>
                      <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-3)' }}>
                        <span>⭐ {s.rating}</span>
                        <span>({s.reviews} reviews)</span>
                        <span>⏱ {s.delivery}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontWeight:700, fontSize:18 }}>from ${s.packages.basic.price}</div>
                      <Link to="/services" className="btn btn-primary btn-sm" style={{ marginTop:8, fontSize:11 }}>Order</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==='Reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {reviews.map((r,i)=>(
                  <div key={i} style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                    <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', flexShrink:0 }}>{r.init}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{r.name}</div>
                        <div style={{ display:'flex', gap:3, marginTop:2 }}>
                          {[1,2,3,4,5].map(s=><Star key={s} size={11} fill="var(--orange)" color="var(--orange)"/>)}
                        </div>
                      </div>
                      <div style={{ marginLeft:'auto', fontSize:12, color:'var(--text-3)' }}>{r.date}</div>
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.7, marginBottom:8 }}>"{r.text}"</p>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>Project: {r.project}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Stats */}
            <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:14 }}>
              <h4 style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Creator Stats</h4>
              {[
                { l:'Response Rate', v:`${creator.responseRate}%`, color:'var(--green)' },
                { l:'Completion Rate', v:`${creator.completionRate}%`, color:'var(--green)' },
                { l:'Response Time', v:creator.responseTime, color:'var(--cyan)' },
                { l:'Jobs Completed', v:creator.jobs.toString(), color:'var(--purple)' },
                { l:'Member Since', v:new Date(creator.joined).getFullYear().toString(), color:'var(--blue)' },
              ].map((s,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                  <span style={{ color:'var(--text-2)' }}>{s.l}</span>
                  <span style={{ fontWeight:600, color:s.color }}>{s.v}</span>
                </div>
              ))}
            </div>

            {/* Availability */}
            <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:14 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:creator.availability==='Available'?'var(--green)':'var(--orange)' }}/>
                <span style={{ fontWeight:600, fontSize:13, color:creator.availability==='Available'?'var(--green)':'var(--orange)' }}>{creator.availability}</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>
                {creator.availability==='Available'?'Currently accepting new projects':'Currently busy, but you can still send a message'}
              </p>
            </div>

            {/* CTA */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="btn btn-primary" style={{ width:'100%', padding:13 }} onClick={()=>setHireOpen(true)}>🚀 Hire {creator.name.split(' ')[0]}</button>
              <button className="btn btn-secondary" style={{ width:'100%' }} onClick={()=>setMsgOpen(true)}><MessageSquare size={14}/>Send Message</button>
            </div>
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {imgOpen && (
        <div className="modal-backdrop" onClick={()=>setImgOpen(null)}>
          <div style={{ position:'relative', maxWidth:800, width:'100%' }}>
            <button onClick={()=>setImgOpen(null)} style={{ position:'absolute', top:-40, right:0, background:'rgba(255,255,255,.1)', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', color:'white', display:'flex', alignItems:'center', gap:5, fontSize:13 }}><X size={14}/>Close</button>
            <img src={imgOpen} alt="Portfolio" style={{ width:'100%', borderRadius:16, display:'block' }} onError={e=>(e.currentTarget.src='https://picsum.photos/800/500?random=99')}/>
          </div>
        </div>
      )}

      {/* Hire modal */}
      {hireOpen && (
        <div className="modal-backdrop" onClick={()=>setHireOpen(false)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()} style={{ padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Hire {creator.name.split(' ')[0]}</h2>
              <button className="btn-icon btn-icon-sm" onClick={()=>setHireOpen(false)}><X size={14}/></button>
            </div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <label className="form-label">Project title</label>
              <input className="input" placeholder="e.g. Blog series for SaaS product"/>
            </div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <label className="form-label">Budget</label>
              <input className="input" placeholder="e.g. $500" type="number"/>
            </div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <label className="form-label">Deadline</label>
              <input className="input" type="date"/>
            </div>
            <div className="form-group" style={{ marginBottom:18 }}>
              <label className="form-label">Brief</label>
              <textarea className="input" placeholder="Describe your project..." style={{ minHeight:80 }}/>
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={()=>{ addToast('success',`Hire request sent to ${creator.name}!`); setHireOpen(false); }}>Send Hire Request</button>
          </div>
        </div>
      )}

      {/* Message modal */}
      {msgOpen && (
        <div className="modal-backdrop" onClick={()=>setMsgOpen(false)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()} style={{ padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Message {creator.name.split(' ')[0]}</h2>
              <button className="btn-icon btn-icon-sm" onClick={()=>setMsgOpen(false)}><X size={14}/></button>
            </div>
            <textarea className="input" placeholder={`Hi ${creator.name.split(' ')[0]}, I'd like to discuss a project with you...`} value={msgText} onChange={e=>setMsgText(e.target.value)} style={{ minHeight:120, marginBottom:14 }}/>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={()=>{ addToast('success','Message sent!'); setMsgOpen(false); setMsgText(''); }}>Send Message</button>
          </div>
        </div>
      )}
    </div>
  );
}
