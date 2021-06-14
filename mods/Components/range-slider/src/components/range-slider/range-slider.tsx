/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Component, ComponentInterface, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';

/**
 * Predefined constants
 * @type {Object}
 */
const constants = {
  orientation: {
    horizontal: {
      dimension: 'width',
      direction: 'left',
      reverseDirection: 'right',
      coordinate: 'x'
    },
    vertical: {
      dimension: 'height',
      direction: 'top',
      reverseDirection: 'bottom',
      coordinate: 'y'
    }
  }
}

@Component({
  tag: 'range-slider',
  styleUrl: 'range-slider.css',
  shadow: true,
})
export class RangeSlider implements ComponentInterface {
  @Prop({ mutable: true, reflect: true }) value: number;
  @Prop() min: number;
  @Prop() max: number;
  @Prop() step: number;
  @Prop() orientation: string = "horizontal";
  @Prop() showTooltip: boolean = true;
  @Event() sliderUpdate: EventEmitter<{value: number}>;



  @State() state = {
    active: false,
    limit: 0,
    grab: 0
  };

  private handleLabel = "";
  private reverse = false;
  private slider!: HTMLElement;
  private sliderHandle!: HTMLElement;
  /**
   * Capitalize first letter of string
   * @private
   * @param  {string} - String
   * @return {string} - String with first letter capitalized
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1)
  }

  /**
   * Clamp position between a range
   * @param  {number} - Value to be clamped
   * @param  {number} - Minimum value in range
   * @param  {number} - Maximum value in range
   * @return {number} - Clamped value
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  /**
   * Update slider state on change
   * @return {void}
   */
  handleUpdate() {
    const dimension = this.capitalize(constants.orientation[this.orientation].dimension);
    const sliderPos = this.slider[`offset${dimension}`];
    const handlePos = this.sliderHandle[`offset${dimension}`];

    this.state = {
      ...this.state,
      limit: sliderPos - handlePos,
      grab: handlePos / 2
    };
  };

