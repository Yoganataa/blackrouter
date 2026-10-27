import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';

import { redactDiagnosticText } from './errors.ts';

import type {
  DeployCloudflareInput,
  DeployDenoInput,
  DeployNetlifyInput,
  DeployVercelInput,
  ProxyPool,
  TestProxyPoolResult,
} from '../contract.ts';

// ─── Relay Worker Codes ────────────────────────────────────────────────────────

export const CLOUDFLARE_WORKER_CODE = `
export default {
  async fetch(request, env, ctx) {
    const target = request.headers.get("x-relay-target");
    const relayPath = request.headers.get("x-relay-path") || "/";

    if (!target) {
      return new Response(JSON.stringify({ error: "Missing x-relay-target header" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const targetUrl = target.replace(/\\/$/, "") + relayPath;
    const newRequestInit = {
      method: request.method,
      headers: new Headers(request.headers),
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      newRequestInit.body = request.body;
      newRequestInit.duplex = "half";
    }

    newRequestInit.headers.delete("x-relay-target");
    newRequestInit.headers.delete("x-relay-path");
    newRequestInit.headers.delete("host");

    try {
      const response = await fetch(targetUrl, newRequestInit);
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Relay fetch failed" }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
  },
};
`;

export const VERCEL_RELAY_CODE = `
export const config = { runtime: "edge" };

export default async function handler(req) {
  const target = req.headers.get("x-relay-target");
  const relayPath = req.headers.get("x-relay-path") || "/";
  if (!target) {
    return new Response(JSON.stringify({ error: "Missing x-relay-target header" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const targetUrl = target.replace(/\\/$/, "") + relayPath;

  const rawHeaders = {};
  for (const [k, v] of req.headers.entries()) rawHeaders[k] = v;
  delete rawHeaders["x-relay-target"];
  delete rawHeaders["x-relay-path"];
  delete rawHeaders["host"];

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: rawHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      duplex: "half",
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
`;

export const DENO_RELAY_CODE = `
Deno.serve(async (request) => {
  const target = request.headers.get("x-relay-target");
  const relayPath = request.headers.get("x-relay-path") || "/";

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing x-relay-target header" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const targetUrl = target.replace(/\\/$/, "") + relayPath;
  const newHeaders = new Headers(request.headers);
  newHeaders.delete("x-relay-target");
  newHeaders.delete("x-relay-path");
  newHeaders.delete("host");

  const init = {
    method: request.method,
    headers: newHeaders,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const response = await fetch(targetUrl, init);
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
});
`;

export const NETLIFY_RELAY_CODE = `
exports.handler = async (event) => {
  const headers = {};
  for (const [k, v] of Object.entries(event.headers || {})) {
    headers[k.toLowerCase()] = v;
  }

  const target = headers["x-relay-target"];
  const relayPath = headers["x-relay-path"] || "/";

  if (!target) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Missing x-relay-target header" }),
    };
  }

  const targetUrl = target.replace(/\\/$/, "") + relayPath;
  const forwardHeaders = { ...event.headers };
  for (const k of Object.keys(forwardHeaders)) {
    const lower = k.toLowerCase();
    if (lower === "x-relay-target" || lower === "x-relay-path" || lower === "host") {
      delete forwardHeaders[k];
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: forwardHeaders,
      body:
        event.httpMethod !== "GET" && event.httpMethod !== "HEAD" && event.body
          ? event.isBase64Encoded
            ? Buffer.from(event.body, "base64")
            : event.body
          : undefined,
    });

    const responseHeaders = {};
    upstream.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const contentType = upstream.headers.get("content-type") || "";
    const isText = new RegExp(
      "^(text/|[^;]*json|[^;]*event-stream|[^;]*javascript|[^;]*xml|[^;]*urlencoded)",
      "i",
    ).test(contentType);

    const rawBody = await upstream.arrayBuffer();
    const responseBody = isText
      ? Buffer.from(rawBody).toString("utf8")
      : Buffer.from(rawBody).toString("base64");

    return {
      statusCode: upstream.status,
      headers: responseHeaders,
      body: responseBody,
      isBase64Encoded: !isText,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Relay fetch failed" }),
    };
  }
};
`;

// ─── Relay Testing ─────────────────────────────────────────────────────────────

