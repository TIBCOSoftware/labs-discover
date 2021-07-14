import {AutoMappingService} from './auto-mapping.service';
import {ConfigurationService} from './configuration.service';

describe('AutoMappingService', () => {
  let AMService: AutoMappingService;
  let configServiceSpy: ConfigurationService;

  beforeEach(() => {
    // Set Stub Configurations
    const stubConfig = {
      config: {
        discover: {
          ssConfig: {
            caseIdWords: ['case', 'id', 'instance'],
            activityWords: ['activity', 'task', 'operation'],
            resourceWords: ['user', 'agent', 'resource'],
            startWords: ['start', 'begin', 'initial'],
            endWords: ['end', 'finish', 'last'],
            doAddAdditional: true,
            debug: true,
            threshold: 0.4
          }
        }
      }
    }
    configServiceSpy = jasmine.createSpyObj('ConfigurationService', {}, stubConfig);
    AMService = new AutoMappingService(configServiceSpy, null);
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
    expect(AMService.findBestMatch('one', ['one', 'two', 'three'])).toEqual(jasmine.objectContaining({bestMatch: {target: 'one', rating: 1}}));
  });

  it('Find Best Match Similar', () => {
    expect(AMService.findBestMatch('twoS', ['one', 'two', 'three'])).toEqual(jasmine.objectContaining({bestMatch: {target: 'two', rating: 0.8}}));
  });
  /* TODO: fix these testcases

    it('Auto Map Basic', () => {
      expect(SSService.autoMap(['case', 'activity', 'user', 'start', 'end'])).toEqual(jasmine.objectContaining(
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
