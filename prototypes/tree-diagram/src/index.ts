import { render } from "./render";
import { Nodes} from "./series";
import { DataTable, DataView, Mod, DataViewRow, ModProperty } from "spotfire-api";
import { createTree, generateDimensions } from "./helper";
// var events = require("events");

const Spotfire = window.Spotfire;
const DEBUG = true;

 export interface RawData {
    value: string,
    children?: RawData[]
 }

export interface RenderState {
    preventRender: boolean;
}

Spotfire.initialize(async (mod) => {
    const context = mod.getRenderContext();

    /**
     * Create reader function which is actually a one time listener for the provided values.
     */
    const reader = mod.createReader(
        mod.visualization.data(),
        mod.windowSize(),
        mod.property<boolean>("showInfoBox"),
        mod.property<boolean>("markRootPath")
        // Add properties...
        // E.g. mod.property<string>("curveType"),
    );

    /**
     * Create a persistent state used by the rendering code
     */
    const state: RenderState = { preventRender: false };

    /**
     * Creates a function that is part of the main read-render loop.
     * It checks for valid data and will print errors in case of bad data or bad renders.
     * It calls the listener (reader) created earlier and adds itself as a callback to complete the loop.
     */
    reader.subscribe(generalErrorHandler(mod)(onChange));

    /**
     * The function that is part of the main read-render loop.
     * It checks for valid data and will print errors in case of bad data or bad renders.
     * It calls the listener (reader) created earlier and adds itself as a callback to complete the loop.
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     */
    async function onChange(
        dataView: DataView,
        windowSize: Spotfire.Size,
        showInfoBox : ModProperty<boolean>,
        showRootPath : ModProperty<boolean>
        // Add properties ...
        // curveType: ModProperty<string>,
    ) {
        let data = await buildData(mod, dataView);
        let dimensions = generateDimensions(data.nodes)

        await render(
            state,
            data,
            windowSize,
            {
                font: context.styling.general.font,
            },
            mod.controls.tooltip,
            dimensions
        );

        //renderSettingsButton(mod, showInfoBox, showRootPath);

        context.signalRenderComplete();
    }
});

/**
 * subscribe callback wrapper with general error handling, row count check and an early return when the data has become invalid while fetching it.
 *
 * The only requirement is that the dataview is the first argument.
 * @param mod - The mod API, used to show error messages.
 * @param rowLimit - Optional row limit.
 */
export function generalErrorHandler<T extends (dataView: Spotfire.DataView, ...args: any) => any>(
    mod: Spotfire.Mod,
    rowLimit = 2000
): (a: T) => T {
    return function (callback: T) {
        return async function callbackWrapper(dataView: Spotfire.DataView, ...args: any) {
            try {
                const errors = await dataView.getErrors();
                if (errors.length > 0) {
                    mod.controls.errorOverlay.show(errors, "DataView");
                    return;
                }
                mod.controls.errorOverlay.hide("DataView");

                /**
                 * Hard abort if row count exceeds an arbitrary selected limit
                 */
                const rowCount = await dataView.rowCount();
                if (rowCount && rowCount > rowLimit) {
                    mod.controls.errorOverlay.show(
                        `☹️ Cannot render - too many rows (rowCount: ${rowCount}, limit: ${rowLimit}) `,
                        "General"
                    );
                    return;
                }

                /**
                 * User interaction while rows were fetched. Return early and respond to next subscribe callback.
                 */
                const allRows = await dataView.allRows();
                if (allRows == null) {
                    return;
                }

                await callback(dataView, ...args);

                mod.controls.errorOverlay.hide("General");
            } catch (e: any) {
                mod.controls.errorOverlay.show(
                    e.message || e || "☹️ Something went wrong, check developer console",
                    "General"
                );
                if (DEBUG) {
                    throw e;
                }
            }
        } as T;
    };
}


/**
 * Construct a data format suitable for consumption in d3.
 * @param mod The Mod API object
 * @param dataView The mod's DataView
 */
async function buildData(mod: Mod, dataView: DataView) {
    const fontSize = mod.getRenderContext().styling.general.font.fontSize;
    let rawTreeData = await getData(dataView);
    return {
        clearMarking: dataView.clearMarking,
        nodes : createTree(rawTreeData, fontSize)
    };
}

async function getData(dataView : DataView) : Promise<Nodes[]> {
    const rows = await dataView.allRows();
    let objects : any = [];
    rows?.forEach(row => {
        objects.push({
            marked : row.isMarked(),
            mark : (d : any) => {
                let rowsToMark : DataViewRow[] = [];
                rows.forEach(row => {
                    if (row.categorical("Node").formattedValue() == d.value) {
                        rowsToMark.push(row);
                    }
                })
                if (d.marked) {
                    dataView.mark(rowsToMark, "Toggle")
                } else {
                    dataView.mark(rowsToMark, "Replace")
                }
            },
            markColumn : (toMark : number[]) => {
                let rowsToMark : DataViewRow[] = [];
                rows.forEach(row => {
                    if (toMark.includes(Number(row.categorical("Id").formattedValue()))) {
                        rowsToMark.push(row);
                    }
                })

                console.log("rowstoMark: ", rowsToMark)
                dataView.mark(rowsToMark, "Replace")
            },
            value : row.categorical("Node").formattedValue(),
            id : row.categorical("Id").formattedValue(),
            parentId : row.categorical("ParentId").formattedValue(),
            color : row.color().hexCode
        })
    })
    objects.sort((a : any, b : any) => (a.id - b.id))
    return objects

}

function renderSettingsButton(mod: Mod, showInfoBox: ModProperty<boolean>, showRootPath: ModProperty<boolean>) {
    let settingsButton = document.querySelector<HTMLElement>(".settings");
    settingsButton?.classList.toggle("visible", mod.getRenderContext().isEditing);
    let pos = settingsButton!.getBoundingClientRect();

    settingsButton!.onclick = () => {
        mod.controls.popout.show(
            {
                x: pos.left + pos.width / 2,
                y: pos.top + pos.height,
                autoClose: true,
                alignment: "Top",
                onChange(event) {
                    if (event.name == "showInfoBox") {
                        showInfoBox.set(event.value);
                    }
                    if (event.name == "showRootPath") {
                        showRootPath.set(event.value);
                    }
                }
            },
            () => [
                mod.controls.popout.section({
                    children: [
                        mod.controls.popout.components.checkbox({
                            enabled : true,
                            name : "showInfoBox",
                            checked: showInfoBox.value() || false,
                            text: "Show Info Box"
                        }),
                        mod.controls.popout.components.checkbox({
                            enabled: true,
                            name: "showRootPath",
                            checked: showRootPath.value() || false,
                            text: "Show root path"
                        })
                    ]
                })
            ]
        );
    };
}