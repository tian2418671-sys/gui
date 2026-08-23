<template>
  <div class="ghost-sec">
    <div class="ghost-sec-head">修 炼</div>
    <!-- 当前阶位 + 晋升进度 -->
    <div class="cult-row">
      <span class="lbl">阶位</span>
      <span class="cult-rank">{{ rank }}</span>
      <span class="cult-next">{{ nextRank }}</span>
    </div>
    <div class="cult-progress" :title="promoteHint">
      <i :style="{ width: minDim + '%' }"></i>
    </div>
    <div class="cult-progress-note">四维修炼度 · 全部满 100 方可晋升</div>

    <!-- 四维修炼度 -->
    <div v-for="d in dimensions" :key="d.name" class="cult-dim">
      <div class="cult-dim-head">
        <span class="cult-dim-name">{{ d.name }}</span>
        <span class="cult-dim-val">{{ d.value }}%</span>
      </div>
      <div class="cult-dim-bar" :title="d.hint">
        <i :style="{ width: d.value + '%' }"></i>
      </div>
    </div>

    <!-- 能力清单：先天（鬼天生本能，需摸索掌握）/ 后天（修炼所学主动法门，动态习得）/ 被动（修为自然形成的现象）分别展示，支持折叠展开 -->
    <div class="ghost-item ghost-item-wide">
      <div class="ghost-sec-head" style="cursor: pointer" @click="innateOpen = !innateOpen">
        <span class="onsite-chev" :class="{ open: innateOpen }">▸</span>先天能力<template v-if="innateAbilities.length">（{{ innateAbilities.length }}）</template>
      </div>
      <span v-if="innateOpen" class="val cult-abilities">
        <template v-if="innateAbilities.length">
          <span v-for="a in innateAbilities" :key="a.name" class="cult-abil" :class="{ locked: !a.unlocked }" :title="a.desc || (a.unlocked ? '' : '先天本能，需在剧情中摸索掌握')">
            {{ a.name }}<template v-if="a.unlocked && a.level > 1">·Lv{{ a.level }}</template><template v-else-if="!a.unlocked">·未掌握</template>
          </span>
        </template>
        <template v-else>（暂无）</template>
      </span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <div class="ghost-sec-head" style="cursor: pointer" @click="learnedOpen = !learnedOpen">
        <span class="onsite-chev" :class="{ open: learnedOpen }">▸</span>后天能力<template v-if="learnedAbilities.length">（{{ learnedAbilities.length }}）</template>
      </div>
      <span v-if="learnedOpen" class="val cult-abilities">
        <template v-if="learnedAbilities.length">
          <span v-for="a in learnedAbilities" :key="a.name" class="cult-abil" :class="{ locked: !a.unlocked }" :title="a.desc || (a.unlocked ? '' : '尚未习得')">
            {{ a.name }}<template v-if="a.unlocked && a.level > 1">·Lv{{ a.level }}</template><template v-else-if="!a.unlocked">·未习得</template>
          </span>
        </template>
        <template v-else><span class="lbl" style="color: var(--c-mist)">（尚未习得任何法门）</span></template>
      </span>
    </div>
    <div class="ghost-item ghost-item-wide">
      <div class="ghost-sec-head" style="cursor: pointer" @click="passiveOpen = !passiveOpen">
        <span class="onsite-chev" :class="{ open: passiveOpen }">▸</span>被动现象<template v-if="passiveAbilities.length">（{{ passiveAbilities.length }}）</template>
      </div>
      <span v-if="passiveOpen" class="val cult-abilities">
        <template v-if="passiveAbilities.length">
          <span v-for="a in passiveAbilities" :key="a.name" class="cult-abil passive" :title="a.desc || '被动现象：修为自然形成的状态'">
            {{ a.name }}
          </span>
        </template>
        <template v-else><span class="lbl" style="color: var(--c-mist)">（尚未显现任何被动现象）</span></template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();
const ghost = computed(() => store.data.鬼魂);

// 能力区块折叠状态（默认展开）
const innateOpen = ref(true);
const learnedOpen = ref(true);
const passiveOpen = ref(true);

const rank = computed(() => ghost.value['阶位'] || '一阶·孤魂野鬼');

const RANKS = [
  '一阶·孤魂野鬼', '二阶·游魂阴鬼', '三阶·怨鬼', '四阶·厉鬼',
  '五阶·凶煞', '六阶·夜叉', '七阶·鬼将', '八阶·鬼王', '九阶·鬼仙',
];
const nextRank = computed(() => {
  const idx = RANKS.indexOf(rank.value);
  if (idx < 0 || idx >= RANKS.length - 1) return '';
  return `→ ${RANKS[idx + 1]}`;
});

// 四维修炼度
const DIMS: { name: string; key: string; hint: string }[] = [
  { name: '魂质与死相', key: '魂质与死相', hint: '自身质量的凝实程度，对死亡本相的掌握与炼化' },
  { name: '因果与煞气', key: '因果与煞气', hint: '情绪驱动力与外部能量（饭气/香火/残魂/生煞）的摄取转化' },
  { name: '锚点与灵智', key: '锚点与灵智', hint: '对抗失真与遗忘的自保机制，靠执念锚点稳住自我' },
  { name: '法域与威慑', key: '法域与威慑', hint: '对所在环境与阴阳秩序的影响力，从容身到改变一方生态' },
];

const dimensions = computed(() => {
  const cult = ghost.value['修炼'] || {};
  return DIMS.map((d) => ({
    ...d,
    value: Math.max(0, Math.min(100, Number((cult as Record<string, unknown>)[d.key] ?? 0))),
  }));
});

// 晋升进度：以最低维度为准（缺一不可）
const minDim = computed(() => {
  const vals = dimensions.value.map((d) => d.value);
  return vals.length ? Math.min(...vals) : 0;
});
const promoteHint = computed(() => {
  const weakest = dimensions.value.reduce((a, b) => (a.value <= b.value ? a : b));
  return `晋升需四维同步成长，当前最低「${weakest.name}」${weakest.value}%`;
});

// 能力清单：先天（鬼天生会的基础主动能力）+ 后天（修炼所学主动法门），完全动态读取变量「能力」record 的 key
const abilityList = (key: '先天' | '后天') => {
  const data = (store.data.能力 || {})[key] || {};
  return Object.entries(data)
    .map(([name, v]) => {
      const obj = v as { 是否解锁?: boolean; 等级?: number; 描述?: string };
      return {
        name,
        unlocked: obj['是否解锁'] === true,
        level: Number(obj['等级'] ?? 1),
        desc: obj['描述'] || '',
      };
    });
};

const innateAbilities = computed(() => abilityList('先天'));
const learnedAbilities = computed(() => abilityList('后天'));

// 被动现象：修为自然形成的状态，不是主动能力、只是一个现象的名字，无等级无熟练度，仅显示已获得的
const passiveAbilities = computed(() => {
  const data = (store.data.能力 || {})['被动'] || {};
  return Object.entries(data)
    .filter(([, v]) => (v as { 是否获得?: boolean }).是否获得 === true)
    .map(([name, v]) => {
      const obj = v as { 描述?: string };
      return { name, desc: obj['描述'] || '' };
    });
});
</script>
