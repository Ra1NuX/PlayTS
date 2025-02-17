import { HTMLAttributes } from "react";

const merge = (...classname: HTMLAttributes<HTMLElement>['className'][]) => {
    return `${classname.join(' ')}`;
}

export default merge;