/**
 * DataMapper - Handles data mapping between workflows in a chain
 */

/**
 * Utility class for mapping data between workflows
 */
export class DataMapper {
  /**
   * Apply input mapping to context data
   * @param context The context data
   * @param mapping The input mapping definition
   * @returns Mapped input for the workflow
   */
  static applyInputMapping(
    context: Record<string, any>,
    mapping?: Record<string, string>
  ): Record<string, any> {
    if (!mapping) {
      return context;
    }

    const result: Record<string, any> = {};

    for (const [targetKey, sourcePath] of Object.entries(mapping)) {
      // Handle literal values (enclosed in quotes)
      if (sourcePath.startsWith('"') && sourcePath.endsWith('"')) {
        result[targetKey] = sourcePath.slice(1, -1);
        continue;
      }

      // Handle array paths (e.g. array[0])
      if (sourcePath.includes('[') && sourcePath.includes(']')) {
        const value = this.resolveArrayPath(context, sourcePath);
        if (value !== undefined) {
          result[targetKey] = value;
        }
        continue;
      }

      // Handle nested paths (e.g. a.b.c)
      if (sourcePath.includes('.')) {
        const value = this.resolveNestedPath(context, sourcePath);
        if (value !== undefined) {
          result[targetKey] = value;
        }
        continue;
      }

      // Handle simple paths
      if (context[sourcePath] !== undefined) {
        result[targetKey] = context[sourcePath];
      }
    }

    return result;
  }

  /**
   * Apply output mapping to workflow result
   * @param output The workflow output
   * @param mapping The output mapping definition
   * @returns Mapped output to be merged into context
   */
  static applyOutputMapping(
    output: Record<string, any>,
    mapping?: Record<string, string>
  ): Record<string, any> {
    if (!mapping) {
      return output;
    }

    const result: Record<string, any> = {};

    for (const [sourcePath, targetPath] of Object.entries(mapping)) {
      // Handle nested source paths
      const sourceValue = sourcePath.includes('.')
        ? this.resolveNestedPath(output, sourcePath)
        : output[sourcePath];

      if (sourceValue === undefined) {
        continue;
      }

      // Handle nested target paths
      if (targetPath.includes('.')) {
        this.setNestedValue(result, targetPath, sourceValue);
      } else {
        result[targetPath] = sourceValue;
      }
    }

    return result;
  }

  /**
   * Merge output data into context
   * @param context The existing context data
   * @param output The output data to merge
   * @param prefix Optional prefix for all keys in the output
   * @returns Updated context with merged output
   */
  static mergeOutputToContext(
    context: Record<string, any>,
    output: Record<string, any>,
    prefix?: string
  ): Record<string, any> {
    const result = { ...context };

    for (const [key, value] of Object.entries(output)) {
      const targetKey = prefix ? `${prefix}.${key}` : key;

      if (targetKey.includes('.')) {
        this.setNestedValue(result, targetKey, value);
      } else {
        result[targetKey] = value;
      }
    }

    return result;
  }

  /**
   * Resolve a nested path in an object (e.g. "a.b.c")
   * @param obj The object to traverse
   * @param path The dot-separated path
   * @returns The value at the path, or undefined if not found
   */
  private static resolveNestedPath(
    obj: Record<string, any>,
    path: string
  ): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (part.includes('[') && part.includes(']')) {
        // Handle array index in path part (e.g. "items[0]")
        const [arrayName, indexPart] = part.split('[');
        const index = parseInt(indexPart.replace(']', ''), 10);

        if (
          current[arrayName] === undefined ||
          !Array.isArray(current[arrayName]) ||
          current[arrayName].length <= index
        ) {
          return undefined;
        }

        current = current[arrayName][index];
      } else if (current[part] === undefined) {
        return undefined;
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Resolve a path that includes array indices (e.g. "items[0]")
   * @param obj The object to traverse
   * @param path The path with array notation
   * @returns The value at the path, or undefined if not found
   */
  private static resolveArrayPath(
    obj: Record<string, any>,
    path: string
  ): any {
    // Handle simple array paths like "array[0]"
    const match = path.match(/^([^\[]+)\[(\d+)\]$/);
    if (match) {
      const [, arrayName, indexStr] = match;
      const index = parseInt(indexStr, 10);

      if (
        obj[arrayName] === undefined ||
        !Array.isArray(obj[arrayName]) ||
        obj[arrayName].length <= index
      ) {
        return undefined;
      }

      return obj[arrayName][index];
    }

    // Handle nested array paths like "parent.array[0]"
    if (path.includes('.')) {
      const parts = path.split('.');
      const lastPart = parts.pop() || '';
      const parentPath = parts.join('.');
      const parent = this.resolveNestedPath(obj, parentPath);

      if (parent === undefined) {
        return undefined;
      }

      return this.resolveArrayPath(parent, lastPart);
    }

    return undefined;
  }

  /**
   * Set a value at a nested path in an object
   * @param obj The object to modify
   * @param path The dot-separated path
   * @param value The value to set
   */
  private static setNestedValue(
    obj: Record<string, any>,
    path: string,
    value: any
  ): void {
    const parts = path.split('.');
    const lastPart = parts.pop();

    if (!lastPart) {
      return;
    }

    let current = obj;

    // Create nested objects if they don't exist
    for (const part of parts) {
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    // Handle array index in the last part (e.g. "items[0]")
    if (lastPart.includes('[') && lastPart.includes(']')) {
      const [arrayName, indexPart] = lastPart.split('[');
      const index = parseInt(indexPart.replace(']', ''), 10);

      if (current[arrayName] === undefined) {
        current[arrayName] = [];
      }

      // Ensure array is large enough
      while (current[arrayName].length <= index) {
        current[arrayName].push(undefined);
      }

      current[arrayName][index] = value;
    } else {
      current[lastPart] = value;
    }
  }
}