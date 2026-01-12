# 📱 AutoPeças IA - Mobile App (Expo)

Aplicativo mobile para iOS e Android construído com React Native + Expo.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Expo Go app instalado no seu celular ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Instalação

```bash
cd mobile
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar .env com suas chaves reais
nano .env
```

Preencha com suas credenciais do Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Executar

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou diretamente em um emulador/dispositivo
npm run android  # Android
npm run ios      # iOS (apenas macOS)
```

### 4. Testar no Dispositivo

1. Abra o app **Expo Go** no seu celular
2. Escaneie o QR code que aparece no terminal
3. O app será carregado no seu dispositivo! 🎉

---

## 📂 Estrutura do Projeto

```
mobile/
├── App.tsx                 # Componente raiz
├── app.json               # Configuração do Expo
├── package.json           # Dependências
├── services/
│   └── supabaseClient.ts  # Cliente Supabase configurado
└── src/                   # Código fonte (criar conforme necessário)
    ├── screens/          # Telas do app
    ├── components/       # Componentes reutilizáveis
    ├── types/           # TypeScript types
    └── constants/       # Constantes e configs
```

---

## 🔧 Próximos Passos

### Implementar Telas
- [ ] Tela de Login/Signup
- [ ] Home (listagem de produtos)
- [ ] Busca inteligente
- [ ] Detalhes do produto
- [ ] Carrinho
- [ ] Perfil do usuário

### Integração Backend
- [ ] Autenticação com Supabase
- [ ] CRUD de produtos
- [ ] Sistema de busca
- [ ] Integração com IA (via backend seguro)

### Navegação
Recomendado instalar:
```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

### UI Components
Opções recomendadas:
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [NativeBase](https://nativebase.io/)
- [Tamagui](https://tamagui.dev/)

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**

- ✅ Use apenas a chave `ANON` no app mobile
- ❌ **NUNCA** coloque a chave `service_role` no código
- 🛡️ Chamadas para Gemini AI devem ser feitas via backend seguro (Supabase Edge Functions ou Cloud Functions)
- 🔒 Nunca commite o arquivo `.env` no Git

---

## 📦 Build para Produção

### Usando EAS Build (recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar projeto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

### Build Local (alternativa)

```bash
# Android
npm run android --variant=release

# iOS (requer macOS + Xcode)
npm run ios --configuration Release
```

---

## 🐛 Troubleshooting

### Erro: "Supabase environment variables missing"
- Verifique se o arquivo `.env` existe em `mobile/`
- Confirme que as variáveis começam com `EXPO_PUBLIC_`

### App não carrega no Expo Go
- Certifique-se de estar na mesma rede WiFi
- Tente reiniciar com `npm start --clear`

### Erro de polyfill
- Certifique-se de que `react-native-get-random-values` é importado no topo do `App.tsx`

---

## 📚 Documentação

- [Expo Docs](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase Client](https://supabase.com/docs/reference/javascript/installing)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit suas mudanças: `git commit -m 'Add nova feature'`
3. Push para a branch: `git push origin feature/nova-feature`
4. Abra um Pull Request

---

**Desenvolvido com ❤️ usando Expo + React Native**
