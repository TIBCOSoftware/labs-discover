/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

const STARTED_FILTER_EXPRESSION = 'DateTime(DocumentProperty("startDateFilterString")) <= [case_start_timestamp] AND [case_start_timestamp] <= DateTime(DocumentProperty("endDateFilterString"))';
const OPEN_FILTER_EXPRESSION = 'DateTime(DocumentProperty("startDateFilterString")) <= [case_end_timestamp] AND [case_start_timestamp] <= DateTime(DocumentProperty("endDateFilterString"))';
const ENDED_FILTER_EXPRESSION = 'DateTime(DocumentProperty("startDateFilterString")) <= [case_end_timestamp] AND [case_end_timestamp] <= DateTime(DocumentProperty("endDateFilterString"))';

const START_TIMESTAMP_PROP = "startDateFilterString";
const END_TIMESTAMP_PROP = "endDateFilterString";
const FILTER_EXPR_PROPERTY = "FilterExpression";
const FILTER_TYPE_PROPERTY = "FilterOn";
const FILTER_COUNT_PROPERTY = "FilterCount";

export class FilterControls {
    private readonly mod: Spotfire.Mod;
    private readonly tooltip: Spotfire.Tooltip;
    private readonly popout: Spotfire.Popout;
    private tooltipContent: string = "";

    private filterOn  = "Cases";  // "Cases" | "Events"
    private selectedTimeMethod  = "Started"; // : "Started" | "Open" | "Ended"
    private filterCount = 0;

    private filterExpression: string[] = [];
    private timeFilterIndex = 0;

    private markedRows: Spotfire.DataViewRow[] = [];
    private filteredRows: Spotfire.DataViewRow[] = [];

    private startTS: string | null = null;
    private endTS: string | null = null;

    constructor(mod: Spotfire.Mod) {
        this.mod = mod;
        this.tooltip = mod.controls.tooltip;
        this.popout = mod.controls.popout;

        this.initFilterExpression();
        this.initFilterIcon();
        this.initTimeDropdown();
        this.initTimeInputFields();
        this.initFilterButtons();
    }

    private async initFilterButtons(){
        let filterOn = (await this.mod.document.property<string>(FILTER_TYPE_PROPERTY)).value();
        this.filterOn = filterOn ? filterOn : "Cases";

        if(this.filterOn !== "Cases"){
            let eventToggle = <HTMLInputElement>document.getElementById("filter-on-events");
            eventToggle.click();
        }

        let filterToggles = <NodeListOf<HTMLInputElement>>document.querySelectorAll("#action-buttons>.pl-text-toggle>input");
        filterToggles.forEach((toggle) => {
            toggle.onchange = (e) => {
                let label =  (<HTMLElement>e.target).nextElementSibling;
                if(label && label.textContent){
                    this.filterOn = label.textContent;
                    this.mod.document.property(FILTER_TYPE_PROPERTY).set(this.filterOn);
                }
            };
        });
        let filterBtn = <HTMLElement>document.getElementById("apply-filter-btn");
        if(filterBtn){
            filterBtn.onclick = () => {
                this.applyFilter();
            };
        }

        let resetBtn = <HTMLElement>document.getElementById("reset-filter-btn");
        if(resetBtn){
            resetBtn.onclick = () => {
                this.resetFilter();
            };
        }
    }

