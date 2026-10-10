import React, { useEffect, useState } from 'react';
import { Sparkles, Copy, Download, RefreshCw, Share2, Search,
  Star, Clock, Trash2, Check, WandSparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiTools, aiTemplates } from '../data/mockData';
import { api } from '../services/api';

interface AiHistoryItem {
  id: string;
  toolId: string;
  input: string;
  output: string;
  createdAt: string;
}

export default function AIStudio() {
  const { addToast, favorites, toggleFav, user, authLoading, setAuthView } = useApp();
  const [activeTool, setActiveTool] = useState(aiTools[0]);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('Professional');
  const [lang, setLang] = useState('English');
  const [length, setLength] = useState('Medium');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [srch, setSrch] = useState('');
  const [activeTab, setActiveTab] = useState<'tools'|'templates'|'history'>('tools');
  const [savedOutputs, setSavedOutputs] = useState<AiHistoryItem[]>([]);

  const filteredTools = aiTools.filter(t => !srch || t.name.toLowerCase().includes(srch.toLowerCase()) || t.desc.toLowerCase().includes(srch.toLowerCase()));

  useEffect(() => {
    if (!user) {
      setSavedOutputs([]);
      return;
    }

    let current = true;
    api.getAiHistory()
      .then((response) => {
        if (current) setSavedOutputs(response.data.history);
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load AI history.');
      });

    return () => { current = false; };
  }, [user?.id, addToast]);

  const generate = async (action?: string) => {
    const source = action ? output : input;
    if (!source.trim()) { addToast('error', 'Please enter your content brief'); return; }
    if (!user) {
      addToast('info', 'Sign in to generate and save content.');
      setAuthView('login');
      return;
    }

    setGenerating(true);
    if (!action) setOutput('');
    try {
      const response = await api.generateAiContent({
        toolId: action ? 'rewrite' : activeTool.id,
        input: source,
        settings: { tone, length, language: lang },
        ...(action ? { action } : {}),
      });
      const generation: AiHistoryItem = response.data;
      setOutput(generation.output);
      setSavedOutputs((items) => [generation, ...items.filter((item) => item.id !== generation.id)]);
      addToast('success', action ? 'Your content has been updated.' : 'Content generated and saved to your history.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Content generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('success', 'Copied to clipboard!');
    } catch {
      addToast('error', 'Clipboard access was denied. Select and copy the text instead.');
    }
  };

  const saveOutput = () => {
    if (!output) return;
    setActiveTab('history');
    addToast('info', 'Every generated version is saved automatically.');
  };

  const deleteHistoryItem = async (id: string) => {
    if (!window.confirm('Delete this generation from your history?')) return;
    try {
      await api.deleteAiGeneration(id);
      setSavedOutputs((items) => items.filter((item) => item.id !== id));
      addToast('success', 'Generation deleted.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not delete this generation.');
    }
  };

  const exportOutput = () => {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTool.id}-content.md`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Markdown file downloaded.');
  };

  const shareOutput = async () => {
    if (!output) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${activeTool.name} draft`, text: output });
      } else {
        await navigator.clipboard.writeText(output);
        addToast('success', 'Content copied so you can share it.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      addToast('error', 'Could not share this content.');
    }
  };

  return (
    <div className="ai-studio-page">
      <div className="ai-studio-shell">

        {/* Sidebar — Tools list */}
        <aside className="ai-studio-sidebar">
          {/* Header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>AI Studio</span>
            </div>
            {/* Tabs */}
            <div className="tabs">
              {(['tools','templates','history'] as const).map(t => (
                <button key={t} className={`tab${activeTab===t?' active':''}`} style={{ fontSize: 11, textTransform: 'capitalize', flex: 1 }} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* Search */}
          {activeTab === 'tools' && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input className="input" placeholder="Search tools..." value={srch} onChange={e => setSrch(e.target.value)} style={{ paddingLeft: 34, fontSize: 12, padding: '8px 10px 8px 34px' }} />
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {activeTab === 'tools' && filteredTools.map(tool => (
              <button key={tool.id} onClick={() => { setActiveTool(tool); setOutput(''); setInput(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: activeTool.id === tool.id ? `${tool.color}12` : 'transparent',
                  border: `1px solid ${activeTool.id === tool.id ? `${tool.color}30` : 'transparent'}`,
                  cursor: 'pointer', marginBottom: 2, textAlign: 'left', transition: 'all .2s',
                }}
                onMouseEnter={e => { if (activeTool.id !== tool.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-glass)'; }}
                onMouseLeave={e => { if (activeTool.id !== tool.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${tool.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tool.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: activeTool.id === tool.id ? 700 : 500, color: activeTool.id === tool.id ? tool.color : 'var(--text-1)' }}>{tool.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{tool.desc}</div>
                </div>
                {favorites.includes(tool.id) && <Star size={10} fill="var(--orange)" color="var(--orange)" />}
              </button>
            ))}

            {activeTab === 'templates' && aiTemplates.map(t => (
              <button key={t.id} onClick={() => { setActiveTab('tools'); setInput(t.desc); addToast('info', `Template "${t.name}" loaded!`); }}
                style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', padding: '12px 12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', marginBottom: 6, textAlign: 'left', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-glass)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(139,92,246,.12)', color: 'var(--purple)', border: '1px solid rgba(139,92,246,.2)' }}>{t.category}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4 }}>{t.desc}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', gap: 8 }}>
                  <span>⭐ {t.rating}</span>
                  <span>🔥 {t.uses.toLocaleString()} uses</span>
                </div>
              </button>
            ))}

            {activeTab === 'history' && (
              savedOutputs.length > 0 ? savedOutputs.map((item) => {
                const historyTool = aiTools.find((tool) => tool.id === item.toolId);
                return (
                <div key={item.id} className="ai-history-item">
                  <button onClick={() => {
                    setOutput(item.output);
                    setInput(item.input);
                    if (historyTool) setActiveTool(historyTool);
                    setActiveTab('tools');
                  }} className="ai-history-open">
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{historyTool?.name || item.toolId}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{item.output.slice(0, 60)}...</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>📅 {new Date(item.createdAt).toLocaleDateString()}</div>
                  </button>
                  <button className="btn-icon btn-icon-sm ai-history-delete" title="Delete generation" aria-label="Delete generation" onClick={() => void deleteHistoryItem(item.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)' }}>
                  <Clock size={28} style={{ margin: '0 auto 8px', opacity: .4 }} />
                  <p style={{ fontSize: 12 }}>No history yet. Generate some content!</p>
                </div>
              )
            )}
          </div>
        </aside>

        {/* Main workspace */}
        <main className="ai-studio-main">
          <div className="ai-studio-intro">
            <div>
              <span className="ai-studio-kicker"><WandSparkles size={13} /> CREATOR WORKSPACE</span>
              <h1>Make your next idea <span>unstoppable.</span></h1>
              <p>Build polished content with a clear brief, your own voice, and AI that works with you.</p>
            </div>
            <div className="ai-studio-live"><span /> Gemini-powered generation</div>
          </div>

          {/* Tool header */}
          <div className="ai-tool-header">
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${activeTool.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{activeTool.icon}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{activeTool.name}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{activeTool.desc}</p>
            </div>
            <button onClick={() => toggleFav(activeTool.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--text-2)', transition: 'all .2s' }}>
              <Star size={13} fill={favorites.includes(activeTool.id) ? 'var(--orange)' : 'none'} color={favorites.includes(activeTool.id) ? 'var(--orange)' : 'currentColor'} />
              {favorites.includes(activeTool.id) ? 'Saved' : 'Save Tool'}
            </button>
          </div>

          <div className="ai-studio-workspace">
            {/* Input panel */}
            <section className="ai-input-panel">
              <div className="ai-input-scroll">
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">{activeTool.field}</label>
                  <textarea className="input" value={input} onChange={e => setInput(e.target.value)} placeholder={`e.g. ${activeTool.field}...`} style={{ minHeight: 120 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Tone</label>
                    <select className="select" value={tone} onChange={e => setTone(e.target.value)} style={{ fontSize: 13 }}>
                      {['Professional','Friendly','Casual','Formal','Creative','Persuasive','Empathetic'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Length</label>
                    <select className="select" value={length} onChange={e => setLength(e.target.value)} style={{ fontSize: 13 }}>
                      {['Short','Medium','Long','Comprehensive'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Language</label>
                    <select className="select" value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 13 }}>
                      {['English','Spanish','French','German','Japanese','Mandarin','Hindi','Portuguese','Arabic'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-primary" style={{ width: '100%', gap: 8, padding: '12px' }} onClick={() => void generate()} disabled={generating || authLoading}>
                  {generating ? <><div className="spinner spinner-sm" />Creating your draft...</> : authLoading ? 'Checking your session...' : <><Sparkles size={15} />Generate Content</>}
                </button>
              </div>
            </section>

            {/* Output panel */}
            <section className="ai-output-panel">
              {/* Toolbar */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center', background: 'var(--bg-card)' }}>
                <span className="ai-output-meta">
                  {output ? `${output.trim().split(/\s+/).length} words · ${output.length} characters` : 'Your generated content will appear here'}
                </span>
                <button className="btn btn-secondary btn-sm" style={{ gap: 5 }} onClick={copyOutput} disabled={!output}>
                  {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                </button>
                <button className="btn btn-secondary btn-sm" style={{ gap: 5 }} onClick={saveOutput} disabled={!output}>
                  <Clock size={12} />History
                </button>
                <button className="btn btn-secondary btn-sm" style={{ gap: 5 }} onClick={exportOutput} disabled={!output}>
                  <Download size={12} />Export
                </button>
                <button className="btn btn-secondary btn-sm" style={{ gap: 5 }} onClick={() => void generate()} disabled={generating || !output}>
                  <RefreshCw size={12} />Regen
                </button>
                <button className="btn btn-ghost btn-sm" style={{ gap: 5 }} onClick={() => void shareOutput()} disabled={!output}>
                  <Share2 size={12} />Share
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {generating ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'anim-glow 1.5s ease-in-out infinite' }}>
                      <Sparkles size={24} color="white" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Generating your content...</div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Analyzing context, tone, and structure</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                      ))}
                    </div>
                  </div>
                ) : output ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.8, color: 'var(--text-1)', margin: 0 }}>
                      {output}
                    </pre>
                    {/* AI Actions */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, fontWeight: 600 }}>AI ACTIONS</div>
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                        {['Improve','Rewrite','Shorten','Expand','Make Professional','Make Friendly','Make Creative','Simplify'].map(action => (
                          <button key={action} className="chip" style={{ fontSize: 11 }} disabled={generating} onClick={() => void generate(action)}>
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, textAlign: 'center', color: 'var(--text-3)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: `${activeTool.color}12`, border: `1px solid ${activeTool.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{activeTool.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-2)', marginBottom: 6 }}>Ready to generate</div>
                      <div style={{ fontSize: 13 }}>Enter your brief on the left and click Generate.</div>
                    </div>
                    {/* Quick examples */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Try an example:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                          'AI tools for marketers',
                          'SaaS product launch',
                          'E-commerce growth tips',
                        ].map(ex => (
                          <button key={ex} className="chip" style={{ fontSize: 11 }} onClick={() => setInput(ex)}>
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
        </div>
    </div>
  );
}
