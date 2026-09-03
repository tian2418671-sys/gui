<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">状 态</div>
    <div class="ghost-grid2">
      <div class="ghost-item"><span class="lbl">阶位</span><span class="val">{{ rank }}</span></div>
      <div class="ghost-item"><span class="lbl">形态</span><span class="val">{{ ghost['形态'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">区域</span><span class="val">{{ world['当前区域'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">隐匿</span><span class="val">{{ stealth }}%</span></div>
      <div class="ghost-item"><span class="lbl">香火/生煞</span><span class="val">{{ incense }} / {{ shengsha }}</span></div>
      <div class="ghost-item"><span class="lbl">住处</span><span class="val">{{ ghost['住处'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">伤势</span><span class="val">{{ ghost['伤势'] || '无' }}</span></div>
      <div class="ghost-item"><span class="lbl">人性残余</span><span class="val">{{ humanity }}%</span></div>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">时间</span>
      <span class="val time-block">
        <span class="time-line t-main">{{ timeMain }}</span>
        <span v-if="timeLunar" class="time-line t-sub">{{ timeLunar }}</span>
        <span v-if="digitalDate" class="time-line t-sub">{{ digitalDate }}</span>
        <span v-if="festival" class="time-line t-festival">🕯 {{ festival }}</span>
      </span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">剧情阶段</span><span class="val">{{ world['当前剧情阶段'] || '—' }}</span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">噬魂</span>
      <span class="val">
        {{ devourCount }} 次<template v-if="devourFragments"> · <span :title="'吞噬融忆所得记忆碎片（剧情线索）' + '\n' + devourFragments" style="cursor: help">{{ devourFragments }}</span></template>
      </span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">执念物</span>
      <span class="val anchor-list">
        <template v-if="anchorItems.length">
          <span v-for="a in anchorItems" :key="a.name" class="anchor-tag" :class="a.state && a.state !== '完好' ? 'bad' : ''" :title="a.memo">
            {{ a.name }}<template v-if="a.state && a.state !== '完好'">·{{ a.state }}</template>
          </span>
        </template>
        <template v-else>无</template>
      </span>
    </div>
    <div class="ghost-sec-inner">
      <div class="ghost-sec-head">鬼 界</div>
      <div class="ghost-grid2">
        <div class="ghost-item"><span class="lbl">地盘</span><span class="val">{{ nether['地盘'] || '—' }}</span></div>
        <div class="ghost-item"><span class="lbl">鬼市</span><span class="val">{{ nether['鬼市关系'] || '—' }}</span></div>
        <div class="ghost-item"><span class="lbl">庇护</span><span class="val">{{ nether['庇护'] || '无' }}</span></div>
        <div class="ghost-item"><span class="lbl">敌人</span><span class="val">{{ nether['敌人'] || '无' }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const ghost = computed(() => store.data.鬼魂);
const world = computed(() => store.data.世界);
const hidden = computed(() => store.data.隐藏);
const nether = computed(() => store.data.鬼界);

const stealth = computed(() => Math.max(0, Math.min(100, Number(ghost.value['隐匿度'] ?? 0))));
const incense = computed(() => (ghost.value['香火'] ?? '—') === '' ? '—' : ghost.value['香火'] ?? '—');
const shengsha = computed(() => (ghost.value['生煞'] ?? '—') === '' ? '—' : ghost.value['生煞'] ?? '—');
const humanity = computed(() => Math.max(0, Math.min(100, Number(hidden.value['人性残余'] ?? 100))));

const rank = computed(() => ghost.value['阶位'] || '—');

// 噬魂融忆：次数 + 吞噬所得他人记忆碎片（推进剧情的线索来源，悬停看全文）
const devour = computed(() => ghost.value['噬魂'] || {});
const devourCount = computed(() => Number((devour.value as Record<string, unknown>)['次数'] ?? 0));
const devourFragments = computed(() => String((devour.value as Record<string, unknown>)['所得碎片'] || '').trim());

// 时间块（多行）：
// 主行：时辰图标 + 季节 + 干支纪年 + 十二时辰 + 当前时间（如 🌙 春·甲辰年·子时·3月·深夜）
// 副行1：农历日期 + 节气（如 二月十二·春分）
// 副行2：数字日期（如 2024年3月21日·星期四）
// 节日行：当前节日（如 🕯 中元节）
const seasonIcon = computed(() => {
  const map: Record<string, string> = { 春: '🌸', 夏: '☀', 秋: '🍂', 冬: '❄' };
  return map[world.value['季节'] || ''] || '';
});
const timeMain = computed(() => {
  const t = world.value['当前时间'] || '';
  const s = world.value['时辰'] || '';
  const iconMap: Record<string, string> = { 白天: '☀', 黄昏: '🌇', 夜晚: '🌙', 凌晨: '🌄' };
  const icon = iconMap[s] || '🌙';
  const parts: string[] = [];
  const season = seasonIcon.value;
  if (season) parts.push(season);
  const ganzhi = world.value['干支纪年'] || '';
  if (ganzhi && ganzhi !== '待初始化') parts.push(ganzhi);
  const shichen = world.value['十二时辰'] || '';
  if (shichen && shichen !== '待初始化') parts.push(shichen);
  const clean = t && t !== '待初始化' ? t.replace(/^\d{4}年/, '') : '';
  if (clean) parts.push(clean);
  const base = parts.join('·');
  return (base ? `${icon} ${base}` : icon);
});
const timeLunar = computed(() => {
  const lunar = world.value['农历日期'] || '';
  const jieqi = world.value['节气'] || '';
  const lp = lunar && lunar !== '待初始化' && lunar !== '无' ? lunar : '';
  const jp = jieqi && jieqi !== '待初始化' && jieqi !== '无' ? jieqi : '';
  return [lp, jp].filter(Boolean).join('·');
});
const digitalDate = computed(() => {
  const d = world.value['数字日期'] || '';
  return d && d !== '待初始化' ? d : '';
});
const festival = computed(() => {
  const f = world.value['节日'] || '';
  return f && f !== '待初始化' && f !== '无' ? f : '';
});

// 执念物：列出持有执念物及状态（完好/磨损/被夺/被毁），悬停显示锚定记忆
const anchorItems = computed(() => {
  const anchors = hidden.value['锚物'] || {};
  return Object.entries(anchors).map(([name, v]) => {
    const obj = v as { 状态?: string; 锚定记忆?: string };
    return {
      name,
      state: obj['状态'],
      memo: obj['锚定记忆'] || '',
    };
  });
});
</script>
