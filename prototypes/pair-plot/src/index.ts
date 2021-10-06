import { Axis, DataView, Mod, ModProperty } from "spotfire-api";
import { render, PairPlotData } from "./pair-plot";
import { resources } from "./resources";

const measureNamesAxisName = "MeasureNames";
const countAxisName = "Count";
const diagonalPropertyName = "Diagonal";
const colorAxisName = "Color";
const measureAxisName = "Measures";

export type Diagonal = "measure-names" | "histogram" | "distribution" | "statistics" | "box-plot";

export function createTimerLog() {
    let times = [{ desc: "start", t: Date.now() }];
    return {
        add: (desc: string) => times.push({ desc, t: Date.now() }),
        log: () => {
            times.forEach((_, i) => {
                if (i > 0) {
                    console.log(times[i].desc, times[i].t - times[i - 1].t, "ms");
                }
            });

            console.log("Total", times[times.length - 1].t - times[0].t, "ms");
        }
    };
}

window.Spotfire.initialize(async (mod) => {
    const context = mod.getRenderContext();

    document.querySelector("#resetMandatoryExpressions button")!.addEventListener("click", () => {
        document.querySelector("#resetMandatoryExpressions")!.classList.toggle("hidden", true);
        mod.visualization.axis(measureNamesAxisName).setExpression("<[Axis.Default.Names]>");
        mod.visualization.axis(countAxisName).setExpression("Count()");
    });

    const reader = mod.createReader(
        mod.visualization.data(),
        mod.property(diagonalPropertyName),
        mod.visualization.axis(measureAxisName),
        mod.visualization.axis(measureNamesAxisName),
        mod.visualization.axis(countAxisName),
        mod.visualization.axis(colorAxisName),
        mod.windowSize()
    );

    reader.subscribe(onChange);

    async function onChange(
        dataView: DataView,
        diagonalProperty: ModProperty<Diagonal>,
        measureAxis: Axis,
        measureNamesAxis: Axis,
        countAxis: Axis,
        colorAxis: Axis
    ) {
        let timerLog = createTimerLog();
        if (measureAxis.parts.length < 2) {
            mod.controls.errorOverlay.show("Select two or more measures.", "Measures");
            return;
        }

        mod.controls.errorOverlay.hide("Measures");

        if (colorAxis.isCategorical && colorAxis.parts.find((p) => p.expression.includes("[Axis.Default.Names]"))) {
            mod.controls.errorOverlay.show(
                "'(Column Names)' is invalid as color expression since this will yield multi colored markers.",
                "color"
            );
            return;
        }

        mod.controls.errorOverlay.hide("color");

        const showConfigError =
            (measureAxis.parts.length > 1 && measureNamesAxis.expression != "<[Axis.Default.Names]>") ||
            (diagonalProperty.value() != "measure-names" && countAxis.expression != "Count()");
        document.getElementById("resetMandatoryExpressions")!.classList.toggle("hidden", !showConfigError);
        document.getElementById("correlogram")!.classList.toggle("hidden", showConfigError);

        if (showConfigError) {
            return;
        }

        const measures = (await (await dataView.hierarchy(measureNamesAxisName))!.root())?.leaves();
        const columnNamesLeafIndices = measures?.map((l) => l.leafIndex) || [];
        const rows = await dataView.allRows();
        if (!measures || rows == null) {
            return;
        }

        timerLog.add(`Read all data (${rows.length} rows).`);

        var measureCount = columnNamesLeafIndices.length;
        var markerCount = rows!.length / measureCount;

        const colors = rows!.slice(0, markerCount).map((r) => r.color().hexCode);
        const tooltips = rows!.slice(0, markerCount).map((r) => (() => mod.controls.tooltip.show(r)));
        timerLog.add("Read colors");
        const count = null;
        countAxis.expression
            ? rows!.slice(0, markerCount).map((r) => r.continuous(countAxisName).value() as number)
            : null;
        const points = transpose<number>(
            createChunks(
                rows!.map((r) => r.continuous(measureAxisName).value()),
                markerCount
            )
        );

        var data: PairPlotData = {
            measures: measures!.map((m) => m.formattedValue()),
            points,
            colors,
            count,
            mark: (index: number) => rows![index].mark(),
            tooltips
        };
        timerLog.add("Transpose");

        render(data, diagonalProperty.value() || "measure-names");
        timerLog.add("Render");
        // timerLog.log();

        renderSettingsButton(mod, diagonalProperty);

        context.signalRenderComplete();
    }

    function transpose<T>(m: T[][]) {
        return m[0].map((_, i) => m.map((x) => x[i]));
    }

    function createChunks(arr: any[], chunkSize: number) {
        var results = [];
        while (arr.length) {
            results.push(arr.splice(0, chunkSize));
        }

        return results;
    }

    function renderSettingsButton(mod: Mod, diagonal: ModProperty<Diagonal>) {
        let settingsButton = document.querySelector<HTMLElement>(".settings");
        settingsButton?.classList.toggle("visible", mod.getRenderContext().isEditing);
        let pos = settingsButton!.getBoundingClientRect();

        function createDiagonalButton(value: Diagonal, text: string) {
            return {
                enabled: true,
                name: "diagonal",
                value,
                checked: diagonal.value() == value,
                text
            };
        }
        settingsButton!.onclick = () => {
            mod.controls.popout.show(
                {
                    x: pos.left + pos.width / 2,
                    y: pos.top + pos.height,
                    autoClose: true,
                    alignment: "Top",
                    onChange(event) {
                        if (event.name == "diagonal") {
                            diagonal.set(event.value);
                        }
                    }
                },
                () => [
                    mod.controls.popout.section({
                        heading: resources.diagonal,
                        children: [
                            mod.controls.popout.components.radioButton(
                                createDiagonalButton("measure-names", resources.diagonal_measures)
                            ),
                            mod.controls.popout.components.radioButton(
                                createDiagonalButton("statistics", resources.diagonal_stat)
                            ),
                            mod.controls.popout.components.radioButton(
                                createDiagonalButton("histogram", resources.diagonal_histogram)
                            ),
                            mod.controls.popout.components.radioButton(
                                createDiagonalButton("distribution", resources.diagonal_distribution)
                            ),
                            mod.controls.popout.components.radioButton(
                                createDiagonalButton("box-plot", resources.diagonal_box_plot)
                            )
                        ]
                    })
                ]
            );
        };
    }
});
