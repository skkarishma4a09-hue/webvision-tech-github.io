import React, { useEffect, useMemo, useState } from 'react';
import { Search, Star, CheckCircle, Clock, RefreshCw, Plus, X, ShoppingCart,
  Heart, Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface ServicePackage {
  name: string;
  price: number;
  delivery: string;
  desc: string;
  revisions: number;
}

interface MarketplaceService {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  delivery: string;
  queue: number;
  featured: boolean;
  packages: Record<'basic' | 'standard' | 'premium', ServicePackage>;
  creator: { id: string; name: string; initials: string; color: string; verified: boolean; level: string };
}

const serviceAddons = [
  { label: 'Extra Fast Delivery (24h)', price: 25 },
  { label: 'Source Files Included', price: 15 },
  { label: 'Social Media Formatting', price: 20 },
];

const creatorColors = ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
function normalizeService(service: Record<string, any>): MarketplaceService {
  const creator = service.creator || {};
  const creatorName = creator.name || 'Creator';
  const packages = service.packages || {};
  return {
    id: service.id,
    title: service.title || 'Untitled service',
    category: service.category || 'Content',
    rating: service.rating || 0,
    reviews: service.reviewCount || 0,
    delivery: service.deliveryTime || 'Delivery time varies',
    queue: service.queue || 0,
    featured: service.featured || false,
    packages: {
      basic: packages.basic || { name: 'Basic', price: 0, delivery: service.deliveryTime || 'Not set', desc: 'Basic package', revisions: service.revisions || 0 },
      standard: packages.standard || { name: 'Standard', price: 0, delivery: service.deliveryTime || 'Not set', desc: 'Standard package', revisions: service.revisions || 0 },
      premium: packages.premium || { name: 'Premium', price: 0, delivery: service.deliveryTime || 'Not set', desc: 'Premium package', revisions: service.revisions || 0 },
    },
    creator: {
      id: creator.id || '',
      name: creatorName,
      initials: creator.initials || creatorName.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(),
      color: creatorColors[(creator.id || '').charCodeAt(0) % creatorColors.length],
      verified: Boolean(creator.verified),
      level: creator.level || 'Starter',
    },
  };
}

export default function Services() {
  const { addToast, user, setAuthView } = useApp();
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddons, setSelectedAddons] = useState<{ label: string; price: number }[]>([]);
  const [requirements, setRequirements] = useState('');
  const [q, setQ] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [activePkg, setActivePkg] = useState<'basic'|'standard'|'premium'>('standard');
  const [orderOpen, setOrderOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    let current = true;
    setLoading(true);
    const params: Record<string, string> = { limit: '100', sort: sortBy };
    if (q.trim()) params.query = q.trim();
    api.getServices(params)
      .then((response) => {
        if (current) setServices((response.data.services || []).map(normalizeService));
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load services.');
      })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [q, sortBy, addToast]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    let current = true;
    api.getFavorites()
      .then((response) => {
        if (current) setFavorites((response.data.services || []).map((service: { id: string }) => service.id));
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load saved services.');
      });
    return () => { current = false; };
  }, [user?.id, addToast]);

  const categories = useMemo(() => [...new Set(services.map((service) => service.category))], [services]);
  const filtered = services.filter((service) => activeCat === 'All' || service.category === activeCat);

  const toggleServiceFavorite = async (id: string) => {
    if (!user) {
      setAuthView('login');
      return;
    }
    try {
      const response = await api.toggleFavoriteService(id);
      setFavorites((items) => response.data.favorited ? [...new Set([...items, id])] : items.filter((item) => item !== id));
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not update saved services.');
    }
  };

  const doOrder = async () => {
    if (!selectedService) return;
    if (!user) {
      setAuthView('login');
      return;
    }
    setOrdering(true);
    try {
      await api.createOrder({
        serviceId: selectedService.id,
        packageName: activePkg,
        addons: selectedAddons.map(({ label }) => serviceAddons.find((addon) => addon.label === label)).filter((addon): addon is typeof serviceAddons[number] => Boolean(addon)),
        ...(requirements.trim() ? { requirements: requirements.trim() } : {}),
      });
      setOrdered(true);
      addToast('success', 'Order request placed. The creator has been notified.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not place this order.');
    } finally {
      setOrdering(false);
    }
  };

  const packagePrice = selectedService?.packages[activePkg].price ?? 0;
  const orderTotal = packagePrice + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  return (
    <div style={{ paddingTop: 70 }}>
      {/* Header */}
      <div style={{ padding: '36px 0 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-tag" style={{ marginBottom: 10 }}><ShoppingCart size={11}/>Services Marketplace</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Gigs & Services</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>Browse premium content services from verified creators.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input className="input" placeholder="Search services..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 42 }} />
            </div>
            <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 180 }}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px' }}>
        {/* Category filter */}
        <div className="scroll-x" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, width: 'max-content', paddingBottom: 4 }}>
            {['All', ...categories.slice(0, 20)].map(cat => (
              <button key={cat} className={`chip${activeCat === cat ? ' active' : ''}`} onClick={() => setActiveCat(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
          <strong>{filtered.length}</strong> services found
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /><p>Loading services…</p></div>
        ) : <div className="grid-3">
          {filtered.map(s => (
            <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'all .3s', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {/* Cover */}
              <div style={{ height: 140, background: `linear-gradient(135deg,${s.creator.color}28,${s.creator.color}12)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 52, opacity: .4 }}>{s.creator.initials[0]}</div>
                {s.featured && <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 99, background: 'rgba(139,92,246,.9)', fontSize: 10, fontWeight: 700, color: 'white' }}>FEATURED</span>}
                <button onClick={e => { e.stopPropagation(); void toggleServiceFavorite(s.id); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={13} fill={favorites.includes(s.id) ? 'var(--pink)' : 'none'} color={favorites.includes(s.id) ? 'var(--pink)' : 'white'} />
                </button>
                <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10, color: 'white', background: 'rgba(0,0,0,.4)', padding: '2px 8px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>{s.queue} in queue</div>
              </div>

              <div style={{ padding: 16 }}>
                {/* Creator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.creator.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.creator.initials}</div>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.creator.name}</span>
                  {s.creator.verified && <CheckCircle size={11} color="var(--blue)" fill="var(--blue)" />}
                  <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', borderRadius: 99, background: `${s.creator.color}18`, color: s.creator.color }}>{s.creator.level}</span>
                </div>

                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{s.title}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Star size={12} fill="var(--orange)" color="var(--orange)" />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.rating}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({s.reviews} reviews)</span>
                </div>

                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{s.delivery}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><RefreshCw size={10} />{s.packages.standard.revisions === 999 ? 'Unlimited' : s.packages.standard.revisions} revisions</span>
                </div>

                <div className="divider" style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Starting at</span>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>${s.packages.basic.price}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: 11, gap: 5 }} onClick={() => { setSelectedService(s); setOrderOpen(true); setActivePkg('standard'); setOrdered(false); setSelectedAddons([]); setRequirements(''); }}>
                    <ShoppingCart size={12} />Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 17, fontWeight: 600 }}>No services found</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Try different search terms or categories.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setQ(''); setActiveCat('All'); }}>Clear filters</button>
          </div>
        )}
      </div>

      {/* Order modal */}
      {orderOpen && selectedService && (
        <div className="modal-backdrop" onClick={() => { setOrderOpen(false); setOrdered(false); }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedService.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>by {selectedService.creator.name}</p>
              </div>
              <button className="btn-icon" onClick={() => setOrderOpen(false)}><X size={15} /></button>
            </div>
            <div style={{ padding: 24 }}>
              {ordered ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Order Placed!</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Your order is confirmed and the creator has been notified.</p>
                </div>
              ) : (
                <>
                  {/* Package selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                    {(['basic', 'standard', 'premium'] as const).map(pkg => {
                      const p = selectedService.packages[pkg];
                      return (
                        <button key={pkg} onClick={() => setActivePkg(pkg)} style={{
                          padding: 14, borderRadius: 12, background: activePkg === pkg ? 'rgba(139,92,246,.12)' : 'var(--bg-glass)',
                          border: `2px solid ${activePkg === pkg ? 'var(--purple)' : 'var(--border)'}`,
                          cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: activePkg === pkg ? 'var(--purple)' : 'var(--text-1)', textTransform: 'capitalize' }}>{p.name}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>${p.price}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>{p.desc}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span>⏱ {p.delivery} delivery</span>
                            <span>🔄 {p.revisions === 999 ? 'Unlimited' : p.revisions} revisions</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add-ons */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Add-ons</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {serviceAddons.map((addon) => (
                        <label key={addon.label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                          <input type="checkbox" checked={selectedAddons.some((item) => item.label === addon.label)} onChange={(event) => setSelectedAddons((items) => event.target.checked ? [...items, addon] : items.filter((item) => item.label !== addon.label))} />
                          <span style={{ flex: 1 }}>{addon.label}</span>
                          <span style={{ fontWeight: 600 }}>+${addon.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label style={{ display: 'block', marginBottom: 20 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Project requirements</span>
                    <textarea className="input" rows={3} maxLength={5000} value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Share the details the creator needs to get started…" style={{ resize: 'vertical' }} />
                  </label>

                  {/* Summary */}
                  <div style={{ padding: '14px 16px', background: 'var(--bg-glass)', borderRadius: 10, marginBottom: 20, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span className="text-secondary">{selectedService.packages[activePkg].name} Package</span>
                      <span>${packagePrice}</span>
                    </div>
                    {selectedAddons.map((addon) => <div key={addon.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span className="text-secondary">{addon.label}</span><span>${addon.price}</span></div>)}
                    <div className="divider" style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                      <span>Total</span>
                      <span className="gradient-text">${orderTotal}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={doOrder} disabled={ordering}>
                    {ordering ? <><div className="spinner spinner-sm" />Submitting Order...</> : `Place Order — $${orderTotal}`}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    Order request only · You won’t be charged in this demo
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
