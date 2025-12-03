import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, CalendarModule, ButtonModule, PaginatorModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  readings = [
    { temp: 26, hum: 43, timestamp_local: '20/11/2025, 9:14:39 p.m.', timestamp_utc: '2025-11-21T03:14:39.000Z' },
    { temp: 26, hum: 43, timestamp_local: '20/11/2025, 9:14:28 p.m.', timestamp_utc: '2025-11-21T03:14:28.000Z' },
    { temp: 26, hum: 43, timestamp_local: '20/11/2025, 9:14:17 p.m.', timestamp_utc: '2025-11-21T03:14:17.000Z' },
    { temp: 26, hum: 43, timestamp_local: '20/11/2025, 9:14:06 p.m.', timestamp_utc: '2025-11-21T03:14:06.000Z' },
    { temp: 26, hum: 42, timestamp_local: '20/11/2025, 9:13:55 p.m.', timestamp_utc: '2025-11-21T03:13:55.000Z' },
    { temp: 26, hum: 42, timestamp_local: '20/11/2025, 9:13:44 p.m.', timestamp_utc: '2025-11-21T03:13:44.000Z' }
  ];

  filteredReadings = [...this.readings];
  pagedReadings = [...this.filteredReadings];
  totalRecords = this.filteredReadings.length;
  first = 0; // index of the first record for paginator
  rows = 10;
  dateRange: Date[] | null = null;

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
        ticks: { color: '#a0a8bd' },
        grid: { color: '#2a3046' }
      },
      y: {
        ticks: { color: '#a0a8bd' },
        grid: { color: '#2a3046' }
      }
    }
  };

  // UI-only IoT interval demo (random 4-60)
  iotInterval = 15;
  generating = false;
  flipAnim = false;
  dialDashoffset = 0;
  private readonly dialCircumference = 339; // must match SVG dasharray

  generateNewInterval() {
    if (this.generating) return;
    this.generating = true;
    this.flipAnim = true;
    const target = Math.floor(Math.random() * (60 - 4 + 1)) + 4;
    // simple animated tween + dial update
    const start = this.iotInterval;
    const steps = 20;
    let current = 0;

    const updateDial = () => {
      const normalized = (this.iotInterval - 4) / (60 - 4);
      const progress = Math.max(0, Math.min(1, normalized));
      this.dialDashoffset = this.dialCircumference * (1 - progress);
    };

    const tick = () => {
      current++;
      this.iotInterval = Math.round(start + (target - start) * (current / steps));
      updateDial();
      if (current < steps) {
        setTimeout(tick, 30);
      } else {
        this.generating = false;
        setTimeout(() => { this.flipAnim = false; }, 150);
      }
    };
    updateDial();
    tick();
  }

  get avgTemp(): number {
    return Number((this.filteredReadings.reduce((s, r) => s + r.temp, 0) / this.filteredReadings.length).toFixed(2));
  }

  get avgHum(): number {
    return Number((this.filteredReadings.reduce((s, r) => s + r.hum, 0) / this.filteredReadings.length).toFixed(2));
  }

  constructor(private router: Router) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.updateCharts();
    this.updatePaged();
    // initialize dial offset
    const normalized = (this.iotInterval - 4) / (60 - 4);
    const progress = Math.max(0, Math.min(1, normalized));
    this.dialDashoffset = this.dialCircumference * (1 - progress);
  }

  applyFilter() {
    if (!this.dateRange || this.dateRange.length < 2) {
      this.filteredReadings = [...this.readings];
    } else {
      const start = new Date(this.dateRange[0]).getTime();
      const end = new Date(this.dateRange[1]).getTime();
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
    this.dateRange = null;
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
    const labels = this.filteredReadings.map(r => r.timestamp_local);
    const tempData = this.filteredReadings.map(r => r.temp);
    const humData = this.filteredReadings.map(r => r.hum);

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
    const startIndex = this.first;
    const endIndex = startIndex + this.rows;
    this.pagedReadings = this.filteredReadings.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaged();
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
