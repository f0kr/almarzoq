"use client"

import { Category } from "@prisma/client"
import { IconType } from "react-icons/lib"
import {IoMdColorPalette, IoIosBrush} from "react-icons/io"
import {GiThrownCharcoal} from "react-icons/gi"
import {FaPencil} from "react-icons/fa6"
import {LuFileDigit} from "react-icons/lu"
import {MdDesignServices} from "react-icons/md"
import CategoryItem from "./CategoryItem"


interface CategoriesProps {
    items: Category[]
}

const iconMap: Record<Category["name"], IconType> = {
    "Oil": IoMdColorPalette,
    "Water color": IoIosBrush,
    "Charcoal": GiThrownCharcoal,
    "Pencil": FaPencil,
    "Digital": LuFileDigit,
    "Design": MdDesignServices
}



export default function Categories({
    items,
}: CategoriesProps){
   return(
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
       {items.map((item)=> (
        <CategoryItem
        key={item.id}
        label={item.name}
        icon={iconMap[item.name]}
        value={item.id}
        >

        </CategoryItem>
       ))}
    </div>
   )
}