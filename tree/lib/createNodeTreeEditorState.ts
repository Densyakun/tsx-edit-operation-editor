import { proxy, subscribe } from 'valtio';
import { BreadcrumbPart, TreeNodeType } from './type';
import { subscribeKey } from 'valtio/utils';
import { getNodeByBreadcrumbs } from './util';
import treeState from './state';

export type NodeTreeEditorStateType = {
  nodeTree?: TreeNodeType;
  breadcrumbs: BreadcrumbPart[];
  breadcrumbPaths: string[];
  navigatedNode?: TreeNodeType;
};

export default function createNodeTreeEditorState() {
  const nodeTreeEditorState = proxy<NodeTreeEditorStateType>({
    breadcrumbs: [],
    breadcrumbPaths: [],
  });

  function updateNavigatedNode() {
    if (!nodeTreeEditorState.nodeTree) return;
    nodeTreeEditorState.breadcrumbPaths = nodeTreeEditorState.breadcrumbs.map(value => value.path);

    nodeTreeEditorState.navigatedNode = getNodeByBreadcrumbs(nodeTreeEditorState.nodeTree, nodeTreeEditorState.breadcrumbPaths, treeState.treeCompilers);
  }

  subscribeKey(nodeTreeEditorState, 'nodeTree', updateNavigatedNode);
  subscribe(nodeTreeEditorState.breadcrumbs, updateNavigatedNode);
  subscribeKey(treeState, 'treeCompilers', updateNavigatedNode);

  return nodeTreeEditorState;
}