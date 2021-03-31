import { Collection } from "@/model/storage/Collection";
import { CollectionStore } from "../instance/indexeddb";

export async function insertCollections(collections: Collection[]) {
  for (const collection of collections) {
    await CollectionStore.setItem(collection.localId.toString(), collection);
  }
}

export async function listCollections(): Promise<Array<Collection>> {
  let collections = new Array<Collection>();
  await CollectionStore.iterate((value: Collection) => {
    collections.push(value);
  });
  return collections;
}

export async function listCollectionIds(): Promise<Array<number>> {
  return (await CollectionStore.keys()).map(id => parseInt(id))
}

export async function selectCollection(id: string|number): Promise<Collection> {
  let collection: Collection = undefined;
  await CollectionStore.iterate((value, key) => {
    if (key === id.toString()) {
      collection = <Collection>value;
    }
  })
  return collection
}

export async function deleteCollection(id: string) {
  await CollectionStore.removeItem(id);
}

export async function deleteCollections(ids: string[] | number[]) {
  for (let id of ids) {
    await deleteCollection(id.toString())
  }
}

export async function clearCollection() {
  await CollectionStore.clear();
}