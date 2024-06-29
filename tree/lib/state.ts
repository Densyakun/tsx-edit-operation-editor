import { proxy } from 'valtio';

const treeState = proxy<{
  dirPath: string;
  breadcrumbs: {
    path: string;
    label: string;
  }[];
}>({
  dirPath: '.',
  breadcrumbs: [],
});

export default treeState;