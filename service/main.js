// service/main.ts
import http5 from "node:http";

// service/runtime.ts
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import http4 from "node:http";
import https3 from "node:https";
import path7 from "node:path";
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
var redactProxyUrlCredentials = (value) => {
  try {
    const url = new URL(value);
    if (url.username || url.password) {
      url.username = "REDACTED";
      url.password = "REDACTED";
    }
    const sensitiveQueryKey = /^(?:token|secret|password|passwd|auth|api[_-]?key|access[_-]?token|refresh[_-]?token|signature|sig)$/i;
    for (const key of [...url.searchParams.keys()]) {
      if (sensitiveQueryKey.test(key))
        url.searchParams.set(key, "REDACTED");
    }
    return url.toString();
  } catch {
    return value.replace(/^([a-z][a-z\d+.-]*:\/\/)[^/@]*@/i, "$1REDACTED@");
  }
};
var preserveProxyPoolCredentials = (previous, incoming) => incoming.map((pool) => {
  const stored = previous.find((candidate) => candidate.id === pool.id);
  return stored && pool.proxyUrl === redactProxyUrlCredentials(stored.proxyUrl) ? { ...pool, proxyUrl: stored.proxyUrl } : pool;
});
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
var redactDiagnosticText = (value) => value.replace(/([a-z][a-z\d+.-]*:\/\/)[^/@\s]+@/gi, "$1[REDACTED]@").replace(/([?&](?:token|secret|password|passwd|auth|api[_-]?key|access[_-]?token|refresh[_-]?token|signature|sig)=)[^&#\s]*/gi, "$1[REDACTED]").replace(/(\bBearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, "$1[REDACTED]").replace(/(\bx-api-key\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]");

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
import { pipeline, Readable, Transform as Transform3 } from "node:stream";
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

// service/core/utils/opencodeFingerprint.js
import os from "node:os";
import path4 from "node:path";
var OPENCODE_FINGERPRINT_TOOLS = ["read", "shell"];
var READ_DESCRIPTION = "Read the contents of a file or directory. Supports text files, images, and PDFs. Images and PDFs are presented directly to the model. Each text line is prefixed by its 1-based line number as <line>: <content>. The prefix is for reference and is not part of the file content. Directory entries are returned one per line. Use offset and limit to read large files or directories in sections. Prefer one larger read over many small slices, and use grep to find specific content in large files.";
var FINGERPRINT_TOOL_PARAMETERS = {
  read: {
    type: "object",
    properties: {
      path: { type: "string", description: "File or directory to read" },
      offset: { type: "integer", minimum: 0, description: "The line or directory entry to start reading from (1-based)" },
      limit: { type: "integer", minimum: 0, description: "The maximum number of lines or directory entries to read (defaults to and capped at 2000)" }
    },
    required: ["path"],
    additionalProperties: false
  },
  shell: {
    type: "object",
    properties: {
      command: { type: "string", description: "Shell command string to execute" },
      workdir: { type: "string", description: "Working directory to execute the command in. Defaults to the current working directory. When possible, avoid changing directories in the command and set the working directory here instead." },
      timeout: { type: "integer", minimum: 0, description: "Timeout in milliseconds. Set to 0 to disable the timeout. Defaults to 120000 for foreground commands. Background commands have no timeout by default." },
      background: { type: "boolean", description: "Run the command in the background and return immediately (useful for dev servers and long-running builds). You do not need to use '&' at the end of the command when using this parameter. You will be notified when it completes. DO NOT poll for completion." }
    },
    required: ["command"],
    additionalProperties: false
  }
};
var SHELL_DESCRIPTION_HEAD = "Execute a shell command and return its output.";
var SHELL_DESCRIPTION_TAIL = "Quote file paths containing spaces or special characters. Prefer dedicated tools over shell commands when possible. When output is large, the full result is saved to a file and a truncated preview is returned. Rely on automatic truncation unless filtering the output is more useful. Commands accept an optional timeout, background commands have no timeout by default. Background commands return immediately, and you will be notified when they complete.";
var SHELL_PLATFORM_WORDINGS = {
  linux: "Linux using bash",
  darwin: "macOS using zsh",
  win32: "Windows using powershell"
};
function shellDescription(platform) {
  const wording = SHELL_PLATFORM_WORDINGS[platform] ?? SHELL_PLATFORM_WORDINGS.linux;
  return `${SHELL_DESCRIPTION_HEAD} Commands run on ${wording}. ${SHELL_DESCRIPTION_TAIL}`;
}
var ACCEPTED_FINGERPRINT_DESCRIPTIONS = {
  read: new Set([READ_DESCRIPTION]),
  shell: new Set(Object.keys(SHELL_PLATFORM_WORDINGS).map((platform) => shellDescription(platform)))
};
var HOST_PLATFORM = process.platform || "linux";
var FINGERPRINT_TOOL_DEFINITIONS = {
  read: { description: READ_DESCRIPTION, parameters: FINGERPRINT_TOOL_PARAMETERS.read },
  shell: { description: shellDescription(HOST_PLATFORM), parameters: FINGERPRINT_TOOL_PARAMETERS.shell }
};
var renamedToolNames = new WeakMap;
function fingerprintToolKey(name) {
  const trimmed = String(name ?? "").trim();
  return OPENCODE_FINGERPRINT_TOOLS.includes(trimmed) ? trimmed : "";
}
function toolNameOf(tool) {
  if (!tool || typeof tool !== "object" || Array.isArray(tool))
    return "";
  if (typeof tool.name === "string" && tool.name.trim())
    return tool.name.trim();
  const fn = tool.function;
  if (fn && typeof fn === "object" && !Array.isArray(fn) && typeof fn.name === "string") {
    return fn.name.trim();
  }
  return "";
}
function chatFunctionOf(tool) {
  const fn = tool?.function;
  return fn && typeof fn === "object" && !Array.isArray(fn) ? fn : null;
}
function isFingerprintDefinition(tool, key) {
  const def = tool && (chatFunctionOf(tool) || tool);
  const want = FINGERPRINT_TOOL_DEFINITIONS[key];
  return !!def && ACCEPTED_FINGERPRINT_DESCRIPTIONS[key].has(def.description) && JSON.stringify(def.parameters) === JSON.stringify(want.parameters);
}
function withToolName(tool, name) {
  const fn = chatFunctionOf(tool);
  return fn ? { ...tool, function: { ...fn, name } } : { ...tool, name };
}
function canNormalizeInPlace(tool, key) {
  const def = chatFunctionOf(tool) || tool;
  if (!ACCEPTED_FINGERPRINT_DESCRIPTIONS[key].has(def.description))
    return false;
  const actual = def.parameters;
  const expected = FINGERPRINT_TOOL_PARAMETERS[key];
  if (!actual || actual.type !== "object" || !actual.properties || typeof actual.properties !== "object")
    return false;
  if (!Array.isArray(actual.required) || JSON.stringify(actual.required) !== JSON.stringify(expected.required))
    return false;
  for (const [name, property] of Object.entries(actual.properties)) {
    const nativeProperty = expected.properties[name];
    if (!nativeProperty || property?.type !== nativeProperty.type)
      return false;
  }
  return true;
}
function withFingerprintDefinition(tool, key) {
  const definition = FINGERPRINT_TOOL_DEFINITIONS[key];
  const fn = chatFunctionOf(tool);
  if (fn) {
    return { ...tool, function: { ...fn, description: definition.description, parameters: definition.parameters } };
  }
  return { ...tool, description: definition.description, parameters: definition.parameters, strict: false };
}
function concealFingerprintToolNames(tools) {
  const map = new Map;
  if (!Array.isArray(tools) || tools.length === 0)
    return { tools, map };
  const taken = new Set(tools.map(toolNameOf));
  const seen = new Set;
  const out = [];
  for (const tool of tools) {
    if (!tool || typeof tool !== "object" || Array.isArray(tool)) {
      out.push(tool);
      continue;
    }
    const key = fingerprintToolKey(toolNameOf(tool));
    if (!key) {
      out.push(tool);
      continue;
    }
    if (seen.has(key))
      continue;
    seen.add(key);
    if (isFingerprintDefinition(tool, key)) {
      out.push(tool);
      continue;
    }
    if (canNormalizeInPlace(tool, key)) {
      out.push(withFingerprintDefinition(tool, key));
      continue;
    }
    let alias = `${key}_client`;
    for (let i = 2;taken.has(alias); i++)
      alias = `${key}_client${i}`;
    taken.add(alias);
    map.set(alias, key);
    out.push(withToolName(tool, alias));
  }
  return { tools: out, map };
}
function appendMissingFingerprintTools(tools, flat) {
  const appended = [];
  if (!Array.isArray(tools))
    return appended;
  for (const name of OPENCODE_FINGERPRINT_TOOLS) {
    if (tools.some((tool) => fingerprintToolKey(toolNameOf(tool)) === name))
      continue;
    const { description, parameters } = FINGERPRINT_TOOL_DEFINITIONS[name];
    tools.push(flat ? { type: "function", name, description, parameters, strict: false } : { type: "function", function: { name, description, parameters } });
    appended.push(name);
  }
  return appended;
}
function aliasesByOriginal(map) {
  return new Map([...map].map(([alias, original]) => [original, alias]));
}
function retargetToolChoice(body, map) {
  if (!body || typeof body !== "object" || !map?.size)
    return;
  const choice = body.tool_choice;
  if (!choice || typeof choice !== "object" || Array.isArray(choice))
    return;
  const aliases = aliasesByOriginal(map);
  if (typeof choice.name === "string") {
    const alias = aliases.get(choice.name.trim());
    if (alias)
      body.tool_choice = { ...choice, name: alias };
    return;
  }
  const fn = choice.function;
  if (fn && typeof fn === "object" && !Array.isArray(fn) && typeof fn.name === "string") {
    const alias = aliases.get(fn.name.trim());
    if (alias)
      body.tool_choice = { ...choice, function: { ...fn, name: alias } };
  }
}
function aliasHistoryToolCalls(body, map) {
  if (!body || typeof body !== "object" || !map?.size)
    return;
  const aliases = aliasesByOriginal(map);
  if (Array.isArray(body.input)) {
    body.input = body.input.map((item) => item?.type === "function_call" && aliases.has(item.name) ? { ...item, name: aliases.get(item.name) } : item);
  }
  if (Array.isArray(body.messages)) {
    body.messages = body.messages.map((msg) => {
      if (!Array.isArray(msg?.tool_calls))
        return msg;
      return {
        ...msg,
        tool_calls: msg.tool_calls.map((call) => aliases.has(call?.function?.name) ? { ...call, function: { ...call.function, name: aliases.get(call.function.name) } } : call)
      };
    });
  }
}
function noteUnavailableTools(body, flat, names, claude) {
  const list = names.map((name) => `\`${name}\``).join(" or ");
  const note = names.length > 1 ? `Do not call the ${list} tools; they are placeholders that do nothing. Use the other tools you have been given instead.` : `Do not call the ${list} tool; it is a placeholder that does nothing. Use the other tools you have been given instead.`;
  if (flat) {
    body.instructions = typeof body.instructions === "string" && body.instructions.trim() ? `${body.instructions}

${note}` : note;
    return;
  }
  if (claude) {
    body.system = appendSystemText(body.system, note);
    return;
  }
  if (body.system !== undefined)
    return;
  if (!Array.isArray(body.messages))
    return;
  const first = body.messages.find((msg) => msg?.role === "system");
  if (first?.role === "system" && typeof first.content === "string") {
    body.messages = body.messages.map((msg) => msg === first ? { ...msg, content: `${msg.content}

${note}` } : msg);
  } else {
    body.messages = [{ role: "system", content: note }, ...body.messages];
  }
}
var ENV_TAG = "<env>";
var ENV_HEADING = "Here is some useful information about the environment you are running in:";
var ENV_TMP_DIR = path4.join(os.tmpdir(), "opencode");
var ENV_WORKING_DIR = process.cwd();
var ENV_FINGERPRINT_PROMPT = [
  ENV_HEADING,
  "<env>",
  `  Working directory: ${ENV_WORKING_DIR}`,
  `  Workspace root folder: ${ENV_WORKING_DIR}`,
  "  Is directory a git repo: no",
  `  Platform: ${HOST_PLATFORM}`,
  `  Prefer ${ENV_TMP_DIR} over generic system temporary directories such as /tmp; it is pre-created and approved for external access.`,
  "</env>"
].join(`
`);
function systemCarriesEnv(system) {
  if (typeof system === "string")
    return system.includes(ENV_TAG);
  if (Array.isArray(system)) {
    return system.some((block) => typeof block?.text === "string" && block.text.includes(ENV_TAG));
  }
  return false;
}
function appendSystemText(system, text) {
  if (typeof system === "string") {
    return system.trim() ? `${system}

${text}` : text;
  }
  const blocks = Array.isArray(system) ? [...system] : [];
  for (let i = blocks.length - 1;i >= 0; i--) {
    const block = blocks[i];
    if (typeof block?.text === "string") {
      const existing = block.text.trim();
      blocks[i] = { ...block, text: existing ? `${block.text}

${text}` : text };
      return blocks;
    }
  }
  return [...blocks, { type: "text", text }];
}
function appendToSystemField(system) {
  return appendSystemText(system, ENV_FINGERPRINT_PROMPT);
}
function applyEnvFingerprint(body, flat, { claude = false } = {}) {
  try {
    if (!body || typeof body !== "object")
      return false;
    if (flat) {
      if (body.instructions !== undefined && typeof body.instructions !== "string")
        return false;
      if (systemCarriesEnv(body.instructions))
        return false;
      body.instructions = typeof body.instructions === "string" && body.instructions.trim() ? `${body.instructions}

${ENV_FINGERPRINT_PROMPT}` : ENV_FINGERPRINT_PROMPT;
      return true;
    }
    if (claude || body.system !== undefined) {
      if (systemCarriesEnv(body.system))
        return false;
      body.system = appendToSystemField(body.system);
      return true;
    }
    if (Array.isArray(body.messages)) {
      const idx = body.messages.findIndex((msg) => msg?.role === "system");
      if (idx >= 0) {
        const target = body.messages[idx];
        if (Array.isArray(target.content)) {
          if (systemCarriesEnv(target.content))
            return false;
          body.messages = body.messages.map((msg, i) => i === idx ? { ...msg, content: appendToSystemField(target.content) } : msg);
          return true;
        }
        if (systemCarriesEnv(target.content))
          return false;
        const content = appendToSystemField(typeof target.content === "string" ? target.content : "");
        body.messages = body.messages.map((msg, i) => i === idx ? { ...msg, content } : msg);
        return true;
      }
      body.messages = [{ role: "system", content: ENV_FINGERPRINT_PROMPT }, ...body.messages];
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
function applyFingerprintTools(body, flat, { claude = false } = {}) {
  if (!body || typeof body !== "object")
    return new Map;
  const { tools, map } = concealFingerprintToolNames(body.tools);
  body.tools = Array.isArray(tools) ? tools : [];
  const appended = appendMissingFingerprintTools(body.tools, flat);
  retargetToolChoice(body, map);
  aliasHistoryToolCalls(body, map);
  if (appended.length)
    noteUnavailableTools(body, flat, appended, claude);
  applyEnvFingerprint(body, flat, { claude });
  if (!body.tool_choice && flat)
    body.tool_choice = "auto";
  recordRenamedToolNames(body, map);
  return map;
}
function recordRenamedToolNames(body, map) {
  if (!body || typeof body !== "object" || !map?.size)
    return;
  renamedToolNames.set(body, map);
}
function takeRenamedToolNames(body) {
  if (!body || typeof body !== "object")
    return null;
  return renamedToolNames.get(body) || null;
}
function restoreToolNames(payload, map) {
  if (!map?.size || !payload)
    return payload;
  if (Array.isArray(payload))
    return payload.map((item) => restoreToolNames(item, map));
  if (typeof payload !== "object")
    return payload;
  let out = payload;
  const put = (key, value) => {
    if (out === payload)
      out = { ...payload };
    out[key] = value;
  };
  if (payload.type === "content_block_start") {
    const block = payload.content_block;
    if (block?.type === "tool_use" && typeof block.name === "string" && map.has(block.name)) {
      put("content_block", { ...block, name: map.get(block.name) });
    }
  }
  if (Array.isArray(payload.content)) {
    put("content", payload.content.map((block) => block?.type === "tool_use" && typeof block.name === "string" && map.has(block.name) ? { ...block, name: map.get(block.name) } : block));
  }
  if (Array.isArray(payload.choices)) {
    put("choices", payload.choices.map((choice) => {
      let changed = false;
      const next = { ...choice };
      for (const holder of ["delta", "message"]) {
        const value = choice?.[holder];
        if (!value || !Array.isArray(value.tool_calls) || value.tool_calls.length === 0)
          continue;
        const calls = value.tool_calls.map((call) => {
          const name = call?.function?.name;
          if (typeof name === "string" && map.has(name)) {
            changed = true;
            return { ...call, function: { ...call.function, name: map.get(name) } };
          }
          return call;
        });
        next[holder] = { ...value, tool_calls: calls };
      }
      return changed ? next : choice;
    }));
  }
  if (Array.isArray(payload.output)) {
    put("output", payload.output.map((item) => item?.type === "function_call" && typeof item.name === "string" && map.has(item.name) ? { ...item, name: map.get(item.name) } : item));
  }
  const item = payload.item;
  if (item?.type === "function_call" && typeof item.name === "string" && map.has(item.name)) {
    put("item", { ...item, name: map.get(item.name) });
  }
  return out;
}

// service/opencode-protocol.ts
var cleanModelId = (modelId) => {
  const clean = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  return clean.startsWith("blackrouter/") ? clean.slice("blackrouter/".length) : clean;
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
var liftReasoningAliases = (delta) => {
  if (typeof delta.reasoning_content === "string" && delta.reasoning_content)
    return delta;
  if (typeof delta.reasoning === "string" && delta.reasoning) {
    return { ...delta, reasoning_content: delta.reasoning };
  }
  if (Array.isArray(delta.reasoning_details)) {
    const text = delta.reasoning_details.map((part) => {
      if (typeof part === "string")
        return part;
      if (!part || typeof part !== "object")
        return "";
      const value = part;
      return typeof value.text === "string" && value.text ? value.text : typeof value.content === "string" ? value.content : "";
    }).join("");
    if (text)
      return { ...delta, reasoning_content: text };
  }
  return delta;
};
var createToolNameRestoreTransform = (toolNameMap) => {
  const decoder = new StringDecoder("utf8");
  let buffer = "";
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
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });
  const processFrame = (rawFrame) => {
    const frame = parseFrame(rawFrame);
    if (!frame || frame.data === "[DONE]") {
      stream.push(Buffer.from(rawFrame + `

`));
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(frame.data);
    } catch {
      stream.push(Buffer.from(rawFrame + `

`));
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      stream.push(Buffer.from(rawFrame + `

`));
      return;
    }
    const payload = parsed;
    if (Array.isArray(payload.choices)) {
      payload.choices = payload.choices.map((choice) => {
        if (!choice || typeof choice !== "object")
          return choice;
        const item = choice;
        if (!item.delta || typeof item.delta !== "object" || Array.isArray(item.delta))
          return item;
        return { ...item, delta: liftReasoningAliases(item.delta) };
      });
    }
    const restored = restoreToolNames(payload, toolNameMap);
    const eventLine = frame.event ? `event: ${frame.event}
` : "";
    stream.push(Buffer.from(`${eventLine}data: ${JSON.stringify(restored)}

`));
  };
  return stream;
};
var responseErrorMessage = (payload) => {
  const response = payload.response && typeof payload.response === "object" ? payload.response : {};
  const error = payload.error && typeof payload.error === "object" ? payload.error : response.error && typeof response.error === "object" ? response.error : payload;
  return typeof error.message === "string" ? error.message : JSON.stringify(error);
};
var createOpenCodeResponseTransform = (lane, requestedModel, toolNameMap) => {
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
    const restored = toolNameMap?.size ? restoreToolNames(payload, toolNameMap) : payload;
    stream.push(Buffer.from(`data: ${JSON.stringify(restored)}

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

// service/core/executors/opencode.js
import crypto2 from "crypto";

// service/core/executors/base.js
class BaseExecutor {
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
    const responseFormat = path.endsWith("/responses") ? "openai-responses" : path.endsWith("/messages") ? "claude" : "openai";
    const result = await dispatch({
      url,
      headers,
      body: transformedBody,
      responseFormat,
      ...options
    });
    return { ...result, nativeUrl: url, nativeHeaders: headers, transformedBody, responseFormat: result.responseFormat || responseFormat };
  }
}

// service/core/providers/registry/opencode.js
var opencode_default = {
  id: "opencode",
  priority: 40,
  hasFree: true,
  alias: "oc",
  uiAlias: "oc",
  display: {
    name: "OpenCode Free",
    icon: "terminal",
    color: "#E87040",
    textIcon: "OC"
  },
  category: "free",
  noAuth: true,
  transport: {
    baseUrl: "https://opencode.ai",
    headers: {
      "x-opencode-client": "desktop"
    },
    forceStream: true,
    noAuth: true,
    reasoningInject: {
      scope: "all"
    },
    quirks: {
      forceAutoToolChoiceModels: ["muse-spark-1.3-contributor-free"],
      reasoningAliasFields: true
    }
  },
  models: [
    { id: "muse-spark-1.2-contributor-free", name: "Muse Spark 1.2 Contributor Free", targetFormat: "openai-responses" },
    { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3 Contributor Free", targetFormat: "openai-responses" },
    { id: "union-alpha", name: "Union Alpha Free", targetFormat: "claude" },
    { id: "jev-1.13-free", name: "Jev 1.13 Free", kind: "systemone" }
  ],
  serviceKinds: ["llm", "systemone"],
  systemoneConfig: {
    baseUrl: "https://opencode.ai/zen/v1/systemone",
    headers: {
      "x-opencode-client": "desktop",
      "User-Agent": "opencode/1.18.31"
    }
  },
  modelsFetcher: { url: "https://opencode.ai/zen/v1/models", type: "opencode-free" },
  passthroughModels: true
};

// service/core/config/providers.js
var PROVIDERS = {
  [opencode_default.id]: {
    ...opencode_default.transport,
    id: opencode_default.id,
    alias: opencode_default.alias,
    models: opencode_default.models,
    noAuth: opencode_default.noAuth
  }
};

// service/core/config/runtimeConfig.js
var MEMORY_CONFIG = {
  sessionTtlMs: 2 * 60 * 60 * 1000,
  sessionCleanupIntervalMs: 30 * 60 * 1000,
  dnsCacheTtlMs: 5 * 60 * 1000,
  proxyDispatchersMaxSize: 20
};
var DEFAULT_MAX_TOKENS = 64000;
var DEFAULT_MIN_TOKENS = 32000;

// service/core/providers/capabilities.js
var CAPABILITIES = {
  "muse-spark-1.2-contributor-free": {
    vision: true,
    reasoning: true,
    thinkingFormat: "openai",
    contextWindow: 1048576,
    maxOutput: 131072
  },
  "muse-spark-1.3-contributor-free": {
    vision: true,
    reasoning: true,
    thinkingFormat: "openai",
    contextWindow: 1048576,
    maxOutput: 131072
  },
  "union-alpha": { vision: true, contextWindow: 262144, maxOutput: 131072 },
  "glm-5.3-flash-free": {
    vision: true,
    videoInput: true,
    pdf: true,
    reasoning: true,
    thinkingFormat: "openai",
    thinkingCanDisable: false,
    contextWindow: 1e6,
    maxOutput: 128000
  },
  "mimo-v2.6-flash-free": {
    vision: true,
    audioInput: true,
    videoInput: true,
    reasoning: true,
    thinkingFormat: "openai",
    thinkingCanDisable: true,
    contextWindow: 1048576,
    maxOutput: 131072
  },
  "deepseek-v4.1-flash-free": {
    vision: true,
    reasoning: true,
    thinkingFormat: "deepseek",
    contextWindow: 330000,
    maxOutput: 128000
  }
};
function getCapabilitiesForModel(_provider, model) {
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  return CAPABILITIES[id] || { reasoning: false, contextWindow: 200000, maxOutput: 64000 };
}

// service/core/providers/thinkingLevels.js
var OPENAI_LEVELS = ["none", "minimal", "low", "medium", "high", "xhigh"];
var OPENAI_LEVELS_WITH_MAX = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
var DEEPSEEK_FREE_LEVELS = ["low", "high", "max"];
var MODEL_LEVELS = {
  "mimo-v2.6-flash-free": OPENAI_LEVELS_WITH_MAX,
  "deepseek-v4.1-flash-free": DEEPSEEK_FREE_LEVELS
};
function getThinkingLevels(provider, model) {
  if (provider !== "opencode")
    return null;
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  const capabilities = getCapabilitiesForModel(provider, id);
  if (!capabilities.reasoning)
    return null;
  const levels = MODEL_LEVELS[id] || (capabilities.thinkingFormat === "openai" ? OPENAI_LEVELS : capabilities.thinkingFormat === "deepseek" ? DEEPSEEK_FREE_LEVELS : null);
  if (!levels)
    return null;
  return capabilities.thinkingCanDisable === false ? levels.filter((level) => level !== "none") : levels;
}

// service/core/utils/reasoningContentInjector.js
var PLACEHOLDER = " ";
var providerRuleFor = (provider) => PROVIDERS[provider]?.reasoningInject;
var MODEL_RULES2 = [
  { match: (m) => /^kimi-/i.test(m || ""), scope: "toolCalls" },
  { match: (m) => /deepseek/i.test(m || ""), scope: "all" }
];
var DEEPSEEK_V4_PRO = "deepseek-v4-pro";
var DEEPSEEK_V4_PRO_ALIASES = {
  [`${DEEPSEEK_V4_PRO}-max`]: {
    thinkingType: "enabled",
    reasoningEffort: "max"
  },
  [`${DEEPSEEK_V4_PRO}-none`]: {
    thinkingType: "disabled",
    reasoningEffort: null
  }
};
function shouldInject(message, scope) {
  if (message?.role !== "assistant")
    return false;
  const rc = message.reasoning_content;
  if (typeof rc === "string" && rc.length > 0)
    return false;
  if (scope === "toolCalls")
    return Array.isArray(message.tool_calls) && message.tool_calls.length > 0;
  return true;
}
function applyRule(body, rule) {
  if (!rule || !body?.messages)
    return body;
  const messages = body.messages.map((m) => shouldInject(m, rule.scope) ? { ...m, reasoning_content: PLACEHOLDER } : m);
  return { ...body, messages };
}
function applyDeepSeekV4ProAlias({ provider, model, body }) {
  const alias = DEEPSEEK_V4_PRO_ALIASES[model];
  if (provider !== "deepseek" || !alias || !body)
    return body;
  const nextBody = {
    ...body,
    model: DEEPSEEK_V4_PRO,
    extra_body: {
      ...body.extra_body || {},
      thinking: {
        ...body.extra_body?.thinking || {},
        type: alias.thinkingType
      }
    }
  };
  if (alias.reasoningEffort) {
    nextBody.reasoning_effort = alias.reasoningEffort;
  } else {
    delete nextBody.reasoning_effort;
  }
  return nextBody;
}
function injectReasoningContent({ provider, model, body }) {
  const providerRule = providerRuleFor(provider);
  const modelRule = MODEL_RULES2.find((r) => r.match(model));
  const rule = providerRule || modelRule;
  const nextBody = applyDeepSeekV4ProAlias({ provider, model, body });
  return applyRule(nextBody, rule);
}

// service/core/utils/sessionManager.js
import crypto from "crypto";
var runtimeSessionStore = new Map;
var continuationStore = new Map;
var cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of runtimeSessionStore) {
    if (now - entry.lastUsed > MEMORY_CONFIG.sessionTtlMs) {
      runtimeSessionStore.delete(key);
    }
  }
}, MEMORY_CONFIG.sessionCleanupIntervalMs);
if (cleanupInterval.unref)
  cleanupInterval.unref();
function deriveSessionId(connectionId) {
  if (!connectionId) {
    return generateBinaryStyleId();
  }
  const existing = runtimeSessionStore.get(connectionId);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.sessionId;
  }
  const MAX_SESSIONS = 1000;
  if (runtimeSessionStore.size >= MAX_SESSIONS) {
    const oldest = runtimeSessionStore.keys().next().value;
    runtimeSessionStore.delete(oldest);
  }
  const sessionId = generateBinaryStyleId();
  runtimeSessionStore.set(connectionId, { sessionId, lastUsed: Date.now() });
  return sessionId;
}
function generateBinaryStyleId() {
  return crypto.randomUUID() + Date.now().toString();
}
var assistantSessionStore = new Map;
var ASSISTANT_MIN_LEN = 50;
var ASSISTANT_CAP_LEN = 50;
var MAX_ASSISTANT_SESSIONS = 5000;
var SESSION_HEADER_KEYS = ["x-session-id", "session-id", "session_id", "x-amp-thread-id"];
var CLAUDE_CODE_SESSION_RE = /_session_([a-f0-9-]+)$/;
var CLAUDE_CODE_SESSION_HEADER = "x-claude-code-session-id";
function sha16(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}
function normalizeSessionId(value) {
  if (typeof value !== "string")
    return null;
  const v = value.trim();
  if (!v || v.length > 256)
    return null;
  return v;
}
function extractClaudeCodeSession(userId) {
  if (typeof userId !== "string" || !userId)
    return null;
  const m = userId.match(CLAUDE_CODE_SESSION_RE);
  if (m)
    return m[1];
  if (userId[0] === "{") {
    try {
      return normalizeSessionId(JSON.parse(userId)?.session_id);
    } catch {}
  }
  return null;
}
function headerValue(headers, key) {
  if (!headers || typeof headers !== "object")
    return null;
  return normalizeSessionId(headers[key] ?? headers[key.toLowerCase()]);
}
var ANTIGRAVITY_CONV_RE = /^[a-z]+\/([0-9a-f-]{36})\//i;
function extractAntigravitySession(body) {
  const sid = body?.request?.sessionId;
  if (sid != null && sid !== "")
    return normalizeSessionId(String(sid));
  const m = typeof body?.requestId === "string" ? body.requestId.match(ANTIGRAVITY_CONV_RE) : null;
  return m ? normalizeSessionId(m[1]) : null;
}
function extractClientSessionId(headers, body, scope = "") {
  const claude = extractClaudeCodeSession(body?.metadata?.user_id) || headerValue(headers, CLAUDE_CODE_SESSION_HEADER);
  if (claude)
    return `claude:${claude}`;
  const antigravity = extractAntigravitySession(body);
  if (antigravity)
    return `antigravity:${antigravity}`;
  for (const key of SESSION_HEADER_KEYS) {
    const v = headerValue(headers, key);
    if (v)
      return v;
  }
  const requestId = scope === "kiro" ? null : headerValue(headers, "x-client-request-id");
  if (requestId)
    return requestId;
  const fromBody = normalizeSessionId(body?.prompt_cache_key) || normalizeSessionId(body?.session_id) || normalizeSessionId(body?.conversation_id) || (scope === "kiro" ? null : normalizeSessionId(body?.metadata?.user_id));
  return fromBody || null;
}
function requestMessages(body) {
  if (Array.isArray(body?.messages))
    return body.messages;
  if (Array.isArray(body?.input))
    return body.input;
  return [];
}
function accumulateAssistantText(body) {
  const items = requestMessages(body);
  if (!items)
    return "";
  let text = "";
  for (const item of items) {
    if (item?.role !== "assistant")
      continue;
    if (typeof item.content === "string")
      text += item.content;
    else if (Array.isArray(item.content)) {
      for (const c of item.content)
        text += c?.text || c?.output || "";
    }
    if (text.length >= ASSISTANT_CAP_LEN)
      break;
  }
  return text;
}
function assistantTextSessionId(scope, body) {
  const text = accumulateAssistantText(body);
  if (text.length < ASSISTANT_MIN_LEN)
    return null;
  const hash = sha16(`${scope}:${text.slice(0, ASSISTANT_CAP_LEN)}`);
  const existing = assistantSessionStore.get(hash);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.sessionId;
  }
  if (assistantSessionStore.size >= MAX_ASSISTANT_SESSIONS) {
    assistantSessionStore.delete(assistantSessionStore.keys().next().value);
  }
  const sessionId = generateBinaryStyleId();
  assistantSessionStore.set(hash, { sessionId, lastUsed: Date.now() });
  return sessionId;
}
function resolveSessionIdentity({ headers, body, connectionId, workspaceId, scope = "" } = {}) {
  const client = extractClientSessionId(headers, body, scope);
  if (client)
    return { sessionId: client, ephemeral: false };
  const fromAssistant = scope === "kiro" ? null : assistantTextSessionId(`${scope}:${connectionId || ""}`, body);
  if (fromAssistant)
    return { sessionId: fromAssistant, ephemeral: false };
  const ws = normalizeSessionId(workspaceId);
  if (ws)
    return { sessionId: ws, ephemeral: false };
  if (scope === "kiro")
    return { sessionId: generateBinaryStyleId(), ephemeral: true };
  return { sessionId: deriveSessionId(connectionId), ephemeral: false };
}
function resolveSessionId(opts = {}) {
  return resolveSessionIdentity(opts).sessionId;
}
var assistantCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of assistantSessionStore) {
    if (now - entry.lastUsed > MEMORY_CONFIG.sessionTtlMs)
      assistantSessionStore.delete(key);
  }
  for (const [key, entry] of continuationStore) {
    if (now - entry.lastUsed > MEMORY_CONFIG.sessionTtlMs)
      continuationStore.delete(key);
  }
}, MEMORY_CONFIG.sessionCleanupIntervalMs);
if (assistantCleanup.unref)
  assistantCleanup.unref();

// service/core/translator/formats.js
var FORMATS = {
  OPENAI: "openai",
  OPENAI_RESPONSES: "openai-responses",
  OPENAI_RESPONSE: "openai-response",
  CLAUDE: "claude",
  GEMINI: "gemini",
  GEMINI_CLI: "gemini-cli",
  VERTEX: "vertex",
  CODEX: "codex",
  ANTIGRAVITY: "antigravity",
  KIRO: "kiro",
  CURSOR: "cursor",
  OLLAMA: "ollama",
  COMMANDCODE: "commandcode"
};

// service/core/providers/models/helpers.js
function isMuseSparkModel(modelId) {
  if (!modelId || typeof modelId !== "string")
    return false;
  const clean = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  return /^muse[-_]?spark(?:$|[-_:.\s])/i.test(base);
}
var OPENCODE_FAMILIES = [
  { match: /^(grok|gpt|muse[-_]?spark)/i, supportedFormats: [FORMATS.OPENAI_RESPONSES], targetFormat: FORMATS.OPENAI_RESPONSES },
  { match: /^deepseek-v4-(pro|flash)/, supportedFormats: [FORMATS.OPENAI, FORMATS.CLAUDE, FORMATS.OPENAI_RESPONSES] },
  { match: /^(minimax|qwen)/, supportedFormats: [FORMATS.OPENAI, FORMATS.CLAUDE] },
  { match: /^claude-/i, supportedFormats: [FORMATS.CLAUDE] }
];

// service/core/services/lazyRuntime.js
import { spawn } from "node:child_process";
import fs2 from "node:fs";
import path6 from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// service/core/services/writableDataDir.js
import fs from "node:fs";
import os2 from "node:os";
import path5 from "node:path";
var cached = null;
function getWritableDataDir() {
  if (cached)
    return cached;
  const configRoot = path5.join(os2.homedir(), ".openchamber", "blackrouter");
  const candidates = [
    process.env.BLACKROUTER_DATA_DIR,
    process.env.OPENCHAMBER_DATA_DIR ? path5.join(process.env.OPENCHAMBER_DATA_DIR, "blackrouter") : null,
    configRoot,
    path5.join(os2.tmpdir(), "blackrouter-runtime")
  ].filter((value) => typeof value === "string" && value.length > 0);
  for (const candidate of candidates) {
    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.accessSync(candidate, fs.constants.W_OK);
      cached = candidate;
      return candidate;
    } catch {}
  }
  cached = process.cwd();
  return cached;
}

// service/core/services/lazyRuntime.js
var LAZY_DEP_VERSIONS = {
  "wreq-js": "^3.2.0"
};
function getRuntimeDir() {
  return path6.join(getWritableDataDir(), "runtime");
}
function isModuleMissing(error) {
  const code = String(error?.code || "");
  return code === "MODULE_NOT_FOUND" || code === "ERR_MODULE_NOT_FOUND";
}
function npmInstall(pkg, version) {
  const cwd = getRuntimeDir();
  fs2.mkdirSync(cwd, { recursive: true });
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const args = ["install", "--no-audit", "--no-fund", "--prefer-online", `${pkg}@${version}`];
  return new Promise((resolve) => {
    const child = spawn(npm, args, { cwd, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => resolve({ ok: false, stderr: String(error.message || error) }));
    child.on("close", (status) => resolve({ ok: status === 0, stderr }));
  });
}
var inflight = new Map;
async function load(pkg) {
  try {
    return await import(pkg);
  } catch (error) {
    if (!isModuleMissing(error))
      throw error;
  }
  const runtimeRequire = createRequire(path6.join(getRuntimeDir(), "package.json"));
  try {
    return await import(pathToFileURL(runtimeRequire.resolve(pkg)).href);
  } catch (error) {
    if (!isModuleMissing(error))
      throw error;
  }
  const version = LAZY_DEP_VERSIONS[pkg] || "latest";
  const dir = getRuntimeDir();
  const res = await npmInstall(pkg, version);
  if (!res.ok) {
    const reason = (res.stderr.match(/npm ERR! ?(.+)/) || [])[1] || res.stderr.split(`
`).filter(Boolean).pop() || "unknown npm error";
    throw new Error(`${pkg} is missing and the on-demand install failed (${String(reason).slice(0, 160)}) — ` + `install it manually: cd "${dir}" && npm install ${pkg}@${version}`);
  }
  return import(pathToFileURL(createRequire(path6.join(dir, "package.json")).resolve(pkg)).href);
}
function loadRuntimeDep(pkg) {
  if (!inflight.has(pkg)) {
    inflight.set(pkg, load(pkg).finally(() => inflight.delete(pkg)));
  }
  return inflight.get(pkg);
}

// service/core/services/opencodeTlsClient.js
var OPENCODE_CIPHER_LIST = [
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "TLS_CHACHA20_POLY1305_SHA256",
  "ECDHE-ECDSA-AES128-GCM-SHA256",
  "ECDHE-RSA-AES128-GCM-SHA256",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "ECDHE-RSA-AES256-GCM-SHA384",
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-ECDSA-AES128-SHA",
  "ECDHE-RSA-AES128-SHA",
  "ECDHE-ECDSA-AES256-SHA",
  "ECDHE-RSA-AES256-SHA",
  "AES128-GCM-SHA256",
  "AES256-GCM-SHA384",
  "AES128-SHA",
  "AES256-SHA"
].join(":");
var DEFAULT_TIMEOUT_MS = 120000;
var sessionPromise = null;

class OpencodeTlsUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "OpencodeTlsUnavailableError";
  }
}
async function loadSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const wreq = await loadRuntimeDep("wreq-js");
      if (typeof wreq.createSession !== "function") {
        throw new Error("wreq-js runtime is missing createSession");
      }
      return wreq.createSession({
        emulation: { tlsOptions: { cipherList: OPENCODE_CIPHER_LIST } }
      });
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}
async function opencodeTlsFetch(url, init = {}, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  let session;
  try {
    session = await loadSession();
  } catch (error) {
    throw new OpencodeTlsUnavailableError(`wreq-js unavailable (${error instanceof Error ? error.message : "unknown"}) — install the optional wreq-js dependency to reach the OpenCode free tier`);
  }
  const options = {
    method: init.method || "GET",
    headers: init.headers,
    redirect: "follow",
    timeout: timeoutMs
  };
  if (init.body !== undefined)
    options.body = init.body;
  if (signal)
    options.signal = signal;
  const res = await session.fetch(url, options);
  const headers = {};
  res.headers?.forEach?.((value, key) => {
    headers[key] = value;
  });
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

// service/core/providers/shared.js
var ANTHROPIC_API_VERSION = "2023-06-01";

// service/core/translator/schema/roles.js
var ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
  TOOL: "tool",
  SYSTEM: "system",
  DEVELOPER: "developer"
};
// service/core/translator/schema/blocks.js
var OPENAI_BLOCK = {
  TEXT: "text",
  IMAGE_URL: "image_url",
  IMAGE: "image",
  INPUT_AUDIO: "input_audio",
  AUDIO_URL: "audio_url",
  FILE: "file",
  FUNCTION: "function"
};
var CLAUDE_BLOCK = {
  TEXT: "text",
  IMAGE: "image",
  DOCUMENT: "document",
  TOOL_USE: "tool_use",
  TOOL_RESULT: "tool_result",
  CONTAINER_UPLOAD: "container_upload",
  THINKING: "thinking",
  REDACTED_THINKING: "redacted_thinking",
  SERVER_TOOL_USE: "server_tool_use",
  WEB_SEARCH_TOOL_RESULT: "web_search_tool_result"
};
var RESPONSES_ITEM = {
  MESSAGE: "message",
  FUNCTION_CALL: "function_call",
  FUNCTION_CALL_OUTPUT: "function_call_output",
  CUSTOM_TOOL_CALL: "custom_tool_call",
  CUSTOM_TOOL_CALL_OUTPUT: "custom_tool_call_output",
  ADDITIONAL_TOOLS: "additional_tools",
  REASONING: "reasoning",
  OUTPUT_TEXT: "output_text",
  INPUT_TEXT: "input_text",
  INPUT_IMAGE: "input_image",
  SUMMARY_TEXT: "summary_text"
};
var VALID_OPENAI_CONTENT_TYPES = [
  OPENAI_BLOCK.TEXT,
  OPENAI_BLOCK.IMAGE_URL,
  OPENAI_BLOCK.IMAGE,
  OPENAI_BLOCK.INPUT_AUDIO,
  OPENAI_BLOCK.AUDIO_URL,
  OPENAI_BLOCK.FILE
];
var VALID_OPENAI_MESSAGE_TYPES = [
  OPENAI_BLOCK.TEXT,
  OPENAI_BLOCK.IMAGE_URL,
  OPENAI_BLOCK.IMAGE,
  "tool_calls",
  CLAUDE_BLOCK.TOOL_RESULT
];
// service/core/translator/schema/finishReasons.js
var OPENAI_FINISH = {
  STOP: "stop",
  LENGTH: "length",
  TOOL_CALLS: "tool_calls",
  CONTENT_FILTER: "content_filter"
};
var NO_RETRY_EMPTY_FINISH = new Set([OPENAI_FINISH.CONTENT_FILTER]);
// service/core/translator/formats/responsesApi.js
function normalizeResponsesInput(input) {
  if (typeof input === "string") {
    const text = input.trim() === "" ? "..." : input;
    return [{ type: RESPONSES_ITEM.MESSAGE, role: ROLE.USER, content: [{ type: RESPONSES_ITEM.INPUT_TEXT, text }] }];
  }
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return [{ type: RESPONSES_ITEM.MESSAGE, role: ROLE.USER, content: [{ type: RESPONSES_ITEM.INPUT_TEXT, text: "..." }] }];
    }
    return input;
  }
  return null;
}
var MAX_RESPONSES_CALL_ID_LEN = 64;
var responsesCallIdSeq = 0;
function clampResponsesCallId(id) {
  if (typeof id !== "string" || !id)
    return `call_${Date.now()}_${responsesCallIdSeq += 1}`;
  return id.length > MAX_RESPONSES_CALL_ID_LEN ? id.substring(0, MAX_RESPONSES_CALL_ID_LEN) : id;
}
function coerceResponsesArguments(value) {
  if (value === undefined || value === null || value === "")
    return "{}";
  if (typeof value !== "string") {
    try {
      return JSON.stringify(value);
    } catch {
      return "{}";
    }
  }
  try {
    JSON.parse(value);
    return value;
  } catch {
    return "{}";
  }
}
function coerceResponsesOutput(value) {
  if (typeof value === "string")
    return value;
  if (value === undefined || value === null)
    return "";
  if (Array.isArray(value)) {
    return value.map((c) => {
      try {
        return c?.text ?? JSON.stringify(c);
      } catch {
        return String(c);
      }
    }).join("");
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// service/core/executors/opencode.js
var OPENCODE_UA = "opencode/latest/2.1.4/cli";
var OPENCODE_CLIENT = "cli";
var MAX_SESSION_LENGTH = 256;
var MAX_TOOL_NAME_LEN = 128;
var SESSION_HEADER = "x-opencode-session";
var SESSION_FIELD = "_opencodeSession";
var OPENCODE_SESSION_RE = /^ses_[0-9a-f]{12}[0-9A-Za-z]{14}$/;
var BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function hasValidOpencodeVersion(ua) {
  const m = String(ua || "").match(/^opencode\/[a-z0-9-]+\/(\d+)\.\d+\.\d+\/[a-z0-9-]+$/i);
  return !!m && parseInt(m[1], 10) >= 2;
}
var RESPONSES_MODELS = new Set([
  "muse-spark-1.2-contributor-free",
  "muse-spark-1.3-contributor-free"
]);
var MESSAGES_MODELS = new Set(["union-alpha"]);
var lastTimestamp = 0;
var counter = 0;
function unstableRandom() {
  const bytes = crypto2.randomBytes(14);
  let randomPart = "";
  for (let i = 0;i < 14; i++) {
    randomPart += BASE62_CHARS[bytes[i] % 62];
  }
  return randomPart;
}
var SESSION_PREFIX_MASK = (1n << 48n) - 1n;
function descendingTimeHex(time, counterValue) {
  return (~(BigInt(time) * 0x1000n + BigInt(counterValue)) & SESSION_PREFIX_MASK).toString(16).padStart(12, "0");
}
function generateSessionId(timestamp = Date.now()) {
  if (timestamp !== lastTimestamp) {
    lastTimestamp = timestamp;
    counter = 0;
  }
  counter++;
  return `ses_${descendingTimeHex(timestamp, counter)}${unstableRandom()}`;
}
var translatedOpencodeSessions = new Map;
var MAX_TRANSLATED_SESSIONS = 5000;
var translatedSessionCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of translatedOpencodeSessions) {
    if (now - entry.lastUsed > MEMORY_CONFIG.sessionTtlMs) {
      translatedOpencodeSessions.delete(key);
    }
  }
}, MEMORY_CONFIG.sessionCleanupIntervalMs);
if (translatedSessionCleanup.unref)
  translatedSessionCleanup.unref();
function translateSessionId(sessionId, clientTool = "") {
  if (typeof sessionId === "string" && OPENCODE_SESSION_RE.test(sessionId.trim())) {
    return sessionId.trim();
  }
  const key = `${clientTool || "generic"}\x00${sessionId || ""}`;
  const existing = translatedOpencodeSessions.get(key);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.sessionId;
  }
  const translated = `ses_${descendingTimeHex(Date.now(), 1)}${unstableRandom()}`;
  if (translatedOpencodeSessions.size >= MAX_TRANSLATED_SESSIONS) {
    translatedOpencodeSessions.delete(translatedOpencodeSessions.keys().next().value);
  }
  translatedOpencodeSessions.set(key, { sessionId: translated, lastUsed: Date.now() });
  return translated;
}
function normalizeSession(value) {
  if (typeof value !== "string")
    return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_SESSION_LENGTH)
    return null;
  return normalized;
}
function nativeSession(headers) {
  if (!headers || typeof headers !== "object")
    return null;
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === SESSION_HEADER) {
      const normalized = normalizeSession(value);
      if (normalized && OPENCODE_SESSION_RE.test(normalized))
        return normalized;
    }
  }
  return null;
}
var stableOpencodeSessions = new Map;
var MAX_STABLE_SESSIONS = 1000;
var stableSessionCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of stableOpencodeSessions) {
    if (now - entry.lastUsed > MEMORY_CONFIG.sessionTtlMs) {
      stableOpencodeSessions.delete(key);
    }
  }
}, MEMORY_CONFIG.sessionCleanupIntervalMs);
if (stableSessionCleanup.unref)
  stableSessionCleanup.unref();
function identityKey(credentials) {
  const connectionId = credentials?.connectionId || credentials?.id;
  if (connectionId)
    return `opencode:conn:${String(connectionId).slice(0, 128)}`;
  const raw = credentials?.rawHeaders || {};
  const auth = raw.authorization || raw.Authorization || raw["x-api-key"] || raw["X-Api-Key"] || "";
  if (auth) {
    const digest = crypto2.createHash("sha256").update(String(auth)).digest("hex").slice(0, 32);
    return `opencode:auth:${digest}`;
  }
  return "opencode:default";
}
function stableSessionId(credentials) {
  const key = identityKey(credentials);
  const existing = stableOpencodeSessions.get(key);
  if (existing) {
    existing.lastUsed = Date.now();
    stableOpencodeSessions.delete(key);
    stableOpencodeSessions.set(key, existing);
    return existing.sessionId;
  }
  const sessionId = generateSessionId();
  if (stableOpencodeSessions.size >= MAX_STABLE_SESSIONS) {
    stableOpencodeSessions.delete(stableOpencodeSessions.keys().next().value);
  }
  stableOpencodeSessions.set(key, { sessionId, lastUsed: Date.now() });
  return sessionId;
}
function bodyHasSessionHints(body) {
  try {
    if (!body || typeof body !== "object")
      return false;
    if (typeof body.session_id === "string" && body.session_id.trim())
      return true;
    if (typeof body.conversation_id === "string" && body.conversation_id.trim())
      return true;
    if (typeof body.prompt_cache_key === "string" && body.prompt_cache_key.trim())
      return true;
    if (body.metadata && typeof body.metadata.user_id === "string" && body.metadata.user_id.trim())
      return true;
    if (body.request && body.request.sessionId != null && String(body.request.sessionId) !== "")
      return true;
    const arr = Array.isArray(body.messages) ? body.messages : Array.isArray(body.input) ? body.input : null;
    if (arr) {
      let assistantText = "";
      for (const msg of arr) {
        if (msg?.role === "assistant") {
          const content = msg.content;
          if (typeof content === "string")
            assistantText += content;
          else if (Array.isArray(content)) {
            for (const part of content)
              assistantText += part?.text || part?.output || "";
          }
          if (assistantText.length >= 50)
            return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}
function baseModelId(model) {
  return String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
}
function isResponsesModel(model) {
  const base = baseModelId(model);
  return RESPONSES_MODELS.has(base) || isMuseSparkModel(base);
}
function isMessagesModel(model) {
  return MESSAGES_MODELS.has(baseModelId(model));
}
function resolveOpencodeSession(body, credentials, providerSessionId, clientTool) {
  const headers = credentials?.rawHeaders || {};
  const native = nativeSession(headers);
  if (native)
    return native;
  let incoming = null;
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === SESSION_HEADER) {
      incoming = normalizeSession(value);
      break;
    }
  }
  const hinted = incoming || normalizeSession(providerSessionId);
  if (hinted)
    return translateSessionId(hinted, clientTool);
  if (credentials?.connectionId || bodyHasSessionHints(body)) {
    let viaManager = null;
    try {
      viaManager = resolveSessionId({
        headers,
        body,
        connectionId: credentials?.connectionId,
        scope: "opencode"
      });
    } catch {
      viaManager = null;
    }
    if (viaManager)
      return translateSessionId(viaManager, clientTool);
  }
  return stableSessionId(credentials);
}
function normalizeResponsesTools(body) {
  if (!Array.isArray(body.tools))
    return;
  const validNames = new Set;
  body.tools = body.tools.filter((tool) => {
    if (!tool || typeof tool !== "object" || Array.isArray(tool))
      return false;
    const fn = tool.function && typeof tool.function === "object" && !Array.isArray(tool.function) ? tool.function : null;
    const rawName = typeof tool.name === "string" ? tool.name : typeof fn?.name === "string" ? fn.name : "";
    const name = rawName.trim();
    if (!name)
      return false;
    const description = typeof tool.description === "string" ? tool.description : typeof fn?.description === "string" ? fn.description : "";
    let parameters = tool.parameters && typeof tool.parameters === "object" && !Array.isArray(tool.parameters) ? tool.parameters : fn?.parameters && typeof fn.parameters === "object" && !Array.isArray(fn.parameters) ? fn.parameters : { type: "object", properties: {} };
    if (parameters.type === "object" && !parameters.properties)
      parameters = { ...parameters, properties: {} };
    for (const k of Object.keys(tool))
      delete tool[k];
    tool.type = "function";
    tool.name = name.slice(0, MAX_TOOL_NAME_LEN);
    if (description)
      tool.description = description;
    tool.parameters = parameters;
    validNames.add(tool.name);
    return true;
  });
  if (body.tool_choice && typeof body.tool_choice === "object" && !Array.isArray(body.tool_choice)) {
    if (body.tool_choice.type === "function") {
      const n = typeof body.tool_choice.name === "string" ? body.tool_choice.name.trim() : "";
      if (!n || !validNames.has(n))
        delete body.tool_choice;
    }
  }
}
function sanitizeResponsesItems(body) {
  if (!Array.isArray(body.input))
    return;
  body.input = body.input.filter((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return true;
    if (item.type === "reasoning")
      return false;
    delete item.encrypted_content;
    delete item.reasoning_encrypted_content;
    if (item.type === "function_call") {
      if (!item.name || typeof item.name !== "string" || item.name.trim() === "")
        return false;
      item.name = item.name.trim().slice(0, MAX_TOOL_NAME_LEN);
      item.call_id = clampResponsesCallId(item.call_id);
      item.arguments = coerceResponsesArguments(item.arguments);
      return true;
    }
    if (item.type === "function_call_output") {
      item.call_id = clampResponsesCallId(item.call_id);
      item.output = coerceResponsesOutput(item.output);
      return true;
    }
    return true;
  });
}
function normalizeOpencodeReasoning(model, body) {
  const current = body.reasoning;
  const currentReasoning = current && typeof current === "object" && !Array.isArray(current) ? current : null;
  const requestedEffort = typeof body.reasoning_effort === "string" ? body.reasoning_effort : currentReasoning?.effort;
  if (typeof requestedEffort !== "string")
    return;
  const cleanModel = baseModelId(model || body.model);
  const supportedLevels = getThinkingLevels("opencode", cleanModel);
  let effort = requestedEffort.toLowerCase().trim();
  if ((effort === "max" || effort === "ultra") && supportedLevels?.length && !supportedLevels.includes(effort)) {
    if (effort === "ultra" && supportedLevels.includes("max"))
      effort = "max";
    else if (supportedLevels.includes("xhigh"))
      effort = "xhigh";
  }
  body.reasoning = { ...currentReasoning, effort };
  if (!body.reasoning.summary)
    body.reasoning.summary = "auto";
  delete body.reasoning_effort;
}
function dropAdaptiveReasoningEffort(body) {
  if (body?.reasoning_effort === "auto")
    delete body.reasoning_effort;
}

class OpenCodeExecutor extends BaseExecutor {
  constructor() {
    super("opencode", PROVIDERS.opencode);
  }
  prepareRequestCredentials({ body, credentials, providerSessionId, clientTool } = {}) {
    const sourceCredentials = credentials || {};
    const session = resolveOpencodeSession(body, sourceCredentials, providerSessionId, clientTool);
    return {
      ...sourceCredentials,
      [SESSION_FIELD]: session
    };
  }
  transformRequest(model, body, stream, credentials) {
    if (body && typeof body === "object" && model && !body.model)
      body.model = model;
    if (body && typeof body === "object")
      body.stream = true;
    if (isResponsesModel(model || body?.model) && body && typeof body === "object") {
      if ("tool_choice" in body && body.tool_choice !== "auto" && this.config.quirks?.forceAutoToolChoiceModels?.includes(baseModelId(model))) {
        body.tool_choice = "auto";
      }
      const normalized = normalizeResponsesInput(body.input);
      if (normalized)
        body.input = normalized;
      if (!Array.isArray(body.input) || body.input.length === 0) {
        body.input = [{ type: "message", role: "user", content: [{ type: "input_text", text: "..." }] }];
      }
      if (body.max_output_tokens === undefined) {
        if (body.max_completion_tokens !== undefined)
          body.max_output_tokens = body.max_completion_tokens;
        else if (body.max_tokens !== undefined)
          body.max_output_tokens = body.max_tokens;
      }
      delete body.max_tokens;
      delete body.max_completion_tokens;
      normalizeOpencodeReasoning(model, body);
      body.stream = true;
      body.store = false;
      normalizeResponsesTools(body);
      sanitizeResponsesItems(body);
      applyFingerprintTools(body, true);
    } else if (body && typeof body === "object") {
      dropAdaptiveReasoningEffort(body);
      applyFingerprintTools(body, false, { claude: isMessagesModel(model || body?.model) });
    }
    return injectReasoningContent({ provider: this.provider, model, body });
  }
  async execute(args) {
    const credentials = this.prepareRequestCredentials(args);
    return super.execute({
      ...args,
      credentials,
      directFetch: async (url, options) => {
        try {
          return await opencodeTlsFetch(url, {
            method: options.method,
            headers: options.headers,
            body: options.body
          }, { signal: options.signal });
        } catch (error) {
          if (error instanceof OpencodeTlsUnavailableError) {
            return fetch(url, options);
          }
          throw error;
        }
      }
    });
  }
  buildUrl(model) {
    const base = this.config.baseUrl;
    if (isResponsesModel(model))
      return `${base}/inference/v1/responses`;
    if (isMessagesModel(model))
      return `${base}/inference/v1/messages`;
    return `${base}/inference/v1/chat/completions`;
  }
  buildHeaders(credentials, stream = true, url = "") {
    const raw = credentials?.rawHeaders || {};
    const lower = {};
    for (const [k, v] of Object.entries(raw))
      lower[k.toLowerCase()] = v;
    const downstreamUa = lower["user-agent"] || "";
    const isOpencodeDownstream = hasValidOpencodeVersion(downstreamUa);
    const session = credentials?.[SESSION_FIELD] || this.prepareRequestCredentials({ credentials })[SESSION_FIELD];
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer public",
      "User-Agent": isOpencodeDownstream ? downstreamUa : OPENCODE_UA,
      "x-opencode-client": lower["x-opencode-client"] || OPENCODE_CLIENT,
      "x-opencode-session": session,
      "x-opencode-session-id": session,
      "x-session-affinity": session,
      "x-session-id": session,
      "x-opencode-project": lower["x-opencode-project"] || "global",
      Accept: stream ? "text/event-stream" : "*/*"
    };
    if (url.endsWith("/messages"))
      headers["anthropic-version"] = ANTHROPIC_API_VERSION;
    return headers;
  }
}

// service/core/translator/request/openai-responses.js
var MAX_TOOL_NAME_LEN2 = 128;
function openaiResponsesToOpenAIRequest(model, body, stream, credentials) {
  if (!body.input)
    return body;
  const result = { ...body };
  result.messages = [];
  if (body.instructions) {
    result.messages.push({ role: ROLE.SYSTEM, content: body.instructions });
  }
  let currentAssistantMsg = null;
  let pendingToolResults = [];
  let pendingReasoning = "";
  let pendingReasoningEncrypted = "";
  const additionalTools = [];
  const customToolNames = new Set;
  const inputItems = normalizeResponsesInput(body.input);
  if (!inputItems)
    return body;
  const extractReasoningText = (item) => {
    if (Array.isArray(item.summary)) {
      const txt = item.summary.map((s) => s?.text || "").filter(Boolean).join(`
`);
      if (txt)
        return txt;
    }
    if (Array.isArray(item.content)) {
      const txt = item.content.map((c) => c?.text || "").filter(Boolean).join(`
`);
      if (txt)
        return txt;
    }
    return "";
  };
  const attachPendingReasoning = (msg) => {
    if (pendingReasoning)
      msg.reasoning_content = pendingReasoning;
    if (pendingReasoningEncrypted)
      msg.encrypted_content = pendingReasoningEncrypted;
    pendingReasoning = "";
    pendingReasoningEncrypted = "";
  };
  for (const item of inputItems) {
    const itemType = item.type || (item.role ? RESPONSES_ITEM.MESSAGE : null);
    if (itemType === RESPONSES_ITEM.MESSAGE) {
      if (currentAssistantMsg) {
        result.messages.push(currentAssistantMsg);
        currentAssistantMsg = null;
      }
      if (pendingToolResults.length > 0) {
        for (const tr of pendingToolResults) {
          result.messages.push(tr);
        }
        pendingToolResults = [];
      }
      const content = Array.isArray(item.content) ? item.content.map((c) => {
        if (c.type === RESPONSES_ITEM.INPUT_TEXT)
          return { type: OPENAI_BLOCK.TEXT, text: c.text };
        if (c.type === RESPONSES_ITEM.OUTPUT_TEXT)
          return { type: OPENAI_BLOCK.TEXT, text: c.text };
        if (c.type === RESPONSES_ITEM.INPUT_IMAGE) {
          const url = c.image_url || c.file_id || "";
          return { type: OPENAI_BLOCK.IMAGE_URL, image_url: { url, detail: c.detail || "auto" } };
        }
        return c;
      }) : item.content;
      const msg = { role: item.role, content };
      if (item.role === ROLE.ASSISTANT)
        attachPendingReasoning(msg);
      else {
        pendingReasoning = "";
        pendingReasoningEncrypted = "";
      }
      result.messages.push(msg);
    } else if (itemType === RESPONSES_ITEM.FUNCTION_CALL || itemType === RESPONSES_ITEM.CUSTOM_TOOL_CALL) {
      if (!currentAssistantMsg) {
        currentAssistantMsg = {
          role: ROLE.ASSISTANT,
          content: null,
          tool_calls: []
        };
        attachPendingReasoning(currentAssistantMsg);
      }
      if (!item.name || typeof item.name !== "string" || item.name.trim() === "")
        continue;
      if (itemType === RESPONSES_ITEM.CUSTOM_TOOL_CALL)
        customToolNames.add(item.name);
      const toolInput = itemType === RESPONSES_ITEM.CUSTOM_TOOL_CALL ? { input: typeof item.input === "string" ? item.input : JSON.stringify(item.input ?? "") } : item.arguments;
      currentAssistantMsg.tool_calls.push({
        id: item.call_id,
        type: OPENAI_BLOCK.FUNCTION,
        function: {
          name: item.name,
          arguments: typeof toolInput === "string" ? toolInput : JSON.stringify(toolInput ?? {})
        }
      });
    } else if (itemType === RESPONSES_ITEM.FUNCTION_CALL_OUTPUT || itemType === RESPONSES_ITEM.CUSTOM_TOOL_CALL_OUTPUT) {
      if (currentAssistantMsg) {
        result.messages.push(currentAssistantMsg);
        currentAssistantMsg = null;
      }
      if (pendingToolResults.length > 0) {
        for (const tr of pendingToolResults) {
          result.messages.push(tr);
        }
        pendingToolResults = [];
      }
      result.messages.push({
        role: ROLE.TOOL,
        tool_call_id: item.call_id,
        content: typeof item.output === "string" ? item.output : JSON.stringify(item.output)
      });
    } else if (itemType === RESPONSES_ITEM.ADDITIONAL_TOOLS) {
      if (Array.isArray(item.tools))
        additionalTools.push(...item.tools);
    } else if (itemType === RESPONSES_ITEM.REASONING) {
      const txt = extractReasoningText(item);
      if (txt)
        pendingReasoning = pendingReasoning ? `${pendingReasoning}
${txt}` : txt;
      if (typeof item.encrypted_content === "string" && item.encrypted_content) {
        pendingReasoningEncrypted = item.encrypted_content;
      }
      continue;
    }
  }
  if (currentAssistantMsg) {
    result.messages.push(currentAssistantMsg);
  }
  if (pendingToolResults.length > 0) {
    for (const tr of pendingToolResults) {
      result.messages.push(tr);
    }
  }
  const responseTools = [
    ...Array.isArray(body.tools) ? body.tools : [],
    ...additionalTools
  ];
  if (responseTools.length > 0) {
    result.tools = responseTools.map((tool) => {
      if (tool.function)
        return tool;
      const name = tool.name;
      if (!name || typeof name !== "string" || name.trim() === "")
        return null;
      if (tool.type === "custom") {
        customToolNames.add(name);
        const formatHint = [tool.format?.syntax, tool.format?.definition].filter(Boolean).join(`
`);
        return {
          type: OPENAI_BLOCK.FUNCTION,
          function: {
            name,
            description: [String(tool.description || ""), formatHint].filter(Boolean).join(`

`),
            parameters: {
              type: "object",
              properties: {
                input: {
                  type: "string",
                  description: "Raw freeform input for this custom tool"
                }
              },
              required: ["input"],
              additionalProperties: false
            }
          }
        };
      }
      return {
        type: OPENAI_BLOCK.FUNCTION,
        function: {
          name,
          description: String(tool.description || ""),
          parameters: normalizeToolParameters(tool.parameters),
          strict: tool.strict
        }
      };
    }).filter(Boolean);
  }
  if (customToolNames.size > 0)
    result._customToolNames = [...customToolNames];
  if (result.max_output_tokens !== undefined) {
    if (result.max_tokens === undefined)
      result.max_tokens = result.max_output_tokens;
    delete result.max_output_tokens;
  }
  delete result.input;
  delete result.instructions;
  delete result.include;
  delete result.prompt_cache_key;
  delete result.store;
  if (typeof result.reasoning?.effort === "string") {
    result.reasoning_effort = result.reasoning.effort;
  }
  delete result.reasoning;
  delete result.client_metadata;
  return result;
}
function extractInstructionsText(content) {
  if (typeof content === "string")
    return content;
  if (Array.isArray(content)) {
    return content.map((c) => {
      if (typeof c?.text === "string")
        return c.text;
      if (typeof c?.content === "string")
        return c.content;
      return "";
    }).filter(Boolean).join(`
`);
  }
  return "";
}
function normalizeToolParameters(params) {
  if (!params)
    return { type: "object", properties: {} };
  if (params.type === "object" && !params.properties)
    return { ...params, properties: {} };
  return params;
}
function buildReasoningInputItem(msg) {
  if (!msg || typeof msg !== "object")
    return null;
  const encrypted = typeof msg.encrypted_content === "string" && msg.encrypted_content || typeof msg.reasoning_encrypted_content === "string" && msg.reasoning_encrypted_content || typeof msg.reasoning?.encrypted_content === "string" && msg.reasoning.encrypted_content || "";
  let summaryText = "";
  if (typeof msg.reasoning_content === "string" && msg.reasoning_content.trim()) {
    summaryText = msg.reasoning_content;
  } else if (typeof msg.reasoning === "string" && msg.reasoning.trim()) {
    summaryText = msg.reasoning;
  } else if (Array.isArray(msg.reasoning_details)) {
    summaryText = msg.reasoning_details.map((d) => typeof d?.text === "string" ? d.text : typeof d?.content === "string" ? d.content : "").filter(Boolean).join(`
`);
  }
  if (!encrypted && !summaryText)
    return null;
  const item = { type: RESPONSES_ITEM.REASONING };
  if (summaryText) {
    item.summary = [{ type: RESPONSES_ITEM.SUMMARY_TEXT, text: summaryText }];
  }
  if (encrypted)
    item.encrypted_content = encrypted;
  return item;
}
function openaiToOpenAIResponsesRequest(model, body, stream, credentials) {
  if (body.input) {
    const out = { ...body, model, stream: true };
    if (out.max_output_tokens === undefined) {
      if (out.max_completion_tokens !== undefined)
        out.max_output_tokens = out.max_completion_tokens;
      else if (out.max_tokens !== undefined)
        out.max_output_tokens = out.max_tokens;
    }
    delete out.max_tokens;
    delete out.max_completion_tokens;
    return out;
  }
  const result = {
    model,
    input: [],
    stream: true,
    store: false
  };
  let hasSystemMessage = false;
  const messages = body.messages || [];
  for (const msg of messages) {
    if (msg.role === ROLE.SYSTEM || msg.role === ROLE.DEVELOPER) {
      if (!hasSystemMessage) {
        result.instructions = extractInstructionsText(msg.content);
        hasSystemMessage = true;
      }
      continue;
    }
    if (msg.role === ROLE.USER || msg.role === ROLE.ASSISTANT) {
      if (msg.role === ROLE.ASSISTANT) {
        const reasoningItem = buildReasoningInputItem(msg);
        if (reasoningItem)
          result.input.push(reasoningItem);
      }
      const contentType = msg.role === ROLE.USER ? RESPONSES_ITEM.INPUT_TEXT : RESPONSES_ITEM.OUTPUT_TEXT;
      const content = typeof msg.content === "string" ? [{ type: contentType, text: msg.content }] : Array.isArray(msg.content) ? msg.content.map((c) => {
        if (c.type === OPENAI_BLOCK.TEXT)
          return { type: contentType, text: c.text };
        if (c.type === OPENAI_BLOCK.IMAGE_URL) {
          const url = typeof c.image_url === "string" ? c.image_url : c.image_url?.url;
          return { type: RESPONSES_ITEM.INPUT_IMAGE, image_url: url, detail: c.image_url?.detail || "auto" };
        }
        if (c.type === RESPONSES_ITEM.INPUT_IMAGE)
          return c;
        const text = c.text || c.content || JSON.stringify(c);
        return { type: contentType, text: typeof text === "string" ? text : JSON.stringify(text) };
      }) : [];
      if (content.length > 0) {
        result.input.push({
          type: RESPONSES_ITEM.MESSAGE,
          role: msg.role,
          content
        });
      }
    }
    if (msg.role === ROLE.ASSISTANT && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        const name = typeof tc.function?.name === "string" ? tc.function.name.trim() : "";
        if (!name)
          continue;
        result.input.push({
          type: RESPONSES_ITEM.FUNCTION_CALL,
          call_id: clampResponsesCallId(tc.id),
          name: name.slice(0, MAX_TOOL_NAME_LEN2),
          arguments: coerceResponsesArguments(tc.function?.arguments)
        });
      }
    }
    if (msg.role === ROLE.TOOL) {
      result.input.push({
        type: RESPONSES_ITEM.FUNCTION_CALL_OUTPUT,
        call_id: clampResponsesCallId(msg.tool_call_id),
        output: coerceResponsesOutput(msg.content)
      });
    }
  }
  if (!hasSystemMessage) {
    result.instructions = "";
  }
  if (body.tools && Array.isArray(body.tools)) {
    result.tools = body.tools.map((tool) => {
      if (tool.type === OPENAI_BLOCK.FUNCTION) {
        const name = typeof tool.function?.name === "string" ? tool.function.name.trim() : "";
        if (!name)
          return null;
        return {
          type: OPENAI_BLOCK.FUNCTION,
          name: name.slice(0, MAX_TOOL_NAME_LEN2),
          description: String(tool.function.description || ""),
          parameters: normalizeToolParameters(tool.function.parameters),
          strict: tool.function.strict
        };
      }
      return tool;
    }).filter(Boolean);
  }
  if (body.temperature !== undefined)
    result.temperature = body.temperature;
  if (body.max_output_tokens !== undefined) {
    result.max_output_tokens = body.max_output_tokens;
  } else if (body.max_completion_tokens !== undefined) {
    result.max_output_tokens = body.max_completion_tokens;
  } else if (body.max_tokens !== undefined) {
    result.max_output_tokens = body.max_tokens;
  }
  if (body.top_p !== undefined)
    result.top_p = body.top_p;
  if (body.reasoning !== undefined)
    result.reasoning = body.reasoning;
  if (body.reasoning_effort !== undefined)
    result.reasoning = { effort: body.reasoning_effort, summary: "auto" };
  if (body.service_tier !== undefined)
    result.service_tier = body.service_tier;
  if (body.prompt_cache_key !== undefined)
    result.prompt_cache_key = body.prompt_cache_key;
  return result;
}
register(FORMATS.OPENAI_RESPONSES, FORMATS.OPENAI, openaiResponsesToOpenAIRequest, null);
register(FORMATS.OPENAI, FORMATS.OPENAI_RESPONSES, openaiToOpenAIResponsesRequest, null);

// service/core/config/appConstants.js
var CLAUDE_SYSTEM_PROMPT = "You are Claude Code, Anthropic's official CLI for Claude.";

// service/core/translator/formats/maxTokens.js
function adjustMaxTokens(body, ceiling = DEFAULT_MAX_TOKENS) {
  let maxTokens = body.max_tokens || DEFAULT_MAX_TOKENS;
  if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
    if (maxTokens < DEFAULT_MIN_TOKENS) {
      maxTokens = DEFAULT_MIN_TOKENS;
    }
  }
  if (body.thinking?.budget_tokens && maxTokens <= body.thinking.budget_tokens) {
    maxTokens = body.thinking.budget_tokens + 1024;
  }
  if (maxTokens > ceiling)
    maxTokens = ceiling;
  return maxTokens;
}

// service/core/translator/concerns/json.js
function safeParseJSON(str, fallback) {
  if (typeof str !== "string")
    return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// service/core/translator/concerns/image.js
var DATA_URI_RE = /^data:([^;]+);base64,([\s\S]+)$/;
function parseDataUri(url) {
  if (typeof url !== "string")
    return null;
  const match = url.match(DATA_URI_RE);
  return match ? { mimeType: match[1], base64: match[2] } : null;
}

// service/core/translator/formats/gemini.js
function extractTextContent(content, separator = "") {
  if (typeof content === "string")
    return content;
  if (Array.isArray(content)) {
    return content.filter((part) => part.type === OPENAI_BLOCK.TEXT).map((part) => part.text).join(separator);
  }
  return "";
}

// service/core/translator/request/openai-to-claude.js
var CLAUDE_OAUTH_TOOL_PREFIX = "";
function openaiToClaudeRequest(model, body, stream) {
  const toolNameMap = new Map;
  const modelCeiling = getCapabilitiesForModel(null, model).maxOutput || undefined;
  const result = {
    model,
    max_tokens: adjustMaxTokens(body, modelCeiling),
    stream
  };
  if (body.temperature !== undefined) {
    result.temperature = body.temperature;
  }
  result.messages = [];
  const systemParts = [];
  if (body.messages && Array.isArray(body.messages)) {
    for (const msg of body.messages) {
      if (msg.role === ROLE.SYSTEM) {
        systemParts.push(typeof msg.content === "string" ? msg.content : extractTextContent(msg.content, `
`));
      }
    }
    const nonSystemMessages = body.messages.filter((m) => m.role !== ROLE.SYSTEM);
    let currentRole = undefined;
    let currentParts = [];
    const flushCurrentMessage = () => {
      if (currentRole && currentParts.length > 0) {
        result.messages.push({ role: currentRole, content: currentParts });
        currentParts = [];
      }
    };
    for (const msg of nonSystemMessages) {
      const newRole = msg.role === ROLE.USER || msg.role === ROLE.TOOL ? ROLE.USER : ROLE.ASSISTANT;
      const blocks = getContentBlocksFromMessage(msg, toolNameMap);
      const hasToolUse = blocks.some((b) => b.type === CLAUDE_BLOCK.TOOL_USE);
      const hasToolResult = blocks.some((b) => b.type === CLAUDE_BLOCK.TOOL_RESULT);
      if (hasToolResult) {
        const toolResultBlocks = blocks.filter((b) => b.type === CLAUDE_BLOCK.TOOL_RESULT);
        const otherBlocks = blocks.filter((b) => b.type !== CLAUDE_BLOCK.TOOL_RESULT);
        flushCurrentMessage();
        if (toolResultBlocks.length > 0) {
          result.messages.push({ role: ROLE.USER, content: toolResultBlocks });
        }
        if (otherBlocks.length > 0) {
          currentRole = newRole;
          currentParts.push(...otherBlocks);
        }
        continue;
      }
      if (currentRole !== newRole) {
        flushCurrentMessage();
        currentRole = newRole;
      }
      currentParts.push(...blocks);
      if (hasToolUse) {
        flushCurrentMessage();
      }
    }
    flushCurrentMessage();
    for (let i = result.messages.length - 1;i >= 0; i--) {
      const message = result.messages[i];
      if (message.role === ROLE.ASSISTANT && Array.isArray(message.content) && message.content.length > 0) {
        const validBlockTypes = [CLAUDE_BLOCK.TEXT, CLAUDE_BLOCK.TOOL_USE, CLAUDE_BLOCK.TOOL_RESULT, CLAUDE_BLOCK.IMAGE];
        for (let j = message.content.length - 1;j >= 0; j--) {
          const block = message.content[j];
          if (validBlockTypes.includes(block.type)) {
            block.cache_control = { type: "ephemeral" };
            break;
          }
        }
        break;
      }
    }
  }
  if (body.response_format) {
    const responseFormat = body.response_format;
    if (responseFormat.type === "json_schema" && responseFormat.json_schema?.schema) {
      const schemaJson = JSON.stringify(responseFormat.json_schema.schema, null, 2);
      systemParts.push(`You must respond with valid JSON that strictly follows this JSON schema:
\`\`\`json
${schemaJson}
\`\`\`
Respond ONLY with the JSON object, no other text.`);
    } else if (responseFormat.type === "json_object") {
      systemParts.push("You must respond with valid JSON. Respond ONLY with a JSON object, no other text.");
    }
  }
  const claudeCodePrompt = { type: CLAUDE_BLOCK.TEXT, text: CLAUDE_SYSTEM_PROMPT };
  if (systemParts.length > 0) {
    const systemText = systemParts.join(`
`);
    result.system = [
      claudeCodePrompt,
      { type: CLAUDE_BLOCK.TEXT, text: systemText, cache_control: { type: "ephemeral", ttl: "1h" } }
    ];
  } else {
    result.system = [claudeCodePrompt];
  }
  if (body.tools && Array.isArray(body.tools)) {
    result.tools = [];
    for (const tool of body.tools) {
      const toolType = tool.type;
      if (toolType && toolType !== OPENAI_BLOCK.FUNCTION) {
        result.tools.push(tool);
        continue;
      }
      const toolData = tool.function ?? tool;
      const originalName = toolData.name;
      const toolName = CLAUDE_OAUTH_TOOL_PREFIX + originalName;
      toolNameMap.set(toolName, originalName);
      result.tools.push({
        name: toolName,
        description: toolData.description || "",
        input_schema: toolData.parameters || toolData.input_schema || { type: "object", properties: {}, required: [] }
      });
    }
    if (result.tools.length > 0) {
      result.tools[result.tools.length - 1].cache_control = { type: "ephemeral", ttl: "1h" };
    }
  }
  if (body.tool_choice) {
    result.tool_choice = convertOpenAIToolChoice(body.tool_choice);
  }
  if (toolNameMap.size > 0) {
    result._toolNameMap = toolNameMap;
  }
  return result;
}
function getContentBlocksFromMessage(msg, toolNameMap = new Map) {
  const blocks = [];
  if (msg.role === ROLE.TOOL) {
    blocks.push({
      type: CLAUDE_BLOCK.TOOL_RESULT,
      tool_use_id: msg.tool_call_id,
      content: msg.content
    });
  } else if (msg.role === ROLE.USER) {
    if (typeof msg.content === "string") {
      if (msg.content) {
        blocks.push({ type: CLAUDE_BLOCK.TEXT, text: msg.content });
      }
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === OPENAI_BLOCK.TEXT && part.text) {
          blocks.push({ type: CLAUDE_BLOCK.TEXT, text: part.text });
        } else if (part.type === CLAUDE_BLOCK.TOOL_RESULT) {
          blocks.push({
            type: CLAUDE_BLOCK.TOOL_RESULT,
            tool_use_id: part.tool_use_id,
            content: part.content,
            ...part.is_error && { is_error: part.is_error }
          });
        } else if (part.type === OPENAI_BLOCK.IMAGE_URL) {
          const url = part.image_url.url;
          const parsed = parseDataUri(url);
          if (parsed) {
            blocks.push({
              type: CLAUDE_BLOCK.IMAGE,
              source: { type: "base64", media_type: parsed.mimeType, data: parsed.base64 }
            });
          } else if (url.startsWith("http://") || url.startsWith("https://")) {
            blocks.push({
              type: CLAUDE_BLOCK.IMAGE,
              source: { type: "url", url }
            });
          }
        } else if (part.type === OPENAI_BLOCK.IMAGE && part.source) {
          blocks.push({ type: CLAUDE_BLOCK.IMAGE, source: part.source });
        } else if (part.type === OPENAI_BLOCK.FILE && part.file) {
          const fileData = part.file.file_data;
          const parsed = parseDataUri(fileData);
          if (parsed && parsed.mimeType === "application/pdf") {
            blocks.push({
              type: CLAUDE_BLOCK.DOCUMENT,
              source: { type: "base64", media_type: parsed.mimeType, data: parsed.base64 }
            });
          }
        }
      }
    }
  } else if (msg.role === ROLE.ASSISTANT) {
    if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === OPENAI_BLOCK.TEXT && part.text) {
          blocks.push({ type: CLAUDE_BLOCK.TEXT, text: part.text });
        } else if (part.type === CLAUDE_BLOCK.TOOL_USE) {
          blocks.push({ type: CLAUDE_BLOCK.TOOL_USE, id: part.id, name: part.name, input: part.input });
        } else if (part.type === CLAUDE_BLOCK.THINKING) {
          const { cache_control, ...thinkingBlock } = part;
          blocks.push(thinkingBlock);
        }
      }
    } else if (msg.content) {
      const text = typeof msg.content === "string" ? msg.content : extractTextContent(msg.content, `
`);
      if (text) {
        blocks.push({ type: CLAUDE_BLOCK.TEXT, text });
      }
    }
    if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
      for (const tc of msg.tool_calls) {
        if (tc.type === OPENAI_BLOCK.FUNCTION) {
          const toolName = CLAUDE_OAUTH_TOOL_PREFIX + tc.function.name;
          blocks.push({
            type: CLAUDE_BLOCK.TOOL_USE,
            id: tc.id,
            name: toolName,
            input: safeParseJSON(tc.function.arguments, tc.function.arguments)
          });
        }
      }
    }
  }
  return blocks;
}
var CLAUDE_TOOL_CHOICE_TYPES = new Set(["auto", "any", "tool", "none"]);
function convertOpenAIToolChoice(choice) {
  if (!choice)
    return { type: "auto" };
  if (typeof choice === "string") {
    if (choice === "required")
      return { type: "any" };
    return { type: "auto" };
  }
  if (typeof choice === "object") {
    if (choice.function?.name) {
      return { type: "tool", name: choice.function.name };
    }
    if (CLAUDE_TOOL_CHOICE_TYPES.has(choice.type)) {
      return choice;
    }
  }
  return { type: "auto" };
}
register(FORMATS.OPENAI, FORMATS.CLAUDE, openaiToClaudeRequest, null);

