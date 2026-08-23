<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">状 态</div>
    <div class="ghost-grid2">
      <div class="ghost-item"><span class="lbl">阶位</span><span class="val">{{ rank }}</span></div>
      <div class="ghost-item"><span class="lbl">形态</span><span class="val">{{ ghost['形态'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">区域</span><span class="val">{{ world['当前区域'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">隐匿</span><span class="val">{{ stealth }}%</span></div>
      <div class="ghost-item"><span class="lbl">香火</span><span class="val">{{ incense }}</span></div>
      <div class="ghost-item"><span class="lbl">住处</span><span class="val">{{ ghost['住处'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">伤势</span><span class="val">{{ ghost['伤势'] || '无' }}</span></div>
      <div class="ghost-item"><span class="lbl">人性残余</span><span class="val">{{ humanity }}%</span></div>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">剧情阶段</span><span class="val">{{ world['当前剧情阶段'] || '—' }}</span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">记忆碎片</span><span class="val">{{ memoryFragments }}</span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <span class="lbl">锚物</span>
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
const humanity = computed(() => Math.max(0, Math.min(100, Number(hidden.value['人性残余'] ?? 100))));

const rank = computed(() => ghost.value['阶位'] || '—');

const memoryFragments = computed(() => {
  const v = hidden.value['记忆碎片'] ?? '';
  return v && v !== '待初始化' ? v : '—';
});

// 锚物：列出持有锚物及状态（完好/磨损/被夺/被毁），悬停显示锚定记忆
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
