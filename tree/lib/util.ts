import tsMorphCompiler from "../code-compiler/ts-morph/compiler";
import { TreeCompilerType } from "../tree-compiler/type";
import { EditorType, getNodeByBreadcrumbFunc, TreeNodeType } from "./type";

export function getNodeByBreadcrumb(node: TreeNodeType, breadcrumbPath: string, treeCompilers: TreeCompilerType[]) {
  let getNodeByBreadcrumbFunc: getNodeByBreadcrumbFunc | undefined = undefined;
  for (const compiler of [tsMorphCompiler, ...treeCompilers]) {
    getNodeByBreadcrumbFunc = compiler.getNodeByBreadcrumbFuncMap[node.type] as getNodeByBreadcrumbFunc | undefined;

    if (getNodeByBreadcrumbFunc)
      return getNodeByBreadcrumbFunc(node, breadcrumbPath);
  }

  return node;
}

export function getNodeByBreadcrumbs(node: TreeNodeType, breadcrumbPaths: string[], treeCompilers: TreeCompilerType[]) {
  for (const breadcrumbPath of breadcrumbPaths) {
    const node_ = getNodeByBreadcrumb(node, breadcrumbPath, treeCompilers);
    if (!node_) return;
    node = node_;
  }

  return node;
}

export function getNodeEditor(node: TreeNodeType, editors: EditorType[]) {
  for (const editor of editors) {
    const nodeEditorFunc = editor.getNodeEditorFuncMap[node.type];

    if (nodeEditorFunc)
      return nodeEditorFunc(node);
  }

  return null;
}