export interface BadgeDef {
  id: number;
  // Public asset path (expects: /public/<imagePath>)
  imagePath: string;
}

// 20 badge images uploaded to the GitHub folder (e.g. public/birds/IMG_3386.PNG ... IMG_3405.PNG)
export const BADGE_DEFS: BadgeDef[] = [
  { id: 1, imagePath: "birds/IMG_3386.PNG" },
  { id: 2, imagePath: "birds/IMG_3387.PNG" },
  { id: 3, imagePath: "birds/IMG_3388.PNG" },
  { id: 4, imagePath: "birds/IMG_3389.PNG" },
  { id: 5, imagePath: "birds/IMG_3390.PNG" },
  { id: 6, imagePath: "birds/IMG_3391.PNG" },
  { id: 7, imagePath: "birds/IMG_3392.PNG" },
  { id: 8, imagePath: "birds/IMG_3393.PNG" },
  { id: 9, imagePath: "birds/IMG_3394.PNG" },
  { id: 10, imagePath: "birds/IMG_3395.PNG" },
  { id: 11, imagePath: "birds/IMG_3396.PNG" },
  { id: 12, imagePath: "birds/IMG_3397.PNG" },
  { id: 13, imagePath: "birds/IMG_3398.PNG" },
  { id: 14, imagePath: "birds/IMG_3399.PNG" },
  { id: 15, imagePath: "birds/IMG_3400.PNG" },
  { id: 16, imagePath: "birds/IMG_3401.PNG" },
  { id: 17, imagePath: "birds/IMG_3402.PNG" },
  { id: 18, imagePath: "birds/IMG_3403.PNG" },
  { id: 19, imagePath: "birds/IMG_3404.PNG" },
  { id: 20, imagePath: "birds/IMG_3405.PNG" },
];

// 默认不预解锁任何徽章/打卡点；首次使用时集章进度从 0 开始。
export const PRE_UNLOCKED_BADGE_IDS: number[] = [];

export const TOTAL_BADGES = BADGE_DEFS.length;

