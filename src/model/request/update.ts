export class UpdateCollectionParent {
    id: number
    toParentId: number
    fromParentId: number

    constructor(collectionId: number, fromCollection: number, toCollection: number) {
        this.id = collectionId
        this.toParentId = toCollection
        this.fromParentId = fromCollection
    }
}

export class UpdateBookmarkParent {
    ids: Array<number>
    toParentId: number
    fromParentId: number

    constructor(bookmarkIds: number| number[], fromCollection: number, toCollection: number) {
        this.ids = typeof bookmarkIds === "number" ? Array.of(bookmarkIds) : bookmarkIds
        this.toParentId = toCollection
        this.fromParentId = fromCollection
    }
}