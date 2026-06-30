import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { PhoneShell, StatusBar, ComicCard } from "./PhoneShell";
import { IconNavigation, IconChevronRight as IconArrow, IconRoute } from "./ComicIcons";
import { useLanguage } from "../context/LanguageContext";
import { useCamera } from "../context/CameraContext";
import { campusMapHotspots, type CampusMapHotspotId } from "../data/campusMapHotspots";
import { campusWalkAdjacency, shortestCampusWalkPath } from "../data/campusWalkGraph";
import { ImageZoomLightbox } from "./ImageZoomLightbox";

const MASCOT_VOICE_STORAGE_KEY = "unibuddy.mascot.voiceUri";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type GuidedTourPoint = { id: string; label: string; x?: number; y?: number };

function normalizeGuidedTourPoints(points: GuidedTourPoint[]): Array<{ id: string; label: string; x: number; y: number }> {
  return points
    .map((p) => {
      const pin = campusMapHotspots.find((h) => h.id === p.id);
      const x = typeof p.x === "number" ? p.x : pin?.x;
      const y = typeof p.y === "number" ? p.y : pin?.y;
      if (typeof x !== "number" || typeof y !== "number") return null;
      return {
        id: p.id,
        label: p.label || pin?.label || p.id.toUpperCase(),
        x,
        y,
      };
    })
    .filter(Boolean) as Array<{ id: string; label: string; x: number; y: number }>;
}

type MapTabKey = "map" | "live";
type CampusConvenienceItem = { titleKey: string; icon: string; locationsKey: string; hotspotIds: CampusMapHotspotId[] };
type GuidedTourPayload = { title: string; subtitle?: string; points: GuidedTourPoint[] };

function isGuidedTourPayload(value: unknown): value is GuidedTourPayload {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<GuidedTourPayload>;
  return typeof maybe.title === "string" && Array.isArray(maybe.points);
}

const campusConvenienceItems: CampusConvenienceItem[] = [
  {
    titleKey: "map_convenience_onestop",
    icon: "🏢",
    locationsKey: "map_convenience_onestop_locs",
    hotspotIds: ["cb"],
  },
  {
    titleKey: "map_convenience_sanitary",
    icon: "🧴",
    locationsKey: "map_convenience_sanitary_locs",
    hotspotIds: ["fb", "sa", "sb", "sc", "sd", "ir", "bs"],
  },
  {
    titleKey: "map_convenience_umbrella",
    icon: "☂️",
    locationsKey: "map_convenience_umbrella_locs",
    hotspotIds: ["cb"],
  },
  {
    titleKey: "map_convenience_smoking",
    icon: "🚬",
    locationsKey: "map_convenience_smoking_locs",
    hotspotIds: ["cb", "fb"],
  },
  {
    titleKey: "map_convenience_lockers",
    icon: "📦",
    locationsKey: "map_convenience_lockers_locs",
    hotspotIds: ["fb", "cb", "eb", "ir", "hs", "db", "bs"],
  },
];

interface CampusLocationInfo {
  type: string;
  title: string;
  subtitle: string;
  desc: string;
  story: string;
  tags: string[];
  bestFor: string;
}

