import puppeteer, { Browser } from "puppeteer"
import { Dish } from "../interfaces";

class Parser {
    private url: string;
    private browser: Browser;

    constructor(url: string) {
        this.url = url;
    }

    private async init() {
        this.browser = await puppeteer.launch({ headless: false, slowMo: 50, timeout: 10000, defaultViewport: {width:1920, height: 1080}})
        return await this.browser.newPage()
    }

    public async fetchData() {
        const page = await this.init();
        await page.goto(this.url ,{waitUntil: 'domcontentloaded'})
        await page.waitForSelector('.cd-dropdown-wrapper > .cd-dropdown-trigger')
        const categoriesButton = await page.$(".cd-dropdown-wrapper > .cd-dropdown-trigger")
        if(categoriesButton == null)
            throw new Error("Parsing failed")
        await categoriesButton.click()
        await page.waitForSelector('.categories > .mm-listitem > a')
        let sections = await page.$$('.categories > .mm-listitem > a')
        let itemCount = 0
        const result: Dish[] = []
        for (var i = 0; i < sections.length; i++) {
            const section = sections[i];
            const name = await page.evaluate((el) => el.innerText.split('\n')[0], section).catch((err) => {
                console.log(err)
                return 'none'
            })
            console.log("sectionName", name)
            try {
                console.log("section ", await section.jsonValue())
                await section.click()
                await page.waitForSelector(".mm-panel.mm-panel_opened > .mm-listview > .mm-listitem > .uk-text-bold")
                const button = await page.$('.mm-panel.mm-panel_opened > .mm-listview > .mm-listitem > .uk-text-bold');
                if(button == null) {
                    throw new Error("Parsing failed")
                }
                await button.click()
                await page.waitForNavigation({waitUntil: 'domcontentloaded'})
                const limit = 10
                console.log("1")
                for (let count = 0; count < limit; count++) {
                    await page.waitForSelector(".product-product_card > a")
                    const pictures = await page.$$(".product-product_card > a")
                    const picture = pictures[count]
                    console.log("picture ", picture)
                    await picture.click()
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'})
                    await page.waitForSelector(".product-item-detail-slider-image.active")
                    console.log("2")
                    const itemName = await page.evaluate(() => document.querySelector(".main-title")?.textContent?.trim().replace('\n', ''))
                    const itemDescription = await page.evaluate(() => document.querySelector(".descr > p")?.textContent)
                    const itemAmount = await page.evaluate(() => document.querySelector(".select__btn-text")?.textContent?.split(' ')).catch(() => {
                        console.log("unique item")
                        return null;
                    });
                    const itemPrice = await page.evaluate(() => document.querySelector(".catalog_element_price.catalog_element_price--current")?.textContent?.split('₽')[0].trim().replace(/\s/g, ''))
                    const itemImage = await page.evaluate(() => document.querySelector(".product-item-detail-slider-image.active > div > img")?.getAttribute('src')?.split('?')[0])
                    let weight = itemAmount ? itemAmount[0] : "1"
                    let units = itemAmount ? itemAmount[1] : "шт"
                    if(units == undefined) {
                        units = "шт"
                        weight = "1"
                    }
                    const dish: Dish = {
                        category: name,
                        name: itemName ?? "unverified",
                        price: itemPrice ?? 0,
                        weight,
                        units,
                        description: itemDescription ?? '',
                        image: this.url + itemImage ?? '',
                        article: count + itemCount
                    }
                    console.log(dish)
                    result.push(dish)
                    await page.goBack()
                }
                itemCount += limit
                await page.evaluate(() => window.scroll(0,0))
                await page.waitForSelector('.cd-dropdown-wrapper > .cd-dropdown-trigger')
                const categoriesButton = await page.$(".cd-dropdown-wrapper > .cd-dropdown-trigger")
                if(categoriesButton == null)
                    throw new Error("Parsing failed")
                await categoriesButton.click()
                await page.waitForSelector('.categories > .mm-listitem > a')
                sections = await page.$$('.categories > .mm-listitem > a')
            } catch(err) {
                console.log("Error while parsing", err)
                break
            }
        }
        return result
    }
}
export default Parser