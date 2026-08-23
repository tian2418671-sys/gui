import { StoreDefinition } from 'pinia';

export function defineMvuDataStore<T extends z.ZodObject>(
  schema: T,
  variable_option: VariableOption,
  additional_setup?: (data: Ref<z.infer<T>>) => void,
): StoreDefinition<
  `mvu_data.${string}`,
  {
    data: Ref<z.infer<T>>;
    pausePolling: () => void;
    resumePolling: () => void;
  }
> {
  if (
    variable_option.type === 'message' &&
    (variable_option.message_id === undefined || variable_option.message_id === 'latest')
  ) {
    variable_option.message_id = -1;
  }

  return defineStore(
    `mvu_data.${_(variable_option)
      .entries()
      .sortBy(entry => entry[0])
      .map(entry => entry[1])
      .join('.')}`,
    errorCatched(() => {
      // 防御：stat_data 可能被 {{user}} 宏/异常数据污染（如 YAML 把 {{user}} 解析成对象），
      // 直接 parse 会抛 ZodError 导致整个状态栏空白。先安全解析，失败则回退到纯默认值。
      const raw_stat_data = _.get(getVariables(variable_option), 'stat_data', {});
      let initial: z.infer<T>;
      try {
        initial = schema.parse(raw_stat_data, { reportInput: true });
      } catch {
        console.warn('[MvuDataStore] stat_data 解析失败，已回退到默认值（原数据可能被 {{user}} 宏污染）');
        initial = schema.parse({}, { reportInput: true });
      }
      const data = ref(initial) as Ref<z.infer<T>>;
      if (additional_setup) {
        additional_setup(data);
      }

      // ── 数据层与展示层解耦 ──────────────────────────────────────────────
      // MVU 每次更新 stat_data 都会整体替换引用（MagVarUpdate 写回新对象），
      // 因此「引用未变化 = 数据未变化」：直接跳过，避免每 2 秒全量 safeParse + 深度比较。
      // 只有 AI 真正更新变量（引用变化）时才解析一次，展示层只读 data。
      let lastRef: unknown = undefined;
      const sync = () => {
        const stat_data = _.get(getVariables(variable_option), 'stat_data', {});
        if (stat_data === lastRef) {
          return;
        }
        lastRef = stat_data;
        const result = schema.safeParse(stat_data);
        if (result.error) {
          return;
        }
        if (!_.isEqual(data.value, result.data)) {
          ignoreUpdates(() => {
            data.value = result.data;
          });
          if (!_.isEqual(stat_data, result.data)) {
            updateVariablesWith(variables => _.set(variables, 'stat_data', result.data), variable_option);
          }
        }
      };

      const { pause: pausePolling, resume: _resume } = useIntervalFn(sync, 2000, { immediate: true });
      // 恢复轮询时立即同步一次（折叠期间可能错过多次更新，展开马上看到最新值）
      const resumePolling = () => {
        _resume();
        sync();
      };

      const { ignoreUpdates } = watchIgnorable(
        data,
        new_data => {
          const result = schema.safeParse(new_data);
          if (result.error) {
            return;
          }
          if (!_.isEqual(new_data, result.data)) {
            ignoreUpdates(() => {
              data.value = result.data;
            });
          }
          updateVariablesWith(variables => _.set(variables, 'stat_data', result.data), variable_option);
        },
        { deep: true },
      );

      return { data, pausePolling, resumePolling };
    }),
  );
}
