import type { TelegramAuthData } from "@/lib/api/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: GisIdConfig) => void;
          renderButton: (el: HTMLElement, cfg: GisButtonConfig) => void;
          cancel: () => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (cfg: AppleIdConfig) => void;
        signIn: () => Promise<AppleSignInResponse>;
      };
    };
    Telegram?: {
      Login: {
        auth: (
          opts: { bot_id: number; request_access: string },
          cb: (data: TelegramAuthData | false) => void,
        ) => void;
      };
      WebApp: TelegramWebApp;
    };
  }
}

export interface GisIdConfig {
  client_id: string;
  callback: (r: { credential: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

export interface GisButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  width?: number;
}

export interface AppleIdConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  usePopup: boolean;
}

export interface AppleSignInResponse {
  authorization: { code: string; id_token: string };
}
