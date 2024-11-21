const connectionURL = 'wss://browser.zenrows.com?apikey=8482d5dda376bb76788bd9f23d21232feadeae6e&proxy_country=us';
import fs from "node:fs";
import puppeteer from "puppeteer-extra"
import { Browser, Page } from "puppeteer"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import csv from "csvtojson";

const delay = async (ms: number) => {
    new Promise(resolve => setTimeout(resolve, ms))
}

async function ScrapePerson(page: Page, person: { name: string; address: { cityname: string; zipcode: number, zipState: string } }, Browser: Browser) {
    try {

        await page.evaluate(() => {
            (document.querySelector('input[aria-label="Name"]') as HTMLInputElement).value = ''
        })
        await page.type('input[aria-label="Name"]', person.name, { delay: 121 });
        await page.type('input[aria-label="City, State or Zip"]', person.address.zipcode.toString().trim(), { delay: 131 })
        fs.writeFileSync('FormFilled.png', await page.screenshot())
        await page.click('#btnSubmit-d-n');

        console.log(await page.title());
        if (await page.title() === "Captcha") {
            await delay(5000)
        }

        await page.waitForSelector('div.row.visible-left-side-visible.record-count.pl-1')
        let resutls = await page.evaluate(() => {
            return (document.querySelector('div.row.visible-left-side-visible.record-count.pl-1') as HTMLElement).innerText.split(' ')[0];
        })
        console.log(`Results Found :: ${resutls}`);
        if (eval(resutls) === 0) return;

        let PagePath = await page.evaluate(() => {
            return (document.querySelector('div.card.card-body.shadow-form.card-summary.pt-3') as HTMLElement)
                ? (document.querySelector('div.card.card-body.shadow-form.card-summary.pt-3') as HTMLElement).getAttribute('data-detail-link')
                : ""
        })
        console.log(PagePath)
        if (PagePath !== null) {
            const newTab = await ScrapeEmailandPhone(Browser, PagePath)
            console.log(newTab)
            return newTab
        }
    } catch (error) {
        console.log(error)
    }
}


async function ScrapeEmailandPhone(browser: Browser, url: string) {
    const newPage = await browser.newPage();
    await newPage.setViewport({
        height: 900,
        width: 1600
    })
    try {
        await newPage.goto(`https://www.truepeoplesearch.com${url.trim()}`, { timeout: 0, waitUntil: "networkidle2" });
        let ContactInfo = await newPage.evaluate(() => {
            let PhoneNumbers: Array<string> = [...document.querySelectorAll('span[itemprop="telephone"]')].map((item) => {
                return (item as HTMLSpanElement).innerText
            })

            let Emails: Array<string> = ([...document.querySelectorAll('div.col-12.col-sm-11.pl-sm-1')].filter(item => (item as HTMLElement).innerText.includes('Email Addresses'))[0] as HTMLElement)?.innerText.split('\n')

            if (Emails.length > 1) Emails.shift();

            return { PhoneNumbers, Email: Emails }
        })
        await newPage.close()
        return ContactInfo
    } catch (error) {
        await newPage.close()
        console.log(error)
    }
}

async function SaveScrape(data: ObjectCsvAfterSCraping) {
    let x: Array<ObjectCsvAfterSCraping> = JSON.parse(fs.readFileSync('results.json').toString())
    x.push(data)
    fs.writeFileSync('results.json', JSON.stringify(x))
}

interface ObjectCsv {
    Type: string;
    Name: string;
    ADDRESS: string;
    ADDRESS2: string;
    CITY: string;
    STATE: string;
    ZIP: string;
    WEBSITE: string;
    HOA: string
}
interface ObjectCsvAfterSCraping extends ObjectCsv {
    phoneNumbers: Array<string>;
    emails: Array<string>;
}
(async () => {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    await page.setViewport({
        height: 900,
        width: 1600
    });

    console.log('Starting Script')
    await page.goto('https://www.truepeoplesearch.com/find/person', { timeout: 0, waitUntil: "networkidle2" });
    await page.waitForSelector('input[aria-label="Name"]', { timeout: 0 })

    csv().fromFile('Prime Renovate Scraping Results - results (1).csv.csv').then(async (data: Array<ObjectCsv>) => {
        for (let index = 0; index < data.length; index++) {
            try {
                const element = data[index];
                if (element.Name === 'No Property Manager Found' || element.Type === "Property Manager") continue;
                let PhoneAndEmail = await ScrapePerson(page, {
                    name: element.Name, address: {
                        cityname: element.CITY,
                        zipState: element.STATE,
                        zipcode: eval(element.ZIP)
                    },
                }, browser)
                if (PhoneAndEmail !== undefined) {
                    let newObject: ObjectCsvAfterSCraping = { ...element, phoneNumbers: [], emails: [] };
                    newObject.phoneNumbers = PhoneAndEmail.PhoneNumbers;
                    newObject.emails = PhoneAndEmail.Email
                    await SaveScrape(newObject)
                }

            } catch (error) {
                console.log(error)

            }
        }
    })

})();