export class TreeView {
    id: number
    url: string
    name: string
    disable: boolean
    children: TreeView[]
    constructor(id: number, name?: string, url?: string) {
        this.id = id
        this.name = name
        this.url = url
    }
    public hasChild(): boolean {
        return this.children.length !== 0
    }
}