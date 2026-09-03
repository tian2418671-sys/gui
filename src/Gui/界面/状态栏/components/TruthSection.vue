<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">真 相 <span style="font-size: .6em; color: var(--c-mist)">（暗线·可选）</span></div>
    <div class="ghost-item"><span class="lbl">真相</span><span class="val">{{ truthFoggy ? '迷雾' : truthProgress }}</span></div>
    <div v-if="truthFoggy" class="fog-hint">{{ truthHint }}</div>
    <div class="ghost-item"><span class="lbl">罪证</span><span class="val">{{ knownKnown['罪证'] ? evidence + '%' : '？？？' }}</span></div>
    <div v-if="!knownKnown['罪证']" class="fog-hint">{{ evidenceHint }}</div>
    <div class="ghost-item"><span class="lbl">见证者</span><span class="val">{{ knownKnown['罪证'] ? witness : '？？？' }}</span></div>
    <div class="ghost-clan">
      <span v-for="(member, key) in clanMembers" :key="key" :class="['clan-chip', chipClass(member['状态'])]" :title="member['死因'] ? member['身份'] + '：' + member['死因'] : (member['身份'] || key)">
        {{ (member['身份'] || key) + '·' + (member['状态'] || '活着') }}<template v-if="member['状态'] === '死亡' && member['死因']">（{{ member['死因'] }}）</template>
      </span>
      <span v-if="!clanMembers.length" class="lbl" style="color: var(--c-mist)">（尚未确认家族成员）</span>
    </div>
    <div v-if="!clanMembers.length" class="fog-hint">{{ clanHint }}</div>
    <div class="ghost-item"><span class="lbl">屏障</span><span class="val">{{ shield }}</span></div>
    <div v-if="!knownKnown['屏障']" class="fog-hint">{{ shieldHint }}</div>
    <div class="ghost-item"><span class="lbl">妻子</span><span class="val">{{ wife }}</span></div>
    <div class="ghost-item"><span class="lbl">已接触势力</span><span class="val">{{ factions }}</span></div>
    <div v-if="!((known['势力'] || []) as string[]).length" class="fog-hint">{{ factionsHint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const vengeance = computed(() => store.data.复仇);
const hidden = computed(() => store.data.隐藏);
const known = computed(() => hidden.value['已知'] || {});

const knownKnown = computed(() => known.value as Record<string, unknown>);

const truthProgress = computed(() => (vengeance.value['车祸真相'] ?? '') as string);
// 「待初始化」同样算迷雾态（schema prefault），此时也显示弱引导
const truthFoggy = computed(() => !truthProgress.value || truthProgress.value === '待初始化');
const evidence = computed(() => Math.max(0, Math.min(100, Number((vengeance.value['罪证'] || {})['进度'] ?? 0))));
const witness = computed(() => (vengeance.value['罪证'] || {})['见证者'] || '无');

// —— 隐藏的弱引导：迷雾态不只给 ？？？，还指向「可调查的方向」但不泄露答案；确认后提示自动消失 ——
const truthHint = computed(() => '死得不明不白，那晚的事总有对不上的细节——从执念物和旧居的记忆残片拼起');
const evidenceHint = computed(() => '光有怨气扳不倒他们——去他们作过恶的地方翻一翻，总会留下把柄');
const shieldHint = computed(() => '大宅深院未必没有防备——他们信什么、供什么、请谁看家，摸清了再动手');
const clanHint = computed(() => '当晚你只认出了老板——灵堂上、旧宅里、生意场中，他家的人会一个个露头');
const factionsHint = computed(() => '夜里的城不止活人——鬼市、胡同、旧医院，先找能落脚打探的地方');

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

// 妻子（孙紫，活人）：状态按「活着→疑神疑鬼→恐惧→神经衰弱→濒临失控→疯狂」逐级下坠；主角是鬼，其状态并非迷雾，直接可见
const wife = computed(() => {
  const w = (vengeance.value['妻子'] || {}) as Record<string, string>;
  const state = w['状态'] || '活着';
  const loc = w['位置'] || '';
  return loc ? `${state} · ${loc}` : state;
});

// 信息迷雾：已接触/确认的势力才显示
const factions = computed(() => {
  const list: string[] = Array.isArray(known.value['势力']) ? known.value['势力'] : [];
  return list.length ? list.join('、') : '？？？';
});

function chipClass(state: string | undefined) {
  if (state === '死亡') return 'dead';
  if (state && state !== '活着') return 'bad';
  return '';
}
</script>