  /**
   * Attach event listeners to mousemove/mouseup events
   * @return {void}
   */
  handleStart = (/*e: UIEvent*/) => {
    // console.log("start");
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleEnd);
    this.state = {
      ...this.state,
      active: true};
  };

  /**
   * Handle drag/mousemove event
   * @param this
   * @param  {Object} e - Event object
   * @return {void}
   */
  handleDrag = (e: UIEvent) => {
    // console.log("drag");
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const { className, classList, dataset } = target;
    if (className === 'rangeslider__labels') return;

    let value = this.position(e);

    if (
      classList &&
      classList.contains('rangeslider__label-item') &&
      dataset.value
    ) {
      value = parseFloat(dataset.value);
    }

    this.sliderUpdate.emit({value: value});
    this.value = value;
  };

  /**
   * Detach event listeners to mousemove/mouseup events
   * @return {void}
   */
  handleEnd = (/*e: UIEvent*/) => {
    // console.log("end");
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleEnd);
    this.state = {
      ...this.state,
      active: false};
  };

  /**
   * Support for key events on the slider handle
   * @param  {Object} e - Event object
   * @return {void}
   */
  handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    const { keyCode } = e;
    let sliderValue;

    switch (keyCode) {
      case 38:
      case 39:
        sliderValue = this.value + this.step > this.max ? this.max : this.value + this.step;
        this.value = sliderValue;
        break;
      case 37:
      case 40:
        sliderValue = this.value - this.step < this.min ? this.min : this.value - this.step;
        this.value = sliderValue;
        break;
    }
  };

  /**
   * Calculate position of slider based on its value
   * @param  {number} value - Current value of slider
   * @return {position} pos - Calculated position of slider based on value
   */
  getPositionFromValue(value) {
    const { limit } = this.state;
    const diffMaxMin = this.max - this.min;
    const diffValMin = value - this.min;
    const percentage = diffValMin / diffMaxMin;
    const pos = Math.round(percentage * limit);

    return pos;
  };

  /**
   * Translate position of slider to slider value
   * @param  {number} pos - Current position/coordinates of slider
   * @return {number} value - Slider value
   */
  getValueFromPosition = pos => {
    const { limit } = this.state;
    const percentage = this.clamp(pos, 0, limit) / (limit || 1);
    const baseVal = this.step * Math.round(percentage * (this.max - this.min) / this.step);
    let value = this.orientation === 'horizontal' ? baseVal + this.min : this.max - baseVal;

    value = parseFloat(value.toFixed(this.getNbDecimals(this.step)));
    return this.clamp(value, this.min, this.max);
  };

  /**
   * 
   * @param {number} num 
   */
  getNbDecimals = num => {
    if (Math.floor(num) === num) return 0;
    return num.toString().split(".")[1].length || 0;
  };

  /**
   * Calculate position of slider based on value
   * @param  {Object} e - Event object
   * @return {number} value - Slider value
   */
  position = e => {
    const { grab } = this.state;

    const node = this.slider;
    const coordinateStyle = constants.orientation[this.orientation].coordinate;
    const directionStyle = this.reverse
      ? constants.orientation[this.orientation].reverseDirection
      : constants.orientation[this.orientation].direction;
    const clientCoordinateStyle = `client${this.capitalize(coordinateStyle)}`;
    const coordinate = !e.touches
      ? e[clientCoordinateStyle]
      : e.touches[0][clientCoordinateStyle];
    const direction = node.getBoundingClientRect()[directionStyle];
    const pos = this.reverse
      ? direction - coordinate - grab
      : coordinate - direction - grab;
    const value = this.getValueFromPosition(pos);

    return value;
  };

  /**
   * Grab coordinates of slider
   * @param  {Object} pos - Position object
   * @return {Object} - Slider fill/handle coordinates
   */
  coordinates = pos => {
    const { limit, grab } = this.state;
    const value = this.getValueFromPosition(pos);
    const position = this.getPositionFromValue(value);
    const handlePos = this.orientation === 'horizontal' ? position + grab : position;
    const fillPos = this.orientation === 'horizontal'
      ? handlePos
      : limit - handlePos;

    return {
      fill: fillPos,
      handle: handlePos,
      label: handlePos
    };
  };

  componentDidLoad() {
    this.handleUpdate();
  }

  render() {
    const position = this.getPositionFromValue(this.value);
    const coords = this.coordinates(position);
    const direction = this.reverse
      ? constants.orientation[this.orientation].reverseDirection
      : constants.orientation[this.orientation].direction;
    const dimension = constants.orientation[this.orientation].dimension;
    const fillStyle = { [dimension]: `${coords.fill}px` };
    const handleStyle = { [direction]: `${coords.handle}px` };
    const showTooltip = this.showTooltip && this.state.active;

    return (
      <Host>
        <div
          ref={(el) => this.slider = el as HTMLElement}
          class={'rangeslider rangeslider-' + this.orientation}
          onMouseDown={this.handleDrag}
          onMouseUp={this.handleEnd}
          onTouchStart={this.handleStart}
          onTouchEnd={this.handleEnd}
        >
          <div class='rangeslider__fill' style={fillStyle} />
          <div
            ref={(el) => this.sliderHandle = el as HTMLElement}
            class='rangeslider__handle'
            onMouseDown={this.handleStart}
            onTouchMove={this.handleDrag}
            onTouchEnd={this.handleEnd}
            onKeyDown={this.handleKeyDown}
            style={handleStyle}
            tabIndex={0}
          >
            {showTooltip
              ? <div
                class='rangeslider__handle-tooltip'>
                <span>{this.value}</span>
              </div>
              : null}
            <div class='rangeslider__handle-label'>{this.handleLabel}</div>
          </div>
          <div class='rangeslider__label'>
            Value ({this.min} - {this.max})
          </div>
        </div>
      </Host>
    );
  }

}
