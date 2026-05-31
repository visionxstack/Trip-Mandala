import React from 'react';

export const NPR_TO_USD_RATE = 1 / 135;

export const formatCurrency = (nprAmount) => {
  if (!nprAmount || isNaN(nprAmount)) return { usd: 0, npr: 0 };
  const npr = Math.round(nprAmount);
  const usd = (nprAmount * NPR_TO_USD_RATE).toFixed(0);
  return { usd, npr };
};

/**
 * CurrencyDisplay — shows NPR primary + USD secondary.
 * Props:
 *   nprAmount  {number} — price in NPR
 *   compact    {bool}   — single-line inline variant for small cards
 */
export const CurrencyDisplay = ({ nprAmount, compact = false }) => {
  const { usd, npr } = formatCurrency(nprAmount);

  if (compact) {
    return React.createElement(
      'span',
      { className: 'font-semibold text-neutral-900 text-sm' },
      'NPR ' + Number(npr).toLocaleString(),
      React.createElement('span', { className: 'font-normal text-neutral-500 text-xs ml-1' }, '\u2248 $' + usd + ' USD'),
      React.createElement('span', { className: 'font-normal text-neutral-400 text-xs' }, ' / night')
    );
  }

  return React.createElement(
    'div',
    { className: 'flex flex-col' },
    React.createElement(
      'span',
      { className: 'font-bold text-[#2A2A2A] text-base' },
      'NPR ' + Number(npr).toLocaleString(),
      React.createElement('span', { className: 'font-normal text-[#6B6B6B] text-xs' }, ' / night')
    ),
    React.createElement('span', { className: 'text-xs text-neutral-500' }, '\u2248 $' + usd + ' USD / night')
  );
};
