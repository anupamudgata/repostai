"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CONTENT_ANGLES, HOOK_MODES, SUPPORTED_LANGUAGES } from "@/config/constants";
import type { OutputLanguage } from "@/types";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";

export function WorkspaceSettingsRail({
  d,
  useNativeBrandVoiceSelect,
  brandVoiceId,
  setBrandVoiceId,
  brandVoices,
  outputLanguage,
  setOutputLanguage,
  contentAngle,
  setContentAngle,
  hookMode,
  setHookMode,
  userIntent,
  setUserIntent,
}: {
  d: DashboardBulk;
  useNativeBrandVoiceSelect: boolean;
  brandVoiceId: string;
  setBrandVoiceId: (v: string) => void;
  brandVoices: { id: string; name: string }[];
  outputLanguage: OutputLanguage;
  setOutputLanguage: (v: OutputLanguage) => void;
  contentAngle: string;
  setContentAngle: (v: string) => void;
  hookMode: string;
  setHookMode: (v: string) => void;
  userIntent: string;
  setUserIntent: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {d.workspaceSettingsTitle}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">{d.brandVoiceCardTitle}</Label>
            {useNativeBrandVoiceSelect ? (
              <select
                id="brand-voice-rail"
                className={cn(
                  "mt-1.5 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm",
                  "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                )}
                value={brandVoiceId || "none"}
                onChange={(e) =>
                  setBrandVoiceId(e.target.value === "none" ? "" : e.target.value)
                }
                aria-label={d.brandVoiceCardTitle}
              >
                <option value="none">{d.noBrandVoice}</option>
                {brandVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            ) : (
              <Select
                value={brandVoiceId || "none"}
                onValueChange={(v) => setBrandVoiceId(v === "none" ? "" : v)}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder={d.noBrandVoice} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{d.noBrandVoice}</SelectItem>
                  {brandVoices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              <Link href="/dashboard/brand-voice" className="font-medium text-primary hover:underline">
                {d.addVoiceLink}
              </Link>{" "}
              {d.addVoiceSuffix}
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{d.outputLanguageTitle}</Label>
            <Select
              value={outputLanguage}
              onValueChange={(v) => setOutputLanguage(v as OutputLanguage)}
            >
              <SelectTrigger className="mt-1.5 w-full min-h-10">
                <SelectValue placeholder={d.selectLanguage} />
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
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {
                d.outputLangHint[
                  outputLanguage as keyof typeof d.outputLangHint
                ]
              }
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{d.presetsTitle}</p>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{d.presetsHint}</p>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {d.contentAngleLabel}
              </p>
              <div className="grid gap-1.5">
                {CONTENT_ANGLES.map((angle) => (
                  <button
                    key={angle.id}
                    type="button"
                    onClick={() => setContentAngle(angle.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
                      contentAngle === angle.id
                        ? "border-primary/50 bg-primary/8"
                        : "border-border/60 hover:bg-muted/50"
                    )}
                  >
                    <span className="font-medium block">{angle.name}</span>
                    <span className="text-muted-foreground line-clamp-2 mt-0.5">
                      {angle.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {d.hookModeLabel}
              </p>
              <div className="grid gap-1.5 max-h-48 overflow-y-auto pr-1">
                {HOOK_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setHookMode(mode.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
                      hookMode === mode.id
                        ? "border-primary/50 bg-primary/8"
                        : "border-border/60 hover:bg-muted/50"
                    )}
                  >
                    <span className="font-medium block">{mode.name}</span>
                    <span className="text-muted-foreground line-clamp-2 mt-0.5">
                      {mode.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{d.intentTitle}</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2 leading-relaxed">
              {d.intentSubtitle}
            </p>
            <Input
              placeholder={d.intentPlaceholder}
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              maxLength={300}
              className="text-sm"
            />
            {userIntent.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {userIntent.length}/300
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
