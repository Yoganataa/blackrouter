import { compressMessages as upstreamCompressMessages } from "./vendor/9router-rtk/index.js";
// service/main.ts
import http5 from "node:http";

// service/runtime.ts
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import http4 from "node:http";
import https3 from "node:https";
import path4 from "node:path";
import { fileURLToPath } from "node:url";

// node_modules/zod/v3/helpers/util.js
var util;
(function(util) {
  util.assertEqual = (_) => {};
  function assertIs(_arg) {}
  util.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error;
  }
  util.assertNever = assertNever;
  util.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util.getValidEnumValues = (obj) => {
    const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util.objectValues(filtered);
  };
  util.objectValues = (obj) => {
    return util.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return;
  };
  util.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util.joinValues = joinValues;
  util.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil) {
  objectUtil.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === en_default ? undefined : en_default
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}

class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil) {
  errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap)
    return { errorMap, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

class ZodType {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus,
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(undefined).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}

class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}

class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};

class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};

class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};

class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};

class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};

class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};

class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};

class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};

class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};

class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : undefined,
          maximum: tooBig ? def.exactLength.value : undefined,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result) => {
        return ParseStatus.mergeArray(status, result);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}

class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {} else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== undefined ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};

class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = undefined;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues) => new ZodError(issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(discriminator, options, params) {
    const optionsMap = new Map;
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}

class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};

class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};

class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}

class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = new Map;
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map;
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};

class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements) {
      const parsedSet = new Set;
      for (const element of elements) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements) => finalizeSet(elements));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};

class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}

class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};

class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}

class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
}
ZodEnum.create = createZodEnum;

class ZodNativeEnum extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};

class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};

class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};

class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};

class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};

class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result) => {
        return {
          status: "valid",
          value: result.status === "valid" ? result.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};

class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");

class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}

class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}

class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind) {
  ZodFirstPartyTypeKind["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
// contract.ts
var PROXY_POOL_TYPES = ["http", "vercel", "cloudflare", "deno", "netlify"];
var proxyPoolSchema = objectType({
  id: stringType(),
  name: stringType(),
  type: enumType(PROXY_POOL_TYPES),
  proxyUrl: stringType(),
  isActive: booleanType(),
  testStatus: enumType(["active", "error"]).nullable().optional(),
  lastTestedAt: numberType().nullable().optional(),
  lastError: stringType().nullable().optional(),
  rateLimitedUntil: numberType().nullable().optional()
});
var createProxyPoolSchema = objectType({
  name: stringType().min(1),
  type: enumType(PROXY_POOL_TYPES),
  proxyUrl: stringType().min(1),
  isActive: booleanType().optional()
});
var updateProxyPoolSchema = objectType({
  name: stringType().min(1).optional(),
  proxyUrl: stringType().min(1).optional(),
  isActive: booleanType().optional()
});
var deployCloudflareSchema = objectType({
  accountId: stringType().min(1),
  apiToken: stringType().min(1),
  projectName: stringType().optional()
});
var deployVercelSchema = objectType({
  vercelToken: stringType().min(1),
  projectName: stringType().optional()
});
var deployDenoSchema = objectType({
  denoToken: stringType().min(1),
  orgDomain: stringType().min(1),
  projectName: stringType().optional()
});
var deployNetlifySchema = objectType({
  netlifyToken: stringType().min(1),
  projectName: stringType().optional()
});
var testProxyPoolResultSchema = objectType({
  ok: booleanType(),
  status: numberType().optional(),
  statusText: stringType().nullable().optional(),
  elapsedMs: numberType().optional(),
  error: stringType().nullable().optional()
});
var PROXY_STRATEGIES = ["single", "round-robin", "random"];
var CAVEMAN_LEVELS = ["off", "lite", "full", "ultra"];
var PONYTAIL_LEVELS = ["off", "lite", "full", "ultra"];
var modelComboSchema = objectType({
  id: stringType().trim().toLowerCase().min(1).max(40).regex(/^[a-z0-9][a-z0-9._-]*$/, "Use a lowercase model-combo slug."),
  name: stringType().trim().min(1).max(80),
  models: arrayType(stringType().trim().min(1).max(200)).min(2).max(6)
}).superRefine((combo, ctx) => {
  const seen = new Set;
  combo.models.forEach((model, index) => {
    const key = model.trim().toLowerCase();
    if (seen.has(key)) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        path: ["models", index],
        message: "A model can appear only once in a combo."
      });
    }
    seen.add(key);
  });
});
var modelCombosSchema = arrayType(modelComboSchema).max(20).superRefine((combos, ctx) => {
  const seen = new Set;
  combos.forEach((combo, index) => {
    const key = combo.id.toLowerCase();
    if (seen.has(key)) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        path: [index, "id"],
        message: "Model-combo IDs must be unique."
      });
    }
    seen.add(key);
  });
});
var routerConfigSchema = objectType({
  version: literalType(1),
  port: numberType().int().min(1024).max(65535),
  apiKey: stringType().min(8),
  upstream: stringType(),
  upstreamApiKey: stringType().max(4096).optional(),
  selectedModels: arrayType(stringType()),
  fallbackModels: arrayType(stringType().min(1)).max(2).default([]),
  modelCombos: modelCombosSchema.default([]),
  proxyPools: arrayType(proxyPoolSchema),
  proxyStrategy: enumType(PROXY_STRATEGIES).default("single"),
  activePoolId: stringType().nullable().optional(),
  stickyLimit: numberType().int().min(1).max(100).default(1),
  rtkEnabled: booleanType().default(true),
  cavemanLevel: enumType(CAVEMAN_LEVELS).default("off"),
  ponytailLevel: enumType(PONYTAIL_LEVELS).default("off")
});
var upstreamUrlSchema = stringType().url().refine((value) => {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && !parsed.username && !parsed.password && !parsed.hash;
  } catch {
    return false;
  }
}, "Use an HTTP(S) base URL without embedded credentials or a fragment.");
var configPatchSchema = objectType({
  port: numberType().int().min(1024).max(65535).optional(),
  apiKey: stringType().min(1).optional(),
  upstream: upstreamUrlSchema.optional(),
  upstreamApiKey: stringType().max(4096).optional(),
  selectedModels: arrayType(stringType()).optional(),
  fallbackModels: arrayType(stringType().min(1)).max(2).optional(),
  modelCombos: modelCombosSchema.optional(),
  proxyPools: arrayType(proxyPoolSchema).optional(),
  proxyStrategy: enumType(PROXY_STRATEGIES).optional(),
  activePoolId: stringType().nullable().optional(),
  stickyLimit: numberType().int().min(1).max(100).optional(),
  rtkEnabled: booleanType().optional(),
  cavemanLevel: enumType(CAVEMAN_LEVELS).optional(),
  ponytailLevel: enumType(PONYTAIL_LEVELS).optional()
});
var testModelInputSchema = objectType({
  modelId: stringType().min(1)
});
var testModelResultSchema = objectType({
  ok: booleanType(),
  modelId: stringType(),
  elapsedMs: numberType().int().nonnegative().optional(),
  reply: stringType().optional(),
  error: stringType().optional()
});
var modelSchema = objectType({
  id: stringType(),
  name: stringType(),
  limit: objectType({
    context: numberType().optional(),
    output: numberType().optional()
  }).optional(),
  capabilities: objectType({
    tools: booleanType().optional(),
    input: arrayType(stringType()).optional(),
    output: arrayType(stringType()).optional()
  }).optional(),
  variants: arrayType(objectType({
    id: stringType(),
    settings: recordType(stringType(), unionType([stringType(), numberType(), booleanType(), nullType()])).optional()
  })).optional()
});
var requestEntrySchema = objectType({
  at: numberType(),
  method: stringType(),
  path: stringType(),
  model: stringType(),
  requestedModel: stringType().optional(),
  status: numberType(),
  ms: numberType(),
  poolName: stringType().optional(),
  fallbackUsed: booleanType().optional(),
  fallbackReason: stringType().optional(),
  inputTokens: numberType().int().nonnegative().optional(),
  outputTokens: numberType().int().nonnegative().optional(),
  totalTokens: numberType().int().nonnegative().optional(),
  error: stringType().optional()
});
var registrationSchema = objectType({
  providerId: stringType(),
  path: stringType(),
  installed: booleanType(),
  models: numberType(),
  modelIds: arrayType(stringType())
});
var routerStateSchema = objectType({
  running: booleanType(),
  routerError: stringType(),
  endpoint: stringType(),
  config: routerConfigSchema,
  upstreamApiKeyConfigured: booleanType(),
  models: arrayType(modelSchema),
  modelsFetchedAt: numberType().nullable(),
  modelsError: stringType(),
  upstreamCount: numberType(),
  registration: registrationSchema,
  preview: stringType(),
  warnings: arrayType(stringType()),
  requests: arrayType(requestEntrySchema)
});
var relaySourceSchema = objectType({
  kind: enumType(PROXY_POOL_TYPES),
  code: stringType()
});
var okSchema = objectType({ ok: literalType(true) });
var endpointFor = (config) => `http://127.0.0.1:${config.port}/v1`;

// service/config.ts
import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
var DEFAULT_PORT = 20128;
var OPENCODE_ZEN = "https://opencode.ai/zen/v1";
var createApiKey = () => `sk-${randomBytes(24).toString("hex")}`;
var defaultConfig = () => ({
  version: 1,
  port: DEFAULT_PORT,
  apiKey: createApiKey(),
  upstream: OPENCODE_ZEN,
  upstreamApiKey: "",
  selectedModels: [],
  fallbackModels: [],
  modelCombos: [],
  proxyPools: [],
  proxyStrategy: "single",
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
  cavemanLevel: "off",
  ponytailLevel: "off"
});
var defaultConfigPath = (home = homedir()) => path.join(home, ".openchamber", "blackrouter", "config.json");
var writeOwnerOnly = (file, text) => {
  mkdirSync(path.dirname(file), { recursive: true, mode: 448 });
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, text, { encoding: "utf8", mode: 384 });
  renameSync(temporary, file);
  try {
    chmodSync(file, 384);
  } catch {}
};
var createConfigStore = (file = defaultConfigPath()) => ({
  path: file,
  load: () => {
    if (!existsSync(file)) {
      const config = defaultConfig();
      writeOwnerOnly(file, `${JSON.stringify(config, null, 2)}
`);
      return config;
    }
    let raw;
    try {
      raw = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      const aside = `${file}.invalid-${Date.now()}`;
      renameSync(file, aside);
      console.error(`[blackrouter] could not read ${file}, moved it to ${aside}:`, error);
      const config = defaultConfig();
      writeOwnerOnly(file, `${JSON.stringify(config, null, 2)}
`);
      return config;
    }
    if (raw && typeof raw === "object") {
      const rawObj = raw;
      if (typeof rawObj.apiKey === "string" && !rawObj.apiKey.startsWith("sk-")) {
        rawObj.apiKey = rawObj.apiKey.startsWith("br-") ? `sk-${rawObj.apiKey.slice(3)}` : `sk-${rawObj.apiKey}`;
      }
      if (!("proxyPools" in rawObj)) {
        const legacyRaw = raw;
        if (legacyRaw.relay && legacyRaw.relay.url) {
          rawObj.proxyPools = [
            {
              id: "legacy-relay",
              name: `${legacyRaw.relay.kind || "Legacy"} Relay`,
              type: legacyRaw.relay.kind === "none" ? "http" : legacyRaw.relay.kind || "http",
              proxyUrl: legacyRaw.relay.url,
              isActive: true
            }
          ];
        } else {
          rawObj.proxyPools = [];
        }
      }
    }
    const parsed = routerConfigSchema.safeParse(raw);
    if (!parsed.success) {
      const aside = `${file}.invalid-${Date.now()}`;
      renameSync(file, aside);
      console.error(`[blackrouter] ${file} did not match the settings shape, moved it to ${aside}`);
      const config = defaultConfig();
      writeOwnerOnly(file, `${JSON.stringify(config, null, 2)}
`);
      return config;
    }
    return parsed.data;
  },
  save: (config) => {
    const parsed = routerConfigSchema.parse(config);
    writeOwnerOnly(file, `${JSON.stringify(parsed, null, 2)}
`);
  }
});

