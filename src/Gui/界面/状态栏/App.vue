<template>
  <div class="ghost-root" :class="{ open, crash, daylight }">
    <div class="ghost-title" @click="open = !open">
      <span class="ghost-ic">◌</span>
      <span class="ghost-name">{{ displayName }}</span>
      <span v-if="rankLabel" class="ghost-rank" :title="rankFull">{{ rankLabel }}</span>
      <span class="ghost-time" :title="timeFull">{{ timeIcon }}<template v-if="timeText"> {{ timeText }}</template><template v-if="seasonText"> <i class="t-season">{{ seasonText }}</i></template></span>
      <span class="ghost-chev">▾</span>
      <span class="ghost-core">
        <span class="ghost-gauge g-grime" :class="{ flash: grudgeFlash }" title="怨气：执念与恨意化为的力量，越强解锁越多先天能力，也越侵蚀记忆">
          <span class="g-label">怨气</span>
          <span class="g-track"><i :style="{ width: grudge + '%' }"></i></span>
          <span class="g-val">{{ grudge }}%</span>
          <span class="g-delta" :class="{ up: grudgeDelta > 0 }" v-if="grudgeDelta">{{ grudgeDelta > 0 ? '+' + grudgeDelta : grudgeDelta }}</span>
        </span>
        <span class="ghost-gauge g-fade" :class="{ flash: memoryFlash }" title="记忆：生前的记忆与人性，随怨气增长流失，归零则忘记自己是谁">
          <span class="g-label">记忆</span>
          <span class="g-track"><i :style="{ width: memory + '%' }"></i></span>
          <span class="g-val">{{ memory }}%</span>
          <span class="g-delta" :class="{ up: memoryDelta > 0 }" v-if="memoryDelta">{{ memoryDelta > 0 ? '+' + memoryDelta : memoryDelta }}</span>
        </span>
      </span>
    </div>

    <div class="ghost-body">
      <div class="ghost-tabs">
        <span
          v-for="t in tabs"
          :key="t.key"
          class="ghost-tab"
          :class="{ on: activeTab === t.key }"
          @click.stop="activeTab = t.key"
        >{{ t.label }}</span>
      </div>
      <div class="ghost-tabpanes">
        <StatusSection v-show="activeTab === 'status'" />
        <TruthSection v-show="activeTab === 'truth'" />
        <AbilitySection v-show="activeTab === 'ability'" />
        <ThreatSection v-show="activeTab === 'threat'" />
        <OnSiteSection v-show="activeTab === 'onsite'" />
        <ItemsSection v-show="activeTab === 'items'" />
        <ClueSection v-show="activeTab === 'clue'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDataStore } from './store';
import StatusSection from './components/StatusSection.vue';
import TruthSection from './components/TruthSection.vue';
import AbilitySection from './components/AbilitySection.vue';
import ThreatSection from './components/ThreatSection.vue';
import OnSiteSection from './components/OnSiteSection.vue';
import ItemsSection from './components/ItemsSection.vue';
import ClueSection from './components/ClueSection.vue';

const store = useDataStore();

const open = useLocalStorage<boolean>('gui:statusbar:open', false);
// 折叠时暂停轮询（省掉后台空转），展开时恢复并立即同步最新数据
watch(open, (v) => {
  if (v) {
    store.resumePolling();
  } else {
    store.pausePolling();
  }
});
if (!open.value) {
  store.pausePolling();
}
// 选项卡：默认停在「状态」，本地记忆上次停留
const activeTab = useLocalStorage<string>('gui:statusbar:tab', 'status');
const tabs = [
  { key: 'status', label: '状态' },
  { key: 'truth', label: '真相' },
  { key: 'ability', label: '修炼' },
  { key: 'threat', label: '威胁' },
  { key: 'onsite', label: '在场' },
  { key: 'items', label: '物品' },
  { key: 'clue', label: '线索' },
];

const ghost = computed(() => store.data.鬼魂);
const world = computed(() => store.data.世界);

const grudge = computed(() => Math.max(0, Math.min(100, Number(ghost.value['怨气'] ?? 0))));
const memory = computed(() => Math.max(0, Math.min(100, Number(ghost.value['记忆'] ?? 0))));

// ── 怨气/记忆变化反馈：数值增减时短暂显示 +X/-X 徽章并让进度条闪烁 ──
const grudgeDelta = ref(0);
const memoryDelta = ref(0);
const grudgeFlash = ref(false);
const memoryFlash = ref(false);
let grudgeTimer: ReturnType<typeof setTimeout> | undefined;
let memoryTimer: ReturnType<typeof setTimeout> | undefined;

