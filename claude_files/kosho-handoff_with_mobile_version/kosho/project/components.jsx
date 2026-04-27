// Shared React components for Kosho

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, Fragment } = React;

// === Icon components (Lucide-style inline SVG) ===
const I = {
  mapPin: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>,
  flag: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 22V4"/><path d="M4 5h14l-2 4 2 4H4"/></svg>,
  arrowRight: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  users: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  car: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 7c-.5-1.2-1.7-2-3-2H9c-1.3 0-2.5.8-3 2l-2.5 4.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  star: (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill={p.filled?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  msg: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  bell: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  shield: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8z"/><path d="m9 12 2 2 4-4"/></svg>,
  clock: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  luggage: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="6" y="8" width="12" height="12" rx="2"/><path d="M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M10 20v2"/><path d="M14 20v2"/></svg>,
  check: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  checkCircle: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  x: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  xCircle: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  alert: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  lock: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  logOut: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  settings: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  camera: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  plus: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  send: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  calendar: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chevL: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  chevR: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  chevD: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  filter: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  music: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  smokeOff: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="2" y1="2" x2="22" y2="22"/><path d="M12 4v4"/><path d="M4 14h12v4H4z"/></svg>,
  silence: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  telegram: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="0" fill="currentColor"/></svg>,
  google: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>,
  apple: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.05 20.28c-.98.95-2.05.86-3.08.43-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.43C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>,
  phone: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>,
  mail: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  route: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>,
  briefcase: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  dashboard: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  trending: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  upload: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  trash: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  refresh: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  moreV: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  home: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

// === Stars ===
function Stars({ value=5, size=14 }){
  const v = Math.round(value);
  return (
    <div className="stars" style={{color:'var(--amber-400)'}}>
      {[1,2,3,4,5].map(i => <I.star key={i} s={size} filled={i<=v} style={{color: i<=v?'var(--amber-400)':'var(--g-300)'}}/>)}
    </div>
  );
}

// === Avatar ===
function Avatar({ user, size=40 }){
  const cls = `avatar avatar-${size} ${user?.color || ''}`;
  return <div className={cls}>{user?.avatar || '?'}</div>;
}

// === Route dots ===
function RouteDots({ from, to, departure, duration }){
  return (
    <div className="col" style={{gap:0}}>
      <div className="route-line"><span className="route-dot"></span><span style={{fontWeight:700, fontSize:14}}>{from}</span></div>
      <div className="route-path"></div>
      <div className="route-line"><span className="route-dot end"></span><span style={{fontWeight:700, fontSize:14}}>{to}</span></div>
    </div>
  );
}

// === Trip card ===
function TripCard({ trip, active, onClick, compact=false }){
  const K = window.Kosho;
  const driver = K.getUser(trip.driver_id);
  return (
    <div className={`card card-interactive ${active?'active':''}`} onClick={onClick} style={{padding: compact?12:16}}>
      <div className="row between mb-3">
        <div className="row gap-2">
          <Avatar user={driver} size={40} />
          <div className="col">
            <div className="row gap-1" style={{alignItems:'center'}}>
              <span style={{fontWeight:700, fontSize:14}}>{driver.name}</span>
              {driver.verified && <span style={{color:'var(--teal-600)'}}><I.shield s={14}/></span>}
            </div>
            <div className="row gap-1" style={{alignItems:'center', fontSize:12}}>
              {driver.rating_count >= 3 ? (<>
                <I.star s={12} filled style={{color:'var(--amber-400)'}}/>
                <span style={{fontWeight:700}}>{driver.rating.toFixed(1)}</span>
                <span className="muted">· {driver.trips} поездок</span>
              </>) : <span className="badge badge-new">Новый</span>}
            </div>
          </div>
        </div>
        <div className="col" style={{alignItems:'flex-end'}}>
          <div style={{fontWeight:800, fontSize:18, color:'var(--teal-700)'}}>{trip.price} сом</div>
          <div className="t-caption">за место</div>
        </div>
      </div>

      <div className="row between" style={{alignItems:'flex-start', gap:16}}>
        <div className="col" style={{flex:1}}>
          <div className="row gap-2" style={{alignItems:'center'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'var(--teal-500)',boxShadow:'0 0 0 3px var(--teal-100)'}}></span>
            <span style={{fontWeight:700, fontSize:14}}>{trip.from}</span>
            <span style={{color:'var(--g-400)'}}>·</span>
            <span className="t-caption">{K.fmtTime(trip.departure_at)}</span>
          </div>
          <div style={{width:2, height:14, background:'var(--g-300)', marginLeft:3}}></div>
          <div className="row gap-2" style={{alignItems:'center'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'var(--amber-500)',boxShadow:'0 0 0 3px var(--amber-100)'}}></span>
            <span style={{fontWeight:700, fontSize:14}}>{trip.to}</span>
            <span style={{color:'var(--g-400)'}}>·</span>
            <span className="t-caption">~{K.fmtDuration(trip.duration_min)}</span>
          </div>
        </div>
      </div>

      <div className="divider" style={{margin:'12px 0'}}></div>

      <div className="row between">
        <div className="row gap-2">
          <span className="badge badge-seats"><I.users s={12}/> {trip.seats_available} из {trip.seats_total}</span>
          {trip.luggage==='yes' && <span className="badge badge-seats"><I.luggage s={12}/> Багаж</span>}
          {trip.negotiable && <span className="badge badge-pending">Торг</span>}
        </div>
        <div className="t-caption">{K.fmtDate(trip.departure_at)}</div>
      </div>
    </div>
  );
}

// === Card field input ===
function CardField({ icon, iconBg='teal', label, value, placeholder, onChange, editable=false, flex=1 }){
  const Icon = icon;
  return (
    <label className="cf" style={{flex}}>
      <span className={`cf-icon ${iconBg}`}><Icon s={16}/></span>
      <div className="cf-body">
        <span className="cf-label">{label}</span>
        {editable ? (
          <input value={value||''} onChange={e=>onChange?.(e.target.value)} placeholder={placeholder||''}/>
        ) : (
          <span className={`cf-value ${!value?'placeholder':''}`}>{value || placeholder}</span>
        )}
      </div>
    </label>
  );
}

// === Toast system ===
const ToastCtx = createContext(null);
function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, variant='default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, {id, msg, variant}]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-host">
        {toasts.map(t => <div key={t.id} className={`toast ${t.variant}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// === Modal ===
function Modal({ open, onClose, title, children, footer, size='md' }){
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${size==='lg'?'modal-lg':''}`} onClick={e=>e.stopPropagation()}>
        {title && <div className="modal-hd">
          <div className="t-h2">{title}</div>
          <button className="btn-icon" onClick={onClose}><I.x s={16}/></button>
        </div>}
        <div className="modal-bd">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
}

// === Switch ===
function Switch({ on, onChange }){
  return <div className={`switch ${on?'on':''}`} onClick={()=>onChange?.(!on)}/>;
}

// ===== Quick Actions (floating FAB + popover) =====
function QuickActions({ user, go, state, setState }){
  const K = window.Kosho;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chats');
  const [, force] = useState(0);
  const rerender = () => force(x => x + 1);
  const toast = useToast();
  const panelRef = useRef(null);

  // build chat list: every booking I'm part of that has messages
  const chats = [];
  K.BOOKINGS.forEach(b => {
    const t = K.getTrip(b.trip_id); if (!t) return;
    const iAmPassenger = b.passenger_id === user.id;
    const iAmDriver = t.driver_id === user.id;
    if (!iAmPassenger && !iAmDriver) return;
    if (b.status === 'rejected' || b.status === 'cancelled') return;
    const msgs = K.MESSAGES[b.id] || [];
    if (msgs.length === 0) return;
    const other = K.getUser(iAmPassenger ? t.driver_id : b.passenger_id);
    const last = msgs[msgs.length - 1];
    const unread = last.sender !== user.id && !last.read;
    chats.push({ booking: b, trip: t, other, last, unread, time: last.time });
  });
  chats.sort((a,b) => b.time - a.time);
  const unreadCount = chats.filter(c => c.unread).length;

  // pending requests across my trips (driver side)
  const requests = K.BOOKINGS.filter(b => {
    const t = K.getTrip(b.trip_id);
    return t && t.driver_id === user.id && b.status === 'pending';
  }).map(b => {
    const t = K.getTrip(b.trip_id);
    const p = K.getUser(b.passenger_id);
    const mins = b.expires_at ? Math.max(0, Math.round((b.expires_at - new Date())/60000)) : null;
    return { b, t, p, mins };
  });

  // recent notifications (show up to 8; "unread" count drives the badge)
  const notifications = (K.NOTIFICATIONS || []).slice(0, 12);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const totalBadge = unreadCount + requests.length + unreadNotifs;

  // Sync body class for Tweaks stacking
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') document.body.classList.add('tweaks-open');
      if (e.data?.type === '__deactivate_edit_mode') document.body.classList.remove('tweaks-open');
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.qa-fab')) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Switch to a sensible tab when opening
  const toggle = () => {
    if (!open) {
      setTab(requests.length > 0 && unreadCount === 0 ? 'requests' : 'chats');
    }
    setOpen(!open);
  };

  const acceptBooking = (b) => {
    const t = K.getTrip(b.trip_id);
    if (!t || t.seats_available < b.seats) { toast('Недостаточно мест', 'error'); return; }
    b.status = 'confirmed'; b.accepted_at = new Date();
    t.seats_available -= b.seats;
    if (!K.MESSAGES[b.id]) {
      K.MESSAGES[b.id] = [{ sender: user.id, text: `Запрос принят. Встречаемся ${K.fmtDateTime(t.departure_at)}.`, time: new Date(), status:'sent' }];
    }
    K.NOTIFICATIONS.unshift({ id:'n_'+Math.random().toString(36).slice(2,7), type:'booking_accepted', title:'Запрос принят', text:`${user.name} принял(а) вашу заявку.`, time:'только что', variant:'ok', read:false });
    toast(`Запрос принят`, 'success');
    rerender();
  };
  const rejectBooking = (b) => {
    b.status = 'rejected'; b.rejected_at = new Date();
    K.NOTIFICATIONS.unshift({ id:'n_'+Math.random().toString(36).slice(2,7), type:'booking_rejected', title:'Запрос отклонён', text:`Заявка отклонена.`, time:'только что', variant:'warn', read:false });
    toast('Запрос отклонён', 'info');
    rerender();
  };

  const openChat = (bookingId) => {
    setState(s => ({...s, chatBookingId: bookingId}));
    setOpen(false);
    go('chat');
  };

  const relTime = (d) => {
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return 'сейчас';
    if (diff < 3600) return `${Math.floor(diff/60)} мин`;
    if (diff < 86400) return `${Math.floor(diff/3600)} ч`;
    return `${Math.floor(diff/86400)} д`;
  };

  return (
    <Fragment>
      <button className="qa-fab" onClick={toggle} aria-label="Быстрые действия">
        {open ? <I.x s={22}/> : <I.msg s={22}/>}
        {!open && totalBadge > 0 && <span className="qa-fab-badge">{totalBadge}</span>}
      </button>

      {open && (
        <div className="qa-panel" ref={panelRef}>
          <div className="qa-head">
            <h4>Быстрые действия</h4>
            <button className="btn-icon" style={{width:28,height:28}} onClick={()=>setOpen(false)}><I.x s={12}/></button>
          </div>
          <div className="qa-tabs">
            <button className={`qa-tab ${tab==='chats'?'active':''}`} onClick={()=>setTab('chats')}>
              <I.msg s={14}/> Чаты
              {unreadCount > 0 && <span className="qa-count amber">{unreadCount}</span>}
            </button>
            <button className={`qa-tab ${tab==='requests'?'active':''}`} onClick={()=>setTab('requests')}>
              <I.bell s={14}/> Запросы
              {requests.length > 0 && <span className="qa-count amber">{requests.length}</span>}
            </button>
            <button className={`qa-tab ${tab==='notifs'?'active':''}`} onClick={()=>setTab('notifs')}>
              <I.bell s={14}/> Уведомления
              {unreadNotifs > 0 && <span className="qa-count amber">{unreadNotifs}</span>}
            </button>
          </div>

          <div className="qa-body">
            {tab === 'chats' && (
              chats.length === 0
                ? <div className="qa-empty">Пока нет активных чатов.<br/>Подтверждённые поездки появятся здесь.</div>
                : chats.map(c => (
                    <div key={c.booking.id} className={`qa-item ${c.unread?'unread':''}`} onClick={()=>openChat(c.booking.id)}>
                      <Avatar user={c.other} size={40}/>
                      <div className="qa-item-body">
                        <div className="qa-item-top">
                          <span className="qa-item-name">{c.other.name}</span>
                          <span className="qa-item-time">{relTime(c.last.time)}</span>
                        </div>
                        <div className="qa-item-route">{c.trip.from} → {c.trip.to} · {K.fmtDate(c.trip.departure_at)}</div>
                        <div className="qa-item-text">
                          {c.last.sender === user.id && <span style={{color:'var(--g-500)'}}>Вы: </span>}
                          {c.last.text}
                        </div>
                      </div>
                    </div>
                  ))
            )}

            {tab === 'requests' && (
              requests.length === 0
                ? <div className="qa-empty">Нет новых запросов.<br/>Когда пассажиры запросят место, они появятся здесь.</div>
                : requests.map(({ b, t, p, mins }) => (
                    <div key={b.id} className="qa-request">
                      <div className="qa-req-top">
                        <Avatar user={p} size={36}/>
                        <div style={{flex:1, minWidth:0}}>
                          <div className="row between" style={{alignItems:'center', gap:8}}>
                            <span style={{fontWeight:800, fontSize:13}}>{p.name}</span>
                            {mins !== null && (
                              <span className={`qa-req-timer ${mins<15?'urgent':''}`}>
                                <I.clock s={10}/> {mins>0 ? `${mins} мин` : 'истекло'}
                              </span>
                            )}
                          </div>
                          <div className="qa-req-meta">
                            <I.star s={10} style={{color:'var(--amber-500)', verticalAlign:'-1px'}}/> {p.rating || '—'}
                            {' · '}{t.from} → {t.to} · {K.fmtDate(t.departure_at)} · {b.seats} мест · {b.seats * t.price} сом
                          </div>
                        </div>
                      </div>
                      {b.comment && <div className="qa-req-detail">«{b.comment}»</div>}
                      <div className="qa-req-actions">
                        <button className="btn btn-submit btn-sm" onClick={()=>acceptBooking(b)}><I.check s={12}/> Принять</button>
                        <button className="btn btn-outline btn-sm" onClick={()=>rejectBooking(b)}><I.x s={12}/> Отклонить</button>
                        <div style={{flex:1}}></div>
                        <button className="btn btn-ghost btn-sm" onClick={()=>{ setState(s=>({...s, requestsTripId:t.id, myBookingsTab:'requests'})); setOpen(false); go('myBookings'); }}>Подробнее</button>
                      </div>
                    </div>
                  ))
            )}

            {tab === 'notifs' && (
              notifications.length === 0
                ? <div className="qa-empty">Пока нет уведомлений.<br/>Тут появятся статусы бронирований, поездок и системные сообщения.</div>
                : notifications.map(n => {
                    const Icon = n.variant === 'warn' ? I.alert : (n.variant === 'err' ? I.xCircle : (n.variant === 'ok' ? I.checkCircle : I.bell));
                    return (
                      <div key={n.id} className={`qa-notif ${n.read?'':'unread'} v-${n.variant||'info'}`} onClick={()=>{ n.read = true; rerender(); setOpen(false); go('notifications'); }}>
                        <span className="qa-notif-ic"><Icon s={14}/></span>
                        <div className="qa-notif-body">
                          <div className="qa-notif-top">
                            <span className="qa-notif-title">{n.title}</span>
                            <span className="qa-notif-time">{n.time}</span>
                          </div>
                          <div className="qa-notif-text">{n.text}</div>
                        </div>
                      </div>
                    );
                  })
            )}
          </div>

          <div className="qa-footer">
            <span style={{color:'var(--g-500)'}}>
              {tab==='chats' ? `${chats.length} чат(ов)` : tab==='requests' ? `${requests.length} запрос(ов)` : `${notifications.length} уведомлен.`}
            </span>
            <button className="lnk" onClick={()=>{
              setOpen(false);
              if (tab==='chats') go('chat');
              else if (tab==='notifs') go('notifications');
              else { setState(s=>({...s, myBookingsTab:'requests'})); go('myBookings'); }
            }}>Открыть все →</button>
          </div>
        </div>
      )}
    </Fragment>
  );
}

// Export
Object.assign(window, {
  I, Stars, Avatar, RouteDots, TripCard, CardField, ToastProvider, useToast, Modal, Switch, QuickActions,
  React_useState: useState, React_useEffect: useEffect
});
