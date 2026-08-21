<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">能 力</div>
    <div class="ghost-abilities">
      <template v-if="abilities.length">
        <span v-for="a in abilities" :key="a.name" :class="['abil-chip', a.unlocked ? '' : 'locked']">
          {{ a.name }}<template v-if="a.unlocked && a.level > 1">·Lv{{ a.level }}</template>
        </span>
      </template>
      <span v-else class="lbl" style="color: var(--c-mist)">（尚未觉醒）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

interface AbilityItem {
  name: string;
  unlocked: boolean;
  level: number;
}

const abilities = computed<AbilityItem[]>(() => {
  const abilities = store.data.能力 || {};
  return Object.entries(abilities).map(([name, value]) => {
    const v = value as { 是否解锁?: boolean; 等级?: number };
    return { name, unlocked: v['是否解锁'] === true, level: Number(v['等级'] ?? 1) };
  });
});
</script>
