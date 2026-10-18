const base = process.env.BASE_URL || 'http://localhost:4322';
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const { chromium } = require('playwright-core');
const { AxeBuilder } = require('@axe-core/playwright');
(async () => {
 const browser = await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
 const page = await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const routes=['/','/medicine/','/projects/','/projects/bats-immunity-metabolism/','/projects/inpatient-hypoglycaemia/','/projects/hla-singapore/','/music/','/book/','/admissions/','/admissions/coaching/','/admissions/mentorship/','/admissions/process/','/admissions/book/','/about/','/contact/','/privacy/','/thank-you/'];
 const results=[];
 for (const width of [1440,768,390]) {
  await page.setViewportSize({width,height:1000});
  for (const route of routes) {
   const response=await page.goto(base+route,{waitUntil:'networkidle'});
   if(response.status()!==200)throw Error(route+' status '+response.status());
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow)throw Error(route+' horizontal overflow at '+width);
   if(width===390 || width===1440){
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    if(scan.violations.length)results.push({width,route,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
   }
   if(route==='/' && [1440,390].includes(width))await page.screenshot({path:'/tmp/wharton-'+width+'.png',fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/');
 const menu=page.getByRole('button',{name:'Menu'});
 await menu.click();
 if(await menu.getAttribute('aria-expanded')!=='true')throw Error('menu does not open');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Music',exact:true}).click();
 if(!page.url().endsWith('/music/'))throw Error('mobile navigation failed');
 await page.goto(base+'/');
 await menu.click();await page.keyboard.press('Escape');
 if(await menu.getAttribute('aria-expanded')!=='false')throw Error('escape does not close menu');
 for (const route of ['/book/','/admissions/book/']) {
  await page.goto(base+route);
  if(!await page.locator('button[type=submit]').isDisabled())throw Error('preview form enabled');
  if(await page.locator('form').evaluate(f=>f.checkValidity()))throw Error('empty form valid');
 }
 console.log(JSON.stringify({routes:routes.length,viewports:[1440,768,390],axeViolations:results,errors,mobileMenu:'passed',formGating:'passed'},null,2));
 await browser.close();
 if(results.length||errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
