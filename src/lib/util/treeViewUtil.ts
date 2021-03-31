import {getUserCollectionAPI} from "@/api/collection";
import {TreeView} from "@/model/view/TreeView";
import {Collection} from "@/model/storage/Collection";
import {Bookmarks, browser} from "webextension-polyfill-ts";
import {traverseLocalTreeById} from "@/lib/util/scan/localTree";
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode

export async function getServerCollectionTree(): Promise<TreeView[]> {
    return await getUserCollectionAPI().then(res => {
        let currentTreeViewArrays = new Array<Array<TreeView>>()
        let allCollections: Collection[] = res.data

        let rootCollection = new TreeView(0, "Root")
        rootCollection.children = allCollections
            .filter(collection => collection.parentId === 0)
            .map(collection => new TreeView(collection.id, collection.title))
        console.log(rootCollection)
        currentTreeViewArrays.push(rootCollection.children);
        for (let currentTreeViewArray of currentTreeViewArrays) {
            for (let currentTreeView of currentTreeViewArray) {
                currentTreeView.children = allCollections
                    .filter(collection => collection.parentId === currentTreeView.id)
                    .map(collection => new TreeView(collection.id, collection.title))
                currentTreeViewArrays.push(currentTreeView.children)
            }
        }
        console.log(rootCollection)
        return Array.of(rootCollection)
    })
}

export async function getLocalCollectionTree(): Promise<TreeView[]> {
    return await browser.bookmarks.getTree().then(async allCollections => {
        let rootNode = allCollections[0]
        let currentNodes = Array.of(rootNode)
        let rootCollection = new TreeView(parseInt(rootNode.id), "Root")
        rootCollection.disable = true
        let currentTreeViews = Array.of(rootCollection)
        while (currentNodes.length !== 0) {
            let currentNode = currentNodes.shift()
            let currentTreeView = currentTreeViews.shift()
            let childCollectionNodes = currentNode.children
                .filter(node => node.url === undefined)
            currentTreeView.children = childCollectionNodes
                .map(collection => new TreeView(parseInt(collection.id), collection.title))
            currentTreeViews = currentTreeViews.concat(currentTreeView.children)
            currentNodes = currentNodes.concat(childCollectionNodes)
        }
        return Array.of(rootCollection)
    })
}

export async function generateTreeViewByTree(tree: BookmarkTreeNode) {
    let rootNode = tree
    let currentNodes = Array.of(tree)
    let rootTreeView = new TreeView(parseInt(rootNode.id), rootNode.title, rootNode.url)
    let currentTreeViews = Array.of(rootTreeView)
    while (currentNodes.length !== 0) {
        let currentNode = currentNodes.shift()
        let currentTreeView = currentTreeViews.shift()
        let childCollectionNodes = currentNode.children ?? []
        currentTreeView.children = childCollectionNodes.map(node => new TreeView(parseInt(node.id), node.title, node.url))
        currentTreeViews.push(...currentTreeView.children)
        currentNodes.push(...childCollectionNodes)
    }
    return Array.of(rootTreeView)
}

export async function setTreeNode(tree: TreeView, newNode: TreeView) {
    let currentTreeNodes: Array<TreeView> = Array.of(tree)
    while (currentTreeNodes.length !== 0) {
        let currentTreeNode = currentTreeNodes.shift()
        let childNodeIds = currentTreeNode.children.map(node => node.id)
        let targetNodeIndex = childNodeIds.indexOf(newNode.id)
        if (targetNodeIndex !== -1) {
            newNode.disable !== undefined ? currentTreeNode.children[targetNodeIndex].disable = newNode.disable : null
            newNode.name !== undefined ? currentTreeNode.children[targetNodeIndex].name = newNode.name : null
            newNode.children !== undefined ? currentTreeNode.children[targetNodeIndex].children = newNode.children : null
            return
        }
        currentTreeNodes = currentTreeNodes.concat(currentTreeNode.children)
    }
}

export function getParentId(tree: Array<TreeView>, childId: number) {
    let rootNode = tree[0]
    let currentNodes = Array.of(rootNode)
    while (currentNodes.length !== 0) {
        let currentNode = currentNodes.shift()
        if (currentNode.children.map(node => node.id).indexOf(childId) !== -1) {
            return currentNode.id
        }
        currentNodes.push(...currentNode.children)
    }
    throw "Can't find the parent of " + childId + " from " + tree
}

export async function getLocalPath(id: number|string) {
    let localItems = await traverseLocalTreeById()
    let leafItem = localItems.filter(item => item.id === id.toString())[0]
    let pathNodes = new Array<BookmarkTreeNode>(leafItem)
    let rootTreeView = new TreeView(0, "Root")
    let pathTreeViews = new Array<TreeView>(rootTreeView)
    while (pathNodes[pathNodes.length-1].parentId !== '0') {
        let currentNode = pathNodes[pathNodes.length-1]
        pathNodes.push(localItems.filter(item => item.id === currentNode.parentId)[0])
    }
    while (pathNodes.length !== 0) {
        let currentNode = pathNodes.pop()
        pathTreeViews.push(new TreeView(parseInt(currentNode.id), currentNode.title))
    }
    while (pathTreeViews.length !== 1) {
        let currentTreeView = pathTreeViews.pop()
        pathTreeViews[pathTreeViews.length - 1].children = Array.of(currentTreeView)
    }
    return pathTreeViews
}

export async function getServerPath(id: number) {
    let serverItems: Array<Collection> = (await getUserCollectionAPI()).data
    let leafItem = serverItems.filter(item => item.id === id)[0]
    let pathNodes = new Array<Collection>(leafItem)
    let rootTreeView = new TreeView(0, "Root")
    let pathTreeViews = new Array(rootTreeView)
    while (pathNodes[pathNodes.length-1].parentId !== 0) {
        let currentNode = pathNodes[pathNodes.length-1]
        pathNodes.push(serverItems.filter(item => item.id === currentNode.parentId)[0])
    }
    while (pathNodes.length !== 0) {
        let currentNode = pathNodes.pop()
        pathTreeViews.push(new TreeView(currentNode.id, currentNode.title))
    }
    while (pathTreeViews.length !== 1) {
        let currentTreeView = pathTreeViews.pop()
        pathTreeViews[pathTreeViews.length-1].children = Array.of(currentTreeView)
    }
    return pathTreeViews
}