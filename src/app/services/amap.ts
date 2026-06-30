import AMapLoader from "@amap/amap-jsapi-loader";

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY as string;

let amapPromise: Promise<typeof AMap> | null = null;

export function loadAmap(): Promise<typeof AMap> {
  if (!AMAP_KEY) {
    return Promise.reject(new Error("VITE_AMAP_KEY is not configured"));
  }
  if (!amapPromise) {
    amapPromise = AMapLoader.load({
      key: AMAP_KEY,
      version: "2.0",
      plugins: ["AMap.Geolocation", "AMap.CircleMarker", "AMap.Circle", "AMap.Marker"],
    });
  }
  return amapPromise;
}
