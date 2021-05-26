/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async mod => {
    /**
     * Create the read function
     */
    const reader = mod.createReader(
      mod.visualization.data(),
      mod.windowSize()
  );

  reader.subscribe(render);

    /**
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     */
    // @ts-ignore
    async function render(dataView, windowSize) {

        /**
         * Get rows from dataView
         */
        const rows = await dataView.allRows();
        let data = rows.map(row => {
            let x = row.categorical("X");
            // @ts-ignore
            let date = Date.parse(x.value().reduce((acc,value) => {
                let sep = acc.length > 0 ? "-" : "";
                return(acc + sep + value.key);
            }, ""));
            return ([date, row.continuous("Y").value()]);
        });

        renderChart(data, windowSize);
    }

    // @ts-ignore
    function renderChart(data, windowSize) {
        // @ts-ignore
        var chart = Highcharts.stockChart('mod-container', {

            chart: {
              height: windowSize.height,
              width: windowSize.width
            },
        
            title: {
              text: 'Open Cases'
            },

            rangeSelector: {
              selected: 5
            },
        
            series: [{
              name: 'Open Cases',
              data: data,
              type: 'area',
              threshold: null,
              tooltip: {
                valueDecimals: 2
              },
              dataGrouping: {
                approximation: 'sum'
              }
            }],
            xAxis: {
                events: {
                    setExtremes: function (e) {
                        console.log("From : "+e.min+ ", to : "+e.max);
                        mod.document.property("startDateFilter").set(e.min);
                        mod.document.property("endDateFilter").set(e.min);
                    }
                }
            }
          });
    }

    
});
