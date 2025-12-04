import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';
// Removed PrimeNG calendar; using custom date inputs
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TelemetryService } from '../../shared/telemetry.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, ButtonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  readings: Array<{ temp: number; hum: number; timestamp_local: string; timestamp_utc: string }> = [];

  filteredReadings = [...this.readings];
  pagedReadings = [...this.filteredReadings];
  totalRecords = this.filteredReadings.length;
  first = 0; // index of the first record for paginator
  rows = 25;
  startDate: string | null = null; // format: YYYY-MM-DD
  endDate: string | null = null;   // format: YYYY-MM-DD

  tempChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  humChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e6e8ef' }
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        ticks: { color: '#a0a8bd', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { color: '#2a3046' }
      },
      y: {
        ticks: { color: '#a0a8bd' },
        grid: { color: '#2a3046' }
      }
    }
  };

  // Manual pagination state
  currentPage = 1;
  totalPages = 1;

  get avgTemp(): number {
    return Number((this.filteredReadings.reduce((s, r) => s + r.temp, 0) / this.filteredReadings.length).toFixed(2));
  }

  get avgHum(): number {
    return Number((this.filteredReadings.reduce((s, r) => s + r.hum, 0) / this.filteredReadings.length).toFixed(2));
  }

  constructor(private router: Router, private telemetry: TelemetryService) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.loadInitialData();
  }

  private loadInitialData() {
    // cargar últimos 20 para gráficas
    this.telemetry.getLatest(20).subscribe(({ items }) => {
      // Mantener orden por timestamp_local tal como viene (desc)
      this.readings = items;
      this.filteredReadings = [...this.readings];
      this.totalRecords = this.filteredReadings.length;
      this.updateCharts();
      this.updatePaged();
    });

    // cargar primera página para tabla con tamaño fijo 25
    this.telemetry.getPage(1, 25).subscribe(({ items, total }) => {
      // usar datos paginados para la tabla; mantener filteredReadings sincronizado con página
      this.filteredReadings = items;
      this.totalRecords = total;
      this.first = 0;
      this.rows = 25;
      this.currentPage = 1;
      this.totalPages = Math.max(1, Math.ceil(total / this.rows));
      this.updatePaged();
    });
  }

  applyFilter() {
    if (!this.startDate || !this.endDate) {
      this.filteredReadings = [...this.readings];
    } else {
      const start = new Date(this.startDate + 'T00:00:00').getTime();
      const end = new Date(this.endDate + 'T23:59:59').getTime();
      this.filteredReadings = this.readings.filter(r => {
        const t = new Date(r.timestamp_utc).getTime();
        return t >= start && t <= end;
      });
    }
    this.first = 0;
    this.totalRecords = this.filteredReadings.length;
    this.updateCharts();
    this.updatePaged();
  }

  resetFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filteredReadings = [...this.readings];
    this.first = 0;
    this.totalRecords = this.filteredReadings.length;
    this.updateCharts();
    this.updatePaged();
  }

  exportCSV() {
    const header = 'temp,hum,timestamp_local,timestamp_utc\n';
    const rows = this.filteredReadings.map(r => `${r.temp},${r.hum},"${r.timestamp_local}",${r.timestamp_utc}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecturas.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private updateCharts() {
    // Graficas deben mostrar los últimos 20 registros, usando etiquetas compactas (HH:mm)
    const latest20 = this.readings.slice(0, 20);
    const labels = latest20.map(r => {
      const t = new Date(r.timestamp_utc);
      return t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    });
    const tempData = latest20.map(r => r.temp);
    const humData = latest20.map(r => r.hum);

    this.tempChartData = {
      labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: tempData,
          borderColor: '#6d79ff',
          backgroundColor: 'rgba(109,121,255,0.2)',
          tension: 0.3,
          fill: false,
        }
      ]
    };

    this.humChartData = {
      labels,
      datasets: [
        {
          label: 'Humedad (%)',
          data: humData,
          borderColor: '#4fd1c5',
          backgroundColor: 'rgba(79,209,197,0.25)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  }

  private updatePaged() {
    // Server-side pagination: items already represent the current page
    this.pagedReadings = this.filteredReadings;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.first = 0; // keep 0 for server-side pages
    this.telemetry.getPage(page, this.rows).subscribe(({ items, total }) => {
      this.filteredReadings = items;
      this.totalRecords = total;
      this.totalPages = Math.max(1, Math.ceil(total / this.rows));
      this.updatePaged();
    });
  }

  prevPage() { this.goToPage(this.currentPage - 1); }
  nextPage() { this.goToPage(this.currentPage + 1); }

  getPageNumbers(): number[] {
    const windowSize = 3; // show up to 3 page numbers centered
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - Math.floor(windowSize / 2));
    const end = Math.min(this.totalPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    for (let p = adjustedStart; p <= end; p++) pages.push(p);
    return pages;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
