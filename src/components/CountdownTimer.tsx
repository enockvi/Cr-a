import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface CountdownTimerProps {
  order: Order;
  mode?: 'client' | 'admin' | 'badge';
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  order,
  mode = 'client',
  className = '',
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Only tick if not delivered yet and order is paid
    if (order.status === 'livree' || order.status === 'notee' || !order.dueAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [order.status, order.dueAt]);

  // If delivered, show delivery duration: "Livrée en 17 h 42"
  if (order.status === 'livree' || order.status === 'notee') {
    let durationText = 'Livrée dans les délais';
    if (order.paidAt && order.deliveredAt) {
      const diffMs = new Date(order.deliveredAt).getTime() - new Date(order.paidAt).getTime();
      const diffHours = Math.floor(diffMs / (3600 * 1000));
      const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
      durationText = `Livrée en ${diffHours} h ${diffMins < 10 ? '0' : ''}${diffMins}`;
    }

    if (mode === 'badge') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F7EE] text-[#1E6B45]">
          <CheckCircle2 className="w-3 h-3 text-[#2FB36D]" />
          {durationText}
        </span>
      );
    }

    return (
      <div className={`p-4 rounded-2xl bg-[#E8F7EE] text-[#1E6B45] text-center border border-[#C6E9D4] ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <CheckCircle2 className="w-5 h-5 text-[#2FB36D]" />
          <span className="font-semibold text-sm">Commande livrée avec succès</span>
        </div>
        <p className="font-mono text-2xl font-bold tracking-tight text-[#0F5331]">{durationText}</p>
      </div>
    );
  }

  // If unpaid
  if (!order.dueAt || order.status === 'en_attente_paiement' || order.status === 'brouillon') {
    return (
      <div className="text-xs text-[#6C6C70] italic">
        Décompteur activé dès confirmation du paiement
      </div>
    );
  }

  const dueTime = new Date(order.dueAt).getTime();
  const diffMs = dueTime - now;
  const isLate = diffMs <= 0;
  const absDiff = Math.abs(diffMs);

  const totalHours = Math.floor(absDiff / (3600 * 1000));
  const minutes = Math.floor((absDiff % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((absDiff % (60 * 1000)) / 1000);

  const formattedHours = String(totalHours).padStart(2, '0');
  const formattedMins = String(minutes).padStart(2, '0');
  const formattedSecs = String(seconds).padStart(2, '0');
  const timeString = `${formattedHours}:${formattedMins}:${formattedSecs}`;

  // Color rules according to Section 6.5:
  // Vert > 6 h, Orange <= 6 h, Rouge <= 2 h, "En retard" au-delà
  let alertLevel: 'green' | 'orange' | 'red' | 'late' = 'green';
  if (isLate) {
    alertLevel = 'late';
  } else if (totalHours < 2) {
    alertLevel = 'red';
  } else if (totalHours < 6) {
    alertLevel = 'orange';
  }

  if (mode === 'badge') {
    const badgeColors = {
      green: 'bg-[#E3F3F4] text-[#0A5F67]',
      orange: 'bg-[#FFF3DC] text-[#8A5A00]',
      red: 'bg-[#FEECEE] text-[#B91C1C] animate-pulse',
      late: 'bg-[#7F1D1D] text-white animate-pulse',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${badgeColors[alertLevel]}`}>
        {isLate ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {isLate ? `En retard +${formattedHours}h${formattedMins}` : timeString}
      </span>
    );
  }

  if (mode === 'admin') {
    const adminBg = {
      green: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      orange: 'bg-amber-50 text-amber-900 border-amber-200',
      red: 'bg-rose-50 text-rose-900 border-rose-300',
      late: 'bg-red-600 text-white border-red-700',
    };
    return (
      <div className={`p-3 rounded-xl border text-center ${adminBg[alertLevel]} ${className}`}>
        <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80 mb-0.5">
          {isLate ? 'Délai 24h dépassé' : 'Délai de livraison restant'}
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight">
          {isLate ? `+ ${formattedHours} h ${formattedMins} m` : timeString}
        </div>
      </div>
    );
  }

  // Client view
  return (
    <div className={`bg-white rounded-2xl p-5 text-center shadow-xs border border-[#E5E5EA] ${className}`}>
      <p className="text-xs text-[#6C6C70] mb-1 font-medium">Temps restant pour votre invitation</p>
      <div className="font-mono text-4xl font-bold tracking-tight text-[#0A5F67] my-1 select-none">
        {isLate ? (
          <span className="text-[#E5484D] text-2xl">Finalisation prioritaire en cours...</span>
        ) : (
          timeString
        )}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#6C6C70] mt-1">
        <Clock className="w-3.5 h-3.5 text-[#0E7C86]" />
        <span>Garantie de livraison sous 24 heures</span>
      </div>
    </div>
  );
};
