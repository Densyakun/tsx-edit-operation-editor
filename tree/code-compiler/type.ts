import { getNodeByBreadcrumbFunc } from "../lib/type";

export type CodeCompilerType = {
  getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc };
};