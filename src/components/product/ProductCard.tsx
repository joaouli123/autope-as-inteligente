import React, { useState } from 'react';
import { Product, Store } from '../../types';
import StoreRating from '../store/StoreRating';
import { Plus, ImageOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  store?: Store;
  onAdd: (product: Product) => void;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, store, onAdd, onClick }) => {
  // Simple formatter for BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price);

  // Fallback image logic
  const [imageError, setImageError] = useState(false);
  // Default placeholder if image fails - using a reliable generic car part image or a color placeholder
  const fallbackImage = "https://placehold.co/300x300/e2e8f0/1e3a8a?text=Sem+Imagem";

  return (
    <div 
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200/60 flex gap-4 active:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick(product)}
    >
      {/* Image Section */}
      <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative flex items-center justify-center">
        {!imageError ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
             <ImageOff size={24} className="mb-1 opacity-50"/>
             <span className="text-[9px] font-medium leading-tight">Img Indisponível</span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight line-clamp-2 mb-1">
            {product.name}
          </h3>
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 inline-block">
            {product.category}
          </span>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            {store && (
              <div className="flex items-center gap-1 mb-0.5 opacity-80">
                <span className="text-[11px] text-gray-500 truncate max-w-[100px]">{store.name}</span>
                <StoreRating rating={store.rating} size={10} />
              </div>
            )}
            <div className="text-blue-900 font-bold text-lg leading-none">
              {formattedPrice}
            </div>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="w-8 h-8 flex items-center justify-center bg-blue-900 text-white rounded-full shadow-sm active:scale-90 transition-transform"
            aria-label="Adicionar"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;