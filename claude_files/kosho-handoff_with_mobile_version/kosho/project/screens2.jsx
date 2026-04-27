// Kosho screens part 2: publish wizard, my bookings, chat, profile, driver verification, admin

const { useState: useS2, useEffect: useE2, useMemo: useM2, useRef: useR2 } = React;

// ========== PUBLISH WIZARD (3 steps) ==========
function Publish({ go, state, setState }){
  const K = window.Kosho;
  const [step, setStep] = useS2(1);
  const [data, setData] = useS2({
    from:'Бишкек', to:'', departure_at: null, time:'09:00',
    seats:3, price: 1200, negotiable:false, luggage:'small',
    prefs:['no_smoking'], comment:'', car:''
  });
  const [showCityPicker, setShowCityPicker] = useS2(null);
  const toast = useToast();

  const canNext1 = data.from && data.to && data.from !== data.to && data.departure_at;
  const canNext2 = data.seats >= 1 && data.price > 0;

  const publish = () => {
    if (!state.user) { setState(s => ({...s, deferredAction:{action:'publish_trip', data}})); go('login'); return; }
    if (!state.user.driver_status || state.user.driver_status === 'none') { go('driverVerify'); return; }
    toast('Поездка опубликована!', 'success');
    go('myBookings');
  };

  return (
    <div style={{maxWidth:720, margin:'0 auto', padding:'32px 24px'}}>
      <button className="btn btn-ghost btn-sm mb-4" onClick={()=>go('home')}><I.chevL s={14}/> Назад</button>
      <div className="t-h1 mb-2">Опубликовать поездку</div>
      <div className="t-caption mb-6">Шаг {step} из 3</div>

      <div className="progress mb-6" style={{height:4}}>
        <div className="progress-fill" style={{width:`${step/3*100}%`, background:'var(--teal-600)'}}></div>
      </div>

      {step===1 && <>
        <div className="t-h2 mb-3">Откуда и куда</div>
        <div className="cf-group mb-4">
          <div onClick={()=>setShowCityPicker('from')}><CardField icon={I.mapPin} iconBg="teal" label="ОТКУДА" value={data.from}/></div>
          <div className="cf-divider"></div>
          <div onClick={()=>setShowCityPicker('to')}><CardField icon={I.flag} iconBg="amber" label="КУДА" value={data.to} placeholder="Выберите город"/></div>
        </div>

        <div className="t-label mb-2">Дата отправления</div>
        <div className="row gap-2 mb-4" style={{flexWrap:'wrap'}}>
          {[['Сегодня', new Date()], ['Завтра', new Date(Date.now()+864e5)], ['Послезавтра', new Date(Date.now()+2*864e5)]].map(([l,d])=> (
            <button key={l} className={`chip ${data.departure_at && data.departure_at.toDateString()===d.toDateString() ? 'active':''}`} onClick={()=>setData({...data, departure_at: d})}>{l}</button>
          ))}
          <button className="chip"><I.calendar s={12}/> Другая дата</button>
        </div>

        <div className="t-label mb-2">Время отправления</div>
        <div className="row gap-2 mb-4" style={{flexWrap:'wrap'}}>
          {['06:00','08:00','09:00','10:00','12:00','15:00','17:00','20:00','22:00'].map(t => (
            <button key={t} className={`chip ${data.time===t?'active':''}`} onClick={()=>setData({...data, time:t})}>{t}</button>
          ))}
        </div>

        {showCityPicker && <CityPickerModal title={showCityPicker==='from'?'Откуда':'Куда'} exclude={showCityPicker==='from'?data.to:data.from} onPick={v => { setData({...data, [showCityPicker]: v}); setShowCityPicker(null); }} onClose={()=>setShowCityPicker(null)}/>}

        <button className="btn btn-submit btn-block" disabled={!canNext1} onClick={()=>setStep(2)}>Далее <I.arrowRight s={14}/></button>
      </>}

      {step===2 && <>
        <div className="t-h2 mb-3">Места и цена</div>

        <div className="card card-lg mb-3">
          <div className="row between mb-3">
            <div>
              <div style={{fontWeight:700, fontSize:15}}>Сколько мест свободно</div>
              <div className="t-caption mt-1">Не считая водителя</div>
            </div>
            <div className="row gap-3">
              <button className="btn-icon" onClick={()=>setData({...data, seats:Math.max(1, data.seats-1)})}><I.minus s={16}/></button>
              <div style={{fontSize:24, fontWeight:800, minWidth:30, textAlign:'center'}}>{data.seats}</div>
              <button className="btn-icon" onClick={()=>setData({...data, seats:Math.min(6, data.seats+1)})}><I.plus s={16}/></button>
            </div>
          </div>
          <div className="divider"></div>
          <div className="t-caption">Большинство водителей на Бишкек → Ош берут 4 места по {Math.round(K.suggestPrice(data.from, data.to)/100)*100} сом.</div>
        </div>

        <div className="card card-lg mb-3">
          <div className="t-label mb-2">Цена за место</div>
          <div className="row gap-2 mb-2" style={{alignItems:'center'}}>
            <input type="number" className="field-input" style={{fontSize:24, fontWeight:700, textAlign:'center'}} value={data.price} onChange={e=>setData({...data, price:Number(e.target.value)})}/>
            <span style={{fontSize:18, fontWeight:700, color:'var(--g-600)'}}>сом</span>
          </div>
          <div className="t-caption mb-3">💡 Рекомендуемая цена: {K.suggestPrice(data.from, data.to)} сом (на основе 24 поездок за неделю)</div>
          <label className="row gap-2" style={{cursor:'pointer'}}>
            <input type="checkbox" checked={data.negotiable} onChange={e=>setData({...data, negotiable:e.target.checked})}/>
            <span style={{fontSize:13, fontWeight:600}}>Цена обсуждается</span>
          </label>
        </div>

        <div className="card card-lg mb-4">
          <div className="t-label mb-2">Багаж пассажиров</div>
          <div className="row gap-2" style={{flexWrap:'wrap'}}>
            {[['no','Нет багажа'],['small','Небольшой'],['yes','Большой']].map(([v,l])=>(
              <button key={v} className={`chip ${data.luggage===v?'active':''}`} onClick={()=>setData({...data, luggage:v})}>{l}</button>
            ))}
          </div>
        </div>

        <div className="row gap-2">
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(1)}>Назад</button>
          <button className="btn btn-submit" style={{flex:2}} disabled={!canNext2} onClick={()=>setStep(3)}>Далее <I.arrowRight s={14}/></button>
        </div>
      </>}

      {step===3 && <>
        <div className="t-h2 mb-3">Детали и предпочтения</div>

        <div className="card card-lg mb-3">
          <div className="t-label mb-2">Автомобиль</div>
          <input className="field-input" placeholder="Например: Toyota Camry 2019, чёрная" value={data.car} onChange={e=>setData({...data, car:e.target.value})}/>
        </div>

        <div className="card card-lg mb-3">
          <div className="t-label mb-2">Предпочтения в поездке</div>
          <div className="col gap-2">
            {[['silence','Тишина','Пассажиры не болтают'],['music','Музыка','Можно попросить свой плейлист'],['no_smoking','Не курить в салоне','']].map(([v,l,d])=>{
              const on = data.prefs.includes(v);
              return <label key={v} className={`card ${on?'active':''}`} style={{cursor:'pointer', padding:12}} onClick={()=>setData({...data, prefs: on? data.prefs.filter(p=>p!==v):[...data.prefs,v]})}>
                <div className="row between">
                  <div>
                    <div style={{fontWeight:700, fontSize:14}}>{l}</div>
                    {d && <div className="t-caption mt-1">{d}</div>}
                  </div>
                  <Switch on={on}/>
                </div>
              </label>
            })}
          </div>
        </div>

        <div className="card card-lg mb-3">
          <div className="t-label mb-2">Комментарий (необязательно)</div>
          <textarea className="field-input" rows={3} placeholder="Например: Выезжаю от здания кыргызстана. Беру только некурящих. Могу подобрать по дороге из Воронцовки." value={data.comment} onChange={e=>setData({...data, comment:e.target.value})} maxLength={400}/>
          <div className="field-hint">{data.comment.length}/400 · номера телефонов автоматически скрываются</div>
        </div>

        <div className="card mb-4" style={{background:'var(--teal-50)', borderColor:'var(--teal-100)'}}>
          <div className="row gap-2 mb-2"><I.shield s={16} style={{color:'var(--teal-600)'}}/><span style={{fontWeight:700, fontSize:14}}>Готов опубликовать</span></div>
          <div className="t-caption">После публикации поездка появится в поиске. Вы получите уведомления о запросах в Telegram.</div>
        </div>

        <div className="row gap-2">
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(2)}>Назад</button>
          <button className="btn btn-submit" style={{flex:2}} onClick={publish}><I.checkCircle s={14}/> Опубликовать</button>
        </div>
      </>}
    </div>
  );
}

