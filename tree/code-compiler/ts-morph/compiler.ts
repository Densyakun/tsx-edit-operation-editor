import { deleteNodeByBreadcrumbFunc, getNodeByBreadcrumbFunc, postNodeByBreadcrumbFunc, putNodeByBreadcrumbFunc, TreeNodeType } from '@/tree/lib/type';
import path from 'path';
import { Node, Project, SourceFile, SyntaxKind, SyntaxList } from 'ts-morph';
import { CodeCompilerType } from '../type';

export const TSMorphProjectTypeId = 'densyakun-tsmorph-project';

export type TSMorphProjectType = TreeNodeType & {
  type: typeof TSMorphProjectTypeId;
  sourceFiles: TSMorphSourceFileType[];
};

export function loadDirectory(projectPath: string): TSMorphProjectType {
  const project = new Project({
    tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
  });

  const sourceFiles = project.getSourceFiles();

  return {
    type: TSMorphProjectTypeId,
    sourceFiles: sourceFiles.map(sourceFile => getFromSourceFile(path.resolve(process.cwd(), projectPath), sourceFile)),
  };
}

export async function saveDirectory(projectPath: string, projectJson: TSMorphProjectType) {
  const project = new Project({
    tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
  });

  projectJson.sourceFiles.forEach(sourceFileJson => {
    const sourceFile = project.getSourceFile(sourceFileJson.filePath);
    if (!sourceFile) return;
    setToSourceFile(sourceFile, sourceFileJson);
  });

  project.getSourceFiles().forEach(sourceFile => {
    if (!projectJson.sourceFiles.find(sourceFileJson => sourceFileJson.filePath === sourceFile.getFilePath()))
      project.removeSourceFile(sourceFile);
  });

  await project.save();
}

export const SourceFileTypeId = 'densyakun-tsmorph-sourcefile';

export type TSMorphSourceFileType = TreeNodeType & {
  type: typeof SourceFileTypeId;
  filePath: string;
  relativeFilePath: string;
  syntaxList: TSMorphSyntaxListType;
  commentRangesAtEndOfFile: string[];
  whitespaces: string[];
};

export function getChildrenOtherThanComments(node: Node) {
  // コメントが重複しないよう、コメントノードを除く
  return node.getChildren().filter(child =>
    child.getKind() !== SyntaxKind.SingleLineCommentTrivia
    && child.getKind() !== SyntaxKind.MultiLineCommentTrivia
    && child.getKind() !== SyntaxKind.JSDoc
  );
}

function addWhitespaces(sourceFileFullText: string, node: TSMorphSourceFileType | TSMorphSyntaxListType | TSMorphOtherNodeType, start = 0) {
  if (node.type === SourceFileTypeId) {
    node.syntaxList.children.forEach(child => start = addWhitespaces(sourceFileFullText, child, start));

    node.commentRangesAtEndOfFile.forEach(commentRange => {
      const indexOf = sourceFileFullText.indexOf(commentRange, start);
      if (indexOf === -1) return;
      node.whitespaces.push(sourceFileFullText.substring(start, indexOf));
      start = indexOf + commentRange.length;
    });

    node.whitespaces.push(sourceFileFullText.substring(start));

    return start;
  }

  if (node.type === SyntaxListTypeId) {
    node.children.forEach(child => start = addWhitespaces(sourceFileFullText, child, start));
    return start;
  }

  if (node.type !== OtherNodeTypeId)
    return start;

  let { children, leadingCommentRanges, text, trailingCommentRanges } = node;

  if (children)
    children.forEach(child => start = addWhitespaces(sourceFileFullText, child, start));
  else {
    if (text) {
      leadingCommentRanges?.forEach(commentRange => {
        const indexOf = sourceFileFullText.indexOf(commentRange, start);
        if (indexOf === -1) return;
        node.whitespaces!.push(sourceFileFullText.substring(start, indexOf));
        start = indexOf + commentRange.length;
      });

      const indexOf = sourceFileFullText.indexOf(text, start);
      node.whitespaces!.push(sourceFileFullText.substring(start, indexOf));
      start = indexOf + text.length;
    }

    trailingCommentRanges?.forEach(commentRange => {
      const indexOf = sourceFileFullText.indexOf(commentRange, start);
      if (indexOf === -1) return;
      node.whitespaces!.push(sourceFileFullText.substring(start, indexOf));
      start = indexOf + commentRange.length;
    });
  }

  return start;
}

