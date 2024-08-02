import { proxy, subscribe } from 'valtio';
import { TreeNodeType } from './type';
import { getNodeByBreadcrumbs } from './util';
import { subscribeKey } from 'valtio/utils';

const treeState = proxy<{
  dirPath: string;
  nodeTree?: TreeNodeType;
  breadcrumbs: {
    path: string;
    label: string;
  }[];
  breadcrumbTrail: string[];
  navigatedNode?: TreeNodeType;
}>({
  dirPath: '.',
  breadcrumbs: [],
  breadcrumbTrail: [],
});

function updateNavigatedNode() {
  if (!treeState.nodeTree) return;
  treeState.breadcrumbTrail = treeState.breadcrumbs.map(value => value.path);

  treeState.navigatedNode = getNodeByBreadcrumbs(treeState.nodeTree, treeState.breadcrumbTrail);
}

subscribeKey(treeState, 'nodeTree', updateNavigatedNode);
subscribe(treeState.breadcrumbs, updateNavigatedNode);

export default treeState;