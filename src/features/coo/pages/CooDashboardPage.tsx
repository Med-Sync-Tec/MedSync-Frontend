import React from 'react';
import { StatCard } from '@ui/cards/StatCard';

const mockStats = {
  totalProductos:  { value: 142 },
  stockCritico:    { value: 7, badge: '3 urgentes' },
  pedidosPendientes: { value: 4 },
  valorInventario: { value: 289 },
};

export const CooDashboardPage: React.FC = () => {
  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div
          className="relative overflow-hidden rounded-2xl text-white p-6 shadow-xl flex flex-col justify-between min-h-[180px]"
          style={{ background: 'linear-gradient(135deg, var(--color-welcome-from) 0%, var(--color-welcome-to) 100%)' }}
        >
          <div className="absolute top-5 right-5 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
            <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-white/80">inventory_2</span>
          </div>

          <div className="relative z-10 pr-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 text-blue-100 px-2.5 py-1 rounded-full mb-3">
              <span className="material-symbols-outlined text-[14px]">business_center</span>
              PANEL OPERACIONES
            </span>
            <h1 className="text-xl sm:text-2xl font-bold">Panel de Operaciones</h1>
            <p className="text-blue-100 text-sm mt-1">
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/5 select-none pointer-events-none">
            warehouse
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            label="Total Productos"
            value={mockStats.totalProductos.value}
            icon={<span className="material-symbols-outlined text-xl">category</span>}
            iconBg="var(--color-info-subtle)"
            iconColor="var(--color-info)"
          />
          <StatCard
            label="Stock Crítico"
            value={mockStats.stockCritico.value}
            icon={<span className="material-symbols-outlined text-xl">emergency</span>}
            badge={mockStats.stockCritico.badge}
            badgeVariant="warning"
            iconBg="var(--color-danger-subtle)"
            iconColor="var(--color-danger)"
          />
          <StatCard
            label="Pedidos Pendientes"
            value={mockStats.pedidosPendientes.value}
            icon={<span className="material-symbols-outlined text-xl">local_shipping</span>}
            iconBg="var(--color-caution-subtle)"
            iconColor="var(--color-caution)"
          />
          <StatCard
            label="Productos (miles)"
            value={mockStats.valorInventario.value}
            icon={<span className="material-symbols-outlined text-xl">analytics</span>}
            iconBg="var(--color-success-subtle)"
            iconColor="var(--color-success-strong)"
          />
        </div>

      </div>

    </main>
  );
};
