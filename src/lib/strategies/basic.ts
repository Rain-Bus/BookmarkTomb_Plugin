import {
    deleteCollectionAPI,
    getModifyTimeAPI,
    getUserCollectionByParentAPI,
    insertOneCollectionAPI,
    insertSeveralCollectionsAPI
} from "@/api/collection";
import {Collection} from "@/model/storage/Collection";
import {Bookmarks, browser} from "webextension-polyfill-ts";
import {deleteSyncItem, selectSyncItem, upsertSyncItem} from "@/lib/storage/syncItem";
import {deleteCollections, insertCollections, listCollections, selectCollection} from "@/lib/storage/collection";
import {getLocalCollection, getLocalCollectionIds} from "@/lib/util/scan/localCollection";
import {addLocalSyncIds, deleteLocalSyncIds} from "@/lib/storage/systemInfo";
import {getBookmarkByCollectionsAPI, insertOneBookmarkAPI, insertSeveralBookmarksAPI} from "@/api/bookmark";
import dayjs from "dayjs";
import {getLocalBookmark, getLocalBookmarkIds} from "@/lib/util/scan/localBookmark";
import {Bookmark} from "@/model/storage/Bookmark";
import {deleteBookmarks, insertBookmarks} from "@/lib/storage/bookmark";
import {containElem} from "@/lib/util/arrayUtil";
import {convertTreeNode2Bookmark, convertTreeNode2Collection} from "@/lib/util/convert";
import {traverseLocalTree, traverseLocalTreeById} from "@/lib/util/scan/localTree";
import {insertOldLocalTree} from "@/lib/storage/oldTrees";
import CreateDetails = Bookmarks.CreateDetails;
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;

/**
 * Firstly, push or pull the collection, and then the bookmark will be pushed or pulled,
 *      so can update the modifyTime after the operation of bookmark.
 */

export async function pullCollection(localCollection: number|undefined, serverCollection: number, localParentCollection: number) {

    // Get server collections before remove the collection.
    //      Make sure get the data to prevent mistake delete.
    let serverCollections: Array<Collection> = (await getUserCollectionByParentAPI(serverCollection)).data
    if (localCollection !== undefined){
        if (localParentCollection === 0) {
            await removeLocalCollection(localCollection)
            await removeChildren(localCollection)
        } else {
            await removeLocalCollection(localCollection)
            await browser.bookmarks.removeTree(localCollection.toString())
        }
    }

    // Generate local collection tree.
    let idMap = new Map<number, number>()
    for (let collection of serverCollections) {
        let collectionId = serverCollections.indexOf(collection) === 0
            ? await insert2Local(localParentCollection, collection.title)
            : await insert2Local(idMap.get(collection.parentId), collection.title)
        collection.localId = collectionId
        idMap.set(collection.id, collectionId)
    }

    // Insert related IndexDB collection items and insert these ids to localSyncIds.
    await insertCollections(serverCollections)

    // Return the new local root collection id;
    return serverCollections[0].localId
}

export async function pullBookmark(localCollection: number) {
    let localCollectionIds = await getLocalCollectionIds(localCollection)
    let localCollections = await listCollections()
    let idMap: Map<number, number> = new Map()
    localCollections.forEach(collection => containElem(localCollectionIds, collection.localId)
        ? idMap.set(collection.id, collection.localId)
        : null)
    let serverCollectionIds: Array<number> = Array.from(idMap.keys())
    let serverBookmarks: Array<Bookmark> = (await getBookmarkByCollectionsAPI(serverCollectionIds)).data
    for (let serverBookmark of serverBookmarks) {
        let localParentId = idMap.get(serverBookmark.parentId)
        let title = serverBookmark.title
        let url = serverBookmark.url
        serverBookmark.localId = await insert2Local(localParentId, title, url)
    }
    await insertBookmarks(serverBookmarks)
}

export async function pullItem(syncKey: string) {
    let syncItem = await selectSyncItem(syncKey)
    if (syncItem.localCollectionId !== undefined) {
        let localRootCollection =
            await browser.bookmarks.get(syncItem.localCollectionId.toString()).catch(() => undefined)
        if (localRootCollection !== undefined) {
            await insertOldLocalTree(syncItem)
        }
    }
    syncItem.localCollectionId =
        await pullCollection(syncItem.localCollectionId, syncItem.serverCollectionId, syncItem.localParentCollectionId)
    await pullBookmark(syncItem.localCollectionId)
    syncItem.serverModifyTime =
        dayjs((await getModifyTimeAPI(syncItem.serverCollectionId)).data).toDate()
    await addLocalSyncIds((await traverseLocalTreeById(syncItem.localCollectionId)).map(item => parseInt(item.id)))
    await upsertSyncItem(syncItem)
}

export async function pushCollection(rootCollection: number, serverParentCollection: number) {
    let localCollections = await getLocalCollection(rootCollection)
    localCollections[0].serverParentId = serverParentCollection
    let serverCollections = <Array<Collection>>((await insertSeveralCollectionsAPI(localCollections)).data)
    let serverCollectionId = serverCollections[0].id
    // TO-DO: Maybe the collection array will changed?
    serverCollections.forEach(serverCollection => serverCollection.localId = localCollections.shift().id)
    await insertCollections(serverCollections)
    return serverCollectionId
}

