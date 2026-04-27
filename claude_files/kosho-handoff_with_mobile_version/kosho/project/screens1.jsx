// Kosho screens — all major flows from TZ

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR, useCallback: useCb, Fragment: Frag } = React;

// ========== LANDING PAGE ==========
function Landing({ go, state, setState }){
  const K = window.Kosho;
  const [from, setFrom] = useS('Бишкек');
  const [to, setTo] = useS('');
  const [date, setDate] = useS('Завтра, 20 апр');
  const [seats, setSeats] = useS(1);
  const [showCityPicker, setShowCityPicker] = useS(null); // 'from' | 'to' | null
  const [showDate, setShowDate] = useS(false);
  const [showSeats, setShowSeats] = useS(false);

  const popularRoutes = [
    { from:'Бишкек', to:'Ош', count:18, price:'от 1100 сом' },
    { from:'Бишкек', to:'Каракол', count:12, price:'от 700 сом' },
    { from:'Бишкек', to:'Нарын', count:7, price:'от 650 сом' },
    { from:'Бишкек', to:'Чолпон-Ата', count:9, price:'от 450 сом' },
    { from:'Бишкек', to:'Джалал-Абад', count:5, price:'от 1000 сом' },
    { from:'Бишкек', to:'Талас', count:4, price:'от 600 сом' },
  ];

  const doSearch = () => {
    if (!to) { alert('Выберите город назначения'); return; }
    setState(s => ({...s, searchFrom: from, searchTo: to, searchDate: date, searchSeats: seats}));
    go('search');
  };

  return (
    <div>
      <div className="hero">
        <div className="hero-title">Найди <span className="accent">попутчика</span> на межгород</div>
        <div className="hero-sub">Бишкек, Ош, Каракол, Нарын и другие города Кыргызстана. Оплата водителю наличными.</div>

        <div className="hero-search" style={{background:'white'}}>
          <div className="cf-group" style={{border:'none', borderRadius:20}}>
            <div className="cf-row">
              <div onClick={()=>setShowCityPicker('from')} style={{flex:1}}>
                <CardField icon={I.mapPin} iconBg="teal" label="ОТКУДА" value={from} placeholder="Откуда едете?"/>
              </div>
              <div className="cf-vdivider"></div>
              <div onClick={()=>setShowCityPicker('to')} style={{flex:1}}>
                <CardField icon={I.flag} iconBg="amber" label="КУДА" value={to} placeholder="Куда едете?"/>
              </div>
            </div>
            <div className="cf-divider"></div>
            <div className="cf-row">
              <div onClick={()=>setShowDate(true)} style={{flex:1}}>
                <CardField icon={I.calendar} iconBg="teal" label="ДАТА" value={date} placeholder="Любая"/>
              </div>
              <div className="cf-vdivider"></div>
              <div style={{width:140}} onClick={()=>setShowSeats(true)}>
                <CardField icon={I.users} iconBg="gray" label="МЕСТ" value={`${seats}`}/>
              </div>
              <div className="cf-vdivider"></div>
              <div className="row center" style={{padding:10}}>
                <button className="btn btn-submit" onClick={doSearch}><I.search s={16}/> Найти поездку</button>
              </div>
            </div>
          </div>
        </div>

        <div className="row gap-6 mt-8" style={{justifyContent:'center', flexWrap:'wrap'}}>
          <div className="row gap-2"><I.shield s={18} style={{color:'var(--teal-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Верифицированные водители</span></div>
          <div className="row gap-2"><I.star s={18} filled style={{color:'var(--amber-400)'}}/><span style={{fontWeight:700, fontSize:13}}>Двусторонние рейтинги</span></div>
          <div className="row gap-2"><I.msg s={18} style={{color:'var(--teal-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Чат внутри платформы</span></div>
          <div className="row gap-2"><I.telegram s={18} style={{color:'var(--teal-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Telegram Mini App</span></div>
        </div>
      </div>

      <div style={{maxWidth:1200, margin:'0 auto', padding:'48px 24px'}}>
        <div className="row between mb-4">
          <div className="t-h1">Популярные маршруты</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>go('search')}>Все маршруты <I.chevR s={14}/></button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
          {popularRoutes.map((r,i) => (
            <div key={i} className="route-card" onClick={()=>{ setFrom(r.from); setTo(r.to); setState(s=>({...s, searchFrom:r.from, searchTo:r.to})); go('search'); }}>
              <div className="row between mb-3">
                <div className="row gap-2">
                  <span style={{fontWeight:800, fontSize:15}}>{r.from}</span>
                  <I.arrowRight s={14} style={{color:'var(--g-400)'}}/>
                  <span style={{fontWeight:800, fontSize:15}}>{r.to}</span>
                </div>
                <I.chevR s={16} style={{color:'var(--g-400)'}}/>
              </div>
              <div className="row between">
                <span className="t-caption">{r.count} поездок на этой неделе</span>
                <span style={{fontWeight:700, fontSize:12, color:'var(--teal-700)'}}>{r.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8" style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:20}}>
          <div className="card card-lg" style={{background:'linear-gradient(135deg, var(--teal-700), var(--teal-600))', color:'white', border:'none'}}>
            <div style={{fontSize:13, fontWeight:700, opacity:.8, textTransform:'uppercase', letterSpacing:'.08em'}}>Стань водителем</div>
            <div className="t-h1 mt-2" style={{color:'white', fontSize:28}}>Зарабатывай на пути домой</div>
            <div className="mt-3" style={{fontSize:14, opacity:.9, lineHeight:1.5}}>Разделяй расходы на бензин. Верификация за 24 часа. Первая поездка — бесплатно для платформы.</div>
            <button className="btn btn-submit mt-4" onClick={()=>go('driverVerify')}>Подать заявку <I.arrowRight s={14}/></button>
          </div>
          <div className="card card-lg">
            <I.shield s={24} style={{color:'var(--teal-600)'}}/>
            <div className="t-h2 mt-2">Безопасно</div>
            <div className="t-caption mt-2" style={{fontSize:13, color:'var(--g-700)', lineHeight:1.5}}>Проверяем права, техпаспорт и селфи каждого водителя вручную.</div>
          </div>
        </div>
      </div>

      {showCityPicker && <CityPickerModal
        title={showCityPicker==='from'?'Откуда':'Куда'}
        exclude={showCityPicker==='from'?to:from}
        onPick={v => { if (showCityPicker==='from') setFrom(v); else setTo(v); setShowCityPicker(null); }}
        onClose={()=>setShowCityPicker(null)}/>}

      {showDate && <DatePickerModal
        onPick={v => { setDate(v); setShowDate(false); }}
        onClose={()=>setShowDate(false)}/>}

      {showSeats && <Modal open onClose={()=>setShowSeats(false)} title="Количество мест">
        <div className="row center gap-4 mt-3 mb-3">
          <button className="btn-icon" onClick={()=>setSeats(Math.max(1, seats-1))}><I.minus s={16}/></button>
          <div style={{fontSize:48, fontWeight:800, minWidth:60, textAlign:'center'}}>{seats}</div>
          <button className="btn-icon" onClick={()=>setSeats(Math.min(4, seats+1))}><I.plus s={16}/></button>
        </div>
        <div className="t-caption text-center">Максимум 4 места в одной брони</div>
        <button className="btn btn-primary btn-block mt-4" onClick={()=>setShowSeats(false)}>Готово</button>
      </Modal>}
    </div>
  );
}

function CityPickerModal({ title, exclude, onPick, onClose }){
  const K = window.Kosho;
  const [q, setQ] = useS('');
  const list = K.CITIES.filter(c => c.name_ru !== exclude && (!q || c.name_ru.toLowerCase().includes(q.toLowerCase())));
  return (
    <Modal open onClose={onClose} title={title}>
      <input className="field-input w-full mb-3" autoFocus placeholder="Начните вводить город..." value={q} onChange={e=>setQ(e.target.value)}/>
      <div className="col" style={{gap:4, maxHeight:320, overflowY:'auto'}}>
        {list.map(c => (
          <button key={c.id} className="row gap-3" style={{padding:'10px 12px', borderRadius:10, textAlign:'left', width:'100%'}} onMouseEnter={e=>e.currentTarget.style.background='var(--g-50)'} onMouseLeave={e=>e.currentTarget.style.background=''} onClick={()=>onPick(c.name_ru)}>
            <I.mapPin s={16} style={{color:'var(--teal-600)'}}/>
            <div className="col" style={{alignItems:'flex-start'}}>
              <span style={{fontWeight:700, fontSize:14}}>{c.name_ru}</span>
              <span className="t-caption">{c.region}</span>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function DatePickerModal({ onPick, onClose }){
  const opts = ['Сегодня, 19 апр', 'Завтра, 20 апр', 'Послезавтра, 21 апр', 'Суббота, 22 апр', 'Воскресенье, 23 апр', 'На этой неделе', 'Любая дата'];
  return (
    <Modal open onClose={onClose} title="Выберите дату">
      <div className="col gap-2">
        {opts.map(o => (
          <button key={o} className="btn btn-ghost" style={{justifyContent:'space-between'}} onClick={()=>onPick(o)}>
            <span>{o}</span><I.chevR s={14}/>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ========== SEARCH PAGE (split view) ==========
function Search({ go, state, setState }){
  const K = window.Kosho;
  const [from, setFrom] = useS(state.searchFrom || 'Бишкек');
  const [to, setTo] = useS(state.searchTo || 'Ош');
  const [sort, setSort] = useS('time');
  const [minRating, setMinRating] = useS(0);
  const [verifiedOnly, setVerifiedOnly] = useS(true);
  const [activeId, setActiveId] = useS(null);
  const [showCityPicker, setShowCityPicker] = useS(null);

  const results = useM(() => {
    let r = K.TRIPS.filter(t => t.status==='active');
    if (from) r = r.filter(t => t.from === from);
    if (to) r = r.filter(t => t.to === to);
    if (verifiedOnly) r = r.filter(t => K.getUser(t.driver_id).verified);
    if (minRating > 0) r = r.filter(t => K.getUser(t.driver_id).rating >= minRating);
    if (sort === 'price') r = [...r].sort((a,b) => a.price - b.price);
    else if (sort === 'rating') r = [...r].sort((a,b) => K.getUser(b.driver_id).rating - K.getUser(a.driver_id).rating);
    else r = [...r].sort((a,b) => a.departure_at - b.departure_at);
    return r;
  }, [from, to, sort, minRating, verifiedOnly]);

  useE(() => { if (results.length && !activeId) setActiveId(results[0].id); }, [results]);
  const activeTrip = results.find(t => t.id === activeId) || results[0];
  const [mobileFiltersOpen, setMobileFiltersOpen] = useS(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useS(false);

  return (
    <div className="split search-split">
      {/* Mobile filter/sort bar — only shown <768 via CSS */}
      <div className="search-mobile-bar">
        <button className="btn btn-outline btn-sm" onClick={()=>setMobileFiltersOpen(true)}><I.filter s={14}/> Фильтры</button>
        <div className="t-caption" style={{flex:1, textAlign:'center'}}>{results.length} поездок</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>{/* refresh */}}><I.refresh s={14}/></button>
      </div>

      {/* FILTERS (desktop: left pane; mobile: bottom sheet) */}
      <div className={`pane search-filters ${mobileFiltersOpen?'mobile-open':''}`}>
        <div className="mobile-sheet-header mobile-only">
          <div className="mobile-sheet-handle"></div>
          <div className="row between">
            <div className="t-h2">Фильтры</div>
            <button className="btn-icon" onClick={()=>setMobileFiltersOpen(false)}><I.x s={14}/></button>
          </div>
        </div>
        <div className="t-label mb-2">Маршрут</div>
        <div className="cf-group mb-4">
          <div onClick={()=>setShowCityPicker('from')}><CardField icon={I.mapPin} iconBg="teal" label="ОТКУДА" value={from}/></div>
          <div className="cf-divider"></div>
          <div onClick={()=>setShowCityPicker('to')}><CardField icon={I.flag} iconBg="amber" label="КУДА" value={to}/></div>
        </div>

        <div className="t-label mb-2">Дата</div>
        <div className="col gap-2 mb-4">
          {['Сегодня', 'Завтра', 'В выходные', 'Любая'].map(d => (
            <button key={d} className={`chip ${d==='Завтра'?'active':''}`} style={{justifyContent:'flex-start'}}>{d}</button>
          ))}
        </div>

        <div className="t-label mb-2">Сортировка</div>
        <div className="col gap-2 mb-4">
          {[['time','По времени'],['price','По цене'],['rating','По рейтингу']].map(([v,l]) => (
            <button key={v} className={`chip ${sort===v?'active':''}`} style={{justifyContent:'flex-start'}} onClick={()=>setSort(v)}>{l}</button>
          ))}
        </div>

        <div className="t-label mb-2">Рейтинг водителя</div>
        <div className="row gap-2 mb-4" style={{flexWrap:'wrap'}}>
          {[0, 4.0, 4.5, 4.8].map(r => (
            <button key={r} className={`chip ${minRating===r?'active':''}`} onClick={()=>setMinRating(r)}>
              {r===0 ? 'Любой' : `${r}+ ★`}
            </button>
          ))}
        </div>

        <div className="row between mb-2">
          <span className="t-body">Только верифицированные</span>
          <Switch on={verifiedOnly} onChange={setVerifiedOnly}/>
        </div>
        <div className="t-caption">Мы проверяем права, техпаспорт и селфи</div>

        <div className="divider"></div>
        <div className="t-label mb-2">Цена</div>
        <div className="row gap-2">
          <input className="field-input" placeholder="От" style={{flex:1}}/>
          <input className="field-input" placeholder="До" style={{flex:1}}/>
        </div>

        {showCityPicker && <CityPickerModal
          title={showCityPicker==='from'?'Откуда':'Куда'}
          exclude={showCityPicker==='from'?to:from}
          onPick={v => { if (showCityPicker==='from') setFrom(v); else setTo(v); setShowCityPicker(null); }}
          onClose={()=>setShowCityPicker(null)}/>}
      </div>

      {/* LIST */}
      <div className="pane-main">
        <div className="row between mb-4">
          <div>
            <div className="t-h1">{from} → {to}</div>
            <div className="t-caption mt-1">Найдено {results.length} поездок · Сортировка: {sort==='time'?'по времени':sort==='price'?'по цене':'по рейтингу'}</div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-ghost btn-sm"><I.refresh s={14}/> Обновить</button>
          </div>
        </div>

        <div className="col gap-3">
          {results.length === 0 && (
            <div className="card card-lg text-center">
              <div className="t-h2 mb-2">Поездок не найдено</div>
              <div className="t-caption mb-4">Попробуйте изменить фильтры или выбрать другую дату.</div>
              <button className="btn btn-secondary">Создать уведомление</button>
            </div>
          )}
          {results.map(t => <TripCard key={t.id} trip={t} active={activeId===t.id} onClick={()=>{ setActiveId(t.id); setMobileDetailOpen(true); }}/>)}
        </div>
      </div>

      {/* DETAIL */}
      <div className={`pane-detail search-detail ${mobileDetailOpen?'mobile-open':''}`}>
        <div className="mobile-sheet-header mobile-only">
          <div className="mobile-sheet-handle"></div>
          <div className="row between">
            <div className="t-h2">Детали поездки</div>
            <button className="btn-icon" onClick={()=>setMobileDetailOpen(false)}><I.x s={14}/></button>
          </div>
        </div>
        {activeTrip && <TripDetailPane trip={activeTrip} onBook={() => { setState(s => ({...s, bookingTripId: activeTrip.id})); go('booking'); }}/>}
      </div>

      {/* Mobile backdrops */}
      {mobileFiltersOpen && <div className="mobile-sheet-backdrop" onClick={()=>setMobileFiltersOpen(false)}></div>}
      {mobileDetailOpen && <div className="mobile-sheet-backdrop" onClick={()=>setMobileDetailOpen(false)}></div>}
    </div>
  );
}

function TripDetailPane({ trip, onBook }){
  const K = window.Kosho;
  const driver = K.getUser(trip.driver_id);
  const prefs = {
    silence: { label:'Тишина', icon: I.silence },
    music: { label:'Музыка', icon: I.music },
    no_smoking: { label:'Не курить', icon: I.smokeOff },
  };

  return (
    <div>
      <div className="row gap-3 mb-4">
        <Avatar user={driver} size={56}/>
        <div className="col flex-1">
          <div className="row gap-2" style={{alignItems:'center'}}>
            <span style={{fontWeight:800, fontSize:18}}>{driver.name}</span>
            {driver.verified && <span className="badge badge-verified"><I.shield s={10}/> Верифицирован</span>}
          </div>
          <div className="row gap-2 mt-1">
            <Stars value={driver.rating}/>
            <span style={{fontWeight:700}}>{driver.rating.toFixed(1)}</span>
            <span className="muted">· {driver.rating_count} оценок · {driver.trips} поездок</span>
          </div>
        </div>
      </div>

      <div className="card mb-3" style={{background:'var(--g-50)', border:'none'}}>
        <div className="row gap-2"><I.car s={14} style={{color:'var(--teal-600)'}}/><span style={{fontWeight:700, fontSize:14}}>{trip.car}</span></div>
      </div>

      <div className="t-label mb-2">Маршрут</div>
      <div className="card mb-4">
        <div className="row gap-3" style={{alignItems:'flex-start'}}>
          <div className="col" style={{alignItems:'center', paddingTop:4}}>
            <span style={{width:10,height:10,borderRadius:'50%',background:'var(--teal-500)',boxShadow:'0 0 0 3px var(--teal-100)'}}></span>
            <div style={{width:2, height:40, background:'var(--g-300)', margin:'4px 0'}}></div>
            <span style={{width:10,height:10,borderRadius:'50%',background:'var(--amber-500)',boxShadow:'0 0 0 3px var(--amber-100)'}}></span>
          </div>
          <div className="col flex-1 gap-4">
            <div>
              <div style={{fontWeight:800, fontSize:16}}>{trip.from}</div>
              <div className="t-caption mt-1">{K.fmtDateTime(trip.departure_at)}</div>
            </div>
            <div>
              <div style={{fontWeight:800, fontSize:16}}>{trip.to}</div>
              <div className="t-caption mt-1">Прибытие ~{K.fmtTime(new Date(trip.departure_at.getTime() + trip.duration_min*60000))} · {K.fmtDuration(trip.duration_min)} в пути</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gap-2 mb-4" style={{flexWrap:'wrap'}}>
        <span className="badge badge-seats"><I.users s={12}/> Свободно {trip.seats_available} из {trip.seats_total}</span>
        {trip.luggage==='yes' && <span className="badge badge-seats"><I.luggage s={12}/> Большой багаж</span>}
        {trip.luggage==='small' && <span className="badge badge-seats"><I.luggage s={12}/> Небольшой</span>}
        {trip.negotiable && <span className="badge badge-pending">Цена обсуждается</span>}
      </div>

      {trip.prefs.length > 0 && <>
        <div className="t-label mb-2">В поездке</div>
        <div className="row gap-2 mb-4" style={{flexWrap:'wrap'}}>
          {trip.prefs.map(p => {
            const pref = prefs[p]; if (!pref) return null;
            const Ic = pref.icon;
            return <span key={p} className="chip active"><Ic s={12}/>{pref.label}</span>
          })}
        </div>
      </>}

      {trip.comment && <>
        <div className="t-label mb-2">Комментарий водителя</div>
        <div className="card mb-4" style={{background:'var(--teal-50)', border:'none', fontSize:13, lineHeight:1.5}}>
          «{trip.comment}»
        </div>
      </>}

      <div className="card mb-4" style={{background:'var(--amber-50)', borderColor:'var(--amber-100)'}}>
        <div className="row gap-2"><I.lock s={14} style={{color:'var(--amber-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Номер водителя скрыт</span></div>
        <div className="t-caption mt-1">Показывается сразу после принятия бронирования.</div>
      </div>

      <div className="row between" style={{alignItems:'flex-end', marginBottom:12}}>
        <div>
          <div className="t-caption">Цена за место</div>
          <div style={{fontSize:28, fontWeight:800, color:'var(--teal-700)'}}>{trip.price} сом</div>
        </div>
        <div className="t-caption">Оплата наличными водителю</div>
      </div>

      <button className="btn btn-submit btn-block" onClick={onBook}>
        <I.checkCircle s={16}/> Забронировать место
      </button>
      <button className="btn btn-outline btn-block mt-2"><I.msg s={14}/> Написать водителю</button>
    </div>
  );
}

// ========== BOOKING CONFIRM ==========
function Booking({ go, state, setState }){
  const K = window.Kosho;
  const trip = K.getTrip(state.bookingTripId) || K.TRIPS[0];
  const driver = K.getUser(trip.driver_id);
  const [seats, setSeats] = useS(1);
  const [comment, setComment] = useS('');
  const [step, setStep] = useS('form'); // form | waiting | accepted

  const submit = () => {
    if (!state.user) { setState(s => ({...s, deferredAction: {action:'book_trip', trip_id: trip.id, seats, comment}})); go('login'); return; }
    setStep('waiting');
    setTimeout(() => setStep('accepted'), 3200);
  };

  return (
    <div style={{maxWidth:720, margin:'0 auto', padding:'32px 24px'}}>
      <button className="btn btn-ghost btn-sm mb-4" onClick={()=>go('search')}><I.chevL s={14}/> Назад к поиску</button>

      {step==='form' && <>
        <div className="t-h1 mb-2">Подтверждение бронирования</div>
        <div className="t-caption mb-6">Проверьте детали и отправьте запрос водителю</div>

        <div className="card card-lg mb-4">
          <div className="row gap-3">
            <Avatar user={driver} size={56}/>
            <div className="col flex-1">
              <div className="row gap-2">
                <span style={{fontWeight:800, fontSize:16}}>{driver.name}</span>
                {driver.verified && <span style={{color:'var(--teal-600)'}}><I.shield s={14}/></span>}
              </div>
              <div className="row gap-1 mt-1"><Stars value={driver.rating}/><span style={{fontWeight:700, fontSize:13}}>{driver.rating.toFixed(1)}</span></div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="row between">
            <div>
              <div className="t-label">Маршрут</div>
              <div style={{fontWeight:700, fontSize:15, marginTop:4}}>{trip.from} → {trip.to}</div>
            </div>
            <div>
              <div className="t-label">Отправление</div>
              <div style={{fontWeight:700, fontSize:15, marginTop:4}}>{K.fmtDateTime(trip.departure_at)}</div>
            </div>
          </div>
        </div>

        <div className="card card-lg mb-4">
          <div className="row between mb-3">
            <div>
              <div className="t-h2">Количество мест</div>
              <div className="t-caption mt-1">Свободно: {trip.seats_available}</div>
            </div>
            <div className="row gap-3">
              <button className="btn-icon" onClick={()=>setSeats(Math.max(1, seats-1))}><I.minus s={16}/></button>
              <div style={{fontSize:24, fontWeight:800, minWidth:30, textAlign:'center'}}>{seats}</div>
              <button className="btn-icon" onClick={()=>setSeats(Math.min(trip.seats_available, seats+1))}><I.plus s={16}/></button>
            </div>
          </div>

          <div className="divider"></div>

          <div className="field">
            <div className="field-label">Комментарий для водителя (необязательно)</div>
            <textarea className="field-input" rows={3} placeholder="Например: Большой багаж, еду один, готов к ранней встрече..." value={comment} onChange={e=>setComment(e.target.value)} maxLength={300}/>
            <div className="field-hint">{comment.length}/300 · номера телефонов автоматически скрываются</div>
          </div>
        </div>

        <div className="card card-lg mb-4" style={{background:'var(--teal-50)', borderColor:'var(--teal-100)'}}>
          <div className="row between mb-2">
            <span className="t-h2">К оплате водителю</span>
            <span style={{fontSize:24, fontWeight:800, color:'var(--teal-700)'}}>{trip.price * seats} сом</span>
          </div>
          <div className="t-caption">{trip.price} сом × {seats} {seats===1?'место':'места'} · Наличными при встрече</div>
        </div>

        <div className="card mb-4" style={{background:'var(--amber-50)', borderColor:'var(--amber-100)'}}>
          <div className="row gap-2 mb-1"><I.alert s={14} style={{color:'var(--amber-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Водитель может отклонить запрос</span></div>
          <div className="t-caption">Вы получите ответ в течение часа. Номер водителя станет виден после принятия.</div>
        </div>

        <div className="row gap-2">
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>go('search')}>Отмена</button>
          <button className="btn btn-submit" style={{flex:2}} onClick={submit}><I.send s={14}/> Отправить запрос</button>
        </div>
      </>}

      {step==='waiting' && <div className="card card-lg text-center">
        <div style={{margin:'24px auto', width:80, height:80, borderRadius:'50%', background:'var(--amber-50)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <I.clock s={36} style={{color:'var(--amber-500)'}}/>
        </div>
        <div className="t-h1">Запрос отправлен</div>
        <div className="t-caption mt-2" style={{textWrap:'pretty'}}>Водитель уведомлён. Пока ждёте ответ, можете задать уточняющие вопросы в чате до бронирования.</div>
        <div className="progress mt-4"><div className="progress-fill" style={{width:'40%', background:'var(--amber-500)', animation:'none'}}></div></div>

        <div className="card mt-4" style={{background:'var(--teal-50)', borderColor:'var(--teal-100)', textAlign:'left'}}>
          <div className="row gap-2 mb-1"><I.msg s={14} style={{color:'var(--teal-700)'}}/><span style={{fontWeight:800, fontSize:13, color:'var(--teal-800, #0f5258)'}}>Чат до бронирования</span></div>
          <div className="t-caption" style={{lineHeight:1.5}}>
            Лимит — {window.Kosho.PRE_BOOKING_LIMIT} сообщений. Телефоны и соцсети скрываются автоматически.
            Как только водитель откроет карточку, вы увидите «👁 Просматривает». После принятия — чат в полном режиме, история сохранится.
          </div>
        </div>

        <div className="row gap-2 mt-4">
          <button className="btn btn-outline" style={{flex:1}} onClick={()=>go('myBookings')}>Мои поездки</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>{
            // ensure we open pre-booking chat for THIS booking
            setState(s=>({...s, chatBookingId:'b_pre'}));
            go('chat');
          }}><I.msg s={14}/> Открыть pre-booking чат</button>
        </div>
        <div className="row center gap-2 mt-4 t-caption">
          <I.bell s={14}/> Уведомление придёт в Telegram и в приложение
        </div>
      </div>}

      {step==='accepted' && <div className="card card-lg text-center">
        <div style={{margin:'24px auto', width:80, height:80, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <I.checkCircle s={36} style={{color:'var(--success)'}}/>
        </div>
        <div className="t-h1">{driver.name} принял запрос!</div>
        <div className="t-caption mt-2" style={{textWrap:'pretty'}}>Чат в полном режиме, лимит снят, история pre-booking сохранена.<br/>Номер водителя: <span style={{fontWeight:700, color:'var(--g-900)'}}>{driver.phone}</span></div>

        <div className="row gap-2 mt-6">
          <button className="btn btn-outline" style={{flex:1}} onClick={()=>go('myBookings')}>Мои поездки</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>{ setState(s=>({...s, chatBookingId:'b3'})); go('chat'); }}><I.msg s={14}/> Открыть чат</button>
        </div>
      </div>}
    </div>
  );
}

window.Landing = Landing;
window.Search = Search;
window.Booking = Booking;
