// Shared data and helpers for Kosho prototype
(function(){
  const CITIES = [
    { id: 1, name_ru: 'Бишкек', name_ky: 'Бишкек', region: 'Чуйская', lat: 42.8746, lng: 74.5698 },
    { id: 2, name_ru: 'Ош', name_ky: 'Ош', region: 'Ошская', lat: 40.5283, lng: 72.7985 },
    { id: 3, name_ru: 'Каракол', name_ky: 'Каракол', region: 'Иссык-Кульская', lat: 42.4900, lng: 78.3900 },
    { id: 4, name_ru: 'Нарын', name_ky: 'Нарын', region: 'Нарынская', lat: 41.4287, lng: 75.9911 },
    { id: 5, name_ru: 'Чолпон-Ата', name_ky: 'Чолпон-Ата', region: 'Иссык-Кульская', lat: 42.6496, lng: 77.0809 },
    { id: 6, name_ru: 'Талас', name_ky: 'Талас', region: 'Таласская', lat: 42.5228, lng: 72.2428 },
    { id: 7, name_ru: 'Джалал-Абад', name_ky: 'Жалал-Абад', region: 'Джалал-Абадская', lat: 40.9333, lng: 73.0000 },
    { id: 8, name_ru: 'Баткен', name_ky: 'Баткен', region: 'Баткенская', lat: 40.0600, lng: 70.8200 },
  ];

  const ROUTE_HOURS = {
    'Бишкек-Ош': 10, 'Ош-Бишкек': 10,
    'Бишкек-Каракол': 6, 'Каракол-Бишкек': 6,
    'Бишкек-Нарын': 5, 'Нарын-Бишкек': 5,
    'Бишкек-Чолпон-Ата': 4, 'Чолпон-Ата-Бишкек': 4,
    'Бишкек-Талас': 5, 'Талас-Бишкек': 5,
    'Бишкек-Джалал-Абад': 9, 'Джалал-Абад-Бишкек': 9,
  };

  const PRICE_AVG = {
    'Бишкек-Ош': 1200, 'Ош-Бишкек': 1200,
    'Бишкек-Каракол': 800, 'Каракол-Бишкек': 800,
    'Бишкек-Нарын': 700, 'Нарын-Бишкек': 700,
    'Бишкек-Чолпон-Ата': 500, 'Чолпон-Ата-Бишкек': 500,
  };

  const USERS = {
    'u1': { id:'u1', name:'Асан К.', avatar:'АК', rating:4.8, rating_count:47, roles:['passenger','driver'], verified:true, phone:'+996700123456', trips:84 },
    'u2': { id:'u2', name:'Айгуль М.', avatar:'АМ', rating:4.9, rating_count:62, roles:['passenger','driver'], verified:true, phone:'+996555234567', trips:112, color:'amber' },
    'u3': { id:'u3', name:'Нурлан Т.', avatar:'НТ', rating:4.6, rating_count:28, roles:['passenger','driver'], verified:true, phone:'+996700345678', trips:41 },
    'u4': { id:'u4', name:'Бакыт С.', avatar:'БС', rating:0, rating_count:0, roles:['passenger'], verified:false, phone:'+996555456789', trips:0 },
    'u5': { id:'u5', name:'Эркин Ж.', avatar:'ЭЖ', rating:4.3, rating_count:12, roles:['passenger','driver'], verified:true, phone:'+996700567890', trips:18 },
    'u6': { id:'u6', name:'Гульнара О.', avatar:'ГО', rating:5.0, rating_count:8, roles:['passenger'], verified:false, phone:'+996555678901', trips:5, color:'amber' },
    'me': { id:'me', name:'Вы (Тимур Б.)', avatar:'ТБ', rating:4.7, rating_count:15, roles:['passenger','driver'], verified:true, phone:'+996700999888', trips:23 },
  };

  // Seed trips (relative to "today" for demo)
  const now = new Date();
  function hoursFromNow(h) { return new Date(now.getTime() + h*3600*1000); }
  function daysFromNow(d, h=8) { const x = new Date(now); x.setDate(x.getDate()+d); x.setHours(h,0,0,0); return x; }

  const TRIPS = [
    { id:'t1', driver_id:'u1', from:'Бишкек', to:'Ош', departure_at: daysFromNow(0, 7), duration_min: 600, seats_total:4, seats_available:2, price:1200, negotiable:false, luggage:'small', prefs:['no_smoking','music'], comment:'Еду мимо Токтогула, могу подобрать по пути. Комфортная Camry 2018.', car:'Toyota Camry · Белая · 01 KG 123 ABC', status:'active', instant_booking:false, stops:['Кара-Балта','Токтогул','Таш-Кумыр'], coords:[[42.87,74.57],[42.82,73.85],[41.87,72.94],[41.34,72.21],[40.53,72.80]], package_allowed:true },
    { id:'t2', driver_id:'u2', from:'Бишкек', to:'Каракол', departure_at: daysFromNow(0, 14), duration_min: 360, seats_total:3, seats_available:1, price:900, negotiable:true, luggage:'yes', prefs:['silence'], comment:'Остановлюсь в Балыкчы на 20 минут.', car:'Honda CR-V · Чёрная · 01 KG 456 DEF', status:'active', instant_booking:true, stops:['Токмок','Балыкчы','Чолпон-Ата'], coords:[[42.87,74.57],[42.84,75.30],[42.46,76.18],[42.65,77.08],[42.49,78.39]], package_allowed:true },
    { id:'t3', driver_id:'u3', from:'Бишкек', to:'Нарын', departure_at: daysFromNow(1, 6), duration_min: 300, seats_total:3, seats_available:3, price:650, negotiable:false, luggage:'small', prefs:['no_smoking'], comment:'Через Кочкор. Большой багажник.', car:'Mitsubishi Outlander · Серебро · 01 KG 789 GHI', status:'active', instant_booking:false, stops:['Кочкор'], coords:[[42.87,74.57],[42.22,75.76],[41.43,75.99]], package_allowed:false },
    { id:'t4', driver_id:'u5', from:'Бишкек', to:'Ош', departure_at: daysFromNow(1, 22), duration_min: 600, seats_total:4, seats_available:4, price:1300, negotiable:true, luggage:'yes', prefs:['music'], comment:'Ночной рейс, водитель выспавшийся.', car:'Toyota Alphard · Чёрная · 01 KG 111 AAA', status:'active', instant_booking:true, stops:['Токтогул','Джалал-Абад'], coords:[[42.87,74.57],[41.87,72.94],[40.93,73.00],[40.53,72.80]], package_allowed:true },
    { id:'t5', driver_id:'u1', from:'Каракол', to:'Бишкек', departure_at: daysFromNow(2, 9), duration_min: 360, seats_total:4, seats_available:2, price:800, negotiable:false, luggage:'yes', prefs:[], comment:'', car:'Toyota Camry · Белая · 01 KG 123 ABC', status:'active', instant_booking:false, stops:[], coords:[[42.49,78.39],[42.87,74.57]], package_allowed:false },
    { id:'t6', driver_id:'u2', from:'Бишкек', to:'Чолпон-Ата', departure_at: daysFromNow(2, 10), duration_min: 240, seats_total:3, seats_available:2, price:500, negotiable:false, luggage:'small', prefs:['no_smoking','silence'], comment:'Еду на отдых.', car:'Honda CR-V · Чёрная · 01 KG 456 DEF', status:'active', instant_booking:true, stops:['Токмок','Балыкчы'], coords:[[42.87,74.57],[42.84,75.30],[42.46,76.18],[42.65,77.08]], package_allowed:true },
    { id:'t7', driver_id:'u3', from:'Бишкек', to:'Ош', departure_at: daysFromNow(3, 8), duration_min: 600, seats_total:3, seats_available:1, price:1100, negotiable:true, luggage:'no', prefs:['silence'], comment:'Тихая поездка без музыки.', car:'Mitsubishi Outlander · Серебро · 01 KG 789 GHI', status:'active', instant_booking:false, stops:['Токтогул'], coords:[[42.87,74.57],[41.87,72.94],[40.53,72.80]], package_allowed:false },
    // Active "in-progress" trip for SOS / tracking demo
    { id:'t_now', driver_id:'u2', from:'Бишкек', to:'Каракол', departure_at: new Date(now.getTime() - 45*60*1000), duration_min: 360, seats_total:3, seats_available:0, price:900, negotiable:false, luggage:'yes', prefs:[], comment:'Демо: поездка в пути.', car:'Honda CR-V · Чёрная · 01 KG 456 DEF', status:'in_progress', tracking_status:'en_route', instant_booking:true, stops:['Токмок','Балыкчы'], coords:[[42.87,74.57],[42.84,75.30],[42.46,76.18],[42.65,77.08]], current_progress:0.35, package_allowed:true },
  ];

  const BOOKINGS = [
    { id:'b1', trip_id:'t1', passenger_id:'u4', seats:1, comment:'Один, багаж небольшой.', status:'pending', created_at: new Date(now.getTime() - 12*60*1000), expires_at: new Date(now.getTime() + 48*60*1000), viewed_by_driver: new Date(now.getTime() - 6*60*1000), pre_booking_msg_count: 2 },
    { id:'b2', trip_id:'t1', passenger_id:'u6', seats:1, comment:'Сестра встретит меня в Оше.', status:'accepted', created_at: new Date(now.getTime() - 2*3600*1000), viewed_by_driver: new Date(now.getTime() - 115*60*1000), pre_booking_msg_count: 4 },
    { id:'b3', trip_id:'t2', passenger_id:'me', seats:1, comment:'Еду на свадьбу.', status:'accepted', created_at: new Date(now.getTime() - 4*3600*1000), viewed_by_driver: new Date(now.getTime() - 230*60*1000), pre_booking_msg_count: 3 },
    { id:'b4', trip_id:'t3', passenger_id:'u6', seats:2, comment:'Две сестры.', status:'pending', created_at: new Date(now.getTime() - 3*60*1000), expires_at: new Date(now.getTime() + 57*60*1000), viewed_by_driver: null, pre_booking_msg_count: 1 },
    // Passenger-side demo: me has a pending booking I can open pre-booking chat on
    { id:'b_pre', trip_id:'t4', passenger_id:'me', seats:1, comment:'Еду в аэропорт к утру.', status:'pending', created_at: new Date(now.getTime() - 6*60*1000), expires_at: new Date(now.getTime() + 54*60*1000), viewed_by_driver: new Date(now.getTime() - 2*60*1000), pre_booking_msg_count: 2 },
    // Active in-progress booking (for SOS / tracking demo)
    { id:'b_now', trip_id:'t_now', passenger_id:'me', seats:1, comment:'', status:'confirmed', created_at: new Date(now.getTime() - 26*3600*1000), accepted_at: new Date(now.getTime() - 25*3600*1000), pre_booking_msg_count: 5 },
  ];

  const MESSAGES = {
    'b1': [
      { id:'pm1', sender_id:'u4', text:'Здравствуйте! Можно уточнить, во сколько выезд?', created_at: new Date(now.getTime() - 11*60*1000), read:true, is_pre_booking:true },
      { id:'pm2', sender_id:'u4', text:'И есть ли место для ноутбука в ногах?', created_at: new Date(now.getTime() - 10*60*1000), read:false, is_pre_booking:true },
    ],
    'b4': [
      { id:'pm3', sender_id:'u6', text:'Здравствуйте! Мы с сестрой, можно встретиться у Ошского базара?', created_at: new Date(now.getTime() - 2*60*1000), read:false, is_pre_booking:true },
    ],
    'b_pre': [
      { id:'pm4', sender_id:'me', text:'Здравствуйте, я в сторону аэропорта рано утром. Вы сможете заехать за мной в мкр Восток-5?', created_at: new Date(now.getTime() - 5*60*1000), read:true, is_pre_booking:true },
      { id:'pm5', sender_id:'u5', text:'Здравствуйте. Да, могу подхватить, только минут на 15 пораньше.', created_at: new Date(now.getTime() - 3*60*1000), read:true, is_pre_booking:true },
    ],
    'b3': [
      { id:'m1', sender_id:'me', text:'Здравствуйте! Подтверждаю встречу завтра в 14:00.', created_at: new Date(now.getTime() - 3*3600*1000), read:true },
      { id:'m2', sender_id:'u2', text:'Здравствуйте, Тимур! Отлично. Буду у ТЦ Ала-Арча, белый Honda CR-V.', created_at: new Date(now.getTime() - 2.9*3600*1000), read:true },
      { id:'m3', sender_id:'me', text:'Понял. Мой номер уже виден, если что — звоните.', created_at: new Date(now.getTime() - 2.8*3600*1000), read:true },
      { id:'m4', sender_id:'u2', text:'Хорошо. До завтра!', created_at: new Date(now.getTime() - 20*60*1000), read:false },
    ],
    'b2': [
      { id:'m5', sender_id:'u6', text:'Здравствуйте! Можно выехать чуть раньше, 6:45?', created_at: new Date(now.getTime() - 90*60*1000), read:true, is_pre_booking:true },
      { id:'m6', sender_id:'u1', text:'Да, без проблем. Буду на месте.', created_at: new Date(now.getTime() - 80*60*1000), read:true, is_pre_booking:true },
    ],
    'b_now': [
      { id:'mn1', sender_id:'me', text:'Доброе утро! Я готова.', created_at: new Date(now.getTime() - 50*60*1000), read:true },
      { id:'mn2', sender_id:'u2', text:'Выехал, буду через 10 мин.', created_at: new Date(now.getTime() - 48*60*1000), read:true },
      { id:'mn3', sender_id:'u2', text:'В пути, едем по графику.', created_at: new Date(now.getTime() - 25*60*1000), read:true },
    ]
  };

  const NOTIFICATIONS = [
    { id:'n1', type:'booking_accepted', title:'Запрос принят', text:'Айгуль М. приняла ваш запрос. Чат открыт.', time:'4 ч назад', variant:'ok', read:false },
    { id:'n2', type:'new_message', title:'Новое сообщение', text:'Айгуль М.: Хорошо. До завтра!', time:'20 мин назад', variant:'ok', read:false },
    { id:'n3', type:'trip_reminder', title:'Напоминание о поездке', text:'Через 2 часа — Бишкек → Каракол с Айгуль М.', time:'2 ч назад', variant:'warn', read:false },
    { id:'n4', type:'rating_request', title:'Оцените поездку', text:'Бишкек → Нарын с Нурланом Т. — оцените, пожалуйста.', time:'вчера', variant:'warn', read:true },
    { id:'n5', type:'verification_approved', title:'Вы верифицированы', text:'Поздравляем! Вы верифицированы как водитель.', time:'3 дня назад', variant:'ok', read:true },
  ];

  const COMPLAINTS = [
    { id:'c1', category:'no_show', reporter:'u3', target_user:'u6', target_trip:'t3', description:'Пассажир не явился к месту отправления. Ждал 30 минут, не отвечал на звонки.', status:'new', priority:'P2', created_at: new Date(now.getTime() - 5*3600*1000) },
    { id:'c2', category:'безопасность', reporter:'u4', target_user:'u5', target_trip:'t4', description:'Водитель вёл машину в нетрезвом состоянии. Опасная езда всю дорогу.', status:'in_review', priority:'P0', created_at: new Date(now.getTime() - 3600*1000) },
    { id:'c3', category:'грубость', reporter:'u6', target_user:'u3', target_trip:'t3', description:'Грубо отозвался о моём багаже, хотя он был заявлен.', status:'new', priority:'P2', created_at: new Date(now.getTime() - 8*3600*1000) },
  ];

  const PENDING_VERIFICATIONS = [
    { id:'v1', user_id:'u4', name:'Бакыт С.', phone:'+996555456789', submitted_at: new Date(now.getTime() - 18*3600*1000), car:{make:'Toyota', model:'Camry', year:2016, color:'Чёрный', plate:'01 KG 555 ZZZ', seats:4} },
    { id:'v2', user_id:'u6', name:'Гульнара О.', phone:'+996555678901', submitted_at: new Date(now.getTime() - 26*3600*1000), car:{make:'Honda', model:'Fit', year:2014, color:'Белый', plate:'01 KG 222 YYY', seats:3} },
  ];

  // Helpers
  function fmtDate(d) {
    const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
  function fmtTime(d) { return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
  function fmtDateTime(d) { return `${fmtDate(d)}, ${fmtTime(d)}`; }
  function fmtDuration(min) {
    const h = Math.floor(min/60), m = min%60;
    return m ? `${h} ч ${m} мин` : `${h} ч`;
  }
  function fmtRelative(d) {
    const diff = (now - d) / 1000;
    if (diff < 60) return 'сейчас';
    if (diff < 3600) return `${Math.floor(diff/60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff/3600)} ч назад`;
    return `${Math.floor(diff/86400)} д назад`;
  }
  function getUser(id) {
    const u = USERS[id];
    if (!u) return { id, name:'Пользователь', avatar:'?', rating:0, rating_count:0, verified:false, phone:'', trips:0, color:'bg-gray' };
    // Normalize expected fields for screens
    return Object.assign({}, u, {
      color: u.color==='amber'?'bg-amber':u.color||'bg-teal',
      driver_status: (u.roles||[]).includes('driver') && u.verified ? 'approved' : 'none',
      joined_at: 'марта 2024',
      car: u.car || null,
      bio: u.bio || null,
    });
  }
  function getTrip(id) { return TRIPS.find(t => t.id === id); }
  function suggestPrice(from, to){ return PRICE_AVG[`${from}-${to}`] || 1000; }
  function filterContactInfo(text){
    return text.replace(/[+]?\s*9?9?6?\s*[\s\-()]*\d[\d\s\-()]{7,}/g, '[номер скрыт]')
               .replace(/@[\w\d_]+/g, '[контакт скрыт]');
  }

  // Normalize BOOKINGS status to what screens expect (confirmed/completed/pending/rejected)
  BOOKINGS.forEach(b => {
    if (b.status==='accepted') b.status='confirmed';
  });
  // Add a completed booking for rating flow
  BOOKINGS.push({ id:'b5', trip_id:'t5', passenger_id:'me', seats:1, status:'completed', rating_given:false, created_at: new Date(now.getTime() - 4*86400*1000) });
  BOOKINGS.push({ id:'b6', trip_id:'t7', passenger_id:'me', seats:1, status:'rejected', created_at: new Date(now.getTime() - 2*86400*1000) });

  // Normalize MESSAGES to use sender/time (what screens expect)
  Object.keys(MESSAGES).forEach(k => {
    MESSAGES[k] = MESSAGES[k].map(m => ({
      sender: m.sender_id, text: m.text, time: m.created_at,
      status: 'sent', read: m.read !== false,
      is_pre_booking: !!m.is_pre_booking
    }));
  });

  const PRE_BOOKING_LIMIT = 10;

  // Expose USERS as both object and array
  const USERS_ARRAY = Object.values(USERS);

  window.Kosho = {
    CITIES, TRIPS, BOOKINGS, USERS: USERS_ARRAY, USERS_MAP: USERS, MESSAGES, NOTIFICATIONS, COMPLAINTS, PENDING_VERIFICATIONS,
    ROUTE_HOURS, PRICE_AVG, PRE_BOOKING_LIMIT,
    fmtDate, fmtTime, fmtDateTime, fmtDuration, fmtRelative,
    getUser, getTrip, suggestPrice, filterContactInfo,
  };
})();
