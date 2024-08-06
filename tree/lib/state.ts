import { proxy, subscribe } from 'valtio';
import { BreadcrumbPart, TreeNodeType } from './type';
import { getNodeByBreadcrumbs } from './util';
import { subscribeKey } from 'valtio/utils';

const treeState = proxy<{
  dirPath: string;
  nodeTree?: TreeNodeType;
  loading: boolean;
  error?: Error;
  breadcrumbs: BreadcrumbPart[];
  breadcrumbPaths: string[];
  navigatedNode?: TreeNodeType;
}>({
  dirPath: '.',
  loading: true,
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