import { PaginatedResult } from '../models/pagination';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

const getHttpParams = <R>(tParams: R): HttpParams => {
    let params = new HttpParams();
    for (const prop of Object.keys(tParams)) {
      params = params.append(prop, tParams[prop].toString());
    }
    return params;
  }

export function getPaginatedResult<T, R>(url, rParam, http: HttpClient) {
    const params = getHttpParams<R>(rParam);
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T> ();
    return http.get<T>(url, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          paginatedResult.pagination = response.headers.get('Pagination') ? JSON.parse(response.headers.get('Pagination')) : null;
          return paginatedResult;
        })
      );
  }