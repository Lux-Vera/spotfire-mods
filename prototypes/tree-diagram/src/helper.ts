import { Nodes } from "./series";

/**
 * Checks if two dom rectangles are overlap
 * @param firstArea
 * @param secondArea
 */
 export function overlap(firstArea: DOMRect, secondArea: DOMRect): boolean {
    return !(
        firstArea.right < secondArea.left ||
        firstArea.left > secondArea.right ||
        firstArea.bottom < secondArea.top ||
        firstArea.top > secondArea.bottom
    );
}


 export function getAllNodes(node : d3.HierarchyPointNode<Nodes>) : d3.HierarchyPointNode<Nodes>[] {
    let currentNode = node;
    let root = currentNode;
    while (currentNode.parent !== null) {
        root = currentNode.parent;
        currentNode = root;
    }

    return root.descendants()
 }

 export function compareNodes(node1: d3.HierarchyPointNode<Nodes>, node2: d3.HierarchyPointNode<Nodes>): boolean {
    if (
        node1.data.value == undefined ||
        node2.data.value == undefined
    ) {
        return false;
    }

    if (node1.data.value == node2.data.value) {
        return true;
    } else {
        return false;
    }
}

 export function clearAllMarkings(node: d3.HierarchyPointNode<Nodes>): void {
    let nodes = getAllNodes(node);
    // Mark all nodes containing the same value at the same time.
    // TODO: Call internal marking API when using real data.
    nodes.forEach(n => {
        if (n.data.value ===  node.data.value) {
            n.data.marked = node.data.marked;
        } else {
            n.data.marked = false;
        }
    })
}


// Retrieves all children of a subtree
// and puts them into a list
export function treeToList(tree : any) {
    let children : any = tree.children
    let collectedNodes : any = [];
    while (children.length > 0) {
        children.forEach((child : any) => {
            if (child.children !== undefined) {
                children = [...children, ...child.children]
            }
            collectedNodes.push(child);
            children.shift();
        })
    }
    return collectedNodes;
}

export function createTree(data : any, fontSize : any) {
    const hashTable = Object.create(null);
    data.forEach((d : any) => {
        //Create a hashtable with the ID as keys
        hashTable[d.id] = {marked : d.marked,mark : d.mark, value: d.value, ID: d.id, width: fontSize*d.value.length*0.7, parentID: d.parentId, children: [] };
    });
    // Take the root of the tree
    let tree : any = hashTable[data[0].id]
    data.slice(1,).forEach((d : any) => {
        hashTable[d.parentId].children.push(hashTable[d.id]); 
    });
    return tree;
}