// service/deployers.ts
import { createHash } from "node:crypto";
import http from "node:http";
import https from "node:https";
var CLOUDFLARE_WORKER_CODE = `
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
      return new Response(JSON.stringify({ error: error.message }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
  },
};
`;
var VERCEL_RELAY_CODE = `
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
var DENO_RELAY_CODE = `
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
var NETLIFY_RELAY_CODE = `
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
      body: JSON.stringify({ error: error.message || "Relay fetch failed" }),
    };
  }
};
`;
async function testRelay(relayUrl, timeoutMs = 1e4, fetchImpl = fetch) {
  const controller = new AbortController;
  const startedAt = Date.now();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(relayUrl, {
      method: "GET",
      headers: {
        "x-relay-target": "https://httpbin.org",
        "x-relay-path": "/get"
      },
      signal: controller.signal
    });
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      elapsedMs: Date.now() - startedAt,
      error: res.ok ? null : `Relay responded with HTTP ${res.status}`
    };
  } catch (err) {
    const errorMsg = err instanceof Error && err.name === "AbortError" ? "Relay test timed out" : err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 500,
      elapsedMs: Date.now() - startedAt,
      error: errorMsg
    };
  } finally {
    clearTimeout(timer);
  }
}
async function testForwardProxy(proxyUrlString, targetHost = "opencode.ai", targetPort = 443, timeoutMs = 1e4) {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (finished)
        return;
      finished = true;
      resolve({
        ok: false,
        status: 504,
        elapsedMs: Date.now() - startedAt,
        error: "Proxy CONNECT timed out"
      });
    }, timeoutMs);
    try {
      const proxy = new URL(proxyUrlString);
      const proxyPort = Number(proxy.port) || (proxy.protocol === "https:" ? 443 : 80);
      const proxyHost = proxy.hostname;
      const connectHeaders = {
        Host: `${targetHost}:${targetPort}`,
        "User-Agent": "BlackRouter"
      };
      if (proxy.username || proxy.password) {
        connectHeaders["Proxy-Authorization"] = `Basic ${Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString("base64")}`;
      }
      const transport = proxy.protocol === "https:" ? https : http;
      const req = transport.request({
        host: proxyHost,
        port: proxyPort,
        method: "CONNECT",
        path: `${targetHost}:${targetPort}`,
        headers: connectHeaders
      });
      req.on("connect", (res, socket) => {
        if (finished)
          return;
        finished = true;
        clearTimeout(timer);
        socket.destroy();
        const ok = res.statusCode === 200;
        resolve({
          ok,
          status: res.statusCode,
          statusText: res.statusMessage,
          elapsedMs: Date.now() - startedAt,
          error: ok ? null : `Proxy CONNECT responded with HTTP ${res.statusCode}`
        });
      });
      req.on("error", (err) => {
        if (finished)
          return;
        finished = true;
        clearTimeout(timer);
        resolve({
          ok: false,
          status: 502,
          elapsedMs: Date.now() - startedAt,
          error: err instanceof Error ? err.message : String(err)
        });
      });
      req.end();
    } catch (err) {
      if (finished)
        return;
      finished = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        status: 400,
        elapsedMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });
}
async function testRelayOrProxy(pool, timeoutMs = 1e4, fetchImpl = fetch) {
  if (pool.type === "http") {
    return testForwardProxy(pool.proxyUrl, "opencode.ai", 443, timeoutMs);
  }
  return testRelay(pool.proxyUrl, timeoutMs, fetchImpl);
}
async function deployCloudflare(input, fetchImpl = fetch) {
  const accountId = input.accountId.trim();
  const apiToken = input.apiToken.trim();
  const projectName = input.projectName?.trim() || `cf-relay-${Date.now().toString(36)}`;
  const workerScriptUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${projectName}`;
  const formData = new FormData;
  formData.append("index.js", new Blob([CLOUDFLARE_WORKER_CODE], { type: "application/javascript+module" }), "index.js");
  formData.append("metadata", new Blob([
    JSON.stringify({
      main_module: "index.js",
      compatibility_date: "2024-03-20"
    })
  ], { type: "application/json" }), "metadata.json");
  const uploadRes = await fetchImpl(workerScriptUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${apiToken}` },
    body: formData
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.errors?.[0]?.message || `Cloudflare upload failed with status ${uploadRes.status}`);
  }
  await fetchImpl(`${workerScriptUrl}/subdomain`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ enabled: true })
  }).catch(() => {});
  const subdomainRes = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    }
  });
  let subdomain = "";
  if (subdomainRes.ok) {
    const subdomainData = await subdomainRes.json().catch(() => ({}));
    if (subdomainData.result?.subdomain) {
      subdomain = subdomainData.result.subdomain;
    }
  }
  if (!subdomain) {
    throw new Error("Worker deployed but failed to retrieve workers.dev subdomain. Verify subdomain setup in Cloudflare.");
  }
  return {
    name: projectName,
    proxyUrl: `https://${projectName}.${subdomain}.workers.dev`
  };
}
var VERCEL_API = "https://api.vercel.com";
async function deployVercel(input, fetchImpl = fetch, maxPollMs = 120000) {
  const vercelToken = input.vercelToken.trim();
  const projectName = input.projectName?.trim() || `vercel-relay-${Date.now().toString(36)}`;
  const deployRes = await fetchImpl(`${VERCEL_API}/v13/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: projectName,
      files: [
        { file: "api/relay.js", data: VERCEL_RELAY_CODE },
        { file: "package.json", data: JSON.stringify({ name: projectName, version: "1.0.0" }) },
        { file: "vercel.json", data: JSON.stringify({ rewrites: [{ source: "/(.*)", destination: "/api/relay" }] }) }
      ],
      projectSettings: { framework: null },
      target: "production"
    })
  });
  if (!deployRes.ok) {
    const err = await deployRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Vercel deploy request failed with status ${deployRes.status}`);
  }
  const deployData = await deployRes.json();
  const deploymentId = deployData.id;
  const start = Date.now();
  let liveUrl = deployData.url ? `https://${deployData.url}` : `https://${projectName}.vercel.app`;
  while (Date.now() - start < maxPollMs) {
    const statusRes = await fetchImpl(`${VERCEL_API}/v13/deployments/${deploymentId}`, {
      headers: { Authorization: `Bearer ${vercelToken}` }
    });
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      if (statusData.readyState === "READY") {
        if (statusData.url)
          liveUrl = `https://${statusData.url}`;
        break;
      }
      if (statusData.readyState === "ERROR" || statusData.readyState === "CANCELED") {
        throw new Error(`Vercel deployment failed: ${statusData.readyState}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return {
    name: projectName,
    proxyUrl: liveUrl
  };
}
var DENO_V2_API = "https://api.deno.com/v2";
async function deployDeno(input, fetchImpl = fetch, maxPollMs = 60000) {
  const denoToken = input.denoToken.trim();
  const orgDomain = input.orgDomain.trim();
  const projectName = input.projectName?.trim() || `deno-relay-${Date.now().toString(36)}`;
  const headers = {
    Authorization: `Bearer ${denoToken}`,
    "Content-Type": "application/json"
  };
  const createAppRes = await fetchImpl(`${DENO_V2_API}/apps`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      slug: projectName,
      labels: { "custom.kind": "blackrouter-relay" },
      config: {
        install: "deno install",
        runtime: { type: "dynamic", entrypoint: "main.ts" }
      }
    })
  });
  if (!createAppRes.ok) {
    const text = await createAppRes.text().catch(() => "");
    throw new Error(`Deno app creation failed (${createAppRes.status}): ${text}`);
  }
  const app = await createAppRes.json();
  const deployRes = await fetchImpl(`${DENO_V2_API}/apps/${app.id}/deploy`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      assets: {
        "main.ts": {
          kind: "file",
          content: DENO_RELAY_CODE,
          encoding: "utf-8"
        }
      }
    })
  });
  if (!deployRes.ok) {
    await fetchImpl(`${DENO_V2_API}/apps/${app.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${denoToken}` }
    }).catch(() => {});
    const text = await deployRes.text().catch(() => "");
    throw new Error(`Deno deploy failed (${deployRes.status}): ${text}`);
  }
  const revision = await deployRes.json();
  const revisionId = revision.id;
  let status = revision.status;
  const start = Date.now();
  while (status === "queued" || status === "building") {
    if (Date.now() - start > maxPollMs) {
      throw new Error("Deno deploy timed out");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusRes = await fetchImpl(`${DENO_V2_API}/revisions/${revisionId}`, {
      headers: { Authorization: `Bearer ${denoToken}` }
    });
    if (statusRes.ok) {
      const data = await statusRes.json();
      status = data.status;
    }
  }
  if (status !== "succeeded") {
    await fetchImpl(`${DENO_V2_API}/apps/${app.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${denoToken}` }
    }).catch(() => {});
    throw new Error(`Deno deploy failed with status: ${status}`);
  }
  const orgSlug = orgDomain.split(".")[0];
  const deployUrl = `https://${projectName}.${orgSlug}.deno.net`;
  return {
    name: projectName,
    proxyUrl: deployUrl
  };
}
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0;n < 256; n += 1) {
    let c = n;
    for (let k = 0;k < 8; k += 1)
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 4294967295;
  for (let i = 0;i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function buildStoredZip(files) {
  const encoder = new TextEncoder;
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameBytes = encoder.encode(name);
    const content = data;
    const crc = crc32(content);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 67324752, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 2048, true);
    local.setUint16(8, 0, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, content.length, true);
    local.setUint32(22, content.length, true);
    local.setUint16(26, nameBytes.length, true);
    chunks.push(Buffer.from(local.buffer), Buffer.from(nameBytes), Buffer.from(content));
    const centralHeader = new DataView(new ArrayBuffer(46));
    centralHeader.setUint32(0, 33639248, true);
    centralHeader.setUint16(8, 2048, true);
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
  end.setUint32(0, 101010256, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, centralStart, true);
  return Buffer.concat([...chunks, ...central, Buffer.from(end.buffer)]);
}
var NETLIFY_API = "https://api.netlify.com/api/v1";
async function deployNetlify(input, fetchImpl = fetch, maxPollMs = 120000) {
  const netlifyToken = input.netlifyToken.trim();
  const rawName = input.projectName?.trim().toLowerCase() || `netlify-relay-${Date.now().toString(36)}`;
  const siteName = rawName.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || `relay-${Date.now().toString(36)}`;
  const headers = {
    Authorization: `Bearer ${netlifyToken}`,
    "Content-Type": "application/json",
    "User-Agent": "BlackRouter"
  };
  const siteRes = await fetchImpl(`${NETLIFY_API}/sites`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: siteName })
  });
  if (!siteRes.ok) {
    const err = await siteRes.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Netlify site creation failed (${siteRes.status})`);
  }
  const site = await siteRes.json();
  const siteId = site.id || site.site_id;
  const siteUrl = site.ssl_url || site.url;
  if (!siteId || !siteUrl) {
    throw new Error("Netlify site created but missing site ID or URL");
  }
  const zip = buildStoredZip([
    { name: "relay.js", data: new TextEncoder().encode(NETLIFY_RELAY_CODE) }
  ]);
  const zipSha256 = createHash("sha256").update(zip).digest("hex");
  const indexHtml = new TextEncoder().encode("<!doctype html><html><body>BlackRouter Relay</body></html>");
  const indexSha1 = createHash("sha1").update(indexHtml).digest("hex");
  const deployRes = await fetchImpl(`${NETLIFY_API}/sites/${siteId}/deploys`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      files: { "/index.html": indexSha1 },
      functions: { relay: zipSha256 }
    })
  });
  if (!deployRes.ok) {
    const err = await deployRes.json().catch(() => ({}));
    throw new Error(err.message || `Netlify deploy initialization failed (${deployRes.status})`);
  }
  const deploy = await deployRes.json();
  const deployId = deploy.id;
  const requiredFiles = new Set(deploy.required || []);
  const requiredFunctions = new Set(deploy.required_functions || []);
  if (requiredFiles.has(indexSha1)) {
    await fetchImpl(`${NETLIFY_API}/deploys/${deployId}/files/index.html`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        "Content-Type": "application/octet-stream",
        "User-Agent": "BlackRouter"
      },
      body: indexHtml
    });
  }
  if (requiredFunctions.has(zipSha256)) {
    await fetchImpl(`${NETLIFY_API}/deploys/${deployId}/functions/relay?runtime=js`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        "Content-Type": "application/octet-stream",
        "User-Agent": "BlackRouter"
      },
      body: new Uint8Array(zip)
    });
  }
  const start = Date.now();
  while (Date.now() - start < maxPollMs) {
    const pollRes = await fetchImpl(`${NETLIFY_API}/deploys/${deployId}`, {
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        "User-Agent": "BlackRouter"
      }
    });
    if (pollRes.ok) {
      const data = await pollRes.json().catch(() => ({}));
      if (data.state === "ready")
        break;
      if (data.state === "error") {
        throw new Error(data.error_message || "Netlify deploy failed");
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  const relayUrl = `${siteUrl.replace(/\/$/, "")}/.netlify/functions/relay`;
  return {
    name: siteName,
    proxyUrl: relayUrl
  };
}

// service/errors.ts
class RouterError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "RouterError";
    this.code = code;
  }
}
var badRequest = (message) => new RouterError("bad-request", message);
var configUnreadable = (message) => new RouterError("config-unreadable", message);
var upstreamError = (message) => new RouterError("upstream", message);

// service/opencode-config.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync as readFileSync2, renameSync as renameSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { homedir as homedir2 } from "node:os";
import path2 from "node:path";

// service/json.ts
var isJsonObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

// service/model-metadata.ts
var REASONING_VARIANTS = [
  { id: "low", settings: { reasoningEffort: "low" } },
  { id: "medium", settings: { reasoningEffort: "medium" } },
  { id: "high", settings: { reasoningEffort: "high" } }
];
var KNOWN_MODELS = {
  "deepseek-chat-free": {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ["text"], output: ["text"] }
  },
  "deepseek-v3-free": {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ["text"], output: ["text"] }
  },
  "deepseek-ai/deepseek-chat-free": {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ["text"], output: ["text"] }
  },
  "deepseek-reasoner-free": {
    limit: { context: 131072, output: 16384 },
    capabilities: { tools: true, input: ["text"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "deepseek-r1-free": {
    limit: { context: 131072, output: 16384 },
    capabilities: { tools: true, input: ["text"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "deepseek-ai/deepseek-r1-free": {
    limit: { context: 131072, output: 16384 },
    capabilities: { tools: true, input: ["text"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "deepseek-v4.1-flash-free": {
    limit: { context: 1e6, output: 384000 },
    capabilities: { tools: true, input: ["text", "image"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "glm-5.3-flash-free": {
    limit: { context: 1e6, output: 128000 },
    capabilities: { tools: true, input: ["text", "image"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "mimo-v2.6-flash-free": {
    limit: { context: 1048576, output: 131072 },
    capabilities: { tools: true, input: ["text", "image"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "muse-spark-1.3-contributor-free": {
    limit: { context: 1048576, output: 131072 },
    capabilities: { tools: true, input: ["text", "image"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "union-alpha": {
    limit: { context: 262144, output: 131072 },
    capabilities: { tools: true, input: ["text", "image"], output: ["text"] }
  },
  "nemotron-3.5-super-vl-free": {
    limit: { context: 1e6, output: 131072 },
    capabilities: { tools: true, input: ["text", "image"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "nemotron-3.5-lightning-free": {
    limit: { context: 1e6, output: 16384 },
    capabilities: { tools: true, input: ["text"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "jev-1.13-free": {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ["text"], output: ["text"] }
  },
  "big-pickle": {
    limit: { context: 200000, output: 32000 },
    capabilities: { tools: true, input: ["text"], output: ["text"] },
    variants: REASONING_VARIANTS
  },
  "big-pickle-free": {
    limit: { context: 200000, output: 32000 },
    capabilities: { tools: true, input: ["text"], output: ["text"] },
    variants: REASONING_VARIANTS
  }
};
var MODEL_RULES = [
  { pattern: /glm[-_]?5\.3/i, context: 1e6, output: 128000, vision: true, reasoning: true, tools: true },
  { pattern: /glm[-_]?5\.2/i, context: 1e6, output: 128000, vision: false, reasoning: true, tools: true },
  { pattern: /glm[-_]?5/i, context: 200000, output: 128000, vision: false, reasoning: true, tools: true },
  { pattern: /glm[-_]?4.*v/i, context: 128000, output: 4096, vision: true, reasoning: true, tools: true },
  { pattern: /glm[-_]?4\.7/i, context: 200000, output: 48000, vision: false, reasoning: true, tools: true },
  { pattern: /glm/i, context: 128000, output: 4096, vision: false, reasoning: false, tools: true },
  { pattern: /deepseek[-_]?v4[._]1/i, context: 1e6, output: 384000, vision: true, reasoning: true, tools: true },
  { pattern: /deepseek[-_]?v4/i, context: 1e6, output: 384000, vision: false, reasoning: true, tools: true },
  { pattern: /deepseek[-_]?(?:r1|reasoner)/i, context: 131072, output: 16384, vision: false, reasoning: true, tools: true },
  { pattern: /deepseek/i, context: 131072, output: 8192, vision: false, reasoning: false, tools: true },
  { pattern: /mimo[-_]?v2\.[56]/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /mimo[-_]?omni/i, context: 262144, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /mimo/i, context: 262144, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /muse[-_]?spark/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /space[-_]?bunny/i, context: 1048576, output: 524288, vision: true, reasoning: true, tools: true },
  { pattern: /big[-_]?pickle/i, context: 200000, output: 32000, vision: false, reasoning: true, tools: true },
  { pattern: /longcat[-_]?2\.5/i, context: 1e6, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /longcat/i, context: 1e6, output: 131072, vision: false, reasoning: true, tools: true },
  { pattern: /(?:exo|fledge[-_]?alpha)/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /union[-_]?alpha/i, context: 262144, output: 131072, vision: true, reasoning: false, tools: true },
  { pattern: /nemotron.*(?:3\.5.*super.*vl|super.*vl)/i, context: 1e6, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /nemotron.*(?:3\.5.*lightning|lightning)/i, context: 1e6, output: 16384, vision: false, reasoning: true, tools: true },
  { pattern: /nemotron[-_]?3\.5/i, context: 1e6, output: 65536, vision: true, reasoning: true, tools: true },
  { pattern: /nemotron.*vl/i, context: 131072, output: 4096, vision: true, reasoning: true, tools: true },
  { pattern: /nemotron/i, context: 131072, output: 4096, vision: false, reasoning: true, tools: true },
  { pattern: /flint/i, context: 131072, output: 8192, vision: false, reasoning: true, tools: true },
  { pattern: /(?:jev|beam)/i, context: 131072, output: 8192, vision: false, reasoning: false, tools: true },
  { pattern: /north[-_]?mini/i, context: 256000, output: 64000, vision: false, reasoning: true, tools: true },
  { pattern: /ring[-_]?2\.6/i, context: 262000, output: 66000, vision: false, reasoning: true, tools: true },
  { pattern: /qwen[-_]?(?:3\.5|plus|max)/i, context: 1e6, output: 65536, vision: true, reasoning: true, tools: true },
  { pattern: /qwen.*coder/i, context: 1e6, output: 65536, vision: false, reasoning: true, tools: true },
  { pattern: /qwen.*vl/i, context: 262144, output: 65536, vision: true, reasoning: true, tools: true },
  { pattern: /qwq/i, context: 131072, output: 32768, vision: false, reasoning: true, tools: true },
  { pattern: /qwen/i, context: 131072, output: 8192, vision: false, reasoning: false, tools: true },
  { pattern: /kimi[-_]?k3/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /kimi/i, context: 262144, output: 65536, vision: true, reasoning: true, tools: true },
  { pattern: /minimax[-_]?m3/i, context: 1e6, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /minimax/i, context: 204800, output: 131072, vision: true, reasoning: true, tools: true },
  { pattern: /claude.*(?:3[.-]7|sonnet[-_]?[45]|opus[-_]?[45])/i, context: 1e6, output: 128000, vision: true, reasoning: true, tools: true },
  { pattern: /claude.*3[.-]5/i, context: 200000, output: 8192, vision: true, reasoning: false, tools: true },
  { pattern: /claude/i, context: 200000, output: 8192, vision: true, reasoning: false, tools: true },
  { pattern: /(?:^|[^a-z0-9])o[134](?:[-_]|$)/i, context: 200000, output: 1e5, vision: true, reasoning: true, tools: true },
  { pattern: /gpt[-_]?[56]/i, context: 1050000, output: 128000, vision: true, reasoning: true, tools: true },
  { pattern: /gpt[-_]?4o/i, context: 128000, output: 16384, vision: true, reasoning: false, tools: true },
  { pattern: /gpt[-_]?4\.1/i, context: 1e6, output: 32768, vision: true, reasoning: false, tools: true },
  { pattern: /gpt[-_]?4/i, context: 128000, output: 4096, vision: false, reasoning: false, tools: true },
  { pattern: /gemini.*(?:2\.5|thinking)/i, context: 1048576, output: 65536, vision: true, reasoning: true, tools: true },
  { pattern: /gemini/i, context: 1048576, output: 65536, vision: true, reasoning: false, tools: true },
  { pattern: /grok/i, context: 256000, output: 64000, vision: true, reasoning: true, tools: true }
];
var resolveModelMetadata = (rawId, upstreamData) => {
  const normalized = rawId.trim().toLowerCase();
  if (upstreamData) {
    const rawCtx = Number(upstreamData.context_length) || Number(upstreamData.contextLength) || Number(upstreamData.max_context_tokens) || (typeof upstreamData.limit === "object" && upstreamData.limit ? Number(upstreamData.limit.context) : 0);
    const rawOut = Number(upstreamData.max_tokens) || Number(upstreamData.max_output_tokens) || Number(upstreamData.maxOutput) || (typeof upstreamData.limit === "object" && upstreamData.limit ? Number(upstreamData.limit.output) : 0);
    if (rawCtx > 0 || rawOut > 0) {
      const isVision = normalized.includes("vl") || normalized.includes("vision") || normalized.includes("4v") || normalized.includes("image") || normalized.includes("multimodal");
      const isReasoning = normalized.includes("reasoner") || normalized.includes("reasoning") || normalized.includes("r1") || normalized.includes("thinking") || normalized.includes("o1") || normalized.includes("o3");
      return {
        limit: {
          context: rawCtx > 0 ? rawCtx : 131072,
          output: rawOut > 0 ? rawOut : 8192
        },
        capabilities: {
          tools: true,
          input: isVision ? ["text", "image"] : ["text"],
          output: ["text"]
        },
        ...isReasoning ? { variants: REASONING_VARIANTS } : {}
      };
    }
  }
  const known = KNOWN_MODELS[normalized];
  if (known && known.limit && known.capabilities) {
    return {
      limit: known.limit,
      capabilities: known.capabilities,
      variants: known.variants
    };
  }
  for (const rule of MODEL_RULES) {
    if (rule.pattern.test(normalized)) {
      const isVision = rule.vision ?? (normalized.includes("vl") || normalized.includes("vision") || normalized.includes("4v") || normalized.includes("image") || normalized.includes("multimodal"));
      const isReasoning = rule.reasoning ?? (normalized.includes("reasoner") || normalized.includes("reasoning") || normalized.includes("r1") || normalized.includes("thinking"));
      return {
        limit: {
          context: rule.context,
          output: rule.output
        },
        capabilities: {
          tools: rule.tools ?? true,
          input: isVision ? ["text", "image"] : ["text"],
          output: ["text"]
        },
        ...isReasoning ? { variants: REASONING_VARIANTS } : {}
      };
    }
  }
  const isVision = normalized.includes("vl") || normalized.includes("vision") || normalized.includes("4v") || normalized.includes("image") || normalized.includes("multimodal");
  const isReasoning = normalized.includes("reasoner") || normalized.includes("reasoning") || normalized.includes("r1") || normalized.includes("thinking") || normalized.includes("o1") || normalized.includes("o3");
  let context = 131072;
  let output = isReasoning ? 16384 : 8192;
  if (normalized.includes("1m") || normalized.includes("1000k")) {
    context = 1048576;
    output = 131072;
  } else if (normalized.includes("500k")) {
    context = 524288;
    output = 65536;
  } else if (normalized.includes("256k") || normalized.includes("200k")) {
    context = 262144;
    output = 65536;
  } else if (normalized.includes("64k")) {
    context = 65536;
    output = 16384;
  } else if (normalized.includes("32k")) {
    context = 32768;
    output = 8192;
  } else if (normalized.includes("16k")) {
    context = 16384;
    output = 4096;
  }
  return {
    limit: { context, output },
    capabilities: {
      tools: true,
      input: isVision ? ["text", "image"] : ["text"],
      output: ["text"]
    },
    ...isReasoning ? { variants: REASONING_VARIANTS } : {}
  };
};

// service/opencode-config.ts
var PROVIDER_ID = "blackrouter";
var PROVIDER_NAME = "BlackRouter";
var PROVIDER_PACKAGE = "aisdk:@ai-sdk/openai-compatible";
var resolveConfigFile = (home = homedir2(), exists = existsSync2) => {
  const directory = path2.join(home, ".config", "opencode");
  const json = path2.join(directory, "opencode.json");
  if (exists(json))
    return json;
  const jsonc = path2.join(directory, "opencode.jsonc");
  if (exists(jsonc))
    return jsonc;
  return json;
};
var stripJsonComments = (text) => {
  let out = "";
  let hadComments = false;
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let index = 0;index < text.length; index += 1) {
    const char = text[index] ?? "";
    const next = text[index + 1] ?? "";
    if (inLineComment) {
      if (char === `
`) {
        inLineComment = false;
        out += char;
      }
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }
    if (inString) {
      out += char;
      if (char === "\\") {
        out += next;
        index += 1;
        continue;
      }
      if (char === '"')
        inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === "/" && next === "/") {
      hadComments = true;
      inLineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      hadComments = true;
      inBlockComment = true;
      index += 1;
      continue;
    }
    out += char;
  }
  return { text: out.replace(/,(\s*[}\]])/g, "$1"), hadComments };
};
var parseJsonc = (text) => {
  const stripped = stripJsonComments(text);
  const value = JSON.parse(stripped.text);
  return { value, hadComments: stripped.hadComments };
};
var readConfig = (file) => {
  if (!existsSync2(file)) {
    return { data: { $schema: "https://opencode.ai/config.json" }, hadComments: false, existed: false };
  }
  const text = readFileSync2(file, "utf8");
  let parsed;
  try {
    parsed = parseJsonc(text);
  } catch (error) {
    throw configUnreadable(`OpenCode's config at ${file} could not be read, so nothing was changed. ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isJsonObject(parsed.value)) {
    throw configUnreadable(`OpenCode's config at ${file} is not a JSON object, so nothing was changed.`);
  }
  return { data: parsed.value, hadComments: parsed.hadComments, existed: true };
};
var writeConfig = (file, data) => {
  mkdirSync2(path2.dirname(file), { recursive: true });
  const temporary = `${file}.blackrouter.tmp`;
  writeFileSync2(temporary, `${JSON.stringify(data, null, 2)}
`, "utf8");
  renameSync2(temporary, file);
};
var buildProviderEntry = (config, models) => ({
  name: PROVIDER_NAME,
  package: PROVIDER_PACKAGE,
  settings: {
    baseURL: endpointFor(config),
    apiKey: config.apiKey
  },
  models: Object.fromEntries(models.map((model) => {
    const meta = resolveModelMetadata(model.id);
    const entry = {
      modelID: model.id,
      name: model.name,
      limit: {
        context: model.limit?.context ?? meta.limit.context,
        output: model.limit?.output ?? meta.limit.output
      },
      capabilities: {
        tools: model.capabilities?.tools ?? meta.capabilities.tools,
        input: model.capabilities?.input ?? meta.capabilities.input,
        output: model.capabilities?.output ?? meta.capabilities.output
      }
    };
    const variants = model.variants ?? meta.variants;
    if (variants && variants.length > 0) {
      entry.variants = variants;
    }
    return [model.id, entry];
  }))
});
var sectionOf = (data, key) => {
  const section = data[key];
  if (section === undefined)
    return null;
  if (!isJsonObject(section)) {
    throw configUnreadable(`OpenCode's config has a \`${key}\` entry that is not an object, so nothing was changed.`);
  }
  return section;
};
var readRegistration = (file) => {
  const empty = {
    providerId: PROVIDER_ID,
    path: file,
    installed: false,
    models: 0,
    modelIds: []
  };
  if (!existsSync2(file))
    return empty;
  try {
    const { value } = parseJsonc(readFileSync2(file, "utf8"));
    if (!isJsonObject(value))
      return empty;
    const providers = isJsonObject(value.providers) ? value.providers : {};
    const legacy = isJsonObject(value.provider) ? value.provider : {};
    const entry = providers[PROVIDER_ID] ?? legacy[PROVIDER_ID];
    if (!isJsonObject(entry))
      return empty;
    const modelIds = isJsonObject(entry.models) ? Object.keys(entry.models) : [];
    return { ...empty, installed: true, models: modelIds.length, modelIds };
  } catch {
    return empty;
  }
};
var registerProvider = (file, config, models) => {
  const { data, hadComments, existed } = readConfig(file);
  const warnings = [];
  if (hadComments) {
    warnings.push("Comments in OpenCode's config are not kept when it is rewritten.");
  }
  if (existed) {
    writeFileSync2(`${file}.blackrouter.backup`, readFileSync2(file));
  }
  const providers = sectionOf(data, "providers") ?? {};
  providers[PROVIDER_ID] = buildProviderEntry(config, models);
  data.providers = providers;
  const legacy = sectionOf(data, "provider");
  if (legacy && legacy[PROVIDER_ID] !== undefined) {
    delete legacy[PROVIDER_ID];
    if (Object.keys(legacy).length === 0)
      delete data.provider;
    warnings.push("The older `provider` entry for BlackRouter was replaced by the `providers` entry.");
  }
  writeConfig(file, data);
  return { registration: readRegistration(file), warnings };
};
var removeProvider = (file) => {
  if (!existsSync2(file)) {
    return { registration: readRegistration(file), warnings: [] };
  }
  const { data, hadComments } = readConfig(file);
  const warnings = [];
  if (hadComments)
    warnings.push("Comments in OpenCode's config are not kept when it is rewritten.");
  let changed = false;
  const providers = sectionOf(data, "providers");
  if (providers && providers[PROVIDER_ID] !== undefined) {
    delete providers[PROVIDER_ID];
    if (Object.keys(providers).length === 0)
      delete data.providers;
    changed = true;
  }
  const legacy = sectionOf(data, "provider");
  if (legacy && legacy[PROVIDER_ID] !== undefined) {
    delete legacy[PROVIDER_ID];
    if (Object.keys(legacy).length === 0)
      delete data.provider;
    changed = true;
  }
  if (changed) {
    writeFileSync2(`${file}.blackrouter.backup`, readFileSync2(file));
    writeConfig(file, data);
  }
  return { registration: readRegistration(file), warnings };
};

// service/model-fallback.ts
var MAX_FALLBACK_MODELS = 2;
var MAX_MODELS_PER_REQUEST = MAX_FALLBACK_MODELS + 1;
var MAX_COMBO_MODELS = 6;
var modelComboModelId = (comboId) => `combo/${comboId.trim().toLowerCase()}`;
var canonicalModelId = (modelId) => {
  const trimmed = modelId.trim().replace(/\([^()]+\)\s*$/, "").trim();
  const upstreamId = trimmed.startsWith("blackrouter/") ? trimmed.slice("blackrouter/".length) : trimmed;
  return upstreamId.toLowerCase();
};
var uniqueModelIds = (models, limit) => {
  const result = [];
  const seen = new Set;
  for (const model of models) {
    const cleaned = model.trim();
    const canonical = canonicalModelId(cleaned);
    if (!cleaned || !canonical || seen.has(canonical))
      continue;
    seen.add(canonical);
    result.push(cleaned);
    if (result.length >= limit)
      break;
  }
  return result;
};
var resolveModelCandidates = (requestedModel, configuredFallbacks = [], modelCombos = []) => {
  const requestedCanonical = canonicalModelId(requestedModel);
  const combo = modelCombos.find((candidate) => canonicalModelId(modelComboModelId(candidate.id)) === requestedCanonical);
  if (combo) {
    return uniqueModelIds(combo.models, MAX_COMBO_MODELS);
  }
  return uniqueModelIds([requestedModel, ...configuredFallbacks], 1 + MAX_FALLBACK_MODELS);
};
var buildComboRouterModels = (combos, availableModels) => combos.map((combo) => {
  const primaryId = combo.models[0] ?? "";
  const primary = availableModels.find((model) => canonicalModelId(model.id) === canonicalModelId(primaryId));
  return {
    id: modelComboModelId(combo.id),
    name: combo.name,
    ...primary?.limit ? { limit: primary.limit } : {},
    ...primary?.capabilities ? { capabilities: primary.capabilities } : {},
    ...primary?.variants ? { variants: primary.variants } : {}
  };
});
var isRetryableFallbackStatus = (status) => status === 404 || status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
var shouldAdvanceAfterStatus = (status, usedProxyPool, allowShortDirect429Fallback = false) => isRetryableFallbackStatus(status) && (status !== 429 || usedProxyPool || allowShortDirect429Fallback);

// service/pool-selector.ts
var createPoolSelector = () => {
  let currentPoolId = null;
  let consecutiveCount = 0;
  let lastIndex = -1;
  const reset = () => {
    currentPoolId = null;
    consecutiveCount = 0;
    lastIndex = -1;
  };
  const pickPool = (config, excludedPoolIds) => {
    const active = (config.proxyPools || []).filter((p) => p.isActive && p.proxyUrl.trim() && !excludedPoolIds?.has(p.id));
    if (active.length === 0) {
      reset();
      return null;
    }
    const now = Date.now();
    const available = active.filter((p) => !p.rateLimitedUntil || p.rateLimitedUntil <= now);
    const pools = available;
    if (pools.length === 0) {
      reset();
      return null;
    }
    const strategy = config.proxyStrategy || "single";
    if (strategy === "single") {
      if (config.activePoolId) {
        const designated = pools.find((p) => p.id === config.activePoolId);
        if (designated)
          return designated;
      }
      return pools[0] ?? null;
    }
    if (strategy === "random") {
      const randomIndex = Math.floor(Math.random() * pools.length);
      return pools[randomIndex] ?? null;
    }
    const stickyLimit = Math.max(1, config.stickyLimit || 1);
    const currentIndex = currentPoolId ? pools.findIndex((p) => p.id === currentPoolId) : -1;
    if (currentIndex !== -1 && consecutiveCount < stickyLimit) {
      consecutiveCount += 1;
      return pools[currentIndex] ?? null;
    }
    const nextIndex = (lastIndex + 1) % pools.length;
    const picked = pools[nextIndex] ?? null;
    if (picked) {
      currentPoolId = picked.id;
      consecutiveCount = 1;
      lastIndex = nextIndex;
    }
    return picked;
  };
  return { pickPool, reset };
};

// service/request-history.ts
import { chmodSync as chmodSync2, existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync3, renameSync as renameSync3, writeFileSync as writeFileSync3 } from "node:fs";
import path3 from "node:path";
var REQUEST_HISTORY_LIMIT = 200;
var HISTORY_FILE_NAME = "requests.jsonl";
var createRequestHistoryStore = (configFilePath, limit = REQUEST_HISTORY_LIMIT) => {
  const file = path3.join(path3.dirname(configFilePath), HISTORY_FILE_NAME);
  const boundedLimit = Math.max(1, Math.min(Math.floor(limit), 5000));
  const load = () => {
    if (!existsSync3(file))
      return [];
    try {
      const lines = readFileSync3(file, "utf8").split(/\r?\n/).filter((line) => line.trim().length > 0).slice(0, boundedLimit);
      const entries = [];
      for (const line of lines) {
        try {
          const value = JSON.parse(line);
          const parsed = requestEntrySchema.safeParse(value);
          if (parsed.success)
            entries.push(parsed.data);
        } catch {}
      }
      return entries;
    } catch (error) {
      console.warn("[blackrouter] could not read request history:", error);
      return [];
    }
  };
  const save = (entries) => {
    const recent = entries.slice(0, boundedLimit).map((entry) => requestEntrySchema.parse(entry));
    mkdirSync3(path3.dirname(file), { recursive: true, mode: 448 });
    const temp = `${file}.tmp`;
    const text = recent.map((entry) => JSON.stringify(entry)).join(`
`);
    writeFileSync3(temp, text ? `${text}
` : "", { encoding: "utf8", mode: 384 });
    renameSync3(temp, file);
    try {
      chmodSync2(file, 384);
    } catch {}
  };
  return { path: file, load, save };
};

// service/retry-after.ts
var parseRetryAfterMs = (value, now = Date.now(), fallbackMs = 5 * 60000) => {
  const fallback = Math.max(1000, Math.min(fallbackMs, 60 * 60000));
  if (typeof value !== "string" || value.trim() === "")
    return fallback;
  const trimmed = value.trim();
  let requestedMs;
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (!Number.isFinite(seconds) || seconds < 0)
      return fallback;
    requestedMs = seconds * 1000;
  } else {
    const date = Date.parse(trimmed);
    if (!Number.isFinite(date))
      return fallback;
    requestedMs = date - now;
  }
  return Math.max(1000, Math.min(requestedMs, 60 * 60000));
};

