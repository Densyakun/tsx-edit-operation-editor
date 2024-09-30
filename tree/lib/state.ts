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

function updateEditor() {
  treeState.treeCompilers = treeState.addons
    .filter(({ compiler }) => compiler)
    .map(addon => addon.compiler as TreeCompilerType);
  treeState.editors = [
    tsMorphEditor,
    ...treeState.addons
      .filter(({ editor }) => editor)
      .map(addon => addon.editor as EditorType)
  ];
}

subscribeKey(treeState, 'addons', updateEditor);

export default treeState;