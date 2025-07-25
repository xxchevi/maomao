import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server as Server$1 } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, removeResponseHeader, createError, getQuery as getQuery$1, readBody, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, getHeader, getMethod, getCookie, getResponseStatusText } from 'file://D:/demo/maomao2/node_modules/h3/dist/index.mjs';
import { escapeHtml } from 'file://D:/demo/maomao2/node_modules/@vue/shared/dist/shared.cjs.js';
import jwt from 'file://D:/demo/maomao2/node_modules/jsonwebtoken/index.js';
import { z } from 'file://D:/demo/maomao2/node_modules/zod/index.js';
import { PrismaClient } from '@prisma/client';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://D:/demo/maomao2/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'file://D:/demo/maomao2/node_modules/ufo/dist/index.mjs';
import { renderToString } from 'file://D:/demo/maomao2/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://D:/demo/maomao2/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://D:/demo/maomao2/node_modules/defu/dist/defu.mjs';
import destr, { destr as destr$1 } from 'file://D:/demo/maomao2/node_modules/destr/dist/index.mjs';
import { snakeCase } from 'file://D:/demo/maomao2/node_modules/scule/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://D:/demo/maomao2/node_modules/unhead/dist/server.mjs';
import { stringify, uneval } from 'file://D:/demo/maomao2/node_modules/devalue/index.js';
import { isVNode, toValue, isRef } from 'file://D:/demo/maomao2/node_modules/vue/index.mjs';
import { DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file://D:/demo/maomao2/node_modules/unhead/dist/plugins.mjs';
import { createHooks } from 'file://D:/demo/maomao2/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://D:/demo/maomao2/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://D:/demo/maomao2/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://D:/demo/maomao2/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://D:/demo/maomao2/node_modules/unstorage/drivers/fs.mjs';
import unstorage_47drivers_47redis from 'file://D:/demo/maomao2/node_modules/unstorage/drivers/redis.mjs';
import { digest } from 'file://D:/demo/maomao2/node_modules/nitropack/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://D:/demo/maomao2/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file://D:/demo/maomao2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://D:/demo/maomao2/node_modules/youch-core/build/index.js';
import { Youch } from 'file://D:/demo/maomao2/node_modules/nitropack/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://D:/demo/maomao2/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://D:/demo/maomao2/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://D:/demo/maomao2/node_modules/errx/dist/index.js';
import Database from 'file://D:/demo/maomao2/node_modules/better-sqlite3/lib/index.js';
import bcrypt from 'file://D:/demo/maomao2/node_modules/bcryptjs/index.js';
import { Server } from 'file://D:/demo/maomao2/node_modules/socket.io/wrapper.mjs';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://D:/demo/maomao2/node_modules/pathe/dist/index.mjs';
import { walkResolver } from 'file://D:/demo/maomao2/node_modules/unhead/dist/utils.mjs';

const serverAssets = [{"baseName":"server","dir":"D:/demo/maomao2/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('redis', unstorage_47drivers_47redis({"driver":"redis"}));
storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"D:/demo/maomao2","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"D:/demo/maomao2/server","watchOptions":{"ignored":[null]}}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"D:/demo/maomao2/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"D:/demo/maomao2/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"D:/demo/maomao2/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/": {
        "prerender": true
      },
      "/login": {
        "prerender": true
      },
      "/register": {
        "prerender": true
      },
      "/collect": {
        "ssr": false
      },
      "/inventory": {
        "ssr": false
      },
      "/skills": {
        "ssr": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "apiBase": "http://localhost:3000",
    "socketUrl": "http://localhost:3001"
  },
  "jwtSecret": "your-secret-key"
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
    defaultRes.body.stack = defaultRes.body.stack.join("\n");
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _JX81cdtwm_Dg_v9YXAo9_oNNXTVbPnR7GtoBPWjBBY = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const rootDir = "D:/demo/maomao2";

const appHead = {"meta":[{"name":"viewport","content":"width=device-width,initial-scale=1"},{"charset":"utf-8"}],"link":[],"style":[],"script":[],"noscript":[],"viewport":"width=device-width,initial-scale=1","charset":"utf-8"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const devReducers = {
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _vxFX_YTfZDdVF7mwype5xEfzz_WP0CyMd8m3UWtUHA = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
  };
  onConsoleLog((_log) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    const rawStack = captureRawStackTrace();
    if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
      return;
    }
    const trace = [];
    let filename = "";
    for (const entry of parseRawStackTrace(rawStack)) {
      if (entry.source === globalThis._importMeta_.url) {
        continue;
      }
      if (EXCLUDE_TRACE_RE.test(entry.source)) {
        continue;
      }
      filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
      trace.push({
        ...entry,
        source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
      });
    }
    const log = {
      ..._log,
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

function defineNitroPlugin(def) {
  return def;
}

const dbPath = join(process.cwd(), "data", "game.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      energy INTEGER DEFAULT 100,
      maxEnergy INTEGER DEFAULT 100,
      coins INTEGER DEFAULT 0,
      gems INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLogin DATETIME
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      collectingTaskId TEXT,
      collectingProgress INTEGER DEFAULT 0,
      collectingStartTime DATETIME,
      isCollecting BOOLEAN DEFAULT FALSE,
      inventory TEXT DEFAULT '[]',
      achievements TEXT DEFAULT '[]',
      settings TEXT DEFAULT '{}',
      farmingLevel INTEGER DEFAULT 1,
      farmingExp INTEGER DEFAULT 0,
      miningLevel INTEGER DEFAULT 1,
      miningExp INTEGER DEFAULT 0,
      agricultureLevel INTEGER DEFAULT 1,
      agricultureExp INTEGER DEFAULT 0,
      fishingLevel INTEGER DEFAULT 1,
      fishingExp INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      taskType TEXT NOT NULL,
      taskName TEXT NOT NULL,
      duration INTEGER NOT NULL,
      count INTEGER NOT NULL,
      remainingCount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      currentProgress INTEGER DEFAULT 0,
      startTime DATETIME,
      endTime DATETIME,
      rewards TEXT DEFAULT '[]',
      experience INTEGER DEFAULT 0,
      skillType TEXT NOT NULL,
      energyCost INTEGER NOT NULL,
      queuePosition INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_game_data_userId ON game_data(userId);
    CREATE INDEX IF NOT EXISTS idx_task_queue_userId ON task_queue(userId);
    CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status);
    CREATE INDEX IF NOT EXISTS idx_task_queue_position ON task_queue(queuePosition);
  `);
  console.log("\u6570\u636E\u5E93\u521D\u59CB\u5316\u5B8C\u6210");
}
const userDb = {
  // 创建用户
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (username, password, email, level, experience, energy, maxEnergy, coins, gems)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userData.username,
      hashedPassword,
      userData.email || null,
      userData.level,
      userData.experience,
      userData.energy,
      userData.maxEnergy,
      userData.coins,
      userData.gems
    );
    const user = this.findById(result.lastInsertRowid);
    if (!user) throw new Error("\u521B\u5EFA\u7528\u6237\u5931\u8D25");
    gameDataDb.create(user.id);
    return user;
  },
  // 根据ID查找用户
  findById(id) {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return stmt.get(id);
  },
  // 根据用户名查找用户
  findByUsername(username) {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username);
  },
  // 验证密码
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },
  // 更新用户信息
  update(id, updates) {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return this.findById(id);
  },
  // 更新最后登录时间
  updateLastLogin(id) {
    const stmt = db.prepare("UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
};
const gameDataDb = {
  // 创建游戏数据
  create(userId) {
    const stmt = db.prepare(`
      INSERT INTO game_data (userId, farmingLevel, farmingExp, miningLevel, miningExp, agricultureLevel, agricultureExp, fishingLevel, fishingExp)
      VALUES (?, 1, 0, 1, 0, 1, 0, 1, 0)
    `);
    stmt.run(userId);
    const gameData = this.findByUserId(userId);
    if (!gameData) throw new Error("\u521B\u5EFA\u6E38\u620F\u6570\u636E\u5931\u8D25");
    return gameData;
  },
  // 根据用户ID查找游戏数据
  findByUserId(userId) {
    const stmt = db.prepare("SELECT * FROM game_data WHERE userId = ?");
    return stmt.get(userId);
  },
  // 更新游戏数据
  update(userId, updates) {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    const stmt = db.prepare(`
      UPDATE game_data 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE userId = ?
    `);
    stmt.run(...values, userId);
    return this.findByUserId(userId);
  },
  // 更新采集状态
  updateCollectingStatus(userId, isCollecting, taskId, progress) {
    const stmt = db.prepare(`
      UPDATE game_data 
      SET isCollecting = ?, collectingTaskId = ?, collectingProgress = ?, 
          collectingStartTime = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE userId = ?
    `);
    stmt.run(
      isCollecting ? 1 : 0,
      // 转换布尔值为数字
      taskId || null,
      progress || 0,
      isCollecting ? (/* @__PURE__ */ new Date()).toISOString() : null,
      userId
    );
  }
};
const taskQueueDb = {
  // 添加任务到队列
  addTask(userId, taskData) {
    const maxPositionStmt = db.prepare('SELECT MAX(queuePosition) as maxPos FROM task_queue WHERE userId = ? AND status != "completed" AND status != "cancelled"');
    const result = maxPositionStmt.get(userId);
    const nextPosition = (result.maxPos || 0) + 1;
    const stmt = db.prepare(`
      INSERT INTO task_queue (
        userId, taskType, taskName, duration, count, remainingCount, 
        status, rewards, experience, skillType, energyCost, queuePosition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertResult = stmt.run(
      userId,
      taskData.taskType,
      taskData.taskName,
      taskData.duration,
      taskData.count,
      taskData.remainingCount,
      taskData.status,
      taskData.rewards,
      taskData.experience,
      taskData.skillType,
      taskData.energyCost,
      nextPosition
    );
    const task = this.findById(insertResult.lastInsertRowid);
    if (!task) throw new Error("\u521B\u5EFA\u4EFB\u52A1\u5931\u8D25");
    return task;
  },
  // 根据ID查找任务
  findById(id) {
    const stmt = db.prepare("SELECT * FROM task_queue WHERE id = ?");
    return stmt.get(id);
  },
  // 获取用户的任务队列
  getUserQueue(userId) {
    const stmt = db.prepare(`
      SELECT * FROM task_queue 
      WHERE userId = ? AND status != "completed" AND status != "cancelled"
      ORDER BY queuePosition ASC
    `);
    return stmt.all(userId);
  },
  // 获取下一个待执行的任务
  getNextPendingTask(userId) {
    const stmt = db.prepare(`
      SELECT * FROM task_queue 
      WHERE userId = ? AND status = "pending"
      ORDER BY queuePosition ASC
      LIMIT 1
    `);
    return stmt.get(userId);
  },
  // 获取当前正在执行的任务
  getCurrentRunningTask(userId) {
    const stmt = db.prepare(`
      SELECT * FROM task_queue 
      WHERE userId = ? AND status = "running"
      LIMIT 1
    `);
    return stmt.get(userId);
  },
  // 更新任务状态
  updateTask(id, updates) {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    const stmt = db.prepare(`
      UPDATE task_queue 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return this.findById(id);
  },
  // 删除任务
  deleteTask(id) {
    const stmt = db.prepare("DELETE FROM task_queue WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  },
  // 获取队列长度
  getQueueLength(userId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM task_queue 
      WHERE userId = ? AND status != "completed" AND status != "cancelled"
    `);
    const result = stmt.get(userId);
    return result.count;
  },
  // 重新排序队列
  reorderQueue(userId) {
    const tasks = this.getUserQueue(userId);
    tasks.forEach((task, index) => {
      this.updateTask(task.id, { queuePosition: index + 1 });
    });
  },
  // 根据ID获取任务（用于WebSocket）
  getTaskById(id) {
    return this.findById(id);
  },
  // 移除任务（用于WebSocket）
  removeTask(id) {
    const stmt = db.prepare('UPDATE task_queue SET status = "cancelled", updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
  // 添加任务（WebSocket版本）
  addTaskForSocket(taskData) {
    const maxPositionStmt = db.prepare('SELECT MAX(queuePosition) as maxPos FROM task_queue WHERE userId = ? AND status != "completed" AND status != "cancelled"');
    const result = maxPositionStmt.get(taskData.userId);
    const nextPosition = (result.maxPos || 0) + 1;
    const stmt = db.prepare(`
      INSERT INTO task_queue (
        userId, taskType, taskName, duration, totalCount, remainingCount, 
        status, rewards, experience, skillType, energyCost, queuePosition
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `);
    const insertResult = stmt.run(
      taskData.userId,
      taskData.taskType,
      taskData.taskName,
      taskData.duration,
      taskData.totalCount,
      taskData.remainingCount,
      taskData.rewards,
      taskData.experience,
      taskData.skillType,
      taskData.energyCost,
      nextPosition
    );
    return insertResult.lastInsertRowid;
  }
};
function migrateDatabase() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(game_data)").all();
    const hasSkillFields = tableInfo.some((col) => col.name === "farmingLevel");
    const hasAgricultureFields = tableInfo.some((col) => col.name === "agricultureLevel");
    const hasFishingFields = tableInfo.some((col) => col.name === "fishingLevel");
    if (!hasSkillFields) {
      console.log("\u6B63\u5728\u6DFB\u52A0\u57FA\u7840\u6280\u80FD\u5B57\u6BB5\u5230\u6570\u636E\u5E93...");
      db.exec(`
        ALTER TABLE game_data ADD COLUMN farmingLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN farmingExp INTEGER DEFAULT 0;
        ALTER TABLE game_data ADD COLUMN miningLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN miningExp INTEGER DEFAULT 0;
      `);
      console.log("\u57FA\u7840\u6280\u80FD\u5B57\u6BB5\u6DFB\u52A0\u5B8C\u6210");
    }
    if (!hasAgricultureFields) {
      console.log("\u6B63\u5728\u6DFB\u52A0\u519C\u4E1A\u6280\u80FD\u5B57\u6BB5\u5230\u6570\u636E\u5E93...");
      db.exec(`
        ALTER TABLE game_data ADD COLUMN agricultureLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN agricultureExp INTEGER DEFAULT 0;
      `);
      console.log("\u519C\u4E1A\u6280\u80FD\u5B57\u6BB5\u6DFB\u52A0\u5B8C\u6210");
    }
    if (!hasFishingFields) {
      console.log("\u6B63\u5728\u6DFB\u52A0\u9493\u9C7C\u6280\u80FD\u5B57\u6BB5\u5230\u6570\u636E\u5E93...");
      db.exec(`
        ALTER TABLE game_data ADD COLUMN fishingLevel INTEGER DEFAULT 1;
        ALTER TABLE game_data ADD COLUMN fishingExp INTEGER DEFAULT 0;
      `);
      console.log("\u9493\u9C7C\u6280\u80FD\u5B57\u6BB5\u6DFB\u52A0\u5B8C\u6210");
    }
  } catch (error) {
    console.error("\u6570\u636E\u5E93\u8FC1\u79FB\u9519\u8BEF:", error);
  }
}
{
  initDatabase();
  migrateDatabase();
}

async function seedDatabase() {
  try {
    initDatabase();
    const existingUser = userDb.findByUsername("testuser");
    if (existingUser) {
      console.log("\u6D4B\u8BD5\u7528\u6237\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\u79CD\u5B50\u6570\u636E\u521B\u5EFA");
      return;
    }
    const testUser = await userDb.create({
      username: "test",
      password: "1234",
      email: "test@example.com",
      level: 1,
      experience: 0,
      coins: 100,
      gems: 10
    });
    console.log("\u6D4B\u8BD5\u7528\u6237\u521B\u5EFA\u6210\u529F:", testUser.username);
    const adminUser = await userDb.create({
      username: "admin",
      password: "1234",
      email: "admin@example.com",
      level: 10,
      experience: 1e3,
      coins: 1e3,
      gems: 100
    });
    console.log("\u7BA1\u7406\u5458\u7528\u6237\u521B\u5EFA\u6210\u529F:", adminUser.username);
  } catch (error) {
    console.error("\u79CD\u5B50\u6570\u636E\u521B\u5EFA\u5931\u8D25:", error);
  }
}
if (globalThis._importMeta_.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

const _6U5i_QKgsmxBOyiF0DYz4IiHj50tYYKr9tLaQZ9_uZw = defineNitroPlugin(async (nitroApp) => {
  console.log("\u6B63\u5728\u521D\u59CB\u5316\u6570\u636E\u5E93...");
  try {
    await seedDatabase();
    console.log("\u6570\u636E\u5E93\u521D\u59CB\u5316\u5B8C\u6210");
  } catch (error) {
    console.error("\u6570\u636E\u5E93\u521D\u59CB\u5316\u5931\u8D25:", error);
  }
});

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class QueueProcessor {
  constructor() {
    __publicField(this, "intervals", /* @__PURE__ */ new Map());
    __publicField(this, "processingUsers", /* @__PURE__ */ new Set());
  }
  // 开始处理用户的队列
  startProcessing(userId, socketEmit) {
    if (this.processingUsers.has(userId)) {
      return;
    }
    this.processingUsers.add(userId);
    this.processUserQueue(userId, socketEmit);
  }
  // 停止处理用户的队列
  stopProcessing(userId) {
    const interval = this.intervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(userId);
    }
    this.processingUsers.delete(userId);
  }
  // 处理用户队列
  async processUserQueue(userId, socketEmit) {
    try {
      let currentTask = taskQueueDb.getCurrentRunningTask(userId);
      if (!currentTask) {
        const nextTask = taskQueueDb.getNextPendingTask(userId);
        if (nextTask) {
          currentTask = this.startTask(nextTask);
        }
      }
      if (currentTask) {
        this.setupTaskProgressTimer(currentTask, socketEmit);
      } else {
        this.stopProcessing(userId);
      }
    } catch (error) {
      console.error(`\u5904\u7406\u7528\u6237 ${userId} \u961F\u5217\u65F6\u51FA\u9519:`, error);
      this.stopProcessing(userId);
    }
  }
  // 开始执行任务
  startTask(task) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const endTime = new Date(Date.now() + task.duration * 1e3).toISOString();
    const updatedTask = taskQueueDb.updateTask(task.id, {
      status: "running",
      startTime: now,
      endTime,
      currentProgress: 0
    });
    console.log(`\u5F00\u59CB\u6267\u884C\u4EFB\u52A1: ${task.taskName} (\u7528\u6237: ${task.userId})`);
    return updatedTask || task;
  }
  // 设置任务进度更新定时器
  setupTaskProgressTimer(task, socketEmit) {
    const userId = task.userId;
    const existingInterval = this.intervals.get(userId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    const interval = setInterval(() => {
      this.updateTaskProgress(task, socketEmit);
    }, 1e3);
    this.intervals.set(userId, interval);
  }
  // 更新任务进度
  updateTaskProgress(task, socketEmit) {
    try {
      const currentTask = taskQueueDb.findById(task.id);
      if (!currentTask || currentTask.status !== "running") {
        this.stopProcessing(task.userId);
        return;
      }
      const now = Date.now();
      const startTime = new Date(currentTask.startTime).getTime();
      const endTime = new Date(currentTask.endTime).getTime();
      if (now >= endTime) {
        this.completeTask(currentTask, socketEmit);
      } else {
        const elapsed = now - startTime;
        const total = endTime - startTime;
        const progress = Math.min(elapsed / total * 100, 100);
        taskQueueDb.updateTask(currentTask.id, {
          currentProgress: Math.round(progress)
        });
        if (socketEmit) {
          socketEmit("queue_progress", {
            taskId: currentTask.id,
            progress: Math.round(progress),
            remainingTime: endTime - now
          });
        }
      }
    } catch (error) {
      console.error("\u66F4\u65B0\u4EFB\u52A1\u8FDB\u5EA6\u65F6\u51FA\u9519:", error);
    }
  }
  // 完成任务
  completeTask(task, socketEmit) {
    try {
      console.log(`\u4EFB\u52A1\u5B8C\u6210: ${task.taskName} (\u7528\u6237: ${task.userId})`);
      const rewards = this.generateRewards(task);
      this.updateUserProgress(task, rewards);
      const newRemainingCount = task.remainingCount - 1;
      if (newRemainingCount > 0) {
        taskQueueDb.updateTask(task.id, {
          status: "pending",
          remainingCount: newRemainingCount,
          currentProgress: 0,
          startTime: void 0,
          endTime: void 0
        });
      } else {
        taskQueueDb.updateTask(task.id, {
          status: "completed",
          remainingCount: 0,
          currentProgress: 100
        });
      }
      if (socketEmit) {
        socketEmit("task_completed", {
          taskId: task.id,
          rewards,
          remainingCount: newRemainingCount,
          isFullyCompleted: newRemainingCount === 0
        });
      }
      const interval = this.intervals.get(task.userId);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(task.userId);
      }
      setTimeout(() => {
        this.processUserQueue(task.userId, socketEmit);
      }, 1e3);
    } catch (error) {
      console.error("\u5B8C\u6210\u4EFB\u52A1\u65F6\u51FA\u9519:", error);
    }
  }
  // 生成奖励
  generateRewards(task) {
    const rewardConfigs = JSON.parse(task.rewards);
    const rewards = [];
    for (const config of rewardConfigs) {
      if (Math.random() * 100 < config.chance) {
        const quantity = Array.isArray(config.quantity) ? Math.floor(Math.random() * (config.quantity[1] - config.quantity[0] + 1)) + config.quantity[0] : config.quantity;
        rewards.push({
          id: config.item,
          name: config.item,
          quantity,
          rarity: this.getItemRarity(config.item)
        });
      }
    }
    return rewards;
  }
  // 获取物品稀有度
  getItemRarity(itemName) {
    const rarityMap = {
      "\u84DD\u8393": "common",
      "\u8349\u8393": "common",
      "\u8461\u8404": "uncommon",
      "\u7AF9\u5B50": "legendary",
      "\u666E\u901A\u8349\u836F": "common",
      "\u4E09\u53F6\u8349": "uncommon",
      "\u5AE9\u82BD": "rare",
      "\u666E\u901A\u77F3\u5934": "common",
      "\u94DC\u77FF": "uncommon",
      "\u94F6\u77FF": "rare"
    };
    return rarityMap[itemName] || "common";
  }
  // 更新用户进度
  updateUserProgress(task, rewards) {
    const userId = task.userId;
    const user = userDb.findById(userId);
    const gameData = gameDataDb.findByUserId(userId);
    if (!user || !gameData) {
      console.error("\u7528\u6237\u6216\u6E38\u620F\u6570\u636E\u4E0D\u5B58\u5728");
      return;
    }
    const inventory = JSON.parse(gameData.inventory || "[]");
    for (const reward of rewards) {
      const existingItem = inventory.find((item) => item.name === reward.name);
      if (existingItem) {
        existingItem.quantity += reward.quantity;
      } else {
        inventory.push({
          id: reward.id,
          name: reward.name,
          icon: this.getItemIcon(reward.name),
          quantity: reward.quantity,
          rarity: reward.rarity
        });
      }
    }
    const newExp = user.experience + task.experience;
    const newLevel = Math.floor(newExp / 100) + 1;
    let skillUpdates = {};
    if (task.skillType === "farming") {
      const newSkillExp = gameData.farmingExp + task.experience;
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1;
      skillUpdates = {
        farmingExp: newSkillExp,
        farmingLevel: newSkillLevel
      };
    } else if (task.skillType === "mining") {
      const newSkillExp = gameData.miningExp + task.experience;
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1;
      skillUpdates = {
        miningExp: newSkillExp,
        miningLevel: newSkillLevel
      };
    } else if (task.skillType === "agriculture" || task.skillType === "\u519C\u4E1A") {
      const newSkillExp = gameData.agricultureExp + task.experience;
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1;
      skillUpdates = {
        agricultureExp: newSkillExp,
        agricultureLevel: newSkillLevel
      };
    } else if (task.skillType === "fishing" || task.skillType === "\u9493\u9C7C") {
      const newSkillExp = gameData.fishingExp + task.experience;
      const newSkillLevel = Math.floor(newSkillExp / 100) + 1;
      skillUpdates = {
        fishingExp: newSkillExp,
        fishingLevel: newSkillLevel
      };
    }
    userDb.update(userId, {
      experience: newExp,
      level: newLevel
    });
    gameDataDb.update(userId, {
      inventory: JSON.stringify(inventory),
      ...skillUpdates
    });
  }
  // 获取物品图标
  getItemIcon(itemName) {
    const iconMap = {
      "\u84DD\u8393": "\u{1F34E}",
      "\u8349\u8393": "\u{1F353}",
      "\u8461\u8404": "\u{1F347}",
      "\u7AF9\u5B50": "\u{1F38B}",
      "\u666E\u901A\u8349\u836F": "\u{1F33F}",
      "\u4E09\u53F6\u8349": "\u{1F340}",
      "\u5AE9\u82BD": "\u{1F331}",
      "\u666E\u901A\u77F3\u5934": "\u{1FAA8}",
      "\u94DC\u77FF": "\u{1F7EB}",
      "\u94F6\u77FF": "\u26AA"
    };
    return iconMap[itemName] || "\u2753";
  }
  // 获取所有正在处理的用户
  getProcessingUsers() {
    return Array.from(this.processingUsers);
  }
  // 停止所有处理
  stopAll() {
    for (const [userId, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.processingUsers.clear();
  }
}
const queueProcessor = new QueueProcessor();
process.on("SIGTERM", () => {
  queueProcessor.stopAll();
});
process.on("SIGINT", () => {
  queueProcessor.stopAll();
});

const users$2 = [];
const _JtgVaeFDyIXwDDeQPyyq8WfxzzGw6jKLi98725St9tk = defineNitroPlugin((nitroApp) => {
  const io = new Server(nitroApp.hooks.hookOnce("render:route", () => {
  }).server, {
    cors: {
      origin: "http://localhost:3000" ,
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  });
  const userConnections = /* @__PURE__ */ new Map();
  io.on("connection", (socket) => {
    console.log("\u7528\u6237\u8FDE\u63A5:", socket.id);
    socket.on("authenticate", async (data) => {
      try {
        const { token } = data;
        const config = useRuntimeConfig();
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = users$2.find((u) => u.id === decoded.userId);
        if (!user) {
          socket.emit("auth_error", { message: "\u7528\u6237\u4E0D\u5B58\u5728" });
          return;
        }
        socket.userId = user.id;
        userConnections.set(user.id, socket);
        user.isOnline = true;
        user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
        socket.emit("authenticated", {
          success: true,
          user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email
          }
        });
        sendGameStateWithQueue(socket, user);
        queueProcessor.startProcessing(user.id, (event, data2) => {
          socket.emit(event, data2);
        });
        console.log(`\u7528\u6237 ${user.name} \u5DF2\u8BA4\u8BC1`);
      } catch (error) {
        socket.emit("auth_error", { message: "\u8BA4\u8BC1\u5931\u8D25" });
      }
    });
    socket.on("get_game_state", () => {
      if (!socket.userId) {
        socket.emit("error", { message: "\u672A\u8BA4\u8BC1" });
        return;
      }
      const user = users$2.find((u) => u.id === socket.userId);
      if (user) {
        sendGameState(socket, user);
      }
    });
    socket.on("start_collect_task", async (data) => {
      if (!socket.userId) {
        socket.emit("error", { message: "\u672A\u8BA4\u8BC1" });
        return;
      }
      const user = users$2.find((u) => u.id === socket.userId);
      if (!user) {
        socket.emit("error", { message: "\u7528\u6237\u4E0D\u5B58\u5728" });
        return;
      }
      try {
        const { taskType, duration } = data;
        const now = Date.now();
        const durationMs = duration * 60 * 1e3;
        const task = {
          id: `task_${now}`,
          type: taskType,
          duration,
          startTime: now,
          endTime: now + durationMs,
          progress: 0,
          rewards: getTaskRewards(taskType),
          experience: Math.floor(duration / 5) + 5
        };
        user.gameData.currentTask = task;
        socket.emit("task_started", {
          success: true,
          task
        });
        startTaskProgress(user, socket);
      } catch (error) {
        socket.emit("task_error", { message: "\u5F00\u59CB\u4EFB\u52A1\u5931\u8D25" });
      }
    });
    socket.on("stop_collect_task", () => {
      if (!socket.userId) {
        socket.emit("error", { message: "\u672A\u8BA4\u8BC1" });
        return;
      }
      const user = users$2.find((u) => u.id === socket.userId);
      if (!user || !user.gameData.currentTask) {
        socket.emit("task_error", { message: "\u5F53\u524D\u6CA1\u6709\u8FDB\u884C\u4E2D\u7684\u4EFB\u52A1" });
        return;
      }
      const rewards = completeTask(user);
      socket.emit("task_completed", {
        success: true,
        rewards,
        experience: user.gameData.experience,
        level: user.gameData.level
      });
      sendGameState(socket, user);
    });
    socket.on("disconnect", () => {
      console.log("\u7528\u6237\u65AD\u5F00\u8FDE\u63A5:", socket.id);
      if (socket.data.userId) {
        console.log(`\u7528\u6237 ${socket.data.userId} \u65AD\u5F00\u8FDE\u63A5\uFF0C\u961F\u5217\u7EE7\u7EED\u5728\u540E\u53F0\u6267\u884C`);
      }
    });
    socket.on("get_queue_status", () => {
      if (socket.userId) {
        sendQueueStatus(socket, socket.userId);
      }
    });
    socket.on("add_task_to_queue", async (data) => {
      if (!socket.userId) {
        socket.emit("task_add_error", { message: "\u672A\u8BA4\u8BC1" });
        return;
      }
      try {
        const { taskType, count = 1 } = data;
        const user = users$2.find((u) => u.id === socket.userId);
        if (!user) {
          socket.emit("task_add_error", { message: "\u7528\u6237\u4E0D\u5B58\u5728" });
          return;
        }
        const currentQueueLength = taskQueueDb.getQueueLength(socket.userId);
        if (currentQueueLength >= 20) {
          socket.emit("task_add_error", { message: "\u961F\u5217\u5DF2\u6EE1\uFF0C\u6700\u591A\u53EA\u80FD\u670920\u4E2A\u4EFB\u52A1" });
          return;
        }
        const taskData = {
          userId: socket.userId,
          taskType,
          taskName: getTaskName(taskType),
          duration: getTaskDuration(taskType),
          totalCount: count,
          remainingCount: count,
          rewards: JSON.stringify(getTaskRewards(taskType)),
          experience: getTaskExperience(taskType),
          skillType: getTaskSkillType(taskType)
        };
        const taskId = taskQueueDb.addTaskForSocket(taskData);
        socket.emit("task_added", {
          success: true,
          taskId,
          message: "\u4EFB\u52A1\u5DF2\u6DFB\u52A0\u5230\u961F\u5217"
        });
        sendQueueStatus(socket, socket.userId);
      } catch (error) {
        console.error("\u6DFB\u52A0\u4EFB\u52A1\u5230\u961F\u5217\u5931\u8D25:", error);
        socket.emit("task_add_error", { message: "\u6DFB\u52A0\u4EFB\u52A1\u5931\u8D25" });
      }
    });
    socket.on("remove_task_from_queue", async (data) => {
      if (!socket.userId) {
        socket.emit("task_remove_error", { message: "\u672A\u8BA4\u8BC1" });
        return;
      }
      try {
        const { taskId } = data;
        const task = taskQueueDb.getTaskById(taskId);
        if (!task || task.userId !== socket.userId) {
          socket.emit("task_remove_error", { message: "\u4EFB\u52A1\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u9650" });
          return;
        }
        if (task.status === "running") {
          socket.emit("task_remove_error", { message: "\u6B63\u5728\u6267\u884C\u7684\u4EFB\u52A1\u65E0\u6CD5\u79FB\u9664" });
          return;
        }
        taskQueueDb.removeTask(taskId);
        socket.emit("task_removed", {
          success: true,
          message: "\u4EFB\u52A1\u5DF2\u4ECE\u961F\u5217\u4E2D\u79FB\u9664"
        });
        sendQueueStatus(socket, socket.userId);
      } catch (error) {
        console.error("\u79FB\u9664\u4EFB\u52A1\u5931\u8D25:", error);
        socket.emit("task_remove_error", { message: "\u79FB\u9664\u4EFB\u52A1\u5931\u8D25" });
      }
    });
    socket.on("start_queue_processing", () => {
      if (socket.userId) {
        queueProcessor.startProcessing(socket.userId, (event, data) => {
          socket.emit(event, data);
        });
      }
    });
    socket.on("stop_queue_processing", () => {
      if (socket.userId) {
        queueProcessor.stopProcessing(socket.userId);
      }
    });
  });
  function sendGameState(socket, user) {
    if (user.gameData.currentTask) {
      const task = user.gameData.currentTask;
      const now = Date.now();
      if (task.endTime && now >= task.endTime) {
        const rewards = completeTask(user);
        socket.emit("task_completed", {
          success: true,
          rewards,
          experience: user.gameData.experience,
          level: user.gameData.level,
          skills: {
            farming: {
              level: user.gameData.farmingLevel,
              experience: user.gameData.farmingExp,
              nextLevelExp: user.gameData.farmingLevel * 100
            },
            mining: {
              level: user.gameData.miningLevel,
              experience: user.gameData.miningExp,
              nextLevelExp: user.gameData.miningLevel * 100
            },
            agriculture: {
              level: user.gameData.agricultureLevel,
              experience: user.gameData.agricultureExp,
              nextLevelExp: user.gameData.agricultureLevel * 100
            },
            fishing: {
              level: user.gameData.fishingLevel,
              experience: user.gameData.fishingExp,
              nextLevelExp: user.gameData.fishingLevel * 100
            }
          }
        });
      } else if (task.startTime && task.endTime) {
        const elapsed = now - task.startTime;
        const total = task.endTime - task.startTime;
        task.progress = Math.min(elapsed / total * 100, 100);
      }
    }
    const farmingProgress = Math.min(Math.floor(user.gameData.farmingExp / (user.gameData.farmingLevel * 100) * 100), 100);
    const miningProgress = Math.min(Math.floor(user.gameData.miningExp / (user.gameData.miningLevel * 100) * 100), 100);
    const agricultureProgress = Math.min(Math.floor(user.gameData.agricultureExp / (user.gameData.agricultureLevel * 100) * 100), 100);
    const fishingProgress = Math.min(Math.floor(user.gameData.fishingExp / (user.gameData.fishingLevel * 100) * 100), 100);
    socket.emit("game_state", {
      currentTask: user.gameData.currentTask,
      inventory: user.gameData.inventory,
      experience: user.gameData.experience,
      level: user.gameData.level,
      skills: {
        farming: {
          level: user.gameData.farmingLevel,
          experience: user.gameData.farmingExp,
          nextLevelExp: user.gameData.farmingLevel * 100,
          progress: farmingProgress
        },
        mining: {
          level: user.gameData.miningLevel,
          experience: user.gameData.miningExp,
          nextLevelExp: user.gameData.miningLevel * 100,
          progress: miningProgress
        },
        agriculture: {
          level: user.gameData.agricultureLevel,
          experience: user.gameData.agricultureExp,
          nextLevelExp: user.gameData.agricultureLevel * 100,
          progress: agricultureProgress
        },
        fishing: {
          level: user.gameData.fishingLevel,
          experience: user.gameData.fishingExp,
          nextLevelExp: user.gameData.fishingLevel * 100,
          progress: fishingProgress
        }
      }
    });
  }
  function sendGameStateWithQueue(socket, user) {
    sendGameState(socket, user);
    sendQueueStatus(socket, user.id);
  }
  function sendQueueStatus(socket, userId) {
    try {
      const queue = taskQueueDb.getUserQueue(userId);
      const currentTask = taskQueueDb.getCurrentRunningTask(userId);
      const queueLength = taskQueueDb.getQueueLength(userId);
      const processedQueue = queue.map((task) => ({
        ...task,
        rewards: JSON.parse(task.rewards || "[]"),
        estimatedEndTime: task.status === "running" && task.startTime ? new Date(task.startTime).getTime() + task.duration * 1e3 : null,
        remainingTime: task.status === "running" && task.startTime ? Math.max(0, new Date(task.startTime).getTime() + task.duration * 1e3 - Date.now()) : null
      }));
      const totalEstimatedTime = queue.reduce((total, task) => {
        if (task.status === "pending") {
          return total + task.duration * task.remainingCount;
        } else if (task.status === "running") {
          const remainingTime = task.startTime ? Math.max(0, new Date(task.startTime).getTime() + task.duration * 1e3 - Date.now()) : task.duration * 1e3;
          return total + remainingTime / 1e3 + task.duration * (task.remainingCount - 1);
        }
        return total;
      }, 0);
      socket.emit("queue_status", {
        queue: processedQueue,
        currentTask: currentTask ? {
          ...currentTask,
          rewards: JSON.parse(currentTask.rewards || "[]"),
          estimatedEndTime: currentTask.startTime ? new Date(currentTask.startTime).getTime() + currentTask.duration * 1e3 : null,
          remainingTime: currentTask.startTime ? Math.max(0, new Date(currentTask.startTime).getTime() + currentTask.duration * 1e3 - Date.now()) : null
        } : null,
        queueLength,
        totalEstimatedTime: Math.ceil(totalEstimatedTime)
      });
    } catch (error) {
      console.error("\u53D1\u9001\u961F\u5217\u72B6\u6001\u9519\u8BEF:", error);
    }
  }
  function startTaskProgress(user, socket) {
    const updateInterval = setInterval(() => {
      if (!user.gameData.currentTask) {
        clearInterval(updateInterval);
        return;
      }
      const task = user.gameData.currentTask;
      const now = Date.now();
      if (now >= task.endTime) {
        const rewards = completeTask(user);
        socket.emit("task_completed", {
          success: true,
          rewards,
          experience: user.gameData.experience,
          level: user.gameData.level,
          skills: {
            farming: {
              level: user.gameData.farmingLevel,
              experience: user.gameData.farmingExp,
              nextLevelExp: user.gameData.farmingLevel * 100
            },
            mining: {
              level: user.gameData.miningLevel,
              experience: user.gameData.miningExp,
              nextLevelExp: user.gameData.miningLevel * 100
            },
            agriculture: {
              level: user.gameData.agricultureLevel,
              experience: user.gameData.agricultureExp,
              nextLevelExp: user.gameData.agricultureLevel * 100
            },
            fishing: {
              level: user.gameData.fishingLevel,
              experience: user.gameData.fishingExp,
              nextLevelExp: user.gameData.fishingLevel * 100
            }
          }
        });
        clearInterval(updateInterval);
      } else {
        const elapsed = now - task.startTime;
        const total = task.endTime - task.startTime;
        task.progress = Math.min(elapsed / total * 100, 100);
        socket.emit("task_progress", {
          progress: task.progress,
          remainingTime: task.endTime - now
        });
      }
    }, 1e3);
  }
  function completeTask(user) {
    const task = user.gameData.currentTask;
    const rewards = generateTaskRewards(task);
    user.gameData.inventory.push(...rewards);
    user.gameData.experience += task.experience || 10;
    const newLevel = Math.floor(user.gameData.experience / 100) + 1;
    if (newLevel > user.gameData.level) {
      user.gameData.level = newLevel;
    }
    const taskType = task.type || "";
    const skillExperience = (task.experience || 10) * 1.5;
    if (taskType.includes("berry") || taskType.includes("herb")) {
      user.gameData.farmingExp += skillExperience;
      const newFarmingLevel = Math.floor(user.gameData.farmingExp / 100) + 1;
      if (newFarmingLevel > user.gameData.farmingLevel) {
        user.gameData.farmingLevel = newFarmingLevel;
      }
    } else if (taskType.includes("mineral")) {
      user.gameData.miningExp += skillExperience;
      const newMiningLevel = Math.floor(user.gameData.miningExp / 100) + 1;
      if (newMiningLevel > user.gameData.miningLevel) {
        user.gameData.miningLevel = newMiningLevel;
      }
    } else if (taskType.includes("farm") || taskType.includes("agriculture")) {
      user.gameData.agricultureExp += skillExperience;
      const newAgricultureLevel = Math.floor(user.gameData.agricultureExp / 100) + 1;
      if (newAgricultureLevel > user.gameData.agricultureLevel) {
        user.gameData.agricultureLevel = newAgricultureLevel;
      }
    } else if (taskType.includes("fishing") || taskType.includes("fish")) {
      user.gameData.fishingExp += skillExperience;
      const newFishingLevel = Math.floor(user.gameData.fishingExp / 100) + 1;
      if (newFishingLevel > user.gameData.fishingLevel) {
        user.gameData.fishingLevel = newFishingLevel;
      }
    }
    user.gameData.currentTask = null;
    return rewards;
  }
  function getTaskRewards(taskType) {
    const rewardConfigs = {
      "berry": [
        { item: "\u84DD\u8393", quantity: 1, chance: 80 },
        { item: "\u8349\u8393", quantity: 1, chance: 60 },
        { item: "\u8461\u8404", quantity: 1, chance: 40 },
        { item: "\u7AF9\u5B50", quantity: 1, chance: 1 }
      ],
      "herb": [
        { item: "\u666E\u901A\u8349\u836F", quantity: 1, chance: 70 },
        { item: "\u4E09\u53F6\u8349", quantity: 1, chance: 50 },
        { item: "\u5AE9\u82BD", quantity: 1, chance: 30 }
      ],
      "mineral": [
        { item: "\u666E\u901A\u77F3\u5934", quantity: 1, chance: 90 },
        { item: "\u94DC\u77FF", quantity: 1, chance: 40 },
        { item: "\u94F6\u77FF", quantity: 1, chance: 10 }
      ]
    };
    return rewardConfigs[taskType] || [];
  }
  function generateTaskRewards(task) {
    const rewards = [];
    for (const reward of task.rewards || []) {
      if (Math.random() * 100 < reward.chance) {
        rewards.push({
          id: `${reward.item}_${Date.now()}_${Math.random()}`,
          name: reward.item,
          icon: getItemIcon(reward.item),
          quantity: reward.quantity,
          rarity: getItemRarity(reward.item)
        });
      }
    }
    return rewards;
  }
  function getItemIcon(itemName) {
    const icons = {
      "\u84DD\u8393": "\u{1F34E}",
      "\u8349\u8393": "\u{1F353}",
      "\u8461\u8404": "\u{1F347}",
      "\u7AF9\u5B50": "\u{1F95D}",
      "\u666E\u901A\u8349\u836F": "\u{1F33F}",
      "\u4E09\u53F6\u8349": "\u{1F340}",
      "\u5AE9\u82BD": "\u{1F331}",
      "\u666E\u901A\u77F3\u5934": "\u{1FAA8}",
      "\u94DC\u77FF": "\u{1F949}",
      "\u94F6\u77FF": "\u{1F948}"
    };
    return icons[itemName] || "\u{1F4E6}";
  }
  function getItemRarity(itemName) {
    const rarities = {
      "\u84DD\u8393": "common",
      "\u8349\u8393": "common",
      "\u8461\u8404": "common",
      "\u7AF9\u5B50": "legendary",
      "\u666E\u901A\u8349\u836F": "common",
      "\u4E09\u53F6\u8349": "common",
      "\u5AE9\u82BD": "common",
      "\u666E\u901A\u77F3\u5934": "common",
      "\u94DC\u77FF": "common",
      "\u94F6\u77FF": "uncommon"
    };
    return rarities[itemName] || "common";
  }
  function getTaskName(taskType) {
    const taskNames = {
      "forest_collect": "\u68EE\u6797\u91C7\u96C6",
      "mine_collect": "\u77FF\u6D1E\u91C7\u96C6",
      "farm_collect": "\u519C\u573A\u91C7\u96C6",
      "fishing": "\u9493\u9C7C"
    };
    return taskNames[taskType] || "\u672A\u77E5\u4EFB\u52A1";
  }
  function getTaskDuration(taskType) {
    const durations = {
      "forest_collect": 300,
      // 5分钟
      "mine_collect": 600,
      // 10分钟
      "farm_collect": 450,
      // 7.5分钟
      "fishing": 360
      // 6分钟
    };
    return durations[taskType] || 300;
  }
  function getTaskExperience(taskType) {
    const experiences = {
      "forest_collect": 15,
      "mine_collect": 25,
      "farm_collect": 20,
      "fishing": 18
    };
    return experiences[taskType] || 10;
  }
  function getTaskSkillType(taskType) {
    const skillTypes = {
      "forest_collect": "farming",
      "mine_collect": "mining",
      "farm_collect": "agriculture",
      "fishing": "fishing"
    };
    return skillTypes[taskType] || "farming";
  }
  function getTaskRewards(taskType) {
    const rewardConfigs = {
      "forest_collect": [
        { item: "\u84DD\u8393", quantity: 2, chance: 80 },
        { item: "\u8349\u8393", quantity: 1, chance: 60 },
        { item: "\u8461\u8404", quantity: 1, chance: 40 },
        { item: "\u7AF9\u5B50", quantity: 1, chance: 5 }
      ],
      "mine_collect": [
        { item: "\u666E\u901A\u77F3\u5934", quantity: 3, chance: 90 },
        { item: "\u94DC\u77FF", quantity: 2, chance: 40 },
        { item: "\u94F6\u77FF", quantity: 1, chance: 15 },
        { item: "\u91D1\u77FF", quantity: 1, chance: 3 }
      ],
      "farm_collect": [
        { item: "\u5C0F\u9EA6", quantity: 4, chance: 85 },
        { item: "\u7389\u7C73", quantity: 3, chance: 70 },
        { item: "\u571F\u8C46", quantity: 2, chance: 55 },
        { item: "\u80E1\u841D\u535C", quantity: 2, chance: 45 }
      ],
      "fishing": [
        { item: "\u5C0F\u9C7C", quantity: 2, chance: 80 },
        { item: "\u4E2D\u9C7C", quantity: 1, chance: 50 },
        { item: "\u5927\u9C7C", quantity: 1, chance: 20 },
        { item: "\u7A00\u6709\u9C7C", quantity: 1, chance: 5 }
      ]
    };
    return rewardConfigs[taskType] || [];
  }
  console.log("Socket.IO \u670D\u52A1\u5668\u5DF2\u542F\u52A8");
});

const plugins = [
  _JX81cdtwm_Dg_v9YXAo9_oNNXTVbPnR7GtoBPWjBBY,
_vxFX_YTfZDdVF7mwype5xEfzz_WP0CyMd8m3UWtUHA,
_6U5i_QKgsmxBOyiF0DYz4IiHj50tYYKr9tLaQZ9_uZw,
_JtgVaeFDyIXwDDeQPyyq8WfxzzGw6jKLi98725St9tk
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _imD3qR = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
  disableCapoSorting: false,
  plugins: [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin],
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('file://D:/demo/maomao2/.nuxt/dist/server/server.mjs').then((r) => r.default || r);
const getClientManifest = () => import('file://D:/demo/maomao2/.nuxt/dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (error) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", error);
    throw error;
  });
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  {
    const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      ssrContext.head.push({ link }, { mode: "server" });
    }
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  islandHead.link ||= [];
  islandHead.style ||= [];
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr$1(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _lazy_cBsES1 = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_T4TgqX = () => Promise.resolve().then(function () { return logout_post$1; });
const _lazy_2bieau = () => Promise.resolve().then(function () { return me_get$1; });
const _lazy_kG3cum = () => Promise.resolve().then(function () { return register_post$1; });
const _lazy_Ap0NZd = () => Promise.resolve().then(function () { return start_post$1; });
const _lazy_1hgxm8 = () => Promise.resolve().then(function () { return stop_post$1; });
const _lazy_eHT_c0 = () => Promise.resolve().then(function () { return state_get$1; });
const _lazy_Tdz6M7 = () => Promise.resolve().then(function () { return data_get$1; });
const _lazy_SVnMjx = () => Promise.resolve().then(function () { return online_get$1; });
const _lazy_18kyH1 = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: _imD3qR, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/login', handler: _lazy_cBsES1, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_T4TgqX, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_2bieau, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/register', handler: _lazy_kG3cum, lazy: true, middleware: false, method: "post" },
  { route: '/api/game/collect/start', handler: _lazy_Ap0NZd, lazy: true, middleware: false, method: "post" },
  { route: '/api/game/collect/stop', handler: _lazy_1hgxm8, lazy: true, middleware: false, method: "post" },
  { route: '/api/game/state', handler: _lazy_eHT_c0, lazy: true, middleware: false, method: "get" },
  { route: '/api/game/user/data', handler: _lazy_Tdz6M7, lazy: true, middleware: false, method: "get" },
  { route: '/api/game/user/online', handler: _lazy_SVnMjx, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_18kyH1, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_18kyH1, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server$1(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "version": "", "statusCode": 500, "statusMessage": "Server error", "description": "An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.", "stack": "" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + escapeHtml(messages.statusCode) + " - " + escapeHtml(messages.statusMessage || "Internal Server Error") + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-40vh;filter:blur(30vh);height:60vh;opacity:.8}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}h1,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.pointer-events-none{pointer-events:none}.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (min-width:640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script></head><body class="antialiased bg-white dark:bg-black dark:text-white flex flex-col font-sans min-h-screen pt-14 px-10 text-black"><div class="fixed left-0 pointer-events-none right-0 spotlight"></div><h1 class="font-medium mb-6 sm:text-8xl text-6xl">` + escapeHtml(messages.statusCode) + '</h1><p class="font-light leading-tight mb-8 sm:text-2xl text-xl">' + escapeHtml(messages.description) + '</p><div class="bg-black/5 bg-white dark:bg-white/10 flex-1 h-auto overflow-y-auto rounded-t-md"><div class="font-light leading-tight p-8 text-xl z-10">' + escapeHtml(messages.stack) + "</div></div></body></html>";
};

const errorDev = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$1
}, Symbol.toStringTag, { value: 'Module' }));

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

const JWT_SECRET$1 = process.env.JWT_SECRET || "your-secret-key";
const login_post = defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed"
      });
    }
    const body = await readBody(event);
    const { username, password } = body;
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username and password are required"
      });
    }
    const user = userDb.findByUsername(username);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password"
      });
    }
    const isValidPassword = await userDb.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password"
      });
    }
    userDb.updateLastLogin(user.id);
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      JWT_SECRET$1,
      { expiresIn: "24h" }
    );
    return {
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    };
  } catch (error) {
    console.error("\u767B\u5F55\u9519\u8BEF:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    });
  }
});

const login_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: login_post
}, Symbol.toStringTag, { value: 'Module' }));

const users$1 = [];
const logout_post = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const authHeader = getHeader(event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u672A\u63D0\u4F9B\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = users$1.find((u) => u.id === decoded.userId);
    if (user) {
      user.isOnline = false;
      user.lastLogoutAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    return {
      success: true,
      message: "\u767B\u51FA\u6210\u529F"
    };
  } catch (error) {
    return {
      success: true,
      message: "\u767B\u51FA\u6210\u529F"
    };
  }
});

const logout_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: logout_post
}, Symbol.toStringTag, { value: 'Module' }));

const me_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const authHeader = getHeader(event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u672A\u63D0\u4F9B\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = userDb.findById(decoded.userId);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u7528\u6237\u4E0D\u5B58\u5728"
      });
    }
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw createError({
        statusCode: 401,
        statusMessage: "\u65E0\u6548\u7684\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "\u83B7\u53D6\u7528\u6237\u4FE1\u606F\u5931\u8D25"
    });
  }
});

const me_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: me_get
}, Symbol.toStringTag, { value: 'Module' }));

const register_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, email, password } = body;
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A"
      });
    }
    if (username.length < 3 || username.length > 20) {
      throw createError({
        statusCode: 400,
        statusMessage: "\u7528\u6237\u540D\u957F\u5EA6\u5FC5\u987B\u57283-20\u4E2A\u5B57\u7B26\u4E4B\u95F4"
      });
    }
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "\u5BC6\u7801\u957F\u5EA6\u81F3\u5C116\u4F4D"
      });
    }
    const existingUser = userDb.findByUsername(username);
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "\u7528\u6237\u540D\u5DF2\u5B58\u5728"
      });
    }
    const newUser = await userDb.create({
      username,
      password,
      email: email || void 0,
      level: 1,
      experience: 0,
      coins: 0,
      gems: 0
    });
    const { password: _, ...userInfo } = newUser;
    return {
      success: true,
      message: "\u6CE8\u518C\u6210\u529F",
      user: userInfo
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      throw createError({
        statusCode: 409,
        statusMessage: "\u7528\u6237\u540D\u5DF2\u5B58\u5728"
      });
    }
    console.error("\u6CE8\u518C\u9519\u8BEF:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF"
    });
  }
});

const register_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: register_post
}, Symbol.toStringTag, { value: 'Module' }));

const prisma$1 = new PrismaClient();
const startCollectSchema = z.object({
  taskType: z.string(),
  duration: z.number().min(1).max(3600)
  // 1秒到1小时
});
const start_post = defineEventHandler(async (event) => {
  var _a;
  try {
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed"
      });
    }
    const token = getCookie(event, "auth-token") || ((_a = getHeader(event, "authorization")) == null ? void 0 : _a.replace("Bearer ", ""));
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized"
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid token"
      });
    }
    const body = await readBody(event);
    const validatedData = startCollectSchema.parse(body);
    const user = await prisma$1.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    const existingTask = await prisma$1.collectTask.findFirst({
      where: {
        userId: user.id,
        status: "active"
      }
    });
    if (existingTask) {
      throw createError({
        statusCode: 400,
        statusMessage: "User already has an active task"
      });
    }
    const task = await prisma$1.collectTask.create({
      data: {
        userId: user.id,
        taskType: validatedData.taskType,
        duration: validatedData.duration,
        startTime: /* @__PURE__ */ new Date(),
        endTime: new Date(Date.now() + validatedData.duration * 1e3),
        status: "active"
      }
    });
    return {
      success: true,
      task: {
        id: task.id,
        taskType: task.taskType,
        duration: task.duration,
        startTime: task.startTime,
        endTime: task.endTime,
        status: task.status
      }
    };
  } catch (error) {
    console.error("Start collect task error:", error);
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request data",
        data: error.errors
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error"
    });
  }
});

const start_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: start_post
}, Symbol.toStringTag, { value: 'Module' }));

const prisma = new PrismaClient();
const stopCollectSchema = z.object({
  taskId: z.string().optional()
});
const taskRewards = {
  forest_collect: {
    experience: 2,
    skill: "collecting",
    rewards: [
      { name: "\u6728\u6750", icon: "\u{1FAB5}", min: 1, max: 3, chance: 90 },
      { name: "\u6D46\u679C", icon: "\u{1FAD0}", min: 1, max: 2, chance: 60 },
      { name: "\u8349\u836F", icon: "\u{1F33F}", min: 1, max: 1, chance: 30 },
      { name: "\u7A00\u6709\u79CD\u5B50", icon: "\u{1F331}", min: 1, max: 1, chance: 5 }
    ]
  },
  mine_collect: {
    experience: 4,
    skill: "mining",
    rewards: [
      { name: "\u77F3\u5934", icon: "\u{1FAA8}", min: 1, max: 2, chance: 95 },
      { name: "\u94C1\u77FF", icon: "\u2699\uFE0F", min: 1, max: 1, chance: 50 },
      { name: "\u91D1\u77FF", icon: "\u{1F947}", min: 1, max: 1, chance: 20 },
      { name: "\u5B9D\u77F3", icon: "\u{1F48E}", min: 1, max: 1, chance: 3 }
    ]
  },
  farm_collect: {
    experience: 1,
    skill: "farming",
    rewards: [
      { name: "\u5C0F\u9EA6", icon: "\u{1F33E}", min: 2, max: 4, chance: 85 },
      { name: "\u80E1\u841D\u535C", icon: "\u{1F955}", min: 1, max: 3, chance: 70 },
      { name: "\u571F\u8C46", icon: "\u{1F954}", min: 1, max: 2, chance: 60 },
      { name: "\u7279\u6B8A\u4F5C\u7269", icon: "\u{1F33D}", min: 1, max: 1, chance: 15 }
    ]
  },
  fishing: {
    experience: 3,
    skill: "fishing",
    rewards: [
      { name: "\u5C0F\u9C7C", icon: "\u{1F41F}", min: 1, max: 2, chance: 80 },
      { name: "\u5927\u9C7C", icon: "\u{1F420}", min: 1, max: 1, chance: 40 },
      { name: "\u7A00\u6709\u9C7C", icon: "\u{1F421}", min: 1, max: 1, chance: 10 },
      { name: "\u5B9D\u7BB1", icon: "\u{1F4E6}", min: 1, max: 1, chance: 2 }
    ]
  }
};
function calculateRewards(taskType) {
  const config = taskRewards[taskType];
  if (!config) return { items: [], experience: 0, skill: "" };
  const items = [];
  config.rewards.forEach((reward) => {
    const roll = Math.random() * 100;
    if (roll <= reward.chance) {
      const quantity = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;
      items.push({
        name: reward.name,
        icon: reward.icon,
        quantity
      });
    }
  });
  return {
    items,
    experience: config.experience,
    skill: config.skill
  };
}
const stop_post = defineEventHandler(async (event) => {
  var _a;
  try {
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed"
      });
    }
    const token = getCookie(event, "auth-token") || ((_a = getHeader(event, "authorization")) == null ? void 0 : _a.replace("Bearer ", ""));
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized"
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid token"
      });
    }
    const body = await readBody(event);
    const validatedData = stopCollectSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    let task;
    if (validatedData.taskId) {
      task = await prisma.collectTask.findFirst({
        where: {
          id: validatedData.taskId,
          userId: user.id,
          status: "active"
        }
      });
    } else {
      task = await prisma.collectTask.findFirst({
        where: {
          userId: user.id,
          status: "active"
        }
      });
    }
    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: "No active task found"
      });
    }
    const now = /* @__PURE__ */ new Date();
    const elapsed = now.getTime() - task.startTime.getTime();
    const totalDuration = task.duration * 1e3;
    const completionRate = Math.min(elapsed / totalDuration, 1);
    const baseRewards = calculateRewards(task.taskType);
    const adjustedRewards = {
      ...baseRewards,
      experience: Math.floor(baseRewards.experience * completionRate),
      items: baseRewards.items.map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity * completionRate))
      }))
    };
    await prisma.collectTask.update({
      where: { id: task.id },
      data: {
        status: "completed",
        completedAt: now,
        rewards: JSON.stringify(adjustedRewards)
      }
    });
    const currentData = await prisma.gameData.findUnique({
      where: { userId: user.id }
    });
    if (currentData) {
      const currentInventory = JSON.parse(currentData.inventory || "{}");
      const currentSkills = JSON.parse(currentData.skills || "{}");
      adjustedRewards.items.forEach((item) => {
        if (currentInventory[item.name]) {
          currentInventory[item.name].quantity += item.quantity;
        } else {
          currentInventory[item.name] = {
            name: item.name,
            icon: item.icon,
            quantity: item.quantity
          };
        }
      });
      const skillName = adjustedRewards.skill;
      if (skillName && currentSkills[skillName]) {
        currentSkills[skillName].experience += adjustedRewards.experience;
        const newLevel2 = Math.floor(currentSkills[skillName].experience / 100) + 1;
        if (newLevel2 > currentSkills[skillName].level) {
          currentSkills[skillName].level = newLevel2;
        }
      }
      const newTotalExperience = currentData.experience + adjustedRewards.experience;
      const newLevel = Math.floor(newTotalExperience / 1e3) + 1;
      await prisma.gameData.update({
        where: { userId: user.id },
        data: {
          experience: newTotalExperience,
          level: newLevel,
          inventory: JSON.stringify(currentInventory),
          skills: JSON.stringify(currentSkills)
        }
      });
    }
    return {
      success: true,
      task: {
        id: task.id,
        taskType: task.taskType,
        completionRate,
        completedAt: now
      },
      rewards: adjustedRewards
    };
  } catch (error) {
    console.error("Stop collect task error:", error);
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request data",
        data: error.errors
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error"
    });
  }
});

const stop_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: stop_post
}, Symbol.toStringTag, { value: 'Module' }));

const state_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const authHeader = getHeader(event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u672A\u63D0\u4F9B\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = userDb.findById(decoded.userId);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u7528\u6237\u4E0D\u5B58\u5728"
      });
    }
    const gameData = gameDataDb.findByUserId(user.id);
    if (!gameData) {
      throw createError({
        statusCode: 404,
        statusMessage: "\u6E38\u620F\u6570\u636E\u4E0D\u5B58\u5728"
      });
    }
    let currentTask = null;
    if (gameData.isCollecting && gameData.collectingTaskId) {
      const now = Date.now();
      const startTime = gameData.collectingStartTime ? new Date(gameData.collectingStartTime).getTime() : now;
      const elapsed = now - startTime;
      const duration = 36e5;
      const progress = Math.min(elapsed / duration * 100, 100);
      currentTask = {
        id: gameData.collectingTaskId,
        progress,
        isActive: true,
        startTime,
        endTime: startTime + duration
      };
    }
    let inventory = [];
    try {
      inventory = JSON.parse(gameData.inventory || "[]");
    } catch (e) {
      console.error("\u89E3\u6790\u5E93\u5B58\u6570\u636E\u5931\u8D25:", e);
    }
    const farmingProgress = Math.min(Math.floor(gameData.farmingExp / (gameData.farmingLevel * 100) * 100), 100);
    const miningProgress = Math.min(Math.floor(gameData.miningExp / (gameData.miningLevel * 100) * 100), 100);
    return {
      success: true,
      data: {
        currentTask,
        inventory,
        experience: user.experience,
        level: user.level,
        // 添加技能等级信息
        skills: {
          farming: {
            level: gameData.farmingLevel,
            experience: gameData.farmingExp,
            nextLevelExp: gameData.farmingLevel * 100,
            progress: farmingProgress
          },
          mining: {
            level: gameData.miningLevel,
            experience: gameData.miningExp,
            nextLevelExp: gameData.miningLevel * 100,
            progress: miningProgress
          }
        }
      }
    };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw createError({
        statusCode: 401,
        statusMessage: "\u65E0\u6548\u7684\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "\u83B7\u53D6\u6E38\u620F\u72B6\u6001\u5931\u8D25"
    });
  }
});

const state_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: state_get
}, Symbol.toStringTag, { value: 'Module' }));

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const data_get = defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u672A\u63D0\u4F9B\u6709\u6548\u7684\u8BA4\u8BC1token"
      });
    }
    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: "token\u65E0\u6548\u6216\u5DF2\u8FC7\u671F"
      });
    }
    const user = userDb.findById(decoded.userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "\u7528\u6237\u4E0D\u5B58\u5728"
      });
    }
    const gameData = gameDataDb.findByUserId(user.id);
    if (!gameData) {
      throw createError({
        statusCode: 404,
        statusMessage: "\u6E38\u620F\u6570\u636E\u4E0D\u5B58\u5728"
      });
    }
    const inventory = JSON.parse(gameData.inventory || "[]");
    const achievements = JSON.parse(gameData.achievements || "[]");
    const settings = JSON.parse(gameData.settings || "{}");
    const { password: _, ...userInfo } = user;
    const skills = {
      farming: {
        level: gameData.farmingLevel,
        experience: gameData.farmingExp,
        nextLevelExp: gameData.farmingLevel * 100,
        progress: Math.min(Math.floor(gameData.farmingExp / (gameData.farmingLevel * 100) * 100), 100)
      },
      mining: {
        level: gameData.miningLevel,
        experience: gameData.miningExp,
        nextLevelExp: gameData.miningLevel * 100,
        progress: Math.min(Math.floor(gameData.miningExp / (gameData.miningLevel * 100) * 100), 100)
      }
    };
    return {
      success: true,
      user: userInfo,
      gameData: {
        ...gameData,
        inventory,
        achievements,
        settings,
        skills
      }
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("\u83B7\u53D6\u7528\u6237\u6570\u636E\u9519\u8BEF:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF"
    });
  }
});

const data_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: data_get
}, Symbol.toStringTag, { value: 'Module' }));

const users = [];
const online_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const authHeader = getHeader(event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u672A\u63D0\u4F9B\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "\u7528\u6237\u4E0D\u5B58\u5728"
      });
    }
    user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
    return {
      success: true,
      isOnline: user.isOnline,
      lastActiveAt: user.lastActiveAt,
      userId: user.id,
      uuid: user.uuid
    };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw createError({
        statusCode: 401,
        statusMessage: "\u65E0\u6548\u7684\u8BA4\u8BC1\u4EE4\u724C"
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "\u68C0\u67E5\u5728\u7EBF\u72B6\u6001\u5931\u8D25"
    });
  }
});

const online_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: online_get
}, Symbol.toStringTag, { value: 'Module' }));

function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    "type": "application/json",
    "innerHTML": contents,
    "data-nuxt-data": appId,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  {
    payload.id = "__NUXT_DATA__";
  }
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  const config = uneval(opts.ssrContext.config);
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}

const renderSSRHeadOptions = {"omitLineBreaks":false};

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const ssrContext = createSSRContext(event);
  const headEntryOptions = { mode: "server" };
  ssrContext.head.push(appHead, headEntryOptions);
  if (ssrError) {
    ssrError.statusCode &&= Number.parseInt(ssrError.statusCode);
    setSSRError(ssrContext, ssrError);
  }
  const routeOptions = getRouteRules(event);
  if (routeOptions.ssr === false) {
    ssrContext.noSSR = true;
  }
  const renderer = await getRenderer(ssrContext);
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  const inlinedStyles = [];
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  const NO_SCRIPTS = routeOptions.noScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (ssrContext._preloadManifest && !NO_SCRIPTS) {
    ssrContext.head.push({
      link: [
        { rel: "preload", as: "fetch", fetchpriority: "low", crossorigin: "anonymous", href: buildAssetsURL(`builds/meta/${ssrContext.runtimeConfig.app.buildId}.json`) }
      ]
    }, { ...headEntryOptions, tagPriority: "low" });
  }
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const link = [];
  for (const resource of Object.values(styles)) {
    if ("inline" in getQuery(resource.file)) {
      continue;
    }
    link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
  }
  if (link.length) {
    ssrContext.head.push({ link }, headEntryOptions);
  }
  if (!NO_SCRIPTS) {
    ssrContext.head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.noScripts) {
    const tagPosition = "head";
    ssrContext.head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition,
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, renderSSRHeadOptions);
  const htmlContext = {
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  return {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
});
function normalizeChunks(chunks) {
  return chunks.filter(Boolean).map((i) => i.trim());
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  if (chunks.length === 0) {
    return "";
  }
  return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}

const renderer$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: renderer
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
