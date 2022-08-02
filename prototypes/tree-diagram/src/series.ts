import { RawData } from "./index";

export enum NodeType {
    Internal = "node-internal",
    Leaf = "node-leaf"
}
export interface Nodes {
    id?: number;
    value?: string;
    width?: number;
    type?: NodeType,
    // mark(mode?: MarkingOperation): void;
    children?: Nodes[];
}

export function buildNodes(
    node: RawData,
    fontSize: number
) {
    let type = node.children ? NodeType.Internal : NodeType.Leaf;
    let width = calcWidth();
    let children = node.children?.map(child => buildNodes(child, fontSize));

    let nodes : Nodes = {
        value: node.value,
        width: width,
        type: type,
        children: children
    }

    return nodes;

    function calcWidth() {
        document.getElementById("measureText")!.textContent = node.value;
        return document.getElementById("measureText")!.clientWidth+16;
    }
}
