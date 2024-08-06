import tsMorphCompiler, { TSMorphProjectTypeId, TSMorphProjectType, TSMorphSourceFileType, SourceFileTypeId } from "@/tree/code-compiler/ts-morph/compiler";
import { getNodeByBreadcrumbFunc, TreeNodeType } from "@/tree/lib/type";
import { TreeCompilerType } from "../type";
import normalizePath from "normalize-path";
import path from "path";

export const NextJSTypeId = 'densyakun-nextjs';

export type NextJSType = TreeNodeType & {
  type: typeof NextJSTypeId;
  pages: { [key: string]: TSMorphSourceFileType };
  unresolvedPages: NextJSUnresolvedPageType[];
  customApp?: TSMorphSourceFileType;
  customDocument?: TSMorphSourceFileType;
  otherSourceFiles: TSMorphSourceFileType[];
};

export const NextJSUnresolvedPageTypeId = 'densyakun-nextjs-unresolved-page';

export type NextJSUnresolvedPageType = TreeNodeType & {
  type: typeof NextJSUnresolvedPageTypeId;
  route: string;
  sourceFile: TSMorphSourceFileType;
};

function decompile(tree: TreeNodeType): TreeNodeType {
  if (tree.type === TSMorphProjectTypeId) {
    const sourceFiles = (tree as TSMorphProjectType).sourceFiles;

    const nextEnvIndex = sourceFiles.findIndex(sourceFile => sourceFile.relativeFilePath === "next-env.d.ts");

    if (nextEnvIndex !== -1) {
      const sourceFilesWithoutNextEnv = [...sourceFiles.splice(0, nextEnvIndex), ...sourceFiles.splice(1)];

      const otherSourceFiles: TSMorphSourceFileType[] = [];

      const filesInAppRouter: TSMorphSourceFileType[] = [];
      for (const sourceFile of sourceFilesWithoutNextEnv) {
        if (normalizePath(sourceFile.relativeFilePath).startsWith("app/"))
          filesInAppRouter.push(sourceFile);
        else
          otherSourceFiles.push(sourceFile);
      }

      if (filesInAppRouter.length) {
        // TODO App Router

        return {
          type: NextJSTypeId,
          pages: {},
          unresolvedPages: [],
          otherSourceFiles,
        } as NextJSType;
      } else {
        // Pages Router
        const otherSourceFiles_: TSMorphSourceFileType[] = [];
        const pages: { [key: string]: TSMorphSourceFileType } = {};
        const unresolvedPages: NextJSUnresolvedPageType[] = [];
        let customApp: TSMorphSourceFileType | undefined;
        let customDocument: TSMorphSourceFileType | undefined;
        for (const sourceFile of otherSourceFiles) {
          const normalizedPath = normalizePath(sourceFile.relativeFilePath);

          if (normalizedPath.startsWith("pages/")) {
            const a = path.dirname(normalizedPath).split("/").splice(1);
            const b = path.basename(normalizedPath, path.extname(normalizedPath));
            if (b === "_app" && !a.length) {
              customApp = sourceFile;
            } else if (b === "_document" && !a.length) {
              customDocument = sourceFile;
            } else {
              let route = "/";
              if (a.length) route += a.join("/");
              if (b !== "index") {
                if (a.length) route += "/";
                route += b;
              }

              if (pages[route]) {
                // /xxx/index.tsx よりも /xxx.tsx が優先される
                if (b === "index")
                  unresolvedPages.push({
                    type: "densyakun-nextjs-unresolved-page",
                    route,
                    sourceFile,
                  });
                else {
                  unresolvedPages.push({
                    type: "densyakun-nextjs-unresolved-page",
                    route,
                    sourceFile: pages[route],
                  });
                  pages[route] = sourceFile;
                }
              } else
                pages[route] = sourceFile;
            }
          } else
            otherSourceFiles_.push(sourceFile);
        }

        return {
          type: NextJSTypeId,
          pages,
          unresolvedPages,
          customApp,
          customDocument,
          otherSourceFiles: otherSourceFiles_,
        } as NextJSType;
      }
    }
  }

  return tree;
}

function compile(tree: TreeNodeType): TreeNodeType {
  return tree;
}

const getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc } = {
  [NextJSTypeId]: (node, breadcrumb) => {
    return Object.values((node as NextJSType).pages).find(({ filePath }) => filePath === breadcrumb)
      || (node as NextJSType).unresolvedPages.find(({ sourceFile }) => sourceFile.filePath === breadcrumb)
      || (node as NextJSType).customApp?.filePath === breadcrumb && (node as NextJSType).customApp
      || (node as NextJSType).customDocument?.filePath === breadcrumb && (node as NextJSType).customDocument
      || (node as NextJSType).otherSourceFiles.find(({ filePath }) => filePath === breadcrumb);
  },
  [NextJSUnresolvedPageTypeId]: (node, breadcrumb) =>
    tsMorphCompiler.getNodeByBreadcrumbFuncMap[SourceFileTypeId]((node as NextJSUnresolvedPageType).sourceFile, breadcrumb)
  ,
};

export default { decompile, compile, getNodeByBreadcrumbFuncMap } as TreeCompilerType;