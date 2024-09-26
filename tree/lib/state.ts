import { proxy, subscribe } from 'valtio';
import { BreadcrumbPart, EditorType, TreeNodeType } from './type';
import { subscribeKey } from 'valtio/utils';
import { AddonType, TreeCompilerType } from '../tree-compiler/type';
import tsMorphEditor from "../code-compiler/ts-morph/editor";
import { getNodeByBreadcrumbs } from './util';

const treeState = proxy<{
  dirPath: string;
  nodeTree?: TreeNodeType;
  breadcrumbs: BreadcrumbPart[];
  breadcrumbPaths: string[];
  navigatedNode?: TreeNodeType;
  addons: AddonType[];
  treeCompilers: TreeCompilerType[];
  editors: EditorType[];
}>({
  dirPath: '.',
  breadcrumbs: [],
  breadcrumbPaths: [],
  addons: [],
  treeCompilers: [],
  editors: [],
});

function updateNavigatedNode() {
  if (!treeState.nodeTree) return;
  treeState.breadcrumbPaths = treeState.breadcrumbs.map(value => value.path);

  treeState.navigatedNode = getNodeByBreadcrumbs(treeState.nodeTree, treeState.breadcrumbPaths, treeState.treeCompilers);
}

subscribeKey(treeState, 'nodeTree', updateNavigatedNode);
subscribe(treeState.breadcrumbs, updateNavigatedNode);
subscribeKey(treeState, 'treeCompilers', updateNavigatedNode);

function updateEditor() {
  treeState.treeCompilers = treeState.addons.map(addon => addon.compiler);
  treeState.editors = [tsMorphEditor, ...treeState.addons.map(addon => addon.editor)];
}

subscribeKey(treeState, 'addons', updateEditor);

export default treeState;