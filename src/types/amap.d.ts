declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, opts?: Record<string, unknown>);
    setZoomAndCenter(zoom: number, center: [number, number]): void;
    getZoom(): number;
    panTo(center: [number, number]): void;
    resize(): void;
    destroy(): void;
  }

  class Marker {
    constructor(opts?: Record<string, unknown>);
    setMap(map: Map | null): void;
  }

  class CircleMarker {
    constructor(opts?: Record<string, unknown>);
    setCenter(center: [number, number]): void;
    setMap(map: Map | null): void;
  }

  class Circle {
    constructor(opts?: Record<string, unknown>);
    setCenter(center: [number, number]): void;
    setRadius(radius: number): void;
    setMap(map: Map | null): void;
  }

  class Geolocation {
    constructor(opts?: Record<string, unknown>);
    getCurrentPosition(
      callback: (status: string, result: GeolocationResult) => void,
    ): void;
  }

  interface GeolocationResult {
    position: { lat: number; lng: number };
    accuracy: number;
    message?: string;
  }
}
