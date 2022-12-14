import { Workbook, Worksheet } from "exceljs"
import { Dish } from "../interfaces"

export class ExcelWriter {
    private workbook: Workbook
    private worksheet: Worksheet

    constructor(){
        this.workbook = new Workbook()
        this.workbook.created = new Date()
        this.worksheet = this.workbook.addWorksheet('Main')
    }

    public async write(dishes: Dish[], fileName: string = 'dishes') {
        const input = dishes.map(dish => [dish.category, dish.article, dish.name, dish.price, dish.weight, dish.units, dish.description, dish.calories, dish.proteins, dish.fats, dish.carbohydrate, dish.image])
        this.worksheet.insertRows(3, input)
        await this.workbook.xlsx.writeFile(fileName + '.xlsx')
    }
}