import React from 'react';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
// Este es el punto de entrada de la aplicación. Aquí es donde se monta el navegador principal.
export default function App() {
  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}