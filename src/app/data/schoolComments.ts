export type SchoolPerspective = "freshman" | "visitor";

export interface SchoolPerspectiveComment {
  zh: string;
  en: string;
}

export const SYSTEM_SCHOOL_COMMENTS: Record<SchoolPerspective, SchoolPerspectiveComment[]> = {
  freshman: [
    {
      zh: "忍老师讲课清晰细致，学习环境舒适，校园设计美感强",
      en: "Clear teaching, comfortable study spots, beautifully designed campus",
    },
    {
      zh: "EAP老师负责认真，自习空间舒适，但校园导航不便",
      en: "Dedicated EAP teacher, comfy study spaces, but navigation is confusing",
    },
    {
      zh: "老师友善耐心，乐于答疑，激励学生明确未来方向",
      en: "Friendly teachers inspire students and help shape future goals",
    },
    {
      zh: "部分教学楼复杂易迷路，设施先进，校园环境整洁舒适",
      en: "Buildings confusing, but facilities modern and environment clean",
    },
    {
      zh: "课前预习与课后交流重要，有助提升学习效率",
      en: "Previewing and discussion improve learning efficiency",
    },
    {
      zh: "EAP重视讨论与表达，积极参与可提升口语与合作能力",
      en: "EAP encourages discussion, boosting speaking and teamwork",
    },
    {
      zh: "初入校园易迷路，但建筑风格多样各具特色",
      en: "Easy to get lost, but buildings are diverse and unique",
    },
    {
      zh: "课程贴近职场逻辑，培养实践能力与未来竞争力",
      en: "Courses build real-world skills and future competitiveness",
    },
  ],
  visitor: [
    {
      zh: "校园多元开放，草坪休闲氛围轻松，南北校区各具特色",
      en: "Diverse campus, relaxing vibe, distinct north and south areas",
    },
    {
      zh: "楼层标识混乱，但学习氛围良好，学生积极自习",
      en: "Floor signs confusing, but strong study atmosphere",
    },
    {
      zh: "环境舒适悠闲，学生热情友好，乐于提供帮助",
      en: "Relaxing environment, friendly and helpful students",
    },
    {
      zh: "国际化强且以学生为中心，沟通反馈机制高效",
      en: "International and student-centered with fast feedback",
    },
    {
      zh: "跨文化交流频繁，建筑与标识体现开放包容氛围",
      en: "Frequent cross-cultural exchange, open environment",
    },
    {
      zh: "社团设备先进，学生组织能力强，实践氛围浓厚",
      en: "Well-equipped clubs, strong student initiative",
    },
    {
      zh: "校园开放自由，设施便利，处处体现以学生为中心",
      en: "Open campus, convenient facilities, student-centered design",
    },
    {
      zh: "多语言交流活跃，文化融合强，形成全球化学习环境",
      en: "Multilingual campus with strong cultural integration",
    },
  ],
};

