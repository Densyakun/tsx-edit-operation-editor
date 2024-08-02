import compiler from "../code-compiler/ts-morph/compiler";
import { TreeNodeType } from "./type";

export function getNodeByBreadcrumbs(node: TreeNodeType, breadcrumbsPath: string[]) {
  for (const breadcrumb of breadcrumbsPath) {
    const getNodeByBreadcrumb = compiler.getNodeByBreadcrumbFuncMap[node.type];
    if (!getNodeByBreadcrumb) return;
    const node_ = getNodeByBreadcrumb(node, breadcrumb);
    if (!node_) return;
    node = node_;
  }

  return node;
}