import React from "react";
import { TreeNodeType } from "../lib/type";

export type getNodeByBreadcrumbFunc = (node: TreeNodeType, breadcrumb: string) => TreeNodeType | undefined;

export type CodeCompilerType = {
  getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc };
};