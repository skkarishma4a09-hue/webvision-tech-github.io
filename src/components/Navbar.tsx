import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Search, Bell, Sun, Moon, ChevronDown, Menu, X, User, Settings,
  LogOut, BarChart2, ShoppingBag, LayoutDashboard, Sparkles, Globe,
  DollarSign, Users, Briefcase, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { creators, services } from '../data/mockData';

const navLinks = [
  { label:'Explore', path:'/explore', icon:<Sparkles size={14}/> },
  { label:'Creators', path:'/creators', icon:<Users size={14}/> },
  { label:'Gigs & Services', path:'/services', icon:<ShoppingBag size={14}/> },
  { label:'Client Dashboard', path:'/dashboard', icon:<LayoutDashboard size={14}/> },
  { label:'Analytics', path:'/analytics', icon:<BarChart2 size={14}/> },
];
const currencies = ['USD','EUR','GBP','JPY','CAD','AUD','INR','SGD'];

export default function Navbar() {
  const { theme, toggleTheme, currency, setCurrency, setCmdOpen,
    authView, setAuthView, user, setUser, addToast, notifCount, setNotifCount } = useApp();
  const loc = useLocation();
  const [mob, setMob] = useState(false);
  const [srch, setSrch] = useState(false);
  const [srchQ, setSrchQ] = useState('');
  const [curDD, setCurDD] = useState(false);
  const [profDD, setProfDD] = useState(false);
  const [notifDD, setNotifDD] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const srchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e:KeyboardEvent) => {
      if ((e.ctrlKey||e.metaKey)&&e.key==='k') { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [setCmdOpen]);

  useEffect(() => {
    const h = (e:MouseEvent) => {
      if (srchRef.current && !srchRef.current.contains(e.target as Node)) setSrch(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const srchResults = srchQ.length > 1 ? [
    ...creators.filter(c=>c.name.toLowerCase().includes(srchQ.toLowerCase())).slice(0,3).map(c=>({ type:'creator', label:c.name, sub:c.username })),
    ...services.filter(s=>s.title.toLowerCase().includes(srchQ.toLowerCase())).slice(0,3).map(s=>({ type:'service', label:s.title, sub:s.category })),
  ] : [];

  // Fake demo sign-in removed - authentication is OTP-only.

  const navBg = scrolled ? 'rgba(5,5,8,.95)' : 'transparent';
  const navBorder = scrolled ? '1px solid var(--border)' : '1px solid transparent';

  return (
    <>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:900, background:navBg, backdropFilter:scrolled?'blur(20px)':'none', borderBottom:navBorder, transition:'all .3s ease', height:70 }}>
        <div className="container" style={{ display:'flex', alignItems:'center', height:'100%', gap:6 }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, textDecoration:'none' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(139,92,246,.4)', flexShrink:0 }}>
              <Zap size={18} color="white" fill="white"/>
            </div>
            <div style={{ lineHeight:1 }}>
              <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, letterSpacing:'-.5px' }}>
                <span className="gradient-text">Synapse</span><span>AI</span>
              </div>
              <div style={{ fontSize:9, color:'var(--text-3)', letterSpacing:1, textTransform:'uppercase', marginTop:2 }}>Creator Hub</div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="nav-desktop" style={{ display:'flex', alignItems:'center', gap:2, marginLeft:16, flex:1 }}>
            {navLinks.map(l => (
              <Link key={l.path} to={l.path} style={{
                display:'flex', alignItems:'center', gap:6, padding:'7px 11px',
                borderRadius:8, fontSize:13, fontWeight:500, textDecoration:'none',
                color:loc.pathname===l.path?'var(--purple)':'var(--text-2)',
                background:loc.pathname===l.path?'rgba(139,92,246,.1)':'transparent',
                transition:'all .2s', whiteSpace:'nowrap',
              }}
              onMouseEnter={e=>{if(loc.pathname!==l.path)(e.currentTarget as HTMLElement).style.color='var(--text-1)';}}
              onMouseLeave={e=>{if(loc.pathname!==l.path)(e.currentTarget as HTMLElement).style.color='var(--text-2)';}}
              >{l.icon}{l.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto', flexShrink:0 }}>

            {/* Search */}
            <div ref={srchRef} style={{ position:'relative' }}>
              <button className="btn-icon" onClick={()=>setSrch(!srch)} style={{ display:'flex', alignItems:'center', gap:6, width:'auto', padding:'0 12px', borderRadius:8 }}>
                <Search size={15}/>
                <span className="nav-desktop" style={{ fontSize:11, color:'var(--text-3)' }}><kbd>Ctrl K</kbd></span>
              </button>
              {srch && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:360, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', boxShadow:'var(--shadow-lg)', animation:'slideDown .2s ease' }}>
                  <div style={{ padding:12, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
                    <Search size={14} color="var(--text-3)"/>
                    <input autoFocus value={srchQ} onChange={e=>setSrchQ(e.target.value)} placeholder="Search creators, services..." style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-1)', fontSize:14 }}/>
                    {srchQ && <button onClick={()=>setSrchQ('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}><X size={13}/></button>}
                  </div>
                  <div style={{ padding:8 }}>
                    {srchResults.length > 0 ? srchResults.map((r,i)=>(
                      <button key={i} onClick={()=>{setSrch(false);setSrchQ('');addToast('info',`Opening ${r.label}`);}} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, background:'transparent', border:'none', cursor:'pointer', color:'var(--text-1)', fontSize:13, transition:'background .15s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-glass)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                      >
                        <div style={{ width:30, height:30, borderRadius:8, background:r.type==='creator'?'rgba(139,92,246,.12)':'rgba(59,130,246,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {r.type==='creator'?<User size={13} color="#a78bfa"/>:<Briefcase size={13} color="#60a5fa"/>}
                        </div>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontSize:13, fontWeight:500 }}>{r.label}</div>
                          <div style={{ fontSize:11, color:'var(--text-3)' }}>{r.type} · {r.sub}</div>
                        </div>
                      </button>
                    )) : srchQ.length>1 ? (
                      <div style={{ padding:'20px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>No results for "{srchQ}"</div>
                    ) : (
                      <div style={{ padding:4 }}>
                        <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:.8, color:'var(--text-3)', padding:'4px 12px 8px' }}>Quick Actions</div>
                        {[{icon:<Users size={13}/>,l:'Browse Creators',p:'/creators'},{icon:<Sparkles size={13}/>,l:'AI Studio',p:'/ai-studio'},{icon:<ShoppingBag size={13}/>,l:'Gigs & Services',p:'/services'}].map((item,i)=>(
                          <Link key={i} to={item.p} onClick={()=>setSrch(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, color:'var(--text-2)', fontSize:13, textDecoration:'none', transition:'all .15s' }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--bg-glass)';(e.currentTarget as HTMLElement).style.color='var(--text-1)';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='var(--text-2)';}}
                          >{item.icon}{item.l}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Currency */}
            <div style={{ position:'relative' }} className="nav-desktop">
              <button onClick={()=>setCurDD(!curDD)} style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 10px', borderRadius:8, background:'var(--bg-glass)', border:'1px solid var(--border)', color:'var(--text-2)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s' }}>
                <DollarSign size={11}/>{currency}<ChevronDown size={10}/>
              </button>
              {curDD && (
                <div className="dropdown-menu" style={{ minWidth:110, right:0 }}>
                  {currencies.map(c=>(
                    <button key={c} className="dd-item" style={{ fontWeight:c===currency?600:400, color:c===currency?'var(--purple)':undefined }} onClick={()=>{setCurrency(c);setCurDD(false);addToast('success',`Currency: ${c}`);}}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Studio CTA */}
            <Link to="/ai-studio" className="btn btn-primary btn-sm nav-desktop" style={{ gap:5 }}>
              <Sparkles size={13}/>AI Studio
            </Link>

            {/* Notifications */}
            <div style={{ position:'relative' }}>
              <button className="btn-icon" onClick={()=>{setNotifDD(!notifDD);if(notifCount>0)setNotifCount(0);}} style={{ position:'relative' }}>
                <Bell size={15}/>
                {notifCount>0 && (
                  <span style={{ position:'absolute', top:4, right:4, width:15, height:15, borderRadius:'50%', background:'var(--purple)', fontSize:8, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg-primary)' }}>{notifCount}</span>
                )}
              </button>
              {notifDD && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:350, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, boxShadow:'var(--shadow-lg)', animation:'slideDown .2s ease', overflow:'hidden' }}>
                  <div style={{ padding:'14px 18px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>Notifications</span>
                    <button style={{ fontSize:12, color:'var(--purple)', background:'none', border:'none', cursor:'pointer', fontWeight:500 }} onClick={()=>addToast('success','All notifications read')}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight:360, overflowY:'auto' }}>
                    {[
                      { e:'💬', t:'Aria Chen sent a message', s:'First draft is ready!', time:'2m', u:true },
                      { e:'📦', t:'Order #4821 delivered', s:'Sofia delivered your sequence', time:'1h', u:true },
                      { e:'💳', t:'Payment confirmed', s:'$180 Premium SEO Package', time:'3h', u:true },
                      { e:'⭐', t:'New 5-star review', s:'David Park left a review', time:'5h', u:false },
                      { e:'🤖', t:'AI generation complete', s:'5 blog drafts ready', time:'1d', u:false },
                    ].map((n,i)=>(
                      <div key={i} style={{ display:'flex', gap:10, padding:'12px 18px', background:n.u?'rgba(139,92,246,.04)':'transparent', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background .2s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-glass)')}
                        onMouseLeave={e=>(e.currentTarget.style.background=n.u?'rgba(139,92,246,.04)':'transparent')}
                      >
                        <span style={{ fontSize:20, flexShrink:0 }}>{n.e}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', justifyContent:'space-between' }}>
                            <span style={{ fontSize:12, fontWeight:n.u?600:400 }}>{n.t}</span>
                            {n.u && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--purple)', marginTop:4, flexShrink:0 }}/>}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{n.s}</div>
                          <div style={{ fontSize:10, color:'var(--text-3)', marginTop:3 }}>{n.time} ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:12, textAlign:'center', borderTop:'1px solid var(--border)' }}>
                    <Link to="/notifications" onClick={()=>setNotifDD(false)} style={{ fontSize:12, color:'var(--purple)', fontWeight:500 }}>View all →</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme */}
            <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
              {theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}
            </button>

            {/* Profile */}
            {user ? (
              <div style={{ position:'relative' }}>
                <button onClick={()=>setProfDD(!profDD)} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:10, background:'var(--bg-glass)', border:'1px solid var(--border)', cursor:'pointer', transition:'all .2s' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', flexShrink:0 }}>{user.initials}</div>
                  <span className="nav-desktop" style={{ fontSize:13, fontWeight:500 }}>{(user.name?.split(' ')[0] || user.email?.split('@')[0] || '')}</span>
                  <ChevronDown size={12} color="var(--text-3)"/>
                </button>
                {profDD && (
                  <div className="dropdown-menu">
                    <div style={{ padding:'10px 12px 8px', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{user.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>{user.email}</div>
                      <span className={`badge badge-${user.role==='creator'?'purple':'blue'}`} style={{ marginTop:5 }}>{user.role}</span>
                    </div>
                    <Link to="/dashboard" className="dd-item" onClick={()=>setProfDD(false)}><LayoutDashboard size={13}/> Dashboard</Link>
                    <Link to="/analytics" className="dd-item" onClick={()=>setProfDD(false)}><BarChart2 size={13}/> Analytics</Link>

                    <Link to="/creator-dashboard" className="dd-item" onClick={()=>setProfDD(false)}><User size={13}/> Creator Dashboard</Link>
                    <div className="divider" style={{ margin:'4px 0' }}/>
                    <button className="dd-item danger" onClick={()=>{setUser(null);setProfDD(false);addToast('info','Signed out');}}><LogOut size={13}/> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-secondary btn-sm" onClick={()=>setAuthView('login')}>Log in</button>
                <button className="btn btn-primary btn-sm" onClick={()=>setAuthView('login')}>Get started</button>
              </div>
            )}

            {/* Mobile menu */}
            <button className="btn-icon mob-only" onClick={()=>setMob(!mob)}>{mob?<X size={17}/>:<Menu size={17}/>}</button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mob && (
          <div style={{ position:'absolute', top:70, left:0, right:0, background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)', padding:16, animation:'slideDown .3s ease' }}>
            {navLinks.map(l=>(
              <Link key={l.path} to={l.path} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:10, color:loc.pathname===l.path?'var(--purple)':'var(--text-2)', background:loc.pathname===l.path?'rgba(139,92,246,.1)':'transparent', fontSize:14, fontWeight:500, marginBottom:2, textDecoration:'none' }} onClick={()=>setMob(false)}>
                {l.icon}{l.label}
              </Link>
            ))}
            <Link to="/ai-studio" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:10, background:'rgba(139,92,246,.12)', color:'var(--purple)', fontSize:14, fontWeight:600, marginBottom:2, marginTop:4, textDecoration:'none' }} onClick={()=>setMob(false)}>
              <Sparkles size={14}/>AI Studio
            </Link>
            <div className="divider"/>
            {!user ? (
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={()=>{setAuthView('login');setMob(false);}}>Log in</button>
                <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={()=>{setAuthView('login');setMob(false);}}>Get started</button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm" style={{ width:'100%' }} onClick={()=>{setUser(null);setMob(false);addToast('info','Signed out');}}><LogOut size={13}/> Sign Out</button>
            )}
          </div>
        )}
      </nav>

      <style>{`
        .nav-desktop { display:flex !important; align-items:center; gap:inherit; }
        .mob-only { display:none !important; }
        @media(max-width:768px) {
          .nav-desktop { display:none !important; }
          .mob-only { display:flex !important; }
        }
        .dd-item { display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:8px; cursor:pointer; font-size:13px; color:var(--text-2); transition:all .15s; border:none; background:transparent; width:100%; text-align:left; text-decoration:none; }
        .dd-item:hover { background:var(--bg-glass); color:var(--text-1); }
        .dd-item.danger:hover { color:var(--red); background:rgba(239,68,68,.1); }
      `}</style>
    </>
  );
}
