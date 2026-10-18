const base = process.env.BASE_URL || 'http://localhost:4322';
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext();const page=await context.newPage();
 const results=[];
 for(const route of ['/book/','/admissions/book/']){
  await page.goto(base+route);
  // Simulate the deployed feature gate in the browser only; never contact a live form service.
  await page.locator('form').evaluate(form=>{form.dataset.enabled='true';form.querySelector('button[type=submit]').disabled=false});
  await page.locator('[name=email]').fill('qa@example.com');
  if(route==='/book/'){
   await page.locator('[name=client-name]').fill('Test enquiry');
   await page.locator('[name=booking-type]').selectOption({index:1});
   await page.locator('[name=occasion]').selectOption({index:1});
   await page.locator('[name=event-date]').fill('2030-10-18');
   await page.locator('[name=start-time]').fill('19:30');
   await page.locator('[name=location]').fill('Test location, Singapore');
   await page.locator('[name=sets]').fill('2');
   await page.locator('[name=dancing]').selectOption({index:1});
  }else{
   await page.locator('[name=applicant-name]').fill('Test applicant');
   for(const name of ['educational-stage','service','pathway','consultation-format'])await page.locator(`[name=${name}]`).selectOption({index:1});
   await page.locator('[name=application-year]').fill('2030');
   await page.locator('[name=services-required]').fill('Guided reading');
   await page.locator('[name=goals]').fill('A dummy test enquiry, without personal records.');
  }
  await page.locator('[name=consent]').check();
  if(!await page.locator('form').evaluate(f=>f.checkValidity()))throw Error('valid filled form rejected '+route);
  let captured;
  await page.route(base+'/',async r=>{if(r.request().method()==='POST'){captured=r.request().postData();await r.fulfill({status:503,body:'Test failure'})}else await r.continue()});
  await page.locator('button[type=submit]').click();
  await page.getByRole('status').filter({hasText:'could not be confirmed'}).waitFor();
  if(await page.locator('[name=email]').inputValue()!=='qa@example.com')throw Error('failed submission cleared data');
  if(!captured.includes('form-name='))throw Error('Netlify form name missing');
  await page.unroute(base+'/');
  await page.route(base+'/',async r=>{if(r.request().method()==='POST')await r.fulfill({status:200,body:'Mock receipt'});else await r.continue()});
  await page.locator('button[type=submit]').click();
  await page.waitForURL('**/thank-you/');
  await page.unroute(base+'/');
  results.push({route,validData:'passed',mockFailure:'passed',dataRetained:'passed',mockSuccess:'passed'});
 }
 console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
