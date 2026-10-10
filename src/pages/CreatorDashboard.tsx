import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, DollarSign, Star, TrendingUp, Award, MessageSquare,
  Eye, CheckCircle, Clock, Plus, Users, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { orders, notifications, analytics, badges, levels } from '../data/mockData';

export default function CreatorDashboard() {
  const { addToast, user, setAuthView } = useApp();
  const [tab, setTab] = useState('Overview');

  if (!user) {
    return (
      <div style={{ paddingTop:70, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>Creator Dashboard</h2>
          <p style={{ color:'var(--text-2)', marginBottom:20 }}>Sign in as a creator to access your dashboard.</p>
          <button className="btn btn-primary" onClick={()=>setAuthView('login')}>Become a Creator</button>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(o=>o.status==='Completed');
  const totalEarnings = completedOrders.reduce((a,o)=>a+o.amount,0);

  return (
    <div style={{ paddingTop:70 }}>
      <div className="layout">
        <div className="sidebar">
          {/* Creator profile */}
          <div style={{ padding:'4px 8px 16px' }}>
            <div style={{ position:'relative', width:48, height:48, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'white', marginBottom:10 }}>
              {user.initials}
              <div style={{ position:'absolute', bottom:1, right:1, width:11, height:11, borderRadius:'50%', background:'var(--green)', border:'2px solid var(--bg-secondary)' }}/>
            </div>
            <div style={{ fontWeight:700, fontSize:13 }}>{user.name}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:6 }}>{user.email}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              {[1,2,3,4,5].map(i=><Star key={i} size={11} fill="var(--orange)" color="var(--orange)"/>)}
              <span style={{ fontSize:11, fontWeight:600 }}>4.97</span>
            </div>
            <div style={{ padding:'6px 10px', borderRadius:8, background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)', fontSize:11, fontWeight:600, color:'var(--purple)', textAlign:'center' }}>
              ⭐ Elite Creator
            </div>
          </div>
          <div className="divider"/>
          {['Overview','Earnings','Orders','Analytics','Reviews','Profile','Settings'].map(item=>(
            <button key={item} className={`sidebar-item${tab===item?' active':''}`} onClick={()=>setTab(item)}>{item}</button>
          ))}
          <div className="divider"/>
          <Link to="/ai-studio" className="sidebar-item" style={{ color:'var(--purple)' }}><Sparkles size={14}/>AI Studio</Link>
        </div>

        <div className="page-main">
          {tab==='Overview' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                  <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>Creator Dashboard</h1>
                  <p style={{ color:'var(--text-2)', fontSize:13 }}>Welcome back! Here's your performance overview.</p>
                </div>
                <button className="btn btn-primary btn-sm" style={{ gap:6 }} onClick={()=>addToast('info','Add new service coming soon!')}><Plus size={13}/>Add Service</button>
              </div>

              {/* KPI stats */}
              <div className="grid-4" style={{ marginBottom:28 }}>
                {[
                  { l:'Total Earnings', v:`$${totalEarnings.toLocaleString()}`, i:<DollarSign size={18}/>, c:'var(--green)', sub:'All time' },
                  { l:'Completed Orders', v:completedOrders.length, i:<CheckCircle size={18}/>, c:'var(--blue)', sub:'This month: 12' },
                  { l:'Profile Views', v:'2,840', i:<Eye size={18}/>, c:'var(--cyan)', sub:'+18% this month' },
                  { l:'Response Rate', v:'99%', i:<Clock size={18}/>, c:'var(--purple)', sub:'< 1hr avg' },
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:`${s.c}14`, display:'flex', alignItems:'center', justifyContent:'center', color:s.c }}>{s.i}</div>
                      <span style={{ fontSize:11, color:'var(--green)' }}>{s.sub}</span>
                    </div>
                    <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>{s.v}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Level & badges */}
              <div className="grid-2" style={{ marginBottom:24 }}>
                <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Creator Level</h3>
                  <div style={{ display:'flex', gap:6, marginBottom:16 }}>
                    {levels.map((l,i)=>(
                      <div key={l.name} style={{ flex:1, textAlign:'center' }}>
                        <div style={{ padding:'6px 8px', borderRadius:8, background:l.name==='Elite'?`${l.color}18`:'var(--bg-glass)', border:`1px solid ${l.name==='Elite'?l.color+'40':'var(--border)'}`, fontSize:10, fontWeight:700, color:l.name==='Elite'?l.color:'var(--text-3)', marginBottom:4 }}>{l.name}</div>
                        {i<levels.length-1 && <div style={{ height:2, background:i<3?'var(--grad)':'var(--border)', borderRadius:1 }}/>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {levels.find(l=>l.name==='Elite')?.perks.map((p,i)=>(
                      <div key={i} style={{ display:'flex', gap:6, fontSize:12, color:'var(--text-2)' }}>
                        <CheckCircle size={13} color="var(--green)" style={{ flexShrink:0, marginTop:1 }}/>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Your Badges</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {badges.slice(0,4).map(b=>(
                      <div key={b.id} style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:36, height:36, borderRadius:9, background:`${b.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{b.icon}</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:b.color }}>{b.name}</div>
                          <div style={{ fontSize:10, color:'var(--text-3)' }}>{b.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent orders */}
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Recent Orders</h3>
                {orders.slice(0,4).map(o=>(
                  <div key={o.id} style={{ display:'flex', gap:14, padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, marginBottom:8, alignItems:'center' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:o.creator.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white', flexShrink:0 }}>{o.creator.initials}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{o.service}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>{o.id} · {o.pkg} · {o.date}</div>
                    </div>
                    <div style={{ fontWeight:700, fontSize:15 }}>${o.amount}</div>
                    <span className={`badge ${o.status==='Completed'?'badge-green':o.status==='Active'?'badge-blue':o.status==='Delivered'?'badge-cyan':'badge-red'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab==='Earnings' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:24 }}>Earnings</h1>
              <div className="grid-3" style={{ marginBottom:24 }}>
                {[
                  { l:'This Month', v:'$7,400', c:'var(--green)' },
                  { l:'Pending', v:'$2,100', c:'var(--orange)' },
                  { l:'Available', v:'$5,300', c:'var(--blue)' },
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div style={{ fontSize:28, fontWeight:800, color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{s.l}</div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop:10, fontSize:11 }} onClick={()=>addToast('info','Withdrawal initiated!')}>
                      {i===2?'Withdraw':'View Details'}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Transaction History</h3>
                {orders.map(o=>(
                  <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{o.service}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>{o.id} · {o.date}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:700, color:o.status==='Cancelled'?'var(--red)':'var(--green)' }}>{o.status==='Cancelled'?'-':'+'} ${o.amount}</div>
                      <span className={`badge ${o.status==='Completed'?'badge-green':'badge-gray'}`} style={{ fontSize:9 }}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='Reviews' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>Reviews</h1>
              <div style={{ display:'flex', gap:12, marginBottom:24 }}>
                <div className="stat-card" style={{ flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:36, fontWeight:800, color:'var(--orange)' }}>4.97</div>
                  <div style={{ display:'flex', gap:2, justifyContent:'center', margin:'6px 0' }}>
                    {[1,2,3,4,5].map(i=><Star key={i} size={16} fill="var(--orange)" color="var(--orange)"/>)}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>342 total reviews</div>
                </div>
                <div className="stat-card" style={{ flex:2 }}>
                  {[[5,89],[4,8],[3,2],[2,1],[1,0]].map(([n,p])=>(
                    <div key={n} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:11, color:'var(--text-3)', width:16 }}>{n}</span>
                      <Star size={10} fill="var(--orange)" color="var(--orange)"/>
                      <div className="progress" style={{ flex:1 }}><div className="progress-fill" style={{ width:`${p}%`, background:'var(--orange)' }}/></div>
                      <span style={{ fontSize:11, color:'var(--text-3)', width:28 }}>{p}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {[
                { n:'David Park', init:'DP', color:'#8B5CF6', rating:5, text:'Incredibly talented creator. Delivered ahead of schedule and exceeded all expectations.', date:'Oct 2026' },
                { n:'Rachel Kim', init:'RK', color:'#EC4899', rating:5, text:'Best creator I\'ve ever worked with. Understands the brief immediately and nails the tone.', date:'Sep 2026' },
                { n:'James Mitchell', init:'JM', color:'#3B82F6', rating:5, text:'Third time working together. Consistent quality and always on time.', date:'Sep 2026' },
              ].map((r,i)=>(
                <div key={i} style={{ padding:18, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white' }}>{r.init}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{r.n}</div>
                      <div style={{ display:'flex', gap:2 }}>
                        {[1,2,3,4,5].map(s=><Star key={s} size={10} fill="var(--orange)" color="var(--orange)"/>)}
                        <span style={{ fontSize:10, color:'var(--text-3)', marginLeft:4 }}>{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          )}

          {['Analytics','Profile','Settings'].includes(tab) && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:16 }}>{tab}</h1>
              {tab==='Analytics' && <Link to="/analytics" className="btn btn-primary">View Full Analytics Dashboard →</Link>}
              {tab==='Profile' && <Link to={`/creator/1`} className="btn btn-primary">View Public Profile →</Link>}
              {tab==='Settings' && (
                <div style={{ padding:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, maxWidth:500 }}>
                  {['Display Name','Bio','Skills','Hourly Rate','Availability'].map(f=>(
                    <div key={f} className="form-group" style={{ marginBottom:16 }}>
                      <label className="form-label">{f}</label>
                      <input className="input" defaultValue={f==='Hourly Rate'?'$65':f==='Availability'?'Available':f==='Display Name'?user.name:''} placeholder={f}/>
                    </div>
                  ))}
                  <button className="btn btn-primary" onClick={()=>addToast('success','Settings saved!')}>Save Changes</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
