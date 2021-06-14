/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

const SIZE_OF_INT = 4;

const NILVALUE_SXP = 254;
const EXTPTRSXP = 22;
const VECSXP = 19;
const STRSXP = 16;
const INTSXP = 13;
const CHARSXP = 9;
const LISTSXP = 2;
const SYMSXP = 1;

const CHARSXP_FLAGS = 0x00040009;

interface Item {
    type: number;
    value: any;
    sizeInBytes: number;
}

/**
 * @param {string} str
 */
function strToBuffer(str: string) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * Read RDS format
 * @param {string} binaryStr
 */
export function readRDS(binaryStr: string) {
    // TODO : check string length?
    // Create ArrayBuffer
    // using ArrayBuffer to optimize mem usage
    let buffer = strToBuffer(binaryStr);
    //console.log(Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join(''));
    let dataView = new DataView(buffer);
    let byteOffset = 0;

    // InFormat
    let format = dataView.getUint8(byteOffset);
    byteOffset++;
    if (format !== 88) { // 88 == 'X' 
        console.warn("only xdr format is supported");
        // TODO throw exception? 
        return;
    }

    // then move cursor after \n 
    while (byteOffset < buffer.byteLength) {
        if (dataView.getUint8(byteOffset) === 10) { // 10 is decimal value for \n
            byteOffset++;
            break;
        }
        byteOffset++;
    }

    // foolproof
    if (byteOffset >= buffer.byteLength) {
        // TODO : throw exception?
        console.warn("premature end of buffer");
        return;
    }

    let version = dataView.getUint32(byteOffset);
    byteOffset += SIZE_OF_INT;  // moving forward
    byteOffset += SIZE_OF_INT;  // skipping writer version
    byteOffset += SIZE_OF_INT;  // skipping min reader version

    if (version === 3) {
        // Read encoding (type char[])
        let length = dataView.getUint32(byteOffset);
        byteOffset += SIZE_OF_INT; // length
        byteOffset += length; // just skipping encoding for now
    }

    //TODO: Read object
    return (readItem(new DataView(buffer, dataView.byteOffset + byteOffset)));
}

/**
 * Reads integer from binary
 * @param {string} input
 */
function _readInteger(input: string) {
    let hex = "0x";
    for (let i = 0, len = input.length; i < len; i++) {
        hex += ("0" + input.charCodeAt(i).toString(16)).slice(-2).toUpperCase();
    }

    let result = parseInt(hex, 16);
    return (result);
}

/**
 * Reads R object from DataView
 * @param {DataView} dataView
 * @returns {Item}
 */
function readItem(dataView: DataView) {
    // Read flags
    let byteOffset = 0;
    let flags = dataView.getUint32(byteOffset);
    byteOffset += SIZE_OF_INT;
    let lvls = flags >>> 12;
    let isObj = (flags & (1 << 8)) ? true : false;
    let hasAttr = (flags & (1 << 9)) ? true : false;
    let hasTag = (flags & (1 << 10)) ? true : false;
    let type = flags & 255;

    // console.log("type : "+type+", lvls: "+lvls+", isObj: "+isObj+", hasAttr: "+hasAttr+", hasTag: "+hasTag);

    let length = 0;
    let item = null;

    switch (type) {
        case VECSXP: //list/array
            length = dataView.getUint32(byteOffset);
            byteOffset += SIZE_OF_INT;
            item = [];
            for (let i = 0; i < length; i++) {
                let elt: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset));
                item.push(elt.value);
                byteOffset += elt.sizeInBytes;
            }
            break;
        case STRSXP: // string[]
            length = dataView.getUint32(byteOffset);
            byteOffset += SIZE_OF_INT;
            item = [];
            for (let i = 0; i < length; i++) {
                let elt: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset));
                item.push(elt.value);
                byteOffset += elt.sizeInBytes;
            }
            break;
        case CHARSXP: // string
            length = dataView.getUint32(byteOffset);
            byteOffset += SIZE_OF_INT;
            let utf8Decoder = new TextDecoder();
            item = utf8Decoder.decode(new DataView(dataView.buffer, dataView.byteOffset + byteOffset, length));
            byteOffset += length;
            break;
        case INTSXP: // number[]
            length = dataView.getUint32(byteOffset);
            byteOffset += SIZE_OF_INT;
            item = [];
            for (let i = 0; i < length; i++) {
                item.push(dataView.getInt32(byteOffset));
                byteOffset += SIZE_OF_INT;
            }
            break;
        case LISTSXP: // pairlist
            let list = [];
            let listItem = {};

            if (hasAttr) {
                let attr: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset));
                byteOffset += attr.sizeInBytes;
            }
            if (hasTag) {
                //console.log("tag (SYMSXP or NULL)");
                let tag: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset));
                byteOffset += tag.sizeInBytes;

                /** @ts-ignore */
                listItem.name = tag.value;
            }
            // console.log("1st element - CAR");
            let car: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset)); // first element
            byteOffset += car.sizeInBytes;
             /** @ts-ignore */
            listItem.value = car.value;
            list.push(listItem);

            // console.log("2nd element - CDR (usually a LISTSXP or NULL)");
            // TODO : see how to break this linkedlist to avoid stack overflows?
            let cdr = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset)); // second element
            byteOffset += cdr.sizeInBytes;
            if (cdr.value !== null) {
                // next element
                list.concat(cdr.value);
            }

            item = list;
            break;
        case SYMSXP:
            let printName: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset)); // print name
            byteOffset += printName.sizeInBytes;

            item = printName.value;
            break;
        case NILVALUE_SXP:
            item = null;
            break;
        case EXTPTRSXP:
            // Has three pointers, to the pointer, the protection value (an R object which if alive protects this object) and a tag (a SYMSXP?).
            item = [null]; // external pointer address
            for (let i = 0; i < 2; i++) { // external pointer protection & tag
                let itm: Item = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset));
                item.push(itm.value);
                byteOffset += itm.sizeInBytes;
            }
            break;
        default:
            console.warn("Unsupported type : " + type);
    }

    if (hasAttr) {
        // Read Attributes
        // console.log("attributes for type : "+type);
        /**
        * Attributes
        * @type {{type: number, value: {name: string, value: any}[] ,sizeInBytes: number}}
        */
        let attrs: Item  = readItem(new DataView(dataView.buffer, dataView.byteOffset + byteOffset));

        // TODO : check how attributes are applied to objects
        // for now we simply use the "names" attributes
        if (type === VECSXP) {
             /** @ts-ignore */
            let names = attrs.value.find(attr => attr.name === "names");
            let df = {};
            for (let i = 0; i < names.value.length; i++) {
                 /** @ts-ignore */
                df[names.value[i]] = item[i];
            }
            item = df;
        }
    }

    //console.log("type: "+type+ ", obj: "+JSON.stringify({item: item, sizeInBytes: byteOffset}));
    return ({ type: type, value: item, sizeInBytes: byteOffset });
}

