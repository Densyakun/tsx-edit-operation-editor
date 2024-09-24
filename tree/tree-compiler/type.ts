import { getNodeByBreadcrumbFunc, TreeNodeType } from "../lib/type";

export type TreeCompilerType = {
  decompile: (tree: TreeNodeType) => TreeNodeType;
  compile: (tree: TreeNodeType) => TreeNodeType;
  getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc };
};

export type AddonType = {
  compilerCode: string;
  editorCode: string;
  name?: string;
  description?: string;
  author?: string;
  website?: string;
};