export function getFromSourceFile(projectPath: string, sourceFile: SourceFile): TSMorphSourceFileType {
  const filePath = sourceFile.getFilePath();
  const children = sourceFile.getChildren();

  const syntaxList = getFromSyntaxList(children[0] as SyntaxList);

  const commentRangesAtEndOfFile = children[1].getLeadingCommentRanges().map(commentRange => commentRange.getText());

  const sourceFileJson: TSMorphSourceFileType = {
    type: SourceFileTypeId,
    filePath,
    relativeFilePath: path.relative(projectPath, filePath),
    syntaxList,
    commentRangesAtEndOfFile,
    whitespaces: [],
  };

  addWhitespaces(sourceFile.getFullText(), sourceFileJson);

  return sourceFileJson;
}

export function setToSourceFile(sourceFile: SourceFile, json: ReturnType<typeof getFromSourceFile>) {
  sourceFile.set({ statements: [] });

  sourceFile.replaceWithText(addFullText(json.syntaxList.children, undefined, undefined, json.commentRangesAtEndOfFile, json.whitespaces));
}

export function addFullText(children?: TSMorphNodeType[], leadingCommentRanges?: string[], text?: string, trailingCommentRanges?: string[], whitespaces?: string[], fullText = "") {
  if (children)
    children.forEach(childJson => fullText = addFullText(childJson.children, childJson.leadingCommentRanges, childJson.text, childJson.trailingCommentRanges, childJson.whitespaces, fullText));

  let whitespaceIndex = 0;

  if (text) {
    leadingCommentRanges?.forEach(commentRange => {
      fullText += whitespaces![whitespaceIndex] + commentRange;
      whitespaceIndex++;
    });

    fullText += whitespaces![whitespaceIndex] + text;
    whitespaceIndex++;
  }

  trailingCommentRanges?.forEach(commentRange => {
    fullText += whitespaces![whitespaceIndex] + commentRange;
    whitespaceIndex++;
  });

  if (whitespaces && whitespaceIndex < whitespaces.length)
    fullText += whitespaces![whitespaceIndex];

  return fullText;
}

export type TSMorphNodeType = TreeNodeType & {
  type: typeof SyntaxListTypeId | typeof OtherNodeTypeId;
  kind: SyntaxKind;
  children?: (TSMorphSyntaxListType | TSMorphOtherNodeType)[];
  text?: string;
  leadingCommentRanges?: string[];
  trailingCommentRanges?: string[];
  whitespaces?: string[];
};

export const SyntaxListTypeId = 'densyakun-tsmorph-syntaxlist';

export type TSMorphSyntaxListType = TSMorphNodeType & {
  type: typeof SyntaxListTypeId;
  kind: SyntaxKind.SyntaxList;
  children: (TSMorphSyntaxListType | TSMorphOtherNodeType)[];
};

export function getFromSyntaxList(syntaxList: SyntaxList): TSMorphSyntaxListType {
  // 次の兄弟要素と重複するため、leadingCommentRangesは含まない
  const children = getChildrenOtherThanComments(syntaxList);

  return {
    type: SyntaxListTypeId,
    kind: syntaxList.getKind() as SyntaxKind.SyntaxList,
    children: children.map(child => getFromOtherNode(child)),
  };
}

export const OtherNodeTypeId = 'densyakun-tsmorph-othernode';

export type TSMorphOtherNodeType = TSMorphNodeType & {
  type: typeof OtherNodeTypeId;
};

export function getFromOtherNode(node: Node): TSMorphOtherNodeType {
  const kind = node.getKind();

  const children = getChildrenOtherThanComments(node);

  if (children.length)
    return {
      type: OtherNodeTypeId,
      kind,
      children: children.map(child =>
        child.isKind(SyntaxKind.SyntaxList)
          ? getFromSyntaxList(child as SyntaxList)
          : getFromOtherNode(child)),
    };

  const text = node.getText();
  const leadingCommentRanges = node.getLeadingCommentRanges().map(commentRange => commentRange.getText());
  const trailingCommentRanges = node.getTrailingCommentRanges().map(commentRange => commentRange.getText());

  return {
    type: OtherNodeTypeId,
    kind,
    text,
    leadingCommentRanges,
    trailingCommentRanges,
    whitespaces: [],
  };
}

const getNodeByBreadcrumbFuncMap: { [key: string]: getNodeByBreadcrumbFunc } = {
  [TSMorphProjectTypeId]: (node, breadcrumb) => {
    const sourceFiles = (node as TSMorphProjectType).sourceFiles;
    return sourceFiles.find(({ filePath }) => filePath === breadcrumb);
  },
  [SourceFileTypeId]: (node, breadcrumb) => {
    const sourceFile = node as TSMorphSourceFileType;
    return sourceFile.syntaxList.children[parseInt(breadcrumb)];
  },
  [SyntaxListTypeId]: (node, breadcrumb) => {
    const syntaxList = node as TSMorphSyntaxListType;
    return syntaxList.children[parseInt(breadcrumb)];
  },
  [OtherNodeTypeId]: (node, breadcrumb) => {
    const otherNode = node as TSMorphOtherNodeType;
    return otherNode.children ? otherNode.children[parseInt(breadcrumb)] : undefined;
  },
};

