export interface DiscoverConfiguration {
    general: GeneralInformation;
    landingPage?: LandingPage,
    messages?: Message[];
    formats?: FieldFormats[];
    automap?: Automapping[];
    investigations?: Investigations;
    analytics?: Analytics;
}

export interface GeneralInformation {
    applicationTitle: string;
    documentationUrl: string;
}

export interface LandingPage {
    title: string;
    subtitle: string;
    backgroundURL: string;
    verticalPadding: number;
    actionButtons: LandingPageButtons[];
    highlights: LandingPageHightlight[];
} 

export interface LandingPageHightlight {
    title: string;
    iconURL: string;
    content: string;
}

export interface LandingPageButtons {
    text: string;
    route: string;
}

export interface LandingPageUploadResponse {
    path:string;
}

export interface Message {
    id: string;
    scope: string;
    message: string;
    persistClose: boolean;
}

export interface MessageInternal {
    id: string;
    message: string;
    persistClose: boolean;
    startTime?: string;
    endTime?: String;
}

export interface MessageRequest {
    scope: string; 
    message: string;
    persistClose: boolean;
    startTime?: Date;
    endTime?: Date;
}

export interface FieldFormats {
    fieldName: string,
    values: any[];
}

export interface Automapping {
    fieldName: string;
    values: AutomapingFields[];
    threshold: number
}

export interface AutomapingFields {
    word: string;
    occurrence: number;
}

export interface Investigations {
    numberApplications: number;
    applications: InvestigationApplication[];
}

export interface InvestigationApplication {
    customTitle: string;
    applicationId: string;
    creatorId: string;
    creatorData: InvestigationField[];
    headerFields: InvestigationField[];
    detailTitle: InvestigationField;
    showMilestones: boolean;
    allowMultiple: boolean;
    detailFields: InvestigationField[][];
    states: InvestigationState[];
}

export interface InvestigationField {
    label: string;
    field: string;
    format?: string;
}

export interface InvestigationState {
    name: string;
    color: string;
    icon: string;
}

export interface Analytics {
    previewLocation: string;
    previewTableName: string;
    server: string;
    customUserFolder: string;
}

export interface Connection {
    id: string;
    name: string;
    hostname: string;
    jdbcPort: number;
    username: string;
    password: string;
}

export interface WhoAmI {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    subscriptionId: string;
    isUser: boolean;
    isAdmin: boolean;
    isAnalyst: boolean;
    isResolver: boolean;
    tenants: TenantInformation[];
}

export interface TenantInformation {
    id: string;
    roles?: string[];
}