# 道具系统实现总结

## 项目概览
waoowaoo 是一个 AI 影视制作工具，支持小说 → 分镜 → 角色 → 场景 → 视频的完整流程。本次实现为项目添加了完整的**道具系统**，与现有的角色、场景、配音系统保持一致的架构。

## 实现完成度

### ✅ Phase 1-4 已完成（2026-03-15）

#### Phase 1: 数据库设计
**Prisma Schema 新增模型：**
- `GlobalProp` - 全局道具库（用户级别，跨项目复用）
- `GlobalPropImage` - 全局道具图片（支持多图像、版本控制）
- `NovelPromotionProp` - 项目道具（项目级别）
- `NovelPromotionPropImage` - 项目道具图片
- `NovelPromotionClip.props` - 出场道具关联字段

**关键特性：**
- 支持10种道具分类（武器、服装、家具、食物、交通工具、工具、装饰品、电子产品、自然物品、其他）
- 版本控制：previousImageUrl、previousDescription 支持撤回
- MediaObject 统一管理所有媒体引用
- 级联删除确保数据一致性

#### Phase 2: 提示词系统
**创建了6个提示词文件（中英文）：**

1. **prop_extract.zh/en.txt** - 从剧本提取道具
   - 识别所有提到的物品
   - 自动分类到10个类别
   - 统计出现次数

2. **prop_description_generate.zh/en.txt** - 生成道具视觉描述
   - 为 AI 图像生成创建详细提示词
   - 包含形状、颜色、材质、细节等

3. **panel_prop_extract.zh/en.txt** - 从分镜提取道具
   - 识别分镜中的道具
   - 提取道具位置、交互、状态等信息

4. **panel_prop_fusion.zh/en.txt** - 融合道具到分镜提示词
   - 将道具信息融合到图像提示词
   - 保持视觉一致性

5. **prop_consistency_check.zh/en.txt** - 检查道具一致性
   - 验证同一道具的视觉一致性
   - 检查逻辑合理性
   - 生成一致性评分和改进建议

#### Phase 3: API 实现
**项目道具 API：**
- `POST /api/novel-promotion/[projectId]/props` - 创建道具
- `GET /api/novel-promotion/[projectId]/props` - 获取道具列表
- `PATCH /api/novel-promotion/[projectId]/props` - 更新道具信息
- `DELETE /api/novel-promotion/[projectId]/props?id=xxx` - 删除道具

**项目道具图片 API：**
- `POST /api/novel-promotion/[projectId]/props/images` - 添加图片
- `GET /api/novel-promotion/[projectId]/props/images?propId=xxx` - 获取图片列表
- `PATCH /api/novel-promotion/[projectId]/props/images` - 更新图片
- `DELETE /api/novel-promotion/[projectId]/props/images?id=xxx` - 删除图片

**全局道具 API：**
- `POST /api/asset-hub/props` - 创建全局道具
- `GET /api/asset-hub/props?folderId=xxx` - 获取全局道具列表
- `PATCH /api/asset-hub/props` - 更新全局道具
- `DELETE /api/asset-hub/props?id=xxx` - 删除全局道具

**全局道具图片 API：**
- `POST /api/asset-hub/props/images` - 添加全局道具图片
- `GET /api/asset-hub/props/images?propId=xxx` - 获取全局道具图片列表
- `PATCH /api/asset-hub/props/images` - 更新全局道具图片
- `DELETE /api/asset-hub/props/images?id=xxx` - 删除全局道具图片

**复制功能：**
- `POST /api/novel-promotion/[projectId]/props/copy-from-global` - 从全局道具复制到项目

**特性：**
- 完整的权限验证（项目级、用户级）
- 错误处理和验证
- 级联操作支持

#### Phase 4: UI 组件
**创建了4个核心 React 组件：**

1. **PropCard.tsx** - 道具卡片组件
   - 显示道具图像、名称、分类
   - 支持编辑、删除操作
   - 分类标签带颜色编码
   - 响应式网格布局

2. **PropEditModal.tsx** - 道具编辑模态框
   - 编辑名称、分类、描述
   - 10种分类选择器
   - 保存验证和错误处理

3. **PropCreationModal.tsx** - 道具创建模态框
   - 创建新道具
   - 初始分类选择
   - 可选描述

4. **PropGrid.tsx** - 道具网格容器
   - 显示道具列表
   - 支持删除、编辑操作
   - 空状态提示
   - 响应式布局

**特性：**
- 完整的 CRUD 操作
- 错误处理和加载状态
- 国际化支持（中英文）
- 响应式设计

## 架构设计

