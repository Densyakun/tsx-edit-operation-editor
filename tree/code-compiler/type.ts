import { deleteNodeByBreadcrumbFunc, getNodeByBreadcrumbFunc, postNodeByBreadcrumbFunc, putNodeByBreadcrumbFunc } from "../lib/type";

export type CodeCompilerType = {
  getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc };
  postNodeByBreadcrumbFuncMap: { [key: string]: postNodeByBreadcrumbFunc };
  putNodeByBreadcrumbFuncMap: { [key: string]: putNodeByBreadcrumbFunc };
  deleteNodeByBreadcrumbFuncMap: { [key: string]: deleteNodeByBreadcrumbFunc };
};