watch(grudge, (nv, ov) => {
  if (typeof ov === 'number' && nv !== ov) {
    grudgeDelta.value = Math.round(nv - ov);
    grudgeFlash.value = true;
    clearTimeout(grudgeTimer);
    grudgeTimer = setTimeout(() => {
      grudgeDelta.value = 0;
      grudgeFlash.value = false;
    }, 2600);
  }
});
watch(memory, (nv, ov) => {
  if (typeof ov === 'number' && nv !== ov) {
    memoryDelta.value = Math.round(nv - ov);
    memoryFlash.value = true;
    clearTimeout(memoryTimer);
    memoryTimer = setTimeout(() => {
      memoryDelta.value = 0;
      memoryFlash.value = false;
    }, 2600);
  }
});

const displayName = computed(() => {
  const name = ghost.value['姓名'] || '';
  const remembers = ghost.value['是否记得自己'] !== false;
  // 记忆流失或忘记自己 → ？？？
  if (memory.value <= 30 || !remembers) {
    return '？？？';
  }
  // 玩家扮演：<user> / {{user}} 宏都显示为「你」
  if (name === '<user>' || name === '{{user}}') {
    return '你';
  }
  if (name === '' || name === '待初始化') {
    return '？？？';
  }
  return name;
});

const timeIcon = computed(() => {
  const map: Record<string, string> = { 白天: '☀', 黄昏: '🌇', 夜晚: '🌙', 凌晨: '🌄' };
  return map[world.value['时辰'] || '夜晚'] || '🌙';
});

// 具体时间文本：如「2024年3月·深夜」→ 显示「3月·深夜」；未初始化则隐藏文本
const currentTime = computed(() => world.value['当前时间'] || '');
const timeText = computed(() => {
  const t = currentTime.value;
  if (!t || t === '待初始化') return '';
  // 去掉开头的年份，保留「M月·时段」，避免标题栏过长
  return t.replace(/^\d{4}年/, '');
});

// 季节图标（标题栏紧凑版）：🌸春 ☀夏 🍂秋 ❄冬
const seasonIconMap: Record<string, string> = { 春: '🌸', 夏: '☀', 秋: '🍂', 冬: '❄' };
const seasonText = computed(() => {
  const s = world.value['季节'] || '';
  const icon = seasonIconMap[s];
  return icon || '';
});

// 悬停完整时间：干支纪年 + 季节 + 十二时辰 + 当前时间 + 农历/节气 + 数字日期 + 节日
const timeFull = computed(() => {
  const parts: string[] = [];
  const ganzhi = world.value['干支纪年'] || '';
  if (ganzhi && ganzhi !== '待初始化') parts.push(ganzhi);
  const season = world.value['季节'] || '';
  if (season) parts.push(`${season}季`);
  const shichen = world.value['十二时辰'] || '';
  if (shichen && shichen !== '待初始化') parts.push(shichen);
  if (currentTime.value && currentTime.value !== '待初始化') parts.push(currentTime.value);
  const lunar = world.value['农历日期'] || '';
  const jieqi = world.value['节气'] || '';
  const lunarParts = [
    lunar && lunar !== '待初始化' && lunar !== '无' ? lunar : '',
    jieqi && jieqi !== '待初始化' && jieqi !== '无' ? jieqi : '',
  ].filter(Boolean);
  if (lunarParts.length) parts.push(lunarParts.join('·'));
  const digital = world.value['数字日期'] || '';
  if (digital && digital !== '待初始化') parts.push(digital);
  const festival = world.value['节日'] || '';
  if (festival && festival !== '待初始化' && festival !== '无') parts.push(festival);
  return parts.join('｜') || '时间';
});

const daylight = computed(() => world.value['时辰'] === '白天');
const crash = computed(() => grudge.value >= 80 || memory.value <= 20);

// 阶位徽章：完整显示「四阶·厉鬼」，手机端可被 CSS 压缩
const rankFull = computed(() => {
  const rank = ghost.value['阶位'] || '';
  return rank && rank !== '待初始化' ? rank : '';
});
const rankLabel = computed(() => rankFull.value);
</script>

<style lang="scss" scoped>
.ghost-root {
  font-family: var(--font-tomb);
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: linear-gradient(180deg, #0d1417, #101d22);
  border: 1px solid var(--c-water);
  border-radius: 10px;
  color: var(--c-flesh);
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.55), inset 0 0 30px rgba(120, 130, 140, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.3;
    background-image:
      radial-gradient(ellipse at 18% 8%, rgba(120, 130, 140, 0.22), transparent 45%),
      radial-gradient(ellipse at 82% 92%, rgba(154, 125, 90, 0.12), transparent 40%),
      radial-gradient(ellipse at 55% 45%, rgba(142, 42, 42, 0.07), transparent 50%);
  }
}

.ghost-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--c-line);
  position: relative;
}

.ghost-ic {
  color: var(--c-water);
  font-size: 1.05rem;
  animation: ghostFloat 3s ease-in-out infinite;
}

.ghost-name {
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.08em;
}

