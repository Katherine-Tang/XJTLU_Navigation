/** 校园地图标注点（百分比坐标），与主地图 `campus-map.jpg` 对齐 */
export const campusMapHotspots = [
  { id: "ls", label: "LS", fullName: "Life Sciences", x: 32, y: 22, color: "#2d8f47" },
  { id: "fb", label: "FB", fullName: "Foundation Building", x: 41, y: 42, color: "#5ba3d4" },
  { id: "cb", label: "CB", fullName: "Central Building", x: 42, y: 56, color: "#17316f" },
  { id: "sa", label: "SA", fullName: "Science Building A", x: 54, y: 51, color: "#6abf69" },
  { id: "sb", label: "SB", fullName: "Science Building B", x: 54, y: 55, color: "#6abf69" },
  { id: "sc", label: "SC", fullName: "Science Building C", x: 54, y: 59, color: "#6abf69" },
  { id: "sd", label: "SD", fullName: "Science Building D", x: 54, y: 63, color: "#6abf69" },
  { id: "pb", label: "PB", fullName: "Public Building", x: 61, y: 53, color: "#e8a23a" },
  { id: "ma", label: "MA", fullName: "Mathematics Building A", x: 67, y: 53, color: "#7e57c2" },
  { id: "mb", label: "MB", fullName: "Mathematics Building B", x: 67, y: 57, color: "#7e57c2" },
  { id: "ee", label: "EE", fullName: "Electrical & Electronic", x: 61, y: 63, color: "#26a69a" },
  { id: "eb", label: "EB", fullName: "Engineering Building", x: 68, y: 61, color: "#3d8f5a" },
  { id: "ir", label: "IR", fullName: "International Research Centre", x: 54, y: 73, color: "#c62828" },
  { id: "ia", label: "IA", fullName: "International Academic Exchange", x: 63, y: 75, color: "#ef6c2a" },
  { id: "hs", label: "HS", fullName: "Humanities & Social Sciences", x: 63, y: 83, color: "#8d6e63" },
  { id: "es", label: "ES", fullName: "Emerging Sciences", x: 53, y: 92, color: "#d84315" },
  { id: "db", label: "DB", fullName: "Design Building", x: 65, y: 90, color: "#795548" },
  { id: "bs", label: "BS", fullName: "International Business School", x: 51, y: 83, color: "#c62828" },
  { id: "as", label: "AS", fullName: "Film & Creative Technology", x: 45, y: 71, color: "#f9a825" },
  { id: "gym", label: "GYM", fullName: "Gymnasium", x: 73, y: 75, color: "#263238" },
] as const;

export type CampusMapHotspot = (typeof campusMapHotspots)[number];
export type CampusMapHotspotId = CampusMapHotspot["id"];
