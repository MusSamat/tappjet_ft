import { io, type Socket } from "socket.io-client";
import { getAccessToken, refreshAccessToken } from "@/lib/api/client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? "";
    socket = io(url, {
      transports: ["websocket"],
      auth: { token: getAccessToken() },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      reconnectionAttempts: Infinity,
      autoConnect: false,
    });

    // Backend restart or expired token causes auth_required/auth_failed.
    // Refresh the access token silently and let the next reconnect use it.
    socket.on("connect_error", (err) => {
      const msg = (err as Error).message;
      if (msg === "auth_required" || msg === "auth_failed") {
        refreshAccessToken()
          .then(() => {
            if (socket) socket.auth = { token: getAccessToken() };
          })
          .catch(() => {
            // refresh failed — API interceptor will redirect to login
          });
      }
    });
  }
  // Always stamp the current token — covers the case where the socket was
  // created before auth completed, or after an access-token refresh.
  socket.auth = { token: getAccessToken() };
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Call this whenever a new access token is obtained (bootstrap + silent refresh).
export function refreshSocketAuth() {
  if (!socket) return;
  socket.auth = { token: getAccessToken() };
  // Disconnect unconditionally — the reconnect will use the new token.
  socket.disconnect().connect();
}
