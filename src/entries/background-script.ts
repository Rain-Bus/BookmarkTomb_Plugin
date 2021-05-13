import {browser} from "webextension-polyfill-ts";
import {traverseLocalTree} from "@/lib/util/scan/localTree";
import {insertCollections, listCollectionIds, selectCollection} from "@/lib/storage/collection";
import {containElem, containSameElem} from "@/lib/util/arrayUtil";
import {deleteLocalSyncIds, insertSystemInfo, listLocalSyncIds,} from "@/lib/storage/systemInfo";
import {isCollection} from "@/lib/util/bookmarkNodeUtil";
import {
    deleteCollectionAPI,
    getModifyTimeAPI,
    updateCollectionInfoAPI,
    updateCollectionParentAPI
} from "@/api/collection";
import {listSyncItems, upsertSyncItem} from "@/lib/storage/syncItem";
import dayjs from "dayjs";
import {
    pullItem,
    pushBookmark,
    pushCollection,
    pushOneBookmarkById,
    pushOneBookmarkByNode,
    pushOneCollectionByNode,
    removeLocalBookmark,
    removeLocalCollection
} from "@/lib/strategies/basic";
import Config from "@/model/constant/settings";
import {deleteBookmark, insertBookmarks, listBookmarkIds, selectBookmark} from "@/lib/storage/bookmark";
import {deleteBookmarksAPI, updateBookmarkInfoAPI, updateBookmarkParentAPI} from "@/api/bookmark";
import {UpdateBookmarkParent, UpdateCollectionParent} from "@/model/request/update";
import errorMap from "@/model/constant/error";
import {ErrorMessage} from "@/model/request/error";
import {getSystemInfoAPI} from "@/api/public";
import {PublicSystemInfo} from "@/model/request/public";
import request from "@/lib/instance/request";

// Use the localSyncIds(in the systemInfo indexDB) to identify the syncing collections and bookmarks,
// if the listener detect the change related to the localSyncIds, it will process matched statement.
/*------------------------------------------------< Background Listeners >--------------------------------------------------*/

browser.bookmarks.onRemoved.addListener(async (id, removeInfo) => {
    let localId = parseInt(id)
    let localSyncIds = await listLocalSyncIds()
    let localSyncItems = await listSyncItems()
    let localSyncRootIds = localSyncItems.map(item => item.localCollectionId)
    let localTreeNodes = traverseLocalTree(removeInfo.node)
    let removeIds = localTreeNodes.map(item => parseInt(item.id))

    // If the remove id contain the syncItem's root id, delete the related data in indexDB.
    // If the remove id isn't syncItem's the root id and contain in localSyncIds,
    //      it must be a sub collection of these root collection or a bookmark.
    if (containSameElem(removeIds, localSyncRootIds) && containSameElem(removeIds, localSyncIds)) {
        for (let localSyncItem of localSyncItems) {
            if (containElem(removeIds, localSyncItem.localCollectionId)) {
                await removeLocalCollection(localSyncItem.localCollectionId)
                localSyncItem.errorFlag = "LOCAL_ROOT_DELETED"
                await upsertSyncItem(localSyncItem)
            }
        }
    } else if (containElem(localSyncIds, localId)) {
        if (isCollection(removeInfo.node)) {
            await deleteCollectionAPI((await selectCollection(localId)).id)
            await removeLocalCollection(localId)
        } else {
            let removeBookmark = await selectBookmark(id)
            let serverBookmarkId = removeBookmark.id
            await deleteBookmarksAPI(Array.of(serverBookmarkId))
            await deleteLocalSyncIds(Array.of(removeBookmark.localId))
            await deleteBookmark(removeBookmark.localId)
        }
    }
})

browser.bookmarks.onCreated.addListener(async (id, nodeInfo) => {
    let localSyncIds = await listLocalSyncIds()
    let parentId = parseInt(nodeInfo.parentId)
    if (containElem(localSyncIds, parentId)) {
        if (isCollection(nodeInfo)) {
            await pushOneCollectionByNode(nodeInfo)
        } else {
            await pushOneBookmarkByNode(nodeInfo)
        }
    }
})

browser.bookmarks.onChanged.addListener(async (id, changeInfo) => {
    let localSyncIds = await listLocalSyncIds()
    let localId = parseInt(id)
    if (containElem(localSyncIds, localId)) {
        // Url is null present the change info is collection
        // TO-DO: If the target item update time is after the local modify time
        if (changeInfo.url === undefined) {
            let collection = await selectCollection(localId)
            collection.title = changeInfo.title
            await updateCollectionInfoAPI(collection)
            await insertCollections(Array.of(collection))
        } else {
            let bookmark = await selectBookmark(localId)
            bookmark.title = changeInfo.title
            bookmark.url = changeInfo.url
            await updateBookmarkInfoAPI(bookmark)
            await insertBookmarks(Array.of(bookmark))
        }
    }
})

