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
};

export type EditorUIType = {
  label: string;
  getter: () => string;
  setter: (value: string) => void;
};

export type TreeNodeListItemType = {
  breadcrumb: BreadcrumbPart;
  text: string;
  color: string;
};

export type getNodeEditorFunc = (node: TreeNodeType, setter: (node: TreeNodeType) => void) => NodeEditorType;

export type EditorType = {
  getNodeEditorFuncMap: { [key: string]: getNodeEditorFunc };
};