import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, CheckCircle, MessageSquare, Bookmark, Sparkles,
  SlidersHorizontal, X, ChevronDown, Users, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface Creator {
  id: string; name: string; username: string; initials: string; color: string;
  verified: boolean; level: string; rating: number; reviews: number; jobs: number;
  price: number; responseTime: string; availability: string; location: string;
  skills: string[]; bio: string; matchScore?: number;
}

const palette = ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
const normalizeCreator = (c: Partial<Creator> & { id: string }): Creator => {
  const name = c.name || 'Creator';
  return {
    id: c.id, name, username: c.username || '',
    initials: c.initials || name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    color: c.color || palette[c.id.charCodeAt(0) % palette.length],
    verified: c.verified || false, level: c.level || 'Starter', rating: c.rating || 0,
    reviews: c.reviews || 0, jobs: c.jobs || 0, price: c.price || 0,
    responseTime: c.responseTime || 'Not specified', availability: c.availability || 'Available',
    location: c.location || 'Location not specified', skills: c.skills || [], bio: c.bio || '',
    matchScore: c.matchScore,
  };
};

const skillOptions = ['AI Content','SEO Writing','Blog Posts','Video Scripts','Email Marketing','Social Media','Technical Writing','Ad Copy','PR Writing','UX Writing'];
const levelOptions = ['Starter','Professional','Expert','Elite'];
const availOptions = ['Available','Busy','Away'];