### 三层结构
```
全局资产层 (GlobalProp)
    ↓ 复制
项目资产层 (NovelPromotionProp)
    ↓ 关联
使用层 (NovelPromotionClip.props)
```

### 分类系统
- **weapon** - 武器（刀、枪、弓等）
- **clothing** - 服装配饰（衣服、帽子、鞋等）
- **furniture** - 家具（椅子、桌子、床等）
- **food** - 食物饮品（饭、酒、水等）
- **vehicle** - 交通工具（车、船、飞机等）
- **tool** - 工具（锤子、钳子、扳手等）
- **decoration** - 装饰品（画、花瓶、灯等）
- **electronic** - 电子产品（手机、电脑、电视等）
- **nature** - 自然物品（石头、树木、花等）
- **other** - 其他

## 文件清单

### 数据库
- `prisma/schema.prisma` - 新增 5 个模型

### API 路由
- `/src/app/api/novel-promotion/[projectId]/props/route.ts`
- `/src/app/api/novel-promotion/[projectId]/props/images/route.ts`
- `/src/app/api/novel-promotion/[projectId]/props/copy-from-global/route.ts`
- `/src/app/api/asset-hub/props/route.ts`
- `/src/app/api/asset-hub/props/images/route.ts`

### 提示词
- `lib/prompts/novel-promotion/prop_extract.zh.txt`
- `lib/prompts/novel-promotion/prop_extract.en.txt`
- `lib/prompts/novel-promotion/prop_description_generate.zh.txt`
- `lib/prompts/novel-promotion/prop_description_generate.en.txt`
- `lib/prompts/novel-promotion/panel_prop_extract.zh.txt`
- `lib/prompts/novel-promotion/panel_prop_extract.en.txt`
- `lib/prompts/novel-promotion/panel_prop_fusion.zh.txt`
- `lib/prompts/novel-promotion/panel_prop_fusion.en.txt`
- `lib/prompts/novel-promotion/prop_consistency_check.zh.txt`
- `lib/prompts/novel-promotion/prop_consistency_check.en.txt`

### UI 组件
- `src/components/shared/assets/PropCard.tsx`
- `src/components/shared/assets/PropEditModal.tsx`
- `src/components/shared/assets/PropCreationModal.tsx`
- `src/components/shared/assets/PropGrid.tsx`
- `src/components/shared/assets/index.ts` - 已更新导出

## 后续工作（Phase 5-9）

### Phase 5: 资产中心集成
- 在 AssetHub 页面集成全局道具管理
- 支持文件夹组织
- 道具库搜索和筛选

### Phase 6: 剧本页面集成
- ScriptViewAssetsPanel 支持道具显示和编辑
- 剧本中的道具关联管理

### Phase 7: 创作流程集成
- story-to-script orchestrator 集成道具提取
- 与角色、场景并行处理

### Phase 8: 分镜融合
- script-to-storyboard 中的道具融合
- 道具与角色场景融合到分镜提示词

### Phase 9: 测试和优化
- 单元测试
- 集成测试
- 性能优化

## 核心设计特点

1. **一致性保证**
   - 标准描述 + 版本控制 + 自动检查
   - 同一道具在不同分镜中保持一致

2. **灵活关联**
   - 支持角色、场景、分镜的多维关联
   - 支持出场道具的精确追踪

3. **智能融合**
   - AI 自动融合道具到分镜提示词
   - 保持视觉和逻辑的连贯性

4. **全局复用**
   - 支持跨项目的道具库复用
   - 减少重复工作

## 使用示例

### 创建全局道具
```typescript
POST /api/asset-hub/props
{
  "name": "古董怀表",
  "category": "electronic",
  "description": "金色的古董怀表，表面有精细的雕刻"
}
```

### 复制到项目
```typescript
POST /api/novel-promotion/[projectId]/props/copy-from-global
{
  "globalPropId": "xxx"
}
```

### 添加道具图片
```typescript
POST /api/novel-promotion/[projectId]/props/images
{
  "propId": "xxx",
  "imageUrl": "https://...",
  "description": "金色表壳，精细雕刻"
}
```

## 技术栈
- **框架**: Next.js 15 + React 19
- **数据库**: MySQL + Prisma ORM
- **认证**: NextAuth.js
- **国际化**: next-intl
- **样式**: Tailwind CSS

## 总结
道具系统的实现遵循了项目现有的架构模式，与角色、场景、配音系统保持高度一致。通过完整的数据库设计、API 实现和 UI 组件，为项目提供了强大的道具管理能力。系统支持全局复用、版本控制、一致性检查等高级特性，为后续的创作流程集成奠定了坚实的基础。
