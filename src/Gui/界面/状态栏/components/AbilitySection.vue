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
    <div class="cult-progress-note">死相与煞气 · 两者齐满 100 方可晋升</div>

    <!-- 鬼气：当前境界 + 折叠展开的解释说明 -->
    <div class="cult-dim">
      <div class="cult-dim-head" style="cursor: pointer" @click="qiOpen = !qiOpen">
        <span class="cult-dim-name">鬼气</span>
        <span class="cult-dim-val">{{ qiState }}</span>
        <span class="onsite-chev" :class="{ open: qiOpen }">▸</span>
      </div>
      <div v-if="qiOpen" class="cult-hint">
        <div class="cult-hint-line"><b>是什么</b>：鬼魂自身凝练的阴属能量，是能力、阶位与被动现象的根源；越厚越纯，魂体越凝实、干涉阳间越强。</div>
        <div class="cult-hint-line"><b>怎么来</b>：怨气（复仇恨意）、香火与饭气、吞噬残魂、占地聚阴、惊煞采气（活人恐惧）。</div>
        <div class="cult-hint-line"><b>当前境界</b>：{{ rank }} · {{ qiState }}——{{ qiDesc }}</div>
        <div class="cult-hint-line"><b>怎么升</b>：死相与煞气齐满 100 晋升下一阶，鬼气随之由「稀薄散乱 → 凝实如衣 → 外放成势 → 返璞归真」演进。</div>
      </div>
    </div>

    <!-- 修炼两维：死相（魂质凝实/死相炼化）+ 煞气（情绪驱动/能量摄取），各自带「如何获得」折叠说明 -->
    <div v-for="d in dimensions" :key="d.name" class="cult-dim">
      <div class="cult-dim-head" style="cursor: pointer" @click="toggleDim(d.name)">
        <span class="cult-dim-name">{{ d.name }}</span>
        <span class="cult-dim-val">{{ d.value }}%</span>
        <span class="onsite-chev" :class="{ open: dimOpen[d.name] }">▸</span>
      </div>
      <div class="cult-dim-bar" :title="d.hint">
        <i :style="{ width: d.value + '%' }"></i>
      </div>
      <div v-if="dimOpen[d.name]" class="cult-hint">
        <div class="cult-hint-line"><b>如何获得</b>：{{ d.how }}</div>
        <div class="cult-hint-line" style="color: var(--c-mist)">{{ d.hint }}</div>
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

// 能力区块折叠状态（默认收起，修炼栏主体只保留「鬼气/死相/煞气」，避免繁琐）
const innateOpen = ref(false);
const learnedOpen = ref(false);
const passiveOpen = ref(false);

// 鬼气说明折叠
const qiOpen = ref(false);
// 死相/煞气各自的「如何获得」折叠
const dimOpen = ref<Record<string, boolean>>({});
function toggleDim(name: string) {
  dimOpen.value = { ...dimOpen.value, [name]: !dimOpen.value[name] };
}

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

// 修炼两维：死相（魂质与死相）+ 煞气（因果与煞气）；锚点与灵智、法域与威慑不再在状态栏展示
const DIMS: { name: string; key: string; hint: string; how: string }[] = [
  { name: '死相', key: '魂质与死相', hint: '自身质量的凝实程度，对死亡本相的掌握与炼化', how: '吞噬残魂、炼化死相、魂体凝实时提升' },
  { name: '煞气', key: '因果与煞气', hint: '情绪驱动力与外部能量（饭气/香火/残魂/生煞）的摄取转化', how: '怨气增长、吸食香火饭气、提炼生煞时提升' },
];

// 鬼气境界：按当前阶位映射（与「鬼气与修炼阶级」条目的演进一致）
const QI_STAGES = [
  { min: 1, state: '稀薄散乱', desc: '魂体虚浮、干涉阳间有限；遇见懂行的人要敛气藏形、避其锋芒' },
  { min: 3, state: '凝实如衣', desc: '鬼气凝实，普通人不敢招惹，但真传法师与定力深者仍要提防' },
  { min: 5, state: '外放成势', desc: '一方恶鬼名号渐响，阴差开始留意；人间威胁只剩极少数真修' },
  { min: 7, state: '返璞归真', desc: '明面上几乎无人能撼动，传说级修行者仍是最深的忌讳' },
];

const RANK_NUM: Record<string, number> = {
  '一阶·孤魂野鬼': 1, '二阶·游魂阴鬼': 2, '三阶·怨鬼': 3, '四阶·厉鬼': 4,
  '五阶·凶煞': 5, '六阶·夜叉': 6, '七阶·鬼将': 7, '八阶·鬼王': 8, '九阶·鬼仙': 9,
};

const qiState = computed(() => {
  const n = RANK_NUM[rank.value] ?? 1;
  let cur = QI_STAGES[0];
  for (const s of QI_STAGES) {
    if (n >= s.min) cur = s;
  }
  return cur.state;
});
const qiDesc = computed(() => {
  const n = RANK_NUM[rank.value] ?? 1;
  let cur = QI_STAGES[0];
  for (const s of QI_STAGES) {
    if (n >= s.min) cur = s;
  }
  return cur.desc;
});

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
  return `晋升需死相与煞气齐满，当前最低「${weakest.name}」${weakest.value}%`;
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
