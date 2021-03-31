import {Bookmark} from "@/model/storage/Bookmark";
import {BookmarkStore} from "../instance/indexeddb";

export async function insertBookmarks(bookmarks: Array<Bookmark>) {
  for(const bookmark of bookmarks) {
    await BookmarkStore.setItem(bookmark.localId.toString(), bookmark)
  }
}

export async function listBookmarks() {
  let bookmarks = new Array<Bookmark>();
  await BookmarkStore.iterate((value: Bookmark) => {
    bookmarks.push(value)
  })
  return bookmarks
}

export async function selectBookmark(id: string|number): Promise<Bookmark> {
  let bookmark: Bookmark = undefined;
  await BookmarkStore.iterate((value, key) => {
    if (key === id.toString()) {
      bookmark = <Bookmark>value;
    }
  })
  return bookmark
}

export async function listBookmarkIds(): Promise<Array<number>> {
  return (await BookmarkStore.keys()).map(id => parseInt(id))
}

export async function deleteBookmark(id: string | number) {
  await BookmarkStore.removeItem(id.toString())
}

export async function deleteBookmarks(ids: string[] | number[]) {
  for (let id of ids) {
    await BookmarkStore.removeItem(id.toString())
  }
}

export async function clearBookmark() {
  await BookmarkStore.clear()
}