<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">物 品</div>
    <template v-if="items.length">
      <div v-for="(it, i) in items" :key="i" class="ghost-item ghost-item-wide">
        <div class="item-head" style="cursor: pointer" @click="toggle(i)">
          <span class="onsite-chev" :class="{ open: isOpen(i) }">▸</span>
          <span class="item-name">{{ it['名称'] || '？？？' }}</span>
          <span v-if="it['类型'] && it['类型'] !== '普通'" class="item-type">{{ it['类型'] }}</span>
          <span class="item-state" :class="stateClass(it['状态'])">{{ it['状态'] || '完好' }}</span>
          <button v-if="!it['重要']" class="item-discard" title="丢弃" @click.stop="discard(i)">✕</button>
        </div>
        <div v-if="isOpen(i)" class="item-detail">
          <div v-if="it['描述']" class="outfit-row"><span class="outfit-lbl">描述</span><span class="outfit-val">{{ it['描述'] }}</span></div>
          <div v-if="it['用途']" class="outfit-row"><span class="outfit-lbl">用途</span><span class="outfit-val">{{ it['用途'] }}</span></div>
        </div>
      </div>
    </template>
    <span v-else class="lbl" style="color: var(--c-mist)">（暂无随身物品）</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

interface Item {
  名称: string;
  类型: string;
  描述: string;
  用途: string;
  状态: string;
  重要?: boolean;
}

const items = computed<Item[]>(() => (store.data.物品 || []) as unknown as Item[]);

// 丢弃物品：从「物品」数组移除（重要物品不显示按钮，前端不会触发）；
// 修改 store.data 会经 watchIgnorable 自动写回酒馆变量
function discard(i: number) {
  const list = store.data.物品 || [];
  store.data.物品 = list.filter((_, idx) => idx !== i);
}

const openSet = ref<Record<number, boolean>>({});
function toggle(i: number) {
  openSet.value = { ...openSet.value, [i]: !openSet.value[i] };
}
function isOpen(i: number) {
  return !!openSet.value[i];
}

function stateClass(s: string | undefined) {
  if (!s) return '';
  if (s === '被毁' || s === '已用') return 'bad';
  if (s === '磨损' || s === '被夺') return 'away';
  return '';
}
</script>
