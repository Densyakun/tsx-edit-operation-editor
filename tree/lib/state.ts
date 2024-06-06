import { proxy } from 'valtio';

const treeState = proxy({
  dirPath: '.',
});

export default treeState;