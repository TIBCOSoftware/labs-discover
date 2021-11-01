import { Injectable } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AnalysisMetrics } from '../backend/model/analysisMetrics';
import { ChartOptions } from 'chart.js';
import { DateTime, Duration } from 'luxon';

export interface ChartMetrics {
  status: string;
  code: number;
  data: Data;
}

export interface Data {
  Organisation: string;
  JobName: string;
  analysisID: string;
  Metrics: any;
  DurationDB: number;
  DurationJob: number;
  TimeStamp: number;
}
export interface SummaryConfig {
  events: number;
  cases: number;
  variants: number;
  activities: number;
  resources: number;
  timespan: string;
  timespanHint: string;
}

export interface ChartConfig {
  summaryConfig: SummaryConfig;
  activitiesChartConfig: any;
  durationChartConfig: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(protected decimalPipe: DecimalPipe) {
  }

  public buildChartConfig(metrics: AnalysisMetrics): ChartConfig {
    let duration: string;
    const years = DateTime.fromISO(metrics.maxTimestamp).diff(DateTime.fromISO(metrics.minTimestamp), ["years"]).years;
    if (years >= 1) {
      duration = Math.floor(years) + '+ years';
    } else {
      const months = DateTime.fromISO(metrics.maxTimestamp).diff(DateTime.fromISO(metrics.minTimestamp), ["months"]).months;
      if (months >= 1) {
        duration = Math.floor(months) + '+ months';
      } else {
        const days = DateTime.fromISO(metrics.maxTimestamp).diff(DateTime.fromISO(metrics.minTimestamp), ["days"]).days;
        if (days >= 1) {
          duration = Math.floor(days) + '+ days';
        } else {
          const minutes = DateTime.fromISO(metrics.maxTimestamp).diff(DateTime.fromISO(metrics.minTimestamp), ["minutes"]).minutes;
          if (minutes >= 1) {
            duration = Math.floor(minutes) + '+ minutes';
          } else {
            duration = '<1 minute';
          }
        }
      }
    }

    return {
      summaryConfig: {
        events: metrics.numEvents,
        cases: metrics.numCases,
        variants: metrics.numVariants,
        activities: metrics.numActivities,
        resources: metrics.numResources,
        timespan: duration,
        timespanHint: DateTime.fromISO(metrics.minTimestamp).toFormat('LLL dd, yyyy') + ' - ' + DateTime.fromISO(metrics.maxTimestamp).toFormat('LLL dd, yyyy')

      } as SummaryConfig,
      activitiesChartConfig: this.buildActivitiesChartConfig(metrics),
      durationChartConfig: this.buildDurationChartConfig(metrics)
    } as ChartConfig;
  }

  public buildActivitiesChartConfig(metrics: any): any {
    const options: ChartOptions<'bar'> = {
      responsive: true,
      layout: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      scales: {
        y: {
          ticks: { padding: 10 },
          title: {
            text: 'Num. of activities',
            display: true,
            font: {
              family: 'Source Sans Pro',
              size: 14
            }
          },
          grid: {
            drawBorder: false,
            display: true,
            z: 0
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };

    return {
      options: options,
      labels: ['Min', 'Average', 'Max'],
      type: 'bar',
      legend: false,
      plugins: [],
      chartData: [
        {
          data: [metrics.minActivities, this.decimalPipe.transform(metrics.avgActivities), metrics.maxActivities],
          label: 'Activities',
          backgroundColor: ['#D1CCED', '#ABA6E0', '#9893DA'],
          maxBarThickness: 60
        }
      ]
    }
  }

  buildDurationChartConfig(metrics: AnalysisMetrics): any {
    const options: ChartOptions<'bar'> = {
      responsive: true,
      layout: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      indexAxis: 'y',
      scales: {
        y: {
          grid: {
            display: false,
          }
        },
        x: {
          ticks: {
            padding: 10,
          },
          suggestedMin: 0,
          min: 0,
          title: {
            text: 'Time (days)',
            display: true,
            font: {
              family: 'Source Sans Pro',
              size: 14
            }
          },
          grid: {
            drawBorder: false,
            display: true,
            z: 0
          }
        }
      }
    }

    return {
      options: options,
      // labels: [ 'Average', 'Median', 'Max', 'Min' ],
      labels: [ 'Average', 'Median' ],
      type: 'bar',
      legend: false,
      plugins: [],
      chartData: [
        {
          // data: [this.decimalPipe.transform(metrics.avgTime), metrics.medianTime, metrics.maxTime, metrics.minTime],
          data: [this.decimalPipe.transform(metrics.avgTime), metrics.medianTime],
          label: 'Time',
          // backgroundColor: ['#AFD899', '#AFD899', '#AFD899', '#AFD899'],
          backgroundColor: ['#AFD899', '#AFD899'],
          maxBarThickness: 60
        }
      ]
    };
  }
}
