import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Twitter, Github, Linkedin, Instagram, Youtube, ArrowRight, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

const links = {
  Platform:[
    {l:'Explore Creators',p:'/creators'},{l:'Gigs & Services',p:'/services'},
    {l:'AI Studio',p:'/ai-studio'},{l:'Creator Hub',p:'/explore'},
    {l:'Explore Creator Tools',p:'/explore'},
  ],
  Creators:[
    {l:'Become a Creator',p:'/creator-dashboard'},{l:'Creator Dashboard',p:'/creator-dashboard'},
    {l:'Creator Academy',p:'/explore'},{l:'Pricing & Packages',p:'/services'},
    {l:'Success Stories',p:'/explore'},
  ],
  Company:[
    {l:'About SynapseAI',p:'/explore'},{l:'Blog & Updates',p:'/explore'},
    {l:'Press Kit',p:'/explore'},{l:'Careers',p:'/explore'},
    {l:'Contact Us',p:'/explore'},
  ],
  Legal:[
    {l:'Privacy Policy',p:'/explore'},{l:'Terms of Service',p:'/explore'},
    {l:'Cookie Policy',p:'/explore'},{l:'GDPR Compliance',p:'/explore'},
  ],
};

export default function Footer() {
  const { addToast } = useApp();
  const [subEmail, setSubEmail] = React.useState('');
  const subscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subEmail)) { addToast('error', 'Please enter a valid email address'); return; }
    const key = 'synapse_subscribers';
    const subs = JSON.parse(localStorage.getItem(key) || '[]');
    if (subs.includes(subEmail.trim().toLowerCase())) { addToast('info', 'You are already subscribed'); }
    else { subs.push(subEmail.trim().toLowerCase()); localStorage.setItem(key, JSON.stringify(subs)); addToast('success', 'Subscribed! 🎉 Welcome aboard.'); }
    setSubEmail('');
  };
  return (
    <footer style={{ background:'var(--bg-secondary)', borderTop:'1px solid var(--border)', marginTop:80 }}>
      {/* Newsletter */}
      <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,.12),rgba(59,130,246,.06))', borderBottom:'1px solid var(--border)', padding:'44px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
          <div>
            <h3 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Stay ahead with <span className="gradient-text">SynapseAI</span></h3>
            <p style={{ color:'var(--text-2)', fontSize:13 }}>Weekly insights on AI content, creator trends, and platform updates.</p>
          </div>
          <div style={{ display:'flex', gap:8, flex:'0 0 auto', width:'100%', maxWidth:400 }}>
            <div style={{ position:'relative', flex:1 }}>
              <Mail size={13} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }}/>
              <input type="email" placeholder="Enter your email" className="input" style={{ paddingLeft:38 }} value={subEmail} onChange={e=>setSubEmail(e.target.value)}/>
            </div>
            <button className="btn btn-primary" onClick={subscribe}>Subscribe<ArrowRight size={13}/></button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container" style={{ padding:'56px 24px 36px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'260px repeat(4,1fr)', gap:36, flexWrap:'wrap' }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Zap size={17} color="white" fill="white"/>
              </div>
              <div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15 }}><span className="gradient-text">Synapse</span>AI</div>
                <div style={{ fontSize:9, color:'var(--text-3)', letterSpacing:1, textTransform:'uppercase' }}>Creator Hub</div>
              </div>
            </div>
            <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:18 }}>The world's most advanced AI-powered creator marketplace. Connect with elite creators and grow your brand with AI.</p>
            <div style={{ display:'flex', gap:7 }}>
              {[<Twitter size={14}/>,<Github size={14}/>,<Linkedin size={14}/>,<Instagram size={14}/>,<Youtube size={14}/>].map((icon,i)=>(
                <a key={i} href="#" style={{ width:32, height:32, borderRadius:7, background:'var(--bg-glass)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)', transition:'all .2s', textDecoration:'none' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(139,92,246,.12)';(e.currentTarget as HTMLElement).style.color='var(--purple)';(e.currentTarget as HTMLElement).style.borderColor='var(--border-accent)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='var(--bg-glass)';(e.currentTarget as HTMLElement).style.color='var(--text-2)';(e.currentTarget as HTMLElement).style.borderColor='var(--border)';}}
                >{icon}</a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, marginBottom:14 }}>{title}</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {items.map(({l,p}) => (
                  <Link key={l} to={p} style={{ fontSize:13, color:'var(--text-2)', transition:'color .2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='var(--text-1)')}
                    onMouseLeave={e=>(e.currentTarget.style.color='var(--text-2)')}>{l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ marginTop:44, paddingTop:20, borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:12, color:'var(--text-3)' }}>
            © 2026 SynapseAI Marketplace. All features operational.
          </div>
          <div style={{ display:'flex', gap:16 }}>
            {['Privacy','Terms','Cookies','Accessibility'].map(t=>(
              <Link key={t} to="/explore" style={{ fontSize:12, color:'var(--text-3)', transition:'color .2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--text-2)')}
                onMouseLeave={e=>(e.currentTarget.style.color='var(--text-3)')}>{t}</Link>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite' }}/>
            All systems operational
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){footer .container>div:first-of-type{grid-template-columns:1fr 1fr !important}footer .container>div:first-of-type>div:first-child{grid-column:1/-1}}
        @media(max-width:640px){footer .container>div:first-of-type{grid-template-columns:1fr !important}}
      `}</style>
    </footer>
  );
}
