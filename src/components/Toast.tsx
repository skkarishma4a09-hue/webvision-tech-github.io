import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const cfg = {
  success: { icon:<CheckCircle size={15}/>, color:'#10b981', border:'rgba(16,185,129,.3)' },
  error:   { icon:<XCircle size={15}/>,    color:'#ef4444', border:'rgba(239,68,68,.3)' },
  warning: { icon:<AlertTriangle size={15}/>,color:'#f59e0b',border:'rgba(245,158,11,.3)' },
  info:    { icon:<Info size={15}/>,       color:'#3b82f6', border:'rgba(59,130,246,.3)' },
};

export default function Toast() {
  const { toasts, removeToast } = useApp();
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
      {toasts.map(t => {
        const c = cfg[t.type];
        return (
          <div key={t.id} style={{
            display:'flex', alignItems:'center', gap:10,
            background:'var(--bg-card)', border:`1px solid ${c.border}`,
            borderLeft:`3px solid ${c.color}`, borderRadius:10,
            padding:'12px 16px', boxShadow:'0 8px 32px rgba(0,0,0,.5)',
            animation:'slideUp .3s ease', pointerEvents:'all',
            minWidth:240, maxWidth:340, backdropFilter:'blur(20px)',
          }}>
            <span style={{ color:c.color, flexShrink:0 }}>{c.icon}</span>
            <span style={{ fontSize:13, flex:1, fontWeight:500, lineHeight:1.4, color:'var(--text-1)' }}>{t.msg}</span>
            <button onClick={() => removeToast(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:2, flexShrink:0 }}>
              <X size={12}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}
