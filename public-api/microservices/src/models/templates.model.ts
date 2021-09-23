export interface Template {
    id?: string;
    name: string;
    type: string;
    description?: string;
    splash?: string;
    spotfireLocation: string;
    menuConfig?: TemplateMenuConfig[];
    filters: TemplateMenuConfig[];
    enabled?: boolean;
    icon?: string;
    marking?: TemplateMarkingConfig;
    previewParameters: string;
}

export interface TemplateRequest {
    template: Template,
    visualisation?: NewVisualisationInformation
}

export interface TemplateMenuConfig {
    id: string;
    label: string;
    icon?: string;
    enabled?: boolean;
    isDefault?: boolean;
    child?: TemplateMenuConfig[];
}

export interface TemplateMarkingConfig {
    listenOnMarking: string;
    casesSelector: string;
    variantSelector: string;
}

export interface NewVisualisationInformation {
    sourceId: string;
    destinationFolderId: string;
}