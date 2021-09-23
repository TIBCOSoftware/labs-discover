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

    private startTS: string | undefined;
    private endTS: string | undefined;

    private config: { initStartTS: string | null, initEndTS: string | null, enableTimeFilters : boolean} = {initStartTS : null, initEndTS : null, enableTimeFilters : true};

    constructor(mod: Spotfire.Mod, config: string) {
        this.mod = mod;
        // initialize config
        Object.assign(this.config, JSON.parse(config)); 
        
        this.tooltip = mod.controls.tooltip;
        this.popout = mod.controls.popout;

        this.initTimeFilters();
        this.initFilterIcon();
        this.initFilterButtons();
    }

    private async initTimeFilters(){
        await this.readFilterExpression();
        if(this.config.enableTimeFilters){
            this.enableTimeFilters();
        } else {
            this.disableTimeFilters();
        }
    }

    private enableTimeFilters(){
        this.initFilterExpression();
        this.initTimeDropdown();
        this.initTimeInputFields();
        this.showTimeControls();
    }

    private disableTimeFilters(){
        this.hideTimeControls();

        // Remove event listeners
        let containerDiv = <HTMLElement>document.querySelector("#time-select");
        containerDiv.outerHTML = containerDiv.outerHTML;

        this.resetFilterExpression();

    }

    private showTimeControls() {
        let containerDiv = <HTMLElement>document.querySelector("#time-select");
        containerDiv.classList.remove("is-hidden");
    }

    private hideTimeControls() {
        let containerDiv = <HTMLElement>document.querySelector("#time-select");
        containerDiv.classList.add("is-hidden");
    }

    private async initFilterButtons(){

        // Initialize Cases / Events toggle
        let filterOnDocProp = await this.mod.document.property<string>(FILTER_TYPE_PROPERTY).catch(() => undefined);
        this.filterOn = filterOnDocProp && filterOnDocProp.value() ? filterOnDocProp.value()! : "Cases";

        if(this.filterOn !== "Cases"){
            let eventToggle = <HTMLInputElement>document.getElementById("filter-on-events");
            eventToggle.click();
        }

        let filterToggles = <NodeListOf<HTMLInputElement>>document.querySelectorAll("#filter-toggle>.pl-text-toggle>input");
        filterToggles.forEach((toggle) => {
            toggle.onchange = (e) => {
                let label =  (<HTMLElement>e.target).nextElementSibling;
                if(label && label.textContent){
                    this.filterOn = label.textContent;
                    if(filterOnDocProp){
                        filterOnDocProp.set(this.filterOn);
                    }   
                }
            };
        });

        // Initialize buttons
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
            startTS.onchange = async () => {
                let startTsDocProp = await this.mod.document.property<string>(START_TIMESTAMP_PROP).catch(() => undefined);
                if(startTsDocProp){
                    startTsDocProp.set(startTS.value);
                }
            }; 
        }

        let stopTS = <HTMLInputElement>document.getElementById("end-timestamp");
        if(stopTS){
            stopTS.onchange = async () => {
                let stopTsDocProp = await this.mod.document.property<string>(END_TIMESTAMP_PROP).catch(() => undefined);
                if(stopTsDocProp){
                    stopTsDocProp.set(stopTS.value);
                }
            }; 
        }
    }

    private async readFilterExpression(){
        this.filterExpression = [];
        this.timeFilterIndex = 0;

        let filterExprProp = await this.mod.document.property<string>(FILTER_EXPR_PROPERTY).catch(() => undefined);
        if(filterExprProp){
            // Parse filter expression
            let filterExpr = filterExprProp.value();
            if(filterExpr){
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
                    let firstPart = filterExpr.substring(0, regexIndex).trim();
                    if(firstPart.length > 0 && firstPart !== 'True AND'){
                        this.filterExpression.push(firstPart);
                    }
                    
                    // Then push time filter
                    this.timeFilterIndex = this.filterExpression.length;
                    this.filterExpression.push(timeFilter[0]);

                    // Then read filters that are after
                    if((regexIndex + timeFilter[1].length) < filterExpr.length){
                        this.filterExpression.push(filterExpr.substring(regexIndex + timeFilter[0].length));
                    }
                } else {
                    // No time filter, but expression is not empty
                    if(filterExpr.trim() !== "True"){ // equals an empty string
                        this.filterExpression.push(filterExpr);
                        this.timeFilterIndex = this.filterExpression.length;
                        this.filterExpression.push(STARTED_FILTER_EXPRESSION);
                    }
                }
            }
        }
    }

    private async initFilterExpression(){
        switch (this.selectedTimeMethod) {
            case 'Started':
                this.filterExpression[this.timeFilterIndex] = STARTED_FILTER_EXPRESSION;
                break;
            case 'Open':
                this.filterExpression[this.timeFilterIndex] = OPEN_FILTER_EXPRESSION;
                break;
            case 'Ended':
                this.filterExpression[this.timeFilterIndex] = ENDED_FILTER_EXPRESSION;
                break;
        }
        await this.persistFilterExpression();
    }

    private async resetFilterExpression(){
        this.filterExpression[this.timeFilterIndex] = "True";
        await this.persistFilterExpression();
    }

    private async initFilterIcon() {
        let filterIcon = <HTMLElement>document.querySelector("#filter-icon button");
        if (filterIcon != null) {
        //     filterIcon.addEventListener("mouseover", () => {
        //         this.tooltip.show(this.tooltipContent);
        //     });

        //     filterIcon.addEventListener("mouseleave", () => {
        //         this.tooltip.hide();
        //     });

            filterIcon.addEventListener("click", (e) => {
                this.showPopout(e.clientX, e.clientY);
            });

        }
        let nbFilters =  await this.mod.document.property<number>(FILTER_COUNT_PROPERTY).catch(() => undefined);
        if(nbFilters && nbFilters.value()){
            this.filterCount = nbFilters.value()!;
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

                        this.filterExpression[this.timeFilterIndex] = filterExpression;
                        this.persistFilterExpression();
                    }
                },
                popoutContent
            );
        });
    }

    private getFilterExpression() {
        if(this.filterExpression.length === 0){
            return "";
        }
        return this.filterExpression.join(" ").trim();
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

    private async persistFilterExpression() {
        let filterExpressionDocProp = await this.mod.document.property<string>(FILTER_EXPR_PROPERTY).catch(() => undefined);
        if(filterExpressionDocProp){
            filterExpressionDocProp.set(this.getFilterExpression());
        }
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
                    checked: this.config.enableTimeFilters, //TODO 
                    enabled: true
                })]
            }));

            // content.push(section({
            //     heading: "Columns",
            //     children: columns.map(column => {
            //         return checkbox({
            //             name: column.name,
            //             text: column.name,
            //             checked: true, //TODO
            //             enabled: true
            //         });
            //     })
            // }));
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
                    //console.log(e.name + ": " + e.value);
                    if("Time filters" === e.name){
                        this.config.enableTimeFilters = e.value;
                        this.persistConfig();
                        
                        if(this.config.enableTimeFilters){
                            this.enableTimeFilters();
                        } else {
                            this.disableTimeFilters();
                        }
                    }
                }
            },
            popoutContent
        );
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
        if(!this.config.initStartTS && !this.config.initEndTS){ // if a filter has already been applied, we don't overwrite dates
            this.config.initStartTS = this.startTS!;
            this.config.initEndTS = this.endTS!;
            this.persistConfig();
        }

        let dataView = await this.mod.visualization.data();
        // Removes previous selection
        if(this.markedRows.length > 0){
            this.mod.transaction(() => {
                dataView.mark(this.markedRows, "Subtract");
            });
        }

        // Add new one
        let filterCountDocProp = await this.mod.document.property<number>(FILTER_COUNT_PROPERTY).catch(() => undefined);
        this.mod.transaction( () => {
            dataView.mark(this.filteredRows, "Add"); // should trigger TERR script
            this.markedRows = this.filteredRows;
            this.filterCount++;
            
            if(filterCountDocProp){
                filterCountDocProp.set(this.filterCount);
            }
            this.updateFilterBadge();
        });

    }

    private async resetFilter(){
        
        //this.markedRows = [];
        let dataView = await this.mod.visualization.data();

        let startTsDocProp = await this.mod.document.property<string>(START_TIMESTAMP_PROP).catch(() => undefined);
        let stopTsDocProp = await this.mod.document.property<string>(END_TIMESTAMP_PROP).catch(() => undefined);
        let filterCountDocProp = await this.mod.document.property<number>(FILTER_COUNT_PROPERTY).catch(() => undefined);

        this.mod.transaction(() => {

            if(this.config.initStartTS && this.config.initEndTS){ 
                // Reset start and stop timestamps
                
                if(startTsDocProp){
                    startTsDocProp.set(this.config.initStartTS);
                }
                
                if(stopTsDocProp){
                    stopTsDocProp.set(this.config.initEndTS);
                }
                
                // Reset config
                this.config.initStartTS =  null;
                this.config.initEndTS =  null;
                this.persistConfig();
            }
            
            dataView.clearMarking();
            this.markedRows = [];
            this.filterCount = 0;
            this.updateFilterBadge();
        
            if(filterCountDocProp){
                filterCountDocProp.set(0);
            }
        });
    }

    private persistConfig(){
        this.mod.property<string>("config").set(JSON.stringify(this.config));
    }
}