import { useEdgeGlow } from './useEdgeGlow';

// 通用「边缘光晕」包裹组件：给任意卡片式元素加上源自 React Bits BorderGlow 的
// 悬停边缘渐变辉光（黑红主题）。保留原标签语义（article/div/button），
// 仅追加 .has-edge-glow 类、指针监听与一层 .edge-glow-layer 辉光层。
export default function EdgeGlow({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useEdgeGlow();
  return (
    <Tag ref={ref} className={`has-edge-glow ${className}`.trim()} {...rest}>
      <span className="edge-glow-layer" aria-hidden="true" />
      {children}
    </Tag>
  );
}