// service/router-server.ts
import { timingSafeEqual } from "node:crypto";
import http3 from "node:http";

// service/upstream.ts
import http2 from "node:http";
import https2 from "node:https";
import { pipeline } from "node:stream";
import tls from "node:tls";

// service/sse.ts
var chunkOf = (line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:"))
    return null;
  const payload = trimmed.slice("data:".length).trim();
  if (!payload || payload === "[DONE]")
    return null;
  try {
    const parsed = JSON.parse(payload);
    return isJsonObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
var aggregateStream = (text) => {
  let id = "";
  let model = "";
  let created = 0;
  let content = "";
  let reasoning = "";
  let finish = null;
  let usage = null;
  const toolCalls = new Map;
  for (const line of text.split(`
`)) {
    const chunk = chunkOf(line);
    if (!chunk)
      continue;
    if (isJsonObject(chunk.error))
      return chunk;
    if (typeof chunk.id === "string")
      id = chunk.id;
    if (typeof chunk.model === "string")
      model = chunk.model;
    if (typeof chunk.created === "number")
      created = chunk.created;
    if (isJsonObject(chunk.usage))
      usage = chunk.usage;
    const choices = Array.isArray(chunk.choices) ? chunk.choices : [];
    const choice = choices.find(isJsonObject);
    if (!choice)
      continue;
    if (typeof choice.finish_reason === "string")
      finish = choice.finish_reason;
    const delta = isJsonObject(choice.delta) ? choice.delta : null;
    if (!delta)
      continue;
    if (typeof delta.content === "string")
      content += delta.content;
    if (typeof delta.reasoning_content === "string")
      reasoning += delta.reasoning_content;
    const calls = Array.isArray(delta.tool_calls) ? delta.tool_calls : [];
    for (const raw of calls) {
      if (!isJsonObject(raw))
        continue;
      const index = typeof raw.index === "number" ? raw.index : 0;
      const fn = isJsonObject(raw.function) ? raw.function : null;
      const current = toolCalls.get(index) ?? { id: "", name: "", arguments: "" };
      if (typeof raw.id === "string" && raw.id)
        current.id = raw.id;
      if (fn && typeof fn.name === "string" && fn.name)
        current.name = fn.name;
      if (fn && typeof fn.arguments === "string")
        current.arguments += fn.arguments;
      toolCalls.set(index, current);
    }
  }
  const message = { role: "assistant", content };
  if (reasoning)
    message.reasoning_content = reasoning;
  if (toolCalls.size > 0) {
    message.tool_calls = [...toolCalls.entries()].sort(([left], [right]) => left - right).map(([index, call]) => ({
      id: call.id || `call_${index}`,
      type: "function",
      function: { name: call.name, arguments: call.arguments || "{}" }
    }));
  }
  const answer = {
    id: id || `chatcmpl-blackrouter-${Date.now()}`,
    object: "chat.completion",
    created: created || Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message, finish_reason: finish ?? (toolCalls.size > 0 ? "tool_calls" : "stop") }]
  };
  if (usage) {
    answer.usage = usage;
    delete answer.usage.completion_tokens_details;
  }
  return answer;
};

