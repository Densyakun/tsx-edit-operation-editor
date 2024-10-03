import { TSMorphSyntaxListType } from "../code-compiler/ts-morph/compiler";
import { EditorType, getNodeByBreadcrumbFunc, TreeNodeType } from "../lib/type";

export type TreeCompilerType = {
  decompile: (tree: TreeNodeType) => TreeNodeType;
  compile: (tree: TreeNodeType) => TreeNodeType;
  getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc };
};

export type AddonJsonType = {
  enabled: boolean;
  compilerCode: string;
  editorCode: string;
  name: string;
  description: string;
  author: string;
  website: string;
};

export type AddonType = {
  enabled: boolean;
  compilerSyntaxList: TSMorphSyntaxListType;
  editorSyntaxList: TSMorphSyntaxListType;
  compiler?: TreeCompilerType;
  editor?: EditorType;
  name: string;
  description: string;
  author: string;
  website: string;
};