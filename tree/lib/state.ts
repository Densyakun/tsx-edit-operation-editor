import { proxy, subscribe } from 'valtio';
import { BreadcrumbPart, TreeNodeType } from './type';
import { getNodeByBreadcrumbs } from './util';
import { subscribeKey } from 'valtio/utils';

const treeState = proxy<{
  dirPath: string;
  nodeTree?: TreeNodeType;
  breadcrumbs: BreadcrumbPart[];
  breadcrumbPaths: string[];
  navigatedNode?: TreeNodeType;
}>({
  dirPath: '.',
  breadcrumbs: [],
  breadcrumbPaths: [],
});

function updateNavigatedNode() {
  if (!treeState.nodeTree) return;
  treeState.breadcrumbPaths = treeState.breadcrumbs.map(value => value.path);

  treeState.navigatedNode = getNodeByBreadcrumbs(treeState.nodeTree, treeState.breadcrumbPaths);
}

subscribeKey(treeState, 'nodeTree', updateNavigatedNode);
subscribe(treeState.breadcrumbs, updateNavigatedNode);

export default treeState;