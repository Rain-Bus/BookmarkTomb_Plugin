export class SyncItem {
    syncId: string
    syncName: string
    localCollectionId: number
    localParentCollectionId: number
    serverCollectionId: number
    serverParentCollectionId: number
    serverModifyTime: Date
    errorFlag: string

    constructor(localCollectionId: number|undefined, localParentCollectionId: number|undefined,
                serverCollectionId: number|undefined, serverParentCollectionId: number|undefined) {
        this.localCollectionId = localCollectionId
        this.serverCollectionId = serverCollectionId
        this.localParentCollectionId = localParentCollectionId
        this.serverParentCollectionId = serverParentCollectionId
    }

    isError() {
        return this.errorFlag !== undefined
    }
}