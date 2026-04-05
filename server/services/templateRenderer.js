/**
 * Replace {{variable}} placeholders in HTML or plain text.
 * Unknown keys are left unchanged.
 */
function renderTemplate(template, vars) {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined || v === null ? `{{${key}}}` : String(v);
  });
}

module.exports = { renderTemplate };
