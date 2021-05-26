export interface Template {
    id?: number;
    name: string;
    type: string;
    description?: string;
    splash?: string;
    spotfireLocation?: string;
    menuConfig?: TemplateMenuConfig[];
    enabled?: boolean;
    icon?: string;
    marking?: TemplateMarkingConfig;
    previewParameters: string;
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