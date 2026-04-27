export const ROLE_COLORS = {
  passenger: {
    navActive:     "text-teal-600",
    navActivePill: "bg-teal-50 text-teal-700",
    avatarRingOn:  "ring-teal-600",
    avatarRingOff: "ring-teal-200 hover:ring-teal-400",
    avatarBgOn:    "bg-teal-600 text-white",
    avatarBgOff:   "bg-teal-100 text-teal-700",
    profileRing:   "ring-teal-500",
  },
  driver: {
    navActive:     "text-sky-600",
    navActivePill: "bg-sky-50 text-sky-700",
    avatarRingOn:  "ring-sky-600",
    avatarRingOff: "ring-sky-200 hover:ring-sky-400",
    avatarBgOn:    "bg-sky-600 text-white",
    avatarBgOff:   "bg-sky-100 text-sky-700",
    profileRing:   "ring-sky-500",
  },
} as const;

export type RoleColors = (typeof ROLE_COLORS)[keyof typeof ROLE_COLORS];
