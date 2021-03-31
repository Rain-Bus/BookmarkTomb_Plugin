import {SystemInfoStore} from "@/lib/instance/indexeddb";
import _ from "lodash";

/*---------------------------------------< Base Function >---------------------------------------*/

export async function insertSystemInfo(keyName: string, value: unknown) {
    await SystemInfoStore.setItem(keyName, value);
}

export async function selectSystemInfo(keyName?: string) {
    let result = new Map<string, unknown>();
    await SystemInfoStore.iterate((value, key) => {
        if (keyName === undefined) {
            result.set(key, value)
        } else if (keyName === key) {
            result.set(key, value)
        }
    })
    return result;
}

export async function deleteSystemInfo(keyName: string) {
    await SystemInfoStore.removeItem(keyName)
}

export async function clearSystemInfo() {
    await SystemInfoStore.clear()
}

/*---------------------------------------< Util Function >---------------------------------------*/

export async function listLocalSyncIds() {
    return <Array<number>>(await selectSystemInfo("localSyncIds")).get("localSyncIds") ?? new Array<number>()
}

export async function addLocalSyncIds(ids: Array<number>) {
    let oldIds = await listLocalSyncIds()
    let mergeIds = _.uniq(_.concat(ids, oldIds))
    await insertSystemInfo("localSyncIds", mergeIds)
}

export async function deleteLocalSyncIds(ids: Array<number>) {
    let oldIds = await listLocalSyncIds()
    let mergeIds = _.difference(oldIds, ids)
    await insertSystemInfo("localSyncIds", mergeIds)
}

export async function clearLocalSyncIds() {
    await insertSystemInfo("localSyncIds", [])
}
