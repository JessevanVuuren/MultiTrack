
export const element_contains_pointer = (r: DOMRect, e: PointerEvent): boolean => {
  const { clientX: x, clientY: y } = e
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
}

export const value_to_percent = (audio: number, total: number) => {
  return (audio * 100) / total
}

export const map = (value: number, source_range_min: number, source_range_max: number, target_range_min: number, target_range_max: number) => {
  const target_range = target_range_max - target_range_min;
  const source_range = source_range_max - source_range_min;
  return (value - source_range_min) * target_range / source_range + target_range_min;
}

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let in_throttle: boolean = false;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!in_throttle) {
      func.apply(this, args);
      in_throttle = true;
      setTimeout(() => in_throttle = false, limit);
    }
  };
};

export const clamp = (n: number, min: number, max: number) => {
  return Math.max(min, Math.min(n, max))

}

export const array_min_max = (arr: number[]) => {
  const result = arr.reduce((acc, val) => {
    acc[0] = (acc[0] === undefined || val < acc[0]) ? val : acc[0]
    acc[1] = (acc[1] === undefined || val > acc[1]) ? val : acc[1]
    return acc;
  }, []);

  return { min: result[0], max: result[1] }
}

export const format_duration = (seconds: number) => {
  return new Date(seconds * 1000).toISOString().substring(14, 19)
}