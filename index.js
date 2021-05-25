/*
NOTE: Do no log anything apart from access_token
*/

const puppeteer = require('puppeteer')
const fetch = require('node-fetch')

async function main() {
  const url = process.argv[2] || process.env['NHSD_LOGIN_URL']
  if (!url) {
    console.error("Login URL is required. Pass it to entrypoint or as NHSD_LOGIN_URL environment variable.")
  } else {
    return await nhsdLogin(url)
  }
}

let browser

async function nhsdLogin(url) {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu']
  })

  const navigator = gotoLogin(browser, url)
  const page = await navigator().catch(navigator).catch(navigator) // retries three times

  await page.waitForSelector('body > div > h1', {timeout: 30000})

  const callbackUrl = new URL(page.url())
  const callbackUrlParams = new URLSearchParams(callbackUrl.search)
  const code = callbackUrlParams.get("code")

  const baseUrl = new URL(url).origin
  const response = await fetch(`${baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      "code": code,
      "grant_type": "authorization_code",
      "redirect_uri": callbackUrl.origin + callbackUrl.pathname,
      "client_id": process.env.CLIENT_ID,
      "client_secret": process.env.CLIENT_SECRET
    })
  })
  const responseJson = await response.json()
  return responseJson["access_token"]
}

function gotoLogin(browser, url) {
  return (async () => {
    const page = await browser.newPage()
    await page.goto(url, {waitUntil: 'networkidle2'})
    await page.waitForSelector('button[class="btn btn-lg btn-primary btn-block"]', {timeout: 30000})
    await page.click('button[class="btn btn-lg btn-primary btn-block"]')

    return page
  })
}

main()
  .then(accessToken => console.log(accessToken))
  .catch(e => console.error("unhandled exception occurred: ", e))
  .finally(() => browser.close())
