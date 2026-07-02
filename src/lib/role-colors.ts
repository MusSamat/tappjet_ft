// Role colour language — mirrors the Tappjet Prototype (tappjet-proto.js R map):
//   guest = ink (warm gray), passenger = grape (indigo), driver = brand (teal).
// Primary CTAs stay amber everywhere; role accents drive nav, headers, chips.
//
// Shade rule (prototype `aN`): "on" text uses brand-700 for driver but
// grape-600 for passenger; dark-mode "on" text is always {acc}-300.
// Recipes are shade-asymmetric, hence an explicit class map (not CSS vars) —
// every string is a literal so Tailwind's scanner picks them up (no safelist).

export type UiRole = "guest" | "passenger" | "driver";

export interface RoleTheme {
  /** i18n key under `roles.*` */
  labelKey: string;
  /** lucide icon name used next to the role label */
  icon: "eye" | "user" | "car-front";
  /** role pill: «Гость» / «Пассажир» / «Водитель» */
  badge: string;
  /** bottom-nav active tab background */
  navPillOn: string;
  /** bottom-nav active tab icon/label color */
  navTextOn: string;
  /** accent "on" text (tabs, links) */
  textOn: string;
  /** screen hero header gradient (create, profile) */
  headerGrad: string;
  /** wide banner gradient (profile hero, promos) */
  bannerGrad: string;
  /** filled role CTA (publish/find buttons) */
  ctaFilled: string;
  /** selected date-chip */
  chipSelected: string;
  /** «Гибко» special chip */
  flexChip: string;
  /** leading icons in inputs/fields */
  iconAccent: string;
  /** seats-stepper count text */
  counterText: string;
  /** role-tinted letter avatar */
  avatarTint: string;
  /** active tab underline bar */
  tabUnderline: string;
}

export const ROLE_THEME: Record<UiRole, RoleTheme> = {
  guest: {
    labelKey: "guest",
    icon: "eye",
    badge: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
    navPillOn: "bg-ink-100 dark:bg-ink-800",
    navTextOn: "text-ink-700 dark:text-ink-200",
    textOn: "text-ink-700 dark:text-ink-200",
    headerGrad: "bg-gradient-to-b from-ink-500 to-ink-600",
    bannerGrad: "bg-gradient-to-r from-ink-500 to-ink-600",
    ctaFilled: "bg-ink-700 text-white",
    chipSelected: "bg-ink-700 text-white",
    flexChip: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
    iconAccent: "text-ink-500",
    counterText: "text-ink-700 dark:text-ink-200",
    avatarTint: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
    tabUnderline: "bg-ink-500",
  },
  passenger: {
    labelKey: "passenger",
    icon: "user",
    badge: "bg-grape-100 text-grape-600 dark:bg-grape-500/15 dark:text-grape-300",
    navPillOn: "bg-grape-50 dark:bg-grape-500/15",
    navTextOn: "text-grape-600 dark:text-grape-300",
    textOn: "text-grape-600 dark:text-grape-300",
    headerGrad: "bg-gradient-to-b from-grape-500 to-grape-400",
    bannerGrad: "bg-gradient-to-r from-grape-600 to-grape-500",
    ctaFilled: "bg-grape-500 text-white shadow-indigocta",
    chipSelected: "bg-grape-500 text-white",
    flexChip: "bg-grape-100 text-grape-600 dark:bg-grape-500/15 dark:text-grape-300",
    iconAccent: "text-grape-500",
    counterText: "text-grape-600 dark:text-grape-300",
    avatarTint: "bg-grape-100 text-grape-600 dark:bg-grape-500/20 dark:text-grape-200",
    tabUnderline: "bg-grape-500",
  },
  driver: {
    labelKey: "driver",
    icon: "car-front",
    badge: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    navPillOn: "bg-brand-50 dark:bg-brand-500/15",
    navTextOn: "text-brand-700 dark:text-brand-300",
    textOn: "text-brand-700 dark:text-brand-300",
    headerGrad: "bg-gradient-to-b from-brand-600 to-brand-500",
    bannerGrad: "bg-gradient-to-r from-brand-600 to-brand-500",
    ctaFilled: "bg-brand-600 text-white shadow-brandcta",
    chipSelected: "bg-brand-500 text-white",
    flexChip: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    iconAccent: "text-brand-500",
    counterText: "text-brand-600 dark:text-brand-300",
    avatarTint: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200",
    tabUnderline: "bg-brand-500",
  },
} as const;

// ---------------------------------------------------------------------------
// Deprecated: pre-redesign map, kept so untouched screens compile during the
// screen-by-screen migration. Remove once Phase C lands everywhere.
export const ROLE_COLORS = {
  passenger: {
    navActive:     "text-grape-600",
    navActivePill: "bg-grape-100 text-grape-600",
    avatarRingOn:  "ring-grape-500",
    avatarRingOff: "ring-grape-200 hover:ring-grape-400",
    avatarBgOn:    "bg-grape-500 text-white",
    avatarBgOff:   "bg-grape-100 text-grape-600",
    profileRing:   "ring-grape-500",
  },
  driver: {
    navActive:     "text-brand-600",
    navActivePill: "bg-brand-50 text-brand-700",
    avatarRingOn:  "ring-brand-600",
    avatarRingOff: "ring-brand-200 hover:ring-brand-400",
    avatarBgOn:    "bg-brand-600 text-white",
    avatarBgOff:   "bg-brand-100 text-brand-700",
    profileRing:   "ring-brand-500",
  },
} as const;

export type RoleColors = (typeof ROLE_COLORS)[keyof typeof ROLE_COLORS];
