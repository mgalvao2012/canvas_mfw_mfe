(async () => {
  const statusEl = document.getElementById('status');
  const wrapper = document.getElementById('tableWrapper');
  const rowsEl = document.getElementById('rows');

  const { sfOrigin } = await fetch('/config.json').then((r) => r.json());
  const ALLOWED = sfOrigin.split(',').map((s) => s.trim()).filter(Boolean);
  let shellId = null;

  function notify(eventType, detail) {
    window.parent.postMessage(
      { type: 'bridge-event', id: shellId, data: { eventType, detail } }, '*');
  }
  const resize = () => notify('resize', { height: document.body.scrollHeight });

  const fmt = (amount, ccy) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: ccy || 'BRL' }).format(amount);

  function cell(text, cls) {
    const td = document.createElement('td');
    if (cls) td.className = cls;
    td.textContent = text ?? '—';
    return td;
  }

  function render(items) {
    rowsEl.replaceChildren();
    if (!items.length) {
      statusEl.textContent = 'Nenhuma conta financeira encontrada para este registro.';
      statusEl.hidden = false;
      wrapper.hidden = true;
      return resize();
    }
    for (const f of items) {
      const tr = document.createElement('tr');
      tr.append(cell(f.financialAccountNumber), cell(f.category), cell(f.productName), cell(f.modality));
      const st = document.createElement('td');
      const tag = document.createElement('span');
      tag.className = 'ds-tag' + (f.status === 'Ativo' ? ' ativo' : '');
      tag.textContent = f.status;
      st.append(tag);
      tr.append(st, cell(f.amountType), cell(fmt(f.amount, f.currencyIsoCode), 'num'), cell(f.mainConditions));
      rowsEl.append(tr);
    }
    statusEl.hidden = true;
    wrapper.hidden = false;
    resize();
  }

  async function onRecordContext(recordId) {
    if (!recordId) return;
    statusEl.hidden = false;
    statusEl.textContent = 'Carregando…';
    try {
      const r = await fetch(`/api/financial-accounts?accountId=${encodeURIComponent(recordId)}`);
      if (!r.ok) throw new Error(r.status);
      render((await r.json()).financialAccounts);
    } catch (e) {
      statusEl.textContent = 'Erro ao carregar as contas financeiras.';
      resize();
    }
  }

  window.addEventListener('message', (e) => {
    if (e.source !== window.parent) return;      // só o shell
    if (!ALLOWED.includes(e.origin)) return;     // valida a origem
    const { type, data, id } = e.data || {};
    if (type === 'salesforce-shell-ready') shellId = id;
    if (type === 'salesforce-data') onRecordContext(data?.recordId, data?.objectApiName);
    if (type === 'salesforce-theme' && data && typeof data === 'object') {
      // [UNKNOWN] formato do payload de tema; aplica como CSS vars se vier chave/valor
      for (const [k, v] of Object.entries(data)) {
        if (/^--[\w-]+$/.test(k)) document.documentElement.style.setProperty(k, String(v));
      }
    }
  });

  window.parent.postMessage({ type: 'bridge-ready' }, '*');
  notify('widget-ready');
  resize();
  new ResizeObserver(resize).observe(document.body);

  // Dev local (fora do iframe): /?recordId=001aj00003oZj1jAAC
  const dev = new URLSearchParams(location.search).get('recordId');
  if (dev && window.parent === window) onRecordContext(dev);
})();
