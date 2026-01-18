import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useLojistaAuth } from '../../contexts/LojistaAuthContext';
import logoChegapecas from '../../assets/logo-chegapecas.svg';

export default function LojistaLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useLojistaAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from signup
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/lojista/dashboard');
      } else {
        setError('Credenciais inválidas.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f4461] via-[#1a3a52] to-[#152f44] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#34abd5] rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#e99950] rounded-full mix-blend-overlay filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#34abd5] rounded-full mix-blend-overlay filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/98 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/30">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 p-4">
              <img src={logoChegapecas} alt="Chegapeças" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Portal do Vendedor
            </h1>
            <p className="text-gray-600 text-base font-medium">Gerencie sua loja e vendas</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1f4461] to-[#34abd5] text-white py-4 rounded-xl font-bold text-base hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600 font-medium">
              Não tem uma conta?{' '}
              <Link to="/lojista/cadastro" className="text-[#34abd5] hover:text-[#1f4461] hover:underline font-bold transition-colors">
                Cadastrar loja
              </Link>
            </p>
            
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:gap-3 transition-all duration-200 font-medium"
            >
              <ArrowLeft size={16} />
              Voltar para App do Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
