import { proxy } from 'valtio';
import { EditorType } from './type';
import { subscribeKey } from 'valtio/utils';
import { AddonJsonType, AddonType, TreeCompilerType } from '../tree-compiler/type';
import tsMorphEditor from "../code-compiler/ts-morph/editor";
import { getAddonByJson } from '../tree-compiler/util';

const treeState = proxy<{
  dirPath: string;
  addonsJson: AddonJsonType[];
  addons: AddonType[];
  treeCompilers: TreeCompilerType[];
  editors: EditorType[];
  navigatedAddonIndex: number;
}>({
  dirPath: '.',
  addonsJson: [],
  addons: [],
  treeCompilers: [],
  editors: [],
  navigatedAddonIndex: -1,
});

function updateAddons() {
  treeState.addons = treeState.addonsJson.map(addonJson => getAddonByJson(addonJson)).filter(addon => addon) as AddonType[];
}

subscribeKey(treeState, 'addonsJson', updateAddons);

export function saveAddonsJsonToServer() {
  fetch('/api/addons', {
    method: 'POST',
    body: JSON.stringify(treeState.addonsJson),
  });
}

export function updateEditor() {
  treeState.treeCompilers = treeState.addons
    .filter(addon => addon.enabled && addon.compiler)
    .map(addon => addon.compiler as TreeCompilerType);
  treeState.editors = [
    tsMorphEditor,
    ...treeState.addons
      .filter(addon => addon.enabled && addon.editor)
      .map(addon => addon.editor as EditorType)
  ];
}

subscribeKey(treeState, 'addons', updateEditor);

export default treeState;