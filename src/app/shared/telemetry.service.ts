import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TelemetryItem {
  temp: number;
  hum: number;
  timestamp_local: string;
  timestamp_utc: string;
}

interface PageResult {
  items: TelemetryItem[];
  total: number;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  // Ajusta la URL base según el backend (env var o constante)
  private baseUrl = (window as any).API_BASE_URL || 'https://proyecto-esp.vercel.app';

  constructor(private http: HttpClient) {}

  getLatest(n: number): Observable<PageResult> {
    return this.http.get<PageResult>(`${this.baseUrl}/api/datos`, { params: { limit: n } });
  }

  getPage(page: number, pageSize: number): Observable<PageResult> {
    return this.http.get<PageResult>(`${this.baseUrl}/api/datos`, { params: { page, pageSize } });
  }
}
