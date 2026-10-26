// OpenChamber transport seam for the native provider executor.
// Provider-specific URL, headers, and body transforms stay in the upstream executor;
// this base delegates the already-prepared request to BlackRouter's local transport.
export class BaseExecutor {
  constructor(provider, config) {
    this.provider = provider;
    this.config = config;
    this.noAuth = config?.noAuth || false;
  }

  transformRequest(_model, body) {
    return body;
  }

  buildUrl() {
    throw new Error(`No URL builder configured for ${this.provider}`);
  }

  buildHeaders() {
    throw new Error(`No header builder configured for ${this.provider}`);
  }

  async execute({ model, body, stream = true, credentials = {}, dispatch, ...options }) {
    if (typeof dispatch !== "function") {
      throw new Error("A local transport adapter is required.");
    }
    const transformedBody = this.transformRequest(model, body, stream, credentials);
    const url = this.buildUrl(model, stream, 0, credentials);
    const headers = this.buildHeaders(credentials, stream, url, model, transformedBody);
    const path = new URL(url).pathname;
    const responseFormat = path.endsWith("/responses")
      ? "openai-responses"
      : path.endsWith("/messages")
        ? "claude"
        : "openai";
    const result = await dispatch({
      url,
      headers,
      body: transformedBody,
      responseFormat,
      ...options,
    });
    return { ...result, nativeUrl: url, nativeHeaders: headers, transformedBody, responseFormat: result.responseFormat || responseFormat };
  }
}
