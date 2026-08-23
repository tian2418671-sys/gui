<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">复 仇</div>
    <div class="ghost-item"><span class="lbl">幕</span><span class="val">{{ world['当前幕'] || '—' }}</span></div>
    <div class="ghost-item"><span class="lbl">目标</span><span class="val">{{ vengeance['当前目标'] || '—' }}</span></div>
    <div class="ghost-item"><span class="lbl">罪证</span><span class="val">{{ knownKnown['罪证'] ? evidence + '%' : '？？？' }}</span></div>
    <div class="ghost-item"><span class="lbl">见证者</span><span class="val">{{ knownKnown['罪证'] ? witness : '？？？' }}</span></div>
    <div class="ghost-clan">
      <span v-for="(member, key) in clanMembers" :key="key" :class="['clan-chip', chipClass(member['状态'])]" :title="member['死因'] ? member['身份'] + '：' + member['死因'] : (member['身份'] || key)">
        {{ (member['身份'] || key) + '·' + (member['状态'] || '活着') }}<template v-if="member['状态'] === '死亡' && member['死因']">（{{ member['死因'] }}）</template>
      </span>
      <span v-if="!clanMembers.length" class="lbl" style="color: var(--c-mist)">（尚未确认家族成员）</span>
    </div>
    <div class="ghost-item"><span class="lbl">屏障</span><span class="val">{{ shield }}</span></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const world = computed(() => store.data.世界);
const vengeance = computed(() => store.data.复仇);
const hidden = computed(() => store.data.隐藏);
const known = computed(() => hidden.value['已知'] || {});

const knownKnown = computed(() => known.value as Record<string, boolean>);

const evidence = computed(() => Math.max(0, Math.min(100, Number((vengeance.value['罪证'] || {})['进度'] ?? 0))));
const witness = computed(() => (vengeance.value['罪证'] || {})['见证者'] || '无');

// 信息迷雾：只显示玩家已确认身份的家族成员
const clanMembers = computed(() => {
  const clan = vengeance.value['家族成员'] || {};
  const knownList: string[] = Array.isArray(known.value['家族成员']) ? known.value['家族成员'] : [];
  const knownSet = new Set(knownList);
  return Object.entries(clan)
    .filter(([key, value]) => {
      const v = value as Record<string, string>;
      // key 或身份字段任一在已知列表中
      return knownSet.has(key) || knownSet.has(v['身份'] || '');
    })
    .map(([key, value]) => ({ key, ...(value as Record<string, string>) }));
});

const shield = computed(() => {
  // 未探明屏障 → ？？？
  if (!knownKnown.value['屏障']) return '？？？';
  const s = vengeance.value['防护屏障'] || {};
  return `供奉道士·${s['供奉道士'] || '无'} ｜ 祖坟·${s['祖坟阵法'] || '完好'} ｜ 血脉·${s['血脉气运'] || '完好'}`;
});

function chipClass(state: string | undefined) {
  if (state === '死亡') return 'dead';
  if (state && state !== '活着') return 'bad';
  return '';
}
</script>
