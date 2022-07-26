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

export function getAllNodes(node: d3.HierarchyPointNode<Node>): d3.HierarchyPointNode<Node>[] {
    let currentNode = node;
    let root = currentNode;
    while (currentNode.parent !== null) {
        root = currentNode.parent;
        currentNode = root;
    }
    return root.descendants();
}

export function compareNodes(node1: d3.HierarchyPointNode<Node>, node2: d3.HierarchyPointNode<Node>): boolean {
    if (
        node1.data.name == undefined ||
        node1.data.type == undefined ||
        node2.data.name == undefined ||
        node2.data.type == undefined
    ) {
        return false;
    }

    if (node1.data.name == node2.data.name && node1.data.type == node2.data.type) {
        return true;
    } else {
        return false;
    }
}