const postNodeByBreadcrumbFuncMap: { [key: string]: postNodeByBreadcrumbFunc } = {
  [TSMorphProjectTypeId]: (node, newChildNode) => {
    (node as TSMorphProjectType).sourceFiles.push(newChildNode as TSMorphSourceFileType);
    return (newChildNode as TSMorphSourceFileType).filePath;
  },
  [SourceFileTypeId]: (node, newChildNode, index = (node as TSMorphSourceFileType).syntaxList.children.length) => {
    (node as TSMorphSourceFileType).syntaxList.children.splice(index, 0, newChildNode as TSMorphSyntaxListType | TSMorphOtherNodeType);
    return index.toString();
  },
  [SyntaxListTypeId]: (node, newChildNode, index = (node as TSMorphSyntaxListType).children.length) => {
    (node as TSMorphSyntaxListType).children.splice(index, 0, newChildNode as TSMorphSyntaxListType | TSMorphOtherNodeType);
    return index.toString();
  },
  [OtherNodeTypeId]: (node, newChildNode, index = (node as TSMorphOtherNodeType).children?.length || 0) => {
    (node as TSMorphOtherNodeType).children?.splice(index, 0, newChildNode as TSMorphSyntaxListType | TSMorphOtherNodeType);
    return index.toString();
  },
};

const putNodeByBreadcrumbFuncMap: { [key: string]: putNodeByBreadcrumbFunc } = {
  [TSMorphProjectTypeId]: (node, breadcrumb, newChildNode) => {
    const sourceFiles = (node as TSMorphProjectType).sourceFiles;
    for (let index = 0; index < sourceFiles.length; index++) {
      const { filePath } = sourceFiles[index];
      if (filePath === breadcrumb)
        return sourceFiles.splice(index, 1, newChildNode as TSMorphSourceFileType)[0];
    }
    return undefined;
  },
  [SourceFileTypeId]: (node, breadcrumb, newChildNode) => {
    const sourceFile = node as TSMorphSourceFileType;
    return sourceFile.syntaxList.children.splice(parseInt(breadcrumb), 1, newChildNode as TSMorphSyntaxListType | TSMorphOtherNodeType)[0];
  },
  [SyntaxListTypeId]: (node, breadcrumb, newChildNode) => {
    const syntaxList = node as TSMorphSyntaxListType;
    return syntaxList.children.splice(parseInt(breadcrumb), 1, newChildNode as TSMorphSyntaxListType | TSMorphOtherNodeType)[0];
  },
  [OtherNodeTypeId]: (node, breadcrumb, newChildNode) => {
    const otherNode = node as TSMorphOtherNodeType;
    return otherNode.children ? otherNode.children.splice(parseInt(breadcrumb), 1, newChildNode as TSMorphSyntaxListType | TSMorphOtherNodeType)[0] : undefined;
  },
};

const deleteNodeByBreadcrumbFuncMap: { [key: string]: deleteNodeByBreadcrumbFunc } = {
  [TSMorphProjectTypeId]: (node, breadcrumb) => {
    const sourceFiles = (node as TSMorphProjectType).sourceFiles;
    for (let index = 0; index < sourceFiles.length; index++) {
      const { filePath } = sourceFiles[index];
      if (filePath === breadcrumb)
        return sourceFiles.splice(index, 1)[0];
    }
  },
  [SourceFileTypeId]: (node, breadcrumb) => {
    const sourceFile = node as TSMorphSourceFileType;
    return sourceFile.syntaxList.children.splice(parseInt(breadcrumb), 1)[0];
  },
  [SyntaxListTypeId]: (node, breadcrumb) => {
    const syntaxList = node as TSMorphSyntaxListType;
    return syntaxList.children.splice(parseInt(breadcrumb), 1)[0];
  },
  [OtherNodeTypeId]: (node, breadcrumb) => {
    const otherNode = node as TSMorphOtherNodeType;
    return otherNode.children ? otherNode.children.splice(parseInt(breadcrumb), 1)[0] : undefined;
  },
};

export default { getNodeByBreadcrumbFuncMap, postNodeByBreadcrumbFuncMap, putNodeByBreadcrumbFuncMap, deleteNodeByBreadcrumbFuncMap } as CodeCompilerType;