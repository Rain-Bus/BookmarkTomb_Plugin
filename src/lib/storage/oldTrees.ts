import { Bookmarks } from "webextension-polyfill-ts";
import { OldStore } from "../instance/indexeddb";
import {getLocalTree} from "@/lib/util/scan/localTree";
import {SyncItem} from "@/model/storage/SyncItem";
import dayjs from "dayjs";
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;

export async function insertOldLocalTree(syncItem: SyncItem) {
    await getLocalTree(syncItem.localCollectionId).then((tree) => {
        console.log(tree)
        OldStore.setItem(syncItem.syncId + "<>" + new Date().toISOString(), tree);
    });
}

export async function listOldLocalTree() {
    const result: Map<Date, BookmarkTreeNode> = new Map();
    await OldStore.iterate((value: Bookmarks.BookmarkTreeNode, key: string) => {
        result.set(new Date(Date.parse(key)), value)
    })
    console.log(result)
}
export async function selectOldTree(key: string): Promise<BookmarkTreeNode>{
    return await OldStore.getItem(key)
}

export async function deleteOldLocalTree(id: string) {
    await OldStore.removeItem(id)
}

export async function clearOldLocalTree() {
    await OldStore.clear()
}

export async function listTimeById(syncKey: string) {
    let dates = new Array<Date>()
    await OldStore.iterate((value, key) => {
        let keySplitArr = key.split("<>")
        if (keySplitArr[0] === syncKey) {
            dates.push(dayjs(keySplitArr[1]).toDate())
        }
    })
    return dates
}

export async function deleteTreeByTime(date: Date) {
    await OldStore.iterate(((value, key) => {
        if (dayjs(key.split("<>")[1]).isBefore(dayjs(date))) {
            console.log("deleted" + key)
            OldStore.removeItem(key)
        } else {
            return
        }
    }))
}

export async function deleteTreeById(syncKey: string) {
    await OldStore.iterate(((value, key) => {
        if (key.split("<>")[0] === syncKey) {
            OldStore.removeItem(key)
        }
    }))
}