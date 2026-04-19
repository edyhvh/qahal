import { useMemo } from "react";
import { AppRoot, Cell, List, Placeholder, Section } from "@telegram-apps/telegram-ui";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { getTelegramWebApp } from "./lib/telegram";

const defaultCenter: [number, number] = [31.7683, 35.2137];

export default function App() {
  const initDataState = useMemo(() => {
    const webApp = getTelegramWebApp();
    return webApp?.initData ? "present" : "missing";
  }, []);

  return (
    <AppRoot>
      <div className="min-h-full bg-[var(--tgui--bg_color)] p-4">
        <List>
          <Section header="Qahal" footer="Base shell ready for Paper screen integration.">
            <Cell subtitle="Telegram initData status">{initDataState}</Cell>
          </Section>

          <Section header="Map Base" footer="Leaflet baseline for feature integration.">
            <div className="h-[320px] overflow-hidden rounded-xl">
              <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={defaultCenter} />
              </MapContainer>
            </div>
          </Section>

          <Placeholder
            header="Paper to Code"
            description="Map each MCP Paper artboard into a feature screen and reusable components."
          />
        </List>
      </div>
    </AppRoot>
  );
}
