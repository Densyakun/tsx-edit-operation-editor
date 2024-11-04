import { EditorType, EditorUIType, getNodeEditorFunc, TreeNodeListItemType, TreeNodeType } from "@/tree/lib/type";
import { SyntaxKind } from "ts-morph";
import { OtherNodeTypeId, TSMorphProjectTypeId, SourceFileTypeId, SyntaxListTypeId, TSMorphOtherNodeType, TSMorphProjectType, TSMorphSourceFileType, TSMorphSyntaxListType } from "./compiler";
import { getNodeByBreadcrumbs } from "@/tree/lib/util";
import { TreeCompilerType } from "@/tree/tree-compiler/type";

const kindCount = 363;

function getKindHue(kind: number) {
  return kind * 360 / kindCount;
}

function nodeChildrenItemList(node: TSMorphSyntaxListType | TSMorphOtherNodeType): TreeNodeListItemType[] {
  return node.children?.map((child, index) => {
    return {
      breadcrumb: { path: index.toString(), label: SyntaxKind[child.kind] },
      text: SyntaxKind[child.kind],
      color: `hsl(${getKindHue(child.kind)}, 50%, 75%)`,
    };
  }) || [];
}

function getIdentifiers(nodeTree: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, treeCompilers: Readonly<TreeCompilerType[]>, identifiers: string[] = []) {
  const node = getNodeByBreadcrumbs(nodeTree, breadcrumbPaths, treeCompilers);
  if (!node) return;

  if (node.type !== OtherNodeTypeId) return identifiers;

  if ((node as TSMorphOtherNodeType).kind === SyntaxKind.FirstStatement) {
    let isExport = (node as TSMorphOtherNodeType).children![0].kind === SyntaxKind.SyntaxList;

    const variableDeclarationList = (node as TSMorphOtherNodeType).children![isExport ? 1 : 0] as TSMorphOtherNodeType;

    const syntaxList = variableDeclarationList.children![1] as TSMorphSyntaxListType;
    for (let n = 0; n < syntaxList.children.length; n += 2) {
      const variableDeclaration = syntaxList.children[n] as TSMorphOtherNodeType;

      const identifier = variableDeclaration.children![0] as TSMorphOtherNodeType;

      if (!identifiers.includes(identifier.text!))
        identifiers.push(identifier.text!);
    }
  } else if ((node as TSMorphOtherNodeType).kind === SyntaxKind.ForOfStatement) {
    const variableDeclarationList = (node as TSMorphOtherNodeType).children![2] as TSMorphOtherNodeType;

    const syntaxList = variableDeclarationList.children![1] as TSMorphSyntaxListType;

    const variableDeclaration = syntaxList.children[0] as TSMorphOtherNodeType;

    const identifier = variableDeclaration.children![0] as TSMorphOtherNodeType;

    if (!identifiers.includes(identifier.text!))
      identifiers.push(identifier.text!);
  } else if ((node as TSMorphOtherNodeType).kind === SyntaxKind.FunctionDeclaration) {
    // TODO ジェネレーター関数
    const identifier = (node as TSMorphOtherNodeType).children![(node as TSMorphOtherNodeType).children![0].kind === SyntaxKind.SyntaxList ? 2 : 1] as TSMorphOtherNodeType;

    if (!identifiers.includes(identifier.text!))
      identifiers.push(identifier.text!);
  } else if ((node as TSMorphOtherNodeType).kind === SyntaxKind.ImportDeclaration) {
    if ((node as TSMorphOtherNodeType).children!.length < 4) return;

    const importClause = (node as TSMorphOtherNodeType).children![1] as TSMorphOtherNodeType;
    if (importClause.children![0].kind === SyntaxKind.TypeKeyword) return;

    let n = 0;
    if (importClause.children![0].kind === SyntaxKind.Identifier) {
      if (!identifiers.includes(importClause.children![0].text!))
        identifiers.push(importClause.children![0].text!);
      n += 2;
      if (importClause.children!.length < 2) return;
    }
    if (importClause.children![n].kind === SyntaxKind.NamespaceImport) {
      const namespaceImport = importClause.children![n] as TSMorphOtherNodeType;
      if (!identifiers.includes((namespaceImport.children![2] as TSMorphOtherNodeType).text!))
        identifiers.push((namespaceImport.children![2] as TSMorphOtherNodeType).text!);
    } else if (importClause.children![n].kind === SyntaxKind.NamedImports) {
      const namedImports = importClause.children![n] as TSMorphOtherNodeType;
      const syntaxList = namedImports.children![1] as TSMorphSyntaxListType;

      for (let n = 0; n < syntaxList.children.length; n += 2) {
        const importSpecifier = syntaxList.children[n];
        if (importSpecifier.children!.length < 2) {
          const identifier = importSpecifier.children![0] as TSMorphOtherNodeType;

          if (!identifiers.includes(identifier.text!))
            identifiers.push(identifier.text!);
        } else {
          const identifier = importSpecifier.children![0] as TSMorphOtherNodeType;
          const identifier1 = importSpecifier.children![2] as TSMorphOtherNodeType;

          if (identifier.text === "default") {
            if (!identifiers.includes(identifier1.text!))
              identifiers.push(identifier1.text!);
          } else {
            if (!identifiers.includes(identifier1.text!))
              identifiers.push(identifier1.text!);
          }
        }
      }
    }
  }

  return identifiers;
}

