import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, Lock, Phone, FileText, MapPin, Building2, ArrowLeft, User } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import logoChegapecas from '../../assets/logo-chegapecas.svg';

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1: Dados básicos, 2: Endereço, 3: Senha
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const translateError = (error: any): string => {
    const errorMessage = error?.message || '';
    
    if (errorMessage.includes('already registered') || errorMessage.includes('already been registered')) {
      return 'Este email já está cadastrado. Por favor, faça login ou use outro email.';
    }
    
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Email ou senha inválidos.';
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'Por favor, confirme seu email antes de fazer login.';
    }
    
    if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
      if (errorMessage.includes('cnpj')) {
        return 'Este CNPJ já está cadastrado no sistema.';
      }
      if (errorMessage.includes('email')) {
        return 'Este email já está cadastrado no sistema.';
      }
      if (errorMessage.includes('slug')) {
        return 'Já existe uma loja com este nome. Por favor, escolha outro nome.';
      }
      return 'Já existe um registro com estes dados.';
    }
    
    if (errorMessage.includes('violates foreign key constraint')) {
      return 'Erro ao vincular dados. Entre em contato com o suporte.';
    }
    
    if (errorMessage.includes('violates not-null constraint')) {
      return 'Erro de validação de dados. Verifique se todos os campos foram preenchidos.';
    }
    
    if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
      return 'Erro de configuração do banco de dados. Entre em contato com o suporte.';
    }
    
    if (errorMessage.includes('not found') && errorMessage.includes('column')) {
      return 'Erro na estrutura do banco de dados. Verifique se todas as tabelas foram criadas corretamente.';
    }
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  };

  const generateSlug = (storeName: string): string => {
    const slug = storeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Se o slug estiver vazio após a limpeza, usar um valor padrão
    return slug || 'loja';
  };

  const [formData, setFormData] = useState({
    // Passo 1: Dados da Loja
    storeName: '',
    ownerName: '',
    email: '',
    cnpj: '',
    phone: '',
    
    // Passo 2: Endereço
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Passo 3: Senha
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepBlur = async () => {
    if (formData.cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formData.cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const validateStep1 = () => {
    if (!formData.storeName || !formData.ownerName || !formData.email || !formData.cnpj || !formData.phone) {
      setError('Preencha todos os campos obrigatórios.');
      return false;
    }
    if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(formData.email)) {
      setError('Email inválido.');
      return false;
    }
    if (formData.cnpj.length !== 14) {
      setError('CNPJ deve ter 14 dígitos.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.cep || !formData.street || !formData.number || !formData.city || !formData.state) {
      setError('Preencha todos os campos obrigatórios do endereço.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setLoading(true);

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'store_owner',
            owner_name: formData.ownerName,
          }
        }
      });

      if (authError) {
        setError(translateError(authError));
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Erro ao criar conta.');
        setLoading(false);
        return;
      }

      // 2. CRIAR REGISTRO NA TABELA USERS (ANTES DA LOJA!)
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          role: 'store_owner',
          name: formData.ownerName,
        });

      if (userError) {
        console.error('Erro ao criar usuário na tabela users:', userError);
        setError(translateError(userError));
        setLoading(false);
        return;
      }

      // 3. Gerar slug único
      let slug = generateSlug(formData.storeName);
      let slugAttempt = 0;
      let uniqueSlug = slug;
      const maxAttempts = 100; // Limite de tentativas para evitar loop infinito

      while (slugAttempt < maxAttempts) {
        const { data: existingSlug } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', uniqueSlug)
          .maybeSingle();

        if (!existingSlug) break;

        slugAttempt++;
        uniqueSlug = `${slug}-${slugAttempt}`;
      }

      // Se atingir o limite máximo, usar um timestamp para garantir unicidade
      if (slugAttempt >= maxAttempts) {
        uniqueSlug = `${slug}-${Date.now()}`;
      }

      // 4. Criar registro na tabela stores
      const { error: storeError } = await supabase
        .from('stores')
        .insert({
          owner_id: authData.user.id,
          name: formData.storeName,
          slug: uniqueSlug,
          cnpj: formData.cnpj,
          phone: formData.phone,
          email: formData.email,
          address: {
            cep: formData.cep,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
          is_active: true,
        });

      if (storeError) {
        console.error('Erro ao criar loja:', storeError);
        setError(translateError(storeError));
        setLoading(false);
        return;
      }

      // Sucesso! Redirecionar para login com mensagem
      setError('');
      navigate('/lojista/login', { state: { message: 'Conta criada com sucesso! Faça login para acessar o painel.' } });
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f4461] via-[#1a3a52] to-[#152f44] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/98 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 p-4">
              <img src={logoChegapecas} alt="Chegapeças" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Cadastrar Nova Loja
            </h1>
            <p className="text-gray-600 font-medium">
              Passo {step} de 3 - {step === 1 ? 'Dados da Loja' : step === 2 ? 'Endereço' : 'Senha'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2.5 mx-1 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-gradient-to-r from-[#1f4461] to-[#34abd5]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* PASSO 1: Dados da Loja */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Nome da Loja *</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => handleChange('storeName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="Minha Loja"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Nome do Proprietário *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => handleChange('ownerName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="João Silva"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="contato@minhaloja.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">CNPJ *</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => handleChange('cnpj', e.target.value.replace(/\D/g, ''))}
                      maxLength={14}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="00000000000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-[#1f4461] to-[#34abd5] text-white py-4 rounded-xl font-bold text-base hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg mt-6"
                >
                  Próximo
                </button>
              </div>
            )}

            {/* PASSO 2: Endereço */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">CEP *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleChange('cep', e.target.value.replace(/\D/g, ''))}
                      onBlur={handleCepBlur}
                      maxLength={8}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="00000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Rua *</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Número *</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => handleChange('number', e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Complemento</label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => handleChange('complement', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                    placeholder="Sala, Andar, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Bairro *</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => handleChange('neighborhood', e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Cidade *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Estado *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                    maxLength={2}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                    placeholder="SP"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-[#1f4461] to-[#34abd5] text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 3: Senha */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Mínimo de 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#34abd5]/20 focus:border-[#34abd5] transition-all duration-200 outline-none hover:border-gray-300 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#1f4461] to-[#34abd5] text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600 font-medium">
              Já tem uma conta?{' '}
              <Link to="/lojista/login" className="text-[#34abd5] hover:text-[#1f4461] hover:underline font-bold transition-colors">
                Fazer login
              </Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium">
              <ArrowLeft size={16} />
              Voltar para App do Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
