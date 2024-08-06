import { getNodeByBreadcrumbFunc, TreeNodeType } from "../lib/type";

export type TreeCompilerType = {
  decompile: (tree: TreeNodeType) => TreeNodeType;
  compile: (tree: TreeNodeType) => TreeNodeType;
  getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc };
};