export default function Creators() {
  const { addToast, setAuthView, user } = useApp();
  const navigate = useNavigate();
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [savedCreators, setSavedCreators] = useState<string[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [q, setQ] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [priceMax, setPriceMax] = useState(200);
  const [selSkills, setSelSkills] = useState<string[]>([]);
  const [selLevels, setSelLevels] = useState<string[]>([]);
  const [selAvail, setSelAvail] = useState<string[]>([]);
  const [aiMatchOpen, setAiMatchOpen] = useState(false);
  const [matchQ, setMatchQ] = useState('');
  const [matchBudget, setMatchBudget] = useState('');
  const [matchSkills, setMatchSkills] = useState('');
  const [matchDeadline, setMatchDeadline] = useState('');
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<Creator[]>([]);

  useEffect(() => {
    let current = true;
    setLoadingCreators(true);
    api.getCreators({ limit: '100', sort: sortBy })
      .then((response) => {
        if (current) setAllCreators((response.data.creators || []).map(normalizeCreator));
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load creators.');
      })
      .finally(() => { if (current) setLoadingCreators(false); });
    return () => { current = false; };
  }, [sortBy, addToast]);

  useEffect(() => {
    if (!user) {
      setSavedCreators([]);
      return;
    }
    let current = true;
    api.getFavorites()
      .then((response) => {
        if (current) setSavedCreators((response.data.creators || []).map((creator: Creator) => creator.id));
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load saved creators.');
      });
    return () => { current = false; };
  }, [user?.id, addToast]);

  const toggleSavedCreator = async (id: string) => {
    if (!user) {
      setAuthView('login');
      return;
    }
    try {
      const response = await api.toggleFavoriteCreator(id);
      setSavedCreators((items) => response.data.favorited
        ? [...new Set([...items, id])]
        : items.filter((creatorId) => creatorId !== id));
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not update saved creators.');
    }
  };

  const toggleFilter = (arr:string[], val:string, set:(v:string[])=>void) => {
    set(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]);
  };

  const filtered = allCreators.filter(c => {
    if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.skills.some(s=>s.toLowerCase().includes(q.toLowerCase()))) return false;
    if (c.price > priceMax) return false;
    if (selSkills.length && !selSkills.some(s=>c.skills.includes(s))) return false;
    if (selLevels.length && !selLevels.includes(c.level)) return false;
    if (selAvail.length && !selAvail.includes(c.availability)) return false;
    return true;
  });

  const doAiMatch = async () => {
    if (!matchQ) { addToast('error','Please describe your project'); return; }
    if (!allCreators.length) { addToast('info', 'No creators are available to match yet.'); return; }
    setMatching(true);
    const terms = `${matchQ} ${matchSkills}`.toLowerCase().split(/[^a-z0-9+#]+/).filter((term) => term.length > 2);
    const budget = Number(matchBudget.replace(/[^\d.]/g, ''));
    const ranked = allCreators.map((creator) => {
      const skills = creator.skills.map((skill) => skill.toLowerCase());
      const relevance = terms.length
        ? terms.filter((term) => skills.some((skill) => skill.includes(term) || term.includes(skill))).length / terms.length
        : 0;
      const budgetFit = budget > 0 && creator.price > 0 ? (creator.price <= budget ? 1 : Math.max(0, 1 - (creator.price - budget) / budget)) : 0.5;
      const availabilityFit = creator.availability.toLowerCase() === 'available' ? 1 : 0.4;
      const matchScore = Math.round((relevance * 0.55 + budgetFit * 0.2 + availabilityFit * 0.15 + Math.min(creator.rating / 5, 1) * 0.1) * 100);
      return { ...creator, matchScore };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 4);
    setMatches(ranked);
    setMatching(false);
    addToast('success', 'Creators ranked by skill relevance, budget, availability, and reviews.');
  };

  const messageCreator = async (creator: Creator) => {
    if (!user) { setAuthView('login'); return; }
    try {
      const response = await api.startConversation(creator.id);
      navigate(`/chat?conversation=${encodeURIComponent(response.data.conversation.id)}`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : `Could not open chat with ${creator.name}.`);
    }
  };

  return (
    <div style={{ paddingTop:70 }}>
      {/* Header */}
      <div style={{ padding:'40px 0 24px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:20 }}>
            <div>
              <div className="section-tag" style={{ marginBottom:8 }}><Users size={11}/>Creator Marketplace</div>
              <h1 style={{ fontSize:32, fontWeight:700, marginBottom:6 }}>Find Your Perfect Creator</h1>
              <p style={{ color:'var(--text-2)', fontSize:14 }}>{allCreators.length.toLocaleString()} creators ready to bring your vision to life.</p>
            </div>
            <button className="btn btn-primary" style={{ gap:7 }} onClick={()=>setAiMatchOpen(true)}>
              <Sparkles size={14}/>Match creators
            </button>
          </div>
          {/* Search bar */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:220, position:'relative' }}>
              <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }}/>
              <input className="input" placeholder="Search by name, skill, category..." value={q} onChange={e=>setQ(e.target.value)} style={{ paddingLeft:42 }}/>
            </div>
            <select className="select" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:160 }}>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
            <button className="btn btn-secondary" style={{ gap:7 }} onClick={()=>setShowFilters(!showFilters)}>
              <SlidersHorizontal size={14}/>{showFilters?'Hide':'Show'} Filters
              {(selSkills.length+selLevels.length+selAvail.length)>0 && <span style={{ width:18, height:18, borderRadius:'50%', background:'var(--purple)', fontSize:10, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>{selSkills.length+selLevels.length+selAvail.length}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'24px' }}>
        {/* Filters panel */}
        {showFilters && (
          <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:24, animation:'slideDown .2s ease' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24 }}>
              <div>
                <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text-2)' }}>Max Price/hr: ${priceMax}</h4>
                <input type="range" min={10} max={200} step={5} value={priceMax} onChange={e=>setPriceMax(+e.target.value)} style={{ width:'100%', accentColor:'var(--purple)' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-3)', marginTop:4 }}><span>$10</span><span>$200</span></div>
              </div>
              <div>
                <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text-2)' }}>Skills</h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {skillOptions.map(s=>(
                    <button key={s} className={`chip${selSkills.includes(s)?' active':''}`} style={{ fontSize:11 }} onClick={()=>toggleFilter(selSkills,s,setSelSkills)}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text-2)' }}>Creator Level</h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {levelOptions.map(l=>(
                    <button key={l} className={`chip${selLevels.includes(l)?' active':''}`} style={{ fontSize:11 }} onClick={()=>toggleFilter(selLevels,l,setSelLevels)}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text-2)' }}>Availability</h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {availOptions.map(a=>(
                    <button key={a} className={`chip${selAvail.includes(a)?' active':''}`} style={{ fontSize:11 }} onClick={()=>toggleFilter(selAvail,a,setSelAvail)}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            {(selSkills.length+selLevels.length+selAvail.length)>0 && (
              <div style={{ marginTop:16, paddingTop:12, borderTop:'1px solid var(--border)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>Active filters:</span>
                {[...selSkills,...selLevels,...selAvail].map(f=>(
                  <button key={f} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:'rgba(139,92,246,.12)', border:'1px solid rgba(139,92,246,.3)', fontSize:11, color:'var(--purple)', cursor:'pointer' }}
                    onClick={()=>{setSelSkills(p=>p.filter(x=>x!==f));setSelLevels(p=>p.filter(x=>x!==f));setSelAvail(p=>p.filter(x=>x!==f));}}>
                    {f}<X size={10}/>
                  </button>
                ))}
                <button style={{ fontSize:12, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }} onClick={()=>{setSelSkills([]);setSelLevels([]);setSelAvail([]);}}>Clear all</button>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:16 }}>
          Showing <strong>{filtered.length}</strong> creators{q?` for "${q}"`:''}
        </div>

        {/* Grid */}
        <div className="grid-4">
          {filtered.map(c=>(
            <div key={c.id} className="creator-card">
              <div style={{ height:76, background:`linear-gradient(135deg,${c.color}35,${c.color}18)`, position:'relative' }}>
                <div style={{ position:'absolute', bottom:-22, left:14, width:48, height:48, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'white', border:'3px solid var(--bg-card)' }}>{c.initials}</div>
                <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:5 }}>
                  <button onClick={()=>void toggleSavedCreator(c.id)} style={{ width:26, height:26, borderRadius:7, background:'rgba(0,0,0,.35)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bookmark size={12} fill={savedCreators.includes(c.id)?'var(--purple)':'none'} color={savedCreators.includes(c.id)?'var(--purple)':'white'}/>
                  </button>
                </div>
                <div style={{ position:'absolute', bottom:8, right:10, display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:c.availability==='Available'?'var(--green)':c.availability==='Busy'?'var(--orange)':'var(--text-3)' }}/>
                  <span style={{ fontSize:9, color:'white', fontWeight:500 }}>{c.availability}</span>
                </div>
              </div>
              <div style={{ padding:'30px 14px 14px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:4 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:1 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{c.name}</span>
                      {c.verified && <CheckCircle size={12} color="var(--blue)" fill="var(--blue)"/>}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.username}</div>
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:99, background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}28`, whiteSpace:'nowrap' }}>{c.level}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
                  <Star size={12} fill="var(--orange)" color="var(--orange)"/>
                  <span style={{ fontSize:12, fontWeight:600 }}>{c.rating}</span>
                  <span style={{ fontSize:11, color:'var(--text-3)' }}>({c.reviews}) · {c.jobs} jobs</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:10 }}>
                  {c.skills.slice(0,3).map(s=><span key={s} style={{ fontSize:9, padding:'2px 7px', borderRadius:99, background:'var(--bg-glass)', border:'1px solid var(--border)', color:'var(--text-2)' }}>{s}</span>)}
                </div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:10 }}>📍 {c.location} · ⏱ {c.responseTime}</div>
                <div className="divider" style={{ margin:'8px 0' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>From</div>
                    <div style={{ fontWeight:700, fontSize:15 }}>${c.price}<span style={{ fontSize:10, fontWeight:400, color:'var(--text-3)' }}>/hr</span></div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn-icon btn-icon-sm" title="Message" onClick={()=>void messageCreator(c)}><MessageSquare size={12}/></button>
                    <Link to={`/creator/${c.id}`} className="btn btn-secondary btn-sm" style={{ fontSize:11, padding:'5px 10px' }}>View</Link>
                    <Link to={`/creator/${c.id}`} className="btn btn-primary btn-sm" style={{ fontSize:11, padding:'5px 10px' }}>Hire</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loadingCreators ? (
          <div className="empty-state"><div className="spinner" /><p>Loading creators…</p></div>
        ) : filtered.length===0 && (
          <div className="empty-state">
            <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--bg-glass)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', fontSize:28, marginBottom:12 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>No creators found</h3>
            <p style={{ color:'var(--text-3)', fontSize:13 }}>Try adjusting your filters or search terms.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop:12 }} onClick={()=>{setQ('');setSelSkills([]);setSelLevels([]);setSelAvail([]);setPriceMax(200);}}>Clear filters</button>
          </div>
        )}
      </div>

      {/* AI MATCH MODAL */}
      {aiMatchOpen && (
        <div className="modal-backdrop" onClick={()=>setAiMatchOpen(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()} style={{ padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <Zap size={18} color="var(--purple)"/>
                  <h2 style={{ fontSize:20, fontWeight:700 }}>Project Creator Match</h2>
                </div>
                <p style={{ fontSize:13, color:'var(--text-2)' }}>Rank creators using their listed skills, rates, availability, and reviews.</p>
              </div>
              <button className="btn-icon" onClick={()=>setAiMatchOpen(false)}><X size={15}/></button>
            </div>

            {!matches.length ? (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Project description *</label>
                    <textarea className="input" placeholder="e.g. I need 10 SEO blog articles for my SaaS product targeting marketing managers..." value={matchQ} onChange={e=>setMatchQ(e.target.value)} style={{ minHeight:80 }}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Required skills</label>
                    <input className="input" placeholder="e.g. SEO, Blog Writing, AI Content" value={matchSkills} onChange={e=>setMatchSkills(e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget</label>
                    <input className="input" placeholder="e.g. $500-$1000" value={matchBudget} onChange={e=>setMatchBudget(e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input className="input" type="date" value={matchDeadline} onChange={e=>setMatchDeadline(e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Content type</label>
                    <select className="select">
                      <option>Blog Articles</option>
                      <option>Video Scripts</option>
                      <option>Social Media</option>
                      <option>Email Marketing</option>
                      <option>Technical Writing</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={doAiMatch} disabled={matching}>
                  {matching ? <><div className="spinner spinner-sm"/>Comparing creator profiles...</> : <><Sparkles size={14}/>Find Matching Creators</>}
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom:18, padding:'12px 16px', borderRadius:10, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', display:'flex', gap:8, alignItems:'center' }}>
                  <CheckCircle size={14} color="var(--green)"/>
                  <span style={{ fontSize:13, color:'var(--green)', fontWeight:500 }}>Top creator matches for your project</span>
                </div>
                <div className="grid-2" style={{ gap:14, marginBottom:16 }}>
                  {matches.map((c)=>(
                    <div key={c.id} style={{ padding:16, background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:12 }}>
                      <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                        <div style={{ width:44, height:44, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'white', flexShrink:0 }}>{c.initials}</div>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ fontWeight:700, fontSize:13 }}>{c.name}</span>
                            {c.verified && <CheckCircle size={11} color="var(--blue)" fill="var(--blue)"/>}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.level} · {c.jobs} jobs</div>
                        </div>
                        <div style={{ marginLeft:'auto', fontWeight:800, fontSize:16, color:'var(--green)' }}>{c.matchScore}%</div>
                      </div>
                      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                        {[[ 'Skills', `${c.skills.length} listed`, 'var(--purple)' ], [ 'Rate', `$${c.price}/hr`, 'var(--green)' ], [ 'Availability', c.availability === 'Available' ? 'Available' : 'Busy', c.availability === 'Available' ? 'var(--green)' : 'var(--orange)' ]].map(([l,v,col])=>(
                          <div key={l} style={{ flex:1, padding:'6px 8px', borderRadius:8, background:'var(--bg-glass)', border:'1px solid var(--border)', textAlign:'center' }}>
                            <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:2 }}>{l}</div>
                            <div style={{ fontSize:12, fontWeight:600, color:col as string }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <Link to={`/creator/${c.id}`} className="btn btn-secondary btn-sm" style={{ flex:1, fontSize:11 }} onClick={()=>setAiMatchOpen(false)}>View Profile</Link>
                        <Link to={`/creator/${c.id}`} className="btn btn-primary btn-sm" style={{ flex:1, fontSize:11 }} onClick={()=>setAiMatchOpen(false)}>View services</Link>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-ghost" style={{ width:'100%' }} onClick={()=>{setMatches([]);setMatchQ('');}}>Search Again</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