// ========== MY BOOKINGS / MY TRIPS ==========
function MyBookings({ go, state, setState }){
  const K = window.Kosho;
  const toast = useToast();
  // allow parent to request the "requests" tab directly
  const [tab, setTab] = useS2(state.myBookingsTab || 'as_passenger');
  const [, force] = useS2(0);
  const rerender = () => force(x => x+1);
  const user = state.user || K.getUser('u1');

  // Optional: open a specific trip's requests
  const [reqModalTrip, setReqModalTrip] = useS2(state.requestsTripId ? K.getTrip(state.requestsTripId) : null);
  useE2(() => {
    if (state.myBookingsTab) setTab(state.myBookingsTab);
    if (state.requestsTripId) setReqModalTrip(K.getTrip(state.requestsTripId));
    if (state.myBookingsTab || state.requestsTripId) setState(s => ({...s, myBookingsTab:null, requestsTripId:null}));
  }, []);

  const asPassenger = K.BOOKINGS.filter(b => b.passenger_id === user.id);
  const asDriver = K.TRIPS.filter(t => t.driver_id === user.id);
  // all pending bookings across my trips
  const incomingRequests = K.BOOKINGS.filter(b => {
    const t = K.getTrip(b.trip_id);
    return t && t.driver_id === user.id && b.status === 'pending';
  }).sort((a,b) => (a.expires_at || 0) - (b.expires_at || 0));

  const acceptBooking = (b) => {
    const t = K.getTrip(b.trip_id);
    if (!t) return;
    if (t.seats_available < b.seats) { toast('Недостаточно мест', 'error'); return; }
    b.status = 'confirmed';
    b.accepted_at = new Date();
    t.seats_available -= b.seats;
    // seed a chat thread if empty
    if (!K.MESSAGES[b.id]) {
      K.MESSAGES[b.id] = [{
        sender: user.id,
        text: `Запрос принят. Встречаемся ${K.fmtDateTime(t.departure_at)}. Напишите, если будут вопросы.`,
        time: new Date(), status:'sent'
      }];
    }
    // notify passenger
    K.NOTIFICATIONS.unshift({
      id:'n_'+Math.random().toString(36).slice(2,7),
      type:'booking_accepted', title:'Запрос принят',
      text:`${user.name} принял(а) вашу заявку: ${t.from} → ${t.to}.`,
      time:'только что', variant:'ok', read:false
    });
    toast(`Запрос принят. Чат с ${K.getUser(b.passenger_id).name} открыт.`, 'success');
    rerender();
  };

  const rejectBooking = (b, reason) => {
    b.status = 'rejected';
    b.rejected_at = new Date();
    b.reject_reason = reason || '';
    K.NOTIFICATIONS.unshift({
      id:'n_'+Math.random().toString(36).slice(2,7),
      type:'booking_rejected', title:'Запрос отклонён',
      text:`${user.name} отклонил(а) заявку: ${K.getTrip(b.trip_id).from} → ${K.getTrip(b.trip_id).to}.`,
      time:'только что', variant:'warn', read:false
    });
    toast('Запрос отклонён', 'info');
    rerender();
  };

  return (
    <>
    <div style={{maxWidth:900, margin:'0 auto', padding:'32px 24px'}}>
      <div className="row between mb-4">
        <div>
          <div className="t-h1">Мои поездки</div>
          <div className="t-caption mt-1">Запросы, активные поездки и история</div>
        </div>
        <button className="btn btn-submit" onClick={()=>go('publish')}><I.plus s={14}/> Опубликовать поездку</button>
      </div>

      <div className="tabs mb-4">
        <button className={`tab ${tab==='as_passenger'?'active':''}`} onClick={()=>setTab('as_passenger')}>Как пассажир ({asPassenger.length})</button>
        <button className={`tab ${tab==='as_driver'?'active':''}`} onClick={()=>setTab('as_driver')}>Как водитель ({asDriver.length})</button>
        <button className={`tab ${tab==='requests'?'active':''}`} onClick={()=>setTab('requests')}>
          Запросы {incomingRequests.length > 0 && <span className="tab-count">{incomingRequests.length}</span>}
        </button>
      </div>

      {tab==='as_passenger' && <div className="col gap-3">
        {asPassenger.map(b => {
          const trip = K.getTrip(b.trip_id); if (!trip) return null;
          const driver = K.getUser(trip.driver_id);
          const statusMap = {
            pending: { label:'Ждём ответа', cls:'badge-pending', icon: I.clock },
            confirmed: { label:'Подтверждена', cls:'badge-verified', icon: I.checkCircle },
            rejected: { label:'Отклонена', cls:'badge-rejected', icon: I.xCircle },
            completed: { label:'Завершена', cls:'badge-seats', icon: I.check },
            cancelled: { label:'Отменена', cls:'badge-rejected', icon: I.x },
          }[b.status];
          const SI = statusMap.icon;
          return (
            <div key={b.id} className="card card-interactive">
              <div className="row between mb-3">
                <div className="row gap-3">
                  <Avatar user={driver} size={44}/>
                  <div>
                    <div style={{fontWeight:800, fontSize:15}}>{trip.from} → {trip.to}</div>
                    <div className="t-caption mt-1">{driver.name} · {K.fmtDateTime(trip.departure_at)}</div>
                  </div>
                </div>
                <span className={`badge ${statusMap.cls}`}><SI s={12}/>{statusMap.label}</span>
              </div>
              <div className="divider"></div>
              <div className="row between">
                <div className="row gap-4">
                  <div><span className="t-caption">Мест</span><div style={{fontWeight:700, fontSize:14}}>{b.seats}</div></div>
                  <div><span className="t-caption">К оплате</span><div style={{fontWeight:700, fontSize:14}}>{b.seats * trip.price} сом</div></div>
                </div>
                <div className="row gap-2">
                  {b.status==='confirmed' && <button className="btn btn-outline btn-sm" onClick={()=>{ setState(s=>({...s, chatBookingId:b.id})); go('chat'); }}><I.msg s={12}/> Чат</button>}
                  {b.status==='completed' && !b.rating_given && <button className="btn btn-primary btn-sm" onClick={()=>{ setState(s=>({...s, ratingBookingId:b.id})); go('rating'); }}><I.star s={12}/> Оценить</button>}
                  {b.status==='pending' && <button className="btn btn-ghost btn-sm">Отменить</button>}
                  <button className="btn btn-ghost btn-sm"><I.moreV s={12}/></button>
                </div>
              </div>
            </div>
          );
        })}
        {asPassenger.length===0 && <div className="card card-lg text-center"><div className="t-h2 mb-2">Нет поездок</div><div className="t-caption">Найдите попутку и забронируйте место.</div></div>}
      </div>}

      {tab==='as_driver' && <div className="col gap-3">
        {asDriver.map(t => {
          const pending = K.BOOKINGS.filter(b => b.trip_id===t.id && b.status==='pending').length;
          const confirmed = K.BOOKINGS.filter(b => b.trip_id===t.id && b.status==='confirmed').length;
          return (
          <div key={t.id} className="card card-interactive">
            <div className="row between mb-3">
              <div>
                <div style={{fontWeight:800, fontSize:16}}>{t.from} → {t.to}</div>
                <div className="t-caption mt-1">{K.fmtDateTime(t.departure_at)} · {t.price} сом</div>
              </div>
              <span className={`badge ${t.status==='active'?'badge-verified':'badge-seats'}`}>{t.status==='active'?'Активна':'Завершена'}</span>
            </div>
            <div className="divider"></div>
            <div className="row between">
              <div className="row gap-4">
                <div><span className="t-caption">Мест</span><div style={{fontWeight:700, fontSize:14}}>{t.seats_available}/{t.seats_total}</div></div>
                <div><span className="t-caption">Запросов</span><div style={{fontWeight:700, fontSize:14, color: pending>0?'var(--amber-600)':'inherit'}}>{pending}</div></div>
                <div><span className="t-caption">Подтверждено</span><div style={{fontWeight:700, fontSize:14, color:'var(--teal-600)'}}>{confirmed}</div></div>
              </div>
              <div className="row gap-2">
                <button className={`btn btn-sm ${pending>0?'btn-primary':'btn-outline'}`} onClick={()=>setReqModalTrip(t)} disabled={pending===0 && confirmed===0}>
                  {pending>0 ? `Запросы · ${pending}` : confirmed>0 ? `Пассажиры · ${confirmed}` : 'Нет запросов'}
                </button>
                <button className="btn btn-ghost btn-sm">Ред.</button>
              </div>
            </div>
          </div>
          );
        })}
        {asDriver.length===0 && <div className="card card-lg text-center">
          <div className="t-h2 mb-2">У вас нет опубликованных поездок</div>
          <div className="t-caption mb-4">Опубликуйте свою первую поездку и начните зарабатывать</div>
          <button className="btn btn-submit" onClick={()=>go('publish')}><I.plus s={14}/> Опубликовать</button>
        </div>}
      </div>}

      {tab==='requests' && <div className="col gap-3">
        {incomingRequests.length===0 && <div className="card card-lg text-center">
          <div className="t-h2 mb-2">Нет новых запросов</div>
          <div className="t-caption">Когда пассажиры запросят место в ваших поездках, они появятся здесь.</div>
        </div>}
        {incomingRequests.map(b => {
          const t = K.getTrip(b.trip_id); const p = K.getUser(b.passenger_id);
          const mins = b.expires_at ? Math.max(0, Math.round((b.expires_at - new Date())/60000)) : null;
          return (
            <RequestCard key={b.id} booking={b} trip={t} passenger={p} minsLeft={mins}
              onAccept={()=>acceptBooking(b)}
              onReject={(r)=>rejectBooking(b, r)}
              onOpenChat={()=>{ setState(s=>({...s, chatBookingId:b.id})); go('chat'); }}
            />
          );
        })}
      </div>}
    </div>

    {reqModalTrip && <RequestsModal trip={reqModalTrip} onClose={()=>setReqModalTrip(null)}
      onAccept={acceptBooking} onReject={rejectBooking}
      onOpenChat={(b)=>{ setState(s=>({...s, chatBookingId:b.id})); go('chat'); }}/>}
    </>
  );
}

