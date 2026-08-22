import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

$(() => {
  void (async () => {
    // 等待 MVU 框架与消息楼层变量 stat_data 就绪；
    // 超时后仍挂载，由组件内空值保护兜底，避免酒馆中出现一片空白/纯黑。
    await waitGlobalInitialized('Mvu');
    try {
      await Promise.race([
        waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data')),
        sleep(3000),
      ]);
    } catch (err) {
      console.warn('[状态栏] 等待 stat_data 出错：', err);
    }
    if (!_.has(getVariables({ type: 'message' }), 'stat_data')) {
      console.warn('[状态栏] 超时：未检测到消息变量 stat_data，MVU 变量可能尚未初始化。');
    }
    createApp(App).use(createPinia()).mount('#app');
  })();
});
