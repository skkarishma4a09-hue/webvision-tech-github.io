import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Sparkles, Users, ShoppingBag, LayoutDashboard, BarChart2,
  MessageSquare, Bell, Settings, FileText, Cpu, Star, X, ArrowRight, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

const cmds = [
  { g:'Pages', icon:<Zap size={13}/>,            label:'Home',              path:'/' },
  { g:'Pages', icon:<Sparkles size={13}/>,       label:'Explore',           path:'/explore' },
  { g:'Pages', icon:<Users size={13}/>,          label:'Browse Creators',   path:'/creators' },
  { g:'Pages', icon:<ShoppingBag size={13}/>,    label:'Gigs & Services',   path:'/services' },
  { g:'Pages', icon:<LayoutDashboard size={13}/>,label:'Client Dashboard',  path:'/dashboard' },
  { g:'Pages', icon:<BarChart2 size={13}/>,      label:'Analytics',         path:'/analytics' },
  { g:'Pages', icon:<MessageSquare size={13}/>,  label:'Messages',          path:'/chat' },
  { g:'Pages', icon:<Bell size={13}/>,           label:'Notifications',     path:'/notifications' },
  { g:'Pages', icon:<Star size={13}/>,           label:'Favorites',         path:'/favorites' },
  { g:'AI Tools', icon:<Cpu size={13}/>,         label:'AI Studio',         path:'/ai-studio' },
  { g:'AI Tools', icon:<FileText size={13}/>,    label:'Blog Generator',    path:'/ai-studio' },
  { g:'AI Tools', icon:<FileText size={13}/>,    label:'Email Generator',   path:'/ai-studio' },
  { g:'AI Tools', icon:<Globe size={13}/>,       label:'Translator',        path:'/ai-studio' },
  { g:'Actions', icon:<Settings size={13}/>,     label:'Settings',          path:'/dashboard' },
  { g:'Actions', icon:<Users size={13}/>,        label:'Creator Dashboard', path:'/creator-dashboard' },
];

export default function CommandMenu() {
  const { cmdOpen, setCmdOpen, addToast } = useApp();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const nav = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cmdOpen) { setQ(''); setSel(0); setTimeout(() => ref.current?.focus(), 40); }
  }, [cmdOpen]);

  const filtered = q ? cmds.filter(c => c.label.toLowerCase().includes(q.toLowerCase()) || c.g.toLowerCase().includes(q.toLowerCase())) : cmds;

  const grouped = filtered.reduce((a, c) => { (a[c.g] ??= []).push(c); return a; }, {} as Record<string, typeof cmds>);

  useEffect(() => {
    const h = (e:KeyboardEvent) => {
      if (!cmdOpen) return;
      if (e.key==='Escape') setCmdOpen(false);
      if (e.key==='ArrowDown') { e.preventDefault(); setSel(s=>Math.min(s+1,filtered.length-1)); }
      if (e.key==='ArrowUp') { e.preventDefault(); setSel(s=>Math.max(s-1,0)); }
      if (e.key==='Enter') { e.preventDefault(); if(filtered[sel]) go(filtered[sel]); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const go = (c: typeof cmds[0]) => {
    nav(c.path);
    setCmdOpen(false);
    addToast('info', `Navigating to ${c.label}`);
  };

  if (!cmdOpen) return null;
  return (
    <div className="modal-backdrop" onClick={() => setCmdOpen(false)}>
      <div style={{ width:'100%', maxWidth:580, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.7)', animation:'slideUp .2s ease' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <Search size={15} color="var(--text-3)"/>
          <input ref={ref} value={q} onChange={e=>{setQ(e.target.value);setSel(0);}} placeholder="Search pages, creators, AI tools..." style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-1)', fontSize:15 }}/>
          {q && <button onClick={()=>setQ('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}><X size={13}/></button>}
          <kbd>Esc</kbd>
        </div>
        <div style={{ maxHeight:400, overflowY:'auto', padding:8 }}>
          {Object.entries(grouped).map(([grp, items]) => (
            <div key={grp}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text-3)', padding:'8px 12px 4px' }}>{grp}</div>
              {items.map((item, i) => {
                const gi = filtered.indexOf(item);
                return (
                  <button key={i} onClick={()=>go(item)} onMouseEnter={()=>setSel(gi)} style={{
                    display:'flex', alignItems:'center', gap:11, width:'100%', padding:'10px 12px',
                    borderRadius:8, background:gi===sel?'rgba(139,92,246,.12)':'transparent',
                    border:'none', cursor:'pointer', color:gi===sel?'var(--purple)':'var(--text-2)',
                    fontSize:13, fontWeight:500, textAlign:'left', transition:'all .1s',
                  }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:gi===sel?'rgba(139,92,246,.2)':'var(--bg-glass)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{item.icon}</div>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {gi===sel && <ArrowRight size={13}/>}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length===0 && <div style={{ padding:'32px 20px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>No results for "{q}"</div>}
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:14 }}>
          {[['↑↓','navigate'],['Enter','select'],['Esc','close']].map(([k,l])=>(
            <span key={k} style={{ fontSize:11, color:'var(--text-3)', display:'flex', gap:5, alignItems:'center' }}><kbd>{k}</kbd>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
