import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['defu', '@parcel/watcher', '@laioutr-core/frontend-core', 'botid'],
});