browser.bookmarks.onMoved.addListener(async (id, moveInfo) => {
    let localId = parseInt(id)
    let targetId = parseInt(moveInfo.parentId)
    let localSyncItems = await listSyncItems()
    let localSyncRootIds = localSyncItems.map(item => item.localCollectionId)
    let localSyncBookmarkIds = await listBookmarkIds()
    let localSyncCollectionIds = await listCollectionIds()

    // If the move item is the root collection of syncItem, set the syncItem's localParentCollectionId to target id.
    // If the move item is collection,
    //      if target id is inside the syncing collection, update the server and local info to the new collection,
    //      if target Id is not in the syncing collection, delete the server and local info,
    //      if the collection was not in the syncing collection, but the target in it,
    //          push the move in collection and bookmarks to server and local.
    // If the move item is bookmark, same to collection.
    if (containElem(localSyncRootIds, localId)) {
        for (let localSyncItem of localSyncItems) {
            if (localId === localSyncItem.localCollectionId) {
                localSyncItem.localParentCollectionId = targetId
                await upsertSyncItem(localSyncItem)
            }
        }
    } else if (containElem(localSyncCollectionIds, localId)) {
        let collection = await selectCollection(localId)
        if (containElem(localSyncCollectionIds, targetId)) {
            let serverId = collection.id
            let oldServerParentId = collection.parentId
            let targetServerParentId = (await selectCollection(targetId)).id
            let updateParent = new UpdateCollectionParent(serverId, oldServerParentId, targetServerParentId)
            await updateCollectionParentAPI(updateParent)
            collection.parentId = targetServerParentId
            await insertCollections(Array.of(collection))
        } else {
            await removeLocalCollection(localId)
            await deleteCollectionAPI(collection.id)
        }
    } else if (containElem(localSyncBookmarkIds, localId)) {
        let bookmark = await selectBookmark(localId)
        if (containElem(localSyncCollectionIds, targetId)) {
            let serverId = bookmark.id
            let oldServerParentId = bookmark.parentId
            let targetServerParentId = (await selectCollection(targetId)).id
            let updateParent = new UpdateBookmarkParent(serverId, oldServerParentId, targetServerParentId)
            await updateBookmarkParentAPI(updateParent)
            bookmark.parentId = targetServerParentId
            await insertBookmarks(Array.of(bookmark))
        } else {
            await removeLocalBookmark(localId)
            await deleteBookmarksAPI(Array.of(bookmark.id))
        }
    } else if (containElem(localSyncCollectionIds, targetId)) {
        let item = (await browser.bookmarks.get(localId.toString())).pop()
        let targetServerParentId = (await selectCollection(targetId)).id
        if (isCollection(item)) {
            await pushCollection(localId, targetServerParentId)
            await pushBookmark(localId)
        } else {
            await pushOneBookmarkById(localId)
        }
    }
})

browser.runtime.onInstalled.addListener(async () => {
    localStorage.getItem("updateInterval") === undefined
        ? localStorage.setItem("updateInterval", Config.updateInterval.toString())
        : null
})

setTimeout(async() => {
    if (localStorage.getItem("baseURL") !== null) {
        let data:PublicSystemInfo = (await getSystemInfoAPI(localStorage.getItem("baseURL"))).data
        await insertSystemInfo("serverVersion", data.version)
    }
    await executeSync()
}, Config.syncAfterStartUp)

setInterval(async () => {
    await executeSync()
}, parseInt(localStorage.getItem("updateInterval") ?? Config.updateInterval.toString()))

async function executeSync() {
    let syncItems = await listSyncItems()
    for (let syncItem of syncItems) {
        if (syncItem.errorFlag !== undefined) {
            continue
        }
        let modifyTimeRes = await getModifyTimeAPI(syncItem.serverCollectionId).catch((err: ErrorMessage) => {
            if (err.code === 5101) {
                syncItem.errorFlag = "SERVER_ROOT_DELETED"
            }
            upsertSyncItem(syncItem)
            throw errorMap.get(5101)
        })
        let serverModifyTime = dayjs(modifyTimeRes.data)
        if (serverModifyTime.isAfter(dayjs(syncItem.serverModifyTime))) {
            await pullItem(syncItem.syncId)
        }
    }
}

// Listen the new baseURL from localStorage, which
setInterval(listenBaseURL, 10000)

function listenBaseURL() {
    let newBaseURL = localStorage.getItem("baseURL")
    if (Config.baseURL !== newBaseURL) {
        Config.baseURL = newBaseURL;
        request.defaults.baseURL = newBaseURL;
    }
}