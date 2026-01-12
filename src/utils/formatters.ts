import { OrderStatus, PaymentMethodType } from '../types';
import { CreditCard, Banknote, CheckCircle } from 'lucide-react';

// Currency Formatter
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Date Formatter
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date);
};

// Order Status Label
export const getStatusLabel = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Processando',
    [OrderStatus.CONFIRMED]: 'Confirmado',
    [OrderStatus.DELIVERING]: 'Em Trânsito',
    [OrderStatus.COMPLETED]: 'Entregue',
    [OrderStatus.CANCELLED]: 'Cancelado'
  };
  return map[status] || status;
};

// Payment Method Info
export const getPaymentMethodInfo = (method: PaymentMethodType) => {
  switch (method) {
    case 'credit_card_machine': return { label: 'Cartão (Maquininha)', icon: CreditCard };
    case 'cash': return { label: 'Dinheiro', icon: Banknote };
    case 'pix': return { label: 'Pix', icon: CheckCircle };
    default: return { label: '-', icon: CreditCard };
  }
};

// Text normalization for search (removes accents and lowercases)
export const normalizeText = (text: string) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
};
