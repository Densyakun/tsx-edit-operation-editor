import * as yup from "yup";
import { TreeCompilerType } from "../tree-compiler/type";

export type TreeNodeType = {
  type: string;
};

export type getNodeByBreadcrumbFunc = (node: TreeNodeType, breadcrumb: string) => TreeNodeType | undefined;

export type postNodeByBreadcrumbFunc = (node: TreeNodeType, newChildNode: TreeNodeType, index?: number) => string | undefined;

export type putNodeByBreadcrumbFunc = (node: TreeNodeType, breadcrumb: string, newChildNode: TreeNodeType) => TreeNodeType | undefined;

export type deleteNodeByBreadcrumbFunc = (node: TreeNodeType, breadcrumb: string) => TreeNodeType | undefined;

export type BreadcrumbPart = {
  path: string;
  label: string;
};

export type NodeEditorType = {
  title?: string;
  itemLists?: { [key: string]: TreeNodeListItemType[] };
  topItemListKeys?: string[];
  dataTexts?: string[];
  editorui?: EditorUIType;
  addChildNodeList?: { [key: string]: AddChildNodeType };
};

export type EditorUIType = {
  label: string;
  type: 'string' | 'number';
  selectItems?: string[];
  getter: () => string;
  setter: (value: string) => void;
};

export type TreeNodeListItemType = {
  breadcrumb: BreadcrumbPart;
  text: string;
  color: string;
};

export type getNodeEditorFunc = (nodeTree: Readonly<TreeNodeType>, breadcrumbPaths: Readonly<string[]>, node: Readonly<TreeNodeType>, treeCompilers: Readonly<TreeCompilerType[]>, setter: (node: TreeNodeType) => void) => NodeEditorType | undefined;

export type EditorType = {
  getNodeEditorFuncMap: { [key: string]: getNodeEditorFunc };
};

export type AddChildNodeType = {
  editorSchema?: {
    [key: string]: {
      label: string;
      schema: yup.AnyObject;
      selectItems?: string[] | [string, number][];
    }
  };
  func: (data: any) => void;
};