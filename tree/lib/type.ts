export type TreeNodeType = {
  type: string;
};

export type getNodeByBreadcrumbFunc = (node: TreeNodeType, breadcrumb: string) => TreeNodeType | undefined;

export type BreadcrumbPart = {
  path: string;
  label: string;
};

export type NodeEditorType = {
  title?: string;
  itemLists?: { [key: string]: TreeNodeListItemType[] };
  topItemListKeys?: string[];
  dataTexts?: string[];
};

export type TreeNodeListItemType = {
  breadcrumb: BreadcrumbPart;
  text: string;
  color: string;
};

export type getNodeEditorFunc = (node: TreeNodeType) => NodeEditorType;

export type EditorType = {
  getNodeEditorFuncMap: { [key: string]: getNodeEditorFunc };
};