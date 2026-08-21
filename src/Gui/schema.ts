// 鬼（Gui）MVU 变量结构
// 由 tavern-cards-forge 通过 jiti 加载，z (Zod v4) 与 _ (lodash) 已全局注入，禁止任何 import

export const Schema = z.object({
  世界: z.object({
    当前时间: z.string().describe('当前剧情时间，如 2024年3月·深夜').or(z.literal('待初始化')).prefault('待初始化'),
    当前区域: z.string().describe('当前所在地：河边/家族老宅/家族私立医院/鬼市/废弃防空地道/高架桥下/城中别墅等').or(z.literal('待初始化')).prefault('待初始化'),
    时辰: z.enum(['白天', '黄昏', '夜晚', '凌晨']).describe('白天必须躲藏，夜晚才能行动').prefault('夜晚'),
    当前幕: z.enum([
      '第一幕·觉醒', '第二幕·初次尝试', '第三幕·人间的另一个窗口',
      '第四幕·削弱家族屏障', '第五幕·医院中的其他鬼', '第六幕·灭族', '第七幕·之后'
    ]).describe('当前主线幕，驱动阶段指导与剧情进度EJS').prefault('第一幕·觉醒'),
    当前剧情阶段: z.string().describe('当前剧情进展描述').or(z.literal('待初始化')).prefault('待初始化'),
  }).prefault({}),

  鬼魂: z.object({
    姓名: z.string().describe('生前的名字；记忆归零或未定时显示为？？？').prefault('待初始化'),
    是否记得自己: z.boolean().prefault(true),
    怨气: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('核心力量，越恨越强，增长解锁能力、也侵蚀记忆').prefault(20),
    记忆: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('生前记忆与人性，随怨气增长流失；归零则忘记自己是谁').prefault(90),
    形态: z.string().describe('溺水形态：半透明、披头散发、浑身滴水').prefault('溺水形态：半透明，浑身滴水'),
    隐匿度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('收敛怨气、压低存在感，越高越不易被察觉').prefault(30),
    伤势: z.string().describe('被法器/阳光/其他鬼所伤的状态').or(z.literal('无')).prefault('无'),
    香火: z.coerce.number().transform(v => _.clamp(v, 0, 9999)).describe('鬼的能量来源；无人祭祀时靠鬼市情报交换获取').prefault(0),
    住处: z.string().describe('鬼的住处：防空洞/鬼市外围/医院旧楼').or(z.literal('待初始化')).prefault('待初始化'),
  }).prefault({}),

  能力: z.record(z.string(), z.object({
    是否解锁: z.boolean().prefault(false),
    等级: z.coerce.number().transform(v => _.clamp(v, 1, 5)).prefault(1),
    描述: z.string().prefault(''),
  })).describe('随怨气阈值解锁：40入梦/60科技骚扰/80区域作祟').prefault({}),

  复仇: z.object({
    当前目标: z.string().describe('当前复仇目标').or(z.literal('待初始化')).prefault('待初始化'),
    家族成员: z.record(z.string(), z.object({
      身份: z.string().describe('如 老家主/老板/堂兄/旁系').prefault(''),
      状态: z.enum(['活着', '重伤', '疯狂', '死亡']).prefault('活着'),
      死因: z.string().describe('表面死因（心脏病/中风/自杀/车祸）').prefault(''),
    })).describe('灭族名单，随剧情增删').prefault({}),
    妻子: z.object({
      状态: z.enum(['活着', '恐惧', '疯狂', '死亡']).prefault('活着'),
      位置: z.string().prefault('待初始化'),
    }).prefault({}),
    防护屏障: z.object({
      供奉道士: z.enum(['在场', '被离间', '已离开', '无']).prefault('在场'),
      祖坟阵法: z.enum(['完好', '出现缺口', '已污染', '崩毁']).prefault('完好'),
      血脉气运: z.enum(['完好', '受损', '断裂']).prefault('完好'),
    }).prefault({}),
    罪证: z.object({
      进度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('老宅密室罪证收集进度').prefault(0),
      见证者: z.string().describe('女鬼要求留的活见证人').or(z.literal('无')).prefault('无'),
    }).prefault({}),
  }).prefault({}),

  鬼界: z.object({
    地盘: z.string().describe('当前所在鬼的地盘').or(z.literal('待初始化')).prefault('待初始化'),
    鬼市关系: z.enum(['未知', '被驱逐', '可进入', '常客']).prefault('未知'),
    庇护: z.string().describe('愿意帮主角的鬼/人').or(z.literal('无')).prefault('无'),
    敌人: z.string().describe('鬼界敌人').or(z.literal('无')).prefault('无'),
  }).prefault({}),

  威胁: z.object({
    阳光暴露: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('白天暴露在阳光下的危险度').prefault(0),
    阴差注意: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('地府查访关注度，过高会被鬼差盯上').prefault(0),
    被捉鬼人盯上: z.boolean().prefault(false),
  }).prefault({}),

  隐藏: z.object({
    人性残余: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('越来越不像人的程度；残余越低越接近恶鬼').prefault(100),
    记忆碎片: z.string().describe('还记得的生前碎片：妻子脸/住址/工作/名字').or(z.literal('待初始化')).prefault('待初始化'),
  }).prefault({}),
}).prefault({});

export type Schema = z.output<typeof Schema>;
