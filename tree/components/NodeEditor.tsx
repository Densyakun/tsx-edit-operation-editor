import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import editor from "../code-compiler/ts-morph/client/editor";

export default function NodeEditor() {
  const { navigatedNode } = useSnapshot(treeState);

  if (!navigatedNode) return null;

  const NodeEditor = editor.nodeEditorFuncMap[navigatedNode.type];

  return NodeEditor ? <NodeEditor /> : null;
}