export async function testRelay(
  relayUrl: string,
  timeoutMs = 10000,
  fetchImpl: typeof fetch = fetch,
): Promise<TestProxyPoolResult> {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(relayUrl, {
      method: 'GET',
      headers: {
        'x-relay-target': 'https://httpbin.org',
        'x-relay-path': '/get',
      },
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      elapsedMs: Date.now() - startedAt,
      error: res.ok ? null : `Relay responded with HTTP ${res.status}`,
    };
  } catch (err) {
    const errorMsg =
      err instanceof Error && err.name === 'AbortError'
        ? 'Relay test timed out'
        : err instanceof Error
          ? err.message
          : String(err);
    return {
      ok: false,
      status: 500,
      elapsedMs: Date.now() - startedAt,
      error: redactDiagnosticText(errorMsg),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function testForwardProxy(
  proxyUrlString: string,
  targetHost = 'opencode.ai',
  targetPort = 443,
  timeoutMs = 10000,
): Promise<TestProxyPoolResult> {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      resolve({
        ok: false,
        status: 504,
        elapsedMs: Date.now() - startedAt,
        error: 'Proxy CONNECT timed out',
      });
    }, timeoutMs);

    try {
      const proxy = new URL(proxyUrlString);
      const proxyPort = Number(proxy.port) || (proxy.protocol === 'https:' ? 443 : 80);
      const proxyHost = proxy.hostname;

      const connectHeaders: Record<string, string> = {
        Host: `${targetHost}:${targetPort}`,
        'User-Agent': 'BlackRouter',
      };
      if (proxy.username || proxy.password) {
        connectHeaders['Proxy-Authorization'] = `Basic ${Buffer.from(
          `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`,
        ).toString('base64')}`;
      }

      const transport = proxy.protocol === 'https:' ? https : http;
      const req = transport.request({
        host: proxyHost,
        port: proxyPort,
        method: 'CONNECT',
        path: `${targetHost}:${targetPort}`,
        headers: connectHeaders,
      });

      req.on('connect', (res, socket) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        socket.destroy();
        const ok = res.statusCode === 200;
        resolve({
          ok,
          status: res.statusCode,
          statusText: res.statusMessage,
          elapsedMs: Date.now() - startedAt,
          error: ok ? null : `Proxy CONNECT responded with HTTP ${res.statusCode}`,
        });
      });

      req.on('error', (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve({
          ok: false,
          status: 502,
          elapsedMs: Date.now() - startedAt,
          error: redactDiagnosticText(err instanceof Error ? err.message : String(err)),
        });
      });

      req.end();
    } catch (err) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        status: 400,
        elapsedMs: Date.now() - startedAt,
        error: redactDiagnosticText(err instanceof Error ? err.message : String(err)),
      });
    }
  });
}

export async function testRelayOrProxy(
  pool: Pick<ProxyPool, 'type' | 'proxyUrl'>,
  timeoutMs = 10000,
  fetchImpl: typeof fetch = fetch,
): Promise<TestProxyPoolResult> {
  if (pool.type === 'http') {
    return testForwardProxy(pool.proxyUrl, 'opencode.ai', 443, timeoutMs);
  }
  return testRelay(pool.proxyUrl, timeoutMs, fetchImpl);
}

// ─── Cloudflare Deployer ────────────────────────────────────────────────────────

export async function deployCloudflare(
  input: DeployCloudflareInput,
  fetchImpl: typeof fetch = fetch,
): Promise<{ name: string; proxyUrl: string }> {
  const accountId = input.accountId.trim();
  const apiToken = input.apiToken.trim();
  const projectName = input.projectName?.trim() || `cf-relay-${Date.now().toString(36)}`;

  const workerScriptUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${projectName}`;

  const formData = new FormData();
  formData.append('index.js', new Blob([CLOUDFLARE_WORKER_CODE], { type: 'application/javascript+module' }), 'index.js');
  formData.append(
    'metadata',
    new Blob(
      [
        JSON.stringify({
          main_module: 'index.js',
          compatibility_date: '2024-03-20',
        }),
      ],
      { type: 'application/json' },
    ),
    'metadata.json',
  );

  const uploadRes = await fetchImpl(workerScriptUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${apiToken}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = (await uploadRes.json().catch(() => ({}))) as { errors?: Array<{ message?: string }> };
    throw new Error(err.errors?.[0]?.message || `Cloudflare upload failed with status ${uploadRes.status}`);
  }

  // Enable workers.dev subdomain for the script
  await fetchImpl(`${workerScriptUrl}/subdomain`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enabled: true }),
  }).catch(() => {});

  // Retrieve workers.dev subdomain
  const subdomainRes = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  let subdomain = '';
  if (subdomainRes.ok) {
    const subdomainData = (await subdomainRes.json().catch(() => ({}))) as { result?: { subdomain?: string } };
    if (subdomainData.result?.subdomain) {
      subdomain = subdomainData.result.subdomain;
    }
  }

  if (!subdomain) {
    throw new Error('Worker deployed but failed to retrieve workers.dev subdomain. Verify subdomain setup in Cloudflare.');
  }

  return {
    name: projectName,
    proxyUrl: `https://${projectName}.${subdomain}.workers.dev`,
  };
}

// ─── Vercel Deployer ────────────────────────────────────────────────────────────

