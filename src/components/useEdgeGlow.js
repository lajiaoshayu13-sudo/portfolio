import { useRef, useEffect } from 'react';

// 监听指针在卡片上的位置，计算「边缘接近度」与「光标角度」，
// 写入 CSS 变量，供 .edge-glow-layer 的遮罩/透明度使用（源自 React Bits BorderGlow）。
export function useEdgeGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      const prox = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

      let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;

      el.style.setProperty('--edge-proximity', (prox * 100).toFixed(3));
      el.style.setProperty('--cursor-angle', `${deg.toFixed(3)}deg`);
    };

    const onLeave = () => el.style.setProperty('--edge-proximity', '0');

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return ref;
}