function getIdentifiersCheckParent(nodeTree: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, treeCompilers: Readonly<TreeCompilerType[]>, identifiers: string[] = []) {
  const parentNode = getNodeByBreadcrumbs(nodeTree, breadcrumbPaths.slice(0, -1), treeCompilers);
  if (!parentNode) return;

  if (parentNode.type === OtherNodeTypeId) {
    if ((parentNode as TSMorphOtherNodeType).kind !== SyntaxKind.FirstStatement)
      getIdentifiers(nodeTree, breadcrumbPaths.slice(0, -1), treeCompilers, identifiers);
  } else if (parentNode.type === SyntaxListTypeId) {
    const breadcrumbPaths_ = [...breadcrumbPaths];
    (parentNode as TSMorphSyntaxListType).children.slice(0, parseInt(breadcrumbPaths[breadcrumbPaths.length - 1])).forEach((_, index) => {
      breadcrumbPaths_[breadcrumbPaths_.length - 1] = index.toString();
      getIdentifiers(nodeTree, breadcrumbPaths_, treeCompilers, identifiers);
    });
  } else if (parentNode.type === SourceFileTypeId) {
    const breadcrumbPaths_ = [...breadcrumbPaths];
    (parentNode as TSMorphSourceFileType).syntaxList.children.slice(0, parseInt(breadcrumbPaths[breadcrumbPaths.length - 1])).forEach((_, index) => {
      breadcrumbPaths_[breadcrumbPaths_.length - 1] = index.toString();
      getIdentifiers(nodeTree, breadcrumbPaths_, treeCompilers, identifiers);
    });
  }

  if (1 < breadcrumbPaths.length)
    getIdentifiersCheckParent(nodeTree, breadcrumbPaths.slice(0, -1), treeCompilers, identifiers);

  return identifiers;
}

const getNodeEditorFuncMap: { [key: string]: getNodeEditorFunc } = {
  [TSMorphProjectTypeId]: (nodeTree, breadcrumbPaths, node) => ({
    title: "ts-morph Project",
    itemLists: {
      "Source files": (node as TSMorphProjectType).sourceFiles.map(sourceFile => ({
        breadcrumb: { path: sourceFile.filePath, label: sourceFile.filePath },
        text: sourceFile.relativeFilePath,
        color: "hsl(0, 0%, 75%)",
      })),
    },
  }),
  [SourceFileTypeId]: (nodeTree, breadcrumbPaths, node) => ({
    title: "Source file",
    itemLists: {
      "Syntaxes": nodeChildrenItemList((node as TSMorphSourceFileType).syntaxList),
    },
    dataTexts: [
      `Comment ranges at EOF: ${JSON.stringify((node as TSMorphSourceFileType).commentRangesAtEndOfFile)}`,
      `Whitespaces: ${JSON.stringify((node as TSMorphSourceFileType).whitespaces)}`,
    ],
  }),
  [SyntaxListTypeId]: (nodeTree, breadcrumbPaths, node) => ({
    title: "ts-morph Syntax list",
    itemLists: {
      "Syntaxes": nodeChildrenItemList(node as TSMorphSyntaxListType),
    },
  }),
  [OtherNodeTypeId]: (nodeTree, breadcrumbPaths, node, treeCompilers, setter) => {
    let editorui: EditorUIType | undefined = undefined;

    if ((node as TSMorphOtherNodeType).kind === SyntaxKind.StringLiteral)
      editorui = {
        label: "Value",
        type: "string",
        getter: () => (node as TSMorphOtherNodeType).text!.substring(1, (node as TSMorphOtherNodeType).text!.length - 1),
        setter: (value: string) => {
          const newNode = { ...node } as TSMorphOtherNodeType;
          // TODO エスケープ文字
          newNode.text = `"${value}"`;
          setter(newNode);
        },
      };
    else if ((node as TSMorphOtherNodeType).kind === SyntaxKind.FirstLiteralToken)
      editorui = {
        label: "Value",
        type: "number",
        getter: () => (node as TSMorphOtherNodeType).text!,
        setter: (value: string) => {
          const newNode = { ...node } as TSMorphOtherNodeType;
          newNode.text = value;
          setter(newNode);
        },
      };
    else if ((node as TSMorphOtherNodeType).kind === SyntaxKind.Identifier) {
      let identifiers = getIdentifiersCheckParent(nodeTree, breadcrumbPaths, treeCompilers);

      // TODO 変数名の定義などはSelectではなくTextField(selectItems: undefined)にする

      editorui = {
        label: "Value",
        type: "string",
        selectItems: identifiers,
        getter: () => (node as TSMorphOtherNodeType).text!,
        setter: (value: string) => {
          const newNode = { ...node } as TSMorphOtherNodeType;
          newNode.text = value;
          setter(newNode);
        },
      };
    }

    return {
      title: "ts-morph Node",
      itemLists: {
        "Children": nodeChildrenItemList(node as TSMorphOtherNodeType),
      },
      dataTexts: (node as TSMorphOtherNodeType).children
        ? []
        : [
          `Leading comment ranges: ${JSON.stringify((node as TSMorphOtherNodeType).leadingCommentRanges)}`,
          `Text: ${(node as TSMorphOtherNodeType).text && JSON.stringify((node as TSMorphOtherNodeType).text)}`,
          `Trailing comment ranges: ${JSON.stringify((node as TSMorphOtherNodeType).trailingCommentRanges)}`,
          `Whitespaces: ${JSON.stringify((node as TSMorphOtherNodeType).whitespaces)}`,
        ],
      editorui,
    };
  },
};

export default { getNodeEditorFuncMap } as EditorType;