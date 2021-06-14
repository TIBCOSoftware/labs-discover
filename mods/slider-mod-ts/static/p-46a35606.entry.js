import{r as t,c as e,h as i,H as r}from"./p-48ec726e.js";const s={orientation:{horizontal:{dimension:"width",direction:"left",reverseDirection:"right",coordinate:"x"},vertical:{dimension:"height",direction:"top",reverseDirection:"bottom",coordinate:"y"}}},a=class{constructor(i){t(this,i),this.orientation="horizontal",this.showTooltip=!0,this.state={active:!1,limit:0,grab:0},this.handleLabel="",this.reverse=!1,this.handleStart=()=>{document.addEventListener("mousemove",this.handleDrag),document.addEventListener("mouseup",this.handleEnd),this.state=Object.assign(Object.assign({},this.state),{active:!0})},this.handleDrag=t=>{t.stopPropagation();const e=t.target,{className:i,classList:r,dataset:s}=e;if("rangeslider__labels"===i)return;let a=this.position(t);r&&r.contains("rangeslider__label-item")&&s.value&&(a=parseFloat(s.value)),this.sliderUpdate.emit({value:a}),this.value=a},this.handleEnd=()=>{document.removeEventListener("mousemove",this.handleDrag),document.removeEventListener("mouseup",this.handleEnd),this.state=Object.assign(Object.assign({},this.state),{active:!1})},this.handleKeyDown=t=>{t.preventDefault();const{keyCode:e}=t;let i;switch(e){case 38:case 39:i=this.value+this.step>this.max?this.max:this.value+this.step,this.value=i;break;case 37:case 40:i=this.value-this.step<this.min?this.min:this.value-this.step,this.value=i}},this.getValueFromPosition=t=>{const{limit:e}=this.state,i=this.clamp(t,0,e)/(e||1),r=this.step*Math.round(i*(this.max-this.min)/this.step);let s="horizontal"===this.orientation?r+this.min:this.max-r;return s=parseFloat(s.toFixed(this.getNbDecimals(this.step))),this.clamp(s,this.min,this.max)},this.getNbDecimals=t=>Math.floor(t)===t?0:t.toString().split(".")[1].length||0,this.position=t=>{const{grab:e}=this.state,i=this.slider,r=this.reverse?s.orientation[this.orientation].reverseDirection:s.orientation[this.orientation].direction,a=`client${this.capitalize(s.orientation[this.orientation].coordinate)}`,l=t.touches?t.touches[0][a]:t[a],n=i.getBoundingClientRect()[r];return this.getValueFromPosition(this.reverse?n-l-e:l-n-e)},this.coordinates=t=>{const{limit:e,grab:i}=this.state,r=this.getValueFromPosition(t),s=this.getPositionFromValue(r),a="horizontal"===this.orientation?s+i:s;return{fill:"horizontal"===this.orientation?a:e-a,handle:a,label:a}},this.sliderUpdate=e(this,"sliderUpdate",7)}capitalize(t){return t.charAt(0).toUpperCase()+t.substr(1)}clamp(t,e,i){return Math.min(Math.max(t,e),i)}handleUpdate(){const t=this.capitalize(s.orientation[this.orientation].dimension),e=this.slider[`offset${t}`],i=this.sliderHandle[`offset${t}`];this.state=Object.assign(Object.assign({},this.state),{limit:e-i,grab:i/2})}getPositionFromValue(t){const{limit:e}=this.state;return Math.round((t-this.min)/(this.max-this.min)*e)}componentDidLoad(){this.handleUpdate()}render(){const t=this.getPositionFromValue(this.value),e=this.coordinates(t),a={[this.reverse?s.orientation[this.orientation].reverseDirection:s.orientation[this.orientation].direction]:`${e.handle}px`},l=this.showTooltip&&this.state.active;return i(r,null,i("div",{ref:t=>this.slider=t,class:"rangeslider rangeslider-"+this.orientation,onMouseDown:this.handleDrag,onMouseUp:this.handleEnd,onTouchStart:this.handleStart,onTouchEnd:this.handleEnd},i("div",{class:"rangeslider__fill",style:{[s.orientation[this.orientation].dimension]:`${e.fill}px`}}),i("div",{ref:t=>this.sliderHandle=t,class:"rangeslider__handle",onMouseDown:this.handleStart,onTouchMove:this.handleDrag,onTouchEnd:this.handleEnd,onKeyDown:this.handleKeyDown,style:a,tabIndex:0},l?i("div",{class:"rangeslider__handle-tooltip"},i("span",null,this.value)):null,i("div",{class:"rangeslider__handle-label"},this.handleLabel)),i("div",{class:"rangeslider__label"},"Value (",this.min," - ",this.max,")")))}};a.style=":host{display:block}.my-box-shadow{-webkit-box-shadow:0px 0px 0px 14px rgba(191,214,248,1);box-shadow:0px 0px 0px 14px rgba(191,214,248,1)}.rangeslider{margin:20px 0;position:relative;background:rgba(209, 227, 250, 1);-ms-touch-action:none;touch-action:none}.rangeslider,.rangeslider .rangeslider__fill{display:block;-webkit-box-shadow:inset 0 1px 3px rgba(0,0,0,.4);box-shadow:inset 0 1px 3px rgba(0,0,0,.4)}.rangeslider .rangeslider__handle{background:#fff;cursor:pointer;display:inline-block;position:absolute}.rangeslider .rangeslider__handle .rangeslider__active{opacity:1}.rangeslider .rangeslider__handle:focus{outline:none}.rangeslider .rangeslider__handle-tooltip{width:38px;height:38px;text-align:center;position:absolute;background-color:rgba(23, 116, 229, 1);font-weight:400;font-size:14px;border-radius:50%;display:inline-block;color:#fff;left:50%;-webkit-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0)}.rangeslider .rangeslider__handle-tooltip span{margin-top:12px;display:inline-block;line-height:100%}.rangeslider .rangeslider__handle-tooltip:after{content:\" \";position:absolute;width:0;height:0}.rangeslider-horizontal{height:9px;border-radius:10px}.rangeslider-horizontal .rangeslider__fill{height:100%;background-color:rgba(23, 116, 229, 1);border-radius:10px;top:0}.rangeslider-horizontal .rangeslider__handle{width:21px;height:21px;border-radius:21px;top:50%;background-color:rgba(23, 116, 229, 1);-webkit-transform:translate3d(-50%,-50%,0);transform:translate3d(-50%,-50%,0)}.rangeslider-horizontal .rangeslider__handle-tooltip{top:-55px}.rangeslider-horizontal .rangeslider__handle-tooltip:after{border-left:12px solid transparent;border-right:12px solid transparent;border-top:12px solid rgba(23, 116, 229, 1);left:50%;bottom:-8px;-webkit-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0)}.rangeslider-horizontal .rangeslider__label{font-family:'ArialMT', 'Arial', sans-serif;font-size:14px;color:#1774E5;margin-top:10px}.rangeslider-vertical{margin:20px auto;height:150px;max-width:10px;background-color:transparent}.rangeslider-vertical .rangeslider__fill,.rangeslider-vertical .rangeslider__handle{position:absolute}.rangeslider-vertical .rangeslider__fill{width:100%;background-color:rgba(23, 116, 229, 1);-webkit-box-shadow:none;box-shadow:none;bottom:0}.rangeslider-vertical .rangeslider__handle{width:30px;height:10px;left:-10px;-webkit-box-shadow:none;box-shadow:none}.rangeslider-vertical .rangeslider__handle-tooltip{left:-100%;top:50%;-webkit-transform:translate3d(-50%,-50%,0);transform:translate3d(-50%,-50%,0)}.rangeslider-vertical .rangeslider__handle-tooltip:after{border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:12px solid rgba(23, 116, 229, 1);left:90%;top:7px}.rangeslider-reverse.rangeslider-horizontal .rangeslider__fill{right:0}.rangeslider-reverse.rangeslider-vertical .rangeslider__fill{top:0;bottom:inherit}.rangeslider__labels{position:relative}.rangeslider-vertical .rangeslider__labels{position:relative;list-style-type:none;margin:0 0 0 24px;padding:0;text-align:left;width:250px;height:100%;left:10px}.rangeslider-vertical .rangeslider__labels .rangeslider__label-item{position:absolute;-webkit-transform:translate3d(0,-50%,0);transform:translate3d(0,-50%,0)}.rangeslider-vertical .rangeslider__labels .rangeslider__label-item:before{content:\"\";width:10px;height:2px;background:#000;position:absolute;left:-14px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);z-index:-1}.rangeslider__labels .rangeslider__label-item{position:absolute;font-size:14px;cursor:pointer;display:inline-block;top:10px;-webkit-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0)}*,:after,:before{margin:0;padding:0;-webkit-box-sizing:border-box;box-sizing:border-box}";export{a as range_slider}