const campusLocationInfo: Record<string, CampusLocationInfo> = {
  ls: {
    type: "📍 North campus",
    title: "Life Sciences Building",
    subtitle: "Life Sciences",
    desc: "A seven-storey hub for industry-integrated education, combining authentic industrial scenarios with immersive virtual teaching environments.",
    story: "The LS building is divided into the north building and the south building. LSS is the south building and LSN is the north building.",
    tags: ["Lab", "North Campus", "Science"],
    bestFor: "Students in pharmacy and statistics",
  },
  fb: {
    type: "📍 Central campus",
    title: "Foundation Building",
    subtitle: "Foundation Building",
    desc: "A core facility supporting undergraduate general education and foundational discipline teaching, and a major venue for EAP classes.",
    story: "FB offers many small classrooms and open discussion areas. The ground floor also houses a convenience store and a Subway.",
    tags: ["Teaching", "Core Courses", "Landmark"],
    bestFor: "New students · foundational courses (EAP, maths, clubs & societies)",
  },
  cb: {
    type: "📍 Landmark",
    title: "Central Building",
    subtitle: "Central Building",
    desc: "As the campus core functional zone, it brings together career development services, academic support, and student leisure.",
    story: "The library floors provide study desks, and the building includes key student services such as counselling, IT helpdesk, career center, and one-stop service.",
    tags: ["Iconic", "Campus Story", "Photo Spot"],
    bestFor: "Visitors, self-study",
  },
  sa: {
    type: "📍 Science cluster",
    title: "Science Building A",
    subtitle: "Science A",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For rooms on the first floor, the west entrance (facing CB) is more direct. The east entrance leads directly to elevators.",
    tags: ["Science", "Cluster A"],
    bestFor: "STEM courses and lab classes",
  },
  sb: {
    type: "📍 Science cluster",
    title: "Science Building B",
    subtitle: "Science B",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For first-floor rooms, the east entrance (facing North Foundation) is more direct. The west entrance leads to elevators.",
    tags: ["Science", "Cluster B"],
    bestFor: "STEM courses and lab classes",
  },
  sc: {
    type: "📍 Science cluster",
    title: "Science Building C",
    subtitle: "Science C",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For first-floor rooms, enter from the west side facing CB. The east entrance connects more directly to elevators.",
    tags: ["Science", "Cluster C"],
    bestFor: "STEM courses and lab classes",
  },
  sd: {
    type: "📍 Science cluster",
    title: "Science Building D",
    subtitle: "Science D",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For first-floor rooms, the east entrance (towards North Foundation) is usually easier. The west entrance leads to elevators.",
    tags: ["Science", "Cluster D"],
    bestFor: "STEM courses and lab classes",
  },
  pb: {
    type: "📍 Public services",
    title: "Public Building",
    subtitle: "Public Building",
    desc: "Functions as a central academic facility featuring large-capacity lecture theatres, classrooms, offices, and meeting rooms.",
    story: "The entrance is located on the east side, adjacent to the shop.",
    tags: ["Public", "Events", "Services"],
    bestFor: "Pharmacy students",
  },
  ma: {
    type: "📍 Mathematics",
    title: "Mathematics Building A",
    subtitle: "Mathematics A",
    desc: "Contains offices, classrooms, and lecture theatres, primarily supporting the School of Mathematics and Physics.",
    story: "MA and MB are interconnected, allowing access to the other building from every floor.",
    tags: ["Math", "Academic"],
    bestFor: "Science school students",
  },
  mb: {
    type: "📍 Mathematics",
    title: "Mathematics Building B",
    subtitle: "Mathematics B",
    desc: "Contains offices, classrooms, and lecture theatres, primarily supporting the School of Mathematics and Physics.",
    story: "MA and MB are interconnected, allowing access to the other building from every floor.",
    tags: ["Math", "Academic"],
    bestFor: "Science school students",
  },
  ee: {
    type: "📍 Engineering",
    title: "Electrical & Electronic Engineering",
    subtitle: "EEE Building",
    desc: "Features engineering laboratories, classrooms, and lecture halls, serving as a primary facility for the School of Advanced Technology.",
    story: "EE and EB are connected. Transit to the adjacent building is available on specific floors.",
    tags: ["EEE", "Lab", "Innovation"],
    bestFor: "Engineering students and lab classes",
  },
  eb: {
    type: "📍 Engineering",
    title: "Engineering Building",
    subtitle: "Engineering Building",
    desc: "Provides classrooms and lecture theatres alongside specialized studios for Civil Engineering and Industrial Design.",
    story: "EE and EB are connected. Transit to the adjacent building is available on specific floors.",
    tags: ["Engineering", "Project-based"],
    bestFor: "Engineering students and lab classes",
  },
  ir: {
    type: "📍 South Campus",
    title: "International Research Centre",
    subtitle: "International Research Centre",
    desc: "A functional building for scientific cooperation and international exchange, often used by research groups and visiting scholars.",
    story: "The entrance is located on the east-south side, near the right side of the underground passage.",
    tags: ["Research", "International"],
    bestFor: "Academic visits and exchange",
  },
  ia: {
    type: "📍 South Campus",
    title: "International Academic Exchange & Collaboration Centre",
    subtitle: "International Academic Exchange",
    desc: "An important venue for hosting conferences, receptions, and cross-cultural academic activities.",
    story: "The entrance is located on the west-south side, near the left side of the underground passage.",
    tags: ["Conference", "Bilingual", "Guests"],
    bestFor: "International visitors and conference hosting",
  },
  hs: {
    type: "📍 South Campus",
    title: "Humanities & Social Sciences Building",
    subtitle: "Humanities & Social Sciences",
    desc: "A key humanities teaching area with seminar-style spaces and social science learning support.",
    story: "This area often hosts reading clubs and debate activities.",
    tags: ["Humanities", "Seminar", "Culture"],
    bestFor: "Humanities and social sciences courses",
  },
  es: {
    type: "📍 South Campus",
    title: "Emerging & Interdisciplinary Sciences Building",
    subtitle: "Emerging & Interdisciplinary Science",
    desc: "An interdisciplinary exploration space emphasizing cross-disciplinary collaboration.",
    story: "The entrance is located on the east-north side.",
    tags: ["Interdisciplinary", "Future"],
    bestFor: "Environmental science and industrial design students",
  },
  db: {
    type: "📍 South Campus",
    title: "Design Building",
    subtitle: "Design Building",
    desc: "Workshops, exhibition areas, and review spaces for design-major students.",
    story: "The entrance is on the west-north side, behind HS.",
    tags: ["Design", "Studio", "Exhibition"],
    bestFor: "Architecture majors and portfolio showcases",
  },
  bs: {
    type: "📍 South Campus",
    title: "International Business School Suzhou",
    subtitle: "IBSS at XJTLU",
    desc: "A key building for business education and case teaching, connecting industry practice with international curricula.",
    story: "Main entrance is on the east side; north and south entries are also available.",
    tags: ["Business", "Case Study", "Career"],
    bestFor: "Business students and career exploration",
  },
  as: {
    type: "📍 South Campus",
    title: "Film & Creative Technology",
    subtitle: "Film and Creative Technology Building",
    desc: "A practical teaching space integrating film, creativity, and technology for media-related majors.",
    story: "The entrance is located on the east-south side, behind IR.",
    tags: ["Media", "Creative", "Studio"],
    bestFor: "Arts majors and film screenings",
  },
  gym: {
    type: "🎮 South Campus",
    title: "Gymnasium",
    subtitle: "GYM",
    desc: "A large indoor sports and event venue, supporting campus sports culture and collective activities.",
    story: "Entrances are available on both west and east sides.",
    tags: ["Sports", "Events", "Wellness"],
    bestFor: "Exercise and sports event viewing",
  },
};

