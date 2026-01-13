import { StoreReview } from '../../types/lojista';
import { Star, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface ReviewCardProps {
  review: StoreReview;
  onResponseAdded?: () => void;
}

export default function ReviewCard({ review, onResponseAdded }: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState(review.store_response || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      alert('Por favor, escreva uma resposta');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('store_reviews')
        .update({
          store_response: response,
          store_response_at: new Date().toISOString(),
        })
        .eq('id', review.id);

      if (error) throw error;

      alert('Resposta enviada com sucesso!');
      setShowResponseForm(false);
      onResponseAdded?.();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
          {review.customer_name[0].toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{review.customer_name}</p>
              {renderStars(review.rating)}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              {new Date(review.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700">{review.comment}</p>
          )}

          {/* Store Response */}
          {review.store_response && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Resposta da Loja
              </p>
              <p className="text-sm text-gray-700">{review.store_response}</p>
              {review.store_response_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.store_response_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )}

          {/* Response Form */}
          {!review.store_response && !showResponseForm && (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Responder avaliação
            </button>
          )}

          {showResponseForm && (
            <div className="mt-3 space-y-2">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Escreva sua resposta..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitResponse}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar Resposta'}
                </button>
                <button
                  onClick={() => setShowResponseForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
