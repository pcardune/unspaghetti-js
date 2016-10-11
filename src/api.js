export function getFiles(path) {
  return fetch(`/api/ls?path=${path}`)
    .then(res => res.json())
}

export function getDeps(path) {
  return fetch(`/api/deps?path=${path}`)
    .then(res => res.json())
    .then(treeResponse => {
      if (!treeResponse) {
        return;
      }
      return treeResponse;
    });
}
