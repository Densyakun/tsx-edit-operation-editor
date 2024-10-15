import { EditorType, EditorUIType, getNodeEditorFunc, TreeNodeListItemType } from "@/tree/lib/type";
import { SyntaxKind } from "ts-morph";
import { OtherNodeTypeId, TSMorphProjectTypeId, SourceFileTypeId, SyntaxListTypeId, TSMorphNodeType, TSMorphOtherNodeType, TSMorphProjectType, TSMorphSourceFileType, TSMorphSyntaxListType } from "./compiler";

const kindCount = 363;

function getKindHue(kind: number) {
  return kind * 360 / kindCount;
}

function nodeChildrenItemList(node: TSMorphNodeType): TreeNodeListItemType[] {
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
    ],
  }),
  [SyntaxListTypeId]: node => ({
    title: "ts-morph Syntax list",
    itemLists: {
      "Syntaxes": nodeChildrenItemList(node as TSMorphSyntaxListType),
    },
    dataTexts: (node as TSMorphNodeType).text
      ? [
        `Leading comment ranges: ${JSON.stringify((node as TSMorphNodeType).leadingCommentRanges)}`,
        `Text: ${JSON.stringify((node as TSMorphNodeType).text)}`,
        `Trailing comment ranges: ${JSON.stringify((node as TSMorphNodeType).trailingCommentRanges)}`,
      ]
      : []
    ,
  }),
  [OtherNodeTypeId]: (node, setter) => {
    const editorui: EditorUIType | undefined = (node as TSMorphNodeType).kind === SyntaxKind.StringLiteral
      ? {
        label: "Value",
        getter: () => (node as TSMorphNodeType).text!.substring(1, (node as TSMorphNodeType).text!.length - 1),
        setter: (value: string) => {
          const newNode = { ...node } as TSMorphNodeType;
          newNode.text = `"${value}"`;
          setter(newNode);
        },
      }
      : undefined;

    return {
      title: "ts-morph Node",
      itemLists: {
        "Children": nodeChildrenItemList(node as TSMorphOtherNodeType),
      },
      dataTexts: (node as TSMorphNodeType).text
        ? [
          `Leading comment ranges: ${JSON.stringify((node as TSMorphNodeType).leadingCommentRanges)}`,
          `Text: ${JSON.stringify((node as TSMorphNodeType).text)}`,
          `Trailing comment ranges: ${JSON.stringify((node as TSMorphNodeType).trailingCommentRanges)}`,
        ]
        : []
      ,
      editorui,
    };
  },
};

export default { getNodeEditorFuncMap } as EditorType;