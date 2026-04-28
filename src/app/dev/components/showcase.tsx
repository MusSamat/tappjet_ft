"use client";

import { MapPin, Flag, Clock, Users, Search } from "lucide-react";
import {
  Badge,
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
  Button,
  CardField,
  Checkbox,
  DriverAvatar,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  NotifCard,
  PendingBadge,
  ProgressBar,
  RatingStars,
  SeatsBadge,
  Skeleton,
  Spinner,
  StatusDot,
  Textarea,
  TripCard,
  VerifiedBadge,
} from "@/components/ui";
import type { TripListItem } from "@/lib/api/trips";

const DEMO_TRIP: TripListItem = {
  id: "demo",
  driverId: "d1",
  originCity: "Бишкек",
  destinationCity: "Ош",
  originAddress: "Автовокзал",
  departureAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
  departureFlexible: false,
  estimatedDurationMin: 600,
  seatsTotal: 4,
  seatsAvailable: 2,
  pricePerSeat: 900,
  priceNegotiable: true,
  luggage: "yes",
  driver: {
    id: "d1",
    name: "Асан Кадыров",
    avatarUrl: null,
    rating: 4.8,
    ratingCount: 47,
    verified: true,
  },
};

const COLORS = [
  { name: "teal-50", cls: "bg-teal-50 text-teal-900" },
  { name: "teal-100", cls: "bg-teal-100 text-teal-900" },
  { name: "teal-400", cls: "bg-teal-400 text-white" },
  { name: "teal-500", cls: "bg-teal-500 text-white" },
  { name: "teal-600", cls: "bg-teal-600 text-white" },
  { name: "teal-700", cls: "bg-teal-700 text-white" },
  { name: "teal-900", cls: "bg-teal-900 text-white" },
  { name: "amber-50", cls: "bg-amber-50 text-amber-900" },
  { name: "amber-100", cls: "bg-amber-100 text-amber-900" },
  { name: "amber-400", cls: "bg-amber-400 text-white" },
  { name: "amber-500", cls: "bg-amber-500 text-white" },
  { name: "amber-600", cls: "bg-amber-600 text-white" },
  { name: "success", cls: "bg-success text-white" },
  { name: "error", cls: "bg-error text-white" },
  { name: "warning", cls: "bg-warning text-white" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-100 py-8">
      <h2 className="mb-4 text-h1 text-gray-900">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export function DesignSystemShowcase() {
  return (
    <div className="container py-10">
      <h1 className="text-display text-gray-900">Design System</h1>
      <p className="mt-2 text-body-lg text-gray-700">
        Визуальная верификация компонентов — ТЗ §27. Не индексируется поисковиками.
      </p>

      <Section title="Цвета">
        {COLORS.map((c) => (
          <div key={c.name} className="flex flex-col items-center gap-1">
            <div className={`${c.cls} flex h-16 w-24 items-center justify-center rounded-xl text-caption`}>
              {c.name}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Типографика">
        <div className="flex w-full flex-col gap-2">
          <p className="text-display">Display 32/800 — Бишкек → Ош</p>
          <p className="text-h1">H1 24/700 — Создать поездку</p>
          <p className="text-h2">H2 18/700 — Детали поездки</p>
          <p className="text-body-lg">Body-lg 15/400 — основной текст интерфейса, описания.</p>
          <p className="text-body">Body 14/600 — названия, значения в input.</p>
          <p className="text-caption">Caption 12/600 — даты, метаданные.</p>
          <p className="text-label uppercase tracking-wider">Label 10/700 — ОТКУДА, КУДА</p>
        </div>
      </Section>

      <Section title="Кнопки">
        <Button variant="submit" size="lg">
          <Search className="h-5 w-5" /> Найти поездку
        </Button>
        <Button variant="primary">Опубликовать</Button>
        <Button variant="secondary">Отменить</Button>
        <Button variant="outline">Написать</Button>
        <Button variant="ghost">Пропустить</Button>
        <Button variant="danger">Удалить</Button>
        <Button variant="pill" size="lg">
          CTA на лендинге
        </Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section title="Input · CardField · Textarea · Checkbox">
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" placeholder="Асан Кадыров" />
          </div>
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-gray-300 bg-white">
            <CardField
              icon={<MapPin className="h-4 w-4 text-teal-700" />}
              label="ОТКУДА"
              defaultValue="Бишкек"
              iconBg="bg-teal-50"
              className="border-b-[0.5px] border-gray-100"
            />
            <CardField
              icon={<Flag className="h-4 w-4 text-amber-600" />}
              label="КУДА"
              placeholder="Куда едете?"
              iconBg="bg-amber-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea id="comment" placeholder="До 300 символов…" />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox id="terms" />
            <span className="text-body-lg text-gray-700">Я согласен с условиями</span>
          </label>
        </div>
      </Section>

      <Section title="Badge · StatusDot">
        <VerifiedBadge />
        <PendingBadge />
        <SeatsBadge available={2} total={4} />
        <Badge variant="success">Принято</Badge>
        <Badge variant="danger">Отклонено</Badge>
        <StatusDot status="accepted" label="Принято" />
        <StatusDot status="pending" label="Ожидание" />
        <StatusDot status="rejected" label="Отклонено" />
        <StatusDot status="cancelled" label="Отменено" />
      </Section>

      <Section title="DriverAvatar · RatingStars">
        <DriverAvatar name="Асан Кадыров" size="sm" />
        <DriverAvatar name="Нурия Токтосунова" size="md" />
        <DriverAvatar name="Бакыт Осмонов" size="lg" />
        <div className="flex flex-col gap-1">
          <RatingStars value={4.8} showValue />
          <RatingStars value={3.5} showValue />
          <RatingStars value={5} showValue />
        </div>
      </Section>

      <Section title="NotifCard">
        <div className="flex w-full max-w-2xl flex-col gap-3">
          <NotifCard variant="info" title="Информация">
            Это информационное уведомление с иконкой.
          </NotifCard>
          <NotifCard variant="success" title="Бронирование принято">
            Водитель принял ваш запрос. Теперь можно писать в чат.
          </NotifCard>
          <NotifCard variant="warning" title="Напоминание">
            Поездка через 2 часа. Проверьте детали.
          </NotifCard>
          <NotifCard variant="error" title="Ошибка">
            Не удалось отправить запрос. Попробуйте ещё раз.
          </NotifCard>
        </div>
      </Section>

      <Section title="ProgressBar · Spinner · Skeleton">
        <div className="flex w-full max-w-md flex-col gap-4">
          <ProgressBar value={3} max={5} label="Шаг 3 из 5" />
          <ProgressBar value={80} label="Загрузка фото" />
          <div className="flex items-center gap-3">
            <Spinner size={16} />
            <Spinner size={24} />
            <Spinner size={32} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </Section>

      <Section title="TripCard">
        <div className="grid w-full gap-4 md:grid-cols-2">
          <TripCard trip={DEMO_TRIP} href="/trips/demo" />
          <TripCard
            trip={{
              ...DEMO_TRIP,
              id: "demo2",
              originCity: "Бишкек",
              destinationCity: "Каракол",
              pricePerSeat: 600,
              priceNegotiable: false,
              seatsAvailable: 1,
              luggage: "no",
              driver: {
                id: "d2",
                name: "Нурия Т.",
                avatarUrl: null,
                rating: null,
                ratingCount: 1,
                verified: false,
              },
            }}
          />
        </div>
      </Section>

      <Section title="Modal · BottomSheet">
        <Modal>
          <ModalTrigger asChild>
            <Button variant="primary">Открыть Modal</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Отменить поездку?</ModalTitle>
              <ModalDescription>
                Все пассажиры с активными бронированиями получат уведомление.
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button variant="ghost">Оставить</Button>
              <Button variant="danger">Отменить поездку</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <BottomSheet>
          <BottomSheetTrigger asChild>
            <Button variant="secondary">Открыть BottomSheet</Button>
          </BottomSheetTrigger>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>Фильтры поиска</BottomSheetTitle>
            </BottomSheetHeader>
            <div className="flex flex-col gap-3">
              <CardField
                icon={<Clock className="h-4 w-4 text-teal-700" />}
                label="ВРЕМЯ"
                placeholder="Любое"
              />
              <CardField
                icon={<Users className="h-4 w-4 text-gray-700" />}
                label="МЕСТ"
                defaultValue="1"
              />
            </div>
            <div className="mt-6">
              <Button variant="submit" size="lg" className="w-full">
                Применить
              </Button>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      </Section>
    </div>
  );
}
