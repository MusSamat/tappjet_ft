// Kosho screens 3: login, rating modal, notifications, admin panel, driver requests

const { useState: useS3, useEffect: useE3, useMemo: useM3 } = React;

// ========== LOGIN / REGISTRATION ==========
function Login({ go, state, setState }){
  const K = window.Kosho;
  const [step, setStep] = useS3(1);
  const [phone, setPhone] = useS3('');
  const [otp, setOtp] = useS3('');
  const [method, setMethod] = useS3(null); // 'phone' | 'telegram'
  const toast = useToast();

  const submit = () => {
    const u = K.USERS[0];
    setState(s => {
      const next = {...s, user: u};
      // Handle deferred action
      if (s.deferredAction?.action === 'book_trip') {
        setTimeout(() => go('booking'), 100);
      } else if (s.deferredAction?.action === 'publish_trip') {
        setTimeout(() => go('publish'), 100);
      } else {
        setTimeout(() => go('home'), 100);
      }
      return next;
    });
    toast(`С возвращением, ${u.name}!`, 'success');
  };

  return (
    <div style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'linear-gradient(180deg, var(--g-50), white)'}}>
      <div className="card card-lg" style={{maxWidth:440, width:'100%'}}>
        <div className="text-center mb-4">
          <div style={{width:56, height:56, margin:'0 auto 12px', borderRadius:16, background:'linear-gradient(135deg, var(--teal-600), var(--teal-500))', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <span style={{fontFamily:'var(--font-heading)', fontWeight:900, fontSize:22, color:'white'}}>Kr</span>
          </div>
          <div className="t-h1">Вход в Kosho</div>
          <div className="t-caption mt-2">Межгород попутки Кыргызстана</div>
        </div>

        {step===1 && <>
          {state.deferredAction && <div className="card mb-3" style={{background:'var(--amber-50)', borderColor:'var(--amber-100)'}}>
            <div className="row gap-2"><I.alert s={14} style={{color:'var(--amber-600)'}}/><span style={{fontWeight:700, fontSize:13}}>Войдите, чтобы продолжить</span></div>
            <div className="t-caption mt-1">Ваш выбор сохранён — после входа мы вернём вас к бронированию.</div>
          </div>}

          <button className="btn btn-outline btn-block mb-2" onClick={()=>{ setMethod('telegram'); setStep(3); }}>
            <I.telegram s={16} style={{color:'#2AABEE'}}/>
            <span>Войти через Telegram</span>
          </button>
          <button className="btn btn-outline btn-block mb-2"><I.google s={16}/> <span>Войти через Google</span></button>
          <button className="btn btn-outline btn-block mb-4"><I.apple s={16}/> <span>Войти через Apple</span></button>

          <div className="row gap-2 mb-4" style={{alignItems:'center'}}>
            <div style={{flex:1, height:1, background:'var(--g-200)'}}></div>
            <span className="t-caption">или по телефону</span>
            <div style={{flex:1, height:1, background:'var(--g-200)'}}></div>
          </div>

          <div className="field mb-3">
            <div className="field-label">Номер телефона</div>
            <div className="row gap-2">
              <div className="field-input" style={{width:90, textAlign:'center', fontWeight:700}}>🇰🇬 +996</div>
              <input className="field-input flex-1" placeholder="700 123 456" value={phone} onChange={e=>setPhone(e.target.value)}/>
            </div>
          </div>

          <button className="btn btn-submit btn-block" disabled={phone.length<6} onClick={()=>{ setMethod('phone'); setStep(2); }}>Получить код</button>

          <div className="t-caption mt-4 text-center" style={{fontSize:12}}>
            Нажимая, вы соглашаетесь с <a href="#" style={{color:'var(--teal-600)', textDecoration:'underline'}}>Условиями</a> и <a href="#" style={{color:'var(--teal-600)', textDecoration:'underline'}}>Политикой конфиденциальности</a>
          </div>
        </>}

        {step===2 && <>
          <div className="text-center mb-4">
            <div style={{fontSize:15}}>Код отправлен на</div>
            <div style={{fontWeight:700, fontSize:16, marginTop:4}}>+996 {phone}</div>
          </div>

          <div className="field mb-3">
            <div className="field-label">Код подтверждения</div>
            <input className="field-input" autoFocus placeholder="• • • •" style={{fontSize:28, textAlign:'center', letterSpacing:'0.4em', fontWeight:700}} maxLength={4} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/>
            <div className="field-hint">Подсказка: введите любые 4 цифры</div>
          </div>

          <button className="btn btn-submit btn-block" disabled={otp.length<4} onClick={submit}>Войти</button>
          <button className="btn btn-ghost btn-block mt-2" onClick={()=>setStep(1)}>← Изменить номер</button>

          <div className="t-caption mt-4 text-center">
            Не пришёл код? <a href="#" style={{color:'var(--teal-600)'}}>Отправить снова (через 42с)</a>
          </div>
        </>}

        {step===3 && <div className="text-center">
          <div style={{width:64, height:64, margin:'16px auto', borderRadius:'50%', background:'#e8f4fc', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <I.telegram s={32} style={{color:'#2AABEE'}}/>
          </div>
          <div className="t-h2">Подтвердите в Telegram</div>
          <div className="t-caption mt-2 mb-4">Откройте Telegram и нажмите «Запустить» в боте @kosho_bot</div>
          <div className="progress mb-4" style={{height:4}}><div className="progress-fill" style={{width:'60%', background:'#2AABEE'}}></div></div>
          <button className="btn btn-submit btn-block" onClick={submit}>Демо: войти сейчас</button>
          <button className="btn btn-ghost btn-block mt-2" onClick={()=>setStep(1)}>← Назад</button>
        </div>}
      </div>
    </div>
  );
}

// ========== RATING MODAL ==========
function Rating({ go, state, setState }){
  const K = window.Kosho;
  const booking = K.BOOKINGS.find(b => b.id === state.ratingBookingId) || K.BOOKINGS[2];
  const trip = K.getTrip(booking?.trip_id);
  const driver = K.getUser(trip?.driver_id);
  const [rating, setRating] = useS3(0);
  const [tags, setTags] = useS3([]);
  const [text, setText] = useS3('');
  const [submitted, setSubmitted] = useS3(false);
  const toast = useToast();

  const posTags = ['Пунктуальный', 'Аккуратно водит', 'Приятный в общении', 'Чистая машина', 'Помог с багажом', 'Безопасно'];
  const negTags = ['Опоздал', 'Курил', 'Резко водил', 'Грязная машина', 'Неприятный в общении', 'Сменил маршрут'];
  const tagsToShow = rating >= 4 ? posTags : rating > 0 ? negTags : [];

  const submit = () => {
    setSubmitted(true);
    toast('Спасибо за отзыв!', 'success');
    setTimeout(() => go('myBookings'), 1800);
  };

  return (
    <div style={{maxWidth:520, margin:'0 auto', padding:'32px 24px'}}>
      <button className="btn btn-ghost btn-sm mb-4" onClick={()=>go('myBookings')}><I.chevL s={14}/> Назад</button>

      {!submitted && <div className="card card-lg">
        <div className="text-center mb-4">
          <Avatar user={driver} size={80}/>
          <div className="t-h1 mt-3">Как прошла поездка с {driver?.name}?</div>
          <div className="t-caption mt-2">{trip?.from} → {trip?.to} · {K.fmtDate(trip?.departure_at)}</div>
        </div>

        <div className="text-center mb-4">
          <div className="row center gap-2 mb-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} className="btn-icon-lg" onClick={()=>setRating(n)} style={{fontSize:36, color: n<=rating ? 'var(--amber-400)' : 'var(--g-300)'}}>
                <I.star s={44} filled={n<=rating}/>
              </button>
            ))}
          </div>
          <div className="t-caption">{['Выберите оценку','Ужасно','Плохо','Нормально','Хорошо','Отлично'][rating]}</div>
        </div>

        {rating > 0 && <>
          <div className="t-label mb-2">Что понравилось?</div>
          <div className="row gap-2 mb-4" style={{flexWrap:'wrap'}}>
            {tagsToShow.map(t => {
              const on = tags.includes(t);
              return <button key={t} className={`chip ${on?'active':''}`} onClick={()=>setTags(on?tags.filter(x=>x!==t):[...tags,t])}>
                {on && <I.check s={12}/>}{t}
              </button>;
            })}
          </div>

          <div className="field mb-4">
            <div className="field-label">Отзыв (необязательно)</div>
            <textarea className="field-input" rows={3} placeholder="Напишите что-нибудь для других пассажиров..." value={text} onChange={e=>setText(e.target.value)}/>
          </div>

          <div className="card mb-4" style={{background:'var(--g-50)'}}>
            <div className="row gap-2 mb-1"><I.shield s={14} style={{color:'var(--g-700)'}}/><span style={{fontWeight:700, fontSize:13}}>Взаимный отзыв</span></div>
            <div className="t-caption">Ваша оценка появится, когда {driver?.name} тоже оставит отзыв о вас. Это защищает от мести в рейтингах.</div>
          </div>

          <button className="btn btn-submit btn-block" onClick={submit}>Отправить отзыв</button>
        </>}
      </div>}

      {submitted && <div className="card card-lg text-center">
        <div style={{margin:'24px auto', width:80, height:80, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <I.checkCircle s={36} style={{color:'var(--success)'}}/>
        </div>
        <div className="t-h1">Спасибо!</div>
        <div className="t-caption mt-2">Ваш отзыв поможет другим пассажирам сделать правильный выбор.</div>
      </div>}
    </div>
  );
}

// ========== NOTIFICATIONS ==========
function Notifications({ go, state, setState }){
  const K = window.Kosho;
  const items = [
    { id:1, type:'booking_accepted', title:'Аслан принял ваш запрос', desc:'Бишкек → Ош, 20 апр 09:00. Номер водителя открыт в чате.', time:'5 мин назад', unread:true, icon:I.checkCircle, color:'var(--success)', action: () => { setState(s=>({...s, chatBookingId:'b3'})); go('chat'); } },
    { id:2, type:'chat', title:'Новое сообщение от Динары', desc:'«Буду на месте в 8:45, подходи к серой машине»', time:'27 мин назад', unread:true, icon:I.msg, color:'var(--teal-600)', action: () => go('chat') },
    { id:3, type:'trip_reminder', title:'Завтра ваша поездка', desc:'Бишкек → Ош в 09:00. Не забудьте связаться с водителем.', time:'2 часа назад', unread:false, icon:I.bell, color:'var(--amber-500)', action: () => go('myBookings') },
    { id:4, type:'rating_request', title:'Оцените поездку с Нурланом', desc:'Бишкек → Нарын, 15 апр. Ваш отзыв поможет другим пассажирам.', time:'Вчера', unread:false, icon:I.star, color:'var(--amber-400)', action: () => go('rating') },
    { id:5, type:'driver_approved', title:'Ваш аккаунт водителя одобрен!', desc:'Теперь вы можете публиковать поездки и зарабатывать.', time:'3 дня назад', unread:false, icon:I.shield, color:'var(--teal-600)', action: () => go('publish') },
    { id:6, type:'booking_rejected', title:'Бакыт отклонил запрос', desc:'К сожалению, водитель отказал. Попробуйте другие поездки.', time:'Неделю назад', unread:false, icon:I.xCircle, color:'var(--danger)', action: () => go('search') },
  ];
  const [filter, setFilter] = useS3('all');

  const filtered = filter==='unread' ? items.filter(i=>i.unread) : items;

  return (
    <div style={{maxWidth:720, margin:'0 auto', padding:'32px 24px'}}>
      <div className="row between mb-4">
        <div>
          <div className="t-h1">Уведомления</div>
          <div className="t-caption mt-1">{items.filter(i=>i.unread).length} непрочитанных</div>
        </div>
        <button className="btn btn-ghost btn-sm">Прочитать все</button>
      </div>

      <div className="tabs mb-4">
        <button className={`tab ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>Все ({items.length})</button>
        <button className={`tab ${filter==='unread'?'active':''}`} onClick={()=>setFilter('unread')}>Непрочитанные ({items.filter(i=>i.unread).length})</button>
      </div>

      <div className="col gap-2">
        {filtered.map(n => {
          const Ic = n.icon;
          return (
            <div key={n.id} className={`card card-interactive ${n.unread?'unread':''}`} onClick={n.action} style={{padding:14, position:'relative'}}>
              <div className="row gap-3">
                <div style={{width:40, height:40, borderRadius:10, background:`${n.color}15`, color:n.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <Ic s={18}/>
                </div>
                <div className="col flex-1">
                  <div className="row between mb-1">
                    <span style={{fontWeight:700, fontSize:14}}>{n.title}</span>
                    <span className="t-caption" style={{fontSize:11}}>{n.time}</span>
                  </div>
                  <span style={{fontSize:13, color:'var(--g-700)', lineHeight:1.5}}>{n.desc}</span>
                </div>
              </div>
              {n.unread && <span style={{position:'absolute', top:14, right:14, width:8, height:8, borderRadius:'50%', background:'var(--teal-500)'}}></span>}
            </div>
          );
        })}
      </div>

      <div className="card card-lg mt-4">
        <div className="t-h2 mb-3">Настройки уведомлений</div>
        <div className="col gap-3">
          {[
            ['Новые сообщения', true],
            ['Подтверждение брони', true],
            ['Напоминание за день', true],
            ['Просьба об оценке', true],
            ['Маркетинг и новости', false],
          ].map(([l,v]) => (
            <div key={l} className="row between"><span style={{fontSize:14}}>{l}</span><Switch on={v}/></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== ADMIN PANEL ==========
function Admin({ go, state, setState }){
  const K = window.Kosho;
  const [tab, setTab] = useS3('overview');

  const stats = {
    active_users: 2847,
    active_drivers: 412,
    trips_today: 87,
    trips_week: 542,
    bookings_today: 234,
    revenue_month: 0, // MVP, no commission
    avg_rating: 4.7,
    pending_verifications: 14,
    open_complaints: 3,
  };

  return (
    <div style={{background:'var(--g-50)', minHeight:'calc(100vh - 64px)'}}>
      <div style={{maxWidth:1200, margin:'0 auto', padding:'24px'}}>
        <div className="row between mb-4">
          <div>
            <div className="row gap-2" style={{alignItems:'center'}}>
              <span className="badge" style={{background:'#7c3aed22', color:'#7c3aed', border:'1px solid #7c3aed44'}}><I.shield s={12}/> Админ</span>
              <span className="t-h1">Kosho Console</span>
            </div>
            <div className="t-caption mt-1">Мониторинг, модерация, аналитика</div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-outline btn-sm"><I.refresh s={12}/> Обновить</button>
            <button className="btn btn-outline btn-sm"><I.settings s={12}/> Настройки</button>
          </div>
        </div>

        <div className="tabs mb-4" style={{background:'white'}}>
          {[['overview','Обзор',I.dashboard], ['moderation','Модерация',I.shield], ['users','Пользователи',I.users], ['trips','Поездки',I.route], ['reports','Отчёты',I.trending]].map(([v,l,Ic]) => (
            <button key={v} className={`tab ${tab===v?'active':''}`} onClick={()=>setTab(v)}><Ic s={14}/>{l}</button>
          ))}
        </div>

        {tab==='overview' && <>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:20}}>
            {[
              { label:'Активных пользователей', value:stats.active_users, delta:'+12% / нед', color:'var(--teal-600)', icon:I.users },
              { label:'Водителей', value:stats.active_drivers, delta:'+8%', color:'var(--amber-500)', icon:I.car },
              { label:'Поездок сегодня', value:stats.trips_today, delta:`${stats.trips_week} за нед`, color:'var(--teal-600)', icon:I.route },
              { label:'Средний рейтинг', value:stats.avg_rating, delta:'стабильно', color:'#7c3aed', icon:I.star },
            ].map((s,i) => {
              const Ic = s.icon;
              return (
                <div key={i} className="card card-lg">
                  <div className="row between mb-2">
                    <div style={{width:36, height:36, borderRadius:10, background:`${s.color}18`, color:s.color, display:'flex', alignItems:'center', justifyContent:'center'}}><Ic s={18}/></div>
                    <span className="t-caption" style={{fontSize:11, color:'var(--success)', fontWeight:700}}>{s.delta}</span>
                  </div>
                  <div style={{fontSize:28, fontWeight:800}}>{s.value.toLocaleString('ru-RU')}</div>
                  <div className="t-caption mt-1" style={{fontSize:12}}>{s.label}</div>
                </div>
              );
            })}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20}}>
            <div className="card card-lg">
              <div className="row between mb-3">
                <div className="t-h2">Поездки за 7 дней</div>
                <div className="row gap-1">
                  <button className="chip active" style={{fontSize:11}}>Поездки</button>
                  <button className="chip" style={{fontSize:11}}>Брони</button>
                  <button className="chip" style={{fontSize:11}}>Новые</button>
                </div>
              </div>
              <MiniChart/>
            </div>

            <div className="card card-lg">
              <div className="t-h2 mb-3">Требует внимания</div>
              <div className="col gap-2">
                <div className="row between" style={{padding:10, borderRadius:10, background:'var(--amber-50)'}}>
                  <div className="row gap-2"><I.briefcase s={14} style={{color:'var(--amber-600)'}}/><span style={{fontSize:13, fontWeight:600}}>Заявки водителей</span></div>
                  <span className="badge badge-pending">{stats.pending_verifications}</span>
                </div>
                <div className="row between" style={{padding:10, borderRadius:10, background:'#fef2f2'}}>
                  <div className="row gap-2"><I.alert s={14} style={{color:'var(--danger)'}}/><span style={{fontSize:13, fontWeight:600}}>Жалобы</span></div>
                  <span className="badge badge-rejected">{stats.open_complaints}</span>
                </div>
                <div className="row between" style={{padding:10, borderRadius:10, background:'var(--teal-50)'}}>
                  <div className="row gap-2"><I.msg s={14} style={{color:'var(--teal-600)'}}/><span style={{fontSize:13, fontWeight:600}}>Модерация чатов</span></div>
                  <span className="badge badge-seats">7</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-lg">
            <div className="row between mb-3">
              <div className="t-h2">Топ маршрутов (неделя)</div>
              <button className="btn btn-ghost btn-sm">Экспорт CSV</button>
            </div>
            <table className="adm-table">
              <thead><tr><th>Маршрут</th><th>Поездок</th><th>Пассажиров</th><th>Ср. цена</th><th>Заполняемость</th></tr></thead>
              <tbody>
                {[
                  ['Бишкек → Ош', 156, 487, '1180 сом', 87],
                  ['Ош → Бишкек', 142, 456, '1200 сом', 89],
                  ['Бишкек → Каракол', 68, 201, '720 сом', 74],
                  ['Каракол → Бишкек', 62, 184, '720 сом', 71],
                  ['Бишкек → Нарын', 34, 92, '650 сом', 68],
                ].map((r,i) => (
                  <tr key={i}>
                    <td><span style={{fontWeight:700}}>{r[0]}</span></td>
                    <td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td>
                    <td><div className="row gap-2"><div style={{flex:1, height:6, background:'var(--g-100)', borderRadius:3, minWidth:80}}><div style={{height:'100%', width:`${r[4]}%`, background:'var(--teal-500)', borderRadius:3}}></div></div><span style={{fontSize:12, fontWeight:700, minWidth:30}}>{r[4]}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {tab==='moderation' && <DriverRequests/>}
        {tab==='users' && <AdminUsers/>}
        {tab==='trips' && <AdminTrips/>}
        {tab==='reports' && <div className="card card-lg text-center"><div className="t-h2 mb-2">Жалобы и споры</div><div className="t-caption">3 активных кейса. Интеграция с support-почтой.</div></div>}
      </div>
    </div>
  );
}

function MiniChart(){
  const data = [42, 58, 65, 52, 71, 89, 87];
  const max = Math.max(...data);
  const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  return (
    <div className="row" style={{gap:8, height:180, alignItems:'flex-end'}}>
      {data.map((v, i) => (
        <div key={i} className="col flex-1" style={{alignItems:'center', gap:6}}>
          <div style={{width:'100%', maxWidth:48, height:`${v/max*140}px`, background:'linear-gradient(180deg, var(--teal-500), var(--teal-600))', borderRadius:'8px 8px 0 0', position:'relative'}}>
            <span style={{position:'absolute', top:-22, left:'50%', transform:'translateX(-50%)', fontSize:11, fontWeight:700}}>{v}</span>
          </div>
          <span className="t-caption" style={{fontSize:11}}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

function DriverRequests(){
  const K = window.Kosho;
  const [selected, setSelected] = useS3(null);
  const reqs = [
    { id:'dr1', name:'Марат Асанов', phone:'+996 700 334 221', submitted:'5 мин назад', car:'Toyota Camry 2018', docs:3, risk:'low' },
    { id:'dr2', name:'Эрлан Кожомкулов', phone:'+996 550 112 887', submitted:'1 час назад', car:'Hyundai Sonata 2020', docs:3, risk:'low' },
    { id:'dr3', name:'Бекбол Асанов', phone:'+996 702 445 991', submitted:'2 часа назад', car:'Toyota Alphard 2015', docs:2, risk:'medium' },
    { id:'dr4', name:'Жаныш Таштанов', phone:'+996 555 889 112', submitted:'4 часа назад', car:'Honda Odyssey 2017', docs:3, risk:'low' },
    { id:'dr5', name:'Айдар Султанов', phone:'+996 700 991 445', submitted:'Вчера', car:'Toyota Estima 2014', docs:3, risk:'high' },
  ];

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:16}}>
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'14px 16px', borderBottom:'1px solid var(--g-200)'}} className="row between">
          <span style={{fontWeight:800, fontSize:15}}>Очередь ({reqs.length})</span>
          <button className="chip active" style={{fontSize:11}}>Новые</button>
        </div>
        <div className="col" style={{gap:0}}>
          {reqs.map(r => (
            <button key={r.id} className={`chat-row ${selected===r.id?'active':''}`} onClick={()=>setSelected(r.id)}>
              <div className="avatar avatar-40 bg-teal">{r.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
              <div className="col flex-1" style={{alignItems:'flex-start'}}>
                <div className="row between w-full">
                  <span style={{fontWeight:700, fontSize:14}}>{r.name}</span>
                  <span className={`badge ${r.risk==='low'?'badge-verified':r.risk==='medium'?'badge-pending':'badge-rejected'}`} style={{fontSize:10}}>{r.risk}</span>
                </div>
                <span className="t-caption" style={{fontSize:12}}>{r.car}</span>
                <span className="t-caption" style={{fontSize:11, marginTop:2}}>{r.submitted} · {r.docs}/3 док</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card card-lg">
        {!selected && <div className="col center" style={{height:400, gap:12}}><I.briefcase s={36} style={{color:'var(--g-300)'}}/><div className="t-caption">Выберите заявку для проверки</div></div>}
        {selected && (() => {
          const r = reqs.find(x => x.id === selected);
          return (
            <div>
              <div className="row between mb-4">
                <div>
                  <div className="t-h2">{r.name}</div>
                  <div className="t-caption mt-1">{r.phone} · {r.submitted}</div>
                </div>
                <span className={`badge ${r.risk==='low'?'badge-verified':r.risk==='medium'?'badge-pending':'badge-rejected'}`}>риск: {r.risk}</span>
              </div>

              <div className="t-label mb-2">Документы</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20}}>
                {['Права', 'Техпаспорт', 'Селфи'].map((d,i) => (
                  <div key={d} className="card" style={{padding:0, overflow:'hidden', aspectRatio:'4/3'}}>
                    <div style={{height:'70%', background:`linear-gradient(135deg, #4b5563, #1f2937)`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <I.camera s={28} style={{color:'rgba(255,255,255,.5)'}}/>
                    </div>
                    <div style={{padding:'6px 10px', fontSize:11, fontWeight:700}}>{d}</div>
                  </div>
                ))}
              </div>

              <div className="t-label mb-2">Автомобиль</div>
              <div className="card mb-4">
                <div className="row between">
                  <div><div style={{fontWeight:700, fontSize:14}}>{r.car}</div><div className="t-caption mt-1">Гос.номер: 01KG 334ABC</div></div>
                  <button className="btn btn-ghost btn-sm">Проверить базу ГАИ</button>
                </div>
              </div>

              <div className="t-label mb-2">Проверки</div>
              <div className="col gap-2 mb-4">
                {[['Телефон верифицирован', 'pass'], ['Документы читаемы', 'pass'], ['Совпадение лица на селфи и правах', 'pass'], ['Нет в черных списках', 'pass'], ['Возраст ≥ 21 год', 'pass']].map(([l,s]) => (
                  <div key={l} className="row gap-2"><I.checkCircle s={14} style={{color:'var(--success)'}}/><span style={{fontSize:13}}>{l}</span></div>
                ))}
              </div>

              <div className="row gap-2">
                <button className="btn btn-ghost" style={{flex:1}}>Запросить доп. док</button>
                <button className="btn btn-outline" style={{flex:1, color:'var(--danger)', borderColor:'var(--danger)'}}>Отклонить</button>
                <button className="btn btn-submit" style={{flex:1.5}}><I.check s={14}/> Одобрить водителя</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function AdminUsers(){
  const K = window.Kosho;
  return (
    <div className="card card-lg">
      <div className="row between mb-3">
        <div className="t-h2">Пользователи</div>
        <div className="row gap-2">
          <input className="field-input" placeholder="Поиск по имени или телефону" style={{width:280}}/>
          <button className="btn btn-outline btn-sm"><I.filter s={12}/> Фильтры</button>
        </div>
      </div>
      <table className="adm-table">
        <thead><tr><th>Пользователь</th><th>Телефон</th><th>Роль</th><th>Поездок</th><th>Рейтинг</th><th>Статус</th><th></th></tr></thead>
        <tbody>
          {K.USERS.map(u => (
            <tr key={u.id}>
              <td><div className="row gap-2"><Avatar user={u} size={28}/><span style={{fontWeight:700}}>{u.name}</span></div></td>
              <td>{u.phone}</td>
              <td><span className="chip" style={{fontSize:11}}>{u.driver_status==='approved'?'Водитель':'Пассажир'}</span></td>
              <td>{u.trips}</td>
              <td><span style={{fontWeight:700}}>{u.rating.toFixed(1)} ★</span></td>
              <td>{u.verified ? <span className="badge badge-verified" style={{fontSize:10}}>Активен</span> : <span className="badge badge-pending" style={{fontSize:10}}>Новый</span>}</td>
              <td><button className="btn btn-ghost btn-sm"><I.moreV s={12}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminTrips(){
  const K = window.Kosho;
  return (
    <div className="card card-lg">
      <div className="row between mb-3">
        <div className="t-h2">Все поездки</div>
        <div className="row gap-2">
          <button className="chip active" style={{fontSize:11}}>Активные</button>
          <button className="chip" style={{fontSize:11}}>Завершенные</button>
          <button className="chip" style={{fontSize:11}}>Отменённые</button>
        </div>
      </div>
      <table className="adm-table">
        <thead><tr><th>Маршрут</th><th>Водитель</th><th>Отправление</th><th>Мест</th><th>Цена</th><th>Статус</th></tr></thead>
        <tbody>
          {K.TRIPS.map(t => {
            const d = K.getUser(t.driver_id);
            return (
              <tr key={t.id}>
                <td><span style={{fontWeight:700}}>{t.from} → {t.to}</span></td>
                <td><div className="row gap-2"><Avatar user={d} size={24}/><span>{d.name}</span></div></td>
                <td>{K.fmtDateTime(t.departure_at)}</td>
                <td>{t.seats_total - t.seats_available}/{t.seats_total}</td>
                <td style={{fontWeight:700}}>{t.price} сом</td>
                <td><span className="badge badge-verified" style={{fontSize:10}}>{t.status}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

window.Login = Login;
window.Rating = Rating;
window.Notifications = Notifications;
window.Admin = Admin;
