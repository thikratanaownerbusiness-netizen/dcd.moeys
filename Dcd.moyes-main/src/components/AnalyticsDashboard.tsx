/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Asset, StockItem, MaintenanceRecord } from '../types';
import { OFFICES, CATEGORIES } from '../data/mockData';
import { ShieldCheck, AlertTriangle, Hammer, Package, Layers, MapPin } from 'lucide-react';
import { Language, translations, getOfficeName, getCategoryName } from '../data/translations';

interface AnalyticsDashboardProps {
  assets: Asset[];
  stockItems: StockItem[];
  maintenance: MaintenanceRecord[];
  lang: Language;
}

export default function AnalyticsDashboard({ assets, stockItems, maintenance, lang }: AnalyticsDashboardProps) {
  const t = translations[lang];

  // 1. Calculate General Stats
  const totalAssetsCount = assets.reduce((sum, a) => sum + a.quantity, 0);
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.cost * a.quantity), 0);
  
  const lowStockItems = stockItems.filter(item => item.currentBalance <= item.minStock);
  const lowStockCount = lowStockItems.length;

  const totalMaintenanceCost = maintenance.reduce((sum, r) => sum + r.cost, 0);

  // 2. Prepare Category Wise Chart Data
  const categoryStats = CATEGORIES.map(cat => {
    const catAssets = assets.filter(a => a.category === cat.id);
    const count = catAssets.reduce((sum, a) => sum + a.quantity, 0);
    const value = catAssets.reduce((sum, a) => sum + (a.cost * a.quantity), 0);
    return {
      ...cat,
      name: getCategoryName(cat.id, lang),
      count,
      value
    };
  });

  const maxCategoryValue = Math.max(...categoryStats.map(c => c.value), 1);

  // 3. Prepare Office Wise Chart Data
  const officeStats = OFFICES.map(off => {
    const offAssets = assets.filter(a => a.officeId === off.id);
    const count = offAssets.reduce((sum, a) => sum + a.quantity, 0);
    const value = offAssets.reduce((sum, a) => sum + (a.cost * a.quantity), 0);
    return {
      ...off,
      name: getOfficeName(off.id, lang),
      count,
      value
    };
  });

  const maxOfficeCount = Math.max(...officeStats.map(o => o.count), 1);

  // Number formatting helper
  const formatNumber = (num: number | string) => {
    if (lang === 'KM') {
      const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      return num.toString().split('').map(char => {
        if (char >= '0' && char <= '9') {
          return khmerDigits[parseInt(char, 10)];
        }
        return char;
      }).join('');
    }
    return num.toString();
  };

  const formatCurrency = (value: number) => {
    if (lang === 'KM') {
      if (value >= 1000000) {
        const millions = value / 1000000;
        return formatNumber(millions.toFixed(2)) + ' លានរៀល';
      }
      return formatNumber(value.toLocaleString('en-US')) + ' រៀល';
    } else {
      return value.toLocaleString('en-US') + ' KHR';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Assets */}
        <div className="liquid-glass p-6 rounded-2xl flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{t.totalAssets}</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {formatNumber(totalAssetsCount)}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{lang === 'KM' ? 'គ្រឿង/ក្បាល' : 'units'}</span>
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              {lang === 'KM' ? 'ស្ថានភាពគ្រប់គ្រងមានសុវត្ថិភាព' : 'State records secure'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-450">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Estimated Value */}
        <div className="liquid-glass p-6 rounded-2xl flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{t.totalCost}</span>
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(totalAssetsValue)}</h3>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold">{lang === 'KM' ? 'គិតជាទំហំហិរញ្ញវត្ថុទ្រព្យរដ្ឋ' : 'Total valuation value'}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span className="text-xl font-extrabold select-none">៛</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="liquid-glass p-6 rounded-2xl flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{t.lowStockItems}</span>
            <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {formatNumber(lowStockCount)}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{lang === 'KM' ? 'មុខទំនិញ' : 'items'}</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              {lowStockCount > 0 
                ? (lang === 'KM' ? 'ត្រូវការកម្មង់ចូលស្តុកជាបន្ទាន់' : 'Requires reorder soon') 
                : (lang === 'KM' ? 'កម្រិតស្តុកមានសុវត្ថិភាព' : 'Stock level safe')}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Maintenance Cost */}
        <div className="liquid-glass p-6 rounded-2xl flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{lang === 'KM' ? 'ចំណាយថែទាំជួសជុល' : 'Maintenance Expenses'}</span>
            <h3 className="text-2xl font-black text-rose-700 dark:text-rose-455">{formatCurrency(totalMaintenanceCost)}</h3>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold">{lang === 'KM' ? 'សរុបថវិកាជួសជុលដែលបានអនុវត្ត' : 'Aggregated repair expenses'}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-455">
            <Hammer className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* 2. Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category-wise values */}
        <div className="liquid-glass p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              {t.financialDistribution}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{t.rielsLabel}</span>
          </div>

          <div className="space-y-4">
            {categoryStats.map(cat => {
              const percentage = (cat.value / maxCategoryValue) * 100;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${cat.color.split(' ')[0]}`}></span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(cat.value)}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-1 font-semibold">({formatNumber(cat.count)} {lang === 'KM' ? 'ឯកតា' : 'units'})</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        cat.id === 'FURNITURE' ? 'bg-amber-500' :
                        cat.id === 'TECHNOLOGY' ? 'bg-blue-500' :
                        cat.id === 'BOOKS' ? 'bg-emerald-500' :
                        cat.id === 'VEHICLE' ? 'bg-purple-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Office-wise Asset Quantities */}
        <div className="liquid-glass p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              {t.officeDistribution}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{t.unitsLabel}</span>
          </div>

          <div className="space-y-4">
            {officeStats.map(off => {
              const percentage = (off.count / maxOfficeCount) * 100;
              return (
                <div key={off.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={off.name}>{off.name}</span>
                    <span className="font-black text-slate-800 dark:text-slate-100">{formatNumber(off.count)} {lang === 'KM' ? 'គ្រឿង' : 'units'}</span>
                  </div>
                  <div className="w-full bg-slate-50 dark:bg-slate-800/40 h-6 rounded-lg flex items-center px-1 overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div 
                      className="bg-blue-600/85 dark:bg-blue-500/85 h-4 rounded-md transition-all duration-1000 flex items-center justify-end px-1.5"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-[10px] text-white font-black font-mono">
                          {formatNumber(Math.round((off.count / totalAssetsCount) * 100))}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Low Stock Items Warning Grid */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-bounce" />
            <h4 className="font-bold text-sm">
              {lang === 'KM' 
                ? 'បញ្ជីសន្និធិសម្ភារៈការិយាល័យដែលត្រូវបញ្ជាទិញបន្ថែម (Stock Warning)' 
                : 'Office Supplies Requiring Immediate Reorder (Stock Warning)'}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(item => (
              <div key={item.id} className="liquid-glass p-4 rounded-xl flex justify-between items-center transition-all hover:scale-[1.01]">
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{item.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {lang === 'KM' 
                      ? `ឯកតា៖ ${item.unit} | អប្បបរមា៖ ${formatNumber(item.minStock)}` 
                      : `Unit: ${item.unit} | Safety Min: ${formatNumber(item.minStock)}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black px-2 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                    {lang === 'KM' ? `សល់ ${formatNumber(item.currentBalance)}` : `Left: ${formatNumber(item.currentBalance)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
