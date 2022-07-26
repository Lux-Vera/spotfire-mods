import { Data, render } from "./render";
import { buildNodes} from "./series";
import { DataView, Mod } from "spotfire-api";
// var events = require("events");

const Spotfire = window.Spotfire;
const DEBUG = true;

 export interface RawData {
    value: string,
    children?: RawData[]
 }

 var tempData : RawData = {
    value: "Analyse",
    children: [
        {
            value: "Biker data",
            children: [
                { value: "Date" },
                { value: "Rented bikes" },
                { value: "Bikes out" }
            ]
        },
        {
            value: "Weather data",
            children: [ 
                { value: "Date"},
                { value: "Temperature"},
                { value: "Amount of rain"},
                { value: "Wind strenght"}
            ]
        },
        {
            value: "Users",
            children: [
                { value: "Name" },
                { value: "Rentals",
                children: [
                    {value: "Date"},
                    {value: "Bike id"}
                ]},
                { value: "Age" }
            ]
        }
    ]
 };

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
        // Add properties ...
        // curveType: ModProperty<string>,
    ) {
        let data = await buildData(mod, dataView);

        await render(
            state,
            data,
            windowSize,
            {
                font: context.styling.general.font,
            },
            mod.controls.tooltip
        );

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
async function buildData(mod: Mod, dataView: DataView): Promise<Data> {

    // const dataTable = (await mod.visualization.mainTable());
    // const columns =  await dataTable.columns(); // Gets the data column names!
    const fontSize = mod.getRenderContext().styling.general.font.fontSize;
    const data = tempData;

    return {
        clearMarking: dataView.clearMarking,
        //nodes: buildNodeSeries(columns, fontSize)
        nodes: buildNodes(data, fontSize)
    };
}