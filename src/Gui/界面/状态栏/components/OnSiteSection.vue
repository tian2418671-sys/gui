<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">在 场</div>
    <template v-if="characters.length">
      <div v-for="(c, i) in characters" :key="i" class="onsite-card" :class="stateClass(c['状态'])">
        <div class="onsite-head" @click="toggle(i)">
          <span class="onsite-chev" :class="{ open: isOpen(i) }">▸</span>
          <span class="onsite-name">{{ c['姓名'] || '？？？' }}</span>
          <span class="onsite-role">{{ c['身份'] || '' }}</span>
          <span class="onsite-state" :title="c['状态']">{{ c['状态'] || '在场' }}</span>
        </div>
        <div class="onsite-detail">
          <span v-if="c['性别'] && c['性别'] !== '未知'" class="onsite-tag">{{ genderIcon(c['性别']) }} {{ c['性别'] }}</span>
          <span v-if="c['年龄']" class="onsite-tag">{{ c['年龄'] }}</span>
          <span v-if="c['穿着']" class="onsite-tag">👘 {{ c['穿着'] }}</span>
        </div>
        <div v-if="isOpen(i)" class="onsite-outfit">
          <template v-if="hasOutfit(c)">
            <div v-if="c['穿着详情']['饰品']" class="outfit-row"><span class="outfit-lbl">饰品</span><span class="outfit-val">{{ c['穿着详情']['饰品'] }}</span></div>
            <div v-if="c['穿着详情']['穿戴']" class="outfit-row"><span class="outfit-lbl">穿戴</span><span class="outfit-val">{{ c['穿着详情']['穿戴'] }}</span></div>
            <div v-if="c['穿着详情']['衣服']" class="outfit-row"><span class="outfit-lbl">衣服</span><span class="outfit-val">{{ c['穿着详情']['衣服'] }}</span></div>
            <div v-if="c['穿着详情']['内衣']" class="outfit-row"><span class="outfit-lbl">内衣</span><span class="outfit-val">{{ c['穿着详情']['内衣'] }}</span></div>
          </template>
          <span v-else class="lbl" style="color: var(--c-mist)">（暂无详细穿着信息）</span>
        </div>
      </div>
    </template>
    <span v-else class="lbl" style="color: var(--c-mist)">（当前场景没有他人）</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

interface OutfitDetail {
  饰品?: string;
  穿戴?: string;
  衣服?: string;
  内衣?: string;
}

interface OnSiteChar {
  姓名: string;
  性别: string;
  年龄: string;
  穿着: string;
  穿着详情?: OutfitDetail;
  身份: string;
  状态: string;
}

const characters = computed<OnSiteChar[]>(() => {
  const list = store.data.在场角色 || [];
  return list as unknown as OnSiteChar[];
});

// 折叠/展开状态：按索引记录
const openSet = ref<Record<number, boolean>>({});

function toggle(i: number) {
  openSet.value = { ...openSet.value, [i]: !openSet.value[i] };
}

function isOpen(i: number) {
  return !!openSet.value[i];
}

function hasOutfit(c: OnSiteChar) {
  const d = c['穿着详情'];
  return d && (d['饰品'] || d['穿戴'] || d['衣服'] || d['内衣']);
}

function genderIcon(g: string) {
  return g === '男' ? '♂' : g === '女' ? '♀' : '';
}

function stateClass(state: string | undefined) {
  if (!state) return '';
  if (state === '死亡' || state === '已死') return 'dead';
  if (state === '昏迷' || state === '重伤') return 'bad';
  if (state !== '在场' && state !== '') return 'away';
  return '';
}
</script>
