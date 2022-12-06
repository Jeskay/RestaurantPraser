import puppeteer, { Browser } from "puppeteer"
import { Dish } from "../interfaces";

class Parser {
    private url: string;
    private browser: Browser;

    constructor(url: string) {
        this.url = url;
    }

    private async init() {
        this.browser = await puppeteer.launch({ headless: false, timeout: 10000, defaultViewport: {width:1920, height: 1080}})
        return await this.browser.newPage()
    }

    public async fetchData() {
        const page = await this.init()
        await page.goto(this.url, {waitUntil:'domcontentloaded'})
        await page.waitForTimeout(3000)
        const sections = await page.$$('section')
        let dishCount = 0;
        const result: Dish[] = []
        for(let section of sections){
            const name = await page.evaluate((el) => el.querySelector('h2')?.innerText, section).catch((err) => {
                console.error(err)
                return 'none'
            });
            try {
                const limit = await page.evaluate((el)=> el.querySelectorAll("a[class^='ProductCard_ProductCard__imageWrapper__'], a[class*=' ProductCard_ProductCard__imageWrapper__]").length, section);
            for(let count = 0; count < limit; count++){
                const pictures = await page.$$("a[class^='ProductCard_ProductCard__imageWrapper__'], a[class*=' ProductCard_ProductCard__imageWrapper__]")
                const picture = pictures[count + dishCount]
                await picture.click().catch();
                const res = await page.waitForSelector("h1[class^='Product_Product__heading__'], h1[class*=' Product_Product__heading__]").catch(async() => {
                    console.log("Page was not found")
                    await page.goBack()
                    await page.waitForSelector("a[class^='ProductCard_ProductCard__imageWrapper__'], a[class*=' ProductCard_ProductCard__imageWrapper__]")
                    return true
                })
                if(res == true) {
                    console.log("skipping")
                    continue
                }
                    
                const dishName = await page.evaluate(() => document.querySelector("h1[class^='Product_Product__heading__'], h1[class*=' Product_Product__heading__]")?.innerHTML)
                if(dishName == undefined) {
                    console.log("Page was not found")
                    await page.goBack()
                    await page.waitForSelector("a[class^='ProductCard_ProductCard__imageWrapper__'], a[class*=' ProductCard_ProductCard__imageWrapper__]")
                    continue
                }
                const dishDescription = await page.evaluate(() => document.querySelector("div[class^='Product_Product__text__'], div[class*=' Product_Product__text__]")?.innerHTML)
                const dishPrice = await page.evaluate(() => document.querySelector("div[class^='Product_Product__price__'], div[class*=' Product_Product__price__]")?.children[0].innerHTML)
                let dishAmount = await page.evaluate(() => document.querySelector("div[class^='Product_Product__size__'], div[class*=' Product_Product__size__]")?.innerHTML)
                const dishPicture = await page.evaluate(() => document.querySelector("img[class^='Product_Product__image__'], img[class*=' Product_Product__image__]")?.getAttribute('src')?.split('?')[0])
                dishAmount = dishAmount?.replace('/&nbsp;', '').replace('<!-- -->', '')
                const dishWeight = dishAmount?.split(' ')[0];
                const dishUnits = dishAmount?.split(' ')[1];
                const dish: Dish = {
                    category: name ?? 'none',
                    name: dishName ?? 'unverified',
                    price: dishPrice ?? 0,
                    weight: dishWeight ?? 1,
                    units: dishUnits ?? "шт.",
                    description: dishDescription ?? "",
                    image: dishPicture ?? "",
                    article: count + dishCount
                };
                console.log(dish)
                result.push(dish)
                await page.goBack()
                await page.waitForSelector("a[class^='ProductCard_ProductCard__imageWrapper__'], a[class*=' ProductCard_ProductCard__imageWrapper__]")
            }
            dishCount += limit;
            } catch (err) {
                return result;
            }
            
        };
        return result
    }
}
export default Parser;