    private initTimeInputFields(){
        // TODO : add checks on user input 
        let startTS = <HTMLInputElement>document.getElementById("start-timestamp");
        if(startTS){
            startTS.onchange = () => {
                this.mod.document.property(START_TIMESTAMP_PROP).set(startTS.value);
            }; 
        }

        let stopTS = <HTMLInputElement>document.getElementById("end-timestamp");
        if(stopTS){
            stopTS.onchange = () => {
                this.mod.document.property(END_TIMESTAMP_PROP).set(stopTS.value);
            }; 
        }
    }
    private async initFilterExpression(){
        let filterExprProp = await this.mod.document.property<string>(FILTER_EXPR_PROPERTY);
        let filterExpr = filterExprProp.value();
        if(!filterExpr || filterExpr.length === 0){
            return;
        }

        // Check if there's a filter on case start / end
        let timeFilter = filterExpr.match(/DateTime\(DocumentProperty\(\"startDateFilterString\"\)\)(.*)DateTime\(DocumentProperty\("endDateFilterString"\)\)/m);
        if(timeFilter) {
            let parts = timeFilter[1].split(" AND "); // TODO : add support for OR operator
            if(parts[0].includes("start")){
                // Started
                this.selectedTimeMethod = "Started";
            }else{
                if(parts[1].includes("start")){
                    // Open
                    this.selectedTimeMethod = "Open";
                }else{
                    // Ended
                    this.selectedTimeMethod = "Ended";
                }
            }
            // Update dropdown value
            const dpdwnBtn = <HTMLElement>document.querySelector('#dropdown-button button span');
            if(dpdwnBtn){
                dpdwnBtn.textContent = this.selectedTimeMethod;
            }

            // Read filters that are before the time filter in the expression
            let regexIndex = timeFilter.index ? timeFilter.index : 0;
            let filters = filterExpr.substring(0, regexIndex).split(" AND ");
            for(let i = 0, len = filters.length; i < len; i++){
                if(filters[i].length > 0){ 
                    this.filterExpression.push(filters[i]);
                }
            }
            
            // Then push time filter
            this.timeFilterIndex = this.filterExpression.length;
            this.filterExpression.push(timeFilter[0]);
            // Then read filters that are after
            if((regexIndex + timeFilter[1].length) < filterExpr.length){
                filters = filterExpr.substring(regexIndex + timeFilter[0].length).split(" AND ");
                for(let i = 0, len = filters.length; i < len; i++){
                    if(filters[i].length > 0){ 
                        this.filterExpression.push(filters[i]);
                    }
                }
            }
        } else {
            // Parse the filter expression
            // TODO : support OR operator? 
            let filters = filterExpr.split(" AND ");
            this.filterExpression.push(...filters);
            this.filterExpression.push(STARTED_FILTER_EXPRESSION);
            this.timeFilterIndex = this.filterExpression.length;

            this.mod.document.property(FILTER_EXPR_PROPERTY).set(this.getFilterExpression());
        }
    }

    private async initFilterIcon() {
        // let filterIcon = <HTMLElement>document.querySelector("#filter-icon button");
        // if (filterIcon != null) {
        //     filterIcon.addEventListener("mouseover", () => {
        //         this.tooltip.show(this.tooltipContent);
        //     });

        //     filterIcon.addEventListener("mouseleave", () => {
        //         this.tooltip.hide();
        //     });

            // filterIcon.addEventListener("click", (e) => {
            //     this.showPopout(e.clientX, e.clientY);
            // });
        // }
        let nbFilters = (await this.mod.document.property<number>(FILTER_COUNT_PROPERTY)).value();
        if(nbFilters){
            this.filterCount = nbFilters;
            this.updateFilterBadge();
        }
    }

    private updateFilterBadge(){
        let badge = <HTMLElement>document.getElementById("nb-filters");
        if (badge) {
            if(this.filterCount > 0){
                badge.innerText = "" + this.filterCount;
                badge.classList.remove("is-hidden");
            } else {
                badge.innerText = "";
                badge.classList.add("is-hidden");
            }
        }
    }

    private initTimeDropdown() {
        const dpdwnEl = <HTMLElement>document.querySelector('#dropdown-button');
        if (!dpdwnEl) {
            console.warn('Could not initialize Time controls.');
            return;
        }

        const buttonTxt = <HTMLElement>dpdwnEl.querySelector("button span");
        if(buttonTxt){
            buttonTxt.textContent = this.selectedTimeMethod;
        }

        const { radioButton } = this.popout.components;
        const section = this.popout.section;

        const popoutContent = () => {
            let content: Spotfire.PopoutSection[] = [];
            content.push(section({
                heading: "Time filters",
                children: [
                    radioButton({
                        name: "Started",
                        value: "Started",
                        text: "Started",
                        checked: "Started" === this.selectedTimeMethod
                    }),
                    radioButton({
                        name: "Open",
                        value: "Open",
                        text: "Open",
                        checked: "Open" === this.selectedTimeMethod
                    }),
                    radioButton({
                        name: "Ended",
                        value: "Ended",
                        text: "Ended",
                        checked: "Ended" === this.selectedTimeMethod
                    })
                ]
            }));
            return content;
        };

        dpdwnEl.addEventListener('click', () => {
            let pos = dpdwnEl.getBoundingClientRect();

            this.popout.show(
                {
                    x: pos.left,
                    y: pos.top,
                    autoClose: true,
                    alignment: "Bottom",
                    onChange: (e) => {
                        //TODO:
                        if(buttonTxt){
                            buttonTxt.textContent = e.name;
                        }
                        this.selectedTimeMethod = e.name;

                        let isValidMethod = false;
                        let filterExpression = '';
                        switch (e.name) {
                            case 'Started':
                                filterExpression = STARTED_FILTER_EXPRESSION;
                                break;
                            case 'Open':
                                filterExpression = OPEN_FILTER_EXPRESSION;
                                break;
                            case 'Ended':
                                filterExpression = ENDED_FILTER_EXPRESSION;
                                break;
                        }

                        if (filterExpression.length > 0) {
                            this.updateFilterExpression(filterExpression, true);
                        }
                    }
                },
                popoutContent
            );
        });
    }

    private initTimeDropdown_old() {
        const dpdwnEl = <HTMLElement>document.querySelector('#time-select [data-pl-dropdown-role="dropdown"]');
        if (!dpdwnEl) {
            console.warn('Could not initialize Time controls.');
            return;
        }

        //TODO
        /** @ts-ignore */
        const dropdown = new Uxpl.Dropdown(
            dpdwnEl
        );

        const button = <HTMLElement>dpdwnEl.querySelector("button span");
        if (!button) {
            return;
        }

        let firstChild = <HTMLElement>dpdwnEl.querySelector("li");
        if (!firstChild) {
            return;
        }

        button.textContent = firstChild.textContent;

        let items = <NodeListOf<HTMLElement>>dpdwnEl.querySelectorAll("li button");
        for (let i = 0; i < items.length; i++) {
            items[i].addEventListener("click", (evt) => {
                const typeButton = evt.target as HTMLElement;
                let filterType = typeButton.textContent;
                if (!filterType) {
                    //TODO:
                    return;
                }

                filterType = filterType.trim();

                button.textContent = filterType;

                let filterExpression = '';
                switch (filterType) {
                    case 'Started':
                        filterExpression = STARTED_FILTER_EXPRESSION;
                        break;
                    case 'Open':
                        filterExpression = OPEN_FILTER_EXPRESSION;
                        break;
                    case 'Ended':
                        filterExpression = ENDED_FILTER_EXPRESSION;
                        break;
                }

                if (filterExpression.length > 0) {
                    this.updateFilterExpression(filterExpression, true);
                }

            });
        }
    }

    private getFilterExpression(){
        return this.filterExpression.join(" AND ");
    }

    public setStartTimestamp(startTS: string) {
        this.startTS = startTS;
        this.updateTSfield(startTS, "#start-timestamp");
    }

    public setEndTimestamp(endTS: string) { 
        this.endTS = endTS;
        this.updateTSfield(endTS, "#end-timestamp");
    }

    private updateTSfield(value: string, selector: string) {
        let inputField = <HTMLInputElement>document.querySelector(selector);
        inputField.value = value;
    }

    private async updateFilterExpression(filter: string, isTimeFilter: boolean = false) {
        if(isTimeFilter){
            this.filterExpression[this.timeFilterIndex] = filter;
        }else{
            this.filterExpression.push(filter);
        }

        let filterExpression = this.getFilterExpression();
        this.mod.document.property(FILTER_EXPR_PROPERTY).set(filterExpression);
    }

    private async showPopout(x: number, y: number) {
        let columns = await this.mod.visualization.mainTable().columns();

        const { checkbox } = this.popout.components;
        const section = this.popout.section;

        const popoutContent = () => {
            let content: Spotfire.PopoutSection[] = [];

            /** Label content */
            content.push(section({
                heading: "Time filters",
                children: [checkbox({
                    name: "Time filters",
                    text: "Enable",
                    checked: true, //TODO 
                    enabled: true
                })]
            }));

            content.push(section({
                heading: "Columns",
                children: columns.map(column => {
                    return checkbox({
                        name: column.name,
                        text: column.name,
                        checked: true, //TODO
                        enabled: true
                    });
                })
            }));
            return content;
        };

        this.popout.show(
            {
                x: x,
                y: y,
                autoClose: false,
                alignment: "Bottom",
                onChange: (e) => {
                    //TODO:
                    console.log(e.name + ": " + e.value);
                }
            },
            popoutContent
        );
    }

    private hideTimeSelectDiv() {
        let containerDiv = <HTMLElement>document.querySelector("#time-select");
        containerDiv.classList.add("is-hidden");
    }

    public setTooltip(content: string) {
        this.tooltipContent = content;
    }

    public setFilteredRows(rows : Spotfire.DataViewRow[]){
        //console.log("filtered rows : "+rows[0].continuous("Marking Axis").value());
        this.filteredRows = rows;
    }

    private async applyFilter(){
        // Persist current StartTS and EndTS
        let modConfigJson = await this.mod.property<string>("config");
        let modConfig = JSON.parse(modConfigJson.value()!);
        if(!modConfig.initStartTS && !modConfig.initEndTS){ // if a filter has already been applied, we don't overwrite dates
            modConfig.initStartTS = this.startTS;
            modConfig.initEndTS = this.endTS;
            this.mod.property<string>("config").set(JSON.stringify(modConfig));
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
            dataView.mark(this.filteredRows, "Add"); // should trigger TERR script
            this.markedRows = this.filteredRows;
            this.filterCount++;
            this.mod.document.property(FILTER_COUNT_PROPERTY).set(this.filterCount);
            this.updateFilterBadge();
        });

    }

    private async resetFilter(){
        
        //this.markedRows = [];
        let dataView = await this.mod.visualization.data();
        let modConfigJson = await this.mod.property<string>("config");

        this.mod.transaction(() => {

            let modConfig = JSON.parse(modConfigJson.value()!);
            if(modConfig.initStartTS && modConfig.initEndTS){ 
                // Reset start and stop timestamps
                this.mod.document.property(START_TIMESTAMP_PROP).set(modConfig.initStartTS);
                this.mod.document.property(END_TIMESTAMP_PROP).set(modConfig.initEndTS);
                
                // Reset config
                modConfig.initStartTS =  undefined;
                modConfig.initEndTS =  undefined;
                this.mod.property<string>("config").set(JSON.stringify(modConfig));
            }
            
            dataView.clearMarking();
            this.markedRows = [];
            this.filterCount = 0;
            this.updateFilterBadge();
            this.mod.document.property(FILTER_COUNT_PROPERTY).set(0);
        });
    }
}