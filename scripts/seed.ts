const {PrismaClient} = require('@prisma/client')

const database = new PrismaClient()

async function main() {
   try{
     await database.category.createMany({
        data: [
            { name: 'Oil' },
            { name: 'Pencil' },
            { name: 'Pastil' },
            { name: 'Water color' },
            { name: 'Digital' },
            { name: 'Design' },
            { name: 'Realism' },
        ]
     })

     console.log('Categories seeded successfully!')
   }catch (error) {
        console.error('Error seeding database:', error)
   }finally{
        await database.$disconnect()
   }
}

main()