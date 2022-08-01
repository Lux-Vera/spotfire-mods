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
        node1.data.type == undefined ||
        node2.data.value == undefined ||
        node2.data.type == undefined
    ) {
        return false;
    }

    if (node1.data.value == node2.data.value && node1.data.type == node2.data.type) {
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