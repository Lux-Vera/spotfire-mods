import {Column, MarkingOperation } from "spotfire-api";
import { RawData } from "./index";
import * as d3 from "d3";
export enum NodeType {
    Internal = "node-internal",
    Leaf = "node-leaf"
}
export interface Nodes {
    id?: number;
    value?: string;
    width?: number;
    type?: NodeType,
    mark() : void,
    marked? : boolean,
    //mark(mode?: MarkingOperation): void;
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
        mark() {
            
        },
        marked : false,
        children: children
    }

    return nodes;


    function calcWidth() {
        document.getElementById("measureText")!.textContent = node.value;
        return document.getElementById("measureText")!.clientWidth+16;
    }
}
