import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import type { CitySuggestion } from "@qahal/shared";
import { api } from "../../lib/api";
import { useI18n } from "../../app/i18n";

type SaveState = "idle" | "saving" | "saved" | "error";
type LocationState = "idle" | "requesting" | "granted" | "denied" | "error";

interface CitySearchProps {
  telegramId: number;
  initialValue?: string;
  onCitySelected: (city: CitySuggestion) => void;
}

export const CitySearch = ({
  telegramId,
  initialValue = "",
  onCitySelected,
}: CitySearchProps) => {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialValue);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationErrorMessage, setLocationErrorMessage] = useState<
    string | null
  >(null);
  const hasAutoRequestedLocation = useRef(false);

  const debouncedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      api
        .searchCities(
          debouncedQuery,
          controller.signal,
          userLocation ?? undefined,
        )
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
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [debouncedQuery, userLocation]);

  const requestLocationAccess = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationErrorMessage(t.citySearch.locationUnsupported);
      setLocationState("error");
      return;
    }

    if (!window.isSecureContext) {
      setLocationErrorMessage(t.citySearch.locationHttpsRequired);
      setLocationState("error");
      return;
    }

    setLocationState("requesting");
    setLocationErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationState("granted");
        setLocationErrorMessage(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
          return;
        }

        setLocationErrorMessage(t.citySearch.locationFetchFailed);
        setLocationState("denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, [
    t.citySearch.locationFetchFailed,
    t.citySearch.locationHttpsRequired,
    t.citySearch.locationUnsupported,
  ]);

  useEffect(() => {
    if (hasAutoRequestedLocation.current) {
      return;
    }
    hasAutoRequestedLocation.current = true;

    if (!("geolocation" in navigator)) {
      setLocationErrorMessage(t.citySearch.locationUnsupported);
      setLocationState("error");
      return;
    }

    let cancelled = false;

    if (!("permissions" in navigator)) {
      requestLocationAccess();
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (cancelled) {
          return;
        }

        if (permissionStatus.state === "granted") {
          requestLocationAccess();
          return;
        }

        if (permissionStatus.state === "denied") {
          setLocationState("denied");
          return;
        }

        // "prompt" state: ask immediately when city step opens.
        requestLocationAccess();
      })
      .catch(() => {
        // Fallback for WebViews/browsers where Permissions API is blocked.
        requestLocationAccess();
      });

    return () => {
      cancelled = true;
    };
  }, [requestLocationAccess, t.citySearch.locationUnsupported]);

  const handleSelect = async (value: CitySuggestion | null) => {
    if (!value) {
      return;
    }

    setSelectedCity(value);
    setQuery(value.label);
    setSaveState("saving");

    try {
      await api.saveLocation({
        telegramId,
        city: value.city,
        state: value.state,
        country: value.country,
        latitude: value.latitude,
        longitude: value.longitude,
      });
      onCitySelected(value);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const showEmptyState =
    !loading && debouncedQuery.length >= 2 && suggestions.length === 0;

  return (
    <div className="w-full">
      {locationState !== "granted" ? (
        <button
          type="button"
          onClick={requestLocationAccess}
          disabled={locationState === "requesting"}
          className="mb-3 inline-flex items-center rounded-xl border border-[#C9A46F66] bg-[#E8DDD012] px-3 py-2 text-xs font-semibold text-[#E8DDD0] disabled:opacity-60"
        >
          {locationState === "requesting"
            ? t.citySearch.requestingLocation
            : t.citySearch.requestLocation}
        </button>
      ) : null}

      {locationState === "granted" ? (
        <p className="mb-3 text-xs text-[#9ED7B6]">
          {t.citySearch.locationGranted}
        </p>
      ) : null}
      {locationState === "denied" ? (
        <p className="mb-3 text-xs text-[#F4C58A]">
          {t.citySearch.locationDenied}
        </p>
      ) : null}
      {locationState === "error" ? (
        <p className="mb-3 text-xs text-[#F4A7A7]">
          {locationErrorMessage ?? t.citySearch.locationUnsupported}
        </p>
      ) : null}

      <Combobox value={selectedCity} onChange={handleSelect}>
        <div className="relative">
          <ComboboxInput
            className="h-[52px] w-full rounded-[14px] border border-[#C9A46F33] bg-[#E8DDD00F] px-4 text-[15px] text-[#E8DDD0] outline-none placeholder:text-[#E8DDD07A]"
            displayValue={(item: CitySuggestion | null) => item?.label ?? query}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            name="qahal-city-search"
            // Browsers may ignore autocomplete="off" for text fields; this helps suppress history autofill.
            autoSave="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setSaveState("idle");
              if (selectedCity) {
                setSelectedCity(null);
              }
            }}
            autoFocus
            placeholder={t.common.searchCity}
          />

          <ComboboxOptions className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[#C9A46F40] bg-[#1D1814] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            {loading ? (
              <div className="px-3 py-2 text-sm text-[#E8DDD0B3]">
                {t.common.searchingCities}
              </div>
            ) : null}

            {!loading
              ? suggestions.map((option) => (
                  <ComboboxOption
                    key={`${option.city}-${option.state}-${option.country}-${option.latitude}-${option.longitude}`}
                    value={option}
                    className="group cursor-pointer rounded-xl px-3 py-2 text-sm text-[#E8DDD0] data-[focus]:bg-[#C9A46F1C]"
                  >
                    <div className="font-medium">{option.label}</div>
                  </ComboboxOption>
                ))
              : null}

            {showEmptyState ? (
              <div className="px-3 py-2 text-sm text-[#E8DDD099]">
                {t.common.noMatchingCities}
              </div>
            ) : null}
          </ComboboxOptions>
        </div>
      </Combobox>

      {saveState === "saving" ? (
        <p className="mt-3 text-xs text-[#E8DDD099]">{t.citySearch.saveInProgress}</p>
      ) : null}
      {saveState === "error" ? (
        <p className="mt-3 text-xs text-[#F4A7A7]">
          {t.citySearch.saveFailed}
        </p>
      ) : null}
      {saveState === "saved" && selectedCity ? (
        <div className="mt-3 rounded-xl border border-[#2E7D5B66] bg-[#2E7D5B1F] px-3 py-3">
          <p className="text-sm font-semibold text-[#BFEBD5]">{t.citySearch.saveSuccess}</p>
          <p className="mt-1 text-sm text-[#E8DDD0]">
            {selectedCity.city}, {selectedCity.state}, {selectedCity.country}
          </p>
          <p className="mt-2 text-xs text-[#9ED7B6]">
            {t.citySearch.continueHint}
          </p>
        </div>
      ) : null}
    </div>
  );
};
