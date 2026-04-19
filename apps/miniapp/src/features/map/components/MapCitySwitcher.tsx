import { useEffect, useMemo, useState } from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import type { CitySuggestion } from "@qahal/shared";
import { api } from "../../../lib/api";

interface MapCitySwitcherProps {
  visible: boolean;
  cityName?: string;
  userLocation?: { latitude: number; longitude: number };
  onCitySelected: (city: CitySuggestion) => void;
}

export const MapCitySwitcher = ({ visible, cityName, userLocation, onCitySelected }: MapCitySwitcherProps) => {
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
    <div className="absolute right-4 top-4 z-30 flex w-[260px] flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 max-w-full items-center gap-2 self-start rounded-full border border-[#d1c7b8] bg-white/95 px-3 text-sm font-semibold text-[#334155] shadow-md"
      >
        <span className="truncate">{cityName?.trim() || "Select city"}</span>
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="rounded-2xl border border-[#d1c7b8] bg-white/95 p-2 shadow-lg backdrop-blur">
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
                className="h-10 w-full rounded-xl border border-[#d1c7b8] bg-white px-3 text-sm text-[#1f2937] outline-none placeholder:text-[#9ca3af]"
                displayValue={(item: CitySuggestion | null) => item?.label ?? query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (selectedCity) {
                    setSelectedCity(null);
                  }
                }}
                placeholder="Search city..."
                autoFocus
              />
              <ComboboxOptions className="mt-2 max-h-56 overflow-auto rounded-xl border border-[#e5e7eb] bg-white p-1">
                {loading ? <div className="px-2 py-2 text-xs text-[#6b7280]">Searching cities...</div> : null}
                {!loading
                  ? suggestions.map((option) => (
                      <ComboboxOption
                        key={`${option.city}-${option.state}-${option.country}-${option.latitude}-${option.longitude}`}
                        value={option}
                        className="cursor-pointer rounded-lg px-2 py-2 text-sm text-[#1f2937] data-[focus]:bg-[#1E5C5A14]"
                      >
                        {option.label}
                      </ComboboxOption>
                    ))
                  : null}
                {!loading && debouncedQuery.length >= 2 && suggestions.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-[#6b7280]">No matching cities found.</div>
                ) : null}
              </ComboboxOptions>
            </div>
          </Combobox>
        </div>
      ) : null}
    </div>
  );
};
