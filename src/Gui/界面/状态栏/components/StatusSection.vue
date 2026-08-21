<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">状 态</div>
    <div class="ghost-grid2">
      <div class="ghost-item"><span class="lbl">形态</span><span class="val">{{ ghost['形态'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">区域</span><span class="val">{{ world['当前区域'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">隐匿</span><span class="val">{{ stealth }}%</span></div>
      <div class="ghost-item"><span class="lbl">香火</span><span class="val">{{ incense }}</span></div>
      <div class="ghost-item"><span class="lbl">住处</span><span class="val">{{ ghost['住处'] || '—' }}</span></div>
      <div class="ghost-item"><span class="lbl">伤势</span><span class="val">{{ ghost['伤势'] || '无' }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const ghost = computed(() => store.data.鬼魂 || {});
const world = computed(() => store.data.世界 || {});

const stealth = computed(() => Math.max(0, Math.min(100, Number(ghost.value['隐匿度'] ?? 0))));
const incense = computed(() => (ghost.value['香火'] ?? '—') === '' ? '—' : ghost.value['香火'] ?? '—');
</script>
