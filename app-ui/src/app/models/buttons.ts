import {CaseAction} from '@tibco-tcstk/tc-liveapps-lib/lib/models/liveappsdata';

export type bType = 'ACTION' | 'MULTIPLE' | 'CREATE' | 'OTHER' | 'MESSAGE';

export interface TButton {
    id: string;
    label: string;
    type: bType;
    caseAction?: CaseAction;
    addition?: string;
    message?: string;
    messageType?: string;
}

/*
export interface cidState {
    cidStates?: (CidState)[] | null;
}*/

export interface CIDState {
    caseRef: string;
    state: string;
}