const VERCEL_API = 'https://api.vercel.com';

export async function deployVercel(
  input: DeployVercelInput,
  fetchImpl: typeof fetch = fetch,
  maxPollMs = 120000,
): Promise<{ name: string; proxyUrl: string }> {
  const vercelToken = input.vercelToken.trim();
  const projectName = input.projectName?.trim() || `vercel-relay-${Date.now().toString(36)}`;

  const deployRes = await fetchImpl(`${VERCEL_API}/v13/deployments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: [
        { file: 'api/relay.js', data: VERCEL_RELAY_CODE },
        { file: 'package.json', data: JSON.stringify({ name: projectName, version: '1.0.0' }) },
        { file: 'vercel.json', data: JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/api/relay' }] }) },
      ],
      projectSettings: { framework: null },
      target: 'production',
    }),
  });

  if (!deployRes.ok) {
    const err = (await deployRes.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message || `Vercel deploy request failed with status ${deployRes.status}`);
  }

  const deployData = (await deployRes.json()) as { id: string; url?: string };
  const deploymentId = deployData.id;

  // Poll until deployment is ready
  const start = Date.now();
  let liveUrl = deployData.url ? `https://${deployData.url}` : `https://${projectName}.vercel.app`;

  while (Date.now() - start < maxPollMs) {
    const statusRes = await fetchImpl(`${VERCEL_API}/v13/deployments/${deploymentId}`, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });
    if (statusRes.ok) {
      const statusData = (await statusRes.json()) as { readyState?: string; url?: string };
      if (statusData.readyState === 'READY') {
        if (statusData.url) liveUrl = `https://${statusData.url}`;
        break;
      }
      if (statusData.readyState === 'ERROR' || statusData.readyState === 'CANCELED') {
        throw new Error(`Vercel deployment failed: ${statusData.readyState}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return {
    name: projectName,
    proxyUrl: liveUrl,
  };
}

// ─── Deno Deployer ──────────────────────────────────────────────────────────────

const DENO_V2_API = 'https://api.deno.com/v2';

export async function deployDeno(
  input: DeployDenoInput,
  fetchImpl: typeof fetch = fetch,
  maxPollMs = 60000,
): Promise<{ name: string; proxyUrl: string }> {
  const denoToken = input.denoToken.trim();
  const orgDomain = input.orgDomain.trim();
  const projectName = input.projectName?.trim() || `deno-relay-${Date.now().toString(36)}`;

  const headers = {
    Authorization: `Bearer ${denoToken}`,
    'Content-Type': 'application/json',
  };

  const createAppRes = await fetchImpl(`${DENO_V2_API}/apps`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: projectName,
      labels: { 'custom.kind': 'blackrouter-relay' },
      config: {
        install: 'deno install',
        runtime: { type: 'dynamic', entrypoint: 'main.ts' },
      },
    }),
  });

  if (!createAppRes.ok) {
    const text = await createAppRes.text().catch(() => '');
    throw new Error(`Deno app creation failed (${createAppRes.status}): ${text}`);
  }

  const app = (await createAppRes.json()) as { id: string };

  const deployRes = await fetchImpl(`${DENO_V2_API}/apps/${app.id}/deploy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      assets: {
        'main.ts': {
          kind: 'file',
          content: DENO_RELAY_CODE,
          encoding: 'utf-8',
        },
      },
    }),
  });

  if (!deployRes.ok) {
    await fetchImpl(`${DENO_V2_API}/apps/${app.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${denoToken}` },
    }).catch(() => {});
    const text = await deployRes.text().catch(() => '');
    throw new Error(`Deno deploy failed (${deployRes.status}): ${text}`);
  }

  const revision = (await deployRes.json()) as { id: string; status: string };
  const revisionId = revision.id;

  let status = revision.status;
  const start = Date.now();
  while (status === 'queued' || status === 'building') {
    if (Date.now() - start > maxPollMs) {
      throw new Error('Deno deploy timed out');
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusRes = await fetchImpl(`${DENO_V2_API}/revisions/${revisionId}`, {
      headers: { Authorization: `Bearer ${denoToken}` },
    });
    if (statusRes.ok) {
      const data = (await statusRes.json()) as { status: string };
      status = data.status;
    }
  }

  if (status !== 'succeeded') {
    await fetchImpl(`${DENO_V2_API}/apps/${app.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${denoToken}` },
    }).catch(() => {});
    throw new Error(`Deno deploy failed with status: ${status}`);
  }

  const orgSlug = orgDomain.split('.')[0];
  const deployUrl = `https://${projectName}.${orgSlug}.deno.net`;

  return {
    name: projectName,
    proxyUrl: deployUrl,
  };
}

