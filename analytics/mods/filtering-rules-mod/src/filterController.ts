//import Vue from 'vue';
//import * as VueQueryBuilder from 'vue-query-builder';

import { DataViewRow } from "spotfire-api";

interface DatasetInfo {
    values: string[],
    rows: Spotfire.DataViewRow[]
}

export type DatasetRecords = Record<string, DatasetInfo>

export class FilterController {
    private readonly mod: Spotfire.Mod;

    private records: DatasetRecords = {};
    private markedRows: Spotfire.DataViewRow[] = [];
    private vueApp;

    constructor(mod: Spotfire.Mod) {
        this.mod = mod;
       
        // @ts-ignore
        this.vueApp = new Vue({
            el: '#query-builder',
            data: {
                rules: [],
                maxDepth : 0,
                labels: {
                    "matchType": "Match Type",
                    "matchTypes": [
                        { "id": "and", "label": "AND" },
                        { "id": "or", "label": "OR" }
                    ],
                    "addRule": "Add Rule",
                    "removeRule": "&times;",
                    "addGroup": "Add Group",
                    "removeGroup": "&times;",
                    "textInputPlaceholder": "value",
                },
                query: {}

            },
            // @ts-ignore
            components: { VueQueryBuilder: window.VueQueryBuilder }
        });

        let filterBtn = document.getElementById("apply-filter-btn")!;
        filterBtn.onclick = () => {
            this.applyFilter();
        };
    }

    public updateRecords(records: DatasetRecords) {
        this.records = records;
        let rules = [];
        for (const property in records) {
            let rule = {
                type: "checkbox",
                id: property,
                label: property + " (" + records[property].values[0] + ")"
            };

            // @ts-ignore
            rules.push(rule);
        }

        this.vueApp.rules = rules;
    }

    private async applyFilter(){

        let query = this.vueApp.$children[0].query;
        let op = query.logicalOperator;
        let children = query.children;

        let rowsToMark : DataViewRow[] = [];
        for(let i = 0, len = children.length; i < len; i++){
            let subsetName : string = children[i].query.rule;
            Array.prototype.push.apply(rowsToMark, this.records[subsetName].rows);
        }

        let dataView = await this.mod.visualization.data();
        
        // Removes previous selection
        if(this.markedRows.length > 0){
            this.mod.transaction(() => {
                dataView.mark(this.markedRows, "Subtract");
            });
        }

        // Add new one
        this.mod.transaction(() => {
            dataView.mark(rowsToMark, op === "and" ? "Intersect" : "Add"); // TODO : check that intesect works
            this.markedRows = rowsToMark;
        });
    }

    private async resetFilter() {
        //this.markedRows = [];
        let dataView = await this.mod.visualization.data();

        this.mod.transaction(() => {
            dataView.clearMarking();
            this.markedRows = [];
        });
    }
}