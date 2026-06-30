export type AccessType = "elevator" | "stairs" | "none";

export interface ClassroomLocale {
  building: string;
  duration: string;
  steps: string[];
  floorGuide: string;
  accessDetail: string;
}

export interface Classroom {
  id: number;
  room: string;
  floor: number;
  access: AccessType;
  zh: ClassroomLocale;
  en: ClassroomLocale;
}

export const classrooms: Classroom[] = [
  {
    id: 1, room: "SA169", floor: 1, access: "none",
    zh: {
      building: "理科楼A (SA)", duration: "约3分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约60米", "🏛️ 到达SA楼正门"],
      floorGuide: "从西门进，1楼教室，进门后左侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Building A (SA)", duration: "~3 min",
      steps: ["📍 Start from CB", "➡️ Head east ~60 m", "🏛️ Arrive at SA main entrance"],
      floorGuide: "Enter through the west gate, Floor 1. Use the left corridor after entering.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 2, room: "SB123", floor: 1, access: "none",
    zh: {
      building: "理科楼B (SB)", duration: "约4分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约100米", "🏛️ 到达SB楼正门"],
      floorGuide: "从东门进，1楼教室，进门后右侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Building B (SB)", duration: "~4 min",
      steps: ["📍 Start from CB", "➡️ Head east ~100 m", "🏛️ Arrive at SB main entrance"],
      floorGuide: "Enter through the east gate, Floor 1. Take the right corridor after entering.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 3, room: "SC176", floor: 1, access: "none",
    zh: {
      building: "理科楼C (SC)", duration: "约3分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约60米", "🏛️ 到达SC楼北门"],
      floorGuide: "从西门进，1楼教室，进门后右侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Building C (SC)", duration: "~3 min",
      steps: ["📍 Start from CB", "➡️ Head east ~60 m", "🏛️ Arrive at SC north entrance"],
      floorGuide: "Enter through the west gate, Floor 1. Take the right corridor after entering.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 4, room: "SC169", floor: 1, access: "none",
    zh: {
      building: "理科楼C (SC)", duration: "约4分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约60米", "↩️ 向南直行30米后向东拐", "🏛️ 到达SC楼南门"],
      floorGuide: "从西门进，1楼教室，进门后左侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Building C (SC)", duration: "~4 min",
      steps: ["📍 Start from CB", "➡️ Head east ~60 m", "↩️ Go south ~30 m then turn east", "🏛️ Arrive at SC south entrance"],
      floorGuide: "Enter through the west gate, Floor 1. Use the left corridor after entering.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 5, room: "SD102", floor: 1, access: "none",
    zh: {
      building: "理科楼D (SD)", duration: "约5分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约100米", "↩️ 向南直行60米", "🏛️ 到达SD楼正门"],
      floorGuide: "从东门进，1楼教室，进门后左侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Building D (SD)", duration: "~5 min",
      steps: ["📍 Start from CB", "➡️ Head east ~100 m", "↩️ Head south ~60 m", "🏛️ Arrive at SD main entrance"],
      floorGuide: "Enter through the east gate, Floor 1. Use the left corridor after entering.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 6, room: "SB252", floor: 2, access: "elevator",
    zh: {
      building: "理科楼B (SB)", duration: "约4分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约60米", "🏛️ 到达SB楼正门", "⬆️ 前往2楼"],
      floorGuide: "从西门进，2楼教室，出电梯右转，走廊第1间。",
      accessDetail: "推荐乘坐中央电梯至2楼",
    },
    en: {
      building: "Science Building B (SB)", duration: "~4 min",
      steps: ["📍 Start from CB", "➡️ Head east ~60 m", "🏛️ Arrive at SB main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Enter through the west gate, Floor 2. Turn right out of the elevator; 1st room in the corridor.",
      accessDetail: "Recommended: take the central elevator to Floor 2",
    },
  },
  {
    id: 7, room: "SB214", floor: 2, access: "elevator",
    zh: {
      building: "理科楼B (SB)", duration: "约4分钟",
      steps: ["📍 从CB出发", "➡️ 向东直行约60米", "🏛️ 到达SB楼正门", "⬆️ 前往2楼"],
      floorGuide: "从西门进，2楼教室，出电梯右转，走廊第10间。",
      accessDetail: "推荐乘坐中央电梯至2楼",
    },
    en: {
      building: "Science Building B (SB)", duration: "~4 min",
      steps: ["📍 Start from CB", "➡️ Head east ~60 m", "🏛️ Arrive at SB main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Enter through the west gate, Floor 2. Turn right out of the elevator; 10th room in the corridor.",
      accessDetail: "Recommended: take the central elevator to Floor 2",
    },
  },
  {
    id: 8, room: "EE101", floor: 1, access: "none",
    zh: {
      building: "电子楼 (EE)", duration: "约4分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东北方向行走约100米", "🏛️ 到达EE楼正门"],
      floorGuide: "1楼教室，正门进入后左转走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Electronics Building (EE)", duration: "~4 min",
      steps: ["📍 From your current location", "➡️ Head northeast ~100 m", "🏛️ Arrive at EE main entrance"],
      floorGuide: "Floor 1. Turn left after entering the main entrance.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 9, room: "EE204", floor: 2, access: "stairs",
    zh: {
      building: "电子楼 (EE)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东北方向行走约100米", "🏛️ 到达EE楼正门", "⬆️ 前往2楼"],
      floorGuide: "2楼教室，出楼梯右转，第2间。",
      accessDetail: "建议走EE楼北侧楼梯（正门右转）至2楼，无电梯",
    },
    en: {
      building: "Electronics Building (EE)", duration: "~5 min",
      steps: ["📍 From your current location", "➡️ Head northeast ~100 m", "🏛️ Arrive at EE main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2. Turn right from stairwell; 2nd room.",
      accessDetail: "Use the north staircase in EE Building (turn right from main entrance) to Floor 2 — no elevator",
    },
  },
  {
    id: 10, room: "MA101", floor: 1, access: "none",
    zh: {
      building: "数学楼 (MA)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 向图书馆方向直行约120米", "🏛️ 到达MS楼侧门"],
      floorGuide: "1楼教室，侧门进入后直行右转。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Math Building (MA)", duration: "~5 min",
      steps: ["📍 From your current location", "⬆️ Head toward Library ~120 m", "🏛️ Arrive at MS side entrance"],
      floorGuide: "Floor 1. Enter via side door, walk straight then turn right.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 11, room: "MA401", floor: 4, access: "elevator",
    zh: {
      building: "数学楼 (MA)", duration: "约8分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 向图书馆方向直行约120米", "🏛️ 到达MS楼侧门", "⬆️ 前往4楼"],
      floorGuide: "4楼教室，出电梯左转，走廊第1间。",
      accessDetail: "乘坐MA楼主电梯（正门大厅）至4楼（推荐）或走北侧楼梯",
    },
    en: {
      building: "Math Building (MA)", duration: "~8 min",
      steps: ["📍 From your current location", "⬆️ Head toward Library ~120 m", "🏛️ Arrive at MS side entrance", "⬆️ Go to Floor 4"],
      floorGuide: "Floor 4. Turn left out of elevator; 1st room in the corridor.",
      accessDetail: "Take the main elevator in MA Building (main lobby) to Floor 4 (recommended) or use north stairs",
    },
  },
  {
    id: 12, room: "CB201", floor: 2, access: "elevator",
    zh: {
      building: "图书馆 (CB)", duration: "约6分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 直行约130米", "🏛️ 到达图书馆正门", "⬆️ 前往2楼"],
      floorGuide: "2楼阅览室，出电梯后右转即是。",
      accessDetail: "乘坐图书馆主电梯（大厅右侧）至2楼",
    },
    en: {
      building: "Library (CB)", duration: "~6 min",
      steps: ["📍 From your current location", "⬆️ Walk straight ~130 m", "🏛️ Arrive at Library main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2 Reading Room. Turn right out of the elevator.",
      accessDetail: "Take the main elevator in the Library (right side of lobby) to Floor 2",
    },
  },
  {
    id: 13, room: "IR305", floor: 3, access: "elevator",
    zh: {
      building: "国际楼 (IR)", duration: "约7分钟",
      steps: ["📍 从您当前位置出发", "↩️ 向南行走约100米", "🏛️ 到达IB楼正门", "⬆️ 前往3楼"],
      floorGuide: "3楼会议室，出电梯右转，尽头左侧。",
      accessDetail: "乘坐IR楼南侧电梯至3楼，出门右转",
    },
    en: {
      building: "International Building (IR)", duration: "~7 min",
      steps: ["📍 From your current location", "↩️ Head south ~100 m", "🏛️ Arrive at IB main entrance", "⬆️ Go to Floor 3"],
      floorGuide: "Floor 3 Meeting Room. Turn right from elevator, then left at the end.",
      accessDetail: "Take the south elevator in IR Building to Floor 3, turn right on exit",
    },
  },
  {
    id: 14, room: "EE201", floor: 2, access: "stairs",
    zh: {
      building: "工程楼 (EE)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "➡️ 右转约80米", "🏛️ 到达ES楼正门", "⬆️ 前往2楼"],
      floorGuide: "2楼实验室，出楼梯左转，第4间。",
      accessDetail: "EE楼走主楼梯（正门右侧）至2楼，暂无电梯",
    },
    en: {
      building: "Engineering Building (EE)", duration: "~5 min",
      steps: ["📍 From your current location", "➡️ Turn right ~80 m", "🏛️ Arrive at ES main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2 Lab. Turn left from stairwell; 4th room.",
      accessDetail: "Use the main staircase in EE Building (right of main entrance) to Floor 2 — no elevator available",
    },
  },
];