function _writeItem(obj: any) {
    let type = typeof obj;
    switch (type) {
        case "object":
            // Check if array
            if (Array.isArray(obj)) {
                if (obj.length == 0) {
                    // TODO: handle empty array
                    console.warn("Array is empty");
                    break;
                }
                let arrayType = typeof obj[0];
                // Check all elements are of same type
                let sameType = obj.every(elt => typeof elt === arrayType);

                if (!sameType) {
                    console.warn("Not all elements are of same type. Converting to string");
                    for (let i = 0, len = obj.length; i < len; i++) {
                        switch (typeof obj[i]) {
                            case "string":
                                break; // Do nothing
                            case "number":
                            case "boolean":
                                obj[i] += "";
                                break;
                            case "object":
                            default:
                                obj[i] = JSON.stringify(obj);
                        }
                    }
                    arrayType = "string";
                }

                switch (arrayType) {
                    case "string":
                        let buffer = new ArrayBuffer(8);
                        // TODO: write STRSXP + length + CHARSXP for each element
                        break;
                    case "number":
                        // TODO: write INTSXP
                        break;
                    default:
                        console.warn("unsupported type in array");
                }

                break;
            }
            break;
        case "number":
            if (!Number.isInteger(obj)) {
                // TODO: Add support for float
                console.warn("Only integers are currently supported. Converting...");
                obj = parseInt(obj);
            }
            break;
        case "string":
            break;
        default:
    }
}

function _writeString(str: string) {
    let strLen = str.length;
    let byteLength = 4 + 4 + strLen;
    let offset = 0;
    let buff = new ArrayBuffer(byteLength);
    let dataView = new DataView(buff);
    dataView.setUint32(offset, CHARSXP_FLAGS); offset += 4;  // write flags
    dataView.setUint32(offset, strLen); offset += 4;    // write length

    for (var i = 0; i < strLen; i++) {
        dataView.setUint8(offset + i, str.charCodeAt(i));
        offset++;
    }

    return (buff);
}

export function dfToString(df: any){
    let names = Object.keys(df);
    let nrows = df[names[0]].length;
    let nCols = names.length;

    /** Find longest string for padding */
    let longestStrings = names.map( name => {
        /** @ts-ignore */
        return Math.max(...df[name].map(el => el.toString().length));
    });
    
    let result = "";
    /** write header */
    for(let j = 0; j < nCols; j++){
        result += names[j].toString().padEnd(longestStrings[j], ' ');
        if(j < (nCols - 1)){
            result += " | ";
        } 
    }
    result += "\n";

    for(let i = 0; i < nrows; i++){
        for(let j = 0; j < nCols; j++){
            result += df[names[j]][i].toString().padEnd(longestStrings[j], ' ');
            if(j < (nCols - 1)){
                result += " | ";
            }
        }
        if(i < (nrows - 1)){
            result += "\n";
        }
    }

    return(result);
}