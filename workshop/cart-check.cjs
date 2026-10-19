// Real validation middleware and cart schemas; no app, socket, ORM or database.
const path = require('node:path');
const backend = path.resolve(__dirname, '../src/iron-pets/backend');
require(path.join(backend, 'node_modules/ts-node')).register({
  transpileOnly: true, project: path.join(backend, 'tsconfig.json'),
});
const { validate } = require(path.join(backend, 'src/middleware/validate.ts'));
const { addItemSchema, updateItemSchema } = require(path.join(backend, 'src/modules/cart/cart.validation.ts'));
const cases = [
  ['valid add item', addItemSchema, { productId: 'training-product', quantity: 1 }, {}, 200],
  ['valid update item', updateItemSchema, { quantity: 2 }, { id: 'training-item' }, 200],
  ['zero add quantity', addItemSchema, { productId: 'training-product', quantity: 0 }, {}, 400],
  ['missing product', addItemSchema, { quantity: 1 }, {}, 400],
  ['nested body workaround', addItemSchema, { body: { productId: 'training-product', quantity: 1 } }, {}, 400],
];
let failures = 0;
for (const [name, schema, body, params, expected] of cases) {
  let status = 200, output = null, reached = false;
  const response = { status(code) { status = code; return this; }, json(value) { output = value; return this; } };
  validate(schema)({ body, params, query: {} }, response, error => {
    if (error) throw error;
    reached = true;
  });
  const passed = status === expected && (expected !== 200 || reached);
  if (!passed) failures++;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: expected ${expected}, received ${status}; handler reached=${reached}`);
  if (!passed && output) console.log(JSON.stringify(output));
}
console.log(`${cases.length - failures} passed, ${failures} failed; no database or HTTP listener used.`);
process.exitCode = failures ? 1 : 0;
