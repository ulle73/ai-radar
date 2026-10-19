// Minimal JSON Schema-validator för den delmängd som kortkontraktet använder.
// Repot har inga beroenden; därför tolkas schemat här i stället för via Ajv.
// Stöd: type, const, enum, required, properties, additionalProperties: false,
// items, minItems, maxItems, minLength, maxLength, pattern, minimum, maximum,
// format (date-time, uri) och lokala $ref (#/$defs/...).

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const SUPPORTED_KEYWORDS = new Set([
  '$schema', '$id', '$ref', '$defs', 'title', 'description',
  'type', 'const', 'enum', 'required', 'properties', 'additionalProperties',
  'items', 'minItems', 'maxItems', 'minLength', 'maxLength', 'pattern',
  'minimum', 'maximum', 'format'
]);

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function matchesType(value, expected) {
  const actual = typeOf(value);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  return actual === expected;
}

function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) throw new Error(`Endast lokala $ref stöds: ${ref}`);
  return ref.slice(2).split('/').reduce((node, part) => {
    if (!node || !(part in node)) throw new Error(`Okänd $ref: ${ref}`);
    return node[part];
  }, root);
}

function checkFormat(value, format) {
  if (format === 'date-time') return RFC3339.test(value) && Number.isFinite(Date.parse(value));
  if (format === 'uri') {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  throw new Error(`Format stöds inte: ${format}`);
}

function validateNode(value, schema, root, path, errors) {
  for (const keyword of Object.keys(schema)) {
    if (!SUPPORTED_KEYWORDS.has(keyword)) throw new Error(`Nyckelord stöds inte: ${keyword} (${path})`);
  }

  if (schema.$ref) {
    validateNode(value, resolveRef(root, schema.$ref), root, path, errors);
    return;
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(value, type))) {
      errors.push(`${path}: förväntade ${types.join(' | ')}, fick ${typeOf(value)}`);
      return;
    }
  }

  if ('const' in schema && value !== schema.const) {
    errors.push(`${path}: måste vara ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: måste vara en av ${schema.enum.join(', ')}`);
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: kortare än ${schema.minLength} tecken`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(`${path}: längre än ${schema.maxLength} tecken`);
    }
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      errors.push(`${path}: matchar inte ${schema.pattern}`);
    }
    if (schema.format && !checkFormat(value, schema.format)) {
      errors.push(`${path}: ogiltigt format ${schema.format}`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: mindre än ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: större än ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path}: färre än ${schema.minItems} poster`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${path}: fler än ${schema.maxItems} poster`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateNode(item, schema.items, root, `${path}[${index}]`, errors));
    }
  }

  if (typeOf(value) === 'object') {
    for (const key of schema.required || []) {
      if (!(key in value)) errors.push(`${path}.${key}: saknas`);
    }
    const properties = schema.properties || {};
    for (const [key, child] of Object.entries(value)) {
      if (key in properties) {
        validateNode(child, properties[key], root, `${path}.${key}`, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}.${key}: okänt fält`);
      }
    }
  }
}

export function validateAgainstSchema(value, schema) {
  const errors = [];
  validateNode(value, schema, schema, '$', errors);
  return { valid: errors.length === 0, errors };
}
