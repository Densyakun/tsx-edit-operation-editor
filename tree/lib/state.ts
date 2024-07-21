import { proxy } from 'valtio';
import { TSMorphSourceFileType } from '../code-compiler/ts-morph/compiler';

const treeState = proxy<{
  dirPath: string;
  nodeTree?: TSMorphSourceFileType[];
  breadcrumbs: {
    path: string;
    label: string;
  }[];
}>({
  dirPath: '.',
  breadcrumbs: [],
});

export default treeState;