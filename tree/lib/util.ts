import tsMorphCompiler from "../code-compiler/ts-morph/compiler";
import tsMorphEditor from "../code-compiler/ts-morph/editor";
import myAppCompiler from "../tree-compiler/tsx-edit-operation-editor/compiler";
import myAppEditor from "../tree-compiler/tsx-edit-operation-editor/editor";
import { getNodeByBreadcrumbFunc, TreeNodeType } from "./type";

const compilers = [tsMorphCompiler, myAppCompiler];

export function getNodeByBreadcrumb(node: TreeNodeType, breadcrumbPath: string) {
  let getNodeByBreadcrumbFunc: getNodeByBreadcrumbFunc | undefined = undefined;
  for (const compiler of compilers) {
    getNodeByBreadcrumbFunc = compiler.getNodeByBreadcrumbFuncMap[node.type] as getNodeByBreadcrumbFunc | undefined;

    if (getNodeByBreadcrumbFunc)
      return getNodeByBreadcrumbFunc(node, breadcrumbPath);
  }

  return node;
}

export function getNodeByBreadcrumbs(node: TreeNodeType, breadcrumbPaths: string[]) {
  for (const breadcrumbPath of breadcrumbPaths) {
    const node_ = getNodeByBreadcrumb(node, breadcrumbPath);
    if (!node_) return;
    node = node_;
  }

  return node;
}

const editors = [tsMorphEditor, myAppEditor];

export function getNodeEditor(node: TreeNodeType) {
  for (const editor of editors) {
    const nodeEditorFunc = editor.getNodeEditorFuncMap[node.type];

    if (nodeEditorFunc)
      return nodeEditorFunc(node);
  }

  return null;
}