import {Column, DataViewRow, MarkingOperation } from "spotfire-api";
import { RawData } from "./index";

export enum NodeType {
    Internal = "node-internal",
    Leaf = "node-leaf"
}
export interface Nodes {
    value: string;
    width: number;
    type: NodeType,
    tooltip(): string;
    // mark(mode?: MarkingOperation): void;
    children?: Nodes[];
    id?: number;
}

export function buildNodes(
    node: RawData,
    fontSize: number
) {
    let type = node.children ? NodeType.Internal : NodeType.Leaf;
    let width = calcNodeWidth();
    let children = node.children?.map((child) => buildNodes(child, fontSize));

    let nodes : Nodes = {
        value: node.value,
        width: width,
        type: type,
        tooltip() {
            // TODO -- return row from DataViewRow
            return "todo";
        },
        children: children
    }

    return nodes;

    function calcNodeWidth() : number{
        //TODO -- needs improvement
        return fontSize*node.value.length*0.7;
    }
}
