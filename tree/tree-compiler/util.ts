import { Project, SyntaxKind, SyntaxList } from "ts-morph";
import type { TreeNodeType } from "../lib/type";
import treeCodeCompilerTSMorphCompiler, * as treeCodeCompilerTSMorphCompilerNamespace from "@/tree/code-compiler/ts-morph/compiler";
import type { TSMorphNodeType, TSMorphOtherNodeType, TSMorphSyntaxListType } from "@/tree/code-compiler/ts-morph/compiler";
import normalizePath from "normalize-path";
import path from "path";

const { getFromSyntaxList } = treeCodeCompilerTSMorphCompilerNamespace;

// TODO クラス
// TODO 残余引数、デフォルト引数、分割代入
// TODO Async

export type ModuleType = { default?: any, object?: { [key: string]: any } };

export type ExportAndReturnValueType = { exports: ModuleType, value?: any };

export function decompileUseText(tree: TreeNodeType, compilerCode: string): TreeNodeType {
  const project = new Project({
    useInMemoryFileSystem: true,
  });

  const sourceFile = project.createSourceFile("", compilerCode);

  const children = sourceFile.getChildren();

  const syntaxList = getFromSyntaxList(children[0] as SyntaxList);

  const modules: { [key: string]: ModuleType } = {
    "path": {
      default: {
        dirname: path.dirname,
        basename: path.basename,
        extname: path.extname,
      },
      object: {
        dirname: path.dirname,
        basename: path.basename,
        extname: path.extname,
      },
    },
    "normalize-path": {
      default: normalizePath,
    },
    "@/tree/code-compiler/ts-morph/compiler": {
      default: treeCodeCompilerTSMorphCompiler,
      object: treeCodeCompilerTSMorphCompilerNamespace,
    },
  };
  const variables: { [key: string]: any }[] = [{
    "console": {
      error: console.error,
      log: console.log,
      warn: console.warn,
    },
  }];

  try {
    // TODO コードの評価を事前に行い、exportsをコンパイル関数のみ随時実行する（getNodeByBreadcrumbFuncMapのため）
    const exports = evalSyntaxList(syntaxList, variables, modules)?.exports;

    const res = exports?.default?.decompile(tree);

    if (res && res.type) return res;
  } catch (e) {
    console.error(e);
  }

  return tree;
}