.ghost-time {
  font-size: 1rem;
}

.ghost-core {
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 140px;
}

.ghost-gauge {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 14px;
}

.g-label {
  flex-shrink: 0;
  font-size: 0.62rem;
  color: var(--c-mist);
  letter-spacing: 0.1em;
  width: 2em;
  text-align: right;
  line-height: 1;
}

.g-track {
  flex: 1;
  height: 7px;
  border-radius: 4px;
  background: rgba(122, 139, 148, 0.18);
  overflow: hidden;
  border: 1px solid rgba(122, 139, 148, 0.22);

  i {
    display: block;
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
  }
}

/* 数值与增减反馈 */
.g-val {
  flex-shrink: 0;
  font-size: 0.6rem;
  color: var(--c-mist);
  width: 2.6em;
  text-align: left;
  line-height: 1;
}

.g-delta {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: bold;
  color: var(--c-grime);
  animation: gDeltaFade 2.6s ease forwards;
}

.g-delta.up {
  color: var(--c-phos);
}

.ghost-gauge.flash i {
  animation: gFlash 0.65s ease 3;
}

@keyframes gFlash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.85); }
}

@keyframes gDeltaFade {
  0% { opacity: 1; transform: translateY(-1px); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-9px); }
}

.g-grime i {
  background: linear-gradient(90deg, #5a1b1b, var(--c-grime));
}

.g-fade i {
  background: linear-gradient(90deg, var(--c-fade), #c3ccd1);
}

.ghost-chev {
  margin-left: auto;
  color: var(--c-mist);
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.ghost-body {
  padding: 10px 12px;
  position: relative;
}

/* 选项卡导航：横排按钮，选中项高亮 */
.ghost-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.ghost-tab {
  flex: 1;
  min-width: 56px;
  text-align: center;
  padding: 4px 8px;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  color: var(--c-mist);
  border: 1px solid var(--c-line);
  border-radius: 6px;
  background: rgba(13, 20, 23, 0.55);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.ghost-tab:hover {
  color: var(--c-flesh);
  border-color: var(--c-phos);
}

.ghost-tab.on {
  color: var(--c-phos);
  border-color: var(--c-phos);
  background: rgba(74, 125, 107, 0.12);
  box-shadow: 0 0 6px rgba(154, 124, 75, 0.25);
}

.ghost-tabpanes > .ghost-sec:last-child {
  margin-bottom: 0;
}

.ghost-root:not(.open) .ghost-body {
  display: none;
}

.ghost-root.open .ghost-chev {
  transform: rotate(180deg);
}

/* 情境覆盖：惨死态（怨气≥80 或 记忆≤20）——血色与碎裂的车祸感 */
.ghost-root.crash {
  .ghost-title {
    background: rgba(142, 42, 42, 0.12);
  }
  .ghost-name {
    color: var(--c-grime);
    text-shadow: 0 0 8px rgba(142, 42, 42, 0.5);
  }
  &::before {
    opacity: 0.5;
  }
  .ghost-body {
    background: rgba(142, 42, 42, 0.05);
  }
}

/* 白天警告 */
.ghost-root.daylight {
  .ghost-time {
    color: #c9a227;
    text-shadow: 0 0 6px rgba(201, 162, 39, 0.6);
  }
  .ghost-title {
    border-bottom-color: rgba(201, 162, 39, 0.4);
  }
}

/* 手机：7 个 tab 保持一行紧凑排布 */
@media (max-width: 480px) {
  .ghost-tabs {
    gap: 4px;
    margin-bottom: 6px;
  }
  .ghost-tab {
    min-width: 44px;
    padding: 3px 5px;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    border-radius: 5px;
  }
}

@media (max-width: 360px) {
  .ghost-tabs {
    gap: 3px;
    margin-bottom: 5px;
  }
  .ghost-tab {
    min-width: 38px;
    padding: 2px 3px;
    font-size: 0.66rem;
    letter-spacing: 0.06em;
  }
}

@keyframes ghostFloat {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-2px);
    opacity: 1;
  }
}

/* 手机窄屏：标题栏允许换行，收窄间距与字号 */
@media (max-width: 480px) {
  .ghost-root {
    font-size: 12.5px;
  }
  .ghost-title {
    flex-wrap: wrap;
    gap: 4px 8px;
    padding: 7px 9px;
  }
  .ghost-name {
    font-size: 1rem;
    letter-spacing: 0.04em;
  }
  .ghost-core {
    order: 9; /* 条形图整行铺底 */
    flex-basis: 100%;
    min-width: 0;
  }
  .ghost-chev {
    margin-left: auto;
  }
  .ghost-body {
    padding: 8px 9px;
  }
  .ghost-tab {
    min-width: 0;
    padding: 3px 4px;
    font-size: 0.74rem;
    letter-spacing: 0.12em;
  }
}
</style>
