export const getModuleDirpath = (module) => {
  const parts = module.split('/');
  return parts.slice(0, parts.length - 1).join('/') || '.';
}
