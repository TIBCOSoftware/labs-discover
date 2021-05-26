import {AnalyticsMenuConfigUI} from '../models/configuration';
import {stripDisabledMenuItems, stripUiIdFromTemplate} from './templates';
import {AnalyticTemplateUI} from '../models/analyticTemplate';

let simpleMenu: AnalyticsMenuConfigUI[];
let simpleTopDisabled: AnalyticsMenuConfigUI[];
let simpleChildDisabled: AnalyticsMenuConfigUI[];
let fullMenu: AnalyticsMenuConfigUI[];
let simpleUiIdTemplate: AnalyticTemplateUI;

describe('templateFunctions', () => {
  beforeEach(() => {
    // Set test data
    simpleMenu = [
      {
        id: 'ENABLED',
        label: 'label_enabled',
        enabled: true
      },
      {
        id: 'DISABLED',
        label: 'label_disabled',
        enabled: false
      }];

    // Set test data
    simpleUiIdTemplate = {menuConfig: [
        {
          id: 'ENABLED',
          label: 'label_enabled',
          enabled: true,
          uiId: '1'
        },
        {
          id: 'DISABLED',
          label: 'label_disabled',
          enabled: false,
          uiId: '2'
        }], name: '', type: 'General'}


    fullMenu = [
      {
        id: 'ENABLED',
        label: 'Overview',
        icon: 'pl-icon-home',
        child: [],
        enabled: true
      },
      {
        id: 'DISABLED',
        label: 'Overview',
        icon: 'pl-icon-home',
        child: [],
        enabled: false
      },
      {
        id: 'CHILD_DISABLED',
        label: 'Variants',
        icon: 'pl-icon-explore',
        child: [
          {
            id: 'Top Frequents Variants',
            label: 'Top Frequency',
            icon: 'pl-icon-explore',
            enabled: true
          },
          {
            id: 'Bottom Performance Variants',
            label: 'Bottom Performance',
            icon: 'pl-icon-explore',
            enabled: false
          }
        ],
        enabled: true
      }]

    simpleTopDisabled = [
      {
        id: 'TOP_DISABLED',
        label: 'Variants',
        icon: 'pl-icon-explore',
        child: [
          {
            id: 'Top Frequents Variants',
            label: 'Top Frequency',
            icon: 'pl-icon-explore',
            enabled: true
          },
          {
            id: 'Bottom Performance Variants',
            label: 'Bottom Performance',
            icon: 'pl-icon-explore',
            enabled: false
          }
        ],
        enabled: false
      }];

    simpleChildDisabled = [{
      id: 'CHILD_DISABLED',
      label: 'Variants',
      icon: 'pl-icon-explore',
      child: [
        {
          id: 'Top Frequents Variants',
          label: 'Top Frequency',
          icon: 'pl-icon-explore',
          enabled: true
        },
        {
          id: 'Bottom Performance Variants',
          label: 'Bottom Performance',
          icon: 'pl-icon-explore',
          enabled: false
        }
      ],
      enabled: true
    }];
  });


  it('Strip Disabled Menu items Simple', () => {
    console.log('Strip Disabled Menu items Simple');
    expect(stripDisabledMenuItems(simpleMenu)).toEqual(jasmine.objectContaining(
      [{
        id: 'ENABLED',
        label: 'label_enabled',
        enabled: true
      }]));
  });


  it('Strip Disabled Menu items Child Disabled', () => {
    console.log('Strip Disabled Menu items Child Disabled');
    expect(stripDisabledMenuItems(simpleChildDisabled)).toEqual(jasmine.objectContaining(
      [{
        id: 'CHILD_DISABLED',
        label: 'Variants',
        icon: 'pl-icon-explore',
        child: [
          {
            id: 'Top Frequents Variants',
            label: 'Top Frequency',
            icon: 'pl-icon-explore',
            enabled: true
          }],
        enabled: true
      }]));
  });


  it('Strip Disabled Menu items Top Disabled', () => {
    console.log('Strip Disabled Menu items Top Disabled');
    expect(stripDisabledMenuItems(simpleTopDisabled)).toEqual(jasmine.objectContaining(
      []));
  });

  it('Strip Disabled Menu items Full Menu', () => {
    console.log('Strip Disabled Menu items Full Menu');
    expect(stripDisabledMenuItems(fullMenu)).toEqual(jasmine.objectContaining(
      [{
        id: 'ENABLED',
        label: 'Overview',
        icon: 'pl-icon-home',
        child: [],
        enabled: true
      }, {
        id: 'CHILD_DISABLED',
        label: 'Variants',
        icon: 'pl-icon-explore',
        child: [
          {
            id: 'Top Frequents Variants',
            label: 'Top Frequency',
            icon: 'pl-icon-explore',
            enabled: true
          }],
        enabled: true
      }]));
  });

  it('Strip UI ids', () => {
    console.log('Striping UI ids: ' );
    expect(stripUiIdFromTemplate(simpleUiIdTemplate)).toEqual({menuConfig: [
        {
          id: 'ENABLED',
          label: 'label_enabled',
          enabled: true
        },
        {
          id: 'DISABLED',
          label: 'label_disabled',
          enabled: false
        }], name: '', type: 'General'});
  });

});
