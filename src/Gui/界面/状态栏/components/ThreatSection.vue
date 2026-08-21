<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">威 胁</div>
    <div class="ghost-threat">
      <div class="thr-row"><span class="lbl">☀ 阳光暴露</span><span class="thr-bar"><i :style="{ width: sun + '%' }"></i></span></div>
      <div class="thr-row"><span class="lbl">⚖ 阴差注意</span><span class="thr-bar"><i class="t-phos" :style="{ width: grim + '%' }"></i></span></div>
      <div class="thr-row"><span class="lbl">🔪 捉鬼人</span><span class="thr-flag">{{ hunted ? '已盯上' : '未盯上' }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const threat = computed(() => store.data.威胁 || {});

const sun = computed(() => Math.max(0, Math.min(100, Number(threat.value['阳光暴露'] ?? 0))));
const grim = computed(() => Math.max(0, Math.min(100, Number(threat.value['阴差注意'] ?? 0))));
const hunted = computed(() => threat.value['被捉鬼人盯上'] === true);
</script>
