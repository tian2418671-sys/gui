<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">威 胁</div>
    <div class="ghost-threat">
      <div class="thr-row"><span class="lbl">☀ 阳光暴露</span><span class="thr-bar" :title="sunHint"><i :style="{ width: sun + '%' }"></i></span><span class="thr-num">{{ sun }}%</span></div>
      <div class="thr-row"><span class="lbl">⚖ 阴差注意</span><span class="thr-bar" :title="grimHint"><i class="t-phos" :style="{ width: grim + '%' }"></i></span><span class="thr-num">{{ grim }}%</span></div>
      <div class="thr-row"><span class="lbl">🔪 人间威胁</span><span class="thr-flag" :title="humanHint">{{ humanThreat }}</span></div>
      <div v-if="known['捉鬼人'] !== true" class="fog-hint">{{ humanFogHint }}</div>
      <div class="thr-row"><span class="lbl">👻 鬼界敌意</span><span class="thr-flag" :class="netherLevel" :title="netherHint">{{ netherThreat }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const threat = computed(() => store.data.威胁);
const hidden = computed(() => store.data.隐藏);

const sun = computed(() => Math.max(0, Math.min(100, Number(threat.value['阳光暴露'] ?? 0))));
const grim = computed(() => Math.max(0, Math.min(100, Number(threat.value['阴差注意'] ?? 0))));

const sunHint = computed(() => `白天暴露在阳光下的危险度（当前 ${sun.value}%）；躲入阴影或入夜归零`);
const grimHint = computed(() => `地府查访关注度（当前 ${grim.value}%）；过高会被鬼差盯上`);

const known = computed(() => (hidden.value['已知'] || {}) as Record<string, unknown>);
// 隐藏的弱引导：未察觉捉鬼人时给出方向提示（不剧透答案），察觉后自动消失
const humanFogHint = '仇家不会坐视怪事不管——若有「高人」被请来，你会先嗅到不一样的气味';

// 信息迷雾：未察觉人间威胁前显示「？」
const humanThreat = computed(() => {
  const known = (hidden.value['已知'] || {}) as Record<string, unknown>;
  if (known['捉鬼人'] !== true) return '？';
  const v = threat.value['人间威胁'];
  return v === '无' || !v ? '暂无' : v;
});
const humanHint = computed(() => {
  const known = (hidden.value['已知'] || {}) as Record<string, unknown>;
  if (known['捉鬼人'] !== true) return '尚未察觉是否有活人方士盯上你';
  const v = threat.value['人间威胁'];
  return v === '无' || !v ? '暂无活人方士追踪' : `已被${v}盯上，须万分小心`;
});

// 鬼界敌意：作为鬼可直觉感知同类敌意，不受迷雾限制
const netherThreat = computed(() => {
  const v = threat.value['鬼界敌意'];
  return v === '无' || !v ? '暂无' : v;
});
const netherLevel = computed(() => {
  const v = threat.value['鬼界敌意'];
  if (v === '被追杀') return 'sev';
  if (v === '结仇') return 'warn';
  if (v === '被挑衅') return 'mid';
  return '';
});
const netherHint = computed(() => {
  const v = threat.value['鬼界敌意'];
  if (v === '被追杀') return '有恶鬼在追杀你，万分危急';
  if (v === '结仇') return '与鬼界恶鬼结下仇怨，随时可能报复';
  if (v === '被挑衅') return '有恶鬼正在挑衅试探你';
  return '暂无鬼界恩怨';
});
</script>
