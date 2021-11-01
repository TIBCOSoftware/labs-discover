import {AutoMappingService} from './auto-mapping.service';
import {ConfigurationService} from 'src/app/backend/api/configuration.service';
import {Automapping} from '../backend/model/automapping';

describe('AutoMappingService', () => {
  let AMService: AutoMappingService;
  let configServiceSpy: ConfigurationService;

  beforeEach(() => {
    // Set Stub Configurations
    const stubConfig: { autoMapConfig: Automapping[] } = {
      autoMapConfig: [{
        threshold: 0.8,
        fieldName: 'caseId',
        values: [{word: 'case', occurrence: 1}, {word: 'id', occurrence: 1}, {word: 'instance', occurrence: 1}]
      },
        {
          threshold: 0.8,
          fieldName: 'activity',
          values: [{word: 'activity', occurrence: 1}, {word: 'task', occurrence: 1}, {word: 'operation', occurrence: 1}]
        },
        {
          threshold: 0.8,
          fieldName: 'resource',
          values: [{word: 'user', occurrence: 1}, {word: 'agent', occurrence: 1}, {word: 'resource', occurrence: 1}]
        },
        {
          threshold: 0.8,
          fieldName: 'startTime',
          values: [{word: 'start', occurrence: 1}, {word: 'begin', occurrence: 1}, {word: 'initial', occurrence: 1}]
        },
        {
          threshold: 0.8,
          fieldName: 'endTime',
          values: [{word: 'end', occurrence: 1}, {word: 'finish', occurrence: 1}, {word: 'last', occurrence: 1}]
        }
      ]
    }
    configServiceSpy = jasmine.createSpyObj('ConfigurationService', {getAutomap: {pipe: jasmine.createSpy().and.returnValue({subscribe: jasmine.createSpy().and.returnValue(stubConfig.autoMapConfig)}) }}, stubConfig);
    AMService = new AutoMappingService(configServiceSpy);
  });

  it('String Similarity Service created', () => {
    expect(AMService).toBeTruthy();
  });

  it('Basic Compare', () => {
    expect(AMService.compare('one', 'one')).toBe(1);
  });

  it('Similar Compare', () => {
    expect(AMService.compare('ones', 'one')).toBe(0.8);
  });

  it('Completely Different Compare', () => {
    expect(AMService.compare('two', 'one')).toBe(0);
  });

  it('Find Best Match', () => {
    expect(AMService.findBestMatch('one', ['one', 'two', 'three'])).toEqual(jasmine.objectContaining({
      bestMatch: {
        target: 'one',
        rating: 1
      }
    }));
  });

  it('Find Best Match Similar', () => {
    expect(AMService.findBestMatch('twoS', ['one', 'two', 'three'])).toEqual(jasmine.objectContaining({
      bestMatch: {
        target: 'two',
        rating: 0.8
      }
    }));
  });
  /* TODO: fix these testcases

    it('Auto Map Basic', () => {
      console.log('AMService.autoMapConfig: ' ,AMService.autoMapConfig)
      console.log('TEST: ' , (AMService.autoMapOccurrence('caseId', ['case', 'activity', 'user', 'start', 'end'])))
      expect(AMService.autoMapOccurrence('caseId', ['case', 'activity', 'user', 'start', 'end'])).toEqual(jasmine.objectContaining(
        {
          activityColumn: 'activity',
          activityRating: 1,
          caseIdColumn: 'case',
          caseIdRating: 1,
          endColumn: 'end',
          endRating: 1,
          resourceColumn: 'user',
          resourceRating: 1,
          startColumn: 'start',
          startRating: 1
        }));
    });

    it('Auto Map Similar', () => {
      expect(SSService.autoMap('case5', ['caseS', 'activityS', 'userS', 'startS', 'endS'])).toEqual(jasmine.objectContaining(
        {
          activityColumn: 'activityS',
          caseIdColumn: 'caseS',
          endColumn: 'endS',
          resourceColumn: 'userS',
          startColumn: 'startS'
        }));
    });

    it('Auto Map One Missing', () => {
      expect(SSService.autoMap(['caseS', 'weird', 'userS', 'startS', 'endS'])).toEqual(jasmine.objectContaining(
        {
          activityColumn: 'none',
          caseIdColumn: 'caseS',
          endColumn: 'endS',
          resourceColumn: 'userS',
          startColumn: 'startS'
        }));
    });

    it('Auto Map Add Additional', () => {
      expect(SSService.autoMap(['caseS', 'activityS', 'userS', 'startS', 'endS', 'add1', 'add2'])).toEqual(jasmine.objectContaining(
        {
          activityColumn: 'activityS',
          caseIdColumn: 'caseS',
          endColumn: 'endS',
          resourceColumn: 'userS',
          startColumn: 'startS',
          otherFields: ['add1', 'add2']
        }));
    });
  */
  // TODO: Add a test where you change the config to say don't add additional fields

});
