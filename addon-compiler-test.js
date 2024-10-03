const { writeFileSync, readFileSync } = require("fs");

const a = [{
  enabled: true,
  compilerCode: readFileSync('./tree/tree-compiler/tsx-edit-operation-editor/compiler.ts', 'utf8'),
  editorCode: readFileSync('./tree/tree-compiler/tsx-edit-operation-editor/editor.ts', 'utf8'),
  name: "Next.js test",
  description: "Tree Compiler for Next.js",
  author: "Densyakun",
  website: "",
}];

writeFileSync('./addon.json', JSON.stringify(a, undefined, "  "));