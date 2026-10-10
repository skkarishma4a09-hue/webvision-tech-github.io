import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Eye, Cpu,
  BarChart2, Calendar, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analytics } from '../data/mockData';

const COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EC4899','#06B6D4'];
const ranges = ['Today','7 Days','30 Days','3 Months','1 Year'];

export default function Analytics() {
  const { addToast } = useApp();
  const [range, setRange] = useState('30 Days');

  const stats = [
    { label:'Total Earnings', value:'$7,400', change:'+24%', up:true, icon:<DollarSign size={18}/>, color:'var(--purple)' },
    { label:'Orders', value:'38', change:'+31%', up:true, icon:<ShoppingBag size={18}/>, color:'var(--blue)' },
    { label:'Profile Views', value:'2,840', change:'+18%', up:true, icon:<Eye size={18}/>, color:'var(--cyan)' },
    { label:'AI Generations', value:'312', change:'-5%', up:false, icon:<Cpu size={18}/>, color:'var(--pink)' },
    { label:'Conversion Rate', value:'4.2%', change:'+0.8%', up:true, icon:<TrendingUp size={18}/>, color:'var(--green)' },
    { label:'Avg. Order Value', value:'$195', change:'+12%', up:true, icon:<BarChart2 size={18}/>, color:'var(--orange)' },
  ];

  return (
    <div style={{ paddingTop:70 }}>
      {/* Header */}
      <div style={{ padding:'28px 0 20px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
            <div>
              <div className="section-tag" style={{ marginBottom:8 }}><BarChart2 size={11}/>Analytics</div>
              <h1 style={{ fontSize:28, fontWeight:700, marginBottom:4 }}>Performance Dashboard</h1>
              <p style={{ color:'var(--text-2)', fontSize:13 }}>Track your growth and content performance across all channels.</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <div className="tabs">
                {ranges.map(r=><button key={r} className={`tab${range===r?' active':''}`} style={{ fontSize:11 }} onClick={()=>setRange(r)}>{r}</button>)}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ gap:6 }} onClick={()=>addToast('success','Report downloading...')}><Download size={13}/>Export</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'28px 24px' }}>
        {/* KPI cards */}
        <div className="grid-3" style={{ marginBottom:28 }}>
          {stats.map((s,i)=>(
            <div key={i} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:`${s.color}14`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>{s.icon}</div>
                <span style={{ fontSize:12, fontWeight:600, color:s.up?'var(--green)':'var(--red)', display:'flex', alignItems:'center', gap:3 }}>
                  {s.up?<TrendingUp size={12}/>:<TrendingDown size={12}/>}{s.change}
                </span>
              </div>
              <div style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid-2" style={{ marginBottom:24 }}>
          {/* Earnings chart */}
          <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Earnings Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.earnings}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-3)' }}/>
                <YAxis tick={{ fontSize:11, fill:'var(--text-3)' }} tickFormatter={v=>`$${v/1000}k`}/>
                <Tooltip formatter={(v:any)=>[`$${v.toLocaleString()}`, 'Earnings']} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
                <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="url(#earningsGrad)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders chart */}
          <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Orders & Projects</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.orders}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-3)' }}/>
                <YAxis tick={{ fontSize:11, fill:'var(--text-3)' }}/>
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
                <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid-2" style={{ marginBottom:24 }}>
          {/* AI usage */}
          <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>AI Tool Usage</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.aiUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                <XAxis type="number" tick={{ fontSize:10, fill:'var(--text-3)' }}/>
                <YAxis dataKey="tool" type="category" tick={{ fontSize:10, fill:'var(--text-3)' }} width={80}/>
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
                <Bar dataKey="uses" radius={[0,4,4,0]}>
                  {analytics.aiUsage.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly activity */}
          <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--text-3)' }}/>
                <YAxis tick={{ fontSize:11, fill:'var(--text-3)' }}/>
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
                <Line type="monotone" dataKey="earn" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Earnings"/>
                <Line type="monotone" dataKey="msgs" stroke="#3B82F6" strokeWidth={2} dot={false} name="Messages"/>
                <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} dot={false} name="Projects"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI usage pie + top metrics */}
        <div className="grid-2">
          <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Revenue Breakdown</h3>
            <div style={{ display:'flex', alignItems:'center', gap:24 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={[{value:65},{value:20},{value:15}]} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {[COLORS[0],COLORS[1],COLORS[2]].map((c,i)=><Cell key={i} fill={c}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'Blog Writing', pct:'65%', color:COLORS[0], amount:'$4,810' },
                  { label:'Social Media', pct:'20%', color:COLORS[1], amount:'$1,480' },
                  { label:'Email Marketing', pct:'15%', color:COLORS[2], amount:'$1,110' },
                ].map((item,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:item.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, flex:1 }}>{item.label}</span>
                    <span style={{ fontSize:12, color:'var(--text-3)', marginRight:8 }}>{item.pct}</span>
                    <span style={{ fontSize:12, fontWeight:600 }}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding:22, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Key Metrics</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { l:'Client Engagement Rate', v:68, color:'var(--purple)' },
                { l:'Content Approval Rate', v:94, color:'var(--green)' },
                { l:'On-time Delivery Rate', v:97, color:'var(--blue)' },
                { l:'Repeat Client Rate', v:72, color:'var(--cyan)' },
                { l:'Response Rate', v:99, color:'var(--orange)' },
              ].map((m,i)=>(
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                    <span style={{ color:'var(--text-2)' }}>{m.l}</span>
                    <span style={{ fontWeight:700, color:m.color }}>{m.v}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width:`${m.v}%`, background:m.color }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
