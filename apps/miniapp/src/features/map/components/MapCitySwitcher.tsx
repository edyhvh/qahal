import { useEffect, useMemo, useState } from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import type { CitySuggestion } from "@qahal/shared";
import { api } from "../../../lib/api";
import { useI18n } from "../../../app/i18n";

interface MapCitySwitcherProps {
  visible: boolean;
  cityName?: string;
  userLocation?: { latitude: number; longitude: number };
  onCitySelected: (city: CitySuggestion) => void;
}

export const MapCitySwitcher = ({ visible, cityName, userLocation, onCitySelected }: MapCitySwitcherProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      if (debouncedQuery.length < 2 || !open) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      api
        .searchCities(debouncedQuery, controller.signal, userLocation)
        .then((res) => {
          setSuggestions(res.suggestions);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }
          setSuggestions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [debouncedQuery, open, userLocation]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSuggestions([]);
      setSelectedCity(null);
    }
  }, [open]);

  if (!visible) {
    return null;
  }

  return (
    <div className="absolute right-4 top-[58px] z-30 flex w-[260px] flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 max-w-full items-center gap-2 self-end rounded-full border px-3 text-sm font-semibold shadow-md"
        style={{
          borderColor: "var(--theme-map-chip-border)",
          background: "var(--theme-map-chip-bg)",
          color: "var(--theme-map-chip-text)",
        }}
      >
        <span className="truncate">{cityName?.trim() || t.map.selectCity}</span>
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div
          className="rounded-2xl border p-2 shadow-lg backdrop-blur"
          style={{
            borderColor: "var(--theme-map-chip-border)",
            background: "var(--theme-map-chip-bg)",
          }}
        >
          <Combobox
            value={selectedCity}
            onChange={(value) => {
              if (!value) {
                return;
              }
              setSelectedCity(value);
              onCitySelected(value);
              setOpen(false);
            }}
          >
            <div className="relative">
              <ComboboxInput
                className="h-10 w-full rounded-xl border px-3 text-sm outline-none placeholder:text-[#9ca3af]"
                style={{
                  borderColor: "var(--theme-map-chip-border)",
                  background: "var(--theme-card-bg)",
                  color: "var(--theme-text-primary)",
                }}
                displayValue={(item: CitySuggestion | null) => item?.label ?? query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (selectedCity) {
                    setSelectedCity(null);
                  }
                }}
                placeholder={t.common.searchCity}
                autoFocus
              />
              <ComboboxOptions
                className="mt-2 max-h-56 overflow-auto rounded-xl border p-1"
                style={{
                  borderColor: "var(--theme-map-chip-border)",
                  background: "var(--theme-card-bg)",
                }}
              >
                {loading ? (
                  <div className="px-2 py-2 text-xs" style={{ color: "var(--theme-text-secondary)" }}>
                    {t.common.searchingCities}
                  </div>
                ) : null}
                {!loading
                  ? suggestions.map((option) => (
                      <ComboboxOption
                        key={`${option.city}-${option.state}-${option.country}-${option.latitude}-${option.longitude}`}
                        value={option}
                        className="cursor-pointer rounded-lg px-2 py-2 text-sm data-[focus]:bg-[#1E5C5A14]"
                        style={{ color: "var(--theme-text-primary)" }}
                      >
                        {option.label}
                      </ComboboxOption>
                    ))
                  : null}
                {!loading && debouncedQuery.length >= 2 && suggestions.length === 0 ? (
                  <div className="px-2 py-2 text-xs" style={{ color: "var(--theme-text-secondary)" }}>
                    {t.common.noMatchingCities}
                  </div>
                ) : null}
              </ComboboxOptions>
            </div>
          </Combobox>
        </div>
      ) : null}
    </div>
  );
};
