import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createServer, loadConfigFromFile } from 'vite';

let moduleId = 0;
async function loadApp(env = {}) {
  const result = await build({
    stdin: {
      contents: 'export * from "./src/lib/utm"; export * from "./src/lib/crm"; export * from "./src/lib/lead";',
      resolveDir: process.cwd(), loader: 'ts',
    },
    bundle: true, write: false, format: 'esm', platform: 'browser',
    define: { 'import.meta.env': JSON.stringify(env) },
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}#${moduleId++}`);
}

function browser(url, storage = new Map()) {
  globalThis.window = {
    location: new URL(url), setTimeout, clearTimeout,
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  };
  globalThis.document = { referrer: 'https://referrer.example/', cookie: '' };
  return storage;
}

const quiz = () => ({
  leadId: 'mock-lead', startedAt: '2026-10-26T12:00:00Z',
  contact: { name: '  Nome Teste  ', business: 'Loja Teste', whatsapp: '(86) 99876-5432', email: '', cnpj: '01.234.567/0001-89', consent: true },
  location: { state: 'PI', uf: 'PI', city: ' Teresina ' },
  answers: { establishment: 'cosmetics', resale: 'frequent', budget: '501to1500', relationship: 'new', timing: 'asap' },
});

test('captura integral, cookies tardios e payload Fonil sem aliases internos', async () => {
  const campaign = 'campanha-á'.repeat(80);
  const url = `https://quiz.example/?utm_campaign=${encodeURIComponent(campaign)}&utm_custom=extra&gclid=google&gbraid=braid&wbraid=web&msclkid=ms&ttclid=tt&fbclid=meta&campaign_id=123&adset_id=456&ad_id=789&placement=feed#form`;
  browser(url);
  const app = await loadApp();
  app.captureTracking();
  document.cookie = '_fbc=fb.1.123.meta; _fbp=fb.1.123.browser';
  const lead = app.buildLeadPayload(quiz());
  const payload = app.buildFonilPayload(lead);
  assert.equal(payload.event_source_url, url);
  assert.equal(payload.utm_campaign, campaign);
  assert.equal(payload.utm_custom, 'extra');
  for (const key of ['gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid', 'fbclid', 'campaign_id', 'adset_id', 'ad_id', 'placement']) {
    assert.equal(payload[key], new URL(url).searchParams.get(key));
  }
  assert.equal(payload.fbc, 'fb.1.123.meta');
  assert.equal(payload.fbp, 'fb.1.123.browser');
  assert.equal(payload.name, 'Nome Teste');
  assert.equal(payload.phone, '86998765432');
  assert.equal(payload.document, '01234567000189');
  assert.equal(payload.city, 'Teresina');
  assert.equal(payload.consultant, 'Henrique');
  for (const key of ['email', 'page_url', 'landing_url', 'landing_page', 'referrer', '_fbc', '_fbp', 'event_id', 'lead_id', 'user_agent']) assert.ok(!(key in payload), key);
  // Observações: cada pergunta respondida vira uma chave própria (pergunta → resposta), na ordem das telas.
  const questions = Object.keys(payload).filter((key) => key.endsWith('?'));
  assert.equal(questions.length, 6);
  assert.equal(questions[0], 'Qual é o tipo do seu estabelecimento?');
  assert.equal(payload['Qual é o tipo do seu estabelecimento?'], 'Loja de cosméticos ou perfumaria');
  assert.equal(payload['Onde fica o seu estabelecimento?'], 'Teresina/PI');
  assert.equal(payload['Sua loja já vende óleos e produtos capilares?'], 'Sim, vendo com frequência');
  assert.ok(!('notes' in payload));
  assert.equal(lead.tracking.referrer, 'https://referrer.example/');
  assert.ok(lead.answers.establishment.label);
  assert.equal(lead.contact.business_name, 'Loja Teste');
  lead.contact.cnpj = '12.ABC.345/01DE-35';
  assert.equal(app.buildFonilPayload(lead).document, '12ABC34501DE35');
});

test('sessão mantém a origem completa; nova campanha substitui dados antigos sem misturar cliques', async () => {
  const first = 'https://quiz.example/?utm_source=ig&fbclid=old#inicio';
  const storage = browser(first);
  let app = await loadApp();
  app.captureTracking();
  browser('https://quiz.example/etapa', storage);
  app = await loadApp();
  assert.equal(app.captureTracking().event_source_url, first);
  const second = 'https://quiz.example/?utm_custom=nova&gclid=new#segunda';
  browser(second, storage);
  app = await loadApp();
  const tracking = app.captureTracking();
  assert.equal(tracking.event_source_url, second);
  assert.equal(tracking.utm_custom, 'nova');
  assert.equal(tracking.utm_source, '');
  assert.equal(tracking.fbclid, '');
  assert.equal(tracking.gclid, 'new');
});

test('orgânico, macros não resolvidas, cookies bloqueados e telefone com DDD 55', async () => {
  browser('https://quiz.example/?fbclid=fbclid&utm_campaign=%7B%7Bcampaign.name%7D%7D&ad_id=%7Badid%7D#inicio');
  const app = await loadApp();
  Object.defineProperty(document, 'cookie', { get() { throw new Error('blocked'); } });
  const input = quiz();
  input.contact.cnpj = '';
  const lead = app.buildLeadPayload(input);
  lead.contact.whatsapp = '55987654321';
  const payload = app.buildFonilPayload(lead);
  assert.equal(payload.phone, '55987654321');
  for (const key of ['utm_campaign', 'fbclid', 'ad_id', 'fbc', 'fbp', 'document', 'email']) assert.ok(!(key in payload), key);
  assert.equal(payload.event_source_url, window.location.href);
  browser('https://quiz.example/');
  window.sessionStorage.getItem = () => { throw new Error('blocked'); };
  window.sessionStorage.setItem = () => { throw new Error('blocked'); };
  const organic = await loadApp();
  assert.equal(organic.captureTracking().event_source_url, 'https://quiz.example/');
});

test('POST final atravessa o proxy até um receptor local; falha e reenvio preservam destinos', async () => {
  const received = [];
  let crmStatus = 422;
  const receiver = createHttpServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    received.push({ path: req.url, body: JSON.parse(raw), headers: req.headers });
    res.writeHead(req.url.startsWith('/api/webhooks/leads/') ? crmStatus : 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: crmStatus === 200 }));
  });
  await new Promise((resolve) => receiver.listen(0, '127.0.0.1', resolve));
  const upstream = `http://127.0.0.1:${receiver.address().port}`;
  const loaded = await loadConfigFromFile({ command: 'serve', mode: 'test' });
  // Usa o rewrite real, mas força o destino local: nenhum cadastro real é criado.
  const proxy = { ...loaded.config.server.proxy['/api/crm-lead'], target: upstream };
  const server = await createServer({ configFile: false, server: { host: '127.0.0.1', port: 0, proxy: { '/api/crm-lead': proxy } } });
  const originalFetch = globalThis.fetch;
  try {
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    globalThis.fetch = (url, options) => originalFetch(new URL(url, origin), options);
    browser('https://quiz.example/?utm_source=ig&utm_id=123#form');
    document.cookie = '_fbc=fb.1.123.click; _fbp=fb.1.123.visitor';
    const app = await loadApp({ VITE_CRM_ENDPOINT_PI: `${upstream}/state` });
    const payload = app.buildLeadPayload(quiz());
    const failed = await app.submitLead(payload);
    assert.equal(failed.crmOk, false);
    assert.equal(failed.stateOk, true);
    crmStatus = 200;
    const success = await app.submitLead(payload, { state: false, crm: true });
    assert.equal(success.crmOk, true);
    assert.equal(received.filter((r) => r.path === '/state').length, 1);
    const crmRequests = received.filter((r) => r.path.startsWith('/api/webhooks/leads/'));
    assert.equal(crmRequests.length, 2);
    for (const request of crmRequests) {
      assert.deepEqual(request.body, app.buildFonilPayload(payload));
      assert.equal(request.headers['content-type'], 'application/json');
      assert.equal(request.body.event_source_url, window.location.href);
      assert.equal(request.body.utm_id, '123');
      assert.ok(!('referrer' in request.body));
      assert.ok(!('_fbc' in request.body));
    }
    assert.deepEqual(received.find((r) => r.path === '/state').body, payload);
  } finally {
    globalThis.fetch = originalFetch;
    await server.close();
    receiver.closeAllConnections();
    await new Promise((resolve) => receiver.close(resolve));
  }
});