// service/opencode-protocol.ts
import { Transform } from "node:stream";
import { StringDecoder } from "node:string_decoder";
var cleanModelId = (modelId) => {
  const clean = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  return clean.startsWith("blackrouter/") ? clean.slice("blackrouter/".length) : clean;
};
var resolveOpenCodeLane = (upstream, modelId) => {
  let isOpenCode = false;
  try {
    const hostname = new URL(upstream).hostname.toLowerCase();
    isOpenCode = hostname === "opencode.ai" || hostname.endsWith(".opencode.ai");
  } catch {
    return "chat";
  }
  if (!isOpenCode)
    return "chat";
  const base = cleanModelId(modelId).split("/").pop()?.toLowerCase() ?? "";
  if (/^muse[-_]?spark(?:$|[-_:.\s])/.test(base))
    return "responses";
  if (/^union[-_]?alpha(?:$|[-_:.\s])/.test(base))
    return "messages";
  return "chat";
};
var parseArgs = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value))
    return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};
var textOf = (value) => {
  if (typeof value === "string")
    return value;
  if (Array.isArray(value)) {
    return value.map((part) => {
      if (!part || typeof part !== "object")
        return "";
      const block = part;
      if (typeof block.text === "string")
        return block.text;
      if (typeof block.content === "string")
        return block.content;
      return "";
    }).join("");
  }
  if (value === null || value === undefined)
    return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};
