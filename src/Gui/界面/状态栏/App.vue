<template>
  <div class="ghost-root" :class="{ open, crash, daylight }">
    <div class="ghost-title" @click="open = !open">
      <span class="ghost-ic">◌</span>
      <span class="ghost-name">{{ displayName }}</span>
      <span class="ghost-time">{{ timeIcon }}</span>
      <span class="ghost-core">
        <span class="ghost-gauge g-grime" title="怨气"><i :style="{ width: grudge + '%' }"></i></span>
        <span class="ghost-gauge g-fade" title="记忆残留"><i :style="{ width: memory + '%' }"></i></span>
      </span>
      <span class="ghost-chev">▾</span>
    </div>

    <div class="ghost-body">
      <StatusSection />
      <VengeanceSection />
      <AbilitySection />
      <ThreatSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from './store';
import StatusSection from './components/StatusSection.vue';
import VengeanceSection from './components/VengeanceSection.vue';
import AbilitySection from './components/AbilitySection.vue';
import ThreatSection from './components/ThreatSection.vue';

const store = useDataStore();

const open = useLocalStorage<boolean>('gui:statusbar:open', false);

const ghost = computed(() => store.data.鬼魂 || {});
const world = computed(() => store.data.世界 || {});

const grudge = computed(() => Math.max(0, Math.min(100, Number(ghost.value['怨气'] ?? 0))));
const memory = computed(() => Math.max(0, Math.min(100, Number(ghost.value['记忆'] ?? 0))));

const displayName = computed(() => {
  const name = ghost.value['姓名'] || '';
  const remembers = ghost.value['是否记得自己'] !== false;
  // 记忆流失或忘记自己 → ？？？
  if (memory.value <= 30 || !remembers) {
    return '？？？';
  }
  // 玩家扮演：<user> 显示为「你」
  if (name === '<user>') {
    return '你';
  }
  if (name === '' || name === '待初始化') {
    return '？？？';
  }
  return name;
});

const timeIcon = computed(() => {
  const map: Record<string, string> = { 白天: '☀', 黄昏: '🌇', 夜晚: '🌙', 凌晨: '🌄' };
  return map[world.value['时辰'] || '夜晚'] || '🌙';
});

const daylight = computed(() => world.value['时辰'] === '白天');
const crash = computed(() => grudge.value >= 80 || memory.value <= 20);
</script>

<style lang="scss" scoped>
.ghost-root {
  font-family: var(--font-tomb);
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: linear-gradient(180deg, #0d1417, #101d22);
  border: 1px solid var(--c-water);
  border-radius: 10px;
  color: var(--c-flesh);
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.55), inset 0 0 30px rgba(120, 130, 140, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.3;
    background-image:
      radial-gradient(ellipse at 18% 8%, rgba(120, 130, 140, 0.22), transparent 45%),
      radial-gradient(ellipse at 82% 92%, rgba(154, 125, 90, 0.12), transparent 40%),
      radial-gradient(ellipse at 55% 45%, rgba(142, 42, 42, 0.07), transparent 50%);
  }
}

.ghost-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--c-line);
  position: relative;
}

.ghost-ic {
  color: var(--c-water);
  font-size: 1.05rem;
  animation: ghostFloat 3s ease-in-out infinite;
}

.ghost-name {
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.08em;
}

.ghost-time {
  font-size: 1rem;
}

.ghost-core {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 120px;
}

.ghost-gauge {
  height: 7px;
  border-radius: 4px;
  background: rgba(122, 139, 148, 0.18);
  overflow: hidden;
  border: 1px solid rgba(122, 139, 148, 0.22);

  i {
    display: block;
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
  }
}

.g-grime i {
  background: linear-gradient(90deg, #5a1b1b, var(--c-grime));
}

.g-fade i {
  background: linear-gradient(90deg, var(--c-fade), #c3ccd1);
}

.ghost-chev {
  color: var(--c-mist);
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.ghost-body {
  padding: 10px 12px;
  position: relative;
}

.ghost-root:not(.open) .ghost-body {
  display: none;
}

.ghost-root.open .ghost-chev {
  transform: rotate(180deg);
}

/* 情境覆盖：惨死态（怨气≥80 或 记忆≤20）——血色与碎裂的车祸感 */
.ghost-root.crash {
  .ghost-title {
    background: rgba(142, 42, 42, 0.12);
  }
  .ghost-name {
    color: var(--c-grime);
    text-shadow: 0 0 8px rgba(142, 42, 42, 0.5);
  }
  &::before {
    opacity: 0.5;
  }
  .ghost-body {
    background: rgba(142, 42, 42, 0.05);
  }
}

/* 白天警告 */
.ghost-root.daylight {
  .ghost-time {
    color: #c9a227;
    text-shadow: 0 0 6px rgba(201, 162, 39, 0.6);
  }
  .ghost-title {
    border-bottom-color: rgba(201, 162, 39, 0.4);
  }
}

@keyframes ghostFloat {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-2px);
    opacity: 1;
  }
}

/* 手机窄屏：标题栏允许换行，收窄间距与字号 */
@media (max-width: 480px) {
  .ghost-root {
    font-size: 12.5px;
  }
  .ghost-title {
    flex-wrap: wrap;
    gap: 4px 8px;
    padding: 7px 9px;
  }
  .ghost-name {
    font-size: 1rem;
    letter-spacing: 0.04em;
  }
  .ghost-core {
    order: 9; /* 条形图整行铺底 */
    flex-basis: 100%;
    min-width: 0;
  }
  .ghost-chev {
    margin-left: auto;
  }
  .ghost-body {
    padding: 8px 9px;
  }
}
</style>
