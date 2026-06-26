"use client";

import { useEffect, useRef } from "react";
import { useAdminAuth, getStoredAdminInfo } from "@/store/admin-auth";
import { doAdminRefresh } from "@/lib/api/admin";

/**
 * Mounted once in admin layout. On every page load, restores the admin access
 * token via the HttpOnly refresh cookie so the session survives reloads. The
 * stored admin profile acts as a non-sensitive "was logged in" hint.
 */
export function AdminAuthBootstrap() {
  const { hydrateAdmin, clearSession } = useAdminAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (!getStoredAdminInfo()) {
      clearSession();
      return;
    }

    doAdminRefresh()
      .then((r) => {
        const adminInfo = getStoredAdminInfo();
        if (!adminInfo) {
          clearSession();
          return;
        }
        hydrateAdmin(r.accessToken, adminInfo, Date.now() + r.accessTokenExpiresIn * 1000);
      })
      .catch(() => clearSession());
  }, [hydrateAdmin, clearSession]);

  return null;
}
