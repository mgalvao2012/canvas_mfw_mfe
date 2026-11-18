// Points the external-app URL in Salesforce metadata files at <https-origin>.
// Handles: CspTrustedSite <endpointUrl>, FlexiPage appUrl <value>, LWC meta `appUrl` property default.
// CLI: node scripts/set-tunnel-url.js <https-origin> <file>...   (rewrites the files in place)
const fs = require('node:fs');

function rewriteTunnelUrl(xml, base) {
  let url;
  try { url = new URL(base); } catch { url = null; }
  if (!url || url.protocol !== 'https:' || url.origin !== base) {
    throw new Error(`base must be an https origin without path: ${JSON.stringify(base)}`);
  }
  let hits = 0;
  const count = (re, fn) => { xml = xml.replace(re, (...a) => { hits++; return fn(...a); }); };
  count(/<endpointUrl>[^<]*<\/endpointUrl>/g, () => `<endpointUrl>${base}</endpointUrl>`);
  count(/(<name>appUrl<\/name>\s*<value>)[^<]*(<\/value>)/g, (_m, a, b) => `${a}${base}${b}`);
  count(/(<property\b[^>]*\bname="appUrl"[^>]*\bdefault=")[^"]*(")/g, (_m, a, b) => `${a}${base}${b}`);
  if (!hits) throw new Error('no endpointUrl / appUrl element found');
  return xml;
}

module.exports = { rewriteTunnelUrl };

if (require.main === module) {
  const [base, ...files] = process.argv.slice(2);
  if (!base || files.length === 0) {
    process.stderr.write('usage: node scripts/set-tunnel-url.js <https-origin> <file>...\n');
    process.exit(2);
  }
  for (const f of files) fs.writeFileSync(f, rewriteTunnelUrl(fs.readFileSync(f, 'utf8'), base));
}
