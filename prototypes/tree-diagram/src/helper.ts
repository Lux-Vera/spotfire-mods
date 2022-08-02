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

 export function clearAllMarkings(node: d3.HierarchyPointNode<Nodes>): void {
    let currentNode = node;
    let root = currentNode;
    while (currentNode.parent !== null) {
        root = currentNode.parent;
        currentNode = root;
    }
    // Mark all nodes containing the same value at the same time.
    // TODO: Call internal marking API when using real data.
    root.descendants().forEach(n => {
        if (n.data.value ===  node.data.value) {
            n.data.marked = node.data.marked;
        } else {
            n.data.marked = false;
        }
    })
}