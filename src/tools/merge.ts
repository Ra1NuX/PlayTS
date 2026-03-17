import { HTMLAttributes } from "react";

export function classNames(...classname: HTMLAttributes<HTMLElement>['className'][]): string {
    return `${classname.join(' ')}`;
}

export default classNames;
