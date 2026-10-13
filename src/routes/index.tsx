import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent, type ComponentType } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck, ChartNoAxesCombined, Settings, LifeBuoy, ChevronDown,
  ChevronLeft, ChevronRight, Search, Bell, Plus, CalendarDays, TrendingUp, TrendingDown, Wallet, Pill, TriangleAlert,
  Clock3, Menu, PanelRightClose, PanelRightOpen, Download, Filter, Eye, Building2, Check, X, Receipt, Boxes,
  PackageCheck, PackageX, Hourglass, Tag, Coins, Sparkles, Command, Moon, Sun, Inbox, Trash2,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip as Tip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import logo from '@/assets/pharmatech-logo.png.asset.json';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'PharmaTech | لوحة تحكم الصيدلية' },
      { name: 'description', content: 'لوحة PharmaTech العربية لمتابعة المبيعات والمخزون وتنبيهات الصيدلية.' },
      { property: 'og:title', content: 'PharmaTech | لوحة تحكم الصيدلية' },
      { property: 'og:description', content: 'متابعة مبيعات الصيدلية والأدوية والمخزون في مكان واحد.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Dashboard,
});

type Status = 'available' | 'low' | 'expiring';
type Medicine = { id: string; name: string; generic: string; category: string; stock: number; price: number; expiry: string; status: Status };
type Icon = ComponentType<{ size?: number; className?: string }>;

const initialMedicines: Medicine[] = [
  { id: 'MED-001', name: 'بنادول أدفانس', generic: 'Panadol Advance 500mg', category: 'مسكنات', stock: 248, price: 25, expiry: '2027-08-15', status: 'available' },
  { id: 'MED-002', name: 'أوجمنتين', generic: 'Augmentin 1g', category: 'مضادات حيوية', stock: 12, price: 85, expiry: '2027-03-20', status: 'low' },
  { id: 'MED-003', name: 'فيتامين سي', generic: 'Vitamin C 1000mg', category: 'مكملات', stock: 156, price: 45, expiry: '2027-11-10', status: 'available' },
  { id: 'MED-004', name: 'جلوكوفاج', generic: 'Glucophage 500mg', category: 'السكري', stock: 84, price: 32, expiry: '2026-11-05', status: 'expiring' },
  { id: 'MED-005', name: 'زيرتك', generic: 'Zyrtec 10mg', category: 'الحساسية', stock: 120, price: 38, expiry: '2028-01-22', status: 'available' },
  { id: 'MED-006', name: 'بروفين', generic: 'Brufen 400mg', category: 'مسكنات', stock: 18, price: 28, expiry: '2027-06-12', status: 'low' },
  { id: 'MED-007', name: 'أوميبرازول', generic: 'Omeprazole 20mg', category: 'المعدة', stock: 92, price: 42, expiry: '2027-09-01', status: 'available' },
];
const categories = ['مسكنات', 'مضادات حيوية', 'مكملات', 'السكري', 'الحساسية', 'المعدة'];
const chartData = [
  { day: 'السبت', sales: 2400, previous: 1800 }, { day: 'الأحد', sales: 3600, previous: 2700 },
  { day: 'الإثنين', sales: 3000, previous: 2400 }, { day: 'الثلاثاء', sales: 4900, previous: 3200 },
  { day: 'الأربعاء', sales: 3900, previous: 3000 }, { day: 'الخميس', sales: 5800, previous: 4000 },
  { day: 'الجمعة', sales: 5100, previous: 3400 },
];
const navItems: { label: string; icon: Icon; count?: number }[] = [
  { label: 'الرئيسية', icon: LayoutDashboard },
  { label: 'المخزون', icon: Package, count: 24 },
  { label: 'المبيعات', icon: ShoppingCart },
  { label: 'العملاء', icon: Users },
  { label: 'الموردون', icon: Truck },
  { label: 'التقارير', icon: ChartNoAxesCombined },
];
const statusMeta: Record<Status, { label: string; icon: Icon }> = {
  available: { label: 'متوفر', icon: PackageCheck },
  low: { label: 'منخفض', icon: PackageX },
  expiring: { label: 'ينتهي قريبًا', icon: Hourglass },
};
const initialNotes = [
  { id: 1, icon: PackageX, tone: 'warning', title: 'أوجمنتين منخفض', meta: '12 عبوة متبقية', time: 'منذ 5 د' },
  { id: 2, icon: Hourglass, tone: 'danger', title: 'جلوكوفاج ينتهي قريبًا', meta: '5 نوفمبر 2026', time: 'منذ ساعة' },
  { id: 3, icon: Truck, tone: 'info', title: 'شحنة توريد بالطريق', meta: 'مورد النيل للأدوية', time: 'منذ 3 س' },
];

