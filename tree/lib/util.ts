import tsMorphCompiler from "../code-compiler/ts-morph/compiler";
import { TreeCompilerType } from "../tree-compiler/type";
import { deleteNodeByBreadcrumbFunc, EditorType, getNodeByBreadcrumbFunc, postNodeByBreadcrumbFunc, putNodeByBreadcrumbFunc, TreeNodeType } from "./type";

export function getNodeByBreadcrumb(node: Readonly<TreeNodeType>, breadcrumbPath: Readonly<string>, treeCompilers: Readonly<TreeCompilerType[]>) {
  let getNodeByBreadcrumbFunc: getNodeByBreadcrumbFunc | undefined = undefined;
  for (const compiler of [tsMorphCompiler, ...treeCompilers]) {
    getNodeByBreadcrumbFunc = compiler.getNodeByBreadcrumbFuncMap[node.type] as getNodeByBreadcrumbFunc | undefined;

    if (getNodeByBreadcrumbFunc)
      return getNodeByBreadcrumbFunc(node, breadcrumbPath);
  }

  return node;
}

export function getNodeByBreadcrumbs(node: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, treeCompilers: Readonly<TreeCompilerType[]>) {
  for (const breadcrumbPath of breadcrumbPaths) {
    const childNode = getNodeByBreadcrumb(node, breadcrumbPath, treeCompilers);
    if (!childNode) return;
    node = childNode;
  }

  return node;
}

export function postNodeByBreadcrumb(node: Readonly<TreeNodeType>, treeCompilers: Readonly<TreeCompilerType[]>, newChildNode: TreeNodeType, index?: number) {
  let postNodeByBreadcrumbFunc: postNodeByBreadcrumbFunc | undefined = undefined;
  for (const compiler of [tsMorphCompiler, ...treeCompilers]) {
    postNodeByBreadcrumbFunc = compiler.postNodeByBreadcrumbFuncMap[node.type] as postNodeByBreadcrumbFunc | undefined;

    if (postNodeByBreadcrumbFunc)
      return postNodeByBreadcrumbFunc(node, newChildNode, index);
  }
}

export function postNodeByBreadcrumbs(node: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, treeCompilers: Readonly<TreeCompilerType[]>, newChildNode: TreeNodeType, index?: number) {
  for (let breadcrumbIndex = 0; breadcrumbIndex < breadcrumbPaths.length; breadcrumbIndex++) {
    const breadcrumbPath = breadcrumbPaths[breadcrumbIndex];
    if (breadcrumbIndex === breadcrumbPaths.length - 1)
      return postNodeByBreadcrumb(node, treeCompilers, newChildNode, index);

    const childNode = getNodeByBreadcrumb(node, breadcrumbPath, treeCompilers);
    if (!childNode) return;
    node = childNode;
  }
}

export function putNodeByBreadcrumb(node: Readonly<TreeNodeType>, breadcrumbPath: Readonly<string>, treeCompilers: Readonly<TreeCompilerType[]>, newChildNode: TreeNodeType) {
  let putNodeByBreadcrumbFunc: putNodeByBreadcrumbFunc | undefined = undefined;
  for (const compiler of [tsMorphCompiler, ...treeCompilers]) {
    putNodeByBreadcrumbFunc = compiler.putNodeByBreadcrumbFuncMap[node.type] as putNodeByBreadcrumbFunc | undefined;

    if (putNodeByBreadcrumbFunc)
      return putNodeByBreadcrumbFunc(node, breadcrumbPath, newChildNode);
  }
}

export function putNodeByBreadcrumbs(node: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, treeCompilers: Readonly<TreeCompilerType[]>, newChildNode: TreeNodeType) {
  for (let breadcrumbIndex = 0; breadcrumbIndex < breadcrumbPaths.length; breadcrumbIndex++) {
    const breadcrumbPath = breadcrumbPaths[breadcrumbIndex];
    if (breadcrumbIndex === breadcrumbPaths.length - 1)
      return putNodeByBreadcrumb(node, breadcrumbPath, treeCompilers, newChildNode);

    const childNode = getNodeByBreadcrumb(node, breadcrumbPath, treeCompilers);
    if (!childNode) return;
    node = childNode;
  }
}

export function deleteNodeByBreadcrumb(node: Readonly<TreeNodeType>, breadcrumbPath: Readonly<string>, treeCompilers: Readonly<TreeCompilerType[]>) {
  let deleteNodeByBreadcrumbFunc: deleteNodeByBreadcrumbFunc | undefined = undefined;
  for (const compiler of [tsMorphCompiler, ...treeCompilers]) {
    deleteNodeByBreadcrumbFunc = compiler.deleteNodeByBreadcrumbFuncMap[node.type] as deleteNodeByBreadcrumbFunc | undefined;

    if (deleteNodeByBreadcrumbFunc)
      return deleteNodeByBreadcrumbFunc(node, breadcrumbPath);
  }
}

export function deleteNodeByBreadcrumbs(node: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, treeCompilers: Readonly<TreeCompilerType[]>) {
  for (let breadcrumbIndex = 0; breadcrumbIndex < breadcrumbPaths.length; breadcrumbIndex++) {
    const breadcrumbPath = breadcrumbPaths[breadcrumbIndex];
    if (breadcrumbIndex === breadcrumbPaths.length - 1)
      return deleteNodeByBreadcrumb(node, breadcrumbPath, treeCompilers);

    const childNode = getNodeByBreadcrumb(node, breadcrumbPath, treeCompilers);
    if (!childNode) return;
    node = childNode;
  }
}

export function getNodeEditor(nodeTree: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, navigatedNode: Readonly<TreeNodeType>, treeCompilers: Readonly<TreeCompilerType[]>, editors: EditorType[], setter: (node: TreeNodeType) => void) {
  for (const editor of editors) {
    const nodeEditorFunc = editor.getNodeEditorFuncMap[navigatedNode.type];

    if (nodeEditorFunc)
      return nodeEditorFunc(nodeTree, breadcrumbPaths, navigatedNode, treeCompilers, setter);
  }
}