// ─── Netlify Deployer ───────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildStoredZip(files: Array<{ name: string; data: Uint8Array }>): Buffer {
  const encoder = new TextEncoder();
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const { name, data } of files) {
    const nameBytes = encoder.encode(name);
    const content = data;
    const crc = crc32(content);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, 0, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, content.length, true);
    local.setUint32(22, content.length, true);
    local.setUint16(26, nameBytes.length, true);
    chunks.push(Buffer.from(local.buffer), Buffer.from(nameBytes), Buffer.from(content));

    const centralHeader = new DataView(new ArrayBuffer(46));
    centralHeader.setUint32(0, 0x02014b50, true);
    centralHeader.setUint16(8, 0x0800, true);
    centralHeader.setUint16(10, 0, true);
    centralHeader.setUint32(16, crc, true);
    centralHeader.setUint32(20, content.length, true);
    centralHeader.setUint32(24, content.length, true);
    centralHeader.setUint16(28, nameBytes.length, true);
    centralHeader.setUint32(42, offset, true);
    central.push(Buffer.from(centralHeader.buffer), Buffer.from(nameBytes));

    offset += 30 + nameBytes.length + content.length;
  }

  const centralStart = offset;
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, centralStart, true);

  return Buffer.concat([...chunks, ...central, Buffer.from(end.buffer)]);
}

const NETLIFY_API = 'https://api.netlify.com/api/v1';

export async function deployNetlify(
  input: DeployNetlifyInput,
  fetchImpl: typeof fetch = fetch,
  maxPollMs = 120000,
): Promise<{ name: string; proxyUrl: string }> {
  const netlifyToken = input.netlifyToken.trim();
  const rawName = input.projectName?.trim().toLowerCase() || `netlify-relay-${Date.now().toString(36)}`;
  const siteName = rawName.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `relay-${Date.now().toString(36)}`;

  const headers = {
    Authorization: `Bearer ${netlifyToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'BlackRouter',
  };

  const siteRes = await fetchImpl(`${NETLIFY_API}/sites`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: siteName }),
  });

  if (!siteRes.ok) {
    const err = (await siteRes.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(err.message || err.error || `Netlify site creation failed (${siteRes.status})`);
  }

  const site = (await siteRes.json()) as { id?: string; site_id?: string; ssl_url?: string; url?: string };
  const siteId = site.id || site.site_id;
  const siteUrl = site.ssl_url || site.url;

  if (!siteId || !siteUrl) {
    throw new Error('Netlify site created but missing site ID or URL');
  }

  const zip = buildStoredZip([
    { name: 'relay.js', data: new TextEncoder().encode(NETLIFY_RELAY_CODE) },
  ]);
  const zipSha256 = createHash('sha256').update(zip).digest('hex');

  const indexHtml = new TextEncoder().encode('<!doctype html><html><body>BlackRouter Relay</body></html>');
  const indexSha1 = createHash('sha1').update(indexHtml).digest('hex');

  const deployRes = await fetchImpl(`${NETLIFY_API}/sites/${siteId}/deploys`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      files: { '/index.html': indexSha1 },
      functions: { relay: zipSha256 },
    }),
  });

  if (!deployRes.ok) {
    const err = (await deployRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || `Netlify deploy initialization failed (${deployRes.status})`);
  }

  const deploy = (await deployRes.json()) as { id: string; required?: string[]; required_functions?: string[] };
  const deployId = deploy.id;

  const requiredFiles = new Set(deploy.required || []);
  const requiredFunctions = new Set(deploy.required_functions || []);

  if (requiredFiles.has(indexSha1)) {
    await fetchImpl(`${NETLIFY_API}/deploys/${deployId}/files/index.html`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        'Content-Type': 'application/octet-stream',
        'User-Agent': 'BlackRouter',
      },
      body: indexHtml,
    });
  }

  if (requiredFunctions.has(zipSha256)) {
    await fetchImpl(`${NETLIFY_API}/deploys/${deployId}/functions/relay?runtime=js`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        'Content-Type': 'application/octet-stream',
        'User-Agent': 'BlackRouter',
      },
      body: new Uint8Array(zip),
    });
  }

  // Poll until ready
  const start = Date.now();
  while (Date.now() - start < maxPollMs) {
    const pollRes = await fetchImpl(`${NETLIFY_API}/deploys/${deployId}`, {
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        'User-Agent': 'BlackRouter',
      },
    });
    if (pollRes.ok) {
      const data = (await pollRes.json().catch(() => ({}))) as { state?: string; error_message?: string };
      if (data.state === 'ready') break;
      if (data.state === 'error') {
        throw new Error(data.error_message || 'Netlify deploy failed');
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  const relayUrl = `${siteUrl.replace(/\/$/, '')}/.netlify/functions/relay`;
  return {
    name: siteName,
    proxyUrl: relayUrl,
  };
}
