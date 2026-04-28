// Maps backend error codes + reason details to user-friendly Russian messages.
// Priority: details.reason > error code > server message field.

type ErrorShape = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

const REASON: Record<string, string> = {
  // ── Trip creation ────────────────────────────────────────────────────
  one_active_per_day:
    "У вас уже есть активная поездка на этот день. Создайте поездку на другую дату.",
  driver_not_verified:
    "Ваш профиль водителя ещё не верифицирован. Дождитесь проверки документов.",
  not_a_driver: "Сначала зарегистрируйтесь как водитель в профиле.",
  seats_exceed_vehicle: "Количество мест превышает вместимость вашего автомобиля.",
  departure_too_soon:
    "Время отправления слишком близко. Укажите время хотя бы через 30 минут.",
  departure_too_far: "Дата слишком далеко в будущем. Максимум 30 дней.",
  cities_must_differ: "Город отправления и назначения должны отличаться.",
  unknown_city: "Выбранный город не поддерживается.",
  missing_idempotency_key: "Ошибка запроса. Попробуйте снова.",
  idempotency_key_mismatch: "Ошибка идемпотентности. Попробуйте снова.",

  // ── Booking ──────────────────────────────────────────────────────────
  cannot_book_own_trip: "Вы не можете забронировать собственную поездку.",
  max_pending_bookings_exceeded:
    "У вас уже 3 активных заявки. Дождитесь ответа по текущим или отмените одну из них.",
  duplicate_driver_booking:
    "Вы уже отправили заявку этому водителю на эту дату.",

  // ── Trip creation (driver limits) ────────────────────────────────────
  max_active_trips_exceeded:
    "У вас уже 3 активные поездки. Завершите или отмените одну перед созданием новой.",
  unfinished_accepted_booking:
    "Нельзя создать новую поездку, пока есть принятые заявки пассажиров в незавершённой поездке.",

  // ── Auth ─────────────────────────────────────────────────────────────
  blocked: "Ваш аккаунт заблокирован. Обратитесь в поддержку.",
  user_deleted: "Аккаунт удалён.",
  user_gone: "Аккаунт не найден. Войдите снова.",
  invalid_credentials: "Неверный номер телефона или пароль.",
  phone_not_verified: "Номер телефона не подтверждён.",
  token_reuse_detected:
    "Обнаружена подозрительная активность. Все сессии завершены — войдите снова.",
  refresh_revoked: "Сессия завершена. Войдите снова.",
  refresh_expired: "Сессия истекла. Войдите снова.",
  refresh_not_found: "Сессия не найдена. Войдите снова.",
  phone_taken: "Этот номер телефона уже привязан к другому аккаунту.",
  current_password_required: "Введите текущий пароль.",
  current_password_mismatch: "Неверный текущий пароль.",
  password_not_set: "Пароль не установлен. Используйте другой способ входа.",
  password_mismatch: "Неверный пароль.",
  too_soon: "Подождите немного перед следующей попыткой.",
  no_telegram_linked: "Для входа без пароля привяжите Telegram в настройках профиля.",

  // ── Chat ─────────────────────────────────────────────────────────────
  pre_booking_limit_reached:
    "Достигнут лимит сообщений до подтверждения брони. После принятия запроса лимит снимется.",
  chat_write_window_expired:
    "Время переписки по завершённой поездке истекло.",
  chat_not_available: "Чат недоступен для этого бронирования.",
  chat_not_writable: "Отправка сообщений недоступна.",
  not_participant: "У вас нет доступа к этому чату.",

  // ── Driver registration ───────────────────────────────────────────────
  plate_taken: "Этот госномер уже зарегистрирован в системе.",
  already_active: "Заявка водителя уже подана и рассматривается.",
  missing_files: "Необходимо загрузить документы.",
  missing_file: "Один из обязательных файлов не загружен.",

  // ── Ratings ──────────────────────────────────────────────────────────
  already_rated: "Вы уже оставили оценку для этой поездки.",
  rating_window_closed: "Окно для оценки закрыто.",
  cannot_rate_self: "Нельзя оценить самого себя.",
  no_completed_booking: "Оценка доступна только для завершённых поездок.",
  ratee_not_in_trip: "Пользователь не участвовал в этой поездке.",
  not_a_trip_participant: "Вы не участвовали в этой поездке.",
};

const CODE: Record<string, string> = {
  SEATS_NOT_AVAILABLE: "Мест больше нет. Попробуйте другую поездку.",
  BOOKING_ALREADY_EXISTS: "У вас уже есть активное бронирование на эту поездку.",
  TRIP_NOT_ACTIVE: "Поездка больше не активна.",
  RATE_LIMITED: "Слишком много запросов. Подождите немного.",
  OTP_TOO_MANY_ATTEMPTS: "Слишком много попыток. Запросите новый код.",
  CONFLICT: "Действие временно невозможно. Попробуйте позже.",
  FORBIDDEN: "Нет прав для этого действия.",
  NOT_FOUND: "Ресурс не найден.",
  UNAUTHORIZED: "Необходима авторизация.",
  TOKEN_EXPIRED: "Сессия истекла. Войдите снова.",
  VALIDATION_ERROR: "Проверьте правильность введённых данных.",
  INTERNAL_ERROR: "Внутренняя ошибка сервера. Попробуйте позже.",
  SERVICE_UNAVAILABLE: "Сервис временно недоступен. Попробуйте позже.",
};

export function friendlyError(err: ErrorShape): string {
  const reason = err.details?.reason as string | undefined;
  if (reason && REASON[reason]) return REASON[reason] ?? err.message;
  if (CODE[err.code]) return CODE[err.code] ?? err.message;
  return err.message;
}
