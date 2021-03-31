import localForage from 'localforage'

export var OldStore = localForage.createInstance({
  name: "oldTree",
  driver: localForage.INDEXEDDB
})

export var BookmarkStore = localForage.createInstance({
  name: "bookmark",
  driver: localForage.INDEXEDDB
})

export var CollectionStore = localForage.createInstance({
  name: "collection",
  driver: localForage.INDEXEDDB
})

export var SyncItemStore = localForage.createInstance({
  name: "syncItem",
  driver: localForage.INDEXEDDB
})

export var SystemInfoStore = localForage.createInstance({
  name: "systemInfo",
  driver: localForage.INDEXEDDB
})