// A single request card — shared by the Requests tab and the per-trip modal
function RequestCard({ booking, trip, passenger, minsLeft, onAccept, onReject, onOpenChat }){
  const K = window.Kosho;
  const [showReject, setShowReject] = useS2(false);
  const [reason, setReason] = useS2('');
  const [reply, setReply] = useS2('');
  const [, force] = useS2(0);
  const rerender = () => force(x => x+1);

  const isPending = booking.status === 'pending';
  const msgs = K.MESSAGES[booking.id] || [];
  const preMsgs = msgs.filter(m => m.is_pre_booking);
  const remaining = Math.max(0, K.PRE_BOOKING_LIMIT - preMsgs.length);

  // Mark viewed by driver on first render (simulates WhatsApp "просматривает")
  useE2(() => {
    if (isPending && !booking.viewed_by_driver) {
      booking.viewed_by_driver = new Date();
      // if passenger has any msg unread, mark them read
      if (K.MESSAGES[booking.id]) {
        K.MESSAGES[booking.id] = K.MESSAGES[booking.id].map(m => ({...m, read: true}));
      }
    }
  }, [booking.id]);

  const sendReply = () => {
    const txt = reply.trim(); if (!txt) return;
    if (remaining <= 0) return;
    const filtered = K.filterContactInfo(txt);
    const newMsg = { sender: K.getUser('u1').id, text: filtered, time: new Date(), status: filtered!==txt?'filtered':'sent', read: false, is_pre_booking: true };
    // Use driver id = trip.driver_id
    newMsg.sender = trip.driver_id;
    K.MESSAGES[booking.id] = [...(K.MESSAGES[booking.id]||[]), newMsg];
    booking.pre_booking_msg_count = (booking.pre_booking_msg_count||0) + 1;
    setReply('');
    rerender();
  };
  return (
    <div className="card">
      <div className="row between mb-3">
        <div className="row gap-3">
          <Avatar user={passenger} size={44}/>
          <div>
            <div className="row gap-2" style={{alignItems:'center'}}>
              <span style={{fontWeight:800, fontSize:15}}>{passenger.name}</span>
              {passenger.verified && <span className="badge badge-verified"><I.checkCircle s={10}/>Верифицирован</span>}
            </div>
            <div className="t-caption mt-1">
              <I.star s={11} style={{color:'var(--amber-500)', verticalAlign:'-2px'}}/> {passenger.rating || '—'}
              {passenger.rating_count>0 && ` · ${passenger.rating_count} отзывов`}
              {passenger.trips>0 && ` · ${passenger.trips} поездок`}
            </div>
          </div>
        </div>
        {isPending && minsLeft !== null && (
          <span className={`badge ${minsLeft < 15 ? 'badge-rejected' : 'badge-pending'}`}>
            <I.clock s={12}/> {minsLeft>0 ? `${minsLeft} мин на ответ` : 'Время истекло'}
          </span>
        )}
        {!isPending && booking.status==='confirmed' && <span className="badge badge-verified"><I.checkCircle s={12}/>Подтверждён</span>}
        {!isPending && booking.status==='rejected' && <span className="badge badge-rejected"><I.xCircle s={12}/>Отклонён</span>}
      </div>

      <div className="row gap-4 mb-3" style={{flexWrap:'wrap'}}>
        <div><span className="t-caption">Маршрут</span><div style={{fontWeight:700, fontSize:14}}>{trip.from} → {trip.to}</div></div>
        <div><span className="t-caption">Выезд</span><div style={{fontWeight:700, fontSize:14}}>{K.fmtDateTime(trip.departure_at)}</div></div>
        <div><span className="t-caption">Мест запрошено</span><div style={{fontWeight:700, fontSize:14}}>{booking.seats}</div></div>
        <div><span className="t-caption">К получению</span><div style={{fontWeight:700, fontSize:14, color:'var(--teal-700)'}}>{booking.seats * trip.price} сом</div></div>
      </div>

      {booking.comment && (
        <div style={{background:'var(--g-50)', border:'.5px solid var(--g-100)', borderRadius:10, padding:'10px 12px', fontSize:13, marginBottom:12}}>
          <div className="t-caption mb-1">Комментарий пассажира</div>
          «{booking.comment}»
        </div>
      )}

      {/* Inline pre-booking Q&A */}
      {isPending && (
        <div className="prebook-thread">
          <div className="row between mb-2">
            <div className="row gap-2" style={{alignItems:'center'}}>
              <I.msg s={13} style={{color:'var(--teal-700)'}}/>
              <span style={{fontSize:12, fontWeight:800, color:'var(--teal-700)'}}>Вопросы до бронирования</span>
            </div>
            <span className={`prebook-count ${remaining<=3?'warn':''}`}>{preMsgs.length}/{K.PRE_BOOKING_LIMIT}</span>
          </div>
          {preMsgs.length === 0 ? (
            <div className="prebook-empty">Пассажир пока ничего не спросил.</div>
          ) : (
            <div className="prebook-msgs">
              {preMsgs.slice(-4).map((m, i) => {
                const mine = m.sender === trip.driver_id;
                return (
                  <div key={i} className={`prebook-msg ${mine?'mine':''}`}>
                    <div className="prebook-msg-bubble">
                      {m.text}
                      {m.status==='filtered' && <div className="prebook-filtered"><I.shield s={10}/> Контакты скрыты автоматически</div>}
                    </div>
                    <div className="prebook-msg-meta">
                      {mine ? 'Вы' : passenger.name.split(' ')[0]} · {K.fmtTime(new Date(m.time))}
                      {mine && (m.read ? <span className="prebook-tick read">✓✓</span> : <span className="prebook-tick">✓</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {remaining > 0 ? (
            <div className="prebook-input">
              <input
                type="text"
                placeholder={preMsgs.length===0 ? 'Ответьте пассажиру…' : 'Быстрый ответ…'}
                value={reply}
                onChange={e=>setReply(e.target.value)}
                onKeyDown={e=>{ if (e.key==='Enter') sendReply(); }}
                maxLength={200}
              />
              <button className="btn btn-submit btn-sm" onClick={sendReply} disabled={!reply.trim()}>
                <I.send s={12}/>
              </button>
            </div>
          ) : (
            <div className="prebook-limit">
              <I.lock s={11}/> Лимит сообщений до бронирования исчерпан. Примите или отклоните запрос, чтобы продолжить чат.
            </div>
          )}
        </div>
      )}

      {showReject ? (
        <div className="col gap-2">
          <div style={{fontSize:13, fontWeight:700}}>Причина отказа (необязательно)</div>
          <div className="row gap-2" style={{flexWrap:'wrap'}}>
            {['Мест уже нет','Не по пути','Изменил планы','Другое'].map(r => (
              <button key={r} className={`chip ${reason===r?'active':''}`} onClick={()=>setReason(r)}>{r}</button>
            ))}
          </div>
          <div className="row gap-2 mt-2">
            <button className="btn btn-ghost btn-sm" onClick={()=>{ setShowReject(false); setReason(''); }}>Отмена</button>
            <button className="btn btn-submit btn-sm" style={{background:'#dc2626'}} onClick={()=>{ onReject(reason); setShowReject(false); }}>Подтвердить отказ</button>
          </div>
        </div>
      ) : (
        <div className="row gap-2">
          {isPending && <>
            <button className="btn btn-submit btn-sm" onClick={onAccept}><I.check s={12}/> Принять</button>
            <button className="btn btn-outline btn-sm" onClick={()=>setShowReject(true)}><I.x s={12}/> Отклонить</button>
          </>}
          {booking.status==='confirmed' && onOpenChat && (
            <button className="btn btn-outline btn-sm" onClick={onOpenChat}><I.msg s={12}/> Открыть чат</button>
          )}
          <button className="btn btn-ghost btn-sm"><I.phone s={12}/> Позвонить</button>
          <div style={{flex:1}}></div>
          <button className="btn btn-ghost btn-sm"><I.flag s={12}/> Пожаловаться</button>
        </div>
      )}
    </div>
  );
}

// Modal listing all requests for a single trip
function RequestsModal({ trip, onClose, onAccept, onReject, onOpenChat }){
  const K = window.Kosho;
  const bookings = K.BOOKINGS.filter(b => b.trip_id === trip.id && b.status !== 'cancelled');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e=>e.stopPropagation()} style={{padding:24}}>
        <div className="row between mb-4">
          <div>
            <div className="t-h2">Запросы и пассажиры</div>
            <div className="t-caption mt-1">{trip.from} → {trip.to} · {K.fmtDateTime(trip.departure_at)}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><I.x s={14}/></button>
        </div>
        <div className="col gap-3" style={{maxHeight:'70vh', overflowY:'auto'}}>
          {bookings.length===0 && <div className="t-caption text-center" style={{padding:'24px 0'}}>Пока нет запросов.</div>}
          {bookings.map(b => {
            const p = K.getUser(b.passenger_id);
            const mins = b.expires_at ? Math.max(0, Math.round((b.expires_at - new Date())/60000)) : null;
            return (
              <RequestCard key={b.id} booking={b} trip={trip} passenger={p} minsLeft={mins}
                onAccept={()=>onAccept(b)}
                onReject={(r)=>onReject(b, r)}
                onOpenChat={()=>onOpenChat(b)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== CHAT ==========
function Chat({ go, state, setState }){
  const K = window.Kosho;
  const user = state.user || K.getUser('u1');
  // Include pending bookings so pre-booking chats work
  const activeId = state.chatBookingId
    || K.BOOKINGS.find(b=>(b.passenger_id===user.id || K.getTrip(b.trip_id)?.driver_id===user.id) && (b.status==='confirmed'||b.status==='pending'))?.id
    || 'b3';
  const [text, setText] = useS2('');
  const [msgs, setMsgs] = useS2(K.MESSAGES[activeId] || []);
  const bodyRef = useR2(null);

  useE2(() => { setMsgs(K.MESSAGES[activeId] || []); }, [activeId]);
  useE2(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [msgs]);

  const booking = K.BOOKINGS.find(b => b.id === activeId);
  const trip = K.getTrip(booking?.trip_id);
  const other = K.getUser(trip?.driver_id === user.id ? booking?.passenger_id : trip?.driver_id);
  const isPreBooking = booking?.status === 'pending';
  const preMsgs = msgs.filter(m => m.is_pre_booking);
  const remaining = Math.max(0, K.PRE_BOOKING_LIMIT - preMsgs.length);
  const limitReached = isPreBooking && remaining <= 0;
  // If driver viewed in the last 90s, show "просматривает"
  const driverViewing = isPreBooking && booking?.viewed_by_driver &&
    ((new Date() - new Date(booking.viewed_by_driver))/1000 < 90) &&
    user.id === booking.passenger_id;

  const send = () => {
    if (!text.trim() || limitReached) return;
    const filtered = K.filterContactInfo(text);
    const newMsg = { sender: user.id, text: filtered, time: new Date(), status: filtered !== text ? 'filtered' : 'sent', read: false, is_pre_booking: isPreBooking };
    const next = [...msgs, newMsg];
    setMsgs(next);
    K.MESSAGES[activeId] = next;
    if (isPreBooking && booking) booking.pre_booking_msg_count = (booking.pre_booking_msg_count||0) + 1;
    setText('');
    if (Math.random() > 0.5 && (!isPreBooking || remaining > 1)) {
      setTimeout(() => {
        const reply = { sender: other.id, text: 'Хорошо, договорились 👍', time: new Date(), read: true, is_pre_booking: isPreBooking };
        const next2 = [...next, reply];
        setMsgs(next2); K.MESSAGES[activeId] = next2;
      }, 1800);
    }
  };

  // Show all chats incl. pending pre-booking ones
  const allChats = K.BOOKINGS.filter(b => (b.passenger_id===user.id || K.getTrip(b.trip_id)?.driver_id===user.id) && (b.status==='confirmed' || b.status==='pending'));

  // Mobile view state: show list or detail
  const [mobileView, setMobileView] = useS2(state.chatBookingId ? 'detail' : 'list');
  useE2(() => { if (state.chatBookingId) setMobileView('detail'); }, [state.chatBookingId]);

  return (
    <div className={`split chat-container`} style={{gridTemplateColumns:'320px 1fr'}} data-view={mobileView}>
      <div className="pane chat-sidebar" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'20px 20px 12px'}}>
          <div className="t-h2">Чаты</div>
          <div className="t-caption mt-1">{allChats.length} активных</div>
        </div>
        <div className="divider" style={{margin:0}}></div>
        <div className="col" style={{gap:0, overflowY:'auto'}}>
          {allChats.map(b => {
            const tr = K.getTrip(b.trip_id);
            const prt = K.getUser(tr?.driver_id === user.id ? b.passenger_id : tr?.driver_id);
            const active = b.id === activeId;
            const lastMsg = (K.MESSAGES[b.id]||[]).slice(-1)[0];
            return (
              <button key={b.id} className={`chat-row ${active?'active':''}`} onClick={()=>{ setState(s=>({...s, chatBookingId:b.id})); setMobileView('detail'); }}>
                <Avatar user={prt} size={44}/>
                <div className="col flex-1" style={{alignItems:'flex-start', minWidth:0}}>
                  <div className="row between w-full">
                    <span style={{fontWeight:700, fontSize:14}}>{prt.name}</span>
                    {lastMsg && <span className="t-caption" style={{fontSize:11}}>{K.fmtTime(lastMsg.time)}</span>}
                  </div>
                  <span className="t-caption" style={{fontSize:12, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width:'100%', textAlign:'left'}}>{tr?.from} → {tr?.to}</span>
                  {lastMsg && <span className="chat-preview">{lastMsg.text.slice(0,42)}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="col chat-main" style={{height:'calc(100vh - 64px)', background:'white'}}>
        {/* Chat header */}
        <div className="row between" style={{padding:'14px 20px', borderBottom:'1px solid var(--g-200)'}}>
          <div className="row gap-3">
            <button className="btn-icon chat-back mobile-only" onClick={()=>setMobileView('list')} style={{background:'transparent'}}><I.chevL s={18}/></button>
            <Avatar user={other} size={40}/>
            <div>
              <div style={{fontWeight:800, fontSize:15}}>{other?.name}</div>
              <div className="t-caption mt-0">{trip?.from} → {trip?.to} · {K.fmtDateTime(trip?.departure_at)}</div>
            </div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-outline btn-sm"><I.phone s={12}/> {other?.phone}</button>
            <button className="btn btn-ghost btn-sm"><I.moreV s={14}/></button>
          </div>
        </div>

        {/* Pre-booking banner */}
        {isPreBooking && (
          <div className="prebook-banner" style={{margin:'12px 20px 0'}}>
            <div>
              <div className="prebook-banner-title">
                <I.lock s={12}/> Чат до бронирования
              </div>
              <div className="prebook-banner-sub">
                {remaining > 0
                  ? `Осталось ${remaining} сообщ. из ${K.PRE_BOOKING_LIMIT}. После принятия запроса лимит снимется.`
                  : 'Лимит сообщений до бронирования исчерпан. Дождитесь ответа водителя.'}
              </div>
            </div>
            {driverViewing && (
              <span className="viewed-indicator">
                <span className="eye">👁</span> Водитель просматривает…
              </span>
            )}
          </div>
        )}

        {/* Trip summary */}
        <div style={{padding:'10px 20px', background:'var(--teal-50)', borderBottom:'1px solid var(--teal-100)', fontSize:12}}>
          <div className="row between">
            <span><I.car s={12}/> {trip?.car}</span>
            <span style={{fontWeight:700, color:'var(--teal-700)'}}>
              {isPreBooking ? `Запрошено ${booking?.seats} место · ждём ответа` : `Забронировано ${booking?.seats} место · ${booking?.seats * (trip?.price||0)} сом`}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div ref={bodyRef} className="chat-body" style={{flex:1, padding:'20px 20px', overflowY:'auto', background:'var(--g-50)'}}>
          <div className="text-center mb-4"><span className="chat-day">{K.fmtDate(new Date())}</span></div>
          {msgs.map((m, i) => {
            const isMe = m.sender === user.id;
            const isLastMine = isMe && i === msgs.length - 1;
            return (
              <div key={i} className={`msg-row ${isMe?'me':''}`}>
                <div className={`msg-bubble ${isMe?'me':''}`}>
                  {m.text}
                  {m.status==='filtered' && <div className="msg-filter-note">⚠ Номер скрыт Kosho</div>}
                  <div className="msg-time">
                    {K.fmtTime(m.time)}
                    {isMe && (m.read ? ' ✓✓' : ' ✓')}
                  </div>
                </div>
              </div>
            );
          })}
          {isPreBooking && driverViewing && msgs.length > 0 && msgs[msgs.length-1].sender === user.id && (
            <div className="msg-row me">
              <div style={{fontSize:11, color:'var(--teal-700)', fontWeight:700, padding:'4px 10px'}}>
                <span className="eye" style={{display:'inline-block'}}>👁</span> Просматривает
              </div>
            </div>
          )}
          {msgs.length===0 && <div className="text-center t-caption mt-4">Начните диалог</div>}
        </div>

        {/* Composer */}
        <div className="row gap-2" style={{padding:'14px 20px', borderTop:'1px solid var(--g-200)', background:'white'}}>
          <input className="field-input flex-1" placeholder={limitReached ? 'Лимит сообщений исчерпан' : 'Напишите сообщение...'} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter') send(); }} disabled={limitReached}/>
          <button className="btn btn-submit" onClick={send} disabled={limitReached || !text.trim()}><I.send s={14}/></button>
        </div>
        <div style={{padding:'6px 20px 10px', background:'white', fontSize:11, color:'var(--g-500)', textAlign:'center'}}>
          🔒 Kosho автоматически скрывает номера телефонов и прямые контакты
          {isPreBooking && ` · ${preMsgs.length}/${K.PRE_BOOKING_LIMIT} сообщ. в режиме pre-booking`}
        </div>
      </div>
    </div>
  );
}

// ========== PROFILE ==========
function Profile({ go, state, setState }){
  const K = window.Kosho;
  const user = state.user || K.getUser('u1');
  const [tab, setTab] = useS2('about');

  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:'32px 24px'}}>
      <div className="card card-lg mb-4">
        <div className="row gap-4">
          <Avatar user={user} size={96}/>
          <div className="col flex-1">
            <div className="row gap-2" style={{alignItems:'center'}}>
              <span style={{fontSize:24, fontWeight:800}}>{user.name}</span>
              {user.verified && <span className="badge badge-verified"><I.shield s={10}/> Верифицирован</span>}
            </div>
            <div className="row gap-4 mt-2">
              <div className="row gap-1"><Stars value={user.rating}/><span style={{fontWeight:700}}>{user.rating.toFixed(1)}</span><span className="muted">({user.rating_count})</span></div>
              <span className="muted">· {user.trips} поездок</span>
              <span className="muted">· на Kosho с {user.joined_at}</span>
            </div>
            <div className="row gap-2 mt-3">
              <span className="chip"><I.phone s={12}/>Телефон подтверждён</span>
              {user.driver_status==='approved' && <span className="chip"><I.car s={12}/>Водитель</span>}
              <span className="chip"><I.telegram s={12}/>Telegram</span>
            </div>
          </div>
          <div className="col">
            <button className="btn btn-outline btn-sm"><I.settings s={12}/> Настройки</button>
          </div>
        </div>
      </div>

      <div className="tabs mb-4">
        <button className={`tab ${tab==='about'?'active':''}`} onClick={()=>setTab('about')}>О себе</button>
        <button className={`tab ${tab==='reviews'?'active':''}`} onClick={()=>setTab('reviews')}>Отзывы ({user.rating_count})</button>
        <button className={`tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>История</button>
      </div>

      {tab==='about' && <div className="col gap-3">
        <div className="card card-lg">
          <div className="t-h2 mb-3">Статистика</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
            <div><div style={{fontSize:24, fontWeight:800, color:'var(--teal-700)'}}>{user.trips}</div><div className="t-caption">Поездок</div></div>
            <div><div style={{fontSize:24, fontWeight:800, color:'var(--teal-700)'}}>{user.rating.toFixed(1)}</div><div className="t-caption">Рейтинг</div></div>
            <div><div style={{fontSize:24, fontWeight:800, color:'var(--teal-700)'}}>98%</div><div className="t-caption">Принятых</div></div>
            <div><div style={{fontSize:24, fontWeight:800, color:'var(--teal-700)'}}>0</div><div className="t-caption">Жалоб</div></div>
          </div>
        </div>
        <div className="card card-lg">
          <div className="t-h2 mb-3">О себе</div>
          <div style={{fontSize:14, lineHeight:1.6, color:'var(--g-700)'}}>{user.bio || 'Езжу между Бишкеком и Ошем по выходным. Не курю, аккуратно вожу, можно попросить музыку.'}</div>
        </div>
        {user.driver_status==='approved' && <div className="card card-lg">
          <div className="t-h2 mb-3">Автомобиль</div>
          <div className="row gap-3">
            <div style={{width:80, height:60, borderRadius:12, background:'var(--g-100)', display:'flex', alignItems:'center', justifyContent:'center'}}><I.car s={32} style={{color:'var(--g-500)'}}/></div>
            <div>
              <div style={{fontWeight:700, fontSize:15}}>{user.car || 'Toyota Camry 2019'}</div>
              <div className="t-caption mt-1">4 места · Кондиционер · Большой багажник</div>
            </div>
          </div>
        </div>}
      </div>}

      {tab==='reviews' && <ReviewsList user={user}/>}
      {tab==='history' && <div className="card card-lg text-center"><div className="t-caption">История поездок видна только вам. 24 поездки завершены.</div></div>}
    </div>
  );
}

function ReviewsList({ user }){
  const reviews = [
    { author:'Нурлан', avatar:'Н', color:'bg-teal', rating:5, date:'5 апр', text:'Отличный водитель, приехал вовремя, аккуратно вёл машину. Рекомендую!' },
    { author:'Айжан', avatar:'А', color:'bg-amber', rating:5, date:'2 апр', text:'Всё прошло хорошо. Взял на 20 минут раньше, помог с багажом.' },
    { author:'Бекзат', avatar:'Б', color:'bg-purple', rating:4, date:'28 мар', text:'Водитель хороший, но немного опоздал. Машина чистая, поездка спокойная.' },
    { author:'Динара', avatar:'Д', color:'bg-pink', rating:5, date:'22 мар', text:'Лучший водитель в Kosho! Всегда еду только с Асланом.' },
  ];
  return (
    <div className="col gap-3">
      {reviews.map((r,i) => (
        <div key={i} className="card card-lg">
          <div className="row gap-3">
            <Avatar user={r} size={40}/>
            <div className="col flex-1">
              <div className="row between">
                <div>
                  <div style={{fontWeight:700, fontSize:14}}>{r.author}</div>
                  <div className="row gap-1 mt-1"><Stars value={r.rating} size={12}/><span className="t-caption">· {r.date}</span></div>
                </div>
              </div>
              <div style={{fontSize:14, lineHeight:1.5, color:'var(--g-700)', marginTop:8}}>{r.text}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== DRIVER VERIFICATION ==========
function DriverVerify({ go, state, setState }){
  const K = window.Kosho;
  const [step, setStep] = useS2(1);
  const [docs, setDocs] = useS2({ license:false, techpass:false, selfie:false });
  const [submitted, setSubmitted] = useS2(false);
  const statuses = { 1:'Загрузите документы', 2:'Проверка ожидается', 3:'Одобрено' };

  return (
    <div style={{maxWidth:720, margin:'0 auto', padding:'32px 24px'}}>
      <button className="btn btn-ghost btn-sm mb-4" onClick={()=>go('home')}><I.chevL s={14}/> Назад</button>

      <div className="t-h1 mb-2">Стать водителем</div>
      <div className="t-caption mb-6">Верификация занимает 24 часа. Все данные хранятся безопасно.</div>

      {!submitted && <>
        <div className="card card-lg mb-4">
          <div className="t-h2 mb-3">Что понадобится</div>
          <div className="col gap-3">
            {[
              { label:'Водительское удостоверение', desc:'Фото с двух сторон', key:'license', icon: I.briefcase },
              { label:'Техпаспорт автомобиля', desc:'Страница с данными', key:'techpass', icon: I.car },
              { label:'Селфи с документом', desc:'Для подтверждения личности', key:'selfie', icon: I.camera },
            ].map(d => {
              const Ic = d.icon;
              return (
                <div key={d.key} className="row between" style={{padding:12, border:'1px solid var(--g-200)', borderRadius:12}}>
                  <div className="row gap-3">
                    <div style={{width:40, height:40, borderRadius:10, background:'var(--teal-50)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--teal-700)'}}><Ic s={18}/></div>
                    <div>
                      <div style={{fontWeight:700, fontSize:14}}>{d.label}</div>
                      <div className="t-caption mt-1">{d.desc}</div>
                    </div>
                  </div>
                  {docs[d.key] ? (
                    <span className="badge badge-verified"><I.check s={12}/> Загружено</span>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={()=>setDocs({...docs, [d.key]:true})}><I.upload s={12}/> Загрузить</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-lg mb-4">
          <div className="t-h2 mb-3">Об автомобиле</div>
          <div className="col gap-3">
            <input className="field-input" placeholder="Марка и модель (например: Toyota Camry)"/>
            <div className="row gap-2">
              <input className="field-input" placeholder="Год выпуска" style={{flex:1}}/>
              <input className="field-input" placeholder="Цвет" style={{flex:1}}/>
            </div>
            <input className="field-input" placeholder="Гос.номер"/>
          </div>
        </div>

        <div className="card mb-4" style={{background:'var(--g-50)'}}>
          <div className="row gap-2 mb-2"><I.lock s={14} style={{color:'var(--g-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Документы видны только модераторам</span></div>
          <div className="t-caption">Они используются для подтверждения личности. Другие пользователи видят только имя, фото и модель авто.</div>
        </div>

        <button className="btn btn-submit btn-block" disabled={!docs.license || !docs.techpass || !docs.selfie} onClick={()=>setSubmitted(true)}>
          <I.send s={14}/> Отправить на модерацию
        </button>
      </>}

      {submitted && <div className="card card-lg text-center">
        <div style={{margin:'24px auto', width:80, height:80, borderRadius:'50%', background:'var(--amber-50)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <I.clock s={36} style={{color:'var(--amber-500)'}}/>
        </div>
        <div className="t-h1">Заявка отправлена</div>
        <div className="t-caption mt-2 mb-4">Вы получите ответ в течение 24 часов. Уведомление придёт в Telegram.</div>

        <div className="col gap-2" style={{textAlign:'left', maxWidth:400, margin:'0 auto'}}>
          {['Документы получены', 'Проверка модератором', 'Активация аккаунта водителя'].map((s,i) => (
            <div key={s} className="row gap-3" style={{padding:10, borderRadius:10, background: i===0?'var(--teal-50)':'transparent'}}>
              <div style={{width:24, height:24, borderRadius:'50%', background: i===0?'var(--teal-600)':'var(--g-200)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12}}>
                {i===0 ? <I.check s={12}/> : i+1}
              </div>
              <span style={{fontSize:14, fontWeight: i===0?700:500}}>{s}</span>
              {i===0 && <span style={{marginLeft:'auto'}} className="t-caption">сейчас</span>}
            </div>
          ))}
        </div>

        <button className="btn btn-primary mt-6" onClick={()=>go('home')}>На главную</button>
      </div>}
    </div>
  );
}

window.Publish = Publish;
window.MyBookings = MyBookings;
window.Chat = Chat;
window.Profile = Profile;
window.DriverVerify = DriverVerify;
