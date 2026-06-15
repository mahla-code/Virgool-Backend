import { PaginationDto } from "../dtos/pagination.dto";

export function PaginatioSolver(paginatioDto:PaginationDto){
    let {limit=10,page=0}=paginatioDto
    if(!page || page<=1)page=0
    else page=page-1
    if(!limit || limit<=0)limit=10
    let skip=limit*page
    return{
        page:page===0?1:page,
        limit,
        skip
    }
}
export function PaginationGenerator(count:number=0,page:number=0,limit:number=0){
    return{
        totalcount:count,
        page:+page,
        limit:+limit,
        pagecount:Math.ceil(count/limit)
    }
}