import { Bookmark } from "@/model/storage/Bookmark";
import { Collection } from "@/model/storage/Collection";
import { Bookmarks } from "webextension-polyfill-ts";

export function convertTreeNode2Bookmark(bookmark: Bookmarks.BookmarkTreeNode): Bookmark {
  if (bookmark != null) {
    const result = new Bookmark();
    result.id = Number.parseInt(bookmark.id);
    result.parentId = Number.parseInt(bookmark.parentId);
    result.title = bookmark.title;
    result.url = bookmark.url;
    result.createdTime = new Date(bookmark.dateAdded);
    return result;
  } else {
    return null;
  }
}

export function convertTreeNode2Collection(collection: Bookmarks.BookmarkTreeNode): Collection {
  if (collection != null) {
    const result = new Collection();
    result.id = Number.parseInt(collection.id);
    result.parentId = Number.parseInt(collection.parentId);
    result.title = collection.title;
    result.createdTime = new Date(collection.dateAdded);
    result.lastEditTime = collection.dateGroupModified
      ? new Date(collection.dateGroupModified)
      : new Date(collection.dateAdded);
    return result;
  } else {
    return null;
  }
}
