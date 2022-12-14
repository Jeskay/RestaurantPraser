import { ExcelWriter } from "./excel";
import Parser from "./supra/parser";
import Parser2 from "./perviy/parser"
const supra_url = 'https://supravl.ru/';
const perviy_url = 'https://perviyonline.ru/';

(async () => {
    console.log("start")
    // Супра
    const supraInstance = new Parser(supra_url);
    const excel = new ExcelWriter();
    const data = await supraInstance.fetchData();
    await excel.write(data);
    //Первый парфюмерный
    const perviyInstance = new Parser2(perviy_url)
    const data2 = await perviyInstance.fetchData()
    console.log("Result data: ", data2)
    await excel.write(data2)
    console.log("done");
})();