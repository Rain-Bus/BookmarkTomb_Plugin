import request from "@/lib/instance/request";
import {Collection} from "@/model/storage/Collection";
import {UpdateCollectionParent} from "@/model/request/update";

export async function getUserCollectionAPI() {
  return request({
    url: "/api/collection/owner",
    params: { order: "desc", according: "defaults" },
  });
}

export async function getUserCollectionByParentAPI(parentId: number) {
  return request({
    url: "/api/collection/parent/" + parentId
  })
}

export async function insertSeveralCollectionsAPI(insertCollectionVOs: Array<Collection>) {
  let data = {
    insertCollectionVOs: insertCollectionVOs
  }
  return request({
    url: "/api/collections",
    method: "post",
    data
  })
}

export async function insertOneCollectionAPI(data: Collection) {
  return request({
    url: "/api/collection",
    method: "post",
    data
  })
}

export async function deleteCollectionAPI(id: number) {
  return request({
    url: "/api/collection/" + id,
    method: "delete"
  })
}

export async function getModifyTimeAPI(id: number) {
  return request({
    url: "/api/collection/modify/" + id
  })
}

export async function updateCollectionInfoAPI(collectionInfo: Collection) {
  let data = collectionInfo
  return request({
    url: "/api/collection",
    method: "put",
    data
  })
}

export async function updateCollectionParentAPI(updateInfo: UpdateCollectionParent) {
  let data = updateInfo
  return request({
    url: "/api/collection/parent",
    method: "post",
    data
  })
}