import type { EditorType, getNodeEditorFunc, TreeNodeListItemType } from "@/tree/lib/type";
import type { NextJSType, NextJSUnresolvedPageType } from "./compiler";
import { NextJSTypeId, NextJSUnresolvedPageTypeId } from "./compiler";
import tsMorphEditor from "@/tree/code-compiler/ts-morph/editor";
import { SourceFileTypeId } from "@/tree/code-compiler/ts-morph/compiler";

const getNodeEditorFuncMap: { [key: string]: getNodeEditorFunc } = {
  [NextJSTypeId]: node => {
    const itemLists: { [key: string]: TreeNodeListItemType[] } = {
      "Pages": Object.keys((node as NextJSType).pages).map(key => {
        const sourceFile = (node as NextJSType).pages[key];

        return {
          breadcrumb: { path: sourceFile.filePath, label: sourceFile.filePath },
          text: key,
          color: "hsl(0, 0%, 75%)",
        };
      }),
      "Custom app": (node as NextJSType).customApp
        ? [{
          breadcrumb: { path: (node as NextJSType).customApp!.filePath, label: (node as NextJSType).customApp!.filePath },
          text: "Source file",
          color: "hsl(0, 0%, 75%)",
        }]
        : []
      ,
      "Custom document": (node as NextJSType).customDocument
        ? [{
          breadcrumb: { path: (node as NextJSType).customDocument!.filePath, label: (node as NextJSType).customDocument!.filePath },
          text: "Source file",
          color: "hsl(0, 0%, 75%)",
        }]
        : []
      ,
      "Other source files": Object.values((node as NextJSType).otherSourceFiles).map(sourceFile => ({
        breadcrumb: { path: sourceFile.filePath, label: sourceFile.filePath },
        text: sourceFile.relativeFilePath,
        color: "hsl(0, 0%, 75%)",
      })),
    };

    if ((node as NextJSType).unresolvedPages.length)
      itemLists["Unresolved pages"] = (node as NextJSType).unresolvedPages.map(({ route, sourceFile }) => ({
        breadcrumb: { path: sourceFile.filePath, label: sourceFile.filePath },
        text: sourceFile.relativeFilePath + ` (${route})`,
        color: "hsl(0, 50%, 75%)",
      }));

    return {
      title: "Next.js",
      itemLists,
      topItemListKeys: ["Unresolved pages"],
    };
  },
  [NextJSUnresolvedPageTypeId]: (node, setter) => ({
    title: "Unresolved page",
    itemLists: tsMorphEditor.getNodeEditorFuncMap[SourceFileTypeId]((node as NextJSUnresolvedPageType).sourceFile, sourceFile => setter({
      ...node,
      sourceFile,
    } as NextJSUnresolvedPageType)).itemLists,
    dataTexts: [
      `Route: ${(node as NextJSUnresolvedPageType).route}`,
    ],
  }),
};

export default { getNodeEditorFuncMap } as EditorType;