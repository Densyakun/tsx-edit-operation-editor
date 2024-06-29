import { Node, SourceFile, SyntaxKind, SyntaxList } from 'ts-morph';

export type TSMorphSourceFileType = {
  filePath: string;
  syntaxList: NodeJson & {
    children: NodeJson[];
  };
  commentRangesAtEndOfFile: string[];
};

export function getChildrenOtherThanComments(node: Node) {
  // コメントが重複しないよう、コメントノードを除く
  return node.getChildren().filter(child =>
    child.getKind() !== SyntaxKind.SingleLineCommentTrivia
    && child.getKind() !== SyntaxKind.MultiLineCommentTrivia
    && child.getKind() !== SyntaxKind.JSDoc
  );
}

export function getFromSourceFile(sourceFile: SourceFile): TSMorphSourceFileType {
  const children = sourceFile.getChildren();

  return {
    filePath: sourceFile.getFilePath(),
    syntaxList: getFromSyntaxList(children[0] as SyntaxList),
    commentRangesAtEndOfFile: children[1].getLeadingCommentRanges().map(commentRange => commentRange.getText()),
  };
}

export function setToSourceFile(sourceFile: SourceFile, json: ReturnType<typeof getFromSourceFile>) {
  // Clear source file
  sourceFile.set({ statements: [] });

  // Add nodes and new comment ranges at end of file
  let text = "";
  function addChildText(nodeJson: NodeJson) {
    if (nodeJson.children)
      nodeJson.children.forEach(childJson => addChildText(childJson));
    else {
      if (nodeJson.leadingCommentRanges) {
        if (text.length)
          text += '\n';
        nodeJson.leadingCommentRanges.forEach(commentRange => {
          text += commentRange;
          if (commentRange.startsWith('//'))
            text += '\n';
        });
      } text += nodeJson.text + ' ';
      if (nodeJson.trailingCommentRanges)
        nodeJson.trailingCommentRanges.forEach(commentRange => {
          text += commentRange;
          if (commentRange.startsWith('//'))
            text += '\n';
        });
    }
  }
  json.syntaxList.children.forEach(childJson => addChildText(childJson));

  // TODO 改行コードを自動でファイルに合わせる
  sourceFile.replaceWithText(
    text
    + (json.commentRangesAtEndOfFile.length ? "\n" : "")
    + json.commentRangesAtEndOfFile.join("\n")
  );
}

export type NodeJson = {
  kind: SyntaxKind;
  children?: NodeJson[];
  text?: string;
  leadingCommentRanges?: string[];
  trailingCommentRanges?: string[];
};

export function getFromNode(node: Node): NodeJson {
  const kind = node.getKind();

  const children = getChildrenOtherThanComments(node);

  return children.length
    ? {
      kind,
      children: children.map(child =>
        child.isKind(SyntaxKind.SyntaxList)
          ? getFromSyntaxList(child as SyntaxList)
          : getFromNode(child)),
    }
    : {
      kind,
      text: node.getText(),
      leadingCommentRanges: node.getLeadingCommentRanges().map(commentRange => commentRange.getText()),
      trailingCommentRanges: node.getTrailingCommentRanges().map(commentRange => commentRange.getText()),
    };
}

export function getFromSyntaxList(syntaxList: SyntaxList): NodeJson & { children: NodeJson[] } {
  // 次の兄弟要素と重複するため、leadingCommentRangesは含まない
  const children = getChildrenOtherThanComments(syntaxList);

  return {
    kind: syntaxList.getKind(),
    children: children.map(child => getFromNode(child)),
  };
}
