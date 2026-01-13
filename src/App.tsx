import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ViewState, UserProfile, CartItem, Product, FilterCriteria, Order, OrderStatus, PaymentMethodType, AddressData, UserRole } from './types';
import { POPULAR_VEHICLES, STORES as MOCK_STORES } from './services/mockData';
import { dataService } from './services/dataService';
import { analyzeSearchQuery } from './services/geminiService';
import { getBrands, getModels, FipeItem } from './services/fipeService';
import NavBar from './components/layout/NavBar';
import ProductCard from './components/product/ProductCard';
import StoreRating from './components/store/StoreRating';
import SearchableDropdown from './components/common/SearchableDropdown';
import { ENGINE_OPTIONS, VALVE_OPTIONS, FUEL_OPTIONS, TRANSMISSION_OPTIONS } from './constants/vehicles';
import { EXTENDED_FILTERS, COMPONENT_DEPENDENT_FILTERS } from './constants/filters';
import { formatCurrency, formatDate, getStatusLabel, getPaymentMethodInfo, normalizeText } from './utils/formatters';
import { AIIcon, getCategoryIcon } from './utils/icons';
import { fetchAddressApi } from './utils/validators';
import { 
  Search, MapPin, ChevronRight, Sparkles, Filter, Trash2, CheckCircle, Car, 
  ArrowLeft, Loader2, ShoppingCart, Download, X, SlidersHorizontal, ChevronDown,
  Disc, Droplet, Activity, Zap, Package, Settings, CircleDashed, ArrowUp, ArrowDown,
  LogOut, Mail, Lock, User, FileText, Phone, CreditCard, ClipboardList, Banknote,
  Edit2, Share2, Store as StoreIcon, ShieldCheck, Box, LayoutDashboard, Users, DollarSign,
  HelpCircle, Gift, Bell, Save, Wrench, Gauge, GitMerge
} from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Auth & Wizard State
  const [signupStep, setSignupStep] = useState(1); 
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  
  const [authForm, setAuthForm] = useState({ 
    name: '', email: '', password: '', cpfCnpj: '', phone: '', 
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });

  // Profile/Checkout Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<{
     name: string;
     email: string;
     cpfCnpj: string;
     phone: string;
     cep: string;
     street: string;
     number: string;
     complement: string;
     neighborhood: string;
     city: string;
     state: string;
  }>({
     name: '', email: '', cpfCnpj: '', phone: '',
     cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });

  const [showProfileVehicleEdit, setShowProfileVehicleEdit] = useState(false);
  const [showCheckoutAddressEdit, setShowCheckoutAddressEdit] = useState(false);
  const [tempAddress, setTempAddress] = useState<AddressData | null>(null);

  // Vehicle FIPE & Technical State
  const [vehicleType, setVehicleType] = useState<'carros' | 'motos' | 'caminhoes'>('carros');
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [models, setModels] = useState<FipeItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<FipeItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<FipeItem | null>(null);
  const [vehicleYear, setVehicleYear] = useState('');
  
  // New granular vehicle fields
  const [vehicleEngine, setVehicleEngine] = useState(''); // 1.0, 1.6
  const [vehicleValves, setVehicleValves] = useState(''); // 8v, 16v
  const [vehicleFuel, setVehicleFuel] = useState('');     // Flex, Gasolina
  const [vehicleTransmission, setVehicleTransmission] = useState('');

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Commerce State (Consumer)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card_machine');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ type: string; reason: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Updated Filter State with "useMyVehicle" toggle
  const [filters, setFilters] = useState<FilterCriteria>({
    make: '', model: '', year: '', category: '', maxPrice: 5000, sortOrder: '', attributes: {}, useMyVehicle: true
  });

  // --- Derived Data ---
  const uniqueMakes = useMemo(() => Array.from(new Set(POPULAR_VEHICLES.map(v => v.make))), []);
  const availableModels = useMemo(() => {
    if (!filters.make) return [];
    return Array.from(new Set(POPULAR_VEHICLES.filter(v => v.make === filters.make).map(v => v.model)));
  }, [filters.make]);
  const uniqueCategories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  // --- Effects ---
  
  // Load Products from Supabase on Mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProducts(true);
      const data = await dataService.getProducts();
      setProducts(data);
      setSearchResults(data); // Init search results
      setIsLoadingProducts(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if ((currentView === ViewState.SIGNUP && signupStep === 3) || showProfileVehicleEdit) {
      setLoadingBrands(true);
      getBrands(vehicleType).then(data => { setBrands(data); setLoadingBrands(false); });
    }
  }, [vehicleType, signupStep, currentView, showProfileVehicleEdit]);

  useEffect(() => {
    if (selectedBrand) {
      setLoadingModels(true);
      getModels(vehicleType, selectedBrand.codigo).then(data => { setModels(data); setLoadingModels(false); });
    }
  }, [selectedBrand, vehicleType]);

  // --- Login & Role Logic ---
  const handleLogin = (role: UserRole) => {
    // Note: For full Supabase auth, we would call supabase.auth.signInWithPassword() here.
    // Keeping mock auth for now to satisfy the "UI connected" state without requiring user creation flow in DB yet.
    let mockUser: UserProfile = {
      name: 'Usuário Demo',
      role: role,
      email: authForm.email || 'demo@autopecas.com',
      orders: [],
      vehicle: null
    };

    if (role === 'CONSUMER') {
      const pastOrder: Order = {
        id: 'PED-998',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: OrderStatus.COMPLETED,
        total: 150.00,
        shippingCost: 15.00,
        paymentMethod: 'credit_card_machine',
        addressSnapshot: 'Av. Paulista, 1000 - SP',
        items: [{ ...products[0] || {}, quantity: 1 } as any] // Fallback if product not loaded
      };
      mockUser = {
        ...mockUser,
        name: 'Motorista Carlos',
        vehicle: POPULAR_VEHICLES[0], // Onix 1.0 12v
        orders: [pastOrder],
        addressDetails: {
           cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: '',
           neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP'
        },
        cpfCnpj: '123.456.789-00',
        phone: '(11) 99999-9999'
      };
      setCurrentView(ViewState.HOME);
    } else if (role === 'SELLER') {
      mockUser = { ...mockUser, name: 'Loja Auto Peças Central', storeId: 's1', cpfCnpj: '12.345.678/0001-99' };
      setCurrentView(ViewState.DASHBOARD_HOME);
    } else if (role === 'ADMIN') {
      mockUser = { ...mockUser, name: 'Super Admin' };
      setCurrentView(ViewState.DASHBOARD_HOME);
    }
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setSearchQuery('');
    setSearchResults(products);
    setCurrentView(ViewState.LOGIN);
  };

  // --- Commerce Logic ---
  const fetchAddressByCep = async (cepValue: string) => {
    setIsLoadingAddress(true);
    const data = await fetchAddressApi(cepValue);
    if (data) setAuthForm(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }));
    setIsLoadingAddress(false);
  };
  
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      return existing 
        ? prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
        : [...prev, { ...product, quantity: 1 }];
    });
  };
  const handleRemoveFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      // Ensure we switch view to SEARCH when hitting enter immediately
      setCurrentView(ViewState.SEARCH);
      
      // If user is just changing text, DO NOT clear category/attributes filters
      // Logic handled below
    }
    
    setIsSearching(true);
    setAiAnalysis(null);

    try {
      let filtered = products; 
      const currentQuery = searchQuery; // capture current query

      // 1. Text / AI Search
      if (currentQuery.trim()) {
        const analysis = await analyzeSearchQuery(currentQuery, user?.vehicle || null);
        setAiAnalysis({ type: analysis.suggestedPartType, reason: analysis.reasoning });
        
        // Prepare search terms
        const aiKeywords = analysis.keywords || [];
        const aiTypeWords = analysis.suggestedPartType ? analysis.suggestedPartType.split(' ') : [];
        const userWords = currentQuery.split(' ').map(normalizeText).filter(t => t.length > 1);

        // Normalize all keywords for matching
        const normalizedAiTerms = [...new Set([...aiKeywords, ...aiTypeWords])].map(normalizeText).filter(t => t.length > 2);

        // --- SCORING ALGORITHM FOR RELEVANCE ---
        const scoredProducts = products.map(p => {
            const productText = normalizeText(
              `${p.name} ${p.description} ${p.category} ${p.compatibleModels ? p.compatibleModels.join(' ') : ''}`
            );
            
            let score = 0;
            
            // 1. Check User Words (Highest Priority)
            userWords.forEach(word => {
                if (productText.includes(word)) {
                    score += 10; // High score for exact word match
                }
            });

            // 2. Check AI Context Words
            normalizedAiTerms.forEach(word => {
                if (productText.includes(word)) {
                    score += 2; // Lower score for context match
                }
            });

            // 3. Exact Model Match Bonus
            if (user?.vehicle && p.compatibleModels.some(m => normalizeText(m).includes(normalizeText(user.vehicle!.model)))) {
                score += 5;
            }

            return { product: p, score };
        });

        filtered = scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score) // Sort by highest score
            .map(item => item.product);
      }

      // 2. Apply Filters (Secondary filters)
      if (filters.category) filtered = filtered.filter(p => p.category === filters.category);
      if (filters.maxPrice > 0) filtered = filtered.filter(p => p.price <= filters.maxPrice);
      
      // 3. VEHICLE COMPATIBILITY FILTER (Crucial Step)
      if (filters.useMyVehicle && user?.vehicle) {
         // Auto-filter by registered vehicle make/model/engine
         const userMake = user.vehicle.make;
         const userModel = user.vehicle.model;
         
         filtered = filtered.filter(p => {
             // Basic Model Check
             const matchesModel = p.compatibleModels.some(m => normalizeText(m).includes(normalizeText(userModel)));
             if (!matchesModel) return false;

             // Detailed Specs Check (If product has specific requirements)
             if (p.specifications) {
                // If product specifies engine (e.g., '1.0/1.4'), check against user vehicle
                if (p.specifications.engine && user.vehicle?.engine) {
                    if (!p.specifications.engine.includes(user.vehicle.engine)) return false;
                }
                // If product specifies valves (e.g. '8v'), check against user vehicle
                if (p.specifications.valves && user.vehicle?.valves) {
                    if (!p.specifications.valves.includes(user.vehicle.valves)) return false;
                }
             }
             return true;
         });

      } else {
         // Manual Filters (if not using "My Vehicle" or no vehicle registered)
         if (filters.model) {
            filtered = filtered.filter(p => p.compatibleModels.includes(filters.model));
         } else if (filters.make) {
            const modelsForMake = POPULAR_VEHICLES.filter(v => v.make === filters.make).map(v => v.model);
            filtered = filtered.filter(p => p.compatibleModels.some(m => modelsForMake.includes(m)));
         }
      }

      // 4. Dynamic Attribute Filtering (Manual Technical Filters)
      if (filters.attributes && Object.keys(filters.attributes).length > 0) {
        filtered = filtered.filter(p => {
          if (!p.specifications) return false;
          // Check every selected filter attribute
          return Object.entries(filters.attributes!).every(([key, value]) => {
             if (!value) return true; // Ignore empty selections
             const prodValue = p.specifications?.[key];
             // Simple exact match or "Ambos" logic for side/position
             if (key === 'side' && prodValue === 'Ambos') return true;
             if (key === 'position' && prodValue === 'Ambos') return true;
             return prodValue === value;
          });
        });
      }

      // 5. Sorting (Price)
      if (filters.sortOrder === 'asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
      else if (filters.sortOrder === 'desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

      setSearchResults(filtered);
    } catch (err) { 
      console.error(err);
      setSearchResults(products); 
    } finally { 
      setIsSearching(false); 
    }
  };

  const confirmOrder = () => {
    if (!user) return;
    const newOrder: Order = {
      id: `PED-${Math.floor(Math.random() * 10000)}`, date: new Date().toISOString(), status: OrderStatus.PENDING, items: [...cart],
      total: cartTotal + 15, shippingCost: 15, addressSnapshot: user.address || 'Endereço não informado', paymentMethod: paymentMethod
    };
    setUser(prev => prev ? ({ ...prev, orders: [newOrder, ...prev.orders] }) : null);
    setCart([]);
    setCurrentView(ViewState.CHECKOUT_SUCCESS);
  };

  // Profile Edit Handlers
  const handleStartEditingProfile = () => {
     if (user) {
        setProfileForm({
           name: user.name,
           email: user.email || '',
           cpfCnpj: user.cpfCnpj || '',
           phone: user.phone || '',
           ...user.addressDetails || { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
        });
        setIsEditingProfile(true);
     }
  };

  const handleSaveProfile = () => {
     if (user) {
        setUser({
           ...user,
           name: profileForm.name,
           phone: profileForm.phone,
           // Note: Email and CPF are not updated here as they are read-only
           addressDetails: {
              cep: profileForm.cep,
              street: profileForm.street,
              number: profileForm.number,
              complement: profileForm.complement,
              neighborhood: profileForm.neighborhood,
              city: profileForm.city,
              state: profileForm.state
           }
        });
        setIsEditingProfile(false);
     }
  };

  // Helper for address search in profile
  const fetchProfileAddressByCep = async (cepValue: string) => {
    setIsLoadingAddress(true);
    const data = await fetchAddressApi(cepValue);
    if (data) {
        setProfileForm(prev => ({ 
            ...prev, 
            street: data.logradouro, 
            neighborhood: data.bairro, 
            city: data.localidade, 
            state: data.uf 
        }));
    }
    setIsLoadingAddress(false);
  };

  
  const handleOpenProfileVehicleEdit = () => { 
    // Reset inputs to clean state for editing (simplification for mock)
    setSelectedBrand(null); 
    setSelectedModel(null); 
    setVehicleYear('');
    setVehicleEngine('');
    setVehicleValves('');
    setVehicleFuel('');
    setVehicleTransmission('');
    
    // If user has existing vehicle data, pre-fill logic would go here in a real app
    // For now, we force re-selection to ensure data consistency with new fields
    
    setShowProfileVehicleEdit(true); 
  };
  
  const handleSaveProfileVehicle = () => {
     if (user && selectedBrand && selectedModel && vehicleYear && vehicleEngine && vehicleValves && vehicleFuel) {
         setUser({ 
           ...user, 
           vehicle: { 
             id: `v-${Date.now()}`, 
             make: selectedBrand.nome, 
             model: selectedModel.nome, 
             year: parseInt(vehicleYear),
             engine: vehicleEngine,
             valves: vehicleValves,
             fuel: vehicleFuel,
             transmission: vehicleTransmission
           } 
         });
         setShowProfileVehicleEdit(false);
         // Reset Search Context based on new vehicle
         setSearchResults(products);
     } else {
        alert("Por favor, preencha todas as informações do veículo.");
     }
  };
  
  const handleEditCheckoutAddress = () => { if (user?.addressDetails) { setTempAddress(user.addressDetails); setShowCheckoutAddressEdit(true); } };
  const saveCheckoutAddress = () => { if (user && tempAddress) { setUser({ ...user, addressDetails: tempAddress }); setShowCheckoutAddressEdit(false); } };
  
  const handleNextStep = () => { 
      if(signupStep < 3) {
          setSignupStep(s => s+1); 
      } else {
          // Final validation for Step 3
          if (!selectedBrand || !selectedModel || !vehicleYear || !vehicleEngine || !vehicleValves || !vehicleFuel) {
              alert("Preencha todos os dados do veículo!");
              return;
          }
          handleLogin('CONSUMER'); 
      }
  };
  const handlePrevStep = () => { if(signupStep > 1) setSignupStep(s => s-1); else setCurrentView(ViewState.LOGIN); };

  // --- RENDER FUNCTIONS ---

  const renderFilterModal = () => (
    <>
      {showFilterModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilterModal(false)}/>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 relative animate-[slideUp_0.3s_ease-out] max-h-[90dvh] overflow-y-auto pb-safe">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-gray-900">Filtrar Produtos</h3>
               <button onClick={() => setShowFilterModal(false)} className="p-2 rounded-full bg-gray-50 active:bg-gray-100"><X size={18} /></button>
             </div>
             
             <div className="space-y-6">
               
               {/* 1. VEHICLE COMPATIBILITY TOGGLE */}
               {user?.vehicle && (
                   <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               <ShieldCheck size={18} className="text-green-600" />
                               <span className="font-bold text-green-900 text-sm">Compatibilidade Garantida</span>
                           </div>
                           <p className="text-xs text-green-700">Filtrar apenas peças para meu carro</p>
                           <p className="text-[10px] font-bold text-green-800 mt-1 uppercase">
                               {user.vehicle.model} {user.vehicle.engine} {user.vehicle.valves}
                           </p>
                       </div>
                       <div 
                          onClick={() => setFilters(f => ({ ...f, useMyVehicle: !f.useMyVehicle }))}
                          className={`w-12 h-7 rounded-full transition-colors flex items-center p-1 cursor-pointer ${filters.useMyVehicle ? 'bg-green-600' : 'bg-gray-300'}`}
                       >
                           <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${filters.useMyVehicle ? 'translate-x-5' : 'translate-x-0'}`} />
                       </div>
                   </div>
               )}

               {/* Category Filter - MOVED TO TOP to trigger dynamic filters */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria</label>
                 <div className="flex flex-wrap gap-2">
                   {uniqueCategories.map(cat => (
                     <button 
                        key={cat} 
                        onClick={() => {
                             // Reset attributes when changing category
                             setFilters({
                                 ...filters, 
                                 category: filters.category === cat ? '' : cat,
                                 attributes: {} 
                             })
                        }} 
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${filters.category === cat ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200'}`}
                     >
                        {cat}
                     </button>
                   ))}
                 </div>
               </div>

               {/* --- DYNAMIC ATTRIBUTE FILTERS (EXTENDED) --- */}
               {filters.category && EXTENDED_FILTERS[filters.category] && (
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-[fadeIn_0.3s]">
                       <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                           <Settings size={14}/> Especificações: {filters.category}
                       </h4>
                       <div className="grid grid-cols-2 gap-4">
                           {/* 1. RENDER BASE FILTERS (Like "Componente") */}
                           {EXTENDED_FILTERS[filters.category].map((attr) => (
                               <div key={attr.key} className={EXTENDED_FILTERS[filters.category].length % 2 !== 0 && EXTENDED_FILTERS[filters.category].indexOf(attr) === EXTENDED_FILTERS[filters.category].length - 1 ? "col-span-2" : ""}>
                                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{attr.label}</label>
                                   <select 
                                      className="w-full bg-white border border-blue-200 text-gray-700 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-900"
                                      value={filters.attributes?.[attr.key] || ''}
                                      onChange={(e) => {
                                          const newValue = e.target.value;
                                          // Note: If changing "component", we might want to clear specific attrs
                                          // For simplicity in this demo, we assume user adjusts if needed
                                          setFilters(prev => ({
                                              ...prev,
                                              attributes: {
                                                  ...prev.attributes,
                                                  [attr.key]: newValue
                                              }
                                          }));
                                      }}
                                   >
                                       <option value="">Qualquer</option>
                                       {attr.options.map(opt => (
                                           <option key={opt} value={opt}>{opt}</option>
                                       ))}
                                   </select>
                               </div>
                           ))}

                           {/* 2. RENDER COMPONENT-DEPENDENT FILTERS (If component selected) */}
                           {filters.attributes?.['component'] && COMPONENT_DEPENDENT_FILTERS[filters.attributes['component']] && (
                               COMPONENT_DEPENDENT_FILTERS[filters.attributes['component']].map((attr) => (
                                   <div key={attr.key} className="col-span-1 animate-[fadeIn_0.3s]">
                                       <label className="block text-xs font-bold text-blue-700 uppercase mb-1.5">{attr.label}</label>
                                       <select 
                                          className="w-full bg-white border border-blue-300/50 text-gray-700 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-900"
                                          value={filters.attributes?.[attr.key] || ''}
                                          onChange={(e) => {
                                              setFilters(prev => ({
                                                  ...prev,
                                                  attributes: {
                                                      ...prev.attributes,
                                                      [attr.key]: e.target.value
                                                  }
                                              }));
                                          }}
                                       >
                                           <option value="">Qualquer</option>
                                           {attr.options.map(opt => (
                                               <option key={opt} value={opt}>{opt}</option>
                                           ))}
                                       </select>
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
               )}

               {/* Price Filter */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preço Máximo: {formatCurrency(filters.maxPrice)}</label>
                 <input type="range" min="0" max="5000" step="50" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900 touch-manipulation"/>
                 <div className="flex justify-between text-xs text-gray-400 mt-1"><span>{formatCurrency(0)}</span><span>{formatCurrency(5000)}+</span></div>
               </div>

               {/* Make & Model Filters (Disabled if UseMyVehicle is on) */}
               <div className={`grid grid-cols-2 gap-4 ${filters.useMyVehicle && user?.vehicle ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Marca</label>
                   <select value={filters.make} onChange={(e) => setFilters({...filters, make: e.target.value, model: ''})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
                     <option value="">Todas</option>
                     {uniqueMakes.map(make => <option key={make} value={make}>{make}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Modelo</label>
                   <select value={filters.model} onChange={(e) => setFilters({...filters, model: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" disabled={!filters.make}>
                     <option value="">Todos</option>
                     {availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                   </select>
                 </div>
               </div>

               {/* Sorting */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ordenar Por</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setFilters({...filters, sortOrder: 'asc'})} className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border ${filters.sortOrder === 'asc' ? 'bg-blue-50 border-blue-900 text-blue-900' : 'bg-white border-gray-200 text-gray-600'}`}><ArrowUp size={16} /> Menor Preço</button>
                    <button onClick={() => setFilters({...filters, sortOrder: 'desc'})} className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border ${filters.sortOrder === 'desc' ? 'bg-blue-50 border-blue-900 text-blue-900' : 'bg-white border-gray-200 text-gray-600'}`}><ArrowDown size={16} /> Maior Preço</button>
                 </div>
               </div>
               
               {/* Actions */}
               <div className="flex gap-3 mt-8 pb-4">
                 <button onClick={() => { setFilters({ make: '', model: '', year: '', category: '', maxPrice: 5000, sortOrder: '', attributes: {}, useMyVehicle: false }); }} className="flex-1 py-3.5 text-gray-600 font-bold text-[14px] bg-gray-100 rounded-xl">Limpar</button>
                 <button onClick={() => { setShowFilterModal(false); handleSearch(); }} className="flex-[2] py-3.5 text-white font-bold text-[14px] bg-blue-900 rounded-xl shadow-lg">Aplicar Filtros</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </>
  );

  // ... (Rest of component remains identical)
  // [KEEP renderLogin, renderSignupWizard, renderHeader, renderHome, renderSearch, renderCart, renderProductDetail, renderOrders, renderCheckoutConfirmation, renderCheckoutSuccess, renderWebPortalLogin, renderSellerDashboard logic unchanged]
  // Note: Only the renderFilterModal and filter configuration constants were changed above.

  const renderLogin = () => (
    <div className="min-h-[100dvh] bg-blue-900 flex flex-col justify-between px-8 pb-safe pt-safe-plus text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
      <div className="relative z-10 flex flex-col items-center text-center mt-10">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-950/50">
          <Car className="text-blue-900" size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">AutoPeças AI</h1>
        <p className="text-blue-100/80 text-lg max-w-[260px] leading-relaxed">Encontre a peça certa para seu veículo em segundos.</p>
      </div>
      <div className="w-full max-w-sm mx-auto space-y-4 relative z-10 mb-10">
        <button onClick={() => handleLogin('CONSUMER')} className="w-full bg-white text-blue-900 font-bold text-[16px] py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-blue-50">Entrar</button>
        <button onClick={() => { setSignupStep(1); setCurrentView(ViewState.SIGNUP); }} className="w-full bg-blue-800/50 backdrop-blur-sm text-white font-semibold text-[16px] py-4 rounded-2xl border border-blue-700 active:scale-[0.98] transition-all">Criar Conta</button>
        <div className="pt-8 text-center">
          <a href="/lojista/login" className="text-xs text-blue-200/60 font-medium hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5">Trabalhe Conosco: Acesso para Lojistas</a>
        </div>
      </div>
    </div>
  );

  const renderSignupWizard = () => (
    <div className="bg-white min-h-screen pb-safe">
      <div className="p-4 pt-safe-plus flex items-center">
         <button onClick={handlePrevStep} className="p-2 -ml-2"><ArrowLeft /></button>
         <h2 className="font-bold text-lg ml-2">Criar Conta</h2>
      </div>
      <div className="px-6">
        <div className="flex gap-2 mb-8">
           {[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${s <= signupStep ? 'bg-blue-900' : 'bg-gray-200'}`} />)}
        </div>
        {signupStep === 1 && (
          <div className="space-y-4 animate-[fadeIn_0.3s]">
            <h3 className="text-xl font-bold">Seus Dados</h3>
            <input placeholder="Nome Completo" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
            <input placeholder="E-mail" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input type="password" placeholder="Senha" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <input placeholder="CPF/CNPJ" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.cpfCnpj} onChange={e => setAuthForm({...authForm, cpfCnpj: e.target.value})} />
          </div>
        )}
        {signupStep === 2 && (
          <div className="space-y-4 animate-[fadeIn_0.3s]">
             <h3 className="text-xl font-bold">Endereço</h3>
             <div className="flex gap-2">
               <input placeholder="CEP" className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.cep} onChange={e => setAuthForm({...authForm, cep: e.target.value})} onBlur={() => fetchAddressByCep(authForm.cep)} />
               {isLoadingAddress && <div className="flex items-center px-2"><Loader2 className="animate-spin" /></div>}
             </div>
             <input placeholder="Rua" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.street} onChange={e => setAuthForm({...authForm, street: e.target.value})} />
             <div className="flex gap-2">
                <input placeholder="Número" className="w-1/3 p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.number} onChange={e => setAuthForm({...authForm, number: e.target.value})} />
                <input placeholder="Comp." className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.complement} onChange={e => setAuthForm({...authForm, complement: e.target.value})} />
             </div>
             <div className="flex gap-2">
                <input placeholder="Cidade" className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.city} onChange={e => setAuthForm({...authForm, city: e.target.value})} />
                <input placeholder="UF" className="w-20 p-4 bg-gray-50 rounded-xl border border-gray-200" value={authForm.state} onChange={e => setAuthForm({...authForm, state: e.target.value})} />
             </div>
          </div>
        )}
        {signupStep === 3 && (
          <div className="space-y-4 animate-[fadeIn_0.3s]">
             <h3 className="text-xl font-bold">Seu Veículo</h3>
             <p className="text-sm text-gray-500 -mt-2 mb-2">Para garantir a compatibilidade das peças.</p>
             <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
               {(['carros', 'motos', 'caminhoes'] as const).map(t => (
                 <button key={t} onClick={() => setVehicleType(t)} className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize ${vehicleType === t ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500'}`}>
                   {t}
                 </button>
               ))}
             </div>
             
             {/* Make/Model/Year */}
             <SearchableDropdown label="Marca" placeholder="Selecione..." options={brands} value={selectedBrand?.nome || ''} onSelect={setSelectedBrand} isLoading={loadingBrands} />
             <SearchableDropdown label="Modelo" placeholder="Selecione..." options={models} value={selectedModel?.nome || ''} onSelect={setSelectedModel} isLoading={loadingModels} disabled={!selectedBrand} />
             <input type="number" placeholder="Ano (Ex: 2020)" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 mt-1" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} />
             
             {/* Detailed Specs: Engine, Valves, Fuel */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motor</label>
                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl" value={vehicleEngine} onChange={e => setVehicleEngine(e.target.value)}>
                        <option value="">Sel.</option>
                        {ENGINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Válvulas</label>
                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl" value={vehicleValves} onChange={e => setVehicleValves(e.target.value)}>
                        <option value="">Sel.</option>
                        {VALVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Combustível</label>
                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl" value={vehicleFuel} onChange={e => setVehicleFuel(e.target.value)}>
                        <option value="">Sel.</option>
                        {FUEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Câmbio</label>
                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl" value={vehicleTransmission} onChange={e => setVehicleTransmission(e.target.value)}>
                        <option value="">Sel.</option>
                        {TRANSMISSION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
             </div>
          </div>
        )}
        <button onClick={handleNextStep} className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl mt-8 shadow-lg active:scale-[0.98] transition-transform">
          {signupStep === 3 ? 'Finalizar Cadastro' : 'Continuar'}
        </button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="bg-blue-900 text-white p-4 pt-safe-plus pb-8 rounded-b-[2.5rem] shadow-xl z-40 relative">
      <div className="flex items-center justify-between mb-3 mt-2">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight">AutoPeças AI</h1>
          <div className="flex items-center text-blue-100 text-[11px] mt-0.5 font-medium">
            <MapPin size={10} className="mr-1" />
            <span>{user?.addressDetails?.city || "São Paulo"}, {user?.addressDetails?.state || "SP"}</span>
          </div>
        </div>
        <button onClick={() => setCurrentView(ViewState.PROFILE)} className="relative group">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden shadow-sm active:scale-95 transition-transform">
            <img 
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&q=80" 
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
      <form onSubmit={handleSearch} className="relative mb-1">
        <input type="text" placeholder="Busque por peça ou sintoma..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-500 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-colors shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
      </form>
    </header>
  );

  const renderHome = () => (
    <div className="pb-24">
      {renderHeader()}
      <div className="px-4 mt-4">
        {user?.vehicle ? (
           <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-3 shadow-md flex items-center justify-between relative overflow-hidden">
             {/* Decorative background - smaller */}
             <div className="absolute right-0 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

             {/* Left: Info */}
             <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-100 border border-white/5">
                     <Car size={20} />
                 </div>
                 <div>
                     <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wide">Seu Veículo</p>
                     <div className="flex items-baseline gap-1">
                         <h2 className="text-sm font-bold text-white leading-none">{user.vehicle.make} {user.vehicle.model}</h2>
                         <span className="text-xs text-blue-200">• {user.vehicle.year} {user.vehicle.engine} {user.vehicle.valves}</span>
                     </div>
                 </div>
             </div>

             {/* Right: Actions (Compact) */}
             <div className="relative z-10 flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                     onClick={() => setCurrentView(ViewState.PROFILE)}
                     className="p-2 rounded-lg bg-black/20 text-blue-100 hover:bg-black/30 transition-colors"
                  >
                     <Edit2 size={16} />
                  </button>

                  {/* Search Button */}
                  <button
                     onClick={() => { setSearchQuery(`Peças para ${user.vehicle?.model}`); setCurrentView(ViewState.SEARCH); }}
                     className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                     Buscar Peças
                  </button>
             </div>
           </div>
        ) : (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-4 items-center" onClick={() => setCurrentView(ViewState.PROFILE)}>
            <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Car size={20} /></div>
            <div>
              <p className="text-sm font-bold text-gray-800">Cadastre seu veículo</p>
              <p className="text-xs text-gray-600">Para recomendações personalizadas</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-orange-400" />
          </div>
        )}
      </div>

      {/* AI Call to Action Banner */}
      <div className="px-4 mt-6">
        <div 
          onClick={() => {
            setSearchQuery("Barulho estranho ao frear");
            setCurrentView(ViewState.SEARCH);
            setTimeout(() => handleSearch({ preventDefault: () => {} } as any), 100); 
          }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg shadow-gray-900/10 cursor-pointer relative overflow-hidden group active:scale-[0.98] transition-all"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-4 -translate-y-4">
             <AIIcon size={80} className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <AIIcon className="text-yellow-400" size={18} />
              <h2 className="font-semibold text-[16px] tracking-tight">Diagnóstico Inteligente</h2>
            </div>
            <p className="text-gray-300 text-[13px] leading-relaxed mb-4 max-w-[90%]">
              Descreva o problema e nossa IA encontra a peça certa para você.
            </p>
            <div className="flex items-center text-[11px] font-medium text-blue-200">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm flex items-center gap-2">
                 <span className="text-gray-300">Ex:</span> "Carro engasgando"
              </span>
              <ChevronRight size={16} className="ml-auto opacity-70 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-gray-900 mb-4 px-4">Categorias</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 snap-x">
          {uniqueCategories.map(cat => (
             <button key={cat} onClick={() => { setFilters({...filters, category: cat}); setCurrentView(ViewState.SEARCH); }} className="flex flex-col items-center gap-2 min-w-[72px] shrink-0 snap-start">
               <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-900 active:scale-95 transition-transform">
                 {getCategoryIcon(cat)}
               </div>
               <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{cat}</span>
             </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-gray-900">Populares</h3>
          <button onClick={() => setCurrentView(ViewState.SEARCH)} className="text-xs text-blue-900 font-semibold">Ver tudo</button>
        </div>
        <div className="space-y-3">
          {isLoadingProducts ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-sm">Carregando catálogo...</p>
            </div>
          ) : products.slice(0, 5).map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              store={product.store}
              onAdd={handleAddToCart}
              onClick={(p) => { setSelectedProduct(p); setCurrentView(ViewState.PRODUCT_DETAIL); }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
     <div className="pb-24 bg-gray-50 min-h-screen">
       <div className="bg-blue-900 text-white pt-safe-plus pb-8 px-6 rounded-b-[2rem] shadow-lg mb-6">
         <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-2xl font-bold">
             {user?.name.charAt(0)}
           </div>
           <div>
             <h2 className="text-xl font-bold">{user?.name}</h2>
             <p className="text-blue-200 text-sm">{user?.email}</p>
           </div>
         </div>
       </div>
       <div className="px-4 space-y-3">
         
         {/* --- Personal Data Editing Section --- */}
         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2 text-gray-900">
                <User size={20} className="text-blue-900" />
                <h3 className="font-bold">Meus Dados</h3>
             </div>
             {!isEditingProfile && (
               <button onClick={handleStartEditingProfile} className="text-blue-900 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg">
                 Editar
               </button>
             )}
           </div>

           {isEditingProfile ? (
             <div className="space-y-4 animate-[fadeIn_0.2s]">
               {/* Identity Fields */}
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
               </div>
               
               <div className="flex gap-3">
                  <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">Email <Lock size={10}/></label>
                      <input className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" value={profileForm.email} disabled />
                  </div>
                   <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">CPF <Lock size={10}/></label>
                      <input className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" value={profileForm.cpfCnpj} disabled />
                  </div>
               </div>
               
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Telefone</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
               </div>

               {/* Address Fields embedded in profile edit */}
               <div className="pt-2 border-t border-gray-100 mt-2">
                   <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2"><MapPin size={14}/> Endereço</h4>
                   <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="w-1/3 relative">
                           {isLoadingAddress && <div className="absolute right-2 top-3"><Loader2 className="animate-spin" size={14}/></div>}
                           <input placeholder="CEP" className="w-full p-3 bg-gray-50 border rounded-xl" value={profileForm.cep} onChange={e => setProfileForm({...profileForm, cep: e.target.value})} onBlur={() => fetchProfileAddressByCep(profileForm.cep)} />
                        </div>
                        <input placeholder="Cidade" className="flex-1 p-3 bg-gray-50 border rounded-xl" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} />
                      </div>
                      <input placeholder="Rua" className="w-full p-3 bg-gray-50 border rounded-xl" value={profileForm.street} onChange={e => setProfileForm({...profileForm, street: e.target.value})} />
                      <div className="flex gap-2">
                        <input placeholder="Num" className="w-1/3 p-3 bg-gray-50 border rounded-xl" value={profileForm.number} onChange={e => setProfileForm({...profileForm, number: e.target.value})} />
                        <input placeholder="Bairro" className="flex-1 p-3 bg-gray-50 border rounded-xl" value={profileForm.neighborhood} onChange={e => setProfileForm({...profileForm, neighborhood: e.target.value})} />
                      </div>
                   </div>
               </div>

               <div className="flex gap-3 pt-2">
                 <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 text-gray-500 font-bold text-sm bg-gray-100 rounded-xl">Cancelar</button>
                 <button onClick={handleSaveProfile} className="flex-1 py-3 text-white font-bold text-sm bg-blue-900 rounded-xl shadow-md flex items-center justify-center gap-2"><Save size={16}/> Salvar</button>
               </div>
             </div>
           ) : (
             <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-900"><User size={16}/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Nome</p>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  </div>
               </div>
               <div className="flex gap-4">
                   <div className="flex-1 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><Mail size={16}/></div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      </div>
                   </div>
               </div>
               <div className="flex gap-4">
                   <div className="flex-1 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><FileText size={16}/></div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">CPF</p>
                        <p className="text-sm font-medium text-gray-900">{user?.cpfCnpj || '-'}</p>
                      </div>
                   </div>
                   <div className="flex-1 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-900"><Phone size={16}/></div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Telefone</p>
                        <p className="text-sm font-medium text-gray-900">{user?.phone || '-'}</p>
                      </div>
                   </div>
               </div>
               <div className="flex items-start gap-3 pt-2 border-t border-gray-50 mt-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 shrink-0"><MapPin size={16}/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Endereço</p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                       {user?.addressDetails ? `${user.addressDetails.street}, ${user.addressDetails.number} - ${user.addressDetails.neighborhood}` : 'Não informado'}
                    </p>
                    <p className="text-xs text-gray-500">
                       {user?.addressDetails ? `${user.addressDetails.city} - ${user.addressDetails.state}` : ''}
                    </p>
                  </div>
               </div>
             </div>
           )}
         </div>

         {/* --- Vehicle Editing Section --- */}
         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2 text-gray-900">
                <Car size={20} className="text-blue-900" />
                <h3 className="font-bold">Meu Veículo</h3>
             </div>
             {!showProfileVehicleEdit && (
               <button onClick={handleOpenProfileVehicleEdit} className="text-blue-900 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg">
                 Alterar
               </button>
             )}
           </div>

           {showProfileVehicleEdit ? (
             <div className="space-y-4 animate-[fadeIn_0.2s]">
               <div className="flex p-1 bg-gray-100 rounded-xl mb-2">
                 {(['carros', 'motos', 'caminhoes'] as const).map(t => (
                   <button key={t} onClick={() => setVehicleType(t)} className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize ${vehicleType === t ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500'}`}>
                     {t}
                   </button>
                 ))}
               </div>
               
               <SearchableDropdown label="Marca" placeholder="Selecione..." options={brands} value={selectedBrand?.nome || ''} onSelect={setSelectedBrand} isLoading={loadingBrands} />
               <SearchableDropdown label="Modelo" placeholder="Selecione..." options={models} value={selectedModel?.nome || ''} onSelect={setSelectedModel} isLoading={loadingModels} disabled={!selectedBrand} />
               <input type="number" placeholder="Ano Ex: 2020" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 mt-1" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} />

               {/* Engine Specs */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motor</label>
                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl" value={vehicleEngine} onChange={e => setVehicleEngine(e.target.value)}>
                        <option value="">Sel.</option>
                        {ENGINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Válvulas</label>
                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl" value={vehicleValves} onChange={e => setVehicleValves(e.target.value)}>
                        <option value="">Sel.</option>
                        {VALVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
               </div>
               
               <div className="flex gap-3 pt-2">
                 <button onClick={() => setShowProfileVehicleEdit(false)} className="flex-1 py-3 text-gray-500 font-bold text-sm bg-gray-100 rounded-xl">Cancelar</button>
                 <button onClick={handleSaveProfileVehicle} className="flex-1 py-3 text-white font-bold text-sm bg-blue-900 rounded-xl shadow-md">Salvar</button>
               </div>
             </div>
           ) : (
             <div className="flex items-center justify-between p-2">
               <div>
                  <div className="flex items-center gap-2">
                     <p className="font-bold text-lg text-gray-800">{user?.vehicle?.make} {user?.vehicle?.model}</p>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">{user?.vehicle?.year}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                          <Gauge size={12} /> {user?.vehicle?.engine} {user?.vehicle?.valves}
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                          <Droplet size={12} /> {user?.vehicle?.fuel}
                      </div>
                  </div>
               </div>
               <CheckCircle size={20} className="text-green-500 opacity-20" />
             </div>
           )}
         </div>

         <button onClick={handleLogout} className="w-full bg-white p-4 rounded-xl text-red-600 font-medium flex items-center gap-3 shadow-sm border border-gray-100 mt-4">
           <LogOut size={20} /> Sair da Conta
         </button>
       </div>
     </div>
  );

  // ... (Rest of component methods like renderSearch, renderCart, etc. remain unchanged)
  // [KEEP renderSearch, renderCart, renderProductDetail, renderOrders, renderCheckoutConfirmation, renderCheckoutSuccess, renderWebPortalLogin, renderSellerDashboard logic unchanged]
  const renderSearch = () => (
    <div className="pb-24">
      {renderHeader()}
      <div className="px-4 mt-4">
        <h2 className="font-bold text-lg mb-4">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Buscar Produtos'}
        </h2>
        
        {aiAnalysis && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                    <div className="mt-1"><Sparkles size={18} className="text-blue-600" /></div>
                    <div>
                        <h4 className="font-bold text-sm text-blue-900 mb-1">Análise da IA</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">{aiAnalysis.reason}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 uppercase">
                                Sugestão: {aiAnalysis.type}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
             <button onClick={() => setShowFilterModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 whitespace-nowrap">
                 <Filter size={14} /> Filtros
             </button>
             {filters.category && (
                 <button onClick={() => setFilters({...filters, category: ''})} className="flex items-center gap-2 px-3 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold whitespace-nowrap">
                     {filters.category} <X size={12} />
                 </button>
             )}
        </div>

        {isSearching ? (
             <div className="text-center py-20">
                 <Loader2 className="animate-spin mx-auto text-blue-900 mb-2" />
                 <p className="text-gray-400 text-sm">Buscando as melhores opções...</p>
             </div>
        ) : (
            <div className="space-y-3">
                {searchResults.length > 0 ? (
                    searchResults.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          store={product.store}
                          onAdd={handleAddToCart}
                          onClick={(p) => { setSelectedProduct(p); setCurrentView(ViewState.PRODUCT_DETAIL); }}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>Nenhum produto encontrado.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="bg-white min-h-screen flex flex-col pb-safe">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between pt-safe-plus sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
            {/* Added back button to navigate out of cart */}
            <button onClick={() => setCurrentView(ViewState.HOME)} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
            <h2 className="font-bold text-xl">Carrinho ({cart.reduce((acc, i) => acc + i.quantity, 0)})</h2>
        </div>
        {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-red-500 text-xs font-bold flex items-center gap-1">
                <Trash2 size={14} /> Limpar
            </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
             <ShoppingCart size={64} className="mb-4 opacity-20" />
             <p className="font-medium">Seu carrinho está vazio</p>
             <button onClick={() => setCurrentView(ViewState.HOME)} className="mt-4 text-blue-900 font-bold text-sm">
                 Continuar Comprando
             </button>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
               <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.store?.name}</p>
                  <div className="flex justify-between items-end">
                      <p className="font-bold text-blue-900">{formatCurrency(item.price)}</p>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <button onClick={() => item.quantity > 1 ? handleUpdateQuantity(item.id, -1) : handleRemoveFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600">
                              {item.quantity === 1 ? <Trash2 size={12} /> : '-'}
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600">+</button>
                      </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                  <span className="text-gray-500">Entrega Estimada</span>
                  <span className="font-medium text-green-600">R$ 15,00</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal + 15)}</span>
              </div>
              <button 
                onClick={() => {
                    if (user?.addressDetails) {
                        setTempAddress(user.addressDetails);
                    }
                    setCurrentView(ViewState.CHECKOUT_CONFIRMATION);
                }} 
                className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform flex justify-between px-6"
              >
                  <span>Fechar Pedido</span>
                  <ChevronRight />
              </button>
          </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="bg-white min-h-screen pb-safe relative">
        {/* Header Image */}
        <div className="h-72 bg-gray-100 relative">
           <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
           <button onClick={() => setCurrentView(ViewState.SEARCH)} className="absolute top-safe left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
               <ArrowLeft size={24} />
           </button>
        </div>

        <div className="px-5 -mt-6 relative z-10 bg-white rounded-t-3xl pt-6">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">
                    {selectedProduct.category}
                </span>
                {selectedProduct.store && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                        <StoreIcon size={12} />
                        <span className="truncate max-w-[100px]">{selectedProduct.store.name}</span>
                        <StoreRating rating={selectedProduct.store.rating} size={10} />
                    </div>
                )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{selectedProduct.name}</h1>
            <p className="text-2xl font-bold text-blue-900 mb-6">{formatCurrency(selectedProduct.price)}</p>

            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" /> Descrição
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedProduct.description}</p>
                </div>

                {selectedProduct.specifications && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                            <Settings size={16} className="text-gray-400" /> Especificações Técnicas
                        </h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{key.replace('_', ' ')}</p>
                                    <p className="text-sm font-medium text-gray-800">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Car size={18} className="text-gray-400" /> Compatibilidade
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedProduct.compatibleModels.map(model => (
                            <span key={model} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                                {model}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-24"></div> 
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button 
                onClick={() => {
                    handleAddToCart(selectedProduct);
                    setCurrentView(ViewState.CART);
                }}
                className="w-full bg-blue-900 text-white font-bold text-lg py-4 rounded-xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <ShoppingCart size={20} />
                Adicionar ao Carrinho
            </button>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="pb-24">
       <div className="bg-white p-4 pt-safe-plus border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <h2 className="font-bold text-xl text-gray-900">Meus Pedidos</h2>
       </div>
       <div className="p-4 space-y-4">
          {!user?.orders || user.orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                  <ClipboardList size={48} className="mx-auto mb-3 opacity-20"/>
                  <p>Você ainda não fez nenhum pedido.</p>
              </div>
          ) : (
              user.orders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                          <div>
                              <p className="font-bold text-gray-900">{order.id}</p>
                              <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                              order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                              order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                              {getStatusLabel(order.status)}
                          </span>
                      </div>
                      <div className="space-y-2 mb-3">
                          {order.items.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-sm text-gray-600 truncate">
                                  {item.quantity}x {item.name}
                              </p>
                          ))}
                          {order.items.length > 2 && <p className="text-xs text-gray-400">e mais {order.items.length - 2} itens...</p>}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                          <p className="font-bold text-blue-900">{formatCurrency(order.total)}</p>
                          <button className="text-blue-900 text-xs font-bold border border-blue-900 px-3 py-1.5 rounded-lg active:bg-blue-50">
                              Detalhes
                          </button>
                      </div>
                  </div>
              ))
          )}
       </div>
    </div>
  );

  const renderCheckoutConfirmation = () => {
    const selectedMethod = getPaymentMethodInfo(paymentMethod);
    const MethodIcon = selectedMethod.icon;

    return (
      <div className="bg-gray-50 min-h-screen pb-safe flex flex-col">
        <div className="bg-white p-4 pt-safe-plus flex items-center shadow-sm">
           <button onClick={() => setCurrentView(ViewState.CART)} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
           <h2 className="font-bold text-lg ml-2">Confirmar Pedido</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {/* Address Card */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-gray-900 flex items-center gap-2"><MapPin size={18} className="text-blue-900"/> Endereço de Entrega</h3>
                   <button onClick={handleEditCheckoutAddress} className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded">Alterar</button>
               </div>
               
               {showCheckoutAddressEdit ? (
                   <div className="space-y-3 animate-[fadeIn_0.2s]">
                        <input placeholder="Rua" className="w-full p-3 bg-gray-50 border rounded-xl text-sm" value={tempAddress?.street} onChange={e => setTempAddress(prev => prev ? {...prev, street: e.target.value} : null)} />
                        <div className="flex gap-2">
                            <input placeholder="Num" className="w-1/3 p-3 bg-gray-50 border rounded-xl text-sm" value={tempAddress?.number} onChange={e => setTempAddress(prev => prev ? {...prev, number: e.target.value} : null)} />
                            <input placeholder="Bairro" className="flex-1 p-3 bg-gray-50 border rounded-xl text-sm" value={tempAddress?.neighborhood} onChange={e => setTempAddress(prev => prev ? {...prev, neighborhood: e.target.value} : null)} />
                        </div>
                        <button onClick={saveCheckoutAddress} className="w-full bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold">Salvar Endereço</button>
                   </div>
               ) : (
                   <div className="text-sm text-gray-600 leading-relaxed ml-6">
                       <p className="font-medium text-gray-900">{user?.name}</p>
                       <p>{user?.addressDetails?.street}, {user?.addressDetails?.number}</p>
                       <p>{user?.addressDetails?.neighborhood} - {user?.addressDetails?.city}/{user?.addressDetails?.state}</p>
                   </div>
               )}
           </div>

           {/* Payment Method */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><CreditCard size={18} className="text-blue-900"/> Forma de Pagamento</h3>
               <div className="space-y-2">
                   {(['credit_card_machine', 'pix', 'cash'] as const).map(method => {
                       const info = getPaymentMethodInfo(method);
                       const MIcon = info.icon;
                       return (
                           <button 
                             key={method}
                             onClick={() => setPaymentMethod(method)}
                             className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentMethod === method ? 'bg-blue-50 border-blue-900 text-blue-900' : 'bg-white border-gray-100 text-gray-600'}`}
                           >
                               <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === method ? 'border-blue-900' : 'border-gray-300'}`}>
                                   {paymentMethod === method && <div className="w-2.5 h-2.5 bg-blue-900 rounded-full" />}
                               </div>
                               <MIcon size={20} />
                               <span className="font-medium text-sm">{info.label}</span>
                           </button>
                       );
                   })}
               </div>
           </div>

           {/* Summary */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-3">Resumo</h3>
               <div className="space-y-2 text-sm">
                   <div className="flex justify-between text-gray-600">
                       <span>Produtos</span>
                       <span>{formatCurrency(cartTotal)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                       <span>Frete</span>
                       <span>{formatCurrency(15)}</span>
                   </div>
                   <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-lg text-gray-900">
                       <span>Total</span>
                       <span>{formatCurrency(cartTotal + 15)}</span>
                   </div>
               </div>
           </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
            <button onClick={confirmOrder} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-transform">
                Confirmar Pedido
            </button>
        </div>
      </div>
    );
  };

  const renderCheckoutSuccess = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-[fadeIn_0.5s]">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle size={48} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h1>
        <p className="text-gray-500 mb-8 max-w-[250px]">
            Seu pedido foi encaminhado para a loja e logo sairá para entrega.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-2xl w-full max-w-sm mb-8 border border-gray-100">
            <p className="text-sm text-gray-500 uppercase font-bold mb-1">Código do Pedido</p>
            <p className="text-2xl font-mono font-bold text-blue-900">{user?.orders[0]?.id}</p>
        </div>

        <button onClick={() => setCurrentView(ViewState.HOME)} className="w-full max-w-sm bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg">
            Voltar ao Início
        </button>
    </div>
  );

  const renderWebPortalLogin = () => {
    // Redirect to the new lojista panel route
    window.location.href = '/lojista/login';
    return null;
  };

  const renderSellerDashboard = () => (
    <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 text-white hidden md:flex flex-col p-6">
            <h1 className="text-xl font-bold mb-10 flex items-center gap-2"><Car size={24}/> AutoPeças <span className="text-blue-300">Pro</span></h1>
            <nav className="space-y-2 flex-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-800 rounded-lg font-medium"><LayoutDashboard size={20}/> Visão Geral</button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-800 rounded-lg font-medium text-blue-100"><Box size={20}/> Produtos</button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-800 rounded-lg font-medium text-blue-100"><ClipboardList size={20}/> Pedidos</button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-800 rounded-lg font-medium text-blue-100"><Users size={20}/> Clientes</button>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 text-blue-200 hover:text-white"><LogOut size={20}/> Sair</button>
        </div>
        
        {/* Mobile Header */}
        <div className="flex-1 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex justify-between items-center md:hidden">
                <span className="font-bold text-blue-900">AutoPeças Pro</span>
                <button onClick={handleLogout}><LogOut size={20} className="text-gray-600"/></button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Olá, {user?.name}</h2>
                        <p className="text-gray-500">Aqui está o resumo da sua loja hoje.</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-500">Data</p>
                        <p className="font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-100 rounded-lg text-green-600"><DollarSign size={24}/></div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                        </div>
                        <p className="text-gray-500 text-sm">Faturamento Hoje</p>
                        <h3 className="text-2xl font-bold text-gray-900">R$ 1.250,00</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Package size={24}/></div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">+5</span>
                        </div>
                        <p className="text-gray-500 text-sm">Pedidos Pendentes</p>
                        <h3 className="text-2xl font-bold text-gray-900">8</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><Activity size={24}/></div>
                        </div>
                        <p className="text-gray-500 text-sm">Produtos Ativos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                    </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-800 mb-4">Pedidos Recentes</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-bold text-gray-500">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[1,2,3].map(i => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">#PED-{1000+i}</td>
                                    <td className="p-4">Cliente Exemplo {i}</td>
                                    <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Pendente</span></td>
                                    <td className="p-4">R$ 150,00</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );

  // --- Main Render ---
  if (currentView === ViewState.LOGIN) return renderLogin();
  if (currentView === ViewState.SIGNUP) return <div className="w-full md:max-w-[480px] mx-auto">{renderSignupWizard()}</div>;
  if (currentView === ViewState.WEB_PORTAL_LOGIN) return renderWebPortalLogin();
  if (currentView === ViewState.WEB_PORTAL_REGISTER) return renderWebPortalLogin(); // Simplified
  if (user?.role === 'SELLER' || user?.role === 'ADMIN') return renderSellerDashboard();

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-safe">
      {renderFilterModal()}

      {currentView === ViewState.HOME && renderHome()}
      {currentView === ViewState.SEARCH && renderSearch()}
      {currentView === ViewState.CART && renderCart()}
      {currentView === ViewState.PRODUCT_DETAIL && renderProductDetail()}
      {currentView === ViewState.ORDERS && renderOrders()}
      {currentView === ViewState.PROFILE && renderProfile()}
      {currentView === ViewState.CHECKOUT_CONFIRMATION && renderCheckoutConfirmation()}
      {currentView === ViewState.CHECKOUT_SUCCESS && renderCheckoutSuccess()}
      
      {/* Conditionally render NavBar only when NOT in full-screen detail views */}
      {currentView !== ViewState.PRODUCT_DETAIL && 
       currentView !== ViewState.CHECKOUT_CONFIRMATION && 
       currentView !== ViewState.CART && ( // Hide navbar in CART as requested
        <NavBar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        />
      )}
    </div>
  );
};

export default App;