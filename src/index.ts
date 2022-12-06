import { ExcelWriter } from "./excel";
import Parser from "./supra/parser";
const supra_url = 'https://supravl.ru/';

(async () => {
    console.log("start")
    const supraInstance = new Parser(supra_url);
    const excel = new ExcelWriter();
    const data = await supraInstance.fetchData();
    await excel.write(data);
    console.log("done");
})();