// service/core/translator/index.js
var requestRegistry;
var responseRegistry;
function register(from, to, requestFn, responseFn) {
  requestRegistry ??= new Map;
  responseRegistry ??= new Map;
  const key = String(from) + ":" + String(to);
  if (requestFn)
    requestRegistry.set(key, requestFn);
  if (responseFn)
    responseRegistry.set(key, responseFn);
}
function translateRequest(sourceFormat, targetFormat, model, body, stream = true, credentials = null) {
  requestRegistry ??= new Map;
  responseRegistry ??= new Map;
  if (sourceFormat === targetFormat)
    return body;
  const translator = requestRegistry.get(String(sourceFormat) + ":" + String(targetFormat));
  if (!translator) {
    throw new Error("Unsupported native request translation: " + sourceFormat + " -> " + targetFormat);
  }
  return translator(model, body, stream, credentials);
}

// service/core/provider-adapter.js
var cleanModelId2 = (model) => {
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  return clean.startsWith("blackrouter/") ? clean.slice("blackrouter/".length) : clean;
};
var targetFormatForModel = (model) => {
  const base = cleanModelId2(model);
  const registryEntry = (PROVIDERS.opencode.models || []).find((entry) => entry.id === base);
  if (registryEntry?.targetFormat)
    return registryEntry.targetFormat;
  return isMuseSparkModel(base) ? FORMATS.OPENAI_RESPONSES : FORMATS.OPENAI;
};
var normalizeHeaders = (headers) => Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), String(value)]));
var toolNameOf2 = (tool) => {
  if (!tool || typeof tool !== "object")
    return "";
  if (typeof tool.name === "string")
    return tool.name;
  if (typeof tool.function?.name === "string")
    return tool.function.name;
  return "";
};
var inferToolNameMap = (sourceNames, transformedBody) => {
  const map = new Map;
  const transformedTools = Array.isArray(transformedBody?.tools) ? transformedBody.tools : [];
  const transformedNames = new Set(transformedTools.map(toolNameOf2).filter(Boolean));
  for (const originalName of ["read", "shell"]) {
    if (!sourceNames.has(originalName))
      continue;
    const aliasPrefix = originalName + "_client";
    const alias = [...transformedNames].filter((name) => {
      if (!name.startsWith(aliasPrefix) || sourceNames.has(name))
        return false;
      const suffix = name.slice(aliasPrefix.length);
      return suffix === "" || [...suffix].every((digit) => digit >= "0" && digit <= "9");
    })[0];
    if (alias)
      map.set(alias, originalName);
  }
  return map;
};
var normalizeMessagesFingerprintTools = (body) => {
  if (!body || typeof body !== "object" || !Array.isArray(body.tools))
    return body;
  const injectedNames = [];
  body.tools = body.tools.map((tool) => {
    const fn = tool?.function;
    if (!fn || !["read", "shell"].includes(fn.name))
      return tool;
    injectedNames.push(fn.name);
    return {
      name: fn.name,
      description: fn.description,
      input_schema: fn.parameters || { type: "object", properties: {} }
    };
  });
  if (injectedNames.length > 0) {
    const names = [...new Set(injectedNames)];
    const list = names.length > 1 ? "read and shell" : names[0];
    const note = names.length > 1 ? "Do not call the " + list + " tools; they are placeholders that do nothing. Use the other tools you have been given instead." : "Do not call the " + list + " tool; it is a placeholder that does nothing. Use the other tools you have been given instead.";
    if (typeof body.system === "string" && body.system.trim()) {
      body.system += `

` + note;
    } else if (Array.isArray(body.system)) {
      body.system.push({ type: "text", text: note });
    } else {
      body.system = note;
    }
  }
  return body;
};
var prepareProviderRequest = async ({ model, body, session, rawHeaders = {} }) => {
  const upstreamModel = cleanModelId2(model);
  const originalToolNames = new Set((Array.isArray(body?.tools) ? body.tools : []).map(toolNameOf2).filter(Boolean));
  const targetFormat = targetFormatForModel(upstreamModel);
  const credentials = {
    connectionId: session,
    rawHeaders: { ...rawHeaders, "x-opencode-session": session },
    providerSpecificData: {}
  };
  const sourceBody = { ...body, model: upstreamModel };
  const translatedBody = targetFormat === FORMATS.OPENAI ? sourceBody : translateRequest(FORMATS.OPENAI, targetFormat, upstreamModel, sourceBody, true, credentials);
  const executor = new OpenCodeExecutor;
  const prepared = await executor.execute({
    model: upstreamModel,
    body: translatedBody,
    stream: true,
    credentials,
    providerSessionId: session,
    clientTool: "generic",
    dispatch: async ({ url, headers, body: outboundBody, responseFormat, directFetch }) => {
      const transportBody = responseFormat === "claude" ? normalizeMessagesFingerprintTools(outboundBody) : outboundBody;
      const toolNameMap = takeRenamedToolNames(outboundBody) || inferToolNameMap(originalToolNames, outboundBody);
      return {
        url: new URL(url),
        headers: normalizeHeaders(headers),
        body: JSON.stringify(transportBody),
        responseFormat,
        lane: responseFormat === "openai-responses" ? "responses" : responseFormat === "claude" ? "messages" : "chat",
        toolNameMap,
        directFetch
      };
    }
  });
  return prepared;
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
var isOpenCodeFreeTierGateResponse = (status, body, isOpenCode, usedProxyPool) => status === 403 && isOpenCode && usedProxyPool && body.includes("FreeTierError");
var hasSameUpstreamOrigin = (left, right) => {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return left === right;
  }
};
var buildTarget = (config, call, poolOverride, nativeUrl) => {
  const activePool = poolOverride !== undefined ? poolOverride : (config.proxyPools || []).find((p) => p.isActive && p.proxyUrl.trim()) ?? null;
  const parsed = new URL(config.upstream);
  const isOpenCode = isOpenCodeUpstream(config.upstream);
  const upstreamAuthHeaders = !isOpenCode && config.upstreamApiKey?.trim() ? { authorization: `Bearer ${config.upstreamApiKey.trim()}` } : {};
  let targetOrigin;
  let targetPath;
  if (isOpenCode) {
    targetOrigin = nativeUrl?.origin ?? "https://opencode.ai";
    if (call === "models") {
      targetPath = "/zen/v1/models";
    } else if (nativeUrl) {
      targetPath = nativeUrl.pathname + nativeUrl.search;
    } else {
      throw new Error("The native provider core must resolve the OpenCode request URL before transport.");
    }
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
  const upstreamUserAgent = isOpenCode ? "opencode/latest/2.1.4/cli" : "BlackRouter/1.0";
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
var createSseFirstByteKeepAlive = (keepAliveMs = Number(process.env.SSE_KEEPALIVE_MS ?? 15000)) => {
  let timer = null;
  let seenData = false;
  const stream = new Transform3({
    transform(chunk, _encoding, callback) {
      seenData = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      callback(null, chunk);
    },
    flush(callback) {
      if (timer)
        clearInterval(timer);
      timer = null;
      callback();
    }
  });
  stream.once("pipe", () => {
    if (!Number.isFinite(keepAliveMs) || keepAliveMs <= 0 || seenData)
      return;
    timer = setInterval(() => {
      if (!seenData && !stream.destroyed && !stream.writableEnded) {
        stream.push(Buffer.from(`: ping

`));
      }
    }, keepAliveMs);
    timer.unref?.();
  });
  stream.once("close", () => {
    if (timer)
      clearInterval(timer);
    timer = null;
  });
  return stream;
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
  writeJson(response, status, { error: { message: redactDiagnosticText(message), type: "invalid_request_error", code } }, headers);
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
  const failedPoolIds = new Set;
  const advanceToNextAttempt = () => {
    let nextIndex = attemptIndex + 1;
    while (nextIndex < attempts.length) {
      const nextAttempt = attempts[nextIndex];
      if (nextAttempt?.pool && (rateLimitedPoolIds.has(nextAttempt.pool.id) || failedPoolIds.has(nextAttempt.pool.id))) {
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
  const modelAwareBody = async (model) => {
    let parsed;
    try {
      parsed = JSON.parse(prepared.body);
    } catch {
      throw new Error("Prepared request body was not valid JSON.");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Prepared request body must be a JSON object.");
    }
    const body = parsed;
    body.model = model;
    if (!isOpenCodeUpstream(config.upstream)) {
      return { lane: "chat", body: JSON.stringify(body) };
    }
    const native = await prepareProviderRequest({ model, body, session });
    return {
      lane: native.lane,
      body: native.body,
      headers: native.headers,
      url: native.url,
      toolNameMap: native.toolNameMap,
      directFetch: native.directFetch
    };
  };
  const sendAttempt = async () => {
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
    let nativeHeaders = {};
    let nativeUrl;
    let nativeToolNameMap = null;
    let nativeDirectFetch;
    try {
      const preparedForModel = await modelAwareBody(attempt.model);
      lane = preparedForModel.lane;
      upstreamBody = preparedForModel.body;
      nativeHeaders = preparedForModel.headers ?? {};
      nativeUrl = preparedForModel.url;
      nativeToolNameMap = preparedForModel.toolNameMap ?? null;
      nativeDirectFetch = preparedForModel.directFetch;
    } catch (error) {
      writeOpenAiError(response, 400, error instanceof Error ? error.message : "Could not prepare the native provider request.", "invalid_request");
      return;
    }
    const target = buildTarget(config, "chat", candidate, nativeUrl);
    const requestHeaders = { ...isOpenCodeUpstream(config.upstream) ? nativeHeaders : {}, ...target.headers, "content-type": "application/json", accept: "text/event-stream", "content-length": String(Buffer.byteLength(upstreamBody)) };
    const transport = target.url.protocol === "http:" ? http2 : https2;
    const usesNativeDirectTransport = candidate === null && isOpenCodeUpstream(config.upstream) && typeof nativeDirectFetch === "function";
    const handleAnswer = (answer) => {
      const status = answer.statusCode ?? 502;
      const retryAfterHeader = answer.headers["retry-after"];
      const retryAfter = typeof retryAfterHeader === "string" ? retryAfterHeader : undefined;
      const isShortDirect429 = status === 429 && candidate === null && retryAfter !== undefined && parseRetryAfterMs(retryAfter) <= 2000;
      if (status === 403 && candidate && isOpenCodeUpstream(config.upstream)) {
        const maxInspectableErrorBytes = 256 * 1024;
        const chunks = [];
        let inspectedBytes = 0;
        let inspecting = true;
        answer.on("data", (raw) => {
          const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
          if (!inspecting) {
            if (!response.destroyed && !response.writableEnded)
              response.write(chunk);
            return;
          }
          chunks.push(chunk);
          inspectedBytes += chunk.length;
          if (inspectedBytes > maxInspectableErrorBytes) {
            inspecting = false;
            const routeHeaders = routingHeaders(attempt);
            response.writeHead(status, {
              ...responseHeaders(answer.headers),
              ...routeHeaders
            });
            for (const buffered of chunks)
              response.write(buffered);
            chunks.length = 0;
          }
        });
        answer.on("end", () => {
          if (!inspecting) {
            if (!response.destroyed && !response.writableEnded)
              response.end();
            return;
          }
          const bodyBuffer = Buffer.concat(chunks);
          const bodyText = bodyBuffer.toString("utf8");
          if (isOpenCodeFreeTierGateResponse(status, bodyText, true, true)) {
            failedPoolIds.add(candidate.id);
            if (advanceToNextAttempt()) {
              fallbackReasons.push(`HTTP 403 FreeTierError on proxy pool ${candidate.name}`);
              sendAttempt();
              return;
            }
          }
          const routeHeaders = routingHeaders(attempt);
          response.writeHead(status, {
            ...responseHeaders(answer.headers),
            ...routeHeaders
          });
          response.end(bodyBuffer);
        });
        answer.on("error", (error) => {
          if (!response.headersSent) {
            writeOpenAiError(response, 502, `Could not read the upstream error response: ${error.message}`, "upstream_unreachable");
          } else {
            response.destroy(error);
          }
        });
        return;
      }
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
      const protocolTransform = contentType.includes("text/event-stream") ? lane === "chat" ? createToolNameRestoreTransform(nativeToolNameMap) : createOpenCodeResponseTransform(lane, attempt.model, nativeToolNameMap) : null;
      const successHeaders = {
        ...responseHeaders(answer.headers),
        ...routeHeaders
      };
      if (prepared.stream) {
        response.writeHead(status, successHeaders);
        const observer = createUsageObserver((usage) => onUsage?.(usage));
        const keepAliveMs = Number(process.env.SSE_KEEPALIVE_MS ?? 15000);
        const keepAlive = contentType.includes("text/event-stream") && Number.isFinite(keepAliveMs) && keepAliveMs > 0 ? createSseFirstByteKeepAlive(keepAliveMs) : null;
        if (protocolTransform && keepAlive) {
          pipeline(answer, protocolTransform, observer, keepAlive, response, () => {});
        } else if (protocolTransform) {
          pipeline(answer, protocolTransform, observer, response, () => {});
        } else if (keepAlive) {
          pipeline(answer, observer, keepAlive, response, () => {});
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
    };
    const handleTransportError = (error) => {
      if (!response.headersSent && !response.destroyed && advanceToNextAttempt()) {
        fallbackReasons.push(`network error on ${lastRequestedModel}`);
        sendAttempt();
        return;
      }
      const routeHeaders = routingHeaders(attempt);
      for (const [name, value] of Object.entries(routeHeaders))
        response.setHeader(name, value);
      writeOpenAiError(response, 502, `The upstream did not answer for ${lastRequestedModel}: ${error.message}`, "upstream_unreachable", routeHeaders);
    };
    let upstream = null;
    let directAbort = null;
    if (usesNativeDirectTransport && nativeDirectFetch) {
      directAbort = new AbortController;
      nativeDirectFetch(target.url, { method: "POST", headers: requestHeaders, body: upstreamBody, signal: AbortSignal.any([directAbort.signal, AbortSignal.timeout(120000)]) }).then((fetched) => {
        const body = fetched.body ? Readable.fromWeb(fetched.body) : Readable.from([]);
        const wrapped = body;
        Object.defineProperty(wrapped, "statusCode", { value: fetched.status });
        Object.defineProperty(wrapped, "headers", { value: Object.fromEntries(fetched.headers.entries()) });
        handleAnswer(wrapped);
      }).catch((error) => handleTransportError(error instanceof Error ? error : new Error(String(error))));
    } else {
      upstream = transport.request(target.url, { method: "POST", agent: target.agent, headers: requestHeaders }, handleAnswer);
      upstream.on("error", handleTransportError);
      upstream.end(upstreamBody);
    }
    response.on("close", () => {
      if (response.writableEnded)
        return;
      upstream?.destroy();
      directAbort?.abort(new Error("Downstream client disconnected."));
    });
  };
  sendAttempt();
};

// service/core/rtk/constants.js
var RAW_CAP = 10 * 1024 * 1024;
var MIN_COMPRESS_SIZE = 500;
var DETECT_WINDOW = 1024;
var GIT_DIFF_HUNK_MAX_LINES = 100;
var GIT_LOG_MAX_LINES = 200;
var DEDUP_LINE_MAX = 2000;
var GREP_PER_FILE_MAX = 10;
var FIND_PER_DIR_MAX = 10;
var FIND_TOTAL_DIR_MAX = 20;
var STATUS_MAX_FILES = 10;
var STATUS_MAX_UNTRACKED = 10;
var LS_EXT_SUMMARY_TOP = 5;
var LS_NOISE_DIRS = [
  "node_modules",
  ".git",
  "target",
  "__pycache__",
  ".next",
  "dist",
  "build",
  ".cache",
  ".turbo",
  ".vercel",
  ".pytest_cache",
  ".mypy_cache",
  ".tox",
  ".venv",
  "venv",
  "env",
  "coverage",
  ".nyc_output",
  ".DS_Store",
  "Thumbs.db",
  ".idea",
  ".vscode",
  ".vs",
  "*.egg-info",
  ".eggs"
];
var TREE_MAX_LINES = 200;
var SEARCH_LIST_PER_DIR_MAX = 10;
var SEARCH_LIST_TOTAL_DIR_MAX = 20;
var SMART_TRUNCATE_HEAD = 120;
var SMART_TRUNCATE_TAIL = 60;
var SMART_TRUNCATE_MIN_LINES = 250;
var READ_NUMBERED_MIN_HIT_RATIO = 0.7;

// service/core/rtk/filters/gitDiff.js
function gitDiff(diff, maxLines = 500) {
  const result = [];
  let currentFile = "";
  let added = 0;
  let removed = 0;
  let inHunk = false;
  let hunkShown = 0;
  let hunkSkipped = 0;
  let wasTruncated = false;
  const maxHunkLines = GIT_DIFF_HUNK_MAX_LINES;
  const lines = diff.split(`
`);
  outer:
    for (const line of lines) {
      if (line.startsWith("diff --git")) {
        if (hunkSkipped > 0) {
          result.push(`  ... (${hunkSkipped} lines truncated)`);
          wasTruncated = true;
          hunkSkipped = 0;
        }
        if (currentFile && (added > 0 || removed > 0)) {
          result.push(`  +${added} -${removed}`);
        }
        const parts = line.split(" b/");
        currentFile = parts.length > 1 ? parts.slice(1).join(" b/") : "unknown";
        result.push(`
${currentFile}`);
        added = 0;
        removed = 0;
        inHunk = false;
        hunkShown = 0;
      } else if (line.startsWith("@@")) {
        if (hunkSkipped > 0) {
          result.push(`  ... (${hunkSkipped} lines truncated)`);
          wasTruncated = true;
          hunkSkipped = 0;
        }
        inHunk = true;
        hunkShown = 0;
        result.push(`  ${line}`);
      } else if (inHunk) {
        if (line.startsWith("+") && !line.startsWith("+++")) {
          added += 1;
          if (hunkShown < maxHunkLines) {
            result.push(`  ${line}`);
            hunkShown += 1;
          } else {
            hunkSkipped += 1;
          }
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          removed += 1;
          if (hunkShown < maxHunkLines) {
            result.push(`  ${line}`);
            hunkShown += 1;
          } else {
            hunkSkipped += 1;
          }
        } else if (hunkShown < maxHunkLines && !line.startsWith("\\")) {
          if (hunkShown > 0) {
            result.push(`  ${line}`);
            hunkShown += 1;
          }
        }
      }
      if (result.length >= maxLines) {
        result.push(`
... (more changes truncated)`);
        wasTruncated = true;
        break outer;
      }
    }
  if (hunkSkipped > 0) {
    result.push(`  ... (${hunkSkipped} lines truncated)`);
    wasTruncated = true;
  }
  if (currentFile && (added > 0 || removed > 0)) {
    result.push(`  +${added} -${removed}`);
  }
  if (wasTruncated) {
    result.push("[full diff: rtk git diff --no-compact]");
  }
  return result.join(`
`);
}
gitDiff.filterName = "git-diff";

// service/core/rtk/filters/gitStatus.js
function gitStatus(input) {
  const lines = input.split(`
`);
  if (lines.length === 0 || lines.length === 1 && !lines[0].trim()) {
    return "Clean working tree";
  }
  let branch = "";
  const stagedFiles = [];
  const modifiedFiles = [];
  const untrackedFiles = [];
  let staged = 0;
  let modified = 0;
  let untracked = 0;
  let conflicts = 0;
  for (const raw of lines) {
    if (!raw.trim())
      continue;
    const longBranch = raw.match(/^On branch (\S+)/);
    if (longBranch) {
      branch = longBranch[1];
      continue;
    }
    if (raw.startsWith("##")) {
      branch = raw.replace(/^##\s*/, "");
      continue;
    }
    if (raw.length >= 3 && /^[ MADRCU?!][ MADRCU?!] /.test(raw)) {
      const x = raw[0];
      const y = raw[1];
      const file = raw.slice(3);
      if (raw.slice(0, 2) === "??") {
        untracked++;
        untrackedFiles.push(file);
        continue;
      }
      if ("MADRC".includes(x)) {
        staged++;
        stagedFiles.push(file);
      } else if (x === "U") {
        conflicts++;
      }
      if (y === "M" || y === "D") {
        modified++;
        modifiedFiles.push(file);
      }
      continue;
    }
    const longMatch = raw.match(/^\s*(modified|new file|deleted|renamed|both modified):\s+(.+)$/);
    if (longMatch) {
      const kind = longMatch[1];
      const path = longMatch[2].trim();
      if (kind === "both modified") {
        conflicts++;
      } else if (kind === "modified" || kind === "deleted") {
        modified++;
        modifiedFiles.push(path);
      } else if (kind === "new file" || kind === "renamed") {
        staged++;
        stagedFiles.push(path);
      }
      continue;
    }
  }
  let out = "";
  if (branch)
    out += `* ${branch}
`;
  if (staged > 0) {
    out += `+ Staged: ${staged} files
`;
    for (const f of stagedFiles.slice(0, STATUS_MAX_FILES))
      out += `   ${f}
`;
    if (stagedFiles.length > STATUS_MAX_FILES) {
      out += `   ... +${stagedFiles.length - STATUS_MAX_FILES} more
`;
    }
  }
  if (modified > 0) {
    out += `~ Modified: ${modified} files
`;
    for (const f of modifiedFiles.slice(0, STATUS_MAX_FILES))
      out += `   ${f}
`;
    if (modifiedFiles.length > STATUS_MAX_FILES) {
      out += `   ... +${modifiedFiles.length - STATUS_MAX_FILES} more
`;
    }
  }
  if (untracked > 0) {
    out += `? Untracked: ${untracked} files
`;
    for (const f of untrackedFiles.slice(0, STATUS_MAX_UNTRACKED))
      out += `   ${f}
`;
    if (untrackedFiles.length > STATUS_MAX_UNTRACKED) {
      out += `   ... +${untrackedFiles.length - STATUS_MAX_UNTRACKED} more
`;
    }
  }
  if (conflicts > 0) {
    out += `conflicts: ${conflicts} files
`;
  }
  if (staged === 0 && modified === 0 && untracked === 0 && conflicts === 0) {
    out += `clean — nothing to commit
`;
  }
  return out.replace(/\n+$/, "");
}
gitStatus.filterName = "git-status";

// service/core/rtk/filters/gitLog.js
function gitLog(text, maxLines = GIT_LOG_MAX_LINES) {
  if (!text)
    return "";
  const input = String(text);
  const lines = input.split(`
`);
  const out = [];
  let skipped = 0;
  let inCommit = false;
  let subjectSeen = false;
  function pushLine(l) {
    if (out.length < maxLines) {
      out.push(l);
      return true;
    }
    skipped++;
    return false;
  }
  for (let i = 0;i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (/^commit [0-9a-f]{7,40}$/i.test(trimmed) || /^[*|/\\ ]+commit [0-9a-f]{7,40}/i.test(trimmed)) {
      inCommit = true;
      subjectSeen = false;
      pushLine(line);
      continue;
    }
    if (inCommit) {
      if (/^[*|/\\ ]*(Author|Date):/i.test(trimmed)) {
        pushLine(trimmed);
        continue;
      }
      if (trimmed === "")
        continue;
      if (!subjectSeen && /^[*|/\\ ]*    \S/.test(line)) {
        pushLine("  Subject: " + trimmed);
        subjectSeen = true;
        continue;
      }
      if (/^\d+ file\w* changed/.test(trimmed)) {
        pushLine("  " + trimmed);
        continue;
      }
      if (/^diff --git /.test(trimmed)) {
        pushLine("  ... diff body omitted");
        continue;
      }
      continue;
    }
    const graphMatch = trimmed.match(/^[*|/\\ ]+([0-9a-f]{7,40}\s+.+)/i);
    if (graphMatch) {
      pushLine(graphMatch[1]);
      continue;
    }
    if (/^[0-9a-f]{7,40}\s+/.test(trimmed)) {
      pushLine(trimmed);
      continue;
    }
    if (/^[*|/\\ ]+$/.test(trimmed) && /[*|/\\]/.test(trimmed)) {
      continue;
    }
    pushLine(trimmed);
  }
  if (skipped > 0)
    out.push(`... (${skipped} more lines)`);
  const result = out.join(`
`);
  if (!result && input)
    return input;
  if (result.length > input.length)
    return input;
  return result;
}
gitLog.filterName = "git-log";

// service/core/rtk/filters/buildOutput.js
var RE_CARGO_ERR_CONT = /^\s*(-->|\||\d+\s*\||=)/;
var DEPRECATION_KEEP = 3;
function buildOutput(input) {
  const lines = input.split(`
`);
  if (lines.length === 0)
    return input;
  const errors = [];
  const warnings = [];
  const deprecations = [];
  let summary = null;
  let compilingCount = 0;
  let downloadingCount = 0;
  let inCargoError = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (inCargoError) {
      if (!trimmed) {
        inCargoError = false;
        continue;
      }
      if (RE_CARGO_ERR_CONT.test(line)) {
        errors.push(line);
        continue;
      }
      inCargoError = false;
    }
    if (!trimmed)
      continue;
    if (/^npm (ERR!|error)/i.test(trimmed) || /^yarn error/i.test(trimmed)) {
      errors.push(line);
      continue;
    }
    if (/^npm warn deprecated/i.test(trimmed)) {
      deprecations.push(line);
      continue;
    }
    if (/^npm warn/i.test(trimmed) || /^yarn warn/i.test(trimmed)) {
      warnings.push(line);
      continue;
    }
    if (/^error(\[|:)/i.test(trimmed) || trimmed.startsWith("error -->")) {
      errors.push(line);
      inCargoError = true;
      continue;
    }
    if (/^warning(\[|:)/i.test(trimmed) || trimmed.startsWith("warning -->")) {
      warnings.push(line);
      inCargoError = true;
      continue;
    }
    if (/^ERROR:/i.test(trimmed)) {
      errors.push(line);
      continue;
    }
    if (/^\[ERROR\]/i.test(trimmed) || /^BUILD FAILED/i.test(trimmed)) {
      errors.push(line);
      continue;
    }
    if (/^\[WARNING\]/i.test(trimmed)) {
      warnings.push(line);
      continue;
    }
    if (/^\s*Compiling\s+\S+/i.test(trimmed)) {
      compilingCount++;
      continue;
    }
    if (/^\s*Downloading\s+\S+/i.test(trimmed) || /^Fetching\s+/i.test(trimmed)) {
      downloadingCount++;
      continue;
    }
    if (/^(added|removed|changed|audited|installed)\s+\d+\s+package/i.test(trimmed) || /^\s*Finished\s+/i.test(trimmed) || /^BUILD SUCCESS/i.test(trimmed) || /^\d+\s+(vulnerabilities|packages?|warnings?|errors?)/i.test(trimmed) || /^Successfully (installed|built)/i.test(trimmed) || /^To address .* issues/i.test(trimmed) || /^Run `npm (audit|fund)`/i.test(trimmed) || /packages are looking for funding/i.test(trimmed)) {
      summary = summary ? `${summary}
${line}` : line;
      continue;
    }
  }
  let out = "";
  const keepDep = deprecations.slice(0, DEPRECATION_KEEP);
  for (const d of keepDep)
    out += `${d}
`;
  if (deprecations.length > DEPRECATION_KEEP) {
    out += `... +${deprecations.length - DEPRECATION_KEEP} more deprecated packages
`;
  }
  if (compilingCount > 0) {
    out += `Compiled ${compilingCount} packages
`;
  }
  if (downloadingCount > 0) {
    out += `Downloaded ${downloadingCount} packages
`;
  }
  for (const e of errors)
    out += `${e}
`;
  const keepWarnings = warnings.slice(0, 5);
  for (const w of keepWarnings)
    out += `${w}
`;
  if (warnings.length > 5) {
    out += `... +${warnings.length - 5} more warnings
`;
  }
  if (summary)
    out += `${summary}
`;
  return out.replace(/\n+$/, "") || input;
}
buildOutput.filterName = "build-output";

// service/core/rtk/filters/grep.js
function grep(input) {
  const byFile = new Map;
  let total = 0;
  for (const line of input.split(`
`)) {
    const first = line.indexOf(":");
    if (first === -1)
      continue;
    const second = line.indexOf(":", first + 1);
    if (second === -1)
      continue;
    const file = line.slice(0, first);
    const lineNumStr = line.slice(first + 1, second);
    const content = line.slice(second + 1);
    if (!/^\d+$/.test(lineNumStr))
      continue;
    total++;
    if (!byFile.has(file))
      byFile.set(file, []);
    byFile.get(file).push([lineNumStr, content]);
  }
  if (total === 0)
    return input;
  const files = Array.from(byFile.keys()).sort();
  let out = `${total} matches in ${files.length}F:

`;
  for (const file of files) {
    const matches = byFile.get(file);
    out += `[file] ${file} (${matches.length}):
`;
    const show = matches.slice(0, GREP_PER_FILE_MAX);
    for (const [lineNum, content] of show) {
      out += `  ${lineNum.padStart(4)}: ${content.trim()}
`;
    }
    if (matches.length > GREP_PER_FILE_MAX) {
      out += `  +${matches.length - GREP_PER_FILE_MAX}
`;
    }
    out += `
`;
  }
  return out;
}
grep.filterName = "grep";

// service/core/rtk/filters/find.js
function find(input) {
  const lines = input.split(`
`).filter((l) => l.trim());
  if (lines.length === 0)
    return input;
  const byDir = new Map;
  for (const path of lines) {
    const lastSep = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    let dir;
    let basename;
    if (lastSep === -1) {
      dir = ".";
      basename = path;
    } else {
      dir = path.slice(0, lastSep) || "/";
      basename = path.slice(lastSep + 1);
    }
    if (!byDir.has(dir))
      byDir.set(dir, []);
    byDir.get(dir).push(basename);
  }
  const dirs = Array.from(byDir.keys()).sort();
  let out = `${lines.length} files in ${dirs.length} dirs:

`;
  const showDirs = dirs.slice(0, FIND_TOTAL_DIR_MAX);
  for (const dir of showDirs) {
    const files = byDir.get(dir);
    const dirLabel = dir.replace(/\\/g, "/");
    out += `${dirLabel}/  (${files.length})
`;
    const showFiles = files.slice(0, FIND_PER_DIR_MAX);
    for (const f of showFiles)
      out += `  ${f}
`;
    if (files.length > FIND_PER_DIR_MAX) {
      out += `  +${files.length - FIND_PER_DIR_MAX}
`;
    }
  }
  if (dirs.length > FIND_TOTAL_DIR_MAX) {
    out += `
+${dirs.length - FIND_TOTAL_DIR_MAX} more dirs
`;
  }
  return out;
}
find.filterName = "find";

// service/core/rtk/filters/dedupLog.js
function dedupLog(input) {
  const lines = input.split(`
`);
  const out = [];
  let prev = null;
  let runCount = 0;
  let blankStreak = 0;
  const flushRun = () => {
    if (prev !== null && runCount > 1) {
      out.push(`  ... (${runCount - 1} duplicate lines)`);
    }
  };
  for (const line of lines) {
    if (line.trim() === "") {
      if (blankStreak < 1)
        out.push(line);
      blankStreak += 1;
      flushRun();
      prev = null;
      runCount = 0;
      continue;
    }
    blankStreak = 0;
    if (line === prev) {
      runCount += 1;
      continue;
    }
    flushRun();
    out.push(line);
    prev = line;
    runCount = 1;
    if (out.length >= DEDUP_LINE_MAX) {
      out.push(`... (truncated at ${DEDUP_LINE_MAX} lines)`);
      return out.join(`
`);
    }
  }
  flushRun();
  return out.join(`
`);
}
dedupLog.filterName = "dedup-log";

// service/core/rtk/filters/ls.js
var LS_DATE_RE = /\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+(\d{4}|\d{2}:\d{2})\s+/;
function humanSize(bytes) {
  if (bytes >= 1048576)
    return `${(bytes / 1048576).toFixed(1)}M`;
  if (bytes >= 1024)
    return `${(bytes / 1024).toFixed(1)}K`;
  return `${bytes}B`;
}
function parseLsLine(line) {
  const m = LS_DATE_RE.exec(line);
  if (!m)
    return null;
  const name = line.slice(m.index + m[0].length);
  const beforeDate = line.slice(0, m.index);
  const beforeParts = beforeDate.split(/\s+/).filter(Boolean);
  if (beforeParts.length < 4)
    return null;
  const perms = beforeParts[0];
  const fileType = perms.charAt(0);
  let size = 0;
  for (let i = beforeParts.length - 1;i >= 0; i--) {
    const n = Number(beforeParts[i]);
    if (Number.isInteger(n) && String(n) === beforeParts[i]) {
      size = n;
      break;
    }
  }
  return { fileType, size, name };
}
function ls(input) {
  const dirs = [];
  const files = [];
  const byExt = new Map;
  for (const line of input.split(`
`)) {
    if (line.startsWith("total ") || line.length === 0)
      continue;
    const parsed = parseLsLine(line);
    if (!parsed)
      continue;
    if (parsed.name === "." || parsed.name === "..")
      continue;
    if (LS_NOISE_DIRS.includes(parsed.name))
      continue;
    if (parsed.fileType === "d") {
      dirs.push(parsed.name);
    } else if (parsed.fileType === "-" || parsed.fileType === "l") {
      const dot = parsed.name.lastIndexOf(".");
      const ext = dot > 0 ? parsed.name.slice(dot) : "no ext";
      byExt.set(ext, (byExt.get(ext) || 0) + 1);
      files.push([parsed.name, humanSize(parsed.size)]);
    }
  }
  if (dirs.length === 0 && files.length === 0)
    return input;
  let out = "";
  for (const d of dirs)
    out += `${d}/
`;
  for (const [name, size] of files)
    out += `${name}  ${size}
`;
  let summary = `
Summary: ${files.length} files, ${dirs.length} dirs`;
  if (byExt.size > 0) {
    const ext = Array.from(byExt.entries()).sort((a, b) => b[1] - a[1]);
    const parts = ext.slice(0, LS_EXT_SUMMARY_TOP).map(([e, c]) => `${c} ${e}`);
    summary += ` (${parts.join(", ")}`;
    if (ext.length > LS_EXT_SUMMARY_TOP) {
      summary += `, +${ext.length - LS_EXT_SUMMARY_TOP} more`;
    }
    summary += ")";
  }
  return out + summary;
}
ls.filterName = "ls";

// service/core/rtk/filters/tree.js
function tree(input) {
  const lines = input.split(`
`);
  if (lines.length === 0)
    return input;
  const filtered = [];
  for (const line of lines) {
    if (line.includes("director") && line.includes("file"))
      continue;
    if (line.trim() === "" && filtered.length === 0)
      continue;
    filtered.push(line);
  }
  while (filtered.length > 0 && filtered[filtered.length - 1].trim() === "") {
    filtered.pop();
  }
  if (filtered.length > TREE_MAX_LINES) {
    const cut = filtered.length - TREE_MAX_LINES;
    return filtered.slice(0, TREE_MAX_LINES).join(`
`) + `
... +${cut} more lines`;
  }
  return filtered.join(`
`);
}
tree.filterName = "tree";

// service/core/rtk/filters/smartTruncate.js
function smartTruncate(input) {
  const lines = input.split(`
`);
  if (lines.length < SMART_TRUNCATE_MIN_LINES)
    return input;
  const head = lines.slice(0, SMART_TRUNCATE_HEAD);
  const tail = lines.slice(lines.length - SMART_TRUNCATE_TAIL);
  const cut = lines.length - head.length - tail.length;
  return [...head, `... +${cut} lines truncated`, ...tail].join(`
`);
}
smartTruncate.filterName = "smart-truncate";

// service/core/rtk/filters/readNumbered.js
var LINE_RE = /^\s*\d+\|/;
function readNumbered(input) {
  const lines = input.split(`
`);
  if (lines.length < SMART_TRUNCATE_MIN_LINES)
    return input;
  const head = lines.slice(0, SMART_TRUNCATE_HEAD);
  const tail = lines.slice(lines.length - SMART_TRUNCATE_TAIL);
  const cut = lines.length - head.length - tail.length;
  return [
    ...head,
    `... +${cut} lines truncated (file continues)`,
    ...tail
  ].join(`
`);
}
readNumbered.filterName = "read-numbered";
var READ_NUMBERED_LINE_RE = LINE_RE;

// service/core/rtk/filters/searchList.js
var HEADER_RE = /^Result of search in '[^']*' \(total (\d+) files?\):/;
function searchList(input) {
  const lines = input.split(`
`);
  if (lines.length === 0)
    return input;
  const header = lines[0] || "";
  const rest = lines.slice(1);
  const paths = [];
  for (const raw of rest) {
    const t = raw.trim();
    if (!t.startsWith("- "))
      continue;
    paths.push(t.slice(2));
  }
  if (paths.length === 0)
    return input;
  const byDir = new Map;
  for (const p of paths) {
    const slash = p.lastIndexOf("/");
    const dir = slash === -1 ? "." : p.slice(0, slash) || "/";
    const name = slash === -1 ? p : p.slice(slash + 1);
    if (!byDir.has(dir))
      byDir.set(dir, []);
    byDir.get(dir).push(name);
  }
  const dirs = Array.from(byDir.keys()).sort();
  let out = `${header}
${paths.length} files in ${dirs.length} dirs:

`;
  for (const dir of dirs.slice(0, SEARCH_LIST_TOTAL_DIR_MAX)) {
    const names = byDir.get(dir);
    out += `${dir}/ (${names.length}):
`;
    for (const n of names.slice(0, SEARCH_LIST_PER_DIR_MAX))
      out += `  ${n}
`;
    if (names.length > SEARCH_LIST_PER_DIR_MAX) {
      out += `  +${names.length - SEARCH_LIST_PER_DIR_MAX}
`;
    }
    out += `
`;
  }
  if (dirs.length > SEARCH_LIST_TOTAL_DIR_MAX) {
    out += `+${dirs.length - SEARCH_LIST_TOTAL_DIR_MAX} more dirs
`;
  }
  return out.replace(/\n+$/, "");
}
searchList.filterName = "search-list";
var SEARCH_LIST_HEADER_RE = HEADER_RE;

// service/core/rtk/autodetect.js
var RE_GIT_DIFF = /^diff --git /m;
var RE_GIT_DIFF_HUNK = /^@@ /m;
var RE_GIT_STATUS = /^On branch |^nothing to commit|^Changes (not |to be )|^Untracked files:/m;
var RE_GIT_LOG = /^[*|/\\ ]*commit [0-9a-f]{7,40}$/m;
var RE_PORCELAIN = /^[ MADRCU?!][ MADRCU?!] \S/m;
var RE_BUILD_OUTPUT = /^(npm (warn|error|ERR!)|yarn (warn|error)|\s*Compiling\s+\S+|\s*Downloading\s+\S+|added \d+ package|\[ERROR\]|BUILD (SUCCESS|FAILED)|\s*Finished\s+|Successfully (installed|built)|ERROR:)/im;
var RE_TREE_GLYPH = /[├└]──|│  /;
var RE_LS_ROW = /^[-dlbcps][rwx-]{9}/m;
var RE_LS_TOTAL = /^total \d+$/m;
function autoDetectFilter(text) {
  const head = text.length > DETECT_WINDOW ? text.slice(0, DETECT_WINDOW) : text;
  if (RE_GIT_LOG.test(head))
    return gitLog;
  if (RE_GIT_DIFF.test(head) || RE_GIT_DIFF_HUNK.test(head))
    return gitDiff;
  if (RE_GIT_STATUS.test(head))
    return gitStatus;
  if (RE_BUILD_OUTPUT.test(head))
    return buildOutput;
  if (isMostlyPorcelain(head))
    return gitStatus;
  const lines = head.split(`
`);
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const first5 = nonEmpty.slice(0, 5);
  if (first5.some(isGrepLine))
    return grep;
  if (nonEmpty.length >= 3 && nonEmpty.every(isPathLike))
    return find;
  if (RE_TREE_GLYPH.test(head))
    return tree;
  if (RE_LS_TOTAL.test(head) || countMatches(head, RE_LS_ROW) >= 3)
    return ls;
  if (SEARCH_LIST_HEADER_RE.test(head))
    return searchList;
  const totalLines = 1 + (text.match(/\n/g)?.length ?? 0);
  if (totalLines >= SMART_TRUNCATE_MIN_LINES && isLineNumbered(text.split(`
`, 100))) {
    return readNumbered;
  }
  if (nonEmpty.length >= 5)
    return dedupLog;
  if (text.split(`
`).length >= SMART_TRUNCATE_MIN_LINES)
    return smartTruncate;
  return null;
}
function isGrepLine(line) {
  const first = line.indexOf(":");
  if (first === -1)
    return false;
  const second = line.indexOf(":", first + 1);
  if (second === -1)
    return false;
  const lineno = line.slice(first + 1, second);
  return /^\d+$/.test(lineno);
}
function isPathLike(line) {
  const t = line.trim();
  if (t.length === 0)
    return false;
  if (/^[A-Za-z]:[\\/]/.test(t))
    return true;
  if (t.includes(":"))
    return false;
  return t.startsWith(".") || t.startsWith("/") || t.includes("/");
}
function isMostlyPorcelain(head) {
  const lines = head.split(`
`).filter((l) => l.trim());
  if (lines.length < 3)
    return false;
  const hits = lines.filter((l) => RE_PORCELAIN.test(l)).length;
  return hits / lines.length >= 0.6;
}
function isLineNumbered(lines) {
  let hits = 0;
  let nonEmpty = 0;
  const sample = lines.slice(0, 100);
  for (const l of sample) {
    if (l.length === 0)
      continue;
    nonEmpty++;
    if (READ_NUMBERED_LINE_RE.test(l))
      hits++;
  }
  if (nonEmpty < 5)
    return false;
  return hits / nonEmpty >= READ_NUMBERED_MIN_HIT_RATIO;
}
function countMatches(text, re) {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  return (text.match(g) || []).length;
}

// service/core/rtk/applyFilter.js
function safeApply(fn, text) {
  if (typeof fn !== "function")
    return text;
  try {
    const out = fn(text);
    if (typeof out !== "string")
      return text;
    return out;
  } catch (err) {
    const name = fn.filterName || fn.name || "anonymous";
    console.warn(`[rtk] warning: filter '${name}' panicked — passing through raw output: ${err?.message || err}`);
    return text;
  }
}

// service/core/rtk/index.js
function compressMessages(body, enabled) {
  if (!enabled)
    return null;
  if (!body)
    return null;
  if (body.conversationState) {
    return compressKiroFormat(body, enabled);
  }
  const items = Array.isArray(body.messages) ? body.messages : Array.isArray(body.input) ? body.input : null;
  if (!items)
    return null;
  const stats = { bytesBefore: 0, bytesAfter: 0, hits: [] };
  try {
    for (let i = 0;i < items.length; i++) {
      const msg = items[i];
      if (!msg)
        continue;
      if (msg.type === "function_call_output") {
        if (typeof msg.output === "string") {
          msg.output = compressText(msg.output, stats, "openai-responses-string");
        } else if (Array.isArray(msg.output)) {
          for (let k = 0;k < msg.output.length; k++) {
            const part = msg.output[k];
            if (part && part.type === "input_text" && typeof part.text === "string") {
              part.text = compressText(part.text, stats, "openai-responses-array");
            }
          }
        }
        continue;
      }
      if (msg.role === "tool" && typeof msg.content === "string") {
        msg.content = compressText(msg.content, stats, "openai-tool");
        continue;
      }
      if (!Array.isArray(msg.content))
        continue;
      if (msg.role === "tool") {
        for (let k = 0;k < msg.content.length; k++) {
          const part = msg.content[k];
          if (part && part.type === "text" && typeof part.text === "string") {
            part.text = compressText(part.text, stats, "openai-tool-array");
          }
        }
        continue;
      }
      for (let j = 0;j < msg.content.length; j++) {
        const block = msg.content[j];
        if (!block || block.type !== "tool_result")
          continue;
        if (block.is_error === true)
          continue;
        if (typeof block.content === "string") {
          block.content = compressText(block.content, stats, "claude-string");
        } else if (Array.isArray(block.content)) {
          for (let k = 0;k < block.content.length; k++) {
            const part = block.content[k];
            if (part && part.type === "text" && typeof part.text === "string") {
              part.text = compressText(part.text, stats, "claude-array");
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn("[RTK] compressMessages error:", e.message);
    return null;
  }
  return stats;
}
function compressKiroFormat(body, enabled) {
  const stats = { bytesBefore: 0, bytesAfter: 0, hits: [] };
  try {
    const state = body.conversationState;
    const allMessages = [...Array.isArray(state?.history) ? state.history : []];
    if (state?.currentMessage)
      allMessages.push(state.currentMessage);
    for (const msg of allMessages) {
      const toolResults = msg?.userInputMessage?.userInputMessageContext?.toolResults;
      if (!Array.isArray(toolResults))
        continue;
      for (const tr of toolResults) {
        if (tr.status === "error")
          continue;
        if (!Array.isArray(tr.content))
          continue;
        for (const part of tr.content) {
          if (part && typeof part.text === "string") {
            part.text = compressText(part.text, stats, "kiro-tool-result");
          }
        }
      }
    }
  } catch (e) {
    console.warn("[RTK] compressKiroFormat error:", e.message);
    return null;
  }
  return stats;
}
function compressText(text, stats, shape) {
  const bytesIn = text.length;
  stats.bytesBefore += bytesIn;
  if (bytesIn < MIN_COMPRESS_SIZE || bytesIn > RAW_CAP) {
    stats.bytesAfter += bytesIn;
    return text;
  }
  const fn = autoDetectFilter(text);
  if (!fn) {
    stats.bytesAfter += bytesIn;
    return text;
  }
  const out = safeApply(fn, text);
  if (!out || out.length === 0 || out.length >= bytesIn) {
    stats.bytesAfter += bytesIn;
    return text;
  }
  stats.bytesAfter += out.length;
  stats.hits.push({ shape, filter: fn.filterName || fn.name, saved: bytesIn - out.length });
  return out;
}

// service/rtk.ts
var compressMessages2 = (body, enabled = true) => {
  const stats = compressMessages(body, enabled);
  return Boolean(stats?.hits?.length);
};

// service/token-saver-styles.ts
var CAVEMAN_PROMPTS = {
  lite: [
    "Answer concisely in complete sentences. Remove pleasantries, filler, repetition, and unnecessary hedging.",
    "Preserve the user’s language and exact code, identifiers, paths, commands, URLs, and error strings.",
    "Keep security warnings, irreversible-action confirmations, and ordered steps clear."
  ].join(" "),
  full: [
    "Use terse technical language; compact phrases are acceptable when unambiguous.",
    "Remove filler and redundant explanations. Preserve the user’s language and all technical literals exactly.",
    "Do not compress security warnings, irreversible-action confirmations, or ordered steps where ambiguity could cause mistakes."
  ].join(" "),
  ultra: [
    "Use the fewest words that retain correctness and clarity. Prefer compact, direct answers.",
    "Never alter code, identifiers, paths, commands, URLs, or error strings.",
    "Keep safety warnings and destructive-action confirmations explicit. Keep multi-step sequences unambiguous."
  ].join(" ")
};
var PONYTAIL_PROMPTS = {
  lite: [
    "When writing code, prefer the smallest correct change.",
    "Check YAGNI, standard library, native platform features, and already-installed dependencies before adding abstractions or packages.",
    "Never omit explicitly requested behavior, trust-boundary validation, error handling, security, or accessibility.",
    "For non-trivial logic, include one runnable check or a focused test."
  ].join(" "),
  full: [
    "Act as an efficient senior developer. Prefer deletion over addition and the smallest correct diff.",
    "Use standard library, native platform features, and existing dependencies first.",
    "Avoid unrequested factories, one-implementation interfaces, configuration that never changes, and scaffolding for hypothetical future needs.",
    "Never remove required behavior, validation, error handling, security, or accessibility. Test non-trivial logic."
  ].join(" "),
  ultra: [
    "Minimize implementation and explanation aggressively. Choose the smallest correct change; delete unnecessary code before adding code.",
    "Do not add new dependencies, abstractions, or future-proof scaffolding unless the task requires them.",
    "Do not simplify away requested behavior, validation, error handling, security, or accessibility. Add a runnable check for non-trivial logic."
  ].join(" ")
};
var applyTokenSaverStyles = (body, cavemanLevel = "off", ponytailLevel = "off") => {
  const prompts = [];
  if (cavemanLevel !== "off")
    prompts.push(CAVEMAN_PROMPTS[cavemanLevel]);
  if (ponytailLevel !== "off")
    prompts.push(PONYTAIL_PROMPTS[ponytailLevel]);
  if (prompts.length === 0 || !Array.isArray(body.messages))
    return false;
  const instruction = prompts.join(`

`);
  const messages = body.messages;
  const systemIndex = messages.findIndex((message) => !!message && typeof message === "object" && !Array.isArray(message) && message.role === "system");
  const current = systemIndex >= 0 ? messages[systemIndex] : null;
  if (current && typeof current.content === "string") {
    const existing = current.content.trim();
    current.content = existing ? existing + `

` + instruction : instruction;
  } else {
    messages.unshift({ role: "system", content: instruction });
  }
  return true;
};

// service/zen.ts
var sessionId = generateSessionId;
var prepareChat = (raw, options) => {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The request body is not JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The request body must be a JSON object.");
  }
  const body = parsed;
  const stream = body.stream === true;
  const model = typeof body.model === "string" ? body.model : "";
  if (!Array.isArray(body.messages)) {
    throw new Error("The request body has no messages.");
  }
  const effectiveOptions = typeof options === "boolean" ? { rtkEnabled: options } : options ?? {};
  const rtkEnabled = effectiveOptions.rtkEnabled ?? true;
  if (rtkEnabled)
    compressMessages2(body, true);
  applyTokenSaverStyles(body, effectiveOptions.cavemanLevel ?? "off", effectiveOptions.ponytailLevel ?? "off");
  if (body.max_completion_tokens !== undefined && body.max_tokens === undefined) {
    body.max_tokens = body.max_completion_tokens;
  }
  if (body.reasoning_effort === "auto")
    delete body.reasoning_effort;
  body.stream = true;
  return { body: JSON.stringify(body), stream, model };
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
          ponytailLevel: config.ponytailLevel
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
var normalizeTestSse = (raw, lane, model, toolNameMap) => {
  if (!lane)
    return Promise.resolve(raw);
  const transform = lane === "chat" ? createToolNameRestoreTransform(toolNameMap) : createOpenCodeResponseTransform(lane, model, toolNameMap);
  if (!transform)
    return Promise.resolve(raw);
  return new Promise((resolve, reject) => {
    const chunks = [];
    transform.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    transform.on("error", reject);
    transform.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    transform.end(raw);
  });
};
var REFRESH_INTERVAL_MS = 10 * 60000;
var REQUEST_LOG_LIMIT = REQUEST_HISTORY_LIMIT;
var PACKAGE_ROOT = path7.dirname(path7.dirname(fileURLToPath(import.meta.url)));
var RELAY_FILES = {
  http: path7.join("relays", "cloudflare", "worker.js"),
  cloudflare: path7.join("relays", "cloudflare", "worker.js"),
  vercel: path7.join("relays", "vercel", "api", "relay.js"),
  netlify: path7.join("relays", "netlify", "functions", "relay.mjs"),
  deno: path7.join("relays", "deno", "main.ts")
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
      config: {
        ...config,
        upstreamApiKey: "",
        proxyPools: config.proxyPools.map((pool) => ({
          ...pool,
          proxyUrl: redactProxyUrlCredentials(pool.proxyUrl)
        }))
      },
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
          requests.unshift({
            ...entry,
            ...typeof entry.poolName === "string" ? { poolName: redactDiagnosticText(entry.poolName) } : {},
            ...entry.fallbackReason ? { fallbackReason: redactDiagnosticText(entry.fallbackReason) } : {}
          });
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
      routerError = redactDiagnosticText(error instanceof Error ? error.message : String(error));
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
      modelsError = redactDiagnosticText(error instanceof Error ? error.message : String(error));
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
        proxyPools: patch.proxyPools !== undefined ? preserveProxyPoolCredentials(previous.proxyPools, patch.proxyPools) : previous.proxyPools,
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
      const code = await readFile(path7.join(PACKAGE_ROOT, file), "utf8");
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
      const prepared = prepareChat(chatPayload, { rtkEnabled: false });
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
        try {
          let nativeRequest = null;
          if (isOpenCodeUpstream(config.upstream)) {
            const parsedBody = JSON.parse(prepared.body);
            nativeRequest = await prepareProviderRequest({ model: modelId, body: parsedBody, session: runtimeSession });
          }
          const target = buildTarget(config, "chat", pool, nativeRequest?.url);
          const outboundBody = nativeRequest?.body ?? prepared.body;
          const testHeaders = {
            ...isOpenCodeUpstream(config.upstream) ? nativeRequest?.headers ?? {} : {},
            ...target.headers,
            "content-type": "application/json",
            accept: "text/event-stream",
            "content-length": String(Buffer.byteLength(outboundBody))
          };
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
              req.end(outboundBody);
            });
            resultText = answer.text;
            status = answer.status;
            retryAfter = answer.retryAfter;
          } else {
            const useNativeTls = isOpenCodeUpstream(config.upstream) && !pool && activePoolCount === 0 && typeof nativeRequest?.directFetch === "function";
            const fetcher = useNativeTls ? nativeRequest.directFetch : fetch;
            const answer = await fetcher(target.url, { method: "POST", headers: testHeaders, body: outboundBody, signal: AbortSignal.timeout(15000) });
            resultText = await answer.text();
            status = answer.status;
            retryAfter = answer.headers.get("retry-after") ?? undefined;
          }
          if (status >= 200 && status < 300) {
            if (nativeRequest) {
              resultText = await normalizeTestSse(resultText, nativeRequest.lane, modelId, nativeRequest.toolNameMap);
            }
            const aggregated = aggregateStream(resultText);
            const choices = Array.isArray(aggregated.choices) ? aggregated.choices : [];
            const firstChoice = choices[0];
            const reply = firstChoice?.message?.content?.trim() || "OK";
            return { ok: true, modelId, elapsedMs: Date.now() - start, reply };
          }
          lastError = `HTTP ${status}: ${resultText.slice(0, 300)}`;
          if (status !== 429)
            break;
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
  console.error("[blackrouter] the local service failed:", redactDiagnosticText(error.stack ?? error.message));
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