function evalSyntax(syntax: TSMorphOtherNodeType, variables: { [key: string]: any }[], modules: { [key: string]: ModuleType } = {}): ExportAndReturnValueType {
  if (syntax.kind === SyntaxKind.FirstStatement) {
    const firstStatement = syntax as TSMorphOtherNodeType;

    let isExport = firstStatement.children![0].kind === SyntaxKind.SyntaxList;

    const variableDeclarationList = firstStatement.children![isExport ? 1 : 0] as TSMorphOtherNodeType;

    const syntaxList = variableDeclarationList.children![1] as TSMorphSyntaxListType;
    const exportProps: { [key: string]: any } = {};
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      const variableDeclaration = syntaxList.children[n] as TSMorphOtherNodeType;

      const identifier = variableDeclaration.children![0] as TSMorphOtherNodeType;

      variables[variables.length - 1][identifier.text!] = variableDeclaration.children!.length === 1
        || variableDeclaration.children!.length < 5 && variableDeclaration.children![1].kind === SyntaxKind.ColonToken
        ? undefined
        : evalExpression(variableDeclaration.children![3 < variableDeclaration.children!.length ? 4 : 2] as TSMorphOtherNodeType, variables)?.value;

      if (isExport)
        exportProps[identifier.text!] = variables[variables.length - 1][identifier.text!];
    }

    // TODO リテラルの値を正しく共有する
    return { exports: { object: exportProps } };
  } else if (syntax.kind === SyntaxKind.ExpressionStatement) {
    evalExpression(syntax.children![0] as TSMorphOtherNodeType, variables);
  } else if (syntax.kind === SyntaxKind.IfStatement) {
    if (evalExpression(syntax.children![2] as TSMorphOtherNodeType, variables)?.value) {
      const res = evalBlockOrSyntax(syntax.children![4] as TSMorphOtherNodeType, variables);
      if (Object.keys(res).includes("value")) return res;
    } else if (syntax.children!.length === 7)
      return evalBlockOrSyntax(syntax.children![6] as TSMorphOtherNodeType, variables);
  } else if (syntax.kind === SyntaxKind.ForOfStatement) {
    const variableDeclarationList = syntax.children![2] as TSMorphOtherNodeType;

    const syntaxList = variableDeclarationList.children![1] as TSMorphSyntaxListType;

    const variableDeclaration = syntaxList.children[0] as TSMorphOtherNodeType;

    const identifier = variableDeclaration.children![0] as TSMorphOtherNodeType;

    const iterable = evalExpression(syntax.children![4] as TSMorphOtherNodeType, variables)?.value;

    let res;
    for (let value of iterable) {
      variables.push({ [identifier.text!]: value });

      res = evalBlockOrSyntax(syntax.children![6] as TSMorphOtherNodeType, variables);

      variables.pop();

      if (Object.keys(res).includes("value")) break;
    }

    if (res && Object.keys(res).includes("value")) return res;
  } else if (syntax.kind === SyntaxKind.ReturnStatement) {
    return {
      exports: {},
      value: syntax.children!.length < 3 && syntax.children![1].kind === SyntaxKind.SemicolonToken || syntax.children!.length === 1
        ? undefined
        : evalExpression(syntax.children![1] as TSMorphOtherNodeType, variables)?.value
    };
  } else if (syntax.kind === SyntaxKind.FunctionDeclaration) {
    let isExport = 0;

    let n = 0;
    if (syntax.children![0].kind === SyntaxKind.SyntaxList) {
      n++;

      const syntaxList = syntax.children![0] as TSMorphSyntaxListType;
      if (syntaxList.children[0].kind === SyntaxKind.ExportKeyword)
        isExport = 1 < syntaxList.children.length && syntaxList.children[1].kind === SyntaxKind.DefaultKeyword
          ? 2
          : 1;
    }

    // TODO ジェネレーター関数
    const identifier = syntax.children![1 + n] as TSMorphOtherNodeType;
    const syntaxList = syntax.children![3 + n] as TSMorphSyntaxListType;

    const block = syntax.children![(5 < syntax.children!.length ? 7 : 5) + n] as TSMorphOtherNodeType;

    const parameters = [];
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      parameters.push(syntaxList.children[n].children![0].text || "");
    }

    variables[variables.length - 1][identifier.text!] = getFunc(block, parameters, cloneScope(variables));

    return {
      exports: isExport
        ? isExport === 2
          ? { default: variables[variables.length - 1][identifier.text!] }
          : { object: { [identifier.text!]: variables[variables.length - 1][identifier.text!] } }
        : {}
    };
  } else if (syntax.kind === SyntaxKind.ImportDeclaration) {
    if (syntax.children!.length < 4) return { exports: {} };

    const moduleName = evalExpression(syntax.children![3] as TSMorphOtherNodeType, variables)?.value;

    const module = modules[moduleName];

    const importClause = syntax.children![1] as TSMorphOtherNodeType;
    if (importClause.children![0].kind === SyntaxKind.TypeKeyword) return { exports: {} };

    let n = 0;
    if (importClause.children![0].kind === SyntaxKind.Identifier) {
      variables[0][importClause.children![0].text!] = module.default;
      n += 2;
      if (importClause.children!.length < 2) return { exports: {} };
    }
    if (importClause.children![n].kind === SyntaxKind.NamespaceImport) {
      const namespaceImport = importClause.children![n] as TSMorphOtherNodeType;
      variables[0][namespaceImport.children![2].text!] = module.object;
    } else if (importClause.children![n].kind === SyntaxKind.NamedImports) {
      const namedImports = importClause.children![n] as TSMorphOtherNodeType;
      const syntaxList = namedImports.children![1] as TSMorphSyntaxListType;

      for (let n = 0; n < syntaxList.children.length; n += 2) {
        const importSpecifier = syntaxList.children[n];
        if (importSpecifier.children!.length < 2) {
          const identifier = importSpecifier.children![0] as TSMorphOtherNodeType;

          variables[0][identifier.text!] = module.object![identifier.text!];
        } else {
          const identifier = importSpecifier.children![0] as TSMorphOtherNodeType;
          const identifier1 = importSpecifier.children![2] as TSMorphOtherNodeType;

          if (identifier.text === "default")
            variables[0][identifier1.text!] = module.default;
          else {
            variables[0][identifier1.text!] = module.object![identifier.text!];
          }
        }
      }
    }
  } else if (syntax.kind === SyntaxKind.ExportAssignment) {
    // TODO リテラルの値を正しく共有する
    return { exports: { default: evalExpression(syntax.children![2] as TSMorphOtherNodeType, variables)?.value } };
  } else if (syntax.kind === SyntaxKind.ExportDeclaration) {
    const exports: ModuleType = { object: {} };

    if (syntax.children![1].kind === SyntaxKind.AsteriskToken) {
      const moduleName = evalExpression(syntax.children![3] as TSMorphOtherNodeType, variables)?.value;
      const module = modules[moduleName];

      // TODO リテラルの値を正しく共有する
      if (module.default)
        exports.default = module.default;
      if (module.object)
        exports.object = module.object;
    } else if (syntax.children![1].kind === SyntaxKind.NamedExports) {
      const syntaxList = syntax.children![1].children![1] as TSMorphSyntaxListType;

      if (syntax.children!.length < 4) {
        for (let n = 0; n < syntaxList.children.length; n += 2) {
          const exportSpecifier = syntaxList.children[n];
          if (exportSpecifier.children!.length < 2) {
            const identifier = exportSpecifier.children![0] as TSMorphOtherNodeType;

            // TODO リテラルの値を正しく共有する
            if (identifier.text === "default")
              exports.default = getVariableValue(variables, identifier.text!);
            else
              exports.object![identifier.text!] = getVariableValue(variables, identifier.text!);
          } else {
            const identifier = exportSpecifier.children![0] as TSMorphOtherNodeType;
            const identifier1 = exportSpecifier.children![2] as TSMorphOtherNodeType;

            // TODO リテラルの値を正しく共有する
            if (identifier1.text === "default")
              exports.default = getVariableValue(variables, identifier.text!);
            else
              exports.object![identifier1.text!] = getVariableValue(variables, identifier.text!);
          }
        }
      } else {
        const moduleName = evalExpression(syntax.children![3] as TSMorphOtherNodeType, variables)?.value;
        const module = modules[moduleName];

        for (let n = 0; n < syntaxList.children.length; n += 2) {
          const exportSpecifier = syntaxList.children[n];
          if (exportSpecifier.children!.length < 2) {
            const identifier = exportSpecifier.children![0] as TSMorphOtherNodeType;

            // TODO リテラルの値を正しく共有する
            if (identifier.text === "default")
              exports.default = module.default;
            else {
              exports.object![identifier.text!] = module.object![identifier.text!];
            }
          } else {
            const identifier = exportSpecifier.children![0] as TSMorphOtherNodeType;
            const identifier1 = exportSpecifier.children![2] as TSMorphOtherNodeType;

            // TODO リテラルの値を正しく共有する
            if (identifier.text === "default")
              if (identifier1.text === "default")
                exports.default = module.default;
              else
                exports.object![identifier1.text!] = module.default;
            else if (identifier1.text === "default") {
              exports.default = module.object![identifier.text!];
            } else {
              exports.object![identifier1.text!] = module.object![identifier.text!];
            }
          }
        }
      }
    } else if (syntax.children![1].kind === SyntaxKind.NamespaceExport) {
      const moduleName = evalExpression(syntax.children![3] as TSMorphOtherNodeType, variables)?.value;
      const module = modules[moduleName];

      // TODO module.defaultの扱いは正しいか？
      // TODO リテラルの値を正しく共有する
      const namespaceExport = syntax.children![1] as TSMorphOtherNodeType;
      exports.object![namespaceExport.children![2].text!] = module.default
        ? { default: module.default, ...module.object }
        : { ...module.object };
    }

    // TODO リテラルの値を正しく共有する
    return {
      exports: exports.object && Object.keys(exports.object).length
        ? exports
        : exports.default
          ? { default: exports.default }
          : {}
    };
  } else if (syntax.kind !== SyntaxKind.TypeAliasDeclaration)
    return { exports: {}, value: evalExpression(syntax, variables)?.value };

  return { exports: {} };
}

