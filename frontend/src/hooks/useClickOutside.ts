import { useEffect, type RefObject } from 'react';

/**
 * 自定义Hook，用于检测点击元素外部的事件
 * @param ref 要监听的元素引用
 * @param callback 当点击元素外部时执行的回调函数
 * @param exceptions 不触发回调的元素引用列表（可选）
 */
function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  exceptions: RefObject<HTMLElement>[] = []
): void {
  useEffect(() => {
    // 检查点击目标是否在引用元素外部
    const handleClickOutside = (event: MouseEvent): void => {
      // 如果引用元素存在且点击目标不在引用元素内部
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // 检查是否点击在例外元素内部
        const isInException = exceptions.some(
          (exceptionRef) => exceptionRef.current && exceptionRef.current.contains(event.target as Node)
        );
        
        // 如果不在例外元素内部，则执行回调
        if (!isInException) {
          callback();
        }
      }
    };

    // 添加事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函数：移除事件监听器，避免内存泄漏
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, exceptions]);
}

export default useClickOutside;