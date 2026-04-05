"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/config/constants";
import type { OutputLanguage } from "@/types";

const LS_KEY = "repostai_default_language";

function readStoredLanguage(): OutputLanguage {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (raw && SUPPORTED_LANGUAGES.some((l) => l.id === raw)) return raw as OutputLanguage;
  } catch { /* ignore */ }
  return "en";
}

export function DefaultOutputLanguageSection() {
  const [value, setValue] = useState<OutputLanguage>(readStoredLanguage);

  return (
    <div className="space-y-2">
      <Label htmlFor="default-output-language">Default output language</Label>
      <Select
        value={value}
        onValueChange={(v) => {
          const id = v as OutputLanguage;
          setValue(id);
          try {
            localStorage.setItem(LS_KEY, id);
          } catch {
            /* ignore */
          }
        }}
      >
        <SelectTrigger id="default-output-language" className="w-full max-w-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.id} value={lang.id} lang={lang.id}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Applied when you open the repurpose studio.
      </p>
    </div>
  );
}
