"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/contexts/i18n-provider";
import { LOCALES, type Locale } from "@/lib/i18n/config";

type Props = {
  variant?: "default" | "compact";
};

export function LanguageSwitcher({ variant = "default" }: Props) {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            variant === "compact"
              ? "h-9 gap-1.5 px-2 shrink-0 font-medium"
              : "gap-2"
          }
          aria-label={t("language.label")}
        >
          <Languages className="h-4 w-4 shrink-0" />
          <span className="text-xs sm:text-sm text-muted-foreground tabular-nums min-w-[1.75rem]">
            {locale === "hi" ? "हि" : "EN"}
          </span>
          {variant === "default" && (
            <span className="hidden md:inline text-muted-foreground text-sm border-l pl-2 ml-0.5">
              {locale === "hi" ? t("language.hi") : t("language.en")}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(v) => setLocale(v as Locale)}
        >
          {LOCALES.map((loc) => (
            <DropdownMenuRadioItem key={loc} value={loc}>
              {loc === "hi" ? t("language.hi") : t("language.en")}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
