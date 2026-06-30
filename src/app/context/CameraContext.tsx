import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { detectBuildingCode } from "../data/buildingOcr";
import { PRE_UNLOCKED_BADGE_IDS, BADGE_DEFS, TOTAL_BADGES } from "../data/stamps";
import { runBuildingOcrOnFile } from "../utils/runBuildingOcr";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read file"));
    r.readAsDataURL(file);
  });
}

export interface CapturedPhoto {
  id: number;
  url: string;
}

const CAMERA_STORAGE_KEY = "unibuddy_camera_v1";

const validBadgeId = (id: unknown): id is number =>
  typeof id === "number" && Number.isInteger(id) && id >= 1 && id <= TOTAL_BADGES;

function loadCameraFromStorage(): { photos: CapturedPhoto[]; unlockedBadgeIds: number[] } {
  if (typeof window === "undefined") {
    return { photos: [], unlockedBadgeIds: [...PRE_UNLOCKED_BADGE_IDS] };
  }
  try {
    const raw = localStorage.getItem(CAMERA_STORAGE_KEY);
    if (!raw) return { photos: [], unlockedBadgeIds: [...PRE_UNLOCKED_BADGE_IDS] };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { photos: [], unlockedBadgeIds: [...PRE_UNLOCKED_BADGE_IDS] };
    }
    const rec = parsed as Record<string, unknown>;

    const photos: CapturedPhoto[] = Array.isArray(rec.photos)
      ? rec.photos.filter(
          (p): p is CapturedPhoto =>
            !!p &&
            typeof p === "object" &&
            typeof (p as CapturedPhoto).id === "number" &&
            typeof (p as CapturedPhoto).url === "string" &&
            (p as CapturedPhoto).url.length > 0
        )
      : [];

    let unlockedBadgeIds: number[] = [...PRE_UNLOCKED_BADGE_IDS];
    const legacyOrNewIds = Array.isArray(rec.unlockedBadgeIds)
      ? rec.unlockedBadgeIds
      : rec.unlockedStampIds;
    if (Array.isArray(legacyOrNewIds)) {
      const ids = legacyOrNewIds.filter(validBadgeId);
      unlockedBadgeIds = [...new Set(ids)].sort((a, b) => a - b);
    }

    return { photos, unlockedBadgeIds };
  } catch {
    return { photos: [], unlockedBadgeIds: [...PRE_UNLOCKED_BADGE_IDS] };
  }
}

function saveCameraToStorage(photos: CapturedPhoto[], unlockedBadgeIds: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify({ photos, unlockedBadgeIds }));
  } catch {
    console.warn("UniBuddy: 无法写入本地缓存（可能超出浏览器存储上限）。");
  }
}

/** 首次挂载只读一次 localStorage，避免 Provider 重渲染时重复解析 */
let initialCameraCache: { photos: CapturedPhoto[]; unlockedBadgeIds: number[] } | null = null;
function getInitialCameraOnce() {
  if (!initialCameraCache) initialCameraCache = loadCameraFromStorage();
  return initialCameraCache;
}

export type CameraUnlockEvent =
  | { id: number; kind: "building"; code: string; grantedBadge: boolean }
  | { id: number; kind: "random" };

interface CameraCtx {
  photos: CapturedPhoto[];
  showCamera: boolean;
  openCamera: () => void;
  closeCamera: () => void;
  addPhotos: (files: File[]) => void;
  removePhoto: (photoId: number) => void;
  unlockedBadgeIds: number[];
  lastUnlockedBadgeId: number | null;
  badgeCheckedCount: number;
  ocrScanning: boolean;
  lastUnlockEvent: CameraUnlockEvent | null;
  dismissUnlockEvent: () => void;
}

const CameraContext = createContext<CameraCtx>({
  photos: [],
  showCamera: false,
  openCamera: () => {},
  closeCamera: () => {},
  addPhotos: () => {},
  removePhoto: () => {},
  unlockedBadgeIds: PRE_UNLOCKED_BADGE_IDS,
  lastUnlockedBadgeId: null,
  badgeCheckedCount: PRE_UNLOCKED_BADGE_IDS.length,
  ocrScanning: false,
  lastUnlockEvent: null,
  dismissUnlockEvent: () => {},
});

export function CameraProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>(() => getInitialCameraOnce().photos);
  const [showCamera, setShowCamera] = useState(false);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<number[]>(() => getInitialCameraOnce().unlockedBadgeIds);
  const [lastUnlockedBadgeId, setLastUnlockedBadgeId] = useState<number | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [lastUnlockEvent, setLastUnlockEvent] = useState<CameraUnlockEvent | null>(null);
  const badgeIdsRef = useRef<number[]>(getInitialCameraOnce().unlockedBadgeIds);
  const nextEventId = useRef(0);

  useEffect(() => {
    badgeIdsRef.current = unlockedBadgeIds;
  }, [unlockedBadgeIds]);

  useEffect(() => {
    saveCameraToStorage(photos, unlockedBadgeIds);
  }, [photos, unlockedBadgeIds]);

  const openCamera = useCallback(() => setShowCamera(true), []);
  const closeCamera = useCallback(() => setShowCamera(false), []);
  const dismissUnlockEvent = useCallback(() => setLastUnlockEvent(null), []);
  const removePhoto = useCallback((photoId: number) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  }, []);

  const addPhotos = useCallback((files: File[]) => {
    if (files.length === 0) return;
    void (async () => {
      setOcrScanning(true);
      try {
        for (const file of files) {
        const url = await readFileAsDataUrl(file);
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), url }]);

        let ocr = "";
        try {
          ocr = await runBuildingOcrOnFile(file);
        } catch {
          ocr = "";
        }
        const building = detectBuildingCode(ocr);
        const eventId = ++nextEventId.current;

        const prevBadges = badgeIdsRef.current;
        let newBadge: number | null = null;
        if (prevBadges.length < TOTAL_BADGES) {
          const locked = BADGE_DEFS.map((s) => s.id).filter((id) => !prevBadges.includes(id));
          if (locked.length) {
            const unlockedId = locked[Math.floor(Math.random() * locked.length)];
            newBadge = unlockedId;
            const next = [...prevBadges, unlockedId].sort((a, b) => a - b);
            badgeIdsRef.current = next;
            setUnlockedBadgeIds(next);
            setLastUnlockedBadgeId(unlockedId);
          }
        }

        if (building) {
          setLastUnlockEvent({
            id: eventId,
            kind: "building",
            code: building,
            grantedBadge: newBadge != null,
          });
        } else if (newBadge != null) {
          setLastUnlockEvent({ id: eventId, kind: "random" });
        }
        }
      } finally {
        setOcrScanning(false);
      }
    })();
  }, []);

  const badgeCheckedCount = unlockedBadgeIds.length;

  return (
    <CameraContext.Provider
      value={{
        photos,
        showCamera,
        openCamera,
        closeCamera,
        addPhotos,
        removePhoto,
        unlockedBadgeIds,
        lastUnlockedBadgeId,
        badgeCheckedCount,
        ocrScanning,
        lastUnlockEvent,
        dismissUnlockEvent,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => useContext(CameraContext);
