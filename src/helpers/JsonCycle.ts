export class JsonCycle {
  // Based on cycle.js (https://github.com/douglascrockford/JSON-js/blob/master/cycle.js)
  /**
   * @name decycle
   */
  public static decycle(
    obj: Record<string, unknown>,
    max: { maxDepth?: number; maxKeys?: number } = {},
    replacer?: (value: any) => any,
  ) {
    const objects = new WeakMap();

    return (function derez(value: any, path: string, depth = 1) {
      let oldPath = '';
      let nu: any;

      if (replacer !== undefined) {
        value = replacer(value);
      }

      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Boolean) &&
        !(value instanceof Date) &&
        !(value instanceof Number) &&
        !(value instanceof RegExp) &&
        !(value instanceof String)
      ) {
        if (max.maxDepth !== undefined && max.maxDepth < depth) {
          return `exceeded max depth ${max.maxDepth}`;
        }

        oldPath = objects.get(value);
        if (oldPath !== undefined) {
          return { $ref: oldPath };
        }

        objects.set(value, path);

        if (Array.isArray(value)) {
          nu = [];
          value.slice(0, Math.min(max.maxKeys || value.length, value.length)).forEach((el, i) => {
            nu[i] = derez(el, `${path}[${i}]`, depth + 1);
          });
        } else {
          nu = {};
          const keys = Object.keys(value);
          keys.slice(0, Math.min(max.maxKeys || keys.length, keys.length)).forEach((name) => {
            nu[name] = derez(value[name], `${path}[${name}]`, depth + 1);
          });
        }
        return nu;
      }
      return value;
    })(obj, '$');
  }

  /**
   * @name decycle
   */
  public static stringifyDecycle(
    obj: Record<string, unknown>,
    max: { maxDepth?: number; maxKeys?: number } = {},
    replacer?: (value: any) => any,
    spaces?: number,
  ) {
    try {
      return JSON.stringify(this.decycle(obj, max, replacer), null, spaces);
    } catch (e) {
      return '[error stringifying]';
    }
  }
}