function useFakeLoad(dep: unknown, ms = 900) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), ms); return () => clearTimeout(t); }, [dep, ms]);
  return loading;
}

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState('الرئيسية');
  const [medicines, setMedicines] = useState(initialMedicines);
  const [notes, setNotes] = useState(initialNotes);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<'add' | 'notifications' | 'settings' | 'help' | 'detail' | null>(null);
  const [selected, setSelected] = useState<Medicine | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const loading = useFakeLoad(active);
  const chartLoading = useFakeLoad(period, 600);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  useEffect(() => {
    const t = setTimeout(() => toast.warning('3 أصناف تحتاج انتباهك', { description: 'مخزون منخفض وصلاحية قريبة', action: { label: 'عرض', onClick: () => setDialog('notifications') } }), 1600);
    return () => clearTimeout(t);
  }, []);

  const filtered = medicines.filter(m => (m.name + ' ' + m.generic + ' ' + m.category).toLowerCase().includes(query.toLowerCase()) && (status === 'all' || m.status === status));
  const perPage = 5;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const isInventory = active === 'المخزون';
  const showOverview = !isInventory;

  function chooseNav(label: string) { setActive(label); setMobile(false); setPage(1); }
  function exportData() {
    const csv = '\uFEFF' + ['الدواء,الفئة,الكمية,السعر,تاريخ الانتهاء', ...filtered.map(m => `${m.name},${m.category},${m.stock},${m.price},${m.expiry}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'PharmaTech-inventory.csv'; a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير المخزون', { description: `${filtered.length} صنف · ملف CSV` });
  }
  function addMedicine(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const stock = Number(d.get('stock'));
    const name = String(d.get('name'));
    setMedicines(prev => [{ id: `MED-${String(prev.length + 1).padStart(3, '0')}`, name, generic: String(d.get('generic')), category: String(d.get('category')), stock, price: Number(d.get('price')), expiry: String(d.get('expiry')), status: stock < 20 ? 'low' : 'available' }, ...prev]);
    setQuery(''); setStatus('all'); setPage(1); setDialog(null);
    toast.success('تمت إضافة الدواء', { description: name });
  }
  function removeMedicine(m: Medicine) {
    setMedicines(prev => prev.filter(x => x.id !== m.id)); setDialog(null);
    toast('تم حذف الصنف', { description: m.name, icon: <Trash2 size={16} />, action: { label: 'تراجع', onClick: () => setMedicines(prev => [m, ...prev]) } });
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`app-shell ${collapsed ? 'is-collapsed' : ''} ${mobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-backdrop" onClick={() => setMobile(false)} />

        <aside className="sidebar" aria-label="القائمة الرئيسية">
          <div className="sidebar-top">
            <div className="brand-wrap"><img className="brand" src={logo.url} alt="PharmaTech" /></div>
            <Button variant="ghost" size="icon" className="icon-btn sidebar-toggle" aria-label="طي القائمة" onClick={() => (mobile ? setMobile(false) : setCollapsed(!collapsed))}>
              {mobile ? <X /> : collapsed ? <PanelRightOpen /> : <PanelRightClose />}
            </Button>
          </div>
          <button className="branch" onClick={() => toast.info('الفرع الرئيسي', { description: 'لا توجد فروع أخرى حاليًا' })}>
            <span className="branch-icon"><Building2 size={17} /></span>
            <span className="branch-text"><strong>فارما تك</strong><small>الفرع الرئيسي</small></span>
            <ChevronDown size={14} className="branch-caret" />
          </button>
          <nav className="nav">
            {navItems.map(item => (
              <Tip key={item.label}>
                <TooltipTrigger asChild>
                  <Button variant="nav" data-active={active === item.label} onClick={() => chooseNav(item.label)}>
                    <item.icon /><span className="nav-text">{item.label}</span>
                    {item.count && <span className="nav-count">{item.count}</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="left">{item.label}</TooltipContent>}
              </Tip>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <Button variant="nav" onClick={() => setDialog('settings')}><Settings /><span className="nav-text">الإعدادات</span></Button>
            <Button variant="nav" onClick={() => setDialog('help')}><LifeBuoy /><span className="nav-text">المساعدة</span></Button>
            <div className="pro-card">
              <Sparkles size={18} />
              <strong>فارما تك برو</strong>
              <small>تقارير ذكية وتنبؤ بالمخزون</small>
            </div>
          </div>
        </aside>

        <div className="main-shell">
          <header className="topbar">
            <Button variant="ghost" size="icon" className="icon-btn mobile-menu" aria-label="فتح القائمة" onClick={() => setMobile(true)}><Menu /></Button>
            <label className="search-box">
              <Search size={17} />
              <input aria-label="البحث" placeholder="ابحث عن دواء أو فاتورة..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
              <kbd><Command size={11} />K</kbd>
            </label>
            <div className="top-actions">
              <IconAction label={dark ? 'الوضع الفاتح' : 'الوضع الداكن'} onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</IconAction>
              <IconAction label="الإشعارات" onClick={() => setDialog('notifications')}>
                <Bell />{notes.length > 0 && <span className="badge-dot">{notes.length}</span>}
              </IconAction>
              <button className="profile" onClick={() => setDialog('settings')}>
                <span className="avatar">أم</span>
                <span className="profile-text"><strong>أحمد محمد</strong><small>مدير</small></span>
              </button>
            </div>
          </header>

          <main className="content">
            <div className="page-heading">
              <div>
                <h1>{active === 'الرئيسية' ? 'صباح الخير، أحمد 👋' : active}</h1>
                <p className="heading-meta"><CalendarDays size={14} />الثلاثاء، 13 أكتوبر 2026</p>
              </div>
              <div className="heading-actions">
                <IconAction label="تصدير" onClick={exportData} outline><Download /></IconAction>
                <Button className="btn-primary" onClick={() => setDialog('add')}><Plus size={17} />دواء جديد</Button>
              </div>
            </div>

            <div className="stats-grid">
              {loading ? Array.from({ length: 4 }, (_, i) => <StatSkeleton key={i} />) : <>
                <Stat label="مبيعات اليوم" value="12,450" unit="ج.س" icon={Wallet} tone="primary" change="+12.8%" featured />
                <Stat label="الفواتير" value="86" icon={Receipt} tone="info" change="+8.2%" />
                <Stat label="الأصناف" value="1,284" icon={Boxes} tone="violet" change="+32" />
                <Stat label="تحتاج انتباه" value="24" icon={TriangleAlert} tone="warning" change="6" down />
              </>}
            </div>

            {showOverview && (
              <div className="middle-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div className="panel-title"><span className="title-icon"><TrendingUp size={16} /></span><h2>أداء المبيعات</h2></div>
                    <div className="segmented" role="tablist">
                      {(['week', 'month'] as const).map(p => <button key={p} role="tab" aria-selected={period === p} data-active={period === p} onClick={() => setPeriod(p)}>{p === 'week' ? 'أسبوع' : 'شهر'}</button>)}
                    </div>
                  </div>
                  {loading || chartLoading ? <ChartSkeleton /> : <>
                    <div className="chart-summary">
                      <strong className="num">{period === 'week' ? '35,780' : '142,650'}<small>ج.س</small></strong>
                      <span className="chip chip-success"><TrendingUp size={13} />18.6%</span>
                      <div className="chart-legend"><span><i className="dot" />الحالية</span><span><i className="dot dot-muted" />السابقة</span></div>
                    </div>
                    <div className="sales-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.map(d => ({ ...d, sales: d.sales * (period === 'month' ? 4 : 1), previous: d.previous * (period === 'month' ? 4 : 1) }))} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                          <defs>
                            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
                              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 6" vertical={false} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} width={44} />
                          <Tooltip cursor={{ stroke: 'var(--primary)', strokeDasharray: '4 4' }} content={({ active: show, payload, label }) => show && payload?.length ? <div className="chart-tooltip"><span>{label}</span><strong>{Number(payload[payload.length - 1]?.value).toLocaleString()} ج.س</strong></div> : null} />
                          <Area type="monotone" dataKey="previous" stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                          <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fill="url(#salesFill)" activeDot={{ r: 6, strokeWidth: 3, stroke: 'var(--card)' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </>}
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div className="panel-title"><span className="title-icon warning"><Bell size={16} /></span><h2>التنبيهات</h2></div>
                    <span className="chip chip-warning">{notes.length}</span>
                  </div>
                  <div className="alert-list">
                    {loading ? Array.from({ length: 3 }, (_, i) => <div key={i} className="alert-item"><div className="skeleton sk-icon" /><div className="sk-lines"><div className="skeleton sk-line w-70" /><div className="skeleton sk-line w-40" /></div></div>) :
                      <>
                        <AlertRow icon={PackageX} tone="warning" title="مخزون منخفض" value="18 صنف" onClick={() => { setStatus('low'); setActive('المخزون'); }} />
                        <AlertRow icon={Hourglass} tone="danger" title="صلاحية قريبة" value="6 أصناف · 30 يوم" onClick={() => { setStatus('expiring'); setActive('المخزون'); }} />
                        <AlertRow icon={Truck} tone="info" title="توريد بالانتظار" value="طلب واحد" onClick={() => setDialog('notifications')} />
                      </>}
                  </div>
                </section>
              </div>
            )}

            <section className="panel">
              <div className="panel-head wrap">
                <div className="panel-title"><span className="title-icon"><Pill size={16} /></span><h2>الأدوية</h2><span className="chip">{filtered.length}</span></div>
                <div className="inventory-controls">
                  <label className="table-search"><Search size={15} /><input aria-label="بحث" placeholder="بحث..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>
                  <div className="segmented">
                    {(['all', 'available', 'low', 'expiring'] as const).map(s => {
                      const I = s === 'all' ? Filter : statusMeta[s].icon;
                      return (
                        <Tip key={s}><TooltipTrigger asChild>
                          <button data-active={status === s} aria-label={s === 'all' ? 'الكل' : statusMeta[s].label} onClick={() => { setStatus(s); setPage(1); }}><I size={15} /></button>
                        </TooltipTrigger><TooltipContent>{s === 'all' ? 'الكل' : statusMeta[s].label}</TooltipContent></Tip>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="table-scroll">
                <table className="medicine-table">
                  <thead><tr><th>الدواء</th><th>الفئة</th><th>الكمية</th><th>السعر</th><th>الانتهاء</th><th>الحالة</th><th /></tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 5 }, (_, i) => (
                      <tr key={i}>
                        <td><div className="medicine-name"><div className="skeleton sk-icon" /><div className="sk-lines"><div className="skeleton sk-line w-90" /><div className="skeleton sk-line w-60" /></div></div></td>
                        {Array.from({ length: 5 }, (_, j) => <td key={j}><div className="skeleton sk-line w-60" /></td>)}
                        <td><div className="skeleton sk-dot" /></td>
                      </tr>
                    )) : rows.map(m => {
                      const S = statusMeta[m.status];
                      const pct = Math.min(100, (m.stock / 250) * 100);
                      return (
                        <tr key={m.id} onClick={() => { setSelected(m); setDialog('detail'); }}>
                          <td><div className="medicine-name"><div className={`medicine-icon ${m.status}`}><Pill size={17} /></div><div><strong>{m.name}</strong><small dir="ltr">{m.generic}</small></div></div></td>
                          <td><span className="tag"><Tag size={12} />{m.category}</span></td>
                          <td><div className="stock"><span className="num">{m.stock}</span><div className="meter"><i className={m.status} style={{ width: `${pct}%` }} /></div></div></td>
                          <td><span className="num">{m.price.toFixed(2)}</span></td>
                          <td><span className="date num" dir="ltr"><CalendarDays size={13} />{m.expiry.split('-').reverse().join('/')}</span></td>
                          <td><span className={`status ${m.status}`}><S.icon size={13} />{S.label}</span></td>
                          <td><Button variant="ghost" size="icon" className="icon-btn" aria-label={`تفاصيل ${m.name}`}><Eye size={16} /></Button></td>
                        </tr>
                      );
                    })}
                    {!loading && rows.length === 0 && <tr><td colSpan={7}><div className="empty"><Inbox size={34} /><span>لا توجد نتائج</span></div></td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span className="num">{filtered.length ? (currentPage - 1) * perPage + 1 : 0}–{Math.min(currentPage * perPage, filtered.length)} / {filtered.length}</span>
                <div className="pagination">
                  <Button variant="ghost" size="icon" className="icon-btn" aria-label="السابق" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronRight /></Button>
                  {Array.from({ length: pages }, (_, i) => <button key={i} className="page-btn" data-active={currentPage === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
                  <Button variant="ghost" size="icon" className="icon-btn" aria-label="التالي" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronLeft /></Button>
                </div>
              </div>
            </section>

            <footer className="app-footer"><span>© 2026 PharmaTech</span><span className="live"><i />بيانات تجريبية</span></footer>
          </main>
        </div>

        <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}>
          <DialogContent dir="rtl" className="dialog">
            <div className="dialog-head">
              <span className="title-icon lg">
                {dialog === 'add' ? <Plus size={20} /> : dialog === 'notifications' ? <Bell size={20} /> : dialog === 'settings' ? <Settings size={20} /> : dialog === 'detail' ? <Pill size={20} /> : <LifeBuoy size={20} />}
              </span>
              <div>
                <DialogTitle className="dialog-title">{dialog === 'add' ? 'إضافة دواء' : dialog === 'notifications' ? 'الإشعارات' : dialog === 'settings' ? 'الإعدادات' : dialog === 'detail' ? selected?.name : 'المساعدة'}</DialogTitle>
                <DialogDescription className="dialog-desc">{dialog === 'detail' ? selected?.generic : dialog === 'notifications' ? `${notes.length} جديدة` : 'PharmaTech'}</DialogDescription>
              </div>
            </div>

            {dialog === 'add' && (
              <form onSubmit={addMedicine}>
                <div className="form-grid">
                  <Field icon={Pill} wide><input name="name" required placeholder="اسم الدواء" /></Field>
                  <Field icon={Sparkles} wide><input name="generic" required placeholder="Panadol 500mg" dir="ltr" /></Field>
                  <Field icon={Tag}><select name="category">{categories.map(c => <option key={c}>{c}</option>)}</select></Field>
                  <Field icon={Boxes}><input name="stock" type="number" min="0" required placeholder="الكمية" /></Field>
                  <Field icon={Coins}><input name="price" type="number" min="0" step="0.01" required placeholder="السعر ج.س" /></Field>
                  <Field icon={CalendarDays}><input name="expiry" type="date" min="2026-10-13" required /></Field>
                </div>
                <div className="form-actions">
                  <Button variant="ghost" type="button" onClick={() => setDialog(null)}>إلغاء</Button>
                  <Button className="btn-primary" type="submit"><Check size={16} />حفظ</Button>
                </div>
              </form>
            )}

            {dialog === 'notifications' && (
              <div className="note-list">
                {notes.length === 0 && <div className="empty"><Inbox size={34} /><span>لا توجد إشعارات</span></div>}
                {notes.map(n => (
                  <div key={n.id} className="note">
                    <span className={`alert-symbol ${n.tone}`}><n.icon size={17} /></span>
                    <div><strong>{n.title}</strong><small>{n.meta}</small></div>
                    <span className="note-time">{n.time}</span>
                  </div>
                ))}
                {notes.length > 0 && <Button variant="ghost" className="w-full" onClick={() => { setNotes([]); toast.success('تم تعليم الكل كمقروء'); }}><Check size={15} />تعليم الكل كمقروء</Button>}
              </div>
            )}

            {dialog === 'settings' && (
              <form onSubmit={e => { e.preventDefault(); setDialog(null); toast.success('تم حفظ الإعدادات'); }}>
                <div className="form-grid">
                  <Field icon={Building2} wide><input defaultValue="صيدلية فارما تك" required /></Field>
                  <Field icon={LayoutDashboard}><input defaultValue="الفرع الرئيسي" required /></Field>
                  <Field icon={Users}><input defaultValue="أحمد محمد" required /></Field>
                </div>
                <div className="form-actions"><Button className="btn-primary" type="submit"><Check size={16} />حفظ</Button></div>
              </form>
            )}

            {dialog === 'detail' && selected && (
              <>
                <div className="detail-grid">
                  <Detail icon={Tag} label="الفئة" value={selected.category} />
                  <Detail icon={Boxes} label="الكمية" value={`${selected.stock} عبوة`} />
                  <Detail icon={Coins} label="السعر" value={`${selected.price.toFixed(2)} ج.س`} />
                  <Detail icon={CalendarDays} label="الانتهاء" value={selected.expiry.split('-').reverse().join('/')} />
                </div>
                <div className="form-actions">
                  <Button variant="ghost" className="danger-btn" onClick={() => removeMedicine(selected)}><Trash2 size={15} />حذف</Button>
                  <Button className="btn-primary" onClick={() => { setDialog(null); toast.success('تم إنشاء طلب توريد', { description: selected.name, icon: <Truck size={16} /> }); }}><Truck size={16} />طلب توريد</Button>
                </div>
              </>
            )}

            {dialog === 'help' && (
              <div className="detail-grid">
                <Detail icon={LifeBuoy} label="الدعم" value="24/7" />
                <Detail icon={Clock3} label="الاستجابة" value="< 15 دقيقة" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function IconAction({ label, onClick, children, outline }: { label: string; onClick: () => void; children: React.ReactNode; outline?: boolean }) {
  return (
    <Tip><TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className={`icon-btn ${outline ? 'outlined' : ''}`} aria-label={label} onClick={onClick}>{children}</Button>
    </TooltipTrigger><TooltipContent>{label}</TooltipContent></Tip>
  );
}

function Stat({ label, value, unit, icon: I, tone, change, down, featured }: { label: string; value: string; unit?: string; icon: Icon; tone: string; change: string; down?: boolean; featured?: boolean }) {
  return (
    <div className={`stat-card ${featured ? 'featured' : ''}`}>
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}><I size={20} /></span>
        <span className={`chip ${down ? 'chip-warning' : 'chip-success'}`}>{down ? <TrendingDown size={12} /> : <TrendingUp size={12} />}{change}</span>
      </div>
      <div className="stat-value num">{value}{unit && <small>{unit}</small>}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="stat-card">
      <div className="stat-top"><div className="skeleton sk-icon lg" /><div className="skeleton sk-chip" /></div>
      <div className="skeleton sk-value" />
      <div className="skeleton sk-line w-40" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="chart-skeleton">
      <div className="skeleton sk-value" />
      <div className="bars">{[45, 70, 55, 85, 65, 95, 80].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}%` }} />)}</div>
    </div>
  );
}

function AlertRow({ icon: I, tone, title, value, onClick }: { icon: Icon; tone: string; title: string; value: string; onClick: () => void }) {
  return (
    <button className="alert-item" onClick={onClick}>
      <span className={`alert-symbol ${tone}`}><I size={18} /></span>
      <span className="alert-text"><strong>{title}</strong><small>{value}</small></span>
      <ChevronLeft size={16} className="alert-arrow" />
    </button>
  );
}

function Field({ icon: I, wide, children }: { icon: Icon; wide?: boolean; children: React.ReactNode }) {
  return <label className={`field ${wide ? 'wide' : ''}`}><I size={16} />{children}</label>;
}

function Detail({ icon: I, label, value }: { icon: Icon; label: string; value: string }) {
  return <div className="detail"><span className="title-icon"><I size={16} /></span><div><small>{label}</small><strong>{value}</strong></div></div>;
}
