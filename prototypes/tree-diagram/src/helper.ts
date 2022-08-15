import { Numeric } from "d3";
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

 export function reBuildNodes(node : any) {
    /**
     * Rebuilds original subtree by removing the 
     * "hidden" children and adding them as original
     * childnodes.
     */
    let toProcess = [node];
    while (toProcess.length > 0) {
        if (toProcess[0]._children?.length > 0) {
            toProcess[0].children = toProcess[0]._children;
            toProcess[0].data.children = toProcess[0].data._children;
            let toAdd = toProcess[0].children;
            delete toProcess[0]._children;
            delete toProcess[0].data._children;
            toProcess = [...toProcess, ...toAdd];
        }
        toProcess.shift();
    }
 }
 
 export function getAllNodesCustom(node : d3.HierarchyPointNode<Nodes>) : d3.HierarchyPointNode<Nodes>[] {
    console.log("Getting all nodes")
    let currentNode = node;
    let root = currentNode;
    while (currentNode.parent !== null) {
        root = currentNode.parent;
        currentNode = root;
    }

    let toDigest = root.children;
    console.log("root is: ", root);
    console.log("Todigest2: ", toDigest);
    if (toDigest == undefined) {
        console.log("undefined returning")
        return [];
    }
    let allNodes = [];
    console.log("toDigest before loop: ", toDigest);
    while(toDigest.length > 0) {
        if (toDigest[0].children != undefined) {
            toDigest = [...toDigest, ...toDigest[0].children];
            let firstElement = toDigest.shift();
            allNodes.push(firstElement);
            console.log("toDigest: ", toDigest);
            console.log("allChildren: ", allNodes);
        }
    }
    console.log("allNodes: ", allNodes)

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

export function createTree(data : Nodes[], fontSize : number) {
    const hashTable = Object.create(null);
    data.forEach((d : Nodes) => {
        //Create a hashtable with the ID as keys
        hashTable[d.id] = {color : d.color, level: 0, markColumn : d.markColumn, marked : d.marked, mark : d.mark, value: d.value, ID: d.id, width: fontSize*d.value.length*0.7, parentID: d.parentId, children: [] };
    });
    // Take the root of the tree

    let tree : any = hashTable[data[0].id]
    tree.level = 0;
    

    // To construct the levels we have to be sure that they are in order by id
    data.sort((a,b) => Number(a.id) - Number(b.id));
    
    data.forEach((d : Nodes, idx : number, arr : Nodes[]) => {
        if (Number(d.parentId) == 0) {
            d.level = 0;
        } else {
            hashTable[d.id].level = hashTable[d.parentId].level + 1;

        }

    })

    data.slice(1,).forEach((d : Nodes) => {
        hashTable[d.parentId].children.push(hashTable[d.id]); 
    });
    return tree;
}

export interface Dimensions {
    depth : number;
    width: number;
}

export function generateDimensions(root : any) : Dimensions {
    /**
     * Gets the depth and max height of the subtree to
     * help with scaling in the render function.
     * To get the depth and height for the entire tree pass in the root node.
     */

    // Build array of nodes:
    let toProcess = [root];
    let tree : any = []
    while(toProcess.length > 0) {
        if (toProcess[0].children !== undefined && toProcess[0].children.length > 0) {
            tree = [...tree, toProcess[0]]
            toProcess = [...toProcess, ...toProcess[0].children]
        }
        toProcess.shift()

    }

    let hashTable = Object.create(null);
    let dimensions : Dimensions = {
        depth : 0,
        width: 0,
    }


    tree.forEach((node : any) => {
        if (hashTable[String(node.level)] == undefined) {
            hashTable[String(node.level)] = 1;    
        } else {
            hashTable[String(node.level)] = hashTable[String(node.level)] + 1;
        }
    })

    for (const key in hashTable) {
        dimensions.depth = (dimensions.depth < Number(key)) ? Number(key) : dimensions.depth;
        dimensions.width = (dimensions.width < hashTable[key]) ? hashTable[key] : dimensions.width;
    }

    return dimensions;
}