import { Bookmarks } from "webextension-polyfill-ts";
import {traverseLocalTreeById} from "@/lib/util/scan/localTree";
import {Bookmark} from "@/model/storage/Bookmark";
import {convertTreeNode2Bookmark} from "@/lib/util/convert";

export async function getLocalBookmarkNode(parentId?: number): Promise<Bookmarks.BookmarkTreeNode[]> {
  return (await traverseLocalTreeById(parentId)).filter(bookmark => bookmark.url != null);
}

export async function getLocalBookmark(parentId?: number): Promise<Bookmark[]> {
  return await getLocalBookmarkNode(parentId).then(bookmarks => bookmarks.map(bookmark => convertTreeNode2Bookmark(bookmark)));
}

export async function getLocalBookmarkIds(parentId?: number): Promise<number[]> {
  return (await getLocalBookmark(parentId)).map(bookmark => bookmark.id);
}