function evalSyntaxList(syntaxList: TSMorphSyntaxListType, variables: { [key: string]: any }[], modules?: { [key: string]: ModuleType }): ExportAndReturnValueType | undefined {
  let exports: ModuleType = {};

  for (const child of syntaxList.children) {
    const res = evalSyntax(child as TSMorphOtherNodeType, variables, modules);

    // TODO リテラルの値を正しく共有する
    if (res.exports.default)
      exports.default = res.exports.default;
    if (res.exports.object)
      exports.object = exports.object
        ? { ...exports.object, ...res.exports.object }
        : res.exports.object;

    if (Object.keys(res).includes("value")) return res;
  }

  return { exports };
}

function getVariableValue(variables: { [key: string]: any }[], key: string) {
  for (let n = variables.length - 1; n >= 0; n--)
    if (Object.keys(variables[n]).includes(key))
      return variables[n][key];
}

function assignVariable(variables: { [key: string]: any }[], key: string, value: any) {
  for (let n = variables.length - 1; n >= 0; n--)
    if (Object.keys(variables[n]).includes(key))
      return variables[n][key] = value;
}

function evalExpression(syntax: TSMorphOtherNodeType, variables: { [key: string]: any }[]): { value: any, assignmentFunc: any } | undefined {
  if (syntax.kind === SyntaxKind.StringLiteral) {
    return { value: syntax.text!.substring(1, syntax.text!.length - 1), assignmentFunc: undefined };
  } else if (syntax.kind === SyntaxKind.FirstLiteralToken) {
    return { value: Number(syntax.text!), assignmentFunc: undefined };
  } else if (syntax.kind === SyntaxKind.Identifier) {
    return { value: getVariableValue(variables, syntax.text!), assignmentFunc: (value: any) => assignVariable(variables, syntax.text!, value) };
  } else if (syntax.kind === SyntaxKind.ComputedPropertyName) {
    return evalExpression(syntax.children![1] as TSMorphOtherNodeType, variables)?.value;
  } else if (syntax.kind === SyntaxKind.ArrayLiteralExpression) {
    const syntaxList = syntax.children![1] as TSMorphSyntaxListType;

    const list = [];
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      if (syntaxList.children[n].kind === SyntaxKind.SpreadElement)
        list.push(...evalExpression(syntaxList.children[n].children![1] as TSMorphOtherNodeType, variables)?.value);
      else
        list.push(evalExpression(syntaxList.children[n] as TSMorphOtherNodeType, variables)?.value);
    }

    return { value: list, assignmentFunc: undefined };
  } else if (syntax.kind === SyntaxKind.ObjectLiteralExpression) {
    const syntaxList = syntax.children![1] as TSMorphSyntaxListType;

    // TODO スプレッド構文
    const object: any = {};
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      if (syntaxList.children[n].kind === SyntaxKind.PropertyAssignment) {
        const identifier = syntaxList.children[n].children![0] as TSMorphOtherNodeType;
        object[identifier.text!] = evalExpression(syntaxList.children[n].children![2] as TSMorphOtherNodeType, variables)?.value;
      } else if (syntaxList.children[n].kind === SyntaxKind.ShorthandPropertyAssignment) {
        const identifier = syntaxList.children[n].children![0] as TSMorphOtherNodeType;
        object[identifier.text!] = evalExpression(identifier, variables)?.value;
      }
    }

    return { value: object, assignmentFunc: undefined };
  } else if (syntax.kind === SyntaxKind.PropertyAccessExpression) {
    const object = evalExpression(syntax.children![0] as TSMorphOtherNodeType, variables)?.value;

    const text = syntax.children![2].text!;

    const newValue = object[text];
    return {
      value:
        typeof newValue === "function"
          ? newValue.bind(object)
          : newValue,
      assignmentFunc: undefined
    };
  } else if (syntax.kind === SyntaxKind.ElementAccessExpression) {
    const expression = evalExpression(syntax.children![0] as TSMorphOtherNodeType, variables);
    const expression1 = evalExpression(syntax.children![2] as TSMorphOtherNodeType, variables);

    return { value: expression?.value[expression1?.value], assignmentFunc: (value: any) => expression!.value[expression1?.value] = value };
  } else if (syntax.kind === SyntaxKind.CallExpression) {
    const func = evalExpression(syntax.children![0] as TSMorphOtherNodeType, variables)?.value;

    const syntaxList = syntax.children![2] as TSMorphSyntaxListType;

    // TODO スプレッド構文
    const args = [];
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      if (syntaxList.children[n].kind === SyntaxKind.SpreadElement) {
        args.push(...evalExpression(syntaxList.children[n].children![1] as TSMorphOtherNodeType, variables)?.value);
      } else
        args.push(evalExpression(syntaxList.children[n] as TSMorphOtherNodeType, variables)?.value);
    }

    return { value: func(...args), assignmentFunc: undefined };
  } else if (syntax.kind === SyntaxKind.ParenthesizedExpression) {
    return evalExpression(syntax.children![1] as TSMorphOtherNodeType, variables);
  } else if (syntax.kind === SyntaxKind.PrefixUnaryExpression) {
    if (syntax.children![0].kind === SyntaxKind.MinusToken) {
      return { value: -evalExpression(syntax.children![1] as TSMorphOtherNodeType, variables)?.value, assignmentFunc: undefined };
    } else if (syntax.children![0].kind === SyntaxKind.ExclamationToken) {
      return { value: !evalExpression(syntax.children![1] as TSMorphOtherNodeType, variables)?.value, assignmentFunc: undefined };
    }
  } else if (syntax.kind === SyntaxKind.BinaryExpression) {
    const left = evalExpression(syntax.children![0] as TSMorphOtherNodeType, variables);
    const right = evalExpression(syntax.children![2] as TSMorphOtherNodeType, variables);

    if (syntax.children![1].kind === SyntaxKind.EqualsEqualsEqualsToken) {
      return { value: left?.value === right?.value, assignmentFunc: undefined };
    } else if (syntax.children![1].kind === SyntaxKind.ExclamationEqualsEqualsToken) {
      return { value: left?.value !== right?.value, assignmentFunc: undefined };
    } else if (syntax.children![1].kind === SyntaxKind.AmpersandAmpersandToken) {
      return { value: left?.value && right?.value, assignmentFunc: undefined };
    } else if (syntax.children![1].kind === SyntaxKind.FirstAssignment) {
      return { value: left?.assignmentFunc(right?.value), assignmentFunc: undefined };
    } else if (syntax.children![1].kind === SyntaxKind.FirstCompoundAssignment) {
      return { value: left?.assignmentFunc(left.value + right?.value), assignmentFunc: undefined };
    }
  } else if (syntax.kind === SyntaxKind.ArrowFunction) {
    const syntaxList = syntax.children![3 < syntax.children!.length ? 1 : 0] as TSMorphSyntaxListType;

    const parameters = [];
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      parameters.push(syntaxList.children[n].children![0].text || "");
    }

    return {
      value: getFunc(syntax.children![3 < syntax.children!.length ? 4 : 2] as TSMorphOtherNodeType, parameters, cloneScope(variables)), assignmentFunc: undefined
    };
  } else if (syntax.kind === SyntaxKind.AsExpression) {
    return evalExpression(syntax.children![0] as TSMorphOtherNodeType, variables);
  } else
    throw new Error(SyntaxKind[syntax.kind]);
}

