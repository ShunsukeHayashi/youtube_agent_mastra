import fs from 'fs';
import path from 'path';

/**
 * Simple Jinja2-like template renderer used for prompt generation.
 * It replaces {{ variable }} with corresponding values from context.
 */
export function render(templateName: string, context: Record<string, any>): string {
  const templatePath = path.join(__dirname, '..', '..', 'prompts', `${templateName}.j2`);
  const template = fs.readFileSync(templatePath, 'utf-8');
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = context[key];
    return value !== undefined ? String(value) : '';
  });
}
