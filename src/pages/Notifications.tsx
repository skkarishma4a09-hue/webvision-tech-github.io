import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Trash2, LoaderCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
}

const categories = ['All', 'Messages', 'Projects', 'Orders', 'Payments', 'Reviews', 'AI', 'System'];

function categoryForType(type: string): string {
  const upper = type.toUpperCase();
  if (upper.includes('MESSAGE')) return 'Messages';
  if (upper.includes('PROJECT')) return 'Projects';
  if (upper.includes('ORDER')) return 'Orders';
  if (upper.includes('PAYMENT')) return 'Payments';
  if (upper.includes('REVIEW')) return 'Reviews';
  if (upper.includes('AI')) return 'AI';
  return 'System';
}

function iconForType(type: string): string {
  const category = categoryForType(type);
  return ({ Messages: '💬', Projects: '📁', Orders: '🛍️', Payments: '💳', Reviews: '⭐', AI: '✨', System: '🔔' })[category] || '🔔';
}

export default function Notifications() {
  const { addToast, user, authLoading, setAuthView } = useApp();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNotifs([]);
      setLoading(false);
      return;
    }
    let current = true;
    setLoading(true);
    api.getNotifications()
      .then((response) => {
        if (current) setNotifs(response.data.notifications);
      })
      .catch((error: unknown) => {
        if (current) addToast('error', error instanceof Error ? error.message : 'Could not load notifications.');
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => { current = false; };
  }, [user?.id, authLoading, addToast]);

  const filtered = useMemo(
    () => notifs.filter((notification) => cat === 'All' || categoryForType(notification.type) === cat),
    [cat, notifs],
  );
  const unreadCount = notifs.filter((notification) => notification.unread).length;

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifs((items) => items.map((notification) => ({ ...notification, unread: false })));
      addToast('success', 'All notifications marked as read.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not update notifications.');
    }
  };

  const markOne = async (notification: NotificationItem) => {
    if (!notification.unread || pending.includes(notification.id)) return;
    setPending((items) => [...items, notification.id]);
    try {
      await api.markNotificationRead(notification.id);
      setNotifs((items) => items.map((item) => item.id === notification.id ? { ...item, unread: false } : item));
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not update notification.');
    } finally {
      setPending((items) => items.filter((id) => id !== notification.id));
    }
  };

  const deleteOne = async (id: string) => {
    setPending((items) => [...items, id]);
    try {
      await api.deleteNotification(id);
      setNotifs((items) => items.filter((item) => item.id !== id));
      addToast('info', 'Notification deleted.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not delete notification.');
    } finally {
      setPending((items) => items.filter((pendingId) => pendingId !== id));
    }
  };

  return (
    <div style={{ paddingTop: 70 }}>
      <div style={{ padding: '36px 0 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Notifications</h1>
                {unreadCount > 0 && <span style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--purple)', fontSize: 12, fontWeight: 700, color: 'white' }}>{unreadCount}</span>}
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Stay up to date with your projects and messages.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => void markAll()} disabled={!unreadCount}>
              <Check size={13} />Mark all read
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <button key={category} className={`chip${cat === category ? ' active' : ''}`} onClick={() => setCat(category)}>{category}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 24 }}>
        {loading ? (
          <div className="empty-state"><LoaderCircle size={26} className="spinner" /><p>Loading notifications…</p></div>
        ) : !user ? (
          <div className="empty-state">
            <Bell size={32} />
            <h3>Sign in to see your notifications</h3>
            <button className="btn btn-primary" onClick={() => setAuthView('login')}>Sign in</button>
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((notification) => (
              <div key={notification.id} style={{ display: 'flex', gap: 14, padding: '16px 20px', background: 'var(--bg-card)', border: `1px solid ${notification.unread ? 'rgba(139,92,246,.2)' : 'var(--border)'}`, borderRadius: 12, transition: 'all .2s', position: 'relative' }}>
                {notification.unread && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '8px 0 0 8px', background: 'var(--purple)' }} />}
                <span style={{ fontSize: 26, flexShrink: 0 }}>{iconForType(notification.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: notification.unread ? 600 : 400 }}>{notification.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{notification.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{notification.text}</div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <button className="btn-icon btn-icon-sm" title="Mark read" aria-label="Mark notification as read" onClick={() => void markOne(notification)} disabled={!notification.unread || pending.includes(notification.id)}><Check size={11} /></button>
                  <button className="btn-icon btn-icon-sm" title="Delete" aria-label="Delete notification" onClick={() => void deleteOne(notification.id)} disabled={pending.includes(notification.id)} style={{ color: 'var(--red)' }}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔔</div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{user ? 'No notifications' : 'Sign in to see your notifications'}</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>{user ? "You're all caught up!" : 'Your updates will appear here.'}</p>
            {!user && <button className="btn btn-primary" onClick={() => setAuthView('login')}>Sign in</button>}
          </div>
        )}
      </div>
    </div>
  );
}