function cloneScope(variables: { [key: string]: any }[]) {
  return [...variables.map(scope => {
    const object: { [key: string]: any } = {};
    Object.keys(scope).forEach(key => object[key] = scope[key]);
    return object;
  })];
}

function evalBlockOrSyntax(node: TSMorphOtherNodeType, variables: { [key: string]: any }[]): ExportAndReturnValueType {
  if (node.kind === SyntaxKind.Block) {
    variables.push({});

    let res = evalSyntaxList(node.children![1] as TSMorphSyntaxListType, variables);

    variables.pop();
    return res || { exports: {} };
  } else
    return evalSyntax(node, variables);
}

function getFunc(blockOrSyntax: TSMorphOtherNodeType, parameters: string[], variables: { [key: string]: any }[]) {
  return (...args: any) => {
    variables.push({});
    for (let n = 0; n < args.length && n < parameters.length; n++) {
      variables[variables.length - 1][parameters[n]] = args[n];
    }

    const res = evalBlockOrSyntax(blockOrSyntax, variables)?.value;

    variables.pop();
    return res;
  };
}

export function addChildCodeTextForLog(nodeJson: TSMorphNodeType, text = "") {
  if (nodeJson.children)
    nodeJson.children.forEach(childJson => text += addChildCodeTextForLog(childJson));
  else
    text += nodeJson.text;

  return text;
}