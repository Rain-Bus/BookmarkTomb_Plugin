export function containSameElem<T>(arr1: Array<T>, arr2: Array<T>): Boolean {
    for (const ele of arr1) {
        if (arr2.indexOf(ele) !== -1) {
            return true
        }
    }
    return false
}

export function filterSameElem<T>(arr1: Array<T>, arr2: Array<T>): Array<T> {
    return arr1.filter(ele => arr2.indexOf(ele) !== -1)
}

export function containElem<T>(arr: Array<T>, elem: T) {
    return arr.indexOf(elem) !== -1
}

export function convertElem2Num(arr: Array<string>) {
    let result = new Array<number>()
    arr.forEach(elem => result.push(parseInt(elem)))
    return result
}