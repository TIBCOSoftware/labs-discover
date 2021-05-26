/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Component, Prop, h, Host } from '@stencil/core';

@Component({
  tag: 'kpi-card',
  styleUrl: 'kpi-card.css',
  assetsDirs: ['assets'],
  shadow: false
})
export class KpiCard {
  /**
   * The first name
   */
  @Prop() name: string;

  /**
   * The value
   */
  @Prop() value: string;

  /**
   * The icon
   */
  @Prop() icon: string;

  // private getText(): string {
  //   return format(this.first, this.middle, this.last);
  // }

  // private getIcon(): string {
  //   return "fas " + this.icon;
  // }

  render() {
    return (
      <Host>
        <div>
          <div class="card-title">{this.name}</div>
          <div class="card-value">{this.value}</div>
        </div>
        <div class ="card-icon">
          <i class={this.icon}></i>
        </div>
      </Host>
    );
    //return <div>Hello, World! I'm {this.getText()}</div>;
  }
}
