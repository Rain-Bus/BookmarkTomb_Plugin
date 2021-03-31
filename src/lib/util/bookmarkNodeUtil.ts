import {Bookmarks} from "webextension-polyfill-ts";
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;

export function isCollection(node: BookmarkTreeNode) {
    return node.url === undefined
}