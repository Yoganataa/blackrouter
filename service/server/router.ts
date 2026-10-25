import type { JsonValue } from '../../json.ts';

export type ServiceMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ServiceRequest = {
  method: ServiceMethod;
  path: string;
  query: URLSearchParams;
  body: string;
  params: Record<string, string>;
};

export type ServiceResponse = {
  status: number;
  body: JsonValue;
};

export type RouteHandler = (request: ServiceRequest) => Promise<ServiceResponse>;

type Route = {
  method: ServiceMethod;
  segments: string[];
  handler: RouteHandler;
};

/**
 * The routes the service answers on the host proxy.
 *
 * A path segment written as `:name` is a parameter and comes back in the
 * request. The router stays small on purpose: it finds the handler and hands
 * the request over.
 */
export type Router = {
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
  put(path: string, handler: RouteHandler): void;
  delete(path: string, handler: RouteHandler): void;
  handle(request: ServiceRequest): Promise<ServiceResponse | null>;
};

export const createRouter = (): Router => {
  const routes: Route[] = [];

  const add = (method: ServiceMethod, path: string, handler: RouteHandler): void => {
    routes.push({ method, segments: path.split('/').filter(Boolean), handler });
  };

  const match = (route: Route, segments: string[]): Record<string, string> | null => {
    if (route.segments.length !== segments.length) {
      return null;
    }
    const params: Record<string, string> = {};
    for (let index = 0; index < route.segments.length; index += 1) {
      const pattern = route.segments[index] ?? '';
      const actual = segments[index] ?? '';
      if (pattern.startsWith(':')) {
        params[pattern.slice(1)] = decodeURIComponent(actual);
        continue;
      }
      if (pattern !== actual) {
        return null;
      }
    }
    return params;
  };

  return {
    get: (path, handler) => add('GET', path, handler),
    post: (path, handler) => add('POST', path, handler),
    put: (path, handler) => add('PUT', path, handler),
    delete: (path, handler) => add('DELETE', path, handler),
    handle: async (request) => {
      const segments = request.path.split('/').filter(Boolean);
      for (const route of routes) {
        if (route.method !== request.method) {
          continue;
        }
        const params = match(route, segments);
        if (!params) {
          continue;
        }
        return route.handler({ ...request, params });
      }
      return null;
    },
  };
};
