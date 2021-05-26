/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Component, Prop, h, Host, Listen, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
    tag: 'kpi-chart',
    styleUrl: 'kpi-chart.css',
    shadow: false
})
export class KpiChart {

    /**
     * TODO : 
     */
    @Prop() data: string; // {name: string, value: string, icon: string}[];
    @State() cards: Array<{ name: string, value: string, icon: string }> = [];
    //@Element() private element: HTMLElement;

    componentWillLoad() {
        this.parseData(this.data);
    }


    @Watch('data')
    parseData(newValue: string | object) {
        //console.log("new value : " + newValue);
        if (newValue) {
            this.cards = Array.isArray(newValue) ? newValue : JSON.parse(newValue.toString());
        }
        //console.log("cards : " + this.cards);
    }

    @Event() configSaved: EventEmitter<{mapping: Array<{name: string, icon: string}>}>;

    @Listen('configSaved')
    configSavedHandler(event: CustomEvent<{mapping: Array<{name: string, icon: string}>}>) {
      console.log('Received the custom configSaved event: ', event.detail);
      //event.stopPropagation();
    }

    private showConfigModal() {
        let modal = document.querySelector("kpi-config");
        modal.open = true;
    }

    render() {
        return (
            <Host>
                <div>
                <button class="btn" onClick={() => this.showConfigModal()}><i class="fa fa-cog"></i></button>
                <div class="card-container">
                    {this.cards.map((card) =>
                        <kpi-card name={card.name} value={card.value} icon={card.icon}></kpi-card>
                    )}
                </div>

                <kpi-config cards={this.cards}></kpi-config>
                </div>

            </Host>

        );

    }
}