import { Bookmarks } from "webextension-polyfill-ts";
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;
import {traverseLocalTreeById} from "@/lib/util/scan/localTree";
import {Collection} from "@/model/storage/Collection";
import {convertTreeNode2Collection} from "@/lib/util/convert";

export async function getLocalCollectionNode(parentId?: number): Promise<Bookmarks.BookmarkTreeNode[]> {
  return (await traverseLocalTreeById(parentId)).filter((collection: BookmarkTreeNode) => collection.url == undefined);
}

export async function getLocalCollection(parentId?: number): Promise<Collection[]> {
  return await getLocalCollectionNode(parentId).then(collections => collections.map(collection => convertTreeNode2Collection(collection)))
}

export async function getLocalCollectionIds(parentId?: number): Promise<number[]> {
  return (await getLocalCollection(parentId)).map(collection => collection.id)
}