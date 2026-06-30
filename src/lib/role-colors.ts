// Role colour language — must match design/design-system.html:
//   passenger = grape, driver = brand (teal). CTA stays amber elsewhere.
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
