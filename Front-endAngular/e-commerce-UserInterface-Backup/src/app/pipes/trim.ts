import { Pipe, PipeTransform } from '@angular/core';
import { pipe } from 'rxjs';

@Pipe({
  name: 'trimString',
})
export class TrimStr implements PipeTransform {
  transform(value: string, length: number): string {
    let newvalue = value.slice(0, length);
    return `${newvalue}...`;
  }
}
