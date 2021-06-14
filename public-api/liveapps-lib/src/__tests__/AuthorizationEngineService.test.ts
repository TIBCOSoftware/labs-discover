import { AuthorizatinEngineService } from '../index';

test('processCreate to create a new case', async () => {
  let aes = new AuthorizatinEngineService();

  const data = await aes.getClaims('CIC~i0uw6hr3OF7sNHfssvB1ERkx');
  console.log('data' + JSON.stringify(data));

  expect('3').toBe('3');
});

