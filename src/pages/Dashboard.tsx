import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, MessageSquare, Bell, Star, Bookmark,
  TrendingUp, Clock, CheckCircle, AlertCircle, Plus, ArrowRight, Sparkles, Users, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { orders, projects, creators, notifications } from '../data/mockData';

const tabs = ['Overview','Projects','Orders','Messages','Saved','Notifications'];

export default function Dashboard() {
  const { addToast, user, setAuthView } = useApp();
  const [tab, setTab] = useState('Overview');

  if (!user) {
    return (
      <div style={{ paddingTop:70, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', maxWidth:400, padding:40 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <LayoutDashboard size={28} color="white"/>
          </div>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>Sign in to access your dashboard</h2>
          <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:24 }}>Track your projects, orders, and messages all in one place.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button className="btn btn-secondary" onClick={()=>setAuthView('login')}>Log in</button>
            <button className="btn btn-primary" onClick={()=>setAuthView('login')}>Get started</button>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o=>o.status==='Active'||o.status==='Delivered');
  const completedOrders = orders.filter(o=>o.status==='Completed');
  const totalSpent = orders.filter(o=>o.status==='Completed'||o.status==='Active').reduce((a,o)=>a+o.amount,0);

  return (
    <div style={{ paddingTop:70 }}>
      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div style={{ padding:'4px 8px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'white' }}>{user.initials}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{user.name}</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{user.email}</div>
              </div>
            </div>
            <span className={`badge badge-${user.role==='creator'?'purple':'blue'}`}>{user.role}</span>
          </div>
          <div className="divider"/>
          {[
            {l:'Overview',i:<LayoutDashboard size={15}/>,t:'Overview'},
            {l:'Projects',i:<Activity size={15}/>,t:'Projects'},
            {l:'Orders',i:<ShoppingBag size={15}/>,t:'Orders'},
            {l:'Messages',i:<MessageSquare size={15}/>,t:'Messages'},
            {l:'Saved',i:<Bookmark size={15}/>,t:'Saved'},
            {l:'Notifications',i:<Bell size={15}/>,t:'Notifications'},
          ].map(item=>(
            <button key={item.t} className={`sidebar-item${tab===item.t?' active':''}`} onClick={()=>setTab(item.t)}>
              {item.i}{item.l}
            </button>
          ))}
          <div className="divider"/>
          <Link to="/ai-studio" className="sidebar-item" style={{ color:'var(--purple)' }}>
            <Sparkles size={15}/>AI Studio
          </Link>
          <Link to="/analytics" className="sidebar-item">
            <TrendingUp size={15}/>Analytics
          </Link>
        </div>

        {/* Main */}
        <div className="page-main">

          {/* Overview */}
          {tab==='Overview' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div>
                  <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                  <p style={{ color:'var(--text-2)', fontSize:14 }}>Here's what's happening with your projects today.</p>
                </div>
                <button className="btn btn-primary" style={{ gap:7 }} onClick={()=>addToast('info','Opening Create Project...')}><Plus size={14}/>New Project</button>
              </div>

              {/* Stats */}
              <div className="grid-4" style={{ marginBottom:28 }}>
                {[
                  { label:'Active Projects', value:projects.length, icon:<Activity size={18}/>, color:'var(--purple)', sub:'+1 this week' },
                  { label:'Total Orders', value:orders.length, icon:<ShoppingBag size={18}/>, color:'var(--blue)', sub:`${activeOrders.length} active` },
                  { label:'Total Spent', value:`$${totalSpent.toLocaleString()}`, icon:<TrendingUp size={18}/>, color:'var(--green)', sub:'This year' },
                  { label:'Completed', value:completedOrders.length, icon:<CheckCircle size={18}/>, color:'var(--cyan)', sub:'All time' },
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ width:40, height:40, borderRadius:11, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>{s.icon}</div>
                      <span style={{ fontSize:11, color:'var(--green)' }}>{s.sub}</span>
                    </div>
                    <div style={{ fontSize:26, fontWeight:800, marginTop:8 }}>{s.value}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Active Projects */}
              <div style={{ marginBottom:24 }}>
                <div className="s-head" style={{ marginBottom:16 }}>
                  <h2 style={{ fontSize:17, fontWeight:700 }}>Active Projects</h2>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setTab('Projects')}>View all <ArrowRight size={12}/></button>
                </div>
                {projects.map(p=>(
                  <div key={p.id} style={{ padding:18, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>{p.title}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-3)' }}>
                          <div style={{ width:20, height:20, borderRadius:'50%', background:p.creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'white' }}>{p.creator.initials}</div>
                          {p.creator.name} · Due {p.deadline}
                        </div>
                      </div>
                      <span className={`badge ${p.status==='In Progress'?'badge-purple':'badge-blue'}`}>{p.status}</span>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:6 }}>
                        <span>Progress</span>
                        <span style={{ fontWeight:600, color:'var(--text-1)' }}>{p.progress}%</span>
                      </div>
                      <div className="progress"><div className="progress-fill" style={{ width:`${p.progress}%` }}/></div>
                    </div>
                    <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-3)' }}>
                      <span>💰 ${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}</span>
                      <span>🎯 {p.milestones.filter(m=>m.status==='Completed').length}/{p.milestones.length} milestones</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div>
                <div className="s-head" style={{ marginBottom:16 }}>
                  <h2 style={{ fontSize:17, fontWeight:700 }}>Recent Orders</h2>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setTab('Orders')}>View all <ArrowRight size={12}/></button>
                </div>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid var(--border)' }}>
                        {['Order','Service','Creator','Amount','Status'].map(h=>(
                          <th key={h} style={{ padding:'12px 16px', fontSize:11, fontWeight:600, color:'var(--text-3)', textAlign:'left', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0,5).map(o=>(
                        <tr key={o.id} style={{ borderBottom:'1px solid var(--border)', transition:'background .15s' }}
                          onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-glass)')}
                          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                        >
                          <td style={{ padding:'12px 16px', fontSize:13, color:'var(--purple)', fontWeight:500 }}>{o.id}</td>
                          <td style={{ padding:'12px 16px', fontSize:12, maxWidth:200 }} className="truncate">{o.service}</td>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <div style={{ width:24, height:24, borderRadius:'50%', background:o.creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'white', flexShrink:0 }}>{o.creator.initials}</div>
                              <span style={{ fontSize:12 }}>{o.creator.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600 }}>${o.amount}</td>
                          <td style={{ padding:'12px 16px' }}>
                            <span className={`badge ${o.status==='Completed'?'badge-green':o.status==='Active'?'badge-blue':o.status==='Delivered'?'badge-cyan':o.status==='Cancelled'?'badge-red':'badge-orange'}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Projects tab */}
          {tab==='Projects' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <h1 style={{ fontSize:22, fontWeight:700 }}>My Projects</h1>
                <button className="btn btn-primary btn-sm" style={{ gap:7 }} onClick={()=>addToast('info','Opening project creator...')}><Plus size={13}/>Create Project</button>
              </div>
              {projects.map(p=>(
                <div key={p.id} style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                    <div>
                      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{p.title}</h3>
                      <p style={{ fontSize:13, color:'var(--text-2)', maxWidth:400 }}>{p.desc}</p>
                    </div>
                    <span className={`badge ${p.status==='In Progress'?'badge-purple':'badge-blue'}`}>{p.status}</span>
                  </div>
                  <div style={{ display:'flex', gap:20, marginBottom:14, fontSize:13 }}>
                    {[
                      { l:'Budget', v:`$${p.budget.toLocaleString()}` },
                      { l:'Spent', v:`$${p.spent.toLocaleString()}` },
                      { l:'Deadline', v:p.deadline },
                      { l:'Creator', v:p.creator.name },
                      { l:'Category', v:p.category },
                    ].map(item=>(
                      <div key={item.l}>
                        <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2, textTransform:'uppercase', letterSpacing:.5 }}>{item.l}</div>
                        <div style={{ fontWeight:600, color:'var(--text-1)' }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:6 }}><span>Overall Progress</span><span style={{ fontWeight:700, color:'var(--text-1)' }}>{p.progress}%</span></div>
                    <div className="progress"><div className="progress-fill" style={{ width:`${p.progress}%` }}/></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
                    {p.milestones.map(m=>(
                      <div key={m.id} style={{ padding:'10px 12px', background:'var(--bg-glass)', border:'1px solid var(--border)', borderRadius:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:11, fontWeight:600 }}>{m.name}</span>
                          <span className={`badge ${m.status==='Completed'?'badge-green':m.status==='In Progress'?'badge-blue':m.status==='Submitted'?'badge-cyan':'badge-gray'}`} style={{ fontSize:8 }}>{m.status}</span>
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>${m.amount} · {m.due}</div>
                        {m.progress>0 && <div className="progress" style={{ marginTop:5 }}><div className="progress-fill" style={{ width:`${m.progress}%` }}/></div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Orders tab */}
          {tab==='Orders' && (
            <>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>Orders</h1>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:8, flexWrap:'wrap' }}>
                  {['All','Active','Delivered','Completed','Cancelled'].map(s=>(
                    <button key={s} className="chip active" style={{ fontSize:11 }}>{s}</button>
                  ))}
                </div>
                {orders.map(o=>(
                  <div key={o.id} style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, transition:'background .15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-glass)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                  >
                    <div style={{ width:38, height:38, borderRadius:10, background:o.creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', flexShrink:0 }}>{o.creator.initials}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14 }}>{o.service}</div>
                      <div style={{ fontSize:12, color:'var(--text-3)' }}>{o.id} · {o.creator.name} · {o.pkg} Package</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>${o.amount}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>{o.date}</div>
                    </div>
                    <span className={`badge ${o.status==='Completed'?'badge-green':o.status==='Active'?'badge-blue':o.status==='Delivered'?'badge-cyan':o.status==='Cancelled'?'badge-red':'badge-orange'}`}>{o.status}</span>
                    {o.status==='Delivered' && <button className="btn btn-success btn-sm" style={{ fontSize:11 }} onClick={()=>addToast('success','Order approved! Payment released.')}>Approve</button>}
                    {o.status==='Active' && <button className="btn btn-secondary btn-sm" style={{ fontSize:11 }} onClick={()=>addToast('info','Opening project workspace...')}>View</button>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Notifications tab */}
          {tab==='Notifications' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <h1 style={{ fontSize:22, fontWeight:700 }}>Notifications</h1>
                <button className="btn btn-secondary btn-sm" onClick={()=>addToast('success','All notifications marked as read')}>Mark all read</button>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                {['All','Messages','Projects','Orders','Payments','Reviews','AI','System'].map(c=>(
                  <button key={c} className="chip">{c}</button>
                ))}
              </div>
              {notifications.map(n=>(
                <div key={n.id} style={{ display:'flex', gap:14, padding:'16px 18px', background:'var(--bg-card)', border:`1px solid ${n.unread?'rgba(139,92,246,.2)':'var(--border)'}`, borderRadius:12, marginBottom:8, transition:'all .2s', cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-glass)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='var(--bg-card)')}
                >
                  <div style={{ fontSize:24, flexShrink:0 }}>{n.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:n.unread?600:400 }}>{n.title}</span>
                      <span style={{ fontSize:11, color:'var(--text-3)', flexShrink:0 }}>{n.time} ago</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-2)' }}>{n.text}</div>
                  </div>
                  {n.unread && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--purple)', flexShrink:0, marginTop:4 }}/>}
                </div>
              ))}
            </>
          )}

          {/* Saved tab */}
          {tab==='Saved' && (
            <>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>Saved Creators</h1>
              <div className="grid-3">
                {creators.slice(0,6).map(c=>(
                  <div key={c.id} style={{ padding:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12 }}>
                    <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'white', flexShrink:0 }}>{c.initials}</div>
                      <div>
                        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                          <span style={{ fontWeight:600, fontSize:13 }}>{c.name}</span>
                          {c.verified && <CheckCircle size={11} color="var(--blue)" fill="var(--blue)"/>}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.level} · ${c.price}/hr</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      <Link to={`/creator/${c.id}`} className="btn btn-secondary btn-sm" style={{ flex:1, fontSize:11 }}>View</Link>
                      <button className="btn btn-primary btn-sm" style={{ flex:1, fontSize:11 }} onClick={()=>addToast('success',`Hiring ${c.name}!`)}>Hire</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Messages tab */}
          {tab==='Messages' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>Messages</h1>
              <Link to="/chat" className="btn btn-primary btn-sm" style={{ marginBottom:16, gap:7, display:'inline-flex', alignItems:'center' }}><MessageSquare size={13}/>Open Full Chat</Link>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                {[
                  { name:'Aria Chen', init:'AC', color:'#8B5CF6', msg:'First draft is ready! Check it out 🎉', time:'2m', unread:2, online:true },
                  { name:'Marcus Johnson', init:'MJ', color:'#3B82F6', msg:'YouTube script ready for review.', time:'1h', unread:0, online:true },
                  { name:'Sofia Martinez', init:'SM', color:'#EC4899', msg:'Email sequence delivered.', time:'3h', unread:1, online:false },
                ].map((m,i)=>(
                  <Link key={i} to="/chat" style={{ display:'flex', gap:12, padding:'14px 18px', borderBottom:'1px solid var(--border)', textDecoration:'none', color:'var(--text-1)', transition:'background .15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-glass)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                  >
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:42, height:42, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'white' }}>{m.init}</div>
                      {m.online && <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background:'var(--green)', border:'2px solid var(--bg-card)' }}/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontWeight:600, fontSize:13 }}>{m.name}</span>
                        <span style={{ fontSize:11, color:'var(--text-3)' }}>{m.time} ago</span>
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{m.msg}</div>
                    </div>
                    {m.unread>0 && <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--purple)', fontSize:10, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{m.unread}</div>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="mob-nav">
        {[
          {l:'Home',i:'🏠',p:'/'},
          {l:'Explore',i:'🔍',p:'/explore'},
          {l:'AI',i:'⚡',p:'/ai-studio'},
          {l:'Chat',i:'💬',p:'/chat'},
          {l:'Profile',i:'👤',p:'/dashboard'},
        ].map(item=>(
          <Link key={item.l} to={item.p} className="mob-nav-item">
            <span style={{ fontSize:20 }}>{item.i}</span>{item.l}
          </Link>
        ))}
      </nav>
    </div>
  );
}
