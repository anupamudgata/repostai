"use client";

import { useMemo } from "react";
import { toast as sonnerToast } from "sonner";
import { useI18n } from "@/contexts/i18n-provider";

type Params = Record<string, string | number>;

export function useAppToast() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      success: (key: string, params?: Params) =>
        sonnerToast.success(t(key, params)),
      error: (key: string, params?: Params) =>
        sonnerToast.error(t(key, params)),
      info: (key: string, params?: Params) =>
        sonnerToast.info(t(key, params)),
      errorFromApi: (
        payload: { error?: string; code?: string },
        fallbackKey = "toast.genericError"
      ) => {
        const { error: msg, code } = payload;
        if (code) {
          const k = `errors.codes.${code}`;
          const tr = t(k);
          if (tr !== k) {
            sonnerToast.error(tr);
            return;
          }
        }
        if (msg) {
          sonnerToast.error(msg);
          return;
        }
        sonnerToast.error(t(fallbackKey));
      },
    }),
    [t]
  );
}