const campusLocationInfoZh: Record<string, CampusLocationInfo> = {
  ls: {
    type: "📍 北校区",
    title: "生命科学楼",
    subtitle: "生命科学楼",
    desc: "一座七层教学与科研综合楼，融合真实产业场景与沉浸式虚拟教学环境。",
    story: "LS 由南北两栋组成，LSS 为南楼，LSN 为北楼。",
    tags: ["实验室", "北校区", "科学"],
    bestFor: "药学院和统计方向的学生",
  },
  fb: {
    type: "📍 校园中心",
    title: "基础楼",
    subtitle: "基础楼",
    desc: "本科通识与基础课程的重要教学楼，也是 EAP 课程主要上课地点之一。",
    story: "FB 内有大量小教室与开放讨论区，一层设有便利店与 Subway。",
    tags: ["教学", "基础课程", "地标"],
    bestFor: "新生 · 基础课（EAP、数学课、社团活动）",
  },
  cb: {
    type: "📍 地标建筑",
    title: "中心楼",
    subtitle: "中心楼",
    desc: "校园核心功能区，汇集学习支持、职业发展与学生服务资源。",
    story: "图书馆楼层提供自习空间，楼内还有心理咨询、IT 帮助台、就业中心等服务。",
    tags: ["地标", "校园故事", "拍照点"],
    bestFor: "来访者，自习",
  },
  sa: {
    type: "📍 理科组团",
    title: "理科楼 A",
    subtitle: "理科楼 A",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "一层教室建议从西门（朝向 CB）进入更近，东门可直达电梯。",
    tags: ["理科", "A 组团"],
    bestFor: "理工课程与实验课",
  },
  sb: {
    type: "📍 理科组团",
    title: "理科楼 B",
    subtitle: "理科楼 B",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "去一层教室从东门（朝向北校区基础楼）更方便，西门更靠近电梯。",
    tags: ["理科", "B 组团"],
    bestFor: "理工课程与实验课",
  },
  sc: {
    type: "📍 理科组团",
    title: "理科楼 C",
    subtitle: "理科楼 C",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "一层教室建议从西侧（朝 CB）进入，东侧入口更靠近电梯。",
    tags: ["理科", "C 组团"],
    bestFor: "理工课程与实验课",
  },
  sd: {
    type: "📍 理科组团",
    title: "理科楼 D",
    subtitle: "理科楼 D",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "一层教室通常从东门（朝北基础楼）更便捷，西门可到电梯。",
    tags: ["理科", "D 组团"],
    bestFor: "理工课程与实验课",
  },
  pb: {
    type: "📍 公共服务区",
    title: "公共楼",
    subtitle: "公共楼",
    desc: "校园公共教学核心设施，设有大教室、普通教室、办公室与会议空间。",
    story: "主要入口位于东侧，临近商店区域。",
    tags: ["公共", "活动", "服务"],
    bestFor: "药学院学生",
  },
  ma: {
    type: "📍 数学组团",
    title: "数学楼 A",
    subtitle: "数学楼 A",
    desc: "包含办公室、教室与阶梯教室，主要服务数学与物理相关教学。",
    story: "MA 与 MB 楼层互通，可在各层前往相邻楼栋。",
    tags: ["数学", "学术"],
    bestFor: "理学院学生",
  },
  mb: {
    type: "📍 数学组团",
    title: "数学楼 B",
    subtitle: "数学楼 B",
    desc: "包含办公室、教室与阶梯教室，主要服务数学与物理相关教学。",
    story: "MA 与 MB 楼层互通，可在各层前往相邻楼栋。",
    tags: ["数学", "学术"],
    bestFor: "理学院学生",
  },
  ee: {
    type: "📍 工程组团",
    title: "电气与电子工程楼",
    subtitle: "EEE 楼",
    desc: "配备工程实验室、教室与报告厅，是先进技术学院的重要教学楼。",
    story: "EE 与 EB 在部分楼层连通，可在楼内换楼。",
    tags: ["电子电气", "实验", "创新"],
    bestFor: "工程学院学生与实验课",
  },
  eb: {
    type: "📍 工程组团",
    title: "工程楼",
    subtitle: "工程楼",
    desc: "提供教室与阶梯教室，同时设有土木工程与工业设计专业空间。",
    story: "EE 与 EB 在部分楼层互通，可在楼内换楼。",
    tags: ["工程", "项目制"],
    bestFor: "工程学院学生与实验课",
  },
  ir: {
    type: "📍 南校区",
    title: "国际科研中心",
    subtitle: "国际科研中心",
    desc: "面向科研合作与国际交流的综合功能楼，常用于研究团队与学术访问活动。",
    story: "入口位于东南侧，靠近地下通道右侧。",
    tags: ["科研", "国际"],
    bestFor: "学术参访与交流",
  },
  ia: {
    type: "📍 南校区",
    title: "国际学术交流与协作中心",
    subtitle: "国际学术交流中心",
    desc: "举办会议、接待与跨文化学术活动的重要场地。",
    story: "入口位于西南侧，靠近地下通道左侧。",
    tags: ["会议", "双语", "接待"],
    bestFor: "国际访客与会议接待",
  },
  hs: {
    type: "📍 南校区",
    title: "人文与社会科学楼",
    subtitle: "人文社科楼",
    desc: "人文类教学与讨论空间集中区域，支持研讨式课堂与社科学习。",
    story: "这里常举办读书会、辩论与人文活动。",
    tags: ["人文", "研讨", "文化"],
    bestFor: "人文社科课程",
  },
  es: {
    type: "📍 南校区",
    title: "新兴与交叉科学楼",
    subtitle: "新兴交叉科学楼",
    desc: "强调跨学科协作与创新探索的教学科研空间。",
    story: "入口位于建筑东北侧。",
    tags: ["交叉学科", "未来方向"],
    bestFor: "环科和工业设计学生",
  },
  db: {
    type: "📍 南校区",
    title: "设计楼",
    subtitle: "设计楼",
    desc: "提供设计专业所需的工作坊、展示区与评图空间。",
    story: "入口位于西北侧，靠近 HS 后方。",
    tags: ["设计", "工作室", "展览"],
    bestFor: "建筑专业与作品展示",
  },
  bs: {
    type: "📍 南校区",
    title: "西浦国际商学院",
    subtitle: "IBSS",
    desc: "商科教育核心楼宇，连接案例教学、国际课程与行业实践。",
    story: "主入口在东侧，北侧与南侧也可进入。",
    tags: ["商科", "案例教学", "职业发展"],
    bestFor: "商科学生与职业探索活动",
  },
  as: {
    type: "📍 南校区",
    title: "影视与创意理科楼",
    subtitle: "影视创意理科楼",
    desc: "融合影视、创意与技术的实践教学空间，服务媒体相关专业。",
    story: "入口位于东南侧，靠近 IR 后方。",
    tags: ["媒体", "创意", "工作室"],
    bestFor: "艺术专业学生，电影观赏",
  },
  gym: {
    type: "🎮 南校区",
    title: "体育馆",
    subtitle: "GYM",
    desc: "大型室内体育与活动场馆，支撑校园体育文化与集体活动。",
    story: "东西两侧均设有入口。",
    tags: ["运动", "活动", "健康"],
    bestFor: "运动锻炼与赛事观赛",
  },
};

