/**
 * 개발 환경에서만 로그를 출력하는 유틸리티
 */
const printDev = {
  log: (...args: Parameters<typeof console.log>) => {
    if (!import.meta.env.DEV) return;
    console.log(...args);
  },
  error: (...args: Parameters<typeof console.log>) => {
    if (!import.meta.env.DEV) return;
    console.error(...args);
  },
};

export default printDev;
