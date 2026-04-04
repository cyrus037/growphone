import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { FALLBACK_PRICING_PLANS } from '../constants/fallbackPricingPlans';

const STATUS_ORDER = ['new', 'contacted', 'converted'];

function waLink(phone) {
  const n = String(phone || '').replace(/\D/g, '');
  return n ? `https://wa.me/${n}` : '#';
}

function formatShort(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN');
  } catch {
    return '';
  }
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const { refreshSettings } = useSiteSettings();
  const [section, setSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dash, setDash] = useState(null);
  const [leadFilter, setLeadFilter] = useState('all');
  const [leads, setLeads] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [tplForm, setTplForm] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    usage: 'contact_confirmation',
    isActive: false,
  });
  const [editingTplId, setEditingTplId] = useState(null);
  const [savingTpl, setSavingTpl] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const closeSidebarMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) setSidebarOpen(false);
  };

  const goSection = (id) => {
    setSection(id);
    closeSidebarMobile();
  };

  const [blogEditor, setBlogEditor] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Tips',
    content: '',
    coverImage: '',
    metaTitle: '',
    status: 'draft',
    emoji: '📝',
  });

  const loadDashboard = useCallback(async () => {
    const d = await api('/api/dashboard/stats');
    setDash(d);
  }, []);

  const loadLeads = useCallback(async (f) => {
    const q = f && f !== 'all' ? `?status=${encodeURIComponent(f)}` : '';
    const data = await api(`/api/leads${q}`);
    setLeads(data);
  }, []);

  const loadBlogs = useCallback(async () => {
    const data = await api('/api/blogs');
    setBlogs(data);
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const data = await api('/api/pricing/public');
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
        return;
      }
    } catch {
      /* fall through */
    }
    setPlans(FALLBACK_PRICING_PLANS);
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await api('/api/settings');
    setSettings(data);
  }, []);

  const loadAdminUsers = useCallback(async () => {
    const data = await api('/api/admin/users');
    setAdminUsers(data);
  }, []);

  const loadEmailTemplates = useCallback(async () => {
    const data = await api('/api/email/templates');
    setEmailTemplates(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const labels = ['dashboard', 'leads', 'blogs', 'pricing', 'settings'];
    (async () => {
      setLoading(true);
      setMsg('');
      const outcomes = await Promise.allSettled([
        loadDashboard(),
        loadLeads('all'),
        loadBlogs(),
        loadPlans(),
        loadSettings(),
      ]);
      if (cancelled) return;
      const failed = [];
      const detail = [];
      outcomes.forEach((o, i) => {
        if (o.status === 'rejected') {
          failed.push(labels[i]);
          const reason = o.reason;
          const bit =
            reason instanceof Error
              ? reason.message || String(reason)
              : String(reason);
          detail.push(`${labels[i]}: ${bit}`);
        }
      });
      if (failed.length > 0) {
        setMsg(
          `Could not load: ${failed.join(', ')}.\n${detail.join('\n')}\n\n` +
            'Fixes: (1) Start the API on port 5000. (2) Use http://localhost:5173 or http://127.0.0.1:5173. ' +
            '(3) Log in at /admin-portal (email/password from seed: admin@growphone.in). (4) Set JWT_SECRET in server .env for production.'
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDashboard, loadLeads, loadBlogs, loadPlans, loadSettings]);

  useEffect(() => {
    if (section === 'dashboard') loadDashboard();
  }, [section, loadDashboard]);

  useEffect(() => {
    if (section === 'leads') loadLeads(leadFilter);
  }, [section, leadFilter, loadLeads]);

  useEffect(() => {
    if (section !== 'admin-users') return;
    loadAdminUsers().catch(() => {});
  }, [section, loadAdminUsers]);

  useEffect(() => {
    if (section !== 'email-templates') return;
    loadEmailTemplates().catch(() => {});
  }, [section, loadEmailTemplates]);

  async function cycleLead(lead) {
    const i = STATUS_ORDER.indexOf(lead.status);
    const next = STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
    await api(`/api/leads/${lead._id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    });
    await loadLeads(leadFilter);
    await loadDashboard();
  }

  function exportCsv() {
    const rows = [['Name', 'Email', 'Business', 'Phone', 'Budget', 'Date', 'Status'], ...leads.map((l) => [
      l.name,
      l.email || '',
      l.businessType,
      l.phone,
      l.budget || '',
      formatShort(l.createdAt),
      l.status,
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'growphone-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleBlog(b) {
    const next = b.status === 'published' ? 'draft' : 'published';
    await api(`/api/blogs/${b._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    });
    await loadBlogs();
  }

  async function deleteBlog(id) {
    setConfirmDel({
      type: 'blog',
      id,
      title: 'Delete blog post?',
      message: 'This cannot be undone.',
      onConfirm: async () => {
        await api(`/api/blogs/${id}`, { method: 'DELETE' });
        await loadBlogs();
        toast.push('Blog post deleted.', 'success');
        setConfirmDel(null);
      },
    });
  }

  async function saveBlog(e) {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      alert('Please enter a title.');
      return;
    }
    await api('/api/blogs', {
      method: 'POST',
      body: JSON.stringify({
        title: blogForm.title.trim(),
        category: blogForm.category,
        content: blogForm.content,
        coverImage: blogForm.coverImage,
        metaTitle: blogForm.metaTitle,
        status: blogForm.status,
        emoji: blogForm.emoji || '📝',
      }),
    });
    setBlogEditor(false);
    setBlogForm({
      title: '',
      category: 'Tips',
      content: '',
      coverImage: '',
      metaTitle: '',
      status: 'draft',
      emoji: '📝',
    });
    await loadBlogs();
    await loadDashboard();
    toast.push('Blog post saved!', 'success');
  }

  function toggleFeature(planIndex, key) {
    setPlans((prev) => {
      const copy = [...prev];
      const p = { ...copy[planIndex], features: { ...copy[planIndex].features } };
      const v = p.features[key];
      if (typeof v === 'boolean') p.features[key] = !v;
      copy[planIndex] = p;
      return copy;
    });
  }

  function setFeatureNumber(planIndex, key, val) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return;
    setPlans((prev) => {
      const copy = [...prev];
      const p = { ...copy[planIndex], features: { ...copy[planIndex].features } };
      p.features[key] = n;
      copy[planIndex] = p;
      return copy;
    });
  }

  function setPlanPrice(planIndex, field, val) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return;
    setPlans((prev) => {
      const copy = [...prev];
      copy[planIndex] = { ...copy[planIndex], [field]: n };
      return copy;
    });
  }

  /** Only one plan should show the “Most popular” badge on the site */
  function setExclusivePopular(planIndex) {
    setPlans((prev) => prev.map((p, i) => ({ ...p, popular: i === planIndex })));
  }

  async function savePricing() {
    const missingId = plans.some((p) => !p._id);
    if (missingId) {
      alert(
        'Plans are not linked to the database (missing IDs). Start the API and MongoDB, open the public homepage once to seed pricing, then refresh this page.'
      );
      return;
    }
    await api('/api/pricing/bulk', {
      method: 'PUT',
      body: JSON.stringify({ plans }),
    });
    await loadPlans();
    toast.push('Pricing saved — live site updated.', 'success');
  }

  async function saveSettingsDoc() {
    if (!settings) return;
    await api('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    await refreshSettings();
    toast.push('Settings saved successfully!', 'success');
  }

  async function createAdmin(e) {
    e.preventDefault();
    if (!newAdminEmail.trim() || newAdminPass.length < 8) {
      toast.push('Enter a valid email and password (min 8 characters).', 'error');
      return;
    }
    setSavingAdmin(true);
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: newAdminEmail.trim(), password: newAdminPass }),
      });
      toast.push('Admin user created.', 'success');
      setNewAdminEmail('');
      setNewAdminPass('');
      await loadAdminUsers();
    } catch (er) {
      toast.push(er.message || 'Could not create admin', 'error');
    } finally {
      setSavingAdmin(false);
    }
  }

  function promptDeleteAdmin(u) {
    const id = u._id || u.id;
    setConfirmDel({
      title: 'Delete admin user?',
      message: `Remove ${u.email}? This cannot be undone.`,
      onConfirm: async () => {
        await api(`/api/admin/users/${id}`, { method: 'DELETE' });
        await loadAdminUsers();
        toast.push('Admin user removed.', 'success');
        setConfirmDel(null);
      },
    });
  }

  async function saveEmailTemplate(e) {
    e.preventDefault();
    if (!tplForm.name.trim() || !tplForm.subject.trim() || !tplForm.htmlContent.trim()) {
      toast.push('Fill in name, subject, and HTML content.', 'error');
      return;
    }
    setSavingTpl(true);
    try {
      if (editingTplId) {
        await api(`/api/email/templates/${editingTplId}`, {
          method: 'PATCH',
          body: JSON.stringify(tplForm),
        });
        toast.push('Template updated.', 'success');
      } else {
        await api('/api/email/templates', {
          method: 'POST',
          body: JSON.stringify(tplForm),
        });
        toast.push('Template created.', 'success');
      }
      setEditingTplId(null);
      setTplForm({
        name: '',
        subject: '',
        htmlContent: '',
        usage: 'contact_confirmation',
        isActive: false,
      });
      await loadEmailTemplates();
    } catch (er) {
      toast.push(er.message || 'Could not save template', 'error');
    } finally {
      setSavingTpl(false);
    }
  }

  function startEditTemplate(t) {
    setEditingTplId(t._id);
    setTplForm({
      name: t.name || '',
      subject: t.subject || '',
      htmlContent: t.htmlContent || '',
      usage: t.usage || 'contact_confirmation',
      isActive: !!t.isActive,
    });
  }

  function cancelTplEdit() {
    setEditingTplId(null);
    setTplForm({
      name: '',
      subject: '',
      htmlContent: '',
      usage: 'contact_confirmation',
      isActive: false,
    });
  }

  async function activateEmailTemplate(id) {
    await api(`/api/email/templates/${id}/activate`, { method: 'POST' });
    await loadEmailTemplates();
    toast.push('Active template updated for this category.', 'success');
  }

  function promptDeleteTemplate(id) {
    setConfirmDel({
      title: 'Delete email template?',
      message: 'This cannot be undone.',
      onConfirm: async () => {
        await api(`/api/email/templates/${id}`, { method: 'DELETE' });
        await loadEmailTemplates();
        toast.push('Template deleted.', 'success');
        setConfirmDel(null);
      },
    });
  }

  function toggleUi(id) {
    const map = {
      't-popup': 'exitIntentPopup',
      't-wa': 'whatsappPulseButton',
      't-quarterly': 'quarterlyPricingToggle',
    };
    const key = map[id];
    if (!key || !settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  }

  if (loading && !settings) {
    return (
      <div className="section">
        <p style={{ color: 'var(--text2)' }}>Loading dashboard…</p>
      </div>
    );
  }

  const m = dash?.metrics;
  const chart = dash?.chart || [];
  const mx = chart.length ? Math.max(...chart, 1) : 1;

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'admin-layout--collapsed' : ''}`}>
      <button
        type="button"
        className="admin-sidebar-open"
        aria-label="Open navigation"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>
      {sidebarOpen ? (
        <div
          className="admin-sidebar-overlay"
          role="presentation"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <button
          type="button"
          className="admin-sidebar-close"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>
        <div className="admin-sidebar-brand">
          <h3 className="admin-brand-text">Growphone</h3>
          <button
            type="button"
            className="sidebar-collapse-btn"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((v) => !v)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <button
          type="button"
          className={`sidebar-link ${section === 'dashboard' ? 'active' : ''}`}
          onClick={() => goSection('dashboard')}
        >
          <span className="si">📊</span>
          <span className="sidebar-label">Dashboard</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'leads' ? 'active' : ''}`}
          onClick={() => goSection('leads')}
        >
          <span className="si">👥</span>
          <span className="sidebar-label">Leads</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'blogs' ? 'active' : ''}`}
          onClick={() => goSection('blogs')}
        >
          <span className="si">✍️</span>
          <span className="sidebar-label">Blog Posts</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'pricing' ? 'active' : ''}`}
          onClick={() => goSection('pricing')}
        >
          <span className="si">💰</span>
          <span className="sidebar-label">Pricing</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'settings' ? 'active' : ''}`}
          onClick={() => goSection('settings')}
        >
          <span className="si">⚙️</span>
          <span className="sidebar-label">Settings</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'communication' ? 'active' : ''}`}
          onClick={() => goSection('communication')}
        >
          <span className="si">💬</span>
          <span className="sidebar-label">Communication</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'admin-users' ? 'active' : ''}`}
          onClick={() => goSection('admin-users')}
        >
          <span className="si">🛡️</span>
          <span className="sidebar-label">Admin Users</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'email-templates' ? 'active' : ''}`}
          onClick={() => goSection('email-templates')}
        >
          <span className="si">✉️</span>
          <span className="sidebar-label">Email Templates</span>
        </button>
        <button
          type="button"
          className={`sidebar-link ${section === 'access' ? 'active' : ''}`}
          onClick={() => goSection('access')}
        >
          <span className="si">🔐</span>
          <span className="sidebar-label">Access Control</span>
        </button>
        <Link to="/" className="sidebar-link" style={{ marginTop: 'auto' }} onClick={closeSidebarMobile}>
          <span className="si">↗</span>
          <span className="sidebar-label">View Site</span>
        </Link>
        <button
          type="button"
          className="sidebar-link"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <span className="si">⎋</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </aside>
      <div className="admin-content">
        {msg ? <p style={{ color: 'var(--amber)', marginBottom: '1rem' }}>{msg}</p> : null}

        {section === 'dashboard' && dash ? (
          <div className="admin-section active" id="admin-dashboard">
            <div className="admin-header">
              <h2>Dashboard</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Live data from MongoDB</span>
            </div>
            <div className="metric-grid">
              <div className="metric-card">
                <div className="metric-label">Total Leads (Month)</div>
                <div className="metric-val blue">{m.totalLeadsMonth}</div>
                <div className="metric-change">
                  {m.leadsDeltaVsPrevMonth >= 0 ? '↑' : '↓'} {Math.abs(m.leadsDeltaVsPrevMonth)} vs last
                  month
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Blog Posts</div>
                <div className="metric-val green">{m.blogPosts}</div>
                <div className="metric-change">
                  {m.blogPublished} published · {m.blogDrafts} drafts
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Pending Enquiries</div>
                <div className="metric-val amber">{m.pendingEnquiries}</div>
                <div className="metric-change">Need follow-up</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Conversions</div>
                <div className="metric-val">{m.conversions}</div>
                <div className="metric-change" style={{ color: 'var(--blue2)' }}>
                  {m.closeRate}% close rate
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">WA Expert Clicks (total)</div>
                <div className="metric-val green">{m.whatsappClicksTotal ?? 0}</div>
                <div className="metric-change">“Chat with Expert” button</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">WA Clicks (today)</div>
                <div className="metric-val blue">{m.whatsappClicksToday ?? 0}</div>
                <div className="metric-change">UTC day · debounced</div>
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '1.5rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text2)',
                }}
              >
                Lead Volume — Last 30 Days
              </div>
              <div className="mini-chart" id="dash-chart">
                {chart.map((v, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${Math.round((v / mx) * 100)}%` }}
                    title={`${v}`}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  fontSize: '0.7rem',
                  color: 'var(--text3)',
                }}
              >
                <span>Day 1</span>
                <span>Day 15</span>
                <span>Day 30</span>
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--text2)',
                }}
              >
                Recent Leads
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(dash.recentLeads || []).map((l) => (
                    <tr key={l._id}>
                      <td style={{ color: 'var(--text)' }}>{l.name}</td>
                      <td>{l.businessType}</td>
                      <td>{l.phone}</td>
                      <td>
                        <span className={`status-badge status-${l.status}`}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {section === 'leads' ? (
          <div className="admin-section active" id="admin-leads">
            <div className="admin-header">
              <h2>Leads Manager</h2>
              <button type="button" className="save-btn" onClick={exportCsv}>
                Export CSV ↓
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['all', 'new', 'contacted', 'converted'].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`toggle-btn ${leadFilter === f ? 'active' : ''}`}
                  onClick={() => setLeadFilter(f)}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Business</th>
                    <th>Phone</th>
                    <th>Budget</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l._id}>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{l.name}</td>
                      <td style={{ fontSize: '0.8rem' }}>{l.email || '—'}</td>
                      <td>{l.businessType}</td>
                      <td>{l.phone}</td>
                      <td>{l.budget || '—'}</td>
                      <td>{formatShort(l.createdAt)}</td>
                      <td>
                        <span className={`status-badge status-${l.status}`}>{l.status}</span>
                      </td>
                      <td>
                        <button type="button" className="action-btn" onClick={() => cycleLead(l)}>
                          Update
                        </button>
                        <a className="action-btn" href={waLink(l.phone)} target="_blank" rel="noreferrer">
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {section === 'blogs' ? (
          <div className="admin-section active" id="admin-blogs">
            <div className="admin-header">
              <h2>Blog Posts</h2>
              <button
                type="button"
                className="save-btn"
                onClick={() => {
                  setBlogEditor(true);
                }}
              >
                + New Post
              </button>
            </div>
            {!blogEditor ? (
              <div
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                }}
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b._id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                          {b.emoji || '📝'} {b.title}
                        </td>
                        <td>{b.category}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              b.status === 'published' ? 'status-converted' : 'status-contacted'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td>{formatShort(b.createdAt)}</td>
                        <td>
                          <button type="button" className="action-btn" onClick={() => toggleBlog(b)}>
                            Toggle
                          </button>
                          <button
                            type="button"
                            className="action-btn danger"
                            onClick={() => deleteBlog(b._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div id="blog-editor">
                <div className="admin-form">
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>New Blog Post</h3>
                  <form onSubmit={saveBlog}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>TITLE</label>
                        <input
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          placeholder="5 Instagram Tips for Restaurants"
                        />
                      </div>
                      <div className="form-group">
                        <label>CATEGORY</label>
                        <select
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        >
                          <option>Tips</option>
                          <option>Case Study</option>
                          <option>GMB</option>
                          <option>Instagram</option>
                          <option>Strategy</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>COVER IMAGE URL</label>
                      <input
                        value={blogForm.coverImage}
                        onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="form-group">
                      <label>CONTENT</label>
                      <textarea
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        placeholder="Write your blog content here..."
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>META TITLE</label>
                        <input
                          value={blogForm.metaTitle}
                          onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>STATUS</label>
                        <select
                          value={blogForm.status}
                          onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setBlogEditor(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="save-btn">
                        Publish Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {section === 'pricing' ? (
          <div className="admin-section active" id="admin-pricing">
            <div className="admin-header">
              <h2>Pricing Plans</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="cancel-btn" onClick={() => loadPlans()}>
                  Reload from API
                </button>
                <button type="button" className="save-btn" onClick={savePricing}>
                  Save Changes
                </button>
              </div>
            </div>
            {plans.length === 0 ? (
              <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>
                No plans yet. Ensure MongoDB and the server are running, then load the public site once (the API
                auto-seeds pricing) or click Reload from API.
              </p>
            ) : null}
            <div id="pricing-editor">
              {plans.map((p, pi) => (
                <div key={p._id || `${p.name}-${pi}`} className="plan-editor">
                  <div className="plan-editor-header">
                    <span className="plan-editor-name">{p.name}</span>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--text2)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="popular-plan"
                        checked={!!p.popular}
                        onChange={() => setExclusivePopular(pi)}
                      />
                      Most popular (badge)
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Monthly ₹</span>
                      <input
                        type="number"
                        value={p.monthly}
                        onChange={(e) => setPlanPrice(pi, 'monthly', e.target.value)}
                        style={{
                          background: 'var(--bg3)',
                          border: '1px solid var(--border2)',
                          color: 'var(--text)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: 6,
                          fontSize: '0.85rem',
                          width: 90,
                          fontFamily: "'DM Sans', sans-serif",
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Quarterly ₹</span>
                      <input
                        type="number"
                        value={p.quarterly}
                        onChange={(e) => setPlanPrice(pi, 'quarterly', e.target.value)}
                        style={{
                          background: 'var(--bg3)',
                          border: '1px solid var(--border2)',
                          color: 'var(--text)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: 6,
                          fontSize: '0.85rem',
                          width: 90,
                          fontFamily: "'DM Sans', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  {Object.entries(p.features || {}).map(([k, v]) => (
                      <div key={k} className="feature-toggle">
                        <button
                          type="button"
                          className={`toggle ${
                            v === true || typeof v === 'number' ? 'on' : ''
                          }`}
                          onClick={() => typeof v === 'boolean' && toggleFeature(pi, k)}
                          aria-label={k}
                        />
                        <span>{k}</span>
                        {typeof v === 'number' ? (
                          <input
                            type="number"
                            value={v}
                            onChange={(e) => setFeatureNumber(pi, k, e.target.value)}
                            style={{
                              background: 'var(--bg3)',
                              border: '1px solid var(--border2)',
                              color: 'var(--text)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: 4,
                              fontSize: '0.78rem',
                              width: 50,
                              marginLeft: '0.5rem',
                              fontFamily: "'DM Sans', sans-serif",
                              outline: 'none',
                            }}
                          />
                        ) : null}
                      </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {section === 'settings' && settings ? (
          <div className="admin-section active" id="admin-settings">
            <div className="admin-header">
              <h2>Settings</h2>
            </div>
            <div className="settings-section">
              <h3>Site Configuration</h3>
              <div className="form-group">
                <label>HERO LINE 1</label>
                <input
                  value={settings.heroHeadline || ''}
                  onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>HERO ACCENT LINE</label>
                <input
                  value={settings.heroAccent || ''}
                  onChange={(e) => setSettings({ ...settings, heroAccent: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>HERO SUBTEXT</label>
                <textarea
                  value={settings.heroSubtext || ''}
                  onChange={(e) => setSettings({ ...settings, heroSubtext: e.target.value })}
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                    padding: '0.7rem 1rem',
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    fontFamily: "'DM Sans', sans-serif",
                    width: '100%',
                    outline: 'none',
                    minHeight: 80,
                    resize: 'vertical',
                  }}
                />
              </div>
              <div className="form-group">
                <label>ADMIN EMAIL (display)</label>
                <input
                  value={settings.adminEmailDisplay || ''}
                  onChange={(e) => setSettings({ ...settings, adminEmailDisplay: e.target.value })}
                />
              </div>
              <button type="button" className="save-btn" onClick={saveSettingsDoc}>
                Save Settings
              </button>
            </div>
            <div className="settings-section">
              <h3>Feature Toggles</h3>
              <div className="setting-row">
                <div>
                  <div className="setting-label">Exit-Intent Popup</div>
                  <div className="setting-desc">Show popup when user moves cursor to leave</div>
                </div>
                <button
                  type="button"
                  className={`toggle ${settings.exitIntentPopup ? 'on' : ''}`}
                  id="t-popup"
                  onClick={() => toggleUi('t-popup')}
                />
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">WhatsApp Pulse Button</div>
                  <div className="setting-desc">Floating chat button on all pages</div>
                </div>
                <button
                  type="button"
                  className={`toggle ${settings.whatsappPulseButton ? 'on' : ''}`}
                  id="t-wa"
                  onClick={() => toggleUi('t-wa')}
                />
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">Quarterly Pricing Toggle</div>
                  <div className="setting-desc">Show monthly/quarterly switch on pricing</div>
                </div>
                <button
                  type="button"
                  className={`toggle ${settings.quarterlyPricingToggle ? 'on' : ''}`}
                  id="t-quarterly"
                  onClick={() => toggleUi('t-quarterly')}
                />
              </div>
            </div>
          </div>
        ) : null}

        {section === 'communication' && settings ? (
          <div className="admin-section active" id="admin-communication">
            <div className="admin-header">
              <h2>Communication Settings</h2>
            </div>
            <div className="settings-section">
              <h3>WhatsApp</h3>
              <p className="access-hint">
                Used by the floating button, contact page link, and any wa.me redirects. Digits only in the
                number field is fine — formatting is normalized.
              </p>
              <div className="form-group">
                <label>WHATSAPP NUMBER</label>
                <input
                  value={settings.whatsappNumber || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label>DEFAULT MESSAGE TEMPLATE</label>
                <textarea
                  value={settings.whatsappMessageTemplate || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappMessageTemplate: e.target.value })}
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                    padding: '0.7rem 1rem',
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    fontFamily: "'DM Sans', sans-serif",
                    width: '100%',
                    outline: 'none',
                    minHeight: 100,
                    resize: 'vertical',
                  }}
                  placeholder="Hi, I'm interested in your services..."
                />
              </div>
              <button type="button" className="save-btn" onClick={saveSettingsDoc}>
                Save Communication Settings
              </button>
            </div>
          </div>
        ) : null}

        {section === 'admin-users' ? (
          <div className="admin-section active" id="admin-users">
            <div className="admin-header">
              <h2>Admin Users</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>JWT login · bcrypt passwords</span>
            </div>
            <div className="settings-section">
              <h3>Add admin</h3>
              <form onSubmit={createAdmin} className="admin-form" style={{ maxWidth: 480, marginBottom: '1.5rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>EMAIL</label>
                    <input
                      type="email"
                      autoComplete="off"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="name@growphone.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>PASSWORD</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      placeholder="Min 8 characters"
                    />
                  </div>
                </div>
                <button type="submit" className="save-btn" disabled={savingAdmin}>
                  {savingAdmin ? 'Saving…' : 'Create admin'}
                </button>
              </form>
              <h3>Existing accounts</h3>
              <div
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'auto',
                }}
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u._id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{u.email}</td>
                        <td>{formatShort(u.createdAt)}</td>
                        <td>
                          <button type="button" className="action-btn danger" onClick={() => promptDeleteAdmin(u)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {section === 'email-templates' ? (
          <div className="admin-section active" id="admin-email-templates">
            <div className="admin-header">
              <h2>Email Templates</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                Variables: {'{{name}}, {{email}}, {{businessType}}, {{phone}}, {{budget}}, {{submittedAt}}'}
              </span>
            </div>
            <div className="settings-section">
              <h3>{editingTplId ? 'Edit template' : 'New template'}</h3>
              <form onSubmit={saveEmailTemplate} className="admin-form" style={{ maxWidth: 720 }}>
                <div className="form-group">
                  <label>TEMPLATE NAME</label>
                  <input
                    value={tplForm.name}
                    onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })}
                    placeholder="e.g. Contact confirmation"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>USAGE</label>
                    <select
                      value={tplForm.usage}
                      onChange={(e) => setTplForm({ ...tplForm, usage: e.target.value })}
                    >
                      <option value="contact_confirmation">Contact — user confirmation</option>
                      <option value="contact_admin">Contact — admin notification</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={tplForm.isActive}
                        onChange={(e) => setTplForm({ ...tplForm, isActive: e.target.checked })}
                      />
                      Set active for this usage
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>SUBJECT</label>
                  <input
                    value={tplForm.subject}
                    onChange={(e) => setTplForm({ ...tplForm, subject: e.target.value })}
                    placeholder="e.g. We received your message, {{name}}"
                  />
                </div>
                <div className="form-group">
                  <label>HTML CONTENT</label>
                  <textarea
                    value={tplForm.htmlContent}
                    onChange={(e) => setTplForm({ ...tplForm, htmlContent: e.target.value })}
                    style={{ minHeight: 180 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {editingTplId ? (
                    <button type="button" className="cancel-btn" onClick={cancelTplEdit}>
                      Cancel edit
                    </button>
                  ) : null}
                  <button type="submit" className="save-btn" disabled={savingTpl}>
                    {savingTpl ? 'Saving…' : editingTplId ? 'Update template' : 'Create template'}
                  </button>
                </div>
              </form>
            </div>
            <div className="settings-section">
              <h3>All templates</h3>
              <div
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'auto',
                }}
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Usage</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailTemplates.map((t) => (
                      <tr key={t._id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{t.name}</td>
                        <td>{t.usage}</td>
                        <td>{t.isActive ? 'Yes' : '—'}</td>
                        <td>
                          <button type="button" className="action-btn" onClick={() => activateEmailTemplate(t._id)}>
                            Activate
                          </button>
                          <button type="button" className="action-btn" onClick={() => startEditTemplate(t)}>
                            Edit
                          </button>
                          <button type="button" className="action-btn danger" onClick={() => promptDeleteTemplate(t._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {section === 'access' && settings ? (
          <div className="admin-section active" id="admin-access">
            <div className="admin-header">
              <h2>Access Control</h2>
            </div>
            <div className="settings-section">
              <h3>Site &amp; admin visibility</h3>
              <div className="setting-row">
                <div>
                  <div className="setting-label">Maintenance mode</div>
                  <div className="setting-desc">Public site shows maintenance screen. Admin URL still works.</div>
                </div>
                <button
                  type="button"
                  className={`toggle ${settings.maintenanceMode ? 'on' : ''}`}
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                />
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">Admin panel login</div>
                  <div className="setting-desc">When off, login is blocked unless ADMIN_RECOVERY_KEY is used.</div>
                </div>
                <button
                  type="button"
                  className={`toggle ${settings.adminPanelEnabled !== false ? 'on' : ''}`}
                  onClick={() => {
                    const on = settings.adminPanelEnabled !== false;
                    setSettings({ ...settings, adminPanelEnabled: !on });
                  }}
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>LOGIN MODE</label>
                <select
                  value={settings.adminLoginMode || 'password'}
                  onChange={(e) => setSettings({ ...settings, adminLoginMode: e.target.value })}
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                    padding: '0.7rem 1rem',
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    fontFamily: "'DM Sans', sans-serif",
                    width: '100%',
                    maxWidth: 360,
                    outline: 'none',
                  }}
                >
                  <option value="password">Email + password (JWT)</option>
                  <option value="secret_key">Admin API key only</option>
                  <option value="both">Password + admin API key</option>
                </select>
              </div>
              <div className="form-group">
                <label>ADMIN API KEY (dynamic)</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={settings.adminApiKey || ''}
                  onChange={(e) => setSettings({ ...settings, adminApiKey: e.target.value })}
                  placeholder="Set a strong key; used for login modes above"
                />
                <p className="access-hint">
                  Store this securely. For emergency unlock when admin login is disabled, set ADMIN_RECOVERY_KEY
                  in server .env and use recovery field on login.
                </p>
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">Require API key on requests</div>
                  <div className="setting-desc">
                    After JWT, all admin API calls must send header X-Admin-Key matching the key above.
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle ${settings.requireAdminApiKeyForRequests ? 'on' : ''}`}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      requireAdminApiKeyForRequests: !settings.requireAdminApiKeyForRequests,
                    })
                  }
                />
              </div>
              <button type="button" className="save-btn" onClick={saveSettingsDoc}>
                Save Access Control
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmModal
        open={!!confirmDel}
        title={confirmDel?.title || ''}
        message={confirmDel?.message}
        danger
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDel(null)}
        onConfirm={async () => {
          if (confirmDel?.onConfirm) await confirmDel.onConfirm();
        }}
      />
    </div>
  );
}