export function PicturesAndMapScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggle, t } = useLanguage();
  const { openBadgeCollection } = useCamera();
  const [mapTab, setMapTab] = useState<MapTabKey>("map");
  const [activeHotspotId, setActiveHotspotId] = useState("cb");
  const [locationStatus, setLocationStatus] = useState("");
  const [showGuidedNotice, setShowGuidedNotice] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(MASCOT_VOICE_STORAGE_KEY) ?? "";
  });

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const leafletHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const firstFixRef = useRef(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const stampSectionRef = useRef<HTMLDivElement>(null);
  const guidedNoticeShownRef = useRef(false);

  const [mascotGuideOpen, setMascotGuideOpen] = useState(false);
  const guidedTour = isGuidedTourPayload((location.state as { guidedTour?: unknown } | null)?.guidedTour)
    ? (location.state as { guidedTour: GuidedTourPayload }).guidedTour
    : null;

  const mapCopy =
    lang === "zh"
      ? {
          clickHint: "点击地图点位查看简介",
          notReady: "该点位简介暂未配置",
          mascotOpen: "打开校园讲解员",
          mascotClose: "收起讲解员",
          mascotVoiceHint: "点击听语音导览",
          listenAgain: "重新朗读",
          stopSpeak: "停止朗读",
          voiceLabel: "讲解员音色",
          voiceDefault: "跟随系统默认",
          speechTip: "语音由浏览器朗读，可随时点「停止」。音色因设备而异。",
          startLocating: "点击“开始定位”获取实时位置",
          locating: "正在获取当前位置...",
          locatingWithAccuracy: (meters: number) => `实时定位中，精度约 ${meters} 米`,
          stopLocating: "已停止定位",
          switchedBack: "已切换回校园地图",
          browserUnsupported: "当前浏览器不支持定位功能",
          permissionDenied: "定位权限被拒绝，请在浏览器中允许定位",
          signalUnavailable: "位置信号不可用，请稍后重试",
          timeout: "定位超时，请在室外或网络更稳定环境重试",
          locationUnknown: "无法获取实时位置",
          startButton: "开始定位",
          stopButton: "停止定位",
          bestFor: "适合",
          guidedTag: "路线导览",
          guidedExit: "退出导览",
          guidedSteps: "站点顺序",
          guidedHint: "已按所选路线在地图上连线展示",
          guidedNotice: "导览路线已生成，请通过校园地图查看。",
          liveTip: "地图数据来自 OpenStreetMap，定位需浏览器授权且建议在 HTTPS 环境使用。",
        }
      : {
          clickHint: "Tap a map pin to view details",
          notReady: "Description for this spot is not ready yet",
          mascotOpen: "Open campus guide",
          mascotClose: "Hide guide",
          mascotVoiceHint: "Tap for voice tour",
          listenAgain: "Read again",
          stopSpeak: "Stop",
          voiceLabel: "Guide voice",
          voiceDefault: "Use system default",
          speechTip: "Uses your browser’s text-to-speech. Tap Stop anytime. Voice varies by device.",
          startLocating: 'Tap "Start" to get live location',
          locating: "Getting your current location...",
          locatingWithAccuracy: (meters: number) => `Live tracking, accuracy about ${meters} m`,
          stopLocating: "Location tracking stopped",
          switchedBack: "Switched back to campus map",
          browserUnsupported: "Geolocation is not supported by this browser",
          permissionDenied: "Location permission denied. Please allow location access",
          signalUnavailable: "Location signal unavailable. Please retry",
          timeout: "Location request timed out. Try better network/open area",
          locationUnknown: "Unable to get live location",
          startButton: "Start",
          stopButton: "Stop",
          bestFor: "Best for",
          guidedTag: "Guided Tour",
          guidedExit: "Exit",
          guidedSteps: "Stops",
          guidedHint: "Selected stops are connected on the map",
          guidedNotice: "The guided route is ready. Please view it on the campus map.",
          liveTip: "Map data is provided by OpenStreetMap. Browser permission and HTTPS are recommended.",
        };

  useEffect(() => {
    const openStamps = () => {
      openBadgeCollection();
    };
    window.addEventListener("unibuddy-scroll-stamps", openStamps);
    return () => window.removeEventListener("unibuddy-scroll-stamps", openStamps);
  }, [openBadgeCollection]);

  const activeLocation =
    (lang === "zh" ? campusLocationInfoZh : campusLocationInfo)[activeHotspotId] ??
    campusLocationInfo[activeHotspotId];
  const guidedPoints = guidedTour ? normalizeGuidedTourPoints(guidedTour.points) : [];
  const guidedWalkAdj = campusWalkAdjacency();
  const guidedPolyline = (() => {
    if (guidedPoints.length < 2) return "";
    const polylinePts: Array<{ x: number; y: number }> = [{ x: guidedPoints[0].x, y: guidedPoints[0].y }];
    for (let i = 0; i < guidedPoints.length - 1; i++) {
      const from = guidedPoints[i];
      const to = guidedPoints[i + 1];
      const graphRoute =
        guidedWalkAdj.has(from.id) && guidedWalkAdj.has(to.id)
          ? shortestCampusWalkPath(from.id, to.id)
          : null;
      if (graphRoute?.path.length) {
        const graphCoords = graphRoute.path
          .map((nid) => campusMapHotspots.find((h) => h.id === nid))
          .filter((p): p is (typeof campusMapHotspots)[number] => Boolean(p))
          .map((p) => ({ x: p.x, y: p.y }));
        for (let j = 1; j < graphCoords.length; j++) polylinePts.push(graphCoords[j]);
      } else {
        polylinePts.push({ x: to.x, y: to.y });
      }
    }
    return polylinePts.map((p) => `${p.x},${p.y}`).join(" ");
  })();

  useEffect(() => {
    if (!guidedPoints.length || guidedNoticeShownRef.current) return;
    guidedNoticeShownRef.current = true;
    setMapTab("map");
    setActiveHotspotId(guidedPoints[0].id);
    setShowGuidedNotice(true);
    window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [guidedPoints]);

  const bodeSrc = `${import.meta.env.BASE_URL}bode.png`;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const syncVoices = () => {
      setAvailableVoices(synth.getVoices());
    };
    syncVoices();
    synth.addEventListener("voiceschanged", syncVoices);
    return () => {
      synth.removeEventListener("voiceschanged", syncVoices);
    };
  }, []);

  useEffect(() => {
    if (!selectedVoiceURI) return;
    if (!availableVoices.some((voice) => voice.voiceURI === selectedVoiceURI)) {
      setSelectedVoiceURI("");
    }
  }, [availableVoices, selectedVoiceURI]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedVoiceURI) {
      window.localStorage.removeItem(MASCOT_VOICE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(MASCOT_VOICE_STORAGE_KEY, selectedVoiceURI);
  }, [selectedVoiceURI]);

  const speakBuildingIntro = () => {
    if (!activeLocation) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const bestLine =
      activeLocation.bestFor?.trim() &&
      (lang === "zh"
        ? `${mapCopy.bestFor}：${activeLocation.bestFor}`
        : `${mapCopy.bestFor}: ${activeLocation.bestFor}`);
    const parts = [activeLocation.title, activeLocation.desc, activeLocation.story, bestLine].filter(Boolean) as string[];
    const text = parts.join(lang === "zh" ? "。" : ". ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "zh" ? "zh-CN" : "en-US";
    u.rate = 0.92;
    const selectedVoice = availableVoices.find((voice) => voice.voiceURI === selectedVoiceURI);
    if (selectedVoice) {
      u.voice = selectedVoice;
    }
    speechSynthesis.speak(u);
  };

  const stopBuildingSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    stopBuildingSpeech();
    setMascotGuideOpen(false);
  }, [activeHotspotId]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const XJTLU_CENTER: [number, number] = [31.2718, 120.7415];
  const LIVE_MAP_DEFAULT_ZOOM = 15;
  const LIVE_MAP_MAX_ZOOM = 18;

  useEffect(() => {
    setLocationStatus(mapCopy.startLocating);
  }, [mapCopy.startLocating]);

  const ensureLeafletMap = () => {
    if (leafletMapRef.current) return leafletMapRef.current;
    if (!leafletHostRef.current) return null;

    const map = L.map(leafletHostRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      minZoom: 13,
      maxZoom: LIVE_MAP_MAX_ZOOM,
    }).setView(XJTLU_CENTER, LIVE_MAP_DEFAULT_ZOOM);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: LIVE_MAP_MAX_ZOOM,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker(XJTLU_CENTER).addTo(map).bindPopup("XJTLU");
    leafletMapRef.current = map;
    return map;
  };

  const stopTracking = (message = mapCopy.stopLocating) => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    firstFixRef.current = false;
    setLocationStatus(message);
  };

  const destroyLeafletMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    userMarkerRef.current = null;
    accuracyCircleRef.current = null;
    leafletHostRef.current = null;
  };

  const resetLiveMapView = () => {
    const map = ensureLeafletMap();
    if (!map) return;
    map.setView(XJTLU_CENTER, LIVE_MAP_DEFAULT_ZOOM, { animate: false });
  };

  const updateUserPosition = (lat: number, lng: number, accuracy: number) => {
    const map = leafletMapRef.current;
    if (!map) return;

    const acc = Math.max(Number(accuracy) || 0, 5);
    if (userMarkerRef.current && accuracyCircleRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setRadius(acc);
    } else {
      userMarkerRef.current = L.circleMarker([lat, lng], {
        radius: 7,
        color: "#17316f",
        fillColor: "#5aa6ff",
        fillOpacity: 0.95,
        weight: 2,
      }).addTo(map);
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: acc,
        color: "#5aa6ff",
        fillColor: "#5aa6ff",
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(map);
    }

    if (!firstFixRef.current) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16));
      firstFixRef.current = true;
    } else {
      map.panTo([lat, lng], { animate: false });
    }
    setLocationStatus(mapCopy.locatingWithAccuracy(Math.round(acc)));
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationStatus(mapCopy.browserUnsupported);
      return;
    }

    const map = ensureLeafletMap();
    if (!map) return;
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    firstFixRef.current = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        updateUserPosition(latitude, longitude, accuracy);
      },
      (err) => {
        const status =
          err.code === 1
            ? mapCopy.permissionDenied
            : err.code === 2
              ? mapCopy.signalUnavailable
              : err.code === 3
                ? mapCopy.timeout
                : mapCopy.locationUnknown;
        setLocationStatus(status);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 },
    );
    setLocationStatus(mapCopy.locating);
  };

  useEffect(() => {
    if (mapTab === "live") {
      const map = ensureLeafletMap();
      if (map) {
        resetLiveMapView();
        window.setTimeout(() => map.invalidateSize(), 120);
      }
    } else {
      stopTracking(mapCopy.switchedBack);
      destroyLeafletMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTab, mapCopy.switchedBack]);

  useEffect(() => {
    return () => {
      stopTracking(mapCopy.stopLocating);
      destroyLeafletMap();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapTabs: { key: MapTabKey; label: string }[] = [
    { key: "map",  label: t("map_tab_map")  },
    { key: "live", label: t("map_tab_live") },
  ];

  const focusMapHotspot = (hotspotId: CampusMapHotspotId) => {
    setMapTab("map");
    setActiveHotspotId(hotspotId);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* Header */}
      <div style={{ backgroundColor: C.sky, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>UniBuddy</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggle}
              style={{
                display: "flex", alignItems: "center",
                backgroundColor: C.navy, border: `2px solid ${C.pale}`,
                borderRadius: "20px", overflow: "hidden",
                boxShadow: `2px 2px 0 rgba(255,255,255,0.15)`,
                cursor: "pointer", padding: 0, flexShrink: 0,
              }}
            >
              {(["zh", "en"] as const).map((l) => (
                <span
                  key={l}
                  style={{
                    padding: "4px 11px",
                    fontSize: "11px",
                    fontWeight: 900,
                    color: lang === l ? C.navy : "rgba(255,255,255,0.5)",
                    backgroundColor: lang === l ? C.yellow : "transparent",
                    transition: "background 0.2s",
                    pointerEvents: "none",
                  }}
                >
                  {l === "zh" ? "中文" : "EN"}
                </span>
              ))}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "28px" }}>

        {/* ── Map ── */}
        <div ref={mapSectionRef}>
          <SectionLabel color={C.sky} text={t("map_map")} />
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
          {mapTabs.map((tab) => (
            <button key={tab.key} onClick={() => setMapTab(tab.key)} style={{ flex: 1, height: "38px", borderRadius: "12px", cursor: "pointer", backgroundColor: mapTab === tab.key ? C.royal : C.white, color: mapTab === tab.key ? C.white : "#4B6898", border: `2.5px solid ${C.navy}`, boxShadow: mapTab === tab.key ? `3px 3px 0 ${C.navy}` : `2px 2px 0 ${C.pale}`, fontSize: "13px", fontWeight: 800 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {guidedTour && guidedPoints.length >= 2 && (
          <ComicCard style={{ padding: "12px", marginBottom: "10px", backgroundColor: C.cream }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "999px", padding: "2px 8px", fontSize: "10px", fontWeight: 900, color: C.navy }}>
                {mapCopy.guidedTag}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 900, color: C.navy, flex: 1 }}>{guidedTour.title}</span>
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                style={{ height: "28px", padding: "0 10px", borderRadius: "8px", border: `2px solid ${C.navy}`, backgroundColor: C.white, color: C.navy, fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
              >
                {mapCopy.guidedExit}
              </button>
            </div>
            {guidedTour.subtitle && (
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginBottom: "6px" }}>{guidedTour.subtitle}</p>
            )}
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#4B6898", marginBottom: "6px" }}>{mapCopy.guidedHint}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {guidedPoints.map((p, idx) => (
                <span key={`${p.id}-${idx}`} style={{ backgroundColor: C.white, border: `1.5px solid ${C.pale}`, borderRadius: "999px", padding: "1px 8px", fontSize: "10px", fontWeight: 800, color: C.navy }}>
                  {idx + 1}. {p.label}
                </span>
              ))}
            </div>
          </ComicCard>
        )}

        <ComicCard style={{ overflow: "hidden", position: "relative", backgroundColor: C.ice, marginBottom: "18px", padding: "10px" }}>
          {mapTab === "map" ? (
            <div key="campus-map-tab">
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: `2px solid ${C.navy}`, boxShadow: `3px 3px 0 ${C.navy}`, backgroundColor: "#E8EEF6" }}>
                <img
                  src={`${import.meta.env.BASE_URL}campus-map.jpg`}
                  alt={lang === "zh" ? "西交利物浦校园地图" : "XJTLU campus map"}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setLightbox({
                      src: `${import.meta.env.BASE_URL}campus-map.jpg`,
                      alt: lang === "zh" ? "西交利物浦校园地图" : "XJTLU campus map",
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLightbox({
                        src: `${import.meta.env.BASE_URL}campus-map.jpg`,
                        alt: lang === "zh" ? "西交利物浦校园地图" : "XJTLU campus map",
                      });
                    }
                  }}
                  style={{ width: "100%", height: "auto", display: "block", cursor: "pointer" }}
                />
                {campusMapHotspots.map((pin) => (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setActiveHotspotId(pin.id)}
                    aria-label={`${pin.fullName} ${pin.label}`}
                    style={{
                      position: "absolute",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: activeHotspotId === pin.id ? "translate(-50%, -50%) scale(1.14)" : "translate(-50%, -50%) scale(1)",
                      minWidth: "24px",
                      minHeight: "22px",
                      borderRadius: "7px",
                      border: activeHotspotId === pin.id ? `2.5px solid ${C.yellow}` : "2px solid rgba(255,255,255,0.95)",
                      backgroundColor: pin.color,
                      color: C.white,
                      fontSize: "9px",
                      fontWeight: 900,
                      padding: "0 5px",
                      lineHeight: 1,
                      cursor: "pointer",
                      zIndex: activeHotspotId === pin.id ? 8 : 4,
                      opacity: 1,
                      filter: activeHotspotId === pin.id ? "saturate(1.12) brightness(1.02)" : "none",
                      boxShadow: activeHotspotId === pin.id
                        ? `0 0 0 2px ${C.navy}, 0 0 0 8px rgba(255,217,61,0.22), 0 7px 16px rgba(0,0,0,0.28)`
                        : "0 4px 12px rgba(0,0,0,0.25)",
                      animation: "none",
                      transition: "transform 0.18s ease, opacity 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                    }}
                  >
                    {pin.label}
                  </button>
                ))}
                {guidedPolyline && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9 }}
                  >
                    <polyline
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={2.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.92}
                      points={guidedPolyline}
                    />
                    <polyline
                      fill="none"
                      stroke={C.royal}
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={guidedPolyline}
                    />
                  </svg>
                )}
                {guidedPoints.map((p, idx) => (
                  <button
                    key={`${p.id}-${idx}-guided`}
                    type="button"
                    onClick={() => setActiveHotspotId(p.id)}
                    style={{
                      position: "absolute",
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `2px solid ${C.navy}`,
                      backgroundColor: idx === 0 ? C.mint : idx === guidedPoints.length - 1 ? C.yellow : C.white,
                      color: C.navy,
                      fontSize: "10px",
                      fontWeight: 900,
                      lineHeight: 1,
                      cursor: "pointer",
                      boxShadow: `0 2px 6px rgba(0,0,0,0.28)`,
                      zIndex: 10,
                    }}
                    aria-label={`${mapCopy.guidedSteps} ${idx + 1}: ${p.label}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: C.white,
                  border: "none",
                  boxShadow: "none",
                  position: "relative",
                  paddingRight: activeLocation && mascotGuideOpen ? "58px" : "10px",
                }}
              >
                {activeLocation && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      display: "flex",
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      gap: "6px",
                      maxWidth: "calc(100% - 16px)",
                      zIndex: 2,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!mascotGuideOpen) {
                          setMascotGuideOpen(true);
                          speakBuildingIntro();
                        } else {
                          setMascotGuideOpen(false);
                          stopBuildingSpeech();
                        }
                      }}
                      aria-label={mascotGuideOpen ? mapCopy.mascotClose : mapCopy.mascotOpen}
                      aria-expanded={mascotGuideOpen}
                      style={{
                        flexShrink: 0,
                        width: "46px",
                        height: "46px",
                        padding: "4px",
                        borderRadius: "14px",
                        border: `2.5px solid ${C.navy}`,
                        backgroundColor: C.cream,
                        boxShadow: mascotGuideOpen ? `inset 2px 2px 0 ${C.pale}` : `2px 2px 0 ${C.navy}`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={bodeSrc}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none" }}
                      />
                    </button>
                    {!mascotGuideOpen && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: "#4B6898",
                          lineHeight: 1.25,
                          textAlign: "right",
                          maxWidth: "min(92px, 28vw)",
                        }}
                      >
                        {mapCopy.mascotVoiceHint}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898" }}>{activeLocation?.type ?? mapCopy.clickHint}</span>
                </div>
                <p style={{ marginTop: "5px", fontSize: "14px", fontWeight: 900, color: C.navy }}>
                  {activeLocation?.title ?? mapCopy.notReady}
                </p>
                {mascotGuideOpen && activeLocation && (
                  <div
                    style={{
                      marginTop: "10px",
                      marginBottom: "6px",
                      padding: "12px",
                      borderRadius: "12px",
                      border: `2px dashed ${C.sky}`,
                      backgroundColor: C.ice,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={bodeSrc}
                      alt=""
                      style={{ width: "min(140px, 55vw)", height: "auto", display: "block", filter: "drop-shadow(2px 3px 0 rgba(14,27,77,0.12))" }}
                    />
                    <label style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: C.navy, textAlign: "left" }}>{mapCopy.voiceLabel}</span>
                      <select
                        value={selectedVoiceURI}
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        style={{
                          width: "100%",
                          height: "34px",
                          padding: "0 10px",
                          borderRadius: "10px",
                          border: `2px solid ${C.navy}`,
                          backgroundColor: C.white,
                          color: C.navy,
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        <option value="">{mapCopy.voiceDefault}</option>
                        {availableVoices.map((voice) => (
                          <option key={voice.voiceURI} value={voice.voiceURI}>
                            {`${voice.name} (${voice.lang})`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => speakBuildingIntro()}
                        style={{
                          minHeight: "34px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: `2px solid ${C.navy}`,
                          backgroundColor: C.royal,
                          color: C.white,
                          fontSize: "12px",
                          fontWeight: 800,
                          boxShadow: `2px 2px 0 ${C.navy}`,
                          cursor: "pointer",
                        }}
                      >
                        {mapCopy.listenAgain}
                      </button>
                      <button
                        type="button"
                        onClick={stopBuildingSpeech}
                        style={{
                          minHeight: "34px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: `2px solid ${C.navy}`,
                          backgroundColor: C.white,
                          color: C.navy,
                          fontSize: "12px",
                          fontWeight: 800,
                          boxShadow: `2px 2px 0 ${C.pale}`,
                          cursor: "pointer",
                        }}
                      >
                        {mapCopy.stopSpeak}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMascotGuideOpen(false);
                          stopBuildingSpeech();
                        }}
                        style={{
                          minHeight: "34px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: `2px solid ${C.pale}`,
                          backgroundColor: C.cream,
                          color: C.navy,
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {mapCopy.mascotClose}
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#4B6898", textAlign: "center", lineHeight: 1.45 }}>
                      {mapCopy.speechTip}
                    </p>
                  </div>
                )}
                <p style={{ marginTop: "7px", fontSize: "11px", lineHeight: 1.45, color: C.navy }}>
                  {activeLocation?.desc ?? ""}
                </p>
                <p style={{ marginTop: "6px", fontSize: "11px", lineHeight: 1.45, color: "#355087", fontWeight: 600 }}>
                  {activeLocation?.story ?? ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {(activeLocation?.tags ?? []).map((tag) => (
                    <span key={tag} style={{ backgroundColor: C.pale, border: "none", borderRadius: "999px", padding: "1px 8px", fontSize: "10px", fontWeight: 800, color: C.navy }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <div style={{ backgroundColor: C.cream, border: `1.5px solid ${C.pale}`, borderRadius: "8px", padding: "6px 8px" }}>
                    <p style={{ fontSize: "10px", color: "#4B6898", fontWeight: 700 }}>{mapCopy.bestFor}</p>
                    <p style={{ fontSize: "11px", color: C.navy, fontWeight: 800, marginTop: "1px", lineHeight: 1.45 }}>{activeLocation?.bestFor ?? "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key="live-map-tab">
              <div
                ref={leafletHostRef}
                style={{
                  width: "100%",
                  height: "clamp(220px, 34vh, 320px)",
                  borderRadius: "12px",
                  border: `2px solid ${C.navy}`,
                  boxShadow: `3px 3px 0 ${C.navy}`,
                  overflow: "hidden",
                }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={startTracking}
                  style={{ flex: 1, height: "36px", borderRadius: "10px", border: `2px solid ${C.navy}`, backgroundColor: C.royal, color: C.white, fontSize: "12px", fontWeight: 800, boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <IconNavigation size={14} color={C.white} />
                  {mapCopy.startButton}
                </button>
                <button
                  type="button"
                  onClick={() => stopTracking(mapCopy.stopLocating)}
                  style={{ flex: 1, height: "36px", borderRadius: "10px", border: `2px solid ${C.navy}`, backgroundColor: C.white, color: C.navy, fontSize: "12px", fontWeight: 800, boxShadow: `2px 2px 0 ${C.navy}`, cursor: "pointer" }}
                >
                  {mapCopy.stopButton}
                </button>
              </div>
              <p style={{ marginTop: "8px", fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>{locationStatus}</p>
            </div>
          )}
        </ComicCard>

        {/* ── Campus Convenience ── */}
        <SectionLabel color={C.mint} text={t("map_convenience")} />

        <ComicCard style={{ padding: "12px", backgroundColor: C.white, marginBottom: "18px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginBottom: "10px" }}>
            {t("map_convenience_desc")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {campusConvenienceItems.map((item) => (
              <div
                key={item.titleKey}
                role="button"
                tabIndex={0}
                onClick={() => focusMapHotspot(item.hotspotIds[0])}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    focusMapHotspot(item.hotspotIds[0]);
                  }
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: `2px solid ${C.pale}`,
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: item.hotspotIds.includes(activeHotspotId as CampusMapHotspotId) ? "#EAF4FF" : "#F8FCFF",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 900, color: C.navy }}>
                  {item.icon} {t(item.titleKey)}
                </p>
                <p style={{ marginTop: "5px", fontSize: "11px", fontWeight: 700, color: "#355087", lineHeight: 1.45 }}>
                  {t(item.locationsKey)}
                </p>
                {item.hotspotIds.length > 1 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {item.hotspotIds.map((hotspotId) => (
                      <button
                        key={`${item.titleKey}-${hotspotId}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          focusMapHotspot(hotspotId);
                        }}
                        style={{
                          borderRadius: "999px",
                          border: `1.5px solid ${activeHotspotId === hotspotId ? C.navy : C.pale}`,
                          backgroundColor: activeHotspotId === hotspotId ? C.yellow : C.white,
                          color: C.navy,
                          fontSize: "10px",
                          fontWeight: 900,
                          padding: "2px 8px",
                          lineHeight: 1.2,
                          cursor: "pointer",
                        }}
                      >
                        {hotspotId.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ComicCard>

        {/* ── Custom Route Card ── */}
        <SectionLabel color={C.purple} text={t("route_custom")} />

        <button
          type="button"
          onClick={() => navigate("/custom-route")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            backgroundColor: C.white,
            border: `2.5px solid ${C.navy}`,
            borderRadius: "16px",
            boxShadow: `4px 4px 0 ${C.navy}`,
            padding: "14px 16px",
            marginBottom: "18px",
            cursor: "pointer",
            textAlign: "left",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
        >
          <div style={{ width: "48px", height: "48px", backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "14px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconRoute size={24} active />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "15px", fontWeight: 900, color: C.navy, marginBottom: "3px" }}>{t("route_custom")}</p>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", lineHeight: 1.45 }}>{t("route_custom_sub")}</p>
          </div>
          <IconArrow size={18} color={C.navy} />
        </button>

        {/* ── Tap to Collect Stamps ── */}
        <div ref={stampSectionRef}>
          <SectionLabel color={C.sky} text={t("map_tap_stamp")} />
        </div>

        <ComicCard style={{ padding: "14px", marginBottom: "6px", backgroundColor: C.cream }}>
          <button
            type="button"
            onClick={openBadgeCollection}
            style={{
              width: "100%", height: "44px",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: C.royal, border: `2.5px solid ${C.navy}`,
              borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
              color: C.white, fontSize: "14px", fontWeight: 900, cursor: "pointer",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
          >
            {t("map_tap_stamp_btn")}
          </button>
        </ComicCard>
      </div>

      <ImageZoomLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
        lang={lang}
      />

      {showGuidedNotice && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 55,
            backgroundColor: "rgba(14, 27, 77, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "320px",
              backgroundColor: C.white,
              border: `2.5px solid ${C.navy}`,
              borderRadius: "16px",
              boxShadow: `5px 5px 0 ${C.navy}`,
              padding: "14px 14px 12px",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: 900, color: C.navy, marginBottom: "10px" }}>
              <span>🗺️</span>
              <span>{mapCopy.guidedTag}</span>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy, lineHeight: 1.5, marginBottom: "12px" }}>
              {mapCopy.guidedNotice}
            </p>
            <button
              type="button"
              onClick={() => setShowGuidedNotice(false)}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "10px",
                border: `2px solid ${C.navy}`,
                backgroundColor: C.royal,
                color: C.white,
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `2px 2px 0 ${C.navy}`,
              }}
            >
              {t("camera_dialog_ok")}
            </button>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}

function SectionLabel({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
      <div style={{ width: "4px", height: "18px", backgroundColor: color, border: "1.5px solid #0E1B4D", borderRadius: "2px" }} />
      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0E1B4D" }}>{text}</span>
    </div>
  );
}
