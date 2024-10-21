import { EditorType, EditorUIType, getNodeEditorFunc, TreeNodeListItemType } from "@/tree/lib/type";
import { SyntaxKind } from "ts-morph";
import { OtherNodeTypeId, TSMorphProjectTypeId, SourceFileTypeId, SyntaxListTypeId, TSMorphOtherNodeType, TSMorphProjectType, TSMorphSourceFileType, TSMorphSyntaxListType } from "./compiler";

const kindCount = 363;

function getKindHue(kind: number) {
  return kind * 360 / kindCount;
}

function nodeChildrenItemList(node: TSMorphSyntaxListType | TSMorphOtherNodeType): TreeNodeListItemType[] {
  return node.children?.map((child, index) => {
    return {
      breadcrumb: { path: index.toString(), label: SyntaxKind[child.kind] },
      text: SyntaxKind[child.kind],
      color: `hsl(${getKindHue(child.kind)}, 50%, 75%)`,
    };
  }) || [];
}

const getNodeEditorFuncMap: { [key: string]: getNodeEditorFunc } = {
  [TSMorphProjectTypeId]: node => ({
    title: "ts-morph Project",
    itemLists: {
      "Source files": (node as TSMorphProjectType).sourceFiles.map(sourceFile => ({
        breadcrumb: { path: sourceFile.filePath, label: sourceFile.filePath },
        text: sourceFile.relativeFilePath,
        color: "hsl(0, 0%, 75%)",
      })),
    },
  }),
  [SourceFileTypeId]: node => ({
    title: "Source file",
    itemLists: {
      "Syntaxes": nodeChildrenItemList((node as TSMorphSourceFileType).syntaxList),
    },
    dataTexts: [
      `Comment ranges at EOF: ${JSON.stringify((node as TSMorphSourceFileType).commentRangesAtEndOfFile)}`,
      `Whitespaces: ${JSON.stringify((node as TSMorphSourceFileType).whitespaces)}`,
    ],
  }),
  [SyntaxListTypeId]: node => ({
    title: "ts-morph Syntax list",
    itemLists: {
      "Syntaxes": nodeChildrenItemList(node as TSMorphSyntaxListType),
    },
  }),
  [OtherNodeTypeId]: (node, setter) => {
    let editorui: EditorUIType | undefined = undefined;

    if ((node as TSMorphOtherNodeType).kind === SyntaxKind.StringLiteral)
      editorui = {
        label: "Value",
        type: "string",
        getter: () => (node as TSMorphOtherNodeType).text!.substring(1, (node as TSMorphOtherNodeType).text!.length - 1),
        setter: (value: string) => {
          const newNode = { ...node } as TSMorphOtherNodeType;
          // TODO エスケープ文字
          newNode.text = `"${value}"`;
          setter(newNode);
        },
      };
    else if ((node as TSMorphOtherNodeType).kind === SyntaxKind.FirstLiteralToken)
      editorui = {
        label: "Value",
        type: "number",
        getter: () => (node as TSMorphOtherNodeType).text!,
        setter: (value: string) => {
          const newNode = { ...node } as TSMorphOtherNodeType;
          newNode.text = `${value}`;
          setter(newNode);
        },
      };

    return {
      title: "ts-morph Node",
      itemLists: {
        "Children": nodeChildrenItemList(node as TSMorphOtherNodeType),
      },
      dataTexts: (node as TSMorphOtherNodeType).children
        ? []
        : [
          `Leading comment ranges: ${JSON.stringify((node as TSMorphOtherNodeType).leadingCommentRanges)}`,
          `Text: ${(node as TSMorphOtherNodeType).text && JSON.stringify((node as TSMorphOtherNodeType).text)}`,
          `Trailing comment ranges: ${JSON.stringify((node as TSMorphOtherNodeType).trailingCommentRanges)}`,
          `Whitespaces: ${JSON.stringify((node as TSMorphOtherNodeType).whitespaces)}`,
        ],
      editorui,
    };
  },
};

export default { getNodeEditorFuncMap } as EditorType;