var textBlocks = (value, role) => {
  if (typeof value === "string") {
    return value ? [{ type: role === "assistant" ? "output_text" : "input_text", [role === "assistant" ? "text" : "text"]: value }] : [];
  }
  if (!Array.isArray(value))
    return [];
  const blocks = [];
  for (const part of value) {
    if (!part || typeof part !== "object")
      continue;
    const block = part;
    if (block.type === "text" && typeof block.text === "string") {
      blocks.push({ type: role === "assistant" ? "output_text" : "input_text", text: block.text });
    } else if (role === "user" && block.type === "image_url") {
      const imageUrl = typeof block.image_url === "string" ? block.image_url : block.image_url?.url;
      if (typeof imageUrl === "string" && imageUrl) {
        blocks.push({ type: "input_image", image_url: imageUrl, detail: block.image_url?.detail || "auto" });
      }
    } else if (role === "user" && (block.type === "input_image" || block.type === "image")) {
      const imageUrl = block.image_url || block.url || block.file_id;
      if (typeof imageUrl === "string" && imageUrl) {
        blocks.push({ type: "input_image", image_url: imageUrl, detail: block.detail || "auto" });
      }
    }
  }
  return blocks;
};
var maxTokensFrom = (body) => {
  for (const key of ["max_output_tokens", "max_completion_tokens", "max_tokens"]) {
    const value = body[key];
    if (typeof value === "number" && Number.isFinite(value) && value > 0)
      return Math.max(16, Math.floor(value));
  }
  return;
};
var responseFormatToText = (responseFormat) => {
  if (!responseFormat || typeof responseFormat !== "object")
    return;
  const rf = responseFormat;
  if (rf.type === "json_object")
    return { format: { type: "json_object" } };
  if (rf.type === "json_schema" && rf.json_schema && typeof rf.json_schema === "object") {
    const schema = rf.json_schema;
    if (!schema.schema)
      return;
    return {
      format: {
        type: "json_schema",
        name: typeof schema.name === "string" && schema.name ? schema.name : "response",
        schema: schema.schema,
        ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
      }
    };
  }
  return;
};
var responseToolChoice = (choice) => {
  if (typeof choice === "string")
    return choice;
  if (!choice || typeof choice !== "object")
    return;
  const value = choice;
  if (value.type === "function" && value.function?.name)
    return { type: "function", name: value.function.name };
  return value;
};
var chatToResponses = (body) => {
  const input = [];
  const instructions = typeof body.instructions === "string" ? [body.instructions] : [];
  const pendingCallIds = [];
  const messages = Array.isArray(body.messages) ? body.messages : [];
  for (const rawMessage of messages) {
    if (!rawMessage || typeof rawMessage !== "object")
      continue;
    const message = rawMessage;
    const role = typeof message.role === "string" ? message.role : "user";
    if (role === "system" || role === "developer") {
      const text = textOf(message.content);
      if (text.trim())
        instructions.push(text);
      continue;
    }
    if (role === "tool" || role === "function") {
      const suppliedId = typeof message.tool_call_id === "string" ? message.tool_call_id : "";
      let callId = suppliedId;
      if (callId) {
        const index = pendingCallIds.indexOf(callId);
        if (index >= 0)
          pendingCallIds.splice(index, 1);
      } else if (pendingCallIds.length > 0) {
        callId = pendingCallIds.shift();
      } else {
        callId = `call_tool_${input.length}`;
      }
      input.push({ type: "function_call_output", call_id: callId.slice(0, 64), output: textOf(message.content) });
      continue;
    }
    if (role === "user" || role === "assistant") {
      const content = textBlocks(message.content, role);
      if (content.length > 0)
        input.push({ type: "message", role, content });
    }
    if (role === "assistant" && Array.isArray(message.tool_calls)) {
      for (const rawCall of message.tool_calls) {
        if (!rawCall || typeof rawCall !== "object")
          continue;
        const call = rawCall;
        const fn = call.function && typeof call.function === "object" ? call.function : {};
        if (typeof fn.name !== "string" || !fn.name.trim())
          continue;
        const callId = (typeof call.id === "string" && call.id ? call.id : `call_${input.length}`).slice(0, 64);
        pendingCallIds.push(callId);
        input.push({
          type: "function_call",
          call_id: callId,
          name: fn.name,
          arguments: typeof fn.arguments === "string" ? fn.arguments : JSON.stringify(fn.arguments ?? {})
        });
      }
    }
  }
  if (input.length === 0)
    input.push({ type: "message", role: "user", content: [{ type: "input_text", text: "..." }] });
  const result = {
    model: cleanModelId(typeof body.model === "string" ? body.model : ""),
    input,
    stream: true,
    store: false
  };
  if (instructions.length)
    result.instructions = instructions.join(`

`);
  const maxTokens = maxTokensFrom(body);
  if (maxTokens !== undefined)
    result.max_output_tokens = maxTokens;
  for (const key of ["temperature", "top_p", "parallel_tool_calls", "metadata", "include"]) {
    if (body[key] !== undefined)
      result[key] = body[key];
  }
  if (body.reasoning && typeof body.reasoning === "object")
    result.reasoning = body.reasoning;
  else if (typeof body.reasoning_effort === "string" && body.reasoning_effort !== "auto") {
    result.reasoning = { effort: body.reasoning_effort === "max" ? "xhigh" : body.reasoning_effort, summary: "auto" };
  }
  const tools = Array.isArray(body.tools) ? body.tools : [];
  const responseTools = [];
  for (const rawTool of tools) {
    if (!rawTool || typeof rawTool !== "object")
      continue;
    const tool = rawTool;
    const fn = tool.function && typeof tool.function === "object" ? tool.function : tool;
    if (typeof fn.name !== "string" || !fn.name)
      continue;
    responseTools.push({
      type: "function",
      name: fn.name,
      ...typeof fn.description === "string" ? { description: fn.description } : {},
      parameters: fn.parameters && typeof fn.parameters === "object" ? fn.parameters : { type: "object", properties: {} },
      ...typeof fn.strict === "boolean" ? { strict: fn.strict } : {}
    });
  }
  if (responseTools.length)
    result.tools = responseTools;
  const toolChoice = responseToolChoice(body.tool_choice);
  if (toolChoice !== undefined)
    result.tool_choice = toolChoice;
  const text = responseFormatToText(body.response_format);
  if (text)
    result.text = text.format;
  return result;
};
var imageBlockToMessages = (part) => {
  const imageUrl = typeof part.image_url === "string" ? part.image_url : part.image_url?.url;
  if (typeof imageUrl !== "string" || !imageUrl)
    return null;
  const dataMatch = /^data:([^;]+);base64,(.+)$/s.exec(imageUrl);
  if (dataMatch) {
    return { type: "image", source: { type: "base64", media_type: dataMatch[1], data: dataMatch[2] } };
  }
  return { type: "image", source: { type: "url", url: imageUrl } };
};
var contentToMessages = (value) => {
  if (typeof value === "string")
    return value ? [{ type: "text", text: value }] : [];
  if (!Array.isArray(value))
    return [];
  const blocks = [];
  for (const rawPart of value) {
    if (!rawPart || typeof rawPart !== "object")
      continue;
    const part = rawPart;
    if (part.type === "text" && typeof part.text === "string")
      blocks.push({ type: "text", text: part.text });
    else if (part.type === "image_url") {
      const image = imageBlockToMessages(part);
      if (image)
        blocks.push(image);
    }
  }
  return blocks;
};
var mergeMessageTurns = (messages) => {
  const merged = [];
  for (const message of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === message.role && Array.isArray(last.content) && Array.isArray(message.content)) {
      last.content.push(...message.content);
    } else {
      merged.push({ ...message, content: Array.isArray(message.content) ? [...message.content] : message.content });
    }
  }
  return merged;
};
var chatToMessages = (body) => {
  const messages = [];
  const systemParts = typeof body.system === "string" ? [body.system] : [];
  if (typeof body.instructions === "string")
    systemParts.push(body.instructions);
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const pendingToolIds = [];
  for (const rawMessage of rawMessages) {
    if (!rawMessage || typeof rawMessage !== "object")
      continue;
    const message = rawMessage;
    const role = typeof message.role === "string" ? message.role : "user";
    if (role === "system" || role === "developer") {
      const systemText = textOf(message.content);
      if (systemText.trim())
        systemParts.push(systemText);
      continue;
    }
    if (role === "tool" || role === "function") {
      const suppliedId = typeof message.tool_call_id === "string" ? message.tool_call_id : "";
      let callId = suppliedId;
      if (callId) {
        const index = pendingToolIds.indexOf(callId);
        if (index >= 0)
          pendingToolIds.splice(index, 1);
      } else if (pendingToolIds.length > 0) {
        callId = pendingToolIds.shift();
      } else {
        callId = `call_tool_${messages.length}`;
      }
      messages.push({
        role: "user",
        content: [{
          type: "tool_result",
          tool_use_id: callId,
          content: textOf(message.content)
        }]
      });
      continue;
    }
    const content = contentToMessages(message.content);
    if (role === "assistant" && Array.isArray(message.tool_calls)) {
      for (const rawCall of message.tool_calls) {
        if (!rawCall || typeof rawCall !== "object")
          continue;
        const call = rawCall;
        const fn = call.function && typeof call.function === "object" ? call.function : {};
        if (typeof fn.name !== "string" || !fn.name.trim())
          continue;
        const id = typeof call.id === "string" && call.id ? call.id : `call_${messages.length}_${content.length}`;
        pendingToolIds.push(id);
        content.push({ type: "tool_use", id, name: fn.name, input: parseArgs(fn.arguments) });
      }
    }
    if (content.length)
      messages.push({ role: role === "assistant" ? "assistant" : "user", content });
  }
  let tools = [];
  if (Array.isArray(body.tools)) {
    tools = body.tools.flatMap((rawTool) => {
      if (!rawTool || typeof rawTool !== "object")
        return [];
      const tool = rawTool;
      const fn = tool.function && typeof tool.function === "object" ? tool.function : tool;
      if (typeof fn.name !== "string" || !fn.name)
        return [];
      return [{
        name: fn.name,
        ...typeof fn.description === "string" ? { description: fn.description } : {},
        input_schema: fn.parameters && typeof fn.parameters === "object" ? fn.parameters : { type: "object", properties: {} }
      }];
    });
  }
  const result = {
    model: cleanModelId(typeof body.model === "string" ? body.model : ""),
    max_tokens: maxTokensFrom(body) ?? 4096,
    stream: true,
    messages: mergeMessageTurns(messages)
  };
  if (systemParts.length)
    result.system = systemParts.join(`

`);
  if (tools.length)
    result.tools = tools;
  if (typeof body.temperature === "number")
    result.temperature = body.temperature;
  if (typeof body.top_p === "number")
    result.top_p = body.top_p;
  if (Array.isArray(body.stop))
    result.stop_sequences = body.stop;
  if (body.metadata && typeof body.metadata === "object")
    result.metadata = body.metadata;
  if (body.tool_choice !== undefined) {
    const choice = body.tool_choice;
    if (typeof choice === "string") {
      if (choice === "required")
        result.tool_choice = { type: "any" };
      else
        result.tool_choice = { type: choice === "none" ? "none" : "auto" };
    } else if (choice && typeof choice === "object") {
      const rawChoice = choice;
      if (rawChoice.type === "function" && rawChoice.function?.name)
        result.tool_choice = { type: "tool", name: rawChoice.function.name };
      else if (rawChoice.type === "required" || rawChoice.type === "any")
        result.tool_choice = { type: "any" };
      else
        result.tool_choice = { type: "auto" };
    }
  }
  return result;
};
var prepareOpenCodeRequestBody = (raw, lane, normalizeChatModelId = false) => {
  if (lane === "chat" && !normalizeChatModelId)
    return raw;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The prepared upstream request is not JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The prepared upstream request must be a JSON object.");
  }
  const body = parsed;
  if (lane === "chat") {
    if (typeof body.model === "string")
      body.model = cleanModelId(body.model);
    return JSON.stringify(body);
  }
  return JSON.stringify(lane === "responses" ? chatToResponses(body) : chatToMessages(body));
};
var parseFrame = (frame) => {
  const lines = frame.split(/\r?\n/);
  let event = "";
  const data = [];
  for (const line of lines) {
    if (!line || line.startsWith(":"))
      continue;
    if (line.startsWith("event:"))
      event = line.slice(6).trim();
    else if (line.startsWith("data:"))
      data.push(line.slice(5).trimStart());
  }
  if (!data.length)
    return null;
  return { event, data: data.join(`
`) };
};
var responseErrorMessage = (payload) => {
  const response = payload.response && typeof payload.response === "object" ? payload.response : {};
  const error = payload.error && typeof payload.error === "object" ? payload.error : response.error && typeof response.error === "object" ? response.error : payload;
  return typeof error.message === "string" ? error.message : JSON.stringify(error);
};
var createOpenCodeResponseTransform = (lane, requestedModel) => {
  if (lane === "chat")
    return null;
  const decoder = new StringDecoder("utf8");
  let buffer = "";
  let responseId = `chatcmpl-blackrouter-${Date.now()}`;
  const model = cleanModelId(requestedModel);
  const created = Math.floor(Date.now() / 1000);
  let outputTokens = 0;
  let inputTokens = 0;
  let finishReason = "stop";
  let finished = false;
  let sawToolCall = false;
  const responseToolIndices = new Map;
  const responseToolIds = new Map;
  const responseToolArgs = new Map;
  const responseToolArgsDeltaSeen = new Set;
  let responseToolCount = 0;
  const messageToolIndices = new Map;
  const messageToolIds = new Map;
  const messageToolNames = new Map;
  const messageToolArgsDeltaSeen = new Set;
  let messageToolCount = 0;
  let messageStopReason = "end_turn";
  const emitData = (payload) => {
    stream.push(Buffer.from(`data: ${JSON.stringify(payload)}

`));
  };
  const emitChunk = (delta, finish = null, usage) => {
    const chunk = {
      id: responseId,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta, finish_reason: finish }]
    };
    if (usage)
      chunk.usage = usage;
    emitData(chunk);
  };
  const emitToolStart = (index, id, name) => {
    sawToolCall = true;
    emitChunk({ tool_calls: [{ index, id, type: "function", function: { name, arguments: "" } }] });
  };
  const emitError = (payload) => {
    if (finished)
      return;
    emitData({ error: { type: "upstream_error", message: responseErrorMessage(payload) } });
    emitData({ choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
    stream.push(Buffer.from(`data: [DONE]

`));
    finished = true;
  };
  const emitFinish = (reason, usage) => {
    if (finished)
      return;
    const normalizedReason = sawToolCall ? "tool_calls" : reason;
    const finalUsage = usage ?? (inputTokens || outputTokens ? {
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens
    } : undefined);
    emitChunk({}, normalizedReason, finalUsage);
    stream.push(Buffer.from(`data: [DONE]

`));
    finished = true;
  };
  const processResponsesEvent = (event, payload) => {
    const type = event || (typeof payload.type === "string" ? payload.type : "");
    if (type === "response.created" || type === "response.in_progress") {
      const responseObject = payload.response && typeof payload.response === "object" ? payload.response : {};
      if (typeof responseObject.id === "string")
        responseId = responseObject.id;
      if (typeof responseObject.model === "string")
        responseId = responseObject.id || responseId;
      return;
    }
    if (type === "response.output_text.delta" || type === "response.text.delta") {
      if (typeof payload.delta === "string" && payload.delta)
        emitChunk({ content: payload.delta });
      return;
    }
    if (type === "response.reasoning_summary_text.delta" || type === "response.reasoning_text.delta" || type === "response.thought.delta") {
      if (typeof payload.delta === "string" && payload.delta)
        emitChunk({ reasoning_content: payload.delta });
      return;
    }
    if (type === "response.refusal.delta") {
      if (typeof payload.delta === "string" && payload.delta)
        emitChunk({ content: payload.delta });
      return;
    }
    if (type === "response.output_item.added") {
      const item = payload.item && typeof payload.item === "object" ? payload.item : null;
      if (!item || item.type !== "function_call" && item.type !== "custom_tool_call")
        return;
      const callId = typeof item.call_id === "string" && item.call_id || typeof item.id === "string" && item.id || `call_${responseToolCount}`;
      const itemId = typeof payload.item_id === "string" ? payload.item_id : typeof item.id === "string" ? item.id : callId;
      let index = responseToolIndices.get(itemId) ?? responseToolIndices.get(callId);
      if (index === undefined) {
        index = responseToolCount++;
        responseToolIndices.set(itemId, index);
        responseToolIndices.set(callId, index);
      }
      responseToolIds.set(itemId, callId);
      responseToolIds.set(callId, callId);
      const name = typeof item.name === "string" ? item.name : "";
      if (name)
        emitToolStart(index, callId, name);
      const args = typeof item.arguments === "string" ? item.arguments : "";
      if (args)
        responseToolArgs.set(index, args);
      return;
    }
    if (type === "response.function_call_arguments.delta" || type === "response.custom_tool_call_input.delta") {
      const itemId = typeof payload.item_id === "string" ? payload.item_id : "";
      const rawCallId = typeof payload.call_id === "string" ? payload.call_id : "";
      let index = responseToolIndices.get(itemId);
      if (index === undefined && rawCallId)
        index = responseToolIndices.get(rawCallId);
      if (index === undefined) {
        index = responseToolCount++;
        const key = itemId || rawCallId || `call_${index}`;
        const callId = rawCallId || key;
        responseToolIndices.set(key, index);
        responseToolIndices.set(callId, index);
        responseToolIds.set(key, callId);
        responseToolIds.set(callId, callId);
        emitToolStart(index, callId, typeof payload.name === "string" ? payload.name : "");
      }
      const callId = responseToolIds.get(itemId) || responseToolIds.get(rawCallId) || rawCallId || `call_${index}`;
      const delta = typeof payload.delta === "string" ? payload.delta : "";
      if (delta) {
        responseToolArgsDeltaSeen.add(index);
        responseToolArgs.set(index, (responseToolArgs.get(index) ?? "") + delta);
        emitChunk({ tool_calls: [{ index, id: callId, type: "function", function: { arguments: delta } }] });
      }
      return;
    }
    if (type === "response.output_item.done") {
      const item = payload.item && typeof payload.item === "object" ? payload.item : null;
      if (item && (item.type === "function_call" || item.type === "custom_tool_call")) {
        const itemId = typeof payload.item_id === "string" ? payload.item_id : typeof item.id === "string" ? item.id : "";
        const callId = typeof item.call_id === "string" ? item.call_id : itemId;
        const index = responseToolIndices.get(itemId) ?? responseToolIndices.get(callId);
        const args = typeof item.arguments === "string" ? item.arguments : index === undefined ? "" : responseToolArgs.get(index) ?? "";
        if (index !== undefined && args && !responseToolArgsDeltaSeen.has(index)) {
          responseToolArgsDeltaSeen.add(index);
          responseToolArgs.set(index, args);
          emitChunk({ tool_calls: [{ index, id: callId, type: "function", function: { arguments: args } }] });
        }
      }
      return;
    }
    if (type === "response.completed") {
      const responseObject = payload.response && typeof payload.response === "object" ? payload.response : {};
      const usage = responseObject.usage && typeof responseObject.usage === "object" ? responseObject.usage : {};
      inputTokens = Number(usage.input_tokens) || 0;
      outputTokens = Number(usage.output_tokens) || 0;
      const output = Array.isArray(responseObject.output) ? responseObject.output : [];
      if (output.some((item) => item && (item.type === "function_call" || item.type === "custom_tool_call")))
        sawToolCall = true;
      emitFinish("stop", inputTokens || outputTokens ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: Number(usage.total_tokens) || inputTokens + outputTokens } : undefined);
      return;
    }
    if (type === "response.incomplete") {
      emitFinish("length");
      return;
    }
    if (type === "response.failed" || type === "error") {
      emitError(payload);
    }
  };
  const processMessagesEvent = (event, payload) => {
    const type = event || (typeof payload.type === "string" ? payload.type : "");
    if (type === "message_start") {
      const message = payload.message && typeof payload.message === "object" ? payload.message : {};
      if (typeof message.id === "string")
        responseId = message.id;
      const usage = message.usage && typeof message.usage === "object" ? message.usage : {};
      inputTokens = Number(usage.input_tokens) || 0;
      return;
    }
    if (type === "content_block_start") {
      const block = payload.content_block && typeof payload.content_block === "object" ? payload.content_block : {};
      const index = Number(payload.index) || 0;
      if (block.type === "text" && typeof block.text === "string" && block.text) {
        emitChunk({ content: block.text });
      } else if (block.type === "thinking" && typeof block.thinking === "string" && block.thinking) {
        emitChunk({ reasoning_content: block.thinking });
      } else if (block.type === "tool_use") {
        let toolIndex = messageToolIndices.get(index);
        if (toolIndex === undefined) {
          toolIndex = messageToolCount++;
          messageToolIndices.set(index, toolIndex);
        }
        const id = typeof block.id === "string" && block.id ? block.id : `call_${toolIndex}`;
        const name = typeof block.name === "string" ? block.name : "";
        messageToolIds.set(index, id);
        messageToolNames.set(index, name);
        emitToolStart(toolIndex, id, name);
        const args = block.input && typeof block.input === "object" && Object.keys(block.input).length ? JSON.stringify(block.input) : "";
        if (args) {
          messageToolArgsDeltaSeen.add(index);
          emitChunk({ tool_calls: [{ index: toolIndex, id, type: "function", function: { arguments: args } }] });
        }
      }
      return;
    }
    if (type === "content_block_delta") {
      const index = Number(payload.index) || 0;
      const delta = payload.delta && typeof payload.delta === "object" ? payload.delta : {};
      if (delta.type === "text_delta" && typeof delta.text === "string" && delta.text)
        emitChunk({ content: delta.text });
      else if ((delta.type === "thinking_delta" || delta.type === "redacted_thinking_delta") && typeof delta.thinking === "string" && delta.thinking)
        emitChunk({ reasoning_content: delta.thinking });
      else if (delta.type === "input_json_delta" && typeof delta.partial_json === "string" && delta.partial_json) {
        const toolIndex = messageToolIndices.get(index);
        const id = messageToolIds.get(index) || `call_${toolIndex ?? index}`;
        if (toolIndex !== undefined) {
          messageToolArgsDeltaSeen.add(index);
          emitChunk({ tool_calls: [{ index: toolIndex, id, type: "function", function: { arguments: delta.partial_json } }] });
        }
      }
      return;
    }
    if (type === "message_delta") {
      const delta = payload.delta && typeof payload.delta === "object" ? payload.delta : {};
      if (typeof delta.stop_reason === "string")
        messageStopReason = delta.stop_reason;
      const usage = payload.usage && typeof payload.usage === "object" ? payload.usage : {};
      outputTokens = Number(usage.output_tokens) || outputTokens;
      return;
    }
    if (type === "message_stop") {
      const reason = messageStopReason === "tool_use" ? "tool_calls" : messageStopReason === "max_tokens" ? "length" : "stop";
      emitFinish(reason, inputTokens || outputTokens ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens } : undefined);
      return;
    }
    if (type === "error")
      emitError(payload);
  };
  const processFrame = (rawFrame) => {
    const frame = parseFrame(rawFrame);
    if (!frame || frame.data === "[DONE]") {
      if (frame?.data === "[DONE]")
        emitFinish(finishReason);
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(frame.data);
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return;
    const payload = parsed;
    if (payload.error && typeof payload.error === "object") {
      emitError(payload);
      return;
    }
    if (lane === "responses")
      processResponsesEvent(frame.event, payload);
    else
      processMessagesEvent(frame.event, payload);
  };
  const stream = new Transform({
    transform(chunk, _encoding, callback) {
      try {
        buffer += typeof chunk === "string" ? chunk : decoder.write(chunk);
        let separator = /\r?\n\r?\n/.exec(buffer);
        while (separator && separator.index !== undefined) {
          const frame = buffer.slice(0, separator.index);
          buffer = buffer.slice(separator.index + separator[0].length);
          processFrame(frame);
          separator = /\r?\n\r?\n/.exec(buffer);
        }
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
    flush(callback) {
      try {
        buffer += decoder.end();
        if (buffer.trim())
          processFrame(buffer);
        if (!finished)
          emitFinish(finishReason);
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });
  return stream;
};

// service/zen.ts
import { randomBytes as randomBytes2 } from "node:crypto";

// service/rtk.ts — source-compatible facade for the vendored 9Router RTK module.
var compressMessages = (body, enabled) => {
  const stats = upstreamCompressMessages(body, enabled);
  return Boolean(stats && stats.hits && stats.hits.length);
};

// service/zen.ts
var BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var FINGERPRINT_TOOLS = ["read", "shell"];
var FINGERPRINT_TOOL_DEFINITIONS = {
  read: {
    name: "read",
    description: "Read the contents of a file or directory. Supports text files, images, and PDFs. Images and PDFs are presented directly to the model. Each text line is prefixed by its 1-based line number as <line>: <content>. The prefix is for reference and is not part of the file content. Directory entries are returned one per line. Use offset and limit to read large files or directories in sections. Prefer one larger read over many small slices, and use grep to find specific content in large files.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or directory to read" },
        offset: {
          type: "integer",
          minimum: 0,
          description: "The line or directory entry to start reading from (1-based)"
        },
        limit: {
          type: "integer",
          minimum: 0,
          description: "The maximum number of lines or directory entries to read (defaults to and capped at 2000)"
        }
      },
      required: ["path"],
      additionalProperties: false
    }
  },
  shell: {
    name: "shell",
    description: "Execute a shell command and return its output. Commands run on Linux using bash. Quote file paths containing spaces or special characters. Prefer dedicated tools over shell commands when possible. When output is large, the full result is saved to a file and a truncated preview is returned. Rely on automatic truncation unless filtering the output is more useful. Commands accept an optional timeout, background commands have no timeout by default. Background commands return immediately, and you will be notified when they complete.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command string to execute" },
        workdir: {
          type: "string",
          description: "Working directory to execute the command in. Defaults to the current working directory. When possible, avoid changing directories in the command and set the working directory here instead."
        },
        timeout: {
          type: "integer",
          minimum: 0,
          description: "Timeout in milliseconds. Set to 0 to disable the timeout. Defaults to 120000 for foreground commands. Background commands have no timeout by default."
        },
        background: {
          type: "boolean",
          description: "Run the command in the background and return immediately (useful for dev servers and long-running builds). You do not need to use '&' at the end of the command when using this parameter. You will be notified when it completes. DO NOT poll for completion."
        }
      },
      required: ["command"],
      additionalProperties: false
    }
  }
};
var randomTail = () => {
  const bytes = randomBytes2(14);
  let out = "";
  for (let index = 0;index < 14; index += 1)
    out += BASE62[(bytes[index] ?? 0) % 62];
  return out;
};
var sessionId = (now = Date.now()) => {
  const prefix = (~(BigInt(now) * 0x1000n + 1n) & (1n << 48n) - 1n).toString(16).padStart(12, "0");
  return `ses_${prefix}${randomTail()}`;
};
var freeTierHeaders = (session) => ({
  authorization: "Bearer public",
  "user-agent": "opencode/latest/2.0.26/cli",
  "x-opencode-client": "cli",
  "x-opencode-project": "global",
  "x-opencode-session": session,
  "x-opencode-session-id": session,
  "x-session-affinity": session,
  "x-session-id": session
});
var toolNameOf = (tool) => {
  if (!isJsonObject(tool))
    return "";
  const fn = isJsonObject(tool.function) ? tool.function : null;
  if (typeof tool.name === "string" && tool.name.trim())
    return tool.name.trim();
  if (fn && typeof fn.name === "string")
    return fn.name.trim();
  return "";
};
var ensureFreeTierTools = (body) => {
  const tools = Array.isArray(body.tools) ? body.tools : [];
  const present = new Set(tools.map((tool) => toolNameOf(tool)).filter((name) => name.length > 0));
  for (const name of FINGERPRINT_TOOLS) {
    if (present.has(name))
      continue;
    const def = FINGERPRINT_TOOL_DEFINITIONS[name];
    tools.push({
      type: "function",
      function: {
        name: def.name,
        description: def.description,
        parameters: def.parameters
      }
    });
  }
  body.tools = tools;
};
var prepareChat = (raw, options) => {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The request body is not JSON.");
  }
  if (!isJsonObject(parsed)) {
    throw new Error("The request body must be a JSON object.");
  }
  const stream = parsed.stream === true;
  const model = typeof parsed.model === "string" ? parsed.model : "";
  if (!parsed.messages) {
    throw new Error("The request body has no messages.");
  }
  const effectiveOptions = typeof options === "boolean" ? { rtkEnabled: options } : options ?? {};
  applyTokenSaverStyles(parsed, effectiveOptions.cavemanLevel ?? "off", effectiveOptions.ponytailLevel ?? "off");
  const openCodeFreeTier = effectiveOptions.openCodeFreeTier ?? true;
  if (openCodeFreeTier) {
    ensureFreeTierTools(parsed);
    if (Array.isArray(parsed.messages)) {
      for (const msg of parsed.messages) {
        if (isJsonObject(msg) && msg.role === "assistant") {
          if (typeof msg.reasoning_content !== "string" || msg.reasoning_content.length === 0) {
            msg.reasoning_content = " ";
          }
        }
      }
    }
  }
  const rtkEnabled = effectiveOptions.rtkEnabled ?? true;
  if (rtkEnabled) {
    compressMessages(parsed, true);
  }
  if (parsed.max_completion_tokens !== undefined && parsed.max_tokens === undefined) {
    parsed.max_tokens = parsed.max_completion_tokens;
  }
  if (parsed.reasoning_effort === "auto") {
    delete parsed.reasoning_effort;
  }
  parsed.stream = true;
  return { body: JSON.stringify(parsed), stream, model };
};

