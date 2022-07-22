import { Node } from "./render";
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

export function getAllNodes(node : d3.HierarchyPointNode<unknown>) : d3.HierarchyPointNode<unknown>[] {
    let currentNode = node;
    let root = currentNode;
    while(currentNode.parent !== null) {
        root = currentNode.parent;
        currentNode = root;
    }
    return root.descendants()   
}
