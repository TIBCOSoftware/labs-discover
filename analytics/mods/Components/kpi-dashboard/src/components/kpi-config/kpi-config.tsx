/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Component, ComponentInterface, Prop, h, Element, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'kpi-config',
  styleUrl: 'kpi-config.css',
  shadow: true
})
export class KpiConfig implements ComponentInterface {
  @Prop({ mutable: true }) open = false;
  @Prop() transparent = false;
  @Prop({ mutable: true }) cards: Array<{ name: string, value: string, icon: string }>;
  @Element() private element: HTMLElement;
  @Event() configSaved: EventEmitter<{ mapping: Array<{ name: string, icon: string }> }>;

  private saveConfig() {
    if (this.open) {
      this.open = false;
    }

    let iconPickers = this.element.shadowRoot.querySelectorAll("fas-icon-picker");
    let config: { mapping: Array<{ name: string, icon: string }> } = { mapping: [] };
    iconPickers.forEach((picker) => {
      config.mapping.push({ name: picker.name, icon: picker.value });
    });
    this.configSaved.emit(config);
  }

  public render() {
    return (
      <div class={'overlay ' + (this.open ? 'is-visible' : '') + ' ' + (this.transparent ? 'is-transparent' : '')}>
        <div class="modal-window">
          <div class="modal-content">
            <div class="kpi-list">
              {this.cards.map((card) =>
                <div class="card">
                  <div>{card.name}</div>
                  <div>
                    <input type="color" />
                  </div>
                  <fas-icon-picker name={card.name} value={card.icon}></fas-icon-picker>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => this.saveConfig()}>OK</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
