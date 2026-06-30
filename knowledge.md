# UniBuddy 导航系统知识库（Knowledge）

## 适用范围

本知识库基于当前版本的 UniBuddy 校园导览系统（XJTLU 场景）整理，覆盖以下能力：
- 校园图片与静态地图导览
- 教室搜索与路线说明
- 推荐路线、盲盒路线、自定义路线
- 路线导览连线展示
- 实时定位（浏览器定位）
- 中英双语切换
- 路线收藏与个人中心联动

## 预测高频问题（25 问）

### 1) 这套导航系统是给谁用的？
面向西交利物浦大学（XJTLU）校园访客与在校学生，尤其适合新生、家长来访和校园导览场景。

### 2) 我从哪里进入地图功能？
进入首页后，点击图片与地图入口（`/pictures`）即可进入“图片+地图”页面。

### 3) 这个系统支持哪些路线模式？
支持三类：推荐路线、盲盒路线（按兴趣随机生成）、自定义路线（多点位自选规划）。

### 4) 推荐路线有哪些典型类型？
当前包含新生路线、家长路线、深度路线等，用户可展开查看站点和时长后直接开始导览。

### 5) 盲盒路线是怎么生成的？
用户先选择兴趣方向（如美食、地标、学习等），系统按对应主题返回一条预设导览路线。

### 6) 自定义路线最少要选几个点？
至少选择 2 个点位才可生成路线。

### 7) 自定义路线可以指定起点吗？
可以。用户在已选点位中可设置起点，系统会从该起点开始规划后续顺序。

### 8) 自定义路线的排序逻辑是什么？
当前为“起点固定 + 最近邻贪心”的近似最短路径策略，基于校园地图坐标的直线距离排序。

### 9) 生成路线后如何进入地图导览？
在路线结果页点击“开始导览”，会跳转到地图页面并带入导览点序与连线。

### 10) 导览路线在地图上怎么显示？
系统会在校园静态地图上显示站点编号、起终点标记和连线，便于按顺序打卡浏览。

### 11) 导览中途想退出怎么办？
可在导览卡片中点击“退出导览”，返回普通地图浏览状态。

### 12) 我能搜索教室吗？
可以。支持按教室号或楼栋关键词搜索，并展示楼层与到达方式标签。

### 13) 搜不到教室怎么办？
先检查关键词（教室号/楼栋缩写）是否准确；若无结果，当前数据中可能暂未收录该教室。

### 14) 搜到教室后能看到什么导航信息？
可查看起点选择、路线预览、楼层到达方式（电梯/楼梯/直达）及到达后楼层提示。

### 15) 起点可以改吗？
可以。在教室导航详情页可从支持的地图节点中切换起点，再重新生成路线。

### 16) 导览路线在地图上怎么显示？
支持。地图页切换到实时地图后，可点击“开始定位”显示当前位置与精度圈。

### 17) 定位失败常见原因是什么？
常见包括：浏览器未授权定位、设备定位信号弱、请求超时，或当前环境不支持地理定位。

### 18) 为什么建议在 HTTPS 下用定位？
浏览器定位能力通常在 HTTPS 场景更稳定，权限与兼容性也更好。

### 19) 地图上的建筑点位可以点开详情吗？
可以。点击地图点位可查看建筑简介、故事、标签和“适合人群”等信息。

### 20) 系统有语音讲解吗？
有。地图详情里可打开校园讲解员，使用浏览器语音合成朗读建筑介绍。

### 21) 可以中英文切换吗？
可以。系统内置 `zh/en` 文案资源，支持中英双语界面内容。

### 22) 路线可以收藏吗？
可以。推荐路线、盲盒路线和自定义路线都支持收藏。

### 23) 收藏内容去哪里看？
可在个人中心（`/profile`）查看已收藏路线与相关进度信息。

### 24) 系统现在接入真实地图导航了吗？
部分能力已接入（实时地图使用 OpenStreetMap + 浏览器定位），但整体仍以原型演示和校园静态导览为主。

### 25) 后续还能扩展哪些能力？
可扩展方向包括：真实地图 API 深度接入、路径算法升级、登录与云同步、后端数据服务化。

## Predicted Frequently Asked Questions (English, 25 Qs)

### 1) Who is this navigation system for?
It is designed for XJTLU campus visitors and students, especially freshmen, visiting parents, and campus-tour scenarios.

### 2) Where can I enter the map feature?
From the home page, tap the pictures-and-map entry (`/pictures`) to open the "pictures + map" page.

### 3) What route modes are supported?
Three modes are supported: recommended routes, mystery routes (theme-based random route), and custom routes (multi-stop self-selected planning).

### 4) What are typical recommended route types?
Current examples include freshman route, parent route, and in-depth route. You can expand each route to view stops and duration, then start navigation.

### 5) How is a mystery route generated?
You first choose an interest theme (such as food, landmarks, learning), and the system returns a preset route for that theme.

### 6) What is the minimum number of points for a custom route?
At least 2 selected points are required to generate a custom route.

### 7) Can I set a start point in a custom route?
Yes. You can pick a start point from your selected stops, and route planning will begin from that point.

### 8) What sorting logic does custom routing use?
It currently uses a "fixed start + nearest-neighbor greedy" approximate shortest-path strategy based on straight-line campus coordinates.

### 9) How do I start map navigation after generating a route?
On the route result page, tap "Start Navigation" to jump to the map page with ordered stops and connecting lines.

### 10) How is the guided route shown on the map?
The system displays stop numbers, start/end markers, and connecting lines on the campus static map for step-by-step navigation.

### 11) How can I exit navigation midway?
Tap "Exit Navigation" on the guide card to return to normal map browsing mode.

### 12) Can I search for classrooms?
Yes. You can search by classroom number or building keywords, and the result includes floor and access-method labels.

### 13) What if a classroom cannot be found?
First check whether the classroom number/building keyword is accurate. If still no result, that classroom may not be included in the current dataset.

### 14) What navigation info is shown after I find a classroom?
You can view start-point selection, route preview, floor access method (elevator/stairs/direct), and arrival floor instructions.

### 15) Can I change the starting point?
Yes. In classroom navigation details, you can switch among supported map nodes as the start point and regenerate the route.

### 16) Does the system support live location?
Yes. On the map page, switch to live map mode and tap "Start Location" to show your current position and accuracy circle.

### 17) What are common reasons for location failure?
Common causes include denied browser permission, weak device signal, request timeout, or an environment that does not support geolocation.

### 18) Why is HTTPS recommended for location?
Browser geolocation is usually more stable under HTTPS, with better permission behavior and compatibility.

### 19) Can I open details for building points on the map?
Yes. Tapping a map point shows building intro, stories, tags, and "recommended audience" information.

### 20) Does the system provide voice narration?
Yes. In map details, you can enable the campus narrator, which uses browser speech synthesis to read introductions aloud.

### 21) Can I switch between Chinese and English?
Yes. The system includes built-in `zh/en` resources and supports a bilingual interface.

### 22) Can routes be favorited?
Yes. Recommended routes, mystery routes, and custom routes can all be added to favorites.

### 23) Where can I view my favorites?
You can check saved routes and related progress in the profile page (`/profile`).

### 24) Has real map navigation been fully integrated?
Partially. Some capabilities are integrated (live map uses OpenStreetMap + browser location), but the overall system is still mainly a prototype with static campus guidance.

### 25) What can be expanded in future versions?
Possible directions include deeper real-map API integration, upgraded path algorithms, login and cloud sync, and backend data service architecture.
