# 📱 AutoPeças IA - Mobile App (Expo)

Aplicativo mobile para iOS e Android construído com React Native + Expo SDK 54.

## 🎯 Versões

- ✅ **Expo SDK:** 54.0.0
- ✅ **React Native:** 0.76.6
- ✅ **React:** 18.3.1 (compatível com RN)

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Expo Go app instalado no celular ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Instalação

```bash
cd mobile
npm install
```

**⚠️ IMPORTANTE:** Se der erro de peer dependencies:

```bash
npm install --legacy-peer-deps
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

## 🐛 Troubleshooting

### ❌ Erro: "TurboModuleRegistry...PlatformConstants"

**Solução:**
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### ❌ Erro: "peer dependencies React 19"

**Causa:** React Native 0.76 não suporta React 19 ainda.

**Solução:** Este PR já corrige para React 18.3.1

### ❌ App não carrega no Expo Go

**Verificar:**
1. Mesmo WiFi no PC e celular?
2. Firewall bloqueando porta 8081?
3. Tentar: `npm start -- --tunnel`

### ❌ "Supabase não conectado"

1. Verificar se `.env` existe em `mobile/`
2. Confirmar que as chaves estão corretas
3. Testar URL no navegador: `https://seu-projeto.supabase.co`

---

## 📦 Dependências Principais

```json
{
  "expo": "~54.0.0",                    // Framework principal
  "react": "18.3.1",                     // Compatível com RN 0.76
  "react-native": "0.76.6",              // Engine nativo
  "@supabase/supabase-js": "^2.45.0",   // Cliente Supabase
  "react-native-url-polyfill": "^2.0.0" // Polyfill para fetch
}
```

---

## 🔧 Scripts Úteis

```bash
# Limpar cache
npm start -- --clear

# Modo tunnel (para redes complexas)
npm start -- --tunnel

# Ver logs detalhados
npm start -- --verbose

# Rebuild completo
rm -rf node_modules .expo
npm install
npm start
```

---

## 📂 Estrutura do Projeto

```
mobile/
├── App.tsx                 # Componente raiz
├── app.json               # Configuração do Expo
├── babel.config.js        # Configuração do Babel (obrigatório)
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

## 📱 Próximos Passos

- [ ] Implementar tela de Login
- [ ] Implementar tela Home com produtos
- [ ] Adicionar navegação (React Navigation ou Expo Router)
- [ ] Integrar busca inteligente
- [ ] Implementar carrinho de compras
- [ ] Configurar EAS Build para gerar APK/IPA

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

## 🆘 Suporte

Se continuar com problemas, abra uma issue no repositório ou contate o time de desenvolvimento.

---

## 📚 Documentação

- [Expo Docs](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase Client](https://supabase.com/docs/reference/javascript/installing)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**Desenvolvido com ❤️ usando Expo + React Native**
