// 鬼（Gui）MVU 变量结构
// 由 tavern-cards-forge 通过 jiti 加载，z (Zod v4) 与 _ (lodash) 已全局注入，禁止任何 import

export const Schema = z.object({
  世界: z.object({
    当前时间: z.string().describe('当前剧情时间，如 2024年3月·深夜').or(z.literal('待初始化')).prefault('待初始化'),
    当前区域: z.string().describe('当前所在地：河边/家族老宅/家族私立医院/鬼市/废弃防空地道/高架桥下/城中别墅等').or(z.literal('待初始化')).prefault('待初始化'),
    时辰: z.enum(['白天', '黄昏', '夜晚', '凌晨']).describe('白天必须躲藏，夜晚才能行动').prefault('夜晚'),
    当前幕: z.enum([
      '第一幕·觉醒', '第二幕·初次尝试', '第三幕·人间的另一个窗口',
      '第四幕·削弱家族屏障', '第五幕·医院中的其他鬼', '第六幕·灭族', '第七幕·之后',
      '沙盒模式·游历'
    ]).describe('当前主线幕，复仇完成后进入沙盒模式自由游历').prefault('第一幕·觉醒'),
    当前剧情阶段: z.string().describe('当前剧情进展描述').or(z.literal('待初始化')).prefault('待初始化'),
    自动生成角色: z.enum(['开启', '关闭']).describe('实验功能开关：AI 生成新角色时是否套用「角色生成算法」预设模板，关闭则回到基础规则').prefault('开启'),
  }).prefault({}),

  鬼魂: z.object({
    姓名: z.string().describe('生前的名字；记忆归零或未定时显示为？？？').prefault('待初始化'),
    是否记得自己: z.boolean().prefault(true),
    怨气: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('核心力量，越恨越强，增长解锁能力、也侵蚀记忆').prefault(20),
    记忆: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('生前记忆与人性，随怨气增长流失；归零则忘记自己是谁').prefault(90),
    形态: z.string().describe('撞死形态：半透明、身上带撞击伤、衣襟有血迹，永远维持死亡瞬间的样子').prefault('撞死形态：半透明，身上带撞击伤，衣襟有血迹'),
    隐匿度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('收敛怨气、压低存在感，越高越不易被察觉').prefault(30),
    伤势: z.string().describe('被法器/阳光/其他鬼所伤的状态').or(z.literal('无')).prefault('无'),
    香火: z.coerce.number().transform(v => _.clamp(v, 0, 9999)).describe('鬼的能量来源；无人祭祀时靠鬼市情报交换获取').prefault(0),
    住处: z.string().describe('鬼的住处：防空洞/鬼市外围/医院旧楼').or(z.literal('待初始化')).prefault('待初始化'),
    阶位: z.enum([
      '一阶·孤魂野鬼', '二阶·游魂阴鬼', '三阶·怨鬼', '四阶·厉鬼', '五阶·凶煞',
      '六阶·夜叉', '七阶·鬼将', '八阶·鬼王', '九阶·鬼仙'
    ]).describe('鬼的成长阶位，满足「鬼的能力·鬼阶晋升体系」门槛时逐阶晋升，不越级').prefault('一阶·孤魂野鬼'),
    修炼: z.object({
      魂质与死相: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('维度一·自身凝实度与死相炼化').prefault(10),
      因果与煞气: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('维度二·情绪驱动力与外部能量摄取转化').prefault(10),
      锚点与灵智: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('维度三·对抗失真遗忘的自保机制').prefault(10),
      法域与威慑: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('维度四·对所在环境与阴阳秩序的影响力').prefault(5),
    }).describe('鬼道修炼四维：晋升需四维同步成长，缺一不可；满 100 即达当前阶位晋升门槛').prefault({}),
    噬魂: z.object({
      次数: z.coerce.number().transform(v => _.clamp(v, 0, 99)).describe('吞噬同类亡魂的次数；每施展一次噬魂融忆+1，越多魂相越浊、阴差注意越高').prefault(0),
      所得碎片: z.string().describe('噬魂融忆获得的他人记忆碎片（格式：来源——情报内容），多条用；分隔；可推动剧情的新线索').prefault(''),
    }).describe('噬魂融忆：吞噬同类亡魂固魂抗失忆 + 搜魂读忆').prefault({}),
  }).prefault({}),

  能力: z.object({
    先天: z.record(z.string(), z.object({
      是否解锁: z.boolean().prefault(false),
      等级: z.coerce.number().transform(v => _.clamp(v, 1, 5)).prefault(1),
      熟练度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('修炼进度：使用/积累提升，满 100 时等级+1 并清零').prefault(0),
      描述: z.string().prefault(''),
    })).describe('先天能力：鬼天生会的基础主动能力（灯灭镜裂/温度骤降/入梦/附身等），虽是本能也需在剧情中摸索、失控或尝试时觉醒掌握，初始皆未解锁；怨气阈值（40入梦/60科技骚扰/80区域作祟）仅为可感知的门槛').prefault({}),
    后天: z.record(z.string(), z.object({
      是否解锁: z.boolean().prefault(false),
      等级: z.coerce.number().transform(v => _.clamp(v, 1, 5)).prefault(1),
      熟练度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('修炼进度：使用/积累提升，满 100 时等级+1 并清零').prefault(0),
      描述: z.string().prefault(''),
    })).describe('后天能力：修炼道路上动态习得的主动法门，由「后天法门目录」生成算法按阶位引入，须满足修行门槛方可解锁').prefault({}),
    被动: z.record(z.string(), z.object({
      是否获得: z.boolean().prefault(false),
      描述: z.string().prefault(''),
    })).describe('被动现象：修为自然形成的状态，不是主动能力、只是一个现象的名字（如噬魂拼骨/惊煞采气/地煞生根/披人借阳/锚物凝魂），无等级无熟练度，达成门槛后显现').prefault({}),
  }).describe('能力分三类：先天为鬼天生主动基础能力（需摸索掌握）、后天为修炼所学主动法门（动态习得）、被动为修为自然形成的现象（非能力，仅是否获得）').prefault({}),

  复仇: z.object({
    当前目标: z.string().describe('当前复仇目标').or(z.literal('待初始化')).prefault('待初始化'),
    家族成员: z.record(z.string(), z.object({
      身份: z.string().describe('如 老家主/老板/堂兄/旁系').prefault(''),
      状态: z.enum(['活着', '疑神疑鬼', '神经衰弱', '濒临失控', '疯狂', '死亡']).describe('心理状态逐级下坠：活着→疑神疑鬼→神经衰弱→濒临失控→疯狂→死亡，不得越级').prefault('活着'),
      死因: z.string().describe('表面死因（心脏病/中风/自杀/车祸）').prefault(''),
    })).describe('灭族名单，随剧情增删').prefault({}),
    妻子: z.object({
      状态: z.enum(['活着', '疑神疑鬼', '恐惧', '神经衰弱', '濒临失控', '疯狂']).describe('孙紫心理状态逐级下坠，不得越级').prefault('活着'),
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

  在场角色: z.array(z.object({
    姓名: z.string().describe('角色姓名/称呼，如 孙紫/浅野千代/老刑警').prefault(''),
    性别: z.enum(['男', '女', '未知']).prefault('未知'),
    年龄: z.string().describe('年龄或年龄段，如 三十出头/花甲之年').prefault(''),
    穿着: z.string().describe('当前穿着特征概要，如 深灰大衣/素色旗袍').prefault(''),
    穿着详情: z.object({
      饰品: z.string().describe('首饰配件，如 玉镯/金链/银簪/耳坠').prefault(''),
      穿戴: z.string().describe('鞋帽/随身物，如 皮鞋/皮包/围巾/手表').prefault(''),
      衣服: z.string().describe('外衣/上衣下装，如 深灰大衣内搭白衬衫').prefault(''),
      内衣: z.string().describe('内衣内裤，如 素色贴身内衣').prefault(''),
    }).describe('展开后展示的详细穿着，含饰品/穿戴/衣服/内衣内裤').prefault({}),
    身份: z.string().describe('身份/关系，如 妻子/鬼市账房/老刑警').prefault(''),
    状态: z.string().describe('在场状态，如 在场/刚离开/昏迷/死亡').prefault('在场'),
  })).describe('当前场景在场的角色清单，随剧情进出增删').prefault([]),

  威胁: z.object({
    阳光暴露: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('白天暴露在阳光下的危险度').prefault(0),
    阴差注意: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('地府查访关注度，过高会被鬼差盯上').prefault(0),
    人间威胁: z.enum(['无', '散修', '魔修', '正道道士']).describe('被哪类活人方士盯上，越具体越危险；受信息迷雾控制').prefault('无'),
    鬼界敌意: z.enum(['无', '被挑衅', '结仇', '被追杀']).describe('鬼界恶鬼的敌意程度，作为鬼可直觉感知').prefault('无'),
  }).prefault({}),

  隐藏: z.object({
    人性残余: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('越来越不像人的程度；残余越低越接近恶鬼').prefault(100),
    记忆碎片: z.string().describe('还记得的生前碎片：妻子脸/住址/工作/名字').or(z.literal('待初始化')).prefault('待初始化'),
    锚物: z.record(z.string(), z.object({
      锚定记忆: z.string().describe('该锚物锚定的具体记忆片段').prefault(''),
      状态: z.enum(['完好', '磨损', '被夺', '被毁']).describe('完好→磨损（保护力下降）→被夺/被毁（记忆不可逆融化）').prefault('完好'),
    })).describe('执念锚物：生前物件锚定记忆，触碰抗磨损（记忆扣减最多抵消一半）；被毁则对应记忆格不可逆融化').prefault({}),
    已知: z.object({
      家族成员: z.array(z.string()).describe('已确认身份的神宗家族成员（存身份，如 老板/老家主/堂兄），剧情中认出后加入；未确认的成员状态栏不显示').prefault([]),
      屏障: z.boolean().describe('是否已探明家族防护屏障（供奉道士/祖坟阵法/血脉气运）；未探明时状态栏显示？？？').prefault(false),
      罪证: z.boolean().describe('是否已发现老宅密室罪证线索；未发现时状态栏显示？？？').prefault(false),
      捉鬼人: z.boolean().describe('是否察觉有捉鬼人盯上；未察觉时状态栏显示？').prefault(false),
    }).describe('状态栏信息迷雾：记录玩家已确认的信息，未确认的不在状态栏暴露').prefault({}),
  }).prefault({}),
}).prefault({});

export type Schema = z.output<typeof Schema>;