// service/usage-observer.ts
import { Transform as Transform2 } from "node:stream";
import { StringDecoder as StringDecoder2 } from "node:string_decoder";
var objectOf = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
var tokenCount = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
var extractTokenUsage = (payload) => {
  const root = objectOf(payload);
  if (!root)
    return null;
  const response = objectOf(root.response);
  const message = objectOf(root.message);
  const usage = objectOf(root.usage) ?? objectOf(response?.usage) ?? objectOf(message?.usage);
  if (!usage)
    return null;
  const inputTokens = tokenCount(usage.prompt_tokens) ?? tokenCount(usage.input_tokens);
  const outputTokens = tokenCount(usage.completion_tokens) ?? tokenCount(usage.output_tokens);
  const totalTokens = tokenCount(usage.total_tokens) ?? (inputTokens !== undefined && outputTokens !== undefined ? inputTokens + outputTokens : undefined);
  if (inputTokens === undefined && outputTokens === undefined && totalTokens === undefined)
    return null;
  return {
    ...inputTokens !== undefined ? { inputTokens } : {},
    ...outputTokens !== undefined ? { outputTokens } : {},
    ...totalTokens !== undefined ? { totalTokens } : {}
  };
};
var inspectSseFrame = (frame, onUsage) => {
  const data = [];
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith("data:"))
      data.push(line.slice(5).trimStart());
  }
  if (!data.length)
    return;
  const raw = data.join(`
`).trim();
  if (!raw || raw === "[DONE]")
    return;
  try {
    const payload = JSON.parse(raw);
    const usage = extractTokenUsage(payload);
    if (usage)
      onUsage(usage);
  } catch {}
};
var createUsageObserver = (onUsage) => {
  const decoder = new StringDecoder2("utf8");
  let buffer = "";
  const inspect = (text) => {
    buffer += text;
    let match = /\r?\n\r?\n/.exec(buffer);
    while (match && match.index !== undefined) {
      const frame = buffer.slice(0, match.index);
      buffer = buffer.slice(match.index + match[0].length);
      inspectSseFrame(frame, (usage) => {
        try {
          onUsage(usage);
        } catch {}
      });
      match = /\r?\n\r?\n/.exec(buffer);
    }
    if (buffer.length > 1024 * 1024) {
      buffer = buffer.slice(-64 * 1024);
    }
  };
  return new Transform2({
    transform(chunk, _encoding, callback) {
      try {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        inspect(decoder.write(bytes));
        this.push(bytes);
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
    flush(callback) {
      try {
        inspect(decoder.end());
        if (buffer.trim()) {
          inspectSseFrame(buffer, (usage) => {
            try {
              onUsage(usage);
            } catch {}
          });
        }
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });
};

// service/upstream.ts
class TunnelAgent extends https2.Agent {
  proxyUrl;
  constructor(proxyUrlString) {
    super({ keepAlive: true });
    this.proxyUrl = new URL(proxyUrlString);
  }
  createConnection(options, callback) {
    const proxyPort = Number(this.proxyUrl.port) || (this.proxyUrl.protocol === "https:" ? 443 : 80);
    const proxyHost = this.proxyUrl.hostname;
    const targetHost = options.host || "opencode.ai";
    const targetPort = options.port || 443;
    const connectHeaders = {
      Host: `${targetHost}:${targetPort}`,
      "User-Agent": "BlackRouter"
    };
    if (this.proxyUrl.username || this.proxyUrl.password) {
      connectHeaders["Proxy-Authorization"] = `Basic ${Buffer.from(`${decodeURIComponent(this.proxyUrl.username)}:${decodeURIComponent(this.proxyUrl.password)}`).toString("base64")}`;
    }
    const proxyTransport = this.proxyUrl.protocol === "https:" ? https2 : http2;
    const connectReq = proxyTransport.request({
      host: proxyHost,
      port: proxyPort,
      method: "CONNECT",
      path: `${targetHost}:${targetPort}`,
      headers: connectHeaders
    });
    connectReq.on("connect", (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        callback?.(new Error(`Proxy CONNECT to ${targetHost}:${targetPort} failed with HTTP ${res.statusCode}`), socket);
        return;
      }
      const tlsSocket = tls.connect({
        socket,
        servername: targetHost
      }, () => {
        callback?.(null, tlsSocket);
      });
      tlsSocket.on("error", (err) => {
        socket.destroy();
        callback?.(err, socket);
      });
    });
    connectReq.on("error", (err) => {
      callback?.(err, null);
    });
    connectReq.end();
    return null;
  }
}
var createTunnelAgent = (proxyUrlString) => new TunnelAgent(proxyUrlString);
var isOpenCodeUpstream = (upstream) => {
  try {
    const hostname = new URL(upstream).hostname.toLowerCase();
    return hostname === "opencode.ai" || hostname.endsWith(".opencode.ai");
  } catch {
    return false;
  }
};
var hasSameUpstreamOrigin = (left, right) => {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return left === right;
  }
};
var isMuseSparkModel = (id) => /^muse[-_]?spark(?:$|[-_:.\s])/i.test(id);
var isUnionAlphaModel = (id) => /^union[-_]?alpha(?:$|[-_:.\s])/i.test(id);
var resolveOpencodePath = (call, modelId) => {
  if (call === "models")
    return "/zen/v1/models";
  const clean = (modelId || "").replace(/\([^()]+\)\s*$/, "").trim().toLowerCase();
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  if (isMuseSparkModel(base))
    return "/inference/v1/responses";
  if (isUnionAlphaModel(base))
    return "/inference/v1/messages";
  return "/inference/v1/chat/completions";
};
var buildTarget = (config, call, poolOverride, modelId) => {
  const activePool = poolOverride !== undefined ? poolOverride : (config.proxyPools || []).find((p) => p.isActive && p.proxyUrl.trim()) ?? null;
  const parsed = new URL(config.upstream);
  const isOpenCode = isOpenCodeUpstream(config.upstream);
  const upstreamAuthHeaders = !isOpenCode && config.upstreamApiKey?.trim() ? { authorization: `Bearer ${config.upstreamApiKey.trim()}` } : {};
  let targetOrigin;
  let targetPath;
  if (isOpenCode) {
    targetOrigin = "https://opencode.ai";
    targetPath = resolveOpencodePath(call, modelId);
  } else {
    targetOrigin = `${parsed.protocol}//${parsed.host}`;
    const basePath = parsed.pathname.replace(/\/+$/, "");
    const suffix = call === "models" ? "models" : "chat/completions";
    targetPath = `${basePath}/${suffix}`;
  }
  const upstreamUrl = new URL(targetPath, targetOrigin);
  if (activePool) {
    if (activePool.type === "http") {
      return {
        url: upstreamUrl,
        headers: upstreamAuthHeaders,
        agent: createTunnelAgent(activePool.proxyUrl)
      };
    }
    return {
      url: new URL(activePool.proxyUrl),
      headers: {
        ...upstreamAuthHeaders,
        "x-relay-target": targetOrigin,
        "x-relay-path": targetPath
      }
    };
  }
  return { url: upstreamUrl, headers: upstreamAuthHeaders };
};
var KNOWN_FREE_MODELS = new Set([
  "big-pickle",
  "union-alpha",
  "space-bunny",
  "longcat-2.0"
]);
var isFreeModel = (id) => {
  const clean = id.trim().toLowerCase();
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  return /-free$/i.test(base) || /:free$/i.test(base) || KNOWN_FREE_MODELS.has(base);
};
var freeModelIds = (ids) => ids.map((id) => id.trim()).filter((id) => id.length > 0 && isFreeModel(id));
var BRANDS = {
  ai: "AI",
  api: "API",
  deepseek: "DeepSeek",
  glm: "GLM",
  gpt: "GPT",
  llm: "LLM",
  mimo: "MiMo",
  opencode: "OpenCode",
  qwen: "Qwen",
  vl: "VL"
};
var humanizeModelId = (id) => id.split("-").filter((part) => part.length > 0 && part.toLowerCase() !== "free").map((part) => {
  const brand = BRANDS[part.toLowerCase()];
  if (brand)
    return brand;
  if (/^v\d/i.test(part))
    return `V${part.slice(1)}`;
  if (/^\d/.test(part))
    return part;
  return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
}).join(" ").trim();
var toModels = (ids, rawEntries) => ids.map((id) => {
  const raw = rawEntries?.find((e) => e && e.id === id);
  const meta = resolveModelMetadata(id, raw);
  return {
    id,
    name: raw && typeof raw.name === "string" && raw.name.trim() || humanizeModelId(id) || id,
    limit: meta.limit,
    capabilities: meta.capabilities,
    variants: meta.variants
  };
});
var fetchModelIds = async (config, fetchImpl = fetch) => {
  const target = buildTarget(config, "models");
  const isOpenCode = isOpenCodeUpstream(config.upstream);
  const upstreamUserAgent = isOpenCode ? "opencode/latest/2.0.26/cli" : "BlackRouter/1.0";
  let payload;
  if (target.agent && fetchImpl === fetch) {
    try {
      const data = await new Promise((resolve, reject) => {
        const transport = target.url.protocol === "http:" ? http2 : https2;
        const req = transport.request(target.url, {
          method: "GET",
          agent: target.agent,
          headers: {
            accept: "application/json",
            ...target.headers,
            "user-agent": upstreamUserAgent
          }
        }, (res) => {
          if (res.statusCode !== 200) {
            let errBody = "";
            res.on("data", (d) => {
              errBody += d;
            });
            res.on("end", () => {
              reject(upstreamError(`The model list answered ${res.statusCode}${errBody ? `: ${errBody.slice(0, 200)}` : "."}`));
            });
            return;
          }
          const chunks = [];
          res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });
        req.on("error", (err) => reject(upstreamError(`Could not reach the model list at ${target.url.origin}. ${err.message}`)));
        req.setTimeout(12000, () => {
          req.destroy();
          reject(upstreamError("The model list request timed out."));
        });
        req.end();
      });
      payload = JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("upstream"))
        throw error;
      throw upstreamError(`The model list error: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    let answer;
    try {
      answer = await fetchImpl(target.url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...target.headers,
          "user-agent": upstreamUserAgent
        },
        signal: AbortSignal.timeout(12000)
      });
    } catch (error) {
      throw upstreamError(`Could not reach the model list at ${target.url.origin}. ${error instanceof Error ? error.message : String(error)}`);
    }
    if (answer.status !== 200) {
      const detail = await answer.text().catch(() => "");
      throw upstreamError(`The model list answered ${answer.status}${detail ? `: ${detail.slice(0, 200)}` : "."}`);
    }
    try {
      payload = await answer.json();
    } catch {
      throw upstreamError("The model list was not JSON. A relay may be answering with its own page.");
    }
  }
  const rawEntries = Array.isArray(payload.data) ? payload.data : [];
  const ids = rawEntries.map((entry) => entry && typeof entry.id === "string" ? entry.id.trim() : "").filter((id) => id.length > 0);
  if (ids.length === 0) {
    throw upstreamError("The model list was empty. Check the proxy pool URL and status.");
  }
  return { ids, free: isOpenCode ? freeModelIds(ids) : ids, rawEntries };
};
var FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-encoding",
  "cache-control",
  "retry-after",
  "x-request-id",
  "openai-processing-ms",
  "openai-version"
];
var responseHeaders = (headers) => {
  const picked = {};
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = headers[name];
    if (typeof value === "string")
      picked[name] = value;
  }
  if (!picked["content-type"])
    picked["content-type"] = "application/json";
  return picked;
};
var writeJson = (response, status, body, headers = {}) => {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  response.writeHead(status, { "content-type": "application/json", ...headers });
  response.end(JSON.stringify(body));
};
var writeOpenAiError = (response, status, message, code, headers = {}) => {
  writeJson(response, status, { error: { message, type: "invalid_request_error", code } }, headers);
};
var AGGREGATE_LIMIT_BYTES = 8 * 1024 * 1024;
var proxyChatCompletion = (config, session, prepared, response, pool, onRateLimit, onUsage) => {
  const modelCandidates = resolveModelCandidates(prepared.model, config.fallbackModels ?? [], config.modelCombos ?? []);
  const activePools = (config.proxyPools || []).filter((p) => p.isActive && p.proxyUrl.trim());
  const now = Date.now();
  const healthyPools = activePools.filter((p) => !p.rateLimitedUntil || p.rateLimitedUntil <= now);
  const initialPool = pool ?? null;
  const poolCandidates = initialPool ? [initialPool, ...healthyPools.filter((p) => p.id !== initialPool.id)].slice(0, 2) : activePools.length === 0 ? [null] : healthyPools.slice(0, 2);
  if (activePools.length > 0 && poolCandidates.length === 0) {
    const nextAvailableAt = Math.min(...activePools.map((p) => p.rateLimitedUntil && p.rateLimitedUntil > now ? p.rateLimitedUntil : now + 5 * 60000));
    const retryAfter = Math.max(1, Math.ceil((nextAvailableAt - now) / 1000));
    writeOpenAiError(response, 429, "All configured proxy pools are cooling down. Wait before retrying the upstream.", "rate_limit_exhausted", { "retry-after": String(retryAfter) });
    return;
  }
  const attempts = modelCandidates.flatMap((model) => poolCandidates.map((candidatePool) => ({ model, pool: candidatePool })));
  let attemptIndex = 0;
  let lastRequestedModel = prepared.model;
  const fallbackReasons = [];
  const rateLimitedPoolIds = new Set;
  const advanceToNextAttempt = () => {
    let nextIndex = attemptIndex + 1;
    while (nextIndex < attempts.length) {
      const nextAttempt = attempts[nextIndex];
      if (nextAttempt?.pool && rateLimitedPoolIds.has(nextAttempt.pool.id)) {
        nextIndex += 1;
        continue;
      }
      break;
    }
    if (nextIndex >= attempts.length)
      return false;
    attemptIndex = nextIndex;
    return true;
  };
  const routingHeaders = (attempt) => ({
    "x-blackrouter-requested-model": prepared.model,
    "x-blackrouter-resolved-model": attempt.model,
    "x-blackrouter-resolved-pool": attempt.pool?.name ?? "Direct",
    ...attempt.model !== prepared.model ? { "x-blackrouter-fallback-used": "true" } : {},
    ...fallbackReasons.length > 0 ? { "x-blackrouter-fallback-reason": fallbackReasons.join(" -> ") } : {}
  });
  const modelAwareBody = (model) => {
    const lane = resolveOpenCodeLane(config.upstream, model);
    let raw = prepared.body;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        parsed.model = model;
        raw = JSON.stringify(parsed);
      }
    } catch {}
    const isOpenCode = isOpenCodeUpstream(config.upstream);
    return {
      lane,
      body: prepareOpenCodeRequestBody(raw, lane, isOpenCode)
    };
  };
  const sendAttempt = () => {
    if (response.destroyed || response.writableEnded)
      return;
    const attempt = attempts[attemptIndex];
    if (!attempt) {
      writeOpenAiError(response, 502, "No model fallback attempt was available.", "fallback_exhausted");
      return;
    }
    lastRequestedModel = attempt.model;
    const candidate = attempt.pool;
    let lane;
    let upstreamBody;
    try {
      const preparedForModel = modelAwareBody(attempt.model);
      lane = preparedForModel.lane;
      upstreamBody = preparedForModel.body;
    } catch (error) {
      writeOpenAiError(response, 400, error instanceof Error ? error.message : "Could not convert the OpenCode request body.", "invalid_request");
      return;
    }
    const target = buildTarget(config, "chat", candidate, attempt.model);
    const transport = target.url.protocol === "http:" ? http2 : https2;
    const upstream = transport.request(target.url, {
      method: "POST",
      agent: target.agent,
      headers: {
        ...isOpenCodeUpstream(config.upstream) ? freeTierHeaders(session) : {},
        ...target.headers,
        ...lane === "messages" ? { "anthropic-version": "2023-06-01" } : {},
        "content-type": "application/json",
        accept: "text/event-stream",
        "content-length": String(Buffer.byteLength(upstreamBody))
      }
    }, (answer) => {
      const status = answer.statusCode ?? 502;
      const retryAfterHeader = answer.headers["retry-after"];
      const retryAfter = typeof retryAfterHeader === "string" ? retryAfterHeader : undefined;
      const isShortDirect429 = status === 429 && candidate === null && retryAfter !== undefined && parseRetryAfterMs(retryAfter) <= 2000;
      if (status === 429) {
        if (candidate)
          rateLimitedPoolIds.add(candidate.id);
        onRateLimit?.(candidate, retryAfter);
      }
      if (shouldAdvanceAfterStatus(status, candidate !== null, isShortDirect429)) {
        if (advanceToNextAttempt()) {
          fallbackReasons.push(`HTTP ${status} on ${attempt.model}`);
          answer.resume();
          if (isShortDirect429) {
            const waitMs = parseRetryAfterMs(retryAfter);
            const jitterMs = 100 + Math.floor(Math.random() * 301);
            setTimeout(() => {
              if (!response.destroyed && !response.writableEnded)
                sendAttempt();
            }, waitMs + jitterMs);
          } else {
            sendAttempt();
          }
          return;
        }
      }
      const routeHeaders = routingHeaders(attempt);
      for (const [name, value] of Object.entries(routeHeaders))
        response.setHeader(name, value);
      if (status < 200 || status >= 300) {
        response.writeHead(status, {
          ...responseHeaders(answer.headers),
          ...routeHeaders
        });
        pipeline(answer, response, () => {});
        return;
      }
      const contentType = typeof answer.headers["content-type"] === "string" ? answer.headers["content-type"].toLowerCase() : "";
      const protocolTransform = lane !== "chat" && contentType.includes("text/event-stream") ? createOpenCodeResponseTransform(lane, attempt.model) : null;
      const successHeaders = {
        ...responseHeaders(answer.headers),
        ...routeHeaders
      };
      if (prepared.stream) {
        response.writeHead(status, successHeaders);
        const observer = createUsageObserver((usage) => onUsage?.(usage));
        if (protocolTransform) {
          pipeline(answer, protocolTransform, observer, response, () => {});
        } else {
          pipeline(answer, observer, response, () => {});
        }
        return;
      }
      const chunks = [];
      let size = 0;
      const collect = (chunk) => {
        const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += value.length;
        if (size <= AGGREGATE_LIMIT_BYTES)
          chunks.push(value);
      };
      const source = protocolTransform ?? answer;
      source.on("data", collect);
      source.on("end", () => {
        const completion = aggregateStream(Buffer.concat(chunks).toString("utf8"));
        const usage = extractTokenUsage(completion);
        if (usage)
          onUsage?.(usage);
        writeJson(response, status, completion, successHeaders);
      });
      source.on("error", (error) => {
        writeOpenAiError(response, 502, `The upstream stream broke: ${error.message}`, "upstream_unreachable");
      });
      answer.on("error", (error) => {
        writeOpenAiError(response, 502, `The upstream stream broke: ${error.message}`, "upstream_unreachable");
      });
      if (protocolTransform)
        answer.pipe(protocolTransform);
    });
    upstream.on("error", (error) => {
      if (!response.headersSent && !response.destroyed && advanceToNextAttempt()) {
        fallbackReasons.push(`network error on ${lastRequestedModel}`);
        sendAttempt();
        return;
      }
      const finalAttempt = attempt;
      const routeHeaders = routingHeaders(finalAttempt);
      for (const [name, value] of Object.entries(routeHeaders))
        response.setHeader(name, value);
      writeOpenAiError(response, 502, `The upstream did not answer for ${lastRequestedModel}: ${error.message}`, "upstream_unreachable", routeHeaders);
    });
    response.on("close", () => {
      if (!response.writableEnded)
        upstream.destroy();
    });
    upstream.end(upstreamBody);
  };
  sendAttempt();
};

// service/router-server.ts
var BODY_LIMIT_BYTES = 64 * 1024 * 1024;
var tokenMatches = (expected, provided) => {
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length || left.length === 0)
    return false;
  return timingSafeEqual(left, right);
};
var resolveRequestSession = (request, fallback) => {
  const headers = request.headers;
  const candidate = headers["x-opencode-session"] || headers["x-opencode-session-id"] || headers["x-session-id"] || headers["x-session-affinity"];
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    if (trimmed.length > 0 && trimmed.length <= 256)
      return trimmed;
  }
  return fallback;
};
var presentedKey = (request) => {
  const header = request.headers["x-api-key"];
  if (typeof header === "string" && header.trim())
    return header.trim();
  const authorization = request.headers.authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() ?? "";
};
var writeRateLimitedError = (response, until, message) => {
  const retrySeconds = Math.max(1, Math.ceil((until - Date.now()) / 1000));
  response.writeHead(429, {
    "content-type": "application/json",
    "retry-after": String(retrySeconds)
  });
  response.end(JSON.stringify({
    error: {
      message,
      type: "rate_limit_error",
      code: "rate_limit_exhausted"
    }
  }));
};
var readBody = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size > BODY_LIMIT_BYTES) {
      reject(new Error("The request body is too large."));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  request.on("error", reject);
});
var startRouterServer = (deps) => new Promise((resolve, reject) => {
  const session = sessionId();
  const server = http3.createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const started = Date.now();
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "authorization, content-type, x-api-key",
        "access-control-allow-methods": "GET, POST, OPTIONS"
      });
      response.end();
      return;
    }
    if (url.pathname === "/healthz") {
      writeJson(response, 200, { ok: true, name: "blackrouter" });
      return;
    }
    const config = deps.getConfig();
    if (!tokenMatches(config.apiKey, presentedKey(request))) {
      writeOpenAiError(response, 401, "The BlackRouter API key is missing or wrong.", "invalid_api_key");
      return;
    }
    if (request.method === "GET" && (url.pathname === "/v1/models" || url.pathname === "/models")) {
      const answer = () => {
        const data = deps.getModels().map((model) => ({
          id: model.id,
          object: "model",
          created: 0,
          owned_by: "opencode"
        }));
        writeJson(response, 200, { object: "list", data });
      };
      if (deps.getModels().length > 0) {
        answer();
        return;
      }
      deps.refreshModels().catch(() => {
        return;
      }).then(answer);
      return;
    }
    if (request.method === "POST" && (url.pathname === "/v1/chat/completions" || url.pathname === "/chat/completions")) {
      readBody(request).then((body) => {
        const prepared = prepareChat(body, {
          rtkEnabled: config.rtkEnabled,
          cavemanLevel: config.cavemanLevel,
          ponytailLevel: config.ponytailLevel,
          openCodeFreeTier: isOpenCodeUpstream(config.upstream)
        });
        const pool = deps.pickPool ? deps.pickPool() : null;
        const tokenUsage = {};
        response.on("close", () => {
          const resolvedModel = response.getHeader("x-blackrouter-resolved-model");
          const resolvedPool = response.getHeader("x-blackrouter-resolved-pool");
          const fallbackReason = response.getHeader("x-blackrouter-fallback-reason");
          const fallbackUsed = response.getHeader("x-blackrouter-fallback-used") === "true";
          const status = response.statusCode;
          deps.record({
            at: started,
            method: "POST",
            path: "/v1/chat/completions",
            model: typeof resolvedModel === "string" ? resolvedModel : prepared.model,
            requestedModel: prepared.model,
            status,
            ms: Date.now() - started,
            poolName: typeof resolvedPool === "string" ? resolvedPool : pool ? pool.name : "Direct",
            fallbackUsed,
            ...typeof fallbackReason === "string" ? { fallbackReason } : {},
            ...tokenUsage.inputTokens !== undefined ? { inputTokens: tokenUsage.inputTokens } : {},
            ...tokenUsage.outputTokens !== undefined ? { outputTokens: tokenUsage.outputTokens } : {},
            ...tokenUsage.totalTokens !== undefined ? { totalTokens: tokenUsage.totalTokens } : {},
            ...typeof status === "number" && status >= 400 ? { error: `HTTP ${status}` } : {}
          });
        });
        const activePoolsExist = config.proxyPools.some((p) => p.isActive && p.proxyUrl.trim());
        if (!pool && !activePoolsExist) {
          const directCooldownUntil = deps.getDirectRateLimitedUntil?.() ?? 0;
          if (directCooldownUntil > Date.now()) {
            writeRateLimitedError(response, directCooldownUntil, "The direct OpenCode upstream is in rate-limit cooldown.");
            return;
          }
        }
        const reqSession = resolveRequestSession(request, session);
        proxyChatCompletion(config, reqSession, prepared, response, pool, (rateLimitedPool, retryAfter) => {
          if (deps.markRateLimited) {
            deps.markRateLimited(rateLimitedPool, retryAfter);
          } else if (rateLimitedPool) {
            rateLimitedPool.rateLimitedUntil = Date.now() + 5 * 60000;
            rateLimitedPool.testStatus = "error";
            rateLimitedPool.lastError = "Rate limit (HTTP 429)";
            rateLimitedPool.lastTestedAt = Date.now();
          }
        }, (usage) => {
          Object.assign(tokenUsage, usage);
        });
      }).catch((error) => {
        writeOpenAiError(response, 400, error instanceof Error ? error.message : "The request body could not be read.", "invalid_request");
      });
      return;
    }
    writeOpenAiError(response, 404, `BlackRouter has no route for ${request.method} ${url.pathname}.`, "not_found");
  });
  server.on("error", (error) => {
    reject(error.code === "EADDRINUSE" ? new Error(`Port ${deps.getConfig().port} is already in use. Pick another port.`) : error);
  });
  server.listen(deps.getConfig().port, "127.0.0.1", () => {
    resolve({
      close: () => new Promise((done) => {
        server.close(() => done());
        server.closeAllConnections();
      })
    });
  });
});

// service/runtime.ts
var REFRESH_INTERVAL_MS = 10 * 60000;
var REQUEST_LOG_LIMIT = REQUEST_HISTORY_LIMIT;
var PACKAGE_ROOT = path4.dirname(path4.dirname(fileURLToPath(import.meta.url)));
var RELAY_FILES = {
  http: path4.join("relays", "cloudflare", "worker.js"),
  cloudflare: path4.join("relays", "cloudflare", "worker.js"),
  vercel: path4.join("relays", "vercel", "api", "relay.js"),
  netlify: path4.join("relays", "netlify", "functions", "relay.mjs"),
  deno: path4.join("relays", "deno", "main.ts")
};
var createRuntime = (store = createConfigStore()) => {
  let config = store.load();
  const runtimeSession = sessionId();
  const poolSelector = createPoolSelector();
  const modelTestPoolSelector = createPoolSelector();
  let models = [];
  let modelsFetchedAt = null;
  let modelsError = "";
  let upstreamCount = 0;
  let warnings = [];
  const requestHistory = createRequestHistoryStore(store.path);
  const requests = requestHistory.load();
  let router = null;
  let routerError = "";
  let directRateLimitedUntil = 0;
  let refreshTimer = null;
  const configFile = resolveConfigFile();
  const registration = () => readRegistration(configFile);
  const pickedModels = () => {
    const selected = new Set(config.selectedModels);
    return selected.size === 0 ? models : models.filter((model) => selected.has(model.id));
  };
  const modelsToRegister = () => [
    ...pickedModels(),
    ...buildComboRouterModels(config.modelCombos ?? [], models)
  ];
  const preview = () => JSON.stringify({ providers: { [PROVIDER_ID]: buildProviderEntry(config, modelsToRegister()) } }, null, 2);
  let isLoadingModels = false;
  const ensureFreshModels = () => {
    if (isLoadingModels)
      return;
    const isStale = modelsFetchedAt === null || Date.now() - modelsFetchedAt > 5 * 60000;
    if (models.length === 0 || isStale) {
      isLoadingModels = true;
      loadModels().finally(() => {
        isLoadingModels = false;
      });
    }
  };
  const state = () => {
    ensureFreshModels();
    return {
      running: router !== null,
      routerError,
      endpoint: endpointFor(config),
      config: { ...config, upstreamApiKey: "" },
      upstreamApiKeyConfigured: Boolean(config.upstreamApiKey?.trim()),
      models,
      modelsFetchedAt,
      modelsError,
      upstreamCount,
      registration: registration(),
      preview: preview(),
      warnings,
      requests
    };
  };
  const persist = (next) => {
    config = next;
    store.save(next);
  };
  const bindRouter = async () => {
    if (router) {
      await router.close();
      router = null;
    }
    routerError = "";
    try {
      router = await startRouterServer({
        getConfig: () => config,
        getModels: () => modelsToRegister(),
        refreshModels: loadModels,
        pickPool: () => poolSelector.pickPool(config),
        getDirectRateLimitedUntil: () => directRateLimitedUntil,
        markRateLimited: (pool, retryAfter) => {
          const limitedUntil = Date.now() + parseRetryAfterMs(retryAfter);
          if (!pool) {
            directRateLimitedUntil = limitedUntil;
            return;
          }
          const updatedPools = config.proxyPools.map((entry) => entry.id === pool.id ? { ...entry, rateLimitedUntil: limitedUntil, testStatus: "error", lastError: "Rate limit (HTTP 429)", lastTestedAt: Date.now() } : entry);
          persist({ ...config, proxyPools: updatedPools });
        },
        record: (entry) => {
          requests.unshift(entry);
          if (requests.length > REQUEST_LOG_LIMIT)
            requests.length = REQUEST_LOG_LIMIT;
          try {
            requestHistory.save(requests);
          } catch (error) {
            console.warn("[blackrouter] could not persist request history:", error);
          }
        }
      });
    } catch (error) {
      router = null;
      routerError = error instanceof Error ? error.message : String(error);
    }
  };
  const loadModels = async () => {
    try {
      const result = await fetchModelIds(config);
      models = toModels(result.free, result.rawEntries);
      modelsFetchedAt = Date.now();
      modelsError = "";
      upstreamCount = result.ids.length;
      if (models.length > 0) {
        refreshRegistration(false);
      }
    } catch (error) {
      modelsError = error instanceof Error ? error.message : String(error);
    }
  };
  const refreshRegistration = (force = false) => {
    const current = registration();
    if (!current.installed && !force)
      return;
    const result = registerProvider(configFile, config, modelsToRegister());
    warnings = result.warnings;
  };
  return {
    state,
    patchConfig: async (patch) => {
      const previous = config;
      const portChanged = patch.port !== undefined && patch.port !== previous.port;
      const selectionChanged = patch.selectedModels !== undefined && JSON.stringify(patch.selectedModels) !== JSON.stringify(previous.selectedModels);
      const poolsChanged = patch.proxyPools !== undefined && JSON.stringify(patch.proxyPools) !== JSON.stringify(previous.proxyPools);
      const combosChanged = patch.modelCombos !== undefined && JSON.stringify(patch.modelCombos) !== JSON.stringify(previous.modelCombos);
      const upstreamChanged = patch.upstream !== undefined && patch.upstream !== previous.upstream;
      const upstreamOriginChanged = patch.upstream !== undefined && !hasSameUpstreamOrigin(previous.upstream, patch.upstream);
      const upstreamApiKeyChanged = patch.upstreamApiKey !== undefined && patch.upstreamApiKey !== (previous.upstreamApiKey ?? "");
      if (portChanged && patch.port !== undefined) {
        if (patch.port < 1024 || patch.port > 65535) {
          throw badRequest("The port must be between 1024 and 65535.");
        }
      }
      warnings = [];
      const previousPort = previous.port;
      persist({
        ...previous,
        port: patch.port ?? previous.port,
        apiKey: patch.apiKey ?? previous.apiKey,
        upstream: patch.upstream ?? previous.upstream,
        upstreamApiKey: patch.upstreamApiKey !== undefined ? patch.upstreamApiKey : upstreamOriginChanged ? "" : previous.upstreamApiKey ?? "",
        selectedModels: (upstreamChanged || upstreamApiKeyChanged) && patch.selectedModels === undefined ? [] : patch.selectedModels ?? previous.selectedModels,
        fallbackModels: patch.fallbackModels ?? previous.fallbackModels,
        modelCombos: patch.modelCombos ?? previous.modelCombos,
        proxyPools: patch.proxyPools ?? previous.proxyPools,
        proxyStrategy: patch.proxyStrategy ?? previous.proxyStrategy,
        activePoolId: patch.activePoolId !== undefined ? patch.activePoolId : previous.activePoolId,
        stickyLimit: patch.stickyLimit ?? previous.stickyLimit,
        rtkEnabled: patch.rtkEnabled ?? previous.rtkEnabled,
        cavemanLevel: patch.cavemanLevel ?? previous.cavemanLevel,
        ponytailLevel: patch.ponytailLevel ?? previous.ponytailLevel
      });
      if (patch.apiKey && patch.apiKey !== previous.apiKey) {
        refreshRegistration(true);
      }
      if (portChanged) {
        await bindRouter();
        if (routerError) {
          const failure = routerError;
          persist({ ...config, port: previousPort });
          await bindRouter();
          throw new RouterError("port-busy", failure);
        }
        refreshRegistration(true);
      }
      if (upstreamChanged || upstreamApiKeyChanged) {
        directRateLimitedUntil = 0;
        await loadModels();
        refreshRegistration(true);
      } else if (poolsChanged) {
        await loadModels();
      }
      if (selectionChanged || combosChanged) {
        refreshRegistration(true);
      }
      return state();
    },
    rotateKey: async () => {
      warnings = [];
      persist({ ...config, apiKey: createApiKey() });
      refreshRegistration(true);
      return state();
    },
    refreshModels: async () => {
      warnings = [];
      await loadModels();
      if (modelsError) {
        throw new RouterError("upstream", modelsError);
      }
      refreshRegistration();
      return state();
    },
    register: async () => {
      warnings = [];
      const result = registerProvider(configFile, config, modelsToRegister());
      warnings = result.warnings;
      return state();
    },
    unregister: async () => {
      warnings = [];
      const result = removeProvider(configFile);
      warnings = result.warnings;
      return state();
    },
    relaySource: async (kind) => {
      if (kind === "http") {
        return {
          kind: "http",
          code: `// Standard HTTP/HTTPS forward proxy (e.g. Clash, V2Ray, Squid) does not require a worker script.
// Simply configure your proxy URL (e.g. http://127.0.0.1:7890) directly.
`
        };
      }
      const file = RELAY_FILES[kind];
      const code = await readFile(path4.join(PACKAGE_ROOT, file), "utf8");
      return { kind, code };
    },
    createProxyPool: async (input) => {
      const newPool = {
        id: randomUUID(),
        name: input.name.trim(),
        type: input.type,
        proxyUrl: input.proxyUrl.trim(),
        isActive: input.isActive ?? true
      };
      const updatedPools = [...config.proxyPools, newPool];
      persist({ ...config, proxyPools: updatedPools });
      await loadModels();
      return state();
    },
    updateProxyPool: async (id, patch) => {
      const pool = config.proxyPools.find((p) => p.id === id);
      if (!pool)
        throw badRequest(`Proxy pool "${id}" not found.`);
      const updatedPools = config.proxyPools.map((p) => {
        if (p.id !== id)
          return p;
        return {
          ...p,
          name: patch.name !== undefined ? patch.name.trim() : p.name,
          proxyUrl: patch.proxyUrl !== undefined ? patch.proxyUrl.trim() : p.proxyUrl,
          isActive: patch.isActive !== undefined ? patch.isActive : p.isActive
        };
      });
      persist({ ...config, proxyPools: updatedPools });
      await loadModels();
      return state();
    },
    deleteProxyPool: async (id) => {
      const updatedPools = config.proxyPools.filter((p) => p.id !== id);
      persist({ ...config, proxyPools: updatedPools });
      await loadModels();
      return state();
    },
    testProxyPool: async (id) => {
      const pool = config.proxyPools.find((p) => p.id === id);
      if (!pool)
        throw badRequest(`Proxy pool "${id}" not found.`);
      const result = await testRelayOrProxy(pool);
      const updatedPools = config.proxyPools.map((p) => {
        if (p.id !== id)
          return p;
        return {
          ...p,
          testStatus: result.ok ? "active" : "error",
          lastTestedAt: Date.now(),
          lastError: result.error || null,
          rateLimitedUntil: result.ok ? null : p.rateLimitedUntil
        };
      });
      persist({ ...config, proxyPools: updatedPools });
      return result;
    },
    testModel: async (modelId) => {
      const start = Date.now();
      const attempted = new Set;
      const maxAttempts = Math.max(1, config.proxyPools.filter((p) => p.isActive && p.proxyUrl.trim()).length + 1);
      let lastError = "The upstream did not answer.";
      const chatPayload = JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "Reply only with OK." }],
        max_tokens: 8,
        stream: false
      });
      const prepared = prepareChat(chatPayload, {
        rtkEnabled: false,
        openCodeFreeTier: isOpenCodeUpstream(config.upstream)
      });
      for (let attempt = 0;attempt < maxAttempts; attempt += 1) {
        const pool = modelTestPoolSelector.pickPool(config, attempted);
        const activePoolCount = config.proxyPools.filter((p) => p.isActive && p.proxyUrl.trim()).length;
        if (!pool && activePoolCount > 0) {
          lastError = "All configured proxy pools are cooling down. Wait for the upstream rate limit to reset.";
          break;
        }
        if (!pool && activePoolCount === 0 && directRateLimitedUntil > Date.now()) {
          lastError = `The configured upstream is rate-limited. Retry in approximately ${Math.ceil((directRateLimitedUntil - Date.now()) / 1000)} seconds.`;
          break;
        }
        if (pool && attempted.has(pool.id))
          break;
        if (pool)
          attempted.add(pool.id);
        const target = buildTarget(config, "chat", pool, modelId);
        const testHeaders = {
          ...isOpenCodeUpstream(config.upstream) ? freeTierHeaders(runtimeSession) : {},
          ...target.headers,
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        };
        try {
          let resultText = "";
          let status = 200;
          let retryAfter;
          if (target.agent) {
            const answer = await new Promise((resolve, reject) => {
              const transport = target.url.protocol === "http:" ? http4 : https3;
              const req = transport.request(target.url, { method: "POST", agent: target.agent, headers: testHeaders }, (res) => {
                const chunks = [];
                res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
                res.on("end", () => resolve({
                  text: Buffer.concat(chunks).toString("utf8"),
                  status: res.statusCode ?? 502,
                  retryAfter: typeof res.headers["retry-after"] === "string" ? res.headers["retry-after"] : undefined
                }));
              });
              req.on("error", reject);
              req.setTimeout(15000, () => {
                req.destroy();
                reject(new Error("Test request timed out."));
              });
              req.end(prepared.body);
            });
            resultText = answer.text;
            status = answer.status;
            retryAfter = answer.retryAfter;
          } else {
            const answer = await fetch(target.url, {
              method: "POST",
              headers: testHeaders,
              body: prepared.body,
              signal: AbortSignal.timeout(15000)
            });
            resultText = await answer.text();
            status = answer.status;
            retryAfter = answer.headers.get("retry-after") ?? undefined;
          }
          if (status >= 200 && status < 300) {
            const aggregated = aggregateStream(resultText);
            const choices = Array.isArray(aggregated.choices) ? aggregated.choices : [];
            const firstChoice = choices[0];
            const reply = firstChoice?.message?.content?.trim() || "OK";
            return { ok: true, modelId, elapsedMs: Date.now() - start, reply };
          }
          lastError = `HTTP ${status}: ${resultText.slice(0, 300)}`;
          if (status !== 429)
            break;
          const activePoolCount = config.proxyPools.filter((p) => p.isActive && p.proxyUrl.trim()).length;
          if (!pool && activePoolCount === 0) {
            directRateLimitedUntil = Date.now() + parseRetryAfterMs(retryAfter);
            lastError = `HTTP 429: upstream rate-limited; retry after approximately ${Math.ceil((directRateLimitedUntil - Date.now()) / 1000)} seconds.`;
            break;
          }
          if (!pool && activePoolCount > 0) {
            lastError = "All configured proxy pools are cooling down. Wait for the upstream rate limit to reset.";
            break;
          }
          if (pool) {
            const limitedUntil = Date.now() + parseRetryAfterMs(retryAfter);
            const updated = config.proxyPools.map((p) => p.id === pool.id ? { ...p, testStatus: "error", lastTestedAt: Date.now(), lastError: "Rate limit (HTTP 429)", rateLimitedUntil: limitedUntil } : p);
            persist({ ...config, proxyPools: updated });
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          break;
        }
      }
      return {
        ok: false,
        modelId,
        elapsedMs: Date.now() - start,
        error: lastError
      };
    },
    deployCloudflare: async (input) => {
      const res = await deployCloudflare(input);
      const newPool = {
        id: randomUUID(),
        name: res.name,
        type: "cloudflare",
        proxyUrl: res.proxyUrl,
        isActive: true
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },
    deployVercel: async (input) => {
      const res = await deployVercel(input);
      const newPool = {
        id: randomUUID(),
        name: res.name,
        type: "vercel",
        proxyUrl: res.proxyUrl,
        isActive: true
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },
    deployDeno: async (input) => {
      const res = await deployDeno(input);
      const newPool = {
        id: randomUUID(),
        name: res.name,
        type: "deno",
        proxyUrl: res.proxyUrl,
        isActive: true
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },
    deployNetlify: async (input) => {
      const res = await deployNetlify(input);
      const newPool = {
        id: randomUUID(),
        name: res.name,
        type: "netlify",
        proxyUrl: res.proxyUrl,
        isActive: true
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },
    start: async () => {
      await bindRouter();
      loadModels();
      refreshTimer = setInterval(() => {
        loadModels();
      }, REFRESH_INTERVAL_MS);
      refreshTimer.unref();
    },
    stop: async () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      const running = router;
      router = null;
      if (running)
        await running.close();
    }
  };
};

// service/server/respond.ts
var statusFor = (code) => {
  switch (code) {
    case "bad-request":
      return 400;
    case "not-found":
      return 404;
    case "config-unreadable":
      return 409;
    case "no-models":
      return 400;
    case "port-busy":
      return 409;
    case "upstream":
      return 502;
    case "internal":
      return 500;
  }
};
var toServiceResponse = (error) => {
  if (error instanceof RouterError) {
    return {
      status: statusFor(error.code),
      body: { error: { code: error.code, message: error.message } }
    };
  }
  console.error("[blackrouter] the local service failed:", error);
  return {
    status: 500,
    body: { error: { code: "internal", message: "The local service failed. See its log for the detail." } }
  };
};

// service/server/router.ts
var createRouter = () => {
  const routes = [];
  const add = (method, path, handler) => {
    routes.push({ method, segments: path.split("/").filter(Boolean), handler });
  };
  const match = (route, segments) => {
    if (route.segments.length !== segments.length) {
      return null;
    }
    const params = {};
    for (let index = 0;index < route.segments.length; index += 1) {
      const pattern = route.segments[index] ?? "";
      const actual = segments[index] ?? "";
      if (pattern.startsWith(":")) {
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
    get: (path, handler) => add("GET", path, handler),
    post: (path, handler) => add("POST", path, handler),
    put: (path, handler) => add("PUT", path, handler),
    delete: (path, handler) => add("DELETE", path, handler),
    handle: async (request) => {
      const segments = request.path.split("/").filter(Boolean);
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
    }
  };
};

// service/server/handlers/registration.ts
var registerRegistrationRoutes = (router, runtime) => {
  router.post("/register", async () => ({ status: 200, body: await runtime.register() }));
  router.post("/unregister", async () => ({ status: 200, body: await runtime.unregister() }));
};

// service/server/body.ts
var readBody2 = (schema, body) => {
  let raw;
  try {
    raw = JSON.parse(body);
  } catch {
    throw badRequest("The request body is not JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
    throw badRequest(`The request body is not what this route expects: ${issues}`);
  }
  return parsed.data;
};

// service/server/handlers/settings.ts
var isProxyPoolType = (value) => value !== undefined && PROXY_POOL_TYPES.includes(value);
var registerSettingsRoutes = (router, runtime) => {
  router.put("/config", async (request) => ({
    status: 200,
    body: await runtime.patchConfig(readBody2(configPatchSchema, request.body))
  }));
  router.post("/api-key/rotate", async () => ({
    status: 200,
    body: await runtime.rotateKey()
  }));
  router.post("/models/refresh", async () => ({
    status: 200,
    body: await runtime.refreshModels()
  }));
  router.post("/models/test", async (request) => ({
    status: 200,
    body: await runtime.testModel(readBody2(testModelInputSchema, request.body).modelId)
  }));
  router.get("/relays/:kind", async (request) => {
    const kind = request.params.kind;
    if (!isProxyPoolType(kind)) {
      throw badRequest(`Unknown relay kind "${kind}".`);
    }
    return { status: 200, body: await runtime.relaySource(kind) };
  });
  router.post("/proxy-pools", async (request) => ({
    status: 200,
    body: await runtime.createProxyPool(readBody2(createProxyPoolSchema, request.body))
  }));
  router.put("/proxy-pools/:id", async (request) => {
    const id = request.params.id;
    if (!id)
      throw badRequest("Missing proxy pool id");
    return {
      status: 200,
      body: await runtime.updateProxyPool(id, readBody2(updateProxyPoolSchema, request.body))
    };
  });
  router.delete("/proxy-pools/:id", async (request) => {
    const id = request.params.id;
    if (!id)
      throw badRequest("Missing proxy pool id");
    return {
      status: 200,
      body: await runtime.deleteProxyPool(id)
    };
  });
  router.post("/proxy-pools/:id/test", async (request) => {
    const id = request.params.id;
    if (!id)
      throw badRequest("Missing proxy pool id");
    return {
      status: 200,
      body: await runtime.testProxyPool(id)
    };
  });
  router.post("/proxy-pools/cloudflare-deploy", async (request) => ({
    status: 200,
    body: await runtime.deployCloudflare(readBody2(deployCloudflareSchema, request.body))
  }));
  router.post("/proxy-pools/vercel-deploy", async (request) => ({
    status: 200,
    body: await runtime.deployVercel(readBody2(deployVercelSchema, request.body))
  }));
  router.post("/proxy-pools/deno-deploy", async (request) => ({
    status: 200,
    body: await runtime.deployDeno(readBody2(deployDenoSchema, request.body))
  }));
  router.post("/proxy-pools/netlify-deploy", async (request) => ({
    status: 200,
    body: await runtime.deployNetlify(readBody2(deployNetlifySchema, request.body))
  }));
};

// service/server/handlers/state.ts
var registerStateRoutes = (router, runtime) => {
  router.get("/state", async () => ({ status: 200, body: runtime.state() }));
};

// service/main.ts
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? "";
if (!port || !token) {
  console.error("OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required");
  process.exit(1);
}
var BODY_LIMIT_BYTES2 = 1024 * 1024;
var runtime = createRuntime();
await runtime.start();
var router = createRouter();
router.get("/health", async () => ({ status: 200, body: { ok: true } }));
registerStateRoutes(router, runtime);
registerSettingsRoutes(router, runtime);
registerRegistrationRoutes(router, runtime);
var methodOf = (value) => {
  if (value === "POST")
    return "POST";
  if (value === "PUT")
    return "PUT";
  if (value === "DELETE")
    return "DELETE";
  return "GET";
};
var json = (response, status, body) => {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
};
var readBody3 = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size > BODY_LIMIT_BYTES2) {
      reject(new Error("The request body is too large."));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  request.on("error", reject);
});
var server = http5.createServer((request, response) => {
  if (request.headers.authorization !== `Bearer ${token}`) {
    json(response, 401, { error: { code: "unauthorized", message: "The service token did not match." } });
    return;
  }
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  readBody3(request).then((body) => router.handle({
    method: methodOf(request.method),
    path: url.pathname,
    query: url.searchParams,
    body,
    params: {}
  })).then((answer) => {
    if (!answer) {
      json(response, 404, { error: { code: "not-found", message: "No route answers this request." } });
      return;
    }
    json(response, answer.status, answer.body);
  }).catch((error) => {
    const failure = error instanceof Error ? error : new Error(String(error));
    const answer = toServiceResponse(failure);
    json(response, answer.status, answer.body);
  });
});
server.listen(port, "127.0.0.1");
var shutdown = () => {
  runtime.stop().finally(() => {
    server.close(() => process.exit(0));
  });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
