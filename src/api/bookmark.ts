import request from '@/lib/instance/request'
import {Bookmark} from "@/model/storage/Bookmark";
import {UpdateBookmarkParent} from "@/model/request/update";

export async function getBookmarkByOwnerAPI() {
  return request({
    url: "/api/bookmark/owner",
    params: {order: "desc", according: "defaults"}
  })
}

export async function getBookmarkByCollectionsAPI(collections: Array<number>) {
  let data = {
    getBookmarkIds: collections
  }
  return request({
    method: "post",
    url: "/api/bookmark/collections",
    params: {order: "desc", according: "defaults"},
    data
  })
}

export async function insertSeveralBookmarksAPI(bookmarks: Bookmark[]){
  let data = {
    insertBookmarkVOs: bookmarks
  }
  return request({
    url: "/api/bookmarks",
    method: "post",
    data
  })
}

export async function insertOneBookmarkAPI(data: Bookmark) {
  return request({
    url: "/api/bookmark",
    method: "post",
    data
  })
}

export async function deleteBookmarksAPI(deleteIds: Array<number>) {
  let data = {
    bookmarkIds: deleteIds
  }
  return request({
    url: "/api/bookmark",
    method: "delete",
    data
  })
}

export async function updateBookmarkInfoAPI(bookmark: Bookmark) {
  let data = bookmark
  return request({
    url: "/api/bookmark",
    method: "put",
    data
  })
}

export async function updateBookmarkParentAPI(updateInfo: UpdateBookmarkParent) {
  let data = updateInfo
  return request({
    url: "/api/bookmark/parent",
    method: "put",
    data
  })
}