import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, Smile, Paperclip, Phone, Video, MoreVertical,
  CheckCheck, Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface Conversation {
  id: string;
  user: { id: string; name: string; initials: string; online: boolean; color: string };
  lastMsg: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  read?: boolean;
}

const emptyConversation: Conversation = {
  id: '',
  user: { id: '', name: '', initials: '', online: false, color: 'var(--purple)' },
  lastMsg: '',
  unread: 0,
};

export default function Chat() {
  const { addToast, user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConversation = searchParams.get('conversation');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation>(emptyConversation);
  const [input, setInput] = useState('');
  const [srch, setSrch] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior:'smooth' });
  }, [chatHistory, active.id]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActive(emptyConversation);
      setLoading(false);
      return;
    }
    let current = true;
    setLoading(true);
    api.getConversations()
      .then((response) => {
        if (!current) return;
        const items = (response.data.conversations || []).map((conversation: Omit<Conversation, 'user'> & { user: Omit<Conversation['user'], 'color'> }) => ({
          ...conversation,
          user: {
            ...conversation.user,
            color: ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981'][conversation.user.id.charCodeAt(0) % 4],
          },
        })) as Conversation[];
        setConversations(items);
        const selected = items.find((conversation) => conversation.id === requestedConversation) || items[0];
        setActive(selected || emptyConversation);
        if (selected && selected.id !== requestedConversation) setSearchParams({ conversation: selected.id }, { replace: true });
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load conversations.');
      })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [user?.id, requestedConversation, addToast, setSearchParams]);

  useEffect(() => {
    if (!active.id) return;
    let current = true;
    let firstLoad = true;
    const loadMessages = () => api.getMessages(active.id)
      .then((response) => {
        if (!current) return;
        setChatHistory((history) => ({ ...history, [active.id]: response.data.messages || [] }));
        setConversations((items) => items.map((conversation) => conversation.id === active.id ? { ...conversation, unread: 0 } : conversation));
        if (firstLoad) void api.markConversationRead(active.id).catch((error: unknown) => {
          addToast('error', error instanceof Error ? error.message : 'Could not mark conversation as read.');
        });
      })
      .catch((error: unknown) => {
        if (current && firstLoad) addToast('error', error instanceof Error ? error.message : 'Could not load messages.');
      })
      .finally(() => { firstLoad = false; });
    void loadMessages();
    const timer = window.setInterval(() => { void loadMessages(); }, 5000);
    return () => { current = false; window.clearInterval(timer); };
  }, [active.id, addToast]);

  const selectConversation = (conversation: Conversation) => {
    setActive(conversation);
    setSearchParams({ conversation: conversation.id });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !active.id || sending) return;
    setSending(true);
    try {
      const response = await api.sendMessage(active.id, text);
      const message = response.data.message as ChatMessage;
      setChatHistory((history) => ({ ...history, [active.id]: [...(history[active.id] || []), message] }));
      setConversations((items) => items.map((conversation) => conversation.id === active.id ? { ...conversation, lastMsg: message.text } : conversation));
      setInput('');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const emojis = ['😊','👍','🎉','💡','🔥','✅','❤️','😂','🚀','💪','✨','🙏'];
  const filtered = conversations.filter((conversation) => !srch || conversation.user.name.toLowerCase().includes(srch.toLowerCase()));

  return (
    <div style={{ paddingTop:70, height:'100vh', display:'flex', overflow:'hidden' }}>
      {/* Conversations list */}
      <div style={{ width:300, background:'var(--bg-secondary)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'16px 16px 10px', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Messages</h2>
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }}/>
            <input className="input" placeholder="Search conversations..." value={srch} onChange={e=>setSrch(e.target.value)} style={{ paddingLeft:34, fontSize:12, padding:'8px 10px 8px 34px' }}/>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.map(m=>(
            <button key={m.id} onClick={()=>selectConversation(m)} style={{
              display:'flex', gap:10, padding:'13px 16px', width:'100%',
              background:active.id===m.id?'rgba(139,92,246,.08)':'transparent',
              borderLeft:`3px solid ${active.id===m.id?'var(--purple)':'transparent'}`,
              border:'none', cursor:'pointer', textAlign:'left', transition:'all .15s',
            }}
              onMouseEnter={e=>{if(active.id!==m.id)(e.currentTarget as HTMLElement).style.background='var(--bg-glass)';}}
              onMouseLeave={e=>{if(active.id!==m.id)(e.currentTarget as HTMLElement).style.background='transparent';}}
            >
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:m.user.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white' }}>{m.user.initials}</div>
                {m.user.online && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'var(--green)', border:'2px solid var(--bg-secondary)' }}/>}
              </div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{m.user.name}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.lastMsg}</div>
              </div>
              {m.unread>0 && <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--purple)', fontSize:9, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{m.unread}</div>}
            </button>
          ))}
          {!loading && filtered.length === 0 && <div style={{ padding:20, color:'var(--text-3)', fontSize:12, textAlign:'center' }}>{srch ? 'No matching conversations.' : 'No conversations yet.'}</div>}
        </div>
      </div>

      {/* Chat window */}
      {active.id ? (<div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Chat header */}
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:active.user.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white' }}>{active.user.initials}</div>
            {active.user.online && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'var(--green)', border:'2px solid var(--bg-card)' }}/>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{active.user.name}</div>
            <div style={{ fontSize:11, color:active.user.online?'var(--green)':'var(--text-3)' }}>{active.user.online?'Online':'Last seen recently'}</div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button className="btn-icon" title="Voice call" onClick={()=>addToast('info','Starting voice call...')}><Phone size={15}/></button>
            <button className="btn-icon" title="Video call" onClick={()=>addToast('info','Starting video call...')}><Video size={15}/></button>
            <button className="btn-icon"><MoreVertical size={15}/></button>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12, background:'var(--bg-primary)' }}>
          {(chatHistory[active.id]||[]).map((msg)=>(
            <div key={msg.id} style={{ display:'flex', justifyContent:msg.from==='me'?'flex-end':'flex-start', gap:8 }}>
              {msg.from==='them' && (
                <div style={{ width:30, height:30, borderRadius:'50%', background:active.user.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', flexShrink:0, alignSelf:'flex-end' }}>{active.user.initials}</div>
              )}
              <div style={{ maxWidth:'70%' }}>
                <div style={{
                  padding:'10px 14px', borderRadius:msg.from==='me'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                  background:msg.from==='me'?'var(--grad)':'var(--bg-card)',
                  border:msg.from==='me'?'none':'1px solid var(--border)',
                  fontSize:14, lineHeight:1.5,
                  color:msg.from==='me'?'white':'var(--text-1)',
                }}>
                  {msg.text}
                </div>
                <div style={{ display:'flex', gap:4, alignItems:'center', marginTop:3, justifyContent:msg.from==='me'?'flex-end':'flex-start' }}>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>{msg.time}</span>
                  {msg.from==='me' && <CheckCheck size={11} color="var(--cyan)"/>}
                </div>
              </div>
            </div>
          ))}
          {sending && <div style={{ fontSize:11, color:'var(--text-3)', textAlign:'right' }}>Sending…</div>}
          <div ref={messagesEnd}/>
        </div>

        {/* Emoji picker */}
        {showEmoji && (
          <div style={{ padding:'10px 20px', background:'var(--bg-card)', borderTop:'1px solid var(--border)', display:'flex', flexWrap:'wrap', gap:6 }}>
            {emojis.map(e=>(
              <button key={e} onClick={()=>{ setInput(p=>p+e); setShowEmoji(false); inputRef.current?.focus(); }} style={{ fontSize:22, background:'none', border:'none', cursor:'pointer', padding:'2px 4px', borderRadius:6, transition:'transform .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.3)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
              >{e}</button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{ padding:'12px 20px', background:'var(--bg-card)', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn-icon" title="Attach file" onClick={()=>addToast('info','File upload coming soon!')}><Paperclip size={15}/></button>
          <button className="btn-icon" title="Emoji" onClick={()=>setShowEmoji(!showEmoji)}><Smile size={15}/></button>
          <div style={{ flex:1, position:'relative' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              placeholder="Type a message..."
              style={{ width:'100%', padding:'10px 14px', background:'var(--bg-glass)', border:'1px solid var(--border)', borderRadius:99, color:'var(--text-1)', fontSize:14, outline:'none', transition:'border-color .2s' }}
              onFocus={e=>(e.currentTarget.style.borderColor='var(--purple)')}
              onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}
            />
          </div>
          <button className="btn-icon" title="Voice message" onClick={()=>addToast('info','Voice messages coming soon!')}><Mic size={15}/></button>
          <button onClick={() => void send()} disabled={!input.trim() || sending} style={{ width:38, height:38, borderRadius:'50%', background:input.trim()?'var(--grad)':'var(--bg-glass)', border:`1px solid ${input.trim()?'transparent':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:input.trim()?'pointer':'not-allowed', transition:'all .2s', color:input.trim()?'white':'var(--text-3)' }}>
            <Send size={15}/>
          </button>
        </div>
      </div>) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}>
          {loading ? 'Loading conversations…' : 'Select a conversation to start messaging.'}
        </div>
      )}
    </div>
  );
}
