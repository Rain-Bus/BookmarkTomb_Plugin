import {SyncItem} from "@/model/storage/SyncItem";
import {SyncItemStore} from "@/lib/instance/indexeddb";

// TO-DO: Don't use item name, use the syncId.
export async function upsertSyncItem(syncItem: SyncItem): Promise<SyncItem> {
    if (syncItem.syncId === undefined) {
        let maxKey = 0;
        await SyncItemStore.iterate((value, key) => {
            let keyNum = parseInt(key)
            if (keyNum > maxKey) {
                maxKey = keyNum
            }
        })
        syncItem.syncId = (++maxKey).toString()
        syncItem.syncName = "Sync " + syncItem.syncId
    }
    await SyncItemStore.setItem(syncItem.syncId, syncItem)
    return syncItem
}

export async function deleteSyncItem(key: string) {
    await SyncItemStore.removeItem(key)
}

export async function clearSyncItem() {
    await SyncItemStore.clear()
}

export async function selectSyncItem(keyName: string) {
    let result: SyncItem = null
    await SyncItemStore.iterate(((value, key) => {
        if (key === keyName) {
            result = <SyncItem>value
        }
    }))
    return result
}

export async function listSyncItems() {
    let syncItems: Array<SyncItem> = new Array<SyncItem>()
    await SyncItemStore.iterate((value: SyncItem) => {
        syncItems.push(value)
    })
    return syncItems
}