<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">任 务</div>
    <template v-if="quests.length">
      <div v-for="(q, i) in quests" :key="i" class="ghost-item ghost-item-wide" :class="{ done: q['状态'] === '已完成' }">
        <div class="item-head" style="cursor: pointer" @click="toggle(i)">
          <span class="onsite-chev" :class="{ open: isOpen(i) }">▸</span>
          <span class="item-name">{{ q['名称'] || '？？？' }}</span>
          <span v-if="q['类型']" class="item-type">{{ q['类型'] }}</span>
          <span class="item-state" :class="stateClass(q['状态'])">{{ q['状态'] || '进行中' }}</span>
          <button v-if="q['类型'] !== '主线'" class="item-discard" title="放弃任务" @click.stop="remove(i)">✕</button>
        </div>
        <div v-if="isOpen(i)" class="item-detail">
          <div v-if="q['描述']" class="outfit-row"><span class="outfit-lbl">目标</span><span class="outfit-val">{{ q['描述'] }}</span></div>
          <div v-if="q['进度']" class="outfit-row"><span class="outfit-lbl">进度</span><span class="outfit-val">{{ q['进度'] }}</span></div>
        </div>
      </div>
    </template>
    <span v-else class="lbl" style="color: var(--c-mist)">（暂无任务）</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

interface Quest {
  名称: string;
  类型: string;
  描述: string;
  进度: string;
  状态: string;
}

const quests = computed<Quest[]>(() => (store.data.任务 || []) as unknown as Quest[]);

// 放弃任务：从「任务」数组移除（主线任务不显示按钮，不可放弃）；
// 修改 store.data 会经 watchIgnorable 自动写回酒馆变量
function remove(i: number) {
  const list = store.data.任务 || [];
  store.data.任务 = list.filter((_, idx) => idx !== i);
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
  if (s === '已完成') return 'done';
  if (s === '失败') return 'bad';
  if (s === '待触发') return 'away';
  return '';
}
</script>
