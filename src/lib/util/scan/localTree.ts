import { browser } from "webextension-polyfill-ts";
import { Bookmarks } from "webextension-polyfill-ts/lib/bookmarks";
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;

export async function getLocalTree(parentId?: number): Promise<Bookmarks.BookmarkTreeNode> {
  let localTree: BookmarkTreeNode = null;
  if (parentId === undefined) {
    await browser.bookmarks.getTree().then((tree) => {
      localTree = tree.pop();
    });
  } else {
    await browser.bookmarks.getSubTree(parentId.toString()).then((tree) => {
      localTree = tree.pop();
    }).catch(() => undefined);
  }
  return localTree;
}

export async function traverseLocalTreeById(parentId?: number): Promise<Bookmarks.BookmarkTreeNode[]> {
  const rootNode = await getLocalTree(parentId)
  return traverseLocalTree(rootNode)
}

export function traverseLocalTree(rootNode: BookmarkTreeNode) {
  const elements: Array<Bookmarks.BookmarkTreeNode> = [];
  const scanQueue: Array<Bookmarks.BookmarkTreeNode> = [];
  scanQueue.push(rootNode);
  while (scanQueue.length != 0) {
    const currentNode = scanQueue.shift();
    elements.push(currentNode);
    console.log(currentNode)
    if (currentNode.children !== undefined) {
      for (const childNode of currentNode.children) {
        scanQueue.push(childNode);
      }
    }
  }
  elements.forEach((ele) => {
    ele.children = undefined;
  });
  return elements;
}