export async function pushBookmark(rootCollection: number) {
    let localBookmarks = await getLocalBookmark(rootCollection)
    if (localBookmarks.length > 0) {
        let localCollections = await listCollections()
        let idMap: Map<number, number> = new Map()
        localCollections.forEach(collection => idMap.set(collection.localId, collection.id))
        localBookmarks.forEach(bookmark => bookmark.parentId = idMap.get(bookmark.parentId))
        let serverBookmarks: Array<Bookmark> = (await insertSeveralBookmarksAPI(localBookmarks)).data
        serverBookmarks.forEach(bookmark => bookmark.localId = localBookmarks.shift().id)
        await insertBookmarks(serverBookmarks)
    }
}

export async function pushItem(syncKey: string) {
    let syncItem = await selectSyncItem(syncKey)
    syncItem.serverCollectionId =
        await pushCollection(syncItem.localCollectionId, syncItem.serverParentCollectionId)
    await pushBookmark(syncItem.localCollectionId)
    syncItem.serverModifyTime =
        dayjs((await getModifyTimeAPI(syncItem.serverCollectionId)).data).toDate()
    await addLocalSyncIds((await traverseLocalTreeById(syncItem.localCollectionId)).map(item => parseInt(item.id)))
    await upsertSyncItem(syncItem)
}

export async function pushOneBookmarkByNode(nodeInfo: BookmarkTreeNode) {
    let parentId = parseInt(nodeInfo.parentId)
    let bookmark = convertTreeNode2Bookmark(nodeInfo)
    bookmark.parentId = (await selectCollection(parentId)).id
    let serverBookmark: Bookmark = (await insertOneBookmarkAPI(bookmark)).data
    serverBookmark.localId = bookmark.id
    await insertBookmarks(Array.of(serverBookmark))
    await addLocalSyncIds(Array.of(serverBookmark.localId))
}

export async function pushOneBookmarkById(bookmarkId: number) {
    await pushOneBookmarkByNode((await browser.bookmarks.get(bookmarkId.toString())).pop())
}

export async function pushOneCollectionByNode(nodeInfo: BookmarkTreeNode) {
    let parentId = parseInt(nodeInfo.parentId)
    let collection = convertTreeNode2Collection(nodeInfo)
    collection.serverParentId = (await selectCollection(parentId)).id
    let serverCollection: Collection = (await insertOneCollectionAPI(collection)).data
    serverCollection.localId = collection.id
    await insertCollections(Array.of(serverCollection))
    await addLocalSyncIds(Array.of(serverCollection.localId))
}

export async function pushOneCollectionById(collectionId: number) {
    await pushOneCollectionByNode((await browser.bookmarks.get(collectionId.toString())).pop())
}

export async function removeLocalCollection(localId: number) {
    let localBookmarkIds = await getLocalBookmarkIds(localId)
    let localCollectionIds = await getLocalCollectionIds(localId)
    await deleteBookmarks(localBookmarkIds)
    await deleteCollections(localCollectionIds)
    await deleteLocalSyncIds([...localBookmarkIds, ...localCollectionIds])
}

export async function removeLocalBookmark(localId: number) {
    await deleteBookmarks(Array.of(localId))
    await deleteLocalSyncIds(Array.of(localId))
}

export async function updateModifyTime(syncKey: string) {
    let syncItem = await selectSyncItem(syncKey)
    syncItem.serverModifyTime = dayjs((await getModifyTimeAPI(syncItem.serverCollectionId)).data).toDate()
    await upsertSyncItem(syncItem)
}

export async function removeSyncItem(syncKey: string, localFlag?: boolean, serverFlag?: boolean) {
    let syncItem = await selectSyncItem(syncKey)
    let localId = syncItem.localCollectionId
    let localBookmarkIds = await getLocalBookmarkIds(localId)
    let localCollectionIds = await getLocalCollectionIds(localId)
    await deleteBookmarks(localBookmarkIds)
    await deleteCollections(localCollectionIds)
    await deleteLocalSyncIds([...localBookmarkIds, ...localCollectionIds])
    localFlag ? await browser.bookmarks.removeTree(localId.toString()) : null
    serverFlag ? await deleteCollectionAPI(syncItem.serverCollectionId) : null
    await deleteSyncItem(syncKey)
}

async function insert2Local(parentId: number|string, title: string, url?: string) {
    if (parentId === 0) {
        let rootCollections = await browser.bookmarks.getChildren("0")
        let node = rootCollections.find(collection => collection.title === title)
        if (node === undefined) {
            throw "Can't found root collection which name is " + title
        }
        return parseInt(node.id)
    }
    const details: CreateDetails = {parentId: parentId.toString(), title: title, url: url}
    return parseInt((await browser.bookmarks.create(details)).id)
}

async function removeChildren(localId: number) {
    let children = await browser.bookmarks.getChildren(localId.toString())
    for (let child of children) {
        await browser.bookmarks.removeTree(child.id)
    }
}

export async function insertByOldTree(oldTree: BookmarkTreeNode) {
    let items = traverseLocalTree(oldTree)
    let idMap = new Map<string, number>()
    for (let item of items) {
        let collectionId = items.indexOf(item) === 0
            ? await insert2Local(item.parentId, item.title, item.url)
            : await insert2Local(idMap.get(item.parentId), item.title, item.url)
        idMap.set(item.id, collectionId)
    }
    return idMap.get(items[0].id)
}