import tsMorphCompiler, { TSMorphProjectTypeId, SourceFileTypeId } from "@/tree/code-compiler/ts-morph/compiler";
import type { TSMorphProjectType, TSMorphSourceFileType } from "@/tree/code-compiler/ts-morph/compiler";
import type { deleteNodeByBreadcrumbFunc, getNodeByBreadcrumbFunc, postNodeByBreadcrumbFunc, putNodeByBreadcrumbFunc, TreeNodeType } from "@/tree/lib/type";
import type { TreeCompilerType } from "@/tree/tree-compiler/type";
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

function setSourceFilesToNextJS(nextJS: NextJSType, sourceFiles: TSMorphSourceFileType[]) {
  const nextEnvIndex = sourceFiles.findIndex(sourceFile => sourceFile.relativeFilePath === "next-env.d.ts");

  const sourceFilesWithoutNextEnv = nextEnvIndex === -1
    ? [...sourceFiles]
    : [...sourceFiles.toSpliced(nextEnvIndex, 1)];

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

    nextJS.pages = {};
    nextJS.unresolvedPages = [];
    nextJS.otherSourceFiles = otherSourceFiles;
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

    nextJS.pages = pages;
    nextJS.unresolvedPages = unresolvedPages;
    nextJS.customApp = customApp;
    nextJS.customDocument = customDocument;
    nextJS.otherSourceFiles = otherSourceFiles_;
  }
}

function getSourceFilesInNextJS(nextJS: NextJSType) {
  const sourceFiles = [
    ...Object.values(nextJS.pages),
    ...nextJS.unresolvedPages.map(unresolvedPage => unresolvedPage.sourceFile),
    ...nextJS.otherSourceFiles,
  ];

  if (nextJS.customApp)
    sourceFiles.push(nextJS.customApp);
  if (nextJS.customDocument)
    sourceFiles.push(nextJS.customDocument);

  return sourceFiles;
}

function decompile(tree: TreeNodeType): TreeNodeType {
  if (tree.type === TSMorphProjectTypeId) {
    // TODO Next.jsアプリであるかどうか判定する

    const nextJS: NextJSType = {
      type: NextJSTypeId,
      pages: {},
      unresolvedPages: [],
      otherSourceFiles: [],
    };

    setSourceFilesToNextJS(nextJS, (tree as TSMorphProjectType).sourceFiles);

    return nextJS;
  }

  return tree;
}

function compile(tree: TreeNodeType): TreeNodeType {
  if (tree.type === NextJSTypeId) {
    const sourceFiles = getSourceFilesInNextJS(tree as NextJSType);

    return {
      type: TSMorphProjectTypeId,
      sourceFiles,
    } as TSMorphProjectType;
  }

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

const postNodeByBreadcrumbFuncMap: { [key: string]: postNodeByBreadcrumbFunc } = {
  [NextJSTypeId]: (node, newChildNode) => {
    const sourceFiles = getSourceFilesInNextJS(node as NextJSType);
    sourceFiles.push(newChildNode as TSMorphSourceFileType);
    setSourceFilesToNextJS(node as NextJSType, sourceFiles);
    return (newChildNode as TSMorphSourceFileType).filePath;
  },
};

const putNodeByBreadcrumbFuncMap: { [key: string]: putNodeByBreadcrumbFunc } = {
  [NextJSTypeId]: (node, breadcrumb, newChildNode) => {
    const sourceFiles = getSourceFilesInNextJS(node as NextJSType);
    for (let index = 0; index < sourceFiles.length; index++) {
      const { filePath } = sourceFiles[index];
      if (filePath === breadcrumb) {
        const res = sourceFiles.splice(index, 1, newChildNode as TSMorphSourceFileType)[0];
        setSourceFilesToNextJS(node as NextJSType, sourceFiles);
        return res;
      }
    }
    return undefined;
  },
};

const deleteNodeByBreadcrumbFuncMap: { [key: string]: deleteNodeByBreadcrumbFunc } = {
  [NextJSTypeId]: (node, breadcrumb) => {
    const sourceFiles = getSourceFilesInNextJS(node as NextJSType);
    for (let index = 0; index < sourceFiles.length; index++) {
      const { filePath } = sourceFiles[index];
      if (filePath === breadcrumb) {
        const res = sourceFiles.splice(index, 1)[0];
        setSourceFilesToNextJS(node as NextJSType, sourceFiles);
        return res;
      }
    }
  },
};

export default { decompile, compile, getNodeByBreadcrumbFuncMap, postNodeByBreadcrumbFuncMap, putNodeByBreadcrumbFuncMap, deleteNodeByBreadcrumbFuncMap } as TreeCompilerType;